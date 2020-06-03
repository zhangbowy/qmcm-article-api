export default  {
    getFilecontentsEMB(str: string) {
        // console.log('getFilecontentsEMB:'+str)
        const re = /emb" filecontents="(.*)" filecontentmode/;
        // console.log('re.exec(str)',re.exec(str));

        return re.exec(str)[1];
    },
    getFilecontentsPNG(str: string) {
        const re = /png" filecontents="(.*)" filecontentmode/;
        const arr = re.exec(str);
        if (Array.isArray(arr) && arr.length > 1) {
            return arr[1];
        }
        return arr;
    }
};
