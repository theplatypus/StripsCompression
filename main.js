function main(){

    var objStr = document.getElementById('obj_file').innerHTML;

    // load .obj in arrays (embedded in mesh Object, cf. web-gl-obj-loader documentation)
	var mesh = new OBJ.Mesh(objStr);

	// adapt canvas size to screen
	var width = window.innerWidth * 0.75 ;
	var height = (window.innerHeight-100) * 0.80 ; 
	document.getElementById("glcanvas").width = width ;
	document.getElementById("glcanvas").height = height ;
	draw_strips.canvasWidth = width ; 
	draw_strips.canvasHeight = height ;

	// bind the texture/UVs, vertices and normals (common to indexes)
	draw_strips.init("glcanvas",mesh.vertices, mesh.vertexNormals, mesh.textures, "./texture2.jpg");

	// TRIANGLES -> TRIANGLE_STRIPS (strips obtained are stored in compress_mesh.strips)
	compress_mesh.compress(mesh.indices);

	// push all the strips obtained by compression into the drawer
	for(var i = 0 ; i <= compress_mesh.strips.length ; i++){
		draw_strips.addStrip(compress_mesh.strips[i]) ;
	}

	// some arbitraries display settings, you may would like to change some of them
	draw_strips.autoX = true ;
	document.getElementById("toggleX").checked = true ;
	draw_strips.autoXvalue = 30 ;
	document.getElementById("rotX").value = 30 ;

	// get and display compression informations
	var info = "<p>Input : " + compress_mesh.infos.nb_faces + " triangles</p>"
		info += "<p>Output : " + compress_mesh.infos.nb_strips + " strips</p>" ;
		info += "<p>Longest strip : " + compress_mesh.infos.max_strip_size + " vertices</p>" ;
		info +=  "<p>Taux compression : " + compress_mesh.infos.compression_rate + "%</p>";
	document.getElementById("stats").innerHTML = info ;

	// begin the display
	draw_strips.animate(60) ;
}

/**
 *	Fired when some file is given to the associated <input>
 *	Read the file as a text file (.obj),
 *	then write its content in a DOM element,
 *	and finally run the main() function
 */
function handleFiles(files) {

	var file = files[0];
	if (file) {
	    var reader = new FileReader();
	    reader.readAsText(file, "UTF-8");
	    reader.onload = function (evt) {
	        document.getElementById("obj_file").innerHTML = evt.target.result;
	        main() ;
	    }
	    reader.onerror = function (evt) {
	        document.getElementById("obj_file").innerHTML = "error reading file";
	    }
	}
}


/**
 *	Display the current progress of compression step
 *	
 *	TODO : does not work properly, maybe with WebWorkers
 */
function progressBar(val) {

	var bar = document.getElementById('progressBar');
	var status = document.getElementById('status');
	status.innerHTML = val+"%";
	bar.value = val;
}


///
///	 	UI CONTROLLERS
///

function moveX(){
	draw_strips.moveX = document.getElementById("moveX").value ;
}

function moveY(){
	draw_strips.moveY = document.getElementById("moveY").value ;
}

function moveZ(){
	draw_strips.moveZ = document.getElementById("moveZ").value ;
}

function rotateX(){
	draw_strips.autoXvalue = document.getElementById("rotX").value ;
}

function rotateY(){
	draw_strips.autoYvalue = document.getElementById("rotY").value ;
}

function rotateZ(){
	draw_strips.autoZvalue = document.getElementById("rotZ").value ;
}

function toggleX(){
	draw_strips.autoX = !draw_strips.autoX ;
}

function toggleY(){
	draw_strips.autoY = !draw_strips.autoY ;
}

function toggleZ(){
	draw_strips.autoZ = !draw_strips.autoZ ;
}

function drawingSpeed(){
	draw_strips.animationSpeed = document.getElementById("drawingSpeed").value ;
}

function toggleStrips(){
	draw_strips.pauseAnimation = !draw_strips.pauseAnimation ;
}

function draw(){
	draw_strips.progress = document.getElementById("forceDraw").value ;
}

function minus(){
	document.getElementById("forceDraw").value = parseInt(document.getElementById("forceDraw").value) - 1 ;
	draw();
}

function plus(){
	document.getElementById("forceDraw").value = parseInt(document.getElementById("forceDraw").value) + 1 ;
	draw();
}