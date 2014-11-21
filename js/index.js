
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
            try{
            graphics.node(function(node) {
                   // The function is called every time renderer needs a ui to display node
                   return  Viva.Graph.svg('text')
                        .attr('y', '0px').text(node.data);
                });
            }catch(ee){}  

            var renderer = Viva.Graph.View.renderer(graph, 
                {
			              container : document.getElementById('graphDiv'),
                    graphics : graphics,
                    layout : layout
                });
            renderer.run();
                        


  };
    //SOCKET IOCODE
    var countHashtags= 0;
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
        if(data !=undefined){
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
                       if((hashtagVar == undefined) || (hashtagVar == null)){
                        hashtagVar = [];
                       }
                       //the first link found....
                       try{
                       if((hashtagVar.length >=1) && (hashtagVar.length <2)){
                         graph.addNode(hashtagVar[0].id, hashtag);//hashtagVar[0].data);
                         graph.addNode(data.id, (hashtagVar.length+1).toString());//hashtagVar[0].data);
                        if((graph.getNode(hashtagVar[0].id) !=undefined) && (graph.getNode(data.id) !=undefined))   {
                         graph.addLink(data.id,hashtagVar[0].id);
                       }
                       }}catch(ex){}
                       try{
                       if(hashtagVar.length >=2){
                        if(hashtagVar.length>longestCascade){
                          longestCascade = hashtagVar.length;
                          longestCascadeName = hashtag;
                          $("#longestCascade span").html(longestCascade);
                          $("#longestCascadeID span").html(longestCascadeName);

                        }
                        graph.addNode(data.id, (hashtagVar.length+1).toString());
                        if(graph.getNode(hashtagVar[hashtagVar.length-1].id) !=undefined){
                          graph.addLink(data.id,hashtagVar[hashtagVar.length-1].id);
                        }
                       }}catch(e){}
                    var ids = hashtags[hashtag];
                    if((ids == undefined) || (ids == null)){
                        ids = [];
                       }
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
        }

        }catch(err){
          console.log(err);
          graph.beginUpdate();
          graph.endUpdate();

        }  

        if(cleanup){
          
          cleanUpCascades2();
          //cleanupGraph();
          longestCascade = 0;
          longestCascadeName = "";
          cleanup = false;
        }

    });

var cleanup = false;

function activateCleanUP(){

  cleanup =true;
}



function cleanupGraph(){


graph.forEachNode(function(node){

    console.log(node.id, node);
});

}

// function cleanUpCascades(){

// try{
//   console.log("Longest Cascade "+ longestCascadeName+ " "+longestCascade.toString());
//   }catch(e){

//   }
//   for(var index in hashtags){
//       try{
//       if(hashtags[index].length<5){
//         nodes = hashtags[index];
//         for(i=0; i <= nodes.length; i++){
//           //graph.removeNode(nodes[i].id);
//           try{
//          // graph.removeLink(nodes[i].id, nodes[i+1].id);
//          if( i != (nodes.length - 1)){
//           if(graph.getNode(nodes[i].id).links.length  <=1){
//              graph.removeNode(nodes[i].id);
//             }else{
              
//                 graph.getNode(nodes[i].id).data = graph.getNode(nodes[i].id).data +" MERGED "+  graph.getNode(nodes[0].id).data;
//             }
//       }

//       if(graph.getNode(nodes[i].data)==2){
//                  console.log(graph.getNode(nodes[i].id))
//             }
//       //single node

//         }catch(e){

//             // if(graph.getNode(nodes[i].id).links.length < 2){
//            graph.removeNode(nodes[i].id);
//             // }
//         }
//         }
        
//         var ids = [];
//         hashtags[index] = ids ;
//         delete hashtags[index]; 
//      }
//     }catch(e){}


//   }

// };

function cleanUpCascades2(){


if(graph.getNodesCount()>1000){
  graph.clear();
  hashtags = new Object();
  longestCascade = 0;
}

try{
  console.log("Longest Cascade "+ longestCascadeName+ " "+longestCascade);
  }catch(e){}


  for(var key in hashtags){
    ++countHashtags;
    try{
        if((hashtags[key] != undefined) || (hashtags[key] != null)){
            if((hashtags[key].length<5)){ //(hashtags[key].length>1) && 
                var nodes = hashtags[key];
                //console.log("Removing "+index);
                for(i = 0; i<nodes.length; i++){
                    //console.log(graph.getNode(nodes[i].id).links.length);
                    if(graph.getNode(nodes[i].id) !=undefined){
                      if(graph.getNode(nodes[i].id).links.length<=2){
                          //console.log("Removing "+nodes[i].id);
                          graph.removeNode(nodes[i].id);
                      }
                    }
                  
                }
                delete hashtags[key];
            }
        }
      }catch(e){
        console.log(e);
      }
  
  }
  $("#totalCascades span").html(countHashtags);
  countHashtags=0;

  //also set the node counter...
  var perComplete = (graph.getNodesCount()/1000)*100;
  $('#counter').attr( 'style', 'width: '+perComplete+'%' );
  $("#counter span").html(graph.getNodesCount()+" Nodes");

};

    
var interval = setInterval(function(){cleanUpCascades2()}, 500);





