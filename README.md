# VS Code Extensions for Productivity

Extensions for Visual Studio Code to boost productivity.

Published here: https://marketplace.visualstudio.com/publishers/Dev-Cetera

## Developer Notes

### Installing dependencies

```zsh
rm -rf node_modules
npm install
npm install -g vsce
```

### Publishing

Obtain a Personal Access Token here: https://dev.azure.com/dev-cetera/_usersSettings/tokens.

```zsh
vsce login dev-cetera
vsce publish
```

### Packaging

```zsh
cd extensions/XXX
npm install -g vsce
vsce package
```

### Managing personal access tokens

See: https://dev.azure.com/dev-cetera/_usersSettings/tokens
