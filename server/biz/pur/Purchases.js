const schema = require('../../../db/schema/pur/Purchase'),
	part = require('../bas/Parts'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	publishMsg = require('../../PublishMsg'),
	__ = require('underscore'),
	logger = require('@finelets/hyper-rest/app/Logger'),
	dbSave = require('../../../finelets/db/mongoDb/dbSave');

const config = {
	schema,
	projection: '-transactions',
	updatables: ['code', 'part', 'qty', 'price', 'amount', 'supplier', 'refNo', 'remark'],
	searchables: ['code', 'refNo', 'remark']
}

const commit = (id, {__v, actor, date}) => {
	let row
	if (!actor) return Promise.resolve()
	return schema.findById(id)
		.then(doc => {
			if(doc && doc.__v === __v && (doc.state === 'Draft' || doc.state === 'Unapproved')) {
				const appDate = date || new Date()
				doc.state = 'Review'
				doc.applier = actor
				doc.appDate = appDate
				row = doc.transactions.push({type: 'commit', actor, date: appDate})
				return doc.save()
			}
		})
		.then(data => {
			if(data) {
				data = data.toJSON()
				return {parent: data.id, ...data.transactions[row - 1]}
			} 
		})
}

const review = (id, {__v, actor, date, pass, remark}) => {
	if (!actor) return Promise.resolve()
	let  row
	return schema.findById(id)
		.then(doc => {
			if(doc && doc.__v === __v && doc.state === 'Review') {
				const reviewDate = date || new Date()
				doc.state = pass ? 'Open' : 'Unapproved'
				doc.reviewer = actor
				doc.reviewDate = reviewDate
				row = doc.transactions.push({type: 'review', data:{pass: pass ? true : false}, actor, date: reviewDate, remark})
				return doc.save()
			}
		})
		.then(data => {
			if(data) {
				data = data.toJSON()
				return {parent: data.id, ...data.transactions[row - 1]}
			} 
		})
}

const inInv = (id, {__v, actor, date, data, remark}) => {
	if (!actor) return Promise.reject()
	if (!data || !data.qty) return Promise.reject()
	data.qty = data.qty * 1
	let row
	return schema.findById(id)
		.then(doc => {
			if(!doc || doc.__v !== __v || doc.state !== 'Open' || !data.qty) return Promise.reject()
			
			const invDate = date || new Date()
			row = doc.transactions.push({type: 'inv', data, actor, date: invDate, remark})
			return doc.save()
		})
		.then(data => {
			if(data) {
				data = data.toJSON()
				const trans = {parent: data.id, ...data.transactions[row - 1]}
				publishMsg('poInInv', trans)
				return trans
			} 
		})
}

const transactionActions = {commit, review, inv: inInv}

const addIn = {
	findSubDocById: (id, sub, sid) => {
		return schema.findById(id)
		.then(doc => {
			if(doc) {
				let subdoc = doc[sub].id(sid)
				if(subdoc) {
					subdoc = subdoc.toJSON()
					return {parent: doc.id, ...subdoc}
				}
			}
		})
	},

	doTransaction: (id, type, data) => {
		return transactionActions[type](id, data)
	},

	createBySource: (data) => {
		return schema
			.findOne({
				source: data.source
			})
			.then((doc) => {
				if (doc) return doc.toJSON();
				return dbSave(schema, data);
			});
	},

	poInInv: (id, qty) => {
		let po
		return schema.findById(id)
			.then((doc) => {
				if (!doc) return Promise.reject()
				po = doc
				return part.updateInvQty(po.part, qty)
			})
			.then(() => {
				if (!po.left) {
					po.left = po.qty;
				}
				po.left -= qty;
				return po.save()
			})
	},

	getPart: (purId) => {
		return schema.findById(purId).then((data) => {
			return part.findById(data.part);
		});
	},

	periodPurchases: () => {
		const query = [{
				$lookup: {
					from: 'parts',
					localField: 'part',
					foreignField: '_id',
					as: 'partDoc'
				}
			},
			// {"$match": {"state": "payed"}},
			{
				$facet: {
					byType: [{
							$group: {
								_id: '$partDoc.type',
								qty: {
									$sum: '$qty'
								},
								amount: {
									$sum: '$amount'
								}
							}
						},
						{
							$sort: {
								amount: -1
							}
						}
					],
					byPart: [{
							$group: {
								_id: {
									part: '$partDoc'
								},
								qty: {
									$sum: '$qty'
								},
								amount: {
									$sum: '$amount'
								}
							}
						},
						{
							$sort: {
								amount: -1
							}
						}
					],
					byPo: [{
						$sort: {
							amount: -1
						}
					}],
					total: [{
						$group: {
							_id: undefined,
							amount: {
								$sum: '$amount'
							}
						}
					}]
				}
			}
		];

		return schema.aggregate(query).then((doc) => {
			let result = {
				total: 0
			}
			if (doc[0].total.length === 1) {
				let data = doc[0]
				result.types = []
				let byType = data.byType;
				let byPart = data.byPart;
				let byPo = data.byPo;

				__.each(byPo, po => {
					let type = po.partDoc[0].type
					let part = po.partDoc[0]
					let typeDoc = __.find(result.types, t => {
						return t.type === type
					})
					if (!typeDoc) {
						let byTypeElement = __.find(byType, t => {
							let id
							if (t._id.length > 0) id = t._id[0]
							return id === type
						})
						typeDoc = {
							type: type,
							parts: [],
							total: byTypeElement.amount
						}
						result.types.push(typeDoc)
					}

					let partDoc = __.find(typeDoc.parts, p => {
						return p.part._id.equals(part._id)
					})
					if (!partDoc) {
						let byPartElement = __.find(byPart, p => {
							return p._id.part[0]._id.equals(part._id)
						})
						partDoc = {
							part: part,
							pos: [],
							total: byPartElement.amount
						}
						typeDoc.parts.push(partDoc)
					}
					delete po.__v
					delete po.partDoc
					partDoc.pos.push(po)
				})

				result.total = data.total[0].amount
				__.each(result.types, t => {
					__.each(t.parts, p => {
						p.pos = __.sortBy(p.pos, po => {
							return po.amount * 1
						})
					})
					t.parts = __.sortBy(t.parts, pp => {
						return pp.total * -1
					})
				})
				result.types = __.sortBy(result.types, tt => {
					return tt.total * -1
				})
			}

			return result;
		});
	}
};

module.exports = createEntity(config, addIn);
