<?php

namespace App\Http\Middleware;

use Closure;
use App\Model\Auth;
use \Firebase\JWT\JWT;
//use Illuminate\Support\Facades\Redirect;
class JwtAuthenticate
{
    public $encodeToken;
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    { 
        if(!$this->checkToken()) {
//        	error_log('error',$this->checkToken(),'D:/11.txt');
        	
            if ($request->ajax())
            {
                return  
                [
                    'meta'=>[
                        'code'=>401,
                        'message'=>'Unauthorized',
                   ]
                ];
            }
            return \Redirect::to('sign/in');
            
        }
        $request->jwt = [
            'encode'=>$this->encodeToken,
            'decode'=>$this->checkToken(),
        ];
        
        return $next($request);
    }



    /**
     * 验证token 是否过期，是否正常
     *
     * @return false|object 
     */
    public function checkToken() {
       
        if(! $decodeToken = $this->parseToken($header = 'authorization', $method = 'bearer', $query = 'BC_TK')) { 
            return false;
        }
        return $decodeToken;
        
    }

    /**
     * 两种方式解析token,一个是http头，一个是传参数,返回解析后的token
     *
     * @param string $header
     * @param string $method
     * @param string $query
     *
     * @return false|object
     */
    public function parseToken($header = 'authorization', $method = 'bearer', $query = 'BC_TK')
    {

        if (! $token = $this->parseAuthHeader($header, $method)) {
            if (! $token = \Request::input($query)) {
                if(! $token = \Request::cookie($query)) {
                    \Log::error(__METHOD__.'=>token error or undefinded');
                    return false;
                }
            }
        }
        if (count(explode('.', $token)) !== 3) {
            \Log::error(__METHOD__.'=>Wrong number of segments');
            return false;
            
        }
        if(Auth::isJwtExists($token) != 1) {
            \Log::error(__METHOD__.'=>token not exists or expire');
            return false;
        }
        $this->encodeToken = $token;
        $decodeToken = (array)JWT::decode($token, env('JWT_KEY', ''), array('HS256'));
        //print_r($decodeToken);
        return $decodeToken;
    }

    /**
     * Parse token from the authorization header.
     *
     * @param string $header
     * @param string $method
     *
     * @return false|string
     */
    protected function parseAuthHeader($header = 'authorization', $method = 'bearer')
    {
        $header = \Request::header($header);

        if (! starts_with(strtolower($header), $method)) {
            return false;
        }

        return trim(str_ireplace($method, '', $header));
    }




    

    
}
