// Leaflet implementation for major functionality of MiniGIS

var map = L.map('LMapsID', {
	center : [64.543004, 40.537471],
	zoom   : 8,
	maxZoom: 10,
	minZoom: 2,
	worldCopyJump: true
	//crs    : L.CRS.EPSG4326
});


map.whenReady(init);

function init(){
	var config     = {
		// tech-info
		photosOnStart : 0,
		demoMode      : 0,
		precision     : 12,
		proj          : '',
		// tech-info end
		url           : '/maps/arch1940/',			// корень каталог с тайлами карты
		hasNav        : 0,							// наличие навигатора
		hasAtlas      : 0,							// наличие подготовленного атласа карт
		hasMulti      : 0,							// наличие альтернативной смотрелки
		ownMarkers    : 0,							// возможность установить свой маркер левым щелчком по карте
		showObjects   : 0,							// показывать список объектов в навигаторе
		showClusters  : 0,							// показывать список кластеров в навигаторе
		showGroups    : 0,							// показывать список групп в навигаторе
		showObjectsOS : 0,							// показывать объекты на карте при старте
		showClustersOS: 0,							// показывать объекты кластеров на карте при старте
		showGroupsOS  : 0,							// показывать объекты групп на карте при старте
		selectors     : {
			systemNavigatorClass    : '.navigator',	// системный селектор навигаторов
			systemClustersContainer : '.clusters',	// системный контейнер списка кластеров в навигаторе
			systemGroupsContainer   : '.groups',	// системный контейнер списка групп в навигаторе
			systemObjectsContainer  : '.body',		// системный контейнер списка объектов в навигаторе
			systemActiveFlag        : ':checked',	// системный флаг активного элемента - класс или свойство
			systemObjectClass       : '.cb',		// системный селектор css-класса объектов в навигаторе
			systemObjectIdPrefix    : 'a',			// системный префикс атрибута id для объектов в навигаторе
			systemGroupClass        : '.gb',		// системный селектор css-класса групп в навигаторе
			systemGroupIdPrefix     : 'g',			// системный префикс атрибута id для групп в навигаторе
			systemClusterClass      : '.cl',		// системный селектор css-класса кластеров в навигаторе
			systemClusterIdPrefix   : 'cl',			// системный префикс атрибута id для кластеров в навигаторе
		},
		layerTypes    : {},
		objectSearch  : 0
	},
	activeness     = config.selectors.systemActiveFlag.replace(/^(\.|:)/, ''),
	labelmode      = (config.selectors.systemActiveFlag == ":checked") ? 1 : 0,
	overlayType    = 1,		// тип оверлея
	generalMode    = 'edit',
	geometryBuffer = {},	// накопитель точек геометрии
	geometry       = [],
	a              = 0,
	b              = 0,
	objectData     = {},
	auxObjectData  = {},
	polygonAux     = L.layerGroup().addTo(map),
	majorGroup     = L.layerGroup().addTo(map),
	editorGroup    = L.layerGroup().addTo(map),
	bpGroup        = L.layerGroup().addTo(map),
	currentAux     = 0,
	currentMain    = 0,
	editorStarted  = 0,
	ID             = 0,
	bpmode         = 0,
	point          = L.marker([], { icon: L.icon(userstyles[$("#m_style").val()]), id: ID, draggable: true, className: 'marker' }),
	polyline       = L.polyline([],  { id: ID, className: 'polyline' } ),
	polygon        = L.polygon([],   { id: ID, className: 'polygon' } ),
	circle         = L.circle([], 0, { id: ID, className: 'circle' } );

	for(a in userstyles){
		switch(userstyles[a].type){
			case 1:
				$("#m_style").append('<option value="' + a + '">' + userstyles[a].title + '</option>')
				break;
			case 2:
				$("#line_style").append('<option value="' + a + '">' + userstyles[a].title + '</option>')
				break;
			case 3:
				$("#polygon_style").append('<option value="' + a + '">' + userstyles[a].title + '</option>')
				break;
			case 4:
				$("#circle_style").append('<option value="' + a + '">' + userstyles[a].title + '</option>')
				break;
		}
	}

	$("#pathE").html(((editorStarted) ? "Да" : "Нет" ));
	$(".obj_sw").removeClass('active');
	$(".obj_sw[pr=" + overlayType + "]").addClass('active');


	$("#coordSetter").click(function(){
		if(overlayType == 1 || overlayType == 4){
			//console.log(112112)
			objectData[ID].geometry = [ parseFloat($("#pointlat").val()), parseFloat($("#pointlng").val()) ]
			if(overlayType == 4){
				objectData[ID].geometry = [[ parseFloat($("#pointlat").val()), parseFloat($("#pointlng").val()) ], parseFloat($("#m_rad").val())]
			}
			redrawObject();
		}
		if(overlayType == 2){
			geometryBuffer[currentAux] = { lat: parseFloat($("#pointlat").val()), lng: parseFloat($("#pointlng").val()) };
			polygonAux.eachLayer(function(layer){
				if(layer.options.id == currentAux){
					layer.setLatLng( [ parseFloat($("#pointlat").val()), parseFloat($("#pointlng").val()) ] ).update();
				}
			});
			geometry = [];
			for(d in geometryBuffer){
				geometry.push( [ geometryBuffer[d].lat, geometryBuffer[d].lng ] )
			}
			polyline.setLatLngs(geometry).redraw();
		}
		// слово в слово почти и для полигона
		if(overlayType == 3){
			geometryBuffer[currentAux] = { lat: parseFloat($("#pointlat").val()), lng: parseFloat($("#pointlng").val()) };
			polygonAux.eachLayer(function(layer){
				if(layer.options.id == currentAux){
					layer.setLatLng( [ parseFloat($("#pointlat").val()), parseFloat($("#pointlng").val()) ] ).update();
				}
			});
			geometry = [[]];
			for(d in geometryBuffer){
				geometry[0].push( [ geometryBuffer[d].lat, geometryBuffer[d].lng ] )
			}
			polygon.setLatLngs(geometry).redraw();
		}
	});

	$(".obj_sw").click(function(){
		close_editor();
	});

	$("#bpModeSw").click(function(){
		bpmode = ($(this).hasClass("active")) ? 0 : 1;
		if(bpmode){
			placeBPs();
		}
	});

	L.tileLayer( 'http://luft.korzhevdp.com/leaflet/mapboxtiles/{z}/{x}/{y}.png', { zIndex: 10 } ).addTo(map);

	//russia = [[[69.784201, 30.774473], [69.730941, 30.840391], [69.710934, 30.848631], [69.703307, 30.832152], [69.67181699999999, 30.90631], [69.66513099999999, 30.881591], [69.61827299999999, 30.911803], [69.55883399999999, 30.892577], [69.52328399999999, 30.771727], [69.538665, 30.601439], [69.535782, 30.480589], [69.609655, 30.304807999999998], [69.665131, 30.112547], [69.653665, 30.041135999999998], [69.636455, 30.049376], [69.639324, 30.101561], [69.546351, 30.140013], [69.506931, 30.071348], [69.453935, 30.057615000000002], [69.402743, 29.9093], [69.416278, 29.821409000000003], [69.314563, 29.527525000000004], [69.31553400000001, 29.379210000000004], [69.29513400000002, 29.241881000000003], [69.24587900000002, 29.234678000000002], [69.22736300000001, 29.284116], [69.0875, 29.163266], [69.039367, 29.053403], [69.005907, 29.003965], [69.045266, 28.888609000000002], [68.911154, 28.366758], [68.874526, 28.435423], [68.862634, 28.75128], [68.729401, 28.666136], [68.535088, 28.388731], [68.191468, 28.602964], [68.066527, 29.284116], [67.779275, 29.641172], [67.662539, 29.965269], [67.517901, 29.888365], [66.96649599999999, 28.995929], [66.841387, 29.017902], [66.22388099999999, 29.732013], [65.94970099999999, 29.990191999999997], [65.65214499999999, 30.100054999999998], [65.68613299999998, 29.973712], [65.62492399999998, 29.666095], [65.54763999999997, 29.825397], [65.32817999999997, 29.682575], [65.25691899999997, 29.539753], [65.19238799999997, 29.841877], [65.09992599999997, 29.852863], [65.05589399999997, 29.594684], [64.90470299999997, 29.589191], [64.77844499999996, 29.671588], [64.77610099999997, 30.012164], [64.75734399999997, 30.045123], [64.72918399999998, 30.001178], [64.62803499999997, 30.127520999999998], [64.58085999999997, 29.951739999999997], [64.36517599999998, 30.050617], [64.25072099999997, 30.424152], [64.10697999999996, 30.517536], [63.90690399999996, 30.286823], [63.80025599999996, 30.209919], [63.754077999999964, 29.940754], [63.44838099999996, 30.457110999999998], [63.20392199999996, 31.204181], [63.087135999999965, 31.226153999999998], [62.89729099999997, 31.550250999999996], [62.46559399999997, 31.160235999999998], [61.68502099999997, 29.852863], [61.13744699999997, 28.902546], [60.975026999999976, 28.633381], [60.934959999999975, 28.594929], [60.92426699999997, 28.430134], [60.59369099999997, 27.836872], [60.55314299999997, 27.792927], [59.45567499999997, 28.001666999999998], [59.36326399999997, 28.182940999999996], [59.28043899999997, 28.078570999999997], [59.24387599999997, 27.883563999999996], [58.97973999999997, 27.696795999999996], [58.276430999999974, 27.504534999999997], [58.099466999999976, 27.586931999999997], [57.82966499999998, 27.796971999999997], [57.579718999999976, 27.319066999999997], [57.27451799999998, 27.835423999999996], [56.828477999999976, 27.648655999999995], [56.56251099999997, 28.077209999999994], [56.22739299999997, 28.154113999999993], [56.16001399999997, 28.088195999999993], [56.024897999999965, 28.357360999999994], [55.669501999999966, 29.494445999999993], [55.84606199999997, 30.197570999999993], [55.60114099999997, 30.878722999999994], [55.02468999999997, 30.988585999999994], [54.79999999999997, 30.724913999999995], [54.65693799999997, 31.147887999999995], [54.50697499999997, 31.081969999999995], [54.221481999999966, 31.312682999999996], [54.06344899999996, 31.834533999999998], [53.800879999999964, 31.735656999999996], [53.77810999999996, 32.252013999999996], [53.69668999999996, 32.449768], [53.450656999999964, 32.679091], [53.316000999999964, 32.706557], [53.085109999999965, 32.16273399999999], [53.098336999999965, 31.816664999999993], [53.210604999999966, 31.668349999999993], [53.20071099999996, 31.404677999999993], [53.08180199999996, 31.294814999999993], [52.97914299999996, 31.26185599999999], [52.57274099999996, 31.54750099999999], [52.26711799999996, 31.64637799999999], [52.04073599999996, 31.915542999999992], [52.12196099999996, 32.31105099999999], [52.32437399999996, 32.333023999999995], [52.25700599999996, 32.788956999999996], [52.364744999999964, 33.135025999999996], [52.35801899999996, 33.805192], [52.12196099999996, 34.068864], [51.820005999999964, 34.403946999999995], [51.70752499999996, 34.38197399999999], [51.666552999999965, 34.06336999999999], [51.526282999999964, 34.27210999999999], [51.25822499999996, 34.23915099999999], [51.22719399999996, 35.085097999999995], [50.87750799999996, 35.491592], [50.38137299999996, 35.590469], [50.30403599999996, 36.744033], [50.47260899999996, 37.458144000000004], [49.98633699999996, 37.996474000000006], [49.637981999999965, 40.105849000000006], [49.23677099999996, 40.138808000000004], [49.02047799999996, 39.688369], [48.87575499999996, 40.061904], [48.67970899999996, 39.677383], [48.35125299999996, 39.930068999999996], [47.84345599999996, 39.77625999999999], [47.85085199999996, 38.864394999999995], [47.70274199999996, 38.743545], [47.561644999999956, 38.304092], [47.28577499999996, 38.260146999999996], [47.113554999999955, 38.19422899999999], [45.991886999999956, 35.03016699999999], [46.18299599999995, 33.66786199999999], [45.723213999999956, 32.48133899999999], [45.20525199999996, 32.09681799999999], [43.42275499999996, 33.59095899999999], [43.51077599999996, 37.128556999999994], [43.390715999999955, 39.963029999999996], [43.57470999999995, 40.105852], [43.18204299999995, 41.775774], [43.12573799999995, 42.764544], [42.72204499999995, 43.7643], [42.705841999999954, 44.96181], [42.478549999999956, 45.686908], [42.21776699999995, 45.577045000000005], [41.503256999999955, 47.12611700000001], [41.196948999999954, 47.763324000000004], [41.75054799999995, 48.510394000000005], [46.293754999999955, 49.165679000000004], [46.552067999999956, 48.440581], [46.71855499999995, 48.923979], [47.662152999999954, 48.176909], [48.457535999999955, 46.463042], [50.42003099999995, 47.471071], [49.78406599999995, 48.328005000000005], [49.968660999999955, 48.92126700000001], [50.53220299999995, 48.65759500000001], [51.62557699999995, 50.876833000000005], [51.69390499999995, 52.48083700000001], [50.51819499999995, 55.73279000000001], [51.00595299999995, 57.29284900000001], [51.07771199999995, 58.42533900000001], [50.54872999999995, 59.58989000000001], [50.81397399999995, 60.07328800000001], [50.78612499999995, 61.45756500000001], [51.28486599999995, 61.52348300000001], [51.96863099999995, 59.96342400000001], [52.347023999999955, 61.06205700000001], [52.735529999999954, 60.82035800000001], [53.00145499999996, 61.23783800000001], [53.00145499999996, 62.11674400000001], [53.30524699999996, 61.25981000000001], [53.541491999999955, 61.47953700000001], [53.633009999999956, 61.04008400000001], [53.97118999999996, 61.30375600000001], [54.99463899999996, 68.26908800000001], [55.37752599999995, 68.917967], [55.227103999999954, 70.78564300000001], [54.619670999999954, 71.22509600000001], [54.26106899999996, 71.005369], [54.06766099999996, 71.22509600000001], [54.222459999999955, 72.257811], [53.95117999999996, 73.224608], [54.04180499999996, 73.664061], [53.88632699999996, 73.59814300000001], [53.42951599999996, 73.400389], [54.41514199999996, 76.85009600000001], [54.015931999999964, 76.498534], [53.31124399999997, 77.794921], [50.86205499999997, 80.189941], [51.29114399999997, 80.673339], [50.80639699999997, 81.574218], [51.00090799999997, 83.266113], [49.62211999999997, 85.353515], [49.807335999999964, 86.540038], [49.07664099999997, 87.506835], [50.80639699999997, 92.252929], [50.55510999999997, 94.362304], [49.99184299999997, 94.77978399999999], [49.864183999999966, 97.72412], [50.45702199999997, 98.317382], [51.09785799999997, 97.812011], [52.17790099999997, 98.844726], [51.34621999999997, 102.14062399999999], [50.44299199999997, 102.60204999999999], [50.16152599999997, 104.07421799999999], [50.471045999999966, 105.52441299999998], [49.977673999999965, 107.63378799999998], [49.342961999999964, 108.60058499999998], [49.191982999999965, 110.18261599999998], [49.55069199999996, 112.97314299999998], [50.24613999999996, 114.15966599999997], [50.23204699999996, 114.81884599999998], [49.94513899999996, 115.89082599999998], [49.87418999999996, 116.70381399999998], [49.60362599999996, 117.82441899999998], [50.12911599999996, 119.29658699999997], [51.69855799999996, 120.15352099999997], [52.14688499999996, 120.76875499999997], [52.59071999999996, 120.50508299999997], [52.85753299999996, 120.37324699999996], [53.162342999999964, 120.92256299999997], [53.464992999999964, 122.65840299999996], [53.425639999999966, 123.82295399999997], [53.083035999999964, 124.83369599999996], [53.056566999999966, 125.64668399999996], [49.788912999999965, 127.55830499999996], [49.460613999999964, 127.99775799999996], [49.34590099999996, 129.53584399999997], [48.710157999999964, 130.52461399999996], [47.696707999999965, 131.00801199999995], [48.37458199999997, 134.72139099999995], [47.54815599999997, 134.67744599999995], [46.87441199999997, 134.01826599999995], [45.36181199999997, 133.09541399999995], [44.95762999999997, 132.98555099999996], [45.28430899999997, 131.93086299999996], [44.832685999999974, 130.98603899999995], [43.119189999999975, 131.29365599999994], [42.68303899999997, 130.45869499999995], [42.357960999999975, 130.61250399999994], [40.27089399999998, 135.42451599999995], [45.98182299999998, 141.03852999999995], [45.253274999999974, 145.81758299999996], [43.81455099999997, 145.21990899999994], [43.668991999999974, 145.74614999999994], [43.79426899999997, 146.38225399999993], [43.39062999999997, 147.55558499999992], [50.25468099999998, 160.71720599999992], [57.89337799999998, 167.05964999999992], [63.30255499999998, -174.3954280000001], [64.46455999999998, -169.6493340000001], [67.23361999999997, -168.1991390000001], [82.14869099999997, 179.5860069999999], [82.26785899999997, 37.02741399999991], [69.78419899999997, 30.77447699999991], [69.78419699999998, 30.77447399999991], [69.78420099999998, 30.77447399999991], [69.784201, 30.774473]]];

	function dateline_correction(src){
		// pseudoDelta method
		// if Lng value becomes negative (positive) and is bigger in abs than the previous Lng value - dateline is crossed
		// in that case +/- 360 deg is applied
		current = 0;
		sign    = 1;
		for( a in src[0]){
			d_sign = (src[0][a][1] >= 0) ? 1 : -1 ; // выбор режима- позитивный/негативный переход. выбирается единожды
			if(d_sign != sign){
				src[0][a][1] = src[0][a][1] + 360;
			}
		}
	}
	// не будем добавлять Россию :)
	// L.polygon(dateline_correction(russia), { className: 'referal' }).setStyle(userstyles["area#district"]).addTo(map);

	/*	NEW CONCEPT	*/
	map.on('click', function(e){
		if(editorStarted){
			addPoint(ID, e);
		}else{
			addPoint(createObject(), e);
			startEditor();
		}
		placeAuxPoints();
		redrawObject();
		buildObjectList();
	});

	function placeAuxPoints(){
		polygonAux.clearLayers();
		if(overlayType == 1 || overlayType == 4){
			return false;
		}
		if(overlayType == 2){
			aug = objectData[ID].geometry;
		}
		if(overlayType == 3){
			aug = objectData[ID].geometry[0];
		}
		b = 0;
		for (a in aug){
			L.marker(aug[a], { icon: L.icon(userstyles['system#greenflag']), title: 'Точка линии #' + b, draggable: true, id: b })
			.addTo(polygonAux)
			.on('move', function(e){
				reportCurrentAux(e.target.options.id, e.target._latlng);
				geometryBuffer[e.target.options.id] = { lat: e.target._latlng.lat, lng: e.target._latlng.lng };
				if(overlayType == 2){
					geometry = [];
					for (d in geometryBuffer){
						geometry.push([ geometryBuffer[d].lat, geometryBuffer[d].lng ]);
					}
				}
				if(overlayType == 3){
					geometry = [[]];
					for (d in geometryBuffer){
						geometry[0].push([ geometryBuffer[d].lat, geometryBuffer[d].lng ]);
					}
				}
				objectData[ID].geometry = geometry;
				redrawObject();
				return false;
				//console.log(objectData[ID].geometry.toSource())
			})
			.on('dblclick', function(e){
				//вот такое хитрое устройство :) иначе по окончанию dragend будет click и popup откроется
				e.target.bindPopup(getAuxObjectPopup(e.target.options.id)).openPopup().unbindPopup();
				return false;
			})
			.on('click', function(e){
				return false;
			});

			geometryBuffer[b] = { lat: aug[a][0], lng: aug[a][1] };
			b++;
		}
		reportGeometry();
	}

	function placeBPs(){
		bpGroup.clearLayers();
		b = 0;
		majorGroup.eachLayer(function(layer){
			if (layer.options.className == 'polyline' || layer.options.className == 'polygon' ){
				l1 = layer.getLatLngs();
				for (a in l1){
					L.marker([l1[a].lat, l1[a].lng], { icon: L.icon(userstyles['system#blueflag']), title: 'Точка линии #' + b, draggable: false, zindex: -2})
					.addTo(polygonAux)
					.on('click', function(e){
						var l2 = editorGroup.getLayers()[0].getLatLngs();
						//console.log([e.target.getLatLng().lat, e.target.getLatLng().lng ]);
						//console.log(l2.getLatLngs() instanceof Array);
						l2.push( { lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng } );
						editorGroup.getLayers()[0].setLatLngs(l2).redraw()
						//console.log(l2)
						//console.log(l2.getLatLngs().toSource());
						redrawObject();
					});
					b++
				}
			}
		});
		/*
		for (a in aug){
			L.marker(aug[a], { icon: L.icon(userstyles['system#greenflag']), title: 'Точка линии #' + b, draggable: false, id: b })
			.addTo(bpGroup)
			.on('move', function(e){
				reportCurrentAux(e.target.options.id, e.target._latlng);
				geometryBuffer[e.target.options.id] = { lat: e.target._latlng.lat, lng: e.target._latlng.lng };
				if(overlayType == 2){
					geometry = [];
					for (d in geometryBuffer){
						geometry.push([ geometryBuffer[d].lat, geometryBuffer[d].lng ]);
					}
				}
				if(overlayType == 3){
					geometry = [[]];
					for (d in geometryBuffer){
						geometry[0].push([ geometryBuffer[d].lat, geometryBuffer[d].lng ]);
					}
				}
				objectData[ID].geometry = geometry;
				redrawObject();
				return false;
				//console.log(objectData[ID].geometry.toSource())
			})
			.on('dblclick', function(e){
				//вот такое хитрое устройство :) иначе по окончанию dragend будет click
				e.target.bindPopup(getAuxObjectPopup(e.target.options.id)).openPopup().unbindPopup();
				return false;
			})
			.on('click', function(e){
				return false;
			});

			geometryBuffer[b] = { lat: aug[a][0], lng: aug[a][1] };
			b++;
		}
		*/
		reportGeometry();
	}

	function startEditor(){
		editorStarted = 1;
		geometryBuffer = {};
		switch(overlayType){
			case 1 :
				point.setLatLng(objectData[ID].geometry)
				.addTo(editorGroup)
				.on('click', function(e){
					ID = parseInt(e.target.options.id);
					moveObjects(ID);
					point.unbindPopup().bindPopup(getPopup(ID)).openPopup();
					reportGeometry();
					buildObjectList();
				})
				.on('dragend', function(e){
					ID = parseInt(e.target.options.id);
					objectData[ID].geometry = [ e.target._latlng.lat, e.target._latlng.lng ];
					reportGeometry();
					moveObjects(ID);
					buildObjectList();
				});
				$("#m_style").unbind().change(function(){
					style = $(this).val();
					editorGroup.eachLayer(function(layer){
						if(ID == parseInt(layer.options.id)){
							layer.setIcon(L.icon(userstyles[style]));
						}
					});
					objectData[ID].style = $(this).val();
				});
				point.options.id = ID;
				objectData[ID].style = $("#m_style").val();
			break;
			case 2 :
				polyline.setLatLngs(objectData[ID].geometry)
				.addTo(editorGroup)
				.setStyle(userstyles[$("#line_style").val()])
				.on('click', function(e){
					ID = parseInt(e.target.options.id);
					polyline.unbindPopup().bindPopup(getPopup(ID)).openPopup();
				})
				.on('contextmenu', function(e){
					moveObjects(e.target.options.id);
					editorGroup.clearLayers();
					polygonAux.clearLayers();
					startEditor();
					placeAuxPoints()
				});
				polyline.options.id = ID;
				objectData[ID].style = $("#line_style").val();
				$("#line_style").unbind().change(function(){
					if(editorGroup.hasLayer(polyline)){
						polyline.setStyle(userstyles[$(this).val()]);
						objectData[ID].style = $(this).val();
					}
				});
			break;
			case 3 :
				polygon.setLatLngs(objectData[ID].geometry)
				.addTo(editorGroup)
				.setStyle(userstyles[$("#polygon_style").val()])
				.on('click', function(e){
					ID = parseInt(e.target.options.id);
					polygon.unbindPopup().bindPopup(getPopup(ID)).openPopup();
				})
				.on('contextmenu', function(e){
					moveObjects(e.target.options.id);
					editorGroup.clearLayers();
					polygonAux.clearLayers();
					startEditor();
					placeAuxPoints()
				});
				objectData[ID].style = $("#polygon_style").val();
				$("#polygon_style").unbind().change(function(){
					if(editorGroup.hasLayer(polygon)){
						polygon.setStyle(userstyles[$(this).val()]);
						objectData[ID].style = $(this).val();
					}
				});
			break;
			case 4 :
				circle.setLatLngs(objectData[ID].geometry)
				.addTo(editorGroup)
				.setStyle(userstyles[$("#circle_style").val()])
				.on('click', function(e){
					ID = parseInt(e.target.options.id);
					circle.unbindPopup().bindPopup(getPopup(ID)).openPopup();
					reportGeometry();
				})
				objectData[ID].style = $("#circle_style").val();
				$("#circle_style").unbind().change(function(){
					if(editorGroup.hasLayer(circle)){
						circle.setStyle(userstyles[$(this).val()]);
						objectData[ID].style = $(this).val();
					}
				});
				reportGeometry();
				moveObjects(ID);
			break;
		}
	}

	function moveObjects(id){
		ID = parseInt(id);
		editorGroup.eachLayer(function(layer){
			editorGroup.removeLayer(layer);
			majorGroup.addLayer(layer);
		});
		majorGroup.eachLayer(function(layer){
			if(ID == parseInt(layer.options.id)){
				majorGroup.removeLayer(layer);
				editorGroup.addLayer(layer);
			}
		});
		buildObjectList();
	}

	function redrawObject(){
		//console.log(ID)
		switch(overlayType){
			case 1 :
				point.setLatLng(objectData[ID].geometry);
			break;
			case 2 :
				polyline.setLatLngs(objectData[ID].geometry);
			break;
			case 3 :
				polygon.setLatLngs(objectData[ID].geometry);
			break;
			case 4 :
				circle.setLatLng(objectData[ID].geometry[0]);
				circle.setRadius(objectData[ID].geometry[1]);
			break;
		}
	}

	function addPoint(ID, e){
		var g  = [e.latlng.lat, e.latlng.lng];
		switch(overlayType){
			case 1 :
				objectData[ID].geometry = g;
			break;
			case 2 :
				objectData[ID].geometry.push(g);
			break;
			case 3 :
				(typeof objectData[ID].geometry[0] == 'undefined') ? objectData[ID].geometry[0] = [g] : objectData[ID].geometry[0].push(g);
			break;
			case 4 :
				objectData[ID].geometry = [g, parseFloat($("#m_rad").val())];
			break;
		}
		reportGeometry();
	}

	function getNewId(){
		var ID = 0;
		for (a in objectData){
			if(parseInt(a) >= ID){
				ID = parseInt(a);
			}
		}
		ID++;
		return ID
	}

	function createObject(){
		ID = getNewId();
		objectData[ID] = { geometry: [], style: '', name: '', type: overlayType, link: '', desc: '' };
		//console.log("Object Created");
		return ID;
	}

	function close_editor(id){
		majorGroup.addTo(map);
		editorStarted  = 0;
		//console.log('m:' + majorGroup.getLayers().length + '  e:' + editorGroup.getLayers().length);
		editorGroup.eachLayer(function(layer){
			editorGroup.removeLayer(layer);
			majorGroup.addLayer(layer);
			layer.options.title = [ objectData[parseInt(layer.options.id)].name, objectData[parseInt(layer.options.id)].desc ].join(" ");
		});
		///console.log('m:' + majorGroup.getLayers().length + '  e:' + editorGroup.getLayers().length);
		$("#pathE").html(((editorStarted) ? "Да" : "Нет" ));
		geometryBuffer = {};
		polygonAux.clearLayers();
		editorGroup.clearLayers();
		//console.log('m:' + majorGroup.getLayers().length + '  e:' + editorGroup.getLayers().length);
	}

	function reportGeometry(){
		$("#objdata").html(objectData[ID].geometry.toSource());
		if(overlayType == 1){
			$("#pointlat").val(objectData[ID].geometry[0]);
			$("#pointlng").val(objectData[ID].geometry[1]);
		}
		if(overlayType == 4){
			$("#pointlat").val(objectData[ID].geometry[0][0]);
			$("#pointlng").val(objectData[ID].geometry[0][1]);
			$("#m_rad").val(objectData[ID].geometry[1]);
		}
	}

	function getPopup(id){
		//console.log(data.toSource())
		var string = '<div id="inputData">'
			+ '<h4></h4>'
			+ '<input type="hidden" id="obj_id" value="' + id + '">'
			+ '<div class="input-prepend" style="margin:0px 5px;">'
			+ '<span class="add-on">Название</span><input type="text" id="obj_name" placeholder="Название Объекта" value="">'
			+ '</div>'
			+ '<div class="input-prepend" style="margin:0px 5px;">'
			+ '<span class="add-on">Тип</span><input type="text" id="obj_desc" placeholder="Классификация Объекта" value="">'
			+ '</div>'
			+ '<div class="input-prepend" style="margin:0px 5px;">'
			+ '<span class="add-on">Ссылка</span><input type="text" id="obj_link" placeholder="Ссылка на Объект в справочнике" value="">'
			+ '</div>'
			+ '<span type="button" class="btn btn-mini btn-danger objDelete" ref="' + id + '">Удалить</span>'
			+ '<span type="button" class="btn btn-mini btn-primary objSaver" ref="' + id + '">Сохранить</span>'
		+ '</div>';
		return string;
	}

	function getAuxObjectPopup(id){
		//console.log(data.toSource())
		var string = '<div>'
			+ '<span type="button" class="btn btn-mini btn-danger auxDelete" ref="' + id + '">Удалить</span>'
		+ '</div>';
		return string;
	}

	function buildObjectList(){
		//console.log("objList rebuild");
		$("#objList").empty();
		majorGroup.eachLayer(function(layer){
			if(typeof objectData[layer.options.id] != 'undefined'){
				label = [objectData[layer.options.id].desc, objectData[layer.options.id].name].join(" ");
				switch (parseInt(objectData[layer.options.id].type)){
					case 1 :
					$("#objList").append('<div><img src="http://api.korzhevdp.com/images/marker.png" alt="point"> ' + label + '</div>');
				break;
				case 2 :
					$("#objList").append('<div><img src="http://api.korzhevdp.com/images/layer-shape-polyline.png" alt="line"> ' + label + '</div>');
				break;
				case 3 :
					$("#objList").append('<div><img src="http://api.korzhevdp.com/images/layer-shape-polygon.png" alt="polygon"> ' + label + '</div>');
				break;
				case 4 :
					$("#objList").append('<div><img src="http://api.korzhevdp.com/images/layer-shape-ellipse.png" alt="circle"> ' + label + '</div>');
					break;
				}
				//console.log(layer.options.id);
			}
		});
		$("#inMG").html(majorGroup.getLayers().length);
		editorGroup.eachLayer(function(layer){
			if(typeof objectData[layer.options.id] != 'undefined'){
				label = [objectData[layer.options.id].desc, objectData[layer.options.id].name].join(" ");
				switch (parseInt(objectData[layer.options.id].type)){
					case 1 :
						$("#objList").prepend('<div class="editing" ref="' + layer.options.id + '"><img src="http://api.korzhevdp.com/images/marker.png" alt="point"> ' + label + '</div>');
					break;
					case 2 :
						$("#objList").prepend('<div class="editing" ref="' + layer.options.id + '"><img src="http://api.korzhevdp.com/images/layer-shape-polyline.png" alt="line"> ' + label + '</div>');
					break;
					case 3 :
						$("#objList").prepend('<div class="editing" ref="' + layer.options.id + '"><img src="http://api.korzhevdp.com/images/layer-shape-polygon.png" alt="polygon"> ' + label + '</div>');
					break;
					case 4 :
						$("#objList").prepend('<div class="editing" ref="' + layer.options.id + '"><img src="http://api.korzhevdp.com/images/layer-shape-ellipse.png" alt="circle"> ' + label + '</div>');
					break;
				}
				//console.log(objectData[layer.options.id].type);
			}
		});
		$("#inEG").html(editorGroup.getLayers().length);
		$("#objList div.editing").unbind().click(function(){
			alert($(this).attr("ref"))
		})
	}

	function reportCurrentAux(id, coords){
		currentAux = id;
		$("#currentAux").html(currentAux);
		polygonAux.eachLayer(function(layer){
			if(layer.options.id == id){
				layer.setIcon(L.icon(userstyles['system#redflag']));
			}else{
				layer.setIcon(L.icon(userstyles['system#greenflag']));
			}
		});
		$("#pointlat").val(coords.lat);
		$("#pointlng").val(coords.lng);
	}

	function addPopupListeners(){
		//console.log(objectData.toSource());
		$(".objSaver").unbind().click(function(){
			objectData[ID].name = $("#obj_name").val();
			objectData[ID].desc = $("#obj_desc").val();
			objectData[ID].link = $("#obj_link").val();
			close_editor(parseInt($(this).attr("ref")));

			buildObjectList()
			map.closePopup();
			//console.log(objectData.toSource());
		});

		$(".objFinish").unbind().click(function(){
			close_editor(parseInt($(this).attr("ref")));
			buildObjectList()
		});

		$(".auxDelete").unbind().click(function(){
			//console.log(geometryBuffer.toSource());
			//console.log(currentAux);
			id = parseInt($(this).attr('ref'));
			console.log(id);
			delete(geometryBuffer[id]);

			polygonAux.eachLayer(function(layer){
				if(layer.options.id == id){
					polygonAux.removeLayer(layer);
				}
			});
			if(overlayType == 2){
				geometry = [];
				for(n in geometryBuffer){
					geometry.push([geometryBuffer[n].lat, geometryBuffer[n].lng]);
				}
			}
			if(overlayType == 3){
				geometry = [[]];
				for(n in geometryBuffer){
					geometry[0].push([geometryBuffer[n].lat, geometryBuffer[n].lng]);
				}
			}
			objectData[ID].geometry = geometry;
			redrawObject();
			buildObjectList();
		});

		$(".objDelete").unbind().click(function(){
			delete(objectData[ID]);
			editorGroup.eachLayer(function(layer){
				editorGroup.removeLayer(layer);
			});
			close_editor()
			buildObjectList()
		});

		$("#obj_name").val(objectData[ID].name);
		$("#obj_desc").val(objectData[ID].desc);
		$("#obj_link").val(objectData[ID].link);
	}

	map.on('popupopen', addPopupListeners);

	///////////// workaround ////////////

		$(".obj_sw").click(function(){
			$(".panes").addClass("hide");
			$("#pane" + $(this).attr('pr')).removeClass("hide");
			($(this).attr('pr') == "2" || $(this).attr('pr') == "3") ? $("#bpModeSw").removeClass("hide") : $("#bpModeSw").addClass("hide") ;
			overlayType = parseInt($(this).attr('pr'));
			editorStarted = 0;

			//
			$("#pathE").html(((editorStarted) ? "Да" : "Нет" ));
		});

		function check_nav(){
			wlayer = 0;
			t_objects.clearLayers();
			// когда-то использовались чекбоксы, поэтому |:checked|
			// При необходимости признак можно поменять. Например на наличие css-класса
			$(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag).each(function(){
				placeObject(this);
			});

			// если длина массива чекбоксов ненулевая, позиционируем карту на охват объектов
			//console.log(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag);
			//console.log($(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag).length);
			if($(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag).length){
				//console.log('zooming')
				//map.setBounds(t_objects.getBounds(), { zoomMargin: 100, duration: 300 });
				//map.setType(config.layerTypes[wlayer].label);
			}

			function cycle_objects(){
				clearTimeout(bigCycle);
				//console.log("big cycle, demo stop:" + isDemoStopped);
				map.setCenter(t_objects.get(0).geometry.getCoordinates(), 15);

				$("#nextObject").unbind().click(function(){
					map.balloon.close();
					isDemoStopped = 0;
					centerOnObject();
					return false;
				});

				$("#prevObject").unbind().click(function(){
					map.balloon.close();
					isDemoStopped = 0;
					demoCounter = (demoCounter >= 2) ? (demoCounter-2) : 0;
					centerOnObject();
					return false;
				});

				function centerOnObject(){
					var openTimer,
						closeTimer;
					clearTimeout(lilCycle);
					if(isDemoStopped){
						return false;
					}
					len = t_objects.getLength();
					//console.log("DC " + demoCounter);
					if(demoCounter < len){
						object = t_objects.get(demoCounter);
						gt     = object.geometry.getType();
						if(gt == "Point"){
							map.setCenter(object.geometry.getCoordinates(), 16, { duration: 4000 } );
						}else{
							map.setBounds(object.geometry.getBounds(), { duration: 4000, zoomMargin: 200 });
						}
						function openB(){
							clearInterval(openTimer)
							clearInterval(closeTimer)
							object.balloon.open();
							function closeB(){
								map.balloon.close();
								return false;
							}
							closeTimer = setTimeout(closeB, 26000);
							return false;
						}
						openTimer = setTimeout(openB, 6000);
						demoCounter++;
					}else{
						demoCounter = 0;
					}
					lilCycle = setTimeout(centerOnObject, 30000);
				}

				centerOnObject();

				if(isDemoStopped){
					clearTimeout(bigCycle);
					return false;
				}
			}

			// режим автопрезентации...
			if(config.demoMode){
				$("#exstart").addClass('hide');
				//map.geoObjects.remove(t_objects);
				$(config.selectors.systemNavigatorClass).addClass("hide");
				map.geoObjects.add(t_objects);
				map.setBounds(t_objects.getBounds(), { duration: 3000 } );
				setTimeout(cycle_objects, 5000);
			}

			$("#exstart").parent().parent().unbind().click(function(){
				if($("#exstart").hasClass('hide')){
					//console.log("stop")
					isDemoStopped = 1;
					$("#exstop, #prevObject, #nextObject").addClass('hide');
					$("#exstart").removeClass('hide');
					return false;
				}
				if($("#exstop").hasClass('hide')){
					isDemoStopped = 0;
					//console.log("start")
					demoCounter = (demoCounter) ? (demoCounter - 1) : demoCounter;
					cycle_objects();
					$("#exstop, #prevObject, #nextObject").removeClass('hide');
					$("#exstart").addClass('hide');
					return false;
				}
			});
		}

		function placeObject(item){
			var packet = parseInt($(item).attr("packet")),
				ref    = parseInt($(item).attr("ref")),
				data   = sights[packet].content[ref],
				htext  = data.d;
			//alert([data.c[1], data.c[0]].join(" - "))
			switch(data.ct){
				case 1 :
					if(typeof userstyles[data.st] == 'undefined'){
						data.st = 'user#wall';
					}
					L.marker([data.c[1], data.c[0]], { icon: L.icon(userstyles[data.st]) }).addTo(t_objects);
				break;
				case 2 :
					if(typeof userstyles[data.st] == 'undefined'){
						data.st = 'user#wall';
					}
					L.Polyline(data.c, userstyles[data.st]).addTo(t_objects);
				break;
				case 3 :
					if(!data.cx.length){
						break;
					}
					if(typeof userstyles[data.st] == 'undefined'){
						data.st = 'area#default';
					}
					L.multiPolygon(data.cx, userstyles[data.st]).addTo(t_objects);
				break;
				case 4 :
					if(typeof userstyles[data.st] == 'undefined'){
						data.st = 'circle#default';
					}
					L.circle([data.c[1], data.c[0]], data.c[2], userstyles[data.st]).addTo(t_objects);
				break;
				// and so on...
			}
			wlayer = data.l;
			map.fitBounds(t_objects.getBounds());
		}

		//mark clusters
		function mark_clusters(){
			//console.log($(config.selectors.systemObjectClass + ", " + config.selectors.systemGroupClass).length);

			if(labelmode){
				//console.log("off")
				$(config.selectors.systemObjectClass + ", " + config.selectors.systemGroupClass).prop("checked", false);
			}else{
				//console.log("on")
				$(config.selectors.systemObjectClass + ", " + config.selectors.systemGroupClass).removeClass(activeness);
			}

			//console.log(config.selectors.systemClusterClass + config.selectors.systemActiveFlag)
			len = $(config.selectors.systemClusterClass +  config.selectors.systemActiveFlag).length;
			//console.log($(config.selectors.systemClusterClass + config.selectors.systemActiveFlag).length)

			if(!len && config.showObjectsOS){
				//console.log("mk clust11");
				if(labelmode){
					$(config.selectors.systemObjectClass).prop("checked", true);
				}else{
					$(config.selectors.systemObjectClass).addClass(activeness);
				}
			}else{
				//console.log("mk clust22");
				$(config.selectors.systemClusterClass + config.selectors.systemActiveFlag).each(function(){
					ref = parseInt($(this).attr("ref"));
					for (a in clusters[ref].content){
						//console.log("#" + config.selectors.systemObjectIdPrefix + clusters[ref].content[a])
						if(labelmode){
							$("#" + config.selectors.systemObjectIdPrefix + clusters[ref].content[a]).prop("checked", true);
						}else{
							$("#" + config.selectors.systemObjectIdPrefix + clusters[ref].content[a]).addClass(activeness);
						}
					}
				});
			}

			check_nav();
			//map.setZoom(14);
		}

		/* установка отметок в навигаторе на основе выбранных групп. И последующее отображение самих объектов */
		function mark_gr(){
			//console.log("mk group");
			if(labelmode){
				//console.log("off 1");
				$(config.selectors.systemObjectClass + ", " + config.selectors.systemClusterClass).prop("checked", false);
			}else{
				//console.log("off 2");
				$(config.selectors.systemObjectClass + ", " + config.selectors.systemClusterClass).removeClass(activeness);
			}

			len = $(config.selectors.systemGroupClass + config.selectors.systemActiveFlag).length;
			//console.log(config.selectors.systemClusterClass + config.selectors.systemActiveFlag)
			//console.log(len);
			if(!len && config.showObjectsOS){
				//console.log("no longer");
				if(labelmode){
					$(config.selectors.systemObjectClass).prop("checked", true);
				}else{
					$(config.selectors.systemObjectClass).addClass(activeness);
				}
			}else{
				//console.log("make that");
				$(config.selectors.systemGroupClass).each(function(){
					state = (labelmode) ? $(this).prop("checked") : $(this).hasClass(activeness);
					group = $(this).attr("gid");
					if(state){
						$(config.selectors.systemObjectClass + "[gid=" + group + " ]").each(function(){
							(labelmode) ? $(this).prop("checked", state) : $(this).addClass(activeness);
						});
					}
				});
			}

			/* показываеются отмеченные объекты */
			check_nav();
		}

		$.ajax({
			type: "POST",
			url: "/getsights.php",
			dataType: 'script',
			data: {
				dir : config.url
			},
			success: function(data){
				//eval(data);
				// заполнение списка групп объектов
				if(typeof groups != 'undefined'){
					sc = config.selectors.systemGroupClass.replace(/^(\.|:)/, '');
					for(a in groups){
						if(labelmode){
							navitem = '<label for="' + config.selectors.systemGroupIdPrefix + a + '"><input type="checkbox" class="' + sc + '" id="' + config.selectors.systemGroupIdPrefix + a + '" gid="' + a + '">' + groups[a].g + '</label>';
						}else{
							navitem = '<span class="' + sc + '" id="' + config.selectors.systemGroupIdPrefix + a + '" gid="' + a + '">' + groups[a].g + '</span>';
						}
						// в навигатор
						$(config.selectors.systemGroupsContainer).append(navitem);
					}
				}

				// заполнение списка кластеров
				if(typeof clusters != 'undefined'){
					sc = config.selectors.systemClusterClass.replace(/^(\.|:)/, '');
					for(a in clusters){
						if(labelmode){
							navitem = '<label for="' + config.selectors.systemClusterIdPrefix + a + '"><input type="checkbox" class="' + sc + '" ref="' + a + '" id="' + config.selectors.systemClusterIdPrefix + a + '">' + clusters[a].label + '</label>';
						}else{
							navitem = '<span class="' + sc + '" ref="' + a + '" id="' + config.selectors.systemClusterIdPrefix + a + '">' + clusters[a].label + '</span>';
						}
						// в навигатор
						$(config.selectors.systemClustersContainer).append(navitem);
					}
				}

				// заполнение списков объектов
				if(typeof sights != 'undefined'){
					sc = config.selectors.systemObjectClass.replace(/^(\.|:)/, '');
					if(config.objectSearch){
						$(config.selectors.systemObjectsContainer).append('<input type="text" id="ofilter" placeholder="Отобрать объекты" style="height:20px;width:190px;font-size:10px;padding:2px"><i class="icon-filter" style="margin-top:-4px;margin-left:5px;"></i>');
					}

					for (a in sights){
						// в навигатор. Список групп.
						$(config.selectors.systemObjectsContainer).append('<strong>' + sights[a].label + '</strong><br>');
						label = sights[a].label;
						proxy = sights[a].content;
						//i = 0;
						for ( b in proxy ){
							// фильтр пустых полей
							if(!proxy[b].a){
								continue;
							}
							// в таблицу примечательных мест
							$("#sList").append('<tr><td>' + proxy[b].d + '</td><td><a href="#" class="btn btn-mini btn-inverse sightsV" packet="' + a + '" ref="' + b + '">Показать</a></td></tr>');
							// в навигатор
							//alert(1)
							if(labelmode){
								navitem = '<label for="' + config.selectors.systemObjectIdPrefix + b + '"><input type="checkbox" class="' + sc + '" id="' + config.selectors.systemObjectIdPrefix + b + '" ref="' + b + '" packet="' + a + '" gid="' + proxy[b].g + '">' + proxy[b].d + '</label>';
							}else{
								navitem = '<span class="' + sc + '" id="' + config.selectors.systemObjectIdPrefix + b + '" ref="' + b + '" packet="' + a + '" gid="' + proxy[b].g + '">' + proxy[b].d + '</span>';
							}
							$(config.selectors.systemObjectsContainer).append(navitem + "\n");
							//i++;
						}
					}
					//console.log(i);
					//if(i){
						//$("#sightsPane").removeClass("hide");
					//}
				}

				if (!config.showClusters){
					$(config.selectors.systemClustersContainer).addClass("hide");
				}

				if (!config.showGroups){
					$(config.selectors.systemGroupsContainer).addClass("hide");
				}

				if (!config.showObjects){
					$(config.selectors.systemObjectsContainer).addClass("hide");
				}

				// назначение обработки щелчка по кнопке списка примечательных мест
				/*
				$(".sightsV").unbind().click(function(){
					var geometry     = { type: "Point", coordinates: config.mcenter },	// умолчательная геометрия
						ref          = $(this).attr("ref"),								// индекс объекта
						packet       = $(this).attr("packet"),							// индекс пакета - тематического раздела справочника объектов
						data         = sights[packet].content[ref],						// прокси-объект извлекаемый из справочника объектов
						properties   = { description: data.d, hintContent: data.d, name: data.d, link: data.ln },			// умолчательный набор свойств
						options      = (data.st.length > 3) ? ymaps.option.presetStorage.get(data.st) : defaultStyle;		// установка стиля
					switch(parseInt(data.ct)){											// формирование объектов карты в зависимости от типа геометрии
						case 1:
							geometry = { type: "Point", coordinates: data.c };
							object   = new ymaps.Placemark(geometry, properties, options);
						break;
						case 2:
							geometry = ymaps.geometry.LineString.fromEncodedCoordinates(data.c);
							object   = new ymaps.Polyline(geometry, properties, options);
						break;
						case 3:
							geometry = ymaps.geometry.Polygon.fromEncodedCoordinates(data.c);
							object   = new ymaps.Polygon(geometry, properties, options);
						break;
						case 4:
							geometry = ymaps.geometry.Circle(data.c, data.rad);
							object   = new ymaps.Polygon(geometry, properties, options);
						break;
					}
					a_objects.removeAll();															// очищается коллекция
					a_objects.add(object);															// добавляется объект
					map.setBounds(a_objects.getBounds(), { zoomMargin: 100, duration: 300 });;		// центровка карты
					map.setType(config.layerTypes[data.l].label);									// переключение слоя карты
					$("#clearMap").removeClass("hide");												// отображение кнопки очистки карты
					$("#sightsList").modal('hide');													// закрытие модального окна
				});
				*/
				// инициализация навигатора: первичное отображение, простановка отметок, инициализация обработки кластеров.


				// если кто-то щёлкнул по навигатору:
				$( config.selectors.systemObjectsContainer + "> *").unbind().click(function(){
					//console.log("obj click")
					if(!labelmode){
						($(this).hasClass(activeness))
							? $(this).removeClass(activeness)
							: $(this).addClass(activeness);
					}
					//check_nav();
				});
				// обработка щелчка по кластеру
				$( config.selectors.systemClustersContainer + "> *").unbind().click(function(){
					//console.log("clust click")
					if(!labelmode){
						($(this).hasClass(activeness))
							? $(this).removeClass(activeness)
							: $(this).addClass(activeness);
					}
					mark_clusters();
				});
				$(config.selectors.systemGroupClass).unbind().click(function(){
					//console.log("group click")
					if(!labelmode){
						($(this).hasClass(activeness))
							? $(this).removeClass(activeness)
							: $(this).addClass(activeness);
					}
					mark_gr();
				});
				// и принудительно - первичное заполнение.
				//mark_gr();
				//check_nav();
				// последняя обработка каталога
				// отображение кластеров

				if(config.showClustersOS){
					(labelmode)
						? $(config.selectors.systemClusterClass).prop("checked", true)
						: $(config.selectors.systemClusterClass).addClass(activeness);
					mark_clusters();
				}
				if(config.showGroupsOS){
					(labelmode)
						? $(config.selectors.systemGroupClass).prop("checked", true)
						: $(config.selectors.systemGroupClass).addClass(activeness);
				}
				if(config.showObjectsOS){
					(labelmode)
						? $(config.selectors.systemObjectClass).prop("checked", true)
						: $(config.selectors.systemObjectClass).addClass(activeness);
					check_nav();
				}
				if(config.objectSearch){
					$("#ofilter").empty().unbind().keyup(function(){
						str = $(this).val();
						//console.log(str);
						if(labelmode){
							$(config.selectors.systemObjectClass).each(function(){
								if($(this).parent().html().indexOf(str) == -1){
									$(this).parent().addClass("hide");
									$(this).prop("checked", false);
								}else{
									$(this).parent().removeClass("hide");
									//$(this).prop("checked", false);
								}
							});
						}else{
							$(config.selectors.systemObjectClass).each(function(){
								if($(this).parent().html().indexOf(str) == -1){
									$(this).addClass("hide").removeClass(activeness);
								}else{
									$(this).removeClass("hide");
									//$(this).addClass(activeness);
								}
							});
						}
						check_nav();
					});
				}
				if(config.hasNav && !config.demoMode){
					$(config.selectors.systemNavigatorClass).removeClass("hide");
				}else{
					$(config.selectors.systemNavigatorClass).addClass("hide");
				}
			},
			error: function(data,stat,err){
				alert([data,stat,err].join("\n"));
			}
		});

}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Direct and Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2015  */
/*                                                                                   MIT Licence  */
/*                                                                                                */
/* from: T Vincenty, "Direct and Inverse Solutions of Geodesics on the Ellipsoid with application */
/*       of nested equations", Survey Review, vol XXIII no 176, 1975                              */
/*       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

//if (typeof module!='undefined' && module.exports) var LatLon = require('./latlon-ellipsoidal.js'); // CommonJS (Node)
var LatLon = {};
LatLon.ellipsoid = {
    WGS84:        { a: 6378137,     b: 6356752.31425, f: 1/298.257223563 },
    SphericalMerc:{ a: 6378137,     b: 6378137,       f: 0               },
    GRS80:        { a: 6378137,     b: 6356752.31414, f: 1/298.257222101 },
    Airy1830:     { a: 6377563.396, b: 6356256.909,   f: 1/299.3249646   },
    AiryModified: { a: 6377340.189, b: 6356034.448,   f: 1/299.3249646   },
    Intl1924:     { a: 6378388,     b: 6356911.946,   f: 1/297           },
    Bessel1841:   { a: 6377397.155, b: 6356078.963,   f: 1/299.152815351 }
};
//var LatLon = {};

/**
 * Direct and inverse solutions of geodesics on the ellipsoid using Vincenty formulae
 */


/**
 * Returns the distance between ‘this’ point and destination point along a geodesic, using Vincenty
 * inverse solution.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns (Number} Distance in metres between points or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475), p2 = new LatLon(58.64402, -3.07009);
 *   var d = p1.distanceTo(p2); // d: 969954.166
 */
LatLon.distanceTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).distance;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the initial bearing (forward azimuth) to travel along a geodesic from ‘this’ point to the
 * specified point, using Vincenty inverse solution.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number}  initial Bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475), p2 = new LatLon(58.64402, -3.07009);
 *   var b1 = p1.initialBearingTo(p2); // b1.toFixed(4): 9.1419
 */
LatLon.initialBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).initialBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic from ‘this’ point
 * to the specified point, using Vincenty inverse solution.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number}  Initial bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475), p2 = new LatLon(58.64402, -3.07009);
 *   var b2 = p1.finalBearingTo(p2); // b2.toFixed(4): 11.2972
 */
LatLon.finalBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).finalBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the destination point having travelled the given distance along a geodesic given by
 * initial bearing from ‘this’ point, using Vincenty direct solution.
 *
 * @param   {number} distance - Distance travelled along the geodesic in metres.
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @returns {LatLon} Destination point.
 *
 * @example
 *   var p1 = new LatLon(-37.95103, 144.42487);
 *   var p2 = p1.destinationPoint(54972.271, 306.86816); // p2.toString(): 37.6528°S, 143.9265°E
 */
LatLon.destinationPoint = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).point;
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic given by initial
 * bearing for a given distance from ‘this’ point, using Vincenty direct solution.
 *
 * @param   {number} distance - Distance travelled along the geodesic in metres.
 * @param   {LatLon} initialBearing - Initial bearing in degrees from north.
 * @returns {number} Final bearing in degrees from north (0°..360°).
 *
 * @example
 *   var p1 = new LatLon(-37.95103, 144.42487);
 *   var b2 = p1.finalBearingOn(306.86816, 54972.271); // b2.toFixed(4): 307.1736
 */
LatLon.finalBearingOn = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).finalBearing;
};


/**
 * Vincenty direct calculation.
 *
 * @private
 * @param   {number} distance - Distance along bearing in metres.
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @returns (Object} Object including point (destination point), finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLon.direct = function(distance, initialBearing) {
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var α1 = initialBearing.toRadians();
    var s = distance;

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var sinα1 = Math.sin(α1);
    var cosα1 = Math.cos(α1);

    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var σ1 = Math.atan2(tanU1, cosα1);
    var sinα = cosU1 * sinα1;
    var cosSqα = 1 - sinα*sinα;
    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

    var cos2σM, sinσ, cosσ, Δσ;

    var σ = s / (b*A), σʹ, iterations = 0;
    do {
        cos2σM = Math.cos(2*σ1 + σ);
        sinσ = Math.sin(σ);
        cosσ = Math.cos(σ);
        Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
            B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));
        σʹ = σ;
        σ = s / (b*A) + Δσ;
    } while (Math.abs(σ-σʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge'); // not possible?

    var x = sinU1*sinσ - cosU1*cosσ*cosα1;
    var φ2 = Math.atan2(sinU1*cosσ + cosU1*sinσ*cosα1, (1-f)*Math.sqrt(sinα*sinα + x*x));
    var λ = Math.atan2(sinσ*sinα1, cosU1*cosσ - sinU1*sinσ*cosα1);
    var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
    var L = λ - (1-C) * f * sinα *
        (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    var λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

    var α2 = Math.atan2(sinα, -x);
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0...360

    return {
        point:        new LatLon(φ2.toDegrees(), λ2.toDegrees(), this.datum),
        finalBearing: α2.toDegrees()
    };
};


/**
 * Vincenty inverse calculation.
 *
 * @private
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {Object} Object including istance, initialBearing, finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLon.inverse = function(point) {
    var p1 = this, p2 = point;
    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var L = λ2 - λ1;
    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var tanU2 = (1-f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

    var sinλ, cosλ, sinSqσ, sinσ, cosσ, σ, sinα, cosSqα, cos2σM, C;

    var λ = L, λʹ, iterations = 0;
    do {
        sinλ = Math.sin(λ);
        cosλ = Math.cos(λ);
        sinSqσ = (cosU2*sinλ) * (cosU2*sinλ) + (cosU1*sinU2-sinU1*cosU2*cosλ) * (cosU1*sinU2-sinU1*cosU2*cosλ);
        sinσ = Math.sqrt(sinSqσ);
        if (sinσ == 0) return 0;  // co-incident points
        cosσ = sinU1*sinU2 + cosU1*cosU2*cosλ;
        σ = Math.atan2(sinσ, cosσ);
        sinα = cosU1 * cosU2 * sinλ / sinσ;
        cosSqα = 1 - sinα*sinα;
        cos2σM = cosσ - 2*sinU1*sinU2/cosSqα;
        if (isNaN(cos2σM)) cos2σM = 0;  // equatorial line: cosSqα=0 (§6)
        C = f/16*cosSqα*(4+f*(4-3*cosSqα));
        λʹ = λ;
        λ = L + (1-C) * f * sinα * (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    } while (Math.abs(λ-λʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge');

    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
        B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));

    var s = b*A*(σ-Δσ);

    var α1 = Math.atan2(cosU2*sinλ,  cosU1*sinU2-sinU1*cosU2*cosλ);
    var α2 = Math.atan2(cosU1*sinλ, -sinU1*cosU2+cosU1*sinU2*cosλ);

    α1 = (α1 + 2*Math.PI) % (2*Math.PI); // normalise to 0...360
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0...360

    s = Number(s.toFixed(3)); // round to 1mm precision
    return { distance: s, initialBearing: α1.toDegrees(), finalBearing: α2.toDegrees() };
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // CommonJS (Node)
if (typeof define == 'function' && define.amd) define([], function() { return LatLon; }); // AMD