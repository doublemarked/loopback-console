# loopback-console
A command-line tool for Loopback app debugging and administration.

<a href="https://asciinema.org/a/26662" target="_blank"><img src="https://asciinema.org/a/26662.png" width="626"/></a>

The loopback-console is a command-line tool for interacting with your <a href="http://loopback.io" target="_blank">Loopback</a> app. It works like the built-in
Node REPL, but provides a handful of features that are helpful when debugging or generally
working within your app's environment. Features include,

- Easy availability of your app's models and important handles. See [Available Handles](#available-handles)
- Automatic promise resolution, for intuitive access to Loopback ORM responses.

# Installation

The console can be used easily by just installing it and running its binary:

```
   npm install loopback-console --save
   $(npm bin)/loopback-console
```

Assuming you install it within your project, the default setup will detect your project's location
and bootstrap your app based on your current working directory. if you'd instead like to load a specific app in the console, execute it with a path to the app's main script:

```
   loopback-console [path/to/server/server.js]
```

The recommended configuration is to add the console to your `package.json` scripts, as follows:

```
  "scripts": {
    "console": "loopback-console"
  }
```

Once added you may launch the console by running,

```
   npm run console
```

## Examples

The loopback-console makes it easy to work with your Loopback models.

```Javascript
loopback > .models
User, AccessToken, ACL, RoleMapping, Role, Widget
loopback > Widget.count()
0
loopback > Object.keys(Widget.definition.properties)
[ 'name', 'description', 'created', 'id' ]
loopback > w = Widget.create({ name: 'myWidget01', description: 'My new Widget'})
{ name: 'myWidget01', description: 'My new Widget', id: 1 }
loopback > Widget.count()
1
loopback > w.name='super-widget';
'super-widget'
loopback > w.save()
{ name: 'super-widget', description: 'My new Widget' }
loopback > Widget.find()
[ { name: 'super-widget', description: 'My new Widget', id: 1 } ]
```

## Available Handles

By default the loopback-console provides a few handles designed to make it easier
to work with your project,

- Models: All of your app's Loopback models are available directly. For example, `User`. Type `.models` to see a list.
- `app`: The Loopback app handle.
- `cb`: <a href="https://github.com/GovRight/loopback-console/blob/master/repl.js#L29-L34" target="_blank">A simplified callback function</a> that,
    - Has signature `function (err, result)`
    - Stores results on the REPL's `result` handle.
    - Prints errors with `console.error` and results with `console.log`
- `result`: The storage target of the `cb` function

## Advanced Setup

In some cases you may want to perform operations each time the console loads
to better integrate it with your app's environment.

To integrate loopback-console with your app the following additions must be made
to your app's `server/server.js` file,

1. Include the library: `const LoopbackConsole = require('loopback-console');`
2. Integrate it with server execution:
```
// LoopbackConsole.activated() checks whether the conditions are right to launch
// the console instead of the web server. The console can be activated by passing
// the argument --console or by setting env-var LOOPBACK_CONSOLE=1
if (LoopbackConsole.activated()) {
  LoopbackConsole.start(app, {
    prompt: "my-app # ",
    // Other REPL or loopback-console config
  });
} else if (require.main === module) {
  app.start();
}
```

### Configuration

By integrating the loopback-console you also gain the ability to configure its functionality.
The following configuration directives are supported,

- `quiet`: Suppresses the help text on startup and the automatic printing of `result`.
- `historyPath`: The path to a file to persist command history. Use an empty string (`''`) to disable history.
- All built-in configuration options for <a href="https://nodejs.org/api/repl.html" target="_blank">Node.js REPL</a>, such as `prompt`.
- `handles`: Disable any default handles, or pass additional handles that you would like available on the console.

Note, command history path can also be configured with the env-var `LOOPBACK_CONSOLE_HISTORY`.

## Contributors

- Heath Morrison (<a href="https://github.com/doublemarked" target="_blank">doublemarked</a>)

Special thanks to the following people for their testing and feedback,

- Pulkit Singhal (<a href="https://github.com/pulkitsinghal" target="_blank">pulkitsinghal</a>)

## License

loopback-console uses the MIT license. See [LICENSE](https://github.com/doublemarked/loopback-console/blob/master/LICENSE) for more details.
