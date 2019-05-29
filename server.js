let Koa = require('koa');
let router = require('koa-router')();
let static = require('koa-static');
let path = require('path')
let crypto = require('crypto');
let config = require('./config');
let dbConfig = require('./database/config');
let request = require('request');
let dbm = require('./database/db.js');
let myrouter = require('./router/router.js');
const bodyParser = require('koa-bodyparser');

// 使用ctx.body解析中间件
const app = new Koa();

staticPath = './static';

let md5 = crypto.createHash('md5');
//let md5Result = md5.update('content').digest('hex');

let APP_ID = 'wx3a51bb26a21f32dd';
let APP_SECRET = '251316c39ceb5d186ad63c3fa88d0fa0';
let session = new Map(); //存储的是{openid(给用户): session key(后台)}的映射
let AccessToken = '';

cookieConfig = {
    domain: 'tony-space.top', // 写cookie所在的域名
    path: '/', // 写cookie所在的路径
    maxAge: 10 * 60 * 1000, // cookie有效时长
    expires: new Date(86400000 + (new Date()).valueOf()), // cookie失效时间
    httpOnly: false, // 是否只用于http请求中获取
    overwrite: false // 是否允许重写
};

function getWXUserInfo(jsCode) {
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${jsCode}&grant_type=authorization_code`;
    return new Promise((resolve, reject) => {
        request(url, {
            json: true
        }, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}
//app.use(static(path.join(__dirname, staticPath)))

app.use(bodyParser())

app.use(async (ctx, next) => {
    console.log(`Process: ${ctx.request.method} ${ctx.request.url}`);
    await next();
});

app.use(async (ctx, next) => { //登陆操作
    let result;
    if (ctx.path === '/login' && ctx.method === 'GET') {
        //console.log(ctx.query['code'])
        if (ctx.query['code']) {
            result = await getWXUserInfo(ctx.query['code']);
        }
        if (!result['openid']) {
            //console.log('get user id error');
            ctx.body = 'get user info error';
        } else {
            //console.log(result);
            let openId = result['openid'];
<<<<<<< HEAD
            session.set(openId, result['session_key'])
            let userInfo = dbm.getUser(openId);
            if (userInfo) {
                dbm.updateUser(openId, {
                    'last_login': (new Date()).toString()
                })
            } else {
                dbm.updateUser(openId, {
                    'user_id': openId,
                    'name': openId,
                    'last_login': (new Date()).toString(),
                    'sign_up_time': (new Date()).toString(),
                    'scholl': 'null',
                    'grade': 'unknown',
                    'week': 'unknown',
                    'user_class': 'normal'
                })
            }
=======
            session.set(openId, result['session_key']);
>>>>>>> 45f6ef7ee84f196436dbf704d080d32e6fad9a56
            ctx.body = `{"session_id": "${openId}"}`;
            ctx.type = 'application/json';
        }
    } else {
        await next();
    }
});

function getAccessToken(callback) {
    let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
        request(url, {
            json: true
        }, callback);
    }

<<<<<<< HEAD
function setAccessToken(err, res, body) {
    AccessToken = body['access_token'];
}

function initAccessTokenRefresh() {
    setInterval(function () {
        getAccessToken(setAccessToken);
    }, 1000000)
}

function sendMsg(jsonData) {
    let sendUrl = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token='+AccessToken;
    request({
        url: sendUrl,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: jsonData
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //
        }
    }); 
}

async function initMesg() {
    setInterval( async function () {
        let reminders = dbm.getAllReminder();
        for (let reminder of reminders) {
            let date = reminder['remind_date'];
            let time = reminder['remind_time']
            let datetime = +new Date(date + ' ' + time);
            let now = +new Date();
            let timeDiff = now - datetime;
            if (Math.abs(timeDiff) < 60000) {
                let userInfo = await dbm.getUser(reminder['user_id']);
                if (!userInfo['formid']) {
                    continue;
                }
                let formList = userInfo['formid'].split(';')
                let singleFormId = formList.slice([formList.length-1]);
                let newFormStr = formList.join(';');
                await dbm.updateUser(reminder['user_id'], {'formid': newFormStr});
                let msgData = {
                    "touser": reminder['user_id'],
                    "weapp_template_msg": {
                        "template_id": "pW7GrpIGahWe113gA0Z6ax0T4tcKtmnlVeMDfJ3D2Og",
                        "page": "page/page/index",
                        "form_id": singleFormId,
                        "data": {
                            "keyword1": {
                                "value": reminder['type']
                            },
                            "keyword2": {
                                "value": reminder['remind_date'] + ' ' + reminder['remind_time']
                            },
                            "keyword3": {
                                "value": reminder['content']
                            },
                            "keyword4": {
                                "value": reminder['mark']
                            },
                            "keyword5": {
                                "value": '任务提醒'
                            }
                        },
                        "emphasis_keyword": "keyword1.DATA"
                    }
                }
                let jsonMsg = JSON.stringify(msgData);
                sendMsg(jsonMsg);
                dbm.removeReminder(reminder['uniqueid']);
            }
        }
        let remindData = ctx.request.body;
        //console.log(remindData);
        if (remindData['uid']) {
            dbm.removeReminder(remindData['uid']);
            ctx.response.status = 200;
        } else {
            ctx.response.status = 400;
        }
        ctx.response.status = 200;
    }, 30000)
}
=======
router.get('/query/:dataName', async (ctx, next) => {
    let client = await dbm.getDB();
    let dbo = client.db(dbConfig.dbName);
    let result = await dbm.queryDB(dbo, 'visualDataSet', {
        'title': ctx.params.dataName
    });
    client.close();
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(result);
});
>>>>>>> 45f6ef7ee84f196436dbf704d080d32e6fad9a56

initAccessTokenRefresh();

initMesg();

app.use(myrouter.routes());

app.listen(config.webport);
console.log(`server is listening on port ${config.webport}`);