/*
 * @付彩梅
 * 2017.6.15
 * */
//名字空间模块
var app = {
    util: {},
    store: {}
};

//工具方法模块
app.util = {
    $: function(selector, node) {
        return (node || document).querySelector(selector); /*返回匹配指定选择器的第一个元素*/
    },
    formatTime: function(ms) {
        var d = new Date(ms);
        var pad = function(s) {
            if (s.toString().length === 1) {
                s = "0" + s;
            }
            return s;
        };
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var date = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        return year + "-" + pad(month) + "-" + pad(date) + " " + pad(hour) + ":" + pad(minute) + ":" + pad(second);
    }
};

//store模块
app.store = {
    __store_key: "__sticky_note__",
    get: function(id) {
        var notes = this.getNotes();
        return notes[id] || {};
    },
    set: function(id, content) {
        var notes = this.getNotes();
        if (notes[id]) {
            Object.assign(notes[id], content);
        } else {
            notes[id] = content;
        }
        localStorage[this.__store_key] = JSON.stringify(notes);
        // console.log("save note, id:"+id+"content:"+JSON.stringify(notes[id]));
    },
    getNotes: function() {
        return JSON.parse(localStorage[this.__store_key] || '{}');

        // JSON.parse(localStorage[this.__store_key] || {} ) ;
    },
    remove: function(id) {
        var notes = this.getNotes();
        delete notes[id];
        localStorage[this.__store_key] = JSON.stringify(notes);
    },
    delAll:function(){
        localStorage[this.__store_key] ="";
    }
};

(function(util, store) {
    var $ = util.$;
    var moveNote = null;
    var startX;
    var startY;
    var maxZIndex = 0;

    var noteTpl = `
        <div class="u-operator">
            <div class="flex-item"><i class="iconfont icon-guanbi u-close"></i></div>
            <div class="flex-item"><i class="iconfont icon-color u-changeColor"></i></div>
            <div class="flex-item"><i class="iconfont icon-delete u-delete"></i></div>
        </div>
        <div class="u-editor" contenteditable="true"></div>
        <div class="u-timestamp">
            <span>Update:</span>
            <span class="time">2017-06-14 15:35</span>
        </div>
    `;

    function Note(options) {
        var note = document.createElement("div");
        note.className = "m-note";
        note.id = options.id || "m-note-" + Date.now();
        note.innerHTML = noteTpl;
        $(".u-editor", note).innerHTML = options.content || "";
        note.style.backgroundColor = options.color || "#cf0";
        $(".u-timestamp", note).style.backgroundColor = options.timeColor || "#cc3";
        $(".u-operator", note).style.backgroundColor = options.timeColor || "#cc3";
        note.style.left = options.left + "px";
        note.style.top = options.top + "px";
        note.style.zIndex = options.zIndex;
        // document.body.appendChild(note);
        document.getElementById("mainContent").appendChild(note);
        this.note = note;
        this.updateTime(options.updateTime);
        //this.save();
        this.addEvent(); //生成的时候先添加事件
    }

    Note.prototype.updateTime = function(ms) {
        var ts = $(".time", this.note);
        ms = ms || Date.now();
        ts.innerHTML = util.formatTime(ms);
        this.updateTimeInMs = ms;
    }

    Note.prototype.save = function() {
        store.set(this.note.id, {
            left: this.note.offsetLeft,
            top: this.note.offsetTop,
            color: $(".u-editor", this.note).style.backgroundColor,
            timeColor: $(".u-timestamp", this.note).style.backgroundColor,
            zIndex: parseInt(this.note.style.zIndex),
            content: $(".u-editor", this.note).innerHTML,
            updateTime: this.updateTimeInMs
        });
    }

    Note.prototype.close = function(e) {
        // console.log("close note");
        $("#mainContent").removeChild(this.note);
    };
    Note.prototype.addEvent = function() {

        //便签的mousedown事件
        var mousedownHander = function(e) {
            moveNote = this.note;
            startX = e.clientX - this.note.offsetLeft;
            startY = e.clientY - this.note.offsetTop;
            if ((parseInt(this.note.style.zIndex)) !== maxZIndex - 1) {
                this.note.style.zIndex = maxZIndex++;
                store.set(this.note.id, {
                    zIndex: maxZIndex
                });
            }
        }.bind(this);
        this.note.addEventListener("mousedown", mousedownHander);



        var editor = $(".u-editor", this.note);


        //便签的输入事件
        var inputimer;
        var inputHandler = function(e) {
            var content = editor.innerHTML;
            clearTimeout(inputimer);
            inputimer = setTimeout(function() {
                var time = Date.now();
                store.set(this.note.id, {
                    content: content,
                    updateTime: time
                });
                this.updateTime(time);
            }.bind(this), 300);
        }.bind(this);
        editor.addEventListener("input", inputHandler);


        var closeBtn = $(".u-close", this.note),
            deleteBtn = $(".u-delete", this.note),
            changeColorBtn = $(".u-changeColor", this.note);


        //关闭一个便签，从页面上删除，但不删除本地的数据
        var closeHander = function(e) {
            this.close(e);
            //这样子做的目的是点击关闭后事件移除掉
            closeBtn.removeEventListener("click", closeHander);
            deleteBtn.removeEventListener("click", deleteHander);
            changeColorBtn.removeEventListener("click", changeColorHander);
            this.note.removeEventListener("mousedown", mousedownHander);
        }.bind(this);
        closeBtn.addEventListener("click", closeHander);

        // 删除，从页面上删除，且删除本地的数据
        var deleteHander = function(e) {
            store.remove(this.note.id);
            this.close(e);
            closeBtn.removeEventListener("click", closeHander);
            deleteBtn.removeEventListener("click", deleteHander);
            changeColorBtn.removeEventListener("click", changeColorHander);
            this.note.removeEventListener("mousedown", mousedownHander);
        }.bind(this);
        deleteBtn.addEventListener("click", deleteHander);

        //给便签更改颜色
        var ucolors = ["rgb(204, 255, 0)", "rgb(51, 255, 255)", "rgb(51, 255, 51)", "rgb(204, 51, 255)", "rgb(255, 0, 0)"],
            timecolors = ["rgb(204,204,51)", "rgb(51, 204, 204)", "rgb(51, 204, 0)", "rgb(204, 0, 204)", "rgb(204, 51, 51)"],
            colorLength = ucolors.length;
        var changeColorHander = function(e) {
            var index = ucolors.indexOf(this.note.style.backgroundColor);
            index = (index === colorLength - 1) ? (0) : (++index);
            this.note.style.backgroundColor = ucolors[index];
            $(".u-timestamp", this.note).style.backgroundColor = timecolors[index];
            $(".u-operator", this.note).style.backgroundColor = timecolors[index];
            var time = Date.now();
            this.updateTime(time);
            store.set(this.note.id, {
                timeColor: timecolors[index],
                color: ucolors[index],
                updateTime: time
            });
        }.bind(this);
        changeColorBtn.addEventListener("click", changeColorHander);


    };
    document.addEventListener("DOMContentLoaded", function(e) {
        $("#create").addEventListener("click", function(e) {
            var note = new Note({
                left: Math.round(Math.random() * (mainWidth - 220)),
                top: Math.round(Math.random() * (mainHeight - 320)),
                zIndex: maxZIndex++
            });
            note.save();
        });
        $("#delAll").addEventListener("click", function(e) {
            $("#mainContent").innerHTML="";
            store.delAll();
        });
        //移动监听\
        //var mouseTimer;
        function mousemoveHander(e) {
            //  console.log(e);
            if (!moveNote) {
                return;
            }
            var l = e.clientX - startX,
                t = e.clientY - startY;
            if (l > 0 && l <= (mainWidth - 220)) {
                moveNote.style.left = l + "px";
            }
            if (t > 0 && t <= (mainHeight - 320)) {
                moveNote.style.top = t + "px";
            }
        }

        function mouseupHander(e) {
            if (!moveNote) {
                return;
            }
            store.set(moveNote.id, {
                left: moveNote.offsetLeft,
                top: moveNote.offsetTop
            });
            moveNote = null;
        }
        document.addEventListener("mousemove", mousemoveHander);
        document.addEventListener("mouseup", mouseupHander);

        //初始化notes
        var notes = store.getNotes();
        Object.keys(notes).forEach(function(id) {
            var options = notes[id];
            if (maxZIndex <= options.zIndex) {
                maxZIndex = options.zIndex;
            }
            new Note(Object.assign(options, {
                id: id
            }));
        });
        maxZIndex++;
    });
})(app.util, app.store);