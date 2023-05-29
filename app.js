let http = require('http');
let fs = require('fs');
let qs = require('qs');
let url = require('url');

let server = http.createServer((req, res) => {
    let parseUrl = url.parse(req.url);
    let path = parseUrl.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g, '');
    let chosenHandler = (typeof router[trimPath] !== 'undefined') ? router[trimPath] : handlers.notfound;
    chosenHandler(req, res);
});

server.listen(8080, () => {
    console.log('http://localhost:8080');
});

let handlers = {};

handlers.login = (req, res) => {
    fs.readFile('./views/login.html', 'utf-8', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};
handlers.home = (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        data = qs.parse(data);
        let expires = Date.now() + 1000 * 60 * 60;
        let tokenSession = "{\"name\":\"" + data.name + "\",\"email\":\"" + data.email + "\",\"password\":\"" + data.password + "\",\"expires\":" + expires + "}";
        createSessionToken(tokenSession);
        fs.readFile('./views/homepage.html', 'utf-8', (err, dataHtml) => {
            if (err) {
                console.log(err);
            }
            dataHtml = dataHtml.replace('{name}', data.name);
            dataHtml = dataHtml.replace('{email}', data.email);
            dataHtml = dataHtml.replace('{password}', data.password);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(dataHtml);
            return res.end();
        });
    });
    req.on('error', () => {
        console.log('error');
    });
};
handlers.notfound = (req, res) => {
    fs.readFile('./views/notfound.html', 'utf-8', (err, data) => {
        res.writeHead(404);
        res.write(data);
        return res.end();
    });
};

let router = {
    'login': handlers.login,
    'home': handlers.home,
    'notfound': handlers.notfound
};

let createRandomString = (strLength) => {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        let possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
        let str = '';
        for (let i = 0; i < strLength; i++) {
            let randomCharacter = possibleCharacter.charAt(Math.floor(Math.random() * possibleCharacter.length));
            str += randomCharacter;
        }
        return str;
    }
};

let createSessionToken = (data) => {
    let tokenId = createRandomString(20);
    let fileName = './token/' + tokenId;
    fs.writeFile(fileName, data, err => {
        if (err) {
            console.log(err.message);
        }
    });
};