/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
var file,
	dropZone,
	maxFileSize = 2000000,
	xhr,
	percent;

$(document).ready(function () {
	dropZone = $('#dropZone');
	if (window.FileReader === undefined) {
		dropZone.text('Не поддерживается браузером!');
		dropZone.addClass('error');
	}
	dropZone[0].ondragover = function () {
		dropZone.addClass('hover');
		return false;
	};
	dropZone[0].ondragleave = function () {
		dropZone.removeClass('hover');
		return false;
	};
	dropZone[0].ondrop = function (event) {
		var fd;
		event.preventDefault();
		dropZone.removeClass('hover');
		dropZone.addClass('drop');
		file = event.dataTransfer.files[0];
		if (file.size > maxFileSize) {
			dropZone.text('Файл слишком большой!');
			dropZone.addClass('error');
			return false;
		}
		xhr = new XMLHttpRequest();
		xhr.upload.addEventListener('progress', uploadProgress, false);
		xhr.onreadystatechange = stateChange;
		xhr.open('POST', '/upload/loadimage');
		xhr.setRequestHeader('X-FILE-NAME', file.name);
		fd = new FormData;
		fd.append("userfile", file);
		fd.append("lid", $("#uploadLID").val());
		xhr.send(fd);
	}
	function uploadProgress(event) {
		percent = parseInt(event.loaded / event.total * 100);
		dropZone.text('Загрузка: ' + percent + '%');
	}
	function stateChange(event) {
		var text,
			data;
		if (event.target.readyState === 4) {
			if (event.target.status === 200) {
				eval(event.target.response)
				if(data.message === "OK") {
					dropZone.text('Загрузка успешно завершена!');
					$(".imageGallery").append(data.image);
					set_deleter();
				} else {
					dropZone.text(data.message);
				}
			} else {
				dropZone.text('Произошла ошибка!');
				dropZone.addClass('error');
			}
		}
	}
});

$(function () {
	$( ".imageGallery" ).sortable({
		stop: function ( event, ui ) {
			$.ajax({
				url: "/editor/save_image_order",
				type: "POST",
				data: {
					order: $( ".imageGallery" ).sortable( "toArray", { attribute: "ref" } )
				},
				dataType: 'script',
				success: function () {
					/*
					$("#saveBtn").removeClass("btn-warning").addClass("btn-primary").html("Сохранить!");
					prop.ttl = data.ttl;
					$("#uploadLID").val(data.ttl);
					map.balloon.close();
					*/
				},
				error: function (data, stat, err) {
					console.log([ data, stat, err ].join("\n"));
				}
			});
		}
	});
	$( ".imageGallery" ).disableSelection();
});

function set_deleter(){
	$(".locationImg .icon-remove").click(function (){
		ref = $(this).parent().attr("ref");
		$.ajax({
			url: "/editor/delete_image",
			type: "POST",
			data: {
				image : ref,
				lid   : prop.ttl
			},
			dataType: 'script',
			success: function () {
				$(".locationImg[ref=" + ref + "]").remove();
			},
			error: function (data, stat, err) {
				console.log([ data, stat, err ].join("\n"));
			}
		});
	});
}

set_deleter();