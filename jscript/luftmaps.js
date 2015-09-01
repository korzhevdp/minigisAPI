//######################################### ��������� ����� #########################################################
ymaps.ready(init);

function init() {
	// определения
	// начальная конфигурация
	// конец начальной конфигурации
		var dX        = [],
		config        = mapconfig[mapset],
		searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		typeSelector  = new ymaps.control.TypeSelector(),
		layerTypes    = config.layerTypes,
		revLayerTypes = {},
		cMapType      = 0,
		uploadPics    = [];

	//###################################################################################
	// Процессор карты
	//###################################################################################

	// сброс карты (это, типа, такой костыль ещё от старых карт - на всякий случай)
	(typeof map != "undefined") ? map.destroy() : "";
	//определение механизма пересчёта стандартной сетки тайлов в сетку тайлов Яндекс-карт
	for (var a=10; a < 21; a++){ dX[a] = Math.pow(2, a) - 1; }
	// реверс справочника слоёв + определение слоёв в цикле
	for (a in layerTypes){
		ymaps.layer.storage.add(layerTypes[a].label, layerTypes[a].func);
		ymaps.mapType.storage.add(layerTypes[a].label, new ymaps.MapType(
			layerTypes[a].name, layerTypes[a].layers
		));
		typeSelector.addMapType(layerTypes[a].label, a);
		//revLayerTypes[a] = {};
		revLayerTypes[layerTypes[a].label] = a;
	}

	map = new ymaps.Map("YMapsID",
		{center: config.mcenter, zoom: config.initZoom, type: config.layerTypes[0].label, behaviors: ["scrollZoom", "drag", "dblClickZoom"]},
		{projection: config.proj, maxZoom: config.maxZoom, minZoom: config.minZoom },
		{}
	);
	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	for (a in config.layerTypes){
		typeSelector.addMapType(config.layerTypes[a].label, a);
	}
	typeSelector.removeMapType('yandex#publicMapHybrid');
	typeSelector.removeMapType('yandex#hybrid');
	typeSelector.removeMapType('yandex#publicMap');
	typeSelector.removeMapType('yandex#map');

	/* органы управления картой */
	map.controls.add('zoomControl').add(typeSelector).add('mapTools');

	/* события карты */
	map.events.add('contextmenu', function (e){
		coords = e.get('coordPosition');
		ymaps.geocode(coords, { kind: ['house'] }).then(function (res) {
			var names = [];
			res.geoObjects.each(function (obj) {
				names.push(obj.properties.get('name'));
			});
			valtz = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса";
			map.balloon.open(coords, {
				content: '<small class="muted cHead"><img src="http://api.korzhevdp.com/images/marker.png" alt="координаты">&nbsp;&nbsp;'+
				[ coords[0].toPrecision(config.precision), coords[1].toPrecision(config.precision)].join(', ') +
				'&nbsp;&nbsp;&nbsp;&nbsp;<img src="http://api.korzhevdp.com/images/mail_box.png" alt="адрес">&nbsp;&nbsp;' + valtz + '</small>' +
				'<div class="cBody"><input id="coordPart" type="text" class="hide" value="' + [ coords[0].toPrecision(config.precision), coords[1].toPrecision(config.precision)].join(',') + '">' +
				'Описание: <textarea id="desc" rows="4" cols="10" placeholder="Здесь находится... (но не более 400 символов, пожалуйста)"></textarea>' +
				'<div id="photos">&nbsp;</div>' +
				'<div id="errors" class="alert alert-error hide">&nbsp;</div>' +
				'<button type="button" id="photoUp" class="btn btn-mini">Добавить фото</button><span id="picList"></span></div><hr>' +
				'<button class="btn btn-mini btn-info" id="linkGetter">Получить ссылку</button>' +
				'<button class="btn btn-mini btn-primary pull-right" id="leaveTicket" disabled="disabled">Загрузить на сервер</button>'
			}, {
				height: 360,
				minWidth: 540
			});
		});
	});

	map.events.add('click', function (e){
		var coords = e.get('coordPosition'),
			geometry   = { type: "Point", coordinates: coords },
			properties = { description: "Отметка", hintContent: "Отметка", name: "Отметка" },
			options    = { iconImageHref: 'http://api.korzhevdp.com/images/location_pin.png', iconImageSize: [32, 32], iconImageOffset: [-16, -32] },
			object     = new ymaps.Placemark(geometry, properties, options);
		m_objects.removeAll().add(object);
	});

	map.events.add('typechange', function (e){
		//alert(revLayerTypes.toSource());
		cMapType = revLayerTypes[e.get('newType')];
	});

	map.events.add('balloonopen', function (e){
		coords = e.get('balloon').getPosition();

		$("#photoUp").unbind().click(function(){
			leng = $("#upcenter :file").length
			f10r = '<input type="file" class="f10r" name="file' + leng + '" id="file' + leng + '">';
			$("#upcenter").append(f10r);
			$("#file" + leng).click();
			$(".f10r").unbind().change(function(){
				uploadPics = [];
				$(".f10r").each(function(){
					uploadPics.push($(this).val());
				});
				$("#picList").html(uploadPics.join(", "));
				if(uploadPics.length){
					$("#leaveTicket").removeAttr('disabled');
				}else{
					$("#leaveTicket").attr('disabled', 'disabled');
				}
			});
		});

		$("#superframe").load(function(){
			text = $(this).contents().text();
			$("#errors").removeClass("alert-error").addClass("alert-success").html(text).fadeIn(300, function(){
				$("#errors").delay(5000).fadeOut(700, function(){
					map.balloon.close();
				});
			});
		});

		$('#linkGetter').unbind().click(function(){
			var coord = $("#coordPart").val(),
				mType = cMapType,
				desc =  ( $("#desc").val().length ) ? $("#desc").val().replace(" ", "%20") : "Про%20описание%20забыли";
			$("#yourLinkText").html('http://luft.korzhevdp.com' + config.url + '#' + [ coord , mType, desc ].join("|"));
			map.balloon.close();
			$("#yourLink").modal("show");
		});

		form6 = '<form method="post" id="ff23" enctype="multipart/form-data" class="hide" style="display:none;" action="/upload.php" target="superframe">'+
			'<span id="upcenter"></span>' +
			'<input type="hidden" name="coord" id="coord" value="">' +
			'<input type="hidden" name="desc2" id="desc2" value="">' +
			'<input type="hidden" name="path" id="path" value="' + config.url + '">' +
			'</form>';
		$("#superframe").after(form6);
		$("#coord").val([coords[0].toFixed(6), coords[1].toFixed(6)].join(","));


		$("#leaveTicket").unbind().click(function(){
			$("#desc2").val($("#desc").val());
			$("#ff23").submit().remove();
		});
	});

	map.events.add('actionend', function (action){
		$("#zoomVal").html("<strong>M = " + action.get('target').getZoom() + "</strong>"); // сохраняем в поле новое значение масштаба карты
	});

	/* настройки баллончика */
	genericBalloon = ymaps.templateLayoutFactory.createClass('<div class="ymaps_balloon">$[properties.description|без описания]<br><a class="btn btn-small btn-block" href="$[properties.link|#]">Подробнее может быть здесь</a></div>');
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);

	/* установка параметров коллекции */
	a_objects = new ymaps.GeoObjectArray();
	a_objects.options.set({ balloonContentBodyLayout: 'generic#balloonLayout', balloonWidth: 400 });

	m_objects = new ymaps.GeoObjectArray();
	m_objects.options.set({ hasBalloon: 0, hasHint: 1, hintContent: "Отметка", draggable: 1 });

	p_objects = new ymaps.GeoObjectArray();
	p_objects.options.set({ hasBalloon: 0, hasHint: 1, hintContent: "Фотография" });

	t_objects = new ymaps.GeoObjectArray();
	t_objects.options.set({ balloonContentBodyLayout: 'generic#balloonLayout', balloonWidth: 400 });

	map.geoObjects.add(a_objects);
	map.geoObjects.add(m_objects);
	map.geoObjects.add(p_objects);
	map.geoObjects.add(t_objects);

	// ON UPDATE
	p_objects.events.add('click', function (e){
		e.stopPropagation();
		map.balloon.close();
		dir = e.get('target').properties.get('dir');
		fn  = e.get('target').properties.get('fname');
		lo  = e.get('target').properties.get('uploadedby');
		de  = e.get('target').properties.get('description');
		//alert(config.url + dir + "/600/" + fn);
		$("#picsOfLoc").empty();
		for (a in imgs[dir]){
			data = imgs[dir][a];
			$("#picsOfLoc").append('<img src="' + config.url + 'upload/' + dir + "/32/" + fn + '" big="' + config.url + 'upload/' + dir + "/600/" + fn + '" postedby="' + data.load + '" comment="' + data.desc + '" alt="">');
		}
		$("#mainPic").attr("src", config.url + 'upload/' + dir + "/600/" + fn);
		$("#author").html('<div class="pull-left" style="font-size:16px;margin-left:20px;">' + de + '</div>загружено: <u>' + lo + '</u>');
		///////////////////////////////////
		$("#picsOfLoc img").unbind().click(function(){
			$("#mainPic").attr("src", $(this).attr("big"));
			$("#author").html('<div class="pull-left" style="font-size:16px;margin-left:20px;">' + $(this).attr("comment") + '</div>загружено: <u>' + $(this).attr("postedby") + '</u>');
		});
		$("#thisLoc").modal('show');
	});

	m_objects.events.add('dblclick', function (){
		m_objects.removeAll();
	});

	$("#zoomVal").html("<strong>M = " + map.getZoom() + "</strong>");

}
//######################################### конец процессора карты #######################################################
//######################################################################################################################
