#version 300 es
precision highp float;

in vec2 uvIn;

out vec2 uv;

void main() {
    uv = uvIn * 2.0;
    gl_Position = vec4(uvIn * 4.0 - 1.0, .5, 1);
}