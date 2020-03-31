const entity = require('../biz/PartQuot')

const list = function ({id}) {
    return entity.searchByPart(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/parts/:id/suppliers',
    transitions: {
        PartQuot: {id: 'context.part'}
    },
    rests: [{
            type: 'create',
            target: 'PartQuot',
            handler: (req) => {
                return entity.create({part: req.params.id, ...req.body})
            }
        },
        {
            type: 'query',
            element: 'PartQuots',
            handler: list
        }
    ]
}