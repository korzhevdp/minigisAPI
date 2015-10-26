/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
ymaps.ready(init);

var sights,
	point_id = 0,
	tabstate = 1,
	groups,
	p_objects,
	createType    = 0,
	editing       = 0,
	folder,
	objlayer      = 0,
	localstyles   = {},
	tileServerID = parseInt(Math.random() * (4-1) + 1).toString(),
	tileServerLit= { "0": "a","1": "b","2": "c","3": "d","4": "e","5": "f" },
	vectoropts    = { strokeColor: 'FF220099', strokeWidth: 2, strokeStyle: { style: 'solid' } },
	simplemarker  = { iconImageHref: 'http://api.korzhevdp.com/images/marker.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] },
	trustedmarker = { iconImageHref: 'http://api.korzhevdp.com/images/markery.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] },
	noimagedata   = { iconImageHref: 'http://api.korzhevdp.com/images/markerc.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] },
	defaultStyle  = { iconImageHref: 'http://api.korzhevdp.com/images/location_pin.png', iconImageSize: [32, 32], iconImageOffset: [-16, -32]};


function init() {

	// определения
	// начальная конфигурация
	config = {
			// tech-info
			mcenter       : [40.537471, 64.543004],
			maxZoom       : 17,
			minZoom       : 4,
			initZoom      : 13,
			proj          : ymaps.projection.sphericalMercator,
			// tech-info end
			url           : '',				// корень каталог с тайлами карты
			hasAtlas      : 1,				// наличие подготовленного атласа карт
			hasNav        : 1,
			layerTypes    : {
				0: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/1900/",
					label : "base#arch",
					localLayerID: 0,
					name  : "Архангельск. План 1900 года",
					layers: ['yandex#satellite', "base#arch"]
				},
				1: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[1].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/1990/",
					label : "base2#arch",
					localLayerID: 0,
					name  : "Архангельск. План 1998 года",
					layers: ['yandex#satellite', "base2#arch"]
				},
				2: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[2].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/base/",
					label : "base3#arch",
					localLayerID: 0,
					name  : "Архангельск. 1941-43 гг. SR",
					layers: ['yandex#satellite', "base3#arch"]
				},
				3: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[3].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/centerhr/",
					label : "base4#arch",
					localLayerID: 1,
					name  : "Архангельск. 1941-43 гг. Центр. HR",
					layers: ['yandex#satellite', "base3#arch", "base4#arch"]
				},
				4: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[4].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/farnorth/",
					label : "base5#arch",
					localLayerID: 2,
					name  : "Архангельск. 1941-43 гг. Север. HR",
					layers: ['yandex#satellite', "base3#arch", "base5#arch"]
				},
				5: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[5].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/1/",
					label : "base6#arch",
					localLayerID: 2,
					name  : "Центр города - 30.09.1942",
					layers: ['yandex#satellite', "base6#arch" ]
				},
				6: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[6].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/2/",
					label : "base7#arch",
					localLayerID: 2,
					name  : "Кехта - 30.09.1942",
					layers: ['yandex#satellite', "base7#arch"]
				},
				7: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[7].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/3/",
					label : "base8#arch",
					localLayerID: 2,
					name  : "Центр города - 15.09.1943",
					layers: ['yandex#satellite', "base8#arch"]
				},
				8: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[8].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/4/",
					label : "base9#arch",
					localLayerID: 2,
					name  : "Соломбала-1 - 22.05.1943",
					layers: ['yandex#satellite', "base9#arch"]
				},
				9: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[9].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/5/",
					label : "base10#arch",
					localLayerID: 2,
					name  : "Соломбала-2 - 22.05.1943",
					layers: ['yandex#satellite', "base10#arch"]
				},
				10: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[10].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/6/",
					label : "base11#arch",
					localLayerID: 2,
					name  : "Гидролизный завод - 22.07.1941",
					layers: ['yandex#satellite', "base11#arch"]
				},
				11: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[11].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/7/",
					label : "base12#arch",
					localLayerID: 1,
					name  : "Цигломень - 22.07.1941",
					layers: ['yandex#satellite', "base12#arch"]
				},
				12: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[12].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/8/",
					label : "base13#arch",
					localLayerID: 1,
					name  : "Аэродром Кегостров - 8.06.1943",
					layers: ['yandex#satellite', "base13#arch"]
				},
				13: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[13].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/9/",
					label : "base14#arch",
					localLayerID: 1,
					name  : "Хабарка - 29.09.1942",
					layers: ['yandex#satellite', "base14#arch"]
				},
				14: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[14].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/10/",
					label : "base15#arch",
					localLayerID: 1,
					name  : "Аэродром Кегостров - Ю-З - 24.08.1942",
					layers: ['yandex#satellite', "base15#arch"]
				},
				15: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[15].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/11/",
					label : "base16#arch",
					localLayerID: 1,
					name  : "Левый берег, Затон, Варавино- 29.06.1942",
					layers: ['yandex#satellite', "base16#arch"]
				},
				16: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[16].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/12/",
					label : "base17#arch",
					localLayerID: 1,
					name  : "Остров Бревенник - 29.09.1942",
					layers: ['yandex#satellite', "base17#arch"]
				},
				17: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[17].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/13/",
					label : "base18#arch",
					localLayerID: 1,
					name  : "Соломбала, Сульфат - 29.09.1942",
					layers: ['yandex#satellite', "base18#arch", "base19#arch"]
				},
				18: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[18].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/14/",
					label : "base19#arch",
					localLayerID: 1,
					name  : "Кузнечиха. Облачность - 29.09.1942",
					layers: ['yandex#satellite', "base19#arch"]
				},
				19: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[19].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/15/",
					label : "base20#arch",
					localLayerID: 1,
					name  : "Общий план - 15.06.1944",
					layers: ['yandex#satellite', "base20#arch"]
				},
				20: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[20].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/16/",
					label : "base21#arch",
					localLayerID: 1,
					name  : "Экономия - 22.05.1943",
					layers: ['yandex#satellite', "base21#arch"]
				},
				21: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[21].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/17/",
					label : "base22#arch",
					localLayerID: 1,
					name  : "Заостровье - 20.07.1943",
					layers: ['yandex#satellite', "base22#arch"]
				},
				22: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[22].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/18/",
					label : "base23#arch",
					localLayerID: 1,
					name  : "Север - 20.07.1943",
					layers: ['yandex#satellite', "base23#arch"]
				},
				23: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[23].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/19/",
					label : "base24#arch",
					localLayerID: 1,
					name  : "ул. Папанина - 20.07.1943",
					layers: ['yandex#satellite', "base24#arch"]
				},
				24: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[24].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/molotowsk/base1/",
					label : "base25#arch",
					localLayerID: 1,
					name  : "Молотовск 1942",
					layers: ['yandex#satellite', "base25#arch"]
				},
				25: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[25].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/molotowsk/base2/",
					label : "base26#arch",
					localLayerID: 1,
					name  : "Молотовск-2 1942",
					layers: ['yandex#satellite', "base25#arch", "base26#arch"]
				},
				26: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[26].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/molotowsk/base3/",
					label : "base27#arch",
					localLayerID: 1,
					name  : "Молотовск-3 1942",
					layers: ['yandex#satellite', "base27#arch", "base25#arch", "base26#arch"]
				},
				27: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[27].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "http://luft.korzhevdp.com/maps/molotowsk/base4/",
					label : "base28#arch",
					localLayerID: 1,
					name  : "Молотовск-4 1942",
					layers: ['yandex#satellite', "base27#arch", "base28#arch"]
				},
				28: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://mt" + tileServerID + ".google.com/vt/lyrs=s&hl=ru&x=" + tile[0] + "&y=" + tile[1] + "&z=" + zoom + "&s=Galileo";}, {tileTransparent: 1, zIndex:1000});},
					folder: "",
					label : "google#map",
					name  : "Гуглотест",
					layers: ["google#map"]
				}
			}
		};
	// конец начальной конфигурации
		var dX = [],
		searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		typeSelector  = new ymaps.control.TypeSelector(),
		layerTypes    = config.layerTypes,
		revLayerTypes = {},
		cMapType      = 0,
		lc            = 0,
		uploadPics    = [];
	//определение механизма пересчёта стандартной сетки тайлов в сетку тайлов Яндекс-карт
	for (var a=10; a < 21; a++){ dX[a] = Math.pow(2, a) - 1; }
	for(a in config.layerTypes){
		ymaps.layer.storage.add(config.layerTypes[a].label, config.layerTypes[a].func);
		ymaps.mapType.storage.add(config.layerTypes[a].label, new ymaps.MapType(
			config.layerTypes[a].name, config.layerTypes[a].layers
		));
		typeSelector.addMapType(config.layerTypes[a].label, a);
		$("#typeSelector").append('<option value="' + config.layerTypes[a].label + '">' + config.layerTypes[a].name + '</option>');
		revLayerTypes[layerTypes[a].label] = layerTypes[a].localLayerID;
	}
	$("#typeSelector").append('<option value="yandex#map">Схема</option><option value="yandex#satellite">Спутник</option>');
	//#################### поддержка основных стилей Minigis.NET ########################
	//###################################################################################
	function styleAddToStorage(src){
		for (a in src){
			ymaps.option.presetStorage.add(a, src[a]);
		}
	}
	
	styleAddToStorage(userstyles);
	list_marker_styles();
	function list_marker_styles(){
		//alert(1)
		$("#ostyle, #cstyle").append('<option value="0">Выберите стиль</option>');
		localstyles["1"] = [];
		localstyles["1"].push('<optgroup label="Объекты">');
		for (a in yandex_styles){
			localstyles["1"].push(yandex_styles[a]);
		}
		localstyles["1"].push('</optgroup>');
		localstyles["1"].push('<optgroup label="Маркеры">');
		for (a in yandex_markers){
			localstyles["1"].push(yandex_markers[a]);
		}
		localstyles["1"].push('</optgroup>');
		
		localstyles["1"].push('<optgroup class="points" label="Пользовательские">');
		/*
		for (a in style_src){
			localstyles["1"].push('<option value="' + style_src[a][2] +'">' + style_src[a][3] + '</option>');
		}
		*/
		localstyles["1"].push('</optgroup>');

		localstyles["2"] = [];
		localstyles["2"].push('<optgroup label="Стили ломаных">');
		/*
		for (a in style_paths){
			localstyles["2"].push('<option value="' + style_paths[a][2] +'">' + style_paths[a][4] + '</option>');
		}
		*/
		localstyles["2"].push('</optgroup>');

		localstyles["3"] = [];
		localstyles["3"].push('<optgroup label="Стили полигона">');
		/*
		for (a in style_polygons){
			localstyles["3"].push('<option value="' + style_polygons[a][5] +'">' + style_polygons[a][7] + '</option>');
		}
		*/
		localstyles["3"].push('</optgroup>');

		localstyles["4"] = [];
		localstyles["4"].push('<optgroup id="s_circles" label="Стили круга">');
		/*
		for (a in style_circles){
			localstyles["4"].push('<option value="' + style_circles[a][7] +'">' + style_circles[a][9] + '</option>');
		}
		*/
		localstyles["4"].push('</optgroup>');
	}
	//###################################################################################
	//###################################################################################


	//###################################################################################
	// Процессор карты
	//###################################################################################

	map = new ymaps.Map("YMapsID", 
		{center: config.mcenter, zoom: config.initZoom, type: config.layerTypes[0].label, behaviors: ["scrollZoom", "drag", "dblClickZoom"]},
		{projection: config.proj, maxZoom: config.maxZoom, minZoom: config.minZoom },
		{}
	);

	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	map.controls.add('zoomControl').add('mapTools').add('scaleLine')//.add(typeSelector)
	//typeSelector.removeMapType('yandex#publicMapHybrid');
	//typeSelector.removeMapType('yandex#hybrid');
	//typeSelector.removeMapType('yandex#publicMap');
	//typeSelector.removeMapType('yandex#map');
	$("#typeSelector").change(function(){
		map.setType($(this).val());
	});
	// выставляемая вручную отметка на карте.
	m_objects = new ymaps.GeoObjectArray();
	m_objects.options.set({ hasBalloon: 0, hasHint: 1, hintContent: "Отметка", draggable: 0 });
	map.geoObjects.add(m_objects);
	// задаём особенности поведения. Двойной клик убирает отметку 
	m_objects.events.add('dblclick', function (){
		m_objects.removeAll();
	});
	
	/* вызывает странное залипание карты... отключено
	m_objects.events.add('dragend', function (e){
		coords = e.get("target").geometry.getCoordinates();
		$("#plon").val(coords[0]);
		$("#plat").val(coords[1]);
	});
	*/

	/* добавление ручной отметки на карту */
	map.events.add('click', function (e){
		var coords = e.get('coordPosition'),
			geometry   = { type: "Point", coordinates: coords },
			properties = { description: "Отметка", hintContent: "Отметка", name: "Отметка" },
			options    = defaultStyle,
			object     = new ymaps.Placemark(geometry, properties, options);
		$("#plon").val(coords[0]);
		$("#plat").val(coords[1]);
		m_objects.removeAll().add(object);
	});

	/* установка параметров коллекции */
	p_objects = new ymaps.GeoObjectArray();
	p_objects.options.set({ 
		hasBalloon: 0, 
		hasHint: 1,
		hintContent: "datum EPSG:4328",
		draggable: 1
	});
	map.geoObjects.add(p_objects);
	
	p_objects.events.add('dragend', function (action){
		v = action.get('target');
		p_objects.get(point_id).properties.set("adr", get_address(v.geometry.getCoordinates()));

	});

	function save_point(){
		var vd, addr, tr, act;
		p_objects.each(function(item){
			if(parseInt(item.properties.get("id")) == point_id){
				vd = item.geometry.getCoordinates();
				adr = item.properties.get("adr");
			}
		});
		$.ajax({
			type      : "POST",
			url       : "/admin/points/point_save",
			data      : { 
				coords: vd,
				id    : point_id,
				desc  : $("#desc").val(),
				addr  : adr,
				act   : $("#act").prop("checked"),
				tr    : $("#trusted").prop("checked")
			},
			dataType  : 'text',
			success   : function(){
			},
			error     : function(data,stat,err){
				alert([data,stat,err].join("\n"));
			}
		});
	}

	$("#pointSaver").click(function(){
		save_point()
	});

	function get_address(coords){
		address = "";
		ymaps.geocode(coords, { kind: ['house'] }).then(function(res){
			var names = [];
			res.geoObjects.each(function(obj){
				names.push(obj.properties.get('name'));
			});
			address = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса"; [names[0]].join(', ');
			
		});
		$("#address").val(address);
		return address;
	}

	p_objects.events.add('click', function (action){
		v = action.get('target');
		crds = v.geometry.getCoordinates();
		$("#plon").val(crds[0]);
		$("#plat").val(crds[1]);
		point_id = parseInt(v.properties.get("id"));
		//alert(typeof point_id + "\n" + point_id);
		$("#desc").val(v.properties.get("desc"));
		(v.properties.get("act") == 1) ? $("#act").prop("checked", true)     : $("#act").prop("checked", false);
		(v.properties.get("tr") == 1)  ? $("#trusted").prop("checked", true) : $("#trusted").prop("checked", false);
		//$("#trusted").val(v.properties.get("desc"));
		//if (!v.properties.get("adr").trim().length){
		//alert(1);
		ymaps.geocode(crds, { kind: ['house'] }).then(function(res){
		//alert(1);
			var names = [];
			res.geoObjects.each(function(obj){
				names.push(obj.properties.get('name'));
			});
			address = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса"; [names[0]].join(', ');
			
			$("#address").val(address);

			p_objects.each(function(item){
				if(parseInt(item.properties.get('id')) == point_id){
					item.properties.set( { adr: address} );
				}
			});
			//alert(address)
			//alert();
		});
		//}else{
		//	$("#address").val(v.properties.get("adr"));
		//}
	});

	$("#tab2 .pointfiles").change(function(){
		p_objects.removeAll();
		output = [];
		if(!$("#tab2 .pointfiles:checked").length){
			return false;
		}
		$("#tab2 .pointfiles:checked").each(function(){
			output.push($(this).val());
		});
		$.ajax({
			type     : "POST",
			url      : "/admin/points/points_get",
			data     : {
				file: "'" + output.join("','") + "'"
			},
			dataType : 'script',
			success  : function(){
				for(a in points){
					b = parseInt(a);
					var geometry   = { type: "Point", coordinates: [ parseFloat(points[b].lon), parseFloat(points[b].lat) ] },
						properties = { id: b, adr: points[b].adr, desc: points[b].desc,  tr: points[b].tr, act: points[b].act },
						options    = (points[b].tr == 1) ? trustedmarker : simplemarker ,
						options    = (points[b].p == 1 ) ? options : noimagedata ;
						object     = new ymaps.Placemark(geometry, properties, options);
					p_objects.add(object, b);
				}
				$("#trusted, #act").prop("checked", false);
				$("#address, #desc").val("");
			},
			error: function(data,stat,err){
				alert([data,stat,err].join("\n"));
			}
		});
	});

	$("#trusted").click(function(){
		bool = $(this).prop("checked");
		//alert(bool)
		p_objects.each(function(item){
			if(parseInt(item.properties.get('id')) == point_id){
				(bool) ? item.options.set( trustedmarker ) : item.options.set( simplemarker );
			}
		});
	}); 
}

$("#sendData").click(function(){
	$.ajax({
		type: "POST",
		url: "/admin/points/points_add",
		dataType: 'text',
		data: { 
			file   : $("#gcpName").val(),
			points : $("#pointsSrc").val()
		},
		success: function(data){
			alert(data);
		},
		error: function(data,stat,err){
			alert([data,stat,err].join("\n"));
		}
	});
});

$('.modal').modal({ show: 0 });

$("#chooseFile").click(function(){
	$("#fileChooser").modal("show");
});

$("#eraseFile").click(function(){
	$("#fileToErase").html($("#gcpName").val());
	$("#confirmErase").modal("show");
});

$("#eraseConfirmed").click(function(){
	$.ajax({
		type: "POST",
		url: "/admin/points/file_erase",
		dataType: 'script',
		data: { 
			file   : $("#gcpName").val()
		},
		success: function(data){
			$("#fileList").append(list[1]);
			$("#pointsfile2").append(list[2]);
		},
		error: function(data,stat,err){
			alert([data,stat,err].join("\n"));
		}
	});
});

$("#fileChooser li").click(function(){
	$("#gcpName").val($(this).text());
	$("#fileChooser").modal("hide");
});


$("#trusted, #act, .pointfiles").prop("checked", false);
$("#address, #desc").val("");

$("#YMapsID").height($(window).height() - 44 + 'px');
$("#YMapsID").width($(window).width() - 340 + 'px');