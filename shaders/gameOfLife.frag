#version 300 es
precision highp float;

out vec4 color;

uniform sampler2D state;

// todo address out of bounds indexing. Is robust buffer access enabled in webgl?
int aliveCellAt(ivec2 location) {
    return int(texelFetch(state, location, 0).rgb != vec3(0));
}

void main() {
    ivec2 center = ivec2(gl_FragCoord.x, gl_FragCoord.y);
    int neighbors = aliveCellAt(center + ivec2(0, 1)) +
        aliveCellAt(center + ivec2(1, -1)) +
        aliveCellAt(center + ivec2(-1, -1)) +
        aliveCellAt(center + ivec2(-1, 1)) +
        aliveCellAt(center + ivec2(1, 1)) +
        aliveCellAt(center + ivec2(0, -1)) +
        aliveCellAt(center + ivec2(-1, 0)) +
        aliveCellAt(center + ivec2(1, 0));

    const vec4 alive = vec4(1);
    const vec4 dead = vec4(0, 0, 0, 1);
    if (neighbors == 3) {
        color = alive;
    } else if (neighbors < 2 || neighbors > 3) {
        color = dead;
    } else {
        color = aliveCellAt(center) == 1 ? alive : dead;
    }
}