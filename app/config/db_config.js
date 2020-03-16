/*---------------------------------------------CONNECTION TO DB---------------------------------------------*/
const Sequelize   = require('sequelize');
const sequelize   = new Sequelize('mysql://root:@localhost:3306/delilah_resto2', {
    dialectOptions: {
        multipleStatements: true
      }
});
/*let   db          = {};

db.sequelize      = sequelize;
db.Sequelize      = Sequelize;*/

module.exports    = sequelize;