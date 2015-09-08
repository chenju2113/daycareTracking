<?php
	//echo json_encode($tags);
	
    $macaddress = $_POST["mac"];
	$server = 'localhost';
	$user = 'root';
	$pass = 'Lifebook2006';
	$dbname = 'adobe';
	$con = mysqli_connect($server, $user, $pass,$dbname) or die("Can't connect");
	
    if ($macaddress==""){
		$query="SELECT * FROM movement ORDER BY id";
	}
	else {
		$query ="SELECT * FROM movement WHERE mac='".$macaddress."' ORDER BY id";
	}
	$res=mysqli_query($con, $query);//$db->query($query);
        //echo $res[0][0];
	$points_array = array();
	if($res==FALSE){
            echo "fail...\n";
        }
        while ($row = mysqli_fetch_row($res)){
        	$x = $row[2] * 900;
        	$y = $row[3] * 600;
			array_push($points_array,$x,$y);
	};    
	echo json_encode($points_array);	
?>
