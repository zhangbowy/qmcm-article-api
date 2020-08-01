
import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface AddUserParams {
    name: string;
    phone: number;
    pwd: string;
}

export default class extends think.Model {
    get pk() {
        return 'order_item_id';
    }
    get relation() {
        return {
            design: {
                type: think.Model.HAS_ONE,
                Model: 'design',
                fKey: 'design_id', // machine表
                key: 'design_id', // 当前表
                // field: 'custom_category_id,desc,machine_name,machine_code',
                where: {del: 0},
            }
        };
    }
}
