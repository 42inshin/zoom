import http from "http";
import WebSocket from "ws";
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

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);
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
});

server.listen(3000, handleListen);
