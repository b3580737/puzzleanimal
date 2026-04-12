import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Sprite } from 'cc';
import { ImageAsset } from 'cc';
import { Texture2D } from 'cc';
import { GameModel } from './GameModel';
import { SpriteFrame } from 'cc';
import { UIManager } from '../../UIManager';
import { UIID } from '../../common/config/GameUIConfig';
import { GameConfig } from '../../common/config/GameConfig';
import { Global } from '../../common/Global';
const { ccclass, property } = _decorator;

@ccclass('SuccessView')
export class SuccessView extends Component {

    @property(Label)
    private lab_time: Label = null;

    @property(Sprite)
    private img: Sprite = null;

    private _level: number = 0;
    start() {
        Global.gui.hideUI(UIID.Game);
        Global.audio.playEffect("audios/complete");
    }

    update(deltaTime: number) {

    }

    onAdded(params: any): boolean {
        var lv = params.level;
        // var type: number = GameConfig.type;
        // let url = `texture/game/level_` + type + "_" + lv+"/spriteFrame";
        // // 获取资源，如果获取到则直接替换，如果没有则动态加载
        //  var spriteFrame = Global.res.get(url, SpriteFrame, "game");
        //  if(spriteFrame){
        //      this.img.spriteFrame = spriteFrame;
        //  }
        var lv = params.level;
        var type: number = GameConfig.type;
        let url = `texture/game/level_` + type + "_" + lv;
        // 获取资源，如果获取到则直接替换，如果没有则动态加载
        var imageAsset = Global.res.get(url, ImageAsset, "game");
        if (imageAsset) {
            const texture = new Texture2D();
            texture.image = imageAsset;
            var spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            this.img.spriteFrame = spriteFrame;
        }
        var time = params.time;
        this.lab_time.string = time > 0 ? Global.language.getLangByID("time", time) : Global.language.getLangByID("unlimited");
        GameModel.onRequestNext();
        return true;
    }

    private onBtnBackClick() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Success);
    }

    private onBtnRankClick() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Success);
    }

    private onBtnNextClick() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.showUI(UIID.Game);
        Global.gui.hideUI(UIID.Success);
    }
}

