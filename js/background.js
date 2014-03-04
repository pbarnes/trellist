// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  //var action_url = "javascript:window.print();";
  //chrome.tabs.update(tab.id, {url: action_url});
  chrome.windows.getCurrent(function(currentWindow) {
    var PADDING_TOP = 50;
    var PADDING_BOTTOM = 50;
    var SWITCHER_WIDTH = 600;
    var left = currentWindow.left + Math.round((currentWindow.width - SWITCHER_WIDTH) / 2);
    var top = currentWindow.top + PADDING_TOP;
    var height = Math.max(currentWindow.height - PADDING_TOP - PADDING_BOTTOM, 600);
    var width = SWITCHER_WIDTH;
    var opts = {
      width: width,
      height: height,
      left: left,
      top: top,
      url: chrome.runtime.getURL('popup.html'),
      focused: true,
      type: 'popup'
    };

    return chrome.windows.create(opts);
  });
});

