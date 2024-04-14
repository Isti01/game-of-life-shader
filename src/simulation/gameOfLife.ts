import { loadImage } from "../util/image.ts";
import { blitFramebuffer, Framebuffer, resizeFramebuffer } from "../rendering/framebuffer.ts";
import { Mesh } from "../rendering/fullScreenTriangle.ts";
import { scheduleAnimationFrame } from "../util/scheduling.ts";
import { init, initListeners } from "./setup.ts";

export type SimulationState = {
  shader: WebGLProgram,
  singleChannelShader: WebGLProgram,
  multiChannelShader: WebGLProgram,
  framebuffers: Framebuffer[],
  mesh: Mesh
};

export async function runSimulation(gl: WebGL2RenderingContext, initialImage: string): Promise<boolean> {
  const image = await loadImage(initialImage);
  let state = init(gl, image);
  if (state === null) {
    return false;
  }

  initListeners(gl, state);

  const shouldDraw = true;
  while (shouldDraw) {
    state = update(gl, state);
    const { shader, framebuffers, mesh } = state;
    await scheduleAnimationFrame();
    draw(gl, shader, framebuffers, mesh);
  }

  return true;
}

function update(gl: WebGL2RenderingContext, state: SimulationState): SimulationState {
  let [drawFramebuffer, readFramebuffer] = state.framebuffers;

  if (drawFramebuffer.width != gl.canvas.width || drawFramebuffer.height != gl.canvas.height) {
    drawFramebuffer = resizeFramebuffer(gl, drawFramebuffer, gl.canvas.width, gl.canvas.height);
    readFramebuffer = resizeFramebuffer(gl, readFramebuffer, gl.canvas.width, gl.canvas.height);
  }

  state.framebuffers[0] = readFramebuffer;
  state.framebuffers[1] = drawFramebuffer;
  return state;
}

function draw(gl: WebGL2RenderingContext, shader: WebGLProgram, framebuffers: Framebuffer[], mesh: Mesh) {
  const [drawFramebuffer, readFramebuffer] = framebuffers;
  gl.bindFramebuffer(gl.FRAMEBUFFER, drawFramebuffer.framebuffer);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(1, 1, drawFramebuffer.width - 1, drawFramebuffer.height - 1);
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
