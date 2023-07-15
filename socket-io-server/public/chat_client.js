$(function () {
  const server = io.connect('http://localhost:3000');

  var username = prompt("Your name please!");

  server.on('connect', function (data) {
    server.emit('join', username)
  });

  $('#chat-form').submit(function (e) {
    var message = $('#messageTxt').val();

    //emit the message on the server
    console.log("msg : ", message);
    console.log("username : ", username);
    server.emit('message', /* `${username} : ${message}` */ { 'username': username, 'msg': message });
    e.preventDefault();
  });

  /* server.on('messages', function(data){
    console.log(data);
    $("#msgsFeed").append("<li>"+data+"</li>");
  }); */

  /* server.on('oldmessages', function(data){
    console.log(data.old);

    $.each(data.old, function(key, value) {
      $("#oldmsgs").append("<li> Username: " + value.name + " Message: "+ value.message + "</li>");
    });
  }); */

  server.on('message', function (data) {
    console.log("client side listening message event : ", data.username , data.msg);
    console.log(data);
    $("#msgsFeed").append("<li>" + data.username +" : "+ data.msg + "</li>");
  });

});
