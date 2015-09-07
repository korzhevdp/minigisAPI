function init() {
	"use strict";
	var cursor,
		map,
		maptypes = {
			1: 'yandex#map',
			2: 'yandex#satellite',
			3: 'yandex#hybrid',
			4: 'yandex#publicMap',
			5: 'yandex#publicMapHybrid'
		},
		typeicons = {
			1: 'http://api.korzhevdp.com/images/marker.png',
			2: 'http://api.korzhevdp.com/images/layer-shape-polyline.png',
			3: 'http://api.korzhevdp.com/images/layer-shape-polygon.png',
			4: 'http://api.korzhevdp.com/images/layer-shape-ellipse.png',
			5: 'http://api.korzhevdp.com/images/layer-select.png'
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
		a_objects = new ymaps.GeoObjectCollection(),
		b_objects = new ymaps.GeoObjectCollection();

	map = new ymaps.Map("YMapsID", {
		center:    mp.center,
		zoom:      mp.zoom,
		type:      maptypes[mp.type],
		behaviors: ['default']
	}, { /*autoFitToViewport: "always", restrictMapArea: true*/ });

	map.geoObjects.add(a_objects);
	map.geoObjects.add(b_objects);

	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	//назначаем опции оверлеев в коллекции (в данном случае - балун)
	a_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,// Максимальная ширина балуна в пикселах
		balloonMinWidth: 400,
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 520,
		zIndexHover: 600,
		cursor: 'Pointer'
	});

	b_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,
		balloonMinWidth: 400,
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 10,
		zIndexHover: 10,
		cursor: 'Pointer'
	});
	map.controls.add('mapTools').add(searchControl);
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);

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
			src,
			newattr,
			count = 0;
		for (b in source) {
			if (source.hasOwnProperty(b)) {
				c            = parseInt(b, 10);
				src          = source[b];	// alias на длинный путь в большом массиве
				options      = ymaps.option.presetStorage.get(src.attr); //назначаем опции из существующих пресетов или из созданных нами вручную
				if (src.attr.split('#')[0] === 'default') {
					newattr  = [ 'twirl', src.attr.split('#')[1] ].join('#');
					options  = ymaps.option.presetStorage.get(newattr);
					src.attr = newattr
				}
				properties = {		// свойства  у всех фигур одинаковые - семантика из базы данных и предвычисляемые службные поля
					attr		: src.attr,
					contact		: src.contact,
					description	: src.description,
					hintContent	: src.name,
					img			: src.img,
					link		: src.link,
					name		: src.name,
					pr			: src.pr,
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
				//console.log(source.length);
				//if ( count < 200 ) {
				$("#resultBody").append("<li ref=" + object.properties.get('ttl') + "><img src=" + typeicons[object.properties.get("pr")] + ">" + object.properties.get('name') + "</li>");
				//} else {
				//	$("#resultBody").empty();
				//}
			}
		}
	}

	function load_mapset(mapset) {

		function select_object(id) {
			a_objects.each(function (item) {
				var cr;
				//console.log(item.properties.get('attr'));
				item.options.set(ymaps.option.presetStorage.get(item.properties.get('attr')));
				item.options.set('zIndex', 50);
				if (parseInt(item.properties.get('ttl'), 10) === id) {
					//console.log("Found");
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

		function add_search () {
			$("#resultBody li").unbind().click(function () {
				$("#resultBody li").removeClass("active");
				$(this).addClass("active");
				select_object(parseInt($(this).attr('ref'), 10));
			});
		}

		function filter_collections(data) {
			var arr = data.split(",");
			map.balloon.close();
			$("#resultBody").empty();
			a_objects.each(function (item) {
				var h;
				if (ymaps.option.presetStorage.get(item.properties.get('attr')) === undefined) {
					console.log("Undefined style occured: " + item.properties.get('attr'));
				}
				item.options.set(ymaps.option.presetStorage.get(item.properties.get('attr')));
				item.options.set({ visible: 0 });
				for (h in arr) {
					if (arr.hasOwnProperty(h)) {
						if (parseInt(item.properties.get('ttl'), 10) === parseInt(arr[h], 10)) {
							item.options.set({ visible: 1 });
							$("#resultBody").append("<li ref=" + item.properties.get('ttl') + "><img src=" + typeicons[item.properties.get("pr")] + ">" + item.properties.get('name') + "</li>")
						}
					}
				}
				add_search ();
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
					$("#iSearch").tab("show");
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
					success: function () {
						place_objects(data, 'a');
						map.setBounds(a_objects.getBounds());
						add_search();
						$("#iFound").tab("show");
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
					if (tvalue !== "0" && tvalue !== '' && tvalue !== 0) {
						string[d] = tvalue;
						z += 1;
					}
				}
			}
			if (z > 0) {
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
}

ymaps.ready(init);