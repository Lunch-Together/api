const Strategy = require('passport').Strategy;
const { Users } = require('../../../models');
const request = require('request-promise-native');

class LocalKakaoStrategy extends Strategy {

  constructor() {
    super();
    this.name = 'local-kakao';
  }

  async authenticate(req, options) {

    // Local Kakao 확인
    const isLocalKakao = req.body.provider && req.body.provider === 'kakao';
    if (isLocalKakao === false) return this.fail(400);

    // Kakao일 경우 넘어온 토큰으로 확인

    // 토큰 데이터가 없음
    if (req.body.accessToken == null || req.body.accessToken === '') return this.fail(403, 'AccessToken이 옳바르지 않습니다');

    // 토큰 데이터를 Kakao에 Request하여 KakaoID 가져옴
    try {
      const response = await request({
        method: 'POST',
        uri: 'https://kapi.kakao.com/v2/user/me',
        body: {
          property_keys: ['kakao_account.email', 'properties.nickname', 'properties.profile_image', 'properties.thumbnail_image', 'kakao_account.email']
        },
        headers: {
          Authorization: `Bearer ${req.body.accessToken}`,
          'Content-Type': 'application/json'
        },
        json: true
      });

      // User 정보가 있는지 확인하고 없으면 가입 있으면 바로 로그인 처리
      let user = await Users.findOne({ where: { kakaoId: response.id, provider: 'Kakao' } });
      if (user) return this.success(user);

      // 계정이 없을 경우 생성하여 로그인 성공 처리
      user = await Users.create({
        provider: 'Kakao',
        kakaoId: response.id,
        nickname: response.properties.nickname,
        profileImageUri: response.properties.thumbnail_image
      });
      if (user) return this.success(user);
    } catch (e) {
      this.fail()
    }

    this.fail()
  };

}


module.exports = LocalKakaoStrategy;
