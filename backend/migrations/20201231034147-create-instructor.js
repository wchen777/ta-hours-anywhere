'use strict';

// is instructor field is a placeholder

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('instructors', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        username: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        imageUrl: Sequelize.STRING,
        isInstructor: Sequelize.BOOLEAN,
        matches: {
          type: Sequelize.STRING,
          allowNull: false,
          get() {
            return this.getDataValue('matches').split(';').filter(v=>v!='')
          },
          set(val) {
            this.setDataValue('matches',val.join(';'));
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('instructors');
  }
};