import Base from './base.js';
import UserModel from  './../model/user';
// @ts-ignore
import ThinkSvgCaptcha from 'think-svg-captcha';
import {think} from "thinkjs";

export default class extends Base {
    /**
     * 登录
     */
    async loginAction(): Promise<void> {
        try {
            const Code = this.post('code');
            if (think.isEmpty(Code)) {
                return  this.fail(-1, "验证码不能为空!");
            }
            let code = Code.toLowerCase();
            let code_cookie = (await this.session('captcha') || '').toLowerCase();
            // let code_cookie = this.cookie('captcha').toLowerCase();
            if(code != code_cookie) {
                return  this.fail(-1, "验证码错误!");
            }
            const phone = this.post('phone');
            const pwd = this.post('passWord');
            if (!phone || !pwd) {
                return  this.fail(-1, "用户名或密码不能为空!", []);
            }
            const res = await this.model('admin').where({phone}).find();
            if (!think.isEmpty(res)) {
                const bufferPwd = new Buffer(res.pwd, 'binary' ).toString('utf-8');
                if (pwd === bufferPwd) {
                    let tokenFuc =  think.service('token');
                    /**
                     * 生成token
                     */
                    let info = {
                        // exp: Math.floor(Date.now() / 1000) + (60 * 60),
                        admin_id:res.id,
                    };
                    let token = await tokenFuc.create1(info);

                    // // @ts-ignore
                    // const admin_redis_sign = await tokenFuc.parse1(await this.cache(`admin-sign-${res.id}`, undefined, 'redis'));
                    // // @ts-ignore
                    // // this.ctx.state.adm_sign = await this.cache(`admin-sign-${res.id}`, undefined, 'redis');
                    // this.ctx.state.adm_sign = admin_redis_sign.admin_id;
                    // if (!think.isEmpty(admin_redis_sign)) {
                    //     const orderController = this.controller('websocket');
                    //     // @ts-ignore
                    //     orderController.offlineAction();
                    // }
                    await this.cache(`admin-${res.id}`, res, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000 * 2
                        }
                    });
                    await this.cache(`admin-sign-${res.id}`, token, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000 * 2
                        }
                    });
                    // const ownAuth = await this.model('auth_give').where({admin_role_id:res.role_id}).select()
                    // const allAuth = await this.model('authority_category').select();
                    // let arr = [];
                    //
                    // for (let all_v of allAuth) {
                    //
                    // }
                    return this.success({token,adminId:res.id}, "登录成功!");
                }
                return  this.fail(-1, "用户名或密码错误!", []);
            }
            return  this.fail(-1, "用户名或密码错误!", []);
        }catch (e) {
            return  this.fail(-1, e.stack || e);
        }
    }
    async infoAction(): Promise<void> {
        const admin_info = this.ctx.state.admin_info;
        const shop_id = admin_info.shop_id;
        const admin_role_id = admin_info.role_id;
        let where = {};
        let res;
        if (admin_info.role_type == 2) {
           res = await this.model('authority').where({only_role_type:['in',[2,3]],is_show: 1,del: 0}).getField('id');
        } else if (admin_info.role_type == 3) {
             res = await this.model('auth_give').where({shop_id, admin_role_id: admin_role_id,del: 0}).getField('auth_id');
            // res = await this.model('authority').where({ id:['in',auth_list]}).getField('id');
        } else if (admin_info.role_type == 1) {
            res = await this.model('authority').where({only_role_type:['in',[1]],is_show: 1,del: 0}).getField('id');
        }
        // const res = await this.model('authority').where({auth_id:['in',auth_list]}).getField('id');
        // admin_role.authority_list = auth_list;
        const result = {
            admin_info:{
                id:admin_info.id,
                shop_id:admin_info.shop_id,
                role_type:admin_info.role_type,
                name:admin_info.name,
                phone:admin_info.phone
            },
            authority_list:res
        };
        return this.success(result, '请求成功!')
    }

    /**
     * 登出
     */
    async logOutAction(): Promise<void> {
        try {
            const admin_info = this.ctx.state.admin_info;
            // @ts-ignore
            // await this.cache(`admin-${admin_info.id}`, null, 'redis');
            return this.success([], "登出成功!");
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * checkLogin
     */
    async checkLoginAction() {
        return this.success([], "已登录!");
    }

    /**
     * 验证码
     */
    async getCaptchaAction(): Promise<void> {
        const defaultOptions = {
            size: 4, // size of random string
            ignoreChars: '', // filter out some characters
            noise: 1, // number of noise lines
            color: false, // default grey, true if background option is set
            background: '#ffffff', // background color of the svg image
            width: 150, // width of captcha
            height: 50, // height of captcha
            // fontPath: './fonts/Comismsh.ttf', // your font path
            fontSize: 60, // captcha text size
            charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' // random character preset
        };
        let captcha = new ThinkSvgCaptcha(defaultOptions);
        let c= captcha.create();
        await this.session('captcha',c.text);
        this.ctx.type = 'image/svg+xml';
        return this.ctx.body = c.data
        // captcha.svgCaptcha(text);
    }
}
