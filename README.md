# news.js
A npm package that fetches latest news from msn.

## Installation
```bash
$ npm i news.js
```

## Usage
```js
const news = require("news.js");

// basic current news
news().then(response => {
    console.log(response);
});

// change news topic and/or market
news({
    market: "en-GB",
    vertical: "sports" 
}).then(response => {
    console.log(response);
});
```
