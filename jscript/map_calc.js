ymaps.ready(init);

function init () {
	map = new ymaps.Map("fakemap", {
		center: [0,0],
		zoom: 10,// Коэффициент масштабирования
	});
	vobjects = new ymaps.GeoObjectArray();
	$("#map_calc").click(function(){
		var ids = [],
			lid = $('#lid').val();
		$('[type=checkbox]').each(function(){
			ids.push($(this).attr('id').split("_")[1]);
		});
		str = (ids.join("_"));
		$.ajax({
			url: "/ajaxutils/dependencycalc/" + lid + "/" + str,
			type: "POST",
			dataType: "script",
			success: function(){
				var point_coord = [0,0],
				pr_type = 1;
				for (a in set){
					if(a==0){
						switch (set[a][1]){
							case 1 :
								point_coord = set[a][2].split(",");
							break;
							case 2 :
								point_coord = new ymaps.geometry.LineString.fromEncodedCoordinates(set[a][2]).getCoordinates();
								pr_type = 2;
							break;
							case 3 :
								point_coord = new ymaps.geometry.Polygon.fromEncodedCoordinates(set[a][2]).getCoordinates();
								pr_type = 2;
							break;
						}
					}else{
						vobjects.add(new ymaps.Polygon(new ymaps.geometry.Polygon.fromEncodedCoordinates(set[a][2]),
						{ttl: set[a][0]},{}));
					}
				}
				map.geoObjects.add(vobjects);

				if(pr_type == 1){
					vobjects.each(function(item){
						if(item.geometry.contains(point_coord)) {
							$('#param_' + item.properties.get('ttl')).attr('checked','checked');
						}
					});
				}
				if(pr_type == 2){
					for (c in point_coord){
						vobjects.each(function(item){
							if(item.geometry.contains(point_coord[c])) {
								$('#param_' + item.properties.get('ttl')).attr('checked','checked');
							}
						});
					}
				}
				if(pr_type == 3){
					for (c in point_coord){
						vobjects.each(function(item){
							if(item.geometry.contains(point_coord[0][c])) {
								$('#param_' + item.properties.get('ttl')).attr('checked','checked');
							}
						});
					}
				}

			},
			error: function(a,b,с){
				alert(с);
			}
		});
	});

}