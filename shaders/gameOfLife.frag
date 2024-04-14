#version 300 es
precision highp float;

in vec2 uv;

out vec4 color;

uniform sampler2D state;

int aliveCellAt(ivec2 location) {
    return int(texelFetch(state, location, 0).rgb != vec3(0));
}

void main() {
    ivec2 center = ivec2(gl_FragCoord.x, gl_FragCoord.y);
    int neighbors =aliveCellAt(center + ivec2(0, 1))+
    aliveCellAt(center + ivec2(1, -1))+
    aliveCellAt(center + ivec2(-1, -1))+
    aliveCellAt(center + ivec2(-1, 1))+
    aliveCellAt(center + ivec2(1, 1))+
    aliveCellAt(center + ivec2(0, -1))+
    aliveCellAt(center + ivec2(-1, 0))+
    aliveCellAt(center + ivec2(1, 0));

    if (neighbors == 3) {
        color = vec4(1);
    } else if (neighbors < 2 || neighbors > 3) {
        color = vec4(0, 0, 0, 1);
    } else {
        color = aliveCellAt(center) == 1 ? vec4(1) : vec4(0, 0, 0, 1);
    }
}