const COUNTDOWN = 3 * 1000;  // milliseconds
const MAXDIST = 30;
const PROBABLE = 0.2;
let video;
let poseNet;
let poses = [];
let challengePose = false;


var randomElement = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

chrome.storage.local.get('savedPoses', function(data) {
  if (data.savedPoses.length === 0) {
    alert('save some poses: see options');
  } else{
    challengePose = randomElement(data.savedPoses).posesEl;
  }
});


var end = function(element) {
  chrome.storage.local.get(['tabId'], function(result) {
    chrome.tabs.update(result.tabId, {selected: true});
    close();
  });
};


// https://p5js.org/reference/#/p5/setup
function setup() {
  // https://p5js.org/reference/#/p5/createCanvas
  createCanvas(640, 480);
  // https://p5js.org/reference/#/p5/createCapture
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(result) {
    poses = result;
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

  if (challengePose) {
    drawKeypoints(challengePose.pose, 0, 255, 0);
    drawSkeleton(challengePose, 0, 255, 0);
  }
  if (poses.length) {
    drawKeypoints(poses[0].pose, 255, 0, 0);
    drawSkeleton(poses[0], 255, 0, 0);
  }
  checkPose();
}

var poseDist = function(pose1, pose2) {
  var ret = -1;
  for (let j = 0; j < pose1.keypoints.length; j += 1) {
    if (pose2.keypoints[j].score > PROBABLE) {
      pos1 = pose1.keypoints[j].position;
      pos2 = pose2.keypoints[j].position;
      var keypointDist = ((pos1.x - pos2.x) ** 2 + (
        pos1.y - pos2.y) ** 2) ** 0.5;
      ret = Math.max(ret, keypointDist);
    }
  }
  return ret;
};
var poseStatus = document.getElementById('poseStatus')
var inPose = false;
var poseStarted = -1;

var checkPose = function () {
  if (poses.length > 0 && challengePose) {
    var curDist = poseDist(poses[0].pose, challengePose.pose);
    poseStatus.textContent = curDist;
    if (curDist >= 0 && curDist <= MAXDIST) {
      if (inPose) {
        if (Date.now() - poseStarted >= COUNTDOWN) {
          end();
        }
      } else {
        inPose = true;
        poseStarted = Date.now();
      }
    } else {
      inPose = false;
    }
  }
};

// A function to draw ellipses over the detected keypoints
function drawKeypoints(pose, r, g, b) {
  for (let j = 0; j < pose.keypoints.length; j += 1) {
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    const keypoint = pose.keypoints[j];
    // Only draw an ellipse is the pose probability is bigger than PROBABLE
    if (keypoint.score > PROBABLE) {
      fill(r, g, b);
      noStroke();
      ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    }
  }
}

// A function to draw the skeletons
function drawSkeleton(pose, r, g, b) {
  const skeleton = pose.skeleton;
  // For every skeleton, loop through all body connections
  for (let j = 0; j < skeleton.length; j += 1) {
    const partA = skeleton[j][0];
    const partB = skeleton[j][1];
    stroke(r, g, b);
    line(
      partA.position.x,
      partA.position.y,
      partB.position.x,
      partB.position.y
    );
  }
}

