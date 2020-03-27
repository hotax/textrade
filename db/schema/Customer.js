const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema')

const contactSchema = createSchema({
    name: {type: String, required: true},
    phone: String,
    email: String
})

const requirementSchema = createSchema({
    requirement: {type: String, required: true},
    date: {type: Date, default: new Date()},
    creator: ObjectId
})

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
        contacts: [contactSchema]
    }
})

module.exports = dbModel