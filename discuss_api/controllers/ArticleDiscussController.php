<?php
namespace App\Http\Controllers;
use Redis2;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use \Firebase\JWT\JWT;

use App\Model\Publicm;
use App\Model\ArticleDiscuss;
use App\Model\UserLog;
use App\Model\User;

use Entere\Utils\SequenceNumber;
use Event;
use App\Events\TimelineEvent;
use App\Events\NotificationEvent;

use Cache;

/**
 * @author entere@126.com
 * @desc 文章评论接口
 */
class ArticleDiscussController extends Controller
{
    public function __construct()
    {
         $this->middleware('jwt', ['only' => ['store','likes','cancelLikes','destroy']]);
    }

    public function index(Request $request,$aid) 
    {   
        $data = ArticleDiscuss::index(intval($aid));
        return $this->returnCode(200,'',$data);
    }
    
    /**
     * store 发评论/回复评论/at /article/12/discuss
     * @param  Request $request [description]
     * @return [type]           [description]
     */
    public function store(Request $request,$aid)
    {
        
        $validator = \Validator::make($request->all(), [
            'title' => 'required',
            'url' => 'required',
            'author_id' => 'required', //文章所属用户id
            'fid' => 'required',
            'body' => 'required',
            //'user_id' => 'required',//评论用户id
            'anonymous'=>'in:y,n',//是否匿名评论 y：匿名
            'nick' => 'required', 
            //'avatar' => 'required',
            'at'=>'in:y,n',//at时，fid 只存被at人的id
            'status'=>'in:publish,pending,spam,delete',

        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        
        $auto_did = intval(Publicm::autoId('did'));//评论id discuss
        $did = intval(SequenceNumber::generateNumber($auto_did,$prefix='',$width=9));//根据自增id生成随机等宽id 
        $user_id = intval($request->jwt['decode']['iss']);  //登录用户id 
        //$user_id = $request->input('user_id');
        $fid = intval($request->input('fid'));
        if($fid != 0 ) {
            if($request->input('at','n') == 'y') {
                $fids = [0];
            } else {
                $arr = ArticleDiscuss::fidTree(intval($aid),$fid);
                if($arr == null) {
                    return $this->returnCode(404,'你要回复的评论找不到了');
                }
                $fids = $arr['discuss']['fids']; 
            }
            
        } else {
            $fids = [];
        }
        array_push($fids,$fid);
        $author_id = intval($request->input('author_id'));
        //参数
        $params = [
            'auto_did' => $auto_did,
            'article' => [
                'aid' => intval($aid),
                'title' => $request->input('title'),
                'url' => $request->input('url'),
                'author_id' => $author_id,//文章作者id
            ],
            'discuss' => [
                
                'did' => $did, //评论id
                'fids' => $fids, //评论父id
                'body' => $request->input('body'),//评论内容
                'add_time' => time(),//第一次插入时间
                'update_time' => time(),//更新时间
                'ip' => $request->input('ip'),
                'last_ip' => $request->input('ip','127.0.0.1'),
                'like' => [
                    'total' => 0,  //喜欢总数
                    'user_ids' => [],//有那些人喜欢
                ],
                'anonymous' => $request->input('anonymous','n'),
                'user' => [
                    'user_id' => $user_id,//登录评论者id
                    'nick' => $request->input('nick','网友'), 
                    'avatar'=> $request->input('avatar',''),
                ],
                
                'status' => $request->input('status','pending'), //评论状态： publish：正常, pending：待验证, spam：垃圾，delete：已被删除 (非必选，默认是正常评论)
                'agent' => $request->input('agent',''),
            ],
        ];
            
        ArticleDiscuss::store($params);
        
        Publicm::incrUserNum($user_id,'comment',1);
        Publicm::incrArticleNum(intval($aid),'comment',1);

        //wxj 添加评论消息(给文章作者发消息)
        if($user_id != $author_id){
            $timeline_data=['uid'=>$user_id,'type'=>'comment_article','data'=>['a_id'=> intval($aid), 'a_title' => $params['article']['title'], 'comment' => $params['discuss']['body']],'add_time' => $params['discuss']['add_time'], 'ip'=>$params['discuss']['ip']];
            \Event::fire(new TimelineEvent($timeline_data));
            $userinfo = User::show(['type'=>'uid','id'=>intval($author_id)]);
            $notification_data = ['uid' => intval($author_id),'type'=>'comment_article','data'=>['who' => intval($user_id), 'who_nick' => $params['discuss']['user']['nick'], 'who_if_anonymouts' => $params['discuss']['anonymous'], 'a_id' => intval($aid), 'a_title' => $params['article']['title']], 'add_time' => $params['discuss']['add_time'], 'ip'=>$params['discuss']['ip'], 'unread' => 'y'];
            if($userinfo['setting']['notification']['comment']['notification'] == 'public' && $userinfo['setting']['notification']['comment']['email'] == 'y'){
                \Event::fire(new NotificationEvent($notification_data));
            }elseif($userinfo['setting']['notification']['comment']['notification'] == 'public'){
                \Event::fire(new NotificationEvent($notification_data));
            }else if($userinfo['setting']['notification']['comment']['notification'] == 'protected'){
                $users_follow = \DB::table('users_follow')
                            ->where('fans_uid', intval($author_id))
                            ->where('friend_uid', intval($user_id))
                            ->get();
                if(!empty($users_follow)){ 
                    if($userinfo['setting']['notification']['comment']['email'] == 'y'){
                        \Event::fire(new NotificationEvent($notification_data));
                    }else{
                        \Event::fire(new NotificationEvent($notification_data));
                    }
                }
            }
        }

        //给被@的人发消息
        if($fid != 0){
            if(isset($arr['discuss']['user']) && $arr['discuss']['user']['user_id'] != $user_id){
                $fidnotification = ['uid' => intval($arr['discuss']['user']['user_id']), 'type' => 'comment_replay', 'data' => ['who' => intval($user_id), 'who_nick' => $params['discuss']['user']['nick'], 'who_if_anonymouts' => $params['discuss']['anonymous'], 'a_id' => intval($aid), 'a_title' => $params['article']['title'], 'did' => intval($fid)], 'add_time' => $params['discuss']['add_time'], 'ip'=>$params['discuss']['ip'], 'unread' => 'y'];
                $fidinfo = User::show(['type' => 'uid', 'id' => intval($arr['discuss']['user']['user_id'])]);
                if($fidinfo['setting']['notification']['comment']['notification'] == 'public' && $fidinfo['setting']['notification']['comment']['email'] == 'y'){
                    \Event::fire(new NotificationEvent($fidnotification));
                }elseif($fidinfo['setting']['notification']['comment']['notification'] == 'public'){
                    \Event::fire(new NotificationEvent($fidnotification));
                }else if($fidinfo['setting']['notification']['comment']['notification'] == 'protected'){
                    $users_follow = \DB::table('users_follow')
                                ->where('fans_uid', intval($arr['discuss']['user']['user_id']))
                                ->where('friend_uid', intval($user_id))
                                ->get();
                    if(!empty($users_follow)){ 
                        if($fidinfo['setting']['notification']['comment']['email'] == 'y'){
                            \Event::fire(new NotificationEvent($fidnotification));
                        }else{
                            \Event::fire(new NotificationEvent($fidnotification));
                        }
                    }
                }
            }
        }

        //结束

        
        //记录日志
        UserLog::create([
            //base
            'uid' => $user_id,
            'type'=> 'discuss-store' ,//日志类型
            
            'add_time' => time(),
            'ip' => $request->input('ip','127.0.0.1'),
            'agent' => $request->input('agent',\Agent::getUserAgent()),
            //extend
            'aid' => intval($aid),
            'author_id' => $author_id,
            'did' => $did
            
        ]);

        $data = [
            'did' => $did,
            'aid' => intval($aid),
            'author_id' => $author_id,
            'user_id' => $user_id,
            
        ];
        return $this->returnCode(200,'',$data);
    }

    /**
     * destroy /article/12/discuss/1  删除自己的评论
     * @param  Request $request [description]
     * @param  [type]  $aid     [description]
     * @return [type]           [description]
     */
    public function destroy(Request $request, $aid, $did)
    {
        $validator = \Validator::make($request->all(), [
            'ip' => 'ip',
        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        
        $user_id = intval($request->jwt['decode']['iss']);   
        //$user_id = 224;
        $params = [
            'discuss.status'=>'delete',
            'discuss.update_time'=>time(),
            'discuss.last_ip' => $request->input('ip','127.0.0.1')
        ];
        //\Log::info(json_encode($params));
        $r = ArticleDiscuss::del($params, intval($aid), intval($did), $user_id);
         //记录日志
        UserLog::create([
            //base
            'uid' => $user_id,
            'type'=> 'discuss-destroy' ,//日志类型
            'add_time' => time(),
            'ip' => $request->input('ip','127.0.0.1'),
            'agent' => $request->input('agent',\Agent::getUserAgent()),
            //extend
            'aid'   => intval($aid),
            'did' => intval($did),
            
        ]);

        if(!$r) {
            $this->returnCode(500);
        }
        $data = [
            'aid' => intval($aid),
            'did'=> intval($did),
            'user_id'=>$user_id,
            
        ];
        return $this->returnCode(200,'',$data);
    }



    /**
     * likes /discuss/12/likes
     * @param  Request $request [description]
     * @param  [type]  $aid     [description]
     * @return [type]           [description]
     */
    public function likes(Request $request, $did)
    {
        $validator = \Validator::make($request->all(), [
            'ip' => 'ip',
        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        
        $user_id = intval($request->jwt['decode']['iss']);   
        
        //\Log::info(json_encode($params));
        $r = ArticleDiscuss::likes(intval($did), $user_id);
         //记录日志
        UserLog::create([
            //base
            'uid' => $user_id,
            'type'=> 'discuss-likes' ,//日志类型
            'add_time' => time(),
            'ip' => $request->input('ip','127.0.0.1'),
            'agent' => $request->input('agent',\Agent::getUserAgent()),
            //extend
            'did' => intval($did),
            
        ]);

        if(!$r) {
            return $this->returnCode(500);
        }

        // $info = ArticleDiscuss::info(intval($did));
        // if(!empty($info) && $info['discuss']['user']['user_id'] != $user_id){
        //     // $timeline_data=['uid'=>$user_id,'type'=>'comment_article','data'=>['a_id'=> intval($aid), 'a_title' => $params['article']['title'], 'comment' => $params['discuss']['body']],'add_time' => $params['discuss']['add_time'], 'ip'=>$params['discuss']['ip']];
        //     // \Event::fire(new TimelineEvent($timeline_data));
        //     $userinfo = User::show(['type'=>'uid','id'=>intval($info['discuss']['user']['user_id'])]);
        //     $notification_data = ['uid' => intval($info['discuss']['user']['user_id']),'type'=>'comment_replay','data'=>['who' => intval($user_id), 'who_nick' => $params['discuss']['user']['nick'], 'who_if_anonymouts' => $params['discuss']['anonymous'], 'a_id' => intval($aid), 'a_title' => $params['article']['title']], 'add_time' => $params['discuss']['add_time'], 'ip'=>$params['discuss']['ip'], 'unread' => 'y'];
        //     if($userinfo['setting']['notification']['comment']['notification'] == 'public' && $userinfo['setting']['notification']['comment']['email'] == 'y'){
        //         \Event::fire(new NotificationEvent($notification_data));
        //     }elseif($userinfo['setting']['notification']['comment']['notification'] == 'public'){
        //         \Event::fire(new NotificationEvent($notification_data));
        //     }else if($userinfo['setting']['notification']['comment']['notification'] == 'protected'){
        //         $users_follow = \DB::table('users_follow')
        //                     ->where('fans_uid', $author_id)
        //                     ->where('friend_uid', $user_id)
        //                     ->get();
        //         if(!empty($users_follow)){ 
        //             if($userinfo['setting']['notification']['comment']['email'] == 'y'){
        //                 \Event::fire(new NotificationEvent($notification_data));
        //             }else{
        //                 \Event::fire(new NotificationEvent($notification_data));
        //             }
        //         }
        //     }
        // }
        $data = [
            'did'=> intval($did),
            'user_id'=>$user_id,
            
        ];
        return $this->returnCode(200,'',$data);
    }

    /**
     * cancelLikes
     * @param  Request $request [description]
     * @param  [type]  $aid     [description]
     * @return [type]           [description]
     */
    public function cancelLikes(Request $request, $did)
    {
        $validator = \Validator::make($request->all(), [
            'ip' => 'ip',
        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        
        $user_id = intval($request->jwt['decode']['iss']);   
        
        
        //\Log::info(json_encode($params));
        $r = ArticleDiscuss::cancelLikes(intval($did), $user_id);
         //记录日志
        UserLog::create([
            //base
            'uid' => $user_id,
            'type'=> 'discuss-cancel-likes' ,//日志类型
            'add_time' => time(),
            'ip' => $request->input('ip','127.0.0.1'),
            'agent' => $request->input('agent',\Agent::getUserAgent()),
            //extend
            'did' => intval($did),
            
        ]);

        if(!$r) {
            $this->returnCode(500);
        }
        $data = [
            'did'=> intval($did),
            'user_id'=>$user_id,
            
        ];
        return $this->returnCode(200,'',$data);
    }


    
    

    

    
}
