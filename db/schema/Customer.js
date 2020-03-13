const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    requirementSchema = require('./Requirement'),
    contactSchema = require('./Contact'),
    quotSchema = require('./Quot')

const dbModel = createCollection({
    name: 'Customer',
    schema: {
        code: {type: String, required: true, unique: true, index: true},
        name: String,
        address: String,
        link: String,
        creator: ObjectId,
        tags: String,
        requirements: [requirementSchema],
        contacts: [contactSchema],
        quots: [quotSchema] // TODO: to be removed later
    }
})

module.exports = dbModel