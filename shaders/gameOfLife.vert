#version 300 es
precision highp float;

layout(location = 0) in vec2 uv;

void main() {
    gl_Position = vec4(uv * 4.0 - 1.0, 0, 1);
}