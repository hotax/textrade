const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    quot = require('./ProductSupplierQuot')

const productSupplier = createSchema({
    supplier: ObjectId,
    code: String,
    name: String,
    quots: [quot]
})
module.exports = productSupplier