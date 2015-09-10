function init() {
	'use strict';
	var map,
		maptypes        = { 1: 'yandex#map', 2: 'yandex#satellite' },
		map_center      = prop.map_center,
		current         = 0,
		//current         = (typeof current !== 'undefined') ? current : prop.ttl,
		current_zoom    = (prop.current_zoom.length) ? prop.current_zoom : 15,
		current_type    = (prop.current_type.length) ? maptypes[prop.current_type] : 'yandex#satellite',
		//v_counter       = 0, // счётчик кликов на опорных объектах
		g2              = [], // заготовка переменной для геометрии фигур рисуемых по ВО
		//count           = 0,
		bas_path        = [],
		bas_index_array = [],
		lon             = map_center.split(",")[0],
		lat             = map_center.split(",")[1],
		a_objects       = new ymaps.GeoObjectArray(),  // Вспомогательная коллекция (точки управления фигурами - прямоугольник, круг)
		e_objects       = new ymaps.GeoObjectArray(),  // Вспомогательная коллекция (редактируемые объекты)
		v_objects       = new ymaps.GeoObjectArray(),  // Вспомогательная коллекция (опорные точки и объекты)
		nePolygons      = new ymaps.GeoObjectArray(),  // Вспомогательная коллекция 4
		searchControl   = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		related,
		cursor,
		genericBalloon = ymaps.templateLayoutFactory.createClass(
			'<h4 class="balloonHeader">$[properties.name|нет описания]&nbsp;&nbsp;&nbsp;&nbsp;<small>$[properties.description|нет описания]</small></h4>' +
				'<div id="mainPage">' +
					'<div class="input-prepend">'  +
						'<span class="add-on">Название:</span>' +
						'<input type="text" id="f_name" value="$[properties.name|нет данных]" placeholder="Введите название">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Адрес:</span>' +
						'<input type="text" id="f_address" value="$[properties.address|нет данных]" placeholder="Введите адрес">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Оформление:</span>' +
						'<select name="style" id="f_style" class="span11"></select>' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Контакты:</span>' +
						'<input type="text" id="f_cont" value="$[properties.contact|нет данных]" placeholder="Укажите контактных лиц / телефоны" class="span11">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Опубликован</span>' +
						'<input type="checkbox" id="f_act" style="vertical-align:middle" value="on">' +
					'</div>' +
				'</div>' +
				'<div id="propPage">тест</div>' +
				'<hr style="margin:3px;">' +
				'<div class="input-prepend pageButtons">' +
					'<label class="add-on" title="Кнопки прехода к страницам свойств">Страницы</label>' +
					'$[properties.pagelist|нет данных]' +
				'</div>' +
				'<!--<button type="button" class="btn btn-primary btn-mini pull-right" id="XD47">XD47</button>-->' +
				'<button type="button" class="btn btn-primary btn-mini" id="updDataBtn">Применить</button>' +
				'<button type="reset" class="btn btn-mini" id="closeBalloonBtn">Отмена</button>'
		);

//######################################### выносные функций, чтобы не загромождать код базовых функций

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
		});
	}

	function styleAddToStorage(src) {
		var a;
		for (a in src) {
			if (src.hasOwnProperty(a)) {
				ymaps.option.presetStorage.add(a, src[a]);
			}
		}
	}

	function place_aux_rct_points() {
		var aux_geometry1 = e_objects.get(0).geometry.getCoordinates()[0],
			aux_geometry2 = e_objects.get(0).geometry.getCoordinates()[1],
			aux_options1  = ymaps.option.presetStorage.get(normalize_style("system#arrowldn")),
			aux_options2  = ymaps.option.presetStorage.get(normalize_style("system#arrowrup"));
		a_objects.add(new ymaps.Placemark(aux_geometry1, prop, aux_options1));
		a_objects.add(new ymaps.Placemark(aux_geometry2, prop, aux_options2));
	}

	function place_aux_circle_points() {
		var startPoint    = e_objects.get(0).geometry.getCoordinates(),
			direction     = [1, 0],
			endPoint      = ymaps.coordSystem.geo.solveDirectProblem(startPoint, direction, e_objects.get(0).geometry.getRadius()).endPoint,
			aux_geometry1 = {type: "Point", coordinates: startPoint},
			aux_geometry2 = {type: "Point", coordinates: endPoint},
			aux_options1  = ymaps.option.presetStorage.get(normalize_style("system#arrowcen")),
			aux_options2  = ymaps.option.presetStorage.get(normalize_style("system#arrowrad"));
		a_objects.add(new ymaps.Placemark(aux_geometry1, { hintContent: 'Центр' }, aux_options1));
		a_objects.add(new ymaps.Placemark(aux_geometry2, { hintContent: 'Точка на окружности' }, aux_options2));
	}

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
			coordarray  = src.getCoordinates()
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

	function switch_panel() {
		$(".panels").addClass('hide');
		$("#cpanel" + prop.pr).removeClass('hide');
	}

	function place_object() {
		var geometry,
			options = ymaps.option.presetStorage.get(normalize_style(prop.attr)),
			object;

		if (prop === undefined) { // JSLint ругается, требует сравнивать напрямую
			console.log('Отсутствует блок данных');
			return false;
		}
		if (prop.coords === '0') { // JSLint ругается, требует сравнивать напрямую
			//console.log('Режим нового объекта');
			return false;
		}

		switch_panel();

		if (prop.coords.length > 3) {
			if (prop.pr === 1) {
				geometry = prop.coords.split(",");
				object   = new ymaps.Placemark(geometry, prop, options);
			}

			if (prop.pr === 2) {
				geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(prop.coords);
				object   = new ymaps.Polyline(geometry, prop, options);
			}

			if (prop.pr === 3) {
				geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(prop.coords);
				object   = new ymaps.Polygon(geometry, prop, options);
			}

			if (prop.pr === 4) {
				geometry = new ymaps.geometry.Circle([parseFloat(prop.coords.split(",")[0]), parseFloat(prop.coords.split(",")[1])], parseFloat(prop.coords.split(",")[2]));
				object   = new ymaps.Circle(geometry, prop, options);
			}

			if (prop.pr === 5) {
				geometry = new ymaps.geometry.Rectangle([
					[parseFloat(prop.coords.split(",")[0]), parseFloat(prop.coords.split(",")[1])],
					[parseFloat(prop.coords.split(",")[2]), parseFloat(prop.coords.split(",")[3])]
				]);
				object   = new ymaps.Rectangle(geometry, prop, options);
			}
		}
		e_objects.add(object);

		if (prop.pr === 3 || prop.pr === 2) {
			e_objects.get(0).editor.startEditing();
			perimeter_calc(geometry);
		}
		if (prop.pr !== 1) {
			map.setBounds(object.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: 20});
		} else {
			map.setCenter(prop.coords.split(","));
			update_point_data(object);
		}
		if (prop.pr === 4) {
			place_aux_circle_points();
		}
		if (prop.pr === 5) {
			place_aux_rct_points();
		}

		return true;
	}

	function place_objects(source) {
		var geometry,
			a,
			coords,
			pr,
			attr,
			options,
			properties,
			object;
		for (a in source) {
			if (source.hasOwnProperty(a)) {
				if (source[a].coords.length > 3) {
					coords     = source[a].coords;
					pr         = parseInt(source[a].pr, 10);
					properties = {
						hasBalloon  : 0,
						name        : source[a].loc_name,
						hintContent : source[a].description,
						description : source[a].description,
						ttl         : a
					};
					options    = ymaps.option.presetStorage.get(normalize_style(source[a].attributes));
					if (pr === 1) {
						geometry = { type: 'Point', coordinates: coords.split(",") };
						object = new ymaps.Placemark(geometry, properties, options);
					}
					if (pr === 2) {
						geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(coords);
						object = new ymaps.Polyline(geometry, properties, options);
					}
					if (pr === 3) {
						geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(coords);
						object = new ymaps.Polygon(geometry, properties, options);
					}
					if (pr === 4) {
						geometry = new ymaps.geometry.Circle([parseFloat(coords.split(",")[0]), parseFloat(coords.split(",")[1])], parseFloat(coords.split(",")[2]));
						object = new ymaps.Circle(geometry, properties, options);
					}
					if (pr === 5) {
						geometry = new ymaps.geometry.Rectangle([
							[parseFloat(coords.split(",")[0]), parseFloat(coords.split(",")[1])],
							[parseFloat(coords.split(",")[2]), parseFloat(coords.split(",")[3])]
						]);
						object = new ymaps.Rectangle(geometry, properties, options);
					}
					v_objects.add(object);
				}
			}
		}
	}

	function draw_object_by_type(click) {
		var geometry,
			object,
			coords,
			basic_coords,
			properties = { hasBalloon: 1, hasHint: 1, hintContent: prop.description, attr: prop.attr },
			options    = ymaps.option.presetStorage.get(normalize_style(prop.attr));
		if (!e_objects.getLength()) {
			switch (prop.pr) {
			case 1:
				geometry = { type: 'Point', coordinates: click.get('coordPosition') };
				object   = new ymaps.Placemark(geometry, prop, options);
				object.options.set({ draggable: 1 });

				break;
			case 2:
				geometry = new ymaps.geometry.LineString([click.get('coordPosition')]);
				object   = new ymaps.Polyline(geometry, prop, options);
				break;
			case 3:
				geometry = { type: 'Polygon', coordinates: [[click.get('coordPosition')]] };
				object   = new ymaps.Polygon(geometry, prop, options);
				break;
			case 4:
				geometry = [ click.get('coordPosition'), parseFloat($("#cir_radius").val()) ];
				object   = new ymaps.Circle(geometry, prop, options);
				break;
			case 5:
				basic_coords = click.get('coordPosition');
				geometry     = [ [basic_coords[0] - 0.01, basic_coords[1] - 0.01], [basic_coords[0] + 0.01, basic_coords[1] + 0.01] ];
				object       = new ymaps.Rectangle(geometry, prop, options);
				coords       = [geometry[0].join(","), geometry[1].join(",")].join(",");
				break;
			}
			e_objects.add(object);
			update_object_data();
			if (prop.pr === 2 || prop.pr === 3) {
				e_objects.get(0).editor.startDrawing();
			}
			if (prop.pr === 4) {
				place_aux_circle_points();
			}
			if (prop.pr === 5) {
				place_aux_rct_points();
			}
			$("#saveBtn").removeClass("btn-primary").addClass("btn-warning");
		}
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

	function convert_to_geometry() {
		// no proven value found
		// left empty
	}

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

	function normalize_style(style){
		var defaults   = {
				1: 'twirl#redDotIcon',
				2: 'routes#default',
				3: 'area#default',
				4: 'circle#default',
				5: 'rct#default'
			},
			test = ymaps.option.presetStorage.get(style);
		if (test === undefined) {
			style = ["twirl", prop.attr.split("#")[1]].join("#")
			if (ymaps.option.presetStorage.get(style) === undefined) {
				console.log("Стиль оформления отсутствует в хранилище. Применены умолчания.");
				style = defaults[prop.pr];
			}
		}
		// String
		return style;
	}

	// User Interface Section
	function makeSelect(src, id, name) {
		var a;
		for (a in src) {
			if (src.hasOwnProperty(a)) {
				$('#f_style').append('<option value="' + src[a][id] + '">' + src[a][name] + '</option>');
			}
		}
	}

	function init_balloon_controls() {
		// TODO!!!
		// разобраться с наборами стилей!!!
		switch (prop.pr) {
		case 1:
			makeSelect(style_src, 2, 3);
			$("#f_style").append(yandex_styles.join("\n")).append(yandex_markers.join("\n"));
			break;
		case 2:
			makeSelect(style_paths, 2, 4);
			break;
		case 3:
			makeSelect(style_polygons, 5, 7);
			break;
		case 4:
			makeSelect(style_circles, 7, 9);
			break;
		case 5:
			makeSelect(style_rectangles, 5, 7);
			break;
		}
		$('#f_style option[value="' + prop.attr + '"]').attr('selected', 'selected'); // повторно пробегаем :(

		$("#f_style").change(function () {
			prop.attr = $(this).val();
			e_objects.get(0).options.set(ymaps.option.presetStorage.get(normalize_style(prop.attr)))
		});

		$("#f_address").val(prop.address);
		$("#f_name").val(prop.name);
		$("#f_style").val(prop.attr);
		$("#f_cont").val(prop.contact);

		$("#f_act").prop('checked', prop.active);

		$("#f_act").click(function () {
			prop.active = $(this).prop('checked') ? 1 :0 ;
		});

		$("#mainPage").css('display', 'block');

		$(".displayMain").click(function () {
			$("#propPage").css('display', 'none');
			$("#mainPage").css('display', 'block');
		});

		$(".displayPage").click(function () {
			var page = $(this).attr("ref").split("/");
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
					$("#propPage").css('display', 'block');
					$("#mainPage").css('display', 'none');
				},
				error: function (data, stat, err) {
					console.log([ data, stat, err ].join("\n"));
				}
			});
		});

		$("#updDataBtn").click(function () {
			var cb = [],
				te = {},
				ta = {},
				senddata;
			prop.address     = $("#f_address").val();
			prop.name        = $("#f_name").val();
			prop.attr        = $("#f_style").val();
			prop.contact     = $("#f_cont").val();
			$("#propPage input:checked").each(function () {
				cb.push($(this).val());
			});
			$("#propPage input:text").each(function () {
				te[$(this).attr("ref")] = $(this).val();
			});
			$("#propPage textarea").each(function () {
				ta[$(this).attr("ref")] = $(this).val();
			});
			senddata = prop;
			senddata.check = cb;
			senddata.ta    = ta;
			senddata.te    = te;
			$.ajax({
				url: "/editor/saveprops",
				type: "POST",
				data: senddata,
				dataType: 'script',
				success: function () {
					$("#saveBtn").removeClass("btn-warning").addClass("btn-primary").html("Сохранить!");
					prop.ttl = data.ttl;
					map.balloon.close();
				},
				error: function (data, stat, err) {
					console.log([ data, stat, err ].join("\n"));
				}
			});
		});

		$("#closeBalloonBtn").click(function () {
			//console.log (22);
			e_objects.get(0).options.set(ymaps.option.presetStorage.get(normalize_style(prop.attr)));
			map.balloon.close();
		});
		/*
		$("#XD47").click(function () {
			get_context();
			describe_set(related);
		});
		*/
	}

	// События пользовательского интерфейса и ввода данных
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
		if(e_objects.getLength()) {
			e_objects.get(0).options.set(ymaps.option.presetStorage.get(normalize_style(prop.attr)));
		}
	});

	$("#saveBtn").click(function () {
		$.ajax({
			url: "/editor/saveobject",
			type: "POST",
			data: prop,
			dataType: 'script',
			success: function () {
				map.balloon.close();
				prop.ttl = data.ttl;
				$("#saveBtn").removeClass("btn-warning").addClass("btn-primary");
				//console.log(prop.ttl);
			},
			error: function (data, stat, err) {
				console.log([ data, stat, err ].join("\n"));
			}
		});
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
			url: "/ajaxutils/get_objects_by_type",
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
				url: "/ajaxutils/get_object_list_by_type",
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

	//# собственно код

	styleAddToStorage(userstyles);


	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);


	$(".panels").addClass('hide');
	$("#cpanel" + prop.pr).removeClass('hide');

	map = new ymaps.Map("YMapsID", {
		center:    [lon, lat],		// Центр карты
		zoom:      current_zoom,	// Коэффициент масштабирования
		type:      current_type,	// Тип карты
		behaviors: ["default"]
	});

	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	// ##### настройка событий #####
	map.events.add('click', function (click) {
		if (!e_objects.getLength()) {
			draw_object_by_type(click, current);
		} else {
			return false;
		}
	});

	map.events.add('contextmenu', function (e) {
		request_geocode_toMapPoint(e.get('coordPosition'));
	});

	map.events.add('balloonopen', function () {
		init_balloon_controls();
	});

	// ##### настройка представления карты #####
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);

	//здесь описывается обработка зависимости между редактируемым объектом (РО) и вспомогательными (ВО). От изменения РО меняются ВО
	// both events r needed...
	e_objects.events.add(['dragend', 'pixelgeometrychange'], function (event) {
		var aux_geometry,
			startPoint,
			endPoint,
			object       = e_objects.get(0),
			type         = object.geometry.getType(),
			direction    = [1, 0];
		switch (type) {
		case 'Point':
			if (event.get('type') === 'dragend') {
				update_object_data();
			}
			break;
		case 'Polygon':
				update_object_data();
			break;
		case 'LineString':
				update_object_data();
			break;
		case "Rectangle":
			aux_geometry = object.geometry.getCoordinates();
			if (a_objects.getLength() >= 2) {
				a_objects.get(0).geometry.setCoordinates(aux_geometry[0]);
				a_objects.get(1).geometry.setCoordinates(aux_geometry[1]);
			}
			break;
		case 'Circle':
			startPoint   = e_objects.get(0).geometry.getCoordinates();
			endPoint     = ymaps.coordSystem.geo.solveDirectProblem(startPoint, direction, e_objects.get(0).geometry.getRadius()).endPoint;
			if (event.get('type') === 'dragend') {
				if (a_objects.getLength() >= 2) {
					a_objects.get(0).geometry.setCoordinates(startPoint);
					a_objects.get(1).geometry.setCoordinates(endPoint);
				}
				update_object_data()
			}
			break;
		}
		$("#saveBtn").removeClass("btn-primary").addClass("btn-warning");
	});

	// обработка обратной зависимости . От изменений ВО меняется ПО
	a_objects.events.add('dragend', function (event) {
		var type   = e_objects.get(0).geometry.getType(),
			coord1 = a_objects.get(0).geometry.getCoordinates(),
			coord2 = a_objects.get(1).geometry.getCoordinates(),
			radius = ymaps.coordSystem.geo.getDistance(coord1, coord2);
		//console.log(type)
		switch (type) {
		case "Rectangle":
			e_objects.get(0).geometry.setCoordinates([coord1, coord2]);
			break;
		case 'Circle':
			e_objects.get(0).geometry.setCoordinates(coord1);
			e_objects.get(0).geometry.setRadius(radius);
			break;
		}
		event.stopPropagation();
		//return true;
	});

	v_objects.events.add('click', function (item) {
		var tgeometry,
			gtype,
			geometry,
			options,
			a,
			m,
			b = 0,
			object,
			currindex,
			currpoint;
		if (e_objects.getLength() === 0) {
			return false;
		}

		tgeometry = e_objects.get(0).geometry;
		options   = ymaps.option.presetStorage.get(normalize_style(prop.attr));
		gtype     = tgeometry.getType();
		object    = item.get('target');
		currindex = parseInt(object.properties.get('ttl'), 10);
		currpoint = object.geometry.getCoordinates();
		if (!e_objects.getLength()) {
			switch (prop.pr) {
			case 1:
				geometry = { type: "Point", coordinates: currpoint };
				object   = ymaps.Placemark(geometry, prop, options);
				break;
			case 2:
				geometry = ymaps.geometry.LineString([currpoint]);
				object   = ymaps.Polyline(geometry, prop, options);
				break;
			case 3:
				geometry = ymaps.geometry.Polygon([[currpoint]]);
				object   = ymaps.Polygon(geometry, prop, options);
				break;
			case 4:
				geometry = ymaps.geometry.Circle([parseFloat(currpoint[0]), parseFloat(currpoint[1])], parseFloat($("#cir_radius").val()));
				object   = ymaps.Circle(geometry, prop, options);
				break;
			case 5:
				geometry = ymaps.geometry.Rectangle([
					[parseFloat(currpoint[0]), parseFloat(currpoint[1])],
					[parseFloat(currpoint[2]), parseFloat(currpoint[3])]
				]);
				object = ymaps.Circle(geometry, prop, options);
				break;
			}
			e_objects.add(object);
			bas_path.push(currpoint);
			if (prop.pr === 2 || prop.pr === 3) {
				e_objects.get(0).editor.startEditing();
			}
			if (prop.pr === 4) {
				place_aux_circle_points();
			}
			if (prop.pr === 5) {
				place_aux_rct_points();
			}
		}

		// операционная геометрия
		for (a in bas_path) { // проверка массива координат по циклу:
			// если текущая координата есть в массиве и она не является крайней (чтоб зациклить можно было)
			if (bas_path.hasOwnProperty(a)) {
				if ((currpoint.join(",") === bas_path[a].join(",") && a) || gtype === 'Сircle') {
					bas_index_array.splice(a, 1); // удалить упоминание об этом индексе
					bas_path.splice(a, 1); // удалить точку с этой координатой
					b += 1;
				}
			}
		}
		if (!b) {//если по циклу координаты не нашлось
			bas_index_array.push(currindex);//добавить в конец массива координат.
			bas_path  = e_objects.get(0).geometry.getCoordinates();
			if (gtype === "LineString") {
				tgeometry.insert(tgeometry.getLength(), currpoint);
				bas_path.push(currpoint);//добавить в конец массива координат.
			}
			if (gtype === "Polygon") {
				m = tgeometry.getCoordinates()[0];
				m[m.length - 1] = currpoint;
				e_objects.get(0).geometry.setCoordinates([m]);
				perimeter_calc();
			}
			if (gtype === "Circle") {
				tgeometry.setRadius(ymaps.coordSystem.geo.getDistance(tgeometry.getCoordinates(), currpoint));
				a_objects.get(1).geometry.setCoordinates(item.get('target').geometry.getCoordinates()); // костыль ???
				field_calc();
			}
			if (gtype === "Rectangle") {
				g2.push(currpoint);
				if (g2.length === 2) {
					tgeometry.setCoordinates(g2);
					g2 = [];
				}
			}
		}
		$("#l_coord_y_array").val(bas_path.join(","));
		$("#l_coord_y_aux").val(bas_index_array.join(","));
	});

	e_objects.options.set({
		draggable: 1,
		zIndex: 1001,
		balloonContentLayout: 'generic#balloonLayout',
		balloonMaxWidth: 550,  // Максимальная ширина балуна в пикселах
		balloonMinWidth: 550,  // Максимальная ширина балуна в пикселах
		balloonMaxHeight: 400, // Максимальная ширина балуна в пикселах
		balloonMinHeight: 400 // Максимальная ширина балуна в пикселах
	});

	a_objects.options.set({
		hasHint: 1,
		hasBalloon: 0,
		draggable: 1,
		zIndex: 510,
		cursor: 'move'
	});

	v_objects.options.set({
		hasHint: 1,
		hasBalloon: 0,
		draggable: 0,
		zIndex: 520,
		cursor: 'pointer'
	});

	map.geoObjects.add(a_objects);
	map.geoObjects.add(e_objects);
	map.geoObjects.add(nePolygons);
	map.geoObjects.add(v_objects);
	place_object();
}

ymaps.ready(init);