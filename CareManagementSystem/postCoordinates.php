<?php
// get device MAC & coordinates
if(isset($_POST['results']))
	$results = $_POST['results'];
$json = json_decode($results, true);
$coordinates = $json["coordinates"];
$mac = $json["mac"];
// echo $coordinates . " mac " . $mac;

// validation if device MAC & coordinates are inputed
if(!is_null($mac)&&!is_null($coordinates)) {

	// Connection to database to pull deviceToken ids
	$dbhost = 'localhost';
	$dbuser = 'root';
	$dbpass = 'Lifebook2006';
	$dbname = 'adobe';

	// Create connection
	$conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);
	// Check connection
	if (!$conn) {
		echo "{\"Code\":\"1\"}"; //Error: " . $sql . "<br>" . mysqli_error($conn)
 		exit(1); //die("Connection failed: " . mysqli_connect_error());
 	}

 	$boo = true;
 	for($i = 0; $i < count($coordinates); $i++){
 		$ArrCorrdinate = $coordinates[$i];
 		$deviceX = $ArrCorrdinate[0];
 		$deviceY = $ArrCorrdinate[1];
		//echo "deviceX is " . $deviceX;
		//echo "deviceY is " . $deviceY;
		// Insert values
 		$sql = "INSERT INTO movement(mac, x, y) VALUES ('$mac', '$deviceX', '$deviceY')";

 		if (!mysqli_query($conn, $sql)) {
 			$boo = false;
 		}
 	}

 	if ($boo) {
 		echo "{\"Code\":\"0\"}";
 	}
 	else {
		echo "{\"Code\":\"2\"}"; //Error: " . $sql . "<br>" . mysqli_error($conn));
	}
	mysqli_close($conn);
} else {
	echo "{\"Code\":\"1\"}";
	// json_encode("1"); //Error: " . $sql . "<br>" . mysqli_error($conn)
 	exit(1); // die("Nothing entered.");
 }
 ?>