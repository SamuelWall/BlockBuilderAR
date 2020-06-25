//////////////////////////////
/////////GLOBAL SETUP/////////
//////////////////////////////

////MODULE IMPORTS
////////////////////////

const Diagnostics = require('Diagnostics')
const Instruction = require('Instruction')
const CameraInfo = require('CameraInfo')
const Scene = require('Scene')
const Time = require('Time')
const Materials = require('Materials');
const Reactive = require('Reactive');
const TouchGestures = require('TouchGestures')
const DeviceMotion = require('DeviceMotion');
const Patches = require('Patches');
const Random = require('Random');
import CANNON from 'cannon'
import CannonHelper from 'spark-ar-physics'

////SCENE OBJECTS
/////////////////////////
const root = Scene.root;    //Utility objects
const fd = Scene.root
    .child('Device')
    .child('Camera')
    .child('Focal Distance')
const planeTracker = root.child('planeTracker0')
const panel = planeTracker.child('panel')
const camera = root.child('Device').child('Camera');
const posObject = camera.child('positionObject')
const blockPosObj = camera.child('blockPositionObject')
const planeTrackObj = planeTracker.child('planePos')
const floorPlane = planeTracker.child('plane0')
const deviceWorldTransform = DeviceMotion.worldTransform;
var camPosX = deviceWorldTransform.position.x;
var camPosY = deviceWorldTransform.position.y;
var camPosZ = deviceWorldTransform.position.z;
var camRotX = deviceWorldTransform.rotationX;
var camRotY = deviceWorldTransform.rotationY;
var camRotZ = deviceWorldTransform.rotationZ;


const blockButton = panel.child('blockButton');    //Buttons
const gravityButton = panel.child('gravityButton');
const resetButton = panel.child('resetButton');
const ballButton = panel.child('ballButton');
const redButton = panel.child('redButton')
const blueButton = panel.child('blueButton')
const greenButton = panel.child('greenButton')
const yellowButton = panel.child('yellowButton')
const purpleButton = panel.child('purpleButton')
const orangeButton = panel.child('orangeButton')
const carButton = panel.child('carButton');

const buttonsPlane = panel.child('buttonsPlane')   //Button containers
const buttonsBorder = panel.child('buttonsBorder')
const colorsPlane = panel.child('colorsPlane')
const colorsBorder = panel.child('colorsBorder')
const gravPlane = panel.child('gravPlane')
const gravBorder = panel.child('gravBorder')

const sphere = planeTracker.child('Sphere')
const car = planeTracker.child("car");   //Destruction objects
const carAnimation = planeTracker.child('carAnimation');


const block1 = planeTracker.child('Block1')   //Blocks
const block2 = planeTracker.child('Block2')
const block3 = planeTracker.child('Block3')
const block4 = planeTracker.child('Block4')
const block5 = planeTracker.child('Block5')
const block6 = planeTracker.child('Block6')
const block7 = planeTracker.child('Block7')
const block8 = planeTracker.child('Block8')
const block9 = planeTracker.child('Block9')
const block10 = planeTracker.child('Block10')
const block11 = planeTracker.child('Block11')
const block12 = planeTracker.child('Block12')
const block13 = planeTracker.child('Block13')
const block14 = planeTracker.child('Block14')
const block15 = planeTracker.child('Block15')


////OBJECT MATERIALS
/////////////////////
const add_block_mat = Materials.get('mat16')      //Buttons
const gravity_mat = Materials.get('gravityBut_mat');
const reset_mat = Materials.get('floor');
const car_mat = Materials.get('car_button_mat');
const ball_mat = Materials.get('ball_button_mat');
const red_mat = Materials.get('red_button_mat');
const orange_mat = Materials.get('orange_button_mat');
const yellow_mat = Materials.get('yellow_button_mat');
const green_mat = Materials.get('green_button_mat');
const blue_mat = Materials.get('blue_button_mat');
const purple_mat = Materials.get('purple_button_mat');

const selected_add_block_mat = Materials.get('selected_add_block_mat');  //Selected buttons
const gravity_inverse_mat = Materials.get('gravity_inverse_mat');
const selected_reset_mat = Materials.get('selected_reset_mat');
const selected_car_mat = Materials.get('selected_car_mat');
const selected_ball_mat = Materials.get('selected_ball_mat');
const selected_red_mat = Materials.get('selected_red_mat');
const selected_orange_mat = Materials.get('selected_orange_mat');
const selected_yellow_mat = Materials.get('selected_yellow_mat');
const selected_green_mat = Materials.get('selected_green_mat');
const selected_blue_mat = Materials.get('selected_blue_mat');
const selected_purple_mat = Materials.get('selected_purple_mat');

const block_red = Materials.get('Block_mat_red');      //Block materials
const block_orange = Materials.get('Block_mat_orange');
const block_yellow = Materials.get('Block_mat_yellow');
const block_green = Materials.get('Block_mat_green');
const block_blue = Materials.get('Block_mat_blue');
const block_purple = Materials.get('Block_mat_purple');

const selected_red = Materials.get('Selected_mat_red');   //Selected block mats
const selected_orange = Materials.get('Selected_mat_orange');
const selected_yellow = Materials.get('Selected_mat_yellow');
const selected_green = Materials.get('Selected_mat_green');
const selected_blue = Materials.get('Selected_mat_blue');
const selected_purple = Materials.get('Selected_mat_purple');


////GLOBAL VARS
/////////////////

var blocks = [block1, block2, block3, block4, block5, block6, block7, block8, block9, block10, block11, block12, block13, block14, block15];
var mats = [block_red, block_orange, block_yellow, block_green, block_blue, block_purple];
var selectedMats = [selected_red, selected_orange, selected_yellow, selected_green, selected_blue, selected_purple];    //Arrays of assets

var blockPos = [];    //Store block materials and positions
var blockMat = [];

var mostRecent = 0;   //Keep track of game states
var numBlock = 0;
var sphereIndex = -1;
var carIndex = -1;
var canShootSphere = false;
var canShootCar = false;
const blockLimit = 15;

var floor;              //Physics vars
var gravity = true;
var gravitySignal = false;
var worldObjects = [];
var cannonHelper;

const loopTimeMs = 30;      //Timer vars
var lastTime;
var updateTimer;
var ballTimeout;


////MISC SETUP
/////////////////

carAnimation.transform.x = car.transform.x;
carAnimation.transform.z = car.transform.z;
Instruction.bind(CameraInfo.captureDevicePosition.eq(CameraInfo.CameraPosition.FRONT), 'flip_camera')



//////////////////////////////
////////GAME FUNCTIONS////////
//////////////////////////////


function initWorld() {
    ////INITIALIZES GAME STATE
    //////////////////////////

    gravitySignal = false;   //Sentinel value turns off gravity after one frame
    gravity = true;          //Turn on gravity

    gravityButton.material = gravity_mat; //Reset button materials
    ballButton.material = ball_mat;
    ballButton.material = ball_mat;
    carButton.material = car_mat;

    sphere.hidden = true;    //Hide destruction objects and some buttons
    carAnimation.hidden = true;
    carButton.hidden = true;
    ballButton.hidden = true;
    redButton.hidden = true;
    blueButton.hidden = true;
    greenButton.hidden = true;
    yellowButton.hidden = true;
    purpleButton.hidden = true;
    orangeButton.hidden = true;
    colorsPlane.hidden = true;
    colorsBorder.hidden = true;
    gravPlane.hidden = true;
    gravBorder.hidden = true;

    canShootSphere = false;   //Disable destruction objects
    canShootCar = false;

    blockPos = [];    //Reset block states and hide them
    blockMat = [];
    numBlock = 0;
    mostRecent = 0;
    for (var b in blocks) {
        blocks[b].hidden = true;
    }

    floor = CannonHelper.makeFloor();     //Initialize base physics objects
    worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }];
    sphereIndex = -1;
    carIndex = -1;
    cannonHelper = new CannonHelper(worldObjects);
}
function updatePhysicsObjects(cutOff = 0) {
    /////UPDATES PHYSICS OBJECTS TO SCENE POSITIONS
    ///////////////////////////////////////////////

    for (var b = 0; b < blockPos.length - cutOff; b++) {
        var block = blocks[b];
        blockPos[b] = new CANNON.Vec3(block.transform.x.lastValue, block.transform.y.lastValue, block.transform.z.lastValue)  //Update each block's position
        worldObjects[b + 1].physicsObject = initBlock(blockPos[b])  //Update physics array
        cannonHelper = new CannonHelper(worldObjects)          //Reset the physics class
    }
}



//////////////////////////////
////////BLOCK FUNCTIONS///////
//////////////////////////////

function touchBlock(bid) {
    ////CHANGE MATERIAL AND SETUP MOVEMENT ON TOUCH
    //////////////////////////////////////////////
    if (!gravity) {   //If gravity is inactive
        var block = blocks[bid - 1];
        var blockMesh = block.child('Cube')
        Patches.setPulseValue('place', Reactive.once() )   //Trigger sound
        if (numBlock == bid) {  //If the block being tapped is already selected
            numBlock = 0;             //Change the current block variable
            blockMesh.material = mats[blockMat[bid - 1]]  //Change the material
            Patches.setScalarValue('numBlock', numBlock)
            redButton.hidden = true;
            blueButton.hidden = true;
            greenButton.hidden = true;  //Hide color options
            yellowButton.hidden = true;
            purpleButton.hidden = true;
            orangeButton.hidden = true;
            colorsPlane.hidden = true;
            colorsBorder.hidden = true;

            block.transform.x = block.transform.x.pinLastValue()  //Stop moving block
            block.transform.y = block.transform.y.pinLastValue()
            block.transform.z = block.transform.z.pinLastValue()

        }
        else {
            Patches.setPulseValue('select', Reactive.once())  //Trigger sound
            if (numBlock != 0) {
                blocks[numBlock - 1].child("Cube").material = mats[blockMat[numBlock - 1]];   //Deselect the currently selected cube if one is already selected
                blocks[numBlock - 1].transform.x = blocks[numBlock - 1].transform.x.pinLastValue()
                blocks[numBlock - 1].transform.y = blocks[numBlock - 1].transform.y.pinLastValue()
                blocks[numBlock - 1].transform.z = blocks[numBlock - 1].transform.z.pinLastValue()
            }

            numBlock = bid;
            blockMesh.material = selectedMats[blockMat[bid - 1]];  //Change block var and material
            Patches.setScalarValue('numBlock', numBlock)

            redButton.hidden = false;
            blueButton.hidden = false;
            greenButton.hidden = false;  //Show color options
            yellowButton.hidden = false;
            purpleButton.hidden = false;
            orangeButton.hidden = false;
            colorsPlane.hidden = false;
            colorsBorder.hidden = false;


            block.worldTransform.position = blockPosObj.worldTransform.position  //Block follows object that is pinned to camera
        }
    }
}

function resetBlockPos() {
    ////RESETS BLOCK POSITIONS TO BEFORE GRAVITY SIM
    ////////////////////////////////////////////////

    gravity = true;
    gravitySignal = false;  //Sentinel will turn off gravity after one frame (to allow blocks to reset to proper positions)


    for (var i = 1; i < blockPos.length + 1; i++) {
        worldObjects[i].physicsObject = initBlock(blockPos[i - 1])   //Reset physics objects associated with scene objects
    }

    cannonHelper = new CannonHelper(worldObjects)  //Reinitialize the physics helper object
}

function initBlock(position) {
    ////RETURNS A PHYSICS OBJECT FOR A NEW BLOCK
    ////////////////////////////////////////////
    var blockLength = 12.5;
    var blockBody = new CANNON.Body({ //new physics object with the following attributes
        mass: 0.2,
        position: position,
        shape: new CANNON.Box(new CANNON.Vec3(blockLength / 2, blockLength / 2, blockLength / 2))
    })

    return blockBody;
}
function makeBlock() {
    ////CREATES A NEW BLOCK
    /////////////////////////

    if (mostRecent < blockLimit) {
        var sceneBlock = blocks[mostRecent];  //get the new block
        var Npos = new CANNON.Vec3(0, 0, 0)
        blockPos.push(Npos)                              //add a position to the positions array
        var matIndex = Math.floor(Random.random() * mats.length);  //
        blockMat.push(matIndex)
        // make a physics object for the block
        worldObjects.push({ sceneObject: sceneBlock, physicsObject: initBlock(Npos) });    //add it to world objects
        touchBlock(mostRecent + 1);     //make the new block selected


        //updatePhysicsObjects(1);      // update physics hitboxes for all blocks
        sceneBlock.hidden = false;   //make visible
        mostRecent++;
        //gravity = true;

        //cannonHelper = new CannonHelper(worldObjects);   //reset cannonhelper with new world objects

    }
}


/////////////////////////////
////////BALL FUNCTIONS///////
/////////////////////////////
function initSphere(pos) {
    ////RETURNS A PHYSICS OBJECT FOR A NEW BALL
    ////////////////////////////////////////////

    var sphereBody = new CANNON.Body({ //new physics object with the following attributes
        mass: 2,
        position: pos,
        shape: new CANNON.Sphere(1)
    })
    return sphereBody;
}

function setupSphereRot() {
    ////MAKE SPHERE FOLLOW CAMERA
    /////////////////////////////

    sphere.worldTransform.position = posObject.worldTransform.position; //Set pos of sphere to pos of object pinned to cam
    if(ballTimeout != undefined)  //Clear ball hide timeout
        Time.clearTimeout(ballTimeout)
}

function setupSphere() {
    ////GET BALL READY TO FIRE
    //////////////////////////

    sphere.hidden = false;
    ballButton.material = selected_ball_mat;
    setupSphereRot();  //Make the ball follow the cam
    if (sphereIndex != -1) {  //If the ball already exists as a physics object, delete it
        worldObjects.splice(sphereIndex, 1);
        sphereIndex = -1;
    }

    canShootSphere = true;
}

function fireSphere() {
    ////SHOOT THE BALL
    //////////////////

    canShootSphere = false;  //Dont let it shoot twice
    var spherePos = new CANNON.Vec3(sphere.transform.x.pinLastValue(), sphere.transform.y.pinLastValue(), sphere.transform.z.pinLastValue());
    var cannonSphere = initSphere(spherePos);   //Make a new physics object at the correct position
    worldObjects.push({ sceneObject: sphere, physicsObject: cannonSphere }) //Add it to the other physics objects
    cannonHelper = new CannonHelper(worldObjects)
    sphereIndex = worldObjects.length - 1;  //Remember the index of the sphere in the physics object array

    var sphereforceX = Reactive.sin(camRotY).pinLastValue() * Reactive.cos(camRotX).pinLastValue();  //Calculate the force vector
    var sphereforceZ = Reactive.cos(camRotY).pinLastValue() * Reactive.cos(camRotX).pinLastValue();
    var sphereforceY = Reactive.sin(camRotX).pinLastValue();

    var sphereForce = new CANNON.Vec3(sphereforceX * -500, sphereforceY * 500, sphereforceZ * -500)  //Apply it
    cannonSphere.applyLocalImpulse(sphereForce, spherePos)
    cannonSphere.angularVelocity = new CANNON.Vec3(0, 0, 0)  //Stop spin

    ballTimeout = Time.setTimeout(function () { sphere.hidden = true}, 1500);  //Hide the ball after 1.5 seconds
}

////////////////////////////
////////CAR FUNCTIONS///////
////////////////////////////

function initCar(carpos) {
    ////RETURNS A PHYSICS OBJECT FOR A NEW CAR
    ////////////////////////////////////////////

    var carBody = new CANNON.Body({  //new physics object with the following attributes
        mass: 2, // kg
        position: carpos,
        shape: new CANNON.Sphere(40)
    })
    return carBody;
}

function setupCarPos() {
    ////MOVE THE CAR
    /////////////////
    var touchPos = Patches.getVectorValue('CarPosition');
    car.transform.x = touchPos.x;
    car.transform.z = touchPos.y
}

function setupCar() {
    ////GET CAR READY TO FIRE
    /////////////////////////

    carButton.material = selected_car_mat;
    carAnimation.hidden = false;
    car.transform.x = Reactive.val(0);
    car.transform.y = Reactive.val(0);
    car.transform.z = Reactive.val(60);   //Initialize pos to (0,0,60)

    if (carIndex != -1) {  //If the car physics object already exists, delete it
        worldObjects.splice(carIndex, 1);
        carIndex = -1;
    }
    canShootCar = true;
}

function fireCar() {
    ////SHOOT THE CAR
    /////////////////

    canShootCar = false;  //Don't let the car fire twice
    var carPos = new CANNON.Vec3(car.transform.x.lastValue, 41, car.transform.z.lastValue)
    var cannonCar = initCar(carPos);  //Make a new physics object at the correct position
    worldObjects.push({ sceneObject: car, physicsObject: cannonCar })
    carIndex = worldObjects.length - 1;  //Remember the index of the sphere in the physics object array
    cannonHelper = new CannonHelper(worldObjects)


    var carForce = new CANNON.Vec3(0, 0, -500)
    cannonCar.applyLocalImpulse(carForce, carPos)  //Add a forward force
}



/////////////////////////////
////////TOUCH GESTURES///////
/////////////////////////////


TouchGestures.onPan().subscribe(function (gesture) {
    ////MOVE CAR ON PAN
    ///////////////////

    setupCarPos();
});


TouchGestures.onTap(blockButton).subscribe(function (gesture) {
    ////TAP THE NEW BLOCK BUTTON
    ////////////////////////////

    if (!gravitySignal) {  //If gravity is off
        makeBlock();       //Make a new block
        blockButton.material = selected_add_block_mat;   //Change the button to clicked mat
        Time.setTimeout(function () { blockButton.material = add_block_mat }, 125); //Change it back after .125 seconds
    }
});

TouchGestures.onTap(gravityButton).subscribe(function (e) {
    ////TAP THE GRAVITY BUTTON
    //////////////////////////

    if (!gravitySignal) { //If gravity is off (turn it on)
        ballButton.hidden = false;  //Show the relevant buttons
        carButton.hidden = false;
        gravPlane.hidden = false;
        gravBorder.hidden = false;
        gravityButton.material = gravity_inverse_mat;
        blockButton.material = selected_add_block_mat;

        if (numBlock != 0)  //If a block is selected, unselect it
            touchBlock(numBlock)

        updatePhysicsObjects(); //Update the block physics objects to the scene positions
        gravitySignal = true;  //Turn on gravity
    }
    else {  //If gravity is on (turn it off)
        if (sphereIndex != -1)
            worldObjects.splice(sphereIndex, 1)  //Remove the sphere if it exists
        sphereIndex = -1;
        setupSphereRot();  //Bring the sphere back in case it has been shot
        canShootSphere = false;

        if (carIndex != -1)   //Do the same with the car
            worldObjects.splice(carIndex, 1)
        carIndex = -1;
        carButton.material = car_mat;
        canShootCar = false

        ballButton.hidden = true;  //Hide the buttons and destruction objects
        carButton.hidden = true;
        gravPlane.hidden = true;
        gravBorder.hidden = true;
        sphere.hidden = true;
        carAnimation.hidden = true;

        ballButton.material = ball_mat;   //Make the button materials not clicked
        blockButton.material = add_block_mat;
        gravityButton.material = gravity_mat;

        resetBlockPos(); //Reset the block positions to what they were before gravity
    }
})

TouchGestures.onTap(resetButton).subscribe(function (gesture) {
    ////TAP THE RESET BUTTON
    ////////////////////////

    resetButton.material = selected_reset_mat;  //Change the button mat to clicked
    Time.setTimeout(function () { resetButton.material = reset_mat }, 125); //Change it back later
    initWorld();  //Reset to a blank world
})

TouchGestures.onTap(ballButton).subscribe(function (gesture) {
    ////TAP THE SHOOT BALL BUTTON
    /////////////////////////////
    sphere.hidden = true;    //Hide the sphere in case it's already shown
    carAnimation.hidden = true;  //Hide the car and disable it
    canShootCar = false;
    ballButton.material = selected_ball_mat; //Change the ball button to clicked
    carButton.material = car_mat;    //Unselect the car button

    if (carIndex != -1) {   //If the car exists, remove it
        worldObjects.splice(carIndex, 1)
        carIndex = -1;
        //carAnimation.hidden = true;
    }

    if (gravity && !canShootSphere)  // Setup the ball if not done yet
        setupSphere();

    else if (canShootSphere) {  //Remove the ball if clicked again
        canShootSphere = false; //And don't let it fire
        sphere.hidden = true;
        ballButton.material = ball_mat;

    }
});
TouchGestures.onTap(carButton).subscribe(function (gesture) {
    ////TAP THE CAR BUTTON
    //////////////////////

    var carinst = true
    Patches.setBooleanValue('carinst', carinst)

    carButton.material = selected_car_mat;  //Change the car button to clicked
    ballButton.material = ball_mat; //Change the ball button to unclicked

    sphere.hidden = true;        //Hide the ball
    carAnimation.hidden = true;  //Hide the car in case its already shown
    canShootSphere = false;    //Disable the ball


    if (sphereIndex != -1) {   //If the ball exists remove it
        worldObjects.splice(sphereIndex, 1)
        sphereIndex = -1;
        //sphere.hidden = true;
        setupSphereRot();   //Bring it back in case it's been shot
    }

    if (gravity && !canShootCar) { //Set up the car if it hasn't been yet
        setupCar();
        Patches.setPulseValue('carnoise', Reactive.once())

    }
    else if (canShootCar) {  //Remove the car if clicked again
        canShootCar = false;
        carAnimation.hidden = true;
        carButton.material = car_mat;
    }
});

TouchGestures.onTap().subscribe(function (gesture) {
    ////TAP ON THE SCREEN
    /////////////////////

    if (canShootSphere) {
        fireSphere();  //Fire the ball
        Patches.setPulseValue('wooshtrig', Reactive.once())
    }
    else if (sphereIndex != -1) {
        setupSphere();  //If the ball exists already reset it
        Patches.setPulseValue('reload', Reactive.once()) //Play the sound
    }
    else if (canShootCar) {
        fireCar();  //Fire the car
        Patches.setPulseValue('acceleration', Reactive.once())  //Play the sound
    }
    else if (carIndex != -1) {  //If the car exists already reset it
        setupCar();
    }
});

////TAP ON THE COLOR BUTTONS
////////////////////////////
TouchGestures.onTap(redButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 0;  //Change the saved mat for that block
        blocks[numBlock - 1].child('Cube').material = selectedMats[0];  //Change its material
        redButton.material = selected_red_mat;    //Set the color button to selected
        Time.setTimeout(function () { redButton.material = red_mat }, 125); //Change it back later
    }

});
TouchGestures.onTap(blueButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 1;
        blocks[numBlock - 1].child('Cube').material = selectedMats[1];
        blueButton.material = selected_blue_mat;
        Time.setTimeout(function () { blueButton.material = blue_mat }, 125);
    }
});
TouchGestures.onTap(greenButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 2;
        blocks[numBlock - 1].child('Cube').material = selectedMats[2];
        greenButton.material = selected_green_mat;
        Time.setTimeout(function () { greenButton.material = green_mat }, 125);
    }
});
TouchGestures.onTap(yellowButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 3;
        blocks[numBlock - 1].child('Cube').material = selectedMats[3];
        yellowButton.material = selected_yellow_mat;
        Time.setTimeout(function () { yellowButton.material = yellow_mat }, 125);
    }
});
TouchGestures.onTap(purpleButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 4;
        blocks[numBlock - 1].child('Cube').material = selectedMats[4];
        purpleButton.material = selected_purple_mat;
        Time.setTimeout(function () { purpleButton.material = purple_mat }, 125);
    }
});
TouchGestures.onTap(orangeButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 5;
        blocks[numBlock - 1].child('Cube').material = selectedMats[5];
        orangeButton.material = selected_orange_mat;
        Time.setTimeout(function () { orangeButton.material = orange_mat }, 125);
    }
});
/*
for(var i = 0; i < blocks.length; i++){
  //var block = blocks[i];
  TouchGestures.onTap(blocks[i]).subscribe(function (gesture) {
          touchBlock(i+1);
  });
}
*/

////TAP GESTURE FOR EACH BLOCK
//////////////////////////////
TouchGestures.onTap(blocks[0]).subscribe(function (gesture) {
    touchBlock(1);
});
TouchGestures.onTap(blocks[1]).subscribe(function (gesture) {
    touchBlock(2);
});
TouchGestures.onTap(blocks[2]).subscribe(function (gesture) {
    touchBlock(3);
});
TouchGestures.onTap(blocks[3]).subscribe(function (gesture) {
    touchBlock(4);
});
TouchGestures.onTap(blocks[4]).subscribe(function (gesture) {
    touchBlock(5);
});
TouchGestures.onTap(blocks[5]).subscribe(function (gesture) {
    touchBlock(6);
});
TouchGestures.onTap(blocks[6]).subscribe(function (gesture) {
    touchBlock(7);
});
TouchGestures.onTap(blocks[7]).subscribe(function (gesture) {
    touchBlock(8);
});
TouchGestures.onTap(blocks[8]).subscribe(function (gesture) {
    touchBlock(9);
});
TouchGestures.onTap(blocks[9]).subscribe(function (gesture) {
    touchBlock(10);
});
TouchGestures.onTap(blocks[10]).subscribe(function (gesture) {
    touchBlock(11);
});
TouchGestures.onTap(blocks[11]).subscribe(function (gesture) {
    touchBlock(12);
});
TouchGestures.onTap(blocks[12]).subscribe(function (gesture) {
    touchBlock(13);
});
TouchGestures.onTap(blocks[13]).subscribe(function (gesture) {
    touchBlock(14);
});
TouchGestures.onTap(blocks[14]).subscribe(function (gesture) {
    touchBlock(15);
});

////PHYSICS UPDATE LOOP
///////////////////////
Time.ms.interval(loopTimeMs).subscribe(function (elapsedTime) {
    if (lastTime !== undefined) {
        var deltaTime = (elapsedTime - lastTime) / 1000


        if (gravity) {  //Update if gravity is on
            cannonHelper.update(deltaTime)
        }

        gravity = gravitySignal;  //Turn off gravity if gravity signal is off


    }

    lastTime = elapsedTime  //Time logic
})

initWorld();  //Setup the world and get started!
