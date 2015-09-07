height = $(window).height();
$("#main_table").css("height", (height - 50) + "px");

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
	$('#navigator, #navheader').css('display', 'block');
	$(this).css('display', 'none');
	$('#navup').css('display', 'block');
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

// ���������� ������ ��������� ���������.
$("#objfilter").keyup(function () {
	if($("#objfilter").val().length){
		$("#resultBody li").each(function () {
			var test = $(this).html().toString().toLowerCase().indexOf($("#objfilter").val().toString().toLowerCase()) + 1;
			$(this).css('display', ((test) ? 'block' : 'none'));
		});
	}
});

$('#modal_pics').modal({ show: 0 });

$('#modal_pics').on('shown', function(){
	$.ajax({
		url      : "/ajaxutils/getimagelist/" + $('#l_photo').attr('loc'),
		type     : "POST",
		cache    : false,
		dataType : "html",
		success  : function(data){ // � ���� ������� � ����� ������� ���������
			$("#p_coll").empty().append(data); // ������� ��������� ��������, ��������� �����
			newid = 'car_' + ($(".carousel").attr('id').split('_')[1] += 1); // ��������� ������������� ID
			$(".carousel").attr('id', newid); // ������������� ������������� ID �� ���� � ���������
			$(".carousel-control").attr("href", newid); //��������� ��������
			$('#' + newid).carousel(); // ����������
			//$(".carousel").carousel();
		},
		error    : function (data, stat, err) {
			console.log([data, stat, err].join("<br>"));
		}
	});
});