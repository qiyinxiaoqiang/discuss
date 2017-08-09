<?php

namespace App\Http\Controllers\Auth;
 
use Validator;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Event;
use App\Model\User;
use App\Events\UserLoginEvent;
use Entere\Utils\SequenceNumber;
class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    protected $service = ['weixinweb','qq','weibo','blogchina'];

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest', ['except' => 'getLogout']); 
        
    }

    /**
     * 引导用户到第三方平台登陆 (weibo weixinweb qq) 
     * @param  string $service 平台名称
     * @return srting           
     */
    public function redirectToProvider($service) {
        if(!in_array($service, $this->service)){
            return $this->returnCode(400,'service not found');
        }
        return \Socialite::with($service)->redirect();
        // return \Socialite::with('weibo')->scopes(array('email'))->redirect();
    }

    
    /**
     * 第三方平台登录后callback地址(auth/weibo/callback)
     * @param   string $service 平台名称
     * @return string
     */
    public function handleProviderCallback($service,Request $request) {   
    	if(isset($request->error)){
    		return \Redirect::to('sign/in'); 
    	}  
    	 //判断用户是否
    	$token = \Cookie::get(env('BC_TK','BC_TK')); 
    	$userinfo = \Cookie::get(env('BC_UI', 'BC_UI'));
    	if($userinfo) {
    		$userinfos = explode('||',$userinfo);
	    	$uid = $userinfos[0]; 
	    	$r = json_decode($userinfos[2],true); 
    	}   
		$oauthUser = \Socialite::with($service)->user();   
    	if(isset($uid) && $uid !== ''){ 
    		//登录状态
    		$params = [
    			'openid'=>$oauthUser->id,
    			'service'=>$service
    		];
    		$data = User::bindfirst($params); 
    		
    		
 			/*$data = \DB::table('users_bind')
			            ->where(['openid'=>$oauthUser->id,'service'=>$service])
			            ->first();  */
 			if(!$data){ 
 				 $usersBindParams = [
	                'openid'=>$oauthUser->id,
	                'u_id'=>intval($uid),
	                'service'=>$service,//平台名
	                'token'=>$oauthUser->token,
	                'nickname'=>$oauthUser->getNickname(), 
	                'is_mainuser'=>'n',
	                'is_show_platform'=>intval(1),
	            ];  
	            
	            
	            User::bindM($usersBindParams); 
	           // \DB::table('users_bind')->insert($usersBindParams);  
	            $r['refreshtoken'.$service]=$token.$service; 
	            \Cookie::queue(env('BC_UI', 'BC_UI'),$userinfos[0].'||'.$userinfos[1].'||'.json_encode($r),env('JWT_EXP',21600)); 
			    \Session::flash('message','A0000');  //add ok
  			}else{ 
  				$key = 'refreshtoken'.$service;  
  				if(isset($r[$key]) && !empty($r[$key]) && $r[$key] == $token.$service){  
  					$usersRefreshParams = [
		                'openid'=>$oauthUser->id,
		                'u_id'=>intval($uid),
		                'service'=>$service,//平台名
		                'token'=>$oauthUser->token,
		                'nickname'=>$oauthUser->getNickname(), 
		                'is_mainuser'=>'n',
		                'is_show_platform'=>intval(1),
		            ]; 
//		            var_dump($usersRefreshParams);die;
		            User::updatebindM($usersRefreshParams); 
		            
		           /* \DB::table('users_bind')
			            ->where(['openid'=>$oauthUser->id,'service'=>$service])
			            ->update($usersRefreshParams);*/
			        \Session::flash('message','A5555'); //update ok
  				}else{ 
  					\Session::flash('message','A9999'); //yibangding
  				} 
 			}     
 				return redirect('setting/index');  
    	}else{ 
    		//未登录状态 登录页第三方授权登录
    		$params = [
    			'openid'=>$oauthUser->id,
    			'service'=>$service
    		];
    		$data = User::bindfirst($params);  
	    /*    $data = \DB::table('users_bind')
	        	->select('u_id','nickname')
	            ->where(['openid'=>$oauthUser->id,'service'=>$service])
	            ->first();  */
	        //如果是第一次登录，注册并绑定，然后生成jwt
	        $u_id = $data['u_id'];
	        $nikename = $data['nickname']; 
	        if(!$u_id) {
	             //没有uid 生成一个uid
//	            $auto_uid = Redis2::incr('v5:auto:uid');//redis 产生自增id 
//	            $uid = SequenceNumber::generateNumber($auto_uid,$prefix='',$width=9);//根据自增id生成随机等宽id
	            if($oauthUser->getAvatar()){
                	$is_avatar_uploaded='y';
                }else{
                	$is_avatar_uploaded='n';
                } 
	            $usersParams = [
//		                'uid'=>intval($uid),
//		                'auto_uid'=>$auto_uid,
		                'accout'=>'',
		                'name'=>'',
		                'nickname'=>$oauthUser->getNickname(),
		                'email'=>'',
		                'mobile'=>'',
		                'password'=>'',
		                'avatar'=>$oauthUser->getAvatar(),
		                'ip'    => $request->input('ip',\Request::ip()),
		                'add_time' =>time(),
		                
//		                'is_valid_email'=>'n',
//		                'is_valid_mobile'=>'n',
		                'is_avatar_uploaded'=>$is_avatar_uploaded,
//		                'allow_comment'=>'y',
//		                'allow_reward'=>'n',
		                'reg_from'=>$service,
		                'intro'=>'',
		                'homepage'=>'',
		                "numbers"=>[
		                    "blog"=>0
		                ],
		                
		                'gender'=>3,//1男 2女 3保密 
			            'realname'=>'',
			            'rank'=>'',
			            'blog_name'=>'',
			            
			            'db_id'=>0,
			
			            'monitor'=>[
			                'is_audit'=>'y',
			                'is_pending'=>'n',
			                'is_lock'=>'n',
			                'is_del'=>'n',
			            ],
			            
			            'birthday'=>[
			                'year'=>'',
			                'month'=>'',
			                'day'=>'',
			            ],
			            'address'=>[
			                'resideprovince'=>'',
			                'residecity'=>'',
			                'residecounty'=>'',
			                'corporation'=>''
			            ],
			            'magnumopus'=>'',//代表作
			            'privacy'=>[
			            ],//
			          
			           'openid'=>$oauthUser->id,
			           'service'=>$service,//平台名 
			           'token'=>$oauthUser->token, 
			           'nickname'=>$oauthUser->getNickname(), 
			           'is_mainuser'=>'y',
			           'is_show_platform'=>intval(1),
		            ];
		             
		           /* $usersBindParams = [
		                'openid'=>$oauthUser->id,
		                'u_id'=>intval($uid),
		                'service'=>$service,//平台名
		                'token'=>$oauthUser->token,
		                'nickname'=>$oauthUser->getNickname(), 
		                'is_mainuser'=>'y',
		                'is_show_platform'=>intval(1),
		                
		            ];  */
		          // $u_id = $uid;
		            $nikename = $oauthUser->getNickname();
		            $userr = User::postup($usersParams); 
		            if($userr['meta']['code'] == 200){
		            	$u_id = $userr['data']['uid'];
		            }
		           // \DB::table('users')->insert($usersParams);
		           // \DB::table('users_bind')->insert($usersBindParams);
	        } 
    	}  
        $r = [];
        //UserLoginEvent事件做以下事情，生成jwt,把jwt写入redis,写登录日志  
        $data = Event::fire(new UserLoginEvent(['uid'=>$u_id])); 
        $r['refreshtoken'.$service]=$data[0]['data']['token'].$service;
        \Cookie::queue(env('BC_TK', 'BC_TK'),$data[0]['data']['token'],env('JWT_EXP',21600));  
        \Cookie::queue(env('BC_UI', 'BC_UI'),$u_id.'||'.$nikename.'||'.json_encode($r),env('JWT_EXP',21600));  
        return redirect('setting/index'); 
    } 
}
