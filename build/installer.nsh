; PRSM Installer — Desktop client for OpenClaw

!macro customHeader
  BrandingText "PRSM by RSM Consulting"
!macroend

; Override electron-builder's built-in app-running check.
; Uses the nsProcess plugin (bundled with electron-builder's NSIS).
!macro customCheckAppRunning
  ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
  ${if} $R0 == 0
    ${nsProcess::CloseProcess} "${APP_EXECUTABLE_FILENAME}" $R0
    Sleep 3000
    ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
    ${if} $R0 == 0
      ${nsProcess::KillProcess} "${APP_EXECUTABLE_FILENAME}" $R0
      Sleep 2000
    ${endif}
  ${endif}
  ${nsProcess::Unload}
!macroend

; Remove the old uninstaller registry entry so installSection's
; uninstallOldVersion function returns early without executing
; the previously-installed uninstaller (which has a broken
; PowerShell-based app-running check that false-positives).
; The new installer will overwrite all files and re-register itself.
!macro customInit
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
!macroend

!macro customInstall
  CreateShortCut "$DESKTOP\PRSM.lnk" "$INSTDIR\PRSM.exe" "" "$INSTDIR\PRSM.exe" 0
!macroend

!macro customUnInstall
  ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
  ${if} $R0 == 0
    ${nsProcess::KillProcess} "${APP_EXECUTABLE_FILENAME}" $R0
    Sleep 1000
  ${endif}
  ${nsProcess::Unload}
  Delete "$DESKTOP\PRSM.lnk"
!macroend
