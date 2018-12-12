'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group',
    {
      paymentType: {
        type: DataTypes.ENUM('dutch', 'split'),
        defaultValue: 'split',
        allowNull: false
      },
      states: {
        type: DataTypes.ENUM('ongoing', 'payment-in-progress', 'archived'),
        defaultValue: 'ongoing',
        allowNull: false
      }
    }
  );

  Group.associate = function({ GroupPurchase, GroupMember, Table, Order }) {
    Group.belongsTo(Table, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    Group.hasMany(GroupPurchase);
    Group.hasMany(GroupMember);
    Group.hasMany(Order);
  };

  return Group;
};
