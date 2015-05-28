# loopback-console
A console of convenience for Loopback API projects

# Usage

There are two ways to use `loopback-console`

## Direct (no config):

This will load the console bound to the specified Loopback app. If no app is specified
it will attempt to use the current working directory.

```
  $(npm bin)/loopback-console [loopback app root]
```

It is recommended that you add this to your package.json scripts as follows,
```
  "scripts": {
    "console": "$(npm bin)/loopback-console ."
  }
```

It can then be executed as `npm run console`.

## Integrated

Integrating the console with your Loopback app gives you the option of configuring
how the console behaves. Make the following additions to `server.js`,

1. Include the library: `var loopbackConsole = require('loopback-console');`
2. Integrate it with server execution:
```
if (loopbackConsole.activated()) {
  loopbackConsole.start(app,
    // loopback-console config
    {
      prompt: "my-app # ",
      // ...
    });
} else if (require.main === module) {
  app.start();
}
```

Execute your app's console by passing your app argument `--console` or setting environment variable `LOOPBACK_CONSOLE=1`. For example,
```
  node . --console
```
