import Base from './base.js';
// tslint:disable-next-line:import-spacing
import UserModel from  './../model/user';

export default class extends Base {
    async indexAction(): Promise<void> {
        const page: number = this.get('page') || 1;
        const limit = this.get('limit') || 10;
        const error =  this.get('error') || "";
        // tslint:disable-next-line:no-console
        console.log(error, 'error');
        const offset = (page - 1) * 10;
        const res = await this.model('user').page(offset, limit).select();
        return this.success(res, '请求成功!');
    }
    async getUserAction(): Promise<void> {
        const id: number = 42;
        /**
         * 根据ID查用户
         */
        const res = await (this.model('user') as UserModel).getUserById(id);
        return this.success(res, '1');
    }
    /**
     * 登录
     */
    async loginAction(): Promise<void> {
        await this.session('token', 'zhangbo');
        this.success([], "登录成功!");
    }
    /**
     * 登出
     */
    async logOutAction(): Promise<void> {
        await this.session('token', null);
        this.success([], "登出成功!");
    }
}
