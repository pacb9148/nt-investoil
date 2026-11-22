@echo off
echo Iniciando servidor web offline en http://localhost:8080
start "" http://localhost:8080
python -m http.server 8080
