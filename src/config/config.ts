// default config
export = {
  workers:2,
  port: 8001,
  errnoField: 'code', // errno字段
  errmsgField: 'msg', // errmsg字段
  defaultErrno: 0, // errcode字段
  validateDefaultErrno: -1,
  wx:{
    appid:'wx8d8e2dd3ce250894',
    appSecret:'767be27192a424108a8c6907bdaf1549',
  },
  express: {
    appid: '1365636', // 对应快递鸟用户后台 用户ID EBusinessID
    appkey: 'f4292d9e-5328-42c5-8395-517a9f9f32e8', //AppKey
    request_url: 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx' //快递鸟实时物流接口
  }
};
