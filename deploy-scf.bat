@echo off
chcp 65001 >nul
echo ==========================================
echo   股市早报机器人 - SCF 部署打包
echo ==========================================
echo.

set ZIP_NAME=scf-deploy.zip

echo [1/3] 安装依赖...
call npm.cmd install --production
if %ERRORLEVEL% NEQ 0 (
    echo 依赖安装失败！
    exit /b 1
)

echo.
echo [2/3] 打包项目文件...
del %ZIP_NAME% 2>nul
powershell -Command "Compress-Archive -Path node_modules,src,a_stock.js,us_stock.js,package.json -DestinationPath %ZIP_NAME% -Force"
if %ERRORLEVEL% NEQ 0 (
    echo 打包失败！
    exit /b 1
)

echo.
echo [3/3] 完成！
echo.
echo 打包文件: %ZIP_NAME%
echo 文件大小:
for %%A in (%ZIP_NAME%) do echo   %%~zA bytes
echo.
echo ==========================================
echo   下一步: 在腾讯云 SCF 控制台操作
echo ==========================================
echo.
echo 1. 打开 https://console.cloud.tencent.com/scf
echo 2. 新建两个云函数:
echo    - WeChatTradeBot-AStock (A股收盘推送)
echo    - WeChatTradeBot-USStock (美股行情推送)
echo 3. 上传 %ZIP_NAME% 到每个函数
echo 4. 配置环境变量 (详见 README.md)
echo 5. 设置定时触发器
echo.
pause