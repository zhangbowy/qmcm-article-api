import Base from './base.js';
import ShopsModel from './../model/shops';
import AdminModel from './../model/admin';
export default class extends Base {
    /**
     * 店鋪列表
     */
    async shopListAction() {
        try {
            const page: number = this.post('currentPage') || 1;
            const limit: number = this.post('pageSize') || 10;
            const shop_name: string = this.post('shop_name') || "";
            const model = this.model('shops') as ShopsModel;
            const data = await  model.shopList({page, limit, shop_name});
            return this.success(data, '请求成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 添加店鋪
     * @param {shop_name} 店铺名称
     * @param {logo} 店铺logo
     * @param {system_end_time} 系统过期时间
     * @param {name} 管理员姓名
     * @param {phone} 手机号
     * @param {pwd} 密码
     * @return boolean
     */
    async addShopAction() {
        try {
            const shop_name: string = this.post('shop_name');
            const logo: string = this.post('logo') || 1;
            const system_end_time: string = this.post('system_end_time');
            const name: string = this.post('name');
            const phone: number = this.post('phone');
            const pwd: Buffer = new Buffer(this.post('password'), 'utf-8' );
            const params: any = {
                shop_name,
                logo,
                system_end_time
            };
            const model = this.model('shops') as ShopsModel;
            const adminModel =  this.model('admin') as AdminModel;
            const isHaveName = await model.getShopByName(shop_name);
            // if (!think.isEmpty(isHaveName)) {
            //     return this.fail(-1, '店鋪名已存在', []);
            // }
            const isHaveUser = await adminModel.getUserByPhone(phone);
            if (!think.isEmpty(isHaveUser)) {
                return this.fail(-1, '该手机号已被使用', []);
            }
            const shopData = await  model.addShop(params);
            const shopInfo: any = await model.getShopByName(shop_name);
            const adminParams: any =  {
                name,
                phone,
                pwd,
                role_type: 2,
                _role_type: '店铺管理员',
                shop_id: shopInfo.shop_id
            };
            const res = await  adminModel.addAdmin(adminParams);
            return this.success([], '添加成功!');
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 编辑店鋪
     * @param {shop_name} 店铺名称
     * @param {logo} 店铺logo
     * @param {system_end_time} 系统过期时间
     * @param {name} 管理员姓名
     * @param {phone} 手机号
     * @param {pwd} 密码
     * @return boolean
     */
    async editShopAction() {
        try {
            const shop_id: number = this.post('shop_id');
            const shop_name: string = this.post('shop_name');
            const logo: string = this.post('logo') || 1;
            const system_end_time: string = this.post('system_end_time');
            const name: string = this.post('name');
            const phone: number = this.post('phone');
            let pwd: Buffer;
            const adminParams: any =  {
                name,
                phone,
            };
            if (this.post('password')) {
                pwd = new Buffer(this.post('password'), 'utf-8' );
                adminParams.pwd = pwd;
            }
            const params: any = {
                shop_name,
                logo,
                system_end_time
            };

            const model = this.model('shops') as ShopsModel;
            const adminModel =  this.model('admin') as AdminModel;
            // const isHaveName = await model.getShopByName(shop_name);
            // if (!think.isEmpty(isHaveName)) {
            //     return this.fail(-1, '店鋪名已存在', []);
            // }
            // const isHaveUser = await adminModel.getUserByPhone(phone);
            // if (!think.isEmpty(isHaveUser)) {
            //     return this.fail(-1, '该手机号已被其他店铺使用', []);
            // }
            const shopData = await  model.editShop(shop_id, params);
            const data: any = await  adminModel.editAdmin(shop_id, adminParams);
            return this.success(data, '请求成功!');
        } catch (e) {
           this.dealErr(e);
        }
    }

    /**
     * 刪除店鋪
     * @param {shop_id} 店鋪id
     */
    async delShopAction() {
        try {
            const shopId: number = this.post('shop_id');
            const model = this.model('shops') as ShopsModel;
            const data = await  model.delShop(shopId);
            if (data) {
                return this.success([], '删除成功!');
            } else {
                return this.fail(-1, '删除失败!', []);
            }
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 根据店铺id获取详情
     */
    async  getShopByShopId() {

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
        try {
            // @ts-ignore
            // const shop_id = this.ctx.state.admin_info.shop_id;
            // const shop_id = this.ctx.state.admin_info.shop_id;
            const shop_id = this.post('shop_id');
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
            const where: any = {};
            where.order_no = ['like', `%${order_no}%`];
            // where.shop_id = shop_id;
            if (shop_id) {
                where.shop_id = shop_id;
            }
            if (status) {
                where.status = status;
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
            let orderIdList;
            let result;
            if (express_number) {
                orderIdList = await this.model('order_item').where({express_number}).getField('order_id');
                // @ts-ignore
                if (orderIdList.length > 0) {
                    where.id = ['IN', orderIdList];
                } else {
                    where.id = 0;
                }
                // result = await this.model('order').order('updated_at DESC').page(page, limit).where(where).countSelect();
            } else {
                // result = await this.model('order').order('updated_at DESC').page(page, limit).where(where).countSelect();
            }
            result = await this.model('order').order('updated_at DESC').page(page, limit).where(where).countSelect();
            if (this.ctx.state.isExcel) {
                // @ts-ignore
            }
            return this.success(result, '全部订单');
        } catch (e) {
            this.dealErr(e);
        }
    }
}
