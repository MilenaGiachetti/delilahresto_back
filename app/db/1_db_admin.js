/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require('../config/db_config');

/*---------------------------------------------CREATE ADMINS USERS--------------------------------------------*/
let dbsql = [ 
    `TRUNCATE delilah_resto.users;`,
    `INSERT INTO delilah_resto.users 
        (user_id, username, firstname, lastname, email, adress, phone, password, last_order, is_admin) VALUES
        (1, 'HelianaMHenriquez', 'Heliena ', 'Méndez Henríquez', 'hmendezhenriquez@delilah.resto', 'Sucursal Caballito', 1544668792, '$2b$10$CI0QE/uIGLm.kFV1ut2tTOWSE30OjjDaZ2GgObiug.H6i03MkY21i', 0, 'TRUE'),
        (2, 'CarlosArroyo', 'Carlos', 'Arroyo', 'carroyo@delilah.resto', 'Sucursal Caballito', 1588925548, '$2b$10$529CbbZZuMAeHCD7yUuF4uAAdu8gIDXCkKS0R/CnWUkskonUcyM0i', 0, 'TRUE');`,
        //"password": "HelianaPass"
        //"password": "CarlosArroyoPass"
    `ALTER TABLE delilah_resto.users
        MODIFY user_id int(64) NOT NULL, AUTO_INCREMENT=3;`
].join(' ');

sequelize.query( dbsql, {
    }).then(result => {
        console.log('Admins creados con éxito')
    }).catch((err)=>{
        console.log( 'Error: ' + err );
})