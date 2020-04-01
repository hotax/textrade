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
    Customers: {
        add: 'Customers',
        home: 'TexTrade'
    },
    Customer: {
        self: "Customer",
        collection: "Customers",
        requirements: 'CustomerRequirements'
    },
    CustomerRequirements: {
        add: 'CustomerRequirements',
        customer: 'Customer'
    },
    CustomerRequirement: {
        self: "CustomerRequirement",
        collection: "CustomerRequirements",
        customer: 'Customer',
        productChains: 'CustomerRequirementChains'
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
        self: 'PartQuot',
        partQuots: 'PartQuots',
        supplierParts: 'SupplierParts',
        partSuppliers: 'PartSuppliers',
        supplier: 'Supplier',
        part: 'Part'
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
    ProductChainPart: {
        product: 'Product',
        productChains: 'ProductChains',
        productChain: 'ProductChain',
        productChainParts: 'ProductChainParts',
        quots: 'ProductChainPartQuots'
    },
    ProductChainPartQuots: {
        add: 'ProductChainPartQuots',
        productChainPart: 'ProductChainPart'
    },
    ProductChainPartQuot: {
        product: 'Product',
        productChains: 'ProductChains',
        productChain: 'ProductChain',
        productChainParts: 'ProductChainParts',
        productChainPart: 'ProductChainPart',
        productChainPartQuots: 'ProductChainPartQuots'
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
