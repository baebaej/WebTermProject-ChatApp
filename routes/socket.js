// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());


var rooms=[]; //채팅방 관리를 위한 배열
var name='';

// export function for listening to the socket
module.exports = function (socket) {

  socket.on('send:username', function (data) {  //로그인한 사용자 이름을 받아와서 저장
    name = data;
  });

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get(),
    messages: []
  });

    // notify other clients that a new user has joined
    socket.broadcast.emit('user:join', {
      name: name
    });

      // broadcast a user's message to other users
  socket.on('send:message', function (data, roomid) {
    var id = rooms.find(rooms => rooms.id == roomid); //일치하는 방을 찾아서
    if(id){ 
    id.messages.push(data); //해당 방의 메시지에 push 해주고
    //console.log(id.messages);
    socket.broadcast.emit('send:message', { //다른 유저들에게 broadcast해준다
      roomid: roomid,
      user: data.user,
      text: data.text,
      time: data.time
    });
    //나와 다른 유저들의 roomlist의 최근 메시지 업데이트 위해
    //update된 room 정보를 다시 보내줌
    socket.emit('init:roomlist', {
      rooms: rooms
    });
    socket.broadcast.emit('init:roomlist', {
      rooms: rooms
    });
  }else{
    //console.log('일치하는 방을 찾지 못했습니다.');
  }
  });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
      if (userNames.claim(data.name)) {
        var oldName = name;
        userNames.free(oldName);
  
        name = data.name;
        
        socket.broadcast.emit('change:name', {
          oldName: oldName,
          newName: name
        });
  
        fn(true);
      } else {
        fn(false);
      }
    });

    //roomlist가 mount되면 roomlist를 client에 전달해준다.
  socket.on('mounted:roomlist', function(){
    socket.emit('init:roomlist', {
      rooms: rooms
    });
  })


  //새로운 room 이 생성
  socket.on('new:room', function(roomname){
    //방 목록 중 max id를 찾음
    if (rooms.length){
    var maxId = rooms[0].id; // 초기값으로 첫 번째 요소의 id를 설정
    }else{
      var maxId = 0;
    }

    for (var i = 1; i < rooms.length; i++) {
        if (rooms[i].id > maxId) {
            maxId = rooms[i].id;
        }
    }
    //찾은 roomid보다 1 크게 하여 room을 생성후 roomlist에 push
    var newRoom = { id: maxId+1, name: roomname, messages: [], chatusers:[] };
    rooms.push(newRoom);
    //console.log(rooms);

    //채팅방 리스트를 전체 유저들에게 전달
    socket.emit('init:roomlist', {
      rooms: rooms
    });
    socket.broadcast.emit('init:roomlist', {
      rooms: rooms
    });

  })

    // 방이 선택됐을 때 해당 방의 메시지 정보를 보내줌
    socket.on('select:room', function (roomid, userid) {
      //console.log(roomid);
      var id = rooms.find(room => room.id == roomid);
      //console.log(id);
      if (!id.chatusers.includes(userid)) { //현재 방에 들어온적 없으면 userid를 push
        id.chatusers.push(userid);
    }
      if (id){
      socket.emit('init', { //선택된 방 정보를 client로 보내줌
        messages: id.messages,
        roomid: roomid,
        roomname: id.name,
        users: id.chatusers
      });
      socket.broadcast.emit('user:join', {  //다른 user에게도 새로 들어온 user를 전송해줌
        users: id.chatusers
      });
    }
    else{
      //console.log('id를 찾지 못했습니다.');
    }
    });


  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};

