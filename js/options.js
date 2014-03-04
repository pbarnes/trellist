var self = this;
document.addEventListener('Trelloready', function () {
  Trello.authorize({interactive:false});
  self.optionsView = new OptionsView({el:'.options'}).render();
});

function authorized() {
  console.log('TRELLO AUTH CALLBACK');
  self.optionsView.render();
}

var OptionsView = Backbone.View.extend({
  template: [
    '<h1>Options</h1>',
    '<form>',
    '  <div class="form-group">',
    '    <label for="apikey"> API Key </label>',
    '    <input id="apikey" type="text" class="form-control" value="01d542b2da7985e310301d7e1cbe5ec7"/>',
    '    <p class="help-block">You can generate one <a href="https://trello.com/1/appKey/generate" target="_blank">here</a></p>',
    '  </div>',
    '  <div class="btn-group" data-toggle="buttons">',
    '    <label class="authorize btn btn-primary">',
    '      <span class="glyphicon glyphicon-ok-circle"></span>',
    '      <input type="radio" name="authorize" value="authorize"> Authorized',
    '    </label>',
    '    <label class="deauthorize btn btn-primary">',
    '      <span class="glyphicon glyphicon-ban-circle"></span>',
    '      <input type="radio" name="authorize" value="deauthorize"> Deauthorized',
    '    </label>',
    '  </div>',
    '</form>'
  ].join(''),
  events: {
    'change #apikey' : '_saveApiKey',
    'click .authorize' : '_authorize',
    'click .deauthorize' : '_deauthorize'
  },
  render: function() {
    this.$el.html(this.template);
    if (Trello.authorized()) {
      this.$('.authorize.btn').addClass('active').siblings().removeClass('active');
    }
    else {
      this.$('.deauthorize.btn').addClass('active').siblings().removeClass('active');
    }
    return this;
  },
  _saveApiKey: function(evt) {
    debugger;
  },
  _authorize: function(evt) {
    Trello.authorize({
      'name':  "Trellist",
      'expiration': "never",
      'success': authorized
    });
  },
  _deauthorize: function(evt) {
    Trello.deauthorize();
    this.render();
  }
});

