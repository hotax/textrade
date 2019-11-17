const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    contactSchema = require('./Contact')

const dbModel = createCollection({
    name: 'Customer',
    schema: {
        code: {type: String, required: true, unique: true, index: true},
        name: String,
        address: String,
        link: String,
        creator: ObjectId,
        tags: String,
        contacts: [contactSchema]
    }
})

module.exports = dbModel