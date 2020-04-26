import Base from './base.js';
import {ancestorWhere} from "tslint";
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
     * @params {id} 商品id
     * @params {cart_list} 购物列表 {buy_num,sku_id}
     */
    async calculationAction() {
        try {
            const id = this.post('id');
            // const cart_list = JSON.parse(this.post('cart_list'));
            const cart_list = [{sku_id:'uthprrpptg00_id-st0v2iob0i00_id_mt1sslfev500_id-13ekfqibqt080_id',buy_num:3}];
            let item: any = await this.model('item').where({id:id}).find();
            if( item.id) {
                let sku_list = JSON.parse(item.sku_list);
                let pay_amount: any = 0;
                for (let cart_v of cart_list) {
                    for (let sku_v of sku_list) {
                        if (cart_v.sku_id == sku_v.sku_id) {
                            if (cart_v.buy_num > sku_v.num) {
                                return this.fail(-1, sku_v.sku_id+'购买数量超出库存' + sku_v.num);
                                break;
                            }
                            pay_amount += sku_v.current_price * cart_v.buy_num
                        }
                    }
                }
                pay_amount = pay_amount.toFixed(2);
                delete item.sku_list;
                delete item.sku_show;
                delete item.images;
                let result: object = {
                    item,
                    pay_amount
                }
                return this.success(result,'获取成功');
            } else {
                return this.fail(-1,'商品不存在');
            }
        }catch (e) {

        }
    }
}

