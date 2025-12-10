#!/usr/bin/env python3
"""
Fabrikage Deployment Report Validator

This script validates and updates the FABRIK-DEPLOYMENT-REPORT.md file
to ensure it meets IBM FabrikCTIBS standards.
"""

import os
import re
import sys
import json
from datetime import datetime
from pathlib import Path

def load_template(template_path):
    """Load the report template."""
    if not os.path.exists(template_path):
        create_template(template_path)
    
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()

def create_template(template_path):
    """Create a new template file if it doesn't exist."""
    template_dir = os.path.dirname(template_path)
    if template_dir and not os.path.exists(template_dir):
        os.makedirs(template_dir)
    
    template_content = """# Fabrikage Deployment Report - IBM FabrikCTIBS Compliant
<!-- This file is auto-generated. Manual edits may be overwritten. -->

## 📋 Table of Contents
1. [IBM Cloud Architecture](#-ibm-cloud-architecture)
2. [Compliance Status](#-compliance-status)
3. [Security Controls](#-security-controls)
4. [IBM Cloud Services](#-ibm-cloud-services)
5. [Monitoring & Logging](#-monitoring--logging)
6. [CI/CD Pipeline](#-cicd-pipeline)
7. [Disaster Recovery](#-disaster-recovery)
8. [Cost Management](#-cost-management)
9. [Performance Metrics](#-performance-metrics)
10. [Incident Response](#-incident-response)

## ☁️ IBM Cloud Architecture
<!-- Auto-generated architecture details will be inserted here -->
- **Last Updated**: {timestamp}

## ✅ Compliance Status
- [ ] IBM Cloud Framework for Financial Services
- [ ] ISO 27001
- [ ] SOC 2 Type 2
- [ ] GDPR
- [ ] HIPAA

## 🔒 Security Controls
- **Data Encryption**: At rest and in transit
- **IAM**: IBM Cloud IAM integration
- **Network Security**: VPC, Security Groups, ACLs
- **Secrets Management**: IBM Cloud Secrets Manager

## 🛠 IBM Cloud Services
- **Compute**: 
- **Database**: 
- **Storage**: 
- **AI/ML**: 
- **Security**: 

## 📊 Monitoring & Logging
- **IBM Cloud Monitoring**:
  - [ ] Configured
  - [ ] Alerts set up
- **IBM Log Analysis**:
  - [ ] Log retention policy
  - [ ] Log export configuration

## 🔄 CI/CD Pipeline
- **IBM Cloud DevOps**:
  - [ ] Toolchain configured
  - [ ] Automated testing
  - [ ] Deployment gates

## 🚨 Disaster Recovery
- **Backup Strategy**:
  - [ ] Regular backups
  - [ ] Tested restore process
- **Failover**:
  - [ ] Multi-region deployment
  - [ ] Automated failover testing

## 💰 Cost Management
- **Budget Alerts**:
  - [ ] Configured
- **Cost Optimization**:
  - [ ] Resource right-sizing
  - [ ] Reserved instances

## 📈 Performance Metrics
- **Key Metrics**:
  - Response time
  - Error rate
  - Resource utilization

## 🚑 Incident Response
- **Process**:
  - [ ] Runbook available
  - [ ] On-call rotation
  - [ ] Post-mortem process

## 📝 Change Log
| Date | Version | Changes | Author |
|------|---------|---------|--------|
{timestamp} | 1.0 | Initial version | Fabrikage Automation |
"""
    
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    template_content = template_content.format(timestamp=timestamp)
    
    with open(template_path, 'w', encoding='utf-8') as f:
        f.write(template_content)
    
    return template_content

def get_required_sections():
    """Get the list of required sections."""
    return [
        "IBM Cloud Architecture",
        "Compliance Status",
        "Security Controls",
        "IBM Cloud Services",
        "Monitoring & Logging",
        "CI/CD Pipeline",
        "Disaster Recovery",
        "Cost Management",
        "Performance Metrics",
        "Incident Response"
    ]

def find_section(content, section_title):
    """Find a section in the content and return its content and end position."""
    pattern = rf'##\s*{re.escape(section_title)}\b.*?(?=##\s*\w|\Z)'
    match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(0).strip(), match.start(), match.end()
    return None, -1, -1

def update_report(report_path, template_path):
    """Update the report with missing sections from the template."""
    # Load the template
    template_content = load_template(template_path)
    
    # Create the report if it doesn't exist
    if not os.path.exists(report_path):
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(template_content)
        print(f"Created new report at {report_path}")
        return True
    
    # Read the current report
    with open(report_path, 'r', encoding='utf-8') as f:
        current_content = f.read()
    
    updated_content = current_content
    updated = False
    
    # Check for and add missing sections
    for section in get_required_sections():
        # Check if section exists in current content
        section_content, start, end = find_section(current_content, section)
        
        if not section_content:
            # Section is missing, get it from the template
            template_section, _, _ = find_section(template_content, section)
            if template_section:
                # Add the section before the first existing section that comes after
                inserted = False
                for next_section in get_required_sections():
                    if next_section == section:
                        continue
                    
                    next_pos = current_content.find(f"## {next_section}")
                    if next_pos != -1:
                        updated_content = (
                            updated_content[:next_pos].rstrip() + 
                            f"\n\n{template_section}\n" + 
                            updated_content[next_pos:].lstrip()
                        )
                        inserted = True
                        break
                
                # If no next section found, append to the end
                if not inserted:
                    updated_content = updated_content.rstrip() + f"\n\n{template_section}\n"
                
                updated = True
                print(f"Added missing section: {section}")
    
    # Update the last modified date in the IBM Cloud Architecture section
    arch_section, start, end = find_section(updated_content, "IBM Cloud Architecture")
    if arch_section:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        updated_arch = re.sub(
            r'\*\*Last Updated\*\*: .*',
            f'**Last Updated**: {timestamp} (UTC)',
            arch_section
        )
        updated_content = updated_content[:start] + updated_arch + updated_content[end:]
        updated = True
    
    # Save the updated content if changes were made
    if updated:
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Updated report at {report_path}")
    else:
        print("No updates needed. Report is up to date.")
    
    return updated

def main():
    """Main function."""
    # Get paths from environment variables or use defaults
    report_path = os.environ.get('REPORT_PATH', 'FABRIK-DEPLOYMENT-REPORT.md')
    template_path = os.environ.get('TEMPLATE_PATH', '.fabrik/REPORT-TEMPLATE.md')
    
    # Ensure paths are absolute
    if not os.path.isabs(report_path):
        report_path = os.path.join(os.getcwd(), report_path)
    if not os.path.isabs(template_path):
        template_path = os.path.join(os.getcwd(), template_path)
    
    # Update the report
    updated = update_report(report_path, template_path)
    
    # Set GitHub Actions output
    if 'GITHUB_OUTPUT' in os.environ:
        with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
            f.write(f'updated={str(updated).lower()}\n')
    
    return 0 if updated else 1

if __name__ == "__main__":
    sys.exit(main())
