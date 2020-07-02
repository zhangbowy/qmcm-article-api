import Base from './base.js';
import {think} from "thinkjs";
import {ancestorWhere} from "tslint";
const path = require('path');
export default class extends Base {
    /**
     * 微信登录
     * @return {authUrl}
     */
    async loginAction(): Promise<void> {
        const appid = this.config('shopConfig').appid;
        const returnUrl: any = this.ctx.req.headers.host;
        const returnApi = returnUrl + '/api/wx/user/auth';
        const params: any = {
            returnUrl,
            returnApi
        };
        const str = `returnUrl=${returnUrl}&returnApi=${returnApi}`;
        const redirectUrl = "http://cxmob.tecqm.club/api/wx/user/notify";
        const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=${returnApi}#wechat_redirect`;
        return this.success(url);
    }

    /**
     * 中间跳转域名
     */
    async notifyAction() {
        const code: string = this.get('code');
        const state1: any = this.get('state');
        this.redirect(`http://${state1}?code=${code}&state=${state1}`);
    }

    /**
     * 登录授权回调接口
     * @tip 当用户确认授权后 微信带着code回调的接口
     * @return 302 重定向
     */
    async authAction() {
        try {
            const code: string = this.get('code');
            if (!code) {
                return this.fail(-1., 'code不能为空');
            }
            const shop_id = this.ctx.state.shop_id;
            const appid = this.config('shopConfig').appid;
            const secret = this.config('shopConfig').appsecret;
            /**
             * 通过code换取 access_token
             */
            const url =  `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

            const res = await this.fetch(url).then(($res) => $res.json());
            console.log(res, 'access_token')
            if (res && res.errcode) {
                return this.success(res);
            }
            const openId = res.openid;
            /**
             * 判断是否新用户
             */
            const info = await this.model('user').where({shop_id, openid: openId}).find();
            let userInfo;
            /**
             * 老用户
             */
            if (Object.keys(info).length > 0) {
                const params: object = {
                    nickname: info.nickname,
                    sex: info.sex,
                    province: info.province,
                    city: info.city,
                    country: info.country,
                    headimgurl: info.headimgurl,
                    openid: info.openid,
                    id: info.id
                };
                userInfo = params;
            } else {
                /**
                 * 新用户 拉取用户信息
                 */
                const access_token = res.access_token;
                const getInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
                userInfo = await this.fetch(getInfoUrl).then(($res) => $res.json());
                const params: object = {
                    nickname: userInfo.nickname,
                    sex: userInfo.sex,
                    province: userInfo.province,
                    city: userInfo.city,
                    country: userInfo.country,
                    headimgurl: userInfo.headimgurl,
                    openid: userInfo.openid,
                    shop_id
                };
                const id = await this.model('user').add(params);
                userInfo.id = id;
                console.log(userInfo);
            }
            const tokenFuc =  think.service('wx/token');
            /**
             * 生成token
             */
            const token = await tokenFuc.create1(userInfo);
            /**
             * 下发到cookies
             */
            await this.cookie('user_sign', token, {
                maxAge: 1000 * 1000 * 1000 * 1000,
                expires: new Date().getTime() + 1000 * 1000 * 1000 * 1000
            });
            console.log(userInfo, 'auth');
            const urls = `http://${this.ctx.req.headers.host}`;
            /**
             * 重定向到首页
             */
            this.redirect(urls);
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 获取用户信息
     * @return userInfo
     */
    async infoAction() {
        try {
            const userInfo = this.ctx.state.userInfo;
            const shop_id = this.ctx.state.shop_id;
            const openid = userInfo.openid;
            const id = userInfo.id;
            const info = await this.model('user').where({shop_id, openid, id}).find();
            if (think.isEmpty(info)) {
                await this.cookie('user_sign', '');
                return this.fail(402, '未登录');
            }
            return this.success(this.ctx.state.userInfo, '请求成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 判断是否登录
     */
    async checkLoginAction() {
        try {
            const userInfo = this.ctx.state.userInfo;
            const openid = userInfo.openid;
            const shop_id = this.ctx.state.shop_id;
            const id = userInfo.id;
            if (think.isEmpty(openid) || think.isEmpty(id)) {
                await this.cookie('user_sign', '');
                return this.fail(402, '未登录');
            }
            const info = await this.model('user').where({shop_id, id, openid}).find();
            if (think.isEmpty(info)) {
                await this.cookie('user_sign', '');
                return this.fail(402, '未登录');
            }
            return this.success([], '已登录');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 开发的Dev
     */
    async loginDevAction() {
        const res = await this.model('user').find();
        const params: object = {
            nickname: res.nickname,
            sex: res.sex,
            province: res.province,
            city: res.city,
            country: res.country,
            headimgurl: res.headimgurl,
            openid: res.openid,
            id: res.id
        };
        const tokenFuc =  think.service('wx/token');
        /**
         * 生成token
         */
        const token = await tokenFuc.create1(params);
        const Origin = this.ctx.req.headers.origin || this.ctx.req.headers.host;
        await this.cookie('user_sign', token, {
            maxAge: 1000 * 1000 * 1000 * 1000,
            expires: new Date().getTime() + 1000 * 1000 * 1000 * 1000,
            // HttpOnly:false,
            // domain:'192.168.31.181'
        });
        return this.success('登录成功!');
    }

    /**
     * 收货地址
     * @return ARRAY<object> of addressList
     */
    async addressAction() {
        try {
            /**
             * 店铺ID
             */
            const shop_id = this.ctx.state.shop_id;
            /**
             * 用户id
             */
            const id = this.ctx.state.userInfo.id;
            const res = await this.model('address').fieldReverse('id').order('is_default DESC').where({user_id: id, shop_id, del: 0}).select();
            return this.success(res, '请求成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 添加收货地址
     * @params {shop_id} 店铺id
     * @params {user_id} 用户id
     * @params {name} 收货人姓名
     * @params {phone} 手机号
     * @params {province} 省份
     * @params {province_code} 省份代码
     * @params {city} 城市
     * @params {city_code} 城市代码
     * @params {area} 区/县
     * @params {area_code} 区县代码
     * @params {address} 地址
     * @params {is_default}? 是否默认
     * @params {post_code}? 邮政编码
     */
    async addAddressAction() {
        try {
            const shop_id = this.ctx.state.shop_id;
            const user_id = this.ctx.state.userInfo.id;
            const name = this.post('name');
            const phone = this.post('phone');
            const province = this.post('province');
            const province_code = this.post('province_code');
            const city = this.post('city');
            const city_code = this.post('city_code');
            const area = this.post('area');
            const area_code = this.post('area_code');
            const address = this.post('address');
            const is_default = this.post('is_default') || 0;
            const post_code = this.post('post_code');
            const params: object = {
                shop_id,
                user_id,
                name,
                phone,
                province,
                province_code,
                city,
                city_code,
                area,
                area_code,
                address,
                is_default,
                post_code
            };
            if (is_default) {
                await this.model('address').where({shop_id, user_id, is_default: 1}).update({is_default: 0});
            }
            const res: any = await this.model('address').add(params);
            if (res) {
               return this.success(res, '添加成功!');
            }
            return this.fail(-1, '添加失败!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 编辑收货地址
     * @params {shop_id} 店铺id
     * @params {user_id} 用户id
     * @params {name} 收货人姓名
     * @params {phone} 手机号
     * @params {province} 省份
     * @params {province_code} 省份代码
     * @params {city} 城市
     * @params {city_code} 城市代码
     * @params {area} 区/县
     * @params {area_code} 区县代码
     * @params {address} 地址
     * @params {is_default}? 是否默认
     */
    async editAddressAction() {
        try {
            const shop_id = this.ctx.state.shop_id;
            const user_id = this.ctx.state.userInfo.id;
            const address_id = this.post('address_id');
            const name = this.post('name');
            const phone = this.post('phone');
            const province = this.post('province');
            const province_code = this.post('province_code');
            const city = this.post('city');
            const city_code = this.post('city_code');
            const area = this.post('area');
            const area_code = this.post('area_code');
            const address = this.post('address');
            const is_default = this.post('is_default') || 0;
            const post_code = this.post('post_code');
            const params: object = {
                name,
                phone,
                province,
                province_code,
                city,
                city_code,
                area,
                area_code,
                address,
                is_default,
                post_code
            };
            /**
             * 如果默认先把全部是1的 置为0
             */
            if (is_default) {
                await this.model('address').where({shop_id, user_id, is_default: 1}).update({is_default: 0});
            }
            const res: any = await this.model('address').where({ shop_id, user_id, address_id}).update(params);
            if (res) {
               return this.success(res, '编辑成功!');
            }
            return this.fail(-1, '编辑失败');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 删除收货地址
     * @params {shop_id} 店铺Id
     * @params {user_id} 用户id
     * @params {address_id} 地址id
     * @return boolean
     */
    async delAddressAction() {
        try {
            const shop_id: number = this.ctx.state.shop_id;
            const user_id: number = this.ctx.state.userInfo.id;
            const address_id: number = this.post('address_id');
            const res: any = await this.model('address').where({shop_id, user_id, address_id, del: 0}).update({del: 1});
            if (res) {
                return this.success(res, '删除成功!');
            }
            return this.fail(-1, '该地址不存在!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 删除收货地址
     * @return boolean
     */
    async getJsConfigAction() {
        try {
            const shop_id: number = this.ctx.state.shop_id;
            const shopConfig = await think.model('shop_setting').where({shop_id}).find();
            const url = this.post('url') || 'http://cxgh.tecqm.club';
            const jsTicket =  think.service('wx/jsTicket');
            const res = await jsTicket.getJsSign(url, shopConfig);
            return this.json(res);
        } catch (e) {
            this.dealErr(e);
        }
    }
}
