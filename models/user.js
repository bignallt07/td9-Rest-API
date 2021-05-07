'use strict';
const { Model } = require('sequelize');

const bcrypt = require("bcryptjs");

/**
 * User Model created through Sequelize CLI
 * 
 * Description: Creates a working model for the user data. This model will have various validations such as allowNull, notEmpty, Unique and isEmail
 */

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
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A first name is required"
        }, 
        notEmpty: {
          msg: "Please provide a first name"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A last name is required"
        },
        notEmpty: {
          msg: "Please provide a last name"
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "The email entered already exists, please try again"
      },
      validate: {
        notNull: {
          msg: "An email is required"
        },
        isEmail: {
          msg: "Please provide a valid email"
        } 
      }
    }, 
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A password is required"
        },
        notEmpty: {
          msg: "Please provide a password name"
        }, 
        /* Developer Note:
        This following method sets the value of the password sent on the request to a hashed password
        This is set to 10 salt rounds.
        */
        set(val) {
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        }
      }
    } 
  }, {
    sequelize,
    modelName: 'User',
  });

  /**
   * Association
   * 
   * Description: This association users the hasMany association meaning, that THIS user can have many courses. This is identified by the foriegnKey.
   * @param {*} models 
   */
  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey: "userId" }); 
  };

  return User;
};