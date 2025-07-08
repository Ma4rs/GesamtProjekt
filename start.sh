#!/bin/bash
npm i
npx live-server --port=5500 &
cd ./Webservice
dotnet run