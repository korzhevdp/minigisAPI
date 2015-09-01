//######################################### ��������� ����� #########################################################
ymaps.ready(init);

var sights,
	groups,
	clusters,
	imported = {},
	createType = 0,
	editing = 0,
	folder,
	objlayer = 0,
	localstyles = {},
	vectoropts = { strokeColor: 'FF220099', strokeWidth: 2, strokeStyle: { style: 'solid' } },
	proxylist = {};

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
			hasNav        : 1
		};
	// конец начальной конфигурации
	var dX = [],
		searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		//typeSelector  = new ymaps.control.TypeSelector(),
		//layerTypes    = config.layerTypes,
		revLayerTypes = {},
		cMapType      = 0,
		lc            = 0,
		uploadPics    = [];
	// сброс карты (это, типа, такой костыль ещё от старых карт - на всякий случай)
	//(typeof map !== "undefined") ? map.destroy() : "";

	// слои карты.
	for(var a in layerTypes){
		ymaps.layer.storage.add(layerTypes[a].label, layerTypes[a].func);
		ymaps.mapType.storage.add(layerTypes[a].label, new ymaps.MapType(
			layerTypes[a].name, layerTypes[a].layers
		));
		//typeSelector.addMapType(config.layerTypes[a].label, a);
		$("#wlayer").append('<option value="' + layerTypes[a].label + '">' + layerTypes[a].name + '</option>');
		revLayerTypes[layerTypes[a].label] = layerTypes[a].localLayerID;
	}
	//#################### поддержка основных стилей Minigis.NET ########################
	//###################################################################################
	function styleAddToStorage(src){
		for (var a in src){
			if (src.hasOwnProperty(a)) {
				ymaps.option.presetStorage.add(a, src[a]);
			}
		}
	}

	styleAddToStorage(userstyles);
	list_marker_styles();

	function list_marker_styles(){
		//alert(1)
		$("#ostyle, #cstyle").append('<option value="0">Выберите стиль</option>');
		localstyles["1"] = [];
		localstyles["1"].push('<optgroup label="Объекты">');
		for (var a in yandex_styles){
			if (yandex_styles.hasOwnProperty(a)) {
				localstyles["1"].push(yandex_styles[a]);
			}
		}
		localstyles["1"].push('</optgroup>');
		localstyles["1"].push('<optgroup label="Маркеры">');
		for (a in yandex_markers){
			if (yandex_markers.hasOwnProperty(a)) {
				localstyles["1"].push(yandex_markers[a]);
			}
		}
		localstyles["1"].push('</optgroup>');

		localstyles["1"].push('<optgroup class="points" label="Пользовательские">');
		for (a in style_src){
			if (style_src.hasOwnProperty(a)) {
				localstyles["1"].push('<option value="' + style_src[a][2] +'">' + style_src[a][3] + '</option>');
			}
		}
		localstyles["1"].push('</optgroup>');

		localstyles["2"] = [];
		localstyles["2"].push('<optgroup label="Стили ломаных">');
		for (a in style_paths){
			if (style_paths.hasOwnProperty(a)) {
				localstyles["2"].push('<option value="' + style_paths[a][2] +'">' + style_paths[a][4] + '</option>');
			}
		}
		localstyles["2"].push('</optgroup>');

		localstyles["3"] = [];
		localstyles["3"].push('<optgroup label="Стили полигона">');
		for (a in style_polygons){
			if (style_polygons.hasOwnProperty(a)) {
				localstyles["3"].push('<option value="' + style_polygons[a][5] +'">' + style_polygons[a][7] + '</option>');
			}
		}
		localstyles["3"].push('</optgroup>');

		localstyles["4"] = [];
		localstyles["4"].push('<optgroup id="s_circles" label="Стили круга">');
		for (a in style_circles){
			if (style_circles.hasOwnProperty(a)) {
				localstyles["4"].push('<option value="' + style_circles[a][7] +'">' + style_circles[a][9] + '</option>');
			}
		}
		localstyles["4"].push('</optgroup>');
	}
	//###################################################################################
	//###################################################################################


	//###################################################################################
	// Процессор карты
	//###################################################################################

	map = new ymaps.Map("YMapsID",
		{center: config.mcenter, zoom: config.initZoom, type: "yandex#map", behaviors: ["scrollZoom", "drag", "dblClickZoom"]},
		{projection: config.proj, maxZoom: config.maxZoom, minZoom: config.minZoom },
		{}
	);

	cursor = map.cursors.push('crosshair', 'arrow');
	cursor.setKey('arrow');

	map.controls.add('zoomControl').add('mapTools');
	$("#wlayer").change(function(){
		map.setType($(this).val());
	});

	p_objects = new ymaps.GeoObjectArray();
	p_objects.options.set({
		hasBalloon: 0,
		hasHint: 1,
		hintContent: "Фотография. Направление съёмки можно указать правым щелчком мыши по карте.",
		draggable: 1
	});
	p_objects.events.add(['geometrychange', 'add'], function (action){
		if(action.get('type') === 'add'){
			v = action.get('child').geometry;
		}else{
			v = action.get('target').geometry;
			if(v_objects.getLength()){
				v_objects.get(0).geometry.setCoordinates([p_objects.get(0).geometry.getCoordinates(), v_objects.get(0).geometry.getCoordinates()[1]]);
				//alert(ymaps.geometry.LineString.toEncodedCoordinates(v_objects.get(0).geometry));
				$("#vector").val(ymaps.geometry.LineString.toEncodedCoordinates(v_objects.get(0).geometry));
			}
		}

		switch(v.getType()){
			case "Point":
				cdf = v.getCoordinates();
				$("#coords, #ocoords, #ccoords").val([cdf[0].toPrecision(8), cdf[1].toPrecision(8)].join(","));
			break;
			case "LineString":
				$("#coords, #ocoords, #ccoords").val(ymaps.geometry.LineString.toEncodedCoordinates(v));
				$("#ocoordshid").val(v.getCoordinates().join(","));
			break;
			case "Polygon":
				$("#coords, #ocoords, #ccoords").val(ymaps.geometry.Polygon.toEncodedCoordinates(v));
				$("#ocoordshid").val(v.getCoordinates().join(","));
			break;
			case "Circle":
				//console.log(v.getCenter())
				circoords = [v.getCenter()[0], v.getCenter()[1], v.getRadius()].join(", ");
				$("#coords, #ocoords, #ccoords").val(circoords);
			break;
		}
	});
	map.geoObjects.add(p_objects);

	v_objects = new ymaps.GeoObjectArray();
	map.geoObjects.add(v_objects);

	map.events.add('typechange', function (action){
		v = action.get('newType');
		objlayer = revLayerTypes[v];
	});

	map.events.add('click', function (click){
		if(!createType || editing){
			return false;
		}
		var v = click.get('coordPosition'),
			editor = 0;
		p_objects.removeAll();
		switch(createType){
			case 1 :
				cds = { type: "Point", coordinates: v };
			break;
			case 2 :
				cds = {type: 'LineString', coordinates: [v]};
				editor = 1;
			break;
			case 3 :
				cds = {type: 'Polygon',coordinates: [[v]]};
				editor = 1;
			break;
			case 4 :
				cds = new ymaps.geometry.Circle( v, 100);
				$("#ccoords").val([v].join(",") + ", " + 100);
			break;
		}
		var geometry   = cds,
			properties = { },
			options    = ($("#cstyle").val() !== null && $("#cstyle").val() != "0" ) ? ymaps.option.presetStorage.get($("#cstyle").val()) : { iconImageHref: 'http://api.korzhevdp.com/images/marker.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] },
			object     = new ymaps.Placemark(geometry, properties, options);
		p_objects.add(object);
		if(editor){
			object.editor.startDrawing();
		}
		editing = 1;
		$("#cstyle").unbind().change(function(){
			p_objects.get(0).options.set(ymaps.option.presetStorage.get($("#cstyle").val()));
		});
	});

	map.events.add("contextmenu", function(rclick){
		if(!p_objects.getLength){
			return false;
		}
		var start      = p_objects.get(0).geometry.getCoordinates(),
			end        = rclick.get('coordPosition'),
			geometry   = new ymaps.geometry.LineString([ start, end ]),
			properties = {},
			options    = vectoropts,
			vector     = new ymaps.Polyline(geometry, properties, options);
		v_objects.removeAll().add(vector);
		$("#vector").val(ymaps.geometry.LineString.toEncodedCoordinates(v_objects.get(0).geometry));
	});

	$(".dirLink").click(function(){
		folder = $(this).attr("ref");
		$("#folder").val(folder);
		$.ajax({
			type: "POST",
			url: "/admin/photos/pics_get",
			dataType: 'html',
			data: {
				folder : folder
			},
			success: function(data){
				act_photos(data);
			},
			error: function(data,stat,err){
				alert([data,stat,err].join("\n"));
			}
		});
		$.ajax({
			type: "POST",
			url: "/admin/photos/sights_get",
			dataType: 'script',
			data: {
				folder : folder
			},
			success: function(){
				act_objects();
			},
			error: function(data,stat,err){
				alert([data,stat,err].join("\n"));
			}
		});
	});

	function act_photos(data){
		$("#photolist").html(data);
		$("#coords").val("");
		$("#desc").val("");
		$(".link2Ed").unbind().click(function(){
			var geometry,
				properties,
				options,
				coords = $(this).attr("cf").split(","),
				vec = $(this).attr("vec");
			p_objects.removeAll();
			v_objects.removeAll();

			$("#uploadConf").addClass("hide");
			$("#mainTab *").removeClass("active");
			$("#mainTab a[href=#ephotos]").parent().addClass("active");
			$("#ephotos").addClass("active").removeClass("hide");
			$("#eobjects").addClass("hide").removeClass("active");

			$("#vector").val(vec);
			$("#imageZ").prop("src", $(this).attr("ref"));
			$("#coords, #refcoord").val($(this).attr("cf"));
			$("#reffn").val($(this).attr("fn"));
			$("#desc").val($(this).attr("desc"));
			$("#active").prop("checked", (($(this).attr("act") === "1") ? true : false));

			geometry   = { type: "Point", coordinates: [parseFloat(coords[0]), parseFloat(coords[1])] };
			properties = { };
			options    = { iconImageHref: 'http://api.korzhevdp.com/images/marker.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] };
			object     = new ymaps.Placemark(geometry, properties, options);
			map.setCenter([parseFloat(coords[0]), parseFloat(coords[1])]);
			p_objects.add(object);

			if(vec.length){
				geometry   = ymaps.geometry.LineString.fromEncodedCoordinates(vec);
				properties = { };
				options    = vectoropts;
				vector     = new ymaps.Polyline(geometry, properties, options);
				v_objects.add(vector);
			}
		});
	}

	function act_objects(data){
		//$("#mapObjects").html(data);
		//eval(data);
		// заполнение таблицы примечательных мест
		unpack_config();
		$("#partition").val("0");
		$("#groups").val("0");
	}
}



function unpack_config(){
	$("#mapObjects, #grlist, #partlist, #groups, #partition").empty();
	$("#groups, #cgroups").empty().append('<option value="0">Выберите группу</value>');
	$("#partition, #cpartition").empty().append('<option value="0">Выберите раздел</value>');
	$("input").val("");
	$("select").val("0");
	$("#cct").change();
	if(typeof groups === 'undefined'){
		return false;
	}
	for(var a in groups){
		if (groups.hasOwnProperty(а)) {
			opt   = '<option value= "' + a + '">' + groups[a].g + '</value>';
			li4ed = '<li ref="' + a + '">' + groups[a].g + '</li>';
			$("#groups, #cgroups").append(opt);
			$("#grlist").append(li4ed);
		}
	}

	if(typeof sights == 'undefined'){
		return false;
	}

	for (a in sights){
		if (sights.hasOwnProperty(а)) {
			label = sights[a].label;
			proxy = sights[a].content;
			opt   = '<option value= "' + a + '">' + sights[a].label + '</value>';
			li4ed = '<li ref="' + a + '">' + sights[a].label + '</li>';
			subh  = '<li style="font-size:13px;"><strong>' + sights[a].label + '</strong></li>';
			$("#mapObjects").append(subh + "\n");
			$("#partition, #cpartition").append(opt);
			$("#partlist").append(li4ed);
			for ( b in proxy ){
				if (proxy.hasOwnProperty(b)) {
					img = (proxy[b].a === "1") 
						? '<img src="http://api.korzhevdp.com/images/bullet_blue.png" alt="">' 
						: '<img src="http://api.korzhevdp.com/images/bullet_delete.png" alt="">' ;
					switch(proxy[b].ct){
						case 1:
							navitem = '<li class="odata" packet="' + a + '" ref="' + b + '">' + img + '<span>' + proxy[b].d + '</span></li>';
						break;
						case 2:
							navitem = '<li class="odata" packet="' + a + '" ref="' + b + '">' + img + '<span>' + proxy[b].d + '</span></li>';
						break;
						case 3:
							navitem = '<li class="odata" packet="' + a + '" ref="' + b + '">' + img + '<span>' + proxy[b].d + '</span></li>';
						break;
						case 4:
							navitem = '<li class="odata" packet="' + a + '" ref="' + b + '">' + img + '<span>' + proxy[b].d + '</span></li>';
						break;
					}
					$("#mapObjects").append(navitem + "\n");
					proxylist[b] = proxy[b].d;
				}
			}
		}
	}

	activate_obj();

	if(typeof clusters === 'undefined'){
		return false;
	}

	$("#clusterSelector").empty().append('<option value="0">Выберите кластер</option>');
	for(var a in clusters){
		if (clusters.hasOwnProperty(a)) {
			li4ed = '<option value="' + a + '">' + clusters[a].label + '</option>';
			$("#clusterSelector").append(li4ed + "\n");
		}
	}

	$("#delCluster").click(function(){
		ref = parseInt($("#clusterSelector").val());
		if(!ref){
			return false;
		}
		delete clusters[ref];
		$("#cluster").val("");
		$("#clusterSelector option[value=" + ref + "]").remove();
		$("#clusterList").empty();
	});

	// ДОБАВЛЕНИЕ кластера
	$("#addCluster").unbind().click(function(){
		name = $("#cluster").val();
		if(!name.length){
			return false;
		}
		m = 0;
		for (var a in clusters){
			if (clusters.hasOwnProperty(a)) {
				if(parseInt(a) > m){
					m = parseInt(a);
				}
			}
		}

		clusters[(m + 1)] = {
			label: $("#cluster").val(),
			content: []
		}

		$("#clusterSelector").append('<option value="' + (m + 1) + '">' + $("#cluster").val() + '</option>');

		$("#clusterSelector").unbind().change(function(){
			ref = $(this).val();
			if(!parseInt(ref)){
				return false;
			}
			//console.log(ref)
			$("#cluster").val($("#clusterSelector option:selected").html());
			buildLists();
		});
		//console.log(clusters);
	});
}

function activate_obj(){
	$("li.odata").unbind().click(function(){
		id = $(this).attr('ref');
		part= $(this).attr('packet');
		object = sights[part].content[id];
		$("#uploadConf").removeClass("hide");
		$("#partition").val(part);
		$("#oid").val(id);
		$("#ogr").val(object.g);
		$("#groups").val(object.g);
		$("#odesc").val(object.d);
		$("#oaddress").val(object.b);
		$("#ophoto").val(object.ph);
		$("#olayer").val(object.l);
		$("#olink").val(object.ln);
		$("#oct").val(object.ct);
		$("#oactive").prop("checked", ((object.a == "1") ? true : false));
		$("#ostyle").empty().append('<option value="0">Выберите оформление</value>').append(localstyles[object.ct]);
		$("#sctyle, #ostyle").val(object.st);
		$("#eobjects").tab('show');
		$("#mainTab *, #mainTabContent *").removeClass("active");
		$("#mainTab a[href=#eobjects]").parent().addClass("active");
		$("a[href=#oe]").parent().addClass("active");
		$("#eobjects, #oe").addClass("active").removeClass("hide");
		p_objects.removeAll();
		editor = 0;
		//console.log(object.c);
		switch(object.ct){
			case 1 :
				cds = new ymaps.geometry.Point([parseFloat(object.c[0]), parseFloat(object.c[1])]);
				map.setCenter(cds.getCoordinates());
				$("#ocoords").val([object.c[0], object.c[1]].join(","));
			break;
			case 2 :
				cds = new ymaps.geometry.LineString.fromEncodedCoordinates(object.c);
				map.setCenter(cds.getCoordinates()[0]);
				$("#ocoords").val(object.c);
				editor = 1;
			break;
			case 3 :
				cds = new ymaps.geometry.Polygon.fromEncodedCoordinates(object.c);
				map.setCenter(cds.getCoordinates()[0][0]);
				$("#ocoords").val(object.c);
				editor = 1;
			break;
			case 4 :
				cds = new ymaps.geometry.Circle([parseFloat(object.c[0]), parseFloat(object.c[1])], parseFloat(object.c[2]));
				$("#ocoords").val([ object.c[0], object.c[1], object.c[2] ].join(","));
			break;
		}
		var geometry   = cds,
			properties = { },
			options    = ($("#ostyle").val() != null && $("#ostyle").val() != "0" ) ? ymaps.option.presetStorage.get($("#ostyle").val()) : { iconImageHref: 'http://api.korzhevdp.com/images/marker.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] },
			object     = new ymaps.Placemark(geometry, properties, options);
		p_objects.add(object);
		if(editor){
			object.editor.startEditing();
		}
		$("#ostyle").unbind().change(function(){
			p_objects.get(0).options.set(ymaps.option.presetStorage.get($("#ostyle").val()));
		});
	});

	$("#grlist li").unbind().click(function(){
		ref = $(this).attr("ref");
		$("#groupref").val(ref);
		$("#groupEditor").val($(this).html())
	});

	$("#partlist li").unbind().click(function(){
		ref = $(this).attr("ref");
		$("#partref").val(ref);
		$("#partEditor").val($(this).html())
	});

	$("#clusterSelector").unbind().change(function(){
		ref = $(this).val();
		if(!parseInt(ref)){
			return false;
		}
		$("#cluster").val($("#clusterSelector option:selected").html());
		buildLists();
		setClusterRemovers();
	});
}

function buildLists(){
	var exclusion = {}, // задан пустой список исключений (локален для этой функции)
		ref = $("#clusterSelector").val();
	// построение списка состава кластера
	$("#clusterList").empty();
	for (a in clusters[ref].content){
		// наполнение списка состава кластера
		$("#clusterList").append('<li>' + proxylist[ clusters[ref].content[a] ] + '<i class="icon-remove" style="margin-top:-1px;" title="Удалить из кластера" ref="' + clusters[ref].content[a] + '"></i></li>');
		// добавление в список исключений элементов из состава кластера
		exclusion[clusters[ref].content[a]] = "";
	}
	// построение списка канидатов в кластер по списку объектов с учётом списка исключений
	//console.log(proxylist.toSource());
	$("#clusterCandidates").empty();
	for(a in proxylist){
		if(typeof exclusion[parseInt(a)] == 'undefined'){
			//console.log(a)
			$("#clusterCandidates").append('<option value="' + a + '">' + proxylist[a] + '</option>');
		}
	}
	setClusterRemovers();
}

function setClusterRemovers(){
	$("#clusterList li .icon-remove").unbind().click(function(){
		ref = $(this).attr("ref");
		removeFromCluster(ref);
		buildLists();
	});
}

function removeFromCluster(ref){
	cc = $("#clusterSelector").val();
	//console.log("click");
	$(this).parent().remove();

	for(a in clusters[cc].content){
		if(clusters[cc].content[a] == ref){
			clusters[cc].content.splice(a, 1); // и запомни как это правильно делаецца!
			//console.log(clusters[cc].content.toSource());
			break;
		}
	}
}

$("#import").click(function(){
	var coords,
		radius,
		vx = 0,
		partid = 1,
		g1 = {
			'Point'      : 1,
			'LineString' : 2,
			'Polygon'    : 3,
			'Circle'     : 4
		};
	data = $("#dataToImport").val();
	eval(data);
	for(part in sights){
		partid = part;
		for (unit in sights[part].content){
			if(parseInt(unit) > vx){
				vx = (parseInt(unit) + 1);
			}
		}
	}
	if(typeof sights[partid] == 'undefined'){
		alert("Не были созданы разделы. Создайте их в соответствующей вкладке");
		return false;
	}
	for( a in exportedMapObjects){
		coords = exportedMapObjects[a][0].coord;
		sights[partid].content[vx] = {
			c  : coords,
			l  : 0,
			g  : 0,
			ct : g1[exportedMapObjects[a][0].type],
			a  : 0,
			d  : [ exportedMapObjects[a][1].n, exportedMapObjects[a][1].d ].join(" "),
			st : exportedMapObjects[a][2].attr,
			ln : exportedMapObjects[a][1].l,
			b  : exportedMapObjects[a][1].b,
			ph : ''
		}
		vx++;
	}
	unpack_config();
	activate_obj()
});

$("#addToCluster").click(function(){
	cc   = $("#clusterSelector").val();
	ccan = $("#clusterCandidates").val();
	name = $("#clusterCandidates option:selected").html();
	clusters[cc].content.push(parseInt(ccan));
	$("#clusterList").append('<li>' + name + '<i class="icon-remove" style="margin-top:-1px;" title="Удалить из кластера" ref="' + ccan + '"></i></li>');
	$("#clusterCandidates option[value=" + ccan + "]").remove();
	//console.log("added to cluster: " + clusters[cc].content.join(", "));
	buildLists();
});

$("#saveCluster").click(function(){
	cc = $("#clusterSelector").val();
	clusters[cc].label = $("#cluster").val();
	//console.log(clusters.toSource());
});

$("#updateLocal").click(function(){
	var ctf   = parseInt($("#oct").val()),
		part  = parseInt($("#partition").val()),
		oid   = parseInt($("#oid").val());
	switch(ctf){
		case 1:
			cdf = $("#ocoords").val().split(",");
			cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6) ];
		break;
		case 4:
			cdf = $("#ocoords").val().split(",");
			cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6), parseInt(cdf[2].trim()) ];
		break;
		default :
			cdf = $("#ocoords").val();
		break;
	}

	fakeobject = {
		c  : cdf,
		cx : p_objects.get(0).geometry.getCoordinates(),
		l  : objlayer,
		ln : $("#olink").val(),
		st : $("#ostyle").val(),
		g  : parseInt($("#groups").val()),
		ct : parseInt($("#oct").val()),
		a  : (($("#oactive").prop("checked") == true)  ? 1 : 0),
		d  : $("#odesc").val(),
		b  : $("#oaddress").val(),
		ph : $("#ophoto").val()
	};

	//console.log(p_objects.get(0).geometry.getCoordinates())

	if(typeof sights[part].content[oid] == "undefined"){
		for (a in sights){
			if(typeof sights[a].content[oid] != "undefined"){
				delete sights[a].content[oid];
				break;
			}
		}
	}
	sights[part].content[oid] = fakeobject;
	unpack_config();
});

$("#createLocal").click(function(){
	var ctf   = parseInt($("#cct").val()),
		part  = parseInt($("#cpartition").val());

		switch(ctf){
			case 1:
				cdf = $("#ocoords").val().split(",");
				cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6) ];
			break;
			case 4:
				cdf = $("#ocoords").val().split(",");
				cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6), parseInt(cdf[2].trim()) ];
			break;
			default :
				cdf = $("#ocoords").val();
			break;
		}

		fakeobject = {
			c  : cdf,
			l  : objlayer,
			ln : $("#сlink").val(),
			st : $("#cstyle").val(),
			g  : parseInt($("#cgroups").val()),
			ct : parseInt($("#cct").val()),
			a  : (($("#cactive").prop("checked") == true)  ? 1 : 0),
			d  : $("#cdesc").val(),
			b  : $("#oaddress").val(),
			ph : $("#ophoto").val()
		};


		///alert(parseInt($("#groups").val()) + "-->" + parseInt($("#ogr").val()));
		//alert(typeof sights[part].content[oid] + " --> " + oid);
		//return false;
		for (a in sights){
			for (b in sights[a].content){
				if(b > oid){
					oid = b;
				}
			}
		}
		//alert(parseInt(b) + 1);
		//return false;
		sights[part].content[parseInt(b) + 1] = fakeobject;
		unpack_config();
});

$("#uploadConf").click(function(){
	//alert(folder)
	//return false;
	$.ajax({
		type: "POST",
		url: "/admin/photos/places_save",
		dataType: 'text',
		data: {
			folder   : folder,
			groups   : groups,
			sights   : sights,
			clusters : clusters
		},
		success: function(data){
			$("#viewer").append(data);
		},
		error: function(data,stat,err){
			alert([data,stat,err].join("\n"));
		}
	});
});

$("#saveGroup").click(function(){
	var ref = parseInt($("#groupref").val()),
		name = $("#groupEditor").val();
	alert(ref);
	groups[ref].g = name;
	unpack_config();
});

$("#addGroup").click(function(){
	var gid = 0,
		name = $("#newgroup").val();
	for (a in groups){
		if(a > gid){
			gid = a;
		}
	}
	groups[parseInt(gid) + 1] = { g: name };
	unpack_config();
	//alert(parseInt(partid) + 1);
});

$("#savePart").click(function(){
	var ref = parseInt($("#partref").val()),
		name = $("#partEditor").val();
	sights[ref].label = name;
	unpack_config();
});

$("#addPart").click(function(){
	var partid = 0,
		name = $("#newpart").val();
	if(typeof sights == 'undefined'){
		sights = {};
	}
	for (a in sights){
		if(a > partid){
			partid = a;
		}
	}
	sights[parseInt(partid) + 1] = { label: name, content: {} };
	unpack_config();
	//alert(parseInt(partid) + 1);
});

$("#delPart").click(function(){
	ct = 0
	id = parseInt($("#partref").val());
	for (a in sights[id].content){
		ct++;
	}
	if(ct > 0){
		alert("Раздел непуст и не может быть удалён");
		return false;
	}else{
		delete sights[id];
		unpack_config();
	}

	//alert(parseInt(partid) + 1);
});

$("#cct").change(function(){
	if($("#cct").val() == "0"){
		$("#cdesc, #ccoords, #cpartition, #cgroups, #cactive, #createLocal, #cstyle, #clink").attr("disabled", "disabled");
		return false;
	}else{
		p_objects.removeAll();
		editing = 0;
		createType = parseInt($("#cct").val());
		$("input").val("");
		$("#cdesc, #ccoords, #cpartition, #cgroups, #cactive, #createLocal, #cstyle, #clink").removeAttr("disabled");
		$("#cstyle").empty().append(localstyles[$("#cct").val()]);
	}
});

$("#imageSave").unbind().click(function(){
	//alert(folder)
	//	return false;
	$.ajax({
		url: "/admin/photos/pic_save",
		data: {
			desc   : $("#desc").val(),
			crds   : $("#coords").val(),
			rfcrds : $("#refcoord").val(),
			reffn  : $("#reffn").val(),
			vector : $("#vector").val(),
			folder : folder,
			active : (($("#active").prop("checked")) ? 1 : 0)
		},
		type: "POST",
		dataType: "text",
		success: function(data){
			$("#imgReport").removeClass("alert-error").addClass("alert-success").html("Сохранено успешно").fadeIn(500).delay(2000).fadeOut(500);
		},
		error: function(a,b){
			$("#imgReport").addClass("alert-error").removeClass("alert-success").html("Сохранить не удалось").fadeIn(500).delay(2000).fadeOut(500);
		}
	});
});

$(".hideUC").click(function(){
	$("#uploadConf").addClass("hide");
});

$(".showUC").click(function(){
	$("#uploadConf").removeClass("hide");
});

//$("#YMapsID").height(400 + 'px');
//$("#YMapsID").width($(window).width() - 350 + 'px');