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

module.exports = app => {
    //const users = require("../controllers/users_controllers");
    const middlewares = require("../middlewares/middlewares");
    let router = require("express").Router();
    
    /*---------------------------------------------USER LOG IN---------------------------------------------*/
    router.post('/login', (req,res)=> {
        const jwtPass = 'uNpASSWORDuNp0c0Malo97531';
        let sql =  `SELECT * FROM users 
                    WHERE (username = :username OR email = :email) 
                    AND password = :password`;
        sequelize.query( sql, {
            replacements: {username : req.body.username , email: req.body.username,password : req.body.password}, type:sequelize.QueryTypes.SELECT
        }).then(result => {
            /*error management*/
            if(result === undefined  || !(result.length > 0)){
                res.status(401).send('Error: Datos incorrectos');
            } else{
                /*token created and sent when correct data is given*/
                let user_id = result[0].user_id;
                console.log(result);
                const token = jwt.sign({
                    user_id,
                }, jwtPass);
                res.json({token: token, user_id: user_id});
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    })
    
    /*-----------------ROUTES EXAMPLE USING THE EXISTENT MIDDLEWARES(eliminar)-----------------*/
    /*router.get('/secure', middlewares.authenticateUser, (req, res)=> {
        res.send(`Esta es una pagina autenticada. Hola ${req.user[0].firstname}!`);
    })
    router.get('/adminonly', middlewares.authorizateUser, (req, res)=> {
        res.send(`Esta es una pagina que requiere autorizacion. Hola Admin!`);
    })*/

    app.use('/', router);
}
