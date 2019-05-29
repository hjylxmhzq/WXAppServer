let MongoClient = require('mongodb').MongoClient;
let config = require('./config')

module.exports = {
    client: null,
    getDB() {
        
        return new Promise((resolve, reject) => {
            MongoClient.connect(config.host, {
                useNewUrlParser: true
            }, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    this.client = client;
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
    updateDB(db, collection, query, update) {
        return new Promise((resolve, reject) => {
            db.collection(collection).updateOne(
                query,
                update,
                {
                    upsert: true,
                    multi: false
                }
            )
        })
    },
    removeDB(db, collection, query) {
        return new Promise((resolve, reject) => {
            db.collection(collection).deleteOne(
                query
            )
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
    },
    async updateUser(userId, content) {
        let client = await this.getDB();
        this.updateDB(client.db(config.dbName), 'user', {"user_id": userId}, {$set: content});
    },
    async getUser(userId) {
        let client = await this.getDB();
        let result = await this.queryDB(client.db(config.dbName), 'user', {"user_id": userId});
        return result;
    },
    async updateReminder(userId, content) {
        let client = await this.getDB();
        this.insertDB(client.db(config.dbName), 'reminder', {"user_id": userId, ...content});
    },
    async updateClass(userId, content) {
        let client = await this.getDB();
        this.insertDB(client.db(config.dbName), 'class', {"user_id": userId, ...content});
    },
    async getReminder(userId) {
        let client = await this.getDB();
        let result = await this.queryDB(client.db(config.dbName), 'reminder', {"user_id": userId});
        return result;
    },
    async getAllReminder() {
        let client = await this.getDB();
        let result = await this.queryDB(client.db(config.dbName), 'reminder', {});
        return result;
    },
    async getClass(userId) {
        let client = await this.getDB();
        let result = await this.queryDB(client.db(config.dbName), 'class', {"user_id": userId});
        return result;
    },
    async removeReminder(uid) {
        let client = await this.getDB();
        await this.removeDB(client.db(config.dbName), 'reminder', {"uniqueid": uid});
    },
    async removeClass(uid) {
        let client = await this.getDB();
        await this.removeDB(client.db(config.dbName), 'class', {"uniqueid": uid});
    }
}