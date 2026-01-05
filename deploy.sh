docker-compose -f docker-compose.dev.yml down
sleep 10  # Aguardar Chromium fechar
find ./wppconnect_userdata -name "Singleton*" -delete
docker-compose -f docker-compose.dev.yml up -d --build
