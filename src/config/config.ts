// default config
import { think } from "thinkjs";
export = {
  workers: 1,
  port: 8001,
  errnoField: 'code',
  errmsgField: 'msg',
  defaultErrno: 0,
  validateDefaultErrno: -1,
  domain: think.env == 'development' ? 'http://192.168.31.180:8001' : 'http://cxapi.tecqm.club',
  tencentCos: { // 腾讯cos对象储存账号
    SecretId: 'AKIDoOilY6VL2g4wYxI3kCahxJSM0NinJAJB',
    SecretKey: 'wgAcpmSEkzyh5C2fEXZKo9D1b9VaPyTz',
    bucket: 'cos-cx-n1-1257124629',
    region: 'ap-guangzhou'
  },
  wx: { // 微信公众号的appid和密钥
    appid: 'wx8d8e2dd3ce250894',
    appSecret: '767be27192a424108a8c6907bdaf1549',
    payId: 1591304471,
  },
  express: { // 快递鸟
    appid: '1647388', // 对应快递鸟用户后台 用户ID EBusinessID
    appkey: '32729fb8-d85d-4619-b83d-fce7e6baf634', // AppKey
    request_url: 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx' // 快递鸟实时物流接口
  },
  wilcom: { // 澳洲接口账号密钥
     appId: 'ba4d7ce4',
     appKey: 'e9fbfcc2397822784eb02f18676585db'
  },
  stickyCluster: true,
};
