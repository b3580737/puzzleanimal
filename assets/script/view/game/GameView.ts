import { _decorator, Component, ImageAsset, Node, SpriteFrame } from 'cc';
import { UIID } from '../../common/config/GameUIConfig';
import { Global } from '../../common/Global';
import { resLoader } from '../../common/loader/ResLoader';

const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    start() {

    }

    update(deltaTime: number) {

    }

    private async onBtnBackClick() {
        var bundleName = "resources";
        let url = `language/texture/zh/btnBack`;
        // var res = await Global.res.load(bundleName, url, ImageAsset);
        var res = await Global.res.get(url, ImageAsset);
        console.log(res);
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Game);
    }

}

