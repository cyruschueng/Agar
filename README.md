# Agar

## Installation

1. First make sure you have [Node.js](https://nodejs.org/) installed.
2. Install dependencies

    ```bash
    npm install
    ```

3. Optional: Note that if you want to take screenshots you'll need to install `cairo` /
   `node-canvas` successfully. If you run into trouble see [these instructions](https://github.com/Automattic/node-canvas/wiki/_pages)
   On OSX with homebrew:

    ```bash
    brew install cairo
    export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig
    npm install
    ```

## Useage

1. Start up the proxy server

    ```bash
    npm start
    ```

2. Visit `http://localhost:8888`. You should be served a modified version of the agar.io client. The game should start playing automatically (initiated by the Agent).

## Contribute

  Fork and pull-requests are welcome. If you do something awesome with this let us know and we'll link to it!

## Overview

Contains some code to interact with the game agar.io.

- AgarBackend
  - Connects to agar
  - Receives messages
  - Parses messages
  - Sends messages (on behalf of controller)

- GameState
  - Holds state of the game
  - Gets messages from backend and updates game state

- Controller
  - Receives high level actions and translates into message to agar backend
  - Note: This is not complete at all.

- Agent
  - Uses game state to make intelligent descision, sends actions to controller
  - Note: This is not complete at all.

- Server
  - Serves index.html
  - Initializes all of the above when a new client connects


## License

The MIT License (MIT)

Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
