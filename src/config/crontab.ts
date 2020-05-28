import {think} from "thinkjs";
module.exports = [{
    interval: '30s',
    immediate: true,
    enable:true,
    handle: async () => {
        console.log('定时任务');
        let orderList = await think.model('order').where({status:1}).select();
        let today = new Date().getTime();
        let now = today;
        // let oneDay =think.ms('1 days');
        // let oneDay = 1000*60*60*8 + 1000*60;
        let half_hour = 1000 * 60 * 30;
        let list: any = [];
        for (let order of orderList) {
            let created_time = new Date(order.created_at).getTime();
            if (now - created_time > half_hour) {
                list.push(order);
                console.log(created_time);
                await think.model('order').where({id: order.id}).update({
                    _status:"超时未支付,已取消",
                    status:-2
                });
                await think.model('order_item').where({order_id: order.id}).update({
                    item_status:-2
                })
            }
        }
    }
  }, {
    cron: '0 */1 * * *',
    handle: 'crontab/test',
    type: 'all'
  }]
