const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
      createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema')

const YarnSchema = createSchema({
  warp: [Number],
  weft: [Number],
  other: [Number]
})

const dbModel = createCollection({
    name: 'Product',
    schema: {
      code: {type: String, required: true, unique: true, index: true},
      name: String,
      desc: String,
      content: String,
      constructure: String,
      yarnUnit: String,
      yarn: YarnSchema,
      dnstyUnit: String,
      grey: {
        dnsty: YarnSchema,
        width: Number,
        GSM: Number
      },
      product: {
        dnstyBW: YarnSchema,
        dnstyAW: YarnSchema,
        width: Number,
        GSM: Number
      },
      state: {type: String, enum: ['draft', 'published', 'expired']},
      author: ObjectId,
      tags: String
    }
})

module.exports = dbModel