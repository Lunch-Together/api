'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User',
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      nickname: DataTypes.STRING,
      avatarUrl: DataTypes.STRING,
      provider: DataTypes.ENUM('local', 'kakao', 'facebook', 'google')
    }
  );

  User.associate = function({ User }) {
  };

  return User;
};
