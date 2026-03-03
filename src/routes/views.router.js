const { Router } = require('express');
const Product = require('../dao/models/product.model');
const Cart = require('../dao/models/cart.model');

const router = Router();

router.get('/', (req, res) => {
    res.redirect('/products');
});

// Vista de Productos Paginados
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const result = await Product.paginate({}, { page, limit, lean: true });

        res.render('products', {
            title: 'Productos',
            products: result.docs,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            page: result.page,
            totalPages: result.totalPages
        });
    } catch (error) {
        res.status(500).send('Error al cargar los productos');
    }
});

// Vista de Detalle de un Producto
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid).lean();
        if (!product) return res.status(404).send('Producto no encontrado');
        
        res.render('productDetail', { 
            title: product.title,
            product 
        });
    } catch (error) {
        res.status(500).send('Error al cargar el producto');
    }
});

// Vista de un Carrito Específico
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!cart) return res.status(404).send('Carrito no encontrado');

        res.render('cartDetail', { 
            title: 'Detalle del Carrito',
            cart 
        });
    } catch (error) {
        res.status(500).send('Error al cargar el carrito');
    }
});

// Vista con Websockets (RealTimeProducts)
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render('realTimeProducts', { 
            title: 'Productos en Tiempo Real',
            products 
        });
    } catch (error) {
        res.status(500).send('Error al cargar la vista en tiempo real');
    }
});

module.exports = router;