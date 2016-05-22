/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, imgs */
/*
функции для работы редактора картинок
требуют подключения JQuery
*/
function rotateImg(id, mode){
	$.ajax({
		url: '/dop/dop_image_rotate/photoeditor/' + $("#pic_name").val() + '/cw',
		type: 'POST',
		data: {
			id   : 0,
			mode : 'cw' // cw|ccw
		},
		dataType: 'text',
		success: function(data) {
			$("#current_image").attr('src', '/userimages/128/' + data);
		},
		error: function(data,stat,err){
		}
	});
}

//function show_pic(){}
//function screen_pic(){}

function show_l_table(index){
	var dims32,
		b,
		name_l,
		list = [],
		name = $('#location:selected').html();
	if (index) {
		name_l = $('#location:selected').html(); // ???????
		$('#current_picture').attr('src', '/images/nophoto.jpg');
		$('#current_location').html(name);
		for (b in imgs) {
			if(imgs[b].lid === a){
				dims32 = imgs[b].d32.split(",");
				$('#sortable').append('<img src="/userimages/32/' + imgs[b].file + '" width="' + dims32[0] + '" height="' + dims32[1] + '" title="' + imgs[b].ofile + '" border="0" alt="" onclick="prepare_pic(' + b + ')" id="' + imgs[b].file.split(".")[0] + '">');
			}
		}

		if (list.length) {
			$(function() {
				$("#sortable").sortable({
					distance: 30,
					placeholder: "target-highlight-small",
					create: function(event, ui) {
						var url = '/admin/photomanager/' + index + '/' + $("#sortable").sortable("toArray")[0];
						$('#frm_img_order').val($("#sortable").sortable("toArray").join(','));
						$("#exec_form").attr('action', url);
					},
					stop: function(event, ui) {
						var url = '/admin/photomanager/' + index + '/' + $("#sortable").sortable("toArray")[0];
						$('frm_img_order').val($( "#sortable" ).sortable("toArray").join(','));
						$("#submit_button").css("display","block");
						$("#exec_form").attr('action', url);
					}
				});
				$("#sortable").disableSelection();
			});
		}
		$('#photoeditor_l_name').html(name);
		return true;
	}
	return false;
}

function prepare_pic(index) {
	var dims128 = imgs[index].d128.split(","),
		dims32  = imgs[index].d32.split(","),
		dims800 = imgs[index].d800.split(","),
		dims    = "Иконка: " + dims32[0] + "x" + dims32[1] + " px; Малое: " + dims128[0] + "x" + dims128[1] + " px; Большое: " + dims800[0] + "x" + dims800[1] + " px.";

	$('#current_picture').attr('src',"/userimages/128/" + imgs[index].file).css('width', dims128[0]).css('height', dims128[1]);
	$('#pic_name').val(imgs[index].file);
	$('#current_dimensions').html(dims);
	$('#current_file').html(imgs[index].ofile);
}

function prepare_pic_by_name(index) {
	var mapLocation;
	for (mapLocation in imgs) {
		if (imgs[mapLocation].file === index) {
			prepare_pic(mapLocation);
		}
	}
}

