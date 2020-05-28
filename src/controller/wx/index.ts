import Base from './base.js';
const path = require('path');
export default class extends Base {
    /**
     * 首页接口
     * @return {slider,category}
     */
    async indexAction(): Promise<void> {
        try {
            const shop_id = this.ctx.state.shop_id;
            let slider: any[] = await this.model('slider').where({shop_id}).order('sort ASC').select();
            let category: any[] = await this.model('item_category').where({shop_id,parent_id:0,del:0}).select();
            let hot_goods: any[] = await this.model('item').order('sale_num DESC').limit(6).where({shop_id,del:0}).select();
            let hot_design: any[] = await this.model('design').order('created_at DESC').limit(10).where({shop_id,del:0}).select();
            // let region1: any[] = await this.model('region').field('id,pid,name,level,citycode as city_code,yzcode as yz_code').select();
            // let region = this.getTree(region1,0);
            let resObj:object = {
                slider,
                category,
                hot_goods,
                hot_design
                // region
            };
            return this.success(resObj, '请求成功!');
        }catch ($err) {
            this.dealErr($err);
        }
    }
}
