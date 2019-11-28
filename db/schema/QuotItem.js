const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId

const quotItem = createSchema({
    product: ObjectId,
    supplier: ObjectId,
    price: Number,
    remark: String,
    date: Date
})

module.exports = quotItem