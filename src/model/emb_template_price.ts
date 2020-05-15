import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return ''
    }
    // get relation() {
    //     return {
    //         emb_template_price: {
    //             type: think.Model.HAS_MANY,
    //             // Model: 'emb_template',
    //             key: 'id',
    //             fKey: 'template_id',
    //             // field: 'shop_id,phone,name',
    //             // where: {role_type: ['NOTIN', '1'], del: 0},
    //         },
    //     };
    // }
    // async getUserById($id: number) {
    //     return await this.where({id: $id}).find();
    // }
}
