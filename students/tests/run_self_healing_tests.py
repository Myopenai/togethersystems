#!/usr/bin/env python3
"""
Self-Healing Test Runner for Fabrication Systems
Implements IBM's self-healing test patterns with automated remediation
"""
import os
import sys
import argparse
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

# Add project root to Python path
PROJECT_ROOT = str(Path(__file__).parent.parent)
sys.path.insert(0, PROJECT_ROOT)

from tests.self_healing.healing_engine import SelfHealingEngine

class SelfHealingTestRunner:
    """Main test runner class with self-healing capabilities"""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the test runner"""
        self.engine = SelfHealingEngine(config_path)
        self.start_time = time.time()
        
    def run(self) -> bool:
        """Run all tests with self-healing"""
        print("\n" + "="*80)
        print("  FABRICATION SELF-HEALING TEST RUNNER")
        print("  IBM Standard Implementation")
        print("="*80 + "\n")
        
        print("Initializing test environment...")
        self._setup_environment()
        
        print("\nStarting test execution with self-healing...")
        success = self.engine.run_tests()
        
        self._generate_report(success)
        return success
    
    def _setup_environment(self) -> None:
        """Set up test environment"""
        # Ensure required directories exist
        os.makedirs("test_reports", exist_ok=True)
        os.makedirs("test_data", exist_ok=True)
        
        # Set environment variables if needed
        os.environ["FABRICATION_ENV"] = "test"
        os.environ["PYTHONPATH"] = PROJECT_ROOT
    
    def _generate_report(self, success: bool) -> None:
        """Generate test execution report"""
        duration = time.time() - self.start_time
        status = "PASSED" if success else "FAILED"
        
        print("\n" + "="*80)
        print(f"  TEST EXECUTION {status}")
        print("  " + "-"*76)
        print(f"  Duration: {duration:.2f} seconds")
        print(f"  Timestamp: {time.ctime()}")
        print("="*80 + "\n")
        
        # Generate detailed report file
        report_file = f"test_reports/test_report_{int(time.time())}.txt"
        with open(report_file, 'w') as f:
            f.write(f"Test Execution Report\n")
            f.write(f"Status: {status}\n")
            f.write(f"Duration: {duration:.2f} seconds\n")
            f.write(f"Timestamp: {time.ctime()}\n")
            f.write("\nNote: Detailed test results will be available in the log file.\n")
        
        print(f"Report generated: {os.path.abspath(report_file)}")
        print(f"Detailed logs: {os.path.abspath('fabrication_test_engine.log')}")

def parse_args() -> argparse.Namespace:
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Run self-healing tests for Fabrication Systems')
    parser.add_argument('--config', '-c', 
                      help='Path to configuration file',
                      default=None)
    parser.add_argument('--test-dir', '-t',
                      help='Directory containing tests to run',
                      default=None)
    return parser.parse_args()

def main() -> int:
    """Main entry point"""
    args = parse_args()
    
    try:
        runner = SelfHealingTestRunner(config_path=args.config)
        success = runner.run()
        return 0 if success else 1
    except Exception as e:
        print(f"\nERROR: {str(e)}", file=sys.stderr)
        return 2

if __name__ == "__main__":
    sys.exit(main())
