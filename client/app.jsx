'use strict';

var React = require('react');

var socket = io.connect();


var RoomTitle = React.createClass({
	render() {
		return (
			<div className='roomtitle'>
				{this.props.roomname}
			</div>
		);
	}
});

var UsersList = React.createClass({
	render() {
		return (
			<div className='users'>
				<h3> 참여자들 </h3>
				<ul>
					{
						this.props.users.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});

var Message = React.createClass({
	render() {
		//console.log('messageuser:', this.props.user, 'loginuser:', this.props.curruser);
		if(this.props.user == this.props.curruser){
		return (
			<div>
				<div className="mymessage">
					<div className='messageidbox'>
						<img src="img/user.png" width="20" height="20" alt="userlogo" />
						{this.props.user}
					</div>
					<div className='messagebox'>
						<div className='messagetimebox'>
								{this.props.time}
						</div>
						<div className='messagecontextbox'>
							<span>{this.props.text}</span>
						</div>
					</div>
				</div>

			</div>
		);
	}else{
		return (
			<div>
				<div className="elsemessage">
					<div className='elsemessageidbox'>
						<img src="img/user.png" width="20" height="20" alt="userlogo" />
						{this.props.user}
					</div>
					<div className='elsemessagebox'>
						<div className='elsemessagecontextbox'>
							<span>{this.props.text}</span>
						</div>
						<div className='elsemessagetimebox'>
								{this.props.time}
						</div>
					</div>
				</div>

			</div>
		);
	}
	}
});

var MessageList = React.createClass({

	render() {
		
		return (
			<div className='messages'>
				<h2> 채팅방 </h2>
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text} 
								time={message.time}
								curruser={this.props.curruser}
							/>
						);
					})
				}  
			</div>
		);
	}
});

const emojis = ['😀', '😂', '😍', '😭', '😡', '👍', '👎', '🙏', '❤️', '🔥'];

var EmoticonList = React.createClass({


	togglePicker() {
		if(this.state.isOpen)
			this.setState({isOpen:false});
		else
			this.setState({isOpen:true});	
	},

	handleSelect(emoji) {
		this.setState({isOpen:false});

		var today = new Date();

		var year = today.getFullYear();
		var month = ('0' + (today.getMonth() + 1)).slice(-2);
		var day = ('0' + today.getDate()).slice(-2);
		var hours = ('0' + today.getHours()).slice(-2); 
		var minutes = ('0' + today.getMinutes()).slice(-2);
		var seconds = ('0' + today.getSeconds()).slice(-2);

		var formattedTime = year + '년' + month  + '월' + day + '일 ' + hours + ':' + minutes  + ':' + seconds;
		var message = {
			user : this.props.user,
			text : emoji,
			time : formattedTime
		}
		if(message.text!=""){
		this.props.onMessageSubmit(message);
		this.props.onEmoticionBtnClicked();	
		}
	},

	render() {
		
		return (
			<div className="emoji-picker-container">
			  <div className="emoji-picker">
				<div className="emoji-picker-dropdown">
				<h3 className="emoji-picker-title">이모티콘 선택</h3>
				  <ul>
					{
					  emojis.map((emoji) => {
						return (
						  <li key={emoji} onClick={() => this.handleSelect(emoji)}>
							{emoji}
						  </li>
						);
					  })
					}
				  </ul>
				  <button onClick = {() => this.props.onEmoticionBtnClicked()}>닫기</button>
				</div>
			  </div>
			</div>
		  );
		  
		  
	}
});

	var MessageForm = React.createClass({

		getInitialState() {
			return {
				text: '',
			};
		},

		handleSubmit(e) {
			e.preventDefault();

			var today = new Date();

			var year = today.getFullYear();
			var month = ('0' + (today.getMonth() + 1)).slice(-2);
			var day = ('0' + today.getDate()).slice(-2);
			var hours = ('0' + today.getHours()).slice(-2); 
			var minutes = ('0' + today.getMinutes()).slice(-2);
			var seconds = ('0' + today.getSeconds()).slice(-2);

			var formattedTime = year + '년' + month  + '월' + day + '일 ' + hours + ':' + minutes  + ':' + seconds;
			var message = {
				user : this.props.user,
				text : this.state.text,
				time : formattedTime
			}
			if(message.text!=""){
			this.props.onMessageSubmit(message);	
			this.setState({ text: '' });
			}else{
				alert('메시지를 입력해주세요!');
			}
		},

		changeHandler(e) {
			this.setState({ text : e.target.value });
		},



		render() {
			return(
				<div className='message_form'>
					<form onSubmit={this.handleSubmit}>
						<input
							placeholder='메시지 입력 후 엔터'
							onChange={this.changeHandler}
							value={this.state.text}
							style={{ paddingRight: '40px' }}
						/>
						<img className ='emoticon_btn' src ='img/emoticon.png' onClick={this.props.onEmoticonBtnClick}/>
					</form>
				</div>
			);
		}
	});

var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	

		var currentname = this.props.currentname;

        // Send update request to server
        fetch('/api/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentname, newName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('아이디 변경 오류:', error);
            alert('아이디 변경 중 오류가 발생했습니다.');
        });

		this.setState({ newName: '' });

	},

	render() {
		return(
			<div className='change_name_form'>
				<div className='change_name_title'>
					<p style={{marginLeft:'30px'}}>아이디 변경</p>
				</div>
				<div className='change_name_context'>
					<p>현재 아이디 : {this.props.currentname}</p>
					<form onSubmit={this.handleSubmit}>
						<input
							placeholder='변경할 아이디 입력 후 엔터'
							onChange={this.onKey}
							value={this.state.newName} 
							style={{height:'30px'}}
						/>
					</form>	
				</div>
			</div>
		);
	}
});


var UsersScreen = React.createClass({

	getInitialState() {
		return {userlist: []};
	},

	componentDidMount() {
		fetch('/api/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
			body: JSON.stringify({  })
        })
        .then(response => response.json())
        .then(data => {
			this.setState({userlist : data.userlist})
        })
	},

	render() {
		//console.log(this.state.userlist);

		return(
			<div className='user_list_form'>
				<div className='user_list_title'>
					<p style={{marginLeft:'30px'}}>가입된 유저 목록</p>
				</div>
				<div className='user_list_context'>
				<ul>
					{
						this.state.userlist.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>				
			</div>
			</div>

			
		);
	}
});

var LoginScreen = React.createClass({
    getInitialState() {
        return {
            username: '',
            password: '',
            isRegistering: false, // Flag to switch between login and registration
			currfunction: '로그인'
        };
    },

    handleUsernameChange(e) {
        this.setState({ username: e.target.value });
    },

    handlePasswordChange(e) {
        this.setState({ password: e.target.value });
    },

    handleLogin() {
        const { username, password } = this.state;

        // Send login request to server
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Login successful, proceed to chat room
                this.props.onEnterChat(username);
            } else {
                // Login failed, show error message
                alert('로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        })
        .catch(error => {
            console.error('로그인 오류:', error);
            alert('로그인 중 오류가 발생했습니다.');
        });
    },

    handleRegister() {
        const { username, password } = this.state;

        // Send registration request to server
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Registration successful, show success message
				this.props.handleSetUsers(data.userlist);
                alert('회원가입이 완료되었습니다. 이제 로그인하세요.');
				this.setState({isRegistering:false, currfunction:'로그인'})
            } else {
                // Registration failed, show error message
                alert('회원가입 실패: 이미 사용 중인 아이디입니다.');
            }
        })
        .catch(error => {
            console.error('회원가입 오류:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        });
    },

	handleFunction(){
		if(this.state.isRegistering){
			this.setState({isRegistering: !this.state.isRegistering, currfunction:"로그인"});
		}else{
			this.setState({isRegistering: !this.state.isRegistering, currfunction:"회원가입"});
		}

	},

	render() {
		return (
			<div className="container">
				<div>
					<img className='inu' src="img/INU.png" alt="INU" />
				</div>
				<img className="logo" src="img/횃불이.png" width="250" height="200" alt="횃불이" />
				<div className="login-screen">
					<h2>{this.state.currfunction}</h2>
					<div>
						<input
							type="text"
							placeholder="아이디"
							value={this.state.username}
							onChange={this.handleUsernameChange}
						/>
					</div>
					<div>
						<input
							type="password"
							placeholder="비밀번호"
							value={this.state.password}
							onChange={this.handlePasswordChange}
						/>
					</div>
					{this.state.isRegistering ? (
						<button onClick={this.handleRegister}>회원가입</button>
					) : (
						<button onClick={this.handleLogin}>로그인</button>
					)}
					<button onClick={this.handleFunction}>
						{this.state.isRegistering ? '로그인 화면으로 돌아가기' : '회원가입'}
					</button>
				</div>
			</div>
		);
	}
	
});


var SelectRoom = React.createClass({
	getInitialState() {
	  return {
		selectedRoom: null,
		searchTerm: '',
		rooms: [],
		filteredRooms: []
	  };
	},

	componentDidMount() {
		socket.emit('mounted:roomlist');	//서버에 roomlist 요청
		socket.on('init:roomlist', this.roomlist_init);	//roomlist받아와서 초기화
	},
	componentWillUnmount() {
		socket.off('init:roomlist');  // 이벤트 리스너 해제
	},

	roomlist_init: function (data) {
		//var {rooms} = data;
		this.setState({rooms:data.rooms});
	},
  
	handleRoomClick: function(roomId) {
	  this.setState({ selectedRoom: roomId });
	  var userid = this.props.user;
	  socket.emit('select:room', roomId, userid);
	  //console.log('my room id is : ', roomId, 'curruserid is :', userid);
	},
  
	handleSearchChange: function(event) {
		const searchTerm = event.target.value.toLowerCase();
		const filteredRooms = this.state.rooms.filter(room =>
		  room.name.toLowerCase() === searchTerm
		);
		//console.log(filteredRooms);
		this.setState({ searchTerm, filteredRooms });
	  },
	  
	handleNewRoom: function(roomname) {
		//console.log(roomname);
		if (roomname != ""){
			socket.emit('new:room',roomname);
			this.setState({searchTerm:""});
		}else{
			alert("개설할 채팅방 이름을 입력하세요!!");
		}
	  },
  
	render: function() {
	  const { searchTerm, filteredRooms, selectedRoom } = this.state;
	  const roomsToDisplay = searchTerm ? filteredRooms : this.state.rooms;
	  //console.log(roomsToDisplay.length);

	  return (
		<div>
		  <h2 style={{textAlign:'center'}}>채팅방 목록</h2>
		  <input
			type="text"
			placeholder="검색할 채팅방 이름을 입력하세요."
			value={searchTerm}
			onChange={this.handleSearchChange}
		  />
			{roomsToDisplay.map(room => (
			  <p className="roombox" key={room.id} onClick={() => this.handleRoomClick(room.id)}>
				<img src = "img/home.png" width = "50" height="50"></img>
				<span className='roomname'>
					<span style={{fontSize:'medium', fontWeight: 'bold'}}>
						{room.name}
					</span>
					<br/>
					<span style={{fontSize:'small'}}>
						최근 메시지: 
						{room.messages.length > 0 && (
						<span>{room.messages[room.messages.length - 1].text}</span>
						)}
						{room.messages.length == 0 && (
						<span>없음</span>
						)}
					</span>
				</span>
			  </p>
			))}
		  {!roomsToDisplay.length && (<p style={{textAlign:'center'}}>채팅방이 없습니다.<br/> 채팅방을 개설하시겠습니까?<br><br></br></br>
			  <button style={{textAlign:'center'}} onClick={() => this.handleNewRoom(this.state.searchTerm)}>방 개설하기</button></p>)}
		  {selectedRoom && (
			<p style={{textAlign:'center'}}>현재 선택된 방: {this.state.rooms.find(room => room.id === selectedRoom).name}</p>
		  )}
		</div>
	  );
	}
  });


  var AppFrame = React.createClass({
	getInitialState() {
	  return {
		enteredChat: false, // Initially not entered the chat
		selectedMenu: 2,
		user: '',	//로그인된 유저 아이디
		users: []
	  };
	},
	componentDidMount(){
		document.title = "인천대학교 채팅 페이지";
	},
  
	handleEnterChat(username) {
	  //console.log(username);
	  socket.emit('send:username', username);
	  this.setState({ user: username});
	  //console.log('로그인된아이디:', this.state.user);
	  this.setState({ enteredChat: true });
	},
  
	handleMenuChange(menu) {
	  this.setState({ selectedMenu: menu });
	},

	handleChangeName(newName) {
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, (result) => {
			if(!result) {
				return alert('There was an error changing your name');
			}
			var {users} = this.state;
			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			this.setState({users, user: newName});
		});
	},

	handleLogout() {
		this.setState({ enteredChat: false });
	  },

	  handleSetUsers(userlist){
		this.setState({ users: userlist });

	  },
  
	renderContent: function() {
	  switch(this.state.selectedMenu) {
		case 1:
		  return <UsersScreen userlist = {this.state.users}/>
		case 2:
		  return <ChatApp username = {this.state.user} users = {this.state.user}/>;
		case 3:
		  return <ChangeNameForm onChangeName={this.handleChangeName} currentname = {this.state.user}/>;
	  }
	},
  
	render() {

		if (!this.state.enteredChat) {
		  return <LoginScreen onEnterChat={this.handleEnterChat} handleSetUsers={this.handleSetUsers} />;
		} else {
		  return (
			<div className="appframe">
			  <div className="header">
				<div className='logoframe'>
			  		<img className='inu' src="img/INU.png" alt="INU" />
				</div>
				<div className='userinfoframe'>
					<div className='idbox'>
						<img style={{height:'50px', width:'50px'}} src="img/user.png" alt="사용자" />
						<p>아이디 : {this.state.user}</p>
					</div>
					<button style={{height:'40px', width:'100px'}} onClick={this.handleLogout}>로그아웃</button>
				</div>
			  </div>
			  <div className='headerbelowframe'>
					<div className="menuframe">
						<MenuFrame onMenuChange={this.handleMenuChange} />
					</div>
					<div className="contentframe">
						{this.renderContent()}
					</div>
				</div>
			</div>
		  );
		}
	}
  });
  
  var MenuFrame = React.createClass({
  
	handleFriendMenuClick: function() {
	  this.props.onMenuChange(1);
	},
  
	handleChatMenuClick: function() {
	  this.props.onMenuChange(2);
	},
  
	handleUserMenuClick: function() {
	  this.props.onMenuChange(3);
	},
  
	render() {
	  return (
		<div className='menuframe'>
		  <img className='menu-icon' onClick={this.handleFriendMenuClick} src="img/notSelected_friend.png" alt="친구 메뉴" /><br />
		  <img className='menu-icon' onClick={this.handleChatMenuClick} src="img/selected_chat.png" alt="채팅 메뉴" /><br />
		  <img className='menu-icon' onClick={this.handleUserMenuClick} src="img/notSelected_user.png" alt="유저 메뉴" /><br />
		</div>
	  );
	}
  });
  


var ChatApp = React.createClass({

	getInitialState() {
        return {
            users: [],
            messages: [],
            text: '',
            enteredChat: false, // Initially not entered the chat
			roomid:'',
			roomname:'',
			user: '',

			emoticionbtnClicked : false
        };
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		socket.on('change:name', this._userChangedName);
		this.setState({
			user:this.props.username
		});
	},

	_initialize(data) {
		var {messages, roomid, roomname, users} = data;
		this.setState({user: this.props.username, messages, roomid, roomname, users});
		//console.log(messages);
	},

	_userJoined(data) {
		var {users} = data;
		this.setState({users});
	},

	_messageRecieve(message) {
		//console.log("받은 메시지", message);
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	},

	handleMessageSubmit(message) {
		//console.log(message);
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
		socket.emit('send:message', message, this.state.roomid);
	},


	handleEmoticonbtnClick(){
		if(this.state.emoticionbtnClicked)
			this.setState({emoticionbtnClicked:false});
		else
			this.setState({emoticionbtnClicked:true});

	},

	renderContent(){
		if(this.state.emoticionbtnClicked==true)
			return <EmoticonList
			user = {this.state.user}
			onMessageSubmit={this.handleMessageSubmit}
			onEmoticionBtnClicked={this.handleEmoticonbtnClick}
			/>;
			else
			return <div/>
	},



    render() {

		//console.log("roomid:", this.state.roomid);
			return(
				<div className='chatappframe'>
					<div className='selectroom'>
						<SelectRoom user={this.state.user}/>
					</div>
					
					{
					// Conditional Rendering 
					}
					{this.state.roomid.length===0 ?(	//방이 선택되지 않은 경우
						<div className='roomNotSelectedContainer'>
							<img className='roomNotSelected'src='img/selectroomplz.jpg'/>
						</div>
					) : (	//방이 선택된 경우
						<div className='center'>
							<div className='chattitleframe'>
								<RoomTitle roomname = {this.state.roomname}/>
								<UsersList users={this.state.users} />
							</div>
							<div>
								{this.renderContent()}
							</div>
							<div className='messageframe'>
								<MessageList messages={this.state.messages} curruser={this.state.user}/>
								<MessageForm
									onMessageSubmit={this.handleMessageSubmit}
									user={this.props.username}
									onEmoticonBtnClick = {this.handleEmoticonbtnClick}
								/>
							</div>
						</div>
					)}

				</div>

			)

		}
});



React.render(<AppFrame/>, document.getElementById('app'));