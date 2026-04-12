import { _decorator, Camera, Component, EventTouch, instantiate, log, Node, Prefab, random, size, Sprite, SpriteFrame, tween, Tween, UI, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Block } from './Block';
import { ImageAsset } from 'cc';
import { Texture2D } from 'cc';
import { Button } from 'cc';
import { Label } from 'cc';
import { Game } from 'cc';
import { GameMetHod } from './GameMethod';
import { GAME_TYPE, GameConfig } from '../../common/config/GameConfig';
import { UIID, UIParam } from '../../common/config/GameUIConfig';
import { UIManager } from '../../UIManager';
import { Global } from '../../common/Global';
import LabelTime from '../../common/timer/LabelTime';
import { TimeUtil } from '../../common/timer/TimeUtils';
const { ccclass, property } = _decorator;

@ccclass('Stage')
export class Stage extends Component {

    @property(Camera)
    camera: Camera = null;

    @property(Prefab)
    blockPrefab: Prefab = null;

    @property(Node)
    blockContainer: Node = null;

    @property(Label)
    lab_time: Label = null;

    static Space = v2(150, 180);

    static getPosByOffsetRowCol(row: number, col: number) {
        return v3(col * this.Space.x, -row * this.Space.y, 0);
    }

    // get Width(): number { return 5; }
    // get Height(): number { return 6; }

    // 图片的尺寸
    picWidth = 600;
    picHeight = 800;

    // 分割的格子数
    blockWidth = 8;
    blockHeight = 8;

    blockNum: number = 4;

    stageZoomRatio = 1;

    spriteFrame: SpriteFrame = null;

    private _tolTime: number = 60
    private _time: number = 0;

    get TotalCellCount() { return this.blockWidth * this.blockHeight; }
    isInRange(row: number, col: number) { return row >= 0 && row < this.blockHeight && col >= 0 && col < this.blockWidth; }
    getIdxByRowCol(rc: number[]) {
        if (this.isInRange(rc[0], rc[1])) {
            return rc[0] * this.blockWidth + rc[1];
        }
        return null;
    }
    getRowColPos(idx: number): number[] {
        return [Math.floor(idx / this.blockWidth), idx % this.blockWidth]; // 得到行列坐标，上到下，左到右
    }
    getPositionByIdx(idx: number) {
        let [row, col] = this.getRowColPos(idx);
        return this.getPositionByRowCol(row, col);
    }
    getPositionByRowCol(row: number, col: number) {
        let x = col * Stage.Space.x - Stage.Space.x * this.blockWidth / 2 + Stage.Space.x / 2;
        let y = row * -Stage.Space.y + Stage.Space.y * this.blockHeight / 2 - Stage.Space.y / 2;
        return v3(x, y, 0);
    }
    getRowColByPos(position: Vec3) {
        let x = Math.floor((position.x + Stage.Space.x * this.blockWidth / 2) / Stage.Space.x);
        let y = this.blockHeight - Math.floor((position.y + Stage.Space.y * this.blockHeight / 2) / Stage.Space.y) - 1;
        return [y, x];
    }
    getIdxByPos(position: Vec3) {
        let [row, col] = this.getRowColByPos(position);
        if (row < 0 || row >= this.blockHeight) return null;
        if (col < 0 || col >= this.blockWidth) return null;
        return this.getIdxByRowCol([row, col]);
    }
    getAdjoin1(posId) {
        let [row, col] = this.getRowColPos(posId);
        let list = [
            { data: [row, col + 1], direction: 0 },
            { data: [row - 1, col], direction: 1 },
            { data: [row, col - 1], direction: 2 },
            { data: [row + 1, col], direction: 3 }
        ];
        return list.filter(_ => {
            let [row, col] = _.data;
            return row >= 0 && row < this.blockHeight && col >= 0 && col < this.blockWidth;
        }).map(_ => {
            let [row, col] = _.data;
            return { idx: this.getIdxByRowCol([row, col]), direction: _.direction };
        });
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onNodeTouch, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onNodeTouch, this);
        this.node.on(Node.EventType.TOUCH_END, this.onNodeTouch, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onNodeTouch, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onNodeTouch, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onNodeTouch, this);
        this.node.off(Node.EventType.TOUCH_END, this.onNodeTouch, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onNodeTouch, this);
        this.timing_end();
    }

    protected onLoad(): void {
        globalThis.stage = this;
    }

    start() {
        GameConfig.stage = this;
        // this.lab_time.onComplete = this.onTimeOut.bind(this);
        this.gameStart();
    }

    nextGroupId = 1001;

    gameStart() {
        var type: number = GameConfig.type;
        var lv: number = type == GAME_TYPE.TIME ? GameConfig.challenge : GameConfig.level;
        this.loadGame(lv);
    }

    private async loadGame(lv) {
        var type: number = GameConfig.type;
        this.blockNum = GameMetHod.getBlockNum(lv);
        this.blockWidth = this.blockHeight = this.blockNum;
        var bundleName = "game";
        let url = `texture/game/level_` + type + "_" + lv;
        // 获取资源，如果获取到则直接替换，如果没有则动态加载
        var imageAsset = Global.res.get(url, ImageAsset, bundleName);
        if (!imageAsset) {
            imageAsset = await Global.res.load(bundleName, url, ImageAsset);
        }
        if (imageAsset) {
            const texture = new Texture2D();
            texture.image = imageAsset;

            this.spriteFrame = new SpriteFrame();
            this.spriteFrame.texture = texture;

            this.onEnterGame();
        } else if (lv > 1) {
            this.loadGame(lv - 1);
        }
    }

    private onEnterGame() {
        var type: number = GameConfig.type;
        this.lab_time.node.active = type == GAME_TYPE.TIME;
        if (type == GAME_TYPE.TIME) {
            this.onStartTime();
        }

        this.node.setScale(this.stageZoomRatio, this.stageZoomRatio, 1);
        this.getComponent(UITransform).setContentSize(this.picWidth + 1000, this.picHeight + 1000);

        Stage.Space.set(this.picWidth / this.blockWidth, this.picHeight / this.blockHeight);

        this.blockMap.clear();
        this.blockContainer.destroyAllChildren();

        this.scheduleOnce(() => {
            this.genBlocks();
            this.disrupt();
            this.calcGroup();
        }, .1);
    }

    blockMap = new Map<number, Block>();

    genBlocks() {
        for (let i = 0; i < this.TotalCellCount; i++) {
            let pos = this.getPositionByIdx(i);
            let blockNode = instantiate(this.blockPrefab);
            let block = blockNode.getComponent(Block);
            block.stage = this;
            block.targetIdx = i;
            block.groupId = i;
            block.setSize(size(this.picWidth / this.blockWidth, this.picHeight / this.blockHeight));
            block.refreshInfo();
            block.getComponent(Sprite).spriteFrame = this.spriteFrame;
            this.blockMap.set(i, block);

            blockNode.setParent(this.blockContainer);
            blockNode.setPosition(pos);
            let [r, c] = this.getRowColPos(i);
            block.row = r;
            block.col = c;
            block.refresh();
        }
    }

    /**
     * 随机打乱
     */
    disrupt() {
        var blockList = [];
        var result = GameMetHod.generate(this.blockNum);
        // console.log("图块顺序====", result);
        if (result) {
            for (let i = 0; i < this.blockNum; i++) {
                let rowArr = result.grid[i];
                for (let j = 0; j < rowArr.length; j++) {
                    let row = rowArr[j];
                    let block = this.blockMap.get(row - 1);
                    blockList.push(block);
                }
            }
        } else {
            blockList = Array.from(this.blockMap.values());
            blockList.sort((a, b) => Math.random() - .5);
        }


        blockList.forEach((block, idx) => {
            block.currentIdx = idx;
            this.blockMap.set(idx, block);
            let pos = this.getPositionByIdx(idx);
            block.node.setPosition(pos);
        });
    }

    calcGroup() {
        let has = false;
        for (let r = 0; r < this.blockHeight; r++) {
            for (let c = 0; c < this.blockWidth; c++) {
                let idx = this.getIdxByRowCol([r, c]);
                let block = this.blockMap.get(idx);

                let idx_right = this.getIdxByRowCol([r, c + 1]);
                if (idx_right != null) {
                    let block_right = this.blockMap.get(idx_right);
                    if (block.groupId != block_right.groupId && block.row == block_right.row && block.col + 1 == block_right.col) {
                        // block_right.groupId = block.groupId;
                        this.changeGroupIdx(block_right.groupId, block.groupId);
                        block_right.refreshInfo();
                        has = true;
                    }
                }

                let idx_down = this.getIdxByRowCol([r + 1, c]);
                let block_down = this.blockMap.get(idx_down);
                if (block_down != null) {
                    if (block.groupId != block_down.groupId && block.col == block_down.col && block.row + 1 == block_down.row) {
                        // block_down.groupId = block.groupId;
                        this.changeGroupIdx(block_down.groupId, block.groupId);
                        block_down.refreshInfo();
                        has = true;
                    }
                }
            }
        }
        if (has) this.calcGroup();
        else {
            this.refreshGroupAppearance();

            let result = this.checkWin();
            if (result) {
                // log('win'); // 注意避免触发多次
                var lv: number = GameConfig.level;
                let param: UIParam = {
                    data: {
                        level: lv,
                        time: this._time
                    }
                }
                GameMetHod.openSuccess(param);
            }
        }
    }

    private onStartTime() {
        this._time = 0;
        this.timeFormat();
        this.schedule(this.onScheduleSecond, 1);
    }

    private onScheduleSecond() {
        this._time++;
        var num: number = this._tolTime - this._time;
        if (num <= 0) {
            this.onTimeOut();
        }
        this.timeFormat();
    }

    timeFormat() {
        if (this.lab_time) {
            var num: number = this._tolTime - this._time;
            this.lab_time.string = TimeUtil.format(num);
        }
    }
    /** 关闭计时 */
    timing_end() {
        this.unscheduleAllCallbacks();
    }

    private onTimeOut() {
        this.timing_end();
        GameMetHod.openFail();
    }

    checkWin() {
        let groupId = null;
        for (let [idx, block] of this.blockMap) {
            if (groupId == null) {
                groupId = block.groupId;
            } else {
                if (groupId != block.groupId) {
                    return false;
                }
            }
        }
        return true;
    }

    changeGroupIdx(fromGroupId, toGroupId) {
        for (let [curIdx, block] of this.blockMap) {
            if (block.groupId == fromGroupId) {
                block.groupId = toGroupId;
                block.refreshInfo();
            }
        }
    }

    // 获取整组的blocks
    getBlocksByGroup(groupId: number) {
        let blocks: Block[] = [];
        for (let [curIdx, block] of this.blockMap) {
            if (block.groupId == groupId) {
                blocks.push(block);
            }
        }
        return blocks;
    }

    // 填充拖拽列表信息
    fillDraggedBlockList(draggedBlock: Block): { block: Block, offset: Vec3 }[] {
        let blockInfos: { block: Block, offset: Vec3 }[] = [];
        this.draggedEmptyIdxSet.clear();
        for (let [curIdx, block] of this.blockMap) {
            if (block.groupId == draggedBlock.groupId) {
                let offset = v3(block.node.position).subtract(draggedBlock.node.position);
                blockInfos.push({ block, offset });
                block.node.setSiblingIndex(-1);
                this.draggedEmptyIdxSet.add(block.currentIdx);
            }
        }
        return blockInfos;
    }

    // 拖拽列表中执行移动
    moveDraggedBlockList(targetPosition: Vec3) {
        for (let i = 0; i < this.draggedBlockList.length; i++) {
            let { block, offset } = this.draggedBlockList[i];
            let pos = v3(targetPosition).add(offset);
            block.node.setPosition(pos);
        }
    }

    endDragGroupList(targetPosition?: Vec3) {
        for (let i = 0; i < this.draggedBlockList.length; i++) {
            let { block, offset } = this.draggedBlockList[i];
            if (targetPosition != null) {
                let pos = v3(targetPosition).add(offset);
                this.setBlockToPositionWithAnim(block, pos);
            } else {
                let pos = this.getPositionByIdx(block.currentIdx);
                this.setBlockToPositionWithAnim(block, pos);
            }
        }
        this.draggedBlockList = null;
    }

    setBlockToPositionIdWithAnim(block: Block, posId: number) {
        Tween.stopAllByTarget(block.node);
        let targetPos = this.getPositionByIdx(posId);
        this.setBlockToPositionWithAnim(block, targetPos);
    }

    setBlockToPositionWithAnim(block: Block, targetPos: Vec3) {
        tween(block.node).to(.2, { position: targetPos }, { easing: 'quadInOut' }).call(() => {

        }).start();
    }

    worldPosToLocalPos(_pos: Vec3) { return this.node.getComponent(UITransform).convertToNodeSpaceAR(_pos, _pos); }

    draggedBlock: Block = null;
    draggedBlockList: { block: Block, offset: Vec3 }[] = null;

    draggedOffset = v3(0, 0, 0);

    draggedEmptyIdxSet = new Set<number>(); // 由拖拽成组的block引起的空格集合

    _location = v2();
    _touchLocation = v3();
    _worldPosition = v3();
    _moveTargetPosition = v3();
    onNodeTouch(eventTouch: EventTouch) {
        eventTouch.getLocation(this._location);
        this.camera.screenToWorld(this._touchLocation.set(this._location.x, this._location.y, 0), this._worldPosition);
        this._worldPosition.z = 0;
        // log('onNodeTouch', eventTouch.type, this._worldPosition);

        let localPos = this.worldPosToLocalPos(this._worldPosition);
        switch (eventTouch.type) {
            case 'touch-start': {
                let touchedIdx = this.getIdxByPos(localPos);
                if (touchedIdx == null) return;
                this.draggedBlock = this.blockMap.get(touchedIdx);
                this.draggedOffset.set(localPos).subtract(this.draggedBlock.node.position);
                this.draggedBlockList = this.fillDraggedBlockList(this.draggedBlock);
                log('touchedIdx', touchedIdx, this.draggedBlock.groupId, this.draggedBlockList, this.draggedOffset);
                break;
            }
            case 'touch-move': {
                if (this.draggedBlockList != null) {
                    this._moveTargetPosition.set(localPos).subtract(this.draggedOffset);
                    this.moveDraggedBlockList(this._moveTargetPosition);
                }
                break;
            }
            case 'touch-end':
            case 'touch-cancel':
                Global.audio.playEffect("audios/move");
                if (this.draggedBlockList != null) {
                    // 判断落点合理性
                    let passed = this.checkDraggedEnd();
                    if (!passed) {
                        this.endDragGroupList();
                    }
                }
                this.draggedBlock = null;
                this.draggedEmptyIdxSet.clear();
                break;
        }
    }

    ungroupByGroupId(groupId: number) { // 打散一个组
        let blocks = this.getBlocksByGroup(groupId);
        blocks.forEach(block => {
            block.groupId = this.nextGroupId++;
            block.refreshInfo();
        });
    }

    checkDraggedEnd() {
        let passed = true;
        let draggedMoveList: { block: Block, targetPosId: number }[] = [];
        let needMakeWayList: Block[] = [];
        let needUngroupId = new Set<number>(); // 负责记录需要打散的组id
        for (let i = 0; i < this.draggedBlockList.length; i++) {
            let { block, offset } = this.draggedBlockList[i];
            let idx = this.getIdxByPos(block.node.position);
            if (idx == null) {
                passed = false; // 有格子在外面，无法通过移动检查
                break;
            } else {
                draggedMoveList.push({ block, targetPosId: idx });
                if (!this.draggedEmptyIdxSet.has(idx)) {
                    needMakeWayList.push(this.blockMap.get(idx));
                } else {
                    this.draggedEmptyIdxSet.delete(idx);
                }
                let _block = this.blockMap.get(idx);
                needUngroupId.add(_block.groupId);
            }
        }

        if (passed) {
            // 打散需要让出的格子
            for (let groupId of needUngroupId) { // 打散组
                this.ungroupByGroupId(groupId);
            }

            // 计算需要让出的移动
            let makeWayMoveList: { block: Block, targetPosId: number }[] = [];
            for (let i = 0; i < needMakeWayList.length; i++) {
                let block = needMakeWayList[i];
                block.groupId = this.nextGroupId++;
                let targetPosId = this.draggedEmptyIdxSet.values().next().value;
                makeWayMoveList.push({ block, targetPosId });
                this.draggedEmptyIdxSet.delete(targetPosId);
            }

            // 开始移动
            for (let { block, targetPosId } of makeWayMoveList) {
                block.currentIdx = targetPosId;
                this.blockMap.set(targetPosId, block);
                block.node.setSiblingIndex(-1);
                this.setBlockToPositionIdWithAnim(block, targetPosId);
            }

            for (let { block, targetPosId } of draggedMoveList) {
                block.currentIdx = targetPosId;
                this.blockMap.set(targetPosId, block);
                block.node.setSiblingIndex(-1);
                this.setBlockToPositionIdWithAnim(block, targetPosId);
            }

            this.draggedBlockList = null;
            this.calcGroup();
        }

        return passed;
    }

    refreshGroupAppearance() {
        for (let [curIdx, block] of this.blockMap) {
            let [row, col] = this.getRowColPos(block.currentIdx);

            // 检查右侧
            {
                let other_posIdx = this.getIdxByRowCol([row, col + 1]);
                if (other_posIdx == null) {
                    block.rightEdge = true;
                } else {
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId == other_block.groupId) {
                        block.rightEdge = false;
                    } else {
                        block.rightEdge = true;
                    }
                }
            }

            // 检查左侧
            {
                let other_posIdx = this.getIdxByRowCol([row, col - 1]);
                if (other_posIdx == null) {
                    block.leftEdge = true;
                } else {
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId == other_block.groupId) {
                        block.leftEdge = false;
                    } else {
                        block.leftEdge = true;
                    }
                }
            }

            // 检查上侧
            {
                let other_posIdx = this.getIdxByRowCol([row - 1, col]);
                if (other_posIdx == null) {
                    block.topEdge = true;
                } else {
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId == other_block.groupId) {
                        block.topEdge = false;
                    } else {
                        block.topEdge = true;
                    }
                }
            }

            // 检查下侧
            {
                let other_posIdx = this.getIdxByRowCol([row + 1, col]);
                if (other_posIdx == null) {
                    block.bottomEdge = true;
                } else {
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId == other_block.groupId) {
                        block.bottomEdge = false;
                    } else {
                        block.bottomEdge = true;
                    }
                }
            }

            block.cornerTop = false;
            block.cornerBottom = false;
            block.cornerLeft = false;
            block.cornerRight = false;

            // 检查右上角
            {
                if (!block.topEdge && !block.rightEdge) {
                    let other_posIdx = this.getIdxByRowCol([row - 1, col + 1]);
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId != other_block.groupId) {
                        block.cornerTop = true;
                        block.cornerRight = true;
                    }
                }
                if (!block.rightEdge && !block.bottomEdge) {
                    let other_posIdx = this.getIdxByRowCol([row + 1, col + 1]);
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId != other_block.groupId) {
                        block.cornerRight = true;
                        block.cornerBottom = true;
                    }
                }
                if (!block.bottomEdge && !block.leftEdge) {
                    let other_posIdx = this.getIdxByRowCol([row + 1, col - 1]);
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId != other_block.groupId) {
                        block.cornerBottom = true;
                        block.cornerLeft = true;
                    }
                }
                if (!block.leftEdge && !block.topEdge) {
                    let other_posIdx = this.getIdxByRowCol([row - 1, col - 1]);
                    let other_block = this.blockMap.get(other_posIdx);
                    if (block.groupId != other_block.groupId) {
                        block.cornerLeft = true;
                        block.cornerTop = true;
                    }
                }
            }

            block.refresh();
        }
    }

    blockInfoEnabled = false;

    blockInfoChanged() {
        for (let [curIdx, block] of this.blockMap) {
            block.blockInfoEnabled = this.blockInfoEnabled;
        }
    }
}


