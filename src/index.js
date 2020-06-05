const Diagnostics = require('Diagnostics')
const Instruction = require('Instruction')
const CameraInfo = require('CameraInfo')
const Scene = require('Scene')
const Time = require('Time')
const fd = Scene.root
  .child('Device')
  .child('Camera')
  .child('Focal Distance')
const planeTracker = Scene.root.child('planeTracker0')
const TouchGestures = require('TouchGestures')
const blockButton = Scene.root.child('Device').child('Camera').child('blockButton');
const gravityButton = Scene.root.child('Device').child('Camera').child('gravityButton');
const resetButton = Scene.root.child('Device').child('Camera').child('resetButton');

// cannon is still needed as a direct import because I need at add CANNON as a static property on the module
import CANNON from 'cannon'
import CannonHelper from 'spark-ar-physics'

// show switch camera instructions on front camera
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
var blockIndex = 0;
var blockPos = [];


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
        shape: new CANNON.Box(new CANNON.Vec3(blockLength/2, blockLength/2, blockLength/2))
    })

  return blockBody;
}
function makeBlock(){
    if(blockIndex < 10){
        var sceneBlock = blocks[blockIndex];
        var pos = new CANNON.Vec3( 50*blockIndex, 100, 0);
        blockPos.push(pos)
        var cannonBlock = initBlock(new CANNON.Vec3(pos.x,pos.y,pos.z));
        worldObjects.push({sceneObject: sceneBlock, physicsObject: cannonBlock});
        //Diagnostics.log(worldObjects[0])
        sceneBlock.hidden = false;
        blockIndex++;
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
    blockIndex = 0;
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

    /*updateTimer = Time.setInterval(function(){
        if (lastTime !== undefined) {
            //var deltaTime = (elapsedTime - lastTime) / 1000
            var deltaTime = loopTimeMs;

            if(gravity){
                //Diagnostics.log("yuh")
                helper.update(deltaTime)
            }

            gravity = gravitySignal;


        }

        //lastTime = elapsedTime
    },loopTimeMs)*/


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
    if(!gravitySignal)
        initWorld();
})




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
// couldn't really think of a better way so an interval it is...





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
