import Base from './base.js';
const path = require('path');
export default class extends Base {
    /**
     * 首页轮播图
     */
    async indexAction(): Promise<void> {
        // let res1 = await this.model('slider').join({
        //     gallery_group: {
        //         on: ['id','id']
        //     }
        // }).select();
        let slider: any[] = await this.model('slider').order('sort DESC').select();
        let resObj:object = {
            slider
        }
        return this.success(resObj, '请求成功!');
    }
}
