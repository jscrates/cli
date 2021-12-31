# JSCrates CLI

Official CLI client for JSCrates

> :alembic: _This project is still in development and we need your feedback to improve upon._

## How to try out the early preview?

### NPM

```bash
npm i https://github.com/jscrates/cli -g
jscrates -v
```

### Docker

> Note: Prebuilt Docker images will be available soon.

#### Building the Docker image

```bash
git clone https://github.com/jscrates/cli
cd cli
docker build -t jscrates-cli:latest .
```

#### Running the Docker image

Before you can run the image, create a directory where the CLI can store its config.

```bash
mkdir $HOME/.jscrates
```

Now you can run the image.

```bash
docker run -e HOME=/tmp -v $HOME/.jscrates/docker:/tmp/.jscrates -it --rm jscrates-cli:latest
```

---

## Commands

1. `unload`

#### Description

Downloads the specified package(s) from official repository of JSCrates.

#### Usage

```bash
jscrates unload <packages>
```

### Example

```bash
jscrates unload physics bodmas@1.0.0
jscrates unload @jscrates/cli @jscrates/unload@1.0.0
```

2. `publish`

#### Description

Have a package that you want to share with the world? This command will help you publish any JSCrates project and make it available for anyone to use it.

#### Usage

This command requires you to set or open the terminal in your project directory.

```bash
jscrates publish
```

---

## Feedback

Found a bug or application not working as expected?
Please file an [issue](https://github.com/jscrates/cli/issues/new)

---

Team JSCrates (c) 2021
