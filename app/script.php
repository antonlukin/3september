<?php

function halt($array) {
    header('Content-Type: application/json');

    $json = json_encode($array);
    exit($json);
}

function init($redis, $key) {
	if(!$redis->ping()) {
		halt(['error' => 'redis down']);
	}

	if(isset($_POST['increment'])) {
		return $redis->incr($key);
	}

    return halt(['success' => $redis->get($key)]);
}

{
	if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		$redis = new Redis();
		$redis->connect('127.0.0.1', 6379);

		init($redis, "september_all");
	} else {
		halt(['error' => 'Ajax referer missing']);
	}
}
