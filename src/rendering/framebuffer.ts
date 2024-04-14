export interface Framebuffer {
  framebuffer: WebGLFramebuffer,
  colorAttachment: WebGLTexture,
  width: number,
  height: number,
}

// I've been using Vulkan, how did you know?
export type FramebufferAttachmentCreateInfo = {
  source: "empty",
  width: number,
  height: number,
} | {
  source: "image",
  image: HTMLImageElement
};

export function resizeFramebuffer(gl: WebGL2RenderingContext, framebuffer: Framebuffer, width: number, height: number): Framebuffer {
  const resized = createFrameBuffer(gl, { source: "empty", width, height });
  if (resized === null) {
    return framebuffer;
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, resized.framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT);
  blitFramebuffer(gl, framebuffer, resized);

  gl.deleteFramebuffer(framebuffer.framebuffer);
  gl.deleteTexture(framebuffer.colorAttachment);
  return resized;
}

export function blitFramebuffer(gl: WebGL2RenderingContext, source: Framebuffer, destination: Framebuffer) {
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, destination.framebuffer);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.framebuffer);

  const dstY0 = Math.floor(Math.max(destination.height - source.height, 0) / 2);
  const dstX0 = Math.floor(Math.max(destination.width - source.width, 0) / 2);
  const dstX1 = Math.min(source.width + dstX0, destination.width);
  const dstY1 = Math.min(source.height + dstY0, destination.height);
  gl.blitFramebuffer(0, 0, source.width, source.height, dstX0, dstY0, dstX1, dstY1, gl.COLOR_BUFFER_BIT, gl.NEAREST);
}

export function createFrameBuffer(gl: WebGL2RenderingContext, createInfo: FramebufferAttachmentCreateInfo): Framebuffer | null {
  const framebuffer = gl.createFramebuffer();
  if (framebuffer === null) {
    return null;
  }

  const colorAttachment = createTexture(gl, createInfo);
  if (colorAttachment === null) {
    gl.deleteFramebuffer(framebuffer);
    return null;
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorAttachment, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const width = createInfo.source === "image" ? createInfo.image.width : createInfo.width;
  const height = createInfo.source === "image" ? createInfo.image.height : createInfo.height;
  return { framebuffer, colorAttachment, width, height };
}

function createTexture(gl: WebGL2RenderingContext, createInfo: FramebufferAttachmentCreateInfo): WebGLTexture | null {
  const texture = gl.createTexture();
  if (texture === null) {
    return null;
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  if (createInfo.source == "empty") {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, createInfo.width, createInfo.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, createInfo.image);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}