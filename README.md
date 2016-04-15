# diet-static-middleware
[![npm version](https://img.shields.io/npm/v/diet-static-middleware.svg)](https://npmjs.com/package/diet-static-middleware)
[![npm downloads](https://img.shields.io/npm/dm/diet-static-middleware.svg)](https://npmjs.com/package/diet-static-middleware)
[![dependencies](https://david-dm.org/UndefinedLab/diet-static-middleware.svg)](https://david-dm.org/UndefinedLab/diet-static-middleware)
[![license](https://img.shields.io/npm/l/diet-static-middleware.svg)](https://github.com/UndefinedLab/diet-static-middleware/blob/master/LICENSE)

A middleware to serve static content for Diet.js.
It can serve all kinds of files and be used as a CDN solution. Works entirely using streams, and doesn't blow your RAM. Caching and 'powered by' headers can be configured using options.

## **Install**
```
npm install diet-static-middleware
```

## **Usage**

```js
'use strict';

const server = require('diet');
const app = server().listen(8000);

const static = require('diet-static-middleware')({
path: app.path + '/path/to/your/static/folder'
});

app.footer(static);
```

## **Options**
User options, that configure `diet-static-middleware`.
```js
require('diet-static-middleware')({
    path: app.path+'/path/to/your/static/folder', // path to folder where you store files
    	cache: 'public', // type of cache. May be public or private
    	expires: 604800000, // expires time
    	powered: 'ASP.NET', // powered by (for security)
    	server: 'Microsoft-IIS/7.5' // server (for security)
})
```

## **Finally**
Every route associated with file on storage

```js
// http://localhost:8000/nation.json		--> `/path/to/your/static/folder/favicon.json`
// http://localhost:8000/favicon.ico		--> `/path/to/your/static/folder/favicon.ico`
// http://localhost:8000/android/app-realise.apk	--> `/path/to/your/static/folder/android/app-realise.apk`
// http://localhost:8000/styles/global.css	--> `/path/to/your/static/folder/styles/global.css`
// http://localhost:8000/company/logo.png	--> `/path/to/your/static/folder/company/logo.png`
```

## **License**

(The MIT License)

Copyright (c) 2016 Alexander Dadukin & Andrey Pavlov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.