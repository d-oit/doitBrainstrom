@echo off
REM Script to run tests in batches to avoid memory issues

echo Running tests in batches to avoid memory issues...

REM Run utils tests
echo Running batch 1: Utils tests
call npm run test:batch1
if %ERRORLEVEL% neq 0 (
  echo Batch 1 failed
  exit /b 1
)

REM Run hooks tests
echo Running batch 2: Hooks tests
call npm run test:batch2
if %ERRORLEVEL% neq 0 (
  echo Batch 2 failed
  exit /b 1
)

REM Run contexts tests
echo Running batch 3: Contexts tests
call npm run test:batch3
if %ERRORLEVEL% neq 0 (
  echo Batch 3 failed
  exit /b 1
)

REM Run components tests
echo Running batch 4: Components tests
call npm run test:batch4
if %ERRORLEVEL% neq 0 (
  echo Batch 4 failed
  exit /b 1
)

REM Run App tests
echo Running batch 5: App tests
call npm run test:batch5
if %ERRORLEVEL% neq 0 (
  echo Batch 5 failed
  exit /b 1
)

echo All tests passed!
exit /b 0
