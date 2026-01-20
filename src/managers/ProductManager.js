const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const rutaArchivo = path.join(__dirname, '../data/products.json');

class ProductManager {
    
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

    async getProducts() {
        return await this.readFile();
    }

    async getProductById(id) {
        const products = await this.readFile();
        const product = products.find(p => p.id === id);
        if (!product) return null;
        return product;
    }

    async addProduct(productData) {
        const products = await this.readFile();

        if (products.some(p => p.code === productData.code)) {
            throw new Error(`El código del producto "${productData.code}" ya existe.`);
        }

        const newProduct = {
            id: crypto.randomUUID(),
            status: true,
            thumbnails: [],
            ...productData
        };

        products.push(newProduct);
        await this.saveFile(products);
        return newProduct;
    }

    async updateProduct(id, updateData) {
        const products = await this.readFile();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) return null;

        const { id: _, ...rest } = updateData;

        products[index] = { ...products[index], ...rest };
        
        await this.saveFile(products);
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.readFile();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) return null;

        const deletedProduct = products[index];
        products.splice(index, 1);
        
        await this.saveFile(products);
        return deletedProduct;
    }
}

module.exports = ProductManager;