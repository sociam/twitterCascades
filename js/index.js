
var graph = Viva.Graph.graph();


function main(){
            
            // Step 2. We add nodes and edges to the graph:
           // graph.addLink(1, 2);
            /* Note: graph.addLink() creates new nodes if they are not yet
               present in the graph. Thus calling this method is equivalent to:
               graph.addNode(1);
               graph.addNode(2);
               graph.addLink(1, 2);
            */
            // Step 3. Render the graph.
            

            var layout = Viva.Graph.Layout.forceDirected(graph, {
                springLength : 10,
                springCoeff : 0.0010,
                dragCoeff : 0.02,
                gravity : -.5
            });

            // Set custom nodes appearance
            var graphics = Viva.Graph.View.svgGraphics();
            graphics.node(function(node) {
                   // The function is called every time renderer needs a ui to display node
                   return  Viva.Graph.svg('text')
                           .attr('y', '0px').text(node.data);
                });
              

            var renderer = Viva.Graph.View.renderer(graph, 
                {
                    graphics : graphics,
                    layout : layout
                });
            renderer.run();
                        


  };
    //SOCKET IOCODE
    var countTotal = 0;
    var words = {};
    var count = 0;
    var users = {};
    var socket = io.connect('http://sociamvm-app-001.ecs.soton.ac.uk:9001');
    //var socket = io.connect('http://sociamvm-app-001.ecs.soton.ac.uk:9001');
    var hashtags = new Object();
    var longestCascade = 0;
    var longestCascadeName = "";

    socket.on('spinn3r', function (data) {
       // console.log(data);
       try{
        if(data.text.indexOf("#") > -1){
            var words = [];
            words = data.text.split(" ");
            for(i=0; i < words.length; i++){
                if(words[i].indexOf("#")==0){
                  //console.log(words[i]);
                  
                  //get the hashtag.
                  var hashtag = words[i];

                  //is the hastag known?
                  if(hashtag in hashtags){
                       var hashtagVar = hashtags[hashtag];
                       //the first link found....
                       if((hashtagVar.length >=1) && (hashtagVar.length <2)){
                         graph.addNode(hashtagVar[0].id, hashtag);//hashtagVar[0].data);
                         graph.addNode(data.id, (hashtagVar.length+1).toString());//hashtagVar[0].data);
                         graph.addLink(hashtagVar[0].id, data.id);
                       }
                       if(hashtagVar.length >=2){
                        if(hashtagVar.length>longestCascade){
                          longestCascade = hashtagVar.length;
                          longestCascadeName = hashtag;
                        }
                        graph.addNode(data.id, (hashtagVar.length+1).toString());
                        graph.addLink(hashtagVar[hashtagVar.length-1].id, data.id);
                       }
                    var ids = hashtags[hashtag];
                    ids.push(data);
                    hashtags[hashtag] = ids;
                  }else{
                    var ids = [];
                    ids.push(data);
                    hashtags[hashtag] = ids;
                  }
                }
                //console.log(hashtags)
            }
         //   graph.addNode(data.id);
        }  
        }catch(err){
          console.log(err)

        }  

        if(cleanup){
          
          cleanUpCascades();
          cleanupGraph();
          cleanup = false;
        }

    });

var cleanup = false;

function activateCleanUP(){

  cleanup =true;
}



function cleanupGraph(){

graph.forEachNode(function(node){
    

      graph.forEachLinkedNode(node, function(linkedNode, link){
        graph.removeLink(link); 
      });
    

    //console.log(node.id, node.data);
});



}

function cleanUpCascades(){

  console.log("Longest Cascade "+ longestCascadeName+ " "+longestCascade.toString());
  
  for(var index in hashtags){
      try{
      if(hashtags[index].length<5){
        nodes = hashtags[index];
        for(i=0; i < nodes.length; i++){


          //graph.removeNode(nodes[i].id);
          try{
         // graph.removeLink(nodes[i].id, nodes[i+1].id);
         if(i != (nodes.length - 1)){
          if(graph.getNode(nodes[i].id).links.length  <=1){
             graph.removeNode(nodes[i].id);
        }else{
          graph.getNode(nodes[i].id).data = graph.getNode(nodes[i].id).data +" MERGED "+  graph.getNode(nodes[0].id).data;

        }
      }


      //single node

        }catch(e){
            // if(graph.getNode(nodes[i].id).links.length < 2){
            //       graph.removeNode(nodes[i].id);
            // }
        }
        }
        
        var ids = [];
        hashtags[index] = ids ;
        delete hashtags[index]; 
     }
    }catch(e){}


  }

};
    
var interval = setInterval(function(){activateCleanUP()}, 3000);