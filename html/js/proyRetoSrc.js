
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

import utils from '/js/comun/utils.js'

class Nota {
	constructor(tipo,bloc){
		this.id = 0;
		this.tipo = tipo;
		this.bloc = bloc;
		this.tag = '';
		this.txt = '';
	}
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
	utils.vg0.appEdit = new Vue({
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
			cortar : function(){utils.vg0.appNotas.pegarON = true; this.visible = false;}
		}

	})

	utils.vg0.appNotas = new Vue({
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
				getNotas(utils.vg0.appModo.modo,this.tagBloc);
			},
			baja : function(){
				this.pagina++; 
				getNotas(utils.vg0.appModo.modo,this.tagBloc)},
			goBloc : function(bloc){
				this.pagina = 0; 
				getNotas(utils.vg0.appModo.modo,bloc);
			},
			nuevaNota : function (){nuevaNota(utils.vg0.appModo.modo);},
			pegar : function(){
				grabaNota();
			}
		}

	})


	utils.vg0.appBusca = new Vue({
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

	if (utils.r$('appModo')){
		utils.vg0.appModo = new Vue({
			el: '#appModo',
			data: { 
				modo: 'NOTA'
			},
			methods : {
				toggleModo : function(modo){
					utils.vg0.appNotas.pagina = 0;
					this.modo = modo;
					if (modo == 'NOTA'){
						utils.vg0.appNotas.visible = true;
						utils.r$('brand').innerHTML = 'Notas';
						getBlocs('NOTA');  // se pone aquí para que Ajax no se equivoque :-)
					}
					else if (modo == 'BLOC'){
						utils.vg0.appNotas.visible = true;
						utils.r$('brand').innerHTML = 'Blocs';
						getBlocs('BLOC');  // se pone aquí para que Ajax no se equivoque :-)

					}
					else if (modo == 'TASK'){
						utils.vg0.appNotas.visible = true;
						utils.r$('brand').innerHTML = 'Tareas';
						getBlocs('TASK');  // se pone aquí para que Ajax no se equivoque :-)
					}
					else if (modo == 'CODE'){
						utils.vg0.appNotas.visible = true;
						utils.r$('brand').innerHTML = 'Código';
						getBlocs('CODE');  // se pone aquí para que Ajax no se equivoque :-)
					}
				}
			}
		})
	}



}
//------------------------------------------------------------------- Validar Sesion
function ecoQrySess(xhr){
	var filas = utils.csv2filas(xhr.responseText);

	if (filas.length && filas[0].id == utils.vg0.idSess) 	getBlocs('NOTA',null);
	else window.location = '/index.html';
}

function validaSesion(){
	var params = utils.getParamsHTML()
	utils.vg0.idSess = params.idSess;
	var id = 1234567;
	var bd = 'sesiones.sqlite';
	var stmt = "select * from sesiones where id='"+utils.vg0.idSess+"';";
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoQrySess);

}


//------------------------------------------------------------------- Get Notas
function ecoQueryNotas(xhr){
	var filas = [];
	var lineas = xhr.responseText.split('\n');
	var caps = lineas.splice(0,1)[0];
	lineas.map(function(lin){
		if (lin.length && !lin.match('error:0')){
			var fila = utils.csv2hash(caps,lin);
			if (fila) filas.push(fila)
		}
	})
	utils.vg0.notas = filas;
	var notas = [];
	filas.map(function(fila){
		fila.txt = fila.txt.split('·~').join('<br>');
		fila.txt = fila.txt.split('·!').join('|');
		fila.txt = fila.txt.split('·[').join('<a href="');
		fila.txt = fila.txt.split('·:·').join('" target="_blank">');
		fila.txt = fila.txt.split(']·').join('</a>');
		fila.txt = fila.txt.split('·/').join('\'');
		notas.push(fila);
	})
	utils.vg0.appNotas.notas = notas;
	if (filas.length) utils.vg0.appNotas.tagBloc =filas[0].bloc;
}

function getNotas(tipo, bloc){

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
//	stmt += ")  order by id desc limit 20 offset "+(utils.vg0.appNotas.pagina*10)+";";
	stmt += ";";
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}

//------------------------------------------------------------------- Get Blocs
function ecoGetBlocs(xhr){
	var filas = [];
	var lineas = xhr.responseText.split('\n');
	var caps = lineas.splice(0,1)[0];
	lineas.map(function(lin){
		if (lin.length && !lin.match('error')){
			var fila = utils.csv2hash(caps,lin);
			if (fila) filas.push(fila)
		}
	})
	var blocs = [];
	filas.map(function(fila){
		blocs.push(fila);
	})
	utils.vg0.appNotas.blocs = blocs;
	utils.vg0.appNotas.notas = [];
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
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoGetBlocs);
}

function ecoNuevoBloc(xhr){
	console.log(xhr.responseText);
	getBlocs(utils.vg0.appModo.modo);
}

function nuevoBloc(){
	var tag = prompt ('Nombre?');
	if (!tag) return;
	tipo = utils.vg0.appModo.modo;
	var id = 1234567;
	if (tipo == 'CODE'){
		var bd = 'codigo.sqlite';
	}
	else {
		var bd = 'reto.sqlite';
	}
	var stmt = "insert into textos (tipo,bloc,tag,txt) values ('"+tipo+"','"+tag+"','Sin titulo','Nota inicial (editar)');";
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoNuevoBloc);
}


//=================================================================== Edit Notas

function ecoGraba(xhr){
	console.log('ecoGraba: '+xhr.responseText);
	getNotas(utils.vg0.appModo.modo,utils.vg0.appNotas.tagBloc);
	utils.vg0.appEdit.visible = false;
	return false;
}

function grabaNota(){
	var nota = utils.vg0.appEdit.nota;
	var tipo = utils.vg0.appModo.modo;

	var txt = '';
	txt = nota.txt.split('\n').join('·~');
	txt = txt.split('|').join('·!');
	txt = txt.split("\'").join('·/');
	if (utils.vg0.appEdit.cifra){
		var frase = utils.vg0.appEdit.frase;
		txt = Base64.encode(encripta(txt,frase));
	}
	var id = 12345670;
	if (tipo == 'CODE') var bd = 'codigo.sqlite';
	else var bd = 'reto.sqlite';

	if (utils.vg0.appEdit.editON && utils.vg0.appNotas.pegarON){
		var stmt = "update textos set tipo='"+tipo+"',bloc='"+utils.vg0.appNotas.tagBloc+"' where id="+nota.id+";";
		utils.vg0.appNotas.pegarON = false;
	}
	else if (utils.vg0.appEdit.editON){
		var stmt = "update textos set tag='"+nota.tag+"',txt='"+txt+"' where id="+nota.id+";";
	}
	else {
		var stmt = "insert into textos (tipo,bloc,tag,txt) values ('"+nota.tipo+"','"+nota.bloc+"','"+nota.tag+"','"+txt+"');";
	}
	console.log('bd: '+bd);
	console.log('Graba: '+stmt);
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoGraba);
}


function ecoBorra(xhr){
	console.log('ecoBorra: '+xhr.responseText);
	getNotas();
	utils.vg0.appEdit.visible = false;
	return false;
}

function borraNota(){
	var nota = utils.vg0.appEdit.nota;
	var id = 1234567;
	var tipo = utils.vg0.appModo.modo;
	if (tipo == 'CODE'){
		var bd = 'codigo.sqlite';
	}
	else {
		var bd = 'reto.sqlite';
	}
	var stmt = "delete from textos where id="+nota.id+";";
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoBorra);
}

function editNota(id){
	var n = utils.vg0.notas.length;
	for (var i=0;i<n;i++){
		var nota = utils.vg0.notas[i];
		if (nota.id == id){
			var txt = nota.txt.split('<br>').join('\n');
			txt = txt.split('<a href="').join('·[');
			txt = txt.split('" target="_blank">').join('·:·');
			txt = txt.split('</a>').join(']·');
			utils.vg0.appEdit.nota = {id:nota.id,tag:nota.tag,txt:txt}; // desacoplo de la nota en edicion
			utils.vg0.appEdit.letras = txt.length;
			utils.vg0.appEdit.visible = true;
			utils.vg0.appEdit.editON = true;
			break;
		}

	}
}

function nuevaNota(){
	var nota = new Nota();
	nota.tipo = utils.vg0.appModo.modo;
	nota.bloc = utils.vg0.appNotas.tagBloc;
	utils.vg0.appEdit.nota = nota;
	utils.vg0.appEdit.letras = '0';
	utils.vg0.appEdit.visible = true;
	utils.vg0.appEdit.editON = false;
}

function descifraNota(){
	var nota = utils.vg0.appEdit.nota;
	var frase = utils.vg0.appEdit.frase;
	var b64 = Base64.decode(nota.txt);
	var descifrado = encripta(b64,frase);
	var txt = descifrado.split('·~').join('\n');

	nota.txt = txt;
}

function buscaNotas(patron){
	if (patron.length == 0)	{getNotas(utils.vg0.appModo.modo,utils.vg0.appNotas.tagBloc);return false;}
	var id = 1234567;
	var bd = 'reto.sqlite';
	var stmt = "select * from textos where tipo='"+utils.vg0.appModo.modo+"' and  bloc='"+utils.vg0.appNotas.tagBloc+"' and upper(txt) like '%"+patron.toUpperCase()+"%' limit 50;";
	console.log(stmt);
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}

export default { validaSesion,initApps }