!include "LogicLib.nsh"

!macro WritePrerequisiteLog message
  FileOpen $2 "$INSTDIR\install-prerequisites.log" a
  FileSeek $2 0 END
  FileWrite $2 "${message}$\r$\n"
  FileClose $2
!macroend

!macro customInstall
  ReadEnvStr $0 "PROCESSOR_ARCHITEW6432"
  ${If} $0 == ""
    ReadEnvStr $0 "PROCESSOR_ARCHITECTURE"
  ${EndIf}

  ${If} $0 == "ARM64"
    ${If} ${FileExists} "$INSTDIR\resources\vc_redist.arm64.exe"
      ExecWait '"$INSTDIR\resources\vc_redist.arm64.exe" /install /quiet /norestart' $1
    ${Else}
      StrCpy $1 "MISSING"
    ${EndIf}
  ${Else}
    ${If} ${FileExists} "$INSTDIR\resources\vc_redist.x64.exe"
      ExecWait '"$INSTDIR\resources\vc_redist.x64.exe" /install /quiet /norestart' $1
    ${Else}
      StrCpy $1 "MISSING"
    ${EndIf}
  ${EndIf}

  ${If} "$1" == "0"
    DetailPrint "VC++ Redistributable installed."
    !insertmacro WritePrerequisiteLog "VC++ Redistributable installed."
  ${ElseIf} "$1" == "1638"
    DetailPrint "VC++ Redistributable is already installed."
    !insertmacro WritePrerequisiteLog "VC++ Redistributable is already installed."
  ${ElseIf} "$1" == "3010"
    DetailPrint "VC++ Redistributable installed. Reboot is required."
    !insertmacro WritePrerequisiteLog "VC++ Redistributable installed. Reboot is required."
  ${ElseIf} "$1" == "MISSING"
    DetailPrint "VC++ Redistributable was not bundled with the installer. Skipping this step."
    !insertmacro WritePrerequisiteLog "VC++ Redistributable payload missing. Skipped."
  ${Else}
    DetailPrint "VC++ Redistributable installation returned code $1. Continuing installation."
    !insertmacro WritePrerequisiteLog "VC++ Redistributable returned code $1. Installation continued."
    MessageBox MB_ICONEXCLAMATION|MB_OK "Microsoft Visual C++ Redistributable installation returned code $1. ITArmyKit will still be installed. If the app does not start, install the Microsoft Visual C++ Redistributable manually and try again."
  ${EndIf}
!macroend
