//Aliases
"use strict"; //https://www.w3schools.com/js/js_strict.asp


var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Text = PIXI.Text;

//Create a Pixi stage and renderer
var canvas = document.getElementById('viewport'); 
var stage = new Container(),
    renderer = autoDetectRenderer(640,
				  360,
				  //this works but check documentation
				  // http://stackoverflow.com/questions/12826977/multiple-arguments-vs-options-object
				  
				  {view: document.getElementById("viewport"), transparent:true}
				 ); //{antialising: false} ?? 

// add the renderer to the document for resizing
// NOTE: CSS INTERACTION
// appendChild HTML5 method != addChild (pixi method )
// CSS sizes and renderer sizes order
// http://stackoverflow.com/questions/2279519/how-to-get-main-div-container-to-align-to-centre
// Check for vertical positoning !!!
// http://www.mattboldt.com/kicking-ass-with-display-table/
// http://emergentweb.com/test/valign.html
// http://stackoverflow.com/questions/396145/how-to-vertically-center-a-div-for-all-browsers
// Indeed uncomment the following and disaster happens:
// canvas is set out of the container (why?)
//document.body.appendChild(renderer.view);


//Set the canvas's border style and background color
//renderer.view.style.border = "2px solid orange";
//renderer.backgroundColor = "0x838383";


// Resize the renderer
// the following only to resize the renderer and not the content
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

// TODO: generalize ad Hoc
// NOTE CSS INTERACTION!!!! 
renderer.resize(Math.min(w-20, 728), Math.min(h-50, 500));
//renderer.resize(954, 500);


//Set the initial game state
var state = play;

//load an image and run the `setup` function when it's done
loader.add("images/small/clippy.json").load(setup);

//Define any variables that are used in more than one function
// Sprite aliases
var seal = "64x64-seal.png",
    penguin = "64x64-penguin.png",
    rabbit = "64x64-rabbit.png",
    carrot = "64x64-carrot.png",
    bluDragon = "64x64-dragon_blue.png",
    redDragon =  "64x64-dragon_red.png",
    bluGhost = "64x64-ghost_blue.png",
    redGhost = "64x64-ghost_red.png",
    dinoFront = "64x64-dino_front.png",
    dinoBack = "64x64-dino_back.png";

var TextScene = undefined,
    ExperimentScene = undefined,
    NumberOfTimes = 0; 

var rightSide = undefined,
    leftSide = undefined;

// Mouse pointer and click via Tink (update to hammer.js for multitouch support)
var t = undefined,
    pointer = undefined;

// TODO: provisional
// Interaction with layout to be avoided althought Content/Container is pretty general
var content_div = document.getElementById('content');
var content_offset =  content_div.offsetLeft;
console.log("canvas position is", content_offset);

//save the results in the objects results
//

var results = {
    numberOfTrials: 0,
    reactionTime: [],
    userResponse: [],
    leftNumerosity: [],
    rightNumerosity: []
};

// Text messages from an external json file 
/// This will become a function
var promise = fetch('./info.json');
var information = undefined;
var information1 = undefined;
var setting = undefined; 
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
	let inner = Object.keys(data)[0];
	information = Object.keys(data[inner]);
	inner = Object.keys(data)[1];
	information1 = Object.keys(data[inner]);
	console.log("information is " + information);
	console.log("information 1 is " + information1);
	console.log(setting['info2']);
		    
    })
})


// uncategorized variables 
var createdTime = undefined; //Date.now();
var checkTime = undefined; 

var space = undefined,
    left = undefined,
    right = undefined;



// Experimenter design choices
var trials_number = 20;
results["numberOfTrials"] = trials_number; 

//
var instruction_limit = 1;

function setup() {
    console.time("setup");
    
    // add scene_n, and scene to Container
    // scene_n to keep track of the timeline
    Container.prototype.scene_n =  undefined;
    Container.prototype.scene = undefined;

    // Create the experiment scene
    ExperimentScene = new Container();
    ExperimentScene.scene_n = 0;
    ExperimentScene.scene = "demo"; 
	
    stage.addChild(ExperimentScene);

    ExperimentScene.visible = false; 
    

    //Create the  Information scene
    TextScene = new Container();
    TextScene.scene_n = 1;
    TextScene.scene = "info1";
    stage.addChild(TextScene);

    //Create the text sprite and add it to the information  scene
    
    var title = new Text(setting.info1[information[TextScene.scene_n-1]])
    //title.style.fill ='#FFFFFF';
    title.x = renderer.width/2  - title.width/2;
    
    //Note this is a bug
    //https://github.com/pixijs/pixi.js/issues/1745
    // Update pixi to v 3.0.4+
    title.style =({fill: '#FFFFFF',  font: "bold 25px Arial"});
    TextScene.addChild(title);
    

    var message = new Text(setting.info1[information[TextScene.scene_n]]);
    message.style.fill = "#FFFFFF";
    message.x = 10;
    message.y = 50;
    message.style = ({fill: "#FFFFFF", font: "bold 15px Arial", wordWrap: true, wordWrapWidth: 600});
   // message.style = ({wordWrap: true, wordWrapWidth: 600});
    TextScene.addChild(message);
    

    // Capturing mouse/touch events
        // Mouse capturing
    //Create a new instance of Tink
  t = new Tink(PIXI, renderer.view);

  //Create a `pointer` object
    pointer = t.makePointer();


    //Add a custom `press` method
    var instruction_ended = false; 
    pointer.press = function () {
	var pointerRelativePosition = pointer.x-content_offset;
	console.log("The pointer was pressed at " + pointerRelativePosition);
	//320, 640 built in, refractor the code for more generality
	console.log("Text and Instruction" + TextScene.scene_n, instruction_limit)
	
	if (TextScene.scene_n <= instruction_limit) {
	    spacebar_pressed(); 
	}

	if (TextScene.scene_n === instruction_limit){
	    instruction_ended = true;
	}
	console.log("Instruction ended: ", instruction_ended);

	if (instruction_ended === true){ 

	if (pointerRelativePosition < 320){
	    buttonPressed("left");
	}
	else if (pointerRelativePosition > 320){
	    buttonPressed("right");
	}
	}

	
   };

    //Add a custom `tap` method
    // for mouse click (slower than press ?) 
  pointer.tap = function () {
    return console.log("The pointer was tapped");
  };
    
    
  //Capture the keyboard arrow keysx
    left = keyboard(37);
    right = keyboard(39);
    space = keyboard(32);
    var  up = keyboard(38);
    var backspace = keyboard(8);
    
    
    //Space arrow key `press` method

    space.press = function(){
	spacebar_pressed();
    };


    function spacebar_pressed() {
	//let instruction_limit = undefined;
	let info = undefined;
	
	if (TextScene.scene == "info1"){
	    instruction_limit = information.length;
	    info = 'info1';
	}
	else if (TextScene.scene == "info2"){
	    instruction_limit = information1.length;
	    information = information1;
	    info = 'info2'; 

	}
	if (TextScene.scene_n < instruction_limit){
	   // title.text =  "Instruction";
	    title.x = renderer.width/2  - title.width/2;
	    message.text =  setting[info][information[TextScene.scene_n]];
	    TextScene.scene_n ++ ;
	    console.log("NUMBER " +  TextScene.scene_n);
	}
	else if (TextScene.scene_n == instruction_limit){
	    TextScene.scene_n ++;
	    ExperimentScene.scene_n ++;
	    NumberOfTimes ++;
	    if (TextScene.scene == "info2"){
		ExperimentScene.scene = "experiment"; 
	    }
	    var d =setTimeout(function(){genExperiment();},1000);
	    document.getElementById('show_button').style.display = 'none';
	}
	
    };

    backspace.press = function () {
	let instruction_limit = information.length;
	if (TextScene.scene_n == 0){
	    console.log("nothing to do"); 
	}
	else if (TextScene.scene_n <= instruction_limit){
	    TextScene.scene_n -- ;
	    //title.text =  title2;
	    title.x = renderer.width/2  - title.width/2;
	    message.text = setting.info1[information[TextScene.scene_n-1]];
	     console.log("NUMBER " +  TextScene.scene_n);
	}
    };

 
    
    left.press = function(){
	buttonPressed("left"); 
    };

    right.press = function(){
	buttonPressed("right");
    };

    function buttonPressed(button){
	/**
	 * Handle the left and right button events 
	 */
	
	// is this initialization useless? 
	//var button = button; 
	var button_id = 0;
	
	if (button == "left"){
	    button_id = 1;  
	}
	else if (button == "right"){
	    button_id = 0; 

	}
	else{
	    console.log("Error: this function accept only left and right as button argument")
	    // May I do a break in this way?
	    // No, how to halt function execution?  
	}

	
	var RT = (Date.now()-createdTime)/1000; 
	console.log('Reaction time is ' + RT); 
	results.reactionTime.push(RT);
	console.log("The left numerosity is "+leftSide[1] + "\n The right numerosity is "+rightSide[1]);
	results.leftNumerosity.push(leftSide[1]);
	results.rightNumerosity.push(rightSide[1]); 
	console.log("The user pressed the " + button + " button");
	results.userResponse.push(button_id);
	NumberOfTimes ++;
	if (ExperimentScene.scene == "demo"){
	    console.log("Demo started");
	    trials_number = 5; 
	}
	if (ExperimentScene.scene == "experiment"){
	    console.log("experiment started");
	    trials_number = 20; 
	}

	if ((ExperimentScene.scene_n >=1) &&  NumberOfTimes < trials_number){
	    var d =setTimeout(function(){genExperiment();},1000);
	    return  Date.now();}
	else {
	    if (ExperimentScene.scene == "demo"){
	    var d = setTimeout(function(){
		TextScene.visible = true;
		title.text = "The demo is terminated";
		title.x = renderer.width/2  - title.width/2;
		//message.text = endText;
		message.text = "";
		TextScene.scene = "info2";
		TextScene.scene_n = 0; 
	    },1000)}
	    
	    if (ExperimentScene.scene == "experiment"){
	    var d = setTimeout(function(){
		TextScene.visible = true;
		title.text = "The experiment is terminated";
		title.x = renderer.width/2  - title.width/2;
		message.text = "";
		graph_results(result_analysis(results)[0], result_analysis(results)[1]);
		//message.text = endText;
		/*
		message.text = "";
		for (var prop in results){
		    message.text = message.text + prop + " = " + results[prop] + "\n" ;
		}
		*/

	    },1000)}
	}
    }   


  //Start the game loop
    gameLoop();
    console.timeEnd("setup");
}

function gameLoop() {

  //Loop this function 60 times per second
  requestAnimationFrame(gameLoop);

  //Run the current state
    state();

  // ToDo: Updating Tink t.update(); for mouse tracking 

  //Render the stage
  renderer.render(stage);
}

var combinations = genCombinations(2,12);
/**for (var com in combinations){
    console.log(combinations[com])}
*/

function genExperiment(){
    genTrial();
}

function genTrial(){
    /**
     * Should be genTrial, not genExperiment 
     * generate a trial: 
     * 2AFC
     * TODO : implement 2IFC (that's trivial, just separate it)
     * TODO : how to blue and yellow mixed? 
     * Two way or return from scattered Images the circle position and instantiate with that 
     * or modify scatteredImages such that is taken care there, that is pass two argument or an optional arugment
     * at the end quite identical so let's go for the first 
     */
    console.time("genExperiment");
    var task = "2AFC"; 
    //generate Sprites for both sides
    TextScene.visible = false;
    ExperimentScene.visible = true;
    //old browsers syntax IE<9 
    //var count = 0,i; for (i in combinations) if (combinations.hasOwnProperty(i)) count++;
    var randomDistance = randomInt(0,Object.keys(combinations).length - 1);
    var randomPair = randomInt(0, combinations[String(randomDistance)].length -1 );
    var indices = combinations[String(randomDistance)][randomPair];

    // 2AFC left and right stimuli 
    if (task=="2AFC"){
	leftSide = scatteredImages(0,320,16750889,bluGhost, indices[0]);
	rightSide = scatteredImages(320,640,0x0078AF,redGhost, indices[1]);
	var d = leftSide[0].concat(rightSide[0]);
    }

    // 2AFC mixed stimuli
    if (task == "2AFCmix"){
	//leftside and varside are defined globally, don't think this is reasonable
	leftSide = scatteredImages(0,640, 0x0078AF, rabbit, indices[0]);
	rightSide = scatteredImages(0,640, 0x0078AF, carrot, indices[1], leftSide[2]);
	var d = leftSide[0].concat(rightSide[0]);
    }

    if (task == "2IFC"){
	//redGhost should be passed by the genExperiment function 
	leftSide = scatteredImages(0,640, 0x0078AF, redGhost, indices[0]);
    }

    //update the creation time 
    createdTime = Date.now();
    checkTime = Date.now(); 
    
    //delete Sprites after one second
    setTimeout(function(){delete_sprites(d);}, 1000);
    console.timeEnd("genExperiment");

}

function scatteredImages(origin, width, color, name, circles_number, drawnPositions){

    /**
     * Return  array of non overlapping sprites or non overlapping shapes
     * Return number of sprites
     * Non overlapping is based on circle that contain the shape 
     */
    
    //null, undefined, 0, false, '', NaN will all get the default value
    //indexToExclude = indexToExclude || 0;
    console.time("scatteredImages");
    //null, undefined, 0, false, '', NaN will all get the default value
    //if default only if ommitted change in if(typeof indexToExclude === 'undefined') indexToExclude = 0;
    drawnPositions = drawnPositions || []; 
    
  
    
    var numberOfCircles = circles_number;
    var graphics = 1; 


    //var numberOfCircles = randomInt(3,10,indexToExclude);
    
    var drawnShapes = drawnPositions; 
    var shapes = [];
    
    var sprites = []; 
 
    // compute center points
    while (shapes.length < numberOfCircles){
	//Make a circle
	// Almost, probably the int rounding cause little problem
	var circled = {
            x : randomInt(origin, width-16), //check why stage.width != 640
	    y : randomInt(16,360-16),
	    r : 22.6 //randomInt(6,36)
	};
    

	var overlapping = false;

	var protection = 0;

	drawnShapes =  drawnShapes.concat(shapes);
	
	for (var j=0; j<drawnShapes.length; j++){
	    var other = drawnShapes[j];
	    var d = dist(circled.x, circled.y, other.x, other.y);
	    if (d < circled.r + other.r + 1){
		overlapping = true;
		//console.log(d);
		break;
	    }
	}
	if (!overlapping){
	    shapes.push(circled);
	}
	protection++; 
	if (protection % 100 == 0){
	    console.log(protection)
	}
	
	if (protection > 1000) {
	    console.log("More than 10.000 trials");
	    break;
	}
    }

    // draw shapes
    // Inscripted square, diagonal is the radius
    // Inscripted triangle,
    // Inscripted david star
    // Inscripted 5 star
    
    for (var k=0; k<shapes.length; k++){
	var circle = new Graphics();
	circle.beginFill(color);
	//circle.lineStyle(4, 26112, 1);
	circle.drawCircle(0, 0, shapes[k].r); // x,y = 0 'cause we reposition after for antialiasing
	circle.endFill();
	circle.alpha = 0;

       
	//If you want the graphic to be anti-aliased,
	//convert it into a bitmap texture and then use
	//that texture to create a new sprite
	//var circleTexture = circle.generateTexture();
	//var circleSprite = new Sprite(circleTexture);
	circle.x = shapes[k].x;
	circle.y = shapes[k].y;
	sprites.push(circle);
	ExperimentScene.addChild(circle);

	if (graphics == 1){
	    //Create the sprite from the texture
	    var pixie = new Sprite(resources["images/small/clippy.json"].textures[name]);
	    pixie.x = shapes[k].x - 16;
	    pixie.y = shapes[k].y -16;
	    
	    //Add the sprite to the stage
	    //for some reason performance issue
	    sprites.push(pixie);
	    ExperimentScene.addChild(pixie);
	}

    }
    console.timeEnd("scatteredImages");
    return [sprites, numberOfCircles, shapes]; 
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

function dist(x1, y1, x2, y2) {
    /**
     * Return euclidean distance of two points with coordinates (x1, y1), (x2, y2)
     * TODO :  compute by using tanh,  avoid computing sqrt 
     */
    //console.log('Distance function called')
    return Math.sqrt(Math.abs(x1-x2)**2 + Math.abs(y1-y2)**2)  //abs not needed 
}

function delete_sprites(sprite_list){
    console.time("deleteSprites");
        //Loop through all the sprites 
    
    sprite_list.forEach(function(p){
	ExperimentScene.removeChild(p);
    })
    console.timeEnd("deleteSprites");
} 

//The `keyboard` helper function
//Just a wrapper function aroung HTML keyup and keydown events

function keyboard(keyCode) {
    /**
     * Wrapper around HTML keyboard event
     * return the key object 
     */
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener("keydown", key.downHandler.bind(key), false);
  window.addEventListener("keyup", key.upHandler.bind(key), false);

  //Return the key object
  return key;
}
//# sourceMappingURL=keyboardMovement.js.map

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


function play() {
    //scatteredImages();
}

//Any animation code goes here
//# sourceMappingURL=shapes.js.map

