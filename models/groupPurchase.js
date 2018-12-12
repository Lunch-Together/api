'use strict';

module.exports = (sequelize, DataTypes) => {

  const GroupPurchase = sequelize.define('GroupPurchase', {
    price: DataTypes.INTEGER.UNSIGNED,
    states: {
      type: DataTypes.ENUM('before-purchased', 'purchased'),
      defaultValue: 'before-purchased',
      allowNull: false
    }
  });

  GroupPurchase.associate = function({ Group, User }) {
    GroupPurchase.belongsTo(Group, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });

    GroupPurchase.belongsTo(User, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    })
  };

  return GroupPurchase
};
