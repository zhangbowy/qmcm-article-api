import { think } from 'thinkjs';
import restController from '../rest';
export default class extends restController {
  async __before() {
    this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
    this.header('Access-Control-Allow-Headers', ["x-requested-with", 'origin', 'token', 'content-type', 'ops']);
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    this.header('Access-Control-Allow-Credentials', true);
    try {
      this.ctx.state.token = this.cookie('user_sign') || '';
      const tokenSerivce = think.service('wx/token');
      this.ctx.state.userInfo = await tokenSerivce.parse1(this.ctx.state.token);

      const host = this.ctx.req.headers.host;
      const whiteList = ['/wx/order/getDst', '/wx/order/notify', 'wx/order/crontab'];
      if (host != 'cxmob.tecqm.club' && whiteList.indexOf(this.ctx.path) === -1 ) {
        if (!host) {
          return this.fail(1001, '域名未配置!');
        }

        const config: any = await this.model('shop_setting').where({domain: host}).find();
        if (Object.keys(config).length == 0) {
          return this.fail(1001, '店铺不存在或域名未配置!');
        }
        const shopInfo = await think.model('shops').where({shop_id: config.shop_id}).find();
        if (Object.keys(config).length == 0) {
          return this.fail(shopInfo, '店铺不存在');
        }
        await think.config('shopConfig', config);
        this.ctx.state.shop_id = config.shop_id;
        this.ctx.state.shop_info = shopInfo;

        const now = new Date().getTime();
        const shop_info = await this.model('shops').where({shop_id: config.shop_id}).find();
        const endTime = new Date(shop_info.system_end_time).getTime();
        if (now > endTime) {
          return this.fail(-1, '店铺异常,请联系商家!');
        }
        if (this.ctx.path.indexOf('wx/user/login') === -1 && this.ctx.path.indexOf('wx/user/auth') === -1 && !/wx\/wechat/.test(this.ctx.path)) {
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
      return this.fail(1001, e);
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
