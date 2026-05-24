var sin = Math.sin;
var cos = Math.cos;

class Sphere{

   constructor(){
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;

    // Build geometry once
    this.verts = [];
    this.uvs = [];
    this.normals = [];

    var d = Math.PI/10;
    var dd = Math.PI/10;
    for (var t=0; t<Math.PI; t+=d){
      for (var r=0; r<2*Math.PI; r+=d){
        var p1 = [sin(t)*cos(r),    sin(t)*sin(r),    cos(t)];
        var p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
        var p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
        var p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];

        this.verts = this.verts.concat(p1, p2, p4, p1, p4, p3);
        this.uvs   = this.uvs.concat(0,0, 0,0, 0,0, 0,0, 0,0, 0,0);
        this.normals = this.normals.concat(p1, p2, p4, p1, p4, p3); // unit sphere: pos == normal
      }
    }

    this.verts32   = new Float32Array(this.verts);
    this.uvs32     = new Float32Array(this.uvs);
    this.normals32 = new Float32Array(this.normals);
    this.vertCount = this.verts32.length / 3;
  }

render(){
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1i(u_WhichTexture, this.textureNum);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts32, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs32, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals32, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertCount);

  }
}
