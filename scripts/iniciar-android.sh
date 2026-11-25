#!/bin/zsh
set -e
export JAVA_HOME="/Users/antoniojoseojeda/Library/Java/JavaVirtualMachines/jdk-21.0.13+9/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
cd "${0:A:h}/../frontend"
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
