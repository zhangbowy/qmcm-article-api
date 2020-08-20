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
            const shop_id = this.ctx.state.admin_info.shop_id;
            const data = await model.goodsList({page, limit, shop_id, status, name});
            return this.success(data, '商品列表!');
        } catch (e) {
            this.dealErr(e);
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
     * @params { is_custom } 是否开启定制
     * @params { custom_category_id } 定制分类id
     * @params { express_type } 物流类型 0 包邮 1 统一运费 2 运费模板
     * @returns boolean
     */
    async addGoodsAction() {
        try {
            // @ts-ignore
            const shop_id = this.ctx.state.admin_info.shop_id;
            console.log(shop_id, 'shop_id');
            const name = this.post('name');
            const category_id = this.post('category_id');
            const old_price = this.post('old_price');
            const current_price = this.post('current_price');
            const weight = this.post('weight');
            const sum_stock = this.post('sum_stock');
            // const min_buy = this.post('min_buy');
            // const max_buy = this.post('max_buy');
            const desc = this.post('desc');
            const images = JSON.stringify(this.post('images'));
            const thumb_image_path = this.post('images')[0];
            const sku_show = JSON.stringify(this.post('sku_show'));
            const is_custom = this.post('is_custom');
            const custom_category_id = this.post('custom_category_id');
            const express_type = this.post('express_type');
            const is_presell = this.post('is_presell');
            /**
             * 查询商品分类是否存在
             */
            if (category_id) {
                const category  =  await this.model('item_category').where({id: category_id}).find();
                if (think.isEmpty(category)) {
                    return this.fail(-1, '商品分类不存在!');
                }
            }
            /**
             * 快递费
             */
            const express_fee = this.post('express_fee') || 0;
            /**
             * 快递模板
             */
            const express_template_id = this.post('express_template_id');
            /**
             * 验证运费模板  express_type 0 包邮 1 统一运费 2 运费模板
             */
            if (express_type == 2) {
                const express_template =  await this.model('express_template').where({express_template_id}).find();
                if (think.isEmpty(express_template)) {
                    return this.fail(-1, '运费模板不存在!');
                }
            }
            const sku_list = JSON.stringify(this.post('sku_list'));
            const detail = this.post('detail');
            // if(old_price > current_price) {
            //     return this.fail(-1, '商品现价不能大于划线价!', []);
            // }
            // if(min_buy < 1) {
            //     return this.fail(-1, '最小购买数量为1!', []);
            // }
            // if(max_buy < min_buy) {
            //     return this.fail(-1, '最大购买数量不能小于起购数量!', []);
            // }
            // if(max_buy > sum_stock) {
            //     return this.fail(-1, '最大购买数量不能超过库存!', []);
            // }
            const params: any = {
                name,
                category_id,
                weight,
                sum_stock,
                old_price,
                current_price,
                // min_buy,
                // max_buy,
                desc,
                images,
                sku_show,
                shop_id,
                sku_list,
                detail,
                thumb_image_path,
                express_fee,
                express_template_id,
                is_custom,
                express_type,
                is_presell
            };
            if (is_custom) {
                const custom = await this.model('custom_category').where({custom_category_id}).find();
                if (think.isEmpty(custom)) {
                    return this.fail(-1, '定制分类不存在!');
                }
                params.custom_category_id = custom_category_id;
            }
            const model = this.model('item') as ItemModel;
            const res: any = await model.addGoods(params);
            if (res) {
                return this.success(res, "添加成功!");
            }
            return this.fail(-1, '添加失敗', []);
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 商品详情
     * @params { id } 商品id
     */
    async goodsDetailAction() {
        try {
            // @ts-ignore
            const shop_id = this.ctx.state.admin_info.shop_id;
            const id: number = this.post('id');
            const model = this.model('item') as ItemModel;
            const res = await model.getGoodById(id, shop_id);
            res.images = JSON.parse(res.images);
            res.sku_list = JSON.parse(res.sku_list);
            res.sku_show = JSON.parse(res.sku_show);
            return this.success(res, '商品详情!');
        } catch (e) {
            this.dealErr(e);
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
     * @params { is_custom } 是否开启定制
     * @params { custom_category_id } 定制分类id
     * @params { express_type } 物流类型 0 包邮 1 统一运费 2 运费模板
     * @returns boolean
     */
    async editGoodsAction() {
        try {
            // @ts-ignore
            const shop_id = this.ctx.state.admin_info.shop_id;
            const id = this.post('id');
            const name = this.post('name');
            const category_id = this.post('category_id');
            const old_price = this.post('old_price');
            const current_price = this.post('current_price');
            const weight = this.post('weight');
            const sum_stock = this.post('sum_stock');
            // const min_buy = this.post('min_buy');
            // const max_buy = this.post('max_buy');
            const desc = this.post('desc');
            const images = JSON.stringify(this.post('images'));
            const thumb_image_path = this.post('images')[0];
            const sku_show = JSON.stringify(this.post('sku_show'));
            const sku_list = JSON.stringify(this.post('sku_list'));
            const detail = this.post('detail');
            const is_custom = this.post('is_custom');
            const custom_category_id = this.post('custom_category_id');
            const express_type = this.post('express_type');
            const is_presell = this.post('is_presell');
            /**
             * 查询商品分类是否存在
             */
            if (category_id) {
                const category  =  await this.model('item_category').where({id: category_id}).find();
                if (think.isEmpty(category)) {
                    return this.fail(-1, '商品分类不存在!');
                }
            }
            /**
             * 统一快递费
             */
            const express_fee = this.post('express_fee') || 0;
            /**
             * 快递模板
             */
            const express_template_id = this.post('express_template_id');
            /**
             * 验证运费模板  express_type 0 包邮 1 统一运费 2 运费模板
             */
            if (express_type == 2) {
                const express_template =  await this.model('express_template').where({express_template_id}).find();
                if (think.isEmpty(express_template)) {
                    return this.fail(-1, '运费模板不存在!');
                }
            }
            // if(old_price > current_price) {
            //     return this.fail(-1, '商品现价不能大于划线价!', []);
            // }

            const params: any = {
                name,
                category_id,
                old_price,
                sum_stock,
                weight,
                current_price,
                // min_buy,
                // max_buy,
                desc,
                images,
                sku_show,
                sku_list,
                shop_id,
                detail,
                thumb_image_path,
                express_fee,
                express_template_id,
                is_custom,
                express_type,
                is_presell
            };
            if (is_custom) {
                const custom = await this.model('custom_category').where({custom_category_id}).find();
                if (think.isEmpty(custom)) {
                    return this.fail(-1, '定制分类不存在!');
                }
                params.custom_category_id = custom_category_id;
            }
            const model = this.model('item') as ItemModel;
            const res: any = await model.editGoods(id, params);
            return this.success(res, '编辑成功!');
        } catch (e) {
            this.dealErr(e);
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
        } catch (e) {
            this.dealErr(e);
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
            const statusList = [1, 2, 3, 4];
            if (!statusList.includes(status)) {
                return this.fail(-1, '该商品状态不存在!');
            }
            const model = this.model('item') as ItemModel;
            const res: any = await model.where({id}).update({status});
            if (!res) {
                return this.fail(-1, '商品不存在!', res);
            }
            return this.success(res, '操作成功!');
        } catch (e) {
            return this.fail(-1, e);
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
            const shop_id = this.ctx.state.admin_info.shop_id;
            const data = await catemodel.categoryList({page, limit, shop_id});
            const res =  this.getTree(data, 0, 'id', 'parent_id');
            return this.success(res, '商品分类列表!');
        } catch (e) {
            this.dealErr(e);
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
            const shop_id = this.ctx.state.admin_info.shop_id;
            const category_name: number = this.post('category_name');
            const parent_id: number = this.post('parent_id') || 0;
            const image_path: number = this.post('image_path') || "";
            const logo: number = this.post('logo');
            const link: number = this.post('link');
            const params: object = {
                category_name,
                parent_id,
                image_path,
                link,
                shop_id,
                logo
            };
            if (parent_id != 0) {
                const data = await this.model('item_category').where({id: parent_id}).find();
                if (Object.keys(data).length == 0) {
                    return this.fail(-1, '该上级分类不存在!');
                }
                // @ts-ignore
                const level: any = await this.model('item_category').getLevel(parent_id);
                if (level >= 3) {
                    return this.fail(-1, '商品分类最多三级!');
                }

            }
            const res: any = await this.model('item_category').add(params);
            if (res) {
                return this.success(res, '添加成功!');
            }
            return this.fail(-1, '添加失败!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 获取等级
     * @param parent_id
     * @param timer
     */
    async getLevel(parent_id: number, timer: number) {
        const res = await this.model('item_category').where({id: parent_id}).find();
        ++ timer;
        if (res.parent_id == 0) {
            // @ts-ignore
            return  new Promise((resolve, reject) => {
                // @ts-ignore
                resolve(timer);
            });
        } else {
           this.getLevel(res.parent_id, timer);
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
            const shop_id = this.ctx.state.admin_info.shop_id;
            const id: number = this.post('id');
            const category_name: number = this.post('category_name');
            const image_path: number = this.post('image_path');
            const link: number = this.post('link');
            const logo: number = this.post('logo');
            const params: object = {
                category_name,
                image_path,
                link,
                logo
            };
            const res: any = await this.model('item_category').where({id, shop_id}).update(params);
            if (res) {
                return this.success(res, '编辑成功!');
            }
            return this.fail(-1, '分类不存在!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 删除分类
     * @params { id } 分类id
     */
    async delCategoryAction() {
        try {
            // @ts-ignore
            const shop_id = this.ctx.state.admin_info.shop_id;
            const id: number = Number(this.post('id'));
            const category = await this.model('item_category').where({id}).find();
            if (think.isEmpty(category)) {
                return this.fail(-1, '分类不存在');
            }
            const model = this.model('item_category') as item_category;
            // const ids = await model.getChild(id);
            const data: any = await this.model('item').where(`shop_id=${shop_id} and FIND_IN_SET(category_id,getGoodCate(${id}))`).update({category_id: 0});
            const res: number = await this.model('item_category').where(`shop_id=${shop_id} and FIND_IN_SET(id,getGoodCate(${id}))`).update({del: 1});
            return this.success("", '删除成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
