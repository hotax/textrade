const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'OutInv',
    schema: {
        part: ObjectId,
        qty: Number,
        user: ObjectId,
        date: Date,
        project: String,
        source: {
            type: String,
            unique: true
        }
    }
})

module.exports = dbModel