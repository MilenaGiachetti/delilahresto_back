/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require('../config/db_config');
const reqs = require('../config/config');


/*---------------------------------------------USERS--------------------------------------------*/
/*-----------------ADD A USER-----------------*/
exports.addOne = (req,res) => {
    //mensaje de error en caso de faltar info requerida 422 or 400?
    let missingInfo = [];
    req.body.username   !== undefined ? '' : missingInfo.push(' username');
    req.body.firstname  !== undefined ? '' : missingInfo.push(' firstname');
    req.body.lastname   !== undefined ? '' : missingInfo.push(' lastname');
    req.body.email      !== undefined ? '' : missingInfo.push(' email');
    req.body.adress     !== undefined ? '' : missingInfo.push(' adress');
    req.body.phone      !== undefined ? '' : missingInfo.push(' phone');
    req.body.password   !== undefined ? '' : missingInfo.push(' password');
    
    if (missingInfo == '') {
        let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                            FROM users 
                            WHERE username = ? OR email = ?`;
        sequelize.query( sql, {
            replacements: [req.body.username, req.body.email], type:sequelize.QueryTypes.SELECT
        }).then(repeated_user => {
            if (repeated_user.length === 0) {
                /*hashing password before sending information*/
                reqs.bcrypt.genSalt(reqs.saltRounds, function(err, salt) {
                    reqs.bcrypt.hash(req.body.password, salt, function(err, hash) {
                        let user = {
                            user_id    : null,
                            username   : req.body.username,
                            firstname  : req.body.firstname,
                            lastname   : req.body.lastname,
                            email      : req.body.email,
                            adress     : req.body.adress,
                            phone      : req.body.phone,
                            password   : hash,
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
                    });
                });
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
                    res.status(400).send(`Error: ya existe un usuario con este username y email`);
                } else if (name > 0) {
                    res.status(400).send(`Error: ya existe un usuario con este username`);
                } else if (email > 0) {
                    res.status(400).send(`Error: ya existe un usuario con este email`);
                } else {
                    res.status(400).send(`Error: ya existe un usuario con este username o email`);
                }
            }
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    } else {
        res.status(400).send('Error: falta la siguiente información requerida: '+ missingInfo);
    }
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
                /*hashed password sent, if nothing is sent in the req.body.password it simply doesn't send it, so the password stays hashed as before*/
                reqs.bcrypt.genSalt(reqs.saltRounds, function(err, salt) {
                    reqs.bcrypt.hash(req.body.password, salt, function(err, hash) {
                        //created general function to update user
                        function updateUser(){
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
                                password   : req.body.password   !== undefined ? hash  : current_user[0].password,
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
                        }

                        //repetead username or email validation - only if new email or username info is sent
                        if(req.body.username !== undefined || req.body.email !== undefined){
                            let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                            FROM users 
                            WHERE (username = ? OR email = ?) AND user_id != ?`;
                            sequelize.query( sql, {
                                replacements: [req.body.username, req.body.email, req.params.id], type:sequelize.QueryTypes.SELECT
                            }).then(repeated_user => {
                                //error message in case of repeated username or email
                                if (repeated_user.length !== 0) {
                                    let email = false;
                                    let username = false;
                                    for ( let i = 0; i < repeated_user.length; i++ ){
                                        if ( repeated_user[i].username === req.body.username ) { username = true }
                                        if ( repeated_user[i].email === req.body.email ) { email = true }
                                    }
                                    if ( email === true && username === true ){
                                        res.status(400).send('Error: ya existe un usuario registrado con el username: ' + req.body.username + ' y el email: ' + req.body.email )
                                    } else if ( email === true ) {
                                        res.status(400).send('Error: ya existe un usuario registrado con el email: ' + req.body.email )
                                    } else {
                                        res.status(400).send('Error: ya existe un usuario registrado con el username: ' + req.body.username )
                                    }
                                //if not repeated update user
                                } else {
                                    updateUser();
                                }
                            }).catch((err)=>{
                                res.status(500).send( 'Error: ' + err );
                            })
                        } else {
                            //if not email or username info sent user updated without the extra query
                            updateUser();
                        }
                    });
                });
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
    if(req.user[0].user_id == req.params.id || req.user[0].is_admin === 'TRUE'){
        let sql =  `DELETE FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id]
        }).then(deleted_user => {
            if (deleted_user[0].affectedRows === 0){
                res.status(404).send(`Error: usuario con id ${req.params.id} no existente`);
            } else {
                res.json(`Eliminado con éxito usuario con id: ${req.params.id}`);                
            }
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
                WHERE (username = :username OR email = :email)`;
    sequelize.query( sql, {
        replacements: {username : req.body.username , email: req.body.username}, type:sequelize.QueryTypes.SELECT
    }).then(result => {
        async function checkPass (){
            const match = await reqs.bcrypt.compare(req.body.password, result[0].password);
            console.log('1:' + match);
            /*error management*/
            if (match){
                /*token created and sent when correct data is given*/
                let user_id = result[0].user_id;
                const token = reqs.jwt.sign({
                    user_id,
                }, jwtPass);
                res.json({token: token, user_id: user_id});
            } else {
                res.status(401).send('Error: Datos incorrectos');
            }
        }
        checkPass();
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}