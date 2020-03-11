/*---------------------------------------------CONNECTION TO DB---------------------------------------------*/
const Sequelize   = require('sequelize'),
      sequelize   = new Sequelize('mysql://root:@localhost:3306/delilah_resto2'),
      db          = {};

db.sequelize      = sequelize;
db.Sequelize      = Sequelize;

module.exports    = db;