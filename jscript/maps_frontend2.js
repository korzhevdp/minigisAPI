//######################################### процессор карты #########################################################
var zy = [];
function display_locations(current) {
	var sat,
		id,
		template,
		active,
		bg,
		placemark,
		geoResult,
		pl,
		v,
		a,
		cns,
		objManager,
		map = new YMaps.Map(YMaps.jQuery("#YMapsID")),
		current_zoom = YMaps.jQuery("#current_zoom").val(),
		map_center = YMaps.jQuery("#map_center").val(),
		lat = map_center.split(",")[0],
		lon = map_center.split(",")[1];
	current = (typeof (current) !== 'undefined') ? current : YMaps.jQuery("#location_id").val();
/*
	if (YMaps.jQuery("#location_id").val().length) {
		current = YMaps.jQuery("#location_id").val();
	}
*/
	// ##### настройка представления карты #####

	map.setCenter(new YMaps.GeoPoint(lat, lon), current_zoom);
	map.addControl(new YMaps.TypeControl([YMaps.MapType.SATELLITE, YMaps.MapType.HYBRID, YMaps.MapType.MAP]));
	map.addControl(new YMaps.ToolBar());
	map.addControl(new YMaps.Zoom());
	map.addControl(new YMaps.ScaleLine());
	map.enableScrollZoom();

	// несколько криворукий, но всё же работающий на русском языке (sic!) детектор назначенного типа карты
	switch (YMaps.jQuery("#current_type").val()) {
	case 'Гибрид':
		map.setType(YMaps.MapType.HYBRID);
		break;
	case 'Спутник':
		map.setType(YMaps.MapType.SATELLITE);
		break;
	case 'Схема':
		map.setType(YMaps.MapType.MAP);
		break;
	}



/*######################################### функции отображения объектов #####################################*/
	// place_objects(source) - размещает объекты на карту в соответствии с типом их отображения. 
	// Спроектирована так, чтобы можно было указать конкретный рабочий массив, на случай их замены "на лету"
	// Например массив zy.ac (активная секция основного массива) будет разбираться по подмассивам, например gis, area, rts
	function place_objects(source) {
		for (sat in source) {
			var src = source[sat]; // alias на длинный путь в большом массиве
			if (src.pr === 1) {
				lat = src.coord.split(",")[0];
				lon = src.coord.split(",")[1];
				if (sat.toString() === current.toString()) {
					v = YMaps.Styles.get("user#curbuilding");
					map.setCenter(new YMaps.GeoPoint(lat, lon));
				} else {
					v = YMaps.Styles.get(src.attr);
				}
				v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
				placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat, lon), {style: v, hasHint: true});
				placemark.img = src.img;
				placemark.description = src.description;
				placemark.link = src.link;
				placemark.contact = src.contact;
				placemark.name = src.name;
				objManager.add(placemark, 11, 30);
			}
			if (src.pr === 2) {
				//v = YMaps.Styles.get(src.attr);
				v = (sat.toString() === current.toString()) ? YMaps.Styles.get('routes#current') : YMaps.Styles.get(src.attr);
				v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
				pl = YMaps.Polyline.fromEncodedPoints(src.coord);
				pl.description = src.description;
				pl.img = src.img;
				pl.link = src.link;
				pl.contact = src.contact;
				pl.name = src.name;
				if (sat.toString() === current.toString()) {
					map.setCenter(pl.getPoint(0));
				}
				pl.setStyle(v);
				//objManager.add(pl, 15, 30);
				map.addOverlay(pl);
			}
			if (src.pr === 3) {
				v = (sat.toString() === current.toString()) ? YMaps.Styles.get('area#default') : YMaps.Styles.get(src.attr);
				v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
				pl = YMaps.Polygon.fromEncodedPoints(src.coord, 'A', {style: v, hasHint: 1, hasBalloon: 1});
				pl.description = src.description;
				pl.img = src.img;
				pl.description = src.description;
				pl.link = src.link;
				pl.contact = src.contact;
				pl.name = src.name;
				//objManager.add(pl, 15, 30);
				map.addOverlay(pl);
				if (sat.toString() === current.toString()) {
					map.setCenter(pl.getPoint(0));
				}
			}
		}
	}
	// Определение стилей из файла map_styles.js. Парсится в userstyles[] при подключении файла, а здесь встраивается в объекты YMaps
	//SO Defining Styles
	function define_style(style_entry) {
		cns = new YMaps.Style();
		if (style_entry.type === 1) {
			cns.iconStyle = new YMaps.IconStyle();
			cns.iconStyle.href = style_entry.href;
			cns.iconStyle.size = new YMaps.Point(26, 24);
			cns.iconStyle.offset = new YMaps.Point(0, 0);
		}
		if (style_entry.type === 2) {
			cns.lineStyle = new YMaps.LineStyle();
			cns.lineStyle.strokeColor = style_entry.strokeColor;
			cns.lineStyle.strokeWidth = style_entry.strokeWidth;
		}
		if (style_entry.type === 3) {
			cns.polygonStyle = new YMaps.PolygonStyle();
			cns.polygonStyle.fill = style_entry.fill;
			cns.polygonStyle.outline = style_entry.outline;
			cns.polygonStyle.strokeWidth = style_entry.strokeWidth;
			cns.polygonStyle.strokeColor = style_entry.strokeColor;
			cns.polygonStyle.fillColor = style_entry.fillColor;
		}
		YMaps.Styles.add(style_entry.label, cns);
	}
	for (id in userstyles) {
		define_style(userstyles[id]);
	}
	// EO Defining Styles

	// ГЕОКОДЕР
	function showAddress(value) {
		map.removeOverlay(geoResult);// Удаление предыдущего результата поиска
		var geocoder = new YMaps.Geocoder(value, {results: 1, boundedBy: map.getBounds()});// Запуск процесса геокодирования
		YMaps.Events.observe(geocoder, geocoder.Events.Load, function () {// Создание обработчика для успешного завершения геокодирования
			// Если объект был найден, то добавляем его на карту и центрируем карту по области обзора найденного объекта
			if (this.length()) {
				geoResult = this.get(0);
				geoResult.setOptions({style: 'user#curbuilding', draggable: false});
				map.addOverlay(geoResult);
				map.setBounds(geoResult.getBounds());
			} else {
				alert("Ничего не найдено");
			}
		});
		YMaps.Events.observe(geocoder, geocoder.Events.Fault, function (geocoder, error) {	// Процесс геокодирования завершен неудачно
			alert("Произошла ошибка: " + error);
		});
	}
	// КОНЕЦ ГЕОКОДЕРА
	// ###############################################################################
	v = new YMaps.Style(); // инициируем стиль (возможно - излишне);
	// создаём темплейт балуна
	template = new YMaps.Template('<div class="ymaps_balloon"><div class="gallery" id="l_photo" style="float:left;margin:2 px;"><a href="/userimages/800/$[img|nophoto.gif]"><IMG SRC="/userimages/32/$[img|nophoto.gif]" ALT="мини"></a></div><B>Название:</B> $[name| без имени]<br><B>Адрес:</B> $[description|нет]<br><B>Контакты:</B> $[contact|контактное лицо]<br><br><B><U><A HREF="$[link|ссылка]" target="_blank" style="margin-bottom:10px;">Подробности здесь</A></B></U></div>');

	//менеджер объектов
	objManager = new YMaps.ObjectManager();//инициируем менеджер объектов YMaps
	map.addOverlay(objManager);// добавляем его на карту.

	// #### обработка приехавших данных #######

	// проходим по массиву zy.ac (active), размещая содержимое его подмассивов на карту
	active = zy.ac;
	for (a in active) {
		place_objects(active[a]);
	}
	//проходим по массиву zy.bg (background), размещая содержимое его подмассивов на карту
	bg = zy.bg;
	for (a in bg) {
		place_objects(bg[a]);
	}

	// #### приехавшие данные обработаны :) #######

	// подключение прослушивания событий
	$('#gQInit').click(function () { // щелчок по кнопке геокодера
		var value = $('#geoQuery').val();
		showAddress(value);//запрашиваем геокодер
	});
	YMaps.Events.observe(map, map.Events.BalloonOpen, function () {//при открытии балунов на содержащуюся в них ссылку картинку назначается поведение элемента галереи
		// врезка из kickstart
		$('.gallery').each(function (i) {
			$(this).find('a').attr('rel', 'gallery' + i).fancybox({
				overlayOpacity: 0.2,
				overlayColor: '#000'
			});
		});
	});
	// событие "изменение масштаба"
	YMaps.Events.observe(map, map.Events.SmoothZoomEnd, function () {
		YMaps.jQuery("#current_zoom").val(map.getZoom()); // сохраняем в поле текущее значение масштаба карты
	});
	// событие "переключение типа карты"
	YMaps.Events.observe(map, map.Events.TypeChange, function () {
		var current_type = map.getType();
		YMaps.jQuery("#current_type").val(current_type.getName()); //сохраняем в поле текущий тип карты 
	});

}
//######################################### конец процессора карты #########################################################
//######################################################################################################################

function display_search_results(node) {
	var results = [],
		img,
		i;
	for (i in node) {
		img = (node[i].img !== 'undefined') ? '<IMG SRC="/userimages/32/' + node[i].img + '" BORDER="0" WIDTH=32 HEIGHT=32 ALT="мини">' : "&nbsp;";
		results.push('<li onclick="display_locations(' + i + ');" ondblclick="window.location = \'' + node[i].link + '\'" title="Один щелчок - показать на карте. Двойной - открыть страницу"> ' + img + ' ' + node[i].name.replace("&nbsp;", " ") + '</li>');
	}
	if (!results.length) {
		$('#ResultBody').html('Ничего не найдено.<BR>Попробуйте изменить набор условий, например, упростив его.');
	} else {
		$('#ResultBody').html('<ul class="alt foundlist">' + results.join("\n") + "<\/ul>");
		$('#ResultHead2').html(results.length);
	}
}

function display_last_search(src) {
	var results = [],
		stream = [],
		id,
		img,
		sp,
		classid,
		i,
		a,
		node;
	for (a in src) {
		node = src[a];
		for (i in node) {
			stream[i] = node[i];
		}
	}
	sp = $("#lastsearch").val().split(',');
	for (i in sp) {
		id = sp[i];
		img = (typeof (stream[id].img) !== 'undefined') ? '<IMG SRC="/userimages/32/' + stream[id].img + '" BORDER="0" WIDTH=32 HEIGHT=32 ALT="мини">' : "&nbsp;";
		classid = (id === $("#location_id").val()) ? 'class="current"' : "";
		results.push('<li ' + classid + ' onclick="display_locations(' + id + ');" ondblclick="window.location = \'' + stream[id].link + '\'" title="Один щелчок - показать на карте. Двойной - открыть страницу"> ' + img + ' ' + stream[id].name.replace("&nbsp;", " ") + '</li>');
	}
	$('#ResultBody').html('<ul class="alt foundlist">' + results.join("\n") + "<\/ul>");
	$('#ResultHead2').html(results.length);
}

function display_search_conditions(cc, dc, nc) {
	var str = "",
		cc_preamble = "Я ищу:<br>",
		dc_preamble = "<br>Чтобы там было:<br>",
		nc_preamble = "<br>Учитывая:<br>";
	if (cc.length) {
		str += cc_preamble + cc.join("<br>или ");
	}
	if (dc.length) {
		str += dc_preamble + dc.join("<br>и ");
	}
	if (nc.length) {
		str += nc_preamble + nc.join("<br>и ");
	}
	if ((cc.length + dc.length + nc.length) === 0) {
		str = "Условия не заданы.<BR>Показаны все результаты";
	}
	$('#CondBody').html(str);
	$('#CondHead2').html(cc.length + dc.length + nc.length);
}

function display_prime() {
	var mapset = $('#mapset').val(),
		type = $('#type_strict').val();
	if (mapset > 0) {
		$.ajax({
			url: "/ajax/get_map_content/" + mapset,
			type: "POST",
			dataType: "script",
			success: function () {
				display_locations();
				if ($("#lastsearch").val().length) {
					display_last_search(zy.ac);
				}
			}
		});
	} else {
		$.ajax({
			url: "/ajax/msearch/" + type,
			type: "POST",
			dataType: "script",
			success: function () {
				display_locations();
				display_search_results(zy.ac.gis);
			},
			error: function () {
				//alert(b);
				alert("Ничего не найдено");
			}
		});
	}
}

function search_collected_params() {
	var collected = [],
		d_conditions = [],
		c_conditions = [],
		n_conditions = [],
		i = '';
	for (i in switches) {
		if (switches[i].value !== 0 && switches[i].value !== '') {
			collected.push(i + "_" + switches[i].value);
			switch (switches[i].group) {
			case 'u':
				$('#check_' + i).attr('src', '/images/clean.png');
				c_conditions.push("<b>" + switches[i].text.replace('&nbsp;', ' ') + "<\/b>");
				break;
			case 'd':
				if (typeof ($('#check_' + i) !== 'undefined')) {
					$('#check_' + i).attr('src', "/images/clean.png"); //картинку меняем только на чекбоксах
				}
				d_conditions.push("<b>" + switches[i].text + "<\/b>");
				break;
			case 'ud':
				if (typeof ($('#check_' + i) !== 'undefined')) {
					$('#check_' + i).attr('src', "/images/clean.png"); //картинку меняем только на чекбоксах
				}
				d_conditions.push("<b>" + switches[i].text + "<\/b>");
				break;
			case 'le':
				$('#param_' + i).val(switches[i].value);
				n_conditions.push("<b>" + switches[i].label + ":<\/b> " + switches[i].value + " " + switches[i].text);
				break;
			case 'select':
				d_conditions.push("<b>" + switches[i].text + "<\/b>");
				break;
			}
		}
	}
	display_search_conditions(c_conditions, d_conditions, n_conditions);
	search_by_params(collected);
}

function search_by_params(collected) {
	var mapset = $('#mapset').val(),
		param = collected.join('-'),
		lid = ($('#location_id').val().length) ? $('#location_id').val() : 0;
	if (!collected.length) {
		$('#lastsearch').val('');
	}
	if (param.length) {
		$.ajax({
			url: "/ajax/search/" + param + "/" + mapset + "/" + lid,// порядок переменных для имплементации нового кода: $input,$mapset,$current,
			type: "POST",
			dataType: "script",
			success: function () {
				display_locations();
			},
			error: function () {
				alert("Ничего не найдено");
			}
		});
	} else {
		display_prime();
	}
}

function parse_last_search(lastsearch) {
	var ls,
		la;
	if (lastsearch.length > 2) { //цифра несколько с потолка, но всё же... 
		la = lastsearch.split(",");
		for (sp in la) {
			switches[ls[0]].value = la.sp.split("|")[1];
		}
	}
}
function mark_params(pid) {
	switch (switches[pid].fieldtype) {
	case 'checkbox':
		if (switches[pid].value === 0) {
			switches[pid].value = 1;
		} else {
			switches[pid].value = 0;
			$('#check_' + pid).attr('src', "/images/clean_grey.png");
		}
		break;
	case 'text':
		switches[pid].value = ($('#param_' + pid).val().length) ? $('#param_' + pid).val() : 0;
		break;
	case 'select':
		switches[pid].value = ($('#sel_' + pid).val()) ? $('#sel_' + pid).val() : 0;
		break;
	}
	search_collected_params();
}