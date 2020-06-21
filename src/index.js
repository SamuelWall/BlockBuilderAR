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



const root = Scene.root;
const fd = Scene.root
  .child('Device')
  .child('Camera')
  .child('Focal Distance')

var canvas = fd.child('canvas0')
const planeTracker = root.child('planeTracker0')
const camera = root.child('Device').child('Camera');
const blockButton = canvas.child('blockButton');
const gravityButton = canvas.child('gravityButton');
const resetButton = canvas.child('resetButton');
const ballButton = canvas.child('ballButton');
const redButton = canvas.child('redButton')
const blueButton = canvas.child('blueButton')
const greenButton = canvas.child('greenButton')
const yellowButton = canvas.child('yellowButton')
const carButton = canvas.child('carButton');

redButton.hidden = true;
blueButton.hidden = true;
greenButton.hidden = true;
yellowButton.hidden = true;


const deviceWorldTransform = DeviceMotion.worldTransform;

const block_red = Materials.get('Block_mat_red');
const block_blue = Materials.get('Block_mat_blue');
const block_green = Materials.get('Block_mat_green');
const block_yellow = Materials.get('Block_mat_yellow');
var mats = [block_red, block_blue, block_green, block_yellow]

const selected_red = Materials.get('Selected_mat_red');
const selected_blue = Materials.get('Selected_mat_blue');
const selected_green = Materials.get('Selected_mat_green');
const selected_yellow = Materials.get('Selected_mat_yellow');
var selectedMats = [selected_red, selected_blue, selected_green, selected_yellow]

const add_block_mat = Materials.get('mat16')
const selected_add_block_mat = Materials.get('selected_add_block_mat');

const red_mat = Materials.get('red_button_mat');
const selected_red_mat = Materials.get('selected_red_mat');

const blue_mat = Materials.get('blue_button_mat');
const selected_blue_mat = Materials.get('selected_blue_mat');

const green_mat = Materials.get('green_button_mat');
const selected_green_mat = Materials.get('selected_green_mat');

const yellow_mat = Materials.get('yellow_button_mat');
const selected_yellow_mat = Materials.get('selected_yellow_mat');

const gravity_mat = Materials.get('gravityBut_mat');
const gravity_inverse_mat = Materials.get('gravity_inverse_mat');

const reset_mat = Materials.get('floor');
const selected_reset_mat = Materials.get('selected_reset_mat');

const car_mat = Materials.get('car_button_mat');
const selected_car_mat = Materials.get('selected_car_mat');

const ball_mat = Materials.get('ball_button_mat');
const selected_ball_mat = Materials.get('selected_ball_mat');

const car = planeTracker.child("car");

const carAnimation = planeTracker.child('carAnimation');
carButton.hidden = true;

carAnimation.transform.x = car.transform.x;
carAnimation.transform.z = car.transform.z;
carAnimation.hidden = true;

//projectile
const sphere = planeTracker.child('Sphere')
//const sphere2 = planeTracker.child('Sphere0')
sphere.hidden = true;

//var cameraPosX = deviceWorldTransform.x; //may not work
//var cameraPosY = deviceWorldTransform.y;
//var cameraPosZ = deviceWorldTransform.z;
var devicePosX = deviceWorldTransform.position.x;
var devicePosY = deviceWorldTransform.position.y;
var devicePosZ = deviceWorldTransform.position.z;
//device rotation
var camRotX = deviceWorldTransform.rotationX;
var camRotY = deviceWorldTransform.rotationY;
var camRotZ = deviceWorldTransform.rotationZ;

var pointSig = Patches.getPointValue('zeroPointSignal')
Diagnostics.log(pointSig.x.lastValue,pointSig.y.lastValue,pointSig.z.lastValue)
/*function setupSphereRot(){
    //projectile transform

    var sphereDistance = 1;
    // x position of cube orbit
    var spherePosX = Reactive.mul(Reactive.mul(sphereDistance, Reactive.sin(camRotY)),Reactive.cos(camRotX));
    // y position of cube orbit + offset
    //var spherePosY = Reactive.add(Reactive.mul(sphereDistance, Reactive.sin(camRotX)), .5);
    var spherePosY = Reactive.mul(sphereDistance, Reactive.sin(camRotX));
    //var spherePosY = Reactive.mul(sphereDistance + .5, Reactive.sin(camRotX));
    // z position of cube orbit
    var spherePosZ = Reactive.mul(Reactive.mul(sphereDistance, Reactive.cos(camRotY)),Reactive.cos(camRotX));

    // adjusting for difference in coordinates
    var resetZ = Reactive.mul(100,Reactive.add(1.7, devicePosZ));
    // orbit position + offset from device position if z > 1
    //var newSpherePosX = Reactive.add(Reactive.neg(spherePosX), cameraPosX);
    //var newSpherePosY = Reactive.add(spherePosY, cameraPosY);
    //if z > 0
    //var newSpherePosZ = Reactive.add(Reactive.neg(spherePosZ), resetZ);
    var newSpherePosX = Reactive.add(Reactive.neg(Reactive.mul(spherePosX,100)), Reactive.mul(100,devicePosX));
    var newSpherePosY = Reactive.add(Reactive.mul(spherePosY,100), Reactive.mul(100,Reactive.add(devicePosY, .5)));
    //if z > 0
    var newSpherePosZ = Reactive.add(Reactive.add(Reactive.neg(Reactive.mul(spherePosZ,100)), resetZ), -40);
    //if z = 0
    //var newzn = Reactive.add(spherePosZ, resetZ);
    //hides cube/cube2 if (cube > 0)/(cube2 < 3)
    //setting cube transforms
    sphere.transform.x = newSpherePosX//.mul(100);
    sphere.transform.y = newSpherePosY//.mul(100);
    sphere.transform.z = newSpherePosZ//.mul(100);
}*/
var canShootSphere = false;
//setupSphereRot();

function setupCarPos() {

    var touchPos = Patches.getVectorValue('CarPosition');


    // Get the angle of the camera
  //  var yRot = deviceWorldTransform.rotationY;

    //var NewXPos =  Reactive.mul(Reactive.cos(yRot), touchPos.x);



   car.transform.x = touchPos.x;

}
var canShootCar = false;


import CANNON from 'cannon'
import CannonHelper from 'spark-ar-physics'
Instruction.bind(CameraInfo.captureDevicePosition.eq(CameraInfo.CameraPosition.FRONT), 'flip_camera')

var posObject = camera.child('positionObject')
var planeTrackObj = planeTracker.child('planePos')
var floorPlane = planeTracker.child('plane0')
var block1 = planeTracker.child('Block1')
var block2 = planeTracker.child('Block2')
var block3 = planeTracker.child('Block3')
var block4 = planeTracker.child('Block4')
var block5 = planeTracker.child('Block5')
var block6 = planeTracker.child('Block6')
var block7 = planeTracker.child('Block7')
var block8 = planeTracker.child('Block8')
var block9 = planeTracker.child('Block9')
var block10 = planeTracker.child('Block10')
var block11 = planeTracker.child('Block11')
var block12 = planeTracker.child('Block12')
var block13 = planeTracker.child('Block13')
var block14 = planeTracker.child('Block14')
var block15 = planeTracker.child('Block15')

var blocks = [block1, block2, block3, block4, block5, block6, block7, block8, block9, block10, block11, block12, block13, block14, block15]
var newestIndex = 0;
var blockPos = [];
var blockMat = [];

//var touchPos = Reactive.vector(Reactive.val(0),Reactive.val(0),Reactive.val(0))

var numBlock = 0;
var sphereIndex = -1;
var carIndex = -1;

var worldObjects = [];
var floor;
var gravity = true;
var gravitySignal = false;

var cannonHelper;
var loopTimeMs = 30;
var lastTime;

var updateTimer;

function initWorld(){     //resets world objects and makes them all hidden
    gravitySignal = false;
    gravity = true;

    gravityButton.material = gravity_mat;
    ballButton.material = ball_mat;
    carButton.material = car_mat;
    carButton.hidden = true;
    ballButton.hidden = true;
    floor = CannonHelper.makeFloor();

    worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }];
    canShootSphere = false;
    canShootCar = false;
    sphere.hidden = true;
    carAnimation.hidden = true;
    redButton.hidden = true;
    blueButton.hidden = true;
    greenButton.hidden = true;
    yellowButton.hidden = true;
    ballButton.material = ball_mat;
    carButton.material = car_mat;
    sphereIndex = -1;
    carIndex = -1;
    blockPos = [];
    blockMat = [];
    numBlock = 0;
    newestIndex = 0;
    for (var b in blocks){
        blocks[b].hidden = true;
    }
    cannonHelper = new CannonHelper(worldObjects);
}
function updatePhysicsObjects(cutOff = 0){    //Updates the positions of the block physics objects (hitboxes)
    for (var b = 0; b < blockPos.length-cutOff; b++){
        var block = blocks[b];
        blockPos[b] = new CANNON.Vec3(block.transform.x.lastValue, block.transform.y.lastValue, block.transform.z.lastValue)
        worldObjects[b+1].physicsObject = initBlock(blockPos[b])

        cannonHelper = new CannonHelper(worldObjects)


    }
}
function resetBlockPos(){   //resets positions to before gravity sim
    gravitySignal = false;
    gravity = true;

    for(var i = 1; i < blockPos.length + 1; i++){
        worldObjects[i].physicsObject = initBlock(blockPos[i-1])
    }

    cannonHelper = new CannonHelper(worldObjects)
}
function initBlock(position) {  //returns a physics object of a block at a passed in position
    var blockLength = 25;
    var blockBody = new CANNON.Body({
        mass: 0.2,
        position: position,
        shape: new CANNON.Box(new CANNON.Vec3(blockLength/4, blockLength/4, blockLength/4))
    })

  return blockBody;
}
var newBlockPosX;
var newBlockPosY;
var newBlockPosZ;
//var lastCamRotX;
var lastCamRotY;
var lastCamRotZ;


function makeBlock(){      //makes a new block, adds it to world objects, etc
    if(newestIndex < 15){
        var sceneBlock = blocks[newestIndex];

        lastCamRotY = camRotY.lastValue
        lastCamRotZ = camRotZ.lastValue
        var pseudoRadius = 150;
        var offsetX = (devicePosX.lastValue/2) * 100;
        newBlockPosX = (-pseudoRadius*Math.sin(lastCamRotY)+(devicePosX.lastValue*pseudoRadius)) - offsetX;
        newBlockPosY = (devicePosY.lastValue*pseudoRadius) + 10;
        var neg = 1
        var objectWorldPosZ = devicePosZ.lastValue + 1.5;
        var offsetZ = pseudoRadius - (devicePosZ.lastValue / 2)*150 ;
        var latterOffset = 0
        if(Math.abs(lastCamRotZ) > Math.PI / 2) {
            neg = -1;
            latterOffset = 2 * objectWorldPosZ * 100;
            //offsetZ = 20;
            /*if (cameraPosZ.lastValue < 0) {
                neg = 1;
            }
            */
        }


        newBlockPosZ = neg*(-pseudoRadius*Math.cos(lastCamRotY)+(devicePosZ.lastValue*pseudoRadius) + offsetZ) + latterOffset//+ cameraPosZ.lastValue;

        //var Npos = new CANNON.Vec3((Math.sin(lastCamRotY)*newBlockPosX), newBlockPosY + 10, (Math.cos(lastCamRotY)*newBlockPosY));

        var Npos = new CANNON.Vec3(newBlockPosX, newBlockPosY, newBlockPosZ);
        /*
        lastCamRotY = camRotY.lastValue
        lastCamRotZ = camRotZ.lastValue

        newBlockPosX = ((Math.sin(lastCamRotY)+ devicePosX.lastValue) * -1.5 + 2*devicePosX.lastValue + (devicePosX.lastValue * .5))*100
        newBlockPosY = devicePosY.lastValue * 100;
        var neg = 1
        var objectWorldPosZ = (devicePosZ.lastValue + 0) * 1;

        var latterOffset = 0
        if(Math.abs(lastCamRotZ) > Math.PI / 2) {
            neg = -1;
            latterOffset = 2 * objectWorldPosZ - latterOffset;
            //offsetZ = 20;


        }
        newBlockPosZ = (neg*((Math.cos(lastCamRotY) * -1.5) + objectWorldPosZ) + latterOffset + 1.7) * 100

        var Npos = new CANNON.Vec3(newBlockPosX, newBlockPosY, newBlockPosZ); */
        blockPos.push(Npos)                              //calculate position of new block and add to positions array

        var matIndex = Math.floor(Random.random() * mats.length);
        blockMat.push(matIndex)

        // make a physics object for the block
        worldObjects.push({sceneObject: sceneBlock, physicsObject: initBlock(Npos)});    //add it to world objects
        changeMat(newestIndex+1);     //make the new block selected

        updatePhysicsObjects(1);      // update physics hitboxes for all blocks
        sceneBlock.hidden = false;   //make visible
        newestIndex++;
        gravity = true;

        cannonHelper = new CannonHelper(worldObjects);   //reset cannonhelper with new world objects

    }
}

function initSphere(pos) {
    var sphereBody = new CANNON.Body({
        mass: 2, // kg
        position: pos,
        shape: new CANNON.Sphere(1)
    })
    return sphereBody;
}
function setupSphereRot(){
    sphere.worldTransform.position = posObject.worldTransform.position;
}
function setupSphere(){
    sphere.hidden = false;

    ballButton.material = selected_ball_mat;
    setupSphereRot();
    if(sphereIndex != -1){
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
}
function initCar(carpos) {
    var carBody = new CANNON.Body({
        mass: 2, // kg
        position: carpos,
        shape: new CANNON.Sphere(40)
    })
    return carBody;
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
    var carPos = new CANNON.Vec3(car.transform.x.pinLastValue(), 0, car.transform.z.pinLastValue())
    //var spherePos = new CANNON.Vec3(sphere.transform.x.pinLastValue(), sphere.transform.y.pinLastValue(), sphere.transform.z.pinLastValue());
    var cannonCar = initCar(carPos);
    worldObjects.push({ sceneObject: car, physicsObject: cannonCar })
    cannonHelper = new CannonHelper(worldObjects)
    carIndex = worldObjects.length - 1;

    //var camRotY = deviceWorldTransform.rotationY


    var carForce = new CANNON.Vec3( 0, 0, -500)

    cannonCar.applyLocalImpulse(carForce, carPos)
   // cannonSphere.angularVelocity = new CANNON.Vec3(0, 0, 0)
}



function changeMat(bid){
    if(!gravity){
        /*Promise.all([
            Materials.findFirst('Cube_mat'),
            Materials.findFirst('SelectedBlock_mat'),
        ]).then(function(results){*/
            var block = blocks[bid-1].child('Cube');
            if(numBlock == bid){
                numBlock = 0;

                redButton.hidden = true;
                blueButton.hidden = true;
                greenButton.hidden = true;
                yellowButton.hidden = true;


                //block.material = results[0];
                block.material = mats[blockMat[bid-1]]
                Patches.setScalarValue('numBlock', numBlock)

                //block.worldTransform.position = posObject.worldTransform.position
                //Diagnostics.watch("SHIT: ", block.worldTransform.position.x.pinLastValue())
                //block.transform.x = block.transform.x.pinLastValue()
                //block.transform.y = block.transform.y.pinLastValue()
                //block.transform.z = block.transform.z.pinLastValue()
                //updatePhysicsObjects();

            }
            else  {
                if(numBlock != 0){
                    blocks[numBlock - 1].child("Cube").material = mats[blockMat[numBlock-1]];
                }
                redButton.hidden = false;
                blueButton.hidden = false;
                greenButton.hidden = false;
                yellowButton.hidden = false;


                /*block.transform.x = Reactive.div(
                    Reactive.sub(
                        Reactive.mul(posObject.worldTransform.x,1),
                        Reactive.mul(planeTrackObj.worldTransform.x,1)
                    )
                ,1);
                block.transform.y = Reactive.div(
                    Reactive.sub(
                        Reactive.mul(posObject.worldTransform.y,1),
                        Reactive.mul(planeTrackObj.worldTransform.y,1)
                    )
                ,1);
                block.transform.z = Reactive.div(
                    Reactive.sub(
                        Reactive.mul(posObject.worldTransform.z,1),
                        Reactive.mul(planeTrackObj.worldTransform.z,1)
                    )
                ,1);*/
                /*block.worldTransform.position = posObject.worldTransform.position;
                Diagnostics.watch("X: ",block.transform.x)
                Diagnostics.watch("Y: ",block.transform.y)
                Diagnostics.watch("Z: ",block.transform.z)
                Diagnostics.watch("wX: ",block.worldTransform.x)
                Diagnostics.watch("wY: ",block.worldTransform.y)
                Diagnostics.watch("wZ: ",block.worldTransform.z)*/


                numBlock = bid;
                block.material = selectedMats[blockMat[bid-1]];
                Patches.setScalarValue('numBlock', numBlock)
            }
        //})
    }
}
var NewXPos;
var NewYPos;
var NewZPos;
var yRot = deviceWorldTransform.rotationY;

function moveBlock(bid){
    for(var i = 0; i < blocks.length; i++){
        if(i == bid){
            var block = blocks[i];
            const blockTransform = block.transform;

            var touchPos = Patches.getVectorValue('patchPosition'+(i+1));
            //blockPos[bid] = new CANNON.Vec3(blockTransform.x.lastValue,blockTransform.y.lastValue,blockTransform.z.lastValuee)

      // Get the angle of the camera                                                         |
            // Try subtracting touch pos by a stored lastValue of touch pos in this version \/
            var NewXPos = Reactive.add(newBlockPosX,Reactive.mul(Reactive.cos(yRot.lastValue),touchPos.x));
            var NewYPos = Reactive.add(newBlockPosY,Reactive.mul(touchPos.y,-1));
            var NewZPos = Reactive.add(newBlockPosZ,Reactive.mul(Reactive.sin(Reactive.mul(yRot.lastValue, -1)),touchPos.x));

            /*
            var NewXPos = Reactive.mul(Reactive.cos(yRot.lastValue),touchPos.x);
            var NewYPos = Reactive.mul(touchPos.y,-1);
            var NewZPos = Reactive.mul(Reactive.sin(Reactive.mul(yRot.lastValue, -1)),touchPos.x);
            */
            blockTransform.x = NewXPos;
            blockTransform.y = NewYPos;
            blockTransform.z = NewZPos;


            updatePhysicsObjects();

      //worldObjects[bid+1].physicsObject = initBlock(new CANNON.Vec3(NewXPos,NewYPos,NewZPos))
    }
  }
}




TouchGestures.onPan().subscribe(function (gesture) {
    moveBlock(numBlock- 1);
    setupCarPos();
});
TouchGestures.onTap(blockButton).subscribe(function (gesture) {
    if(!gravitySignal) {
        makeBlock();
        blockButton.material = selected_add_block_mat;
        Time.setTimeout(function(){ blockButton.material = add_block_mat },125);
        //updatePhysicsObjects();
    }
});

TouchGestures.onTap(gravityButton).subscribe(function(e) {

    if(!gravitySignal){
        if(numBlock != 0)
            changeMat(numBlock)
        ballButton.hidden = false;
        carButton.hidden = false;
        updatePhysicsObjects();
        gravitySignal = true;
        gravityButton.material = gravity_inverse_mat;
    }
    else {
        ballButton.hidden = true;
        carButton.hidden = true;
        sphere.hidden = true;
        carAnimation.hidden = true;
        gravityButton.material = gravity_mat;
        if(sphereIndex != -1)
            worldObjects.splice(sphereIndex,1)
        sphereIndex = -1;
        setupSphereRot();
        canShootSphere = false;
        ballButton.material = ball_mat;

        if(carIndex != -1)
            worldObjects.splice(carIndex,1)
        carIndex = -1;
        carButton.material = car_mat;
        //carAnimation.hidden = true;
        canShootCar = false

        resetBlockPos();
    }


})
TouchGestures.onTap(resetButton).subscribe(function(gesture){
    resetButton.material = selected_reset_mat;
    Time.setTimeout(function(){ resetButton.material = reset_mat },125);
    initWorld();



})

TouchGestures.onTap(ballButton).subscribe(function (gesture) {
    sphere.hidden = true;
    carAnimation.hidden = true;
    canShootCar = false;
    ballButton.material = selected_ball_mat;
    carButton.material = car_mat;

    if(carIndex != -1){
        worldObjects.splice(carIndex,1)
        carIndex = -1;
        //carAnimation.hidden = true;
    }

    if (gravity && !canShootSphere)
        setupSphere();

    else if(canShootSphere){
        canShootSphere = false;
        sphere.hidden = true;
        ballButton.material = ball_mat;

    }
});
TouchGestures.onTap(carButton).subscribe(function (gesture) {
    carButton.material = selected_car_mat;
    sphere.hidden = true;
    carAnimation.hidden = true;
    canShootSphere = false;
    ballButton.material = ball_mat;

    if(sphereIndex != -1){
        worldObjects.splice(sphereIndex,1)
        sphereIndex = -1;
        //sphere.hidden = true;
        setupSphereRot();
        canShootSphere = false;

    }

    if (gravity && !canShootCar)
        setupCar();

    else if (canShootCar) {
        canShootCar = false;
        carAnimation.hidden = true;
        carButton.material = car_mat;
    }
});

TouchGestures.onTap().subscribe(function (gesture){
    if(canShootSphere)
        fireSphere();
    else if(sphereIndex != -1){
        setupSphere();
    }
    else if (canShootCar)
        fireCar();
    else if (carIndex != -1) {
        setupCar();
    }
});


TouchGestures.onTap(redButton).subscribe(function(gesture){
    if(numBlock != 0){
        blockMat[numBlock-1] = 0;
        blocks[numBlock-1].child('Cube').material = selectedMats[0];
        redButton.material = selected_red_mat;
        Time.setTimeout(function(){ redButton.material = red_mat },125);
    }

});
TouchGestures.onTap(blueButton).subscribe(function(gesture){
    if(numBlock != 0){
        blockMat[numBlock-1] = 1;
        blocks[numBlock-1].child('Cube').material = selectedMats[1];
        blueButton.material = selected_blue_mat;
        Time.setTimeout(function(){ blueButton.material = blue_mat },125);
    }
});
TouchGestures.onTap(greenButton).subscribe(function(gesture){
    if(numBlock != 0){
        blockMat[numBlock-1] = 2;
        blocks[numBlock-1].child('Cube').material = selectedMats[2];
        greenButton.material = selected_green_mat;
        Time.setTimeout(function(){ greenButton.material = green_mat },125);
    }
});
TouchGestures.onTap(yellowButton).subscribe(function(gesture){
    if(numBlock != 0){
        blockMat[numBlock-1] = 3;
        blocks[numBlock-1].child('Cube').material = selectedMats[3];
        yellowButton.material = selected_yellow_mat;
        Time.setTimeout(function(){ yellowButton.material = yellow_mat },125);
    }
});
/*
for(var i = 0; i < blocks.length; i++){
  //var block = blocks[i];
  TouchGestures.onTap(blocks[i]).subscribe(function (gesture) {
          changeMat(i+1);
  });
}
*/
TouchGestures.onTap(blocks[0]).subscribe(function (gesture) {
    changeMat(1);
});
TouchGestures.onTap(blocks[1]).subscribe(function (gesture) {
    changeMat(2);
});
TouchGestures.onTap(blocks[2]).subscribe(function (gesture) {
    changeMat(3);
});
TouchGestures.onTap(blocks[3]).subscribe(function (gesture) {
    changeMat(4);
});
TouchGestures.onTap(blocks[4]).subscribe(function (gesture) {
    changeMat(5);
});
TouchGestures.onTap(blocks[5]).subscribe(function (gesture) {
    changeMat(6);
});
TouchGestures.onTap(blocks[6]).subscribe(function (gesture) {
    changeMat(7);
});
TouchGestures.onTap(blocks[7]).subscribe(function (gesture) {
    changeMat(8);
});
TouchGestures.onTap(blocks[8]).subscribe(function (gesture) {
    changeMat(9);
});
TouchGestures.onTap(blocks[9]).subscribe(function (gesture) {
    changeMat(10);
});
TouchGestures.onTap(blocks[10]).subscribe(function (gesture) {
    changeMat(11);
});
TouchGestures.onTap(blocks[11]).subscribe(function (gesture) {
    changeMat(12);
});
TouchGestures.onTap(blocks[12]).subscribe(function (gesture) {
    changeMat(13);
});
TouchGestures.onTap(blocks[13]).subscribe(function (gesture) {
    changeMat(14);
});
TouchGestures.onTap(blocks[14]).subscribe(function (gesture) {
    changeMat(15);
});


Time.ms.interval(loopTimeMs).subscribe(function(elapsedTime) {
    if (lastTime !== undefined) {
        var deltaTime = (elapsedTime - lastTime) / 1000


        if(gravity){
            cannonHelper.update(deltaTime)
        }

        gravity = gravitySignal;


    }

    lastTime = elapsedTime
})

initWorld();
