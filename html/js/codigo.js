
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



//------------------------------------------------------------------- Init
function initApps(){
	utils.vg0.appNotas = new Vue({
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
		fila.txt = fila.txt.split('\t').join('&nbsp; &nbsp; &nbsp;');
		fila.txt = fila.txt.split('·/').join('\'');
		notas.push(fila);
	})
	utils.vg0.appNotas.notas = notas;
	if (filas.length) utils.vg0.appNotas.tagBloc =filas[0].bloc;
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
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}


function buscaNotas(patron){
	if (patron.length == 0)	{getNotas('CODE',vg0.appNotas.tagBloc);return false;}
	var id = 1234567;
	var bd = 'codigo.sqlite';
	var stmt = "select * from textos where tipo='CODE' and  bloc='"+vg0.appNotas.tagBloc+"' and upper(txt) like '%"+patron.toUpperCase()+"%' limit 50;";
	console.log(stmt);
	var ruta = '/';
	utils.ajaxQuerySQLite (id,bd,stmt,ruta,ecoQueryNotas);

}

//------------------------------------------------------------------- Validar Sesion

function initNotas(){
	initApps();
	var params = utils.getParamsHTML();
	var tipo = params.tipo;
	var bloc = params.bloc;
	var tag  = params.tag;
	if (!tipo || !bloc || !tag) return;
	getNota(tipo,bloc,tag);
}

window.onload = initNotas;