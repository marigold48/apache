import utils from '/js/comun/utils.js';
import {Sierpinsky} from '/js/sierpinsky.js';

var cntxt = utils.r$('canvas').getContext("2d");
var sierpinsky = new Sierpinsky(600,cntxt,10);
