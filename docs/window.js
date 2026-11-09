document.querySelectorAll(".window").forEach((win) => {
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
});

const windows = document.querySelectorAll(".window, .clock-window");

let topZIndex = 100;

for (const panel of windows) {
    panel.style.zIndex = ++topZIndex;

    panel.addEventListener("pointerdown", () => {
        panel.style.zIndex = ++topZIndex;
    }, true);
}

// デスクトップアイコンから開く
document.querySelectorAll(".desktop-icon").forEach((icon) => {
    function openWindow() {
        const panel = document.getElementById(icon.dataset.target);

        if (!panel) {
            return;
        }

        panel.classList.remove("closed");
        panel.style.zIndex = ++topZIndex;
    }

    icon.addEventListener("dblclick", openWindow);

    icon.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openWindow();
        }
    });
});

// ×ボタンから閉じる
document.querySelectorAll(".close-button").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
    });

    button.addEventListener("click", (event) => {
        event.stopPropagation();

        const panel = button.closest(".window");

        if (panel) {
            panel.classList.remove("closed", "minimized");
        }
    });
});

const taskbarButtons = document.querySelectorAll(".taskbar-app");
const managedWindows = document.querySelectorAll(".window, .clock-window");

function updateTaskbar() {
    const visible = [...managedWindows].filter((win) =>
        !win.classList.contains("closed") &&
        !win.classList.contains("minimized")
    );

    const highest = Math.max(
        0,
        ...visible.map((win) => Number(win.style.zIndex) || 0)
    );

    for (const button of taskbarButtons) {
        const win = document.getElementById(button.dataset.target);

        if (!win) {
            continue;
        }

        button.classList.toggle(
            "running",
            !win.classList.contains("closed")
        );

        button.classList.toggle(
            "active",
            visible.includes(win) &&
            Number(win.style.zIndex) === highest
        );
    }
}

for (const button of taskbarButtons) {
    button.addEventListener("click", () => {
        const win = document.getElementById(button.dataset.target);

        if (!win) {
            return;
        }

        if (button.classList.contains("active")) {
            win.classList.add("minimized");
        }
        else {
            win.classList.remove("closed", "minimized");
            win.style.zIndex = ++topZIndex;
        }

        updateTaskbar();
    });
}

// 既存のドラッグ・クリック処理が動いたあとに表示を更新
for (const win of managedWindows) {
    win.addEventListener("pointerdown", updateTaskbar, true);
}

// デスクトップアイコンや×ボタンからの変更にも追従
document.querySelectorAll(".desktop-icon").forEach((icon) => {
    icon.addEventListener("dblclick", updateTaskbar);
});

document.querySelectorAll(".close-button").forEach((button) => {
    button.addEventListener("click", updateTaskbar);
});

// タスクバー右端の時刻
const taskbarTime = document.getElementById("taskbar-time");

function updateTaskbarTime() {
    taskbarTime.textContent = new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

updateTaskbarTime();
setInterval(updateTaskbarTime, 1000);

updateTaskbar();