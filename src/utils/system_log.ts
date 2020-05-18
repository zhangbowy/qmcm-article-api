module.exports = (options: any) => {
    return (ctx: any, next: any) => {
        // do something
        console.log('系统日志中间件');
        return next()
    }
}
