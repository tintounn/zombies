class Renderer {
	constructor(gl) {
		this.gl = gl;
		this.ext = this.gl.getExtension("ANGLE_instanced_arrays");

		this.initMatrix();
		this.initShaders();
		this.initBuffers();

		this.cubesOffset = [];
		this.cubesColor = [];
		this.cubesSize = [];
	}

	initMatrix() {
		this.mMatrix = mat4.create();
		this.pMatrix = mat4.create();
		this.vMatrix = mat4.create();
	}

	initShaders() {
		let fragmentShader = this.getShader("shader-fs");
		let vertexShader = this.getShader("shader-vs");

		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		if(!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}

		this.gl.useProgram(this.shaderProgram);

		this.shaderProgram.cubeVertexAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertex");
		this.shaderProgram.cubeOffsetAttribute = this.gl.getAttribLocation(this.shaderProgram, "aOffset");
		this.shaderProgram.cubeColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aColor");
		this.shaderProgram.cubeSizeAttribute = this.gl.getAttribLocation(this.shaderProgram, "aSize");

		this.shaderProgram.matrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMatrix");
	}

	initBuffers() {
		this.cubeVertexBuffer = this.gl.createBuffer();
		this.cubeOffsetBuffer = this.gl.createBuffer();
		this.cubeSizeBuffer = this.gl.createBuffer();
		this.cubeColorBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexBuffer);
		let vertices = [
			-0.5, 0.5, 0.0,
			0.5, 0.5, 0.0,
			-0.5, -0.5, 0.0,
			0.5, -0.5, 0.0,

			-0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			-0.5, -0.5, 1.0,
			0.5, -0.5, 1.0,

			-0.5, 0.5, 1.0,
			-0.5, -0.5, 1.0,
			-0.5, 0.5, 0.0,
			-0.5, -0.5, 0.0,

			0.5, 0.5, 1.0,
			0.5, -0.5, 1.0,
			0.5, 0.5, 0.0,
			0.5, -0.5, 0.0,

			0.5, 0.5, 1.0,
			-0.5, 0.5, 1.0,
			0.5, 0.5, 0.0,
			-0.5, 0.5, 0.0,

			0.5, -0.5, 1.0,
			-0.5, -0.5, 1.0,
			0.5, -0.5, 0.0,
			-0.5, -0.5, 0.0,
		];
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
	}

	renderCube(offset, size, color) {
		this.cubesOffset.push(offset.x); this.cubesOffset.push(offset.y); this.cubesOffset.push(offset.z);
		this.cubesColor.push(color.r); this.cubesColor.push(color.g); this.cubesColor.push(color.b); this.cubesColor.push(color.a);
		this.cubesSize.push(size.x); this.cubesSize.push(size.y); this.cubesSize.push(size.z);
	}

	draw() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexBuffer);
		this.gl.enableVertexAttribArray(this.shaderProgram.cubeVertexAttribute);
		this.gl.vertexAttribPointer(this.shaderProgram.cubeVertexAttribute, 3, this.gl.FLOAT, false, 0, 0)
		this.ext.vertexAttribDivisorANGLE(this.shaderProgram.cubeVertexAttribute, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeOffsetBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.cubesOffset), this.gl.DYNAMIC_DRAW);
		this.gl.enableVertexAttribArray(this.shaderProgram.cubeOffsetAttribute);
		this.gl.vertexAttribPointer(this.shaderProgram.cubeOffsetAttribute, 3, this.gl.FLOAT, false, 0, 0);
		this.ext.vertexAttribDivisorANGLE(this.shaderProgram.cubeOffsetAttribute, 1);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeColorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(this.cubesColor), this.gl.DYNAMIC_DRAW);
		this.gl.enableVertexAttribArray(this.shaderProgram.cubeColorAttribute);
		this.gl.vertexAttribPointer(this.shaderProgram.cubeColorAttribute, 4, this.gl.UNSIGNED_BYTE, false, 0, 0);
		this.ext.vertexAttribDivisorANGLE(this.shaderProgram.cubeColorAttribute, 1);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeSizeBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.cubesSize), this.gl.DYNAMIC_DRAW);
		this.gl.enableVertexAttribArray(this.shaderProgram.cubeSizeAttribute);
		this.gl.vertexAttribPointer(this.shaderProgram.cubeSizeAttribute, 3, this.gl.FLOAT, false, 0, 0);
		this.ext.vertexAttribDivisorANGLE(this.shaderProgram.cubeSizeAttribute, 1);

		this.ext.drawArraysInstancedANGLE(this.gl.TRIANGLE_STRIP, 0, 24, this.cubesOffset.length/3);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		this.cubesOffset = [];
		this.cubesColor = [];
		this.cubesSize = [];
	}

	setMatrix() {
		let matrix = mat4.create();
		mat4.multiply(matrix, matrix, this.pMatrix);
		mat4.multiply(matrix, matrix, this.vMatrix);
		mat4.multiply(matrix, matrix, this.mMatrix);

		this.gl.uniformMatrix4fv(this.shaderProgram.matrixUniform, false, matrix);
	}

	getShader(id) {
		let shaderScript = document.getElementById(id);
		if(!shaderScript) {
			return null;
		}

		let str = "";
		let k = shaderScript.firstChild;
		while(k) {
			if(k.nodeType == 3) str+=k.textContent;
			k = k.nextSibling;
		}

		let shader;
		if(shaderScript.type == 'x-shader/x-fragment') {
			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		} else if(shaderScript.type == 'x-shader/x-vertex') {
			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
		} else {
			console.log("Introuvable");
			return null;
		}

		this.gl.shaderSource(shader, str);
		this.gl.compileShader(shader);

		if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.log(this.gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}
}
