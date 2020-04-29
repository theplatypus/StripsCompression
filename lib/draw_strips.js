/**
 *	draw_strips.js
 * =================
 *
 *	Including this file loads a "strips-drawer" module in the namespace
 *
 *	The aim of this module is to display simultaneously some strips
 *	using WebGL specification, and so to illustrate graphically
 *	the mesh compression based on this method, for example.
 *
 *	The parameters you may would like to change are accessible
 *	though the "draw_strips" objects.
 *
 *	Usage :
 *
 *	1 - initialize (draw_strips.init)
 *	2 - add strips (draw_strips.addStrip)
 *	3 - render 	 (draw_strips.animate)
 *	4 - see your mesh constructs itself !
 *
 *	The code disposition and basics steps of WebGL are widely inspired
 *	from the excellent tuto on Mozilla Developer Network :
 *	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL
 *
 *	This module needs to got the well-known matrix libraries
 *	"gl_utils.js" and "sylvester.js" already loaded in the context
 *
 * 	License MIT
 */
(function(scope, undefined) {
    // 'use strict';

    var draw_strips = {};

    if (typeof module !== 'undefined') {
        module.exports = draw_strips;
    } else {
        scope.draw_strips = draw_strips;
    }

	    ///
	    ///		PUBLIC  ATTRIBUTES
	    ///

    draw_strips.canvasWidth = 1440;
    draw_strips.canvasHeight = 720;

    draw_strips.pauseAnimation = false;
    draw_strips.speedAnimation = 25;

    draw_strips.progress = 0;

    // autoRotate
    draw_strips.autoX = false;
    draw_strips.autoXvalue = 0;
    draw_strips.autoY = false;
    draw_strips.autoYvalue = 0;
    draw_strips.autoZ = false;
    draw_strips.autoZvalue = 0;

    draw_strips.rotationHorizontal = 0.0;
    draw_strips.rotationVertical = 0.0;
    draw_strips.rotationZ = 0.0;
    draw_strips.moveX = 0;
    draw_strips.moveY = 0;
    draw_strips.moveZ = 1;


	    ///
	    ///		PRIVATE ATTRIBUTES
	    ///

    var canvas;
    var gl;
    var shaderProgram;
    var nb_strips = 0;

    // RENDERER MATRIX
    var mvMatrix;
    var perspectiveMatrix;

    // GL POINTERS
    var vertexPositionAttribute;
    var vertexNormalAttribute;
    var textureCoordAttribute;

    // COMMON BUFFERS
    var stripVerticesBuffer;
    var stripVerticesTextureCoordBuffer;
    var stripVerticesNormalBuffer;
    var stripImage;
    var stripTexture;

    // STRIP'S BUFFER ARRAY
    var stripVerticesIndexBuffer = [];
    var lineBuffer;
    var t_max = [];

    /// ANIMATION
    var t = 0;
    var lastStripUpdateTime = 0;
    var lastStripUpdateTime = 0;


	    ///
	    ///		PUBLICS FUNCTIONS
	    ///

  /**
	*	init
	*	=====
	*
	*	Initialize WebGL components (canvas, shaders)
	*	Bind the static data into glBuffers
	*
	*	@param {string} canvasID : the target's DOM ID
	*	@param {Array} vertices : vertices positions
	*	@param {Array} vertexNormals
	*	@param {Array} texturesCoordinates
	*	@param {string} texturePath
	*/
    draw_strips.init = function(canvasID, vertices, vertexNormals, textureCoordinates, texturePath) {
        canvas = document.getElementById(canvasID);

        initWebGL(canvas); // Initialize the GL context

        // Only continue if WebGL is available and working

        if (gl) {
            gl.clearColor(0.9, 0.9, 0.9, 1.0); // Clear to black, fully opaque
            gl.clearDepth(1.0); // Clear everything
            gl.enable(gl.DEPTH_TEST); // Enable depth testing
            gl.depthFunc(gl.LEQUAL); // Near things obscure far things

            // Initialize the shaders; this is where all the lighting for the
            // vertices and so forth is established.

            initShaders();

            // Here's where we call the routine that builds all the objects
            // we'll be drawing.

            initBuffers(vertices, vertexNormals, textureCoordinates);

            // Next, load and set up the textures we'll be using.

            initTextures(texturePath);

            nb_strips = 0;
        }
    }

   /**
    *	addStrip
    *	========
    *
    *	Add a strip to display. Strips may have differents length.
    *	Indexes are integers.
    *	@param {Array} stripVertexIndices : an Array of Indexes describing a strip
    */
    draw_strips.addStrip = function(stripVertexIndices) {

        // Build the element array buffer; this specifies the indices
        // into the vertex array for each face's vertices.

        stripVerticesIndexBuffer[nb_strips] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripVerticesIndexBuffer[nb_strips]);

        // Now send the element array to GL
        var int16 = new Uint16Array(stripVertexIndices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            int16, gl.STATIC_DRAW);

        t_max[nb_strips] = int16.length;

        nb_strips++;
    }

   /**
    *	animate
    *	=======
    *
    *	Display progessively all the strips registered at this time
    *	@param {Integer} fps : frames per second
    */
    draw_strips.animate = function(fps) {

        t = 0;
        freq = (1000 / fps);
        setInterval(function() {

            drawScene();

            var currentTime = (new Date).getTime();

            if (lastStripUpdateTime) {
                var delta = currentTime - lastStripUpdateTime;
                if (draw_strips.autoX) draw_strips.rotationHorizontal += (draw_strips.autoXvalue * delta) / 1000.0;
                if (draw_strips.autoY) draw_strips.rotationVertical += (draw_strips.autoYvalue * delta) / 1000.0;
                if (draw_strips.autoZ) draw_strips.rotationZ += (draw_strips.autoZvalue * delta) / 1000.0;
            }
            lastStripUpdateTime = currentTime;
            if (!draw_strips.pauseAnimation){
            	t++;
            	draw_strips.progress = (t / draw_strips.speedAnimation);
            }
        }, freq);
    }

    	///
    	///		PRIVATE FUNCTIONS
    	///

    //
    // initWebGL
    //
    // Initialize WebGL, returning the GL context or null if
    // WebGL isn't available or could not be initialized.
    //
    function initWebGL() {
        gl = null;

        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) {}

        canvas.onmousedown = handleMouseDown;
        canvas.onmouseup = handleMouseUp;
        canvas.onmousemove = handleMouseMove;
        canvas.onmousewheel = handleMouseWheel;
        document.onkeydown = handleKeyDown;

        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
        }
    }

    //
    // initBuffers
    //
    //
    function initBuffers(vertices, vertexNormals, textureCoordinates) {

        // Create a buffer for the strip's vertices.

        stripVerticesBuffer = gl.createBuffer();

        // Select the stripVerticesBuffer as the one to apply vertex
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, stripVerticesBuffer);

        // Now pass the list of vertices into WebGL to build the shape. We
        // do this by creating a Float32Array from the JavaScript array,
        // then use it to fill the current vertex buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Set up the normals for the vertices, so that we can compute lighting.

        stripVerticesNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stripVerticesNormalBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
            gl.STATIC_DRAW);

        // Map the texture onto the strip's faces.

        stripVerticesTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, stripVerticesTextureCoordBuffer);


        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
            gl.STATIC_DRAW);

        lineBuffer = gl.createBuffer();
    }

    //
    // initTextures
    //
    // Initialize the textures we'll be using, then initiate a load of
    // the texture images. The handleTextureLoaded() callback will finish
    // the job; it gets called each time a texture finishes loading.
    //
    function initTextures(path) {

        stripTexture = gl.createTexture();
        stripImage = new Image();
        stripImage.onload = function() {
            handleTextureLoaded(stripImage, stripTexture);
        }
        stripImage.src = path;
    }

    function handleTextureLoaded(image, texture) {

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    //
    // drawScene
    //
    // Draw the scene.
    //
    function drawScene() {
        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Establish the perspective with which we want to view the
        // scene. Our field of view is 65 degrees

        perspectiveMatrix = makePerspective(65, draw_strips.canvasWidth / draw_strips.canvasHeight, 0.01, 1000.0);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.

        loadIdentity();

        // Now move the drawing position a bit to where we want to start
        // drawing the strip.

        mvTranslate([draw_strips.moveX, draw_strips.moveY, -6 * draw_strips.moveZ]);

        // Save the current matrix, then rotate before we draw.

        mvPushMatrix();
        mvRotate(draw_strips.rotationHorizontal, [0, 1, 0]);
        mvRotate(draw_strips.rotationVertical, [1, 0, 0]);
        mvRotate(draw_strips.rotationZ, [0, 0, 1]);


        // Draw the strips.
        for (var n = 0; n <= nb_strips; n++) {

            gl.bindBuffer(gl.ARRAY_BUFFER, stripVerticesBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            // Set the texture coordinates attribute for the vertices.

            gl.bindBuffer(gl.ARRAY_BUFFER, stripVerticesTextureCoordBuffer);
            gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

            // Bind the normals buffer to the shader attribute.

            gl.bindBuffer(gl.ARRAY_BUFFER, stripVerticesNormalBuffer);
            gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

            // Specify the texture to map onto the faces.

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, stripTexture);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripVerticesIndexBuffer[n]);
            setMatrixUniforms();
            var strip_length = Math.min(draw_strips.progress, t_max[n]);
            gl.drawElements(gl.TRIANGLE_STRIP, strip_length, gl.UNSIGNED_SHORT, 0);

            gl.lineWidth(5) ;
            //var int16 = new Uint16Array([0, 1]);
            //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineBuffer);
        	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, int16, gl.STATIC_DRAW);
        	for(var i = 0 ; i < strip_length ; i++){

        		//gl.drawElements(gl.LINE_LOOP, 2, gl.UNSIGNED_SHORT, 0);
        	}
        };

        // Restore the original matrix
        mvPopMatrix();
    }

    //
    // initShaders
    //
    // Initialize the shaders, so WebGL knows how to light our scene.
    //
    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        // Create the shader program

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program.");
        }

        gl.useProgram(shaderProgram);

        vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(vertexPositionAttribute);

        textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(textureCoordAttribute);

        vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(vertexNormalAttribute);
    }

    //
    // getShader
    //
    // Loads a shader program by scouring the current document,
    // looking for a script with the specified ID.
    //
    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);

        // Didn't find an element with the specified ID; abort.

        if (!shaderScript) {
            return null;
        }

        // Walk through the source element's children, building the
        // shader source string.

        var theSource = "";
        var currentChild = shaderScript.firstChild;

        while (currentChild) {
            if (currentChild.nodeType == 3) {
                theSource += currentChild.textContent;
            }

            currentChild = currentChild.nextSibling;
        }

        // Now figure out what type of shader script we have,
        // based on its MIME type.

        var shader;

        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null; // Unknown shader type
        }

        // Send the source to the shader object

        gl.shaderSource(shader, theSource);

        // Compile the shader program

        gl.compileShader(shader);

        // See if it compiled successfully

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    ///
    ///		Mouse control
    ///
    var mouseDown = false,
        x = 0, // ancienne position du pointeur
        y = 0,
        offsetx, // pour suivre le déplacement du curseur
        offsety;

    function handleMouseDown(event) {
        //console.log("mousedown");
        mouseDown = true;

        x = event.pageX;
        y = event.pageY;
    }

    function handleMouseUp(event) {
        //console.log("mouseup");
        mouseDown = false;

        x = event.pageX;
        y = event.pageY;
    }

    function handleMouseMove(event) {

        if (!mouseDown) return;
        //console.log("mousemove");

        //draw_strips.autoY = false ;
        //draw_strips.autoX = false ;

        offsetx = event.pageX - x;
        offsety = event.pageY - y;
        x = event.pageX;
        y = event.pageY;

        draw_strips.rotationHorizontal += (offsetx / 10);
        draw_strips.rotationVertical += (offsety / 10);
        drawScene();
    }

    function handleKeyDown(event) {
        switch (String.fromCharCode(event.keyCode)) {
            case '(': // UP
                draw_strips.moveY += 1 ;
                break;
            case '&': // DOWN
                draw_strips.moveY -= 1 ;
                break;
            case '%': // LEFT
                draw_strips.moveX -= 1 ;
                break;
            case '\'': // RIGHT
                draw_strips.moveX += 1 ;
                break;
        }
    }

    function handleMouseWheel(event) {

        //draw_strips.autoY = false ;
        //draw_strips.autoX = false ;

        var move = event.wheelDelta / 240;
        draw_strips.moveZ += -1 * (move / 5);
        drawScene();
        return false; // Don't scroll the page as well
    }


    //
    // Matrix utility functions
    //

    function loadIdentity() {
        mvMatrix = Matrix.I(4);
    }

    function multMatrix(m) {
        mvMatrix = mvMatrix.x(m);
    }

    function mvTranslate(v) {
        multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    }

    function setMatrixUniforms() {
        var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));

        var normalMatrix = mvMatrix.inverse();
        normalMatrix = normalMatrix.transpose();
        var nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
        gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
    }

    var mvMatrixStack = [];

    function mvPushMatrix(m) {
        if (m) {
            mvMatrixStack.push(m.dup());
            mvMatrix = m.dup();
        } else {
            mvMatrixStack.push(mvMatrix.dup());
        }
    }

    function mvPopMatrix() {
        if (!mvMatrixStack.length) {
            throw ("Can't pop from an empty matrix stack.");
        }
        mvMatrix = mvMatrixStack.pop();
        return mvMatrix;
    }

    function mvRotate(angle, v) {
        var inRadians = angle * Math.PI / 180.0;
        var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
        multMatrix(m);
    }

})(this);
