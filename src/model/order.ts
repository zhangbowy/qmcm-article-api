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
    get relation() {
        return {
            order_item: {
                type: think.Model.HAS_MANY,
                Model: 'order_item',
                fKey: 'order_id',
                key: 'id',
                // field: 'shop_id,phone,name',
                // where: {role_type: ['NOTIN', '1'], del: 0},
            },
            user: {
                type: think.Model.HAS_ONE,
                Model: 'user',
                fKey: 'id',
                key: 'user_id',
            },
            designer: {
                type: think.Model.HAS_ONE,
                Model: 'designer',
                fKey: 'designer_id',
                key: 'designer_id',
                field: 'designer_id,designer_team_id,designer_name,designer_phone,is_leader',
            },
        };
    }

}
