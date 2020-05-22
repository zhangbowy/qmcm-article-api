// default config
import { think } from "thinkjs";
export = {
  workers:4,
  port: 8001,
  errnoField: 'code',
  errmsgField: 'msg',
  defaultErrno: 0,
  validateDefaultErrno: -1,
  domain:think.env=='development'?'http://192.168.31.180:8001':'http://cxapi.tecqm.club',
  tencentCos:{ //腾讯cos对象储存账号
    SecretId: 'AKIDoOilY6VL2g4wYxI3kCahxJSM0NinJAJB',
    SecretKey: 'wgAcpmSEkzyh5C2fEXZKo9D1b9VaPyTz'
  },
  wx:{ //腾讯cos对象储存账号
    appid:'wx8d8e2dd3ce250894',
    appSecret:'767be27192a424108a8c6907bdaf1549',
  },
  express: { //快递鸟
    appid: '1365636', // 对应快递鸟用户后台 用户ID EBusinessID
    appkey: 'f4292d9e-5328-42c5-8395-517a9f9f32e8', //AppKey
    request_url: 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx' //快递鸟实时物流接口
  },
  wilcom:{ //澳洲接口账号密钥
     appId:'ba4d7ce4',
     appKey: 'e9fbfcc2397822784eb02f18676585db'
  },
  stickyCluster: true,
};
