/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const reqs = require('./app/config/config');

/*---------------------------------------------ROUTES--------------------------------------------*/
require('./app/routes/users_routes')(reqs.app);
require('./app/routes/products_routes')(reqs.app);
require('./app/routes/orders_routes')(reqs.app);
reqs.app.get('/*', (req, res)=> {
    res.status(404).send("Error: Endpoint doesn't exist");
})

/*---------------------------------------------LISTENER CREATED IN PORT 3000--------------------------------------------*/
reqs.app.listen(3000, ()=> {
    console.log('Server 3000 is working');
})