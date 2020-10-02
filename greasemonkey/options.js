const TIMERSECS = 5;

let video;
let poseNet;
let poses = [];
let chosenPose;


if (!localStorage.getItem('savedPoses')) {
  localStorage.setItem('savedPoses', JSON.stringify([]));
}

function blobToDataURL(blob, callback) {
  var a = new FileReader();
  a.onload = function(e) {callback(e.target.result);}
  a.readAsDataURL(blob);
}

var logButton = document.getElementById('log');

logButton.onclick = function() {
  logButton.disabled = true;
  logButton.textContent = TIMERSECS;
  var tick = function () {
    console.log('tick');
    var curVal = parseInt(logButton.textContent);
    if (curVal === 1) {
      savePose();
    } else {
      logButton.textContent = curVal - 1;
      setTimeout(tick, 1000);
    }
  };
  setTimeout(tick, 1000);
};

var savePose = function () {
  chosenPose = poses[0];
  var c = document.getElementById('defaultCanvas0');
  c.toBlob(function (blob) {
    var savedPoses = JSON.parse(localStorage.getItem('savedPoses'));
    blobToDataURL(blob, function(url) {
      savedPoses.push({
        posesEl: poses[0],
        imgURL: url
      });
      console.log(savedPoses);
      localStorage.setItem('savedPoses', JSON.stringify(savedPoses));
      window.location.reload(false);
    });
  }, 'image/webp');
};

var deletePose = function (src) {
  var savedPoses = JSON.parse(localStorage.getItem('savedPoses'));
  savedPoses = savedPoses.filter(function (savedPose) {
    return savedPose.imgURL !== src;
  });
  localStorage.setItem('savedPoses', JSON.stringify(savedPoses));
  window.location.reload(false);
};

var savedPoses = JSON.parse(localStorage.getItem('savedPoses'));
savedPoses.forEach(function (savedPose) {
  var img = document.createElement("img");
  img.src = savedPose.imgURL;
  var src = document.getElementById("savedPoses");
  img.addEventListener("click", function(){deletePose(img.src);});
  src.appendChild(img);
});

// https://p5js.org/reference/#/p5/setup
function setup() {
  // https://p5js.org/reference/#/p5/createCanvas
  var canvas = createCanvas(640, 480);
  canvas.parent('sketch-holder');
  // https://p5js.org/reference/#/p5/createCapture
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select("#status").hide();
}

// https://p5js.org/reference/#/p5/draw
function draw() {
  // https://p5js.org/reference/#/p5/image
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}

