import { _decorator, Component, Node, Sprite, v2, v3, v4, Label, find, Size, UITransform } from 'cc';
import { EDITOR } from 'cc/env';
import { Stage } from './Stage';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Block')
@executeInEditMode
export class Block extends Component {

    stage: Stage = null;

    @property
    private _row: number = 0;
    @property
    public get row(): number { return this._row; }
    public set row(v: number) { this._row = v; if (EDITOR) this.refresh(); }

    @property
    private _col: number = 0;
    @property
    public get col(): number { return this._col; }
    public set col(v: number) { this._col = v; if (EDITOR) this.refresh(); }

    @property
    private _leftEdge: boolean = false;
    @property
    public get leftEdge(): boolean { return this._leftEdge; }
    public set leftEdge(v: boolean) { this._leftEdge = v; if (EDITOR) this.refresh(); }

    @property
    private _rightEdge: boolean = false;
    @property
    public get rightEdge(): boolean { return this._rightEdge; }
    public set rightEdge(v: boolean) { this._rightEdge = v; if (EDITOR) this.refresh(); }

    @property
    private _bottomEdge: boolean = false;
    @property
    public get bottomEdge(): boolean { return this._bottomEdge; }
    public set bottomEdge(v: boolean) { this._bottomEdge = v; if (EDITOR) this.refresh(); }

    @property
    private _topEdge: boolean = false;
    @property
    public get topEdge(): boolean { return this._topEdge; }
    public set topEdge(v: boolean) { this._topEdge = v; if (EDITOR) this.refresh(); }

    @property
    private _cornerRight: boolean = false;
    @property
    public get cornerRight(): boolean { return this._cornerRight; }
    public set cornerRight(v: boolean) { this._cornerRight = v; if (EDITOR) this.refresh(); }

    @property
    private _cornerLeft: boolean = false;
    @property
    public get cornerLeft(): boolean { return this._cornerLeft; }
    public set cornerLeft(v: boolean) { this._cornerLeft = v; if (EDITOR) this.refresh(); }

    @property
    private _cornerBottom: boolean = false;
    @property
    public get cornerBottom(): boolean { return this._cornerBottom; }
    public set cornerBottom(v: boolean) { this._cornerBottom = v; if (EDITOR) this.refresh(); }

    @property
    private _cornerTop: boolean = false;
    @property
    public get cornerTop(): boolean { return this._cornerTop; }
    public set cornerTop(v: boolean) { this._cornerTop = v; if (EDITOR) this.refresh(); }

    private _blockInfoEnabled: boolean = false;
    public get blockInfoEnabled(): boolean { return this._blockInfoEnabled; }
    public set blockInfoEnabled(v: boolean) {
        this._blockInfoEnabled = v;
        find('Info', this.node).active = v;
    }

    @property(Label)
    infoLabel: Label = null;

    targetIdx: number = null;

    currentIdx: number = null;

    groupId: number = null;

    _sprite: Sprite = null;

    @property
    edgeValue = .2;

    @property
    cornerValue = .2;

    // 重叠渲染，由于圆角无法做到最顶边，所以采用更大的sprite去缩小，block-edge2.effect对应1.1
    @property
    overlap = 1.0;

    @property
    compensation = true; // 正圆角补偿

    refresh() {
        this._sprite = this._sprite ?? this.getComponent(Sprite);
        let material = this._sprite.getMaterialInstance(0);
        material.setProperty('sliceParams', v4(this.stage?.blockWidth ?? 5, this.stage?.blockHeight ?? 6, this.col, this.row));

        if (this.compensation) {
            if (Stage.Space.x < Stage.Space.y) {
                material.setProperty('edgeParams', v4(
                    this.rightEdge ? this.edgeValue : 0,
                    this.leftEdge ? this.edgeValue : 0,
                    this.bottomEdge ? this.edgeValue / Stage.Space.y * Stage.Space.x : 0,
                    this.topEdge ? this.edgeValue / Stage.Space.y * Stage.Space.x : 0,
                ));
                material.setProperty('cornerParams', v4(
                    this.cornerRight ? this.cornerValue : 0,
                    this.cornerLeft ? this.cornerValue : 0,
                    this.cornerBottom ? this.cornerValue / Stage.Space.y * Stage.Space.x : 0,
                    this.cornerTop ? this.cornerValue / Stage.Space.y * Stage.Space.x : 0,
                ));
            } else {
                // 正圆角
                material.setProperty('edgeParams', v4(
                    this.rightEdge ? this.edgeValue / Stage.Space.x * Stage.Space.y : 0,
                    this.leftEdge ? this.edgeValue / Stage.Space.x * Stage.Space.y : 0,
                    this.bottomEdge ? this.edgeValue : 0,
                    this.topEdge ? this.edgeValue : 0,
                ));
                material.setProperty('cornerParams', v4(
                    this.cornerRight ? this.cornerValue / Stage.Space.x * Stage.Space.y : 0,
                    this.cornerLeft ? this.cornerValue / Stage.Space.x * Stage.Space.y : 0,
                    this.cornerBottom ? this.cornerValue : 0,
                    this.cornerTop ? this.cornerValue : 0,
                ));
            }
        } else {
            material.setProperty('edgeParams', v4(
                this.rightEdge ? this.edgeValue : 0,
                this.leftEdge ? this.edgeValue : 0,
                this.bottomEdge ? this.edgeValue / Stage.Space.y * Stage.Space.x : 0,
                this.topEdge ? this.edgeValue / Stage.Space.y * Stage.Space.x : 0,
            ));
            material.setProperty('cornerParams', v4(
                this.cornerRight ? this.cornerValue : 0,
                this.cornerLeft ? this.cornerValue : 0,
                this.cornerBottom ? this.cornerValue / Stage.Space.y * Stage.Space.x : 0,
                this.cornerTop ? this.cornerValue / Stage.Space.y * Stage.Space.x : 0,
            ));
        }

    }

    refreshInfo() {
        this.infoLabel.string = `${this.targetIdx}|G${this.groupId}`;
    }

    setSize(oriSize: Size) {
        let transform = this.getComponent(UITransform);
        transform.setContentSize(oriSize.width * this.overlap, oriSize.height * this.overlap);
    }

}


