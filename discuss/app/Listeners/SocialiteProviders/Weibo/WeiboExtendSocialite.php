<?php

namespace App\Listeners\SocialiteProviders\Weibo;

use App\Events\SocialiteProviders\Manager\SocialiteWasCalled;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class WeiboExtendSocialite
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
     * @param  SocialiteWasCalled  $event
     * @return void
     */
    public function handle(SocialiteWasCalled $event)
    {
        //
    }
}
