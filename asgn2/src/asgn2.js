// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;


const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];

let g_globalZAngle = 0;
let g_globalYAngle = 0;
let g_globalXAngle = 0;


let g_jointLegZAngle = 10;
let g_jointCalfZAngle = 5;
let g_jointFootZAngle = -15;

var g_startTime = performance.now() / 1000.0;
var g_seconds = (performance.now()/1000.0) - g_startTime;

let g_anim = 0;
let g_animationRequest = null;




function setupWebGL(){
  canvas = document.getElementById('webgl');

  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


function addActionsFromUI(){

  //Button Event (animation)
  document.getElementById("animOnButton").onclick = function() {
    if (g_animationRequest == null) {
      g_anim = 1;
      g_startTime = performance.now() / 1000.0;
      g_animationRequest = requestAnimationFrame(tick);
    }
  }

  document.getElementById("animOffButton").onclick = function() {
    g_anim = 0;
    if (g_animationRequest != null) {
      cancelAnimationFrame(g_animationRequest);
      g_animationRequest = null;
    }
    renderScene();
  }


  
  //Slider Events (joint angles)
  document.getElementById("legZAngleSlide").addEventListener(
    'mousemove', 
    function() {
      g_jointLegZAngle = this.value;
      renderScene();
    });
  
  document.getElementById("calfZAngleSlide").addEventListener(
    'mousemove', 
    function() {
      g_jointCalfZAngle = this.value;
      renderScene();
    });

  document.getElementById("footZAngleSlide").addEventListener(
    'mousemove', 
    function() {
      g_jointFootZAngle = this.value;
      renderScene();
    });

  //Slider Event (settings)
  document.getElementById("camXSlide").addEventListener(
    'mousemove', 
    function() {
    g_globalXAngle = this.value;
    renderScene();
  });

  document.getElementById("camYSlide").addEventListener(
    'mousemove', 
    function() {
    g_globalYAngle = this.value;
    renderScene();
  });

  document.getElementById("camZSlide").addEventListener(
    'mousemove', 
    function() {
    g_globalZAngle = this.value;
    renderScene();
  });


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

  //Render all shapes
  renderScene()
  //requestAnimationFrame(tick);

}


function tick() {
  g_seconds = (performance.now() / 1000.0) - g_startTime;

  renderScene();

  if (g_anim == 1) {
    g_animationRequest = requestAnimationFrame(tick);
  } else {
    g_animationRequest = null;
  }
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
  renderScene();


}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);


  return ([x, y]);
}

function renderScene(){
  // Clear <canvas>
  var startTime = performance.now(); 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalXAngle, 1, 0, 0);
  globalRotMat.rotate(g_globalYAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalZAngle, 0, 0, 1);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  var body = new Cube();
  body.color = [0.36, 0.24, 0.14, 1.0];
  body.matrix.translate(-0.3, 0, -0.2);
  bodyRef = new Matrix4(body.matrix);
  body.matrix.scale(0.8, 0.6, 0.4);


  var neck = new Cube();
  neck.color = [0.65, 0.52, 0.35, 1.0];
  neck.matrix = new Matrix4(bodyRef);
  neck.matrix.translate(0.0, 0.3, 0.2);
  if (g_anim == 0){ neck.matrix.rotate(70, 0, 0, 1); }
  else {neck.matrix.rotate((60 + (2 * Math.cos(8 * (g_seconds - 0.2)))), 0, 0, 1);}
  neck.matrix.translate(-0.1, -0.15, -0.175);
  var neckRef = new Matrix4(neck.matrix);
  neck.matrix.scale(0.4, 0.3, 0.35);

  var head = new Cube();
  head.color = [0.36, 0.24, 0.14, 1.0];
  head.matrix = new Matrix4(neckRef);
  head.matrix.translate(0.3, 0.2, 0.15);
  head.matrix.rotate(70, 0, 0, 1);
  head.matrix.translate(0, -0.1, -0.22);
  var headRef = new Matrix4(neck.matrix);
  head.matrix.scale(0.3, 0.5, 0.5);

  var leftEye = new Cube();
  leftEye.color = [0.92, 0.86, 0.72, 1.0];
  leftEye.matrix = new Matrix4 (headRef);
  leftEye.matrix.translate(-0.05, 1.8, -0.1);
  leftEye.matrix.scale(0.2, 0.2, 0.2);

  var rightEye = new Cube();
  rightEye.color = [0.92, 0.86, 0.72, 1.0];
  rightEye.matrix = new Matrix4 (headRef);
  rightEye.matrix.translate(-0.05, 1.8, 0.9);
  rightEye.matrix.scale(0.2, 0.2, 0.2);
  
  var nose = new Cube();
  nose.color = [0.15, 0.15, 0.15, 1.0];
  nose.matrix = new Matrix4 (headRef);
  nose.matrix.translate(-0.45, 1.6, 0.25);
  nose.matrix.rotate(75, 0, 0, 1);
  nose.matrix.scale(0.3, 0.2, 0.5);


  var jaw = new Cube();
  jaw.color = [0.36, 0.24, 0.14, 1.0];
  jaw.matrix = new Matrix4(neckRef);
  jaw.matrix.translate(0.3, 0.2, 0.15);
  jaw.matrix.rotate(70, 0, 0, 1);
  jaw.matrix.translate(0, 0.2, -0.2);
  var jawRef = new Matrix4(neck.matrix);
  jaw.matrix.scale(0.2, 0.4, 0.45);

  var horns = new Cube();
  horns.color = [0.92, 0.86, 0.72, 1.0];
  horns.matrix = new Matrix4(neckRef);
  horns.matrix.translate(0.6, 0.2, -0.37);
  horns.matrix.rotate(70, 0, 0, 1);
  horns.matrix.translate(0, 0.25, -0.2);
  horns.matrix.scale(0.1, 0.1, 1.5);
  


  var leftLeg = new Cube();
  leftLeg.color = [0.36, 0.24, 0.14, 1.0];
  leftLeg.matrix = new Matrix4(bodyRef);
  leftLeg.matrix.translate(0.1, 0.15, 0);
  if (g_anim == 0){ leftLeg.matrix.rotate(10, 0, 0, 1); }
  else { leftLeg.matrix.rotate((10 + (20 * Math.sin(4 * (g_seconds - 0.2)))), 0, 0, 1); }
  leftLeg.matrix.translate(-0.2, -0.4, -0.1);
  var leftLegRef = new Matrix4(leftLeg.matrix);
  leftLeg.matrix.scale(0.3, 0.5, 0.2);
  
  var rightLeg = new Cube();
  rightLeg.color = [0.36, 0.24, 0.14, 1.0];
  rightLeg.matrix = new Matrix4(bodyRef);
  rightLeg.matrix.translate(0.1, 0.15, 0.4);
  if (g_anim == 0) { rightLeg.matrix.rotate(10, 0, 0, 1); }
  else { rightLeg.matrix.rotate((10 + (20 * Math.cos(4 * g_seconds))), 0, 0, 1); } 
  rightLeg.matrix.translate(-0.2, -0.4, -0.1);
  var rightLegRef = new Matrix4(rightLeg.matrix);
  rightLeg.matrix.scale(0.3, 0.5, 0.2);

  var leftCalf = new Cube();
  leftCalf.color = [0.36, 0.24, 0.14, 1.0];
  leftCalf.matrix = new Matrix4(leftLegRef)
  leftCalf.matrix.translate(0.15, 0.07, 0.1);
  if (g_anim == 0) { leftCalf.matrix.rotate(-10, 0, 0, 1); }
  else { leftCalf.matrix.rotate(20 * Math.cos((4 * g_seconds)) - 15, 0, 0, 1); }
  leftCalf.matrix.translate(-0.11, -0.49, -0.08);
  leftCalf.matrix.scale(0.2, 0.6, 0.15);

  var rightCalf = new Cube();
  rightCalf.color = [0.36, 0.24, 0.14, 1.0];
  rightCalf.matrix = new Matrix4(rightLegRef)
  rightCalf.matrix.translate(0.15, 0.07, 0.11);
  if (g_anim == 0) { rightCalf.matrix.rotate(-10, 0, 0, 1); }
  else { rightCalf.matrix.rotate(((20 * Math.sin(4 * (g_seconds + 1.05))) - 15), 0, 0, 1); }
  rightCalf.matrix.translate(-0.11, -0.49, -0.08);
  rightCalf.matrix.scale(0.2, 0.6, 0.15);


  var backLeftLeg = new Cube();
  backLeftLeg.color = [0.36, 0.24, 0.14, 1.0];
  backLeftLeg.matrix = new Matrix4(bodyRef);
  backLeftLeg.matrix.translate(0.75, 0.3, -0.1);
  if (g_anim == 0) { backLeftLeg.matrix.rotate(g_jointLegZAngle, 0, 0, 1); }
  else { backLeftLeg.matrix.rotate((-10 + (10 * Math.cos(4 * g_seconds))), 0, 0, 1); }
  backLeftLeg.matrix.translate(-0.2, -0.4, -0.1);
  var backLeftLegRef = new Matrix4(backLeftLeg.matrix);
  backLeftLeg.matrix.scale(0.4, 0.5, 0.3);

  var backLeftCalf = new Cube();
  backLeftCalf.color = [0.36, 0.24, 0.14, 1.0];
  backLeftCalf.matrix = new Matrix4(backLeftLegRef)
  backLeftCalf.matrix.translate(0.24, 0.1, 0.1);
  if (g_anim == 0) { backLeftCalf.matrix.rotate(g_jointCalfZAngle, 0, 0, 1); }
  else { backLeftCalf.matrix.rotate((10 + (10 * Math.cos(4 * g_seconds + 0.3))), 0, 0, 1); }
  backLeftCalf.matrix.translate(-0.11, -0.49, -0.08);
  var backLeftCalfRef = new Matrix4(backLeftCalf.matrix);
  backLeftCalf.matrix.scale(0.25, 0.6, 0.15);

  var backLeftFoot = new Cube();
  backLeftFoot.color = [0.15, 0.15, 0.15, 1.0];
  backLeftFoot.matrix = new Matrix4(backLeftCalfRef)
  backLeftFoot.matrix.translate(0.15, 0.08, 0.08);
  if (g_anim == 0) { backLeftFoot.matrix.rotate(g_jointFootZAngle, 0, 0, 1); }
  else { backLeftFoot.matrix.rotate(20 * Math.cos((4 * g_seconds) + 1.4) + 20, 0, 0, 1); }
  backLeftFoot.matrix.translate(-0.11, -0.3, -0.07);
  backLeftFoot.matrix.scale(0.18, 0.3, 0.13);


  var backRightLeg = new Cube();
  backRightLeg.color = [0.36, 0.24, 0.14, 1.0];
  backRightLeg.matrix = new Matrix4(bodyRef);
  backRightLeg.matrix.translate(0.75, 0.3, 0.4);
  if (g_anim == 0) { backRightLeg.matrix.rotate(10, 0, 0, 1); }
  else { backRightLeg.matrix.rotate((-10 + (20 * Math.sin(4 * (g_seconds - 0.3)))), 0, 0, 1); }
  backRightLeg.matrix.translate(-0.2, -0.4, -0.1);
  var backRightLegRef = new Matrix4(backRightLeg.matrix);
  backRightLeg.matrix.scale(0.4, 0.5, 0.3);

  var backRightCalf = new Cube();
  backRightCalf.color = [0.36, 0.24, 0.14, 1.0];
  backRightCalf.matrix = new Matrix4(backRightLegRef)
  backRightCalf.matrix.translate(0.24, 0.1, 0.2);
  if (g_anim == 0) { backRightCalf.matrix.rotate(5, 0, 0, 1); }
  else { backRightCalf.matrix.rotate((10 + (10 * Math.sin(4 * g_seconds + 0.3))), 0, 0, 1); }
  backRightCalf.matrix.translate(-0.11, -0.49, -0.08);
  var backRightCalfRef = new Matrix4(backRightCalf.matrix);
  backRightCalf.matrix.scale(0.25, 0.6, 0.15);

  var backRightFoot = new Cube();
  backRightFoot.color = [0.15, 0.15, 0.15, 1.0];
  backRightFoot.matrix = new Matrix4(backRightCalfRef)
  backRightFoot.matrix.translate(0.15, 0.08, 0.09);
  if (g_anim == 0) { backRightFoot.matrix.rotate(-15, 0, 0, 1); }
  else { backRightFoot.matrix.rotate(20 * Math.sin((4 * g_seconds) + 0.2) + 20, 0, 0, 1); }
  backRightFoot.matrix.translate(-0.11, -0.3, -0.08);
  backRightFoot.matrix.scale(0.18, 0.3, 0.13);

  
  body.render();
  neck.render();
  head.render();
  jaw.render();
  horns.render();
  
  leftLeg.render();
  leftCalf.render();

  rightLeg.render();
  rightCalf.render();

  backLeftLeg.render();
  backLeftCalf.render();
  backLeftFoot.render();

  backRightLeg.render();
  backRightCalf.render();
  backRightFoot.render();
  

  leftEye.render();
  rightEye.render();
  nose.render();

  var duration = performance.now() - startTime;
  var fps = 1000.0 / duration;
  sendTextToHTML("FPS: " + fps.toFixed(1), "fps");





}

function sendTextToHTML(text, htmlID){
  var htmlElem = document.getElementById(htmlID);
  if (!htmlElem){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }

  htmlElem.innerHTML = text;
}