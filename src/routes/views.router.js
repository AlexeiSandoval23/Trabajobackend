const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productManager = new ProductManager();

// Vista estática
router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('home', { 
        title: 'Lista de Productos',
        products 
    });
});

// Vista con Websockets
router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { 
        title: 'Productos en Tiempo Real',
        products 
    });
});

module.exports = router;