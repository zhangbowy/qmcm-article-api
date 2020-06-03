import { think } from 'thinkjs';

export default class extends think.Model {
    // @ts-ignore
    get relation() {

    }

    async getUserById($id: number) {
        return await this.where({id: $id}).find();
    }
}
