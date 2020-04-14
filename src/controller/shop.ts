import Base from './base.js';
export default class extends Base {
    async categoryAddAction() {
        const page: number = this.get('page') || 1;
        const limit = this.get('limit') || 10;
        const error =  this.get('error') || "";
        // tslint:disable-next-line:no-console
        console.log(error, 'error');
        const offset = (page - 1) * 10;
        const res = await this.model('j_log').where({error: ['like', '%' + error + '%']}).page(offset, limit).select();
        return this.success(res, '请求成功!');
    }
}
