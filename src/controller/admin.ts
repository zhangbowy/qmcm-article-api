import Base from './base.js';
// tslint:disable-next-line:import-spacing
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
            let code_cookie = (await this.session('captcha')).toLowerCase();
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
                    await this.cache(`admin-${res.id}`, res, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000
                        }
                    });
                    await this.cache(`admin-sign-${res.id}`, token, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000
                        }
                    });
                    // await this.session('captcha',null);
                    // @ts-ignore
                    // await this.session('admin_sign', info);
                    // @ts-ignore
                    const admin_redis_sign = await tokenFuc.parse1(await this.cache(`admin-sign-${res.id}`, undefined, 'redis'));
                    if (!think.isEmpty(admin_redis_sign)) {
                        const orderController = this.controller('websocket');
                        // @ts-ignore
                        orderController.offlineAction();
                    }
                    return  this.success(token, "登录成功!");
                }
                return  this.fail(-1, "用户名或密码错误!", []);
            }
            return  this.fail(-1, "用户名或密码错误!", []);
        }catch (e) {
            return  this.fail(-1, e );
        }
    }
    async infoAction(): Promise<void> {
        const id: string = await  this.session('token');
        const res = await (this.model('user') as UserModel).getUserById(id);
        return this.success(res, '请求成功!');
    }

    /**
     * 登出
     */
    async logOutAction(): Promise<void> {
        const admin_info = this.ctx.state.admin_info;
        // @ts-ignore
        await this.cache(`admin-${admin_info.id}`, null, 'redis');
        return this.success([], "登出成功!");
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
