
var graph = Viva.Graph.graph();
var graphLongest = Viva.Graph.graph();

var totalProcessedCascades = 0;
var totalProcessedNodes = 0;

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
                gravity : -.1
            });

            // Set custom nodes appearance
            var graphics = Viva.Graph.View.svgGraphics();
            try{
            graphics.node(function(node) {
                   // The function is called every time renderer needs a ui to display node
                var ui =  Viva.Graph.svg("rect")
                         .attr("width", 10)
                         .attr("height", 10)
                         .attr("fill", node.data.color)
                         .attr("id", node.data);

                        ui.append("text")
                            .attr("y", 5 )
                            .attr("dy", ".35em")
                            .text(node.data);
                return ui;    
                });
            }catch(ee){}  

            var renderer = Viva.Graph.View.renderer(graph, 
                {
			              container : document.getElementById('graphDiv'),
                    graphics : graphics,
                    layout : layout
                });
            renderer.run();
                        

    createLongestCascadeGraph();
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
                var numOfHashTags = 0;
                if(words[i].indexOf("#")==0){
                  //console.log(words[i]);
                  ++numOfHashTags;
                  //get the hashtag.
                  var hashtag = words[i];
                  updateCurrentHashtag(hashtag)
                  //is the hastag known?
                  if(hashtag in hashtags){
                       var hashtagVar = hashtags[hashtag];
                       if((hashtagVar == undefined) || (hashtagVar == null)){
                        hashtagVar = [];
                       }
                       //the first link found....
                       //but it coulc also be already part of the graph...Merging
                       try{
                       var mergedCascade = false;
                       var mergedFrom = "";
                       var mergedTo = "";
                       if((hashtagVar.length >=3) && (hashtagVar.length <4)){


                        if(graph.getNode(hashtagVar[0].id) != undefined){
                          mergedCascade = true;
                        }
                        if(graph.getNode(hashtagVar[1].id) != undefined){
                          mergedCascade = true;
                        }
                        if(graph.getNode(data.id) != undefined){
                          mergedCascade = true;
                        }

                         if(mergedCascade){
                            mergedFrom= graph.getNode(hashtagVar[0].id).data;
                            mergedTo= hashtag;
                            //console.log("merged cascades:"+graph.getNode(hashtagVar[0].id).data+" With "+hashtag);
                            //mergedCascade = false;
                          } 
                         data.color = "#FF0000";
                         data.root = true;
                         data.child = false;
                         data.stub = false;
                         data.position = 0;
                         graph.addNode(hashtagVar[0].id, data);//hashtagVar[0].data);
                         data.color = "#00a2e8"; //stub is initially green.
                         data.root = false;
                         data.stub = false;
                         data.child = true;
                         data.position = 1;
                         graph.addNode(hashtagVar[1].id, data);
                         //if already added get node and append the hastag..
                         if(graph.getNode(data.id) != undefined){
                          if (data.tags !=undefined){
                            data.tags.push(hashtag);
                          }else{
                            var tags = [];
                            tags.push(hashtag);
                            data.tags = tags;
                          }
                         }else{
                            var tags = [];
                            tags.push(hashtag);
                            data.tags = tags;
                         }
                         data.color = "#00cc00"; //stub is initially green.
                         data.stub = true;
                         data.position = 2;

                         graph.addNode(data.id, data);//(hashtagVar.length+1).toString());//hashtagVar[0].data);
                        if((graph.getNode(hashtagVar[0].id) !=undefined) && (graph.getNode(hashtagVar[1].id) !=undefined) && (graph.getNode(data.id) !=undefined))   {
                          graph.addLink(hashtagVar[1].id,hashtagVar[0].id);
                          graph.addLink(data.id,hashtagVar[1].id);
                       }
                       }}catch(ex){}
                       try{
                       if(hashtagVar.length >=4){
                        if(hashtagVar.length>longestCascade){
                          longestCascade = hashtagVar.length;
                          if(longestCascadeName == hashtag){}else{
                           longestCascadeName = hashtag;
                           //createLongestCascadeGraph();
                          }
                          $("#longestCascade span").html(longestCascade);
                          $("#longestCascadeID span").html(longestCascadeName);

                        }
                        if(graph.getNode(hashtagVar[hashtagVar.length-1].id) != undefined){
                          mergedCascade = true;
                        }
                        if(graph.getNode(data.id) != undefined){
                          mergedCascade = true;
                        }

                        if(mergedCascade){
                            //console.log("merged cascades:"+graph.getNode(hashtagVar[0].id).data+" With "+hashtag);
                            mergedFrom= graph.getNode(hashtagVar[0].id).data;
                            mergedTo= hashtag;
                            //mergedCascade = false;
                          } 
                          if(graph.getNode(data.id) != undefined){
                          if (data.tags !=undefined){
                            data.tags.push(hashtag);
                          }else{
                            var tags = [];
                            tags.push(hashtag);
                            data.tags = tags;
                          }
                         }else{
                            var tags = [];
                            tags.push(hashtag);
                            data.tags = tags;
                         }
                         //GREEN #00CC00 BLUE 00a2e8
                         data.color = "#00cc00";
                         data.root = false;
                         data.child = false;
                         data.stub = true;
                         data.position = hashtagVar.length-1;
                         graph.addNode(data.id, data); //(hashtagVar.length+1).toString());

                        if(graph.getNode(hashtagVar[hashtagVar.length-1].id) !=undefined){
                         
                         //remove and recolor it from a stub
                         oldStubData = graph.getNode(hashtagVar[hashtagVar.length-1].id).data;
                         oldStubData.color = '#00a2e8';
                         oldStubData.stub = false;
                         oldStubData.root = false;
                         oldStubData.child = true;
                         //var color = {'color':'#00a2e8'}
                          graph.addNode(hashtagVar[hashtagVar.length-1].id, oldStubData);
                          graph.addLink(data.id,hashtagVar[hashtagVar.length-1].id);
                        }
                       }
                     }catch(e){}
                    var ids = hashtags[hashtag];
                    if((ids == undefined) || (ids == null)){
                        ids = [];
                       }
                    ids.push(data);
                    hashtags[hashtag] = ids;



                  }else{

                    //first time the hashtag has been identified as a cascade!
                    ++totalProcessedCascades;

                    var ids = [];
                    ids.push(data);
                    hashtags[hashtag] = ids;

                  }

                  if(mergedCascade && numOfHashTags==1){
                   // console.log("merged cascades:"+mergedFrom+" With "+mergedTo);
                    mergedCascade = false;
                  } 

                  
                }
                //console.log(hashtags)
            }
         //   graph.addNode(data.id);

        }  
        }
        //update the current global counts:

        processStats();
        }catch(err){
          console.log(err);
          graph.beginUpdate();
          graph.endUpdate();

        }  

        if(cleanup){
          
          cleanUpCascades2();
          //checkNodesForMultiJoins();
          // longestCascade = 0;
          // longestCascadeName = "";
          cleanup = false;
        }

    });

var cleanup = false;

function activateCleanUP(){

  cleanup =true;
}


function processStats(){

  ++totalProcessedNodes;


  //update the UI
   $("#overallProcessedCascades span").html(totalProcessedCascades);
   $("#overallProcessedNodes span").html(totalProcessedNodes);

}



var numOfItems = 0;

var totalStubs = 0;

function checkNodesForMultiJoins(){

graph.forEachNode(function(node){

  //find if it is a stub.
  try{
  if(node.data.stub){
    ++totalStubs;
  }
}catch(e){

}

  if(numOfItems>10){
      $("#mergingHashTags span").html("");
      numOfItems = 0;
  }
    if(node.links.length>2){
        //console.log(node.id, node.data.tags);
          ++numOfItems;
          try{
          if(node.data.tags !=undefined){
            if(node.data.tags[0] != node.data.tags[1]){
             $("#mergingHashTags span").append("<p>"+node.data.tags.join(" -- ")+"</p>");
          }
          }
        }catch(e){

          }
        
    }
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

function updateCurrentHashtag(hashtag){

if(numOfItems>8){
      $("#mergingHashTags span").html("");
      numOfItems = 0;
  }
  try{
   $("#mergingHashTags span").append("<p>"+hashtag+"</p>");
   ++numOfItems;
  }catch(e){};

}

function cleanUpCascades2(){


if(graph.getNodesCount()>1000){
  graph.clear();
  hashtags = new Object();
  longestCascade = 0;
  totalStubs = 0;
}

try{
  console.log("Longest Cascade "+ longestCascadeName+ " "+longestCascade);
  }catch(e){}


  for(var key in hashtags){
    ++countHashtags; 
    try{
        if((hashtags[key] != undefined) || (hashtags[key] != null)){
            if((hashtags[key].length<2)){ //(hashtags[key].length>1) && 
                var nodes = hashtags[key];
                //console.log("Removing "+index);
                for(i = 0; i<nodes.length; i++){
                  
                  try{
                    if(graph.getNode(nodes[i].id).data.stub){++totalStubs;}
                  
                }catch(error){

                }
                    //console.log(graph.getNode(nodes[i].id).links.length);
                    if(graph.getNode(nodes[i].id) !=undefined){
                      if((graph.getNode(nodes[i].id).links.length==0) && (!graph.getNode(nodes[i].id).data.root)){
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
  $("#totalStubs span").html(totalStubs);
  countHashtags=0;

  //also set the node counter...
  var perComplete = (graph.getNodesCount()/1000)*100;
  $('#counter').attr( 'style', 'width: '+perComplete+'%' );
  $("#counter span").html(graph.getNodesCount()+" Nodes");

};



function createLongestCascadeGraph(){

  try{

  //aphLongest.addNode(1);

  var layout2 = Viva.Graph.Layout.forceDirected(graphLongest, {
                springLength : 10,
                springCoeff : 0.0010,
                dragCoeff : 0.02,
                gravity : -.1
            });

            // Set custom nodes appearance
            var graphics2 = Viva.Graph.View.svgGraphics();
            try{
            graphics2.node(function(node) {
                   // The function is called every time renderer needs a ui to display node
                var ui =  Viva.Graph.svg("rect")
                         .attr("width", 6)
                         .attr("height", 6)
                         .attr("fill", "#FF7F50");

                return ui;    
                });
            }catch(ee){}  

            var renderer2 = Viva.Graph.View.renderer(graphLongest, 
                {
                    container : document.getElementById('singleCascadeGraph'),
                    graphics : graphics2,
                    layout : layout2
                });
            renderer2.run();

  }catch(e){

    console.log(e);

  }


}

function updateLongestCascadeGraph(){

  graphLongest.clear();

   var nodes = hashtags[longestCascadeName];

    for(i = 0; i<nodes.length; i++){
      try{
        graphLongest.addLink(nodes[i+1].id,nodes[i].id);
      }catch(e){

      }
    }

}


    
var interval = setInterval(function(){activateCleanUP()}, 100);

var intervalGraphSmall = setInterval(function(){updateLongestCascadeGraph()}, 5000);


//var intervalHastags = setInterval(function(){checkNodesForMultiJoins()}, 500);




