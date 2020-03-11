/*password no parece ser sensible a Mayus..averiguar*/
/*encriptar password en la db*/

/*validar que en creacion de usuarios no se repita mail/usuario ya existente*/
/*validar que en creacion de usuarios no se repita abreviacin/(descripcion tal vez tmbn) ya existente*/
/*agregar que estos elementos son unicos en la info de la db*/

/*deberian administradores poder eliminar usuarios?*/

/*Validar existencia de productos al crear un pedido*/

/*ordernar json de ver un pedido*/

/*cambiar get de pedidos para que te info tmbn de productos como lo hace el get de un pedido*/ 

/*pensar mejor el contenido de los catchs*/
/*check that all necessary info is sent*/
/*check that updates dont change elements unique column values to repeated ones*/
/*check if update orders can only send the new info to avoid the select query */

let express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    jwt        = require('jsonwebtoken'),
    Sequelize = require('sequelize');

/*---------------------------------------------CONNECTION TO DB---------------------------------------------*/
/*-----------------CREATE CONNECTION TO DB-----------------*/
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilah_resto2');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*---------------------------------------------MIDDLEWARES--------------------------------------------*/
const middlewares = require("./app/middlewares/middlewares.js");

/*---------------------------------------------ROUTES--------------------------------------------*/
require('./app/routes/users_routes')(app);
require('./app/routes/products_routes')(app);
require('./app/routes/orders_routes')(app);
require('./app/routes/login_route')(app);
app.get('/*', (req, res)=> {
    res.status(404).send("Error: Endpoint no existente");
})

/*---------------------------------------------LISTENER CREATED IN PORT 3000--------------------------------------------*/
app.listen(3000, ()=> {
    console.log('Server 3000 is working');
})