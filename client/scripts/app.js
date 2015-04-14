getUsername = function(){
  if(localStorage.getItem("username")){
    return JSON.parse(localStorage.getItem("username"))
  }else{
    var user = prompt("What is your username?")
    localStorage.setItem("username", JSON.stringify(user))
    app.username = user;
  }
}

var app = {
  server: "http://127.0.0.1:3000",
  username: getUsername(),
  currentRoom: 'lobby',
  rooms: {},
  friends: {},
  page: 0,
  messageCount: 0,

  init: function(){
      app.fetch();
      app.populateRooms();
  },

  send: function(message){
    $.ajax({
      // always use this url
      url: "http://127.0.0.1:3000/"+app.currentRoom,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(message),
      success: function (data) {
       console.log("message was sent");
       app.fetch();
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message');
      }
    });
  },

  fetch: function(){
    $.ajax({
      // always use this url
      url: "http://127.0.0.1:3000/"+app.currentRoom,
      type: 'GET',
      contentType: 'application/json',
      // data:{order:'reverseOrder', limit:10, roomname: app.currentRoom},
      success: function (data) {
        var room = app.currentRoom
        $("#chats").html('');
        app.messageCount = data.length
        _.each(data, function(obj, index){
          if(index < 7 + app.page && index > 0 + app.page){
            app.addMessage(obj);

          }
        });
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message');
      }
    });
  },

  addMessage: function(message){
    if(message.text && message.username) {
      if(/<script>/.test(message.text)){
        message.text = "GTFO Hacker!!!"
      }
      if (message.username in app.friends){
        var $message = '<div class="username">'+message.username+
                      '</div><p class="text friend"> '+message.text+'</p><div class="line-separator"></div>';

      }else{
        var $message = '<p class="username">'+message.username+
                      '</p><p class="text"> '+message.text+'</p><div class="line-separator"></div>';

      }
      $('#chats').append($message);
    }
  },

  clearMessages: function(){
    $("#chats").html('');
  },

  populateRooms: function(){
    $.ajax({
      // always use this url
      url: "http://127.0.0.1:3000",
      type: 'GET',
      contentType: 'application/json',
      // data:{order:'reverseOrder',limit:100},
      success: function (data) {
        _.each(data, function(room){
          if(room){
            app.rooms[room] = room.roomname;
          }
        });
        app.chatList();

      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message');
      }
    });
  },

  chatList: function() {
    _.each(app.rooms, function(room) {
      if(room.length < 50 && !(/<script>/.test(room)) && (room !== "lobby")){
        var $option = '<option>'+room+'</option>';
        $('#chatrooms').append($option);
      }
    });
  },

  addRoom: function(room){
    app.currentRoom = room.replace(" ", "_");
    var $option = '<option selected="selected">'+app.currentRoom+'</option>';
    $('#chatrooms').append($option);
    app.fetch();
  },

  changeUser: function(name){
    app.username = name
  },


}




//======================================================================//


$(document).ready(function(){

  app.init();


// $("#chats").pagination({
//    items: 100,
//    itemsOnPage: 10,
//    cssStyle: 'light-theme'
// });
//checks for sent message
  $('.submit').on('click', function(event) {
    event.preventDefault();
    var message = {
      'username': app.username,
      'text': $('#chatbox').val(),
      'roomname': app.currentRoom
    };

    app.send(message);


    $('#chatbox').val('');
  });

  $('.previous').on('click', function(event){
    event.preventDefault();
    if(app.messageCount > app.page +7){
      app.page = app.page + 7;
     app.fetch(app.page)
    }
  });


  $('.next').on('click', function(event){
    event.preventDefault();
    if(app.page - 7 > 0){
      app.page = app.page - 7;
    }
    app.fetch()
  });

//checks for changing chatrooms on dropdown
  $("#chatrooms").change(function() {
    app.currentRoom = this.value;
    app.fetch();
  });

  //checks for create new room
  $('#createroom').on('click', function(event){
    $(".chatroom").toggleClass("hidden")
  });

  $("#chatroomsubmit").on('click', function(e){
    event.preventDefault();
    $(".chatroom").toggleClass("hidden")
    app.addRoom($('#chatroombox').val());
  });

  $("#chats").on('click','.username', function(e){
    app.friends[$(this).text()] = $(this).text()
    app.fetch();
  });

  $("#username").on('click', function(e){
    localStorage.clear()
    getUsername()
  });
  setInterval(app.fetch, 15000);

});
