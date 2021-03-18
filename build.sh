#!/bin/bash

ask()
{
  declare -g $1="$2"
  if [ -z "${!1}" ]; then
    echo "$3"
    read $1
  fi
}

ask TYPE "$1" "Executable type to build (linux,windows,mac,all):"

if [ $TYPE == 'linux' ]; then
    echo 'Building for Linux'
     pkg captive-portal-backend/package.json --target node14-linux-x64 --output captive-portal-backend-linux
elif [ $TYPE == 'windows' ]; then
    echo 'Building for Windows'
     pkg captive-portal-backend/package.json --target node14-windows-x64 --output captive-portal-backend-windows.exe
elif [ $TYPE == 'mac' ]; then
    echo 'Building for Mac'
     pkg captive-portal-backend/package.json --target node14-mac-x64 --output captive-portal-backend-mac
elif [ $TYPE == 'all' ];then
    echo 'Building for all supported platforms'
    pkg captive-portal-backend/package.json --target node14-linux-x64 --output captive-portal-backend-linux
    pkg captive-portal-backend/package.json --target node14-windows-x64 --output captive-portal-backend-windows.exe
    pkg captive-portal-backend/package.json --target node14-mac-x64 --output captive-portal-backend-mac
else
    echo "No valid type found. Valid types are 'linux', 'windows', 'mac' or 'all'"
fi