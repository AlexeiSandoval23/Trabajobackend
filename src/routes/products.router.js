const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        const limit = req.query.limit;

        if (limit) {
            return res.json(products.slice(0, parseInt(limit)));
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);

        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
});

router.post('/', async (req, res) => {

    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || stock === undefined || !category) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const newProduct = await productManager.addProduct({
            title, description, code, price, stock, category, thumbnails
        });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await productManager.updateProduct(pid, req.body);

        if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await productManager.deleteProduct(pid);

        if (!deletedProduct) return res.status(404).json({ error: 'Producto no encontrado' });

        res.json({ message: 'Producto eliminado', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;