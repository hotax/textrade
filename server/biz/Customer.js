const schema = require('../../db/schema/Customer'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	__ = require('underscore')

const config = {
	schema,
	projection: {contacts: 0, requirements: 0},
	listable: {contacts: 0, requirements: 0, __v: 0},
	updatables: ['code', 'name', 'address', 'link', 'creator', 'tags'],
	searchables: ['code', 'name', 'address', 'tags']
}

const addIn = {
	createRequirement: (customer, data) => {
		let row
		return schema.findById(customer)
			.then(doc => {
				if(!doc) return
				row = doc.requirements.push(data)
				return doc.save()
					.then(doc => {
						doc = doc.toJSON()
						return {customer: doc.id, ...doc.requirements[row-1]}
					})
			})
	},

	listRequirements: (customer) => {
		return schema.findById(customer)
			.then(doc => {
				if(!doc) return []
				doc = doc.toJSON()
				return doc.requirements
			})
	},

	findRequirementById: (requirement) => {
		return schema.findOne({
			requirements: {
				$elemMatch: {
					_id: requirement
				}
			}
		})
		.then(doc => {
			const req = doc.requirements.id(requirement).toJSON()
			const cust = __.pick(doc.toJSON(), '__v', 'updatedAt')
			return {customer: doc.id, ...req, ...cust}
		})
	},

	updateRequirement: (requirement, toUpdate) => {
		return schema.findOne({
			__v: toUpdate.__v,
			requirements: {
				$elemMatch: {
					_id: requirement
				}
			}
		})
		.then(doc => {
			const req = doc.requirements.id(requirement)
			__.each(['requirement', 'date', 'creator'], (key) => {
				if(toUpdate[key]) req[key] = toUpdate[key]
				else req[key] = undefined
			})
			return doc.save()
		})
	},

	removeRequirement: (requirement) => {
		return schema.findOne({
			requirements: {
				$elemMatch: {
					_id: requirement
				}
			}
		})
		.then(doc => {
			if(doc) {
				const req = doc.requirements.id(requirement)
				req.remove()
				return doc.save()
			}
		})
	},

	ifMatchRequirement: (requirement, version) => {
		return entity.ifMatch({
			requirements: {
				$elemMatch: {
					_id: requirement
				}
			}
		}, version)
	}
}

const entity = createEntity(config, addIn)

module.exports = entity