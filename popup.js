document.getElementById('apply-scale').addEventListener('click', () => {
  const height = document.getElementById('height').value;
  const width = document.getElementById('width').value;

  chrome.storage.sync.set({ height: height, width: width }, () => {
    console.log('Scale settings saved:', { height, width });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.url.startsWith('chrome://')) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: applyScale,
        args: [height, width]
      }, () => {
        window.close();  // Close the popup after executing the script
      });

      // Listen for click events to stop the scale
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: addClickEvent
      });

      // Listen for double tap events to stop the scale
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: addDoubleClickEvent
      });
    } else {
      console.error('Cannot run script on chrome:// URLs');
    }
  });
});

function applyScale(height, width) {
  let scale = document.getElementById('alignment-scale');
  if (scale) {
    scale.remove();
  }

  scale = document.createElement('div');
  scale.id = 'alignment-scale';
  scale.style.position = 'fixed';
  scale.style.border = '1px solid black';
  scale.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  scale.style.pointerEvents = 'none';
  scale.style.zIndex = '9999';
  scale.style.width = width + 'px';
  scale.style.height = height + 'px';
  scale.style.left = '50%';
  scale.style.top = '50%';
  scale.style.transform = 'translate(-50%, -50%)';

  // Create the horizontal scale divisions and markings
  const horizontalDivisions = Math.floor(width / 50);
  for (let i = 0; i <= horizontalDivisions; i++) {
    const mark = document.createElement('div');
    mark.style.position = 'absolute';
    mark.style.height = '10px';
    mark.style.width = '1px';
    mark.style.backgroundColor = 'black';
    mark.style.left = `${i * 50}px`;
    mark.style.top = '0';

    // Add a label for each horizontal division
    const label = document.createElement('span');
    label.style.position = 'absolute';
    label.style.bottom = '-20px';
    label.style.left = `${i * 50}px`;
    label.style.fontSize = '10px';
    label.style.transform = 'translateX(-50%) rotate(-90deg)';
    label.textContent = `${i * 50}`;

    scale.appendChild(mark);
    scale.appendChild(label);
  }

  // Create the vertical scale divisions and markings
  const verticalDivisions = Math.floor(height / 50);
  for (let i = 0; i <= verticalDivisions; i++) {
    const mark = document.createElement('div');
    mark.style.position = 'absolute';
    mark.style.width = '10px';
    mark.style.height = '1px';
    mark.style.backgroundColor = 'black';
    mark.style.top = `${i * 50}px`;
    mark.style.left = '0';

    // Add a label for each vertical division
    const label = document.createElement('span');
    label.style.position = 'absolute';
    label.style.top = `${i * 50}px`;
    label.style.left = '-20px';
    label.style.fontSize = '10px';
    label.style.transform = 'translateY(-50%)';
    label.textContent = `${i * 50}`;

    scale.appendChild(mark);
    scale.appendChild(label);
  }

  document.body.appendChild(scale);

  document.addEventListener('mousemove', (event) => {
    scale.style.top = event.clientY + 'px';
    scale.style.left = event.clientX + 'px';
  });
}

function addClickEvent() {
  document.addEventListener('click', () => {
    let scale = document.getElementById('alignment-scale');
    if (scale) {
      scale.remove();
    }
  });
}

function addDoubleClickEvent() {
  let lastClickTime = 0;
  document.addEventListener('click', () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      let scale = document.getElementById('alignment-scale');
      if (scale) {
        scale.remove();
      }
    }
    lastClickTime = currentTime;
  });
}
