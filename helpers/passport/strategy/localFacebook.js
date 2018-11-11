const Strategy = require('passport').Strategy;
const { Users } = require('../../../models');
const request = require('request-promise-native');

class LocalFacebookStrategy extends Strategy {

  constructor() {
    super();
    this.name = 'local-facebook';
  }

  async authenticate(req, options) {

    // Local Facebook 확인
    const isLocalFacebook = req.body.provider && req.body.provider === 'facebook';
    if (isLocalFacebook === false) return this.fail(400);

    // 토큰 데이터가 없음
    if (req.body.accessToken == null || req.body.accessToken === '') return this.fail(403, 'AccessToken이 옳바르지 않습니다');

    // 토큰 데이터를 Facebook에 Request하여 FacebookID 가져옴
    try {
      const response = await request({
        method: 'GET',
        uri: 'https://graph.facebook.com/v3.1/me',
        qs: {
          access_token: req.body.accessToken,
          fields: 'name,id'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      });

      // User 정보가 있는지 확인하고 없으면 가입 있으면 바로 로그인 처리
      let user = await Users.findOne({ where: { facebookId: response.id, provider: 'Facebook' } });
      if (user) return this.success(user);

      // 계정이 없을 경우 생성하여 로그인 성공 처리
      user = await Users.create({
        provider: 'Facebook',
        facebookId: response.id,
        nickname: response.name
      });
      if (user) return this.success(user);
    } catch (e) {
      this.fail()
    }

    this.fail()
  };

}


module.exports = LocalFacebookStrategy;
