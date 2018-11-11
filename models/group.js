'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group',
    {
      paymentType: DataTypes.ENUM('dutch', 'split'),
      states: DataTypes.ENUM('ongoing', 'payment-in-progress', 'archived')
    }
  );

  Group.associate = function({ GroupMember, Table }) {
    Group.belongsTo(Table, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    Group.hasMany(GroupMember)
  };

  return Group;
};
