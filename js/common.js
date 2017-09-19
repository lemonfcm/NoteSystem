/**
 * Created by 付彩梅 on 2017/9/19.
 */
var winHeight = 0,
    winWidth=0;

(function () {
    window.onload=initialSize;
    window.onresize=initialSize;
    function initialSize() {
        if (window.innerHeight){
            winHeight = window.innerHeight;
            winWidth=window.innerWidth;
        }else if ((document.body) && (document.body.clientHeight)){
            winHeight = document.body.clientHeight;
            winWidth = document.body.clientWidth;
        }
        document.querySelector(".container").style.height = (winHeight-40)+"px";

    }
})();
