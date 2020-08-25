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
    status: number;
    name: string;
    category_id?: string;
}
export default class extends think.Model {
    async goodsList($data: GoodsListParams) {
        const page = $data.page || 1;
        const limit: number = $data.limit || 10;
        const offset: number = (page - 1) * limit;
        // @ts-ignore
        let where: any = `name like '%${$data.name}%' and del=0 and shop_id = ${$data.shop_id} `;
        if ($data.category_id) {
            where += `and FIND_IN_SET(category_id,getGoodCate(${$data.category_id}))`;
            // const sql = `select getGoodCate(${$data.category_id})`;
            // const cate = await this.query(sql);
            // where.category_id = ['in', $data.category_id];
        }
        if ($data.status == -1) {
            // @ts-ignore
        } else {
            where += `and status = ${$data.status}`;
            // where.status = $data.status;
        }
        // @ts-ignore
        return this.setRelation(false).field('item_price_template,is_presell,is_custom,sale_num,created_at,updated_at,status,shop_id,id,name,category_id,old_price,current_price,weight,sum_stock,min_buy,max_buy,images,thumb_image_path,desc,pv').order({created_at: 'DESC'}).where(where).page(page, limit).countSelect();
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
    async getGoodById($id: number, shop_id: number) {
        // const shop_id = this.ctx.state.admin_info.shop_id;
        // const id = this.post('id');
        // const name = this.post('name');
        // const category = this.post('category');
        // const old_price = this.post('old_price');
        // const current_price = this.post('current_price');
        // const weight = this.post('weight');
        // const sum_stock = this.post('sum_stock');
        // const min_buy = this.post('min_buy');
        // const max_buy = this.post('max_buy');
        // const desc = this.post('desc');
        // const images = JSON.stringify(this.post('images'));
        // const thumb_image_path = this.post('images')[0];
        // const sku_show = JSON.stringify(this.post('sku_show'));
        // const sku_list = JSON.stringify(this.post('sku_list'));
        // const detail = this.post('detail');
        return this.field('item_price_template,is_presell,shop_id,id,name,category_id,old_price,current_price,weight,sum_stock,min_buy,max_buy,images,thumb_image_path,sku_list,sku_show,detail,desc,express_fee,express_template_id,custom_category_id,is_custom,express_type,sale_num,pv').where({id: $id, shop_id}).find();
    }
    async deleteGoods($id: number) {
        return this.where({id: $id}).update({del: 1});
    }
    async editGoods($id: number, $data: any) {
        return this.where({id: $id}).update($data);
    }
}
