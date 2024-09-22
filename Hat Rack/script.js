var searchParams = new URLSearchParams(window.location.search);
var pegsGone = false;
var pegCount = [3,4];
var playArea = document.getElementById("playArea");
var hatHooks = {hatOne:0, hatTwo:10, hatThree:15, hatFour:-50};
window.onload = (event) => {
  if(searchParams.size == 0) {
    const paramStr = "Booktable=false&Fuse%20Box1=false&Fuse%20Box2=false&Wall=false&Hat%20Rack1=false&Hat%20Rack2=false&Hat%20Rack3=false";
    searchParams = new URLSearchParams(paramStr);
  }
  if(searchParams.get("Hat Rack1") === "true") {
    let mortarboard = document.getElementById(`hatThree`);
    let hat = new Image();
    hat.src = './images/mortarboard.png';
    mortarboard.appendChild(hat);
    // mortarboard.style.visibility = "hidden";
  }
  if(searchParams.get("Hat Rack2") === "true") {
    let flatcap = document.getElementById(`hatTwo`);
    let hat = new Image();
    hat.src = './images/flatcap.png';
    flatcap.appendChild(hat);
    //flatcap.style.visibility = "hidden";
  }
  if(searchParams.get("Hat Rack3") === "true") {
    let fedora = document.getElementById(`hatOne`);
    let hat = new Image();
    hat.src = './images/fedora.png';
    fedora.appendChild(hat);
    //fedora.style.visibility = "hidden";
  }
  if(searchParams.get("Wall") === "true") {
    pegsGone = true;
  }
  let link = document.getElementById("backButton");
  link.href += `?${searchParams.toString()}`;

  for (var row = 0; row < pegCount[0]; row++) {
    for (var column = 0; column < pegCount[1]; column++) {
      var pegs = document.createElement("div");
      pegs.id = `pegs,${row},${column}`;
      pegs.classList.add(`pegs`);
      if (pegs.id == "pegs,0,1" || pegs.id == "pegs,1,2" || pegs.id == "pegs,1,3" || pegs.id == "pegs,2,2") {
        pegs.addEventListener("click",clickPeg);
        if(pegsGone) {
          pegs.style.visibility = "hidden";
        }
      }
      playArea.appendChild(pegs);
    }
  }

  Array.from(document.querySelectorAll(`.pegs`)).forEach((peg) => {
    peg.topDist = peg.offsetTop + "px";
    peg.leftDist = peg.offsetLeft + "px";
  });

  Array.from(document.querySelectorAll(`.pegs`)).forEach((peg) => {
    peg.style.position = `absolute`;
    peg.style.top = peg.topDist;
    peg.style.left = peg.leftDist;
  });

  var draggableElements = document.getElementsByClassName("hat");

  for(var i = 0; i < draggableElements.length; i++){
      dragElement(draggableElements[i]);
  }

}

function clickPeg(e) {
  if(searchParams.get("Wall") === "false") {
    searchParams.set("Wall", true);
    let link = document.getElementById("backButton");
    link.href = link.href.split(`?`)[0];
    link.href += `?${searchParams.toString()}`;
  }
  e.target.gravity = setInterval(applyGravity, 10, e.target);
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
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;

    if(elmnt.id == `hatFour` && elmnt.hookedOn) {
      elmnt.hookedOn.style.zIndex = 2;
    }

    Array.from(document.querySelectorAll(`.hat`)).forEach((div) => {
      if(div.style.zIndex > elmnt.style.zIndex && div.id != elmnt.id) {
        div.style.zIndex = div.style.zIndex-1;
      }
    });

    elmnt.style.zIndex = 6;
    if(event.target.parentElement.gravity) {
      clearInterval(event.target.parentElement.gravity);
      event.target.parentElement.gravity = false;
      event.target.parentElement.timesBounced = 0;
      event.target.parentElement.speedY = 0;
    }

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
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    let pegsUnder = overlayCheck(elmnt, "pegs");
    let allowedError = 100;
    let hookablepegs = pegsUnder.filter((peg) => {
      return (Math.abs((elmnt.offsetLeft + elmnt.clientWidth/2) - peg.offsetLeft) < allowedError);
    });
    hookablepegs.sort(function(a, b) {
      return a.offsetTop - b.offsetTop;
    });
    hook(hookablepegs, elmnt);
  }
}

function hook(pegArray, hat) {
  let peg = pegArray[0];
  if(peg) {
    if (peg.id == "pegs,0,1" || peg.id == "pegs,1,2" || peg.id == "pegs,1,3" || peg.id == "pegs,2,2") {
      pegArray.shift();
      clickPeg({target:peg});
      return hook(pegArray, hat);
    } else {
      hat.style.left = peg.offsetLeft - hat.clientWidth/2 + peg.clientWidth/2 + "px";
      if(hat.id == `hatFour`) {
        peg.style.zIndex = 7;
        hat.hookedOn = peg;
      }
      let topDist = peg.offsetTop - hatHooks[hat.id];
      if(Math.abs(hat.style.top - topDist) < 100) {
        hat.style.top = topDist + "px";
      } else {
        hat.bounces = 0;
        hat.gravity = setInterval(applyGravity, 10, hat, topDist);
      }
    }
  } else {
    hat.gravity = setInterval(applyGravity, 10, hat);
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

function closest(val, arr) {
  return arr.reduce((a, b) => {
    return Math.abs(b - val) < Math.abs(a - val) ? b : a;
  });
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
  if(div.id.includes(`pegs`)) {
    const rand = Math.random() < 0.5;
    if(div.speedX == 0) {
     if(rand) {
       div.speedX = 10;
     } else {
       div.speedX = -10;
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
    }
  } else {
    div.style.top = `${div.offsetTop + div.speedY}px`;
    div.speedY += 1;
  }
}