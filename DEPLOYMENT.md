# Deployment Guide - Journi

This guide covers deploying Journi to Azure.

## Option 1: Azure App Service (Recommended)

### Prerequisites
- Azure account
- Azure CLI installed
- OpenAI API key

### Steps

1. **Install Azure CLI** (if not already installed):
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

2. **Login to Azure**:
```bash
az login
```

3. **Create Resource Group**:
```bash
az group create --name journi-rg --location eastus
```

4. **Create App Service Plan**:
```bash
az appservice plan create \
  --name journi-plan \
  --resource-group journi-rg \
  --sku B1 \
  --is-linux
```

5. **Create Web App**:
```bash
az webapp create \
  --resource-group journi-rg \
  --plan journi-plan \
  --name journi-app \
  --runtime "NODE:18-lts"
```

6. **Configure Environment Variables**:
```bash
az webapp config appsettings set \
  --resource-group journi-rg \
  --name journi-app \
  --settings \
    OPENAI_API_KEY="your-key-here" \
    DATABASE_URL="your-db-connection-string" \
    NEXT_PUBLIC_BASE_URL="https://journi-app.azurewebsites.net"
```

7. **Deploy from GitHub** (recommended):
```bash
az webapp deployment source config \
  --name journi-app \
  --resource-group journi-rg \
  --repo-url https://github.com/yourusername/journi \
  --branch main \
  --manual-integration
```

Or **Deploy from Local**:
```bash
# Build the application
npm run build

# Create deployment package
zip -r deploy.zip .next package.json package-lock.json next.config.js

# Deploy
az webapp deployment source config-zip \
  --resource-group journi-rg \
  --name journi-app \
  --src deploy.zip
```

8. **Configure Startup Command**:
```bash
az webapp config set \
  --resource-group journi-rg \
  --name journi-app \
  --startup-file "npm start"
```

## Option 2: Azure Static Web Apps

### Steps

1. **Create Static Web App**:
```bash
az staticwebapp create \
  --name journi-static \
  --resource-group journi-rg \
  --source https://github.com/yourusername/journi \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location ".next"
```

2. **Configure Environment Variables** in Azure Portal:
- Navigate to Static Web App > Configuration
- Add application settings:
  - `OPENAI_API_KEY`
  - `DATABASE_URL`
  - `NEXT_PUBLIC_BASE_URL`

## Azure SQL Database Setup

### Create Database

1. **Create SQL Server**:
```bash
az sql server create \
  --name journi-sql-server \
  --resource-group journi-rg \
  --location eastus \
  --admin-user journiadmin \
  --admin-password "YourSecurePassword123!"
```

2. **Create Database**:
```bash
az sql db create \
  --resource-group journi-rg \
  --server journi-sql-server \
  --name journi-db \
  --service-objective S0
```

3. **Configure Firewall**:
```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group journi-rg \
  --server journi-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (for management)
az sql server firewall-rule create \
  --resource-group journi-rg \
  --server journi-sql-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

4. **Get Connection String**:
```bash
az sql db show-connection-string \
  --client ado.net \
  --server journi-sql-server \
  --name journi-db
```

5. **Update Environment Variable**:
Update `DATABASE_URL` in your App Service configuration with the SQL connection string.

6. **Run Migrations**:
```bash
# Set DATABASE_URL locally to production database
export DATABASE_URL="sqlserver://journi-sql-server.database.windows.net:1433;database=journi-db;user=journiadmin;password=YourSecurePassword123!;encrypt=true"

# Run migration
npx prisma migrate deploy
```

## CI/CD with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        DATABASE_URL: ${{ secrets.DATABASE_URL }}

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: journi-app
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

## Monitoring & Logs

### View Logs
```bash
az webapp log tail \
  --resource-group journi-rg \
  --name journi-app
```

### Enable Application Insights
```bash
az monitor app-insights component create \
  --app journi-insights \
  --location eastus \
  --resource-group journi-rg
```

## Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version matches (18+)
2. **Database Connection**: Verify firewall rules allow Azure services
3. **Environment Variables**: Ensure all required vars are set in Azure
4. **Prisma Errors**: Run migrations after database setup

### Health Check

After deployment, verify:
- Homepage loads: `https://journi-app.azurewebsites.net`
- API health: `https://journi-app.azurewebsites.net/api/health`
- Database connection works

## Costs Estimate (Monthly)

- App Service (B1): ~$13
- Azure SQL (S0): ~$15
- Application Insights: ~$2.30 (first 5GB free)
- **Total**: ~$30/month

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Set secure environment variables
- [ ] Configure CORS if needed
- [ ] Enable Azure AD authentication (optional)
- [ ] Set up backup schedule for database
- [ ] Configure rate limiting
- [ ] Review firewall rules

## Support

For deployment issues, check:
- Azure App Service logs
- GitHub Actions logs (if using CI/CD)
- Prisma migration status
