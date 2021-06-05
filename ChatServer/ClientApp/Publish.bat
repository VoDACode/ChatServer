call npm install &&^
call npm run build -- --prod &&^
call xcopy /I /E /Y .\dist\WebChat S:\WebPublish\Chat\WebClient
