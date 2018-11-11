const Strategy = require('passport').Strategy;
const { Users } = require('../../../models');
const request = require('request-promise-native');

class LocalNaverStrategy extends Strategy {

  constructor() {
    super();
    this.name = 'local-naver';
  }

  async authenticate(req, options) {

    // Local Naver 확인
    const isLocalNaver = req.body.provider && req.body.provider === 'naver';
    if (isLocalNaver === false) return this.fail(400);

    // Naver일 경우 넘어온 토큰으로 확인

    // 토큰 데이터가 없음
    if (req.body.accessToken == null || req.body.accessToken === '') return this.fail(403, 'AccessToken이 옳바르지 않습니다');

    // 토큰 데이터를 Naver에 Request하여 NaverID 가져옴
    try {
      const { resultcode, response } = await request({
        method: 'GET',
        uri: 'https://openapi.naver.com/v1/nid/me',
        headers: {
          Authorization: `Bearer ${req.body.accessToken}`
        },
        json: true
      });

      // Naver ME Request 실패
      if (resultcode !== '00') return this.fail(403);

      // User 정보가 있는지 확인하고 없으면 가입 있으면 바로 로그인 처리
      let user = await Users.findOne({ where: { naverId: response.id, provider: 'Naver' } });
      if (user) return this.success(user);

      // 계정이 없을 경우 생성하여 로그인 성공 처리
      user = await Users.create({
        provider: 'Naver',
        naverId: response.id,
        nickname: response.nickname,
        profileImageUri: response.profile_image
      });
      if (user) return this.success(user);
    } catch (e) {
      this.fail()
    }

    this.fail()
  };

}


module.exports = LocalNaverStrategy;
