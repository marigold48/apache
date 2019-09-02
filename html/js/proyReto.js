
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

import {initNotas} from './proyRetoSrc.js';

initNotas();