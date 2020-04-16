import { think } from 'thinkjs';

module.exports = class extends think.Service {
    constructor() {
        super();

    }
    uploadImg() {
        cos.putObject({
            Bucket: 'cos-cx-n1-1257124629',
            Region: 'ap-guangzhou',    /* 必须 */
            Key: '/gallary',
            StorageClass: 'STANDARD',
            Body: fs.createReadStream('./exampleobject'),
            onProgress: function(progressData:any) {
                console.log(JSON.stringify(progressData));
            }
        }, function(err:any, data:any) {
            console.log(err || data);
        });
    }
}
