import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return 'auth_id';
    }
    // get relation() {
    //     return {
    //         authority: {
    //             type: think.Model.HAS_MANY,
    //             fKey: 'cate_id',
    //             key: 'cate_id',//当前表
    //
    //         }
    //     }
    // }
    // get relation() {
    //     return {
    //         machine: {
    //             type: think.Model.HAS_MANY,
    //             Model: 'machine',
    //             fKey: 'custom_category_id',//machine表
    //             key: 'custom_category_id',//当前表
    //             field: 'custom_category_id,desc,machine_name,machine_code',
    //             where: { del: 0},
    //         },
    //     };
    // }
}
