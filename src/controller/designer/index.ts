
import Base from './base.js';
import {think} from "thinkjs";

export default class extends Base {
    async indexDataAction() {
        /**
         * 设计师信息
         */
        const designer_info = this.ctx.state.designer_info;
        const shop_id: number = designer_info.shop_id;
        const designer_id_own: number = designer_info.designer_id;
        const designer_team_id: number = designer_info.designer_team_id;
        const cash = await this.model('order').where({shop_id, designer_team_id, designer_status: ['IN', '2,3,4']}).sum('designer_price');
        const count = await this.model('order').where({shop_id, designer_team_id,  designer_status: ['IN', '2,3,4']}).count('designer_price');
        return this.success({cash, count}, '请求成功');
    }
}
