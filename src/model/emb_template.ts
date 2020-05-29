import { think } from 'thinkjs';

export default class extends think.Model {
    get relation() {
        return {
            emb_template_price: {
                type: think.Model.HAS_MANY,
                // Model: 'emb_template',
                key: 'emb_template_id',
                fKey: 'emb_template_id',
                // field: 'shop_id,phone,name',
                // where: {role_type: ['NOTIN', '1'], del: 0},
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
