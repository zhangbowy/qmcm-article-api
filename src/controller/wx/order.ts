import Base from './base.js';
import express_template from "../../model/express_template";
import {think} from "thinkjs";
const path = require('path');
const _ = require('lodash');

export default class extends Base {

    /**
     * 订单列表
     */
    async listAction() {
        try {
            const user_id: any = this.ctx.state.userInfo.id;
            const shop_id = this.ctx.state.shop_id;
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            const status = this.post('status') || 0;
            let where: any = {};
            where.shop_id = shop_id;
            where.user_id = user_id;
            if (status) {
                where.status = status;
            }
            let res = await this.model('order').setRelation('order_item').page(page, limit).order('order_no DESC').where(where).countSelect();
            return this.success(res, '请求成功!');
        }catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 订单详情
     * @param {order_no} 订单编号
     */
    async detailAction() {
        try {
            const user_id: any = this.ctx.state.userInfo.id;
            const order_no: any = this.get('order_no');
            const shop_id = this.ctx.state.shop_id;
            let res = await this.model('order').setRelation('order_item').order('order_no DESC').where({user_id, shop_id, order_no}).find();
            if (think.isEmpty(res)) {
                return this.fail(-1, '该订单不存在!');
            }
            return this.success(res,'请求成功!');
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 订单支付
     * @params {cart_list} 购物列表 {goods_id,buy_num,sku_id}
     * @params {shopping_type} 订单类型
     * @params {address_id} 收货地址id
     * @return order_no
     */
    // async calculation() {
    async payAction() {
        try {
            let shop_id = this.ctx.state.shop_id;
            const address_id: any = this.post('address_id');
            // const order_type: any = this.post('shopping_type') || 1;
            const pay_type: any = this.post('pay_type') || 1;
            const buyer_message: any = this.post('buyer_message') || "";
            const user_id: any = this.ctx.state.userInfo.id;
            if (!address_id) {
                return this.fail(-1, "收货地址不能为空!");
            }
            /**
             * 生成订单号
             */
            let order_no = await this.generateOrderNumber();
            /**
             * 再次计算商品信息和价格
             */
            let item_info: any = await this.calculation();
            if (typeof item_info =='string') {
                return this.fail(-1, item_info);
            }
            let address = item_info.address;
            const receiver_name: string = address.name;
            const receiver_phone: string = address.phone;
            const receiver_address: string = `${address.province}${address.city}${address.area}${address.address}`;
            const pay_amount: number = Number(item_info.total_price);
            const express_amount: number = Number(item_info.express_amount);
            const item_amount: number = Number(item_info.item_price);
            /**
             * 创建订单存库
             */
            const order_type = item_info.order_type;
            let _order_type =  getOrderType(order_type);
            let order_id = await this.model('order').add({
                user_id,
                order_type,
                pay_type,
                receiver_name,
                receiver_phone,
                receiver_address,
                pay_amount,
                express_amount,
                item_amount,
                order_no,
                shop_id,
                buyer_message,
                _status: '待付款',
                _order_type: _order_type,
                designer_id: item_info.item_list[0].designer_id,
                designer_team_id: item_info.item_list[0].designer_team_id
            });
            if (order_id) {
                let item_list = item_info.item_list;
                for (let item_v of item_list) {
                    // let res: any = await this.model('item').where({id: item_v.item_id}).find();
                    // let sku_list = JSON.parse(res.sku_list);
                    // for (let sku_v of sku_list) {
                    //     if (item_v.sku_id == sku_v.sku_id) {
                    //         sku_v.num = sku_v.num - item_v.buy_num;
                    //         break;
                    //     }
                    // }
                    // let new_sku_list: any = JSON.stringify(sku_list);
                    // await this.model('item').where({id: item_v.item_id}).update({sku_list:new_sku_list});
                    /**
                     * 减库存方法 现在sku是一个串  待优化
                     */
                    await this.changeSumStock(item_v, 0);
                    await this.model("item").where({id: item_v.item_id}).increment('sale_num', item_v.buy_num);
                    item_v.order_id = order_id
                }
                /**
                 * 订单商品信息存库
                 */
                // for(let item_v of item_list) {
                    await this.model('order_item').addMany(item_list);
                // }
                return this.success({
                    order_no
                })
            } else {
                return this.fail(-1, "创建订单失败!");
            }
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 生成订单的编号order_no
     * @returns {年 月 日 时 分 秒 毫秒  + 随机数}
     */
    async generateOrderNumber() {
        const date = new Date();
        return date.getFullYear() + _.padStart(date.getMonth()+1, 2, '0') + _.padStart(date.getDate(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0')+ date.getMilliseconds() + _.random(100000, 999999);
    }

    /**
     * 计算价格
     * @params {cart_list} 购物列表 {id,buy_num,sku_id}
     * @params {address_id} 收货地址
     */
    async calculation() {
        try {
            const shop_id: number = this.ctx.state.shop_id;
            const user_id: number = this.ctx.state.userInfo.id;
            /**
             * 购物列表
             */
            // item_info.top_font_size = cart_v.design_info.top_font_size;
            // item_info.top_font_content = cart_v.design_info.top_font_content;
            // item_info.top_font_color = cart_v.design_info.top_font_color;
            // item_info.bottom_font_size = cart_v.design_info.bottom_font_size;
            // item_info.bottom_font_content = cart_v.design_info.bottom_font_content;
            // item_info.bottom_font_color = cart_v.design_info.bottom_font_color;
            // item_info.font_id = cart_v.design_info.font_id;
            // item_info.font_family = cart_v.design_info.font_family;
            // item_info.design_width = cart_v.design_info.design_width;
            // item_info.design_height = cart_v.design_info.design_height;
            // item_info.is_choose_design = cart_v.design_info.is_choose_design;
            // item_info.custom_image = cart_v.design_info.custom_image;
            // item_info.preview_image = cart_v.design_info.preview_image
            let cart_list: any = this.post('cart_list');
                // try {
                //     cart_list = JSON.parse(this.post('cart_list'));
                // }catch (e) {
                //     cart_list = this.post('cart_list');
                //
                // }
            // const cart_list: any = [
            //         {
            //             item_id: 88,
            //             sku_id: '12iqjhkhb4bg0_id-ugjmh1s2r6s0_id',
            //             buy_num: 38,
            //             shopping_type:2,
            //             design_info: {
            //                 design_id: 127,
            //                 top_font_size: "1",
            //                 top_font_content: '1',
            //                 top_font_color: "1",
            //                 bottom_font_size: "1",
            //                 bottom_font_content: "1",
            //                 bottom_font_color: "1",
            //                 font_id: "1",
            //                 font_family: "1",
            //                 design_width: "1",
            //                 design_height: "1",
            //                 is_choose_design: "1",
            //                 custom_image: "1",
            //                 preview_image: "1",
            //             }
            //         }];

            if(cart_list.length == 0) {
                return  '商品不能为空!'
            }
            /**
             * 收货地址id
             */
            const address_id: any = this.post('address_id') || 0;
            let address;
            /**
             * 如果没有传收货地址id
             */
            if (!address_id) {
                /**
                 * 默认地址
                 */
                address = await this.model('address').where({user_id, shop_id,is_default: 1}).find();
                if(Object.keys(address).length == 0) {
                    address = await this.model('address').where({user_id, shop_id}).find();
                    if (think.isEmpty(address)) {
                        return this.fail(-1, '请先添加收货地址!')
                    }
                }
            } else {
                address = await this.model('address').where({user_id, shop_id,address_id}).find();
            }
            /**
             * 总支付
             */
            let pay_amount: any = 0;
            /**
             * 总快递费
             */
            let express_amount: any = [];
            let item_list: any = [];

            /**
             *  购物类型 / 订单类型
             */
            let order_type = cart_list[0].shopping_type;
            for (let cart_v of cart_list) {
                if (order_type != cart_v.shopping_type) {
                    const _shopping_type = getOrderType(cart_v.shopping_type);
                    const _order_type = getOrderType(order_type);
                    return `【${_shopping_type}】不能与【${_order_type}】一起下单`;
                }

                if (typeof cart_v == 'object' && cart_v.item_id) {
                    /**
                     * 购物车里的每一项
                     */
                    let item: any = await this.model('item').where({id: cart_v.item_id}).find();
                    if (item.id) {
                        let express_rule;
                        if (item.express_template_id) {
                            /**
                             * 物流模板规则
                             */
                            express_rule  = await this.model('express_template').where({express_template_id:item.express_template_id}).find();
                        }
                        /**
                         * sku列表
                         */
                        let sku_list = JSON.parse(item.sku_list);

                            if(sku_list.length == 0 ) {

                                /**
                                 * 判断库存
                                 */
                                if ( item.sum_stock  == 0) {
                                    return  item.name+'库存不足';
                                    break;
                                }
                                if (cart_v.buy_num > item.sum_stock ) {
                                    return  item.name+'购买数量超出库存' + item.sum_stock;
                                    break;
                                }
                                if(item.express_type == 0) {
                                    express_amount.push(0);
                                }
                                // pay_amount += item.current_price * cart_v.buy_num;
                                // let sku_name = item.name;
                                //
                                // let item_info = {
                                //     item_id:item.id,
                                //     name:item.name,
                                //     weight:item.weight,
                                //     image:item.thumb_image_path,
                                //     sku_name,
                                //     sku_id:cart_v.sku_id || 0,
                                //     buy_num:cart_v.buy_num,
                                //     current_price:item.current_price,
                                //     category_id:item.category_id
                                // };
                                // item_list.push(item_info);
                                /**
                                 * 统一运费
                                 */
                                if (item.express_type == 1) {
                                    express_amount.push(Number(item.express_fee))
                                }
                                /**
                                 * 物流模板计费
                                 */
                                if (item.express_type == 2 && item.express_template_id) {
                                    /**
                                     * 有区域规则
                                     */
                                    let price;
                                    if (express_rule.region_rules && express_rule.region_rules.length > 0) {
                                        /**
                                         * type 1 重量 2 件数
                                         */
                                        express_rule.region_rules = JSON.parse(express_rule.region_rules);
                                        if(express_rule.express_template_type == 1) {
                                            let priceList = [];
                                            for (let region_v of express_rule.region_rules) {
                                                if(region_v.region.includes(address.city_code)) {
                                                    let coutinue = item.weight - Number(region_v.first_number)>0?Math.ceil(item.weight - Number(region_v.first_number)):0;
                                                    price =  Number(region_v.first_amount) + (coutinue /region_v.continue_number) * Number(region_v.continue_amount);
                                                    priceList.push(price)
                                                }
                                            }
                                            express_amount.push(maxPrice(priceList))
                                        } else {
                                            let priceList = [];
                                            for (let region_v of express_rule.region_rules) {
                                                if(region_v.region.includes(address.city_code)) {
                                                    let coutinue = cart_v.buy_num - Number(region_v.first_number)>0? Math.ceil(cart_v.buy_num - Number(region_v.first_number)):0;
                                                    price =  Number(region_v.first_amount) + (coutinue / region_v.continue_number) * Number(region_v.continue_amount);
                                                    priceList.push(price);
                                                }
                                            }
                                            express_amount.push(maxPrice(priceList));
                                        }
                                    } else {
                                        if(express_rule.express_template_type == 1) {
                                            let coutinue = item.weight - express_rule.first_number>0? Math.ceil(item.weight - express_rule.first_number):0;
                                            price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount)
                                        } else {
                                            let coutinue = cart_v.buy_num - express_rule.first_number>0? Math.ceil(cart_v.buy_num - express_rule.first_number):0;
                                            price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount)
                                        }
                                    }
                                    express_amount.push(Number(price))
                                }
                                let sku_name = item.name;

                                /**
                                 * order_type为1 默认普通商品 的商品数据 baseData 只要里面的商品都会有的
                                 */
                                let item_info: any = {
                                    item_id:item.id,
                                    name:item.name,
                                    weight:item.weight,
                                    image:item.thumb_image_path,
                                    sku_name,
                                    sku_id:cart_v.sku_id || 0,
                                    buy_num:cart_v.buy_num,
                                    current_price:item.current_price,
                                    category_id:item.category_id,
                                    order_type: 1,
                                    _order_type:'普通订单'
                                };

                                /**
                                 * 单个商品总金额 商品价格 花样价格
                                 */
                                item_info.item_total_price = 0;

                                /**
                                 * order_type为 2 一般定制 在普通商品基础上增加的数据
                                 * @tip 一般定制字段注释
                                 * {design_id} 花样id
                                 * {font_color} 字体颜色
                                 * {font_size} 字体大小
                                 * {preview_image} 预览图
                                 * {design_price} 花样价格
                                 */
                                if (cart_v.shopping_type == 2) {
                                // if (cart_v.order_type == 2) {
                                    if (cart_v.design_info) {

                                        if (cart_v.design_info.design_id) {
                                            item_info.design_id = cart_v.design_info.design_id;
                                            const shop_id = this.ctx.state.shop_id;
                                            const design = await this.model('design').where({shop_id, design_id: item_info.design_id,del: 0, status: 3}).find();
                                            if (think.isEmpty(design)) {
                                                return '花样不存在!'
                                            }

                                            let design_price = cart_v.buy_num * design.price;

                                            item_info.designer_id = design.designer_id;
                                            item_info.designer_team_id = design.designer_team_id;

                                            item_info.design_price = design.price;
                                            item_info.design_png_path = design.prev_png_path;
                                            item_info.design_emb_path = design.emb_path;
                                            item_info.design_dst_path = design.dst_path;
                                            item_info.design_txt_png_path = design.txt_png_path;
                                            item_info.design_txt_file_path = design.txt_file_path;
                                            pay_amount += design_price;
                                            item_info.item_total_price += design_price;
                                        }

                                        item_info.top_font_size = cart_v.design_info.top_font_size;
                                        item_info.top_font_content = cart_v.design_info.top_font_content;
                                        item_info.top_font_color = cart_v.design_info.top_font_color;
                                        item_info.bottom_font_size = cart_v.design_info.bottom_font_size;
                                        item_info.bottom_font_content = cart_v.design_info.bottom_font_content;
                                        item_info.bottom_font_color = cart_v.design_info.bottom_font_color;
                                        item_info.font_id = cart_v.design_info.font_id;
                                        item_info.font_family = cart_v.design_info.font_family;
                                        item_info.design_width = cart_v.design_info.design_width;
                                        item_info.design_height = cart_v.design_info.design_height;
                                        item_info.is_choose_design = cart_v.design_info.is_choose_design;
                                        item_info.custom_image = cart_v.design_info.custom_image;
                                        item_info.preview_image = cart_v.design_info.preview_image;
                                        item_info.order_type == 2;
                                        item_info.image = cart_v.design_info.preview_image;
                                        item_info._order_type = getOrderType(item_info.order_type);

                                    } else {
                                        return  'design_info of empty'
                                    }
                                }
                                /**
                                 * 手绘订单
                                 */
                                if (cart_v.shopping_type == 4) {
                                    item_info.order_type = 4;
                                    item_info._order_type = getOrderType(item_info.order_type);
                                    item_info.preview_image = cart_v.design_info.preview_image;
                                    let baseData = cart_v.design_info.draw_image.replace(/data:image\/png;base64,/g,'');
                                    let drawBuffer = Buffer.from(baseData, 'base64');
                                    const fileName = think.uuid('v4');
                                    const oss = await think.service('oss');
                                    const filePath = `/demo/${1}/${fileName}.png`;
                                    const res: any = await oss.upload(Buffer.from(drawBuffer), filePath,true);
                                    item_info.draw_image = `http://${res.Location}`;
                                    item_info.image = cart_v.design_info.preview_image;
                                }
                                item_info.item_total_price += item.current_price * cart_v.buy_num;
                                pay_amount += item.current_price * cart_v.buy_num;
                                item_list.push(item_info);
                            } else {
                                for (let sku_v of sku_list) {
                                    if (cart_v.sku_id == sku_v.sku_id) {
                                        /**
                                         * 判断库存
                                         */
                                        if ( sku_v.num  == 0) {
                                            return  sku_v.sku_id + '库存不足';
                                            break;
                                        }
                                        if (cart_v.buy_num > sku_v.num ) {
                                            return  sku_v.sku_id + '购买数量超出库存' + sku_v.num;
                                            break;
                                        }
                                        if (item.express_type == 0) {
                                            express_amount.push(0);
                                        }
                                        /**
                                         * 统一运费
                                         */
                                        if (item.express_type == 1) {
                                            express_amount.push(Number(item.express_fee))
                                        }
                                        /**
                                         * 物流模板计费
                                         */
                                        if (item.express_type == 2 && item.express_template_id) {
                                            /**
                                             * 有区域规则
                                             */
                                            let price;
                                            if (express_rule.region_rules && express_rule.region_rules.length > 0) {
                                                /**
                                                 * type 1 重量 2 件数
                                                 */
                                                express_rule.region_rules = JSON.parse(express_rule.region_rules);
                                                if (express_rule.express_template_type == 1) {
                                                    let priceList = [];
                                                    for (let region_v of express_rule.region_rules) {
                                                        if (region_v.region.includes(address.city_code)) {
                                                            let coutinue = sku_v.weight - Number(region_v.first_number)>0?Math.ceil(sku_v.weight - Number(region_v.first_number)):0;
                                                            price =  Number(region_v.first_amount) + (coutinue /region_v.continue_number) * Number(region_v.continue_amount);
                                                            priceList.push(price)
                                                        }
                                                    }
                                                    express_amount.push(maxPrice(priceList))
                                                } else {
                                                    let priceList = [];
                                                    for (let region_v of express_rule.region_rules) {
                                                        if(region_v.region.includes(address.city_code)) {
                                                            let coutinue = cart_v.buy_num - Number(region_v.first_number)>0? Math.ceil(cart_v.buy_num - Number(region_v.first_number)):0;
                                                            price =  Number(region_v.first_amount) + (coutinue / region_v.continue_number) * Number(region_v.continue_amount);
                                                            priceList.push(price);
                                                        }
                                                    }
                                                    express_amount.push(maxPrice(priceList));
                                                }
                                            } else {
                                                if(express_rule.express_template_type == 1) {
                                                    let coutinue = sku_v.weight - express_rule.first_number>0? Math.ceil(sku_v.weight - express_rule.first_number):0;
                                                    price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount)
                                                } else {
                                                    let coutinue = cart_v.buy_num - express_rule.first_number>0? Math.ceil(cart_v.buy_num - express_rule.first_number):0;
                                                    price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount)
                                                }
                                            }
                                            express_amount.push(Number(price))
                                        }
                                        let sku_name = '';
                                        for (let skus_v of sku_v.skus) {
                                            if (sku_v.skus.indexOf(skus_v) == sku_v.skus.length -1) {
                                                sku_name += `${skus_v.k}:${skus_v.v}`
                                            } else {
                                                sku_name += `${skus_v.k}:${skus_v.v}; `
                                            }
                                        }
                                        let item_info: any = {
                                            item_id:item.id,
                                            name:item.name,
                                            weight:sku_v.weight,
                                            image:sku_v.images,
                                            sku_name,
                                            sku_id:cart_v.sku_id,
                                            buy_num:cart_v.buy_num,
                                            current_price:sku_v.current_price,
                                            category_id:item.category_id,
                                            order_type: 1,
                                            _order_type: '普通订单'
                                        };

                                        /**
                                         * 单个商品总金额 商品价格 花样价格
                                         */
                                        item_info.item_total_price = 0;

                                        /**
                                         * order_type为 2 一般定制 在普通商品基础上增加的数据
                                         * @tip 一般定制字段注释
                                         * {design_id} 花样id
                                         * {top_font_size} 花样id
                                         * {top_font_content} 花样id
                                         * {top_font_color} 花样id
                                         * {bottom_font_size} 花样id
                                         * {bottom_font_content} 花样id
                                         * {bottom_font_color} 花样id
                                         * {font_id} 花样id
                                         * {font_family} 花样id
                                         * {design_width} 花样id
                                         * {design_height} 花样id
                                         * {is_choose_design} 花样id
                                         * {custom_image} 花样id
                                         * {preview_image} 预览图
                                         * {design_price} 花样价格
                                         */
                                        if (cart_v.shopping_type == 2) {
                                                if(cart_v.design_info) {
                                                    if (cart_v.design_info.design_id) {
                                                        item_info.design_id = cart_v.design_info.design_id;
                                                        const shop_id = this.ctx.state.shop_id;
                                                        const design = await this.model('design').where({shop_id, design_id: item_info.design_id,del: 0, status: 3}).find();
                                                        if (think.isEmpty(design)) {
                                                            return '花样不存在!'
                                                        }
                                                        let design_price = cart_v.buy_num * design.price;

                                                        item_info.designer_id = design.designer_id;
                                                        item_info.designer_team_id = design.designer_team_id;

                                                        item_info.design_price = design.price;
                                                        item_info.design_png_path = design.prev_png_path;
                                                        item_info.design_emb_path = design.emb_path;
                                                        item_info.design_dst_path = design.dst_path;
                                                        item_info.design_txt_png_path = design.txt_png_path;
                                                        item_info.design_txt_file_path = design.txt_file_path;
                                                        pay_amount += design_price;
                                                        item_info.item_total_price += design_price;
                                                    }

                                                    item_info.top_font_size = cart_v.design_info.top_font_size;
                                                    item_info.top_font_content = cart_v.design_info.top_font_content;
                                                    item_info.top_font_color = cart_v.design_info.top_font_color;
                                                    item_info.bottom_font_size = cart_v.design_info.bottom_font_size;
                                                    item_info.bottom_font_content = cart_v.design_info.bottom_font_content;
                                                    item_info.bottom_font_color = cart_v.design_info.bottom_font_color;
                                                    item_info.font_id = cart_v.design_info.font_id;
                                                    item_info.font_family = cart_v.design_info.font_family;
                                                    item_info.design_width = cart_v.design_info.design_width;
                                                    item_info.design_height = cart_v.design_info.design_height;
                                                    item_info.is_choose_design = cart_v.design_info.is_choose_design;
                                                    item_info.custom_image = cart_v.design_info.custom_image;
                                                    item_info.preview_image = cart_v.design_info.preview_image;
                                                    item_info.order_type = 2;
                                                    item_info.image = cart_v.design_info.preview_image;
                                                    item_info._order_type = getOrderType(Number(item_info.order_type));
                                                } else {
                                                    return 'design_info of empty'
                                                }
                                            }
                                        /**
                                         * 手绘订单
                                         */
                                        if (cart_v.shopping_type == 4) {
                                            item_info.order_type = 4;
                                            item_info._order_type = getOrderType(item_info.order_type);
                                            /**
                                             * 上传手绘的图
                                             */
                                            item_info.preview_image = cart_v.design_info.preview_image;
                                            let baseData = cart_v.design_info.draw_image.replace(/data:image\/png;base64,/g,'');
                                            let drawBuffer = Buffer.from(baseData, 'base64');
                                            const fileName = think.uuid('v4');
                                            const oss = await think.service('oss');
                                            const filePath = `/demo/${1}/${fileName}.png`;
                                            const res: any = await oss.upload(Buffer.from(drawBuffer), filePath,true);
                                            item_info.draw_image = `http://${res.Location}`;
                                            /**
                                             * 订单预览图变成设计预览图
                                             */
                                            item_info.image = cart_v.design_info.preview_image;
                                        }
                                        item_info.item_total_price += sku_v.current_price * cart_v.buy_num;
                                        pay_amount += sku_v.current_price * cart_v.buy_num;
                                        item_list.push(item_info);
                                    }
                                }
                            }
                    } else {
                        return  '商品不存在';
                    }
                } else {
                    return '商品信息不合法';
                }
            }
            express_amount = (maxPrice(express_amount)) || 0;
            let total_price = express_amount + pay_amount;
            let result: object = {
                item_list,
                address:address,
                item_price:pay_amount.toFixed(2),
                express_amount:express_amount.toFixed(2),
                total_price:total_price.toFixed(2),
                order_type:order_type
            };
            return result;
        }catch ($err) {
            return $err.message;
            this.dealErr($err);
        }
    }

    /**
     * 计算价格
     * @params {cart_list} 购物列表 {id,buy_num,sku_id}
     * @params {address_id} 收货地址
     */
    async calculationAction() {
        try {
            let res =  await this.calculation();
            if (typeof res =='string') {
                return this.fail(-1, res);
            }
            return this.success(res, '获取成功');
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 取消订单
     * @param {order_no} 订单编号
     * @tip status -2 为已取消
     */
    async cancelAction() {
        try {
            const order_no = this.post('order_no');
            const res1: any = await this.model('order').where({order_no}).find();  //-2为已取消
            // @ts-ignore
            if (think.isEmpty(res1)) {
                return this.fail(-1, '订单不存在');
            }
            if (res1.status == -2) {
                return this.fail(-1, '该订单已取消, 请勿重复操作!');
            }
            const res: any = await this.model('order').where({order_no}).update({status:-2,_status:"已取消"});  //-2为已取消

            for (let item_v of res1.order_item) {
                /**
                 * 加存方法 现在sku是一个串  待优化
                 */
                await this.changeSumStock(item_v, 1);
                /**
                 * 减销量
                 */
                await this.model("item").where({id: item_v.item_id}).decrement('sale_num', item_v.buy_num);
            }
            return this.success(res, '取消订单成功');
        }catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 改变库存
     * @param {$item} 商品
     * @param {$add} true 增加 , false 减少
     */
    async changeSumStock($item: any,$add: any) {
        try {
            let res: any = await this.model('item').where({id: $item.item_id}).find();
            let sku_list = JSON.parse(res.sku_list);
            for (let sku_v of sku_list) {
                if ($item.sku_id == sku_v.sku_id) {
                    if ($add) {
                        sku_v.num = sku_v.num + $item.buy_num;
                    } else {
                        sku_v.num = sku_v.num - $item.buy_num;
                    }
                    break;
                }
            }
            let new_sku_list: any = JSON.stringify(sku_list);
            return await this.model('item').where({id: $item.item_id}).update({sku_list:new_sku_list});
        }catch ($err) {
            this.dealErr($err);
        }
    }


    /**
     * 确认收货
     * @param {order_no} order_no
     */
    async confirmReceivedAction() {
        try {
            const order_no: any = this.post('order_no');
            // @ts-ignore
            const user_id: any = this.ctx.state.userInfo.id;
            const shop_id: any = this.ctx.state.shop_id;
            let orderInfo: any = await this.model('order').where({shop_id, order_no, user_id}).find();
            if (think.isEmpty(orderInfo)) {
                return this.fail(-1, '该订单不存在')
            }
            if (orderInfo.status != 3) {
                let msg: string = '';
                switch (orderInfo.status) {
                    case 4:
                        msg = '该订单已完成!';
                        break;
                    case -2:
                        msg = '该订单已关闭!';
                        break;
                    case 2:
                        msg = '该订单已付款-待发货!';
                        break;
                    case 1:
                        msg = '该订单未支付!';
                        break;
                    case 5 || 6:
                        msg = '该订单询价中!';
                        break;
                }
                return this.fail(-1, msg)
            }
            let _status = '已完成';
            let res: any = await this.model('order').where({shop_id, order_no,user_id}).update({_status, status: 4});
            if (res) {
                return this.success(res, '请求成功!');
            }
        } catch ($err) {
            this.dealErr($err);
        }
    }
    /**
     * 查询快递
     * @param order_item_id 订单商品id
     */
    async orderTraceAction() {
        /**
         * 查询快递
         * 调用pc端查快递方法
         */
        const orderController = this.controller('order');
        await orderController.orderTraceAction();
    }
}

/**
 * 取数组中最大
 */
function maxPrice($data: any) {
    var max = $data[0];
    var len = $data.length;
    for (var i = 1; i < len; i++){
        if ($data[i] > max) {
            max = $data[i];
        }
    }
    return max;
}

/**
 * 获取订单类型文字
 */
function getOrderType($type: any) {
    let _order_type = '';
    switch ($type) {
        case 1:
            _order_type = '普通订单';
            break;
        case 2:
            _order_type = '一般定制订单';
            break;
        case 3 || 5:
            _order_type = '特殊定制订单';
            break;
        case 4:
            _order_type = '手绘订单';
            break;
    }
    return _order_type
}
