var trait1Name = `A`;
var trait2Name = `B`;
var trait3Name = `C`;
var allInputs = document.getElementsByClassName('inputs');
var snapToWidth = [];
var snapToWidthClue1 = [];
var snapToWidthClue2 = [];
var bookPositions = {};
var gameScreen = document.getElementById("game");
var totalBooks, correctAnswer;
var ruletraitOrders = [`ABABACA`,`AABAACB`, `AABCBAA`, `BAACAAB`];
var bookHeights = `500px`;
var glassActive = true;
var allCheckboxes = [{id:"rule1"}, {id:"rule2"}, {id:"rule3"}];

Array.from(allInputs).forEach(function(singleInput){
  singleInput.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13 || singleInput.value.length == 1) {
      // Focus on the next sibling
      singleInput.nextElementSibling.focus();
      singleInput.nextElementSibling.select();
    }
  });
})

window.onload = (event) => {
	var searchParams = new URLSearchParams(window.location.search);
	if(searchParams.size == 0) {
		const paramStr = "Booktable=false&Fuse%20Box1=false&Fuse%20Box2=false&Wall=false&Hat%20Rack1=false&Hat%20Rack2=false&Hat%20Rack3=false";
		searchParams = new URLSearchParams(paramStr);
	}
	if(searchParams.get("Booktable") === "true") {
		glassActive = false;
	} else {
		glassActive = true;
	}
	let link = document.getElementById("backButton");
	link.href += `?${searchParams.toString()}`;
	startGame(["ABACABA"], [4,2,1, "AAAABBC"]);
}

function tryValues() {
	var trait1 = document.getElementById("trait1A").value;
	var trait2 = document.getElementById("trait1B").value;
	var trait3 = document.getElementById("trait1C").value;
	var allTraits = `${trait1Name.repeat(trait1)}${trait2Name.repeat(trait2)}${trait3Name.repeat(trait3)}`;
	var allPermutations = allPerms(allTraits);
	//apply the rules
	allPermutations = applyRules(allPermutations);

	var results = `${allPermutations.length}`;

	for (permutation of allPermutations) {
		results = results.concat(`<br>`, permutation);
	}
	let resultDiv = document.getElementById("results");
	resultDiv.innerHTML = results;
	
	if(allPermutations.length == 1) {
		var gameData = [Number(trait1), Number(trait2), Number(trait3), allTraits];
		var tryThis = document.getElementById("tryThis");
		tryThis.style.display = "inline";
		tryThis.style.fontSize = "18px";
		tryThis.style.padding = "6px 10px";
		tryThis.onclick = function() {startGame(allPermutations, gameData);};
	} else {
		var tryThis = document.getElementById("tryThis");
		tryThis.style.display = "none";
	}
}

function applyRules(allPermsArray) {
	//must be in series order
	if(document.getElementById("rule2").checked) {
		allPermsArray = allPermsArray.filter((value, index) => allPermsArray.indexOf(value) === index);		
	}

	//must be palindromic
	if(document.getElementById("rule3").checked) {
		allPermsArray = allPermsArray.filter((value, index) => {
		  let re = /[\W_]/g;
		  let lowRegStr = value.toLowerCase().replace(re, '');
		  let reverseStr = lowRegStr.split('').reverse().join(''); 
		  return reverseStr === lowRegStr;
		});	
	}

	return allPermsArray;
}

const allPerms = (string) => {
  if (typeof string !== 'string') {
    throw new Error('Parameter must be a string.');
  }

  if (string === '') {
    throw new Error('Parameter cannot be an empty string.');
  }


  const perms = (str) => {
    const result = [];
    if (str.length < 2) return [str];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const otherChars = str.substring(0, i) + str.substring(i + 1);
      const otherPerms = perms(otherChars);
      otherPerms.forEach(x => {
        result.push(char + x)
      });
    }
    return result;
  }

  const permutations = perms(string);
	if(document.getElementById("rule1").checked) {
	  const hasRepeat = (str) => {
	    let prevChar = str[0];
	    for (let i = 1; i < str.length; i++) {
	      if (prevChar === str[i]) return true;
	      prevChar = str[i];
	    }
	    return false;
	  }

	  const noRepeatPerms = [];
	  for (const str of permutations) {
	    if (!hasRepeat(str)) {
	      noRepeatPerms.push(str);
	    }
	  }

	  return noRepeatPerms;
	} else {
		return permutations;
	}
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
		    Array.from(document.querySelectorAll(`.books`)).forEach((div) => {
		      if(div.style.zIndex > elmnt.style.zIndex && div.id != elmnt.id) {
		        div.style.zIndex = div.style.zIndex-1;
		      }
		    });
		    elmnt.style.zIndex = Array.from(document.querySelectorAll(`.books`)).length;
        pos3 = parseInt(e.clientX);
        pos4 = parseInt(e.clientY);
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        return false;
    }

    function elementDrag(e) {
        e = e || window.event;
        pos1 = pos3 - parseInt(e.clientX);
        pos2 = pos4 - parseInt(e.clientY);
        pos3 = parseInt(e.clientX);
        pos4 = parseInt(e.clientY);
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement(e) {
    		let transitionTime = 0.2;
        document.onmouseup = null;
        document.onmousemove = null;
        elmnt.style.top = `${gameScreen.offsetTop}px`;
        let placeLocation = closest(e.clientX - gameScreen.parentElement.offsetLeft,snapToWidth);
        if(!Number.isFinite(placeLocation)){
        	elmnt.style.left = bookPositions[elmnt.id] + "px"; 
        	return false;
        }
        let oldLocation = bookPositions[elmnt.id];
        let newLocationBookID = getKeyByValue(bookPositions, placeLocation);
        let newLocationBook = document.getElementById(newLocationBookID);
        newLocationBook.style.transition = `all ${transitionTime}s ease-out`;
        elmnt.style.transition = `all ${transitionTime}s ease-out`;
        newLocationBook.addEventListener(`transitionend`, removeTransition);
        elmnt.addEventListener(`transitionend`, removeTransition);
        newLocationBook.style.left = oldLocation + "px";
     // THIS WILL BE CODE THAT SHIFTS THINGS OVER
        if(placeLocation < oldLocation) {
        	let shiftSnaps = snapToWidth.slice(snapToWidth.indexOf(placeLocation), snapToWidth.indexOf(oldLocation)+1);
        	let moveNum = 0;
        	let bookNewPositions = {};
        	for (const i of shiftSnaps) {
        		moveNum++;
        		if(i != shiftSnaps[shiftSnaps.length-1]) {
			        let newLocationBookID = getKeyByValue(bookPositions, i);
			        let newLocationBook = document.getElementById(newLocationBookID);
			        newLocationBook.style.transition = `all ${transitionTime}s ease-out`;
			        newLocationBook.addEventListener(`transitionend`, removeTransition);
			        newLocationBook.style.left = `${shiftSnaps[moveNum]}px`;
			        bookNewPositions[newLocationBookID] = shiftSnaps[moveNum];
        		}
        	}
        	for (const swapper in bookNewPositions) {
        		bookPositions[swapper] = bookNewPositions[swapper];
        	}
        } else if (placeLocation > oldLocation) {
        	let shiftSnaps = snapToWidth.slice( snapToWidth.indexOf(oldLocation),snapToWidth.indexOf(placeLocation)+1);
        	let moveNum = 0;
        	let bookNewPositions = {};
        	shiftSnaps = shiftSnaps.reverse();
        	for (const i of shiftSnaps) {
        		moveNum++;
        		if(i != shiftSnaps[shiftSnaps.length-1]) {
			        let newLocationBookID = getKeyByValue(bookPositions, i);
			        let newLocationBook = document.getElementById(newLocationBookID);
			        newLocationBook.style.transition = `all ${transitionTime}s ease-out`;
			        newLocationBook.addEventListener(`transitionend`, removeTransition);
			        newLocationBook.style.left = `${shiftSnaps[moveNum]}px`;
			        bookNewPositions[newLocationBookID] = shiftSnaps[moveNum];
        		}
        	}
        	for (const swapper in bookNewPositions) {
        		bookPositions[swapper] = bookNewPositions[swapper];
        	}
        }
        bookPositions[elmnt.id] = placeLocation;
        elmnt.style.left = placeLocation + "px"; 
        let firstCheck = checkFirstIndicator();
        let secondCheck = checkSecondIndicator();
        let thirdCheck = checkThirdIndicator();     
     //    if(firstCheck && secondCheck && thirdCheck) {
					// document.querySelectorAll('.books').forEach(item => {
					//     item.style.backgroundColor = "#186132";
					// })
     //    }
    }
}

function removeTransition(event) {
	event.target.style.transition = ``;
}

function checkFirstIndicator() {
	//traits cannot touch another of the same trait
	let lastBookTrait = ``;
	let firstIndicator = document.getElementById(`rule1Indicator`);
	for (const spot of snapToWidth) {
		let currentBookTrait = document.getElementById(getKeyByValue(bookPositions, spot)).altID.slice(0,1);
		if(currentBookTrait == lastBookTrait) {
			firstIndicator.style.backgroundColor = `#186132`;
			return false;
		} else {
			lastBookTrait = currentBookTrait;
		}
	}
	firstIndicator.style.backgroundColor = `#b0e476`;
	return true;
}

function checkSecondIndicator() {
	//traits must be in series order
	let letterArrayIndicator = [0, 0, 0];
	let secondIndicator = document.getElementById(`rule2Indicator`);
	for (const spot of snapToWidth) {
		let currentBookTrait = document.getElementById(getKeyByValue(bookPositions, spot)).altID.slice(0,2);
		if (currentBookTrait.charAt(0) == `A`) {
			letterArrayIndicator[0]++;
			if(currentBookTrait.charAt(1) != letterArrayIndicator[0]) {
				secondIndicator.style.backgroundColor = `#186132`;
				return false;
			}
		} else if (currentBookTrait.charAt(0) == `B`) {
			letterArrayIndicator[1]++;
			if(currentBookTrait.charAt(1) != letterArrayIndicator[1]) {
				secondIndicator.style.backgroundColor = `#186132`;
				return false;
			}
		} else {
			letterArrayIndicator[2]++;
			if(currentBookTrait.charAt(1) != letterArrayIndicator[2]) {
				secondIndicator.style.backgroundColor = `#186132`;
				return false;	
			}
		}
	}
		secondIndicator.style.backgroundColor = `#b0e476`;
		return true;
}

function checkThirdIndicator() {
	//traits must be palindromic
	let thirdIndicator = document.getElementById(`rule3Indicator`);
	let positionalString = [];
	for (const spot of snapToWidth) {
		let currentBookTrait = document.getElementById(getKeyByValue(bookPositions, spot)).altID.slice(0,1);
		positionalString.push(currentBookTrait);
	}
	if(positionalString.join(``) != positionalString.reverse().join(``)) {
		thirdIndicator.style.backgroundColor = `#186132`;
		return false;	
	}
	thirdIndicator.style.backgroundColor = `#b0e476`;
	return true;
}

function closest(val,arr){
    return Math.max.apply(null, arr.filter(function(v){return v <= val}))
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


function startGame(permutationArray, startData) {
	correctAnswer = permutationArray;
	var allTraits = startData.pop();
	totalBooks = startData.reduce((accumulator, currentValue) => {
  		return accumulator + currentValue
	},0);
	let indicatorLights = document.getElementsByClassName(`indicators`);
	let photographs = document.getElementsByClassName('others');
	let photographIterator = 0;
	Array.from(photographs).forEach(function(photograph){
		photograph.traitOrder = ruletraitOrders[photographIterator];
		photograph.altID = photographIterator;
		photographIterator++;
	});
	let onIndicators = [
		`rule1Indicator0`,
		`rule2Indicator1`,
		`rule3Indicator3`,
		`rule2Indicator4`,
		`rule3Indicator4`,
	];
	Array.from(indicatorLights).forEach(function(singleIndicator){
		// singleIndicator.style.height = `7vh`;
		singleIndicator.style.width = `100px`;
		Array.from(allCheckboxes).forEach(function(singleInput){
			let indicatorLight = document.createElement("div");
			indicatorLight.classList.add(`indicator`);
			if(singleIndicator.id == indicatorLights[0].id) {
				indicatorLight.id = `${singleInput.id}Indicator`;		
			} else{
				indicatorLight.id = `${singleInput.id}Indicator${Array.from(indicatorLights).indexOf(singleIndicator)}`;
				// console.log(indicatorLight);
				if(onIndicators.includes(indicatorLight.id)) {
					indicatorLight.style.backgroundColor = `#b0e476`;
				}
			}

			indicatorLight.style.width = `40px`;
			indicatorLight.style.height = `40px`;
			singleIndicator.appendChild(indicatorLight);
		});
	});
	gameScreen.style.height = bookHeights;
	gameScreen.style.width = bookHeights.replace(`px`,``) * 1.3 + `px`;
	let bookNum = 1;
	let actualSizes = [];
	for (let i = 0; i < totalBooks; i++) {
		let bookDivHole = document.createElement("div");
		bookDivHole.classList.add(`bookHoles`);
		let bookDiv = document.createElement("div");
		bookDiv.classList.add(`books`);
		if(allTraits.charAt(i) == allTraits.charAt(i-1)) {
			bookNum++;
		} else {
			bookNum = 1;
		}
		if (allTraits.charAt(i) == `A`) {
			//bookDiv.innerHTML = `${historyTitles[bookNum-1]}`;
			bookDiv.altID = `${allTraits.charAt(i)}${bookNum}`;
		} else if (allTraits.charAt(i) == `B`) {
			//bookDiv.innerHTML = `${mathTitles[bookNum-1]}`;
			bookDiv.altID = `${allTraits.charAt(i)}${bookNum}`;
		} else {
			//bookDiv.innerHTML = `${artTitles[bookNum-1]}`;
			bookDiv.altID = `${allTraits.charAt(i)}${bookNum}`;
		}
		bookDiv.id = `bookDiv${i}`;
		bookDiv.zIndex = i+1;
		bookDiv.style.backgroundImage = `url("./allbooks/book${i+1}.png")`;
		if(glassActive) {
			var glassPosition = document.getElementById('glassPosition');
			glassPosition.classList.add("glass");
		} else {
			var stickynote = document.getElementById('sticky');
			stickynote.style.visibility = "hidden";
			dragElement(bookDiv);	
		}
		
		gameScreen.appendChild(bookDivHole);
		actualSizes[0] = `${bookDivHole.clientHeight}px`;
		actualSizes[1] = `${bookDivHole.clientWidth}px`;
		bookDivHole.appendChild(bookDiv);
		let snapToDistance = gameScreen.clientWidth / totalBooks;
		snapToWidth.push(Math.ceil(i * snapToDistance) + gameScreen.offsetLeft + 3);
		bookDiv.style.left = `${snapToWidth[snapToWidth.length - 1]}px`;
		bookDiv.style.top = `${gameScreen.offsetTop}px`;
		bookPositions[bookDiv.id] = snapToWidth[snapToWidth.length - 1];
	}
	let allBooks = document.getElementsByClassName('books');
	Array.from(allBooks).forEach(function(singleBooks){
		singleBooks.style.height = gameScreen.style.height;
		singleBooks.style.width = actualSizes[1];
		//singleBooks.style.width = `${singleBooks.style.height.replace(/\D/g,'')/4.9}vh`;
		singleBooks.style.backgroundSize = `${singleBooks.style.width} ${singleBooks.style.height}`;
	});
	let snapPointArray = Object.values(bookPositions);
	let idArray = Object.keys(bookPositions);

	shuffle(idArray);
	
	for (const id of idArray) {
		let idDiv = document.getElementById(id);
		idDiv.style.left = `${snapToWidth[idArray.indexOf(id)]}px`;
		bookPositions[id] = snapToWidth[idArray.indexOf(id)];
	}
	allBooks = document.getElementsByClassName('books2');
	Array.from(allBooks).forEach(function(singleBooks){
		singleBooks.style.height = actualSizes[0];
		singleBooks.style.width = actualSizes[1];
		singleBooks.style.backgroundSize = `${singleBooks.style.width} ${singleBooks.style.height}`;
	});
  checkFirstIndicator();
  checkSecondIndicator();
	checkThirdIndicator();  
}