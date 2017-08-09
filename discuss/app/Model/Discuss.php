<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Discuss extends Model
{
    
    public static function discuss($aid, $info = array())
    {
        $headers = array("Accept" => "application/json");
        if(empty($info)){
            return \Unirest\Request::get(\Config::get('app.site_api')."/article/".$aid."/discuss", $headers);
        }else{
            return \Unirest\Request::post(\Config::get('app.site_api')."/article/".$aid."/discuss", $headers, $info);
        }
    }

    public static function likes($info, $did, $status)
    {
        $headers = array("Accept" => "application/json");
        if($status == 1){
            return \Unirest\Request::put(\Config::get('app.site_api')."/discuss/".$did."/cancel-likes", $headers, http_build_query($info));
        }else{
            return \Unirest\Request::put(\Config::get('app.site_api')."/discuss/".$did."/likes", $headers, http_build_query($info));
        }
    }

    public static function deleteDiscuss($info, $did, $aid)
    {
        $headers = array("Accept" => "application/json");
        return \Unirest\Request::delete(\Config::get('app.site_api')."/article/".$aid."/discuss/".$did, $headers, http_build_query($info));
    }

    public static function islogin($params)
    {
        $headers = array("Accept" => "application/json");
        return \Unirest\Request::post(\Config::get('app.site_uc')."/user/islogin", $headers, $params);
    }

    public static function sign($params)
    {
        $headers = array("Accept" => "application/json");
        $data = \Unirest\Request::post(\Config::get('app.site_api')."/sign/in", $headers, $params);
        return json_decode($data->raw_body, true);
    }
}
