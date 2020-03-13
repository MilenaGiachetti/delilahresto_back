/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require('../config/db_config');
const reqs = require('../config/config');


/*---------------------------------------------USERS--------------------------------------------*/
/*-----------------ADD A USER-----------------*/
exports.addOne = (req,res) => {
    let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                        FROM users 
                        WHERE username = ? OR email = ?`;
    sequelize.query( sql, {
        replacements: [req.body.username, req.body.email], type:sequelize.QueryTypes.SELECT
    }).then(repeated_user => {
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
                user.user_id = result[0];
                delete user.password;
                res.json(user);
                /*it should also return the token so it can be already logged in ?*/
            }).catch((err)=>{
                res.status(500).send( 'Error: ' + err );
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
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------SEE ALL USERS-----------------*/
exports.findAll = (req,res) => {
    let sql = `SELECT user_id, username, firstname, lastname, email, adress, phone FROM users WHERE is_admin = 'FALSE'`;
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_users => {
        if (all_users.length === 0) {
            res.status(404).send(`Error: no existe ningún usuarios`)
        } else {
            res.json(all_users);
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------SEE A USER-----------------*/
exports.findOne = (req, res) => {
    if(req.user[0].user_id == req.params.id || req.user[0].is_admin === 'TRUE'){
        let sql =  `SELECT user_id, username, firstname, lastname, email, adress, phone, last_order, is_admin 
                        FROM users 
                        WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if (user.length === 0) {
                res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
            } else {
                res.json(user[0]);
            }
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado a ver esta información");
    }
}

/*-----------------UPDATE A USER-----------------*/
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
                    res.status(500).send( 'Error: ' + err );
                })           
            } else {
                res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
            }
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para modificar esta información");
    }
}

/*-----------------DELETE A USER-----------------*/
exports.deleteOne = (req, res) => {
    if(req.user[0].user_id == req.params.id){
        let sql =  `DELETE FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id]
        }).then(deleted_user => {
            res.json(`Eliminado con éxito usuario con id: ${req.params.id}`);
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para eliminar este usuario");
    }
}

/*---------------------------------------------USER LOG IN--------------------------------------------*/
exports.login = (req,res) => {
    const jwtPass = reqs.jwtPass;
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
            const token = reqs.jwt.sign({
                user_id,
            }, jwtPass);
            res.json({token: token, user_id: user_id});
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}
