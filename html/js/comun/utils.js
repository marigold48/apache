var vg0 = {
	rutaCGIs : '/cgi-bin/',
	qySQLite : 'k0GetQryLite.cgi',
}

function r$(id){return document.getElementById(id);}
function o2s(obj){return JSON.stringify(obj);}

//------------------------------------------------------------------ Comprobacion de null,undefined,0,'',false,NaN
function guay(expr){
   return (typeof expr != 'undefined' && expr)? true : false;
};

function goPag(url,sessId){
	window.location = url + '?sessId='+sessId;
}
//------------------------------------------------------------------- Identificadores Random
// Retorna un Num random de p+1 digitos, empezando por s = 1-9
// Nodos (6,1) : 1000000 - 1999999
// Sesiones (9,1) : 1000000000 - 1999999999
function getId(prec,serie){
	if (!prec) prec = 6;
	if (!serie) serie = 1;
	var base = 1;
	for (var i=0;i<prec;i++) base *= 10; // 10 ^ base
	return Math.floor(Math.random()*base + serie*base);
}

function getXHR(metodo,ruta,eco){
	var xhr = new XMLHttpRequest();

// comprobar que soporta CORS    
	if ("withCredentials" in xhr) {
//		console.log('withCredentials');
      xhr.withCredentials = true;
    } 
	else {console.log('SIN withCredentials');}

	xhr.open(metodo, ruta, true);//true:async / false : sync
//	xhr.setRequestHeader("Content-Type","application/json");
	xhr.setRequestHeader("Content-Type","text/plain");
	xhr.onreadystatechange = function() {
//		console.log('readyState: ' + xhr.readyState);
      if (xhr.readyState != 4) {  return; }
      else {
//        console.log('status: ' + xhr.status);
		if (xhr.status == 200 ){
          eco(xhr);
        }
      }
    }
    xhr.onerror = function() {
      console.log('There was an error!');
      };
  return xhr;
}

//------------------------------------------------------------------- AJAX POST
function retoAjaxPost(params,cgi,eco){
	var xhr = getXHR('POST',cgi,eco);
	xhr.send(params);
	}
//------------------------------------------------------------------- Ejecuta Query SQLite
function ajaxQuerySQLite (id,bd,stmt,ruta,eco){
try{
	var txtB64 = Base64.encode(stmt);
	var params = '';
	params += 'id='+id;
	params += '&bd='+bd;
	params += '&stmt='+txtB64;
	params += '&ruta='+ruta;
	var cgi = vg0.rutaCGIs + vg0.qySQLite;
	retoAjaxPost(params,cgi,eco);
	}catch(e){alert(e.message);}
}

//------------------------------------------------------------------- Parametros HTML

function getParamsHTML(){

	var campo;
	var laURL = document.URL;
	var strParams = laURL.substring(laURL.indexOf('?')+1,laURL.length);
	var trozos = strParams.split('&');
	var params = {};
	trozos.map(function(trozo){
		campo = trozo.split('=');
		params[campo[0]] = campo[1];
	});
	return params;
}


//------------------------------------------------------------------- CSV a Hash
// Recibe dos string, uno con las claves y otro con valores
// Ej. claves : cod|nom|mail
// Ej. valores : PEPE|Jose Maria|pepe.at.reto-labs.es
// --> Hash({cod:"PEPE",nom:"Jose Maria",mail:"pepe.at.reto-labs.es"})

function csv2hash (caps,pstr){
	var valor;
	var claves = caps.split('|');		
	var values = pstr.split('|');	
	if (claves.length != values.length){ alert('CLAVES_VALORES_MAL :'+pstr); return false}
	var hash ={};
	claves.map(function(clave,ix){
		valor = values[ix];
		hash[clave] = valor;
	});
	return hash;
}

function csv2filas(csv){
	var filas = [];

	var lins = csv.split('\n');
	var linErr = lins.splice(-2,1);
	if (linErr != '[error:0]') {console.log('Error BD !'); return filas }
	else if (lins.length < 2) return filas;

	var caps = (lins.splice(0,1)[0]).toLowerCase();

	lins.map(function(lin){
		var fila = csv2hash(caps,lin);
		if (fila) filas.push(fila);
	})
	
	return filas;
}


export default {
	vg0,
	r$,o2s,getParamsHTML,
	csv2hash,csv2filas,
	ajaxQuerySQLite
}