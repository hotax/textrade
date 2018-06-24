const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    transformOption = require("@finelets/hyper-rest/db/mongoDb/DocTransformOption");

const YarnValueSchema = new Schema({
    value: [Number],
    unit: String
}, transformOption);

const YarnSchema = new Schema({
    warp: YarnValueSchema,
    weft: YarnValueSchema
}, transformOption);

const SpecificationSchema = new Schema({
    code: String, //编码
    name: String, //名称
    desc: String,
    constructure: String,
    grey: {
        yarn: YarnSchema,
        dnsty: YarnSchema,
        width: Number,
        GSM: Number
    },
    product: {
        yarn: YarnSchema,
        dnstyBW: YarnSchema,
        dnstyAW: YarnSchema,
        width: Number,
        GSM: Number
    },
    //state: {type: Number, enum: ['draft', 'published', 'expired']},
    //author: ObjectId,
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
}, transformOption);

module.exports = mongoose.model('Specification', SpecificationSchema);