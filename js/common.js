/**
 * Created by 付彩梅 on 2017/9/19.
 */
var winHeight = 0,
    mainWidth,
    mainHeight;

(function () {


    window.onload=function () {
        initialSize();
        initCalendar();
    };
    window.onresize=initialSize;

    // 1.对container高度初始化以及改变
    function initialSize() {
        if (window.innerHeight){
            winHeight = window.innerHeight;
        }else if ((document.body) && (document.body.clientHeight)){
            winHeight = document.body.clientHeight;
        }
        document.querySelector(".container").style.height = (winHeight-40)+"px";
        var c=document.querySelector("#mainContent");
        mainWidth = c.clientWidth;
        mainHeight = c.clientHeight;
    }

    //2.对右栏日历中的时间进行初始化
    function initCalendar() {
        showDate();
       setInterval(function () {
           showDate();
        },1000*10);
    }
    function showDate() {
        var d = new Date();
        var year = d.getFullYear(),
            month=d.getMonth()+1,
            day=d.getDate();
        document.querySelector(".year").innerText=year;
        document.querySelector(".month").innerText=month;
        document.querySelector(".day").innerText=day;
    }


})();
