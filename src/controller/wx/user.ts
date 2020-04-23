import Base from './base.js';
const path = require('path');
export default class extends Base {
    /**
     * 微信登录
     */
    async loginAction(): Promise<void> {

        let appid = 'wx8d8e2dd3ce250894'
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=http://www.baidu.com&response_type=code&scope=SCOPE&state=STATE#wechat_redirect`

        return this.redirect(url);
    }
}
