/* jshint -W100 */
/* jshint undef: false, unused: true */
/* globals ymaps, prop, mp, style_paths, styleAddToStorage, switch_panel, perimeter_calc */
var map,
	a_objects,
	e_objects,
	v_objects,
	saveType = 'properties',
	nePolygons;

function init() {
	'use strict';
	var maptypes        = { 1: 'yandex#map', 2: 'yandex#satellite', 3: 'google#map', 4: 'osm#map' },
		map_center      = prop.map_center,
		current         = 0,
		//current         = (typeof current !== 'undefined') ? current : prop.ttl,
		current_zoom    = (prop.current_zoom !== undefined) ? prop.current_zoom : 15,
		current_type    = (maptypes[prop.current_type] !== undefined) ? maptypes[prop.current_type] : 'yandex#satellite',
		//v_counter       = 0, // счётчик кликов на опорных объектах
		g2              = [], // заготовка переменной для геометрии фигур рисуемых по ВО
		//count           = 0,
		bas_path        = [],
		bas_index_array = [],
		lon             = map_center[0],
		lat             = map_center[1],
		searchControl   = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		//related,
		layerTypes,
		a,
		tileServerID = parseInt(Math.random() * (4-1) + 1).toString(),
		//tileServerLit= { "0": "a","1": "b","2": "c","3": "d","4": "e","5": "f" },
		cursor,
		genericBalloon = ymaps.templateLayoutFactory.createClass(
			'<h4 class="balloonHeader">$[properties.name|нет описания]&nbsp;&nbsp;&nbsp;&nbsp;<small>$[properties.description|нет описания]</small></h4>' +
				'<div id="mainPage" class="mainPage">' +
					'<div class="input-prepend">'  +
						'<span class="add-on">Название:</span>' +
						'<input type="text" id="f_name" value="$[properties.name|нет данных]" placeholder="Введите название">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Адрес:</span>' +
						'<input type="text" id="f_address" class="l_addr" value="$[properties.address|нет данных]" placeholder="Введите адрес">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Оформление:</span>' +
						'<select name="style" id="f_style" class="span11 styles"></select>' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Контакты:</span>' +
						'<input type="text" id="f_cont" value="$[properties.contact|нет данных]" placeholder="Укажите контактных лиц / телефоны" class="span11">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Опубликован</span>' +
						'<input type="checkbox" id="f_act" class="l_act" style="vertical-align:middle" value="on">' +
					'</div>' +
				'</div>' +
				'<div id="propPage" class="propPage">тест</div>' +
				'<hr style="margin:3px;">' +
				'<div class="input-prepend pageButtons">' +
					'<label class="add-on" title="Кнопки прехода к страницам свойств">Страницы</label>' +
					'$[properties.pagelist|нет данных]' +
				'</div>' +
				'<!--<button type="button" class="btn btn-primary btn-mini pull-right" id="XD47">XD47</button>-->' +
				'<button type="button" class="btn btn-primary btn-mini" id="updDataBtn">Применить</button>' +
				'<button type="reset" class="btn btn-mini" id="closeBalloonBtn">Отмена</button>'
		);

	
	map = new ymaps.Map("YMapsID", {
		center:    [lon, lat],		// Центр карты
		zoom:      current_zoom,	// Коэффициент масштабирования
		type:      current_type,	// Тип карты
		behaviors: ["default", "scrollZoom"]
	}, {
		projection: ymaps.projection.sphericalMercator
		/*autoFitToViewport: "always",
		restrictMapArea: true*/
	});
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);
	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	map.setType("google#map");

	add_collections();
	setup_editor_collection();
	setup_aux_collection();
	set_map_events();
	set_layers();
	styleAddToStorage(userstyles);
	place_object();
	///////////////////////////////////////////////// MOVE
	composeStyleDropdowns(prop.pr, prop.attr);
	listen_page_caller();
	//######################################### выносные функций, чтобы не загромождать код базовых функций
}

function add_collections() {
	a_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (точки управления фигурами - прямоугольник, круг)
	e_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (редактируемые объекты)
	v_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (опорные точки и объекты)
	nePolygons      = new ymaps.GeoObjectArray();  // Вспомогательная коллекция 4
	map.geoObjects.add(a_objects);
	map.geoObjects.add(e_objects);
	map.geoObjects.add(nePolygons);
	map.geoObjects.add(v_objects);
}

function setup_editor_collection() {
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
				update_object_data();
			}
			break;
		}
		$("#saveBtn").removeClass("btn-primary").addClass("btn-warning");
	});
	e_objects.options.set({
		draggable: 1,
		zIndex: 1001,
		hasBalloon: 0,
		balloonContentLayout: 'generic#balloonLayout',
		balloonMaxWidth: 550,  // Максимальная ширина балуна в пикселах
		balloonMinWidth: 550,  // Максимальная ширина балуна в пикселах
		balloonMaxHeight: 400, // Максимальная ширина балуна в пикселах
		balloonMinHeight: 400 // Максимальная ширина балуна в пикселах
	});
}

function setup_aux_collection() {
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
	a_objects.options.set({
		hasHint: 1,
		hasBalloon: 0,
		draggable: 1,
		zIndex: 510,
		cursor: 'move'
	});
}

function setup_virtual_collection() {
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





	v_objects.options.set({
		hasHint: 1,
		hasBalloon: 0,
		draggable: 0,
		zIndex: 520,
		cursor: 'pointer'
	});
}

//# собственно код
$(".panels").addClass('hide');
$("#cpanel" + prop.pr).removeClass('hide');
$('.modal').modal({ show: 0 });


prop.attr = normalize_style(prop.attr);
$("#toGoogle").addClass("active");
$("#toYandex").removeClass("active");

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

function place_object() {
	var geometry,
		options = ymaps.option.presetStorage.get(normalize_style(prop.attr)),
		object;
	if (prop === undefined) { // JSLint ругается, требует сравнивать напрямую
		console.log('Отсутствует блок данных редактируемого объекта');
		return false;
	}
	if (prop.coords === '0') { // JSLint ругается, требует сравнивать напрямую
		return false;
	}
	console.log(1);
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
	}
	return true;
}

function set_layers() {
	layerTypes = {
		1: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://mt" + tileServerID + ".google.com/vt/lyrs=m&hl=" + mp.lang + "&x=" + tile[0] + "&y=" + tile[1] + "&z=" + zoom + "&s=Galileo";}, {tileTransparent: 1, zIndex:1000});},
			folder: "",
			label : "google#map",
			name  : "Гуглотест",
			layers: ["google#map"]
		}
	};

	for (a in layerTypes) {
		if (layerTypes.hasOwnProperty(a)) {
			ymaps.layer.storage.add(layerTypes[a].label, layerTypes[a].func);
			ymaps.mapType.storage.add(layerTypes[a].label, new ymaps.MapType(
				layerTypes[a].name, layerTypes[a].layers
			));
			//typeSelector.addMapType(layerTypes[a].label, a);
		}
	}
}

function place_objects(source) {
	var geometry,
		a,
		coords,
		pr,
		//attr,
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

				//alert(source[a].attributes + ' ' + normalize_style(source[a].attributes));
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

function set_map_events() {
	map.events.add('click', function (click) {
		if (!e_objects.getLength()) {
			draw_object_by_type(click);
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
		style = ["twirl", style.split("#")[1]].join("#");
		if (ymaps.option.presetStorage.get(style) === undefined) {
			console.log("Стиль оформления отсутствует в хранилище. Применены умолчания.");
			style = defaults[prop.pr];
		}
	}
	// String
	return style;
}

function init() {
	'use strict';
	var maptypes        = { 1: 'yandex#map', 2: 'yandex#satellite', 3: 'google#map', 4: 'osm#map' },
		map_center      = prop.map_center,
		current         = 0,
		//current         = (typeof current !== 'undefined') ? current : prop.ttl,
		current_zoom    = (prop.current_zoom !== undefined) ? prop.current_zoom : 15,
		current_type    = (maptypes[prop.current_type] !== undefined) ? maptypes[prop.current_type] : 'yandex#satellite',
		//v_counter       = 0, // счётчик кликов на опорных объектах
		g2              = [], // заготовка переменной для геометрии фигур рисуемых по ВО
		//count           = 0,
		bas_path        = [],
		bas_index_array = [],
		lon             = map_center[0],
		lat             = map_center[1],
		searchControl   = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		//related,
		layerTypes,
		a,
		tileServerID = parseInt(Math.random() * (4-1) + 1).toString(),
		//tileServerLit= { "0": "a","1": "b","2": "c","3": "d","4": "e","5": "f" },
		cursor,
		genericBalloon = ymaps.templateLayoutFactory.createClass(
			'<h4 class="balloonHeader">$[properties.name|нет описания]&nbsp;&nbsp;&nbsp;&nbsp;<small>$[properties.description|нет описания]</small></h4>' +
				'<div id="mainPage" class="mainPage">' +
					'<div class="input-prepend">'  +
						'<span class="add-on">Название:</span>' +
						'<input type="text" id="f_name" value="$[properties.name|нет данных]" placeholder="Введите название">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Адрес:</span>' +
						'<input type="text" id="f_address" class="l_addr" value="$[properties.address|нет данных]" placeholder="Введите адрес">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Оформление:</span>' +
						'<select name="style" id="f_style" class="span11 styles"></select>' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Контакты:</span>' +
						'<input type="text" id="f_cont" value="$[properties.contact|нет данных]" placeholder="Укажите контактных лиц / телефоны" class="span11">' +
					'</div><br>' +
					'<div class="input-prepend">' +
						'<span class="add-on">Опубликован</span>' +
						'<input type="checkbox" id="f_act" class="l_act" style="vertical-align:middle" value="on">' +
					'</div>' +
				'</div>' +
				'<div id="propPage" class="propPage">тест</div>' +
				'<hr style="margin:3px;">' +
				'<div class="input-prepend pageButtons">' +
					'<label class="add-on" title="Кнопки прехода к страницам свойств">Страницы</label>' +
					'$[properties.pagelist|нет данных]' +
				'</div>' +
				'<!--<button type="button" class="btn btn-primary btn-mini pull-right" id="XD47">XD47</button>-->' +
				'<button type="button" class="btn btn-primary btn-mini" id="updDataBtn">Применить</button>' +
				'<button type="reset" class="btn btn-mini" id="closeBalloonBtn">Отмена</button>'
		);
	a_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (точки управления фигурами - прямоугольник, круг)
	e_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (редактируемые объекты)
	v_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (опорные точки и объекты)
	nePolygons      = new ymaps.GeoObjectArray();  // Вспомогательная коллекция 4
	
	map = new ymaps.Map("YMapsID", {
		center:    [lon, lat],		// Центр карты
		zoom:      current_zoom,	// Коэффициент масштабирования
		type:      current_type,	// Тип карты
		behaviors: ["default", "scrollZoom"]
	}, {
		projection: ymaps.projection.sphericalMercator
		/*autoFitToViewport: "always",
		restrictMapArea: true*/
	});
	
	map.geoObjects.add(a_objects);
	map.geoObjects.add(e_objects);
	map.geoObjects.add(nePolygons);
	map.geoObjects.add(v_objects);
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);
	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');
	set_map_events();
	//######################################### выносные функций, чтобы не загромождать код базовых функций
}
ymaps.ready(init);