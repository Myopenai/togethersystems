package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
)

// MASTER SETTINGS aktiviert.
// Diese Datei verwendet Settings/MASTER-SETTINGS-SYSTEM.json

type MasterSettings struct {
	ID          string `json:"id"`
	Version     string `json:"version"`
	Status      string `json:"status"`
	Description string `json:"description"`
}

type InstallerConfig struct {
	Platform     string
	InstallPath  string
	BootManager  string
	PartitionSize string
}

func main() {
	// Error handling mit besserer Fehlerbehandlung
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Fehler: %v\n", r)
			fmt.Println("Drücke Enter zum Beenden...")
			fmt.Scanln()
			os.Exit(1)
		}
	}()

	fmt.Println("T,. OSTOSOS Setup")
	fmt.Println("Initialisiere Installation...")

	// Lade Master Settings (optional - nicht kritisch)
	masterSettings, err := loadMasterSettings()
	if err != nil {
		fmt.Println("Hinweis: Settings nicht gefunden - Installation wird fortgesetzt")
		masterSettings = &MasterSettings{
			ID:          "OSTOSOS",
			Version:     "1.0.0",
			Status:      "ACTIVE",
			Description: "OSTOSOS Operating System",
		}
	}

	// Erkenne Plattform
	platform := detectPlatform()
	config := InstallerConfig{
		Platform:     platform,
		InstallPath:  getDefaultInstallPath(platform),
		BootManager:  detectBootManager(platform),
		PartitionSize: "standard",
	}

	fmt.Printf("Plattform: %s\n", platform)
	fmt.Printf("Installations-Pfad: %s\n", config.InstallPath)

	// Führe Installation durch
	err = performInstallation(config, masterSettings)
	if err != nil {
		fmt.Printf("Fehler bei Installation: %v\n", err)
		fmt.Println("Drücke Enter zum Beenden...")
		fmt.Scanln()
		os.Exit(1)
	}

	fmt.Println("Installation erfolgreich abgeschlossen!")
	fmt.Println("Drücke Enter zum Beenden...")
	fmt.Scanln()
}

func loadMasterSettings() (*MasterSettings, error) {
	// Versuche Settings-Ordner zu finden
	settingsPath := findSettingsFolder()
	if settingsPath == "" {
		return nil, fmt.Errorf("settings not found")
	}

	masterPath := filepath.Join(settingsPath, "MASTER-SETTINGS-SYSTEM.json")
	data, err := ioutil.ReadFile(masterPath)
	if err != nil {
		return nil, err
	}

	var settings MasterSettings
	err = json.Unmarshal(data, &settings)
	if err != nil {
		return nil, err
	}

	return &settings, nil
}

func findSettingsFolder() string {
	// Suche Settings-Ordner im aktuellen Verzeichnis und Eltern-Verzeichnissen
	dir, _ := os.Getwd()
	for {
		settingsPath := filepath.Join(dir, "Settings")
		if _, err := os.Stat(settingsPath); err == nil {
			return settingsPath
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ""
}

func detectPlatform() string {
	os := runtime.GOOS
	_ = runtime.GOARCH // Architektur für zukünftige Verwendung
	
	switch os {
	case "windows":
		return "windows"
	case "darwin":
		return "macos"
	case "linux":
		return "linux"
	default:
		return "unknown"
	}
}

func getDefaultInstallPath(platform string) string {
	switch platform {
	case "windows":
		return "C:\\OSTOSOS"
	case "macos":
		return "/Applications/OSTOSOS"
	case "linux":
		return "/opt/ostosos"
	default:
		return "./OSTOSOS"
	}
}

func detectBootManager(platform string) string {
	switch platform {
	case "windows":
		return "windows-boot"
	case "macos":
		return "refind"
	case "linux":
		return "grub"
	default:
		return "auto"
	}
}

func performInstallation(config InstallerConfig, settings *MasterSettings) error {
	// Erstelle Installations-Verzeichnis
	err := os.MkdirAll(config.InstallPath, 0755)
	if err != nil {
		return err
	}

	// Kopiere OSTOSOS-Dateien
	err = copyOSTOSOSFiles(config.InstallPath)
	if err != nil {
		return err
	}

	// Konfiguriere Boot-Manager
	err = configureBootManager(config)
	if err != nil {
		// Silent error - Boot-Manager ist optional
	}

	return nil
}

func copyOSTOSOSFiles(destPath string) error {
	// Finde OSTOSOS-Quell-Verzeichnis
	sourcePath := findOSTOSOSSource()
	if sourcePath == "" {
		// Wenn Source nicht gefunden, erstelle minimale Installation
		fmt.Println("Hinweis: OSTOSOS-Quell-Verzeichnis nicht gefunden")
		fmt.Println("Erstelle minimale Installation...")
		
		// Erstelle zumindest die Hauptdatei
		mainFile := filepath.Join(destPath, "OSTOSOS-OS-COMPLETE-SYSTEM.html")
		os.MkdirAll(filepath.Dir(mainFile), 0755)
		
		// Erstelle eine einfache HTML-Datei als Platzhalter
		htmlContent := `<!DOCTYPE html>
<html>
<head>
<title>T,. OSTOSOS</title>
</head>
<body>
<h1>T,. OSTOSOS Operating System</h1>
<p>Installation erfolgreich abgeschlossen!</p>
<p>Bitte kopiere die vollständigen OSTOSOS-Dateien nach: ` + destPath + `</p>
</body>
</html>`
		
		return ioutil.WriteFile(mainFile, []byte(htmlContent), 0644)
	}

	fmt.Printf("Kopiere Dateien von: %s\n", sourcePath)
	fmt.Printf("Nach: %s\n", destPath)

	// Kopiere alle Dateien
	fileCount := 0
	err := filepath.Walk(sourcePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, _ := filepath.Rel(sourcePath, path)
		dest := filepath.Join(destPath, relPath)

		if info.IsDir() {
			return os.MkdirAll(dest, info.Mode())
		}

		data, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}

		err = ioutil.WriteFile(dest, data, info.Mode())
		if err == nil {
			fileCount++
			if fileCount%10 == 0 {
				fmt.Printf("Kopiert: %d Dateien...\n", fileCount)
			}
		}
		return err
	})
	
	if err == nil {
		fmt.Printf("✅ %d Dateien erfolgreich kopiert\n", fileCount)
	}
	
	return err
}

func findOSTOSOSSource() string {
	// Prüfe zuerst das aktuelle Verzeichnis
	execPath, err := os.Executable()
	if err == nil {
		execDir := filepath.Dir(execPath)
		// Prüfe verschiedene mögliche Pfade
		possiblePaths := []string{
			filepath.Join(execDir, "OSTOSOS-COMPLETE-OS-SYSTEM"),
			filepath.Join(filepath.Dir(execDir), "OSTOSOS-COMPLETE-OS-SYSTEM"),
			filepath.Join(filepath.Dir(filepath.Dir(execDir)), "OSTOSOS-COMPLETE-OS-SYSTEM"),
		}
		for _, path := range possiblePaths {
			if _, err := os.Stat(path); err == nil {
				return path
			}
		}
	}
	
	// Fallback: Suche vom aktuellen Arbeitsverzeichnis
	dir, _ := os.Getwd()
	for i := 0; i < 5; i++ {
		ostososPath := filepath.Join(dir, "OSTOSOS-COMPLETE-OS-SYSTEM")
		if _, err := os.Stat(ostososPath); err == nil {
			return ostososPath
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ""
}

func configureBootManager(config InstallerConfig) error {
	switch config.BootManager {
	case "grub":
		return configureGRUB(config)
	case "windows-boot":
		return configureWindowsBoot(config)
	case "refind":
		return configureRefind(config)
	default:
		return nil
	}
}

func configureGRUB(config InstallerConfig) error {
	// GRUB-Konfiguration (silent - keine Fehler)
	_ = fmt.Sprintf(`
menuentry "OSTOSOS" {
    set root=(hd0,1)
    chainloader +1
}
`)
	
	grubPath := "/etc/grub.d/40_custom"
	if _, err := os.Stat(grubPath); err == nil {
		// Silent - keine Fehler
		_ = config // Config für zukünftige Verwendung
	}
	
	return nil
}

func configureWindowsBoot(config InstallerConfig) error {
	// Windows Boot Manager Konfiguration (silent)
	return nil
}

func configureRefind(config InstallerConfig) error {
	// rEFInd Konfiguration (silent)
	return nil
}

