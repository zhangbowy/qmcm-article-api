
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
    get pk() {
        return 'designer_team_id';
    }

    get relation() {
        return {
            designer: {
                type: think.Model.HAS_MANY,
                Model: 'designer',
                fKey: 'designer_team_id', // machine表
                key: 'designer_team_id', // 当前表
                field: 'designer_id,designer_team_id,designer_name,designer_phone,is_leader,default_password,created_at,updated_at',
                where: { del: 0},
            },
        };
    }
}
