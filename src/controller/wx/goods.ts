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
            const category_id: number = Number(this.post('category_id')|| 0) ;
            let categorys: any;
            if(category_id != 0) {
                let categoryItem: object = await  this.model('item_category').where({id:category_id});
                if(Object.keys(categoryItem).length == 0) {
                    return this.fail(-1,'商品分类不存在')
                }
                // @ts-ignore
                // if (categoryItem.parent_id == 0) {
                //     categorys = category_id
                // } else {
                    const categoryModel = this.model('item_category') as item_category;
                    categorys = await categoryModel.getChild(category_id);
                // }
            } else {
                categorys = 0
            }
            const model = this.model('item') as ItemModel;
            // @ts-ignore
            const shop_id = this.ctx.state.shop_id;
            const data = await model.goodsList({page, limit, shop_id, status,name,categorys});
            return this.success(data, '请求成功!');
        }catch ($err) {
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
            /**
             * 商品的浏览量增加1
             */
            await this.model('item').where({id: id}).increment('pv', 1);
            const res = await model.getGoodById(id, shop_id);
            return this.success(res, '请求成功!');
        }catch ($err) {
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
            const cateModel = this.model('item_category') as cateModel;
            // @ts-ignore
            const shop_id = this.ctx.state.shop_id;
            const data = await cateModel.categoryList({page, limit, shop_id});
            let res =  updateCategory(data,0);
            return this.success(res, '请求成功!');
        }catch ($err) {
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

