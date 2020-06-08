import Base from './base.js';
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
      const designer_info = this.ctx.state.designer_info;
      const designer_team_id = designer_info.designer_team_id;

      // @ts-ignore
      const shop_id = designer_info.shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      const status: number = this.post('status') || '9,2,3,4';
      const order_no: string = this.post('order_no') || '';
      const order_type: number = Number(this.post('order_type') || 0);
      const where: any = {};
      where.order_no = ['like', `%${order_no}%`];
      where.shop_id = shop_id;
      where.designer_team_id = designer_team_id;
      if (!designer_info.is_leader) {
        where.designer_id  = designer_info.designer_id;
      }
      if (status) {
        where.designer_status = ['IN', status];
      }
      if (order_type) {
        where.order_type = order_type;
      }
      const res = await this.model('order').order('order_no DESC').page(page, limit).where(where).countSelect();
      // let res = await this.model('order').group('status').where(where).countSelect();
      return this.success(res, '请求成功!');
    } catch (e) {
      this.dealErr(e);
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
      const designer_info = this.ctx.state.designer_info;
      const designer_team_id = designer_info.designer_team_id;

      // @ts-ignore
      const shop_id = designer_info.shop_id;
      const page: number = this.post('currentPage') || 1;
      const limit: number = this.post('pageSize') || 10;
      // const status: number = this.post('status') || 0;
      const order_no: string = this.post('order_no') || '';
      const order_type: string = this.post('order_type') || 0;
      const where: any = {};
      where.order_no = ['like', `%${order_no}%`];
      where.shop_id = shop_id;
      where.designer_team_id = designer_team_id;
      if (!designer_info.is_leader) {
        where.designer_id  = designer_info.designer_id;
      }
      // if (status) {
      //   // where.status = status
      // }
      if (order_type) {
        where.order_type = order_type;
      }

      /**
       * 订单状态列表 -2、已关闭/取消订单  0 全部 1、待付款 ，2、待发货 3、已发货 4、已完成  5、询价中 6、询价回复 7、待派单 8、派单中 9 设计师处理中
       */
      const statusList = [1, 2, 3, 4, 5, 6, 7, 8, 9, -2];
      const statusListn = [
        {
          _status: "全部",
          status: '1,2,3,4',
          params: {
            designer_team_id: designer_info.designer_team_id
          },
          count: 0
        },
        {
          _status: "待接单",
          status: '1',
          is_leader: 1,
          count: 0
        },
        {
          _status: "待指派设计师",
          status: '2',
          is_leader: 1,
          count: 0
        },
        {
          _status: "设计师处理",
          status: '3',
          count: 0
        },
        {
          _status: "已完成",
          status: '4',
          count: 0
        }
      ];
      const result: any = [];
      for (const item of statusListn) {
        if (!designer_info.is_leader && item.is_leader) {
          const index = statusListn.indexOf(item);
          statusListn.splice(index, 1);
        } else {
          where.designer_status = ['IN', item.status];
          const count =  await this.model('order').where(where).order('created_at DESC').count('status');
          const index = statusListn.indexOf(item);
          statusListn[index].count = count;
          result.push(item);
        }
      }
      return this.success(result, '请求成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 接单
   * @param {order_id} 订单id
   * @return boolean
   */
  async receiveOrderAction() {
    try {
      const designer_info = this.ctx.state.designer_info;
      const designer_team_id = designer_info.designer_team_id;
      const shop_id = designer_info.shop_id;
      const order_id = this.post('order_id');

      const order =  await this.model('order').where({shop_id, id: order_id}).find();
      /**
       * 状态 status 8 是正在派单中!
       */
      if (order.status != 8) {
        return this.fail(-1, '该订单没有在派单中');
      }
      /**
       * 状态不是 待发货 和 待收货 的时候
       */
      if (order.designer_status != 1) {
        let msg: string = '';
        switch (order.status) {
          case 2:
            msg = '该订单派单!';
            break;
          case 3:
            msg = '该订单已指派!';
            break;
          case 4:
            msg = '该订单已制作完成!';
            break;
        }
        return this.fail(-1, msg);
      }
      const _status = "设计师处理中";
      const _designer_status = '已接单,待指派设计师';
      const res = await this.model('order').where({designer_team_id, shop_id, id: order_id}).update({ _designer_status, designer_status: 2, _status, status: 9 });
      if (think.isEmpty(res)) {
        return this.fail(-1, '订单不存在');
      }
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 拒绝订单
   * @param {order_id} 订单id
   * @return boolean
   */
  async refuseOrderAction() {
    try {
      const designer_info = this.ctx.state.designer_info;
      const designer_team_id = designer_info.designer_team_id;
      const shop_id = designer_info.shop_id;
      const order_id = this.post('order_id');

      const order =  await this.model('order').where({shop_id, id: order_id}).find();
      if (order.status != 8) {
        return this.fail(-1, '该订单没有在派单中');
      }
      /**
       * 状态不是 待发货 和 待收货 的时候
       */
      if (order.designer_status != 1) {
        let msg: string = '';
        switch (order.status) {
          case 2:
            msg = '该订单派单!';
            break;
          case 3:
            msg = '该订单已指派!';
            break;
          case 4:
            msg = '该订单已制作完成!';
            break;
        }
        return this.fail(-1, msg);
      }

      const _status = "设计师团队拒绝接单,等待重新派单";
      const _designer_status = '拒绝接单';
      const res = await this.model('order').where({designer_team_id, shop_id, id: order_id}).update({ _designer_status, designer_status: 0, _status, status: 7 });
      if (think.isEmpty(res)) {
        return this.fail(-1, '订单不存在');
      }
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

   /**
    * 指派订单
    * @param {order_id} 订单id
    * @param {designer_id} 设计师id
    * @return boolean
    */
  async dispatchOrderAction() {
    try {
      const designer_info = this.ctx.state.designer_info;
      const designer_team_id = designer_info.designer_team_id;
      const shop_id = designer_info.shop_id;
      const order_id = this.post('order_id');
      const designer_id = this.post('designer_id');
      const designer = await this.model('designer').where({designer_id}).find();
      if (think.isEmpty(designer)) {
        return this.fail(-1, '设计师不存在');
      }
      if (designer.designer_team_id != designer_team_id) {
        return this.fail(-1, '该设计师不属于当前团队,请勿非法操作。');
      }
      const order =  await this.model('order').where({shop_id, id: order_id}).find();
      /**
       * 状态不是 待发货 和 待收货 的时候
       */
      if (order.designer_status != 2) {
        let msg: string = '';
        switch (order.status) {
          case 1:
            msg = '该订单待接单!';
            break;
          case 3:
            msg = '该订单已指派!';
            break;
          case 4:
            msg = '该订单已制作完成!';
            break;
        }
        return this.fail(-1, msg);
      }
      const _designer_status = '设计师处理中';
      const _status = '设计师处理中';
      const res = await this.model('order').where({shop_id, id: order_id}).update({designer_id, _designer_status, designer_status: 3});
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 上传订单花样
   * @param {order_id} 订单id
   * @param {emb} emb
   * @param {dst} dst
   * @param {prev_png} 花样预览图
   * @param {txt_png} 工艺单图片
   * @return boolean
   */
  async uploadDesignAction() {
    try {
      const order_id = this.post('order_id');
      const order_emb_path = this.file('emb');
      const order_dst_path = this.file('dst');
      const order_png_path = this.file('prev_png');
      const order_txt_png_path = this.file('txt_png');
      if (!order_emb_path || !order_emb_path.type) {
        return this.fail(-1, 'emb不能为空!');
      }
      if (!order_dst_path || !order_dst_path.type) {
        return this.fail(-1, 'dst不能为空!');
      }
      if (!order_png_path || !order_png_path.type) {
        return this.fail(-1, 'png不能为空!');
      }
      if (!order_txt_png_path || !order_txt_png_path.type) {
        return this.fail(-1, 'txt_png不能为空!');

      }
      const arrObj = {
        order_emb_path: "emb",
        order_dst_path: "dst",
        order_png_path: "prev_png",
        order_txt_png_path: "txt_png",
      };
      const paramObj: any = {};
      const oss = await think.service('oss');
      const design_info = this.ctx.state.designer_info;
      const shop_id: number = design_info.shop_id;
      const designer_id: number = design_info.designer_id;
      // @ts-ignore
      // tslint:disable-next-line:forin
      for (const k in arrObj) {
        const fileName = think.uuid('v4');
        const gs = this.file(arrObj[k]).type.substring(6, this.file(arrObj[k]).type.length);
        const day = think.datetime(new Date().getTime(), 'YYYY-MM-DD');
        const filePath = `/order/${shop_id}/${designer_id}/${day}/${fileName}.${gs}`;
        /**
         * 上传到腾讯OSS
         */
        const res: any = await oss.upload(this.file(arrObj[k]).path, filePath);
        paramObj[k] = 'http://' + res.Location;
      }
      /**
       * 订单状态为10就是设计师上传完待打印
       */
      paramObj.item_status = 10;
      const itemCount = await this.model('order_item').where({order_id}).update(paramObj);
      if (think.isEmpty(itemCount)) {
        return this.fail(-1, '订单不存在!');
      }
      await this.model('order').where({id: order_id, shop_id}).update({
        _status: '待打印',
        status: 10,
        designer_status: 4,
        _designer_status: '设计师制作完成'
      });
      return this.success([], '操作成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 订单详情
   * @param {order_no} 订单编号
   * @return boolean
   */
  async orderDetailAction() {
    try {
      const order_no: any = this.post('order_no');
      const designer_info = this.ctx.state.designer_info;
      const designer_team_id = designer_info.designer_team_id;
      const shop_id = designer_info.shop_id;
      const res = await this.model('order').where({shop_id, order_no}).find();
      if (think.isEmpty(res)) {
        return this.fail(-1, '该订单不存在!');
      }
      return this.success(res, '请求成功!');
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
      return this.success(res, '请求成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 查询快递
   * @param order_item_id 订单商品id
   * @return 物流信息
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
        return this.fail(-1, '快递编码不正确');
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
      return this.success(result, '请求成功!');
    } catch (e) {
      this.dealErr(e);
    }
  }
}
