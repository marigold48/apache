
/*
En codigo.sqlite
create table textos
(id integer primary key autoincrement,
tipo text,
bloc text,
tag text,
etc text,
txt text
);
*/
vg0 = {
	rutaCGIs : '/cgi-bin/',
	qySQLite : 'k0GetQryLite.cgi',
}
class Nota {
	constructor(tipo,bloc){
		this.id = 0;
		this.tipo = tipo;
		this.bloc = bloc;
		this.tag = '';
		this.txt = '';
	}
}


//------------------------------------------------------------------ Comprobacion de null,undefined,0,'',false,NaN
function guay(expr){
   return (typeof expr != 'undefined' && expr)? true : false;
};

function r$(id){return document.getElementById(id);}

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

function o2s(obj){
	return JSON.stringify(obj);
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


//------------------------------------------------------------------- Init
function initApps(){
	vg0.appNotas = new Vue({
		el: '#appNotas',
		data: { 
			tagBloc : '',
			visible : true,
			blocs : [],
			notas : ['Nada'],
			pagina : 0,
			pegarON: false
			},
		methods : {
			sube : function(){
				if (this.pagina == 0) return;
				this.pagina--; 
				getNotas('CODE',this.tagBloc);
			},
			baja : function(){
				this.pagina++; 
				getNotas('CODE',this.tagBloc)},
			goBloc : function(bloc){
				this.pagina = 0; 
				getNotas('CODE',bloc);
			},
		}

	})


	vg0.appBusca = new Vue({
		el: '#divBusca',
		data: { 
			patron : ''
			},
		methods : {
			buscar : function(id){
				buscaNotas(this.patron);
			}
		}

	})
}

//------------------------------------------------------------------- Get Notas
function ecoQueryNotas(xhr){
	var filas = [];
	var lineas = xhr.responseText.split('\n');
	var caps = lineas.splice(0,1)[0];
	lineas.map(function(lin){
		if (lin.length && !lin.match('error:0')){
			var fila = csv2hash(caps,lin);
			if (fila) filas.push(fila)
		}
	})
	vg0.notas = filas;
	var notas = [];
	filas.map(function(fila){
		fila.txt = fila.txt.split('·~').join('<br>');
		fila.txt = fila.txt.split('\t').join('&nbsp; &nbsp; &nbsp;');
		fila.txt = fila.txt.split('·/').join('\'');
		notas.push(fila);
	})
	vg0.appNotas.notas = notas;
	if (filas.length) vg0.appNotas.tagBloc =filas[0].bloc;
}

function getNota(tipo, bloc,tag){
	console.log(tipo+'::'+bloc+'::'+tag);

	var id = 1234567;
	var bd = 'codigo.sqlite';
	var stmt = "select * from textos where tipo='CODE'";
	stmt+=" and bloc = '"+bloc+"'";
	stmt += " and tag='"+tag+"';";
	console.log(stmt);
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}


function buscaNotas(patron){
	if (patron.length == 0)	{getNotas('CODE',vg0.appNotas.tagBloc);return false;}
	var id = 1234567;
	var bd = 'codigo.sqlite';
	var stmt = "select * from textos where tipo='CODE' and  bloc='"+vg0.appNotas.tagBloc+"' and upper(txt) like '%"+patron.toUpperCase()+"%' limit 50;";
	console.log(stmt);
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}

//------------------------------------------------------------------- Validar Sesion

function initNotas(){
	initApps();
	var params = getParamsHTML();
	var tipo = params.tipo;
	var bloc = params.bloc;
	var tag  = params.tag;
	if (!tipo || !bloc || !tag) return;
	getNota(tipo,bloc,tag);
}
