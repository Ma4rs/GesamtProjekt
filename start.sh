#!/bin/bash
npm i
npx live-server --port=5500 &
cd ./Webservice
dotnet add package BCrypt.Net-Next
dotnet run