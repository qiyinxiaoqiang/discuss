<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;;
use App\Http\Requests;
use App\Model\Discuss;

use App\Http\Controllers\Controller;
use App\Model\Common;

class DiscussController extends Controller
{

    public function __construct(Request $request)
    {
        header("Access-Control-Allow-Credentials: true");
        //header("Access-Control-Allow-Origin: ".env('SITE_UC', ''));
        $referer = $request->header('referer');
        if(!empty($referer)){
            $host = parse_url($referer)['host'];
            header("Access-Control-Allow-Origin: http://".$host);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        
        return view('default.discuss.index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    { 

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            "title"     => "required",
            "url"       => "required",
            "author_id" => "required", //文章所属用户id
            "fid"       => "required",
            "body"      => "required",
            "anonymous" => "required",
            "nick"      => "required",
        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        $token =  \Cookie::get('BC_TK');
        $title = $request->input('title');
        $url = $request->input('url');
        $params = [
            "title"     => addslashes($title),
            "url"       => addslashes($url),
            "author_id" => $request->input('author_id'), //文章所属用户id
            "fid"       => $request->input('fid'),
            "body"      => $request->input('body'),
            "at"        => $request->input('at'),
            'anonymous' => $request->input('anonymous'),
            'nick'      => $request->input('nick'),
            'avatar'    => $request->input('avatar'),
            'token'     => $token,
            'ip'        => $request->ip()
        ];
        $aid = $request->input('aid');
        $res = Discuss::discuss($aid,$params);
        $data = json_decode($res->raw_body, true);
        return response()->json($data)->setCallback($request->input('callback'));
        //return $callback.$res->raw_body;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $aid)
    {
        $res = Discuss::discuss($aid);
        $data = json_decode($res->raw_body, true);
        return response()->json($data)->setCallback($request->input('callback'));

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'aid'       => 'required',
            'did'       => 'required',
        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        $token =  \Cookie::get('BC_TK'); 
        $params = [
            'token' => $token,
        ];
        $aid = $request->input('aid');
        $did = $request->input('did');
        $callback = $request->input('callback');
        $res= Discuss::deleteDiscuss($params, $did, $aid);
        $data = json_decode($res->raw_body, true);
        return response()->json($data)->setCallback($request->input('callback'));
        //return $callback.$data->raw_body;
    }

    public function test()
    {
        return view('default.discuss.test');
    }


    public function likes(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'did'       => 'required',
            'status'    => 'required',
        ]);
        if ($validator->fails()) {
            return $this->returnCode(400,'',$validator->errors()->all());
        }
        $token =  \Cookie::get('BC_TK');
        $params = [
            'token' => $token,
        ];
        $did = $request->input('did');
        $status = $request->input('status');
        $callback = $request->input('callback');
        $res= Discuss::likes($params, $did, $status);
        $data = json_decode($res->raw_body, true);
        return response()->json($data)->setCallback($request->input('callback'));
        //return $callback.$data->raw_body;

    }


    public function islogin(Request $request)
    {
        $params = [
            'callback' => $request->input('callback'),
        ];
        $res = Discuss::islogin($params);
        return $res->raw_body;
    }

    public function sign(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'accout' => 'required|min:3|max:30',
            'password' => 'required',
        ]);
        if ($validator->fails()) { 
            return  $validator->errors()->all(); 
        }
        $params = [
            'accout' => strtolower(trim($request->input('accout'))),
            'password' => $request->input('password'),
        ];
        $data = Discuss::sign($params);
        if(isset($data['data']['token'])){
            
            \Cookie::queue(env('BC_TK', 'BC_TK'),$data['data']['token'],env('JWT_EXP',21600));
            if(is_array($data['data']['user_bind']) && count($data['data']['user_bind']) !==0){
                foreach($data['data']['user_bind'] as $key=>$value){
                    $par = "refreshtoken".$value;
                    $r[$par] = $data['data']['token'].$value;
                }
            }
            //,null,env('SITE_DOMAIN', ''),false,true
            \Cookie::queue(env('BC_UI', 'BC_UI'),$data['data']['uid'].'||'.$data['data']['name'].'||'.json_encode($r),env('JWT_EXP',21600)); 
            $data['data']['userinfo'] =  Common::userExt($data['data']['uid']);  
            $ctoken = \Crypt::encrypt($data['data']['token']);
            $data['data']['ctoken'] = $ctoken;
        }else{
            $data =  [ 
                'meta'=>[
                    'code'=>'401',
                    'message'=>'login error',
                        ] 
                ];
        }
        return response()->json($data);
    }

}
