import Base from './base.js';
import ShopsModel from './../model/shops';
import AdminModel from './../model/admin';
export default class extends Base {
    /**
     * 店鋪列表
     */
    async shopListAction() {
        const page: number = this.post('currentPage') || 1;
        const limit: number = this.post('pageSize') || 10;
        const shop_name: string = this.post('shop_name') || "";
        const model = this.model('shops') as ShopsModel;
        const data = await  model.shopList({page, limit, shop_name});
        return this.success(data, '请求成功!');
    }
    /**
     * 添加店鋪
     */
    async addShopAction() {
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
        }
        const model = this.model('shops') as ShopsModel;
        const adminModel =  this.model('admin') as AdminModel;
        const isHaveName = await model.getShopByName(shop_name);
        if (!think.isEmpty(isHaveName)) {
           return this.fail(-1, '店鋪名已存在', []);
        }
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
            shop_id: shopInfo.shop_id
        }
        const res = await  adminModel.addAdmin(adminParams);
        return this.success([], '添加成功!');
    }
    /**
     * 編輯店鋪
     */
    async editShopAction() {
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
        }
        if (this.post('password')) {
            pwd = new Buffer(this.post('password'), 'utf-8' );
            adminParams.pwd = pwd;
        }
        const params: any = {
            shop_name,
            logo,
            system_end_time
        }

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
    }
    /**
     * 刪除店鋪
     */
    async delShopAction() {
        const shopId: number = this.post('shop_id');
        const model = this.model('shops') as ShopsModel;
        const data = await  model.delShop(shopId);
        if (data) {
            return this.success([], '删除成功!');

        } else {
            return this.fail(-1, '删除失败!', []);
        }

    }
    /**
     * 根据店铺id获取详情
     */
    async  getShopByShopId() {

    }
}
