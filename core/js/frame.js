
var schema = {
  stores:[{
    name:"lifepaperDB",
    keyPath:"id",
    autoIncrement: true,
    indexes: [
      {name: "name"},
    {name:"location"},
    {name:"type"}
    ]
  }]
};

//Get Paper Type
function getPageType(){
  name = document.getElementById("listType").innerText;
  return name;
}
function pushMsg(txt){
  span = document.getElementById("msgAlert");
  span.innerText = txt;
}

/**
 * Create and initialize the database. Depending on platform, this will
 * create IndexedDB or WebSql or even localStorage storage mechanism.
 * @type {ydn.db.Storage}
 */
//MAIN LOCAL DATABASE
var db = new ydn.db.Storage('LifePaper_db', schema);

//DELETE ONE ITEM
var deleteItem = function (id) {
  db.remove('lifepaperDB', id).fail(function(e) {
    console.error(e);
  });

  getAllLPItems();
};

//GET ALL ITEMS FROM DB OF PAGETYPE
var getAllLPItems = function () {
  var lItems = document.getElementById("lifeItems");
  lItems.innerHTML = "";

  var df = db.values('lifepaperDB');

  df.done(function (items) {
    var n = items.length;
    for (var i = 0; i < n; i++) {
      //Checks to see if item type is same as page type
      if (items[i].type == getPageType()){
        renderItem(items[i],i);
      }
    }
  });

  df.fail(function (e) {
    console.error(e);
  })
};

//IMPORTS ALL ITEMS FROM TXT BACKUP AND ADDS THEM TO LOCAL DB
function rebuildDB(){
  // db.clear();
  var name = getPageType();
  var ul = document.getElementById("lifeItems");
  var lis = ul.getElementsByTagName("li");
  for (var i = 0; i <= lis.length; ++i){
    var getObj = lis[i].getElementsByTagName("span")[0].innerText;
    var getLoc = lis[i].getElementsByTagName("span")[1].innerText;
    var getTyp = lis[i].getElementsByTagName("span")[2].innerText;
    if (getTyp == name){
      //If item type does not match it does not get added to the local DB
      db.put('lifepaperDB',{'name':getObj,'location':getLoc,'type':getTyp});
      pushMsg("");
    }
    else{
      pushMsg("Imported list does not match this page's category!");
      ul.innerHTML = "";
    }
  }
}

//RENDER AND ITEM TO PAGE AND SAVE TO LOCAL DB
var renderItem = function (row,i) {
  var listItems = document.getElementById("lifeItems");
  var li = document.createElement("li");
  li.id = "item";
  var divObj = document.createElement("span");
  divObj.id = "divObj";
  var divLoc = document.createElement("span");
  divLoc.id = "divLoc";
  var divTyp = document.createElement("span");
  divTyp.id = "divTyp";
  var a = document.createElement("a");
  a.id = "link";
  a.textContent = "Delete";
  var obName = document.createTextNode(row.name);
  var obLocation = document.createTextNode(row.location);
  var obType = document.createTextNode(row.type);
  a.addEventListener("click", function () {
    deleteItem(row.id);
  });
  divObj.appendChild(obName);
  divLoc.appendChild(obLocation);
  divTyp.appendChild(obType);
  li.appendChild(divObj);
  li.appendChild(divLoc);
  li.appendChild(divTyp);
  li.appendChild(a);
  listItems.appendChild(li);
};
//ADD ITEM TO LIST
var addItem = function () {
  var addname = document.getElementById("name");
  var addlocation = document.getElementById("location");
  var addtype = getPageType();
  db.put('lifepaperDB', {'name':addname.value,'location':addlocation.value,'type':addtype});

  addname.value = "";
  addlocation.value = "";

  getAllLPItems();
};

/*********** SAVE & LOAD LifeFile *********************/
function saveTextAsFile()
{
    var textToSave = document.getElementById("lifeItems").innerHTML;

    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    name = getPageType();
    var fileNameToSaveAs = "LifePaper_" + name;

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}

function loadFileAsText()
{
    var fileToLoad = document.getElementById("fileToLoad").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        document.getElementById("lifeItems").innerHTML = textFromFileLoaded;
        rebuildDB();
       
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}
/*********** SAVE ******/

///Function to enable individual item deleting after DOM has imported a data.
function clickDelete(){
  document.body.addEventListener( 'click', function (event) {
    if( event.srcElement.id == 'link' ) {
      event.srcElement.parentNode.remove(this);
    };
  } );
}
/// MAIN
function init() {
  getAllLPItems();
  clickDelete();
}

db.onReady(function() {
  init();
});





