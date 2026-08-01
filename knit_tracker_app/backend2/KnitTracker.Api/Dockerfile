# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["KnitTracker.Api.csproj", "./"]
RUN dotnet restore "KnitTracker.Api.csproj"

COPY . .
RUN dotnet publish "KnitTracker.Api.csproj" \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Cloud Run's default container port
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "KnitTracker.Api.dll"]