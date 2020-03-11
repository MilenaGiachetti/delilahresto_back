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

/*---------------------------------------------USERS--------------------------------------------*/
module.exports = app => {
    const users = require("../controllers/users_controllers");
    const middlewares = require("../middlewares/middlewares");
    let router = require("express").Router();
  
    /*-----------------ADD A USER-----------------*/
    router.post('/', users.addOne);

    /*example of info to send in the body:
    {
        "username": "LukeSky",
        "firstname": "Luke",
        "lastname": "Skywalker",
        "email": "lukeskywalker@jedi.sw",
        "adress": "526 Tatooine",
        "phone": 1545879563,
        "last_order": 0,
        "password": "Luke"
    }
    {
        "username": "Leia",
        "firstname": "Leia",
        "lastname": "Organa",
        "email": "leiaorgana@kindajedi.sw",
        "adress": "326 Alderaan",
        "phone": 1512549563,
        "password": "Leia"
    }
    */

    /*-----------------SEE ALL USERS(eliminate)-----------------*/
    //router.get('/', middlewares.authorizateUser, users.findAll)

    /*-----------------SEE A USER-----------------*/
    router.get('/:id', middlewares.authenticateUser, users.findOne);

    /*-----------------UPDATE A USER-----------------*/
    //need to check if email and username doesnt already exists
    router.put('/:id', middlewares.authenticateUser, users.updateOne);

    /*example of info to send in the body:
    {
        "username": "LukeSky",
        "firstname": "Luke",
        "adress": "1528 Tatooine",
        "phone": 1545879563,
    }
    {
        "email": "leiaorgana@starwars.com",
    }
    */

    /*-----------------DELETE A USER-----------------*/
    router.delete('/:id', middlewares.authenticateUser, users.deleteOne);
  
    app.use('/users', router);
};
