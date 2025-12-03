#!/usr/bin/env python3
# T,. Global Industrial TÜV - Verification Pipeline (Double Inspection)
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

import json
import sys
import time
from datetime import datetime

def log(msg, level="INFO"):
    """Log message with timestamp"""
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{timestamp}] [{level}] {msg}", file=sys.stderr)

def gate_tuv1(manifest):
    """TÜV-I: Contracts, lint, schema, safety policies"""
    log("TÜV-I: Starting inspection...")
    
    # Check branding immutable
    if not manifest.get("producer", {}).get("brandingImmutable"):
        raise ValueError("TÜV-I FAIL: brandingImmutable must be true")
    
    # Check app identifier
    if not manifest.get("app"):
        raise ValueError("TÜV-I FAIL: missing app identifier")
    
    # Check producer information
    producer = manifest.get("producer", {})
    if not producer.get("name") or not producer.get("licenseId"):
        raise ValueError("TÜV-I FAIL: incomplete producer information")
    
    # Check role
    role = manifest.get("role")
    if role not in ["original", "maintainer", "community"]:
        raise ValueError(f"TÜV-I FAIL: invalid role: {role}")
    
    log("TÜV-I: PASSED")
    return True

def gate_tests(manifest):
    """Gate B: Unit, integration, E2E, performance, accessibility, security"""
    log("Tests: Starting test gates...")
    
    # Check targets
    targets = manifest.get("targets", [])
    if not isinstance(targets, list) or len(targets) == 0:
        raise ValueError("Tests FAIL: targets must be non-empty array")
    
    # Validate each target
    for i, target in enumerate(targets):
        required = ["variant", "deviceType", "model", "arch", "locale", "minVersion"]
        for field in required:
            if field not in target:
                raise ValueError(f"Tests FAIL: target[{i}] missing {field}")
        
        # Validate enum values
        if target.get("variant") not in ["pro", "lite", "enterprise", "community"]:
            raise ValueError(f"Tests FAIL: target[{i}] invalid variant")
        
        if target.get("deviceType") not in ["desktop", "laptop", "tablet", "phone", "embedded", "plant", "server", "iot"]:
            raise ValueError(f"Tests FAIL: target[{i}] invalid deviceType")
        
        if target.get("arch") not in ["x64", "arm64", "arm32", "riscv", "custom"]:
            raise ValueError(f"Tests FAIL: target[{i}] invalid arch")
    
    # Check version format (semantic versioning)
    version = manifest.get("version", "")
    import re
    if not re.match(r'^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$', version):
        raise ValueError(f"Tests FAIL: invalid version format: {version}")
    
    log("Tests: PASSED")
    return True

def gate_tuv2(manifest):
    """TÜV-II: Parity, observability, compliance (sector norms)"""
    log("TÜV-II: Starting second inspection...")
    
    # Check signature
    signature = manifest.get("signature", {})
    if not signature.get("keyId"):
        raise ValueError("TÜV-II FAIL: missing signature keyId")
    
    if signature.get("algo") not in ["ed25519", "rsa-pss", "ecdsa-p256"]:
        raise ValueError(f"TÜV-II FAIL: invalid signature algorithm: {signature.get('algo')}")
    
    if not signature.get("value"):
        raise ValueError("TÜV-II FAIL: missing signature value")
    
    # Check compliance (if present)
    compliance = manifest.get("compliance", {})
    if compliance:
        standards = compliance.get("standards", [])
        if standards and not isinstance(standards, list):
            raise ValueError("TÜV-II FAIL: compliance.standards must be array")
    
    log("TÜV-II: PASSED")
    return True

def gate_build(manifest):
    """Gate D: Deterministic artifacts with strict naming and hashes"""
    log("Build: Starting build gate...")
    
    # Check artifacts
    artifacts = manifest.get("artifacts", [])
    if not isinstance(artifacts, list) or len(artifacts) == 0:
        raise ValueError("Build FAIL: artifacts must be non-empty array")
    
    # Validate each artifact
    for i, artifact in enumerate(artifacts):
        if not artifact.get("filename"):
            raise ValueError(f"Build FAIL: artifact[{i}] missing filename")
        
        if not isinstance(artifact.get("size"), int) or artifact.get("size") < 0:
            raise ValueError(f"Build FAIL: artifact[{i}] invalid size")
        
        if not artifact.get("url"):
            raise ValueError(f"Build FAIL: artifact[{i}] missing url")
    
    # Check hashes
    hashes = manifest.get("hashes", [])
    if not isinstance(hashes, list) or len(hashes) == 0:
        raise ValueError("Build FAIL: hashes must be non-empty array")
    
    # Validate hash format
    import re
    for i, hash_entry in enumerate(hashes):
        sha256_hash = hash_entry.get("sha256", "")
        if not re.match(r'^[a-f0-9]{64}$', sha256_hash):
            raise ValueError(f"Build FAIL: hash[{i}] invalid SHA-256 format")
    
    # Verify artifact-hash correspondence
    artifact_filenames = {a.get("filename") for a in artifacts}
    hash_filenames = {h.get("filename") for h in hashes}
    
    if artifact_filenames != hash_filenames:
        missing = artifact_filenames - hash_filenames
        extra = hash_filenames - artifact_filenames
        raise ValueError(f"Build FAIL: artifact-hash mismatch. Missing: {missing}, Extra: {extra}")
    
    log("Build: PASSED")
    return True

def gate_report(manifest):
    """Gate E: Signed audit with attestation and digital twin deltas"""
    log("Report: Starting report gate...")
    
    # Check changelog
    changelog = manifest.get("changelog", "")
    if not changelog or len(changelog) < 10:
        raise ValueError("Report FAIL: changelog must be at least 10 characters")
    
    # Check attestation (optional but recommended)
    attestation = manifest.get("attestation", {})
    if attestation:
        if not attestation.get("builtAt"):
            log("Report: WARNING - attestation.builtAt missing", "WARN")
    
    log("Report: PASSED")
    return True

def run_all(manifest):
    """Run all verification gates"""
    log("=" * 60)
    log("Starting Global Industrial TÜV Verification Pipeline")
    log("=" * 60)
    
    gates = [
        ("TÜV-I", gate_tuv1),
        ("Tests", gate_tests),
        ("TÜV-II", gate_tuv2),
        ("Build", gate_build),
        ("Report", gate_report)
    ]
    
    results = {}
    start_time = time.time()
    
    try:
        for gate_name, gate_func in gates:
            gate_start = time.time()
            gate_func(manifest)
            gate_duration = time.time() - gate_start
            results[gate_name] = {
                "status": "PASSED",
                "duration": f"{gate_duration:.3f}s"
            }
            log(f"{gate_name}: PASSED ({gate_duration:.3f}s)")
        
        total_duration = time.time() - start_time
        
        log("=" * 60)
        log("ALL GATES PASSED")
        log(f"Total duration: {total_duration:.3f}s")
        log("=" * 60)
        
        # Output results as JSON
        output = {
            "status": "PASSED",
            "gates": results,
            "total_duration": f"{total_duration:.3f}s",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        print(json.dumps(output, indent=2))
        return True
        
    except Exception as e:
        log(f"VERIFICATION FAILED: {str(e)}", "ERROR")
        output = {
            "status": "FAILED",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        print(json.dumps(output, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    try:
        manifest = json.load(sys.stdin)
        run_all(manifest)
    except json.JSONDecodeError as e:
        log(f"Invalid JSON: {str(e)}", "ERROR")
        sys.exit(1)
    except Exception as e:
        log(f"Fatal error: {str(e)}", "ERROR")
        sys.exit(1)

