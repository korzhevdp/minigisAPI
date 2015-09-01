//######################################### процессор карты #########################################################
ymaps.ready(init);

function init() {
	(typeof map != "undefined") ? map.destroy() : "";
	var maptypes = {1: 'yandex#map', 2: 'yandex#satellite', 3: 'yandex#hybrid', 4: 'yandex#publicMap', 5: 'yandex#publicMapHybrid'}
	map = new ymaps.Map("YMapsID", {
		center: mp.center,// Центр карты
		zoom: mp.zoom,// Коэффициент масштабирования
		type: maptypes[mp.type],// Тип карты
		behaviors: ["scrollZoom","drag"] //Поведение карты - мышеколесо и перетаскивание руками
	}),
	searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
	// Создаем шаблон для отображения контента балуна
	genericBalloon = ymaps.templateLayoutFactory.createClass(
	'<div class="ymaps_balloon">' +
	'<div class="well" id="l_photo" data-toggle="modal" data-target="#modal_pics" loc=$[properties.ttl|0] style="float:left;margin:3px;cursor:pointer;padding:2px;background-color:#DDDDDD;">' +
	'<img src="http://giscenter.home/uploads/ico/$[properties.img|nophoto.gif]" alt="мини" id="sm_src_pic">' +
	'</div><b>Название:</b> $[properties.name|без имени]<br>' +
	'<b>Адрес:</b> $[properties.description|не указан]<br>' +
	'<b>Объявлено:</b> $[properties.date|контактное лицо]<br>'+
	'<b>Контакты:</b> $[properties.contact|контактное лицо]<br><br>'+
	'<a href="$[properties.link|ссылка]" style="margin-bottom:10px;">Подробности здесь</a>' +
	'</div>'
	),
	a_objects = new ymaps.GeoObjectArray(),
	b_objects = new ymaps.GeoObjectArray();// бэкграунд
	map.geoObjects.add(a_objects);
	map.geoObjects.add(b_objects);
	// ##### создаём НЕупорядоченную коллекцию объектов #####
	//назначаем опции оверлеев в коллекции (в данном случае - балун)
	a_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMinWidth: 400,
		balloonMaxWidth: 400,// Максимальная ширина балуна в пикселах
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 520,
		cursor: 'pointer'
	});

	b_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,// Максимальная ширина балуна в пикселах
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 510,
		cursor: 'pointer'
	});
	// ##### настройка представления карты #####
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);
	// Помещаем созданный шаблон в хранилище шаблонов.
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	//Теперь наш шаблон доступен по ключу 'generic#balloonLayout'.
	// ##### события #####
	//при открытии балунов на содержащуюся в них ссылку картинку назначается поведение элемента галереи

	map.events.add('balloonopen', function (){
		$('#upl_loc').val($('#l_photo').attr('loc'));
	});

	/*
	//при закрытии балунов "карусели" отправляется событие "самый полный стоп"
	map.events.add('balloonclose', function (){
		$('.modal:has(.carousel)').on('shown', function() {
			var $carousel = $(this).find('.carousel');
			if ($carousel.data('carousel') && $carousel.data('carousel').sliding) {
				$carousel.find('.active').trigger($.support.transition.end);
			}
		});
	});
	*/
	styleAddToStorage(userstyles);
	load_mapset();
}

//######################################### конец процессора карты #######################################################
//######################################################################################################################

function select_object(id){
	a_objects.each(function(item){
		//if(item.options.get('visible')){
			item.options.set(ymaps.option.presetStorage.get(item.properties.get('attr')));
			if(item.properties.get('ttl') == id){
				switch (item.geometry.getType().toLowerCase()){
					case 'point' :
						item.options.set(ymaps.option.presetStorage.get('user#here'));
					break;
					case 'linestring' :
						item.options.set(ymaps.option.presetStorage.get('routes#current'));
					break;
					case 'polygon' :
						item.options.set(ymaps.option.presetStorage.get('area#current'));
					break;
					case 'circle' :
						item.options.set(ymaps.option.presetStorage.get('circle#current'));
					break;
					case 'rectangle' :
						item.options.set(ymaps.option.presetStorage.get('rct#current'));
					break;
				}

				item.options.set('zIndex',800);
				switch (item.geometry.getType().toLowerCase() == 'point' || item.geometry.getType().toLowerCase() == 'circle'){
					case 'point', 'circle' :
					map.setCenter(item.geometry.getCoordinates());
					item.balloon.open(item.geometry.getCoordinates());
					break;
					case 'linestring', 'polygon' :
					map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
					item.balloon.open(item.geometry.getCoordinates()[0]);
					break;
					case 'rectangle' :
					map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
					cr = item.geometry.getCoordinates();
					item.balloon.open([(cr[0][0] + cr[1][0])/2, (cr[0][1] + cr[1][1])/2]);
				}
			}
		//}
	});
}

function styleAddToStorage(src){
	for (var a in src){
		ymaps.option.presetStorage.add(a,src[a]);
	}
}

function place_objects(source,layer){
	for (b in source){
		var c = parseInt(b),
			src = source[b], // alias на длинный путь в большом массиве
			properties = {	// свойства  у всех фигур одинаковые - семантика из базы данных и предвычисляемые службные поля
				date: src.date,
				attr: src.attr,
				contact: src.contact,
				description: src.description,
				hintContent: src.name,
				img: src.img,
				link: src.link,
				name: src.name,
				ttl: c
			};
			//alert(c);
		if(src.pr == 1){ // точка
			var geometry = src.coord.split(","), // создаём объект геометрии (или, если достаточно по условиям, - массив)
				options = ymaps.option.presetStorage.get(src.attr), //назначаем опции из существующих пресетов или из созданных нами вручную
				object = new ymaps.Placemark(geometry, properties, options); // генерируем оверлей

		}
		if(src.pr == 2){ //ломаная
			var geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(src.coord),
				options = ymaps.option.presetStorage.get(src.attr),
				object = new ymaps.Polyline(geometry, properties, options);
		}
		if(src.pr == 3){ // полигон
			var geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(src.coord),
				options = ymaps.option.presetStorage.get(src.attr),
				object = new ymaps.Polygon(geometry, properties, options);
		}
		if(src.pr == 4){ // круг
			var geometry = new ymaps.geometry.Circle([parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])], parseFloat(src.coord.split(",")[2])),
				options = ymaps.option.presetStorage.get(src.attr),
				object = new ymaps.Circle(geometry, properties, options);
		}
		if(src.pr == 5){ // прямоугольник
			var geometry = new ymaps.geometry.Rectangle([
					[parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])],
					[parseFloat(src.coord.split(",")[2]), parseFloat(src.coord.split(",")[3])]
				]),
				options = ymaps.option.presetStorage.get(src.attr),
				object = new ymaps.Rectangle(geometry, properties, options);
		}
		if(layer == 'a'){
			a_objects.add(object, c);
		}else{
			b_objects.add(object, c);
		}
	}
}



function load_mapset(){
	$.ajax({
		url: "/monitoring/current",
		type: "POST",
		dataType: "script",
		success: function(){
			place_objects(mon, 'a');
		},
		error: function(data,stat,err){
			alert([data,stat,err].join("<br>"));
		}
	});
}

function perform_search(string){
	$.ajax({
		url: ["/ajax/search", string, mp.mapset].join("/"),
		type: "GET",
		dataType: "text",
		success: function(data){
			filter_collections(data);
		},
		error: function(a,b){
			alert("Ничего не найдено");
		}
	});
}

function filter_collections(data){
	var arr = data.split(","),
		cm = [],
		entry;
	for (a in arr){
		cm[arr[a]] = 1;
	}
	$("#resultBody").html("");
	a_objects.each(function(item){
		test = (typeof cm[item.properties.get('ttl')] != 'undefined') ? 1 : 0;
		item.options.set({ visible: test });
		if(test){
			entry = '<li ref="' + item.properties.get('ttl') + '">'+ [item.properties.get('name'), item.properties.get('description')].join("<br>") + '</li>';
			$("#resultBody").append(entry);
		}
	});
	$("#resultBody li").click(function(){
		select_object($(this).attr('ref'));
	});
	b_objects.options.set({ visible: 0 });
}

function unfilter_collections(data){
	a_objects.each(function(item){
		item.options.set({ visible: 1 });
	});
	b_objects.options.set({ visible: 1 });
}