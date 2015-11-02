/* jshint -W100 */
/* jshint undef: true, unused: true */
/* globals ymaps, confirm, style_src, usermap, style_paths, yandex_styles, yandex_markers, style_circles, style_polygons, styleAddToStorage */
////////////////////
// shedule may migrate to it's own JS-file
function show_schedule(schedule) {
	var a,
		days_h24 = 0;
	for (a in schedule ) {
		if (schedule.hasOwnProperty(a)) {
			$("#ds" + a).val(schedule[a][0]);
			$("#bs" + a).val(schedule[a][1]);
			$("#be" + a).val(schedule[a][2]);
			$("#de" + a).val(schedule[a][3]);
			if (schedule[a][0] === '00:00' && schedule[a][3] === '23:59'){
				days_h24 += 1;
			}
		}
	}
	$("#h24").prop("checked", false);
	$("#h724").addClass("hide");
	if (days_h24 >= 5) {
		$("#h24").prop("checked", true);
	}
	if (days_h24 === 7) {
		$("#h724").removeClass("hide");
	}
}

function get_schedule() {
	var lid = prop.ttl;
	$.ajax({
		url: "/schedule/get_schedule",
		data: {
			lid : lid
		},
		type: "POST",
		dataType: 'script',
		success: function () {
			show_schedule(schedule);
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err].join("\n"));
		}
	});
}

function save_schedule() {
	var a,
		lid = prop.ttl,
		h24 = $("#h24").prop("checked"),
		schedule = {}
	for (a = 0; a <= 6 ; a++) {
		schedule[a] = [ $("#ds" + a).val(), $("#bs" + a).val(), $("#be" + a).val(), $("#de" + a).val() ];
	}
	$.ajax({
		url: "/schedule/save_schedule",
		type: "POST",
		data: {
			lid     : lid,
			h24     : h24,
			schedule : schedule
		},
		dataType: 'script',
		success: function (){
			show_schedule(schedule);
		},
		error: function (data, stat, err) {
			console.log([ data, stat, err ].join("\n"));
		}
	});
}

///////////////