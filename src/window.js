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

const handles = win.querySelectorAll(".resize-handle");

for (const handle of handles) {
    let start = null;

    handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const rect = win.getBoundingClientRect();

        start = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
        };

        handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
        if (!start || event.pointerId !== start.pointerId) {
            return;
        }

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;

        const corner = handle.dataset.corner;

        let width = start.width;
        let height = start.height;
        let left = start.left;
        let top = start.top;

        if (corner.includes("e")) {
            width = Math.max(200, start.width + dx);
        }

        if (corner.includes("w")) {
            width = Math.max(200, start.width - dx);
            left = start.right - width;
        }

        if (corner.includes("s")) {
            height = Math.max(120, start.height + dy);
        }

        if (corner.includes("n")) {
            height = Math.max(120, start.height - dy);
            top = start.bottom - height;
        }

        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
    });

    function stopResizing() {
        start = null;
    }

    handle.addEventListener("pointerup", stopResizing);
    handle.addEventListener("pointercancel", stopResizing);
    handle.addEventListener("lostpointercapture", stopResizing);
}