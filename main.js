import * as BABYLON from "@babylonjs/core";

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas);

const createScene = () => {
  var scene = new BABYLON.Scene(engine);
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

  // variables
  var resizeFactor = 1.5;
  var selectedFace;
  var selectedFaceNormal;
  var originalVertexPositions;
  var direction;
  var resizing = false;
  var pickedX, pickedY, x, y, finalX, finalY;

  // Add a pointerdown event listener to the canvas to handle clicks
  canvas.addEventListener("pointerdown", (event) => {
    var pickResult = scene.pick((x = scene.pointerX), (y = scene.pointerY));
    console.log(x, y);
    if (!resizing) {
      pickedX = x;
      pickedY = y;
    } else {
      finalX = x;
      finalY = y;
    }

    // Check if the ray intersects with the cube
    if (!resizing && pickResult.hit && pickResult.pickedMesh === cube) {
      resizing = true;
      // Check which face was clicked
      var faceIndex = pickResult.faceId;
      console.log("Selected face index:", faceIndex);

      // Set the selected face
      selectedFace = faceIndex;
      // Calculate the normal vector of the selected face
      selectedFaceNormal = pickResult.getNormal();
      direction = selectedFaceNormal;

      // Store the original vertex positions to calculate the resizing
      originalVertexPositions = cube
        .getVerticesData(BABYLON.VertexBuffer.PositionKind)
        .slice();
      console.log(originalVertexPositions);
    } else if (resizing && pickResult.hit) {
      resizing = false;
      // case of top face
      if (selectedFace > 7) {
        console.log("top face");
        var disY = finalY - pickedY;
        console.log(disY);
      }
      // case of lower face
      else {
        console.log("mid face");
        var disX = finalX - pickedX;
        console.log(disX);

        var newVertexPositions = [];
        for (var i = 0; i < originalVertexPositions.length; i += 3) {
          // console.log(i);
          var newPosition = new BABYLON.Vector3(
            originalVertexPositions[i] + disX / 100,
            originalVertexPositions[i + 1],
            originalVertexPositions[i + 2]
          );
          // if (
          //   selectedFaceNormal.equalsWithEpsilon(
          //     vertexPosition.subtract(cube.position).normalize(),
          //     0.9
          //   )
          // ) {
          console.log("new");
          // var newPosition = vertexPosition.add(
          //   direction.scale(resizeFactor * vertexPosition.length())
          // );
          newVertexPositions.push(newPosition.x, newPosition.y, newPosition.z);
          // } else {
          //   console.log("original");
          //   newVertexPositions.push(
          //     originalVertexPositions[i],
          //     originalVertexPositions[i + 1],
          //     originalVertexPositions[i + 2]
          //   );
          // }
        }
        cube.updateVerticesData(
          BABYLON.VertexBuffer.PositionKind,
          newVertexPositions
          // true
        );
        cube.createNormals(true); // Recalculate normals to fix shading after vertex position changes
      }
    }
  });
  return scene;
};

const scene = createScene();

var renderLoop = function () {
  scene.render();
  requestAnimationFrame(renderLoop);
};
renderLoop();

// This will help to keep the dimensions of the canvas will be independent of the dimensions of the window
window.addEventListener("resize", () => {
  engine.resize();
});
