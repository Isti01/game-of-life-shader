import vertexShader from "../../shaders/gameOfLife.vert?raw";
import fragmentShader from "../../shaders/gameOfLife.frag?raw";
import { createShaderModule } from "../rendering/shaders.ts";
import { loadImage } from "../util/image.ts";
import { blitFramebuffer, createFrameBuffer, Framebuffer, resizeFramebuffer } from "../rendering/framebuffer.ts";
import { createFullScreenTriangle, Mesh } from "../rendering/fullScreenTriangle.ts";
import { scheduleAnimationFrame } from "../util/scheduling.ts";

export async function runSimulation(gl: WebGL2RenderingContext, initialImage: string): Promise<boolean> {
  const image = await loadImage(initialImage);
  const initResult = init(gl, image);
  if (!initResult) {
    return false;
  }
  const { shader, framebuffers, mesh } = initResult;
  const shouldDraw = true;
  while (shouldDraw) {
    update(gl, shader, framebuffers);
    await scheduleAnimationFrame();
    draw(gl, shader, framebuffers, mesh);
  }

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

function update(gl: WebGL2RenderingContext, _shader: WebGLProgram, framebuffers: Framebuffer[]) {
  let [drawFramebuffer, readFramebuffer] = framebuffers;

  if (framebuffers[0].width != gl.canvas.width || framebuffers[0].height != gl.canvas.height) {
    drawFramebuffer = resizeFramebuffer(gl, drawFramebuffer, gl.canvas.width, gl.canvas.height);
    readFramebuffer = resizeFramebuffer(gl, readFramebuffer, gl.canvas.width, gl.canvas.height);
  }

  framebuffers[0] = readFramebuffer;
  framebuffers[1] = drawFramebuffer;
}

function draw(gl: WebGL2RenderingContext, shader: WebGLProgram, framebuffers: Framebuffer[], mesh: Mesh) {
  const [drawFramebuffer, readFramebuffer] = framebuffers;
  gl.bindFramebuffer(gl.FRAMEBUFFER, drawFramebuffer.framebuffer);
  gl.viewport(0, 0, drawFramebuffer.width, drawFramebuffer.height);
  gl.useProgram(shader);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, readFramebuffer.colorAttachment);
  gl.uniform1i(gl.getUniformLocation(shader, "state"), 0);

  gl.bindVertexArray(mesh.vertexArray);
  gl.drawArrays(mesh.primitiveType, 0, mesh.primitiveCount);

  const defaultFramebuffer = {
    colorAttachment: null as any as WebGLTexture,
    framebuffer: null as any as WebGLFramebuffer,
    height: gl.canvas.height,
    width: gl.canvas.width
  };
  blitFramebuffer(gl, drawFramebuffer, defaultFramebuffer);
}
