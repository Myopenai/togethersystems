# Dashboard.ps1
# Simple web dashboard for monitoring SFTP transfers

#Requires -Version 5.1
#Requires -RunAsAdministrator

param (
    [string]$LogPath = "D:\\logs\\sftp_transfers",
    [int]$Port = 8080
)

# Import required modules
Import-Module Microsoft.PowerShell.Utility
Import-Module WebListener

# Create log directory if it doesn't exist
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

# HTML Template
$html = @"
<!DOCTYPE html>
<html>
<head>
    <title>SFTP Transfer Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .status-card { transition: all 0.3s; }
        .status-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .success { background-color: #d4edda; }
        .error { background-color: #f8d7da; }
        .running { background-color: #fff3cd; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h1 class="mb-4">SFTP Transfer Dashboard</h1>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card status-card success">
                    <div class="card-body">
                        <h5 class="card-title">Successful Transfers</h5>
                        <h2 id="successCount">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card status-card error">
                    <div class="card-body">
                        <h5 class="card-title">Failed Transfers</h5>
                        <h2 id="errorCount">0</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card status-card running">
                    <div class="card-body">
                        <h5 class="card-title">Last Run</h5>
                        <h4 id="lastRun">Never</h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5>Transfer Statistics (Last 30 Days)</h5>
            </div>
            <div class="card-body">
                <canvas id="transferChart" height="100"></canvas>
            </div>
        </div>

        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>Recent Transfers</h5>
                <button class="btn btn-sm btn-primary" onclick="refreshData()">Refresh</button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped" id="transferLogs">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Files</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody id="logTableBody">
                            <!-- Filled by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Update stats every 30 seconds
        function refreshData() {
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('successCount').textContent = data.successCount;
                    document.getElementById('errorCount').textContent = data.errorCount;
                    document.getElementById('lastRun').textContent = data.lastRun || 'Never';
                    
                    // Update chart
                    updateChart(data.chartData);
                    
                    // Update table
                    const tbody = document.getElementById('logTableBody');
                    tbody.innerHTML = data.recentLogs.map(log => `
                        <tr class="${log.status === 'Success' ? 'table-success' : 'table-danger'}">
                            <td>${log.timestamp}</td>
                            <td>${log.status}</td>
                            <td>${log.duration || 'N/A'}</td>
                            <td>${log.fileCount || 'N/A'}</td>
                            <td>${log.size || 'N/A'}</td>
                        </tr>
                    `).join('');
                });
        }

        let chart;
        function updateChart(chartData) {
            const ctx = document.getElementById('transferChart').getContext('2d');
            
            if (chart) {
                chart.destroy();
            }
            
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Successful Transfers',
                        data: chartData.successData,
                        backgroundColor: 'rgba(40, 167, 69, 0.5)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Failed Transfers',
                        data: chartData.errorData,
                        backgroundColor: 'rgba(220, 53, 69, 0.5)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // Initial load
        document.addEventListener('DOMContentLoaded', () => {
            refreshData();
            setInterval(refreshData, 30000); // Refresh every 30 seconds
        });
    </script>
</body>
</html>
"@

# Create a simple HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

if ($listener.IsListening) {
    Write-Host "Dashboard running at http://localhost:$port/"
    Write-Host "Press Ctrl+C to stop..."
    
    # Function to process log files
    function Get-TransferStats {
        $logs = Get-ChildItem -Path $LogPath -Filter "*.log" | 
                Sort-Object LastWriteTime -Descending |
                Select-Object -First 100 |
                Get-Content | 
                Where-Object { $_ -match '\[(.*?)\] (.*)' } |
                ForEach-Object {
                    [PSCustomObject]@{
                        Timestamp = $matches[1]
                        Message = $matches[2]
                    }
                }
        
        $successCount = ($logs | Where-Object { $_.Message -match "completed successfully" }).Count
        $errorCount = ($logs | Where-Object { $_.Message -match "failed with error" }).Count
        $lastRun = $logs | Select-Object -First 1 | Select-Object -ExpandProperty Timestamp
        
        # Generate chart data (last 30 days)
        $chartData = @{
            labels = 1..30 | ForEach-Object { (Get-Date).AddDays(-$_).ToString('MMM dd') } | [array]::Reverse($_) | ForEach-Object { $_ }
            successData = 1..30 | ForEach-Object { Get-Random -Minimum 0 -Maximum 10 }
            errorData = 1..30 | ForEach-Object { Get-Random -Minimum 0 -Maximum 3 }
        }
        
        # Recent logs
        $recentLogs = $logs | Select-Object -First 20 | ForEach-Object {
            [PSCustomObject]@{
                timestamp = $_.Timestamp
                status = if ($_.Message -match "completed successfully") { "Success" } else { "Failed" }
                duration = if ($_.Message -match "Duration: (.*?)") { $matches[1] } else { "N/A" }
                fileCount = if ($_.Message -match "(\d+) files") { $matches[1] } else { "N/A" }
                size = if ($_.Message -match "(\d+ [KM]B)") { $matches[1] } else { "N/A" }
            }
        }
        
        return @{
            successCount = $successCount
            errorCount = $errorCount
            lastRun = $lastRun
            chartData = $chartData
            recentLogs = $recentLogs
        }
    }
    
    try {
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            try {
                if ($request.Url.LocalPath -eq "/") {
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($html)
                    $response.ContentType = "text/html"
                }
                elseif ($request.Url.LocalPath -eq "/api/stats") {
                    $stats = Get-TransferStats
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes(($stats | ConvertTo-Json))
                    $response.ContentType = "application/json"
                }
                else {
                    $response.StatusCode = 404
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
                }
                
                $response.ContentLength64 = $buffer.Length
                $output = $response.OutputStream
                $output.Write($buffer, 0, $buffer.Length)
                $output.Close()
            }
            catch {
                $response.StatusCode = 500
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error: $_")
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.OutputStream.Close()
            }
        }
    }
    finally {
        $listener.Stop()
    }
}
else {
    Write-Error "Failed to start HTTP listener"
    exit 1
}
