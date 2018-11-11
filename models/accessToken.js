'use strict';
module.exports = (sequelize, DataTypes) => {
  const AccessToken = sequelize.define('AccessToken', {
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('Bearer'),
        defaultValue: 'Bearer',
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Expired')
      }
    }
  );

  AccessToken.associate = function({ User }) {
    AccessToken.belongsTo(User, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    })
  };

  return AccessToken;
};
