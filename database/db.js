let MongoClient = require('mongodb').MongoClient;
let config = require('./config')

module.exports = {
    getDB() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(config.host, {
                useNewUrlParser: true
            }, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(client);
                }
            })
        })
    },
    insertDB(db, collection, obj) {
        return new Promise((resolve, reject) => {
            db.collection(collection).insertOne(obj, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        })
    },
    queryDB(db, collection, queryObj) {
        return new Promise((resolve, reject) => {
            db.collection(collection).find(queryObj).toArray((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    }
}