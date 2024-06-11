document.getElementById('apply-scale').addEventListener('click', () => {
  const height = document.getElementById('height').value;
  const width = document.getElementById('width').value;

  chrome.storage.sync.set({ height: height, width: width }, () => {
    console.log('Scale settings saved:', { height, width });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: applyScale,
      args: [height, width]
    });
  });

  // Listen for click events to stop the scale
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: addClickEvent
    });
  });

  // Listen for double tap events to stop the scale
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: addDoubleClickEvent
    });
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
  scale.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent, transparent 9px, black 10px)';
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
