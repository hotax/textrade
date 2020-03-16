const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId

const quotSchema = createSchema({
    date: Date,
    type: {
        type: String,
        default: 'inquery',
        enum: ['inquery', 'offer', 'transaction']
    },
    price: Number,
    ref: ObjectId,
    remark: String,
    tags: String 
})

const partQuotSchema = createCollection({
    name: 'PartQuot',
    schema: {
        supplier: {type: ObjectId, required: true},
        part: {type: ObjectId, required: true},
        quots: [quotSchema]
    }
})

module.exports = partQuotSchema