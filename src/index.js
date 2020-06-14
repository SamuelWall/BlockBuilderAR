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
const blockButton = root.child('Device').child('Camera').child('blockButton');
const gravityButton = root.child('Device').child('Camera').child('gravityButton');
const resetButton = root.child('Device').child('Camera').child('resetButton');
const planeTracker = root.child('planeTracker0')
const camera = root.child('Device').child('Camera');
const deviceWorldTransform = DeviceMotion.worldTransform;

const block_red = Materials.get('Block_mat_red');
const block_blue = Materials.get('Block_mat_blue');
const block_green = Materials.get('Block_mat_green');

var mats = [block_red, block_blue, block_green]




const cannonButton = camera.child('cannonButton')
//projectile
const sphere = planeTracker.child('Sphere')
//const sphere2 = planeTracker.child('Sphere0')
sphere.hidden = true;
//sphere2.hidden = true;
//var ct2 = sphere.transform
//device transform
var cameraPosX = deviceWorldTransform.x;
var cameraPosY = deviceWorldTransform.y;
var cameraPosZ = deviceWorldTransform.z;
var newBlockX = deviceWorldTransform.position.x;
var newBlockY = deviceWorldTransform.position.y;
var newBlockZ = deviceWorldTransform.position.z;
//device rotation
var camRotX = deviceWorldTransform.rotationX;
var camRotY = deviceWorldTransform.rotationY;
var camRotZ = deviceWorldTransform.rotationZ;

function setupSphereRot(){
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
    var resetZ = Reactive.mul(100,Reactive.add(1.7, newBlockZ));
    // orbit position + offset from device position if z > 1
    /*var newSpherePosX = Reactive.add(Reactive.neg(spherePosX), cameraPosX);
    var newSpherePosY = Reactive.add(spherePosY, cameraPosY);
    //if z > 0
    var newSpherePosZ = Reactive.add(Reactive.neg(spherePosZ), resetZ);*/
    var newSpherePosX = Reactive.add(Reactive.neg(Reactive.mul(spherePosX,100)), Reactive.mul(100,newBlockX));
    var newSpherePosY = Reactive.add(Reactive.mul(spherePosY,100), Reactive.mul(100,Reactive.add(newBlockY, .5)));
    //if z > 0
    var newSpherePosZ = Reactive.add(Reactive.neg(Reactive.mul(spherePosZ,100)), resetZ);
    //if z = 0
    //var newzn = Reactive.add(spherePosZ, resetZ);
    //hides cube/cube2 if (cube > 0)/(cube2 < 3)
    //sphere.hidden = rz.gt(0);
    //sphere2.hidden = rz.lt(3);
    //setting cube transforms
    /*sphere.transform.x = newSpherePosX.mul(100);
    sphere.transform.y = newSpherePosY.mul(100);
    sphere.transform.z = newSpherePosZ.mul(100);*/
    sphere.transform.x = newSpherePosX//.mul(100);
    sphere.transform.y = newSpherePosY//.mul(100);
    sphere.transform.z = newSpherePosZ//.mul(100);
    //ct2.y = spherePosY.mul(100);
    //ct2.x = newxp.mul(100);
    //ct2.z = newzn.mul(100);
}

var canShootSphere = false;
setupSphereRot();




import CANNON from 'cannon'
import CannonHelper from 'spark-ar-physics'
Instruction.bind(CameraInfo.captureDevicePosition.eq(CameraInfo.CameraPosition.FRONT), 'flip_camera')

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

    floor = CannonHelper.makeFloor();

    worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }];
    canShootSphere = false;
    sphere.hidden = true;
    sphereIndex = -1;
    blockPos = [];
    blockMat = [];
    newestIndex = 0;
    for (var b in blocks){
        blocks[b].hidden = true;
    }
    cannonHelper = new CannonHelper(worldObjects);
}
function updatePhysicsObjects(cutOff = 0){    //Updates the positions of the block physics objects (hitboxes)
    for (var b = 0; b < blockPos.length-cutOff; b++){
        var block = blocks[b];
        blockPos[b] = new CANNON.Vec3(block.transform.x.pinLastValue(), block.transform.y.pinLastValue(), block.transform.z.pinLastValue())
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
var lastCamX;
var lastCamY;
var lastCamZ;
//var lastCamRotX;
var lastCamRotY;
var lastCamRotZ;


function makeBlock(){      //makes a new block, adds it to world objects, etc
    if(newestIndex < 15){
        var sceneBlock = blocks[newestIndex];
        lastCamRotY = camRotY.lastValue
        lastCamRotZ = camRotZ.lastValue
        var pseudoRadius = 150;
        var offsetX = (cameraPosX.lastValue/2) * 100;
        lastCamX = (-pseudoRadius*Math.sin(lastCamRotY)+(cameraPosX.lastValue*pseudoRadius)) - offsetX;
        lastCamY = (cameraPosY.lastValue*pseudoRadius) + 10;
        var neg = 1
        var objectWorldPosZ = cameraPosZ.lastValue + 1.5;
        var offsetZ = pseudoRadius - (cameraPosZ.lastValue / 2)*150 ;
        var latterOffset = 0
        if(Math.abs(lastCamRotZ) > Math.PI / 2) {
            neg = -1;
            latterOffset = 2 * objectWorldPosZ * 100;
            //offsetZ = 20;
            /*if (cameraPosZ.lastValue < 0) {
                neg = 1;
            }
        }
        */

        }
        lastCamZ = neg*(-pseudoRadius*Math.cos(lastCamRotY)+(cameraPosZ.lastValue*pseudoRadius) + offsetZ) + latterOffset//+ cameraPosZ.lastValue;

        //var Npos = new CANNON.Vec3((Math.sin(lastCamRotY)*lastCamX), lastCamY + 10, (Math.cos(lastCamRotY)*lastCamY));

        var Npos = new CANNON.Vec3(lastCamX, lastCamY, lastCamZ);
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
function setupSphere(){
    sphere.hidden = false;


    if(sphereIndex != -1){
        worldObjects.splice(sphereIndex, 1);
        sphereIndex = -1;
        setupSphereRot();
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


function changeMat(bid){
    if(!gravity){
        Promise.all([
            Materials.findFirst('Cube_mat'),
            Materials.findFirst('SelectedBlock_mat'),
        ]).then(function(results){
            var block = blocks[bid-1].child('Cube');
            if(numBlock == bid){
                numBlock = 0;
                //block.material = results[0];
                block.material = mats[blockMat[bid-1]]
                Patches.setScalarValue('numBlock', numBlock)
            }
            else  {
                if(numBlock != 0){
                    blocks[numBlock - 1].child("Cube").material = mats[blockMat[numBlock-1]];
                }
                numBlock = bid;
                block.material = results[1];
                Patches.setScalarValue('numBlock', numBlock)
            }
        })
    }
}

function moveBlock(bid){
    for(var i = 0; i < blocks.length; i++){
        if(i == bid){
            var block = blocks[i];
            const blockTransform = block.transform;

            var touchPos = Patches.getVectorValue('patchPosition'+(i+1));


      // Get the angle of the camera
      //const DeviceMotion = require('DeviceMotion');
            var yRot = deviceWorldTransform.rotationY;

            var zeroVector = Reactive.vector(Reactive.val(0),Reactive.val(0),Reactive.val(0))

      //var NewXPos;
      //var NewYPos;
      //var NewZPos;


            var NewXPos = Reactive.add(lastCamX,Reactive.mul(Reactive.cos(yRot),touchPos.x));
            var NewYPos = Reactive.add(lastCamY,Reactive.mul(touchPos.y,-1));
            var NewZPos = Reactive.add(lastCamZ,Reactive.mul(Reactive.mul(Reactive.sin(yRot),touchPos.x),-1));



            blockTransform.x = NewXPos;
            blockTransform.y = NewYPos;
            blockTransform.z = NewZPos;

      //worldObjects[bid+1].physicsObject = initBlock(new CANNON.Vec3(NewXPos,NewYPos,NewZPos))
    }
  }
}


TouchGestures.onPan().subscribe(function (gesture) {
    moveBlock(numBlock- 1);
});
TouchGestures.onTap(blockButton).subscribe(function (gesture) {
    if(!gravitySignal)
        makeBlock();
});

TouchGestures.onTap(gravityButton).subscribe(function(e) {
    if(numBlock == 0){
        if(!gravitySignal){
            cannonButton.hidden = false;
            updatePhysicsObjects();
            gravitySignal = true;
        }
        else {
            cannonButton.hidden = true;
            if(sphereIndex != -1){
                worldObjects.splice(sphereIndex,1)
                sphereIndex = -1;
                sphere.hidden = true;
                setupSphereRot();
                canShootSphere = false;

            }
            resetBlockPos();
        }
    }

})
TouchGestures.onTap(resetButton).subscribe(function(gesture){
    //if(!gravitySignal)
        initWorld();
})
TouchGestures.onTap(cannonButton).subscribe(function (gesture) {

    if (gravity && !canShootSphere)
        setupSphere();

    else if(canShootSphere){
        canShootSphere = false;
        sphere.hidden = true;
    }
});

TouchGestures.onTap().subscribe(function (gesture){
    if(canShootSphere)
        fireSphere();
    else if(sphereIndex != -1){
        setupSphere();
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
