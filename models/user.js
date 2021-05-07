'use strict';
const { Model } = require('sequelize');

const bcrypt = require("bcryptjs");

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
        set(val) {
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        }
        // len: {                               // Fix this, it doesn't seem to be working
        //   args: [10, 20],
        //   msg: "The password should be between 10 and 20 characters long"
        // }
      }
    } 
  }, {
    sequelize,
    modelName: 'User',
  });

  // Association
  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey: "userId" }); 
  };

  return User;
};