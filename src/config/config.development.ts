// development config, it will load in production enviroment
export = {
  workers: 0,
  db: { //开发模式下数据库配置
    type: 'mysql',
    adapter: {
      mysql: {
        host: '192.168.31.4',
        port: '3306',
        database: 'yuncixiu_v3', //数据库名称
        user: 'cx03', //账号
        password: 'yuncixiu03', //密码
        // prefix: 'think_', //数据表前缀
        encoding: 'utf8', //数据库编码
      }
    }
  },
  cache: { //开发模式下配置
    type: 'redis',
    adapter: {
      redis: {
        host: '192.168.31.3',
        port: '6379',
        password: '',
        timeout: 0,
        log_connect: true
      }
    }
  }
};
