var searchParams = new URLSearchParams(window.location.search);
window.onload = (event) => {
//in case I want to make something run at launch
  var hat = document.getElementById(`hat`);
  hat.addEventListener("mousedown", takeHat);
  if(searchParams.size == 0) {
    const paramStr = "Booktable=false&Fuse%20Box1=false&Fuse%20Box2=false&Wall=false&Hat%20Rack1=false&Hat%20Rack2=false&Hat%20Rack3=false";
    searchParams = new URLSearchParams(paramStr);
  }
  if(searchParams.get("Wall") === "true") {
    let i = 10;
    Array.from(document.querySelectorAll(`.peg`)).forEach((peg) => {
      peg.style.visibility = "visible";
      peg.style.top = "0%";
      peg.style.left = i + "%";
      i += 25;
      peg.gravity = setInterval(applyGravity, 10, peg);
    });
  }
  if(searchParams.get("Hat Rack3") === "true") {
    hat.style.visibility = "hidden";
  }
  let link = document.getElementById("backButton");
  link.href += `?${searchParams.toString()}`;
}

var currentCombination = [0,0,0,0];
var correctCombination = [7,0,5,2];
var chandelier = document.getElementById(`chandelier`);
var lowerInterval = false;

function directSpotlight(button, painting) {
  let pegTurn = rotatePeg(button);
  let paintingBounds = painting.getBoundingClientRect();
  let spotlight = document.getElementById(`spotlight${painting.id.replace("painting","")}`);
  if(!spotlight) {
    spotlight = document.createElement(`div`);
    spotlight.id = `spotlight${painting.id.replace("painting","")}`;
    spotlight.classList.add(`circle`);
    spotlight.classList.add(`spotlight`);
    let gameArea = document.getElementById(`gameArea`);
    gameArea.appendChild(spotlight);
  }
  let spotLocations = [
    [
      paintingBounds.top + spotlight.clientHeight/1.75,
      paintingBounds.left + paintingBounds.width/2
    ],
    [
      paintingBounds.top + spotlight.clientHeight * 1.5,
      paintingBounds.right - spotlight.clientWidth / 1.5
    ],
    [
      paintingBounds.top + paintingBounds.height/2,
      paintingBounds.right - spotlight.clientWidth / 1.5
    ],
    [
      paintingBounds.bottom - spotlight.clientHeight * 1.5,
      paintingBounds.right - spotlight.clientWidth / 1.5
    ],
    [
      paintingBounds.bottom - spotlight.clientHeight/1.75,
      paintingBounds.left + paintingBounds.width/2
    ],
    [
      paintingBounds.bottom - spotlight.clientHeight * 1.5,
      paintingBounds.left + spotlight.clientWidth / 1.5
    ],
    [
      paintingBounds.top + paintingBounds.height/2,
      paintingBounds.left + spotlight.clientWidth / 1.5
    ],
    [
      paintingBounds.top + spotlight.clientHeight * 1.5,
      paintingBounds.left + spotlight.clientWidth / 1.5
    ]
  ];
  spotlight.style.top = spotLocations[pegTurn][0] - spotlight.clientHeight/2 + "px";
  spotlight.style.left = spotLocations[pegTurn][1] - spotlight.clientWidth/2 + "px";
  currentCombination[(painting.id.replace("painting","").charCodeAt(0)-65)] = pegTurn;
  if(arraysEqual(currentCombination, correctCombination)) {
    if(!lowerInterval) {
      lowerInterval = setInterval(lowerLight, 10);
    }
  }
}

function onPin(peg, circle) {
  circle.style.position = "relative";
  circle.appendChild(peg);
  peg.style.top = "-200%";
  peg.style.left = "calc(50% - 4vh)";
  peg.onmousedown = false;
}

function rotatePeg(button) {
  let slices = 8;
  if(!button.children[0].currentRotation) {
    button.children[0].currentRotation = 0;
  } else if(button.children[0].currentRotation >= (1/slices)*(slices-1)) {
    button.children[0].currentRotation = -(1/slices);
  }
  button.children[0].currentRotation += (1/slices);
  button.children[0].style.transform = `rotate(${button.children[0].currentRotation}turn)`;
  let spotSlice =  button.children[0].currentRotation * slices;
  return spotSlice;
}

function lowerLight() {
  if(chandelier.offsetTop < -(window.innerHeight * 0.3)) {
    chandelier.style.top = Number(chandelier.offsetTop) + 10 + "px"
  } else {
    clearInterval(lowerInterval);
  }
}

function takeHat() {
  this.style.visibility = "hidden";
  searchParams.set("Hat Rack3", true);
  let link = document.getElementById("backButton");
  link.href = link.href.split(`?`)[0];
  link.href += `?${searchParams.toString()}`;
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    Array.from(document.querySelectorAll(`.imgcontainer`)).forEach((div) => {
      if(div.style.zIndex > elmnt.style.zIndex && div.id != elmnt.id) {
        div.style.zIndex = div.style.zIndex-1;
      }
    });
    elmnt.style.zIndex = Array.from(document.querySelectorAll(`.imgcontainer`)).length;
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    let overlap = overlayCheck(elmnt, "button");
    if (overlap[0]) {
      onPin(elmnt, overlap[0]);
    }
  }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function applyGravity(div, stopPoint) {
  if(div.speedY == undefined) {
      div.timesBounced = 0;
      div.speedY = 0;
      div.speedX = 0;
  }
  if(div.bounces == undefined) {
    div.bounces = 3;
  }
  let floor;
  if(!stopPoint) {
    floor = window.scrollY + window.innerHeight - div.clientHeight;
  } else {
    floor = stopPoint;
  }
  if(div.id.includes(`peg`)) {
    const rand = Math.random() < 0.5;
    if(div.speedX == 0) {
     if(rand) {
       div.speedX = 2;
     } else {
       div.speedX = -2;
     }
    }
    let rotation = div.style.transform.replace(/\D/g,'') || 1;
    rotation = Number(rotation) + 10;
    div.style.transform = `rotate(${rotation}deg)`;
    div.style.left = `${div.offsetLeft - div.speedX}px`;
  }
  if(div.offsetTop >= floor) {
    if(div.timesBounced < div.bounces) {
      div.speedY = -10/div.timesBounced;
      div.style.top = `${floor + div.speedY}px`;
      div.timesBounced++;
    } else {
      div.style.top = `${floor}px`;
      clearInterval(div.gravity);
      div.gravity = false;
      div.timesBounced = 0;
      div.speedY = 0;
      dragElement(div);
    }
  } else {
    div.style.top = `${div.offsetTop + div.speedY}px`;
    div.speedY += 1;
  }
}

function overlayCheck(div, tagToCheck) {
  let points = Array.from(document.querySelectorAll(`.${tagToCheck}`));
  points.sort((a, b) => {
    let topfirst = a.style.top.replace("px","") - b.style.top.replace("px","");
    let leftfirst = a.style.left.replace("px","") - b.style.left.replace("px","");
    return leftfirst;
  });

  let allOverlaps = [];

  let rightPos = (elem) => elem.getBoundingClientRect().right;
  let leftPos = (elem) => elem.getBoundingClientRect().left;
  let topPos = (elem) => elem.getBoundingClientRect().top;
  let btmPos = (elem) => elem.getBoundingClientRect().bottom;

  for (let i = 0; i < points.length; i++) {
    let isOverlapping = !(
    rightPos(div) < leftPos(points[i]) ||
    leftPos(div) > rightPos(points[i]) ||
    btmPos(div) < topPos(points[i]) ||
    topPos(div) > btmPos(points[i])
    );

    if (isOverlapping) {
      allOverlaps.push(points[i]);
    }
  }
  return allOverlaps;
}