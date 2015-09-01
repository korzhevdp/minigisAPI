function image_rotate(input, response, target) {
	//selecting the function behavior. empty string of response is supposed to be an initial request. non-empty response exposes data
	if (response == '') {
		if(input=='left'){
			url = 'http://localhost/codeigniter/index.php/admin/ajax/image_rotate_left';
		}
		if(input=='right'){
			url = 'http://localhost/codeigniter/index.php/admin/ajax/image_rotate_right';
		}
		//alert(url);
		loadXMLDoc(url);
	}else{
		alert(response);
	}
}