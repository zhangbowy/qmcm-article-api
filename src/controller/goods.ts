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
        try {
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            const model = this.model('item') as ItemModel;
            const status: number = this.post('status') || -1;
            const name: string = this.post('name') || "";
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            const data = await model.goodsList({page, limit, shop_id,status,name});
            return this.success(data, '请求成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 添加商品
     * @params { name } 商品标题
     * @params { category_id } 分类ID
     * @params { old_price } 划线价
     * @params { current_price } 现价
     * @params { weight } 重量
     * @params { sum_stock } 库存
     * @params { min_buy } 起购数量
     * @params { max_buy } 限购数量
     * @params { desc } 分享描述
     * @params { images } 商品图列表
     * @params { sku_show } sku规格列表
     * @params { sku_list } sku详细列表
     * @params { detail } 详情
     */
    async addGoodsAction() {
        try {
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            console.log(shop_id, 'shop_id');
            const name = this.post('name');
            const category_id = this.post('category_id');
            const old_price = this.post('old_price');
            const current_price = this.post('current_price');
            const weight = this.post('weight');
            const sum_stock = this.post('sum_stock');
            const min_buy = this.post('min_buy');
            const max_buy = this.post('max_buy');
            const desc = this.post('desc');
            const images = JSON.stringify(this.post('images'));
            const thumb_image_path = this.post('images')[0];
            const sku_show = JSON.stringify(this.post('sku_show'));
            /**
             * 快递费
             */
            const express_fee = this.post('express_fee');
            /**
             * 快递模板
             */
            const express_template_id = this.post('express_template_id');
            const sku_list = JSON.stringify(this.post('sku_list'));
            const detail = this.post('detail');
            if(min_buy < 1) {
                return this.fail(-1, '最小购买数量为1', []);
            }
            if(max_buy < min_buy) {
                return this.fail(-1, '最大购买数量不能小于起购数量', []);
            }
            if(max_buy > sum_stock) {
                return this.fail(-1, '最大购买数量不能超过库存', []);
            }
            const params: any = {
                name,
                category_id,
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
                detail,
                thumb_image_path,
                express_fee,
                express_template_id
            };
            const model = this.model('item') as ItemModel;
            const res = await model.addGoods(params);
            if (res) {
                return this.success(res, "添加成功!");
            }
            return this.fail(-1, '添加失敗', []);
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 商品详情
     * @params { id } 商品id
     */
    async goodsDetailAction() {
        try {
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            const id: number = this.post('id');
            const model = this.model('item') as ItemModel;
            const res = await model.getGoodById(id,shop_id);
            res.images = JSON.parse(res.images);
            res.sku_list = JSON.parse(res.sku_list);
            res.sku_show = JSON.parse(res.sku_show);
            return this.success(res, '请求成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 编辑商品
     * @params { id } 商品id
     * @params { name } 商品标题
     * @params { category_id } 分类ID
     * @params { old_price } 划线价
     * @params { current_price } 现价
     * @params { weight } 重量
     * @params { sum_stock } 库存
     * @params { min_buy } 起购数量
     * @params { max_buy } 限购数量
     * @params { desc } 分享描述
     * @params { images } 商品图列表
     * @params { sku_show } sku规格列表
     * @params { sku_list } sku详细列表
     * @params { detail } 详情
     */
    async editGoodsAction() {
        try {
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            const id = this.post('id');
            const name = this.post('name');
            const category_id = this.post('category_id');
            const old_price = this.post('old_price');
            const current_price = this.post('current_price');
            const weight = this.post('weight');
            const sum_stock = this.post('sum_stock');
            const min_buy = this.post('min_buy');
            const max_buy = this.post('max_buy');
            const desc = this.post('desc');
            const images = JSON.stringify(this.post('images'));
            const thumb_image_path = this.post('images')[0];
            const sku_show = JSON.stringify(this.post('sku_show'));
            const sku_list = JSON.stringify(this.post('sku_list'));
            const detail = this.post('detail');
            /**
             * 快递费
             */
            const express_fee = this.post('express_fee');
            /**
             * 快递模板
             */
            const express_template_id = this.post('express_template_id');
            const params: any = {
                name,
                category_id,
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
                detail,
                thumb_image_path,
                express_fee,
                express_template_id
            };
            const model = this.model('item') as ItemModel;
            let res: any = await model.editGoods(id, params);
            return this.success(res, '编辑成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 刪除商品
     * @params { id } 商品id
     */
    async deleteGoodsAction() {
        try {
            // @ts-ignore
            const id: number = this.post('id');
            const model = this.model('item') as ItemModel;
            const res: any = await model.deleteGoods(id);
            if (!res) {
                return this.fail(-1, '商品不存在!', res);
            }
            return this.success(res, '刪除成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 设置商品状态
     * @params { id } 商品id
     * @params { status } 商品状态 1、待审核 2、待上架 3、已上架
     */
    async setStatusAction() {
        try {
            const id: number = this.post('id');
            const status: number = Number(this.post('status'));
            let statusList = [1,2,3];
            if (!statusList.includes(status)) {
                return this.fail(-1, '该商品状态不存在!');
            }
            const model = this.model('item') as ItemModel;
            let res: any = await model.where({id}).update({status});
            if (!res) {
                return this.fail(-1, '商品不存在!', res);
            }
            return this.success(res, '操作成功!');
        }catch (e) {
            return this.fail(-1,e);
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
            const shop_id = (await this.session('token')).shop_id;
            const data = await cateModel.categoryList({page, limit, shop_id});
            let res =  updateCategory(data,0);
            return this.success(res, '请求成功!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 添加分类
     * @params { category_name } 分类名称
     * @params { parent_id } 上级id
     * @params { image_path } 分类图片路径
     * @params { link } 链接
     * @params { logo } logo
     */
    async addCategoryAction() {
        try {
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
            let timer = 1;
            if (parent_id != 0) {
                const res = await this.model('item_category').where({id:parent_id}).find();
                if(Object.keys(res).length == 0) {
                    return this.fail(-1, '该上级分类不存在!')
                }
                // let level = await this.getLevel(parent_id,timer);
                // if(level > 2)
                // {
                //     return this.fail(-1,"分类不能超过三级")
                // }
                // const res = await this.model('item_category').where({id:res.id}).find();
            }
            const res = await this.model('item_category').add(params);
            if (res) {
                return this.success(res, '添加成功!')
            }
            return this.fail(-1, '添加失败!');
        }catch (e) {
            return this.fail(-1, e);
        }
    }
    async getLevel(parent_id: number,timer: number) {
        const res = await this.model('item_category').where({id:parent_id}).find();
        ++ timer
        if(res.parent_id == 0) {
            // @ts-ignore
            return  new Promise((resolve,reject) => {
                // @ts-ignore
                resolve(timer)
            })
        } else {
           this.getLevel(res.parent_id,timer)
        }
    }

    /**
     * 编辑分类
     * @params { id } 商品分类id
     * @params { category_name } 分类名称
     * @params { image_path } 分类图片路径
     * @params { link } 链接
     * @params { logo } logo
     */
    async editCategoryAction() {
        try {
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            const id: number = this.post('id');
            const category_name: number = this.post('category_name');
            const image_path: number = this.post('image_path');
            const link: number = this.post('link');
            const logo: number = this.post('logo');
            const params:object = {
                category_name,
                image_path,
                link,
                logo
            };
            const res: any = await this.model('item_category').where({id,shop_id}).update(params);
            if (res) {
                return this.success(res, '编辑成功!');
            }
            return this.fail(-1, '分类不存在!')
        }catch (e) {
            return this.fail(-1, e)
        }
    }

    /**
     * 删除分类
     * @params { id } 分类id
     */
    async delCategoryAction() {
        try {
            // @ts-ignore
            const shop_id = (await this.session('token')).shop_id;
            const id: number = Number(this.post('id'));
            let category = await this.model('item_category').where({id:id}).find();
            if (Object.keys(category).length == 0) {
                return this.fail(-1,'分类不存在')
            }
            let model = this.model('item_category') as item_category;
            let ids = await model.getChild(id);
            let res:number = await this.model('item_category').where({id:['in',ids],shop_id}).update({del:1});
            if (res) {
                const data: any = await this.model('item').where({id:['in',ids],shop_id}).update({category_id:0});
                return this.success("", '删除成功!')
            } else {
                return this.fail(-1, '分类不存在!');
            }
        }catch (e) {
            return this.fail(-1, e);
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

