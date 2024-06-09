const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const strokePicker = document.getElementById("stroke");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");
const square = document.getElementById("square");
const circle = document.getElementById("circle");
const text = document.getElementById("text");
const drawBtn = document.getElementById("draw");


let offX = canvas.offsetLeft;
let offY = canvas.offsetTop;

canvas.width = window.innerWidth - offX;
canvas.height = window.innerHeight - offY;

let isPainting = false;
let linewidth = 5;
let startX;
let startY;

clearBtn.addEventListener("click", e => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

strokePicker.addEventListener("change", e => {
    context.strokeStyle = e.target.value;
});

const draw = (e) => {
    if (!isPainting) {
        return;
    }

    context.lineWidth = linewidth;
    context.lineCap = "round";

    context.lineTo(e.clientX - offX, e.clientY - offY);
    context.stroke();
};

const startDrawing = (e) => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
};

const stopDrawing = (e) => {
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

const toggleSquareTool = () => {
    circle.classList.remove("selected");
    drawBtn.classList.remove("selected");
    square.classList.toggle("selected");
    text.classList.remove("selected");
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const mouseDownHandler = (event) => {
        startX = event.clientX;
        startY = event.clientY;
    };

    const mouseUpHandler = (event) => {
        if (square.classList.contains("selected")) {
            endX = event.clientX;
            endY = event.clientY;
            var w = endX - startX;
            var h = endY - startY;
            context.strokeRect(startX - offX, startY - offY, w, h);
        }
    };

    if (square.classList.contains("selected")) {
        canvas.style.cursor = "crosshair";
        canvas.addEventListener("mousedown", mouseDownHandler);
        canvas.addEventListener("mouseup", mouseUpHandler);
    } else {
        canvas.style.cursor = "default";
        canvas.removeEventListener("mousedown", mouseDownHandler);
        canvas.removeEventListener("mouseup", mouseUpHandler);
    }
};

const toggleCircleTool = () => {
    circle.classList.toggle("selected");
    drawBtn.classList.remove("selected");
    square.classList.remove("selected");
    text.classList.remove("selected");
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const mouseDownHandler = (event) => {
        startX = event.clientX;
        startY = event.clientY;
    };

    const mouseUpHandler = (event) => {
        if (circle.classList.contains("selected")) {
            endX = event.clientX;
            endY = event.clientY;
            var radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            var centerX = (startX + endX) / 2;
            var centerY = (startY + endY) / 2;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.stroke();
        }
    };

    if (circle.classList.contains("selected")) {
        canvas.style.cursor = "crosshair";
        canvas.addEventListener("mousedown", mouseDownHandler);
        canvas.addEventListener("mouseup", mouseUpHandler);
    } else {
        canvas.style.cursor = "default";
        canvas.removeEventListener("mousedown", mouseDownHandler);
        canvas.removeEventListener("mouseup", mouseUpHandler);
    }
};

const toggleTextTool = () => {
    circle.classList.remove("selected");
    drawBtn.classList.remove("selected");
    square.classList.remove("selected");
    text.classList.toggle("selected");
    let startX = 0;
    let startY = 0;

    const mouseDownHandler = (event) => {
        startX = event.clientX;
        startY = event.clientY;
        if (text.classList.contains("selected")) {
            const input = document.createElement("input");
            input.type = "text";
            input.style.position = "absolute";
            input.style.left = `${startX}px`;
            input.style.top = `${startY}px`;
            input.style.border = "1px solid #00000";
            input.style.zIndex = 1000;
            input.style.backgroundColor = "white";
            input.placeholder = "Enter text"


            document.body.appendChild(input);
            input.focus();

            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter") {
                    context.font = "16px Arial";
                    context.fillStyle = context.strokeStyle;
                    context.fillText(input.value, startX - offX, startY - offY);
                    document.body.removeChild(input);
                }
            })
        }
    };

    if (text.classList.contains("selected")) {
        canvas.style.cursor = "text";
        canvas.addEventListener("mousedown", mouseDownHandler);
    } else {
        canvas.style.cursor = "default";
        canvas.removeEventListener("mousedown", mouseDownHandler);
    }
};

const toggleDrawTool = () => {
    circle.classList.remove("selected");
    drawBtn.classList.toggle("selected");
    square.classList.remove("selected");
    text.classList.remove("selected");

    if (drawBtn.classList.contains("selected")) {
        canvas.style.cursor = "uri('pen.png')";
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mouseup", stopDrawing);
    } else {
        canvas.style.cursor = "default";
        canvas.removeEventListener("mousedown", startDrawing);
        canvas.removeEventListener("mouseup", stopDrawing);
    }
};

square.addEventListener("click", toggleSquareTool);
circle.addEventListener("click", toggleCircleTool);
drawBtn.addEventListener("click", toggleDrawTool);
text.addEventListener("click", toggleTextTool);