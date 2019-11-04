const schema = require('../../../db/schema/bas/Supplier'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    dbSave = require('../../../finelets/db/mongoDb/saveNotExist')

const config = {
    schema,
    updatables:['type', 'code', 'name', 'address', 'account', 'link', 'tags'],
    searchables: ['name', 'tags', 'code', 'address']
}

const obj = {
    createNotExist: (data) => {
        if (!data.name) return Promise.reject('supplier name is required')
        return dbSave(schema, ['name'], data)
    }
}

module.exports = createEntity(config, obj)