/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
var a;
$('#operation-menu li a').each(function() {
	//alert(window.location.toString() + '   ' + $(this).attr('href'));
	if(window.location.toString() === $(this).attr('href')) {
		$(this).parent().parent().addClass('active');
	}
});

$(".collapse").collapse();
$(".ogp_table > tr").mouseenter(function() {
	$(this).css('background-color','#F8F8F8');
});
$(".ogp_table > tr").mouseleave(function() {
	$(this).css('background-color','#FFFFFF');
});


//$(".bfl").addClass("hide");

$("#a_layer0").click(function() {
	$(".atab :checkbox").prop("checked", false).prop("disabled", false);
	$(".btab :checkbox").prop("checked", false).prop("disabled", false);
	if ($("#a_layer0").prop("checked")) {
		$(".a_layers").prop("checked", false);
		//$("#afl2").removeClass("hide");
	} else {
		//$("#afl2").addClass("hide");
	}
});

$(".a_layers").click(function() {
	$("#a_layer0").prop("checked", false);
	//$("#afl2").addClass("hide");
	trace_layers();
});

$(".a_types").click(function() {
	//$("#a_layer0").prop("checked", false);
	//$("#afl2").addClass("hide");
	trace_types($(this));
});

function disable_layers() {
	for (a in disabled_layers){
		if (disabled_layers.hasOwnProperty(a)) {
			$("#a_layer" + disabled_layers[a] +", #b_layer" + disabled_layers[a]).prop("checked", false).prop("disabled", true).parent().parent().addClass('inactive');
		}
	}
}

function trace_layers(){
	$(".b_layers, .b_types").prop("checked", false).prop("disabled", false).parent().parent().removeClass('inactive');
	$(".a_layers").each(function () {
		var ref = $(this).attr("ref");
		if ($(this).prop("checked")) {
			$("#b_layer" + ref).prop("checked", false).prop("disabled", true).parent().parent().addClass('inactive');
			$("#atab" + ref + " :checkbox").prop("checked", true).prop("disabled", true);
			$("#atab" + ref).addClass('inactive');
			$("#btab" + ref + " :checkbox").prop("checked", false).prop("disabled", true);
			$("#btab" + ref).addClass('inactive');
			disable_layers();
			return false;
		}
		$("#atab" + ref + " :checkbox").prop("checked", false).prop("disabled", false);
		$("#atab" + ref).removeClass('inactive');
		$("#btab" + ref + " :checkbox").prop("checked", false).prop("disabled", false);
		$("#atab" + ref).removeClass('inactive');
		disable_layers();
	});
}

function trace_types(item){
	var ref = item.attr("ref");
	disable_layers();
	if (item.prop("checked")) {
		$("#btype" + ref).prop("checked", false).prop("disabled", true);
		return true;
	}
	$("#btype" + ref).prop("checked", false).prop("disabled", false);
}

function setCheckboxes(source, selector) {
	for (a in source){
		if (source.hasOwnProperty(a)) {
			$(selector + source[a]).prop("checked", true).prop("disabled", false);
			if (selector === "#atype") {
				trace_types($(selector + source[a]));
			}
		}
	}
}

setCheckboxes(a_layers, "#a_layer");
trace_layers();
setCheckboxes(b_layers, "#blayer");
setCheckboxes(b_types, "#btype");
setCheckboxes(a_types, "#atype");
disable_layers();
