/*
Краткий мануал по изготовлению карт на основе этого обработчика.
системные файлы:
	config.js			- умолчательная конфигурация для всех карт
	luftmapsutils.js	- обработчик страницы и поведения её контролов (этот файл)
	ymaps.js			- конкретная конфигурация карты и обработчик
*/

var sights = [],
	defaultStyle  = { iconImageHref: 'http://api.korzhevdp.com/images/location_pin.png', iconImageSize: [32, 32], iconImageOffset: [-16, -32]},
	photoStyle    = { iconImageHref: 'http://api.korzhevdp.com/images/cameras.png', iconImageSize: [16, 16], iconImageOffset: [-8, -8]  },
	vectoropts    = { strokeColor: 'FF220099', strokeWidth: 2, strokeStyle: { style: 'solid' } },
	isDemoStopped = 0,
	demoCounter   = 0,
	lilCycle,
	bigCycle,
	cl4show       = [];

// ########## ОБРАБОТКА ПУНКТОВ МЕНЮ ###########
	//UI elements
	// создаём и скрываем модальные окна
	$(".modal").modal("hide");
	// поведение пункта меню "оставить отзыв"
	$("#leaveMessage").click(function () {
		$("#leaveMessageF").modal('show');
	});
	// поведение пункта меню "логин"
	$("#userP, .logIn").unbind().click(function (event) {
		event.stopPropagation();
		$.ajax({
			type: "POST",
			url: "/setref.php",
			data: {
				url: config.url
			},
			dataType: 'text',
			success: function (data) {
				$("#loginM").modal('show');
			},
			error: function (data,stat,err) {
				alert([data,stat,err].join("\n"));
			}
		});
	});
	// поведение пункта меню "логаут"
	$(".logOut").click(function () {
		$.ajax({
			type: "GET",
			url: "/logout.php",
			dataType: 'script',
			success: function (data) {
				get_user();
				$(".modal").modal("hide");
			},
			error: function (data,stat,err) {
				alert([data,stat,err].join("\n"));
			}
		});
	});
	// поисковая форма
	$("#searchFormToggle").click(function () {
		a = map.controls.indexOf(searchControl);
		//alert(a)
		if (a < 0) {
			map.controls.add(searchControl);
		} else {
			map.controls.remove(searchControl);
		}
	});
	// "интерактивный справочник"
	$(".toggleNav").click(function () {
		if ($("#objNavigator").hasClass("hide")) {
			$("#objNavigator").removeClass("hide");
			return false;
		} else {
			$("#objNavigator").addClass("hide");
			return false;
		}
	});
	// поведение пункта меню "показать фотографии"
	$(".sphotos").click(function () {
		$(this).prop("src", "http://api.korzhevdp.com/images/loading.gif")
		$.ajax({
			type: "POST",
			url: "/getphotos.php",
			dataType: 'script',
			data: {
				picpath: config.url
			},
			success: function (data) {
				p_objects.removeAll();
				if (data == "0") {
					alert("Фотографий не найдено");
					return false;
				}
				for (a in imgs) {
					cs = a.split(",");
					wgeometry = [parseFloat(cs[0]), parseFloat(cs[1])];
					for (b in imgs[a] ) {
						data = imgs[a][b];
						geometry   = { type: "Point", coordinates: wgeometry },
						properties = { dir: cs, fname: data.fn, uploadedby: data.load, description: data.desc, hintContent: data.desc, hasBalloon: 0, clickable: 1 },
						options    = photoStyle,
						object     = new ymaps.Placemark(geometry, properties, options);
						vector     = new ymaps.Polyline(ymaps.geometry.LineString.fromEncodedCoordinates(data.vector), { hasHint: 1, hintContent: "Направление съёмки", clickable: 0 }, vectoropts);

						// помещается в контейнер вспомогательных объектов
						p_objects.add(object);
						p_objects.add(vector);
					}
				}
				return true;
			},
			error: function (data,stat,err) {
				alert([data,stat,err].join("\n"));
			}
		});
		// замена пунктов меню
		$(".sphotos").addClass('hide').prop("src", "http://api.korzhevdp.com/images/camera_grey.png");
		$(".hphotos").removeClass('hide');
	});
	// поведение пункта меню "примечательные места"
	$("#sightSeeing").unbind().click(function () {
		/*
		в случае, если массив не заполнен - он запрашивается на сервере
		получает:
		sights = [
			[(number) в.д, (number) с.ш., (number) id слоя, 'Описание отметки'],
			...
		]
		*/
		$("#sightsList").modal('show');
	});
	// поведение пункта меню "скрыть фотографии"
	$(".hphotos").click(function () {
		p_objects.removeAll();
		// замена пунктов меню
		$(".hphotos").addClass('hide');
		$(".sphotos").removeClass('hide');
	});
	// поведение пункта меню "оставить отзыв"
	$("#saveMessage").click(function () {
		$.ajax({
			type: "POST",
			data: {
				name :  $("#name").val(),
				email: $("#email").val(),
				text :  $("#text").val()
			},
			url: "/leavemessage.php",
			dataType: 'text',
			success: function (data) {
				alert(data);
				$(".modal").modal("hide");
			},
			error: function (data,stat,err) {
				alert([data,stat,err].join("\n"));
			}
		});
	});
	// поведение пункта меню "очистить карту"
	$("#clearMap").click(function () {
		a_objects.removeAll();
		$(this).addClass("hide");
	});
	$("#share").click(function () {
		$("#sharer input[type=checkbox]").prop("checked", false);
		$("#iframesrc").val("");
		$("#sharer").modal('show');
	});
	$("#iframeGet").click(function () {
		$.ajax({
			type    : "POST",
			url     : "/share.php",
			data    : {
				domain: $("#siteDomain").val()
			},
			dataType: 'text',
			success : function (data) {
				if (data.length == 32) {
					out = [];
					if ($("#navinclude").prop('checked')) {
						out.push("nav=1");
					} else {
						out.push("nav=0");
					}
					if ($("#autodemo").prop('checked')) {
						out.push("&demo=1");
					} else {
						out.push("&demo=0");
					}
					content = '&obj=none';
					if ($("#objinclude").prop('checked')) {
						content = "&obj=obj";
					}
					if ($("#photoinclude").prop('checked')) {
						content = "&obj=photo";
					}
					if ($("#objinclude").prop('checked') && $("#photoinclude").prop('checked')) {
						content = "&obj=both";
					}
					out.push(content);
					out.push('&folder=' + config.url);
					out.push('&uid=' + data);
					string = '<iframe name="st" src="http://luft.korzhevdp.com/iframe.php?' + out.join("") + '" width="600" height="600"></iframe>';
					$("#iframesrc").val(string);
				} else {
					$("#iframesrc").val(data);
				}
			},
			error: function (data,stat,err) {
				alert([data,stat,err].join("\n"));
			}
		});
	});

// #############################################
// navigator controls

function init_nav() {
	/* создётся карта на базе конфигурации, прописанной в секции ymaps.js */
	/* органы управления картой */
	map.controls.add(typeSelector);
	/* удаление "лишних" слоёв карты. typeSelector объявлен и заполнен в ymaps.js */
	typeSelector.removeMapType('yandex#publicMapHybrid');
	typeSelector.removeMapType('yandex#hybrid');
	typeSelector.removeMapType('yandex#publicMap');
	typeSelector.removeMapType('yandex#map');
	/* курсоры карты */
	cursor = map.cursors.push('crosshair', 'arrow');
	/* устанвливается курсор стрелка вместо дефолтной руки для точности позиционирования */
	cursor.setKey('arrow');
	/*
		настройки баллончика
		темплейт с условным появлением кнопки со ссылкой при заполнении соответствующего поля: properties.link
	*/
	genericBalloon = ymaps.templateLayoutFactory.createClass('<div class="ymaps_balloon luft-info"><h6>$[properties.description|без описания]</h6><center><a href="$[properties.link|#]"><img src="http://static-maps.yandex.ru/1.x/?l=map&z=14&size=270,220&$[properties.cnt]" alt="" style="margin:5px;"></a></center><br>[if properties.link]<a class="btn btn-info btn-small btn-block" href="$[properties.link|#]" target="_blank">Подробнее может быть здесь</a>[endif]</div>');
	ymaps.layout.storage.add('generic#balloonLayout', genericBalloon);

	/* Создание и установка параметров коллекций */
	// активные объекты - метки из навигатора
	a_objects = new ymaps.GeoObjectArray();
	a_objects.options.set({ balloonContentBodyLayout: 'generic#balloonLayout', balloonWidth: 300 });

	// коллекция фотографии.
	p_objects = new ymaps.GeoObjectArray();
	p_objects.options.set({ hasBalloon: 0, hasHint: 1, hintContent: "Фотография" });
	/* задаём особенности поведения */
	p_objects.events.add('click', function (e) {
		props = e.get('target').properties;
		/* не отрабатывать при щелчке по линии вектора */
		if (props.get('clickable') == 0) { return false; }
		e.stopPropagation();
		map.balloon.close();
		dir = props.get('dir');
		fn  = props.get('fname');
		lo  = props.get('uploadedby');
		de  = props.get('description');
		$("#picsOfLoc, #picOfLoc").empty();
		for (a in imgs[dir]) {
			data = imgs[dir][a];
			$("#picsOfLoc").append('<img src="' + config.url + 'upload/' + dir + "/32/" + fn + '" big="' + config.url + 'upload/' + dir + "/600/" + fn + '" postedby="' + data.load + '" comment="' + data.desc + '" alt="">');
		}
		$("#picOfLoc").append('<img src="'+ config.url + 'upload/' + dir + "/600/" + fn + '" style="border:0" alt="">');
		$("#picOfLoc img").css("display", 'none');
		$("#picOfLoc img").load(function () {
			if ($("#picOfLoc img").height() > 500) {
				$("#picOfLoc img").height($(window).height() - 280 + 'px');
			}
			$(this).fadeIn(400);
		});
		$("#author").html('<div class="pull-left" style="font-size:16px;margin-left:20px;">' + de + '</div>загружено: <u>' + lo + '</u>');
		$("#picsOfLoc img").unbind().click(function () {
			$("#mainPic").attr("src", $(this).attr("big"));
			$("#author").html('<div class="pull-left" style="font-size:16px;margin-left:20px;">' + $(this).attr("comment") + '</div>загружено: <u>' + $(this).attr("postedby") + '</u>');
		});
		$("#thisLoc").modal('show');
		return true;
	});

	// дополнительные объекты
	t_objects = new ymaps.GeoObjectArray();
	t_objects.options.set({ balloonContentBodyLayout: 'generic#balloonLayout', balloonWidth: 300 });
	/* добавление коллекций на карту */
	map.geoObjects.add(a_objects);
	map.geoObjects.add(p_objects);
	map.geoObjects.add(t_objects);

	/* события карты */
	// сохраняем в поле новое значение масштаба карты
	$("#zoomVal").html("<strong>M = " + map.getZoom() + "</strong>");
	map.events.add('actionend', function (action) {
		$("#zoomVal").html("<strong>M = " + map.getZoom() + "</strong>");
	});

	if (!config.demoMode) {
		/* щелчок правой кнопки мыши по карте. запуск основной машинерии */
		map.events.add('contextmenu', function (e) {
			coords = e.get('coordPosition');
			// запрос адреса к геокодеру
			ymaps.geocode(coords, { kind: ['house'] }).then(function (res) {
				var names = [];
				res.geoObjects.each(function (obj) {
					names.push(obj.properties.get('name'));
				});
				valtz = (names[0] != "undefined") ? [names[0]].join(', ') : "Нет адреса";
				// открытие баллончика
				map.balloon.open(coords, {
					content: '<small class="muted cHead"><img src="http://api.korzhevdp.com/images/marker.png" alt="координаты">&nbsp;&nbsp;'+
					[ coords[0].toPrecision(config.precision), coords[1].toPrecision(config.precision)].join(', ') +
					'&nbsp;&nbsp;&nbsp;&nbsp;<img src="http://api.korzhevdp.com/images/mail_box.png" alt="адрес">&nbsp;&nbsp;' + valtz + '</small>' +
					'<div class="cBody"><input id="coordPart" type="text" class="hide" value="' + [ coords[0].toPrecision(config.precision), coords[1].toPrecision(config.precision)].join(',') + '">' +
					'Описание: <textarea id="desc" rows="4" cols="10" placeholder="Здесь находится... (но не более 400 символов, пожалуйста)"></textarea>' +
					'<div id="photos">&nbsp;</div>' +
					'<div id="errors" class="alert alert-error hide">&nbsp;</div>' +
					'<button type="button" id="photoUp" class="btn btn-mini">Добавить фото</button><span id="picList"></span></div><hr>' +
					'<button class="btn btn-mini btn-info" id="linkGetter">Получить ссылку</button>' +
					'<button class="btn btn-mini btn-primary pull-right" id="leaveTicket" disabled="disabled">Загрузить на сервер</button>'
				}, {
					height: 360,
					minWidth: 540
				});
			});
		});

		/* смежное с предыдущим событие - после открытия баллончика инициализируется ряд процедур */
		map.events.add('balloonopen', function (e) {
			coords = e.get('balloon').getPosition();
			$("#photoUp").unbind().click(function () {
				var leng = $("#upcenter :file").length;
					f10r = '<input type="file" class="f10r" name="file' + leng + '" id="file' + leng + '">';
				$("#upcenter").append(f10r);
				$("#file" + leng).click();
				$(".f10r").unbind().change(function () {
					var uploadPics = [];
					$(".f10r").each(function () {
						uploadPics.push($(this).val());
					});
					$("#picList").html(uploadPics.join(", "));
					// разрешаем/запрещаем нажатие кнопки загрузки
					if (uploadPics.length) {
						$("#leaveTicket").removeAttr('disabled');
					} else {
						$("#leaveTicket").attr('disabled', 'disabled');
					}
				});
			});
			// обработка пришедших по итогам загрузки картинок данных. Считывается информация из iframe
			$("#superframe").load(function () {
				text = $(this).contents().text();
				$("#errors").removeClass("alert-error").addClass("alert-success").html(text).fadeIn(700, function () {
					$("#errors").delay(5000).fadeOut(700, function () {
						map.balloon.close();
					});
				});
			});
			// получение ссылки на место карты, где произведён правый щелчок
			$('#linkGetter').unbind().click(function () {
				// для всех спецсимволов в URL должна использоваться процентная нотация
				var coord = $("#coordPart").val().replace(/\,/, "%2C").replace(/\./, "%2E"),
					mType = cMapType,
					desc  = ( $("#desc").val().length ) ? $("#desc").val().replace(" ", "%20") : "Без%20описания";
				//alert(coord);
				$("#photos").html('<input type="text" value="' + 'http://luft.korzhevdp.com' + config.url + '%23' + [ coord , mType, desc ].join("%7C") + '">');
				//map.balloon.close();
				//$("#yourLink").modal("show");
			});
			// хитрый финт ушами для мультизагрузки файлов.
			form6 = '<form method="post" id="ff23" enctype="multipart/form-data" class="hide" style="display:none;" action="/upload.php" target="superframe">'+
				'<span id="upcenter"></span>' +
				'<input type="hidden" name="coord" id="coord" value="">' +
				'<input type="hidden" name="desc2" id="desc2" value="">' +
				'<input type="hidden" name="path" id="path" value="' + config.url + '">' +
				'</form>';
			$("#superframe").after(form6);
			// координаты загрубляются до длины используемой в системе хранения изображений. Фиксированно 6 разрядов, изменение параметра на уже работающей системе приведёт к неработоспособности!.
			$("#coord").val([coords[0].toFixed(6), coords[1].toFixed(6)].join(","));
			// кнопка загрузки на сервер.
			$("#leaveTicket").unbind().click(function () {
				$("#desc2").val($("#desc").val());
				$("#ff23").submit().remove();
			});
		});

		/*
			выставляемая вручную отметка на карте.
			добавление ручной отметки на карту по условиям из конфигурации
		*/
		if (config.ownMarkers) {
			m_objects = new ymaps.GeoObjectArray();
			m_objects.options.set({ hasBalloon: 0, hasHint: 1, hintContent: "Отметка", draggable: 1 });
			map.geoObjects.add(m_objects);
			m_objects.events.add('dblclick', function () {	// Двойной клик убирает отметку
				m_objects.removeAll();
			});

			map.events.add('click', function (e) {
				var coords = e.get('coordPosition'),
					geometry   = { type: "Point", coordinates: coords },
					properties = { description: "Отметка", hintContent: "Отметка", name: "Отметка" },
					options    = defaultStyle,
					object     = new ymaps.Placemark(geometry, properties, options);
				m_objects.removeAll().add(object);
			});
		}
	}

	/* отслеживание текущего типа карты. cMapType объявлен в ymaps.js */
	map.events.add('typechange', function (e) {
		cMapType = revLayerTypes[e.get('newType')];
	});
	//###################################
	/*
	наши прекрасные самописанные стили
	*/
	function styleAddToStorage(src) {
		for (a in src) {
			ymaps.option.presetStorage.add(a, src[a]);
		}
	}
	styleAddToStorage(userstyles);
	/*
	####################################
	работа с входящими данными:
	Парсер URL и выведение объекта (если была передана хитрая ссылка)
	тогда получаем хэш-часть URL (c "#" в начале строки)
	*/
	hash = window.location.hash;
	if (hash.length > 7) {
		var arr = hash.substr(1).split("|");					// удаляется "#", конверсия строки в массив
		if (arr.length == 3) {									// если количество переданных элементов верно
			// создаём типовой объект
			var geometry   = { type: "Point", coordinates: arr[0].split(",") },
				properties = { description: arr[2], hintContent: arr[2], name: arr[2], hasBalloon: 1 },
				options    = defaultStyle,
				object     = new ymaps.Placemark(geometry, properties, options);
			a_objects.add(object);								// добавляем объект в группу
			map.setCenter(arr[0].split(","));					// центровка карты по объекту
			map.setType(layerTypes[arr[1]].label);				// установка слоя карты
			$("#clearMap").removeClass("hide");					// показываем кнопку очистки карты
		} else {
			// ошибка "Недостаточно данных"
			alert("Ссылка некорректна. Объект не может быть отображён");
		}
	}

	//###################################
	/* установка отметок на карте из навигатора */
	function check_nav() {
		t_objects.removeAll();
		wlayer = 0;
		// когда-то использовались чекбоксы, поэтому |:checked|
		// При необходимости признак можно поменять. Например на наличие css-класса
		$(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag).each(function () {
			placeObject(this);
		});

		// если длина массива чекбоксов ненулевая, позиционируем карту на охват объектов
		//console.log(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag);
		//console.log($(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag).length);
		if ($(config.selectors.systemObjectsContainer + ' ' + config.selectors.systemActiveFlag).length) {
			//console.log('zooming')
			map.setBounds(t_objects.getBounds(), { zoomMargin: 100, duration: 300 });
			map.setType(config.layerTypes[wlayer].label);
		}

		function cycle_objects() {
			// обработчик экскурсии
			var objectType = t_objects.get(0).geometry.getType();
			//console.log("E is started");
			clearTimeout(bigCycle);
			//console.log("big cycle, demo stop:" + isDemoStopped);
			
			if (objectType == "Point" || objectType == "Circle") {
				map.setCenter(t_objects.get(0).geometry.getCoordinates(), 15);
			} else {
				map.setBounds(t_objects.get(0).geometry.getBounds());
			}

			$("#nextObject").unbind().click(function () {
				map.balloon.close();
				isDemoStopped = 0;
				centerOnObject();
				return false;
			});

			$("#prevObject").unbind().click(function () {
				map.balloon.close();
				isDemoStopped = 0;
				demoCounter = (demoCounter >= 2) ? (demoCounter-2) : 0;
				centerOnObject();
				return false;
			});

			function centerOnObject() {
				var openTimer,
					closeTimer;
				clearTimeout(lilCycle);
				if (isDemoStopped) {
					return false;
				}
				// алгоритм бескластерный
				//console.log("DC " + demoCounter);
				/*
				console.log( [config.showClusters, typeof clusters , clusters.toSource() ] );
				if (config.showClusters && typeof clusters != 'undefined') {
					console.log('cluster mod')
					console.log(cl4show.toSource())
				} else {
					*/
					//console.log('freehunt mod')
					len = t_objects.getLength();
					if (demoCounter < len) {
						object = t_objects.get(demoCounter);
						gt     = object.geometry.getType();
						switch (gt) {
						case "Point":
							distance = ymaps.coordSystem.geo.getDistance(map.getCenter(), object.geometry.getCoordinates());
							break;
						case "LineString":
							distance = ymaps.coordSystem.geo.getDistance(map.getCenter(), object.geometry.getCoordinates()[0]);
							break;
						case "Polygon":
							distance = ymaps.coordSystem.geo.getDistance(map.getCenter(), object.geometry.getCoordinates()[0][0]);
							break;
						case "Circle":
							distance = ymaps.coordSystem.geo.getDistance(map.getCenter(), object.geometry.getCenter());
							break;
						}
						//console.log(distance);
						if (gt == "Point") {
							if (distance < 2500) {
								map.setCenter(object.geometry.getCoordinates(), 16, { duration: 4000 } );
							} else {
								map.setCenter(object.geometry.getCoordinates(), 16, { duration: 0 } );
							}
						} else {
							if (distance < 2500) {
								map.setBounds(object.geometry.getBounds(), { duration: 4000, zoomMargin: 200 });
							} else {
								map.setBounds(object.geometry.getBounds(), { duration: 0, zoomMargin: 200 });
							}
						}
						function openB() {
							clearInterval(openTimer);
							object.balloon.open();
							function closeB() {
								clearInterval(closeTimer);
								map.balloon.close();
								return false;
							}
							closeTimer = setTimeout(closeB, 26000);
							return false;
						}
						openTimer = setTimeout(openB, 6000);
						demoCounter++;
					} else {
						demoCounter = 0;
					}
				/*}*/
				//алгоритм кластеров
				lilCycle = setTimeout(centerOnObject, 30000);
			}

			centerOnObject();
			if (isDemoStopped) {
				clearTimeout(bigCycle);
				return false;
			}
		}

		// режим автопрезентации...
		if (config.demoMode) {
			$("#exstart").addClass('hide');
			//map.geoObjects.remove(t_objects);
			$(config.selectors.systemNavigatorClass).addClass("hide");
			map.geoObjects.add(t_objects);
			map.setBounds(t_objects.getBounds(), { duration: 3000 } );
			setTimeout(cycle_objects, 5000);
		}

		$("#exstart").parent().parent().unbind().click(function () {
			if ($("#exstart").hasClass('hide')) {
				//console.log("stop")
				isDemoStopped = 1;
				$("#exstop, #prevObject, #nextObject").addClass('hide');
				$("#exstart").removeClass('hide');
				return false;
			}
			if ($("#exstop").hasClass('hide')) {
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

	function placeObject(item) {
		var packet = parseInt($(item).attr("packet")),
			ref    = parseInt($(item).attr("ref")),
			data   = sights[packet].content[ref],
			htext  = data.d;
		switch(data.ct) {
			case 1 :
				cds = new ymaps.geometry.Point(data.c);
			break;
			case 2 :
				cds = new ymaps.geometry.LineString.fromEncodedCoordinates(data.c);
			break;
			case 3 :
				cds = new ymaps.geometry.Polygon.fromEncodedCoordinates(data.c);
			break;
			case 4 :
				cds = new ymaps.geometry.Circle([parseFloat(data.c[0]), parseFloat(data.c[1])], parseInt(data.c[2]));
			break;
		}
		var geometry   = cds,
			properties = { description: htext, hintContent: htext, name: htext, link: data.ln },
			options    = (data.st.length > 3) ? ymaps.option.presetStorage.get(data.st) : defaultStyle,
			object     = new ymaps.Placemark(geometry, properties, options);
		// помещается в контейнер вспомогательных объектов
		gt     = object.geometry.getType();
		if (gt == "Point") {
			object.properties.set( { cnt: 'pt=' + object.geometry.getCoordinates().join(",") + ",flag" } );
		} else {
			if (gt == "LineString") {
				object.properties.set( { cnt: 'pl=c:ec473f99,f:00FF0033,w:3,' + ymaps.geometry.LineString.toEncodedCoordinates(object.geometry) } );
			}
			if (gt == "Polygon") {
				object.properties.set( { cnt: 'pl=c:ec473f99,f:00FF0033,w:3,' + ymaps.geometry.Polygon.toEncodedCoordinates(object.geometry) } );
			}
			if (gt == "Circle") {
				object.properties.set( { cnt: 'pt=' + object.geometry.getCenter() + ",flag" } );
			}
		}
		t_objects.add(object);
		wlayer = data.l;
	}

	//mark clusters
	function mark_clusters() {
		//console.log($(config.selectors.systemObjectClass + ", " + config.selectors.systemGroupClass).length);

		if (labelmode) {
			//console.log("off")
			$(config.selectors.systemObjectClass + ", " + config.selectors.systemGroupClass).prop("checked", false);
		} else {
			//console.log("on")
			$(config.selectors.systemObjectClass + ", " + config.selectors.systemGroupClass).removeClass(activeness);
		}

		//console.log(config.selectors.systemClusterClass + config.selectors.systemActiveFlag)
		len = $(config.selectors.systemClusterClass +  config.selectors.systemActiveFlag).length;
		//console.log($(config.selectors.systemClusterClass + config.selectors.systemActiveFlag).length)

		if (!len && config.showObjectsOS) {
			//console.log("mk clust11");
			if (labelmode) {
				$(config.selectors.systemObjectClass).prop("checked", true);
			} else {
				$(config.selectors.systemObjectClass).addClass(activeness);
			}
		} else {
			//console.log("mk clust22");
			$(config.selectors.systemClusterClass + config.selectors.systemActiveFlag).each(function () {
				ref = parseInt($(this).attr("ref"));
				for (a in clusters[ref].content) {
					//console.log("#" + config.selectors.systemObjectIdPrefix + clusters[ref].content[a])
					if (labelmode) {
						$("#" + config.selectors.systemObjectIdPrefix + clusters[ref].content[a]).prop("checked", true);
					} else {
						$("#" + config.selectors.systemObjectIdPrefix + clusters[ref].content[a]).addClass(activeness);
					}
				}
			});
		}

		check_nav();
		//map.setZoom(14);
	}

	/* установка отметок в навигаторе на основе выбранных групп. И последующее отображение самих объектов */
	function mark_gr() {
		//console.log("mk group");
		if (labelmode) {
			//console.log("off 1");
			$(config.selectors.systemObjectClass + ", " + config.selectors.systemClusterClass).prop("checked", false);
		} else {
			//console.log("off 2");
			$(config.selectors.systemObjectClass + ", " + config.selectors.systemClusterClass).removeClass(activeness);
		}

		len = $(config.selectors.systemGroupClass + config.selectors.systemActiveFlag).length;
		//console.log(config.selectors.systemClusterClass + config.selectors.systemActiveFlag)
		//console.log(len);
		if (!len && config.showObjectsOS) {
			//console.log("no longer");
			if (labelmode) {
				$(config.selectors.systemObjectClass).prop("checked", true);
			} else {
				$(config.selectors.systemObjectClass).addClass(activeness);
			}
		} else {
			//console.log("make that");
			$(config.selectors.systemGroupClass).each(function () {
				state = (labelmode) ? $(this).prop("checked") : $(this).hasClass(activeness);
				group = $(this).attr("gid");
				if (state) {
					$(config.selectors.systemObjectClass + "[gid=" + group + " ]").each(function () {
						(labelmode) ? $(this).prop("checked", state) : $(this).addClass(activeness);
					});
				}
			});
		}

		t_objects.removeAll();
		/* показываеются отмеченные объекты */
		check_nav();
	}

	/* включение отображения атласа карт */
	if (config.hasAtlas) {
		$("#hasAtlas").removeClass("hide");
	}

	if (config.noExcursion) {
		config.demoMode = 0;
		$(".excursion").addClass("hide");
	} else {
		$(".excursionToggle").removeClass("hide");
	}

	/* включение отображения альтернативной смотрелки */
	if (config.hasMulti) {
		$("#hasMulti").removeClass("hide");
	}

	// из конфигурации - показывать ли фотографии сразу
	if (config.photosOnStart == 1) {
		$(".sphotos").first().click();
	}
	/*
	получение данных для интерактивного справочника объектов карты. С некоторых пор - универсальное хранилище
	config.url "прозрачно" берётся ymaps.js.
	*/
	$.ajax({
		type: "POST",
		url: "http://luft.korzhevdp.com/getsights.php",
		dataType: 'script',
		data: {
			dir : config.url
		},
		success: function (data) {
			//eval(data);
			// заполнение списка групп объектов
			if (typeof groups != 'undefined') {
				sc = config.selectors.systemGroupClass.replace(/^(\.|:)/, '');
				for(a in groups) {
					if (labelmode) {
						navitem = '<label for="' + config.selectors.systemGroupIdPrefix + a + '"><input type="checkbox" class="' + sc + '" id="' + config.selectors.systemGroupIdPrefix + a + '" gid="' + a + '">' + groups[a].g + '</label>';
					} else {
						navitem = '<span class="' + sc + '" id="' + config.selectors.systemGroupIdPrefix + a + '" gid="' + a + '">' + groups[a].g + '</span>';
					}
					// в навигатор
					$(config.selectors.systemGroupsContainer).append(navitem);
				}
			}

			// заполнение списка кластеров
			if (typeof clusters != 'undefined') {
				sc = config.selectors.systemClusterClass.replace(/^(\.|:)/, '');
				for(a in clusters) {
					if (labelmode) {
						navitem = '<label for="' + config.selectors.systemClusterIdPrefix + a + '"><input type="checkbox" class="' + sc + '" ref="' + a + '" id="' + config.selectors.systemClusterIdPrefix + a + '">' + clusters[a].label + '</label>';
					} else {
						navitem = '<span class="' + sc + '" ref="' + a + '" id="' + config.selectors.systemClusterIdPrefix + a + '">' + clusters[a].label + '</span>';
					}
					// в навигатор
					$(config.selectors.systemClustersContainer).append(navitem);
				}
				for (a in clusters) {
					cl4show.concat(clusters[a].content);
				};
			}

			// заполнение списков объектов
			if (typeof sights != 'undefined') {
				sc = config.selectors.systemObjectClass.replace(/^(\.|:)/, '');
				if (config.objectSearch) {
					$(config.selectors.systemObjectsContainer).append('<input type="text" id="ofilter" placeholder="Отобрать объекты" style="height:20px;width:190px;font-size:10px;padding:2px"><i class="icon-filter" style="margin-top:-4px;margin-left:5px;"></i>');
				}

				for (a in sights) {
					// в навигатор. Список групп.
					$(config.selectors.systemObjectsContainer).append('<strong>' + sights[a].label + '</strong><br>');
					label = sights[a].label;
					proxy = sights[a].content;
					//i = 0;
					for ( b in proxy ) {
						// фильтр пустых полей
						if (!proxy[b].a) {
							continue;
						}
						// в таблицу примечательных мест
						$("#sList").append('<tr><td>' + proxy[b].d + '</td><td><a href="#" class="btn btn-mini btn-inverse sightsV" packet="' + a + '" ref="' + b + '">Показать</a></td></tr>');
						// в навигатор
						//alert(1)
						if (labelmode) {
							navitem = '<label for="' + config.selectors.systemObjectIdPrefix + b + '"><input type="checkbox" class="' + sc + '" id="' + config.selectors.systemObjectIdPrefix + b + '" ref="' + b + '" packet="' + a + '" gid="' + proxy[b].g + '">' + proxy[b].d + '</label>';
						} else {
							navitem = '<span class="' + sc + '" id="' + config.selectors.systemObjectIdPrefix + b + '" ref="' + b + '" packet="' + a + '" gid="' + proxy[b].g + '">' + proxy[b].d + '</span>';
						}
						$(config.selectors.systemObjectsContainer).append(navitem + "\n");
						//i++;
					}
				}
				$("#marksRemove").click(function () {
					if (labelmode) {
						$(config.selectors.systemObjectClass).prop("checked", false);
					} else {
						$(config.selectors.systemObjectClass).removeClass(systemActiveFlag);
					}
					check_nav();
				});
			}

			if (!config.showClusters) {
				$(config.selectors.systemClustersContainer).addClass("hide");
			}

			if (!config.showGroups) {
				$(config.selectors.systemGroupsContainer).addClass("hide");
			}

			if (!config.showObjects) {
				$(config.selectors.systemObjectsContainer).addClass("hide");
			}

			// назначение обработки щелчка по кнопке списка примечательных мест
			$(".sightsV").unbind().click(function () {
				var geometry     = { type: "Point", coordinates: config.mcenter },	// умолчательная геометрия
					ref          = $(this).attr("ref"),								// индекс объекта
					packet       = $(this).attr("packet"),							// индекс пакета - тематического раздела справочника объектов
					data         = sights[packet].content[ref],						// прокси-объект извлекаемый из справочника объектов
					properties   = { description: data.d, hintContent: data.d, name: data.d, link: data.ln },			// умолчательный набор свойств
					options      = (data.st.length > 3) ? ymaps.option.presetStorage.get(data.st) : defaultStyle;		// установка стиля
				switch(parseInt(data.ct)) {											// формирование объектов карты в зависимости от типа геометрии
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

			// инициализация навигатора: первичное отображение, простановка отметок, инициализация обработки кластеров.
			// если кто-то щёлкнул по навигатору:
			$( config.selectors.systemObjectsContainer + "> *").unbind().click(function () {
				//console.log("obj click")
				if (!labelmode) {
					($(this).hasClass(activeness))
						? $(this).removeClass(activeness)
						: $(this).addClass(activeness);
				}
				check_nav();
			});
			// обработка щелчка по кластеру
			$( config.selectors.systemClustersContainer + "> *").unbind().click(function () {
				//console.log("clust click")
				if (!labelmode) {
					($(this).hasClass(activeness))
						? $(this).removeClass(activeness)
						: $(this).addClass(activeness);
				}
				mark_clusters();
			});
			$(config.selectors.systemGroupClass).unbind().click(function () {
				//console.log("group click")
				if (!labelmode) {
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

			if ( typeof config.showClustersOS != 'undefined' && config.showClustersOS == 1 ) {
				(labelmode)
					? $(config.selectors.systemClusterClass).prop("checked", true)
					: $(config.selectors.systemClusterClass).addClass(activeness);
				mark_clusters();
			}
			if ( typeof config.showGroupsOS != 'undefined' && config.showGroupsOS == 1 ) {
				(labelmode)
					? $(config.selectors.systemGroupClass).prop("checked", true)
					: $(config.selectors.systemGroupClass).addClass(activeness);
			}
			if ( typeof config.showObjectsOS != 'undefined' && config.showObjectsOS == 1 ) {
				(labelmode)
					? $(config.selectors.systemObjectClass).prop("checked", true)
					: $(config.selectors.systemObjectClass).addClass(activeness);
				check_nav();
			}
			if (config.objectSearch) {
				$("#ofilter").empty().unbind().keyup(function () {
					str = $(this).val();
					//console.log(str);
					if (labelmode) {
						$(config.selectors.systemObjectClass).each(function () {
							if ($(this).parent().html().indexOf(str) == -1) {
								$(this).parent().addClass("hide");
								$(this).prop("checked", false);
							} else {
								$(this).parent().removeClass("hide");
								//$(this).prop("checked", false);
							}
						});
					} else {
						$(config.selectors.systemObjectClass).each(function () {
							if ($(this).parent().html().indexOf(str) == -1) {
								$(this).addClass("hide").removeClass(activeness);
							} else {
								$(this).removeClass("hide");
								//$(this).addClass(activeness);
							}
						});
					}
					check_nav();
				});
			}
			if (config.hasNav && !config.demoMode) {
				map.geoObjects.add(t_objects);
				$(config.selectors.systemNavigatorClass).removeClass("hide");
			} else {
				$(config.selectors.systemNavigatorClass).addClass("hide");
			}
		},
		error: function (data,stat,err) {
			alert([data,stat,err].join("\n"));
		}
	});
}

function get_user() {
	$.ajax({
		type: "POST",
		url: "http://luft.korzhevdp.com/getuserdata.php",
		dataType: 'script',
		success: function (data) {
			data = eval(data);
			$("#userP").attr('title', data[2]);
			$("#userP a").html(data[0] + '&nbsp;&nbsp;' + data[1]);
			if (data[0] == "Гость") {
				$(".logIn").removeClass("hide");
				$(".logOut").addClass("hide");
			} else {
				$(".logOut").removeClass("hide");
				$(".logIn").addClass("hide");
			}
		},
		error: function (data,stat,err) {
			alert([data,stat,err].join("\n"));
		}
	});
}

/*
####################################
работа с сессией
####################################
получение локализованных данных пользователя с сервера. обязательное действие при загрузке страницы.
получает: data = ['Имя авторизации пользователя', 'URL аватара', 'описание уровня прав']
*/
get_user();
//######################################################
$("#objNavigator").height($(window).height() - 340 + 'px');
$("#YMapsID").height($(window).height() - 48 + 'px');
$("#YMapsID").width($(window).width() - 1 + 'px');