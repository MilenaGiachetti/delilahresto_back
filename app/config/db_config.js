/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const db_data = require('../config/db_connection_data');

/*---------------------------------------------CONNECTION TO DB---------------------------------------------*/
const Sequelize   = require('sequelize');
const sequelize   = new Sequelize( db_data.conf_db_name, db_data.conf_user, db_data.conf_password, { 
    host: 'localhost',
    dialect: 'mysql',
    port: db_data.conf_port,
    dialectOptions: {
        multipleStatements: true
    }
});

module.exports    = sequelize;