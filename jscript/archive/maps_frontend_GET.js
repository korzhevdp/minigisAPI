//######################################### ��������� ����� #########################################################
function display_locations(current) {
	var map = new YMaps.Map(YMaps.jQuery("#YMapsID"));
	var current_zoom = YMaps.jQuery("#current_zoom").val();
	if(current == undefined || node[current] == undefined || !current || !current.length){
		var map_center = YMaps.jQuery("#map_center").val();
	}else{
		var map_center = node[current].coord;
	}
	lat = map_center.split(",")[0];
	lon = map_center.split(",")[1];
	map.setCenter(new YMaps.GeoPoint(lat,lon), current_zoom);
	map.addControl(new YMaps.TypeControl([YMaps.MapType.SATELLITE,YMaps.MapType.HYBRID,YMaps.MapType.MAP]));
	map.addControl(new YMaps.ToolBar());
	map.addControl(new YMaps.Zoom());
	switch (YMaps.jQuery("#current_type").val()){
		case '������':
			map.setType(YMaps.MapType.HYBRID);
		break;
		case '�������' :
			map.setType(YMaps.MapType.SATELLITE);
		break;
		case '�����':
		default:
			map.setType(YMaps.MapType.MAP);
		break
	}

	map.addControl(new YMaps.ScaleLine());
	map.enableScrollZoom();

	//Defining Styles
	function define_style(style_entry){
		var cns = new YMaps.Style();
		if(typeof(style_entry.href)!=undefined){
			cns.iconStyle = new YMaps.IconStyle();
			cns.iconStyle.href = style_entry.href;
			cns.iconStyle.size = new YMaps.Point(26, 24);
			cns.iconStyle.offset = new YMaps.Point(0, 0);
		}
		if(typeof(style_entry.strokeColor)!=undefined){
			cns.lineStyle = new YMaps.LineStyle();
			cns.lineStyle.strokeColor = style_entry.strokeColor;
			cns.lineStyle.strokeWidth = style_entry.strokeWidth;
		}
		YMaps.Styles.add(style_entry.label,cns);
	}
	for(id in userstyles){
		define_style(userstyles[id]);
	}
	//Defining Styles

	var v = new YMaps.Style();
	var template = new YMaps.Template('<div class="ymaps_balloon"><IMG SRC="/userimages/32/$[img|nophoto.gif]" ALT="����" style="margin:2px;float:left;"><B>��������:</B> $[name| ��� �����]<br><B>�����:</B> $[description|���]<br><B>��������:</B> $[contact|���������� ����]<br><br><B><U><A HREF="$[link|������]" style="margin-bottom:10px;">����������� �����</A></B></U></div>');
	

	var objManager = new YMaps.ObjectManager();
	map.addOverlay(objManager);
	if(typeof(node)!=undefined){
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
			objManager.add(placemark, 15, 30);
		}
	}
	if(typeof(gis)!=undefined){
		for(a in gis){
			v = YMaps.Styles.get(gis[a].attr);
			v.balloonContentStyle = new YMaps.BalloonContentStyle(template);
			lat = gis[a].coord.split(",")[0];
			lon = gis[a].coord.split(",")[1];
			var placemark = new YMaps.Placemark(new YMaps.GeoPoint(lat,lon), {style:v, hasHint: true});
			placemark.img = gis[a].img;
			placemark.description = gis[a].description;
			placemark.link = gis[a].link;
			placemark.contact = gis[a].contact;
			placemark.name = gis[a].name;
			objManager.add(placemark, 15, 30);
		}
	}


	if(typeof(rts)!=undefined){
		for(a in rts){
			var pl = YMaps.Polyline.fromEncodedPoints(rts[a].route);
			pl.description = rts[a].description;
			pl.setStyle(rts[a].attr);
			map.addOverlay(pl);
		}
	}


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
		// ������� ���������� ��� ������������� ������ ����: $fx,$param,$type_strict,$commonuser,$layer,$current
		var main_layer = $("#gis_main").val();
		var back_layer = $("#gis_background").val();
		if($("#full_gis").val()==1){
			$.ajax({
				url: "/ajax/ajax.php",
				type: "GET",
				data: "function=gis_background&layer=" + back_layer,
				dataType: "script",
				success: function(){}
			});
		}
		var type_strict = $("#type_strict").val();
		if(!type_strict){type = "&type_strict=";}
		else{type = "&type_strict=" + type_strict;}

		if(lastsearch.length){
			var func = "function=gis_main&layer=" + main_layer+ "&param=&current=" + location_id + "&commonuser=" + commonuser + type;
			var search = parse_last_search(lastsearch);
			search_collected_params(search);
		}else{
			$.ajax({
				url: "/ajax/ajax.php",
				type: "GET",
				data: "function=gis_main&layer=" + main_layer+ "&param=&current=" + location_id + "&commonuser=" + commonuser + type,
				dataType: "script",
				success: function(){
					display_locations(location_id);
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
			if(switches[i].value && switches[i].value.length){
				collected[collected.length] = i + "_" + switches[i].value;
				switch (switches[i].group){
					case 'u' :
					$('#check_' + i).attr('src','/images/clean.png');
					c_conditions[c_conditions.length] = "<b>" + switches[i].text.replace('&nbsp;',' ') + "<\/b>";
					break;
					case 'd' :
					if(typeof($('#check_' + i)!=undefined)){
						$('#check_' + i).attr('src',"/images/clean.png"); //�������� ������ ������ �� ���������
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
		var main_layer = $("#gis_main").val();
		var back_layer = $("#gis_background").val();
		var type_strict = $("#type_strict").val();
		type = (!type_strict)? "&type_strict=" : "&type_strict=" + type_strict;
		var func = "function=gis_main&layer=" + main_layer + "&param=" + collected.join('-') + '&current=' + location_id + '&commonuser=' + commonuser + type;
		if(collected.length==0){
			lastsearch = '';
		}
		// ������� ���������� ��� ������������� ������ ����: $fx,$param,$type_strict,$commonuser,$layer,$current
		// "/ajax/fx/(string)param/type_strict/commonuser/layer/current"
		$.ajax({
			url: "/ajax/ajax.php",
			type: "GET",
			data: func,
			dataType: "script",
			success: function(){
				display_locations(location_id);
			}
		});
	}

	function parse_last_search(lastsearch){
		if(lastsearch.length > 2){ //����� ��������� � �������, �� �� ��... 
			var la=lastsearch.split(",");
			for (sp in la){
				switches[ls[0]].value = la.sp.split("|")[1];
			}
		}
	}

	function display_search_results(node){
		var results= new Array();
		for(i in node){
			var img = (node[i].img != undefined) ? '<IMG SRC="/userimages/32/' + node[i].img + '" BORDER="0" WIDTH=32 HEIGHT=32 ALT="����">' : "&nbsp;";
			results[results.length]= '<li onclick="display_locations(\'\','+ i +');" title="���� ������ - �������� �� �����. ������� - ������� ��������" ondblclick="window.location = \'/page/show/' + i + '\'"> ' + img + ' ' + node[i].name.replace("&nbsp;", " ") + '</li>';
		}

		if(!results.length){
			$('#ResultBody').html('������ �� �������.<BR>���������� �������� ����� �������, ��������, �������� ���.');
		}else{
			$('#ResultBody').html('<ul class="alt foundlist">' + results.join("\n") + "<\/ul>");
			$('#ResultHead2').html(results.length);
		}
	}

	function display_search_conditions(cc,dc,nc){
		var str ="";
		if(cc.length){
			var cc_preamble = "� ���:<br>";
			str += cc_preamble + cc.join("<br>��� ");
		}
		if(dc.length){
			var dc_preamble = "<br>����� ��� ����:<br>";
			str += dc_preamble + dc.join("<br>� ");
		}
		if(nc.length){
			var nc_preamble = "<br>��������:<br>";
			str += nc_preamble + nc.join("<br>� ");
		}

		if(!(cc.length+dc.length+nc.length)){
			str = "������� �� ������.<BR>�������� ��� ����������";
		}
		$('#CondBody').html(str);
		$('#CondHead2').html(cc.length+dc.length+nc.length);
	}

	function mark_params(pid){
		switch(switches.pid.fieldtype){
		case 'checkbox' :
			if(!switches.pid.value){
				switches.pid.value = 1;
			}else{
				switches.pid.value = 0;
				$('#check_' + pid).attr('src',"/images/clean_grey.png");
			}
		break;
		case 'text' :
			switches.pid.value = ($('#param_' + pid).val().length) ? $('#param_' + pid).val() : 0;
		break;
		case 'select' :
			switches.pid.value = ($('#sel_' + pid).val()) ? $('#sel_' + pid).val() : 0;
		break
		}
		search_collected_params();
	}