#!/usr/bin/env swift

// Notary Manifest Client - macOS/iOS
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import Foundation

struct Manifest: Codable {
    let name: String
    let data: String
}

func uploadManifest(name: String, filePath: String) {
    guard let url = URL(string: "https://apple-pi.local/notary/manifest") else {
        print("❌ Ungültige URL")
        return
    }
    
    guard let fileData = try? Data(contentsOf: URL(fileURLWithPath: filePath)) else {
        print("❌ Datei konnte nicht gelesen werden: \(filePath)")
        return
    }
    
    let base64Data = fileData.base64EncodedString()
    let manifest = Manifest(name: name, data: base64Data)
    
    guard let jsonData = try? JSONEncoder().encode(manifest) else {
        print("❌ JSON konnte nicht erstellt werden")
        return
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = jsonData
    
    // Self-Signed Certificate akzeptieren (nur für lokale Entwicklung)
    let session = URLSession(configuration: .default, delegate: SelfSignedCertDelegate(), delegateQueue: nil)
    
    let semaphore = DispatchSemaphore(value: 0)
    var result: String?
    
    session.dataTask(with: request) { data, response, error in
        if let error = error {
            result = "❌ Fehler: \(error.localizedDescription)"
        } else if let data = data {
            result = String(data: data, encoding: .utf8) ?? "Keine Antwort"
        }
        semaphore.signal()
    }.resume()
    
    semaphore.wait()
    
    if let result = result {
        print(result)
    }
}

class SelfSignedCertDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        // ⚠️ NUR FÜR LOKALE ENTWICKLUNG - In Produktion: Echte Zertifikate verwenden
        if challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust {
            if let serverTrust = challenge.protectionSpace.serverTrust {
                completionHandler(.useCredential, URLCredential(trust: serverTrust))
                return
            }
        }
        completionHandler(.performDefaultHandling, nil)
    }
}

// CLI-Usage
if CommandLine.arguments.count < 3 {
    print("Usage: \(CommandLine.arguments[0]) <name> <file-path>")
    exit(1)
}

let name = CommandLine.arguments[1]
let filePath = CommandLine.arguments[2]

uploadManifest(name: name, filePath: filePath)
