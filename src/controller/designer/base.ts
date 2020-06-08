import {think} from 'thinkjs';
import restController from '../rest';

export default class extends restController {
    async __before() {
        this.header('Access-Control-Allow-Origin', this.header("origin") || "*");
        this.header('Access-Control-Allow-Headers', ["x-requested-with", 'origin', 'content-type', 'design_sign']);
        this.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
        this.header('Access-Control-Allow-Credentials', true);
        try {
          const whiteList = [ '/designer/user/login', '/designer/design/downLoad', '/designer/user/sendSms'];
          if (whiteList.indexOf(this.ctx.path) === -1) {
            // if (this.ctx.path.indexOf('designer/user/login') === -1 && this.ctx.path.indexOf('designer/design/downLoad') === -1) {
                const design_sign = this.header("design_sign");
                if (think.isEmpty(design_sign)) {
                    return this.fail(402, '未登录!', ['header not design_sign']);
                }
                const tokenFuc = think.service('token');
                const admin_data = await tokenFuc.parse1(design_sign);
                if (admin_data == null) {
                    return this.fail(402, '未登录!', ['token无效']);
                }
                // @ts-ignore
                const designer_info = await this.cache(`design-${admin_data.designer_id}`, undefined, 'redis');
                if (think.isEmpty(designer_info)) {
                    return this.fail(402, '未登录!', ['redis过期']);
                }

                // @ts-ignore
                const admin_redis_sign = await tokenFuc.parse1(await this.cache(`design-sign-${admin_data.designer_id}`, undefined, 'redis'));
                if (think.isEmpty(admin_redis_sign)) {
                  return this.fail(402, '未登录3!', []);
                }
                if (admin_data.iat < admin_redis_sign.iat) {
                   const location =  await this.getLocation(this.ip);
                   // return this.fail(401, `当前账号已于${admin_redis_sign.loginTime}在${location}登录!`, [admin_redis_sign]);
                  // return this.fail(402, `当前账号已于${admin_redis_sign.loginTime}在其他浏览器登录!`, [admin_redis_sign]);
                }

                this.ctx.state.designer_info = designer_info;
                // console.log(designer_info);
            } else {
                console.log(this.ctx.state.userInfo);
            }
        } catch (e) {
            return this.fail(1001, e);
        }
    }
    __call() {
        return this.fail(404, 'design_controller');
    }
}
