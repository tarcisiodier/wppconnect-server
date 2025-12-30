docker-compose down
sleep 10  # Aguardar Chromium fechar
find ./wppconnect_userdata -name "Singleton*" -delete
docker-compose up -d --build
