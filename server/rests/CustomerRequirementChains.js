const entity = require('../biz/Product')

module.exports = {
    url: '/textrade/api/customers/requirements/:id/chains',
    transitions: {
    },
    rests: [{
            type: 'query',
            element: 'ProductChain',
            handler: ({id}) => {
                return entity.listChainsByRequirement(id)
                    .then((items) => {
                        return {items}   
                    })
            }
        }
    ]
}