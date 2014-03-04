var boardName;
// The board name is dynamically rendered by Trello's JS, so we poll for it.
ival = setInterval(function() {
  boardNameElem = document.querySelector('.board-header-btn-name > .board-header-btn-text')
  if (boardNameElem)
    boardName = boardNameElem.innerText
  if (boardName) {
    clearInterval(ival);
    //console.log('Got board name',boardName);
  }
},500);
//console.log('Registering listener from content script...');
chrome.runtime.onConnect.addListener(function(port) {
  //console.assert(port.name == "trellist");
  port.onMessage.addListener(function(msg) {
    //console.log('Content got msg',msg);
    port.postMessage({boardName:boardName});
  });
});
