import 'thinkjs3-ts';
import path from 'path';
const mysql = require('think-model-mysql');
import { think } from "thinkjs";
const isDev = think.env === "development";
/**
 * 开发环境数据库配置
 */
exports.model = {
    type: 'mysql',
    common: {
        logConnect: true,
        logSql: true,
        logger: (msg: string) => think.logger.info(msg)
    },
    mysql: {
        handle: mysql,
        database: 'yuncixiu_v3', //数据库名
        prefix: '',//表前缀
        encoding: 'utf8',
        host: '192.168.31.4',//host
        port: 3306,//端口
        user: 'cx03',//用户名
        password: 'yuncixiu03',//密码
        dateStrings: true,
        acquireWaitTimeout: 3000
    }
};
