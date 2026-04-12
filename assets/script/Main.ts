import { _decorator, Component, Node, Prefab, instantiate, ProgressBar, resources, director, JsonAsset, SpriteFrame } from 'cc';
import { UIManager } from './UIManager';
import { UIID } from './common/config/GameUIConfig';
import { Global } from './common/Global';
import { AsyncQueue, NextFunction } from './common/collection/AsyncQueue';
import { resLoader } from './common/loader/ResLoader';
import { LanguageData } from './common/language/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {

    start() {
        this.initRes();
    }

    update(deltaTime: number) {

    }

    private initRes() {
        Global.stage = this.node;
        var queue: AsyncQueue = new AsyncQueue();
        this.loadConfig(queue);
        // 加载多语言包
        this.loadLanguage(queue);
        // 加载公共资源
        this.loadCommon(queue);
        // 加载游戏内容加载进度提示界面
        this.onComplete(queue);

        queue.play();
    }


    private async loadConfig(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
            const config_name = "config";
            resources.load(config_name, JsonAsset, (err, config) => {
                if (err) {
                    console.error(`【${config_name}】的资源包不存在`);
                    next();
                    return;
                }

                // oops.config.game = new GameConfig(config);

                // // 本地存储模块
                // oops.storage = new StorageManager();
                // let security: IStorageSecurity = new StorageSecuritySimple();       // new StorageSecurityCrypto();
                // security.key = oops.config.game.localDataKey;
                // security.iv = oops.config.game.localDataIv;
                // oops.storage.init(security);

                // // 创建音频模块
                // oops.audio = this.persist.addComponent(AudioManager);
                // oops.audio.load();

                // // 设置默认资源包
                // oops.res.defaultBundleName = oops.config.game.bundleDefault;

                // // 游戏界面管理
                // oops.gui.mobileSafeArea = oops.config.game.mobileSafeArea;
                // //@ts-ignore
                // oops.gui.initLayer(this.gui, config.json.gui);

                // // 初始化统计信息
                // oops.config.game.stats ? profiler.showStats() : profiler.hideStats();
                // // 初始化每秒传输帧数
                // game.frameRate = oops.config.game.frameRate;

                // this.enabled = true;
                // this.init();
                // this.run();

                // resources.release(config_name);
                next();
            });
        });

    }

    /** 加载化语言包（可选） */
    private loadLanguage(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
            // 设置默认语言
            let lan = Global.storage.get("language");
            if (lan == null || lan == "") {
                lan = "zh";
                Global.storage.set("language", lan);
            }

            // 加载语言包资源
            Global.language.setLanguage("en", next);
        });
    }

    /** 加载公共资源（必备） */
    private loadCommon(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
            Global.res.loadDir("common", next);
        });
    }

    /** 加载完成进入游戏内容加载界面 */
    private onComplete(queue: AsyncQueue) {
        queue.complete = async () => {
            Global.gui.showUI(UIID.Loading);
        };
    }
}


