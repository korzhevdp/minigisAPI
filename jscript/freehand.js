/*
Если вам понравился этот скрипт и вы его захотели утащить к себе...
Наслаждайтесь, что уж тут. Возможно, вам удастся его улучшить качественнее, чем мне.
Прошу о немногом: оставьте в коде упоминание:
 Please, place this author note:
-- Base Project: Minigis.NET --
--     WWW.KORZHEVDP.COM     --
--      Dmitriy Korzhev      --
--    korzhevdp@gmail.com    --
*/
var map = {},
	a_objects,
	e_objects,
	api_url       = 'http://api.korzhevdp.com',
	controller    = '/freehand',
	mp = {},
	clipboard     = { name: '', description: '', address: '', preset: '', gtype: "Point" },
	gIcons = {
		"Point"      : 'marker.png',
		"LineString" : 'layer-shape-polyline.png',
		"Polygon"    : 'layer-shape-polygon.png',
		"Circle"     : 'layer-shape-ellipse.png'
	},
	geoType2IntId = {
		"Point"			: 1,
		"LineString"	: 2,
		"Polygon"		: 3,
		"Circle"		: 4,
		"Rectangle"		: 5
	},
	intId2GeoType = {
		1 : "Point",
		2 : "LineString",
		3 : "Polygon",
		4 : "Circle",
		5 : "Rectangle"
	},
	mframes = [];

ymaps.ready(setup_environment);

function setup_environment() {
	styleAddToStorage(userstyles);
	list_marker_styles();
	list_route_styles();
	list_polygon_styles();
	list_circle_styles();
	display_locations();
}

//######################################### процессор карты #########################################################
function display_locations(){
	dX = [];
	//определение механизма пересчёта стандартной сетки тайлов в сетку тайлов Яндекс-карт
	for (var a=0; a < 21; a++){ dX[a] = Math.pow(2, a) - 1; }
	//api_url = (typeof $("#api_url") != 'undefined' && $("#api_url").val().length) ? $("#api_url").val() : "http://api.korzhevdp.com",
	var current_type = $("#current_type").val(),
	map_center   = $("#map_center").val(),
	current      = (typeof(current) != 'undefined')     ? current : $('#location_id').val(),
	lon          = (isNaN(ymaps.geolocation.longitude)) ? parseFloat(map_center.toString().split(",")[0]) : ymaps.geolocation.longitude,
	lat          = (isNaN(ymaps.geolocation.latitude))  ? parseFloat(map_center.toString().split(",")[1]) : ymaps.geolocation.latitude,
	current_zoom = ($("#current_zoom").val().length)    ? $("#current_zoom").val() : 15,
	typeSelector = new ymaps.control.TypeSelector(),
	forIFrame    = 0,
	tileServerID = parseInt(Math.random() * (4-1) + 1).toString();
	tileServerLit= { "0": "a","1": "b","2": "c","3": "d","4": "e","5": "f" },
	layerTypes   = {
		0: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/nm/base/",
			label : "base#arch",
			name  : "Нарьян-Мар 1943 HD",
			layers: ['yandex#satellite', "base#arch"]
		},
		1: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[1].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/1990/",
			label : "base2#arch",
			name  : "Архангельск. План 1998 года",
			layers: ['yandex#satellite', "base2#arch"]
		},
		2: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[2].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/arch1940/base/",
			label : "base3#arch",
			name  : "Архангельск. 1941-43 гг. Стандартное разрешение",
			layers: ['yandex#satellite', "base3#arch"]
		},
		3: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[3].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/arch1940/centerhr/",
			label : "base4#arch",
			name  : "Архангельск. 1941-43 гг. Центр. Высокое разрешение",
			layers: ['yandex#satellite', "base3#arch", "base4#arch"]
		},
		4: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[4].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/arch1940/farnorth/",
			label : "base5#arch",
			name  : "Архангельск. 1941-43 гг. Север, фрагменты. Высокое разрешение",
			layers: ['yandex#satellite', "base3#arch", "base5#arch"]
		},
		5: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[5].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk041/",
			label : "base#molot",
			name  : "Молотовск и окрестности 25.04.1943 г.",
			layers: ['yandex#satellite', "base#molot"]
		},
		6: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[6].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk040/",
			label : "base#molot2",
			name  : "Молотовск, центр города 25.04.1943 г.",
			layers: ['yandex#satellite', "base#molot", "base#molot2"]
		},
		7: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[7].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk042/",
			label : "base#molot3",
			name  : "Молотовск. Завод. 8.07.1943 г.",
			layers: ['yandex#satellite', "base#molot", "base#molot3"]
		},
		8: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[8].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "Molotowsk044/",
			label : "base#molot4",
			name  : "Молотовск. Завод. Ягры. 15.08.1943 г.",
			layers: ['yandex#satellite', "base#molot", "base#molot4"]
		},
		9: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[9].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk049/",
			label : "base#molot5",
			name  : "Молотовск. Завод. 15.08.1943 г.",
			layers: ['yandex#satellite', "base#molot5"]
		},
		10: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://mt" + tileServerID + ".google.com/vt/lyrs=m&hl=ru&x=" + tile[0] + "&y=" + tile[1] + "&z=" + zoom + "&s=Galileo";}, {tileTransparent: 1, zIndex:1000});},
			folder: "",
			label : "satellite#google",
			name  : "Гуглотест",
			layers: ["satellite#google"]
		},
		11: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://" + tileServerLit[tileServerID] + ".tile.openstreetmap.org/" + zoom + "/" + tile[0] + "/" + tile[1] + ".png";}, {tileTransparent: 1, zIndex:1000});},
			folder: "",
			label : "map#osm",
			name  : "OSMтест",
			layers: ["map#osm"]
		}
	},
	counter      = 0,
	object_gid   = $("#gCounter").val(),
	isCenterSet  = 1,
	a_objects    = new ymaps.GeoObjectArray(),
	e_objects    = new ymaps.GeoObjectArray();
	//ex_objects    = new ymaps.GeoObjectArray(), //--B2

	// создаём слои наложения для карты
	for(a in layerTypes){
		ymaps.layer.storage.add(layerTypes[a].label, layerTypes[a].func);
		ymaps.mapType.storage.add(layerTypes[a].label, new ymaps.MapType(
			layerTypes[a].name, layerTypes[a].layers
		));
		typeSelector.addMapType(layerTypes[a].label, a);
	}

	map = new ymaps.Map("YMapsID", {
		center: (map_center.length) ? [ parseFloat(map_center.split(",")[1]), parseFloat(map_center.split(",")[0]) ] : [lon, lat],
		zoom: current_zoom,
		type: current_type,
		behaviors: ["scrollZoom", "drag", "dblClickZoom"]
	},
	{
		projection: ymaps.projection.sphericalMercator
	});

	/* назначаем курсор-стрелку для улучшенного позиционирования */
	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	/* ViewPort data fields */
	viewPort = {
		frame: 1,
		c_c: [ map.getCenter()[0].toFixed(8), map.getCenter()[1].toFixed(8) ],
		zoom: 13,
		c_Type: 'yandex#satellite'
	}

	$("#vp_frame").val(1);
	$("#vp_lon").val(map.getCenter()[0].toFixed(8));
	$("#vp_lat").val(map.getCenter()[1].toFixed(8));
	$("#current_obj_type").val("Point");


	// ##### настройка представления карты #####
	searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap'});

	map.controls.add('zoomControl').add(typeSelector).add('mapTools').add(searchControl);
	typeSelector.removeMapType('yandex#publicMapHybrid');
	typeSelector.removeMapType('yandex#hybrid');
	typeSelector.removeMapType('yandex#publicMap');
	//$(".ymaps-b-form-input__input").empty().attr("placeholder", ymaps.geolocation.city);

	// ##### Шаблоны #####
	var genericBalloon = ymaps.templateLayoutFactory.createClass(
		'<div class="ymaps_balloon row-fluid">' +
		'<div class="gallery span2" id="l_photo" data-toggle="modal" picref=$[properties.ttl|0] href="#modal_pics">' +
		'<img src="' + api_url + '/images/$[properties.img|nophoto.gif]" style="margin:3px;" ALT="мини" id="sm_src_pic">' +
		'</div>' +
		'<span style="margin-right:10px;font-weight:bold;">Название:</span> $[properties.name|без имени]<br>' +
		'<span style="margin-right:30px;font-weight:bold;">Адрес:</span> $[properties.address|нет]<br>' +
		'<span style="margin-right:10px;font-weight:bold;">Описание:</span> $[properties.description|без описания]<br>' +
		'<div><a href="$[properties.link|#]" style="margin:3px;margin-top:16px;" class="btn btn-mini btn-block" target="_blank">Подробности здесь</a></div>' +
		'<div class="pull-right" style="margin-top:20px;">' +
		'<button type="button" class="btn btn-mini btn-primary sw-edit" ttl="$[properties.ttl|0]" style="margin-right:10px;">Редактировать </button>' +
		'<button type="button" class="btn btn-mini btn-info balloonClose" style="margin-right:10px;">Закрыть</button>' +
		'</div></div>'
		),
		iframeBalloon = ymaps.templateLayoutFactory.createClass(
		'<div class="ymaps_balloon_iframed">' +
		'<iframe src="$[properties.link|]" width="400" height="400" style="border:none;margin:0;padding:0;"></iframe>' +
		'<div><a href="$[properties.link|#]" style="margin:3px;margin-top:16px;" class="btn btn-mini btn-block" target="_blank">Подробности здесь</a></div>' +
		'<div class="pull-right" style="margin-top:20px;">' +
		'<button type="button" class="btn btn-mini btn-primary sw-edit" ttl="$[properties.ttl|0]" style="margin-right:10px;">Редактировать </button>' +
		'<button type="button" class="btn btn-mini btn-info balloonClose" style="margin-right:10px;">Закрыть</button>' +
		'</div></div>'
		),
		editBalloon = ymaps.templateLayoutFactory.createClass(
		'<div class="ymaps_balloonX row-fluid">' +
		'<span class="span3" style="margin-left:0px;">Название:</span><input type="text" id="bal_name" class="span9 input-mini" value="$[properties.name|без имени]">'+
		'<span class="span3" style="margin-left:0px;">Адрес:</span><input type="text" id="bal_addr" class="span9 input-mini" value="$[properties.address|нет]">' +
		'<span class="span3" style="margin-left:0px;">Ссылка:</span><input type="text" id="bal_link" class="input-mini span9" placeholder="Ссылка на web-страницу или изображение" value="$[properties.link|#]">' +
		'<span class="span3" style="margin-left:0px;">Описание:</span><textarea id="bal_desc" rows="6" cols="6" class="span12">$[properties.description|нет]</textarea>' +
		'<!-- <a href="#" id="editX" class="btn btn-small btn-block editX" ttl="$[properties.ttl|0]">Расширенное редактирование</a> -->' +
		'<div class="pull-right">' +
		'<button type="button" class="btn btn-mini btn-primary sw-finish" ttl="$[properties.ttl|0]" style="margin-right:10px;">Готово</button>' +
		'<button type="button" class="btn btn-mini btn-danger sw-del" ttl="$[properties.ttl|0]" style="margin-right:10px;">Удалить</button>' +
		'<button type="button" class="btn btn-mini btn-info balloonClose">Закрыть</button>' +
		'</div></div>'
		);
	/*--B2
	var editxBalloon = ymaps.templateLayoutFactory.createClass(
	'<div class="ymaps_balloonX row-fluid">' +
	'<div><span class="editx_label">Название:</span><input type="text" style="margin-left:5px;" id="bal_name" value="$[properties.name|без имени]"></div>'+
	'<div><span class="editx_label">Адрес:</span><input type="text" style="margin-left:30px;" id="bal_addr" value="$[properties.address|нет]"></div>' +
	'<div id="editXtgt"><span class="editx_label">Описание:</span></div>' +
	'<a href="$[properties.link|ссылка]" style="margin-bottom:10px;"><u>Подробности здесь</u></a>' +
	'<hr><div class="pull-right">' +
	'<button type="button" class="btn btn-small btn-primary sw-finish" ttl="$[properties.ttl|0]" style="margin-right:10px;">Готово</button>' +
	'<button type="button" class="btn btn-small btn-danger sw-del" ttl="$[properties.ttl|0]" style="margin-right:10px;">Удалить</button>' +
	'<button type="button" class="btn btn-small btn-info balloonClose">Закрыть</button>' +
	'</div></div>'
	);
	*/
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	ymaps.layout.storage.add('editing#balloonLayout', editBalloon);
	ymaps.layout.storage.add('iframe#balloonLayout' , iframeBalloon);
	//ymaps.layout.storage.add('editingx#balloonLayout', editxBalloon); //--B2

	a_objects.options.set({
		balloonContentBodyLayout: (forIFrame) ? 'iframe#balloonLayout' : 'generic#balloonLayout',
		balloonMaxWidth:  800,
		balloonMaxHeight: 800
	});

	e_objects.options.set({
		balloonContentBodyLayout: 'editing#balloonLayout',
		balloonWidth: 800
	});
	/*--B2
	ex_objects.options.set({
		balloonContentBodyLayout: 'editingx#balloonLayout',
		//balloonMaxWidth: 300
	});
	*/
	// ##### события #####
	// карта
	map.events.add('balloonopen', function (){
		$('#upload_location').val($('#l_photo').attr('picref'));
		action_listeners_add();
	});

	/*
	map.events.add('balloonclose', function (){
		//carousel_destroy();
	});
	*/

	map.events.add('boundschange', function (data){
		if(!isCenterSet){
			$("#vp_lon").val(data.get('newCenter')[0].toFixed(8)); // сохраняем в поле новое значение центра карты
			$("#vp_lat").val(data.get('newCenter')[1].toFixed(8)); // сохраняем в поле новое значение центра карты
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

	map.events.add('contextmenu', function (e){
		coords = e.get('coordPosition');
		ymaps.geocode(coords,{kind: ['house']}).then(function (res) {
			var names = [];
			res.geoObjects.each(function (obj) {
				names.push(obj.properties.get('name'));
			});
			valtz = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса"; [names[0]].join(', ');
			map.balloon.open(coords, {
				contentBody: '<div class="ymaps_balloon row-fluid"><input type="text" value="' + [ coords[0].toPrecision(8), coords[1].toPrecision(8)].join(', ') + '"><br>' + valtz + '</div>'});
		});
	});

	e_objects.events.add('dragend', function(e){
		var object = e.get('target');
		traceNode(object);
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
	// ###### конец описания событий

	map.geoObjects.add(a_objects);
	map.geoObjects.add(e_objects);
	//map.geoObjects.add(ex_objects); //--B2
	//sendMap();



	//################################## выносные функции

	function action_listeners_add(){

		$(".balloonClose").unbind().click(function(){
			map.balloon.close();
		});

		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			$(".sw-edit").addClass("hide");
			return false;
		}

		$(".sw-finish").unbind().click(function(){
			doFinish(this);
			nullTracers();
			counter = 0;
			map.balloon.close();
			count_objects();
		});

		$(".sw-edit").unbind().click(function(){
			doEdit(this);
			count_objects();
			counter = 1;
		});

		$(".sw-del").unbind().click(function(){
			doDelete(this);
			nullTracers();
			counter = 0;
			map.balloon.close();
			count_objects();
		});

		$(".copyProp").unbind().click(function(){
			toClipboard(this);
		});

		$(".pasteProp").unbind().click(function(){
			fromClipboard(this,0);
		});

		$(".pastePropOpt").unbind().click(function(){
			fromClipboard(this,1);
		});

		/*
		$(".editX").unbind().click(function(e){
			e.preventDefault();
			m = $(this).attr('ttl');
			//alert(m);
			e_objects.each(function(item){
				//alert([item.properties.get('ttl'), m].join(" -+- "));
				if(item.properties.get('ttl') == m){
					map.balloon.close();
					ex_objects.add(item);
					item.balloon.open(item.geometry.getCoordinates());
					CKEDITOR.appendTo( 'editXtgt',{
						contentsCss: api_url + '/bootstrap/css/bootstrap.css',
						skin : 'v2',
						filebrowserBrowseUrl : '/dop/browser/images',
						filebrowserUploadUrl : '/dop/uploader/files',
						toolbar_Basic : [
							[ 'Bold', 'Italic', '-', 'Format', 'Image', 'Table' ]
						],
						toolbar : 'Basic',
						height:220,
						format_tags: 'p;h1;h2;h3;h4;h5;h6;pre;address;div;well',
						format_well: { name: 'well', element : 'div', attributes : { 'class' : 'well well-small' } }
					})
				}
			})
		});
		*/
	}

	function apply_preset(src){
		e_objects.each(function(item){
			if (item.geometry.getType() == $("#current_obj_type").val()){
				item.options.set( ymaps.option.presetStorage.get(src) );	// назначение стиля в опции.
				item.properties.set( { attr: src } );			// параллельная запись определения в свойства.
				sendObject(item);
			}
		});
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
			url: "/ajaxutils/getimagelist/",
			data: {
				picref: $('#l_photo').attr('picref')
			},
			type: "POST",
			cache: false,
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

	function count_objects(){
		$("#ResultBody, #nowEdited").empty();
		//alert(a_objects.getLength())
		a_objects.each(function(item){
			$("#ResultBody").append(genListItem(item.properties.get('ttl'), item.properties.get('name'), item.properties.get('address'), gIcons[ item.geometry.getType() ]));
		});
		//alert(e_objects.getLength())
		e_objects.each(function(item){
			$("#nowEdited").append(genListItem(item.properties.get('ttl'), item.properties.get('name'), item.properties.get('address'), gIcons[ item.geometry.getType() ]));
		});

		$(".mg-btn-list").click(function(){
			ttl = $(this).attr("ttl");
			a_objects.each(function(item){
				if(item.properties.get("ttl") == ttl){
					item.balloon.open(item.geometry.getCoordinates());
				}
			});
			e_objects.each(function(item){
				if(item.properties.get("ttl") == ttl){
					item.balloon.open( item.geometry.getCoordinates() );
					openEditPane( item.geometry.getType() );
				}
			});
		});
		action_listeners_add();
	}

	function doDelete(src){
		ttl = $(src).attr('ttl');
		e_objects.each(function(item){
			if (item.properties.get('ttl') == ttl){
				e_objects.remove(item);
			}
		});
		a_objects.each(function(item){
			if (item.properties.get('ttl') == ttl){
				a_objects.remove(item);
			}
		});
		$.ajax({
			url: controller + "/obj_delete",
			data: {
				ttl: ttl
			},
			type: "POST",
			success: function(data){
				//alert(data);
				//$("#consoleContent").html(data);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
			}
		});
	}

	function doEdit(src){
		var ttl = (typeof $(src).attr('ttl') == 'undefined') ? src.properties.get('ttl') : $(src).attr('ttl');
		$("#location_id").val(ttl); // здесь строка
		map.balloon.close();
		a_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				//alert(item.properties.getAll().toSource());
				item.options.set({ zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1 });
				if(item.options.get('draggable') == 0){
					item.options.set( { draggable: 1 } );
				}

				type = item.geometry.getType();							// получаем YM тип геометрии объекта
				e_objects.add(item);									// переводим объект в группу редактируемых
				item.balloon.open(item.geometry.getCoordinates());

				if(e_objects.getLength() > 1){ // нет особого смысла задавать вручную координаты точек, если их для редактирования выбрано больше чем одна. Отключаем поля
					$(".pointcoord, .circlecoord").attr('disabled','disabled');
				}

				if(type == "LineString" || type == "Polygon"){
					item.editor.startEditing();
				}

				item.options.set({ draggable: 1, zIndex: 300, zIndexActive: 300, zIndexDrag: 300, zIndexHover: 300 });
				openEditPane(type); // открываем требуемую панель редактора
				traceNode(item);
			}
		});
		action_listeners_add();
	}

	function doFinish(src){
		var addr = $("#bal_addr").val(),
			desc = $("#bal_desc").val(),
			link = $("#bal_link").val(),
			name = $("#bal_name").val(),
			ttl  = $(src).attr('ttl');
		e_objects.each(function(item){
			if (item.properties.get('ttl') == ttl){
				item.properties.set( {
					description : desc,
					address     : addr,
					name        : name,
					link        : link,
					hintContent : name + ' ' + addr
				} );
				a_objects.add(item);
				item.options.set({
					draggable   : 0,
					zIndex      : 1,
					zIndexActive: 1,
					zIndexDrag  : 1,
					zIndexHover : 1,
					strokeStyle : 'solid'
				});
				sendObject(item);
			}
		});
		/*--B2
		ex_objects.each(function(item){
			if (item.properties.get('ttl') == ttl){

				item.properties.set( {description: desc, address: addr, name: name, hintContent: name + ' ' + addr} );
				a_objects.add(item);
				item.options.set({ draggable: 0, zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1, strokeStyle: 'solid' });
				sendObject(item);
			}
		});
		*/
		if(e_objects.getLength() < 2){
			$(".pointcoord, .circlecoord").removeAttr('disabled');
		}
	}

	function doFinishAll(){
		while (e_objects.getLength() > 0){
			e_objects.each(function(item){
				a_objects.add(item);
				item.options.set({draggable: 0, zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1, strokeStyle: 'solid'});
			});
		}
		/*--B2
		while (ex_objects.getLength() > 0){
			ex_objects.each(function(item){
				a_objects.add(item);
				item.options.set({draggable: 0, zIndex: 1, zIndexActive: 1, zIndexDrag: 1, zIndexHover: 1, strokeStyle: 'solid'});
			});
		}
		*/
		//e_objects.removeAll();
		count_objects();
	}

	function draw_object(click){
		var names = [],
			valtz = '',
			coords = click.get('coordPosition');
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		if(counter){
			if(confirm("На карте присутствуют редактируемые объекты.\nЗавершить их редактирование и создать новый объект?")){
				doFinishAll();
			}else{
				return false;
			}
		}

		ymaps.geocode(coords,{kind: ['house']})
		.then(function(res) {
			res.geoObjects.each(function (obj) {
				names.push(obj.properties.get('name'));
			});
			valtz = names[0];
		})
		.then(function(coords){
			var decAddr			= (typeof valtz != "undefined" || [valtz].join(', ').length > 0) ? [valtz].join(', ') : "Нет адреса",
				pr_type			= geoType2IntId[$("#current_obj_type").val()],
				styleLine		= $('#line_style').val(),
				stylePolygon	= $('#polygon_style').val(),
				styleCircle		= $('#circle_style').val();
			properties = {
				attr: $('#m_style').val(),
				contact: "",
				frame: parseInt($('#vp_frame').val()),
				description: decAddr ,
				ttl: ++object_gid,
				hintContent: decAddr,
				img: "nophoto.gif",
				address: decAddr,
				name: "Название"
			};
			switch (pr_type){
				case 0 :
					alert("Ошибка в декодировании типа. 0 не является допустимым типом");
				break;
				case 1 : // точка
					var style_id	= ($('#m_style').val() != 'Null') ? $('#m_style').val() :  "twirl#redDotIcon", // некорректно!!! исправить. Аналогично во всех 4
						geometry	= { type: "Point", coordinates: click.get('coordPosition') },
						options		= ymaps.option.presetStorage.get(style_id),
						object		= new ymaps.Placemark(geometry, properties, options);
					e_objects.add(object);
					counter++;
					object.properties.set( {preset: style_id} );
					object.options.set({draggable: 1});
					traceNode(object);
				break;
				case 2 :
					var style_id	= ($('#line_style').val() != 'Null') ? $('#line_style').val() : "routes#default",
						geometry	= {type: 'LineString', coordinates: [click.get('coordPosition')]},
						options		= ymaps.option.presetStorage.get(style_id),
						object		= new ymaps.Polyline(geometry, properties, options);
					e_objects.add(object);
					object.editor.startDrawing();
					object.properties.set( {preset: style_id} );
					object.options.set({draggable: 1});
					counter++;
					sendObject(object);
				break;
				case 3 :
					var style_id = ($('#polygon_style').val() != 'Null') ? $('#polygon_style').val() : "area#default",
						geometry = {type: 'Polygon',coordinates: [[click.get('coordPosition')]]},
						options  = ymaps.option.presetStorage.get(style_id),
						object   = new ymaps.Polygon(geometry, properties, options);
					e_objects.add(object);
					object.editor.startDrawing();
					object.properties.set( {preset: style_id} );
					object.options.set({draggable: 1});
					sendObject(object);
					counter++;
				break;
				case 4 :
					var style_id = ($('#circle_style').val() != 'Null') ? $('#circle_style').val() : "circle#default",
						geometry = [click.get('coordPosition'),$("#cir_radius").val()],
						options  = ymaps.option.presetStorage.get(style_id),
						object   = new ymaps.Circle(geometry, properties, options);
					object.properties.set( {preset: style_id} );
					object.options.set( {draggable: 1} );
					traceNode(object);
					e_objects.add(object);
					counter++;
					//sendObject(object);
				break;
			}
			//alert(frm);
			$('#location_id').val(object_gid);
			count_objects();
		});
	}

	function fromClipboard(src, wst){
		/*
		вставка данных из локального буфера обмена
		*/
		var ttl = $(src).attr('ttl');
		e_objects.each(function(item){
			if(ttl == item.properties.get('ttl')){
				item.properties.set({
					name : clipboard.name,
					address: clipboard.address,
					description: clipboard.description,
					hintContent: clipboard.name + ' ' + clipboard.address
				});
				if(wst == 1 && item.geometry.getType() == clipboard.gtype){
					item.options.set( ymaps.option.presetStorage.get(clipboard.preset) );
					item.properties.set( {preset: clipboard.preset} );
				}
			}
		});
		a_objects.each(function(item){
			if(ttl == item.properties.get('ttl')){
				item.properties.set({
					name :			clipboard.name,
					address:		clipboard.address,
					description:	clipboard.description,
					hintContent:	clipboard.name + ' ' + clipboard.address
				});
				if(wst == 1 && item.geometry.getType() == clipboard.gtype){
					item.options.set( ymaps.option.presetStorage.get(clipboard.preset) );
					item.properties.set( { preset: clipboard.preset } );
				}
			}
		});
		count_objects();
	}

	function genListItem(ttl, name, address, pic) { //динамически генерируемый чанк
		return string = '<div class="btn-group">'
			+ '<button class="btn btn-mini mg-btn-list" ttl=' + ttl + '>'
			+ '<img src="' + api_url + '/images/' + pic + '" alt="">' + 'Название: ' + name + '<br>'
			+ 'Адрес: ' + address
			+ '</button>'
			+ '<button class="btn dropdown-toggle" data-toggle="dropdown" style="height:55px;">'
				+ '<span class="caret"></span>'
			+ '</button>'
			+ '<ul class="dropdown-menu">'
				+ '<li><a href="#" class="copyProp" ttl=' + ttl + '><i class="icon-upload"></i> Скопировать свойства</a></li>'
				+ '<li><a href="#" class="pasteProp" ttl=' + ttl + ' title="Вставить свойства"><i class="icon-download"></i> Вставить свойства</a></li>'
				+ '<li><a href="#" class="pastePropOpt" ttl=' + ttl + ' title="Вставить свойства и оформление"><i class="icon-download-alt"></i> Вставить всё</a></li>'
				+ '<li><a href="#" class="sw-del" ttl=' + ttl + '><i class="icon-trash"></i> Удалить объект</a></li>'
			+ '</ul>'
		+ '</div>';
	}

	function hide_frame(frame){
		/*
			функция переключения фрейма
			фреймы пока упразднены, с их наследием надо разобраться
		*/
		mframes[frame].removeAll();
		while(geoObject = a_objects.get(0)) {
			mframes[frame].add(geoObject);
		}
		while(geoObject = e_objects.get(0)) {
			mframes[frame].add(geoObject);
		}
	}

	function length_calc(src){
		/*
			расчёт длины ломаной методом прибавления дельты.
			в цикле прибавляется дельта дистанции между вершинами (WGS84)
		*/
		if(src.length < 2){
			return 0;
		}
		var routelength = 0,
			next		= 0,
			start		= [],
			end			= [],
			delta		= 0;
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

	function loadmap(name){
		$.ajax({
			url: controller + "/loadmap",
			type: "POST",
			data: {
				name: name
			},
			dataType: "script",
			success: function(data){
				a_objects.removeAll();
				e_objects.removeAll();
				if(typeof usermap != 'undefined' && typeof usermap.error == 'undefined'){
					place_freehand_objects(usermap);
				}else{
					console.log(usermap.error);
				}
				if(typeof mp != 'undefined'){
					(mp.id == 'void')
						? $("#mapSave, #ehashID, #SContainer").css('display',"none")
						: $("#mapSave, #ehashID, #SContainer").css('display',"block");
					map.setType(mp.maptype);
					map.setZoom(mp.zoom);
					//?????
					map.panTo(mp.c); //,{ callback: function(err){}, checkZoomRange:1, duration:1000};
					if(mp.indb){
						//$(".readyMarker").removeClass("icon-remove").addClass("icon-ok");
					}
				}
				count_objects();
				lock_center();
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
				alert([data,stat,err].join("\n"));
			}
		});
	}

	function loadSessionData(){
		/*
		загрузка данных сессии
		*/
		$.ajax({
			url: controller + "/get_session",
			dataType: "script",
			type: "POST",
			success: function(data){
				place_freehand_objects(usermap);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
				alert([data,stat,err].join("\n"));
			}
		});
	}

	function nullPlacemarkTracer(){
		$("#m_lon").val('');
		$("#m_lat").val('');
	}

	function nullTracers(){
		/*
		обнуление всех полей навигатора
		*/
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

	function openEditPane(type){
		intType = geoType2IntId[type];
		$("#current_obj_type").val(type);
		$(".obj_sw").removeClass("active");
		$(".obj_sw[pr=" + intType + "]").addClass("active");
		$(".navigator-pane").addClass("hide");
		$("#navigator-pane" + intType).removeClass("hide");
		$("#navheader > li").removeClass("active");
		$("#palette").addClass("active");
		$('#results').removeClass('active');
		$('#mainselector').addClass('active');
	}

	function perimeter_calc(src){
		/*
			расчёт длины периметра полигона методом прибавления дельты.
			в цикле прибавляется дельта дистанции между вершинами (WGS84)
			расчёт периметра геометрии, как сумма всех периметров геометрии, в том числе и внутренние границы
		*/
		if(src[0].length < 2){
			return 0;
		}
		var routelength = 0,
			next = 0,
			start = [],
			end = [],
			delta = 0;
		for(var j = 0; j < src.length; j++){
			for (var i=0; i < (src[j].length - 1); i++){
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

	function place_freehand_objects(source){
		for (b in source){
			var src = source[b],
			frm = (typeof src.frame != 'undefined') ? parseInt(src.frame) : 1,
			properties = {
				attr: src.a,
				description: src.d,
				address: src.b,
				hintContent: src.n + ' ' + src.d,
				img: src.img,
				frame: frm,
				link: src.l,
				name: src.n,
				ttl: b
			};
			if(typeof mframes[frm] == 'undefined') {
				mframes[frm] = new ymaps.GeoObjectArray();
			}
			if(src.p == 1){
				var geometry = src.c.split(","),
					options = { preset: src.a },
					object = new ymaps.Placemark(geometry, properties, options);
			}
			if(src.p == 2){
				var geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(src.c),
					options = { preset: src.a },
					object = new ymaps.Polyline(geometry, properties, options);
			}
			if(src.p == 3){
				var geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(src.c),
					options = { preset: src.a },
					object = new ymaps.Polygon(geometry, properties, options);
			}
			if(src.p == 4){
				var geometry = new ymaps.geometry.Circle([parseFloat(src.c.split(",")[0]), parseFloat(src.c.split(",")[1])], parseFloat(src.c.split(",")[2])),
					options = { preset: src.a },
					object = new ymaps.Circle(geometry, properties, options);
			}
			mframes[frm].add(object);
		}
		count_objects();
		//alert(mframes.length)

		frc = 1;
		for (a in mframes){
			if (a > frc){
				frc = a;
			}
		}
		for (a = 1; a <= frc; a++){
			if(typeof mframes[a] == 'undefined'){
				mframes[a] = new ymaps.GeoObjectArray();
			}
		}
		frm = (typeof mframes[$("#vp_frame").val()] != 'undefined' ) ? $("#vp_frame").val() : mframes.length - 1;
		//alert (frm)
		while(geoObject = mframes[frm].get(0)) {
			a_objects.add(geoObject);
		}
		map.geoObjects.add(a_objects);
		map.geoObjects.add(e_objects);

		//alert(a_objects.getLength());
	}

	function saveAll(){
		/*
		сохранение в базу данных
		*/
		doFinishAll();
		$.ajax({
			url: controller + "/savedb",
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
				alert([data,stat,err].join("\n"));
			}
		});
	}

	function sendMap(){
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		$.ajax({
			url: controller + "/savemap",
			type: "POST",
			data: {
				maptype: map.getType(),
				center: [ $("#vp_lat").val(), $("#vp_lon").val() ],
				zoom: map.getZoom()
			},
			datatype: "text",
			success: function(data){
				//$("#consoleContent").html(data);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
				alert([data,stat,err].join("\n"));
			}
		});
	}

	function sendObject(item){
		/*
			отправка объекта на сервер
		*/
		if(typeof mp != 'undefined' && typeof mp.id != 'undefined' && mp.id == 'void'){
			return false;
		}
		// конверсия строкового типа во внутренний
		type = geoType2IntId[ item.geometry.getType() ];
		switch (type){
			case 1:
				geometry = item.geometry.getCoordinates();
			break;
			case 2:
				geometry = ymaps.geometry.LineString.toEncodedCoordinates(item.geometry);
			break;
			case 3:
				geometry = ymaps.geometry.Polygon.toEncodedCoordinates(item.geometry);
			break;
			case 4:
				geometry = [ item.geometry.getCoordinates(), item.geometry.getRadius() ];
			break;
		}

		$.ajax({
			url: controller + "/save",
			type: "POST",
			data: {
				id :		item.properties.get('ttl'),
				type:		type,
				geometry:	geometry,
				attr:		item.properties.get('attr'),
				desc:		item.properties.get('description'),
				address:	item.properties.get('address'),
				link:		item.properties.get('link'),
				name:		item.properties.get('name'),
				frame:		parseInt($("#vp_frame").val())
			},
			success: function(data){
				//$("#consoleContent").html(data);
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
				alert([data,stat,err].join("\n"));
			}
		});
	}

	function setCircleCoordinates(){
		/*
			ручной ввод параметров центра геометрии круга из полей навигатора
		*/
		var ttl = $('#location_id').val();
		e_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				item.geometry.setCoordinates([parseFloat($("#cir_lon").val()), parseFloat($("#cir_lat").val())]);
				traceNode(item);
			}
		});
	}

	function setCircleRadius(){
		/*
			ручной ввод параметра радиуса геометрии круга из поля навигатора
		*/
		var ttl = $('#location_id').val();
		e_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				item.geometry.setRadius(parseFloat($("#cir_radius").val()));
				traceNode(item);
			}
		});
	}

	function setMapCoordinates(){
		/*
			ручной ввод параметров центра карты из полей навигатора
		*/
		map.setCenter([parseFloat($("#vp_lon").val()), parseFloat($("#vp_lat").val())], parseInt($("#current_zoom").val()));
	}

	function setPointCoordinates(){
		/*
			ручной ввод параметров геометрии точки из полей навигатора
		*/
		var ttl = $('#location_id').val();
		e_objects.each(function(item){
			if(item.properties.get('ttl') == ttl){
				item.geometry.setCoordinates([parseFloat($("#m_lon").val()), parseFloat($("#m_lat").val())]);
			}
		});
	}

	function show_frame(frm){
		/*
			функция переключения фрейма
		*/
		while(geoObject = mframes[frm].get(0)) {
			a_objects.add(geoObject);
		}
		map.geoObjects.add(a_objects);
		//map.geoObjects.add(e_objects);
	}

	function style_list(){
		for (a in style_src){
			$("#m_style").append($('<option value="' + style_src[a][2] + '">' + style_src[a][3] + '</option>'));
		}
	}

	function toClipboard(src){
		/*
			помещение данных в локальный буфер обмена
		*/
		var ttl = $(src).attr('ttl');
		e_objects.each(function(item){
			if(ttl == item.properties.get('ttl')){
				clipboard = {
					name:			item.properties.get('name'),
					address:		item.properties.get('address'),
					description:	item.properties.get('description'),
					preset:			item.properties.get('preset'),
					gtype:			item.geometry.getType()
				};
			}
		});
		a_objects.each(function(item){
			if(ttl == item.properties.get('ttl')){
				clipboard = {
					name:			item.properties.get('name'),
					address:		item.properties.get('address'),
					description:	item.properties.get('description'),
					preset:			item.properties.get('preset'),
					gtype:			item.geometry.getType()
				};
			}
		});
		count_objects();
	}

	function traceNode(src){
		/*
		заполнение полей навигатора характеристиками текущего редактируемого объекта
		*/
		var type   = src.geometry.getType(),
			coords = src.geometry.getCoordinates(),
			desc   = src.properties.get("description"),
			cstyle = src.properties.get("attr");
		// заполнение в соответствии с типом геометрии объекта
		switch (type){
			case "Point" :
				// запрос адреса
				ymaps.geocode(coords,{ kind: ['house'] })
				.then(function (res) {
					names = [];
					res.geoObjects.each(function (obj) {
						names.push(obj.properties.get('name'));
					});
					valtz = names[0];
					valtz = (typeof valtz != "undefined" || [valtz].join(', ').length > 0) ? [valtz].join(', ') : "Нет адреса";
					src.properties.set({hintContent: valtz, address: valtz});
					sendObject(src);
					count_objects();
				});
				$("#m_lon").val(parseFloat(coords[0]).toFixed(8));
				$("#m_lat").val(parseFloat(coords[1]).toFixed(8));
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
				$("#cir_lon").val(coords[0].toFixed(8));
				$("#cir_lat").val(coords[1].toFixed(8));
				$("#cir_radius").val(radius);
				$("#cir_len").html((radius * 2 * Math.PI).toFixed(2));
				$("#cir_field").html((Math.pow(radius,2) * Math.PI).toFixed(2));
				$('#circle_style [value="' + cstyle + '"]').attr("selected", "selected");
			break;
		}
	}

	$("#m_style, #line_style, #polygon_style, #circle_style").change(function(){
		var id = $(this).attr("id"),
			val = $(this).val();
		e_objects.each(function(item){
			type = item.geometry.getType();
			//console.log(type, id, val);
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

	$("#mapLoader").click(function(){
		loadmap($("#mapName").val());
	});

	$("#mapSave").click(function(){
		saveAll();
	});

	// установка параметров круга
	$(".circlecoord").blur(function(){
		setCircleCoordinates();
	});

	$("#cir_radius").keyup(function(){
		setCircleRadius();
	});

	// последняя функция процессора карты - загрузка карты по id из строки браузера #################################
	if($("#maphash").val().length == 16){
		loadmap($("#maphash").val());
		$("#mapName").val($("#maphash").val());
	}else{
		loadSessionData();
	}
}
//######################################### конец процессора карты #####################################################
//######################################################################################################################

function lock_center(){
	(isCenterSet) ? $(".mapcoord").attr('readonly','readonly') : $(".mapcoord").removeAttr('readonly');
	(isCenterSet) ? $(this).html('Отслеживать центр').attr('title','Разрешить перемещать центр') : $(this).html('Фиксировать центр').attr('title','Не перемещать центр');
}

// события не-карты
$(".obj_sw").click(function(){
	$("#current_obj_type").val(intId2GeoType[$(this).attr('pr')]);
	$(".navigator-pane").addClass('hide');
	$("#navigator-pane" + $(this).attr('pr')).removeClass('hide');
});

$(".mg-btn-list").click(function(src){
	select_current_found_object(src);
});

//	### Atomic actions
$("#coordSetter").click(function(){
	setPointCoordinates();
});

$(".frame-switcher").click(function(){
	var pfrm = parseInt($("#vp_frame").val()),
		nfrm = 0;
	if(pfrm >= 1){
		nfrm = ($(this).attr("id") == "vp_fw") ? (pfrm + 1) : (pfrm > 1) ? (pfrm - 1) : pfrm ;
	}else{
		nfrm = 1;
	}
	hide_frame(pfrm);
	if(typeof mframes[nfrm] == 'undefined'){
		mframes[nfrm] = new ymaps.GeoObjectArray();
		if(confirm("Вы создаёте новый фрейм. Следует ли скопировать содержимое предыдущего фрейма в новый?")){
			//или другой вариант - отослать команду на сервер и перезагрузить уже клонированный фрейм...
			$.ajax({
				url: controller + "/cloneframe",
				data: {
					prev: pfrm,
					next: nfrm
				},
				dataType: "script",
				type: "POST",
				success: function(data){
					place_freehand_objects(usermap);
				},
				error: function(data,stat,err){
					//$("#consoleContent").html([data,stat,err].join("<br>"));
					alert([data,stat,err].join("\n"));
				}
			});
		}
	}
	//alert(mframes[1].getLength() + ' ' + mframes[2].getLength());
	//alert(frm);
	show_frame(nfrm);
	$("#vp_frame").val(nfrm);
});

$(".mapcoord").blur(function(){
	setMapCoordinates();
});

$("#mapFix").click(function(){
	isCenterSet = (isCenterSet) ? 0 : 1;
	lock_center();
});



$("#linkFactory a").click(function(e){
	mode = parseInt($(this).attr('pr'));
	if(typeof mp == 'undefined'){
		alert("Текущая карта ещё не была обработана.");
		return false;
	}
	if(mode == 1){
		$("#mapLink").val("http://maps.korzhevdp.com" + controller + '/map/' + mp.ehash);
		$("#mapLinkContainer").removeClass("hide");
	}
	if(mode == 2){
		$("#mapLink").val("http://maps.korzhevdp.com" + controller + '/map/' + mp.uhash);
		$("#mapLinkContainer").removeClass("hide");
	}
	if(mode == 3){
		e.preventDefault();  //stop the browser
		$.ajax({
			url: controller + '/loadscript/' + mp.uhash,
			dataType: "html",
			type: "POST",
			success: function(data){
				window.location.href = controller + '/loadscript/' + mp.uhash;
			},
			error: function(data,stat,err){
				//$("#consoleContent").html([data,stat,err].join("<br>"));
				alert([data,stat,err].join("\n"));
			}
		});
		//window.location.href = api_url + controller + '/loadscript/' + mp.uhash;
	}
	if(mode == 4){
		e.preventDefault();  //stop the browser
		$.ajax({
			url: controller + "/createframe/" + mp.uhash,
			dataType: "text",
			type: "POST",
			success: function(data){
				$("#mapLink").val("http://maps.korzhevdp.com" + controller + '/loadframe/' + mp.uhash);
				$("#mapLinkContainer").removeClass("hide");
				//(data == "OK") ? window.location.href = api_url + controller + '/loadiframelist/' + mp.uhash : '';
				//window.location.href = controller + '/loadframe/' + mp.uhash
			},
			error: function(data,stat,err){
				//alert([data,stat,err].join("<br>"));
			}
		});
		///window.location.href = '/' + controller + '/loadframe/' + mp.uhash;
	}
	if(mode == 5){
		e.preventDefault();
		$.ajax({
			url: controller + "/transfer",
			data: {
				hash: mp.uhash
			},
			dataType: "html",
			type: "POST",
			success: function(data){
				$("#transferCode").html(data);
				$("#transferM").modal("show");
			},
			error: function(data,stat,err){
				//alert([data,stat,err].join("<br>"));
			}
		});
		///window.location.href = '/' + controller + '/loadframe/' + mp.uhash;
	}
});

$("#sessDestroy").click(function(){
	$.ajax({
		url: controller + "/session_reset",
		dataType: "script",
		type: "POST",
		success: function(data){
			a_objects.removeAll();
			e_objects.removeAll();
			//$("#consoleContent").html(data);
			//$(".readyMarker").removeClass("icon-ok").addClass("icon-remove");
		},
		error: function(data,stat,err){
			//$("#consoleContent").html([data,stat,err].join("<br>"));
			alert([data,stat,err].join("\n"));
		}
	});
});

$("#mapReset").click(function(){
	$.ajax({
		url: controller + "/session_reset",
		dataType: "html",
		type: "POST",
		success: function(data){
			a_objects.removeAll();
			e_objects.removeAll();
			$("#mapSave, #ehashID, #SContainer").css('display',"block");
			//$("#consoleContent").html(data);
			//$(".readyMarker").removeClass("icon-ok").addClass("icon-remove");
		},
		error: function(data,stat,err){
			//$("#consoleContent").html([data,stat,err].join("<br>"));
		}
	});
});

$("#linkClose").click(function(){
	$("#mapLinkContainer").addClass("hide");
});

function styleAddToStorage(src){
	for (a in src){
		ymaps.option.presetStorage.add(a,src[a]);
	}
}

function list_marker_styles(){
	$("#m_style").append($('<optgroup label="Объекты">'));
	for (a in yandex_styles){
		$("#m_style").append($(yandex_styles[a]));
	}
	$("#m_style").append($('</optgroup><optgroup label="Маркеры">'));
	for (a in yandex_markers){
		$("#m_style").append($(yandex_markers[a]));
	}
	$("#m_style").append($('</optgroup><optgroup label="Пользовательские">'));
	for (a in style_src){
		$("#m_style").append($('<option value="' + style_src[a][2] +'">' + style_src[a][3] + '</option>'));
	}
	$("#m_style").append($('</optgroup>'));
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