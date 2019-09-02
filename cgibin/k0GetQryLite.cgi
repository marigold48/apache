#!/bin/bash
#[NOM:t2GetQueryLite.cgi][INFO:Ejecuta la sentencia SQL en SQLite3]

echo "Content-type: text/plain;charset=utf-8"
echo ""

read params

  id=$(echo $params |cut -d'&' -f1 | cut -d'=' -f2)
  bd=$(echo $params |cut -d'&' -f2 | cut -d'=' -f2)
stmt=$(echo $params |cut -d'&' -f3 | cut -d'=' -f2)
ruta=$(echo $params |cut -d'&' -f4 | cut -d'=' -f2)

ahora=$(date +%Y%m%d-%H%M%S)
echo "[id0:$id][hora:$ahora][cgi:$0][fich:$bd]" >> trazas


echo ".headers ON" > "stmt_$id.sql"
echo $stmt > "aux1_$id.txt"
. base64.sh -a decode -f "aux1_$id.txt" >> "stmt_$id.sql"

cat "stmt_$id.sql" | sqlite3 $bd

echo "[error:$?]"

#rm -f temp/"aux1_$id.txt"
#rm -f temp/"stmt_$id.sql"

