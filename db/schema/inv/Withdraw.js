const mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

function preSave (next) {
    if(this.isNew && this.qty === 0) return next(new Error('The qty of withdraw can be 0!'))
    next()
}

const dbModel = createCollection({
    name: 'Withdraw',
    schema: {
        code: {
            type: String,
            required: true
        },
        part: {
            type: ObjectId,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        actor: {
            type: ObjectId,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        remark: String
    },
    indexes: [
        {
            index: {code: 1},
            options: {unique: true}
        }
    ],
    pres: { save: preSave}
})

module.exports = dbModel
