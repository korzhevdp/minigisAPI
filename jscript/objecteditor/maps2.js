/* jshint -W100 */
/* jshint undef: false, unused: true */
/* globals ymaps, prop, mp, switch_panel, perimeter_calc, update_object_data, bas_path, bas_index_array, field_calc */
'use strict';
var map,
	a_objects,
	e_objects,
	v_objects,
	g2,
	bas_path        = [],
	bas_index_array = [],
	saveType = 'properties',
	nePolygons;

function add_collections() {
	a_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (точки управления фигурами - прямоугольник, круг)
	e_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (редактируемые объекты)
	v_objects       = new ymaps.GeoObjectArray();  // Вспомогательная коллекция (опорные точки и объекты)
	nePolygons      = new ymaps.GeoObjectArray();  // Вспомогательная коллекция 4
	map.geoObjects.add(a_objects);
	map.geoObjects.add(e_objects);
	map.geoObjects.add(v_objects);
	map.geoObjects.add(nePolygons);
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
		set_changed();
	});
	e_objects.options.set({
		draggable: 1,
		zIndex: 1001,
		hasBalloon: 0,
		balloonContentLayout: 'generic#balloonLayout',
		balloonMaxWidth: 550,  // Максимальная ширина балуна в пикселах
		balloonMinWidth: 550,  // Максимальная ширина балуна в пикселах
		balloonMaxHeight: 400, // Максимальная ширина балуна в пикселах
		balloonMinHeight: 400  // Максимальная ширина балуна в пикселах
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

function getGeometry(type, coords) {
	var geometries = {
		1: function () { return new ymaps.geometry.Point(coords); },
		2: function () { return new ymaps.geometry.LineString.fromEncodedCoordinates(coords); },
		3: function () { return new ymaps.geometry.Polygon.fromEncodedCoordinates(coords); },
		4: function () { return new ymaps.geometry.Circle([parseFloat(coords[0]), parseFloat(coords[1])], parseFloat(coords[2])); },
		5: function () { return new ymaps.geometry.Rectangle([ [parseFloat(coords[0]), parseFloat(coords[1])], [parseFloat(coords[2]), parseFloat(coords[3])] ]); }
	};
	return geometries[type]();
}

function getNewGeometry(type, coord) {
	var basic_coords = coord,
		geometries = {
			1: function () { return new ymaps.geometry.Point(coord); },
			2: function () { return new ymaps.geometry.LineString([coord]); },
			3: function () { return new ymaps.geometry.Polygon([[coord]]); },
			4: function () { return new ymaps.geometry.Circle([coord, parseFloat($("#cir_radius").val()) ] ); },
			5: function () { return new ymaps.geometry.Rectangle([ [basic_coords[0] - 0.01, basic_coords[1] - 0.01], [basic_coords[0] + 0.01, basic_coords[1] + 0.01] ]); }
		};
	return geometries[type]();
}

function getObject(geometry, prop, options) {
	var objects = {
		1: function () { return new ymaps.Placemark(geometry, prop, options); },
		2: function () { return new ymaps.Polyline(geometry,  prop, options); },
		3: function () { return new ymaps.Polygon(geometry,   prop, options); },
		4: function () { return new ymaps.Circle(geometry,    prop, options); },
		5: function () { return new ymaps.Rectangle(geometry, prop, options); }
	};
	return objects[prop.pr]();
}

function place_object() {
	var geometry,
		options = ymaps.option.presetStorage.get(normalize_style(prop.attr)),
		object;
	if (prop === undefined) {
		console.log('Отсутствует блок данных редактируемого объекта');
		return false;
	}
	if (prop.coords === '0') {
		return false;
	}
	switch_panel();
	geometry = getGeometry(prop.pr, prop.coords);
	object   = getObject(geometry, prop, options);
	e_objects.add(object);
	make_environment(object);
}

function make_environment(object) {
	if (prop.pr === 1) {
		map.setCenter(object.geometry.getCoordinates());
		update_point_data(object);
	} else {
		map.setBounds(object.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: 20});
	}
	if (prop.pr === 3 || prop.pr === 2) {
		object.editor.startEditing();
		perimeter_calc(object.geometry);
	}
	if (prop.pr === 4) {
		place_aux_circle_points();
	}
	if (prop.pr === 5) {
		place_aux_rct_points();
	}
}

function set_layers() {
	var a,
		tileServerID  = parseInt((Math.random() * (4 - 1) + 1), 10).toString(),
		tileServerLit = { "0": "a", "1": "b", "2": "c", "3": "d", "4": "e", "5": "f" },
		layerTypes    = {
			'google#map' : {
				func   : function () { return new ymaps.Layer(function (tile, zoom) {return "http://mt" + tileServerID + ".google.com/vt/lyrs=m&hl=" + mp.lang + "&x=" + tile[0] + "&y=" + tile[1] + "&z=" + zoom + "&s=Galileo"; }, { tileTransparent : 1, zIndex : 1000 }); },
				folder : "",
				label  : "google#map",
				name   : "Гуглотест",
				layers : ["google#map"]
			}
		};
	for (a in layerTypes) {
		if (layerTypes.hasOwnProperty(a)) {
			ymaps.layer.storage.add(a, layerTypes[a].func);
			ymaps.mapType.storage.add(a, new ymaps.MapType(layerTypes[a].name, layerTypes[a].layers));
		}
	}
}

function place_objects(source) {
	var geometry,
		a,
		coords,
		pr,
		options,
		properties,
		object;
	for (a in source) {
		if (source.hasOwnProperty(a)) {
			coords     = source[a].coords;
			pr         = parseInt(source[a].pr, 10);
			properties = {
				name        : source[a].description,
				hintContent : source[a].description,
				description : source[a].description,
				ttl         : a
			};
			geometry = getGeometry(pr, coords);
			options  = ymaps.option.presetStorage.get(normalize_style(source[a].attributes));
			object   = getObject(geometry, prop, options);
			v_objects.add(object);
		}
	}
}

function draw_object_by_type(click) {
	var options  = ymaps.option.presetStorage.get(normalize_style(prop.attr)),
		geometry = getNewGeometry(prop.pr, click.get('coordPosition')),
		object   = getObject(geometry, prop, options);
	e_objects.add(object);
	update_object_data();
	make_environment(object);
	set_changed();
}

function set_map_events() {
	map.events.add('click', function (click) {
		if (!e_objects.getLength()) {
			draw_object_by_type(click);
		}
	});
	map.events.add('contextmenu', function (e) {
		request_geocode_toMapPoint(e.get('coordPosition'));
	});
}

function normalize_style(style) {
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
	return style;
}

function init() {
	var maptypes        = { 3: 'yandex#map', 2: 'yandex#satellite', 1: 'google#map', 4: 'osm#map' },
		map_center      = prop.map_center,
		current         = 0,
		//current         = (typeof current !== 'undefined') ? current : prop.ttl,
		current_zoom    = (prop.current_zoom !== undefined) ? prop.current_zoom : 15,
		current_type    = (maptypes[prop.current_type] !== undefined) ? maptypes[prop.current_type] : 'yandex#map',
		//v_counter       = 0, // счётчик кликов на опорных объектах
		//count           = 0,
		lon             = map_center[0],
		lat             = map_center[1],
		searchControl   = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
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
	set_layers();
	map = new ymaps.Map("YMapsID", {
		center:    [lon, lat],		// Центр карты
		zoom:      current_zoom,	// Коэффициент масштабирования
		type:      current_type,	// Тип карты
		behaviors: ["default", "scrollZoom"]
	}, { projection: ymaps.projection.sphericalMercator });
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);
	add_collections();
	setup_editor_collection();
	setup_virtual_collection();
	setup_aux_collection();

	prop.attr = normalize_style(prop.attr);
	cursor    = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');
	set_map_events();
	styleAddToStorage(userstyles);
	place_object();
	//######################################### выносные функций, чтобы не загромождать код базовых функций
}

ymaps.ready(init);
