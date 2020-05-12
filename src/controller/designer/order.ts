import Base from './base.js';
import ItemModel from "../../model/item";
import {think} from "thinkjs";
const path = require('path');
export default class extends Base {

  /**
   * 订单列表
   * @param {currentPage}
   * @param {pageSize}
   * @param {status} 订单状态 状态 -2、已关闭/取消订单  0 全部 1、待付款 ，2、待发货 3、已发货 4、已完成  5、询价中 6、询价回复
   * @param {order_no} 订单编号
   * @param {order_type} 订单类型  1、普通订单    2、一般定制    3 、特殊定制    4 、手绘     5、 询价
   * @return order_list
   */
  async orderListAction() {
    try {
      // @ts-ignore
      const shop_id = this.ctx.state.admin_info.shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      const status: number = Number(this.post('status') || 0);
      const order_no: string = this.post('order_no') || '';
      const order_type: number = Number(this.post('order_type') || 0);
      let where: any = {};
      where.order_no = ['like',`%${order_no}%`];
      where.shop_id = shop_id;
      if (status) {
        where.status = status
      }
      if (order_type) {
        where.order_type = order_type
      }
      let res = await this.model('order').order('order_no DESC').page(page, limit).where(where).countSelect();
      // let res = await this.model('order').group('status').where(where).countSelect();
      return this.success(res, '请求成功!');
    }catch (e) {
      return this.fail(-1, e);
    }
  }


  /**
   * 订单状态统计
   * @param {order_no} 订单编号
   * @param {order_type} 订单类型  1、普通订单    2、一般定制    3 、特殊定制    4 、手绘     5、 询价
   * returns {status: countNum}
   */
  async orderCountAction() {
    try {
      // @ts-ignore
      const shop_id = this.ctx.state.admin_info.shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      // const status: number = this.post('status') || 0;
      const order_no: string = this.post('order_no') || '';
      const order_type: string = this.post('order_type') || 0;
      let where: any = {};
      where.order_no = ['like',`%${order_no}%`];
      where.shop_id = shop_id;
      // if (status) {
      //   // where.status = status
      // }
      if (order_type) {
        where.order_type = order_type
      }

      /**
       * 订单状态列表 -2、已关闭/取消订单  0 全部 1、待付款 ，2、待发货 3、已发货 4、已完成  5、询价中 6、询价回复
       */
      let statusList = [1,2,3,4,5,6,-2];
      let res:any = await this.model('order').order('order_no DESC').where(where).count('status');
      // let res:any = await this.model('order').group('status').where(where).countSelect();
      let statusObj: any = {};
      // let obj1 = {
      //   status: 0,
      //   count: res1
      // }
      // statusObj.push(obj1);
      statusObj[0] = res;
      for (let item of statusList) {
        where.status = item;
        let data: any = await this.model('order').where(where).count( 'status');
        statusObj[item] = data
        // let obj = {
        //   status: item,
        //   count: data
        // };
        // statusObj.push(obj)
      };
      return this.success(statusObj, '请求成功!');
    }catch (e) {
      return this.fail(-1, e);
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
      let res = await this.model('order').where({shop_id, order_no}).find();
      if (Object.keys(res).length == 0) {
        return this.fail(-1, '该订单不存在!')
      }
      return this.success(res, '请求成功!');
    }catch (e) {
      return this.fail(-1, e);
    }
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

      let orderInfo: any = await this.model('order').where( {shop_id, id:order_id}).find();
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
      let pay_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
      let res: any = await this.model('order').where({shop_id, id: order_id}).update({pay_time, _status, status:2});

      if ( res ) {
        return this.success(res, '请求成功!');
      }
    }catch (e) {
      return this.fail(-1, e);
    }
  }

  /**
   * 确认收货
   * @param {order_id} 订单id
   */
  async confirmReceivedAction() {
    try {
      const order_id: any = this.post('order_id');
      // @ts-ignore
      const shop_id = this.ctx.state.admin_info.shop_id;

      let orderInfo: any = await this.model('order').where({shop_id, id: order_id}).find();
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
        return this.fail(-1, msg)
      }
      let _status = '已完成';
      let res: any = await this.model('order').where({shop_id, id: order_id}).update({_status, status: 4});
      let orderUpdate: any = await this.model('order_item').where({ order_id: order_id}).update({item_status:3, _item_status: _status});
      if (orderUpdate) {
        return this.success(res, '确认收货成功!');
      }
      return this.fail(-1, '操作失败!');
    } catch (e) {
      return this.fail(-1, e);
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
            msg='该订单未支付!';
                break;
          case 4:
            msg='该订单已完成!';
                break;
          case -2:
            msg='该订单已关闭!';
            break;
        }
        return this.fail(-1, msg)
      }
      const order_item_id: any = this.post('order_item_id');
      const express_id: any = this.post('express_id');
      const express_number: any = this.post('express_number');
      let expressInfo = await this.model('express_list').where({express_id}).find();
      let send_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
      if (think.isEmpty(expressInfo)) {
        return this.fail(-1, '该快递不存在');
      }
      const express_name = expressInfo.express_name;
      let _item_status = '已发货';
      let sendGoods = await this.model('order_item').where({order_item_id:['in',order_item_id]}).update({_item_status, send_time,express_id, express_name, express_number, item_status:2});
      if (!sendGoods) {
          return this.fail(-1, '该订单商品不存在!')
      }
       let order_item = await this.model('order_item').where({order_id,item_status:1}).select();
      if (think.isEmpty(order_item)) {
        if(order_info.status == 2 ) {
          let _status = '商家已发货';
          let send_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
          await this.model('order').where({id:order_id}).update({_status, status:3,send_time,change_send_time:send_time});
        }
        if(order_info.status == 3 ) {
          let change_send_time = think.datetime(  new Date().getTime(), 'YYYY-MM-DD HH:mm:ss');
          await this.model('order').where({id:order_id}).update({change_send_time});
        }
      }
      return this.success([], '操作成功!');
    }catch (e) {
      return this.fail(-1, e);
    }
  }

  /**
   * 快递列表
   * @return 快递列表
   */
  async expressListAction() {
    try {
      const res = await this.model('express_list').fieldReverse('express_code').select();
      return this.success(res,'请求成功!');
    }catch (e) {
      return this.fail(-1, e);
    }
  }

  /**
   * 查询快递
   * @param order_item_id 订单商品id
   */
  async orderTraceAction() {
    try {
      const order_item_id = this.post('order_item_id');
      let orderItem = await this.model('order_item').where({order_item_id}).find();
      if (Object.keys(orderItem).length == 0) {
        return this.fail(-1, '找不到这个订单商品');
      }
      let express_id = orderItem.express_id;
      let express_number = orderItem.express_number;
      if (orderItem.item_status == 1) {
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
        order_item_id: order_item_id,
        express_number,
        express_name: express_info.express_name,
        isFinish:res.isFinish,
        state:res.state,
        _state:res._state,
        traces:res.traces
      };
      return this.success(result, '请求成功!');
    } catch (e) {
      return this.fail(-1, e);
    }
  }

}
