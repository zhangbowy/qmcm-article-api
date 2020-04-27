import Base from './base.js';
import {ancestorWhere} from "tslint";
import express_template from "../../model/express_template";
const path = require('path');
export default class extends Base {

    /**
     * 创建订单
     * @params {cart_list} 购物列表 {goods_id,buy_num,sku_id}
     * @params {order_type} 订单类型
     * @params {address_id} 收货地址id
     */
    createAction() {

    }

    /**
     * 计算价格
     * @params {cart_list} 购物列表 {id,buy_num,sku_id}
     * @params {address_id} 收货地址
     */
    async calculationAction() {
        try {
            const shop_id: number = this.ctx.state.shop_id;
            const user_id: number = this.ctx.state.userInfo.id;
            const cart_list: any = this.post('cart_list');
            if(cart_list.length == 0) {
                return this.fail(-1, '商品不能为空!');
            }
            const address_id: any = this.post('address_id') || 0;
            // const cart_list: any = [{id:88, sku_id:'12iqjhkhb4bg0_id-ugjmh1s2r6s0_id',buy_num:1},{sku_id:'12iqjhkhb4bg0_id-kgegv9cvs6k0_id', id:88,buy_num:100}];
            let address;
            if (!address_id) {
                address = await this.model('address').where({user_id, shop_id,is_default:1}).find();
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
                if (typeof cart_v == 'object' && cart_v.id) {
                    let item: any = await this.model('item').where({id: cart_v.id}).find();
                    if (item.id) {
                        let express_rule;
                        if (item.express_template_id) {
                            /**
                             * 物流模板规则
                             */
                            express_rule  = await this.model('express_template').where({express_template_id:item.express_template_id}).find();
                        }
                        let sku_list = JSON.parse(item.sku_list);
                        for (let sku_v of sku_list) {
                            if (cart_v.sku_id == sku_v.sku_id) {
                                /**
                                 * 判断库存
                                 */
                                if (cart_v.buy_num > sku_v.num) {
                                    return this.fail(-1, sku_v.sku_id+'购买数量超出库存' + sku_v.num);
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
                                        if(express_rule.type == 1) {
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
                                    id:item.id,
                                    name:item.name,
                                    weight:sku_v.weight,
                                    images:sku_v.images,
                                    sku_name,
                                    sku_id:cart_v.sku_id,
                                    buy_num:cart_v.buy_num,
                                    current_price:sku_v.current_price,
                                    category_id:item.category_id
                                };
                                item_list.push(item_info);
                            }
                        }
                    } else {
                        return this.fail(-1, '商品不存在');
                    }
                } else {
                    return this.fail(-1, '商品信息不合法');
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
            return this.success(result, '获取成功');
        }catch (e) {
            return this.fail(-1, e);
        }
    }
}

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
