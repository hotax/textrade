const schema = require('../../../db/schema/inv/OutInv'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave'),
    logger = require('@finelets/hyper-rest/app/Logger');

const outInvs = {
    create: (data) => {
        return schema.findOne({
                source: data.source
            })
            .then((doc) => {
                if (doc) {
                    return Promise.reject('OutInv: Source ' + data.source + ' is duplicated')
                }
                return dbSave(schema, data)
            })
            .then((doc) => {
                logger.debug('Publish outInv message:\r\n' + JSON.stringify(doc, null, 2))
                let publish = require('../../CrossMessageCenter').outInv
                publish(doc)
                return doc
            })
    }
}

module.exports = outInvs