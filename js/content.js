var boardName = document.querySelector('.board-header-btn-name > .board-header-btn-text').innerText
chrome.runtime.sendMessage({boardName: boardName}, function(response) {
  console.log('response received', response);
});
