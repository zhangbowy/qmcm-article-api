import Base from './base.js';
import ItemModel from "../model/item";
import {think} from "thinkjs";
const path = require('path');
const fs = require("fs");
const WXPay = require('weixin-pay');
const nodeXlsx = require('node-xlsx');
export default class extends Base {

  /**
   * 订单列表
   * @param {currentPage}
   * @param {pageSize}
   * @param {status} 订单状态 状态 -2、已关闭/取消订单 0 全部 1、待付款 ，2、待发货 3、已发货 4、已完成  5、询价中 6、询价回复 7、待派单 8、派单中 9、已接单(designer_status 1、待接单 2、待指派设计师 3、设计师处理中 4、处理完成) 10、待打印  11下发中
   * @param {order_no} 订单编号
   * @param {order_type} 订单类型  1、普通订单    2、一般定制    3 、特殊定制    4 、手绘     5、 询价
   * @param {start_time} 开始时间
   * @param {end_time} 结束时间
   * @param {start_pay_time} 支付起
   * @param {end_pay_time} 支付止
   * @param {receiver_phone} 收货人手机号
   * @param {express_number} 快递单号
   * @return order_list
   */
  async getList() {
    try {
      // @ts-ignore
      const shop_id =   this.post('shop_id') || this.ctx.state.admin_info.shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      const status: number = Number(this.post('status') || 0);
      const order_no: string = this.post('order_no') || '';
      const order_type: number = Number(this.post('order_type') || 0);
      const start_time: number = this.post('start_time');
      const end_time: number = this.post('end_time');
      const start_pay_time: number = this.post('start_pay_time');
      const end_pay_time: number = this.post('end_pay_time');
      const receiver_phone: number = this.post('receiver_phone');
      const express_number: number = this.post('express_number');
      const custom_category_id: number = this.post('custom_category_id');
      const where: any = {};
      where.order_no = ['like', `%${order_no}%`];
      if (status) {
        where.status = status;
      }
      if (shop_id) {
        where.shop_id = shop_id;
      }
      if (start_time && end_time) {
        where.created_at = {'>=': start_time, '<=': end_time};
      }
      if (start_pay_time && end_pay_time) {
        where.pay_time = {'>=': start_pay_time, '<=': end_pay_time};
      }
      if (receiver_phone) {
        where.receiver_phone = receiver_phone;
      }
      if (order_type) {
        where.order_type = order_type;
      }
      if (custom_category_id) {
        where.custom_category_id = custom_category_id;
      }
      let orderIdList;
      let result;
      if (express_number) {
        orderIdList =  await this.model('order_item').where({express_number}).getField('order_id');
        // @ts-ignore
        if (orderIdList.length > 0) {
          where.id = ['IN', orderIdList];
        } else {
          where.id = 0;
        }
      } else {
      }
      result = await this.model('order').order('updated_at DESC').page(page, limit).where(where).countSelect();
      if (this.ctx.state.isExcel) {
        // @ts-ignore
      }
      return result;
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 订单列表
   * @param {currentPage}
   * @param {pageSize}
   * @param {status} 订单状态 状态 -2、已关闭/取消订单 0 全部 1、待付款 ，2、待发货 3、已发货 4、已完成  5、询价中 6、询价回复 7、待派单 8、派单中 9、已接单(designer_status 1、待接单 2、待指派设计师 3、设计师处理中 4、处理完成) 10、待打印
   * @param {order_no} 订单编号
   * @param {order_type} 订单类型  1、普通订单    2、一般定制    3 、特殊定制    4 、手绘     5、 询价
   * @param {start_time} 开始时间
   * @param {end_time} 结束时间
   * @param {start_pay_time} 支付起
   * @param {end_pay_time} 支付止
   * @param {receiver_phone} 收货人手机号
   * @param {express_number} 快递单号
   * @return order_list
   */
  async orderListAction() {
    const res = await this.getList();
    return this.success(res, '订单列表');
  }

  /**
   * 订单状态统计
   * @param {order_no} 订单编号
   * @param {order_type} 订单类型  1、普通订单    2、一般定制    3 、特殊定制    4 、手绘     5、 询价  6、 询价回复  7、 待派单  8、 派单中  9、 已接单( designer_status  1、 待接单  2、 待指派设计师  3、 设计师处理中  4、 处理完成)  10、 待打印
   * returns [ {_status: 状态, 状态数字: number, count: number} ...];
   */
  async orderCountAction() {
    try {
      // @ts-ignore
      const shop_id =   this.post('shop_id') || this.ctx.state.admin_info.shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      // const status: number = this.post('status') || 0;
      const order_no: string = this.post('order_no') || '';
      const order_type: string = this.post('order_type') || 0;
      const start_time: number = this.post('start_time');
      const end_time: number = this.post('end_time');
      const start_pay_time: number = this.post('start_pay_time');
      const end_pay_time: number = this.post('end_pay_time');
      const receiver_phone: number = this.post('receiver_phone');
      const express_number: number = this.post('express_number');
      const custom_category_id: number = this.post('custom_category_id');
      const where: any = {};
      where.order_no = ['like', `%${order_no}%`];
      // where.shop_id = shop_id;
      if (shop_id) {
        where.shop_id = shop_id;
      }
      if (start_time && end_time) {
        where.created_at = {'>=': start_time, '<=': end_time};
      }
      if (start_pay_time && end_pay_time) {
        where.pay_time = {'>=': start_pay_time, '<=': end_pay_time};
      }
      if (receiver_phone) {
        where.receiver_phone = receiver_phone;
      }
      if (order_type) {
        where.order_type = order_type;
      }
      if (custom_category_id) {
        where.custom_category_id = custom_category_id;
      }
      /**
       * 订单状态列表 -2、已关闭/取消订单  0 全部 1、待付款 ，2、待发货 3、已发货 4、已完成  5、询价中 6、询价回复 7、待派单 8、派单中 9 设计师处理中
       */
      const statusList = [1, 2, 3, 4, 5, 6, 7, 8, 9, -2];
      const statusListn = [
        {
          _status: "全部",
          status: 0,
          count: 0
        },
        {
          _status: "待付款",
          status: 1,
          count: 0
        },
        {
          _status: "询价中",
          status: 5,
          count: 0
        },
        {
          _status: "已回复",
          status: 6,
          count: 0
        },
        {
          _status: "待派单",
          status: 7,
          count: 0
        },
        {
          _status: "派单中",
          status: 8,
          count: 0
        },
        {
          _status: "设计师处理中",
          status: 9,
          count: 0
        },
        {
          _status: "下发机器",
          status: 10,
          count: 0
        },
        {
          _status: "下发中",
          status: 11,
          count: 0
        },
        {
          _status: "待发货",
          status: 2,
          count: 0

        },
        {
          _status: "已发货",
          status: 3,
          count: 0
        },
        {
          _status: "已完成",
          status: 4,
          count: 0
        },
        {
          _status: "已取消",
          status: -2,
          count: 0
        }
      ];
      let orderIdList;
      let result;
      if (express_number) {
        orderIdList =  await this.model('order_item').where({ express_number}).getField('order_id');
        // @ts-ignore
        if (orderIdList.length > 0) {
          // orderList = await this.model('order').where({id: ['IN', 350]}).group('status').select();
          where.id = ['IN', orderIdList];
        } else {
          where.id = 0;
        }
      } else {
        // const res: any = await this.model('order').order('order_no DESC').where(where).count('status');
        // // result = await this.model('order').getCount(orderIds);
        // for (const item of statusListn) {
        //   where.status = item.status;
        //   const count =  await this.model('order').where(where).order('created_at DESC').count('status');
        //   const index = statusListn.indexOf(item);
        //   statusListn[index].count = count;
        // }
        // statusListn[0].count = res;
      }
      const orderIds = await this.model('order').where(where).getField('id');
      // @ts-ignore
      if (orderIds.length > 0) {
        // @ts-ignore
        result = await this.model('order').getCount(orderIds);
        // @ts-ignore
        let total = 0;
        for (const order_v of result) {
          for (const status_v of statusListn) {
            if (status_v.status == order_v.status) {
              status_v.count = order_v.count;
              total += order_v.count;
            }
          }
        }
        statusListn[0].count = total;
      }
      return this.success(statusListn, '订单统计!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 订单详情
   * @param {order_no} 订单编号
   */
  async orderDetailAction() {
    try {
      const order_no: any = this.post('order_no');
      // @ts-ignore
      const shop_id = this.ctx.state.admin_info.shop_id;
      const res = await this.model('order').where({shop_id, order_no}).find();
      if (think.isEmpty(res)) {
        return this.fail(-1, '该订单不存在!');
      }
      return this.success(res, '订单详情!');
    } catch (e) {
      this.dealErr(e);
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
    const params = {
      appid: shopConfig.appid,
      mch_id:  shopConfig.mch_id,
      op_user_id: '用户',
      out_refund_no: '20140703' + Math.random().toString().substr(2, 10),
      total_fee: '1', // 原支付金额
      refund_fee: '1', // 退款金额
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
   * 确认支付
   * @param {order_id} 订单id
   */
  async confirmPaymentAction() {
    try {
      const order_id: any = this.post('order_id');
      // @ts-ignore
      const shop_id = this.ctx.state.admin_info.shop_id;

      const orderInfo: any = await this.model('order').where( {shop_id, id: order_id}).find();
      if (think.isEmpty(orderInfo)) {
        return this.fail(-1, '该订单不存在');
      }
      if (orderInfo.status != 1) {
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
          case 3:
            msg = '该订单已发货!';
            break;
        }
        return this.fail(-1, msg);
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
          udpOption = {is_choose_design: 1, design_price: order_item.design_price, designer_price: order_item.design_price, _designer_status, designer_status: 3, pay_time, _status, status: 9 };
        } else if (orderInfo.designer_id && orderInfo.custom_template_id == 2) {
          /**
           * 有花样的订单 并且无文字只有一个花样 直接送去打印
           */
          if (orderInfo.logistics_type == 2) {
            _status = "门店订单处理中";
          } else {
              _status = "待打印";
          }
          udpOption = {is_choose_design: 1, design_price: order_item.design_price, designer_price: order_item.design_price, pay_time, designer_status: 4, _status, status: 10};
        } else {
          /**
           * 其余自己上传的图各种组合 去到待派单
           */
          _status = "待派单";
          udpOption = {pay_time, _status, status: 7};
        }
      }
      if (orderInfo.order_type == 4) {
        _status = "待派单";
        // res = await this.model('order').where({shop_id, id: order_id}).update({pay_time, _status, status: 7});
        udpOption = {pay_time, _status, status: 7};
      }

      const res: any = await this.model('order').where({shop_id, id: order_id}).update(udpOption);
      if ( res ) {
        return this.success(res, '操作成功!');
      }
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 确认收货
   * @param {order_id} 订单id
   * @return boolean
   */
  async confirmReceivedAction() {
    try {
      const order_id: any = this.post('order_id');
      // @ts-ignore
      const shop_id = this.ctx.state.admin_info.shop_id;
      /**
       * 订单信息
       */
      const orderInfo: any = await this.model('order').where({shop_id, id: order_id}).find();
      if (think.isEmpty(orderInfo)) {
        return this.fail(-1, '该订单不存在');
      }
      if (orderInfo.status != 3) {
        /**
         * 配送方式是门店自提 并且 订单状态为10 下发机器
         */
        if (orderInfo.logistics_type == 2 && orderInfo.status == 10) {

        } else {
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
      }
      const _status = '已完成(门店自提)';
      const res: any = await this.model('order').where({shop_id, id: order_id}).update({_status, status: 4});
      const orderUpdate: any = await this.model('order_item').where({order_id}).update({
        item_status: 4,
        _item_status: _status
      });
      if (orderUpdate) {
        return this.success(res, '操作成功!');
      }
      return this.fail(-1, '操作失败!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 订单发货
   * @param {order_id} order_id
   * @param {order_item_id} order_item_id
   * @param {express_id} 快递id
   * @param {express_number} 快递单号
   * @return Boolean
   */
  async sendGoodsAction() {
    try {
      const order_id: any = this.post('order_id');
      const order_info = await this.model('order').where({id: order_id}).find();
      if (think.isEmpty(order_info)) {
        return this.fail(-1, '该订单不存在!');
      }
      /**
       * 状态不是 待发货 和 待收货 的时候
       */
      if (order_info.status != 2 && order_info.status != 3) {
        let msg: string = '';
        switch (order_info.status) {
          case 1:
            msg = '该订单未支付!';
            break;
          case 4:
            msg = '该订单已完成!';
            break;
          case -2:
            msg = '该订单已关闭!';
            break;
        }
        return this.fail(-1, msg);
      }
      const order_item_id: any = this.post('order_item_id');
      const express_id: any = this.post('express_id');
      const express_number: any = this.post('express_number');
      const expressInfo = await this.model('express_list').where({express_id}).find();
      const send_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
      if (think.isEmpty(expressInfo)) {
        return this.fail(-1, '该快递不存在');
      }
      const express_name = expressInfo.express_name;
      const _item_status = '已发货';
      const sendGoods = await this.model('order_item').where({order_item_id: ['in', order_item_id]}).update({_item_status, send_time, express_id, express_name, express_number, item_status: 2});
      if (!sendGoods) {
          return this.fail(-1, '该订单商品不存在!');
      }
      const order_item = await this.model('order_item').where({order_id, item_status: 1}).select();
      if (think.isEmpty(order_item)) {
        if (order_info.status == 2 ) {
          const _status = '商家已发货';
          // const send_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
          await this.model('order').where({id: order_id}).update({_status, status: 3, send_time, change_send_time: send_time});
        }
        if (order_info.status == 3 ) {
          const change_send_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
          await this.model('order').where({id: order_id}).update({change_send_time});
        }
      }
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 快递列表
   * @return 快递列表
   */
  async expressListAction() {
    try {
      const res = await this.model('express_list').fieldReverse('express_code').select();
      return this.success(res, '快递列表!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 查询快递
   * @param order_item_id 订单商品id
   */
  async orderTraceAction() {
    try {
      const order_item_id = this.post('order_item_id');
      const orderItem = await this.model('order_item').where({order_item_id}).find();
      if (Object.keys(orderItem).length == 0) {
        return this.fail(-1, '找不到这个订单商品');
      }
      const express_id = orderItem.express_id;
      const express_number = orderItem.express_number;
      if (orderItem.item_status == 1 || !orderItem.item_status) {
        return this.fail(-1, '该商品未发货!');
      }
      if (!express_id) {
        return this.fail(-1, '快递公司未选择');
      }

      if (think.isEmpty(express_number)) {
        return this.fail(-1, '快递单号未填写');
      }

      /**
       * 快递列表
       */
      const express_info: any = await this.model('express_list').where({express_id}).find();
      if (think.isEmpty(express_info)) {
        return this.fail(-1, '快递编号不正确');
      }
      const express_code = express_info.express_code;
      const express = think.service('express');
      const res = await express.queryExpress(express_code, express_number);

      const result: object = {
        order_id: orderItem.order_id,
        order_item_id,
        express_number,
        express_name: express_info.express_name,
        isFinish: res.isFinish,
        state: res.state,
        _state: res._state,
        traces: res.traces
      };
      return this.success(result, '查询快递!');
    } catch ($err) {
      this.dealErr($err);
    }
  }

  /**
   * 指派订单
   * @param {order_id} 订单id
   * @param {designer_team_id} 设计师团队id
   * @return boolean
   */
  async dispatchOrderAction() {
    try {
      const shop_id = this.ctx.state.admin_info.shop_id;
      const order_id = this.post('order_id');
      const designer_price = this.post('designer_price');
      const designer_team_id = this.post('designer_team_id');
      const designer_team = await this.model('designer_team').where({designer_team_id}).find();
      if (think.isEmpty(designer_team)) {
          return this.fail(-1, '该设计师团队不存在!');
      }
      const order =  await this.model('order').where({shop_id, id: order_id}).find();

      /**
       * 状态不是 待发货 和 待收货 的时候
       */
      if (order.status != 7) {
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
          case 5 || 6:
            msg = '该订单议价中!';
            break;
          case 8:
            msg = '该订单已在派单中,请勿重复操作!';
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
      if (designer_price > order.item_amount) {
        return this.fail(-1 , `给设计师的价格不能大于定制商品价格【${order.item_amount}】`);
      }
      const _status = '派单中';
      const _designer_status = '待接单';
      const res = await this.model('order').where({shop_id, id: order_id}).update({designer_price, _designer_status, designer_status: 1, _status, status: 8, designer_team_id});
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 回复订单
   * @param {order_id} 订单id
   * @return boolean
   */
  async replyOrderAction() {
      const order_id = this.post('order_id');
      const shop_id = this.ctx.state.admin_info.shop_id;
      const order =  await this.model('order').where({shop_id, id: order_id}).find();
      if (think.isEmpty(order)) {
          return this.fail(-1, '该订单不存在');
      }

      if (order.order_type != 3) {
        return this.fail(-1, '此订单不是特殊定制订单, 无法询价');
      } else {
        /**
         * 状态不是 待发货 和 待收货 的时候
         */
        if (order.status != 5) {
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
            case 6:
              msg = '该订单已回复,待客户应答!';
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
      const _status = '已回复, 待客户确认';
      const _item_status = '已回复, 待客户确认';
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
        status: 6,
        item_amount,
        pay_amount,
      });
      const res = await this.model('order_item').where({order_id}).update({
        item_status: 6,
        item_total_price,
      });
      if (!res) {
          return this.fail(-1, '操作失败!');
      }
      this.success([], '操作成功!');
  }

  /**
   * 发送机器
   * @param {order_id} 子订单id
   * @param {custom_template_id} 定制分类id
   * @param {machine_id} 机器id
   */
  async sendMachineAction() {
    try {
      const order_id = this.post('order_item_id');
      const custom_template_id = this.post('custom_template_id');
      const machine_id = this.post('machine_id');
      if (!Array.isArray(order_id)) {
        return this.fail(-1, 'order_item_id不是有效数组');
      }
      const order_item_list = await this.model('order_item').where({item_status: 10, custom_template_id, order_id: ['IN', order_id]}).select();
      if (think.isEmpty(order_item_list)) {
        return this.fail(-1, '所选订单不存在!');
      }
      // const order_item_list = await this.model('order_item').where({item_status: 10, custom_template_id, order_item_id: ['IN', order_item_id_list]}).select();
      if (order_id.length != order_item_list.length) {
        return this.fail(-1, '只有同一定制分类的订单才能同时下发!');
      }
      const machine_info  = await this.model('machine').where({custom_template_id, machine_id}).find();
      if (think.isEmpty(machine_info)) {
        return this.fail(-1, '该机器不存在');
      }
      const machine_code = machine_info.machine_info;
      if (!machine_code) {
        return this.fail(-1, '机器码不存在!');
      }
      await this.model('order').where({id: ['IN', order_id]}).update({_status: '等待下发', status: 11, machine_code});
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  async exportExcelAction() {
    // tslint:disable-next-line:jsdoc-format
    this.ctx.state.isExcel = true;
    const orderList: any =  await this.getList();
    // 导出excel表样式
    const sheetStyle = {'!cols': [{wch: 18}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}]}; // 表样式
    // 导出目录
    const excelDir = path.join(__dirname, '../', '/public/exportExcel/');
    // 导出文件名
    const fileName = `导出${orderList.data.length}条于${getFullTime()}.xlsx`;
    // 导出完整路径
    const filePath = excelDir + fileName;
    // 清理导出目录下所有文件
    // clearPath(excelDir);
    // 生成excel
    this.ctx.set({
      // 'Content-Type': 'multipart/form-data',
      // 'Content-Length': isHaveFile.size,
      // "Content-Disposition": "attachment; filename=" + `${fileName}`,

    });
    const excel = await getExcelByData(orderList.data, sheetStyle, filePath, fileName);
    this.ctx.attachment(fileName);
    this.ctx.body = excel;
  }

}

// /**
//  * 清理指定路径下的内容
//  * @param $path 路径
//  * @tip 如果指定路径不存在则生成
//  */
// function clearPath($path: any) {
//   let exceFiles = [];
//   if (fs.existsSync($path)) {
//     exceFiles = fs.readdirSync($path); // 拿到指定目录下全部内容
//     exceFiles.forEach((file, index) => {
//       const curPath = $path + "/" + file;
//       if (fs.statSync(curPath).isDirectory()) {
//         delDir(curPath); // 删除文件夹
//       } else {
//         fs.unlinkSync(curPath); // 删除文件
//       }
//     });
//   } else {
//     fs.mkdirSync($path); // 可能是第一次进入-创建
//   }
// }

/**
 * 获取完整日期
 */
function getFullTime() {
  const date = new Date();
  const year1 = date.getFullYear();
  const month1 = date.getMonth() + 1;
  const day1 = date.getDate();
  const hour1 = date.getHours();
  const minute1 = date.getMinutes();
  const second1 = date.getSeconds();
  const timers1 = `${year1}年${month1}月${day1}日${hour1}时-${minute1}分-${second1}秒`;
  return timers1;
}

/**
 * 用数据生成导出EXCEL
 * @param $data 要导出的数据
 * @param $sheetStyle 要导出的样式
 * @param $outPath 要导出的文件路径
 * @param $fileName 要导出的文件名
 * @success 返回导出excel的url
 * @failed 返回错误信息
 */
function getExcelByData($data: any, $sheetStyle: { '!cols': Array<{ wch: number; }>; }, $outPath: string, $fileName: string) {
  return new Promise((resolve, reject) => {
    // const data = JSON.parse(JSON.stringify($data)); // 复制
    const rowData: any[] = []; // 表数据
    // @ts-ignore
    const hcol: any[] = []; // 表头
    // tslint:disable-next-line:forin
    for (const col in $data[0]) {
      hcol.push(col);
    }
    rowData.push(hcol); // 将表头放入表数据第一行
    // @ts-ignore
    $data.forEach((rowV, rowK) => {
      const rows: any[] = [];
      hcol.forEach((colV, colK) => {
        rows[colK] = rowV[colV];  // 外围数据循环一次,这里在循环表头,将data[k]的每一行key对应数据拿出来到需要的格式
      });
      rowData.push(rows); // 用表头取到的数据push进表数据

    });
    const resultExcel2 = nodeXlsx.build([{name: "sheet1", data: rowData}], $sheetStyle); // node-xlsx模式
    resolve(resultExcel2);
    // fs.writeFile($outPath, resultExcel2, 'binary', function(err: any) {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     const excelcUrl = `http://localhost:8089/public/exportExcel/${$fileName}`;
    //     resolve(excelcUrl);
    //   }
    // });
  });

}
