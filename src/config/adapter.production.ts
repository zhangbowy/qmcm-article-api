import 'thinkjs3-ts';
import path from 'path';
const mysql = require('think-model-mysql');
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
        database: '',
        prefix: '',
        encoding: '',
        host: '',
        port: 3306,
        user: '',
        password: '',
        dateStrings: true,
        acquireWaitTimeout: 0
    }
};
