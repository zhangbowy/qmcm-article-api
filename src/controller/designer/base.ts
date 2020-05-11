import { think } from 'thinkjs';
export default class extends think.Controller {
  async __before() {
    this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
    this.header('Access-Control-Allow-Headers', ["x-requested-with",'origin', 'token', 'content-type','design_sign']);
    this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    this.header('Access-Control-Allow-Credentials', true);
    try {
      if(this.ctx.path.indexOf('designer/user/login') === -1) {
        const design_sign = this.header("design_sign");
        if (think.isEmpty(design_sign)) {
          return this.fail(402, '未登录!', []);
        }
        let tokenFuc =  think.service('token');
        let admin_data = await tokenFuc.parse1(design_sign);
        if (admin_data == null) {
          return this.fail(402, '未登录!', []);
        }

        // @ts-ignore
        const designer_info = await this.cache(`design-${admin_data.designer_id}`, undefined, 'redis');
        if (think.isEmpty(designer_info)) {
          return this.fail(402, '未登录!', []);
        }
        this.ctx.state['designer_info'] = designer_info;
        // let Origin = this.ctx.req.headers.origin;
        // if(!Origin) {
        //   return this.fail(1001,'域名未配置!')
        // }
        // let res: any = await this.model('shops').where({domain:Origin}).find();
        // if (Object.keys(res).length == 0)
        // {
        //   return this.fail(1001,'店铺不存在!')
        // }
      } else {
        console.log(this.ctx.state.userInfo);
        // if(this.ctx.state.userInfo != null && this.ctx.path.indexOf('wx/user/login') > -1)
        // {
        //   return this.success('','已登录')
        // }
      }
    }catch (e) {
     return  this.fail(1001, e)
    }
  }
  __call() {
    return this.fail(404,'design_controller');
  }
}
