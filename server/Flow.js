module.exports = {
    TexTrade: {
        parts: 'Parts',
        products: 'Products',
        suppliers: 'Suppliers',
        customers: 'Customers',
        users: 'Users',
        register: 'RegisterUser',
        currentUser: 'CurrentUser',
    },
    Suppliers: {
        add: 'Suppliers',
        home: 'TexTrade'
    },
    Supplier: {
        self: "Supplier",
        collection: "Suppliers",
        parts: "SupplierParts"
    },
    SupplierParts: {
        add: 'SupplierParts',
        supplier: 'Supplier'
    },
    SupplierPart: {
        quots: 'SupplierPartQuots',
        self: 'SupplierPart'
    },
    /* SuplierPartQuots: {
        supplierPart: 'SupplierPart'
    }, */
    Customers: {
        add: 'Customers',
        home: 'TexTrade'
    },
    Customer: {
        self: "Customer",
        collection: "Customers",
        quots: 'CustomerQuots'
    },
    CustomerQuots: {
        add: 'CustomerQuots',
        home: 'TexTrade'
    },
    CustomerQuot: {
        self: "CustomerQuot",
        collection: "CustomerQuots"
    },
    Parts: {
        add: 'Parts',
        home: 'TexTrade'
    },
    Part: {
        self: "Part",
        collection: "Parts",
        suppliers: 'PartSuppliers'
    },
    PartQuot: {
        self: 'PartQuot'
    },
    PartSuppliers: {
        add: 'PartSuppliers',
        part: 'Part'
    },
    Products: {
        add: 'Products',
        home: 'TexTrade'
    },
    Product: {
        self: "Product",
        collection: "Products",
        chains: "ProductChains"
    },
    ProductChains: {
        product: "Product",
        add: 'ProductChains'
    },
    ProductChain: {
        collection: 'ProductChains',
        product: 'Product',
        parts: 'ProductChainParts'
    },
    ProductChainParts: {
        add: 'ProductChainParts'
    },
    Users: {
        add: 'RegisterUser',
        home: 'TexTrade'
    },
    User: {
        password: 'Password',
        authorize: 'Authorization'
    }
}
