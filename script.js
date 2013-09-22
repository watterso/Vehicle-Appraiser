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
		if(eqDetails > 0){
			return true;
		}
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
	if(eqDetails > 0){
		return true;
	}
	eqDetails = 0;
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
		if(eqDetails > 0){
			return true;
		}
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
	if(eqDetails > 0){
		return true;
	}
	return false;
}
function handleData(data, vehicle, tableRow){
	var url = "http://autoapi.hearst.com/v1/UsedCarWS/UsedCarWS/UsedVehicle/UVC/";
	var api = "?api_key=95wwucscmjjuveapk9ffm94t";
	var res = "<div class=\"appraise\">"+JSON.stringify(vehicle)+"</div>";
	$(res).insertAfter($(tableRow).parent().parent());
	data.forEach(function (result){
		if(isRelevant(result,vehicle)){
			var tmpObj = {"make":result.make, "model":result.model,"year":result.year, "uvc":result.uvc};
			var mUrl = url+tmpObj.uvc+api;
			mUrl += "&state="+vehicle.state;
			mUrl += "&mileage="+vehicle.miles;
			$.get(mUrl, function (data){
				handleData(data, tmpObj, tableRow);
			});
			//var row = "<div class=\"appraise\">"+JSON.stringify(tmpObj)+"</div>";
			//$(row).insertAfter($(tableRow).parent().parent());
		}
	});


}
$("[itemscope]").filter("tr").each(function (){
	var tableRow = $(this);
	var tmpObj = {};
	var cols = $(this).children();
	var superTitle = cols.filter('.details').children().filter('.supertitle').text();
	var linkText = cols.filter('.details').children().filter('.ttl').children().filter('a').attr("title");
	var miles = cols.filter('.mileage').children().first().text()
	var state = cols.filter('.location').children().first().children().text().split(", ")[1];
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
		tmpObj.miles = miles;
		tmpObj.state = state;
		var mUrl = "https://api.mongolab.com/api/1/databases/uvclookup/collections/uvcdata?apiKey=jIHkv3sxi0kID-9TRpmg_5Yckd2dKF7M";
		var query = {
			"make": {"$regex":tmpObj.make, "$options":"i"},
			"model": {"$regex":".*"+tmpObj.model+".*", "$options":"i"},
			"year" : tmpObj.year
		};
		mUrl+="&q="+encodeURI(JSON.stringify(query));
		$.get(mUrl, function (data){
			handleData(data, tmpObj, tableRow);
		});
	}
});