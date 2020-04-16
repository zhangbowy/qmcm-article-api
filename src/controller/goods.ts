import Base from './base.js';
const path = require('path');
import ItemModel from './../model/item';
import SkuModel from "../model/sku_list";
import {think} from "thinkjs";
export default class extends Base {
    /**
     * 商品列表
     */
    async goodsListAction() {
        const page: number = this.post('currentPage') || 1;
        const limit: number = this.post('pageSize') || 10;
        const model = this.model('item') as ItemModel;
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const data = await model.goodsList({page, limit, shop_id});
        return this.success(data, '请求成功!');
    }
    /**
     * 添加商品
     */
    async addGoodsAction() {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        console.log(shop_id, 'shop_id');
        const name = this.post('name');
        const category = this.post('category');
        const old_price = this.post('old_price');
        const current_price = this.post('current_price');
        const weight = this.post('weight');
        const sum_stock = this.post('sum_stock');
        const min_buy = this.post('min_buy');
        const max_buy = this.post('max_buy');
        const desc = this.post('desc');
        const images = this.post('images');
        const sku_show = this.post('sku_show');
        const sku_list = this.post('sku_list');
        const detail = this.post('detail');
        const params: any = {
            name,
            category,
            weight,
            sum_stock,
            old_price,
            current_price,
            min_buy,
            max_buy,
            desc,
            images,
            sku_show,
            shop_id,
            sku_list,
            detail
        };
        const model = this.model('item') as ItemModel;
        const res = await model.addGoods(params);
        if (res) {
            // if (this.post('sku_list') && this.post('sku_list').length > 0) {
            //     const skuModel = this.model('sku_list') as SkuModel;
            //     const sku_list =  JSON.parse(this.post('sku_list'));
            //     const p: any = [];
            //     for (const item of sku_list) {
            //         console.log(item, 'item');
            //         item.item_id = res;
            //         item.shop_id = shop_id;
            //         p.push(item);
            //     }
            //     const reSku = await skuModel.addSku(p);
            //     // return this.fail(-1, 'Sku添加失敗', reSku);
            // }
            return this.success(res, "添加成功!");
        }

        return this.fail(-1, '添加失敗', []);
    }
    /**
     * 商品详情
     */
    async goodsDetailAction() {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const id: number = this.post('id');
        const model = this.model('item') as ItemModel;
        const res = await model.getGoodById(id);
        return this.success(res, '请求成功!');
    }
    /**
     * 编辑商品
     */
    async editGoodsAction() {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const id = this.post('id');
        const name = this.post('name');
        const category = this.post('category');
        const old_price = this.post('old_price');
        const current_price = this.post('current_price');
        const weight = this.post('weight');
        const sum_stock = this.post('sum_stock');
        const min_buy = this.post('min_buy');
        const max_buy = this.post('max_buy');
        const desc = this.post('desc');
        const images = this.post('images');
        const sku_show = this.post('sku_show');
        const sku_list = this.post('sku_list');
        const detail = this.post('detail');
        const params: any = {
            name,
            category,
            old_price,
            sum_stock,
            weight,
            current_price,
            min_buy,
            max_buy,
            desc,
            images,
            sku_show,
            sku_list,
            shop_id,
            detail
        };
        const model = this.model('item') as ItemModel;
        let res: any = await model.editGoods(id, params);
        return this.success(res, '请求成功!');
    }

    /**
     * 刪除商品
     */
    async deleteGoodsAction() {
        // @ts-ignore
        const id: number = this.post('id');
        const model = this.model('item') as ItemModel;
        const res: any = await model.deleteGoods(id);
        if (!res) {
            return this.fail(-1, '商品不存在!', res);
        }
        return this.success(res, '刪除成功!');
    }
}
