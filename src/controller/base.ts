import { think } from 'thinkjs';
import {ancestorWhere} from "tslint";
import restController from './rest'
export default class extends restController {
  async __before() {
    try {
      await think.timeout(500);
      this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
      this.header('Access-Control-Allow-Headers', ["x-requested-with",'origin','content-type','adm_sign']);
      this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
      this.header('Access-Control-Allow-Credentials', true);
      let whiteList = [ '/admin/login','/admin/getCaptcha','/admin/logOut', '/index/downLoad'];
      if (whiteList.indexOf(this.ctx.path) === -1) {
        const adm_sign = this.header("adm_sign");
        if (think.isEmpty(adm_sign)) {
          return this.fail(402, '未登录1!', []);
        }
        let tokenFuc =  think.service('token');
        let admin_data = await tokenFuc.parse1(adm_sign);
        if (admin_data == null) {
          return this.fail(402, '未登录2!', []);
        }
        let admin_id = admin_data.admin_id;
        // @ts-ignore
        const admin_redis_sign = await tokenFuc.parse1(await this.cache(`admin-sign-${admin_id}`, undefined, 'redis'));
        if(think.isEmpty(admin_redis_sign)) {
          return this.fail(402, '未登录3!', []);
        }
        // if(admin_data.iat < admin_redis_sign.iat) {
        //   return this.fail(402, '当前账号已在其他浏览器登录!', []);
        // }
        // @ts-ignore
        const admin_info = await this.cache(`admin-${admin_id}`, undefined, 'redis');
        if(think.isEmpty(admin_info)) {
          return this.fail(402, '登录过期,请重新登录!', []);
        }
        // if (!await this.session('token')) {
        //   return this.fail(402, '未登录!', []);
        // }

        let isAuth = await this.checkAuth(admin_info);
        if (isAuth) {
          /**
           * 管理后台登录用户信息
           */
          this.ctx.state['admin_info'] = admin_info;
        } else {
          // return this.fail(401,'您无权访问');
          return this.fail(401,'您没有此项权限!');
        }
        console.log(this.session('token'));
      }
    }catch (e) {
      this.dealErr(e);
    }

  }
  /**
   * 控制器后置方法
   */
   async __after(){
    console.log('控制器后置方法')
  }

  /**
   * 检查是否有权限
   */
  async checkAuth (aminInfo: any) {
    /**
     * id == 1 是平台
     */
    if(aminInfo.id == 1){
      return true
    }

    /**
     * role_type == 2 or 1 是店铺 和 平台
     */
    if (aminInfo.role_type == 1 || aminInfo.role_type == 2) {
      return true
    }

    let role = await this.model('admin_role').where({admin_role_id: aminInfo.role_id}).find();

    if(!role.admin_role_id){
      return false
    }
    let auth_api = this.ctx.request.url;
    // let auth_type =1;
    // if(auth_api.indexOf('/config/') > -1){
    //   auth_api = this.post('config_key');
    //   auth_type = 2;
    // }
    /**
     *  访问中台的路由
     */
    const api = this.ctx.request.url.indexOf('?')> -1?this.ctx.request.url.split('?')[0]:this.ctx.request.url;
    /**
     * 检查权限
     */
    // @ts-ignore
    let res = await this.model('auth_give').checkAuth(role.admin_role_id,api);
    return res
  }

  async saveSystemLog($log: any,$content: any) {
    const admin_info = this.ctx.state.admin_info;
    const admin_phone = this.ctx.state.admin_info.phone;
     return  await this.model('system_log').add({
      inter_face:$log,
      content:JSON.stringify($content),
      admin_phone:admin_phone
    })
  }

  __call() {
    return this.fail(404,'adm_controller');
  }
}
