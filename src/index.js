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

var worldObjects = [];
var floor;
var gravity = true;
var gravitySignal = false;

var cannonHelper;
var loopTimeMs = 30;
var lastTime;


function initBlockPos() {
    var initialX = 0;
    var initialY = 10;
    var initialZ = -70;
    var positions = [];
    for(var i = 0; i < 10; i++){
        positions.push(new CANNON.Vec3(initialX + 100*i, initialY+100, initialZ));
    }
    return positions;
}
function initBlock(pos) {
    var blockLength = 25;
    var blockBody = new CANNON.Body({
        mass: 0.2,
        position: pos,
        shape: new CANNON.Box(new CANNON.Vec3(blockLength/2, blockLength/2, blockLength/2))
    })

  return blockBody;
}


function initWorld(){
    gravitySignal = false;
    gravity = true;

    floor = CannonHelper.makeFloor();

    worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }];

    var blockPos = initBlockPos();

    // create a new worldObject for each pin
    blocks.forEach((block, i) => {
      worldObjects.push({ sceneObject: block, physicsObject: initBlock(blockPos[i]) })
    });

    // init the cannon world
    cannonHelper = new CannonHelper(worldObjects);
}

initWorld();

// couldn't really think of a better way so an interval it is...
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



TouchGestures.onTap().subscribe(function(e) {
  // convert the x of the tap to an x for force later
  //const xDirection = rangeMap(e.location.x, 0, 750, -50, 50)

  //throwBall(xDirection)
    if(!gravitySignal){
        gravitySignal = true;
    }
    else {
        initWorld();
    }


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
