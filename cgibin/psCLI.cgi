#!/bin/bash
#[NOM:psCLI.cgi][INFO:Ejecuta la sentencia ps -ef | grep node]

echo "Content-type: text/plain;charset=utf-8"
echo ""

read params
id=$(echo params |cut -d'&' -f1 | cut -d'=' -f2)

ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][fich:NdN]" >> trazas

ps -ef | grep node

exit 0