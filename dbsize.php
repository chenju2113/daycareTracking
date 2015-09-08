<?php
	//echo json_encode($tags);

	$server = 'localhost';
	$user = 'root';
	$pass = '';
	$dbname = 'zone_selection';
	$con = mysql_connect($server, $user, $pass) or die("Can't connect");
	mysql_select_db($dbname);
	
	$db = new mysqli($server, $user, $pass, $dbname);
	$query ="SELECT COUNT(*) FROM STEPS;";
	//echo $query;
	$res=$db->query($query);
	$row = mysqli_fetch_row($res);
    
	echo $row[0];
	

?>