var scripturl = 'https://api.trello.com/1/client.js?key=01d542b2da7985e310301d7e1cbe5ec7'//+localStorage.apikey;
$.getScript(scripturl, function(){
    var event = new Event('Trelloready');
    document.dispatchEvent(event);
});


var options = {
    trello_options: function () {
        options = {};
        options.name = "Trellist";
        options.persist = true;
        options.interactive = true;
        options.expiration = "never";
        //options.success = this.authorized;
        options.success = this.initialize;
        options.scope = { write: false, read: true };

        return options;
    }
};
