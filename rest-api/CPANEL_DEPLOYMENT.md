# SHAREIDE REST API - cPanel Deployment Guide

## Step 1: cPanel Mein Database Banao

1. **cPanel Login** karein
2. **MySQL Databases** section mein jao
3. **New Database** banao: `shareide_db`
4. **New User** banao: `shareide_user` (strong password rakho)
5. **User ko Database** se link karo - ALL PRIVILEGES do

## Step 2: Subdomain Setup (api.shareide.com)

1. **cPanel → Subdomains** mein jao
2. **New Subdomain** banao: `api`
3. **Document Root** set karo: `/public_html/api` ya `/api`

## Step 3: Files Upload Karo

### Option A: ZIP Upload (Recommended)
1. Local machine pe `rest-api` folder ko ZIP karo
2. cPanel **File Manager** mein jao
3. `api` subdomain folder mein upload karo
4. **Extract** karo

### Option B: FTP Upload
1. FileZilla ya koi FTP client use karo
2. cPanel se FTP credentials lo
3. Saari files upload karo

## Step 4: .env File Configure Karo

1. **File Manager** mein `.env.production` file copy karo
2. Rename karke `.env` banao
3. **Edit** karke yeh values change karo:

```env
# Database - cPanel se mili credentials
DB_DATABASE=cpanelusername_shareide_db
DB_USERNAME=cpanelusername_shareide_user
DB_PASSWORD=your_actual_password

# Twilio (WhatsApp OTP ke liye)
TWILIO_SID=your_actual_sid
TWILIO_AUTH_TOKEN=your_actual_token

# Gmail (Emails ke liye)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

## Step 5: Document Root Point Karo

### Method 1: cPanel Subdomain Settings
- Document Root: `/home/username/api/public`

### Method 2: .htaccess (Main folder mein)
Agar direct folder point nahi ho raha, toh main `api` folder mein .htaccess banao:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

## Step 6: Permissions Set Karo

SSH ya File Manager se:

```bash
# Storage folder writable banao
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Owner set karo (cPanel user)
chown -R username:username storage
chown -R username:username bootstrap/cache
```

## Step 7: Terminal Commands (SSH ya cPanel Terminal)

```bash
# Project folder mein jao
cd /home/username/api

# Composer install (production mode)
composer install --no-dev --optimize-autoloader

# Storage link banao
php artisan storage:link

# Cache clear karo
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Database tables banao
php artisan migrate --force

# Seeders run karo (optional - initial data)
php artisan db:seed --force

# Production optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Step 8: Cron Job Setup (Optional)

cPanel → Cron Jobs:

```
* * * * * cd /home/username/api && php artisan schedule:run >> /dev/null 2>&1
```

## Step 9: SSL Certificate

1. **cPanel → SSL/TLS** ya **AutoSSL** mein jao
2. `api.shareide.com` ke liye SSL enable karo
3. HTTPS redirect enable karo

## Step 10: Test Karo

Browser mein check karo:
```
https://api.shareide.com/api/ping
```

Response aana chahiye:
```json
{"status": "ok", "message": "SHAREIDE API is running"}
```

---

## Troubleshooting

### Error: 500 Internal Server Error
1. `storage/logs/laravel.log` check karo
2. Permissions verify karo
3. `.env` file exists check karo

### Error: Database Connection Failed
1. Database credentials verify karo
2. cPanel mein user permissions check karo
3. DB_HOST=localhost hona chahiye

### Error: Class Not Found
```bash
composer dump-autoload
php artisan config:cache
```

### Storage Permission Error
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

---

## Important URLs

- **API Base**: `https://api.shareide.com/api`
- **Health Check**: `https://api.shareide.com/api/ping`
- **Payment Callback**: `https://api.shareide.com/api/payment/callback`

---

## Files NOT to Upload

- `node_modules/` folder (agar ho)
- `.env` (production wali banao server pe)
- `tests/` folder (optional, skip kar sakte ho)
- `.git/` folder

---

## Support

Issues ke liye contact karein: admin@shareide.com
