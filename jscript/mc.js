$('#operation-menu li a').each(function(){
	//alert(window.location.toString() + '   ' + $(this).attr('href'));
	if(window.location.toString() == '' + ($(this).attr('href'))) {
		$(this).parent().addClass('active');
	}else{
		//alert('no');
	}
})
$(".collapse").collapse();
$(".ogp_table > tr").mouseenter(function() {
	$(this).css('background-color','#F8F8F8');
});
$(".ogp_table > tr").mouseleave(function() {
	$(this).css('background-color','#FFFFFF');
});

function trace_afl(a){
	var id = $(a).attr('id').split("_")[1];
	$('div[id^="btab"] input:checkbox').removeAttr('disabled');
	if(id != 0){
		$('div[id^="atab"] input:radio').attr('disabled','disabled').removeAttr('checked');
		$('#btab'+ id + ' input:checkbox').attr('disabled','disabled').removeAttr('checked');
		$("#afl2").fadeOut(100,function(){});
	}else{
		$('div[id^="atab"] input:radio').removeAttr('disabled');
		$('#btab'+ id + ' input:checkbox').attr('disabled','disabled').removeAttr('checked');
		$("#afl2").fadeIn(600,function(){});
	}
}

$("#bflSwitcher").click(function(){
	$(".bfl").fadeToggle(50,function(){
		if($("#bfl").css("display")!== 'none'){
			$("#bflSwitcher").empty().html("Объекты заднего плана не нужны");
		}else{
			$("#bflSwitcher").empty().html("Подключить объекты заднего плана");
			$(".bfl input:checkbox").removeAttr('checked');
		}
	});
})

$(".bfl").css("display","none");

$("#afl input:radio").click(function(){
	trace_afl(this);
});


trace_afl($("#afl input:radio:checked"));

$("#bfl input:checkbox").click(function(){
	var id = $(this).attr('id').split("_")[2];
	($(this).attr('checked'))
	? $('#btab'+ id + ' input:checkbox').attr('disabled','disabled').attr('checked','checked')
	: $('#btab'+ id + ' input:checkbox').removeAttr('disabled').removeAttr('checked');
});
