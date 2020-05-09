import Base from './base.js';
export default class extends Base {
    /**
     * 用户列表
     */
    async userListAction(): Promise<void> {
        // @ts-ignore
        const shop_id: number = this.ctx.state.admin_info.shop_id;
        const res = await this.model('user').where({shop_id}).countSelect();
        this.success(res, '请求成功!');
    }
}
