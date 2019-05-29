let Router = require('koa-router');
let mime = require('mime')
let router = Router();
let dbm = require('../database/db.js');

staticPath = '../../static'


router.post('/addreminder', async (ctx, next) => {
    console.log(ctx.cookies.get('app:sess'))
    if (!ctx.cookies.get('app:sess')) {
        ctx.response.status = 200;
        ctx.body = 'you have not login';
    } else {
        let openId = ctx.cookies.get('app:sess')
        ctx.response.status = 201;
        let remindData = ctx.request.body;
        console.log('addremind', remindData);
        dbm.updateReminder(openId, {
            'type': 'course' in remindData ? remindData['course'] : '',
            'content': remindData.content,
            'mark': remindData.mark,
            'set_time': +new Date(),
            'remind_date': remindData.date,
            'remind_time': remindData.time,
            'uniqueid': Math.random().toString(36).substr(2)
        });
        ctx.response.status = 201;
        ctx.body = 'reminder created';
        await next();
    }
});

router.get('/getreminder', async (ctx, next) => {
    console.log(ctx.cookies.get('app:sess'))
    if (!ctx.cookies.get('app:sess')) {
        ctx.response.status = 202;
        ctx.body = 'you have not login';
    } else {
        let openId = ctx.cookies.get('app:sess')
        ctx.response.status = 200;
        let result = await dbm.getReminder(openId);
        //console.log(result);
        result = JSON.stringify(result);
        //console.log(result);
        ctx.body = result;
        ctx.response.status = 200;
        await next();
    }
});

router.post('/addclass', async (ctx, next) => {
    console.log(ctx.cookies.get('app:sess'))
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 201;
    let remindData = ctx.request.body;
    //console.log(remindData);

    dbm.updateClass(openId, {
        'coursename': remindData['course'],
        'mark': remindData['mark'],
        'set_time': +new Date(),
        'place': remindData['place'],
        'teacher': remindData['teacher'],
        'week': remindData['week'],
        'time': remindData['time'],
        'day': remindData['day'],
        'uniqueid': Math.random().toString(36).substr(2)
    });
    ctx.response.status = 201;
    ctx.body = 'reminder created';
    await next();

});

router.get('/getclass', async (ctx, next) => {
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 200;
    let result = await dbm.getClass(openId);
    //console.log(result);
    result = JSON.stringify(result);
    //console.log(result);
    ctx.body = result;
    ctx.response.status = 200;
    await next();
});

router.post('/setnowweek', async (ctx, next) => {
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 200;
    let remindData = ctx.request.body;
    //console.log(remindData);
    if (remindData['nowweek']) {
        dbm.updateUser(openId, {
            'related_time': +new Date(),
            'related_week': parseInt(remindData.nowweek)
        });
    } else {
        ctx.response.status = 400;
    }

    await next();
});

router.get('/getnowweek', async (ctx, next) => {
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 200;
    let result = await dbm.getUser(openId);
    result = result[0]
    //console.log(result);
    if (!result['related_time']) {
        ctx.body = 'no related info';
        ctx.response.status = 204;
    } else {
        let now = +new Date();
        let related_time = result['related_time']
        let nowweek = Math.floor((now - related_time) / 604800) + result['related_week'];
        //console.log(result);
        let resp = { nowweek };
        ctx.body = JSON.stringify(resp);
        ctx.response.status = 200;
        await next();
    }

});

router.post('/setuserinfo', async (ctx, next) => {
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 200;
    let remindData = ctx.request.body;
    //console.log(remindData);
    dbm.updateUser(openId, {
        'courseperday': remindData.classcount,
        'weekperterm': remindData.weekcount
    });
    ctx.response.status = 200;
    await next();
});

router.post('/removereminder', async (ctx, next) => {
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 200;
    let remindData = ctx.request.body;
    //console.log(remindData);
    if (remindData['uid']) {
        dbm.removeReminder(remindData['uid']);
        ctx.response.status = 200;
    } else {
        ctx.response.status = 400;
    }
    ctx.response.status = 200;
    await next();
});

router.post('/removeclass', async (ctx, next) => {
    let openId = ctx.cookies.get('app:sess')
    ctx.response.status = 200;
    let remindData = ctx.request.body;
    //console.log(remindData);
    if (remindData['uid']) {
        dbm.removeClass(remindData['uid']);
        ctx.response.status = 200;
    } else {
        ctx.response.status = 400;
    }
    await next();
});

router.get('/setformid', async (ctx, next) => {
    console.log(ctx.cookies.get('app:sess'))
    let openId = ctx.cookies.get('app:sess')
    let id = ctx.query['id'] || '';
    if (id) {
        let result = await dbm.getUser(openId);
        result = result[0];
        console.log(result);
        let formid = result['formid'] || '';
        formid = formid+';'+id;
        formid = formid.split(';').filter(function(item) {
            if (item.length > 0) {
                return true;
            } else {
                return false;
            }
        }).join(';');
        await dbm.updateUser(openId, {'formid': formid});
        ctx.response.status = 200;
    } else {
        ctx.response.status = 404;
    }

    await next();
});


module.exports = router