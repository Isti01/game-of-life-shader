export interface Mesh {
  vertexArray: WebGLVertexArrayObject;
  primitiveType: GLenum;
  primitiveCount: number;
}

export function createFullScreenTriangle(gl: WebGL2RenderingContext): Mesh | null {
  const vertexArray = gl.createVertexArray();
  if (vertexArray === null) {
    return null;
  }

  const vertexBuffer = gl.createBuffer();
  if (vertexBuffer == null) {
    gl.deleteVertexArray(vertexArray);
    return null;
  }

  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 0, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  return { vertexArray, primitiveType: gl.TRIANGLES, primitiveCount: 3 };
}