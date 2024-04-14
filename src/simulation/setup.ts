import vertexShader from "../../shaders/gameOfLife.vert?raw";
import fragmentShader from "../../shaders/gameOfLife.frag?raw";
import multiChannelFragmentShader from "../../shaders/gameOfLifeMultiChannel.frag?raw";
import { createShaderModule } from "../rendering/shaders.ts";
import { createFullScreenTriangle } from "../rendering/fullScreenTriangle.ts";
import { createFrameBuffer, Framebuffer } from "../rendering/framebuffer.ts";
import type { SimulationState } from "./gameOfLife.ts";
import Color from "color";

export function init(gl: WebGL2RenderingContext, image: HTMLImageElement): SimulationState | null {
  const singleChannelShader = createShaderModule(gl, vertexShader, fragmentShader);
  if (singleChannelShader == null) {
    return null;
  }

  const multiChannelShader = createShaderModule(gl, vertexShader, multiChannelFragmentShader);
  if (multiChannelShader == null) {
    gl.deleteProgram(singleChannelShader);
    return null;
  }

  const mesh = createFullScreenTriangle(gl);
  if (mesh === null) {
    gl.deleteProgram(singleChannelShader);
    gl.deleteProgram(singleChannelShader);
    return null;
  }

  const framebuffers = [
    createFrameBuffer(gl, { source: "image", image }),
    createFrameBuffer(gl, { source: "image", image })
  ];

  if (framebuffers.some(framebuffer => framebuffer === null)) {
    framebuffers.forEach(gl.deleteFramebuffer);
    gl.deleteProgram(singleChannelShader);
    gl.deleteProgram(singleChannelShader);
    return null;
  }

  return {
    shader: multiChannelShader,
    singleChannelShader,
    multiChannelShader,
    mesh,
    framebuffers: framebuffers as Framebuffer[]
  };
}

export function initListeners(gl: WebGL2RenderingContext, state: SimulationState) {
  const multiChannelCheckbox = document.getElementById("use-multichannel") as HTMLInputElement;
  multiChannelCheckbox.checked = state.shader === state.multiChannelShader;
  multiChannelCheckbox.addEventListener("input", () => {
      state.shader = multiChannelCheckbox.checked ? state.multiChannelShader : state.singleChannelShader;
    }
  );

  let drawingColor = "#ffffff";
  const colorInput = document.getElementById("color") as HTMLInputElement;
  colorInput.value = drawingColor;
  colorInput.addEventListener("input", () => {
      drawingColor = colorInput.value;
    }
  );

  let capturingEvents = false;
  document.addEventListener("pointerdown", ev => {
    if (ev.button === 0) capturingEvents = true;
  });
  document.addEventListener("pointerup", ev => {
    if (ev.button === 0) capturingEvents = false;
  });
  document.addEventListener("pointermove", ev => {
    if (!capturingEvents || state === null) {
      return;
    }
    gl.bindTexture(gl.TEXTURE_2D, state.framebuffers[1].colorAttachment);

    const x = ev.x;
    const y = gl.canvas.height - ev.y;
    const colorBuffer = Color(drawingColor).rgb().round().array();
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([...colorBuffer, 1, ...colorBuffer, 1, ...colorBuffer, 1, ...colorBuffer, 1]));
  });
}
