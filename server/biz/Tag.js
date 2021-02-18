const schema = require('../../db/schema/Tag'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
	schema,
	updatables: ['name', 'type'],
	searchables: ['name']
}

const addIn = {
};

module.exports = createEntity(config, addIn);
