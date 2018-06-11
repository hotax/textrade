const users = []

module.exports = {
    findOrCreate: function (data) {
        for (i = 0; i < users.length; i++) {
            if (users[i].gitProfile.id === data.gitProfile.id) {
                users[i] = data;
                return Promise.resolve(users[i]);
            }
        }
        users.push(data);
        return Promise.resolve(data);
    },

    getById: function (id) {
        for (i = 0; i < users.length; i++) {
            if (users[i].gitProfile.id === id) {
                return Promise.resolve(users[i]);
            }
        }
        return Promise.resolve(null);
    }
}