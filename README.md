# StripsCompression

## Abstract

Academic project to illustrate the topologic compression (lossless) principle.
Instead of describe a mesh triangle by triangle, common sides are aggregated in strips.
Despite its naive implementation, compression rate could reach up to 40% on simple meshes.

To illustrate those strips, a "toy web-interface" can vizualize this mesh-cutting, animating strips construction.
Strips animation uses WebGL, modules are written in javascript (ES5) so you only require a WebGL-friendly browser (Chrome, Opera, FF, ..., !IE) to launch a demo !

## Test

### Get the code

```bash
git clone https://github.com/theplatypus/StripsCompression.git
cd ./StripsCompression
```

### HTTP Server

To access interface without file access issues, you need to serve it through a HTTP server.
There are many ways to do it, for example : 

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

# or the way you are able to run a HTTP server on port 8000 :)
```

### WebApp

Go to the following address with your favorite browser (except in the case it is IE < 11 ahah)

```
http://127.0.0.1:8000/demo/index.html
```

And you will get the following toy application. (./DATA/cat.obj example)

![screenshot](https://raw.githubusercontent.com/theplatypus/StripsCompression/master/demo/screen.png)

## More about topologic compression...


## Credits

### misc folder

The files contained in the 'misc' folder are not from my own work.
All credits go to their respective authors, linked below :

- frenchtoast747 for [webgl-obj-loader](https://github.com/frenchtoast747/webgl-obj-loader)
- (unknown author) for [glutils](https://gist.github.com/zdxerr/1261307#file-glutils-js)
- James Coglan for [sylvester](https://github.com/jcoglan/sylvester)

### lib folder

The files contained in the 'lib' folder are from my work.
As the misc libraries, I provide them under the MIT License, so feel free to do whatever you want with it... and fork it !
