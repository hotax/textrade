const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    quotItem = require('./QuotItem')

const quot = createSchema({
    requirement: String,
    items: [quotItem],
    date: Date,
    creator: ObjectId
})
module.exports = quot