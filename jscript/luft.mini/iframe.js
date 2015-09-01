//######################################### ��������� ����� #########################################################
ymaps.ready(init);

function init() {
	// определения
	// начальная конфигурация
	config.photosOnStart = 1;
	//config.mcenter       = [40.537471, 64.543004];
	//config.maxZoom       = 17;
	//config.minZoom       = 4;
	//config.initZoom      = 13;
	//config.precision     = 12;
	//config.proj          = ymaps.projection.sphericalMercator;
	config.url             = '/maps/arch1940/';	// корень каталог с тайлами карты
	//config.hasNav          = 1;					// наличие навигатора
	//config.hasAtlas        = 1;					// наличие подготовленного атласа карт
	//config.hasMulti        = 1;					// наличие альтернативной смотрелки
	//config.ownMarkers    = 1;
	//config.showObjects     = 1;
	//config.showClusters  = 1;
	//config.showGroups      = 1;
	config.showObjectsOS = 1;
	//config.showClustersOS= 1;
	//config.showGroupsOS  = 1;
	//config.demoMode        = 1;
	config.layerTypes    = {
		0: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://luft.korzhevdp.com" + config.url + config.layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "base/",
			label : "base#arch",
			name  : "Весь город 1941-44 гг. Стандартное разрешение",
			layers: ['yandex#satellite', "base#arch"]
		},
		1: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://luft.korzhevdp.com" + config.url + config.layerTypes[1].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "centerhr/",
			label : "chr#arch",
			name  : "Центр 1942-44 гг. Высокое разрешение",
			layers: ['yandex#satellite', "base#arch", "chr#arch"]
		},
		2: {
			func  : function () {return new ymaps.Layer(function (tile, zoom) {return "http://luft.korzhevdp.com" + config.url + config.layerTypes[2].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
			folder: "farnorth/",
			label : "fn#arch",
			name  : "о. Бревенник, Маймакса, Экономия (1942-44)",
			layers: ['yandex#satellite', "base#arch", "fn#arch"]
		}
	};
	//###################################################################################
	// Процессор карты
	//###################################################################################
	layerTypes    = config.layerTypes;
	// сброс карты (это, типа, такой костыль ещё от старых карт - на всякий случай)
	//(typeof map != "undefined") ? map.destroy() : "";
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
}
//######################################### конец процессора карты #######################################################
//######################################################################################################################
