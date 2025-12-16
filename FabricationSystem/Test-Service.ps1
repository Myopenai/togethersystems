<#
.SYNOPSIS
    A simple HTTP service for testing the Fabrication System update process
.DESCRIPTION
    Creates a basic HTTP listener that responds to health checks and simulates
    the Fabrication System service.
#>

param(
    [int]$Port = 8080,
    [string]$Name = "TestService"
)

# Create HTTP listener
$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:$Port/")

# Simple request handler
function Handle-Request {
    param($context)
    
    $request = $context.Request
    $response = $context.Response
    
    try {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $($request.HttpMethod) $($request.Url.LocalPath)"
        
        $response.ContentType = 'application/json'
        
        # Handle health check
        if ($request.Url.LocalPath -eq '/health') {
            $response.StatusCode = 200
            $responseBody = @{
                Status = 'Healthy'
                Service = $Name
                Version = '2.2.0'
                Timestamp = [DateTime]::UtcNow.ToString('o')
            } | ConvertTo-Json
        }
        # Handle root
        elseif ($request.Url.LocalPath -eq '/') {
            $response.StatusCode = 200
            $responseBody = @{
                Service = $Name
                Version = '2.2.0'
                Status = 'Running'
                Timestamp = [DateTime]::UtcNow.ToString('o')
            } | ConvertTo-Json
        }
        # Not found
        else {
            $response.StatusCode = 404
            $responseBody = @{
                Status = 'Not Found'
                Path = $request.Url.LocalPath
            } | ConvertTo-Json
        }
        
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseBody)
        $response.ContentLength64 = $buffer.Length
        $output = $response.OutputStream
        $output.Write($buffer, 0, $buffer.Length)
    }
    catch {
        Write-Error "Error handling request: $_"
    }
    finally {
        $output.Close()
    }
}

# Start the listener
try {
    $http.Start()
    Write-Host "$Name listening on port $Port"
    
    # Main loop
    while ($http.IsListening) {
        $context = $http.GetContext()
        Handle-Request -Context $context
    }
}
catch {
    Write-Error "Error starting HTTP listener: $_"
}
finally {
    $http.Stop()
    $http.Close()
}
