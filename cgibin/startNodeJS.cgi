#!/bin/bash
#[NOM:startNodeJS.cgi][INFO:Ejecuta la sentencia node  apps/XYZ/server/appXYZ.js]

echo "Content-type: text/plain;charset=utf-8"
echo ""

read params
  id=$(echo $params |cut -d'&' -f1 | cut -d'=' -f2)
proy=$(echo $params |cut -d'&' -f2 | cut -d'=' -f2)
 app=$(echo $params |cut -d'&' -f3 | cut -d'=' -f2)

ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][fich:$proy]" >> trazas

cd /home/reto/RETO

nohup node "apps/$proy/server/$app" &

cat "apps/$proy/server/debug.log"
exit 0