/** 界面唯一标识（方便服务器通过编号数据触发界面打开） */
export enum UIID {
    /** 资源加载界面 */
    Loading = "loading",
    /** 主界面 */
    MainUI = "mainui",
    /** 游戏界面 */
    Game = "game",
    /** 图鉴界面 */
    Book = "book",
    /** 胜利界面 */
    Success = "Success",
    /** 失败界面 */
    Fail = "Fail",
}

export interface UIConfig {
    /** -----公共属性----- */
    /** 远程包名 */
    bundle?: string;
    /** 窗口层级 */
    layer: string;
    /** 预制资源相对路径 */
    prefab: string;
    /** 是否自动施放（默认自动释放） */
    destroy?: boolean;

    /** -----弹窗属性----- */
    /** 是否触摸非窗口区域关闭（默认关闭） */
    vacancy?: boolean,
    /** 是否打开窗口后显示背景遮罩（默认关闭） */
    mask?: boolean;
    /** 是否启动真机安全区域显示（默认关闭） */
    safeArea?: boolean;
    /** 界面弹出时的节点排序索引 */
    siblingIndex?: number;
}

/** 界面层类型 */
export enum LayerType {
    /** 主界面层 */
    UI = "LayerUI",
    /** 弹窗层 */
    PopUp = "LayerPopUp",
    /** 模式窗口层 */
    Dialog = "LayerDialog",
    /** 系统触发模式窗口层 */
    System = "LayerSystem",
}

/*** 界面打开参数 */
export interface UIParam {
    /** 自定义传递参数 */
    data?: any;

    /** 是否开启预加载（默认不开启 - 开启后加载完不显示界面） */
    preload?: boolean;

    /**
     * 节点添加到层级以后的回调
     * @param node   当前界面节点
     * @param params 外部传递参数
     */
    onAdded?: (node: Node, params: any) => void,

    /** 
     * 如果指定onBeforeRemoved，则next必须调用，否则节点不会被正常删除。
     * 
     * 比如希望节点做一个FadeOut然后删除，则可以在`onBeforeRemoved`当中播放action动画，动画结束后调用next
     * @param node   当前界面节点
     * @param next   回调方法
     */
    onBeforeRemove?: (node: Node, next: Function) => void,

    /**
     * 窗口节点 destroy 之后回调
     * @param node   当前界面节点
     * @param params 外部传递参数
     */
    onRemoved?: (node: Node, params: any) => void
}

/** 打开界面方式的配置数据 */
export var UIConfigData: { [key: string]: UIConfig } = {
    [UIID.Loading]: { layer: LayerType.UI, prefab: "loading/prefab/loadingView", bundle: "resources" },
    [UIID.MainUI]: { layer: LayerType.UI, prefab: "prefab/mainuiView", bundle: "game" },
    [UIID.Book]: { layer: LayerType.UI, prefab: "prefab/bookView", bundle: "game" },
    [UIID.Game]: { layer: LayerType.UI, prefab: "prefab/gameView", bundle: "game" },
    [UIID.Success]: { layer: LayerType.UI, prefab: "prefab/successView", bundle: "game" },
    [UIID.Fail]: { layer: LayerType.Dialog, prefab: "prefab/failView", mask: true, bundle: "game" }
}