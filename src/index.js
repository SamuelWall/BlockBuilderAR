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

var blocks = [block1, block2, block3, block4, block5, block6, block7, block8, block9, block10]
var newestIndex = 0;
var blockPos = [];

var numBlock = 0;

var worldObjects = [];
var floor;
var gravity = true;
var gravitySignal = false;

var cannonHelper;
var loopTimeMs = 30;
var lastTime;

var updateTimer;


/*function initBlockPos() {
    var initialX = 0;
    var initialY = 10;
    var initialZ = -70;
    var positions = [];
    for(var i = 0; i < 10; i++){
        positions.push(new CANNON.Vec3(initialX + 100*i, initialY+100, initialZ));
    }
    return positions;
}*/
function initBlock(pos) {
    var blockLength = 25;
    var blockBody = new CANNON.Body({
        mass: 0.2,
        position: pos,
        shape: new CANNON.Box(new CANNON.Vec3(blockLength/4, blockLength/4, blockLength/4))
    })

  return blockBody;
}
function makeBlock(){
    if(newestIndex < 10){
        var sceneBlock = blocks[newestIndex];
        var pos = new CANNON.Vec3( 50*newestIndex - 50*5, 25, 0);
        blockPos.push(pos)
        var cannonBlock = initBlock(new CANNON.Vec3(pos.x,pos.y,pos.z));
        worldObjects.push({sceneObject: sceneBlock, physicsObject: cannonBlock});
        //Diagnostics.log(worldObjects[0])
        sceneBlock.hidden = false;
        newestIndex++;
        gravity = true;
        //increment counter
        //make scene block into block block
        //make visible
        cannonHelper = new CannonHelper(worldObjects);

    }
}


function initWorld(){
    gravitySignal = false;
    gravity = true;

    floor = CannonHelper.makeFloor();

    worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }];
    newestIndex = 0;
    for (var b in blocks){
        blocks[b].hidden = true;
    }
    cannonHelper = new CannonHelper(worldObjects);
}

function resetBlockPos(){
    gravitySignal = false;
    gravity = true;

    Diagnostics.log(worldObjects)
    for(var i = 1; i < worldObjects.length; i++){
        worldObjects[i].physicsObject = initBlock(blockPos[i-1])
    }

    cannonHelper = new CannonHelper(worldObjects)
}



initWorld();



TouchGestures.onTap(blockButton).subscribe(function (gesture) {
    if(!gravitySignal)
        makeBlock();
});

TouchGestures.onTap(gravityButton).subscribe(function(e) {
    if(!gravitySignal){
        gravitySignal = true;
    }
    else {
        resetBlockPos();
    }

})
TouchGestures.onTap(resetButton).subscribe(function(e){
    //if(!gravitySignal)
        initWorld();
})


function changeMat(block, bid){
  Promise.all([
    Materials.findFirst('Cube_mat'),
    Materials.findFirst('SelectedBlock_mat'),
  ]).then(function(results){
      Diagnostics.log("NUMBLOCK: "+numBlock);
      Diagnostics.log("BID: "+bid)
      Diagnostics.log(" ")
    if(numBlock == bid){
      numBlock = 0;
      block.material = results[0];
      Patches.setScalarValue('numBlock', numBlock)
    }
    else if (numBlock == 0){//<--else {
      numBlock = bid;
      block.material = results[1];
      Patches.setScalarValue('numBlock', numBlock)
    }
  })
}
/*for(var blockIndex = 0; blockIndex < blocks.length; blockIndex++){
    var block = blocks[blockIndex]
    TouchGestures.onTap(block).subscribe(function (gesture) {
        //if(!block.hidden){

            Diagnostics.log("BLOCKINDEX: " + blockIndex)
            changeMat(block.child('Cube'), blockIndex+1);
        //}
    });
}*/
TouchGestures.onTap(blocks[0]).subscribe(function (gesture) {
    //if(!block.hidden){

        Diagnostics.log("BLOCKINDEX: " + 0)
        changeMat(blocks[0].child('Cube'), 0+1);
    //}
});
TouchGestures.onTap(blocks[1]).subscribe(function (gesture) {
    //if(!block.hidden){

        Diagnostics.log("BLOCKINDEX: " + 1)
        changeMat(blocks[1].child('Cube'), 1+1);
    //}
});

function moveBlock(bid){
  for(var i = 0; i < blocks.length; i++){
    if(i == bid){
      var block = blocks[i];
      const blockTransform = block.transform;

      var touchPos = Patches.getVectorValue('patchPosition'+(i+1));
      // Get the angle of the camera
      const DeviceMotion = require('DeviceMotion');
      const deviceWorldTransform = DeviceMotion.worldTransform;
      var yRot = deviceWorldTransform.rotationY;

      var NewXPos = Reactive.mul(Reactive.cos(yRot),touchPos.x)
      var NewYPos = Reactive.mul(touchPos.y,-1)
      var NewZPos = Reactive.mul(Reactive.mul(Reactive.sin(yRot),touchPos.x),-1)

      blockTransform.x = NewXPos;
      blockTransform.y = NewYPos;
      blockTransform.z = NewZPos;

      //worldObjects[bid+1].physicsObject = initBlock(new CANNON.Vec3(NewXPos,NewYPos,NewZPos))
    }
  }
}
TouchGestures.onPan().subscribe(function (gesture) {
  Diagnostics.log("BIGGGGG")

  moveBlock(numBlock- 1);
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

/*
function resetGame() {
  // zero everything out to make them static again
  // you can't just set the postiion and rotation because they will still have forces applied to them
  sphereBody.position = new CANNON.Vec3(0, 5, 0)
  sphereBody.angularVelocity = new CANNON.Vec3(0, 0, 0)
  sphereBody.velocity = new CANNON.Vec3(0, 0, 0)
  sphereBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0)

  // reset the pin positions, they change with the pins so don't stay their init value
  pinPos = initPinPos()

  // loop over all the world objects
  for (let i = 0; i < worldObjects.length; i++) {
    // skip the first two objects - ball/floor
    if (i > 1) {
      // reset the body
      cannonHelper.resetBody(worldObjects[i].physicsObject, pinPos[i - 2])
    }
  }
}*/

/*
var resetTimer
var thrown = false
function throwBall(xDirection) {
  if (thrown) return

  var force = new CANNON.Vec3(xDirection, 0, -300)
  var pos = new CANNON.Vec3(0, 0, 0)

  // apply an impulse on the ball to move it
  sphereBody.applyLocalImpulse(force, pos)

  thrown = true
  if (resetTimer) {
    Time.clearTimeout(resetTimer)
    resetTimer = null
  }

  resetTimer = Time.setTimeout(function(elapsedTime) {
    resetGame()
    thrown = false
  }, 5000)
}*/
