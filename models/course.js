'use strict';
const { Model } = require('sequelize');

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

  // Not sure if this is set up correctly.
  // Association 
  Course.associate = (models) => {
    Course.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Course;
};