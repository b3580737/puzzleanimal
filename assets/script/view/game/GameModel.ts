import { GAME_TYPE, GameConfig } from "../../common/config/GameConfig";
import { Global } from "../../common/Global";


export class GameModel {
    static onRequestNext() {
        if (GameConfig.type === GAME_TYPE.TIME) {
            GameConfig.challenge++;
        } else {
            GameConfig.level++;
        }
        Global.storage.set("lv", GameConfig.level);
        Global.storage.set("challenge", GameConfig.challenge)
    }

}