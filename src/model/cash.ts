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
            designer: {
                name: 'payment',
                type: think.Model.HAS_ONE,
                Model: 'designer',
                fKey: 'designer_id',
                key: 'designer_id',//当前表
                field: 'designer_id,bank_card_number,alipay,wechat',
                where: { is_leader: 1},
            },
        };
    }
    get pk() {
        return 'cash_id';
    }
}
