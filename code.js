const fileInput = document.getElementById('file-input');
const floorplanContainer = document.getElementById('floorplan-container');
const floorplan = document.getElementById('floorplan');
const tooltip = document.getElementById('tooltip');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
let scale = 1;

let floorplanData = null;

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        floorplanData = JSON.parse(e.target.result);
        renderFloorplan();
    };

    reader.readAsText(file);
});

function renderFloorplan() {
    fileInput.style.opacity = 0;
    floorplan.innerHTML = '';

    floorplanData.Regions.forEach((region, index) => {
        const regionElement = document.createElement('div');
        regionElement.className = 'region';
        const x = Math.min(region[0].X, region[1].X) * 5; // Scale factor
        const y = Math.min(region[0].Y, region[1].Y) * 5;
        const width = Math.abs(region[0].X - region[1].X) * 5;
        const height = Math.abs(region[0].Y - region[1].Y) * 5;
        regionElement.style.left = `${x}px`;
        regionElement.style.top = `${y}px`;
        regionElement.style.width = `${width}px`;
        regionElement.style.height = `${height}px`;
        floorplan.appendChild(regionElement);
    });

    floorplanData.Doors.forEach(door => {
        const doorElement = document.createElement('div');
        doorElement.className = 'door';
        const x = door.Location.X * 5;
        const y = door.Location.Y * 5;
        const width =  door.Width * 5;
        const height = door.Location.Z;
        doorElement.style.left = `${x}px`;
        doorElement.style.top = `${y}px`;
        doorElement.style.width = `${Math.abs(width)}px`;
        doorElement.style.height = `${Math.abs(height)}px`;
        doorElement.style.transform = `rotate(${door.Rotation}deg)`;
        floorplan.appendChild(doorElement);
    });

    floorplanData.Furnitures.forEach(furniture => {
        const furnitureElement = document.createElement('div');
        furnitureElement.className = 'furniture';
        const width = (furniture.MaxBound.X - furniture.MinBound.X) * 5;
        const height = (furniture.MaxBound.Y - furniture.MinBound.Y) * 5;
        const x = furniture.xPlacement * 5 - width / 2;
        const y = furniture.yPlacement * 5 - height / 2;
        furnitureElement.style.left = `${x}px`;
        furnitureElement.style.top = `${y}px`;
        furnitureElement.style.width = `${width}px`;
        furnitureElement.style.height = `${height}px`;
        furnitureElement.style.transform = `rotate(${furniture.rotation}deg)`;
        furnitureElement.setAttribute('data-name', furniture.equipName);
        floorplan.appendChild(furnitureElement);

        furnitureElement.addEventListener('mousemove', showTooltip);
        furnitureElement.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const furniture = e.target;
    const name = furniture.getAttribute('data-name');
    tooltip.textContent = name;
    tooltip.style.display = 'block';
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
}

function hideTooltip() {
    tooltip.style.display = 'none';
}

function startDrag(e) {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    floorplanContainer.style.cursor = 'grabbing';
}

function drag(e) {
    if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateFloorplanPosition();
    }
}

function stopDrag() {
    isDragging = false;
    floorplanContainer.style.cursor = 'grab';
}

function updateFloorplanPosition() {
    floorplan.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function zoomIn() {
    scale *= 1.1;
    updateFloorplanPosition();
}

function zoomOut() {
    scale /= 1.1;
    updateFloorplanPosition();
}

floorplanContainer.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDrag);
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);