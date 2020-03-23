const schema = require('../../db/schema/PartQuot'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    __ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger')

const config = {
	schema,
    updatables: ['code', 'name', 'address', 'account', 'link', 'creator', 'contacts', 'tags'],
    searchables: ['code', 'name', 'address', 'tags']
}

const searchBy = (cond) => {
    return schema.find(cond, ['supplier', 'part'])
        .then(docs => {
            return __.map(docs, (doc) => {
                return doc.toJSON()
            })
        })
}

const addIn = {
    createSupplierPart: (data) => {
        return new schema(data).save()
            .then(doc => {
                doc = doc.toJSON()
                return {id: doc.id, supplier: doc.supplier, part: doc.part}
            })
    },

    create: (data) => {
        let row
        const {supplier, part} = data
        return schema.findOne({supplier, part})
            .then(doc => {
                if(!doc) {
                    row = 1
                    return new schema({...data, quots: [{...data}]}).save()
                }
                else {
                    row = doc.quots.push({...data})
                    return doc.save()
                }
            })            
            .then(doc => {
                doc = doc.toJSON()
                const {__v, createdAt, updatedAt} = doc
                return {
                    partQuots: doc.id,
                    supplier: doc.supplier,
                    part: doc.part,
                    ...doc.quots[row - 1],
                    __v, createdAt, updatedAt
                }
            })
    },

    searchBySupplier: (supplier) => {
        return searchBy({supplier})
    },

    searchByPart: (part) => {
        return searchBy({part})
    },

    listQuots: (supplier, part) => {
        return schema.findOne({supplier, part})
            .then(doc => {
                let docs = []
                if(doc) {
                    doc = doc.toJSON()
                    docs = __.map(doc.quots, (quot) => {
                        return {supplier: doc.supplier, part: doc.part, ...quot}
                    })
                }
                return docs
            })
    },

    listQuotsById: (id) => {
        return schema.findById(id)
            .then(doc => {
                let docs = []
                if(doc) {
                    doc = doc.toJSON()
                    docs = __.map(doc.quots, (quot) => {
                        return {supplier: doc.supplier, part: doc.part, ...quot}
                    })
                }
                return docs
            })
    },

    findQuotById: (subid) => {
        return schema.findOne({quots: {$elemMatch: {_id: subid}}})
            .then(doc => {
                if(!doc) return
                const quot = doc.quots.id(subid).toJSON()
                doc = doc.toJSON()
                delete doc.quots
                return {partQuots: doc.id, ...doc, ...quot}
            })
    },

    findSupplierPart: (supplier, part) => {
        return schema.findOne({supplier, part}, ['-quots'])
            .then(doc => {
                return doc ? doc.toJSON() : doc
            })
    }
}

const entity = createEntity(config, addIn)
module.exports = entity
