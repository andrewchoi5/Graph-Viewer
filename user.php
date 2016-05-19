<?php 
	function getusername(){
		echo $_SERVER['LOGON_USER'];
		$user_chunks = explode("\\",$_SERVER['LOGON_USER']);
		// $user_domain = $user_chunks[0];
		return $user_chunks[1];
	}
?>