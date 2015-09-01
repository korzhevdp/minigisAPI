YMaps.jQuery(function () {
	var map = new YMaps.Map(YMaps.jQuery("#YMapsID"));
	var map_center = YMaps.jQuery("#map_center").val();

	lat = map_center.split(",")[0];
	lon = map_center.split(",")[1];
	map.setCenter(new YMaps.GeoPoint(lat,lon), 14);

	map.addControl(new YMaps.TypeControl());
	map.addControl(new YMaps.ToolBar());
	map.addControl(new YMaps.Zoom());
	map.addControl(new YMaps.ScaleLine());
	map.enableScrollZoom();
	map.setType(YMaps.MapType.HYBRID);

	//Defining Styles
	function define_style(style_entry){
		var cns = new YMaps.Style();
		if(style_entry.type == 1){
			cns.iconStyle = new YMaps.IconStyle();
			cns.iconStyle.href = style_entry.href;
			cns.iconStyle.size = new YMaps.Point(26, 24);
			cns.iconStyle.offset = new YMaps.Point(0, 0);
		}
		if(style_entry.type == 2){
			cns.lineStyle = new YMaps.LineStyle();
			cns.lineStyle.strokeColor = style_entry.strokeColor;
			cns.lineStyle.strokeWidth = style_entry.strokeWidth;
		}
		if(style_entry.type == 3){
			cns.polygonStyle = new YMaps.PolygonStyle();
			cns.polygonStyle.fill = style_entry.fill;
			cns.polygonStyle.outline = style_entry.outline;
			cns.polygonStyle.strokeWidth = style_entry.strokeWidth;
			cns.polygonStyle.strokeColor = style_entry.strokeColor;
			cns.polygonStyle.fillColor = style_entry.fillColor;
		}
		YMaps.Styles.add(style_entry.label,cns);
	}
	for(id in userstyles){
		define_style(userstyles[id]);
	}
	//Defining Styles

	if(parent==0){var dragmode = true;}else{var dragmode = false;}// эту инструкцию и ссылку на неё следует удалить если выяснится, что подчинённые объекты могут отстоять от родительских по карте и это будет принципиально :)

	var objManager = new YMaps.ObjectManager();
	map.addOverlay(objManager);

	for(a in objects){
		var src = objects[a];
		if(src.pr == 1){
			// вычисляем компоненты координаты из строкового представления.
			var lat = src.coord.split(",")[0];
			var lon = src.coord.split(",")[1];
			if (current == a){
				if(src.coord.length > 3){//центроваться на текущую метку следует только при непустом значении обоих компонент координат, иначе оказываемся посреди Атлантики :)
					YMaps.jQuery("#coords").val(src.coord);
					map.setCenter(new YMaps.GeoPoint(lat,lon), 14);
				}
				var c_placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon),{style: YMaps.Styles.get("user#curbuilding"), hasHint: true, draggable: true});//<--ссылочка
				c_placemark.description = src.description;
				objManager.add(c_placemark,10,26);
				
			}else{
				var placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon),{style: YMaps.Styles.get(src.style), hasHint: true, draggable: false});//<--ссылочка
				placemark.description = src.description;
				objManager.add(placemark,10,26);
			}
		}

		if(src.pr == 2){
			if(current == a){
				var с_pl = YMaps.Polyline.fromEncodedPoints(src.coord);
				с_pl.setStyle("routes#current");
				map.addOverlay(с_pl);
				с_pl.startEditing(); // включаем редактирование линии
				(src.coord.length) ? map.setCenter(с_pl.getPoint(0)) : ''; // центруемся по первой точке
			}else{
				var pl = YMaps.Polyline.fromEncodedPoints(src.coord);
				pl.setStyle(src.style);
				map.addOverlay(pl);
			}
		}

		if(src.pr == 3){
			if(current == a){
				var c_pl = YMaps.Polygon.fromEncodedPoints(src.coord,'A',{style:src.style,hasHint: 1,hasBalloon: 1});
				c_pl.setStyle(src.style);
				map.addOverlay(c_pl);
				(src.coord.length) ? map.setCenter(c_pl.getPoint(0)) : ''; // центруемся по первой точке
				c_pl.startEditing();// включаем редактирование полигона
			}else{
				var pl = YMaps.Polygon.fromEncodedPoints(src.coord,'B',{style:src.style});
				pl.setStyle(src.style);
				map.addOverlay(pl);
			}
		}
	}
	var shown = YMaps.jQuery("#pr").val();
	//подключаем прослушивание событий
	if(shown == 1){ // если был показан активый объект типа "точка"
	// слушаем следующие события:
		YMaps.Events.observe(map, map.Events.Click, function(map, mEvent){ // щелчок по карте
			c_placemark.setGeoPoint(mEvent.getGeoPoint()); // подхватываем точку
			c_placemark.setOptions({style: YMaps.Styles.get("user#curbuilding"), hasHint: true, draggable: true}); // устанавливаем свойства
			objManager.add(c_placemark,1,30); // помещаем на карту
			YMaps.jQuery("#coords").val(c_placemark.getGeoPoint());//обновление поля с координатой
		});
		YMaps.Events.observe(c_placemark, c_placemark.Events.Drag, function(){ //перетаскивание метки (только для тех, что draggable: true)
			YMaps.jQuery("#coords").val(c_placemark.getGeoPoint()); //обновление поля с координатой
		});
	}

	if(shown == 2){
		if(!YMaps.jQuery("#encpath").val().length){
			var c_pl = new YMaps.Polyline([], {style: 'routes#current',hasHint: 1,hasBalloon: 1}); 	
			map.addOverlay(c_pl);
			c_pl.startEditing();// включаем редактирование полигона
		}
		// слушаем следующие события:
		YMaps.Events.observe(map, map.Events.Click, function (map, mEvent) {//щелчок по карте
			с_pl.addPoint(mEvent.getGeoPoint()); // добавляем точку от линии на карту
		});
		
		YMaps.Events.observe(с_pl,с_pl.Events.PositionChange,function(){//подвигали одну из точек вершин
			YMaps.jQuery("#encpath").val(encodePoints(с_pl.getPoints()));//закодировать координаты и положить их в поле
		});
	}
	if(shown == 3){
		if(!YMaps.jQuery("#encpath").val().length){
			var c_pl = new YMaps.Polygon([], {style: 'area#default',hasHint: 1,hasBalloon: 1}); 	
			map.addOverlay(c_pl);
			c_pl.startEditing();// включаем редактирование полигона
		}
		// слушаем следующие события:
		YMaps.Events.observe(map, map.Events.Click, function (map, mEvent) {//щелчок по карте
			c_pl.addPoint(mEvent.getGeoPoint());// добавляем вершину фигуры на карту
		});

		YMaps.Events.observe(c_pl,c_pl.Events.PositionChange,function(){//подвигали одну из точек вершин
			YMaps.jQuery("#encpath").val(encodePoints(c_pl.getPoints()));//закодировать координаты и положить их в поле
		});
	}

	// подключение геокодера
		var geoResult;
		function showAddress (value) {
			map.removeOverlay(geoResult);// Удаление предыдущего результата поиска
			var geocoder = new YMaps.Geocoder(value, {results: 1, boundedBy: map.getBounds()});// Запуск процесса геокодирования
			YMaps.Events.observe(geocoder, geocoder.Events.Load, function () {// Создание обработчика для успешного завершения геокодирования
				// Если объект был найден, то добавляем его на карту и центрируем карту по области обзора найденного объекта
				if (this.length()) {
					geoResult = this.get(0);
					geoResult.setOptions({style: 'user#curbuilding', draggable:false});
					map.addOverlay(geoResult);
					map.setBounds(geoResult.getBounds());
				}else {
					alert("Ничего не найдено")
				}
			});
			YMaps.Events.observe(geocoder, geocoder.Events.Fault, function (geocoder, error) {	// Процесс геокодирования завершен неудачно
				alert("Произошла ошибка: " + error);
			});
		}
		$('#gQInit').click(function(){
			var value = $('#geoQuery').val();
			showAddress(value);
		});

});


//################################################### утилиты-упаковщики
function encodePoints (points){		// Кодирование точек ломаной
	var array = [],					// Временный массив для точек
	prev = new YMaps.Point(0,0),	// Предыдущая точка
	coef = 1000000;					// Коэффициент

	// В соответствии с мануалом API:
	// 1.Обработка точек
	// 2. Нахождение смещения относительно предыдущей точки
	// 3. Умножение каждой координаты точки на коэффициент (1000000) и кодирование
	// 4. ... в Base64

	for (var i = 0, geoVector, currentPoint; i < points.length;i++) {
		currentPoint = points[i].copy();
		geoVector = currentPoint.diff(prev).neg();
		array = array.concat(Base64.encode4bytes(geoVector.getX() * coef), Base64.encode4bytes(geoVector.getY() * coef));
		prev = currentPoint;
	}
	return Base64.encode(array);
}

	// Класс для работы с Base64 - Сущая магия.
	// За основу взят класс с http://www.webtoolkit.info/
var Base64 = new function () {
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
	// определяем функцию - метод encode4bytes();
	this.encode4bytes = function (x) {
		var chr = [];
		for (var i = 0; i < 4; i++){
			chr[i] = x & 0x000000ff;
			x = x >> 8;
		}
		return chr;
	}
	// определяем функцию - метод encode();
	this.encode = function (input) {
		var output = "",chr1,chr2,chr3,enc1,enc2,enc3,enc4,i =0,inputIsString = typeof input == "string";
		while (i < input.length) {
			chr1 = input[i++];
			chr2 = input[i++];
			chr3 = input[i++];

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)){enc3 = enc4 = 64;}
			else if (isNaN(chr3)){enc4 = 64;}

			output += _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}
}