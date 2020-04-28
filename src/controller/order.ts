import Base from './base.js';
import ItemModel from "../model/item";
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
      const shop_id = (await this.session('token')).shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      const status: number = this.post('status') || 0;
      const order_no: string = this.post('order_no') || '';
      const order_type: string = this.post('order_type') || 0;
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
      this.success(res, '请求成功!');
    }catch (e) {
      this.fail(-1, e);
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
      const shop_id = (await this.session('token')).shop_id;
      let res = await this.model('order').where({shop_id, order_no}).find();
      if (Object.keys(res).length == 0) {
        return this.fail(-1, '该订单不存在!')
      }
      this.success(res,'请求成功!');
    }catch (e) {
      this.fail(-1, e);
    }
  }

}
