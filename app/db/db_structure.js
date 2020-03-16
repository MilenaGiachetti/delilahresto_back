/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require('../config/db_config');


/*---------------------------------------------CREATE DATABASE and TABLES--------------------------------------------*/
let dbsql = [   
    `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`,
    `SET AUTOCOMMIT = 0;`,
    `START TRANSACTION;`,
    `SET time_zone = "+00:00";`,
    `DROP DATABASE IF EXISTS delilah_resto;`, 
    `DROP TABLE IF EXISTS delilah_resto.orders;`, 
    `DROP TABLE IF EXISTS delilah_resto.products;`,
    `DROP TABLE IF EXISTS delilah_resto.products_orders;`,
    `DROP TABLE IF EXISTS delilah_resto.users;`,
    `CREATE DATABASE delilah_resto;`, 
    `CREATE TABLE delilah_resto.orders (    
        order_id int(64) NOT NULL PRIMARY KEY AUTO_INCREMENT,   
        description varchar(64) NOT NULL,    
        payment enum('efectivo','credito','debito') NOT NULL,    
        order_state enum('nuevo','confirmado','preparando','enviando','entregado','cancelado') NOT NULL DEFAULT 'nuevo',    
        date date NOT NULL DEFAULT current_timestamp(),    
        hour time NOT NULL DEFAULT current_timestamp(),    
        total_price int(8) NOT NULL,    
        user_id int(64) NOT NULL  
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE delilah_resto.products (    
        product_id int(64) NOT NULL PRIMARY KEY AUTO_INCREMENT,    
        product_name varchar(64) NOT NULL UNIQUE KEY,    
        abbreviation varchar(8) NOT NULL UNIQUE KEY,     
        link_img varchar(1000) NOT NULL,    
        price int(8) NOT NULL  
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE delilah_resto.products_orders (
        order_id int(64) NOT NULL,
        product_id int(64) NOT NULL,
        product_quantity int(2) NOT NULL,
        user_id int(64) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE delilah_resto.users (
        user_id int(64) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        username varchar(64) NOT NULL UNIQUE KEY,
        firstname varchar(64) NOT NULL,
        lastname varchar(64) NOT NULL,
        email varchar(64) NOT NULL UNIQUE KEY,
        adress varchar(64) NOT NULL,
        phone int(16) NOT NULL,
        password varchar(64) NOT NULL,
        last_order int(64) NOT NULL,
        is_admin enum('FALSE','TRUE') NOT NULL DEFAULT 'FALSE'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
].join(' ');

sequelize.query( dbsql, {
    }).then(result => {
        console.log('Base de datos y estructura de tablas creada con éxito')
    }).catch((err)=>{
        console.log( 'Error: ' + err );
})





                        /*
let alterordersssql = `ALTER TABLE delilah_resto.orders
                    MODIFY order_id int(64) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;`;
let alterproductssql = `ALTER TABLE delilah_resto.products
                    MODIFY product_id int(64) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;`;
let alteruserssql = `ALTER TABLE delilah_resto.users
                    MODIFY user_id int(64) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;`;
*/
