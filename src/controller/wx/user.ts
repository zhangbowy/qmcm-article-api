import Base from './base.js';
import {think} from "thinkjs";
const path = require('path');
export default class extends Base {
    /**
     * 微信登录
     */
    async loginAction(): Promise<void> {
        const appid = this.config('wx').appid;
        const redirectUrl = "http://cxapi.tecqm.club/wx/user/auth";
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
        return this.success(url);
    }
    async authAction() {
        let code:string = this.get('code');
        if(!code) {
            return this.fail(-1., 'code不能为空')
        }
        const appid = this.config('wx').appid;
        const secret = this.config('wx').appSecret;
        /**
         * 通过code换取 access_token
         */
        let url =  `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

        const res = await this.fetch(url).then(res => res.json());
        if (res && res.errcode) {
           return  this.success(res)
        }
        /**
         * 拉取用户信息
         */
        let access_token = res.access_token;
        let openId = res.openid;
        let getInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
        let userInfo = await this.fetch(getInfoUrl).then(res => res.json());
        console.log(userInfo);
        let tokenFuc =  think.service('wx/token');
        let token = await tokenFuc.create1(userInfo);
        await this.cookie('token', token);
        this.success([],'登录成功')!
        // this.redirect(this.ctx.header['origin'])
    }
}
