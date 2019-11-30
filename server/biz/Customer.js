const schema = require('../../db/schema/Customer'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore')

const config = {
	schema,
	projection: {
		contacts: 0,
		quots: 0
	},
	updatables: ['code', 'name', 'address', 'link', 'creator', 'tags'],
	searchables: ['code', 'name', 'address', 'tags']
}

const QUERY_TYPE_SUPPLIER_QUOTS = 'supplierQuots',
	QUERY_TYPE_PRODUCT_QUOTS = 'productQuots'

const searchQuotsMap = {
	productQuots: (cond => {
		const quots = []
		return schema.find({
				"quots.items.product": cond.product
			})
			.then(docs => {
				__.each(docs, doc => {
					doc = doc.toJSON()
					__.each(doc.quots, q => {
						__.each(q.items, item => {
							if (item.product === cond.product) {
								let product = __.find(quots, qt => {
									return qt.customer === doc.id && qt.supplier === item.supplier
								})
								if (!product) {
									product = {
										customer: doc.id,
										supplier: item.supplier,
										quots: []
									}
									quots.push(product)
								}
								let quot = __.find(product.quots, pq => {
									return pq.id === q.id
								})
								if (!quot) {
									quot = {
										id: q.id,
										requirement: q.requirement,
										date: q.date,
										creator: q.creator,
										quot: {
											id: item.id,
											price: item.price,
											remark: item.remark,
											date: item.date
										}
									}
									product.quots.push(quot)
								}
							}
						})
					})
				})
				return quots
			})
			.catch(e => {
				return quots
			})
	}),
	supplierQuots: (cond => {
		const quots = []
		return schema.find({
				"quots.items.supplier": cond.supplier
			})
			.then(docs => {
				__.each(docs, doc => {
					doc = doc.toJSON()
					__.each(doc.quots, q => {
						__.each(q.items, item => {
							if (item.supplier === cond.supplier) {
								let product = __.find(quots, qt => {
									return qt.product === item.product
								})
								if (!product) {
									product = {
										product: item.product,
										customers: []
									}
									quots.push(product)
								}
								let customer = __.find(product.customers, cust => {
									return cust.customer === doc.id
								})
								if (!customer) {
									customer = {
										customer: doc.id,
										quots: []
									}
									product.customers.push(customer)
								}
								customer.quots.push({
									id: item.id,
									date: item.date,
									price: item.price,
									remark: item.remark,
									quot: q.id
								})
							}
						})
					})
				})
				return quots
			})
			.catch(e => {
				return quots
			})
	})
}
const addIn = {
	constDef: {
		QUERY_TYPE_SUPPLIER_QUOTS,
		QUERY_TYPE_PRODUCT_QUOTS
	},
	quot: quot => {
		let row
		return schema.findById(quot.customer)
			.then(doc => {
				if (!doc) return Promise.reject()
				if (!quot.date) quot.date = new Date()
				row = doc.quots.push(quot)
				return doc.save()
			})
			.then(data => {
				if (data) {
					data = data.toJSON()
					const doc = {
						...data.quots[row - 1],
						customer: data.id
					}
					return doc
				}
			})
	},

	searchQuots: (cond, text) => {
		const search = searchQuotsMap[cond.type]
		if (!search) return Promise.resolve([])
		return search(cond, text)
			.catch(e => {
				return []
			})
	},

	findQuotById: (customer, id) => {
		return schema.findById(customer)
			.then(doc => {
				if(!doc) return
				let quot = doc.quots.id(id)
				if(!quot) return
				quot = quot.toJSON()
				return {customer: doc.id, ...quot, __v: doc.__v, updatedAt: doc.updatedAt.toJSON()}
			})
	}
}


module.exports = createEntity(config, addIn)