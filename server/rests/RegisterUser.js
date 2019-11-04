const entity = require('../biz/bas/Employee');

module.exports = {
    url: '/cross/auth/users',
    rests: [{
            type: 'create',
            target: 'User',
            handler: (req) => {
                return entity.create(req.body)
            }
        }
    ]
}