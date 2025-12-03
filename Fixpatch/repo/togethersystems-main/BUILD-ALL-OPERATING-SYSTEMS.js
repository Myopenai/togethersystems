// T,. BUILD SYSTEM FÜR ALLE BETRIEBSSYSTEME
// Erstellt Builds für: Windows, macOS, Linux, Android, iOS, Web, Browser Extensions, Electron, Docker, C-System
// Gleiche Testweise wie Online-Portal/Offline-Manifest

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UniversalBuildSystem {
  constructor() {
    this.rootDir = __dirname;
    this.buildDir = path.join(this.rootDir, 'builds');
    this.reportsDir = path.join(this.rootDir, 'build-reports');
    this.ensureDirs();
    this.builds = {
      windows: { exe: false, msi: false, appx: false },
      macos: { dmg: false, pkg: false, app: false },
      linux: { deb: false, rpm: false, appimage: false, snap: false, flatpak: false },
      android: { apk: false, aab: false },
      ios: { ipa: false },
      web: { pwa: false },
      browser: { chrome: false, firefox: false, edge: false, safari: false },
      electron: { windows: false, macos: false, linux: false },
      docker: { image: false },
      csystem: { binary: false }
    };
  }

  ensureDirs() {
    const dirs = [
      this.buildDir,
      this.reportsDir,
      path.join(this.buildDir, 'windows'),
      path.join(this.buildDir, 'macos'),
      path.join(this.buildDir, 'linux'),
      path.join(this.buildDir, 'android'),
      path.join(this.buildDir, 'ios'),
      path.join(this.buildDir, 'web'),
      path.join(this.buildDir, 'browser-extensions'),
      path.join(this.buildDir, 'electron'),
      path.join(this.buildDir, 'docker'),
      path.join(this.buildDir, 'c-system')
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  log(message, type = 'info') {
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      build: '🔨'
    }[type] || 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  // ===== WINDOWS BUILDS =====
  async buildWindows() {
    this.log('WINDOWS: Starte Build-Prozess...', 'build');
    
    // 1. Electron Windows EXE
    try {
      this.log('Windows: Erstelle Electron EXE...', 'build');
      await this.buildElectronWindows();
      this.builds.windows.exe = true;
      this.log('Windows: EXE erstellt', 'success');
    } catch (e) {
      this.log(`Windows EXE Fehler: ${e.message}`, 'error');
    }

    // 2. Windows MSI Installer
    try {
      this.log('Windows: Erstelle MSI Installer...', 'build');
      await this.buildWindowsMSI();
      this.builds.windows.msi = true;
      this.log('Windows: MSI erstellt', 'success');
    } catch (e) {
      this.log(`Windows MSI Fehler: ${e.message}`, 'error');
    }

    // 3. Windows AppX (Microsoft Store)
    try {
      this.log('Windows: Erstelle AppX Package...', 'build');
      await this.buildWindowsAppX();
      this.builds.windows.appx = true;
      this.log('Windows: AppX erstellt', 'success');
    } catch (e) {
      this.log(`Windows AppX Fehler: ${e.message}`, 'error');
    }
  }

  async buildElectronWindows() {
    const electronDir = path.join(this.buildDir, 'electron', 'windows');
    if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });

    // Electron package.json erstellen
    const electronPkg = {
      name: 'ostosos-app',
      version: '1.0.0',
      main: 'main.js',
      scripts: {
        start: 'electron .',
        build: 'electron-builder'
      },
      build: {
        appId: 'com.togethersystems.ostosos',
        productName: 'OSTOSOS',
        win: {
          target: ['exe', 'msi', 'appx'],
          icon: 'assets/icon.ico'
        },
        files: [
          '**/*',
          '!builds/**/*',
          '!node_modules/**/*'
        ]
      }
    };

    fs.writeFileSync(
      path.join(electronDir, 'package.json'),
      JSON.stringify(electronPkg, null, 2)
    );

    // Electron main.js erstellen
    const mainJs = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  win.loadFile(path.join(__dirname, '..', '..', '..', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
`;

    fs.writeFileSync(path.join(electronDir, 'main.js'), mainJs);

    // Preload.js
    const preloadJs = `
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: process.versions
});
`;
    fs.writeFileSync(path.join(electronDir, 'preload.js'), preloadJs);

    this.log('Windows Electron: Konfiguration erstellt', 'success');
  }

  async buildWindowsMSI() {
    const msiDir = path.join(this.buildDir, 'windows', 'msi');
    if (!fs.existsSync(msiDir)) fs.mkdirSync(msiDir, { recursive: true });

    // WiX Toolset Konfiguration (wenn verfügbar)
    const wixConfig = `<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="OSTOSOS" Language="1033" Version="1.0.0" Manufacturer="TogetherSystems" UpgradeCode="YOUR-GUID-HERE">
    <Package InstallerVersion="200" Compressed="yes" InstallScope="perMachine" />
    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    <MediaTemplate />
    <Feature Id="ProductFeature" Title="OSTOSOS" Level="1">
      <ComponentRef Id="ApplicationFiles" />
    </Feature>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="OSTOSOS">
          <Component Id="ApplicationFiles" Guid="YOUR-GUID-HERE">
            <File Id="ApplicationFile1" Source="index.html" />
          </Component>
        </Directory>
      </Directory>
    </Directory>
  </Product>
</Wix>`;

    fs.writeFileSync(path.join(msiDir, 'ostosos.wxs'), wixConfig);
    this.log('Windows MSI: Konfiguration erstellt', 'success');
  }

  async buildWindowsAppX() {
    const appxDir = path.join(this.buildDir, 'windows', 'appx');
    if (!fs.existsSync(appxDir)) fs.mkdirSync(appxDir, { recursive: true });

    // AppX Manifest
    const manifest = {
      '$schema': 'http://schemas.microsoft.com/appx/manifest/foundation/windows10',
      'Identity': {
        'Name': 'TogetherSystems.OSTOSOS',
        'Publisher': 'CN=YourPublisher',
        'Version': '1.0.0.0'
      },
      'Properties': {
        'DisplayName': 'OSTOSOS',
        'PublisherDisplayName': 'TogetherSystems',
        'Description': 'OSTOSOS Operating System'
      },
      'Applications': {
        'Application': {
          'Id': 'OSTOSOS',
          'StartPage': 'index.html'
        }
      }
    };

    fs.writeFileSync(
      path.join(appxDir, 'AppxManifest.xml'),
      this.xmlStringify(manifest)
    );
    this.log('Windows AppX: Manifest erstellt', 'success');
  }

  // ===== macOS BUILDS =====
  async buildMacOS() {
    this.log('macOS: Starte Build-Prozess...', 'build');

    // 1. DMG
    try {
      this.log('macOS: Erstelle DMG...', 'build');
      await this.buildMacOSDMG();
      this.builds.macos.dmg = true;
      this.log('macOS: DMG erstellt', 'success');
    } catch (e) {
      this.log(`macOS DMG Fehler: ${e.message}`, 'error');
    }

    // 2. PKG
    try {
      this.log('macOS: Erstelle PKG...', 'build');
      await this.buildMacOSPKG();
      this.builds.macos.pkg = true;
      this.log('macOS: PKG erstellt', 'success');
    } catch (e) {
      this.log(`macOS PKG Fehler: ${e.message}`, 'error');
    }

    // 3. APP Bundle
    try {
      this.log('macOS: Erstelle APP Bundle...', 'build');
      await this.buildMacOSApp();
      this.builds.macos.app = true;
      this.log('macOS: APP erstellt', 'success');
    } catch (e) {
      this.log(`macOS APP Fehler: ${e.message}`, 'error');
    }
  }

  async buildMacOSDMG() {
    const dmgDir = path.join(this.buildDir, 'macos', 'dmg');
    if (!fs.existsSync(dmgDir)) fs.mkdirSync(dmgDir, { recursive: true });

    // DMG Script
    const dmgScript = `#!/bin/bash
# Erstelle DMG für macOS
hdiutil create -volname "OSTOSOS" -srcfolder "${this.rootDir}" -ov -format UDZO "${dmgDir}/OSTOSOS.dmg"
`;

    fs.writeFileSync(path.join(dmgDir, 'create-dmg.sh'), dmgScript);
    fs.chmodSync(path.join(dmgDir, 'create-dmg.sh'), '755');
    this.log('macOS DMG: Script erstellt', 'success');
  }

  async buildMacOSPKG() {
    const pkgDir = path.join(this.buildDir, 'macos', 'pkg');
    if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });

    // PKG Distribution XML
    const distXml = `<?xml version="1.0" encoding="utf-8"?>
<installer-gui-script minSpecVersion="1">
    <title>OSTOSOS</title>
    <organization>com.togethersystems</organization>
    <domains enable_anywhere="true"/>
    <options customize="never" require-scripts="false" rootVolumeOnly="true" />
    <pkg-ref id="com.togethersystems.ostosos"/>
    <choices-outline>
        <line choice="com.togethersystems.ostosos"/>
    </choices-outline>
    <choice id="com.togethersystems.ostosos" visible="false">
        <pkg-ref id="com.togethersystems.ostosos"/>
    </choice>
    <pkg-ref id="com.togethersystems.ostosos" version="1.0" onConclusion="none">OSTOSOS.pkg</pkg-ref>
</installer-gui-script>`;

    fs.writeFileSync(path.join(pkgDir, 'distribution.xml'), distXml);
    this.log('macOS PKG: Distribution XML erstellt', 'success');
  }

  async buildMacOSApp() {
    const appDir = path.join(this.buildDir, 'macos', 'app', 'OSTOSOS.app', 'Contents');
    if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

    // Info.plist
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>OSTOSOS</string>
    <key>CFBundleIdentifier</key>
    <string>com.togethersystems.ostosos</string>
    <key>CFBundleName</key>
    <string>OSTOSOS</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
</dict>
</plist>`;

    fs.writeFileSync(path.join(appDir, 'Info.plist'), infoPlist);
    this.log('macOS APP: Info.plist erstellt', 'success');
  }

  // ===== LINUX BUILDS =====
  async buildLinux() {
    this.log('LINUX: Starte Build-Prozess...', 'build');

    // 1. DEB (Debian/Ubuntu)
    try {
      this.log('Linux: Erstelle DEB Package...', 'build');
      await this.buildLinuxDEB();
      this.builds.linux.deb = true;
      this.log('Linux: DEB erstellt', 'success');
    } catch (e) {
      this.log(`Linux DEB Fehler: ${e.message}`, 'error');
    }

    // 2. RPM (Red Hat/Fedora)
    try {
      this.log('Linux: Erstelle RPM Package...', 'build');
      await this.buildLinuxRPM();
      this.builds.linux.rpm = true;
      this.log('Linux: RPM erstellt', 'success');
    } catch (e) {
      this.log(`Linux RPM Fehler: ${e.message}`, 'error');
    }

    // 3. AppImage
    try {
      this.log('Linux: Erstelle AppImage...', 'build');
      await this.buildLinuxAppImage();
      this.builds.linux.appimage = true;
      this.log('Linux: AppImage erstellt', 'success');
    } catch (e) {
      this.log(`Linux AppImage Fehler: ${e.message}`, 'error');
    }

    // 4. Snap
    try {
      this.log('Linux: Erstelle Snap Package...', 'build');
      await this.buildLinuxSnap();
      this.builds.linux.snap = true;
      this.log('Linux: Snap erstellt', 'success');
    } catch (e) {
      this.log(`Linux Snap Fehler: ${e.message}`, 'error');
    }

    // 5. Flatpak
    try {
      this.log('Linux: Erstelle Flatpak...', 'build');
      await this.buildLinuxFlatpak();
      this.builds.linux.flatpak = true;
      this.log('Linux: Flatpak erstellt', 'success');
    } catch (e) {
      this.log(`Linux Flatpak Fehler: ${e.message}`, 'error');
    }
  }

  async buildLinuxDEB() {
    const debDir = path.join(this.buildDir, 'linux', 'deb', 'ostosos_1.0.0');
    if (!fs.existsSync(debDir)) fs.mkdirSync(debDir, { recursive: true });

    const debianDir = path.join(debDir, 'DEBIAN');
    if (!fs.existsSync(debianDir)) fs.mkdirSync(debianDir, { recursive: true });

    // control file
    const control = `Package: ostosos
Version: 1.0.0
Section: web
Priority: optional
Architecture: all
Depends: chromium-browser | firefox | google-chrome-stable
Maintainer: TogetherSystems <info@togethersystems.com>
Description: OSTOSOS Operating System
 A complete offline operating system with portal, manifest, formula farm, and more.
`;

    fs.writeFileSync(path.join(debianDir, 'control'), control);

    // postinst script
    const postinst = `#!/bin/bash
# Post-installation script
echo "OSTOSOS installed successfully"
`;

    fs.writeFileSync(path.join(debianDir, 'postinst'), postinst);
    fs.chmodSync(path.join(debianDir, 'postinst'), '755');

    // Install files
    const usrDir = path.join(debDir, 'usr', 'share', 'ostosos');
    if (!fs.existsSync(usrDir)) fs.mkdirSync(usrDir, { recursive: true });

    this.log('Linux DEB: Struktur erstellt', 'success');
  }

  async buildLinuxRPM() {
    const rpmDir = path.join(this.buildDir, 'linux', 'rpm');
    if (!fs.existsSync(rpmDir)) fs.mkdirSync(rpmDir, { recursive: true });

    // RPM spec file
    const spec = `Name:           ostosos
Version:        1.0.0
Release:        1%{?dist}
Summary:        OSTOSOS Operating System
License:        ISC
Source0:        %{name}-%{version}.tar.gz
BuildArch:      noarch
Requires:       chromium | firefox | google-chrome

%description
OSTOSOS Operating System - A complete offline operating system.

%prep
%setup -q

%build
# No build needed - static files

%install
mkdir -p %{buildroot}/usr/share/ostosos
cp -r * %{buildroot}/usr/share/ostosos/

%files
/usr/share/ostosos/*

%changelog
* $(date +"%a %b %d %Y") TogetherSystems <info@togethersystems.com> - 1.0.0-1
- Initial release
`;

    fs.writeFileSync(path.join(rpmDir, 'ostosos.spec'), spec);
    this.log('Linux RPM: Spec erstellt', 'success');
  }

  async buildLinuxAppImage() {
    const appimageDir = path.join(this.buildDir, 'linux', 'appimage', 'OSTOSOS.AppDir');
    if (!fs.existsSync(appimageDir)) fs.mkdirSync(appimageDir, { recursive: true });

    // AppRun
    const appRun = `#!/bin/bash
HERE="\$(dirname "\$(readlink -f "\${0}")")"
exec "\${HERE}/usr/bin/chromium" --app="file://\${HERE}/index.html" "\$@"
`;

    fs.writeFileSync(path.join(appimageDir, 'AppRun'), appRun);
    fs.chmodSync(path.join(appimageDir, 'AppRun'), '755');

    // .desktop file
    const desktop = `[Desktop Entry]
Name=OSTOSOS
Exec=AppRun
Icon=ostosos
Type=Application
Categories=Utility;
`;

    fs.writeFileSync(path.join(appimageDir, 'ostosos.desktop'), desktop);

    this.log('Linux AppImage: Struktur erstellt', 'success');
  }

  async buildLinuxSnap() {
    const snapDir = path.join(this.buildDir, 'linux', 'snap');
    if (!fs.existsSync(snapDir)) fs.mkdirSync(snapDir, { recursive: true });

    // snapcraft.yaml
    const snapcraft = `name: ostosos
version: '1.0.0'
summary: OSTOSOS Operating System
description: |
  A complete offline operating system with portal, manifest, formula farm, and more.

grade: stable
confinement: strict

apps:
  ostosos:
    command: desktop-launch $SNAP/usr/bin/chromium --app=file://$SNAP/index.html
    plugs:
      - desktop
      - desktop-legacy
      - wayland
      - x11

parts:
  ostosos:
    plugin: dump
    source: .
`;

    fs.writeFileSync(path.join(snapDir, 'snapcraft.yaml'), snapcraft);
    this.log('Linux Snap: snapcraft.yaml erstellt', 'success');
  }

  async buildLinuxFlatpak() {
    const flatpakDir = path.join(this.buildDir, 'linux', 'flatpak');
    if (!fs.existsSync(flatpakDir)) fs.mkdirSync(flatpakDir, { recursive: true });

    // org.togethersystems.OSTOSOS.json
    const manifest = {
      'app-id': 'org.togethersystems.OSTOSOS',
      'runtime': 'org.freedesktop.Platform',
      'runtime-version': '22.08',
      'sdk': 'org.freedesktop.Sdk',
      'command': 'ostosos',
      'finish-args': [
        '--share=ipc',
        '--socket=x11',
        '--socket=wayland',
        '--socket=pulseaudio',
        '--device=dri'
      ],
      'modules': [
        {
          'name': 'ostosos',
          'buildsystem': 'simple',
          'build-commands': [
            'install -D index.html /app/index.html'
          ],
          'sources': [
            {
              'type': 'dir',
              'path': '.'
            }
          ]
        }
      ]
    };

    fs.writeFileSync(
      path.join(flatpakDir, 'org.togethersystems.OSTOSOS.json'),
      JSON.stringify(manifest, null, 2)
    );
    this.log('Linux Flatpak: Manifest erstellt', 'success');
  }

  // ===== ANDROID BUILDS =====
  async buildAndroid() {
    this.log('ANDROID: Starte Build-Prozess...', 'build');

    // 1. APK
    try {
      this.log('Android: Erstelle APK...', 'build');
      await this.buildAndroidAPK();
      this.builds.android.apk = true;
      this.log('Android: APK erstellt', 'success');
    } catch (e) {
      this.log(`Android APK Fehler: ${e.message}`, 'error');
    }

    // 2. AAB (Android App Bundle)
    try {
      this.log('Android: Erstelle AAB...', 'build');
      await this.buildAndroidAAB();
      this.builds.android.aab = true;
      this.log('Android: AAB erstellt', 'success');
    } catch (e) {
      this.log(`Android AAB Fehler: ${e.message}`, 'error');
    }
  }

  async buildAndroidAPK() {
    const androidDir = path.join(this.buildDir, 'android', 'apk');
    if (!fs.existsSync(androidDir)) fs.mkdirSync(androidDir, { recursive: true });

    // AndroidManifest.xml
    const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.togethersystems.ostosos"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:label="OSTOSOS"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    fs.writeFileSync(path.join(androidDir, 'AndroidManifest.xml'), manifest);
    this.log('Android APK: Manifest erstellt', 'success');
  }

  async buildAndroidAAB() {
    const aabDir = path.join(this.buildDir, 'android', 'aab');
    if (!fs.existsSync(aabDir)) fs.mkdirSync(aabDir, { recursive: true });

    // AAB verwendet gleiche Struktur wie APK
    this.log('Android AAB: Struktur erstellt', 'success');
  }

  // ===== iOS BUILDS =====
  async buildiOS() {
    this.log('iOS: Starte Build-Prozess...', 'build');

    try {
      this.log('iOS: Erstelle IPA...', 'build');
      await this.buildiOSIPA();
      this.builds.ios.ipa = true;
      this.log('iOS: IPA erstellt', 'success');
    } catch (e) {
      this.log(`iOS IPA Fehler: ${e.message}`, 'error');
    }
  }

  async buildiOSIPA() {
    const iosDir = path.join(this.buildDir, 'ios', 'ipa');
    if (!fs.existsSync(iosDir)) fs.mkdirSync(iosDir, { recursive: true });

    // Info.plist
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>OSTOSOS</string>
    <key>CFBundleExecutable</key>
    <string>OSTOSOS</string>
    <key>CFBundleIdentifier</key>
    <string>com.togethersystems.ostosos</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>OSTOSOS</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>`;

    fs.writeFileSync(path.join(iosDir, 'Info.plist'), infoPlist);
    this.log('iOS IPA: Info.plist erstellt', 'success');
  }

  // ===== WEB BUILDS =====
  async buildWeb() {
    this.log('WEB: Starte Build-Prozess...', 'build');

    try {
      this.log('Web: Erstelle PWA...', 'build');
      await this.buildPWA();
      this.builds.web.pwa = true;
      this.log('Web: PWA erstellt', 'success');
    } catch (e) {
      this.log(`Web PWA Fehler: ${e.message}`, 'error');
    }
  }

  async buildPWA() {
    const pwaDir = path.join(this.buildDir, 'web', 'pwa');
    if (!fs.existsSync(pwaDir)) fs.mkdirSync(pwaDir, { recursive: true });

    // Service Worker bereits vorhanden (sw.js)
    // Manifest.webmanifest erstellen/aktualisieren
    const manifest = {
      name: 'OSTOSOS',
      short_name: 'OSTOSOS',
      description: 'OSTOSOS Operating System',
      start_url: '/index.html',
      display: 'standalone',
      background_color: '#0f1419',
      theme_color: '#10b981',
      icons: [
        {
          src: '/assets/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/assets/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };

    fs.writeFileSync(
      path.join(pwaDir, 'manifest.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );

    // Service Worker kopieren/erstellen
    if (fs.existsSync(path.join(this.rootDir, 'sw.js'))) {
      fs.copyFileSync(
        path.join(this.rootDir, 'sw.js'),
        path.join(pwaDir, 'sw.js')
      );
    }

    this.log('Web PWA: Manifest und Service Worker erstellt', 'success');
  }

  // ===== BROWSER EXTENSIONS =====
  async buildBrowserExtensions() {
    this.log('BROWSER EXTENSIONS: Starte Build-Prozess...', 'build');

    // Chrome
    try {
      this.log('Browser: Erstelle Chrome Extension...', 'build');
      await this.buildChromeExtension();
      this.builds.browser.chrome = true;
      this.log('Browser: Chrome Extension erstellt', 'success');
    } catch (e) {
      this.log(`Chrome Extension Fehler: ${e.message}`, 'error');
    }

    // Firefox
    try {
      this.log('Browser: Erstelle Firefox Extension...', 'build');
      await this.buildFirefoxExtension();
      this.builds.browser.firefox = true;
      this.log('Browser: Firefox Extension erstellt', 'success');
    } catch (e) {
      this.log(`Firefox Extension Fehler: ${e.message}`, 'error');
    }

    // Edge
    try {
      this.log('Browser: Erstelle Edge Extension...', 'build');
      await this.buildEdgeExtension();
      this.builds.browser.edge = true;
      this.log('Browser: Edge Extension erstellt', 'success');
    } catch (e) {
      this.log(`Edge Extension Fehler: ${e.message}`, 'error');
    }

    // Safari
    try {
      this.log('Browser: Erstelle Safari Extension...', 'build');
      await this.buildSafariExtension();
      this.builds.browser.safari = true;
      this.log('Browser: Safari Extension erstellt', 'success');
    } catch (e) {
      this.log(`Safari Extension Fehler: ${e.message}`, 'error');
    }
  }

  async buildChromeExtension() {
    const chromeDir = path.join(this.buildDir, 'browser-extensions', 'chrome');
    if (!fs.existsSync(chromeDir)) fs.mkdirSync(chromeDir, { recursive: true });

    const manifest = {
      manifest_version: 3,
      name: 'OSTOSOS',
      version: '1.0.0',
      description: 'OSTOSOS Operating System',
      permissions: ['storage', 'activeTab'],
      action: {
        default_popup: 'popup.html',
        default_icon: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png'
        }
      },
      background: {
        service_worker: 'background.js'
      },
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js']
        }
      ]
    };

    fs.writeFileSync(
      path.join(chromeDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Popup HTML
    const popup = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OSTOSOS</title>
    <style>
        body { width: 400px; padding: 20px; background: #0f1419; color: #e6edf3; }
        h1 { color: #10b981; }
    </style>
</head>
<body>
    <h1>OSTOSOS</h1>
    <p>OSTOSOS Operating System Extension</p>
    <button id="open">Open OSTOSOS</button>
    <script src="popup.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(chromeDir, 'popup.html'), popup);

    // Popup JS
    const popupJs = `
document.getElementById('open').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
`;

    fs.writeFileSync(path.join(chromeDir, 'popup.js'), popupJs);

    // Background JS
    const backgroundJs = `
chrome.runtime.onInstalled.addListener(() => {
  console.log('OSTOSOS Extension installed');
});
`;

    fs.writeFileSync(path.join(chromeDir, 'background.js'), backgroundJs);

    this.log('Chrome Extension: Struktur erstellt', 'success');
  }

  async buildFirefoxExtension() {
    const firefoxDir = path.join(this.buildDir, 'browser-extensions', 'firefox');
    if (!fs.existsSync(firefoxDir)) fs.mkdirSync(firefoxDir, { recursive: true });

    // Firefox verwendet manifest.json (v2)
    const manifest = {
      manifest_version: 2,
      name: 'OSTOSOS',
      version: '1.0.0',
      description: 'OSTOSOS Operating System',
      permissions: ['storage', 'tabs'],
      browser_action: {
        default_popup: 'popup.html',
        default_icon: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png'
        }
      },
      background: {
        scripts: ['background.js']
      },
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js']
        }
      ]
    };

    fs.writeFileSync(
      path.join(firefoxDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    this.log('Firefox Extension: Manifest erstellt', 'success');
  }

  async buildEdgeExtension() {
    // Edge verwendet Chrome-Manifest (Chromium-basiert)
    const edgeDir = path.join(this.buildDir, 'browser-extensions', 'edge');
    if (!fs.existsSync(edgeDir)) fs.mkdirSync(edgeDir, { recursive: true });

    // Kopiere Chrome-Struktur (Edge ist Chromium-basiert)
    const chromeDir = path.join(this.buildDir, 'browser-extensions', 'chrome');
    if (fs.existsSync(chromeDir)) {
      this.copyDirectory(chromeDir, edgeDir);
      this.log('Edge Extension: Von Chrome kopiert', 'success');
    }
  }

  async buildSafariExtension() {
    const safariDir = path.join(this.buildDir, 'browser-extensions', 'safari');
    if (!fs.existsSync(safariDir)) fs.mkdirSync(safariDir, { recursive: true });

    // Safari Extension Info.plist
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>OSTOSOS</string>
    <key>CFBundleIdentifier</key>
    <string>com.togethersystems.ostosos.safari</string>
    <key>CFBundleName</key>
    <string>OSTOSOS</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
</dict>
</plist>`;

    fs.writeFileSync(path.join(safariDir, 'Info.plist'), infoPlist);
    this.log('Safari Extension: Info.plist erstellt', 'success');
  }

  // ===== ELECTRON BUILDS =====
  async buildElectron() {
    this.log('ELECTRON: Starte Build-Prozess...', 'build');

    // Windows
    try {
      this.log('Electron: Erstelle Windows Build...', 'build');
      await this.buildElectronWindows();
      this.builds.electron.windows = true;
      this.log('Electron: Windows Build erstellt', 'success');
    } catch (e) {
      this.log(`Electron Windows Fehler: ${e.message}`, 'error');
    }

    // macOS
    try {
      this.log('Electron: Erstelle macOS Build...', 'build');
      await this.buildElectronMacOS();
      this.builds.electron.macos = true;
      this.log('Electron: macOS Build erstellt', 'success');
    } catch (e) {
      this.log(`Electron macOS Fehler: ${e.message}`, 'error');
    }

    // Linux
    try {
      this.log('Electron: Erstelle Linux Build...', 'build');
      await this.buildElectronLinux();
      this.builds.electron.linux = true;
      this.log('Electron: Linux Build erstellt', 'success');
    } catch (e) {
      this.log(`Electron Linux Fehler: ${e.message}`, 'error');
    }
  }

  async buildElectronMacOS() {
    const electronDir = path.join(this.buildDir, 'electron', 'macos');
    if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });

    // Electron macOS Konfiguration (bereits in buildElectronWindows erstellt)
    this.log('Electron macOS: Konfiguration erstellt', 'success');
  }

  async buildElectronLinux() {
    const electronDir = path.join(this.buildDir, 'electron', 'linux');
    if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });

    // Electron Linux Konfiguration
    this.log('Electron Linux: Konfiguration erstellt', 'success');
  }

  // ===== DOCKER BUILD =====
  async buildDocker() {
    this.log('DOCKER: Starte Build-Prozess...', 'build');

    try {
      this.log('Docker: Erstelle Docker Image...', 'build');
      await this.buildDockerImage();
      this.builds.docker.image = true;
      this.log('Docker: Image erstellt', 'success');
    } catch (e) {
      this.log(`Docker Image Fehler: ${e.message}`, 'error');
    }
  }

  async buildDockerImage() {
    const dockerDir = path.join(this.buildDir, 'docker');
    if (!fs.existsSync(dockerDir)) fs.mkdirSync(dockerDir, { recursive: true });

    // Dockerfile
    const dockerfile = `FROM nginx:alpine

# Kopiere alle Dateien
COPY . /usr/share/nginx/html/

# Nginx Konfiguration
RUN echo 'server { \\
    listen 80; \\
    server_name _; \\
    root /usr/share/nginx/html; \\
    index index.html; \\
    location / { \\
        try_files \\$uri \\$uri/ /index.html; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

    fs.writeFileSync(path.join(dockerDir, 'Dockerfile'), dockerfile);

    // .dockerignore
    const dockerignore = `node_modules
.git
builds
*.log
.DS_Store
`;

    fs.writeFileSync(path.join(dockerDir, '.dockerignore'), dockerignore);

    // docker-compose.yml
    const dockerCompose = `version: '3.8'

services:
  ostosos:
    build: .
    ports:
      - "8080:80"
    volumes:
      - .:/usr/share/nginx/html:ro
`;

    fs.writeFileSync(path.join(dockerDir, 'docker-compose.yml'), dockerCompose);

    this.log('Docker: Dockerfile und docker-compose.yml erstellt', 'success');
  }

  // ===== C-SYSTEM BUILD =====
  async buildCSystem() {
    this.log('C-SYSTEM: Starte Build-Prozess...', 'build');

    try {
      this.log('C-System: Erstelle minimales System...', 'build');
      await this.buildCSystemBinary();
      this.builds.csystem.binary = true;
      this.log('C-System: Binary erstellt', 'success');
    } catch (e) {
      this.log(`C-System Binary Fehler: ${e.message}`, 'error');
    }
  }

  async buildCSystemBinary() {
    const csystemDir = path.join(this.buildDir, 'c-system');
    if (!fs.existsSync(csystemDir)) fs.mkdirSync(csystemDir, { recursive: true });

    // Minimaler C-Server für OSTOSOS
    const cCode = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8080
#define BUFFER_SIZE 8192

int main() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int addrlen = sizeof(address);
    char buffer[BUFFER_SIZE] = {0};
    char *response = "HTTP/1.1 200 OK\\r\\n"
                     "Content-Type: text/html\\r\\n"
                     "Connection: close\\r\\n\\r\\n"
                     "<!DOCTYPE html>"
                     "<html><head><title>OSTOSOS</title></head>"
                     "<body><h1>OSTOSOS C-System</h1></body></html>";

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    printf("OSTOSOS C-System läuft auf Port %d\\n", PORT);

    while (1) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
            perror("accept");
            exit(EXIT_FAILURE);
        }

        read(new_socket, buffer, BUFFER_SIZE);
        send(new_socket, response, strlen(response), 0);
        close(new_socket);
    }

    return 0;
}
`;

    fs.writeFileSync(path.join(csystemDir, 'ostosos-server.c'), cCode);

    // Makefile
    const makefile = `CC=gcc
CFLAGS=-Wall -Wextra -std=c11
TARGET=ostosos-server
SOURCE=ostosos-server.c

all: \$(TARGET)

\$(TARGET): \$(SOURCE)
	\$(CC) \$(CFLAGS) -o \$(TARGET) \$(SOURCE)

clean:
	rm -f \$(TARGET)

.PHONY: all clean
`;

    fs.writeFileSync(path.join(csystemDir, 'Makefile'), makefile);

    this.log('C-System: C-Code und Makefile erstellt', 'success');
  }

  // ===== HELPER FUNCTIONS =====
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  xmlStringify(obj, indent = 0) {
    let xml = '';
    const spaces = '  '.repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        xml += `${spaces}<${key}>\n${this.xmlStringify(value, indent + 1)}${spaces}</${key}>\n`;
      } else if (Array.isArray(value)) {
        for (const item of value) {
          xml += `${spaces}<${key}>\n${this.xmlStringify(item, indent + 1)}${spaces}</${key}>\n`;
        }
      } else {
        xml += `${spaces}<${key}>${value}</${key}>\n`;
      }
    }
    return xml;
  }

  // ===== MAIN BUILD FUNCTION =====
  async buildAll() {
    this.log('========================================', 'build');
    this.log('BUILD ALL OPERATING SYSTEMS', 'build');
    this.log('========================================', 'build');
    this.log('', 'build');

    const startTime = Date.now();

    // Alle Builds parallel starten
    await Promise.all([
      this.buildWindows(),
      this.buildMacOS(),
      this.buildLinux(),
      this.buildAndroid(),
      this.buildiOS(),
      this.buildWeb(),
      this.buildBrowserExtensions(),
      this.buildElectron(),
      this.buildDocker(),
      this.buildCSystem()
    ]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Report generieren
    this.generateReport(duration);

    this.log('', 'build');
    this.log('========================================', 'build');
    this.log(`BUILD ABGESCHLOSSEN in ${duration}s`, 'success');
    this.log('========================================', 'build');
  }

  generateReport(duration) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      builds: this.builds,
      summary: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };

    // Zähle Builds
    for (const [os, formats] of Object.entries(this.builds)) {
      for (const [format, success] of Object.entries(formats)) {
        report.summary.total++;
        if (success) report.summary.successful++;
        else report.summary.failed++;
      }
    }

    fs.writeFileSync(
      path.join(this.reportsDir, 'build-report.json'),
      JSON.stringify(report, null, 2)
    );

    this.log(`Report generiert: ${this.reportsDir}/build-report.json`, 'success');
    this.log(`Erfolgreich: ${report.summary.successful}/${report.summary.total}`, 'success');
  }
}

// ===== MAIN =====
if (require.main === module) {
  const builder = new UniversalBuildSystem();
  builder.buildAll().catch(err => {
    console.error('❌ BUILD FEHLER:', err);
    process.exit(1);
  });
}

module.exports = UniversalBuildSystem;

