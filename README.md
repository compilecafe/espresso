# espresso

espresso is a multi-purpose Discord bot made by the [Compile Café](https://discord.gg/ExCvJtVTu6) community.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/compilecafe/espresso.git
cd espresso
```

### 2. Copy environment file

```bash
cp .env.example .env
```

Then, edit `.env` and fill in the required values.

### 3. Run the bot

#### Using Docker (recommended)

```bash
docker compose up --build -d
```

#### Without Docker

First install dependencies:

```bash
bun install
```

Then start the bot:

```bash
bun start
```

## Contributing

We welcome contributions from anyone! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
