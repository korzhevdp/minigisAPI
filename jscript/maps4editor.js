/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, layerTypes, yandex_markers, style_circles, style_polygons, styleAddToStorage */
'use strict';
var map,
	v,
	p_objects,
	v_objects,
	cursor,
	sights,
	groups,
	clusters,
	imported      = {},
	createType    = 0,
	editing       = 0,
	folder,
	objlayer      = 0,
	localstyles   = {},
	revLayerTypes = [],
	vectoropts    = { strokeColor: 'FF220099', strokeWidth: 2, strokeStyle: { style: 'solid' } },
	proxylist     = {};

function activate_obj() {
	$("li.odata").unbind().click(function () {
		var id     = $(this).attr('ref'),
			part   = $(this).attr('packet'),
			object = sights[part].content[id],
			editor = 0,
			cds,
			geometry,
			properties = { },
			options;
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
		$("#oactive").prop("checked", ((object.a === "1") ? true : false));
		$("#ostyle").empty().append('<option value="0">Выберите оформление</value>').append(localstyles[object.ct]);
		$("#sctyle, #ostyle").val(object.st);
		$("#eobjects").tab('show');
		$("#mainTab *, #mainTabContent *").removeClass("active");
		$("#mainTab a[href=#eobjects]").parent().addClass("active");
		$("a[href=#oe]").parent().addClass("active");
		$("#eobjects, #oe").addClass("active").removeClass("hide");
		p_objects.removeAll();
		//console.log(object.c);
		switch (object.ct) {
		case 1:
			cds = new ymaps.geometry.Point([parseFloat(object.c[0]), parseFloat(object.c[1])]);
			map.setCenter(cds.getCoordinates());
			$("#ocoords").val([object.c[0], object.c[1]].join(","));
			break;
		case 2:
			cds = new ymaps.geometry.LineString.fromEncodedCoordinates(object.c);
			map.setCenter(cds.getCoordinates()[0]);
			$("#ocoords").val(object.c);
			editor = 1;
			break;
		case 3:
			cds = new ymaps.geometry.Polygon.fromEncodedCoordinates(object.c);
			map.setCenter(cds.getCoordinates()[0][0]);
			$("#ocoords").val(object.c);
			editor = 1;
			break;
		case 4:
			cds = new ymaps.geometry.Circle([parseFloat(object.c[0]), parseFloat(object.c[1])], parseFloat(object.c[2]));
			$("#ocoords").val([ object.c[0], object.c[1], object.c[2] ].join(","));
			break;
		}
		geometry   = cds;
		options    = ($("#ostyle").val() !== null && $("#ostyle").val() !== "0")
			? ymaps.option.presetStorage.get($("#ostyle").val())
			: { iconImageHref: 'http://api.korzhevdp.com/images/marker.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] };
		object     = new ymaps.Placemark(geometry, properties, options);
		p_objects.add(object);
		if (editor) {
			object.editor.startEditing();
		}
		$("#ostyle").unbind().change(function () {
			p_objects.get(0).options.set(ymaps.option.presetStorage.get($("#ostyle").val()));
		});
	});

	$("#grlist li").unbind().click(function () {
		var ref = $(this).attr("ref");
		$("#groupref").val(ref);
		$("#groupEditor").val($(this).html());
	});

	$("#partlist li").unbind().click(function () {
		var ref = $(this).attr("ref");
		$("#partref").val(ref);
		$("#partEditor").val($(this).html());
	});

	$("#clusterSelector").unbind().change(function () {
		var ref = $(this).val();
		if (!parseInt(ref, 10)) {
			return false;
		}
		$("#cluster").val($("#clusterSelector option:selected").html());
		buildLists();
		setClusterRemovers();
	});
}

function unpack_config() {
	var a,
		opt,
		object,
		label,
		proxy,
		subh,
		li4ed,
		b,
		img,
		navitem;
	$("#mapObjects, #grlist, #partlist, #groups, #partition").empty();
	$("#groups, #cgroups").empty().append('<option value="0">Выберите группу</value>');
	$("#partition, #cpartition").empty().append('<option value="0">Выберите раздел</value>');
	$("input").val("");
	$("select").val("0");
	$("#cct").change();
	if (groups === undefined) {
		return false;
	}
	for (a in groups) {
		if (groups.hasOwnProperty(a)) {
			opt   = '<option value= "' + a + '">' + groups[a].g + '</value>';
			li4ed = '<li ref="' + a + '">' + groups[a].g + '</li>';
			$("#groups, #cgroups").append(opt);
			$("#grlist").append(li4ed);
		}
	}

	if (sights === undefined) {
		return false;
	}

	for (a in sights) {
		if (sights.hasOwnProperty(a)) {
			label = sights[a].label;
			proxy = sights[a].content;
			opt   = '<option value= "' + a + '">' + sights[a].label + '</value>';
			li4ed = '<li ref="' + a + '">' + sights[a].label + '</li>';
			subh  = '<li style="font-size:13px;"><strong>' + sights[a].label + '</strong></li>';
			$("#mapObjects").append(subh + "\n");
			$("#partition, #cpartition").append(opt);
			$("#partlist").append(li4ed);
			for (b in proxy) {
				if (proxy.hasOwnProperty(b)) {
					img = (proxy[b].a === "1")
						? '<img src="http://api.korzhevdp.com/images/bullet_blue.png" alt="">'
						: '<img src="http://api.korzhevdp.com/images/bullet_delete.png" alt="">';
					switch (proxy[b].ct) {
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

	if (clusters === undefined) {
		return false;
	}

	$("#clusterSelector").empty().append('<option value="0">Выберите кластер</option>');
	for (a in clusters) {
		if (clusters.hasOwnProperty(a)) {
			li4ed = '<option value="' + a + '">' + clusters[a].label + '</option>';
			$("#clusterSelector").append(li4ed + "\n");
		}
	}

	$("#delCluster").click(function () {
		var ref = parseInt($("#clusterSelector").val(), 10);
		if (!ref) {
			return false;
		}
		delete clusters[ref];
		$("#cluster").val("");
		$("#clusterSelector option[value=" + ref + "]").remove();
		$("#clusterList").empty();
	});

	// ДОБАВЛЕНИЕ кластера
	$("#addCluster").unbind().click(function () {
		var a,
			m = 0,
			name = $("#cluster").val();
		if (!name.length) {
			return false;
		}
		for (a in clusters) {
			if (clusters.hasOwnProperty(a)) {
				if (parseInt(a, 10) > m) {
					m = parseInt(a, 10);
				}
			}
		}

		clusters[(m + 1)] = {
			label   : $("#cluster").val(),
			content : []
		};
		$("#clusterSelector").append('<option value="' + (m + 1) + '">' + $("#cluster").val() + '</option>');
		$("#clusterSelector").unbind().change(function () {
			var ref = $(this).val();
			if (!parseInt(ref, 10)) {
				return false;
			}
			$("#cluster").val($("#clusterSelector option:selected").html());
			buildLists();
		});
	});
}

function setClusterRemovers() {
	$("#clusterList li .icon-remove").unbind().click(function () {
		var ref = $(this).attr("ref");
		removeFromCluster(ref);
		buildLists();
	});
}

function buildLists() {
	var a,
		exclusion = {}, // задан пустой список исключений (локален для этой функции)
		ref = $("#clusterSelector").val();
	// построение списка состава кластера
	$("#clusterList").empty();
	for (a in clusters[ref].content) {
		// наполнение списка состава кластера
		$("#clusterList").append('<li>' + proxylist[clusters[ref].content[a]] + '<i class="icon-remove" style="margin-top:-1px;" title="Удалить из кластера" ref="' + clusters[ref].content[a] + '"></i></li>');
		// добавление в список исключений элементов из состава кластера
		exclusion[clusters[ref].content[a]] = "";
	}
	// построение списка канидатов в кластер по списку объектов с учётом списка исключений
	//console.log(proxylist.toSource());
	$("#clusterCandidates").empty();
	for (a in proxylist) {
		if (exclusion[parseInt(a, 10)] === undefined) {
			$("#clusterCandidates").append('<option value="' + a + '">' + proxylist[a] + '</option>');
		}
	}
	setClusterRemovers();
}

function set_layers(){
	var a;
	for (a in layerTypes) {
		if (layerTypes.hasOwnProperty(a)) {
			ymaps.layer.storage.add(layerTypes[a].label, layerTypes[a].func);
			ymaps.mapType.storage.add(layerTypes[a].label, new ymaps.MapType(layerTypes[a].name, layerTypes[a].layers));
			$("#wlayer").append('<option value="' + layerTypes[a].label + '">' + layerTypes[a].name + '</option>');
			revLayerTypes[layerTypes[a].label] = layerTypes[a].localLayerID;
		}
	}
}

function add_yandex_styles() {
	var a;
	localstyles[1].push('<optgroup label="Yandex-стили">');
	for (a in yandex_styles) {
		if (yandex_styles.hasOwnProperty(a)) {
			localstyles[1].push(yandex_styles[a]);
		}
	}
	localstyles[1].push('</optgroup>');
}

function add_yandex_markers() {
	var a;
	localstyles[1].push('<optgroup label="Yandex-маркеры">');
	for (a in yandex_markers) {
		if (yandex_markers.hasOwnProperty(a)) {
			localstyles[1].push(yandex_markers[a]);
		}
	}
	localstyles[1].push('</optgroup>');
}

function add_user_styles() {
	var a;
	localstyles[1].push('<optgroup class="points" label="Пользовательские">');
	for (a in userstyles) {
		if (userstyles.hasOwnProperty(a)) {
			localstyles[userstyles[a].type].push('<option value="' + a + '">' + userstyles[a].title + '</option>');
		}
	}
	localstyles[1].push('</optgroup>');
}

function list_marker_styles() {
	var a;
	$("#ostyle, #cstyle").append('<option value="0">Выберите стиль</option>');
	localstyles[1] = ['<optgroup label="Объекты">'];
	localstyles[2] = ['<optgroup label="Стили ломаных">'];
	localstyles[3] = ['<optgroup label="Стили полигонов">'];
	localstyles[4] = ['<optgroup id="s_circles" label="Стили кругов">'];
	localstyles[5] = ['<optgroup label="Стили прямоугольников">'];
	localstyles[1].push('</optgroup>');
	add_yandex_styles();
	add_yandex_markers();
	add_user_styles();
	localstyles[1].push('</optgroup>');
	localstyles[2].push('</optgroup>');
	localstyles[3].push('</optgroup>');
	localstyles[4].push('</optgroup>');
	localstyles[5].push('</optgroup>');
}

function set_view_vector() {
	if (!p_objects.getLength()) {
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
}

function get_collection_data() {
	var folder = $(this).attr("ref");
	$("#folder").val(folder);
	$.ajax({
		type: "POST",
		url: "/admin/photos/pics_get",
		dataType: 'html',
		data: {
			folder : folder
		},
		success: function (data) {
			act_photos(data);
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err ].join("\n"));
		}
	});
	$.ajax({
		type: "POST",
		url: "/admin/photos/sights_get",
		dataType: 'script',
		data: {
			folder : folder
		},
		success: function () {
			act_objects();
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err ].join("\n"));
		}
	});
}

function init() {
	var a,
		dX = [],
		searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
		cMapType      = 0,
		lc            = 0,
		uploadPics    = [],
		config;

	config = {
		// tech-info
		mcenter       : [40.537471, 64.543004],
		maxZoom       : 17,
		minZoom       : 4,
		initZoom      : 13,
		proj          : ymaps.projection.sphericalMercator,
		// tech-info end
		url           : '',
		hasAtlas      : 1,
		hasNav        : 1
	};
	// конец начальной конфигурации

	set_layers();
	//#################### поддержка основных стилей Minigis.NET ########################
	//###################################################################################
	styleAddToStorage(userstyles);
	list_marker_styles();
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
	$("#wlayer").change(function () {
		map.setType($(this).val());
	});

	p_objects = new ymaps.GeoObjectArray();
	p_objects.options.set({
		hasBalloon: 0,
		hasHint: 1,
		hintContent: "Фотография. Направление съёмки можно указать правым щелчком мыши по карте.",
		draggable: 1
	});

	p_objects.events.add(['geometrychange', 'add'], function (action) {
		var v,
			cdf,
			circoords;
		if (action.get('type') === 'add') {
			v = action.get('child').geometry;
		} else {
			v = action.get('target').geometry;
			if (v_objects.getLength()) {
				v_objects.get(0).geometry.setCoordinates([p_objects.get(0).geometry.getCoordinates(), v_objects.get(0).geometry.getCoordinates()[1]]);
				$("#vector").val(ymaps.geometry.LineString.toEncodedCoordinates(v_objects.get(0).geometry));
			}
		}
		switch (v.getType()) {
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

	map.events.add('typechange', function (action) {
		v = action.get('newType');
		objlayer = revLayerTypes[v];
	});

	map.events.add('click', function (click) {
		var cds,
			geometry,
			properties = { },
			options,
			object,
			v = click.get('coordPosition'),
			editor = 0;
		if (!createType || editing) {
			return false;
		}
		p_objects.removeAll();
		switch (createType) {
		case 1:
			cds = { type: "Point", coordinates: v };
			break;
		case 2:
			cds = {type: 'LineString', coordinates: [v]};
			editor = 1;
			break;
		case 3:
			cds = {type: 'Polygon', coordinates: [[v]]};
			editor = 1;
			break;
		case 4:
			cds = new ymaps.geometry.Circle(v, 100);
			$("#ccoords").val([v].join(",") + ", " + 100);
			break;
		}
		geometry   = cds;
		options    = ($("#cstyle").val() !== null && $("#cstyle").val() !== "0")
			? ymaps.option.presetStorage.get($("#cstyle").val())
			: { iconImageHref: 'http://api.korzhevdp.com/images/marker.png', iconImageSize: [16, 16], iconImageOffset: [-8, -16] };
		object     = new ymaps.Placemark(geometry, properties, options);
		p_objects.add(object);
		if (editor) {
			object.editor.startDrawing();
		}
		editing = 1;
		$("#cstyle").unbind().change(function () {
			p_objects.get(0).options.set(ymaps.option.presetStorage.get($("#cstyle").val()));
		});
	});
	map.events.add("contextmenu", set_view_vector());
	$(".dirLink").click(get_collection_data());

	function act_photos(data) {
		$("#photolist").html(data);
		$("#coords").val("");
		$("#desc").val("");
		$(".link2Ed").unbind().click(function () {
			var object,
				geometry,
				properties,
				options,
				coords = $(this).attr("cf").split(","),
				vec    = $(this).attr("vec"),
				vector;
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

			if (vec.length) {
				geometry   = ymaps.geometry.LineString.fromEncodedCoordinates(vec);
				properties = { };
				options    = vectoropts;
				vector     = new ymaps.Polyline(geometry, properties, options);
				v_objects.add(vector);
			}
		});
	}



	function act_objects(data) {
		//$("#mapObjects").html(data);
		//eval(data);
		// заполнение таблицы примечательных мест
		unpack_config();
		$("#partition").val("0");
		$("#groups").val("0");
	}
}

function removeFromCluster(ref) {
	var a,
		cc = $("#clusterSelector").val();
	//console.log("click");
	$(this).parent().remove();

	for (a in clusters[cc].content) {
		if (clusters[cc].content[a] === ref) {
			clusters[cc].content.splice(a, 1); // и запомни как это правильно делаецца!
			//console.log(clusters[cc].content.toSource());
			break;
		}
	}
}

$("#import").click(function () {
	var a,
		data = $("#dataToImport").val(),
		part,
		unit,
		coords,
		radius,
		vx = 0,
		partid = 1,
		g1 = {
			'Point'      : 1,
			'LineString' : 2,
			'Polygon'    : 3,
			'Circle'     : 4
		};
	eval(data);
	for (part in sights) {
		partid = part;
		for (unit in sights[part].content) {
			if (parseInt(unit, 10) > vx) {
				vx = (parseInt(unit, 10) + 1);
			}
		}
	}
	if (sights[partid] === undefined) {
		alert("Не были созданы разделы. Создайте их в соответствующей вкладке");
		return false;
	}
	for (a in exportedMapObjects) {
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
		};
		vx += 1;
	}
	unpack_config();
	activate_obj();
});

$("#addToCluster").click(function () {
	var cc   = $("#clusterSelector").val(),
		ccan = $("#clusterCandidates").val(),
		name = $("#clusterCandidates option:selected").html();
	clusters[cc].content.push(parseInt(ccan, 10));
	$("#clusterList").append('<li>' + name + '<i class="icon-remove" style="margin-top:-1px;" title="Удалить из кластера" ref="' + ccan + '"></i></li>');
	$("#clusterCandidates option[value=" + ccan + "]").remove();
	//console.log("added to cluster: " + clusters[cc].content.join(", "));
	buildLists();
});

$("#saveCluster").click(function () {
	var cc = $("#clusterSelector").val();
	clusters[cc].label = $("#cluster").val();
	//console.log(clusters.toSource());
});

$("#updateLocal").click(function () {
	var a,
		cdf,
		ctf   = parseInt($("#oct").val(), 10),
		part  = parseInt($("#partition").val(), 10),
		oid   = parseInt($("#oid").val(), 10),
		fakeobject;
	switch (ctf) {
	case 1:
		cdf = $("#ocoords").val().split(",");
		cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6) ];
		break;
	case 4:
		cdf = $("#ocoords").val().split(",");
		cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6), parseInt(cdf[2].trim(), 10) ];
		break;
	default:
		cdf = $("#ocoords").val();
		break;
	}

	fakeobject = {
		c  : cdf,
		cx : p_objects.get(0).geometry.getCoordinates(),
		l  : objlayer,
		ln : $("#olink").val(),
		st : $("#ostyle").val(),
		g  : parseInt($("#groups").val(), 10),
		ct : parseInt($("#oct").val(), 10),
		a  : (($("#oactive").prop("checked") === true)  ? 1 : 0),
		d  : $("#odesc").val(),
		b  : $("#oaddress").val(),
		ph : $("#ophoto").val()
	};

	//console.log(p_objects.get(0).geometry.getCoordinates())

	if (sights[part].content[oid] === undefined) {
		for (a in sights) {
			if (sights[a].content[oid] !== undefined) {
				delete sights[a].content[oid];
				break;
			}
		}
	}
	sights[part].content[oid] = fakeobject;
	unpack_config();
});

$("#createLocal").click(function () {
	var a,
		b,
		fakeobject,
		oid,
		cdf,
		ctf   = parseInt($("#cct").val(), 10),
		part  = parseInt($("#cpartition").val(), 10);
	switch (ctf) {
	case 1:
		cdf = $("#ocoords").val().split(",");
		cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6) ];
		break;
	case 4:
		cdf = $("#ocoords").val().split(",");
		cdf = [ parseFloat(cdf[0].trim()).toFixed(6), parseFloat(cdf[1].trim()).toFixed(6), parseInt(cdf[2].trim(), 10) ];
		break;
	default:
		cdf = $("#ocoords").val();
		break;
	}

	fakeobject = {
		c  : cdf,
		l  : objlayer,
		ln : $("#сlink").val(),
		st : $("#cstyle").val(),
		g  : parseInt($("#cgroups").val(), 10),
		ct : parseInt($("#cct").val(), 10),
		a  : (($("#cactive").prop("checked") === true)  ? 1 : 0),
		d  : $("#cdesc").val(),
		b  : $("#oaddress").val(),
		ph : $("#ophoto").val()
	};

	for (a in sights) {
		for (b in sights[a].content) {
			if (b > oid) {
				oid = b;
			}
		}
	}
	sights[part].content[parseInt(b, 10) + 1] = fakeobject;
	unpack_config();
});

$("#uploadConf").click(function () {
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
		success: function (data) {
			$("#viewer").append(data);
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err ].join("\n"));
		}
	});
});

$("#saveGroup").click(function () {
	var ref = parseInt($("#groupref").val(), 10),
		name = $("#groupEditor").val();
	groups[ref].g = name;
	unpack_config();
});

$("#addGroup").click(function () {
	var a,
		gid = 0,
		name = $("#newgroup").val();
	for (a in groups) {
		if (a > gid) {
			gid = a;
		}
	}
	groups[parseInt(gid, 10) + 1] = { g: name };
	unpack_config();
	//alert(parseInt(partid) + 1);
});

$("#savePart").click(function () {
	var ref = parseInt($("#partref").val(), 10),
		name = $("#partEditor").val();
	sights[ref].label = name;
	unpack_config();
});

$("#addPart").click(function () {
	var a,
		partid = 0,
		name = $("#newpart").val();
	if (sights === undefined) {
		sights = {};
	}
	for (a in sights) {
		if (a > partid) {
			partid = a;
		}
	}
	sights[parseInt(partid, 10) + 1] = { label: name, content: {} };
	unpack_config();
	//alert(parseInt(partid) + 1);
});

$("#delPart").click(function () {
	var a,
		ct = 0,
		id = parseInt($("#partref").val(), 10);
	for (a in sights[id].content) {
		ct += 1;
	}
	if (ct > 0) {
		alert("Раздел непуст и не может быть удалён");
	} else {
		delete sights[id];
		unpack_config();
	}
});

$("#cct").change(function () {
	if ($("#cct").val() !== "0") {
		p_objects.removeAll();
		editing = 0;
		createType = parseInt($("#cct").val(), 10);
		$("input").val("");
		$("#cdesc, #ccoords, #cpartition, #cgroups, #cactive, #createLocal, #cstyle, #clink").removeAttr("disabled");
		$("#cstyle").empty().append(localstyles[$("#cct").val()]);
	} else {
		$("#cdesc, #ccoords, #cpartition, #cgroups, #cactive, #createLocal, #cstyle, #clink").attr("disabled", "disabled");
	}
});

$("#imageSave").unbind().click(function () {
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
		success: function (data) {
			$("#imgReport").removeClass("alert-error").addClass("alert-success").html("Сохранено успешно").fadeIn(500).delay(2000).fadeOut(500);
		},
		error: function (a, b) {
			$("#imgReport").addClass("alert-error").removeClass("alert-success").html("Сохранить не удалось").fadeIn(500).delay(2000).fadeOut(500);
		}
	});
});

$(".hideUC").click(function () {
	$("#uploadConf").addClass("hide");
});

$(".showUC").click(function () {
	$("#uploadConf").removeClass("hide");
});

ymaps.ready(init);

//$("#YMapsID").height(400 + 'px');
//$("#YMapsID").width($(window).width() - 350 + 'px');