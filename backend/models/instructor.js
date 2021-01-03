'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Instructor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  // isInstructor field is a placeholder!
  Instructor.init({
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
    isInstructor: DataTypes.BOOLEAN,
    matches: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue('matches').split(';').filter(v=>v!='')
      },
      set(val) {
        this.setDataValue('matches',val.join(';'));
      },
    },
  }, {
    sequelize,
    modelName: 'Instructor',
    tableName: 'instructors'
  });
  return Instructor;
};