//######################################### процессор карты #########################################################
ymaps.ready(display_prime);
function display_locations(current) {
	var current_zoom = ($("#current_zoom").val().length) ? $("#current_zoom").val() : 15,
		current_type = $("#current_type").val(),
		map_center = $("#map_center").val(),
		current = (typeof(current) != 'undefined') ? current : $('#location_id').val(),
		lon = (isNaN(ymaps.geolocation.longitude)) ? parseFloat(map_center.toString().split(",")[0]) : ymaps.geolocation.longitude,
		lat = (isNaN(ymaps.geolocation.latitude)) ? parseFloat(map_center.toString().split(",")[1]) : ymaps.geolocation.latitude,
		counter = 0,
		object_gid = 0,
		isCenterSet = 0,
		a_objects = new ymaps.GeoObjectArray(),
		e_objects = new ymaps.GeoObjectArray(),
		clipboard = {name: '', description: '', address: '', preset: '', gtype: "Point"},
		controller = 'freehand_dev';

	styleAddToStorage(userstyles);

	$('#modal_pics').modal({show: 0});
	$('#modal_pics').on('show', function () {
		carousel_init();
	});

	if(typeof map !== 'undefined'){
		map.destroy();
	}

	map = new ymaps.Map("YMapsID", {
		center: [lon, lat],
		zoom: current_zoom,
		type: current_type,
		behaviors: ["scrollZoom","drag"]
	});

	$("#vp_lon").val(map.getCenter()[0].toFixed(4));
	$("#vp_lat").val(map.getCenter()[1].toFixed(4));
	$("#current_obj_type").val(1);

	var searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 });
	// ##### настройка представления карты #####
	map.controls.add('zoomControl').add('typeSelector').add('mapTools').add(searchControl);

	$(".ymaps-b-form-input__hint").empty();
	$(".ymaps-b-form-input__input").val(ymaps.geolocation.city);

	// ##### события #####
	map.events.add('balloonopen', function (){
		action_listeners_add();
		$('#upload_location').val($('#l_photo').attr('picref'));
	});
	map.events.add('balloonclose', function (){
		carousel_destroy();
	});
	map.events.add('boundschange', function (data){
		if(!isCenterSet){
			$("#vp_lon").val(data.get('newCenter')[0].toFixed(4)); // сохраняем в поле новое значение центра карты
			$("#vp_lat").val(data.get('newCenter')[1].toFixed(4)); // сохраняем в поле новое значение центра карты
			$("#map_center").val(data.get('newCenter').join(",")); // сохраняем в поле новое значение центра карты
			$("#current_zoom").val(data.get('newZoom')); // сохраняем в поле новое значение масштаба карты
			sendMap();
		}
	});
	map.events.add('typechange', function (){
		$("#current_type").val(map.getType()); // сохраняем в поле новое значение типа карты
		sendMap();
	});
	map.events.add('click', function (click){
		draw_object(click);
	});
	// события не-карты
	$(".obj_sw").click(function(){
		$("#current_obj_type").val($(this).attr('pr'));
		$(".navigator-pane").addClass('hide');
		$("#navigator-pane" + $(this).attr('pr')).removeClass('hide');
	});
	$(".mg-btn-list").click(function(src){
		select_сurrent_found_object(src);
	});
	$("#m_style, #line_style, #polygon_style, #circle_style").change(function(){
		var id = $(this).attr("id"),
			val = $(this).val();
		e_objects.each(function(item){
			type = item.geometry.getType();
			//alert(type + ' - ' +id);
			if(type == "Point" && id == "m_style"){
				apply_preset(val);
			}
			if(type == "LineString" && id == "line_style"){
				apply_preset(val);
			}
			if(type == "Polygon" && id == "polygon_style"){
				apply_preset(val);
			}
			if(type == "Circle" && id == "circle_style"){
				apply_preset(val);
			}
		})
	});

	// ##### Шаблоны #####
	var genericBalloon = ymaps.templateLayoutFactory.createClass(
	'<div class="ymaps_balloon row-fluid">' +
	'<div class="gallery span2" id="l_photo" data-toggle="modal" picref=$[properties.ttl|0] href="#modal_pics">' +
	'<IMG SRC="/userimages/32/$[properties.img|nophoto.gif]" style="margin:3px;" ALT="мини" id="sm_src_pic">' +
	'</div><b>Название:</b> $[properties.name|без имени]<br><b>Адрес:</b> $[properties.address|нет]<br>' +
	'<b>Описание</b> $[properties.description|без описания]' +
	'<!-- <a href="$[properties.link|ссылка]" style="margin-bottom:10px;"><u>Подробности здесь</u></a> -->' +
	'<div class="span12" style="margin-top:10px;">' +
	'<button type="button" class="btn btn-mini btn-primary sw-edit" ttl=$[properties.ttl|0] style="margin-right:10px;">Редактировать </button>' +
	'<button type="button" class="btn btn-mini btn-info balloonClose" style="margin-right:10px;">Закрыть</button>' +
	'</div></div>'
	);
	var editBalloon = ymaps.templateLayoutFactory.createClass(
	'<div class="ymaps_balloon row-fluid">' +
	'<span class="span3" style="margin-left:0px;font-weight:bolder">Название:</span><input type="text" id="bal_name" class="span9 input-mini" value="$[properties.name|без имени]">'+
	'<span class="span3" style="margin-left:0px;font-weight:bolder">Адрес:</span><input type="text" id="bal_addr" class="span9 input-mini" value="$[properties.address|нет]">' +
	'<span class="span3" style="margin-left:0px;font-weight:bolder">Описание:</span><textarea id="bal_desc" rows="3" cols="6" class="span12">$[properties.description|нет]</textarea>' +
	'<!-- <a href="$[properties.link|ссылка]" style="margin-bottom:10px;"><u>Подробности здесь</u></a> -->' +
	'<div class="span12" style="margin-top:10px;">' +
	'<button type="button" class="btn btn-mini btn-primary sw-finish" ttl=$[properties.ttl|0] style="margin-right:10px;">Готово</button>' +
	'<button type="button" class="btn btn-mini btn-danger sw-del" ttl=$[properties.ttl|0] style="margin-right:10px;">Удалить</button>' +
	'<button type="button" class="btn btn-mini btn-info balloonClose">Закрыть</button>' +
	'</div></div>'
	);
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	ymaps.layout.storage.add('editing#balloonLayout', editBalloon);

	a_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 300
	});
	e_objects.options.set({
		balloonContentBodyLayout: 'editing#balloonLayout',
		balloonMaxWidth: 300
	});
	e_objects.events.add('dragend', function(e){
		object = e.get('target');
		traceNode(object);
		sendObject(object);
	});
	a_objects.events.add('contextmenu', function(e){
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		object = e.get('target');
		doEdit(object);
		count_objects();
		counter = 1;
	});
	e_objects.events.add('contextmenu', function(e){
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		object = e.get('target');
		doEdit(object);
		count_objects();
		counter = 1;
	});
	map.geoObjects.add(a_objects);
	map.geoObjects.add(e_objects);

	//sendMap();



	//################################## выносные функции
	function draw_object(click){
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		if (counter){
			if(confirm("На карте присутствуют редактируемые объекты.\nЗавершить их редактирование и создать новый объект?")){
				doFinishAll();
			}else{
				return false;
			}
		}
		var type = $("#current_obj_type").val(),
			style = $('#m_style').val(),
			styleLine = $('#line_style').val(),
			stylePolygon = $('#polygon_style').val(),
			styleCircle = $('#circle_style').val();
		properties = {
			attr: style,
			contact: "",
			description: "Объект",
			ttl: ++object_gid,
			hintContent: "",
			img: "nophoto.gif",
			address: "Не указан",
			name: "Название"
		};
		switch (type){
			case "1" : // точка
				var geometry = { type: "Point", coordinates: click.get('coordPosition')},
					options = (ymaps.option.presetStorage.get(style) != 'Null') ? { preset: style } : { preset: "twirl#redDotIcon"},
					object = new ymaps.Placemark(geometry, properties, options);
					object.options.set({draggable: 1});
					traceNode(object);
				e_objects.add(object);
				counter++;
				sendObject(object);
			break;
			case "2" :
				var geometry = {type: 'LineString', coordinates: [click.get('coordPosition')]},
					options = (ymaps.option.presetStorage.get(styleLine) != 'Null') ? {preset: styleLine} : { preset: "routes#default"},
					object = new ymaps.Polyline(geometry, properties, options);
				e_objects.add(object);
				object.editor.startDrawing();
				object.options.set({draggable: 1});
				counter++;
				sendObject(object);
			break;
			case "3" :
				var geometry = {type: 'Polygon',coordinates: [[click.get('coordPosition')]]},
					options = (ymaps.option.presetStorage.get(stylePolygon) != 'Null') ? {preset: stylePolygon} : { preset: "area#default"},
					object = new ymaps.Polygon(geometry, properties, options);
				e_objects.add(object);
				object.editor.startDrawing();
				object.options.set({draggable: 1});
				sendObject(object);
				counter++;
			break;
			case "4" :
				var geometry = [click.get('coordPosition'),$("#cir_radius").val()],
					options = (ymaps.option.presetStorage.get(styleCircle) != 'Null') ? {preset: styleCircle} : { preset: "circle#default"},
					object = new ymaps.Circle(geometry, properties, options);
				object.options.set({draggable: 1});
				traceNode(object);
				e_objects.add(object);
				counter++;
				sendObject(object);
			break;
		}
		$('#location_id').val(object_gid);
		count_objects();
	}

	function carousel_destroy(){
		$('.modal:has(.carousel)').on('shown', function() {
			var $carousel = $(this).find('.carousel');
			if ($carousel.data('carousel') && $carousel.data('carousel').sliding) {
				$carousel.find('.active').trigger($.support.transition.end);
			}
		});
	}

	function carousel_init(){
		$.ajax({
			url: "/ajaxutils/getimagelist/" + $('#l_photo').attr('picref') + '/' + Math.random(0,99999),
			type: "POST",
			dataType: "html",
			success: function(data){
				$("#pic_collection").empty().append(data);
				newid = 'car_' + ($(".carousel").attr('id').split('_')[1]++);
				$(".carousel").attr('id', newid);
				$('#' + newid).carousel();
			},
			error: function(a,b){
				alert("При поиске изображений произошла ошибка на сервере");
			}
		});
	}

	function styleAddToStorage(src){
		for (a in src){
			ymaps.option.presetStorage.add(a,src[a]);
		}
	}

	function place_freehand_objects(source){
		for (b in source){
			var src = source[b],
			properties = {
				attr: src.attr,
				description: src.description,
				address: src.address,
				hintContent: src.name + ' ' + src.description,
				img: src.img,
				link: src.link,
				name: src.name,
				ttl: b
			};
			if(src.pr == 1){
				var geometry = src.coord.split(","),
					options = { preset: src.attr },
					object = new ymaps.Placemark(geometry, properties, options);
				a_objects.add(object);
			}
			if(src.pr == 2){
				var geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(src.coord),
					options = { preset: src.attr },
					object = new ymaps.Polyline(geometry, properties, options);
				a_objects.add(object);
			}
			if(src.pr == 3){
				var geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(src.coord),
					options = { preset: src.attr },
					object = new ymaps.Polygon(geometry, properties, options);
				a_objects.add(object);
			}
			if(src.pr == 4){
				var geometry = new ymaps.geometry.Circle([parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])], parseFloat(src.coord.split(",")[2])),
					options = { preset: src.attr },
					object = new ymaps.Circle(geometry, properties, options);
				a_objects.add(object);
			}
		}
		map.geoObjects.add(a_objects);
		map.geoObjects.add(e_objects);
	}

	function doFinish(src){
		var addr = $("#bal_addr").val(),
			desc = $("#bal_desc").val(),
			name = $("#bal_name").val(),
			ttl = $(src).attr('ttl').toString();
		e_objects.each(function(item){
			if (item.properties.get('ttl').toString() === ttl){
				e_objects.remove(item);
				item.properties.set({description: desc, address: addr, name: name, hintContent: name + ' ' + addr});
				a_objects.add(item);
				item.options.set({draggable: 0, zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1, strokeStyle: 'solid'});
				sendObject(item);
			}
		});
		if(e_objects.getLength() < 2){
			$(".pointcoord").removeAttr('disabled');
			$(".circlecoord").removeAttr('disabled');
		}
	}

	function doFinishAll(){
		while (e_objects.getLength() > 0){
			e_objects.each(function(item){
				a_objects.add(item);
				e_objects.remove(item);
				item.options.set({draggable: 0, zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1, strokeStyle: 'solid'});
				//sendObject(item);
			});
		}
		//e_objects.removeAll();
		count_objects();
	}

	function doEdit(src){
		ttl = (typeof $(src).attr('ttl') == 'undefined') ? src.properties.get('ttl') : $(src).attr('ttl').toString();
		$("#location_id").val(ttl);
		map.balloon.close();
		a_objects.each(function(item){
			item.options.set({zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1, strokeStyle: 'solid'});
			if(item.options.get('draggable') == 0){
				item.options.set({draggable: 1});
			}
			if (item.properties.get('ttl').toString() == ttl){
				e_objects.add(item);
				a_objects.remove(item);
				type = item.geometry.getType();
				if(type == "LineString" || type == "Polygon"){
					item.editor.startEditing();
				}
				item.options.set({draggable: 1, zIndex: 300, zIndexActive: 300, zIndexDrag: 300, zIndexHover: 300, strokeStyle: 'dot'});
				openEditPane(item);
				traceNode(item);
				item.balloon.open(item.geometry.getCoordinates());
			}
		});
		if(e_objects.getLength() > 1){
			$(".pointcoord").attr('disabled','disabled');
			$(".circlecoord").attr('disabled','disabled');
		}
	}

	function doDelete(src){
		ttl = $(src).attr('ttl').toString();
		e_objects.each(function(item){
			if (item.properties.get('ttl').toString() == ttl){
				e_objects.remove(item);
			}
		});
		a_objects.each(function(item){
			if (item.properties.get('ttl').toString() == ttl){
				a_objects.remove(item);
			}
		});
		$.ajax({
			url: "/" + controller + "/obj_delete/" + ttl,
			type: "POST",
			success: function(data){
				//$("#consoleContent").html(data);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

	function action_listeners_add(){
		$(".balloonClose").click(function(){
			map.balloon.close();
		});
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			$(".sw-edit").addClass("disabled");
			return false;
		}
		$(".sw-finish").click(function(){
			doFinish(this);
			nullTracers();
			counter = 0;
			map.balloon.close();
			count_objects();
		});

		$(".sw-edit").click(function(){
			doEdit(this);
			count_objects();
			counter = 1;
		});

		$(".sw-del").click(function(){
			doDelete(this);
			nullTracers();
			counter = 0;
			map.balloon.close();
			count_objects();
		});

		$(".copyProp").click(function(){
			toClipboard(this);
		});

		$(".pasteProp").click(function(){
			fromClipboard(this,0);
		});

		$(".pastePropOpt").click(function(){
			fromClipboard(this,1);
		});
	}

	function style_list(){
		for (a in style_src){
			$("#m_style").append($('<option value="' + style_src[a][2] + '">' + style_src[a][3] + '</option>'));
		}
	}

	function apply_preset(src){
		e_objects.each(function(item){
			if (item.geometry.getType() == getGeometryNameByInternalType($("#current_obj_type").val())){
				item.options.set({ preset: src });
				sendObject(item);
			}
		});
	}

	function getInternalType(item){
		switch (item.geometry.getType()){
			case "Point" :
				type = "1";
			break;
			case "LineString" :
				type = "2";
			break;
			case "Polygon" :
				type = "3";
			break;
			case "Circle" :
				type = "4";
			break;
		}
		return type;
	}

	function getGeometryNameByInternalType(val){
		switch (val.toString()){
		case "1" :
			var type = "Point";
			break;
		case "2" :
			var type = "LineString";
			break;
		case "3" :
			var type = "Polygon";
			break;
		case "4" :
			var type = "Circle";
			break;
		case "5" :
			var type = "Rectangle";
			break;
		}
		return type;
	}

	function count_objects(){
		$("#ResultBody").empty();
		$("#nowEdited").empty();
		var processlist = [];
		var processlist2 = [];
		a_objects.each(function(item){
			switch (item.geometry.getType()){
				case "Point" :
					pic = 'marker.png';
				break;
				case "LineString" :
					pic = 'layer-shape-polyline.png';
				break;
				case "Polygon" :
					pic = 'layer-shape-polygon.png';
				break;
				case "Circle" :
					pic = 'layer-shape-ellipse.png';
				break;
			}
			processlist.push('<div class="btn-group" style="margin-left:5px;">'
				+ '<button class="btn btn-mini mg-btn-list" ttl="' + item.properties.get('ttl') + '">'
				+ '<img src="/images/' + pic + '" alt="">'
				+ 'Название: ' + item.properties.get('name') + '<br>'
				+ 'Адрес: ' + item.properties.get('address')
				+ '</button>'
				+ '<button class="btn dropdown-toggle" data-toggle="dropdown" style="height:55px;">'
					+ '<span class="caret"></span>'
				+ '</button>'
				+ '<ul class="dropdown-menu">'
					+ '<li><a href="#" class="copyProp" ttl="' + item.properties.get('ttl') + '"><i class="icon-upload"></i> Скопировать свойства</a></li>'
					+ '<li><a href="#" class="pasteProp" ttl="' + item.properties.get('ttl') + '" title="Вставить свойства"><i class="icon-download"></i> Вставить свойства</a></li>'
					+ '<li><a href="#" class="pastePropOpt" ttl="' + item.properties.get('ttl') + '" title="Вставить свойства и оформление"><i class="icon-download-alt"></i> Вставить всё</a></li>'
					+ '<li><a href="#" class="sw-del" ttl="' + item.properties.get('ttl') + '"><i class="icon-trash"></i> Удалить объект</a></li>'
				+ '</ul>'
			+ '</div>');
		});
		$("#ResultBody").html(processlist.join(''));
		e_objects.each(function(item){
			switch (item.geometry.getType()){
				case "Point" :
					pic = 'marker.png';
				break;
				case "LineString" :
					pic = 'layer-shape-polyline.png';
				break;
				case "Polygon" :
					pic = 'layer-shape-polygon.png';
				break;
				case "Circle" :
					pic = 'layer-shape-ellipse.png';
				break;
			}
			processlist2.push('<div class="btn-group" style="margin-left:5px;">'
				+ '<button class="btn btn-mini mg-btn-list" ttl="' + item.properties.get('ttl') + '">'
				+ '<img src="/images/' + pic + '" alt="">'
				+ 'Название: ' + item.properties.get('name') + '<br>'
				+ 'Адрес: ' + item.properties.get('address')
				+ '</button>'
				+ '<button class="btn dropdown-toggle" data-toggle="dropdown" style="height:55px;">'
					+ '<span class="caret"></span>'
				+ '</button>'
				+ '<ul class="dropdown-menu">'
					+ '<li><a href="#" class="copyProp" ttl="' + item.properties.get('ttl') + '"><i class="icon-upload"></i> Скопировать свойства</a></li>'
					+ '<li><a href="#" class="pasteProp" ttl="' + item.properties.get('ttl') + '" title="Вставить свойства"><i class="icon-download"></i> Вставить свойства</a></li>'
					+ '<li><a href="#" class="pastePropOpt" ttl="' + item.properties.get('ttl') + '" title="Вставить свойства и оформление"><i class="icon-download-alt"></i> Вставить всё</a></li>'
					+ '<li><a href="#" class="sw-del" ttl="' + item.properties.get('ttl') + '"><i class="icon-trash"></i> Удалить объект</a></li>'
				+ '</ul>'
			+ '</div>');
		});
		$("#nowEdited").html(processlist2.join(''));

		$(".mg-btn-list").click(function(){
			ttl = $(this).attr("ttl").toString();
			a_objects.each(function(item){
				if(item.properties.get("ttl").toString() === ttl){
					item.balloon.open(item.geometry.getCoordinates());
				}
			});
			e_objects.each(function(item){
				if(item.properties.get("ttl").toString() === ttl){
					item.balloon.open(item.geometry.getCoordinates());
					openEditPane(item);
				}
			});
		});
		action_listeners_add();
	}

	function openEditPane(item){
		type = getInternalType(item);
		$("#current_obj_type").val(type);
		$(".obj_sw").removeClass("active");
		$(".obj_sw[pr=" + type + "]").addClass("active");
		$(".navigator-pane").addClass("hide");
		$("#navigator-pane"+ type).removeClass("hide");
		$("#navheader > li").removeClass("active");
		$("#palette").addClass("active");
		$('#results').removeClass('active');
		$('#mainselector').addClass('active');
	}

	function traceNode(src){
		var type = src.geometry.getType(),
			coords = src.geometry.getCoordinates(),
			desc = src.properties.get("description"),
			cstyle = src.options.get("preset");
		switch (type){
			case "Point" :
				coords = coords.toString().split(",");
				$("#m_lon").val(parseFloat(coords[0]).toFixed(6));
				$("#m_lat").val(parseFloat(coords[1]).toFixed(6));
				$("#m_style [value='" + cstyle + "']").attr("selected", "selected");
			break;
			case "LineString" :
				$("#line_vtx").html(src.geometry.getLength());
				$("#line_len").html(length_calc(coords) + " м.");
				$("#line_style [value='" + cstyle + "']").attr("selected", "selected");
			break;
			case "Polygon" :
				$("#polygon_vtx").html(coords[0].length - 1);
				$("#polygon_len").html(perimeter_calc(coords) + " м.");
				$("#polygon_style [value='" + cstyle + "']").attr("selected", "selected");
			break;
			case "Circle" :
				radius = src.geometry.getRadius();
				$("#cir_lon").val(coords[0].toFixed(6));
				$("#cir_lat").val(coords[1].toFixed(6));
				$("#cir_radius").val(radius);
				$("#cir_len").html((radius * 2 * Math.PI).toFixed(2));
				$("#cir_field").html((Math.pow(radius,2) * Math.PI).toFixed(2));
				$('#circle_style [value="' + cstyle + '"]').attr("selected", "selected");
			break;
		}
	}

	function nullPlacemarkTracer(){
		$("#m_lon").val('');
		$("#m_lat").val('');
	}

	function nullTracers(){
		$("#m_lon").val('');
		$("#m_lat").val('');
		$("#m_style :first").attr("selected", "selected");
		$("#m_description").html('');
		$("#line_vtx").html(0);
		$("#line_len").html(0);
		$("#line_style :first").attr("selected", "selected");
		$("#line_description").html('');
		$("#polygon_vtx").html(0);
		$("#polygon_len").html(0);
		$("#polygon_style :first").attr("selected", "selected");
		$("#polygon_description").html('');
		$("#cir_lon").val('');
		$("#cir_lat").val('');
		$("#cir_radius").val(100);
		$("#cir_len").html(0);
		$("#cir_field").html(0);
		$("#circle_style :first").attr("selected", "selected");
		$("#circle_description").html('');
	}

	function setPointCoordinates(){
		var ttl = $('#location_id').val();
		//alert(ttl);
		e_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				item.geometry.setCoordinates([parseFloat($("#m_lon").val()), parseFloat($("#m_lat").val())]);
			}
		});
	}

	function setCircleCoordinates(){
		var ttl = $('#location_id').val();
		e_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				item.geometry.setCoordinates([parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val())]);
				traceNode(item);
			}
		});
	}

	function setCircleRadius(){
		var ttl = $('#location_id').val();
		e_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				item.geometry.setRadius(parseFloat($("#cir_radius").val()));
				traceNode(item);
			}
		});
	}

	function setMapCoordinates(){
		map.setCenter([parseFloat($("#vp_lon").val()), parseFloat($("#vp_lat").val())], parseInt($("#current_zoom").val()));
	}

	function length_calc(src){
		if(src.length < 2){
			return "0";
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
		routelength = (isNaN(routelength)) ? 0 : routelength;
		return routelength.toFixed(2);
	}

	function perimeter_calc(src){
		if(src[0].length < 2){
			return "0";
		}
		var routelength = 0,
			next = 0,
			start = [],
			end = [],
			delta = 0;
		for(var j = 0; j < src.length; j++){
			for (var i=0; i < (src[j].length - 1);i++){
				next = (i + 1);
				start = src[j][i];
				end = src[j][next];
				delta = ymaps.coordSystem.geo.getDistance(start, end);
				routelength += delta;
			}
		}
		routelength = (isNaN(routelength)) ? 0 : routelength;
		return routelength.toFixed(2);
	}

	function sendObject(item){
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		switch (item.geometry.getType()){
			case "Point":
				geometry = item.geometry.getCoordinates();
				break;
			case "LineString":
				geometry = ymaps.geometry.LineString.toEncodedCoordinates(item.geometry);
				break;
			case "Polygon":
				geometry = ymaps.geometry.Polygon.toEncodedCoordinates(item.geometry);
				break;
			case "Circle":
			geometry = [item.geometry.getCoordinates(),item.geometry.getRadius()];
			break;
		}
		var id = item.properties.get('ttl'),
			coord = geometry,
			attr = item.options.get('preset').replace("#","-"),
			desc = encodeURIComponent(item.properties.get('description')),
			address = encodeURIComponent(item.properties.get('address')),
			name = encodeURIComponent(item.properties.get('name')),
			type = getInternalType(item);
		$.ajax({
			url: "/" + controller + "/save/" + [id,type,geometry,attr,desc,address,name].join("/"),
			type: "POST",
			success: function(data){
				//$("#consoleContent").html(data);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

	function sendMap(){
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		var maptype = map.getType().replace('#','-'),
			center = [$("#vp_lat").val(),$("#vp_lon").val()],
			zoom = map.getZoom();
		$.ajax({
			url: "/" + controller + "/savemap/" + [maptype, center, zoom].join('/'),
			type: "POST",
			datatype: "text",
			success: function(data){
				//$("#consoleContent").html(data);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

	function saveAll(){
		doFinishAll();
		$.ajax({
			url: "/" + controller + "/savedb",
			type: "POST",
			dataType: "script",
			success: function(data){
				a_objects.removeAll();
				e_objects.removeAll();
				place_freehand_objects(usermap);
				count_objects();
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

	function loadmap(name){
		$.ajax({
			url: "/" + controller + "/loadmap/" + name,
			type: "POST",
			dataType: "script",
			success: function(data){
				a_objects.removeAll();
				e_objects.removeAll();
				if(typeof usermap != 'undefined'){
					place_freehand_objects(usermap);
				}
				if(typeof mp != 'undefined'){
					center = [mp.c0,mp.c1];
					(mp.id == 'void') ? $("#mapSave,#ehashID").css('display',"none") : $("#mapSave,#ehashID").css('display',"block");
					map.setType(mp.maptype);
					map.setZoom(mp.zoom);
					map.panTo([mp.c0,mp.c1]),{callback: function(err){},checkZoomRange:1, duration:1000};
					if(mp.indb){
						$(".readyMarker").removeClass("icon-remove").addClass("icon-ok");
					}
				}
				count_objects();
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

	function toClipboard(src){
		var ttl = $(src).attr('ttl');
		e_objects.each(function(item){
			if(ttl.toString() == item.properties.get('ttl').toString()){
				clipboard = {
					name: item.properties.get('name'),
					address: item.properties.get('address'),
					description: item.properties.get('description'),
					preset: item.options.get('preset'),
					gtype: item.geometry.getType()
				};
			}
		});
		a_objects.each(function(item){
			if(ttl.toString() == item.properties.get('ttl').toString()){
				clipboard = {
					name: item.properties.get('name'),
					address: item.properties.get('address'),
					description: item.properties.get('description'),
					preset: item.options.get('preset'),
					gtype: item.geometry.getType()
				};
			}
		});
		count_objects();
	}

	function fromClipboard(src,wst){
		var ttl = $(src).attr('ttl');
		e_objects.each(function(item){
			if(ttl.toString() == item.properties.get('ttl').toString()){
				item.properties.set({
					name : clipboard.name,
					address: clipboard.address,
					description: clipboard.description,
					hintContent: clipboard.name + ' ' + clipboard.address
				});
				if(wst == 1 && item.geometry.getType() == clipboard.gtype){
					item.options.set('preset', clipboard.preset);
				}
			}
		});
		a_objects.each(function(item){
			if(ttl.toString() == item.properties.get('ttl').toString()){
				item.properties.set({
					name : clipboard.name,
					address: clipboard.address,
					description: clipboard.description,
					hintContent: clipboard.name + ' ' + clipboard.address
				});
				if(wst == 1 && item.geometry.getType() == clipboard.gtype){
					item.options.set('preset', clipboard.preset);
				}
			}
		});

		count_objects()
	}

	function loadSessionData(){
		$.ajax({
			url: "/" + controller + "/get_session",
			dataType: "script",
			type: "POST",
			success: function(data){
				//$("#consoleContent").html(data);
				place_freehand_objects(usermap)
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

//	### Actions
	if($("#maphash").val().length == 16){
		loadmap($("#maphash").val());
		$("#mapName").val($("#maphash").val());
	}else{
		loadSessionData();
	}

	$("#coordSetter").click(function(){
		setPointCoordinates();
	});

	$(".circlecoord").blur(function(){
		setCircleCoordinates();
	});

	$(".mapcoord").blur(function(){
		setMapCoordinates();
	});

	$("#cir_radius").keyup(function(){
		setCircleRadius();
	});

	$("#mapFix").click(function(){
		isCenterSet = (isCenterSet == 1) ? 0 : 1;
		(isCenterSet == 1) ? $(".mapcoord").attr('readonly','readonly') : $(".mapcoord").removeAttr('readonly');
		(isCenterSet == 1) ? $(this).html('Отслеживать центр').attr('title','Разрешить перемещать центр') : $(this).html('Фиксировать центр').attr('title','Не перемещать центр');
	});

	$("#mapSave").click(function(){
		saveAll();
	});

	$("#mapLoader").click(function(){
		loadmap($("#mapName").val());
	});

	$("#linkFactory a").click(function(e){
		mode = $(this).attr('pr');
		if(typeof mp == 'undefined'){
			alert("Текущая карта ещё не была обработана.");
			//saveAll();
		}
		if(mode == 1){
			$("#mapLink").val('http://arh.minigis.net/' + controller + '/index/' + mp.ehash);
			$("#mapLinkContainer").removeClass("hide");
		}
		if(mode == 2){
			$("#mapLink").val('http://arh.minigis.net/' + controller + '/index/' + mp.uhash);
			$("#mapLinkContainer").removeClass("hide");
		}
		if(mode == 3){
			e.preventDefault();  //stop the browser from following
			window.location.href = '/' + controller + '/loadscript/' + mp.uhash;
		}
	});

	$("#sessDestroy").click(function(){
		$.ajax({
			url: "/" + controller + "/get_session",
			dataType: "script",
			type: "POST",
			success: function(data){
				a_objects.removeAll();
				e_objects.removeAll();
				//$("#consoleContent").html(data);
				$(".readyMarker").removeClass("icon-ok").addClass("icon-remove");
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	});

	$("#mapReset").click(function(){
		$.ajax({
			url: "/" + controller + "/session_reset",
			dataType: "html",
			type: "POST",
			success: function(data){
				a_objects.removeAll();
				e_objects.removeAll();
				//$("#consoleContent").html(data);
				$(".readyMarker").removeClass("icon-ok").addClass("icon-remove");
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	});
	$("#linkClose").click(function(){
		$("#mapLinkContainer").addClass("hide");
	});
}
//######################################### конец процессора карты #####################################################
//######################################################################################################################
function display_prime() {
	display_locations();
	list_marker_styles();
	list_route_styles();
	list_polygon_styles();
	list_circle_styles();
}

function list_marker_styles(){
	$("#m_style").append($('<optgroup label="Объекты">'));
	for (a in yandex_styles){
		$("#m_style").append($(yandex_styles[a]));
	}
	$("#m_style").append($('</optgroup><optgroup label="объекты">'));
	for (a in yandex_markers){
		$("#m_style").append($(yandex_markers[a]));
	}
}

function list_route_styles(){
	for (a in style_paths){
		$("#line_style").append($('<option value="' + style_paths[a][2] +'">' + style_paths[a][4] + '</option>'));
	}
}

function list_polygon_styles(){
	for (a in style_polygons){
		$("#polygon_style").append($('<option value="' + style_polygons[a][5] +'">' + style_polygons[a][7] + '</option>'));
	}
}

function list_circle_styles(){
	for (a in style_circles){
		$("#circle_style").append($('<option value="' + style_circles[a][7] +'">' + style_circles[a][9] + '</option>'));
	}
}