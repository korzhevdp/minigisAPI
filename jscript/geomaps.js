function init() {
	var map,
		prop = { current_zoom: 15, current_type: 1, map_center: '40.51748,64.537797' },
		current_zoom = (prop.current_zoom.length) ? prop.current_zoom : 15,
		maptypes = {1: 'yandex#map', 2: 'yandex#satellite', 3: 'yandex#hybrid', 4: 'yandex#publicMap', 5: 'yandex#publicMapHybrid', 6: "my#arch"},
		current_type = (typeof maptypes[prop.current_type] != 'undefined') ? maptypes[prop.current_type] : 'yandex#satellite',
		map_center = prop.map_center,
		current = (typeof current != 'undefined') ? current : prop.ttl,
		v_counter = 0, // счётчик кликов на опорных объектах
		g2 = [], // заготовка переменной для геометрии фигур рисуемых по ВО
		count = 0,
		bas_path = [],
		bas_index_array = [],
		lon = map_center.split(",")[0],
		lat = map_center.split(",")[1],
		e_objects = new ymaps.GeoObjectArray(), // Вспомогательная коллекция (редактируемые объекты)
		v_objects = new ymaps.GeoObjectArray(), // Вспомогательная коллекция (редактируемые объекты)
		searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		genericBalloon = ymaps.templateLayoutFactory.createClass( 	// Создаем шаблон для отображения контента балуна
		'<h4 style="margin-bottom:10px;">$[properties.name|нет описания]  <small>$[properties.description|нет описания]</small></h4>' +
		'<div id="mainPage" style="height:400px;display:block;"></div>');

	if(typeof map != 'undefined'){map.destroy();}
	styleAddToStorage(userstyles);

	// Помещаем созданный шаблон в хранилище шаблонов.
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	// Теперь наш шаблон доступен по ключу 'generic#balloonLayout'.

	map = new ymaps.Map("YMapsID", {
		center: [lon,lat],// Центр карты
		zoom: current_zoom,// Коэффициент масштабирования
		type: current_type,// Тип карты
		behaviors: ["scrollZoom","drag"]
	});

	map.events.add('contextmenu', function (rclick){
		request_geocode_toMapPoint(rclick.get('coordPosition'));
	});
/*
	map.events.add('balloonopen', function (){
		init_balloon_controls();
	});
*/
	// ##### настройка представления карты #####
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);

	//place_objects(objects);//натравим функцию на полученный массив схожих объектов
	map.geoObjects.add(e_objects);
	map.geoObjects.add(v_objects); // добавление на карту коллекции опорных точек

	// ##### настройка событий #####

//######################################### выносные функций, чтобы не загромождать код базовых функций

	function styleAddToStorage(src){
		for (var a in src){
			ymaps.option.presetStorage.add(a,src[a]);
		}
	}

	function place_objects(source){
		for (var a in source){
			var blob = source[a],
				coords = blob.coords,
				pr = parseInt(blob.pr),
				attr = blob.attributes,			// атрибуты - стиль объекта на карте
				properties = {					// свойства  у всех фигур одинаковые - семантика из базы данных и предвычисляемые службные поля
					hasBalloon: 0,				// балун нет
					name: blob.loc_name,
					hintContent: blob.description, // текст подсказки
					description: blob.description, // поле "описание"
					ttl: blob.ttl // индекс объекта в базе - для справки на будущее
				};

			if(coords.length > 3){
				if(pr == 1){ // точка
					//alert(attr);
					var geometry = geometry = { type: 'Point', coordinates: coords.split(",") }, // создаём объект геометрии (или, если достаточно по условиям, - массив)
						options = ymaps.option.presetStorage.get(attr), //назначаем опции из существующих пресетов или из созданных нами вручную
						object = new ymaps.Placemark(geometry, properties, options); // генерируем оверлей
					v_objects.add(object);
				}

				if(pr == 2){ //ломаная
					var geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(coords),
						options = ymaps.option.presetStorage.get(attr),
						object = new ymaps.Polyline(geometry, properties, options);
					v_objects.add(object);
				}

				if(pr == 3){ // полигон
					var geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(coords),
						options = ymaps.option.presetStorage.get(attr),
						object = new ymaps.Polygon(geometry, properties, options);
					v_objects.add(object);
				}

				if(pr == 4){ // круг
					var geometry = new ymaps.geometry.Circle([parseFloat(coords.split(",")[0]), parseFloat(coords.split(",")[1])], parseFloat(coords.split(",")[2])),
						options = ymaps.option.presetStorage.get(attr),
						object = new ymaps.Circle(geometry, properties, options);
					v_objects.add(object);
				}

				if(pr == 5){ // прямоугольник
					var geometry = new ymaps.geometry.Rectangle([
						[parseFloat(coords.split(",")[0]), parseFloat(coords.split(",")[1])],
						[parseFloat(coords.split(",")[2]), parseFloat(coords.split(",")[3])]
					]),
						options = ymaps.option.presetStorage.get(attr),
						object = new ymaps.Rectangle(geometry, properties, options);
					v_objects.add(object);
				}
			}
		}
	}

	function place_aux_rct_points(){
		var aux_geometry1 = e_objects.get(0).geometry.getCoordinates()[0],
			aux_geometry2 = e_objects.get(0).geometry.getCoordinates()[1],
			aux_options1 = ymaps.option.presetStorage.get("system#arrowldn"),
			aux_options2 = ymaps.option.presetStorage.get("system#arrowrup");
		a_objects.add(new ymaps.Placemark(aux_geometry1, prop, aux_options1));
		a_objects.add(new ymaps.Placemark(aux_geometry2, prop, aux_options2));
	}

	function place_aux_circle_points(){
		var startPoint = e_objects.get(0).geometry.getCoordinates(),
			direction = [1, 0],
			endPoint = ymaps.coordSystem.geo.solveDirectProblem(startPoint, direction, e_objects.get(0).geometry.getRadius()).endPoint,
			aux_geometry1 = {type: "Point", coordinates: startPoint},
			aux_geometry2 = {type: "Point", coordinates: endPoint},
			aux_options1 = ymaps.option.presetStorage.get("system#arrowcen"),
			aux_options2 = ymaps.option.presetStorage.get("system#arrowrad");
		a_objects.add(new ymaps.Placemark(aux_geometry1, { hintContent: 'Центр' }, aux_options1));
		a_objects.add(new ymaps.Placemark(aux_geometry2, { hintContent: 'Точка на окружности' }, aux_options2));
	}

	function draw_object_by_type(click){
		var properties = { hasBalloon: 1, hasHint: 1, hintContent: prop.description, iconContent: prop.description },
			otype = prop.pr,
			options = {};
		if(!e_objects.getLength()){
			switch (otype){
				case 1 :
					var geometry = { type: 'Point', coordinates: click.get('coordPosition') },
						options = { draggable: 1},
						object = new ymaps.Placemark(geometry, properties, options);
					e_objects.add(object);
				break;
				case 2 :
					var geometry = new ymaps.geometry.LineString([click.get('coordPosition')]),
						options = ymaps.option.presetStorage.get('routes#default'),
						object = new ymaps.Polyline(geometry, prop, options);
					prop.attr = 'routes#default';
					e_objects.add(object);
					e_objects.get(0).editor.startDrawing();
				break;
				case 3 :
					var geometry = {type: 'Polygon',coordinates: [[click.get('coordPosition')]]},
						options = ymaps.option.presetStorage.get('area#default'),
						object = new ymaps.Polygon(geometry, prop, options);
					prop.attr = 'area#default';
					e_objects.add(object);
					e_objects.get(0).editor.startDrawing();
				break;
				case 4 :
					var geometry = [click.get('coordPosition'), parseFloat($("#cir_radius").val())],
						options = ymaps.option.presetStorage.get('circle#default'),
						object = new ymaps.Circle(geometry, prop, options);
					prop.attr = 'circle#default';
					e_objects.add(object);
					place_aux_circle_points();
				break;
				case 5 :
					var basic_coords = click.get('coordPosition');
						geometry = [[basic_coords[0] - .01,basic_coords[1] - .01],[basic_coords[0] + .01,basic_coords[1] + .01]],
						options = ymaps.option.presetStorage.get('rct#default'),
						object = new ymaps.Rectangle(geometry, prop, options);
					prop.attr = 'rct#default';
					e_objects.add(object);
					place_aux_rct_points();
				break;
			}
		}
	}

	function convert_to_vertexes(){
		var k = [],
			i = 1;
		v_objects.each(function(item){
			var gtype = item.geometry.getType().toLowerCase();
			if (gtype == 'linestring' || gtype == 'polygon') {
				array = item.geometry.getCoordinates();
				for (var a in array){
					for (var b in array[a]){
						k[i] = { description: item.properties.get('description') + " вершина " + i, coords: array[a][b].join(","), pr: 1, attributes: 'system#blueflag' };
						i++;
					}
				}
			}
		});
		place_objects(k);
	}
	// geocoder Section
	function request_geocode_toMapPoint(coords){ // запрос геокодеру по координатам точечного объекта. (массив из объекта геометрии)
		ymaps.geocode(coords, { kind: ['house']}).then(function (result){
			var names = [],
				address;
			result.geoObjects.each(function (object){
				names.push(object.properties.get('name'));
			});
			address = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса";
			map.balloon.open(coords, {
				contentBody: '<div class="ymaps_balloon"><input type="text" value="' + [ parseFloat(coords[0]).toFixed(6), parseFloat(coords[1]).toFixed(6) ].join(', ') + '"><br>' + address + '</div>'
			});
		});
	}

	function request_geocode_toPointObject(coords){ // запрос геокодеру по координатам точечного объекта. (массив из объекта геометрии)
		ymaps.geocode(coords, { kind: ['house']}).then(function (result){
			var names = [],
				address;
			result.geoObjects.each(function (object){
				names.push(object.properties.get('name'));
			});
			address = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса";
			$("#address").val(address);
			e_objects.each( function(item){
				item.properties.set({
					address: address,
					hintContent: [item.properties.get('description'), address].join(" - ")
				});
			});
		});
	}

	// User Interface Section
	function makeSelect(src, id, name){
		for (var a in src){
			$('#f_style').append('<option value="' + src[a][id] + '">' + src[a][name] + '</option>');
		}
		val = e_objects.get(0).properties.get('attr');
		$('#f_style [value="' +  val + '"]').attr('selected', 'selected');
	}

	function update_object_data(){ // универсальный обновитель данных - сaмостоятельно берёт данные от редактируемого объекта
		var type = e_objects.get(0).geometry.getType().toLowerCase();
		switch (type){
			case "point" :
				update_point_data();
				($("#traceAddress").attr("checked")) ? request_geocode_toPointObject(object.geometry.getCoordinates()) : "";
			break;
			case "linestring" :
				update_line_data();
			break;
			case "polygon" :
				update_polygon_data();
				perimeter_calc();
			break;
			case "circle" :
				update_circle_data();
				field_calc();
			break;
			case "rectangle" :
				update_rectangle_data();
			break;
		}
	}

	function update_point_data(){ // передаётся объект целиком
		var src = e_objects.get(0).geometry.getCoordinates(),
			lon = parseFloat(src[0]).toFixed(4),
			lat = parseFloat(src[1]).toFixed(4);
		$("#m_lat").val(lat);
		$("#m_lon").val(lon);
		e_objects.get(0).properties.set( { coords: src.join(","), coordarray: src.join(",") } );
	}

	function update_line_data(){ // передаётся объект целиком
		var src = e_objects.get(0).geometry,
			coords = ymaps.geometry.LineString.toEncodedCoordinates(src);
		e_objects.get(0).properties.set( {coords: coords} );
		length_calc(src);
	}

	function update_polygon_data(){ // передаётся объект целиком
		var src = e_objects.get(0).geometry,
			coords = ymaps.geometry.Polygon.toEncodedCoordinates(src),
			coordarray = src.getCoordinates();
		e_objects.get(0).properties.set( {coords: coords, coordarray: coordarray} );
		perimeter_calc(src);
	}

	function update_circle_data(){ // передаётся объект целиком
		var src = e_objects.get(0).geometry,
			center = src.getCoordinates(),
			radius = src.getRadius();
		$("#cir_lon").val(center[0].toFixed(4));
		$("#cir_lat").val(center[1].toFixed(4));
		$("#cir_radius").val(radius.toFixed(2));
		e_objects.get(0).properties.set( {coords: center.join(",") + ', ' + radius} );
		field_calc(src);
	}

	function update_rectangle_data(){ // передаётся объект целиком (а и нечего передавать)
	}

	function update_form_data(){
		e_objects.get(0).properties.set({
			address: $("#f_address").val(),
			attr: $("#f_style").val(),
			name: $("#f_name").val(),
			contact: $("#f_cont").val(),
			description: $("#f_name").val() + ' ' + $("#f_address").val()
		});
	}

	// Nodal 2.0 Section
	function length_calc(){ // imho deprecated передаётся объект геометрии от источника - object.geometry
		src = e_objects.get(0).geometry.getCoordinates();
		if(src.length < 2){
			$(".f_len").html(0);
		}
		var routelength = 0,
			next = 0,
			start = [],
			end = [],
			delta = 0;
		for (var i=0; i < (src.length - 1);i++){
			next = (i + 1);
			start = [ src[i][0],src[i][1] ];
			end = [ src[next][0],src[next][1] ];
			delta = ymaps.coordSystem.geo.getDistance(start, end);
			routelength += delta;
		}
		routelength = (isNaN(routelength)) ? 0 : routelength.toFixed(2);
		$(".f_len").html(routelength);
		$(".f_vtx").html(e_objects.get(0).geometry.getLength());
	}

	function field_calc(){ //передаётся объект геометрии от источника - object.geometry
		var rads = e_objects.get(0).geometry.getRadius(),
			length = Math.PI * 2 * rads,
			field = Math.PI * rads * rads;
			//alert(rads);
		$("#cir_raduis").html(rads);
		$("#cir_len").html(length.toFixed(3));
		$("#cir_field").html(field.toFixed(3));
		$("#cir_raduis").html(rads);
	}

	function perimeter_calc(){ //передаётся объект геометрии от источника - object.geometry
		var src = e_objects.get(0).geometry.getCoordinates(),
			routelength = 0,
			next = 0,
			start = [],
			end = [],
			delta = 0,
			vtx_count = 0;
		if(src[0].length < 2){
			return "0";
		}
		for(var j = 0; j < src.length; j++){
			vtx_count += src[j].length;
			for (var i=0; i < (src[j].length - 1);i++){
				next = (i + 1);
				start = src[j][i];
				end = src[j][next];
				delta = ymaps.coordSystem.geo.getDistance(start, end);
				routelength += delta;
			}
		}
		routelength = (isNaN(routelength)) ? 0 : routelength;
		$(".f_len").html(routelength.toFixed(2));
		$(".f_vtx").html(vtx_count - 1);
		return true;
	}

	// События пользовательского интерфейса и ввода данных
	$("#cir_setter").click(function(){
		if(!e_objects.getLength()){
			var geometry = new ymaps.geometry.Circle([parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val())], parseFloat($("#cir_radius").val())),
				options = ymaps.option.presetStorage.get(prop.attr),
				object = new ymaps.Circle(geometry, prop, options);
			e_objects.add(object);
		}
		var center = [parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val())],
		radius = parseFloat($("#cir_radius").val());
		e_objects.get(0).geometry.setCoordinates(center);
		e_objects.get(0).geometry.setRadius(radius);
	});

	$("#type").change(function(){
		var ref = parseInt($("#type option:selected").attr('ref')),
			text = $("#type option:selected").html(),
			app = $("#type option:selected").attr('apply'),
			obj_type = $("#type option:selected").val();
		if(ref != prop.pr){
			if(confirm("Такая смена типа объекта при сохранении приведёт к потере координат и необходимости нарисовать объект заново.\nВы желаете продолжить?")){
				// изменяем параметры входного объекта
				prop.pr = ref; //обновляе тип представления
				prop.coords = []; //обнуляем координаты
				prop.otype = obj_type; //обновляем тип конечного объекта
				prop.description = text; //обновляем описание объекта
				e_objects.removeAll(); //очищаем коллекцию РО
				a_objects.removeAll(); //очищаем коллекцию ВО
				map.events.add('click', function (click){ // добавляем событие рисования объекта
					draw_object_by_type(click); // рисование типа геообъекта
				});
				$(".panels").addClass('hide'); // включаем правильную панель редактирования
				$("#cpanel" + prop.pr).removeClass('hide');
			}else{
				$('#type [value="' + prop.otype + '"]').attr("selected","selected");
			}
		}else{
			e_objects.get(0).options.set(ymaps.option.presetStorage.get(app));
			prop.attr = $("#type option:selected").attr('apply');
		}
	});

	$("#saveBtn").click(function(){
		//alert(e_objects.get(0).properties.getAll().toSource());
		var p_src = e_objects.get(0).properties,
			g_src = e_objects.get(0).geometry,
			pr = g_src.getType().toLowerCase(),
			coord;
		switch (pr){
			case 'point' :
				coord = g_src.getCoordinates().join(",");
			break;
			case 'linestring' :
				coord = ymaps.geometry.LineString.toEncodedCoordinates(g_src);
			break;
			case 'polygon' :
				coord = ymaps.geometry.Polygon.toEncodedCoordinates(g_src);
			break;
			case 'circle' :
				coord = [g_src.getCoordinates().join(","), g_src.getRadius()].join(",");
			break;
			case 'rectangle' :
				coord = g_src.getCoordinates().join(",");
			break;
		}
		$("#l_id").val(p_src.get('ttl'));
		$("#l_name").val(p_src.get('name'));
		$("#l_type").val(p_src.get('otype'));
		$("#l_address").val(p_src.get('address'));
		$("#l_contact").val(p_src.get('contact'));
		$("#l_active").val(p_src.get('active'));
		$("#l_coord_y").val(coord);
		$("#l_coord_y_aux").val(coord);
		$("#l_style").val(p_src.get('attr'));
		$("#target_form").submit();
	});

	$("#setCenter").click(function(){
		map.setCenter([ parseFloat($("#m_lon").val()), parseFloat($("#m_lat").val())]);
	});

	$("#moveTo").click(function(){
		e_objects.each(function(item){
			item.geometry.setCoordinates([ parseFloat($("#m_lon").val()), parseFloat($("#m_lat").val())]);
		})
	});

	$("#pointsLoad").click(function(){
		$("#loadPoints").modal('show');
	});

	$("#pointsClear").click(function(){
		v_objects.removeAll();
	});

	$("#loadSelectedObjects").click(function(){
		$("#loadPoints").modal('hide');
		var arr = [];
		$(".typechecker:checked").each(function(){
			arr.push($(this).val());
		});
		$.ajax({
			url: "/ajaxutils/get_objects_by_type/" + arr.join(","),
			type: "POST",
			dataType: 'script',
			success: function(data){
				data = eval(data);
				place_objects(data);
				convert_to_vertexes();
			},
			error: function(data,stat,err){
				alert([data,stat,err].join("\n"));
			}
		});
	});

	$("#toVertex").click(function(){ // конверсия вершин полигонов в опорные точки с сохранением исходных полигонов на карте
		convert_to_vertexes();
	});

	$("#toGeometry").click(function(){ // конверсия опорных точек в ломаные и полигоны
		convert_to_geometry();
	});

	$("#bas_points").change(function(){ // запрос с сервера опорных точек для ломаных и полигонов
		bas_points_request($(this));
	});

//######################################### конец выносных функций
	// ##### конец настройки событий #####
}

ymaps.ready(init);