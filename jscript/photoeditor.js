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

function show_pic(){}
function screen_pic(){}

function show_l_table(a){
	if(a){
		var list = [],
			name = $('#location:selected').html();

		$('#current_picture').attr('src', '/images/nophoto.jpg');
		$('#current_location').html(name);

		for (b in imgs){
			if(imgs[b].lid == a){
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
						$('#frm_img_order').val($("#sortable").sortable("toArray").join(','));
						url = '/admin/photomanager/' + a + '/' + $("#sortable").sortable("toArray")[0];
						$("#exec_form").attr('action', url);
					},
					stop: function(event, ui) {
						$('frm_img_order').val($( "#sortable" ).sortable("toArray").join(','));
						$("#submit_button").css("display","block");
						url = '/admin/photomanager/' + a + '/' + $("#sortable").sortable("toArray")[0];
						$("#exec_form").attr('action', url);
					}
				});
				$("#sortable").disableSelection();
			});
		}
		name_l = $('#location:selected').html();
		$('#photoeditor_l_name').html(name);
	} else {
		return false;
	}
}

function prepare_pic(a){
	var dims128 = imgs[a].d128.split(","),
		dims32  = imgs[a].d32.split(","),
		dims800 = imgs[a].d800.split(","),
		dims    = "Иконка: " + dims32[0] + "x" + dims32[1] + " px; Малое: " + dims128[0] + "x" + dims128[1] + " px; Большое: " + dims800[0] + "x" + dims800[1] + " px.";

	$('#current_picture').attr('src',"/userimages/128/" + imgs[a].file).css('width', dims128[0]).css('height', dims128[1]);
	$('#pic_name').val(imgs[a].file);

	$('#current_dimensions').html(dims);
	$('#current_file').html(imgs[a].ofile);
}

function prepare_pic_by_name(a){
	for(l in imgs){
		if(imgs[l].file == a){
			prepare_pic(l);
		}
	}
}

