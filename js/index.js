/*
* @����÷
* 2017.6.15
* */
//���ֿռ�ģ��
var app = {
    util:{},
    store:{}
};

//���߷���ģ��
app.util = {
    $:function (selector,node){
        return (node || document).querySelector(selector); /*����ƥ��ָ��ѡ�����ĵ�һ��Ԫ��*/
    },
    formatTime : function(ms){
        var d = new  Date(ms);
        var pad = function(s){
            if(s.toString().length===1){
                s = "0"+s;
            }
            return s;
        };
        var year = d.getFullYear();
        var month = d.getMonth()+1;
        var date = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        return year+"-"+pad(month)+"-"+pad(date)+" "+pad(hour)+":"+pad(minute)+":"+pad(second);
    }
};

//storeģ��
app.store = {
    __store_key:"__sticky_note__",
    get:function(id){
        var notes = this.getNotes();
        return notes[id] || {};
    },
    set:function(id,content){
        var notes = this.getNotes();
        if(notes[id]){
            Object.assign(notes[id],content);
        }else{
            notes[id] = content;
        }
        localStorage[this.__store_key] = JSON.stringify(notes);
        console.log("save note, id:"+id+"content:"+JSON.stringify(notes[id]));
    },
    getNotes:function(){
        return  JSON.parse(localStorage[this.__store_key] || '{}');

       // JSON.parse(localStorage[this.__store_key] || {} ) ;
    },
    remove :function(id){
        var notes = this.getNotes();
        delete notes[id];
        localStorage[this.__store_key] = JSON.stringify(notes);
    }
};

( function (util, store){
    var $ = util.$;
    var moveNote = null;
    var startX;
    var startY;
    var maxZIndex=0;

    var noteTpl = `
        <i class="u-close"></i>
        <div class="u-editor" contenteditable="true"></div>
        <div class="u-timestamp">
            <span>Update:</span>
            <span class="time">2017-06-14 15:35</span>
        </div>
    `;
    function Note(options){
        var note = document.createElement("div");
        note.className = "m-note";
        note.id =options.id || "m-note-"+Date.now();
        note.innerHTML = noteTpl;
        $(".u-editor",note).innerHTML = options.content || "";
        note.style.left= options.left+"px";
        note.style.top= options.top+"px";
        note.style.zIndex = options.zIndex;
        document.body.appendChild(note);
        this.note = note;
        this.updateTime(options.updateTime);
        //this.save();
        this.addEvent();//���ɵ�ʱ��������¼�
    }

    Note.prototype.updateTime= function(ms){
        var ts = $(".time",this.note);
        ms = ms || Date.now();
        ts.innerHTML = util.formatTime(ms);
        this.updateTimeInMs = ms;
    }

    Note.prototype.save = function(){
        store.set(this.note.id,{
            left:this.note.offsetLeft,
            top:this.note.offsetTop,
            zIndex:parseInt(this.note.style.zIndex),
            content:$(".u-editor",this.note).innerHTML,
            updateTime: this.updateTimeInMs
        });
    }

    Note.prototype.close = function(e){
        console.log("close note");
        document.body.removeChild(this.note);
    }
    Note.prototype.addEvent = function(){

        //��ǩ��mousedown�¼�
        var mousedownHander = function(e){
            moveNote = this.note;
            startX  = e.clientX-this.note.offsetLeft;
            //startX  = e.clientX-e.offsetX;
            startY= e.clientY-this.note.offsetTop;
           /* console.log(startX);
            console.log(startY);*/
            /*debugger*/
            if( (parseInt(this.note.style.zIndex))!== maxZIndex-1){
                this.note.style.zIndex = maxZIndex++;
                store.set(this.note.id,{
                    zIndex: maxZIndex
                });
            }
        }.bind(this);
        this.note.addEventListener("mousedown",mousedownHander);


        //��ǩ�������¼�
        var editor = $(".u-editor",this.note);
        var inputimer ;
         var inputHandler= function(e){
            var content = editor.innerHTML;
            clearTimeout(inputimer);
            inputimer = setTimeout(function(){
                var time = Date.now();
                store.set(this.note.id,{
                    content:content,
                    updateTime:time
                });
                this.updateTime(time);
            }.bind(this),300);

        }.bind(this);
        editor.addEventListener("input",inputHandler);

        //�رմ��������
        var closeBtn = $(".u-close",this.note);
        //����������Ŀ���ǵ���رպ��¼��Ƴ���
        var closeHander = function (e){
            store.remove(this.note.id);
            this.close(e);
            closeBtn.removeEventListener("click",closeHander);
            this.note.removeEventListener("mousedown",mousedownHander);
        }.bind(this);
        closeBtn.addEventListener("click",closeHander);



    };
    document.addEventListener("DOMContentLoaded",function(e){
        var mainWidth = $("#mainContent").clientWidth;

        $("#create").addEventListener("click",function(e){
            var note = new Note({
                left:Math.round(Math.random()*(mainWidth-220))+300,
                top:Math.round(Math.random()*(innerHeight-320))+40,
                zIndex: maxZIndex++

            });
            note.save();
        });
        //�ƶ�����\
        //var mouseTimer;
        function mousemoveHander(e){
         //  console.log(e);
            if(!moveNote){
                return;
            }
            var l =  e.clientX - startX,
                t=   e.clientY - startY;
            if( l>=300 && l<=(winWidth-300-220)){
                moveNote.style.left=l+"px";
            }
            if( t>=40 && t<=(winHeight-320)){
                moveNote.style.top=t+"px";
            }


        }
        function mouseupHander(e){
            if(!moveNote){
                return;
            }
            store.set(moveNote.id,{
               left: moveNote.offsetLeft,
                top:moveNote.offsetTop
            });
            moveNote=null;
        }
        document.addEventListener("mousemove",mousemoveHander);
        document.addEventListener("mouseup",mouseupHander);

        //��ʼ��notes
        var notes =store.getNotes();
        Object.keys(notes).forEach(function(id){
            var options = notes[id];
            if(maxZIndex<=options.zIndex){
                maxZIndex = options.zIndex;
            }
            new Note( Object.assign(options,{
                id:id
            })) ;
        });
        maxZIndex++;
    });
})(app.util,app.store);