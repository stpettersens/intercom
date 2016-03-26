@rem Install Kuzmann Sans font on Windows.
@copy "Kazmann Sans.ttf" "%WINDIR%\Fonts"
@reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" /v "Kazmann Sans (TrueType)" /t REG_SZ /d "Kazmann Sans.ttf" /f
