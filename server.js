/*TO DO*/
/*password no parece ser sensible a Mayus..averiguar*/
/*encriptar password en la db*/

/*validar que en creacion de usuarios no se repita mail/usuario ya existente*/
/*validar que en creacion de usuarios no se repita abreviacin/(descripcion tal vez tmbn) ya existente*/
/*check that updates dont change elements unique column values to repeated ones*/

/*agregar que estos elementos son unicos en la info de la db*/

/*deberian administradores poder eliminar usuarios?*/
/*Validar existencia de productos al crear un pedido*/

/*check that all necessary info is sent*/

/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const reqs = require('./app/config/config');

/*---------------------------------------------ROUTES--------------------------------------------*/
require('./app/routes/users_routes')(reqs.app);
require('./app/routes/products_routes')(reqs.app);
require('./app/routes/orders_routes')(reqs.app);
require('./app/routes/login_route')(reqs.app); 
reqs.app.get('/*', (req, res)=> {
    res.status(404).send("Error: Endpoint no existente");
})

/*---------------------------------------------LISTENER CREATED IN PORT 3000--------------------------------------------*/
reqs.app.listen(3000, ()=> {
    console.log('Server 3000 is working');
})