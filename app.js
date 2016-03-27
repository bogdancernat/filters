var canvas = document.querySelector('#canvas')
, context  = canvas.getContext('2d')
, image = {
  element: null,
  canvas: {
    x: null,
    y: null,
    width: null,
    height: null,
    data: null
  }
}
, lastMousePosition = {x: 0, y: 0}
, mousePositionOnImage = {x: 0, y: 0}
, resizeTimeoutId = null
, animationID = null
, blockSize = {width: 200, height: 200}
, gridCellSize = {width: 20, height: 20}
;

init();

function loadImage(callback) {
  var imageName = canvas.dataset.image
  , img = new Image()
  ;

  img.onload = function (event) {
    callback(img);
  };

  if (imageName) {
    img.src = imageName;  
  } else {
    console.error('No image present in canvas dataset attribute image');
  }
}

function setListeners() {
  canvas.addEventListener("mousemove", function (event) {
    lastMousePosition.x = event.offsetX;
    lastMousePosition.y = event.offsetY;

    if (image.canvas.x != null) {
      mousePositionOnImage.x = event.offsetX - image.canvas.x;
      mousePositionOnImage.y = event.offsetY - image.canvas.y;
    }
  });
}

function init() {
  refitCanvas();
  clearCanvas();
  setListeners();

  loadImage(function (image) {
    window.image.element = image;
    draw();
  });
}

function draw() {
  if (image.element) {
    animate();
  }
}

function animate() {
  clearCanvas();
  drawImageOnCanvas(image, context);
  haveFunWithPixels();
  animationID = requestAnimationFrame(animate);
}

function haveFunWithPixels() {
  var img = window.image;

  var imageData = img.canvas.data;

  var start = { x: null, y: null};
  var end = { x: null, y: null};

  start.x = Math.floor(atMost(atLeast(mousePositionOnImage.x - blockSize.width / 2, img.canvas.x), img.canvas.width));
  start.y = Math.floor(atMost(atLeast(mousePositionOnImage.y - blockSize.height / 2, img.canvas.y), img.canvas.height));

  end.x = Math.floor(atMost(mousePositionOnImage.x + blockSize.width / 2, img.canvas.width));
  end.y = Math.floor(atMost(mousePositionOnImage.y + blockSize.height / 2, img.canvas.height));

  if (start.x < end.x && start.y < end.y) {
    var imageDataSlice = getSliceOfImageData(imageData, start, end);

    filterImageData(imageDataSlice, "grayscale");
    filterImageData(imageDataSlice, "sepia");
    filterImageData(imageDataSlice, "pixelate");

    window.context.putImageData(imageDataSlice, img.canvas.x + start.x, img.canvas.y + start.y);
  }
}


function filterImageData(imageData, filter) {

  switch (filter) {
    case 'grayscale': 
      filterGrayscale(imageData);
      break;
    case 'sepia':
      filterSepia(imageData);
      break;
    case 'pixelate':
      filterPixelate(imageData);
      break;
    default:

  }
}

function filterPixelate(imageData) {
  var columns = 5;
  var columnWidth = imageData.width / columns;
  var columnHeight = imageData.height / columns;
  var columnMinSize = 20;

  // console.log(imageData);
  for (var i = 0; i < columns; i++) {
    
  }
}

function filterSepia(imageData) {
  for (var i = 0; i < imageData.data.length; i+=4) {
    var offset = 0;

    var rgb = [imageData.data[i + offset++], imageData.data[i + offset++], imageData.data[i + offset]];

    offset = 0;

    imageData.data[i + offset++] = atMost(rgb[0] * 0.393 + rgb[1] * 0.769 + rgb[2] * 0.189, 255);
    imageData.data[i + offset++] = atMost(rgb[0] * 0.349 + rgb[1] * 0.686 + rgb[2] * 0.168, 255);
    imageData.data[i + offset++] = atMost(rgb[0] * 0.272 + rgb[1] * 0.534 + rgb[2] * 0.131, 255);
  };
}

function filterGrayscale(imageData) {
  for (var i = 0; i < imageData.data.length; i+=4) {
    var offset = 0;
    var avg = 0;

    avg += imageData.data[i + offset++];
    avg += imageData.data[i + offset++];
    avg += imageData.data[i + offset];
    avg = Math.floor(avg / 3);

    offset = 0;

    imageData.data[i + offset++] = avg;
    imageData.data[i + offset++] = avg;
    imageData.data[i + offset] = avg;
  };
}

function drawImageOnCanvas(imgObject, context) {
  var canvas = context.canvas;
  var img = imgObject.element;

  var ratios = {
    horizontal: canvas.width / img.width,
    vertical: canvas.height / img.height
  };

  var ratio = Math.min(ratios.horizontal, ratios.vertical);
  var centerShift = {
    x: (canvas.width - img.width*ratio ) / 2,
    y: (canvas.height - img.height*ratio ) / 2
  };

  imgObject.canvas.x = Math.floor(centerShift.x);
  imgObject.canvas.y = Math.floor(centerShift.y);
  imgObject.canvas.width = Math.floor(img.width * ratio);
  imgObject.canvas.height = Math.floor(img.height * ratio);

  context.drawImage(img,
    0, 0, img.width, img.height,
    centerShift.x, centerShift.y, imgObject.canvas.width, imgObject.canvas.height);
  
  imgObject.canvas.data = context.getImageData(imgObject.canvas.x, imgObject.canvas.y, imgObject.canvas.width, imgObject.canvas.height);
}

function getSliceOfImageData(imageData, startPoint, endPoint) {
  var width = endPoint.x - startPoint.x;
  var height = endPoint.y - startPoint.y;
  var pixelArray = null;

  var lengthOfUint8Array = 4 * (endPoint.x - startPoint.x) * (endPoint.y - startPoint.y);
  var pixelArray = new Uint8ClampedArray(lengthOfUint8Array);

  var dataIndex = 0;


  for (var row = startPoint.y; row < endPoint.y; row++) {
    var rowOffset = imageData.width * 4 * row;

    for (var column = startPoint.x; column < endPoint.x; column++) {
      var pixelStart  = rowOffset + 4 * column;

      pixelArray[dataIndex++] = imageData.data[pixelStart++]
      pixelArray[dataIndex++] = imageData.data[pixelStart++]
      pixelArray[dataIndex++] = imageData.data[pixelStart++]
      pixelArray[dataIndex++] = imageData.data[pixelStart++]
    }
  }

  var i = new ImageData(pixelArray, width, height);
  return i;
}

function refitCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function clearCanvas() {
  context.fillColor = "rgb(34, 34, 34)";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function atLeastZero(value) {
  return atLeast(value, 0);
}

function atLeast(value, min) {
  if (value < 0) {
    return 0;
  }

  return value;
}

function atMost(value, max) {
  if (value > max) {
    return max;
  }

  return value;
}

window.onresize = function () {
  clearTimeout(resizeTimeoutId);
  resizeTimeoutId = setTimeout(function() {
    if (window.animationID) {
      cancelAnimationFrame(window.animationID);
    }

    refitCanvas();
    clearCanvas();
    draw();
  }, 250);
};