import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../../model/user';
// @ts-ignore
import ThinkSvgCaptcha from 'think-svg-captcha';
import {think} from "thinkjs";

export default class extends Base {
    /**
     * 登录
     */
    async loginAction(): Promise<void> {
        try {
            // const Code = this.post('code');
            // if (think.isEmpty(Code)) {
            //     return  this.fail(-1, "验证码不能为空!");
            // }
            // let code = Code.toLowerCase();
            // let code_cookie = (await this.session('captcha') || '').toLowerCase();
            // if(code != code_cookie) {
            //     return  this.fail(-1, "验证码错误!");
            // }
            const designer_phone = this.post('phone');
            let designer_password = this.post('password');
            if (!designer_phone || !designer_phone) {
                return  this.fail(-1, "用户名或密码不能为空!", []);
            }
            designer_password = think.md5(designer_password);
            const res = await this.model('designer').where({designer_phone,designer_password}).find();
            if (!think.isEmpty(res)) {
                    if(res.status == 0) {
                        return  this.fail(-1, "该账号已禁用,请联系管理员!", []);
                    }
                    let tokenFuc =  think.service('token');
                    /**
                     * 生成token
                     */
                    let info = {
                        // exp: Math.floor(Date.now() / 1000) + (60 * 60),
                        designer_id:res.designer_id,
                    };
                    let token = await tokenFuc.create1(info);
                    await this.cache(`design-${res.designer_id}`, res, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000 * 6
                        }
                    });
                    // await this.cache(`design-sign-${res.designer_id}`, token, {
                    //     type: 'redis',
                    //     redis: {
                    //         // timeout: 24 * 60 * 60 * 1000
                    //         timeout:  60 * 60 * 1000
                    //     }
                    // });
                    return this.success({design_sign: token,designer_id:res.designer_id}, "登录成功!");
            } else {
                return  this.fail(-1, "用户名或密码错误!", []);
            }
        }catch ($err) {
            this.dealErr($err);
        }
    }
    async infoAction(): Promise<void> {
        try {
            const designer_info = this.ctx.state.designer_info;
            let shop_id = designer_info.shop_id;
            let designer_id = designer_info.designer_id;
            const res = await this.model("designer").field('designer_id,designer_team_id,designer_name,avatar_url,designer_phone,is_leader,default_password,created_at,updated_at').where({designer_id, shop_id, del:0}).find()
            return this.success(res, '请求成功!');
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 登出
     */
    async logoutAction(): Promise<any> {
        try {
            // @ts-ignore
            // await this.cache(`admin-${admin_info.id}`, null, 'redis');
            return this.success([], "登出成功!");
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * checkLogin
     */
    async checkLoginAction(): Promise<any>  {
        return this.success([], "已登录!");
    }

    /**
     * 验证码
     */
    async getCaptchaAction(): Promise<any>  {
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
    async editUserInfoAction() {

    }
}
