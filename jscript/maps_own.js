//######################################### ��������� ����� #########################################################
ymaps.ready(init);

function init() {

	(typeof map != "undefined") ? map.destroy() : "";

	dX = [];
	for (var a=10; a < 21; a++){
		dX[a] = Math.pow(2, a) - 1;
	}
	archLayer = function () {
			return new ymaps.Layer(function (tile, zoom) {
				//alert(['�����������: ', zoom, tile[0], tile[1] ].join("\n") + "\n" + ['������ ����: ', zoom, tile[0], dX[zoom] - tile[1] , "����: ", (dX[zoom] - tile[1] - tile[1]) ].join("\n"));
				//url = '/tiles/gmap/' + zoom + '/' + tile[0] + '/' + (dX - tile[1]) + '.png';
				//alert(url);
				return '/tiles/gmap/' + zoom + '/' + tile[0] + '/' + (dX[zoom] - tile[1]) + '.png';
			}, {tileTransparent: 1, zIndex:1000});
		}
	// ������� ����������� ���� � ��������� ���� ��� ������ my#blacksea
	ymaps.layer.storage.add('my#arch', archLayer);
	// �������� ����� ��� �����, ��������� ������ �� ������ ���� ������,
	// archLayer32 = function () {return new ymaps.Layer(function (tile, zoom) { return '/tiles/Gmap3/32/' + zoom + '/tile-' + tile[0] + '-' + tile[1] + '.png';}, {tileTransparent: 1,zIndex:1000} )};
	// ������� ����������� ���� � ��������� ���� ��� ������ my#arch
	// ymaps.layer.storage.add('my#arch11', archLayer11);
	// � ������� ��� � ��������� ����� ����� ��� ������ 'my#arch'
	ymaps.mapType.storage.add('my#arch', new ymaps.MapType(
		'�����������', ['my#arch']
	));


	var maptypes = {1: 'yandex#map', 2: 'yandex#satellite', 3: 'yandex#hybrid', 4: 'yandex#publicMap', 5: 'yandex#publicMapHybrid', 6: "my#arch"}

	map = new ymaps.Map("YMapsID", {
		center: mp.center,// ����� �����
		zoom: 16,//mp.zoom,// ����������� ���������������
		type: maptypes[mp.type],// ��� �����
		behaviors: ["scrollZoom","drag"] //��������� ����� - ���������� � �������������� ������
	},
	{
		//restrictMapArea: [[40.48, 64.40], [40.74, 64.71]],
		projection: ymaps.projection.sphericalMercator,
		maxZoom: 17
	}),
	searchControl = new ymaps.control.SearchControl({ provider: 'yandex#publicMap', boundedBy: [[40, 65], [42, 64]], strictBounds: 1 }),
	typeSelector = new ymaps.control.TypeSelector(),
	// ������� ������ ��� ����������� �������� ������
	genericBalloon = ymaps.templateLayoutFactory.createClass(
	'<div class="ymaps_balloon">' +
	'<div class="well" id="l_photo" data-toggle="modal" data-target="#modal_pics" loc=$[properties.ttl|0] style="float:left;margin:3px;cursor:pointer;padding:2px;background-color:#DDDDDD;">' +
	'<img src="/uploads/ico/$[properties.img|nophoto.gif]" alt="����" id="sm_src_pic">' +
	'</div><b>��������:</b> $[properties.name|��� �����]<br>' +
	'<b>�����:</b> $[properties.description|�� ������]<br>' +
	'<b>��������:</b> $[properties.contact|���������� ����]<br><br>'+
	'<a href="$[properties.link|������]" style="margin-bottom:10px;">����������� �����</a>' +
	'</div>'
	),
	a_objects = new ymaps.GeoObjectArray(),
	b_objects = new ymaps.GeoObjectArray();// ���������




	map.geoObjects.add(a_objects);
	map.geoObjects.add(b_objects);
	// ##### ������ ��������������� ��������� �������� #####

	typeSelector.addMapType("my#arch", 6);

	//��������� ����� �������� � ��������� (� ������ ������ - �����)
	a_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,// ������������ ������ ������ � ��������
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 520,
		cursor: 'pointer'
	});

	b_objects.options.set({
		balloonContentBodyLayout: 'generic#balloonLayout',
		balloonMaxWidth: 400,// ������������ ������ ������ � ��������
		hasHint: 1,
		hasBalloon: 1,
		draggable: 0,
		zIndex: 510,
		cursor: 'pointer'
	});
	// ##### ��������� ������������� ����� #####
	map.controls.add('zoomControl').add(typeSelector).add('mapTools').add(searchControl);
	// �������� ��������� ������ � ��������� ��������.
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);
	//������ ��� ������ �������� �� ����� 'generic#balloonLayout'.
	// ##### ������� #####
	//��� �������� ������� �� ������������ � ��� ������ �������� ����������� ��������� �������� �������

	map.events.add('balloonopen', function (){
		$('#upl_loc').val($('#l_photo').attr('loc'));
	});
	/*
	//��� �������� ������� "��������" ������������ ������� "����� ������ ����"
	map.events.add('balloonclose', function (){
		$('.modal:has(.carousel)').on('shown', function() {
			var $carousel = $(this).find('.carousel');
			if ($carousel.data('carousel') && $carousel.data('carousel').sliding) {
				$carousel.find('.active').trigger($.support.transition.end);
			}
		});
	});
	*/
	styleAddToStorage(userstyles);
	load_mapset(mp.mapset);
}

	function select_object(id){
		a_objects.each(function(item){
			//if(item.options.get('visible')){
				item.options.set(ymaps.option.presetStorage.get(item.properties.get('attr')));
				if(item.properties.get('ttl') == id){
					switch (item.geometry.getType().toLowerCase()){
						case 'point' :
							item.options.set(ymaps.option.presetStorage.get('user#here'));
						break;
						case 'linestring' :
							item.options.set(ymaps.option.presetStorage.get('routes#current'));
						break;
						case 'polygon' :
							item.options.set(ymaps.option.presetStorage.get('area#current'));
						break;
						case 'circle' :
							item.options.set(ymaps.option.presetStorage.get('circle#current'));
						break;
						case 'rectangle' :
							item.options.set(ymaps.option.presetStorage.get('rct#current'));
						break;
					}

					item.options.set('zIndex',800);
					switch (item.geometry.getType().toLowerCase() == 'point' || item.geometry.getType().toLowerCase() == 'circle'){
						case 'point', 'circle' :
							map.setCenter(item.geometry.getCoordinates());
							item.balloon.open(item.geometry.getCoordinates());
						break;
						case 'linestring', 'polygon' :
							map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
							item.balloon.open(item.geometry.getCoordinates()[0]);
						break;
						case 'rectangle' :
							map.setBounds(item.geometry.getBounds(), {checkZoomRange: 1, duration: 1000, zoomMargin: "20px"});
							cr = item.geometry.getCoordinates();
						item.balloon.open([(cr[0][0] + cr[1][0])/2, (cr[0][1] + cr[1][1])/2]);
					}
				}
			//}
		});
	}

	function styleAddToStorage(src){
		for (var a in src){
			ymaps.option.presetStorage.add(a,src[a]);
		}
	}

	function place_objects(source,layer){
		for (b in source){
			var c = parseInt(b),
				src = source[b], // alias �� ������� ���� � ������� �������
				properties = {	// ��������  � ���� ����� ���������� - ��������� �� ���� ������ � ��������������� �������� ����
					attr: src.attr,
					contact: src.contact,
					description: src.description,
					hintContent: src.name,
					img: src.img,
					link: src.link,
					name: src.name,
					ttl: c
				};
					//alert(c);
			if(src.pr == 1){ // �����
				var geometry = src.coord.split(","), // ������ ������ ��������� (���, ���� ���������� �� ��������, - ������)
					options = ymaps.option.presetStorage.get(src.attr), //��������� ����� �� ������������ �������� ��� �� ��������� ���� �������
					object = new ymaps.Placemark(geometry, properties, options); // ���������� �������

			}
			if(src.pr == 2){ //�������
				var geometry = new ymaps.geometry.LineString.fromEncodedCoordinates(src.coord),
					options = ymaps.option.presetStorage.get(src.attr),
					object = new ymaps.Polyline(geometry, properties, options);
			}
			if(src.pr == 3){ // �������
				var geometry = new ymaps.geometry.Polygon.fromEncodedCoordinates(src.coord),
					options = ymaps.option.presetStorage.get(src.attr),
					object = new ymaps.Polygon(geometry, properties, options);
			}
			if(src.pr == 4){ // ����
				var geometry = new ymaps.geometry.Circle([parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])], parseFloat(src.coord.split(",")[2])),
					options = ymaps.option.presetStorage.get(src.attr),
					object = new ymaps.Circle(geometry, properties, options);
			}
			if(src.pr == 5){ // �������������
				var geometry = new ymaps.geometry.Rectangle([
						[parseFloat(src.coord.split(",")[0]), parseFloat(src.coord.split(",")[1])],
						[parseFloat(src.coord.split(",")[2]), parseFloat(src.coord.split(",")[3])]
					]),
					options = ymaps.option.presetStorage.get(src.attr),
					object = new ymaps.Rectangle(geometry, properties, options);
			}
			if(layer == 'a'){
				a_objects.add(object, c);
			}else{
				b_objects.add(object, c);
			}
		}
	}


//######################################### ����� ���������� ����� #######################################################
//######################################################################################################################

function load_mapset(mapset){
	if(mapset){
		$.ajax({
			url: "/ajax/get_map_content",
			data: { mapset: mapset },
			type: "POST",
			dataType: "script",
			success: function(){
				place_objects(ac, 'a');
				place_objects(bg, 'b');
			},
			error: function(data,stat,err){
				alert([data,stat,err].join("<br>"));
			}
		});
	}
}

function perform_search(string){
	$.ajax({
		url: "/ajax/search",
		data: {
			sc: string,
			mapset: mp.mapset
		},
		type: "POST",
		dataType: "text",
		success: function(data){
			filter_collections(data);
		},
		error: function(a,b){
			alert("������ �� �������");
		}
	});
}

function filter_collections(data){
	var arr = data.split(","),
		cm = [],
		entry;
	for (a in arr){
		cm[arr[a]] = 1;
	}
	$("#resultBody").html("");
	a_objects.each(function(item){
		test = (typeof cm[item.properties.get('ttl')] != 'undefined') ? 1 : 0;
		item.options.set({ visible: test });
		if(test){
			entry = '<li ref="' + item.properties.get('ttl') + '">'+ [item.properties.get('name'), item.properties.get('description')].join("<br>") + '</li>';
			$("#resultBody").append(entry);
		}
	});
	$("#resultBody li").click(function(){
		select_object($(this).attr('ref'));
	});
	b_objects.options.set({ visible: 0 });
}

function unfilter_collections(data){
	a_objects.each(function(item){
		item.options.set({ visible: 1 });
	});
	b_objects.options.set({ visible: 1 });
}