let circleColor;
let offsetX = 0
let offsetY = 0
let rows = 120
let columns = 120
let scale = 1
let noModScale = -1
let clicked = false
let ctrlDown = false
let justUndid = false
let hexColors = []
let times = 0
let mult = 1

const socket = io("https://charter-game.onrender.com")

let pick = false
let prevTool = ""
let addingNode = ""
let nodesX = []
let nodesY = []
let nodesContent = []
let nodesSize = []
let node = 0
let textBigness = 12
let joinCode = null

let canDrag = false
let colorHex = false
let canDraw = false
let addNode = false

let joinRoomButton = document.getElementById("joinRoomButton")
joinRoomButton.addEventListener("click", () => {
  const code = prompt("Join/Create a room. If the code entered is not a room code, a new room will be created.", "Room Code Here")
  if (code && code.trim() !== "") {
    joinCode = code.trim()
    socket.emit("joinRoom", joinCode.trim());
    console.log("Join request sent:", joinCode.trim());
    joinRoomButton.style.display = "none"
    const holder = document.getElementById("toolHolder");
    const p = document.createElement("p");
    p.textContent = `Room Joined: ${joinCode}`;
    holder.prepend(p);

  }
  socket.emit("createRoom", {
    roomId: joinCode,
    initPackage: {
      content: nodesContent,
      x: nodesX,
      y: nodesY,
      size: nodesSize,
      hexArray: hexColors
    }
  })

})

let defaultButton = document.getElementById("defaultSize")
defaultButton.addEventListener("click", () => {
  textBigness = 13;
})

let tool = document.getElementById("tool")

let colorHexDiv = document.getElementById("colorHexDiv")
let nodeAdder = document.getElementById("addNode")

let redSlider = document.getElementById("hexColorRed")
let greenSlider = document.getElementById("hexColorGreen")
let blueSlider = document.getElementById("hexColorBlue")
let sample = document.getElementById("sample")

function updateHex (row, col, rgbArray) {
  hexColors[row][col] = color(...rgbArray)
}

function updateNodes (content, x, y, size) {
  nodesContent = content
  nodesX = x
  nodesY = y
  nodesSize = size
}

function sendNodeData (roomId, nodePackage) {
  socket.emit("changeNodes", {roomId, nodePackage})
}

function mouseOver() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function sendHexData (roomId, row, col, color) {
  socket.emit("tileChange", {roomId, row, col, color})
}

function askFullscreen() {
  let wantsFullscreen = confirm("Do you want to enter fullscreen mode?");
  if (wantsFullscreen) {
    let canvas = document.querySelector("canvas");
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen(); // Safari
    } else if (canvas.msRequestFullscreen) {
      canvas.msRequestFullscreen(); // IE/Edge
    }
  }
}

function setup() {
  hexColors = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => color(150, 150, 150))
  )
  socket.on("tileChange", data => {
    updateHex(data["row"], data["col"], data["color"])
  })
  socket.on("changeNodes", data => {
    updateNodes(data["nodePackage"]["content"], data["nodePackage"]["x"], data["nodePackage"]["y"], data["nodePackage"]["size"])
  })
    createCanvas(windowWidth, windowHeight);
  circleColor = color(150, 150, 150);
  for (let row = 0; row < rows; row++) {
    hexColors[row] = [];
    for (let col = 0; col < columns; col++) {
      hexColors[row][col] = color(150, 150, 150); // default gray
    }
  }
  console.log(JSON.stringify(hexColors))
  socket.on("initState", data => {
    updateNodes(
      data.nodes.content,
      data.nodes.x,
      data.nodes.y,
      data.nodes.size
    )
    if (Array.isArray(data?.hexArray)) {
      /*for (let row = 0; row < rows; row++) {
        hexColors[row] = []
      for (let col = 0; col < columns; col++) {
        //hexColors[row][col] =  // default gray
      }
      */
    }

    hexColors = data.hexArray
  })
}

function drawPolygon(x, y, radius, sides) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    let angle = TWO_PI * i / sides;
    let px = x + radius * cos(angle);
    let py = y + radius * sin(angle);
    vertex(px, py);
  }
  endShape(CLOSE);
  
}

function createNode () {
    let nodeToAdd = document.getElementById("nodeToAdd").value
    addingNode = nodeToAdd
}

function isMouseOverHex(mx, my, hx, hy, radius) {
  let d = dist(mx, my, hx, hy);
  return d < radius;
}


function isPointInPolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i][0], yi = vertices[i][1];
    let xj = vertices[j][0], yj = vertices[j][1];

    let intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}


function draw() {
    //console.log(addingNode)
    translate(offsetX, offsetY)
    background(220);
    fill(circleColor);
    let radius = 50
    const width = radius * 2
    const height = sqrt(3) * radius
    for (let row = 0; row < rows; row ++) {
        for (let col = 0; col < columns; col ++) {
            let x = col * width * scale * 0.75
            let y = row * height * scale
            if (col % 2 === 1) y += height * scale / 2
            /*
            if (isMouseOverHex(x - offsetX, y - offsetY, radius)) {
                if (clicked && colorHex) {
                    hexColors[row][col] = color(Number(red.value), Number(green.value), Number(blue.value))
                    clicked = false
                    //return
                }
            }
            */
            fill(hexColors[row][col])
            drawPolygon(x, y, radius * scale, 6)
        }
    }
    if (tool.value === "drag") {
        canDrag = true
        colorHex = false
        canDraw = false
        addNode = false
    }
    else if (tool.value === "colorHex") {
        canDrag = false
        colorHex = true
        canDraw = false
        addNode = false
    }
    else if (tool.value === "draw") {
        canDrag = false
        colorHex = false
        canDraw = true
        addNode = false
    }
    else if (tool.value === "addNode") {
        canDrag = false
        colorHex = false
        canDraw = false
        addNode = true
    }
    
    if (colorHex) {
        colorHexDiv.style.display = "block"
        sample.style.backgroundColor = `rgb(${Number(redSlider.value)}, ${Number(greenSlider.value)}, ${Number(blueSlider.value)})`
    }
    else {
        colorHexDiv.style.display = "none"
    }
    if (addNode) {
        nodeAdder.style.display = "block"
        nodesX[node] = (mouseX - offsetX) / scale
        nodesY[node] = (mouseY - offsetY) / scale
        nodesSize[node] = textBigness
        nodesContent[node] = addingNode
    }
    else {
        nodeAdder.style.display = "none"
    }
    if (!Array.isArray(nodesContent)) {
      console.warn('nodesContent is not ready yet:', nodesContent);
      return; // skip drawing until it's valid
    }
    if (!Array.isArray(nodesSize)) {
      console.warn('nodesSize is not ready yet:', nodesContent);
      return; // skip drawing until it's valid
    }
    if (!Array.isArray(nodesX)) {
      console.warn('nodesX is not ready yet:', nodesContent);
      return; // skip drawing until it's valid
    }
    if (!Array.isArray(nodesY)) {
      console.warn('nodesY is not ready yet:', nodesContent);
      return; // skip drawing until it's valid
    }

    for (i = 0; i < nodesContent.length; i ++) {
        fill(0, 0, 0)
        textSize(nodesSize[i] * scale)
        text(nodesContent[i], nodesX[i] * scale, nodesY[i] * scale)
        textSize(13)
    }
}

function mouseDragged() {
    if (canDrag) {
        offsetX += mouseX - pmouseX;
        offsetY += mouseY - pmouseY
    }
}

function mouseClicked() {
  if (colorHex) {
    let radius = 50;
    const width = radius * 2;
    const height = sqrt(3) * radius;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        let x = col * width * scale * 0.75;
        let y = row * height * scale;
        if (col % 2 === 1) y += height * scale / 2;

        // Adjust for canvas translation
        let adjustedX = x + offsetX;
        let adjustedY = y + offsetY;

        if (isMouseOverHex(mouseX, mouseY, adjustedX, adjustedY, radius * scale)) {
          if (pick) {
            let pickColor = hexColors[row][col]
            redSlider.value = red(pickColor).toFixed(0)
            greenSlider.value = green(pickColor).toFixed(0)
            blueSlider.value = blue(pickColor).toFixed(0)
          }
          else {
            hexColors[row][col] = color(Number(redSlider.value), Number(greenSlider.value), Number(blueSlider.value));
            sendHexData(joinCode, row, col, [Number(redSlider.value), Number(greenSlider.value), Number(blueSlider.value)])
          }
          return; // stop after coloring one hex
        }
      }
    }
  }
  if (addNode && mouseOver()) {
    node ++
    sendNodeData(joinCode, {
      content: nodesContent,
      x: nodesX,
      y: nodesY,
      size: nodesSize
    })
  }
}

keyPressed = function () {
    if (keyCode === SHIFT) {
        pick = true
    }
    if (keyCode === ALT) {
        prevTool = tool.value
        tool.value = "drag"
    }
    if (addNode && ctrlDown && keyCode === 90) {
        nodesX.splice(nodesX.length - 2, 1)
        nodesY.splice(nodesY.length - 2, 1)
        nodesContent.splice(nodesContent.length - 2, 1)
        nodesSize.splice(nodesSize.length, -2, 1)
        node --
        sendNodeData(joinCode, {
          content: nodesContent,
          x: nodesX,
          y: nodesY,
          size: nodesSize
        })
    }
    if (keyCode === CONTROL) {
        ctrlDown = true
    }
    if (keyCode === UP_ARROW) {
        textBigness ++
    }
    if (keyCode === DOWN_ARROW) {
        textBigness --
    }
    if (keyCode === 187) {
        scale += 0.1
    }
    if (keyCode === 189) {
        scale -= 0.1
        scale = Math.max(0.1, scale)
    }
    if (keyCode === 70) {
        askFullscreen()
    }
}

keyReleased = function () {
    if (keyCode === SHIFT) {
        pick = false
    }
    if (keyCode === ALT) {
        tool.value = prevTool
    }
    if (keyCode === CONTROL) {
        ctrlDown = false
    }
}
 