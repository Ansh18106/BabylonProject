import * as BABYLON from "@babylonjs/core";

var canvas = document.getElementById("renderCanvas");

var engine = new BABYLON.Engine(canvas);

const createScene = () => {
  function selectFace(event) {
    // Get the coordinates of the click
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);

    // Check if the ray intersects with the cube
    if (pickResult.hit && pickResult.pickedMesh === cube) {
      // Store the selected mesh and the pointer down position
      var selectedMesh = pickResult.faceId;
      // Change the material of the selected face to a wireframe material
      var faceMaterial = new BABYLON.StandardMaterial(
        "wireframeMaterial",
        scene
      );
      faceMaterial.wireframe = true;
      faceMaterial.emissiveColor = highlightColor;
      cube.material = faceMaterial;

      // Calculate the normal vector of the selected face
      selectedFaceNormal = pickResult.getNormal();

      // Store the original vertex positions to calculate the resizing
      originalVertexPositions = cube
        .getVerticesData(BABYLON.VertexBuffer.PositionKind)
        .slice();
      resizing = true;
      // Detaching the camera control while resizing
      camera.detachControl(canvas);
    }
  }

  function changeDimensions(event) {
    if (resizing && selectedFaceNormal) {
      // Calculate the distance of mouse movement (change this value to control resizing speed)
      var resizeFactor = 0.02;

      // Get the direction of extrusion
      var direction = selectedFaceNormal;

      // Calculate the new vertex positions based on the direction
      var newVertexPositions = [];
      for (var i = 0; i < originalVertexPositions.length; i += 3) {
        var vertexPosition = new BABYLON.Vector3(
          originalVertexPositions[i],
          originalVertexPositions[i + 1],
          originalVertexPositions[i + 2]
        );
        // check if the current coordinates lies on selected face or not
        if (
          selectedFaceNormal.equalsWithEpsilon(
            vertexPosition.subtract(cube.position).normalize(),
            0.9
          )
        ) {
          //vector addition in the coordinates
          var newPosition = vertexPosition.add(
            direction.scale(resizeFactor * vertexPosition.length())
          );
          newVertexPositions.push(newPosition.x, newPosition.y, newPosition.z);
        } else {
          newVertexPositions.push(
            originalVertexPositions[i],
            originalVertexPositions[i + 1],
            originalVertexPositions[i + 2]
          );
        }
      }

      // Update the mesh to reflect the resizing
      cube.updateVerticesData(
        BABYLON.VertexBuffer.PositionKind,
        newVertexPositions,
        true
      );
      // // Enable vertex data for the cube to manipulate its vertices
      // cube.enableEdgesRendering();
      // cube.edgesWidth = 1;
      // cube.edgesColor = new BABYLON.Color4(0, 0, 0, 1); // Black color
      cube.createNormals(true); // Recalculate normals to fix shading after vertex position changes
    }
  }

  function stopResizing(event) {
    // Reset the material of the cube to its default material
    cube.material = new BABYLON.StandardMaterial("defaultMaterial", scene);

    // Reattach the control of the camera
    camera.attachControl(canvas, true);

    // Reinitialise all the values
    resizing = false;
    selectedFaceNormal = null;
    originalVertexPositions = [];
  }
  // scene
  var scene = new BABYLON.Scene(engine);

  // Adding light to the scene
  scene.createDefaultLight();

  // Setting a camera
  var camera = new BABYLON.ArcRotateCamera(
    "camera",
    0,
    0,
    5,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // Creating a box
  var cube = new BABYLON.MeshBuilder.CreateBox(
    "trueBox",
    {
      size: 1,
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

  // Setting up a ground
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

  // // Variables to face selection
  var highlightColor = new BABYLON.Color3(1, 1, 0); // Yellow

  // Variables to track selected cube faces and resizing
  var resizing = false;
  var selectedFaceNormal = null;
  var originalVertexPositions = [];

  // Add a pointerdown event listener to the canvas to handle clicks
  canvas.addEventListener("pointerdown", selectFace);

  // Add a pointermove event listener to handle user input during resizing
  canvas.addEventListener("pointermove", changeDimensions);

  // Add a pointerup event listener to stop resizing
  canvas.addEventListener("pointerup", stopResizing);

  return scene;
};

// creating the scene
const scene = createScene();

// rendering of the canvas
engine.runRenderLoop(() => scene.render());

// This will help to keep the dimensions of the canvas will be independent of the dimensions of the window
window.addEventListener("resize", () => {
  engine.resize();
});
