(function () {

    var Util=(function () {

        var prefix='html5_reader_';
        var storageGetter=function (key) {
            return localStorage.getItem(prefix+key);

        }


        var StorageSetter=function (key,val) {

            return localStorage.setItem(prefix+key,val);
        }

        var getBSONP=function(url,callback){
            return $.jsonp({
                url:url,
                cache:true,
                callback:'duokan_fiction_chapter',
                success:function(result){
                    var data=$.base64.decode(result);
                    var json=decodeURIComponent(escape(data));
                    callback(json);
                }
            })
        }

        return {

            getBSONP:getBSONP,
            storageGetter:storageGetter,
            StorageSetter:StorageSetter
        }




    })();




    var Dom={
        top_nav :$('#top-nav'),
        bottom_nav:$('.bottom-nav'),
        font_container:$('#font-container'),
        font_button:$('#font-button'),
    }

    var Win=$(window);
    var Doc=$(document);

    var rootContainer=$('#fiction_contsiner');
    var main_face=$('#main_face');

    var now_bk=Util.storageGetter('bk');
    var now_col=Util.storageGetter('col');

    var chapterTotla;
    var read;
    var  readUI
    main_face.css('background',now_bk);
    main_face.css('color',now_col);






    var  now_ft_sz=Util.storageGetter('font_size');
    now_ft_sz=parseInt(now_ft_sz);
    if (!now_ft_sz) {
        now_ft_sz=14;
    }



    function main() {

        read=readerModelpp();
        readUI=ReaderBaseFrame(rootContainer);
        read.init(function (data) {

            readUI(data);

        });
        EventHander();
    }

    function readerModelpp() {
        //数据交互

        var Chapter_id;
        var  init=function (UIcall) {
            getFictionInfo(function () {
                getCurChapterContent(Chapter_id,function (data) {

                    UIcall&&UIcall(data);

                });
            })
        }
        var getFictionInfo=function (callback) {
            $.get('data/chapter.json',function (data) {

                Chapter_id=Util.storageGetter('last',Chapter_id);
                if (Chapter_id==null){

                    Chapter_id=data.chapters[1].chapter_id;

                }
                chapterTotla=data.chapters.length;
                callback&&callback(data);


            },'json')
        }

        var getCurChapterContent=function (chapter_id,callback) {

            $.get('data/data'+chapter_id +'.json',function (data) {

                if (data.result==0){

                    var url=data.jsonp;
                    Util.getBSONP(url,function (data) {

                        callback&&callback(data);

                    });
                }

            },'json')


        }


        var prevChapter=function (call) {


            Chapter_id=parseInt(Chapter_id,10);
            if(Chapter_id==1){
                return;
            }
            Chapter_id-=1;
            getCurChapterContent(Chapter_id,call);
            Util.StorageSetter('last',Chapter_id);

        }

        var nextvChapter=function (call) {

            Chapter_id=parseInt(Chapter_id,10);
            if(Chapter_id==4){
                return;
            }
            Chapter_id+=1;
            getCurChapterContent(Chapter_id,call);
            Util.StorageSetter('last',Chapter_id);


        }


        return{
            init:init,
            prevChapter:prevChapter,
            nextvChapter:nextvChapter,
        }
    }

    function ReaderBaseFrame(container) {

        //渲染基本UI结构
        function parseChapterData (jsonData){

            var jsonObj=JSON.parse(jsonData);
            var html='<h4>'+jsonObj.t+'</h4>';


            for(var i=0;i<jsonObj.p.length;i++)
            {
                html+='<p>'+jsonObj.p[i]+'</p>';

                // console.log(jsonObj.p[i]);
            }
            return html;

        }
        return function (data) {

            container.html(parseChapterData(data));


        }


    }

    function EventHander() {


        $('#prev_button').click(function () {

            //获得章节的翻页数据

            read.prevChapter(function (data) {
                readUI(data);


            });
        })


        $('#next_button').click(function () {

            //获得章节的翻页数据


            read.nextvChapter(function (data) {
                readUI(data);


            });
        })

        //交互的事件绑定
        $('#action-mid').click(function () {

            if (Dom.top_nav.css('display')=='none'){

                Dom.top_nav.show();
                Dom.bottom_nav.show();

            }else
            {
                Dom.top_nav.hide();
                Dom.bottom_nav.hide();
                Dom.font_container.hide();

            }

        });


       Dom.font_button.click(function () {

            if (Dom.font_container.css('display')=='none'){

                Dom.font_container.show();
                $("#icon-ft").addClass('icon-ft-block');

            }else
            {
                Dom.font_container.hide();
                $("#icon-ft").removeClass('icon-ft-block');

            }

        });

        Win.scroll(function () {

            Dom.top_nav.hide();
            Dom.bottom_nav.hide();
            Dom.font_container.hide();

        });

        $("#night-button").click(function(){

            if ($("#day-icon").css("display")=="none") {
                $("#night-icon").css("display","none");
                $("#day-icon").css("display","block");
                main_face.css('background','#0f1410');
                main_face.css('color','#4e534f');
                $('#yejian').css('border','2px solid #ff7800');
                $('.bk-container-current').not('#yejian').css('border','2px solid #000');
            }else{
                $("#night-icon").css("display","block");
                $("#day-icon").css("display","none");
                main_face.css('background','#e9dfc7');
                $('#zhizhang').css('border','2px solid #ff7800');
                $('.bk-container-current').not('#zhizhang').css('border','2px solid #000');
            }
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));
        })

        //字体变大
        $("#large-font").click(function(){
            if(now_ft_sz>20){
                now_ft_sz=20;
            }
            now_ft_sz+=1;

            $('#fiction_contsiner').css("font-size",now_ft_sz+"px");
            Util.StorageSetter('font_size',now_ft_sz);
        })

        $("#small-font").click(function(){
            now_ft_sz-=1;
            if(now_ft_sz<12){
                now_ft_sz=12;
            }
            $('#fiction_contsiner').css("font-size",now_ft_sz+"px");
            Util.StorageSetter('font_size',now_ft_sz);
        })

        $('#mibai').click(function () {

            main_face.css('background','#f7eee5');
            $(this).css('border','2px solid #ff7800');
            $('.bk-container-current').not('#mibai').css('border','2px solid #000');
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));

        })

        $('#zhizhang').click(function(){
            main_face.css('background','#e9dfc7');
            $(this).css('border','2px solid #ff7800');
            $('.bk-container-current').not('#zhizhang').css('border','2px solid #000');
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));
        })
        $('#qianhui').click(function(){
            main_face.css('background','#a4a4a4');
            $(this).css('border','2px solid #ff7800');
            $('.bk-container-current').not('#qianhui').css('border','2px solid #000');
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));
        })
        $('#huyan').click(function(){
            main_face.css('background','#cdefce');
            $(this).css('border','2px solid #ff7800');
            $('.bk-container-current').not('#huyan').css('border','2px solid #000');
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));
        })
        $('#huilan').click(function(){
            main_face.css('background','#283548');
            main_face.css('color','#7685a2');
            $(this).css('border','2px solid #ff7800');
            $('.bk-container-current').not('#huilan').css('border','2px solid #000');
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));
        })
        $('#yejian').click(function(){
            main_face.css('background','#0f1410');
            main_face.css('color','#4e534f');
            $(this).css('border','2px solid #ff7800');
            $('.bk-container-current').not('#yejian').css('border','2px solid #000');
            Util.StorageSetter('bk',main_face.css('background'));
            Util.StorageSetter('col',main_face.css('color'));
            $("#night-icon").css("display","none");
            $("#day-icon").css("display","block");
        })


    }

    main();

})();