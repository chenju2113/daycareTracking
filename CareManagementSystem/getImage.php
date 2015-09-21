<?php

// get request
function get_web_page( $url, $username, $password )
{
    $headers = array(
        'Content-Type:application/json',
        'Authorization: Basic '. base64_encode( $username . ":" . $password )
        );
    $options = array(
        CURLOPT_RETURNTRANSFER => true,     	// return web page
        CURLOPT_HEADER         => false,    	// don't return headers
        CURLOPT_FOLLOWLOCATION => true,     	// follow redirects
        CURLOPT_ENCODING       => "",       	// handle all encodings
        CURLOPT_USERAGENT      => "accufind", 	// who am i
        CURLOPT_AUTOREFERER    => true,     	// set referer on redirect
        CURLOPT_CONNECTTIMEOUT => 120,      	// timeout on connect
        CURLOPT_TIMEOUT        => 120,      	// timeout on response
        CURLOPT_MAXREDIRS      => 10,       	// stop after 10 redirects
        CURLOPT_SSL_VERIFYPEER => false     	// Disabled SSL Cert checks
        );

    $ch      = curl_init( $url );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers );
    curl_setopt_array( $ch, $options );
    $content = curl_exec( $ch );
    $err     = curl_errno( $ch );
    $errmsg  = curl_error( $ch );
    $header  = curl_getinfo( $ch );
    curl_close( $ch );

    $header['errno']   = $err;
    $header['errmsg']  = $errmsg;
    $header['content'] = $content;
    return $header;
}



$imgURL = $_POST['url'];
// validation if device MAC & coordinates are inputed
if(!is_null($imgURL)) {
	$user = "38iq0v9r";
    $token = "JkEEGRV_v56W";
    $response = get_web_page($imgURL, $user, $token);
    $im = imagecreatefromstring($data);
    $encoded = base64_encode($response["content"]);
    echo $encoded;
} else {
	echo "{\"Code\":\"1\"}";
 	exit(1); // die("Nothing entered.");
 }


?>