const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Tag',
    schema: {
      type: {type: String},
      name: {type: String, required: true}
    },
    indexes: [
        {name: 1,  type: 1},
        {unique: true}
    ]
})

module.exports = dbModel