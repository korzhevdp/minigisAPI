//######################################### процессор карты #########################################################
function init() {
	"use strict";
	//(typeof map != "undefined") ? map.destroy() : "";
	var cursor,
		map,
		//ac,
		//bg,
		maptypes = {
			1: 'yandex#map',
			2: 'yandex#satellite',
			3: 'yandex#hybrid',
			4: 'yandex#publicMap',
			5: 'yandex#publicMapHybrid'
		},
		searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		// Создаем шаблон для отображения контента балуна
		genericBalloon = ymaps.templateLayoutFactory.createClass(
			'<div class="ymaps_balloon">' +
				'<div class="well" id="l_photo" data-toggle="modal" data-target="#modal_pics" loc=$[properties.ttl|0] style="float:left;margin:3px;cursor:pointer;padding:2px;background-color:#DDDDDD;">' +
					'<img src="http://api.korzhevdp.com/images/$[properties.img|nophoto.gif]" alt="мини" id="sm_src_pic">' +
				'</div>' +
				'<b>Название:</b> $[properties.name|без имени]<br>' +
				'<b>Адрес:</b> $[properties.description|не указан]<br>' +
				'<b>Контакты:</b> $[properties.contact|контактное лицо]<br><br>' +
				'<a href="$[properties.link|ссылка]" style="margin-bottom:10px;">Подробности здесь</a>' +
				'</div>'
		),
		// ##### создаём упорядоченную коллекцию объектов #####
		a_objects = new ymaps.GeoObjectCollection(),
		b_objects = new ymaps.GeoObjectCollection();// бэкграунд

	map = new ymaps.Map("YMapsID", {
		center:    mp.center,              // Центр карты
		zoom:      mp.zoom,                // Коэффициент масштабирования
		type:      maptypes[mp.type],      // Тип карты
		behaviors: ['default']  //Поведение карты - мышеколесо и перетаскивание руками
	}, { /*autoFitToViewport: "always", restrictMapArea: true*/ });

	map.geoObjects.add(a_objects);
	map.geoObjects.add(b_objects);

	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	//назначаем опции оверлеев в коллекции (в данном случае - балун)
	a_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,// Максимальная ширина балуна в пикселах
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 520,
		zIndexHover: 600,
		cursor: 'Pointer'
	});

	b_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,// Максимальная ширина балуна в пикселах
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 10,
		zIndexHover: 10,
		cursor: 'Pointer'
	});
	// ##### настройка представления карты #####
	map.controls.add('mapTools').add(searchControl);
	// Помещаем созданный шаблон в хранилище шаблонов.
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	//Теперь наш шаблон доступен по ключу 'generic#balloonLayout'.
	// ##### события #####
	//при открытии балунов на содержащуюся в них ссылку картинку назначается поведение элемента галереи

	map.events.add('balloonopen', function () {
		$('#upl_loc').val($('#l_photo').attr('loc'));
	});

	/*
	//при закрытии балунов "карусели" отправляется событие "самый полный стоп"
	map.events.add('balloonclose', function () {
		$('.modal:has(.carousel)').on('shown', function () {
			var $carousel = $(this).find('.carousel');
			if ($carousel.data('carousel') && $carousel.data('carousel').sliding) {
				$carousel.find('.active').trigger($.support.transition.end);
			}
		});
	});
	*/

	function place_objects(source, layer) {
		var b,
			c,
			geometry,
			options,
			properties,
			object,
			src;
		for (b in source) {
			if (source.hasOwnProperty(b)) {
				c          = parseInt(b, 10);
				src        = source[b];	// alias на длинный путь в большом массиве
				options    = ymaps.option.presetStorage.get(src.attr); //назначаем опции из существующих пресетов или из созданных нами вручную
				if (src.attr.split('#')[0] === 'default') {
					options = ymaps.option.presetStorage.get([ 'twirl', src.attr.split('#')[1] ].join('#'));
				}
				properties = {		// свойства  у всех фигур одинаковые - семантика из базы данных и предвычисляемые службные поля
					attr		: src.attr,
					contact		: src.contact,
					description	: src.description,
					hintContent	: src.name,
					img			: src.img,
					link		: src.link,
					name		: src.name,
					ttl			: c
				};
				//console.log(c);
				if (src.pr === 1) { // точка
					geometry = src.coord.split(","); // создаём объект геометрии (или, если достаточно по условиям, - массив)
					object   = new ymaps.Placemark(geometry, properties, options); // генерируем оверлей
				}
				if (src.pr === 2) { //ломаная
					geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(src.coord);
					object   = new ymaps.Polyline(geometry, properties, options);
				}
				if (src.pr === 3) { // полигон
					geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(src.coord);
					object   = new ymaps.Polygon(geometry, properties, options);
				}
				if (src.pr === 4) { // круг
					geometry = new ymaps.geometry.Circle([parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])], parseFloat(src.coord.split(",")[2]));
					object   = new ymaps.Circle(geometry, properties, options);
				}
				if (src.pr === 5) { // прямоугольник
					geometry = new ymaps.geometry.Rectangle([
						[parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])],
						[parseFloat(src.coord.split(",")[2]), parseFloat(src.coord.split(",")[3])]
					]);
					object   = new ymaps.Rectangle(geometry, properties, options);
				}
				if (layer === 'a') {
					a_objects.add(object);
				}
				if (layer === 'b') {
					b_objects.add(object);
				}
			}
		}
	}

	function load_mapset(mapset) {

		function select_object(id) {
			var cr;
			a_objects.each(function (item) {
				item.options.set(ymaps.option.presetStorage.get(item.properties.get('attr')));
				item.options.set('zIndex', 800);
				if (parseInt(item.properties.get('ttl'), 10) === id) {
					switch (item.geometry.getType()) {
					case 'Point':
						item.options.set(ymaps.option.presetStorage.get('user#here'));
						map.setCenter(item.geometry.getCoordinates());
						item.balloon.open(item.geometry.getCoordinates());
						break;
					case 'LineString':
						item.options.set(ymaps.option.presetStorage.get('routes#current'));
						map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
						item.balloon.open(item.geometry.getCoordinates()[0]);
						break;
					case 'Polygon':
						item.options.set(ymaps.option.presetStorage.get('area#current'));
						map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
						item.balloon.open(item.geometry.getCoordinates()[0]);
						break;
					case 'Circle':
						item.options.set(ymaps.option.presetStorage.get('circle#current'));
						map.setCenter(item.geometry.getCoordinates());
						item.balloon.open(item.geometry.getCoordinates());
						break;
					case 'Rectangle':
						item.options.set(ymaps.option.presetStorage.get('rct#current'));
						map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
						cr = item.geometry.getCoordinates();
						item.balloon.open([ (cr[0][0] + cr[1][0]) / 2, (cr[0][1] + cr[1][1]) / 2 ]);
						break;
					}
				}
			});
		}


		function unfilter_collections(data) {
			a_objects.each(function (item) {
				item.options.set({ visible: 1 });
			});
		}


		function filter_collections(data) {
			var arr = data.split(",");
			$("#resultBody").empty();
			a_objects.each(function (item) {
				var h;
				item.options.set({ visible: 0 });
				for (h in arr) {
					if (arr.hasOwnProperty(h)) {
						if (parseInt(item.properties.get('ttl'), 10) === parseInt(arr[h], 10)) {
							item.options.set({ visible: 1 });
						}
					}
				}
			});
			$("#resultBody li").unbind().click(function () {
				console.log($(this).attr('ref'));
				select_object(parseInt($(this).attr('ref'), 10));
			});
		}

		if (mapset) {
			$.ajax({
				url: "/ajax/get_map_content",
				data: { mapset: mapset },
				type: "POST",
				dataType: "script",
				success: function () {
					place_objects(ac, 'a');
					place_objects(bg, 'b');
				},
				error: function (data, stat, err) {
					console.log([data, stat, err].join("<br>"));
				}
			});
		} else {
			if (mp.otype) {
				$.ajax({
					url: "/ajax/msearch",
					data: {
						type: parseInt(mp.otype, 10)
					},
					type: "POST",
					dataType: "script",
					success: function (data) {
						//data = eval(data);
						place_objects(data, 'a');
					},
					error: function (data, stat, err) {
						console.log([data, stat, err].join("<br>"));
					}
				});
			}
		}

		function perform_search(string) {
			$.ajax({
				url: "/ajax/search",
				data: {
					sc: string,
					mapset: mp.mapset
				},
				type: "POST",
				dataType: "text",
				success: function (data) {
					filter_collections(data);
				},
				error: function (data, stat, err) {
					console.log([data, stat, err].join("<br>"));
				}
			});
		}

		function mark_choices() {
			var d,
				string = {},
				z      = 0,
				f,
				tvalue;
			$('.itemcontainer img').attr('src', 'http://api.korzhevdp.com/images/clean_grey.png');
			for (d in switches) {
				if (switches.hasOwnProperty(d)) {
					//console.log(switches[d].fieldtype);
					switch (switches[d].fieldtype) {
					case "text":
						tvalue = ($('.itemcontainer[obj="' + d + '"] > input').val().length) ? $('.itemcontainer[obj="' + f + '"] > input').val() : 0;
						break;
					case "checkbox":
						tvalue = switches[d].value;
						if (tvalue === 1) {
							$('.itemcontainer[obj="' + d + '"] > img').attr('src', 'http://api.korzhevdp.com/images/clean.png');
						}
						break;
					case "select":
						tvalue = $('.itemcontainer[obj="' + d + '"] > select:selected').val();
						break;
					}
					//console.log(typeof tvalue);
					if (tvalue !== "0" && tvalue !== '' && tvalue !== 0) {
						string[d] = tvalue;
						z += 1;
					}
				}
			}
			if (z > 0) {
				//console.log('search' + string.toSource());
				perform_search(string);
			} else {
				unfilter_collections();
			}
		}

		$('.itemcontainer').unbind().click(function () {
			var o = parseInt($(this).attr("obj"), 10);
			if (switches[o].fieldtype === 'checkbox') {
				switches[o].value = (switches[o].value) ? 0 : 1;
			}
			if (switches[o].fieldtype === 'text') {
				switches[o].value = $(this).val(); //<-------|
			}
			if (switches[o].fieldtype === 'select') {
				switches[o].value = $(this).val(); //<-------|
			}
			mark_choices();
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

	styleAddToStorage(userstyles);
	load_mapset(mp.mapset);


	//######################################### конец процессора карты #######################################################
	//######################################################################################################################






}

ymaps.ready(init);