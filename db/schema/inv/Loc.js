const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Loc',
    schema: {
        loc: String,
        part: ObjectId,
        date: Date,
        qty: Number,
    }
})

module.exports = dbModel