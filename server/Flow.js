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
        quot: 'SupplierParts',
        supplier: 'Supplier'
    },
    SupplierPart: {
        quots: 'SupplierPartQuots',
        self: 'SupplierPart'
    },
    SupplierPartQuots: {
        add: 'SupplierPartQuots',
        supplierPart: 'SupplierPart'
    },
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
    PartQuots: {
        add: 'PartQuots'
    },
    PartSuppliers: {
        quot: 'PartSuppliers',
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
        add: 'ProductChainParts',
        productChain: 'ProductChain'
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
