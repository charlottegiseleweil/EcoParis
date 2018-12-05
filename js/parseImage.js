
// ========== INSTRUCTIONS ==========
/*
 *	If you have to change either the "intercommunalites.geojson" file or the voronois, then you'll need to recompute containent of pixels with this page
 *
 *	SETPS:
 *		- down there, change the name of the geojson you want to change (one of them or both)
 *		- if you don't want to recompute voronois containment, comment between [1] and [2] (around lines 200)
 *		- if you don't want to recompute intercomm containment, comment between [2] and [3] (around lines 200)
 *		- run this page locally, "python -m http.server"
 *		- load the page, and wait. It might take a while, certainly around 30-40 minutes. (You might want to leave your browser as it is and not touch anything, because
 *			while computing on my computer, reducing the browser or even simply switching tab to another caused the page to crash and reload.)
 *		- even better if you want to make sure it did not crash: don't uncomment between [1] and [3], load the page and open the javascript console (so before it is working,
 *			because while computing I wasn't able to open the console), then uncomment save and reload, the counter will indicate progression.
 *		- Finally, when the page has loaded you can download you files at the bottom of the page
 */

var InterCommFilePath = "intercommunalites.geojson"
var VoronoiFilePath = "public/data/backup/voronois-10.json"


function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	var urlDPT = InterCommFilePath;
	var urlVoronoi = VoronoiFilePath;

	// Load the JSON file(s)
	queue()
	    .defer(d3.json, urlDPT) // Load Watershed Shape
	    .defer(d3.json, urlVoronoi) // Load Voronoi Shape
	    .await(loadGeoJSON); // When the GeoJsons are fully loaded, call the function loadGeom


	function loadGeoJSON(error, dpt_shape, voronoi_shape){

	    //General Map
	    var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        maxZoom: 19,
	        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	    });

	    var tl = new L.LatLng(49.2485668,1.4403262) //focused on Paris
	    var br = new L.LatLng(48.1108602,3.5496114)

	    // Zoomed on Paris
	    var map = L.map('ParisMap', {zoomControl: true}).fitBounds(L.latLngBounds(tl,br));
	    basemap.addTo(map);

	    function style(feature) {
	        return {
	            opacity:0,
	            fillOpacity: 0
	        };
	    }

	    L.geoJson(dpt_shape,{style:style}).addTo(map);

	    var svg = d3.select("#ParisMap").select("svg")

	    function projectPoint(x, y) {
	        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	        this.stream.point(point.x, point.y);
	    }

	    transform = d3.geo.transform({point: projectPoint});
	    var path = d3.geo.path()
	        .projection(transform);

	    var watersheds = svg.append("g").selectAll("path")
	        .data(voronoi_shape.features)
	        .enter().append('path')
	            .attr('d', path)
	            .attr('vector-effect', 'non-scaling-stroke')
	            .style('stroke', "#000")
	            .attr("fill","none")

        map.on("viewreset", update);
	    update();
        
	    function update() {
	        var width = (map.latLngToLayerPoint(br).x-map.latLngToLayerPoint(tl).x)
	        var height = (map.latLngToLayerPoint(br).y-map.latLngToLayerPoint(tl).y)
            
	        watersheds.attr("d",path)

              
	    }
	    
	    function getColour(d){
	        return  d > 200 ? '1c1ae3':
	                d > 150 ? '2a4efc':
	                d > 100 ? '3c8dfd':
	                d > 50 ? '4cb2fe':
	                          'ccffff';
	    }
	    function loadFile(filePath) {
			var result = null;
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", filePath, false);
			xmlhttp.send();
			if (xmlhttp.status==200) {
				result = xmlhttp.responseText;
			}
			return result;
		}

		var width = 1977
		var height = 1590

		var interComm_cont_data=[]
		var voronoi_cont_data=[]

	    for (var i=0; i<height*width; i++) {
	        var px = i%width
	        var py = Math.floor(i/width)
	        //var value = getRasterPixelValue(i%canvas.width,i/canvas.width)
	        if(px >= 0 && px < width && py >= 0 && py < height){

	        	interComm_cont_data[i]=0;
	        	voronoi_cont_data[i]=0;

	        	var tx = px/(width-1)
	        	var ty = py/(height-1)

	        	var lat = tl.lat * (1-ty) + br.lat*ty
	        	var lng = tl.lng * (1-tx) + br.lng*tx

	        	//
	        	// ============ [1], interComm below
	        	//

	        	/*for (var k=0; k<dpt_shape.features.length; ++k){
	        		if (d3.geoContains(dpt_shape.features[k],[lng,lat])){
			        	interComm_cont_data[i]=k+1
			        	break
		        	}
	        	}*/

	        	//
	        	// ============ [2], voronoi below
	        	//

        		/*for (var k=0; k<voronoi_shape.features.length; ++k){
					if (d3.geoContains(voronoi_shape.features[k],[lng,lat])){
		        		voronoi_cont_data[i]=k+1
		        		break
		        	}
	        	}*/

	        	//
	        	// ============ [3]
	        	//
	        	
	        	
	        	if (px == 0){
	        		console.log(py+"/"+height)
	        	}
	        }
	    }

	    function download(text, name) {
			d3.select(".container").append("a").attr("id","a"+name)
			var a = document.getElementById("a"+name);
			var file = new Blob([text], {type: 'json'});
			a.href = URL.createObjectURL(file);
			a.innerHTML="Click here to download "+name
			d3.select(".container").append("br")
			a.download = name;
		}

		download(JSON.stringify({"width" : width,
								"height" : height,
								"data" : JSON.stringify(interComm_cont_data)}),"interComm_cont.json")
		download(JSON.stringify({"width" : width,
								"height" : height,
								"data" : JSON.stringify(voronoi_cont_data)}),"voronoi_cont.json")


	}
});

