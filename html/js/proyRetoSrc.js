
/*
En reto.sqlite

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
			letras : 0,
			},
		methods : {
			borra : function(){borraNota(this.nota.id);},
			graba : function(){grabaNota(this.nota.id);},
			descifra : function(){descifraNota(this.nota.id);},
			oculta : function(){this.visible = false;},
			tecla : function(){this.letras = this.nota.txt.length;},
			cortar : function(){vg0.appNotas.pegarON = true; this.visible = false;}
		}

	})

	vg0.appNotas = new Vue({
		el: '#appNotas',
		data: { 
			tagBloc : '',
			visible : true,
			blocs : [],
			notas : [],
			pagina : 0,
			pegarON: false
			},
		methods : {
			edit : function(id){editNota(id)},
			sube : function(){
				if (this.pagina == 0) return;
				this.pagina--; 
				getNotas(vg0.appModo.modo,this.tagBloc);
			},
			baja : function(){
				this.pagina++; 
				getNotas(vg0.appModo.modo,this.tagBloc)},
			goBloc : function(bloc){
				this.pagina = 0; 
				getNotas(vg0.appModo.modo,bloc);
			},
			nuevaNota : function (){nuevaNota(vg0.appModo.modo);},
			pegar : function(){
				grabaNota();
			}
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

	if (r$('appModo')){
		vg0.appModo = new Vue({
			el: '#appModo',
			data: { 
				modo: 'NOTA'
			},
			methods : {
				toggleModo : function(modo){
					vg0.appNotas.pagina = 0;
					this.modo = modo;
					if (modo == 'NOTA'){
						vg0.appNotas.visible = true;
						r$('brand').innerHTML = 'Notas';
						getBlocs('NOTA');  // se pone aquí para que Ajax no se equivoque :-)
					}
					else if (modo == 'BLOC'){
						vg0.appNotas.visible = true;
						r$('brand').innerHTML = 'Blocs';
						getBlocs('BLOC');  // se pone aquí para que Ajax no se equivoque :-)

					}
					else if (modo == 'TASK'){
						vg0.appNotas.visible = true;
						r$('brand').innerHTML = 'Tareas';
						getBlocs('TASK');  // se pone aquí para que Ajax no se equivoque :-)
					}
					else if (modo == 'CODE'){
						vg0.appNotas.visible = true;
						r$('brand').innerHTML = 'Código';
						getBlocs('CODE');  // se pone aquí para que Ajax no se equivoque :-)
					}
				}
			}
		})
	}



}
//------------------------------------------------------------------- Validar Sesion
function ecoQrySess(xhr){
	var filas = csv2filas(xhr.responseText);

	if (filas.length && filas[0].id == vg0.idSess) 	getBlocs('NOTA',null);
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
		console.log(fila.tag);
		fila.txt = fila.txt.split('·~').join('<br>');
		fila.txt = fila.txt.split('·!').join('|');
		fila.txt = fila.txt.split('·[').join('<a href="');
		fila.txt = fila.txt.split('·:·').join('" target="_blank">');
		fila.txt = fila.txt.split(']·').join('</a>');
		fila.txt = fila.txt.split('·/').join('\'');
		notas.push(fila);
	})
	vg0.appNotas.notas = notas;
	if (filas.length) vg0.appNotas.tagBloc =filas[0].bloc;
}

function getNotas(tipo, bloc){
console.log(tipo+'::'+bloc);

	var id = 1234567;
	if (tipo== 'CODE'){
		var bd = 'codigo.sqlite';
	}
	else {
		var bd = 'reto.sqlite';
	}
//	var stmt = "select * from (select * from textos where tipo='"+tipo+"'";
	var stmt = "select * from textos where tipo='"+tipo+"'";
	stmt+=" and bloc = '"+bloc+"'";
//	stmt += ")  order by id desc limit 20 offset "+(vg0.appNotas.pagina*10)+";";
	stmt += ";";
	console.log(stmt);
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}

//------------------------------------------------------------------- Get Blocs
function ecoGetBlocs(xhr){
	var filas = [];
	var lineas = xhr.responseText.split('\n');
	var caps = lineas.splice(0,1)[0];
	lineas.map(function(lin){
		if (lin.length && !lin.match('error')){
			var fila = csv2hash(caps,lin);
			if (fila) filas.push(fila)
		}
	})
	var blocs = [];
	filas.map(function(fila){
		blocs.push(fila);
	})
	vg0.appNotas.blocs = blocs;
	vg0.appNotas.notas = [];
}


function getBlocs(tipo){
	var id = 1234567;
	if (tipo == 'CODE'){
		var bd = 'codigo.sqlite';
	}
	else {
		var bd = 'reto.sqlite';
	}
	var stmt = "select distinct bloc from textos where tipo='"+tipo+"' order by bloc;";
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoGetBlocs);
}

function ecoNuevoBloc(xhr){
	console.log(xhr.responseText);
	getBlocs(vg0.appModo.modo);
}

function nuevoBloc(){
	var tag = prompt ('Nombre?');
	if (!tag) return;
	tipo = vg0.appModo.modo;
	var id = 1234567;
	if (tipo == 'CODE'){
		var bd = 'codigo.sqlite';
	}
	else {
		var bd = 'reto.sqlite';
	}
	var stmt = "insert into textos (tipo,bloc,tag,txt) values ('"+tipo+"','"+tag+"','Sin titulo','Nota inicial (editar)');";
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoNuevoBloc);
}


//=================================================================== Edit Notas

function ecoGraba(xhr){
	console.log('ecoGraba: '+xhr.responseText);
	getNotas(vg0.appModo.modo,vg0.appNotas.tagBloc);
	vg0.appEdit.visible = false;
	return false;
}

function grabaNota(){
	var nota = vg0.appEdit.nota;
	var tipo = vg0.appModo.modo;

	var txt = '';
	txt = nota.txt.split('\n').join('·~');
	txt = txt.split('|').join('·!');
	txt = txt.split("\'").join('·/');
	if (vg0.appEdit.cifra){
		var frase = vg0.appEdit.frase;
		txt = Base64.encode(encripta(txt,frase));
	}
	var id = 12345670;
	if (tipo == 'CODE') var bd = 'codigo.sqlite';
	else var bd = 'reto.sqlite';

	if (vg0.appEdit.editON && vg0.appNotas.pegarON){
		var stmt = "update textos set tipo='"+tipo+"',bloc='"+vg0.appNotas.tagBloc+"' where id="+nota.id+";";
		vg0.appNotas.pegarON = false;
	}
	else if (vg0.appEdit.editON){
		var stmt = "update textos set tag='"+nota.tag+"',txt='"+txt+"' where id="+nota.id+";";
	}
	else {
		var stmt = "insert into textos (tipo,bloc,tag,txt) values ('"+nota.tipo+"','"+nota.bloc+"','"+nota.tag+"','"+txt+"');";
	}
	console.log('bd: '+bd);
	console.log('Graba: '+stmt);
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoGraba);
}


function ecoBorra(xhr){
	console.log('ecoBorra: '+xhr.responseText);
	getNotas();
	vg0.appEdit.visible = false;
	return false;
}

function borraNota(){
	var nota = vg0.appEdit.nota;
	var id = 1234567;
	var tipo = vg0.appModo.modo;
	if (tipo == 'CODE'){
		var bd = 'codigo.sqlite';
	}
	else {
		var bd = 'reto.sqlite';
	}
	var stmt = "delete from textos where id="+nota.id+";";
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoBorra);
}

function editNota(id){
	var n = vg0.notas.length;
	for (var i=0;i<n;i++){
		var nota = vg0.notas[i];
		if (nota.id == id){
			var txt = nota.txt.split('<br>').join('\n');
			txt = txt.split('<a href="').join('·[');
			txt = txt.split('" target="_blank">').join('·:·');
			txt = txt.split('</a>').join(']·');
			vg0.appEdit.nota = {id:nota.id,tag:nota.tag,txt:txt}; // desacoplo de la nota en edicion
			vg0.appEdit.letras = txt.length;
			vg0.appEdit.visible = true;
			vg0.appEdit.editON = true;
			break;
		}

	}
}

function nuevaNota(){
	var nota = new Nota();
	nota.tipo = vg0.appModo.modo;
	nota.bloc = vg0.appNotas.tagBloc;
	vg0.appEdit.nota = nota;
	vg0.appEdit.letras = '0';
	vg0.appEdit.visible = true;
	vg0.appEdit.editON = false;
}

function descifraNota(){
	var nota = vg0.appEdit.nota;
	var frase = vg0.appEdit.frase;
	var b64 = Base64.decode(nota.txt);
	var descifrado = encripta(b64,frase);
	var txt = descifrado.split('·~').join('\n');

	nota.txt = txt;
}

function buscaNotas(patron){
	if (patron.length == 0)	{getNotas(vg0.appModo.modo,vg0.appNotas.tagBloc);return false;}
	var id = 1234567;
	var bd = 'reto.sqlite';
	var stmt = "select * from textos where tipo='"+vg0.appModo.modo+"' and  bloc='"+vg0.appNotas.tagBloc+"' and upper(txt) like '%"+patron.toUpperCase()+"%' limit 50;";
	console.log(stmt);
	var ruta = '/';
	ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}

export { initNotas }