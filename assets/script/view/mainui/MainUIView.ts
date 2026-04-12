
import { _decorator, Component, EventTouch, Label } from 'cc';
import { GameMetHod } from '../game/GameMethod';
import { GameConfig } from '../../common/config/GameConfig';
import { UIID } from '../../common/config/GameUIConfig';
import { Global } from '../../common/Global';
import { StringUtil } from '../../common/utils/StringUtil';
const { ccclass, property } = _decorator;

@ccclass('MainUIView')
export class MainUIView extends Component {

    @property(Label)
    lab_num: Label = null;
    start() {
        var lv = GameConfig.level;
        var challenge = GameConfig.challenge;
        var num = lv + challenge - 2;
        this.lab_num.string = Global.language.getLangByID("cur_num", num);
    }

    update(deltaTime: number) {

    }

    private onBtnStartClick(e: EventTouch, type: String) {
        Global.audio.playEffect("audios/Gravel");
        GameConfig.type = Number(type);
        Global.gui.showUI(UIID.Game);
    }

    private onBtnBookClick() {
        GameMetHod.openBook();
    }
}

