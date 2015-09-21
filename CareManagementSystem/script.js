var canvas = document.getElementById('mycanvas');
var ctx = canvas.getContext("2d");
var floorSelect = document.getElementById("floor_select");

var array = [];

var first = [];
var allBeacons = {};
var allFloors = {};
var allSensors = {};

var pageYoffset = 0;
var pageXoffset = 0;

var selected = false;

var imgWidth = document.getElementById("myimage").width;
var imgHeight = document.getElementById("myimage").height;
var actualWidth;
var actualHeight;

//drawFootPrint(120,250,90);

drawAPs(100, 400);
drawAPs(400, 50);
drawAPs(800, 350);

//get all beacons
$.ajax({
    url: 'http://commandpushingtodevice.mybluemix.net/api/beacon/list',
    type: "GET",
    success: function(response) {
        //alert('all clients: ' + response);
        var string = "";
        // this is executed when ajax call finished well
        var jsonData = JSON.parse(response);
        for (var i = 0; i < jsonData.beacons.length; i++) {
            var client = jsonData.beacons[i];
            allBeacons[client.id] = client;
        }
        //alert('all clients: ' + string);
        console.log("going to set interval for all beacons " + jsonData.beacons.length);
        for (var i in allBeacons) {
            console.log("set interval for " + i);
            startGetClientPos(allBeacons[i], 1000);
        }
    },
    error: function(xhr, status, error) {
        if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
    }
});

//get all floors
$.ajax({
    url: 'http://commandpushingtodevice.mybluemix.net/api/getData/floors?siteId=z1i30t4p',
    type: "GET",
    success: function(response) {
        //alert('all clients: ' + response);
        var string = "";
        // this is executed when ajax call finished well
        var jsonData = JSON.parse(response);

        //dun remove the 1st item
        while (floorSelect.options.length > 1) {
            floorSelect.remove(1);
        }
        for (var i = 0; i < jsonData.floors.length; i++) {
            var floor = jsonData.floors[i];
            allFloors[floor.floorId] = floor;
            //update view
            var option = document.createElement("option");
            option.text = floor.name;
            option.value = floor.floorId;
            floorSelect.add(option, i + 1);
        }
        floorSelect.addEventListener("change", function() {
            var image = document.getElementById("myimage");
            if (image) {
                if (allFloors[floorSelect.options[floorSelect.selectedIndex].value]) {
                    //image.src = allFloors[select.options[select.selectedIndex].value].imageURL;
                    $.ajax({

                        // target url/service
                        //url: allFloors[select.options[select.selectedIndex].value].imageURL,
                        url: "getImage.php",
                        type: "POST",
                        data: ({
                            url: allFloors[floorSelect.options[floorSelect.selectedIndex].value].imageURL
                        }),
                        error: function(xhr, ajaxOptions, thrownError) {
                            // reset or whatever
                            console.log("error getting image");
                        },
                        success: function(img) {
                            image.src = "data:image/png;base64," + img;
                            /*
                                var widthStr = allFloors[floorSelect.options[floorSelect.selectedIndex].value].width+"px";
                                var heightStr = allFloors[floorSelect.options[floorSelect.selectedIndex].value].height+"px";

                                var mydivContainer = document.getElementById("mydiv");
                                mydivContainer.style.width = widthStr;
                                mydivContainer.style.height = heightStr;

                                var imgContainerContainer = document.getElementById("imgContainer");
                                imgContainerContainer.style.width = widthStr;
                                imgContainerContainer.style.height = heightStr;

                                var myimageContainer = document.getElementById("myimage");
                                myimageContainer.style.width = widthStr;
                                myimageContainer.style.height = heightStr;

                                var mycanvasContainer = document.getElementById("mycanvas");
                                mycanvasContainer.style.width = widthStr;
                                mycanvasContainer.style.height = heightStr;
                            */
                            actualWidth = allFloors[floorSelect.options[floorSelect.selectedIndex].value].width;
                            actualHeight = allFloors[floorSelect.options[floorSelect.selectedIndex].value].height;
                        }
                    });
                }
            }
            getSensors(floorSelect.options[floorSelect.selectedIndex].value);
        });
    },
    error: function(xhr, status, error) {
        if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
    }
});

//get all sensors
function getSensors(floorid) {
    $.ajax({
        url: 'http://commandpushingtodevice.mybluemix.net/api/sensor/list?siteId=z1i30t4p&floorId=' + floorid,
        type: "GET",
        success: function(response) {
            //alert('all clients: ' + response);
            var string = "";
            // this is executed when ajax call finished well
            var jsonData = JSON.parse(response);
            //clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < jsonData.sensors.length; i++) {
                var dongle = jsonData.sensors[i];
                allSensors[dongle.id] = dongle;
                console.log("drawing sensor x " + dongle.x + " y " + dongle.y);
                drawAPs(dongle.x, dongle.y);
            }
            //alert('all clients: ' + string);
            console.log("got sensors " + jsonData.sensors.length);
        },
        error: function(xhr, status, error) {
            if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
        }
    });
}

/*
var intervalId = setInterval(function() {
    //call $.ajax here
    $.ajax({
        url: 'dbConnect.php',
        type: "POST",
        data: ({time: "12:00:00"}),
        success: function (response) {
            //alert('all clients: ' + response);
            var string = "";
            // this is executed when ajax call finished well
            var jsonData = JSON.parse(response);
            for (var i = 0; i < jsonData.clients.length; i++) {
                var client = jsonData.clients[i];
                console.log(client.clientID);
                string = string + ", " + client.clientID;
                var xPos = parseInt(client.x);
                var yPos = parseInt(client.y);
                var xPosAfterOffset = xPos + pageXoffset;
                var yPosAfterOffset = yPos + pageYoffset;
                drawOldPeople(xPosAfterOffset.toString(), yPosAfterOffset.toString(), client.clientID);
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
*/

function startGetClientPos(client, duration) {
    //call $.ajax here
    $.ajax({
        url: 'http://commandpushingtodevice.mybluemix.net/api/position/full?siteId=z1i30t4p&floorId=7cim0o6e&beaconId=' + client.mac,
        type: "GET",
        data: ({}),
        success: function(response) {
            console.log(" gotten client " + client.id + "data " + response);
            //alert('all clients: ' + response);
            var string = "";
            // this is executed when ajax call finished well
            var jsonData = JSON.parse(response);
            drawOldPeople(jsonData.x, jsonData.y, client.id);
            setTimeout(startGetClientPos(client, duration), duration);
            //alert('all clients: ' + string);
        },
        error: function(xhr, status, error) {
            clearInterval(intervalId);
            alert('error: ' + error + " status " + status);
            // executed if something went wrong during call
            if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
            setTimeout(startGetClientPos(client, duration), duration);
        }
    });
};

function drawAPs(x, y) {
    var image = new Image();
    x = findRelativePixels(x, actualWidth, imgWidth);
    y = findRelativePixels(y, actualHeight, imgHeight);
    image.onload = function () {
        ctx.save();
        ctx.translate(x, y);
        ctx.drawImage(image, 0, 0, 50, 50 * image.height / image.width);
        ctx.restore();
    }
    image.src = "img/wifi_flat_circle_icon.png";
}

function drawOldPeople(x, y, name) {
    var clientDiv = document.getElementById(name + "_client");
    x = findRelativePixels(x, actualWidth, imgWidth);
    y = findRelativePixels(y, actualHeight, imgHeight);
    if (clientDiv) {
        clientDiv.style.top = y + "px";
        clientDiv.style.left = x + "px";
    } else {
        var myDiv = document.createElement('div');
        myDiv.className = "parent grow";
        myDiv.style.position = "absolute";
        myDiv.style.top = y + "px";
        myDiv.style.left = x + "px";
        myDiv.id = name + "_client";
        var image = document.createElement('img');
        image.className = "peopleIcon ";
        image.src = "img/human_icon.png";
        //document.getElementById("iconsHolder").appendChild(image);
        //image.style.position = "absolute";
        //image.style.top = x+"px";
        //image.style.left = y+"px";
        myDiv.appendChild(image);

        var popupBG = document.createElement('img');
        popupBG.src = "img/speech_bubble.png";
        var popupText = document.createElement('p');
        var linkText = document.createTextNode("Hi, I am " + name);
        popupText.appendChild(linkText);
        popupBG.className = "popup popupBG";
        popupText.className = "popup popupText";
        myDiv.appendChild(popupBG);
        myDiv.appendChild(popupText);
        document.getElementById("iconsHolder").appendChild(myDiv);
    }

    function findRelativePixels(x, actual, imgSize) {
        var ratio = actual / imgSize;
        return x * ratio;
    }
}