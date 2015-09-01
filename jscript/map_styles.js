style_src = new Array();
style_src.push('/images/userstyles/redarrowdown.png|user#curbuilding');		//Набор: pandora Дизайнер: Mike Beecham
style_src.push('/images/userstyles/park2.png|user#citypark');				//Набор: map icons//Дизайнер: Nicolas Mollet;
style_src.push('/images/userstyles/disability25.png|user#disability25');				//Набор: map icons//Дизайнер: Nicolas Mollet;
style_src.push('/images/userstyles/disability50.png|user#disability50');				//Набор: map icons//Дизайнер: Nicolas Mollet;
style_src.push('/images/userstyles/disability75.png|user#disability75');				//Набор: map icons//Дизайнер: Nicolas Mollet;
style_src.push('/images/userstyles/disability100.png|user#disability100');			//Набор: map icons//Дизайнер: Nicolas Mollet;
style_src.push('/images/userstyles/disability100.png|user#aquarium');			//Набор: map icons//Дизайнер: Nicolas Mollet;
style_src.push('/images/userstyles/ds.png|user#dsm');			//Набор: map icons//Дизайнер: Nicolas Mollet;

style_paths = new Array();
style_paths.push('0099CCF0|3|routes#bus');		//Набор: YANDEX;
style_paths.push('B2B2B2F0|3|routes#walk');		//Набор: YANDEX;
style_paths.push('FFFF00F0|3|routes#car');		//Набор: YANDEX;
style_paths.push('0000FFF0|3|routes#vessel');		//Набор: YANDEX;
style_paths.push('330000F0|3|routes#railroad');		//Набор: YANDEX;
style_paths.push('66FFFFF0|3|routes#air');		//Набор: YANDEX;
style_paths.push('66CC00F0|3|routes#bike');		//Набор: YANDEX;
style_paths.push('339900F0|3|routes#wire');		//Набор: YANDEX;
style_paths.push('CC0000F0|3|routes#xdsl');		//Набор: YANDEX;
style_paths.push('C5C6C6F0|3|routes#default');		//Набор: YANDEX;
style_paths.push('FF0033BB|4|routes#current');		//Набор: YANDEX;

style_polygons = new Array();
style_polygons.push('1|1|2|FFFF0088|0000ff33|area#default');		//Набор: Mk. 2;
style_polygons.push('1|1|2|FFFFFFBB|FF3300BB|area#red');		//Набор: Mk. 2;
style_polygons.push('1|1|2|FFFF0088|FF330033|area#green');		//Набор: Mk. 2;
/// packing styles
userstyles = new Array();
for (i in style_src){
	var a = userstyles.length;
	var src = style_src[i].split("|");
	userstyles[a] = new Array();
	userstyles[a].href=src[0];
	userstyles[a].label=src[1];
	userstyles[a].type=1;
}
for (i in style_paths){
	var a = userstyles.length;
	var src = style_paths[i].split("|");
	userstyles[a] = new Array();
	userstyles[a].strokeColor=src[0];
	userstyles[a].strokeWidth=src[1];
	userstyles[a].label=src[2];
	userstyles[a].type=2;
}
for (i in style_polygons){
	var a = userstyles.length;
	var src = style_polygons[i].split("|");
	userstyles[a] = new Array();
	userstyles[a].fill=src[0];
	userstyles[a].outline=src[1];
	userstyles[a].strokeWidth=src[2];
	userstyles[a].strokeColor=src[3];
	userstyles[a].fillColor = src[4];
	userstyles[a].label=src[5];
	userstyles[a].type=3;
}

