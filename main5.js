import * as BABYLON from "@babylonjs/core";

var canvas = document.getElementById("renderCanvas");

var engine = new BABYLON.Engine(canvas);

const createScene = () => {
  // scene
  var scene = new BABYLON.Scene(engine);

  //
  scene.createDefaultLight();

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

  // Variables to face selection
  var selectedFace = null;
  var highlightColor = new BABYLON.Color3(1, 1, 0); // Yellow

  // Variables to track user input and resizing
  var resizing = false;
  var selectedFaceNormal = null;
  var originalVertexPositions = [];

  // Add a pointerdown event listener to the canvas to handle clicks
  canvas.addEventListener("pointerdown", function (event) {
    // Get the coordinates of the click
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    console.log(pickResult.pickedPoint);
    console.log(pickResult.hit, pickResult.pickedMesh === cube);
    // Check if the ray intersects with the cube
    if (pickResult.hit && pickResult.pickedMesh === cube) {
      // Check which face was clicked
      var faceIndex = pickResult.faceId;
      console.log("Selected face index:", faceIndex);
      // Set the selected face
      selectedFace = faceIndex;

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
      //   console.log(originalVertexPositions);
      resizing = true;
    }
  });

  // Add a pointermove event listener to handle user input during resizing
  canvas.addEventListener("pointermove", function (event) {
    if (resizing && selectedFaceNormal) {
      camera.detachControl(canvas);
    }
    // Calculate the distance of mouse movement (change this value to control resizing speed)
    var resizeFactor = 0.02;

    // Get the direction of mouse movement
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);

    // var newFaceNormal = pickResult.getNormal();
    // var direction = newFaceNormal.subtract(selectedFaceNormal).normalize();
    var direction = selectedFaceNormal;

    // Calculate the new vertex positions based on the direction and mouse movement
    var newVertexPositions = [];
    for (var i = 0; i < originalVertexPositions.length; i += 3) {
      var vertexPosition = new BABYLON.Vector3(
        originalVertexPositions[i],
        originalVertexPositions[i + 1],
        originalVertexPositions[i + 2]
      );
      if (
        selectedFaceNormal.equalsWithEpsilon(
          vertexPosition.subtract(cube.position).normalize(),
          0.9
        )
      ) {
        // console.log(i, "new");
        var newPosition = vertexPosition.add(
          direction.scale(resizeFactor * vertexPosition.length())
        );
        newVertexPositions.push(newPosition.x, newPosition.y, newPosition.z);
      } else {
        // console.log(i, "original");
        newVertexPositions.push(
          originalVertexPositions[i],
          originalVertexPositions[i + 1],
          originalVertexPositions[i + 2]
        );
      }

      cube.updateVerticesData(
        BABYLON.VertexBuffer.PositionKind,
        newVertexPositions
        // true
      );
      cube.createNormals(true); // Recalculate normals to fix shading after vertex position changes
    }
    originalVertexPositions = newVertexPositions;
    // Enable vertex data for the cube to manipulate its vertices
    cube.enableEdgesRendering();
    cube.edgesWidth = 1;
    cube.edgesColor = new BABYLON.Color4(0, 0, 0, 1); // Black color
    // Update the mesh to reflect the resizing
  });

  // Add a pointerup event listener to stop resizing
  canvas.addEventListener("pointerup", function (event) {
    // Reset the material of the cube to its default material
    cube.material = new BABYLON.StandardMaterial("defaultMaterial", scene);
    selectedFace = null;
    var vertexPositions = cube
      .getVerticesData(BABYLON.VertexBuffer.PositionKind)
      .slice();
    // reattach the control of the camera
    camera.attachControl(canvas, true);
    resizing = false;
    selectedFaceNormal = null;
    originalVertexPositions = [];
  });

  // Enable vertex data for the cube to manipulate its vertices
  //   cube.enableEdgesRendering();
  //   cube.edgesWidth = 1;
  //   cube.edgesColor = new BABYLON.Color4(0, 0, 0, 1); // Blue color
  return scene;
};

const scene = createScene();

// rendering of the canvas
// engine.runRenderLoop(() => scene.render());
var renderLoop = function () {
  scene.render();
  requestAnimationFrame(renderLoop);
};
renderLoop();

// This will help to keep the dimensions of the canvas will be independent of the dimensions of the window
window.addEventListener("resize", () => {
  engine.resize();
});
