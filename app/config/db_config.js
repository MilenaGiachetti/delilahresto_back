/*---------------------------------------------CONNECTION TO DB---------------------------------------------*/
const Sequelize   = require('sequelize');
const sequelize   = new Sequelize('mysql://root:@localhost:3306/delilah_resto', {
    dialectOptions: {
        multipleStatements: true
      }
});

module.exports    = sequelize;