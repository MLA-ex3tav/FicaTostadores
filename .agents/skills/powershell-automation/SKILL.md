---
name: powershell-automation
description: Use when writing, running or debugging PowerShell scripts and terminal automation on Windows in this environment (PowerShell 5.1). Covers quoting rules, command chaining, file operations, and Windows-specific gotchas. Triggers: powershell, script de automatización, automatizar, batch, windows task scheduler.
---

# PowerShell Automation (Windows)

Entorno: Windows, PowerShell 5.1 (no pwsh 7). Todas las reglas aplican a scripts `.ps1` y a comandos sueltos.

## Reglas de la shell

- `&&` / `||` NO existen en PowerShell 5.1. Encadenar con `;` (no importa el resultado) o `cmd1; if ($?) { cmd2 }` (solo si el primero tuvo éxito).
- NO usar saltos de línea para separar comandos (salvo dentro de strings entre comillas).
- Preferir cmdlets completos (`Get-ChildItem`, `Set-Content`, `Remove-Item`, `New-Item`) sobre alias (`ls`, `cd`, `del`).
- Usar comillas dobles para interpolar (`"ruta $var"`), simples para texto literal (`'C:\ruta fija'`).
- Para ejecutar un exe cuya ruta tiene espacios: operador de llamada `& "C:\Program Files\App\app.exe" args`.
- Escapar caracteres especiales con backtick (`` ` ``): `"$"`, comillas internas, `&`, `|`, `<`, `>`.
- Evitar `cd` dentro del comando: usar el parámetro `workdir` de la herramienta.

## Trabajo con archivos

- Antes de crear directorios/archivos: `Test-Path -LiteralPath <padre>` para verificar que el padre existe.
- Rutas con espacios: siempre con comillas y `-LiteralPath` cuando haya caracteres especiales o llaves `[]`.
- Preferir las herramientas dedicadas (Read/Write/Edit/Glob/Grep) para operaciones de archivos; PowerShell solo cuando es realmente necesario.
- Para salida de scripts: `Write-Output`; nunca `Write-Host` salvo logging deliberado.
- Invoke-WebRequest: usar `-UseBasicParsing` (PowerShell 5.1 no trae el motor DOM en algunos contextos) y `-TimeoutSec`.

## Automatizaciones comunes

- Descargar CSS/HTML compilado de un dev server para auditar clases:
  ```powershell
  $html = (Invoke-WebRequest -Uri 'http://localhost:3000/pagina' -UseBasicParsing).Content
  $link = [regex]::Match($html, 'href="([^"]*\.css[^"]*)"').Groups[1].Value
  $css = (Invoke-WebRequest -Uri ("http://localhost:3000" + $link) -UseBasicParsing).Content
  $css -match '\.h-12'   # buscar reglas de clase
  ```
- Probar varias páginas HTTP 200:
  ```powershell
  foreach ($u in $urls) { try { (Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20).StatusCode } catch { "ERR $u" } }
  ```
- Verificación de código del proyecto web: `npx tsc --noEmit`, `npx next build` (siempre con `workdir` del proyecto).

## Pitfalls de Windows

- `$env:USERPROFILE` para el home del usuario (`C:\Users\<usuario>`); `~` a veces no se expande en cmdlets nativos.
- Nombres de archivo con `[]` rompen los cmdlets antiguos sin `-LiteralPath` (patterns glob).
- Encoding: `Set-Content -Encoding UTF8` para evitar mojibake; PowerShell 5.1 `Out-File` por defecto es UTF-16.
- Las URLs de chunk de Next dev llevan `%5B...%5D` (corchetes codificados): no decodificar al hacer peticiones.
