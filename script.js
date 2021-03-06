var ctx = document.getElementById("mycanvas").getContext("2d");
var array = [];

var first = [];
var pageYoffset = 0;
var pageXoffset = 0;

var selected = false;

var pic = new Image();
pic.src="./img/ICUBE_L3.jpg";
var picw = pic.width;
var pich = pic.height;
var width;
var height;

if (picw/pich > 2){
	width = 1000;
	height = 1000*pich/picw;
}
else {
	width = 500*picw/pich;
	height = 500;
}
//drawFootPrint(120,250,90);
$("#macaddress").keyup(function(event){
    if(event.keyCode == 13){
        $("#go").click();
    }
});
$("#go").click(function(){
	var mac = $.trim($("#macaddress").val());
	if ((mac.length!=0)&&(mac.length!=17)){
		return;
	}
	ctx.clearRect(0, 0, width, height);
	drawAllFootPrint(mac);	
});

drawAPs(100,400);
drawAPs(400,50);
drawAPs(800,350);

/*
setInterval(function () {
	var size = 0;
	$.get("dbsize.php",{}).done(function(data){
		if (data != size){
			alert("changed.");
			drawAllFootPrint();
			size = data;
		}
    });
}, 1000);
*/

var intervalId = setInterval(function() {
    //call $.ajax here
	$.ajax({
		url: 'dbConnect.php',
		type: "POST",
		data: ({time: "12:00:00"}),
		success: function (response) {
		    console.log("succesffully get from db connect php");
			//alert('all clients: ' + response);
			var string = "";
		    // this is executed when ajax call finished well
			console.log("res " + response);
			if (response) {
			    var jsonData = JSON.parse(response);
			    console.log("succesfully parsed JSON" + jsonData);
			    for (var i = 0; i < jsonData.clients.length; i++) {
			        var client = jsonData.clients[i];
			        console.log("client i " + i +" client " + client);
			        console.log(client.clientID);
			        string = string + ", " + client.clientID;
			        console.log("client.x " + client.x);
			        console.log("client.y " + client.y);
                    //x and y are arrays
			        var xPos = parseInt(client.x);
			        var yPos = parseInt(client.y);
			        var xPosAfterOffset = xPos + pageXoffset;
			        var yPosAfterOffset = yPos + pageYoffset;
			        console.log("xPosAfterOffset " + xPosAfterOffset);
			        console.log("yPosAfterOffset " + yPosAfterOffset);
			        drawOldPeople(xPosAfterOffset.toString(), yPosAfterOffset.toString(), client.clientID);
			    }
			}
			//alert('all clients: ' + string);
		},
		error: function (xhr, status, error) {
			clearInterval(intervalId);
			alert('error: '+error + " status "+status );
			// executed if something went wrong during call
			if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
		}
	});
}, 3000);

function drawAllFootPrint(mac){
	$.post("allpoints.php",{
		mac:mac
	}).done(function(data){
		var points = JSON.parse(data);
		var lastone = [points[0],points[1]];
		var angle = 90;
		drawFootPrint(points[0],points[1],angle);
		var thisone = [];
		for (var i = 1; i < points.length/2; i ++){
			thisone = [points[i*2],points[i*2+1]];
			var dy = -(thisone[1]-lastone[1]);
			var dx = thisone[0]-lastone[0];
			if (dx != 0){
				if (dy > 0){
					angle = 180/Math.PI*Math.atan(dy/dx);
				}
				else {
					angle = 180/Math.PI*Math.atan(dy/dx)+180;
				}
				alert(points+"\n"+"(thisone y - lastone y):"+thisone[1]+"-"+lastone[1]+"="+dy+"\n(thisone x - lastone x):"+thisone[0]+"-"+lastone[0]+"="+dx+"\n"+angle);
			}			   		
		    drawFootPrint(points[i*2],points[i*2+1],angle);
			lastone = thisone;
	    }
	})
	
}
function drawFootPrint(x,y,angle){
	var image = new Image();
	image.onload=function(){
		ctx.save();
		ctx.translate(x,y);
		ctx.rotate(angle*Math.PI/180.0);
		ctx.drawImage(image,0,0,25,25 * image.height / image.width);
		ctx.restore();
	}
	image.src="pair.png";
}

function drawAPs(x,y){
	var image = new Image();
	
	image.onload=function(){
		ctx.save();
		ctx.translate(x,y);
		ctx.drawImage(image,0,0,50,50 * image.height / image.width);
		ctx.restore();
	}
	image.src="img/wifi_flat_circle_icon.png";
}

function drawOldPeople(x,y,name){
	var clientDiv = document.getElementById(name+"_client");
	if(clientDiv){
		clientDiv.style.top = y+"px";
		clientDiv.style.left = x+"px";
	}else{
		var myDiv = document.createElement('div');
		myDiv.className = "parent grow";
		myDiv.style.position = "absolute";
		myDiv.style.top = y+"px";
		myDiv.style.left = x+"px";
		myDiv.id = name+"_client";
		var image = document.createElement('img');
		image.className = "peopleIcon ";
		image.src="img/human_icon.png";
		//document.getElementById("iconsHolder").appendChild(image);
		//image.style.position = "absolute";
		//image.style.top = x+"px";
		//image.style.left = y+"px";
		myDiv.appendChild(image);
		
		var popupBG = document.createElement('img');
		popupBG.src="img/speech_bubble.png";
		var popupText = document.createElement('p');
		var linkText = document.createTextNode("Hi, I am "+name);
		popupText.appendChild(linkText);
		popupBG.className = "popup popupBG";
		popupText.className = "popup popupText";
		myDiv.appendChild(popupBG);
		myDiv.appendChild(popupText);
		document.getElementById("iconsHolder").appendChild(myDiv);
	}
}

