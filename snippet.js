var companyName = builder.EntityRecognizer.findEntity(args.entities, "CompanyName");
    session.send('Getting Data for  \'%s\'.', companyName.entity);
	var http = require("https");
	url = "https://www.quandl.com/api/v3/datasets.json?query="+companyName.entity+"&per_page=1&page=1";
    
	var request = http.get(url, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event    
    var buffer = "", 
        data,
        route;
	
    response.on("data", function (chunk) {
        buffer += chunk;
    }); 

    response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
        //console.log(buffer);
        //console.log("\n");
        data = JSON.parse(buffer);
        abc = data.datasets;
		tickername= abc[0].dataset_code;
		//tickername = route.dataset_code;

        // extract the distance and time
        
	console.log("SYM: " + tickername);      
//  console.log("Time: " + route.legs[0].duration.text);
	session.send("Price of \'%s\' ",tickername);
	url1 = "https://www.quandl.com/api/v3/datasets/NSE/"+tickername+".json?api_key=3rmf8-xvrxu3XPXPhZHj&limit=1";
var request = http.get(url1, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event    
    var buffer = "", 
        data,
        route;

    response.on("data", function (chunk) {
        buffer += chunk;
    }); 

    response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
        //console.log(buffer);
        //console.log("\n");
        data = JSON.parse(buffer);
        route = data.dataset;


        // extract the distance and time
        //console.log("name: " + route.name);
	//console.log("Date: " + route.data[0][0]);      
//  console.log("Time: " + route.legs[0].duration.text);
	session.send("Price of \'%s\' is \'%s\' ",route.name,route.data[0][5]);
    }); 
});
    }); 
}); 
