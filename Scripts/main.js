//vars
var canvas;
var ctx;
var started = false;
var KeyPressMeM;
var LogToConsole = true;
var DevLog = ""
var CanDoHS = true;
var devMode = false
//Replay Timer
var ReplayTimer;
//Demo Running
var Demo = false;
//snake Vars
/*Direction id Controlled Like This...
		1
	4	0	2
		3
*/
var SnakeData = {
  //Direction of Snake
  Direction: 0,
  //Length Of Snake
  Length: 1,
  //Player's High Score
  HighScore: 0,
  //Starting Positon
  StartingPos: [3,3],
  //The Head
  Head: [-1,-1],
  //The Tail
  Snake: [-1,-1],
  //Food Location
  Food: [-1,-1],
};
var Config = {
  //DarkMode
  Dark: false,
  //Board Size
  Size: 2,
  //Snake Speed
  Speed: 100,
  //Food Length Multiplier
  FoodMult: 1,
  //Replay (dev Mode Only)*Warning* Still Buggy
  Record: false,
  //Stored Replay
  Replay: [0,0],
};

function onload(){
  //alert("onLoad");
  /*if (console.re.log()){
    console.re.log('remote log test');
  }*/
  ATDL("Direction: "+SnakeData.direction+", Length: "+SnakeData.Length+
                 ", Starting Position: "+SnakeData.StartingPos);
  var canvas = document.getElementById('Canvas');
  if (canvas.getContext) {
  var ctx = canvas.getContext('2d');
  ATDL("Canvas Supported");
  	// drawing code here
  } else {
  	//alert("Your Browser Dosn't Support Canvas");
    var ctx = null;
    var canvas = null;
    ATDL("Canvas Not Supported");
    document.getElementById('NotSupportedPopup').style.visibility = "visible";
    return;
  }
  //alert("Canvas = "+canvas+"\n"+"Ctx = "+ctx);
  DrawInitial(ctx,canvas);
  window.setInterval(function(){
    if (started == false){
      document.getElementById('startPopup').style.visibility = "visible";
      //ATDL("Started = "+started)
      //Reset Head
      var canvas = document.getElementById('Canvas');
      var ctx = canvas.getContext('2d');
      //SetHeadToDefaultLoc(ctx,canvas);
      SnakeData.Direction = 0;
    }else{
      document.getElementById('startPopup').style.visibility = "hidden";
      document.addEventListener("keydown",CheckKeyPressed);
    }
  }, 500);
  window.setInterval(function(){
    var message = SnakeData.Length+1;
    document.getElementById('LengthScore').innerHTML = message
  },200)
  
  SetHeadToDefaultLoc(ctx,canvas)
  GetHighScore();
  return canvas, ctx;
}


function DrawInitial(ctx,canvas){
  var canvas = document.getElementById('Canvas');
  var ctx = canvas.getContext('2d');
  if (Config.Dark == true){
    ctx.strokeStyle = "white"
    ctx.fillStyle = "white"
    document.getElementById('Canvas').style.backgroundColor = "#262626";
    document.body.style.backgroundColor = "#262626";
    document.getElementById('CanvasDiv').style.borderColor = 'white';
    document.getElementById('Canvas').style.borderColor = 'white';
  }else{
    ctx.strokeStyle = "black"
    ctx.fillStyle = "black"
    document.getElementById('Canvas').style.backgroundColor = "darkgray";
    document.body.style.backgroundColor = "white";
    document.getElementById('CanvasDiv').style.borderColor = 'black';
    document.getElementById('Canvas').style.borderColor = 'black';
  }
  ctx.clearRect(0,0,600,600)
  var row = 0;
  var col = 0;
  for (var i=1;i<421;i++){
    var colmult = 30*col; 
    var rowmult = 30*row
    ctx.strokeRect(colmult,rowmult,29,29);
    //ctx.strokeRect();
    //ATDL("Row: "+row+", Col: "+col);
  	col = col+1;
    if (col > 19){
      row = row+1;
      col = 0;
    }
  }
  
}
function GetHighScore(){
  //document.getElementById('HighScore').innerHTML = message
  var LocalStored = parseInt(window.localStorage.getItem('HighScore'));
  if (Number.isNaN(LocalStored)){
    //document.getElementById('HighScore').innerHTML = "Error, High Score Not Found";
    //document.getElementById('HighScoreBox').style.height = "90px";
  }else{
    SnakeData.HighScore = LocalStored;
  }
  document.getElementById('HighScore').innerHTML = SnakeData.HighScore;
}
function CheckHighScore(){
  if (CanDoHS){
    if (SnakeData.Length+1 > SnakeData.HighScore){
      SnakeData.HighScore = SnakeData.Length+1
      window.localStorage.setItem('HighScore',SnakeData.HighScore);
      document.getElementById('HighScore').innerHTML = SnakeData.HighScore;
    }
  }
}
function ResetHS(){
  SnakeData.HighScore = 0
  window.localStorage.setItem('HighScore',SnakeData.HighScore);
  document.getElementById('HighScore').innerHTML = SnakeData.HighScore;
}

    function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}
function SetHeadToDefaultLoc(ctx,canvas){
  var canvas = document.getElementById('Canvas');
  var ctx = canvas.getContext('2d');
  //ATDL("setting Head to Defualt Loc")
  SnakeData.Head[0] = SnakeData.StartingPos[0];
  SnakeData.Head[1] = SnakeData.StartingPos[1];
  DrawInitial(ctx,canvas);
  var colmult = 30*SnakeData.Head[0]; 
  var rowmult = 30*SnakeData.Head[1];
  ctx.fillRect(colmult,rowmult,29,29);
}
var PlayIntervalVar
function Play(){
  SnakeData.Length = 1;
  KeyPressMeM = "";
  AntiSpamKeyMem = "";
  RandFood();
  SnakeData.Snake = []
  if (Config.Record){
    //If True, Start Replay Timer
    //Config.Replay = [];
    Config.Replay[0] = Config.Speed;
    //alert(Config.Replay);
    ReplayTimer = 0
    var RecTimeElapsed = setInterval(function(){
      ReplayTimer = ReplayTimer+20;
      if (!Config.Record){
        clearInterval(RecTimeElapsed);
      }
    },20);
    RecordInfo();
  }
  PlayIntervalVar = setInterval(function(){
    var canvas = document.getElementById('Canvas');
    var ctx = canvas.getContext('2d');
    //ATDL("Running Play")
    if (started == false){
      clearInterval(PlayIntervalVar);
      SetHeadToDefaultLoc(ctx,canvas);
      CheckHighScore();
      return;
    }
    //Speed Calculation
    //Snake Head Location Calculated
    CalcSnakeHeadLoc();
    //Body Parts
    if (SnakeData.Snake.length/2 < SnakeData.Length){
      for (var i=SnakeData.Snake.length/2;i==SnakeData.Length;i++){
        SnakeData.Snake.concat([0,0]);
        ATDL(SnakeData.Snake);
      }
    }
    //MoveMent Calculation
    DrawSnakeCurrentLocation();
    CheckCollision();
    if (SnakeData.Direction == 1){
      KeyPressMeM = "ArrowDown";
    }else if (SnakeData.Direction == 2){
      KeyPressMeM = "ArrowLeft";
    }else if (SnakeData.Direction == 3){
      KeyPressMeM = "ArrowUp";
    }else if (SnakeData.Direction == 4){
      KeyPressMeM = "ArrowRight";
    }else{
    }
    RecordInfo();
  },Config.Speed)
}
function CalcSnakeHeadLoc(){
  if (Demo){
    return;
  }
  if (SnakeData.Direction == 0){
        
    }else if (SnakeData.Direction == 1){
      SnakeData.Head[1] = SnakeData.Head[1]-1;
    }else if (SnakeData.Direction == 2){
      SnakeData.Head[0] = SnakeData.Head[0]+1;
    }else if (SnakeData.Direction == 3){
      SnakeData.Head[1] = SnakeData.Head[1]+1;
    }else if (SnakeData.Direction == 4){
      SnakeData.Head[0] = SnakeData.Head[0]-1;
    }
}
function DrawSnakeCurrentLocation(){
  var canvas = document.getElementById('Canvas');
  var ctx = canvas.getContext('2d');
  DrawInitial(ctx,canvas);
  //Head
  //ATDL("row: "+SnakeData.Head[1]+",\n col: "+SnakeData.Head[0])
  var colmult = 30*SnakeData.Head[0]; 
  var rowmult = 30*SnakeData.Head[1];
  ctx.fillStyle = '#39ff14';
  ctx.fillRect(colmult,rowmult,29,29);
  if (Config.Dark == true){
    ctx.fillStyle = 'white';
  }else{
    ctx.fillStyle = 'black';
  }
  //Body
  for (var i=SnakeData.Length;i >= 0;i--){
    if (i==0){
      SnakeData.Snake[0] = SnakeData.Head[0];
      SnakeData.Snake[1] = SnakeData.Head[1];
    }else{
    var SnakeBDPTLocData = i*2;
    SnakeData.Snake[SnakeBDPTLocData] = SnakeData.Snake[SnakeBDPTLocData-2];
    
    SnakeBDPTLocData = SnakeBDPTLocData+1;
    SnakeData.Snake[SnakeBDPTLocData] = SnakeData.Snake[SnakeBDPTLocData-2];
    //ATDL("Data Assign Is Working... "+SnakeData.Snake[i*2-2]+", "+SnakeData.Snake[SnakeBDPTLocData-2]);
    }
  }
  CheckCollision()
  for (var i=SnakeData.Length;i > 0;i--){
    //Actual Drawing
    var mult = i*2;
    var colmult = 30*parseInt(SnakeData.Snake[mult]); 
    mult = i*2+1;
  	var rowmult = 30*parseInt(SnakeData.Snake[mult]);
    //ATDL("BodyPart "+i+" is... "+SnakeData.Snake[i*2]+" "+SnakeData.Snake[mult])
    ctx.fillRect(colmult,rowmult,29,29);
  }
  //Draw Food
  ctx.fillStyle = 'red';
  ctx.fillRect(SnakeData.Food[0]*30,SnakeData.Food[1]*30,29,29);
  ctx.fillStyle = 'black';
}
function CheckCollision(){
  //Food Collision
  if (SnakeData.Head[0]==SnakeData.Food[0]&&SnakeData.Head[1]==SnakeData.Food[1]){
    SnakeData.Length = SnakeData.Length+1*Config.FoodMult
    RandFood();
  }
  //Side Collision
  if (SnakeData.Head[0]<0 || SnakeData.Head[0]>19 || SnakeData.Head[1]<0 || SnakeData.Head[1]>19){
    DrawSnakeDead();
    started = false;
  }
  //Snake Body Collision
  for (var i=SnakeData.Length;i>1;i--){
    if (SnakeData.Head[0]==SnakeData.Snake[i*2] && SnakeData.Head[1]==SnakeData.Snake[i*2+1]){
      DrawSnakeDead();
      started = false;
    }
  }
}
function RandFood(){
  //Randomize Food Loc
  if (Demo){
    return
  }
  var max = 18;
  var min = 1;
  var done=false;
  while (!done){
    var randLocValue = Math.floor(Math.random()*(max-min))-min;
    randLocValue = parseInt(randLocValue, 10);
    var randLocValue2 = Math.floor(Math.random()*(max-min))-min;
    randLocValue2 = parseInt(randLocValue2, 10);

    while (randLocValue < 1 || randLocValue > 18){
      randLocValue = Math.floor(Math.random()*(max-min))-min;
    }
    if (foodNotInSnake(randLocValue, randLocValue2)){
      SnakeData.Food[0] = randLocValue;
      SnakeData.Food[1] = randLocValue;
      done=true;
    }
  }

  ATDL("Food Is Located At: "+SnakeData.Food[0]+", "+SnakeData.Food[1])
  
}
function foodNotInSnake(x, y){
  if (SnakeData.Head[0]==x && SnakeData.Head[1]==y){
    return false;
  }
  /*
  for (var i=0; i<SnakeData.Snake/2; i++){
    if (SnakeData.Snake[i*2]==x && SnakeData.Snake[i*2+1]==y){
      return false;
    }
  }
  */
  for (var i=SnakeData.Length;i>1;i--){
    if (x==SnakeData.Snake[i*2] && y==SnakeData.Snake[i*2+1]){
      return false;
    }
  }
  return true;
}

function DrawSnakeDead(){
  var canvas = document.getElementById('Canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red'
  for (var i=SnakeData.Length;i > 0;i--){
    //Actual Drawing
    var mult = i*2;
    var colmult = 30*parseInt(SnakeData.Snake[mult]); 
    mult = i*2+1;
  	var rowmult = 30*parseInt(SnakeData.Snake[mult]);
    //ATDL("BodyPart "+i+" is... "+SnakeData.Snake[i*2]+" "+SnakeData.Snake[mult])
    ctx.fillRect(colmult,rowmult,29,29);
  }
  if (Demo){
    Demo = false
    demoforval=0
  }
  if (Config.Record){
    Demo = false
    Config.Record = false;
    //alert(Config.Replay)
    var ReplayName = prompt("Enter Replay Name")
    if (ReplayName != ""){
    var data = {
      Replay: Config.Replay,
    };
    data = JSON.stringify(data)
    //alert(data)
    data = ReplayFileEnc(data)
    //alert(data)
    download(data,ReplayName,".json")
    }
  }
  if (Config.Dark == true){
    ctx.fillStyle = 'white'
  }else{
    ctx.fillStyle = 'black'
  }
  /*setTimeout(function(){
    SetHeadToDefaultLoc(ctx,canvas);
  },5000);*/
}
var AntiSpamKeyMem;
function CheckKeyPressed(event){
  //ATDL(event.key);
  if (started == true){
  if (KeyPressMeM != event.key && AntiSpamKeyMem != event.key){
    if (event.key == "ArrowUp" && SnakeData.Direction != 3 || event.key == "w" && SnakeData.Direction != 3){
      ATDL("ArrowUp");
      SnakeData.Direction = 1;
    }else if (event.key == "ArrowRight" && SnakeData.Direction != 4 || event.key == "d" && SnakeData.Direction != 4){
      ATDL("ArrowRight");
      SnakeData.Direction = 2;
    }else if (event.key == "ArrowDown" && SnakeData.Direction != 1 || event.key == "s" && SnakeData.Direction != 1){
      ATDL("ArrowDown");
      SnakeData.Direction = 3;
    }else if (event.key == "ArrowLeft" && SnakeData.Direction != 2 || event.key == "a" && SnakeData.Direction != 2){
      ATDL("ArrowLeft");
      SnakeData.Direction = 4;
    }
    event.preventDefault()
    AntiSpamKeyMem = event.key
  }
}
}
function WinCond(){
  
}
function ConfigMenu(){
  if (started == false){
    if (document.getElementById('ConfigPopup').style.visibility == 'visible'){
      document.getElementById('ConfigPopup').style.visibility = 'hidden';
      document.getElementById('RecordBtn').style.visibility = 'hidden'
      document.getElementById('ReplayInput').style.visibility = 'hidden'
      document.getElementById('LoadDemo').style.visibility = 'hidden'
    }else{
      document.getElementById('ConfigPopup').style.visibility = 'visible';
      document.getElementById('FoodLengthMult').innerHTML = Config.FoodMult;
      if (!devMode){
        document.getElementById('RecordBtn').style.visibility = 'visible'
        document.getElementById('ReplayInput').style.visibility = 'visible'
        document.getElementById('LoadDemo').style.visibility = 'visible'
      }else{
    	document.getElementById('RecordBtn').style.visibility = 'hidden'
    	document.getElementById('ReplayInput').style.visibility = 'hidden'
    	document.getElementById('LoadDemo').style.visibility = 'hidden'
  	  }
    }
  }else{
    alert("You Cant Config While A Game Is In Progress...")
  }
}
function DarkModeBtn(){
    if (document.getElementById('DarkModeBtn').checked){
      Config.Dark = true;
  	}else{
      Config.Dark = false;
    }
    SetHeadToDefaultLoc();
  CheckIfCanDoHS()
}
function SpeedConfig(){
  if (document.getElementById('SpeedDropdown1').checked){
    Config.Speed = 200;
  }else if (document.getElementById('SpeedDropdown2').checked){
    Config.Speed = 150;
  }else if (document.getElementById('SpeedDropdown3').checked){
    Config.Speed = 100;
  }else if (document.getElementById('SpeedDropdown4').checked){
    Config.Speed = 50;
  }
  CheckIfCanDoHS();
}
function SetFLM(direction){
  if (direction == 0){
    Config.FoodMult--
  }else if (direction == 1){
    Config.FoodMult++
  }
  if (Config.FoodMult < 1){
    Config.FoodMult = 1;
  }else if (Config.FoodMult > 20){
    Config.FoodMult = 20;
  }
  document.getElementById('FoodLengthMult').innerHTML = Config.FoodMult;
  CheckIfCanDoHS();
}
function RecordBtn(){
  //alert(Config.Record)
  if (Config.Record){
    //alert("Not Recording");
    Config.Record = false;
    document.getElementById('RecordBtn').value = "Record";
    document.getElementById('RecordBtn').style.backgroundColor = "white"
  }else if (!Config.Record){
    //alert("Recording");
    Config.Record = true;
    document.getElementById('RecordBtn').value = "Recording";
    document.getElementById('RecordBtn').style.backgroundColor = "red"
    SnakeData.Length = 1
    Config.Replay = []
  }
}
function CheckIfCanDoHS(){
  //ATDL(Config.FoodMult==1&&Config.Speed<=150)
  if (Config.FoodMult==1/*&&Config.Speed<=150*/){
     document.getElementById('SettingsWarning').style.color = "white";
     document.getElementById('SettingsWarning').innerHTML = "";
    CanDoHS = true
  }else{
    document.getElementById('SettingsWarning').style.color = "red";
    document.getElementById('SettingsWarning').innerHTML = "Becuase of The Settings, Your HighScore Won't Be Affected"
    CanDoHS = false
  }
}
var demoforval=0;
function LoadDemo(){
  var FileText;
  //Get File
  var file = document.getElementById('ReplayInput').files[0];
  //alert(file);
  if (file) {
  //Creates Reader, to read file
  var reader = new FileReader();
  //Tells Reader To Read File
  reader.readAsText(file, "UTF-8");
  //On Error
  reader.onerror = function (evt) {
    alert("Error reading file");
    return;
  }
  //On Readable File Loaded
  reader.onload = function (evt) {
    FileText = evt.target.result;
    //alert(FileText)
    FileText = ReplayFileDec(FileText)
    //alert(FileText)
    var jsonData = JSON.parse(FileText);
    Config.Speed = jsonData.Replay[0];
    ATDL(Config.speed)
    var ForLength = jsonData.Replay.length-1;
    ForLength = ForLength/6;
    ATDL(ForLength);
    //ATDL(jsonData.Replay)
    SnakeData.Length = 1
    for (i=0;i<ForLength;i++){
      setTimeout(function(){
        var mult = demoforval*6+1
        SnakeData.Head[0] = jsonData.Replay[mult];
        mult = demoforval*6+2
        SnakeData.Head[1] = jsonData.Replay[mult];
        mult = demoforval*6+4
        SnakeData.Length = jsonData.Replay[mult];
        mult = demoforval*6+5
        SnakeData.Food[0] = jsonData.Replay[mult];
        mult = demoforval*6+6
        SnakeData.Food[1] = jsonData.Replay[mult];
        //ATDL(demoforval+", "+jsonData.Replay[demoforval*4+2]+", "+jsonData.Replay[demoforval*4+4]+", "+jsonData.Replay[demoforval*4+5])
        ATDL(demoforval+", "+SnakeData.Head[0]+", "+SnakeData.Head[1]+", "+SnakeData.Length+", "+SnakeData.Food[0]+", "+SnakeData.Food[1]+", "+jsonData.Replay[demoforval*6+3]);
        demoforval= demoforval+1
      },jsonData.Replay[i*6+3])
    }
    ConfigMenu()
    started = true;
    Demo = true;
    SnakeData.Direction = 0
    document.getElementById('startPopup').style.visibility = 'hidden';
    Play();
  }
}
}
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click()
}
function RecordInfo(){
  if (Config.Record){
      Config.Replay[Config.Replay.length] = SnakeData.Head[0];
      Config.Replay[Config.Replay.length] = SnakeData.Head[1];
      Config.Replay[Config.Replay.length] = ReplayTimer;
      Config.Replay[Config.Replay.length] = SnakeData.Length;
      Config.Replay[Config.Replay.length] = SnakeData.Food[0];
      Config.Replay[Config.Replay.length] = SnakeData.Food[1];
    }
}
function AdvancedOptions(){
  if (devMode){
    devMode = true
    document.getElementById('RecordBtn').style.visibility = 'hidden'
    document.getElementById('ReplayInput').style.visibility = 'hidden'
    document.getElementById('LoadDemo').style.visibility = 'hidden'
  }else{
    devMode = false
    document.getElementById('RecordBtn').style.visibility = 'visible'
    document.getElementById('ReplayInput').style.visibility = 'visible'
    document.getElementById('LoadDemo').style.visibility = 'visible'
  }
  /*ATDL(devMode)
  ATDL(document.getElementsByClassName('AdvancedOptions').style.height)*/
}

function Help(){
  alert("Not Finished Yet, \nIf Game Is Too Fast, Go To Settings");
}
var MSSGARC;
function ATDL(message){
  if (LogToConsole == true && message != MSSGARC){
    //DevLog = DevLog + message;
    //MSSGARC = message;
    //alert(message);
    /*if (console.re.log()){
      console.re.log(message);
    }*/
    var log = document.createElement("P"); /*innerHTML = DevLog*/
    log.innerHTML = message;
    document.getElementById('DevVisCon').appendChild(log);
    var elem = document.getElementById('DevVisCon');
    elem.scrollTop = elem.scrollHeight;
  }
}