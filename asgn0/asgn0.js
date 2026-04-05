// asgn0.js 

function main() {
// Retrieve the <canvas> element
var canvas = document.getElementById('cnvs'); 
var drawBtn = document.getElementById('drawBtn');

if (!canvas) {
    console.log('Failed to retrieve the <canvas> element ');
    return false; 
}

// Get the rendering context for 2DCG 
var ctx = canvas.getContext('2d');

//Fill canvas with black
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height); 


drawBtn.onclick = function handleDrawEvent(){
    var canvas = document.getElementById('cnvs');

    //Fill canvas with black
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let v1x = Number(document.getElementById('v1x').value);
    let v1y = Number(document.getElementById('v1y').value);
    let v2x = Number(document.getElementById('v2x').value);
    let v2y = Number(document.getElementById('v2y').value);

    let v1 = new Vector3([v1x, v1y, 0]);
    let v2 = new Vector3([v2x, v2y, 0]);
    
    drawVector(v1, 'red');
    drawVector(v2, 'blue');


}

}

function drawVector(v, color){
    var canvas = document.getElementById('cnvs'); 
    var ctx = canvas.getContext('2d');

    var x, y;
    x = v.elements[0] * 20;
    y = (v.elements[1] * 20) * -1; //Canvas needs to follow math rules, so I flip the y value for canvas usage

    let center = [canvas.width/2, canvas.height/2];


    //Instructions
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(center[0], center[1]);
    ctx.lineTo(center[0] + x, center[1] + y);
    ctx.stroke();
    
}

