//######################################### процессор карты #########################################################
function display_locations(current) {
	var map = new YMaps.Map(YMaps.jQuery("#YMapsID"));
	var current_zoom = YMaps.jQuery("#current_zoom").val();

	if(typeof(current) == 'undefined' || current == 0){
		var map_center = YMaps.jQuery("#map_center").val();
	
	}else{
		if(typeof(node)!="undefined" && typeof(node[current])!="undefined" && (node[current].coord)!= "undefined"){
			var map_center = node[current].coord;
			//alert(222);
		}
		if(typeof(gis)!="undefined" && typeof(gis[current])!="undefined" && (gis[current].coord)!= "undefined"){
			var map_center = gis[current].coord;
			//alert(333);
		}
		if(typeof(rts)!="undefined" && typeof(rts[current])!="undefined" && (rts[current].coord)!= "undefined"){
			var map_center = String(YMaps.Polyline.fromEncodedPoints(rts[current].coord).getPoint(0));
			//alert(map_center);
		}
	}
	lat = map_center.split(",")[0];
	lon = map_center.split(",")[1];
	map.setCenter(new YMaps.GeoPoint(lat,lon), current_zoom);
	map.addControl(new YMaps.TypeControl([YMaps.MapType.SATELLITE,YMaps.MapType.HYBRID,YMaps.MapType.MAP]));
	map.addControl(new YMaps.ToolBar());
	map.addControl(new YMaps.Zoom());
	map.addControl(new YMaps.ScaleLine());
	map.enableScrollZoom();

	switch (YMaps.jQuery("#current_type").val()){
		case 'Гибрид':
			map.setType(YMaps.MapType.HYBRID);
		break;
		case 'Спутник' :
			map.setType(YMaps.MapType.SATELLITE);
		break;
		case 'Схема':
		default:
			map.setType(YMaps.MapType.MAP);
		break
	}

	//Defining Styles
	function define_style(style_entry){
		var cns = new YMaps.Style();
		if(typeof(style_entry.href)!='undefined'){
			cns.iconStyle = new YMaps.IconStyle();
			cns.iconStyle.href = style_entry.href;
			cns.iconStyle.size = new YMaps.Point(26, 24);
			cns.iconStyle.offset = new YMaps.Point(0, 0);
		}
		if(typeof(style_entry.strokeColor)!='undefined'){
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

	var v = new YMaps.Style();
	var template = new YMaps.Template('<div class="ymaps_balloon"><div class="gallery" id="l_photo" style="float:left;margin:2 px;"><a href="/userimages/800/$[img|nophoto.gif]"><IMG SRC="/userimages/32/$[img|nophoto.gif]" ALT="мини"></a></div><B>Название:</B> $[name| без имени]<br><B>Адрес:</B> $[description|нет]<br><B>Контакты:</B> $[contact|контактное лицо]<br><br><B><U><A HREF="$[link|ссылка]" style="margin-bottom:10px;">Подробности здесь</A></B></U></div>');
	

	var objManager = new YMaps.ObjectManager();
	map.addOverlay(objManager);
	
	for(a in zy){
		alert(a);
	}
/*
	if(typeof(node)!='undefined'){
		for(a in node){
			var v = YMaps.Styles.get("default#attentionIcon");
			v = (a==current) ? YMaps.Styles.get("user#curbuilding") : YMaps.Styles.get(node[a].attr);
			v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
			lat = node[a].coord.split(",")[0];
			lon = node[a].coord.split(",")[1];
			var placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon), {style:v, hasHint: true});
			placemark.img = node[a].img;
			placemark.description = node[a].description;
			placemark.link = node[a].link;
			placemark.contact = node[a].contact;
			placemark.name = node[a].name;
			objManager.add(placemark, 12, 30);
		}
	}

	if(typeof(gis) != 'undefined'){
		for(a in gis){
			//v = YMaps.Styles.get(gis[a].attr);
			v = (a==current) ? YMaps.Styles.get("user#curbuilding") : YMaps.Styles.get(gis[a].attr);
			v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
			lat = gis[a].coord.split(",")[0];
			lon = gis[a].coord.split(",")[1];
			var placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon), {style:v, hasHint: true});
			placemark.img = gis[a].img;
			placemark.description = gis[a].description;
			placemark.link = gis[a].link;
			placemark.contact = gis[a].contact;
			placemark.name = gis[a].name;
			objManager.add(placemark, 12, 30);
		}
	}
	
	if(typeof(rts) != 'undefined'){
		for(a in rts){
			v = YMaps.Styles.get(rts[a].attr);
			v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
			//alert(rts[a].coord);
			var pl = YMaps.Polyline.fromEncodedPoints(rts[a].coord);
			pl.description = rts[a].description;
			pl.img = rts[a].img;
			pl.description = rts[a].description;
			pl.link = rts[a].link;
			pl.contact = rts[a].contact;
			pl.name = rts[a].name;
			//objManager.add(pl, 15, 30);
			(a.toString() == current.toString()) ? pl.setStyle('routes#current') : pl.setStyle(rts[a].attr);
			map.addOverlay(pl);
		}
	}

	if(typeof(area) != 'undefined'){
		for(a in area){
			v = YMaps.Styles.get(area[a].attr);
			v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
			var pl = YMaps.Polygon.fromEncodedPoints(area[a].coord,'A',{style: area[a].attr,hasHint: 1,hasBalloon: 1});
			pl.description = area[a].description;
			pl.img = area[a].img;
			pl.description = area[a].description;
			pl.link = area[a].link;
			pl.contact = area[a].contact;
			pl.name = area[a].name;
			//objManager.add(pl, 15, 30);
			map.addOverlay(pl);
		}
	}
*/
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

	YMaps.Events.observe(map,map.Events.BalloonOpen,function(){
		// врезка из kickstart
			$('.gallery').each(function(i){
			$(this).find('a').attr('rel', 'gallery'+i)
			.fancybox({
				overlayOpacity: 0.2,
				overlayColor: '#000'
			});
		});
	});
	YMaps.Events.observe(map,map.Events.SmoothZoomEnd,function(){
		YMaps.jQuery("#current_zoom").val(map.getZoom());
	});

	YMaps.Events.observe(map,map.Events.TypeChange,function(){
		var current_type = map.getType();
		YMaps.jQuery("#current_type").val(current_type.getName());
	});

}

//######################################################################################################################
	function display_prime(){
		var mapset = $('#mapset').val();
		if(mapset != 0){
			$.ajax({
				url: "/ajax/get_map_content/" + mapset,
				type: "POST",
				dataType: "script",
				success: function(){
					display_locations(location_id);
				}
			});
		}
		else{
			var type = $('#type_strict').val();
			$.ajax({
				url: "/ajax/msearch/" + type,
				type: "POST",
				dataType: "script",
				success: function(){
					display_locations(location_id);
				}
				error: function(a,b){
					alert(b);
				}
			});
		}
	}

	function search_collected_params(){
		var collected = new Array();
		var d_conditions = new Array();
		var c_conditions = new Array();
		var n_conditions = new Array();
		for (i in switches){
			if(switches[i].value != 0 && switches[i].value != ''){
				collected[collected.length] = i + "_" + switches[i].value;
				switch (switches[i].group){
					case 'u' :
					$('#check_' + i).attr('src','/images/clean.png');
					c_conditions[c_conditions.length] = "<b>" + switches[i].text.replace('&nbsp;',' ') + "<\/b>";
					break;
					case 'd' :
					if(typeof($('#check_' + i)!='undefined')){
						$('#check_' + i).attr('src',"/images/clean.png"); //картинку меняем только на чекбоксах
					}
					d_conditions[d_conditions.length] = "<b>" + switches[i].text + "<\/b>";
					break;
					case 'ud' :
					if(typeof($('#check_' + i)!='undefined')){
						$('#check_' + i).attr('src',"/images/clean.png"); //картинку меняем только на чекбоксах
					}
					d_conditions[d_conditions.length] = "<b>" + switches[i].text + "<\/b>";
					break;
					case 'le' :
					$('#param_' + i).val(switches[i].value);
					n_conditions[n_conditions.length] = "<b>" + switches[i].label + ":<\/b> " + switches[i].value+ " " + switches[i].text;
					break;
					case 'select' :
					d_conditions[d_conditions.length] = "<b>" + switches[i].text + "<\/b>";
					break;
				}
			}
		}
		display_search_conditions(c_conditions,d_conditions,n_conditions);
		search_by_params(collected);
	}

	function search_by_params(collected){
		var mapset = $('#mapset').val()
		var param = collected.join('-');
		if(!collected.length){lastsearch = '';}
		// порядок переменных для имплементации нового кода: $input,$mapset,$current,
		var lid = (location_id.length) ? location_id : 0;
		if(param.length){
			$.ajax({
				url: "/ajax/search/"+ param + "/" + mapset + "/" + lid,
				type: "POST",
				dataType: "script",
				success: function(){
					display_locations(location_id);
				}
			});
		}else{
			display_prime()
		}
	}

	function parse_last_search(lastsearch){
		if(lastsearch.length > 2){ //цифра несколько с потолка, но всё же... 
			var la=lastsearch.split(",");
			for (sp in la){
				switches[ls[0]].value = la.sp.split("|")[1];
			}
		}
	}

	function display_search_results(node){
		var results= new Array();
		for(i in node){
			var img = (node[i].img != 'undefined') ? '<IMG SRC="/userimages/32/' + node[i].img + '" BORDER="0" WIDTH=32 HEIGHT=32 ALT="мини">' : "&nbsp;";
			results[results.length]= '<li onclick="display_locations('+ i +');" ondblclick="window.location = \'' +  node[i].link + '\'" title="Один щелчок - показать на карте. Двойной - открыть страницу"> ' + img + ' ' + node[i].name.replace("&nbsp;", " ") + '</li>';
		}

		if(!results.length){
			$('#ResultBody').html('Ничего не найдено.<BR>Попробуйте изменить набор условий, например, упростив его.');
		}else{
			$('#ResultBody').html('<ul class="alt foundlist">' + results.join("\n") + "<\/ul>");
			$('#ResultHead2').html(results.length);
		}
	}

	function display_search_conditions(cc,dc,nc){
		var str ="";
		if(cc.length){
			var cc_preamble = "Я ищу:<br>";
			str += cc_preamble + cc.join("<br>или ");
		}
		if(dc.length){
			var dc_preamble = "<br>Чтобы там было:<br>";
			str += dc_preamble + dc.join("<br>и ");
		}
		if(nc.length){
			var nc_preamble = "<br>Учитывая:<br>";
			str += nc_preamble + nc.join("<br>и ");
		}

		if(!(cc.length+dc.length+nc.length)){
			str = "Условия не заданы.<BR>Показаны все результаты";
		}
		$('#CondBody').html(str);
		$('#CondHead2').html(cc.length+dc.length+nc.length);
	}

	function mark_params(pid){
		switch(switches[pid].fieldtype){
		case 'checkbox' :
			if(switches[pid].value == 0){
				switches[pid].value = 1;
			}else{
				switches[pid].value = 0;
				$('#check_' + pid).attr('src',"/images/clean_grey.png");
			}
		break;
		case 'text' :
			switches[pid].value = ($('#param_' + pid).val().length) ? $('#param_' + pid).val() : 0;
		break;
		case 'select' :
			switches[pid].value = ($('#sel_' + pid).val()) ? $('#sel_' + pid).val() : 0;
		break
		}
		search_collected_params();
	}