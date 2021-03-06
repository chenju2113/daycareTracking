var hostnameProduction = "http://commandpushingtodevice.mybluemix.net";
var hostnameDevelopment = "http://commandpushingtodevicedev.mybluemix.net";
var hostname = hostnameProduction;

var canvas = document.getElementById('mycanvas');
var ctx = canvas.getContext("2d");
var floorSelect = document.getElementById("floor_select");

var SAFE_ZONE = 1 << 0;
var NEAR_DOOR_ZONE = 1 << 1;
var DANGER_ZONE_FAR_FROM_DOOR = 1 << 2;
var DANGER_ZONE_FAR_FROM_DONGLES = 1 << 3;
var TOILET_ZONE = 1 << 4;
var NEAR_DOOR_SAFE_ZONE = 1 << 5;
var DONGLE_EDGE_ZONE = 1 << 6;

var mapApIconOffsetX = -30;
var mapApIconOffsetY = -60;
var mapClientIconOffsetX = -20;
var mapClientIconOffsetY = -40;

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
var actualWidth = imgWidth;
var actualHeight = imgHeight;
var imgExactFitWidth = imgWidth;
var imgExactFitHeight = imgHeight;

//drawFootPrint(120,250,90);

drawAPs(100, 400, "1");
drawAPs(400, 50, "2");
drawAPs(800, 350, "3");

//get all floors
$.ajax({
    url: hostname+'/api/getData/floors?siteId=z1i30t4p',
    type: "GET",
    success: function (response) {
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
        floorSelect.addEventListener("change", function () {
            var image = document.getElementById("myimage");
            image.src = "";
            //clear APs
            var apHolder = document.getElementById("apsHolder");
            while (apHolder.firstChild) {
                apHolder.removeChild(apHolder.firstChild);
            }

            var imageLoader = document.getElementById("imageLoader");
            imageLoader.style.visibility = "visible";
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
                        error: function (xhr, ajaxOptions, thrownError) {
                            // reset or whatever
                            console.log("error getting image");
                        },
                        success: function (img) {
                            image.src = "data:image/png;base64," + img;
                            imageLoader.style.visibility = "hidden";
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
                            imgExactFitWidth = Math.min(actualWidth, imgWidth);
                            imgExactFitHeight = Math.min(actualHeight, imgHeight);
                            var widthRatio = imgWidth / actualWidth;
                            var heightRatio = imgHeight / actualHeight;

                            if (widthRatio > heightRatio) {
                                imgExactFitWidth = actualWidth * heightRatio;
                                imgExactFitHeight = actualHeight * heightRatio;
                            } else if (heightRatio > widthRatio) {
                                imgExactFitHeight = actualHeight * widthRatio;
                                imgExactFitWidth = actualWidth * widthRatio;
                            }

                            console.log("actual width " + actualWidth + " actual height " + actualHeight);
                            console.log("actual imgExactFitWidth " + imgExactFitWidth + " actual imgExactFitHeight " + imgExactFitHeight);
                            getBeacons();
                            getSensors(floorSelect.options[floorSelect.selectedIndex].value);
                        }
                    });
                }
            }

        });
    },
    error: function (xhr, status, error) {
        //if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
        console.log("floor loading error ");
    }
});

//get all beacons
function getBeacons() {
    $.ajax({
        url: hostname + '/api/beacon/list',
        type: "GET",
        success: function (response) {
            //alert('all clients: ' + response);
            var string = "";
            // this is executed when ajax call finished well
            var jsonData = JSON.parse(response);
            allBeacons = {};
            console.log("going to retrieve names for all beacons " + jsonData.beacons.length);
            for (var i = 0; i < jsonData.beacons.length; i++) {
                var client = jsonData.beacons[i];
                allBeacons[client.id] = client;

                console.log("geting Client Name with mac" + allBeacons[client.id].id);
                var clientName = getClientName(client, allBeacons[client.id].id);

                //startGetClientPos(allBeacons[i], clientName, 4000, offsetX, offsetY);
            }
            //alert('all clients: ' + string);
    
            for (var i in allBeacons) {
                //console.log("set interval for " + i);
                /* Shang: to offset it by left half its width and higher by its height
                actualWidth = allFloors[floorSelect.options[floorSelect.selectedIndex].value].width;
                            actualHeight = allFloors[floorSelect.options[floorSelect.selectedIndex].value].height;
                            imgExactFitWidth = Math.min(actualWidth, imgWidth);
                            imgExactFitHeight = Math.min(actualHeight, imgHeight);
                            var widthRatio = imgWidth / actualWidth;
                            var heightRatio = imgHeight / actualHeight; */
            }
        },
        error: function (xhr, status, error) {
            // if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
            console.log("get beacons error");
        }
    });
}

//get all sensors
function getSensors(floorid) {
    $.ajax({
        url: hostname + '/api/sensor/list?siteId=z1i30t4p&floorId=' + floorid,
        type: "GET",
        success: function (response) {
            //alert('all clients: ' + response);
            var string = "";
            // this is executed when ajax call finished well
            var jsonData = JSON.parse(response);
            //clear canvas
            var apHolder = document.getElementById("apsHolder");
            while (apHolder.firstChild) {
                apHolder.removeChild(apHolder.firstChild);
            }
            for (var i = 0; i < jsonData.sensors.length; i++) {
                var dongle = jsonData.sensors[i];
                allSensors[dongle.id] = dongle;
                console.log("drawing sensor x " + dongle.x + " y " + dongle.y);
                drawAPs(dongle.x, dongle.y, dongle.id);
            }
            //alert('all clients: ' + string);
            console.log("got sensors " + jsonData.sensors.length);
        },
        error: function (xhr, status, error) {
            //if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
            console.log("load sensors error ");
        }
    });
}

//get all sensors
function getClientName(client, beaconId) {
    console.log("inside getClientName " + beaconId);
    $.ajax({
        url: hostname + '/api/userprofile/getBeaconByBeaconId?beaconId=' + beaconId,
        type: "GET",
        data: ({}),
        success: function (response) {
            console.log("Get client's name from beaconId: " + beaconId + "data " + response);
            var jsonData1 = JSON.parse(response);
            if (jsonData1.status == 1) {
                var clientName = jsonData1.ClientName;
                console.log("client's name: " + clientName);
                var signX = generateRandom(2);
                var signY = generateRandom(2);
                var offsetX = 0;
                var offsetY = 0;
                if (signX == 0) {
                    offsetX = Math.floor(Math.random() * -25) - 5;//-generateRandom(20);
                } else {
                    offsetX = Math.floor(Math.random() * 25) + 5;//generateRandom(20);
                }
                if (signY == 0) {
                    offsetY = Math.floor(Math.random() * -25) - 5;//-generateRandom(30);
                } else {
                    offsetY = Math.floor(Math.random() * 25) + 5;//generateRandom(30);
                }
                console.log("start geting client pos " + clientName);
                startGetClientPos(client, clientName, 4000, offsetX, offsetY);
            } else {
                console.log("no such client with beaconId "+ beaconId);
            }
        },
        error: function (xhr, status, error) {
            console.log('get client pos ' + client.name + 'error: ' + error + " status " + status);
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

function startGetClientPos(client, clientName, duration, offsetX, offsetY) {
    if (client == undefined) {
        return;
    }
    console.log(" startGetClientPos " + hostname + '/api/position/full?siteId=z1i30t4p&floorId=' + floorSelect.options[floorSelect.selectedIndex].value + '&beaconId=' + client.mac);
    //call $.ajax here
    $.ajax({
        url: hostname + '/api/position/full?siteId=z1i30t4p&floorId=' + floorSelect.options[floorSelect.selectedIndex].value + '&beaconId=' + client.mac,
        type: "GET",
        data: ({}),
        success: function (response) {
            console.log(" gotten client " + clientName + " - data " + response);
            //alert('all clients: ' + response);
            var string = "";
            // this is executed when ajax call finished well
            var jsonData = JSON.parse(response);

            // Shang: added another offset to get the UI aligned 
            var valX = jsonData.x + offsetX;
            var valY = jsonData.y + offsetY;
            
            drawOldPeople(valX, valY, clientName, jsonData.dangerLevel);

            setTimeout(function () { startGetClientPos(client, clientName, duration, offsetX, offsetY) }, duration);
            //alert('all clients: ' + string);
        },
        error: function (xhr, status, error) {
            console.log('get client pos ' + client.name + 'error: ' + error + " status " + status);
            // executed if something went wrong during call
            //if (xhr.status > 0) alert('got error: ' + status); // status 0 - when load is interrupted
            setTimeout(function () { startGetClientPos(client, clientName, duration, offsetX, offsetY) }, duration);
        }
    });
};

function drawAPs(x, y, name) {
    x = findRelativePixels(x, actualWidth, imgExactFitWidth);
    y = findRelativePixels(y, actualHeight, imgExactFitHeight);
    y = imgExactFitHeight - y;

    x += mapApIconOffsetX;
    y += mapApIconOffsetY;
    /*
    var image = new Image();

    console.log("after relative pixel for drawing ap x "+x + " y " +y);
    image.onload = function () {
        ctx.save();
        ctx.translate(x, y);
        ctx.drawImage(image, 0, 0, 50, 50 * image.height / image.width);
        ctx.restore();
    }
    image.src = "img/wifi_flat_circle_icon.png";
    */

    var apDiv = document.getElementById(name + "_ap");
    if (apDiv) {
        console.log("draw new sensors actual x" + x + " actual y" + y);
        apDiv.style.top = y + "px";
        apDiv.style.left = x + "px";

    } else {
        console.log("draw new sensors actual x" + x + " actual y" + y);
        var myDiv = document.createElement('div');
        myDiv.className = "parent grow";
        myDiv.style.position = "absolute";
        myDiv.style.top = y + "px";
        myDiv.style.left = x + "px";
        myDiv.id = name + "_ap";

        // image
        var image = document.createElement('img');
        image.className = "apIcon";
        image.src = "img/wifi_flat_circle_icon.png";
        myDiv.appendChild(image);

        document.getElementById("apsHolder").appendChild(myDiv);
    }
}

function drawOldPeople(x, y, name, dangerLvl, zone) {
    var clientDiv = document.getElementById(name + "_client");
    x = findRelativePixels(x, actualWidth, imgExactFitWidth);
    y = findRelativePixels(y, actualHeight, imgExactFitHeight);
    y = imgExactFitHeight - y;

    x += mapClientIconOffsetX;
    y += mapClientIconOffsetY;

    /*
    if(zone & SAFE_ZONE || zone & NEAR_DOOR_ZONE){
        console.log(name + " zone is in safe or near");
    }
    //offset the y
    else if (zone & DANGER_ZONE_FAR_FROM_DOOR || zone & DANGER_ZONE_FAR_FROM_DONGLES) {
        console.log(name + " zone is in safe or near");
        y += 50;
    }
    */
    var color = "#FFFFFF";
    if (dangerLvl == 1) {
        // safe
        color = "#00FF00";
        if ((zone & NEAR_DOOR_ZONE) != 0 || (zone & NEAR_DOOR_SAFE_ZONE) != 0) {
            console.log("zone is near door");
            y -= 60;
        }
    }
    else if (dangerLvl == 2) {
        // warning
        color = "#FFA500";
    }
    else if (dangerLvl == 3) {
        // danger
        color = "#FF0000";
        y += 120;
    }
        //no data
    else {
        color = "#7B7B7B";
        y = imgHeight;
        x = imgWidth;
    }

    //console.log("after relative pixel for drawing drawOldPeople x " + x + " y " + y);
    if (clientDiv) {
        clientDiv.style.top = y + "px";
        clientDiv.style.left = x + "px";

        // dangerLvl
        for (var i = 0; i < clientDiv.childNodes.length; i++) {
            var child = clientDiv.childNodes[i];
            if (child.id == "peopleIconOverlay") {
                child.style.backgroundColor = color;
            }
        }
    } else {
        var myDiv = document.createElement('div');
        myDiv.className = "parent grow";
        myDiv.style.position = "absolute";
        myDiv.style.top = y + "px";
        myDiv.style.left = x + "px";
        myDiv.id = name + "_client";

        // image
        var image = document.createElement('img');
        image.className = "peopleIcon ";
        image.src = "img/human_icon.png";
        myDiv.appendChild(image);

        // dangerLvl
        var iconOverlay = document.createElement('div');
        iconOverlay.id = "peopleIconOverlay";
        iconOverlay.className = "peopleIconOverlay ";
        iconOverlay.style.backgroundColor = color;
        myDiv.appendChild(iconOverlay);

        // popup and text
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
}

function findRelativePixels(x, actual, imgSize) {
    var ratio = imgSize / actual;
    return x * ratio;
}

function generateRandom(rand) {
    return Math.floor((Math.random() * rand));
}