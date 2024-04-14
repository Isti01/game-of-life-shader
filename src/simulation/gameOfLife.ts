import vertexShader from "../../shaders/gameOfLife.vert?raw";
import fragmentShader from "../../shaders/gameOfLife.frag?raw";
import { createShaderModule } from "../rendering/shaders.ts";
import { loadImage } from "../util/image.ts";
import { createFrameBuffer, Framebuffer } from "../rendering/framebuffer.ts";
import { createFullScreenTriangle, Mesh } from "../rendering/fullScreenTriangle.ts";

export async function runSimulation(gl: WebGL2RenderingContext, initialImage: string): Promise<boolean> {
  const image = await loadImage(initialImage);
  const initResult = init(gl, image);
  if (!initResult) {
    return false;
  }
  draw(gl, initResult.shader, initResult.framebuffers, initResult.mesh);

  return true;
}

function init(gl: WebGL2RenderingContext, image: HTMLImageElement) {
  const shader = createShaderModule(gl, vertexShader, fragmentShader);
  if (shader == null) {
    return null;
  }

  const mesh = createFullScreenTriangle(gl);
  if (mesh === null) {
    gl.deleteProgram(shader);
    return null;
  }

  const framebuffers = [
    createFrameBuffer(gl, { source: "image", image }),
    createFrameBuffer(gl, { source: "image", image })
  ];

  if (framebuffers.some(framebuffer => framebuffer === null)) {
    framebuffers.forEach(gl.deleteFramebuffer);
    return null;
  }

  return { shader, framebuffers: framebuffers as Framebuffer[], mesh };
}

function draw(gl: WebGL2RenderingContext, shader: WebGLProgram, framebuffers: Framebuffer[], mesh: Mesh) {
  requestAnimationFrame(() => {
    const [drawFramebuffer, readFramebuffer] = framebuffers;
    gl.bindFramebuffer(gl.FRAMEBUFFER, drawFramebuffer.framebuffer);
    gl.viewport(0, 0, drawFramebuffer.width, drawFramebuffer.height);
    gl.useProgram(shader);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readFramebuffer.colorAttachment);
    gl.uniform1i(gl.getUniformLocation(shader, "state"), 0);

    gl.bindVertexArray(mesh.vertexArray);
    gl.drawArrays(mesh.primitiveType, 0, mesh.primitiveCount);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, drawFramebuffer.framebuffer);
    gl.blitFramebuffer(0, 0, drawFramebuffer.width, drawFramebuffer.height, 0, 0, gl.canvas.width, gl.canvas.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);

    framebuffers[0] = readFramebuffer;
    framebuffers[1] = drawFramebuffer;
    draw(gl, shader, framebuffers, mesh);
  });
}
