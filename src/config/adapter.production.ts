import 'thinkjs3-ts';
import path from 'path';
const mysql = require('think-model-mysql');
const redisCache = require('think-cache-redis');
import { think } from "thinkjs";
/**
 * 正式环境数据库配置
 */
exports.model = {
    type: 'mysql',
    common: {
        logConnect: false,
        logSql: false,
        logger: (msg: string) => think.logger.info(msg)
    },
    mysql: {
        handle: mysql,
        database: 'yuncixiu_v3', //数据库名
        prefix: '',//表前缀
        encoding: 'utf8',
        // host: '129.211.65.201',//host
        host: '192.168.31.4',//host
        port: 3306,//端口
        // user: 'root',//用户名
        user: 'cx03',//用户名
        password: 'yuncixiu03',//密码
        dateStrings: true,
        // acquireWaitTimeout: 3000,
        debounce: false,
        connectionLimit:10,
        charset: 'utf8mb4'
    }
};
exports.cache = {
    type: 'redis',
    common: {
        timeout: 24 * 3600 * 1000 // millisecond
    },
    redis: {
        handle: redisCache,
        host: '192.168.31.3',
        port: '6379',
        password: '',
        log_connect: true
    }
}
