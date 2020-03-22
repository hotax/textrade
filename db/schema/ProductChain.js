const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
mongoose = require('mongoose'),
ObjectId = mongoose.Schema.Types.ObjectId

const chainPartQuotSchema = createSchema({
    quot: {type: ObjectId, required: true}
})

const chainPartSchema = createSchema({
    part: {type: ObjectId, required: true},
    quots: [chainPartQuotSchema],
    price: String,
    remark: String
})

const chainSchema = createSchema({
    date: {type: Date, default: new Date()},
    desc: String,
    parts: [chainPartSchema],
    customerRequirement: ObjectId,
    qty: Number,
    creator: ObjectId,
    tags: String
})

module.exports = chainSchema