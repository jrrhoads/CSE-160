class Cube{
    
  constructor(){
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = 0;
  }

render(){
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1i(u_WhichTexture, this.textureNum);

    let verts = [
        // Front
        -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,0.5,-0.5,
        -0.5,-0.5,-0.5,  0.5,0.5,-0.5,  -0.5,0.5,-0.5,
        // Back
        -0.5,-0.5,0.5,  0.5,0.5,0.5,  0.5,-0.5,0.5,
        -0.5,-0.5,0.5,  -0.5,0.5,0.5,  0.5,0.5,0.5,
        // Bottom
        -0.5,-0.5,-0.5,  0.5,-0.5,0.5,  0.5,-0.5,-0.5,
        -0.5,-0.5,-0.5,  -0.5,-0.5,0.5,  0.5,-0.5,0.5,
        // Top
        -0.5,0.5,-0.5,  0.5,0.5,-0.5,  0.5,0.5,0.5,
        -0.5,0.5,-0.5,  0.5,0.5,0.5,  -0.5,0.5,0.5,
        // Left
        -0.5,-0.5,-0.5,  -0.5,0.5,-0.5,  -0.5,0.5,0.5,
        -0.5,-0.5,-0.5,  -0.5,0.5,0.5,  -0.5,-0.5,0.5,
        // Right
        0.5,-0.5,-0.5,  0.5,-0.5,0.5,  0.5,0.5,0.5,
        0.5,-0.5,-0.5,  0.5,0.5,0.5,  0.5,0.5,-0.5,
    ];

    let uvs = [
        0,0, 1,0, 1,1,  0,0, 1,1, 0,1,
        1,0, 0,1, 0,0,  1,0, 1,1, 0,1,
        0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
        0,0, 1,0, 1,1,  0,0, 1,1, 0,1,
        1,0, 1,1, 0,1,  1,0, 0,1, 0,0,
        0,0, 1,0, 1,1,  0,0, 1,1, 0,1,
    ];

    let normals = [

        0,0,-1,  0,0,-1,  0,0,-1,
        0,0,-1,  0,0,-1,  0,0,-1,

        0,0,1,  0,0,1,  0,0,1,
        0,0,1,  0,0,1,  0,0,1,

        0,-1,0,  0,-1,0,  0,-1,0,
        0,-1,0,  0,-1,0,  0,-1,0,
  
        0,1,0,  0,1,0,  0,1,0,
        0,1,0,  0,1,0,  0,1,0,

        -1,0,0,  -1,0,0,  -1,0,0,
        -1,0,0,  -1,0,0,  -1,0,0,

        1,0,0,  1,0,0,  1,0,0,
        1,0,0,  1,0,0,  1,0,0,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
    

}
