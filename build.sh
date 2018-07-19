#!/bin/bash

set -x
set -e

cd `dirname $0`

rm -rf ./dist
NODE_ENV=production npm run webpack
npm run build-darwin

/usr/libexec/PlistBuddy -c 'Add :LSUIElement bool true' ./jack-jack-darwin-x64/jack-jack.app/Contents/Info.plist
