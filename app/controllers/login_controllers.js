/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const reqs = require('../config/config');
const db = require('../config/db_config');

/*---------------------------------------------USER LOG IN--------------------------------------------*/
exports.login = (req,res) => {
    const jwtPass = reqs.jwtPass;
    let sql =  `SELECT * FROM users 
                WHERE (username = :username OR email = :email) 
                AND password = :password`;
    db.sequelize.query( sql, {
        replacements: {username : req.body.username , email: req.body.username,password : req.body.password}, type:sequelize.QueryTypes.SELECT
    }).then(result => {
        /*error management*/
        if(result === undefined  || !(result.length > 0)){
            res.status(401).send('Error: Datos incorrectos');
        } else{
            /*token created and sent when correct data is given*/
            let user_id = result[0].user_id;
            console.log(result);
            const token = reqs.jwt.sign({
                user_id,
            }, jwtPass);
            res.json({token: token, user_id: user_id});
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
}
