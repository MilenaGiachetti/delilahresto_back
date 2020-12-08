/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const reqs = require('../config/config');
const sequelize = require('../config/db_config');

/*-----------------JWT PASSWORD-----------------*/
const jwtPass = reqs.jwtPass;

/*---------------------------------------------MIDDLEWAREs--------------------------------------------*/
/*-----------------AUTHENTICATE A USER-----------------*/
exports.authenticateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        res.status(401).json(
            {"error": 
                {"status": "401",
                "message": "user validation error, log in to see this page"
                }
            }
        )
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = reqs.jwt.verify(token, jwtPass);
        let sql =  `SELECT * FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if(user === undefined  || !(user.length > 0)){
                res.status(401).json(
                    {"error": 
                        {"status": "401",
                        "message": "user validation error, log in to see this page"
                        }
                    }
                )
            } else {
                /*user data is sent to routes that use this middleware in the request. Way of access: For example, access to user first name req.user[0].firstname !remember: info is sent as an array*/
                req.user = user;
                next();
            }
        }).catch((err)=>{
            res.status(500).json(
                {"error": 
                    {"status": "500",
                    "message": "Internal Server Error: " + err
                    }
                }
            )
        })
    }
}
/*-----------------AUTHORIZATE A USER-----------------*/
exports.authorizateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        /*403 or 401? Beacause if theres no header there hasnt been a log in*/
        res.status(403).json(
            {"error": 
                {"status": "403",
                "message": "user not authorized to see this information"
                }
            }
        )
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = reqs.jwt.verify(token, jwtPass);
        let sql =  `SELECT * FROM users 
                    WHERE user_id = ? 
                    AND is_admin = 1`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            console.log(user);
            if(user === undefined  || !(user.length > 0)){
                res.status(403).json(
                    {"error": 
                        {"status": "403",
                        "message": "user not authorized to see this information"
                        }
                    }
                )
            } else{
                /*is given access to existent users that have ADMIN ROL*/
                next();
            }
        }).catch((err)=>{
            res.status(500).json(
                {"error": 
                    {"status": "500",
                    "message": "Internal Server Error: " + err
                    }
                }
            )
        })
    }
}
