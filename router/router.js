let Router = require('koa-router');
let mime = require('mime')
let router = Router();

staticPath = '../../static'

router.get('/data/:name', async (ctx, next) => {
    
})

function parseMime( url ) {
    let extName = path.extname( url )
    extName = extName ?  extName.slice(1) : 'unknown'
    return  mimes[ extName ]
  }