/**
* @jsx React.DOM
*/

Trello.authorize({ interactive:false, success: initialize });

$(function() {

  $("#connectLink").click(function(){
    Trello.authorize({
      type: "popup",
      success: initialize,
      name: 'Trellist'
    })
  });

});

$('#disconnect').on('click',function() {
   Trello.deauthorize();
   updateLoggedIn();
});

function updateLoggedIn() {
  var isLoggedIn = Trello.authorized();

  if (isLoggedIn){
    console.log('logged in');
    $(".loggedIn").show();
    $(".loggedOut").hide();
  } else {
    console.log('not logged in');
    $(".loggedIn").hide();
    $(".loggedOut").show();
  }
  $("#boardList").empty();
}

function initialize() {
  updateLoggedIn();
  Trello.members.get("me", function(member){
      $(".fullName").text(member.fullName);
  });

  var BoardBox  = React.createClass({
    getInitialState: function() {
      return {boards: []};
    },
    componentWillMount: function() {
      Trello.get("members/me/boards", {filter: "open"}).then(function(boards) {
        this.setState({boards: boards});
      }.bind(this))
      .fail(function(xhr, status, err) {
        console.error("comments.json", status, err.toString());
      }.bind(this))
    },
    render: function() {
      return (
        <div className="BoardBox">
          <h1>Board List</h1>
          <BoardList boards={this.state.boards} />
        </div>
      );
    }
  });

  var BoardList = React.createClass({
    render: function() {
      var boardNodes = this.props.boards.map(function (board) {
        return <Board id={board.id} name={board.name}></Board>;
      }.bind(this));
      return (
        <div className="boardList">
          {boardNodes}
        </div>
      );
    }
  });

  var Board = React.createClass({
    render: function() {
      var url = '#/board/'+this.props.id;
      return (
        <div className="board">
          <a href={url}>{this.props.name}</a>
        </div>
      );
    }
  });

  var ListBox = React.createClass({
    render: function() {
      var listNodes = this.props.board.lists.map(function(list) {
        var cards = this.props.board.cards.filter(function(card) {
          if (card.idList === list.id) return card;
        });
        if (cards.length > 0) {
          return <List name={list.name} cards={cards}></List>;
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
        return <Card name={card.name} desc={card.desc}></Card>;
      });
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
      var preStyle = "desc"+ (this.props.desc ? '' : ' none');
      return (
        <li>
          <div className="name">{this.props.name}</div>
          <pre className={preStyle}>{this.props.desc}</pre>
        </li>
      );
    }
  });

  React.renderComponent(
    <BoardBox />,
    document.getElementById('boardList')
  );

  var router = new Router({
    '/board/:id': function(id){
      console.log('loading board',id);
      Trello.boards.get(id, {cards:'open',lists:'open'}).then(function(board){
        React.renderComponent(
          <ListBox board={board}/>,
          document.getElementById('output')
        );
      }.bind(this));

    }
  });
  router.init();

}
