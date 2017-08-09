<?php

namespace App\Listeners;

use App\Events\UserLoginEvent;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Model\UserLog;
use App\Model\Auth;
use \Firebase\JWT\JWT;

class UserLoginEventListener
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  UserLoginEvent  $event
     * @return void
     */
    public function handle(UserLoginEvent $event)
    {
        $data = $event->data;
        return $this->createJwt($data);
        
    }


    /**
     * 身份验证创建jwt令牌,并存令牌，记录日志
     * @param  array $params 登录参数
     * @return string
     */
    private function createJwt($params) {

        $data = array(
            "iss" => $params['uid'], //who
            "exp" => time()+ env('JWT_EXP',3600*24*15),//token 15天后过期时间，unix时间戳
            "iat" => time(),//token 创建时间
            "jti" => str_ireplace('.','',microtime(true)),//当前token唯一标识
            'data' => [                  // Data related to the signer user
                'uid'   => $params['uid'], // userid from the users table
            ]
        );

        $jwt = JWT::encode($data, env('JWT_KEY', ''),'HS256');

        $setJwtParams = [
            'key' => $jwt,
            'expire' => env('JWT_EXP',3600*24*15),
            'values' => [
                'uid' => $params['uid'],
                'iat' => $data['iat'],//jwt创建时间
            ],
        ];
        $setLogParams = [
            'uid' => $params['uid'],
            'type'=> 'login',
            'action' => '登录了',
            'add_time' => time(),
            'ip' => \Request::ip(),
            'device' => \Agent::device(),//设备信息
            'platform' => \Agent::platform(),//系统信息
            'browser' => \Agent::browser(),//浏览器信息
            'agent' => \Agent::getUserAgent(),
        ];
        $this->setJwt($setJwtParams);//把jwt存入redis
        $this->setLog($setLogParams);
        return [
            'meta'=>[
                'code'=>'200',
                'message'=>'login success'
            ],
            'data'=>[
                'token'=>$jwt,
            ],
        ];
        
    }
        
    /**
     * 把jwt写入redis hash类型
     * @param [type] $params [description]
     */
    private function setJwt($params)
    {
        return Auth::setJwt($params['key'], $params['expire'], $params['values']);
    }

    /**
     * 写登录日志
     * @param [type] $params [description]
     */
    private function setLog($params)
    {
        return UserLog::create($params);
        //return \Log::info(json_encode($params));
    }

}
