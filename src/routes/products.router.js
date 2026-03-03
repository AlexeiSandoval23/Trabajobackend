const { Router } = require('express');
const Product = require('../dao/models/product.model');

const router = Router();

// GET /api/products - Obtener productos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const query = req.query.query;

        const filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = query;
            }
        }

        // Construir opciones de paginación
        const options = {
            page,
            limit,
            lean: true 
        };

        if (sort === 'asc' || sort === 'desc') {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const result = await Product.paginate(filter, options);

        // Construir la URL base para los links de paginación
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        
        const buildLink = (pageNumber) => {
            if (!pageNumber) return null;
            let link = `${baseUrl}?page=${pageNumber}&limit=${limit}`;
            if (sort) link += `&sort=${sort}`;
            if (query) link += `&query=${query}`;
            return link;
        };

        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: buildLink(result.prevPage),
            nextLink: buildLink(result.nextPage)
        });

    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al obtener productos' });
    }
});

// GET /api/products/:pid - Obtener producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error interno o ID inválido' });
    }
});

// POST /api/products - Agregar nuevo producto
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const newProduct = await Product.create({
            title, description, code, price, stock, category, thumbnails
        });

        if (req.io) {
            const products = await Product.find().lean();
            req.io.emit('products', products);
        }

        res.status(201).json(newProduct);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'El código del producto ya existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/products/:pid - Actualizar producto
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        
        if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });

        if (req.io) {
            const products = await Product.find().lean();
            req.io.emit('products', products);
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE /api/products/:pid - Eliminar producto
router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
        
        if (!deletedProduct) return res.status(404).json({ error: 'Producto no encontrado' });

        if (req.io) {
            const products = await Product.find().lean();
            req.io.emit('products', products);
        }

        res.json({ message: 'Producto eliminado', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;