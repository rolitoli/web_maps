//variables globales
var map1;
var map2;
var marca1;
var bounds;
var coordenadas;
var buscador;
var destino;
var search;
var searchControl;
var imageSearch;
var directionsService;
//constructor del objeto para manejo del destino
function obj_destino(lugar){
  this.destino= lugar;
  this.lat;
  this.lng;
  this.fechaInicio;
  this.fechaFin;
  this.places=[];
}

var obj_json;

google.load('search', '1');

//funcion que crea el mapa de inicio
function initialize() {
	coordenadas= new google.maps.LatLng(9.932904, -84.056187);
	var mapOpct = {
    	center:coordenadas,
    	zoom:13,
    	mapTypeId:google.maps.MapTypeId.ROAD
  	};
  	map1=new google.maps.Map(document.getElementById("mapa"), mapOpct);
  	
  	//Marcador del mapa principal
  	marca1= new google.maps.Marker({ 
  		position: coordenadas,
  		title: "Hi",
  		draggable: false,
  		icon: 'imag/Map-Marker-Flag.png'
  	});
  	marca1.setMap(map1);
    //espacio de busqueda
    buscador= new google.maps.places.SearchBox(document.getElementById("nueva_busqueda"));
    bounds= new google.maps.LatLngBounds();
    google.maps.event.addListener(buscador, 'places_changed', function(){
      var places= buscador.getPlaces();
      bounds.extend(places[0].geometry.location);
      marca1.setPosition(places[0].geometry.location);
      destino= places[0];
      map1.fitBounds(bounds);
      map1.setZoom(15);
    });
}

//Funcion que crea un segundo mapa para la visualizacion de las rutas
function rutas() {
  document.getElementById('start').value= obj_json.destino;
  // Instantiate a directions service.
  var directionsService = new google.maps.DirectionsService;

  // Create a map and center it on Manhattan.
  map2 = new google.maps.Map(document.getElementById('mapa_ruta'), {
    zoom: 15,
    center: {lat: obj_json.lat, lng: obj_json.lng}
  });

  // Create a renderer for directions and bind it to the map.
  var directionsDisplay = new google.maps.DirectionsRenderer({map: map2});

  // Instantiate an info window to hold step text.
  var stepDisplay = new google.maps.InfoWindow;

  // Display the route between the initial start and end selections.
  calculateAndDisplayRoute(
      directionsDisplay, directionsService, map2);
  // Listen to change events from the start and end lists.
  var calcular = function() {
    calculateAndDisplayRoute(
        directionsDisplay, directionsService, map2);
  };
  document.getElementById('btn_cal').addEventListener('click', calcular);
}

//metodos para el json
var json = function() {
  var lista= obj_json.places;
  var jsonLista = { "lista": []};
  for (var i = 0; i < lista.length; i++) {
    jsonLista.lista.push({destino: lista[i][0],origen: lista[i][1], distancia: lista[i][2], duracion: lista[i][3]});
  }
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonLista));
  var a = document.createElement('a');
  a.href = 'data:' + data;
  a.download = 'data.json';
  a.innerHTML = 'download as a JSON file';
  var container = document.getElementById('json');
  container.appendChild(a);
}

//funcion que calcuala y despliega en el mapa la ruta entre dos puntos
function calculateAndDisplayRoute(directionsDisplay, directionsService, map2) {
  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: google.maps.TravelMode.WALKING
  }, function(response, status) {
    // Route the directions and pass the response to a function to create
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      computeTimeDistance(response);

    } else {
      console.log('Directions request failed due to ' + status);
    }
  });
}

//funcion que muestra la informacion de la ruta
function computeTimeDistance(result) {
  var total = 0;
  var time= 0;
  var from=0;
  var to=0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
    time +=myroute.legs[i].duration.text;
    from =myroute.legs[i].start_address;
    to =myroute.legs[i].end_address;


  }
  time = time.replace('hours','H');
  time = time.replace('mins','M');
  total = total / 1000.

  var infoRutaArray= [from, to, total, time];
  obj_json.places.push(infoRutaArray);
  document.getElementById('r_time').innerHTML = time ;
  document.getElementById('r_distance').innerHTML =Math.round( total)+"KM" ;
}


//funcion para la carga de las imagenes del destino

function imgsearchComplete() {
// Check that we got results
  if (imageSearch.results && imageSearch.results.length > 0) {
  // Loop through our results, printing them to the page.
    var results = imageSearch.results;
    for (var i = 0; i < results.length; i++) {
    // For each result write it's title and image to the screen
      var result = results[i];
      var imgContainer = document.createElement('div');
      var title = document.createElement('div');
      title.innerHTML = result.titleNoFormatting;
      var newImg = document.createElement('img');
      // There is also a result.url property which has the escaped version
      newImg.src= result.tbUrl;
      imgContainer.appendChild(newImg);
      document.getElementById("res_img").appendChild(imgContainer);
    } 
  }
}

//funcion para la buscar de las imagenes del destino
function mostrarImg() {
  // Create an Image Search instance.
  imageSearch = new google.search.ImageSearch();
  imageSearch.setSearchCompleteCallback(this, imgsearchComplete, null);
  var str, pos;
  pos= obj_json.destino.search(",");
  str= obj_json.destino.slice(0, pos);        
  imageSearch.execute(str);
}

//funcion para la carga resultado de la buaqueda de lugares cercanos
function mostrarRelacionados() {
  searchControl = new google.search.SearchControl();
  var options = new google.search.SearcherOptions();
  options.setExpandMode(google.search.SearchControl.EXPAND_MODE_CLOSED);
  searchControl.addSearcher(new google.search.WebSearch(), options);
  searchControl.setResultSetSize(4);
  //searchControl.setSearchCompleteCallback(this, searchComplete, null);
  var drawOptions = new google.search.DrawOptions();
  drawOptions.setDrawMode(google.search.SearchControl.DRAW_MODE_TABBED);
  searchControl.draw(document.getElementById("res_relacionados"), drawOptions);
  var str, pos;
  pos= obj_json.destino.search(",");
  str= obj_json.destino.slice(0, pos);
  searchControl.execute("'sitios turísticos cercanos o relacionados a'"+str);
}

//funcion que llama a las demas funcionalidades de la pag 
//con los datos del dest seleccionado 
//esta se ejecuta ya con un objeto destino creado
function mostrar() {
  mostrarImg();
  mostrarRelacionados();
  rutas();
}


//funcion asociada al boton de iniciar 
//que permite a la pagina cargar toda la informacion de un lugar
function iniciar(){
  var div = document.getElementById('res_img');
  while(div.firstChild){
    div.removeChild(div.firstChild);
  }
  var seleccion= document.getElementById("nueva_busqueda").value;
  var inicio= document.getElementById("inicio").value;
  var fin= document.getElementById("fin").value;
  if((inicio!= "") && (fin!= "")){
    obj_json= new obj_destino(seleccion);
    obj_json.lat= marca1.getPosition().lat();
    obj_json.lng= marca1.getPosition().lng();
    obj_json.fechaInicio= inicio;
    obj_json.fechaFin= fin;
    google.load("search", "1");
    google.setOnLoadCallback(mostrar(obj_json));
    }
  else{
    alert("Debe inhresar todos los valores solicitados");
  }
}