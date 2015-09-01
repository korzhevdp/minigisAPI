function show_page(a){
	$('#new_page').val(a);
	//alert(a);
	$('#frm_main_form').submit();
}
function showhide(a){
	var list = $('#locations_ids').val().split(',');
	for (val in list ){
		$('#info_table_'+list[val]).css('display','none');
	}
	if(document.getElementById('info_table_'+a).style.display == 'none'){
		document.getElementById('info_table_'+a).style.display = 'block';
	}else{
		document.getElementById('info_table_'+a).style.display = 'none';
	}
}

function add_time_period(){
	//var time_periods = new Array();
	var container = document.getElementById('more_time_periods');
	var periods_count = container.childNodes.length;
	var chunk = 'с: <input type="text" class="selector halfwidth" name="d_start' + periods_count + '"> по: <input type="text" class="selector halfwidth" name="d_end' + periods_count + '"> цена: <input type="text" class="quarterwidth" name="price_' + periods_count + '"> руб./чел./день';
	var div = document.createElement("div");
	div.innerHTML = chunk;
	container.appendChild(div);
	//container.innerHTML = time_periods.join("<br />");
	$(".selector").datepicker($.datepicker.regional['ru']);
	$(".selector").datepicker( "option", "minDate", new Date());
	$(".ui-datepicker > td").mouseenter(function() {
		$(this).css('background-color','#FF0000');
	});
	//$(".selector").datepicker( "option", "showWeek", true );
}

function show_payment_plan(plannum){
	var current_count = $('#period_count').val();
	var move = $('#frm_pp_container').text();
	if(plannum==1){
		$('#frm_pp_container').html($('#month_plan').html());
		var count = 6;
	}
	if(plannum==2){
		$('#frm_pp_container').html($('#semimonth_plan').html());
		var count = 10;
	}
	if(plannum==3){
		$('#frm_pp_container').html($('#decade_plan').html());
		var count = 14;
	}
	if(plannum==4){
	}
	$('#period_count').val(count);
	//alert(count);
	//alert("¬ыбрана сетка плана " + plan.options[plan.selectedIndex].text);
}

function aggregation_walk(prop,val){
	var obj_array = document.getElementById('r_' + prop).value.split(",");
	var obj_num = obj_array.length;
	var step=parseInt(document.getElementById('index_' + prop).value);
	step=step+val;
	if(step>(obj_num-3)){step=(obj_num-3);}
	if(step<0){step=0;}
	document.getElementById('index_' + prop).value = step;
	for(i=0;i<step;i++){
		document.getElementById('a'+prop+'_'+obj_array[i]).style.display = 'none';
		//alert(">>"+i);
	}
	for(i=step;i<(obj_num);i++){
		if(i<obj_num){
			$('#a'+prop+'_'+obj_array[i]).css('display','block');
		}
	}
	for(i=(step+3);i<obj_num;i++){
		if(i<obj_num){
			$('#a'+prop+'_'+obj_array[i]).css('display','none');
		}
	}

}