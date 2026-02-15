FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json .
COPY bun.lock .
RUN bun install

COPY . .

FROM oven/bun:slim
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["bun", "run", "start"]
