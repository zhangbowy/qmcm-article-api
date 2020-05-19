import Base from './base.js';
import {think} from "thinkjs";
import {ancestorWhere} from "tslint";
const path = require('path');
export default class extends Base {
    /**
     * 微信登录
     */
    async loginAction(): Promise<void> {
        const appid = this.config('wx').appid;
        const redirectUrl = "http://cxapi.tecqm.club/wx/user/auth";
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
        return this.success(url);
    }
    async authAction() {
        let code:string = this.get('code');
        if(!code) {
            return this.fail(-1., 'code不能为空')
        };
        const appid = this.config('wx').appid;
        const secret = this.config('wx').appSecret;
        /**
         * 通过code换取 access_token
         */
        let url =  `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

        const res = await this.fetch(url).then(res => res.json());
        if (res && res.errcode) {
           return this.success(res)
        }
        let openId = res.openid;
        /**
         * 判断是否新用户
         */
         let info = await this.model('user').where({openid:openId}).find();
         let userInfo;
        /**
         * 老用户
         */
        if (Object.keys(info).length > 0) {
            let params: object = {
                nickname:info.nickname,
                sex:info.sex,
                province:info.province,
                city:info.city,
                country:info.country,
                headimgurl:info.headimgurl,
                openid:info.openid,
                id:info.id
            }
            userInfo = params
        } else {
            /**
             * 新用户 拉取用户信息
             */
            let access_token = res.access_token;
            let getInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
             userInfo = await this.fetch(getInfoUrl).then(res => res.json());
            let params: object = {
                nickname:userInfo.nickname,
                sex:userInfo.sex,
                province:userInfo.province,
                city:userInfo.city,
                country:userInfo.country,
                headimgurl:userInfo.headimgurl,
                openid:userInfo.openid
            }
            let id = await this.model('user').add(params);
            userInfo.id = id;
            console.log(userInfo);
        }
        let tokenFuc =  think.service('wx/token');
        /**
         * 生成token
         */
        let token = await tokenFuc.create1(userInfo);
        /**
         * 下发到cookies
         */
        await this.cookie('user_sign', token,{
            maxAge:1000*1000*1000*1000,
            expires:new Date().getTime() + 1000*1000*1000*1000
        });
        /**
         * 重定向到首页
         */
        this.redirect('http://cxgh.tecqm.club')
    }

    /**
     * 获取用户信息
     */
    async infoAction() {
        const userInfo = this.ctx.state.userInfo;
        const user_id = userInfo.id;
        let info = await this.model('user').where({id: user_id}).find();
        if(think.isEmpty(info)) {
            await this.cookie('user_sign', '');
            return this.fail(402,'未登录')
        }
        return this.success(this.ctx.state.userInfo,'请求成功!')
    }

    /**
     * 判断是否登录
     */
    async checkLoginAction() {
        return this.success([],'已登录')
    }

    /**
     * 开发的Dev
     */
    async loginDevAction() {
        const res = await this.model('user').where({id:92}).find();
        let params: object = {
            nickname:res.nickname,
            sex:res.sex,
            province:res.province,
            city:res.city,
            country:res.country,
            headimgurl:res.headimgurl,
            openid:res.openid,
            id:res.id
        }
        let tokenFuc =  think.service('wx/token');
        /**
         * 生成token
         */
        let token = await tokenFuc.create1(params);
        let Origin =this.ctx.req.headers.origin || this.ctx.req.headers.host;
        await this.cookie('user_sign', token,{
            maxAge:1000*1000*1000*1000,
            expires:new Date().getTime() + 1000*1000*1000*1000,
            // HttpOnly:false,
            // domain:'192.168.31.181'
        });

        return this.success('登录成功!')
    }

    /**
     * 收货地址
     */
    async addressAction() {
        try {
            /**
             * 店铺ID
             */
            let shop_id = this.ctx.state.shop_id;
            /**
             * 用户id
             */
            let id = this.ctx.state.userInfo.id;
            let res = await this.model('address').fieldReverse('id').order('is_default DESC').where({user_id: id,shop_id,del:0}).select();
            return this.success(res, '请求成功!');
        }catch ($err) {
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
            let shop_id = this.ctx.state.shop_id;
            let user_id = this.ctx.state.userInfo.id;
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
            let params: object = {
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
                await this.model('address').where({shop_id, user_id,is_default:1}).update({is_default:0})
            }
            let res = await this.model('address').add(params);
            if (res) {
               return this.success(res, '添加成功!');
            }
            return this.fail(-1, '添加失败!');
        }catch ($err) {
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
            let shop_id = this.ctx.state.shop_id;
            let user_id = this.ctx.state.userInfo.id;
            let address_id = this.post('address_id');
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
            let params: object = {
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
                await this.model('address').where({shop_id, user_id,is_default:1}).update({is_default:0})
            }
            let res: any = await this.model('address').where({ shop_id, user_id, address_id}).update(params);
            if (res) {
               return this.success(res, '编辑成功!');
            }
            return this.fail(-1, '编辑失败');
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 删除收货地址
     * @params {shop_id} 店铺Id
     * @params {user_id} 用户id
     * @params {address_id} 地址id
     */
    async delAddressAction() {
        try {
            const shop_id: number = this.ctx.state.shop_id;
            const user_id: number = this.ctx.state.userInfo.id;
            const address_id: number = this.post('address_id');
            const res: any = await this.model('address').where({shop_id, user_id, address_id,del: 0}).update({del:1});
            if (res) {
                return this.success(res, '删除成功!');
            }
            return this.fail(-1, '该地址不存在!');
        }catch ($err) {
            this.dealErr($err);
        }
    }
}
