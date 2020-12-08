/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require("../config/db_config");
const reqs = require("../config/config");

const validateEmail = (email) => {
    let emailregex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailregex.test(email);
}

const sendErrorStatus = (res, status, message, code) => {
    res.status(status).json({
        "error":{
            "status"  : status,
            "message" : message,
            "code"    : code
            // add short code for easy recognition from front. Ex. Code: "MISSING_INFO", "INVALID_EMAIL", "NOT_EXIST", "SERVER_ERROR", "NO_AUTH", "INCORRECT_DATA", "REPEATED_DATA"
        }
    })
};

/*---------------------------------------------USERS--------------------------------------------*/
/*-----------------ADD A USER-----------------*/
exports.addOne = (req,res) => {
    let missingInfo = [];
    req.body.username   !== undefined ? "" : missingInfo.push("username");
    req.body.firstname  !== undefined ? "" : missingInfo.push("firstname");
    req.body.lastname   !== undefined ? "" : missingInfo.push("lastname");
    req.body.email      !== undefined ? "" : missingInfo.push("email");
    req.body.address     !== undefined ? "" : missingInfo.push("address");
    req.body.phone      !== undefined ? "" : missingInfo.push("phone");
    req.body.password   !== undefined ? "" : missingInfo.push("password");
    
    if (missingInfo.length === 0) {
        //check if is a valid email address with regulaar expressions
        if(validateEmail(req.body.email)){
            let sql =  
                `SELECT username, firstname, lastname, email, address, phone, last_order, is_admin 
                FROM users 
                WHERE username = ? OR email = ?`;
            sequelize.query( sql, {
                replacements: [req.body.username, req.body.email], type:sequelize.QueryTypes.SELECT
            }).then(repeated_users => {
                if (repeated_users.length === 0) {
                    /*hashing password before sending information*/
                    reqs.bcrypt.genSalt(reqs.saltRounds, function(err, salt) {
                        reqs.bcrypt.hash(req.body.password, salt, function(err, hash) {
                            let user = {
                                user_id    : null,
                                username   : req.body.username,
                                firstname  : req.body.firstname,
                                lastname   : req.body.lastname,
                                email      : req.body.email,
                                address     : req.body.address,
                                phone      : req.body.phone,
                                password   : hash,
                                last_order : 0,
                                is_admin   : 0
                            };
                            let sql = `INSERT INTO users VALUES (:user_id, :username, :firstname, :lastname, :email, :address, :phone, :password, :last_order, :is_admin)`;
                            sequelize.query( sql, {
                                replacements: user
                            }).then(result => {
                                user.user_id = result[0];
                                delete user.password;
                                res.status(200).json(user);
                                /*it could also return the token so it can be already logged in*/
                            }).catch((err)=>{
                                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                            })
                        });
                    });
                } else {
                    //error handling when there is/are repeated username and/or email
                    let email = false;
                    let username = false;
                    //checking what is repeated
                    repeated_users.forEach(repeated_user => {
                        email = (repeated_user.email === req.body.email ? true : email);
                        username = (repeated_user.username === req.body.username ? true : username);
                    });
                    //sending error message
                    sendErrorStatus(res, 400, `${email && username ? "Username and email" : (email ? "Email" : "Username")} already exists`, "REPEATED_DATA");                 
                }
            }).catch((err)=>{
                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
            })
        } else {
            sendErrorStatus(res, 400, "Invalid Email", "INVALID_EMAIL");
        }
    } else {
        sendErrorStatus(res, 400, `Missing data: ${missingInfo.join(" - ")}`, "MISSING_DATA");
    }
}

/*-----------------ADD AN ADMIN-----------------*/
exports.addAdmin = (req,res) => {
    //error message in case of missing required info 422 or 400?
    let missingInfo = [];
    req.body.username   !== undefined ? "" : missingInfo.push("username");
    req.body.firstname  !== undefined ? "" : missingInfo.push("firstname");
    req.body.lastname   !== undefined ? "" : missingInfo.push("lastname");
    req.body.email      !== undefined ? "" : missingInfo.push("email");
    req.body.address     !== undefined ? "" : missingInfo.push("address");
    req.body.phone      !== undefined ? "" : missingInfo.push("phone");
    req.body.password   !== undefined ? "" : missingInfo.push("password");
    
    if (missingInfo.length === 0) {
        //check if is a valid email address with regulaar expressions
        if(validateEmail(req.body.email)){
            let sql =  
                `SELECT username, firstname, lastname, email, address, phone, last_order, is_admin 
                FROM users 
                WHERE username = ? OR email = ?`;
            sequelize.query( sql, {
                replacements: [req.body.username, req.body.email], type:sequelize.QueryTypes.SELECT
            }).then(repeated_users => {
                if (repeated_users.length === 0) {
                    /*hashing password before sending information*/
                    reqs.bcrypt.genSalt(reqs.saltRounds, function(err, salt) {
                        reqs.bcrypt.hash(req.body.password, salt, function(err, hash) {
                            let user = {
                                user_id    : null,
                                username   : req.body.username,
                                firstname  : req.body.firstname,
                                lastname   : req.body.lastname,
                                email      : req.body.email,
                                address     : req.body.address,
                                phone      : req.body.phone,
                                password   : hash,
                                last_order : 0,
                                is_admin   : 1
                            };
                            let sql = `INSERT INTO users VALUES (:user_id, :username, :firstname, :lastname, :email, :address, :phone, :password, :last_order, :is_admin)`;
                            sequelize.query( sql, {
                                replacements: user
                            }).then(result => {
                                user.user_id = result[0];
                                delete user.password;
                                res.status(200).json(user);
                                /*it could also return the token so it can be already logged in */
                            }).catch((err)=>{
                                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                            })
                        });
                    });
                } else {
                    //error handling when there is/are repeated username and/or email
                    let email = false;
                    let username = false;
                    //checking what is repeated
                    repeated_users.forEach(repeated_user => {
                        email += (repeated_user.email === req.body.email ? true : email);
                        username += (repeated_user.username === req.body.username ? true : username);
                    });
                    //sending error message
                    sendErrorStatus(res, 400, `${email && username ? "Username and email" : (email ? "Email" : "Username")} already exists`, "REPEATED_DATA");
                }
            }).catch((err)=>{
                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
            })
        } else {
            sendErrorStatus(res, 400, "Invalid Email", "INVALID_EMAIL");
        }
    } else {
        sendErrorStatus(res, 400, `Missing data: ${missingInfo.join(" - ")}`, "MISSING_DATA");
    }
}

/*-----------------SEE ALL USERS-----------------*/
exports.findAll = (req,res) => {
    let sql = `SELECT user_id, username, firstname, lastname, email, address, phone, last_order, is_admin FROM users`;
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_users => {
        if (all_users.length === 0) {
            sendErrorStatus(res, 404, "Database doesn't have any users", "NOT_EXIST");
        } else {
            res.status(200).json(all_users);
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}

/*-----------------SEE A USER-----------------*/
exports.findOne = (req, res) => {
    if(req.user[0].user_id == req.params.id || req.user[0].is_admin){
        let sql =  
            `SELECT user_id, username, firstname, lastname, email, address, phone, last_order, is_admin 
            FROM users 
            WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if (user.length === 0) {
                sendErrorStatus(res, 404, `User with the id ${req.params.id} doesn't exist`, "NOT_EXIST");
            } else {
                res.status(200).json(user[0]);
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    } else {
        sendErrorStatus(res, 403, "User not authorized to use this resource", "NO_AUTH"); 
    }
}

/*-----------------UPDATE A USER-----------------*/
exports.updateOne = (req,res) => {
    if(req.user[0].user_id == req.params.id){
        //check if is a valid email address with regulaar expressions
        if(req.body.email === undefined || validateEmail(req.body.email)){
            /*Search for the current user object*/
            let sql =  
                `SELECT username, firstname, lastname, email, address, phone, last_order, password, is_admin
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
                                    address     : req.body.address     !== undefined ? req.body.address     : current_user[0].address,
                                    phone      : req.body.phone      !== undefined ? req.body.phone      : current_user[0].phone,
                                    password   : req.body.password   !== undefined ? hash  : current_user[0].password,
                                    last_order : req.body.last_order !== undefined ? req.body.last_order : current_user[0].last_order,
                                    is_admin   : current_user[0].is_admin
                                };
                                let sql =  
                                    `UPDATE users SET username = :username, firstname = :firstname, lastname = :lastname, email = :email, address = :address, phone = :phone, password = :password, last_order = :last_order, is_admin = :is_admin
                                    WHERE user_id = :user_id`;
                                sequelize.query( sql, {
                                    replacements: changed_user
                                }).then(result => {
                                    delete changed_user.password;
                                    res.status(200).json(changed_user);
                                }).catch((err)=>{
                                    sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                                })           
                            }
                            //repetead username or email validation - only if new email or username info is sent
                            if(req.body.username !== undefined || req.body.email !== undefined){
                                let sql =  
                                    `SELECT username, firstname, lastname, email, address, phone, last_order, is_admin 
                                    FROM users 
                                    WHERE (username = ? OR email = ?) AND user_id != ?`;
                                sequelize.query( sql, {
                                    replacements: [req.body.username, req.body.email, req.params.id], type:sequelize.QueryTypes.SELECT
                                }).then(repeated_users => {
                                    //error message in case of repeated username or email
                                    if (repeated_users.length !== 0) {
                                        let email = false;
                                        let username = false;
                                        repeated_users.forEach(repeated_user => {
                                            username = (repeated_user.username === req.body.username ? true : username);
                                            email = ( repeated_user.email === req.body.email  ? true : email);
                                        })   
                                        sendErrorStatus(res, 400, `${email && username ? "Username and email" : (email ? "Email" : "Username")} already exists`, "REPEATED_DATA");
                                    //if not repeated update user
                                    } else {
                                        updateUser();
                                    }
                                }).catch((err)=>{
                                    sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                                })
                            } else {
                                //if not email or username info sent user updated without the extra query
                                updateUser();
                            }
                        });
                    });
                } else {
                    sendErrorStatus(res, 404, `User with the id ${req.params.id} doesn't exist in our database`, "NOT_EXIST");
                }
            }).catch((err)=>{
                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
            })
        } else {
            sendErrorStatus(res, 400, "Invalid email", "INVALID_EMAIL");
        }
    } else {
        sendErrorStatus(res, 403, "User not authorized to use this resource", "NO_AUTH");
    }
}

/*-----------------DELETE A USER-----------------*/
exports.deleteOne = (req, res) => {
    if(req.user[0].user_id == req.params.id || req.user[0].is_admin){

        let sql =  
            `DELETE FROM users 
            WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id]
        }).then(deleted_user => {
            if (deleted_user[0].affectedRows === 0){
                sendErrorStatus(res, 404, `User with id ${req.params.id} doesn't exist`, "NOT_EXIST");
            } else {
                res.status(200).json(`Successfully deleted user with the id: ${req.params.id}`);                
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    } else {
        sendErrorStatus(res, 403, "User not authorized to use this resource", "NO_AUTH");
    }
}

/*---------------------------------------------USER LOG IN--------------------------------------------*/
exports.login = (req,res) => {
    let missingInfo = [];
    req.body.username   !== undefined ? "" : missingInfo.push("username");
    req.body.email      !== undefined ? "" : missingInfo.push("email");
    req.body.password   !== undefined ? "" : missingInfo.push("password");

    if (missingInfo.length <= 1 && missingInfo[0] !== "password") {
        const jwtPass = reqs.jwtPass;
        let sql = `SELECT * FROM users `;
        sql += (req.body.username !== undefined && req.body.email !== undefined) ? 
            `WHERE (username = :username AND email = :email)` : 
            (req.body.username !== undefined) ?
            `WHERE (username = :username)` :
            `WHERE (email = :email)`;
        sequelize.query( sql, {
            replacements: {username : req.body.username , email: req.body.email}, type:sequelize.QueryTypes.SELECT
        }).then(result => {
            if(result.length !== 0){

                async function checkPass (){
                    const match = await reqs.bcrypt.compare(req.body.password, result[0].password);
                    /*error management*/
                    if (match){
                        /*token created and sent when correct data is given*/
                        let user_id = result[0].user_id;
                        const token = reqs.jwt.sign({
                            user_id,
                        }, jwtPass);
                        res.status(200).json({token: token, user_id: user_id});
                    } else {
                        sendErrorStatus(res, 401, "Incorrect user credentials", "INCORRECT_DATA");
                    }
                }
                checkPass();
            } else {
                sendErrorStatus(res, 404, "No user with these credentials", "NOT_EXIST");
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    } else {
        sendErrorStatus(res, 403, `Missing information: ${missingInfo.join(" - ")}`, "MISSING_DATA");
    }
}