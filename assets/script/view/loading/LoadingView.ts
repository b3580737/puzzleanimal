import { _decorator, Component, Node, ProgressBar } from 'cc';
import { UIManager } from '../../UIManager';
import { UIID } from '../../common/config/GameUIConfig';
import { Global } from '../../common/Global';
import { GameConfig } from '../../common/config/GameConfig';
import { GameEvent } from '../../common/event/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('LoadingView')
export class LoadingView extends Component {

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    private loadProgress: number = 0;

    start() {
        this.simulateLoading();
    }

    update(deltaTime: number) {

    }
    


    simulateLoading() {
        const interval = setInterval(() => {
            this.loadProgress += 0.1;
            if (this.loadProgress >= 1) {
                this.loadProgress = 1;
                clearInterval(interval);
                this.onComplete();
            }

            if (this.progressBar) {
                this.progressBar.progress = this.loadProgress;
            }
        }, 200);
    }


    onComplete() {
        this.login();
    }

    private login() {
        var uid = "1";
         // 设置本地存储的用户标识（用于下次登录不输入帐号）
        this.setLocalStorage(uid);

        var lv = Global.storage.getNumber("lv");
        if (lv == 0) {
            lv = 1;
        }
        var challenge = Global.storage.getNumber("challenge");
        if (challenge == 0) {
            challenge = 1;
        }
        // 离线测试代码开始
        var data = {
            id: uid,
            name: "Guest",
            power: 10,
            agile: 10,
            physical: 10,
            lv: lv,
            challenge: challenge,
            jobId: 1
        }

       

        GameConfig.init(data);
        Global.gui.showUI(UIID.MainUI);
        Global.audio.music.loadAndPlay("audios/bgm");
        // 玩家登录成功事件
        Global.message.dispatchEvent(GameEvent.LoginSuccess);
    }

    /** 设置本地存储的用户标识 */
    private setLocalStorage(uid: string) {
        Global.storage.setUser(uid);
        Global.storage.set("account", uid);
    }
}


