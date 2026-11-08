const win = document.querySelector(".window");
const bar = win.querySelector(".titlebar");

let offsetX = 0;
let offsetY = 0;
let dragging = false;

bar.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
        return;
    }

    const rect = win.getBoundingClientRect();

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    dragging = true;
    bar.setPointerCapture(event.pointerId);
});

bar.addEventListener("pointermove", (event) => {
    if (!dragging) {
        return;
    }

    const minX = -win.offsetWidth / 2;
    const minY = -win.offsetHeight / 2;

    const maxX = window.innerWidth - win.offsetWidth / 2;
    const maxY = window.innerHeight - win.offsetHeight / 2;

    const x = Math.max(minX, Math.min(event.clientX - offsetX, maxX));
    const y = Math.max(minY, Math.min(event.clientY - offsetY, maxY));

    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
});

function stopDragging() {
    dragging = false;
}

bar.addEventListener("pointerup", stopDragging);
bar.addEventListener("pointercancel", stopDragging);