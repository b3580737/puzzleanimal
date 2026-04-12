import { Node } from "cc";
import { UIManager } from "../UIManager";
import { MessageManager } from "./event/MessageManager";
import { resLoader, ResLoader } from "./loader/ResLoader";
import { StorageManager } from "./StorageManager";
import { TimerManager } from "./timer/TimerManager";
import { AudioManager } from "./audio/AudioManager";
import { LanguageManager } from "./language/Language";


export class Global {
    static stage: Node = null;
    /** 资源管理 */
    static res: ResLoader = resLoader;
    /** 本地存储 */
    static storage: StorageManager = StorageManager.instance;
    /** 全局消息 */
    static message: MessageManager = MessageManager.instance;
    /** 游戏时间管理 */
    static timer: TimerManager = TimerManager.instance;
    /** 二维界面管理 */
    static gui: UIManager = UIManager.instance;
    /** 游戏音乐管理 */
    static audio: AudioManager = AudioManager.instance;
     /** 多语言模块 */
    static language: LanguageManager = new LanguageManager();
}


