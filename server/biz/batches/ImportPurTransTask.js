const dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'),
    schema = require('../../../db/schema/PurTransTask'),
    extract = require('../BizDataExtractors').importPurTransTask,
    __ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger');

module.exports = {
    create: (doc) => {
        let obj;
        try {
            obj = extract(doc)
        } catch (err) {
            logger.error('extract Object error: \r\n' + JSON.stringify(err, null, 2))
            return Promise.reject(err)
        }
        obj = Object.assign({}, {
            transNo: obj.transNo,
            task: obj
        })
        logger.debug('Create import purchase transaction task: \r\n' + JSON.stringify(obj))
        return schema.findOne({
                transNo: obj.transNo
            })
            .then((doc) => {
                if (doc) {
                    return doc
                }
                return dbSave(schema, obj)
                    .then((doc) => {
                        logger.debug('Publish importPurTransTaskCreated message:\r\n' + JSON.stringify(doc, null, 2))
                        let publish = require('../../CrossMessageCenter').importPurTransTaskCreated
                        publish(doc)
                        return doc
                    })
            })

    },

    findById: function (id) {
        return schema.findById(id)
            .then((data) => {
                return data
            })
    },

    find: function (condi) {
        return schema.find(condi).sort({transNo:1})
            .then((docs) => {
                return __.map(docs, function (doc) {
                    return doc.toJSON();
                })
            })
    },

    updateState: (id, states) => {
        return schema.findById(id)
            .then((doc) => {
                if (states.purchase) doc.po = states.purchase
                if (states.review) doc.review = states.review
                if (states.inInv) doc.inInv = states.inInv
                if (states.outInv) doc.outInv = states.outInv
                return doc.save()
            })
            .then((doc) => {
                logger.debug('Purchase trans task state:\r\n' + JSON.stringify(doc, null, 2))
                return doc.toJSON()
            })
    }
}