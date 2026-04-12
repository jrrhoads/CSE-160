// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
  `
// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
  `


let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;


const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedSegments = 10;


var g_shapesList = [];



function setupWebGL(){
  canvas = document.getElementById('webgl');

  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

}


function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}


function addActionsFromUI(){
  //Button Event (clear)
  document.getElementById("clearButton").onclick = function() {
    g_shapesList = [];
    renderAllShapes(); //Renders the empty shapelist, so "clears" the canvas
  } 

  //Button Events (shapes)
  document.getElementById("pointButton").onclick = function() {
    g_selectedType = POINT;
  }
  document.getElementById("triButton").onclick = function() {
    g_selectedType = TRIANGLE;
  }
    document.getElementById("circleButton").onclick = function() {
    g_selectedType = CIRCLE;
  }
  
  //Slider Events (color)
  document.getElementById("redSlide").addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100})
  document.getElementById("greenSlide").addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100})
  document.getElementById("blueSlide").addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100})
  document.getElementById("alphaSlide").addEventListener('mouseup', function() {g_selectedColor[3] = this.value/100})

  //Slider Event (settings)
  document.getElementById("sizeSlide").addEventListener('mouseup', function() {g_selectedSize = this.value})
  document.getElementById("segmentSlide").addEventListener('mouseup', function() {g_selectedSegments = this.value})

  //Button Event (picture)
  document.getElementById("picButton").onclick = drawPicture;


}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsFromUI();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1){
      click(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



function click(ev) {
  
  //Extract the click event's coordinates and convert them to WebGL-usable format
  let [x, y] = convertCoordinatesEventToGL(ev);

  //Create point and push it to shapes list
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  }
  else if (g_selectedType == CIRCLE){
    point = new Circle(g_selectedSegments);
  }
  else {
    point = new Point();
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);


  //Draw all shapes meant to be in the canvas
  renderAllShapes();


}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);


  return ([x, y]);
}

function renderAllShapes(){

  //Get start time
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Render all shapes
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render()
  }

  var duration = (performance.now() - startTime);
  sendTextToHTML(String(len), "numdot");
  sendTextToHTML(String(Math.floor(duration)), "ms")
  sendTextToHTML(String(Math.floor(10000/duration) / 10), "fps")
}

function sendTextToHTML(text, htmlID){
  var htmlElem = document.getElementById(htmlID);
  if (!htmlElem){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }

  htmlElem.innerHTML = text;
}


function drawPicture(){
  g_shapesList = [];
  renderAllShapes();

  //bg
  g_shapesList.push(new CustomTriangle([1, 0.9, 0.75, 1.0], [200/200.0, 200/200.0,   -200/200.0, 200/200.0,    -200/200.0, -200/200.0])); //top left
  g_shapesList.push(new CustomTriangle([1, 0.9, 0.75, 1.0], [200/200.0, 200/200.0,   200/200.0, -200/200.0,    -200/200.0, -200/200.0])); //bottom left
  
  //body
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-115/200.0, 100/200.0,   -60/200.0, 100/200.0,    -80/200.0, 140/200.0])); //front-top face
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-120/200.0, 100/200.0,   20/200.0, 20/200.0,    -20/200.0, 100/200.0])); //face fill tri
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-40/200.0, 140/200.0,   -60/200.0, 100/200.0,    -80/200.0, 140/200.0])); //mid-top face
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-40/200.0, 140/200.0,   -60/200.0, 100/200.0,    -20/200.0, 100/200.0])); //back-top head
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-40/200.0, 140/200.0,   -65/200.0, 175/200.0,    -80/200.0, 140/200.0])); //ear

  g_shapesList.push(new CustomTriangle([1.0, 0.5, 0.5, 1.0], [-100/200.0, 100/200.0,   -120/200.0, 100/200.0,    -115/200.0, 80/200.0])); //nose tip
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-112/200.0, 105/200.0,   -40/200.0, 70/200.0,    -115/200.0, 70/200.0])); //chin
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-20/200.0, 40/200.0,   -40/200.0, 70/200.0,    -90/200.0, 70/200.0])); //under neck area
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-20/200.0, -120/200.0,   20/200.0, 90/200.0,    -20/200.0, 100/200.0])); //upper neck edge/extends into body tri
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-20/200.0, -120/200.0,   20/200.0, 90/200.0,    60/200.0, -40/200.0])); //body upper right tri
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-20/200.0, -120/200.0,   70/200.0, -140/200.0,    60/200.0, -40/200.0])); //body lower right
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [-20/200.0, -120/200.0,   70/200.0, -140/200.0,    -80/200.0, -140/200.0])); //body bottom tri
  g_shapesList.push(new CustomTriangle([0.1, 0.1, 0.0, 1.0], [60/200.0, -120/200.0,   -40/200.0, 100/200.0,    -80/200.0, -140/200.0])); //body left tri


  //tail
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [60/200.0, -120/200.0,   60/200.0, -140/200.0,    140/200.0, -140/200.0])); //tail first tri (blue)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [155/200.0, -130/200.0,   60/200.0, -140/200.0,    140/200.0, -140/200.0])); //tail 2 tri (red)
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [155/200.0, -130/200.0,   140/200.0, -40/200.0,    140/200.0, -140/200.0])); //tail 3 tri (green)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [80/200.0, 0/200.0,   140/200.0, -40/200.0,    140/200.0, -60/200.0])); //tail 4 tri (cyan)
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [80/200.0, 0/200.0,   140/200.0, -40/200.0,    40/200.0, 60/200.0])); //tail 5 tri (yellow)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [120/200.0, 100/200.0,   50/200.0, 50/200.0,    40/200.0, 60/200.0])); //tail 6 tri (red)
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [120/200.0, 100/200.0,   120/200.0, -20/200.0,    100/200.0, 0/200.0])); //tail 7 tri (green)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [200/200.0, 0/200.0,   120/200.0, -20/200.0,    100/200.0, 0/200.0])); //tail 8 tri (blue)
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [120/200.0, 100/200.0,   120/200.0, 80/200.0,    80/200.0, 80/200.0])); //tail 9 tri (weird)


  //j
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [-40/200.0, 60/200.0,   35/200.0, 40/200.0,    32/200.0, 50/200.0])); //top (orang)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [-40/200.0, 60/200.0,   35/200.0, 40/200.0,    -25/200.0, 50/200.0])); //top 2(orang)
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [60/200.0, -70/200.0,   25/200.0, 47/200.0,    10/200.0, 50/200.0])); //neck (yellower orang)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [60/200.0, -70/200.0,   55/200.0, -100/200.0,    10/200.0, 50/200.0])); //neck (green)
  g_shapesList.push(new CustomTriangle([0.3, 0.3, 0.15, 1.0], [60/200.0, -70/200.0,   55/200.0, -100/200.0,    10/200.0, -105/200.0])); //bottom line (blue)
  g_shapesList.push(new CustomTriangle([0.25, 0.25, 0, 1.0], [-5/200.0, -70/200.0,   30/200.0, -100/200.0,    10/200.0, -105/200.0])); //hook line (red)


  //eye
  g_shapesList.push(new CustomTriangle([1.0, 0.85, 0.1, 1.0], [-100/200.0, 100/200.0,   -70/200.0, 100/200.0,    -90/200.0, 115/200.0])); //iris
  g_shapesList.push(new CustomTriangle([0.0, 0.0, 0.0, 1.0], [-87/200.0, 100/200.0,   -95/200.0, 100/200.0,    -90/200.0, 115/200.0])); //pupil
  

  renderAllShapes();
}
