var Router = Backbone.Router.extend({
  routes: {
    '' : 'home'
  },
  home: function() {
    new PrintView({el: '.container'}).render();
  },
  execute: function(callback, args) {
    if (!this.isAuthorized(args)) this.notAuthorized(args);
    else if (callback) callback.apply(this, args);
  },
  isAuthorized: function(args){
    return true; // Trello.authorized();
  },
  notAuthorized: function(args){
    new NotAuthorizedView({el:'.container'}).render()
  }
});

var NotAuthorizedView = Backbone.View.extend({
  render: function() {

  }
});

var PrintView = Backbone.View.extend({
  template: ' \
      <a href="javascript:window.print" class="btn btn-primary col-lg-12">PRINT</a> \
      <div id="output">\
        <h1>Random</h1>\
      </div> \
  ',
  events: {
    'click .print' : '_print'
  },
  _print: function() {
    var iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    window.print = iframe.contentWindow['print'];
    document.body.removeChild(iframe);
    debugger;
    window.print();
  },
  render: function() {
    this.$el.html(this.template);

    var ListBox = React.createClass({
      render: function() {
        var listNodes = this.props.board.lists.map(function(list) {
          var cards = this.props.board.cards.filter(function(card) {
            if (card.idList === list.id) return card;
          });
          if (cards.length > 0) {
            return <List key={list.id} name={list.name} cards={cards} checklists={this.props.board.checklists}></List>;
          } else {
            return;
          }
        }.bind(this));
        return (
          <div className="list nodes">
            <h1>{this.props.board.name}</h1>
            {listNodes}
          </div>
        );
      }
    });

    var List = React.createClass({
      render: function() {
        var cardNodes = this.props.cards.map(function(card) {
          var checklists = this.props.checklists.filter(function(checklist) {
            if (checklist.idCard === card.id) return checklist;
          });
          return <Card key={card.id} card={card} checklists={checklists}/>;
        }.bind(this));
        return (
          <ul className="card nodes">
            <h2>{this.props.name}</h2>
            {cardNodes}
          </ul>
        );
      }
    });

    var Card = React.createClass({
      render: function() {
        var preStyle = "desc"+ (this.props.card.desc ? '' : ' none');
        var html = marked(this.props.card.desc);
        return (
          <li>
            <div className="name">{this.props.card.name}</div>
            <div className={preStyle} dangerouslySetInnerHTML={{__html:html }}/>
            <CheckLists checklists={this.props.checklists}/>
            <AttachmentList attachments={this.props.card.attachments}/>
          </li>
        );
      }
    });

    var CheckLists = React.createClass({
      render: function() {
        var checklists = this.props.checklists.map(function(checklist){
          return <CheckList key={checklist.id} checklist={checklist}/>;
        });
        return (
          <div className="checklists">
            {checklists}
          </div>
        );
      }
    });

    var CheckList = React.createClass({
      render: function() {
        var checklist = this.props.checklist.checkItems.map(function(checkItem) {
          return <CheckItem key={checkItem.id} item={checkItem}/>;
        });
        return (
          <div className="checklist">
            {checklist}
          </div>
        );
      }
    });

    var CheckItem = React.createClass({
      render: function() {
        var checked = this.props.item.state === 'complete' ? 'checked' : '';
        return (
          <div className="checkbox">
            <label>
              <input type="checkbox" defaultChecked={checked}/>
              {this.props.item.name}
            </label>
          </div>
        );
      }
    });

    var AttachmentList = React.createClass({
      render: function() {
        var attaches = this.props.attachments.map(function(attach) {
          return <Attachment attachment={attach}/>
        });

        return <ul className="attachments">{attaches}</ul>;
      }
    });

    var Attachment = React.createClass({

      render: function() {
        var isImage = /\.jpg$|\.png$|\.gif$/.test(this.props.attachment.url);
        if (isImage) {
          return <li><a href={this.props.attachment.url}><img src={this.props.attachment.url}/>{this.props.attachment.name}</a></li>;
        }
        else {
          return <li><a href={this.props.attachment.url}>{this.props.attachment.name}</a></li>;
        }
      }
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
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
            <ListBox board={board}/>,
            document.getElementById('output')
          );
        }.bind(this));
        })
      });
    });
  }

});
document.addEventListener('Trelloready', function () {
    new Router;
    Backbone.history.start();
});
