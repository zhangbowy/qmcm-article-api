import { think } from 'thinkjs';
export default class extends think.Controller {
  async __before() {
    this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
    this.header('Access-Control-Allow-Headers', ["x-requested-with",'origin', 'token', 'content-type']);
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    this.header('Access-Control-Allow-Credentials', true);
    try {
      if(this.ctx.path.indexOf('/user/login') === -1 && this.ctx.path.indexOf('/user/auth') === -1 ) {
        let Origin = this.ctx.req.headers.origin;
        if(!Origin) {
          return this.fail(1001,'域名未配置!')
        }
        let res: any = await this.model('shops').where({domain:Origin}).find();
        if (Object.keys(res).length == 0)
        {
          return  this.redirect('http://www.wkdao.com')
        }
        this.ctx.state.shop_id = res.shop_id
      }

    }catch (e) {
     return  this.fail(1001, e)

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
    return this.fail(404,'404');
  }
}
