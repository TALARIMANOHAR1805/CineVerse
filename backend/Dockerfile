# ── Stage 1: Build ─────────────────────────────────────────
# Use Maven + JDK 21 to compile and package the app
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first — Docker caches dependency layer if pom unchanged
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the fat JAR
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Runtime ───────────────────────────────────────
# Use slim JRE-only image (smaller than full JDK)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy only the JAR from build stage (keeps image small)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
