const { Router } = require('express');
const Cart = require('../dao/models/cart.model');
const Product = require('../dao/models/product.model');

const router = Router();


router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find().populate('products.product');
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los carritos' });
    }
});

// POST /api/carts - Crear un carrito nuevo vacío
router.post('/', async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear carrito' });
    }
});

// GET /api/carts/:cid - Obtener carrito con productos
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');

        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener carrito o ID inválido' });
    }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const product = await Product.findById(pid);
        if (!product) return res.status(404).json({ error: 'El producto no existe' });

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        
        await cart.save();
        res.json({ status: 'success', message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});

// PUT /api/carts/:cid - Actualizar el carrito con un arreglo de productos nuevo
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const productsArray = req.body;

        const cart = await Cart.findByIdAndUpdate(
            cid, 
            { products: productsArray }, 
            { new: true }
        );
        
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
        
        res.json({ status: 'success', message: 'Carrito actualizado', cart });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
});

// PUT /api/carts/:cid/products/:pid - Actualizar solo la cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({ error: 'Cantidad inválida' });
        }

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.json({ status: 'success', message: 'Cantidad actualizada', cart });
        } else {
            res.status(404).json({ error: 'Producto no encontrado en este carrito' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
    }
});

// DELETE /api/carts/:cid - Vaciar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findByIdAndUpdate(
            cid,
            { products: [] },
            { new: true }
        );

        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        res.json({ status: 'success', message: 'Carrito vaciado exitosamente', cart });
    } catch (error) {
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
});

module.exports = router;