'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group',
    {
      states: DataTypes.ENUM('ongoing', 'payment-in-progress', 'archived')
    }
  );

  Group.associate = function({ Table }) {
    Group.belongsTo(Table, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    })
  };

  return Group;
};
