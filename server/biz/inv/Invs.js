const invSchema = require('../../../db/schema/inv/Inv'),
    PO = require('../pur/Purchases'),
    logger = require('@finelets/hyper-rest/app/Logger'),
    dbSave = require('../../../finelets/db/mongoDb/dbSave');

module.exports = {
    inInv: (doc) => {
        return PO.poInInv(doc.parent, doc.data.qty)
            .then(() => {
                logger.debug('Inventory qty is updated by InInv !!!')
                return true
            })
    }
}