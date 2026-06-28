@echo off
title Menjalankan WhatsBiz UMKM Server
color 0A

echo ========================================================
echo        MEMULAI SERVER WHATSBIZ UMKM (LOKAL)
echo ========================================================
echo.
echo Pastikan komputer Anda terhubung ke internet untuk 
echo mengakses database cloud (Neon).
echo.

echo [1/2] Menjalankan Backend Server (Port 3001)...
start "WhatsBiz Backend" cmd /k "npm run backend"

echo [2/2] Menjalankan Frontend Server (Port 3000)...
start "WhatsBiz Frontend" cmd /k "npm run frontend"

echo.
echo ========================================================
echo SERVER BERHASIL DIJALANKAN!
echo ========================================================
echo Buka aplikasi di HP Android Anda.
echo Jika ingin mematikan server, cukup tutup kedua jendela 
echo hitam (cmd) yang baru saja terbuka.
echo.
pause
