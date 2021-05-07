'use strict';
const { Model } = require('sequelize');

/**
 * Course Model created through Sequelize CLI
 * 
 * Description: Creates a working model for the course data. This model will have various validations such as allowNull, notEmpty to stop missing data being submitted
*/
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Course.init({
    title: { 
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A title is required"
        },
        notEmpty: {
          msg: "Please provide a title"
        }
      }
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A description is required"
        }, 
        notEmpty: {
          msg: "Please provide a description"
        }
      }
    },
    estimatedTime: { 
      type: DataTypes.STRING,
    },
    materialsNeeded: { 
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Course',
  });

  /**
   * Association
   * 
   * Description: This association users the belongsTo association meaning, that THIS course can have one user. This is identified by the foriegnKey which is shared with the user model
   * @param {*} models 
   */
  Course.associate = (models) => {
    Course.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Course;
};