var userstyles = [],
api_domain = "http://api.korzhevdp.com",
style_src = [
	[api_domain + '/images/userstyles/redarrowdown.png',  [26,24],'user#here','Вы здесь',[-12,-24]],						//Набор: pandora Дизайнер: Mike Beecham
	[api_domain + '/images/userstyles/park2.png',         [26,24],'user#citypark','Городской парк',[-12,-24]],			//Набор: map icons//Дизайнер: Nicolas Mollet;
	[api_domain + '/images/userstyles/disability25.png',  [26,24],'user#disability25','ОВ доступность 75%',[-12,-24]],	//Набор: map icons//Дизайнер: Nicolas Mollet;
	[api_domain + '/images/userstyles/disability50.png',  [26,24],'user#disability50','ОВ доступность 50%',[-12,-24]],	//Набор: map icons//Дизайнер: Nicolas Mollet;
	[api_domain + '/images/userstyles/disability75.png',  [26,24],'user#disability75','ОВ доступность 25%',[-12,-24]],	//Набор: map icons//Дизайнер: Nicolas Mollet;
	[api_domain + '/images/userstyles/disability100.png', [26,24],'user#disability100','ОВ доступность 0%',[-12,-24]],	//Набор: map icons//Дизайнер: Nicolas Mollet;
	[api_domain + '/images/userstyles/aquarium.png',      [32,37],'user#aquarium','Аквариум',[-16,-37]],						//Набор: map icons//Дизайнер: Nicolas Mollet;
	[api_domain + '/images/userstyles/rus_avia.png',      [32,28],'airshow#rus','Пилотажная группа Русь',[-16,-14]],
	[api_domain + '/images/userstyles/ds.png',            [26,24],'user#dsm','Детский сад',[-13,-24]],
	[api_domain + '/images/userstyles/ds.png',            [26,24],'user#dsm','Детский сад тип 2',[-13,-24]],
	[api_domain + '/images/userstyles/ds.png',            [26,24],'user#dsm','Детский сад тип 3',[-13,-24]],
	[api_domain + '/images/userstyles/ds.png',            [26,24],'user#artsschool','Художественная школа',[-13,-24]],
	[api_domain + '/images/userstyles/ds.png',            [26,24],'user#сschool','Общеобразовательная школа',[-13,-24]],
	[api_domain + '/images/userstyles/ds.png',            [26,24],'user#sportsschool','ДЮСШ',[-13,-24]],
	[api_domain + '/images/userstyles/fire.png',          [32,32],'alert#fire','Огонь',[-16,-32]],
	[api_domain + '/images/userstyles/fire.png',          [32,32],'alert#water','Вода',[-16,-32]],
	[api_domain + '/images/userstyles/fire.png',          [32,32],'alert#gas','Газ',[-16,-32]],
	[api_domain + '/images/userstyles/fire.png',          [32,32],'alert#btu','Теплоснабжение',[-16,-32]],
	[api_domain + '/images/nodal.life/b737N.png',         [32,32],'nodal#b737','Боинг-737-500',[-16,-16]],

	[api_domain + '/images/userstyles/fire.png',          [32,32],'user#fire','Огонь',[-16,-32]],
	[api_domain + '/images/luftmaps/anchor.png',          [21,28],'user#anchor','Пристань',[-11,-28]],
	[api_domain + '/images/luftmaps/church.png',          [21,28],'user#church','Церковь',[-11,-28]],
	[api_domain + '/images/luftmaps/jew.png',             [21,28],'user#jews','Евреи',[-11,-28]],
	[api_domain + '/images/luftmaps/maid.png',            [21,28],'user#maid','Сестра милосердия',[-11,-28]],
	[api_domain + '/images/luftmaps/policeman.png',       [21,28],'user#police','Полиция',[-11,-28]],
	[api_domain + '/images/luftmaps/soldier.png',         [21,28],'user#soldier','Военные',[-11,-28]],
	[api_domain + '/images/luftmaps/student.png',         [21,28],'user#student','Студент',[-11,-28]],
	[api_domain + '/images/luftmaps/studentf.png',        [21,28],'user#studentf','Институтка',[-11,-28]],
	[api_domain + '/images/luftmaps/tower.png',           [21,28],'user#tower','Башня замка',[-11,-28]],
	[api_domain + '/images/luftmaps/transmit.png',        [21,28],'user#transmit','Передатчик',[-11,-28]],
	[api_domain + '/images/luftmaps/wall.png',            [21,28],'user#wall','Стена',[-11,-28]]

],
style_system = [
	[api_domain + '/images/userstyles/layer_aspect_arrow.png',  [16,16], 'system#arrowldn',  'Левый нижний',   [0,-16]   ],
	[api_domain + '/images/userstyles/layer_aspect_arrow2.png', [16,16], 'system#arrowrup',  'Правый верхний', [-16,0]   ],
	[api_domain + '/images/userstyles/arrow_in.png',            [32,32], 'system#arrowcen',  'Центр',          [-16,-16] ],						//FatCow Icon Set
	[api_domain + '/images/userstyles/arrow_right.png',         [32,32], 'system#arrowrad',  'Радиус',         [-32,-16] ],						// FatCow Icon Set
	[api_domain + '/images/userstyles/flag_2.png',              [16,16], 'system#blueflag',  'Маркер',         [-3,-16]  ],						//FatCow Icon Set
	[api_domain + '/images/userstyles/flag_1.png',              [16,16], 'system#greenflag', 'Маркер',         [-3,-16]  ]						// FatCow Icon Set
],
style_paths = [
	['0099CCEE', '3', 'routes#bus',        'solid',    'Автобусный маршрут'],		//Набор: Mk. 2;
	['0080C0EE', '3', 'routes#walk',       'solid',    'Пеший маршрут'],			//Набор: Mk. 2;
	['FFFF00EE', '3', 'routes#car',        'solid',    'Автомобильный маршрут'],	//Набор: Mk. 2;
	['0000FFEE', '3', 'routes#vessel',     'solid',    'Водный маршрут'],			//Набор: Mk. 2;
	['330000EE', '3', 'routes#railroad',   'solid',    'ЖД маршрут'],				//Набор: Mk. 2;
	['66FFFFEE', '3', 'routes#air',        'solid',    'Авиамаршрут'],				//Набор: Mk. 2;
	['66CC00EE', '3', 'routes#bike',       'solid',    'Веломаршрут'],				//Набор: Mk. 2;
	['339900EE', '3', 'routes#wire',       'solid',    'Проводная линия'],			//Набор: Mk. 2;
	['CC0000EE', '3', 'routes#xdsl',       'dot',      'xDSL линия'],				//Набор: Mk. 2;
	['C6C6C6EE', '3', 'routes#default',    'solid',    'Стиль по умолчанию'],		//Набор: Mk. 2;
	['FF7700EE', '3', 'routes#eventroute', 'dashdot',  'Маршрут события'],			//Набор: Mk. 2;
	['FF0033EE', '3', 'routes#current',    'solid',    'Текущий маршрут'],			//Набор: Mk. 2;
	['FF3333EE', '3', 'routes#metro',      'solid',    'Сферическое метро'],		//Набор: Mk. 2;
	['656565FF', '3', 'metro#grey',        'solid',    'Метро. Серая линия'],		//Набор: Mk. 2;
	['FF8200FF', '3', 'metro#orange',      'solid',    'Метро. Оранжевая линия'],	//Набор: Mk. 2;
	['DF1707FF', '3', 'metro#red',         'solid',    'Метро. Красная линия'],		//Набор: Mk. 2;
	['140871FF', '3', 'metro#blue',        'solid',    'Метро. Синяя линия'],		//Набор: Mk. 2;
	['8AB228FF', '3', 'metro#yellowgreen', 'solid',    'Метро. Салатовая линия'],	//Набор: Mk. 2;
	['FBC724FF', '3', 'metro#yellow',      'solid',    'Метро. Жёлтая линия'],		//Набор: Mk. 2;
	['860C45FF', '3', 'metro#magenta',     'solid',    'Метро. Сиреневая линия'],	//Набор: Mk. 2;
	['0C451CFF', '3', 'metro#green',       'solid',    'Метро. Зелёная линия'],		//Набор: Mk. 2;
	['294D9FFF', '3', 'metro#skyblue',     'solid',    'Метро. Голубая линия'],		//Набор: Mk. 2;
	['3B1B0BFF', '3', 'metro#circular',    'solid',    'Метро. Кольцевая линия'],	//Набор: Mk. 2;
	['EEEEEEFF', '3', 'metro#other',       'dot',      'Метро. Прочие ветки'],		//Набор: Mk. 2;
	['EE1100FF', '3', 'routes#editable',   'solid',    'Редактируется'],			//Набор: Mk. 2;
	['0000FF66', '2', 'nodal#basair',      'dot',      'Опорный авиамаршрут']		//Набор: Nodal;
],
style_polygons = [
	['1', 'C6C6C660', '1', '2', 'FFFFFFEE', 'area#default',   'solid',   'Стиль по умолчанию'],			//Набор: Mk. 2;
	['1', 'FF330060', '1', '2', 'FFFFFFEE', 'area#red',       'solid',   'Красный полигон'],			//Набор: Mk. 2;
	['1', 'ffffff25', '1', '2', '99FF00EE', 'area#district',  'dot',     'Территориальный округ #0'],	//Набор: Mk. 2;
	['1', 'ffff6625', '1', '2', '99FF00EE', 'area#district1',  'dot',    'Территориальный округ #1'],	//Набор: Mk. 2;
	['1', '3333ff25', '1', '2', '99FF00EE', 'area#district2',  'dot',    'Территориальный округ #2'],	//Набор: Mk. 2;
	['1', '00ff3325', '1', '2', '99FF00EE', 'area#district3',  'dot',    'Территориальный округ #3'],	//Набор: Mk. 2;
	['1', '66ff3325', '1', '2', '99FF00EE', 'area#district4',  'dot',    'Территориальный округ #4'],	//Набор: Mk. 2;
	['1', '9900ff25', '1', '2', '99FF00EE', 'area#district5',  'dot',    'Территориальный округ #5'],	//Набор: Mk. 2;
	['1', '33000025', '1', '2', '99FF00EE', 'area#district6',  'dot',    'Территориальный округ #6'],	//Набор: Mk. 2;
	['1', 'ccff0025', '1', '2', '99FF00EE', 'area#district7',  'dot',    'Территориальный округ #7'],	//Набор: Mk. 2;
	['1', '33ffff25', '1', '2', '99FF00EE', 'area#district8',  'dot',    'Территориальный округ #8'],	//Набор: Mk. 2;
	['0', '33ffff25', '1', '2', '99FF00EE', 'area#area1',      'dot',    'Участок #1'],	//Набор: Mk. 2;
	['1', '00CC0060', '1', '2', 'FFFFFFEE', 'area#green',     'solid',   'Зелёный полигон'],			//Набор: Mk. 2;
	['1', 'FFFF0060', '1', '2', 'FF0033EE', 'area#current',   'solid',   'Текущий полигон'],			//Набор: Mk. 2;
	['1', 'FFFF0000', '1', '2', 'FF003300', 'area#hidden',    'solid',   'Скрытый полигон'],			//Набор: Mk. 2;
	['1', 'EE110060', '1', '2', 'FF0033EE', 'area#editable',  'solid',   'Редактируется']				//Набор: Mk. 2;
],
style_rectangles = [
	['1', 'C6C6C660', '1', '2', 'FFFFFFEE', 'rct#default',    'solid','Стиль по умолчанию'],			//Набор: Mk. 2;
	['1', 'FF330060', '1', '2', 'FFFFFFEE', 'rct#red',        'solid','Красный прямоугольник'],			//Набор: Mk. 2;
	['1', '00CC0060', '1', '2', 'FFFFFFEE', 'rct#green',      'solid','Зелёный прямоугольник'],			//Набор: Mk. 2;
	['1', 'FFFF0060', '1', '2', 'FF0033EE', 'rct#current',    'solid','Текущий прямоугольник'],			//Набор: Mk. 2;
	['1', 'EE110060', '1', '2', 'FF0033EE', 'rct#editable',   'solid','Редактируется']					//Набор: Mk. 2;
],
style_circles = [
	['1', 'C6C6C6', .6, .8, '1', '2', 'FFFFFF', 'circle#default',  'solid', 'Стиль по умолчанию'],		//Набор: Mk. 2;
	['0', 'FF3300',  0, .8, '1', '2', 'FF3300', 'circle#dotred',   'dash'  , 'Красный круг - объект'],			//Набор: Mk. 2;
	['0', 'FFFF00',  0, .8, '1', '2', 'FFFF00', 'circle#dotyellow','dash'  , 'Жёлтый круг - объект'],			//Набор: Mk. 2;
	['0', '00FF00',  0, .8, '1', '2', '00FF00', 'circle#dotgreen', 'dash'  , 'Зелёный круг - объект'],			//Набор: Mk. 2;
	['0', 'FF6600',  0, .8, '1', '2', 'FF6600', 'circle#dotorange','dash'  , 'Оранжевый круг - объект'],			//Набор: Mk. 2;
	['0', '0000FF',  0, .8, '1', '2', '0000FF', 'circle#dotblue',  'dash'  , 'Синий круг - объект'],			//Набор: Mk. 2;
	['1', 'FF3300', .6, .8, '1', '2', 'FFFFFF', 'circle#red',      'solid', 'Красный круг'],			//Набор: Mk. 2;
	['1', '00CC00', .6, .8, '1', '2', 'FFFFFF', 'circle#green',    'solid', 'Зелёный круг'],			//Набор: Mk. 2;
	['1', '0000CC', .6, .8, '1', '2', 'FFFFFF', 'circle#blue',     'solid', 'Синий круг'],				//Набор: Mk. 2;
	['1', '0000CC', .6, .8, '1', '2', 'FFFFFF', 'circle#hidden',   'solid', 'Скрытый круг'],			//Набор: Mk. 2;
	['1', 'FFFF00', .6, .8, '1', '2', 'FF0033', 'circle#current',  'solid', 'Текущий круг'],			//Набор: Mk. 2;
	['1', 'EE1100', .6, .8, '1', '2', 'FFFFFF', 'circle#editable', 'solid', 'Редактируется']			//Набор: Mk. 2;
],
yandex_styles = [
'<option value="twirl#airplaneIcon">аэропорт</option>',
'<option value="twirl#busIcon">автобус</option>',
'<option value="twirl#carIcon">автомобиль</option>',
'<option value="twirl#gasStationIcon">АГЗС</option>',
'<option value="twirl#badmintonIcon">бадминтон</option>',
'<option value="twirl#bankIcon">банк</option>',
'<option value="twirl#barIcon">бар</option>',
'<option value="twirl#buildingsIcon">бизнес-центр</option>',
'<option value="twirl#bowlingIcon">боулинг</option>',
'<option value="twirl#bicycleIcon">велосипед</option>',
'<option value="twirl#anchorIcon">гавань</option>',
'<option value="twirl#hospitalIcon">госпиталь</option>',
'<option value="twirl#mushroomIcon">грибы</option>',
'<option value="twirl#truckIcon">грузовик</option>',
'<option value="twirl#houseIcon">дом</option>',
'<option value="twirl#dpsIcon">ДПС</option>',
'<option value="twirl#factoryIcon">завод</option>',
'<option value="twirl#skiingIcon">катание на лыжах</option>',
'<option value="twirl#cafeIcon">кафе</option>',
'<option value="twirl#campingIcon">кемпинг</option>',
'<option value="twirl#cinemaIcon">кинотеатр</option>',
'<option value="twirl#skatingIcon">коньки</option>',
'<option value="twirl#shopIcon">магазин</option>',
'<option value="twirl#workshopIcon">мастерская</option>',
'<option value="twirl#keyMasterIcon">мастерская ключей</option>',
'<option value="twirl#metroYekaterinburgIcon">метро Екатеринбург</option>',
'<option value="twirl#metroKievIcon">метро Киев</option>',
'<option value="twirl#metroMoscowIcon">метро Москва</option>',
'<option value="twirl#metroStPetersburgIcon">метро С-Петербург</option>',
'<option value="twirl#motobikeIcon">мотоцикл</option>',
'<option value="twirl#barberShopIcon">парикмахерская</option>',
'<option value="twirl#pingPongIcon">пинг-понг</option>',
'<option value="twirl#swimmingIcon">плавание</option>',
'<option value="twirl#turnLeftIcon">поворот налево</option>',
'<option value="twirl#turnRightIcon">поворот направо</option>',
'<option value="twirl#trainIcon">поезд</option>',
'<option value="twirl#tailorShopIcon">портной</option>',
'<option value="twirl#mailPostIcon">почта</option>',
'<option value="twirl#shipIcon">пристань</option>',
'<option value="twirl#restaurauntIcon">ресторан</option>',
'<option value="twirl#fishingIcon">рыбалка</option>',
'<option value="twirl#wifiIcon">сети Wi-Fi</option>',
'<option value="twirl#wifiLogoIcon">сеть Wi-Fi логотип</option>',
'<option value="twirl#storehouseIcon">склад</option>',
'<option value="twirl#downhillSkiingIcon">слалом</option>',
'<option value="twirl#gymIcon">спортзал</option>',
'<option value="twirl#stadiumIcon">стадион</option>',
'<option value="twirl#arrowDownRightIcon">стрелка 4 часа</option>',
'<option value="twirl#arrowDownLeftIcon">стрелка 7 часов</option>',
'<option value="twirl#arrowUpIcon">стрелка вверх</option>',
'<option value="twirl#arrowLeftIcon">стрелка налево</option>',
'<option value="twirl#arrowRightIcon">стрелка направо</option>',
'<option value="twirl#dryCleanerIcon">сухая чистка</option>',
'<option value="twirl#theaterIcon">театр</option>',
'<option value="twirl#phoneIcon">телефон</option>',
'<option value="twirl#smartphoneIcon">телефон (смарт)</option>',
'<option value="twirl#cellularIcon">телефон (сотовый)</option>',
'<option value="twirl#tennisIcon">теннис</option>',
'<option value="twirl#tramwayIcon">трамвай</option>',
'<option value="twirl#trolleybusIcon">троллейбус</option>',
'<option value="twirl#photographerIcon">фотограф</option>',
'<option value="twirl#tireIcon">шиномонтаж</option>',
'<option value="twirl#electricTrainIcon">электропоезд</option>'
],
yandex_markers = [
'<option value="twirl#whiteIcon">Белый маркер</option>',
'<option value="twirl#whiteDotIcon">Белый маркер с точкой</option>',
'<option value="twirl#blueIcon">Голубой маркер</option>',
'<option value="twirl#blueDotIcon">Голубой маркер с точкой</option>',
'<option value="twirl#yellowIcon">Жёлтый маркер</option>',
'<option value="twirl#yellowDotIcon">Жёлтый маркер с точкой</option>',
'<option value="twirl#greenIcon">Зелёный маркер</option>',
'<option value="twirl#greenDotIcon">Зёлёный маркер с точкой</option>',
'<option value="twirl#brownIcon">Коричневый маркер</option>',
'<option value="twirl#brownDotIcon">Коричневый маркер с точкой</option>',
'<option value="twirl#redIcon">Красный маркер</option>',
'<option value="twirl#redDotIcon">Красный маркер с точкой</option>',
'<option value="twirl#orangeIcon">Оранжевый маркер</option>',
'<option value="twirl#orangeDotIcon">Оранжевый маркер с точкой</option>',
'<option value="twirl#pinkIcon">Розовый маркер</option>',
'<option value="twirl#pinkDotIcon">Розовый маркер с точкой</option>',
'<option value="twirl#lightblueIcon">Светло-синий маркер</option>',
'<option value="twirl#lightblueDotIcon">Светло-синий маркер с точкой</option>',
'<option value="twirl#greyIcon">Серый маркер</option>',
'<option value="twirl#greyDotIcon">Серый маркер с точкой</option>',
'<option value="twirl#darkgreenIcon">Тёмно-зелёный маркер</option>',
'<option value="twirl#darkgreenDotIcon">Тёмно-зелёный маркер с точкой</option>',
'<option value="twirl#darkorangeIcon">Тёмно-оранжевый маркер</option>',
'<option value="twirl#darkorangeDotIcon">Тёмно-оранжевый маркер с точкой</option>',
'<option value="twirl#darkblueIcon">Тёмно-синий маркер</option>',
'<option value="twirl#darkblueDotIcon">Тёмно-синий маркер с точкой</option>',
'<option value="twirl#violetIcon">Фиолетовый маркер</option>',
'<option value="twirl#violetDotIcon">Фиолетовый маркер с точкой</option>',
'<option value="twirl#nightIcon">Цвет ночи маркер</option>',
'<option value="twirl#nightDotIcon">Цвет ночи маркер с точкой</option>',
'<option value="twirl#blackIcon">Чёрный маркер</option>',
'<option value="twirl#blackDotIcon">Чёрный маркер с точкой</option>'];

/// packing styles
for (var i in style_src){
	userstyles[style_src[i][2]] = {
		iconImageHref:   style_src[i][0],
		iconImageSize:   style_src[i][1],
		iconImageOffset: style_src[i][4],
		name: style_src[i][3],
		type: 1
	};
}

for (var i in style_system){
	userstyles[style_system[i][2]] = {
		iconImageHref:   style_system[i][0],
		iconImageSize:   style_system[i][1],
		iconImageOffset: style_system[i][4],
		name: style_system[i][3],
		type: 1
	};
}

for (var i in style_paths){
	userstyles[style_paths[i][2]] = {
		strokeColor: style_paths[i][0],
		strokeWidth: style_paths[i][1],
		strokeStyle: {
			style: style_paths[i][3]
		},
		name: style_paths[i][4],
		type: 2
	};
}

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
		name: style_polygons[i][7],
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
		name: style_circles[i][9],
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
		name: style_rectangles[i][7],
		type: 5
	};
}

/*
navigator.geolocation.getCurrentPosition(
    function(position) {
	    alert('Последний раз вас засекали здесь: ' +
		    position.coords.latitude + ", " + position.coords.longitude);
	}
);*/