const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const rutaArchivo = path.join(__dirname, '../data/carts.json');

class CartManager {

    async readFile() {
        try {
            const data = await fs.readFile(rutaArchivo, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async saveFile(data) {
        await fs.writeFile(rutaArchivo, JSON.stringify(data, null, 2));
    }

    async createCart() {
        const carts = await this.readFile();
        
        const newCart = {
            id: crypto.randomUUID(),
            products: []
        };

        carts.push(newCart);
        await this.saveFile(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.readFile();
        const cart = carts.find(c => c.id === id);
        if (!cart) return null;
        return cart;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.readFile();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) return null;

        const cart = carts[cartIndex];


        const productIndex = cart.products.findIndex(p => p.product === productId);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({
                product: productId,
                quantity: 1
            });
        }

        carts[cartIndex] = cart;
        await this.saveFile(carts);
        return cart;
    }
}

module.exports = CartManager;