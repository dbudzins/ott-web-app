if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,t,i)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const n={uri:location.origin+s.slice(1)};return Promise.all(t.map((s=>{switch(s){case"exports":return r;case"module":return n;default:return e(s)}}))).then((e=>{const s=i(...e);return r.default||(r.default=s),r}))})))}}define("./service-worker.js",["./workbox-f7715658"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"/ott-web-app/css/styles.4bb3b6e90f51a4a01b8d.css",revision:null},{url:"/ott-web-app/js/791.dd84824fc2583810d019.js",revision:null},{url:"/ott-web-app/js/dist/index.ae449880cc354ecb3c04.js",revision:null},{url:"/ott-web-app/js/dist/index.ae449880cc354ecb3c04.js.LICENSE.txt",revision:"b6632312a3be953da62107b37d979bc6"},{url:"/ott-web-app/js/lib-index-09ea300a.29ac4a9b2e430f59bf4c.js",revision:null},{url:"/ott-web-app/js/lib-react-virtualized.8d498666bcd09671e205.js",revision:null},{url:"/ott-web-app/js/lib-yup.fcc9bdb02e896b5262ed.js",revision:null},{url:"/ott-web-app/js/webpack-runtime.03a5708823c1d698f334.js",revision:null}],{})}));
