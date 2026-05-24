// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }
  `
// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_LightPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_WhichTexture;
  uniform bool u_Specular;
  uniform bool u_LightOn;
  uniform bool u_SpotOn;
  uniform vec3 u_SpotPos;
  uniform vec3 u_SpotDir;
  uniform float u_SpotCutoff;
  void main() {
    if (u_WhichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    }
    else if (u_WhichTexture == -2){
      gl_FragColor = u_FragColor; //Use color
    }
    else if (u_WhichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
    }
    else if (u_WhichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV); //Use texture0
    }
    else if (u_WhichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV); //Use texture1
    }

    else{
      gl_FragColor = vec4 (1.0, 0.2, 0.2, 1.0); //Error, use reddish color
    }

    vec3 N = normalize(v_Normal);
    if (u_LightOn){
      vec3 lightVector = u_LightPos - vec3(v_VertPos);
      float r = length(lightVector);

      vec3 L = normalize(lightVector);

      float nDotL = max(dot(N, L), 0.0);
      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.3;

      if (u_Specular) {
        vec3 R = reflect(-L, N);
        vec3 E = normalize(u_CameraPos - vec3(v_VertPos));
        float specular = pow(max(dot(E, R), 0.0), 64.0);
        gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
      } 
      else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }

    if (u_SpotOn) {
      vec3 spotVector = u_SpotPos - vec3(v_VertPos);
      vec3 spotL = normalize(spotVector);
      float spotAngle = dot(spotL, normalize(-u_SpotDir));
      if (spotAngle > u_SpotCutoff) {
        float nDotL2 = max(dot(N, spotL), 0.0);
        vec3 spotDiffuse = vec3(gl_FragColor) * nDotL2 * 0.8;
        gl_FragColor = vec4(vec3(gl_FragColor) + spotDiffuse, 1.0);
      }
    }





  }
  `


let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_WhichTexture;
let u_Sampler0; //Dirt texture
let u_Sampler1; //Sky texture
let u_CameraPos;
let u_LightPos;
let u_Specular;
let u_LightOn;
let u_SpotOn, u_SpotPos, u_SpotDir, u_SpotCutoff;



let g_globalZAngle = 0;
let g_globalYAngle = 0;
let g_globalXAngle = 0;

let g_lightPos = [0, 2, 2];

var g_startTime = performance.now() / 1000.0;
var g_seconds = (performance.now()/1000.0) - g_startTime;
var g_LightOn = true;

var g_camera = new Camera;

var g_floor, g_sky;
var g_mapCubes = [];

var g_vertexBuffer = null;
var g_uvBuffer = null;
var g_normalBuffer = null;

var g_normalOn = false;

var g_spotOn = false;
var g_spotPos = [0, 5, 0];
var g_spotDir = [0, -5, 2];

function initBuffers() {
    g_vertexBuffer = gl.createBuffer();
    g_uvBuffer = gl.createBuffer();
    g_normalBuffer = gl.createBuffer();
}


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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }  

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  } 

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
  if (!u_LightOn) {
    console.log('Failed to get the storage location of u_LightOn');
    return;
  }

  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_CameraPos) {
    console.log('Failed to get the storage location of u_CameraPos');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_Specular = gl.getUniformLocation(gl.program, 'u_Specular');
  if (!u_Specular) {
    console.log('Failed to get the storage location of u_Specular');
    return;
  }


  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) {
    console.log('Failed to get the storage location of u_LightPos');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log('Failed to get the location of u_Sampler0');
    return false;
  }
  
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1){
    console.log('Failed to get the location of u_Sampler1');
    return false;
  }

  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if(!u_WhichTexture){
    console.log('Failed to get u_WhichTexture');
    return false;
  }

  u_SpotOn = gl.getUniformLocation(gl.program, 'u_SpotOn');
  u_SpotPos = gl.getUniformLocation(gl.program, 'u_SpotPos');
  u_SpotDir = gl.getUniformLocation(gl.program, 'u_SpotDir');
  u_SpotCutoff = gl.getUniformLocation(gl.program, 'u_SpotCutoff');

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


function addActionsFromUI(){
  //Normal Buttons
  document.getElementById("normalOn").onclick = function(){g_normalOn = true};
  document.getElementById("normalOff").onclick = function(){g_normalOn = false};

  //Light Buttons
  document.getElementById("lightOn").onclick = function(){g_LightOn = true};
  document.getElementById("lightOff").onclick = function(){g_LightOn = false};

  //Spotlight Buttons
  document.getElementById("spotOn").onclick  = function(){ g_spotOn = true; }
  document.getElementById("spotOff").onclick = function(){ g_spotOn = false; }

  //Slider Event (Cam Angles)
  document.getElementById("lightX").addEventListener(
    'mousemove', 
    function() {
    g_lightPos[0] = this.value/100;
    renderScene();
  });

  document.getElementById("lightY").addEventListener(
    'mousemove', 
    function() {
    g_lightPos[1] = this.value/100 + 2;
    renderScene();
  });

  document.getElementById("lightZ").addEventListener(
    'mousemove', 
    function() {
    g_lightPos[2] = this.value/100 + 2;
    renderScene();
  });

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


function initTextures(names, samplers){
  for (let i=0; i<names.length; i++){
    let image = new Image();
    if(!image){
      console.log('Failed to create the image object');
      return false;
    }
    image.onload = function(){sendTextureToGLSL(image, samplers[i], i);}
    image.src = names[i];
  }
  return true; 
}


function sendTextureToGLSL(image, sampler, index){

  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0 + index);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(sampler, index);

  console.log('Finished loading texture');
  renderScene();
}

function initShapes(){
  //Note: vars are global but im too lazy to fix the names rn

  floor = new Cube();
  floor.textureNum = -2;
  floor.color = [0.7, 1, 0.3, 1];
  floor.matrix.translate(0, -0.5, 0);
  floor.matrix.scale(50, 0.1, 50);
  floor.matrix.translate(0, 0, 0)

  sky = new Cube();
  sky.textureNum = 1;
  sky.matrix.translate(0, 24.49, 0);
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(0, 0, 0)

  sphere = new Sphere();
  sphere.textureNum = -2;
  sphere.color = [1, 0.2, 0.2, 1];
  sphere.matrix.translate(0, 0.5, 2);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  

}

function initMap(map, x_offset, y_offset, z_offset){
  for (let x=0; x<map.length; x++){
    for (let y=0; y<map[x].length; y++){
      if (map[x][y] == 1){
        var c = new Cube();
        c.textureNum = 0;
        c.matrix.translate(x + x_offset, y_offset ,y + z_offset);
        g_mapCubes.push(c);
      }
    }
  }
}


var map1 = [
  [1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
]

var map2 = [
  [1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
]

var map3 = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
]

var map4 = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
]

var mapWall = [];
for (let i = 0; i < 20; i++) {
    mapWall[i] = [];
    for (let j = 0; j < 20; j++) {
        if (i == 0 || i == 31 || j == 0 || j == 31) {
            mapWall[i][j] = 1;
        } else {
            mapWall[i][j] = 0;
        }
    }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  initBuffers();
  var samplers = [u_Sampler0, u_Sampler1];
  var names = ['dirt.png', 'sky.png'];
  addActionsFromUI();
  initTextures(names, samplers);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  document.onkeydown = keydown;

  canvas.onclick = function(){
    canvas.requestPointerLock();
  }

  document.addEventListener('pointerlockchange', function(){
    if (document.pointerLockElement === canvas){
      document.addEventListener('mousemove', mouseMove);
    }
    else {
      document.removeEventListener('mousemove', mouseMove);
    }
  });

  initShapes();
  initMap(map1, -2, 0, 0);
  initMap(map1, -2, 1, 0);
  initMap(map2, -2, 2, 0);
  initMap(map3, -2, 3, 0);
  initMap(map4, -2, 4, 0);

  tick()

}



//Old helper function
function click(ev) {
  //Draw all shapes meant to be in the canvas
  renderScene();

}


function mouseMove(ev) {
  let sensitivity = 0.2;
  if (ev.movementX != 0) {
    g_camera.pan(-ev.movementX * sensitivity, g_camera.up);
  }
  
  if (ev.movementY != 0) {
    var f = new Vector3(g_camera.at.elements);
    f.sub(g_camera.eye);
    var right = Vector3.cross(f, g_camera.up);
    right.div(right.magnitude());
    g_camera.pan(-ev.movementY * sensitivity, right);
  }

  renderScene();
}


function keydown(ev){
  //Forward (W)
  if (ev.keyCode == 87){
    g_camera.forward();
  }
  else if(ev.keyCode == 83){
    g_camera.back();
  }
  else if(ev.keyCode == 65){
    g_camera.left();
  }
  else if(ev.keyCode == 68){
    g_camera.right();
  }
  else if (ev.keyCode == 81) {
    g_camera.pan(5, g_camera.up);
  }
  else if (ev.keyCode == 69) {
    g_camera.pan(-5, g_camera.up);
  }



  renderScene();
  console.log(ev.keyCode);
  console.log(g_camera.eye.elements, g_camera.at.elements, g_camera.up.elements);
}

function tick(){
  g_seconds = (performance.now()/1000.0) - g_startTime;
  
  // animate light in a circle
  g_lightPos[0] = Math.cos(g_seconds) * 2;
  g_lightPos[2] = Math.sin(g_seconds) * 2 + 2;
  
  renderScene();
  requestAnimationFrame(tick);
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

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],   
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]); //eye, at, up
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalXAngle, 1, 0, 0);
  globalRotMat.rotate(g_globalYAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalZAngle, 0, 0, 1);

  gl.uniform3f(u_CameraPos, 
  g_camera.eye.elements[0], 
  g_camera.eye.elements[1], 
  g_camera.eye.elements[2]);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform1i(u_LightOn, g_LightOn);

  gl.uniform1i(u_SpotOn, g_spotOn);
  gl.uniform3f(u_SpotPos, g_spotPos[0], g_spotPos[1], g_spotPos[2]);
  gl.uniform3f(u_SpotDir, g_spotDir[0], g_spotDir[1], g_spotDir[2]);
  gl.uniform1f(u_SpotCutoff, Math.cos(Math.PI / 8));

  var light = new Cube();
  light.textureNum = -2;
  light.color = [1, 1, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  gl.uniform1i(u_Specular, false);
  light.render();

  var spotLight = new Cube();
  spotLight.textureNum = -2;
  spotLight.color = [0, 1, 1, 1]; 
  spotLight.matrix.translate(g_spotPos[0], g_spotPos[1], g_spotPos[2]);
  spotLight.matrix.scale(0.1, 0.1, 0.1);
  gl.uniform1i(u_Specular, false);
  spotLight.render();

  floor.textureNum = g_normalOn ? -3 : -2;
  sky.textureNum = g_normalOn ? -3 : 1;
  sphere.textureNum = g_normalOn ? -3 : -2;
  for (let c of g_mapCubes){
    c.textureNum = g_normalOn ? -3 : 0;
  }


  floor.render();
  sky.render();
  for (let c of g_mapCubes){
    c.render();
  }

  gl.uniform1i(u_Specular, true);
  sphere.render();

  var duration = performance.now() - startTime;
  var fps = 1000.0 / duration;
  sendTextToHTML("FPS: " + fps.toFixed(1), "fps");

}



//Helper Func for Sending Text
function sendTextToHTML(text, htmlID){
  var htmlElem = document.getElementById(htmlID);
  if (!htmlElem){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }

  htmlElem.innerHTML = text;
}