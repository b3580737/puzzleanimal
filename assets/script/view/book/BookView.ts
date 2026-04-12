import { _decorator, Component, Node } from 'cc';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
import { ImageAsset } from 'cc';
import { Texture2D } from 'cc';
import { VirtualScrollView } from '../../common/scroll/VScrollView';
import { GameConfig } from '../../common/config/GameConfig';
import { Global } from '../../common/Global';
import { UIID } from '../../common/config/GameUIConfig';

const { ccclass, property } = _decorator;

@ccclass('BookView')
export class BookView extends Component {

    @property([SpriteFrame])
    spfs: SpriteFrame[] = [];

    @property(VirtualScrollView)
    list: VirtualScrollView | null = null;

    //列表数据
    private data: any[] = [];
    start() {

    }

    update(deltaTime: number) {

    }

    onLoad() {
        this.onUpdateList();
    }

    private onUpdateList() {
        this.data = [];
        var lv = GameConfig.level;
        for (let i = 1; i <= lv; i++) {
            var str = Global.language.getLangByID(`level_name_${1}_${i}`) ?? ""
            this.data.push({
                icon: `head_` + 1 + "_" + i,
                name: str,
                isOpen: true
            });
        }

        var challenge = GameConfig.challenge;
        for (let k = 1; k <= challenge; k++) {
            var str = Global.language.getLangByID(`level_name_${2}_${k}`) ?? ""
            this.data.push({
                icon: `head_` + 2 + "_" + k,
                name: str,
                isOpen: true
            });
        }

        var num = Math.max(1, 9 - lv - challenge);
        for (let i = 0; i < num; i++) {
            this.data.push({
                icon: `head_none`,
                name: Global.language.getLangByID(`unlocked`),
                isOpen: false
            });
        }



        // 设置虚拟列表数据
        if (this.list) {
            this.list.renderItemFn = async (itemNode: Node, index: number) => {
                var obj = this.data[index];
                const title = itemNode.getChildByName('lab_name').getComponent(Label);
                title!.string = obj.name;

                const sp = itemNode.getChildByName('icon').getComponent(Sprite);
                // 获取资源，如果获取到则直接替换，如果没有则动态加载
                var bundleName = "game";
                var url = "texture/head/" + obj.icon;
                var imageAsset = Global.res.get(url, ImageAsset, bundleName);
                if (!imageAsset) {
                    imageAsset = await Global.res.load(bundleName, url, ImageAsset);
                }
                if (imageAsset) {
                    const texture = new Texture2D();
                    texture.image = imageAsset;

                    var spriteFrame = new SpriteFrame();
                    spriteFrame.texture = texture;

                    sp.spriteFrame = spriteFrame;
                }
            };

            this.list.onItemClickFn = (itemNode: Node, index: number) => {
                // const tip = this.node.getChildByName('tip').getComponent(Label);
                // tip.string = `你点击了第${index + 1}项,内容:${this.data[index].data1}`;
            };

            this.list.refreshList(this.data);
        }
    }
    private onBtnBackClick() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Book);
    }
}

