/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
$("#main_table").css("height", ($(window).height() - 54) + "px");
$("#main_table").css("width", $(window).width() + "px");

$('.grouplabel').click(function() {
	$('#gc_' + this.id.split('_')[1]).slideToggle('slow', function() {});
});
/*
$(function() {
	$("#SContainer").draggable({ containment: "#YMapsID", scroll: false, handle: "#SContainer .head" });
});

$(function() {
	$(".modal").draggable({ containment: "body", scroll: false, handle: ".modal-header" });
});
*/
$('#SContainer .head').dblclick(function() {
	if($('#navigator').css('display') == 'block'){
		$('#navigator, #navheader').css('display', 'none');
		$('#SContainer').css('height', 22);
	}else{
		$('#navigator, #navheader').css('display', 'block');
		$('#SContainer').css('height', 400);
	}
});

$('#navup').click(function() {
	$('#navigator, #navheader').css('display', 'none');
	$(this).css('display', 'none');
	$('#navdown').css('display', 'block');
	$('#SContainer').css('height', 22);

});

$('#navdown').click(function() {
	$('#navigator, #navheader, #navup').css('display', 'block');
	$(this).css('display', 'none');
	$('#SContainer').css('height', 400);
});

$('#SContainer').delay(1000).css("display", "block").animate({opacity: 1}, 2000);
/*
$('#SContainer').mouseleave(function(){ $(this).delay(10000).animate({opacity: 0.3}, 2000, 'swing', function(){}); });

$('#SContainer').mouseenter(function(){ $(this).dequeue().stop().animate({opacity: 1},200);});

$('.map_name').mouseleave(function(){ $(this).delay(20000).animate({opacity: 0}, 2000, 'swing', function(){});});

$('.map_name').mouseenter(function(){ $(this).dequeue().stop().animate({opacity: 1},100); });

$(function(){ $('.map_name').delay(20000).animate({opacity: 0}, 2000, 'swing', function(){});});
*/

// фильтрация списка найденных элементов.
$("#objfilter").keyup(function () {
	if($("#objfilter").val().length){
		$("#resultBody li").each(function () {
			var test = $(this).html().toString().toLowerCase().indexOf($("#objfilter").val().toString().toLowerCase()) + 1;
			$(this).css('display', ((test) ? 'block' : 'none'));
		});
	}
});

$('#modal_pics, #langSelector').modal({ show: 0 });

$(".langMark").click(function(){
	$("#langSelector").modal('show');
});

$('#modal_pics').on('shown', function(){
	$.ajax({
		url      : "/nodal/getimagelist",
		type     : "POST",
		data     : {
			loc : $('#l_photo').attr('loc')
		},
		dataType : "html",
		success  : function(data){ // и если повезло и ответ получен вменяемый
			$("#p_coll").empty().append(data); // очищаем коллекцию картинок, вставляем новые
			newid = 'car_' + ($(".carousel").attr('id').split('_')[1] += 1); // вычисляем перспективный ID
			$(".carousel").attr('id', newid); // устанавливаем перспективный ID на блок с каруселью
			$(".carousel-control").attr("href", newid); //обновляем контролы
			$('#' + newid).carousel(); // инициируем
			//$(".carousel").carousel();
		},
		error    : function (data, stat, err) {
			console.log([data, stat, err].join("<br>"));
		}
	});
});

$('#moraleup').click(function () {
	$.ajax({
		url      : '/nodal/moraleup',
		type     : "POST",
		dataType : "html",
		success  : function(data){ // and if you are lucky and sane response is received
			$("#moralecounter").empty().html(data);
		},
		error    : function (data, stat, err) {
			console.log([data, stat, err].join("<br>"));
		}
	});
});