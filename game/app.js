"use strict";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttonsContainer = document.getElementById('buttons');

let spriteLoaded = false;
let touchedObject = -1;
let selectedObject = null;
let objectsOnCanvas = [];

let cursorStartX = null;
let cursorStartY = null;
let objStartX = null;
let objStartY = null;

const sprite = new Image();

sprite.onload = function() {
	spriteLoaded = true;
	applyFilters();
	draw();
	createObjectsButtons();
}

sprite.src = 'img/sprite/jeanneret.png';

const spriteMap = [
	[0, 0, 730, 634],
	[730, 0, 207, 505],
	[937, 0, 204, 183],
	[1141, 0, 227, 147],
	[1368, 0, 113, 109],
	[1481, 0, 99, 97],
	[1580, 0, 114, 105],
	[1694, 0, 97, 59],
	[1787, 0, 221, 37],
	[2008, 0, 242, 55],
	[2250, 0, 230, 37],
	[2480, 0, 329, 143]
];

function createObjectsButtons() {
	if (!spriteLoaded) return;

	spriteMap.forEach((obj, i) => {
		if (i === 0) return;

		const newSizes = getNewSizes(...obj);
		const button = document.createElement('button');

		button.className = 'itemButton';

		button.style.backgroundImage = 'url(img/sprite/jeanneret.png)';
		button.style.width = `${newSizes.tileW}px`;
		button.style.height = `${newSizes.tileH}px`;
		button.style.backgroundPosition = `-${newSizes.tileX}px -${newSizes.tileY}px`;
		button.style.backgroundSize = `${newSizes.spriteW}px ${newSizes.spriteH}px`

		button.dataset.objectId = i;
		button.innerHTML = `Item ${i}`;
		button.addEventListener('click', toogleObject);

		buttonsContainer.appendChild(button);
	});

	function getNewSizes(x, y, w, h) {
		const maxWidth = 64;
		const maxHeight = 64;

		let diff;
		let newSpriteWidth = sprite.width;
		let newSpriteHeight = sprite.height;
		let newPosX = x;
		let newPosY = y;

		/*if (w > maxWidth) {
			diff = maxWidth / w;
			w = maxWidth;
			newSpriteWidth = sprite.width * diff;
			newSpriteHeight = sprite.height * diff;
		}*/

		if (h > maxHeight) {
			diff = maxHeight / h;
			h = maxHeight;
			w = w * diff;
			newSpriteWidth = sprite.width * diff;
			newSpriteHeight = sprite.height * diff;
			newPosX = Math.floor(x * diff);
			newPosY = Math.floor(y * diff);
		}

		return {
			tileW: Math.floor(w),
			tileH: Math.floor(h),
			spriteW: Math.floor(newSpriteWidth),
			spriteH: Math.floor(newSpriteHeight),
			tileX: newPosX,
			tileY: newPosY
		};
	}
}

function toogleObject() {
	const id = Number(this.dataset.objectId);
	const item = spriteMap[id];
	const onCanvas = objectsOnCanvas.findIndex(obj => obj.id === id);

	if (onCanvas >= 0) {
		objectsOnCanvas.splice(onCanvas, 1);
		this.classList.remove('itemButton-active');
	} else {
		objectsOnCanvas.push({
			id,
			sprite: item,
			x: canvas.width/2,
			y: canvas.height/2
		});

		this.classList.add('itemButton-active');
	}

	draw();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomPercentage(min = 0, max = 100) {
	return getRandomInt(min, max);
}

function randomDegrees(min = 0, max = 359) {
	return getRandomInt(min, max);
}

function applyFilters() {
	ctx.filter = `
		brightness(${randomPercentage(40, 100)}%)
		contrast(${randomPercentage(40, 100)}%)
		grayScale(${randomPercentage()}%)
		hue-rotate(${randomDegrees()}deg)
		saturate(${randomPercentage(0, 200)}%)
		sepia(${randomPercentage()}%)
	`;
}

function paintBg() {
	if (!spriteLoaded) return;

	const s = spriteMap[0];

	const xCenter = Math.floor(canvas.width / 2 - s[2] / 2);
	const yCenter = Math.floor(canvas.height / 2 - s[3] / 2);

	ctx.drawImage(sprite, ...s, xCenter, yCenter, s[2], s[3]);
}

function paintObjects() {
	if (!spriteLoaded) return;

	objectsOnCanvas.forEach(s => {
		const xPos = s.x - Math.floor(s.sprite[2]/2);
		const yPos = s.y - Math.floor(s.sprite[3]/2);

		ctx.drawImage(sprite, ...s.sprite, xPos, yPos, s.sprite[2], s.sprite[3])
	});
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	paintBg();
	paintObjects();
}

function indexOfSelectedObject(coords) {
  for (let i = objectsOnCanvas.length - 1; i >= 0; i--) {
    let obj = objectsOnCanvas[i];

	let objLeft = obj.x - (obj.sprite[2]/2);
	let objRight = obj.x + (obj.sprite[2]/2);
	let objTop = obj.y - (obj.sprite[3]/2);
	let objBottom = obj.y + (obj.sprite[3]/2);

    // DEBUGGING
    //ctx.strokeRect(objLeft, objTop, objRight-objLeft, objBottom-objTop);

    if (coords.x >= objLeft && coords.x <= objRight && coords.y >= objTop && coords.y <= objBottom) {
      return i;
    }
  }

  return -1;
}

function onTouchStartOrMouseDown(e) {
  e.preventDefault();

  const touch = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
  const coords = touch ? { x: touch.pageX - canvas.offsetLeft, y: touch.pageY - canvas.offsetTop} : { x: e.offsetX, y: e.offsetY};

  cursorStartX = coords.x;
  cursorStartY = coords.y;

  touchedObject = indexOfSelectedObject(coords);

  if (touchedObject > -1) {
  	objStartX = objectsOnCanvas[touchedObject].x;
  	objStartY = objectsOnCanvas[touchedObject].y;


    return;
  }
}

function onTouchMoveOrMouseMove(e) {
  e.preventDefault();

  const touches = e.changedTouches || [];
  const touch1 = touches.length ? touches[0] : null;
  const touch2 = touches.length > 1 ? touches[1] : null;

  const coords = touch1 ? { x: touch1.pageX - canvas.offsetLeft, y: touch1.pageY - canvas.offsetTop} : { x: e.offsetX, y: e.offsetY};

  if (touchedObject >= 0) {
    const obj = objectsOnCanvas[touchedObject];

	obj.x = objStartX - (cursorStartX - coords.x);
	obj.y = objStartY - (cursorStartY - coords.y);

	draw();
  }
}

function onTouchEndOrMouseUp(e) {
  touchedObject = -1;
  cursorStartX = null;
  cursorStartY = null;
  objStartX = null;
  objStartY = null;
}

canvas.addEventListener('touchstart', onTouchStartOrMouseDown, false);
canvas.addEventListener('touchmove', onTouchMoveOrMouseMove, false);
canvas.addEventListener('touchend', onTouchEndOrMouseUp, false);

canvas.addEventListener('mousedown', onTouchStartOrMouseDown, false);
canvas.addEventListener('mousemove', onTouchMoveOrMouseMove, false);
canvas.addEventListener('mouseup', onTouchEndOrMouseUp, false);
