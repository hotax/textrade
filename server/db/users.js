const user = {
    id: '12345678',
    profile: {
        displayName: 'clx',
    }
}

module.exports = {
    findOrCreate: function (data) {
        return Promise.resolve(user);
    },

    getById: function (id) {
        return Promise.resolve(user);
    }
}