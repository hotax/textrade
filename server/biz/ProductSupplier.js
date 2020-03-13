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

	create: (product, data) => {
		let row
		return schema.findById(product)
			.then(doc => {
				if(!doc || !data.supplier || __.find(doc.suppliers, (sd) => {return sd.supplier == data.supplier}))
					return Promise.reject()
				row = doc.suppliers.push(data)
				return doc.save()
			})
			.then(doc => {
				doc = doc.toJSON()
				const rtn = {...doc.suppliers[row - 1], product: doc.id}
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