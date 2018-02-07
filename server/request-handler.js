/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

const fs = require('fs');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var returnValue = {results: [{username: 'Jono', text: 'Do my bidding!', message: 'Do my bidding!', roomname: 'lobby' }]}; // Return JSON Object
var counter = 0;

var fetchFile = function(url, res) {
  fs.readFile(('../client' + url), 'utf8', function(err, data) {
  // error handling
    if (err) {
      return res.end(err); 
    }
    // now we have the data
    //console.log("data:" + data);
    res.end(data);
    
  });
};



var requestHandler = function(request, response) {
  
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  //Serve local index.html file if request endpoint is '/'
  // See the note below about CORS headers.

  if (request.url.includes('?username=')) {
    request.url = request.url.substr(0, request.url.indexOf('?'));
  }

  var headers = defaultCorsHeaders;
 

  
  if (!request.url.includes('/classes/messages')) {
    var statusCode = 200;

    if (request.url === '/') {
      request.url = request.url + 'index.html';
      headers['Content-Type'] = 'text/html'; 
    } else if (request.url.includes('.js')) {
      headers['Content-Type'] = 'text/javascript';
    } else if (request.url.includes('.css')) {
      headers['Content-Type'] = 'text/css';
    } else if ( request.url.includes('.gif')) {
      headers['Content-Type'] = 'image/gif';
    }
    fetchFile(request.url, response);
  }


  if (request.url.includes('/classes/messages')) {


    console.log('Serving request type ' + request.method + ' for url ' + request.url);
    
    // The outgoing status.
    var statusCode = ((request.method === 'GET') || (request.method === 'OPTIONS') ) ? 200 : 201;
    statusCode = (request.url.includes('/classes/messages')) ? statusCode : 404;
 

    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = 'application/json';
    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
   

    if (request.method === 'POST') {
      request.on('data', function(chunk) {
        var newMessage = JSON.parse(chunk);
        newMessage.roomname = (newMessage.roomname === undefined) ? 'lobby' : newMessage.roomname;
        counter++;
        newMessage.objectId = counter + 1;
        newMessage.createdAt = new Date();
        newMessage.updatedAt = newMessage.createdAt;
        returnValue.results.push(newMessage);
        console.log('post', newMessage);
      });
    } 

    response.end(JSON.stringify(returnValue));
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


exports.requestHandler = requestHandler;