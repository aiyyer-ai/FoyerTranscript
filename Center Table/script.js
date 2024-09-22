window.onload = (event) => {
//in case I want to make something run at launch
  var searchParams = new URLSearchParams(window.location.search);
  if(searchParams.size == 0) {
    const paramStr = "Booktable=false&Fuse%20Box1=false&Fuse%20Box2=false&Wall=false&Hat%20Rack1=false&Hat%20Rack2=false&Hat%20Rack3=false";
    searchParams = new URLSearchParams(paramStr);
  }
  let link = document.getElementById("backButton");
  link.href += `?${searchParams.toString()}`;
  loadImages();
}

function loadImages() {
  let totalImages = 10;
  for(i=1; i<=totalImages; i++) {
    let img = new Image();
    img.count = i;
    img.onload = addToPage;
    img.src = `./images/item${i}.png`;
  }
  function addToPage() {
    let imgContainer = document.createElement(`div`);
    imgContainer.classList.add(`imgcontainer`);
    imgContainer.appendChild(this);
    let mainDiv = document.getElementById(`gameArea`);
    mainDiv.appendChild(imgContainer);
    dragElement(imgContainer);
    if(imgContainer.clientWidth > 400) {
      imgContainer.style.width = `600px`;
    }
    let topPosition = Math.floor(Math.random() * ((window.innerHeight - imgContainer.clientHeight) + 1));
    let leftPosition = Math.floor(Math.random() * ((window.innerWidth - imgContainer.clientWidth) + 1));
    imgContainer.style.zIndex = this.count;
    imgContainer.id = this.count;
    if(imgContainer.id == 6) {
      imgContainer.style.width = `800px`;
    }
    imgContainer.style.top = topPosition + `px`;
    imgContainer.style.left = leftPosition + `px`;
    console.log(imgContainer);
  }
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
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}