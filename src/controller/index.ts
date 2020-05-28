import Base from './base';
import {ancestorWhere} from "tslint";
const path = require('path');
const fs = require('fs');
export default class extends Base {
  indexAction() {
    // return this.display();
    return this.redirect('http://www.wkdao.com', '走错路发现世界,走对路发现自己');
    const filepath = path.join(think.ROOT_PATH, 'view/index_index.html');
    return this.success([], "请求成功!");
    return  this.download(filepath);
  }

  /**
   *  下载资源接口
   *  @param {url} 资源链接
   *  @param {fileName} 文件名
   */
  async downLoadAction() {
    const file = this.get('url');
    const fileName = this.get('fileName');
    const fileBuffer = await this.getBuffer(this, file,true);
    await fs.writeFileSync('1.PNG',fileBuffer);
    this.download('1.PNG', fileName+'.png');
  }

  /**
   * 首页数据
   */
  async indexDataAction() {
    try {
      const shop_id = this.ctx.state.admin_info.shop_id;
      // let today_order_amount: any = await this.model('order').where('TO_DAYS(created_at) = TO_DAYS(now()) and `status` NOT IN (1,-2,5,6)').sum('pay_amount');
      let total_order_amount: any = await this.model('order').where(`shop_id=${shop_id} and `+'`status` NOT IN (1,-2,5,6)').sum('pay_amount');
      // select date_format(时间字段,'%Y-%m-%d') days,count(*) from 表名 where date_format(时间字段,'%Y')='2019' group by days
      // @ts-ignore
      let order_count = await this.model('order').getOrderCount({shop_id});
      // @ts-ignore
      let order_amount = await this.model('order').getOrderFee({shop_id});
      // let getWeek = await this.model('order').getWeek();
      // let today: any = await this.model('order').where('TO_DAYS(created_at) = TO_DAYS(now()) and `status` NOT IN (1,-2,5,6)').field('created_at').select();
      // let yestoday_order_amount = await this.model('order').where('TO_DAYS(NOW( )) - TO_DAYS(created_at) = 1 and `status` NOT IN (1,-2,5,6)').sum('pay_amount') ;
      let user_count = await this.model('user').where(`shop_id=${shop_id}`).count('id') ;
      let gooods_count = await this.model('item').where(`shop_id=${shop_id} and `+'del=0').count('id') ;
      let design_count = await this.model('design').where({shop_id: shop_id, del: 0}).count('design_id') ;
      // let yestoday = await this.model('order').where('TO_DAYS(NOW( )) - TO_DAYS(created_at) = 1 and `status` NOT IN (1,-2,5,6)').field('created_at').select() ;
      // let yestoday = SELECT * FROM 表名 WHERE TO_DAYS( NOW( ) ) – TO_DAYS( 时间字段名) <= 1
      // let orderTotal = await this.model('order').where('TO_DAYS(create_at) = TO_DAYS(date_sub(now(), interval '+day+' day)) ').field('COUNT(*) total').find();
      // SELECT SUM(score) AS think_sum FROM `test_d` LIMIT 1
      return this.success({ total_order_amount, user_count, gooods_count , design_count, order_count, order_amount}, '首页数据!');
    }catch (e) {
      this.dealErr(e)
    }
  }

  async getOverview(day: any) {
    let sql = 'select sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval '+day+' day)) and od.status = 4 then oc.profit_p else 0 end) as profit_p_total,'+
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval '+day+' day)) and od.status = 4 then oc.profit_a else 0 end) as profit_a_total,'+
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval '+day+' day)) and od.status = 4 then oc.profit_m else 0 end) as profit_m_total,'+
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval '+day+' day)) and od.status = 4 then oc.profit_fu else 0 end) as profit_fu_total,'+
        'sum(case when TO_DAYS(op.status_time4) = TO_DAYS(date_sub(now(), interval '+day+' day)) and od.status = 4 then oc.profit_su else 0 end) as profit_su_total '+
        ' from '+
        'erd_order_cents oc , erd_order od,erd_order_ope op '+
        'where oc.order_id = od.id and op.order_id = od.id';
    let res = this.query(sql);
    return res
    `select date_format(时间字段,'%Y-%m-%d') days,count(*) from 表名 where date_format(时间字段,'%Y')='2019' group by days
    --或
    select count(*),DATE(时间字段名) from 表名 where YEAR(时间字段名)='2019' group by DAY(时间字段名)`
  }

}
