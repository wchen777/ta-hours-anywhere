'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };

  // add more fields here to user schema when needed!

  // username max len 20 chars
  // email max len 100 chars

  // if you change user schema, edit the migration accordingly and run
  // > sequelize db:migrate:undo 
  // to cancel the migration by undoing the latest migration, and then run 
  // > sequelize db:migrate 
  // to remigrate 

  User.init({
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'must be a valid email address',
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: DataTypes.STRING,
    matches: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue('matches').split(';')
      },
      set(val) {
        this.setDataValue('matches',val.join(';'));
      },
    },
    },
     {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};