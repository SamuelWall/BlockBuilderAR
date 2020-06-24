//////////////////////////////
/////////GLOBAL SETUP/////////
//////////////////////////////

////MODULE IMPORTS
////////////////////////
import CANNON from 'cannon'
import CannonHelper from 'spark-ar-physics'
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


////SCENE OBJECTS
/////////////////////////
const root = Scene.root;    //Utility objects
const fd = Scene.root
    .child('Device')
    .child('Camera')
    .child('Focal Distance')
const canvas = fd.child('canvas0')
const planeTracker = root.child('planeTracker0')
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


const blockButton = canvas.child('blockButton');    //Buttons
const gravityButton = canvas.child('gravityButton');
const resetButton = canvas.child('resetButton');
const ballButton = canvas.child('ballButton');
const redButton = canvas.child('redButton')
const blueButton = canvas.child('blueButton')
const greenButton = canvas.child('greenButton')
const yellowButton = canvas.child('yellowButton')
const purpleButton = canvas.child('purpleButton')
const orangeButton = canvas.child('orangeButton')
const carButton = canvas.child('carButton');

const buttonsPlane = canvas.child('buttonsPlane')   //Button containers
const buttonsBorder = canvas.child('buttonsBorder')
const colorsPlane = canvas.child('colorsPlane')
const colorsBorder = canvas.child('colorsBorder')
const gravPlane = canvas.child('gravPlane')
const gravBorder = canvas.child('gravBorder')

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

var newestIndex = 0;   //Keep track of game states
var numBlock = 0;
var sphereIndex = -1;
var carIndex = -1;
var canShootSphere = false;
var canShootCar = false;

var floor;              //Physics vars
var gravity = true;
var gravitySignal = false;
var worldObjects = [];
var cannonHelper;

var loopTimeMs = 30;      //Timer vars
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
    newestIndex = 0;
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
    if (!gravity) {
        var block = blocks[bid - 1];
        var blockMesh = block.child('Cube')
        Patches.setPulseValue('reset', Reactive.once() )
        if (numBlock == bid) {
            numBlock = 0;

            redButton.hidden = true;
            blueButton.hidden = true;
            greenButton.hidden = true;
            yellowButton.hidden = true;
            purpleButton.hidden = true;
            orangeButton.hidden = true;
            colorsPlane.hidden = true;
            colorsBorder.hidden = true;


            blockMesh.material = mats[blockMat[bid - 1]]
            Patches.setScalarValue('numBlock', numBlock)

            block.transform.x = block.transform.x.pinLastValue()
            block.transform.y = block.transform.y.pinLastValue()
            block.transform.z = block.transform.z.pinLastValue()

        }
        else {
            Patches.setPulseValue('select', Reactive.once())
            if (numBlock != 0) {
                blocks[numBlock - 1].child("Cube").material = mats[blockMat[numBlock - 1]];
                blocks[numBlock - 1].transform.x = blocks[numBlock - 1].transform.x.pinLastValue()
                blocks[numBlock - 1].transform.y = blocks[numBlock - 1].transform.y.pinLastValue()
                blocks[numBlock - 1].transform.z = blocks[numBlock - 1].transform.z.pinLastValue()
            }
            redButton.hidden = false;
            blueButton.hidden = false;
            greenButton.hidden = false;
            yellowButton.hidden = false;
            purpleButton.hidden = false;
            orangeButton.hidden = false;
            colorsPlane.hidden = false;
            colorsBorder.hidden = false;


            block.worldTransform.position = blockPosObj.worldTransform.position

            numBlock = bid;
            blockMesh.material = selectedMats[blockMat[bid - 1]];
            Patches.setScalarValue('numBlock', numBlock)
        }
    }
}
function resetBlockPos() {   //resets positions to before gravity sim
    gravitySignal = false;
    gravity = true;

    for (var i = 1; i < blockPos.length + 1; i++) {
        worldObjects[i].physicsObject = initBlock(blockPos[i - 1])
    }

    cannonHelper = new CannonHelper(worldObjects)
}
function initBlock(position) {  //returns a physics object of a block at a passed in position
    var blockLength = 25;
    var blockBody = new CANNON.Body({
        mass: 0.2,
        position: position,
        shape: new CANNON.Box(new CANNON.Vec3(blockLength / 4, blockLength / 4, blockLength / 4))
    })

    return blockBody;
}
function makeBlock() {      //makes a new block, adds it to world objects, etc
    if (newestIndex < 15) {
        var sceneBlock = blocks[newestIndex];
        var Npos = new CANNON.Vec3(0, 0, 0)
        blockPos.push(Npos)                              //calculate position of new block and add to positions array
        var matIndex = Math.floor(Random.random() * mats.length);
        blockMat.push(matIndex)
        // make a physics object for the block
        worldObjects.push({ sceneObject: sceneBlock, physicsObject: initBlock(Npos) });    //add it to world objects
        touchBlock(newestIndex + 1);     //make the new block selected


        //updatePhysicsObjects(1);      // update physics hitboxes for all blocks
        sceneBlock.hidden = false;   //make visible
        newestIndex++;
        //gravity = true;

        //cannonHelper = new CannonHelper(worldObjects);   //reset cannonhelper with new world objects

    }
}


/////////////////////////////
////////BALL FUNCTIONS///////
/////////////////////////////
function initSphere(pos) {
    var sphereBody = new CANNON.Body({
        mass: 2, // kg
        position: pos,
        shape: new CANNON.Sphere(1)
    })
    return sphereBody;
}
function setupSphereRot() {
    sphere.worldTransform.position = posObject.worldTransform.position;
    if(ballTimeout != undefined)
        Time.clearTimeout(ballTimeout)
}
function setupSphere() {
    sphere.hidden = false;

    ballButton.material = selected_ball_mat;
    setupSphereRot();
    if (sphereIndex != -1) {
        worldObjects.splice(sphereIndex, 1);
        sphereIndex = -1;
        //setupSphereRot();
    }

    canShootSphere = true;

}
function fireSphere() {
    canShootSphere = false;
    //sphere2.hidden = false;
    var spherePos = new CANNON.Vec3(sphere.transform.x.pinLastValue(), sphere.transform.y.pinLastValue(), sphere.transform.z.pinLastValue());
    var cannonSphere = initSphere(spherePos);
    worldObjects.push({ sceneObject: sphere, physicsObject: cannonSphere })
    cannonHelper = new CannonHelper(worldObjects)
    sphereIndex = worldObjects.length - 1;

    //var camRotY = deviceWorldTransform.rotationY
    var sphereforceX = Reactive.sin(camRotY).pinLastValue() * Reactive.cos(camRotX).pinLastValue();
    var sphereforceZ = Reactive.cos(camRotY).pinLastValue() * Reactive.cos(camRotX).pinLastValue();
    var sphereforceY = Reactive.sin(camRotX).pinLastValue();

    var sphereForce = new CANNON.Vec3(sphereforceX * -500, sphereforceY * 500, sphereforceZ * -500)

    cannonSphere.applyLocalImpulse(sphereForce, spherePos)
    cannonSphere.angularVelocity = new CANNON.Vec3(0, 0, 0)
    ballTimeout = Time.setTimeout(function () { sphere.hidden = true}, 1500);

}


////////////////////////////
////////CAR FUNCTIONS///////
////////////////////////////

function initCar(carpos) {
    var carBody = new CANNON.Body({
        mass: 2, // kg
        position: carpos,
        shape: new CANNON.Sphere(40)
    })
    return carBody;
}
function setupCarPos() {
    var touchPos = Patches.getVectorValue('CarPosition');
    car.transform.x = touchPos.x;
    car.transform.y = touchPos.y
}
function setupCar() {
    carButton.material = selected_car_mat;
    carAnimation.hidden = false;
    car.transform.x = Reactive.val(0);
    car.transform.y = Reactive.val(0);
    car.transform.z = Reactive.val(60);



    if (carIndex != -1) {
        worldObjects.splice(carIndex, 1);
        carIndex = -1;
    }

    canShootCar = true;

}
function fireCar() {
    canShootCar = false;
    var carPos = new CANNON.Vec3(car.transform.x.lastValue, 470, car.transform.z.lastValue)
    //var spherePos = new CANNON.Vec3(sphere.transform.x.pinLastValue(), sphere.transform.y.pinLastValue(), sphere.transform.z.pinLastValue());
    var cannonCar = initCar(carPos);
    worldObjects.push({ sceneObject: car, physicsObject: cannonCar })
    cannonHelper = new CannonHelper(worldObjects)
    carIndex = worldObjects.length - 1;

    //var camRotY = deviceWorldTransform.rotationY


    var carForce = new CANNON.Vec3(0, 0, -500)

    cannonCar.applyLocalImpulse(carForce, carPos)
    // cannonSphere.angularVelocity = new CANNON.Vec3(0, 0, 0)
}



/////////////////////////////
////////TOUCH GESTURES///////
/////////////////////////////

TouchGestures.onPan().subscribe(function (gesture) {
    //moveBlock(numBlock- 1);
    setupCarPos();
});
TouchGestures.onTap(blockButton).subscribe(function (gesture) {
    if (!gravitySignal) {
        makeBlock();
        blockButton.material = selected_add_block_mat;
        Time.setTimeout(function () { blockButton.material = add_block_mat }, 125);
        //updatePhysicsObjects();
    }
});
TouchGestures.onTap(gravityButton).subscribe(function (e) {

    if (!gravitySignal) {
        if (numBlock != 0)
            touchBlock(numBlock)
        ballButton.hidden = false;
        carButton.hidden = false;
        gravPlane.hidden = false;
        gravBorder.hidden = false;
        gravityButton.material = gravity_inverse_mat;
        blockButton.material = selected_add_block_mat;
        updatePhysicsObjects();
        gravitySignal = true;
    }
    else {
        if (sphereIndex != -1)
            worldObjects.splice(sphereIndex, 1)
        sphereIndex = -1;
        setupSphereRot();
        canShootSphere = false;

        if (carIndex != -1)
            worldObjects.splice(carIndex, 1)
        carIndex = -1;
        carButton.material = car_mat;
        //carAnimation.hidden = true;
        canShootCar = false

        ballButton.hidden = true;
        carButton.hidden = true;
        gravPlane.hidden = true;
        gravBorder.hidden = true;
        sphere.hidden = true;
        carAnimation.hidden = true;
        ballButton.material = ball_mat;
        blockButton.material = add_block_mat;
        gravityButton.material = gravity_mat;

        resetBlockPos();
    }


})
TouchGestures.onTap(resetButton).subscribe(function (gesture) {
    resetButton.material = selected_reset_mat;
    Time.setTimeout(function () { resetButton.material = reset_mat }, 125);
    initWorld();



})

TouchGestures.onTap(ballButton).subscribe(function (gesture) {
    sphere.hidden = true;
    carAnimation.hidden = true;
    canShootCar = false;
    ballButton.material = selected_ball_mat;
    carButton.material = car_mat;

    if (carIndex != -1) {
        worldObjects.splice(carIndex, 1)
        carIndex = -1;
        //carAnimation.hidden = true;
    }

    if (gravity && !canShootSphere)
        setupSphere();

    else if (canShootSphere) {
        canShootSphere = false;
        sphere.hidden = true;
        ballButton.material = ball_mat;

    }
});
TouchGestures.onTap(carButton).subscribe(function (gesture) {
var carinst = true
    Patches.setBooleanValue('carinst', carinst)
    Patches.setPulseValue('carnoise', Reactive.once())
    carButton.material = selected_car_mat;
    sphere.hidden = true;
    carAnimation.hidden = true;
    canShootSphere = false;
    ballButton.material = ball_mat;

    if (sphereIndex != -1) {
        worldObjects.splice(sphereIndex, 1)
        sphereIndex = -1;
        //sphere.hidden = true;
        setupSphereRot();
        canShootSphere = false;

    }

    if (gravity && !canShootCar) {
        setupCar();
        //var touchPos = Patches.getVectorValue('CarPosition');
        //carAnim.transform.x = touchPos.x
        //carAnim.transform.z = touchPos.y
    }
    else if (canShootCar) {
        canShootCar = false;
        carAnimation.hidden = true;
        carButton.material = car_mat;
    }
});

TouchGestures.onTap().subscribe(function (gesture) {
    if (canShootSphere)
        fireSphere();
    else if (sphereIndex != -1) {
        setupSphere();
        Patches.setPulseValue('reload', Reactive.once())
    }
    else if (canShootCar) {
        fireCar();
        Patches.setPulseValue('acceleration', Reactive.once())
    }
    else if (carIndex != -1) {
        setupCar();
    }
});


TouchGestures.onTap(redButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 0;
        blocks[numBlock - 1].child('Cube').material = selectedMats[0];
        redButton.material = selected_red_mat;
        Time.setTimeout(function () { redButton.material = red_mat }, 125);
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
        blockMat[numBlock - 1] = 3;
        blocks[numBlock - 1].child('Cube').material = selectedMats[4];
        purpleButton.material = selected_purple_mat;
        Time.setTimeout(function () { purpleButton.material = purple_mat }, 125);
    }
});
TouchGestures.onTap(orangeButton).subscribe(function (gesture) {
    if (numBlock != 0) {
        blockMat[numBlock - 1] = 3;
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


Time.ms.interval(loopTimeMs).subscribe(function (elapsedTime) {
    if (lastTime !== undefined) {
        var deltaTime = (elapsedTime - lastTime) / 1000


        if (gravity) {
            cannonHelper.update(deltaTime)
        }

        gravity = gravitySignal;


    }

    lastTime = elapsedTime
})

initWorld();
