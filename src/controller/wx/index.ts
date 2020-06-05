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
            const slider: any[] = await this.model('slider').where({shop_id}).order('sort ASC').select();
            const category: any[] = await this.model('item_category').where({shop_id, parent_id: 0, del: 0}).select();
            const hot_goods: any[] = await this.model('item').order('sale_num DESC').limit(6).where({shop_id, del: 0}).select();
            const hot_design: any[] = await this.model('design').order('created_at DESC').limit(9).where({shop_id, del: 0, status: 3}).select();
            const shop_setting = await this.model('shop_setting').field('about_us,notice').where({shop_id}).find();

            // let region1: any[] = await this.model('region').field('id,pid,name,level,citycode as city_code,yzcode as yz_code').select();
            // let region = this.getTree(region1,0);
            const resObj: object = {
                slider,
                category,
                hot_goods,
                hot_design,
                notice: shop_setting.notice,
                // region
            };
            // this.ctx.set('Access-Control-Allow-Origin', this.ctx.header("origin") || "*");
            // let origin = this.header("origin");
            // this.ctx.set({
            //     "Access-Control-Allow-Origin": origin,
            //     "Access-Control-Allow-Headers": "x-requested-with,content-type",
            // });
            // return  this.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');
            // return  this.redirect('http://cxgh.tecqm.club/');
            return this.success(resObj, '请求成功!');
        } catch ($err) {
            this.dealErr($err);
        }
    }
}
