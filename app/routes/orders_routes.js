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

/*---------------------------------------------ORDERS--------------------------------------------*/
module.exports = app => {
    const orders = require("../controllers/orders_controllers");
    const middlewares = require("../middlewares/middlewares");
    let router = require("express").Router();

    /*-----------------ADD AN ORDER-----------------*/
    router.post('/', middlewares.authenticateUser, orders.addOne);

    /*example of info to send in the body:
    {
        "payment": "efectivo",
        "products": {
            "34": 3,
            "2": 1
        }
    }*/

    /*-----------------SEE ALL ORDERS-----------------*/
    router.get('/', middlewares.authorizateUser, orders.findAll);

    /*-----------------SEE A ORDER-----------------*/
    router.get('/:id', middlewares.authenticateUser, orders.findOne);

    /*-----------------UPDATE A ORDER-----------------*/
    router.put('/:id', middlewares.authorizateUser, orders.updateOne);

    /*example of info to send in the body:
    {
        "order_state" : "cancelado"
    }*/

    /*-----------------DELETE A ORDER-----------------*/
    router.delete('/:id', middlewares.authorizateUser, orders.deleteOne);
 
    app.use('/orders', router);
};
