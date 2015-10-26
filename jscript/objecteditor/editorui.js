/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */

function update_point_data() { // передаётся объект целиком
	var src = e_objects.get(0).geometry.getCoordinates(),
		lon = parseFloat(src[0]),
		lat = parseFloat(src[1]);
	$("#m_lat").val(lat);
	$("#m_lon").val(lon);
	prop.coords = prop.coords_array = prop.coords_aux = src.join(",");
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
	prop.coords = coords;
	for (a in coordarray) {
		if (coordarray.hasOwnProperty(a)) {
			coordstring.push("[" + coordarray[a].join(",") + "]");
		}
	}
	prop.coords_array = coordarray.join(",");
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
					coordcontour.push("[" + coordarray[c][a].join(",") + "]")
				}
			}
			coordstring.push("[" + coordcontour.join(",") + "]");
		}
	}
	prop.coords = coords;
	prop.coords_array = "[" + coordstring.join(",") + "]";
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
	var src    = e_objects.get(0).geometry.getCoordinates();
	prop.coords = prop.coords_array = prop.coords_aux = [src[0].join(","), src[1].join(",")].join(",");
	//console.log(prop.toSource());
}

function update_object_data() { // универсальный обновитель данных - самостоятельно берёт данные от редактируемого объекта
	var geometry = e_objects.get(0).geometry,
		type     = geometry.getType();
	//console.log("update_object_data");
	switch (type) {
	case "Point":
		update_point_data();
		break;
	case "LineString":
		update_line_data();
		break;
	case "Polygon":
		update_polygon_data();
		break;
	case "Circle":
		update_circle_data();
		break;
	case "Rectangle":
		update_rectangle_data();
		break;
	}
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
	if(yandex_styles !== undefined) {
		$(".styles").append(yandex_styles.join("\n"));
	}
	if(yandex_markers !== undefined) {
		$(".styles").append(yandex_markers.join("\n"));
	}
}

function composeStyleDropdowns(type, style) {
	// TODO!!!
	// разобраться с наборами стилей!!!
	makeSelect(type);
	$('.styles option[value="' + style + '"]').attr('selected', 'selected'); // повторно пробегаем :(
	// навешиваем действие
	$(".styles").change(function () {
		prop.attr = normalize_style($(this).val());
		e_objects.get(0).options.set(ymaps.option.presetStorage.get(prop.attr));
		$('.styles option[value="' + prop.attr + '"]').attr('selected', 'selected');
	});
}

function addPropertyPagesAction(){
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
				$("#propPage, .propPage").html(data);
				$("#propPage").css('display', 'block');
				$(".mainPage, #schedule").css('display', 'none');
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
		$("#propPage, #schedule").css('display', 'none');
		$("#mainPage").css('display', 'block');
	});
}

function addschedulePageAction() {
	// здесь будет выводиться расписание
	$(".schedule").unbind().click(function () {
		saveType = "schedule";
		get_schedule();
		$("#propPage").css('display', 'none');
		$("#schedule").css('display', 'block');
			alert(saveType);
	});
}

function addPublishLocationAction() {
	$(".l_act").prop('checked', prop.active);
	$(".l_act").unbind().click(function () {
		prop.active = $(this).prop('checked') ? 1 : 0 ;
		$(".l_act").prop('checked', prop.active);
	});
}

function addCommentLocationAction() {
	$(".l_comm").prop('checked', prop.comments);
	$(".l_comm").unbind().click(function () {
		prop.comments = $(this).prop('checked') ? 1 : 0 ;
		$(".l_comm").prop('checked', prop.comments);
	});
}

function listen_page_caller() {
	addPropertyPagesAction();
	addMapPageAction();
	addschedulePageAction();
	addPublishLocationAction();
	addCommentLocationAction();
}

function switch_panel() {
	$(".panels").addClass('hide');
	$("#cpanel" + prop.pr).removeClass('hide');
}

function save_properties() {
	var cb = [],
		te = {},
		se = {},
		ta = {},
		senddata;
	prop.address     = ($("#f_address").val() === undefined) ? $("#l_addr").val() : $("#f_address").val();
	prop.name        = ($("#f_name").val()    === undefined) ? $("#l_name").val() : $("#f_name").val();
	prop.attr        = ($("#f_style").val()   === undefined) ? $("#l_attr").val() : $("#f_style").val();
	prop.contact     = ($("#f_cont").val()    === undefined) ? $("#l_cont").val() : $("#f_cont").val();
	$("#propPage input[type=checkbox]:checked").each(function () {
		cb.push($(this).val());
	});
	$("#propPage input[type=text]").each(function () {
		te[$(this).attr("ref")] = $(this).val();
	});
	$("#propPage textarea").each(function () {
		ta[$(this).attr("ref")] = $(this).val();
	});
	$("#propPage select").each(function () {
		se[$(this).attr("ref")] = $(this).val();
	});
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

// deprecated
function init_balloon_controls() {
	composeStyleDropdowns(prop.pr, prop.attr);
	listen_page_caller();
	$("#f_address").val(prop.address);
	$("#f_name").val(prop.name);
	$("#f_style").val(prop.attr);
	$("#f_cont").val(prop.contact);
	$("#mainPage").css('display', 'block');
	$("#closeBalloonBtn").click(function () {
		e_objects.get(0).options.set(ymaps.option.presetStorage.get(normalize_style(prop.attr)));
		map.balloon.close();
	});
}

// События пользовательского интерфейса и ввода данных

$(".mapsw").click(function(){
	if($(this).attr("id") == "toGoogle") {
		map.setType("google#map");
		$("#toGoogle").addClass("active");
		$("#toYandex").removeClass("active");
	}
	if($(this).attr("id") == "toYandex") {
		map.setType("yandex#map");
		$("#toYandex").addClass("active");
		$("#toGoogle").removeClass("active");
	}
});

$("#l_name").keyup(function() {
	$("#header_location_name").html($(this).val());
});

$("#type").change(function() {
	$("#description").html($("#type option:selected").text())
	prop.type = $(this).val();
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
		center   = [parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val())];
		radius   = parseFloat($("#cir_radius").val());
		e_objects.add(object);
		e_objects.get(0).geometry.setCoordinates(center);
		e_objects.get(0).geometry.setRadius(radius);
	}
});

$("#type").change(function () {
	var ref = parseInt($("#type option:selected").attr('ref'), 10);
	if (ref !== prop.pr) {
		if (confirm("Такая смена типа объекта при сохранении приведёт к потере координат и необходимости нарисовать объект заново.\nВы желаете продолжить?")) {
			prop.pr         = ref;
			prop.decription = $("#type option:selected").html();
			prop.attr       = normalize_style($("#type option:selected").attr('apply'));
			prop.type       = $("#type option:selected").val();
			e_objects.removeAll();			//очищаем коллекцию РО
			a_objects.removeAll();			//очищаем коллекцию ВО
			switch_panel();
		} else {
			$('#type [value="' + prop.type + '"]').attr("selected", "selected");
		}
	}
	composeStyleDropdowns(prop.pr, prop.attr);
	listen_page_caller();
	if(e_objects.getLength()) {
		e_objects.get(0).options.set(ymaps.option.presetStorage.get(prop.attr));
	}
});

$("#loadImage").click(function(){
	$("#imageLoader").modal('show');
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
			ids     : arr2
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

$("#bas_points").change(function () { // запрос с сервера опорных точек для ломаных и полигонов
	//bas_points_request($(this));
});

$(".chopContour").click(function () {
	// objecteditor/nodal.js
	chopPolyline();
});

$(".nodeExport").click(function () {
	var coords = e_objects.get(0).geometry.getCoordinates(),
		type   = e_objects.get(0).geometry.getType(),
		scoords,
		a,
		m;
	switch (type) {
	case "Point":
		coords = [coords[1].coords[0]];
		break;
	case "LineString":
		for (a in coords) {
			if (coords.hasOwnProperty(a)) {
				coords[a] = [ coords[a][1], coords[a][0] ];
			}
		}
		break;
	case "Polygon":
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
		break;
	case "Circle":
		coords = [[coords[0][1], coords[0][1]], coords[1]];
		break;
	}
	$("#exportedNodes").html(coords.toSource());
	$("#nodeExport").modal("show");
});