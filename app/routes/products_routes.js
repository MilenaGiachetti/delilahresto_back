/*---------------------------------------------PRODUCTS---------------------------------------------*/
module.exports = app => {
    /*-----------------REQUIREMENTS-----------------*/
    const products = require("../controllers/products_controllers");
    const middlewares = require("../middlewares/middlewares");
    let router = require("express").Router();
    
    /*-----------------ADD A PRODUCT-----------------*/
    router.post('/', middlewares.authorizateUser, products.addOne);

    /*example of info to send in the body:
    {
        "product_name":"Hamburguesa Veggie", 
        "abbreviation":"HamVeg", 
        "link_img":"https://images.unsplash.com/photo-1540265556701-ae209ac395cd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60", 
        "price":"340"
    }*/

    /*-----------------SEE ALL PRODUCTS-----------------*/
    router.get('/', middlewares.authenticateUser, products.findAll);

    /*-----------------SEE A PRODUCT-----------------*/
    router.get('/:id', middlewares.authenticateUser, products.findOne);

    /*-----------------UPDATE A PRODUCT-----------------*/
    router.put('/:id', middlewares.authorizateUser, products.updateOne);

    /* example of info to send in the body:   
    {
        "product_name" : "Agua mineral",
        "abbreviation" : "Agua",
        "link_img" : "https://images.unsplash.com/photo-1546498159-9a2fac87e770?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
        "price" : 60
    }
    */

    /*-----------------DELETE A PRODUCT-----------------*/
    router.delete('/:id', middlewares.authorizateUser, products.deleteOne);

    app.use('/productos', router);
};


