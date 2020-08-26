import Base from './base';
import {ancestorWhere} from "tslint";
import {think} from "thinkjs";
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const AdmZip = require('adm-zip');
export default class extends Base {
  indexAction() {
    // return this.display('');
    return this.redirect('http://www.wkdao.com', '走错路发现世界,走对路发现自己');
    const filepath = path.join(think.ROOT_PATH, 'view/index_index.html');
    return this.success([], "请求成功!");
  }

  /**
   *  下载资源接口
   *  @param {url} 资源链接
   *  @param {fileName} 文件名
   */
  async downLoadAction() {
    const file = this.get('url');
    const fileName = this.get('fileName');
    const fileBuffer = await this.getBuffer(this, file, true);
    await fs.writeFileSync('1.PNG', fileBuffer);
    // const extname = path.extname('1.PNG);

    this.download('1.PNG', fileName + '.png');
  }

  /**
   * 首页数据
   */
  async indexDataAction() {
    try {
      const shop_id = this.ctx.state.admin_info.shop_id;
      // let today_order_amount: any = await this.model('order').where('TO_DAYS(created_at) = TO_DAYS(now()) and `status` NOT IN (1,-2,5,6)').sum('pay_amount');
      const total_order_amount: any = await this.model('order').where(`shop_id=${shop_id} and ` + '`status` NOT IN (1,-2,5,6)').sum('pay_amount');
      // select date_format(时间字段,'%Y-%m-%d') days,count(*) from 表名 where date_format(时间字段,'%Y')='2019' group by days
      // @ts-ignore
      const order_count = await this.model('order').getOrderCount({shop_id});
      // @ts-ignore
      const order_amount = await this.model('order').getOrderFee({shop_id});
      // let getWeek = await this.model('order').getWeek();
      // let today: any = await this.model('order').where('TO_DAYS(created_at) = TO_DAYS(now()) and `status` NOT IN (1,-2,5,6)').field('created_at').select();
      // let yestoday_order_amount = await this.model('order').where('TO_DAYS(NOW( )) - TO_DAYS(created_at) = 1 and `status` NOT IN (1,-2,5,6)').sum('pay_amount') ;
      const user_count = await this.model('user').where(`shop_id=${shop_id}`).count('id');
      const gooods_count = await this.model('item').where(`shop_id=${shop_id} and ` + 'del=0').count('id');
      const design_count = await this.model('design').where({shop_id, del: 0}).count('design_id');
      // let yestoday = await this.model('order').where('TO_DAYS(NOW( )) - TO_DAYS(created_at) = 1 and `status` NOT IN (1,-2,5,6)').field('created_at').select() ;
      // let yestoday = SELECT * FROM 表名 WHERE TO_DAYS( NOW( ) ) – TO_DAYS( 时间字段名) <= 1
      // let orderTotal = await this.model('order').where('TO_DAYS(create_at) = TO_DAYS(date_sub(now(), interval '+day+' day)) ').field('COUNT(*) total').find();
      // SELECT SUM(score) AS think_sum FROM `test_d` LIMIT 1
      return this.success({
        total_order_amount,
        user_count,
        gooods_count,
        design_count,
        order_count,
        order_amount
      }, '首页数据!');
    } catch (e) {
      this.dealErr(e);
    }
  }

  async getOverview(day: any) {
    const sql = 'select sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval ' + day + ' day)) and od.status = 4 then oc.profit_p else 0 end) as profit_p_total,' +
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval ' + day + ' day)) and od.status = 4 then oc.profit_a else 0 end) as profit_a_total,' +
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval ' + day + ' day)) and od.status = 4 then oc.profit_m else 0 end) as profit_m_total,' +
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval ' + day + ' day)) and od.status = 4 then oc.profit_fu else 0 end) as profit_fu_total,' +
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval ' + day + ' day)) and od.status = 4 then oc.profit_su else 0 end) as profit_su_total ' +
        ' from ' +
        'erd_order_cents oc , erd_order od,erd_order_ope op ' +
        'where oc.order_id = od.id and op.order_id = od.id';
    const res = this.query(sql);
    return res;
  }

  /**
   * 下发多个DST
   * @heder {ops} 包含了签名、机器码 的串
   */
  async getDstAction() {
    try {
      if (this.header("ops")) {
        // @ts-ignore
        const received: string = this.header("ops");
        const arr_rec: any[] = received.split("@@");
        const r_tsp: string = arr_rec[2];
        const r_sign: string = arr_rec[3];

        const mechineId = arr_rec[1] || 1;
        const [sid, skey, mid] = ['own_one', 'nh7k9&u', mechineId];
        const data: string = sid + skey + r_tsp + mid;
        const sign: string = crypto.createHash('md5').update(data).digest("hex");
        console.log('sign:', sign);
        console.log('mechineId:', mechineId);
        const uid = this.post("id") || "uid";
        if (r_sign == sign) {
          // const machine_code = this.post('machine_code');
          // const orderInfo = await this.model('order').where({order_no: 20200617100743490543558}).find();
          const orderList = await this.model('order').where({logistics_type: 1, status: 11, machine_code: mechineId}).select();
          if (think.isEmpty(orderList)) {
            console.log('没找到')
            return this.fail(-1, '暂无数据!');
          }
          console.log(mechineId, 'machineId');
          const zip = new AdmZip();
          for (const orderInfo of orderList) {
            const order_id = orderInfo.id;
            const order_item = await this.model('order_item').where({ order_id }).find();
            console.log(order_item);
            const dst_Buffer: any = await this.getBuffer(this, order_item.design_dst_path, true);
            zip.addFile(`${orderInfo.id}.DST`, Buffer.alloc(dst_Buffer.length, dst_Buffer), "DST FILE");
            // 获取子级控制器实例，然后调用其方法
            // const txt_data = await designController.getDesignInfo(order_item.design_emb_path);
            let txt_data;
            if (!order_item.order_txt_file_path) {
              const designController = this.controller('designer/design');
              // @ts-ignore
              const res = await designController.getDesignInfo(order_item.design_emb_path);
              if ( typeof res == 'string') {
                return this.fail(-1, res);
              }
              txt_data = res.txt_str;
            } else {
              txt_data = await this.getBuffer(this, order_item.order_txt_file_path, true);
            }
            console.log(txt_data, 'txt_data');
            zip.addFile(`${orderInfo.id}.TXT`, Buffer.alloc(txt_data.length, txt_data), "TXT");
          }
          const zip_buffer = await zip.toBuffer();
          // const content_length = res.headers._headers['content-length'][0];
          this.ctx.set({
            'Content-Length': zip_buffer.length,
            'Content-Type': 'multipart/form-data',
            // "Content-Disposition": "attachment; filename=" + `下发${orderList.length}个订单于${think.datetime(new Date().getTime(), 'YYYY-MM-DD-HH:mm:ss')}.zip`,
            "Content-Disposition": "attachment; filename=" + `${orderList.length}个订单.zip`,
          });
          const PassThrough = require('stream').PassThrough;
          await this.model('order').where({logistics_type: 1, status: 11, machine_code: mechineId}).update({status: 2, _status: "下发完成, 等待发货中"});
          this.ctx.body = zip_buffer;
          // this.ctx.body = res.body.on('error',  this.ctx.onerror).pipe(PassThrough());
        } else {
          return this.fail(-1, '签名错误!');
        }
      } else {
        return this.fail(-1, '无效请求!');
      }
    } catch (e) {
      this.dealErr(e);
    }
  }

  /**
   * 获取DST
   */
  // async  getDstAction() {
  //   const zip = new AdmZip();
  //   const content = "zhangbo";
  //   zip.addFile("order_no.EMB", Buffer.alloc(content.length, content), "entry comment goes here");
  //   zip.addFile("order_no.DST", Buffer.alloc(content.length, content), "entry comment goes here");
  //   zip.addFile("order_no.TXT", Buffer.alloc(content.length, content), "entry comment goes here");
  //   // zip.addLocalFile("/home/me/some_picture.png");
  //   // get everything as a buffer
  //   const willSendthis = zip.toBuffer();
  //   // this.ctx.attachment('order_no.zip');
  //   // this.ctx.body = willSendthis;
  //   // zip.writeZip(/*target file name*/"/home/me/files.zip");
  //
  //   const res: any = await this.fetch('http://cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/design/13/33/2020-07-03-14:09:32/246db614-eb3e-440f-a297-9289abdac3a5.DST');
  //   const content_length = res.headers._headers['content-length'][0];
  //   // const res: any = await this.fetch(order_item.design_dst_path);
  //   this.ctx.set({
  //     // 'Content-Length': isHaveFile.size,
  //     'Content-Type': 'multipart/form-data',
  //     // "Content-Disposition": "attachment; filename=" + `${content}.DST`,
  //   });
  //   const PassThrough = require('stream').PassThrough;
  //   // await this.model('order').where({machine_code: mechineId}).update({machine_code: 0});
  //   // this.ctx.body = res.body;
  //   this.ctx.body = res.body.on('error',  this.ctx.onerror).pipe(PassThrough());
  // }
  // async getDstAction1() {
  //   // if (this.header("ops")) {
  //   //   // @ts-ignore
  //   //   const received: string = this.header("ops");
  //   //   const arr_rec: any[] = received.split("@@");
  //   //   const r_tsp: string = arr_rec[2];
  //   //   const r_sign: string = arr_rec[3];
  //   //
  //   //   const mechineId = arr_rec[1] || 1;
  //   //   const [sid, skey, mid] = ['own_one', 'nh7k9&u', mechineId];
  //   //   const data: string = sid + skey + r_tsp + mid;
  //   //   const sign: string = crypto.createHash('md5').update(data).digest("hex");
  //   //   console.log('sign:', sign);
  //   //   const uid = this.post("id") || "uid";
  //   //   if (r_sign == sign) {
  //         const order_item  = await this.model('order_item').where({item_status: 10}).find();
  //         if (think.isEmpty(order_item)) {
  //             return this.fail(-1, '还没有待下发机器文件');
  //         }
  //         // await this.getBuffer(this, order_item.order_dst_path, true);
  //         const res: any = await this.fetch(order_item.order_dst_path);
  //         // @ts-ignore
  //         this.ctx.set({
  //           // 'Content-Type': 'multipart/form-data',
  //           // 'Content-Type': 'multipart/x-mixed-replace; charset=UTF-8; boundary="' + 'AMZ90RFX875LKMFasdf09DDFF3' + '"',
  //           // 'ServiceBusNotification-Format': 'gcm',
  //           'x-ms-version': '2015-04',
  //           // 'Content-Length': isHaveFile.size,
  //           "Content-Disposition": "attachment; filename=" + `${order_item.order_id}.DST`,
  //         });
  //         const PassThrough = require('stream').PassThrough;
  //         // this.ctx.body = await res.body.pipe(this.ctx.body);
  //         // const readStream = res.body.on('error',  this.ctx.onerror).pipe(PassThrough())
  //         this.ctx.body =  res.body;
  //         // this.ctx.body = res.body.on('error',  this.ctx.onerror).pipe(PassThrough());
  //         // res.body.pipe(this.ctx.body);
  //   //   } else {
  //   //     return this.fail(-1, '签名错误');
  //   //   }
  //   // }
  //   // res.writeHead(200, {
  //
  //
  //   //   'Content-Type': 'multipart/x-mixed-replace; charset=UTF-8; boundary="' + SNAPSHOT_BOUNDARY + '"',
  //   //   Connection: 'keep-alive',
  //   //   Expires: 'Fri, 01 Jan 1990 00:00:00 GMT',
  //   //   'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
  //   //   Pragma: 'no-cache'
  //   // });
  //   //
  //   // feed.snapshots.forEach(function (item) {
  //   //   writeResponse(item);
  //   // });
  //   //
  //   // function writeResponse(item) {
  //   //   var buffer = new Buffer(0);
  //   //   var readStream = getGridFs().createReadStream({root: 'items', _id: snapshotItem._id});
  //   //
  //   //   readStream.on('error', function (err) {
  //   //     if (err) {
  //   //       // handle error
  //   //     }
  //   //   });
  //   //
  //   //   readStream.on('data', function (chunk) {
  //   //     buffer = Buffer.concat([buffer, chunk]);
  //   //   });
  //   //
  //   //   readStream.on('end', function () {
  //   //     res.write('\n\n' + SNAPSHOT_BOUNDARY + '\n');
  //   //     res.write('Content-Disposition: filename="' + item.filename + '" \n');
  //   //     res.write('Content-Type: application/zip \n');
  //   //     res.write('Content-length: ' + buffer.length + '\n\n');
  //   //     res.write(buffer);
  //   //   });
  //   // }
  // }
  async copyCosAction() {
    try {
      const fromPath = 'cos-cx-n1-1257124629.cos.ap-guangzhou.myqcloud.com/gallary/15/2020-06-11/5a34d800-dcbc-4bb2-b6e3-bf7addd8911b.png';
      const toPath = `/test/copy/2.png`;
      const oss = think.service('oss');
      const res = await oss.copyFile(toPath, fromPath);
      this.success(res);
    } catch (e) {
      this.dealErr(e);
    }
  }
}
