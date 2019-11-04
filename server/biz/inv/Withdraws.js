const schema = require('../../../db/schema/inv/Withdraw'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    publishMsg = require('../../PublishMsg')

const config = {
    schema,
    searchables:['code', 'remark']
}

const addins = {
    create(data) {
        return new schema(data).save()
            .then(doc => {
                msg = doc.toJSON()
                publishMsg('outInv', msg)
                return msg
            })
    }
}

module.exports = createEntity(config, addins)