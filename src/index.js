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

//var touchPos = Reactive.vector(Reactive.val(0),Reactive.val(0),Reactive.val(0))

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




function updatePhysicsObjects(){    //Updates the positions of the block physics objects (hitboxes)
    for (var b = 0; b < blockPos.length; b++){
        var block = blocks[b];
        blockPos[b] = new CANNON.Vec3(block.transform.x.pinLastValue(), block.transform.y.pinLastValue(), block.transform.z.pinLastValue())
        worldObjects[b+1].physicsObject = initBlock(blockPos[b])

        cannonHelper = new CannonHelper(worldObjects)

    }
}
function initBlock(pos) {  //returns a physics object of a block at a passed in position
    var blockLength = 25;
    var blockBody = new CANNON.Body({
        mass: 0.2,
        position: pos,
        shape: new CANNON.Box(new CANNON.Vec3(blockLength/4, blockLength/4, blockLength/4))
    })

  return blockBody;
}
function makeBlock(){      //makes a new block, adds it to world objects, etc
    if(newestIndex < 10){
        var sceneBlock = blocks[newestIndex];
        const deviceWorldTransform = DeviceMotion.worldTransform;
        var xCam = deviceWorldTransform.x.pinLastValue();
        var yCam = deviceWorldTransform.y.pinLastValue();
        var zCam = deviceWorldTransform.z.pinLastValue();
        var pos = new CANNON.Vec3(xCam,yCam+1,zCam);
        blockPos.push(pos)                              //calculate position of new block and add to positions array


        var cannonBlock = initBlock(new CANNON.Vec3(pos.x,pos.y,pos.z));      // make a physics object for the block
        worldObjects.push({sceneObject: sceneBlock, physicsObject: cannonBlock});    //add it to world objects

        changeMat(newestIndex+1);     //make the new block selected

        updatePhysicsObjects();      // update physics hitboxes for all blocks
        sceneBlock.hidden = false;   //make visible
        newestIndex++;
        gravity = true;

        cannonHelper = new CannonHelper(worldObjects);   //reset cannonhelper with new world objects

    }
}


function initWorld(){     //resets world objects and makes them all hidden
    gravitySignal = false;
    gravity = true;

    floor = CannonHelper.makeFloor();

    worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }];
    blockPos = [];
    newestIndex = 0;
    for (var b in blocks){
        blocks[b].hidden = true;
    }
    cannonHelper = new CannonHelper(worldObjects);
}

function resetBlockPos(){   //resets positions to before gravity sim
    gravitySignal = false;
    gravity = true;

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
    if(numBlock == 0){
        if(!gravitySignal ){
            updatePhysicsObjects();
            gravitySignal = true;
        }
        else {
            resetBlockPos();
        }
    }

})
TouchGestures.onTap(resetButton).subscribe(function(e){
    //if(!gravitySignal)
        initWorld();
})


function changeMat(bid){
    if(!gravity){
        Promise.all([
            Materials.findFirst('Cube_mat'),
            Materials.findFirst('SelectedBlock_mat'),
        ]).then(function(results){
            var block = blocks[bid-1].child('Cube');
            if(numBlock == bid){
                numBlock = 0;
                block.material = results[0];
                Patches.setScalarValue('numBlock', numBlock)
            }
            else  {//if (numBlock == 0){//<--else {
                if(numBlock != 0){
                    blocks[numBlock - 1].child("Cube").material = results[0];
                }
                numBlock = bid;
                block.material = results[1];
                Patches.setScalarValue('numBlock', numBlock)
            }
        })
    }
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
        changeMat(1);
    //}
});
TouchGestures.onTap(blocks[1]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(2);
    //}
});
TouchGestures.onTap(blocks[2]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(3);
    //}
});
TouchGestures.onTap(blocks[3]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(4);
    //}
});
TouchGestures.onTap(blocks[4]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(5);
    //}
});
TouchGestures.onTap(blocks[5]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(6);
    //}
});
TouchGestures.onTap(blocks[6]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(7);
    //}
});
TouchGestures.onTap(blocks[7]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(8);
    //}
});
TouchGestures.onTap(blocks[8]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(9);
    //}
});
TouchGestures.onTap(blocks[9]).subscribe(function (gesture) {
    //if(!block.hidden){

        changeMat(10);
    //}
});

function moveBlock(bid){
    Diagnostics.log(bid)
  for(var i = 0; i < blocks.length; i++){
    if(i == bid){
      var block = blocks[i];
      const blockTransform = block.transform;

      var touchPos = Patches.getVectorValue('patchPosition'+(i+1));


      // Get the angle of the camera
      //const DeviceMotion = require('DeviceMotion');
      const deviceWorldTransform = DeviceMotion.worldTransform;
      var yRot = deviceWorldTransform.rotationY;

      var zeroVector = Reactive.vector(Reactive.val(0),Reactive.val(0),Reactive.val(0))

      var NewXPos;
      var NewYPos;
      var NewZPos;


      NewXPos = Reactive.mul(Reactive.cos(yRot),touchPos.x).add(blockTransform.x.pinLastValue());
      NewYPos = Reactive.mul(touchPos.y,-1).add(blockTransform.y.pinLastValue());
      NewZPos = Reactive.mul(Reactive.mul(Reactive.sin(yRot),touchPos.x),-1).add(blockTransform.z.pinLastValue());



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
