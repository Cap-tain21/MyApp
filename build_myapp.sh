#!/data/data/com.termux/files/usr/bin/bash

# 1️⃣ Set paths
PROJECT=~/webappmaker
CORDOVA_PROJECT=$PROJECT/MyAppApp
ARTIFACT_ZIP=$PROJECT/github-pages.zip
DOWNLOADS=~/storage/downloads
KEYSTORE=$PROJECT/my-release-key.jks
KEY_ALIAS=my-key-alias

# 2️⃣ Extract artifact
echo "Extracting artifact..."
unzip -o $ARTIFACT_ZIP -d $PROJECT
tar -xf $PROJECT/artifact.tar -C $PROJECT

# 3️⃣ Copy website files into Cordova www/
echo "Copying website files into Cordova..."
cp $PROJECT/index.html $CORDOVA_PROJECT/www/
cp $PROJECT/style.css $CORDOVA_PROJECT/www/
cp $PROJECT/script.js $CORDOVA_PROJECT/www/
cp -r $PROJECT/assets $CORDOVA_PROJECT/www/

# 4️⃣ Fix Gradle wrapper to use Gradle 8.3
echo "Updating Gradle wrapper..."
WRAPPER=$CORDOVA_PROJECT/platforms/android/gradle/wrapper/gradle-wrapper.properties
if [ -f $WRAPPER ]; then
    sed -i 's/gradle-.*-all.zip/gradle-8.3-all.zip/' $WRAPPER
    rm -rf ~/.gradle/wrapper/dists/gradle-7.1.1-all 2>/dev/null
fi

# 5️⃣ Build unsigned APK and AAB
cd $CORDOVA_PROJECT
echo "Building unsigned APK..."
cordova build android --release
echo "Building AAB..."
cordova build android --release -- --packageType=bundle

# 6️⃣ Generate keystore if it doesn't exist
if [ ! -f $KEYSTORE ]; then
    echo "Generating keystore..."
    keytool -genkey -v -keystore $KEYSTORE -keyalg RSA -keysize 2048 -validity 10000 -alias $KEY_ALIAS -storepass 123456 -keypass 123456 -dname "CN=MyApp, OU=Dev, O=Me, L=City, ST=State, C=IN"
fi

# 7️⃣ Sign APK
APK_PATH=$CORDOVA_PROJECT/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
SIGNED_APK=$DOWNLOADS/MyApp-signed.apk
echo "Signing APK..."
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $KEYSTORE -storepass 123456 -keypass 123456 $APK_PATH $KEY_ALIAS

# 8️⃣ Align APK
echo "Aligning APK..."
zipalign -v 4 $APK_PATH $SIGNED_APK

# 9️⃣ Move AAB to Downloads
AAB_SRC=$CORDOVA_PROJECT/platforms/android/app/build/outputs/bundle/release/app-release.aab
AAB_DST=$DOWNLOADS/MyApp.aab
cp $AAB_SRC $AAB_DST

echo "✅ Build complete!"
echo "Signed APK: $SIGNED_APK"
echo "AAB: $AAB_DST"
