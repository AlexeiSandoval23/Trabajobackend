const { Router } = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);

        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const product = await productManager.getProductById(pid);
        if (!product) return res.status(404).json({ error: 'El producto no existe' });

        const cart = await cartManager.addProductToCart(cid, pid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
});

module.exports = router;