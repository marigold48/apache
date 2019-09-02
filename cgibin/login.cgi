#!/bin/bash
#[NOM:login.cgi][INFO:Concatena user.password, y redirecciona según esté o no el MD5]

echo "Content-type: text/html;charset=utf-8"
echo ""
echo ""

ahora=$(date +%Y%m%d-%H%M%S)


usr=$(echo $QUERY_STRING |cut -d'&' -f1 | cut -d'=' -f2)
pwd=$(echo $QUERY_STRING |cut -d'&' -f2 | cut -d'=' -f2)
tira=$(echo $usr.$pwd | md5sum)
n=$(cat retoClaus.txt | grep $tira | wc -l)

if [ "$n" = 1 ]
then
	echo "delete from sesiones;" > sesion.txt
	echo "insert into sesiones (id) values ('$ahora');" >> sesion.txt
	cat sesion.txt | sqlite3 sesiones.sqlite
	echo "<html>"
	echo "<head>"
	echo "</head>"
	echo "<body>"
	echo "<script>window.location='/proyRETO.html?idSess=$ahora';</script>"
	echo "</body>"
	echo "</html>"
else
	echo "<html>"
	echo "<head>"
	echo "</head>"
	echo "<body>"
	echo "<script>window.location='/index.html';</script>"
	echo "</body>"
	echo "</html>"
fi

exit 0