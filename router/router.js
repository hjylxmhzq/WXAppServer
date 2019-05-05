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
      //console.log(remindData);
      dbm.updateReminder(openId, {
          'type': 'course' in remindData ? 'class' : 'event',
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

router.post('/getreminder', async (ctx, next) => {
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

module.exports = router