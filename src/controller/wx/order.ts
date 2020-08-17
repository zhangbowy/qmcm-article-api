import Base from './base.js';
import express_template from "../../model/express_template";
import {think} from "thinkjs";
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const _ = require('lodash');
const WXPay = require('weixin-pay');
const crypto = require('crypto');
const AdmZip = require('adm-zip');

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
            const where: any = {del: 0};
            where.shop_id = shop_id;
            where.user_id = user_id;
            if (status) {
                where.status = ['in', status];
            }
            const res = await this.model('order').setRelation('order_item').page(page, limit).order('order_no DESC').where(where).countSelect();
            return this.success(res, '获取订单列表!');
        } catch (e) {
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
            const res = await this.model('order').setRelation('order_item').order('order_no DESC').where({del: 0, user_id, shop_id, order_no}).find();
            if (think.isEmpty(res)) {
                return this.fail(-1, '该订单不存在!');
            }
            return this.success(res, '订单详情!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 创建订单
     * @params {cart_list} 购物列表 {goods_id,buy_num,sku_id}
     * @params {shopping_type} 订单类型
     * @params {address_id} 收货地址id
     * @return order_no
     */
    // async calculation() {
    async createAction() {
        try {
            const shop_id = this.ctx.state.shop_id;
            const address_id: any = this.post('address_id');
            // const order_type: any = this.post('shopping_type') || 1;
            const pay_type: any = this.post('pay_type') || 1;
            const buyer_message: any = this.post('buyer_message') || "";
            const userInfo = this.ctx.state.userInfo;
            const user_id: any = userInfo.id;
            if (!address_id) {
                return this.fail(-1, "收货地址不能为空!");
            }
            /**
             * 生成订单号
             */
            const order_no = await this.generateOrderNumber();
            /**
             * 再次计算商品信息和价格
             */
            const item_info: any = await this.calculation(true);
            if (typeof item_info == 'string') {
                return this.fail(-1, item_info);
            }
            const address = item_info.address;
            const receiver_name: string = address.name;
            const receiver_phone: string = address.phone;
            const receiver_address: string = `${address.province}${address.city}${address.area}${address.address}`;
            const pay_amount: number = Number(item_info.total_price);
            const express_amount: number = Number(item_info.express_amount);
            const item_amount: number = Number(item_info.item_price);
            /**
             * 创建订单存库
             */
            const order_type = item_info.order_type || 1;
            let _status;
            let status = 1;
            switch (order_type) {
                case 1:
                    _status = '待付款';
                    break;
                case 2:
                    _status = '待付款';
                    break;
                case 4:
                    _status = '待付款';
                    break;
                case 3:
                    _status = "询价中";
                    status = 5;
                    break;
            }
            const _order_type =  getOrderType(order_type);
            delete this.ctx.state.userInfo.id;
            const order_id = await this.model('order').add({
                user_id,
                nickname: userInfo.nickname,
                headimgurl: userInfo.headimgurl,
                _status,
                status,
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
                _order_type,
                designer_id: item_info.item_list[0].designer_id,
                designer_team_id: item_info.item_list[0].designer_team_id,
                custom_template_id: item_info.item_list[0].custom_template_id,
                custom_category_id: item_info.item_list[0].custom_category_id,
                logistics_type: item_info.logistics_type,
                _logistics_type: item_info._logistics_type

            });
            if (order_id) {
                const item_list = item_info.item_list;
                for (const item_v of item_list) {
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
                    item_v._item_status = _status;
                    item_v.item_status = status;
                    /**
                     * 减库存方法 现在sku是一个串  待优化
                     */
                    await this.changeSumStock(item_v, 0);
                    await this.model("item").where({id: item_v.item_id}).increment('sale_num', item_v.buy_num);
                    item_v.order_id = order_id;
                }
                /**
                 * 订单商品信息存库
                 */
                for (const item_v of item_list) {
                    await this.model('order_item').add(item_v);
                    // await this.model('order_item').addMany(item_list);
                }
                return this.success({
                    order_id,
                    order_no,
                    pay_amount
                });
            } else {
                return this.fail(-1, "创建订单失败!");
            }
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 支付
     * @param {order_no} 订单号
     */
    async payAction() {
        try {
            const order_no = this.post('order_no');

            const orderInfo: any = await this.model('order').where({order_no}).find();
            if (orderInfo.status != 1 && orderInfo.status != 6) {
                let msg: string = '该订单已支付!';
                switch (orderInfo.status) {
                    case -2:
                        msg = '该订单已关闭';
                        break;
                    case 5:
                        msg = '该订单询价中';
                        break;
                }
                return this.fail(-1, msg);
            }
            if (think.isEmpty(orderInfo)) {
                return this.fail(-1, "該訂單不存在!");
            }

            /**
             * 轮询每隔两秒查询是否支付主动更新订单状态
             */
            const _this = this;
            let ints = 0;
            // tslint:disable-next-line:only-arrow-functions
            const see = setInterval( async function() {
                const bool = await _this.isPay(orderInfo);
                ints += 1;
                if (bool) {
                    console.log('已支付');
                    clearInterval(see);
                }
                if (ints == 30 * 15) {
                    clearInterval(see);
                }
            }, 2000);

            const wxOrder = await this.findOrder(orderInfo, orderInfo.prepay_id);
            if (!think.isEmpty(wxOrder)) {
                return this.json(wxOrder);
            }
            const pay_fee = this.accMul(orderInfo.pay_amount, 100);
            const res: any = await this.getWxPay(orderInfo, pay_fee);
            if (!think.isObject(res)) {
                return this.fail(-1, res);
            }
            // const key = payParams.package.split('=')[0];
            // const val = payParams.package.split('=')[1];
            await this.model('order').where({order_no}).update({prepay_id: res.result.prepay_id});

            return this.success(res.payParams);
        } catch (e) {
            this.dealErr(e);
        }

    }

    /**
     * 判断是否支付
     */
   async isPay($order: any) {
        const wxOrder: any = await this.findOrder($order);
        if (wxOrder.msg == '该订单已支付') {
            await this.updateOrder($order);
           // await think.model('order').where({order_no: order.order_no}).update({status: 2, _status: "待发货"});
            return  true;
       } else {
            return false;
       }
    }

    /**
     * 退款
     * @param $order
     */
    async refundAction() {
       try {
           const order = {order_no: '20200609110740995740542', shop_id: 15};
           // const order = {order_no: '20200611091858244587926', shop_id: 15};
           // const orderInfo = await this.model('order').where({order_no}).find();
           const res = await this.refund(order);
           return this.success(res);
       } catch (e) {

       }
    }

    /**
     * 退款
     * @param $order
     */
    async refund($order: any) {
        const shopConfig = await think.model('shop_setting').where({shop_id: $order.shop_id}).find();
        const path1 = path.join(think.RUNTIME_PATH, '/cert/15.p12');
        const data = await fs.readFileSync(path1);
        const wxpay = WXPay({
            appid: shopConfig.appid,
            mch_id: shopConfig.mch_id,
            partner_key: shopConfig.wxpay_key, // 微信商户平台API密钥
            pfx: data, // 微信商户平台证书
            // pfx: fs.readFileSync('./wxpay_cert.p12'), //微信商户平台证书
        });
        // const orderInfo = await this.model('order').where({order_no: $order.order_no}).find();
        // if (think.isEmpty(orderInfo)) {
        //     return this.fail(-1, '订单不存在');
        // }
        // const fee: number =  this.accMul(orderInfo.pay_amount, 100);
        const params = {
            appid: shopConfig.appid,
            mch_id:  shopConfig.mch_id,
            op_user_id: '店铺',
            out_refund_no: 'zhangbo' + Math.random().toString().substr(2, 10),
            total_fee: 1500 , // 原支付金额ge't
            // total_fee: 1 , // 原支付金额ge't
            refund_fee: 1500, // 退款金额
            // transaction_id: '微信订单号'
            out_trade_no: $order.order_no
        };
        return  new Promise((resolve, reject) => {
            // @ts-ignore
            wxpay.refund(params, (err, result) => {
                console.log('refund', arguments);
                resolve(err || result);
            });
        });
    }

    /**
     * 定时任务
     */
    async crontabAction() {
        console.log('定时任务');
        const orderList = await think.model('order').where({status: 1}).select();
        const today = new Date().getTime();
        const now = today;
        // let oneDay =think.ms('1 days');
        // let oneDay = 1000*60*60*8 + 1000*60;
        const half_hour = 1000 * 60 * 30;
        const list: any = [];
        for (const order of orderList) {
            const wxOrder: any = await this.findOrder(order);
            const created_time = new Date(order.created_at).getTime();
            if (now - created_time > half_hour) {
                list.push(order);
                console.log(created_time);
                await think.model('order').where({id: order.id}).update({
                    _status: "超时未支付,已取消",
                    status: -2
                });
                await this.cancelWxOrder(order);
                await think.model('order_item').where({order_id: order.id}).update({
                    item_status: -2
                });
            } else {
                if (wxOrder.msg == '该订单已支付') {
                    // await think.model('order').where({order_no: order.order_no}).update({status: 2, _status: "待发货"});
                    await this.updateOrder(order);
                }
            }
        }
    }

    /**
     * 取消订单
     * @param $order
     */
    async cancelWxOrder($order: any) {
        const shopConfig = await think.model('shop_setting').where({shop_id: $order.shop_id}).find();
        const wxpay = WXPay({
            appid: shopConfig.appid,
            mch_id: shopConfig.mch_id,
            partner_key: shopConfig.wxpay_key, // 微信商户平台API密钥
            // pfx: fs.readFileSync('./wxpay_cert.p12'), //微信商户平台证书
        });
        return new Promise((resolve, reject) => {
            // @ts-ignore
            // tslint:disable-next-line:only-arrow-functions
            wxpay.closeOrder({ out_trade_no: $order.order_no}, function(err, result) {
                resolve(result);
            });
        });

    }

    /**
     * 待支付的订单更新订单状态
     * @param $order
     */
    async updateOrder($order: any) {
        const orderInfo: any = await this.model('order').where( {order_no: $order.order_no}).find();
        if (orderInfo.status != 1 && orderInfo.status != 6) {
            return this.fail(-1, '失败');
        }
        let _status = "待发货";
        const pay_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');

        let udpOption: any;
        if (orderInfo.order_type == 1) {
            udpOption = {pay_time, _status, status: 2};
        }
        if (orderInfo.order_type == 2) {
            const order_item = await this.model('order_item').where({order_id: orderInfo.id}).find();
            if (orderInfo.designer_id && orderInfo.custom_template_id != 2) {
                /**
                 * 有花样的订单 并且有文字 直接推给设计师
                 */
                _status = "设计师处理中";
                const _designer_status = '设计师处理中';
                udpOption = {designer_price: order_item.design_price, _designer_status, designer_status: 3, pay_time, _status, status: 9 };
            } else if (orderInfo.designer_id && orderInfo.custom_template_id == 2) {
                /**
                 * 有花样的订单 并且无文字只有一个花样 直接送去打印
                 */
                if (orderInfo.logistics_type == 2) {
                     _status = "门店订单处理中";
                } else {
                    _status = "待打印";
                }
                udpOption = {designer_price: order_item.design_price, pay_time, _status, status: 10};
            } else {
                /**
                 * 其余自己上传的图各种组合 去到待派单
                 */
                _status = "待派单";
                udpOption = {pay_time, _status, status: 7};
            }
        }
        if (orderInfo.order_type == 4 || orderInfo.order_type == 3) {
            _status = "待派单";
            // res = await this.model('order').where({shop_id, id: order_id}).update({pay_time, _status, status: 7});
            udpOption = {pay_time, _status, status: 7};
        }
        const res: any = await this.model('order').where({order_no: $order.order_no}).update(udpOption);
        // await think.model('order').where({order_no: $order_no}).update({status: 2, _status: "待发货"});
        return  true;
    }

    /**
     * 统一下单
     * @param $order
     * @param $pay_fee
     */
    async getWxPay($order: any, $pay_fee: number) {
        const shopConfig = await think.model('shop_setting').where({shop_id: $order.shop_id}).find();
        // const shopConfig = this.config('shopConfig');
        const wxpay = WXPay({
            appid: shopConfig.appid,
            mch_id: shopConfig.mch_id,
            partner_key: shopConfig.wxpay_key, // 微信商户平台API密钥
            // pfx: fs.readFileSync('./wxpay_cert.p12'), //微信商户平台证书
        });
        const openid =   this.ctx.state.userInfo.openid;
        const order = Date.now();
        return new Promise((resolve, reject) => {
            wxpay.createUnifiedOrder({
                trade_type: 'JSAPI',
                openid,
                body: order + '云易绣商城',
                detail: '公众号支付测试',
                out_trade_no: $order.order_no,
                total_fee: $pay_fee,
                spbill_create_ip: this.ctx.ip,
                notify_url: 'http://cxgh.tecqm.club/api/wx/order/notify'
                // tslint:disable-next-line:only-arrow-functions
            }, function(err: any, result: any) {
                if (result.return_code == 'SUCCESS') {
                    const  payParams: any = {
                        appId: shopConfig.appid,
                        timeStamp: Math.floor(Date.now() / 1000) + " ",
                        nonceStr: result.nonce_str,
                        package: "prepay_id=" + result.prepay_id,
                        signType: "MD5"
                    };
                    payParams.paySign = wxpay.sign(payParams);
                    resolve({payParams, result});
                } else {
                    resolve(result.return_msg);
                }
            });
            // wxpay.getBrandWCPayRequestParams({
            //     openid,
            //     body: order + '公众号支付测试',
            //     detail: '公众号支付测试',
            //     out_trade_no: $order.order_no,
            //     total_fee: $pay_fee,
            //     spbill_create_ip: this.ctx.ip,
            //     notify_url: 'http://cxgh.tecqm.club/api/wx/order/notify'
            //     // tslint:disable-next-line:only-arrow-functions
            // }, function(err: any, result: any) {
            //     // in express
            //     resoled(result || err);
            // });
        });
    }

    /**
     * 查询订单
     * @param $order
     * @param $prepay_id
     */
    async findOrder($order: any, $prepay_id?: any) {
        const shopConfig = await think.model('shop_setting').where({shop_id: $order.shop_id}).find();
        // const shopConfig = this.config('shopConfig');
        const wxpay = WXPay({
            appid: shopConfig.appid,
            mch_id: shopConfig.mch_id,
            partner_key: shopConfig.wxpay_key, // 微信商户平台API密钥
            // pfx: fs.readFileSync('./wxpay_cert.p12'), //微信商户平台证书
        });
        return  new Promise((resolve, reject) => {
            // tslint:disable-next-line:only-arrow-functions
            wxpay.queryOrder({ out_trade_no: $order.order_no }, function(err: any, order: any) {
                // console.log(order);
                let result: any;
                if (order.return_code) {
                    if (order.result_code == 'FAIL') {
                        result = {};
                    } else {
                        if (order.trade_state && order.trade_state == 'NOTPAY') {
                            const  reqparam: any = {
                                appId: shopConfig.appid,
                                timeStamp: Math.floor(Date.now() / 1000) + "",
                                nonceStr: order.nonce_str,
                                package: "prepay_id=" + $prepay_id,
                                signType: "MD5"
                            };
                            reqparam.paySign = wxpay.sign(reqparam);
                            result =  {code: 0, msg: '微信支付参数', data: reqparam};
                        } else if (order.trade_state == 'SUCCESS') {
                            // tslint:disable-next-line:no-unused-expression
                            result = {code: -1, msg: "该订单已支付", data: ""};
                        } else if (order.trade_state == 'CLOSED') {
                            result =  {code: -1, msg: "该订单已关闭", data: ""};
                        } else if (order.trade_state == 'REFUND') {
                            result =  {code: -1, msg: "该订单转入退款", data: ""};
                        } else if (order.trade_state == 'PAYERROR') {
                            result =  {code: -1, msg: "支付失败,未知错误", data: ""};
                        }

                    }
                }
                resolve(result);
            });
        });

    }

    /**
     * 微信支付回调接口
     */
    async notifyAction() {
        try {
            const WeixinSerivce = think.service('weixin');
            const result = WeixinSerivce.payNotify(this.post('xml'));
            console.log(result);
            if (!result) {
                return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`;
            }

            const orderModel = this.model('order');
            const orderInfo = await orderModel.where({order_no: result.out_trade_no}).find();
            if (think.isEmpty(orderInfo)) {
                return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
            }
            await this.model('order').where({order_no: result.out_trade_no}).update({transaction_id: result.transaction_id});
            const order  = await this.updateOrder(orderInfo);
            if (order) {

            } else {
                return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
            }
            console.log(order);
            return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
        } catch (e) {
           this.dealErr(e);
        }
    }

    /**
     * 生成订单的编号order_no
     * @returns {年 月 日 时 分 秒 毫秒  + 随机数}
     */
    async generateOrderNumber() {
        const date = new Date();
        return date.getFullYear() + _.padStart(date.getMonth() + 1, 2, '0') + _.padStart(date.getDate(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0') + date.getMilliseconds() + _.random(100000, 999999);
    }

    /**
     * 计算价格
     * @params {cart_list} 购物列表 {id,buy_num,sku_id}
     * @params {address_id} 收货地址
     */
    async calculation($from: boolean) {
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
            const cart_list: any = this.post('cart_list');
            const logistics_type: any = this.post('logistics_type');
            if (cart_list.length == 0) {
                return  '商品不能为空!';
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
                address = await this.model('address').where({user_id, shop_id, is_default: 1}).find();
                if (Object.keys(address).length == 0) {
                    address = await this.model('address').where({user_id, shop_id}).find();
                    if (think.isEmpty(address)) {
                        // return  '请先添加收货地址!'
                    }
                }
            } else {
                address = await this.model('address').where({user_id, shop_id, address_id}).find();
            }
            /**
             * 总支付
             */
            let pay_amount: any = 0;
            /**
             * 总快递费
             */
            let express_amount: any = [];
            const item_list: any = [];

            /**
             *  购物类型 / 订单类型
             */
            const order_type = cart_list[0].shopping_type;
            // const logistics_type = cart_list[0].logistics_type || 1;
            let _logistics_type = '快递发货';
            for (const cart_v of cart_list) {
                if (logistics_type && logistics_type == 2) {
                    if (cart_v.shopping_type != 2 || cart_v.design_info.is_choose_design == 0 || cart_v.design_info.custom_template_id != 2) {
                        return  '只有单个花样定制支持门店自提';
                    } else {

                    }
                }
                if (order_type != cart_v.shopping_type) {
                    const _shopping_type = getOrderType(cart_v.shopping_type);
                    const _order_type = getOrderType(order_type);
                    return `【${_shopping_type}】不能与【${_order_type}】一起下单`;
                }

                if (typeof cart_v == 'object' && cart_v.item_id) {
                    /**
                     * 购物车里的每一项
                     */
                    const item: any = await this.model('item').where({id: cart_v.item_id}).find();
                    if (item.id) {
                        /**
                         * is_presell  是否为预售商品 是的话就不能购买
                         */
                        if (!item.is_presell) {
                            return `定制商品【${item.name}】不可购买`;
                        }
                        let express_rule;
                        if (item.express_template_id) {
                            /**
                             * 物流模板规则
                             */
                            express_rule  = await this.model('express_template').where({express_template_id: item.express_template_id}).find();
                        }
                        /**
                         * sku列表
                         */
                        const sku_list = JSON.parse(item.sku_list);

                        if (sku_list.length == 0 ) {

                                /**
                                 * 判断库存
                                 */
                                if ( item.sum_stock  == 0) {
                                    return  item.name + '库存不足';
                                    break;
                                }
                                if (cart_v.buy_num <= 0) {
                                    return `商品【${item.name}】购买数量不能为0`;
                                    break;
                                }
                                if (cart_v.buy_num > item.sum_stock ) {
                                    return  item.name + '购买数量超出库存' + item.sum_stock;
                                    break;
                                }
                                if (logistics_type == 1) {
                                    if (item.express_type == 0) {
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
                                        express_amount.push(Number(item.express_fee));
                                    }
                                    /**
                                     * 物流模板计费
                                     */
                                    if (item.express_type == 2 && item.express_template_id && address.user_id) {
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
                                                const priceList = [];
                                                for (const region_v of express_rule.region_rules) {
                                                    if (region_v.region.includes(address.city_code)) {
                                                        const coutinue = item.weight - Number(region_v.first_number) > 0 ? Math.ceil(item.weight - Number(region_v.first_number)) : 0;
                                                        price =  Number(region_v.first_amount) + (coutinue / region_v.continue_number) * Number(region_v.continue_amount);
                                                        priceList.push(price);
                                                    }
                                                }
                                                express_amount.push(maxPrice(priceList));
                                            } else {
                                                const priceList = [];
                                                for (const region_v of express_rule.region_rules) {
                                                    if (region_v.region.includes(address.city_code)) {
                                                        const coutinue = cart_v.buy_num - Number(region_v.first_number) > 0 ? Math.ceil(cart_v.buy_num - Number(region_v.first_number)) : 0;
                                                        price =  Number(region_v.first_amount) + (coutinue / region_v.continue_number) * Number(region_v.continue_amount);
                                                        priceList.push(price);
                                                    }
                                                }
                                                express_amount.push(maxPrice(priceList));
                                            }
                                        } else {
                                            if (express_rule.express_template_type == 1) {
                                                const coutinue = item.weight - express_rule.first_number > 0 ? Math.ceil(item.weight - express_rule.first_number) : 0;
                                                price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount);
                                            } else {
                                                const coutinue = cart_v.buy_num - express_rule.first_number > 0 ? Math.ceil(cart_v.buy_num - express_rule.first_number) : 0;
                                                price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount);
                                            }
                                        }
                                        express_amount.push(Number(price));
                                    }
                                    // const sku_name = item.name;
                                } else {
                                    express_amount.push(0);
                                }
                                const sku_name = "";

                                /**
                                 * order_type为1 默认普通商品 的商品数据 baseData 只要里面的商品都会有的
                                 */
                                const item_info: any = {
                                    item_id: item.id,
                                    name: item.name,
                                    weight: item.weight,
                                    image: item.thumb_image_path,
                                    sku_name,
                                    sku_id: cart_v.sku_id || 0,
                                    buy_num: cart_v.buy_num,
                                    current_price: item.current_price,
                                    category_id: item.category_id,
                                    custom_category_id: item.custom_category_id,
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
                                            // const shop_id = this.ctx.state.shop_id;
                                            const design = await this.model('design').where({shop_id, design_id: item_info.design_id, del: 0, status: 3}).find();
                                            if (think.isEmpty(design)) {
                                                return '花样不存在!';
                                            }

                                            const design_price = cart_v.buy_num * design.price;

                                            item_info.designer_id = design.designer_id;
                                            item_info.designer_team_id = design.designer_team_id;
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

                                        item_info.custom_template_id = cart_v.design_info.custom_template_id;

                                        item_info.top_font_width = cart_v.design_info.top_font_width;
                                        item_info.top_font_height = cart_v.design_info.top_font_height;
                                        item_info.top_font_content = cart_v.design_info.top_font_content;
                                        item_info.top_font_color = cart_v.design_info.top_font_color;

                                        item_info.bottom_font_height = cart_v.design_info.bottom_font_height;
                                        item_info.bottom_font_width = cart_v.design_info.bottom_font_width;
                                        item_info.bottom_font_content = cart_v.design_info.bottom_font_content;
                                        item_info.bottom_font_color = cart_v.design_info.bottom_font_color;

                                        item_info.font_id = cart_v.design_info.font_id;
                                        item_info.font_family = cart_v.design_info.font_family;
                                        item_info.design_width = cart_v.design_info.design_width;
                                        item_info.design_height = cart_v.design_info.design_height;
                                        item_info.is_choose_design = cart_v.design_info.is_choose_design;

                                        if (item_info.is_choose_design != 1) {

                                            if (item_info.custom_template_id == 2 || 3) {
                                                const custom_image_base64 = cart_v.design_info.custom_image.split(',')[1];

                                                if (item_info.custom_template_id != 1) {
                                                    const meta  = await sharp(Buffer.from(custom_image_base64, 'base64')).metadata();
                                                    item_info.design_width = meta.width / meta.height *  item_info.design_height;
                                                }
                                                const sqr  = item_info.design_width *  item_info.design_height +  item_info.top_font_width * item_info.top_font_height  +   item_info.bottom_font_height * item_info.bottom_font_width;
                                                const price = await this.getEmbPrice(sqr, item_info.custom_template_id);
                                                item_info.design_area_sqr = sqr;
                                                item_info.emb_template_price = price;
                                                pay_amount += price;
                                                item_info.item_total_price += price;
                                                const oss = await think.service('oss');
                                                const fileName = think.uuid('v4');
                                                const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                                const filePath = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
                                                /**
                                                 * 上传到腾讯OSS
                                                 */
                                                const res: any = await oss.upload(Buffer.from(custom_image_base64, 'base64'), filePath, true);
                                                item_info.custom_image = 'http://' + res.Location;
                                            } else {
                                                const sqr =  item_info.top_font_width * item_info.top_font_height;
                                                const price = await this.getEmbPrice(sqr, item_info.custom_template_id);
                                                item_info.design_area_sqr = sqr;
                                                item_info.emb_template_price = price;
                                                pay_amount += price;
                                            }
                                            // item_info.custom_image = cart_v.design_info.custom_image;
                                        } else {
                                            if (item_info.custom_template_id == 2) {
                                                if (logistics_type == 2) {
                                                    _logistics_type  = '门店自提';
                                                    item_info._logistics_type = '门店自提';
                                                }
                                            }
                                            item_info.custom_image = cart_v.design_info.custom_image;
                                        }

                                        if ($from) {
                                            const design_area_image_buffer = await this.getBuffer(this, cart_v.design_info.design_area_image, true);
                                            const preview_image_buffer = await this.getBuffer(this,  cart_v.design_info.preview_image, true);
                                            const oss = await think.service('oss');
                                            const fileName = think.uuid('v4');
                                            const fileName2 = think.uuid('v4');
                                            const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                            const design_area_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
                                            const preview_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName2}.png`;
                                            /**
                                             * 上传到腾讯OSS
                                             */
                                            // @ts-ignore
                                            const area_res: any = await oss.upload(Buffer.from(design_area_image_buffer), design_area_image_path, true);
                                            item_info.design_area_image = 'http://' + area_res.Location;
                                            // @ts-ignore
                                            const preview_res: any = await oss.upload(Buffer.from(preview_image_buffer), preview_image_path, true);
                                            item_info.preview_image = 'http://' + preview_res.Location;
                                        } else {
                                            item_info.design_area_image = cart_v.design_info.design_area_image;
                                            item_info.preview_image = cart_v.design_info.preview_image;
                                        }

                                        item_info.order_type = 2;
                                        item_info.image = item_info.preview_image;
                                        item_info._order_type = getOrderType(item_info.order_type);

                                    } else {
                                        return  'design_info of empty';
                                    }
                                }

                                /**
                                 * order_type为 3是特殊定制商品
                                 */
                                if (cart_v.shopping_type == 3) {
                                    if (cart_v.design_info) {

                                        item_info.custom_template_id = cart_v.design_info.custom_template_id;

                                        const emb_template: any =  await this.model('emb_template').where({emb_template_id: ['IN', item_info.custom_template_id]}).getField('template_name');
                                        if (think.isEmpty(emb_template)) {
                                            return '定制模板不存在';
                                        }
                                        item_info.special_template_name = emb_template.join(',');
                                        item_info.special_custom_width = cart_v.design_info.special_custom_width;
                                        item_info.special_custom_height = cart_v.design_info.special_custom_height;
                                        item_info.special_color_num = cart_v.design_info.special_color_num;
                                        item_info.special_custom_desc = cart_v.design_info.special_custom_desc;
                                        const special_custom_image_base64 = cart_v.design_info.special_custom_image.split(',')[1];
                                        const sqr  = item_info.special_custom_width *  item_info.special_custom_height ;
                                        let price_template;
                                        // 多选 用多功能混合绣的价格 单选用自己
                                        if (item_info.custom_template_id.length > 1) {
                                            price_template = 11;
                                        } else {
                                            price_template = item_info.custom_template_id[0];

                                        }
                                        const price = await this.getEmbPrice(sqr, price_template);
                                        item_info.special_custom_sqr = sqr;
                                        item_info.special_custom_price = price;
                                        pay_amount += price;
                                        item_info.item_total_price += price;
                                        item_info.special_base_price = price + item.current_price * cart_v.buy_num;
                                        const oss = await think.service('oss');
                                        const fileName = think.uuid('v4');
                                        const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                        const filePath = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
                                        /**
                                         * 上传到腾讯OSS
                                         */
                                        const res: any = await oss.upload(Buffer.from(special_custom_image_base64, 'base64'), filePath, true);
                                        item_info.special_custom_image = 'http://' + res.Location;

                                        // item_info.design_area_image = cart_v.design_info.design_area_image;
                                        // item_info.preview_image = cart_v.design_info.preview_image;
                                        item_info.preview_image = item_info.special_custom_image;
                                        item_info.order_type = 3;
                                        item_info.image = item_info.special_custom_image;
                                        item_info._order_type = getOrderType(item_info.order_type);

                                    } else {
                                        return  'design_info of empty';
                                    }
                                }

                                /**
                                 * 手绘订单
                                 */
                                if (cart_v.shopping_type == 4) {
                                    item_info.custom_template_id = 2;
                                    item_info.design_width = cart_v.design_info.design_width;
                                    item_info.design_height = cart_v.design_info.design_height;
                                    const sqr  = item_info.design_width *  item_info.design_height;
                                    const price = await this.getEmbPrice(sqr, item_info.custom_template_id);
                                    pay_amount += price;
                                    item_info.design_area_sqr = sqr;
                                    item_info.emb_template_price = price;
                                    item_info.item_total_price += price;
                                    item_info.order_type = 4;
                                    item_info._order_type = getOrderType(item_info.order_type);

                                    item_info.draw_height = cart_v.design_info.draw_height;
                                    item_info.draw_width = cart_v.design_info.draw_width;

                                    if ($from) {
                                        const design_area_image_buffer = await this.getBuffer(this, cart_v.design_info.design_area_image, true);
                                        const preview_image_buffer = await this.getBuffer(this,  cart_v.design_info.preview_image, true);
                                        const oss1 = await think.service('oss');
                                        const fileName1 = think.uuid('v4');
                                        const fileName2 = think.uuid('v4');
                                        const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                        const design_area_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName1}.png`;
                                        const preview_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName2}.png`;
                                        /**
                                         * 上传到腾讯OSS
                                         */
                                            // @ts-ignore
                                        const area_res: any = await oss1.upload(Buffer.from(design_area_image_buffer), design_area_image_path);
                                        item_info.design_area_image = 'http://' + area_res.Location;
                                        // @ts-ignore
                                        const preview_res: any = await oss.upload(Buffer.from(preview_image_buffer), preview_image_path);
                                        item_info.preview_image = 'http://' + preview_res.Location;
                                    } else {
                                        item_info.design_area_image = cart_v.design_info.design_area_image;
                                        item_info.preview_image = cart_v.design_info.preview_image;
                                    }
                                    const baseData = cart_v.design_info.draw_image.replace(/data:image\/png;base64,/g, '');
                                    const drawBuffer = Buffer.from(baseData, 'base64');
                                    const fileName = think.uuid('v4');
                                    const oss = await think.service('oss');
                                    const filePath = `/demo/${1}/${fileName}.png`;
                                    const res: any = await oss.upload(Buffer.from(drawBuffer), filePath, true);
                                    item_info.draw_image = `http://${res.Location}`;
                                    item_info.image = item_info.preview_image;
                                }

                                if (cart_v.shopping_type == 3 && cart_v.design_info.is_only_design) {
                                     // item_info.item_total_price += item.current_price * cart_v.buy_num;
                                     // pay_amount += item.current_price * cart_v.buy_num;
                                    item_info.is_only_design = 1;

                                } else {
                                     item_info.item_total_price += item.current_price * cart_v.buy_num;
                                     pay_amount += item.current_price * cart_v.buy_num;
                                 }

                                item_list.push(item_info);
                            } else {
                                for (const sku_v of sku_list) {
                                    if (cart_v.sku_id == sku_v.sku_id) {
                                        /**
                                         * 判断库存
                                         */
                                        if ( sku_v.num  == 0) {
                                            return  sku_v.sku_id + '库存不足';
                                            break;
                                        }
                                        if (cart_v.buy_num <= 0) {
                                            return  sku_v.sku_id + '购买数量不能为0';
                                            break;
                                        }
                                        if (cart_v.buy_num > sku_v.num ) {
                                            return  sku_v.sku_id + '购买数量超出库存' + sku_v.num;
                                            break;
                                        }
                                        if (item.express_type == 0) {
                                            express_amount.push(0);
                                        }

                                        if (logistics_type == 1)  {
                                            /**
                                             * 统一运费
                                             */
                                            if (item.express_type == 1) {
                                                express_amount.push(Number(item.express_fee));
                                            }
                                            /**
                                             * 物流模板计费
                                             */
                                            if (item.express_type == 2 && item.express_template_id && address.user_id) {
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
                                                        const priceList = [];
                                                        for (const region_v of express_rule.region_rules) {
                                                            if (region_v.region.includes(address.city_code)) {
                                                                const coutinue = sku_v.weight - Number(region_v.first_number) > 0 ? Math.ceil(sku_v.weight - Number(region_v.first_number)) : 0;
                                                                price =  Number(region_v.first_amount) + (coutinue / region_v.continue_number) * Number(region_v.continue_amount);
                                                                priceList.push(price);
                                                            }
                                                        }
                                                        express_amount.push(maxPrice(priceList));
                                                    } else {
                                                        const priceList = [];
                                                        for (const region_v of express_rule.region_rules) {
                                                            if (region_v.region.includes(address.city_code)) {
                                                                const coutinue = cart_v.buy_num - Number(region_v.first_number) > 0 ? Math.ceil(cart_v.buy_num - Number(region_v.first_number)) : 0;
                                                                price =  Number(region_v.first_amount) + (coutinue / region_v.continue_number) * Number(region_v.continue_amount);
                                                                priceList.push(price);
                                                            }
                                                        }
                                                        express_amount.push(maxPrice(priceList));
                                                    }
                                                } else {
                                                    if (express_rule.express_template_type == 1) {
                                                        const coutinue = sku_v.weight - express_rule.first_number > 0 ? Math.ceil(sku_v.weight - express_rule.first_number) : 0;
                                                        price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount);
                                                    } else {
                                                        const coutinue = cart_v.buy_num - express_rule.first_number > 0 ? Math.ceil(cart_v.buy_num - express_rule.first_number) : 0;
                                                        price = Number(express_rule.first_amount) + (coutinue / express_rule.continue_number) * Number(express_rule.continue_amount);
                                                    }
                                                }
                                                express_amount.push(Number(price));
                                            }
                                        } else {
                                            express_amount.push(0);
                                        }
                                        let sku_name = '';
                                        for (const skus_v of sku_v.skus) {
                                            if (sku_v.skus.indexOf(skus_v) == sku_v.skus.length - 1) {
                                                sku_name += `${skus_v.k}:${skus_v.v}`;
                                            } else {
                                                sku_name += `${skus_v.k}:${skus_v.v}; `;
                                            }
                                        }
                                        const item_info: any = {
                                            item_id: item.id,
                                            name: item.name,
                                            weight: sku_v.weight,
                                            image: sku_v.images,
                                            sku_name,
                                            sku_id: cart_v.sku_id,
                                            buy_num: cart_v.buy_num,
                                            current_price: sku_v.current_price,
                                            category_id: item.category_id,
                                            custom_category_id: item.custom_category_id,
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
                                                if (cart_v.design_info) {
                                                    if (cart_v.design_info.design_id) {
                                                        item_info.design_id = cart_v.design_info.design_id;
                                                        // tslint:disable-next-line:no-shadowed-variable
                                                        const shop_id = this.ctx.state.shop_id;
                                                        const design = await this.model('design').where({shop_id, design_id: item_info.design_id, del: 0, status: 3}).find();
                                                        if (think.isEmpty(design)) {
                                                            return '花样不存在!';
                                                        }
                                                        const design_price = cart_v.buy_num * design.price;

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

                                                    item_info.custom_template_id = cart_v.design_info.custom_template_id;

                                                    item_info.top_font_width = cart_v.design_info.top_font_width;
                                                    item_info.top_font_height = cart_v.design_info.top_font_height;
                                                    item_info.top_font_content = cart_v.design_info.top_font_content;
                                                    item_info.top_font_color = cart_v.design_info.top_font_color;

                                                    item_info.bottom_font_height = cart_v.design_info.bottom_font_height;
                                                    item_info.bottom_font_width = cart_v.design_info.bottom_font_width;
                                                    item_info.bottom_font_content = cart_v.design_info.bottom_font_content;
                                                    item_info.bottom_font_color = cart_v.design_info.bottom_font_color;

                                                    item_info.font_id = cart_v.design_info.font_id;
                                                    item_info.font_family = cart_v.design_info.font_family;
                                                    item_info.design_width = cart_v.design_info.design_width;
                                                    item_info.design_height = cart_v.design_info.design_height;
                                                    item_info.is_choose_design = cart_v.design_info.is_choose_design;
                                                    // item_info.custom_image = cart_v.design_info.custom_image;
                                                    if (item_info.is_choose_design != 1 ) {
                                                        if (item_info.custom_template_id == 2 || item_info.custom_template_id == 3) {
                                                            const custom_image_base64 = cart_v.design_info.custom_image.split(',')[1];

                                                            // if (item_info.custom_template_id != 1) {
                                                            const meta  = await sharp(Buffer.from(custom_image_base64, 'base64')).metadata();
                                                            item_info.design_width = meta.width / meta.height *  item_info.design_height;
                                                            // }
                                                            const sqr  = item_info.design_width *  item_info.design_height +  item_info.top_font_width * item_info.top_font_height  +   item_info.bottom_font_height * item_info.bottom_font_width;
                                                            const price = await this.getEmbPrice(sqr, item_info.custom_template_id);
                                                            item_info.design_area_sqr = sqr;
                                                            item_info.emb_template_price = price;
                                                            pay_amount += price;
                                                            item_info.item_total_price += price;
                                                            const oss = await think.service('oss');
                                                            const fileName = think.uuid('v4');
                                                            const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                                            const filePath = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
                                                            /**
                                                             * 上传到腾讯OSS
                                                             */
                                                            const res: any = await oss.upload(Buffer.from(custom_image_base64, 'base64'), filePath, true);
                                                            item_info.custom_image = 'http://' + res.Location;
                                                        } else {
                                                            const sqr =  item_info.top_font_width * item_info.top_font_height;
                                                            const price = await this.getEmbPrice(sqr, item_info.custom_template_id);
                                                            item_info.design_area_sqr = sqr;
                                                            item_info.emb_template_price = price;
                                                            pay_amount += price;
                                                        }
                                                        // item_info.custom_image = cart_v.design_info.custom_image;
                                                    } else {
                                                        if (item_info.custom_template_id == 2) {
                                                            if (logistics_type == 2) {
                                                                _logistics_type  = '门店自提';
                                                                item_info._logistics_type = '门店自提';
                                                            }
                                                        }
                                                        item_info.custom_image = cart_v.design_info.custom_image;
                                                    }

                                                    if ($from) {
                                                        const design_area_image_buffer = await this.getBuffer(this, cart_v.design_info.design_area_image, true);
                                                        const preview_image_buffer = await this.getBuffer(this,  cart_v.design_info.preview_image, true);
                                                        const oss = await think.service('oss');
                                                        const fileName = think.uuid('v4');
                                                        const fileName2 = think.uuid('v4');
                                                        const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                                        const design_area_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
                                                        const preview_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName2}.png`;
                                                        /**
                                                         * 上传到腾讯OSS
                                                         */
                                                            // @ts-ignore
                                                        const area_res: any = await oss.upload(Buffer.from(design_area_image_buffer), design_area_image_path, true);
                                                        item_info.design_area_image = 'http://' + area_res.Location;
                                                        // @ts-ignore
                                                        const preview_res: any = await oss.upload(Buffer.from(preview_image_buffer), preview_image_path, true);
                                                        item_info.preview_image = 'http://' + preview_res.Location;
                                                    } else {
                                                        item_info.design_area_image = cart_v.design_info.design_area_image;
                                                        item_info.preview_image = cart_v.design_info.preview_image;
                                                    }
                                                    // item_info.preview_image = cart_v.design_info.preview_image;
                                                    // item_info.design_area_image = cart_v.design_info.design_area_image;
                                                    item_info.order_type = 2;
                                                    item_info.image =  item_info.preview_image;
                                                    item_info._order_type = getOrderType(Number(item_info.order_type));
                                                } else {
                                                    return 'design_info of empty';
                                                }
                                            }

                                        /**
                                         * order_type为 3是特殊定制商品
                                         */
                                        if (cart_v.shopping_type == 3) {
                                            if (cart_v.design_info) {

                                                item_info.custom_template_id = cart_v.design_info.custom_template_id;

                                                const emb_template: any =  await this.model('emb_template').where({emb_template_id: ['IN', item_info.custom_template_id]}).getField('template_name');
                                                if (think.isEmpty(emb_template)) {
                                                    return '定制模板不存在';
                                                }
                                                item_info.special_template_name = emb_template.join(',');
                                                // item_info.special_template_name = emb_template.template_name;
                                                item_info.special_custom_width = cart_v.design_info.special_custom_width;
                                                item_info.special_custom_height = cart_v.design_info.special_custom_height;
                                                item_info.special_color_num = cart_v.design_info.special_color_num;
                                                item_info.special_custom_desc = cart_v.design_info.special_custom_desc;

                                                const special_custom_image_base64 = cart_v.design_info.special_custom_image.split(',')[1];
                                                const sqr  = item_info.special_custom_width *  item_info.special_custom_height ;
                                                let price_template;
                                                // 多选 用多功能混合绣的价格 单选用自己
                                                if (item_info.custom_template_id.length > 1) {
                                                    price_template = 11;
                                                } else {
                                                    price_template = item_info.custom_template_id[0];

                                                }
                                                const price = await this.getEmbPrice(sqr, price_template);

                                                item_info.special_custom_sqr = sqr;
                                                item_info.special_custom_price = price;
                                                pay_amount += price;
                                                item_info.item_total_price += price;
                                                item_info.special_base_price = price + sku_v.current_price * cart_v.buy_num;
                                                const oss = await think.service('oss');
                                                const fileName = think.uuid('v4');
                                                const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                                const filePath = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
                                                /**
                                                 * 上传到腾讯OSS
                                                 */
                                                const res: any = await oss.upload(Buffer.from(special_custom_image_base64, 'base64'), filePath, true);
                                                item_info.special_custom_image = 'http://' + res.Location;

                                                // item_info.design_area_image = cart_v.design_info.design_area_image;
                                                // item_info.preview_image = cart_v.design_info.preview_image;
                                                item_info.preview_image = item_info.special_custom_image;
                                                item_info.order_type = 3;
                                                item_info.image = item_info.special_custom_image;
                                                item_info._order_type = getOrderType(item_info.order_type);

                                            } else {
                                                return  'design_info of empty';
                                            }
                                        }

                                        /**
                                         * 手绘订单
                                         */
                                        if (cart_v.shopping_type == 4) {
                                            item_info.custom_template_id = 2;

                                            item_info.design_width = cart_v.design_info.design_width;
                                            item_info.design_height = cart_v.design_info.design_height;
                                            const sqr  = item_info.design_width *  item_info.design_height;
                                            const price = await this.getEmbPrice(sqr, item_info.custom_template_id);
                                            pay_amount += price;
                                            item_info.item_total_price += price;
                                            item_info.design_area_sqr = sqr;
                                            item_info.emb_template_price = price;
                                            item_info.order_type = 4;
                                            item_info._order_type = getOrderType(item_info.order_type);

                                            item_info.draw_height = cart_v.design_info.draw_height;
                                            item_info.draw_width = cart_v.design_info.draw_width;

                                            /**
                                             * 上传手绘的图
                                             */
                                            if ($from) {
                                                const design_area_image_buffer = await this.getBuffer(this, cart_v.design_info.design_area_image, true);
                                                const preview_image_buffer = await this.getBuffer(this,  cart_v.design_info.preview_image, true);
                                                const oss1 = await think.service('oss');
                                                const fileName1 = think.uuid('v4');
                                                const fileName2 = think.uuid('v4');
                                                const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
                                                const design_area_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName1}.png`;
                                                const preview_image_path = `/custom/${shop_id}/${user_id}/${day}/${fileName2}.png`;
                                                /**
                                                 * 上传到腾讯OSS
                                                 */
                                                    // @ts-ignore
                                                const area_res: any = await oss1.upload(Buffer.from(design_area_image_buffer), design_area_image_path, true);
                                                item_info.design_area_image = 'http://' + area_res.Location;
                                                // @ts-ignore
                                                const preview_res: any = await oss1.upload(Buffer.from(preview_image_buffer), preview_image_path, true);
                                                item_info.preview_image = 'http://' + preview_res.Location;
                                            } else {
                                                item_info.design_area_image = cart_v.design_info.design_area_image;
                                                item_info.preview_image = cart_v.design_info.preview_image;
                                            }
                                            const baseData = cart_v.design_info.draw_image.replace(/data:image\/png;base64,/g, '');
                                            const drawBuffer = Buffer.from(baseData, 'base64');
                                            const fileName = think.uuid('v4');
                                            const oss = await think.service('oss');
                                            const filePath = `/demo/${1}/${fileName}.png`;
                                            const res: any = await oss.upload(Buffer.from(drawBuffer), filePath, true);
                                            item_info.draw_image = `http://${res.Location}`;
                                            /**
                                             * 订单预览图变成设计预览图
                                             */
                                            item_info.image = item_info.preview_image;
                                        }

                                        if (cart_v.shopping_type == 3 && cart_v.design_info.is_only_design) {
                                            // item_info.item_total_price += item.current_price * cart_v.buy_num;
                                            // pay_amount += item.current_price * cart_v.buy_num;
                                            item_info.is_only_design = 1;
                                            pay_amount += 0;
                                        } else {
                                            item_info.item_total_price += item.current_price * cart_v.buy_num;
                                            pay_amount += item.current_price * cart_v.buy_num;
                                        }
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
            const total_price = express_amount + pay_amount;
            const result: object = {
                item_list,
                address,
                item_price: pay_amount.toFixed(2),
                express_amount: express_amount.toFixed(2),
                total_price: total_price.toFixed(2),
                order_type,
                logistics_type,
                _logistics_type
            };
            return result;
        } catch ($err) {
            return $err.message;
            this.dealErr($err);
        }
    }

    /**
     * 上传定制的图片到 桶
     * @param $url
     * @param $path
     * @param $buffer
     */
    async uploadCustomImage($url: string, $path: string, $buffer: boolean) {
        const shop_id  = this.ctx.state.shop_id;
        const user_id: any = this.ctx.state.userInfo.id;
        const oss = await think.service('oss');
        const fileName = think.uuid('v4');
        const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
        const filePath = `/custom/${shop_id}/${user_id}/${day}/${fileName}.png`;
        const res: any = await oss.upload($path, filePath, $buffer);
        return  `http://${res.Location}`;
    }

    /**
     * 计算价格
     * @params {cart_list} 购物列表 {id,buy_num,sku_id}
     * @params {address_id} 收货地址
     */
    async calculationAction() {
        try {
            const res =  await this.calculation(false);
            if (typeof res == 'string') {
                return this.fail(-1, res);
            }
            return this.success(res, '获取成功');
        } catch ($err) {
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
            const orderInfo: any = await this.model('order').where({order_no}).find();  // -2为已取消
            // @ts-ignore
            if (think.isEmpty(orderInfo)) {
                return this.fail(-1, '订单不存在');
            }
            if (orderInfo.status == -2) {
                return this.fail(-1, '该订单已取消, 请勿重复操作!');
            }
            const res: any = await this.model('order').where({order_no}).update({status: -2, _status: "已取消"});  // -2为已取消
            const closeInfo = await this.cancelWxOrder(orderInfo);
            for (const item_v of orderInfo.order_item) {
                /**
                 * 加存方法 现在sku是一个串  待优化
                 */
                await this.changeSumStock(item_v, 1);
                /**
                 * 减销量
                 */
                await this.model("item").where({id: item_v.item_id}).decrement('sale_num', item_v.buy_num);
            }
            return this.success({orderInfo, closeInfo}, '取消订单成功');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 改变库存
     * @param {$item} 商品
     * @param {$add} true 增加 , false 减少
     */
    async changeSumStock($item: any, $add: any) {
        try {
            const res: any = await this.model('item').where({id: $item.item_id}).find();
            if ($item.sku_id) {
                const sku_list = JSON.parse(res.sku_list);
                for (const sku_v of sku_list) {
                    if ($item.sku_id == sku_v.sku_id) {
                        if ($add) {
                            sku_v.num = sku_v.num + $item.buy_num;
                        } else {
                            sku_v.num = sku_v.num - $item.buy_num;
                        }
                        break;
                    }
                }
                const new_sku_list: any = JSON.stringify(sku_list);
                await this.model('item').where({id: $item.item_id}).update({sku_list: new_sku_list});
            }
            let sum_stock = res.sum_stock;
            if ($add) {
                sum_stock = sum_stock + $item.buy_num;
            } else {
                sum_stock = sum_stock - $item.buy_num;
            }
            return await this.model('item').where({id: $item.item_id}).update({sum_stock});
        } catch ($err) {
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
            const orderInfo: any = await this.model('order').where({shop_id, order_no, user_id}).find();
            if (think.isEmpty(orderInfo)) {
                return this.fail(-1, '该订单不存在');
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
                return this.fail(-1, msg);
            }
            const _status = '已完成';
            const res: any = await this.model('order').where({shop_id, order_no, user_id}).update({_status, status: 4});
            if (res) {
                return this.success(res, '操作成功!');
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

    /**
     * 特殊定制询价
     * @param {order_id} 订单id
     * @param {buyer_message} 留言
     * @param {price} 价格
     * @return boolean
     */
    async askOrderAction() {
        try {
            const order_no = this.post('order_no');
            const buyer_message = this.post('buyer_message');
            const shop_id: any = this.ctx.state.shop_id;
            const order =  await this.model('order').where({shop_id, order_no}).find();
            if (think.isEmpty(order)) {
                return this.fail(-1, '该订单不存在');
            }
            const order_id = order.id;

            if (order.order_type != 3) {
                return this.fail(-1, '此订单不是特殊定制订单, 无法询价');

            } else {
                /**
                 * 状态不是 待发货 和 待收货 的时候
                 */
                if (order.status != 6) {
                    let msg: string = '';
                    switch (order.status) {
                        case 1:
                            msg = '该订单未支付!';
                            break;
                        case 4:
                            msg = '该订单已完成!';
                            break;
                        case -2:
                            msg = '该订单已关闭!';
                            break;
                        case 2:
                            msg = '该订单等待发货!';
                            break;
                        case 3:
                            msg = '该订单待收货!';
                            break;
                        case 4:
                            msg = '该订单已完成!';
                            break;
                        case 5:
                            msg = '该订单已在询价中!';
                            break;
                        case 7:
                            msg = '该订单待派单!';
                            break;
                        case 8:
                            msg = '该订单已在派单中';
                            break;
                        case 9:
                            msg = '该订单设计师处理中!';
                            break;
                        case 10:
                            msg = '该订单待打印!';
                            break;
                    }
                    return this.fail(-1, msg);
                }
            }

            const _status = '询价中';
            const _item_status = '询价中';
            const price = Number(this.post('price'));

            const order_item = await this.model('order_item').where({order_id}).find();
            if (think.isEmpty(order_item)) {
                return this.fail(-1, '该子订单不存在');
            }
            if ( price < order_item.special_base_price) {
                return this.fail(-1, `价格不能小于基础价【${order_item.special_base_price}】`);
            }
            const item_amount = price;
            const pay_amount = order.express_amount + item_amount;
            const item_total_price = item_amount;
            await this.model('order').where({id: order_id}).update({
                _status,
                status: 5,
                item_amount,
                buyer_message,
                pay_amount,
            });
            const res = await this.model('order_item').where({order_id}).update({
                item_status: 5,
                item_total_price,
            });
            if (!res) {
                return this.fail(-1, '操作失败!');
            }
            this.success([], '操作成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 扫描机器
     * @param {order_no} 订单号
     * @param {machine_code} 机器码
     */
    async scanMachineAction() {
        try {
            const order_no =  this.post('order_no');
            const machine_code =  this.post('machine_code');

            const orderInfo = await this.model('order').where({order_no}).find();
            if (think.isEmpty(orderInfo)) {
                return this.fail(-1, '该订单不存在!');
            }
            if (orderInfo.logistics_type != 2) {
                return this.fail(-1, '该订单不是门店自提订单');
            }
            if (orderInfo.status == 1) {
                return this.fail(-1, '该订单未支付!');
            }
            if (orderInfo.status == -2) {
                return this.fail(-1, '该订单已取消!');
            }

            await this.model('order').where({machine_code}).update({machine_code: 0});
            await this.model('order').where({order_no}).update({
                machine_code,
                is_scan: 1
            });
            // await this.model('order').where({order_no}).increment('view_nums', 1); //将阅读数加 1
            return this.success([], '就绪,等待机器请求!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 删除订单
     * @param {order_no} 订单号
     * @return boolean
     */
    async delOrderAction() {
        try {
            const user_id: any = this.ctx.state.userInfo.id;
            const shop_id: any = this.ctx.state.shop_id;
            const order_no = this.post('order_no');
            const orderInfo = await this.model('order').where({del: 0, order_no, user_id, shop_id}).find();
            if (think.isEmpty(orderInfo)) {
                return this.fail(-1, '该订单不存在!');
            }
            /**
             * 当订单不是已完成或者已关闭的时候
             */
            if (orderInfo.status != -2 && orderInfo.status != 4) {
                const msg = await getOrderStatus(orderInfo.status);
                return this.fail(-1, msg);
            }
            const res = await this.model('order').where({del: 0, order_no, user_id, shop_id}).update({del: 1});
            if (think.isEmpty(res)) {
                return this.fail(-1, '该订单不存在!');
            }
            return this.success([], '操作成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 下发单个DST
     * @heder {ops} 包含了签名、机器码 的串
     */
    async getDstAction() {
        try {
            if (this.header("ops")) {
                // @ts-ignore
                const received: string = this.header("ops");
                const arr_rec: any[] = received.split("@@");
                const r_tsp: string = arr_rec[2];
                const r_sign: string = arr_rec[3];

                const mechineId = arr_rec[1] || 1;
                const [sid, skey, mid] = ['own_one', 'nh7k9&u', mechineId];
                const data: string = sid + skey + r_tsp + mid;
                const sign: string = crypto.createHash('md5').update(data).digest("hex");
                console.log('sign:', sign);
                const uid = this.post("id") || "uid";
                if (r_sign == sign) {
                    // const machine_code = this.post('machine_code');
                    // const orderInfo = await this.model('order').where({order_no: 20200617100743490543558}).find();
                    const orderInfo = await this.model('order').where({logistics_type: 2, status: 10, order_type: 2, machine_code: mechineId}).find();
                    if (think.isEmpty(orderInfo)) {
                        return this.fail(-1, '暂无数据!');
                    }
                    console.log(mechineId, 'machineId');
                    const order_id = orderInfo.id;
                    const order_item = await this.model('order_item').where({ order_id }).find();
                    console.log(order_item);
                    const dst_Buffer: any = await this.getBuffer(this, order_item.design_dst_path, true);
                    const zip = new AdmZip();
                    zip.addFile(`${orderInfo.id}.DST`, Buffer.alloc(dst_Buffer.length, dst_Buffer), "DST FILE");
                    // 获取子级控制器实例，然后调用其方法
                    // const txt_data = await designController.getDesignInfo(order_item.design_emb_path);
                    let txt_data;
                    if (!order_item.design_txt_file_path) {
                        const designController = this.controller('designer/design');
                        // @ts-ignore
                        const res = await designController.getDesignInfo(order_item.design_emb_path);
                        if ( typeof res == 'string') {
                            return this.fail(-1, res);
                        }
                        txt_data = res.txt_str;
                    } else {
                        txt_data = await this.getBuffer(this, order_item.design_txt_file_path, true);
                    }

                    console.log(txt_data, 'txt_data');
                    zip.addFile(`${orderInfo.id}.TXT`, Buffer.alloc(txt_data.length, txt_data), "TXT");
                    const zip_buffer = zip.toBuffer();
                    // const content_length = res.headers._headers['content-length'][0];
                    this.ctx.set({
                        // 'Content-Length': res.headers._headers['content-length'][0],
                        'Content-Type': 'multipart/form-data',
                        "Content-Disposition": "attachment; filename=" + `${orderInfo.id}.zip`,
                    });
                    const PassThrough = require('stream').PassThrough;
                    await this.model('order').where({logistics_type: 2, status: 10, machine_code: mechineId}).update({machine_code: 0});
                    this.ctx.body = zip_buffer;
                    // this.ctx.body = res.body.on('error',  this.ctx.onerror).pipe(PassThrough());
                } else {
                    return this.fail(-1, '签名错误!');
                }
            } else {
                return this.fail(-1, '无效请求!');
            }
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 获取刺绣模板的价格
     * @parm {$sqr} 设计尺寸面积 px^2
     * @parm {$emb_template_id} 刺绣定制模板id
     * @return 该尺寸的价格
     */
    async getEmbPrice($sqr: any, $emb_template_id: any) {
        try {
            // const width = this.get('width');
            // const height = this.get('height');
            // const sqr = width * height;
            const shop_id: any = this.ctx.state.shop_id;
            const sqr = $sqr;
            const emb_template_id = $emb_template_id || 1;
            const template_type = this.get('template_type') || 1;
            /**
             * 查找 当前店铺 当前模板的价格列表
             */
            const priceList = await this.model('emb_template_price').where({shop_id, emb_template_id}).select();
            const priceObj = {};
            for (const v of priceList) {
                if (!priceObj[v.width * v.height]) {
                    priceObj[v.width * v.height] = v.price;
                } else {
                    if (priceObj[v.width * v.height] < v.price) {
                        priceObj[v.width * v.height] = v.price;
                    }
                }
            }
            const areaList = Object.keys(priceObj);
            // @ts-ignore
            // tslint:disable-next-line:only-arrow-functions
            areaList.sort(function(a: number, b: number) {
                return a - b;
            });
            console.log(areaList);
            const index: any = getIndex(areaList, sqr);
            const  price = priceObj[areaList[index]] || 0;
            const result = {
                price,
                "area": sqr,
                'area=>price': priceObj,
                // priceList,
            };
            // return this.success(result, '请求成功!');
            return price;
        } catch (e) {
            this.dealErr(e);
        }
    }

}

function getIndex(arr: any, num: number) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] >= num) {
            if (i == 0) {
                return i;
            }
            // return i - 1;
            return i ;
        }
    }
    // if (num < arr[0]) {
    //     return 0
    // } else {
    return arr.length - 1;
    // }

}

/**
 * 取数组中最大
 */
function maxPrice($data: any) {
    let max = $data[0];
    const len = $data.length;
    for (let i = 1; i < len; i++) {
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
    return _order_type;
}

async function getOrderStatus($status: number) {
    let msg: string = '';
    switch ($status) {
        case 1:
            msg = '该订单未支付!';
            break;
        case 4:
            msg = '该订单已完成!';
            break;
        case -2:
            msg = '该订单已关闭!';
            break;
        case 2:
            msg = '该订单等待发货!';
            break;
        case 3:
            msg = '该订单待收货!';
            break;
        case 4:
            msg = '该订单已完成!';
            break;
        case 5:
            msg = '该订单已在询价中!';
            break;
        case 7:
            msg = '该订单待派单!';
            break;
        case 8:
            msg = '该订单已在派单中';
            break;
        case 9:
            msg = '该订单设计师处理中!';
            break;
        case 10:
            msg = '该订单待打印!';
            break;
    }
    return msg;
}
