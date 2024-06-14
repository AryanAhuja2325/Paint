const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const strokePicker = document.getElementById("stroke");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");
const square = document.getElementById("square");
const circle = document.getElementById("circle");
const text = document.getElementById("text");
const line = document.getElementById("line");
const eraser = document.getElementById("eraser");
const arrow = document.getElementById("arrow");
const drawBtn = document.getElementById("draw");
const widthPicker = document.getElementById('widthPicker');

let offX = canvas.offsetLeft;
let offY = canvas.offsetTop;

canvas.width = window.innerWidth - offX;
canvas.height = window.innerHeight - offY;

let isPainting = false;
let startX;
let startY;
context.lineWidth = 5;

clearBtn.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

strokePicker.addEventListener("change", e => {
    context.strokeStyle = e.target.value;
});

widthPicker.addEventListener("change", e => {
    context.lineWidth = e.target.value;
});

const draw = (e) => {
    if (!isPainting) {
        return;
    }
    context.lineCap = "round";
    context.lineTo(e.clientX - offX, e.clientY - offY);
    context.stroke();
};

const startDrawing = (e) => {
    context.beginPath();
    isPainting = true;
    startX = e.clientX - offX;
    startY = e.clientY - offY;
};

const stopDrawing = () => {
    isPainting = false;
    context.stroke();
    context.beginPath();
};

canvas.addEventListener("mousemove", (e) => {
    if (drawBtn.classList.contains("selected")) {
        draw(e);
    }
});

saveBtn.addEventListener("click", () => {
    var data = canvas.toDataURL();
    var json = JSON.stringify({ imageData: data });
    var blob = new Blob([json], { type: "application/json" });
    var link = document.createElement("a");
    link.download = "canvas.json";
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

openBtn.addEventListener("change", (event) => {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = (event) => {
            var savedData = event.target.result;
            const image = JSON.parse(savedData);
            var img = new Image();
            img.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
            };
            img.src = image.imageData;
        };
        reader.readAsText(file);
    }
});

const deselectAllTools = () => {
    square.classList.remove("selected");
    circle.classList.remove("selected");
    drawBtn.classList.remove("selected");
    text.classList.remove("selected");
    line.classList.remove("selected");
    arrow.classList.remove("selected");
    eraser.classList.remove("selected");

    canvas.style.cursor = "default";
    canvas.removeEventListener("mousedown", mouseDownHandler);
    canvas.removeEventListener("mouseup", mouseUpHandler);
    canvas.removeEventListener("mousedown", startDrawing);
    canvas.removeEventListener("mouseup", stopDrawing);
    canvas.removeEventListener("mousemove", draw);
    canvas.removeEventListener("mousedown", startErasing);
    canvas.removeEventListener("mouseup", stopErasing);
    canvas.removeEventListener("mousemove", erase);

    strokePicker.style.pointerEvents = 'auto';
    strokePicker.style.cursor = 'default';

    // Reset stroke style to selected color after eraser
    context.strokeStyle = strokePicker.value;
};

const mouseDownHandler = (event) => {
    startX = event.clientX - offX;
    startY = event.clientY - offY;
};

const mouseUpHandler = (event) => {
    const endX = event.clientX - offX;
    const endY = event.clientY - offY;
    if (square.classList.contains("selected")) {
        context.strokeRect(startX, startY, endX - startX, endY - startY);
    } else if (circle.classList.contains("selected")) {
        const radius = Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2)) / 2;
        context.beginPath();
        context.arc((startX + endX) / 2, (startY + endY) / 2, radius, 0, Math.PI * 2);
        context.stroke();
    } else if (line.classList.contains("selected")) {
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    } else if (arrow.classList.contains("selected")) {
        drawArrow(context, startX, startY, endX, endY);
    }
};

function drawArrow(context, fromX, fromY, toX, toY) {
    const headlen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
    context.beginPath();
    context.moveTo(toX, toY);
    context.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    context.lineTo(toX, toY);
    context.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    context.stroke();
    context.fill();
}

const startErasing = (e) => {
    context.beginPath();
    isPainting = true;
    startX = e.clientX - offX;
    startY = e.clientY - offY;
};

const stopErasing = () => {
    isPainting = false;
    context.stroke();
    context.beginPath();
};

const erase = (e) => {
    if (!isPainting) return;
    context.lineCap = "round";
    context.lineTo(e.clientX - offX, e.clientY - offY);
    context.stroke();
};

const toggleTool = (tool) => {
    deselectAllTools();
    tool.classList.add("selected");

    if (tool === drawBtn) {
        canvas.style.cursor = "crosshair";
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mousemove", draw);
    } else if (tool === eraser) {
        strokePicker.style.pointerEvents = 'none';
        strokePicker.style.cursor = 'not-allowed';
        context.strokeStyle = "#FFFFFF";
        canvas.style.cursor = "crosshair";
        canvas.addEventListener("mousedown", startErasing);
        canvas.addEventListener("mouseup", stopErasing);
        canvas.addEventListener("mousemove", erase);
    } else if (tool === text) {
        canvas.style.cursor = "text";
        const mouseDownHandler = (event) => {
            startX = event.clientX - offX;
            startY = event.clientY - offY;
            if (text.classList.contains("selected")) {
                const input = document.createElement("input");
                input.type = "text";
                input.style.position = "absolute";
                input.style.left = `${startX}px`;
                input.style.top = `${startY}px`;
                input.style.border = "1px solid #000000";
                input.style.zIndex = 1000;
                input.style.backgroundColor = "white";
                input.placeholder = "Enter text";

                document.body.appendChild(input);
                input.focus();

                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        if (input.value.trim() !== "") {
                            context.font = "16px Arial";
                            context.fillStyle = context.strokeStyle;
                            context.fillText(input.value, startX, startY);
                        }
                        document.body.removeChild(input);
                    }
                });
            }
        };
        canvas.addEventListener("mousedown", mouseDownHandler);
    } else {
        canvas.style.cursor = "crosshair";
        canvas.addEventListener("mousedown", mouseDownHandler);
        canvas.addEventListener("mouseup", mouseUpHandler);
    }
};

square.addEventListener("click", () => toggleTool(square));
circle.addEventListener("click", () => toggleTool(circle));
drawBtn.addEventListener("click", () => toggleTool(drawBtn));
text.addEventListener("click", () => toggleTool(text));
line.addEventListener("click", () => toggleTool(line));
arrow.addEventListener("click", () => toggleTool(arrow));
eraser.addEventListener("click", () => toggleTool(eraser));
