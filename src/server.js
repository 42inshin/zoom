import http from "http";
// import WebSocket from "ws";
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import express from "express";
// ES6 버전에선 __dirname 이라는 변수가 기본으로 설정되어 있지 않음
// babel이 어떠한 이유로 ES5변환을 못하는 경우
// 예를 들어 package.json 에 type: module 을 추가 할 경우, ES5로 변환을 못하므로
// 아래의 내용을 추가해야 한다.
/*
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
*/

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true,
	},
});

instrument(wsServer, {
	auth: false,
});

function publicRooms(){
	const {
		sockets: {
			adapter: {sids, rooms},
		},
	} = wsServer;
	const publicRooms = [];
	rooms.forEach((_, key) => {
		if (sids.get(key) === undefined) {
			publicRooms.push(key);
		}
	});
	return publicRooms;
}

function countRoom(roomName) {
	return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
	socket["nickname"] = "Anonymous";
	socket.onAny((event) => {
		console.log(wsServer.sockets.adapter);
		console.log(`socket Event: ${event}`);
	});
	socket.on("enter_room", (roomName, done) => {
		socket.join(roomName);
		done();
		socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
		wsServer.sockets.emit("room_change", publicRooms());
	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach((room) =>
			socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
		);
	});
	socket.on("disconnect", () => {
		wsServer.sockets.emit("room_change", publicRooms());
	})
	socket.on("new_message", (room, msg, done) => {
		socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
		done();
	});
	socket.on("nickname", (nickname) => socket["nickname"] = nickname);
})

/*
const wss = new WebSocket.Server({ server });
const sockets = [];

function onSocketClose() {
	console.log("Disconnected from the Browser ⛔️")
}

wss.on("connection", (socket) => {
	sockets.push(socket);
	socket["nickname"] = "Anonymous";
	console.log("Connected to Browser ✅");
	socket.on("close", onSocketClose);
	socket.on("message", (msg) => {
		const message = JSON.parse(msg);
		switch (message.type) {
			case "new_message":
				sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
				break;
			case "nickname":
				socket["nickname"] = message.payload;
				break;
		}
	});
	// socket.send("hello!!!");
}); */
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
