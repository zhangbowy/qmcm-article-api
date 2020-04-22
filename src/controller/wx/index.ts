import Base from './base.js';
const path = require('path');
export default class extends Base {
    /**
     * 首页接口
     */
    async indexAction(): Promise<void> {
        let slider: any[] = await this.model('slider').order('sort DESC').select();
        let category: any[] = await this.model('item_category').where({parent_id:0,del:0}).select();
        let resObj:object = {
            slider,
            category
        };
        return this.success(resObj, '请求成功!');
    }
}
