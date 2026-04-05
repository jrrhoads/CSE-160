// asgn0.js 

function main() {
// Retrieve the <canvas> element
var canvas = document.getElementById('cnvs'); 
if (!canvas) {
    console.log('Failed to retrieve the <canvas> element ');
    return false; 
}

// Get the rendering context for 2DCG 
var ctx = canvas.getContext('2d');


ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with black

//Instantiate new Vector3 v1
let v1 = new Vector3([2.25, 2.25, 0]);
drawVector(v1, 'red');

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