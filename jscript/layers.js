/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
// Encoding: UTF-8
//определение механизма пересчёта стандартной сетки тайлов в сетку тайлов Яндекс-карт
dX = [];
for (var a=0; a < 21; a++){ dX[a] = Math.pow(2, a) - 1; }
var layerTypes = {
	0: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[0].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/1900/",
		label : "base#arch",
		group : "1900#arch",
		localLayerID: 0,
		name  : "Архангельск. План 1900 года",
		layers: ['yandex#satellite', "base#arch"]
	},
	1: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[1].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/1990/",
		label : "base2#arch",
		group : "1990#arch",
		localLayerID: 0,
		name  : "Архангельск. План 1998 года",
		layers: ['yandex#satellite', "base2#arch"]
	},
	2: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[2].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/base/",
		label : "base3#arch",
		group : "1943#arch",
		localLayerID: 0,
		name  : "Архангельск. 1941-43 гг. Стандартное разрешение",
		layers: ['yandex#satellite', "base3#arch"]
	},
	3: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[3].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/centerhr/",
		label : "base4#arch",
		group : "1943#arch",
		localLayerID: 1,
		name  : "Архангельск. 1941-43 гг. Центр. Высокое разрешение",
		layers: ['yandex#satellite', "base3#arch", "base4#arch"]
	},
	4: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[4].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/farnorth/",
		label : "base5#arch",
		group : "1943#arch",
		localLayerID: 2,
		name  : "Архангельск. 1941-43 гг. Север, фрагменты. Высокое разрешение",
		layers: ['yandex#satellite', "base3#arch", "base5#arch"]
	},
	5: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[5].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/1/",
		label : "base6#arch",
		group : "atlas#arch",
		localLayerID: 2,
		name  : "Центр города - 30.09.1942",
		layers: ['yandex#satellite', "base6#arch" ]
	},
	6: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[6].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/2/",
		label : "base7#arch",
		group : "atlas#arch",
		localLayerID: 2,
		name  : "Кехта - 30.09.1942",
		layers: ['yandex#satellite', "base7#arch"]
	},
	7: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[7].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/3/",
		label : "base8#arch",
		group : "atlas#arch",
		localLayerID: 2,
		name  : "Центр города - 15.09.1943",
		layers: ['yandex#satellite', "base8#arch"]
	},
	8: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[8].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/4/",
		label : "base9#arch",
		group : "atlas#arch",
		localLayerID: 2,
		name  : "Соломбала-1 - 22.05.1943",
		layers: ['yandex#satellite', "base9#arch"]
	},
	9: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[9].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/5/",
		label : "base10#arch",
		group : "atlas#arch",
		localLayerID: 2,
		name  : "Соломбала-2 - 22.05.1943",
		layers: ['yandex#satellite', "base10#arch"]
	},
	10: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[10].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/6/",
		label : "base11#arch",
		group : "atlas#arch",
		localLayerID: 2,
		name  : "Гидролизный завод - 22.07.1941",
		layers: ['yandex#satellite', "base11#arch"]
	},
	11: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[11].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/7/",
		label : "base12#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Цигломень - 22.07.1941",
		layers: ['yandex#satellite', "base12#arch"]
	},
	12: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[12].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/8/",
		label : "base13#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Аэродром Кегостров - 8.06.1943",
		layers: ['yandex#satellite', "base13#arch"]
	},
	13: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[13].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/9/",
		label : "base14#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Хабарка - 29.09.1942",
		layers: ['yandex#satellite', "base14#arch"]
	},
	14: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[14].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/10/",
		label : "base15#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Аэродром Кегостров - Ю-З - 24.08.1942",
		layers: ['yandex#satellite', "base15#arch"]
	},
	15: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[15].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/11/",
		label : "base16#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Левый берег, Затон, Варавино- 29.06.1942",
		layers: ['yandex#satellite', "base16#arch"]
	},
	16: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[16].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/12/",
		label : "base17#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Остров Бревенник - 29.09.1942",
		layers: ['yandex#satellite', "base17#arch"]
	},
	17: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[17].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/13/",
		label : "base18#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Соломбала, Сульфат - 29.09.1942",
		layers: ['yandex#satellite', "base18#arch", "base19#arch"]
	},
	18: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[18].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/14/",
		label : "base19#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Кузнечиха. Облачность - 29.09.1942",
		layers: ['yandex#satellite', "base19#arch"]
	},
	19: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[19].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/15/",
		label : "base20#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Общий план - 15.06.1944",
		layers: ['yandex#satellite', "base20#arch"]
	},
	20: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[20].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/16/",
		label : "base21#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Экономия - 22.05.1943",
		layers: ['yandex#satellite', "base21#arch"]
	},
	21: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[21].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/17/",
		label : "base22#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Заостровье - 20.07.1943",
		layers: ['yandex#satellite', "base22#arch"]
	},
	29: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[29].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/18/",
		label : "base23#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Маймакса - 20.07.1943",
		layers: ['yandex#satellite', "base23#arch"]
	},
	30: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[30].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/arch1940/atlas/19/",
		label : "base24#arch",
		group : "atlas#arch",
		localLayerID: 1,
		name  : "Майская горка - Варавино - 22.05.1943",
		layers: ['yandex#satellite', "base24#arch"]
	},
	22: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[22].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk041/",
		label : "base#molot",
		group : "1943#molot",
		name  : "Молотовск и окрестности 25.04.1943 г.",
		localLayerID: 0,
		layers: ['yandex#satellite', "base#molot"]
	},
	23: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[23].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk040/",
		label : "base#molot2",
		group : "1943#molot",
		name  : "Молотовск, центр города 25.04.1943 г.",
		localLayerID: 1,
		layers: ['yandex#satellite', "base#molot", "base#molot2"]
	},
	24: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[24].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk042/",
		label : "base#molot3",
		group : "1943#molot",
		name  : "Молотовск. Завод. 8.07.1943 г.",
		localLayerID: 2,
		layers: ['yandex#satellite', "base#molot", "base#molot3"]
	},
	25: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[25].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk044/",
		label : "base#molot4",
		group : "1943#molot",
		name  : "Молотовск. Завод. Ягры. 15.08.1943 г.",
		localLayerID: 3,
		layers: ['yandex#satellite', "base#molot", "base#molot4"]
	},
	26: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[26].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/molotowsk/Molotowsk049/",
		label : "base#molot5",
		group : "1943#molot",
		name  : "Молотовск. Завод. 15.06.1944 г.",
		localLayerID: 4,
		layers: ['yandex#satellite', "base#molot5"]
	},
	27: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[27].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/nm/nmbase/",
		label : "base#nm",
		name  : "Нарьян-Мар. Окрестности",
		localLayerID: 1,
		layers: ['yandex#satellite', "base#nm"]
	},
	28: {
		func  : function () {return new ymaps.Layer(function (tile, zoom) {return layerTypes[28].folder + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';}, {tileTransparent: 1, zIndex:1000});},
		folder: "http://luft.korzhevdp.com/maps/nm/base/",
		label : "base2#nm",
		name  : "Нарьян-Мар Центр HR",
		localLayerID: 1,
		layers: ['yandex#satellite', "base2#nm"]
	}

}