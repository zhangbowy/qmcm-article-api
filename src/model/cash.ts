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
            // designer: {
            //     type: think.Model.HAS_ONE,
            //     Model: 'designer',
            //     fKey: 'designer_id',
            //     key: 'designer_id',//当前表
            //     field: 'designer_id,bank_card_number,alipay,wechat',
            //     where: { is_leader: 1},
            // },
        };
    }
    get pk() {
        return 'cash_id';
    }
    async getUserById($id: number) {
        return await this.where({id: $id}).find();
    }
    async getUserByPhone($phone: number) {
        return await this.where({phone: $phone}).find();
    }
    async addAdmin($data: AddUserParams) {
        return await this.add($data);
    }
    async editAdmin($id: number, $data: AddUserParams) {
        return this.where({shop_id: $id}).update($data);
    }
}
