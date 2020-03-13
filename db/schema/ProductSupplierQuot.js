const createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId

const quotItem = createSchema({
    date: Date,
    type: {
        type: String,
        default: 'enquery',
        enum: ['enquery', 'offer', 'transaction']
    },
    price: {type: Number, required:true},
    ref: ObjectId,
    remark: String
})

module.exports = quotItem