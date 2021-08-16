const path = require('path');
const http = require('http');
const { parse } = require('querystring');

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

const server = http.createServer((req, res) => {
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        /** add other headers as per requirement */
    };

    // if (req.method === 'OPTIONS') {
    //     res.writeHead(204, headers);
    //     res.end();
    //     return;
    // }
    

    console.log(`${log_filename_tag} request event`);
    res.writeHead(204, headers);

    if (req.url === "/") {
        res.write("This is home page.");
        res.end();
    } else if (req.url === "/about" && req.method === "GET") {
        res.write("This is about page.");
        res.end();
    } else if (req.url === "/resource" && req.method === "POST") {
        res.write("This a post message.");
        collectRequestData(req, result => {
            //console.log(JSON.parse(result));
            res.end(JSON.parse({ "response": "done!"}));
        });

        // res.end();
    }
    
});

server.listen('5000', () => {
    console.log(`${log_filename_tag} server listening on port 5000`);
})


function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    const TEXT_PLAIN = 'text/plain';
    if(request.headers['content-type'] === TEXT_PLAIN) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}