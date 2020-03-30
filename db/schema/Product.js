const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
      createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema')

const chainPartQuotSchema = createSchema({
    quot: {type: ObjectId, required: true}
})

const chainPartSchema = createSchema({
    part: {type: ObjectId, required: true},
    quots: [chainPartQuotSchema],
    price: String,
    remark: String
})

const chainSchema = createSchema({
    date: {type: Date, default: new Date()},
    desc: String,
    parts: [chainPartSchema],
    customerRequirement: ObjectId,
    qty: Number,
    creator: ObjectId,
    tags: String
})

const SpecSchema = createSchema({
  width: String,  // 门幅
  dnsty: String,  // 密度
  GSM: Number,    // 克重
})

const dbModel = createCollection({
    name: 'Product',
    schema: {
      code: {type: String, required: true, unique: true, index: true},
      desc: String,
      content: String, // 成分
      constructure: String, // 组织
      yarn: String,   // 纱支
      spec: SpecSchema,  // 规格
      grey: SpecSchema,  // 坯布
      remark: String,
      state: {type: String, enum: ['draft', 'published', 'expired']},
      creator: ObjectId,
      tags: String,
      chains: [chainSchema]
    }
})

module.exports = dbModel