const Base = require('./base.js');
const DEFULT_AUTO_REPLY = '功能正在开发中~';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        // 验证开发者服务器

        // GET请求携带参数是个参数signature,timestamp,nonce,echostr
        const {signature, timestamp, nonce, echostr} = this.get();

        // 服务器的token
        const token = "aaacc";

        // 将token、timestamp、nonce三个参数进行字典序排序
        const arrSort = [token, timestamp, nonce];
        arrSort.sort();

        // 将三个参数字符串拼接成一个字符串进行sha1加密,npm install --save sha1
        const str = arrSort.join("");
        const shaStr = this.getSha1(str);

        // 获得加密后的字符串可与signature对比，验证标识该请求来源于微信服务器
        if (shaStr === signature) {
            // 确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效
            return this.ctx.body = echostr;
        } else {
            return this.ctx.body = 'no';
        }
        // const echostr = this.get('echostr');
    }
    async getSha1(str: string) {
        // tslint:disable-next-line:prefer-const
        let md5sum = require('crypto').createHash('sha1');
        md5sum.update(str, 'utf8');
        str = md5sum.digest('hex');
        return str;
    }
    textAction() {
        // 发送文本消息
     const {Content} = this.post();
     this.success('你发送给我的是:' + Content.trim());
    }
    // async textAction(){
    //     const {Content} = this.post();
    //     const music = await myService.search(Content.trim());
    //
    //     if(music){
    //         const {title, description, url} = music;
    //         this.success({
    //             type: 'music',
    //             content: {
    //                 title,
    //                 description,
    //                 musicUrl: url,
    //                 hqMusicUrl: url,
    //                 thumbMediaId: "thisThumbMediaId"
    //             }
    //         });
    //     } else {
    //         this.fail('你所找的歌曲不存在');
    //     }
    // }
    eventAction() {
        const message = this.post();

        this.success(JSON.stringify(message));
    }
    __call() {
        this.success(DEFULT_AUTO_REPLY);
    }
}
