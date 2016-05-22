/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals e_objects, a_objects, prop, ymaps, confirm, yandex_styles, yandex_markers, userstyles */

function update_point_data() { // передаётся объект целиком
	var src = e_objects.get(0).geometry.getCoordinates(),
		lon = parseFloat(src[0]),
		lat = parseFloat(src[1]);
	$("#m_lat").val(lat);
	$("#m_lon").val(lon);
	prop.coords = src.join(",");
	prop.coords_array = "[" + src.join(",") + "]";
	prop.coords_aux = bas_index_array.join(",");
	if ($("#traceAddress").prop("checked")) {
		request_geocode_toPointObject(src);
	}
	//console.log(prop.toSource());
}

function update_line_data() { // передаётся объект целиком
	var src         = e_objects.get(0).geometry,
		coords      = ymaps.geometry.LineString.toEncodedCoordinates(src),
		coordarray  = src.getCoordinates(),
		coordstring = [],
		a;

	for (a in coordarray) {
		if (coordarray.hasOwnProperty(a)) {
			coordstring.push(coordarray[a].join(","));
		}
	}
	prop.coords = coords;
	prop.coords_array = coordstring.join(";");
	prop.coords_aux = bas_index_array.join(",");
	length_calc(src);
	//console.log(prop.toSource());
}

function update_polygon_data() { // передаётся объект целиком
	var src          = e_objects.get(0).geometry,
		coords       = ymaps.geometry.Polygon.toEncodedCoordinates(src),
		coordarray   = src.getCoordinates(),
		coordstring  = [],
		coordcontour,
		c,
		a;

	for (c in coordarray) {
		if (coordarray.hasOwnProperty(c)) {
			coordcontour = [];
			for (a in coordarray[c]) {
				if (coordarray[c].hasOwnProperty(a)) {
					coordcontour.push(coordarray[c][a].join(","));
				}
			}
			coordstring.push(coordcontour.join(""));
		}
	}
	prop.coords = coords;
	prop.coords_array = coordstring.join(";");
	prop.coords_aux = bas_index_array.join(",");
	perimeter_calc(src);
	//console.log(coordstring.join(","));
}

function update_circle_data() { // передаётся объект целиком
	var src    = e_objects.get(0).geometry,
		center = src.getCoordinates(),
		radius = src.getRadius();
	$("#cir_lon").val(center[0]);
	$("#cir_lat").val(center[1]);
	$("#cir_radius").val(radius);
	prop.coords = prop.coords_array = prop.coords_aux = center.join(",") + ',' + radius;
	field_calc(src);
	if ($("#traceAddress").prop("checked")) {
		request_geocode_toPointObject(center);
	}
	//console.log(prop.toSource());
}

function update_rectangle_data() { // передаётся объект целиком
	var src     = e_objects.get(0).geometry.getCoordinates();
	prop.coords = prop.coords_array = prop.coords_aux = [src[0].join(","), src[1].join(",")].join(",");
	//console.log(prop.toSource());
}

function update_object_data() { // универсальный обновитель данных - самостоятельно берёт данные от редактируемого объекта
	var geometry = e_objects.get(0).geometry,
		type     = geometry.getType(),
		updateFunctions = {
			"Point"      : function () { update_point_data(); },
			"LineString" : function () { update_line_data(); },
			"Polygon"    : function () { update_polygon_data(); },
			"Circle"     : function () { update_circle_data(); },
			"Rectangle"  : function () { update_rectangle_data(); }
		};
	updateFunctions[type]();
	//$(".console pre").html(prop.toSource());
}

// User Interface Section
function makeSelect(type) {
	var a,
		icon,
		string;
	$(".styles").empty();
	for (a in userstyles) {
		if (userstyles.hasOwnProperty(a)) {
			if (userstyles[a].type === type && a.split("#")[0] !== 'paid') {
				icon = (userstyles[a].iconUrl === undefined) ? "" : 'style="background-image:url(' + userstyles[a].iconUrl + ');background-repeat:no-repeat;background-size: 24px auto;text-indent:22px;"';
				string   = '<option ' + icon + ' value="' + a + '">' + userstyles[a].title + '</option>';
				$(".styles").append(string);
			}
		}
	}
	listYandexMarkers();
}

function listYandexMarkers() {
	if (yandex_styles !== undefined) {
		$(".styles").append(yandex_styles.join("\n"));
	}
	if (yandex_markers !== undefined) {
		$(".styles").append(yandex_markers.join("\n"));
	}
}

function composeStyleDropdowns(type, style) {
	makeSelect(type);
	$('.styles option[value="' + style + '"]').attr('selected', 'selected'); // повторно пробегаем :(
	// навешиваем действие
	$(".styles").change(function () {
		prop.attr = normalize_style($(this).val());
		setOptionsToEditingObject(prop.attr);
		$('.styles option[value="' + prop.attr + '"]').attr('selected', 'selected');
	});
}

function setOptionsToEditingObject(attr){
	e_objects.get(0).options.set(ymaps.option.presetStorage.get(attr));
}

function addPropertyPagesAction() {
	$(".displayPage").unbind().click(function () {
		var page = $(this).attr("ref").split("/");
		saveType = "properties";
		$.ajax({
			url      : "/editor/get_property_page",
			data     : {
				group : page[0],
				loc   : prop.ttl,
				page  : page[2]
			},
			type     : "POST",
			dataType : 'html',
			success  : function (data) {
				$("#propPage").html(data);
				$(".mainPage, #schedule, #commutes").addClass("hide");
				$("#propPage").removeClass("hide");
				listenDependencyCalcCalls();
			},
			error: function (data, stat, err) {
				console.log([ data, stat, err ].join("\n"));
			}
		});
	});
}

function addMapPageAction() {
	$(".displayMain").unbind().click(function () {
		saveType = "properties";
		$(".propPage, #schedule, #commutes").addClass("hide");
		$("#mainPage").removeClass("hide");
	});
}

function setPropertyAction(selector, field){
	$(selector).prop('checked', field);
	$(selector).unbind().click(function () {
		field = $(this).prop('checked') ? 1 : 0 ;
		$(selector).prop('checked', field);
	});
}

function listen_page_caller() {
	addPropertyPagesAction();
	addMapPageAction();
	addSchedulePageAction();
	setPropertyAction(".l_act", prop.active);
	setPropertyAction(".l_comm", prop.comments);
	addCommutesPageAction();
}

function addSchedulePageAction() {
	// здесь будет выводиться расписание
	$(".schedule").unbind().click(function () {
		saveType = "schedule";
		get_schedule();
		$(".propPage, #commutes").addClass("hide");
		$("#schedule").removeClass("hide");
	});
}

function addCommutesPageAction() {
	// здесь будет выводиться улавливание
	if (prop.pr === 2 || prop.pr === 3) {
		$(".commutes").removeClass("hide");
		$(".commutes").unbind().click(function () {
			$(".propPage, #schedule").addClass("hide");
			$("#commutes").removeClass("hide");
		});
		return true;
	}
	$(".commutes").addClass("hide");
}

function switch_panel() {
	$(".panels").addClass('hide');
	$("#cpanel" + prop.pr).removeClass('hide');
}

function set_changed() {
	$("#saveBtn").removeClass("btn-primary").addClass("btn-warning");
}

function coalesceVals(selector1, selector2) {
	var value = ($(selector1).val() === undefined) ? $(selector2).val() : $(selector1).val();
	return value;
}

function pushToContainer(selector, container) {
	$(selector).each(function () {
		container[$(this).attr("ref")] = $(this).val();
	});
}

function save_properties() {
	var cb = [],
		te = {},
		se = {},
		ta = {},
		senddata;
	prop.address = coalesceVals("#f_address", "#l_addr");
	prop.name    = coalesceVals("#f_name"   , "#l_name");
	prop.attr    = coalesceVals("#f_style"  , "#l_attr");
	prop.contact = coalesceVals("#f_cont"   , "#l_cont");
	$("#propPage input[type=checkbox]:checked").each(function () {
		cb.push($(this).val());
	});
	pushToContainer("#propPage input[type=text]", te);
	pushToContainer("#propPage textarea", ta);
	pushToContainer("#propPage select", se);

	senddata = prop;
	senddata.check = cb;
	senddata.ta    = ta;
	senddata.te    = te;
	senddata.se    = se;
	$.ajax({
		url: "/editor/saveprops",
		type: "POST",
		data: senddata,
		dataType: 'script',
		success: function () {
			$("#saveBtn").removeClass("btn-warning").addClass("btn-primary").html("Сохранить!");
			prop.ttl = data.ttl;
			$("#uploadLID").val(data.ttl);
			map.balloon.close();
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err ].join("\n"));
		}
	});
}

// События пользовательского интерфейса и ввода данных

$(".mapsw").click(function () {
	var mode = $(this).attr("id"),
		mapType = (mode === "toGoogle") ? "google#map" : "yandex#map",
		passive = (mode === "toGoogle") ? "#toYandex"  : "toGoogle";
	map.setType(mapType);
	$(mode).addClass("active");
	$(passive).removeClass("active");
});

$(".panels").addClass('hide');
$("#cpanel" + prop.pr).removeClass('hide');
$('.modal').modal({ show: 0 });

$("#toGoogle").addClass("active");
$("#toYandex").removeClass("active");

$("#l_name").keyup(function () {
	$("#header_location_name").html($(this).val());
});

$("#cir_setter").click(function () {
	var geometry,
		options,
		object,
		center,
		radius;
	if (!e_objects.getLength()) {
		geometry = ymaps.geometry.Circle([ parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val()) ], parseFloat($("#cir_radius").val()));
		options  = ymaps.option.presetStorage.get(normalize_style(prop.attr));
		object   = ymaps.Circle(geometry, prop, options);
		e_objects.add(object);
	}
	center   = [parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val())];
	radius   = parseFloat($("#cir_radius").val());
	e_objects.get(0).geometry.setCoordinates(center);
	e_objects.get(0).geometry.setRadius(radius);
});

$(".nodeExport").click(function(){
	nodeExport();
});

function nodeExport() {
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
}

$("#type").change(function () {
	var ref = parseInt($("#type option:selected").attr('ref'), 10);
	if (ref !== prop.pr) {
		if (confirm("Cмена типа объекта приведёт к потере координат и необходимости нарисовать объект заново.\nВы желаете продолжить?")) {
			prop.pr         = ref;
			prop.decription = $("#type option:selected").html();
			prop.attr       = normalize_style($("#type option:selected").attr('apply'));
			prop.type       = $(this).val();
			$("#description").html($("#type option:selected").text());
			e_objects.removeAll();			//очищаем коллекцию РО
			a_objects.removeAll();			//очищаем коллекцию ВО
			switch_panel();
		} else {
			$('#type option[value="' + prop.type + '"]').attr("selected", "selected");
		}
	}
	composeStyleDropdowns(prop.pr, prop.attr);
	listen_page_caller();
	if (e_objects.getLength()) {
		setOptionsToEditingObject(prop.attr);
	}
});

$("#loadImage").click(function (){
	$("#imageLoader").modal('show');
});

$("#tolerance").keyup(function() {
	calculateToleranceParameters($(this).val());
});

$("#saveBtn").click(function () {
	if (saveType === 'properties') {
		save_properties();
	}
	if (saveType === 'schedule') {
		save_schedule();
	}
});

$("#setCenter").click(function () {
	map.setCenter([ parseFloat($("#m_lon").val()), parseFloat($("#m_lat").val()) ]);
});

$("#moveTo").click(function () {
	e_objects.each(function (item) {
		item.geometry.setCoordinates([ parseFloat($("#m_lon").val()), parseFloat($("#m_lat").val()) ]);
	});
});

$("#pointsLoad").click(function () {
	$("#loadPoints").modal('show');
});

$("#pointsClear").click(function () {
	v_objects.removeAll();
});

$("#loadSelectedObjects").unbind().click(function () {
	$("#loadPoints").modal('hide');
	var arr  = [],
		arr2 = [];
	$(".typechecker:checked").each(function () {
		arr.push($(this).val());
	});
	$(".selectedObjects:checked").each(function () {
		arr2.push($(this).val());
	});
	$.ajax({
		url: "/nodal/get_objects_by_type",
		data: {
			points  : arr,
			ids     : arr2,
			ttl     : prop.ttl
		},
		type: "POST",
		dataType: 'script',
		success: function () {
			place_objects(data);
			convert_to_vertexes();
		},
		error: function (data, stat, err) {
			console.log([data, stat, err].join("\n"));
		}
	});
});

$(".typefetcher").click(function (e) {
	var t = $(this).attr('ref');
	e.stopPropagation();
	if ($("#tbodyn" + t + ":empty").length) {
		$.ajax({
			url: "/nodal/get_object_list_by_type",
			data: {
				type : t
			},
			type: "POST",
			dataType: 'html',
			success: function (data) {
				$("#tbodyn" + t).append(data);
			},
			error: function (data, stat, err) {
				console.log([data, stat, err].join("\n"));
			}
		});
	} else {
		$("#tbodyn" + t).empty();
	}
});

$("#toVertex").click(function () { // конверсия вершин полигонов в опорные точки с сохранением исходных полигонов на карте
	convert_to_vertexes();
});

$("#toGeometry").click(function () { // конверсия опорных точек в ломаные и полигоны
	// не сделано. Пустая функция.
	convert_to_geometry();
});
// запрос улавливание
$("#requestTrapping").click(function(){
	// objecteditor/nodal.js
	requestTrapping();
});

function setupTrappedPointsRemove() {
	$("#trappedPoints li i.icon-remove").click(function(){
		$(this).parent().remove();
		for (a in bas_index_array) {
			if (bas_index_array.hasOwnProperty(a) && bas_index_array[a] === parseInt($(this).parent().attr("vertex"), 10)) {
				bas_index_array.splice(a, 1);
			}
		}
		//alert(bas_index_array.toSource());
	});
}

$(".chopContour").click(function () {
	// objecteditor/nodal.js
	chopPolyline();
});

listen_page_caller();
composeStyleDropdowns(prop.pr, prop.attr);

/*
/// script specific actions
*/
