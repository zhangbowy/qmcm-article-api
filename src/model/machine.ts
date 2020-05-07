import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return 'machine_id';
    }
    // get relation() {
    //     return {
    //         custom_category: {
    //             type: think.Model.HAS_ONE,
    //             Model: 'custom_category',
    //             fKey: 'custom_category_id',//custom_category
    //             key: 'custom_category_id',//当前表
    //             // field: 'custom_category_id,custom_category_name',
    //             where: { del: 0},
    //         },
    //     };
    // }
    async getMachineById($id: string) {
        return await this.where({id: $id}).find();
    }
}
