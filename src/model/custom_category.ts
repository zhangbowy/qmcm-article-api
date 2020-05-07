import { think } from 'thinkjs';

export default class extends think.Model {
    get pk() {
        return 'custom_category_id';
    }
    get relation() {
        return {
            machine: {
                type: think.Model.HAS_MANY,
                Model: 'machine',
                fKey: 'custom_category_id',//machine表
                key: 'custom_category_id',//当前表
                field: 'custom_category_id,desc,machine_name,machine_code',
                where: { del: 0},
            },
        };
    }
}
