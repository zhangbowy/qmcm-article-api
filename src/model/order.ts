import { think } from 'thinkjs';
interface GetUserParams {
    id: number;
}
interface AddUserParams {
    name: string;
    phone: number;
    pwd: string;
}

export default class extends think.Model {
    get relation() {
        return {
            order_item: {
                type: think.Model.HAS_MANY,
                Model: 'order_item',
                fKey: 'order_id',
                key: 'id',
                // field: 'shop_id,phone,name',
                // where: {role_type: ['NOTIN', '1'], del: 0},
            },
            user: {
                type: think.Model.HAS_ONE,
                Model: 'user',
                fKey: 'id',
                key: 'user_id',
            },
            designer: {
                type: think.Model.HAS_ONE,
                Model: 'designer',
                fKey: 'designer_id',
                key: 'designer_id',
                field: 'designer_id,designer_team_id,designer_name,designer_phone,is_leader',
            },
        };
    }
    async getOrderFee($where: any) {
        // let sql = 'select date_format(created_at,'+"'%Y-%m-%d'"+') days from `order` group by `days`  UNION  ' +
        //     'SELECT ' +
        //     'datelist  as days ' +
        //     'FROM ' +
        //     '`calendar` ';
        //
        // let order_count = 'SELECT ' +
        //     '    date(dday) date, ' +
        //     '    sum(count) as count ' +
        //     'FROM' +
        //     '    ( ' +
        //     '        SELECT ' +
        //     '            datelist as dday, pay_amount as count' +
        //     '        FROM ' +
        //     '            calendar ' +
        //     '            where  DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(datelist)&&date(datelist)<=CURDATE() ' +
        //     '        UNION ALL ' +
        //     '            SELECT ' +
        //     '                created_at ,pay_amount as count ' +
        //     '            FROM  ' +
        //     '               `order` where  `status` NOT IN (1,-2,5,6)'+
        //     '    ) a ' +.


        //     'GROUP BY date';



        let order_fee = 'SELECT ' +
            '    date(dday) date, ' +
            '    sum(count) as count ' +
            'FROM' +
            '    ( ' +
            '        SELECT ' +
            '            datelist as dday, pay_amount as count' +
            '        FROM ' +
            '            calendar ' +
            '            where  DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(datelist)&&date(datelist)<=CURDATE()' +
            '        UNION ALL ' +
            '            SELECT ' +
            '                created_at ,pay_amount as count ' +
            '            FROM  ' +
            '               `order` where ' +
            `shop_id=${$where.shop_id} and DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(created_at)&&date(created_at)<=CURDATE() and`+
            ' `status` NOT IN (1,-2,5,6)'+
            '    ) a ' +
            'GROUP BY date';
        let res_fee = await this.query(order_fee);
        let date = [];
        let count = [];
        for (let item of res_fee) {
            date.push(item.date);
            count.push(item.count);
        }
        let result = {
            date,
            count
        }
        return result
    }
    async getOrderCount($where: any) {
        // let sql = 'select date_format(created_at,'+"'%Y-%m-%d'"+') days from `order` group by `days`  UNION  ' +
        //     'SELECT ' +
        //     'datelist  as days ' +
        //     'FROM ' +
        //     '`calendar` ';

        let order_count = 'SELECT ' +
            '    date(dday) date, ' +
            '    count(*)-1 as count ' +
            'FROM' +
            '    ( ' +
            '        SELECT ' +
            '            datelist as dday ' +
            '        FROM ' +
            '            calendar ' +
            '            where  DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(datelist)&&date(datelist)<=CURDATE() ' +
            '        UNION ALL ' +
            '            SELECT ' +
            '                created_at ' +
            '            FROM  ' +
            '               `order` where ' +
            `shop_id=${$where.shop_id} and DATE_SUB(CURDATE(), INTERVAL 6 DAY) <= date(created_at)&&date(created_at)<=CURDATE() and`+
            ' `status` NOT IN (1,-2,5,6)'+
            '    ) a ' +
            'GROUP BY date';



        // let order_fee = 'SELECT ' +
        //     '    date(dday) date, ' +
        //     '    sum(count) as count ' +
        //     'FROM' +
        //     '    ( ' +
        //     '        SELECT ' +
        //     '            datelist as dday, pay_amount as count' +
        //     '        FROM ' +
        //     '            calendar ' +
        //     '            where  DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(datelist)&&date(datelist)<=CURDATE() ' +
        //     '        UNION ALL ' +
        //     '            SELECT ' +
        //     '                created_at ,pay_amount as count ' +
        //     '            FROM  ' +
        //     '               `order` where  `status` NOT IN (1,-2,5,6)'+
        //     '    ) a ' +
        //     'GROUP BY date';
        // let a =  await this.getField('created_at,id');
        let res_count = await this.query(order_count);
        let date = [];
        let count = [];
        for (let item of res_count) {
            date.push(item.date);
            count.push(item.count);
        }
        let result = {
            date,
            count
        }
        return result
    }
    async getWeek() {
        let sql ='select created_at from `order` where to_days(now()) - to_days(created_at) <= 3'
        let a = await this.query(sql);
        return  a
    }
}
