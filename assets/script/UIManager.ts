import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { UIConfigData, UIID, UIParam } from './common/config/GameUIConfig';
import { Global } from './common/Global';
const { ccclass, property } = _decorator;

export class UIManager {
    private static _instance: UIManager;
    static get instance(): UIManager {
        if (this._instance == null) {
            this._instance = new UIManager();
        }
        return this._instance;
    }

    // async showUI(uiID: UIID, param: any = null) {
    //     const uiConfig = UIConfigData[uiID];
    //     var prefab = await Global.res.load(uiConfig.bundle, uiConfig.prefab, Prefab);
    //     if (prefab) {
    //         var node = instantiate(prefab);
    //         node.name = uiID;
    //         if (param && node["onAdded"]) {
    //             node["onAdded"](param);
    //         }
    //         Global.stage.addChild(node);
    //     } else {
    //         console.error('Failed to load loading prefab:', uiConfig.prefab);
    //     }
    // }


    showUI(uiID: UIID, param?: UIParam): Promise<Node> {
        return new Promise<Node>(async (resolve, reject) => {
            const uiConfig = UIConfigData[uiID];
            var prefab = await Global.res.load(uiConfig.bundle, uiConfig.prefab, Prefab);
            if (prefab) {
                var node = instantiate(prefab);
                node.name = uiID;
                Global.stage.addChild(node);
                // 触发窗口组件上添加到父节点后的事件
                for (let i = 0; i < node.components.length; i++) {
                    const component: any = node.components[i];
                    const func = component["onAdded"];
                    if (func) {
                        func.call(component, param.data);
                    }
                }
                resolve(node);
            } else {
                console.error('Failed to load loading prefab:', uiConfig.prefab);
            }
        });
    }

    hideUI(uiID: UIID) {
        const node = Global.stage.getChildByName(uiID);
        if (node) {
            node.destroy();
        }
    }
}


