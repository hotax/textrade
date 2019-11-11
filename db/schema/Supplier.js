const createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    contactSchema = require('./Contact')

const dbModel = createCollection({
    name: 'Supplier',
    schema: {
        code: {type: String, required: true, unique: true, index: true},
        name: String,
        address: String,
        account: String,
        link: String,
        tags: String,
        contacts: [contactSchema]
    }
})

module.exports = dbModel