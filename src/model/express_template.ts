import { think } from 'thinkjs';

export default class extends think.Model {
    async getList($data: any) {
        const page = $data.page || 1;
        const limit: number = $data.limit || 10;
        const res = await this.page(page, limit).fieldReverse('id,is_limit_area').where({del: 0, shop_id: $data.shop_id}).countSelect();
        // @ts-ignore
        for (const rule_val of res.data) {
            rule_val.region_rules = JSON.parse(rule_val.region_rules);
        }
        return res;
    }
    get pk() {
        return 'express_template_id';
    }
}
