const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId,
  transformOption = require('@finelets/hyper-rest/db/mongoDb/DocTransformOption')

const YarnSchema = new Schema({
    warp: [Number],
    weft: [Number]
  },
  transformOption
)

const SpecificationSchema = new Schema({
    code: {
      type: String,
      required: true
    },
    name: String,
    desc: String,
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
    // state: {type: Number, enum: ['draft', 'published', 'expired']},
    // author: ObjectId,
    createDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    modifiedDate: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  transformOption
)

module.exports = mongoose.model('Specification', SpecificationSchema)