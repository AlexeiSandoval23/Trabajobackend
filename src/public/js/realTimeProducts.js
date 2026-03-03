const socket = io();

const productList = document.getElementById('productList');
const productForm = document.getElementById('productForm');

// Escuchar evento 'products' desde el servidor
socket.on('products', (data) => {
    renderProducts(data);
});

function renderProducts(products) {
    productList.innerHTML = ''; 
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <h3>${product.title}</h3>
            <p>Precio: $${product.price}</p>
            <p>Stock: ${product.stock}</p>
            <button onclick="deleteProduct('${product._id}')">Eliminar</button>
        `;
        productList.appendChild(card);
    });
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value
    };

    try {
        await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });
        
        productForm.reset();
    } catch (error) {
        console.error('Error al agregar producto:', error);
    }
});

async function deleteProduct(id) {
    try {
        await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
    }
}