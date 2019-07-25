const {ccclass, property} = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {

    @property(cc.Node)
    ndContent: cc.Node = null;

    @property(cc.Node)
    ndLoad: cc.Node = null;

    @property(cc.Label)
    labLoad: cc.Label = null;

    @property({
        type: cc.AudioClip
    })
    audioClick: cc.AudioClip = null;

    _iLv: number = 1;
    _videoAd: any;
    _bannerAd: any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
    }

    // update (dt) {}

    initCanvas(){
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
        
    }

    initEvent(){
        cc.find("share", this.node).on("click", function (argument) {
            this.playSound("click");
            this.onWxEvent("share");
        }, this);
        this.onWxEvent("initBanner");
        this.onWxEvent("initVideo");
    }

    initShow(){
        this.ndLoad.active = false;
        this.showScv();
    }

    onWxEvent(s){
        if (!CC_WECHATGAME) return;
        switch(s){
            case "initBanner":
                // if (this._bannerAd != null)
                //     this._bannerAd.destory();
                // var systemInfo = wx.getSystemInfoSync();
                // this._bannerAd = wx.createBannerAd({
                //     adUnitId: 'adunit-24778ca4dc4e174a',
                //     style: {
                //         left: 0,
                //         top: systemInfo.windowHeight - 144,
                //         width: 720,
                //     }
                // });
                // var self = this;
                // this._bannerAd.onResize(res => {
                //     if (self._bannerAd)
                //         self._bannerAd.style.top = systemInfo.windowHeight - self._bannerAd.style.realHeight;
                // })
                // this._bannerAd.show();
                // this._bannerAd.onError(err => {
                //   console.log(err);
                //   //无合适广告
                //   if (err.errCode == 1004){

                //   }
                // })
                break;
            case "initVideo":
                // this._videoAd = wx.createRewardedVideoAd({
                //     adUnitId: 'adunit-a7fcb876faba0c89'
                // });
                // this._videoAd.onClose(res => {
                //     if (res && res.isEnded || res === undefined){
                //         this.loadMusic();
                //     }else{

                //     }
                // });
                // this._videoAd.onError(err => {
                //   console.log(err)
                // });
                break;
            case "share":
                // var id = '' // 通过 MP 系统审核的图片编号
                // var url = '' // 通过 MP 系统审核的图片地址
                // wx.shareAppMessage({
                //     imageUrlId: id,
                //     imageUrl: url
                // })
                wx.shareAppMessage({
                    title: "你来挑战我啊！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    })
                });
                break;
            case "showVideo":
                // if (self._videoAd != null){
                //     self._videoAd.show()
                //     .catch(err => {
                //         self._videoAd.load()
                //         .then(() => self._videoAd.show())
                //     })
                // }
                break;
        }
    }

    showScv(){
        // cc.sys.localStorage.setItem("level", 1);
        var count = cc.sys.localStorage.getItem("level") || 1;
        cc.log("count = ", count);
        var children = this.ndContent.children;
        count = 6;
        for (let i = 0; i < 6; i++) {
            cc.find("play", children[i]).on("click", function (argument) {
                this.playSound("click");
                if (i < count){
                    this._iLv = i+1;
                    this.loadMusic();
                    // this.loadLvScene();
                } else {
                    this.onWxEvent("showVideo");
                }
            }, this);
        };
        // for (let i = 4; i < 6; i++) {
        //     this.playSound("click");
        //     cc.find("play", children[i]).on("click", function (argument) {
        //         this.onWxEvent("showVideo");
        //     }, this);
        // };
    }

    loadMusic(){
        this.ndLoad.active = true;
        this.labLoad.string = "下载中...";
        var remoteUrl = "http://47.111.184.119/MusicGame/Lv"+this._iLv+".mp3";
        if (!CC_WECHATGAME) {
            cc.loader.load({url: remoteUrl, type: "mp3"}, this.onProgress.bind(this), this.onComplete.bind(this));
        }else {
            let audio = wx.createInnerAudioContext();
            audio.src = remoteUrl;
            audio.onError((res)=>{
                console.log(res.errMsg);
                console.log(res.errCode);
            });
            audio.onCanplay(()=>{
                console.log("可以播放");
                this.labLoad.string = "下载完成";
                this.loadLvScene(audio);
            });
        }
    }

    onProgress(completedCount, totalCount){
        cc.log(completedCount, totalCount);
        // this.labLoad.string = (100*completedCount/totalCount).toString()+"%";
    }

    onComplete(err, res){
        if (err || !res){
            console.log(err);
            return;
        }
        this.labLoad.string = "下载完成";
        this.loadLvScene(res);
    }

    loadLvScene(res){
        var lv = this._iLv;
        cc.director.loadScene("Level", function (err, scene) {
            var obj = scene.getChildByName("Canvas").getComponent("Level");
            obj.audioTask = res;
            obj.iLv = lv;
            var url = 'map/Lv'+lv;
            // var url = "map/Lv"+this.iLv;
            obj.onCreateTileMap(url);
        });
    }

    playSound(sName){
        if (sName == "click") cc.audioEngine.play(this.audioClick, false, 1);
    }
}
