import { Stage } from "../../view/game/Stage";


export enum GAME_TYPE {
    /** 资源加载界面 */
    NONE = 1,
    /** 倒计时 */
    TIME,
}

export class GameConfig {

    static level: number = 1;

    static challenge: number = 1;

    static stage: Stage = null;

    static type: number = 0;

    static init(data: any) {
        this.level = data.lv;
        this.challenge = data.challenge;
    }

}