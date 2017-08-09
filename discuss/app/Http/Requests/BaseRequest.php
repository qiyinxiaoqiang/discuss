<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;
use Illuminate\Http\Response;
use \Firebase\JWT\JWT;


class BaseRequest extends Request
{
    /**
     * 可选: 重写基类方法，自定义子类 authorize()错误返回 
     * 重写 forbiddenResponse方法,DemoRequest.php中 authorize方法 return false后调用此方法
     * 如果不重写此方案，将返回laravel默认的401头，不会返回自定义的json
     * @return [type] [description]
     */
    public function forbiddenResponse() {
        $content = ['code'=>'401','message'=>'Forbidden'];
        $status = '401';
        $value = 'text/json';
        return response($content, $status)
              ->header('Content-Type', $value);
    }

    /**
     * 验证token 是否过期，是否正常
     *
     * @return false|object 
     */
    public function checkToken() {
        if(! $decodeToken = $this->parseToken($header = 'authorization', $method = 'bearer', $query = 'token')) { 
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
    public function parseToken($header = 'authorization', $method = 'bearer', $query = 'token')
    {
        if (! $token = $this->parseAuthHeader($header, $method)) {
            if (! $token = Request::input($query)) {
                \Log::error(__METHOD__.'=>token error or undefinded');
                return false;
            }
        }
        if (count(explode('.', $token)) !== 3) {
            \Log::error(__METHOD__.'=>Wrong number of segments');
            return false;
            
        }
        $decodeToken = (array)JWT::decode($token, 'example_key', array('HS256'));
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
        $header = Request::header($header);

        if (! starts_with(strtolower($header), $method)) {
            return false;
        }

        return trim(str_ireplace($method, '', $header));
    }

    

    private function getKey($appid) {
        return env('JWT_KEY', '');
    }
}