const schema = require('../../db/schema/Product'),
	entity = require('./Product'),
	__ = require('underscore')

const quot = {
	list: (product) => {
		return entity.listSubs(product, 'suppliers')
			.then(suppliers => {
				return __.map(suppliers || [], item => {
					delete item.quots
					return item
				})
			})
	},

	create: (id, subId, data) => {
		let row, subDoc
		return schema.findById(id)
			.then(doc => {
				subDoc = doc.suppliers.id(subId)
				if (!subDoc) return Promise.reject()
				row = subDoc.quots.push({...data, date: data.date || new Date(), type: data.type || 'enquery'})
				return doc.save()
			})
			.then(doc => {
				doc = doc.toJSON()
				const rtn = {...subDoc.quots[row - 1].toJSON(), product: doc.id, productSupplierId: subDoc.id}
				return rtn
			})
			.catch(e => {
				throw e
			})
	},

	findById: (product, subId) => {
		return schema.findById(product, ['-suppliers.quots'])
			.then(doc => {
				if(doc) {
					const sub = doc.suppliers.id(subId)
					if(sub) {
						return {product: doc.id, ...sub.toJSON(), __v: doc.__v, updatedAt: doc.updatedAt}
					}
				}
			})
	}
}

module.exports = quot