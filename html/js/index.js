import {r$} from './utils/comun.js';
import {Sierpinsky} from './sierpinsky.js';

var cntxt = r$('canvas').getContext("2d");
var sierpinsky = new Sierpinsky(600,cntxt,10);
