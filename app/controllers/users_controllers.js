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

exports.addOne = (req,res) => {
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
            let sql = `INSERT INTO users VALUES (:user_id, :username, :firstname, :lastname, :email, :adress, :phone, :password, :last_order, :is_admin)`;
            sequelize.query( sql, {
                replacements: user
            }).then(result => {
                console.log(result[0]);
                user.user_id = result[0];
                delete user.password;
                res.json(user);
                /*it should also return the token so it can be already logged in ?*/
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
        } else {
            //error handling when there is/are repeated username and/or email
            let email = 0;
            let name = 0;
            //checking what is repeated
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
            //sending error message
            if (email > 0 && name > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre y email`);
            } else if (name > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre`);
            } else if (email > 0) {
                res.status(400).send(`Error: ya existe un usuario con este email`);
            } else {
                res.status(400).send(`Error: ya existe un usuario con este nombre o email`);
            }
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
}

/*exports.findAll = (req,res) => {
    let sql = `SELECT username, firstname, lastname, email, adress, phone FROM users WHERE is_admin = 'FALSE'`;
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_users => {
        if (all_users.length === 0) {
            res.status(404).send(`Error: no existe ningún usuarios`)
        } else {
            res.json(all_users);
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
}*/

exports.findOne = (req, res) => {
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
                res.json(user[0]);
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado a ver esta información");
    }
}

exports.updateOne = (req,res) => {
    if(req.user[0].user_id == req.params.id){
        /*Search for the current user object*/
        let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, password, is_admin
                    FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(result => {
            if (result.length > 0) {
                let current_user = result;
                /*Added conditional in case the request body doesnt send all the users information, in the case of a info not being given it sends the same info that was already in the db*/
                let changed_user = {
                    user_id    : req.params.id,
                    username   : req.body.username   !== undefined ? req.body.username   : current_user[0].username,
                    firstname  : req.body.firstname  !== undefined ? req.body.firstname  : current_user[0].firstname,
                    lastname   : req.body.lastname   !== undefined ? req.body.lastname   : current_user[0].lastname,
                    email      : req.body.email      !== undefined ? req.body.email      : current_user[0].email,
                    adress     : req.body.adress     !== undefined ? req.body.adress     : current_user[0].adress,
                    phone      : req.body.phone      !== undefined ? req.body.phone      : current_user[0].phone,
                    password   : req.body.password   !== undefined ? req.body.password   : current_user[0].password,
                    last_order : req.body.last_order !== undefined ? req.body.last_order : current_user[0].last_order,
                    is_admin   : current_user[0].is_admin
                };
                let sql =  `UPDATE users SET username = :username, firstname = :firstname, lastname = :lastname, email = :email, adress = :adress, phone = :phone, password = :password, last_order = :last_order, is_admin = :is_admin
                            WHERE user_id = :user_id`;
                sequelize.query( sql, {
                    replacements: changed_user
                }).then(result => {
                    delete changed_user.password;
                    res.json(changed_user);
                }).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.render('error', { error: err });
                })           
            } else {
                res.send(`Error: no hay usuario con el id ${req.params.id}`)
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para modificar esta información");
    }
}

exports.deleteOne = (req, res) => {
    if(req.user[0].user_id == req.params.id){
        let sql =  `DELETE FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id]
        }).then(deleted_user => {
            res.json(`Eliminado con éxito usuario con id: ${req.params.id}`);
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para eliminar este usuario");
    }
}