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
const bodyParser = require('koa-bodyparser')

// 使用ctx.body解析中间件
const app = new Koa();

staticPath = './static';

let md5 = crypto.createHash('md5');
//let md5Result = md5.update('content').digest('hex');

let APP_ID = 'wx3a51bb26a21f32dd';
let APP_SECRET = '251316c39ceb5d186ad63c3fa88d0fa0';
let session = new Map(); //存储的是{openid(给用户): session key(后台)}的映射

cookieConfig = {
    domain: 'tony-space.top', // 写cookie所在的域名
    path: '/', // 写cookie所在的路径
    maxAge: 10 * 60 * 1000, // cookie有效时长
    expires: new Date(86400000 + (new Date()).valueOf()), // cookie失效时间
    httpOnly: false, // 是否只用于http请求中获取
    overwrite: false // 是否允许重写
}

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
    })
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
            result = await getWXUserInfo(ctx.query['code'])
        }
        if (!result['openid']) {
            //console.log('get user id error');
            ctx.body = 'get user info error';
        } else {
            //console.log(result);
            let openId = result['openid'];
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
            ctx.body = `{"session_id": "${openId}"}`;
            ctx.type = 'application/json';
        }
    } else {
        await next();
    }
})

app.use(myrouter.routes());

app.listen(config.webport);
console.log(`server is listening on port ${config.webport}`)