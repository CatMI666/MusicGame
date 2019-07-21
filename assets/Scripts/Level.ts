const {ccclass, property} = cc._decorator;
var SPEED = 100;

@ccclass
export default class Level extends cc.Component {

    @property(cc.Node)
    ndPlayer: cc.Node = null;

    @property(cc.Node)
    mapRoot: cc.Node = null;

    @property(cc.Node)
    ndResult: cc.Node = null;

    @property(cc.Node)
    ndBtn: cc.Node = null;

    @property(cc.Label)
    labTime: cc.Label = null;

    @property({
        type: cc.AudioClip
    })
    audioClick: cc.AudioClip = null;
    
    _gameStatus: number;
    _speed: number;
    _iCount: number;
    _idx: number;
    _audioID: number;
    _iTime: number;
    iLv: number;
    _tiledMap: any;
    _layerFloor: any;
    _ndMap: cc.Node;
    audioTask: any;
    LvData: number[][];

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
    }

    update (dt) {
        if (this._gameStatus == 1){
            var dx = this._speed * dt;
            var dy = SPEED/2 * dt;
            this.ndPlayer.x += dx;
            this.ndPlayer.y += dy;
            this._ndMap.parent.x -= dx;
            this._ndMap.parent.y -= dy;
            var pos = this._getTilePos(cc.v2(this.ndPlayer.x, this.ndPlayer.y));
            if (pos.x == 0 && pos.y == 1) {
                this.gameOver();
            } else {
                var id = this._layerFloor.getTileGIDAt(pos);
                cc.log(pos.x, pos.y, id);
                if (id == 0) {
                    this._iCount++;
                    // var p = this._getNewPos();
                    // this.ndPlayer.x += p.x;
                    // this.ndPlayer.y += p.y;
                    // this._ndMap.x -= 2*p.x;
                    // this._ndMap.y -= 2*p.y;
                    // this._gameStatus = 3;
                    this.ndPlayer.x -= 5*dx;
                    this.turnTo();
                }
            }
        }
    }

    initCanvas(){
        // cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.SHOW_ALL);
        // let srcScaleForShowAll = Math.min(cc.view.getCanvasSize().width / this.node.width, cc.view.getCanvasSize().height / this.node.height);
        // let realWidth = this.node.width * srcScaleForShowAll;
        // let realHeight = this.node.height * srcScaleForShowAll;
        // this.node.scale = Math.max(cc.view.getCanvasSize().width / realWidth, cc.view.getCanvasSize().height / realHeight);
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
    }

    initParas(){
        this._gameStatus = 0;
        this.iLv = 1;
        this.ndPlayer.zIndex = 1;
        // this._tiledMap = this._ndMap.getComponent('cc.TiledMap');
    }

    initEvent(){
        this.ndBtn.on("click", function (argument) {
            if (this._gameStatus == 0)
                this.gameStart();
            else if (this._gameStatus == 1){
                this.turnTo();
            } else if (this._gameStatus == 3){
                this._gameStatus = 1;
            }
        }, this);
        cc.find("back", this.ndResult).on("click", function (argument) {
            cc.director.loadScene("Lobby");
        }, this);
    }

    initShow(){
        this.ndBtn.active = true;
        this.ndResult.active = false;
    }

    showCount(){
        cc.find("times", this.ndResult).getComponent(cc.Label).string = this._iCount.toString();
    }

    turnTo(){
        this._speed = -this._speed;
        this.ndPlayer.scaleX = -this.ndPlayer.scaleX;
    }

    gameStart(){
        this.playSound("click");
        this._ndMap.active = true;
        // this._layerFloor = this._tiledMap.getLayer("floor");
        var anim = this.ndPlayer.getComponent(cc.Animation);
        anim.play();
        this._gameStatus = 1;
        this._iCount = 0;
        this._idx = 0;
        this.playTime();
        cc.find("labLv", this.labTime.node).getComponent(cc.Label).string = "Lv:"+this.iLv.toString();
        this.LvData = [[0,1],[6,7],[-5,18],[3,26],[-2,31],[3,36],[-3,42],[3,48],[0,51],[4,55],[-4,63],[4,71],[-2,77],[3,82],[-1,86],[2,89],[-1,92],[2,95],[-1,98]];
        // var para = 1;
        // if (para > 0) 
        // this.ndPlayer.scaleX = -this.ndPlayer.scaleX;
        // this._speed = para*SPEED;
        this._speed = SPEED;
        this.playAudio();
    }

    gameOver(){
        this._gameStatus = 2;
        var anim = this.ndPlayer.getComponent(cc.Animation);
        anim.stop();
        this.ndResult.active = true;
        this._ndMap.active = false;
        this.showCount();
        var lv = cc.sys.localStorage.getItem("level");
        if (lv == this.iLv) cc.sys.localStorage.setItem("level", this.iLv+1);
        this.labTime.unschedule(this.coPlayTime);
        this.stopAudio();
    }
    coPlayTime(coPlayTime: any) {
        throw new Error("Method not implemented.");
    }

    playAudio () {
        // return current audio object
        cc.log("this.audioTask = ", this.audioTask);
        this._audioID = cc.audioEngine.play(this.audioTask, false, 1);
    }

    stopAudio () {
        cc.audioEngine.stop(this._audioID);
    }

    playSound(sName){
        if (sName == "click") cc.audioEngine.play(this.audioClick, false, 1);
    }

    _getNewPos(){
        var mapSize = this._ndMap.getContentSize();
        var tileSize = this._tiledMap.getTileSize();
        var dx = 0, dy = 1;
        var curY = Math.floor(2*(this.ndPlayer.y+mapSize.height/2)/tileSize.height);
        for (var i = this._idx; i < this.LvData.length; i++) {
            if (curY <= this.LvData[i][1]){
                this._idx = i;
                dx = this.LvData[this._idx][0];
                dy = this.LvData[this._idx][1];
                if (curY == this.LvData[i][1]){
                    this.turnTo();
                }
                break;
            }
        };
        var x = tileSize.width/2*dx;
        var px = x-this.ndPlayer.x;
        var y = tileSize.height/2*dy-mapSize.height/2;
        var py = y-this.ndPlayer.y;
        // cc.log(x, y, px, py, curY, this._idx, this.ndPlayer.x, this.ndPlayer.y);
        return cc.v2(px, py);
    }

    _getTilePos(posInPixel) {
        var mapSize = this._ndMap.getContentSize();
        var tileSize = this._tiledMap.getTileSize();
        var multi = tileSize.width/tileSize.height;
        posInPixel.x += mapSize.width/2;
        posInPixel.y += mapSize.height/2;
        var x = Math.floor(posInPixel.x / tileSize.width)*tileSize.width;
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height)*tileSize.height;
        var px = 0, py = 0; //将坐标转换成所在菱形的中点
        var nx = posInPixel.x-x;
        var ny = mapSize.height-posInPixel.y-y;
        if (ny <= tileSize.height-1/multi*nx){
            if (ny <= 1/multi*nx){
                px = x+tileSize.width/2;
                py = y;
            }else{
                px = x;
                py = y+tileSize.height/2;
            }
        }else{
            if (ny <= 1/multi*nx){
                px = x+tileSize.width;
                py = y+tileSize.height/2;
            }else{
                px = x+tileSize.width/2;
                py = y+tileSize.height;
            }
        }
        var m = (px+multi*py-mapSize.width/2-multi*tileSize.height/2)/(multi*tileSize.height);
        var n = (multi*py-px+mapSize.width/2-multi*tileSize.height/2)/(multi*tileSize.height);
        // cc.log(posInPixel.x, posInPixel.y, x, y, px, py, m, n);
        return cc.v2(m, n);
    }

    onCreateTileMap (url) {
        cc.loader.loadRes(url, cc.TiledMapAsset, (err, tmxAsset) => {
            if (err) {
                cc.error(err);
                return;
            }
            // this.mapRoot.destroyAllChildren();
            var node = new cc.Node();
            this.mapRoot.addChild(node);
            var tileMap = node.addComponent(cc.TiledMap);
            tileMap.tmxAsset = tmxAsset;
            this._tiledMap = tileMap;
            this._layerFloor = this._tiledMap.getLayer("floor");
            this._ndMap = node;
            // var mapSize = this._ndMap.getContentSize();
            // node.position.y = mapSize.height/2;
            // cc.log(mapSize, node);
            // this._ndMap.active = false;
            
            // this.ndPlayer.parent = node;
            // node.addChild(this.ndPlayer);
            // this.ndPlayer.zIndex = 1;
            // this.ndPlayer.position = cc.v2(2500, 25);
            // cc.log(this.ndPlayer);
        });
    }

    playTime(){
        var self = this;
        this._iTime = 0;
        this.labTime.node.active = true;
        this.coPlayTime = function (argument) {
            self.labTime.string = self.getStrTime(++self._iTime);
        }
        this.labTime.schedule(this.coPlayTime, 1);
    }

    getStrTime(iTime){
        var iM = Math.floor(iTime/60);
        var iS = iTime%60;
        var s = "";
        if (iM < 10) s = "0"+iM;
        else s = iM.toString();
        s += ":";
        if (iS < 10) s += "0"+iS;
        else s += iS.toString();
        return s;
    }
}
