param(
  [string]$ProjectName = "app-reflex-02"
)

$ErrorActionPreference = "Stop"

function Read-SecretPlainText([string]$Prompt) {
  $secure = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Invoke-Vercel([string[]]$Arguments) {
  & npx vercel@latest @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar Vercel CLI: $($Arguments -join ' ')"
  }
}

function Set-VercelEnv([string]$Name, [string]$Value, [string]$Target, [string]$Token) {
  $Value | & npx vercel@latest env add $Name $Target --token $Token --yes
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao configurar a variavel $Name em $Target."
  }
}

Write-Host ""
Write-Host "Reflex 02 - Preparacao e deploy Vercel" -ForegroundColor Cyan
Write-Host "Nenhum segredo sera gravado em arquivo ou no Git." -ForegroundColor DarkGray
Write-Host ""

if (-not (Test-Path "package.json")) {
  throw "Execute este script na raiz do repositorio App-Reflex-02."
}

$gitRemote = (& git remote get-url origin 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $gitRemote) {
  throw "Repositorio Git sem remote origin configurado."
}

if ($gitRemote -notmatch "villacanabrava-maker/App-Reflex-02") {
  throw "Este diretorio nao parece ser o repositorio canonico villacanabrava-maker/App-Reflex-02."
}

$vercelToken = Read-SecretPlainText "Cole o Vercel token"
$supabaseSecret = Read-SecretPlainText "Cole a SUPABASE_SECRET_KEY do projeto App Reflex 02"
$openAiKey = Read-SecretPlainText "Cole a OPENAI_API_KEY"

$supabaseUrl = "https://xenapowdtfhdwcfthfrn.supabase.co"
$supabasePublishableKey = "sb_publishable_6zpcIpceFQ2ygpjztBQTnw_DIFo0ocd"

Write-Host ""
Write-Host "1/5 Criando ou localizando o projeto Vercel..." -ForegroundColor Cyan
& npx vercel@latest project add $ProjectName --token $vercelToken --yes
if ($LASTEXITCODE -ne 0) {
  Write-Host "O projeto pode ja existir; tentando vincular..." -ForegroundColor Yellow
}

Write-Host "2/5 Vinculando o diretorio local..." -ForegroundColor Cyan
Invoke-Vercel @("link", "--yes", "--project", $ProjectName, "--token", $vercelToken)

Write-Host "3/5 Conectando o GitHub ao projeto Vercel..." -ForegroundColor Cyan
& npx vercel@latest git connect --yes --token $vercelToken
if ($LASTEXITCODE -ne 0) {
  Write-Host "Nao foi possivel conectar o Git automaticamente. O deploy direto ainda pode prosseguir." -ForegroundColor Yellow
}

Write-Host "4/5 Configurando variaveis de ambiente..." -ForegroundColor Cyan
$targets = @("production", "preview", "development")
$envs = @{
  "NEXT_PUBLIC_SUPABASE_URL" = $supabaseUrl
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" = $supabasePublishableKey
  "SUPABASE_URL" = $supabaseUrl
  "SUPABASE_SECRET_KEY" = $supabaseSecret
  "OPENAI_API_KEY" = $openAiKey
  "FEATURE_COGNITIVE_V31_RETRIEVAL" = "off"
  "FEATURE_COGNITIVE_V31_DOSSIER" = "off"
  "FEATURE_COGNITIVE_V31_AUDITOR" = "off"
  "FEATURE_COGNITIVE_V31_ABSTENTION" = "off"
  "FEATURE_LEGACY_BRAIN_ANALYZER" = "off"
}

foreach ($target in $targets) {
  foreach ($name in $envs.Keys) {
    Set-VercelEnv -Name $name -Value $envs[$name] -Target $target -Token $vercelToken
  }
}

Write-Host "5/5 Executando deploy de producao para teste..." -ForegroundColor Cyan
Invoke-Vercel @("--prod", "--token", $vercelToken, "--yes")

Write-Host ""
Write-Host "Deploy concluido." -ForegroundColor Green
Write-Host "Abra a URL mostrada acima, escolha Criar Conta e cadastre seu novo e-mail/senha." -ForegroundColor Green
Write-Host "Depois do teste, rotacione os tokens/chaves que foram compartilhados em chat." -ForegroundColor Yellow
