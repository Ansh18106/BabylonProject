import * as BABYLON from "@babylonjs/core";
var selectedMesh = null;
var pointerDownPosition = null;
var selectedFace = null;
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);
var camera = new BABYLON.ArcRotateCamera(
  "camera",
  0,
  0,
  5,
  BABYLON.Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);

// Light
var light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);

var ground = new BABYLON.MeshBuilder.CreateGround(
  "",
  {
    height: 10000000000,
    width: 10000000000,
    subdivisions: 30,
  },
  scene
);
ground.position = new BABYLON.Vector3(0, -1, 0);

// Creating a box
var cube = new BABYLON.MeshBuilder.CreateBox(
  "trueBox",
  {
    // size: 1,
    height: 1,
    widht: 3,
    depth: 10,
    updatable: true,
    faceColors: [
      new BABYLON.Color4(1, 0, 0, 1), // red -> 1
      new BABYLON.Color4(1, 1, 0, 1), // yellow -> 2
      new BABYLON.Color4(1, 0, 1, 1), // pink -> 4
      new BABYLON.Color4(0, 1, 0, 1), // black -> below -> 11
      new BABYLON.Color4(0, 0, 1, 1), // blue -> 8 -> top
      new BABYLON.Color4(0, 1, 1, 1), // green -> 6
    ],
  },
  scene
);

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointerup", onPointerUp);
// After the onPointerUp function
canvas.addEventListener("pointermove", onPointerMove);

// show axis
var showAxis = function (size) {
  var axisX = new BABYLON.MeshBuilder.CreateLines(
    "axisX",
    [
      new BABYLON.Vector3(-size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(-size, 0, 0),
      new BABYLON.Vector3(-size * 0.95, -0.05 * size, 0),
      new BABYLON.Vector3(-size, 0, 0),
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, -0.05 * size, 0),
    ],
    scene
  );
  axisX.color = new BABYLON.Color3(1, 0, 0);
  var xChar = makeTextPlane("X", "red", size / 10);
  xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

  var xChar1 = makeTextPlane("-X", "red", size / 10);
  xChar1.position = new BABYLON.Vector3(-0.9 * size, 0.05 * size, 0);
  var xcor = [];
  for (i = -10; i <= 10; i++) {
    xcor[i] = makeTextPlane(i, "red", size / 10);
    xcor[i].position = new BABYLON.Vector3(i, 0, 0);
  }

  var axisY = BABYLON.Mesh.CreateLines(
    "axisY",
    [
      new BABYLON.Vector3(-0.05 * size, -size * 0.95, 0),
      new BABYLON.Vector3(0, -size, 0),
      new BABYLON.Vector3(0.05 * size, -size * 0.95, 0),
      new BABYLON.Vector3(0, -size, 0),
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(0.05 * size, size * 0.95, 0),
    ],
    scene
  );

  axisY.color = new BABYLON.Color3(0, 1, 0);
  var yChar = makeTextPlane("Y", "green", size / 10);
  yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
  var yChar1 = makeTextPlane("-Y", "green", size / 10);
  yChar1.position = new BABYLON.Vector3(0, -0.9 * size, 0.05 * size);

  var ycor = [];
  for (y = -10; y <= 10; y++) {
    xcor[y] = makeTextPlane(y, "green", size / 10);
    xcor[y].position = new BABYLON.Vector3(0, y, 0);
  }

  var axisZ = BABYLON.Mesh.CreateLines(
    "axisZ",
    [
      new BABYLON.Vector3(0, -0.05 * size, -size * 0.95),
      new BABYLON.Vector3(0, 0, -size),
      new BABYLON.Vector3(0, 0.05 * size, -size * 0.95),
      new BABYLON.Vector3(0, 0, -size),
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, 0.05 * size, size * 0.95),
    ],
    scene
  );
  axisZ.color = new BABYLON.Color3(0, 0, 1);
  var zChar = makeTextPlane("Z", "blue", size / 10);
  zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
  var zChar1 = makeTextPlane("-Z", "blue", size / 10);
  zChar1.position = new BABYLON.Vector3(0, 0.05 * size, -0.9 * size);

  var zcor = [];
  for (z = -10; z <= 10; z++) {
    xcor[z] = makeTextPlane(z, "green", size / 10);
    xcor[z].position = new BABYLON.Vector3(0, 0, z);
  }
};

function onPointerDown(event) {
  // Get the picked mesh from the pointer down event
  var pickResult = scene.pick(scene.pointerX, scene.pointerY);
  if (pickResult.hit && pickResult.pickedMesh === cube) {
    // Store the selected mesh and the pointer down position
    selectedMesh = pickResult.pickedMesh;
    // Check which face was clicked
    var faceIndex = pickResult.faceId;
    // Set the selected face
    selectedFace = Math.floor(faceIndex / 2);
    console.log(selectedFace);
    pointerDownPosition = pickResult.pickedPoint;
  }
  camera.attachControl(canvas, true);
}

function onPointerUp(event) {
  // Reset the selected mesh and pointer down position
  selectedMesh = null;
  pointerDownPosition = null;
  selectedFace = null;
}

function onPointerMove(event) {
  if (selectedMesh && pointerDownPosition) {
    camera.detachControl(canvas);
    // Get the current pointer position during movement
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);

    if (pickResult.hit && pickResult.pickedMesh === selectedMesh) {
      // Calculate the distance between the pointer down position and current pointer position
      var distance = BABYLON.Vector3.Distance(
        pointerDownPosition,
        pickResult.pickedPoint
      );

      // Extrude the mesh based on the distance
      if (selectedFace <= 1) {
        selectedMesh.scaling.z = Math.abs(distance);
      } else if (selectedFace > 3) {
        selectedMesh.scaling.y = distance;
      } else {
        selectedMesh.scaling.x = distance;
      }
    }
  }
}

showAxis(100000);

// Run the Babylon.js engine
engine.runRenderLoop(function () {
  scene.render();
});
