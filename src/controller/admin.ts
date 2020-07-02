import Base from './base.js';
// @ts-ignore
import ThinkSvgCaptcha from 'think-svg-captcha';
import {think} from "thinkjs";

export default class extends Base {
    /**
     * 登录
     * @param {phone} 手机号
     * @param {password} 密码
     * @param {code} 验证码
     */
    async loginAction(): Promise<void> {
        try {
            const Code = this.post('code');
            if (think.isEmpty(Code)) {
                return  this.fail(-1, "验证码不能为空!");
            }
            const code = Code.toLowerCase();
            const code_cookie = (await this.session('captcha') || '').toLowerCase();
            if (code != code_cookie) {
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
                    // 判断店铺过期
                    const now = new Date().getTime();
                    const shop_info = await this.model('shops').where({del: 0, shop_id: res.shop_id}).find();
                    if (think.isEmpty(shop_info)) {
                        return this.fail(-1, '店铺不存在!');
                    }
                    const endTime = new Date(shop_info.system_end_time).getTime();
                    if (now > endTime) {
                        return this.fail(-1, '店铺已过期,请联系平台!');
                    }

                    const tokenFuc =  think.service('token');
                    /**
                     * 生成token
                     */
                    const info = {
                        // exp: Math.floor(Date.now() / 1000) + (60 * 60),
                        admin_id: res.id,
                        loginTime: think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss')
                    };
                    const token = await tokenFuc.create1(info);
                    await this.cache(`admin-${res.id}`, res, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000 * 6
                        }
                    });
                    await this.cache(`admin-sign-${res.id}`, token, {
                        type: 'redis',
                        redis: {
                            // timeout: 24 * 60 * 60 * 1000
                            timeout:  60 * 60 * 1000 * 6
                        }
                    });
                    return this.success({token, adminId: res.id}, "登录成功!");
                }
                return  this.fail(-1, "用户名或密码错误!", []);
            }
            return  this.fail(-1, "用户名或密码错误!", []);
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 用户信息
     */
    async infoAction(): Promise<void> {
        try {
            const admin_info = this.ctx.state.admin_info;
            const shop_id = admin_info.shop_id;
            const admin_role_id = admin_info.role_id;
            const where = {};
            let authority_list;
            if (admin_info.role_type == 2) {
                authority_list = await this.model('authority').where({only_role_type: ['in', [2, 3, 0]], is_show: 1, del: 0}).getField('id');
            } else if (admin_info.role_type == 3) {
                authority_list = await this.model('auth_give').where({shop_id, admin_role_id, del: 0}).getField('auth_id');
            } else if (admin_info.role_type == 1) {
                authority_list = await this.model('authority').where({only_role_type: ['in', [1, 0]], is_show: 1, del: 0}).getField('id');
            }

            const shop_info = await this.model('shops').setRelation(false).where({shop_id: admin_info.shop_id}).fieldReverse('domain,shop_setting,del,id').find();

            const result = {
                admin_info: {
                    id: admin_info.id,
                    shop_id: admin_info.shop_id,
                    role_type: admin_info.role_type,
                    name: admin_info.name,
                    phone: admin_info.phone,
                    ...shop_info,
                },
                authority_list
            };

            return this.success(result, '请求成功!');
        } catch (e) {
            this.dealErr(e);
        }
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
        } catch (e) {
            this.dealErr(e);
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
     * @param {phone} 手机号
     * @return {验证码图片}
     */
    async getCaptchaAction(): Promise<void> {

        const defaultOptions = {
            size: 4, // size of random string
            ignoreChars: '', // filter out some characters
            noise: 1, // number of noise lines
            color: false, // default grey, true if background option is set
            background: '#ffffff', // background color of the svg image
            width: 120, // width of captcha
            height: 40, // height of captcha
            // fontPath: './fonts/Comismsh.ttf', // your font path
            fontSize: 60, // captcha text size
            charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' // random character preset
        };
        const captcha = new ThinkSvgCaptcha(defaultOptions);
        const c = captcha.create();
        await this.session('captcha', c.text);
        this.ctx.type = 'image/svg+xml';
        return this.ctx.body = c.data;
    }

    /**
     * 修改密码
     * @param {old_password}
     * @param {new_password}
     * @return boolean
     */
    async  changePsdAction() {
        try {
            const admin_info = this.ctx.state.admin_info;
            const shop_id = admin_info.shop_id;
            const phone = admin_info.phone;
            const id = admin_info.id;
            const old_password = this.post('old_password');
            const new_password = this.post('new_password');
            const md5_old_psd = think.md5(old_password);
            const md5_new_psd = think.md5(new_password);
            const admin = await this.model('admin').where({shop_id, phone, id}).find();
            if (think.isEmpty(admin)) {
                return  this.fail(-1, '该用户不存在');
            }

            if (admin.role_type == 3) {
                return  this.fail(-1, '您没有此项权限!');
            }
            const bufferPwd = new Buffer(admin.pwd, 'binary' ).toString('utf-8');
            if (old_password != bufferPwd) {
                return  this.fail(-1, '旧密码不正确!');
            }

            if (new_password == bufferPwd) {
                return  this.fail(-1, '旧密码与新密码不能相同!');
            }
            const pwd = new Buffer(new_password, 'utf-8' );
            const res = await this.model('admin').where({id, phone, shop_id}).update({
                pwd
            });
            // @ts-ignore
            await this.cache(`admin-${admin.id}`, null, 'redis');
            return this.success([], '修改成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
