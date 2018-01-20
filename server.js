const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const ejs = require('ejs');

const server = http.createServer( (req,res) => {
	let realUrl = "http://" + req.headers.host + req.url;
	let urlObj = url.parse(realUrl);
	switch(urlObj.pathname) {
		case '/': //首页面，显示留言
			// fs.readFile('index.html','utf8',(err,data) => {
			// 	if (err) throw err;
			// 	res.end(data);
			// });
			//先获取data.json中的数据
			let arr = [];
			if (fs.existsSync('data.json')) {
				//已经存在了，后续的写文件,需要读取data.json
				arr = require('./data.json');
			}
			//使用ejs的renderFile进行渲染 
			ejs.renderFile('index.html',{msgs : arr},(err,html) => {
				if (err) throw err;
				res.end(html);
			});
			break;
		case '/publish': //发表留言
			let data = "";
			//注册data事件
			req.on('data',(chunk) => {
				data += chunk;
			});
			//注册end事件
			req.on('end',() => {
				// console.log(data);
				let msg = querystring.parse(data);
				//需要保存发表的时间
				msg.time = new Date().toLocaleString();
				console.log(msg);
				let arr = [];
				//判断文件是否存在
				if (fs.existsSync('data.json')) {
					//已经存在了，后续的写文件,需要读取data.json
					arr = require('./data.json');
				} 
				arr.unshift(msg);
				//将arr写入到文件,需要将对象转成json字符串
				fs.writeFile('data.json', JSON.stringify(arr),'utf8',(err) => {
					if (err) throw err;
					// console.log('发布成功');
					res.writeHead(200,{"content-type":"text/html;charset=utf8"});
					res.end("<p>^_^发表留言成功,<a href='/'>返回</a></p>");
				});
			});
			break;
		default : //处理其他资源
			let filename = path.join(__dirname,urlObj.pathname);
			if (fs.existsSync(filename)) {
				fs.readFile(filename,(err,data) => {
					if (err) throw err;
					res.end(data);
				});
			} else {
				res.end();
			}
			break;
	}
});


server.listen(3000,() => {
	console.log('http server is listening in port 3000...');
});