import Base from './base.js';
export default class extends think.Controller {
    /**
     * 用户列表
     */
    async indexAction(): Promise<void> {
        return this.display()
    }

    /**
     * 用户列表
     */
    async yessassAction(): Promise<void> {
        const video_info = await this.fetch('https://lens.zhihu.com/api/v4/videos/1506261102166327296').then(t=> t.json());
        const { playlist: {HD: {play_url}} } = video_info;
        this.assign({
            play_url
        });
        return this.display();
    }
}
