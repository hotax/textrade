const schema = require('../../db/schema/Product'),
	createEntity = require('@finelets/hyper-rest/db/mongoDb/DbEntity'),
	logger = require('@finelets/hyper-rest/app/Logger')

const config = {
	schema,
    updatables: ['code', 'name', 'desc', 'content', 'constructure', 
                'yarnUnit', 'yarn', 'dnstyUnit', 'grey', 'product', 'author', 'tags'],
	searchables: ['code', 'name', 'desc', 'tags']
}

const addIn = {
};

module.exports = createEntity(config, addIn);
