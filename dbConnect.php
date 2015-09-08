<?php

$myServer = "tcp:161.202.19.117,1433";
$myServerWithPort = "161.202.19.117,1433";
$serverName = "mssql_elder_care";
$myUser = "sa";
$myPass = "Lifebook2006";
$myDB = "cms_test"; 
//table names
$tableClient = "client";
$tableLocation = "location";
$tableSimulator = "simulator";
$clientID = 1;

//Parameters
$time = $_POST['time'];
//echo $time;
/*
Server: dfssjvry4v.database.windows.net,1433 
SQL Database: cms_test
User Name: accufind
Server: dfssjvry4v.database.windows.net,1433 \r\nSQL Database: cms_test\r\nUser Name: accufind\r\n\r\n
PHP Data Objects(PDO) Sample Code:\r\n\r\ntry {\r\n   
$conn = new PDO ( \"sqlsrv:server = tcp:dfssjvry4v.database.windows.net,1433; Database = cms_test\", \"accufind\", \"{your_password_here}\");\r\n    
$conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );\r\n}\r\ncatch ( PDOException $e ) {\r\n   print( \"Error connecting to SQL Server.\" );\r\n   die(print_r($e));\r\n}\r\n\rSQL Server Extension Sample Code:\r\n\r\n$connectionInfo = array(\"UID\" => \"accufind@dfssjvry4v\", \"pwd\" => \"{your_password_here}\", \"Database\" => \"cms_test\", \"LoginTimeout\" => 30, \"Encrypt\" => 1);\r\n$serverName = \"tcp:dfssjvry4v.database.windows.net,1433\";\r\n$conn = sqlsrv_connect($serverName, $connectionInfo);
$connectionInfo = array(\"UID\" => \"accufind@dfssjvry4v\", \"pwd\" => \"{your_password_here}\", \"Database\" => \"cms_test\", \"LoginTimeout\" => 30, \"Encrypt\" => 1);
$serverName = \"tcp:dfssjvry4v.database.windows.net,1433\";
$conn = sqlsrv_connect($serverName, $connectionInfo);
*/
try {
	$conn = new PDO ( "sqlsrv:server = tcp:161.202.19.117,1433; Database = cms_test", "sa", "Lifebook2006");
	$conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
}catch ( PDOException $e ) {  
	print( "Error connecting to SQL Server." );
	die(print_r($e));
}
//$connectionInfo = array( "Database"=>"cms_test", "UID"=>"accufind@dfssjvry4v", "pwd"=>"Lifebook2006");
//$conn  = sqlsrv_connect("tcp:dfssjvry4v.database.windows.net,1433",$connectionInfo) or die("Couldn't connect to SQL Server on $myServer"); 
if ($conn) {
    //echo "Connection established.";
	//console.log(" connected to SQL Server." );
	//print( " connected to SQL Server." );
} else{
    die("Connection could not be established.");
}
//select a database to work with
/*
$selected = mssql_select_db($myDB, $dbhandle)
  or die("Couldn't open database $myDB"); 
*/

//declare the SQL statement that will query the database
/*
$query = "SELECT clientID, locationID, loggedTime, loggedLocation_x, loggedLocation_y ";
$query .= "FROM " . $tableSimulator . " " ;
$query .= "WHERE clientID=".$clientID.""; 
*/
$query = "SELECT * FROM simulator ORDER BY clientID ASC";
//execute the SQL query and return records
//$result = mssql_query($query);
//$result = odbc_exec($conn, $query);
//$result = sqlsrv_query( $conn, $query );
$arrayOfObjs = array();
$prevClientId = -1;
 foreach ($conn->query($query) as $row) {
	$objToReturn = new stdClass();
	$objToReturn -> clientID = $row['clientID'];
	$objToReturn -> locationID = array($row['locationID']);
	$objToReturn -> loggedTime = array($row['loggedTime']);
	$objToReturn -> x = array($row['loogedLocation_x']);
	$objToReturn -> y = array($row['loogedLocation_y']);
	array_push($arrayOfObjs, $objToReturn);
 }
/*
while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
      //echo $row['clientID'].", ".$row['locationID'].", ".$row['loggedTime'].", ".$row['loggedLocation_x'].", ".$row['loggedLocation_y']."<br />";
	if($prevClientId != $row['clientID']){
		$objToReturn = new stdClass();
		$objToReturn -> clientID = $row['clientID'];
		$objToReturn -> locationID = array($row['locationID']);
		$objToReturn -> loggedTime = array($row['loggedTime']);
		$objToReturn -> loggedLocation_x = array($row['loggedLocation_x']);
		$objToReturn -> loggedLocation_y = array($row['loggedLocation_y']);
	}else{
		
	}
	
	array_push($arrayOfObjs, $objToReturn);
}
*/
$objsToReturn = new stdClass();
$objsToReturn -> clients = $arrayOfObjs;
echo json_encode($objsToReturn);
//$numRows = mssql_num_rows($result); 
//$numRows = odbc_num_rows( $result); 
 
//echo "<h1>" . $numRows . " Row" . ($numRows == 1 ? "" : "s") . " Returned </h1>"; 

//display the results 
//while($row = mssql_fetch_array($result))
//close the connection
//odbc_close($conn);
//sqlsrv_free_stmt( $result);
//sqlsrv_close($conn); 
//echo "1";
?>