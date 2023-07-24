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
  var moveSpace = true;
  var tempCube;
  var pickPoint;
  var prevX, prevY, prevZ;

  // Add a pointerdown event listener to the canvas to handle clicks
  canvas.addEventListener("pointerdown", function (event) {
    tempCube = cube;
    console.log(tempCube);
    // Get the coordinates of the click
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    pickPoint = pickResult.pickedPoint;
    console.log(pickResult.hit, pickResult.pickedMesh === cube);
    // Check if the ray intersects with the cube
    if (pickResult.hit && pickResult.pickedMesh === cube) {
      console.log(cube);
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
      prevX = selectedFaceNormal.x;
      prevY = selectedFaceNormal.y;
      prevZ = selectedFaceNormal.z;
      console.log(selectedFaceNormal);

      // Store the original vertex positions to calculate the resizing
      originalVertexPositions = cube
        .getVerticesData(BABYLON.VertexBuffer.PositionKind)
        .slice();
      //   console.log(originalVertexPositions);
      resizing = true;
      moveSpace = false;
    }
  });
  var cnt = 0;
  var tempPos = originalVertexPositions;
  //   var x = scene.pointerX,
  //     y = scene.pointerY;
  // Add a pointermove event listener to handle user input during resizing
  canvas.addEventListener("pointermove", function (event) {
    // console.log(scene.pointerX, scene.pointerY);
    if (!moveSpace) {
      // Disable camera rotation while the pointer is moving
      moveSpace = true;
    }
    // console.log(resizing, selectedFaceNormal);
    if (resizing && selectedFaceNormal) {
      camera.detachControl(canvas);
    }

    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    var currPoint = pickResult.getNormal();
    var x = currPoint.x;
    var y = currPoint.y;
    var z = currPoint.z;
    console.log(x, y, z);
    console.log(selectedFaceNormal.x);
    // Calculate the distance of mouse movement (change this value to control resizing speed)
    var resizeFactor =
      (selectedFaceNormal.x * (prevX - x) +
        selectedFaceNormal.y * (prevY - y) +
        selectedFaceNormal.z * (prevZ - z) >
      0
        ? 1
        : 1) * 0.02;
    console.log(resizeFactor);
    prevX = x;
    prevY = y;
    prevZ = z;
    // Get the direction of mouse movement
    // console.log(scene.pointerX, scene.pointerY);
    var direction = selectedFaceNormal;
    x = scene.pointerX;
    y = scene.pointerY;
    // var direction = pickResult.getNormal();

    // Calculate the new vertex positions based on the direction and mouse movement
    var newVertexPositions = [];
    for (var i = 0; i < originalVertexPositions.length; i += 3) {
      // console.log(i);
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
      //   }
      //   cnt++;
      //   if (newVertexPositions.length == originalVertexPositions.length)
      // console.log(cnt, newVertexPositions);

      tempPos = newVertexPositions;
      cube.updateVerticesData(
        BABYLON.VertexBuffer.PositionKind,
        newVertexPositions,
        true
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
    // if (originalVertexPositions !== vertexPositions)
    //   console.log(vertexPositions);
    // reattach the control of the camera
    camera.attachControl(canvas, true);
    moveSpace = true;
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
engine.runRenderLoop(() => scene.render());

// This will help to keep the dimensions of the canvas will be independent of the dimensions of the window
window.addEventListener("resize", () => {
  engine.resize();
});
