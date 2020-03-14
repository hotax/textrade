const schema = require('../../db/schema/Part'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity')

const config = {
	schema,
	updatables: ['code', 'name', 'type', 'creator', 'tags'],
	searchables: ['code', 'name', 'tags']
}

const addIn = {
};

module.exports = createEntity(config, addIn);
