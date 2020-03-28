const schema = require('../../db/schema/PartQuot'),
    createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
    __ = require('underscore'),
    _ = require('lodash'),
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
                doc = doc.toJSON()
                if(cond.supplier) delete doc.supplier
                else delete doc.part
                return doc
            })
        })
}

const addIn = {
    create: (data, partQuotsId) => {
        let row
        const {supplier, part} = data
        return schema.findOne({supplier, part})
            .then(doc => {
                if(!doc) {
                    if(partQuotsId) {
                        return schema.findById(partQuotsId)
                            .then(doc => {
                                row = doc.quots.push(data)
                                return doc.save()
                            })
                    }
                    else {
                        row = 1
                        return new schema({...data, quots: [{...data}]}).save()
                    } 
                }
                else {
                    row = doc.quots.push({...data})
                    return doc.save()
                }
            })            
            .then(doc => {
                doc = doc.toJSON()
                return {
                    partQuots: doc.id,
                    supplier: doc.supplier,
                    part: doc.part,
                    ...doc.quots[row - 1],
                }
            })
    },

    searchBySupplier: (supplier) => {
        return searchBy({supplier})
    },

    searchByPart: (part) => {
        return searchBy({part})
    },

    listQuotsById: (id) => {
        return schema.findById(id)
            .then(doc => {
                let docs = []
                if(doc) {
                    doc = doc.toJSON()
                    const quots = __.map(doc.quots, (quot) => {
                        return {supplier: doc.supplier, part: doc.part, ...quot}
                    })
                    docs = _.sortBy(quots, 'date')
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

    checkQuotPart: (partId, quotId) => {
        return schema.findOne({quots: {$elemMatch: {_id: quotId}}})
        .then(doc => {
            return doc && doc.part.toString() == partId.toString()
        })
    },

    updateQuot: (id, toUpdate) => {
		return schema.findOne({
			__v: toUpdate.__v,
			quots: {
				$elemMatch: {
					_id: id
				}
			}
		})
		.then(doc => {
			const data = doc.quots.id(id)
			__.each(['date', 'type', 'price', 'ref', 'remark', 'tags'], (key) => {
				if(toUpdate[key]) data[key] = toUpdate[key]
				else data[key] = undefined
			})
			return doc.save()
		})
    },
    
    removeQuot: (quotId) => {
		return schema.findOne({
			quots: {
				$elemMatch: {
					_id: quotId
				}
			}
		})
		.then(doc => {
            if(doc.quots.length > 1) {
                doc.quots.id(quotId).remove()
			    return doc.save()
            }
			return schema.findByIdAndDelete(doc.id)
		})
    },
    
    ifMatchQuot: (quotId, version) => {
        return entity.ifMatch({
			quots: {
				$elemMatch: {
					_id: quotId
				}
			}
		}, version)
    }
}

const entity = createEntity(config, addIn)
module.exports = entity
