function location_add(){
	cancel();
	if(typeof(map) != 'undefined') { map.destroy(); }
	$("#loc_add_pane").fadeIn(500, function(){
		$.ajax({
			url: 'ajaxrent/getusercenter',
			dataType: 'text',
			success: function(data) {
				$("#a12").val(data);
				map = new ymaps.Map("YMapsID", {
					center: data.split(','),
					zoom: 10,
					type: "yandex#map"
				});
				map.controls.add('zoomControl').add('typeSelector');
				var count = 0;
				map.events.add("click", function(e) {
					var properties = {
						balloonContent: 'Объект',
						hintContent: "Можно перетащить",
						iconContent: $("#lap_ty option:selected").html()
					},
					options = {
						preset: 'twirl#blueStretchyIcon',
						draggable: 1,
						hasBalloon: 0
					},
					placemark = new ymaps.Placemark(e.get("coordPosition"), properties, options);
					if(!count){
						map.geoObjects.add(placemark);
						document.getElementById('lap_coord').value = e.get("coordPosition");
						$("#label1").css("display",'none');
						$("#label2").css("display",'block');
						count++;
					}
					placemark.events.add("dragend", function() {
						document.getElementById('lap_coord').value = placemark.geometry.getCoordinates();
						placemark.properties.set({iconContent: $("#lap_ty option:selected").html()});
					});
					$("#lap_ty").change(function(){
						placemark.properties.set({iconContent: $("#lap_ty option:selected").html()});
					});
				});
				map.events.add("dblclick", function() {
					map.destroy();
				});
			},
			error: function(){
				console_alert("Запросить центр карты не удалось. Попробуйте ещё раз или повторите позднее");
			}
		});
	});
}

function cancel(){
	$(".mg-input-form").fadeOut(50,function(){});
}

function loc_activate(hash) {
	cancel();
	$.ajax({
		url: 'ajaxrent/location_active_sw/' + hash,
		success: function(data) {
			if(data == '1'){
				$("#loc" + hash).removeClass("btn-inverse");
				$("#locact" + hash).html('<a href="#"><i class="icon-ban-circle"></i>&nbsp;Деактивировать предложение</a>');
			}else{
				$("#loc" + hash).addClass("btn-inverse");
				$("#locact" + hash).html('<a href="#"><i class="icon-ban-circle"></i>&nbsp;Активировать предложение</a>');
			}
		}
	});
}

function set_usercenter(){
	coords = $("#a12").val().split(",");
	$.ajax({
		url: 'ajaxrent/setusercenter/' + encodeURIComponent(coords[0]) + '/' + encodeURIComponent(coords[1]),
		success: function(data) {
			if(data == '0'){
			}
		}
	});
}
/*
function get_usercenter(){
	$.ajax({
		url: 'ajaxrent/getusercenter',
		dataType: 'text',
		success: function(data) {
			$("#a12").val(data);
				var map = new ymaps.Map("YMapsID", {
				center: data.split(','),
				zoom: 10,
				type: "yandex#map"

			});
			map.controls.add('zoomControl').add('typeSelector');
			var count = 0;
			map.events.add("click", function(e) {
				var properties = {
					balloonContent: 'Объект',
					hintContent: "Можно перетащить",
					iconContent: document.getElementById("room_class").options[document.getElementById("room_class").selectedIndex].text
				},
				options = {
					balloonCloseButton: true,
					preset: 'twirl#blueStretchyIcon',
					draggable: 1
				},
				placemark = new ymaps.Placemark(e.get("coordPosition"), properties, options);
				if(!count){
					map.geoObjects.add(placemark);
					document.getElementById('a11').value = e.get("coordPosition");
					count++;
				}
				placemark.events.add("dragend", function() {
					document.getElementById('a11').value = placemark.geometry.getCoordinates();
					placemark.properties.set({iconContent: document.getElementById("room_class").options[document.getElementById("room_class").selectedIndex].text});
				});
				map.events.add("mouseenter", function() {
					placemark.properties.set({iconContent: document.getElementById("room_class").options[document.getElementById("room_class").selectedIndex].text});
				});
			});
			map.events.add("dblclick", function() {
				map.destroy();
			});
		},
		error: function(){
			console_alert("Запросить центр карты не удалось. Попробуйте ещё раз или повторите позднее");
		}
	});
}
*/
function location_edit(hash){
	cancel();
	if(typeof(map3) != 'undefined') { map3.destroy();}
	$.ajax({
		url: 'ajaxrent/getlocdata/' + hash + '/',
		dataType: 'json',
		success: function(data) {
			$.ajax({
				url: 'ajaxrent/getproperties/' + hash + '/',
				dataType: 'html',
				success: function(data) {
					$("#lep_tab2").html(data);
				},
				error: function(data,stat,err){
					console_alert("Не удалось запросить данные с сервера. Попробуйте повторить позже");
					console_alert(stat);
					console_alert(err);
				}
			});

			$("#lep_ad").val(data.address);
			$("#lep_coord").val(data.coord);
			$("#lep_ad").attr('hash',hash);
			$("#lep_ty option[value='" + data.type + "']").attr('selected','selected');
			$("#loc_edit_pane").fadeIn(500, function(){
				map3 = new ymaps.Map("YMapsID3", {
					center: [0,0],
					zoom: 10,
					type: "yandex#map"

				});
				map3.setCenter([data.coord.split(',')[0],data.coord.split(',')[1]]);
				map3.controls.add('zoomControl').add('typeSelector');
				var points = new ymaps.GeoObjectArray();
				points.removeAll();
				var properties = {
					balloonContent: 'Объект',
					hintContent: "Можно перетащить",
					iconContent: $("#lep_ty option:selected").html()
				},
				options = {
					preset: 'twirl#blueStretchyIcon',
					draggable: 1,
					hasBalloon: 0
				},
				placemark = new ymaps.Placemark([data.coord.split(',')[0],data.coord.split(',')[1]], properties, options);
				placemark.events.add("dragend", function() {
					$('#lep_coord').val(placemark.geometry.getCoordinates());
				});
				$("#lep_ty").change(function(){
					placemark.properties.set({iconContent: $("#lep_ty option:selected").html()});
				});
				points.add(placemark);
				map3.geoObjects.add(points);
			});
		},
		error: function(data,stat,err){
			console_alert("Не удалось запросить данные с сервера. Попробуйте повторить позже");
			console_alert(stat);
			console_alert(err);
		}
	});
}

function location_save(hash){
	var addr, hash, coord, type, block;
	addr = $("#lep_ad").val();
	if(!addr.length){
		$("#le2").addClass("label-important");
		$('#e2').addClass('error');
		return false;
	}
	hash = $("#lep_ad").attr('hash');
	coord = ($("#lep_coord").val().length > 3) ? $("#lep_coord").val().split(',').join("/") : "0/0";
	type = $("#lep_ty").val();
	block = [hash, type, coord, addr].join("/");
	console_alert(block);
	$.ajax({
		url: 'ajaxrent/savelocation/' + block,
		success: function() {
			get_list()
		},
		error: function(data,stat,err){
			console_alert("Ошибка при сохранении свойств. Попробуйте ещё раз или повторите позднее");
			console_alert(stat);
			console_alert(err);
		}
	});
}

function lpr_save(){
	var str = [],
		hash = $("#lep_ad").attr('hash'),
		mode = $("#lep_mod").val(),
		enc = [$("#lep_ty").val(), $("#lep_coord").val(), encodeURIComponent($("#lep_ad").val())].join("/");
	$('#lep_tab2 :checkbox:checked').each(function(){
		str.push($(this).attr('prp'));
	});
	saveurl = (mode == '2') 
		? 'ajaxrent/savelpr/' + hash + '/' + str.join("-") 
		: 'ajaxrent/savelprn/' + hash + '/' + enc ;
	$.ajax({
		url: saveurl,
		success: function() {
			get_list();
			console_alert("Сохранено успешно");
		},
		error: function(data,stat,err){
			console_alert(err);
		}
	});
}


function location_insert(){
	var addr, coord, type, block;
	type = $("#lap_ty").val();
	addr = $("#lap_ad").val();
	if(!addr.length){
		$("#le2").addClass("label-important");
		$('#e2').addClass('error');
		return false;
	}
	coord = $("#lap_coord").val().split(',').join("/");
	block = [type, coord, addr].join("/");
	$.ajax({
		url: 'ajaxrent/newlocation/' + block,
		success: function() {
			get_list();
		},
		error: function(data,stat,err){
			console_alert("Ошибка при сохранении свойств. Попробуйте ещё раз или повторите позднее");
			console_alert(stat);
			console_alert(err);
		}
	});
}


function console_alert(text){
	$("#console").html(text);
}

function map_center_edit(){
	cancel();
	if(typeof(map2) != 'undefined') { map2.destroy();}
	$("#map_center_pane").fadeIn(500,function(){
		$.ajax({
			url: 'ajaxrent/getusercenter',
			dataType: 'text',
			success: function(data) {
				$("#a12").val(data);
				map2 = new ymaps.Map("YMapsID2", {
					center: data.split(','),
					zoom: 10,
					type: "yandex#map"
				});
				map2.controls.add('zoomControl').add('typeSelector');
				map2.events.add("boundschange", function() {
					$("#a12").val(map2.getCenter());
				});
			},
			error: function(){
				console_alert("Запросить центр карты не удалось. Попробуйте ещё раз или повторите позднее");
			}
		});
	});
}

function profile_edit(){
	cancel();
	$("#profile_edit").fadeIn(500, function(){
		$.ajax({
			url: 'ajaxrent/getprofiledata',
			dataType: 'json',
			success: function(data) {
				console_alert([data.a1,data.a2,data.a3].join(" "));
				$("#p1").val(data.a1);
				$("#p2").val(data.a2);
				$("#p3").val(data.a3);
				$("#p4").val(data.a4);
				$("#p5").val(data.a5);
				$("#p6").val(data.a6);
				$("#p7").val(data.a7);
				$("#p8").val(data.a8);
				$("#p9").val(data.a9);
				$("#u1").val(data.b1);
				error_count = 0;
				$('#profile_edit .traceable').each(function(){
					var prefix = $(this).attr('id').charAt(0);
						max = $(this).attr('maxlength'),
						pref = $(this).attr('pref_length'),
						reg = $(this).attr('valid')
						id = $(this).attr('prp'),
						length = $('#' + prefix + id).val().length,
						val = validate(reg, $('#' + prefix + id).val());
						//console_alert(length + "+" + val);
					if(!length || !val) {
						$('#' + prefix + 'l' + id).removeClass('success').removeClass('warning').addClass('error');
						$('#' + prefix + 'e' + id).removeClass('label-success').removeClass('label-warning').addClass('label-important');
						error_count++;
					}else{
						if($('#'  + prefix + id).val().length < pref){
						$('#' + prefix + 'l' + id).removeClass('error').removeClass('success').addClass('warning');
						$('#' + prefix + 'e' + id).removeClass('label-important').removeClass('label-success').addClass('label-warning');
						}else{
							$('#' + prefix + 'l' + id).removeClass('error').removeClass('warning').addClass('success');
							$('#'  + prefix + 'e' + id).removeClass('label-important').removeClass('label-warning').addClass('label-success');
						}
					}
				});
				console_alert(error_count);
			},
			error: function(data,stat,err){
				console_alert("Запросить данные профиля не удалось. " + stat + ' ' + err);
			}
		});
	});
}

function save_agent(){
	console_alert("run for saving");
	nm = ["1_" + encodeURIComponent($("#p1").val()),
		"2_" + encodeURIComponent($("#p2").val()),
		"3_" + encodeURIComponent($("#p3").val()),
		"4_" + encodeURIComponent($("#p4").val()),
		"5_" + encodeURIComponent($("#p5").val()),
		"6_" + encodeURIComponent($("#p6").val()),
		"7_" + encodeURIComponent($("#p7").val()),
		"8_" + encodeURIComponent($("#p8").val()),
		"9_" + encodeURIComponent($("#p9").val())];
	$.ajax({
		url: 'ajaxrent/setprofiledata/' + nm.join("/"),
		dataType: 'html',
		success: function(data) {
			console_alert(data);
		},
		error: function(data,stat,err){
			console_alert("Сохранить данные агента не удалось. Попробуйте ещё раз или повторите позднее" + err);
		}
	});
}

function get_list(){
	$.ajax({
		url: 'ajaxrent/list_build',
		dataType: 'html',
		success: function(data) {
			$("#loclist").html(data);
		},
		error: function(data,stat,err){
			console_alert("Запросить центр карты не удалось. Попробуйте ещё раз или повторите позднее" + err);
		}
	});
}

function price_edit(hash){
	cancel();
	$("#price_edit").fadeIn(500, function(){
		$.ajax({
			url: 'ajaxrent/getprices/' + hash,
			dataType: 'json',
			success: function(data) {
				$("#d1").val(data.p1);
				$("#d2").val(data.p2);
				$("#d3").val(data.p4);
				$("#d5").val(data.p5);
				$("#dm").val(data.pm);
				$("#hash").val(hash);
				$('#price_edit .traceable').each(function(){
					var id = $(this).attr('prp');
					var prefix = $(this).attr('id').charAt(0);
					var max = $(this).attr('maxlength'),
						pref = $(this).attr('pref_length'),
						reg = $(this).attr('valid'),
						length = $('#' + prefix + id).val().length,
						val = validate(reg, $('#' + prefix + id).val());
					if(!length || !val) {
						$('#' + prefix + 'l' + id).removeClass('success').removeClass('warning').addClass('error');
						$('#' + prefix + 'e' + id).removeClass('label-success').removeClass('label-warning').addClass('label-important');
					}else{
						if($('#'  + prefix + id).val().length < pref){
						$('#' + prefix + 'l' + id).removeClass('error').removeClass('success').addClass('warning');
						$('#' + prefix + 'e' + id).removeClass('label-important').removeClass('label-success').addClass('label-warning');
						}else{
							$('#' + prefix + 'l' + id).removeClass('error').removeClass('warning').addClass('success');
							$('#'  + prefix + 'e' + id).removeClass('label-important').removeClass('label-warning').addClass('label-success');
						}
					}
				});
			},
			error: function(data,stat,err){
				console_alert("Запросить Цены на локацию не удалось. Попробуйте ещё раз или повторите позднее.<br>" + err);
			}
		});
	});
}

function price_save(hash){
	var prices = [
		($("#d1").val()) ? $("#d1").val() : 0,
		($("#d2").val()) ? $("#d2").val() : 0,
		($("#d3").val()) ? $("#d3").val() : 0,
		($("#d5").val()) ? $("#d5").val() : 0,
		($("#dm").val()) ? $("#dm").val() : 0,
		$("#hash").val()
	];
	$.ajax({
		url: 'ajaxrent/setprices/' + prices.join("/"),
		dataType: 'text',
		success: function(data) {
			console_alert(data);
		},
		error: function(data,stat,err){
			console_alert("Сохранить цены на локацию не удалось. Попробуйте ещё раз или повторите позднее.<br>" + err);
		}
	});
}

function rent_edit(hash){
	cancel();
	//$('#rent_tab1').css('display','block');
	$("#rent_edit").fadeIn(500, function(){

	});
}

/// on-page mechanics section

$('#lap_ad').keyup(function(){
	///console_alert($('#lap_ad').val().length);
	if(!$('#lap_ad').val().length) {
		$('#e2').addClass('error');
		$('#le2').removeClass('label-success').addClass('label-important');
	}else{
		$('#e2').removeClass('error');
		$('#le2').removeClass('label-important').addClass('label-success');
	}
});

$('#lep_ad').keyup(function(){
	///console_alert($('#lap_ad').val().length);
	if(!$('#lep_ad').val().length) {
		$('#e3').addClass('error');
		$('#le3').removeClass('label-success').addClass('label-important');
	}else{
		$('#e3').removeClass('error');
		$('#le3').removeClass('label-important').addClass('label-success');
	}
});

$('.traceable').keyup(function(){
	var max = $(this).attr('maxlength'),
		prefix = $(this).attr('id').charAt(0);
		pref = $(this).attr('pref_length'),
		reg = $(this).attr('valid')
		id = $(this).attr('prp'),
		length = $('#' + prefix + id).val().length,
		val = validate(reg, $('#' + prefix + id).val());
		//console_alert(length + "+" + val);
	if(!length || !val) {
		$('#' + prefix + 'l' + id).removeClass('success').removeClass('warning').addClass('error');
		$('#' + prefix + 'e' + id).removeClass('label-success').removeClass('label-warning').addClass('label-important');
	}else{
		if($('#' + prefix + id).val().length < pref){
			$('#' + prefix + 'l' + id).removeClass('error').removeClass('success').addClass('warning');
			$('#' + prefix + 'e' + id).removeClass('label-important').removeClass('label-success').addClass('label-warning');
		}else{
			$('#' + prefix + 'l' + id).removeClass('error').removeClass('warning').addClass('success');
			$('#' + prefix + 'e' + id).removeClass('label-important').removeClass('label-warning').addClass('label-success');
		}
	}
});

$('.traceable2').change(function(){
	var max = $(this).attr('maxlength'),
		prefix = $(this).attr('id').charAt(0);
		pref = $(this).attr('pref_length'),
		reg = $(this).attr('valid')
		id = $(this).attr('prp'),
		length = $('#' + prefix + id).val().length,
		val = validate(reg, $('#' + prefix + id).val());
		//console_alert(length + "+" + val);
	if(!length || !val) {
		$('#' + prefix + 'l' + id).removeClass('success').removeClass('warning').addClass('error');
		$('#' + prefix + 'e' + id).removeClass('label-success').removeClass('label-warning').addClass('label-important');
	}else{
		if($('#' + prefix + id).val().length < pref){
		$('#' + prefix + 'l' + id).removeClass('error').removeClass('success').addClass('warning');
		$('#' + prefix + 'e' + id).removeClass('label-important').removeClass('label-success').addClass('label-warning');
		}else{
			$('#' + prefix + 'l' + id).removeClass('error').removeClass('warning').addClass('success');
			$('#' + prefix + 'e' + id).removeClass('label-important').removeClass('label-warning').addClass('label-success');
		}
	}
});

$("#lep_sw1").click(function(){
	$("#lep_mod").val('1');
//	alert($("#lep_mod").val())
});

$("#lep_sw2").click(function(){
	$("#lep_mod").val('2');
//	alert($("#lep_mod").val())
});

function validate(dt, val){
	var types = [];
	types['email']		= '[^a-z\\.\\-0-9_]';
	types['text']		= '[^a-z \\-"]';
	types['entext']		= '[^0-9a-z \-"]';
	types['rtext']		= '[^а-яёЁ\\-\\.\\, ]';
	types['rword']		= '[^а-яёЁ ]';
	types['nonzero']	= '^[0]$';
	types['date']		= '[^0-9\\.]';
	types['weight']		= '[^0-9 xхсмткг\\.]';
	types['num']		= '[^0-9\\- ]';
	types['mtext']		= '[^0-9 a-zа-яёЁ\\.\\,\\-"]';
	types['reqnum']		= '[^0-9 \/\\бн\-]';
	//if (dt == 'email'){r = '^.+@[^\.].*\.[a-z]{2,}$';}

	console_alert(types[dt]);
	var rgEx = new RegExp(types[dt],'i');
	var OK = rgEx.exec(val);
	if(OK){
		return 0;
	}else{
		return 1;
	}
}
//календарик

jQuery(function($){
	$.datepicker.regional['ru'] = {
		closeText: 'Закрыть',
		prevText: '&#x3c;Пред',
		nextText: 'След&#x3e;',
		currentText: 'Сегодня',
		monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
		'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
		monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
		'Июл','Авг','Сен','Окт','Ноя','Дек'],
		dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
		dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
		dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
		weekHeader: 'Не',
		dateFormat: 'dd.mm.yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};
	$.datepicker.setDefaults($.datepicker.regional['ru']);
});
$("#b1").datepicker();
$("#b2").datepicker();

