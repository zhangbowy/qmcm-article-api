import { think } from 'thinkjs';
import {ancestorWhere} from "tslint";
import restController from './rest';
export default class extends restController {

  /**
   * 控制器前置方法
   * @private
   */
  async __before() {
    try {
      // await think.timeout(800);
      this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
      this.header('Access-Control-Allow-Headers', ["x-requested-with", 'origin', 'content-type', 'adm_sign']);
      this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
      this.header('Access-Control-Allow-Credentials', true);
      const whiteList = ['/', '/article/seo','/order/exportExcel', '/admin/login', '/admin/getCaptcha', '/admin/logOut', '/index/downLoad', '/index/getDst'];
      if (whiteList.indexOf(this.ctx.path) === -1) {
        const adm_sign = this.header("adm_sign");
        if (think.isEmpty(adm_sign)) {
          return this.fail(402, '未登录1!', []);
        }
        const tokenFuc =  think.service('token');
        const admin_data = await tokenFuc.parse1(adm_sign);
        if (admin_data == null) {
          return this.fail(402, '未登录2!', []);
        }
        const admin_id = admin_data.admin_id;
        // @ts-ignore
        const admin_redis_sign = await tokenFuc.parse1(await this.cache(`admin-sign-${admin_id}`, undefined, 'redis'));
        if (think.isEmpty(admin_redis_sign)) {
          return this.fail(402, '未登录3!', []);
        }
        if (admin_data.iat < admin_redis_sign.iat) {
          const location =  await this.getLocation(this.ip);
          // return this.fail(401, `当前账号已于${admin_redis_sign.loginTime}在${location}登录!`, [admin_redis_sign]);
        }
        // @ts-ignore
        const admin_info = await this.cache(`admin-${admin_id}`, undefined, 'redis');
        if (think.isEmpty(admin_info)) {
          return this.fail(402, '登录过期,请重新登录!', []);
        }
        const now = new Date().getTime();
        const shop_info = await this.model('shops').where({shop_id: admin_info.shop_id}).find();
        const systemEndTime = new Date(shop_info.system_end_time).getTime();
        if (now > systemEndTime) {
          return this.fail(-1, '店铺已过期,请联系平台!');
        }
        // if (!await this.session('token')) {
        //   return this.fail(402, '未登录!', []);
        // }
        /**
         * 判断角色权限
         */
        const isAuth = await this.checkAuth(admin_info);
        if (isAuth) {
          /**
           * 管理后台登录用户信息
           */
          this.ctx.state.admin_info = admin_info;
        } else {
          // return this.fail(401,'您无权访问');
          return this.fail(401, '您没有此项权限!');
        }
        // console.log(this.session('token'));
      }
    } catch (e) {
      this.dealErr(e);
    }

  }
  /**
   * 控制器后置方法
   */
   async __after() {
    console.log('控制器后置方法');
  }

  /**
   * 检查是否有权限
   */
  async checkAuth(adminInfo: any) {
    /**
     * id == 1 是平台
     */
    if (adminInfo.id == 1) {
      return true;
    }

    /**
     * role_type == 2 or 1 是店铺 和 平台
     */
    if (adminInfo.role_type == 1 || adminInfo.role_type == 2) {
      return true;
    }
    /**
     * 查找后台角色
     */
    const role = await this.model('admin_role').where({admin_role_id: adminInfo.role_id}).find();
    /**
     * 不存在当前角色
     */
    if (think.isEmpty(role)) {
      return false;
    }
    const auth_api = this.ctx.request.url;
    // let auth_type =1;
    // if(auth_api.indexOf('/config/') > -1){
    //   auth_api = this.post('config_key');
    //   auth_type = 2;
    // }
    /**
     *  访问中台api的路由
     */
    const api = this.ctx.request.url.indexOf('?') > -1 ? this.ctx.request.url.split('?')[0] : this.ctx.request.url;
    /**
     * 检查权限 (匹配当前用户的权限列表)
     */
    // @ts-ignore
    const res = await this.model('auth_give').checkAuth(role.admin_role_id, api);
    return res;
  }

  /**
   * 系统日志留用
   * @param $log
   * @param $content
   */
  async saveSystemLog($log: any, $content: any) {
    const admin_info = this.ctx.state.admin_info;
    const admin_phone = this.ctx.state.admin_info.phone;
    return  await this.model('system_log').add({
      inter_face: $log,
      content: JSON.stringify($content),
      admin_phone
    });
  }

  /**
   * 控制器Action找不到进这里
   * @private
   */
  __call() {
    return this.display('error/404.html');
  }
}
