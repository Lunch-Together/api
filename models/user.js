'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      avatarUrl: DataTypes.STRING,
      provider: {
        type: DataTypes.ENUM('local', 'kakao', 'facebook', 'google'),
        allowNull: false,
        defaultValue: 'local'
      }
    }
  );

  User.associate = function({ User }) {
  };

  return User;
};
