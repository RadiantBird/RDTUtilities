
const canvas = document.getElementById("clock");
const ctx = canvas.getContext("2d");

const cx = 150;
const cy = 140;
const radius = 100;

function drawHand(angle, length, width, color) {
    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.restore();
}

function drawClock(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 文字盤
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#cde7ff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#202020";
    ctx.stroke();

    // 24時間分の目盛り
    for (let i = 0; i < 24; i++) {
        const angle = i * Math.PI / 12;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, -radius + 5);
        ctx.lineTo(0, -radius + (i % 3 === 0 ? 16 : 10));

        ctx.lineWidth = i % 3 === 0 ? 3 : 1;
        ctx.stroke();
        ctx.restore();
    }

    // 時間を角度へ変換
    const hourAngle =
        (hours + minutes / 60 + seconds / 3600)
        * Math.PI * 2 / 24;

    const minuteAngle =
        (minutes + seconds / 60) * Math.PI * 2 / 60;

    const secondAngle = seconds * Math.PI * 2 / 60;

    // 針を描画
    drawHand(hourAngle, 50, 6, "#202020");
    drawHand(minuteAngle, 75, 4, "#202020");
    drawHand(secondAngle, 85, 2, "#d03030");

    // 中心の軸
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#202020";
    ctx.fill();

    // デジタル時計
    const time = [
        hours,
        minutes,
        seconds
    ].map(v => String(v).padStart(2, "0")).join(":");

    ctx.fillStyle = "#202020";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(time, cx, 275);
}

function tick() {
    const now = new Date();
    drawClock(now);

    // 次の秒の境界で再描画
    setTimeout(tick, 1000 - now.getMilliseconds());
}

tick();

const clockWindow = document.querySelector(".clock-window");

let clockDrag = null;

clockWindow.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
        return;
    }

    const rect = clockWindow.getBoundingClientRect();

    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const radius = Math.min(rect.width, rect.height) / 2;

    // 円の外側ならドラッグしない
    if (dx * dx + dy * dy > radius * radius) {
        return;
    }

    clockDrag = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    };

    clockWindow.setPointerCapture(event.pointerId);
});

clockWindow.addEventListener("pointermove", (event) => {
    if (!clockDrag || event.pointerId !== clockDrag.pointerId) {
        return;
    }

    const width = clockWindow.offsetWidth;
    const height = clockWindow.offsetHeight;

    const x = Math.max(
        -width / 2,
        Math.min(event.clientX - clockDrag.offsetX, window.innerWidth - width / 2)
    );

    const y = Math.max(
        -height / 2,
        Math.min(event.clientY - clockDrag.offsetY, window.innerHeight - height / 2)
    );

    clockWindow.style.left = `${x}px`;
    clockWindow.style.top = `${y}px`;
});

function stopClockDrag() {
    clockDrag = null;
}

clockWindow.addEventListener("pointerup", stopClockDrag);
clockWindow.addEventListener("pointercancel", stopClockDrag);
clockWindow.addEventListener("lostpointercapture", stopClockDrag);