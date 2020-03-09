/*password no parece ser sensible a Mayus..averiguar*/
/*encriptar password en la db*/
/*validar que en creacion de usuarios no se repita mail/usuario ya existente*/
/*deberian administradores poder eliminar usuarios?*/
/*ordernar json de ver un pedido*/


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
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_users => {
        if (all_users.length === 0) {
            res.status(404).send(`Error: no existe ningún usuarios`)
        } else {
            res.json(all_users);
        }
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

/*-----------------ADD A USER-----------------*/
app.post('/users', (req,res) => {
    let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                        FROM users 
                        WHERE username = ? OR email = ?`;
    sequelize.query( sql, {
        replacements: [req.body.username, req.body.email], type:sequelize.QueryTypes.SELECT
    }).then(repeated_user => {
        console.log(repeated_user);
        if (repeated_user.length === 0) {
            let user = {
                user_id    : null,
                username   : req.body.username,
                firstname  : req.body.firstname,
                lastname   : req.body.lastname,
                email      : req.body.email,
                adress     : req.body.adress,
                phone      : req.body.phone,
                password   : req.body.password,
                last_order : 0,
                is_admin   : 'FALSE'
            };
            let sql = `INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'FALSE')`;
            sequelize.query( sql, {
                replacements: [null,user.username, user.firstname, user.lastname,user.email, user.adress, user.phone, user.password]
            }).then(result => {
                console.log(result[0]);
                /*response with the data of the created user*/
                let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                            FROM users 
                            WHERE user_id = ?`;
                sequelize.query( sql, {
                    replacements: [result[0]], type:sequelize.QueryTypes.SELECT
                }).then(new_user => {
                    console.log(new_user);
                    if (new_user.length === 0) {
                        res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
                    } else {
                        /*it should also return the token so it can be already logged in*/
                        res.json(new_user);
                    }
                })
            })
        } else {
            //error handling when there is/are repeated username and/or email
            let email = 0;
            let name = 0;
            repeated_user.forEach(oneUser => {
                if (oneUser.username === req.body.username && oneUser.email === req.body.email) {
                    email++;
                    name++;
                } else if (oneUser.username === req.body.username) {
                    name++;
                } else if (oneUser.email === req.body.email) {
                    email++;
                } 
            });
            if (email > 0 && name > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre y email`);
            } else if (name > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre`);
            } else if (email > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre`);
            } else {
                res.status(400).send(`Error: ya existe un usuario con este nombre o email`);
            }
        }
    })

    
})

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

/*-----------------UPDATE A USER-----------------*/
app.put('/users/:id', authenticateUser, (req,res) => {
    if(req.user[0].user_id == req.params.id){
        /*Search for the current user object*/
        let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, password 
                    FROM users 
                    WHERE user_id = ? AND is_admin = 'FALSE'`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(result => {
            if (result.length > 0) {
                let current_user = result;
                /*Added conditional in case the request body doesnt send all the users information, in the case of a info not being given it sends the same info that was already in the db*/
                let changed_user = {
                    username   : req.body.username  !== undefined ? req.body.username   : current_user[0].username,
                    firstname  : req.body.firstname  !== undefined ? req.body.firstname  : current_user[0].firstname,
                    lastname   : req.body.lastname   !== undefined ? req.body.lastname   : current_user[0].lastname,
                    email      : req.body.email      !== undefined ? req.body.email      : current_user[0].email,
                    adress     : req.body.adress     !== undefined ? req.body.adress     : current_user[0].adress,
                    phone      : req.body.phone      !== undefined ? req.body.phone      : current_user[0].phone,
                    password   : req.body.password   !== undefined ? req.body.password   : current_user[0].password,
                    last_order : req.body.last_order !== undefined ? req.body.last_order : current_user[0].last_order
                };
                let sql =  `UPDATE users SET  (user_id = ?, username = ?, firstname = ?, lastname = ?, email = ?, adress = ?, phone = ?, password = ?, last_order = ?, is_admin = 'FALSE'
                            WHERE user_id = ?`;
                sequelize.query( sql, {
                    replacements: [null, changed_user.username, changed_user.firstname, changed_user.lastname, changed_user.email, changed_user.adress, changed_user.phone, changed_user.password, changed_user.last_order, req.params.id]
                }).then(result => {
                    let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                    FROM users 
                    WHERE user_id = ?`;
                    sequelize.query( sql, {
                        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
                    }).then(new_user => {
                        console.log(new_user);
                        if (new_user.length === 0) {
                            res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
                        } else {
                            res.json(new_user);
                        }
                    })     
                })           
            } else {
                res.send(`Error: no hay usuario con el id ${req.params.id}`)
            }
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para modificar esta información");
    }
})

/*---------------------------------------------USER LOG IN---------------------------------------------*/
app.post('/login', (req,res)=> {
    let sql =  `SELECT * FROM users 
                WHERE (username = :username OR email = :email) 
                AND password = :password`;
    sequelize.query( sql, {
        replacements: {username : req.body.username , email: req.body.username,password : req.body.password}, type:sequelize.QueryTypes.SELECT
    }).then(result => {
        /*error management*/
        if(result === undefined  || !(result.length > 0)){
            res.status(401).send('Error: Usuario inexistente o datos incorrectos');
        } else{
            /*token created and sent when correct data is given*/
            let user_id = result[0].user_id;
            const token = jwt.sign({
                user_id,
            }, jwtPass);
            res.json({token: token, user_id: user_id});
        }
    })     
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