
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
        return 'item_price_template_id';
    }
    get relation() {
        return {
            item_price: {
                type: think.Model.HAS_MANY,
                Model: 'item_price',
                fKey: 'item_price_template_id', // machine表
                key: 'item_price_template_id', // 当前表
                // field: 'custom_category_id,desc,machine_name,machine_code',
                order: 'item_number ASC'
            }
        };
    }
}
