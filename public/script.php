<?php

function halt($array) {
	header('Content-Type: application/json');

	$json = json_encode($array);
	exit($json);
}

function init($redis, $key) {
	if(!$redis->ping())
		halt(['error' => 'redis down']);

	if(isset($_POST['increment']))
		return $redis->incr($key);

	return halt(['success' => $redis->get($key)]);
}

{
	$redis = new Redis();
	$redis->connect('127.0.0.1', 6379);

	init($redis, "september_all");
}
