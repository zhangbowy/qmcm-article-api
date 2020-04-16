import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface AddSkutParams {
    shop_id: number;
    item_id?: number;
    current_price: number;
    num: number;
    weight: number;

}
interface GoodsListParams {
    page?: number;
    limit?: number;
    shop_id: number;
}
export default class extends think.Model {
    async addSku($data: any) {
        this.addMany($data);
    }
}
