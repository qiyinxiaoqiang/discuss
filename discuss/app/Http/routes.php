<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

//评论
Route::get('discuss/test','DiscussController@test');
Route::get('discuss/islogin','DiscussController@islogin');
Route::post('discuss/likes','DiscussController@likes');
Route::post('discuss/sign','DiscussController@sign');
Route::post('discuss/destroy','DiscussController@destroy');
Route::resource('discuss','DiscussController');
