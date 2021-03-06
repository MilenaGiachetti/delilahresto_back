/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const db_data     = require('../config/db_connection_data');

const Sequelize   = require('sequelize');
const sequelize   = new Sequelize('', db_data.conf_user , db_data.conf_password, { 
    host: 'localhost',
    dialect: 'mysql',
    port: db_data.conf_port,
    dialectOptions: {
        multipleStatements: true
    }
});

/*---------------------------------------------CREATE DATABASE and TABLES--------------------------------------------*/
let dbsql = [   
    `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`,
    `SET AUTOCOMMIT = 0;`,
    `START TRANSACTION;`,
    `SET time_zone = "+00:00";`,
    `DROP DATABASE IF EXISTS ${db_data.conf_db_name};`, 
    `DROP TABLE IF EXISTS ${db_data.conf_db_name}.orders;`, 
    `DROP TABLE IF EXISTS ${db_data.conf_db_name}.products;`,
    `DROP TABLE IF EXISTS ${db_data.conf_db_name}.products_orders;`,
    `DROP TABLE IF EXISTS ${db_data.conf_db_name}.users;`,
    `CREATE DATABASE ${db_data.conf_db_name};`, 
    `CREATE TABLE ${db_data.conf_db_name}.orders (    
        order_id int(64) NOT NULL PRIMARY KEY AUTO_INCREMENT,   
        description varchar(64) NOT NULL,    
        payment int(1) NOT NULL,
        order_state int(1) NOT NULL DEFAULT 0,
        time timestamp NOT NULL DEFAULT current_timestamp(),      
        total_price int(8) NOT NULL,    
        user_id int(64) NOT NULL  
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE ${db_data.conf_db_name}.products (    
        product_id int(64) NOT NULL PRIMARY KEY AUTO_INCREMENT,    
        product_name varchar(64) NOT NULL UNIQUE KEY,    
        abbreviation varchar(8) NOT NULL UNIQUE KEY,     
        link_img varchar(1000) NOT NULL,    
        price int(8) NOT NULL  
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE ${db_data.conf_db_name}.products_orders (
        order_id int(64) NOT NULL,
        product_id int(64) NOT NULL,
        product_quantity int(2) NOT NULL,
        user_id int(64) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE ${db_data.conf_db_name}.users (
        user_id int(64) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        username varchar(64) NOT NULL UNIQUE KEY,
        firstname varchar(64) NOT NULL,
        lastname varchar(64) NOT NULL,
        email varchar(64) NOT NULL UNIQUE KEY,
        address varchar(64) NOT NULL,
        phone int(16) NOT NULL,
        password varchar(64) NOT NULL,
        last_order int(64) NOT NULL,
        is_admin tinyint(1) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
].join(' ');

sequelize.query( dbsql, {
    }).then(result => {
        console.log('Database & table structures successfully created')
    }).catch((err)=>{
        console.log( 'Error: ' + err );
})