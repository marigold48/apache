/*
Triangulo Sierpinsky
		Declarar: A, B, y C como puntos
		Inicializar: A, B, y C
		Dibujar_Sierpinski( A, B, C, Número_Iteraciones )
		Terminar

A, B, y C son los vértices del triángulo original.

Para Dibujar_Sierpinski(), el algoritmo es:

Dibujar_Sierpinski( A, B, C, N )

		Si N = 0 entonces, // Triángulo Mínimo

				Dibujar_Triángulo_Relleno( A, B, C )
				Terminar

		Si no, entonces, // Dividir en 3 triángulos

				AB ← Mitad( A, B )
				BC ← Mitad( B, C )
				CA ← Mitad( C, A )
				Dibujar_Sierpinski( A, AB, CA, N-1 )
				Dibujar_Sierpinski( AB, B, BC, N-1 )
				Dibujar_Sierpinski( CA, BC, C, N-1 )
				Terminar

A, B, y C son los vértices del triángulo o subtriángulo.

N es el número de iteraciones.

Para Mitad(), el algoritmo es:

Real Mitad( P1, P2 )

		Resultado.x ← (P1.x + P2.x) / 2
		Resultado.y ← (P1.y + P2.y) / 2
		Terminar( Resultado )
*/

import {o2s} from './utils/comun.js';

//------------------------------------------------------------------- Triangulo de Sierpinsky
class Punto {
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

class Triang {
	constructor(p1,lado,color){
		this.pts = [];
		this.pts.push(p1);
		this.color = color;
		this.calcPts(p1,lado);
	}
	calcPts(p1,lado){
		var p2 = new Punto(p1.x+lado, p1.y);
		this.pts.push(p2);
		var p3 = new Punto(p1.x+Math.round(lado/2), p1.y - Math.round(lado*Math.sin(Math.PI/3)));
		this.pts.push(p3);
	}

	getPuntos(){
		return this.pts;
	}

	puntoMedio(p1,p2){
		var x = (p1.x+p2.x)/2;
		var y = (p1.y+p2.y)/2;
		var pm = new Punto(x,y);
		return pm;
	}

	split(){
		var lado = this.pts[1].x - this.pts[0].x;
		var Ts = [];
		var T1 = new Triang(this.pts[0],lado/2,this.color);
		Ts.push(T1);
		var pm = this.puntoMedio(this.pts[0],this.pts[1]);
		var T2 = new Triang(pm,lado/2,this.color);
		Ts.push(T2);
		var pm = this.puntoMedio(this.pts[0],this.pts[2]);
		var T3 = new Triang(pm,lado/2,this.color);
		Ts.push(T3);

		return Ts;
	}
}

class Sierpinsky {
	constructor(lado,cntxt,n){
		this.cntxt = cntxt;
		this.init(lado,n);
	}

	 pintaT(T,n){
	 	if (n < 0) return;

		var pts = T.getPuntos();
		var p1 = pts[0];
		var p2 = pts[1];
		var p3 = pts[2];

		this.cntxt.strokeStyle = T.color;
		this.cntxt.beginPath();
		this.cntxt.moveTo(p1.x+0.5,p1.y+0.5);
		this.cntxt.lineTo(p2.x+0.5,p2.y+0.5);
		this.cntxt.lineTo(p3.x+0.5,p3.y+0.5);
		this.cntxt.lineTo(p1.x+0.5,p1.y+0.5);
		this.cntxt.closePath();
		this.cntxt.stroke();

		var Ts = T.split();

		setTimeout(function(){this.pintaT(Ts[0],n-1);}.bind(this),1000);
		setTimeout(function(){this.pintaT(Ts[1],n-1);}.bind(this),1000);
		setTimeout(function(){this.pintaT(Ts[2],n-1);}.bind(this),1000);
	}

	init(lado,n){
		var p1 = new Punto(10,lado+10);
		var T = new Triang(p1,lado,'maroon');
		this.pintaT(T,n);
	}
}

export {Sierpinsky}

/*
function pintaTriang(cntxt,triang){
	 var x,y;
	 
	 var div = document.getElementById('texto');
	 div.innerHTML = txt.substr(0,frase++);
	 var A = triang.A;
	 var B = triang.B;
	 var C = triang.C;
	 var color = triang.color;
	 
	cntxt.strokeStyle = 'maroon';
	cntxt.fillStyle = color;
	cntxt.beginPath();
	 
	 x = Math.round(A.x)+0.5;
	 y = Math.round(A.y)+0.5;
	 cntxt.moveTo(x,y);
	 
	 x = Math.round(B.x)+0.5;
	 y = Math.round(B.y)+0.5;
	 cntxt.lineTo(x,y);

	 x = Math.round(C.x)+0.5;
	 y = Math.round(C.y)+0.5;
	 cntxt.lineTo(x,y);

	 x = Math.round(A.x)+0.5;
	 y = Math.round(A.y)+0.5;
	 cntxt.lineTo(x,y);

	cntxt.closePath();
	cntxt.stroke();
//	if (color) cntxt.fill();
	pintaColaTriangulos(cntxt);
}

function pintaColaTriangulos(cntxt){
	 if (!colaTriang.length){
			setTimeout(function(){textoFinal();},500);
			return;
			}
	 
	 var triang = colaTriang.pop();
	 if (triang.color == 'red') setTimeout(function(){pintaTriang(cntxt,triang);},60);
	 else setTimeout(function(){pintaTriang(cntxt,triang);},60);
}

function puntoMedio(A,B){
	 var M = new Object();
	 M.x = (A.x + B.x)/2;
	 M.y = (A.y + B.y)/2;
	 return M;
}

function generaSierpinsky(cntxt,A,B,C,N,color){
	 if (N < 0) return;
//	 alert(N);
	 var triang = new Object();
	 triang.A = A;
	 triang.B = B;
	 triang.C = C;
	 triang.color = color;
	 colaTriang.push(triang);
	
	 var AB = puntoMedio(A,B);
	 var BC = puntoMedio(B,C);
	 var CA = puntoMedio(A,C);

	 generaSierpinsky(cntxt, A, AB, CA, N-1,'green');
	 generaSierpinsky(cntxt, AB, B, BC, N-1,'blue');
	 generaSierpinsky(cntxt, CA, BC, C, N-1,'red');

}

function Sierpinsky (){
	 var x = 10;
	 var y = 600;
	 var l = 600;
	 var n = 5;
	 var canvas = document.createElement("canvas");
	 canvas.setAttribute("width", l+30);
	 canvas.setAttribute("height", l+30);
	var cntxt = canvas.getContext("2d");

	var divBase = document.getElementById('divBase');
	divBase.appendChild(canvas);
	 var A = new Object(); A.x = x; A.y = y;
	 var B = new Object(); B.x = x+l; B.y = y;
	 var C = new Object(); C.x = x+l/2; C.y = y - l*Math.sin(3.1416/3);
	 generaSierpinsky(cntxt,A,B,C,n);
	 pintaColaTriangulos(cntxt);
}

*/