#Requires -Version 7.0
#Requires -Modules MongoDB.Driver

<#
.SYNOPSIS
    Initializes the database with required collections and indexes.
.DESCRIPTION
    This script connects to MongoDB and creates necessary collections and indexes
    for the Startup Systems application.
#>

try {
    # Load environment variables
    $envFile = Join-Path $PSScriptRoot "../../../.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            $name, $value = $_.Split('=', 2)
            if ($name -and $name[0] -ne '#' -and $value) {
                [System.Environment]::SetEnvironmentVariable($name, $value.Trim('"'))
            }
        }
    }

    # Get MongoDB connection string from environment or use default
    $mongoUri = [System.Environment]::GetEnvironmentVariable("MONGODB_URI")
    if ([string]::IsNullOrEmpty($mongoUri)) {
        $mongoUri = "mongodb://localhost:27017/startup-systems"
    }

    Write-Host "Connecting to MongoDB..." -ForegroundColor Cyan
    
    # Create MongoDB client and database
    $client = New-Object MongoDB.Driver.MongoClient($mongoUri)
    $databaseName = [System.Uri]::new($mongoUri).Segments[-1].Trim('/')
    $database = $client.GetDatabase($databaseName)

    # Collections to create
    $collections = @(
        @{
            Name = "users"
            Indexes = @(
                @{ Keys = @{ email = 1 }; Options = @{ Unique = $true } },
                @{ Keys = @{ username = 1 }; Options = @{ Unique = $true } }
            )
        },
        @{
            Name = "sessions"
            Indexes = @(
                @{ Keys = @{ expires = 1 }; Options = @{ ExpireAfter = [TimeSpan]::Zero } }
            )
        },
        "devices",
        "alerts",
        "logs",
        "settings"
    )

    # Create collections and indexes
    foreach ($collection in $collections) {
        $name = if ($collection -is [hashtable]) { $collection.Name } else { $collection }
        
        Write-Host "Creating collection: $name" -ForegroundColor Green
        $database.CreateCollection($name)
        
        if ($collection -is [hashtable] -and $collection.Indexes) {
            $collectionObj = $database.GetCollection($name)
            
            foreach ($index in $collection.Indexes) {
                $keys = $index.Keys
                $options = $index.Options
                
                $indexKeys = New-Object MongoDB.Bson.BsonDocument
                foreach ($key in $keys.GetEnumerator()) {
                    $indexKeys.Add($key.Key, $key.Value)
                }
                
                $indexModel = New-Object MongoDB.Driver.CreateIndexModel`1[$object](
                    (New-Object MongoDB.Driver.BsonDocumentIndexKeysDefinition`1[$object]($indexKeys)),
                    (New-Object MongoDB.Driver.CreateIndexOptions)
                )
                
                if ($options.Unique) { $indexModel.Options.Unique = $true }
                if ($options.ExpireAfter) { $indexModel.Options.ExpireAfter = $options.ExpireAfter }
                
                $collectionObj.Indexes.CreateOne($indexModel)
                Write-Host "  - Created index: $($keys.Keys -join ', ')" -ForegroundColor DarkGray
            }
        }
    }

    # Create default admin user if users collection is empty
    $users = $database.GetCollection("users")
    if ($users.CountDocuments("{}") -eq 0) {
        $password = [System.Environment]::GetEnvironmentVariable("DEFAULT_ADMIN_PASSWORD")
        if ([string]::IsNullOrEmpty($password)) {
            $password = "Admin@123"
            Write-Host "Using default admin password: $password" -ForegroundColor Yellow
            Write-Host "WARNING: Please change the default admin password immediately!" -ForegroundColor Red
        }

        $salt = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
        $saltedPassword = $password + $salt
        $hashedPassword = [System.Convert]::ToBase64String(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash(
                [System.Text.Encoding]::UTF8.GetBytes($saltedPassword)
            )
        )

        $adminUser = @{
            _id = [MongoDB.Bson.ObjectId]::GenerateNewId()
            username = "admin"
            email = "admin@example.com"
            password = $hashedPassword
            salt = $salt
            roles = @("admin")
            firstName = "System"
            lastName = "Administrator"
            isActive = $true
            emailVerified = $true
            createdAt = [DateTime]::UtcNow
            updatedAt = [DateTime]::UtcNow
        }

        $users.InsertOne($adminUser)
        Write-Host "Created default admin user: admin@example.com" -ForegroundColor Green
    }

    Write-Host "`nDatabase initialization completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    exit 1
}
