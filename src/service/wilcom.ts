import { think } from 'thinkjs';
const path = require('path');
var COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
var rp = require('request-promise');
import func from './../utils/func';
module.exports = class extends think.Service {
    constructor() {
        super();

    }

    /**
     * 根据图片获取刺绣预览图
     * @$image 图片base64字符串
     */
     async getEmbByImg($image: string,$width: any, $height: any) {
        const appId = think.config('wilcom').appId;
        const appKey =  think.config('wilcom').appKey;

        const width = $width|| 100;
        const height = $height || 100;
        const base64Image = $image;
        let options = {
            method: 'POST',
            uri: 'http://ewa.wilcom.com/2.0/api/bitmapartdesign',
            // uri: 'http://ewa.wilcom.com/2.0/api/vectorArtDesign',
            body: {
                appId: appId,
                appKey: appKey,
                requestXml: `<xml>
                  <bitmap 
                    file="pic.png" 
                    remove_background="true"
                  />
<!--                    <vector-->
<!--                     file="pic.pdf"-->
<!--                     dpi="300"-->
<!--                     remove_background="true"-->
<!--                    />-->
                  <autodigitize_options 
                     width = "${width}"
                     height= "${height}"
                  />
                  <output
                     trueview_file="final_design_trueview.png" 
                     design_file="final_design.emb" 
                     dpi ="270" 
                  />
                  <files>
                   <file 
                     filename="pic.png" 
                     filecontents="${base64Image}"
                   />
                  </files>
                </xml>`
            },
            json: true
        };

        const result = await rp(options);

        var embData = func.getFilecontentsEMB(result);
        var pngData = func.getFilecontentsPNG(result);
        if (!embData) {
            throw '获取design错误'
        }
        return pngData
        // req.embDataBuffer = embData;//存储生成的 emb data
        // req.pngData = pngData; //存储生成的 png data
        //console.log('图片--》design api返回成功')
        //console.log('embData==>',embData);

    }

}