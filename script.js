var hearst_api = "?api_key=95wwucscmjjuveapk9ffm94t"
var mongo_api = "?apiKey=jIHkv3sxi0kID-9TRpmg_5Yckd2dKF7M"
var collector = "http://autoapi.hearst.com/v1/cpiwsx.asmx/CurrentUVCValues"+hearst_api+"&bFillDrilldown=false&sUVC=";
var used_car = "http://autoapi.hearst.com/v1/UsedCarWS/UsedCarWS/UsedVehicle/UVC/";
var mongo = "https://api.mongolab.com/api/1/databases/uvclookup/collections/uvcdata"+mongo_api;
var vehicles = {};
var priceDom = {};
var vehicleInfo = {};
//super-naive and terrible comparison
function isRelevant(result, vehicle){
	var details = vehicle.modelDetails.split(" ");
	var modelArr = result.model.split(" ");
	var styleArr;
	var eqDetails = 0;
	if(result.style != null){
		//if there are style details, compare to modelDetails
		styleArr = result.style.split(" ");
		for (var i = details.length - 1; i >= 0; i--) {
			for (var j = styleArr.length - 1; j >= 0; j--) {
				if(styleArr[j].toUpperCase() == details[i].toUpperCase()){
					//console.log(styleArr[j] +"=="+details[i]);
					eqDetails++;
				}
			};
		};
	}
	//compare model details with given model data
	for (var i = details.length - 1; i >= 0; i--) {
		for (var j = modelArr.length - 1; j >= 0; j--) {
			if(modelArr[j].toUpperCase() == details[i].toUpperCase()){
				//console.log(modelArr[j] +"=="+details[i]);
				eqDetails++;
			}
		};
	};
	var linkArr = vehicle.linkText.split(" ");
	if(result.style != null){
		//compare link text with give style data
		styleArr = result.style.split(" ");
		for (var i = linkArr.length - 1; i >= 0; i--) {
			for (var j = styleArr.length - 1; j >= 0; j--) {
				if(styleArr[j].toUpperCase() == linkArr[i].toUpperCase()){
					//console.log(styleArr[j] +"=="+linkArr[i]);
					eqDetails++;
				}
			};
		};
	}
	//compare link text with given model data
	for (var i = linkArr.length - 1; i >= 0; i--) {
		for (var j = modelArr.length - 1; j >= 0; j--) {
			if(modelArr[j].toUpperCase() == linkArr[i].toUpperCase() && linkArr[i].toUpperCase()!= vehicle.model.toUpperCase()){
				//console.log(modelArr[j] +"=="+linkArr[i]);
				eqDetails++;
			}
		};
	};
	return eqDetails;
}
function getCollector(url,dom,obj){
	/*console.log(url);
	console.log(dom);
	console.log(obj);*/
    $.get(url, function(data){
    	/*console.log("collector");
    	console.log(data);*/
    	var info = $($.parseXML(data));
    	if(info != null){
			//console.log(info);
			vehicleInfo[dom.attr("id")] = info;
			$.data(dom,"info",info);
			if(obj.price[0]<info.find("fair")){
				//green
				dom.css("background-color","#90e90c");
			}else if(obj.price[0]<info.find("good")){
				//less green
				dom.css("background-color","#d8e109");
			}else if(obj.price[0]<info.find("excl")){
				//yellow
				dom.css("background-color","#edf218");
			}else{
				//red
				dom.css("background-color","#f24d18");
			}
			//modal here
		}
    });
}
function getClosure(url,dom,obj){
	/*console.log(url);
	console.log(dom);
	console.log(obj);*/
    $.getJSON(url, function(data){
    	//console.log(data);
    	var info = data.used_vehicles.used_vehicle_list[0];
    	if(info != null){
			//console.log(info);
			vehicleInfo[dom.attr("id")] = info;
			var tmpInfo = {};
			tmpInfo.whole_xclean = info.whole_xclean;
			tmpInfo.whole_clean = info.whole_clean;
			tmpInfo.whole_avg = info.whole_avg;
			tmpInfo.whole_rough = info.whole_rough;
			tmpInfo.retail_xclean = info.retail_xclean;
			tmpInfo.retail_clean = info.retail_clean;
			tmpInfo.retail_avg = info.retail_avg;
			tmpInfo.retail_rough = info.retail_rough;
			tmpInfo.tradein_clean = info.tradein_clean;
			tmpInfo.tradein_avg = info.tradein_avg;
			tmpInfo.tradein_rough = info.tradein_rough;
			//console.log(tmpInfo);
			$.data(dom,"info",info);
			if(obj.price[0]<tmpInfo.whole_avg){
				if(obj.price[0]<tmpInfo.whole_rough){
					//greenest
					dom.css("background-color","#90e90c");
				}else{
					//less green
					dom.css("background-color","#d8e109");
				}
			}else{
				if(obj.price[0]<tmpInfo.whole_clean){
					//yellow
					dom.css("background-color","#edf218");
				}else{
					if(obj.price[0]<tmpInfo.whole_xclean){
						//orange
						dom.css("background-color","#f2ac18");
					}else{
						//red
						dom.css("background-color","#f24d18");
					}
				}
			}
			//modal here
		}else{
			obj.isCollectable = true;
			getCollector(collector+obj.uvc,dom,obj);
		}
    });
    //console.log("end");
}
function handleData(data, vehicle, tableRow){
	var uvc = -1;
	var maxRelevance = 0;
	data.forEach(function (result){
		var relevance = isRelevant(result,vehicle)
		if(relevance>maxRelevance){
			uvc = result.uvc;
		}
	});
	var mUrl = used_car+uvc+hearst_api;
	mUrl += "&state="+vehicle.state;
	mUrl += "&mileage="+vehicle.miles;
	vehicle.url = mUrl;
	vehicle.uvc = uvc;

	var res = "<div class=\"appraise\">"+JSON.stringify(vehicle)+"</div>";
	//$(res).insertAfter($(tableRow).parent().parent());

	tableRow.children().filter('.prices').html("");
	var html = "<div class=\"pInfo\" id=\"veh-"+uvc+vehicle.state+vehicle.miles+"\""; 
	if(uvc==-1){
		html+="style=\"cursor:default\" ";
	}
	html+="href=\""+vehicle.url+"\">";
	vehicle.formattedPrice.forEach(function(price){
		html+='<div>'+price+"</div>";
	});
	html+="</div>";
	
	tableRow.children().filter('.prices').html(html);
	vehicles["#veh-"+uvc+vehicle.state+vehicle.miles] = vehicle;
	priceDom["#veh-"+uvc+vehicle.state+vehicle.miles] = $("#veh-"+uvc+vehicle.state+vehicle.miles)

	
	if(uvc!=-1){
		$("#veh-"+uvc+vehicle.state+vehicle.miles).click(function(){
			var id = $(this).attr("id");
			console.log("clicked: "+id);
			//alert(JSON.stringify(vehicles[id]]));	
		});
	}
}
$.ajaxSetup({"timeout":300000});
$("[itemscope]").filter("tr").each(function (){
	var tableRow = $(this);
	var tmpObj = {};
	var cols = $(this).children();
	var superTitle = cols.filter('.details').children().filter('.supertitle').text();
	var linkText = cols.filter('.details').children().filter('.ttl').children().filter('a').attr("title");
	var miles = cols.filter('.mileage').children().first().text()
	var state = cols.filter('.location').children().first().children().text().split(", ")[1];
	var price = [];
	var formattedPrice = [];
	if(cols.filter('.prices').children().size() == 0){
		price.push(parseInt(cols.filter('.prices').text().substring(1).replace(",",""),10));
		formattedPrice.push(cols.filter('.prices').text());
	}else{
		price.push(parseInt($(cols.filter('.prices').children().get(0)).text().substring(1).replace(",",""),10));
		formattedPrice.push($(cols.filter('.prices').children().get(0)).text());
		price.push(parseInt($(cols.filter('.prices').children().get(1)).text().substring(1).replace(",",""),10));
		formattedPrice.push($(cols.filter('.prices').children().get(1)).text());
	}
	var titleSplit = superTitle.split(":");
	//only parseable vehicle names accepted
	if(titleSplit.length == 2){
		tmpObj.make = titleSplit[0].trim();
		var modelArr = titleSplit[1].trim().split(" ");
		tmpObj.model = modelArr[0];
		modelArr.splice(0,1);
		tmpObj.modelDetails = modelArr.join(" ");
		tmpObj.year = parseInt(cols.filter('.year').first().text(),10);
		tmpObj.linkText = linkText;
		tmpObj.miles = parseInt(miles.replace(",",""),10);
		tmpObj.state = state;
		tmpObj.price = price
		tmpObj.formattedPrice = formattedPrice;
		var query = {
			"make": {"$regex":tmpObj.make, "$options":"i"},
			"model": {"$regex":".*"+tmpObj.model+".*", "$options":"i"},
			"year" : tmpObj.year
		};
		var mUrl =mongo +"&q="+encodeURI(JSON.stringify(query));
		$.get(mUrl, function (data){
			handleData(data, tmpObj, tableRow);
		});
	}
});
window.setInterval(
	window.setTimeout(function (){
			console.log("Starting Auto Highlight");
			for (key in priceDom){
				var veh = vehicles[key];
				console.log(key+" "+veh.make+" "+veh.model +" "+ veh.uvc);
				var dom = priceDom[key];
				var url = dom.attr("href");
				if(veh.uvc!=-1 && vehicleInfo[key]==null){
					window.setTimeout(getClosure(url,dom,veh),1000);
				}
			}
		},3000), 
1000);