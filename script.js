$("[itemscope]").filter("tr").each(function (){
	var tmpObj = {};
	var cols = $(this).children();
	var superTitle = cols.filter('.details').children().filter('.supertitle').text();
	var titleSplit = superTitle.split(":");
	tmpObj.make = titleSplit[0].trim();
	var modelArr = titleSplit[1].trim().split(" ");
	tmpObj.model = modelArr[0];
	tmpObj.modelDetails = modelArr.join(" ");
	tmpObj.year = parseInt(cols.filter('.year').first().text(),10);
	var res = "<div class=\"appraise\">"+JSON.stringify(tmpObj)+"</div>";
	$(res).appendTo($(this));
	var mUrl = "https://api.mongolab.com/api/1/databases/uvclookup/collections/uvcdata?apiKey=jIHkv3sxi0kID-9TRpmg_5Yckd2dKF7M";
	var query = {
		"make": {"$regex":tmpObj.make, "$options":"i"},
		"model": {"$regex":".*"+tmpObj.model+".*", "$options":"i"},
		"year" : tmpObj.year
	};
	mUrl+="&q="+encodeURI(JSON.stringify(query));
	$.get(mUrl, function (data){
		console.log(JSON.stringify(data));
	});
});