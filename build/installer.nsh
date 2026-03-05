!include "LogicLib.nsh"

!macro customInstall
  ReadEnvStr $0 "PROCESSOR_ARCHITEW6432"
  ${If} $0 == ""
    ReadEnvStr $0 "PROCESSOR_ARCHITECTURE"
  ${EndIf}

  ${If} $0 == "ARM64"
    ExecWait '"$INSTDIR\resources\vc_redist.arm64.exe" /install /quiet /norestart' $1
  ${Else}
    ExecWait '"$INSTDIR\resources\vc_redist.x64.exe" /install /quiet /norestart' $1
  ${EndIf}

  ${If} "$1" == "0"
    DetailPrint "VC++ Redistributable installed."
  ${ElseIf} "$1" == "1638"
    DetailPrint "VC++ Redistributable is already installed."
  ${ElseIf} "$1" == "3010"
    DetailPrint "VC++ Redistributable installed. Reboot is required."
  ${Else}
    MessageBox MB_ICONSTOP|MB_OK "Microsoft Visual C++ Redistributable installation failed with code $1. Application installation will be cancelled."
    Abort
  ${EndIf}
!macroend
