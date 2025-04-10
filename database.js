'use strict';

var mongoose = require('mongoose');
var config = require('./config');

const mongoUri = config.db;
const mongoConfig = {
    useCreateIndex: true,
    useNewUrlParser: true,
    poolSize: 2,
    promiseLibrary: global.Promise
};

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
connect()

function connect() {
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log('db successfully connected')
    });
}
