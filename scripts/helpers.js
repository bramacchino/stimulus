// Helper function for array sum 
// http://stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers
function sumArray(array){
    var sum = array.reduce(add, 0);
    function add(a, b) {
	return a + b;
    }
    return sum 
}

// Helper function for returning same element index
function sameIndex(array,element){
    /*
     * Given [1,2,1,3] returns [0,2]
     */
  var counts = [];
    for (var i = 0; i < array.length; i++){
      if (array[i] === element) {  
        counts.push(i);
      }
    }
  return counts;
}


// Helper function for returning list of different values
function valuesInArray(array){
    var differentValues = [];
    var temp = [];
    array.forEach(function(x){
	if(!(inArray(x, temp))){
	    temp.push(x)
	}
    })
    return temp 
}

/* Check for browser compatibility 
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
*/

function inArray(needle, haystack) {
 var length = haystack.length;
 for (var i = 0; i < length; i++) {
 if (haystack[i] == needle)
  return true;
 }
    return false;
}

//The `randomInt` helper function
function randomInt(min, max, indexToExclude) {
    /**
     * Return a random integers between min (inclusive) and max (inclusive)  
     * accept a number to be excluded
     */
    console.time("randomInt");
    //null, undefined, 0, false, '', NaN will all get the default value
    //if default only if ommitted change in if(typeof indexToExclude === 'undefined') indexToExclude = 0; 
    indexToExclude = indexToExclude || 0; 
    var rand = null; //an integer
    while(rand === null || rand === indexToExclude){
	rand = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    console.timeEnd("randomInt");
    return rand; 
}

// N chooses K function
function genCombinations(min, max){
    /**
     * Returns all possible combination of two elements from a set of lenght max-min+1 {1 = min, ..., n=max}
     * ordered by distance. 
     * [[distance 0], ...., [distance n-1]]
     */
    console.time("genCombination"); 
    var combinations = new Object(); 
    for (var i=min; i<=max; i++){
	for (var j=min; j<=max; j++){
	    //temporary list
	    //note var is used just from the parser not runtime
	    var temp = [];
	    if (i!=j){
		temp.push(i); temp.push(j);
		// == so it catches both null and undefined etc... 
		if (combinations[String(Math.abs(i-j))] == null){
		    combinations[String(Math.abs(i-j))] = [temp];
		}
		else {
		    combinations[String(Math.abs(i-j))].push(temp);
		    
		}
	    }
	}
    }
    console.timeEnd("genCombination");
    return combinations;
}

// Euclidean distance function 
function dist(x1, y1, x2, y2) {
    /**
     * Return euclidean distance of two points with coordinates (x1, y1), (x2, y2)
     * TODO :  compute by using tanh,  avoid computing sqrt 
     */
    //console.log('Distance function called')
    return Math.sqrt(Math.abs(x1-x2)**2 + Math.abs(y1-y2)**2)  //abs not needed 
}
