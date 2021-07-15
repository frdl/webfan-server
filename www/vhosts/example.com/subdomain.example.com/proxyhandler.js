


module.exports = function handler(mount, url, req){
	var r = { 
		target : "https://webfan3.de",
		host : "webfan3.de"
	};
	
	if(req.url==='/'){
		r.target ='https://webfan3.de/index.php/apps/cms_pico/pico_proxy/test';
	}
	return r;
};
