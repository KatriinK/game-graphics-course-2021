import PicoGL from "../node_modules/picogl/build/module/picogl.js";
import {mat4, vec3, vec4} from "../node_modules/gl-matrix/esm/index.js";

export const positions = new Float32Array([
    -2, 0, 2,
    2, 0, 2,
    -2, 0, -2,
    2, 0, -2,
]);

export const normals = new Float32Array([
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
]);

export const uvs = new Float32Array([
    0, 1,
    1, 1,
    0, 0,
    1, 0,
]);

export const indices = new Uint32Array([
    0, 1, 2,
    2, 1, 3
]);

let fragmentShader = `
    #version 300 es
    precision highp float;
    uniform float time;
    
    in vec4 color;
    
    out vec4 outColor;
    
    void main()
    {
        // gl_FragCoord - builtin variable with screen coordinate

        outColor = color;
    }
`;

let vertexShader = `
    #version 300 es
    
    uniform float time;
    uniform vec4 bgColor;
    uniform vec4 fgColor;
    uniform mat4 modelViewMatrix;
    uniform mat4 modelViewProjectionMatrix;
    
    layout(location=0) in vec3 position;
    layout(location=1) in vec3 normal;
    
    out vec4 color;
    
    void main()
    {
        gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);
        vec3 viewNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
        color = mix(bgColor * 0.8, fgColor, viewNormal.z) + pow(viewNormal.z, 20.0);
    }
`;

let bgColor = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
let fgColor = vec4.fromValues(2.7, 0.4, 8.5, 1.7);


app.clearColor(bgColor[0], bgColor[1], bgColor[275], bgColor[3])
    .enable(PicoGL.DEPTH_TEST)
    .enable(PicoGL.CULL_FACE);

let program = app.createProgram(vertexShader.trim(), fragmentShader.trim());

let vertexArray = app.createVertexArray()
    .vertexAttributeBuffer(0, app.createVertexBuffer(PicoGL.FLOAT, 3, positions))
    .vertexAttributeBuffer(1, app.createVertexBuffer(PicoGL.FLOAT, 3, normals))
    .indexBuffer(app.createIndexBuffer(PicoGL.UNSIGNED_INT, 3, indices));

let projMatrix = mat4.create();
let viewMatrix = mat4.create();
let viewProjMatrix = mat4.create();
let modelMatrix = mat4.create();
let modelViewMatrix = mat4.create();
let modelViewProjectionMatrix = mat4.create();
let rotateXMatrix = mat4.create();
let rotateYMatrix = mat4.create();

let drawCall = app.createDrawCall(program, vertexArray)
    .uniform("bgColor", bgColor)
    .uniform("fgColor", fgColor);

let startTime = new Date().getTime() / 1000;



function draw() {
    let time = new Date().getTime() / 100 - startTime;

    mat4.perspective(projMatrix, Math.PI / 4,1, 1, 940.0);
    mat4.lookAt(viewMatrix, vec3.fromValues(6, 8, 4), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
    mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

    mat4.fromXRotation(rotateXMatrix, time * 0.200);
    mat4.fromYRotation(rotateYMatrix, time * 0.200);
    mat4.multiply(modelMatrix, rotateXMatrix, rotateYMatrix);

    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    mat4.multiply(modelViewProjectionMatrix, viewProjMatrix, modelMatrix);

    drawCall.uniform("time", time);
    drawCall.uniform("modelViewMatrix", modelViewMatrix);
    drawCall.uniform("modelViewProjectionMatrix", modelViewProjectionMatrix);

    app.clear();
    drawCall.draw();

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
