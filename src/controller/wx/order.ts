import Base from './base.js';
import {ancestorWhere} from "tslint";
import express_template from "../../model/express_template";
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
            this.success(res, '请求成功!');
        }catch (e) {
            this.fail(-1, e);
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
            if (Object.keys(res).length == 0) {
                return this.fail(-1, '该订单不存在!')
            }
            this.success(res,'请求成功!');
        }catch (e) {
            this.fail(-1, e);
        }
    }

    /**
     * 支付
     * @params {cart_list} 购物列表 {goods_id,buy_num,sku_id}
     * @params {shopping_type} 订单类型
     * @params {address_id} 收货地址id
     */
    // async calculationAction() {
    async payAction() {
        try {
            let shop_id = this.ctx.state.shop_id;
            const address_id: any = this.post('address_id');
            const order_type: any = this.post('shopping_type') || 1;
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
            const pay_amount: number = item_info.total_price;
            const express_amount: number = item_info.express_amount;
            const item_amount: number = item_info.item_price;
            // return this.success(item_info);
            /**
             * 创建订单存库
             */
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
                _order_type: '普通订单'
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
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 生成订单的编号order_no
     * @returns {年月日 时分秒 毫秒 随机数}
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
            const cart_list: any = this.post('cart_list');
            if(cart_list.length == 0) {
                return  '商品不能为空!'
            }
            const address_id: any = this.post('address_id') || 0;
            // const cart_list: any = [{id:88, sku_id:'12iqjhkhb4bg0_id-ugjmh1s2r6s0_id',buy_num:1},{sku_id:'12iqjhkhb4bg0_id-kgegv9cvs6k0_id', id:88,buy_num:100}];
            let address;
            if (!address_id) {
                address = await this.model('address').where({user_id, shop_id,is_default: 1}).find();
                if(Object.keys(address).length == 0) {
                    address = await this.model('addresss').where({user_id, shop_id}).find();
                }
            } else {
                address = await this.model('address').where({user_id, shop_id,address_id}).find();
            }
            let pay_amount: any = 0;
            let express_amount: any = [];
            let item_list: any = [];
            for (let cart_v of cart_list) {
                if (typeof cart_v == 'object' && cart_v.item_id) {
                    let item: any = await this.model('item').where({id: cart_v.item_id}).find();
                    if (item.id) {

                        let express_rule;
                        if (item.express_template_id) {
                            /**
                             * 物流模板规则
                             */
                            express_rule  = await this.model('express_template').where({express_template_id:item.express_template_id}).find();
                        }
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
                            /**
                             * 统一运费
                             */
                            if (item.express_fee) {
                                express_amount.push(Number(item.express_fee))
                            }
                            /**
                             * 物流模板计费
                             */
                            if (item.express_template_id) {
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
                            pay_amount += item.current_price * cart_v.buy_num;
                            let sku_name = item.name;

                            let item_info = {
                                item_id:item.id,
                                name:item.name,
                                weight:item.weight,
                                image:item.thumb_image_path,
                                sku_name,
                                sku_id:cart_v.sku_id || 0,
                                buy_num:cart_v.buy_num,
                                current_price:item.current_price,
                                category_id:item.category_id
                            };
                            item_list.push(item_info);
                        } else {
                            for (let sku_v of sku_list) {
                                if (cart_v.sku_id == sku_v.sku_id) {
                                    /**
                                     * 判断库存
                                     */
                                    if ( sku_v.num  == 0) {
                                        return  sku_v.sku_id+'库存不足';
                                        break;
                                    }
                                    if (cart_v.buy_num > sku_v.num ) {
                                        return  sku_v.sku_id+'购买数量超出库存' + sku_v.num;
                                        break;
                                    }
                                    /**
                                     * 统一运费
                                     */
                                    if (item.express_fee) {
                                        express_amount.push(Number(item.express_fee))
                                    }
                                    /**
                                     * 物流模板计费
                                     */
                                    if (item.express_template_id) {
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
                                    pay_amount += sku_v.current_price * cart_v.buy_num;
                                    let sku_name = '';
                                    for (let skus_v of sku_v.skus) {
                                        if (sku_v.skus.indexOf(skus_v) == sku_v.skus.length -1) {
                                            sku_name += `${skus_v.k}:${skus_v.v}`
                                        } else {
                                            sku_name += `${skus_v.k}:${skus_v.v}; `
                                        }
                                    }
                                    let item_info = {
                                        item_id:item.id,
                                        name:item.name,
                                        weight:sku_v.weight,
                                        image:sku_v.images,
                                        sku_name,
                                        sku_id:cart_v.sku_id,
                                        buy_num:cart_v.buy_num,
                                        current_price:sku_v.current_price,
                                        category_id:item.category_id
                                    };
                                    item_list.push(item_info);
                                }
                            }
                        }
                    } else {
                        return  '商品不存在'
                    }
                } else {
                    return '商品信息不合法'
                }
            }
            express_amount = maxPrice(express_amount);
            let result: object = {
                item_list,
                address:address,
                item_price:pay_amount,
                express_amount,
                total_price:express_amount + pay_amount
            };
            return result
        }catch (e) {
            return this.fail(-1, e);
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
        }catch (e) {
            return this.fail(-1, e);
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
            if (Object.keys(res1) == 0) {
                return this.fail(-1, '订单不存在');
            }
            if (res1.status  == 2) {
                return this.fail(-1, '该订单已取消, 请勿重复操作!');
            }
            const res: any = await this.model('order').where({order_no}).update({status:-2,_status:"已取消"});  //-2为已取消

            /**
             * 减库存方法 现在sku是一个串  待优化
             */
            for (let item_v of res1.order_item) {
                await this.changeSumStock(item_v, 1);
            }
            return this.success(res, '取消订单成功');
        }catch (e) {
            return this.fail(-1, e);
        }
    }

    /**
     * 改变库存
     * @param {$item} 商品
     * @param {$add} true 增加  false 减少
     */
    async changeSumStock($item: any,$add: any) {
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
