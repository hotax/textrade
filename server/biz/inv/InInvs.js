const schema = require('../../../db/schema/inv/InInv'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave'),
    logger = require('@finelets/hyper-rest/app/Logger');

const inInvs = {
    create: (data) => {
        return schema.findOne({
                source: data.source
            })
            .then((doc) => {
                if (doc) {
                    return Promise.reject('InInv: Source ' + data.source + ' is duplicated')
                }
                return dbSave(schema, data)
            })
            .then((doc) => {
                logger.debug('Publish poInInv message:\r\n' + JSON.stringify(doc, null, 2))
                let publish = require('../../CrossMessageCenter').poInInv
                publish(doc)
                return doc
            })
    }
}

module.exports = inInvs