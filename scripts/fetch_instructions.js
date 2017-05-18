// This ain't good yet
function fetch_data(path){
    console.log("FETCH DATA CALLED");
    var promise = fetch('./info.json');
    promise.then(function(response){
	// see https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
	// 200 = OK!
	if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
			response.status);   
           return;
	}
	response.json().then(function(data){
	    console.log(data);	    
	    setting = data;
	    console.log(setting);
	    var inner = Object.keys(data)[0];
	    information = Object.keys(data[inner]);
	    inner = Object.keys(data)[1];	    
	    information1 = Object.keys(data[inner]);	    
	    console.log("information is " + information);	    
	    console.log("information 1 is " + information1);	    
	    console.log(setting['info2']);
	    return (information, information1); // why this doesn't return nothing? 
    })
    })
}
