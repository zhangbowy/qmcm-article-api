import Base from './base.js';
export default class extends Base {
    /**
     * 用户列表
     */
    async userListAction(): Promise<void> {
        try {
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            // @ts-ignore
            const shop_id: number = this.ctx.state.admin_info.shop_id;
            const res = await this.model('user').where({shop_id}).page(page, limit).countSelect();
            return this.success(res, '会员列表!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
