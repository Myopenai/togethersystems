# Deployment Report Automation

This directory contains scripts and workflows for automating the validation and updating of the FABRIK-DEPLOYMENT-REPORT.md file to ensure it meets IBM FabrikCTIBS standards.

## Files

- `validate_deployment_report.py`: Python script that validates and updates the deployment report
- `validate-deployment-report.yml`: GitHub Actions workflow that runs the validation on push and pull requests

## How It Works

1. **On every push to main/master branches and pull requests**:
   - The GitHub Actions workflow is triggered
   - The Python script checks if the deployment report exists and creates it if missing
   - The script validates that all required sections are present
   - Missing sections are automatically added from the template
   - The "Last Updated" timestamp is refreshed

2. **If running on the main branch**:
   - Changes are automatically committed and pushed back to the repository

3. **If running on a non-main branch (like a PR)**:
   - A new PR is created with the proposed changes
   - The PR includes a summary of changes for review

## Required Sections

The deployment report must include the following sections:

1. IBM Cloud Architecture
2. Compliance Status
3. Security Controls
4. IBM Cloud Services
5. Monitoring & Logging
6. CI/CD Pipeline
7. Disaster Recovery
8. Cost Management
9. Performance Metrics
10. Incident Response

## Manual Execution

To manually run the validation:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the validation script
python .github/scripts/validate_deployment_report.py
```

## Configuration

Environment variables:

- `REPORT_PATH`: Path to the deployment report (default: `FABRIK-DEPLOYMENT-REPORT.md`)
- `TEMPLATE_PATH`: Path to the report template (default: `.fabrik/REPORT-TEMPLATE.md`)

## Dependencies

- Python 3.8+
- PyYAML

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
