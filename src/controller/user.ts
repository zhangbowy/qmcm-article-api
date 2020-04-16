import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';
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
        this.success([], "登出成功!");
    }
    /**
     * checkLogin
     */
    async checkLoginAction(): Promise<void> {
        a=b
        this.success(think.datetime(new Date().getTime(), 'YYYY-MM-DD'), "已登录!");
    }
}
