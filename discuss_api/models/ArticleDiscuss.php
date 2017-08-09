<?php namespace App\Model;
use Moloquent as Eloquent;
use Input, Request, Cache, Redis2;
//use App\Model\Publicm; 

class ArticleDiscuss extends Eloquent
{
    protected $connection = 'discuss';
    protected $collection = 'discusses';
    //protected $primaryKey = 'did';//定义主键
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = ['_id']; 
    // public function getBodyAttribute($value)
    // {
    //     return $value.'entere';
    // }

    //新增文章
    public static function store($params)
    {
        return ArticleDiscuss::create($params);
    }
    
    public static function index($aid)
    {
        $data = ArticleDiscuss::select('discuss')
                            ->where('article.aid', $aid)
                            ->orderBy('discuss.add_time', 'asc')
                            // ->where('discuss.status', '!=', 'delete')
                            // ->where('discuss.status', '!=', 'spam')
                            ->get()
                            ->toArray();
        if(!empty($data)){
            foreach ($data as $key => $value) {
                $user = \DB::connection('mongodb')
                    ->table('users')
                    ->select('name', 'nickname', 'avatar', 'group_id')
                    ->where('uid', intval($value['discuss']['user']['user_id']))
                    ->first();
                $data[$key]['discuss']['user']['name'] = $user['name'];
                if(!empty($user['avatar']) && $value['discuss']['anonymous'] == 'n'){
                    $data[$key]['discuss']['user']['avatar'] = $user['avatar'];
                }elseif($value['discuss']['anonymous'] == 'y'){
                    $data[$key]['discuss']['user']['avatar'] = $value['discuss']['user']['avatar'];
                }else{
                    $data[$key]['discuss']['user']['avatar'] = '';
                }
                if(!empty($user['nickname']) && $value['discuss']['anonymous'] == 'n' && $user['group_id'] == 200){
                    $data[$key]['discuss']['user']['nick'] = $user['nickname'];
                }else{
                    $data[$key]['discuss']['user']['nick'] = $value['discuss']['user']['nick'];
                }
                $data[$key]['discuss']['user']['group_id'] = $user['group_id'];
            }
        }
        return $data;
    }


    public static function fidTree($aid,$did)
    {
        return ArticleDiscuss::select('discuss')
                            ->where('article.aid', $aid)
                            ->where('discuss.did',$did)
                            ->first()
                            ;
    }

    public static function likes($did,$user_id)
    {
        ArticleDiscuss::where('discuss.did','=',$did)->push('discuss.like.user_ids',$user_id);
        return ArticleDiscuss::where('discuss.did','=',$did)->increment('discuss.like.total',1);
        
    }

    public static function cancelLikes($did,$user_id)
    {
        ArticleDiscuss::where('discuss.did','=',$did)->pull('discuss.like.user_ids',$user_id);
        return ArticleDiscuss::where('discuss.did','=',$did)->decrement('discuss.like.total',1);
        
    }

    public static function del($params,$aid,$did,$user_id)
    {
        
        return ArticleDiscuss::where('discuss.did','=',$did)
                ->where('discuss.user.user_id',$user_id)
                ->update($params);
        
    }

    public static function info($did)
    {
        return ArticleDiscuss::where('discuss.did', intval($did))
                ->where('discuss.state', '!=', 'spam')
                ->where('discuss.state', '!=', 'delete')
                ->first();
    }
    
    
    
    
    

}