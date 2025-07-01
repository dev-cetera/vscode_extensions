# VS Code Extensions for Productivity

Extensions for Visual Studio Code to boost productivity.

## Developer

### Installing dependencies

```zsh
rm -rf node_modules
npm install
npm install -g vsce
```

### Logging in to vsce

```zsh
vsce login robmllze
```

### Packaging

```zsh
cd extensions/XXX
npm install -g vsce
vsce package
```

### Managing personal access tokens

See: https://dev.azure.com/robmllze/_usersSettings/tokens
