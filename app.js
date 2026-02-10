const express = require('express');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');

const productsRouter = require('./src/routes/products.router');
const cartsRouter = require('./src/routes/carts.router');
const viewsRouter = require('./src/routes/views.router');

const app = express();
const PORT = 8080;

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/src/views');
app.set('view engine', 'handlebars');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/src/public'));

// Inicialización del servidor HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Inicialización del servidor de WebSockets
const io = new Server(httpServer);

// Middleware para pasar la instancia de IO a las rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutas
app.use('/', viewsRouter); 
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Configuración básica del socket (conexión)
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
});