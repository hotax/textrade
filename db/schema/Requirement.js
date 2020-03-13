const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId

const req = createSchema({
    requirement: String,
    date: Date,
    creator: ObjectId
})
module.exports = req