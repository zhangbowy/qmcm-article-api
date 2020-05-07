import { think } from 'thinkjs';
export default class extends think.Controller {
  async __before() {
    // await think.timeout(500)
    this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
    this.header('Access-Control-Allow-Headers', ["x-requested-with",'origin','content-type']);
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    this.header('Access-Control-Allow-Credentials', true);
    if (this.ctx.path.indexOf('/user/login') === -1 ) {
      if (!await this.session('token')) {
        return this.fail(402, '未登录!', []);
      }
      // await this.ctx.state.userInfo = 1
      // tslint:disable-next-line:no-console
      console.log(this.session('token'));
    }
  }
  __call() {
    return this.fail(404,'404');
  }
}
