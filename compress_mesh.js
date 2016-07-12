/**
 *	compress_mesh.js
 *	=================
 *
 *	This very simple module allows you to compress an
 *	.obj file, given its face's array, through the compress_mesh object
 *	declared by including this file.
 *	
 *	It is a naive implementation of the strips compression 
 *	algorithm, so it is not efficient on very big meshes, 
 *	and also do not give the optimal compression
 *	
 *	For each new face, the process will try to attach it
 *	in the head or the tail of every existing strip.
 *	If it is not possible, a new strip is created.
 *
 *	Usage : 
 *	
 *	Let be faces an array of faces : 
 *
 *	- compression : 
 *		compress_mesh.compress(faces)
 *
 *	After process execution (could be long), you can access 
 *	the results at the compress_mesh's fiels :
 *
 *	- exploitation :
 *		compress_mesh.strips 	-> Strips obtained (Array of Array of indexes) 
 *		compress_mesh.progress 	-> current progress
 *		compress_mesh.infos.nb_faces 	-> Number of faces (input)
 *		compress_mesh.infos.nb_strips 	-> Number of strips (output)
 *		compress_mesh.infos.max_strip_size 		-> The length of the longest strip
 *		compress_mesh.infos.compression_rate 	-> The percent of compression (high is better)
 *
 *	MIT License
 */
(function (scope, undefined) {
  'use strict';

	var compress_mesh = {};

	if (typeof module !== 'undefined') {
		module.exports = compress_mesh;
	}else{
		scope.compress_mesh = compress_mesh;
	}

	compress_mesh.strips = [ ],
	compress_mesh.progress = 0,
	compress_mesh.infos = {};

	var max_strip_length = 0,
		nb_faces = 0;

	compress_mesh.compress = function(faces){

		for(var i = 0 ; i <= faces.length ; i+=3){

			let face = faces.slice(i, i+3),
				done = false ;

			nb_faces++;
			compress_mesh.progress = (i / faces.length)*100 ;
			if(i%250 == 0){
				progressBar(compress_mesh.progress);
				console.log(compress_mesh.progress);
			}

			for(var strip of compress_mesh.strips){

				let v = attach(face, head(strip)) ;
				if(v !== null){
					//push front
					strip.unshift(v);
					done = true ;
					break ;
				}else{
					v = attach(face, tail(strip));
					if(v !== null){
						// push back
						strip.push(v) ;
						done = true ;
						break ;
					}
				}
			} // strips
			if(!done) compress_mesh.strips.push(face);
		}// faces

		let size = 0 ;
		progressBar(compress_mesh.progress);
		for(var strip of compress_mesh.strips){	// stats
			size += strip.length ;
			if(strip.length > max_strip_length) max_strip_length = strip.length ; 
		}
		//console.log(compress_mesh.strips);
		let info = "Compress done !\n"
		info += "Input : " + nb_faces + " triangles\n"
		info += "Output : " + compress_mesh.strips.length + " strips\n" ;
		info += "Longest strip : " + max_strip_length + " vertices\n" ;
		info +=  "Taux compression : " + Math.round((1 - (size / faces.length))*100) + "%";
		window.alert(info);

		compress_mesh.infos.nb_faces = nb_faces ;
		compress_mesh.infos.nb_strips = compress_mesh.strips.length ;
		compress_mesh.infos.max_strip_size = max_strip_length ;
		compress_mesh.infos.compression_rate = Math.round((1 - (size / faces.length))*100) ;
	}

	/**
	 *	Test wether a face could be attached to an existent strip's end
	 *
	 *	@param vertices Array[3 * int] candidate face
	 *	@param end		Array[2 * int] end of strip 
	 *	@return null | point to add
	 */
	function attach(vertices, end){

		let v1 = vertices[0],
			v2 = vertices[1],
			v3 = vertices[2];

		if(end.indexOf(v1) !== -1){
			if(end.indexOf(v2) !== -1) return v3 ;
			else if(end.indexOf(v3) !== -1) return v2 ;
			else return null ;
		}else if(end.indexOf(v2) !== -1){
			if(end.indexOf(v1) !== -1) return v3 ;
			else if(end.indexOf(v3) !== -1) return v1 ;
			else return null ;
		}else return null;
	}

	function head(array){

		return [ array[0], array[1] ] ;
	}

	function tail(array){

		return [ array[array.length], array[array.length - 1] ] ;
	}

})(this);
