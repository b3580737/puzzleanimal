import { UIID } from "../../common/config/GameUIConfig";
import { Global } from "../../common/Global";
import { UIManager } from "../../UIManager";


export class GameMetHod {

    static openSuccess(param) {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Game);
        Global.gui.showUI(UIID.Success, param);
    }
    static openFail() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.hideUI(UIID.Game);
        Global.gui.showUI(UIID.Fail);
    }
    static openMain() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.showUI(UIID.MainUI);
    }
    static openGame() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.showUI(UIID.Game);
    }

    static openBook() {
        Global.audio.playEffect("audios/Gravel");
        Global.gui.showUI(UIID.Book);
    }

    static getBlockNum(lv: number) {
        if (lv < 6) {
            return lv + 2;
        }
        // if (lv == 1) {
        //     return 3;
        // } else if (lv <= 5) {
        //     return 4;
        // } else if (lv <= 10) {
        //     return 5;
        // } else if (lv <= 15) {
        //     return 6;
        // } else if (lv <= 20) {
        //     return 5;
        // } else if (lv <= 25) {
        //     return 6;
        // } else if (lv <= 30) {
        //     return 7;
        // }
        return 8;
    }

    static generate(n) {
        var total = n * n;
        var cst = this.getConstraints(n);
        var minB = cst[0], maxB = cst[1], maxS = cst[2];
        var nums = [];
        for (var i = 0; i < total; i++) nums[i] = i + 1;
        var att = 0;
        var limit = 8000000;

        while (true) {
            att++;
            var sh = this.fisherYates(nums);
            var grid = [];
            for (var r = 0; r < n; r++) grid[r] = sh.slice(r * n, (r + 1) * n);
            var blocks = this.validate(grid, n, minB, maxB, maxS);
            if (blocks !== null) {
                return { grid: grid, blocks: blocks, attempts: att, minB: minB, maxB: maxB, maxS: maxS };
            }
            if (att > limit) {
                return null;
            }
        }
    }

    static getConstraints(n) {
        if (n === 3) return [0, 1, 2];
        if (n === 4) return [0, 1, 3];
        if (n === 5) return [1, 2, 2];
        if (n === 6) return [2, 2, 3];
        return [2, 3, 3];
    }



    static fisherYates(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    static DIR4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    static validate(grid, n, minB, maxB, maxS) {
        var vis = [];
        for (var i = 0; i < n; i++) {
            vis[i] = [];
            for (var j = 0; j < n; j++) vis[i][j] = false;
        }
        var blocks = [];

        for (var r = 0; r < n; r++) {
            for (var c = 0; c < n; c++) {
                if (vis[r][c]) continue;
                vis[r][c] = true;
                var queue = [[r, c]];
                var head = 0;
                var comp = [{ r: r, c: c, v: grid[r][c] }];

                while (head < queue.length) {
                    var cr = queue[head][0], cc = queue[head][1];
                    head++;
                    for (var d = 0; d < 4; d++) {
                        var dr = this.DIR4[d][0], dc = this.DIR4[d][1];
                        var nr = cr + dr, nc = cc + dc;
                        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                        if (vis[nr][nc]) continue;
                        if (this.isConnected(grid[cr][cc], grid[nr][nc], n, dr, dc)) {
                            vis[nr][nc] = true;
                            queue.push([nr, nc]);
                            comp.push({ r: nr, c: nc, v: grid[nr][nc] });
                        }
                    }
                }

                if (comp.length > maxS) return null;
                if (comp.length >= 2) {
                    blocks.push(comp);
                    if (blocks.length > maxB) return null;
                }
            }
        }
        if (blocks.length < minB) return null;
        if (blocks.length > maxB) return null;
        return blocks;
    }
    static isConnected(v1, v2, n, dr, dc) {
        var or1 = Math.floor((v1 - 1) / n), oc1 = (v1 - 1) % n;
        var or2 = Math.floor((v2 - 1) / n), oc2 = (v2 - 1) % n;
        return (or2 - or1 === dr) && (oc2 - oc1 === dc);
    }


}