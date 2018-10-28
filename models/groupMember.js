'use strict';
module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define('GroupMember',
    {
      role: DataTypes.ENUM('leader', 'member')
    }
  );

  GroupMember.associate = function({ Group, User }) {
    GroupMember.belongsTo(Group, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    });
    GroupMember.belongsTo(User, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    })
  };

  return GroupMember;
};

