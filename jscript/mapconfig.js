ymaps.ready(initconf);

var mapconfig,
	config,
	dX = [];

function initconf() {
	mapconfig = {
		map1940: {
			// tech-info
			mcenter       : [40.537471, 64.543004],
			maxZoom       : 17,
			minZoom       : 4,
			initZoom      : 13,
			precision     : 12,
			proj          : ymaps.projection.sphericalMercator,
			// tech-info end
			url           : '/maps/arch1940/',			// корень каталог с тайлами карты
			hasNav        : 1,							// наличие навигатора
			hasAtlas      : 1,							// наличие подготовленного атласа карт
			layerTypes    : {
				0: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return this.layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "base/",
					label : "base#arch",
					name  : "Весь город 1941-44 гг. Стандартное разрешение",
					layers: ['yandex#satellite', "base#arch"]
				},
				1: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return this.layerTypes[1].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "centerhr/",
					label : "chr#arch",
					name  : "Центр 1942-44 гг. Высокое разрешение",
					layers: ['yandex#satellite', "base#arch", "chr#arch"]
				},
				2: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return this.layerTypes[2].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "farnorth/",
					label : "fn#arch",
					name  : "о. Бревенник, Маймакса, Экономия (1942-44)",
					layers: ['yandex#satellite', "base#arch", "fn#arch"]
				}
			}
		},
		map1900: {
			// tech-info
			mcenter       : [40.537471, 64.543004],
			maxZoom       : 17,
			minZoom       : 4,
			initZoom      : 13,
			precision     : 12,
			proj          : ymaps.projection.sphericalMercator,
			// tech-info end
			//map-specific data
			url           : '/maps/1900/',				// корень каталог с тайлами карты - слеши с обеих сторон!
			hasAtlas      : 0,							// наличие подготовленного атласа карт
			hasNav        : 1,
			layerTypes    : {
				0: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "",
					label : "base#arch",
					name  : "Архангельск. План 1900 года",
					layers: ['yandex#satellite', "base#arch"]
				}
			}
		},
		map1990: {
			// tech-info
			mcenter       : [40.537471, 64.543004],
			maxZoom       : 17,
			minZoom       : 4,
			initZoom      : 13,
			proj          : ymaps.projection.sphericalMercator,
			// tech-info end
			//map-specific data
			url           : '/maps/1990/',				// корень каталог с тайлами карты - слеши с обеих сторон!
			hasAtlas      : 0,							// наличие подготовленного атласа карт
			hasNav        : 0,
			layerTypes    : {
				0: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return mapconfig.map1900.layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "",
					label : "base#arch",
					name  : "Большая карта 1998 года",
					layers: ['yandex#satellite', "base#arch"]
				}
			}
		},
		mapnm: {
			// tech-info
			mcenter       : [53.0059434251, 67.6445143696],
			maxZoom       : 18,
			minZoom       : 4,
			initZoom      : 15,
			proj          : ymaps.projection.sphericalMercator,
			// tech-info end
			url           : '/maps/nm/',				// корень каталога с тайлами карты
			hasNav        : 0,							// наличие навигатора
			hasAtlas      : 0,							// наличие подготовленного атласа карт
			layerTypes    : {
				0: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "nmbase/",
					label : "base#nm",
					name  : "Нарьян-Мар. Общий вид города (22.09.1943)",
					layers: ['yandex#satellite', "base#nm"] // массив слоёв снизу вверх.
				},
				1: {
					func  : function () {return new ymaps.Layer(function (tile, zoom) {return config.layerTypes[1].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
					folder: "base/",
					label : "hr#nm",
					name  : "Нарьян-Мар. Фрагменты высокого разрешения (22.06.43 - 15.07.1943",
					layers: ['yandex#satellite', "hr#nm"]  // массив слоёв снизу вверх.
				},
			}
		}
	}
}