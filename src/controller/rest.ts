import {think} from 'thinkjs';
const rp = require('request-promise')
const fs = require("fs");
export default class extends think.Controller {

    async __before() {
        this.header('development', 'http://www.wkdao.com');
    }

    test1Action() {
        this.download('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/demo/1/1/1/1.png');
    }

    /**
     * 抛出错误
     */
    // @ts-ignore
    dealErr($err) {
        let $errMsg;
        const $data: any = {};
        if ($err.sql) {
            $errMsg = $err.sqlMessage || $err.message;
            $data.code = $err.code;
            $data.errno = $err.errno;
            $data.sqlMessage = $err.sqlMessage;
            $data.sqlState = $err.sqlState;
            $data.index = $err.index;
            $data.sql = $err.sql;
            $data.stack = $err.stack;
            $data.message = $err.message;
        } else {
            if ($err.stack && $err.message) {
                $errMsg = $err.message;
                $data.stack = $err.stack;
            }
        }
        return this.fail(-1, $errMsg, $data);
    }

    deleteFolder(path: any) {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            // tslint:disable-next-line:only-arrow-functions
            const _this = this;
            files.forEach(function(file: any, index: any) {
                const curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) {
                    _this.deleteFolder(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            // fs.rmdirSync(path);
        }
    }
    async getLocation($ip: any) {
        const ip1 = think.env == 'development' ? '220.184.204.246' : $ip.replace(/::ffff:/g, '');

        const options = {
            method: 'GET',
            url: 'https://restapi.amap.com/v3/ip',
            qs: {
                key: '310d88b1f76599ee6a4b0bd50ba6bbd8',
                ip: ip1,
            }
        };
        const $data = JSON.parse(await rp(options));
        let ipInfo;
        if (typeof $data.province == 'string') {
            ipInfo = `(${$data.province}-${$data.city})`;
        } else {
            ipInfo = $ip;
        }

        return ipInfo;
    }
     accMul(arg1: any, arg2: any) {
         // tslint:disable-next-line:prefer-const one-variable-per-declaration
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString();
        try {m += s1.split(".")[1].length; } catch (e) {}
        try {m += s2.split(".")[1].length; } catch (e) {}
        console.log((Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)).toFixed(2));
        return (Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m))
    }
    /**
     * 递归分类列表
     */
    getTree(data: any, root: any, $id?: any, $pid?: any, $pushTxt?: any) {
        const idTxt: any = $id || 'id';
        const pidTxt: any = $pid || 'pid';
        const pushTxt: any = $pushTxt || 'children';

        // 递归方法
        function getNode(id: any) {
            const node = [];
            const ids = [];
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < data.length; i++) {
                if (data[i][pidTxt] == id) {
                    data[i][pushTxt] = getNode(data[i][idTxt]);
                    node.push(data[i]);
                }
            }
            if (node.length == 0) {
                return;
            } else {
                return node;
            }
        }

        return getNode(root);
    }

    /**
     * 獲取遠程圖片內容
     * @param $this
     * @param $filePath url
     * @param $buffer  output tpye of 1 buffer 0 base64
     */
    async getBuffer($this: any, $filePath: any, $buffer?: boolean) {

        const {Writable} = require('stream');
        // const res = await $this.fetch('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/gallary/15/2020-04-22/6ca6e51d-028a-43d7-89a2-3537ccfe1adf.png');
        const res = await this.fetch($filePath);
        const chunks: any = [];
        let size = 0;
        return new Promise((resolve, reject) => {
            /**
             * 创建可写流
             */
            const outStream = new Writable({
                write(chunk: Buffer, encoding: string, callback: any) {
                    chunks.push(chunk);
                    console.log(chunk);
                    size += chunk.length;
                    callback();
                },
                final() {
                    /**
                     * 拼接Buffer
                     */
                    const newBuffer = Buffer.concat(chunks, size);
                    // @ts-ignore
                    const img = 'data:image/png;base64,' + Buffer.from(newBuffer, 'utf8').toString('base64');
                    if ($buffer) {
                        resolve(newBuffer);
                    } else {
                        resolve(img);
                    }
                }
            });
            res.body.pipe(outStream);
        });
    }

    __call() {
    return this.fail(404, 'init_controller');
    }
}
