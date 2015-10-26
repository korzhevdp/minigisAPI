/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
function listenDependencyCalcCalls() {
	$(".map_calc").unbind().click(function() {
		var ids = [];
		$("#propPage input[type=checkbox]").prop('checked', false)
		$("#propPage input[type=checkbox]").each(function() {
			ids.push($(this).val());
		});
		$.ajax({
			url      : "/nodal/dependencycalc",
			type     : "POST",
			data     : {
				lid  : prop.ttl,
				ids  : ids
			},
			dataType : "script",
			success  : function() {
				var a,
					b;
				for (a in data) {
					//console.log(a);
					if (data.hasOwnProperty(a)) {
						ids = checkPointsInclusion(data[a].ym, a);
						//console.log(ids);
					}
				}
				nePolygons.removeAll();
			},
			error: function (data, stat, err) {
				console.log([ data, stat, err ].join("\n"));
			}
		});
	});
}

function checkPointsInclusion(data, id) {
	var a,
		c,
		d,
		includedIn = [],
		src_geometry = e_objects.get(0).geometry.getCoordinates(),
		polygon = new ymaps.Polygon(new ymaps.geometry.Polygon.fromEncodedCoordinates(data));

	nePolygons.add(polygon);
	if(prop.pr === 1){
		if(polygon.geometry.contains(src_geometry)) {
			$("#p" + id).prop('checked', true);
		}
	}

	if(prop.pr === 2){
		for (c in src_geometry){
			if (src_geometry.hasOwnProperty(c)) {
				if (polygon.geometry.contains(src_geometry[c])) {
					$("#p" + id).prop('checked', true);
				}
			}
		}
	}

	if(prop.pr === 3){
		for (c in src_geometry) {
			if (src_geometry.hasOwnProperty(c)) {
				for (d in src_geometry[c]){
					if (src_geometry[c].hasOwnProperty(d)) {
						if(polygon.geometry.contains(src_geometry[c][d])) {
							$("#p" + id).prop('checked', true);
						}
					}
				}
			}
		}
	}
}

// Nodal 2.0 Section
function length_calc() { // imho deprecated передаётся объект геометрии от источника - object.geometry
	var src         = e_objects.get(0).geometry.getCoordinates(),
		i,
		routelength = 0,
		next        = 0,
		start       = [],
		end         = [],
		delta       = 0;
	if (src.length < 2) {
		$(".f_len").html(0);
	}
	for (i = 0; i < (src.length - 1); i += 1) {
		next         = (i + 1);
		start        = [ src[i][0], src[i][1] ];
		end          = [ src[next][0], src[next][1] ];
		delta        = ymaps.coordSystem.geo.getDistance(start, end);
		routelength += delta;
	}
	routelength = (isNaN(routelength)) ? 0 : routelength.toFixed(2);
	$(".f_len").html(routelength);
	$(".f_vtx").html(e_objects.get(0).geometry.getLength());
}

function field_calc() { //передаётся объект геометрии от источника - object.geometry площадь круга на плоскости
	var rads = e_objects.get(0).geometry.getRadius(),
		length = Math.PI * 2 * rads,
		field = Math.PI * rads * rads;
		//console.log(rads);
	$("#cir_raduis").html(rads);
	$("#cir_len").html(length.toFixed(3));
	$("#cir_field").html(field.toFixed(3));
	$("#cir_raduis").html(rads);
}

function perimeter_calc() { //передаётся объект геометрии от источника - object.geometry
	var src = e_objects.get(0).geometry.getCoordinates(),
		routelength = 0,
		next        = 0,
		start       = [],
		end         = [],
		delta       = 0,
		vtx_count   = 0,
		j,
		i;
	if (src[0].length < 2) {
		return "0";
	}
	for (j = 0; j < src.length; j += 1) {
		vtx_count += src[j].length;
		for (i = 0; i < (src[j].length - 1); i += 1) {
			next         = (i + 1);
			start        = src[j][i];
			end          = src[j][next];
			delta        = ymaps.coordSystem.geo.getDistance(start, end);
			routelength += delta;
		}
	}
	routelength = (isNaN(routelength)) ? 0 : routelength;
	$(".f_len").html(routelength.toFixed(2));
	$(".f_vtx").html(vtx_count - 1);
	return true;
}
// ######################################################
// geocoder Section
function request_geocode_toMapPoint(coords) { // запрос геокодеру по координатам точечного объекта. (массив из объекта геометрии)
	ymaps.geocode(coords, { kind: ['house']}).then(function (result) {
		var names = [],
			address;
		result.geoObjects.each(
			function (object) {
				names.push(object.properties.get('name'));
			}
		);
		address = (names[0] !== "undefined") ? [names[0]].join(', ') : "Нет адреса";
		$(".l_addr").val(address);
		if(map.balloon.isOpen() && $("#f_address") !== undefined){
			$("#f_address").val(address);
		} else {
			map.balloon.open(coords, {
				contentBody: '<div class="ymaps_balloon"><input type="text" value="' + [ parseFloat(coords[0]).toFixed(8), parseFloat(coords[1]).toFixed(8) ].join(', ') + '"><br>' + address + '</div>'
			});
		}
	});
}

function request_geocode_toPointObject(coords) { // запрос геокодеру по координатам точечного объекта. (массив из объекта геометрии)
	ymaps.geocode(coords, { kind: ['house']}).then(function (result) {
		var names = [],
			address;
		result.geoObjects.each(
			function (object) {
				names.push(object.properties.get('name'));
			}
		);
		prop.address = (names[0] !== "undefined") ? [names[0]].join(', ') : "Нет адреса";
		$("#l_addr").val(prop.address);
	});
}

function convert_to_vertexes() {
	var k = [],
		i = 1;
	v_objects.each(function (item) {
		var gtype = item.geometry.getType(),
			a,
			b,
			array;
		if (gtype === 'LineString' || gtype === 'Polygon') {
			array = item.geometry.getCoordinates();
			for (a in array) {
				if (array.hasOwnProperty(a)) {
					for (b in array[a]) {
						if (array[a].hasOwnProperty(b)) {
							k[i] = {
								description : item.properties.get('description') + " вершина " + i,
								coords      : array[a][b].join(","),
								pr          : 1,
								attributes  : 'system#blueflag'
							};
							i += 1;
						}
					}
				}
			}
		}
	});
	place_objects(k);
}


// for further devel

function describe_set() {
	console.log(related[484]);
}

function get_context() {
	$.ajax({
		url: "/editor/get_context",
		data: {
			id : $("#l_id").val()
		},
		type: "POST",
		dataType: 'script',
		success: function () {
			//console.log(data);
			describe_set();
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err].join("\n"));
		}
	});
}