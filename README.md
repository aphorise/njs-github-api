# `node.js` github-api using ```npm``` `github`

This sample was devised for a specific use-case of [vigour.io](http://vigour.io). The intent is to extrapolate all `repositories` that have a `#develop` *__branch__* containting *__`package.json`__* with a specific JSON structure / path such as:

`package.json` on `#develop` branch:
```
{
    "vigour":
    {
        "category": "services"
        ...
    }
    ...
}
```

These are then logged to the screen eg:
```
vigour-ferry <-- HAS: .vigour.category == services - IN package.json
```

For additional / related usage & documentaion see:
- [Node.js GitHub NPM] 
- [GitHub API] Specifics
---
### Version
0.0.1

 [Node.js GitHub NPM]: <http://mikedeboer.github.io/node-github/#repos.prototype.getContent>
 [GitHub API]: <https://developer.github.com/v3/>
