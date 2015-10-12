var file,
	dropZone,
	maxFileSize = 2000000,
	xhr,
	percent;
$(document).ready(function() {
	dropZone = $('#dropZone');
	if (window.FileReader === undefined) {
		dropZone.text('Не поддерживается браузером!');
		dropZone.addClass('error');
	}
	dropZone[0].ondragover = function() {
		dropZone.addClass('hover');
		return false;
	};
	dropZone[0].ondragleave = function() {
		dropZone.removeClass('hover');
		return false;
	};
	dropZone[0].ondrop = function(event) {
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
		if (event.target.readyState === 4) {
			if (event.target.status === 200) {
				dropZone.text('Загрузка успешно завершена!');
				$(".imageGallery").append(event.target.response);
			} else {
				dropZone.text('Произошла ошибка!');
				dropZone.addClass('error');
			}
		}
	}
});
