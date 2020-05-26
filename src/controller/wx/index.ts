import Base from './base.js';
const path = require('path');
export default class extends Base {
    /**
     * 首页接口
     * @return {slider,category}
     */
    async indexAction(): Promise<void> {
        try {
            let slider: any[] = await this.model('slider').order('sort ASC').select();
            let category: any[] = await this.model('item_category').where({parent_id:0,del:0}).select();
            // let region1: any[] = await this.model('region').field('id,pid,name,level,citycode as city_code,yzcode as yz_code').select();
            // let region = this.getTree(region1,0);
            let resObj:object = {
                slider,
                category,
                // region
            };
            return this.success(resObj, '请求成功!');
        }catch ($err) {
            this.dealErr($err);
        }
    }
}
