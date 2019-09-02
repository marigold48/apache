
/*
create table notas
(id integer primary key autoincrement,
texto text);

create table blocs
(id integer primary key autoincrement,
bloc text,
tag text,
txt text
);


create table tasks
(id integer primary key autoincrement,
tipo text,
tag text,
txt text
);

create table textos
(id integer primary key autoincrement,
tipo text,
bloc text,
tag text,
etc text,
txt text
);
*/

import {Base64} from './utils/libBase64.js';

var vg0 = {
	rutaCGIs : '/cgi-bin/',
	qySQLite : 'k0GetQryLite.cgi',
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

function encripta(texto,frase){
	var nT = texto.length;
	var nF = frase.length;
	var result = '';
	 
	for (var i=0;i<nT;i++){
		var orChars = texto.charCodeAt(i) ^ frase.charCodeAt(i % nF);
		result += String.fromCharCode(orChars);
	}
	return result;
}

//------------------------------------------------------------------- Toggle Notas <--> Blocs
function toggleModo(modo){
	vg0.appModo.toggleModo(modo);
}

//------------------------------------------------------------------- Init
function initApps(){
	vg0.appEdit = new Vue({
		el: '#appEdit',
		data: { 
			visible: false,
			editON : false,
			cifra : false,
			frase : '',
			nota : {id:'',texto:''},
			task : {id:'',texto:''},
			letras : 0
			},
		methods : {
			borra : function(){borraNota(this.nota.id);},
			graba : function(){grabaNota(this.nota.id);},
			descifra : function(){descifraNota(this.nota.id);},
			oculta : function(){this.visible = false;},
			tecla : function(){this.letras = this.nota.texto.length;}
		}

	})

	vg0.appNotas = new Vue({
		el: '#appNotas',
		data: { 
			visible : true,
			blocs : [],
			notas : [],
			pagina : 0
			},
		methods : {
			edit : function(id){editNota(id)},
			sube : function(){
				if (this.pagina == 0) return;
				this.pagina--; getNotas();
			},
			baja : function(){this.pagina++; getNotas()},
			goBloc : function(bloc){getNotasBloc(bloc);}
		}

	})


	vg0.appBusca = new Vue({
		el: '#divBusca',
		data: { 
			patron : ''
			},
		methods : {
			buscar : function(id){
				if (vg0.appModo.modo == 'NOTAS') buscaNotas(this.patron);
				else if (vg0.appModo.modo == 'BLOCS') buscaNotasBloc(this.patron);
				else if (vg0.appModo.modo == 'TASKS') buscaNotasTask(this.patron);
			}
		}

	})

	if (r$('appModo')){
		vg0.appModo = new Vue({
			el: '#appModo',
			data: { 
				modo: 'NOTAS'
			},
			methods : {
				toggleModo : function(modo){
					vg0.appNotas.visible = false;
					vg0.appBlocs.visible = false;
					vg0.appTasks.visible = false;

					vg0.appNotasBloc.visible = false;
					vg0.appNotasTask.visible = false;

					this.modo = modo;
					if (modo == 'NOTAS'){
						r$('brand').innerHTML = 'Notas';
						vg0.appNotas.visible = true;
						getNotas();  // se pone aquí para que Ajax no se equivoque :-)
					}
					else if (modo == 'BLOCS'){
						r$('brand').innerHTML = 'Blocs';
						vg0.appBlocs.visible = true;
						vg0.appNotasBloc.visible = true;
						getBlocs();  // se pone aquí para que Ajax no se equivoque :-)

					}
					else if (modo == 'TASKS'){
						r$('brand').innerHTML = 'Tareas';
						vg0.appTasks.visible = true;
						vg0.appNotasTask.visible = true;
						getTasks();  // se pone aquí para que Ajax no se equivoque :-)
					}
				}
			}
		})
	}



}
function ecoQrySess(xhr){
	var filas = csv2filas(xhr.responseText);

	if (filas.length && filas[0].id == vg0.idSess) 	getNotas();
	else window.location = '/index.html';
}

function validaSesion(){
	var params = getParamsHTML()
	vg0.idSess = params.idSess;
	var id = 1234567;
	var bd = 'sesiones.sqlite';
	var stmt = "select * from sesiones where id='"+vg0.idSess+"';";
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoQrySess);

}

function initNotas(){
	validaSesion();
	initApps();
}

export {initNotas}