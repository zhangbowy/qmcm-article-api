import Base from './base.js';
const path = require('path');
import ItemModel from './../model/item';
import cateModel from './../model/item_category';
import GalleryModel from "../model/gallery";
import {think} from "thinkjs";
import item_category from "./../model/item_category";
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

    /**
     * 商品分类列表
     */
    async getCategoryAction() {
        const page: number = this.post('currentPage') || 1;
        const limit: number = this.post('pageSize') || 10;
        const cateModel = this.model('item_category') as cateModel;
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const data = await cateModel.categoryList({page, limit, shop_id});
        let res =  updateCategory(data,0);
        return this.success(res, '请求成功!');
    }

    /**
     * 添加分类
     */
    async addCategoryAction() {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const category_name: number = this.post('category_name');
        const parent_id: number = this.post('parent_id') || 0;
        const image_path: number = this.post('image_path') || "";
        const logo: number = this.post('logo');
        const link: number = this.post('link');
        const params:object = {
            category_name,
            parent_id,
            image_path,
            link,
            shop_id,
            logo
        };
        if (parent_id != 0) {
            const res = await this.model('item_category').where({id:parent_id}).find();
            if(Object.keys(res).length == 0) {
               return this.fail(-1, '该上级分类不存在!')
            }
        }
        const res = await this.model('item_category').add(params);
        if (res) {
            return this.success(res, '添加成功!')
        }
        return this.fail(-1, '添加失败!');
    }

    /**
     * 编辑分类
     */
    async editCategoryAction() {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const id: number = this.post('id');
        const category_name: number = this.post('category_name');
        const parent_id: number = this.post('parent_id') || 0;
        const image_path: number = this.post('image_path');
        const link: number = this.post('link');
        const logo: number = this.post('logo');
        const params:object = {
            category_name,
            parent_id,
            image_path,
            link,
            logo
        };
        const res: any = await this.model('item_category').where({id,shop_id}).update(params);
        if (res) {
            return this.success(res, '编辑成功!')
        }
        return this.fail(-1, '分类不存在!')
    }

    /**
     * 删除分类
     */
    async delCategoryAction() {
        // @ts-ignore
        const shop_id = (await this.session('token')).shop_id;
        const id: number = Number(this.post('id'));
        let category = await this.model('item_category').where({id:id}).find();
        if (Object.keys(category).length == 0)
        {
            return this.fail(-1,'分类不存在')
        }
        let model = this.model('item_category') as item_category;
        let ids = await model.getChild(id);
        let res:number = await this.model('item_category').where({id:['in',ids],shop_id}).delete();
        if (res) {
            const data: any = await this.model('item').where({id:['in',ids],shop_id}).update({category_id:0});
            return this.success("", '删除成功!')
        } else {
            return this.fail(-1, '分类不存在!');
        }
    }

}
/**
 * 递归分类列表
 */
function updateCategory(data:any, root:any) {
    var idTxt:any = idTxt || 'id';
    var pidTxt:any = pidTxt || 'parent_id';
    var pushTxt:any = pushTxt || 'children';
    // 递归方法
    function getNode(id:any) {
        var node = [];
        var ids = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i][pidTxt] == id) {
                data[i][pushTxt] = getNode(data[i][idTxt]);
                node.push(data[i])
            }
        }
        if (node.length == 0) {
            return
        } else {
            return node
        }
    }
    return getNode(root)
}

