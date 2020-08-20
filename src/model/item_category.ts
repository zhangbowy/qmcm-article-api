import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface AddGoodsParams {
    name: string;
    category?: number;
    pwd: string;
    old_price: number;
    current_price: number;
    sum_stock: number;
    weight: number;
    min_buy: number;
    max_buy: number;
    sort?: number;
    images: string;
    sku_show?: any[];
    sku_list?: any[];
    detail?: string;
}
interface GoodsListParams {
    page?: number;
    limit?: number;
    shop_id: number;
}
export default class extends think.Model {
    async categoryList($data: GoodsListParams) {
        const page = $data.page || 1;
        const limit: number = $data.limit || 10;
        const offset: number = (page - 1) * limit;
        // @ts-ignore
        // return this.setRelation(false).fieldReverse('del').order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id}).page(page, limit).countSelect();
        return this.fieldReverse('del').order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id}).select();
        // return this.order({created_at: 'DESC'}).where({del: 0}).field('shop_id,shop_name,logo,system_end_time,created_at').page(page, limit).countSelect();
    }

    async addGoods($data: AddGoodsParams) {
        return await this.add($data);
    }
    // get relation() {
    //     return {
    //         sku_list: {
    //             type: think.Model.HAS_MANY,
    //             Model: 'shops',
    //             fKey: 'item_id',
    //             key: 'id',
    //             // field: 'shop_id,phone,name',
    //             // where: {role_type: ['NOTIN', '1'], del: 0},
    //         },
    //     };
    // }
    async getGoodById($id: number) {
        return this.where({id: $id}).find();
    }
    async deleteGoods($id: number) {
        return this.where({id: $id}).update({del: 1});
    }
    async editGoods($id: number, $data: any) {
        return this.where({id: $id}).update($data);
    }
    async getLevel($id: number) {
        const sql = `select getLevel(${$id})`
        const res =  await this.query(sql);
        const txt = `getLevel(${$id})`
        const result =  res[0][txt];
        return result

    }
    async  getChild($group_id: any) {
        if ($group_id == 0) {
            return  [0];
        }
        const res = await this.select();
        const hash = {};
        for (const item of res) {
            hash[item.id] = item.parent_id;
        }
        const bmid = $group_id;
        // console.log(hash,'hash');
        const pids = new Set([bmid]);
        const len = pids.size;
        do {

            for (const id in hash) {
                if (pids.has(hash[id])) {
                    pids.add(Number(id));
                    delete hash[id];
                }
            }
        } while (pids.size > len);
        return Array.from(pids);
    }

}
