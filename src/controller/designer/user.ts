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
            const phone_code = this.post('phone_captcha');
            if (!designer_phone || !designer_phone) {
                return  this.fail(-1, "用户名或密码不能为空!", []);
            }
            designer_password = think.md5(designer_password);
            const res = await this.model('designer').where({designer_phone}).find();
            if (!think.isEmpty(res)) {
                if ( res.designer_password == designer_password) {
                    if (res.is_active) {
                        if (res.status == 0) {
                            return  this.fail(-1, "该账号已禁用,请联系管理员!", []);
                        }
                        const tokenFuc =  think.service('token');
                        const info = {
                            // exp: Math.floor(Date.now() / 1000) + (60 * 60),
                            designer_id: res.designer_id,
                            loginTime: think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss')

                        };
                        const token = await tokenFuc.create1(info);
                        await this.cache(`design-${res.designer_id}`, res, {
                            type: 'redis',
                            redis: {
                                // timeout: 24 * 60 * 60 * 1000
                                timeout:  60 * 60 * 1000 * 6
                            }
                        });
                        await this.cache(`design-sign-${res.designer_id}`, token, {
                            type: 'redis',
                            redis: {
                                // timeout: 24 * 60 * 60 * 1000
                                timeout:  60 * 60 * 1000 * 6
                            }
                        });
                        await this.session('phone_captcha', '');
                        return this.success({design_sign: token, designer_id: res.designer_id}, "登录成功!");
                    } else {
                        if (think.isEmpty(phone_code)) {
                            return this.fail(10001, '账号未激活'); // code:10001 账号未激活
                        }
                        const captcha  = await this.session('phone_captcha');
                        if (phone_code == captcha) {
                            await this.model('designer').where({designer_phone}).update({is_active: 1});
                            await this.session('phone_captcha', '');
                            const tokenFuc =  think.service('token');
                            const info = {
                                // exp: Math.floor(Date.now() / 1000) + (60 * 60),
                                designer_id: res.designer_id,
                            };
                            const token = await tokenFuc.create1(info);
                            await this.cache(`design-${res.designer_id}`, res, {
                                type: 'redis',
                                redis: {
                                    // timeout: 24 * 60 * 60 * 1000
                                    timeout:  60 * 60 * 1000 * 6
                                }
                            });
                            return this.success({design_sign: token, designer_id: res.designer_id}, "登录成功!");
                        } else {
                            return this.fail(-1, '手机验证码错误');
                        }
                    }
                } else {
                    return  this.fail(-1, "用户名或密码错误!", []);
                }
            } else {
                return  this.fail(-1, "用户名或密码错误!", []);
            }
        } catch ($err) {
            this.dealErr($err);
        }
    }
    async infoAction(): Promise<void> {
        try {
            const designer_info = this.ctx.state.designer_info;
            const shop_id = designer_info.shop_id;
            const designer_id = designer_info.designer_id;
            const res = await this.model("designer").field('sex,birthday,designer_id,designer_team_id,designer_name,avatar_url,designer_phone,is_active,is_leader,default_password,alipay,wechat,bank_card_number,created_at,updated_at').where({designer_id, shop_id, del: 0}).find();
            return this.success(res, '设计师信息!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 登出
     */
    async logoutAction(): Promise<any> {
        try {
            // @ts-ignore
            return this.success([], "登出成功!");
        } catch ($err) {
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
        const captcha = new ThinkSvgCaptcha(defaultOptions);
        const c = captcha.create();
        await this.session('captcha', c.text);
        this.ctx.type = 'image/svg+xml';
        return this.ctx.body = c.data;
        // captcha.svgCaptcha(text);
    }
    async editUserInfoAction() {

    }

    /**
     * 发送验证码
     * @param {phone} 手机号
     * @return boolean
     */
    async sendSmsAction() {
        const sms = think.service('sms');
        const phone = this.post('phone');
        // @ts-ignore
        const phoneCaptchaTime = await this.cache(`design-${phone}-captcha-time`, undefined, 'redis');
        if (phoneCaptchaTime) {
            // return this.fail(-1, '一分钟之内不可再次发送');
            return this.fail(-1, '请稍后再试!');
        }
        const code = await getCode();
        const phone_code  = await this.session('phone_captcha');
        const res = await sms.sendMessage(phone, code);
        await this.session('phone_captcha', code);
        return this.success(res, '发送成功!');
    }

    /**
     * 保存用户信息
     * @param {alipay} 支付宝账号
     * @param {birthday} 生日
     * @param {sex} 性别
     * @param {bank_card_number} 银行卡
     * @param {designer_name} 设计师姓名
     * @param {avatar_url} 头像
     * @param {wechat} 微信账号
     * @return boolean
     */
    async saveInfoAction() {
        try {
            const designer_info = this.ctx.state.designer_info;
            const designer_team_id = designer_info.designer_team_id;
            const designer_id = designer_info.designer_id;

            const alipay = this.post('alipay');
            const birthday = this.post('birthday');
            const sex = this.post('sex');
            const bank_card_number = this.post('bank_card_number');
            const designer_name = this.post('designer_name');
            const avatar_url = this.post('avatar_url');
            const wechat = this.post('wechat');
            if (think.isEmpty(wechat) && think.isEmpty(bank_card_number) && think.isEmpty(alipay)) {
                return this.fail(-1, '请至少填写一个收款账号!');
            }
            const res = await this.model('designer').where({designer_team_id, designer_id}).update({
                alipay,
                bank_card_number,
                designer_name,
                avatar_url,
                wechat,
                birthday,
                sex
            });
            if (!res) {
                return this.fail(-1, '该设计师不存在');
            }
            return this.success([], '保存成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 修改密码
     * @param {old_password}
     * @param {new_password}
     * @return boolean
     */
    async  changePsdAction() {
        try {
            const designer_info = this.ctx.state.designer_info;
            const shop_id = designer_info.shop_id;
            const designer_team_id = designer_info.designer_team_id;
            const designer_id = designer_info.designer_id;
            const old_password = this.post('old_password');
            const new_password = this.post('new_password');
            const md5_old_psd = think.md5(old_password);
            const md5_new_psd = think.md5(new_password);
            const designer = await this.model('designer').where({designer_team_id, designer_id, shop_id}).find();
            if (think.isEmpty(designer)) {
                return  this.fail(-1, '该设计师不存在');
            }
            if (md5_old_psd != designer.designer_password) {
                return  this.fail(-1, '旧密码不正确!');
            }

            if (md5_new_psd == designer.designer_password) {
                return  this.fail(-1, '旧密码与新密码不能相同!');
            }

            const res = await this.model('designer').where({designer_team_id, designer_id, shop_id}).update({
                designer_password: md5_new_psd
            });
            // @ts-ignore
            await this.cache(`design-${designer_info.designer_id}`, null, 'redis');
            return this.success([], '修改成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
async function getCode() {
    const charactors = "1234567890";

    // tslint:disable-next-line:one-variable-per-declaration
    let value = '', i;

    for (let j = 1; j <= 4; j++) {

        i = parseInt(String(10 * Math.random()), 10);

        value = value + charactors.charAt(i);

    }
    return value;
}
