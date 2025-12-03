# T,. OSOTOSOS Universal Go Build Pipeline
# One-Click Setup für alle Plattformen

.PHONY: all clean windows macos linux android ios build-all installers help

# Build-Verzeichnisse
BUILD_DIR = build
INSTALLER_DIR = installers

# Application Name
APP_NAME = ostosos-server
VERSION = 1.0.0

# Farben für Output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help:
	@echo "$(GREEN)T,. OSOTOSOS Universal Go Build Pipeline$(NC)"
	@echo ""
	@echo "Verfügbare Targets:"
	@echo "  $(YELLOW)all$(NC)           - Build für alle Plattformen"
	@echo "  $(YELLOW)windows$(NC)       - Windows Build (amd64, arm64)"
	@echo "  $(YELLOW)macos$(NC)         - macOS Build (amd64, arm64)"
	@echo "  $(YELLOW)linux$(NC)         - Linux Build (amd64, arm64, 386)"
	@echo "  $(YELLOW)android$(NC)       - Android Build (APK)"
	@echo "  $(YELLOW)ios$(NC)           - iOS Build (IPA)"
	@echo "  $(YELLOW)installers$(NC)    - Erstelle Installer für alle Plattformen"
	@echo "  $(YELLOW)clean$(NC)         - Lösche Build-Verzeichnisse"
	@echo ""

all: windows macos linux
	@echo "$(GREEN)✓ Alle Builds abgeschlossen$(NC)"

# Windows Builds
windows:
	@echo "$(YELLOW)Building Windows Binaries...$(NC)"
	@mkdir -p $(BUILD_DIR)/windows-amd64
	@GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -H windowsgui" -o $(BUILD_DIR)/windows-amd64/$(APP_NAME).exe main.go
	@echo "$(GREEN)✓ Windows (amd64) Build abgeschlossen$(NC)"
	@mkdir -p $(BUILD_DIR)/windows-arm64
	@GOOS=windows GOARCH=arm64 go build -ldflags="-s -w -H windowsgui" -o $(BUILD_DIR)/windows-arm64/$(APP_NAME).exe main.go
	@echo "$(GREEN)✓ Windows (arm64) Build abgeschlossen$(NC)"

# macOS Builds
macos:
	@echo "$(YELLOW)Building macOS Binaries...$(NC)"
	@mkdir -p $(BUILD_DIR)/macos-amd64
	@GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o $(BUILD_DIR)/macos-amd64/$(APP_NAME) main.go
	@echo "$(GREEN)✓ macOS (amd64) Build abgeschlossen$(NC)"
	@mkdir -p $(BUILD_DIR)/macos-arm64
	@GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o $(BUILD_DIR)/macos-arm64/$(APP_NAME) main.go
	@echo "$(GREEN)✓ macOS (arm64/Apple Silicon) Build abgeschlossen$(NC)"

# Linux Builds
linux:
	@echo "$(YELLOW)Building Linux Binaries...$(NC)"
	@mkdir -p $(BUILD_DIR)/linux-amd64
	@GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(BUILD_DIR)/linux-amd64/$(APP_NAME) main.go
	@echo "$(GREEN)✓ Linux (amd64) Build abgeschlossen$(NC)"
	@mkdir -p $(BUILD_DIR)/linux-arm64
	@GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o $(BUILD_DIR)/linux-arm64/$(APP_NAME) main.go
	@echo "$(GREEN)✓ Linux (arm64) Build abgeschlossen$(NC)"
	@mkdir -p $(BUILD_DIR)/linux-386
	@GOOS=linux GOARCH=386 go build -ldflags="-s -w" -o $(BUILD_DIR)/linux-386/$(APP_NAME) main.go
	@echo "$(GREEN)✓ Linux (386) Build abgeschlossen$(NC)"

# Android Build (benötigt gomobile)
android:
	@echo "$(YELLOW)Building Android APK...$(NC)"
	@echo "$(RED)Android Build benötigt gomobile: go install golang.org/x/mobile/cmd/gomobile@latest$(NC)"
	@mkdir -p $(BUILD_DIR)/android
	@echo "$(YELLOW)Android Build wird noch implementiert...$(NC)"

# iOS Build (benötigt gomobile)
ios:
	@echo "$(YELLOW)Building iOS IPA...$(NC)"
	@echo "$(RED)iOS Build benötigt gomobile: go install golang.org/x/mobile/cmd/gomobile@latest$(NC)"
	@mkdir -p $(BUILD_DIR)/ios
	@echo "$(YELLOW)iOS Build wird noch implementiert...$(NC)"

# Installer erstellen
installers: windows-installer macos-installer linux-installer
	@echo "$(GREEN)✓ Alle Installer erstellt$(NC)"

windows-installer: windows
	@echo "$(YELLOW)Creating Windows Installer...$(NC)"
	@mkdir -p $(INSTALLER_DIR)/windows
	@echo "$(YELLOW)Windows Installer wird noch implementiert (Inno Setup / WiX)$(NC)"

macos-installer: macos
	@echo "$(YELLOW)Creating macOS Installer...$(NC)"
	@mkdir -p $(INSTALLER_DIR)/macos
	@echo "$(YELLOW)macOS Installer wird noch implementiert (DMG / PKG)$(NC)"

linux-installer: linux
	@echo "$(YELLOW)Creating Linux Installer...$(NC)"
	@mkdir -p $(INSTALLER_DIR)/linux
	@echo "$(YELLOW)Linux Installer wird noch implementiert (DEB / RPM)$(NC)"

clean:
	@echo "$(YELLOW)Cleaning build directories...$(NC)"
	@rm -rf $(BUILD_DIR) $(INSTALLER_DIR)
	@echo "$(GREEN)✓ Clean abgeschlossen$(NC)"

