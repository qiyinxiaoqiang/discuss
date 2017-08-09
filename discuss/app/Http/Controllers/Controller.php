<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Model\Common;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;


    public function returnCode($code,$message='',$data='')
    {
        switch ($code) {
            case 200:
                $msg = 'OK';
                break;
            case 400:
                $msg = 'Bad Request';
                break;
            case 401:
                $msg = 'Unauthorized';
                break;
            case 404:
                $msg = 'Not Found';
                break;
            case 408:
                $msg = 'Request Time-out';
                break;
            case 409:
                $msg = 'Conflict';
                break;
            case 500:
                $msg = 'Internal Server Error';
                break;
            case 503:
                $msg = 'Service Unavailable';
                break;
            default:
                break;
        }
        if($message != '') {
            $message = $msg.':'.$message;
        } else {
            $message = $msg;
        }

        $result = [
            'meta'=>[
                'code'=>$code,
                'message'=>$message,
            ],
            
        ];
        if($data !='') {
            $result = array_add($result,'data',$data);
        }
        return $result;     

    }

    /**
     * 服务端tag，一般用于uc5项目的ajax请求列表 
     * @param  array  $data   数据列表
     * @param  boolean $notModifiedExit [description]
     * @return [type]                   [description]
     */
    public function etag($data, $notModifiedExit = true)
    {
        $jdata = json_encode($data);
        $etag = md5($jdata);
        if ($notModifiedExit && array_key_exists('HTTP_IF_NONE_MATCH', \Request::server()) && (\Request::server('HTTP_IF_NONE_MATCH') == $etag)) {
            header("HTTP/1.1 304 Not Modified");
            exit();
        }
        return response($data,200)->header('Etag',$etag);
    }
    
    
    
    
    /**
	 * 设置公共变量，每个用到公共变量的view都需调用
	 * @author tangqiyin 2016.3.10
	 */
	public function setvar($uid) {
		if($this->islocallogin()) {
			$userinfo = \Cookie::get(env('BC_UI', 'BC_UI'));
			$userinfo = explode('||',$userinfo);
    		$cookie_uid = $userinfo[0]; 
		}else{
			$cookie_uid = ''; 
		}
		$__home = array(
			'user_islocallogin'=>$this->islocallogin(),//用户是否登陆 true|false 
			'user_isselflogin' =>$this->isselflogin($cookie_uid,$uid),//用户是否登陆自己博客 true|false
			'user_info'  => Common::userExt($uid), 
			'cookie_uid' => $cookie_uid,  
		);	 
		if(empty($__home['user_info']['data']['uid']) || !isset($__home['user_info']['data']['uid'])){
			return '404';exit;
		}
		return $__home;
	}
    
    
    
    
    /**
	 * 是否本地登陆
	 * @author tangqiyin
	 * @return bool;
	 */
    public function islocallogin(){
    	$token =  \Cookie::get('BC_TK');  
    	$data = Common::islocallogin($token);
		return $data;
    }

	 /**
	 * 验证是否登陆自己的博客
	 * @author tangqiyin
	 * @return bool;
	 */
	public function isselflogin($cookie_uid,$uid) {
		if($this->islocallogin()) {
			if($cookie_uid == $uid) {
				return true;
			}
		}
		return false;
	}

}
