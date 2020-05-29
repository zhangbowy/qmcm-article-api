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
      if (this.ctx.path.indexOf('wx/user/login') === -1 && this.ctx.path.indexOf('wx/user/auth') === -1 ) {
        if (this.ctx.state.userInfo == null) {
          return this.fail(402, '未登录');
        }
        // let Origin = this.ctx.req.headers.origin;
        // if(!Origin) {
        //   return this.fail(1001,'域名未配置!')
        // }
        // let res: any = await this.model('shops').where({domain:Origin}).find();
        // if (Object.keys(res).length == 0)
        // {
        //   return this.fail(1001,'店铺不存在!')
        // }
        this.ctx.state.shop_id = 15;
      } else {
        console.log(this.ctx.state.userInfo);
        // if(this.ctx.state.userInfo != null && this.ctx.path.indexOf('wx/user/login') > -1)
        // {
        //   return this.success('','已登录')
        // }
      }
      this.ctx.state.shop_id = 15;
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
