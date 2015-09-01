var api_domain = "http://api.korzhevdp.com";
/* new universal styles' format as literal uniform objects. Longer, but clearer... */
userstyles = {
	'user#here': {	//Набор: pandora Дизайнер: Mike Beecham
		iconUrl         : api_domain + '/images/userstyles/redarrowdown.png',
		iconImageHref   : api_domain + '/images/userstyles/redarrowdown.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-12,-24],
		iconAnchor      : [14,23],
		title           : 'Вы здесь',
		type            : 1
	},
	'user#citypark': {	//Набор: map icons//Дизайнер: Nicolas Mollet;
		iconUrl         : api_domain + '/images/userstyles/park2.png',
		iconImageHref   : api_domain + '/images/userstyles/park2.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-12,-24],
		title           : 'Городской парк',
		type            : 1
	},
	'user#disability75': {	//Набор: map icons//Дизайнер: Nicolas Mollet;
		iconUrl         : api_domain + '/images/userstyles/disability75.png',
		iconImageHref   : api_domain + '/images/userstyles/disability75.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-12,-24],
		title           : 'ОВ доступность 75%',
		type            : 1
	},
	'user#disability50': {	//Набор: map icons//Дизайнер: Nicolas Mollet;
		iconUrl         : api_domain + '/images/userstyles/disability50.png',
		iconImageHref   : api_domain + '/images/userstyles/disability50.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-12,-24],
		title           : 'ОВ доступность 50%',
		type            : 1
	},
	'user#disability25': {	//Набор: map icons//Дизайнер: Nicolas Mollet;
		iconUrl         : api_domain + '/images/userstyles/disability25.png',
		iconImageHref   : api_domain + '/images/userstyles/disability25.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-12,-24],
		title           : 'ОВ доступность 25%',
		type            : 1
	},
	'user#disability100': {	//Набор: map icons//Дизайнер: Nicolas Mollet;
		iconUrl         : api_domain + '/images/userstyles/disability100.png',
		iconImageHref   : api_domain + '/images/userstyles/disability100.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-12,-24],
		title           : 'ОВ доступность 0%',
		type            : 1
	},
	'user#aquarium': {	//Набор: map icons//Дизайнер: Nicolas Mollet;
		iconUrl         : api_domain + '/images/userstyles/aquarium.png',
		iconImageHref   : api_domain + '/images/userstyles/aquarium.png',
		iconSize        : [32,37],
		iconImageSize   : [32,37],
		iconImageOffset : [-12,-24],
		title           : 'Аквариум',
		type            : 1
	},
	'airshow#rus': {
		iconUrl         : api_domain + '/images/userstyles/rus_avia.png',
		iconImageHref   : api_domain + '/images/userstyles/rus_avia.png',
		iconSize        : [32,28],
		iconImageSize   : [32,28],
		iconImageOffset : [-16,-14],
		title           : 'Пилотажная группа Русь',
		type            : 1
	},
	'user#dsm': {
		iconUrl         : api_domain + '/images/userstyles/ds.png',
		iconImageHref   : api_domain + '/images/userstyles/ds.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-13,-24],
		title           : 'Детский сад',
		type            : 1
	},
	'user#artsschool': {
		iconUrl         : api_domain + '/images/userstyles/ds.png',
		iconImageHref   : api_domain + '/images/userstyles/ds.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-13,-24],
		title           : 'Детский сад',
		type            : 1
	},
	'user#сschool': {
		iconUrl         : api_domain + '/images/userstyles/ds.png',
		iconImageHref   : api_domain + '/images/userstyles/ds.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-13,-24],
		title           : 'Общеобразовательная школа',
		type            : 1
	},
	'user#sportsschool': {
		iconUrl         : api_domain + '/images/userstyles/ds.png',
		iconImageHref   : api_domain + '/images/userstyles/ds.png',
		iconSize        : [26,24],
		iconImageSize   : [26,24],
		iconImageOffset : [-13,-24],
		title           : 'ДЮСШ',
		type            : 1
	},
	'alert#fire': {
		iconUrl         : api_domain + '/images/userstyles/fire.png',
		iconImageHref   : api_domain + '/images/userstyles/fire.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-16,-32],
		title           : 'Огонь',
		type            : 1
	},
	'alert#water': {
		iconUrl         : api_domain + '/images/userstyles/fire.png',
		iconImageHref   : api_domain + '/images/userstyles/fire.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-16,-32],
		title           : 'Вода',
		type            : 1
	},
	'alert#gas': {
		iconUrl         : api_domain + '/images/userstyles/fire.png',
		iconImageHref   : api_domain + '/images/userstyles/fire.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-16,-32],
		title           : 'Газ',
		type            : 1
	},
	'alert#btu': {
		iconUrl         : api_domain + '/images/userstyles/fire.png',
		iconImageHref   : api_domain + '/images/userstyles/fire.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-16,-32],
		title           : 'Теплоснабжение',
		type            : 1
	},
	'nodal#b737': {
		iconUrl         : api_domain + '/images/nodal.life/b737N.png',
		iconImageHref   : api_domain + '/images/nodal.life/b737N.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-16,-16],
		title           : 'Самолёт',
		type            : 1
	},
	'user#anchor': {
		iconUrl         : api_domain + '/images/luftmaps/anchor.png',
		iconImageHref   : api_domain + '/images/luftmaps/anchor.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Пристань',
		type            : 1
	},
	'user#church': {
		iconUrl         : api_domain + '/images/luftmaps/church.png',
		iconImageHref   : api_domain + '/images/luftmaps/church.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Церковь',
		type            : 1
	},
	'user#jews': {
		iconUrl         : api_domain + '/images/luftmaps/jew.png',
		iconImageHref   : api_domain + '/images/luftmaps/jew.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Еврейская община',
		type            : 1
	},
	'user#maid': {
		iconUrl         : api_domain + '/images/luftmaps/maid.png',
		iconImageHref   : api_domain + '/images/luftmaps/maid.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Сестра милосердия',
		type            : 1
	},
	'user#police': {
		iconUrl         : api_domain + '/images/luftmaps/policeman.png',
		iconImageHref   : api_domain + '/images/luftmaps/policeman.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Полиция',
		type            : 1
	},
	'user#police': {
		iconUrl         : api_domain + '/images/luftmaps/policeman.png',
		iconImageHref   : api_domain + '/images/luftmaps/policeman.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Полиция',
		type            : 1
	},
	'user#soldier': {
		iconUrl         : api_domain + '/images/luftmaps/soldier.png',
		iconImageHref   : api_domain + '/images/luftmaps/soldier.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Военные',
		type            : 1
	},
	'user#student': {
		iconUrl         : api_domain + '/images/luftmaps/student.png',
		iconImageHref   : api_domain + '/images/luftmaps/student.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Студент',
		type            : 1
	},
	'user#studentf': {
		iconUrl         : api_domain + '/images/luftmaps/studentf.png',
		iconImageHref   : api_domain + '/images/luftmaps/studentf.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Институтка',
		type            : 1
	},
	'user#tower': {
		iconUrl         : api_domain + '/images/luftmaps/tower.png',
		iconImageHref   : api_domain + '/images/luftmaps/tower.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Башня замка',
		type            : 1
	},
	'user#transmit': {
		iconUrl         : api_domain + '/images/luftmaps/transmit.png',
		iconImageHref   : api_domain + '/images/luftmaps/transmit.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Передатчик',
		type            : 1
	},
	'user#wall': {
		iconUrl         : api_domain + '/images/luftmaps/wall.png',
		iconImageHref   : api_domain + '/images/luftmaps/wall.png',
		iconSize        : [21,28],
		iconImageSize   : [21,28],
		iconImageOffset : [-11,-28],
		title           : 'Стена',
		type            : 1
	},
	'system#arrowldn': {
		iconUrl         : api_domain + '/images/userstyles/layer_aspect_arrow.png',
		iconImageHref   : api_domain + '/images/userstyles/layer_aspect_arrow.png',
		iconSize        : [16,16],
		iconImageSize   : [16,16],
		iconImageOffset : [0,-16],
		title           : 'Левый нижний',
		type            : 's'
	},
	'system#arrowrup': {
		iconUrl         : api_domain + '/images/userstyles/layer_aspect_arrow2.png',
		iconImageHref   : api_domain + '/images/userstyles/layer_aspect_arrow2.png',
		iconSize        : [16,16],
		iconImageSize   : [16,16],
		iconImageOffset : [-16,0],
		title           : 'Правый верхний',
		type            : 's'
	},
	'system#redflag': { //mk. 2
		iconUrl         : api_domain + '/images/userstyles/flag_3.png',
		iconImageHref   : api_domain + '/images/userstyles/flag_3.png',
		iconSize        : [16,16],
		iconImageSize   : [16,16],
		iconAnchor      : [2,16],
		iconImageOffset : [-3,-16],
		title           : 'Красный флаг',
		type            : 1
	},
	'system#blueflag': { //FatCow Icon Set
		iconUrl         : api_domain + '/images/userstyles/flag_2.png',
		iconImageHref   : api_domain + '/images/userstyles/flag_2.png',
		iconSize        : [16,16],
		iconImageSize   : [16,16],
		iconAnchor      : [2,16],
		iconImageOffset : [-3,-16],
		title           : 'Синий флаг',
		type            : 1
	},
	'system#greenflag': { //FatCow Icon Set
		iconUrl         : api_domain + '/images/userstyles/flag_1.png',
		iconImageHref   : api_domain + '/images/userstyles/flag_1.png',
		iconSize        : [16,16],
		iconImageSize   : [16,16],
		iconImageOffset : [-3,-16],
		iconAnchor      : [2,16],
		title           : 'Зелёный флаг',
		type            : 1
	},
	'system#arrowcen': { //FatCow Icon Set
		iconUrl         : api_domain + '/images/userstyles/arrow_in.png',
		iconImageHref   : api_domain + '/images/userstyles/arrow_in.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-16,-16],
		title           : 'Центр',
		type            : 's'
	},
	'system#arrowrad': { //FatCow Icon Set
		iconUrl         : api_domain + '/images/userstyles/arrow_right.png',
		iconImageHref   : api_domain + '/images/userstyles/arrow_right.png',
		iconSize        : [32,32],
		iconImageSize   : [32,32],
		iconImageOffset : [-32,-16],
		title           : 'Радиус',
		type            : 's'
	},
	/* styles further all are the own art. Moderately ugly  //Набор: Mk. 2 */
	'routes#bus' : {
		stroke      : true,
		color       : '#0099CC',
		strokeColor : '0099CCCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Автобусный маршрут',
		type        : 2
	},
	'routes#walk' : {
		stroke      : true,
		color       : '#0080C0',
		strokeColor : '0080C0CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Пеший маршрут',
		type        : 2
	},
	'routes#car' : {
		stroke      : true,
		color       : '#FFFF00',
		strokeColor : 'FFFF00CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Автомобильный маршрут',
		type        : 2
	},
	'routes#vessel' : {
		stroke      : true,
		color       : '#0000FF',
		strokeColor : '0000FFCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Водный маршрут',
		type        : 2
	},
	'routes#railroad' : {
		stroke      : true,
		color       : '#330000',
		strokeColor : '330000CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'ЖД маршрут',
		type        : 2
	},
	'routes#air' : {
		stroke      : true,
		color       : '#66FFFF',
		strokeColor : '66FFFFCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Авиамаршрут',
		type        : 2
	},
	'routes#bike' : {
		stroke      : true,
		color       : '#66CC00',
		strokeColor : '66CC00CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Веломаршрут',
		type        : 2
	},
	'routes#wire' : {
		stroke      : true,
		color       : '#339900',
		strokeColor : '339900CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Проводная линия',
		type        : 2
	},
	'routes#xdsl' : {
		stroke      : true,
		color       : '#CC0000',
		strokeColor : 'CC0000CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '3, 3',
		strokeStyle : { style: 'dot' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'xDSL линия',
		type        : 2
	},
	'routes#default' : {
		stroke      : true,
		color       : '#000000',
		strokeColor : '000000CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '2, 6, 2',
		strokeStyle : { style: 'dash' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Стиль по умолчанию',
		type        : 2
	},
	'routes#eventroute' : {
		stroke      : true,
		color       : '#FF7700',
		strokeColor : 'FF7700CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Маршрут события',
		type        : 2
	},
	'routes#current' : {
		stroke      : true,
		color       : '#FF0033',
		strokeColor : 'FF0033CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Текущий маршрут',
		type        : 2
	},
	'metro#grey'    : {
		stroke      : true,
		color       : '#656565',
		strokeColor : '656565CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Серая линия',
		type        : 2
	},
	'metro#orange' : {
		stroke      : true,
		color       : '#FF8200',
		strokeColor : 'FF8200CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Оранжевая линия',
		type        : 2
	},
	'metro#red' : {
		stroke      : true,
		color       : '#DF1707',
		strokeColor : 'DF1707CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Красная линия',
		type        : 2
	},
	'metro#blue' : {
		stroke      : true,
		color       : '#140871',
		strokeColor : '140871CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Синяя линия',
		type        : 2
	},
	'metro#yellowgreen' : {
		stroke      : true,
		color       : '#8AB228',
		strokeColor : '8AB228CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Салатовая линия',
		type        : 2
	},
	'metro#yellow' : {
		stroke      : true,
		color       : '#FBC724',
		strokeColor : 'FBC724CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Жёлтая линия',
		type        : 2
	},
	'metro#magenta' : {
		stroke      : true,
		color       : '#860C45',
		strokeColor : '860C45CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Сиреневая линия',
		type        : 2
	},
	'metro#green' : {
		stroke      : true,
		color       : '#0C451C',
		strokeColor : '0C451CCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Зелёная линия',
		type        : 2
	},
	'metro#skyblue' : {
		stroke      : true,
		color       : '#294D9F',
		strokeColor : '294D9FCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Голубая линия',
		type        : 2
	},
	'metro#circular' : {
		stroke      : true,
		color       : '#3B1B0B',
		strokeColor : '3B1B0BCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Кольцевая линия',
		type        : 2
	},
	'metro#circular' : {
		stroke      : true,
		color       : '#EEEEEE',
		strokeColor : 'EEEEEECC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '3, 3',
		strokeStyle : { style: 'dot' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Метро. Прочие ветки',
		type        : 2
	},
	'routes#editable' : {
		stroke      : true,
		color       : '#EE1100',
		strokeColor : 'EE1100CC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '1',
		strokeStyle : { style: 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Редактируется',
		type        : 2
	},
	'nodal#basair' : {
		stroke      : true,
		color       : '#0000FF',
		strokeColor : '0000FFCC',
		weight      : '3',
		strokeWidth : '3',
		dashArray   : '3, 6',
		strokeStyle : { style: 'dot' },
		lineCap     : 'round',
		lineJoin    : 'round',
		opacity     : .9,
		title       : 'Опорный авиамаршрут',
		type        : 2
	},
	/* Polygons //Набор: Mk. 2;*/
	'area#default' : {
		stroke      : true,
		outline     : true,
		color       : '#FFFFFF',
		strokeColor : 'FFFFFFEE',
		fill        : true,
		fillColor   : '#C6C6C660',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		dashArray   : '1',
		title       : 'Стиль по умолчанию',
		type: 3
	},
	'area#red' : {
		stroke      : true,
		outline     : true,
		color       : '#FF0000',
		strokeColor : 'FF0000EE',
		fill        : true,
		fillColor   : '#FF330060',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'solid' },
		lineCap     : 'round',
		lineJoin    : 'round',
		dashArray   : '1',
		title       : 'Красный полигон',
		type: 3
	},
	'area#district' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#ffffff25',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		lineCap     : 'round',
		lineJoin    : 'round',
		dashArray   : '2, 2',
		title       : 'Территориальный округ #0',
		type: 3
	},
	'area#district1' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#ffff6625',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #1',
		type: 3
	},
	'area#district2' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#3333ff25',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #2',
		type: 3
	},
	'area#district3' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#00ff3325',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #3',
		type: 3
	},
	'area#district4' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#66ff3325',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #4',
		type: 3
	},
	'area#district5' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#9900ff25',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #5',
		type: 3
	},
	'area#district6' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#33000025',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #6',
		type: 3
	},
	'area#district7' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#ccff0025',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #7',
		type: 3
	},
	'area#district8' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#33000025',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Территориальный округ #8',
		type: 3
	},
	'area#area1' : {
		stroke      : true,
		outline     : true,
		color       : '#99FF00',
		strokeColor : '99FF00EE',
		fill        : true,
		fillColor   : '#33ffff25',
		fillOpacity : 0,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dot' },
		dashArray   : '2, 2',
		title       : 'Участок #1',
		type: 3
	},
	'area#green' : {
		stroke      : true,
		outline     : true,
		color       : '#FFFFFF',
		strokeColor : 'FFFFFFEE',
		fill        : false,
		fillColor   : '#00CC0060',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'solid' },
		dashArray   : '1',
		title       : 'Зелёный полигон',
		type: 3
	},
	'area#green' : {
		stroke      : true,
		outline     : true,
		color       : '#FFFFFF',
		strokeColor : 'FFFFFFEE',
		fill        : false,
		fillColor   : '#FFFF0060',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'solid' },
		dashArray   : '1',
		title       : 'Текущий полигон',
		type: 3
	},
	'area#hidden' : {
		stroke      : false,
		outline     : false,
		color       : '#FF0033',
		strokeColor : 'FF003300',
		fill        : false,
		fillColor   : '#FFFF0000',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'solid' },
		dashArray   : '1',
		title       : 'Скрытый полигон',
		type: 3
	},
	'area#editable' : {
		stroke      : true,
		outline     : true,
		color       : '#FF0033',
		strokeColor : 'FF0033EE',
		fill        : true,
		fillColor   : '#EE110060',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'solid' },
		dashArray   : '1',
		title       : 'Редактируется',
		type: 3
	},
	'circle#dotred' : {
		stroke      : true,
		outline     : true,
		color       : '#FF3300',
		strokeColor : 'FF3300',
		fill        : true,
		fillColor   : '#FF3300',
		fillOpacity : 0,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dash' },
		dashArray   : '2, 2',
		title       : 'Красный круг - объект',
		type: 4
	},
	'circle#dotyellow' : {
		stroke      : true,
		outline     : true,
		color       : '#FFFF00',
		strokeColor : 'FFFF00',
		fill        : true,
		fillColor   : '#FFFF00',
		fillOpacity : 0,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dash' },
		dashArray   : '2, 2',
		title       : 'Жёлтый круг - объект',
		type: 4
	},
	'circle#default' : {
		stroke      : true,
		outline     : true,
		color       : '#FFFFFF',
		strokeColor : 'FFFFFF',
		fill        : true,
		fillColor   : '#C6C6C6',
		fillOpacity : .2,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dash' },
		dashArray   : '2',
		title       : 'Жёлтый круг - объект',
		type: 4
	},
	'circle#dotgreen' : {
		stroke      : true,
		outline     : true,
		color       : '#00FF00',
		strokeColor : '00FF00',
		fill        : true,
		fillColor   : '#00FF00',
		fillOpacity : 0,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dash' },
		dashArray   : '2, 2',
		title       : 'Зелёный круг - объект',
		type: 4
	},
	'circle#dotorange' : {
		stroke      : true,
		outline     : true,
		color       : '#FF6600',
		strokeColor : 'FF6600',
		fill        : true,
		fillColor   : '#FF6600',
		fillOpacity : 0,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dash' },
		dashArray   : '2, 2',
		title       : 'Оранжевый круг - объект',
		type: 4
	},
	'circle#dotblue' : {
		stroke      : true,
		outline     : true,
		color       : '#0000FF',
		strokeColor : '0000FF',
		fill        : true,
		fillColor   : '#0000FF',
		fillOpacity : 0,
		strokeWidth : 2,
		weight      : 2,
		strokeStyle : { style : 'dash' },
		dashArray   : '2, 2',
		title       : 'Синий круг - объект',
		type: 4
	}
}
/*
style_rectangles = [
	['1', 'C6C6C660', '1', '2', 'FFFFFFEE', 'rct#default',    'solid','Стиль по умолчанию'],			//Набор: Mk. 2;
	['1', 'FF330060', '1', '2', 'FFFFFFEE', 'rct#red',        'solid','Красный прямоугольник'],			//Набор: Mk. 2;
	['1', '00CC0060', '1', '2', 'FFFFFFEE', 'rct#green',      'solid','Зелёный прямоугольник'],			//Набор: Mk. 2;
	['1', 'FFFF0060', '1', '2', 'FF0033EE', 'rct#current',    'solid','Текущий прямоугольник'],			//Набор: Mk. 2;
	['1', 'EE110060', '1', '2', 'FF0033EE', 'rct#editable',   'solid','Редактируется']					//Набор: Mk. 2;
],
style_circles = [
	['0', '00FF00',  0, .8, '1', '2', '00FF00', 'circle#dotgreen', 'dash'  , 'Зелёный круг - объект'],			//Набор: Mk. 2;
	['0', 'FF6600',  0, .8, '1', '2', 'FF6600', 'circle#dotorange','dash'  , 'Оранжевый круг - объект'],			//Набор: Mk. 2;
	['0', '0000FF',  0, .8, '1', '2', '0000FF', 'circle#dotblue',  'dash'  , 'Синий круг - объект'],			//Набор: Mk. 2;
	['1', 'FF3300', .6, .8, '1', '2', 'FFFFFF', 'circle#red',      'solid', 'Красный круг'],			//Набор: Mk. 2;
	['1', '00CC00', .6, .8, '1', '2', 'FFFFFF', 'circle#green',    'solid', 'Зелёный круг'],			//Набор: Mk. 2;
	['1', '0000CC', .6, .8, '1', '2', 'FFFFFF', 'circle#blue',     'solid', 'Синий круг'],				//Набор: Mk. 2;
	['1', '0000CC', .6, .8, '1', '2', 'FFFFFF', 'circle#hidden',   'solid', 'Скрытый круг'],			//Набор: Mk. 2;
	['1', 'FFFF00', .6, .8, '1', '2', 'FF0033', 'circle#current',  'solid', 'Текущий круг'],			//Набор: Mk. 2;
	['1', 'EE1100', .6, .8, '1', '2', 'FFFFFF', 'circle#editable', 'solid', 'Редактируется']			//Набор: Mk. 2;
];

for (var i in style_polygons){
	userstyles[style_polygons[i][5]] = {
		fill:        style_polygons[i][0],
		fillColor:   style_polygons[i][1],
		outline:     style_polygons[i][2],
		strokeWidth: style_polygons[i][3],
		strokeColor: style_polygons[i][4],
		strokeStyle: {
			style:   style_polygons[i][6]
		},
		type: 3
	};
}

for (var i in style_circles){
	userstyles[style_circles[i][7]] = {
		fill:        style_circles[i][0],
		fillColor:   style_circles[i][1],
		fillOpacity: style_circles[i][2],
		opacity:     style_circles[i][3],
		outline:     style_circles[i][4],
		strokeWidth: style_circles[i][5],
		strokeColor: style_circles[i][6],
		strokeStyle: {
			style:   style_circles[i][8]
		},
		type: 4
	};
}

for (var i in style_rectangles){
	userstyles[style_rectangles[i][5]] = {
		fill:        style_rectangles[i][0],
		fillColor:   style_rectangles[i][1],
		fillOpacity: style_rectangles[i][2],
		strokeWidth: style_rectangles[i][3],
		strokeColor: style_rectangles[i][4],
		strokeStyle: {
			style:   style_rectangles[i][6]
		},
		type: 5
	};
}
*/