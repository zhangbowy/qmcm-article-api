import Base from './base.js';
import {think} from "thinkjs";
import {ancestorWhere} from "tslint";
const path = require('path');
export default class extends Base {
    /**
     * 微信登录
     */
    async loginAction(): Promise<void> {
        const appid = this.config('wx').appid;
        const redirectUrl = "http://cxapi.tecqm.club/wx/user/auth";
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
        return this.success(url);
    }
    async authAction() {
        let code:string = this.get('code');
        if(!code) {
            return this.fail(-1., 'code不能为空')
        };
        const appid = this.config('wx').appid;
        const secret = this.config('wx').appSecret;
        /**
         * 通过code换取 access_token
         */
        let url =  `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

        const res = await this.fetch(url).then(res => res.json());
        if (res && res.errcode) {
           return  this.success(res)
        }
        let openId = res.openid;
        /**
         * 判断是否新用户
         */
         let info = await this.model('user').where({openid:openId}).find();
         let userInfo
        if (Object.keys(info).length > 0) {
            let params: object = {
                nickname:res.nickname,
                sex:res.sex,
                province:res.province,
                city:res.city,
                country:res.country,
                headimgurl:res.headimgurl,
                openid:res.openid,
                id:res.id
            }
            userInfo = params
        } else {
            /**
             * 拉取用户信息
             */
            let access_token = res.access_token;
            let getInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
             userInfo = await this.fetch(getInfoUrl).then(res => res.json());
            let params: object = {
                nickname:userInfo.nickname,
                sex:userInfo.sex,
                province:userInfo.province,
                city:userInfo.city,
                country:userInfo.country,
                headimgurl:userInfo.headimgurl,
                openid:userInfo.openid
            }
            await this.model('user').add(params);
            console.log(userInfo);
        }
        let tokenFuc =  think.service('wx/token');
        let token = await tokenFuc.create1(userInfo);
        await this.cookie('token', token,{
            maxAge:1000*1000*1000*1000,
            expires:new Date().getTime() + 1000*1000*1000*1000
        });
        // this.success([],'登录成功')!
        this.redirect('http://cixiu.makebugs.cn/index.html')
        // this.redirect('http://192.168.31.181:8080/')
    }
    infoAction() {
        return  this.success(this.ctx.state.userInfo)
    }
    checkLoginAction() {
        return  this.success('已登录')
    }

    /**
     *
     */
    async loginDevAction() {
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuaWQiOiJvSVBoYjBhOTh5d3lURHRjT0xwT2hTcExLS1NRIiwibmlja25hbWUiOiJXYXkgQmFjayBIb21lIiwic2V4IjoxLCJsYW5ndWFnZSI6InpoX0NOIiwiY2l0eSI6IuiKnOa5liIsInByb3ZpbmNlIjoi5a6J5b69IiwiY291bnRyeSI6IuS4reWbvSIsImhlYWRpbWd1cmwiOiJodHRwOi8vdGhpcmR3eC5xbG9nby5jbi9tbW9wZW4vdmlfMzIvUTBqNFR3R1RmVExKeGliUHVSaWI1eEFLMlZTQ2cwaWN6YUE4UTJkUGZXWmljdmprUDMzYThXc2FUQ1BaU3VVUXZkdWNpYlNpYlRNMTJBNEZNcmxOdmNpYTN5aWFGQS8xMzIiLCJwcml2aWxlZ2UiOltdLCJpYXQiOjE1ODc3MTE4NzR9.iCGvRAiXAyfn8jo80YciE25qx4SWSkGTTeIi1_l3bs0"
        await this.cookie('token', token,{
            maxAge:1000*1000*1000*1000,
            expires:new Date().getTime() + 1000*1000*1000*1000
        });

        return  this.success('登录成功!')
    }
}
