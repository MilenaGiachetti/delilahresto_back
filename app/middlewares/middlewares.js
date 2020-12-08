/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const reqs = require('../config/config');
const sequelize = require('../config/db_config');

/*-----------------JWT PASSWORD-----------------*/
const jwtPass = reqs.jwtPass;

const sendErrorStatus = (res, status, message, code) => {
    res.status(status).json({
        "error":{
            "status"  : status,
            "message" : message,
            "code"    : code
        }
    })
};

/*---------------------------------------------MIDDLEWAREs--------------------------------------------*/
/*-----------------AUTHENTICATE A USER-----------------*/
exports.authenticateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        sendErrorStatus(res, 401, "User validation error, log in to use this resource", "NO_AUTH");
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = reqs.jwt.verify(token, jwtPass);
        let sql =  `SELECT user_id, username, firstname, lastname, email, address, phone, last_order, is_admin FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if(user === undefined  || !(user.length > 0)){
                sendErrorStatus(res, 401, "User validation error, log in to use this resource", "NO_AUTH");
            } else {
                /*user data is sent to routes that use this middleware in the request. Way of access: For example, access to user first name req.user[0].firstname !remember: info is sent as an array*/
                req.user = user;
                next();
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    }
}
/*-----------------AUTHORIZATE A USER-----------------*/
exports.authorizateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        sendErrorStatus(res, 401, "User validation error, log in to use this resource", "NO_AUTH");
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = reqs.jwt.verify(token, jwtPass);
        let sql =  
            `SELECT * FROM users 
            WHERE user_id = ? 
            AND is_admin = 1`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if(user === undefined  || !(user.length > 0)){
                sendErrorStatus(res, 403, "User not authorized to use this resource", "NO_AUTH");
            } else{
                /*is given access to existent users that have ADMIN ROL*/
                req.user = user;
                next();
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    }
}
