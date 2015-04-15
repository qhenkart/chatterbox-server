var _ = require('underscore')
var fs = require('fs');



//SETS THE HEADERS
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "application/json"
};

//INITIALIZES FILE STORAGE
var storage;
fs.readFile('storage/storage', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  if(data.length){
    storage = JSON.parse(data);
  }else{
    storage = {lobby:[]};

  }
});

//HANDLES SENDING RESPONSE TO CLIENT
var sendResponse = function(response, data, statusCode){
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data))
}

//HANDLES COLLECTING DATA FROM CLIENT
var collectData = function(request, callback){
  var data = "";
  request.on('data', function(chunk){
    data += chunk;
  });
  request.on('end', function(){
    callback(JSON.parse(data));
  });
};

//HANDLES RESTful ACTIONS
var actions = {
  'GET': function(request, response){
    if(JSON.stringify(storage[request.url.slice(1)]) === undefined){
      sendResponse(response, storage.lobby)
    }else{
      sendResponse(response, storage[request.url.slice(1)])
    }
  },

  'POST': function(request, response){
    statusCode = 201;
    collectData(request, function(message){
      if(storage[message.roomname]){
        storage[message.roomname].unshift(message)
      }else{
        storage[message.roomname] = [message]
      }

      fs.writeFile("storage/storage", JSON.stringify(storage), function(err){
        if(err){
          return console.log(err);
        }
          console.log("saved to local storage")
          sendResponse(response, storage)
      });

    });
  },
  'OPTIONS': function(request,response){
    sendResponse(response, null)
  }
}

//MAIN SERVER CONTROLLER
module.exports=function(request,response){
  console.log("Serving request type " + request.method + " for url " + request.url);
  var action = actions[request.method];
  if(action){
    action(request,response)
  }else {
    sendResponse(response, "Not Found", 404)
  }

}

// exports.requestHandler = requestHandler
