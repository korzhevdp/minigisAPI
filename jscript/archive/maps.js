YMaps.jQuery(function () {
	var map = new YMaps.Map(document.getElementById("YMapsID"));
	var map_center = document.getElementById("map_center").value;

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
		if(typeof(style_entry.href)!='undefined'){
			//alert('das ist punkt');
			cns.iconStyle = new YMaps.IconStyle();
			cns.iconStyle.href = style_entry.href;
			cns.iconStyle.size = new YMaps.Point(26, 24);
			cns.iconStyle.offset = new YMaps.Point(0, 0);
		}
		if(typeof(style_entry.href)!='undefined'){
			//alert('das ist line');
			cns.lineStyle = new YMaps.LineStyle();
			cns.lineStyle.strokeColor = style_entry.strokeColor;
			cns.lineStyle.strokeWidth = style_entry.strokeWidth;
		}
		if(typeof(style_entry.outline)!='undefined'){
			//alert('das ist poligon');
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

	if(parent==0){var dragmode = true;}else{var dragmode = false;}// ��� ���������� � ������ �� �� ������� ������� ���� ���������, ��� ���������� ������� ����� �������� �� ������������ �� ����� � ��� ����� ������������� :)

	var objManager = new YMaps.ObjectManager();
	map.addOverlay(objManager);

	if(typeof(objects)!="undefined"){
		for(a in objects){
			v = new YMaps.Style();
			v = YMaps.Styles.get(objects[a].style);
			if(objects[a].coord!=""){
				lat = objects[a].coord.split(",")[0];
				lon = objects[a].coord.split(",")[1];
				var placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon), {style:v, hasHint: true});
				placemark.description = objects[a].description;
				placemark.name = objects[a].description;
				objManager.add(placemark,10,26);
			}
		}
	}

	if(typeof(object)!="undefined"){
		if(typeof(object.coord)!="undefined" && object.coord.length > 1){//������������� ��������� ����� ����� ������ ��� ��������� �������� ���������, ����� ����������� ������� ��������� :)
			document.getElementById('coords').value=object.coord;
			var lat = object.coord.split(",")[0];
			var lon = object.coord.split(",")[1];
			map.setCenter(new YMaps.GeoPoint(lat,lon), 14);
		}
		if(typeof(object.style)=="undefined"){
			object.style="user#curbuilding";
		}
		v = YMaps.Styles.get(object.style);
		var placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon),{style: v, hasHint: true, draggable: true});//<--��������
		placemark.description = object.description;
		placemark.name = object.description;
		placemark.setStyle(object.style);
		if(typeof(object.coord)!="undefined" && object.coord.length > 2){
			objManager.add(placemark,10,26);
		}
		YMaps.Events.observe(map, map.Events.Click, function(map, mEvent){
			placemark.setGeoPoint(mEvent.getGeoPoint());
			placemark.setOptions({style: v, hasHint: true, draggable: true});
			objManager.add(placemark,10,26);
			YMaps.jQuery("#coords").attr('value', placemark.getGeoPoint());
		});
		YMaps.Events.observe(placemark, placemark.Events.Drag, function(){
			YMaps.jQuery("#coords").attr('value', placemark.getGeoPoint());
		});
	}

	if(typeof(path)!="undefined" || typeof(paths)!="undefined"){
		var s = new YMaps.Style();
		s.lineStyle = new YMaps.LineStyle();
		s.lineStyle.strokeColor = 'FF0000F0';
		s.lineStyle.strokeWidth = '3';
		YMaps.Styles.add("example#CustomLine", s);

		for(a in paths){
			var pl = YMaps.Polyline.fromEncodedPoints(paths[a].coord);
			pl.setStyle(paths[a].style);
			map.addOverlay(pl);
		}

		var pl = YMaps.Polyline.fromEncodedPoints(path.coord);
		pl.setStyle("example#CustomLine");
		map.addOverlay(pl);
		(path.coord.length) ? map.setCenter(pl.getPoint(0)) : '';
		pl.startEditing();

		YMaps.Events.observe(map, map.Events.Click, function (map, mEvent) {
			pl.addPoint(mEvent.getGeoPoint());
		});
			

		YMaps.Events.observe(pl,pl.Events.PositionChange,function(){
			//YMaps.jQuery("#Points").html(pl.getPoints().join('\n'));
			YMaps.jQuery("#encpath").val(encodePoints(pl.getPoints()));
		});
	}

	if(typeof(region)!="undefined" || typeof(regions)!="undefined"){
		for(a in regions){
			var pl = YMaps.Polygon.fromEncodedPoints(regions[a].coord,'B',{style:regions[a].style});
			pl.setStyle(regions[a].style);
			map.addOverlay(pl);
		}

		var pl = YMaps.Polygon.fromEncodedPoints(region.coord,'A',{style: region.style,hasHint: 1,hasBalloon: 1});
		map.addOverlay(pl);
		(region.coord.length) ? map.setCenter(pl.getPoint(0)) : '';
		//alert(pl.getCenter());
		//map.setCenter(pl.getPoint(0));
		pl.startEditing();

		YMaps.Events.observe(map, map.Events.Click, function (map, mEvent) {
			pl.addPoint(mEvent.getGeoPoint());
		});
			

		YMaps.Events.observe(pl,pl.Events.PositionChange,function(){
			//YMaps.jQuery("#Points").html(pl.getPoints().join('\n'));
			YMaps.jQuery("#encpath").val(encodePoints(pl.getPoints()));
		});
	}
	// ����������� ���������
	var geoResult;
	function showAddress (value) {
		map.removeOverlay(geoResult);// �������� ����������� ���������� ������
		var geocoder = new YMaps.Geocoder(value, {results: 1, boundedBy: map.getBounds()});// ������ �������� ��������������
		YMaps.Events.observe(geocoder, geocoder.Events.Load, function () {// �������� ����������� ��� ��������� ���������� ��������������
			// ���� ������ ��� ������, �� ��������� ��� �� ����� � ���������� ����� �� ������� ������ ���������� �������
			if (this.length()) {
				geoResult = this.get(0);
				geoResult.setOptions({style: 'user#curbuilding', draggable:false});
				map.addOverlay(geoResult);
				map.setBounds(geoResult.getBounds());
			}else {
				alert("������ �� �������")
			}
		});
		YMaps.Events.observe(geocoder, geocoder.Events.Fault, function (geocoder, error) {	// ������� �������������� �������� ��������
			alert("��������� ������: " + error);
		});
	}
	$('#gQInit').click(function(){
		var value = $('#geoQuery').val();
		showAddress(value);
	});
});

//################################################### �������-����������
function encodePoints (points){		// ����������� ����� �������
	var array = [],					// ��������� ������ ��� �����
	prev = new YMaps.Point(0,0),	// ���������� �����
	coef = 1000000;					// �����������

	// � ������������ � �������� API:
	// 1.��������� �����
	// 2. ���������� �������� ������������ ���������� �����
	// 3. ��������� ������ ���������� ����� �� ����������� (1000000) � �����������
	// 4. ... � Base64

	for (var i = 0, geoVector, currentPoint; i < points.length;i++) {
		currentPoint = points[i].copy();
		geoVector = currentPoint.diff(prev).neg();
		array = array.concat(Base64.encode4bytes(geoVector.getX() * coef), Base64.encode4bytes(geoVector.getY() * coef));
		prev = currentPoint;
	}
	return Base64.encode(array);
}

	// ����� ��� ������ � Base64 - ����� �����.
	// �� ������ ���� ����� � http://www.webtoolkit.info/
var Base64 = new function () {
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
	// ���������� ������� - ����� encode4bytes();
	this.encode4bytes = function (x) {
		var chr = [];
		for (var i = 0; i < 4; i++){
			chr[i] = x & 0x000000ff;
			x = x >> 8;
		}
		return chr;
	}
	// ���������� ������� - ����� encode();
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