import { think } from 'thinkjs';
import restController from '../rest';
export default class extends restController {
  async __before() {
    this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
    this.header('Access-Control-Allow-Headers', ["x-requested-with", 'origin', 'token', 'content-type']);
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    this.header('Access-Control-Allow-Credentials', true);
    try {
      this.ctx.state.token = this.cookie('user_sign') || '';
      const tokenSerivce = think.service('wx/token');
      this.ctx.state.userInfo = await tokenSerivce.parse1(this.ctx.state.token);

      const host = this.ctx.req.headers.host;
      if (host != 'cxmob.tecqm.club') {
        if (!host) {
          return this.fail(1001, '域名未配置!');
        }

        const res: any = await this.model('shops').where({domain: host}).find();
        if (Object.keys(res).length == 0) {
          return this.fail(1001, '店铺不存在!');
        }
        const config = await think.model('shop_setting').where({shop_id: res.shop_id}).find();
        if (think.isEmpty(config)) {
          return this.fail(-1, '店铺信息未配置!');
        }
        await think.config('shopConfig', config);
        this.ctx.state.shop_id = res.shop_id;
        this.ctx.state.shop_info = res;

        if (this.ctx.path.indexOf('wx/user/login') === -1 && this.ctx.path.indexOf('wx/user/auth') === -1 ) {
          if (this.ctx.state.userInfo == null) {
            return this.fail(402, '未登录');
          }

        } else {
          console.log(this.ctx.state.userInfo);
          // if(this.ctx.state.userInfo != null && this.ctx.path.indexOf('wx/user/login') > -1)
          // {
          //   return this.success('','已登录')
          // }
        }
      }
    } catch (e) {
     return  this.fail(1001, e);
    }
    if (this.ctx.path.indexOf('/user/login') === -1) {
      if (!await this.session('token')) {
        // return this.fail(402, '未登录!', []);
      }
      // await this.ctx.state.userInfo = 1
      // await  this.session('token', await  this.session('token'));
      // tslint:disable-next-line:no-console
      // console.log(this.session('token'));
    }
  }
  __call() {
    return this.fail(404, '404');
  }
}
