
import { _decorator, Component, game, ImageAsset, Node, Sprite, SpriteFrame, Texture2D } from 'cc';
import { GAME_TYPE, GameConfig } from '../../common/config/GameConfig';
import { UIID } from '../../common/config/GameUIConfig';
import { Global } from '../../common/Global';
import { GameMetHod } from './GameMethod';
const { ccclass, property } = _decorator;

@ccclass('FailView')
export class FailView extends Component {

    @property(Sprite)
    private img: Sprite = null;

    start() {
        Global.audio.playEffect("audios/fail");
        // var type: number = GameConfig.type;
        // var lv: number = type == GAME_TYPE.TIME ? GameConfig.challenge : GameConfig.level;
        // var bundleName = "game";
        // let url = `texture/game/level_` + type + "_" + lv;
        // // 获取资源，如果获取到则直接替换，如果没有则动态加载
        // var imageAsset = Global.res.get(url, ImageAsset, bundleName);
        // if (imageAsset) {
        //     const texture = new Texture2D();
        //     texture.image = imageAsset;
        //     var spriteFrame = new SpriteFrame();
        //     spriteFrame.texture = texture;
        //     this.img.spriteFrame = spriteFrame;
        // }
    }

    update(deltaTime: number) {

    }


    private onBtnRestClick() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Fail);
        GameMetHod.openGame();
    }

    private onBtnMainClick() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Fail);
    }
}

