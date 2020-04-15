import Base from './base.js';
export default class extends Base {
    /**
     * 机器列表
     */
    async listAction() {
        return this.success({});
    }
    /**
     * 添加机器
     */
    async addMechineAction() {

    }
    /**
     * 编辑机器
     */
    async editMechineAction() {

    }
    /**
     * 删除机器
     */
    async delMechineAction() {

    }
    async categoryAddAction() {
        const page: number = this.get('page') || 1;
        const limit = this.get('limit') || 10;
        const error =  this.get('error') || "";
        // tslint:disable-next-line:no-console
        console.log(error, 'error');
        const offset = (page - 1) * 10;
        // tslint:disable-next-line:max-line-length
        // const res = await this.model('j_log').where({error: ['like', '%' + error + '%']}).page(offset, limit).select();
        return this.success({}, '请求成功!');
    }
}
