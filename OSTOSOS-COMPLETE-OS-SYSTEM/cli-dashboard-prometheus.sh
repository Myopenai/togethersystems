#!/usr/bin/env bash
# T,. OSOTOSOS CLI Dashboard mit Prometheus
PROM_URL="http://localhost:9090/api/v1/query"

check_metric() {
  local query=$1
  local label=$2
  local value=$(curl -s "$PROM_URL?query=$query" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "0")
  if (( $(echo "$value > 10" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "\033[31m$label: FEHLER ($value)\033[0m"
  elif (( $(echo "$value > 0" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "\033[33m$label: WARNUNG ($value)\033[0m"
  else
    echo -e "\033[32m$label: OK ($value)\033[0m"
  fi
}

echo "=== OSOTOSOS CLI Dashboard ==="
check_metric "frontend_errors_total" "Frontend"
check_metric "backend_errors_total" "Backend"
check_metric "build_failures_total" "Build"
check_metric "system_cpu_usage" "Infrastruktur"
check_metric "production_sensor_faults" "Produktion"
check_metric "org_compliance_violations" "Organisation"
check_metric "security_alerts_total" "Sicherheit"
check_metric "db_corruption_total" "Daten"
check_metric "user_input_errors_total" "Benutzer"
check_metric "external_api_failures_total" "Externe"
check_metric "time_sync_drift_seconds" "Zeit"
check_metric "human_error_reports_total" "Menschlich"
echo "==========================================="

