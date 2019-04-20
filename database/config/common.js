let HostName = {
    'development': 'tony-space.top:27018',
    'production': 'localhost:27018'
}

let config = {
    host: `mongodb://admin:123456ab*!@${HostName[process.env.NODE_ENV]}/WXAppData?authSource=admin`,
    dbName: 'WXAppData',
};

module.exports = config;