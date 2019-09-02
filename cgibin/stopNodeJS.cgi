#!/bin/bash
#[NOM:stopNodeJS.cgi][INFO:Ejecuta el comando kill -9 pid-del-proc]

echo "Content-type: text/plain;charset=utf-8"
echo ""

read params
  id=$(echo $params |cut -d'&' -f1 | cut -d'=' -f2)
pid=$(echo $params |cut -d'&' -f2 | cut -d'=' -f2)

ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][fich:NdN]" >> trazas

kill -9 $pid

exit 0