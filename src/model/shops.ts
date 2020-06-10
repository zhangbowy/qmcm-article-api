import { think } from 'thinkjs';

interface AddShopParams {
    shop_name: string;
    desc: string;
    logo: string;
    system_end_time?: string;
    created_at?: string;
}

interface ShopListParams {
    page?: number;
    limit?: number;
    shop_name?: string;
}
export default class extends think.Model {
    get relation() {
        return {
            admin: {
                type: think.Model.HAS_ONE,
                Model: 'shops',
                fKey: 'shop_id',
                key: 'shop_id',
                field: 'shop_id,phone,name',
                where: {role_type: ['NOTIN', '1,3'], del: 0},
            },
            shop_setting: {
                type: think.Model.HAS_ONE,
                Model: 'shops',
                fKey: 'shop_id',
                key: 'shop_id',
                // field: 'shop_id,phone,name',
                // where: {role_type: ['NOTIN', '1'], del: 0},
            }
        };
    }
    async shopList($data: ShopListParams) {
        const page = $data.page || 1;
        const limit: number = $data.limit || 10;
        const offset: number = (page - 1) * limit;
        // @ts-ignore
        // tslint:disable-next-line:max-line-length
        return this.order({created_at: 'DESC'}).where({del: 0, shop_name: ['like', '%' + $data.shop_name + '%' ]}).field('shop_id,shop_name,logo,system_end_time,created_at').page(page, limit).countSelect();
    }
    async getShopByShopId($shopId: number) {
        return this.where({del: 0, shop_id: $shopId}).field('shop_id,shop_name,logo,system_end_time,created_at').find();
    }
    async getShopByName($name: string) {
        return this.where({shop_name: $name}).find();
    }
    async addShop($data: AddShopParams) {
        return  this.add($data);
    }
    async editShop($id: number, $data: AddShopParams) {
        return this.where({shop_id: $id}).update($data);
    }
    async delShop($id: number) {
       // return  this.where({shop_id: $id}).delete();
       return  this.where({shop_id: $id}).update({del: 1});
    }
}
