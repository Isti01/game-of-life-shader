#version 300 es
precision highp float;

out vec4 color;

uniform sampler2D state;

ivec3 cellAt(ivec2 location) {
    return ivec3(ceil(texelFetch(state, location, 0).rgb));
}

void main() {
    ivec2 center = ivec2(gl_FragCoord.x, gl_FragCoord.y);
    ivec3 neighbors = cellAt(center + ivec2(0, 1)) +
        cellAt(center + ivec2(1, -1)) +
        cellAt(center + ivec2(-1, -1)) +
        cellAt(center + ivec2(-1, 1)) +
        cellAt(center + ivec2(1, 1)) +
        cellAt(center + ivec2(0, -1)) +
        cellAt(center + ivec2(-1, 0)) +
        cellAt(center + ivec2(1, 0));

    const float alive = 1.0;
    const float dead = 0.0;
    if (neighbors.r == 3) {
        color.r = alive;
    } else if (neighbors.r < 2 || neighbors.r > 3) {
        color.r = dead;
    } else {
        color.r = cellAt(center).r == 1 ? alive : dead;
    }

    if (neighbors.g == 3) {
        color.g = alive;
    } else if (neighbors.g < 2 || neighbors.g > 3) {
        color.g = dead;
    } else {
        color.g = cellAt(center).g == 1 ? alive : dead;
    }

    if (neighbors.b == 3) {
        color.b = alive;
    } else if (neighbors.b < 2 || neighbors.b > 3) {
        color.b = dead;
    } else {
        color.b = cellAt(center).b == 1 ? alive : dead;
    }
    color.a = 1.0;
}