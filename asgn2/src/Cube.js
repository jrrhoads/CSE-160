class Cube{
    
  constructor(){
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();

    //this.position = [0.0, 0.0, 0.0];
    //this.size = 5.0;
    //this.segments = segments;
  }

  render(){

    //var xy = this.position;
    //var size = this.size;

    var rgba = this.color;


    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //Pass the matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


    // Draw
    //Front Face

    //Front face always gray for debug
    drawTriangle3D([0,0,0,    1,0,0,    1,1,0])
    drawTriangle3D([0,0,0,    1,1,0,    0,1,0])

    //Back Face
    drawTriangle3D([0,0,1,    1,1,1,    1,0,1])
    drawTriangle3D([0,0,1,    0,1,1,    1,1,1])

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

    //Bottom Face
    drawTriangle3D([0,0,0,    1,0,1,    1,0,0])
    drawTriangle3D([0,0,0,    0,0,1,    1,0,1])

    //Top Face
    drawTriangle3D([0,1,0,    1,1,0,    1,1,1])
    drawTriangle3D([0,1,0,    1,1,1,    0,1,1])

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);

    //Left Face
    drawTriangle3D([0,0,0,    0,1,0,    0,1,1])
    drawTriangle3D([0,0,0,    0,1,1,    0,0,1])

    //Right Face
    drawTriangle3D([1,0,0,    1,0,1,    1,1,1])
    drawTriangle3D([1,0,0,    1,1,1,    1,1,0])


    

  }
}
