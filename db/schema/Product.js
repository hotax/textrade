const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      createCollection = require('@finelets/hyper-rest/db/mongoDb/CreateCollection'),
      createSchema = require('@finelets/hyper-rest/db/mongoDb/CreateSchema'),
      productSupplierSchema = require('./ProductSupplier')

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
      suppliers: [productSupplierSchema]
    }
})

module.exports = dbModel