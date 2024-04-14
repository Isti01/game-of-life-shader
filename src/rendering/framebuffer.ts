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