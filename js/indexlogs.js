
var graph = Viva.Graph.graph();
var graphLongest = Viva.Graph.graph();

var totalProcessedCascades = 0;
var totalProcessedNodes = 0;


//starting operator
filterOperator = "#";
filterOperatorLang = "";


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
                         .attr("width", 8)
                         .attr("height", 8)
                         .attr("fill", node.data.color)
                         .attr("id", node.data);

                        ui.append("text")
                            .attr("y", '-4px' )
                            //.attr("dy", ".35em")
                            .text(node.data.label);
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


    getFilterOperator();

  };


  function getFilterOperator(){

    if(current_filter_keyword.length>0){
      filterOperator = current_filter_keyword;
    }else{
      filterOperator = "#";
    }
    return filterOperator;

  }

    function getFilterOperatorLang(){

    if(current_filter_lang.length>0){
      filterOperatorLang = current_filter_lang;
    }else{
      filterOperatorLang = "";
    }
    return filterOperatorLang;

  }

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

    socket.on('twitter', function (data) {
        //console.log(data);
      
      if(generateCascades(data))

        if(cleanup){
          
          cleanUpCascades2();
          observeCascadePatterns();
          //checkNodesForMultiJoins();
          // longestCascade = 0;
          // longestCascadeName = "";
          cleanup = false;
        }
      

    });



function generateCascades(data){

 try{
        if(data !=undefined){
        if(data.text.indexOf(getFilterOperator()) > -1){
            //set the cascade properties
            data.root = false;
            data.child = false;
            data.stub = false;
            var words = [];
            words = data.text.split(" ");
            for(i=0; i < words.length; i++){
                var numOfHashTags = 0;
                if(words[i].indexOf(getFilterOperator())==0){
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
                         //give a root node...
                         var root = hashtagVar[0];
                         root.color = "#FF0000";
                         root.root = true;
                         root.child = false;
                         root.stub = false;
                         root.position = 0;
                         root.label = hashtag;
                         graph.addNode(root.id, root);//hashtagVar[0].data);
                         //must also update the original model
                         hashtagVar[0] = root;
                        

                         var firstNode = hashtagVar[1];
                         firstNode.color = "#00a2e8"; //stub is initially green.
                         firstNode.root = false;
                         firstNode.stub = false;
                         firstNode.child = true;
                         firstNode.position = 1;
                         graph.addNode(firstNode.id, firstNode);
                          hashtagVar[1] = firstNode;

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
                        if((graph.getNode(root.id) !=undefined) && (graph.getNode(firstNode.id) !=undefined) && (graph.getNode(data.id) !=undefined))   {
                          graph.addLink(firstNode.id,root.id);
                          graph.addLink(data.id,firstNode.id);
                       }
                       }}catch(ex){


                       }
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

                        //set the newly added edge as the stub.
                         //GREEN #00CC00 BLUE 00a2e8
                         data.color = "#00cc00";
                         data.root = false;
                         data.child = false;
                         data.stub = true;
                         data.position = hashtagVar.length-1;
                         graph.addNode(data.id, data); //(hashtagVar.length+1).toString());

                        if(graph.getNode(hashtagVar[hashtagVar.length-1].id) !=undefined){
                         
                         //remove and recolor it frombeing a stub and update
                         oldStubData = graph.getNode(hashtagVar[hashtagVar.length-1].id).data;
                         oldStubData.color = '#00a2e8';
                         oldStubData.stub = false;
                         oldStubData.root = false;
                         oldStubData.child = true;
                         graph.addNode(oldStubData.id, oldStubData);
                         hashtagVar[hashtagVar.length-1] = oldStubData;
                         graph.addLink(data.id,oldStubData.id);
                        }
                       }
                     }catch(e){

                     }
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

        return true;


}



var cleanup = false;

function activateCleanUP(){

  cleanup =true;
}

var cascadePatterns = {};

function observeCascadePatterns(){

  for(hashtag in hashtags){
  var output = "";
  if(hashtags[hashtag].length>5){
    var nodes = hashtags[hashtag];
                //console.log("Removing "+index);
                output = "START-";
                for(i = 0; i<nodes.length; i++){
                  if(nodes[i].root){
                  output = output + "root-";
                  }
                  if(nodes[i].child){
                  output = output + "child-"; 
                  }
                  if(nodes[i].stub){
                  output = output + "stub-";
                  }
                  
                }
                output = output+"END";
                //console.log(output);
    
  

  if(output.indexOf("root") > -1){
    //add to current patterns
     if(output in cascadePatterns){
        cascadePatterns[output] = cascadePatterns[output]+1;

      }else{
            cascadePatterns[output] = 1;
      }
  }
}
}
fimdMostCommonCascadeType();
  //console.log("unique Cascade Patterns: "+ Object.keys(cascadePatterns).length);
}

function fimdMostCommonCascadeType(){

  var longest = 0;
  var mostCommon = "";
  for(cascade in cascadePatterns){
    if(cascadePatterns[cascade] > longest){
      longest = cascadePatterns[cascade];
      mostCommon = cascade;
    }
  }

  console.log("most common cascade:"+mostCommon);

}


function processStats(){

  ++totalProcessedNodes;


  //update the UI
   $("#overallProcessedCascades span").html(totalProcessedCascades);
   $("#overallProcessedNodes span").html(totalProcessedNodes);
   $("#overallCascadePatterns span").html(Object.keys(cascadePatterns).length);

}



var numOfItems = 0;

var totalRoots = 0;

var totalStubs = 0;

var totalChildren = 0;

function checkNodesForMultiJoins(){

graph.forEachNode(function(node){

  //find if it is a stub.
  try{
    if(node.data.stub){
      ++totalStubs;
    }
    if(node.data.child){
      ++totalChildren;
    }
    if(node.data.root){
      ++totalRoots;
    }
  }catch(e){}

  if(numOfItems>4){
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

if(numOfItems>5){
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
  totalRoots = 0;
  totalChildren = 0;
}

try{
  console.log("Longest Cascade "+ longestCascadeName+ " "+longestCascade);
  }catch(e){}


  for(var key in hashtags){
    ++countHashtags; 
    try{
        if((hashtags[key] != undefined) || (hashtags[key] != null)){
            if((hashtags[key].length<2)){ //(hashtags[key].length>1) &&  //THIS WAS 2 BEFORE SPINN3R BREAKING
                var nodes = hashtags[key];
                //console.log("Removing "+index);
                for(i = 0; i<nodes.length; i++){
                  
                  try{
                    if(graph.getNode(nodes[i].id).data.stub){++totalStubs;}
                    if(graph.getNode(nodes[i].id).data.child){++totalChildren;}
                    if(graph.getNode(nodes[i].id).data.root){++totalRoots;}
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
  $("#totalRoots span").html(totalRoots);
  $("#totalStubs span").html(totalStubs);
  $("#totalChildren span").html(totalChildren);
  $("#cascadeFilter span").html(filterOperator);
  $("#cascadeFilterLang span").html(getFilterOperatorLang());

  cascadeFilterLang



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
                         .attr("fill", "#FFA500");

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




