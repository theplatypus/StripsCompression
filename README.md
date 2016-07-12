# StripsCompression

## Abstract

Academic project to illustrate the topologic compression (lossless) principle.
Instead of describe a mesh triangle by triangle, common sides are aggregated in strips.
Despite its naive implementation, compression rate could reach about 40% on simple meshes.

To illustrate those strips, a "toy web-interface" can vizualize this mesh-cutting, animating strips construction.
Strips animation uses WebGL, modules are written in javascript so you only require a WebGL-friendly browser (Chrome, Opera, FF, ..., !IE) to launch a demo !

## Test 

### Get the code

```bash
git clone https://github.com/theplatypus/StripsCompression.git
cd ./StripsCompression
```

### HTTP Server

To access interface without file access issues, you need to serve it through a HTTP server.
There are many ways to do it, including : 

```bash
# python 2.7
python -m SimpleHTTPServer

# python 3.x
python -m http.server

# node.js & npm
npm install http-server -g
http-server -p 8000

# or more simply...
npm install
npm test
```

### WebApp

Go to the following address with your favorite browser (except in the case it is IE < 11 obviously)

```
http://127.0.0.1:8000/demo/index.html
```

And you will get the toy application.



## More about topologic compression...


## Credits

