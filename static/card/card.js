var card = {};

card.imageClick = (el, maxHeight, maxWidth, iconSize) => {

  // init numClicks
  el.numClicks = [undefined, 0].includes(el.numClicks) ? 1 : 2;

  // Checks if the image is open!
  const isOpen = () => el.toggle;

  // Actions on image.
  const clickCount = (c) => el.numClicks === c;
  const openOrCloseImage = () => clickCount(1);
  const reduceOpenImage = () => clickCount(2) && isOpen();

  if (openOrCloseImage()) {
    // A single click to open(Actual size)/close(Icon size) an image.
    singleClickTimer = setTimeout(() => {
      el.numClicks = 0;
      el.toggle = !el.toggle;
      if (isOpen()) { el.height = maxHeight; el.width = maxWidth; el.title = '1 Click per iconizzare, 2 click per ridurre la dimensione!' }
      else { el.height = iconSize; el.width = iconSize; el.title = 'Clicca per ingrandire!' }
    }, 400);
  } else if (reduceOpenImage()) {
    // The image is open, done double clicks on it.
    clearTimeout(singleClickTimer);
    el.numClicks = 0;
    el.height = el.height * .8; // 20% decrease.
    el.width = el.width * .8;   // 20% decrease.
  }
};
