const rp = require('request-promise');
const _ = require('lodash');
import { think } from 'thinkjs';

interface QueryParams  {
  shipperCode: string;
  logisticCode: string;
  orderCode: string;
}

interface ExpressInfo {
  traces?: any[];
  success: boolean;
  shipperCode: string;
  shipperName: string;
  logisticCode: string;
  isFinish: number;
  state?: any;
  _state?: any;
}
module.exports = class extends think.Service {
  async queryExpress<queryParams>(shipperCode: string, logisticCode: string, orderCode = '') {
    let expressInfo: ExpressInfo = {
      success: false,
      shipperCode,
      shipperName: '',
      logisticCode,
      isFinish: 0,
      traces: [],
      state: 0,
      _state: 0
    };
    const fromData = this.generateFromData(shipperCode, logisticCode, orderCode);
    if (think.isEmpty(fromData)) {
      return expressInfo;
    }

    // const url = think.config('express.request_url');
    // const url = think.config('express.request_url');
    const sendOptions = {
      url: think.config('express.request_url'),
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: fromData
      // body: fromData
    };

    try {
      // const requestResult: any = await this.fetch(url,sendOptions).then(res => res.json());
      const requestResult: any = await rp(sendOptions);
      if (think.isEmpty(requestResult)) {
        return expressInfo;
      }
      expressInfo = this.parseExpressResult(requestResult);
      expressInfo.shipperCode = shipperCode;
      expressInfo.logisticCode = logisticCode;
      return expressInfo;
    } catch (err) {
      return expressInfo;
    }
  }

  parseExpressResult(requestResult: any) {
    const expressInfo: ExpressInfo = {
      success: false,
      shipperCode: '',
      shipperName: '',
      logisticCode: '',
      isFinish: 0,
      traces: [],
      state: 0,
      _state: '暂无轨迹信息'
    };

    if (think.isEmpty(requestResult)) {
      return expressInfo;
    }

    try {
      if (_.isString(requestResult)) {
        // @ts-ignore
        requestResult = JSON.parse(requestResult);
      }
    } catch (err) {
      return expressInfo;
    }

    if (think.isEmpty(requestResult.Success)) {
      return expressInfo;
    }

    if (parseInt(requestResult.State, 10) === 3) {
      expressInfo.isFinish = 1;
      expressInfo.state = 3;
      expressInfo._state = '已签收!';
    }
    if (parseInt(requestResult.State, 10) === 4) {
      expressInfo.state = 4;
      expressInfo._state = '问题件!';
    }
    if (parseInt(requestResult.State, 10) === 2) {
      expressInfo.state = 2;
      expressInfo._state = '在途中!';
    }
    expressInfo.success = true;
    if (!think.isEmpty(requestResult.Traces) && Array.isArray(requestResult.Traces)) {
      expressInfo.traces = _.map(requestResult.Traces, (item: any) => {
        return { datetime: item.AcceptTime, content: item.AcceptStation };
      });
      _.reverse(expressInfo.traces);
    }
    return expressInfo;
  }

  generateFromData(shipperCode: any, logisticCode: any, orderCode: any) {
    const requestData = this.generateRequestData(shipperCode, logisticCode, orderCode);
    const fromData = {
      RequestData: encodeURI(requestData),
      EBusinessID: think.config('express.appid'),
      RequestType: '1002',
      DataSign: this.generateDataSign(requestData),
      DataType: '2'
    };
    let str = '';
    for (const k in fromData) {
      if ((Object.keys(fromData)).indexOf(k) == Object.keys(fromData).length - 1) {
        str += `${k}=${fromData[k]}`;
      } else {
        str += `${k}=${fromData[k]},`;
      }
    }
    // return str;
    return fromData;
  }

  generateRequestData(shipperCode: any, logisticCode: any, orderCode = '') {
    // 参数验证
    const requestData = {
      OrderCode: orderCode,
      ShipperCode: shipperCode,
      LogisticCode: logisticCode
    };
    return JSON.stringify(requestData);
  }

  generateDataSign(requestData: any) {
    return encodeURI(Buffer.from(think.md5(requestData + think.config('express.appkey'))).toString('base64'));
  }
};
