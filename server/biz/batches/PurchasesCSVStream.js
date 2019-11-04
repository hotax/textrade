const createStream = require('../../../finelets/streams/CSVStream'),
    parser = require('./PurchaseCsvParser'),
    saver = require('./ImportPurTransTask').create;

const wrapedSaver = (obj) => {
    return saver(obj)
        .catch(() => {
            // do nothing if have error
        })
}

module.exports = () => {
    return createStream(wrapedSaver, parser)
}