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
            const presell_goods: any[] = await this.model('item').order('sale_num DESC').where({shop_id, is_presell: 1, del: 0}).select();
            const hot_goods: any[] = await this.model('item').order('sale_num DESC').limit(8).where({shop_id, del: 0}).select();
            const hot_design: any[] = await this.model('design').order('created_at DESC').limit(9).where({shop_id, del: 0, status: 3}).select();
            const shop_setting = await this.model('shop_setting').field('about_us,notice').where({shop_id}).find();
            const design_category = await this.model('design_category').where({shop_id, del: 0}).select();
            // let region1: any[] = await this.model('region').field('id,pid,name,level,citycode as city_code,yzcode as yz_code').select();
            // let region = this.getTree(region1,0);
            const resObj: object = {
                slider,
                category,
                hot_goods,
                presell_goods,
                hot_design,
                design_category,
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
            return this.success(resObj, '首页轮播图、商品分类、花样分类、热门花样、热门商品、预售商品、公告!');
        } catch ($err) {
            this.dealErr($err);
        }
    }
    /**
     * 获取店铺设置
     */
    async aboutUsAction() {
        try {
            const shop_id: number = this.ctx.state.shop_id;
            const config_key = this.get('');
            const res: object = await this.model('shop_setting').field('about_us').where({shop_id}).find();
            this.success(res, '关于我们');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
