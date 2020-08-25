import Base from './base.js';
import {think} from "thinkjs";
const sharp = require('sharp');
const Color = require('color');
const path = require('path');
const fs = require('fs');
export default class extends Base {
    /**
     * 定制信息
     * @param {id} 商品id
     * @param {sku_id}
     * @return {定制模板信息, 商品信息}
     */
    async customInfoAction() {
        try {
            const id = this.get('id');
            const sku_id = this.get('sku_id') || 0;
            const result: any = {};
            const item = await this.model('item').where({id}).find();
            const design_area_info = await this.model('custom_category').where({custom_category_id: item.custom_category_id}).find();
            if (think.isEmpty(design_area_info)) {
                return this.fail(-1, '定制模板不存在');
            }
            result.custom_info = {
                design_width: design_area_info.design_width,
                design_height: design_area_info.design_height,
                design_top: design_area_info.design_top,
                design_left: design_area_info.design_left,
                design_bg: design_area_info.design_bg,
                design_bg_width: design_area_info.design_bg_width,
                design_bg_height: design_area_info.design_bg_height,
            };
            /**
             * 没有sku的商品
             */
            if (sku_id == 0) {
                result.item = {
                    item_id: id,
                    name: item.name,
                    background: item.thumb_image_path,
                    sku_id: 0,
                };
            } else {
                const sku_list = JSON.parse(item.sku_list);
                for (const sku_v of sku_list) {
                    if (sku_v.sku_id == sku_id) {
                        result.item = {
                            item_id: id,
                            name: item.name,
                            background: sku_v.images,
                            sku_id: sku_v.sku_id,
                        };
                    }
                }
            }
            return this.success(result, '定制页,定制信息!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

     /**
      * 获取字体图片
      * @param {font_id} 字体id
      * @param {font_list} 字体列表 后台有的字体
      */
    async getFontAction() {
        try {
            const font_id = this.get('font_id');
            const color = this.get('color') || '#4bff00';
            const colors = Color(color);
            const color1 = colors.object();
            const font_list = JSON.parse(this.get('font_list')) || ['a', 'b', 'c'];
            const res = await this.model('fonts').where({font_id}).find();
            if (think.isEmpty(res)) {
                return this.fail(-1, '字体不存在');
            }
            const result = [];
            const fontContent = JSON.parse(res.font_content);
            for (const v of font_list) {
                let data1;
                if (!fontContent[v]) {
                    return this.fail(-1, `${v}的字体不存在`);
                }
                const fonC = await this.cache(`fonts-${font_id}-${v}`);
                if (think.isEmpty(fonC)) {
                    data1 = await this.getBuffer(this, fontContent[v], true);
                    await this.cache(`fonts-${font_id}-${v}`, data1);
                } else {
                    data1 = Buffer.from(fonC);
                }
                // let baseData = data1.replace(/data:image\/png;base64,/g,'');
                // let data = Buffer.from(baseData, 'base64');
                const colorData = await sharp(data1).tint(color1).png().toBuffer();
                const fonC1 = 'data:image/png;base64,' + Buffer.from(colorData, 'utf8').toString('base64');
                result.push(fonC1);
            }
            return this.success(result, '获取字体!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 获取花样
     * @tip 当前状态type为3的花样
     */
    async getDesignAction() {
        try {
            const page: number = this.get('currentPage') || 1;
            const limit: number = this.get('pageSize') || 10;
            const design_category_id: string = this.get('design_category_id') || 0;
            const shop_id = this.ctx.state.shop_id;
            const where: any = {
                status: 3,
                del: 0,
                shop_id
            };
            if (design_category_id) {
                where.design_category_id = design_category_id;
            }
            const res = await this.model('design').field('design_id,designer_id,designer_team_id,prev_png_path,price,design_name').page(page, limit).where(where).countSelect();
            return this.success(res, '花样列表!');
        } catch ($err) {
            this.dealErr($err);
        }
    }

    /**
     * 修改圖片顏色
     * @param {color} 顏色
     * @param {image} 圖片數組
     */
    async reColorAction() {
        try {
            const color33 = this.post('color') || '#4bff00';
            // tslint:disable-next-line:max-line-length
            // let urlList: any = ['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']
            const imageList = this.post('image');
            if (!think.isArray(imageList)) {
                return this.fail(-1, '图片数组格式不正确!');
            }
            if ( imageList.length == 0) {
                return this.fail(-1, '图片数组不能为空!');
            }
            const color = Color(color33);
            // var color = Color(color1).alpha(0.5).lighten(0.5);
            // let color2 = color.hsl().string()
            // let imageData = await this.fetch(image).then(res => res.blob());
            // console.log(color.cmyk().round().array());  // [ 16, 25, 0, 8, 0.5 ]
            const imageObj = [];
            const filePath = path.join(think.ROOT_PATH, 'www/1.png');
            // stream
            let i = 0;
            for (const urlItem of imageList) {
                // tslint:disable-next-line:no-shadowed-variable
                for (const urlItem of imageList) {
                    // const res = await this.fetch(urlItem);
                    // const dest = fs.createWriteStream(filePath);
                    // await res.body.pipe(dest).on('finish',async () =>{
                    //     let data = res.body._readableState.buffer
                    const baseData = urlItem.replace(/data:image\/png;base64,/g, '');
                    const data = Buffer.from(baseData, 'base64');
                    const color1 = color.object();
                    // let color1 = color.ansi256().object()
                    // let data  = await fs.readFileSync(filePath)
                    const data1 = await sharp(data).tint(color1).png().toBuffer();
                    // let data1  = await sharp(data).metadata();
                    const img = 'data:image/png;base64,' + Buffer.from(data1, 'utf8').toString('base64');
                    imageObj.push(img);
                    ++i;
                    // });
                }
                return this.success(imageObj);
            }
        } catch (e) {
            this.dealErr(e);
        }

     }

    async getPreviewAction() {
        try {

            const id = this.post('id') || 88;
            const type = this.post('type') || 2;

            const design_id = this.post('design_id');
            const custom_image = this.post('custom_image');
            const design_image = this.post('design_image') || '';
            const custom_template_id = this.post('custom_template_id');
            if (type == 2) {
                if (think.isEmpty(design_id) &&  think.isEmpty(custom_image)) {
                    // return this.fail(-1, '花样或图片不能为空!')
                }
                if (design_image.indexOf('base64') === -1) {
                    return this.fail(-1, 'design_image不是有效的base64');
                }
            }
            const top_scale = this.post('top_scale') || 0.21;
            const top_font_scale = this.post('top_font_scale') || 0.8;
            const top_font_content = this.post('top_font_content') || [1, 2, 3];
            const top_font_color = this.post('top_font_color') || '#e33e33';
            const middle_scale = this.post('middle_scale') || 0.58;
            const bottom_scale = this.post('bottom_scale') || 0.21;
            const bottom_font_scale = this.post('bottom_font_scale') || 0.8;
            const bottom_font_content = this.post('bottom_font_content') || [1, 2, 3, 4, 5, 6];
            const bottom_font_color = this.post('bottom_font_color') || '#06c7f1';

            /**
             * 手绘区域宽高比例
             */
            const draw_height_scale = this.post('draw_height_scale') || 1;
            const draw_left_scale = this.post('draw_left_scale') || 0;
            const draw_top_scale = this.post('draw_top_scale') || 0;
            const draw_image = this.post('draw_image') || '';

            const result: any = {};
            const item = await this.model('item').where({id}).find();
            const design_area_info = await this.model('custom_category').where({custom_category_id: item.custom_category_id}).find();
            if (think.isEmpty(design_area_info)) {
                return this.fail(-1, '定制模板不存在');
            }

            /**
             * 后台设置的设计区域信息
             */
            const design_width =  design_area_info.design_width;
            const design_height =  design_area_info.design_height;
            const design_top =  design_area_info.design_top;
            const design_left =  design_area_info.design_left;
            const design_bg =  design_area_info.design_bg;
            const design_bg_width =  design_area_info.design_bg_width;
            const design_bg_height =  design_area_info.design_bg_height;
            // const preview_bg_url = design_bg;
            // 取sku的图 没有的话就传null
            const preview_bg_url = this.post('background') || design_bg;
            const preview_bg_buffer = await this.getBuffer(this, preview_bg_url, true);
            /**
             * 背景图元信息
             */
            const bgMata  = await sharp(preview_bg_buffer).metadata();
            const preview_bg_width = bgMata.width;
            const preview_bg_height = bgMata.height;
            /**
             * 设计区域的和背景图的比例
             */
            const scale = preview_bg_width / design_bg_width;
            const area_left =  Math.floor(design_left * scale);
            const area_top = Math.floor(design_top * scale);
            const area_width = Math.floor(design_width * scale);
            const area_height = Math.floor(design_height * scale);
            const area_width_mm =  Math.floor(area_width / 120 * 25.4);
            const area_height_mm = Math.floor(area_height / 120 * 25.4);

            let composite: any = [];
            let designBuffer;
            /**
             * type == 2 一般定制
             */
            if (type == 2) {
                /**
                 * 一般设计 花样 上传图片 区域大小
                 */

                    /**
                     * rezize 改变大小到标准尺寸下的大小
                     */
                        const baseData = design_image.replace(/data:image\/png;base64,/g, '');

                        const a = Buffer.from(baseData, 'base64');

                        designBuffer = await sharp(a).resize({ width: area_width}).toBuffer() ;
                    // const design_preview_meta  = await sharp(design_preview_buffer).metadata();
                    // middle_design_width = design_preview_meta.width;
                        composite = [
                    { input: designBuffer, left: 0, top: 0},
                ];
                } else {

                }

            let is_wilcom = 0;
            /**
             * type == 4 手绘订单
             */
            if (type == 4) {
                /**
                 * 绘制的高度
                 */
                const drawArea_height = Math.floor(area_height * draw_height_scale);
                const drawArea_width = Math.floor(area_width * draw_height_scale);
                const drawArea_left = Math.floor(area_width * draw_left_scale);
                const drawArea_top = Math.floor(area_height * draw_top_scale);
                const baseData = draw_image.replace(/data:image\/png;base64,/g, '');
                let drawBuffer;
                const setting = await this.model('setting').where({key: 'is_request_wilcom', value: 1}).find();
                if (!think.isEmpty(setting)) {
                    is_wilcom = 1;
                    const wilcom = think.service('wilcom');
                    const embPng =  await wilcom.getEmbByImg(baseData, 100, 100);
                    drawBuffer = Buffer.from(embPng, 'base64');
                } else {
                    drawBuffer = Buffer.from(baseData, 'base64');
                }
                // const drawAreaBuffer = await sharp(drawBuffer).resize({height: drawArea_height}).webp().toBuffer() ;
                const drawAreaBuffer = await sharp(drawBuffer).resize({height: drawArea_height}).toBuffer() ;
                designBuffer = await sharp(drawBuffer).resize({height: drawArea_height}).toBuffer() ;
                const drawAreaBuffer_meta  = await sharp(drawAreaBuffer).metadata();
                const drawAreaBuffer_width = drawAreaBuffer_meta.width;
                const drawAreaBuffer_height = drawAreaBuffer_meta.height;
                // area_width =(drawAreaBuffer_width>area_width?drawAreaBuffer_width:area_width);
                // area_height =(drawAreaBuffer_height>area_height?drawAreaBuffer_height:area_height);
                // const drawAreaBuffer_top = Math.floor((area_height- drawAreaBuffer_height) / 2);
                // const drawAreaBuffer_left = Math.floor((area_width - drawAreaBuffer_width ) / 2);
                /**
                 * 合成的图 手绘图
                 */
                composite = [
                    { input: drawAreaBuffer, left: drawArea_left, top: drawArea_top},
                ];
                /**
                 * 设计区的内容
                 */
                designBuffer = await sharp({
                    create: {
                        width: drawAreaBuffer_width > area_width ? drawAreaBuffer_width : area_width,
                        height: drawAreaBuffer_height > area_height ? drawAreaBuffer_height : area_height,
                        channels: 4,
                        background: { r: 255, g: 255, b: 255, alpha: 0}
                    }
                })
                    .composite(composite)
                    .png()
                    .toBuffer();
            }
            // /**
            //  * 设计区的内容
            //  */
            // const designAreaBuffer = await sharp({
            //     create: {
            //         width: area_width,
            //         height: area_height,
            //         channels: 4,
            //         background: { r: 255, g: 255, b: 255, alpha: 0}
            //     }
            // })
            //     .composite(composite)
            //     .png()
            //     .toBuffer();
            const data = await sharp(preview_bg_buffer).composite([{ input: designBuffer, left: area_left, top: area_top}]).toBuffer();
            // const data12 = Buffer.from(data, 'utf8');
            // let img = 'data:image/png;base64,' + Buffer.from(data, 'utf8').toString('base64');
            const oss = await think.service('oss');
            const fileName = `${think.uuid('v4')}.png`;
            const fileName2 = `${think.uuid('v4')}.png`;
            // const filepath = path.join(think.ROOT_PATH, `www/static/custom/preview/${fileName}.png`)
            // await think.mkdir(path.dirname(filepath));
            // fs.writeFileSync(filepath,)
            // this.ctx.type = 'image/png';
            const filePath: any = path.join(think.ROOT_PATH, `/www/static/preview/${fileName}`);
            const filePath2: any = path.join(think.ROOT_PATH, `/www/static/preview/${fileName2}`);
            const visitPath: any = `/static/preview/${fileName}`;
            const visitPath2: any = `/static/preview/${fileName2}`;
            //     this.ctx.body = data;
            await think.mkdir(path.dirname(filePath));
            await fs.writeFileSync(filePath, data);
            await fs.writeFileSync(filePath2, designBuffer);
            const img = 'data:image/png;base64,' + Buffer.from(data, 'utf8').toString('base64');
            // const res: any = await oss.upload(Buffer.from(data), filePath,true);
            const result1: any = {
                preview_image: `${think.config('domain')}${visitPath}`,
                design_area_image: `${think.config('domain')}${visitPath2}`,
                is_wilcom
            };
            return this.success(result1);
            // return this.success(img);
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 代理图片
     */
    async getImageAction() {
        try {

        } catch (e) {

        }
        const url = this.get('url');
        const data =  await this.getBuffer(this, url, false);
        // this.ctx.type = 'image/png';
        // this.ctx.body = data;
        return this.success(data, 'base64');
    }

    /**
     * 获取刺绣预览图
     */
    async getPreview1Action() {
        try {

            const id = this.post('id') || 88;
            const type = this.post('type') || 2;

            const design_id = this.post('design_id');
            const custom_image = this.post('custom_image');
            const custom_template_id = this.post('custom_template_id');
            if (type == 2) {
                if (think.isEmpty(design_id) &&  think.isEmpty(custom_image)) {
                    // return this.fail(-1, '花样或图片不能为空!')
                }
            }
            const top_scale = this.post('top_scale') || 0.21;
            const top_font_scale = this.post('top_font_scale') || 0.8;
            const top_font_content = this.post('top_font_content') || [1, 2, 3];
            const top_font_color = this.post('top_font_color') || '#e33e33';
            const middle_scale = this.post('middle_scale') || 0.58;
            const bottom_scale = this.post('bottom_scale') || 0.21;
            const bottom_font_scale = this.post('bottom_font_scale') || 0.8;
            const bottom_font_content = this.post('bottom_font_content') || [1, 2, 3, 4, 5, 6];
            const bottom_font_color = this.post('bottom_font_color') || '#06c7f1';

            /**
             * 手绘区域宽高比例
             */
            const draw_height_scale = this.post('draw_height_scale') || 1;
            const draw_left_scale = this.post('draw_left_scale') || 0;
            const draw_top_scale = this.post('draw_top_scale') || 0;
            const draw_image = this.post('draw_image') || '';

            const result: any = {};
            const item = await this.model('item').where({id}).find();
            const design_area_info = await this.model('custom_category').where({custom_category_id: item.custom_category_id}).find();
            if (think.isEmpty(design_area_info)) {
                return this.fail(-1, '定制模板不存在');
            }

            /**
             * 后台设置的设计区域信息
             */
            const design_width =  design_area_info.design_width;
            const design_height =  design_area_info.design_height;
            const design_top =  design_area_info.design_top;
            const design_left =  design_area_info.design_left;
            const design_bg =  design_area_info.design_bg;
            const design_bg_width =  design_area_info.design_bg_width;
            const design_bg_height =  design_area_info.design_bg_height;
            const preview_bg_url = design_bg;
            const preview_bg_buffer = await this.getBuffer(this, preview_bg_url, true);
            /**
             * 背景图元信息
             */
            const bgMata  = await sharp(preview_bg_buffer).metadata();
            const preview_bg_width = bgMata.width;
            const preview_bg_height = bgMata.height;
            /**
             * 设计区域的和背景图的比例
             */
            const scale = preview_bg_width / design_bg_width;
            const area_left =  Math.floor(design_left * scale);
            const area_top = Math.floor(design_top * scale);
            const area_width = Math.floor(design_width * scale);
            const area_height = Math.floor(design_height * scale);
            const area_width_mm =  Math.floor(area_width / 120 * 25.4);
            const area_height_mm = Math.floor(area_height / 120 * 25.4);

            let composite: any = [];
            /**
             * type == 2 一般定制
             */
            if (type == 2) {
                /**
                 * 一般设计 花样 上传图片 区域大小
                 */
                const top_height = Math.floor(area_height * top_scale);
                const top_font_height = Math.floor(top_height * top_font_scale);
                const middle_height = Math.floor(area_height * middle_scale);
                const bottom_height = Math.floor(area_height * bottom_scale);
                const bottom_font_height = Math.floor(bottom_height * bottom_font_scale);

                const design_data = await this.model('design').where({design_id}).find();

                let design_preview: any;
                let middle_design_width;
                let design_preview_buffer;
                if (custom_template_id != 1) {
                    /**
                     *  没有花样id 是自己上传的图片
                     */
                    if (think.isEmpty(design_data)) {
                        const baseData = custom_image.split(',')[1];
                        design_preview = Buffer.from(baseData, 'base64');
                    } else {
                        const design_datas = await this.model('design').where({design_id}).find();
                        /**
                         * 花样库花样buffer
                         */
                        design_preview = await this.getBuffer(this, design_datas.prev_png_path, true);
                    }

                    /**
                     * rezize 改变大小到标准尺寸下的大小
                     */
                    design_preview_buffer = await sharp(design_preview).resize({ height: middle_height}).toBuffer() ;
                    const design_preview_meta  = await sharp(design_preview_buffer).metadata();
                    middle_design_width = design_preview_meta.width;
                } else {

                }

                const topFontBuffer = await this.itemPreview(top_font_content, top_font_color, top_font_height, top_height, area_width);
                const bottomBuffer = await this.itemPreview(bottom_font_content, bottom_font_color, bottom_font_height, bottom_height, area_width);
                const font_top_left = Math.floor((area_width - topFontBuffer.font_area_width) / 2);
                const font_bottom_left = Math.floor((area_width - bottomBuffer.font_area_width) / 2);
                const middle_design_left = Math.floor((area_width - middle_design_width) / 2);

                const bottom_position_top =  top_height + middle_height;

                if (custom_template_id != 1) {
                    /**
                     * 合成的图 三部分 top 文字  middle 花样 bottom 文字
                     */
                    composite = [
                        { input: topFontBuffer.areaBuffer, left: font_top_left, top: 0},
                        { input: bottomBuffer.areaBuffer, left: font_bottom_left, top: bottom_position_top},
                        { input: design_preview_buffer, left: middle_design_left, top: top_height}
                    ];
                } else {
                    const top = Math.floor((area_height - top_height) / 2);
                    composite = [
                        { input: topFontBuffer.areaBuffer, left: font_top_left, top},
                        // { input: bottomBuffer.areaBuffer,left: font_bottom_left, top: bottom_position_top},
                        // { input: design_preview_buffer,left: middle_design_left, top: top_height}
                    ];
                }

            }

            /**
             * type == 4 手绘订单
             */
            if (type == 4) {
                /**
                 * 绘制的高度
                 */
                const drawArea_height = Math.floor(area_height * draw_height_scale);
                const drawArea_width = Math.floor(area_width * draw_height_scale);
                const drawArea_left = Math.floor(area_width * draw_left_scale);
                const drawArea_top = Math.floor(area_height * draw_top_scale);
                const baseData = draw_image.replace(/data:image\/png;base64,/g, '');
                let drawBuffer;
                const setting = await this.model('setting').where({key: 'is_request_wilcom', value: 1}).find();
                if (!think.isEmpty(setting)) {
                    const wilcom = think.service('wilcom');
                    const embPng =  await wilcom.getEmbByImg(baseData, 100, 100);
                    drawBuffer = Buffer.from(embPng, 'base64');
                } else {
                    drawBuffer = Buffer.from(baseData, 'base64');
                }
                // const drawAreaBuffer = await sharp(drawBuffer).resize({height: drawArea_height}).webp().toBuffer() ;
                const drawAreaBuffer = await sharp(drawBuffer).resize({height: drawArea_height}).toBuffer() ;
                const drawAreaBuffer_meta  = await sharp(drawAreaBuffer).metadata();
                const drawAreaBuffer_width = drawAreaBuffer_meta.width;
                const drawAreaBuffer_height = drawAreaBuffer_meta.height;
                // area_width =(drawAreaBuffer_width>area_width?drawAreaBuffer_width:area_width);
                // area_height =(drawAreaBuffer_height>area_height?drawAreaBuffer_height:area_height);
                // const drawAreaBuffer_top = Math.floor((area_height- drawAreaBuffer_height) / 2);
                // const drawAreaBuffer_left = Math.floor((area_width - drawAreaBuffer_width ) / 2);
                /**
                 * 合成的图 手绘图
                 */
                composite = [
                    { input: drawAreaBuffer, left: drawArea_left, top: drawArea_top},
                ];
            }
            /**
             * 设计区的内容
             */
            const designAreaBuffer = await sharp({
                create: {
                    width: area_width,
                    height: area_height,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 0}
                }
            })
            .composite(composite)
            .png()
            .toBuffer();
            const data = await sharp(preview_bg_buffer).composite([{ input: designAreaBuffer, left: area_left, top: area_top}]).toBuffer();
            // const data12 = Buffer.from(data, 'utf8');
            // let img = 'data:image/png;base64,' + Buffer.from(data, 'utf8').toString('base64');
            const oss = await think.service('oss');
            const fileName = `${think.uuid('v4')}.png`;
            const fileName2 = `${think.uuid('v4')}.png`;
            // const filepath = path.join(think.ROOT_PATH, `www/static/custom/preview/${fileName}.png`)
            // await think.mkdir(path.dirname(filepath));
            // fs.writeFileSync(filepath,)
            // this.ctx.type = 'image/png';
            const filePath: any = path.join(think.ROOT_PATH, `/www/static/preview/${fileName}`);
            const filePath2: any = path.join(think.ROOT_PATH, `/www/static/preview/${fileName2}`);
            const visitPath: any = `/static/preview/${fileName}`;
            const visitPath2: any = `/static/preview/${fileName2}`;
            //     this.ctx.body = data;
            await think.mkdir(path.dirname(filePath));
            await fs.writeFileSync(filePath, data);
            await fs.writeFileSync(filePath2, designAreaBuffer);
            const img = 'data:image/png;base64,' + Buffer.from(data, 'utf8').toString('base64');

            // const res: any = await oss.upload(Buffer.from(data), filePath,true);
            const result1: any = {
                preview_image: `${think.config('domain')}${visitPath}`,
                design_area_image: `${think.config('domain')}${visitPath2}`
            };
            return this.success(result1);
            // return this.success(img);
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     *  获取EMB模板
     *  @param {template_type} 模板類型
     */
    async getEmbTemplateAction() {
        try {
            const template_type = this.get('template_type') || 1;
            const res = await this.model('emb_template').setRelation(false).field('emb_template_id,template_name,template_type,cover_image,created_at,updated_at').where({template_type}).select();
            return this.success(res);
        } catch (e) {
            this.dealErr(e);
        }
    }

    /**
     * 获取刺绣模板的价格
     * @parm {emb_template_id} 模板id
     * @parm {template_type} 模板類型
     */
    async getEmbPriceAction() {
        try {
            const width = this.get('width');
            const height = this.get('height');
            const sqr = width * height;
            const emb_template_id = this.get('emb_template_id') || 1;
            const template_type = this.get('template_type') || 1;
            const priceList = await this.model('emb_template_price').where({emb_template_id}).select();
            const priceObj = {};
            for (const v of priceList) {
                if (!priceObj[v.width * v.height]) {
                    priceObj[v.width * v.height] = v.price;
                } else {
                    if (priceObj[v.width * v.height] < v.price) {
                        priceObj[v.width * v.height] = v.price;
                    }
                }
            }
            const areaList = Object.keys(priceObj);
            // @ts-ignore
            // tslint:disable-next-line:only-arrow-functions
            areaList.sort(function(a: number, b: number) {
                return a - b;
            });
            console.log(areaList);
            const index: any = getIndex(areaList, sqr);
            const  price = priceObj[areaList[index]] || 0;
            const result = {
                price,
                "area": sqr,
                'area=>price': priceObj,
                // priceList,
            };
            return this.success(result, '获取刺绣价格!');
        } catch (e) {
            this.dealErr(e);
        }
    }
    async itemPreview($fontList: any, $color: any, $fontHeight: any, $fontAreaHeight: any, areaWidth?: any) {
        try {
            const font_id = this.get('font_id');
            // const font_list =  ['a', 'a', 'a'];
            // const font_list = JSON.parse(this.get('font_list')) || ['a', 'b', 'c'];
            const font_list = $fontList;
            // let res = await this.model('fonts').where({font_id}).find();
            // if (think.isEmpty(res)) {
            //     return this.fail(-1, '字体不存在');
            // }
            const color = Color($color);
            const color1 = color.object();
            const result: any = [];
            const compositeList = [];
            let font_area_width = 0;
            let font_area_height = 0;
            let position_width = 0;
            // let fontContent = JSON.parse(res.font_content);
            if (font_list.length == 0) {
                font_area_width = areaWidth;
            } else {
                for (const v of font_list) {
                    // if (!fontContent[v]) {
                    //     return this.fail(-1, `${v}的字体不存在`);
                    // }
                    // let data = await getBuffer(this, fontContent[v], true);
                    const baseData = v.replace(/data:image\/png;base64,/g, '');
                    const data = Buffer.from(baseData, 'base64');
                    const initData =   await sharp(data).toBuffer();
                    const bgMata  = await sharp(initData).metadata();
                    // @ts-ignore
                    font_area_height =  font_area_height == 0 ? Math.floor(bgMata.height) : font_area_height;
                    // let height = bgMata.height
                    // font_area_height = Math.floor((bgMata.height > font_area_height?bgMata.height:font_area_height))
                    const data2 = await sharp(initData).resize({ height: $fontHeight}).tint(color1).toBuffer() ;
                    const bgMata2  = await sharp(data2).metadata();
                    font_area_width = Math.floor(bgMata2.width) + font_area_width;
                    const top = Math.ceil(($fontAreaHeight - $fontHeight) / 2);
                    const obj = { input: data2, left: position_width, top};
                    compositeList.push(obj);
                    result.push(data2);
                    position_width += Math.floor(bgMata2.width);
                }
            }

            const areaBuffer = await sharp({
                create: {
                    width: font_area_width,
                    height: $fontAreaHeight,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 0}
                }
            })
                .composite(compositeList)
                .png()
                .toBuffer();
            this.ctx.type = 'image/png';

            return  {font_area_width, areaBuffer};
        } catch (e) {
            this.dealErr(e);
        }
    }
    async previewAction() {
        const resPath = path.join(think.ROOT_PATH, 'www/1.png');
        const icoPath = path.join(think.ROOT_PATH, 'www/2.png');
        const res = await this.fetch('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/font/2020-04-21-10:55:55/1.PNG');
        const res1 = res.body.readableBuffer;
        const res2 = res.body._writableState.getBuffer();
        // const resPath1 = fs.createWriteStream(resPath);
        const _this = this;
        const data = await this.getBuffer(this, 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/font/2020-04-21-10:55:55/1.PNG');
        _this.ctx.type = 'image/png';
        _this.ctx.body = data;
        // await res.body.pipe(resPath1).on('finish',async () =>{
        //     const icoPath1 = fs.createWriteStream(icoPath);
        // const ico = await _this.fetch('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/font/2020-04-21-11:36:20/0.PNG');
        // await ico.body.pipe(icoPath1).on('finish',async () =>{
        //     let resdata = await fs.readFileSync(resPath)
        //     let icodata = await fs.readFileSync(icoPath)
        //     const data = await sharp(resdata).composite([{ input: icoPath,}]).toBuffer()
        //     _this.ctx.type = 'image/png';
        //     _this.ctx.body = res1.tail.data;
        // })
        // })
    }
    async downAction() {
        const ico = await this.getBuffer(this, 'http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/font/2020-04-21-11:36:20/0.PNG', true);
        await fs.writeFileSync('1.PNG', ico);
        this.download('1.PNG');
    }

    /**
     * 上传图片
     */
    async uploadImgAction() {
        const file = this.file('image');
        let currentPath;
        let resultPath;
        // tslint:disable-next-line:no-console
        console.log(file, 'file');
        if (!file || !file.type) {
            return  this.fail(-1, '图片不能为空', []);
        }
        currentPath = 'www/static/custom/prev/';
        resultPath = 'static/custom/prev/';
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            const fileName = think.uuid('v4');
            const gs = file.type.substring(6, file.type.length);
            const filepath = path.join(think.ROOT_PATH, currentPath + fileName + '.' + gs);
            await think.mkdir(path.dirname(filepath));
            const readStream = fs.createReadStream(file.path);
            const writeStream = fs.createWriteStream(filepath);
            readStream.pipe(writeStream);
            await readStream.on('end', function() {
                fs.unlinkSync((this.files as any).upload.path);
            });
            return this.success({url: resultPath + fileName + '.' + gs}, "上传成功!");
        } else {
            this.fail(-1, '请上传png或jpg格式的图片', []);
        }
    }

    /**
     * 去除背景/底色
     */
    async removeBgAction() {
        try {
            const file = this.file("image");
            const data = await sharp(file.path).ensureAlpha().flatten({background: {r: 0,
                b: 0,
                g: 0,
                    alpha: 1}}).png().toBuffer();
            const res = await replaceColor(file.path);
            this.ctx.type = 'image/png';
            this.ctx.body = res;

        } catch (e) {
            this.dealErr(e);
        }
    }
}

function replaceColor($path: string) {
    // tslint:disable-next-line:no-shadowed-variable
    const replaceColor = require('replace-color');
    return new Promise(async (res, rej) => {
        replaceColor({
            image: $path,
            colors: {
                type: 'hex',
                targetColor: '#FFFFFF',
                replaceColor: '#00FFFFFF'
            },
            deltaE: 10
        }).then(async (jimpObject: any) => {
                const data =  await jimpObject.getBufferAsync('image/png');
                res(data);
            })
            .catch((err: any) => {
                console.log(err);
            });
    });
}
function getIndex(arr: any, num: number) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > num) {
            if (i == 0) {
                return i;
            }
            return i - 1;
        }
    }
    // if (num < arr[0]) {
    //     return 0
    // } else {
    return arr.length - 1;
    // }

}
