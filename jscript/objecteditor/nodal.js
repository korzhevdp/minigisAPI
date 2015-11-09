/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals data, ymaps, map, prop, bas_path, e_objects, a_objects, v_objects, getObject, nePolygons, getNewGeometry */
function listenDependencyCalcCalls() {
	$(".map_calc").unbind().click(function () {
		var ids = [];
		$("#propPage input[type=checkbox]").prop('checked', false);
		$("#propPage input[type=checkbox]").each(function () {
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
			success  : function () {
				var a;
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

function check_vertex_presence_in_geometry(bas_path, currpoint, gtype) {
	var a;
	if ( gtype === "Point" ) {
		return false;
	}
	for (a in bas_path) { // проверка массива координат по циклу:
		// если текущая координата есть в массиве и она не является крайней (чтоб зациклить можно было)
		if (bas_path.hasOwnProperty(a)) {
			if ((currpoint.join(",") === bas_path[a].join(",") && a) || gtype === 'Сircle') {
				bas_index_array.splice(a, 1); // удалить упоминание об этом индексе
				bas_path.splice(a, 1); // удалить точку с этой координатой
				return true;
			}
		}
	}
	return false;
}

function setup_virtual_collection() {
	v_objects.events.add('click', function (item) {
		var tgeometry = e_objects.get(0).geometry,
			gtype     = tgeometry.getType(),
			aux_geometry = [],
			geometry,
			options   = ymaps.option.presetStorage.get(normalize_style(prop.attr)),
			m,
			b,
			object,
			currindex = parseInt(item.get('target').properties.get('ttl'), 10),
			currpoint = item.get('target').geometry.getCoordinates(),
			vFunctions = {
				'Point': function () {
					tgeometry.setCoordinates(item.get('target').geometry.getCoordinates());
				},
				'LineString': function () {
					tgeometry.insert(tgeometry.getLength(), currpoint);
					bas_path.push(currpoint);//добавить в конец массива координат.
				},
				'Polygon': function () {
					m = tgeometry.getCoordinates()[0];
					m[m.length - 1] = currpoint;
					e_objects.get(0).geometry.setCoordinates([m]);
					perimeter_calc();
				},
				'Circle': function () {
					tgeometry.setRadius(ymaps.coordSystem.geo.getDistance(tgeometry.getCoordinates(), currpoint));
					//a_objects.get(1).geometry.setCoordinates(item.get('target').geometry.getCoordinates()); // костыль ???
					field_calc();
				},
				'Rectangle': function () {
					aux_geometry.push(currpoint);
					if (aux_geometry.length === 2) {
						tgeometry.setCoordinates(aux_geometry);
						aux_geometry = [];
					}
				}
			};

		if (!e_objects.getLength()) {
			geometry = getNewGeometry(prop.pr, currpoint);
			object   = getObject(geometry, prop, options);
			e_objects.add(object);
			bas_path.push(currpoint);
			make_environment(object);
		}

		b = check_vertex_presence_in_geometry(bas_path, currpoint, gtype);
		if (!b) {//если по циклу координаты не нашлось
			bas_index_array.push(currindex);//добавить в конец массива координат.
			bas_path  = tgeometry.getCoordinates();
			vFunctions[gtype]();
			$("#l_coord_y_array").val(bas_path.join(","));
			$("#l_coord_y_aux").val(bas_index_array.join(","));
		}
	});
	v_objects.options.set({
		hasHint: 1,
		hasBalloon: 0,
		draggable: 0,
		zIndex: 520,
		cursor: 'pointer'
	});
}

function checkPointsInclusion(data, id) {
	var c,
		d,
		src_geometry = e_objects.get(0).geometry.getCoordinates(),
		polygon = new ymaps.Polygon(new ymaps.geometry.Polygon.fromEncodedCoordinates(data));

	nePolygons.add(polygon);
	if (prop.pr === 1) {
		if (polygon.geometry.contains(src_geometry)) {
			$("#p" + id).prop('checked', true);
		}
	}

	if (prop.pr === 2) {
		for (c in src_geometry) {
			if (src_geometry.hasOwnProperty(c)) {
				if (polygon.geometry.contains(src_geometry[c])) {
					$("#p" + id).prop('checked', true);
				}
			}
		}
	}

	if (prop.pr === 3) {
		for (c in src_geometry) {
			if (src_geometry.hasOwnProperty(c)) {
				for (d in src_geometry[c]){
					if (src_geometry[c].hasOwnProperty(d)) {
						if (polygon.geometry.contains(src_geometry[c][d])) {
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
		address = (names[0] === undefined) ? "Нет адреса" : [names[0]].join(', ') ;
		$(".l_addr").val(address);
		if (map.balloon.isOpen() && $("#f_address") === undefined) {
			map.balloon.open(coords, {
				contentBody: '<div class="ymaps_balloon"><input type="text" value="' + [ parseFloat(coords[0]).toFixed(10), parseFloat(coords[1]).toFixed(10) ].join(', ') + '"><br>' + address + '</div>'
			});
		} else {
			$("#f_address").val(address);
		}
	});
}

function request_geocode_toPointObject(coords) { // запрос геокодеру по координатам точечного объекта. (массив из объекта геометрии)
	ymaps.geocode(coords, { kind: ['house']}).then(function (result) {
		var names = [];
		result.geoObjects.each(
			function (object) {
				names.push(object.properties.get('name'));
			}
		);
		prop.address = (names[0] === "undefined") ? "Нет адреса" : [names[0]].join(', ');
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
			array,
			vertexFunctions = {
				'Point'     : function () { return false; },
				'LineString': function () { 
					array = item.geometry.getCoordinates();
					for (a in array) {
						if (array.hasOwnProperty(a)) {
							k[i] = {
								description : item.properties.get('description') + " вершина " + i,
								coords      : array[a],
								pr          : 1,
								attributes  : 'system#blueflag'
							};
							i += 1;
						}
					}
				},
				'Polygon'   : function () { 
					array = item.geometry.getCoordinates();
					for (a in array) {
						if (array.hasOwnProperty(a)) {
							for (b in array[a]) {
								if (array[a].hasOwnProperty(b)) {
									k[i] = {
										description : item.properties.get('description') + " вершина " + i,
										coords      : array[a][b],
										pr          : 1,
										attributes  : 'system#blueflag'
									};
									i += 1;
								}
							}
						}
					}
				},
				'Circle'    : function () { return false; },
				'Rectangle' : function () { return false; },
			};
		vertexFunctions[gtype]();
	});
	place_objects(k);
}

function chopPolyline() {
	var item = e_objects.get(0),
		g,
		i,
		geometry,
		options,
		object;
	if (item.geometry.getType() !== "LineString" && item.geometry.getType() !== "Polygon") {
		console.log("wrong geometry type");
		return false;
	}

	if (item.geometry.getType() === "LineString") {
		g = item.geometry.getCoordinates();
	} else {
		// расширить на n многоугольников
		g = item.geometry.getCoordinates()[0];
	}
	e_objects.remove(item);
	for (i = 1; i < g.length; i += 1) {
		//console.log("adding " + i);
		geometry = new ymaps.geometry.LineString([ g[i - 1], g[i] ]);
		options  = (g[i - 1] > g[i]) ? { strokeColor: '0000FFDD', strokeWidth: 4 } : { strokeColor: 'FF0000DD', strokeWidth: 4 };
		object   = new ymaps.Polyline(geometry, {}, options);
		e_objects.add(object);
	}
}

$(".chopContour").click(function () {
	// objecteditor/nodal.js
	chopPolyline();
});

$(".nodeExport").click(function () {
	var coords = e_objects.get(0).geometry.getCoordinates(),
		type   = e_objects.get(0).geometry.getType(),
		exportFunctions = {
			'Point'      : function (coords) { return [coords[1].coords[0]]; },
			'LineString' : function (coords) {
				var a;
				for (a in coords) {
					if (coords.hasOwnProperty(a)) {
						coords[a] = [ coords[a][1], coords[a][0] ];
					}
				}
				return coords;
			},
			'Polygon'    : function (coords) {
				var m,
					a,
					scoords;
				for (m in coords) {
					if (coords.hasOwnProperty(m)) {
						scoords = coords[m];
						for (a in scoords) {
							if (scoords.hasOwnProperty(a)) {
								coords[m][a] = [ scoords[a][1], scoords[a][0] ];
							}
						}
					}
				}
				return coords;
			},
			'Circle'     : function (coords) { return [[coords[0][1], coords[0][0]], coords[1]]; }
		};
	coords = exportFunctions[type]();
	$("#exportedNodes").html(coords.toSource());
	$("#nodeExport").modal("show");
});



// for further devel
/*
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
*/