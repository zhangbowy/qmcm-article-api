import {ancestorWhere} from "tslint";
const crypto = require('crypto');
import { think } from 'thinkjs';
module.exports = class extends think.Service {
   constructor() {
       super();
   }

   async getAccessToken($config: any, $noCache: boolean) {
        // @ts-ignore
       const token = await think.cache(`${$config.appid}-accessToken`, undefined, 'redis');
       if (!think.isEmpty(token) && !$noCache) {
            return  token;
        } else {
            const appid = $config.appid;
            const secret1 = $config.appsecret;
            // tslint:disable-next-line:no-shadowed-variable
            const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret1}`;
            const res  = await this.fetch(url).then(($res) => $res.json());
            if (res.access_token) {
                await think.cache(`${$config.appid}-accessToken`, res.access_token, {
                    type: 'redis',
                    redis: {
                        // timeout: 24 * 60 * 60 * 1000
                        timeout:  60 * 60 * 999 * 2
                    }
                });
                return res.access_token;
            } else {
                return res;
            }
        }
   }

   async getTicket($config: any, $noCache: boolean) {
       // @ts-ignore
       const ticket = await think.cache(`${$config.appid}-ticket`,undefined, 'redis');
       if (!think.isEmpty(ticket) && !$noCache) {
           return  ticket;
       } else {
           const token = await this.getAccessToken($config, $noCache);
           if (think.isObject(token)) {
               return token;
           }
           const appid = $config.appid;
           const secret1 = $config.appsecret;
           // tslint:disable-next-line:no-shadowed-variable
           const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
           const res  = await this.fetch(url).then(($res) => $res.json());
           if (res.errcode == 0 && res.ticket) {
               await think.cache(`${$config.appid}-ticket`, res.ticket, {
                   type: 'redis',
                   redis: {
                       // timeout: 24 * 60 * 60 * 1000
                       timeout:  60 * 60 * 999 * 2
                   }
               });
               return res.ticket;
           } else {
                return res;
           }
       }
   }

   async getJsSign($url: string, $config: any, $noCache?: boolean) {
       // tslint:disable-next-line:one-variable-per-declaration
       const ticket = await this.getTicket($config, $noCache);
       if (think.isObject(ticket) ) {
           // @ts-ignore
           return {code: ticket.errcode, msg: ticket.errmsg, data: []};
       }
       // tslint:disable-next-line:one-variable-per-declaration
       const noncestr = 'U9QPiKjfVtt1',
             appid = $config.appid,
             appsecret = $config.appsecret,
             timestamp = Math.floor(Date.now() / 1000);
       const signature = await this.getSha1('jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + $url + '/');
       return {
           code: 0,
           msg: 'jssdk签名',
           data: {
               appid,
               // appsecret,
               noncestr,
               timestamp,
               signature
           }
       };
   }

   async getSha1(str: string) {
   // tslint:disable-next-line:prefer-const
       let md5sum = crypto.createHash('sha1');
       md5sum.update(str, 'utf8');
       str = md5sum.digest('hex');
       return str;
   }
};
