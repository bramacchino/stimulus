
/*
*
* START HELPER FUNCTIONS FOR DATA ANALYSIS
*
*/
 
function result_analysis(results){
    /**
     * reulsts is an object {trials, rt, response, leftN, rightN}
     * prepare data for plotting
     */
    // let correct_response

    var left_diff =  math.subtract(results.leftNumerosity,results.rightNumerosity);    
    var trial_distance =  math.abs(left_diff);
    var correct_response =  left_diff.map(function(x){
	if (x>0){return 1}
	else if (x<0){return 0}});

    var distance = valuesInArray(trial_distance).sort();
    var averages = [];
    distance.forEach(function(x){
	var indices = sameIndex(trial_distance,x);
	var temp = []; 
	indices.forEach(function(y){
	    temp.push(results.reactionTime[y])
	})
	
	averages.push(sumArray(temp)/temp.length);
    })
    return [distance, averages]
}
