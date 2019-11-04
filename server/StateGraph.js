module.exports = {
    Cross: {
        parts: 'Parts',
        suppliers: 'Suppliers',
        purchases: 'Purchases',
        withdraws: 'Withdraws',
        users: 'Users',
        register: 'RegisterUser',
        currentUser: 'CurrentUser',
        uploadPurTransTasks: "UploadPurchases",
        queryPurchaseTransTasks: 'PurchaseTransTasks',
        reportPeriodPurchases: 'ReportPeriodPurchases',
        reportInvLocStates: 'InvLocStates'
    },
    Parts: {
        add: 'Parts',
        home: 'Cross'
    },
    Part: {
        self: "Part",
        collection: "Parts"
    },
    Suppliers: {
        add: 'Suppliers',
        home: 'Cross'
    },
    Supplier: {
        self: "Supplier",
        collection: "Suppliers"
    },
    Users: {
        add: 'RegisterUser',
        home: 'Cross'
    },
    User: {
        password: 'Password',
        authorize: 'Authorization'
    },
    Withdraws: {
        add: 'Withdraws',
        home: 'Cross'
    },
    Withdraw: {
        self: 'Withdraw',
        collection: 'Withdraws'
    },
    Purchases: {
        add: 'Purchases',
        home: 'Cross'
    },
    Purchase: {
        self: 'Purchase',
        collection: 'Purchases',
        transactions: 'PoTransactions'
    },
    PoTransaction: {
        self: 'PoTransaction',
        parent: 'Purchase'
    },
    PeriodPurchases: {
        exit: 'Cross'
    }
}