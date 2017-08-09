//var DISCUSS_URL = "http://discuss5.blogcore.cn/";
//var UC_URL = "http://uc5.blogcore.cn/";
if(document.domain.split('.')[1] == 'blogchina') {
    var UC_URL = "http://post.blogchina.com/";
    var DISCUSS_URL = "http://discuss5.blogchina.com/";
    var BCDNS = 'http://bcdn5.blogchina.com/';
    var DOMAIN = 'blogchina.com';
} else {
    var UC_URL = "http://uc5.blogcore.cn/";
    var DISCUSS_URL = "http://discuss5.blogcore.cn/";
    var DOMAIN = 'blogchina.com';
    var BCDNS = 'http://bcdn5.blogcore.cn/';
}

;(function(){
    var discuss = {
        init: function ()
        {
            this.enterType();
            this.closeSign();
            this.watLogin();
            this.toScroll();
            var that = this;
            var aid = $.trim($('#show_discuss').data('aid'));
            if(isNaN(aid)){
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '输入有效的文章id！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                return false;
            }
            var title       = $.trim($('#show_discuss').data('title'));
            var author_id   = $.trim($('#show_discuss').data('author-id'));
            if(isNaN(author_id)){
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '输入有效的作者id！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                return false;
            }
            $.get(DISCUSS_URL+'discuss',function(data){
                $('#show_discuss').append(data);
            }).done(function(){
                that.addArticleUrl();
                $('.comment_header').hide();
                $('#new_comment').children("input[name='aid']").val(aid);
                $('#new_comment').children("input[name='author_id']").val(author_id);
                $('#new_comment').children("input[name='title']").val(title);
                $.when(that.firstLoad()).done(function(data){
                    that.showAllDiscuss(aid, data);
                });
                that.clearPlaceholder();
            });
        },
        showAllDiscuss: function(aid, cookie_user_id)
        {
            var that = this;
            $.ajax({
                url:DISCUSS_URL+'discuss/'+aid,
                type:'get',
                dataType:'json',
                // jsonpCallback:'callback',
                beforeSend:function(){
                    $('.comment_header.qb').show();
                    $('.comment_header.qb').after('<div id="loading"></div>');
                    $('#loading').css('position', 'relative');
                    $('#loading').append(new Spinner().spin().el);
                },
                success:function(result){
                    if(result.meta.code == 200){
                        if(cookie_user_id > 0){
                            var userinfo = JSON.parse(that.getCookie('BC_JS_'+cookie_user_id+'_UI'));
                            if(userinfo.anonymous.length > 0){
                                $.each(userinfo.anonymous, function(i,ele){
                                    $('#new_comment').find('.dropdown-menu.nick').append('<li id="select_nick">'+ele+'</li>');
                                });
                            }
                        }
                        if(result.data.length > 0){
                            $('.comment_list').show();
                            var count = 0;
                            var like_first_num = 0, like_second_num = 0, like_third_num = 0;
                            var rm_first_did = 0, rm_second_did = 0, rm_third_did = 0;
                            var li = $(".comment_list.qblist").children('.note-comment');
                            $(".comment_list.qblist").children('.note-comment').remove();
                            $.each(result.data,function(i, e){
                                count++;
                                var timeValue = that.timeValue(e.discuss.add_time*1000);
                                //追加楼层
                                var html = '<div class="note-comment" id="li_'+e.discuss.did+'" data-post-id="'+e.discuss.did+'">';
                                html += li.html()+'</div>';
                                $(".comment_list.qblist").prepend(html);
                                var qb_comment = $('.comment_list.qblist').children('.note-comment').eq(0);
                                qb_comment.find('.author-name').html(e.discuss.user.nick);
                                if(e.discuss.anonymous != 'y'){
                                    if(e.discuss.user.group_id != 200){
                                        qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                                    }else{
                                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'http://'+e.discuss.user.name+'.'+DOMAIN);
                                        qb_comment.find('.media-head.pull-left').children('a').append('<span title="专栏作家" class="V_king V_king_s"><img src="'+BCDNS+'images/kings.png" alt=""></span>');
                                        qb_comment.find('.media-heading').children('.author-name').attr('href', 'http://'+e.discuss.user.name+'.'+DOMAIN);
                                        qb_comment.find('.media-heading').children('.author-name').prepend('<img class="V_king_line" src="'+BCDNS+'images/kingl.png" alt="">');
                                    }
                                }else{
                                    qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                                }
                                if(e.discuss.user.avatar === ''){
                                    var firstStr = e.discuss.user.nick.substr(0, 1);
                                    var color = that.getAvatarColor(e.discuss.user.user_id);
                                    qb_comment.find('.media-head.pull-left').children('a').children('.s').html(firstStr);
                                    qb_comment.find('.media-head.pull-left').children('a').children('.s').css('background-color', color);
                                    qb_comment.find('.media-head.pull-left').children('a').children('img').hide();
                                    qb_comment.find('.media-head.pull-left').children('a').children('.s').show();
                                }else{
                                    if(e.discuss.user.avatar.indexOf('avatar.blogchina') >= 0){
                                        qb_comment.find('.media-head.pull-left').children('a').children('img').attr('src', e.discuss.user.avatar+'!middle');
                                    }else{
                                        qb_comment.find('.media-head.pull-left').children('a').children('img').attr('src', e.discuss.user.avatar);
                                    }
                                    qb_comment.find('.media-head.pull-left').children('a').children('img').show();
                                    qb_comment.find('.media-head.pull-left').children('a').children('.s').hide();
                                }
                                qb_comment.find('.author-name').data('user-id', e.discuss.user.user_id);
                                qb_comment.find('.reply-time').children('small').html((i+1)+'楼');
                                qb_comment.find('.reply-time').children('a').eq(0).html(timeValue);
                                if(e.discuss.status == 'delete' || e.discuss.status == 'spam'){
                                    qb_comment.find('.media-body').children('p').html(that.roundComment());
                                    qb_comment.find('.media-body').children('p').attr('attribute', 'attribute');
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('#to_like').hide();
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('#new_replay').html('');
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_delete').remove();
                                }else{
                                    qb_comment.find('.media-body').children('p').html(that.replaceEm(that.replaceSpecialStr(e.discuss.body)));
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('#to_like').show();
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.like').children('span').html(e.discuss.like.total);
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.like').data('like-user', e.discuss.like.user_ids);
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.like').data('did', e.discuss.did);
                                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.like').children('.fa.fa-heart-o').css('color','');
                                    if(cookie_user_id > 0){
                                        $.each(e.discuss.like.user_ids, function(l, n) {
                                            if(n == cookie_user_id){
                                                qb_comment.find('.media-body').children('.comment-footer.text-right').children('.like').children('.fa.fa-heart-o').css('color','red');
                                            }
                                        });
                                    }
                                    
                                    if(cookie_user_id != e.discuss.user.user_id){
                                        qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_delete').remove();
                                    }
                                    if(qb_comment.find('.media-body').children('.comment-footer.text-right').children('#new_replay').html() === ''){
                                        qb_comment.find('.media-body').children('.comment-footer.text-right').children('#new_replay').html('回复');
                                    }
                                }
                                var listCount = 0;
                                $.each(e.discuss.fids,function(k,v){
                                    if(k > 0){
                                        listCount++;
                                        appendList = $(".comment_list.qblist").children('.note-comment').eq(0).find('.child-comment').eq(0).clone();
                                        var aFirst =    appendList.find('p').children('a').eq(0);
                                        var spanFirst = appendList.find('p').children('span').eq(0);
                                        //var aSecond =   appendList.find('p').children('a').eq(1);
                                        appendList.attr('id','c_'+v);
                                        appendList.data('did',v);
                                        aFirst.attr('href', $('#li_'+v).find('.media-heading').children('a').attr('href'));
                                        aFirst.html($('#li_'+v).find('.author-name').html());
                                        aFirst.data('user-id',e.discuss.user.user_id);
                                        //aSecond.html($(e).closest('.note-comment').find('.author-name').html());
                                        appendList.find('p').empty();
                                        appendList.find('p').append(aFirst);
                                        appendList.find('p').append(spanFirst);
                                        //appendList.find('p').append(aSecond);
                                        appendList.find('p').append($('#li_'+v).find('.media-body').children('p').html());
                                        appendList.find('.reply-time.pull-left').children('a').eq(0).html($('#li_'+v).find('.reply-time').children('a').html());
                                        if($('#li_'+v).find('.media-body').children('p').attr('attribute') == 'attribute'){
                                            appendList.find('.reply-time.pull-left').children('#to_like').remove();
                                            appendList.find('#new_replay').html('');
                                        }else{
                                            appendList.find('.reply-time.pull-left').children('a').eq(1).children('span').html($('#li_'+v).find('.comment-footer.text-right').children('a').eq(0).children('span').html());
                                            appendList.find('.reply-time.pull-left').children('a').eq(1).data('did', $('#li_'+v).data('post-id'));
                                            appendList.find('.reply-time.pull-left').children('a').eq(1).data('like-user', $('#li_'+v).find('.comment-footer.text-right').children('a').eq(0).data('like-user'));
                                            // if($('#li_'+v).find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html() > 0){
                                            //     appendList.find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color','red');
                                            // }else{
                                            //     appendList.find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color','');
                                            // }
                                            appendList.find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color','');
                                            if(cookie_user_id > 0){
                                                $.each(e.discuss.like.user_ids, function(l, n) {
                                                    if(n == cookie_user_id){
                                                        appendList.find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color','red');
                                                    }
                                                });
                                            }
                                        }
                                        if($('#li_'+v).find('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                                            appendList.find('.child-comment-footer.text-right').children('.report_delete').remove();
                                        }
                                        qb_comment.find('.child-comment-list').children('.comment-toolbar').before(appendList);
                                    }
                                });
                                if(listCount > 3){
                                    qb_comment.find('.child-comment-list').children('.comment-toolbar').find('.count').html(listCount-3);
                                    qb_comment.find('.child-comment').eq(3).nextAll('.child-comment').hide();
                                    qb_comment.find('.child-comment-list').children('.comment-toolbar').show();
                                }else{
                                    qb_comment.find('.comment-toolbar').hide();
                                }
                                if(e.discuss.fids.length > 1){
                                    qb_comment.find('.child-comment').eq(0).remove();
                                    qb_comment.find('.child-comment-list').show();
                                }
                                if(e.discuss.like.total >= like_first_num && e.discuss.like.total > 0 && e.discuss.status != 'delete' && e.discuss.status != 'spam'){
                                    like_third_num = like_second_num;
                                    rm_third_did = rm_second_did;
                                    like_second_num = like_first_num;
                                    rm_second_did = rm_first_did;
                                    like_first_num = e.discuss.like.total;
                                    rm_first_did = e.discuss.did;
                                }else if(e.discuss.like.total >= like_second_num && e.discuss.like.total > 0 && e.discuss.status != 'delete' && e.discuss.status != 'spam'){
                                    like_third_num = like_second_num;
                                    rm_third_did = rm_second_did;
                                    like_second_num = e.discuss.like.total;
                                    rm_second_did = e.discuss.did;
                                }else if(e.discuss.like.total >= like_third_num && e.discuss.like.total > 0 && e.discuss.status != 'delete' && e.discuss.status != 'spam'){
                                    like_third_num = e.discuss.like.total;
                                    rm_third_did = e.discuss.did;
                                }
                            });
                            var rm_comment = $('.comment_list.rmlist').children('.note-comment').length;
                            if(like_first_num > 0){
                                $('.comment_list.rmlist').append($('#li_'+rm_first_did).clone());
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).data('post-id', $('.comment_list.qblist').children('#li_'+rm_first_did).data('post-id'));
                                var up_rm_first_did = $('.comment_list.qblist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('did');
                                var up_rm_like_first_user = $('.comment_list.qblist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('like-user');
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('did', up_rm_first_did);
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('like-user', up_rm_like_first_user);
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).find('.child-comment').each(function(rmk1, rmv1){
                                    $(rmv1).data('did', $('.comment_list.qblist').children('#li_'+rm_first_did).find('.child-comment').eq(rmk1).data('did'));
                                    var rm_first_cid = $(rmv1).attr('id');
                                    var rm_first_data_did = $('.comment_list.qblist').children('#li_'+rm_first_did).find('#'+rm_first_cid).find('#to_like').data('did');
                                    var rm_first_like_user = $('.comment_list.qblist').children('#li_'+rm_first_did).find('#'+rm_first_cid).find('#to_like').data('like-user');
                                    $(rmv1).find('#to_like').data('did', rm_first_data_did);
                                    $(rmv1).find('#to_like').data('like-user', rm_first_like_user);
                                });
                            }
                            if(like_second_num > 0){
                                $('.comment_list.rmlist').append($('#li_'+rm_second_did).clone());
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).data('post-id', $('.comment_list.qblist').children('#li_'+rm_second_did).data('post-id'));
                                var up_rm_second_did = $('.comment_list.qblist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('did');
                                var up_rm_like_second_user = $('.comment_list.qblist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('like-user');
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('did', up_rm_second_did);
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('like-user', up_rm_like_second_user);
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).find('.child-comment').each(function(rmk2, rmv2){
                                    $(rmv2).data('did', $('.comment_list.qblist').children('#li_'+rm_second_did).find('.child-comment').eq(rmk2).data('did'));
                                    var rm_sescond_cid = $(rmv2).attr('id');
                                    var rm_second_data_did = $('.comment_list.qblist').children('#li_'+rm_second_did).find('#'+rm_sescond_cid).find('#to_like').data('did');
                                    var rm_second_like_user = $('.comment_list.qblist').children('#li_'+rm_second_did).find('#'+rm_sescond_cid).find('#to_like').data('like-user');
                                    $(rmv2).find('#to_like').data('did', rm_second_data_did);
                                    $(rmv2).find('#to_like').data('like-user', rm_second_like_user);
                                });
                            }
                            if(like_third_num > 0){
                                $('.comment_list.rmlist').append($('#li_'+rm_third_did).clone());
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).data('post-id', $('.comment_list.qblist').children('#li_'+rm_third_did).data('post-id'));
                                var up_rm_third_did = $('.comment_list.qblist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('did');
                                var up_rm_like_third_user = $('.comment_list.qblist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('like-user');
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('did', up_rm_third_did);
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('like-user', up_rm_like_third_user);
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).find('.child-comment').each(function(rmk3, rmv3){
                                    $(rmv3).data('did', $('.comment_list.qblist').children('#li_'+rm_third_did).find('.child-comment').eq(rmk3).data('did'));
                                    var rm_third_cid = $(rmv3).attr('id');
                                    var rm_third_data_did = $('.comment_list.qblist').children('#li_'+rm_third_did).find('#'+rm_third_cid).find('#to_like').data('did');
                                    var rm_third_like_user = $('.comment_list.qblist').children('#li_'+rm_third_did).find('#'+rm_third_cid).find('#to_like').data('like-user');
                                    $(rmv3).find('#to_like').data('did', rm_third_data_did);
                                    $(rmv3).find('#to_like').data('like-user', rm_third_like_user);
                                });
                            }
                            if(rm_comment > 0){
                                $('.comment_list.rmlist').children('.note-comment').eq(rm_comment).prevAll().remove();
                            }
                            if(like_first_num <= 0){
                                $('.comment_header.rm').hide();
                                $('.comment_list.rmlist').hide();
                            }else{
                                $('.comment_header.rm').show();
                                $('.comment_list.rmlist').show();
                            }
                            $('#commentCount').html(count);
                            if($(".comment_list.qblist").children('.note-comment').length > 10){
                                $('.loading-more').find('span').html(count-10);
                                $(".comment_list.qblist").children('.note-comment').eq(9).nextAll('.note-comment').hide();
                                $('.loading-more-no').hide();
                            }else{
                                $('.loading-more-no').show();
                                $('.comment_list.qblist > .note-comment').last().css('border-bottom', 0);
                            }
                        }else{
                            $('.comment_header').hide();
                        }
                        that.loadOverJs();
                    }else{
                        $('.comment_header').hide();
                    }
                },
                complete:function(){
                    $('#loading').remove();
                    $(".comment_list.qblist").css('height', '');
                }
            });
        },

        toScroll: function(){
            $(window).scroll(function(){
                var $currentWindow = $(window);
                //当前窗口的高度  
                var windowHeight = $currentWindow.height();
                //当前滚动条从上往下滚动的距离  
                var scrollTop = $currentWindow.scrollTop();
                //当前文档的高度  
                var docHeight = $(document).height();
      
                //当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度  
                //换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式  
                if (scrollTop >= docHeight - windowHeight) {
                    var show_count = 0;
                    $('.comment_list.qblist > .note-comment').each(function(i, e){
                        if($(e).is(':visible')){
                            show_count ++;
                        }
                    });
                    var count = $('#commentCount').html() - 0;
                    if(count - show_count > 0){
                        if(count - show_count > 10){
                            $('.comment_list.qblist > .note-comment').eq(show_count + 9).prevAll('.note-comment').show();
                        }else{
                            $('.comment_list.qblist > .note-comment').show();
                            $('.comment_list.qblist').find('.loading-more-no').show();
                            $('.comment_list.qblist > .note-comment').last().css('border-bottom', 0);
                        }
                    }else{
                        return false;
                    }
                }
            });
        },

        loadJs: function(path){
            if(!path || path.length === 0){
                throw new Error('argument "path" is required !');
            }
            var ds = document.createElement('script');
            ds.type = 'text/javascript';
            ds.src = path;
            ds.charset = 'UTF-8';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ds);
        },
        loadCss: function(path)
        {
            if(!path || path.length === 0){
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = path;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        },
        timeValue: function(time)
        {
            if(time === 0){
                var date = new Date();
            }else{
                var date = new Date(time);
            }
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var timeValue = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+' ';
            timeValue += hours;
            timeValue += ((minutes < 10) ? ":0" : ":") + minutes;
            timeValue += ((seconds < 10) ? ":0" : ":") + seconds;
            return timeValue;
        },
        releaseTime: function(time)
        {
            var dateTime = parseInt(new Date().getTime()/1000);
            if(dateTime-time < 60){
                return dateTime-time+'秒前';
            }else if(dateTime-time < 3600){
                return parseInt((dateTime-time)/60)+'分钟前';
            }else if(dateTime-time < 86400){
                return parseInt((dateTime-time)/3600)+'小时前';
            }else{
                var mouth = new Date(time*1000).getMonth()+1;
                var day = new Date(time*1000).getDate();
                return mouth+'月'+day+'日';
            }
        },
        submitInfo: function()
        {
            var that = discuss;
            var e = this;
            var token = '';
            var form = $(e).closest('form');
            var aid = $.trim(form.children("input[name='aid']").val());
            var author_id = $.trim(form.children("input[name='author_id']").val());
            var title = $.trim(form.children("input[name='title']").val());
            var fid = $.trim(form.children("input[name='fid']").val());
            var anonymous = $.trim(form.children("input[name='anonymous']").val());
            var body = $.trim(form.find("textarea").val());
            body = that.replaceHtmlStr(body);
            var user_id = $.trim($('#new_comment').children("input[name='user_id']").val());
            form.find("textarea").val('');
            var url = window.location.href;
            var at = 'n';
            var nick = $.trim($('.me_nicheng').children('.myname').text());
            var name = $.trim($('.me_nicheng').children('.myname').data('name'));
            var avatar = $.trim($('.me_nicheng').children('a').children('img').attr('src'));
            if(user_id <= 0){
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '请先登录！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                $('#dlModal').show();
                $('.me_nicheng').hide();
                return false;
            }
            var userinfo = JSON.parse(that.getCookie('BC_JS_'+user_id+'_UI'));
            if(anonymous == 'y'){
                nick = $.trim($(e).siblings('.majia.pull-left').find('.dropdown-toggle.majiaon').val());
                nick = that.removeHtmlStr(nick);
                var anonymousNickArray = userinfo.anonymous;
                var nick_avatar = that.getNickAvatar(user_id);
                avatar = BCDNS+'images/'+nick_avatar;
                if(anonymousNickArray.length > 0){
                    var status = 0;
                    for(var i = 0; i < anonymousNickArray.length; i++){
                        if(nick == anonymousNickArray[i]){
                            status = 1;
                        }
                    }
                    if(status == 0){
                        if(anonymousNickArray.length < 10){
                            anonymousNickArray.unshift(nick);
                        }else{
                            anonymousNickArray.pop();
                            anonymousNickArray.unshift(nick);
                        }
                        $('#new_comment').find('.dropdown-menu.nick').prepend('<li id="select_nick">'+nick+'</li>');
                    }
                }else{
                    anonymousNickArray.unshift(nick);
                    $('#new_comment').find('.dropdown-menu.nick').prepend('<li id="select_nick">'+nick+'</li>');
                }

                var value = '{"name": "'+userinfo.name+'", "avatar": "'+userinfo.avatar+'", "anonymous": '+JSON.stringify(anonymousNickArray)+'}';
                that.setCookie('BC_JS_'+user_id+'_UI', value, 90);
            }
            var timeValue = that.timeValue(0);
            var count = $('#commentCount').html();
            if(body.length <= 0){
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '请输入评论内容！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                return false;
            }
            $('comment_header').show();
            var like_user = new Array();
            $('.comment_header.qb').show();
            $('#saytext').val('');
            count = parseInt(count) + 1;
            var qb_comment = $('.comment_list.qblist').children('.note-comment').eq(0);
            if($(e).closest('form').hasClass('new_comment')){
                if(qb_comment.attr('id') == ''){
                    qb_comment.find('.author-name').html(nick);
                    if(qb_comment.find('.media-head.pull-left').children('a').children('.V_king').length > 0){
                        qb_comment.find('.media-head.pull-left').children('a').children('.V_king').remove();
                    }
                    if(anonymous == 'n'){
                        if(name != 'anonymous'){
                            qb_comment.find('.media-head.pull-left').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                            qb_comment.find('.media-heading').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                            if($('.me_nicheng').children('a').children('.V_king').length > 0){
                                qb_comment.find('.author-name').prepend('<img class="V_king_line" src="'+BCDNS+'images/kingl.png" alt="">');
                                qb_comment.find('.media-head.pull-left').children('a').append('<span title="专栏作家" class="V_king V_king_s"><img src="'+BCDNS+'images/kings.png" alt=""></span>');
                            }
                        }else{
                            qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                            qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                            qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                        }
                    }else{
                        qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                        qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                    }
                    if(avatar === ''){
                        qb_comment.find('.media-object.media_img').hide();
                        qb_comment.find('.media-object.media_img').next('.s').html($('.me_nicheng').children('a').children('.s').html());
                        qb_comment.find('.media-object.media_img').next('.s').css('background-color', $('.me_nicheng').children('a').children('.s').css('background-color'));
                        qb_comment.find('.media-object.media_img').next('.s').show();
                    }else{
                        qb_comment.find('.media-object.media_img').attr('src',avatar);
                        qb_comment.find('.media-object.media_img').show();
                        qb_comment.find('.media-object.media_img').next('.s').hide();
                    }
                    qb_comment.find('.reply-time').children('small').html(count+'楼');
                    qb_comment.find('.reply-time').children('a').eq(0).html(timeValue);
                    qb_comment.find('.media-body').children('p').html(that.replaceEm(body));
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html(0);
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).data('like-user',like_user);
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('.fa.fa-heart-o').css('color', '');
                    if(qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                        qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_comment').after('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: none;">删除</a>');
                    }
                    $('.loading-more').hide();
                }else{
                    $('.comment_list.qblist').prepend($('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length - 1).clone());
                    qb_comment = $('.comment_list.qblist').children('.note-comment').eq(0);
                    qb_comment.find('.author-name').html(nick);
                    if(qb_comment.find('.media-head.pull-left').children('a').children('.V_king').length > 0){
                        qb_comment.find('.media-head.pull-left').children('a').children('.V_king').remove();
                    }
                    if(anonymous == 'n'){
                        if(name != 'anonymous'){
                            qb_comment.find('.media-head.pull-left').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                            qb_comment.find('.media-heading').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                            if($('.me_nicheng').children('a').children('.V_king').length > 0){
                                qb_comment.find('.author-name').prepend('<img class="V_king_line" src="'+BCDNS+'images/kingl.png" alt="">');
                                qb_comment.find('.media-head.pull-left').children('a').append('<span title="专栏作家" class="V_king V_king_s"><img src="'+BCDNS+'images/kings.png" alt=""></span>');
                            }
                        }else{
                            qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                            qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                            qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                        }
                    }else{
                        qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                        qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                    }
                    if(avatar == ''){
                        qb_comment.find('.media-object.media_img').hide();
                        qb_comment.find('.media-object.media_img').next('.s').html($('.me_nicheng').children('a').children('.s').html());
                        qb_comment.find('.media-object.media_img').next('.s').css('background-color', $('.me_nicheng').children('a').children('.s').css('background-color'));
                        qb_comment.find('.media-object.media_img').next('.s').show();
                    }else{
                        qb_comment.find('.media-object.media_img').attr('src',avatar);
                        qb_comment.find('.media-object.media_img').show();
                        qb_comment.find('.media-object.media_img').next('.s').hide();
                    }
                    qb_comment.find('.reply-time').children('small').html(count+'楼');
                    qb_comment.find('.reply-time').children('a').eq(0).html(timeValue);
                    qb_comment.find('.media-body').children('p').html(that.replaceEm(body));
                    //$('.note-comment').eq(0).find('.comment-footer.text-right').children('a').eq(0).data('did',did);
                    qb_comment.find('.comment-footer.text-right').children('a').eq(0).data('like-user',like_user);
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html(0);
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('.fa.fa-heart-o').css('color', '');
                    if(qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                        qb_comment.find('.media-body').children('.comment-footer.text-right').children('#to_like').show();
                        qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_comment').after('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: none;">删除</a>');
                    }
                    if(qb_comment.find('.media-body').children('.comment-footer.text-right').children('#new_replay').html() === ''){
                        qb_comment.find('.media-body').children('.comment-footer.text-right').children('#new_replay').html('回复');
                    }
                    if($('.comment_list.qblist').children('.note-comment').length > 10){
                        $('.comment_list.qblist').children('.note-comment').show();
                        $('.comment_list.qblist').children('.note-comment').eq(9).nextAll('.note-comment').hide();
                        $('.loading-more').children('a').children('span').html($('.comment_list.qblist').children('.note-comment').length-10);
                        $('.loading-more').show();
                    }
                }
            }else if($(e).closest('form').parent('.media-body').length > 0){
                $(e).closest('form').hide();
                $('.comment_list.qblist').prepend($(e).closest('.note-comment').clone());
                qb_comment = $('.comment_list.qblist').children('.note-comment').eq(0);
                qb_comment.attr('id', '');
                qb_comment.find('.author-name').html(nick);
                if(qb_comment.find('.media-head.pull-left').children('a').children('.V_king').length > 0){
                    qb_comment.find('.media-head.pull-left').children('a').children('.V_king').remove();
                }
                if(anonymous == 'n'){
                    if(name != 'anonymous'){
                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                        qb_comment.find('.media-heading').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                        if($('.me_nicheng').children('a').children('.V_king').length > 0){
                            qb_comment.find('.author-name').prepend('<img class="V_king_line" src="'+BCDNS+'images/kingl.png" alt="">');
                            qb_comment.find('.media-head.pull-left').children('a').append('<span title="专栏作家" class="V_king V_king_s"><img src="'+BCDNS+'images/kings.png" alt=""></span>');
                        }
                    }else{
                        qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                        qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                    }
                }else{
                    qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                    qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                    qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                }
                if(avatar === ''){
                    qb_comment.find('.media-object.media_img').hide();
                    qb_comment.find('.media-object.media_img').next('.s').html($('.me_nicheng').children('a').children('.s').html());
                    qb_comment.find('.media-object.media_img').next('.s').css('background-color', $('.me_nicheng').children('a').children('.s').css('background-color'));
                    qb_comment.find('.media-object.media_img').next('.s').show();
                }else{
                    qb_comment.find('.media-object.media_img').attr('src',avatar);
                    qb_comment.find('.media-object.media_img').show();
                    qb_comment.find('.media-object.media_img').next('.s').hide();
                }
                qb_comment.find('.reply-time').children('small').html(count+'楼');
                qb_comment.find('.reply-time').children('a').eq(0).html(timeValue);
                qb_comment.find('.media-body').children('p').html(that.replaceEm(body));
                //$('.note-comment').eq(0).find('.comment-footer.text-right').children('a').eq(0).data('did',did);
                qb_comment.find('.comment-footer.text-right').children('a').eq(0).data('like-user',like_user);
                qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html(0);
                qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('.fa.fa-heart-o').css('color', '');
                if(qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_comment').after('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: none;">删除</a>');
                }
                if(qb_comment.find('.child-comment-list').is(":hidden")){
                    qb_comment.find('.child-comment').data('did',$(e).closest('.note-comment').data('post-id'));
                    qb_comment.find('.child-comment').attr('id','c_'+$(e).closest('.note-comment').data('post-id'));
                    qb_comment.find('.child-comment').children('p').children('a').eq(0).attr('href', $('#li_'+fid).find('.media-heading').children('a').attr('href'));
                    qb_comment.find('.child-comment').children('p').children('a').eq(0).html($('#li_'+fid).find('.author-name').html());
                    qb_comment.find('.child-comment').children('p').children('a').eq(0).data('user-id',$('#li_'+fid).data('post-id'));
                    //$('.note-comment').eq(0).find('.child-comment').children('p').children('a').eq(1).html($(e).closest('.note-comment').find('.author-name').html());
                    qb_comment.find('.child-comment').children('p').append($(e).closest('.media-body').children('p').html());
                    qb_comment.find('.child-comment').find('.reply-time.pull-left').children('a').eq(0).html($('#li_'+fid).find('.media-body').children('.reply-time').children('a').html());
                    qb_comment.find('.child-comment').find('.reply-time.pull-left').children('a').eq(1).children('span').html($('#li_'+fid).find('.comment-footer.text-right').children('a').eq(0).children('span').html());
                    qb_comment.find('.child-comment').find('.reply-time.pull-left').children('a').eq(1).data('did',fid);
                    qb_comment.find('.child-comment').find('.reply-time.pull-left').children('a').eq(1).data('like-user',$('#li_'+fid).find('.comment-footer.text-right').children('.like.pull-left').data('like-user'));
                    if($('#li_'+fid).find('.comment-footer.text-right').children('a').eq(0).children('span').html() > 0){
                        qb_comment.find('.child-comment').find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color', 'red');
                    }else{
                        qb_comment.find('.child-comment').find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color', '');
                    }
                    if($(e).closest('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                        qb_comment.find('.child-comment').children('.child-comment-footer.text-right').children('.report_delete').remove();
                    }else{
                        if(qb_comment.find('.child-comment').children('.child-comment-footer.text-right').children('.report_delete').length <= 0){
                            qb_comment.find('.child-comment').children('.child-comment-footer.text-right').children('.report_comment').after('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: none;">删除</a>');
                        }
                    }
                    
                    qb_comment.find('.comment-toolbar').hide();
                    qb_comment.find('.child-comment-list').show();
                }else{
                    qb_comment.find('.child-comment').each(function(k, v){
                        var cid = $(v).attr('id').substr(2, $(v).attr('id').length);
                        $(v).data('did', cid);
                        $(v).find('.reply-time.pull-left').children('a').eq(1).data('like-user', $(e).closest('.media-body').find('#c_'+cid).find('#to_like').data('like-user'));
                        $(v).find('.reply-time.pull-left').children('a').eq(1).data('did', $(e).closest('.media-body').find('#c_'+cid).data('did'));
                        if($(v).children('.child-comment-footer.text-right').children('.reply-time.pull-left').children('.like').children('span').html() > 0){
                            $(v).children('.child-comment-footer.text-right').children('.reply-time.pull-left').children('.like').children('.fa.fa-heart-o').css('color', 'red');
                        }
                    });
                    qb_comment.find('.child-comment-list').children('.comment-toolbar').before($('.note-comment').eq(0).find('.child-comment').eq(0).clone());
                    var listLength = qb_comment.find('.child-comment').length;
                    var aFirst      = qb_comment.find('.child-comment').eq(listLength-1).children('p').children('a').eq(0).clone();
                    var spanFirst   = qb_comment.find('.child-comment').eq(listLength-1).children('p').children('span').eq(0).clone();
                    qb_comment.find('.child-comment').eq(listLength-1).data('did',$(e).closest('.note-comment').data('post-id'));
                    qb_comment.find('.child-comment').eq(listLength-1).attr('id','c_'+$(e).closest('.note-comment').data('post-id'));
                    aFirst.attr('href', $('#li_'+fid).find('.media-heading').children('a').attr('href'));
                    aFirst.html($(e).closest('.media-body').find('.author-name').html());
                    qb_comment.find('.child-comment').eq(listLength-1).children('p').empty();
                    qb_comment.find('.child-comment').eq(listLength-1).children('p').append(aFirst);
                    qb_comment.find('.child-comment').eq(listLength-1).children('p').append(spanFirst);
                    qb_comment.find('.child-comment').eq(listLength-1).children('p').append($(e).closest('.media-body').children('p').html());
                    qb_comment.find('.child-comment').eq(listLength-1).find('.reply-time.pull-left').children('a').eq(0).html($(e).closest('.media-body').children('.reply-time').children('a').html());
                    qb_comment.find('.child-comment').eq(listLength-1).find('.reply-time.pull-left').children('a').eq(1).children('span').html($(e).closest('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html());
                    if($(e).closest('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html() > 0){
                        qb_comment.find('.child-comment').eq(listLength-1).find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color', 'red');
                    }else{
                        qb_comment.find('.child-comment').eq(listLength-1).find('.reply-time.pull-left').children('a').eq(1).children('.fa.fa-heart-o').css('color', '');
                    }
                    qb_comment.find('.child-comment').eq(listLength-1).find('.reply-time.pull-left').children('a').eq(1).data('did',$(e).closest('.note-comment').data('post-id'));
                    qb_comment.find('.child-comment').eq(listLength-1).find('.reply-time.pull-left').children('a').eq(1).data('like-user', $(e).closest('.media-body').children('.comment-footer.text-right').children('.like.pull-left').data('like-user'));
                    if($(e).closest('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                        qb_comment.find('.child-comment').children('.child-comment-footer.text-right').children('.report_delete').remove();
                    }else{
                        if(qb_comment.find('.child-comment').children('.child-comment-footer.text-right').children('.report_delete').length <= 0){
                            qb_comment.find('.child-comment').children('.child-comment-footer.text-right').children('.report_comment').after('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: none;">删除</a>');
                        }
                    }
                    
                    qb_comment.find('.child-comment-list').children('.comment-toolbar').find('.blue-link').html('展开查看');
                    if(listLength > 3){
                        qb_comment.find('.child-comment').eq(2).nextAll('.child-comment').hide();
                        qb_comment.find('.comment-toolbar').find('.count').html(listLength-3);
                        qb_comment.find('.comment-toolbar').show();
                    }else{
                        qb_comment.find('.comment-toolbar').hide();
                    }
                }
                if($('.comment_list.qblist').children('.note-comment').length > 10){
                    $('.comment_list.qblist').children('.note-comment').show();
                    $('.comment_list.qblist').children('.note-comment').eq(9).nextAll('.note-comment').hide();
                    $('.comment_list.qblist').children('.loading-more').children('a').children('span').html($('.comment_list.qblist').children('.note-comment').length-10);
                    $('.loading-more').show();
                }

                var X = qb_comment.offset().left;
                var Y = qb_comment.offset().top-400;
                window.scrollTo(X, Y);
            }else if($(e).closest('form').parent('.child-comment-list').length > 0){
                $(e).closest('form').hide();
                $('.comment_list.qblist').prepend($(e).closest('.note-comment').clone());
                qb_comment = $('.comment_list.qblist').children('.note-comment').eq(0);
                qb_comment.attr('id', '');
                qb_comment.find('.author-name').html(nick);
                if(qb_comment.find('.media-head.pull-left').children('a').children('.V_king').length > 0){
                    qb_comment.find('.media-head.pull-left').children('a').children('.V_king').remove();
                }
                if(anonymous == 'n'){
                    if(name != 'anonymous'){
                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                        qb_comment.find('.media-heading').children('a').attr('href', 'http://'+name+'.'+DOMAIN);
                        if($('.me_nicheng').children('a').children('.V_king').length > 0){
                            qb_comment.find('.author-name').prepend('<img class="V_king_line" src="'+BCDNS+'images/kingl.png" alt="">');
                            qb_comment.find('.media-head.pull-left').children('a').append('<span title="专栏作家" class="V_king V_king_s"><img src="'+BCDNS+'images/kings.png" alt=""></span>');
                        }
                    }else{
                        qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                        qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                        qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                    }
                }else{
                    qb_comment.find('.media-head.pull-left').children('a').removeAttr('target');
                    qb_comment.find('.media-head.pull-left').children('a').attr('href', 'javascript:void(0)');
                    qb_comment.find('.media-heading').children('a').attr('href', 'javascript:void(0)');
                }
                if(avatar === ''){
                    qb_comment.find('.media-object.media_img').hide();
                    qb_comment.find('.media-object.media_img').next('.s').html($('.me_nicheng').children('a').children('.s').html());
                    qb_comment.find('.media-object.media_img').next('.s').css('background-color', $('.me_nicheng').children('a').children('.s').css('background-color'));
                    qb_comment.find('.media-object.media_img').next('.s').show();
                }else{
                    qb_comment.find('.media-object.media_img').attr('src',avatar);
                    qb_comment.find('.media-object.media_img').show();
                    qb_comment.find('.media-object.media_img').next('.s').hide();
                }
                qb_comment.find('.reply-time').children('small').html(count+'楼');
                qb_comment.find('.reply-time').children('a').eq(0).html(timeValue);
                qb_comment.find('.media-body').children('p').html(that.replaceEm(body));
                //$('.note-comment').eq(0).find('.comment-footer.text-right').children('a').eq(0).data('did',did);
                qb_comment.find('.comment-footer.text-right').children('a').eq(0).data('like-user',like_user);
                qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('span').html(0);
                qb_comment.find('.media-body').children('.comment-footer.text-right').children('a').eq(0).children('.fa.fa-heart-o').css('color', '');
                if(qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_delete').length <= 0){
                    qb_comment.find('.media-body').children('.comment-footer.text-right').children('.report_comment').after('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: none;">删除</a>');
                }

                for(var j = 0; j < $(e).closest('form').prevAll('.child-comment').length; j ++){
                    var cid = qb_comment.find('.child-comment').eq(j).attr('id').substr(2, qb_comment.find('.child-comment').eq(j).attr('id').length);
                    qb_comment.find('.child-comment').eq(j).data('did', cid);
                    qb_comment.find('.child-comment').eq(j).find('.reply-time.pull-left').children('a').eq(1).data('like-user', $(e).closest('.media-body').find('#c_'+cid).find('#to_like').data('like-user'));
                    qb_comment.find('.child-comment').eq(j).find('.reply-time.pull-left').children('a').eq(1).data('did', $(e).closest('.media-body').find('#c_'+cid).data('did'));
                    if(qb_comment.find('.child-comment').eq(j).children('.child-comment-footer.text-right').children('.reply-time.pull-left').children('.like').children('span').html() > 0){
                        qb_comment.find('.child-comment').eq(j).children('.child-comment-footer.text-right').children('.reply-time.pull-left').children('.like').children('.fa.fa-heart-o').css('color', 'red');
                    }
                }
                qb_comment.find('.child-comment').eq($(e).closest('form').prevAll('.child-comment').length - 1).nextAll('.child-comment').remove();
                qb_comment.find('.child-comment').eq($(e).closest('form').prevAll('.child-comment').length - 1).nextAll('form').remove();
                if(qb_comment.find('.child-comment').length > 3){
                    qb_comment.find('.child-comment').eq(2).nextAll('.child-comment').hide();
                    qb_comment.find('.comment-toolbar').find('.count').html($('.note-comment').eq(0).find('.child-comment').length-3);
                    qb_comment.find('.comment-toolbar').show();
                }else{
                    qb_comment.find('.comment-toolbar').hide();
                }

                var X = qb_comment.offset().left;
                var Y = qb_comment.offset().top-400;
                window.scrollTo(X, Y);
            }

            qb_comment.find('form').find('.comment-tools').children("input[name='commit']").attr('disabled',false);
            
            $.ajax({
                type:'post',
                url:DISCUSS_URL+'discuss',
                dataType:'json',
                // jsonpCallback:'callback',
                crossDomain: true,
                xhrFields: {
                    withCredentials: true,
                },
                data:{'aid':aid, 'fid':fid, 'body':body, 'url':url, 'title':title, 'author_id':author_id, 'at':at, 'anonymous':anonymous, 'nick':nick, avatar:avatar},
                beforeSend:function(){
                    if($('.comment_list.qblist').is(":hidden")){
                        $('.comment_list.qblist').show();
                        $('.comment_list.qblist').children('loading').show();
                    }else{
                        $('.comment_list.qblist').children('loading').show();
                    }
                },
                success:function(info){
                    if(info.meta.code == 200){
                        var did = info.data.did;
                        qb_comment.attr('id','li_'+did);
                        qb_comment.data('post-id',did);
                        qb_comment.find('.comment-footer.text-right').children('a').eq(0).data('did',did);
                        $('#commentCount').html(count);
                    }else{
                        that.setCookie('BC_JS_'+user_id+'_UI', '');
                        qb_comment.remove();

                        $(".notybox").noty({
                            layout: 'topCenter',
                            text: '登录失效！',
                            type: "confirm",
                            animation: {
                                open: {height: 'toggle'}, // jQuery animate function property object
                                close: {height: 'toggle'}, // jQuery animate function property object
                                easing: 'swing', // easing
                                speed: 1000 // opening & closing animation speed
                            },
                            timeout: 1000
                        });
                    }
                },
                complete:function(){
                    $('.comment_list.qblist').children('loading').hide();
                }
            });
        },

        replayThisOne: function()
        {
            var that        = discuss;
            var e           = this;
            var aid         = $.trim($('#show_discuss').data('aid'));
            var title       = $.trim($('#show_discuss').data('title'));
            var url         = $.trim($('#show_discuss').data('url'));
            var author_id   = $.trim($('#show_discuss').data('author-id'));
            var user_id     = $.trim($('#new_comment').children("input[name='user_id']").val());
            var userinfo = '';
            if(user_id > 0){
                userinfo    = JSON.parse(that.getCookie('BC_JS_'+user_id+'_UI'));
            }else{
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '请先登录！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                $('#dlModal').show();
                $('.me_nicheng').hide();
                return false;
            }
            var form = '';
            var fid = 0;
            var parent_nick = '';
            if($(e).parent('.comment-footer').length > 0){
                $(e).closest('.note-comment').siblings().find('form').hide();
                $(e).closest('.comment-footer').next('.child-comment-list').next('form').hide();
                $(e).closest('.comment-footer').siblings('.child-comment-list').find('form').hide();
                fid = $(e).closest('.note-comment').data('post-id');
                parent_nick = $(e).closest('.comment-footer').siblings('.media-heading').children('.author-name').text();
                form = $(e).closest('.comment-footer').next('form');
                if(form.length <= 0){
                    $(e).closest('.comment-footer').after($(e).closest('.comment-footer').siblings('form').clone());
                    form = $(e).closest('.comment-footer').next('form');
                    form.children("input[name='aid']").val(aid);
                    form.children("input[name='title']").val(title);
                    form.children("input[name='author_id']").val(author_id);
                    form.children("input[name='fid']").val(fid);
                    if(typeof userinfo != 'undefined' && userinfo.anonymous.length > 0){
                        $.each(userinfo.anonymous, function(i, ele){
                            form.find('.dropdown-menu.nick').append('<li id="select_nick">'+ele+'</li>');
                        });
                    }
                    form.show();
                    form.find('textarea').focus();
                    form.find('textarea').val('@'+parent_nick+' ');
                }else if(form.length > 0 && form.is(":hidden")){
                    form.children("input[name='fid']").val(fid);
                    form.show();
                    form.find('textarea').focus();
                    if(form.find('textarea').val() === ''){
                        form.find('textarea').val('@'+parent_nick+' ');
                    }
                }else if(form.length > 0 && form.is(":visible")){
                    form.hide();
                }
            }else if($(e).closest('.child-comment-footer').length > 0){
                $(e).closest('.note-comment').siblings('.note-comment').find('form').hide();
                $(e).closest('.child-comment-list').siblings('form').hide();
                $(e).closest('.child-comment').siblings('.child-comment').next('form').hide();

                fid = $(e).closest('.child-comment').data('did');
                parent_nick = $(e).closest('.child-comment-footer').siblings('p').children('a').eq(0).text();
                form = $(e).closest('.child-comment').next('form');
                if(form.length > 0 && form.is(":visible")){
                    form.hide();
                }else if(form.length > 0 && form.is(":hidden")){
                    form.children("input[name='fid']").val(fid);
                    // form.find('textarea').val('@'+parent_nick+' ');
                    form.show();
                    form.find('textarea').focus();
                }else{
                    $(e).closest('.child-comment').after($(e).closest('.child-comment-list').next('form').clone());
                    form = $(e).closest('.child-comment').next('form');
                    form.children("input[name='aid']").val(aid);
                    form.children("input[name='title']").val(title);
                    form.children("input[name='author_id']").val(author_id);
                    form.children("input[name='fid']").val(fid);
                    if(typeof userinfo != 'undefined' && userinfo.anonymous.length > 0){
                        $.each(userinfo.anonymous, function(i, ele){
                            form.find('.dropdown-menu.nick').append('<li id="select_nick">'+ele+'</li>');
                        });
                    }
                    form.show();
                    form.find('textarea').focus();
                    form.find('textarea').val('@'+parent_nick+' ');
                }
            }else if($(e).parent('.pull-right').parent('.comment-toolbar').length > 0){
                $(e).closest('.note-comment').siblings().find('form').hide();
                $(e).parent('.pull-right.signed').parent('.comment-footer').siblings('.child-comment').find('form').hide();
                $(e).closest('.child-comment-list').prev('form').hide();
                form = $(e).closest('.child-comment-list').next('form');
                if(form.is(":hidden")){
                    fid = $(e).closest('.note-comment').data('post-id');
                    parent_nick = $(e).closest('.child-comment-list').siblings('.media-heading').children('.author-name').text();
                    form.children("input[name='aid']").val(aid);
                    form.children("input[name='title']").val(title);
                    form.children("input[name='author_id']").val(author_id);
                    form.children("input[name='fid']").val(fid);
                    if(typeof userinfo != 'undefined' && userinfo.anonymous.length > 0){
                        $.each(userinfo.anonymous, function(i, ele){
                            form.find('.dropdown-menu.nick').append('<li id="select_nick">'+ele+'</li>');
                        });
                    }
                    form.show();
                    form.find('textarea').focus();
                    form.find('textarea').val('@'+parent_nick+' ');
                }else{
                    form.hide();
                }
            }
        },

        loveThisComment: function()
        {
            var e = this;
            $(this).removeAttr('id');
            var user_id = $('#new_comment').children("input[name='user_id']").val();
            var did = $(e).data('did');
            var like_user = $(e).data('like-user');
            var status = 2;
            var deletePos = 0;
            if(user_id > 0){
                if(like_user.length > 0){
                    for(var i = 0; i < like_user.length; i++){
                        if(user_id == like_user[i]){
                            status = 1;
                            deletePos = i;
                        }
                    }
                }
            }else{
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '请先登录！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                $('#dlModal').show();
                $('.me_nicheng').hide();
                $(e).attr('id', 'to_like');
                return false;
            }
            var count = $(e).children('span').html();
            if(status == 1){
                /*like_user.splice(deletePos,1);
                $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').data('like-user',like_user);*/
                count = parseInt(count)-1;
                $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').children('span').html(count);
                if($('[id=c_'+did+']').length > 0){
                    $('[id=c_'+did+']').each(function(i, ele){
                        $(ele).find('.reply-time.pull-left').find('span').html(count);
                    });
                }
                // if(count <= 0){
                    $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').children('.fa.fa-heart-o').css('color','');
                    if($('[id=c_'+did+']').length > 0){
                        $('[id=c_'+did+']').each(function(i, ele){
                            $(ele).find('.reply-time.pull-left').find('.fa.fa-heart-o').css('color','');
                        });
                    }
                // }
            }else{
                /*like_user.push(data.data.user_id);
                $('#li_'+did).find('.comment-footer.text-right').children('.like.pull-left').data('like-user',like_user);*/
                count = parseInt(count) +1;
                $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').children('span').html(count);
                $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').children('.fa.fa-heart-o').css('color','red');
                if($('[id=c_'+did+']').length > 0){
                    $('[id=c_'+did+']').each(function(i, ele){
                        $(ele).find('.reply-time.pull-left').find('span').html(count);
                        $(ele).find('.reply-time.pull-left').find('.fa.fa-heart-o').css('color','red');
                    });
                }
            }

            $.ajax({
                type:'post',
                url:DISCUSS_URL+'discuss/likes',
                dataType:'json',
                // jsonpCallback:'callback',
                xhrFields: {
                    withCredentials: true,
                },
                data:{'did':did, 'status':status},
                /*beforeSend:function(){
                    $(e).attr('disabled',true);
                },*/
                success:function(data){
                    if(data.meta.code == 200){
                        if(status == 1){
                            like_user.splice(deletePos,1);
                            $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').data('like-user',like_user);
                            if($('[id=c_'+did+']').length > 0){
                                $('[id=c_'+did+']').each(function(k, val){
                                    $(val).find('.reply-time.pull-left').find('.like').data('like-user',like_user);
                                });
                            }
                        }else{
                            like_user.push(data.data.user_id);
                            $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').data('like-user',like_user);
                            if($('[id=c_'+did+']').length > 0){
                                $('[id=c_'+did+']').each(function(k, val){
                                    $(val).find('.reply-time.pull-left').find('.like').data('like-user',like_user);
                                });
                            }
                        }
                    }else{
                        count = parseInt(count)-1;
                        $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').children('span').html(count);
                        if($('[id=c_'+did+']').length > 0){
                            $('[id=c_'+did+']').each(function(i, ele){
                                $(ele).find('.reply-time.pull-left').find('span').html(count);
                            });
                        }
                        if(count <= 0){
                            $('[id=li_'+did+']').find('.comment-footer.text-right').children('.like.pull-left').children('.fa.fa-heart-o').css('color','');
                            if($('[id=c_'+did+']').length > 0){
                                $('[id=c_'+did+']').each(function(i, ele){
                                    $(ele).find('.reply-time.pull-left').find('.fa.fa-heart-o').css('color','');
                                });
                            }
                        }
                        $(".notybox").noty({
                            layout: 'topCenter',
                            text: '登录已过期，请重新登录！',
                            type: "confirm",
                            animation: {
                                open: {height: 'toggle'}, // jQuery animate function property object
                                close: {height: 'toggle'}, // jQuery animate function property object
                                easing: 'swing', // easing
                                speed: 1000 // opening & closing animation speed
                            },
                            timeout: 1000
                        });
                    }
                },
                complete:function(){
                    $(e).attr('id', 'to_like');
                }
            });
        },
        showOver: function()
        {
            var e = this;
            if($(e).html() == '收起'){
                $(e).closest('.child-comment-list').children('.child-comment').eq(2).nextAll('.child-comment').hide();
                $(e).prev('.count_div').children('.count').html($(e).closest('.comment-toolbar').siblings('.child-comment').length-3);
                $(e).html('展开查看');
                $(e).prev('.count_div').show();
                $(e).closest('.comment-toolbar').show();
            }else{
                $(e).prev('.count_div').hide();
                $(e).closest('.comment-toolbar').siblings('.child-comment').show();
                $(e).html('收起');
            }
        },
        deleteDiscuss: function()
        {
            var e = this;
            var aid = $.trim($('#new_comment').children("input[name='aid']").val());
            var did = 0;
            if($(e).parent('.comment-footer').length > 0){
                did = $(e).closest('.note-comment').data('post-id');
            }
            if($(e).parent('.child-comment-footer').length > 0){
                did = $(e).closest('.child-comment').data('did');
            }
            var before_content = $('#li_'+did).find('.media-body').children('p').html();
            $('[id=li_'+did+']').find('.media-body').children('p').html(discuss.roundComment());
            $('[id=li_'+did+']').find('.media-body').children('p').attr('attribute', 'attribute');
            $('[id=li_'+did+']').find('.media-body').find('.comment-footer.text-right').children('.report_delete').remove();
            $('[id=li_'+did+']').find('.media-body').children('.comment-footer.text-right').children('#new_replay').html('');
            if($('[id=c_'+did+']').length > 0){
                $('[id=c_'+did+']').each(function(i, ele){
                    var pList = $(ele).children('p');
                    var aFirst = pList.children('a').eq(0);
                    var spanFirst = pList.children('span').eq(0);
                    //var aSecond = pList.children('a').eq(1);
                    pList.empty();
                    pList.append(aFirst);
                    pList.append(spanFirst);
                    //pList.append(aSecond);
                    pList.append(discuss.roundComment());
                    pList.attr('attribute', 'attribute');
                    $(ele).children('.child-comment-footer.text-right ').children('.report_delete').remove();
                });
            }
            $.ajax({
                type:'post',
                url:DISCUSS_URL+'discuss/destroy',
                dataType:'json',
                // jsonpCallback:'callback',
                data:{aid: aid, did: did},
                xhrFields: {
                    withCredentials: true,
                },
                beforeSend:function(){
                    $(e).attr('disabled',true);
                },
                success:function(data){
                    if(data.meta.code == 200){
                        $('[id=li_'+did+']').find('.media-body').children('.comment-footer.text-right').children('#to_like').hide();
                        if($('[id=c_'+did+']').length > 0){
                            $('[id=c_'+did+']').each(function(k, val){
                                $(val).children('.child-comment-footer.text-right').children('#new_replay').html('');
                                $(val).children('.child-comment-footer.text-right').find('#to_like').remove();
                            });
                        }
                    }else{
                        $('[id=li_'+did+']').find('.media-body').children('p').html(before_content);
                        $('[id=li_'+did+']').find('.media-body').find('.comment-footer.text-right').children('.reply').before('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss">删除</a>');
                        $('[id=li_'+did+']').find('.media-body').children('.comment-footer.text-right').children('#new_replay').html('回复');
                        if($('[id=c_'+did+']').length > 0){
                            $('[id=c_'+did+']').each(function(k, val){
                                var pList = $(val).children('p');
                                var aFirst = pList.children('a').eq(0);
                                var spanFirst = pList.children('span').eq(0);
                                //var aSecond = pList.children('a').eq(1);
                                pList.empty();
                                pList.append(aFirst);
                                pList.append(spanFirst);
                                //pList.append(aSecond);
                                pList.append(before_content);
                                $(val).children('.child-comment-footer.text-right ').children('.reply').before('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss">删除</a>');
                            });
                        }
                        $(".notybox").noty({
                            layout: 'topCenter',
                            text: '登陆已失效，请重新登录！',
                            type: "confirm",
                            animation: {
                                open: {height: 'toggle'}, // jQuery animate function property object
                                close: {height: 'toggle'}, // jQuery animate function property object
                                easing: 'swing', // easing
                                speed: 1000 // opening & closing animation speed
                            },
                            timeout: 1000
                        });
                    }
                },
                complete:function(){
                    $(e).attr('disabled',false);
                }
            });
        },
        showMore: function()
        {
            var e = this;
            var count = 0;
            var discussCount = $(e).children('span').html();
            $(e).closest('.loading-more').siblings('.note-comment').each(function(i, ele){
                if($(ele).is(":visible")){
                    count++;
                }
            });
            if(($('.comment_list.qblist').children('.note-comment').length - count) > 10){
                $(e).children('span').html(discussCount-10);
            }else{
                $(e).closest('.loading-more').hide();
            }
            $('.comment_list.qblist').children('.note-comment').show();
            $('.comment_list.qblist').children('.note-comment').eq(count+9).nextAll('.note-comment').hide();
        },
        checkLogin: function()
        {
            var that = discuss;
            var ele = this;
            $.ajax({
                type:'get',
                url:UC_URL+'user/islogin',
                dataType : "jsonp",
                jsonpCallback:'callback',
                xhrFields: {
                    withCredentials: true,
                },
                success:function(resource){
                    if(resource.meta.code == 200){
                        $('#new_comment').children("input[name='user_id']").val(resource.data.uid);
                        if(typeof that.getCookie('BC_JS_'+resource.data.uid+'_UI') == 'undefined' || that.getCookie('BC_JS_'+resource.data.uid+'_UI') === ''){
                            var value = '{"name": "'+resource.data.nickname+'", "avatar": "'+resource.data.avatar+'", "anonymous": []}';
                            that.setCookie('BC_JS_'+resource.data.uid+'_UI', value, 90);
                        }
                        $('.me_nicheng').show();
                        $('.text-door').hide();
                        $('.me_nicheng').children('.myname').html(resource.data.nickname);
                        if(resource.data.name !== ''){
                            $('.me_nicheng').children('.myname').data('name', resource.data.name);
                        }else{
                            $('.me_nicheng').children('.myname').data('name', 'anonymous');
                        }
                        if(resource.data.group_id == 200){
                            $('.me_nicheng').children('a').append('<span title="专栏作家" class="V_king V_king_s V_king_sx"><img src="'+BCDNS+'images/kings.png " alt=""></span>');
                        }
                        if(resource.data.avatar === ''){
                            var firstStr = resource.data.nickname.substr(0, 1);
                            var color = that.getAvatarColor(resource.data.uid);
                            $('.me_nicheng').children('a').children('.s').html(firstStr);
                            $('.me_nicheng').children('a').children('.s').css('background-color', color);
                            $('.me_nicheng').children('a').children('.s').show();
                            $('.me_nicheng').children('a').children('img').hide();
                        }else{
                            if(resource.data.group_id == 200 && resource.data.avatar.indexOf('blogchina.com') != -1){
                                $('.me_nicheng').children('a').children('img').attr('src', resource.data.avatar+'!middle');
                            }else{
                                $('.me_nicheng').children('a').children('img').attr('src', resource.data.avatar);
                            }
                        }
                    }else{
                        $('#new_comment').children("input[name='user_id']").val(0);
                        $('#dlModal').show();
                        $('.me_nicheng').hide();
                        $(ele).attr('readOnly', true);
                    }
                }
            });
        },
        firstLoad: function()
        {
            var that = this;
            var defer = $.Deferred();
            $.ajax({
                type:'get',
                url:UC_URL+'user/islogin',
                dataType : "jsonp",
                jsonpCallback:'callback',
                xhrFields: {
                    withCredentials: true,
                }
            }).done(function(resource){
                if(resource.meta.code == 200){
                    defer.resolve(resource.data.uid);
                    $('#new_comment').children("input[name='user_id']").val(resource.data.uid);
                    if(typeof that.getCookie('BC_JS_'+resource.data.uid+'_UI') == 'undefined' || that.getCookie('BC_JS_'+resource.data.uid+'_UI') === ''){
                        var value = '{"name": "'+resource.data.nickname+'", "avatar": "'+resource.data.avatar+'", "anonymous": [] }';
                        that.setCookie('BC_JS_'+resource.data.uid+'_UI', value, 90);
                    }
                    $('.me_nicheng').show();
                    $('.text-door').hide();
                    $('.me_nicheng').children('.myname').html(resource.data.nickname);
                    if(resource.data.name !== ''){
                        $('.me_nicheng').children('.myname').data('name', resource.data.name);
                    }else{
                        $('.me_nicheng').children('.myname').data('name', 'anonymous');
                    }
                    if(resource.data.group_id == 200){
                        $('.me_nicheng').children('a').append('<span title="专栏作家" class="V_king V_king_s V_king_sx"><img src="'+BCDNS+'images/kings.png " alt=""></span>');
                    }
                    if(resource.data.avatar === ''){
                        var firstStr = resource.data.nickname.substr(0, 1);
                        var color = that.getAvatarColor(resource.data.uid);
                        $('.me_nicheng').children('a').children('.s').html(firstStr);
                        $('.me_nicheng').children('a').children('.s').css('background-color', color);
                        $('.me_nicheng').children('a').children('.s').show();
                        $('.me_nicheng').children('a').children('img').hide();
                    }else{
                        if(resource.data.group_id == 200 && resource.data.avatar.indexOf('blogchina.com') != -1){
                            $('.me_nicheng').children('a').children('img').attr('src', resource.data.avatar+'!middle');
                        }else{
                            $('.me_nicheng').children('a').children('img').attr('src', resource.data.avatar);
                        }
                    }
                }else{
                    defer.resolve();
                    $('#new_comment').children("input[name='user_id']").val(0);
                    $('.text-door').show();
                    $('.me_nicheng').hide();
                }
            });
            return defer.promise();
        },
        toLogin: function()
        {
            var that = discuss;
            var accout = $.trim($('#dis_accout').val());
            var password = $.trim($('#dis_pass').val());
            if(accout === '' || password === ''){
                $(".notybox").noty({
                    layout: 'topCenter',
                    text: '用户名或密码为空！',
                    type: "confirm",
                    animation: {
                        open: {height: 'toggle'}, // jQuery animate function property object
                        close: {height: 'toggle'}, // jQuery animate function property object
                        easing: 'swing', // easing
                        speed: 1000 // opening & closing animation speed
                    },
                    timeout: 1000
                });
                return false;
            }
            $.ajax({
                url:DISCUSS_URL+'discuss/sign',
                data:{accout:accout,password:password},
                type:'post',
                dataType:'json',
                // jsonpCallback:'callback',
                xhrFields: {
                    withCredentials: true,
                },
                beforeSend:function(){
                    $('#dlModal').hide();
                    $('.me_nicheng').children('.loading').show();
                },
                success:function(msg){
                    if(msg.meta.code == 200){
                        window.location.href = window.location.href + '?id=' + 10000*Math.random() + '#show_discuss';
                        // $('#new_comment').find('#saytext').removeAttr('readOnly');
                        // $('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length-1).prevAll().remove();
                        // if($('.comment_list.qblist').children('.note-comment').eq(0).find('.comment-footer.text-right').children('.report_delete').length <= 0){
                        //     $('.comment_list.qblist').children('.note-comment').eq(0).find('.comment-footer.text-right').children('.reply').before('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: inline-block;">删除</a>');
                        // }
                        // if($('.comment_list.qblist').children('.note-comment').eq(0).find('.child-comment').children('.child-comment-footer.text-right').children('.report_delete').length <= 0){
                        //     $('.comment_list.qblist').children('.note-comment').eq(0).find('.child-comment').children('.child-comment-footer.text-right').children('.reply').before('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: inline-block;">删除</a>');
                        // }
                        // $('.comment_list.qblist').children('.note-comment').hide();
                        // $('.loading-more').hide();
                        // var aid = $.trim($('#new_comment').children("input[name='aid']").val());
                        // $.when(that.firstLoad()).done(function(data){
                        //     that.showAllDiscuss(aid, data);
                        // });
                    }else{
                        $(".notybox").noty({
                            layout: 'topCenter',
                            text: '登录失败！',
                            type: "confirm",
                            animation: {
                                open: {height: 'toggle'}, // jQuery animate function property object
                                close: {height: 'toggle'}, // jQuery animate function property object
                                easing: 'swing', // easing
                                speed: 1000 // opening & closing animation speed
                            },
                            timeout: 1000
                        });
                    }
                },
                complete:function(){
                    $('.me_nicheng').children('.loading').hide();
                }
            });
        },
        setNick: function()
        {
            var that = discuss;
            if($(this).children('img').attr('alt') == 1){
                $(this).children('img').attr('alt', 2);
                $(this).children('img').attr('src',BCDNS+'images/majiagreen.png');
                $(this).siblings('.dropdown.nicheng').children('#get_nick').addClass('inputfocus');
                $(this).siblings('.dropdown.nicheng').children('#get_nick').removeAttr('readOnly');
                $(this).siblings('.dropdown.nicheng').children('#get_nick').focus();
                if($(this).siblings('.dropdown.nicheng').children('#get_nick').next('.dropdown-menu.nick').children('li').length > 0){
                    $(this).siblings('.dropdown.nicheng').children('#get_nick').next('.dropdown-menu.nick').show();
                }else{
                    var user_id = $('#new_comment').children('input[name="user_id"]').val();
                    if(typeof that.getCookie('BC_JS_'+user_id+'_UI') != 'undefined' && that.getCookie('BC_JS_'+user_id+'_UI') !== ''){
                        var userinfo = JSON.parse(that.getCookie('BC_JS_'+user_id+'_UI'));
                        if(userinfo.anonymous.length > 0){
                            $.each(userinfo.anonymous, function(i, ele){
                                $(this).siblings('.dropdown.nicheng').children('#get_nick').next('.dropdown-menu.nick').append('<li id="select_nick">'+ele+'</li>');
                            });
                        }
                    }
                }
            }else{
                $(this).next('.dropdown.nicheng').children('.dropdown-menu.nick').hide();
                $(this).closest('.comment-text').siblings('input[name="anonymous"]').val('n');
                $(this).children('img').attr('alt',1);
                $(this).children('img').attr('src',BCDNS+'images/majiagrey.png');
                $(this).next('.dropdown.nicheng').children('#get_nick').val('');
                $(this).next('.dropdown.nicheng').children('#get_nick').attr('readOnly', true);
                $(this).next('.dropdown.nicheng').children('#get_nick').removeClass('inputfocus');
            }
        },
        focusThisOne: function()
        {
            var that = discuss;
            var e = this;
            $(e).blur(function(){
                var content = $(e).val();
                if(content !== ''){
                    $(e).closest('.comment-text').siblings("input[name='anonymous']").val('y');
                    $(e).parent('.dropdown.nicheng').siblings('#set_nick').children('img').attr('src',BCDNS+'images/majiagreen.png');
                    $(document).bind('click', function(ele){
                        var target = $(ele.target);
                        if(target.closest('#set_nick').length == 0){
                            $(e).parent('.dropdown.nicheng').siblings('#set_nick').children('img').attr('alt',2);
                        }
                    });
                    $(e).attr('readOnly', true);
                    $(e).removeClass('inputfocus');
                }else{
                    $(e).closest('.comment-text').siblings("input[name='anonymous']").val('n');
                    $(e).parent('.dropdown.nicheng').siblings('#set_nick').children('img').attr('src',BCDNS+'images/majiagrey.png');
                    $(document).bind('click', function(ele){
                        var target = $(ele.target);
                        if(target.closest('#set_nick').length == 0){
                            $(e).parent('.dropdown.nicheng').siblings('#set_nick').children('img').attr('alt',1);
                        }
                    });
                    $(this).attr('readOnly', true);
                    $(this).removeClass('inputfocus');
                }
                // $(e).next('.dropdown-menu.nick').hide();
            });
            $(e).keyup(function(){
                $(e).next('.dropdown-menu.nick').hide();
            });
        },
        selectText: function(text)
        {
            if (document.body.createTextRange) {
                var range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },
        selectNick: function()
        {
            var text = $(this).html();
            $(this).parent('.dropdown-menu.nick').prev('.dropdown-toggle.majiaon').val(text);
            $(this).closest('.comment-text').siblings("input[name='anonymous']").val('y');
            $(this).closest('.dropdown.nicheng').prev('a').children('img').attr('src',BCDNS+'images/majiagreen.png');
            $(this).closest('.dropdown.nicheng').prev('a').children('img').attr('alt',2);
            $(this).parent('.dropdown-menu.nick').hide();
        },
        replaceEm: function(str)
        {
            // str = str.replace(/\</g,'&lt;');
            // str = str.replace(/\>/g,'&gt;');
            // str = str.replace(/\n/g,'<br/>');
            str = str.replace(/\[em_([1-9]|[1-6][0-9]|7[0-5])\]/g,'<img src="'+BCDNS+'images/arclist/$1.gif" border="0" />');
            return str;
        },
        getAvatarColor: function(id)
        {
            var color = '';
            switch(id % 3){
                case 0:
                    color = '#e55151';
                    break;
                case 1:
                    color = '#5185e5';
                    break;
                case 2:
                    color = '#e58951';
                    break;
                default :
                    color = '#e55151';
                    break;
            }
            return color;
        },
        getNickAvatar: function(id)
        {
            var nickavatar = '';
            switch(id % 3){
                case 0:
                    nickavatar = 'nick_1.jpg';
                    break;
                case 1:
                    nickavatar = 'nick_2.jpg';
                    break;
                case 2:
                    nickavatar = 'nick_3.jpg';
                    break;
                default :
                    nickavatar = 'nick_4.jpg';
                    break;
            }
            return nickavatar;
        },
        loadAllDiscuss: function()
        {
            var that = discuss;
            if($('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length-1).find('.comment-footer.text-right').children('.report_delete').length <= 0){
                $('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length-1).find('.comment-footer.text-right').children('.reply').before('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: inline-block;">删除</a>');
            }
            if($('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length-1).find('.child-comment').children('.child-comment-footer.text-right').children('.report_delete').length <= 0){
                $('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length-1).find('.child-comment').children('.child-comment-footer.text-right').children('.reply').before('<a class="report_delete" href="javascript:void(0)" id="delete_one_discuss" style="display: inline-block;">删除</a>');
            }
            $('.comment_list.qblist').children('.note-comment').eq($('.comment_list.qblist').children('.note-comment').length-1).prevAll().remove();
            $('.comment_list.qblist').children('.note-comment').hide();
            //$('.comment_list.rmlist').empty();
            $('.loading-more').hide();
            $(".comment_list.qblist").css('height', '800px');
            var aid = $.trim($('#new_comment').children("input[name='aid']").val());
            $.when(that.firstLoad()).done(function(data){
                that.showAllDiscuss(aid, data);
            });
        },
        loadRmDiscuss: function(){
            var that = discuss;
            var aid = $.trim($('#new_comment').children("input[name='aid']").val());
            $.ajax({
                url:DISCUSS_URL+'discuss/'+aid,
                type:'get',
                dataType:'json',
                // jsonpCallback:'callback',
                beforeSend: function(){
                    $('.comment_list.rmlist').empty();
                    $('.comment_header.rm').after('<div id="loading"></div>');
                    $('#loading').css('position', 'relative');
                    $('#loading').append(new Spinner().spin().el);
                },
                success: function(result){
                    if(result.meta.code == 200){
                        if(result.data.length > 0){
                            var like_first_num = 0, like_second_num = 0, like_third_num = 0;
                            var rm_first_did = 0, rm_second_did = 0, rm_third_did = 0, rm_center_did = 0;
                            $.each(result.data, function(i, e){
                                if(e.discuss.like.total >= like_first_num && e.discuss.like.total > 0 && e.discuss.status != 'delete' && e.discuss.status != 'spam'){
                                    like_third_num = like_second_num;
                                    rm_third_did = rm_second_did;
                                    like_second_num = like_first_num;
                                    rm_second_did = rm_first_did;
                                    like_first_num = e.discuss.like.total;
                                    rm_first_did = e.discuss.did;
                                }else if(e.discuss.like.total >= like_second_num && e.discuss.like.total > 0 && e.discuss.status != 'delete' && e.discuss.status != 'spam'){
                                    like_third_num = like_second_num;
                                    rm_third_did = rm_second_did;
                                    like_second_num = e.discuss.like.total;
                                    rm_second_did = e.discuss.did;
                                }else if(e.discuss.like.total >= like_third_num && e.discuss.like.total > 0 && e.discuss.status != 'delete' && e.discuss.status != 'spam'){
                                    like_third_num = e.discuss.like.total;
                                    rm_third_did = e.discuss.did;
                                }
                            });
                            var rm_comment = $('.comment_list.rmlist').children('.note-comment').length;
                            if(like_first_num > 0){
                                $('.comment_list.rmlist').append($('#li_'+rm_first_did).clone());
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).data('post-id', $('.comment_list.qblist').children('#li_'+rm_first_did).data('post-id'));
                                var up_rm_first_did = $('.comment_list.qblist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('did');
                                var up_rm_like_first_user = $('.comment_list.qblist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('like-user');
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('did', up_rm_first_did);
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).find('.comment-footer.text-right').children('#to_like').data('like-user', up_rm_like_first_user);
                                $('.comment_list.rmlist').children('#li_'+rm_first_did).find('.child-comment').each(function(rmk1, rmv1){
                                    $(rmv1).data('did', $('.comment_list.qblist').children('#li_'+rm_first_did).find('.child-comment').eq(rmk1).data('did'));
                                    var rm_first_cid = $(rmv1).attr('id');
                                    var rm_first_data_did = $('.comment_list.qblist').children('#li_'+rm_first_did).find('#'+rm_first_cid).find('#to_like').data('did');
                                    var rm_first_like_user = $('.comment_list.qblist').children('#li_'+rm_first_did).find('#'+rm_first_cid).find('#to_like').data('like-user');
                                    $(rmv1).find('#to_like').data('did', rm_first_data_did);
                                    $(rmv1).find('#to_like').data('like-user', rm_first_like_user);
                                });
                            }
                            if(like_second_num > 0){
                                $('.comment_list.rmlist').append($('#li_'+rm_second_did).clone());
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).data('post-id', $('.comment_list.qblist').children('#li_'+rm_second_did).data('post-id'));
                                var up_rm_second_did = $('.comment_list.qblist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('did');
                                var up_rm_like_second_user = $('.comment_list.qblist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('like-user');
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('did', up_rm_second_did);
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).find('.comment-footer.text-right').children('#to_like').data('like-user', up_rm_like_second_user);
                                $('.comment_list.rmlist').children('#li_'+rm_second_did).find('.child-comment').each(function(rmk2, rmv2){
                                    $(rmv2).data('did', $('.comment_list.qblist').children('#li_'+rm_second_did).find('.child-comment').eq(rmk2).data('did'));
                                    var rm_sescond_cid = $(rmv2).attr('id');
                                    var rm_second_data_did = $('.comment_list.qblist').children('#li_'+rm_second_did).find('#'+rm_sescond_cid).find('#to_like').data('did');
                                    var rm_second_like_user = $('.comment_list.qblist').children('#li_'+rm_second_did).find('#'+rm_sescond_cid).find('#to_like').data('like-user');
                                    $(rmv2).find('#to_like').data('did', rm_second_data_did);
                                    $(rmv2).find('#to_like').data('like-user', rm_second_like_user);
                                });
                            }
                            if(like_third_num > 0){
                                $('.comment_list.rmlist').append($('#li_'+rm_third_did).clone());
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).data('post-id', $('.comment_list.qblist').children('#li_'+rm_third_did).data('post-id'));
                                var up_rm_third_did = $('.comment_list.qblist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('did');
                                var up_rm_like_third_user = $('.comment_list.qblist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('like-user');
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('did', up_rm_third_did);
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).find('.comment-footer.text-right').children('#to_like').data('like-user', up_rm_like_third_user);
                                $('.comment_list.rmlist').children('#li_'+rm_third_did).find('.child-comment').each(function(rmk3, rmv3){
                                    $(rmv3).data('did', $('.comment_list.qblist').children('#li_'+rm_third_did).find('.child-comment').eq(rmk3).data('did'));
                                    var rm_third_cid = $(rmv3).attr('id');
                                    var rm_third_data_did = $('.comment_list.qblist').children('#li_'+rm_third_did).find('#'+rm_third_cid).find('#to_like').data('did');
                                    var rm_third_like_user = $('.comment_list.qblist').children('#li_'+rm_third_did).find('#'+rm_third_cid).find('#to_like').data('like-user');
                                    $(rmv3).find('#to_like').data('did', rm_third_data_did);
                                    $(rmv3).find('#to_like').data('like-user', rm_third_like_user);
                                });
                            }
                            if($('.comment_list.rmlist').children('.note-comment').length - rm_comment > 0){
                                $('.comment_list.rmlist').children('.note-comment').eq(rm_comment).prevAll().remove();
                                $('.comment_list.rmlist').children('.note-comment').show();
                            }else{
                                $('.comment_header.rm').hide();
                            }
                        }
                    }
                },
                complete: function(){
                    $('#loading').remove();
                }
            });
        },
        loadOverJs: function()
        {
            $('input').iCheck({
                checkboxClass: 'icheckbox_minimal',
                radioClass: 'iradio_minimal',
                increaseArea: '20%' // optional
            });
        },
        setCookie: function(c_name,value,expiredays)
        {
            var exdate=new Date();
            exdate.setDate(exdate.getDate()+expiredays);
            document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
        },
        getCookie: function(c_name)
        {
            if (document.cookie.length>0){
                c_start=document.cookie.indexOf(c_name + "=");
                if (c_start!=-1){
                    c_start=c_start + c_name.length+1;
                    c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) c_end=document.cookie.length;
                    return unescape(document.cookie.substring(c_start,c_end));
                }
            }
            return "";
        },
        removeHtmlStr: function(str)
        {
            var replace_html = '';
            replace_html = str.replace(/<[\/\s]*(?:(?!div|br)[^>]*)>/g, '');
            replace_html = replace_html.replace(/<\s*div[^>]*>/g, '<div>');
            replace_html = replace_html.replace(/<[\/\s]*div[^>]*>/g, '</div>');
            return replace_html;
        },
        replaceHtmlStr: function(str)
        {
            var replace_html = '';
            var arr_entities = '';
            replace_html = str.replace(/<img.*?>/gi,"");
            replace_html = replace_html.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
            replace_html = replace_html.replace(/\r?\n/g,"<br />");
            replace_html = replace_html.replace(/src=/gi,"");
            replace_html = replace_html.replace(/onerror/gi,"");
            replace_html = replace_html.replace(/\$\.getScript/g,"");
            replace_html = replace_html.replace(/\'.*?\.js\'/gi,"");
            return replace_html;
        },

        replaceSpecialStr: function(str)
        {
            var replace_html = '';
            var arr_entities = '';
            replace_html = str.replace(/<img.*?>/gi,"");
            replace_html = replace_html.replace(/src=/gi,"");
            replace_html = replace_html.replace(/onerror/gi,"");
            replace_html = replace_html.replace(/\$\.getScript/g,"");
            replace_html = replace_html.replace(/\'.*?\.js\'/gi,"");
            return replace_html;
        },

        enterType:function()
        {
            that = discuss;
            $(document).on('keyup', '#dis_accout', function(event){
                if(event.keyCode == 13){
                    $('#dis_pass').focus();
                }
            });

            $(document).on('keyup', '#dis_pass', function(event){
                if(event.keyCode == 13){
                    that.toLogin();
                }
            });
        },

        closeSign:function()
        {
            $(document).on('click', '#close_sign', function(){
                $('#dlModal').hide();
            });
        },

        addArticleUrl: function()
        {
            var url = window.location.href;
            $('#dlModal').find('.weibo').children('a').attr('href', '/auth/weibo?state=n&articleurl='+url);
            // $('#dlModal').find('.wechat').children('a').attr('href', '/auth/weixinweb?state=n&articleurl='+url);
            $('#dlModal').find('.qq').children('a').attr('href', '/auth/qq?state=n&articleurl='+url);
        },

        watLogin: function()
        {
            $(document).on('click', '#watlogin', function(){
                var browser = {
                    versions: function() {
                        var u = navigator.userAgent, app = navigator.appVersion;
                        return {//移动终端浏览器版本信息 
                            trident: u.indexOf('Trident') > -1, //IE内核
                            presto: u.indexOf('Presto') > -1, //opera内核
                            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                            mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                            iPhone: u.indexOf('iPhone') > -1, //|| u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                            iPad: u.indexOf('iPad') > -1, //是否iPad
                            // webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                        };
                    }(),
                        language: (navigator.browserLanguage || navigator.language).toLowerCase()
                };
                if (browser.versions.iPhone || browser.versions.iPad || browser.versions.android) {
                    window.location.href = UC_URL+'weixinapi/login?weixinarticleurl='+window.location.href;
                }else{
                    window.location.href = UC_URL+'auth/weixinweb?state=n&articleurl='+window.location.href;
                }
            });
        },
        roundComment: function(){
            var arr = [
                '堵车，评论来不了啦',
                '评论请假了，正在打点滴',
                '喝点凉茶去去火～',
                '来杯牛奶补补钙',
                '让我好好想想该怎么说更合适呢～',
                '评论的小船说翻就翻',
                '轻轻的我走了，正如我轻轻的来',
                '世界那么大，评论去看看',
                '地球太复杂，我已回火星',
                '此处施工，请绕行！'
            ];
            var key = Math.round(Math.random()*11);
            return arr[key];
        },
        clearPlaceholder: function()
        {
            var commet_placeholder = $('.mousetrap').attr('placeholder');
            $(document).on('focus', '.mousetrap', function(){
                if($(this).val() === ''){
                    $(this).attr('placeholder', '');
                }
            }).on('blur', '.mousetrap', function(){
                if($(this).val() === ''){
                    $(this).attr('placeholder', commet_placeholder);
                }
            });
        }




    };
    window.discuss = discuss;
    $(function(){
        discuss.init();
        $(document).on('mouseover', ".media-body", function () {
            //$(this).children('.comment-footer').find('.report_comment').css("display","inline-block");
            $(this).children('.comment-footer').find('.report_delete').css("display","inline-block");
            //event.stopPropagation();
        });
        $(document).on('mouseout', ".media-body", function () {
            //$(this).children('.comment-footer').find('.report_comment').css("display","none");
            $(this).children('.comment-footer').find('.report_delete').css("display","none");
        });
        $(document).on('mouseover', ".child-comment", function () {
            //$(this).children('.child-comment-footer').find('.report_comment').css("display","inline-block");
            $(this).children('.child-comment-footer').find('.like').css("display","inline-block");
            $(this).children('.child-comment-footer').find('.report_delete').css("display","inline-block");
        });
        $(document).on('mouseout', ".child-comment", function () {
            //$(this).children('.child-comment-footer').find('.report_comment').css("display","none");
            $(this).children('.child-comment-footer').find('.like').css("display","none");
            $(this).children('.child-comment-footer').find('.report_delete').css("display","none");

        });
        $(document).on('click', '#login_btn', discuss.toLogin);

        $(document).on('focus', '#saytext', discuss.checkLogin);

        $(document).on('click', '#set_nick', discuss.setNick);

        $(document).on('focus', '#get_nick', discuss.focusThisOne);

        $(document).on('click', '#select_nick', discuss.selectNick);

        $(document).on('click', '#form_commit', discuss.submitInfo);

        $(document).on('click', '#new_replay', discuss.replayThisOne);

        $(document).on('click', '#more_discuss', discuss.showMore);

        $(document).on('click', '#load_all_discuss', discuss.loadAllDiscuss);

        $(document).on('click', '#to_like', discuss.loveThisComment);

        $(document).on('click', '#show_other', discuss.showOver);

        $(document).on('click', '#delete_one_discuss', discuss.deleteDiscuss);

        $(document).on('click', '#load_rm_discuss', discuss.loadRmDiscuss);

        $(document).on('keypress', '#get_nick', function(event){
            if(event.keyCode == "13"){
                $(this).closest('.comment-tools').prev('#saytext').focus();
                return false;
            }
        });
    });
})();
