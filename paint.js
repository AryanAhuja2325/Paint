const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const strokePicker = document.getElementById("stroke");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");

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
})

strokePicker.addEventListener("change", e => {
    context.strokeStyle = e.target.value;
})

const draw = (e) => {
    if (!isPainting) {
        return;
    }

    context.lineWidth = linewidth;
    context.lineCap = "round"

    context.lineTo(e.clientX - offX, e.clientY);
    context.stroke();
}



canvas.addEventListener("mousedown", e => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
})

canvas.addEventListener("mouseup", e => {
    isPainting = false;
    context.stroke();
    context.beginPath();
})

canvas.addEventListener("mousemove", draw);

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
})

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
            }
            img.src = image.imageData;
        }
        reader.readAsText(file);
    }
})