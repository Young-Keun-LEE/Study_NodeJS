const http = require("http");
const fs = require("fs").promises;

http.createServer(async (req, res) => {
    try{
        const data = await fs.readFile('./tes    t.html');
        res.writeHead(200, {'content-type': 'text/html; chatset=utf-8'})
        res.end(data);
    }catch(err){
        console.error(err);
        res.writeHead(500, {'content-type': 'text/plain; charset=utf-8'});
        res.end(err.message);
    }
})
.listen(8080, () => {
    console.log('8080번 포트에서 서버 대기 중입니다...');
})