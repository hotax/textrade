const schema = require('../../db/schema/Customer'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
	schema,
    updatables: ['code', 'name', 'address', 'link', 'creator', 'contacts', 'tags'],
	searchables: ['code', 'name', 'address', 'tags']
}

const addIn = {
	quot: quot => {
		let row
		return schema.findById(quot.customer)
		.then(doc => {
			if(!doc) return Promise.reject()
			if(!quot.date) quot.date = new Date()
			row = doc.quots.push(quot)
			return doc.save()
		})
		.then(data => {
			if(data) {
				data = data.toJSON()
				const doc = {...data.quots[row - 1], customer: data.id}
				return doc
			} 
		})
	}
}

module.exports = createEntity(config, addIn)