// socket.io 프레임워크 방식
const socket = io();

const welcome = document.getElementById('welcome');
const nameForm = welcome.querySelector("#name");
const roomForm = welcome.querySelector("#room_name");
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function addMessage(message) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li);
}

function handleMessageSubmit(event){
	event.preventDefault();
	const input = room.querySelector("#msg input");
	const value = input.value;
	socket.emit("new_message", roomName, input.value, () => {
		addMessage(`You: ${value}`);
	});
	input.value = "";
}

function handleNicknameSubmit(event) {
	event.preventDefault();
	const input = welcome.querySelector("#name input");
	socket.emit("nickname", input.value);
}

function showRoom() {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName}`;
	const msgForm = room.querySelector("#msg");
	msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event){
	event.preventDefault();
	const input = roomForm.querySelector("input");
	socket.emit("enter_room", input.value, showRoom);
	roomName = input.value;
	input.value = "";
}

nameForm.addEventListener("submit", handleNicknameSubmit);
roomForm.addEventListener("submit", handleRoomSubmit);


socket.on("welcome", (user, newCount) => {
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName} (${newCount})`;
	addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName} (${newCount})`;
	addMessage(`${left} left!`);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
	const roomList = welcome.querySelector("ul");
	roomList.innerHTML = "";
	if (rooms.length === 0) {
		return ;
	}
	rooms.forEach(room => {
		const li = document.createElement("li");
		li.innerText = room;
		roomList.appendChild(li);
	});
});

// WebSocket 방식
/* const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
	const msg = {type, payload};
	return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
	console.log("Connected to Server ✅")
});

socket.addEventListener("message", (message) => {
	const li = document.createElement("li");
	li.innerText = message.data;
	messageList.append(li);
});

socket.addEventListener("close", () => {
	console.log("Disconnected from Server ⛔️")
})

function handleSubmit(event) {
	event.preventDefault();
	const input = messageForm.querySelector("input");
	socket.send(makeMessage("new_message", input.value));
	// const li = document.createElement("li");
	// li.innerText = `You: ${input.value}`;
	// messageList.append(li);
	input.value = "";
}

function handleNickSubmit(event) {
	event.preventDefault();
	const input = nickForm.querySelector("input");
	socket.send(makeMessage("nickname", input.value));
	input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
 */
