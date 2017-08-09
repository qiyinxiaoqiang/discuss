<?php namespace App\Model;
//use Jenssegers\Mongodb\Model as Eloquent; 
use Input, Request, Cache;

class Common 
{
    //获取用户扩展信息
    static public function userExt($uid)
    {
        $memkey = 'v5:user:uid:'.$uid;
        $memdata = Cache::get($memkey); 
        if($memdata){
            $response = $memdata;
        }else{
            $params = [];
            $headers = array("Accept" => "application/json");
            $data1 = \Unirest\Request::get(\Config::get('app.site_api')."/user/".$uid."?type=uid", $headers, $params);
            $data = $data1->raw_body; 
            $response = json_decode($data,true); 
            if(isset($response['data']) && $response['data']!=''){
                Cache::put($memkey, $response, \Config::get('app.date_time'));
            }
        }
        return $response;
    }
    
    //获取用户各数量
    public static function userNum($uid)
    {  
        $headers = array("Accept" => "application/json");
        $data1 = \Unirest\Request::get(\Config::get('app.site_api')."/user/{$uid}/num", $headers, []);
        $data = $data1->raw_body;
        $response = json_decode($data,true); 
        return $response;
    }
     
    
    //判断user是否登录
    static public function islocallogin($token)
    { 
        $response = \Unirest\Request::post(\Config::get('app.site_api')."/sign/checktoken", [], array('token'=>$token));
        $data = json_decode($response->raw_body,true);   
        if($data['meta']['code'] == 200){
            return true;
        }else{
            return false;
        }
    }
  
}