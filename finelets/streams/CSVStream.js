const stream = require('stream'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    Promise = require('bluebird'),
    util = require('util');
var __save, __parseRow;

function CSVStream() {
    stream.Writable.call(this);
    this.tailPiece = '';
}
util.inherits(CSVStream, stream.Writable);

CSVStream.prototype._write = function (chunk, encoding, callback) {
    var str = this.tailPiece + chunk.toString();
    var rows = str.split('\r\n');
    this.tailPiece = rows[rows.length - 1];
    var records = [];
    for (i = 0; i < rows.length - 1; i++) {
        try {
            logger.debug('CSVStream to parse the row: ' + rows[i])
            var obj = __parseRow(rows[i]);
            if (obj) {
                logger.debug('CSVStream to save obj: ' + JSON.stringify(obj))
                records.push(__save(obj));
            }
        } catch (err){
            return callback(new Error('Row ' + i + ' data format error'));
        }
    }

    return Promise.all(records)
        .then(function () {
            callback();
        })
        .catch(function (err) {
            callback(err);
        })
}

module.exports = function (save, parseRow) {
    __save = save;
    __parseRow = parseRow;
    return new CSVStream();
}