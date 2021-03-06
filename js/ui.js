

//Variables for WebGL
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias:true});
var floorPlane = new THREE.PlaneGeometry(1000,1000,1,1);
var floorMaterial = new THREE.MeshLambertMaterial({color: 0x000000, side: THREE.DoubleSide});
var floor = new THREE.Mesh(floorPlane, floorMaterial);
var mainLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);

//Flags whether clicking should create new agent
var entryMode = false;

//Global dat.gui variables
var gui = new dat.GUI();
var goalAddition;
var agentDropdown;
var goalField;
var importanceSlider;
var addGoalButton;
var motivationFolder;
var motivationAgent;
var motivationName;
var motivationValue;
var setMotivation;
var motivationRule;
var addMotivationRule;
var triggerFolder;
var eventsDropdown;
var eventObjects;
var trigger;
var infoFolder;
var infoName;
var infoType;
var infoButton;
var feedbackFolder;
var feedbackName;
var feedbackBehavior;
var feedbackValue;
var feedbackTrigger;
var behaviorActor;
var behaviorButton;
var objectFolder;
var objectAgent;
var objectName;
var objectButton;
var agentsList = {};
var agentNames = [" "];
var eventsList = [" "];
var itemsList = [" "];
var dataTypes = ["Emotions", "Goals", "Events", "Motivations", "Associations"];



//Objects for dat.gui components
var event = {
    name: "",
    impacts: "",
    addButton: function(){
        newEvent(this.name,this.impacts);
    }
};
var goal = {
    agentName: " ",
    goalName: "",
    importance: 0.5,
    addButton: function() {
        if (this.agentName !== " ") {
            console.log(this.agentName + ".addGoal(\"" + this.goalName + "\", " + this.importance + ");");
            agentsList[this.agentName]["Engine"].addGoal(this.goalName, this.importance);
            swal("Goal Added!","","success");
        }
        else {
            swal("Please select an agent","","error");
        }
    }
};
var agent = {
    name: "",
    addButton: function(){
        if(!(agent.name === "" || agent.name in agentsList)) {
            newAgent(this.name);
        }
        else{
            swal("Agent name is either empty or is already in use.","","error");
        }
    }
}
var eventTrigger = {
    eventName: " ",
    associatedObjects: "",
    triggerButton: function() {triggerEvent(this.eventName, this.associatedObjects);}
}
var motivations = {
    name: " ",
    motivation: "",
    value: 0,
    setMotivationButton: function() {
        if(this.name !== " ") {
            console.log(this.name + ".setMotivation(\"" + this.motivation + "\", " + this.value + ");");
            agentsList[this.name]["Engine"].setMotivation(this.motivation, this.value);
            var message = this.motivation + " set to " + this.value.toString();
            swal(message,"","success")
        }
        else {
            swal("Please choose an agent.","","error")
        }

        updateColors()
    },
    rule: "",
    addRuleButton: function() {
        if(this.name !== " ") {
            console.log(this.name + ".addFilter(\"" + this.rule + "\");");
            agentsList[this.name]["Engine"].addFilter(this.rule);
            swal("Rule Added!","","success");
        }
        else {
            swal("Please choose an agent.","","error")
        }

        updateColors()
    }
}
var otherTriggers = {
    decayButton: function() {
        for (var agentName in agentsList) {
            console.log(agentName + ".decay()");
            agentsList[agentName]["Engine"].decay();
        }
        updateColors();
    }
}
var information = {
    name: " ",
    informationType: "Emotions",
    informationButton: function() {outputInfo(this.name, this.informationType)}
}
var feedback = {
    name: " ",
    behavior: "",
    value: 0.5,
    feedbackButton: function() {
        if(!(this.name === " " || this.behavior === "")) {
            console.log(this.name + ".provideFeedback(\"" + this.behavior + "\", " + this.value + ");");
            agentsList[this.name]["Engine"].provideFeedback(this.behavior, this.value);
            swal("Feedback provided!", "", "success");
        }
        else {
            swal("Please enter a behavior.", "", "error");
        }
    },
    actorName: " ",
    behaviorTrigger: function() {
        if(!(this.actorName === " " || this.behavior === "")) {
            console.log(this.name + ".triggerBehavior(\"" + this.behavior + "\", \"" + this.actorName + "\");");
            agentsList[this.name]["Engine"].triggerBehavior(this.behavior, this.actorName);
            updateColors();
        }
        else {
            swal("Please enter a behavior.", "", "error");
        }
    }
}
var objects = {
    agentName: " ",
    objectName: " ",
    introduceButton: function() {
        if(this.agentName !== " " && this.objectName !== " ") {
            console.log(this.agentName + ".introduceObject(\"" + this.objectName + "\");");
            agentsList[this.agentName]["Engine"].introduceObject(this.objectName);
            updateColors();
        }
    }
}






//Initialization
initGUI();
initScene();
render();


//Initializes all dat.gui components
function initGUI() {

    //Agent addition menu
    var agentAddition = gui.addFolder("Add Agent");
    agentAddition.add(agent, "name").name("Name");
    agentAddition.add(agent, "addButton").name("Add Agent");

    //Event addition menu
    var eventAddition = gui.addFolder('Add Event');
    eventAddition.add(event, "name").name("Name");
    eventAddition.add(event, "impacts").name("Goal Impacts");
    eventAddition.add(event, "addButton").name("Add Event");

    //Goal addition menu
    goalAddition = gui.addFolder('Add Goal');
    agentDropdown = goalAddition.add(goal, "agentName", agentNames).name("Agent Name");
    goalField = goalAddition.add(goal, "goalName").name("Goal Name");
    importanceSlider = goalAddition.add(goal, "importance").min(0).max(1).step(.01).name("Importance");
    addGoalButton = goalAddition.add(goal, "addButton").name("Add Goal");

    //Event triggering menu
    triggerFolder = gui.addFolder("Trigger Events");
    eventsDropdown = triggerFolder.add(eventTrigger, "eventName", eventsList).name("Event");
    eventObjects = triggerFolder.add(eventTrigger, "associatedObjects").name("Associated Items");
    trigger = triggerFolder.add(eventTrigger, "triggerButton").name("Trigger Event");

    //Motivations menu
    motivationFolder = gui.addFolder('Motivations');
    motivationAgent = motivationFolder.add(motivations, "name", agentNames).name("Agent Name");
    motivationName = motivationFolder.add(motivations, "motivation").name("Motivation Name");
    motivationValue = motivationFolder.add(motivations, "value").name("Motivation Value");
    setMotivation = motivationFolder.add(motivations, "setMotivationButton").name("Set Motivation");
    motivationRule = motivationFolder.add(motivations, "rule").name("Inhibition Rule");
    addMotivationRule = motivationFolder.add(motivations, "addRuleButton").name("Add Rule");

    //Social feedback menu
    feedbackFolder = gui.addFolder("Standards");
    feedbackName = feedbackFolder.add(feedback, "name", agentNames).name("Agent Name");
    feedbackBehavior = feedbackFolder.add(feedback, "behavior").name("Behavior");
    feedbackValue = feedbackFolder.add(feedback, "value").min(-3).max(3).step(.1).name("Value");
    feedbackTrigger = feedbackFolder.add(feedback, "feedbackButton").name("Provide Feedback");
    behaviorActor = feedbackFolder.add(feedback, "actorName", agentNames).name("Behavior Actor");
    behaviorButton = feedbackFolder.add(feedback, "behaviorTrigger").name("Trigger Behavior");

    //Object introduction menu
    objectFolder = gui.addFolder("Objects");
    objectAgent = objectFolder.add(objects, "agentName", agentNames).name("Agent Name");
    objectName = objectFolder.add(objects, "objectName", itemsList).name("Object Name");
    objectButton = objectFolder.add(objects, "introduceButton").name("Introduce Object");

    //Decay menu
    var miscellaneous = gui.addFolder("Other Functions");
    miscellaneous.add(otherTriggers, "decayButton").name("Decay");

    //Info menu
    infoFolder = gui.addFolder("Info");
    infoName = infoFolder.add(information, "name", agentNames).name("Agent Name");
    infoType = infoFolder.add(information, "informationType", dataTypes).name("Info Type");
    infoButton = infoFolder.add(information, "informationButton").name("Show Information");
}


//Initializes WebGL scene
function initScene() {
    //Set camera location and orient towards origin
    camera.position.set(0,40,0);
    camera.lookAt(new THREE.Vector3(0,0,0));

    //Size and add renderer to HTML document
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //Orient floor to be perpendicular to cylinder height and
    //  add the floor to the scene
    floor.position.y = -0.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    //Add hemisphere lighting to scene
    scene.add(mainLight);

    //Create event listener for mouse clicks, triggering onClick()
    document.addEventListener('mousedown', onClick, false);
    window.addEventListener( 'resize', onWindowResize, false );
}


//Finds location of click and places new agent at that location
function onClick(event){

    if(entryMode === true) {
        //Just a coordinate system conversion
        var mouse = {x: 0, y: 0};
        mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //Create ray and check where it intersects the floor plane
        var mouseVector = new THREE.Vector3(mouse.x, mouse.y, 1);
        mouseVector.unproject(camera);
        var ray = new THREE.Raycaster(camera.position, mouseVector.sub(camera.position).normalize());

        //Location variable holds the point at which the ray intersected the floor
        var intersect = ray.intersectObject(floor);
        var location = intersect[0].point;

        var geometry = new THREE.CylinderGeometry(1, 1, 4, 40);
        var material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
        var newCylinder = new THREE.Mesh(geometry, material);

        //Place cylinder at the location where the ray intersected  the floor
        newCylinder.position.set(location.x, 0, location.z);
        agentsList[agent.name] = {};
        console.log("new Engine(\"" + agent.name + "\", 0.4);");
        agentsList[agent.name]["Engine"] = new Engine(agent.name, 0.4);
        agentsList[agent.name]["Model"] = newCylinder;
        agentsList[agent.name]["Model"].name = agent.name;
        scene.add(agentsList[agent.name]["Model"]);
        entryMode = false;
    }
}


//Dynamic sizing when window is resized
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


//Render loop
function render() {

	requestAnimationFrame(render);
	renderer.render(scene, camera);
};


//New agent addition
//Code updates menus to reflect new agent (dynamic dropdowns)
function newAgent(name) {
    entryMode = true;
    agentNames.push(name);

    goalAddition.remove(agentDropdown);
    goalAddition.remove(goalField);
    goalAddition.remove(importanceSlider);
    goalAddition.remove(addGoalButton);

    agentDropdown = goalAddition.add(goal, "agentName", agentNames).name("Agent Name");
    goalField = goalAddition.add(goal, "goalName").name("Goal Name");
    importanceSlider = goalAddition.add(goal, "importance").min(0).max(1).step(.01).name("Importance");
    addGoalButton = goalAddition.add(goal, "addButton").name("Add Goal");

    motivationFolder.remove(motivationAgent);
    motivationFolder.remove(motivationName);
    motivationFolder.remove(motivationValue);
    motivationFolder.remove(setMotivation);
    motivationFolder.remove(motivationRule);
    motivationFolder.remove(addMotivationRule);

    motivationAgent = motivationFolder.add(motivations, "name", agentNames).name("Agent Name");
    motivationName = motivationFolder.add(motivations, "motivation").name("Motivation Name");
    motivationValue = motivationFolder.add(motivations, "value").name("Motivation Value");
    setMotivation = motivationFolder.add(motivations, "setMotivationButton").name("Set Motivation");
    motivationRule = motivationFolder.add(motivations, "rule").name("Inhibition Rule");
    addMotivationRule = motivationFolder.add(motivations, "addRuleButton").name("Add Rule");

    infoFolder.remove(infoName);
    infoFolder.remove(infoType);
    infoFolder.remove(infoButton);

    infoName = infoFolder.add(information, "name", agentNames).name("Agent Name");
    infoType = infoFolder.add(information, "informationType", dataTypes).name("Info Type");
    infoButton = infoFolder.add(information, "informationButton").name("Show Information");

    feedbackFolder.remove(feedbackName);
    feedbackFolder.remove(feedbackBehavior);
    feedbackFolder.remove(feedbackValue);
    feedbackFolder.remove(feedbackTrigger);
    feedbackFolder.remove(behaviorActor);
    feedbackFolder.remove(behaviorButton);

    feedbackName = feedbackFolder.add(feedback, "name", agentNames).name("Agent Name");
    feedbackBehavior = feedbackFolder.add(feedback, "behavior").name("Behavior");
    feedbackValue = feedbackFolder.add(feedback, "value").min(-3).max(3).step(.1).name("Value");
    feedbackTrigger = feedbackFolder.add(feedback, "feedbackButton").name("Provide Feedback");
    behaviorActor = feedbackFolder.add(feedback, "actorName", agentNames).name("Behavior Actor");
    behaviorButton = feedbackFolder.add(feedback, "behaviorTrigger").name("Trigger Behavior");

    objectFolder.remove(objectAgent);
    objectFolder.remove(objectName);
    objectFolder.remove(objectButton);

    objectAgent = objectFolder.add(objects, "agentName", agentNames).name("Agent Name");
    objectName = objectFolder.add(objects, "objectName", itemsList).name("Object Name");
    objectButton = objectFolder.add(objects, "introduceButton").name("Introduce Object");
}


//Menu updating for new events
function newEvent(name, impacts) {
    if(!(name === "" || name in eventsList)) {
        eventsList.push(name);
        triggerFolder.remove(eventsDropdown);
        triggerFolder.remove(trigger);
        triggerFolder.remove(eventObjects);

        eventsDropdown = triggerFolder.add(eventTrigger, "eventName", eventsList).name("Event");
        eventObjects = triggerFolder.add(eventTrigger, "associatedObjects").name("Associated Items");
        trigger = triggerFolder.add(eventTrigger, "triggerButton").name("Trigger Event");

        impacts = impacts.replace(/\s+/g, '');
        impacts = impacts.split(",");
        for(var agentName in agentsList) {
            console.log(agentName + ".addEvent(\"" + name + "\", [" + impacts + "]);")
            agentsList[agentName]["Engine"].addEvent(name, impacts);
        }
        swal("Event Added!","","success");
    }
    else{
        swal("Event name is either empty or is already in use.","","error");
    }
}


//Updates gui and associations on event trigger
function triggerEvent(eventName, objectsString) {
    if(eventName !== " ") {
        for (var agentName in agentsList) {
            var associations = objectsString.replace(/\s+/g, '');
            associations = associations.split(",");
            itemsList = pushArray(itemsList, associations);
            console.log(agentName + ".triggerEvent(\"" + eventName + "\", [" + associations + "]);");
            agentsList[agentName]["Engine"].triggerEvent(eventName, associations);
        }
        updateColors();
    }
    else {
        swal("Please choose an event", "", "error");
    }

    objectFolder.remove(objectAgent);
    objectFolder.remove(objectName);
    objectFolder.remove(objectButton);

    objectAgent = objectFolder.add(objects, "agentName", agentNames).name("Agent Name");
    objectName = objectFolder.add(objects, "objectName", itemsList).name("Object Name");
    objectButton = objectFolder.add(objects, "introduceButton").name("Introduce Object");
}



/*
 *
 * COLOR DETERMINATION FUNCTIONS
 *
 */

//Updates color of all agents on map
function updateColors() {
    for(var agentName in agentsList) {
        console.log(agentName + ".getState(); (For color updating)");
        var color = calculateColor(agentsList[agentName]["Engine"].getEmotions());
        agentsList[agentName]["Model"].material.color.set(color);
    }
}

//Calculates a color that is the average of all emotional colors felt, intensity alters brightness
function calculateColor(emotions) {
    var totalR = 0;
    var totalG = 0;
    var totalB = 0;
    var totalColors = 0;
    var colors = {"Joy":"#8f7700","Sad":"#05008f","Disappointment":"#00458F","Relief":"#8F008C","Hope":"#8F002B","Fear":"#5A8F00","Pride":"#8F3E00",
        "Shame":"#008f6b","Reproach":"#8F2D00","Admiration":"#58008F","Anger":"#8F0000", "Gratitude":"#00648F","Gratification":"#078F00","Remorse":"#4A008F"};

    for(var emotion in emotions) {
        if(emotions[emotion] > 0) {
            var color = colors[emotion];
            color = shadeColor(color, emotions[emotion]*30);
            totalR += color[0];
            totalG += color[1];
            totalB += color[2];
            totalColors++;
        }
    }

    var avgR = Math.round(totalR/totalColors);
    var avgG = Math.round(totalG/totalColors);
    var avgB = Math.round(totalB/totalColors);
    var colorString = "rgb(" + avgR.toString() + "," + avgG.toString() + "," + avgB.toString() + ")";
    var color = new THREE.Color(colorString);

    return color;
}

//Modified from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
//Changes brightness of color based on emotional intensity
function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    return [R, G, B];
}



/*
 *
 * INFORMATION OUTPUT FUNCTIONS
 *
 */

//Outputs requested info in popup
function outputInfo(agentName, infoType) {
    var title = agentName + "'s " + infoType;
    var message = "";

    switch(infoType) {
        case "Emotions":
            message = buildEmotionString(agentName);
            break;
        case "Goals":
            message = buildGoalsString(agentName);
            break;
        case "Events":
            message = buildEventsString(agentName);
            break;
        case "Motivations":
            message = buildMotivationsString(agentName);
            break;
        case "Associations":
            message = buildAssociationsString(agentName);
        default:
            swal("An unknown error occurred");
    }

    swal(title, message);
}


//Builds string for message on emotional info
function buildEmotionString(agentName) {
    console.log(agentName + ".getState(); (For popup display)");
    var emotions = agentsList[agentName]["Engine"].getEmotions();
    var message = "";

    for (var emotionName in emotions) {
        if (emotions.hasOwnProperty(emotionName)) {
            message += emotionName + ": " + emotions[emotionName].toFixed(2) + "\n";
        }
    }

    return message;
}


//Builds string for message on goals info
function buildGoalsString(agentName) {
    console.log(agentName + ".getGoals(); (For popup display)");
    var goals = agentsList[agentName]["Engine"].goals;
    var message = "";

    for (var goalName in goals) {
        if (goals.hasOwnProperty(goalName)) {
            message += goalName + " (Importance " + goals[goalName].toFixed(2) + ")\n";
        }
    }

    return message;
}


//Builds string for message on events info
function buildEventsString(agentName) {
    console.log(agentName + ".getEvents(); (For popup display)");
    var events = agentsList[agentName]["Engine"].events;
    var message = "";

    for (var eventName in events) {
        if (events.hasOwnProperty(eventName) && eventName !== "empty") {
            message += eventName.toUpperCase() + "\n\tExpectation: " + events[eventName]["Expectation"].toFixed(2)
                + "\n\tDesirability: " + events[eventName]["Desirability"].toFixed(2) + "\n\n";
        }
    }

    return message;
}


//Builds string for message on associations info
function buildAssociationsString(agentName) {
    console.log(agentName + ".getAssociations(); (For popup display)");
    var associations = agentsList[agentName]["Engine"].appraiser.associations;
    var message = "";

    for(var objectName in associations) {
        message += objectName + "\n";
        if(!(objectName === "")) {
        for(var emotionName in associations[objectName]) {
            var value = associations[objectName][emotionName]["Total"] / associations[objectName][emotionName]["Count"];
            value = value.toFixed(2);
            message += emotionName + ": " + value + "\n";

        }}
        message += "\n";
    }
    return message;
}


//Builds string for message on motivations info
function buildMotivationsString(agentName) {
    console.log(agentName + ".getMotivations(); (For popup display)");
    var motivations = agentsList[agentName]["Engine"].filter.motivations;
    var message = "STATE:\n";

    for(var motivationName in motivations) {
        if (motivations.hasOwnProperty(motivationName)) {
            message += motivationName + ": " + motivations[motivationName].toString() + "\n"
        }
    }
    message += "\nRULES:\n"

    console.log(agentName + ".getRules(); (For popup display)");
    var rules = agentsList[agentName]["Engine"].filter.rules;
    for(var ruleNum = 0; ruleNum < rules.length; ruleNum++) {
        var ruleText = rules[ruleNum].toString();
        ruleText = ruleText.replace(/,/g , " ");
        message += ruleText + "\n"
    }

    return message;
}