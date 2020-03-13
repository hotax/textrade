const schema = require('../../db/schema/Product'),
	entity = require('./Product'),
	__ = require('underscore')

const quot = {
	create: (data) => {
		let row
		return schema.findById(data.product)
			.then(doc => {
				if(!doc || !data.supplier) return Promise.reject()
				row = doc.supplyingQuots.push(data)
				return doc.save()
			})
			.then(doc => {
				doc = doc.toJSON()
				const rtn = {...doc.supplyingQuots[row - 1], product: doc.id}
				return rtn
			})
	}
}

module.exports = quot