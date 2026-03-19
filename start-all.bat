@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 PatentChain - Quick Start Script
echo ========================================
echo.

echo [1/4] Checking if Hardhat node is already running...
netstat -ano | findstr :8545 >nul
if %errorlevel% == 0 (
    echo    ⚠️  WARNING: Port 8545 is in use. Hardhat node might already be running.
    echo    Press any key to continue anyway, or Ctrl+C to cancel...
    pause >nul
) else (
    echo    ✅ Port 8545 is free. Good!
)
echo.

echo [2/4] Starting Hardhat local blockchain...
echo    📦 Opening in new window. Keep it running!
start "🔷 Hardhat Node" cmd /k "cd backend && npm run node"
timeout /t 5 /nobreak >nul
echo.

echo [3/4] Deploying contracts...
echo    📄 Deploying PatentRegistry...
cd backend
call npm run deploy:local
echo.

echo    💰 Deploying Crowdfunding...
call npm run deploy:crowdfunding
echo.

echo    🎨 Deploying PatentNFT...
call npm run deploy:patent-nft
cd ..
echo.

echo [4/4] Starting Next.js development server...
echo    ⚛️  Opening in new window.
start "⚛️  Next.js Dev Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo   ✅ Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Copy the contract addresses from above and add them to frontend/.env.local:
echo   - NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL=0x...
echo   - NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL=0x...
echo   - NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL=0x...
echo.
echo Then:
echo   1. 🌐 Open http://localhost:3000 in your browser
echo   2. 🦊 Configure MetaMask with Hardhat Localhost (Chain ID: 31337)
echo   3. 🔑 Import a test account from Hardhat node output
echo.
echo Press any key to exit...
pause >nul
