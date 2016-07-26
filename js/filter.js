    var filter = false;
    var active_users = 0;
    var current_filter_keyword = "";
    var current_filter_lang = "";


    //check for active filters
    socket.emit("filter","");


    //-------------------------------------------------------------
    //THINGS TO DO WITH THE SOCKET


    socket.on('callback', function(data) {
      console.log(data.done);
      // Print the data.data somewhere...
    });


    socket.on('processed_msg_cnt', function(data) {
      $("#processedMessages span").html(data);
      // Print the data.data somewhere...
    });


    socket.on('user_heartbeat', function (data) {
         socket.emit("active_user","");
      //sent a signal to the server to let them know you're here!
    });

    socket.on('filter', function (data) {
       filter = data;
      //sent a signal to the server to let them know you're here!
    });


    //Check for an filtering going on for the keyword
    socket.on('set_filter_keyword', function (data) {
      console.log(data)
      current_filter_keyword = data;
    });

       //Check for an filtering going on for the keyword
    socket.on('set_filter_lang', function (data) {
      console.log(data)
      current_filter_lang = data;
    });




    
  