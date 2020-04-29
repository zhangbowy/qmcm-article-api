import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';
// @ts-ignore
import ThinkSvgCaptcha from 'think-svg-captcha';

export default class extends Base {
    /**
     * 登录
     */
    async loginAction(): Promise<void> {
        const phone = this.post('phone');
        const pwd = this.post('passWord');
        if (!phone || !pwd) {
           return  this.fail(-1, "用户名或密码不能为空!", []);
        }
        const res = await this.model('admin').where({phone}).find();
        if (!think.isEmpty(res)) {
            const bufferPwd = new Buffer(res.pwd, 'binary' ).toString('utf-8');
            if (pwd === bufferPwd) {
                await  this.session('token', res);
                return  this.success([], "登录成功!");
            }
            return  this.fail(-1, "用户名或密码错误!", []);
        }
        return  this.fail(-1, "用户名或密码错误!", []);
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
        await this.session('token', null);
        return this.success([], "登出成功!");
    }
    /**
     * checkLogin
     */
    async checkLoginAction() {
        return this.success([], "已登录!");
    }
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
            fontSize: 40, // captcha text size
            charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' // random character preset
        }
        let captcha = new ThinkSvgCaptcha(defaultOptions);

        let c= captcha.create();
        await this.cookie('captcha',c.text);
        this.ctx.type = 'image/svg+xml';
        return this.ctx.body = c.data
        // captcha.svgCaptcha(text);
    }

}
