@REM Maven Wrapper for Windows — CineVerse
@echo off
setlocal

if defined JAVA_HOME (
  set "JAVACMD=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVACMD=java.exe"
)

"%JAVACMD%" ^
  -classpath ".mvn\wrapper\maven-wrapper.jar" ^
  "-Dmaven.multiModuleProjectDirectory=%CD%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*
