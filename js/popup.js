/** @jsx React.DOM */
var Router = Backbone.Router.extend({
  routes: {
    '' : 'home'
  },
  home: function() {
    new PrintView({el: '.container'}).render();
  },
  execute: function(callback, args) {
    debugger
    if (!this.isAuthorized(args)) this.notAuthorized(args);
    else if (callback) callback.apply(this, args);
  },
  isAuthorized: function(args){
    return Trello.authorized();
  },
  notAuthorized: function(args){
    new NotAuthorizedView({el:'.container'}).render()
  }
});

var NotAuthorizedView = Backbone.View.extend({
  template: [
    "Trellist is not authorized to use Trello.",
    "Please <a href=\"#\" class=\"options\">enable",
    "Trellist</a> in Options to access your Trello boards. "
  ].join(''),
  events: {
    'click .options' : '_gotoOptions'
  },
  render: function() {
    this.$el.html(this.template);
  },
  _gotoOptions: function() {
    var optionsUrl = chrome.extension.getURL('options.html');

    chrome.tabs.query({url: optionsUrl}, function(tabs) {
        if (tabs.length) {
            chrome.tabs.update(tabs[0].id, {active: true});
        } else {
            chrome.tabs.create({url: optionsUrl});
        }
        window.close();
    });
  }
});

var PrintView = Backbone.View.extend({
  template: [
      '<div class="menu">',
      '  <a href="#" class="print btn btn-primary col-lg-12">PRINT</a> ',
      '</div>',
      '<div id="output"> </div> '
  ].join(''),
  events: {
    'click .print' : '_print'
  },
  _print: function() {
    window.print();
    window.close();
  },
  render: function() {
    this.$el.html(this.template);

    var ListBox = React.createClass({displayName: 'ListBox',
      render: function() {
        var listNodes = this.props.board.lists.map(function(list) {
          var cards = this.props.board.cards.filter(function(card) {
            if (card.idList === list.id) return card;
          });
          if (cards.length > 0) {
            return List( {key:list.id, name:list.name, cards:cards, checklists:this.props.board.checklists});
          } else {
            return;
          }
        }.bind(this));
        return (
          React.DOM.div( {className:"list nodes"},
            React.DOM.h1(null, this.props.board.name),
            listNodes
          )
        );
      }
    });

    var List = React.createClass({displayName: 'List',
      render: function() {
        var cardNodes = this.props.cards.map(function(card) {
          var checklists = this.props.checklists.filter(function(checklist) {
            if (checklist.idCard === card.id) return checklist;
          });
          return Card( {key:card.id, card:card, checklists:checklists});
        }.bind(this));
        return (
          React.DOM.ul( {className:"card nodes"},
            React.DOM.h2(null, this.props.name),
            cardNodes
          )
        );
      }
    });

    var Card = React.createClass({displayName: 'Card',
      render: function() {
        var preStyle = "desc"+ (this.props.card.desc ? '' : ' none');
        var html = marked(this.props.card.desc);
        return (
          React.DOM.li(null,
            React.DOM.div( {className:"name"}, this.props.card.name),
            React.DOM.div( {className:preStyle, dangerouslySetInnerHTML:{__html:html }}),
            CheckLists( {checklists:this.props.checklists}),
            AttachmentList( {attachments:this.props.card.attachments})
          )
        );
      }
    });

    var CheckLists = React.createClass({displayName: 'CheckLists',
      render: function() {
        var checklists = this.props.checklists.map(function(checklist){
          return CheckList( {key:checklist.id, checklist:checklist});
        });
        return (
          React.DOM.div( {className:"checklists"},
            checklists
          )
        );
      }
    });

    var CheckList = React.createClass({displayName: 'CheckList',
      render: function() {
        var checklist = this.props.checklist.checkItems.map(function(checkItem) {
          return CheckItem( {key:checkItem.id, item:checkItem});
        });
        return (
          React.DOM.div( {className:"checklist"},
            checklist
          )
        );
      }
    });

    var CheckItem = React.createClass({displayName: 'CheckItem',
      render: function() {
        var checked = this.props.item.state === 'complete' ? 'checked' : '';
        return (
          React.DOM.div( {className:"checkbox"},
            React.DOM.label(null,
              React.DOM.input( {type:"checkbox", defaultChecked:checked}),
              this.props.item.name
            )
          )
        );
      }
    });

    var AttachmentList = React.createClass({displayName: 'AttachmentList',
      render: function() {
        var attaches = this.props.attachments.map(function(attach) {
          return Attachment( {attachment:attach})
        });

        return React.DOM.ul( {className:"attachments"}, attaches);
      }
    });

    var Attachment = React.createClass({displayName: 'Attachment',

      render: function() {
        var isImage = /\.jpg$|\.png$|\.gif$/.test(this.props.attachment.url);
        if (isImage) {
          return React.DOM.li(null, React.DOM.a( {href:this.props.attachment.url}, React.DOM.img( {src:this.props.attachment.url}),this.props.attachment.name));
        }
        else {
          return React.DOM.li(null, React.DOM.a( {href:this.props.attachment.url}, this.props.attachment.name));
        }
      }
    });


    //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // TODO: this seems hacky, looking for the only active normal window
    chrome.tabs.query({active: true, windowType:'normal'}, function(tabs) {
      var port = chrome.tabs.connect(tabs[0].id, {name: "trellist"});
      port.postMessage({method: 'getBoardName'});
      port.onMessage.addListener(function(msg) {
        var boardName = msg.boardName

        Trello.get("members/me/boards", {filter: "open"}).then(function(boards) {

          var board = boards.filter(function(b) {
            return b.name === boardName;
          })[0];

        var id = board.id;

        Trello.boards.get(id, {cards:'open',lists:'open',checklists:'all',card_attachments:true}).then(function(board){
          React.renderComponent(
            ListBox( {board:board}),
            document.getElementById('output')
          );
        }.bind(this));
        })
      });
    });


  }

});
document.addEventListener('Trelloready', function () {
    //setTimeout(function() {
      //debugger;
    Trello.authorize({interactive:false});
    new Router;
    Backbone.history.start();

    //},5000);
});
