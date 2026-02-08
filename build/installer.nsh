; ClawControlRSM Custom Installer Script
; Modern, branded NSIS installer

!macro customHeader
  ; Branding text at bottom of installer
  BrandingText "ClawControlRSM — OpenClaw Desktop Client"
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to ClawControlRSM"
  !define MUI_WELCOMEPAGE_TEXT "ClawControlRSM is your desktop client for OpenClaw.$\r$\n$\r$\nFeatures:$\r$\n  • Real-time chat with your AI assistant$\r$\n  • Image sharing with auto-compression$\r$\n  • Multi-channel conversation view$\r$\n  • Session management & agent controls$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customInstall
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\ClawControlRSM.lnk" "$INSTDIR\ClawControlRSM.exe" "" "$INSTDIR\ClawControlRSM.exe" 0

  ; Create Start Menu folder
  CreateDirectory "$SMPROGRAMS\ClawControlRSM"
  CreateShortCut "$SMPROGRAMS\ClawControlRSM\ClawControlRSM.lnk" "$INSTDIR\ClawControlRSM.exe" "" "$INSTDIR\ClawControlRSM.exe" 0
  CreateShortCut "$SMPROGRAMS\ClawControlRSM\Uninstall.lnk" "$INSTDIR\Uninstall ClawControlRSM.exe"
!macroend

!macro customUnInstall
  ; Remove desktop shortcut
  Delete "$DESKTOP\ClawControlRSM.lnk"

  ; Remove Start Menu items
  Delete "$SMPROGRAMS\ClawControlRSM\ClawControlRSM.lnk"
  Delete "$SMPROGRAMS\ClawControlRSM\Uninstall.lnk"
  RMDir "$SMPROGRAMS\ClawControlRSM"
!macroend
