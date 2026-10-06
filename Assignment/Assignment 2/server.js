const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// 100 Products
const products = [];

for (let i = 1; i <= 100; i++) {
    products.push({
        id: i,
        name: `Product ${i}`,
        price: i * 100,
        category: "Electronics",
        stock: i + 10
    });
}

// Home route
app.get("/", (req, res) => {
    res.send(`
        <h1>Product REST API</h1>
        <h2>Total Products: 100</h2>

        <p>Available API:</p>

        <ul>
            <li>GET /api/products</li>
            <li>GET /api/products/1</li>
            <li>POST /api/products</li>
            <li>PUT /api/products/1</li>
            <li>DELETE /api/products/1</li>
        </ul>

        <a href="/api/products">View All 100 Products</a>
    `);
});

// GET all products
app.get("/api/products", (req, res) => {
    res.json({
        success: true,
        total: products.length,
        products: products
    });
});

// GET product by ID
app.get("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

// POST - Add product
app.post("/api/products", (req, res) => {

    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock
    };

    products.push(newProduct);

    res.status(201).json({
        message: "Product added successfully",
        product: newProduct
    });
});

// PUT - Update product
app.put("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;

    res.json({
        message: "Product updated successfully",
        product: product
    });
});

// DELETE - Delete product
app.delete("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const deletedProduct = products.splice(index, 1);

    res.json({
        message: "Product deleted successfully",
        product: deletedProduct[0]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});