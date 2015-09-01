height = $(window).height();
$("#main_table").css("height", (height - 95) + "px");

$('.grouplabel').click(function() {
	var id = this.id.split('_')[1];
	$('#gc_' + id).slideToggle('slow', function() {});
});

$(function() {
	$("#SContainer").draggable({ containment: "#YMapsID", scroll: false, handle: "#YMHead" });
});

$(function() {
	$(".modal").draggable({ containment: "body", scroll: false, handle: ".modal-header" });
});

$('#YMHead').dblclick(function() {
	if($('#navigator').css('display') == 'block'){
		$('#navigator, #navheader').css('display', 'none');
		$('#SContainer').css('height', 22);
	}else{
		$('#navigator, #navheader').css('display', 'block');
		$('#SContainer').css('height', 340);
	}
});

$('#navup').click(function() {
	$('#navigator, #navheader').css('display', 'none');
	$('#navup').css('display', 'none');
	$('#navdown').css('display', 'block');
	$('#SContainer').css('height', 22);

});

$('#navdown').click(function() {
	$('#navigator, #navheader').css('display', 'block');
	$('#navdown').css('display', 'none');
	$('#navup').css('display', 'block');
	$('#SContainer').css('height', 340);
});

$('#SContainer').mouseleave(function(){ $(this).delay(10000).animate({opacity: 0.3}, 2000, 'swing', function(){}); });


$('#SContainer').mouseenter(function(){ $(this).dequeue().stop().animate({opacity: 1},200);});

$('.map_name').mouseleave(function(){ $(this).delay(20000).animate({opacity: 0}, 2000, 'swing', function(){});});

$('.map_name').mouseenter(function(){ $(this).dequeue().stop().animate({opacity: 1},100); });

$(function(){ $('.map_name').delay(20000).animate({opacity: 0}, 2000, 'swing', function(){});});

// фильтрация списка найденных элементов.
$("#objfilter").keyup(function(){
	if($("#objfilter").val().length){
		$("#resultBody li").each(function(){
			var test = $(this).html().toString().toLowerCase().indexOf($("#objfilter").val().toString().toLowerCase()) + 1;
			(test) ? $(this).css('display', 'block') : $(this).css('display', 'none');
		});
	}
});

$('#modal_pics').modal({show: 0});

$('#modal_pics').on('shown', function(){
	$.ajax({
		url: "/ajaxutils/getimagelist/" + $('#l_photo').attr('loc'),
		type: "POST",
		cache: false,
		dataType: "html",
		success: function(data){ // и если повезло и ответ получен вменяемый
			$("#p_coll").empty().append(data); // очищаем коллекцию картинок, вставляем новые
			newid = 'car_' + ($(".carousel").attr('id').split('_')[1]++); // вычисляем перспективный ID
			$(".carousel").attr('id', newid); // устанавливаем перспективный ID на блок с каруселью
			$(".carousel-control").attr("href", newid); //обновляем контролы
			$('#' + newid).carousel(); // инициируем
			//$(".carousel").carousel();
		},
		error: function(a,b){
			alert("При поиске изображений произошла ошибка на сервере");
		}
	});
});