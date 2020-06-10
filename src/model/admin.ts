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
        return this.where({shop_id: $id, role_type: 2}).update($data);
    }
}
