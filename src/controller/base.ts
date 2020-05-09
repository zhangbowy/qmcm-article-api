import { think } from 'thinkjs';
export default class extends think.Controller {
  async __before() {
    try {
      // await think.timeout(500)
      this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
      this.header('Access-Control-Allow-Headers', ["x-requested-with",'origin','content-type','adm_sign']);
      this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
      this.header('Access-Control-Allow-Credentials', true);

      if (this.ctx.path.indexOf('/admin/login') === -1 && this.ctx.path.indexOf('/admin/getCaptcha') === -1) {
        const adm_sign = this.header("adm_sign");
        if (think.isEmpty(adm_sign)) {
          return this.fail(402, '未登录!', []);
        }
        let tokenFuc =  think.service('token');
        let admin_data = await tokenFuc.parse1(adm_sign);
        if (admin_data == null) {
          return this.fail(402, '未登录!', []);
        }
        let admin_id = admin_data.admin_id;
        // @ts-ignore
        const admin_redis_sign = await tokenFuc.parse1(await this.cache(`admin-sign-${admin_id}`, undefined, 'redis'));
        if(think.isEmpty(admin_redis_sign)) {
          return this.fail(402, '未登录!', []);
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
        /**
         * 管理后台登录用户信息
         */
        this.ctx.state['admin_info'] = admin_info;
        console.log(this.session('token'));
      }
    }catch (e) {
      return this.fail(-1, e);
    }

  }
  __call() {
    return this.fail(404,'404');
  }
}
