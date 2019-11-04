const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Inv',
    schema: {
        part: ObjectId,
        qty: Number
    }
})

module.exports = dbModel