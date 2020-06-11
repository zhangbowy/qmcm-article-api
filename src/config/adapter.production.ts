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
        database: 'yuncixiu', //数据库名
        prefix: '',//表前缀
        encoding: 'utf8',
        // host: '129.211.65.201',//host
        host: '127.0.0.1',//host
        port: 3306,//端口
        // user: 'root',//用户名
        user: 'yuncixiu',//用户名
        password: 'PCSXsX2HCJnfCYEb',//密码
        dateStrings: true,
        // acquireWaitTimeout: 3000,
        debounce: false,
        connectionLimit: 30,
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
        host: '127.0.0.1',
        port: '6379',
        password: '',
        log_connect: true
    }
}
