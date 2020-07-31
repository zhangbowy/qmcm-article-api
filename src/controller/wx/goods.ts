import Base from './base.js';
const path = require('path');
import ItemModel from './../../model/item';
import cateModel from './../../model/item_category';
import GalleryModel from "../../model/gallery";
import {think} from "thinkjs";
import item_category from "./../../model/item_category";
export default class extends Base {

    /**
     * 商品列表
     * @params {?status} 商品状态 1、待审核 2、待上架 3、已上架
     * @params {name} 商品名称
     * @params {?category_id}  商品分类id
     */
    async getGoodsAction() {
        try {
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            const status = 3;
            const name: string = this.post('name') || "";
            const category_id: number = Number(this.post('category_id') || 0) ;
            let categorys: any;
            if (category_id != 0) {
                const categoryItem: object = await  this.model('item_category').where({id: category_id});
                if (Object.keys(categoryItem).length == 0) {
                    return this.fail(-1, '商品分类不存在');
                }
                // @ts-ignore
                // if (categoryItem.parent_id == 0) {
                //     categorys = category_id
                // } else {
                // const categoryModel = this.model('item_category') as item_category;
                // categorys = await categoryModel.getChild(category_id);
                // }
            }
            const model = this.model('item') as ItemModel;
            // @ts-ignore
            const shop_id = this.ctx.state.shop_id;
            // @ts-ignore
            const data = await model.goodsList({page, limit, shop_id, status, name, category_id});
            return this.success(data, '获取商品列表!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 商品详情
     * @params {id} 商品ID
     */
    async detailAction() {
        try {
            // @ts-ignore
            const shop_id = this.ctx.state.shop_id;
            const id: number = this.post('id');
            const model = this.model('item') as ItemModel;
            const res = await model.getGoodById(id, shop_id);
            if (think.isEmpty(res)) {
                return this.fail(-1, '商品不存在!');
            }
            /**
             * 商品的浏览量增加1
             */
            await this.model('item').where({id}).increment('pv', 1);
            return this.success(res, '获取商品详情!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 商品分类列表
     */
    async getCategoryAction() {
        try {
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            const catemodel = this.model('item_category') as cateModel;
            // @ts-ignore
            const shop_id = this.ctx.state.shop_id;
            const data = await catemodel.categoryList({page, limit, shop_id});
            const res = this.getTree(data, 0, 'id', 'parent_id');
            return this.success(res, '获取商品分类!');
        } catch ($err) {
            this.dealErr($err);
        }
    }
    // /**
    //  * 商品分类列表
    //  */
    // async getCategoryAction() {
    //     const page: number = this.post('currentPage') || 1;
    //     const limit: number = this.post('pageSize') || 10;
    //     const cateModel = this.model('item_category') as cateModel;
    //     // @ts-ignore
    //     const shop_id = this.ctx.state.admin_info.shop_id;
    //     const data = await cateModel.categoryList({page, limit, shop_id});
    //     let res =  updateCategory(data,0);
    //     return this.success(res, '请求成功!');
    // }

}
