const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection')

const dbModel = createCollection({
    name: 'Part',
    schema: {
      code: String,
      type: {type: String, enum: ['material', 'process'], default: 'material'},
      name: {type: String, required: true},
      creator: ObjectId,
      tags: String
    }
})

module.exports = dbModel