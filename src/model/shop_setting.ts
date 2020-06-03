import { think } from 'thinkjs';

export default class extends think.Model {
    // @ts-ignore
    get relation() {
        // const shop_id1: number = think.ctx.state.admin_info.shop_id;
        return {
            emb_template_price: {
                type: think.Model.HAS_MANY,
                // Model: 'emb_template',
                key: 'emb_template_id',
                fKey: 'emb_template_id',
                // field: 'shop_id,phone,name',
                // where: {shop_id: shop_id1},
            },
        };
    }
   get pk() {
        return 'emb_template_id';
   }
    async getUserById($id: number) {
        return await this.where({id: $id}).find();
    }
}
