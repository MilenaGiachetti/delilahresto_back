/*password no parece ser sensible a Mayus..averiguar*/
/*encriptar password en la db*/
/*validar que en creacion de usuarios no se repita mail/usuario ya existente*/
/*deberian administradores poder eliminar usuarios?*/
/*ordernar json de ver un pedido*/


let express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser');
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
/*-----------------JWT PASSWORD-----------------*/
const jwtPass = 'uNpASSWORDuNp0c0Malo97531';
/*-----------------AUTHENTICATE A USER-----------------*/
const authenticateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        res.status(401).send('Error: Error al validar usuario, ingrese a su cuenta para ver esta pagina');
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = jwt.verify(token, jwtPass);
        let sql =  `SELECT * FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if(user === undefined  || !(user.length > 0)){
                res.status(401).send('Error: Error al validar usuario, ingrese a su cuenta para ver esta pagina');
            } else {
                /*user data is sent to routes that use this middleware in the request. Way of access: For example, access to user first name req.user[0].firstname !remember: info is sent as an array*/
                req.user = user;
                next();
            }
        })
    }
}

/*-----------------AUTHORIZATE A USER-----------------*/
const authorizateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        /*403 or 401? Beacause if theres no header there hasnt been a log in*/
        res.status(403).send('Error: No tiene acceso a esta pagina');
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = jwt.verify(token, jwtPass);
        let sql =  `SELECT * FROM users 
                    WHERE user_id = ? 
                    AND is_admin = 'TRUE'`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            console.log(user);
            if(user === undefined  || !(user.length > 0)){
                res.status(403).send('Error: No tiene acceso a esta pagina');
            } else{
                /*is given access to existent users that have ADMIN ROL*/
                next();
            }
        })
    }
}



/*---------------------------------------------USERS--------------------------------------------*/
/*-----------------SEE ALL USERS(eliminate)-----------------*/
/*app.get('/users', (req,res) => {
    let sql = `SELECT username, firstname, lastname, email, adress, phone FROM users WHERE is_admin = 'FALSE'`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.json(result);
    })
})*/


/*-----------------SEE A USER-----------------*/
app.get('/users/:id', authenticateUser, (req,res) => {
    if(req.user[0].user_id == req.params.id || req.user[0].is_admin === 'TRUE'){
        let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                        FROM users 
                        WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            console.log(user);
            if (user.length === 0) {
                res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
            } else {
                res.json(user);
            }
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado a ver esta información");
    }
})



/*-----------------ROUTES EXAMPLE USING THE EXISTENT MIDDLEWARES(eliminar)-----------------*/
app.get('/secure', authenticateUser, (req, res)=> {
    res.send(`Esta es una pagina autenticada. Hola ${req.user[0].firstname}!`);
})
app.get('/adminonly', authorizateUser, (req, res)=> {
    res.send(`Esta es una pagina que requiere autorizacion. Hola Admin!`);
})


/*---------------------------------------------LISTENER CREATED IN PORT 3000--------------------------------------------*/
app.listen(3000, ()=> {
    console.log('Server 3000 is working');
})