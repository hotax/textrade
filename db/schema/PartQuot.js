const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId

const quotSchema = createSchema({
    date: {type: Date, default: new Date()},
    type: {
        type: String,
        default: 'inquery',
        enum: ['inquery', 'offer', 'transaction']
    },
    price: String,
    ref: ObjectId,
    remark: String,
    tags: String,
    creator: ObjectId 
})

const partQuotSchema = createCollection({
    name: 'PartQuot',
    schema: {
        supplier: {type: ObjectId, required: true},
        part: {type: ObjectId, required: true},
        quots: [quotSchema]
    },
    indexes: [
        {
            index: {supplier: 1, part: 1},
            options: {unique: true}
        }
    ]
})

module.exports = partQuotSchema