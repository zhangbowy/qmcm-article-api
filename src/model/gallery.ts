import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface addImageParams {
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
    gallery_group_id?: any;
}
export default class extends think.Model {
    async list($data: GoodsListParams) {
        const page = $data.page || 1;
        const limit: number = $data.limit || 10;
        const offset: number = (page - 1) * limit;
        // @ts-ignore
        if($data.gallery_group_id == -1)
        {
            // @ts-ignore
            return this.order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id}).page(page, limit).cache(0).countSelect({cache: false});
        }
        else
        {
            // @ts-ignore
            return this.order({created_at: 'DESC'}).where({del: 0, shop_id: $data.shop_id,gallery_group_id: ['in', $data.gallery_group_id]}).page(page, limit).countSelect({cache: false});
        }
    }
    async addImage($data: addImageParams) {
        return await this.add($data);
    }
    /**
     * 清除分组Id
     */
    async deletePid($id: number) {
        return this.where({gallery_group_id: $id}).update({gallery_group_id: 0});
    }
    /**
     * 图片设置分组
     */
    async setGroup($ids: number,$group_id: number) {
        return this.where({id: ['IN', $ids]}).update({gallery_group_id:$group_id});
    }
    // /**
    //  * id
    //  */
    async findImageById($ids: string) {
        return this.where({id: ['IN', $ids]}).select();
    }
    async deleteImg($ids: string) {
        return await this.where({id: ['IN', $ids]}).delete();
    }
}
