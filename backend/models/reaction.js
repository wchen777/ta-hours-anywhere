'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Instructor, User, Message }) {
      // define association here

      // refactor here
      this.belongsTo(Message, { foreignKey: 'messageId' })
      this.belongsTo(Instructor, { foreignKey: 'instructorId' })
      this.belongsTo(User, { foreignKey: 'userId' })
    }
  };
  Reaction.init({
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    instructorId: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'Reaction',
    tableName: 'reactions'
  });
  return Reaction;
};