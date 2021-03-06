/*---------------------------------------------ORDERS--------------------------------------------*/
module.exports = app => {
    /*-----------------REQUIREMENTS-----------------*/
    const orders = require("../controllers/orders_controllers");
    const middlewares = require("../middlewares/middlewares");
    let router = require("express").Router();

    /*-----------------ADD A ORDER-----------------*/
    router.post('/', middlewares.authenticateUser, orders.addOne);

    /*example of info to send in the body:
    {
        "payment": 2,
        "products": [
            {"product_id": 34,
            "product_quantity":1},
            {"product_id": 2,
            "product_quantity":1}
        ]
    }*/

    /*-----------------SEE ALL ORDERS-----------------*/
    router.get('/', middlewares.authenticateUser, orders.findAll);

    /*-----------------SEE ALL ORDERS SORTED BY ORDER_STATE o HOUR-----------------*/
    //router.get('/sort', middlewares.authorizateUser, orders.findAllSorted);

    /*-----------------SEE A ORDER-----------------*/
    router.get('/:id', middlewares.authenticateUser, orders.findOne);

    /*-----------------UPDATE A ORDER-----------------*/
    router.put('/:id', middlewares.authorizateUser, orders.updateOne);

    /*example of info to send in the body:
    {
        "order_state" : 5
    }*/

    /*-----------------DELETE A ORDER-----------------*/
    router.delete('/:id', middlewares.authorizateUser, orders.deleteOne);
 
    app.use('/orders', router);
};
