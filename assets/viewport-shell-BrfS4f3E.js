(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={},g=[],_=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,v=Array.isArray;function y(e,t){for(var n in t)e[n]=t[n];return e}function b(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function x(t,n,r){var i,a,o,s={};for(o in n)o==`key`?i=n[o]:o==`ref`?a=n[o]:s[o]=n[o];if(arguments.length>2&&(s.children=arguments.length>3?e.call(arguments,2):r),typeof t==`function`&&t.defaultProps!=null)for(o in t.defaultProps)s[o]===void 0&&(s[o]=t.defaultProps[o]);return S(t,s,i,a,null)}function S(e,r,i,a,o){var s={type:e,props:r,key:i,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++n,__i:-1,__u:0};return o==null&&t.vnode!=null&&t.vnode(s),s}function C(e){return e.children}function w(e,t){this.props=e,this.context=t}function T(e,t){if(t==null)return e.__?T(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type==`function`?T(e):null}function E(e){if(e.__P&&e.__d){var n=e.__v,r=n.__e,i=[],a=[],o=y({},n);o.__v=n.__v+1,t.vnode&&t.vnode(o),oe(e.__P,o,n,e.__n,e.__P.namespaceURI,32&n.__u?[r]:null,i,r??T(n),!!(32&n.__u),a),o.__v=n.__v,o.__.__k[o.__i]=o,ce(i,o,a),n.__e=n.__=null,o.__e!=r&&D(o)}}function D(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),D(e)}function O(e){(!e.__d&&(e.__d=!0)&&i.push(e)&&!k.__r++||a!=t.debounceRendering)&&((a=t.debounceRendering)||o)(k)}function k(){try{for(var e,t=1;i.length;)i.length>t&&i.sort(s),e=i.shift(),t=i.length,E(e)}finally{i.length=k.__r=0}}function A(e,t,n,r,i,a,o,s,c,l,u){var d,f,p,m,_,v,y,b=r&&r.__k||g,x=t.length;for(c=ee(n,t,b,c,x),d=0;d<x;d++)(p=n.__k[d])!=null&&(f=p.__i!=-1&&b[p.__i]||h,p.__i=d,v=oe(e,p,f,i,a,o,s,c,l,u),m=p.__e,p.ref&&f.ref!=p.ref&&(f.ref&&de(f.ref,null,p),u.push(p.ref,p.__c||m,p)),_==null&&m!=null&&(_=m),(y=!!(4&p.__u))||f.__k===p.__k?(c=te(p,c,e,y),y&&f.__e&&(f.__e=null)):typeof p.type==`function`&&v!==void 0?c=v:m&&(c=m.nextSibling),p.__u&=-7);return n.__e=_,c}function ee(e,t,n,r,i){var a,o,s,c,l,u=n.length,d=u,f=0;for(e.__k=Array(i),a=0;a<i;a++)(o=t[a])!=null&&typeof o!=`boolean`&&typeof o!=`function`?(typeof o==`string`||typeof o==`number`||typeof o==`bigint`||o.constructor==String?o=e.__k[a]=S(null,o,null,null,null):v(o)?o=e.__k[a]=S(C,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=e.__k[a]=S(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):e.__k[a]=o,c=a+f,o.__=e,o.__b=e.__b+1,s=null,(l=o.__i=ne(o,n,c,d))!=-1&&(d--,(s=n[l])&&(s.__u|=2)),s==null||s.__v==null?(l==-1&&(i>u?f--:i<u&&f++),typeof o.type!=`function`&&(o.__u|=4)):l!=c&&(l==c-1?f--:l==c+1?f++:(l>c?f--:f++,o.__u|=4))):e.__k[a]=null;if(d)for(a=0;a<u;a++)(s=n[a])!=null&&!(2&s.__u)&&(s.__e==r&&(r=T(s)),fe(s,s));return r}function te(e,t,n,r){var i,a;if(typeof e.type==`function`){for(i=e.__k,a=0;i&&a<i.length;a++)i[a]&&(i[a].__=e,t=te(i[a],t,n,r));return t}e.__e!=t&&(r&&(t&&e.type&&!t.parentNode&&(t=T(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t&&=t.nextSibling;while(t!=null&&t.nodeType==8);return t}function j(e,t){return t||=[],e==null||typeof e==`boolean`||(v(e)?e.some(function(e){j(e,t)}):t.push(e)),t}function ne(e,t,n,r){var i,a,o,s=e.key,c=e.type,l=t[n],u=l!=null&&(2&l.__u)==0;if(l===null&&s==null||u&&s==l.key&&c==l.type)return n;if(r>+!!u){for(i=n-1,a=n+1;i>=0||a<t.length;)if((l=t[o=i>=0?i--:a++])!=null&&!(2&l.__u)&&s==l.key&&c==l.type)return o}return-1}function re(e,t,n){t[0]==`-`?e.setProperty(t,n??``):e[t]=n==null?``:typeof n!=`number`||_.test(t)?n:n+`px`}function ie(e,t,n,r,i){var a,o;n:if(t==`style`)if(typeof n==`string`)e.style.cssText=n;else{if(typeof r==`string`&&(e.style.cssText=r=``),r)for(t in r)n&&t in n||re(e.style,t,``);if(n)for(t in n)r&&n[t]==r[t]||re(e.style,t,n[t])}else if(t[0]==`o`&&t[1]==`n`)a=t!=(t=t.replace(d,`$1`)),o=t.toLowerCase(),t=o in e||t==`onFocusOut`||t==`onFocusIn`?o.slice(2):t.slice(2),e.l||={},e.l[t+a]=n,n?r?n[u]=r[u]:(n[u]=f,e.addEventListener(t,a?m:p,a)):e.removeEventListener(t,a?m:p,a);else{if(i==`http://www.w3.org/2000/svg`)t=t.replace(/xlink(H|:h)/,`h`).replace(/sName$/,`s`);else if(t!=`width`&&t!=`height`&&t!=`href`&&t!=`list`&&t!=`form`&&t!=`tabIndex`&&t!=`download`&&t!=`rowSpan`&&t!=`colSpan`&&t!=`role`&&t!=`popover`&&t in e)try{e[t]=n??``;break n}catch{}typeof n==`function`||(n==null||!1===n&&t[4]!=`-`?e.removeAttribute(t):e.setAttribute(t,t==`popover`&&n==1?``:n))}}function ae(e){return function(n){if(this.l){var r=this.l[n.type+e];if(n[l]==null)n[l]=f++;else if(n[l]<r[u])return;return r(t.event?t.event(n):n)}}}function oe(e,n,r,i,a,o,s,c,l,u){var d,f,p,m,h,_,x,S,T,E,D,O,k,ee,te,j=n.type;if(n.constructor!==void 0)return null;128&r.__u&&(l=!!(32&r.__u),o=[c=n.__e=r.__e]),(d=t.__b)&&d(n);n:if(typeof j==`function`)try{if(S=n.props,T=j.prototype&&j.prototype.render,E=(d=j.contextType)&&i[d.__c],D=d?E?E.props.value:d.__:i,r.__c?x=(f=n.__c=r.__c).__=f.__E:(T?n.__c=f=new j(S,D):(n.__c=f=new w(S,D),f.constructor=j,f.render=pe),E&&E.sub(f),f.state||={},f.__n=i,p=f.__d=!0,f.__h=[],f._sb=[]),T&&f.__s==null&&(f.__s=f.state),T&&j.getDerivedStateFromProps!=null&&(f.__s==f.state&&(f.__s=y({},f.__s)),y(f.__s,j.getDerivedStateFromProps(S,f.__s))),m=f.props,h=f.state,f.__v=n,p)T&&j.getDerivedStateFromProps==null&&f.componentWillMount!=null&&f.componentWillMount(),T&&f.componentDidMount!=null&&f.__h.push(f.componentDidMount);else{if(T&&j.getDerivedStateFromProps==null&&S!==m&&f.componentWillReceiveProps!=null&&f.componentWillReceiveProps(S,D),n.__v==r.__v||!f.__e&&f.shouldComponentUpdate!=null&&!1===f.shouldComponentUpdate(S,f.__s,D)){n.__v!=r.__v&&(f.props=S,f.state=f.__s,f.__d=!1),n.__e=r.__e,n.__k=r.__k,n.__k.some(function(e){e&&(e.__=n)}),g.push.apply(f.__h,f._sb),f._sb=[],f.__h.length&&s.push(f);break n}f.componentWillUpdate!=null&&f.componentWillUpdate(S,f.__s,D),T&&f.componentDidUpdate!=null&&f.__h.push(function(){f.componentDidUpdate(m,h,_)})}if(f.context=D,f.props=S,f.__P=e,f.__e=!1,O=t.__r,k=0,T)f.state=f.__s,f.__d=!1,O&&O(n),d=f.render(f.props,f.state,f.context),g.push.apply(f.__h,f._sb),f._sb=[];else do f.__d=!1,O&&O(n),d=f.render(f.props,f.state,f.context),f.state=f.__s;while(f.__d&&++k<25);f.state=f.__s,f.getChildContext!=null&&(i=y(y({},i),f.getChildContext())),T&&!p&&f.getSnapshotBeforeUpdate!=null&&(_=f.getSnapshotBeforeUpdate(m,h)),ee=d!=null&&d.type===C&&d.key==null?le(d.props.children):d,c=A(e,v(ee)?ee:[ee],n,r,i,a,o,s,c,l,u),f.base=n.__e,n.__u&=-161,f.__h.length&&s.push(f),x&&(f.__E=f.__=null)}catch(e){if(n.__v=null,l||o!=null)if(e.then){for(n.__u|=l?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;o[o.indexOf(c)]=null,n.__e=c}else{for(te=o.length;te--;)b(o[te]);se(n)}else n.__e=r.__e,n.__k=r.__k,e.then||se(n);t.__e(e,n,r)}else o==null&&n.__v==r.__v?(n.__k=r.__k,n.__e=r.__e):c=n.__e=ue(r.__e,n,r,i,a,o,s,l,u);return(d=t.diffed)&&d(n),128&n.__u?void 0:c}function se(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(se))}function ce(e,n,r){for(var i=0;i<r.length;i++)de(r[i],r[++i],r[++i]);t.__c&&t.__c(n,e),e.some(function(n){try{e=n.__h,n.__h=[],e.some(function(e){e.call(n)})}catch(e){t.__e(e,n.__v)}})}function le(e){return typeof e!=`object`||!e||e.__b>0?e:v(e)?e.map(le):e.constructor===void 0?y({},e):null}function ue(n,r,i,a,o,s,c,l,u){var d,f,p,m,g,_,y,x=i.props||h,S=r.props,C=r.type;if(C==`svg`?o=`http://www.w3.org/2000/svg`:C==`math`?o=`http://www.w3.org/1998/Math/MathML`:o||=`http://www.w3.org/1999/xhtml`,s!=null){for(d=0;d<s.length;d++)if((g=s[d])&&`setAttribute`in g==!!C&&(C?g.localName==C:g.nodeType==3)){n=g,s[d]=null;break}}if(n==null){if(C==null)return document.createTextNode(S);n=document.createElementNS(o,C,S.is&&S),l&&=(t.__m&&t.__m(r,s),!1),s=null}if(C==null)x===S||l&&n.data==S||(n.data=S);else{if(s=C==`textarea`&&S.defaultValue!=null?null:s&&e.call(n.childNodes),!l&&s!=null)for(x={},d=0;d<n.attributes.length;d++)x[(g=n.attributes[d]).name]=g.value;for(d in x)g=x[d],d==`dangerouslySetInnerHTML`?p=g:d==`children`||d in S||d==`value`&&`defaultValue`in S||d==`checked`&&`defaultChecked`in S||ie(n,d,null,g,o);for(d in S)g=S[d],d==`children`?m=g:d==`dangerouslySetInnerHTML`?f=g:d==`value`?_=g:d==`checked`?y=g:l&&typeof g!=`function`||x[d]===g||ie(n,d,g,x[d],o);if(f)l||p&&(f.__html==p.__html||f.__html==n.innerHTML)||(n.innerHTML=f.__html),r.__k=[];else if(p&&(n.innerHTML=``),A(r.type==`template`?n.content:n,v(m)?m:[m],r,i,a,C==`foreignObject`?`http://www.w3.org/1999/xhtml`:o,s,c,s?s[0]:i.__k&&T(i,0),l,u),s!=null)for(d=s.length;d--;)b(s[d]);l&&C!=`textarea`||(d=`value`,C==`progress`&&_==null?n.removeAttribute(`value`):_!=null&&(_!==n[d]||C==`progress`&&!_||C==`option`&&_!=x[d])&&ie(n,d,_,x[d],o),d=`checked`,y!=null&&y!=n[d]&&ie(n,d,y,x[d],o))}return n}function de(e,n,r){try{if(typeof e==`function`){var i=typeof e.__u==`function`;i&&e.__u(),i&&n==null||(e.__u=e(n))}else e.current=n}catch(e){t.__e(e,r)}}function fe(e,n,r){var i,a;if(t.unmount&&t.unmount(e),(i=e.ref)&&(i.current&&i.current!=e.__e||de(i,null,n)),(i=e.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(e){t.__e(e,n)}i.base=i.__P=null}if(i=e.__k)for(a=0;a<i.length;a++)i[a]&&fe(i[a],n,r||typeof e.type!=`function`);r||b(e.__e),e.__c=e.__=e.__e=void 0}function pe(e,t,n){return this.constructor(e,n)}function me(n,r,i){var a,o,s,c;r==document&&(r=document.documentElement),t.__&&t.__(n,r),o=(a=typeof i==`function`)?null:i&&i.__k||r.__k,s=[],c=[],oe(r,n=(!a&&i||r).__k=x(C,null,[n]),o||h,h,r.namespaceURI,!a&&i?[i]:o?null:r.firstChild?e.call(r.childNodes):null,s,!a&&i?i:o?o.__e:r.firstChild,a,c),ce(s,n,c)}e=g.slice,t={__e:function(e,t,n,r){for(var i,a,o;t=t.__;)if((i=t.__c)&&!i.__)try{if((a=i.constructor)&&a.getDerivedStateFromError!=null&&(i.setState(a.getDerivedStateFromError(e)),o=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(e,r||{}),o=i.__d),o)return i.__E=i}catch(t){e=t}throw e}},n=0,r=function(e){return e!=null&&e.constructor===void 0},w.prototype.setState=function(e,t){var n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=y({},this.state);typeof e==`function`&&(e=e(y({},n),this.props)),e&&y(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),O(this))},w.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),O(this))},w.prototype.render=C,i=[],o=typeof Promise==`function`?Promise.prototype.then.bind(Promise.resolve()):setTimeout,s=function(e,t){return e.__v.__b-t.__v.__b},k.__r=0,c=Math.random().toString(8),l=`__d`+c,u=`__a`+c,d=/(PointerCapture)$|Capture$/i,f=0,p=ae(!1),m=ae(!0);var he=function(e,t,n,r){var i;t[0]=0;for(var a=1;a<t.length;a++){var o=t[a++],s=t[a]?(t[0]|=o?1:2,n[t[a++]]):t[++a];o===3?r[0]=s:o===4?r[1]=Object.assign(r[1]||{},s):o===5?(r[1]=r[1]||{})[t[++a]]=s:o===6?r[1][t[++a]]+=s+``:o?(i=e.apply(s,he(e,s,n,[``,null])),r.push(i),s[0]?t[0]|=2:(t[a-2]=0,t[a]=i)):r.push(s)}return r},ge=new Map;function _e(e){var t=ge.get(this);return t||(t=new Map,ge.set(this,t)),(t=he(this,t.get(e)||(t.set(e,t=function(e){for(var t,n,r=1,i=``,a=``,o=[0],s=function(e){r===1&&(e||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,``)))?o.push(0,e,i):r===3&&(e||i)?(o.push(3,e,i),r=2):r===2&&i===`...`&&e?o.push(4,e,0):r===2&&i&&!e?o.push(5,0,!0,i):r>=5&&((i||!e&&r===5)&&(o.push(r,0,i,n),r=6),e&&(o.push(r,e,0,n),r=6)),i=``},c=0;c<e.length;c++){c&&(r===1&&s(),s(c));for(var l=0;l<e[c].length;l++)t=e[c][l],r===1?t===`<`?(s(),o=[o],r=3):i+=t:r===4?i===`--`&&t===`>`?(r=1,i=``):i=t+i[0]:a?t===a?a=``:i+=t:t===`"`||t===`'`?a=t:t===`>`?(s(),r=1):r&&(t===`=`?(r=5,n=i,i=``):t===`/`&&(r<5||e[c][l+1]===`>`)?(s(),r===3&&(o=o[0]),r=o,(o=o[0]).push(2,0,r),r=0):t===` `||t===`	`||t===`
`||t===`\r`?(s(),r=2):i+=t),r===3&&i===`!--`&&(r=4,o=o[0])}return s(),o}(e)),t),arguments,[])).length>1?t:t[0]}var M=_e.bind(x),ve,ye,be,xe,N=0,Se=[],P=t,Ce=P.__b,F=P.__r,we=P.diffed,I=P.__c,L=P.unmount,Te=P.__;function Ee(e,t){P.__h&&P.__h(ye,e,N||t),N=0;var n=ye.__H||={__:[],__h:[]};return e>=n.__.length&&n.__.push({}),n.__[e]}function De(e){return N=1,Oe(Be,e)}function Oe(e,t,n){var r=Ee(ve++,2);if(r.t=e,!r.__c&&(r.__=[n?n(t):Be(void 0,t),function(e){var t=r.__N?r.__N[0]:r.__[0],n=r.t(t,e);t!==n&&(r.__N=[n,r.__[1]],r.__c.setState({}))}],r.__c=ye,!ye.__f)){var i=function(e,t,n){if(!r.__c.__H)return!0;var i=r.__c.__H.__.filter(function(e){return e.__c});if(i.every(function(e){return!e.__N}))return!a||a.call(this,e,t,n);var o=r.__c.props!==e;return i.some(function(e){if(e.__N){var t=e.__[0];e.__=e.__N,e.__N=void 0,t!==e.__[0]&&(o=!0)}}),a&&a.call(this,e,t,n)||o};ye.__f=!0;var a=ye.shouldComponentUpdate,o=ye.componentWillUpdate;ye.componentWillUpdate=function(e,t,n){if(this.__e){var r=a;a=void 0,i(e,t,n),a=r}o&&o.call(this,e,t,n)},ye.shouldComponentUpdate=i}return r.__N||r.__}function ke(e,t){var n=Ee(ve++,3);!P.__s&&ze(n.__H,t)&&(n.__=e,n.u=t,ye.__H.__h.push(n))}function Ae(e,t){var n=Ee(ve++,4);!P.__s&&ze(n.__H,t)&&(n.__=e,n.u=t,ye.__h.push(n))}function je(e){return N=5,Me(function(){return{current:e}},[])}function Me(e,t){var n=Ee(ve++,7);return ze(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function Ne(e,t){return N=8,Me(function(){return e},t)}function Pe(){for(var e;e=Se.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Le),t.__h.some(Re),t.__h=[]}catch(n){t.__h=[],P.__e(n,e.__v)}}}P.__b=function(e){ye=null,Ce&&Ce(e)},P.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Te&&Te(e,t)},P.__r=function(e){F&&F(e),ve=0;var t=(ye=e.__c).__H;t&&(be===ye?(t.__h=[],ye.__h=[],t.__.some(function(e){e.__N&&(e.__=e.__N),e.u=e.__N=void 0})):(t.__h.some(Le),t.__h.some(Re),t.__h=[],ve=0)),be=ye},P.diffed=function(e){we&&we(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(Se.push(t)!==1&&xe===P.requestAnimationFrame||((xe=P.requestAnimationFrame)||Ie)(Pe)),t.__H.__.some(function(e){e.u&&(e.__H=e.u),e.u=void 0})),be=ye=null},P.__c=function(e,t){t.some(function(e){try{e.__h.some(Le),e.__h=e.__h.filter(function(e){return!e.__||Re(e)})}catch(n){t.some(function(e){e.__h&&=[]}),t=[],P.__e(n,e.__v)}}),I&&I(e,t)},P.unmount=function(e){L&&L(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(e){try{Le(e)}catch(e){t=e}}),n.__H=void 0,t&&P.__e(t,n.__v))};var Fe=typeof requestAnimationFrame==`function`;function Ie(e){var t,n=function(){clearTimeout(r),Fe&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,35);Fe&&(t=requestAnimationFrame(n))}function Le(e){var t=ye,n=e.__c;typeof n==`function`&&(e.__c=void 0,n()),ye=t}function Re(e){var t=ye;e.__c=e.__(),ye=t}function ze(e,t){return!e||e.length!==t.length||t.some(function(t,n){return t!==e[n]})}function Be(e,t){return typeof t==`function`?t(e):t}var Ve=`742a3b52`,He=Symbol.for(`preact-signals`);function Ue(){if(Ye>1)Ye--;else{var e,t=!1;for((function(){var e=$e;for($e=void 0;e!==void 0;)e.S.v===e.v&&(e.S.i=e.i),e=e.o})();Je!==void 0;){var n=Je;for(Je=void 0,Xe++;n!==void 0;){var r=n.u;if(n.u=void 0,n.f&=-3,!(8&n.f)&&rt(n))try{n.c()}catch(n){t||=(e=n,!0)}n=r}}if(Xe=0,Ye--,t)throw e}}function We(e){if(Ye>0)return e();Qe=++Ze,Ye++;try{return e()}finally{Ue()}}var Ge=void 0;function Ke(e){var t=Ge;Ge=void 0;try{return e()}finally{Ge=t}}var qe,Je=void 0,Ye=0,Xe=0,Ze=0,Qe=0,$e=void 0,et=0;function tt(e){if(Ge!==void 0){var t=e.n;if(t===void 0||t.t!==Ge)return t={i:0,S:e,p:Ge.s,n:void 0,t:Ge,e:void 0,x:void 0,r:t},Ge.s!==void 0&&(Ge.s.n=t),Ge.s=t,e.n=t,32&Ge.f&&e.S(t),t;if(t.i===-1)return t.i=0,t.n!==void 0&&(t.n.p=t.p,t.p!==void 0&&(t.p.n=t.n),t.p=Ge.s,t.n=void 0,Ge.s.n=t,Ge.s=t),t}}function nt(e,t){this.v=e,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=t?.watched,this.Z=t?.unwatched,this.name=t?.name}nt.prototype.brand=He,nt.prototype.h=function(){return!0},nt.prototype.S=function(e){var t=this,n=this.t;n!==e&&e.e===void 0&&(e.x=n,this.t=e,n===void 0?Ke(function(){var e;(e=t.W)==null||e.call(t)}):n.e=e)},nt.prototype.U=function(e){var t=this;if(this.t!==void 0){var n=e.e,r=e.x;n!==void 0&&(n.x=r,e.e=void 0),r!==void 0&&(r.e=n,e.x=void 0),e===this.t&&(this.t=r,r===void 0&&Ke(function(){var e;(e=t.Z)==null||e.call(t)}))}},nt.prototype.subscribe=function(e){var t=this;return dt(function(){var n=t.value;Ke(function(){return e(n)})},{name:`sub`})},nt.prototype.valueOf=function(){return this.value},nt.prototype.toString=function(){return this.value+``},nt.prototype.toJSON=function(){return this.value},nt.prototype.peek=function(){var e=this;return Ke(function(){return e.value})},Object.defineProperty(nt.prototype,"value",{get:function(){var e=tt(this);return e!==void 0&&(e.i=this.i),this.v},set:function(e){if(e!==this.v){if(Xe>100)throw Error(`Cycle detected`);(function(e){Ye!==0&&Xe===0&&e.l!==Qe&&(e.l=Qe,$e={S:e,v:e.v,i:e.i,o:$e})})(this),this.v=e,this.i++,et++,Ye++;try{for(var t=this.t;t!==void 0;t=t.x)t.t.N()}finally{Ue()}}}});function R(e,t){return new nt(e,t)}function rt(e){for(var t=e.s;t!==void 0;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function it(e){for(var t=e.s;t!==void 0;t=t.n){var n=t.S.n;if(n!==void 0&&(t.r=n),t.S.n=t,t.i=-1,t.n===void 0){e.s=t;break}}}function at(e){for(var t=e.s,n=void 0;t!==void 0;){var r=t.p;t.i===-1?(t.S.U(t),r!==void 0&&(r.n=t.n),t.n!==void 0&&(t.n.p=r)):n=t,t.S.n=t.r,t.r!==void 0&&(t.r=void 0),t=r}e.s=n}function ot(e,t){nt.call(this,void 0,t),this.x=e,this.s=void 0,this.g=et-1,this.f=4}ot.prototype=new nt,ot.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===et))return!0;if(this.g=et,this.f|=1,this.i>0&&!rt(this))return this.f&=-2,!0;var e=Ge;try{it(this),Ge=this;var t=this.x();(16&this.f||this.v!==t||this.i===0)&&(this.v=t,this.f&=-17,this.i++)}catch(e){this.v=e,this.f|=16,this.i++}return Ge=e,at(this),this.f&=-2,!0},ot.prototype.S=function(e){if(this.t===void 0){this.f|=36;for(var t=this.s;t!==void 0;t=t.n)t.S.S(t)}nt.prototype.S.call(this,e)},ot.prototype.U=function(e){if(this.t!==void 0&&(nt.prototype.U.call(this,e),this.t===void 0)){this.f&=-33;for(var t=this.s;t!==void 0;t=t.n)t.S.U(t)}},ot.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var e=this.t;e!==void 0;e=e.x)e.t.N()}},Object.defineProperty(ot.prototype,"value",{get:function(){if(1&this.f)throw Error(`Cycle detected`);var e=tt(this);if(this.h(),e!==void 0&&(e.i=this.i),16&this.f)throw this.v;return this.v}});function z(e,t){return new ot(e,t)}function st(e){var t=e.m;if(e.m=void 0,typeof t==`function`){Ye++;var n=Ge;Ge=void 0;try{t()}catch(t){throw e.f&=-2,e.f|=8,ct(e),t}finally{Ge=n,Ue()}}}function ct(e){for(var t=e.s;t!==void 0;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,st(e)}function lt(e){if(Ge!==this)throw Error(`Out-of-order effect`);at(this),Ge=e,this.f&=-2,8&this.f&&ct(this),Ue()}function ut(e,t){this.x=e,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=t?.name,qe&&qe.push(this)}ut.prototype.c=function(){var e=this.S();try{if(8&this.f||this.x===void 0)return;var t=this.x();typeof t==`function`&&(this.m=t)}finally{e()}},ut.prototype.S=function(){if(1&this.f)throw Error(`Cycle detected`);this.f|=1,this.f&=-9,st(this),it(this),Ye++;var e=Ge;return Ge=this,lt.bind(this,e)},ut.prototype.N=function(){2&this.f||(this.f|=2,this.u=Je,Je=this)},ut.prototype.d=function(){this.f|=8,1&this.f||ct(this)},ut.prototype.dispose=function(){this.d()};function dt(e,t){var n=new ut(e,t);try{n.c()}catch(e){throw n.d(),e}var r=n.d.bind(n);return r[Symbol.dispose]=r,r}var ft,pt,mt=typeof window<`u`&&!!window.__PREACT_SIGNALS_DEVTOOLS__,ht=[];dt(function(){ft=this.N})();function gt(e,n){t[e]=n.bind(null,t[e]||function(){})}function _t(e){if(pt){var t=pt;pt=void 0,t()}pt=e&&e.S()}function vt(e){var t=this,n=e.data,i=bt(n);i.value=n;var a=Me(function(){for(var e=t,n=t.__v;n=n.__;)if(n.__c){n.__c.__$f|=4;break}var a=z(function(){var e=i.value.value;return e===0?0:!0===e?``:e||``}),o=z(function(){return!Array.isArray(a.value)&&!r(a.value)}),s=dt(function(){if(this.N=Ct,o.value){var t=a.value;e.__v&&e.__v.__e&&e.__v.__e.nodeType===3&&(e.__v.__e.data=t)}}),c=t.__$u.d;return t.__$u.d=function(){s(),c.call(this)},[o,a]},[]),o=a[0],s=a[1];return o.value?s.peek():s.value}vt.displayName=`ReactiveTextNode`,Object.defineProperties(nt.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:vt},props:{configurable:!0,get:function(){var e=this;return{data:{get value(){return e.value}}}}},__b:{configurable:!0,value:1}}),gt(`__b`,function(e,t){if(typeof t.type==`string`){var n,r=t.props;for(var i in r)if(i!==`children`){var a=r[i];a instanceof nt&&(n||(t.__np=n={}),n[i]=a,r[i]=a.peek())}}e(t)}),gt(`__r`,function(e,t){if(e(t),t.type!==C){_t();var n,r=t.__c;r&&(r.__$f&=-2,(n=r.__$u)===void 0&&(r.__$u=n=function(e,t){var n;return dt(function(){n=this},{name:t}),n.c=e,n}(function(){var e;mt&&((e=n.y)==null||e.call(n)),r.__$f|=1,r.setState({})},typeof t.type==`function`?t.type.displayName||t.type.name:``))),_t(n)}}),gt(`__e`,function(e,t,n,r){_t(),e(t,n,r)}),gt(`diffed`,function(e,t){_t();var n;if(typeof t.type==`string`&&(n=t.__e)){var r=t.__np,i=t.props;if(r){var a=n.U;if(a)for(var o in a){var s=a[o];s!==void 0&&!(o in r)&&(s.d(),a[o]=void 0)}else a={},n.U=a;for(var c in r){var l=a[c],u=r[c];l===void 0?(l=yt(n,c,u,i),a[c]=l):l.o(u,i)}}}e(t)});function yt(e,t,n,r){var i=t in e&&e.ownerSVGElement===void 0,a=R(n);return{o:function(e,t){a.value=e,r=t},d:dt(function(){this.N=Ct;var n=a.value.value;r[t]!==n&&(r[t]=n,i?e[t]=n:n!=null&&(!1!==n||t[4]===`-`)?e.setAttribute(t,n):e.removeAttribute(t))})}}gt(`unmount`,function(e,t){if(typeof t.type==`string`){var n=t.__e;if(n){var r=n.U;if(r)for(var i in n.U=void 0,r){var a=r[i];a&&a.d()}}var o=t.__np;if(o){var s=t.props;for(var c in o)s[c]=o[c]}t.__np=void 0}else{var l=t.__c;if(l){var u=l.__$u;u&&(l.__$u=void 0,u.d())}}e(t)}),gt(`__h`,function(e,t,n,r){(r<3||r===9)&&(t.__$f|=2),e(t,n,r)}),w.prototype.shouldComponentUpdate=function(e,t){if(this.__R)return!0;var n=this.__$u,r=n&&n.s!==void 0;for(var i in t)return!0;if(this.__f||typeof this.u==`boolean`&&!0===this.u){var a=2&this.__$f;if(!(r||a||4&this.__$f)||1&this.__$f)return!0}else if(!(r||4&this.__$f)||3&this.__$f)return!0;for(var o in e)if(o!==`__source`&&e[o]!==this.props[o])return!0;for(var s in this.props)if(!(s in e))return!0;return!1};function bt(e,t){return Me(function(){return R(e,t)},[])}var xt=function(e){queueMicrotask(function(){queueMicrotask(e)})};function St(){We(function(){for(var e;e=ht.shift();)ft.call(e)})}function Ct(){ht.push(this)===1&&(t.requestAnimationFrame||xt)(St)}var wt=`camera-frames`,Tt=`1.5.0`,Et=`7061cb8d`,Dt=`main`,Ot=`742a3b52`,kt=`2026-06-24T02:11:48.107Z`,At=`__CAMERA_FRAMES_RUNTIME_SEQUENCE__`,jt=`__CAMERA_FRAMES_ACTIVE_RUNTIME__`,Mt=!1,Nt=R(Ve);function B(e=globalThis.location?.search??``){try{return new URLSearchParams(e)}catch{return new URLSearchParams}}var Pt=Object.freeze({name:wt,version:Tt,commit:Et,branch:Dt,codeStamp:Ot,builtAt:kt});function Ft(){let e=Number(globalThis[At]??0)+1;return globalThis[At]=e,e}function It(e){return`${Date.now().toString(36)}-${e.toString(36)}`}function Lt(){let e=Ft(),t=Object.freeze({id:It(e),sequence:e,startedAt:new Date().toISOString()});return globalThis[jt]=t,t}function Rt(){return`v${Pt.version}`}function zt(){return Nt.value||Pt.codeStamp||null}function Bt(e,{search:t=globalThis.location?.search??``}={}){if(!e)return!1;let n=B(t);if(!n.has(e))return!1;let r=String(n.get(e)??``).trim().toLowerCase();return r===``||r===`1`||r===`true`||r===`yes`||r===`on`}var Vt=`attached`,Ht=1e3,Ut=1001,Wt=1002,Gt=1003,Kt=1004,qt=1005,Jt=1006,Yt=1007,Xt=1008,Zt=1008,Qt=1009,$t=1010,en=1011,tn=1012,nn=1013,rn=1014,an=1015,on=1016,sn=1017,cn=1018,ln=1020,un=35902,dn=35899,fn=1021,pn=1022,mn=1023,hn=1026,gn=1027,_n=1028,vn=1029,yn=1030,bn=1031,xn=1033,Sn=33776,Cn=33777,wn=33778,Tn=33779,En=35840,Dn=35841,On=35842,kn=35843,An=36196,jn=37492,Mn=37496,Nn=37488,Pn=37489,Fn=37490,In=37491,Ln=37808,Rn=37809,zn=37810,Bn=37811,Vn=37812,Hn=37813,Un=37814,Wn=37815,Gn=37816,Kn=37817,qn=37818,Jn=37819,Yn=37820,Xn=37821,Zn=36492,Qn=36494,$n=36495,er=36283,tr=36284,nr=36285,rr=36286,ir=2300,ar=2301,or=2302,sr=2303,cr=2400,lr=2401,ur=2402,dr=2500,fr=3200,pr=`srgb`,mr=`srgb-linear`,hr=`linear`,gr=`srgb`,_r=7680,vr=35044,yr=35048,br=`300 es`,xr=2e3;function Sr(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Cr(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function wr(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Tr(){let e=wr(`canvas`);return e.style.display=`block`,e}var Er={},Dr=null;function Or(...e){let t=`THREE.`+e.shift();Dr?Dr(`log`,t,...e):console.log(t,...e)}function kr(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function V(...e){e=kr(e);let t=`THREE.`+e.shift();if(Dr)Dr(`warn`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function H(...e){e=kr(e);let t=`THREE.`+e.shift();if(Dr)Dr(`error`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Ar(...e){let t=e.join(` `);t in Er||(Er[t]=!0,V(...e))}function jr(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Mr={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},Nr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Pr=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Fr=1234567,Ir=Math.PI/180,Lr=180/Math.PI;function Rr(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Pr[e&255]+Pr[e>>8&255]+Pr[e>>16&255]+Pr[e>>24&255]+`-`+Pr[t&255]+Pr[t>>8&255]+`-`+Pr[t>>16&15|64]+Pr[t>>24&255]+`-`+Pr[n&63|128]+Pr[n>>8&255]+`-`+Pr[n>>16&255]+Pr[n>>24&255]+Pr[r&255]+Pr[r>>8&255]+Pr[r>>16&255]+Pr[r>>24&255]).toLowerCase()}function U(e,t,n){return Math.max(t,Math.min(n,e))}function zr(e,t){return(e%t+t)%t}function Br(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Vr(e,t,n){return e===t?0:(n-e)/(t-e)}function Hr(e,t,n){return(1-n)*e+n*t}function Ur(e,t,n,r){return Hr(e,t,1-Math.exp(-n*r))}function Wr(e,t=1){return t-Math.abs(zr(e,t*2)-t)}function Gr(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Kr(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function qr(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Jr(e,t){return e+Math.random()*(t-e)}function Yr(e){return e*(.5-Math.random())}function Xr(e){e!==void 0&&(Fr=e);let t=Fr+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Zr(e){return e*Ir}function Qr(e){return e*Lr}function $r(e){return(e&e-1)==0&&e!==0}function ei(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function ti(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function ni(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:V(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function ri(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function ii(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var ai={DEG2RAD:Ir,RAD2DEG:Lr,generateUUID:Rr,clamp:U,euclideanModulo:zr,mapLinear:Br,inverseLerp:Vr,lerp:Hr,damp:Ur,pingpong:Wr,smoothstep:Gr,smootherstep:Kr,randInt:qr,randFloat:Jr,randFloatSpread:Yr,seededRandom:Xr,degToRad:Zr,radToDeg:Qr,isPowerOfTwo:$r,ceilPowerOfTwo:ei,floorPowerOfTwo:ti,setQuaternionFromProperEuler:ni,normalize:ii,denormalize:ri},W=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(U(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},oi=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:V(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(U(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},G=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ci.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ci.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this.z=U(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this.z=U(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return si.copy(this).projectOnVector(e),this.sub(si)}reflect(e){return this.sub(si.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(U(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},si=new G,ci=new oi,K=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(li.makeScale(e,t)),this}rotate(e){return this.premultiply(li.makeRotation(-e)),this}translate(e,t){return this.premultiply(li.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},li=new K,ui=new K().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),di=new K().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function fi(){let e={enabled:!0,workingColorSpace:mr,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=pi(e.r),e.g=pi(e.g),e.b=pi(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=mi(e.r),e.g=mi(e.g),e.b=mi(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?hr:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Ar(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Ar(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[mr]:{primaries:t,whitePoint:r,transfer:hr,toXYZ:ui,fromXYZ:di,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:pr},outputColorSpaceConfig:{drawingBufferColorSpace:pr}},[pr]:{primaries:t,whitePoint:r,transfer:gr,toXYZ:ui,fromXYZ:di,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:pr}}}),e}var q=fi();function pi(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function mi(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var hi,gi=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{hi===void 0&&(hi=wr(`canvas`)),hi.width=e.width,hi.height=e.height;let t=hi.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=hi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=wr(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=pi(i[e]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(pi(t[e]/255)*255):t[e]=pi(t[e]);return{data:t,width:e.width,height:e.height}}else return V(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},_i=0,vi=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_i++}),this.uuid=Rr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(yi(r[t].image)):e.push(yi(r[t]))}else e=yi(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function yi(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?gi.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(V(`Texture: Unable to serialize Texture.`),{})}var bi=0,xi=new G,Si=class e extends Nr{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=Ut,i=Ut,a=Jt,o=Xt,s=mn,c=Qt,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:bi++}),this.uuid=Rr(),this.name=``,this.source=new vi(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new W(0,0),this.repeat=new W(1,1),this.center=new W(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new K,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(xi).x}get height(){return this.source.getSize(xi).y}get depth(){return this.source.getSize(xi).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){V(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){V(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ht:e.x-=Math.floor(e.x);break;case Ut:e.x=e.x<0?0:1;break;case Wt:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ht:e.y-=Math.floor(e.y);break;case Ut:e.y=e.y<0?0:1;break;case Wt:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Si.DEFAULT_IMAGE=null,Si.DEFAULT_MAPPING=300,Si.DEFAULT_ANISOTROPY=1;var Ci=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this.z=U(this.z,e.z,t.z),this.w=U(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this.z=U(this.z,e,t),this.w=U(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},wi=class extends Nr{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Jt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Ci(0,0,e,t),this.scissorTest=!1,this.viewport=new Ci(0,0,e,t),this.textures=[];let r=new Si({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:Jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new vi(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this}dispose(){this.dispatchEvent({type:`dispose`})}},Ti=class extends wi{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ei=class extends Si{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=Ut,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Di=class extends Ti{constructor(e=1,t=1,n=1,r={}){super(e,t,r),this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new Ei(null,e,t,n),this._setTextureOptions(r),this.texture.isRenderTargetTexture=!0}},Oi=class extends Si{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=Ut,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},J=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,r=1/ki.setFromMatrixColumn(e,0).length(),i=1/ki.setFromMatrixColumn(e,1).length(),a=1/ki.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ji,e,Mi)}lookAt(e,t,n){let r=this.elements;return Fi.subVectors(e,t),Fi.lengthSq()===0&&(Fi.z=1),Fi.normalize(),Ni.crossVectors(n,Fi),Ni.lengthSq()===0&&(Math.abs(n.z)===1?Fi.x+=1e-4:Fi.z+=1e-4,Fi.normalize(),Ni.crossVectors(n,Fi)),Ni.normalize(),Pi.crossVectors(Fi,Ni),r[0]=Ni.x,r[4]=Pi.x,r[8]=Fi.x,r[1]=Ni.y,r[5]=Pi.y,r[9]=Fi.y,r[2]=Ni.z,r[6]=Pi.z,r[10]=Fi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],te=r[14],j=r[3],ne=r[7],re=r[11],ie=r[15];return i[0]=a*x+o*T+s*k+c*j,i[4]=a*S+o*E+s*A+c*ne,i[8]=a*C+o*D+s*ee+c*re,i[12]=a*w+o*O+s*te+c*ie,i[1]=l*x+u*T+d*k+f*j,i[5]=l*S+u*E+d*A+f*ne,i[9]=l*C+u*D+d*ee+f*re,i[13]=l*w+u*O+d*te+f*ie,i[2]=p*x+m*T+h*k+g*j,i[6]=p*S+m*E+h*A+g*ne,i[10]=p*C+m*D+h*ee+g*re,i[14]=p*w+m*O+h*te+g*ie,i[3]=_*x+v*T+y*k+b*j,i[7]=_*S+v*E+y*A+b*ne,i[11]=_*C+v*D+y*ee+b*re,i[15]=_*w+v*O+y*te+b*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinant();if(i===0)return n.set(1,1,1),t.identity(),this;let a=ki.set(r[0],r[1],r[2]).length(),o=ki.set(r[4],r[5],r[6]).length(),s=ki.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Ai.copy(this);let c=1/a,l=1/o,u=1/s;return Ai.elements[0]*=c,Ai.elements[1]*=c,Ai.elements[2]*=c,Ai.elements[4]*=l,Ai.elements[5]*=l,Ai.elements[6]*=l,Ai.elements[8]*=u,Ai.elements[9]*=u,Ai.elements[10]*=u,t.setFromRotationMatrix(Ai),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=xr,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=xr,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ki=new G,Ai=new J,ji=new G(0,0,0),Mi=new G(1,1,1),Ni=new G,Pi=new G,Fi=new G,Ii=new J,Li=new oi,Ri=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(U(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-U(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(U(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-U(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(U(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-U(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:V(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ii.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ii,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Li.setFromEuler(this),this.setFromQuaternion(Li,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ri.DEFAULT_ORDER=`XYZ`;var zi=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!=0}},Bi=0,Vi=new G,Hi=new oi,Ui=new J,Wi=new G,Gi=new G,Ki=new G,qi=new oi,Ji=new G(1,0,0),Yi=new G(0,1,0),Xi=new G(0,0,1),Zi={type:`added`},Qi={type:`removed`},$i={type:`childadded`,child:null},ea={type:`childremoved`,child:null},ta=class e extends Nr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Bi++}),this.uuid=Rr(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new G,n=new Ri,r=new oi,i=new G(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new J},normalMatrix:{value:new K}}),this.matrix=new J,this.matrixWorld=new J,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new zi,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.multiply(Hi),this}rotateOnWorldAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.premultiply(Hi),this}rotateX(e){return this.rotateOnAxis(Ji,e)}rotateY(e){return this.rotateOnAxis(Yi,e)}rotateZ(e){return this.rotateOnAxis(Xi,e)}translateOnAxis(e,t){return Vi.copy(e).applyQuaternion(this.quaternion),this.position.add(Vi.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ji,e)}translateY(e){return this.translateOnAxis(Yi,e)}translateZ(e){return this.translateOnAxis(Xi,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ui.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Wi.copy(e):Wi.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Gi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ui.lookAt(Gi,Wi,this.up):Ui.lookAt(Wi,Gi,this.up),this.quaternion.setFromRotationMatrix(Ui),r&&(Ui.extractRotation(r.matrixWorld),Hi.setFromRotationMatrix(Ui),this.quaternion.premultiply(Hi.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(H(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Zi),$i.child=e,this.dispatchEvent($i),$i.child=null):H(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Qi),ea.child=e,this.dispatchEvent(ea),ea.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ui.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ui.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ui),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Zi),$i.child=e,this.dispatchEvent($i),$i.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gi,e,Ki),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gi,qi,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material);if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};ta.DEFAULT_UP=new G(0,1,0),ta.DEFAULT_MATRIX_AUTO_UPDATE=!0,ta.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var na=class extends ta{constructor(){super(),this.isGroup=!0,this.type=`Group`}},ra={type:`move`},ia=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new na,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new na,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new na,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ra)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new na;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},aa={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},oa={h:0,s:0,l:0},sa={h:0,s:0,l:0};function ca(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Y=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pr){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,q.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=q.workingColorSpace){return this.r=e,this.g=t,this.b=n,q.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=q.workingColorSpace){if(e=zr(e,1),t=U(t,0,1),n=U(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=ca(i,r,e+1/3),this.g=ca(i,r,e),this.b=ca(i,r,e-1/3)}return q.colorSpaceToWorking(this,r),this}setStyle(e,t=pr){function n(t){t!==void 0&&parseFloat(t)<1&&V(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:V(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);V(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pr){let n=aa[e.toLowerCase()];return n===void 0?V(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=pi(e.r),this.g=pi(e.g),this.b=pi(e.b),this}copyLinearToSRGB(e){return this.r=mi(e.r),this.g=mi(e.g),this.b=mi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pr){return q.workingToColorSpace(la.copy(this),e),Math.round(U(la.r*255,0,255))*65536+Math.round(U(la.g*255,0,255))*256+Math.round(U(la.b*255,0,255))}getHexString(e=pr){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=q.workingColorSpace){q.workingToColorSpace(la.copy(this),t);let n=la.r,r=la.g,i=la.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4;break}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=q.workingColorSpace){return q.workingToColorSpace(la.copy(this),t),e.r=la.r,e.g=la.g,e.b=la.b,e}getStyle(e=pr){q.workingToColorSpace(la.copy(this),e);let t=la.r,n=la.g,r=la.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(oa),this.setHSL(oa.h+e,oa.s+t,oa.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(oa),e.getHSL(sa);let n=Hr(oa.h,sa.h,t),r=Hr(oa.s,sa.s,t),i=Hr(oa.l,sa.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},la=new Y;Y.NAMES=aa;var ua=class extends ta{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ri,this.environmentIntensity=1,this.environmentRotation=new Ri,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},da=new G,fa=new G,pa=new G,ma=new G,ha=new G,ga=new G,_a=new G,va=new G,ya=new G,ba=new G,xa=new Ci,Sa=new Ci,Ca=new Ci,wa=class e{constructor(e=new G,t=new G,n=new G){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),da.subVectors(e,t),r.cross(da);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){da.subVectors(r,t),fa.subVectors(n,t),pa.subVectors(e,t);let a=da.dot(da),o=da.dot(fa),s=da.dot(pa),c=fa.dot(fa),l=fa.dot(pa),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,ma)===null?!1:ma.x>=0&&ma.y>=0&&ma.x+ma.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,ma)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,ma.x),s.addScaledVector(a,ma.y),s.addScaledVector(o,ma.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return xa.setScalar(0),Sa.setScalar(0),Ca.setScalar(0),xa.fromBufferAttribute(e,t),Sa.fromBufferAttribute(e,n),Ca.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(xa,i.x),a.addScaledVector(Sa,i.y),a.addScaledVector(Ca,i.z),a}static isFrontFacing(e,t,n,r){return da.subVectors(n,t),fa.subVectors(e,t),da.cross(fa).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return da.subVectors(this.c,this.b),fa.subVectors(this.a,this.b),da.cross(fa).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;ha.subVectors(r,n),ga.subVectors(i,n),va.subVectors(e,n);let s=ha.dot(va),c=ga.dot(va);if(s<=0&&c<=0)return t.copy(n);ya.subVectors(e,r);let l=ha.dot(ya),u=ga.dot(ya);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(ha,a);ba.subVectors(e,i);let f=ha.dot(ba),p=ga.dot(ba);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(ga,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return _a.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(_a,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(ha,a).addScaledVector(ga,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ta=class{constructor(e=new G(1/0,1/0,1/0),t=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Da.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Da.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Da.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Da):Da.fromBufferAttribute(r,t),Da.applyMatrix4(e.matrixWorld),this.expandByPoint(Da);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Oa.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Oa.copy(e.boundingBox)),Oa.applyMatrix4(e.matrixWorld),this.union(Oa)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Da),Da.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fa),Ia.subVectors(this.max,Fa),ka.subVectors(e.a,Fa),Aa.subVectors(e.b,Fa),ja.subVectors(e.c,Fa),Ma.subVectors(Aa,ka),Na.subVectors(ja,Aa),Pa.subVectors(ka,ja);let t=[0,-Ma.z,Ma.y,0,-Na.z,Na.y,0,-Pa.z,Pa.y,Ma.z,0,-Ma.x,Na.z,0,-Na.x,Pa.z,0,-Pa.x,-Ma.y,Ma.x,0,-Na.y,Na.x,0,-Pa.y,Pa.x,0];return!za(t,ka,Aa,ja,Ia)||(t=[1,0,0,0,1,0,0,0,1],!za(t,ka,Aa,ja,Ia))?!1:(La.crossVectors(Ma,Na),t=[La.x,La.y,La.z],za(t,ka,Aa,ja,Ia))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Da).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Da).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ea[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ea[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ea[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ea[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ea[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ea[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ea[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ea[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ea),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ea=[new G,new G,new G,new G,new G,new G,new G,new G],Da=new G,Oa=new Ta,ka=new G,Aa=new G,ja=new G,Ma=new G,Na=new G,Pa=new G,Fa=new G,Ia=new G,La=new G,Ra=new G;function za(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Ra.fromArray(e,a);let o=i.x*Math.abs(Ra.x)+i.y*Math.abs(Ra.y)+i.z*Math.abs(Ra.z),s=t.dot(Ra),c=n.dot(Ra),l=r.dot(Ra);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Ba=new G,Va=new W,Ha=0,Ua=class extends Nr{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ha++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=vr,this.updateRanges=[],this.gpuType=an,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Va.fromBufferAttribute(this,t),Va.applyMatrix3(e),this.setXY(t,Va.x,Va.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ba.fromBufferAttribute(this,t),Ba.applyMatrix3(e),this.setXYZ(t,Ba.x,Ba.y,Ba.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ba.fromBufferAttribute(this,t),Ba.applyMatrix4(e),this.setXYZ(t,Ba.x,Ba.y,Ba.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ba.fromBufferAttribute(this,t),Ba.applyNormalMatrix(e),this.setXYZ(t,Ba.x,Ba.y,Ba.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ba.fromBufferAttribute(this,t),Ba.transformDirection(e),this.setXYZ(t,Ba.x,Ba.y,Ba.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ri(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ii(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ri(t,this.array)),t}setX(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ri(t,this.array)),t}setY(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ri(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ri(t,this.array)),t}setW(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ii(t,this.array),n=ii(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ii(t,this.array),n=ii(n,this.array),r=ii(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=ii(t,this.array),n=ii(n,this.array),r=ii(r,this.array),i=ii(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:`dispose`})}},Wa=class extends Ua{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Ga=class extends Ua{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Ka=class extends Ua{constructor(e,t,n){super(new Float32Array(e),t,n)}},qa=new Ta,Ja=new G,Ya=new G,Xa=class{constructor(e=new G,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?qa.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ja.subVectors(e,this.center);let t=Ja.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Ja,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ya.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ja.copy(e.center).add(Ya)),this.expandByPoint(Ja.copy(e.center).sub(Ya))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Za=0,Qa=new J,$a=new ta,eo=new G,to=new Ta,no=new Ta,ro=new G,io=class e extends Nr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Za++}),this.uuid=Rr(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Sr(e)?Ga:Wa)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new K().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Qa.makeRotationFromQuaternion(e),this.applyMatrix4(Qa),this}rotateX(e){return Qa.makeRotationX(e),this.applyMatrix4(Qa),this}rotateY(e){return Qa.makeRotationY(e),this.applyMatrix4(Qa),this}rotateZ(e){return Qa.makeRotationZ(e),this.applyMatrix4(Qa),this}translate(e,t,n){return Qa.makeTranslation(e,t,n),this.applyMatrix4(Qa),this}scale(e,t,n){return Qa.makeScale(e,t,n),this.applyMatrix4(Qa),this}lookAt(e){return $a.lookAt(e),$a.updateMatrix(),this.applyMatrix4($a.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(eo).negate(),this.translate(eo.x,eo.y,eo.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Ka(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&V(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ta);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){H(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];to.setFromBufferAttribute(n),this.morphTargetsRelative?(ro.addVectors(this.boundingBox.min,to.min),this.boundingBox.expandByPoint(ro),ro.addVectors(this.boundingBox.max,to.max),this.boundingBox.expandByPoint(ro)):(this.boundingBox.expandByPoint(to.min),this.boundingBox.expandByPoint(to.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&H(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Xa);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){H(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new G,1/0);return}if(e){let n=this.boundingSphere.center;if(to.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];no.setFromBufferAttribute(n),this.morphTargetsRelative?(ro.addVectors(to.min,no.min),to.expandByPoint(ro),ro.addVectors(to.max,no.max),to.expandByPoint(ro)):(to.expandByPoint(no.min),to.expandByPoint(no.max))}to.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)ro.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(ro));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)ro.fromBufferAttribute(a,t),o&&(eo.fromBufferAttribute(e,t),ro.add(eo)),r=Math.max(r,n.distanceToSquared(ro))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&H(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){H(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Ua(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new G,s[e]=new G;let c=new G,l=new G,u=new G,d=new W,f=new W,p=new W,m=new G,h=new G;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new G,y=new G,b=new G,x=new G;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Ua(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new G,i=new G,a=new G,o=new G,s=new G,c=new G,l=new G,u=new G;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)ro.fromBufferAttribute(e,t),ro.normalize(),e.setXYZ(t,ro.x,ro.y,ro.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ua(a,r,i)}if(this.index===null)return V(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},ao=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=vr,this.updateRanges=[],this.version=0,this.uuid=Rr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},oo=new G,so=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)oo.fromBufferAttribute(this,t),oo.applyMatrix4(e),this.setXYZ(t,oo.x,oo.y,oo.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)oo.fromBufferAttribute(this,t),oo.applyNormalMatrix(e),this.setXYZ(t,oo.x,oo.y,oo.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)oo.fromBufferAttribute(this,t),oo.transformDirection(e),this.setXYZ(t,oo.x,oo.y,oo.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=ri(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ii(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ii(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ii(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ii(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ii(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ri(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ri(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ri(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ri(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ii(t,this.array),n=ii(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ii(t,this.array),n=ii(n,this.array),r=ii(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ii(t,this.array),n=ii(n,this.array),r=ii(r,this.array),i=ii(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Or(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Ua(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Or(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},co=0,lo=class extends Nr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:co++}),this.uuid=Rr(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Y(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=_r,this.stencilZFail=_r,this.stencilZPass=_r,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){V(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){V(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},uo=class extends lo{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new Y(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},fo,po=new G,mo=new G,ho=new G,go=new W,_o=new W,vo=new J,yo=new G,bo=new G,xo=new G,So=new W,Co=new W,wo=new W,To=class extends ta{constructor(e=new uo){if(super(),this.isSprite=!0,this.type=`Sprite`,fo===void 0){fo=new io;let e=new ao(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);fo.setIndex([0,1,2,0,2,3]),fo.setAttribute(`position`,new so(e,3,0,!1)),fo.setAttribute(`uv`,new so(e,2,3,!1))}this.geometry=fo,this.material=e,this.center=new W(.5,.5),this.count=1}raycast(e,t){e.camera===null&&H(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),mo.setFromMatrixScale(this.matrixWorld),vo.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ho.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&mo.multiplyScalar(-ho.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Eo(yo.set(-.5,-.5,0),ho,a,mo,r,i),Eo(bo.set(.5,-.5,0),ho,a,mo,r,i),Eo(xo.set(.5,.5,0),ho,a,mo,r,i),So.set(0,0),Co.set(1,0),wo.set(1,1);let o=e.ray.intersectTriangle(yo,bo,xo,!1,po);if(o===null&&(Eo(bo.set(-.5,.5,0),ho,a,mo,r,i),Co.set(0,1),o=e.ray.intersectTriangle(yo,xo,bo,!1,po),o===null))return;let s=e.ray.origin.distanceTo(po);s<e.near||s>e.far||t.push({distance:s,point:po.clone(),uv:wa.getInterpolation(po,yo,bo,xo,So,Co,wo,new W),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Eo(e,t,n,r,i,a){go.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?_o.copy(go):(_o.x=a*go.x-i*go.y,_o.y=i*go.x+a*go.y),e.copy(t),e.x+=_o.x,e.y+=_o.y,e.applyMatrix4(vo)}var Do=new G,Oo=new G,ko=new G,Ao=new G,jo=new G,Mo=new G,No=new G,Po=class{constructor(e=new G,t=new G(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Do)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Do.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Do.copy(this.origin).addScaledVector(this.direction,t),Do.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Oo.copy(e).add(t).multiplyScalar(.5),ko.copy(t).sub(e).normalize(),Ao.copy(this.origin).sub(Oo);let i=e.distanceTo(t)*.5,a=-this.direction.dot(ko),o=Ao.dot(this.direction),s=-Ao.dot(ko),c=Ao.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0)if(u=a*s-o,d=a*o-s,p=i*l,u>=0)if(d>=-p)if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c);else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Oo).addScaledVector(ko,d),f}intersectSphere(e,t){Do.subVectors(e.center,this.origin);let n=Do.dot(this.direction),r=Do.dot(Do)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Do)!==null}intersectTriangle(e,t,n,r,i){jo.subVectors(t,e),Mo.subVectors(n,e),No.crossVectors(jo,Mo);let a=this.direction.dot(No),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ao.subVectors(this.origin,e);let s=o*this.direction.dot(Mo.crossVectors(Ao,Mo));if(s<0)return null;let c=o*this.direction.dot(jo.cross(Ao));if(c<0||s+c>a)return null;let l=-o*Ao.dot(No);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Fo=class extends lo{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new Y(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Io=new J,Lo=new Po,Ro=new Xa,zo=new G,Bo=new G,Vo=new G,Ho=new G,Uo=new G,Wo=new G,Go=new G,Ko=new G,qo=class extends ta{constructor(e=new io,t=new Fo){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Wo.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Uo.fromBufferAttribute(s,e),a?Wo.addScaledVector(Uo,r):Wo.addScaledVector(Uo.sub(t),r))}t.add(Wo)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ro.copy(n.boundingSphere),Ro.applyMatrix4(i),Lo.copy(e.ray).recast(e.near),!(Ro.containsPoint(Lo.origin)===!1&&(Lo.intersectSphere(Ro,zo)===null||Lo.origin.distanceToSquared(zo)>(e.far-e.near)**2))&&(Io.copy(i).invert(),Lo.copy(e.ray).applyMatrix4(Io),!(n.boundingBox!==null&&Lo.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Lo)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null)if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Yo(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Yo(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}else if(s!==void 0)if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Yo(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Yo(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}};function Jo(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Ko.copy(s),Ko.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Ko);return l<n.near||l>n.far?null:{distance:l,point:Ko.clone(),object:e}}function Yo(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Bo),e.getVertexPosition(c,Vo),e.getVertexPosition(l,Ho);let u=Jo(e,t,n,r,Bo,Vo,Ho,Go);if(u){let e=new G;wa.getBarycoord(Go,Bo,Vo,Ho,e),i&&(u.uv=wa.getInterpolatedAttribute(i,s,c,l,e,new W)),a&&(u.uv1=wa.getInterpolatedAttribute(a,s,c,l,e,new W)),o&&(u.normal=wa.getInterpolatedAttribute(o,s,c,l,e,new G),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new G,materialIndex:0};wa.getNormal(Bo,Vo,Ho,t.normal),u.face=t,u.barycoord=e}return u}var Xo=new Ci,Zo=new Ci,Qo=new Ci,$o=new Ci,es=new J,ts=new G,ns=new Xa,rs=new J,is=new Po,as=class extends qo{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=Vt,this.bindMatrix=new J,this.bindMatrixInverse=new J,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ta),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,ts),this.boundingBox.expandByPoint(ts)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Xa),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,ts),this.boundingSphere.expandByPoint(ts)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ns.copy(this.boundingSphere),ns.applyMatrix4(r),e.ray.intersectsSphere(ns)!==!1&&(rs.copy(r).invert(),is.copy(e.ray).applyMatrix4(rs),!(this.boundingBox!==null&&is.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,is)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Ci,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():V(`SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;Zo.fromBufferAttribute(r.attributes.skinIndex,e),Qo.fromBufferAttribute(r.attributes.skinWeight,e),t.isVector4?(Xo.copy(t),t.set(0,0,0,0)):(Xo.set(...t,1),t.set(0,0,0)),Xo.applyMatrix4(this.bindMatrix);for(let e=0;e<4;e++){let r=Qo.getComponent(e);if(r!==0){let i=Zo.getComponent(e);es.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector($o.copy(Xo).applyMatrix4(es),r)}}return t.isVector4&&(t.w=Xo.w),t.applyMatrix4(this.bindMatrixInverse)}},os=class extends ta{constructor(){super(),this.isBone=!0,this.type=`Bone`}},ss=class extends Si{constructor(e=null,t=1,n=1,r,i,a,o,s,c=Gt,l=Gt,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},cs=new J,ls=new J,us=class e{constructor(e=[],t=[]){this.uuid=Rr(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){V(`Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new J)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new J;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:ls;cs.multiplyMatrices(i,t[r]),cs.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ss(t,e,e,mn,an);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(V(`Skeleton: No bone found with UUID:`,r),i=new os),this.bones.push(i),this.boneInverses.push(new J().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},ds=class extends Ua{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},fs=new J,ps=new J,ms=[],hs=new Ta,gs=new J,_s=new qo,vs=new Xa,ys=class extends qo{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ds(new Float32Array(n*16),16),this.previousInstanceMatrix=null,this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,gs)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ta),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fs),hs.copy(e.boundingBox).applyMatrix4(fs),this.boundingBox.union(hs)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Xa),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fs),vs.copy(e.boundingSphere).applyMatrix4(fs),this.boundingSphere.union(vs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.previousInstanceMatrix!==null&&(this.previousInstanceMatrix=e.previousInstanceMatrix.clone()),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(_s.geometry=this.geometry,_s.material=this.material,_s.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),vs.copy(this.boundingSphere),vs.applyMatrix4(n),e.ray.intersectsSphere(vs)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,fs),ps.multiplyMatrices(n,fs),_s.matrixWorld=ps,_s.raycast(e,ms);for(let e=0,n=ms.length;e<n;e++){let n=ms[e];n.instanceId=i,n.object=this,t.push(n)}ms.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ds(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ss(new Float32Array(r*this.count),r,this.count,_n,an));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},bs=new G,xs=new G,Ss=new K,Cs=class{constructor(e=new G(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=bs.subVectors(n,t).cross(xs.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(bs),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ss.getNormalMatrix(e),r=this.coplanarPoint(bs).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ws=new Xa,Ts=new W(.5,.5),Es=new G,Ds=class{constructor(e=new Cs,t=new Cs,n=new Cs,r=new Cs,i=new Cs,a=new Cs){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=xr,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ws.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ws.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ws)}intersectsSprite(e){return ws.center.set(0,0,0),ws.radius=.7071067811865476+Ts.distanceTo(e.center),ws.applyMatrix4(e.matrixWorld),this.intersectsSphere(ws)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Es.x=r.normal.x>0?e.max.x:e.min.x,Es.y=r.normal.y>0?e.max.y:e.min.y,Es.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Es)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Os=class extends lo{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new Y(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ks=new G,As=new G,js=new J,Ms=new Po,Ns=new Xa,Ps=new G,Fs=new G,Is=class extends ta{constructor(e=new io,t=new Os){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)ks.fromBufferAttribute(t,e-1),As.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=ks.distanceTo(As);e.setAttribute(`lineDistance`,new Ka(n,1))}else V(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ns.copy(n.boundingSphere),Ns.applyMatrix4(r),Ns.radius+=i,e.ray.intersectsSphere(Ns)===!1)return;js.copy(r).invert(),Ms.copy(e.ray).applyMatrix4(js);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Ls(this,e,Ms,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Ls(this,e,Ms,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Ls(this,e,Ms,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=Ls(this,e,Ms,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Ls(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(ks.fromBufferAttribute(s,i),As.fromBufferAttribute(s,a),n.distanceSqToSegment(ks,As,Ps,Fs)>r)return;Ps.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Ps);if(!(c<t.near||c>t.far))return{distance:c,point:Fs.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Rs=new G,zs=new G,Bs=class extends Is{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Rs.fromBufferAttribute(t,e),zs.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Rs.distanceTo(zs);e.setAttribute(`lineDistance`,new Ka(n,1))}else V(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Vs=class extends Is{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},Hs=class extends lo{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new Y(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Us=new J,Ws=new Po,Gs=new Xa,Ks=new G,qs=class extends ta{constructor(e=new io,t=new Hs){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Gs.copy(n.boundingSphere),Gs.applyMatrix4(r),Gs.radius+=i,e.ray.intersectsSphere(Gs)===!1)return;Us.copy(r).invert(),Ws.copy(e.ray).applyMatrix4(Us);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Ks.fromBufferAttribute(l,n),Js(Ks,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Ks.fromBufferAttribute(l,a),Js(Ks,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Js(e,t,n,r,i,a,o){let s=Ws.distanceSqToPoint(e);if(s<n){let n=new G;Ws.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ys=class extends Si{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Xs=class extends Si{constructor(e,t,n=rn,r,i,a,o=Gt,s=Gt,c,l=hn,u=1){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new vi(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Zs=class extends Xs{constructor(e,t=rn,n=301,r,i,a=Gt,o=Gt,s,c=hn){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Qs=class extends Si{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},$s=class e extends io{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Ka(c,3)),this.setAttribute(`normal`,new Ka(l,3)),this.setAttribute(`uv`,new Ka(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new G;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},ec=class e extends io{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Ka(u,3)),this.setAttribute(`normal`,new Ka(d,3)),this.setAttribute(`uv`,new Ka(f,2));function _(){let a=new G,_=new G,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new W,m=new G,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},tc=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){V(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new W:new G);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new G,r=[],i=[],a=[],o=new G,s=new J;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new G)}i[0]=new G,a[0]=new G;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(U(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(U(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}};function nc(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=rc(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=uc(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return ac(a,o,n,s,c,l,0),o}function rc(e,t,n,r,i){let a;if(i===Pc(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=jc(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=jc(i/r|0,e[i],e[i+1],a);return a&&Cc(a,a.next)&&(Mc(a),a=a.next),a}function ic(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(Cc(n,n.next)||Sc(n.prev,n,n.next)===0)){if(Mc(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function ac(e,t,n,r,i,a,o){if(!e)return;!o&&a&&hc(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?sc(e,r,i,a):oc(e)){t.push(c.i,e.i,l.i),Mc(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=cc(ic(e),t),ac(e,t,n,r,i,a,2)):o===2&&lc(e,t,n,r,i,a):ac(ic(e),t,n,r,i,a,1);break}}}function oc(e){let t=e.prev,n=e,r=e.next;if(Sc(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&bc(i,s,a,c,o,l,m.x,m.y)&&Sc(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function sc(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Sc(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=_c(p,m,t,n,r),v=_c(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&bc(s,u,c,d,l,f,y.x,y.y)&&Sc(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&bc(s,u,c,d,l,f,b.x,b.y)&&Sc(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&bc(s,u,c,d,l,f,y.x,y.y)&&Sc(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&bc(s,u,c,d,l,f,b.x,b.y)&&Sc(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function cc(e,t){let n=e;do{let r=n.prev,i=n.next.next;!Cc(r,i)&&wc(r,n,n.next,i)&&Oc(r,i)&&Oc(i,r)&&(t.push(r.i,n.i,i.i),Mc(n),Mc(n.next),n=e=i),n=n.next}while(n!==e);return ic(n)}function lc(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&xc(o,e)){let s=Ac(o,e);o=ic(o,o.next),s=ic(s,s.next),ac(o,t,n,r,i,a,0),ac(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function uc(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=rc(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(vc(o))}i.sort(dc);for(let e=0;e<i.length;e++)n=fc(i[e],n);return n}function dc(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function fc(e,t){let n=pc(e,t);if(!n)return t;let r=Ac(n,e);return ic(r,r.next),ic(n,n.next)}function pc(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(Cc(e,n))return n;do{if(Cc(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&yc(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Oc(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&mc(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function mc(e,t){return Sc(e.prev,e,t.prev)<0&&Sc(t.next,e,e.next)<0}function hc(e,t,n,r){let i=e;do i.z===0&&(i.z=_c(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,gc(i)}function gc(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function _c(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function vc(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function yc(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function bc(e,t,n,r,i,a,o,s){return!(e===o&&t===s)&&yc(e,t,n,r,i,a,o,s)}function xc(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Dc(e,t)&&(Oc(e,t)&&Oc(t,e)&&kc(e,t)&&(Sc(e.prev,e,t.prev)||Sc(e,t.prev,t))||Cc(e,t)&&Sc(e.prev,e,e.next)>0&&Sc(t.prev,t,t.next)>0)}function Sc(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Cc(e,t){return e.x===t.x&&e.y===t.y}function wc(e,t,n,r){let i=Ec(Sc(e,t,n)),a=Ec(Sc(e,t,r)),o=Ec(Sc(n,r,e)),s=Ec(Sc(n,r,t));return!!(i!==a&&o!==s||i===0&&Tc(e,n,t)||a===0&&Tc(e,r,t)||o===0&&Tc(n,e,r)||s===0&&Tc(n,t,r))}function Tc(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Ec(e){return e>0?1:e<0?-1:0}function Dc(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&wc(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Oc(e,t){return Sc(e.prev,e,e.next)<0?Sc(e,t,e.next)>=0&&Sc(e,e.prev,t)>=0:Sc(e,t,e.prev)<0||Sc(e,e.next,t)<0}function kc(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Ac(e,t){let n=Nc(e.i,e.x,e.y),r=Nc(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function jc(e,t,n,r){let i=Nc(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function Mc(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Nc(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Pc(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var Fc=class{static triangulate(e,t,n=2){return nc(e,t,n)}},Ic=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Lc(e),Rc(n,e);let a=e.length;t.forEach(Lc);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Rc(n,t[e]);let o=Fc.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Lc(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Rc(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var zc=class e extends io{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Ka(p,3)),this.setAttribute(`normal`,new Ka(m,3)),this.setAttribute(`uv`,new Ka(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Bc=class extends io{constructor(e=null){if(super(),this.type=`WireframeGeometry`,this.parameters={geometry:e},e!==null){let t=[],n=new Set,r=new G,i=new G;if(e.index!==null){let a=e.attributes.position,o=e.index,s=e.groups;s.length===0&&(s=[{start:0,count:o.count,materialIndex:0}]);for(let e=0,c=s.length;e<c;++e){let c=s[e],l=c.start,u=c.count;for(let e=l,s=l+u;e<s;e+=3)for(let s=0;s<3;s++){let c=o.getX(e+s),l=o.getX(e+(s+1)%3);r.fromBufferAttribute(a,c),i.fromBufferAttribute(a,l),Vc(r,i,n)===!0&&(t.push(r.x,r.y,r.z),t.push(i.x,i.y,i.z))}}}else{let a=e.attributes.position;for(let e=0,o=a.count/3;e<o;e++)for(let o=0;o<3;o++){let s=3*e+o,c=3*e+(o+1)%3;r.fromBufferAttribute(a,s),i.fromBufferAttribute(a,c),Vc(r,i,n)===!0&&(t.push(r.x,r.y,r.z),t.push(i.x,i.y,i.z))}}this.setAttribute(`position`,new Ka(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Vc(e,t,n){let r=`${e.x},${e.y},${e.z}-${t.x},${t.y},${t.z}`,i=`${t.x},${t.y},${t.z}-${e.x},${e.y},${e.z}`;return n.has(r)===!0||n.has(i)===!0?!1:(n.add(r),n.add(i),!0)}function Hc(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Wc(i))i.isRenderTargetTexture?(V(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i))if(Wc(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice();else t[n][r]=i}}return t}function Uc(e){let t={};for(let n=0;n<e.length;n++){let r=Hc(e[n]);for(let e in r)t[e]=r[e]}return t}function Wc(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Gc(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Kc(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:q.workingColorSpace}var qc={clone:Hc,merge:Uc},Jc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Xc=class extends lo{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jc,this.fragmentShader=Yc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hc(e.uniforms),this.uniformsGroups=Gc(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Zc=class extends Xc{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Qc=class extends lo{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new Y(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Y(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},$c=class extends Qc{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new W(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return U(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Y(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Y(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Y(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},el=class extends lo{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type=`MeshPhongMaterial`,this.color=new Y(16777215),this.specular=new Y(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Y(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},tl=class extends lo{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new Y(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Y(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},nl=class extends lo{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=fr,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},rl=class extends lo{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function il(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function al(e){function t(t,n){return e[t]-e[n]}let n=e.length,r=Array(n);for(let e=0;e!==n;++e)r[e]=e;return r.sort(t),r}function ol(e,t,n){let r=e.length,i=new e.constructor(r);for(let a=0,o=0;o!==r;++a){let r=n[a]*t;for(let n=0;n!==t;++n)i[o++]=e[r+n]}return i}function sl(e,t,n,r){let i=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[i++];if(a===void 0)return;let o=a[r];if(o!==void 0)if(Array.isArray(o))do o=a[r],o!==void 0&&(t.push(a.time),n.push(...o)),a=e[i++];while(a!==void 0);else if(o.toArray!==void 0)do o=a[r],o!==void 0&&(t.push(a.time),o.toArray(n,n.length)),a=e[i++];while(a!==void 0);else do o=a[r],o!==void 0&&(t.push(a.time),n.push(o)),a=e[i++];while(a!==void 0)}var cl=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},ll=class extends cl{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:cr,endingEnd:cr}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case lr:i=e,o=2*t-n;break;case ur:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case lr:a=e,s=2*n-t;break;case ur:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},ul=class extends cl{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},dl=class extends cl{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},fl=class extends cl{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.settings||this.DefaultSettings_,u=l.inTangents,d=l.outTangents;if(!u||!d){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let f=o*2,p=e-1;for(let l=0;l!==o;++l){let o=a[c+l],m=a[s+l],h=p*f+l*2,g=d[h],_=d[h+1],v=e*f+l*2,y=u[v],b=u[v+1],x=(n-t)/(r-t),S,C,w,T,E;for(let e=0;e<8;e++){S=x*x,C=S*x,w=1-x,T=w*w,E=T*w;let e=E*t+3*T*x*g+3*w*S*y+C*r-n;if(Math.abs(e)<1e-10)break;let i=3*T*(g-t)+6*w*x*(y-g)+3*S*(r-y);if(Math.abs(i)<1e-10)break;x-=e/i,x=Math.max(0,Math.min(1,x))}i[l]=E*o+3*T*x*_+3*w*S*b+C*m}return i}},pl=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=il(t,this.TimeBufferType),this.values=il(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:il(e.times,Array),values:il(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new dl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ul(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ll(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new fl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.settings=this.settings),t}setInterpolation(e){let t;switch(e){case ir:t=this.InterpolantFactoryMethodDiscrete;break;case ar:t=this.InterpolantFactoryMethodLinear;break;case or:t=this.InterpolantFactoryMethodSmooth;break;case sr:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t);return V(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ir;case this.InterpolantFactoryMethodLinear:return ar;case this.InterpolantFactoryMethodSmooth:return or;case this.InterpolantFactoryMethodBezier:return sr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(H(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(H(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){H(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){H(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Cr(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){H(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===or,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0]))if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};pl.prototype.ValueTypeName=``,pl.prototype.TimeBufferType=Float32Array,pl.prototype.ValueBufferType=Float32Array,pl.prototype.DefaultInterpolation=ar;var ml=class extends pl{constructor(e,t,n){super(e,t,n)}};ml.prototype.ValueTypeName=`bool`,ml.prototype.ValueBufferType=Array,ml.prototype.DefaultInterpolation=ir,ml.prototype.InterpolantFactoryMethodLinear=void 0,ml.prototype.InterpolantFactoryMethodSmooth=void 0;var hl=class extends pl{constructor(e,t,n,r){super(e,t,n,r)}};hl.prototype.ValueTypeName=`color`;var gl=class extends pl{constructor(e,t,n,r){super(e,t,n,r)}};gl.prototype.ValueTypeName=`number`;var _l=class extends cl{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)oi.slerpFlat(i,0,a,c-o,a,c,s);return i}},vl=class extends pl{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new _l(this.times,this.values,this.getValueSize(),e)}};vl.prototype.ValueTypeName=`quaternion`,vl.prototype.InterpolantFactoryMethodSmooth=void 0;var yl=class extends pl{constructor(e,t,n){super(e,t,n)}};yl.prototype.ValueTypeName=`string`,yl.prototype.ValueBufferType=Array,yl.prototype.DefaultInterpolation=ir,yl.prototype.InterpolantFactoryMethodLinear=void 0,yl.prototype.InterpolantFactoryMethodSmooth=void 0;var bl=class extends pl{constructor(e,t,n,r){super(e,t,n,r)}};bl.prototype.ValueTypeName=`vector`;var xl=class{constructor(e=``,t=-1,n=[],r=dr){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=Rr(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let e=0,i=n.length;e!==i;++e)t.push(Cl(n[e]).scale(r));let i=new this(e.name,e.duration,t,e.blendMode);return i.uuid=e.uuid,i.userData=JSON.parse(e.userData||`{}`),i}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let e=0,r=n.length;e!==r;++e)t.push(pl.toJSON(n[e]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let i=t.length,a=[];for(let e=0;e<i;e++){let o=[],s=[];o.push((e+i-1)%i,e,(e+1)%i),s.push(0,1,0);let c=al(o);o=ol(o,1,c),s=ol(s,1,c),!r&&o[0]===0&&(o.push(i),s.push(s[0])),a.push(new gl(`.morphTargetInfluences[`+t[e].name+`]`,o,s).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let t=e;n=t.geometry&&t.geometry.animations||t.animations}for(let e=0;e<n.length;e++)if(n[e].name===t)return n[e];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},i=/^([\w-]*?)([\d]+)$/;for(let t=0,n=e.length;t<n;t++){let n=e[t],a=n.name.match(i);if(a&&a.length>1){let e=a[1],t=r[e];t||(r[e]=t=[]),t.push(n)}}let a=[];for(let e in r)a.push(this.CreateFromMorphTargetSequence(e,r[e],t,n));return a}static parseAnimation(e,t){if(V(`AnimationClip: parseAnimation() is deprecated and will be removed with r185`),!e)return H(`AnimationClip: No animation in JSONLoader data.`),null;let n=function(e,t,n,r,i){if(n.length!==0){let a=[],o=[];sl(n,a,o,r),a.length!==0&&i.push(new e(t,a,o))}},r=[],i=e.name||`default`,a=e.fps||30,o=e.blendMode,s=e.length||-1,c=e.hierarchy||[];for(let e=0;e<c.length;e++){let i=c[e].keys;if(!(!i||i.length===0))if(i[0].morphTargets){let e={},t;for(t=0;t<i.length;t++)if(i[t].morphTargets)for(let n=0;n<i[t].morphTargets.length;n++)e[i[t].morphTargets[n]]=-1;for(let n in e){let e=[],a=[];for(let r=0;r!==i[t].morphTargets.length;++r){let r=i[t];e.push(r.time),a.push(+(r.morphTarget===n))}r.push(new gl(`.morphTargetInfluence[`+n+`]`,e,a))}s=e.length*a}else{let a=`.bones[`+t[e].name+`]`;n(bl,a+`.position`,i,`pos`,r),n(vl,a+`.quaternion`,i,`rot`,r),n(bl,a+`.scale`,i,`scl`,r)}}return r.length===0?null:new this(i,s,r,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let e=this.tracks[n];t=Math.max(t,e.times[e.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e&&=this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Sl(e){switch(e.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return gl;case`vector`:case`vector2`:case`vector3`:case`vector4`:return bl;case`color`:return hl;case`quaternion`:return vl;case`bool`:case`boolean`:return ml;case`string`:return yl}throw Error(`THREE.KeyframeTrack: Unsupported typeName: `+e)}function Cl(e){if(e.type===void 0)throw Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let t=Sl(e.type);if(e.times===void 0){let t=[],n=[];sl(e.keys,t,n,`value`),e.times=t,e.values=n}return t.parse===void 0?new t(e.name,e.times,e.values,e.interpolation):t.parse(e)}var wl={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(Tl(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!Tl(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function Tl(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var El=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},Dl=class{constructor(e){this.manager=e===void 0?El:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Dl.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Ol={},kl=class extends Error{constructor(e,t){super(e),this.response=t}},Al=class extends Dl{constructor(e){super(e),this.mimeType=``,this.responseType=``,this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=wl.get(`file:${e}`);if(i!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(i),this.manager.itemEnd(e)},0);return}if(Ol[e]!==void 0){Ol[e].push({onLoad:t,onProgress:n,onError:r});return}Ol[e]=[],Ol[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?`include`:`same-origin`,signal:typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,s=this.responseType;fetch(a).then(t=>{if(t.status===200||t.status===0){if(t.status===0&&V(`FileLoader: HTTP Status 0 received.`),typeof ReadableStream>`u`||t.body===void 0||t.body.getReader===void 0)return t;let n=Ol[e],r=t.body.getReader(),i=t.headers.get(`X-File-Size`)||t.headers.get(`Content-Length`),a=i?parseInt(i):0,o=a!==0,s=0,c=new ReadableStream({start(e){t();function t(){r.read().then(({done:r,value:i})=>{if(r)e.close();else{s+=i.byteLength;let r=new ProgressEvent(`progress`,{lengthComputable:o,loaded:s,total:a});for(let e=0,t=n.length;e<t;e++){let t=n[e];t.onProgress&&t.onProgress(r)}e.enqueue(i),t()}},t=>{e.error(t)})}}});return new Response(c)}else throw new kl(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`,t)}).then(e=>{switch(s){case`arraybuffer`:return e.arrayBuffer();case`blob`:return e.blob();case`document`:return e.text().then(e=>new DOMParser().parseFromString(e,o));case`json`:return e.json();default:if(o===``)return e.text();{let t=/charset="?([^;"\s]*)"?/i.exec(o),n=t&&t[1]?t[1].toLowerCase():void 0,r=new TextDecoder(n);return e.arrayBuffer().then(e=>r.decode(e))}}}).then(t=>{wl.add(`file:${e}`,t);let n=Ol[e];delete Ol[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onLoad&&r.onLoad(t)}}).catch(t=>{let n=Ol[e];if(n===void 0)throw this.manager.itemError(e),t;delete Ol[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onError&&r.onError(t)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},jl=new WeakMap,Ml=class extends Dl{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=wl.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=jl.get(a);e===void 0&&(e=[],jl.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=wr(`img`);function s(){l(),t&&t(this);let n=jl.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}jl.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),wl.remove(`image:${e}`);let n=jl.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}jl.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),wl.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},Nl=class extends Dl{constructor(e){super(e)}load(e,t,n,r){let i=new Si,a=new Ml(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},Pl=class extends ta{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new Y(e),this.intensity=t}dispose(){this.dispatchEvent({type:`dispose`})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Fl=new J,Il=new G,Ll=new G,Rl=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new W(512,512),this.mapType=Qt,this.map=null,this.mapPass=null,this.matrix=new J,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ds,this._frameExtents=new W(1,1),this._viewportCount=1,this._viewports=[new Ci(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Il.setFromMatrixPosition(e.matrixWorld),t.position.copy(Il),Ll.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ll),t.updateMatrixWorld(),Fl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Fl,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===2001||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Fl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},zl=new G,Bl=new oi,Vl=new G,Hl=class extends ta{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new J,this.projectionMatrix=new J,this.projectionMatrixInverse=new J,this.coordinateSystem=xr,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(zl,Bl,Vl),Vl.x===1&&Vl.y===1&&Vl.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(zl,Bl,Vl.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(zl,Bl,Vl),Vl.x===1&&Vl.y===1&&Vl.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(zl,Bl,Vl.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ul=new G,Wl=new W,Gl=new W,Kl=class extends Hl{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Lr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ir*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Lr*2*Math.atan(Math.tan(Ir*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ul.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ul.x,Ul.y).multiplyScalar(-e/Ul.z),Ul.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ul.x,Ul.y).multiplyScalar(-e/Ul.z)}getViewSize(e,t){return this.getViewBounds(e,Wl,Gl),t.subVectors(Gl,Wl)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ir*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ql=class extends Rl{constructor(){super(new Kl(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Lr*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Jl=class extends Pl{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(ta.DEFAULT_UP),this.updateMatrix(),this.target=new ta,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new ql}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Yl=class extends Rl{constructor(){super(new Kl(90,1,.5,500)),this.isPointLightShadow=!0}},Xl=class extends Pl{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new Yl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Zl=class extends Hl{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ql=class extends Rl{constructor(){super(new Zl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$l=class extends Pl{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ta.DEFAULT_UP),this.updateMatrix(),this.target=new ta,this.shadow=new Ql}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},eu=class extends Pl{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},tu=class{static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.slice(0,t+1)}static resolveURL(e,t){return typeof e!=`string`||e===``?``:(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,`$1`)),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},nu=class extends io{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type=`InstancedBufferGeometry`,this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},ru=new WeakMap,iu=class extends Dl{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>`u`&&V(`ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&V(`ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=wl.get(`image-bitmap:${e}`);if(a!==void 0){if(i.manager.itemStart(e),a.then){a.then(n=>{ru.has(a)===!0?(r&&r(ru.get(a)),i.manager.itemError(e),i.manager.itemEnd(e)):(t&&t(n),i.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);return}let o={};o.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let s=fetch(e,o).then(function(e){return e.blob()}).then(function(e){return createImageBitmap(e,Object.assign(i.options,{colorSpaceConversion:`none`}))}).then(function(n){wl.add(`image-bitmap:${e}`,n),t&&t(n),i.manager.itemEnd(e)}).catch(function(t){r&&r(t),ru.set(s,t),wl.remove(`image-bitmap:${e}`),i.manager.itemError(e),i.manager.itemEnd(e)});wl.add(`image-bitmap:${e}`,s),i.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},au=-90,ou=1,su=class extends ta{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Kl(au,ou,e,t);r.layers=this.layers,this.add(r);let i=new Kl(au,ou,e,t);i.layers=this.layers,this.add(i);let a=new Kl(au,ou,e,t);a.layers=this.layers,this.add(a);let o=new Kl(au,ou,e,t);o.layers=this.layers,this.add(o);let s=new Kl(au,ou,e,t);s.layers=this.layers,this.add(s);let c=new Kl(au,ou,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},cu=class extends Kl{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},lu=`\\[\\]\\.:\\/`,uu=RegExp(`[\\[\\]\\.:\\/]`,`g`),du=`[^\\[\\]\\.:\\/]`,fu=`[^`+lu.replace(`\\.`,``)+`]`,pu=`((?:WC+[\\/:])*)`.replace(`WC`,du),mu=`(WCOD+)?`.replace(`WCOD`,fu),hu=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,du),gu=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,du),_u=RegExp(`^`+pu+mu+hu+gu+`$`),vu=[`material`,`materials`,`bones`,`map`],yu=class{constructor(e,t,n){let r=n||bu.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},bu=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(uu,``)}static parseTrackName(e){let t=_u.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);vu.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){V(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){H(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){H(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){H(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){H(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){H(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){H(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){H(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;H(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){H(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){H(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};bu.Composite=yu,bu.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},bu.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},bu.prototype.GetterByBindingType=[bu.prototype._getValue_direct,bu.prototype._getValue_array,bu.prototype._getValue_arrayElement,bu.prototype._getValue_toArray],bu.prototype.SetterByBindingTypeAndVersioning=[[bu.prototype._setValue_direct,bu.prototype._setValue_direct_setNeedsUpdate,bu.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[bu.prototype._setValue_array,bu.prototype._setValue_array_setNeedsUpdate,bu.prototype._setValue_array_setMatrixWorldNeedsUpdate],[bu.prototype._setValue_arrayElement,bu.prototype._setValue_arrayElement_setNeedsUpdate,bu.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[bu.prototype._setValue_fromArray,bu.prototype._setValue_fromArray_setNeedsUpdate,bu.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var xu=class extends ao{constructor(e,t,n=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}},Su=new J,Cu=class{constructor(e,t,n=0,r=1/0){this.ray=new Po(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new zi,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):H(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Su.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Su),this}intersectObject(e,t=!0,n=[]){return Tu(e,this,n,t),n.sort(wu),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Tu(e[r],this,n,t);return n.sort(wu),n}};function wu(e,t){return e.distance-t.distance}function Tu(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Tu(r[e],t,n,!0)}}var Eu=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,V(`Clock: This module has been deprecated. Please use THREE.Timer instead.`)}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},Du=class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}},Ou=new G,ku=new G,Au=new G,ju=new G,Mu=new G,Nu=new G,Pu=new G,Fu=class{constructor(e=new G,t=new G){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){Ou.subVectors(e,this.start),ku.subVectors(this.end,this.start);let n=ku.dot(ku);if(n===0)return 0;let r=ku.dot(Ou)/n;return t&&(r=U(r,0,1)),r}closestPointToPoint(e,t,n){let r=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=Nu,n=Pu){let r=1e-8*1e-8,i,a,o=this.start,s=e.start,c=this.end,l=e.end;Au.subVectors(c,o),ju.subVectors(l,s),Mu.subVectors(o,s);let u=Au.dot(Au),d=ju.dot(ju),f=ju.dot(Mu);if(u<=r&&d<=r)return t.copy(o),n.copy(s),t.sub(n),t.dot(t);if(u<=r)i=0,a=f/d,a=U(a,0,1);else{let e=Au.dot(Mu);if(d<=r)a=0,i=U(-e/u,0,1);else{let t=Au.dot(ju),n=u*d-t*t;i=n===0?0:U((t*f-e*d)/n,0,1),a=(t*i+f)/d,a<0?(a=0,i=U(-e/u,0,1)):a>1&&(a=1,i=U((t-e)/u,0,1))}}return t.copy(o).addScaledVector(Au,i),n.copy(s).addScaledVector(ju,a),t.distanceToSquared(n)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}},Iu=new G,Lu=new Hl,Ru=class extends Bs{constructor(e){let t=new io,n=new Os({color:16777215,vertexColors:!0,toneMapped:!1}),r=[],i=[],a={};o(`n1`,`n2`),o(`n2`,`n4`),o(`n4`,`n3`),o(`n3`,`n1`),o(`f1`,`f2`),o(`f2`,`f4`),o(`f4`,`f3`),o(`f3`,`f1`),o(`n1`,`f1`),o(`n2`,`f2`),o(`n3`,`f3`),o(`n4`,`f4`),o(`p`,`n1`),o(`p`,`n2`),o(`p`,`n3`),o(`p`,`n4`),o(`u1`,`u2`),o(`u2`,`u3`),o(`u3`,`u1`),o(`c`,`t`),o(`p`,`c`),o(`cn1`,`cn2`),o(`cn3`,`cn4`),o(`cf1`,`cf2`),o(`cf3`,`cf4`);function o(e,t){s(e),s(t)}function s(e){r.push(0,0,0),i.push(0,0,0),a[e]===void 0&&(a[e]=[]),a[e].push(r.length/3-1)}t.setAttribute(`position`,new Ka(r,3)),t.setAttribute(`color`,new Ka(i,3)),super(t,n),this.type=`CameraHelper`,this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=a,this.update();let c=new Y(16755200),l=new Y(16711680),u=new Y(43775),d=new Y(16777215),f=new Y(3355443);this.setColors(c,l,u,d,f)}setColors(e,t,n,r,i){let a=this.geometry.getAttribute(`color`);return a.setXYZ(0,e.r,e.g,e.b),a.setXYZ(1,e.r,e.g,e.b),a.setXYZ(2,e.r,e.g,e.b),a.setXYZ(3,e.r,e.g,e.b),a.setXYZ(4,e.r,e.g,e.b),a.setXYZ(5,e.r,e.g,e.b),a.setXYZ(6,e.r,e.g,e.b),a.setXYZ(7,e.r,e.g,e.b),a.setXYZ(8,e.r,e.g,e.b),a.setXYZ(9,e.r,e.g,e.b),a.setXYZ(10,e.r,e.g,e.b),a.setXYZ(11,e.r,e.g,e.b),a.setXYZ(12,e.r,e.g,e.b),a.setXYZ(13,e.r,e.g,e.b),a.setXYZ(14,e.r,e.g,e.b),a.setXYZ(15,e.r,e.g,e.b),a.setXYZ(16,e.r,e.g,e.b),a.setXYZ(17,e.r,e.g,e.b),a.setXYZ(18,e.r,e.g,e.b),a.setXYZ(19,e.r,e.g,e.b),a.setXYZ(20,e.r,e.g,e.b),a.setXYZ(21,e.r,e.g,e.b),a.setXYZ(22,e.r,e.g,e.b),a.setXYZ(23,e.r,e.g,e.b),a.setXYZ(24,t.r,t.g,t.b),a.setXYZ(25,t.r,t.g,t.b),a.setXYZ(26,t.r,t.g,t.b),a.setXYZ(27,t.r,t.g,t.b),a.setXYZ(28,t.r,t.g,t.b),a.setXYZ(29,t.r,t.g,t.b),a.setXYZ(30,t.r,t.g,t.b),a.setXYZ(31,t.r,t.g,t.b),a.setXYZ(32,n.r,n.g,n.b),a.setXYZ(33,n.r,n.g,n.b),a.setXYZ(34,n.r,n.g,n.b),a.setXYZ(35,n.r,n.g,n.b),a.setXYZ(36,n.r,n.g,n.b),a.setXYZ(37,n.r,n.g,n.b),a.setXYZ(38,r.r,r.g,r.b),a.setXYZ(39,r.r,r.g,r.b),a.setXYZ(40,i.r,i.g,i.b),a.setXYZ(41,i.r,i.g,i.b),a.setXYZ(42,i.r,i.g,i.b),a.setXYZ(43,i.r,i.g,i.b),a.setXYZ(44,i.r,i.g,i.b),a.setXYZ(45,i.r,i.g,i.b),a.setXYZ(46,i.r,i.g,i.b),a.setXYZ(47,i.r,i.g,i.b),a.setXYZ(48,i.r,i.g,i.b),a.setXYZ(49,i.r,i.g,i.b),a.needsUpdate=!0,this}update(){let e=this.geometry,t=this.pointMap,n,r;if(Lu.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)n=1,r=0;else if(this.camera.coordinateSystem===2e3)n=-1,r=1;else if(this.camera.coordinateSystem===2001)n=0,r=1;else throw Error(`THREE.CameraHelper.update(): Invalid coordinate system: `+this.camera.coordinateSystem);zu(`c`,t,e,Lu,0,0,n),zu(`t`,t,e,Lu,0,0,r),zu(`n1`,t,e,Lu,-1,-1,n),zu(`n2`,t,e,Lu,1,-1,n),zu(`n3`,t,e,Lu,-1,1,n),zu(`n4`,t,e,Lu,1,1,n),zu(`f1`,t,e,Lu,-1,-1,r),zu(`f2`,t,e,Lu,1,-1,r),zu(`f3`,t,e,Lu,-1,1,r),zu(`f4`,t,e,Lu,1,1,r),zu(`u1`,t,e,Lu,1*.7,1*1.1,n),zu(`u2`,t,e,Lu,-1*.7,1*1.1,n),zu(`u3`,t,e,Lu,0,2,n),zu(`cf1`,t,e,Lu,-1,0,r),zu(`cf2`,t,e,Lu,1,0,r),zu(`cf3`,t,e,Lu,0,-1,r),zu(`cf4`,t,e,Lu,0,1,r),zu(`cn1`,t,e,Lu,-1,0,n),zu(`cn2`,t,e,Lu,1,0,n),zu(`cn3`,t,e,Lu,0,-1,n),zu(`cn4`,t,e,Lu,0,1,n),e.getAttribute(`position`).needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}};function zu(e,t,n,r,i,a,o){Iu.set(i,a,o).unproject(r);let s=t[e];if(s!==void 0){let e=n.getAttribute(`position`);for(let t=0,n=s.length;t<n;t++)e.setXYZ(s[t],Iu.x,Iu.y,Iu.z)}}function Bu(e,t,n,r){let i=Vu(r);switch(n){case fn:return e*t;case _n:return e*t/i.components*i.byteLength;case vn:return e*t/i.components*i.byteLength;case yn:return e*t*2/i.components*i.byteLength;case bn:return e*t*2/i.components*i.byteLength;case pn:return e*t*3/i.components*i.byteLength;case mn:return e*t*4/i.components*i.byteLength;case xn:return e*t*4/i.components*i.byteLength;case Sn:case Cn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case wn:case Tn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Dn:case kn:return Math.max(e,16)*Math.max(t,8)/4;case En:case On:return Math.max(e,8)*Math.max(t,8)/2;case An:case jn:case Nn:case Pn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Mn:case Fn:case In:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ln:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Rn:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case zn:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Bn:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Vn:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Hn:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Un:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Wn:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Gn:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Kn:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case qn:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Jn:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Yn:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Xn:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Zn:case Qn:case $n:return Math.ceil(e/4)*Math.ceil(t/4)*16;case er:case tr:return Math.ceil(e/4)*Math.ceil(t/4)*8;case nr:case rr:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Vu(e){switch(e){case Qt:case $t:return{byteLength:1,components:1};case tn:case en:case on:return{byteLength:2,components:1};case sn:case cn:return{byteLength:2,components:4};case rn:case nn:case an:return{byteLength:4,components:1};case un:case dn:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`184`}})),typeof window<`u`&&(window.__THREE__?V(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`184`);function Hu(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Uu(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var X={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Z={common:{diffuse:{value:new Y(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new K},alphaMap:{value:null},alphaMapTransform:{value:new K},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new K}},envmap:{envMap:{value:null},envMapRotation:{value:new K},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new K}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new K}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new K},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new K},normalScale:{value:new W(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new K},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new K}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new K}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new K}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Y(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new G},probesMax:{value:new G},probesResolution:{value:new G}},points:{diffuse:{value:new Y(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new K},alphaTest:{value:0},uvTransform:{value:new K}},sprite:{diffuse:{value:new Y(16777215)},opacity:{value:1},center:{value:new W(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new K},alphaMap:{value:null},alphaMapTransform:{value:new K},alphaTest:{value:0}}},Wu={basic:{uniforms:Uc([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.fog]),vertexShader:X.meshbasic_vert,fragmentShader:X.meshbasic_frag},lambert:{uniforms:Uc([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new Y(0)},envMapIntensity:{value:1}}]),vertexShader:X.meshlambert_vert,fragmentShader:X.meshlambert_frag},phong:{uniforms:Uc([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new Y(0)},specular:{value:new Y(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:X.meshphong_vert,fragmentShader:X.meshphong_frag},standard:{uniforms:Uc([Z.common,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.roughnessmap,Z.metalnessmap,Z.fog,Z.lights,{emissive:{value:new Y(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag},toon:{uniforms:Uc([Z.common,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.gradientmap,Z.fog,Z.lights,{emissive:{value:new Y(0)}}]),vertexShader:X.meshtoon_vert,fragmentShader:X.meshtoon_frag},matcap:{uniforms:Uc([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,{matcap:{value:null}}]),vertexShader:X.meshmatcap_vert,fragmentShader:X.meshmatcap_frag},points:{uniforms:Uc([Z.points,Z.fog]),vertexShader:X.points_vert,fragmentShader:X.points_frag},dashed:{uniforms:Uc([Z.common,Z.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:X.linedashed_vert,fragmentShader:X.linedashed_frag},depth:{uniforms:Uc([Z.common,Z.displacementmap]),vertexShader:X.depth_vert,fragmentShader:X.depth_frag},normal:{uniforms:Uc([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,{opacity:{value:1}}]),vertexShader:X.meshnormal_vert,fragmentShader:X.meshnormal_frag},sprite:{uniforms:Uc([Z.sprite,Z.fog]),vertexShader:X.sprite_vert,fragmentShader:X.sprite_frag},background:{uniforms:{uvTransform:{value:new K},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:X.background_vert,fragmentShader:X.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new K}},vertexShader:X.backgroundCube_vert,fragmentShader:X.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:X.cube_vert,fragmentShader:X.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:X.equirect_vert,fragmentShader:X.equirect_frag},distance:{uniforms:Uc([Z.common,Z.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:X.distance_vert,fragmentShader:X.distance_frag},shadow:{uniforms:Uc([Z.lights,Z.fog,{color:{value:new Y(0)},opacity:{value:1}}]),vertexShader:X.shadow_vert,fragmentShader:X.shadow_frag}};Wu.physical={uniforms:Uc([Wu.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new K},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new K},clearcoatNormalScale:{value:new W(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new K},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new K},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new K},sheen:{value:0},sheenColor:{value:new Y(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new K},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new K},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new K},transmissionSamplerSize:{value:new W},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new K},attenuationDistance:{value:0},attenuationColor:{value:new Y(0)},specularColor:{value:new Y(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new K},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new K},anisotropyVector:{value:new W},anisotropyMap:{value:null},anisotropyMapTransform:{value:new K}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag};var Gu={r:0,b:0,g:0},Ku=new J,qu=new K;qu.set(-1,0,0,0,1,0,0,0,1);function Ju(e,t,n,r,i,a){let o=new Y(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new qo(new $s(1,1,1),new Xc({name:`BackgroundCubeMaterial`,uniforms:Hc(Wu.backgroundCube.uniforms),vertexShader:Wu.backgroundCube.vertexShader,fragmentShader:Wu.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ku.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(qu),l.material.toneMapped=q.getTransfer(i.colorSpace)!==gr,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new qo(new zc(2,2),new Xc({name:`BackgroundMaterial`,uniforms:Hc(Wu.background.uniforms),vertexShader:Wu.background.vertexShader,fragmentShader:Wu.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=q.getTransfer(i.colorSpace)!==gr,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Gu,Kc(e)),n.buffers.color.setClear(Gu.r,Gu.g,Gu.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Yu(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Xu(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Zu(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return!(t!==1023&&r.convert(t)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(V(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&V(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Qu(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Cs,s=new K,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var $u=4,ed=[.125,.215,.35,.446,.526,.582],td=20,nd=256,rd=new Zl,id=new Y,ad=null,od=0,sd=0,cd=!1,ld=new G,ud=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=ld}=i;ad=this._renderer.getRenderTarget(),od=this._renderer.getActiveCubeFace(),sd=this._renderer.getActiveMipmapLevel(),cd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_d(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ad,od,sd),this._renderer.xr.enabled=cd,e.scissorTest=!1,pd(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ad=this._renderer.getRenderTarget(),od=this._renderer.getActiveCubeFace(),sd=this._renderer.getActiveMipmapLevel(),cd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Jt,minFilter:Jt,generateMipmaps:!1,type:on,format:mn,colorSpace:mr,depthBuffer:!1},r=fd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=fd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=dd(r)),this._blurMaterial=hd(r,e,t),this._ggxMaterial=md(r,e,t)}return r}_compileMaterial(e){let t=new qo(new io,e);this._renderer.compile(t,rd)}_sceneToCubeUV(e,t,n,r,i){let a=new Kl(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(id),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new qo(new $s,new Fo({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(id),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;pd(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=_d()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gd());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;pd(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,rd)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(0+c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-$u?n-d+$u:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,pd(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,rd),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,pd(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,rd)}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&H(`blur direction must be either latitudinal or longitudinal!`);let l=this._lodMeshes[r];l.material=c;let u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/(2*td-1),p=i/f,m=isFinite(i)?1+Math.floor(3*p):td;m>td&&V(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${td}`);let h=[],g=0;for(let e=0;e<td;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];pd(t,3*v*(r>_-$u?r-_+$u:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,rd)}};function dd(e){let t=[],n=[],r=[],i=e,a=e-$u+1+ed.length;for(let o=0;o<a;o++){let a=2**i;t.push(a);let s=1/a;o>e-$u?s=ed[o-e+$u-1]:o===0&&(s=0),n.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new io;h.setAttribute(`position`,new Ua(f,3)),h.setAttribute(`uv`,new Ua(p,2)),h.setAttribute(`faceIndex`,new Ua(m,1)),r.push(new qo(h,null)),i>$u&&i--}return{lodMeshes:r,sizeLods:t,sigmas:n}}function fd(e,t,n){let r=new Ti(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function pd(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function md(e,t,n){return new Xc({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:nd,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function hd(e,t,n){let r=new Float32Array(td),i=new G(0,1,0);return new Xc({name:`SphericalGaussianBlur`,defines:{n:td,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:vd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function gd(){return new Xc({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:vd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function _d(){return new Xc({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function vd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var yd=class extends Ti{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ys(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new $s(5,5,5),i=new Xc({name:`CubemapFromEquirect`,uniforms:Hc(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new qo(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=Jt),new su(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function bd(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304)if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}else{let r=n.image;if(r&&r.height>0){let i=new yd(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}else return null}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new ud(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new ud(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function xd(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ar(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Sd(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Ga:Wa)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Cd(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function wd(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:H(`WebGLInfo: Unknown draw mode:`,r);break}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Td(e,t,n){let r=new WeakMap,i=new Ci;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Ei(h,p,m,u);g.type=an,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new W(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ed(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Dd={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Od(e,t,n,r,i){let a=new Ti(t,n,{type:e,depthBuffer:r,stencilBuffer:i,depthTexture:r?new Xs(t,n):void 0}),o=new Ti(t,n,{type:on,depthBuffer:!1,stencilBuffer:!1}),s=new io;s.setAttribute(`position`,new Ka([-1,3,0,-1,-1,0,3,-1,0],3)),s.setAttribute(`uv`,new Ka([0,2,0,0,2,0],2));let c=new Zc({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),l=new qo(s,c),u=new Zl(-1,1,1,-1,0,1),d=null,f=null,p=!1,m,h=null,g=[],_=!1;this.setSize=function(e,t){a.setSize(e,t),o.setSize(e,t);for(let n=0;n<g.length;n++){let r=g[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){g=e,_=g.length>0&&g[0].isRenderPass===!0;let t=a.width,n=a.height;for(let e=0;e<g.length;e++){let r=g[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(p||e.toneMapping===0&&g.length===0)return!1;if(h=t,t!==null){let e=t.width,n=t.height;(a.width!==e||a.height!==n)&&this.setSize(e,n)}return _===!1&&e.setRenderTarget(a),m=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return _},this.end=function(e,t){e.toneMapping=m,p=!0;let n=a,r=o;for(let i=0;i<g.length;i++){let a=g[i];if(a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1)){let e=n;n=r,r=e}}if(d!==e.outputColorSpace||f!==e.toneMapping){d=e.outputColorSpace,f=e.toneMapping,c.defines={},q.getTransfer(d)===`srgb`&&(c.defines.SRGB_TRANSFER=``);let t=Dd[f];t&&(c.defines[t]=``),c.needsUpdate=!0}c.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(h),e.render(l,u),h=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),s.dispose(),c.dispose()}}var kd=new Si,Ad=new Xs(1,1),jd=new Ei,Md=new Oi,Nd=new Ys,Pd=[],Fd=[],Id=new Float32Array(16),Ld=new Float32Array(9),Rd=new Float32Array(4);function zd(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Pd[i];if(a===void 0&&(a=new Float32Array(i),Pd[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Bd(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Vd(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Hd(e,t){let n=Fd[t];n===void 0&&(n=new Int32Array(t),Fd[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Ud(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Wd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Bd(n,t))return;e.uniform2fv(this.addr,t),Vd(n,t)}}function Gd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Bd(n,t))return;e.uniform3fv(this.addr,t),Vd(n,t)}}function Kd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Bd(n,t))return;e.uniform4fv(this.addr,t),Vd(n,t)}}function qd(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Bd(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Vd(n,t)}else{if(Bd(n,r))return;Rd.set(r),e.uniformMatrix2fv(this.addr,!1,Rd),Vd(n,r)}}function Jd(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Bd(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Vd(n,t)}else{if(Bd(n,r))return;Ld.set(r),e.uniformMatrix3fv(this.addr,!1,Ld),Vd(n,r)}}function Yd(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Bd(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Vd(n,t)}else{if(Bd(n,r))return;Id.set(r),e.uniformMatrix4fv(this.addr,!1,Id),Vd(n,r)}}function Xd(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Zd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Bd(n,t))return;e.uniform2iv(this.addr,t),Vd(n,t)}}function Qd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Bd(n,t))return;e.uniform3iv(this.addr,t),Vd(n,t)}}function $d(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Bd(n,t))return;e.uniform4iv(this.addr,t),Vd(n,t)}}function ef(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function tf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Bd(n,t))return;e.uniform2uiv(this.addr,t),Vd(n,t)}}function nf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Bd(n,t))return;e.uniform3uiv(this.addr,t),Vd(n,t)}}function rf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Bd(n,t))return;e.uniform4uiv(this.addr,t),Vd(n,t)}}function af(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Ad.compareFunction=n.isReversedDepthBuffer()?518:515,a=Ad):a=kd,n.setTexture2D(t||a,i)}function of(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Md,i)}function sf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Nd,i)}function cf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||jd,i)}function lf(e){switch(e){case 5126:return Ud;case 35664:return Wd;case 35665:return Gd;case 35666:return Kd;case 35674:return qd;case 35675:return Jd;case 35676:return Yd;case 5124:case 35670:return Xd;case 35667:case 35671:return Zd;case 35668:case 35672:return Qd;case 35669:case 35673:return $d;case 5125:return ef;case 36294:return tf;case 36295:return nf;case 36296:return rf;case 35678:case 36198:case 36298:case 36306:case 35682:return af;case 35679:case 36299:case 36307:return of;case 35680:case 36300:case 36308:case 36293:return sf;case 36289:case 36303:case 36311:case 36292:return cf}}function uf(e,t){e.uniform1fv(this.addr,t)}function df(e,t){let n=zd(t,this.size,2);e.uniform2fv(this.addr,n)}function ff(e,t){let n=zd(t,this.size,3);e.uniform3fv(this.addr,n)}function pf(e,t){let n=zd(t,this.size,4);e.uniform4fv(this.addr,n)}function mf(e,t){let n=zd(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function hf(e,t){let n=zd(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function gf(e,t){let n=zd(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function _f(e,t){e.uniform1iv(this.addr,t)}function vf(e,t){e.uniform2iv(this.addr,t)}function yf(e,t){e.uniform3iv(this.addr,t)}function bf(e,t){e.uniform4iv(this.addr,t)}function xf(e,t){e.uniform1uiv(this.addr,t)}function Sf(e,t){e.uniform2uiv(this.addr,t)}function Cf(e,t){e.uniform3uiv(this.addr,t)}function wf(e,t){e.uniform4uiv(this.addr,t)}function Tf(e,t,n){let r=this.cache,i=t.length,a=Hd(n,i);Bd(r,a)||(e.uniform1iv(this.addr,a),Vd(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Ad:kd;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Ef(e,t,n){let r=this.cache,i=t.length,a=Hd(n,i);Bd(r,a)||(e.uniform1iv(this.addr,a),Vd(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Md,a[e])}function Df(e,t,n){let r=this.cache,i=t.length,a=Hd(n,i);Bd(r,a)||(e.uniform1iv(this.addr,a),Vd(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Nd,a[e])}function Of(e,t,n){let r=this.cache,i=t.length,a=Hd(n,i);Bd(r,a)||(e.uniform1iv(this.addr,a),Vd(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||jd,a[e])}function kf(e){switch(e){case 5126:return uf;case 35664:return df;case 35665:return ff;case 35666:return pf;case 35674:return mf;case 35675:return hf;case 35676:return gf;case 5124:case 35670:return _f;case 35667:case 35671:return vf;case 35668:case 35672:return yf;case 35669:case 35673:return bf;case 5125:return xf;case 36294:return Sf;case 36295:return Cf;case 36296:return wf;case 35678:case 36198:case 36298:case 36306:case 35682:return Tf;case 35679:case 36299:case 36307:return Ef;case 35680:case 36300:case 36308:case 36293:return Df;case 36289:case 36303:case 36311:case 36292:return Of}}var Af=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=lf(t.type)}},jf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=kf(t.type)}},Mf=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Nf=/(\w+)(\])?(\[|\.)?/g;function Pf(e,t){e.seq.push(t),e.map[t.id]=t}function Ff(e,t,n){let r=e.name,i=r.length;for(Nf.lastIndex=0;;){let a=Nf.exec(r),o=Nf.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Pf(n,l===void 0?new Af(s,e,t):new jf(s,e,t));break}else{let e=n.map[s];e===void 0&&(e=new Mf(s),Pf(n,e)),n=e}}}var If=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ff(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Lf(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Rf=37297,zf=0;function Bf(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Vf=new K;function Hf(e){q._getMatrix(Vf,q.workingColorSpace,e);let t=`mat3( ${Vf.elements.map(e=>e.toFixed(4))} )`;switch(q.getTransfer(e)){case hr:return[t,`LinearTransferOETF`];case gr:return[t,`sRGBTransferOETF`];default:return V(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Uf(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Bf(e.getShaderSource(t),r)}else return i}function Wf(e,t){let n=Hf(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Gf={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Kf(e,t){let n=Gf[t];return n===void 0?(V(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var qf=new G;function Jf(){return q.getLuminanceCoefficients(qf),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${qf.x.toFixed(4)}, ${qf.y.toFixed(4)}, ${qf.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Yf(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Qf).join(`
`)}function Xf(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Zf(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Qf(e){return e!==``}function $f(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ep(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var tp=/^[ \t]*#include +<([\w\d./]+)>/gm;function np(e){return e.replace(tp,ip)}var rp=new Map;function ip(e,t){let n=X[t];if(n===void 0){let e=rp.get(t);if(e!==void 0)n=X[e],V(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return np(n)}var ap=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function op(e){return e.replace(ap,sp)}function sp(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function cp(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var lp={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function up(e){return lp[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var dp={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function fp(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:dp[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var pp={302:`ENVMAP_MODE_REFRACTION`};function mp(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:pp[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var hp={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function gp(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:hp[e.combine]||`ENVMAP_BLENDING_NONE`}function _p(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function vp(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=up(n),l=fp(n),u=mp(n),d=gp(n),f=_p(n),p=Yf(n),m=Xf(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Qf).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Qf).join(`
`),_.length>0&&(_+=`
`)):(g=[cp(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Qf).join(`
`),_=[cp(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:X.tonemapping_pars_fragment,n.toneMapping===0?``:Kf(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,X.colorspace_pars_fragment,Wf(`linearToOutputTexel`,n.outputColorSpace),Jf(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Qf).join(`
`)),o=np(o),o=$f(o,n),o=ep(o,n),s=np(s),s=$f(s,n),s=ep(s,n),o=op(o),s=op(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Lf(i,i.VERTEX_SHADER,y),S=Lf(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1)if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Uf(i,x,`vertex`),n=Uf(i,S,`fragment`);H(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}else o===``?(s===``||c===``)&&(u=!1):V(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new If(i,h),T=Zf(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Rf)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=zf++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var yp=0,bp=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new xp(e),t.set(e,n)),n}},xp=class{constructor(e){this.id=yp++,this.code=e,this.usedTimes=0}};function Sp(e){return e===1030||e===37490||e===36285}function Cp(e,t,n,r,i,a){let o=new zi,s=new bp,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&V(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Wu[C];D=e.vertexShader,O=e.fragmentShader}else D=i.vertexShader,O=i.fragmentShader,s.update(i),k=s.getVertexShaderID(i),A=s.getFragmentShaderID(i);let ee=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),j=h.isInstancedMesh===!0,ne=h.isBatchedMesh===!0,re=!!i.map,ie=!!i.matcap,ae=!!x,oe=!!i.aoMap,se=!!i.lightMap,ce=!!i.bumpMap,le=!!i.normalMap,ue=!!i.displacementMap,de=!!i.emissiveMap,fe=!!i.metalnessMap,pe=!!i.roughnessMap,me=i.anisotropy>0,he=i.clearcoat>0,ge=i.dispersion>0,_e=i.iridescence>0,M=i.sheen>0,ve=i.transmission>0,ye=me&&!!i.anisotropyMap,be=he&&!!i.clearcoatMap,xe=he&&!!i.clearcoatNormalMap,N=he&&!!i.clearcoatRoughnessMap,Se=_e&&!!i.iridescenceMap,P=_e&&!!i.iridescenceThicknessMap,Ce=M&&!!i.sheenColorMap,F=M&&!!i.sheenRoughnessMap,we=!!i.specularMap,I=!!i.specularColorMap,L=!!i.specularIntensityMap,Te=ve&&!!i.transmissionMap,Ee=ve&&!!i.thicknessMap,De=!!i.gradientMap,Oe=!!i.alphaMap,ke=i.alphaTest>0,Ae=!!i.alphaHash,je=!!i.extensions,Me=0;i.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Me=e.toneMapping);let Ne={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:ne,batchingColor:ne&&h._colorsTexture!==null,instancing:j,instancingColor:j&&h.instanceColor!==null,instancingMorph:j&&h.morphTexture!==null,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:q.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:ie,envMap:ae,envMapMode:ae&&x.mapping,envMapCubeUVHeight:S,aoMap:oe,lightMap:se,bumpMap:ce,normalMap:le,displacementMap:ue,emissiveMap:de,normalMapObjectSpace:le&&i.normalMapType===1,normalMapTangentSpace:le&&i.normalMapType===0,packedNormalMap:le&&i.normalMapType===0&&Sp(i.normalMap.format),metalnessMap:fe,roughnessMap:pe,anisotropy:me,anisotropyMap:ye,clearcoat:he,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:N,dispersion:ge,iridescence:_e,iridescenceMap:Se,iridescenceThicknessMap:P,sheen:M,sheenColorMap:Ce,sheenRoughnessMap:F,specularMap:we,specularColorMap:I,specularIntensityMap:L,transmission:ve,transmissionMap:Te,thicknessMap:Ee,gradientMap:De,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Oe,alphaTest:ke,alphaHash:Ae,combine:i.combine,mapUv:re&&m(i.map.channel),aoMapUv:oe&&m(i.aoMap.channel),lightMapUv:se&&m(i.lightMap.channel),bumpMapUv:ce&&m(i.bumpMap.channel),normalMapUv:le&&m(i.normalMap.channel),displacementMapUv:ue&&m(i.displacementMap.channel),emissiveMapUv:de&&m(i.emissiveMap.channel),metalnessMapUv:fe&&m(i.metalnessMap.channel),roughnessMapUv:pe&&m(i.roughnessMap.channel),anisotropyMapUv:ye&&m(i.anisotropyMap.channel),clearcoatMapUv:be&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:xe&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:N&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Se&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:P&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:F&&m(i.sheenRoughnessMap.channel),specularMapUv:we&&m(i.specularMap.channel),specularColorMapUv:I&&m(i.specularColorMap.channel),specularIntensityMapUv:L&&m(i.specularIntensityMap.channel),transmissionMapUv:Te&&m(i.transmissionMap.channel),thicknessMapUv:Ee&&m(i.thicknessMap.channel),alphaMapUv:Oe&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(le||me),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(re||Oe),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&le===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:h.isSkinnedMesh===!0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Me,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&q.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:de&&i.emissiveMap.isVideoTexture===!0&&q.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:je&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(je&&i.extensions.multiDraw===!0||ne)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ne.vertexUv1s=c.has(1),Ne.vertexUv2s=c.has(2),Ne.vertexUv3s=c.has(3),c.clear(),Ne}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Wu[t];n=qc.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new vp(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function wp(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Tp(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ep(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Dp(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Tp),r.length>1&&r.sort(t||Ep),i.length>1&&i.sort(t||Ep)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Op(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Dp,e.set(t,[i])):n>=r.length?(i=new Dp,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function kp(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new G,color:new Y};break;case`SpotLight`:n={position:new G,direction:new G,color:new Y,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new G,color:new Y,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new G,skyColor:new Y,groundColor:new Y};break;case`RectAreaLight`:n={color:new Y,position:new G,halfWidth:new G,halfHeight:new G};break}return e[t.id]=n,n}}}function Ap(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var jp=0;function Mp(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Np(e){let t=new kp,n=Ap(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new G);let i=new G,a=new J,o=new J;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Mp);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=null;if(y.shadow&&y.shadow.map&&(C=y.shadow.map.texture.format===1030?y.shadow.map.texture:y.shadow.map.depthTexture||y.shadow.map.texture),y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Z.LTC_FLOAT_1,r.rectAreaLTC2=Z.LTC_FLOAT_2):(r.rectAreaLTC1=Z.LTC_HALF_1,r.rectAreaLTC2=Z.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=jp++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Pp(e){let t=new Np(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Fp(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Pp(e),t.set(n,[a])):r>=i.length?(a=new Pp(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Ip=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lp=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Rp=[new G(1,0,0),new G(-1,0,0),new G(0,1,0),new G(0,-1,0),new G(0,0,1),new G(0,0,-1)],zp=[new G(0,-1,0),new G(0,-1,0),new G(0,0,1),new G(0,0,-1),new G(0,-1,0),new G(0,-1,0)],Bp=new J,Vp=new G,Hp=new G;function Up(e,t,n){let r=new Ds,i=new W,a=new W,o=new Ci,s=new nl,c=new rl,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Xc({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new W},radius:{value:4}},vertexShader:Ip,fragmentShader:Lp}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new io;m.setAttribute(`position`,new Ua(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new qo(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(V(`WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){V(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){V(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new Ti(i.x,i.y,{format:yn,type:on,minFilter:Jt,magFilter:Jt,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Xs(i.x,i.y,an),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=hn,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Gt,d.map.depthTexture.magFilter=Gt}else l.isPointLight?(d.map=new yd(i.x),d.map.depthTexture=new Zs(i.x,rn)):(d.map=new Ti(i.x,i.y),d.map.depthTexture=new Xs(i.x,i.y,rn)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=hn,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=Jt,d.map.depthTexture.magFilter=Jt):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=Gt,d.map.depthTexture.magFilter=Gt);d.camera.updateProjectionMatrix()}let g=d.map.isWebGLCubeRenderTarget?6:1;for(let t=0;t<g;t++){if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Vp.setFromMatrixPosition(l.matrixWorld),e.position.copy(Vp),Hp.copy(e.position),Hp.add(Rp[t]),e.up.copy(zp[t]),e.lookAt(Hp),e.updateMatrixWorld(),n.makeTranslation(-Vp.x,-Vp.y,-Vp.z),Bp.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Bp,e.coordinateSystem,e.reversedDepth)}else d.updateMatrices(l);r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Ti(i.x,i.y,{format:yn,type:on})),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Wp(e,t){function n(){let t=!1,n=new Ci,r=null,i=new Ci(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?fe(e.DEPTH_TEST):pe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Mr[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?fe(e.STENCIL_TEST):pe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Y(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,ne=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),j=ne>=2):(ne=parseFloat(/^WebGL (\d)/.exec(re)[1]),j=ne>=1);let ie=null,ae={},oe=e.getParameter(e.SCISSOR_BOX),se=e.getParameter(e.VIEWPORT),ce=new Ci().fromArray(oe),le=new Ci().fromArray(se);function ue(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let de={};de[e.TEXTURE_2D]=ue(e.TEXTURE_2D,e.TEXTURE_2D,1),de[e.TEXTURE_CUBE_MAP]=ue(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),de[e.TEXTURE_2D_ARRAY]=ue(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),de[e.TEXTURE_3D]=ue(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),fe(e.DEPTH_TEST),o.setFunc(3),be(!1),xe(1),fe(e.CULL_FACE),ve(0);function fe(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function pe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function me(t,n){return f[t]===n?!1:(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function he(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ge(t){return h===t?!1:(e.useProgram(t),h=t,!0)}let _e={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};_e[103]=e.MIN,_e[104]=e.MAX;let M={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ve(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(pe(e.BLEND),g=!1);return}if(g===!1&&(fe(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:H(`WebGLState: Invalid blending: `,t);break}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:H(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:H(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:H(`WebGLState: Invalid blending: `,t);break}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(_e[n],_e[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(M[r],M[i],M[o],M[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ye(t,n){t.side===2?pe(e.CULL_FACE):fe(e.CULL_FACE);let r=t.side===1;n&&(r=!r),be(r),t.blending===1&&t.transparent===!1?ve(0):ve(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?fe(e.SAMPLE_ALPHA_TO_COVERAGE):pe(e.SAMPLE_ALPHA_TO_COVERAGE)}function be(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function xe(t){t===0?pe(e.CULL_FACE):(fe(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function N(t){t!==k&&(j&&e.lineWidth(t),k=t)}function Se(t,n,r){t?(fe(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):pe(e.POLYGON_OFFSET_FILL)}function P(t){t?fe(e.SCISSOR_TEST):pe(e.SCISSOR_TEST)}function Ce(t){t===void 0&&(t=e.TEXTURE0+te-1),ie!==t&&(e.activeTexture(t),ie=t)}function F(t,n,r){r===void 0&&(r=ie===null?e.TEXTURE0+te-1:ie);let i=ae[r];i===void 0&&(i={type:void 0,texture:void 0},ae[r]=i),(i.type!==t||i.texture!==n)&&(ie!==r&&(e.activeTexture(r),ie=r),e.bindTexture(t,n||de[t]),i.type=t,i.texture=n)}function we(){let t=ae[ie];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function I(){try{e.compressedTexImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function L(){try{e.compressedTexImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Te(){try{e.texSubImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ee(){try{e.texSubImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Me(){try{e.texImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ne(t){return d[t]===void 0?e.getParameter(t):d[t]}function Pe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Fe(t){ce.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ce.copy(t))}function Ie(t){le.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),le.copy(t))}function Le(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Re(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function ze(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},ie=null,ae={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Y(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,ce.set(0,0,e.canvas.width,e.canvas.height),le.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:fe,disable:pe,bindFramebuffer:me,drawBuffers:he,useProgram:ge,setBlending:ve,setMaterial:ye,setFlipSided:be,setCullFace:xe,setLineWidth:N,setPolygonOffset:Se,setScissorTest:P,activeTexture:Ce,bindTexture:F,unbindTexture:we,compressedTexImage2D:I,compressedTexImage3D:L,texImage2D:je,texImage3D:Me,pixelStorei:Pe,getParameter:Ne,updateUBOMapping:Le,uniformBlockBinding:Re,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Te,texSubImage3D:Ee,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:Fe,viewport:Ie,reset:ze}}function Gp(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new W,u=new WeakMap,d=new Set,f,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function h(e,t){return m?new OffscreenCanvas(e,t):wr(`canvas`)}function g(e,t,n){let r=1,i=I(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1)if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=h(n,a));let o=t?h(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),V(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}else return`data`in e&&V(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e;return e}function _(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];V(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||V(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?hr:q.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,V(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return _(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t),t.isHTMLTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){return O}function ee(e){O=e}function te(){let e=O;return e>=i.maxTextures&&V(`WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function j(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ne(t,i){let a=r.get(t);if(t.isVideoTexture&&F(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)V(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)V(`WebGLRenderer: Texture marked for update but image is incomplete`);else{pe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function re(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){pe(a,t,i);return}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ie(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){pe(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ae(t,i){let a=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version){me(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let oe={[Ht]:e.REPEAT,[Ut]:e.CLAMP_TO_EDGE,[Wt]:e.MIRRORED_REPEAT},se={[Gt]:e.NEAREST,[Kt]:e.NEAREST_MIPMAP_NEAREST,[qt]:e.NEAREST_MIPMAP_LINEAR,[Jt]:e.LINEAR,[Yt]:e.LINEAR_MIPMAP_NEAREST,[Xt]:e.LINEAR_MIPMAP_LINEAR},ce={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function le(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&V(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,oe[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,oe[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,oe[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,se[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,se[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ce[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ue(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=j(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function de(e,t,n){return Math.floor(Math.floor(e/n)/t)}function fe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=de(n.start,r.width,4),c=de(t.start,r.width,4);n.start<=i+1&&a===c&&de(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function pe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ue(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=q.getPrimaries(q.workingColorSpace),r=o.colorSpace===``?null:q.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=g(o.image,!1,i.maxTextureSize);t=we(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=b(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);le(c,o);let h,y=o.mipmaps,C=o.isVideoTexture!==!0,w=f.__version===void 0||l===!0,T=u.dataReady,E=S(o,t);if(o.isDepthTexture)m=x(o.format===gn,o.type),w&&(C?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture)if(y.length>0){C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else C?(w&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&fe(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data);else if(o.isCompressedTexture)if(o.isCompressedArrayTexture){C&&w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,y[0].width,y[0].height,t.depth);for(let i=0,a=y.length;i<a;i++)if(h=y[i],o.format!==1023)if(r!==null)if(C){if(T)if(o.layerUpdates.size>0){let t=Bu(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0);else V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`);else C?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data)}else{C&&w&&n.texStorage2D(e.TEXTURE_2D,E,m,y[0].width,y[0].height);for(let t=0,i=y.length;t<i;t++)h=y[t],o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}else if(o.isDataArrayTexture)if(C){if(w&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T)if(o.layerUpdates.size>0){let i=Bu(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isData3DTexture)C?(w&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(w)if(C)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}let r=e.RGBA,i=e.RGBA,a=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,r,i,a,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(y.length>0){if(C&&w){let t=I(y[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=y.length;t<i;t++)h=y[t],C?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(C){if(w){let r=I(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);_(o)&&v(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function me(t,o,s){if(o.image.length!==6)return;let c=ue(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=q.getPrimaries(q.workingColorSpace),r=o.colorSpace===``?null:q.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=g(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=we(o,m[e]);let h=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.normalized,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,h);le(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=I(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}_(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function he(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Ce(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,P(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ge(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Ce(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,P(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,P(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.normalized,o.colorSpace);Ce(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,P(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,P(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function _e(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,C)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),le(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else ne(i.depthTexture,0);let u=l.__webglTexture,d=P(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)Ce(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)Ce(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`Unknown depthTexture format`)}function M(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer)if(a)for(let e=0;e<6;e++)_e(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?_e(i.__webglFramebuffer[0],t,0):_e(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),ge(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),ge(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ve(t,n,i){let a=r.get(t);n!==void 0&&he(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&M(t)}function ye(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Ce(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=P(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),ge(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),le(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)he(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else he(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);_(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),le(c,a),he(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),_(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),le(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)he(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else he(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);_(i)&&v(r),n.unbindTexture()}t.depthBuffer&&M(t)}function be(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(_(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let xe=[],N=[];function Se(t){if(t.samples>0){if(Ce(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(xe.length=0,N.length=0,xe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(xe.push(l),N.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,N)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,xe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function P(e){return Math.min(i.maxSamples,e.samples)}function Ce(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function F(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function we(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(q.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&V(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):H(`WebGLTextures: Unsupported texture color space:`,n)),t}function I(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=te,this.resetTextureUnits=k,this.getTextureUnits=A,this.setTextureUnits=ee,this.setTexture2D=ne,this.setTexture2DArray=re,this.setTexture3D=ie,this.setTextureCube=ae,this.rebindTextures=ve,this.setupRenderTarget=ye,this.updateRenderTargetMipmap=be,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=M,this.setupFrameBufferTexture=he,this.useMultisampledRTT=Ce,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Kp(e,t){function n(n,r=``){let i,a=q.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(a===`srgb`)if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===35840||n===35841||n===35842||n===35843)if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491)if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821)if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===36492||n===36494||n===36495)if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===36283||n===36284||n===36285||n===36286)if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var qp=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Jp=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yp=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Qs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Xc({vertexShader:qp,fragmentShader:Jp,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new qo(new zc(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Xp=class extends Nr{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Yp,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new W,C=null,w=new Kl;w.viewport=new Ci;let T=new Kl;T.viewport=new Ci;let E=[w,T],D=new cu,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new ia,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new ia,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new ia,b[e]=t),t.getHandSpace()};function A(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,A),r.removeEventListener(`selectstart`,A),r.removeEventListener(`selectend`,A),r.removeEventListener(`squeeze`,A),r.removeEventListener(`squeezestart`,A),r.removeEventListener(`squeezeend`,A),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,te);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}O=null,k=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&V(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&V(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,A),r.addEventListener(`selectstart`,A),r.addEventListener(`selectend`,A),r.addEventListener(`squeeze`,A),r.addEventListener(`squeezestart`,A),r.addEventListener(`squeezeend`,A),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,te),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?gn:hn,a=_.stencil?ln:rn);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Ti(d.textureWidth,d.textureHeight,{format:mn,type:Qt,depthTexture:new Xs(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Ti(f.framebufferWidth,f.framebufferHeight,{format:mn,type:Qt,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function te(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let j=new G,ne=new G;function re(e,t,n){j.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=j.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(O!==D.near||k!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),O=D.near,k=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&-5,T.layers.mask=D.layers.mask&-3;let i=e.parent,a=D.cameras;ie(D,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?re(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),ae(e,D,i)};function ae(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Lr*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(d===null&&f===null))return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let oe=null;function se(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new Kl,o.layers.enable(n),o.viewport=new Ci,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Qs,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}oe&&oe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ce=new Hu;ce.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},Zp=new J,Qp=new K;Qp.set(-1,0,0,0,1,0,0,0,1);function $p(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Kc(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Zp.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Qp),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function em(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return H(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):ArrayBuffer.isView(o)?i.__data.set(new o.constructor(o.buffer,o.byteOffset,i.__data.length)):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return typeof i==`number`||typeof i==`boolean`?r[a]=i:ArrayBuffer.isView(i)?r[a]=i.slice():r[a]=i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?V(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):V(`WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var tm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),nm=null;function rm(){return nm===null&&(nm=new ss(tm,16,16,yn,on),nm.name=`DFG_LUT`,nm.minFilter=Jt,nm.magFilter=Jt,nm.wrapS=Ut,nm.wrapT=Ut,nm.generateMipmaps=!1,nm.needsUpdate=!0),nm}var im=class{constructor(e={}){let{canvas:t=Tr(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Qt}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([xn,bn,vn]),g=new Set([Qt,rn,tn,ln,sn,cn]),_=new Uint32Array(4),v=new Int32Array(4),y=new G,b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null;this._outputColorSpace=pr;let O=0,k=0,A=null,ee=-1,te=null,j=new Ci,ne=new Ci,re=null,ie=new Y(0),ae=0,oe=t.width,se=t.height,ce=1,le=null,ue=null,de=new Ci(0,0,oe,se),fe=new Ci(0,0,oe,se),pe=!1,me=new Ds,he=!1,ge=!1,_e=new J,M=new G,ve=new Ci,ye={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},be=!1;function xe(){return A===null?ce:1}let N=n;function Se(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r184`),t.addEventListener(`webglcontextlost`,We,!1),t.addEventListener(`webglcontextrestored`,Ge,!1),t.addEventListener(`webglcontextcreationerror`,Ke,!1),N===null){let t=`webgl2`;if(N=Se(t,e),N===null)throw Se(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw H(`WebGLRenderer: `+e.message),e}let P,Ce,F,we,I,L,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve;function He(){P=new xd(N),P.init(),ze=new Kp(N,P),Ce=new Zu(N,P,e,ze),F=new Wp(N,P),Ce.reversedDepthBuffer&&d&&F.buffers.depth.setReversed(!0),we=new wd(N),I=new wp,L=new Gp(N,P,F,I,Ce,ze,we),Te=new bd(T),Ee=new Uu(N),Be=new Yu(N,Ee),De=new Sd(N,Ee,we,Be),Oe=new Ed(N,De,Ee,Be,we),Ie=new Td(N,Ce,L),Ne=new Qu(I),ke=new Cp(T,Te,P,Ce,Be,Ne),Ae=new $p(T,I),je=new Op,Me=new Fp(P),Fe=new Ju(T,Te,F,Oe,p,s),Pe=new Up(T,Oe,Ce),Ve=new em(N,we,Ce,F),Le=new Xu(N,P,we),Re=new Cd(N,P,we),we.programs=ke.programs,T.capabilities=Ce,T.extensions=P,T.properties=I,T.renderLists=je,T.shadowMap=Pe,T.state=F,T.info=we}He(),m!==1009&&(w=new Od(m,t.width,t.height,r,i));let Ue=new Xp(T,N);this.xr=Ue,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let e=P.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=P.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ce},this.setPixelRatio=function(e){e!==void 0&&(ce=e,this.setSize(oe,se,!1))},this.getSize=function(e){return e.set(oe,se)},this.setSize=function(e,n,r=!0){if(Ue.isPresenting){V(`WebGLRenderer: Can't change size while VR device is presenting.`);return}oe=e,se=n,t.width=Math.floor(e*ce),t.height=Math.floor(n*ce),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(oe*ce,se*ce).floor()},this.setDrawingBufferSize=function(e,n,r){oe=e,se=n,ce=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009){H(`THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){V(`THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(j)},this.getViewport=function(e){return e.copy(de)},this.setViewport=function(e,t,n,r){e.isVector4?de.set(e.x,e.y,e.z,e.w):de.set(e,t,n,r),F.viewport(j.copy(de).multiplyScalar(ce).round())},this.getScissor=function(e){return e.copy(fe)},this.setScissor=function(e,t,n,r){e.isVector4?fe.set(e.x,e.y,e.z,e.w):fe.set(e,t,n,r),F.scissor(ne.copy(fe).multiplyScalar(ce).round())},this.getScissorTest=function(){return pe},this.setScissorTest=function(e){F.setScissorTest(pe=e)},this.setOpaqueSort=function(e){le=e},this.setTransparentSort=function(e){ue=e},this.getClearColor=function(e){return e.copy(Fe.getClearColor())},this.setClearColor=function(){Fe.setClearColor(...arguments)},this.getClearAlpha=function(){return Fe.getClearAlpha()},this.setClearAlpha=function(){Fe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(A!==null){let t=A.texture.format;e=h.has(t)}if(e){let e=A.texture.type,t=g.has(e),n=Fe.getClearColor(),r=Fe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,N.clearBufferuiv(N.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,N.clearBufferiv(N.COLOR,0,v))}else r|=N.COLOR_BUFFER_BIT}t&&(r|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&N.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,We,!1),t.removeEventListener(`webglcontextrestored`,Ge,!1),t.removeEventListener(`webglcontextcreationerror`,Ke,!1),Fe.dispose(),je.dispose(),Me.dispose(),I.dispose(),Te.dispose(),Oe.dispose(),Be.dispose(),Ve.dispose(),ke.dispose(),Ue.dispose(),Ue.removeEventListener(`sessionstart`,$e),Ue.removeEventListener(`sessionend`,et),tt.stop()};function We(e){e.preventDefault(),Or(`WebGLRenderer: Context Lost.`),E=!0}function Ge(){Or(`WebGLRenderer: Context Restored.`),E=!1;let e=we.autoReset,t=Pe.enabled,n=Pe.autoUpdate,r=Pe.needsUpdate,i=Pe.type;He(),we.autoReset=e,Pe.enabled=t,Pe.autoUpdate=n,Pe.needsUpdate=r,Pe.type=i}function Ke(e){H(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function qe(e){let t=e.target;t.removeEventListener(`dispose`,qe),Je(t)}function Je(e){Ye(e),I.remove(e)}function Ye(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){ke.releaseProgram(e)}),e.isShaderMaterial&&ke.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=ye);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=lt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=De.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Be.setup(i,r,s,n,c);let h,g=Le;if(c!==null&&(h=Ee.get(c),g=Re,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*xe()),g.setMode(N.LINES)):g.setMode(N.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*xe()),i.isLineSegments?g.setMode(N.LINES):i.isLineLoop?g.setMode(N.LINE_LOOP):g.setMode(N.LINE_STRIP)}else i.isPoints?g.setMode(N.POINTS):i.isSprite&&g.setMode(N.TRIANGLES);if(i.isBatchedMesh)if(P.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ee.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(N,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Xe(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,ot(e,t,n),e.side=0,e.needsUpdate=!0,ot(e,t,n),e.side=2):ot(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),x=Me.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t)if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Xe(a,n,e),r.add(a)}else Xe(t,n,e),r.add(t)}),x=C.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){I.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}P.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Ze=null;function Qe(e){Ze&&Ze(e)}function $e(){tt.stop()}function et(){tt.start()}let tt=new Hu;tt.setAnimationLoop(Qe),typeof self<`u`&&tt.setContext(self),this.setAnimationLoop=function(e){Ze=e,Ue.setAnimationLoop(e),e===null?tt.stop():tt.start()},Ue.addEventListener(`sessionstart`,$e),Ue.addEventListener(`sessionend`,et),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){H(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Ue.enabled===!0&&Ue.isPresenting===!0,r=w!==null&&(A===null||n)&&w.begin(T,A);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ue.enabled===!0&&Ue.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ue.cameraAutoUpdate===!0&&Ue.updateCamera(t),t=Ue.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,A),x=Me.get(e,C.length),x.init(t),x.state.textureUnits=L.getTextureUnits(),C.push(x),_e.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),me.setFromProjectionMatrix(_e,xr,t.reversedDepth),ge=this.localClippingEnabled,he=Ne.init(this.clippingPlanes,ge),b=je.get(e,S.length),b.init(),S.push(b),Ue.enabled===!0&&Ue.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&nt(e,t,-1/0,T.sortObjects)}nt(e,t,0,T.sortObjects),b.finish(),T.sortObjects===!0&&b.sort(le,ue),be=Ue.enabled===!1||Ue.isPresenting===!1||Ue.hasDepthSensing()===!1,be&&Fe.addToRenderList(b,e),this.info.render.frame++,he===!0&&Ne.beginShadows();let i=x.state.shadowsArray;if(Pe.render(i,e,t),he===!0&&Ne.endShadows(),this.info.autoReset===!0&&this.info.reset(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];rt(n,r,e,a)}be&&Fe.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];R(b,e,n,n.viewport)}}else r.length>0&&rt(n,r,e,t),be&&Fe.render(e),R(b,e,t)}A!==null&&k===0&&(L.updateMultisampleRenderTarget(A),L.updateRenderTargetMipmap(A)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Be.resetDefaultState(),ee=-1,te=null,C.pop(),C.length>0?(x=C[C.length-1],L.setTextureUnits(x.state.textureUnits),he===!0&&Ne.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function nt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)x.pushLightProbeGrid(e);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||me.intersectsSprite(e)){r&&ve.setFromMatrixPosition(e.matrixWorld).applyMatrix4(_e);let t=Oe.update(e),i=e.material;i.visible&&b.push(e,t,i,n,ve.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||me.intersectsObject(e))){let t=Oe.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ve.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ve.copy(e.boundingSphere.center)),ve.applyMatrix4(e.matrixWorld).applyMatrix4(_e)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&b.push(e,t,s,n,ve.z,o)}}else i.visible&&b.push(e,t,i,n,ve.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)nt(i[e],t,n,r)}function R(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),he===!0&&Ne.setGlobalState(T.clippingPlanes,n),r&&F.viewport(j.copy(r)),i.length>0&&it(i,t,n),a.length>0&&it(a,t,n),o.length>0&&it(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function rt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=P.has(`EXT_color_buffer_half_float`)||P.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new Ti(1,1,{generateMipmaps:!0,type:e?on:Qt,minFilter:Xt,samples:Math.max(4,Ce.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:q.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||j;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(ie),ae=T.getClearAlpha(),ae<1&&T.setClearColor(16777215,.5),T.clear(),be&&Fe.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),he===!0&&Ne.setGlobalState(T.clippingPlanes,r),it(e,n,r),L.updateMultisampleRenderTarget(a),L.updateRenderTargetMipmap(a),P.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,at(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(L.updateMultisampleRenderTarget(a),L.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(ie,ae),d!==void 0&&(r.viewport=d),T.toneMapping=u}function it(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&at(o,t,n,s,l,c)}}function at(e,t,n,r,i,a){e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function ot(e,t,n){t.isScene!==!0&&(t=ye);let r=I.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=ke.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=ke.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Te.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,qe),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return st(e,s),d}else s.uniforms=ke.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=ke.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ne.uniform),st(e,s),r.needsLights=dt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=x.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function z(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=If.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function st(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ct(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];y.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(y))return n}return null}function lt(e,t,n,r,i){t.isScene!==!0&&(t=ye),L.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=A===null?T.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:q.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Te.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=x.state.lights;if(he===!0&&(ge===!0||e!==te)){let t=e===te&&r.id===ee;Ne.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ne.numPlanes||v.numIntersection!==Ne.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=x.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;b===!0&&(S=ot(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,S,v));let C=!1,w=!1,E=!1,O=S.getUniforms(),k=v.uniforms;if(F.useProgram(S.program)&&(C=!0,w=!0,E=!0),r.id!==ee&&(ee=r.id,w=!0),v.needsLights){let e=ct(x.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,w=!0)}if(C||te!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(N,`projectionMatrix`,e.projectionMatrix),O.setValue(N,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(N,M.setFromMatrixPosition(e.matrixWorld)),Ce.logarithmicDepthBuffer&&O.setValue(N,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(N,`isOrthographic`,e.isOrthographicCamera===!0),te!==e&&(te=e,w=!0,E=!0)}if(v.needsLights&&(y.state.directionalShadowMap.length>0&&O.setValue(N,`directionalShadowMap`,y.state.directionalShadowMap,L),y.state.spotShadowMap.length>0&&O.setValue(N,`spotShadowMap`,y.state.spotShadowMap,L),y.state.pointShadowMap.length>0&&O.setValue(N,`pointShadowMap`,y.state.pointShadowMap,L)),i.isSkinnedMesh){O.setOptional(N,i,`bindMatrix`),O.setOptional(N,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(N,`boneTexture`,e.boneTexture,L))}i.isBatchedMesh&&(O.setOptional(N,i,`batchingTexture`),O.setValue(N,`batchingTexture`,i._matricesTexture,L),O.setOptional(N,i,`batchingIdTexture`),O.setValue(N,`batchingIdTexture`,i._indirectTexture,L),O.setOptional(N,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(N,`batchingColorTexture`,i._colorsTexture,L));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&Ie.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,O.setValue(N,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),k.dfgLUT!==void 0&&(k.dfgLUT.value=rm()),w){if(O.setValue(N,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&ut(k,E),a&&r.fog===!0&&Ae.refreshFogUniforms(k,a),Ae.refreshMaterialUniforms(k,r,ce,se,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;k.probesSH.value=e.texture,k.probesMin.value.copy(e.boundingBox.min),k.probesMax.value.copy(e.boundingBox.max),k.probesResolution.value.copy(e.resolution)}If.upload(N,z(v),k,L)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(If.upload(N,z(v),k,L),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(N,`center`,i.center),O.setValue(N,`modelViewMatrix`,i.modelViewMatrix),O.setValue(N,`normalMatrix`,i.normalMatrix),O.setValue(N,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Ve.update(n,S),Ve.bind(n,S)}}return S}function ut(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function dt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return O},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let ft=N.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){A=e,O=t,k=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(N.FRAMEBUFFER,o.__webglFramebuffer),j.copy(e.viewport),ne.copy(e.scissor),re=e.scissorTest,F.viewport(j),F.scissor(ne),F.setScissorTest(re),ee=-1;return}else if(o.__webglFramebuffer===void 0)L.setupRenderTarget(e);else if(o.__hasExternalTextures)L.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);L.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&L.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,j.copy(e.viewport),ne.copy(e.scissor),re=e.scissorTest}else j.copy(de).multiplyScalar(ce).floor(),ne.copy(fe).multiplyScalar(ce).floor(),re=pe;if(n!==0&&(r=ft),F.bindFramebuffer(N.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(j),F.scissor(ne),F.setScissorTest(re),i){let r=I.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,t.__webglTexture,n)}ee=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(N.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),!Ce.textureFormatReadable(c)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!Ce.textureTypeReadable(l)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&N.readPixels(t,n,r,i,ze.convert(c),ze.convert(l),a)}finally{let e=A===null?null:I.get(A).__webglFramebuffer;F.bindFramebuffer(N.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c)if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(N.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),!Ce.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!Ce.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.bufferData(N.PIXEL_PACK_BUFFER,a.byteLength,N.STREAM_READ),N.readPixels(t,n,r,i,ze.convert(l),ze.convert(u),0);let f=A===null?null:I.get(A).__webglFramebuffer;F.bindFramebuffer(N.FRAMEBUFFER,f);let p=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await jr(N,p,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,a),N.deleteBuffer(d),N.deleteSync(p),a}else throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;L.setTexture2D(e,0),N.copyTexSubImage2D(N.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()};let pt=N.createFramebuffer(),mt=N.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=ze.convert(t.format),_=ze.convert(t.type),v;t.isData3DTexture?(L.setTexture3D(t,0),v=N.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(L.setTexture2DArray(t,0),v=N.TEXTURE_2D_ARRAY):(L.setTexture2D(t,0),v=N.TEXTURE_2D),F.activeTexture(N.TEXTURE0),F.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(N.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(N.UNPACK_ROW_LENGTH),b=F.getParameter(N.UNPACK_IMAGE_HEIGHT),x=F.getParameter(N.UNPACK_SKIP_PIXELS),S=F.getParameter(N.UNPACK_SKIP_ROWS),C=F.getParameter(N.UNPACK_SKIP_IMAGES);F.pixelStorei(N.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(N.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(N.UNPACK_SKIP_PIXELS,l),F.pixelStorei(N.UNPACK_SKIP_ROWS,u),F.pixelStorei(N.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(N.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),N.blitFramebuffer(l,u,o,s,f,p,o,s,N.DEPTH_BUFFER_BIT,N.NEAREST);F.bindFramebuffer(N.READ_FRAMEBUFFER,null),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(N.READ_FRAMEBUFFER,pt),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,mt);for(let e=0;e<c;e++)w?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,n.__webglTexture,i),T?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,r.__webglTexture,a),i===0?T?N.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):N.copyTexSubImage2D(v,a,f,p,l,u,o,s):N.blitFramebuffer(l,u,o,s,f,p,o,s,N.COLOR_BUFFER_BIT,N.NEAREST);F.bindFramebuffer(N.READ_FRAMEBUFFER,null),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?N.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(N.UNPACK_ROW_LENGTH,y),F.pixelStorei(N.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(N.UNPACK_SKIP_PIXELS,x),F.pixelStorei(N.UNPACK_SKIP_ROWS,S),F.pixelStorei(N.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&N.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&L.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?L.setTextureCube(e,0):e.isData3DTexture?L.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?L.setTexture2DArray(e,0):L.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){O=0,k=0,A=null,F.reset(),Be.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return xr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=q._getDrawingBufferColorSpace(e),t.unpackColorSpace=q._getUnpackColorSpace()}},am=Object.freeze({width:1754,height:1240}),om=Object.freeze({width:1536,height:864}),sm=`ssproj`,cm=16e3,lm=Math.floor(cm/am.width*100),um=Math.floor(cm/am.height*100),dm=.96,fm=.55,pm=.1,mm=1e3,hm=2.5,gm=.006,_m=.0015,vm=`1u = 1m`,ym=.7,bm=.01,xm=`camera-frames.mobileUiScale`,Sm=.6,Cm=1.2,wm=.01,Tm=1.1,Em=`camera-frames.viewportLodScale`,Dm=new Set([`ply`,`spz`,`splat`,`ksplat`,`zip`,`sog`,`rad`]),Om=1e5,km=new Set([`glb`,`gltf`,`fbx`]),Am={"top-left":{x:0,y:0},"top-center":{x:.5,y:0},"top-right":{x:1,y:0},"middle-left":{x:0,y:.5},center:{x:.5,y:.5},"middle-right":{x:1,y:.5},"bottom-left":{x:0,y:1},"bottom-center":{x:.5,y:1},"bottom-right":{x:1,y:1}},jm=Math.PI/180,Mm=36,Nm=Object.freeze([14,18,21,24,28,35,50,70,75,85,100,135,200]),Pm=-100;function Fm(e,t,n){return Math.min(n,Math.max(t,e))}function Im(){return am.width/om.width}function Lm(e){let t=Number(e)*jm*.5;return Math.atan(Math.tan(t)/Im())*2/jm}function Rm(e){let t=Lm(e)*jm*.5;return Mm/Math.max(2*Math.tan(t),1e-6)}function zm(e){let t=Number(e);return Number.isFinite(t)?Fm(t,14,200):14}function Bm(e){let t=Number(e);return Number.isFinite(t)?Fm(t,Pm/100,100/100):0}function Vm(e){let t=Number(e);return Number.isFinite(t)?Fm(t,Pm,100):0}function Hm(e,t=1.5){let n=zm(e),r=Nm.reduce((e,t)=>Math.abs(t-n)<Math.abs(e-n)?t:e,Nm[0]);return Math.abs(r-n)<=t?r:n}function Um(e){let t=zm(e),n=Mm/Math.max(2*t,1e-6);return Math.atan(n*Im())*2/jm}var Wm=Um(35),Gm=Um(24),Km=.1,qm={"top-left":{x:0,y:0,affectsWidth:!0,affectsHeight:!0},top:{x:.5,y:0,affectsWidth:!1,affectsHeight:!0},"top-right":{x:1,y:0,affectsWidth:!0,affectsHeight:!0},right:{x:1,y:.5,affectsWidth:!0,affectsHeight:!1},"bottom-right":{x:1,y:1,affectsWidth:!0,affectsHeight:!0},bottom:{x:.5,y:1,affectsWidth:!1,affectsHeight:!0},"bottom-left":{x:0,y:1,affectsWidth:!0,affectsHeight:!0},left:{x:0,y:.5,affectsWidth:!0,affectsHeight:!1}},Jm={"top-left":`bottom-right`,top:`bottom`,"top-right":`bottom-left`,right:`left`,"bottom-right":`top-left`,bottom:`top`,"bottom-left":`top-right`,left:`right`},Ym={"top-left":`top-left`,"top-center":`top`,"top-right":`top-right`,"middle-left":`left`,center:``,"middle-right":`right`,"bottom-left":`bottom-left`,"bottom-center":`bottom`,"bottom-right":`bottom-right`};Math.PI*.5;var Xm=1e-6;function Zm(e,t=.5){let n=Number(e);return Number.isFinite(n)?Math.min(1,Math.max(0,n)):t}function Qm(e,t=.5){let n=Number(e);return Number.isFinite(n)?n:t}function $m(e){return typeof e==`object`&&!!e}function eh(e,t,n,r){return Math.abs(e-0)<=Xm?t:Math.abs(e-.5)<=Xm?n:Math.abs(e-1)<=Xm?r:null}function th(e,t=Am.center){let n=$m(t)?{x:Zm(t.x,.5),y:Zm(t.y,.5)}:Am.center;return typeof e==`string`?Am[e]??n:$m(e)?{x:Zm(e.x,n.x),y:Zm(e.y,n.y)}:n}function nh(e){let t={x:Qm(e?.x,.5),y:Qm(e?.y,.5)};return typeof e?.anchor==`string`?Am[e.anchor]??t:$m(e?.anchor)?{x:Qm(e.anchor.x,t.x),y:Qm(e.anchor.y,t.y)}:t}function rh(e=Am.center){let t=th(e,Am.center),n=eh(t.y,`top`,`middle`,`bottom`),r=eh(t.x,`left`,`center`,`right`);return!n||!r?``:Ym[n===`middle`&&r===`center`?`center`:`${n}-${r}`]??``}function ih(e){return Jm[e]??``}function ah(e,t,n){let r=Math.cos(n),i=Math.sin(n);return{x:e*r-t*i,y:e*i+t*r}}function oh(e,t,n){return ah(e,t,-n)}function sh(e,t){let n=ah((t.x-.5)*e.width,(t.y-.5)*e.height,e.rotationRadians);return{x:e.centerX+n.x,y:e.centerY+n.y}}function ch(e,t,n){return{x:(e-n.boxLeft)/Math.max(n.boxWidth,1e-6),y:(t-n.boxTop)/Math.max(n.boxHeight,1e-6)}}function lh({left:e,top:t,width:n,height:r,localX:i,localY:a,anchorAx:o=.5,anchorAy:s=.5,rotationDeg:c=0}){let l=c*Math.PI/180,u={x:e+n*o,y:t+r*s},d=ah((i-o)*n,(a-s)*r,l);return{x:u.x+d.x,y:u.y+d.y}}function uh({left:e,top:t,width:n,height:r,anchorAx:i=.5,anchorAy:a=.5,rotationDeg:o=0}){return[lh({left:e,top:t,width:n,height:r,localX:0,localY:0,anchorAx:i,anchorAy:a,rotationDeg:o}),lh({left:e,top:t,width:n,height:r,localX:1,localY:0,anchorAx:i,anchorAy:a,rotationDeg:o}),lh({left:e,top:t,width:n,height:r,localX:1,localY:1,anchorAx:i,anchorAy:a,rotationDeg:o}),lh({left:e,top:t,width:n,height:r,localX:0,localY:1,anchorAx:i,anchorAy:a,rotationDeg:o})]}function dh(e){if(!Array.isArray(e)||e.length===0)return null;let t=1/0,n=1/0,r=-1/0,i=-1/0;for(let a of e)!Number.isFinite(a?.x)||!Number.isFinite(a?.y)||(t=Math.min(t,a.x),n=Math.min(n,a.y),r=Math.max(r,a.x),i=Math.max(i,a.y));return!Number.isFinite(t)||!Number.isFinite(n)||!Number.isFinite(r)||!Number.isFinite(i)?null:{left:t,top:n,right:r,bottom:i,width:Math.max(r-t,1e-6),height:Math.max(i-n,1e-6)}}function fh(e,t){let n=nh(e);return{x:t.boxLeft+n.x*t.boxWidth,y:t.boxTop+n.y*t.boxHeight,anchor:n}}function ph(e,t,n){let r=nh(e),i=oh((r.x-e.x)*n.boxWidth,(r.y-e.y)*n.boxHeight,t.rotationRadians);return{x:.5+i.x/Math.max(t.width,1e-6),y:.5+i.y/Math.max(t.height,1e-6)}}function mh(e,t,n=Am.center){let r=qm[t];if(!r)return null;let i={x:(r.x-n.x)*e.width,y:(r.y-n.y)*e.height},a=Math.hypot(i.x,i.y);return Number.isFinite(a)&&a>1e-6?{x:i.x/a,y:i.y/a,length:a}:null}function hh({pointerWorldX:e,pointerWorldY:t,anchorWorldX:n,anchorWorldY:r,rotationRadians:i,axisX:a,axisY:o,startProjectionDistance:s,startScale:c=1,fallbackScale:l=1}){if(!(Number.isFinite(s)&&Math.abs(s)>1e-6)||!(Number.isFinite(a)&&Number.isFinite(o)))return l;let u=oh(e-n,t-r,i),d=c*((u.x*a+u.y*o)/s);return Number.isFinite(d)?Math.min(4,Math.max(Km,d)):l}function gh(e,t){let n=Number(e);if(!Number.isFinite(n))return 1;let r=(t??[]).filter(e=>Number.isFinite(e)&&e>0);if(r.length===0)return Math.max(.01,n);let i=0,a=1/0;for(let e of r)i=Math.max(i,Km/e),a=Math.min(a,4/e);if(!(Number.isFinite(a)&&a>0))return Math.max(.01,n);let o=Math.max(i,.01);return Math.min(Math.max(a,o),Math.max(o,n))}function _h(e){let t=Number(e)||0;for(;t<=-180;)t+=360;for(;t>180;)t-=360;return t}function vh(e,t=15){let n=Number(e),r=Number(t);return Number.isFinite(n)&&Number.isFinite(r)&&r>0?Math.round(n/r)*r:Number.isFinite(n)?n:0}var yh=`selected-frame`,bh=`all-frames`,xh=`thirds`,Sh=`golden`,Ch=`center`,wh=`grid`,Th=Object.freeze({enabled:!1,scope:yh,pattern:xh}),Eh=1/((1+Math.sqrt(5))/2)**2,Dh=96,Oh=2,kh=32;function Ah(e,t,n){return Math.min(n,Math.max(t,e))}function jh(e){let t=Number(e?.scale);return Number.isFinite(t)&&t>0?t:1}function Mh(e){return e===`all-frames`?bh:yh}function Nh(e){switch(e){case Sh:case Ch:case wh:return e;default:return xh}}function Ph(e=null){return{enabled:!!e?.enabled,scope:Mh(e?.scope),pattern:Nh(e?.pattern)}}function Fh(e=null){return Ph(e)}function Ih(){return{...Th}}function Lh(e,t,n){if(!e)return null;let r=jh(e),i=om.width*r,a=om.height*r,o=Number(e.x??.5)*t,s=Number(e.y??.5)*n;return Number.isFinite(o)&&Number.isFinite(s)&&Number.isFinite(i)&&Number.isFinite(a)&&i>0&&a>0?{kind:yh,frameId:e.id??null,left:o-i*.5,top:s-a*.5,width:i,height:a,rotationDeg:_h(e.rotation??0)}:null}function Rh(e,t,n){let r=Lh(e,t,n);return r?uh({left:r.left,top:r.top,width:r.width,height:r.height,anchorAx:.5,anchorAy:.5,rotationDeg:r.rotationDeg}):[]}function zh({frames:e,activeFrameId:t,selectedFrameIds:n,frameSelectionActive:r,exportWidth:i,exportHeight:a}){let o=r&&n?.length?new Set(n.map(String)):null,s=e.find(e=>e.id===t)??null;return Lh((o&&s&&o.has(s.id)?s:o?e.find(e=>o.has(e.id))??null:null)??s??e[0]??null,i,a)}function Bh(e,t,n){let r=dh(e.flatMap(e=>Rh(e,t,n)));return r?{kind:bh,frameId:null,left:r.left,top:r.top,width:r.width,height:r.height,rotationDeg:0}:null}function Vh({scope:e=yh,frames:t=[],activeFrameId:n=null,selectedFrameIds:r=[],frameSelectionActive:i=!1,exportWidth:a,exportHeight:o}={}){if(!Array.isArray(t)||t.length===0)return null;let s=Number(a),c=Number(o);return Number.isFinite(s)&&s>0&&Number.isFinite(c)&&c>0?Mh(e)===`all-frames`?Bh(t,s,c):zh({frames:t,activeFrameId:n,selectedFrameIds:r,frameSelectionActive:i,exportWidth:s,exportHeight:c}):null}function Hh(e,t,n,r,i=`minor`){for(let a of r){let r=-t*.5+t*a,o=-n*.5+n*a;e.push({axis:`vertical`,weight:i,x1:r,y1:-n*.5,x2:r,y2:n*.5}),e.push({axis:`horizontal`,weight:i,x1:-t*.5,y1:o,x2:t*.5,y2:o})}}function Uh(e,t){return Ah(Math.round(Number.isFinite(t)&&t>0?t/Dh:e/240),Oh,kh)}function Wh(e,t,n,{screenWidth:r=0,screenHeight:i=0}={}){let a=Uh(t,r),o=Uh(n,i);for(let r=1;r<a;r+=1){let i=r/a,o=-t*.5+t*i;e.push({axis:`vertical`,weight:Math.abs(i-.5)<1e-6?`major`:`minor`,x1:o,y1:-n*.5,x2:o,y2:n*.5})}for(let r=1;r<o;r+=1){let i=r/o,a=-n*.5+n*i;e.push({axis:`horizontal`,weight:Math.abs(i-.5)<1e-6?`major`:`minor`,x1:-t*.5,y1:a,x2:t*.5,y2:a})}return{xDivisions:a,yDivisions:o}}function Gh({target:e,pattern:t=xh,screenWidth:n=0,screenHeight:r=0}={}){if(!e||!(e.width>0&&e.height>0))return{lines:[],grid:null};let i=Nh(t),a=[],o=null;return i===`golden`?Hh(a,e.width,e.height,[Eh,1-Eh]):i===`center`?(Hh(a,e.width,e.height,[.25,.75],`minor`),Hh(a,e.width,e.height,[.5],`major`)):i===`grid`?o=Wh(a,e.width,e.height,{screenWidth:n,screenHeight:r}):Hh(a,e.width,e.height,[1/3,2/3]),{lines:a,grid:o}}var Kh=`bounds`,qh=`trajectory`,Jh=`line`,Yh=`spline`,Xh=`auto`,Zh=`corner`,Qh=`mirrored`,$h=`free`,eg=`none`,tg=`center`,ng=`top-left`,rg=`top-right`,ig=`bottom-right`,ag=`bottom-left`,og=new Set([ng,rg,ig,ag]),sg=.35;function cg(e,t,n){let r=Math.cos(n),i=Math.sin(n);return{x:e*r-t*i,y:e*i+t*r}}function lg(e,t=.5){let n=Number(e);return Number.isFinite(n)?n:t}function ug(e){let t=Number(e)||0;for(;t<=-180;)t+=360;for(;t>180;)t-=360;return t}function dg(e){let t=Number(e?.scale);return Number.isFinite(t)&&t>0?t:1}function fg(e){return ug(e?.rotation??0)}function pg(e){return{x:lg(e?.x,.5),y:lg(e?.y,.5)}}function mg(e){return e?{x:e.x,y:e.y}:null}function hg(e){if(!e||typeof e!=`object`)return null;let t=Number(e.x),n=Number(e.y);return!Number.isFinite(t)||!Number.isFinite(n)?null:{x:t,y:n}}function gg(e){return hg(e)}function _g(e){return e===`trajectory`?qh:Kh}function vg(e){return e===`spline`?Yh:Jh}function yg(e){return e===`corner`?Zh:e===`mirrored`?Qh:e===`free`?$h:Xh}function bg(e){return e===`center`||og.has(e)?e:eg}function xg(e){let t=mg(e?.in??null),n=mg(e?.out??null),r=yg(e?.mode);return r===`auto`&&!t&&!n?null:{...r===`auto`?{}:{mode:r},...t?{in:t}:{},...n?{out:n}:{}}}function Sg(e={}){let t={};for(let[n,r]of Object.entries(e??{})){if(typeof n!=`string`||!n)continue;let e=xg(r);e&&(t[n]=e)}return t}function Cg(e,t,n){let r=pg(e);return{x:r.x*t,y:r.y*n}}function wg(e,t,n){return{x:e.x/Math.max(t,1e-6),y:e.y/Math.max(n,1e-6)}}function Tg(e,t){return{x:e.x+t.x,y:e.y+t.y}}function Eg(e,t){return{x:e.x-t.x,y:e.y-t.y}}function Dg(e,t){return{x:e.x*t,y:e.y*t}}function Og(e){return Math.hypot(e.x,e.y)}function kg(e){let t=Og(e);return t<=1e-6?null:{x:e.x/t,y:e.y/t}}function Ag(e,t){return e.x*t.x+e.y*t.y}function jg(e){if(!e||typeof e!=`object`)return null;let t=yg(e.mode),n=gg(e.in),r=gg(e.out),i=t===`auto`&&(n||r)?$h:t;if(i===`auto`&&!n&&!r)return null;if(i===`mirrored`){if(n&&!r)return{mode:i,in:n,out:Dg(n,-1)};if(!n&&r)return{mode:i,in:Dg(r,-1),out:r}}return i===`corner`||i===`auto`||n||r?{...i===`auto`?{}:{mode:i},...n?{in:n}:{},...r?{out:r}:{}}:null}function Mg(e=[],t={}){let n=new Set((e??[]).map(e=>e?.id).filter(e=>typeof e==`string`&&e.length>0)),r=new Map((e??[]).map(e=>[e.id,pg(e)])),i={};for(let[e,a]of Object.entries(t??{})){if(!n.has(e))continue;let t=r.get(e);if(!t)continue;let o=hg(a?.in),s=hg(a?.out),c=jg({mode:$h,in:o?{x:o.x-t.x,y:o.y-t.y}:null,out:s?{x:s.x-t.x,y:s.y-t.y}:null});c&&(i[e]=c)}return i}function Ng(e=[],t={}){let n=new Set((e??[]).map(e=>e?.id).filter(e=>typeof e==`string`&&e.length>0)),r={},i=t?.nodesByFrameId&&typeof t.nodesByFrameId==`object`?t.nodesByFrameId:Mg(e,t?.handlesByFrameId);for(let[e,t]of Object.entries(i??{})){if(!n.has(e))continue;let i=jg(t);i&&(r[e]=i)}return r}function Pg(e,t){return jg(e?.trajectory?.nodesByFrameId?.[t])}function Fg(e,t){return yg(Pg(e,t)?.mode)}function Ig(e,t,n,r){let i=Cg(e[t],n,r);if(e.length<=1)return{in:{x:0,y:0},out:{x:0,y:0}};let a=t>0?Cg(e[t-1],n,r):null,o=t<e.length-1?Cg(e[t+1],n,r):null;if(t<=0)return{in:{x:0,y:0},out:Dg(o?Eg(o,i):{x:0,y:0},1/3)};if(t>=e.length-1)return{in:Dg(a?Eg(i,a):{x:0,y:0},-1/3),out:{x:0,y:0}};let s=a?Eg(i,a):{x:0,y:0},c=o?Eg(o,i):{x:0,y:0},l=Og(s),u=Og(c),d=kg(s),f=kg(c);if(!d||!f)return{in:d?Dg(s,-1/3):{x:0,y:0},out:f?Dg(c,1/3):{x:0,y:0}};let p=kg({x:d.x*Math.sqrt(Math.max(l,1e-6))+f.x*Math.sqrt(Math.max(u,1e-6)),y:d.y*Math.sqrt(Math.max(l,1e-6))+f.y*Math.sqrt(Math.max(u,1e-6))})??f,m=Math.max(0,Math.min(1,(1+Ag(d,f))*.5)),h=l/3*m,g=u/3*m;return{in:Dg(p,-h),out:Dg(p,g)}}function Lg(e,t,n,r){let i=Cg(e[t],n,r),a=t>0?Cg(e[t-1],n,r):null,o=t<e.length-1?Cg(e[t+1],n,r):null,s=a?Eg(i,a):{x:0,y:0},c=o?Eg(o,i):{x:0,y:0};return{in:Dg(s,-1/3),out:Dg(c,1/3)}}function Rg(e,t,n,r,i){let a=Ig(e,t,r,i);return wg(n===`in`?a.in:a.out,r,i)}function zg(e,t,n,r,i=1,a=1){let o=(e??[]).findIndex(e=>e?.id===n);if(o<0)return null;let s=Fg(t,n);if(s===`corner`){let t=Lg(e,o,i,a);return wg(r===`in`?t.in:t.out,i,a)}let c=Pg(t,n);if(s===`free`)return mg(c?.[r]??{x:0,y:0});if(s===`mirrored`){let e=mg(c?.[r]??null);if(e)return e;let t=mg(c?.[r===`in`?`out`:`in`]??null);return t?Dg(t,-1):{x:0,y:0}}return Rg(e,o,r,i,a)}function Bg(e,t,n,r,i){let a=pg(e[t]),o=Rg(e,t,n,r,i);return{x:a.x+o.x,y:a.y+o.y}}function Vg(e,t,n,r,i=1,a=1){let o=(e??[]).findIndex(e=>e?.id===n);if(o<0)return null;let s=pg(e[o]),c=zg(e,t,n,r,i,a);return c?Tg(s,c):Bg(e,o,r,i,a)}function Hg(e,t,n,r,i){let a=e[n],o=e[n+1];return!a||!o?null:{p0:pg(a),p1:Vg(e,t,a.id,`out`,r,i),p2:Vg(e,t,o.id,`in`,r,i),p3:pg(o)}}function Ug(e,t,n,r,i){let a=1-i,o=a*a*a,s=3*a*a*i,c=3*a*i*i,l=i*i*i;return{x:e.x*o+t.x*s+n.x*c+r.x*l,y:e.y*o+t.y*s+n.y*c+r.y*l}}function Wg(e,t,n){let r=ug(t-e);return r>180&&(r-=360),r<-180&&(r+=360),ug(e+r*n)}function Gg(e,t,n,r,i=1,a=1){let o=e[n],s=e[n+1];if(!o||!s)return null;if(vg(t?.trajectoryMode)===`spline`){let o=Hg(e,t,n,i,a);if(o)return Ug(o.p0,o.p1,o.p2,o.p3,r)}let c=pg(o),l=pg(s);return{x:c.x+(l.x-c.x)*r,y:c.y+(l.y-c.y)*r}}function Kg(e,t,n){let r=dg(e),i=fg(e),a=i*Math.PI/180,o=om.width*r,s=om.height*r,c=pg(e),l={x:c.x*t,y:c.y*n},u=o*.5,d=s*.5,f=[{x:-u,y:-d},{x:u,y:-d},{x:u,y:d},{x:-u,y:d}].map(e=>{let t=cg(e.x,e.y,a);return{x:l.x+t.x,y:l.y+t.y}});return{frame:e,centerPoint:l,centerNormalized:c,scale:r,rotationDeg:i,rotationRadians:a,width:o,height:s,corners:f,cornerPointsByKey:{[ng]:f[0],[rg]:f[1],[ig]:f[2],[ag]:f[3]}}}function qg(e,t,n,r,i,a){let o=e[n],s=e[n+1];if(!o||!s)return null;if(r<=0)return Kg(o,i,a);if(r>=1)return Kg(s,i,a);let c=Gg(e,t,n,r,i,a);return c?Kg({x:c.x,y:c.y,scale:dg(o)+(dg(s)-dg(o))*r,rotation:Wg(fg(o),fg(s),r)},i,a):null}function Jg(e,t,n){if(!e||!t||!n)return 0;let r=[[e.centerPoint,t.centerPoint,n.centerPoint],...e.corners.map((e,r)=>[e,t.corners[r],n.corners[r]])],i=0;for(let[e,t,n]of r){if(!e||!t||!n||!Number.isFinite(e.x)||!Number.isFinite(e.y)||!Number.isFinite(t.x)||!Number.isFinite(t.y)||!Number.isFinite(n.x)||!Number.isFinite(n.y))continue;let r={x:(e.x+n.x)*.5,y:(e.y+n.y)*.5};i=Math.max(i,Math.hypot(t.x-r.x,t.y-r.y))}return i}function Yg(e,t,n,r,i,a,o,s,c,l,u,d,f){if(!o||!s)return;let p=(i+a)*.5,m=qg(t,n,r,p,c,l),h=Jg(o,m,s);if(!m||d>=f||h<=u||a-i<=1/4096){e.push(s);return}Yg(e,t,n,r,i,p,o,m,c,l,u,d+1,f),Yg(e,t,n,r,p,a,m,s,c,l,u,d+1,f)}function Xg(e,t,n,r,{maxSegmentErrorPx:i=sg,maxSubdivisionDepth:a=8}={}){if(!Array.isArray(e)||e.length===0)return[];if(e.length===1)return[Kg(e[0],n,r)];let o=[];for(let s=0;s<e.length-1;s+=1){let c=qg(e,t,s,0,n,r),l=qg(e,t,s,1,n,r);!c||!l||(s===0&&o.push(c),Yg(o,e,t,s,0,1,c,l,n,r,i,0,a))}return o}function Zg(e,t){return e?t===`center`?e.centerPoint:og.has(t)?e.cornerPointsByKey[t]??null:null:null}function Qg(e,t,n,r,{source:i=tg,baseSamplesPerSegment:a=16}={}){let o=bg(i);return o===`none`?[]:Xg(e,t,n,r,{maxSegmentErrorPx:Math.max(.25,1/Math.max(a,1))}).map(e=>Zg(e,o)).filter(e=>Number.isFinite(e?.x)&&Number.isFinite(e?.y))}function $g(e,t,n,r,i){let a=e[n];if(!a)return null;let o=vg(t?.trajectoryMode)===Yh,s=pg(a),c={x:s.x*r,y:s.y*i},l=null;if(n<e.length-1)if(o){let n=Vg(e,t,a.id,`out`,r,i);n&&(l={x:n.x*r-c.x,y:n.y*i-c.y})}else{let t=pg(e[n+1]);l={x:t.x*r-c.x,y:t.y*i-c.y}}let u=null;if(n>0)if(o){let n=Vg(e,t,a.id,`in`,r,i);n&&(u={x:c.x-n.x*r,y:c.y-n.y*i})}else{let t=pg(e[n-1]);u={x:c.x-t.x*r,y:c.y-t.y*i}}let d=null;if(l&&u?d={x:l.x+u.x,y:l.y+u.y}:l?d=l:u&&(d=u),!d)return null;let f=Math.hypot(d.x,d.y);return!(f>0)||!Number.isFinite(f)?null:{x:d.x/f,y:d.y/f}}function e_(e,t,n){return(t.x-e.x)*(n.y-e.y)-(t.y-e.y)*(n.x-e.x)}function t_(e){let t=e.filter(e=>Number.isFinite(e?.x)&&Number.isFinite(e?.y));if(t.length<3)return t.slice();let n=t.slice().sort((e,t)=>e.x===t.x?e.y-t.y:e.x-t.x),r=[];for(let e of n){for(;r.length>=2&&e_(r[r.length-2],r[r.length-1],e)<=0;)r.pop();r.push(e)}let i=[];for(let e=n.length-1;e>=0;--e){let t=n[e];for(;i.length>=2&&e_(i[i.length-2],i[i.length-1],t)<=0;)i.pop();i.push(t)}return r.pop(),i.pop(),r.concat(i)}function n_(e,t,n){if(!Array.isArray(t)||t.length<2)return!1;for(let r=0;r<t.length;r+=1){let i=t[r],a=t[(r+1)%t.length],o=a.x-i.x,s=a.y-i.y,c=e.x-i.x,l=e.y-i.y,u=o*o+s*s;if(u<=0){let t=e.x-i.x,r=e.y-i.y;if(t*t+r*r<=n*n)return!0;continue}let d=o*l-s*c;if(d*d>n*n*u)continue;let f=o*c+s*l;if(!(f<-n*Math.sqrt(u))&&!(f>u+n*Math.sqrt(u)))return!0}return!1}var r_=[ng,rg,ig,ag];function i_(e,t){if(!Array.isArray(e)||e.length<2)return tg;let n=Xg(e,t,1,1);if(n.length===0)return tg;let r=t_(n.flatMap(e=>e.corners));if(r.length<3)return tg;for(let e of r_){let t=n.map(t=>t.cornerPointsByKey[e]).filter(e=>Number.isFinite(e?.x)&&Number.isFinite(e?.y));if(t.length!==0&&t.every(e=>n_(e,r,1e-5)))return e}return tg}function a_(e,t,n,r,{source:i=tg}={}){let a=bg(i);if(!Array.isArray(e)||e.length<2||a===`none`)return[];let o=[];for(let i=0;i<e.length;i+=1){let s=e[i],c=Zg(Kg(s,n,r),a);if(!c||!Number.isFinite(c.x)||!Number.isFinite(c.y))continue;let l=$g(e,t,i,n,r);l&&o.push({frameId:s.id,point:c,tangent:l})}return o}var o_=`reference-image`,s_=`back`,c_=`front`,l_=`reference-preset-blank`,u_=`(blank)`,d_=16e3,f_=4096;function p_(){return Math.random().toString(36).slice(2,10)}function m_(e,t){try{let t=globalThis.crypto?.randomUUID?.();if(typeof t==`string`&&t)return`${e}-${t}`}catch{}return t.count+=1,`${e}-${Date.now().toString(36)}-${t.count.toString(36)}-${p_()}`}var h_={item:{count:0},preset:{count:0},asset:{count:0}};function g_(){return m_(`reference-image`,h_.item)}function __(){return m_(`reference-preset`,h_.preset)}function v_(){return m_(`reference-asset`,h_.asset)}function y_(e){return typeof e==`number`&&Number.isFinite(e)}function b_(e,t,n){return Math.max(t,Math.min(n,e))}function x_(e,t=`reference.png`){return(String(e??``).trim().replace(/\\/g,`/`).split(`/`).pop()??``)||t}function S_(e,t){let n=Number(e?.w??e?.width),r=Number(e?.h??e?.height);return{w:y_(n)&&n>0?Math.max(1,Math.round(n)):t.w,h:y_(r)&&r>0?Math.max(1,Math.round(r)):t.h}}function C_(e,t=1){return b_(y_(e)?e:t,0,1)}function w_(e,t={ax:.5,ay:.5}){return{ax:y_(e?.ax??e?.x)?Number(e.ax??e.x):t.ax,ay:y_(e?.ay??e?.y)?Number(e.ay??e.y):t.ay}}function T_(e=`center`){let t=Am[String(e??`center`)]??Am.center;return{ax:t.x,ay:t.y}}function E_(e,t={x:0,y:0}){return{x:y_(e?.x)?e.x:t.x,y:y_(e?.y)?e.y:t.y}}function D_(e,t=`reference.png`){let n=S_(e?.originalSize,{w:1,h:1}),r=S_(e?.appliedSize,n);return{filename:x_(e?.filename,t),mime:typeof e?.mime==`string`&&e.mime.trim()?e.mime.trim():`application/octet-stream`,originalSize:n,appliedSize:r,pixelRatio:y_(e?.pixelRatio)&&e.pixelRatio>0?e.pixelRatio:r.w/Math.max(1,n.w),usedOriginal:e?.usedOriginal!==!1}}function O_(e=null){let{id:t,label:n=`Reference`,source:r=null,sourceMeta:i=null}=e??{},a=i?.filename??r?.fileName??r?.file?.name??`reference.png`;return{id:t??v_(),label:String(n??a).trim()||a,source:r,sourceMeta:D_(i,a)}}function k_(e){return{...e,source:e?.source??null,sourceMeta:D_(e?.sourceMeta,e?.label??`reference.png`)}}function A_(e,t=c_){return e===`back`?s_:t}function j_(e=null){let{id:t,assetId:n=``,name:r=`Reference`,group:i=c_,order:a=0,previewVisible:o=!0,exportEnabled:s=!0,opacity:c=1,scalePct:l=100,rotationDeg:u=0,offsetPx:d={x:0,y:0},anchor:f={ax:.5,ay:.5}}=e??{};return{id:t??g_(),assetId:String(n??``).trim(),name:String(r??``).trim()||`Reference`,group:A_(i),order:y_(a)?Math.max(0,Math.floor(a)):0,previewVisible:o!==!1,exportEnabled:s!==!1,opacity:C_(c,1),scalePct:y_(l)&&l>0?b_(l,.1,1e5):100,rotationDeg:y_(u)?u:0,offsetPx:E_(d),anchor:w_(f)}}function M_(e){return j_(e)}function N_(e,t){let n=String(e?.name??``),r=String(t?.name??``);return Number(e?.order??0)-Number(t?.order??0)||n.localeCompare(r)||String(e?.id??``).localeCompare(String(t?.id??``))}function P_(e=[],t=null){let n=t===`back`||t===`front`?t:null,r=Array.isArray(e)?e:[];return(n?[n]:[s_,c_]).flatMap(e=>r.filter(t=>t.group===e).sort(N_))}function F_(e=[],t=null){return P_(e,t)}function I_(e=[],t=null){return[...P_(e,t)].reverse()}function L_(e,t=0){let n=Math.max(0,Math.floor(Number(e)||0));return Math.max(0,Math.floor(Number(t)||0))+n}function R_(e){let t=F_(e),n=0,r=0;for(let e of t){if(e.group===`back`){e.order=n,n+=1;continue}e.order=r,r+=1}e.splice(0,e.length,...t)}function z_(e={}){let t={};return typeof e.name==`string`&&(t.name=e.name.trim()),(e.group===`back`||e.group===`front`)&&(t.group=e.group),y_(e.order)&&(t.order=Math.max(0,Math.floor(e.order))),typeof e.previewVisible==`boolean`&&(t.previewVisible=e.previewVisible),typeof e.exportEnabled==`boolean`&&(t.exportEnabled=e.exportEnabled),y_(e.opacity)&&(t.opacity=C_(e.opacity,1)),y_(e.scalePct)&&e.scalePct>0&&(t.scalePct=b_(e.scalePct,.1,1e5)),y_(e.rotationDeg)&&(t.rotationDeg=e.rotationDeg),e.offsetPx&&typeof e.offsetPx==`object`&&(t.offsetPx=E_(e.offsetPx)),e.anchor&&typeof e.anchor==`object`&&(t.anchor=w_(e.anchor)),t}function B_(e={}){return Object.fromEntries(Object.entries(e).filter(([e])=>String(e??``).trim()).map(([e,t])=>[e,z_(t)]))}function V_(e=null){let{id:t,name:n=u_,baseRenderBox:r=am,items:i=[]}=e??{},a=i.map(e=>j_(e)).filter(e=>e.assetId);return R_(a),{id:t??(n===`(blank)`?`reference-preset-blank`:__()),name:String(n??``).trim()||`(blank)`,baseRenderBox:S_(r,am),items:a}}function H_(e){return V_({...e,items:(e?.items??[]).map(M_)})}function U_(e=null){let{activeItemId:t=null,renderBoxCorrection:n={x:0,y:0},items:r={}}=e??{};return{activeItemId:typeof t==`string`&&t?t:null,renderBoxCorrection:E_(n),items:B_(r)}}function W_(e){return U_(e)}function G_(e=null){let{presetId:t=null,overridesByPresetId:n={}}=e??{},r=Object.fromEntries(Object.entries(n??{}).filter(([e])=>String(e??``).trim()).map(([e,t])=>[e,U_(t)]));return{presetId:typeof t==`string`&&t?t:null,overridesByPresetId:r}}function K_(e){return G_(e)}function q_(){return{version:1,activePresetId:l_,assets:[],presets:[V_()]}}function J_(e){let t=e.find(e=>e.id===`reference-preset-blank`)??null;if(t){t.name=u_;return}e.unshift(V_({id:l_,name:u_}))}function Y_(e={}){let t=(Array.isArray(e?.assets)?e.assets:[]).map(e=>O_({id:e?.id,label:e?.label,source:e?.source??null,sourceMeta:e?.sourceMeta})).filter(e=>e.sourceMeta),n=new Set(t.map(e=>e.id)),r=(Array.isArray(e?.presets)?e.presets:[]).map(e=>H_(e)).filter(Boolean);r.length===0&&r.push(V_()),J_(r);for(let e of r)e.items=e.items.filter(e=>n.has(e.assetId)),R_(e.items);let i=typeof e?.activePresetId==`string`&&r.some(t=>t.id===e.activePresetId)?e.activePresetId:r[0].id;return{version:y_(e?.version)&&e.version>0?Math.floor(e.version):1,activePresetId:i,assets:t,presets:r}}function X_(e){let t=Y_(e);return{version:t.version,activePresetId:t.activePresetId,assets:t.assets.map(k_),presets:t.presets.map(H_)}}function Z_(e=null,{availablePresetIds:t=[]}={}){let n=G_(e),r=new Set(t),i=Object.fromEntries(Object.entries(n.overridesByPresetId).filter(([e])=>r.size>0?r.has(e):!0));return{presetId:n.presetId&&r.has(n.presetId)?n.presetId:null,overridesByPresetId:i}}function Q_(e,t=null){let n=Y_(e),r=typeof t==`string`&&t?t:n.activePresetId;return n.presets.find(e=>e.id===r)??n.presets[0]??null}function $_(e,t=null){return Q_(e,t?.presetId??`reference-preset-blank`)?.id??null}function ev(e,t=null,n=null){let r=n??$_(e,t);return r?W_(t?.overridesByPresetId?.[r]??null):U_()}function tv(e,t,n,r,i,a){let o=w_(t),s=S_(n,am),c=S_(r,s),l=w_(i,T_(`center`)),u=E_(a),d=E_(e),f=(o.ax-l.ax)*(c.w-s.w),p=(o.ay-l.ay)*(c.h-s.h);return{x:d.x+f+u.x,y:d.y+p+u.y}}function nv({previousRenderBoxAnchor:e,nextRenderBoxAnchor:t,baseRenderBox:n,currentSize:r}){let i=S_(n,am),a=S_(r,i),o=w_(e,T_(`center`)),s=w_(t,o);return{x:(s.ax-o.ax)*(a.w-i.w),y:(s.ay-o.ay)*(a.h-i.h)}}function rv(e,t,n,r,i,a){let o=w_(t),s=S_(n,am),c=S_(r,s),l=w_(i,T_(`center`)),u=E_(a),d=E_(e),f=(o.ax-l.ax)*(c.w-s.w),p=(o.ay-l.ay)*(c.h-s.h);return{x:d.x-f-u.x,y:d.y-p-u.y}}function iv(e,t=null){let n=Q_(e,$_(e,t));if(!n)return{preset:null,override:U_(),items:[],assetsById:new Map};let r=Y_(e),i=new Map(r.assets.map(e=>[e.id,k_(e)])),a=ev(r,t,n.id),o=n.items.map(e=>{let t=a.items?.[e.id]??null;return j_({...M_(e),...t,offsetPx:t?.offsetPx?E_(t.offsetPx,e.offsetPx):E_(e.offsetPx),anchor:t?.anchor?w_(t.anchor,e.anchor):w_(e.anchor)})}).filter(e=>i.has(e.assetId));return R_(o),{preset:H_(n),override:a,items:o,assetsById:i}}var av=`single`,ov=`shot-camera-`,sv=`frame-`,cv=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`.split(``),lv=.5,uv=.5,dv=1,fv=80,pv=`all`,mv=Kh,hv=Jh,gv=eg,_v=`camera`,vv=`viewport`,yv=`perspective`;function bv(){return[{id:`pane-main`,role:_v,viewportPreset:yv,projection:`perspective`,shotCameraBinding:`active`}]}function xv(e){return`${ov}${e}`}function Sv(e){return`${sv}${e}`}function Cv(e){return cv[Math.max(e-1,0)]??`${e}`}function wv(e,t=`FRAME A`){let n=Array.from(String(e??``)).map(e=>{let t=e.codePointAt(0)??0;return t<32||t===127?` `:e}).join(``).replace(/\s+/g,` `).trim();return Array.from(n).slice(0,64).join(``)||t}function Tv(e,t){let n=Array.isArray(e)?e.map(e=>e?.id).filter(e=>typeof e==`string`&&e.length>0):[],r=new Set(n),i=[];for(let e of t??[])typeof e!=`string`||!r.has(e)||i.includes(e)||i.push(e);return i.length>0?i:n}function Ev(e,t){return t===`selected`||t===`all`?t:e===`selected`||e===`all`?e:pv}function Dv({mode:e,preferredMode:t,hasRememberedSelection:n=!1}){if(e===`selected`||e===`all`)return`off`;let r=Ev(e,t);return r===`selected`&&!n?`all`:r}function Ov(e){let t=0;for(let n of e){let e=RegExp(`^${ov}(\\d+)$`).exec(n.id);e&&(t=Math.max(t,Number(e[1])||0))}return t+1}function kv(e){let t=0;for(let n of e){let e=RegExp(`^${sv}(\\d+)$`).exec(n.id);e&&(t=Math.max(t,Number(e[1])||0))}return t+1}function Av(e){return{...e,anchor:e.anchor&&typeof e.anchor==`object`?{...e.anchor}:e.anchor}}function jv(e){return Number.isFinite(e.x)&&Number.isFinite(e.width)?e.x+e.width*.5:Number.isFinite(e.x)?e.x:lv}function Mv(e){return Number.isFinite(e.y)&&Number.isFinite(e.height)?e.y+e.height*.5:Number.isFinite(e.y)?e.y:uv}function Nv(e){if(Number.isFinite(e.scale)&&e.scale>0)return e.scale;let t=[Number.isFinite(e.width)?e.width*am.width/om.width:NaN,Number.isFinite(e.height)?e.height*am.height/om.height:NaN].filter(e=>Number.isFinite(e)&&e>0);return t.length===0?dv:t.reduce((e,t)=>e+t,0)/t.length}function Pv(e,t){let n=Number(e);return Number.isFinite(n)?Math.min(1,Math.max(0,n)):t}function Fv(e,t,n){if(typeof e==`string`){let t=Am[e];if(t)return{...t}}return e&&typeof e==`object`?{x:Pv(e.x,t),y:Pv(e.y,n)}:{x:t,y:n}}function Iv({id:e,name:t,source:n}={}){let r=n?Av(n):{x:lv,y:uv,scale:dv,rotation:0,order:0},i=jv(r),a=Mv(r);return{...r,x:i,y:a,scale:Nv(r),rotation:Number.isFinite(r.rotation)?r.rotation:0,anchor:Fv(r.anchor,i,a),order:Number.isFinite(r.order)?r.order:0,id:e??r.id??Sv(1),name:wv(t??r.name,`FRAME A`)}}function Lv(e=[]){return{mode:`off`,preferredMode:pv,opacityPct:fv,selectedIds:Tv(e,[]),shape:mv,trajectoryMode:hv,trajectoryExportSource:gv,trajectory:{nodesByFrameId:{}}}}function Rv(e,t){return{mode:e?.mode===`selected`||e?.mode===`all`?e.mode:`off`,preferredMode:Ev(e?.mode,e?.preferredMode),opacityPct:Number.isFinite(e?.opacityPct)?Math.min(100,Math.max(0,Math.round(e.opacityPct))):fv,selectedIds:Tv(t,e?.selectedIds),shape:_g(e?.shape),trajectoryMode:vg(e?.trajectoryMode),trajectoryExportSource:bg(e?.trajectoryExportSource),trajectory:{nodesByFrameId:Ng(t,e?.trajectory)}}}function zv(){return[Iv({id:Sv(1),name:`FRAME A`})]}function Bv({id:e,name:t,source:n}={}){let r=n?Jv(n):{lens:{baseFovX:Wm,shiftX:0,shiftY:0},clipping:{mode:`auto`,near:pm,far:mm},outputFrame:{widthScale:1,heightScale:1,viewZoom:1,viewZoomAuto:!0,viewportCenterAuto:!0,anchor:`center`,centerX:.5,centerY:.5,viewportCenterX:.5,viewportCenterY:.5,fitScale:0,fitViewportWidth:0,fitViewportHeight:0},exportSettings:{exportName:`cf-%cam`,exportFormat:`psd`,exportGridOverlay:!0,exportGridLayerMode:`bottom`,exportModelLayers:!0,exportSplatLayers:!0},navigation:{rollLock:!1},compositionGuide:Ih(),referenceImages:G_(),frames:zv(),activeFrameId:Sv(1)},i=(r.frames??[]).slice(0,20).map((e,t)=>Iv({id:e?.id??Sv(t+1),name:e?.name,source:e})),a=Lv(i);return{...r,id:e??r.id??xv(1),name:t??r.name??`Camera 1`,frameMask:{...a,...Rv(r.frameMask,i)},frames:i,activeFrameId:r.activeFrameId??i[0]?.id??null}}function Vv(){return[Bv({id:xv(1),name:`Camera 1`})]}function Hv(e,t){return e.find(e=>e.id===t)??null}function Uv(e,t){return Hv(e,t)??e[0]??{id:`pane-fallback`,role:`camera`,viewportPreset:`perspective`,projection:`perspective`,shotCameraBinding:`active`}}function Wv(e,t){return e.find(e=>e.id===t)??null}function Gv(e,t){return Wv(e,t)??e[0]??null}function Kv(e,t){return e.find(e=>e.id===t)??null}function qv(e,t){return Kv(e,t)??e[0]??null}function Jv(e){let t=(e.frames??[]).slice(0,20).map(Av),n=Rv(e.frameMask,t);return{...e,lens:{...e.lens,baseFovX:Number.isFinite(Number(e.lens?.baseFovX))?Number(e.lens.baseFovX):Wm,shiftX:Bm(e.lens?.shiftX),shiftY:Bm(e.lens?.shiftY)},clipping:{...e.clipping},outputFrame:{...e.outputFrame,centerX:Number.isFinite(e.outputFrame?.centerX)?e.outputFrame.centerX:.5,centerY:Number.isFinite(e.outputFrame?.centerY)?e.outputFrame.centerY:.5,viewportCenterX:Number.isFinite(e.outputFrame?.viewportCenterX)?e.outputFrame.viewportCenterX:.5,viewportCenterY:Number.isFinite(e.outputFrame?.viewportCenterY)?e.outputFrame.viewportCenterY:.5,fitScale:Number.isFinite(e.outputFrame?.fitScale)&&e.outputFrame.fitScale>0?e.outputFrame.fitScale:0,fitViewportWidth:Number.isFinite(e.outputFrame?.fitViewportWidth)?e.outputFrame.fitViewportWidth:0,fitViewportHeight:Number.isFinite(e.outputFrame?.fitViewportHeight)?e.outputFrame.fitViewportHeight:0,viewZoomAuto:e.outputFrame?.viewZoomAuto!==!1,viewportCenterAuto:e.outputFrame?.viewportCenterAuto!==!1},exportSettings:{exportName:e.exportSettings?.exportName??``,exportFormat:e.exportSettings?.exportFormat??`psd`,exportGridOverlay:!!e.exportSettings?.exportGridOverlay,exportGridLayerMode:e.exportSettings?.exportGridLayerMode===`overlay`?`overlay`:`bottom`,exportModelLayers:!!e.exportSettings?.exportModelLayers,exportSplatLayers:e.exportSettings?.exportSplatLayers??!0},frameMask:{...Lv(t),...n,trajectory:{nodesByFrameId:Sg(n.trajectory?.nodesByFrameId)}},navigation:{rollLock:!!e.navigation?.rollLock},compositionGuide:Fh(e.compositionGuide),referenceImages:K_(e.referenceImages),frames:t,activeFrameId:e.activeFrameId??t[0]?.id??null}}function Yv(e){return`mode.${e?.role??`camera`}`}function Xv(e,t){return e.map((e,n)=>n===0?{...e,role:t}:e)}var Zv=[{value:`ja`,labelKey:`localeName.ja`},{value:`en`,labelKey:`localeName.en`}];function Qv(e){let t=String(e??``).trim().toLowerCase();if(!t)return null;let n=t.split(/[-_]/)[0];return Zv.some(e=>e.value===n)?n:null}function $v({search:e=globalThis.location?.search??``,navigatorLanguages:t=globalThis.navigator?.languages??[],navigatorLanguage:n=globalThis.navigator?.language??``}={}){let r=new URLSearchParams(e),i=Qv(r.get(`lang`)??r.get(`locale`));if(i)return i;for(let e of[...t,n]){let t=Qv(e);if(t)return t}return`ja`}var ey={ja:{app:{previewTag:`Spark 2.1`,panelCopy:`Spark 2.1 を基盤にした CAMERA_FRAMES のワークフロー。`},field:{language:`Language`,remoteUrl:`リモート URL`,activeShotCamera:`カメラ`,shotCameraName:`カメラ名`,shotCameraFov:`標準FRAME水平FOV`,shotCameraEquivalentMm:`フルサイズ焦点距離`,shotCameraLensShift:`レンズシフト (%)`,viewportFov:`ビューポート水平FOV`,viewportEquivalentMm:`ビューポート フルサイズ焦点距離`,shotCameraClipMode:`クリップ範囲`,shotCameraNear:`Near`,shotCameraFar:`Far`,shotCameraYaw:`Yaw`,shotCameraPitch:`Pitch`,shotCameraRoll:`Roll`,shotCameraRollLock:`ロールを固定`,shotCameraMoveHorizontal:`左右`,shotCameraMoveVertical:`上下`,shotCameraMoveDepth:`前後`,shotCameraExportName:`書き出し名`,exportFormat:`書き出し形式`,exportGridOverlay:`ガイドを含める`,exportReferenceImages:`下絵を含める`,exportGridLayerMode:`グリッド重ね順`,exportModelLayers:`モデルをレイヤー化`,exportSplatLayers:`3DGS をレイヤー化`,outputFrameWidth:`用紙サイズ 幅`,outputFrameHeight:`用紙サイズ 高`,cameraViewZoom:`表示ズーム`,compositionGuide:`構図ガイド`,compositionGuideScope:`対象`,compositionGuidePattern:`種類`,anchor:`用紙サイズ変更基準点`,assetScale:`スケール`,assetPosition:`位置`,assetRotation:`回転`,transformSpace:`座標系`,transformMode:`ツール`,activeFrame:`FRAME`,frameMaskOpacity:`マスク不透明度`,frameMaskShape:`マスク形状`,frameTrajectoryMode:`軌道補間`,frameTrajectoryNodeMode:`軌道ノード`,frameTrajectoryExportSource:`FRAME軌道出力`,exportTarget:`書き出し対象`,exportMode:`出力タイプ`,exportFrameSource:`フレーム範囲`,exportPresetSelection:`選択カメラ`,referenceImageOpacity:`不透明度`,referenceImageScale:`拡縮`,referencePresetName:`プリセット名`,referenceImageOffsetX:`位置 X`,referenceImageOffsetY:`位置 Y`,referenceImageRotation:`回転`,referenceImageOrder:`順番`,referenceImageGroup:`前後`,measurementLength:`測定距離`,lightIntensity:`ライト強度`,lightAmbient:`アンビエント`,lightDirection:`ライト方向`,lightAzimuth:`方位`,lightElevation:`仰角`,positionX:`X`,positionY:`Y`,positionZ:`Z`},section:{file:`ファイル`,view:`ビューポート画角`,displayZoom:`表示ズーム`,scene:`シーン`,sceneManager:`シーンマネージャー`,selectedSceneObject:`オブジェクトプロパティ`,lighting:`照明`,tools:`ツール`,project:`プロジェクト`,shotCamera:`カメラ`,shotCameraManager:`カメラ一覧`,shotCameraProperties:`カメラプロパティ`,transformSpace:`座標系`,pose:`Pose`,referenceImages:`下絵`,referencePresets:`下絵プリセット`,referenceManager:`下絵マネージャー`,referenceProperties:`下絵プロパティ`,frames:`FRAME`,mask:`マスク`,outputFrame:`用紙設定`,output:`出力`,export:`書き出し`,exportSettings:`書き出し設定`},menu:{newProjectAction:`新規プロジェクト`,saveWorkingStateAction:`プロジェクトを保存`,savePackageAction:`プロジェクトを書き出し`},project:{untitled:`無題`,dirtyHint:`作業状態に未保存の変更があります`,packageHint:`共有・持ち出しには .ssproj 保存が必要です`},mode:{viewport:`ビューポート`,camera:`カメラビュー`},transformSpace:{world:`ワールド`,local:`ローカル`},transformMode:{none:`なし`,select:`選択`,reference:`下絵`,transform:`変形`,pivot:`オブジェクト原点`},selection:{multipleSceneAssetsTitle:`{count}件の3Dオブジェクト`,multipleReferenceImagesTitle:`{count}件の下絵`},viewportTool:{moveCenter:`移動`},exportTarget:{current:`現在の Camera`,all:`すべての Camera`,selected:`選択した Camera`},exportFormat:{png:`PNG`,psd:`PSD`,webm:`WebM`},exportMode:{current:`現在フレーム`,sequence:`連番`,video:`動画`},exportFrameSource:{duration:`全デュレーション`,keyframes:`キーのあるフレームのみ`},exportModeSummary:{current:`静止画は現在フレーム {frame} の見た目を書き出します。`,sequence:`{source}: {frames} フレーム × {cameras} Camera = {count} ファイルを ZIP にまとめます。`,video:`{frames} フレーム × {cameras} Camera を {fps} FPS の WebM として書き出します。`,noFrames:`書き出せるアニメーションフレームがありません。`,videoUnsupported:`このブラウザでは WebM 動画書き出しを利用できません。静止画連番を使ってください。`},gridLayerMode:{bottom:`最下層`,overlay:`アイレベルの下`},frameMaskShape:{bounds:`外接矩形`,trajectory:`軌道スイープ`},frameTrajectoryMode:{line:`直線`,spline:`スプライン`},frameTrajectoryNodeMode:{auto:`自動`,corner:`コーナー`,mirrored:`対称`,free:`フリー`},trajectorySource:{none:`なし`,center:`中心`,topLeft:`左上`,topRight:`右上`,bottomRight:`右下`,bottomLeft:`左下`},compositionGuideScope:{selectedFrame:`選択FRAME`,allFrames:`全FRAME`},compositionGuidePattern:{thirds:`三分割`,golden:`黄金比`,center:`中央分割`,grid:`グリッド`},clipMode:{auto:`自動`,manual:`手動`},timeline:{title:`タイムライン`,animation:`アニメーション`,enabled:`ON`,disabled:`OFF`,frame:`Frame`,fps:`FPS`,duration:`尺`,tracks:`トラック`,noKeys:`キーなし`,autoKey:`Auto`,start:`先頭へ`,play:`再生`,pause:`一時停止`,end:`終端へ`,previousKey:`前のキーへ`,nextKey:`次のキーへ`,zoomIn:`拡大`,zoomOut:`縮小`,keyTarget:`キー対象`,keyTargetCamera:`カメラ`,keyTargetSelectedObjects:`選択Obj`,keyTargetBoth:`両方`,keyTargetNoObjects:`未選択`,keyTargetObjects:`{count} オブジェクト`,targetTypeCamera:`CAM`,targetTypeMesh:`MESH`,targetTypeSplat:`SPLAT`,addKey:`キーを追加`,copyKeys:`選択キーをコピー`,pasteKeys:`現在フレームへ貼り付け`,deleteKeys:`選択キーを削除`,currentFrameKeyed:`キーあり`,currentFrameNoKey:`キーなし`,interpolation:`補間`,interpolationLinear:`Linear`,interpolationHold:`Hold`,keyScale:`Scale`,applyKeyScale:`適用`,filterAll:`All`,filterKeyed:`Keyed`,filterFocus:`Focus`,filterAuto:`Auto`,filterSearch:`検索`,collapse:`折りたたむ`},action:{newProject:`新規プロジェクト`,saveProject:`プロジェクトを保存`,exportProject:`プロジェクトを書き出し`,savePackageAs:`別名で保存`,overwritePackage:`上書き保存`,openFiles:`開く...`,resetFrameTrajectoryNodeAuto:`ノードを自動に戻す`,openReferenceImages:`下絵を開く`,duplicateReferencePreset:`プリセットを複製`,deleteReferencePreset:`プリセットを削除`,clear:`クリア`,loadUrl:`URLを読み込む`,collapseWorkbench:`パネルを最小化`,expandWorkbench:`パネルを開く`,cancel:`キャンセル`,saveAndNewProject:`保存して新規`,savePackageAndNewProject:`保存して新規`,discardAndNewProject:`保存せず新規`,saveAndOpenProject:`保存して開く`,savePackageAndOpenProject:`保存して開く`,discardAndOpenProject:`保存せず開く`,close:`閉じる`,continueSave:`保存する`,continueLoad:`読み込む`,showAsset:`表示`,hideAsset:`非表示`,showReferenceImages:`下絵を表示`,hideReferenceImages:`下絵を非表示`,showReferenceImage:`下絵を表示`,hideReferenceImage:`下絵を非表示`,showSelectedReferenceImages:`選択中の下絵を表示`,hideSelectedReferenceImages:`選択中の下絵を非表示`,clearSelection:`選択を解除`,undo:`元に戻す`,redo:`やり直す`,duplicateSelectedSceneAssets:`選択中のオブジェクトを複製`,deleteSelectedSceneAssets:`選択中のオブジェクトを削除`,includeReferenceImageInExport:`書き出しに含める`,excludeReferenceImageFromExport:`書き出しから外す`,includeSelectedReferenceImagesInExport:`選択中の下絵を書き出しに含める`,excludeSelectedReferenceImagesFromExport:`選択中の下絵を書き出しから外す`,deleteSelectedReferenceImages:`選択中の下絵を削除`,moveAssetUp:`上へ`,moveAssetDown:`下へ`,newShotCamera:`カメラを追加`,duplicateShotCamera:`複製`,deleteShotCamera:`削除`,nudgeLeft:`← 左`,nudgeRight:`右 →`,nudgeUp:`↑ 上`,nudgeDown:`下 ↓`,nudgeForward:`前へ`,nudgeBack:`後へ`,viewportToShot:`Viewportの姿勢をCameraへ`,shotToViewport:`Cameraの姿勢をViewportへ`,resetActive:`現在のビューをリセット`,refreshPreview:`プレビューを更新`,downloadOutput:`書き出す`,downloadSequence:`連番を書き出す`,downloadVideo:`動画を書き出す`,downloadPng:`PNGを書き出す`,downloadPsd:`PSDを書き出す`,resetScale:`1xに戻す`,applyAssetTransform:`変形適用`,resetPivot:`Pivotを戻す`,resetLightDirection:`向きを戻す`,adjustLens:`焦点距離調整`,adjustRoll:`カメラロール`,zoomTool:`ズーム`,moveToolbar:`ツールバーを移動`,splatEditTool:`3DGS編集`,splatEditOptimizeLod:`LoD 最適化`,quickMenu:`クイックメニュー`,pinQuickSection:`レールに追加`,unpinQuickSection:`レールから外す`,measureTool:`測定ツール`,apply:`適用`,frameTool:`フレームツール`,measurementStartPoint:`測定始点`,measurementEndPoint:`測定終点`,measurementAxis:{x:`X 軸で伸ばす`,y:`Y 軸で伸ばす`,z:`Z 軸で伸ばす`},newFrame:`FRAME を追加`,duplicateFrame:`複製`,deleteFrame:`削除`,renameFrame:`FRAME名を編集`,toggleSelectedFrameMask:`選択中マスク`,toggleAllFrameMask:`全体マスク`,toggleFrameTrajectoryEdit:`軌道編集`,enableFrameMask:`マスクを有効`,disableFrameMask:`マスクを無効`,fitOutputFrameToSafeArea:`表示をフィット`},unit:{millimeter:`millimeter`,meter:`meter`,percent:`percent`,pixel:`pixel`,degree:`degree`},tooltip:{fileMenu:`開く・保存・パッケージ保存などのプロジェクト操作です。`,collapseWorkbench:`右パネルを最小化して、必要な時だけ呼び出します。`,modeCamera:`ショットカメラで構図と下絵を確認します。`,modeViewport:`作業用カメラでシーンを自由に見回します。`,toolSelect:`3D オブジェクトの選択モードです。もう一度押すと解除します。`,toolReference:`下絵の選択と変形モードです。Shift+R で切り替えます。R は下絵表示の一時切替です。もう一度押すと解除します。`,toolSplatEdit:`選択中の 3DGS をスプラット単位で編集します。直方体選択、ブラシ選択、変形をここから切り替えます。Shift+E で切り替えます。`,toolTransform:`3D オブジェクトの変形モードです。もう一度押すと解除します。`,toolPivot:`3Dオブジェクトの変形原点を編集します。もう一度押すと解除します。`,toolZoom:`カメラビューでは表示ズーム、ビューポートでは画角を調整します。もう一度押すと解除します。`,measureTool:`画面上の 2 点間の距離を測り、その長さ比で選択中オブジェクトへ一様スケールを適用します。`,frameTool:`FRAME の追加・複製・削除と、全体 / 選択中マスクの切替やマスク不透明度の調整を行います。`,quickMenu:`ツールのクイックメニューを開きます。モバイルではここから使うのが安全です。`,clearSelection:`3Dオブジェクト、下絵、FRAME の選択を解除して、アクティブツールを外します。`,undo:`直前の操作を元に戻します。`,redo:`元に戻した操作をやり直します。`,referencePreviewSessionVisible:`下絵のプレビュー表示だけを一時的に切り替えます。保存済みの表示状態は変えません。R で切り替えます。`,tabScene:`シーン、アセット、ライティングを管理します。`,tabCamera:`ショットカメラと用紙設定を編集します。`,tabReference:`下絵プリセットと下絵レイヤーを編集します。`,tabExport:`書き出し設定と出力を管理します。`,copyViewportPoseToShot:`Viewport の位置、向き、焦点距離を Camera へコピーします。クリップ範囲は変えません。`,copyShotPoseToViewport:`Camera の位置と視線方向を Viewport へコピーします。ロール、焦点距離、クリップ範囲は変えません。`,resetActiveView:`現在の Camera / Viewport の位置と向きをホーム位置へ戻します。`,frameMaskSelected:`選択中の FRAME 群を囲む範囲の外側を暗くします。もう一度押すと解除します。`,frameMaskAll:`すべての FRAME を囲む範囲の外側を暗くします。もう一度押すと解除します。`,frameMaskShapeField:`外接矩形で囲うか、FRAME の並びに沿って矩形が通過した範囲を使うかを選びます。`,frameTrajectoryModeField:`FRAME の中心を結ぶ軌道を直線でつなぐか、スプラインで滑らかにつなぐかを選びます。`,frameTrajectoryNodeModeField:`選択中ノードの曲がり方を切り替えます。自動は周囲から補間、コーナーは角、対称は両ハンドル連動、フリーは個別調整です。`,frameTrajectoryExportSourceField:`PSD の FRAME グループへ書き出す軌道レイヤーの基準点です。中心か四隅のどれを軌道として使うかを選べます。`,toggleFrameTrajectoryEdit:`ビューポート上に軌道ノードとハンドルを表示して編集します。FRAME の移動・回転・拡縮はそのまま併用できます。`,resetFrameTrajectoryNodeAuto:`選択中ノードの手動ハンドルを捨てて、自動補間の形へ戻します。`,openQuickSection:`この項目だけをクイックパネルで開きます。もう一度押すと閉じます。`,pinQuickSection:`この項目を右レールのショートカットに追加します。`,unpinQuickSection:`この項目を右レールのショートカットから外します。`,shotCameraEquivalentMmField:`フルサイズ換算の焦点距離です。数値を変えるとアクティブなショットカメラの画角が変わります。`,shotCameraLensShiftField:`カメラを回転せずに投影中心をずらします。+X は右側、+Y は上側を広く入れます。`,outputFrameAnchorField:`用紙サイズを変える時に、どの基準点を固定してフレームを広げるかを選びます。`,compositionGuideField:`Camera View にだけ表示する構図確認用の補助線です。PNG / PSD 書き出しには含めません。`,compositionGuideScopeField:`選択中またはアクティブな FRAME に合わせるか、すべての FRAME を含む矩形に合わせるかを選びます。`,compositionGuidePatternField:`三分割、黄金比、中央分割、または水平垂直を確認しやすいグリッドを切り替えます。`,shotCameraExportName:`書き出しファイル名のテンプレートです。%cam は現在のカメラ名に置き換わります。`,exportFormatField:`このカメラの書き出し形式を選びます。PNG は統合画像、PSD はレイヤー付きです。`,exportGridOverlayField:`Infinite Grid と Eye Level を書き出しに含めます。`,exportGridLayerModeField:`ガイドを出力画像の下に入れるか、上に重ねるかを選びます。`,exportModelLayersField:`PSD 書き出し時にモデルを個別レイヤー化します。`,exportSplatLayersField:`PSD 書き出し時に 3DGS を個別レイヤー化します。モデルレイヤー化が前提です。`,exportTargetField:`現在のカメラ、全カメラ、または選択したカメラだけを書き出します。`,exportPresetSelectionField:`選択書き出しの対象に含めるカメラをここで選びます。`,exportReferenceImagesField:`下絵を今回の書き出しに含めるかどうかを一時的に切り替えます。`,downloadOutput:`現在の対象と各カメラの設定に従って PNG または PSD を書き出します。`},hint:{viewMode:`カメラビューでは ショットカメラ と出力フレームを確認します。ビューポートでは作業用カメラでシーンを操作します。`,shotCameraList:`ショットカメラ はドキュメントとして保持します。追加は現在のビュー姿勢から、複製は現在の ショットカメラ 設定ごと作成します。`,shotCameraClip:`自動では ショットカメラ ごとの Near を保持しつつ、Far をシーン境界から決めます。手動では Near/Far を ショットカメラ ごとに固定します。`,shotCameraExport:`書き出し形式とガイド・レイヤー設定は ショットカメラ ごとに保持します。PSD の 3DGS レイヤー化はモデルレイヤー化が前提です。`,outputFrame:`カメラビューでは off-axis projection を使い、出力フレーム内の構図を最終出力と一致させます。`,sceneCalibration:`3DGS は raw 1x で入るので、必要に応じてワールドスケールを補正します。モデルも必要なら個別に調整できます。`,sceneOrder:`一覧の順序は PSD のオブジェクトレイヤー順の基準です。表示の切替は viewport と export の両方に反映します。`,lightDirection:`球体上のハンドルをドラッグして、いま見ているカメラ基準でライト方向を回します。`,frames:`FRAME は Camera View 上の 2D overlay として扱います。いまは直接選択で移動・拡縮・回転・anchor 編集まで行えます。`,framesEmpty:`まだ FRAME がありません。最初の FRAME を追加してください。`,exportTargetSelection:`選択書き出しでは {count} 件の Camera が対象です。`,referenceImagesEmpty:`まだ下絵がありません。PNG / JPG / WEBP / PSD を読み込んでください。`},drop:{title:`画面にファイルをドロップして開く`,body:`3Dデータ（PLY / SPZ / SOG / SPLAT / GLB / FBX など）、プロジェクトパッケージ（.ssproj）、下絵（PNG / JPG / WEBP / PSD）を読み込めます。`,controlsTitle:`カメラ操作`,controlOrbit:`左ドラッグ: 見回す`,controlPan:`右ドラッグ: 左右 / 上下に移動`,controlDolly:`ホイール: 前進 / 後退`,controlAnchorOrbit:`Ctrl + 左ドラッグ: クリック位置を中心に回転`},badge:{horizontalFov:`水平FOV`,clipRange:`clip`},export:{idle:`待機`,rendering:`レンダリング中`,ready:`準備完了`,exporting:`書き出し中`},overlay:{newProjectTitle:`新規プロジェクト`,newProjectMessage:`保存していない変更があります。作業状態を保存してから新しいプロジェクトを開始しますか？`,newProjectMessageWithPackage:`保存していない変更があります。新しいプロジェクトを始める前に保存しますか？`,openProjectTitle:`別のプロジェクトを開く`,openProjectMessage:`保存していない変更があります。作業状態を保存してから別のプロジェクトを開きますか？`,openProjectMessageWithPackage:`保存していない変更があります。別のプロジェクトを開く前に保存しますか？`,workingSaveNoticeTitle:`プロジェクトを保存`,workingSaveNoticeMessage:`Ctrl+S はこのブラウザ内にプロジェクトの作業状態を保存します。他の環境へ持ち出したり共有したりする時は「プロジェクトを書き出し」を使ってください。`,startupImportTitle:`共有データを読み込みますか？`,startupImportMessage:`このリンクは外部の共有データを読み込みます。読み込みを続けると、下の URL へアクセスします。`,importTitle:`3D データを読み込み中`,importMessage:`読み込み中です。シーンに反映するまで少し待ってください。`,importPhaseVerify:`読み込み対象を確認`,importPhaseExpand:`パッケージを展開`,importPhaseLoad:`3D アセットを読込`,importPhaseApply:`シーンへ反映`,importDetailOpenProjectArchive:`プロジェクトパッケージを開いています…`,importDetailInspectProjectArchive:`プロジェクトパッケージを確認中…`,importDetailPrepareLocalProjectSource:`ローカル作業コピーを作成中…`,importDetailCopyLocalProjectSource:`ローカル作業コピーへ読み込み中…`,importDetailCopyLocalProjectSourceProgress:`ローカル作業コピーを作成中… {copied} / {total} ({percent}%)`,importDetailCompleteLocalProjectSource:`ローカル作業コピーの準備が完了しました。`,importDetailWarnLocalProjectSource:`クラウドストレージ上のファイルは直接読み込みが不安定な場合があります。失敗した場合は端末に保存してから開いてください。`,importDetailFailLocalProjectSource:`ローカル作業コピーを作成できませんでした。端末にファイルを保存してから開き直してください。`,importDetailReadProjectManifest:`manifest を読込中… ({file})`,importDetailReadProjectDocument:`プロジェクト設定を読込中… ({file})`,importDetailScanProjectAssets:`展開する project asset を確認中… ({count}件)`,importDetailExpandProjectAsset:`{index}/{count} プロジェクト asset を展開: {name}`,importDetailExpandProjectAssetWithFile:`{index}/{count} プロジェクト asset を展開: {name} ({file})`,importDetailExtractProjectAssetData:`{index}/{count} プロジェクト asset の内容を展開中: {stage} ({fileCount}ファイル)`,importDetailExpandProjectAssetComplete:`{index}/{count} プロジェクト asset の展開完了`,importDetailExtractReferenceImage:`{index}/{count} reference image を展開中: {name}`,importDetailExpandComplete:`パッケージの展開が完了しました。`,importProjectAssetExtractStage:{file:`埋め込みファイル`,packedSplat:`3DGS manifest / companion files`,rawSplat:`raw 3DGS arrays / LoD arrays`},importDetailExpandPackage:`{index}/{count} パッケージ: {name}`,importDetailLoadAsset:`{index}/{count} アセット: {name}`,importDetailLoadAssetStage:`{index}/{count} アセット: {name} - {stage}`,importTimingStage:`工程`,importTimingTotal:`合計`,importLoadStage:{materialize:`パッケージ resource を展開中`,readBytes:`ファイル bytes を読込中`,decodeSource:`3DGS データ変換中`,prepareRawPackedSplat:`raw 3DGS arrays / LoD arrays 準備中`,initLod:`焼込み済み LoD を初期化中`,initPackedSplats:`Spark PackedSplats 初期化中`,buildBounds:`bounds を計算中`,initSplatMesh:`GPU メッシュを準備中`,registerScene:`シーンへ登録中`,loadModel:`3D model を読込中`},importDetailApply:`Camera / FRAME / シーン状態を反映`,blockedStartupTitle:`共有リンクを読み込めません`,blockedStartupMessage:`このリンクはアプリから直接開けませんでした。`,blockedStartupReasonHttps:`HTTPS ではないため拒否しました`,blockedStartupReasonPrivate:`private address / localhost のため拒否しました`,blockedStartupReasonInvalid:`URL として解釈できませんでした`,importErrorTitle:`読み込みに失敗しました`,importErrorMessageGeneric:`このデータは読み込めませんでした。`,importErrorMessageRemote:`このリンクはアプリから直接開けませんでした。`,errorDetails:`詳細`,packageSaveTitle:`プロジェクトを書き出し`,packageSaveMessage:`このプロジェクトを持ち運び用の .ssproj ファイルとして保存します。`,packageSaveMessageWithOverwrite:`このプロジェクトを持ち運び用の .ssproj ファイルとして保存します。`,exportTitle:`書き出し中`,exportMessage:`書き出しが終わるまで少し待ってください。完了するまで他の操作は無効です。`,exportDetailSingle:`{camera} を {format} で書き出し中…`,exportDetailBatch:`{index}/{count} {camera} を {format} で書き出し中…`,exportDetailFrameBatch:`{index}/{count} {camera} の {frame} を {format} で書き出し中…`,exportProgressFrame:`フレーム {frame}`,exportPhasePrepare:`準備`,exportPhaseBeauty:`レンダリング`,exportPhaseGuides:`ガイド`,exportPhaseMasks:`マスク`,exportPhasePsdBase:`PSDベース`,exportPhaseModelLayers:`モデルレイヤー`,exportPhaseSplatLayers:`3DGSレイヤー`,exportPhaseReferenceImages:`下絵`,exportPhaseWrite:`書き出し`,exportPhaseDetailPrepare:`カメラと出力設定を切り替えています…`,exportPhaseDetailBeauty:`最終レンダリングを取得しています…`,exportPhaseDetailGuides:`ガイド描画を準備しています…`,exportPhaseDetailGuidesGrid:`Infinite Grid を書き出し用に描画しています…`,exportPhaseDetailGuidesEyeLevel:`Eye Level を書き出し用に描画しています…`,exportPhaseDetailMasks:`マスクを構築しています…`,exportPhaseDetailMaskBatch:`{index}/{count} {name} のマスクを作成中…`,exportPhaseDetailPsdBase:`PSD のベース画像を構築しています…`,exportPhaseDetailModelLayers:`モデルレイヤーを準備しています…`,exportPhaseDetailModelLayersBatch:`{index}/{count} {name} のモデルレイヤーを構築中…`,exportPhaseDetailSplatLayers:`3DGS レイヤーを準備しています…`,exportPhaseDetailSplatLayersBatch:`{index}/{count} {name} の 3DGS レイヤーを構築中…`,exportPhaseDetailReferenceImages:`下絵レイヤーを合成しています…`,exportPhaseDetailReferenceImagesBatch:`{index}/{count} {name} の下絵を配置中…`,exportPhaseDetailWritePng:`PNG ファイルを書き出しています…`,exportPhaseDetailWritePsd:`PSD ドキュメントを書き出しています…`,exportPhaseDetailWriteWebm:`WebM 動画を書き出しています…`,exportErrorTitle:`書き出しに失敗しました`,exportErrorMessage:`書き出し中にエラーが発生しました。詳細を確認してください。`,packageSaveErrorTitle:`プロジェクトの書き出しに失敗しました`,packageSaveErrorMessage:`プロジェクトの書き出し中にエラーが発生しました。詳細を確認してください。`,packagePhaseCollect:`状態を収集`,packagePhaseResolve:`asset を解決`,packagePhaseCompress:`3DGS を圧縮`,packagePhaseWrite:`パッケージを書き込み`,packageDetailCollect:`保存対象を収集中…`,packageDetailAsset:`{index}/{total} asset: {name}`,packageDetailAssetWithFile:`{index}/{total} asset: {name} ({file})`,packageDetailWrite:`ファイルを書き込み中…`,packageWriteStage:{zipEntries:`ZIPアーカイブを書き込み中…`},packageResolveStage:{"copy-source":`元の asset を収集中…`,"copy-packed-splat":`packed 3DGS を収集中…`},packageCompressStage:{"read-input":`入力データを読み込み中…`,"start-worker":`圧縮ワーカーを起動中…`,"retry-cpu-worker":`worker が停止したため CPU worker に切替…`,"load-transform":`SplatTransform を読み込み中…`,"decode-input":`3DGS を展開中…`,"merge-tables":`複数テーブルを結合中…`,"filter-bands":`SH バンドを調整中…`,"write-sog":`SOG を書き出し中…`,finalize:`出力を確定中…`},packageFieldCompressSplats:`3DGS を SOG 圧縮で保存`,packageFieldCompressSplatsDisabled:`3DGS を SOG 圧縮で保存 (WebGPU 必須)`,packageFieldCompressSplatsWorkerUnavailable:`3DGS を SOG 圧縮で保存 (この環境では利用不可)`,packageFieldSogShBands:`SOG の SH バンド`,packageFieldSogIterations:`SOG 圧縮 iterations`,packageSogShBands:{0:`0 bands`,1:`1 band`,2:`2 bands`,3:`3 bands`},packageSogIterations:{4:`4 iterations`,8:`8 iterations`,10:`10 iterations`,12:`12 iterations`,16:`16 iterations`},packageFieldSaveMode:`保存モード`,packageSaveMode:{fast:`Fast — 作業中の高速保存`,fastHint:`保存は速いですが、次回開いた直後の読み込みや表示が重くなりやすいです。作業途中のこまめな保存向けです。`,quality:`Quality — 推奨：快適に開ける保存`,qualityHint:`保存に少し時間がかかりますが、次回開いた直後から軽く表示できます。作業終了時や共有用の保存におすすめです。`,qualityHintPreserve:`既存の最適化データを再利用し、必要な部分だけ更新します。作業終了時や共有用の保存におすすめです。`,qualityHintUpgrade:`保存に少し時間をかけて、次回開いた直後から軽く表示できる状態にします。`},packageAdvancedOptions:`詳細オプション`,packageQualityOptions:`Quality 詳細オプション`,packageFieldSogCompress:`未編集 3DGS を SOG 圧縮でさらに小さく保存`,packageFieldSogCompressDisabled:`未編集 3DGS を SOG 圧縮（この環境/シーンでは利用不可）`,packageFieldPreserveSplatFullData:`元の 3DGS データも .ssproj 内に保存する（ファイルサイズ増）`,packageBakeLodStage:{start:`LoD を事前計算中…`,asset:`{name} の LoD を計算中（{index}/{total}）…`,finalize:`LoD データを確定中…`},packagePhaseBakeLod:`LoD を事前計算`,packageDetailBakeLod:`{name} の LoD を計算中（{index}/{total}）…`,packageDetailBuildRad:`{name} の RAD bundle を生成中（{index}/{total}）…`,packageDetailBuildRadStage:`{name} の RAD bundle を生成中（{index}/{total}）: {stage}`,packageDetailBuildRadFailed:`{name} の RAD bundle 生成に失敗しました。FullData 保存に戻して継続します: {message}`,packageRadBuildStage:{"load-wasm":`RAD encoder を読み込み中…`,"build-lod":`Quality LoD を生成中…`,"encode-prebaked-lod":`LoD encode 中…`,"encode-generated-lod":`生成済み LoD を encode 中…`,"encode-root":`PackedSplats encode 中…`,"write-chunks":`chunked RAD を書き出し中…`}},exportSummary:{empty:`現在の Camera 設定で書き出します。`,refreshed:`プレビューを {width} × {height} で更新しました。`,exported:`PNG を {width} × {height} で書き出しました。`,exportedBatch:`PNG を {count} 件書き出しました。`,psdExported:`PSD を {count} 件書き出しました。`,exportedMixed:`{count} 件を書き出しました。`,sequenceExported:`静止画連番 {count} ファイルを ZIP に書き出しました。`,videoExported:`動画を書き出しました（{count} Camera / {frames} フレーム）。`,cancelled:`書き出しをキャンセルしました。`},status:{ready:`準備完了。`,projectSaving:`プロジェクトを保存中...`,projectSavingToFolder:`{name} にプロジェクトを保存中...`,projectLoaded:`プロジェクトを読み込みました。`,projectLoadedFromFolder:`{name} からプロジェクトを読み込みました。`,projectSourceStagingUnavailable:`クラウドストレージ上のファイルを直接開いている可能性があります。失敗した場合は端末に保存してから開いてください。`,projectSaved:`プロジェクトを保存しました。`,projectSavedToFolder:`{name} にプロジェクトを保存しました。`,workingStateSaved:`{name} を保存しました。`,workingStateRestored:`{name} の作業状態を復元しました。`,packageSaved:`{name} を書き出しました。`,autoLodReady:`{name} の描画を LoD 最適化しました。`,autoLodFailed:`{name} の LoD 最適化に失敗しました。通常描画のまま動作を続けます。`,newProjectReady:`新規プロジェクトを開始しました。`,projectExporting:`プロジェクトを書き出し中...`,projectExported:`プロジェクトを書き出しました。`,viewportEnabled:`ビューポートに切り替えました。`,cameraEnabled:`カメラビューに切り替えました。`,loadingItems:`{count} 件を読み込み中...`,loadedItems:`{count} 件を読み込みました。`,expandingProjectPackage:`{name} から 3D asset を展開中...`,expandedProjectPackage:`{name} から {count} 件の 3D asset を展開しました。`,enterUrl:`http(s) URL を 1 つ以上入力してください。`,copiedViewportToShot:`ビューポート の姿勢を ショットカメラ にコピーしました。`,copiedShotToViewport:`ショットカメラ の姿勢を ビューポート にコピーしました。`,resetViewport:`ビューポートをリセットしました。`,resetCamera:`ショットカメラ をリセットしました。`,sceneCleared:`シーンをクリアしました。`,exportPreviewUpdated:`出力プレビューを更新しました。`,pngExported:`PNG を書き出しました。`,pngExportedBatch:`PNG を {count} 件書き出しました。`,psdExported:`PSD を {count} 件書き出しました。`,exportedMixed:`{count} 件を書き出しました。`,sequenceExported:`{format} 連番 {count} ファイルを ZIP に書き出しました。`,sequenceExportedMixed:`PNG / PSD 連番 {count} ファイルを ZIP に書き出しました。`,videoExported:`WebM 動画を {count} 件書き出しました（各 {frames} フレーム）。`,navigationActive:`FPV ナビゲーション有効。WASD/RF で移動、ドラッグで視線、右ドラッグでスライド。基本速度 {speed} m/s。`,zoomToolEnabled:`ズームツール有効。カメラビュー上でドラッグして拡縮、Z か Esc で解除。`,viewportZoomToolEnabled:`ビューポート画角調整。ドラッグでフルサイズ焦点距離を変更、Z か Esc で解除。`,measurementEnabled:`測定ツール active。クリックで始点と終点を置き、M でもう一度押すと解除します。`,measurementDisabled:`測定ツールを終了しました。`,measurementScaleApplied:`測定値に合わせて選択中オブジェクトへ {scale}x のスケールを適用しました。`,splatEditEnabled:`3DGS 編集モードを有効にしました。{count} 件の 3DGS を編集対象にします。`,splatEditDisabled:`3DGS 編集モードを終了しました。`,splatEditRequiresScope:`先に Scene で 3DGS を選択してください。`,splatEditScopeSummary:`対象 {scope} 件の 3DGS / 選択 {selected} 個のスプラット`,splatEditToolBox:`直方体`,splatEditToolBrush:`ブラシ`,splatEditToolTransform:`変形`,splatEditPlaceBoxHint:`ビューをクリックして直方体を配置`,splatEditBrushHint:`ドラッグで追加。Alt+ドラッグで除外。Ctrl+ドラッグで視点回転。`,splatEditBrushMode:`深さモード`,splatEditBrushModeThrough:`貫通`,splatEditBrushModeDepth:`奥行き`,splatEditBrushDepth:`奥行き`,splatEditCenter:`中心`,splatEditSize:`サイズ`,splatEditScaleDown:`-10%`,splatEditScaleUp:`+10%`,splatEditFitScope:`対象に合わせる`,splatEditAdd:`追加`,splatEditSubtract:`除外`,splatEditDelete:`削除`,splatEditSeparate:`分離`,splatEditDuplicate:`複製`,splatEditSelectAll:`全選択`,splatEditInvert:`反転`,splatEditLodStale:`LoD 最適化`,splatEditLodReady:`LoD 最適化済み`,splatEditLodRunning:`LoD 最適化中…`,splatEditLodTooltip:`描画用の LoD を再構築します。スプラット編集すると自動で無効になるため、適宜押して軽く保ちます。`,splatEditTransformMove:`移動`,splatEditTransformRotate:`回転`,splatEditTransformScale:`均等スケール`,splatEditTransformHint:`ギズモで移動・回転・均等スケールを操作します。`,splatEditLastOperation:`直近: {mode} / {count} 個のスプラット`,splatEditSelectionAdded:`{count} 個のスプラットを選択範囲に追加しました。`,splatEditSelectionRemoved:`{count} 個のスプラットを選択範囲から外しました。`,splatEditBrushHitMissing:`ブラシの当たり位置を取得できませんでした。`,splatEditSelectionMissing:`先に 3DGS のスプラットを選択してください。`,splatEditDeleted:`{count} 個のスプラットを削除しました。`,splatEditSeparated:`{count} 個のスプラットを {assets} 件の 3DGS に分離しました。`,splatEditDuplicated:`{count} 個のスプラットを {assets} 件の 3DGS に複製しました。`,splatEditSelectAllDone:`{count} 個のスプラットを全選択しました。`,splatEditInverted:`選択を反転しました（{count} 個のスプラット）。`,splatEditTransformedMove:`{count} 個のスプラットを移動しました。`,splatEditTransformedRotate:`{count} 個のスプラットを回転しました。`,splatEditTransformedScale:`{count} 個のスプラットを均等スケールしました。`,zoomToolUnavailable:`ズームツールはここでは使えません。`,lensToolEnabled:`焦点距離調整。ドラッグで 35mm横幅換算を変更、Esc で解除。`,rollToolEnabled:`カメラロール調整。左右ドラッグで構図を回し、Esc で解除。`,rollToolUnavailable:`カメラロールは Camera View でのみ使えます。`,localeChanged:`表示言語を {language} に切り替えました。`,assetScaleUpdated:`{name} のワールドスケールを {scale} にしました。`,assetTransformUpdated:`{name} のトランスフォームを更新しました。`,assetTransformApplied:`{name} の変形を適用しました。`,assetVisibilityUpdated:`{name} を {visibility} にしました。`,duplicatedSceneAsset:`{name} を複製しました。`,duplicatedSceneAssets:`{count} 件のオブジェクトを複製しました。`,deletedSceneAsset:`{name} を削除しました。`,deletedSceneAssets:`{count} 件のオブジェクトを削除しました。`,assetOrderUpdated:`{name} の順序を {index} にしました。`,selectedShotCamera:`ショットカメラ を {name} に切り替えました。`,createdShotCamera:`Camera {name} を追加しました。`,duplicatedShotCamera:`Camera {name} を複製しました。`,deletedShotCamera:`Camera {name} を削除しました。`,selectedFrame:`{name} を選択しました。`,createdFrame:`{name} を追加しました。`,duplicatedFrame:`{name} を複製しました。`,duplicatedFrames:`{count} 個の FRAME を複製しました。`,deletedFrame:`{name} を削除しました。`,deletedFrames:`{count} 個の FRAME を削除しました。`,shotCameraClipMode:`Camera のクリップ範囲を {mode} にしました。`,shotCameraExportFormat:`Camera の書き出し形式を {format} にしました。`,frameLimitReached:`FRAME は最大 {limit} 枚までです。`,exportTargetChanged:`書き出し対象を {target} にしました。`,exportModeChanged:`出力タイプを {mode} にしました。`,exportFrameSourceChanged:`フレーム範囲を {source} にしました。`,exportCancelRequested:`書き出しをキャンセルしています...`,exportCancelled:`書き出しをキャンセルしました。`,exportPresetSelection:`選択書き出しの ショットカメラ を {count} 件にしました。`},backgroundTask:{autoLodRunningSingle:`LoD 最適化中… ({name})`,autoLodRunningMulti:`LoD 最適化中… {current}/{total}`,autoLodDone:`LoD 最適化完了`,autoLodFailed:`LoD 最適化に失敗`},scene:{badgeEmpty:`空`,summaryEmpty:"`.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.fbx`, `.ssproj` をドロップまたは読み込みできます。",scaleDefault:`シーン契約: 1 unit = 1 meter。モデルは meters 前提、3DGS は raw 1x で読み込みます。`,loaded:`{count} 件を読込: {badge}。`,bounds:`境界 {x} × {y} × {z} m。`,worldContract:`ワールド契約 1u = 1m。`,glbMeter:`GLB / glTF / FBX は meter-native として扱います。`,splatRaw:`3DGS は raw 1x で入るため、校正までは暫定スケールです。`,splatCount:`3DGS {count}件`,modelCount:`モデル {count}件`,scaleAdjusted:`校正済みスケール {count}件。`},assetKind:{splat:`3DGS`,model:`GLB / FBX / モデル`},assetVisibility:{visible:`表示`,hidden:`非表示`},unitMode:{raw:`raw 1x`,meters:`meters`},shotCamera:{defaultName:`Camera {index}`},frame:{defaultName:`FRAME {index}`},cameraSummary:{view:`ビュー`,shot:`カメラ`,pos:`位置`,fwd:`前方`,clip:`clip`,nearFar:`near/far`,base:`基準`,frame:`フレーム`,nav:`移動`},outputFrame:{meta:`{size} · {anchor}`},anchor:{"top-left":`左上`,"top-center":`上中央`,"top-right":`右上`,"middle-left":`左中央`,center:`中央`,"middle-right":`右中央`,"bottom-left":`左下`,"bottom-center":`下中央`,"bottom-right":`右下`},error:{exportRequiresAsset:`出力プレビューの前に 3DGS かモデルを読み込んでください。`,exportRequiresPreset:`書き出し対象の ショットカメラ を 1 つ以上選択してください。`,exportRequiresAnimationFrames:`書き出せるアニメーションフレームがありません。全デュレーションを選ぶか、キーを追加してください。`,videoExportUnsupported:`このブラウザでは WebM 動画書き出しを利用できません。`,projectPackageSaveUnsupported:`この環境ではパッケージ保存ダイアログを利用できません。`,projectPackageSaveUnavailable:`パッケージの保存先を取得できませんでした。`,sogCompressionRequiresWebGpu:`この環境では WebGPU が使えないため、SOG 圧縮保存は利用できません。`,sogCompressionWorkerUnavailable:`SOG 圧縮 worker を開始できませんでした。SOG 圧縮をオフにして再度保存してください。`,projectSourceStagingRequired:`この端末では、クラウドストレージ由来の可能性がある大きな .ssproj を直接開けませんでした。端末にファイルを保存してから開き直してください。`,projectPackageOverwriteUnavailable:`上書き保存できるパッケージファイルがありません。`,previewContext:`プレビュー用の 2D context を取得できませんでした。`,unsupportedFileType:`未対応のファイル形式です: {name}`,emptyProjectPackage:`{name} に読み込める 3D asset がありません。`,emptyGltf:`GLTF scene が空です。`,emptyFbx:`FBX scene が空です。`,fbxLoaderUnavailable:`この build では FBX loader を利用できません。`,missingRoot:`CAMERA_FRAMES の root 要素が見つかりませんでした。`},referenceImage:{activePreset:`現在のプリセット`,activePresetItems:`{count} 件`,blankPreset:`(blank)`,untitled:`名称未設定`,sizeUnknown:`サイズ不明`,currentPresetSection:`現在のプリセット`,selectedSection:`選択中`,selectedEmpty:`選択中の下絵がありません。`,currentCameraEmpty:`このプリセットにはまだ 下絵アイテム がありません。下絵を読み込んでください。`,currentCameraUsage:`この ショットカメラ に {count} 件`,orderLabel:`#{order}`,group:{back:`背面`,front:`前面`},groupShort:{back:`背`,front:`前`}},localeName:{ja:`日本語`,en:`English`},mobileUiScale:{title:`UI 倍率（モバイル）`,tooltip:`モバイル表示時の UI 倍率を調整します。設定は自動的に保存されます。`,description:`モバイル UI のボタン・テキスト・メニューをまとめて拡大縮小します。画面下部のボタンも動きます。`,currentLabel:`現在値`,sliderLabel:`UI 倍率`,autoRecommendation:`端末に合わせた推奨: {value}`,resetToAuto:`推奨値に戻す`,autoActiveBadge:`自動`,previewLabel:`プレビュー`,previewCopy:`スライダーを動かすと、ここと画面下部のボタンが一緒にサイズを変えます。押しやすい大きさに合わせてください。`,previewPrimaryButton:`主ボタン`,previewSecondaryButton:`副ボタン`,previewFieldLabel:`入力欄`,previewFieldValue:`入力サンプル`},viewportLodScale:{label:`プレビュー品質`,ariaLabel:`3DGS プレビュー品質`,tooltipTitle:`プレビュー品質`,tooltipDescription:`3DGS が重いときにビューポート表示の軽さと細部の見やすさを調整します。下げると操作が軽くなり、上げると細かな形を確認しやすくなります。`}},en:{app:{previewTag:`Spark 2.1`,panelCopy:`CAMERA_FRAMES workflow built on Spark 2.1.`},field:{language:`Language`,remoteUrl:`Remote URL`,activeShotCamera:`Camera`,shotCameraName:`Camera Name`,shotCameraFov:`Standard FRAME H-FOV`,shotCameraEquivalentMm:`Full-Frame Focal Length`,shotCameraLensShift:`Lens Shift (%)`,viewportFov:`Viewport H-FOV`,viewportEquivalentMm:`Viewport Full-Frame Focal Length`,shotCameraClipMode:`Clip Range`,shotCameraNear:`Near`,shotCameraFar:`Far`,shotCameraYaw:`Yaw`,shotCameraPitch:`Pitch`,shotCameraRoll:`Roll`,shotCameraRollLock:`Lock Roll`,shotCameraMoveHorizontal:`Left / Right`,shotCameraMoveVertical:`Down / Up`,shotCameraMoveDepth:`Back / Forward`,shotCameraExportName:`Export Name`,exportFormat:`Export Format`,exportGridOverlay:`Include Guides`,exportReferenceImages:`Include Reference Images`,exportGridLayerMode:`Grid Layering`,exportModelLayers:`Layer Models`,exportSplatLayers:`Layer 3DGS Objects`,outputFrameWidth:`Paper Width`,outputFrameHeight:`Paper Height`,cameraViewZoom:`View Zoom`,compositionGuide:`Composition Guide`,compositionGuideScope:`Target`,compositionGuidePattern:`Pattern`,anchor:`Anchor`,assetScale:`Scale`,assetPosition:`Position`,assetRotation:`Rotation`,transformSpace:`Coordinate Space`,transformMode:`Tool`,activeFrame:`FRAME`,frameMaskOpacity:`Mask Opacity`,frameMaskShape:`Mask Shape`,frameTrajectoryMode:`Trajectory`,frameTrajectoryNodeMode:`Trajectory Node`,frameTrajectoryExportSource:`FRAME Trajectory Output`,exportTarget:`Export Target`,exportMode:`Output Type`,exportFrameSource:`Frame Range`,exportPresetSelection:`Selected Cameras`,referenceImageOpacity:`Opacity`,referenceImageScale:`Scale`,referencePresetName:`Preset Name`,referenceImageOffsetX:`Offset X`,referenceImageOffsetY:`Offset Y`,referenceImageRotation:`Rotation`,referenceImageOrder:`Order`,referenceImageGroup:`Layer Side`,measurementLength:`Measured Length`,lightIntensity:`Light Intensity`,lightAmbient:`Ambient`,lightDirection:`Light Direction`,lightAzimuth:`Azimuth`,lightElevation:`Elevation`,positionX:`X`,positionY:`Y`,positionZ:`Z`},section:{file:`File`,view:`Viewport FOV`,displayZoom:`Display Zoom`,scene:`Scene`,sceneManager:`Scene Manager`,selectedSceneObject:`Object Properties`,lighting:`Lighting`,tools:`Tools`,project:`Project`,shotCamera:`Camera`,shotCameraManager:`Cameras`,shotCameraProperties:`Camera Properties`,transformSpace:`Coordinate Space`,pose:`Pose`,referenceImages:`Reference Images`,referencePresets:`Reference Presets`,referenceManager:`Reference Manager`,referenceProperties:`Reference Properties`,frames:`FRAME`,mask:`Mask`,outputFrame:`Paper Setup`,output:`Output`,export:`Export`,exportSettings:`Export Settings`},menu:{newProjectAction:`New Project`,saveWorkingStateAction:`Save Project`,savePackageAction:`Export Project`},project:{untitled:`Untitled`,dirtyHint:`There are unsaved working-state changes`,packageHint:`Save a .ssproj package before sharing or moving this project`},mode:{viewport:`Viewport`,camera:`Camera View`},transformSpace:{world:`World`,local:`Local`},transformMode:{none:`None`,select:`Select`,reference:`Reference`,transform:`Transform`,pivot:`Object Origin`},selection:{multipleSceneAssetsTitle:`{count} selected 3D objects`,multipleReferenceImagesTitle:`{count} selected references`},viewportTool:{moveCenter:`Move`},exportTarget:{current:`Current Camera`,all:`All Cameras`,selected:`Selected Cameras`},exportFormat:{png:`PNG`,psd:`PSD`,webm:`WebM`},exportMode:{current:`Current Frame`,sequence:`Image Sequence`,video:`Video`},exportFrameSource:{duration:`Full Duration`,keyframes:`Keyframes Only`},exportModeSummary:{current:`Still export writes the current frame {frame}.`,sequence:`{source}: {frames} frame(s) × {cameras} Camera(s) = {count} file(s) in a ZIP.`,video:`{frames} frame(s) × {cameras} Camera(s) exported as {fps} FPS WebM.`,noFrames:`There are no animation frames to export.`,videoUnsupported:`This browser cannot export WebM video. Use an image sequence instead.`},gridLayerMode:{bottom:`Bottom-most`,overlay:`Below Eye Level`},frameMaskShape:{bounds:`Bounds`,trajectory:`Trajectory Sweep`},frameTrajectoryMode:{line:`Line`,spline:`Spline`},frameTrajectoryNodeMode:{auto:`Auto`,corner:`Corner`,mirrored:`Mirrored`,free:`Free`},trajectorySource:{none:`None`,center:`Center`,topLeft:`Top Left`,topRight:`Top Right`,bottomRight:`Bottom Right`,bottomLeft:`Bottom Left`},compositionGuideScope:{selectedFrame:`Selected FRAME`,allFrames:`All FRAMEs`},compositionGuidePattern:{thirds:`Rule of Thirds`,golden:`Golden Ratio`,center:`Center Split`,grid:`Grid`},clipMode:{auto:`Auto`,manual:`Manual`},timeline:{title:`Timeline`,animation:`Animation`,enabled:`ON`,disabled:`OFF`,frame:`Frame`,fps:`FPS`,duration:`Duration`,tracks:`Tracks`,noKeys:`No keys`,autoKey:`Auto`,start:`Start`,play:`Play`,pause:`Pause`,end:`End`,previousKey:`Previous key`,nextKey:`Next key`,zoomIn:`Zoom in`,zoomOut:`Zoom out`,keyTarget:`Key Target`,keyTargetCamera:`Camera`,keyTargetSelectedObjects:`Objects`,keyTargetBoth:`Both`,keyTargetNoObjects:`No objects`,keyTargetObjects:`{count} Objects`,targetTypeCamera:`CAM`,targetTypeMesh:`MESH`,targetTypeSplat:`SPLAT`,addKey:`Add key`,copyKeys:`Copy selected keys`,pasteKeys:`Paste at current frame`,deleteKeys:`Delete selected keys`,currentFrameKeyed:`Keyed`,currentFrameNoKey:`No key`,interpolation:`Interpolation`,interpolationLinear:`Linear`,interpolationHold:`Hold`,keyScale:`Scale`,applyKeyScale:`Apply`,filterAll:`All`,filterKeyed:`Keyed`,filterFocus:`Focus`,filterAuto:`Auto`,filterSearch:`Search`,collapse:`Collapse`},action:{newProject:`New Project`,saveProject:`Save Project`,exportProject:`Export Project`,savePackageAs:`Save As`,overwritePackage:`Overwrite`,openFiles:`Open…`,resetFrameTrajectoryNodeAuto:`Reset Node to Auto`,openReferenceImages:`Open Reference Images`,duplicateReferencePreset:`Duplicate Preset`,deleteReferencePreset:`Delete Preset`,clear:`Clear`,loadUrl:`Load URL`,collapseWorkbench:`Minimize panel`,expandWorkbench:`Open panel`,cancel:`Cancel`,saveAndNewProject:`Save and New`,savePackageAndNewProject:`Save and New`,discardAndNewProject:`Don't Save`,saveAndOpenProject:`Save and Open`,savePackageAndOpenProject:`Save and Open`,discardAndOpenProject:`Don't Save`,close:`Close`,continueSave:`Save`,continueLoad:`Load`,showAsset:`Show`,hideAsset:`Hide`,showReferenceImages:`Show References`,hideReferenceImages:`Hide References`,showReferenceImage:`Show Reference`,hideReferenceImage:`Hide Reference`,showSelectedReferenceImages:`Show Selected References`,hideSelectedReferenceImages:`Hide Selected References`,clearSelection:`Clear Selection`,undo:`Undo`,redo:`Redo`,duplicateSelectedSceneAssets:`Duplicate Selected Objects`,includeReferenceImageInExport:`Include in Export`,excludeReferenceImageFromExport:`Exclude from Export`,includeSelectedReferenceImagesInExport:`Include Selected References in Export`,excludeSelectedReferenceImagesFromExport:`Exclude Selected References from Export`,deleteSelectedReferenceImages:`Delete Selected References`,deleteSelectedSceneAssets:`Delete Selected Objects`,moveAssetUp:`Up`,moveAssetDown:`Down`,newShotCamera:`Add Camera`,duplicateShotCamera:`Duplicate`,deleteShotCamera:`Delete`,nudgeLeft:`← Left`,nudgeRight:`Right →`,nudgeUp:`↑ Up`,nudgeDown:`Down ↓`,nudgeForward:`Forward`,nudgeBack:`Back`,viewportToShot:`Copy Viewport Pose to Camera`,shotToViewport:`Copy Camera Pose to Viewport`,resetActive:`Reset Active View`,refreshPreview:`Refresh Preview`,downloadOutput:`Export`,downloadSequence:`Export Sequence`,downloadVideo:`Export Video`,downloadPng:`Download PNG`,downloadPsd:`Download PSD`,resetScale:`Reset 1x`,applyAssetTransform:`Apply Transform`,resetPivot:`Reset Pivot`,resetLightDirection:`Reset Direction`,adjustLens:`Adjust Lens`,adjustRoll:`Camera Roll`,zoomTool:`Zoom`,moveToolbar:`Move Toolbar`,splatEditTool:`3DGS Edit`,splatEditOptimizeLod:`Optimize LoD`,quickMenu:`Quick Menu`,pinQuickSection:`Add To Rail`,unpinQuickSection:`Remove From Rail`,measureTool:`Measure Tool`,apply:`Apply`,frameTool:`Frame Tool`,measurementStartPoint:`Measurement start point`,measurementEndPoint:`Measurement end point`,measurementAxis:{x:`Extend along X`,y:`Extend along Y`,z:`Extend along Z`},newFrame:`Add FRAME`,duplicateFrame:`Duplicate`,deleteFrame:`Delete`,renameFrame:`Rename FRAME`,toggleSelectedFrameMask:`Selected Mask`,toggleAllFrameMask:`All Frames Mask`,toggleFrameTrajectoryEdit:`Edit Trajectory`,enableFrameMask:`Enable Mask`,disableFrameMask:`Disable Mask`,fitOutputFrameToSafeArea:`Fit View`},unit:{millimeter:`ミリメートル`,meter:`メートル`,percent:`パーセント`,pixel:`ピクセル`,degree:`度`},tooltip:{fileMenu:`Open, save, and package-level project commands live here.`,collapseWorkbench:`Minimize the right panel and bring it back only when needed.`,modeCamera:`Use the shot camera to frame the scene and align references.`,modeViewport:`Use the working camera to inspect and navigate the scene freely.`,toolSelect:`Select 3D objects. Press again to return to no active tool.`,toolReference:`Edit reference images. Toggle with Shift+R. R temporarily shows or hides references. Press again to return to no active tool.`,toolSplatEdit:`Enter per-splat editing for the selected 3DGS assets. This is the entry point for Box and Brush tools. Toggle with Shift+E.`,toolTransform:`Transform 3D objects. Press again to return to no active tool.`,toolPivot:`Edit the transform origin of 3D objects. Press again to return to no active tool.`,toolZoom:`In Camera View it adjusts display zoom; in Viewport it adjusts viewport lens. Press again to return to navigation.`,measureTool:`Measure the distance between two points on screen and apply a matching uniform scale ratio to the selected objects.`,frameTool:`Add, duplicate, or delete FRAMEs, and control all-frame or selected-frame masking plus mask opacity.`,quickMenu:`Open the quick tool menu. On mobile, this is the safer way to use it.`,clearSelection:`Clear selected 3D objects, reference images, and FRAMEs, then return to no active tool.`,undo:`Undo the most recent change.`,redo:`Redo the most recently undone change.`,referencePreviewSessionVisible:`Temporarily show or hide reference previews without changing their saved visibility state. Toggle with R.`,tabScene:`Manage scene assets and lighting.`,tabCamera:`Edit the active shot camera and paper setup.`,tabReference:`Edit reference presets and reference image layers.`,tabExport:`Adjust export options and run output.`,copyViewportPoseToShot:`Copy the Viewport position, orientation, and lens into the Camera. The clip range stays unchanged.`,copyShotPoseToViewport:`Copy the Camera position and view direction into the Viewport. Roll, lens, and clip range stay unchanged.`,resetActiveView:`Return the current Camera or Viewport position and orientation to the home pose.`,frameMaskSelected:`Dim everything outside the bounding box of the selected FRAMEs. Press again to turn it off.`,frameMaskAll:`Dim everything outside the bounding box covering all FRAMEs. Press again to turn it off.`,frameMaskShapeField:`Choose whether the mask uses one combined bounding box or the swept area traced by the FRAME rectangles in order.`,frameTrajectoryModeField:`Choose whether the trajectory connecting FRAME centers uses straight segments or an editable spline.`,frameTrajectoryNodeModeField:`Choose how the selected spline node behaves. Auto derives handles, Corner makes a sharp turn, Mirrored links both handles, and Free edits them independently.`,frameTrajectoryExportSourceField:`Choose which reference point is written as the PSD trajectory layer inside the FRAME group: center or one of the four corners.`,toggleFrameTrajectoryEdit:`Show trajectory nodes and handles in the viewport for path editing while keeping normal FRAME transforms available.`,resetFrameTrajectoryNodeAuto:`Discard manual handles on the selected node and return it to automatic smoothing.`,openQuickSection:`Open only this section as a quick panel. Press again to close it.`,pinQuickSection:`Add this section to the right rail shortcuts.`,unpinQuickSection:`Remove this section from the right rail shortcuts.`,shotCameraEquivalentMmField:`Full-frame-equivalent focal length. Changing it updates the active shot camera lens angle.`,shotCameraLensShiftField:`Moves the projection center without rotating the camera. +X includes more of the right side, and +Y includes more of the upper side.`,outputFrameAnchorField:`Choose which point stays fixed when the paper size changes.`,compositionGuideField:`Preview-only composition guide shown in Camera View. It is not included in PNG or PSD exports.`,compositionGuideScopeField:`Choose whether the guide follows the selected or active FRAME, or the bounds covering every FRAME.`,compositionGuidePatternField:`Switch between thirds, golden ratio, center split, or a grid for checking horizontal and vertical alignment.`,shotCameraExportName:`Template for the exported filename. %cam is replaced with the current camera name.`,exportFormatField:`Choose the export format for this camera. PNG is flattened; PSD keeps layers.`,exportGridOverlayField:`Include Infinite Grid and Eye Level in the export.`,exportGridLayerModeField:`Choose whether guide overlays render below or above the beauty image.`,exportModelLayersField:`Write models as separate PSD layers.`,exportSplatLayersField:`Write 3DGS objects as separate PSD layers. Model layers must also be enabled.`,exportTargetField:`Export only the current camera, every camera, or a selected subset.`,exportPresetSelectionField:`Choose which cameras are included when Export Target is set to Selected.`,exportReferenceImagesField:`Temporarily include or exclude reference images from this export run.`,downloadOutput:`Export PNG or PSD files using the current target and per-camera export settings.`},hint:{viewMode:`Camera View shows the Camera and Output Frame. Viewport uses a free working camera for scene editing.`,shotCameraList:`Cameras are stored as document objects. New cameras start from the current view pose; duplicate copies the active camera settings.`,shotCameraClip:`Auto keeps the per-Camera near clip and derives far from scene bounds. Manual stores both near and far per Camera.`,shotCameraExport:`Export format, guide layering, and PSD layer settings are stored per Camera. 3DGS object layers in PSD require model layered export to be enabled.`,outputFrame:`Camera View uses off-axis projection so framing inside the Output Frame matches final output.`,sceneCalibration:`3DGS assets enter at raw 1x, so adjust world scale when needed. Models can also be tuned per asset when necessary.`,sceneOrder:`List order becomes the PSD object-layer order. Visibility affects both viewport and export.`,lightDirection:`Drag the handle on the sphere to rotate the light direction relative to the camera you are currently viewing.`,frames:`FRAME is treated as a 2D overlay in Camera View. This slice supports direct move, resize, rotate, and anchor editing.`,framesEmpty:`No FRAME yet. Add the first FRAME to start laying out the shot.`,exportTargetSelection:`Selected export currently includes {count} Camera preset(s).`,referenceImagesEmpty:`No reference images yet. Load PNG, JPG, WEBP, or PSD files to begin.`},drop:{title:`Drop files here`,body:`Load 3D data (PLY / SPZ / SOG / SPLAT / GLB / FBX and more), project packages (.ssproj), or reference images (PNG / JPG / WEBP / PSD).`,controlsTitle:`Camera Controls`,controlOrbit:`Left drag: look around`,controlPan:`Right drag: slide left / right / up / down`,controlDolly:`Wheel: move forward / back`,controlAnchorOrbit:`Ctrl + left drag: orbit around the pointed spot`},badge:{horizontalFov:`H-FOV`,clipRange:`clip`},export:{idle:`Idle`,rendering:`Rendering`,ready:`Ready`,exporting:`Exporting`},overlay:{newProjectTitle:`New Project`,newProjectMessage:`You have unsaved changes. Save the working state before starting a new project?`,newProjectMessageWithPackage:`You have unsaved changes. Save before starting a new project?`,openProjectTitle:`Open Another Project`,openProjectMessage:`You have unsaved changes. Save the working state before opening another project?`,openProjectMessageWithPackage:`You have unsaved changes. Save before opening another project?`,workingSaveNoticeTitle:`Save Project`,workingSaveNoticeMessage:`Ctrl+S saves the project's working state in this browser. Use “Export Project” when you need a portable .ssproj file for sharing or moving to another environment.`,startupImportTitle:`Load shared data?`,startupImportMessage:`This link will load external shared data. Continuing will access the URLs below.`,importTitle:`Loading 3D data`,importMessage:`Loading is in progress. Please wait until the scene finishes updating.`,importPhaseVerify:`Checking sources`,importPhaseExpand:`Expanding packages`,importPhaseLoad:`Loading 3D assets`,importPhaseApply:`Applying scene state`,importDetailOpenProjectArchive:`Opening project package…`,importDetailInspectProjectArchive:`Inspecting project package…`,importDetailPrepareLocalProjectSource:`Preparing local working copy…`,importDetailCopyLocalProjectSource:`Reading into a local working copy…`,importDetailCopyLocalProjectSourceProgress:`Preparing local working copy… {copied} / {total} ({percent}%)`,importDetailCompleteLocalProjectSource:`Local working copy is ready.`,importDetailWarnLocalProjectSource:`Opening cloud storage files directly can be unstable. If loading fails, save the file to this device and open it again.`,importDetailFailLocalProjectSource:`Could not create a local working copy. Save the file to this device and open it again.`,importDetailReadProjectManifest:`Reading manifest… ({file})`,importDetailReadProjectDocument:`Reading project document… ({file})`,importDetailScanProjectAssets:`Checking project assets to expand… ({count})`,importDetailExpandProjectAsset:`Expanding project asset {index}/{count}: {name}`,importDetailExpandProjectAssetWithFile:`Expanding project asset {index}/{count}: {name} ({file})`,importDetailExtractProjectAssetData:`Expanding project asset data {index}/{count}: {stage} ({fileCount} file(s))`,importDetailExpandProjectAssetComplete:`Finished project asset {index}/{count}`,importDetailExtractReferenceImage:`Expanding reference image {index}/{count}: {name}`,importDetailExpandComplete:`Package expansion complete.`,importProjectAssetExtractStage:{file:`embedded file`,packedSplat:`3DGS manifest / companion files`,rawSplat:`raw 3DGS arrays / LoD arrays`},importDetailExpandPackage:`Package {index}/{count}: {name}`,importDetailLoadAsset:`Asset {index}/{count}: {name}`,importDetailLoadAssetStage:`Asset {index}/{count}: {name} - {stage}`,importTimingStage:`stage`,importTimingTotal:`total`,importLoadStage:{materialize:`Expanding package resource`,readBytes:`Reading file bytes`,decodeSource:`Converting 3DGS data`,prepareRawPackedSplat:`Preparing raw 3DGS arrays / LoD arrays`,initLod:`Initializing baked LoD`,initPackedSplats:`Initializing Spark PackedSplats`,buildBounds:`Computing bounds`,initSplatMesh:`Preparing GPU mesh`,registerScene:`Registering scene asset`,loadModel:`Loading 3D model`},importDetailApply:`Applying Camera / FRAME / scene state`,blockedStartupTitle:`Shared link cannot be loaded`,blockedStartupMessage:`This link could not be opened directly from the app.`,blockedStartupReasonHttps:`Blocked because the URL is not HTTPS`,blockedStartupReasonPrivate:`Blocked because the URL points to a private address or localhost`,blockedStartupReasonInvalid:`Blocked because the value is not a valid URL`,importErrorTitle:`Failed to load data`,importErrorMessageGeneric:`This data could not be loaded.`,importErrorMessageRemote:`This link could not be opened directly from the app.`,errorDetails:`Details`,packageSaveTitle:`Export Project`,packageSaveMessage:`Save this project as a portable .ssproj file.`,packageSaveMessageWithOverwrite:`Save this project as a portable .ssproj file.`,exportTitle:`Exporting`,exportMessage:`Please wait until export finishes. Other interactions are temporarily disabled.`,exportDetailSingle:`Exporting {camera} as {format}…`,exportDetailBatch:`Exporting {index}/{count} {camera} as {format}…`,exportDetailFrameBatch:`Exporting {index}/{count}: {camera}, frame {frame}, as {format}…`,exportProgressFrame:`Frame {frame}`,exportPhasePrepare:`Preparing`,exportPhaseBeauty:`Rendering`,exportPhaseGuides:`Guides`,exportPhaseMasks:`Masks`,exportPhasePsdBase:`PSD Base`,exportPhaseModelLayers:`Model Layers`,exportPhaseSplatLayers:`3DGS Layers`,exportPhaseReferenceImages:`Reference Images`,exportPhaseWrite:`Writing`,exportPhaseDetailPrepare:`Switching camera and export state…`,exportPhaseDetailBeauty:`Rendering the final beauty image…`,exportPhaseDetailGuides:`Preparing guide layers…`,exportPhaseDetailGuidesGrid:`Rendering Infinite Grid for export…`,exportPhaseDetailGuidesEyeLevel:`Rendering Eye Level for export…`,exportPhaseDetailMasks:`Building mask passes…`,exportPhaseDetailMaskBatch:`Building mask {index}/{count}: {name}…`,exportPhaseDetailPsdBase:`Preparing the PSD base image…`,exportPhaseDetailModelLayers:`Preparing model layer exports…`,exportPhaseDetailModelLayersBatch:`Building model layer {index}/{count}: {name}…`,exportPhaseDetailSplatLayers:`Preparing 3DGS layer exports…`,exportPhaseDetailSplatLayersBatch:`Building 3DGS layer {index}/{count}: {name}…`,exportPhaseDetailReferenceImages:`Compositing reference image layers…`,exportPhaseDetailReferenceImagesBatch:`Placing reference image {index}/{count}: {name}…`,exportPhaseDetailWritePng:`Writing PNG file…`,exportPhaseDetailWritePsd:`Writing PSD document…`,exportPhaseDetailWriteWebm:`Writing WebM video…`,exportErrorTitle:`Export failed`,exportErrorMessage:`An error occurred during export. Review the details and try again.`,packageSaveErrorTitle:`Project export failed`,packageSaveErrorMessage:`An error occurred while exporting the project. Check the details below.`,packagePhaseCollect:`Collecting state`,packagePhaseResolve:`Resolving assets`,packagePhaseCompress:`Compressing 3DGS`,packagePhaseWrite:`Writing package`,packageDetailCollect:`Collecting save data…`,packageDetailAsset:`Asset {index}/{total}: {name}`,packageDetailAssetWithFile:`Asset {index}/{total}: {name} ({file})`,packageDetailWrite:`Writing package file…`,packageWriteStage:{zipEntries:`Writing ZIP archive…`},packageResolveStage:{"copy-source":`Copying original asset data…`,"copy-packed-splat":`Collecting packed 3DGS data…`},packageCompressStage:{"read-input":`Reading source data…`,"start-worker":`Starting compression worker…`,"retry-cpu-worker":`Worker stalled, retrying on CPU worker…`,"load-transform":`Loading SplatTransform…`,"decode-input":`Decoding 3DGS data…`,"merge-tables":`Merging splat tables…`,"filter-bands":`Filtering SH bands…`,"write-sog":`Writing SOG output…`,finalize:`Finalizing output…`},packageFieldCompressSplats:`Compress 3DGS to SOG`,packageFieldCompressSplatsDisabled:`Compress 3DGS to SOG (WebGPU required)`,packageFieldCompressSplatsWorkerUnavailable:`Compress 3DGS to SOG (unavailable in this environment)`,packageFieldSogShBands:`SOG SH Bands`,packageFieldSogIterations:`SOG Compression Iterations`,packageSogShBands:{0:`0 bands`,1:`1 band`,2:`2 bands`,3:`3 bands`},packageSogIterations:{4:`4 iterations`,8:`8 iterations`,10:`10 iterations`,12:`12 iterations`,16:`16 iterations`},packageFieldSaveMode:`Save mode`,packageSaveMode:{fast:`Fast — quick working save`,fastHint:`Saves quickly, but the project can take longer to initialize and feel heavier right after the next open. Best for frequent in-progress saves.`,quality:`Quality — recommended optimized save`,qualityHint:`Takes a little longer to save, but opens into a lighter, faster display next time. Recommended for final or shared saves.`,qualityHintPreserve:`Reuses existing optimized data and updates only what is needed. Recommended for final or shared saves.`,qualityHintUpgrade:`Takes a little longer to prepare the project so it opens into a lighter, faster display next time.`},packageAdvancedOptions:`Advanced options`,packageQualityOptions:`Quality options`,packageFieldSogCompress:`Compress untouched 3DGS as SOG to shrink the file further`,packageFieldSogCompressDisabled:`Compress untouched 3DGS as SOG (unavailable in this environment/scene)`,packageFieldPreserveSplatFullData:`Keep original 3DGS data inside the .ssproj too (larger file)`,packageBakeLodStage:{start:`Baking LoD…`,asset:`Baking LoD for {name} ({index}/{total})…`,finalize:`Finalizing LoD data…`},packagePhaseBakeLod:`Baking LoD`,packageDetailBakeLod:`Baking LoD for {name} ({index}/{total})…`,packageDetailBuildRad:`Generating RAD bundle for {name} ({index}/{total})…`,packageDetailBuildRadStage:`Generating RAD bundle for {name} ({index}/{total}): {stage}`,packageDetailBuildRadFailed:`RAD bundle generation failed for {name}. Saving falls back to FullData: {message}`,packageRadBuildStage:{"load-wasm":`Loading RAD encoder…`,"build-lod":`Building Quality LoD…`,"encode-prebaked-lod":`Encoding LoD…`,"encode-generated-lod":`Encoding generated LoD…`,"encode-root":`Encoding PackedSplats…`,"write-chunks":`Writing chunked RAD…`}},exportSummary:{empty:`Exports use the current Camera settings.`,refreshed:`Preview refreshed at {width} × {height}.`,exported:`PNG exported at {width} × {height}.`,exportedBatch:`Exported {count} PNG file(s).`,psdExported:`Exported {count} PSD file(s).`,exportedMixed:`Exported {count} file(s).`,sequenceExported:`Exported {count} image sequence file(s) to a ZIP.`,videoExported:`Exported video for {count} Camera(s) with {frames} frame(s).`,cancelled:`Export cancelled.`},status:{ready:`Ready.`,projectSaving:`Saving project...`,projectSavingToFolder:`Saving project to {name}...`,projectLoaded:`Project loaded.`,projectLoadedFromFolder:`Loaded project from {name}.`,projectSourceStagingUnavailable:`This may be a cloud storage file opened directly. If loading fails, save it to this device and open it again.`,projectSaved:`Project saved.`,projectSavedToFolder:`Saved project to {name}.`,workingStateSaved:`Saved {name}.`,workingStateRestored:`Restored working state for {name}.`,referenceImagesImported:`Loaded {count} reference image file(s).`,packageSaved:`Exported {name}.`,autoLodReady:`Optimized rendering for {name} with LoD.`,autoLodFailed:`Could not build LoD for {name}. Continuing with raw rendering.`,newProjectReady:`Started a new project.`,projectExporting:`Exporting project...`,projectExported:`Project exported.`,viewportEnabled:`Switched to Viewport.`,cameraEnabled:`Switched to Camera View.`,loadingItems:`Loading {count} item(s)...`,loadedItems:`Loaded {count} item(s).`,expandingProjectPackage:`Extracting 3D assets from {name}...`,expandedProjectPackage:`Extracted {count} 3D asset(s) from {name}.`,enterUrl:`Enter at least one http(s) URL.`,copiedViewportToShot:`Copied the Viewport pose into the Camera.`,copiedShotToViewport:`Copied the Camera pose into the Viewport.`,resetViewport:`Viewport reset.`,resetCamera:`Camera reset.`,sceneCleared:`Scene cleared.`,exportPreviewUpdated:`Output preview updated.`,pngExported:`PNG exported.`,pngExportedBatch:`Exported {count} PNG file(s).`,psdExported:`Exported {count} PSD file(s).`,exportedMixed:`Exported {count} file(s).`,sequenceExported:`Exported {count} {format} sequence file(s) to a ZIP.`,sequenceExportedMixed:`Exported {count} PNG / PSD sequence file(s) to a ZIP.`,videoExported:`Exported {count} WebM video file(s), {frames} frame(s) each.`,navigationActive:`FPV navigation active. WASD/RF move, drag to look, right-drag to slide. Base speed {speed} m/s.`,zoomToolEnabled:`Zoom tool active. Drag in Camera View to zoom, press Z or Esc to exit.`,viewportZoomToolEnabled:`Viewport lens adjust active. Drag to change the full-frame focal length, press Z or Esc to exit.`,measurementEnabled:`Measurement tool active. Click to place start and end points, then press M again to exit.`,measurementDisabled:`Measurement tool disabled.`,measurementScaleApplied:`Applied a {scale}x scale ratio to the selected objects from the measurement.`,splatEditEnabled:`Enabled 3DGS edit mode. {count} selected 3DGS assets are now in scope.`,splatEditDisabled:`Exited 3DGS edit mode.`,splatEditRequiresScope:`Select at least one 3DGS asset in the Scene tab first.`,splatEditScopeSummary:`Scope {scope} asset / Selected {selected} splat`,splatEditToolBox:`Box`,splatEditToolBrush:`Brush`,splatEditToolTransform:`Transform`,splatEditPlaceBoxHint:`Click in the view to place the box`,splatEditBrushHint:`Drag to add. Hold Alt while dragging to subtract. Hold Ctrl while dragging to orbit.`,splatEditBrushMode:`Depth Mode`,splatEditBrushModeThrough:`Through`,splatEditBrushModeDepth:`Depth`,splatEditBrushDepth:`Depth`,splatEditCenter:`Center`,splatEditSize:`Size`,splatEditScaleDown:`-10%`,splatEditScaleUp:`+10%`,splatEditFitScope:`Fit Scope`,splatEditAdd:`Add`,splatEditSubtract:`Subtract`,splatEditDelete:`Delete`,splatEditSeparate:`Separate`,splatEditDuplicate:`Duplicate`,splatEditSelectAll:`Select All`,splatEditInvert:`Invert`,splatEditLodStale:`Optimize LoD`,splatEditLodReady:`LoD ready`,splatEditLodRunning:`Building LoD…`,splatEditLodTooltip:`Rebuild the rendering LoD. Splat edits invalidate it automatically, so press this to keep the scene lightweight.`,splatEditTransformMove:`Move`,splatEditTransformRotate:`Rotate`,splatEditTransformScale:`Uniform Scale`,splatEditTransformHint:`Use the gizmo to move, rotate, or scale the selected splats.`,splatEditLastOperation:`Last: {mode} / {count} hit`,splatEditSelectionAdded:`Added {count} splats to the selection.`,splatEditSelectionRemoved:`Removed {count} splats from the selection.`,splatEditBrushHitMissing:`Could not resolve a Brush hit point.`,splatEditSelectionMissing:`Select 3DGS splats first.`,splatEditDeleted:`Deleted {count} splats.`,splatEditSeparated:`Separated {count} splats into {assets} asset(s).`,splatEditDuplicated:`Duplicated {count} splats into {assets} asset(s).`,splatEditSelectAllDone:`Selected all {count} splats.`,splatEditInverted:`Inverted selection ({count} splats).`,splatEditTransformedMove:`Moved {count} splats.`,splatEditTransformedRotate:`Rotated {count} splats.`,splatEditTransformedScale:`Scaled {count} splats uniformly.`,zoomToolUnavailable:`The zoom tool is not available here.`,lensToolEnabled:`Lens adjust active. Drag to change the 35mm horizontal equivalent, press Esc to exit.`,rollToolEnabled:`Camera roll active. Drag left or right to rotate the shot, press Esc to exit.`,rollToolUnavailable:`Camera roll is only available in Camera View.`,localeChanged:`Display language switched to {language}.`,assetScaleUpdated:`Set {name} world scale to {scale}.`,assetTransformUpdated:`Updated {name} transform.`,assetTransformApplied:`Applied transform for {name}.`,assetVisibilityUpdated:`Set {name} to {visibility}.`,duplicatedSceneAsset:`Duplicated {name}.`,duplicatedSceneAssets:`Duplicated {count} objects.`,deletedSceneAsset:`Deleted {name}.`,deletedSceneAssets:`Deleted {count} objects.`,assetOrderUpdated:`Moved {name} to order {index}.`,selectedShotCamera:`Camera switched to {name}.`,createdShotCamera:`Added Camera {name}.`,duplicatedShotCamera:`Duplicated Camera {name}.`,deletedShotCamera:`Deleted Camera {name}.`,selectedFrame:`Selected {name}.`,createdFrame:`Added {name}.`,duplicatedFrame:`Duplicated {name}.`,duplicatedFrames:`Duplicated {count} FRAMEs.`,deletedFrame:`Deleted {name}.`,deletedFrames:`Deleted {count} FRAMEs.`,shotCameraClipMode:`Camera clip range set to {mode}.`,shotCameraExportFormat:`Camera export format set to {format}.`,frameLimitReached:`FRAME limit reached ({limit}).`,exportTargetChanged:`Export target set to {target}.`,exportModeChanged:`Output type set to {mode}.`,exportFrameSourceChanged:`Frame range set to {source}.`,exportCancelRequested:`Cancelling export...`,exportCancelled:`Export cancelled.`,exportPresetSelection:`Selected export now includes {count} Camera preset(s).`},backgroundTask:{autoLodRunningSingle:`Building LoD… ({name})`,autoLodRunningMulti:`Building LoD… {current}/{total}`,autoLodDone:`LoD ready`,autoLodFailed:`LoD build failed`},scene:{badgeEmpty:`Empty`,summaryEmpty:"Drop or load `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.fbx`, or `.ssproj` files.",scaleDefault:`Scene contract: 1 unit = 1 meter. Models default to meters; 3DGS enters at raw 1x.`,loaded:`Loaded {count} item(s): {badge}.`,bounds:`Bounds {x} × {y} × {z} m.`,worldContract:`World contract 1u = 1m.`,glbMeter:`GLB, glTF, and FBX assets are treated as meter-native.`,splatRaw:`3DGS assets enter at raw 1x, so scale stays provisional until calibrated.`,splatCount:`{count} splat{plural}`,modelCount:`{count} model{plural}`,scaleAdjusted:`{count} calibrated scale adjustment(s).`},assetKind:{splat:`3DGS`,model:`GLB / FBX / Model`},assetVisibility:{visible:`Visible`,hidden:`Hidden`},unitMode:{raw:`raw 1x`,meters:`meters`},shotCamera:{defaultName:`Camera {index}`},frame:{defaultName:`FRAME {index}`},cameraSummary:{view:`view`,shot:`shot`,pos:`pos`,fwd:`fwd`,clip:`clip`,nearFar:`near/far`,base:`base`,frame:`frame`,nav:`nav`},outputFrame:{meta:`{size} · {anchor}`},anchor:{"top-left":`Top Left`,"top-center":`Top Center`,"top-right":`Top Right`,"middle-left":`Middle Left`,center:`Center`,"middle-right":`Middle Right`,"bottom-left":`Bottom Left`,"bottom-center":`Bottom Center`,"bottom-right":`Bottom Right`},error:{exportRequiresAsset:`Load a splat or model before rendering output preview.`,exportRequiresPreset:`Select at least one Camera for export.`,exportRequiresAnimationFrames:`There are no animation frames to export. Use full duration or add keyframes.`,videoExportUnsupported:`This browser cannot export WebM video.`,projectPackageSaveUnsupported:`Package save dialogs are not supported in this environment.`,projectPackageSaveUnavailable:`Could not get a destination for package save.`,sogCompressionRequiresWebGpu:`SOG compression save requires WebGPU in this environment.`,sogCompressionWorkerUnavailable:`Could not start the SOG compression worker in this environment. Save again with SOG compression turned off.`,projectSourceStagingRequired:`This device could not open a large .ssproj that may come from cloud storage directly. Save the file to this device and open it again.`,projectPackageOverwriteUnavailable:`There is no project package available to overwrite.`,previewContext:`Could not get the 2D context for output preview.`,unsupportedFileType:`Unsupported file type: {name}`,emptyProjectPackage:`No supported 3D assets were found in {name}.`,emptyGltf:`GLTF scene is empty.`,emptyFbx:`FBX scene is empty.`,fbxLoaderUnavailable:`FBX loader is unavailable in this build.`,missingRoot:`CAMERA_FRAMES root element was not found.`},referenceImage:{activePreset:`Active Preset`,activePresetItems:`{count} item(s)`,blankPreset:`(blank)`,untitled:`Untitled`,sizeUnknown:`Unknown size`,currentPresetSection:`Current Preset`,selectedSection:`Selected`,selectedEmpty:`No reference image is selected.`,currentCameraEmpty:`There are no reference items in this preset yet. Load a reference image to begin.`,currentCameraUsage:`{count} item(s) on this Camera`,orderLabel:`#{order}`,group:{back:`Back`,front:`Front`},groupShort:{back:`B`,front:`F`}},localeName:{ja:`Japanese`,en:`English`},mobileUiScale:{title:`UI Scale (Mobile)`,tooltip:`Adjust the mobile UI scale. The value is saved automatically.`,description:`Scale buttons, text, and menus across the mobile UI together. The bottom bar follows the slider live.`,currentLabel:`Current`,sliderLabel:`UI Scale`,autoRecommendation:`Recommended for this device: {value}`,resetToAuto:`Reset to recommended`,autoActiveBadge:`Auto`,previewLabel:`Preview`,previewCopy:`Drag the slider — this panel and the bottom buttons resize together so you can pick a comfortable touch target.`,previewPrimaryButton:`Primary`,previewSecondaryButton:`Secondary`,previewFieldLabel:`Input`,previewFieldValue:`Sample input`},viewportLodScale:{label:`Preview quality`,ariaLabel:`3DGS preview quality`,tooltipTitle:`Preview quality`,tooltipDescription:`Use this when 3DGS scenes feel heavy in the viewport. Lower values make editing lighter; higher values make fine detail easier to inspect.`}}};function ty(e,t){return t.split(`.`).reduce((e,t)=>e?.[t],e)}function ny(e,t,n={}){let r=ey[e]??ey.ja,i=ey.ja,a=ty(r,t);return a??=ty(i,t),typeof a==`string`?a.replace(/\{(.*?)\}/g,(e,t)=>`${n[t]??`{${t}}`}`):t}function ry(e,t){return ny(e,`anchor.${t}`)}function iy(e){return[{value:`top-left`,label:ry(e,`top-left`)},{value:`top-center`,label:ry(e,`top-center`)},{value:`top-right`,label:ry(e,`top-right`)},{value:`middle-left`,label:ry(e,`middle-left`)},{value:`center`,label:ry(e,`center`)},{value:`middle-right`,label:ry(e,`middle-right`)},{value:`bottom-left`,label:ry(e,`bottom-left`)},{value:`bottom-center`,label:ry(e,`bottom-center`)},{value:`bottom-right`,label:ry(e,`bottom-right`)}]}var ay=`clip-main`,oy=`Timeline`,sy=`shot-camera`,cy=`scene-asset`,ly=`hold`,uy=`linear`,dy=`transform`,fy=`lens`,py=`assetPlayback`,my=`pose`,hy=`number`,gy=`string`,_y=`k`,vy=new Map(Object.entries({[sy]:[{path:`transform.position.x`,group:dy,channelPath:`position.x`,valueType:hy,implemented:!0},{path:`transform.position.y`,group:dy,channelPath:`position.y`,valueType:hy,implemented:!0},{path:`transform.position.z`,group:dy,channelPath:`position.z`,valueType:hy,implemented:!0},{path:`transform.rotation.yawDeg`,group:dy,channelPath:`rotation.yawDeg`,valueType:hy,implemented:!0},{path:`transform.rotation.pitchDeg`,group:dy,channelPath:`rotation.pitchDeg`,valueType:hy,implemented:!0},{path:`transform.rotation.rollDeg`,group:dy,channelPath:`rotation.rollDeg`,valueType:hy,implemented:!0},{path:`lens.baseFovX`,group:fy,channelPath:`baseFovX`,valueType:hy,implemented:!0},{path:`lens.shiftX`,group:fy,channelPath:`shiftX`,valueType:hy,implemented:!0},{path:`lens.shiftY`,group:fy,channelPath:`shiftY`,valueType:hy,implemented:!0}],[cy]:[{path:`transform.position.x`,group:dy,channelPath:`position.x`,valueType:hy,implemented:!0},{path:`transform.position.y`,group:dy,channelPath:`position.y`,valueType:hy,implemented:!0},{path:`transform.position.z`,group:dy,channelPath:`position.z`,valueType:hy,implemented:!0},{path:`transform.rotation.xDeg`,group:dy,channelPath:`rotation.xDeg`,valueType:hy,implemented:!0},{path:`transform.rotation.yDeg`,group:dy,channelPath:`rotation.yDeg`,valueType:hy,implemented:!0},{path:`transform.rotation.zDeg`,group:dy,channelPath:`rotation.zDeg`,valueType:hy,implemented:!0},{path:`transform.worldScale`,group:dy,channelPath:`worldScale`,valueType:hy,implemented:!0},{path:`assetPlayback.clipId`,group:py,channelPath:`clipId`,valueType:gy,implemented:!1},{path:`assetPlayback.clipTime`,group:py,channelPath:`clipTime`,valueType:hy,implemented:!1},{path:`assetPlayback.speed`,group:py,channelPath:`speed`,valueType:hy,implemented:!1},{path:`assetPlayback.weight`,group:py,channelPath:`weight`,valueType:hy,implemented:!1},{path:`pose.poseId`,group:my,channelPath:`poseId`,valueType:gy,implemented:!1},{path:`pose.weight`,group:my,channelPath:`weight`,valueType:hy,implemented:!1}]}).map(([e,t])=>[e,new Map(t.map(e=>[e.path,e]))])),yy=[`${sy}:`,`${cy}:`];function by(e){return typeof e==`object`&&!!e}function xy(e,t,n){return Math.min(n,Math.max(t,e))}function Sy(e,t){let n=Number(e);return Number.isFinite(n)?Math.round(n):t}function Cy(e,t){return String(e??``).trim()||t}function wy(e,t=uy){return e===`hold`||e===`linear`?e:t}function Ty(e){let t=Number(e);return Number.isFinite(t)?xy(t,1,120):24}function Ey(e){return Math.max(1,Sy(e,144))}function Dy(e){let t=e?.kind===`scene-asset`?cy:e?.kind===`shot-camera`?sy:null,n=String(e?.id??``).trim();return!t||!n?null:{kind:t,id:n}}function Oy(e){let t=String(e??``).trim();if(!t)return null;for(let e of yy)if(t.startsWith(e)&&t.length>e.length)return t;return null}function ky(e){let t=new Set;for(let n of Array.isArray(e)?e:[]){let e=Oy(n);e&&t.add(e)}return[...t]}function Ay(e,t=hy){if(!by(e)||!Number.isFinite(Number(e.frame))||t!==`number`)return null;let n=Number(e.value);if(!Number.isFinite(n))return null;let r=wy(e.interpolation,null),i={frame:Math.round(Number(e.frame)),value:n};return r&&(i.interpolation=r),i}function jy(e,t){if(!by(e))return null;let n=String(e.path??``).trim(),r=Vy(t,n);if(!r)return null;let i=new Map;for(let t of Array.isArray(e.keys)?e.keys:[]){let e=Ay(t,r.valueType);e&&i.set(e.frame,e)}let a=Array.from(i.values()).sort((e,t)=>e.frame-t.frame);return{path:n,valueType:r.valueType,interpolation:wy(e.interpolation),keys:a}}function My(e,t){if(!by(e))return null;let n=Dy(e.target);if(!n)return null;let r=(Array.isArray(e.tracks)?e.tracks:[]).map(e=>jy(e,n)).filter(Boolean);return{id:Cy(e.id,`binding-${t+1}`),target:n,labelCache:String(e.labelCache??``),tracks:r}}function Ny(e){return String(e??``).replace(/\s+/g,` `).trim()||`Timeline`}function Py(e,t){let n=t===0?ay:`clip-${t+1}`,r=Sy(e?.startFrame,1),i=Ey(e?.durationFrames),a=r+i-1,o=xy(Sy(e?.playbackStartFrame,r),r,a),s=xy(Sy(e?.playbackEndFrame,a),o,a),c=(Array.isArray(e?.bindings)?e.bindings:[]).map((e,t)=>My(e,t)).filter(Boolean);return{id:Cy(e?.id,n),name:Ny(e?.name),fps:Ty(e?.fps),startFrame:r,durationFrames:i,playbackStartFrame:o,playbackEndFrame:s,bindings:c}}function Fy(e){let t=new Set;return e.map((e,n)=>{let r=e.id;if(!t.has(r))return t.add(r),e;let i=r||`clip-${n+1}`,a=2;for(;t.has(`${i}-${a}`);)a+=1;return r=`${i}-${a}`,t.add(r),{...e,id:r}})}function Iy(){return{id:ay,name:oy,fps:24,startFrame:1,durationFrames:144,playbackStartFrame:1,playbackEndFrame:144,bindings:[]}}function Ly(){return{version:1,enabled:!0,autoKeyTargetKeys:[],activeClipId:ay,clips:[Iy()]}}function Ry(e=null){let t=Array.isArray(e?.clips)?e.clips:[],n=Fy((t.length>0?t:[Iy()]).map((e,t)=>Py(e,t))),r=typeof e?.activeClipId==`string`&&n.some(t=>t.id===e.activeClipId)?e.activeClipId:n[0].id;return{version:1,enabled:!0,autoKeyTargetKeys:ky(e?.autoKeyTargetKeys),activeClipId:r,clips:n}}function zy(e=null){let t=Ry(e);return t.clips.find(e=>e.id===t.activeClipId)??t.clips[0]??Iy()}function By(e,t){return!!Vy(e,t)}function Vy(e,t,{includeReserved:n=!1}={}){let r=e?.kind,i=String(t??``).trim(),a=vy.get(r)?.get(i);return!a||!n&&a.implemented!==!0?null:{...a}}function Hy(e){let t=String(e??``).trim();if(!t)return``;let n=t.indexOf(`.`);return n>0?t.slice(0,n):t}function Uy(e,t){return Vy(e,t,{includeReserved:!0})?.group??Hy(t)}function Wy({bindingId:e,channelGroup:t,path:n,frame:r}={}){let i=Math.round(Number(r));return[_y,encodeURIComponent(String(e??``)),encodeURIComponent(String(t||Hy(n))),encodeURIComponent(String(n??``)),String(Number.isFinite(i)?i:0)].join(`|`)}function Gy(e){let t=e.lastIndexOf(`:`);if(t<=0||t>=e.length-1)return null;let n=Number(e.slice(t+1));if(!Number.isFinite(n))return null;let r=e.slice(0,t),i=r.lastIndexOf(`:`);if(i<=0||i>=r.length-1)return null;let a=r.slice(i+1);return{bindingId:r.slice(0,i),channelGroup:Hy(a),path:a,frame:Math.round(n),legacy:!0}}function Ky(e){let t=String(e??``);if(!t.startsWith(`${_y}|`))return Gy(t);let n=t.split(`|`);if(n.length!==5)return null;let r=Number(n[4]);if(!Number.isFinite(r))return null;try{let e=decodeURIComponent(n[3]);return{bindingId:decodeURIComponent(n[1]),channelGroup:decodeURIComponent(n[2])||Hy(e),path:e,frame:Math.round(r),legacy:!1}}catch{return null}}function qy(e,t,n=0){let r=Array.isArray(e?.keys)?e.keys:[];if(r.length===0)return Number(n)||0;let i=Number(t);if(!Number.isFinite(i))return Number(n)||0;if(i<=r[0].frame)return r[0].value;let a=r[r.length-1];if(i>=a.frame)return a.value;for(let t=0;t<r.length-1;t+=1){let n=r[t],a=r[t+1];if(i<n.frame||i>a.frame)continue;if(wy(n.interpolation??e.interpolation)===`hold`||n.frame===a.frame)return n.value;let o=(i-n.frame)/(a.frame-n.frame);return n.value+(a.value-n.value)*o}return Number(n)||0}var Jy=`perspective`,Yy=`orthographic`,Xy=`posX`,Zy=`negX`,Qy=`posY`,$y=`negY`,eb=`posZ`,tb=`negZ`,nb=eb,rb=Object.freeze({x:0,y:1,z:0}),ib=`__cameraFramesViewportOrthoDistance`,ab=Object.freeze({[Xy]:Object.freeze({id:Xy,axis:`x`,sign:1,position:Object.freeze([1,0,0]),up:Object.freeze([0,1,0])}),[Zy]:Object.freeze({id:Zy,axis:`x`,sign:-1,position:Object.freeze([-1,0,0]),up:Object.freeze([0,1,0])}),[Qy]:Object.freeze({id:Qy,axis:`y`,sign:1,position:Object.freeze([0,1,0]),up:Object.freeze([0,0,1])}),[$y]:Object.freeze({id:$y,axis:`y`,sign:-1,position:Object.freeze([0,-1,0]),up:Object.freeze([0,0,1])}),[eb]:Object.freeze({id:eb,axis:`z`,sign:1,position:Object.freeze([0,0,1]),up:Object.freeze([0,1,0])}),[tb]:Object.freeze({id:tb,axis:`z`,sign:-1,position:Object.freeze([0,0,-1]),up:Object.freeze([0,1,0])})}),ob=Object.freeze({[Xy]:Zy,[Zy]:Xy,[Qy]:$y,[$y]:Qy,[eb]:tb,[tb]:eb});function sb(e=null){return{x:Number.isFinite(e?.x)?Number(e.x):rb.x,y:Number.isFinite(e?.y)?Number(e.y):rb.y,z:Number.isFinite(e?.z)?Number(e.z):rb.z}}function cb(e=null){return _b(e)}function lb(e){return e===`orthographic`?Yy:Jy}function ub(e){return ab[e]??ab.posZ}function db(e){return ub(e).axis}function fb(e){return ob[e]??`posZ`}function pb(e,t=1){return e===`x`?t<0?Zy:Xy:e===`y`?t<0?$y:Qy:e===`z`?t<0?tb:eb:nb}function mb(e){let t=db(e);return t===`x`?`zy`:t===`y`?`xz`:t===`z`?`xy`:null}function hb(e,t=new G){let n=ub(e);return t.set(n.position[0],n.position[1],n.position[2])}function gb(e,t=new G){let n=ub(e);return t.set(n.up[0],n.up[1],n.up[2])}function _b(e=null){let t=sb(e?.focus),n=Number.isFinite(e?.size)?Math.max(.05,Number(e.size)):3,r=Number.isFinite(e?.distance)?Math.max(.05,Number(e.distance)):6;return{viewId:ub(e?.viewId).id,size:n,distance:r,focus:t}}function vb({depth:e=6,verticalFovDegrees:t=50,minSize:n=.05}={}){let r=Math.max(Number(e)||0,1e-4),i=ai.clamp(Number(t)||0,.001,179.999),a=r*Math.tan(ai.degToRad(i*.5));return Math.max(Number(n)||.05,a)}function yb(e,{aspect:t=1,viewId:n=nb,size:r=3,distance:i=6,focus:a=rb}={}){if(!e?.isOrthographicCamera)return!1;let o=Math.max(Number(t)||1,1e-6),s=_b({viewId:n,size:r,distance:i,focus:a}),c=new G(s.focus.x,s.focus.y,s.focus.z),l=hb(s.viewId,new G).normalize(),u=gb(s.viewId,new G).normalize(),d=s.size,f=d*o;return e.position.copy(c).addScaledVector(l,s.distance),e.up.copy(u),e.left=-f,e.right=f,e.top=d,e.bottom=-d,e.zoom=1,e.userData=e.userData??{},e.userData[ib]=s.distance,e.lookAt(c),e.updateProjectionMatrix(),e.updateMatrixWorld(!0),!0}var bb=1.1,xb=36.87;function Sb(e,t,n,r){let i=Number(e);return Number.isFinite(i)?Math.min(n,Math.max(t,i)):r}function Cb(e,t=0){let n=Number(e);if(!Number.isFinite(n))return t;let r=((n+180)%360+360)%360-180;return r===-180&&(r=180),r}function wb(){return{ambient:bb,modelLight:{enabled:!0,intensity:2,azimuthDeg:xb,elevationDeg:45}}}function Tb(e=null){let t=Eb(e);return{ambient:t.ambient,modelLight:{enabled:t.modelLight.enabled,intensity:t.modelLight.intensity,azimuthDeg:t.modelLight.azimuthDeg,elevationDeg:t.modelLight.elevationDeg}}}function Eb(e=null){let t=wb(),n=e?.modelLight??{};return{ambient:Sb(e?.ambient,0,2.5,t.ambient),modelLight:{enabled:typeof n.enabled==`boolean`?n.enabled:t.modelLight.enabled,intensity:Sb(n.intensity,0,3,t.modelLight.intensity),azimuthDeg:Cb(n.azimuthDeg,t.modelLight.azimuthDeg),elevationDeg:Sb(n.elevationDeg,-89,89,t.modelLight.elevationDeg)}}}function Db(e,t){let n=Eb(e),r=Eb(t);return n.ambient===r.ambient&&n.modelLight.enabled===r.modelLight.enabled&&n.modelLight.intensity===r.modelLight.intensity&&n.modelLight.azimuthDeg===r.modelLight.azimuthDeg&&n.modelLight.elevationDeg===r.modelLight.elevationDeg}var Ob=2,kb=1500,Ab=3,jb=2e3;function Mb(e,t=wm){return Math.round(e/t)*t}function Nb(e,t,n){return Math.min(n,Math.max(t,e))}function Pb(e){let t=Number(e);if(!Number.isFinite(t))return Tm;let n=Nb(t,Sm,Cm);return Number(Mb(n).toFixed(2))}function Fb(e){let t=Number(e);return Number.isFinite(t)?t.toFixed(2):Number(Tm).toFixed(2)}function Ib({userScale:e=null}={}){return e==null?Tm:Pb(e)}function Lb(e){return Pb(Math.max(Pb(e),Tm))}function Rb(e){let t=Lb(e)/Tm;return{minWarmupPasses:0,splatWarmupPasses:Nb(Math.ceil(Ob*t),Ob,Ab),maxWaitMs:Nb(Math.round(kb*t),kb,jb)}}function zb({storage:e}={}){let t=e??Vb();if(!t)return null;try{let e=t.getItem(Em);if(!e)return null;let n=JSON.parse(e)?.userScale;if(n==null)return null;let r=Number(n);return Number.isFinite(r)?Pb(r):null}catch{return null}}function Bb(e,{storage:t}={}){let n=t??Vb();if(n)try{if(e==null){n.removeItem(Em);return}let t=JSON.stringify({userScale:Pb(e)});n.setItem(Em,t)}catch{}}function Vb(){if(typeof window>`u`)return null;try{return window.localStorage??null}catch{return null}}var Hb=`current`,Ub=`sequence`,Wb=`video`,Gb=`duration`,Kb=`keyframes`,qb=new Set([Hb,Ub,Wb]),Jb=new Set([Gb,Kb]);function Yb(e,t){let n=Number(e);return Number.isFinite(n)?Math.round(n):t}function Xb(e){return Yb(e?.playbackStartFrame,Yb(e?.startFrame,1))}function Zb(e){let t=Yb(e?.startFrame,1)+Math.max(1,Yb(e?.durationFrames,1))-1;return Yb(e?.playbackEndFrame,t)}function Qb(e){return qb.has(e)?e:Hb}function $b(e){return Jb.has(e)?e:Gb}function ex(e=null){let t=zy(e),n=Xb(t),r=Math.max(n,Zb(t)),i=new Set;for(let e of t.bindings??[])for(let t of e.tracks??[])for(let e of t.keys??[]){let t=Yb(e?.frame,NaN);!Number.isFinite(t)||t<n||t>r||i.add(t)}return[...i].sort((e,t)=>e-t)}function tx(e=null,{frameSource:t=Gb}={}){let n=zy(e);if($b(t)===`keyframes`)return ex(e);let r=Xb(n),i=Math.max(r,Zb(n)),a=[];for(let e=r;e<=i;e+=1)a.push(e);return a}var nx=Math.PI*.5,rx=.001;function ix(e){return(e.rotation??0)*Math.PI/180}function ax(e){let t=Math.round(e/nx)*nx;return Math.abs(e-t)<rx}function ox(e,t,n,r){let i=Math.round(e-n*.5),a=Math.round(e+n*.5),o=Math.round(t-r*.5),s=Math.round(t+r*.5);return{x:i,y:o,width:Math.max(0,a-i),height:Math.max(0,s-o)}}function sx(e){let t=Number(e.scale);return Number.isFinite(t)&&t>0?t:1}function cx(e,t,n,r=t,i=n){let a=sx(e),o=t/Math.max(r,1e-6),s=n/Math.max(i,1e-6);return{width:om.width*a*o,height:om.height*a*s}}function lx(e,t,n,r=t,i=n,a=0,o=0,s={}){let{pixelSnapAxisAligned:c=!0}=s,{width:l,height:u}=cx(e,t,n,r,i),d=a+e.x*t,f=o+e.y*n,p=ix(e),m=Math.round(p/nx),h=ax(p),g=h&&Math.abs(m)%2==1;return{centerX:d,centerY:f,width:l,height:u,rotationRadians:p,axisAligned:h,snappedRect:h&&c?ox(d,f,g?u:l,g?l:u):null}}function ux(e,t,n,r,i,a=2){let o=a*.5;e.strokeRect(t-o,n-o,r+o*2,i+o*2)}function dx(e,t,n=2){if(t.axisAligned&&t.snappedRect){ux(e,t.snappedRect.x,t.snappedRect.y,t.snappedRect.width,t.snappedRect.height,n);return}e.translate(t.centerX,t.centerY),e.rotate(t.rotationRadians),ux(e,-t.width*.5,-t.height*.5,t.width,t.height,n)}function fx(e,t,n,r,i={}){let{strokeStyle:a=`#ff0000`,lineWidth:o=2,selectedFrameId:s=null,selectedFrameIds:c=null,selectedStrokeStyle:l=null,selectedLineWidth:u=1,selectedLineDash:d=[4,2],logicalSpaceWidth:f=t,logicalSpaceHeight:p=n,offsetX:m=0,offsetY:h=0,pixelSnapAxisAligned:g=!0}=i,_=[...r].sort((e,t)=>(e.order??0)-(t.order??0)),v=c instanceof Set?c:new Set(c??[]);for(let r of _){let i=lx(r,t,n,f,p,m,h,{pixelSnapAxisAligned:g});if(e.save(),e.strokeStyle=a,e.lineWidth=o,e.setLineDash([]),dx(e,i,o),e.restore(),v.has(r.id)&&l){let t=s&&r.id===s?u+.25:u;e.save(),e.strokeStyle=l,e.lineWidth=t,e.setLineDash(d),dx(e,i,t),e.restore()}}}var px=8,mx=180;function hx(e,t=null){if(!Array.isArray(e)||e.length===0)return[];let n=t?.mode;if(n===`off`)return[];if(n===`selected`){let n=Array.isArray(t?.selectedIds)?t.selectedIds:[],r=new Set((n.length>0?n:e.map(e=>e?.id)).filter(e=>typeof e==`string`&&e.length>0));return e.filter(e=>r.has(e?.id))}return[...e]}function gx(e,t){let n=Math.cos(t),r=Math.sin(t);return{x:e.x*n-e.y*r,y:e.x*r+e.y*n}}function _x(e,t,n,r=t,i=n,a=0,o=0){let s=lx(e,t,n,r,i,a,o,{pixelSnapAxisAligned:!1}),c=s.width*.5,l=s.height*.5;return[{x:-c,y:-l},{x:c,y:-l},{x:c,y:l},{x:-c,y:l}].map(e=>{let t=gx(e,s.rotationRadians);return{x:s.centerX+t.x,y:s.centerY+t.y}})}function vx(e){let t=Number(e)||0;for(;t<0;)t+=Math.PI;for(;t>=Math.PI;)t-=Math.PI;return t}function yx(e){if(!Array.isArray(e)||e.length===0)return null;let t=Math.min(...e.map(e=>e.x)),n=Math.max(...e.map(e=>e.x)),r=Math.min(...e.map(e=>e.y)),i=Math.max(...e.map(e=>e.y));return[{x:t,y:r},{x:n,y:r},{x:n,y:i},{x:t,y:i}]}function bx(e,t){if(!Array.isArray(e)||e.length===0)return null;let n=e.map(e=>gx(e,-t)),r=Math.min(...n.map(e=>e.x)),i=Math.max(...n.map(e=>e.x)),a=Math.min(...n.map(e=>e.y)),o=Math.max(...n.map(e=>e.y));return[{x:r,y:a},{x:i,y:a},{x:i,y:o},{x:r,y:o}].map(e=>gx(e,t))}function xx(e,t){if(!(!Array.isArray(t)||t.length===0)){e.moveTo(t[0].x,t[0].y);for(let n=1;n<t.length;n+=1)e.lineTo(t[n].x,t[n].y);e.closePath()}}function Sx(e,t){!Array.isArray(t)||t.length<3||(e.beginPath(),xx(e,t),e.fill())}function Cx(e,t,n,r,i,a,o){return{x:a+e.x/Math.max(r,1e-6)*t,y:o+e.y/Math.max(i,1e-6)*n}}function wx(e,t,n,r,i,a,o,s){return Xg(e,t,i,a).map(e=>({...e,corners:e.corners.map(e=>Cx(e,n,r,i,a,o,s))}))}function Tx(e,t,{canvasWidth:n,canvasHeight:r,frameSpaceWidth:i,frameSpaceHeight:a,logicalSpaceWidth:o,logicalSpaceHeight:s,offsetX:c,offsetY:l,fillStyle:u,frameMaskSettings:d}){let f=wx(t,d,i,a,o,s,c,l);if(f.length===0)return null;e.fillStyle=u,e.fillRect(0,0,n,r),e.globalCompositeOperation=`destination-out`;for(let t of f)Sx(e,t.corners);for(let t=1;t<f.length;t+=1){let n=f[t-1].corners,r=f[t].corners;for(let t=0;t<n.length;t+=1){let i=n[t],a=n[(t+1)%n.length],o=r[(t+1)%r.length],s=r[t];Sx(e,[i,a,o]),Sx(e,[i,o,s])}}return e.globalCompositeOperation=`source-over`,null}function Ex(e,t,n,r=t,i=n,a=0,o=0,s={}){if(!Array.isArray(e)||e.length===0||_g(s.frameMaskShape??s.frameMaskSettings?.shape)===`trajectory`)return null;let c=e.map(e=>_x(e,t,n,r,i,a,o));if(c.length===1)return c[0];let l=e.map(e=>vx((Number(e?.rotation)||0)*Math.PI/180)),u=l[0],d=l.every(e=>Math.abs(e-u)<=1e-6),f=c.flat();return d?bx(f,u):yx(f)}function Dx(e,t,{canvasWidth:n,canvasHeight:r,frameSpaceWidth:i=n,frameSpaceHeight:a=r,logicalSpaceWidth:o=i,logicalSpaceHeight:s=a,offsetX:c=0,offsetY:l=0,fillStyle:u=`rgb(3, 6, 11)`,frameMaskSettings:d=null}={}){if(!e)throw Error(`Failed to acquire the 2D context for FRAME mask.`);if(e.clearRect(0,0,n,r),!Array.isArray(t)||t.length===0)return null;if(_g(d?.shape)===`trajectory`)return Tx(e,t,{canvasWidth:n,canvasHeight:r,frameSpaceWidth:i,frameSpaceHeight:a,logicalSpaceWidth:o,logicalSpaceHeight:s,offsetX:c,offsetY:l,fillStyle:u,frameMaskSettings:d});let f=Ex(t,i,a,o,s,c,l,{frameMaskSettings:d});return f?(e.fillStyle=u,e.fillRect(0,0,n,r),e.globalCompositeOperation=`destination-out`,e.beginPath(),xx(e,f),e.fillStyle=`#000`,e.fill(),e.globalCompositeOperation=`source-over`,f):null}function Ox(e,t,{canvasWidth:n,canvasHeight:r,frameSpaceWidth:i=n,frameSpaceHeight:a=r,logicalSpaceWidth:o=i,logicalSpaceHeight:s=a,offsetX:c=0,offsetY:l=0,strokeStyle:u=`#ff674d`,lineWidth:d=2,frameMaskSettings:f=null,trajectorySource:p=tg}={}){if(!e)throw Error(`Failed to acquire the 2D context for FRAME trajectory.`);let m=bg(p);if(!Array.isArray(t)||t.length<2||m===`none`)return[];let h=Qg(t,f,o,s,{source:m}).map(e=>Cx(e,i,a,o,s,c,l));if(h.length<2)return[];e.clearRect(0,0,n,r),e.beginPath(),e.moveTo(h[0].x,h[0].y);for(let t=1;t<h.length;t+=1)e.lineTo(h[t].x,h[t].y);return e.strokeStyle=u,e.lineWidth=d,e.lineJoin=`round`,e.lineCap=`round`,e.stroke(),kx(e,t,{canvasWidth:n,canvasHeight:r,frameSpaceWidth:i,frameSpaceHeight:a,logicalSpaceWidth:o,logicalSpaceHeight:s,offsetX:c,offsetY:l,strokeStyle:u,lineWidth:d,frameMaskSettings:f,trajectorySource:m}),h}function kx(e,t,{canvasWidth:n,canvasHeight:r,frameSpaceWidth:i=n,frameSpaceHeight:a=r,logicalSpaceWidth:o=i,logicalSpaceHeight:s=a,offsetX:c=0,offsetY:l=0,strokeStyle:u=`#ff674d`,lineWidth:d=2,frameMaskSettings:f=null,trajectorySource:p=tg}={}){if(!e)return[];let m=bg(p);if(!Array.isArray(t)||t.length<2||m===`none`)return[];let h=a_(t,f,o,s,{source:m});if(h.length===0)return[];let g=Math.max(px,Math.min(n,r)/mx)*.5,_=[];e.save(),e.strokeStyle=u,e.lineWidth=d,e.lineCap=`round`;for(let t of h){let n=Cx(t.point,i,a,o,s,c,l),r=Cx({x:t.point.x+t.tangent.x,y:t.point.y+t.tangent.y},i,a,o,s,c,l),u=r.x-n.x,d=r.y-n.y,f=Math.hypot(u,d);if(!(f>0))continue;let p=-d/f,m=u/f,h={x:n.x-p*g,y:n.y-m*g},v={x:n.x+p*g,y:n.y+m*g};e.beginPath(),e.moveTo(h.x,h.y),e.lineTo(v.x,v.y),e.stroke(),_.push({frameId:t.frameId,start:h,end:v,center:n})}return e.restore(),_}function Ax(e,t,n,{name:r=`Mask`,opacity:i=.8,hidden:a=!0,fillStyle:o=`rgb(3, 6, 11)`,createCanvas:s=null,frameMaskSettings:c=null}={}){let l=hx(e,c);if(l.length===0)return null;let u=typeof s==`function`?s(t,n):(()=>{let e=document.createElement(`canvas`);return e.width=t,e.height=n,e})();return Dx(u.getContext(`2d`),l,{canvasWidth:t,canvasHeight:n,fillStyle:o,frameMaskSettings:c}),{name:r,canvas:u,opacity:i,hidden:a}}function jx(e,t,n,{name:r=`Trajectory`,opacity:i=1,strokeStyle:a=`#ff674d`,lineWidth:o=2,createCanvas:s=null,frameMaskSettings:c=null,trajectorySource:l=tg}={}){let u=bg(l);if(!Array.isArray(e)||e.length<2||u===`none`)return null;let d=typeof s==`function`?s(t,n):(()=>{let e=document.createElement(`canvas`);return e.width=t,e.height=n,e})();return Ox(d.getContext(`2d`),e,{canvasWidth:t,canvasHeight:n,strokeStyle:a,lineWidth:o,frameMaskSettings:c,trajectorySource:u}).length<2?null:{name:r,canvas:d,opacity:i}}var Mx=15,Nx={top:0,"top-right":45,right:90,"bottom-right":135,bottom:180,"bottom-left":225,left:270,"top-left":315},Px=new Map;function Fx(e){let t=Number.isFinite(e)?e%360:0;return t<0?t+360:t}function Ix(e){return Math.round(Fx(e)/Mx)*Mx}function Lx(e){return`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${e} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#ffffff" stroke-width="4.8" />
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#111111" stroke-width="1.9" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim()}function Rx(e=0,t=`top`){let n=Ix(e+(Nx[t]??0));if(!Px.has(n)){let e=encodeURIComponent(Lx(n));Px.set(n,`url("data:image/svg+xml,${e}") 16 16, grab`)}return Px.get(n)}var zx=Math.PI*2,Bx=1.28,Vx=Object.freeze([`tool-select`,`tool-reference`,`toggle-reference-preview`,`tool-transform`,`tool-pivot`,`adjust-lens`,`frame-create`,`frame-mask-toggle`,`toggle-view-mode`,`clear-selection`]);function Hx(e){let t=zx/e.length;return e.map((e,n)=>({id:e,angle:-Math.PI/2+t*n}))}var Ux=Object.freeze(Hx(Vx));function Wx({coarse:e=!1,uiScale:t=1}={}){let n=Number.isFinite(t)&&t>0?t:1,r=(e?Bx:1)*n;return{coarse:e,uiScale:n,scale:r,radius:88*r,innerRadius:28*r,outerRadius:126*r}}function Gx({mode:e,t,viewportToolMode:n=`none`,viewportOrthographic:r=!1,referencePreviewSessionVisible:i=!0,hasReferenceImages:a=!1,frameMaskMode:o=`off`}){let s=o===`selected`||o===`all`;return Ux.map(o=>{switch(o.id){case`tool-select`:return{...o,icon:`cursor`,label:t(`transformMode.select`),active:n===`select`};case`tool-reference`:return{...o,icon:`reference-tool`,label:t(`transformMode.reference`),active:n===`reference`};case`toggle-reference-preview`:return{...o,icon:i?`reference-preview-on`:`reference-preview-off`,label:t(i?`action.hideReferenceImages`:`action.showReferenceImages`),active:a&&i,disabled:!a};case`tool-transform`:return{...o,icon:`move`,label:t(`transformMode.transform`),active:n===`transform`};case`tool-pivot`:return{...o,icon:`pivot`,label:t(`transformMode.pivot`),active:n===`pivot`};case`adjust-lens`:return{...o,icon:`camera-dslr`,label:t(`action.adjustLens`),disabled:e===`viewport`&&r};case`frame-create`:return{...o,icon:`frame-plus`,label:t(`action.newFrame`)};case`frame-mask-toggle`:return{...o,icon:`mask`,label:t(s?`action.disableFrameMask`:`action.enableFrameMask`),active:e===`camera`&&s,disabled:e!==`camera`};case`toggle-view-mode`:return e===`camera`?{...o,icon:`viewport`,label:t(`mode.viewport`)}:{...o,icon:`camera`,label:t(`mode.camera`)};case`clear-selection`:return{...o,icon:`selection-clear`,label:t(`action.clearSelection`)};default:return{...o,icon:`slash-circle`,label:o.id}}})}function Kx(e){let t=e;for(;t<=-Math.PI;)t+=zx;for(;t>Math.PI;)t-=zx;return t}function qx({x:e,y:t,centerX:n,centerY:r,actions:i,innerRadius:a=28,outerRadius:o=126}){let s=e-n,c=t-r,l=Math.hypot(s,c);if(l<a||l>o)return null;let u=Math.atan2(c,s),d=null,f=1/0;for(let e of i){let t=Math.abs(Kx(u-e.angle));t<f&&(f=t,d=e.id)}return d}function Jx(e,t){let n=e.project?.name?.value?.trim?.()??``,r=n||t(`project.untitled`),i=!!e.project?.dirty?.value,a=!!e.project?.packageDirty?.value,o=(e.sceneAssets?.value?.length??0)>0,s=(e.referenceImages?.items?.value?.length??0)>0,c=(e.workspace?.shotCameras?.value?.length??0)>1;return{projectDisplayName:r,projectDirty:i,showProjectPackageDirty:a&&(i||o||s||c||!!n)}}var Yx=1180,Xx=600,Zx=360,Qx=1.05,$x=.9,eS=.95,tS=1.05,nS=.8,rS=1.3;function iS(e,t=.01){return Math.round(e/t)*t}function aS(e){let t=Number(e);return Number.isFinite(t)?Number(iS(Math.min(2,Math.max(ym,t)),.01).toFixed(2)):1}function oS(e){let t=Number(e);return Number.isFinite(t)?t.toFixed(2):1 .toFixed(2)}function sS({viewportWidth:e=0,screenWidth:t=0,coarsePointer:n=!1}={}){let r=Number(e);if(!Number.isFinite(r)||r<=0||!n||r>Yx)return 1;let i=Number(t);if(Number.isFinite(i)&&i>0){let e=r/i;if(e>Qx){let t=1/e;return Number(iS(Math.min(rS,Math.max(nS,t)),.01).toFixed(2))}}return r<Zx?tS:r<Xx?eS:$x}function cS({storage:e}={}){let t=e??uS();if(!t)return null;try{let e=t.getItem(xm);if(!e)return null;let n=JSON.parse(e)?.userScale;if(n==null)return null;let r=Number(n);return Number.isFinite(r)?aS(r):null}catch{return null}}function lS(e,{storage:t}={}){let n=t??uS();if(n)try{if(e==null){n.removeItem(xm);return}let t=JSON.stringify({userScale:aS(e)});n.setItem(xm,t)}catch{}}function uS(){if(typeof window>`u`)return null;try{return window.localStorage??null}catch{return null}}function dS({userScale:e=null,autoScale:t=1}={}){return aS(e??t)}function fS(e,t=0){return Number(e).toFixed(t)}function pS(e=null){let t=$v(),n=R(t),r=R(av),i=R(bv()),a=R(i.value[0].id),o=R(Vv()),s=R(o.value[0].id),c=R(Gm),l=R(!1),u=R(Jy),d=R(nb),f=R(3),p=R(6),m=R({...rb}),h=R(`navigate`),g=R(`world`),_=R(`none`),v=R(Ly()),y=R(1),b=R(!1),x=R(!1),S=R(220),C=R(null),w=R([]),T=R([]),E=R(1),D=R(1),O=R(`camera`),k=R(null),A=R(!1),ee=R(null),te=R(null),j=R(null),ne=R(null),re=R(``),ie=R({contextKind:`viewport`,start:{visible:!1,x:0,y:0},end:{visible:!1,x:0,y:0},draftEnd:{visible:!1,x:0,y:0},lineVisible:!1,lineUsesDraft:!1,axisSnap:{active:!1,axisKey:null,x:0,y:0,label:``},chip:{visible:!1,x:0,y:0,label:``,placement:`above`},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}),ae=z(()=>_.value===`select`),oe=z(()=>_.value===`reference`),se=z(()=>_.value===`pivot`),ce=z(()=>_.value===`transform`),le=z(()=>_.value===`splat-edit`),ue=R(`box`),de=R([]),fe=R([]),pe=R(0),me=R(30),he=R(`depth`),ge=R(.2),_e=R(!1),M=R({visible:!1,x:0,y:0,radiusPx:0,painting:!1,subtract:!1}),ve=R(!1),ye=R({x:0,y:0,z:0}),be=R({x:1,y:1,z:1}),xe=R({x:0,y:0,z:0,w:1}),N=R({x:null,y:null}),Se=R({mode:``,hitCount:0}),P=R(`empty`),Ce=R(!1),F=R(!1),we=R(!1),I=z(()=>Ce.value||F.value&&!we.value),L=R(``),Te=R(!1),Ee=R(null),De=R(1),Oe=R(!1),ke=z(()=>dS({userScale:Ee.value,autoScale:De.value})),Ae=R(null),je=z(()=>Ib({userScale:Ae.value})),Me=R({open:!1,x:0,y:0,hoveredActionId:null,coarse:!1,scale:1,radius:88,innerRadius:28,outerRadius:126}),Ne=R({visible:!1,x:0,y:0,mmLabel:``,fovLabel:``}),Pe=R({visible:!1,x:0,y:0,angleLabel:``}),Fe=R(ny(t,`scene.badgeEmpty`)),Ie=R(vm),Le=R(ny(t,`scene.summaryEmpty`)),Re=R(ny(t,`scene.scaleDefault`)),ze=R([]),Be=R(wb()),Ve=R(q_()),He=R(!0),Ue=R(!0),We=R(``),Ge=R(``),Ke=R([]),qe=R([]),Je=R([]),Ye=R(0),Xe=R([]),Ze=R(``),Qe=R(``),$e=R([]),et=R(null),tt=R(null),nt=R(null),rt=R([]),it=R(null),at=z(()=>ze.value.find(e=>e.id===it.value)??null),ot=R(``),st=R(ny(t,`status.ready`)),ct=R(``),lt=R(!1),ut=R(!0),dt=R(null),ft=R(null),pt=R(!1),mt=R(`getting-started`),ht=R(null),gt=R(``),_t=R(`ja`),vt=R(!1),yt=R(`export.idle`),bt=R(ny(t,`exportSummary.empty`)),xt=R(`current`),St=R([]),Ct=R(Hb),wt=R(Gb),Tt=R(pm),Et=R(mm),Dt=R(0),Ot=R(0),kt=R(0),At=R(0),jt=R(0),Mt=R(0),Nt=z(()=>Uv(i.value,a.value)),B=z(()=>Gv(o.value,s.value)),Pt=R(!1),Ft=R([]),It=R(null),Lt=R(null),Rt=R(!1),zt=R(!1),Bt=R(!1),Vt=z(()=>zy(v.value)),Ht=z(()=>!!v.value?.enabled),Ut=z(()=>Array.isArray(v.value?.autoKeyTargetKeys)?[...v.value.autoKeyTargetKeys]:[]),Wt=z(()=>Ut.value.length>0),Gt=z(()=>Vt.value.startFrame+Vt.value.durationFrames-1),Kt=z(()=>B.value?.frames??[]),qt=z(()=>qv(Kt.value,B.value?.activeFrameId??null)),Jt=z(()=>qt.value?.id??``),Yt=z(()=>Kt.value.length),Xt=z(()=>Tv(B.value?.frames??[],B.value?.frameMask?.selectedIds??[])),Zt=z(()=>Nt.value.role),Qt=z(()=>B.value?.lens.baseFovX??Wm),$t=z(()=>Bm(B.value?.lens?.shiftX)),en=z(()=>Bm(B.value?.lens?.shiftY)),tn=z(()=>Number(($t.value*100).toFixed(2))),nn=z(()=>Number((en.value*100).toFixed(2))),rn=z(()=>B.value?.outputFrame.widthScale??1),an=z(()=>B.value?.outputFrame.heightScale??1),on=z(()=>B.value?.outputFrame.viewZoom??1),sn=z(()=>B.value?.outputFrame.anchor??`center`),cn=z(()=>B.value?.clipping.mode??`auto`),ln=z(()=>B.value?.clipping.near??.1),un=z(()=>B.value?.clipping.far??1e3),dn=z(()=>ln.value),fn=z(()=>cn.value===`manual`?un.value:Et.value),pn=z(()=>B.value?.exportSettings?.exportName??``),mn=z(()=>B.value?.exportSettings?.exportFormat??`psd`),hn=z(()=>!!B.value?.exportSettings?.exportGridOverlay),gn=z(()=>B.value?.exportSettings?.exportGridLayerMode===`overlay`?`overlay`:`bottom`),_n=z(()=>!!B.value?.exportSettings?.exportModelLayers),vn=z(()=>!!B.value?.exportSettings?.exportModelLayers&&!!B.value?.exportSettings?.exportSplatLayers),yn=z(()=>Ph(B.value?.compositionGuide)),bn=z(()=>yn.value.enabled),xn=z(()=>yn.value.scope),Sn=z(()=>yn.value.pattern),Cn=z(()=>!!B.value?.navigation?.rollLock),wn=z(()=>B.value?.frameMask?.mode??`off`),Tn=z(()=>Ev(B.value?.frameMask?.mode,B.value?.frameMask?.preferredMode)),En=z(()=>Number.isFinite(B.value?.frameMask?.opacityPct)?B.value.frameMask.opacityPct:80),Dn=z(()=>B.value?.frameMask?.shape??`bounds`),On=z(()=>B.value?.frameMask?.trajectoryMode??`line`),kn=z(()=>B.value?.frameMask?.trajectoryExportSource??`none`),An=z(()=>B.value?.frameMask?.trajectory?.nodesByFrameId??{}),jn=z(()=>Fg(B.value?.frameMask,qt.value?.id)),Mn=z(()=>Math.max(64,Math.round(am.width*rn.value))),Nn=z(()=>Math.max(64,Math.round(am.height*an.value))),Pn=z(()=>`${Mn.value} × ${Nn.value}`),Fn=z(()=>Be.value.ambient),In=z(()=>Be.value.modelLight.enabled),Ln=z(()=>Be.value.modelLight.intensity),Rn=z(()=>Be.value.modelLight.azimuthDeg),zn=z(()=>Be.value.modelLight.elevationDeg),Bn=z(()=>St.value.length),Vn=z(()=>ny(n.value,Yv(Nt.value))),Hn=z(()=>ny(n.value,yt.value)),Un=z(()=>`${fS(Lm(Qt.value),1)}°`),Wn=z(()=>Number(Rm(Qt.value).toFixed(2))),Gn=z(()=>`${fS(Lm(c.value),1)}°`),Kn=z(()=>Number(Rm(c.value).toFixed(2))),qn=z(()=>`${fS(rn.value*100,0)}%`),Jn=z(()=>`${fS(an.value*100,0)}%`),Yn=z(()=>`${fS(on.value*100,0)}%`);return{runtime:e,locale:n,workspace:{layout:r,panes:i,activePaneId:a,shotCameras:o,activeShotCameraId:s,activeShotCamera:B},workbenchCollapsed:I,workbenchManualCollapsed:Ce,workbenchAutoCollapsed:F,workbenchManualExpanded:we,viewportPieMenu:Me,viewportLensHud:Ne,viewportRollHud:Pe,interactionMode:h,viewportBaseFovX:c,viewportBaseFovXDirty:l,viewportProjectionMode:u,viewportOrthoView:d,viewportOrthoSize:f,viewportOrthoDistance:p,viewportOrthoFocus:m,viewportToolMode:_,viewportTransformSpace:g,animation:{document:v,enabled:Ht,activeClip:Vt,timelineFrame:y,endFrame:Gt,isPlaying:b,autoKey:Wt,autoKeyTargetKeys:Ut,panelOpen:x,panelHeight:S,selectedBindingId:C,selectedKeyIds:w,expandedRowIds:T,zoom:E,scrollFrame:D,keyTargetMode:O,evaluatedLens:k},viewportSelectMode:ae,viewportReferenceImageEditMode:oe,viewportPivotEditMode:se,viewportTransformMode:ce,viewportSplatEditMode:le,splatEdit:{active:le,tool:ue,scopeAssetIds:de,rememberedScopeAssetIds:fe,selectionCount:pe,brushSize:me,brushDepthMode:he,brushDepth:ge,brushDepthBarVisible:_e,brushPreview:M,boxPlaced:ve,boxCenter:ye,boxSize:be,boxRotation:xe,hudPosition:N,lastOperation:Se,lodStatus:P},measurement:{active:A,startPointWorld:ee,endPointWorld:te,draftEndPointWorld:j,selectedPointKey:ne,lengthInputText:re,overlay:ie},mode:Zt,baseFovX:Qt,renderBox:{widthScale:rn,heightScale:an,viewZoom:on,anchor:sn},shotCamera:{clippingMode:cn,near:dn,far:fn,nearLive:Tt,farLive:Et,positionX:Dt,positionY:Ot,positionZ:kt,lensShiftX:$t,lensShiftY:en,lensShiftXPercent:tn,lensShiftYPercent:nn,yawDeg:At,pitchDeg:jt,rollDeg:Mt,rollLock:Cn,exportName:pn,exportFormat:mn,exportGridOverlay:hn,exportGridLayerMode:gn,exportModelLayers:_n,exportSplatLayers:vn,compositionGuide:yn,compositionGuideEnabled:bn,compositionGuideScope:xn,compositionGuidePattern:Sn},frames:{documents:Kt,active:qt,activeId:Jt,count:Yt,selectionActive:Pt,selectedIds:Ft,selectionAnchor:It,selectionBoxLogical:Lt,trajectoryEditMode:Rt,maskSelectedIds:Xt,maskMode:wn,maskPreferredMode:Tn,maskOpacityPct:En,maskShape:Dn,trajectoryMode:On,trajectoryExportSource:kn,trajectoryNodeMode:jn,trajectoryNodesByFrameId:An},history:{canUndo:zt,canRedo:Bt},remoteUrl:L,mobileUi:{active:Te,userScale:Ee,autoScale:De,effectiveScale:ke,settingsOpen:Oe},viewportLod:{userScale:Ae,effectiveScale:je},sceneBadge:Fe,sceneUnitBadge:Ie,sceneSummary:Le,sceneScaleSummary:Re,sceneAssets:ze,lighting:{state:Be,ambient:Fn,modelLightEnabled:In,modelLightIntensity:Ln,modelLightAzimuthDeg:Rn,modelLightElevationDeg:zn},referenceImages:{document:Ve,previewSessionVisible:He,exportSessionEnabled:Ue,panelPresetId:We,panelPresetName:Ge,presets:Ke,items:qe,assets:Je,assetCount:Ye,previewLayers:Xe,selectedAssetId:Ze,selectedItemId:Qe,selectedItemIds:$e,selectionAnchor:et,selectionBoxLogical:tt,selectionBoxScreen:nt},selectedSceneAssetIds:rt,selectedSceneAssetId:it,selectedSceneAsset:at,cameraSummary:ot,statusLine:st,project:{name:ct,dirty:lt,packageDirty:ut},overlay:dt,backgroundTask:ft,help:{open:pt,sectionId:mt,anchor:ht,searchQuery:gt,lang:_t},exportBusy:vt,exportStatusKey:yt,exportStatusLabel:Hn,exportSummary:bt,exportOptions:{target:xt,presetIds:St,presetCount:Bn,mode:Ct,frameSource:wt},exportWidth:Mn,exportHeight:Nn,exportSizeLabel:Pn,modeLabel:Vn,fovLabel:Un,equivalentMmValue:Wn,viewportFovLabel:Gn,viewportEquivalentMmValue:Kn,widthLabel:qn,heightLabel:Jn,zoomLabel:Yn}}function mS(e,t){if(Array.isArray(e)){for(let n of e)if(!(!n||typeof n!=`object`)){if(n.type===`group`){mS(n.fields,t);continue}typeof n.id==`string`&&(t[n.id]=n.value??``)}}}function hS(e=[]){let t={};return mS(e,t),t}function gS(e,t,n){if(!e||typeof e!=`object`)return null;let r=typeof e.disabled==`function`?!!e.disabled(t):!!e.disabled;if(e.type===`group`)return(typeof e.hidden==`function`?e.hidden(t):e.hidden)?null:M`
			<details class="overlay-field-group" ...${e.open?{open:!0}:{}}>
				<summary class="overlay-field-group__summary">
					${e.label}
				</summary>
				<div class="overlay-field-group__body">
					${(e.fields??[]).map(e=>gS(e,t,n))}
				</div>
			</details>
		`;if(e.type===`checkbox`)return M`
			<label class="overlay-checkbox-field">
				<input
					type="checkbox"
					checked=${!!t[e.id]}
					disabled=${r}
					onChange=${t=>n(n=>({...n,[e.id]:t.currentTarget.checked}))}
				/>
				<span>${e.label}</span>
			</label>
		`;if(e.type===`select`)return M`
			<label class="overlay-field">
				<span>${e.label}</span>
				<select
					value=${String(t[e.id]??``)}
					disabled=${r}
					onChange=${t=>n(n=>({...n,[e.id]:t.currentTarget.value}))}
				>
					${(e.options??[]).map(e=>M`
							<option value=${e.value}>${e.label}</option>
						`)}
				</select>
			</label>
		`;if(e.type===`radio`){let i=String(t[e.id]??``);return M`
			<fieldset
				class="overlay-field overlay-field--radio"
				disabled=${r}
			>
				<legend>${e.label}</legend>
				${(e.options??[]).map(t=>{let a=!!t.disabled||r;return M`
						<label
							class=${`overlay-radio-option ${a?`overlay-radio-option--disabled`:``}`}
						>
							<input
								type="radio"
								name=${e.id}
								value=${t.value}
								checked=${i===t.value}
								disabled=${a}
								onChange=${t=>{let r=t.currentTarget.value;n(t=>({...t,[e.id]:r}))}}
							/>
							<span class="overlay-radio-option__body">
								<span class="overlay-radio-option__label">
									${t.label}
								</span>
								${t.hint?M`
											<span class="overlay-radio-option__hint">
												${t.hint}
											</span>
										`:null}
							</span>
						</label>
					`})}
			</fieldset>
		`}return M`
		<label class="overlay-field">
			<span>${e.label}</span>
			<input
				type=${e.type??`text`}
				value=${String(t[e.id]??``)}
				disabled=${r}
				onInput=${t=>n(n=>({...n,[e.id]:t.currentTarget.value}))}
			/>
		</label>
	`}function _S(e,t,n){return e?.fields?.length?M`
		<div class="overlay-field-list">
			${e.fields.map(e=>gS(e,t,n))}
		</div>
	`:null}function vS(e,t={},n=!1){return e?.actions?.length?M`
		<div class="overlay-card__actions">
			${e.actions.map(r=>M`
					<button
						type="button"
						class=${r.primary?`button button--primary`:`button`}
						disabled=${!!r.disabled||n}
						onClick=${async()=>{if(r.submit){await e.onSubmit?.(t);return}await r.onClick?.(t)}}
					>
						${r.label}
					</button>
				`)}
		</div>
	`:null}function yS(e){if(!Number.isFinite(e)||e<0)return``;if(e<60)return`${e}s`;let t=Math.floor(e/60),n=e%60;return`${t}m ${String(n).padStart(2,`0`)}s`}function bS(e){if(!Number.isFinite(e)||e<0)return``;let t=e/1e3;if(t<60)return`${t.toFixed(1)}s`;let n=Math.floor(t/60);return`${n}m ${(t-n*60).toFixed(1).padStart(4,`0`)}s`}function xS(e,t){if(!e.detail)return null;let n=e.detailTiming;if(!n||!Number.isFinite(n.stageStartedAt)||!Number.isFinite(n.totalStartedAt))return M`<p class="overlay-card__detail">${e.detail}</p>`;let r=Math.max(0,t-n.stageStartedAt),i=Math.max(0,t-n.totalStartedAt),a=n.stageLabel||`Stage`,o=n.totalLabel||`Total`,s=bS(r),c=bS(i);return M`
		<p class="overlay-card__detail">
			${e.detail}
			<span class="overlay-card__detail-timing">
				(${a} ${s} / ${o} ${c})
			</span>
		</p>
	`}function SS(e,t=Date.now()){let n=e.steps?.length??0,r=e.steps?.filter(e=>e.status===`done`).length??0,i=n>0?(r+.5)/n*100:null,a=e.startedAt?Math.max(0,Math.floor((t-e.startedAt)/1e3)):null,o=(Math.floor(t/400)%3+1).toString();return M`
		${i!=null&&M`
				<div
					class="overlay-progress"
					role="progressbar"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow=${Math.round(i)}
				>
					<div
						class="overlay-progress__fill"
						style=${`width:${i}%`}
					></div>
				</div>
			`}
		${xS(e,t)}
		${e.progressSummary&&M`
				<div class="overlay-progress-summary">
					<span class="overlay-progress-summary__count">
						${e.progressSummary.index}/${e.progressSummary.count}
					</span>
					<span class="overlay-progress-summary__main">
						${e.progressSummary.camera}
					</span>
					<span class="overlay-progress-summary__meta">
						${e.progressSummary.frameLabel??e.progressSummary.frame}
						· ${e.progressSummary.format}
					</span>
				</div>
			`}
		${e.phaseLabel&&M`
				<div class="overlay-phase">
					<div class="overlay-phase__header">
						<strong class="overlay-phase__title">${e.phaseLabel}</strong>
						${e.phaseDetail&&M`
								<span class="overlay-phase__detail">${e.phaseDetail}</span>
							`}
					</div>
					${e.phases?.length>0&&M`
							<ol
								class="overlay-phase-list"
								style=${`--overlay-phase-count:${e.phases.length}`}
							>
								${e.phases.map(e=>M`
										<li class=${`overlay-phase-step overlay-phase-step--${e.status}`}>
											<span class="overlay-phase-step__marker" aria-hidden="true"></span>
											<span class="overlay-phase-step__label">${e.label}</span>
										</li>
									`)}
							</ol>
						`}
				</div>
			`}
		${a!=null&&M`
				<div
					class="overlay-card__heartbeat"
					data-dot-count=${o}
					aria-hidden="true"
				>
					<span class="overlay-card__heartbeat-dots">
						<span></span>
						<span></span>
						<span></span>
					</span>
					<span class="overlay-card__heartbeat-time">
						${yS(a)}
					</span>
				</div>
			`}
		${e.steps?.length>0&&M`
				<ol class="overlay-step-list">
					${e.steps.map(e=>M`
							<li class=${`overlay-step overlay-step--${e.status}`}>
								<span class="overlay-step__label">${e.label}</span>
							</li>
						`)}
				</ol>
			`}
	`}function CS(e){return!e.detail&&!e.urls?.length?null:M`
		<details class="overlay-card__details">
			<summary>${e.detailLabel||`Details`}</summary>
			${e.urls?.length>0&&M`
					<ul class="overlay-url-list">
						${e.urls.map(e=>M`
								<li>
									<code>${e}</code>
								</li>
							`)}
					</ul>
				`}
			${e.detail&&M`<pre class="overlay-card__error-detail">${e.detail}</pre>`}
		</details>
	`}function wS({overlay:e}){let[t,n]=De(hS(e?.fields)),[r,i]=De(!1),[a,o]=De(()=>Date.now());if(ke(()=>{n(hS(e?.fields)),i(!1)},[e]),ke(()=>{if(e?.kind!==`progress`||!e?.startedAt)return;let t=globalThis.setInterval(()=>{o(Date.now())},400);return()=>globalThis.clearInterval(t)},[e?.kind,e?.startedAt]),!e)return null;let s={...e,onSubmit:typeof e.onSubmit==`function`?async t=>{i(!0);try{await e.onSubmit(t)}finally{i(!1)}}:null};return M`
		<div class="app-overlay" role="presentation">
			<div
				class="overlay-card"
				role=${e.kind===`error`?`alertdialog`:`dialog`}
				aria-modal="true"
			>
				<div class="overlay-card__header">
					<h2>${e.title}</h2>
				</div>
				${e.message&&M`<p class="overlay-card__message">${e.message}</p>`}
				${e.kind===`confirm`&&e.urls?.length>0&&M`
						<ul class="overlay-url-list">
							${e.urls.map(e=>M`
									<li>
										<code>${e}</code>
									</li>
								`)}
						</ul>
					`}
				${_S(e,t,n)}
				${e.kind===`progress`?SS(e,a):null}
				${e.kind===`error`?CS(e):null}
				${vS(s,t,r)}
			</div>
		</div>
	`}var TS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.9 8.7L9.4 6.1l4.5 2.6v5.4l-4.5 2.6-4.5-2.6zM9.4 6.1v10.6M4.9 8.7l4.5 2.6 4.5-2.6M11.8 14.8l3 3 6-6" />
    </g>
</svg>
`,ES=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g transform="translate(-1.2 1.5) scale(1.5)">
      <path d="M2 6C2 4.89543 2.89543 4 4 4H8.66667C9.77124 4 10.6667 4.89543 10.6667 6V10C10.6667 11.1046 9.77124 12 8.66667 12H4C2.89543 12 2 11.1046 2 10V6ZM4 5.33333C3.63181 5.33333 3.33333 5.63181 3.33333 6V10C3.33333 10.3682 3.63181 10.6667 4 10.6667H8.66667C9.03486 10.6667 9.33333 10.3682 9.33333 10V6C9.33333 5.63181 9.03486 5.33333 8.66667 5.33333H4Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" />
      <path d="M12.8153 4.92867C12.7625 4.95108 12.7139 4.98191 12.6678 5.01591L11.3333 6V10L12.6678 10.9841C12.7139 11.0181 12.7625 11.0489 12.8153 11.0713C13.6837 11.4404 14.6667 10.8048 14.6667 9.84262V6.15738C14.6667 5.19521 13.6837 4.55957 12.8153 4.92867Z" fill="currentColor" stroke="none" />
    </g>
</svg>
`,DS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
      <path d="M7 8.5h10M7 12h10M7 15.5h6" />
      <path d="M14.5 18.5l2.5-2.5" />
      <circle cx="18.2" cy="16.8" r="2.3" />
    </g>
</svg>
`,OS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<defs>
      <mask id="camera-property-cutout">
        <rect width="24" height="24" fill="white" />
        <circle cx="18" cy="18" r="5.5" fill="black" />
      </mask>
    </defs>
    <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g mask="url(#camera-property-cutout)">
        <path d="M4 7H7.5L9 5H13L14.5 7H18C19.1046 7 20 7.89543 20 9V15C20 16.1046 19.1046 17 18 17H4C2.89543 17 2 16.1046 2 15V9C2 7.89543 2.89543 7 4 7Z" />
        <circle cx="11" cy="12" r="3" />
      </g>
      <g transform="translate(18, 18)">
        <path d="M0 -3V-4M0 3V4M3 0H4M-3 0H-4M2.12 -2.12L2.83 -2.83M-2.12 2.12L-2.83 2.83M2.12 2.12L2.83 2.83M-2.12 -2.12L-2.83 -2.83" />
        <circle cx="0" cy="0" r="2" />
      </g>
    </g>
</svg>
`,kS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g transform="translate(-1.2 1.5) scale(1.5)">
      <path d="M2 6C2 4.89543 2.89543 4 4 4H8.66667C9.77124 4 10.6667 4.89543 10.6667 6V10C10.6667 11.1046 9.77124 12 8.66667 12H4C2.89543 12 2 11.1046 2 10V6ZM4 5.33333C3.63181 5.33333 3.33333 5.63181 3.33333 6V10C3.33333 10.3682 3.63181 10.6667 4 10.6667H8.66667C9.03486 10.6667 9.33333 10.3682 9.33333 10V6C9.33333 5.63181 9.03486 5.33333 8.66667 5.33333H4Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" />
      <path d="M12.8153 4.92867C12.7625 4.95108 12.7139 4.98191 12.6678 5.01591L11.3333 6V10L12.6678 10.9841C12.7139 11.0181 12.7625 11.0489 12.8153 11.0713C13.6837 11.4404 14.6667 10.8048 14.6667 9.84262V6.15738C14.6667 5.19521 13.6837 4.55957 12.8153 4.92867Z" fill="currentColor" stroke="none" />
    </g>
</svg>
`,AS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M5 9l7 6 7-6" />
</svg>
`,jS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 5l-6 7 6 7" />
    </g>
</svg>
`,MS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 5l6 7-6 7" />
    </g>
</svg>
`,NS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.8 1.8" />
    </g>
</svg>
`,PS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 6l12 12M18 6l-12 12" />
    </g>
</svg>
`,FS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="7" width="8" height="10" rx="1.5" />
      <path d="M13 12h3.5M15.2 9.8l2.3 2.2-2.3 2.2M15.5 8.5h3l1.6-1.6h1.4v10.2h-1.4L18.5 15.5h-3" />
      <circle cx="18.3" cy="12" r="1.5" />
    </g>
</svg>
`,IS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.8 12H5.3M6.8 9.8L4.5 12l2.3 2.2M4.8 8.5h3l1.6-1.6h1.4v10.2H9.4L7.8 15.5h-3" />
      <circle cx="7.7" cy="12" r="1.5" />
      <rect x="12.5" y="7" width="8" height="10" rx="1.5" />
    </g>
</svg>
`,LS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 4.5l7.2 16.8 2.2-6.1 6.1-2.2-15.5-8.5z" />
    </g>
</svg>
`,RS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
    </g>
</svg>
`,zS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v11M8.5 10.5L12 14l3.5-3.5M5 21h14M7.5 17.5v3.5M16.5 17.5v3.5" />
  </g>
</svg>
`,BS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M7 5.5h6.5a2 2 0 0 1 2 2V9" />
  <path d="M7 18.5h6.5a2 2 0 0 0 2-2V15" />
  <path d="M7 5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2" />
  <path d="M10.5 12H20" />
  <path d="m16.5 8.5 3.5 3.5-3.5 3.5" />
</svg>
`,VS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3l18 18M10.6 5.2A11.7 11.7 0 0 1 12 5c6.2 0 10 7 10 7a18.3 18.3 0 0 1-4 4.8M6.1 6.1C3.6 8 2 12 2 12s3.8 7 10 7c1.7 0 3.3-.5 4.7-1.2M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </g>
</svg>
`,HS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </g>
</svg>
`,US=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 8.5h6l2 2H21v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h3" />
    </g>
</svg>
`,WS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<defs>
		<mask id="frame-plus-cutout-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
			<rect width="24" height="24" fill="white" />
			<path d="M15.35 16.25h7.9M19.3 12.3v7.9" stroke="black" stroke-width="5.4" />
		</mask>
	</defs>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" mask="url(#frame-plus-cutout-mask)">
		<rect x="3.2" y="5.2" width="15.1" height="10.2" rx="2.15" />
	</g>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
		<path d="M15.35 16.25h7.9M19.3 12.3v7.9" />
	</g>
</svg>
`,GS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 9h16M4 15h16" />
    </g>
</svg>
`,KS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="currentColor" stroke="none">
      <circle cx="9" cy="7.5" r="0.9" />
      <circle cx="15" cy="7.5" r="0.9" />
      <circle cx="9" cy="12" r="0.9" />
      <circle cx="15" cy="12" r="0.9" />
      <circle cx="9" cy="16.5" r="0.9" />
      <circle cx="15" cy="16.5" r="0.9" />
    </g>
</svg>
`,qS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <title>Help</title>
  <circle cx="12" cy="12" r="9"/>
  <path d="M9.5 10.2c0.1-1.6 1.2-2.5 2.7-2.5 1.7 0 2.9 1 2.9 2.5 0 1.9-2.8 2.1-2.9 4.1"/>
  <circle cx="12.1" cy="17.2" r="0.85" fill="currentColor" stroke="none"/>
</svg>
`,JS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15 16 10 5 21" />
    </g>
</svg>
`,YS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M12 4l8 8-8 8-8-8 8-8z" />
</svg>
`,XS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
      <path d="M19 12h2" />
      <path d="M3 12h2" />
    </g>
</svg>
`,ZS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.2 2.2M16.6 16.6l2.2 2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2" />
    </g>
</svg>
`,QS=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.5 14.5l5-5M7.8 9.2l-1.9 1.9a3.5 3.5 0 0 0 5 5l1.9-1.9M16.2 14.8l1.9-1.9a3.5 3.5 0 0 0-5-5l-1.9 1.9" />
    </g>
</svg>
`,$S=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="11" width="11" height="8" rx="2" />
      <path d="M15 11V8.5a3 3 0 0 0-5.4-1.8" />
    </g>
</svg>
`,eC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="11" width="11" height="8" rx="2" />
      <path d="M9 11V8.5a3 3 0 0 1 6 0V11" />
    </g>
</svg>
`,tC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M7.7 8.6h8.6v6.8h-8.6z" fill="currentColor" stroke="none" fill-rule="evenodd" />
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5.6 8v8M18.4 8v8" />
    </g>
</svg>
`,nC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M5.9 8.3h5.2v7.4h-5.2z M12.9 8.3h5.2v7.4h-5.2z" fill="currentColor" stroke="none" fill-rule="evenodd" />
</svg>
`,rC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M7 8.1h10v7.8h-10z" fill="currentColor" stroke="none" fill-rule="evenodd" />
</svg>
`,iC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
</svg>
`,aC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v18M3 12h18M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2M3 12l2-2M3 12l2 2M21 12l-2-2M21 12l-2 2" />
    </g>
</svg>
`,oC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5zM4 7.5V16.5L12 21l8-4.5V7.5M12 12v9M8.5 5.8L12 7.8l3.5-2" />
    </g>
</svg>
`,sC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5zM4 7.5V16.5L12 21l8-4.5V7.5M12 12v9" />
    </g>
</svg>
`,cC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 4h6" />
      <path d="M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" />
      <path d="M7 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
      <path d="M12 11v6" />
      <path d="m9 14 3 3 3-3" />
    </g>
</svg>
`,lC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M9 5v14M15 5v14" />
</svg>
`,uC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3.5v3M20.5 12h-3M12 20.5v-3M3.5 12h3M17.8 6.2l-2.1 2.1M17.8 17.8l-2.1-2.1M6.2 17.8l2.1-2.1M6.2 6.2l2.1 2.1" />
    </g>
</svg>
`,dC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 5h8M10 5v5l-2 3h8l-2-3V5M12 13v6" />
    </g>
</svg>
`,fC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3M12 21v-2M19 12h2M3 12h2" />
    </g>
</svg>
`,pC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M8 5.5v13l10-6.5-10-6.5z" />
</svg>
`,mC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12h14" />
    </g>
</svg>
`,hC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <title>Redo</title>
  <path d="M15 7L19 11L15 15" />
  <path d="M19 11H11C7.134 11 4 14.134 4 18C4 18.682 4.098 19.341 4.28 19.964" />
</svg>
`,gC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<defs>
		<mask id="reference-preview-off-cutout-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
			<rect width="24" height="24" fill="white" />
			<g transform="translate(8.9 7.5) scale(0.58)" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" fill="black" stroke="none" />
				<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" stroke-width="5.4" />
				<circle cx="12" cy="12" r="3.1" fill="black" stroke="none" />
			</g>
			<path d="M4.35 4.55 20.45 19.65" stroke="black" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" />
		</mask>
	</defs>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" mask="url(#reference-preview-off-cutout-mask)">
		<rect x="2.9" y="4.2" width="16.1" height="13.3" rx="2.1" />
		<circle cx="7.15" cy="8.15" r="1.7" />
		<path d="M19 14.2 14.25 9.95 4.6 17.45" />
	</g>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
		<g transform="translate(8.9 7.5) scale(0.58)">
			<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
			<circle cx="12" cy="12" r="3" />
		</g>
		<path d="M4.35 4.55 20.45 19.65" />
	</g>
</svg>
`,_C=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<defs>
		<mask id="reference-preview-on-cutout-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
			<rect width="24" height="24" fill="white" />
			<g transform="translate(8.9 7.5) scale(0.58)" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" fill="black" stroke="none" />
				<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" stroke-width="5.4" />
				<circle cx="12" cy="12" r="3.1" fill="black" stroke="none" />
			</g>
		</mask>
	</defs>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" mask="url(#reference-preview-on-cutout-mask)">
		<rect x="2.9" y="4.2" width="16.1" height="13.3" rx="2.1" />
		<circle cx="7.15" cy="8.15" r="1.7" />
		<path d="M19 14.2 14.25 9.95 4.6 17.45" />
	</g>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
		<g transform="translate(8.9 7.5) scale(0.58)">
			<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
			<circle cx="12" cy="12" r="3" />
		</g>
	</g>
</svg>
`,vC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <circle cx="9.27784" cy="9.6668" r="1.5" />
      <path d="M19 14 15.111 10.6668 6.555 18" />
      <circle cx="5" cy="6" r="1.1" />
      <circle cx="19" cy="6" r="1.1" />
      <circle cx="19" cy="18" r="1.1" />
      <circle cx="5" cy="18" r="1.1" />
    </g>
</svg>
`,yC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <path d="M5 10h14" />
      <path d="M9 6v12" />
      <circle cx="5" cy="6" r="1.25" />
      <circle cx="19" cy="18" r="1.25" />
    </g>
</svg>
`,bC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </g>
</svg>
`,xC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18.2 9.3A7.5 7.5 0 1 0 19.2 12.8M18.2 5.2v3.9h-3.9" />
    </g>
</svg>
`,SC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g transform="rotate(-45 12 12)">
    <rect x="3.2" y="8.15" width="17.6" height="7.7" rx="0.72" />
    <path d="M5.75 8.15v4.65M8.75 8.15v2.85M11.75 8.15v4.65M14.75 8.15v2.85M17.75 8.15v4.65" />
  </g>
</svg>
`,CC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 4h12l2 2v14H5zM8 4v5h7V4" />
      <rect x="8" y="14" width="8" height="5" rx="1" />
    </g>
</svg>
`,wC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3.5l7 4-7 4-7-4 7-4z" />
      <path d="M5 11.5l7 4 7-4" />
      <path d="M5 15.5l7 4 7-4" />
    </g>
</svg>
`,TC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" />
    </g>
</svg>
`,EC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<defs>
		<mask id="selection-clear-cutout-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
			<rect width="24" height="24" fill="white" />
			<path d="M13.2 13.2l8.05 8.05M21.25 13.2l-8.05 8.05" stroke="black" stroke-width="5.4" />
		</mask>
	</defs>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" mask="url(#selection-clear-cutout-mask)">
		<path d="M5.2 2.85H14.6" stroke-dasharray="1.7 2.6" />
		<path d="M2.85 5.2V14.6" stroke-dasharray="1.7 2.6" />
		<path d="M5.2 16.95H11.25" stroke-dasharray="1.7 2.6" />
		<path d="M16.95 5.2V11.25" stroke-dasharray="1.7 2.6" />
		<path d="M2.85 5.2A2.35 2.35 0 0 1 5.2 2.85" />
		<path d="M14.6 2.85A2.35 2.35 0 0 1 16.95 5.2" />
		<path d="M2.85 14.6A2.35 2.35 0 0 0 5.2 16.95" />
	</g>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
		<path d="M13.2 13.2l8.05 8.05M21.25 13.2l-8.05 8.05" />
	</g>
</svg>
`,DC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <title>Settings</title>
  <circle cx="12" cy="12" r="3.1"/>
  <path d="M18.4 13.2l1.8 1.4-2 3.4-2.2-0.6a7.9 7.9 0 0 1-1.7 1l-0.3 2.3h-4l-0.3-2.3a7.9 7.9 0 0 1-1.7-1l-2.2 0.6-2-3.4 1.8-1.4a8 8 0 0 1 0-1.8L3.8 9.4l2-3.4 2.2 0.6a7.9 7.9 0 0 1 1.7-1l0.3-2.3h4l0.3 2.3a7.9 7.9 0 0 1 1.7 1l2.2-0.6 2 3.4-1.8 1.4a8 8 0 0 1 0 1.8z"/>
</svg>
`,OC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M6 5v14M18 6l-8 6 8 6V6z" />
</svg>
`,kC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M18 5v14M6 6l8 6-8 6V6z" />
</svg>
`,AC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M7 17l10-10" />
    </g>
</svg>
`,jC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
		<ellipse cx="8.8" cy="9" rx="6.2" ry="4.2" transform="rotate(-18 8.8 9)" />
		<ellipse cx="9.1" cy="9.1" rx="2.2" ry="1.35" transform="rotate(-18 9.1 9.1)" fill="currentColor" stroke="none" />
	</g>
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.15">
		<path d="M10.3 19.8 18.9 11.2l3.1 3.1-8.6 8.6-4.3 1.1 1.2-4.2Z" />
		<path d="m17.4 12.7 3.1 3.1" />
	</g>
</svg>
`,MC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 12h8l1-12M10 11v5M14 11v5" />
    </g>
</svg>
`,NC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <title>Undo</title>
  <path d="M9 7L5 11L9 15" />
  <path d="M5 11H13C16.866 11 20 14.134 20 18C20 18.682 19.902 19.341 19.72 19.964" />
</svg>
`,PC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3.5" />
    </g>
</svg>
`,FC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9.5h17M8.5 5v14" />
    </g>
</svg>
`,IC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<circle cx="10.5" cy="10.5" r="5" />
<path d="M14.2 14.2L19.5 19.5" />
<path d="M8 10.5h5" />
</svg>
`,LC=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10.5" cy="10.5" r="5" />
      <path d="M14.2 14.2L19.5 19.5" />
      <path d="M10.5 8v5" />
      <path d="M8 10.5h5" />
    </g>
</svg>
`,RC=`workbench-icon-sprite-host`,zC=null,BC=``,VC=!1;function HC(){return zC||=Object.assign({"./svg/apply-transform.svg":TS,"./svg/camera-dslr.svg":ES,"./svg/camera-frames.svg":DS,"./svg/camera-property.svg":OS,"./svg/camera.svg":kS,"./svg/chevron-down.svg":AS,"./svg/chevron-left.svg":jS,"./svg/chevron-right.svg":MS,"./svg/clock.svg":NS,"./svg/close.svg":PS,"./svg/copy-to-camera.svg":FS,"./svg/copy-to-viewport.svg":IS,"./svg/cursor.svg":LS,"./svg/duplicate.svg":RS,"./svg/export-tab.svg":zS,"./svg/export.svg":BS,"./svg/eye-off.svg":VS,"./svg/eye.svg":HS,"./svg/folder-open.svg":US,"./svg/frame-plus.svg":WS,"./svg/frame.svg":GS,"./svg/grip.svg":KS,"./svg/help.svg":qS,"./svg/image.svg":JS,"./svg/keyframe.svg":YS,"./svg/lens.svg":XS,"./svg/light.svg":ZS,"./svg/link.svg":QS,"./svg/lock-open.svg":$S,"./svg/lock.svg":eC,"./svg/mask-all.svg":tC,"./svg/mask-selected.svg":nC,"./svg/mask.svg":rC,"./svg/menu.svg":iC,"./svg/move.svg":aC,"./svg/package-open.svg":oC,"./svg/package.svg":sC,"./svg/paste.svg":cC,"./svg/pause.svg":lC,"./svg/pie-menu.svg":uC,"./svg/pin.svg":dC,"./svg/pivot.svg":fC,"./svg/play.svg":pC,"./svg/plus.svg":mC,"./svg/redo.svg":hC,"./svg/reference-preview-off.svg":gC,"./svg/reference-preview-on.svg":_C,"./svg/reference-tool.svg":vC,"./svg/reference.svg":yC,"./svg/render-box.svg":bC,"./svg/reset.svg":xC,"./svg/ruler.svg":SC,"./svg/save.svg":CC,"./svg/scene.svg":wC,"./svg/scrub.svg":TC,"./svg/selection-clear.svg":EC,"./svg/settings.svg":DC,"./svg/skip-back.svg":OC,"./svg/skip-forward.svg":kC,"./svg/slash-circle.svg":AC,"./svg/splat-edit.svg":jC,"./svg/trash.svg":MC,"./svg/undo.svg":NC,"./svg/view.svg":PC,"./svg/viewport.svg":FC,"./svg/zoom-out.svg":IC,"./svg/zoom.svg":LC}),zC}function UC(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function WC(e){let t=e.match(/\/([^/]+)\.svg$/i);return t?t[1]:null}function GC(e=``){let t=e.replace(/\s+xmlns(?::[\w-]+)?=(["']).*?\1/gi,``).replace(/\s+width=(["']).*?\1/gi,``).replace(/\s+height=(["']).*?\1/gi,``).replace(/\s+viewBox=(["']).*?\1/gi,``).replace(/\s+aria-hidden=(["']).*?\1/gi,``).replace(/\s+focusable=(["']).*?\1/gi,``),n=t.match(/\sstroke-width=(["'])(.*?)\1/i)?.[2]?.trim()||`1.8`;return t=t.replace(/\sstroke-width=(["']).*?\1/gi,` stroke-width="var(--workbench-icon-stroke-width, ${UC(n)})"`),/\sfill=/i.test(t)||(t+=` fill="none"`),/\sstroke=/i.test(t)||(t+=` stroke="currentColor"`),/\sstroke-width=/i.test(t)||(t+=` stroke-width="var(--workbench-icon-stroke-width, 1.8)"`),/\sstroke-linecap=/i.test(t)||(t+=` stroke-linecap="round"`),/\sstroke-linejoin=/i.test(t)||(t+=` stroke-linejoin="round"`),t.trim()}function KC(e,t){let n=t.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);if(!n)return``;let[,r,i]=n,a=r.match(/\sviewBox=(["'])(.*?)\1/i)?.[2]||`0 0 24 24`,o=GC(r);return`<symbol id="${UC(e)}" viewBox="${UC(a)}"${o?` ${o}`:``}>${i.trim()}</symbol>`}function qC(){return`<svg xmlns="http://www.w3.org/2000/svg">${Object.entries(HC()).map(([e,t])=>[WC(e),t]).filter(([e,t])=>!!e&&typeof t==`string`).map(([e,t])=>KC(e,t)).filter(Boolean).join(``)}</svg>`}function JC(){if(VC||typeof document>`u`)return;BC||=qC();let e=document.getElementById(RC);e||(e=document.createElement(`div`),e.id=RC,e.setAttribute(`aria-hidden`,`true`),e.style.position=`absolute`,e.style.width=`0`,e.style.height=`0`,e.style.overflow=`hidden`,e.style.pointerEvents=`none`,e.style.opacity=`0`,e.innerHTML=BC,document.body.prepend(e)),VC=!0}function YC({name:e,className:t=``,size:n=16,strokeWidth:r=1.8}){JC();let i=[`workbench-icon`];return t&&i.push(t),M`
		<svg
			class=${i.join(` `)}
			width=${n}
			height=${n}
			viewBox="0 0 24 24"
			style=${{"--workbench-icon-stroke-width":String(r)}}
			aria-hidden="true"
			focusable="false"
		>
			<use href=${`#${e||`camera-frames`}`}></use>
		</svg>
	`}function XC(e,t){for(var n in t)e[n]=t[n];return e}function ZC(e,t){for(var n in e)if(n!==`__source`&&!(n in t))return!0;for(var r in t)if(r!==`__source`&&e[r]!==t[r])return!0;return!1}function QC(e,t){this.props=e,this.context=t}(QC.prototype=new w).isPureReactComponent=!0,QC.prototype.shouldComponentUpdate=function(e,t){return ZC(this.props,e)||ZC(this.state,t)};var $C=t.__b;t.__b=function(e){e.type&&e.type.__f&&e.ref&&(e.props.ref=e.ref,e.ref=null),$C&&$C(e)},typeof Symbol<`u`&&Symbol.for;var ew=t.__e;t.__e=function(e,t,n,r){if(e.then){for(var i,a=t;a=a.__;)if((i=a.__c)&&i.__c)return t.__e??(t.__e=n.__e,t.__k=n.__k),i.__c(e,t)}ew(e,t,n,r)};var tw=t.unmount;function nw(e,t,n){return e&&(e.__c&&e.__c.__H&&(e.__c.__H.__.forEach(function(e){typeof e.__c==`function`&&e.__c()}),e.__c.__H=null),(e=XC({},e)).__c!=null&&(e.__c.__P===n&&(e.__c.__P=t),e.__c.__e=!0,e.__c=null),e.__k=e.__k&&e.__k.map(function(e){return nw(e,t,n)})),e}function rw(e,t,n){return e&&n&&(e.__v=null,e.__k=e.__k&&e.__k.map(function(e){return rw(e,t,n)}),e.__c&&e.__c.__P===t&&(e.__e&&n.appendChild(e.__e),e.__c.__e=!0,e.__c.__P=n)),e}function iw(){this.__u=0,this.o=null,this.__b=null}function aw(e){var t=e.__&&e.__.__c;return t&&t.__a&&t.__a(e)}function ow(){this.i=null,this.l=null}t.unmount=function(e){var t=e.__c;t&&(t.__z=!0),t&&t.__R&&t.__R(),t&&32&e.__u&&(e.type=null),tw&&tw(e)},(iw.prototype=new w).__c=function(e,t){var n=t.__c,r=this;r.o??=[],r.o.push(n);var i=aw(r.__v),a=!1,o=function(){a||r.__z||(a=!0,n.__R=null,i?i(c):c())};n.__R=o;var s=n.__P;n.__P=null;var c=function(){if(!--r.__u){if(r.state.__a){var e=r.state.__a;r.__v.__k[0]=rw(e,e.__c.__P,e.__c.__O)}var t;for(r.setState({__a:r.__b=null});t=r.o.pop();)t.__P=s,t.forceUpdate()}};r.__u++||32&t.__u||r.setState({__a:r.__b=r.__v.__k[0]}),e.then(o,o)},iw.prototype.componentWillUnmount=function(){this.o=[]},iw.prototype.render=function(e,t){if(this.__b){if(this.__v.__k){var n=document.createElement(`div`),r=this.__v.__k[0].__c;this.__v.__k[0]=nw(this.__b,n,r.__O=r.__P)}this.__b=null}var i=t.__a&&x(C,null,e.fallback);return i&&(i.__u&=-33),[x(C,null,t.__a?null:e.children),i]};var sw=function(e,t,n){if(++n[1]===n[0]&&e.l.delete(t),e.props.revealOrder&&(e.props.revealOrder[0]!==`t`||!e.l.size))for(n=e.i;n;){for(;n.length>3;)n.pop()();if(n[1]<n[0])break;e.i=n=n[2]}};function cw(e){return this.getChildContext=function(){return e.context},e.children}function lw(e){var t=this,n=e.h;if(t.componentWillUnmount=function(){me(null,t.v),t.v=null,t.h=null},t.h&&t.h!==n&&t.componentWillUnmount(),!t.v){for(var r=t.__v;r!==null&&!r.__m&&r.__!==null;)r=r.__;t.h=n,t.v={nodeType:1,parentNode:n,childNodes:[],__k:{__m:r.__m},contains:function(){return!0},namespaceURI:n.namespaceURI,insertBefore:function(e,n){this.childNodes.push(e),t.h.insertBefore(e,n)},removeChild:function(e){this.childNodes.splice(this.childNodes.indexOf(e)>>>1,1),t.h.removeChild(e)}}}me(x(cw,{context:t.context},e.__v),t.v)}function uw(e,t){var n=x(lw,{__v:e,h:t});return n.containerInfo=t,n}(ow.prototype=new w).__a=function(e){var t=this,n=aw(t.__v),r=t.l.get(e);return r[0]++,function(i){var a=function(){t.props.revealOrder?(r.push(i),sw(t,e,r)):i()};n?n(a):a()}},ow.prototype.render=function(e){this.i=null,this.l=new Map;var t=j(e.children);e.revealOrder&&e.revealOrder[0]===`b`&&t.reverse();for(var n=t.length;n--;)this.l.set(t[n],this.i=[1,0,this.i]);return e.children},ow.prototype.componentDidUpdate=ow.prototype.componentDidMount=function(){var e=this;this.l.forEach(function(t,n){sw(e,n,t)})};var dw=typeof Symbol<`u`&&Symbol.for&&Symbol.for(`react.element`)||60103,fw=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,pw=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,mw=/[A-Z0-9]/g,hw=typeof document<`u`,gw=function(e){return(typeof Symbol<`u`&&typeof Symbol()==`symbol`?/fil|che|rad/:/fil|che|ra/).test(e)};w.prototype.isReactComponent=!0,[`componentWillMount`,`componentWillReceiveProps`,`componentWillUpdate`].forEach(function(e){Object.defineProperty(w.prototype,e,{configurable:!0,get:function(){return this[`UNSAFE_`+e]},set:function(t){Object.defineProperty(this,e,{configurable:!0,writable:!0,value:t})}})});var _w=t.event;t.event=function(e){return _w&&(e=_w(e)),e.persist=function(){},e.isPropagationStopped=function(){return this.cancelBubble},e.isDefaultPrevented=function(){return this.defaultPrevented},e.nativeEvent=e};var vw={configurable:!0,get:function(){return this.class}},yw=t.vnode;t.vnode=function(e){typeof e.type==`string`&&function(e){var t=e.props,n=e.type,r={},i=n.indexOf(`-`)==-1;for(var a in t){var o=t[a];if(!(a===`value`&&`defaultValue`in t&&o==null||hw&&a===`children`&&n===`noscript`||a===`class`||a===`className`)){var s=a.toLowerCase();a===`defaultValue`&&`value`in t&&t.value==null?a=`value`:a===`download`&&!0===o?o=``:s===`translate`&&o===`no`?o=!1:s[0]===`o`&&s[1]===`n`?s===`ondoubleclick`?a=`ondblclick`:s!==`onchange`||n!==`input`&&n!==`textarea`||gw(t.type)?s===`onfocus`?a=`onfocusin`:s===`onblur`?a=`onfocusout`:pw.test(a)&&(a=s):s=a=`oninput`:i&&fw.test(a)?a=a.replace(mw,`-$&`).toLowerCase():o===null&&(o=void 0),s===`oninput`&&r[a=s]&&(a=`oninputCapture`),r[a]=o}}n==`select`&&(r.multiple&&Array.isArray(r.value)&&(r.value=j(t.children).forEach(function(e){e.props.selected=r.value.indexOf(e.props.value)!=-1})),r.defaultValue!=null&&(r.value=j(t.children).forEach(function(e){e.props.selected=r.multiple?r.defaultValue.indexOf(e.props.value)!=-1:r.defaultValue==e.props.value}))),t.class&&!t.className?(r.class=t.class,Object.defineProperty(r,"className",vw)):t.className&&(r.class=r.className=t.className),e.props=r}(e),e.$$typeof=dw,yw&&yw(e)};var bw=t.__r;t.__r=function(e){bw&&bw(e),e.__c};var xw=t.diffed;t.diffed=function(e){xw&&xw(e);var t=e.props,n=e.__e;n!=null&&e.type===`textarea`&&`value`in t&&t.value!==n.value&&(n.value=t.value==null?``:t.value)};var Sw=10,Cw=10;function ww(e,t,n){let r=e.left,i=e.top;n===`left`?(r=e.left-t.width-Sw,i=e.top+(e.height-t.height)*.5):n===`top`?(r=e.left+(e.width-t.width)*.5,i=e.top-t.height-Sw):n===`bottom`?(r=e.left+(e.width-t.width)*.5,i=e.bottom+Sw):(r=e.right+Sw,i=e.top+(e.height-t.height)*.5);let a=window.innerWidth-t.width-Cw,o=window.innerHeight-t.height-Cw;return{left:Math.min(Math.max(r,Cw),Math.max(Cw,a)),top:Math.min(Math.max(i,Cw),Math.max(Cw,o))}}function Tw({title:e,description:t=``,shortcut:n=``,placement:r=`right`}){let i=je(null),a=je(null),[o,s]=De(!1),[c,l]=De({left:`${Cw}px`,top:`${Cw}px`,visibility:`hidden`});return!e&&!t&&!n?null:(ke(()=>{let e=i.current?.parentElement;if(!e)return;let t=()=>s(!0),n=()=>s(!1),r=()=>s(!1),a=()=>s(!1),o=()=>s(!0),c=t=>{e.contains(t.relatedTarget)||s(!1)},l=e=>{e.key===`Escape`&&s(!1)};return e.addEventListener(`mouseenter`,t),e.addEventListener(`mouseleave`,n),e.addEventListener(`pointerdown`,r,!0),e.addEventListener(`click`,a,!0),e.addEventListener(`focusin`,o),e.addEventListener(`focusout`,c),e.addEventListener(`keydown`,l),()=>{e.removeEventListener(`mouseenter`,t),e.removeEventListener(`mouseleave`,n),e.removeEventListener(`pointerdown`,r,!0),e.removeEventListener(`click`,a,!0),e.removeEventListener(`focusin`,o),e.removeEventListener(`focusout`,c),e.removeEventListener(`keydown`,l)}},[]),ke(()=>{if(!o)return;let e=()=>{let e=i.current?.parentElement,t=a.current;if(!e||!t)return;let{left:n,top:o}=ww(e.getBoundingClientRect(),t.getBoundingClientRect(),r);l({left:`${n}px`,top:`${o}px`,visibility:`visible`})};return e(),window.addEventListener(`resize`,e),window.addEventListener(`scroll`,e,!0),()=>{window.removeEventListener(`resize`,e),window.removeEventListener(`scroll`,e,!0)}},[o,r]),M`
		<span ref=${i} class="workbench-tooltip-anchor" aria-hidden="true"></span>
		${o&&typeof document<`u`?uw(M`
						<span
							ref=${a}
							class="workbench-tooltip workbench-tooltip--visible"
							style=${c}
						>
							${e&&M`<strong class="workbench-tooltip__title">${e}</strong>`}
							${t&&M`
									<span class="workbench-tooltip__description"
										>${t}</span
									>
								`}
							${n&&M`
									<span class="workbench-tooltip__shortcut">
										<kbd>${n}</kbd>
									</span>
								`}
						</span>
					`,document.body):null}
	`)}function Ew({icon:e,title:t,children:n}){return M`
		<div class="section-heading">
			<div class="section-heading__title">
				${e&&M`
						<span class="section-heading__icon">
							<${YC} name=${e} size=${14} />
						</span>
					`}
				<h2>${t}</h2>
			</div>
			${n&&M`<div class="section-heading__meta">${n}</div>`}
		</div>
	`}function Dw({tabs:e,activeTab:t,setActiveTab:n,ariaLabel:r,iconOnly:i=!1}){return M`
		<div class="workbench-tabs" role="tablist" aria-label=${r}>
			${e.map(e=>M`
					<button
						key=${e.id}
						type="button"
						role="tab"
						aria-selected=${t===e.id}
						class=${t===e.id?`workbench-tab workbench-tab--active workbench-tab--tooltip`:`workbench-tab workbench-tab--tooltip`}
						onClick=${()=>n(e.id)}
					>
						<span class="workbench-tab__content">
							${e.icon&&M`
								<span class="workbench-tab__icon">
									<${YC}
										name=${e.icon}
										size=${i?17:14}
									/>
								</span>
							`}
							${!i&&M`<span>${e.label}</span>`}
						</span>
						<${Tw}
							title=${e.tooltip?.title??e.label}
							description=${e.tooltip?.description??``}
							shortcut=${e.tooltip?.shortcut??``}
							placement=${e.tooltip?.placement??`bottom`}
						/>
					</button>
				`)}
		</div>
	`}function Ow({icon:e=`menu`,label:t,items:n=[],children:r,tooltip:i=null,panelPlacement:a=`down`}){let o=n.filter(Boolean),[s,c]=De(!1),l=je(null),u=je(null),d=je(null),[f,p]=De({left:`10px`,top:`10px`,visibility:`hidden`});ke(()=>{if(!s)return;let e=e=>{let t=e.target;!l.current?.contains(t)&&!d.current?.contains(t)&&c(!1)},t=e=>{let t=e.target;!l.current?.contains(t)&&!d.current?.contains(t)&&c(!1)},n=e=>{e.key===`Escape`&&c(!1)};return document.addEventListener(`pointerdown`,e,!0),document.addEventListener(`focusin`,t),document.addEventListener(`keydown`,n),()=>{document.removeEventListener(`pointerdown`,e,!0),document.removeEventListener(`focusin`,t),document.removeEventListener(`keydown`,n)}},[s]),ke(()=>{if(!s)return;let e=()=>{let e=u.current,t=d.current;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=n.left+n.width*.5-r.width*.5,o=Math.max(10,window.innerWidth-r.width-10),s=Math.min(Math.max(i,10),o),c=a===`up`?n.top-r.height-10:n.bottom+10,l=Math.max(10,window.innerHeight-r.height-10),f=Math.min(Math.max(c,10),l);p({left:`${s}px`,top:`${f}px`,visibility:`visible`})};return e(),window.addEventListener(`resize`,e),window.addEventListener(`scroll`,e,!0),()=>{window.removeEventListener(`resize`,e),window.removeEventListener(`scroll`,e,!0)}},[s,a]);let m=s&&typeof document<`u`?uw(M`
						<div
							ref=${d}
							class=${a===`up`?`workbench-menu__panel workbench-menu__panel--up`:`workbench-menu__panel`}
							role="menu"
							style=${{left:f.left,top:f.top,visibility:f.visibility}}
						>
							${r}
							${o.map(e=>M`
									<button
										key=${e.id??e.label}
										type="button"
										role="menuitem"
										class=${e.destructive?`workbench-menu__item workbench-menu__item--destructive`:`workbench-menu__item`}
										onClick=${()=>{c(!1),e.onClick?.()}}
									>
										${e.icon&&M`
												<span class="workbench-menu__item-icon">
													<${YC} name=${e.icon} size=${14} />
												</span>
											`}
										<span class="workbench-menu__item-label">${e.label}</span>
										${e.shortcut&&M`
												<span class="workbench-menu__item-shortcut" aria-hidden="true">
													<kbd>${e.shortcut}</kbd>
												</span>
											`}
									</button>
								`)}
						</div>
					`,document.body):null;return M`
		<div
			ref=${l}
			class=${s?`workbench-menu is-open`:`workbench-menu`}
		>
			<button
				ref=${u}
				type="button"
				class="workbench-menu__trigger workbench-menu__trigger--tooltip"
				aria-label=${t}
				aria-haspopup="menu"
				aria-expanded=${s}
				onClick=${e=>{e.stopPropagation(),c(e=>!e)}}
			>
				<${YC} name=${e} size=${16} />
				<${Tw}
					title=${i?.title??t}
					description=${i?.description??``}
					shortcut=${i?.shortcut??``}
					placement=${i?.placement??`right`}
				/>
			</button>
			${m}
		</div>
	`}function Q({icon:e,label:t,active:n=!1,compact:r=!1,disabled:i=!1,className:a=``,id:o,iconSize:s=15,iconStrokeWidth:c=1.8,onClick:l,type:u=`button`,tooltip:d=null}){return M`
		<button
			id=${o}
			type=${u}
			class=${[`button`,`button--icon`,`button--tooltip`,r?`button--compact`:``,n?`button--primary`:``,a].filter(Boolean).join(` `)}
			aria-label=${t}
			disabled=${i}
			onPointerDown=${e=>{e.stopPropagation()}}
			onClick=${e=>{e.stopPropagation(),l?.(e)}}
		>
			<${YC}
				name=${e}
				size=${s}
				strokeWidth=${c}
			/>
			<${Tw}
				title=${d?.title??t}
				description=${d?.description??``}
				shortcut=${d?.shortcut??``}
				placement=${d?.placement??`bottom`}
			/>
		</button>
	`}function kw({icon:e,label:t,children:n,open:r=!1,summaryMeta:i=null,summaryActions:a=null,helpSectionId:o=null,onOpenHelp:s=null,onToggle:c=null,className:l=``}){return M`
		<details
			class=${l?`panel-disclosure ${l}`:`panel-disclosure`}
			open=${r}
			onToggle=${e=>c?.(!!e.currentTarget.open)}
		>
			<summary class="panel-disclosure__summary">
				<span class="panel-disclosure__summary-main">
					${e&&M`
							<span class="panel-disclosure__icon">
								<${YC} name=${e} size=${14} />
							</span>
						`}
					<span>${t}</span>
				</span>
				<span class="panel-disclosure__summary-right">
					${o&&typeof s==`function`&&M`
							<button
								type="button"
								class="panel-disclosure__help"
								aria-label="Help"
								onClick=${e=>{e.preventDefault(),e.stopPropagation(),s(o)}}
							>
								<${YC} name="help" size=${18} />
							</button>
						`}
					${i&&M`<span class="panel-disclosure__summary-meta">${i}</span>`}
					${a&&M`
							<span class="panel-disclosure__summary-actions">
								${a}
							</span>
						`}
					<span class="panel-disclosure__chevron">
						<${YC} name="chevron-right" size=${12} />
					</span>
				</span>
			</summary>
			<div class="panel-disclosure__body">${n}</div>
		</details>
	`}function Aw(e,t=!1){let n=e?.nativeEvent??e;return!!t||n?.isComposing===!0||n?.keyCode===229}function jw(e=``){let t=String(e??``).trim();if(!t)return null;let n=t.match(/[+-]?\d+(?:\.(\d+))?/)??t.match(/[+-]?\d*(?:\.(\d+))?/);return n?n[1]?.length??0:null}function Mw(e=null){if(e==null)return null;let t=String(e).trim().toLowerCase();if(!t||t.includes(`e`))return null;let n=t.indexOf(`.`);return n>=0?t.length-n-1:0}function Nw(e,{formatDisplayValue:t=null,template:n=``,step:r=null}={}){if(!Number.isFinite(e))return String(e??``);if(typeof t==`function`)return String(t(e));let i=String(n??``),a=Math.max(jw(i)??0,Mw(r)??0),o=i.trim().startsWith(`+`)&&e>=0,s=Number(e).toFixed(a);return o?`+${s}`:s}function $(e){e.stopPropagation()}function Pw(e){e.preventDefault(),e.stopPropagation()}function Fw(e){return(e.ctrlKey||e.metaKey)&&(e.code===`KeyZ`||e.code===`KeyY`)}function Iw(e){Fw(e)||$(e)}var Lw={onPointerDown:$,onClick:$,onWheel:Pw,onKeyDown:Iw},Rw=Object.freeze({normal:1,shift:.25,alt:.1,altShift:.025}),zw=12,Bw=.001,Vw=2.4;function Hw(e){let t=Number(e);if(!Number.isFinite(t))return 0;let n=Math.sign(t),r=Math.min(Math.abs(t),Vw);return r>=Bw?n*r:0}function Uw({deltaPixels:e,elapsedMs:t}){let n=Math.max(1,Number(t)||0);return Hw(Number(e)/n)}function Ww({currentVelocityPxPerMs:e,movementVelocityPxPerMs:t}){let n=Hw(e),r=Hw(t);if(!n)return r;if(!r)return n;if(Math.sign(n)===Math.sign(r))return r;let i=n+r;return Math.sign(i)===Math.sign(n)?Hw(i):0}function Gw({value:e,title:t=``,className:n=``}){return M`
		<span class=${`numeric-unit__label ${n}`.trim()} aria-label=${t||e}
			>${e}</span
		>
	`}var Kw=132,qw=46,Jw=Kw/2,Yw=16,Xw=90/qw;function Zw(e=null){return{...Rw,...e??{}}}function Qw(e){let t=Number(e);if(!Number.isFinite(t))return 0;let n=((t+180)%360+360)%360-180;return n===-180?180:n}function $w(e){return Math.max(-1,Math.min(1,e))}function eT(e,t){let n=Number(e)*Math.PI/180,r=Number(t)*Math.PI/180,i=Math.cos(r);return{x:Math.sin(n)*i,y:Math.sin(r),z:Math.cos(n)*i}}function tT(e){let t=Math.hypot(e.x,e.y,e.z);return!Number.isFinite(t)||t<=1e-8?{x:0,y:0,z:1}:{x:e.x/t,y:e.y/t,z:e.z/t}}function nT(e,t){let n=t*Math.PI/180,r=Math.cos(n),i=Math.sin(n);return{x:e.x*r+e.z*i,y:e.y,z:-e.x*i+e.z*r}}function rT(e,t){let n=t*Math.PI/180,r=Math.cos(n),i=Math.sin(n);return{x:e.x,y:e.y*r-e.z*i,z:e.y*i+e.z*r}}function iT(e){let t=tT(e);return{azimuthDeg:Qw(Math.atan2(t.x,t.z)*180/Math.PI),elevationDeg:Math.asin($w(t.y))*180/Math.PI}}function aT(e,t,n){let r=Qw(e-n)*Math.PI/180,i=Number(t)*Math.PI/180,a=Math.cos(i);return{x:Jw+Math.sin(r)*a*qw,y:Jw-Math.sin(i)*qw,isFrontHemisphere:Math.cos(r)*a>=0,relativeAzimuthDeg:Qw(e-n)}}function oT(e,t,n,r){return iT(rT(nT(eT(e,t),n*Xw),r*Xw))}function sT({value:e,inputMode:t=`decimal`,onCommit:n,onScrubDelta:r=null,onScrubStart:i=null,onScrubEnd:a=null,onInteractStart:o=null,onEditStart:s=null,onEditEnd:c=null,controller:l=null,historyLabel:u=``,formatDisplayValue:d=null,scrubModifiers:f=null,scrubHandleSide:p=`auto`,scrubStartValue:m=null,...h}){let g=String(e),[_,v]=De(g),[y,b]=De(!1),[x,S]=De(!1),[C,w]=De(p===`start`?`start`:`end`),T=je(null),E=je(null),D=je(!1),O=Zw(f);ke(()=>{!y&&!x&&v(g)},[g,y,x]),ke(()=>{if(p!==`auto`){w(p===`start`?`start`:`end`);return}if(!E.current)return;let e=globalThis.getComputedStyle(E.current).getPropertyValue(`text-align`).trim().toLowerCase(),t=e===`right`||e===`end`?`start`:`end`;w(e=>e===t?e:t)},[p]);function k(e=`cancel`){v(g),b(!1),c?.(e)}function A(){requestAnimationFrame(()=>{E.current?.focus?.({preventScroll:!0}),E.current?.select?.()})}function ee(e){let t=String(e??``).trim();if(t===``){k(`cancel`);return}n?.(t),b(!1),c?.(`commit`)}function te(e){let t=Number(e);return Number.isFinite(t)?t:null}function j(e){let t=e,n=te(h.min),r=te(h.max);return n!==null&&(t=Math.max(n,t)),r!==null&&(t=Math.min(r,t)),t}function ne(e){return Nw(e,{formatDisplayValue:d,template:g,step:h.step})}function re(e){return e.altKey&&e.shiftKey?O.altShift:e.altKey?O.alt:e.shiftKey?O.shift:O.normal}function ie(){let e=Number(h.step);return Number.isFinite(e)&&e>0?e:1}function ae(){let e=Number(globalThis.innerWidth);return Number.isFinite(e)&&e>0?e:null}function oe(e){let t=Number(e?.timeStamp);if(Number.isFinite(t)&&t>0)return t;let n=globalThis.performance?.now?.();return Number.isFinite(n)?n:Date.now()}function se(e=`commit`){let t=T.current;if(t){if(t.edgeHoldFrameId&&=(globalThis.cancelAnimationFrame(t.edgeHoldFrameId),0),t.handle.removeEventListener(`pointermove`,t.onMove),t.handle.removeEventListener(`pointerup`,t.onUp),t.handle.removeEventListener(`pointercancel`,t.onCancel),t.handle.releasePointerCapture?.(t.pointerId),T.current=null,S(!1),e===`cancel`){l?.()?.cancelHistoryTransaction?.(),a?.(`cancel`);return}l?.()?.commitHistoryTransaction?.(u),a?.(`commit`)}}function ce(e){$(e),e.preventDefault(),o?.();let t=te(m??g);if(t===null)return;i?.(),l?.()?.beginHistoryTransaction?.(u),b(!1),S(!0);let a=e.currentTarget;a.setPointerCapture?.(e.pointerId);let s={pointerId:e.pointerId,handle:a,lastClientX:e.clientX,lastMoveTimestamp:oe(e),appliedValue:t,edgeHoldDirection:0,edgeHoldVelocityPxPerMs:0,edgeHoldMultiplier:1,edgeHoldLastTimestamp:0,edgeHoldFrameId:0,onMove:null,onUp:null,onCancel:null},c=e=>{if(!Number.isFinite(e)||Math.abs(e)<=1e-8)return;let t=j(s.appliedValue+e),i=ne(t),a=t-s.appliedValue;!Number.isFinite(a)||Math.abs(a)<=1e-8||(s.appliedValue=t,v(i),r?r(a,t):n?.(i))},d=()=>{s.edgeHoldFrameId&&globalThis.cancelAnimationFrame(s.edgeHoldFrameId),s.edgeHoldDirection=0,s.edgeHoldVelocityPxPerMs=0,s.edgeHoldFrameId=0,s.edgeHoldLastTimestamp=0},f=e=>{if(T.current!==s||!s.edgeHoldDirection||!s.edgeHoldVelocityPxPerMs){s.edgeHoldFrameId=0;return}s.edgeHoldLastTimestamp||=e;let t=Math.max(0,e-s.edgeHoldLastTimestamp);s.edgeHoldLastTimestamp=e,c(s.edgeHoldVelocityPxPerMs*t*ie()*s.edgeHoldMultiplier),s.edgeHoldFrameId=globalThis.requestAnimationFrame(f)},p=(e,t)=>{let n=Hw(e);if(!n){d();return}let r=Math.sign(n),i=s.edgeHoldDirection===r&&s.edgeHoldFrameId;s.edgeHoldDirection&&!i&&d(),s.edgeHoldDirection=r,s.edgeHoldVelocityPxPerMs=n,s.edgeHoldMultiplier=t,!i&&(s.edgeHoldLastTimestamp=0,s.edgeHoldFrameId=globalThis.requestAnimationFrame(f))},h=e=>{if(e.pointerId!==s.pointerId)return;$(e),e.preventDefault();let t=e.clientX,n=t-s.lastClientX,r=oe(e),i=Math.max(1,r-s.lastMoveTimestamp),a=ae(),o=t<=zw,l=a!==null&&t>=a-zw,u=re(e);if(Math.abs(n)<=0){s.lastMoveTimestamp=r,s.edgeHoldDirection&&(s.edgeHoldMultiplier=u);return}let f=Uw({deltaPixels:n,elapsedMs:i}),m=s.edgeHoldDirection,h=Math.sign(n);if(s.lastClientX=t,s.lastMoveTimestamp=r,m&&h!==m){let e=Ww({currentVelocityPxPerMs:s.edgeHoldVelocityPxPerMs,movementVelocityPxPerMs:f});e&&Math.sign(e)===m?p(e,u):d();return}c(n*ie()*u),n<0&&o||n>0&&l?p(f,u):d()},_=t=>{t.pointerId===e.pointerId&&($(t),t.preventDefault(),se(`commit`))},y=t=>{t.pointerId===e.pointerId&&($(t),t.preventDefault(),se(`cancel`))};s.onMove=h,s.onUp=_,s.onCancel=y,T.current=s,a.addEventListener(`pointermove`,h),a.addEventListener(`pointerup`,_),a.addEventListener(`pointercancel`,y)}return M`
		<div
			class=${x?`numeric-scrub numeric-scrub--handle-${C} is-scrubbing`:`numeric-scrub numeric-scrub--handle-${C}`}
			data-history-scope="app"
		>
			<input
				ref=${E}
				...${h}
				type="text"
				inputMode=${t}
				spellcheck="false"
				autocomplete="off"
				data-draft-editing=${y?`true`:`false`}
				value=${y||x?_:g}
				onFocus=${e=>{$(e),o?.(),s?.(),b(!0),v(String(e.currentTarget.value??g))}}
				onInput=${e=>{$(e),b(!0),v(e.currentTarget.value)}}
				onBlur=${e=>{if(D.current){D.current=!1,b(!1);return}ee(e.currentTarget.value)}}
				onChange=${$}
				onPointerDown=${e=>{$(e),e.preventDefault(),o?.(),b(!0),v(String(E.current?.value??g)),A()}}
				onClick=${$}
				onWheel=${Pw}
				onKeyDown=${e=>{if(!Fw(e)){if($(e),e.key===`Enter`){e.preventDefault(),D.current=!0,ee(e.currentTarget.value),e.currentTarget.blur();return}e.key===`Escape`&&(e.preventDefault(),D.current=!0,k(),e.currentTarget.blur())}}}
			/>
			<button
				type="button"
				class="numeric-scrub__handle"
				tabIndex="-1"
				aria-hidden="true"
				onPointerDown=${ce}
				onClick=${e=>{$(e),e.preventDefault()}}
			>
				<${YC} name="scrub" size=${13} />
			</button>
		</div>
	`}function cT({controller:e=null,historyLabel:t=``,ariaLabel:n=``,step:r=.02,scrubModifiers:i=null,onDelta:a}){let[o,s]=De(!1),c=je(null),l=Zw(i);function u(e){return e.altKey&&e.shiftKey?l.altShift:e.altKey?l.alt:e.shiftKey?l.shift:l.normal}function d(){let e=Number(r);return Number.isFinite(e)&&e>0?e:.02}function f(n=`commit`){let r=c.current;if(r){if(r.surface.removeEventListener(`pointermove`,r.onMove),r.surface.removeEventListener(`pointerup`,r.onUp),r.surface.removeEventListener(`pointercancel`,r.onCancel),r.surface.releasePointerCapture?.(r.pointerId),r.surface.style.setProperty(`--directional-scrub-offset`,`0px`),c.current=null,s(!1),n===`cancel`){e?.()?.cancelHistoryTransaction?.();return}e?.()?.commitHistoryTransaction?.(t)}}function p(n){$(n),n.preventDefault(),e?.()?.beginHistoryTransaction?.(t),s(!0);let r=n.currentTarget;r.setPointerCapture?.(n.pointerId);let i={pointerId:n.pointerId,surface:r,startClientX:n.clientX,appliedDistance:0,onMove:null,onUp:null,onCancel:null},o=e=>{if(e.pointerId!==i.pointerId)return;$(e),e.preventDefault();let t=Math.max(10,Math.min(20,(i.surface.clientWidth-34)*.5)),n=Math.max(-t,Math.min(t,e.clientX-i.startClientX));i.surface.style.setProperty(`--directional-scrub-offset`,`${n}px`);let r=(e.clientX-i.startClientX)*d()*u(e),o=r-i.appliedDistance;!Number.isFinite(o)||Math.abs(o)<=1e-8||(i.appliedDistance=r,a?.(o))},l=e=>{e.pointerId===i.pointerId&&($(e),e.preventDefault(),f(`commit`))},p=e=>{e.pointerId===i.pointerId&&($(e),e.preventDefault(),f(`cancel`))};i.onMove=o,i.onUp=l,i.onCancel=p,c.current=i,r.addEventListener(`pointermove`,o),r.addEventListener(`pointerup`,l),r.addEventListener(`pointercancel`,p)}return M`
		<div
			class=${o?`directional-scrub is-scrubbing`:`directional-scrub`}
			data-history-scope="app"
		>
			<button
				type="button"
				class="directional-scrub__surface"
				aria-label=${n}
				onPointerDown=${p}
				onClick=${e=>{$(e),e.preventDefault()}}
			>
				<span class="directional-scrub__chevron directional-scrub__chevron--start">
					<${YC} name="chevron-left" size=${16} />
				</span>
				<span class="directional-scrub__track" aria-hidden="true"></span>
				<span class="directional-scrub__thumb" aria-hidden="true">
					<span class="directional-scrub__thumb-bar"></span>
				</span>
				<span class="directional-scrub__chevron directional-scrub__chevron--end">
					<${YC} name="chevron-right" size=${16} />
				</span>
			</button>
		</div>
	`}function lT({controller:e,azimuthDeg:t,elevationDeg:n,viewAzimuthDeg:r=0,historyLabel:i=`lighting.model.direction`,onLiveChange:a}){let[o,s]=De(!1),[c,l]=De(r),u=je(null),d=je(r);ke(()=>{d.current=r,l(r)},[r]),ke(()=>{let t=0,n=()=>{let r=e?.()?.getActiveCameraHeadingDeg?.();if(Number.isFinite(r)){let e=Qw(r+180);Math.abs(Qw(e-d.current))>=.1&&(d.current=e,l(e))}t=globalThis.requestAnimationFrame(n)};return t=globalThis.requestAnimationFrame(n),()=>{globalThis.cancelAnimationFrame(t)}},[e]);let f=aT(t,n,c),p=`M ${Jw} ${Jw} L ${f.x} ${f.y}`,m=f.isFrontHemisphere?null:M`
				<path
					d=${p}
					class="lighting-direction-control__ray lighting-direction-control__ray--back"
				/>
				<circle
					cx=${f.x}
					cy=${f.y}
					r="5"
					class="lighting-direction-control__handle lighting-direction-control__handle--back"
				/>
			`,h=f.isFrontHemisphere?M`
				<path d=${p} class="lighting-direction-control__ray" />
				<circle
					cx=${f.x}
					cy=${f.y}
					r="6"
					class="lighting-direction-control__handle"
				/>
			`:null;function g(t=`commit`){let n=u.current;if(n){if(n.target.removeEventListener(`pointermove`,n.onMove),n.target.removeEventListener(`pointerup`,n.onUp),n.target.removeEventListener(`pointercancel`,n.onCancel),n.target.releasePointerCapture?.(n.pointerId),u.current=null,s(!1),t===`cancel`){e?.()?.cancelHistoryTransaction?.();return}e?.()?.commitHistoryTransaction?.(i)}}function _(t){$(t),t.preventDefault();let r=t.currentTarget;e?.()?.beginHistoryTransaction?.(i),r.setPointerCapture?.(t.pointerId),s(!0);let o={pointerId:t.pointerId,target:r,previousClientX:t.clientX,previousClientY:t.clientY,relativeAzimuthDeg:f.relativeAzimuthDeg,elevationDeg:n,onMove:null,onUp:null,onCancel:null},c=e=>{if(e.pointerId!==o.pointerId)return;$(e),e.preventDefault();let t=e.clientX-o.previousClientX,n=e.clientY-o.previousClientY;o.previousClientX=e.clientX,o.previousClientY=e.clientY;let r=oT(o.relativeAzimuthDeg,o.elevationDeg,t,n);o.relativeAzimuthDeg=r.azimuthDeg,o.elevationDeg=r.elevationDeg,a?.({azimuthDeg:Qw(r.azimuthDeg+d.current),elevationDeg:r.elevationDeg})},l=e=>{e.pointerId===o.pointerId&&($(e),e.preventDefault(),g(`commit`))},p=e=>{e.pointerId===o.pointerId&&($(e),e.preventDefault(),g(`cancel`))};o.onMove=c,o.onUp=l,o.onCancel=p,u.current=o,r.addEventListener(`pointermove`,c),r.addEventListener(`pointerup`,l),r.addEventListener(`pointercancel`,p)}return M`
		<div class="lighting-direction-control">
			<button
				type="button"
				class=${o?`lighting-direction-control__surface is-dragging`:`lighting-direction-control__surface`}
				onPointerDown=${_}
			>
				<svg
					viewBox=${`0 0 ${Kw} ${Kw}`}
					class="lighting-direction-control__svg"
					aria-hidden="true"
				>
					${m}
					<circle
						cx=${Jw}
						cy=${Jw}
						r=${qw}
						class="lighting-direction-control__sphere"
					/>
					<circle
						cx=${Jw}
						cy=${Jw}
						r=${qw}
						class="lighting-direction-control__occluder"
					/>
					<ellipse
						cx=${Jw}
						cy=${Jw}
						rx=${qw}
						ry=${Yw}
						class="lighting-direction-control__equator"
					/>
					<path
						d=${`M ${Jw} ${Jw-qw} V 112`}
						class="lighting-direction-control__view-axis"
					/>
					<circle
						cx=${Jw}
						cy=${Jw}
						r="3.5"
						class="lighting-direction-control__origin"
					/>
					${h}
				</svg>
			</button>
		</div>
	`}function uT({value:e,onCommit:t,selectOnFocus:n=!1,...r}){let i=String(e??``),[a,o]=De(i),[s,c]=De(!1),l=je(!1),u=je(!1);ke(()=>{s||o(i)},[i,s]);function d(){o(i),c(!1)}function f(e){t?.(String(e??``)),c(!1)}function p(e){if(n){e.preventDefault(),$(e);let t=e.currentTarget;c(!0),o(String(t.value??i)),requestAnimationFrame(()=>{t?.focus?.(),t?.select?.()});return}$(e)}return M`
		<input
			...${r}
			type="text"
			data-draft-editing=${s?`true`:`false`}
			value=${s?a:i}
			onPointerDown=${p}
			onFocus=${e=>{$(e),c(!0),o(String(e.currentTarget.value??i)),n&&requestAnimationFrame(()=>{e.currentTarget?.select?.()})}}
			onInput=${e=>{$(e),c(!0),o(e.currentTarget.value)}}
			onCompositionStart=${e=>{$(e),l.current=!0,c(!0)}}
			onCompositionEnd=${e=>{$(e),l.current=!1,c(!0),o(String(e.currentTarget.value??i))}}
			onBlur=${e=>{if(l.current=!1,u.current){u.current=!1,c(!1);return}f(e.currentTarget.value)}}
			onChange=${$}
			onClick=${$}
			onWheel=${Pw}
			onKeyDown=${e=>{if(!Fw(e)){if(Aw(e,l.current)){$(e);return}if($(e),e.key===`Enter`){e.preventDefault(),u.current=!0,f(e.currentTarget.value),e.currentTarget.blur();return}e.key===`Escape`&&(e.preventDefault(),u.current=!0,d(),e.currentTarget.blur())}}}
		/>
	`}function dT({controller:e,historyLabel:t,onLiveChange:n,...r}){let[i,a]=De(!1);function o(n){$(n),!i&&(e?.()?.beginHistoryTransaction?.(t),a(!0))}function s(){i&&(e?.()?.commitHistoryTransaction?.(t),a(!1))}function c(){i&&(e?.()?.cancelHistoryTransaction?.(),a(!1))}return M`
		<input
			...${r}
			type="range"
			data-history-scope="app"
			onPointerDown=${e=>{o(e)}}
			onInput=${e=>{i?$(e):o(e),n?.(e)}}
			onChange=${e=>{i?$(e):o(e),n?.(e),s()}}
			onPointerUp=${e=>{$(e),s()}}
			onPointerCancel=${e=>{$(e),c()}}
			onBlur=${()=>{s()}}
			onKeyDown=${e=>{Fw(e)||($(e),[`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`Home`,`End`,`PageUp`,`PageDown`].includes(e.key)&&o(e))}}
			onKeyUp=${e=>{Fw(e)||($(e),[`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`Home`,`End`,`PageUp`,`PageDown`].includes(e.key)&&s())}}
			onWheel=${Pw}
		/>
	`}function fT(e,t,{snap:n=!1}={}){let r=Number(t);if(!Number.isFinite(r))return;let i=n?Hm(r):zm(r);e?.(Um(i))}var pT=`scene`,mT=`camera`,hT=`reference`,gT=`export`,_T=`scene-main`,vT=`scene-transform`,yT=`shot-camera`,bT=`shot-camera-properties`,xT=`lighting`,ST=`output-frame`,CT=`reference-presets`,wT=`reference-manager`,TT=`reference-properties`,ET=`export-output`,DT=`export-settings`;function OT(e){return[{id:pT,label:e(`section.scene`),icon:`scene`,tooltip:{title:e(`section.scene`),description:e(`tooltip.tabScene`),placement:`bottom`}},{id:mT,label:e(`section.shotCamera`),icon:`camera-dslr`,tooltip:{title:e(`section.shotCamera`),description:e(`tooltip.tabCamera`),placement:`bottom`}},{id:hT,label:e(`section.referenceImages`),icon:`image`,tooltip:{title:e(`section.referenceImages`),description:e(`tooltip.tabReference`),placement:`bottom`}},{id:gT,label:e(`section.export`),icon:`export-tab`,tooltip:{title:e(`section.export`),description:e(`tooltip.tabExport`),placement:`bottom`}}]}function kT(e){return[{id:_T,tabId:pT,label:e(`section.sceneManager`),icon:`scene`},{id:yT,tabId:mT,label:e(`section.shotCameraManager`),icon:`camera`},{id:bT,tabId:mT,label:e(`section.shotCameraProperties`),icon:`camera-property`},{id:xT,tabId:pT,label:e(`section.lighting`),icon:`light`},{id:vT,tabId:pT,label:e(`section.selectedSceneObject`),icon:`move`},{id:ST,tabId:mT,label:e(`section.outputFrame`),icon:`render-box`},{id:CT,tabId:hT,label:e(`section.referencePresets`),icon:`image`},{id:wT,tabId:hT,label:e(`section.referenceManager`),icon:`reference-tool`},{id:TT,tabId:hT,label:e(`section.referenceProperties`),icon:`reference-tool`},{id:ET,tabId:gT,label:e(`section.output`),icon:`export-tab`},{id:DT,tabId:gT,label:e(`section.exportSettings`),icon:`export-tab`}]}function AT({controller:e,mode:t,store:n,t:r}){let i=t===`camera`,a=r(i?`section.displayZoom`:`section.view`),o=i?Math.round(n.renderBox.viewZoom.value*100):Number(n.viewportEquivalentMmValue.value).toFixed(2),s=i?!!e()?.canFitOutputFrameToSafeArea?.():!1;return M`
		<div class="workbench-tool-rail__popover" role="group" aria-label=${a}>
			<label class="field workbench-tool-rail__popover-field">
				<span>${a}</span>
				<div class="workbench-tool-rail__popover-value">
					<div class="workbench-tool-rail__popover-input">
						<${sT}
							id=${i?`tool-view-zoom`:`tool-viewport-fov`}
							inputMode="decimal"
							min=${i?20:14}
							max=${200}
							step=${i?`1`:`0.01`}
							value=${o}
							controller=${e}
							historyLabel=${i?`output-frame.zoom`:`viewport.lens`}
							onCommit=${t=>i?e()?.setViewZoomPercent?.(t):fT(t=>e()?.setViewportBaseFovX(t),t)}
						/>
					</div>
					<span
						class="workbench-tool-rail__popover-suffix"
						aria-label=${r(i?`unit.percent`:`unit.millimeter`)}
						>${i?`%`:`mm`}</span
					>
				</div>
			</label>
			${!i&&M`
					<p class="workbench-tool-rail__popover-summary">
						${r(`field.viewportFov`)} ${n.viewportFovLabel.value}
					</p>
				`}
			${i&&M`
					<div class="button-row button-row--compact workbench-tool-rail__popover-actions">
						<${Q}
							icon="reset"
							label=${r(`action.fitOutputFrameToSafeArea`)}
							compact=${!0}
							disabled=${!s}
							onClick=${()=>e()?.fitOutputFrameToSafeArea?.()}
						/>
					</div>
				`}
		</div>
	`}function jT({controller:e,hasFrames:t,store:n,t:r}){let i=n.frames.maskMode.value,a=n.frames.maskOpacityPct.value,o=n.frames.maskShape.value,s=n.frames.trajectoryMode.value,c=n.frames.trajectoryNodeMode.value,l=n.frames.trajectoryExportSource.value,u=n.frames.trajectoryEditMode.value,d=n.frames.maskSelectedIds.value??[],f=n.frames.selectedIds.value??[],p=n.frames.activeId.value,m=20-n.frames.count.value,h=d.length>0,g=n.frames.count.value>1,_=g&&s===`spline`&&!!p,v=Math.max(f.length,+!!p),y=n.frames.count.value<20,b=v>0&&m>=v,x=f.length>0||!!p,S=[{value:`bounds`,label:r(`frameMaskShape.bounds`)},{value:`trajectory`,label:r(`frameMaskShape.trajectory`)}],C=[{value:`line`,label:r(`frameTrajectoryMode.line`)},{value:`spline`,label:r(`frameTrajectoryMode.spline`)}],w=[{value:`auto`,label:r(`frameTrajectoryNodeMode.auto`)},{value:`corner`,label:r(`frameTrajectoryNodeMode.corner`)},{value:`mirrored`,label:r(`frameTrajectoryNodeMode.mirrored`)},{value:`free`,label:r(`frameTrajectoryNodeMode.free`)}],T=[{value:`none`,label:r(`trajectorySource.none`)},{value:`center`,label:r(`trajectorySource.center`)},{value:`top-left`,label:r(`trajectorySource.topLeft`)},{value:`top-right`,label:r(`trajectorySource.topRight`)},{value:`bottom-right`,label:r(`trajectorySource.bottomRight`)},{value:`bottom-left`,label:r(`trajectorySource.bottomLeft`)}];return M`
		<div
			class="workbench-tool-rail__popover workbench-tool-rail__popover--mask"
			role="group"
			aria-label=${r(`action.frameTool`)}
		>
			<label class="field workbench-tool-rail__popover-field">
				<span>${r(`section.frames`)}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${Q}
						icon="plus"
						label=${r(`action.newFrame`)}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!y}
						onClick=${()=>e()?.createFrame?.()}
						tooltip=${{title:r(`action.newFrame`),placement:`right`}}
					/>
					<${Q}
						icon="duplicate"
						label=${r(`action.duplicateFrame`)}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!b}
						onClick=${()=>e()?.duplicateSelectedFrames?.(f.length>0?f:null)}
						tooltip=${{title:r(`action.duplicateFrame`),placement:`right`}}
					/>
					<${Q}
						icon="trash"
						label=${r(`action.deleteFrame`)}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!x}
						onClick=${()=>f.length>0?e()?.deleteSelectedFrames?.(f):e()?.deleteActiveFrame?.()}
						tooltip=${{title:r(`action.deleteFrame`),placement:`right`}}
					/>
				</div>
			</label>
			<label class="field workbench-tool-rail__popover-field">
				<span>${r(`section.mask`)}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${Q}
						icon="slash-circle"
						label=${r(`transformMode.none`)}
						active=${i===`off`}
						compact=${!0}
						className="frame-mask-toolbar__button"
						onClick=${()=>e()?.setFrameMaskMode?.(`off`)}
						tooltip=${{title:r(`transformMode.none`),placement:`right`}}
					/>
					<${Q}
						icon="mask-all"
						label=${r(`action.toggleAllFrameMask`)}
						active=${i===`all`}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!t}
						onClick=${()=>e()?.toggleFrameMaskMode?.(`all`)}
						tooltip=${{title:r(`action.toggleAllFrameMask`),description:r(`tooltip.frameMaskAll`),shortcut:`F`,placement:`right`}}
					/>
					<${Q}
						icon="mask-selected"
						label=${r(`action.toggleSelectedFrameMask`)}
						active=${i===`selected`}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!h}
						onClick=${()=>e()?.toggleFrameMaskMode?.(`selected`)}
						tooltip=${{title:r(`action.toggleSelectedFrameMask`),description:r(`tooltip.frameMaskSelected`),shortcut:`Shift+F`,placement:`right`}}
					/>
				</div>
			</label>
			<div class="workbench-tool-rail__popover-grid">
				<label class="field workbench-tool-rail__popover-field">
					<span>${r(`field.frameMaskOpacity`)}</span>
					<div class="workbench-tool-rail__popover-value">
						<div class="workbench-tool-rail__popover-input">
							<${sT}
								id="tool-frame-mask-opacity"
								inputMode="decimal"
								min="0"
								max="100"
								step="1"
								value=${Number(a).toFixed(0)}
								controller=${e}
								disabled=${!t}
								historyLabel="frame.mask-opacity"
								onCommit=${t=>e()?.setFrameMaskOpacity?.(t)}
							/>
						</div>
						<span
							class="workbench-tool-rail__popover-suffix"
							aria-label=${r(`unit.percent`)}
							>%</span
						>
					</div>
				</label>
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${r(`field.frameMaskShape`)}
						<${Tw}
							title=${r(`field.frameMaskShape`)}
							description=${r(`tooltip.frameMaskShapeField`)}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${o}
							onChange=${t=>e()?.setFrameMaskShape?.(t.currentTarget.value)}
						>
							${S.map(e=>M`
									<option value=${e.value}>${e.label}</option>
								`)}
						</select>
					</div>
				</label>
			</div>
			<div class="workbench-tool-rail__popover-mode-row">
				<label class="field workbench-tool-rail__popover-field workbench-tool-rail__popover-mode-field">
					<span class="field-label-tooltip">
						${r(`field.frameTrajectoryMode`)}
						<${Tw}
							title=${r(`field.frameTrajectoryMode`)}
							description=${r(`tooltip.frameTrajectoryModeField`)}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${s}
							disabled=${!t}
							onChange=${t=>e()?.setFrameTrajectoryMode?.(t.currentTarget.value)}
						>
							${C.map(e=>M`
									<option value=${e.value}>${e.label}</option>
								`)}
						</select>
					</div>
				</label>
				<div class="button-row button-row--compact workbench-tool-rail__popover-actions workbench-tool-rail__popover-mode-actions">
					<${Q}
						icon="cursor"
						label=${r(`action.toggleFrameTrajectoryEdit`)}
						active=${u}
						compact=${!0}
						disabled=${!t}
						onClick=${()=>e()?.toggleFrameTrajectoryEditMode?.()}
						tooltip=${{title:r(`action.toggleFrameTrajectoryEdit`),description:r(`tooltip.toggleFrameTrajectoryEdit`),placement:`right`}}
					/>
					<${Q}
						icon="reset"
						label=${r(`action.resetFrameTrajectoryNodeAuto`)}
						compact=${!0}
						disabled=${!_||c===`auto`}
						onClick=${()=>e()?.setFrameTrajectoryNodeMode?.(p,`auto`)}
						tooltip=${{title:r(`action.resetFrameTrajectoryNodeAuto`),description:r(`tooltip.resetFrameTrajectoryNodeAuto`),placement:`right`}}
					/>
				</div>
			</div>
			<div class="workbench-tool-rail__popover-grid">
				${_&&M`
						<label class="field workbench-tool-rail__popover-field">
							<span class="field-label-tooltip">
								${r(`field.frameTrajectoryNodeMode`)}
								<${Tw}
									title=${r(`field.frameTrajectoryNodeMode`)}
									description=${r(`tooltip.frameTrajectoryNodeModeField`)}
									placement="right"
								/>
							</span>
							<div class="workbench-tool-rail__popover-value">
								<select
									class="workbench-tool-rail__popover-select"
									value=${c}
									onChange=${t=>e()?.setFrameTrajectoryNodeMode?.(p,t.currentTarget.value)}
								>
									${w.map(e=>M`
											<option value=${e.value}>${e.label}</option>
										`)}
								</select>
							</div>
						</label>
					`}
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${r(`field.frameTrajectoryExportSource`)}
						<${Tw}
							title=${r(`field.frameTrajectoryExportSource`)}
							description=${r(`tooltip.frameTrajectoryExportSourceField`)}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${l}
							disabled=${!g}
							onChange=${t=>e()?.setFrameTrajectoryExportSource?.(t.currentTarget.value)}
						>
							${T.map(e=>M`
									<option value=${e.value}>${e.label}</option>
								`)}
						</select>
					</div>
				</label>
			</div>
		</div>
	`}function MT({controller:e,mode:t,menuChildren:n=null,projectMenuItems:r=[],railRef:i=null,railOnWheel:a=null,store:o,tailContent:s=null,showQuickMenu:c=!1,t:l,tooltipPlacement:u=`right`,menuPanelPlacement:d=`down`}){let f=t===`viewport`||t===`camera`,p=o.selectedSceneAsset.value,m=o.interactionMode.value,h=o.frames.maskMode.value,g=o.measurement.active.value,_=o.frames.count.value>0,v=o.history.canUndo.value,y=o.history.canRedo.value,[b,x]=De(!1),S=je(null),C=!!p&&(o.viewportTransformMode.value||o.viewportPivotEditMode.value),w=f&&m===`zoom`,T=t===`camera`&&b,E=l(t===`camera`?`section.displayZoom`:`section.view`),D=`${l(`section.transformSpace`)} / ${l(`transformSpace.world`)}`,O=`${l(`section.transformSpace`)} / ${l(`transformSpace.local`)}`;ke(()=>{if(!T)return;let e=e=>{let t=e.target instanceof Element?e.target:null;t?.closest(`.frame-item, .frame-trajectory-layer`)||S.current?.contains(t)||S.current?.contains(t)||x(!1)},t=e=>{e.key===`Escape`&&x(!1)};return document.addEventListener(`pointerdown`,e,!0),document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`pointerdown`,e,!0),document.removeEventListener(`keydown`,t)}},[T]),ke(()=>{t!==`camera`&&x(!1)},[t]);let k=()=>{e()?.clearSceneAssetSelection?.(),e()?.clearSplatSelection?.(),e()?.clearReferenceImageSelection?.(),e()?.clearFrameSelection?.(),e()?.clearOutputFrameSelection?.(),e()?.setMeasurementMode?.(!1,{silent:!0}),e()?.setSplatEditMode?.(!1,{silent:!0}),e()?.setViewportTransformMode(!1)},A=(e,t)=>{if(e){k();return}t?.()};return M`
		<section
			class="workbench-tool-rail"
			aria-label=${l(`section.tools`)}
			ref=${i}
			onWheel=${a}
		>
			<${Ow}
				label=${l(`section.file`)}
				items=${r}
				panelPlacement=${d}
				tooltip=${{title:l(`section.file`),description:l(`tooltip.fileMenu`),placement:u}}
			>
				${n}
			<//>
			${c&&M`
					<${Q}
						icon="undo"
						label=${l(`action.undo`)}
						disabled=${!v}
						className="workbench-tool-rail__button"
						tooltip=${{title:l(`action.undo`),description:l(`tooltip.undo`),shortcut:`Ctrl+Z`,placement:u}}
						onClick=${()=>e()?.undoHistory?.()}
					/>
					<${Q}
						icon="redo"
						label=${l(`action.redo`)}
						disabled=${!y}
						className="workbench-tool-rail__button"
						tooltip=${{title:l(`action.redo`),description:l(`tooltip.redo`),shortcut:`Ctrl+Shift+Z`,placement:u}}
						onClick=${()=>e()?.redoHistory?.()}
					/>
				`}
			${c&&M`
					<${Q}
						icon="pie-menu"
						label=${l(`action.quickMenu`)}
						className="workbench-tool-rail__button"
						tooltip=${{title:l(`action.quickMenu`),description:l(`tooltip.quickMenu`),placement:u}}
						onClick=${()=>e()?.openViewportPieMenuAtCenter?.()}
					/>
				`}
			<div class="workbench-tool-rail__divider"></div>
			<div class="workbench-tool-rail__group">
				<div
					class="workbench-tool-rail__segmented workbench-tool-rail__segmented--vertical"
					role="group"
					aria-label=${l(`section.viewMode`)}
				>
					<button
						id="mode-camera"
						type="button"
						class=${t===`camera`?`workbench-tool-rail__segment is-active`:`workbench-tool-rail__segment`}
						aria-label=${l(`mode.camera`)}
						onClick=${()=>e()?.setMode(`camera`)}
					>
						<${YC} name="camera-dslr" size=${16} />
						<${Tw}
							title=${l(`mode.camera`)}
							description=${l(`tooltip.modeCamera`)}
							placement=${u}
						/>
					</button>
					<button
						id="mode-viewport"
						type="button"
						class=${t===`viewport`?`workbench-tool-rail__segment is-active`:`workbench-tool-rail__segment`}
						aria-label=${l(`mode.viewport`)}
						onClick=${()=>e()?.setMode(`viewport`)}
					>
						<${YC} name="viewport" size=${16} />
						<${Tw}
							title=${l(`mode.viewport`)}
							description=${l(`tooltip.modeViewport`)}
							placement=${u}
						/>
					</button>
				</div>
			</div>
			${f&&M`
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
							<${Q}
								icon="cursor"
								label=${l(`transformMode.select`)}
								active=${o.viewportSelectMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l(`transformMode.select`),description:l(`tooltip.toolSelect`),shortcut:`V`,placement:u}}
								onClick=${()=>A(o.viewportSelectMode.value,()=>e()?.setViewportSelectMode(!0))}
							/>
							<${Q}
								icon="reference-tool"
								label=${l(`transformMode.reference`)}
								active=${o.viewportReferenceImageEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l(`transformMode.reference`),description:l(`tooltip.toolReference`),shortcut:`Shift+R`,placement:u}}
								onClick=${()=>A(o.viewportReferenceImageEditMode.value,()=>e()?.setViewportReferenceImageEditMode(!0))}
							/>
							<${Q}
								icon="splat-edit"
								label=${l(`action.splatEditTool`)}
								active=${o.splatEdit.active.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l(`action.splatEditTool`),description:l(`tooltip.toolSplatEdit`),shortcut:`Shift+E`,placement:u}}
								onClick=${()=>A(o.splatEdit.active.value,()=>e()?.setSplatEditMode?.(!0))}
							/>
							<${Q}
								icon="move"
								label=${l(`transformMode.transform`)}
								active=${o.viewportTransformMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l(`transformMode.transform`),description:l(`tooltip.toolTransform`),shortcut:`T`,placement:u}}
								onClick=${()=>A(o.viewportTransformMode.value,()=>e()?.setViewportTransformMode(!0))}
							/>
							<${Q}
								icon="pivot"
								label=${l(`transformMode.pivot`)}
								active=${o.viewportPivotEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l(`transformMode.pivot`),description:l(`tooltip.toolPivot`),shortcut:`Q`,placement:u}}
								onClick=${()=>A(o.viewportPivotEditMode.value,()=>e()?.setViewportPivotEditMode(!0))}
							/>
							<div class="workbench-tool-rail__tool-slot">
								<${Q}
									icon="zoom"
									label=${l(`action.zoomTool`)}
									active=${w}
									className="workbench-tool-rail__button"
									tooltip=${{title:E,description:l(`tooltip.toolZoom`),shortcut:`Z`,placement:u}}
									onClick=${()=>e()?.toggleZoomTool?.()}
								/>
								${w&&M`
										<${AT}
											controller=${e}
											mode=${t}
											store=${o}
											t=${l}
										/>
									`}
							</div>
							<${Q}
								icon="ruler"
								label=${l(`action.measureTool`)}
								active=${g}
								className="workbench-tool-rail__button"
								tooltip=${{title:l(`action.measureTool`),description:l(`tooltip.measureTool`),shortcut:`M`,placement:u}}
								onClick=${()=>e()?.toggleMeasurementMode?.()}
							/>
							${t===`camera`&&M`
									<div
										class="workbench-tool-rail__tool-slot"
										ref=${S}
									>
										<${Q}
											icon="mask"
											label=${l(`action.frameTool`)}
											active=${T||h!==`off`}
											className="workbench-tool-rail__button"
											tooltip=${{title:l(`action.frameTool`),description:l(`tooltip.frameTool`),shortcut:`F`,placement:u}}
											onClick=${()=>x(e=>!e)}
										/>
										${T&&M`
												<${jT}
													controller=${e}
													hasFrames=${_}
													store=${o}
													t=${l}
												/>
											`}
									</div>
								`}
					</div>
					${C&&M`
							<div class="workbench-tool-rail__divider"></div>
							<div class="workbench-tool-rail__group workbench-tool-rail__group--compact">
								<div
									class="workbench-tool-rail__segmented"
									role="group"
									aria-label=${l(`section.transformSpace`)}
								>
									<button
										type="button"
										class=${o.viewportTransformSpace.value===`world`?`workbench-tool-rail__segment is-active`:`workbench-tool-rail__segment`}
										aria-label=${D}
										title=${D}
										onClick=${()=>e()?.setViewportTransformSpace(`world`)}
									>
										W
									</button>
									<button
										type="button"
										class=${o.viewportTransformSpace.value===`local`?`workbench-tool-rail__segment is-active`:`workbench-tool-rail__segment`}
										aria-label=${O}
										title=${O}
										onClick=${()=>e()?.setViewportTransformSpace(`local`)}
									>
										L
									</button>
								</div>
							</div>
						`}
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
						<${Q}
							icon="selection-clear"
							label=${l(`action.clearSelection`)}
							className="workbench-tool-rail__button"
							tooltip=${{title:l(`action.clearSelection`),description:l(`tooltip.clearSelection`),shortcut:`Ctrl+D`,placement:u}}
							onClick=${()=>k()}
						/>
					</div>
				`}
			${s}
		</section>
	`}function NT({activeQuickSectionId:e=null,activeTab:t,onOpenFullTab:n,onToggleQuickSection:r,quickSections:i=[],t:a}){let o=OT(a);return M`
		<section class="workbench-inspector-rail" aria-label=${a(`section.project`)}>
			<div class="workbench-inspector-rail__group">
				${o.map(e=>M`
						<${Q}
							key=${e.id}
							icon=${e.icon}
							label=${e.label}
							active=${t===e.id}
							compact=${!0}
							className="workbench-inspector-rail__button"
							tooltip=${{title:e.tooltip?.title??e.label,description:e.tooltip?.description??``,shortcut:e.tooltip?.shortcut??``,placement:`left`}}
							onClick=${()=>n?.(e.id)}
						/>
					`)}
			</div>
			${i.length>0&&M`
					<div class="workbench-inspector-rail__divider"></div>
					<div class="workbench-inspector-rail__group">
						${i.map(t=>M`
								<${Q}
									key=${t.id}
									icon=${t.icon}
									label=${t.label}
									active=${e===t.id}
									compact=${!0}
									className="workbench-inspector-rail__button"
									tooltip=${{title:t.label,description:a(`tooltip.openQuickSection`),placement:`left`}}
									onClick=${()=>r?.(t.id)}
								/>
							`)}
					</div>
				`}
		</section>
	`}function PT({activeTab:e,setActiveTab:t,t:n}){return M`
		<${Dw}
			tabs=${OT(n)}
			activeTab=${e}
			setActiveTab=${t}
			ariaLabel=${n(`section.project`)}
			iconOnly=${!0}
		/>
	`}function FT(e,t){return e.find(e=>e.id===t)??null}function IT(e,t,n){let r=FT(e,n);if(!r)return[];let i=new Set(t??[]),a=e.filter(e=>e.kind===r.kind&&i.has(e.id)).map(e=>e.id);return a.includes(n)?a:[n]}function LT(e){let t=e.currentTarget.getBoundingClientRect();return e.clientY<t.top+t.height/2?`before`:`after`}function RT(e,t,n){if(!e||!t||e.kind!==t.kind)return null;let r=e.kindOrderIndex-1,i=t.kindOrderIndex-1;return n===`before`?r<i?i-1:i:r<i?i:i+1}function zT({activeShotCamera:e,controller:t,shotCameras:n,t:r}){let i=n.length>1&&!!e;return M`
		<div class="shot-camera-manager">
			<div class="button-row shot-camera-manager__actions">
				<${Q}
					id="new-shot-camera"
					icon="plus"
					label=${r(`action.newShotCamera`)}
					onClick=${()=>t()?.createShotCamera()}
				/>
				<${Q}
					id="duplicate-shot-camera"
					icon="duplicate"
					label=${r(`action.duplicateShotCamera`)}
					disabled=${!e}
					onClick=${()=>t()?.duplicateActiveShotCamera()}
				/>
				<${Q}
					id="delete-shot-camera"
					icon="trash"
					label=${r(`action.deleteShotCamera`)}
					disabled=${!i}
					onClick=${()=>t()?.deleteActiveShotCamera?.()}
				/>
			</div>
			<div class="shot-camera-manager__list scene-asset-list scene-asset-list--compact">
				${n.map(n=>M`
						<article
							key=${n.id}
							class=${n.id===e?.id?`scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active`:`scene-asset-row scene-asset-row--compact`}
							onClick=${()=>t()?.selectShotCamera(n.id)}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									${n.id===e?.id?M`
												<div class="field shot-camera-manager__inline-name-field">
													<${uT}
														id=${`shot-camera-name-${n.id}`}
														class="shot-camera-manager__inline-name-input"
														placeholder=${r(`field.shotCameraName`)}
														selectOnFocus=${!0}
														value=${n.name}
														onCommit=${e=>t()?.setShotCameraName(e)}
													/>
												</div>
											`:M`<strong>${n.name}</strong>`}
								</div>
							</div>
						</article>
					`)}
			</div>
		</div>
	`}function BT({controller:e,draggedAssetId:t=null,dragHoverState:n=null,sceneAssets:r,selectedSceneAsset:i,setDraggedAssetId:a,setDragHoverState:o,store:s,t:c}){let l=[{kind:`model`,label:c(`assetKind.model`),assets:r.filter(e=>e.kind===`model`)},{kind:`splat`,label:c(`assetKind.splat`),assets:r.filter(e=>e.kind===`splat`)}],u=s.selectedSceneAssetIds.value??[],d=new Set(u),f=e=>{let t=[`scene-asset-row`,`scene-asset-row--compact`];return d.has(e.id)&&t.push(`scene-asset-row--selected`),e.id===i?.id&&t.push(`scene-asset-row--active`),n?.assetId===e.id&&t.push(n.position===`before`?`scene-asset-row--drop-before`:`scene-asset-row--drop-after`),t.join(` `)},p=t=>t.id===i?.id?M`
					<div class="field scene-asset-row__inline-name-field">
						<${uT}
							id=${`scene-asset-name-${t.id}`}
							class="scene-asset-row__inline-name-input"
							placeholder=${t.label}
							selectOnFocus=${!0}
							value=${t.label}
							maxLength="128"
							onCommit=${n=>e()?.setAssetLabel?.(t.id,n)}
						/>
					</div>
				`:M`<strong>${t.label}</strong>`;return M`
		<div class="browser-list">
			${l.map(i=>M`
					<section key=${i.kind} class="browser-group">
						<div class="browser-group__heading">
							<strong>${i.label}</strong>
							<span class="pill pill--dim">${i.assets.length}</span>
						</div>
						<div class="scene-asset-list scene-asset-list--compact">
							${i.assets.length===0?M`<div class="scene-asset-list__placeholder"></div>`:i.assets.map(i=>M`
									<article
										class=${f(i)}
										draggable="true"
										onClick=${t=>e()?.selectSceneAsset(i.id,{additive:t.ctrlKey||t.metaKey,toggle:t.ctrlKey||t.metaKey,range:t.shiftKey,orderedIds:r.map(e=>e.id)})}
										onDragStart=${e=>{a(i.id),o(null),e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,String(i.id))}}
										onDragOver=${e=>{let n=FT(r,t??Number(e.dataTransfer.getData(`text/plain`)));IT(r,u,n?.id).includes(i.id)||n?.kind===i.kind&&(e.preventDefault(),e.dataTransfer.dropEffect=`move`,o({assetId:i.id,position:LT(e)}))}}
										onDragLeave=${()=>{n?.assetId===i.id&&o(null)}}
										onDrop=${n=>{n.preventDefault();let s=t??Number(n.dataTransfer.getData(`text/plain`)),c=FT(r,s),l=IT(r,u,s),d=LT(n);if(!Number.isFinite(s)||s===i.id||l.includes(i.id)||c?.kind!==i.kind){a(null),o(null);return}let f=RT(c,i,d);f!==null&&e()?.moveAssetToIndex(s,f),a(null),o(null)}}
										onDragEnd=${()=>{a(null),o(null)}}
									>
										<div class="scene-asset-row__main">
											<span class="scene-asset-row__handle" aria-hidden="true">
												<${YC} name="grip" size=${12} strokeWidth=${0} />
											</span>
											<div class="scene-asset-row__title-group">
												${p(i)}
											</div>
										</div>
										<div class="scene-asset-row__toolbar">
											<${Q}
												icon=${i.visible?`eye`:`eye-off`}
												label=${c(i.visible?`assetVisibility.visible`:`assetVisibility.hidden`)}
												active=${i.visible}
												compact=${!0}
												className="scene-asset-row__icon-button"
												onClick=${t=>{t.stopPropagation(),e()?.selectSceneAsset(i.id),e()?.setAssetVisibility(i.id,!i.visible)}}
											/>
										</div>
									</article>
								`)}
						</div>
					</section>
				`)}
		</div>
	`}function VT({activePreset:e,controller:t,presets:n,t:r}){let[i,a]=De(!1),o=je(null),s=!!e&&!e.isBlank;return ke(()=>{if(!i)return;let e=e=>{o.current?.contains?.(e.target)||a(!1)};return window.addEventListener(`pointerdown`,e),()=>{window.removeEventListener(`pointerdown`,e)}},[i]),M`
		<div class="reference-preset-picker" ref=${o}>
			<div class="reference-preset-picker__control">
				<div class="field reference-preset-picker__field">
					<${uT}
						id="reference-preset-name"
						class="reference-preset-picker__input"
						placeholder=${r(`field.referencePresetName`)}
						selectOnFocus=${s}
						disabled=${!s}
						value=${e?.name??``}
						onCommit=${e=>t()?.setActiveReferenceImagePresetName?.(e)}
					/>
				</div>
				<button
					type="button"
					class=${i?`reference-preset-picker__toggle is-open`:`reference-preset-picker__toggle`}
					onPointerDown=${e=>{$(e),e.preventDefault()}}
					onClick=${e=>{$(e),e.preventDefault(),a(e=>!e)}}
					aria-label=${r(`referenceImage.activePreset`)}
					aria-expanded=${i}
				>
					<${YC} name="chevron-right" size=${12} />
				</button>
			</div>
			${i&&M`
					<div class="reference-preset-picker__menu">
						${n.map(n=>M`
								<button
									key=${n.id}
									type="button"
									class=${n.id===e?.id?`reference-preset-picker__option is-active`:`reference-preset-picker__option`}
									onPointerDown=${e=>{$(e),e.preventDefault()}}
									onClick=${e=>{$(e),e.preventDefault(),t()?.setActiveReferenceImagePreset?.(n.id),a(!1)}}
								>
									<span>${n.name}</span>
									${n.isBlank?M`<span class="pill pill--dim">${r(`referenceImage.blankPreset`)}</span>`:null}
								</button>
							`)}
					</div>
				`}
		</div>
	`}function HT({controller:e,open:t=!0,summaryActions:n=null,onToggle:r=null,store:i,t:a}){let o=i.referenceImages.presets.value,s=i.referenceImages.panelPresetId.value,c=o.find(e=>e.id===s)??o[0]??null,l=!!c&&c.isBlank!==!0&&o.length>1;return M`
		<${kw}
			icon="image"
			label=${a(`section.referencePresets`)}
			helpSectionId="reference-images"
			onOpenHelp=${t=>e()?.openHelp?.({sectionId:t})}
			open=${t}
			summaryActions=${n}
			onToggle=${r}
		>
			<div class="reference-preset-section">
				<div class="reference-preset-section__row">
					<${VT}
						activePreset=${c}
						controller=${e}
						presets=${o}
						t=${a}
					/>
				</div>
				<div class="button-row reference-preset-section__actions">
					<${Q}
						id="duplicate-reference-preset"
						icon="duplicate"
						label=${a(`action.duplicateReferencePreset`)}
						onClick=${()=>e()?.duplicateActiveReferenceImagePreset?.()}
					/>
					<${Q}
						id="delete-reference-preset"
						icon="trash"
						label=${a(`action.deleteReferencePreset`)}
						disabled=${!l}
						onClick=${()=>e()?.deleteActiveReferenceImagePreset?.()}
					/>
				</div>
			</div>
		<//>
	`}function UT({controller:e,open:t=!0,summaryActions:n=null,onToggle:r=null,store:i,t:a}){let o=i.referenceImages.items.value,s=I_(o),c=new Set(i.referenceImages.selectedItemIds.value??[]),l=s.filter(e=>c.has(e.id)),u=i.referenceImages.selectedItemId.value,d=[{group:`front`,label:a(`referenceImage.group.front`),items:I_(o,`front`)},{group:`back`,label:a(`referenceImage.group.back`),items:I_(o,`back`)}],[f,p]=De(null),[m,h]=De(null),g=l.length>0,_=i.referenceImages.previewSessionVisible.value!==!1,v=l.length>0&&l.every(e=>e.previewVisible!==!1),y=l.length>0&&l.every(e=>e.exportEnabled!==!1),b=M`
		<${Q}
			id="toggle-reference-preview-session"
			icon=${_?`reference-preview-on`:`reference-preview-off`}
			label=${a(_?`action.hideReferenceImages`:`action.showReferenceImages`)}
			active=${_&&o.length>0}
			compact=${!0}
			disabled=${o.length===0}
			tooltip=${{title:a(_?`action.hideReferenceImages`:`action.showReferenceImages`),description:a(`tooltip.referencePreviewSessionVisible`),shortcut:`R`,placement:`left`}}
			onClick=${()=>e()?.setReferenceImagePreviewSessionVisible?.(!_)}
		/>
		${n&&M`${n}`}
	`;function x(e){let t=[`scene-asset-row`,`scene-asset-row--compact`];return c.has(e)&&t.push(`scene-asset-row--selected`),e===u&&t.push(`scene-asset-row--active`),m?.itemId===e&&t.push(m.position===`before`?`scene-asset-row--drop-before`:`scene-asset-row--drop-after`),t.join(` `)}function S(e){let t=e.currentTarget.getBoundingClientRect();return e.clientY<t.top+t.height/2?`before`:`after`}function C(t,n,r){e()?.selectReferenceImageItem?.(n,{additive:t.ctrlKey||t.metaKey,toggle:t.ctrlKey||t.metaKey,range:t.shiftKey,orderedIds:r}),e()?.isReferenceImageSelectionActive?.()&&e()?.activateViewportReferenceImageEditModeImplicit?.()}return M`
		<${kw}
			icon="reference-tool"
			label=${a(`section.referenceManager`)}
			helpSectionId="reference-images"
			onOpenHelp=${t=>e()?.openHelp?.({sectionId:t})}
			open=${t}
			summaryActions=${b}
			onToggle=${r}
			className="panel-disclosure--browser-stack"
		>
			<div class="scene-workspace-browser">
				<div class="button-row reference-manager__actions">
					<${Q}
						id="toggle-selected-reference-preview"
						icon=${v?`eye-off`:`eye`}
						label=${a(v?`action.hideSelectedReferenceImages`:`action.showSelectedReferenceImages`)}
						disabled=${!l.length}
						onClick=${()=>e()?.setSelectedReferenceImagesPreviewVisible?.(!v)}
					/>
					<${Q}
						id="toggle-selected-reference-export"
						icon=${y?`slash-circle`:`export`}
						label=${a(y?`action.excludeSelectedReferenceImagesFromExport`:`action.includeSelectedReferenceImagesInExport`)}
						disabled=${!l.length}
						onClick=${()=>e()?.setSelectedReferenceImagesExportEnabled?.(!y)}
					/>
					<${Q}
						id="delete-selected-reference-images"
						icon="trash"
						label=${a(`action.deleteSelectedReferenceImages`)}
						disabled=${!g}
						onClick=${()=>e()?.deleteSelectedReferenceImageItems?.()}
					/>
				</div>
				<div class="scene-workspace-pane">
					<div class="scene-workspace-pane__body">
						${s.length>0?M`
										<div class="browser-list">
											${d.map(t=>M`
													<section key=${t.group} class="browser-group">
														<div class="browser-group__heading">
															<strong>${t.label}</strong>
															<span class="pill pill--dim"
																>${t.items.length}</span
															>
														</div>
														<div class="scene-asset-list scene-asset-list--compact">
															${t.items.length===0?M`<div class="scene-asset-list__placeholder"></div>`:t.items.map(t=>M`
													<article
														key=${t.id}
														class=${x(t.id)}
														onClick=${e=>C(e,t.id,s.map(e=>e.id))}
														onDragOver=${e=>{e.preventDefault(),e.dataTransfer.dropEffect=`move`,h({itemId:t.id,position:S(e)})}}
														onDragLeave=${()=>{m?.itemId===t.id&&h(null)}}
														onDrop=${n=>{n.preventDefault();let r=f??String(n.dataTransfer.getData(`text/plain`)).trim(),i=S(n);if(!r||r===t.id){p(null),h(null);return}e()?.moveReferenceImageToDisplayTarget?.(r,t.id,i,s.map(e=>e.id)),p(null),h(null)}}
														onDragEnd=${()=>{p(null),h(null)}}
													>
														<div
															class="scene-asset-row__main"
															draggable="true"
															onDragStart=${e=>{p(t.id),h(null),e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,String(t.id))}}
															onDragEnd=${()=>{p(null),h(null)}}
														>
															<span class="scene-asset-row__handle" aria-hidden="true">
																<${YC}
																	name="grip"
																	size=${12}
																	strokeWidth=${0}
																/>
															</span>
															<div class="scene-asset-row__title-group">
																<strong>${t.name}</strong>
															</div>
														</div>
														<div class="scene-asset-row__toolbar">
															<button
																type="button"
																class=${t.group===`front`?`reference-group-chip reference-group-chip--front`:`reference-group-chip reference-group-chip--back`}
																title=${a(`referenceImage.group.${t.group}`)}
																onClick=${n=>{n.stopPropagation(),e()?.setReferenceImageGroup?.(t.id,t.group===`front`?`back`:`front`)}}
															>
																${a(`referenceImage.groupShort.${t.group}`)}
															</button>
															<${Q}
																icon=${t.previewVisible?`eye`:`eye-off`}
																label=${a(t.previewVisible?`action.hideReferenceImage`:`action.showReferenceImage`)}
																active=${t.previewVisible}
																compact=${!0}
																className="scene-asset-row__icon-button"
																onClick=${n=>{n.stopPropagation(),e()?.setReferenceImagePreviewVisible?.(t.id,!t.previewVisible)}}
															/>
															<${Q}
																icon=${t.exportEnabled?`export`:`slash-circle`}
																label=${t.exportEnabled?a(`action.excludeReferenceImageFromExport`):a(`action.includeReferenceImageInExport`)}
																active=${t.exportEnabled}
																compact=${!0}
																className="scene-asset-row__icon-button"
																onClick=${n=>{n.stopPropagation(),e()?.setReferenceImageExportEnabled?.(t.id,!t.exportEnabled)}}
															/>
														</div>
													</article>
												`)}
														</div>
													</section>
												`)}
										</div>
									`:M`
										<div class="scene-workspace-pane__placeholder">
											<div class="scene-asset-list__placeholder"></div>
										</div>
									`}
					</div>
				</div>
			</div>
		<//>
	`}function WT({activeShotCamera:e,controller:t,open:n=!0,summaryActions:r=null,onToggle:i=null,store:a,t:o}){return M`
		<${kw}
			icon="camera"
			label=${o(`section.shotCameraManager`)}
			helpSectionId="shot-camera"
			onOpenHelp=${e=>t()?.openHelp?.({sectionId:e})}
			open=${n}
			summaryActions=${r}
			onToggle=${i}
		>
			<${zT}
				activeShotCamera=${e}
				controller=${t}
				shotCameras=${a.workspace.shotCameras.value}
				t=${o}
			/>
		<//>
	`}function GT(){return typeof VideoFrame<`u`&&typeof VideoEncoder<`u`&&typeof HTMLCanvasElement<`u`&&typeof document<`u`}function KT({activeShotCamera:e,exportPresetIds:t,exportTarget:n,store:r}){return n===`all`?r.workspace.shotCameras.value.length:n===`selected`?t.length:+!!e}function qT({prefix:e,id:t,value:n,controller:r,historyLabel:i,onCommit:a,onScrubDelta:o=null,onScrubStart:s=null,formatDisplayValue:c=null,scrubStartValue:l=null,inputMode:u=`decimal`,min:d=void 0,max:f=void 0,step:p=`0.01`,disabled:m=!1}){return M`
		<div class="camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${e}</span>
			<div class="field camera-property-axis-field__input">
				<${sT}
					id=${t}
					inputMode=${u}
					min=${d}
					max=${f}
					step=${p}
					value=${n}
					controller=${r}
					historyLabel=${i}
					formatDisplayValue=${c}
					disabled=${m}
					onScrubDelta=${o}
					onScrubStart=${s}
					scrubStartValue=${l}
					onCommit=${a}
				/>
			</div>
		</div>
	`}function JT({controller:e,headingActions:t=null,store:n,t:r}){return M`
		<section class="panel-section">
			<${Ew} icon="zoom" title=${r(`section.displayZoom`)}>
				${t}
			<//>
			<label class="field field--inline-compact">
				<span>${r(`field.cameraViewZoom`)}</span>
				<div class="field--inline-compact__value">
					<div class="numeric-unit">
						<${sT}
							id="view-zoom"
							inputMode="decimal"
							min=${20}
							max=${200}
							step="1"
							value=${Math.round(n.renderBox.viewZoom.value*100)}
							controller=${e}
							historyLabel="output-frame.zoom"
							onCommit=${t=>e()?.setViewZoomPercent?.(t)}
						/>
						<${Gw} value="%" title=${r(`unit.percent`)} />
					</div>
				</div>
			</label>
		</section>
	`}function YT({controller:e,equivalentMmValue:t,fovLabel:n,open:r=!0,summaryActions:i=null,onToggle:a=null,shotCameraClipMode:o,store:s,t:c}){let l=Number(s.shotCamera.positionX.value).toFixed(2),u=Number(s.shotCamera.positionY.value).toFixed(2),d=Number(s.shotCamera.positionZ.value).toFixed(2),f=Number(s.shotCamera.yawDeg.value).toFixed(2),p=Number(s.shotCamera.pitchDeg.value).toFixed(2),m=Number(s.shotCamera.rollDeg.value).toFixed(2),h=Number(s.shotCamera.lensShiftXPercent?.value??0).toFixed(1),g=Number(s.shotCamera.lensShiftYPercent?.value??0).toFixed(1),_=s.shotCamera.rollLock.value;return M`
		<${kw}
			icon="camera-property"
			label=${c(`section.shotCameraProperties`)}
			helpSectionId="shot-camera"
			onOpenHelp=${t=>e()?.openHelp?.({sectionId:t})}
			open=${r}
			summaryActions=${i}
			onToggle=${a}
		>
			<label class="field field--range">
				<span class="field-label-tooltip">
					${c(`field.shotCameraEquivalentMm`)}
					<${Tw}
						title=${c(`field.shotCameraEquivalentMm`)}
						description=${c(`tooltip.shotCameraEquivalentMmField`)}
						placement="right"
					/>
				</span>
				<div class="range-row">
					<${dT}
						id="fov-mm"
						min=${14}
						max=${200}
						step="1"
						value=${t}
						controller=${e}
						historyLabel="camera.lens"
						onLiveChange=${t=>fT(t=>e()?.setBaseFovX(t),t.currentTarget.value,{snap:!0})}
					/>
					<div class="numeric-unit">
						<${sT}
							id="fov-mm-input"
							inputMode="decimal"
							min=${14}
							max=${200}
							step="0.01"
							value=${Number(t).toFixed(2)}
							controller=${e}
							historyLabel="camera.lens"
							onCommit=${t=>fT(t=>e()?.setBaseFovX(t),t)}
						/>
						<${Gw} value="mm" title=${c(`unit.millimeter`)} />
					</div>
				</div>
				<p class="summary">${c(`field.shotCameraFov`)} ${n}</p>
			</label>
			<div class="camera-property-inline-row">
				<span class="camera-property-inline-row__label field-label-tooltip">
					${c(`field.shotCameraLensShift`)}
					<${Tw}
						title=${c(`field.shotCameraLensShift`)}
						description=${c(`tooltip.shotCameraLensShiftField`)}
						placement="right"
					/>
				</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--pair">
					<${qT}
						prefix="X"
						id="shot-camera-lens-shift-x"
						value=${h}
						controller=${e}
						historyLabel="camera.lens-shift.x"
						min=${Pm}
						max=${100}
						step="0.1"
						onCommit=${t=>e()?.setShotCameraLensShiftXPercent?.(t)}
					/>
					<${qT}
						prefix="Y"
						id="shot-camera-lens-shift-y"
						value=${g}
						controller=${e}
						historyLabel="camera.lens-shift.y"
						min=${Pm}
						max=${100}
						step="0.1"
						onCommit=${t=>e()?.setShotCameraLensShiftYPercent?.(t)}
					/>
				</div>
			</div>
			<div class="pose-action-row">
				<${Q}
					id="copy-viewport-to-shot"
					icon="copy-to-camera"
					label=${c(`action.viewportToShot`)}
					compact=${!0}
					tooltip=${{title:c(`action.viewportToShot`),description:c(`tooltip.copyViewportPoseToShot`),placement:`left`}}
					onClick=${()=>e()?.copyViewportToShotCamera()}
				/>
				<${Q}
					id="copy-shot-to-viewport"
					icon="copy-to-viewport"
					label=${c(`action.shotToViewport`)}
					compact=${!0}
					tooltip=${{title:c(`action.shotToViewport`),description:c(`tooltip.copyShotPoseToViewport`),placement:`left`}}
					onClick=${()=>e()?.copyShotCameraToViewport()}
				/>
				<${Q}
					id="reset-active-view"
					icon="reset"
					label=${c(`action.resetActive`)}
					compact=${!0}
					tooltip=${{title:c(`action.resetActive`),description:c(`tooltip.resetActiveView`),placement:`left`}}
					onClick=${()=>e()?.resetActiveView()}
				/>
			</div>
			<div class="camera-property-inline-row">
				<span class="camera-property-inline-row__label">${c(`field.assetPosition`)}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${qT}
						prefix="X"
						id="shot-camera-position-x"
						value=${l}
						controller=${e}
						historyLabel="camera.position.x"
						onCommit=${t=>e()?.setActiveShotCameraPositionAxis?.(`x`,t)}
					/>
					<${qT}
						prefix="Y"
						id="shot-camera-position-y"
						value=${u}
						controller=${e}
						historyLabel="camera.position.y"
						onCommit=${t=>e()?.setActiveShotCameraPositionAxis?.(`y`,t)}
					/>
					<${qT}
						prefix="Z"
						id="shot-camera-position-z"
						value=${d}
						controller=${e}
						historyLabel="camera.position.z"
						onCommit=${t=>e()?.setActiveShotCameraPositionAxis?.(`z`,t)}
					/>
				</div>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--action">
				<span class="camera-property-inline-row__label">${c(`field.assetRotation`)}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${qT}
						prefix="Y"
						id="shot-camera-yaw"
						value=${f}
						controller=${e}
						historyLabel="camera.rotation.yaw"
						onCommit=${t=>e()?.setActiveShotCameraPoseAngle?.(`yaw`,t)}
					/>
					<${qT}
						prefix="P"
						id="shot-camera-pitch"
						value=${p}
						controller=${e}
						historyLabel="camera.rotation.pitch"
						onCommit=${t=>e()?.setActiveShotCameraPoseAngle?.(`pitch`,t)}
					/>
					<${qT}
						prefix="R"
						id="shot-camera-roll"
						value=${m}
						controller=${e}
						historyLabel="camera.rotation.roll"
						onCommit=${t=>e()?.setActiveShotCameraPoseAngle?.(`roll`,t)}
					/>
				</div>
				<${Q}
					icon=${_?`lock`:`lock-open`}
					label=${c(`field.shotCameraRollLock`)}
					active=${_}
					compact=${!0}
					className="camera-property-inline-row__action"
					tooltip=${{title:c(`field.shotCameraRollLock`),placement:`left`}}
					onClick=${()=>e()?.setShotCameraRollLock?.(!_)}
				/>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--clip">
				<div class="camera-property-inline-row__content camera-property-inline-row__content--clip">
					<${qT}
						prefix=${c(`field.shotCameraNear`)}
						id="shot-camera-near"
						value=${Number(s.shotCamera.near.value).toFixed(2)}
						controller=${e}
						historyLabel="camera.near"
						min="0.1"
						step="0.1"
						disabled=${o===`auto`}
						onScrubStart=${()=>{o===`auto`&&e()?.setShotCameraClippingMode?.(`manual`)}}
						onCommit=${t=>e()?.setShotCameraNear(t)}
					/>
					<${qT}
						prefix=${c(`field.shotCameraFar`)}
						id="shot-camera-far"
						value=${Number(s.shotCamera.far.value).toFixed(2)}
						controller=${e}
						historyLabel="camera.far"
						min="0.1"
						step="0.1"
						disabled=${o===`auto`}
						onScrubStart=${()=>{o===`auto`&&e()?.setShotCameraClippingMode?.(`manual`)}}
						onCommit=${t=>e()?.setShotCameraFar(t)}
					/>
				</div>
				<label class="switch-toggle camera-property-inline-row__switch">
					<input
						type="checkbox"
						checked=${o===`auto`}
						onChange=${t=>e()?.setShotCameraClippingMode?.(t.currentTarget.checked?`auto`:`manual`)}
					/>
					<span class="switch-toggle__control" aria-hidden="true">
						<span class="switch-toggle__thumb"></span>
					</span>
					<span class="switch-toggle__label field-label-tooltip">
						${c(`clipMode.auto`)}
						<${Tw}
							title=${c(`clipMode.auto`)}
							description=${c(`hint.shotCameraClip`)}
							placement="left"
						/>
					</span>
				</label>
			</div>
			<div class="pose-grid">
				<label class="field">
					<span>${c(`field.shotCameraMoveHorizontal`)}</span>
					<${cT}
						controller=${e}
						historyLabel="camera.local-move.horizontal"
						ariaLabel=${c(`field.shotCameraMoveHorizontal`)}
						step=${.02}
						onDelta=${t=>e()?.moveActiveShotCameraLocalAxis?.(`right`,t)}
					/>
				</label>
				<label class="field">
					<span>${c(`field.shotCameraMoveVertical`)}</span>
					<${cT}
						controller=${e}
						historyLabel="camera.local-move.vertical"
						ariaLabel=${c(`field.shotCameraMoveVertical`)}
						step=${.02}
						onDelta=${t=>e()?.moveActiveShotCameraLocalAxis?.(`up`,t)}
					/>
				</label>
				<label class="field">
					<span>${c(`field.shotCameraMoveDepth`)}</span>
					<${cT}
						controller=${e}
						historyLabel="camera.local-move.depth"
						ariaLabel=${c(`field.shotCameraMoveDepth`)}
						step=${.03}
						onDelta=${t=>e()?.moveActiveShotCameraLocalAxis?.(`forward`,t)}
					/>
				</label>
			</div>
		<//>
	`}function XT({activeShotCamera:e,controller:t,exportFormat:n,exportGridLayerMode:r,exportGridOverlay:i,exportModelLayers:a,exportSplatLayers:o,open:s=!1,onToggle:c=null,summaryActions:l=null,store:u,t:d}){return M`
		<${kw}
			icon="export-tab"
			label=${d(`section.exportSettings`)}
			helpSectionId="export"
			onOpenHelp=${e=>t()?.openHelp?.({sectionId:e})}
			open=${s}
			summaryActions=${l}
			onToggle=${c}
		>
			<label class="field">
				<span class="field-label-tooltip">
					${d(`field.shotCameraExportName`)}
					<${Tw}
						title=${d(`field.shotCameraExportName`)}
						description=${d(`tooltip.shotCameraExportName`)}
						placement="right"
					/>
				</span>
				<${uT}
					id="shot-camera-export-name"
					placeholder=${e?.name??`Camera`}
					value=${u.shotCamera.exportName.value}
					onCommit=${e=>t()?.setShotCameraExportName(e)}
				/>
			</label>
			<label class="field">
				<span>${d(`field.exportFormat`)}</span>
				<select
					id="shot-camera-export-format"
					value=${n}
					...${Lw}
					onChange=${e=>t()?.setShotCameraExportFormat(e.currentTarget.value)}
				>
					<option value="png">${d(`exportFormat.png`)}</option>
					<option value="psd">${d(`exportFormat.psd`)}</option>
				</select>
			</label>
			<label class="checkbox-field">
				<input
					id="shot-camera-export-grid-overlay"
					type="checkbox"
					checked=${i}
					onChange=${e=>t()?.setShotCameraExportGridOverlay(e.currentTarget.checked)}
				/>
				<span>${d(`field.exportGridOverlay`)}</span>
			</label>
			${i&&M`
					<label class="field">
						<span class="field-label-tooltip">
							${d(`field.exportGridLayerMode`)}
							<${Tw}
								title=${d(`field.exportGridLayerMode`)}
								description=${d(`tooltip.exportGridLayerModeField`)}
								placement="right"
							/>
						</span>
						<select
							id="shot-camera-export-grid-layer-mode"
							value=${r}
							...${Lw}
							onChange=${e=>t()?.setShotCameraExportGridLayerMode(e.currentTarget.value)}
						>
							<option value="bottom">${d(`gridLayerMode.bottom`)}</option>
							<option value="overlay">${d(`gridLayerMode.overlay`)}</option>
						</select>
					</label>
				`}
			${n===`psd`&&M`
					<label class="checkbox-field">
						<input
							id="shot-camera-export-model-layers"
							type="checkbox"
							checked=${a}
							onChange=${e=>t()?.setShotCameraExportModelLayers(e.currentTarget.checked)}
						/>
						<span class="field-label-tooltip">
							${d(`field.exportModelLayers`)}
							<${Tw}
								title=${d(`field.exportModelLayers`)}
								description=${d(`tooltip.exportModelLayersField`)}
								placement="right"
							/>
						</span>
					</label>
					<label class="checkbox-field">
						<input
							id="shot-camera-export-splat-layers"
							type="checkbox"
							checked=${o}
							disabled=${!a}
							onChange=${e=>t()?.setShotCameraExportSplatLayers(e.currentTarget.checked)}
						/>
						<span class="field-label-tooltip">
							${d(`field.exportSplatLayers`)}
							<${Tw}
								title=${d(`field.exportSplatLayers`)}
								description=${d(`tooltip.exportSplatLayersField`)}
								placement="right"
							/>
						</span>
					</label>
				`}
		<//>
	`}function ZT({anchorOptions:e,controller:t,exportSizeLabel:n,open:r=!0,summaryActions:i=null,onToggle:a=null,heightLabel:o,store:s,t:c,widthLabel:l}){let u=s.renderBox.anchor.value,d=s.shotCamera.compositionGuideEnabled.value,f=s.shotCamera.compositionGuideScope.value,p=s.shotCamera.compositionGuidePattern.value,m=[{value:yh,label:c(`compositionGuideScope.selectedFrame`)},{value:bh,label:c(`compositionGuideScope.allFrames`)}],h=[{value:xh,label:c(`compositionGuidePattern.thirds`)},{value:Sh,label:c(`compositionGuidePattern.golden`)},{value:Ch,label:c(`compositionGuidePattern.center`)},{value:wh,label:c(`compositionGuidePattern.grid`)}];return M`
		<${kw}
			icon="render-box"
			label=${c(`section.outputFrame`)}
			helpSectionId="output-frame-and-frames"
			onOpenHelp=${e=>t()?.openHelp?.({sectionId:e})}
			open=${r}
			summaryMeta=${M`<span id="export-size-pill" class="pill pill--dim">${n}</span>`}
			summaryActions=${i}
			onToggle=${a}
		>
			<label class="field field--range">
				<span>${c(`field.outputFrameWidth`)}</span>
				<div class="range-row">
					<${dT}
						id="box-width"
						min=${100}
						max=${lm}
						step="1"
						value=${Math.round(s.renderBox.widthScale.value*100)}
						controller=${t}
						historyLabel="output-frame.width"
						onLiveChange=${e=>t()?.setBoxWidthPercent(e.currentTarget.value)}
					/>
					<output id="box-width-value">${l}</output>
				</div>
			</label>
			<label class="field field--range">
				<span>${c(`field.outputFrameHeight`)}</span>
				<div class="range-row">
					<${dT}
						id="box-height"
						min=${100}
						max=${um}
						step="1"
						value=${Math.round(s.renderBox.heightScale.value*100)}
						controller=${t}
						historyLabel="output-frame.height"
						onLiveChange=${e=>t()?.setBoxHeightPercent(e.currentTarget.value)}
					/>
					<output id="box-height-value">${o}</output>
				</div>
			</label>
			<div class="field field--inline-compact field--anchor-compact">
				<span class="field-label-tooltip">
					${c(`field.anchor`)}
					<${Tw}
						title=${c(`field.anchor`)}
						description=${c(`tooltip.outputFrameAnchorField`)}
						placement="right"
					/>
				</span>
				<div class="field--inline-compact__value field--anchor-compact__value">
					<div
						class="anchor-matrix"
						role="grid"
						aria-label=${c(`field.anchor`)}
					>
						${e.map(e=>M`
								<button
									key=${e.value}
									type="button"
									class=${e.value===u?`anchor-matrix__cell anchor-matrix__cell--active`:`anchor-matrix__cell`}
									aria-label=${e.label}
									title=${e.label}
									onPointerDown=${$}
									onClick=${n=>{$(n),t()?.setAnchor(e.value)}}
								></button>
							`)}
					</div>
				</div>
			</div>
			<div class="composition-guide-panel">
				<label class="switch-toggle composition-guide-panel__toggle">
					<input
						id="composition-guide-enabled"
						type="checkbox"
						checked=${d}
						onChange=${e=>t()?.setCompositionGuideEnabled?.(e.currentTarget.checked)}
					/>
					<span class="switch-toggle__control" aria-hidden="true">
						<span class="switch-toggle__thumb"></span>
					</span>
					<span class="switch-toggle__label field-label-tooltip">
						${c(`field.compositionGuide`)}
						<${Tw}
							title=${c(`field.compositionGuide`)}
							description=${c(`tooltip.compositionGuideField`)}
							placement="right"
						/>
					</span>
				</label>
				${d&&M`
						<div class="composition-guide-panel__settings">
							<label class="field">
								<span class="field-label-tooltip">
									${c(`field.compositionGuideScope`)}
									<${Tw}
										title=${c(`field.compositionGuideScope`)}
										description=${c(`tooltip.compositionGuideScopeField`)}
										placement="right"
									/>
								</span>
								<select
									id="composition-guide-scope"
									value=${f}
									...${Lw}
									onChange=${e=>t()?.setCompositionGuideScope?.(e.currentTarget.value)}
								>
									${m.map(e=>M`
											<option value=${e.value}>${e.label}</option>
										`)}
								</select>
							</label>
							<label class="field">
								<span class="field-label-tooltip">
									${c(`field.compositionGuidePattern`)}
									<${Tw}
										title=${c(`field.compositionGuidePattern`)}
										description=${c(`tooltip.compositionGuidePatternField`)}
										placement="right"
									/>
								</span>
								<select
									id="composition-guide-pattern"
									value=${p}
									...${Lw}
									onChange=${e=>t()?.setCompositionGuidePattern?.(e.currentTarget.value)}
								>
									${h.map(e=>M`
											<option value=${e.value}>${e.label}</option>
										`)}
								</select>
							</label>
						</div>
					`}
			</div>
		<//>
	`}function QT({activeShotCamera:e=null,controller:t,exportBusy:n,exportPresetIds:r,exportSelectionMissing:i,exportTarget:a,open:o=!0,summaryActions:s=null,onToggle:c=null,store:l,t:u}){let d=l.referenceImages.exportSessionEnabled.value!==!1,f=l.exportOptions.mode.value,p=l.exportOptions.frameSource.value,m=tx(l.animation.document.value,{frameSource:p}),h=KT({activeShotCamera:e,exportPresetIds:r,exportTarget:a,store:l}),g=h*m.length,_=Math.round(Number(l.animation.timelineFrame.value)||1),v=l.animation.activeClip.value,y=Math.max(1,Math.round(Number(v?.fps)||24)),b=GT(),x=f!==Hb,S=x&&m.length===0,C=f===`video`&&!b,w=n||i||S||C,T=u(f===`sequence`?`action.downloadSequence`:f===`video`?`action.downloadVideo`:`action.downloadOutput`),E=[{value:Hb,label:u(`exportMode.current`)},{value:Ub,label:u(`exportMode.sequence`)},{value:Wb,label:u(`exportMode.video`)}],D=f===`current`?u(`exportModeSummary.current`,{frame:_}):S?u(`exportModeSummary.noFrames`):f===`video`?u(`exportModeSummary.video`,{frames:m.length,cameras:h,fps:y}):u(`exportModeSummary.sequence`,{frames:m.length,cameras:h,count:g,source:u(`exportFrameSource.${p}`)});return M`
		<${kw}
			icon="export-tab"
			label=${u(`section.export`)}
			helpSectionId="export"
			onOpenHelp=${e=>t()?.openHelp?.({sectionId:e})}
			open=${o}
			summaryActions=${s}
			onToggle=${c}
			className="panel-disclosure--preview"
		>
			<div class="field">
				<div class="field__label-row">
					<label class="field__label-inline" for="export-target">
						${u(`field.exportTarget`)}
					</label>
					<button
						id="download-output"
						type="button"
						class="button button--primary button--compact field__label-action"
						disabled=${w}
						onClick=${()=>t()?.downloadOutput()}
					>
						${T}
					</button>
				</div>
				<div class="export-run-settings">
					<span class="export-run-settings__label">
						${u(`field.exportMode`)}
					</span>
					<div
						class="export-mode-segment"
						role="group"
						aria-label=${u(`field.exportMode`)}
					>
						${E.map(e=>M`
								<button
									key=${e.value}
									type="button"
									class=${f===e.value?`export-mode-segment__button is-active`:`export-mode-segment__button`}
									onPointerDown=${$}
									onClick=${n=>{$(n),t()?.setExportMode?.(e.value)}}
								>
									${e.label}
								</button>
							`)}
					</div>
					${x&&M`
							<label class="field">
								<span>${u(`field.exportFrameSource`)}</span>
								<select
									id="export-frame-source"
									value=${p}
									...${Lw}
									onChange=${e=>t()?.setExportFrameSource?.(e.currentTarget.value)}
								>
									<option value=${`duration`}>
										${u(`exportFrameSource.duration`)}
									</option>
									<option value=${`keyframes`}>
										${u(`exportFrameSource.keyframes`)}
									</option>
								</select>
							</label>
						`}
					<p
						class=${C||S?`export-run-settings__summary is-warning`:`export-run-settings__summary`}
					>
						${C?u(`exportModeSummary.videoUnsupported`):D}
					</p>
				</div>
				<select
					id="export-target"
					value=${a}
					...${Lw}
					onChange=${e=>t()?.setExportTarget(e.currentTarget.value)}
				>
					<option value="current">${u(`exportTarget.current`)}</option>
					<option value="all">${u(`exportTarget.all`)}</option>
					<option value="selected">${u(`exportTarget.selected`)}</option>
				</select>
			</div>
			${a===`selected`&&M`
					<div class="field">
						<span>${u(`field.exportPresetSelection`)}</span>
						<div class="export-selection-list">
							${l.workspace.shotCameras.value.map(e=>M`
									<label class="export-selection-item">
										<input
											type="checkbox"
											checked=${r.includes(e.id)}
											onChange=${()=>t()?.toggleExportPreset(e.id)}
										/>
										<span class="export-selection-item__name"
											>${e.name}</span
										>
										<span class="export-selection-item__meta">
											${e.exportSettings?.exportName?.trim()||e.name}
										</span>
									</label>
								`)}
						</div>
					</div>
				`}
			<label class="checkbox-field">
				<input
					type="checkbox"
					checked=${d}
					onChange=${e=>t()?.setReferenceImageExportSessionEnabled?.(e.currentTarget.checked)}
				/>
				<span>${u(`field.exportReferenceImages`)}</span>
			</label>
		<//>
	`}function $T({controller:e,open:t=!0,summaryActions:n=null,onToggle:r=null,showList:i=!0,store:a,t:o}){let s=a.referenceImages.assets.value,c=a.referenceImages.items.value,l=I_(c),u=a.referenceImages.presets.value,d=a.referenceImages.previewSessionVisible.value,f=a.referenceImages.selectedAssetId.value,p=a.referenceImages.selectedItemId.value,m=new Set(a.referenceImages.selectedItemIds.value??[]),h=a.referenceImages.panelPresetId.value,g=c.find(e=>e.id===p)??null,_=s.find(e=>e.id===(g?.assetId??f))??null,v=(t,n,r)=>{e()?.selectReferenceImageItem?.(n,{additive:t.ctrlKey||t.metaKey,toggle:t.ctrlKey||t.metaKey,range:t.shiftKey,orderedIds:r}),e()?.isReferenceImageSelectionActive?.()&&e()?.activateViewportReferenceImageEditModeImplicit?.()};function y({selected:e=!1,active:t=!1}){let n=[`scene-asset-row`];return e&&n.push(`scene-asset-row--selected`),t&&n.push(`scene-asset-row--active`),n.join(` `)}return M`
		<${kw}
			icon="image"
			label=${o(`section.referenceImages`)}
			helpSectionId="reference-images"
			onOpenHelp=${t=>e()?.openHelp?.({sectionId:t})}
			open=${t}
			summaryMeta=${M`<span class="pill pill--dim">${c.length}</span>`}
			summaryActions=${n}
			onToggle=${r}
		>
			<div class="button-row">
				<button
					type="button"
					class=${d?`button button--primary button--compact`:`button button--compact`}
					onClick=${()=>e()?.setReferenceImagePreviewSessionVisible?.(!d)}
				>
					${o(d?`action.hideReferenceImages`:`action.showReferenceImages`)}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${o(`referenceImage.activePreset`)}</span>
					<select
						value=${h}
						...${Lw}
						onChange=${t=>e()?.setActiveReferenceImagePreset?.(t.currentTarget.value)}
					>
						${u.map(e=>M`
								<option key=${e.id} value=${e.id}>
									${e.name}
								</option>
							`)}
					</select>
				</label>
				<div class="field field--action">
					<span>${o(`referenceImage.activePresetItems`,{count:c.length})}</span>
					<button
						type="button"
						class="button button--compact"
						onClick=${()=>e()?.duplicateActiveReferenceImagePreset?.()}
					>
						${o(`action.duplicateReferencePreset`)}
					</button>
				</div>
			</div>
			<div class="reference-panel-stack">
				${i&&M`
						<section class="reference-panel-group">
							<div class="panel-inline-header">
								<strong>${o(`referenceImage.currentPresetSection`)}</strong>
								<span class="pill pill--dim">${c.length}</span>
							</div>
							${c.length>0?M`
											<div class="scene-asset-list">
												${l.map(t=>M`
														<article
															class=${y({selected:m.has(t.id),active:t.id===p})}
															onClick=${e=>v(e,t.id,l.map(e=>e.id))}
														>
															<div class="scene-asset-row__main scene-asset-row__main--flat">
																<div class="scene-asset-row__title-group">
																	<strong>${t.name}</strong>
																	<span class="scene-asset-row__meta">
																		${t.fileName||o(`referenceImage.untitled`)} ·
																		${o(`referenceImage.group.${t.group}`)} ·
																		${o(`referenceImage.orderLabel`,{order:t.order+1})}
																	</span>
																</div>
															</div>
															<div class="scene-asset-row__toolbar">
																<${Q}
																	icon=${t.previewVisible?`eye`:`eye-off`}
																	label=${o(t.previewVisible?`assetVisibility.visible`:`assetVisibility.hidden`)}
																	active=${t.previewVisible}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${n=>{n.stopPropagation(),e()?.setReferenceImagePreviewVisible?.(t.id,!t.previewVisible)}}
																/>
																<${Q}
																	icon=${t.exportEnabled?`export`:`slash-circle`}
																	label=${t.exportEnabled?o(`action.excludeReferenceImageFromExport`):o(`action.includeReferenceImageInExport`)}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${n=>{n.stopPropagation(),e()?.setReferenceImageExportEnabled?.(t.id,!t.exportEnabled)}}
																/>
															</div>
														</article>
													`)}
											</div>
										`:M`<p class="summary">${o(`referenceImage.currentCameraEmpty`)}</p>`}
						</section>
					`}
				${g&&_?M`
								<${kw}
									icon="image"
									label=${g.name}
									open=${!0}
								>
									<div class="reference-selected-panel">
										<p class="summary">
											${g.name} ·
											${_.fileName||o(`referenceImage.untitled`)}
										</p>
										<div class="split-field-row">
											<label class="field">
												<span>${o(`field.referenceImageOpacity`)}</span>
												<div class="numeric-unit">
													<${sT}
														inputMode="decimal"
														min="0"
														max="100"
														step="1"
														value=${Math.round(g.opacity*100)}
														controller=${e}
														historyLabel="reference-image.opacity"
														onCommit=${t=>e()?.setReferenceImageOpacity?.(g.id,t)}
													/>
													<${Gw} value="%" title=${o(`unit.percent`)} />
												</div>
											</label>
											<label class="field">
												<span>${o(`field.referenceImageScale`)}</span>
												<div class="numeric-unit">
													<${sT}
														inputMode="decimal"
														min="0.1"
														step="0.01"
														value=${Number(g.scalePct).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.scale"
														onCommit=${t=>e()?.setReferenceImageScalePct?.(g.id,t)}
													/>
													<${Gw} value="%" title=${o(`unit.percent`)} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${o(`field.referenceImageOffsetX`)}</span>
												<div class="numeric-unit">
													<${sT}
														inputMode="decimal"
														step="1"
														value=${Number(g.offsetPx?.x??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.x"
														onCommit=${t=>e()?.setReferenceImageOffsetPx?.(g.id,`x`,t)}
													/>
													<${Gw} value="px" title=${o(`unit.pixel`)} />
												</div>
											</label>
											<label class="field">
												<span>${o(`field.referenceImageOffsetY`)}</span>
												<div class="numeric-unit">
													<${sT}
														inputMode="decimal"
														step="1"
														value=${Number(g.offsetPx?.y??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.y"
														onCommit=${t=>e()?.setReferenceImageOffsetPx?.(g.id,`y`,t)}
													/>
													<${Gw} value="px" title=${o(`unit.pixel`)} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${o(`field.referenceImageRotation`)}</span>
												<div class="numeric-unit">
													<${sT}
														inputMode="decimal"
														step="0.01"
														value=${Number(g.rotationDeg).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.rotation"
														onCommit=${t=>e()?.setReferenceImageRotationDeg?.(g.id,t)}
													/>
													<${Gw} value="deg" title=${o(`unit.degree`)} />
												</div>
											</label>
											<label class="field">
												<span>${o(`field.referenceImageOrder`)}</span>
												<${sT}
													inputMode="numeric"
													min="1"
													step="1"
													value=${g.order+1}
													controller=${e}
													historyLabel="reference-image.order"
													onCommit=${t=>e()?.setReferenceImageOrder?.(g.id,Math.max(0,Number(t)-1))}
												/>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${o(`field.referenceImageGroup`)}</span>
												<select
													value=${g.group}
													...${Lw}
													onChange=${t=>e()?.setReferenceImageGroup?.(g.id,t.currentTarget.value)}
												>
													<option value="back">
														${o(`referenceImage.group.back`)}
													</option>
													<option value="front">
														${o(`referenceImage.group.front`)}
													</option>
												</select>
											</label>
										</div>
										<div class="button-row">
											<button
												type="button"
												class=${g.previewVisible?`button button--primary button--compact`:`button button--compact`}
												onClick=${()=>e()?.setReferenceImagePreviewVisible?.(g.id,!g.previewVisible)}
											>
												${g.previewVisible?o(`action.hideReferenceImage`):o(`action.showReferenceImage`)}
											</button>
											<button
												type="button"
												class=${g.exportEnabled?`button button--primary button--compact`:`button button--compact`}
												onClick=${()=>e()?.setReferenceImageExportEnabled?.(g.id,!g.exportEnabled)}
											>
												${g.exportEnabled?o(`action.excludeReferenceImageFromExport`):o(`action.includeReferenceImageInExport`)}
											</button>
										</div>
									</div>
								<//>
							`:M`<p class="summary">${o(`referenceImage.selectedEmpty`)}</p>`}
			</div>
		<//>
	`}var eE=15,tE={right:0,"top-right":135,top:90,"top-left":45,left:0,"bottom-left":135,bottom:90,"bottom-right":45},nE=new Map;function rE(e){let t=Number.isFinite(e)?e%360:0;return t<0?t+360:t}function iE(e){return Math.round(rE(e)/eE)*eE}function aE(e){return`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${e} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6.6 16H25.4" stroke="#ffffff" stroke-width="4.8" />
				<path d="M6.6 16H25.4" stroke="#111111" stroke-width="1.9" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim()}function oE(e,t){let n=tE[t]??0,r=iE((e??0)+n);if(!nE.has(r)){let e=encodeURIComponent(aE(r));nE.set(r,`url("data:image/svg+xml,${e}") 16 16, ew-resize`)}return nE.get(r)}function sE(e,t){let n=e?.label??`3DGS`,r=Number.isFinite(e?.current)?e.current:0,i=Number.isFinite(e?.total)?e.total:0;return e?.status===`done`?t(`backgroundTask.autoLodDone`):e?.status===`failed`?t(`backgroundTask.autoLodFailed`):i>1?t(`backgroundTask.autoLodRunningMulti`,{current:Math.min(i,r+1),total:i,name:n}):t(`backgroundTask.autoLodRunningSingle`,{name:n})}function cE(e){return e?.status===`done`?M`<span class="background-task-pill__icon background-task-pill__icon--done">✓</span>`:e?.status===`failed`?M`<span class="background-task-pill__icon background-task-pill__icon--failed">⚠</span>`:M`<span
		class="background-task-pill__icon background-task-pill__icon--spin"
		aria-hidden="true"
	></span>`}function lE({store:e,t}){let n=e?.backgroundTask?.value;if(!n)return null;let r=``,i=``,a=null;if(n.kind===`auto-lod`)r=n.status===`failed`?`background-task-pill--failed`:n.status===`done`?`background-task-pill--done`:`background-task-pill--running`,i=sE(n,t),a=cE(n);else{if(!n.label)return null;r=`background-task-pill--running`,i=n.label,a=cE({status:`running`})}return M`
		<div
			class=${`background-task-pill ${r}`}
			role="status"
			aria-live="polite"
		>
			${a}
			<span class="background-task-pill__message">${i}</span>
		</div>
	`}function uE({mode:e,enabled:t}={}){return e===`camera`&&!!t}function dE(e,t,n,r){let i=Number(r?.width??0),a=Number(r?.height??0);return{width:Number.isFinite(i)&&i>0?e.width/Math.max(t,1e-6)*i:0,height:Number.isFinite(a)&&a>0?e.height/Math.max(n,1e-6)*a:0}}function fE({exportHeight:e,exportWidth:t,guideState:n,target:r}){let i=je(null),[a,o]=De({width:0,height:0});Ae(()=>{let e=i.current;if(!e)return;let t=()=>{o({width:e.clientWidth,height:e.clientHeight})};if(t(),typeof ResizeObserver==`function`){let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()}return window.addEventListener(`resize`,t),()=>window.removeEventListener(`resize`,t)},[]);let s=dE(r,t,e,a),{lines:c}=Gh({target:r,pattern:n.pattern,screenWidth:s.width,screenHeight:s.height}),l=`translate(${r.left+r.width*.5} ${r.top+r.height*.5}) rotate(${r.rotationDeg})`;return M`
		<div
			ref=${i}
			class="composition-guide-layer"
			data-guide-scope=${n.scope}
			data-guide-pattern=${n.pattern}
			aria-hidden="true"
		>
			<svg
				class="composition-guide-layer__svg"
				viewBox=${`0 0 ${t} ${e}`}
				preserveAspectRatio="none"
			>
				<g class="composition-guide-layer__target" transform=${l}>
					<rect
						class="composition-guide-layer__outline"
						x=${-r.width*.5}
						y=${-r.height*.5}
						width=${r.width}
						height=${r.height}
					></rect>
					${c.map((e,t)=>M`
							<line
								key=${`${e.axis}-${t}`}
								class=${[`composition-guide-layer__line`,e.weight===`major`?`composition-guide-layer__line--major`:``].filter(Boolean).join(` `)}
								x1=${e.x1}
								y1=${e.y1}
								x2=${e.x2}
								y2=${e.y2}
							></line>
						`)}
				</g>
			</svg>
		</div>
	`}function pE({store:e}){let t=e.mode.value,n=e.shotCamera.compositionGuide.value,r=e.exportWidth.value,i=e.exportHeight.value,a=e.frames.documents.value,o=Vh({scope:n.scope,frames:a,activeFrameId:e.frames.activeId.value,selectedFrameIds:e.frames.selectedIds.value??[],frameSelectionActive:e.frames.selectionActive.value,exportWidth:r,exportHeight:i});return!uE({mode:t,enabled:n.enabled})||!o?null:M`
		<${fE}
			exportHeight=${i}
			exportWidth=${r}
			guideState=${n}
			target=${o}
		/>
	`}function mE(e){return!!(e&&e.width>0&&e.height>0)}function hE(e,{preferClientSize:t=!1}={}){if(!e)return null;let n=Number(t?e.clientWidth??e.offsetWidth??0:e.offsetWidth??e.clientWidth??0),r=Number(t?e.clientHeight??e.offsetHeight??0:e.offsetHeight??e.clientHeight??0);return!(n>0)||!(r>0)?null:{left:Number(e.offsetLeft??0),top:Number(e.offsetTop??0),width:n,height:r}}function gE({viewportRect:e=null,renderBoxRect:t=null}={}){let n=mE(t)?t:e;if(mE(n))return{left:`${n.left+n.width*.5}px`,top:`${n.top+n.height*.5}px`,bottom:`auto`,transform:`translate(-50%, -50%)`}}var _E=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`],vE=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`];function yE(e){return!Number.isFinite(e?.x)||!Number.isFinite(e?.y)||e.x<0||e.x>1||e.y<0||e.y>1?``:rh(e)}function bE(e=[]){return!Array.isArray(e)||e.length===0?``:e.map((e,t)=>`${t===0?`M`:`L`} ${Number(e.x).toFixed(2)} ${Number(e.y).toFixed(2)}`).join(` `)}function xE(e,t){return!e||!t?0:Math.hypot(e.x-t.x,e.y-t.y)}function SE(e,t){return!e||!t?null:{x:t.x-(e.x-t.x),y:t.y-(e.y-t.y)}}function CE({frameMaskShape:e,trajectoryEditMode:t,frameSelectionActive:n}={}){return!!n&&(e===`trajectory`||!!t)}function wE({controller:e,exportWidth:t,exportHeight:n,frames:r,frameMaskShape:i,trajectoryMode:a,trajectoryNodesByFrameId:o,trajectoryEditMode:s,frameSelectionActive:c,activeTrajectoryNodeMode:l,activeFrameId:u,selectedFrameIds:d,interactionsEnabled:f}){if(!CE({frameMaskShape:i,trajectoryEditMode:s,frameSelectionActive:c})||r.length===0)return null;let p={shape:i,trajectoryMode:a,trajectory:{nodesByFrameId:o}},m=Qg(r,p,t,n,{source:tg}),h=r.find(e=>e.id===u)??r[r.length-1]??null,g=h?r.findIndex(e=>e.id===h.id):-1,_=h?{x:h.x*t,y:h.y*n}:null,v=s&&a===`spline`&&h&&l!==`corner`,y=v?Vg(r,p,h.id,`in`,t,n):null,b=v?Vg(r,p,h.id,`out`,t,n):null,x=y?{x:y.x*t,y:y.y*n}:null,S=b?{x:b.x*t,y:b.y*n}:null,C=x&&_&&xE(x,_)>1?x:null,w=S&&_&&xE(S,_)>1?S:null,T=v&&l===`auto`&&(g===0||g===r.length-1),E=T&&!C&&w&&_?SE(w,_):null,D=T&&!w&&C&&_?SE(C,_):null,O=C??E,k=w??D,A=!!E,ee=!!D,te=(t,n)=>e()?.startFrameTrajectoryHandleDrag?.(h.id,t,n);return M`
		<div class="frame-trajectory-layer">
			<svg
				class="frame-trajectory-layer__svg"
				viewBox=${`0 0 ${t} ${n}`}
				preserveAspectRatio="none"
			>
				${m.length>=2&&M`
						<path
							class=${s?`frame-trajectory-layer__path frame-trajectory-layer__path--editing`:`frame-trajectory-layer__path`}
							d=${bE(m)}
						></path>
					`}
				${s&&_&&O&&M`
						<line
							class=${[`frame-trajectory-layer__handle-guide`,`frame-trajectory-layer__handle-guide--in`,A?`frame-trajectory-layer__handle-guide--ghost`:``].filter(Boolean).join(` `)}
							x1=${_.x}
							y1=${_.y}
							x2=${O.x}
							y2=${O.y}
						></line>
					`}
				${s&&_&&k&&M`
						<line
							class=${[`frame-trajectory-layer__handle-guide`,`frame-trajectory-layer__handle-guide--out`,ee?`frame-trajectory-layer__handle-guide--ghost`:``].filter(Boolean).join(` `)}
							x1=${_.x}
							y1=${_.y}
							x2=${k.x}
							y2=${k.y}
						></line>
					`}
				${s&&r.map(r=>{let i=d.has(r.id);return M`
							<circle
								class=${[`frame-trajectory-layer__node-hit`,i?`frame-trajectory-layer__node-hit--selected`:``,r.id===u?`frame-trajectory-layer__node-hit--active`:``].filter(Boolean).join(` `)}
								cx=${r.x*t}
								cy=${r.y*n}
								r="14"
								onPointerDown=${f?t=>e()?.startFrameDrag?.(r.id,t):void 0}
							></circle>
							<circle
								class=${[`frame-trajectory-layer__node`,i?`frame-trajectory-layer__node--selected`:``,r.id===u?`frame-trajectory-layer__node--active`:``].filter(Boolean).join(` `)}
								cx=${r.x*t}
								cy=${r.y*n}
								r="12"
								onPointerDown=${f?t=>e()?.startFrameDrag?.(r.id,t):void 0}
							></circle>
						`})}
				${s&&O&&M`
						<circle
							class=${[`frame-trajectory-layer__handle-contrast`,`frame-trajectory-layer__handle-contrast--in`,A?`frame-trajectory-layer__handle-contrast--ghost`:``].filter(Boolean).join(` `)}
							cx=${O.x}
							cy=${O.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${O.x}
							cy=${O.y}
							r="12"
							onPointerDown=${f?e=>te(`in`,e):void 0}
						></circle>
						<circle
							class=${[`frame-trajectory-layer__handle`,`frame-trajectory-layer__handle--in`,A?`frame-trajectory-layer__handle--ghost`:``].filter(Boolean).join(` `)}
							cx=${O.x}
							cy=${O.y}
							r="9"
							onPointerDown=${f?e=>te(`in`,e):void 0}
						></circle>
						<circle
							class=${[`frame-trajectory-layer__handle-core`,`frame-trajectory-layer__handle-core--in`,A?`frame-trajectory-layer__handle-core--ghost`:``].filter(Boolean).join(` `)}
							cx=${O.x}
							cy=${O.y}
							r="2.25"
						></circle>
					`}
				${s&&k&&M`
						<circle
							class=${[`frame-trajectory-layer__handle-contrast`,`frame-trajectory-layer__handle-contrast--out`,ee?`frame-trajectory-layer__handle-contrast--ghost`:``].filter(Boolean).join(` `)}
							cx=${k.x}
							cy=${k.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${k.x}
							cy=${k.y}
							r="12"
							onPointerDown=${f?e=>te(`out`,e):void 0}
						></circle>
						<circle
							class=${[`frame-trajectory-layer__handle`,`frame-trajectory-layer__handle--out`,ee?`frame-trajectory-layer__handle--ghost`:``].filter(Boolean).join(` `)}
							cx=${k.x}
							cy=${k.y}
							r="9"
							onPointerDown=${f?e=>te(`out`,e):void 0}
						></circle>
						<circle
							class=${[`frame-trajectory-layer__handle-core`,`frame-trajectory-layer__handle-core--out`,ee?`frame-trajectory-layer__handle-core--ghost`:``].filter(Boolean).join(` `)}
							cx=${k.x}
							cy=${k.y}
							r="2.25"
						></circle>
					`}
			</svg>
		</div>
	`}function TE({store:e,controller:t,frameOverlayCanvasRef:n,canvasOnly:r=!1,itemsOnly:i=!1,interactionsEnabled:a=!0}){let o=e.exportWidth.value,s=e.exportHeight.value,c=e.locale.value,l=e.frames.activeId.value,u=e.frames.selectionActive.value,d=new Set(e.frames.selectedIds.value??[]),f=u&&d.size>1,p=d.size,m=e.frames.selectionBoxLogical.value,h=e.frames.maskShape.value,g=e.frames.trajectoryMode.value,_=e.frames.trajectoryEditMode.value,v=e.frames.trajectoryNodesByFrameId.value??{},y=e.frames.trajectoryNodeMode.value??Fg({trajectory:{nodesByFrameId:v}},l),b=e.frames.selectionAnchor.value&&Number.isFinite(e.frames.selectionAnchor.value.x)&&Number.isFinite(e.frames.selectionAnchor.value.y)?{x:e.frames.selectionAnchor.value.x,y:e.frames.selectionAnchor.value.y}:m?{x:m.anchorX??.5,y:m.anchorY??.5}:null;return M`
		<div
			class=${[`frame-layer`,r?`frame-layer--canvas`:``,i?`frame-layer--items`:``,a?``:`frame-layer--noninteractive`].filter(Boolean).join(` `)}
		>
			${!i&&M`
					<canvas
						id="frame-overlay-canvas"
						ref=${n}
						class="frame-layer__canvas"
					></canvas>
				`}
			${!r&&M`
					<${wE}
						controller=${t}
						exportWidth=${o}
						exportHeight=${s}
						frames=${e.frames.documents.value}
						frameMaskShape=${h}
						trajectoryMode=${g}
						trajectoryNodesByFrameId=${v}
						trajectoryEditMode=${_}
						frameSelectionActive=${u}
						activeTrajectoryNodeMode=${y}
						activeFrameId=${l}
						selectedFrameIds=${d}
						interactionsEnabled=${a}
					/>
				`}
			${!r&&e.frames.documents.value.map(e=>{let n=Number(e.scale)>0?e.scale:1,r=`${Math.round(n*100)}%`,i=om.width*n*100/o,p=om.height*n*100/s,m=u&&d.has(e.id),h=m&&l===e.id&&!f,g=m&&!f,_=m&&!f,v=(e.rotation??0)*Math.PI/180,y=ph(e,{width:om.width*n,height:om.height*n,rotationRadians:v},{boxWidth:o,boxHeight:s}),b=rh(y),x=ny(c,`action.deleteFrame`),S=ny(c,`action.renameFrame`);return M`
						<div
							class=${[`frame-item`,m?`frame-item--selected`:``,h?`frame-item--active`:``].filter(Boolean).join(` `)}
							data-anchor-handle=${b}
							style=${{left:`${e.x*100-i*.5}%`,top:`${e.y*100-p*.5}%`,width:`${i}%`,height:`${p}%`,transform:`rotate(${e.rotation??0}deg)`,transformOrigin:`center center`}}
						>
							${g&&M`
									<span class="frame-item__label">
										<span class="frame-item__label-text"
											><${uT}
												class="frame-item__label-input"
												value=${e.name}
												aria-label=${S}
												maxLength=${64}
												selectOnFocus=${!0}
												onCommit=${n=>t()?.setFrameName?.(e.id,n)}
											/></span
										>
										<span class="frame-item__label-scale"
											>${r}</span
										>
										${_&&M`
												<button
													type="button"
													class="frame-item__label-delete"
													aria-label=${x}
													title=${x}
													onPointerDown=${e=>{a&&(e.preventDefault(),e.stopPropagation())}}
													onClick=${a?n=>{n.preventDefault(),n.stopPropagation(),t()?.deleteFrame?.(e.id)}:void 0}
												>
													<${YC} name="trash" size=${11} />
												</button>
											`}
									</span>
								`}
							<button
								type="button"
								class="frame-item__edge frame-item__edge--top"
								aria-label=${e.name}
								onPointerDown=${a?n=>t()?.startFrameDrag(e.id,n):void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--right"
								aria-label=${e.name}
								onPointerDown=${a?n=>t()?.startFrameDrag(e.id,n):void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--bottom"
								aria-label=${e.name}
								onPointerDown=${a?n=>t()?.startFrameDrag(e.id,n):void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--left"
								aria-label=${e.name}
								onPointerDown=${a?n=>t()?.startFrameDrag(e.id,n):void 0}
							></button>
							${_E.map(n=>M`
									<button
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${n}`}
										style=${{cursor:oE(e.rotation??0,n)}}
										aria-label=${e.name}
										onPointerDown=${a?r=>t()?.startFrameResize(e.id,n,r):void 0}
									></button>
								`)}
							${vE.map(n=>M`
									<button
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${n}`}
										style=${{cursor:Rx(e.rotation??0,n)}}
										aria-label=${e.name}
										onPointerDown=${a?r=>t()?.startFrameRotate(e.id,n,r):void 0}
									></button>
								`)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${{left:`${y.x*100}%`,top:`${y.y*100}%`}}
								aria-label=${e.name}
								onPointerDown=${a?n=>t()?.startFrameAnchorDrag(e.id,n):void 0}
							></button>
						</div>
					`})}
			${!r&&f&&m&&b&&M`
					<div
						class="frame-item frame-item--selected frame-item--active frame-selection-group"
						data-anchor-handle=${yE(b)}
						style=${{left:`${m.left*100/o}%`,top:`${m.top*100/s}%`,width:`${m.width*100/o}%`,height:`${m.height*100/s}%`,transform:`rotate(${m.rotationDeg??0}deg)`,transformOrigin:`${b.x*100}% ${b.y*100}%`}}
					>
						<span
							class="frame-item__label frame-item__label--group"
						>
							<span class="frame-item__label-text"
								>${`${p} FRAME`}</span
							>
							<button
								type="button"
								class="frame-item__label-delete"
								aria-label=${ny(c,`action.deleteFrame`)}
								title=${ny(c,`action.deleteFrame`)}
								onPointerDown=${e=>{e.preventDefault(),e.stopPropagation()}}
								onClick=${e=>{e.preventDefault(),e.stopPropagation(),t()?.deleteSelectedFrames?.()}}
							>
								<${YC} name="trash" size=${11} />
							</button>
						</span>
						${[`top`,`right`,`bottom`,`left`].map(e=>M`
								<button
									type="button"
									class=${`frame-item__edge frame-item__edge--${e}`}
									aria-label="Selected FRAMEs"
									onPointerDown=${a?e=>t()?.startSelectedFramesDrag?.(e):void 0}
								></button>
							`)}
						${_E.map(e=>M`
								<button
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${e}`}
									style=${{cursor:oE(m.rotationDeg??0,e)}}
									aria-label="Resize selected FRAMEs"
									onPointerDown=${a?n=>t()?.startSelectedFramesResize?.(e,n):void 0}
								></button>
							`)}
						${vE.map(e=>M`
								<button
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${e}`}
									style=${{cursor:Rx(m.rotationDeg??0,e)}}
									aria-label="Rotate selected FRAMEs"
									onPointerDown=${a?n=>t()?.startSelectedFramesRotate?.(e,n):void 0}
								></button>
							`)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{left:`${b.x*100}%`,top:`${b.y*100}%`}}
							aria-label="Move selected FRAME anchor"
							onPointerDown=${a?e=>t()?.startSelectedFramesAnchorDrag?.(e):void 0}
						></button>
					</div>
				`}
		</div>
	`}function EE(e){return{left:`${e.x}px`,top:`${e.y}px`}}function DE(e,t){let n=(t?.x??0)-(e?.x??0),r=(t?.y??0)-(e?.y??0),i=Math.hypot(n,r);return!Number.isFinite(i)||i<=.001?null:{left:`${e.x}px`,top:`${e.y}px`,width:`${i}px`,transform:`rotate(${Math.atan2(r,n)}rad)`}}function OE({store:e,controller:t,t:n}){if(!e.measurement.active.value)return null;let r=e.measurement.overlay.value,i=!!e.measurement.startPointWorld.value,a=!!e.measurement.endPointWorld.value,o=e.measurement.selectedPointKey.value??(a?`end`:`start`),s=Number(e.measurement.lengthInputText.value),c=a&&r.chip.visible&&(e.selectedSceneAssetIds.value?.length??0)>0&&Number.isFinite(s)&&s>0,l=r.lineUsesDraft?r.draftEnd:r.end,u=r.lineVisible&&r.start.visible&&l?.visible?DE(r.start,l):null;return M`
		<div class="measurement-overlay" aria-hidden="false">
			${u&&M`
					<div
						class=${r.lineUsesDraft?`measurement-overlay__line-track measurement-overlay__line-track--draft`:`measurement-overlay__line-track`}
						style=${u}
					>
						<div class="measurement-overlay__line-outline"></div>
						<div class="measurement-overlay__line-main"></div>
					</div>
				`}
			${i&&r.start.visible&&M`
					<button
						type="button"
						class=${o===`start`?`measurement-overlay__point measurement-overlay__point--selected`:`measurement-overlay__point`}
						style=${EE(r.start)}
						aria-label=${n(`action.measurementStartPoint`)}
						onPointerDown=${e=>t()?.selectMeasurementPoint?.(`start`,e)}
					></button>
				`}
			${a&&r.end.visible&&M`
					<button
						type="button"
						class=${o===`end`?`measurement-overlay__point measurement-overlay__point--selected`:`measurement-overlay__point`}
						style=${EE(r.end)}
						aria-label=${n(`action.measurementEndPoint`)}
						onPointerDown=${e=>t()?.selectMeasurementPoint?.(`end`,e)}
					></button>
				`}
			${r.axisSnap?.active&&M`
					<div
						class=${`measurement-overlay__axis-badge measurement-overlay__axis-badge--${r.axisSnap.axisKey}`}
						style=${EE(r.axisSnap)}
					>
						${r.axisSnap.label}
					</div>
				`}
			${r.chip.visible&&M`
					<div
						class=${`measurement-overlay__chip measurement-overlay__chip--${r.chip.placement??`dock-bottom`}`}
						style=${EE(r.chip)}
						onPointerDown=${e=>{e.stopPropagation()}}
					>
						<label class="measurement-overlay__chip-field">
							<span>${r.chip.label}</span>
							<div class="measurement-overlay__chip-row">
								<input
									type="text"
									inputmode="decimal"
									class="measurement-overlay__chip-input"
									value=${e.measurement.lengthInputText.value}
									aria-label=${n(`field.measurementLength`)}
									onInput=${e=>t()?.setMeasurementLengthInputText?.(e.currentTarget.value)}
									onKeyDown=${e=>{e.key===`Enter`&&(e.preventDefault(),t()?.applyMeasurementScale?.())}}
								/>
								<span class="measurement-overlay__chip-unit">m</span>
								<button
									type="button"
									class="measurement-overlay__chip-apply"
									disabled=${!c}
									onClick=${()=>t()?.applyMeasurementScale?.()}
								>
									${n(`action.apply`)}
								</button>
							</div>
						</label>
					</div>
				`}
		</div>
	`}var kE=[`x`,`y`,`z`];function AE({controller:e,rootRef:t,svgRef:n}){return M`
		<div
			ref=${t}
			class="viewport-axis-gizmo is-hidden"
			aria-label="Viewport Axis Gizmo"
		>
			<svg
				ref=${n}
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${kE.map(e=>M`
						<line
							key=${e}
							data-axis-gizmo-line=${e}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${e}`}
							x1="50"
							y1="50"
							x2="50"
							y2="50"
						/>
					`)}
			</svg>
			${kE.flatMap(t=>[M`
					<button
						key=${`pos-${t}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--positive viewport-axis-gizmo__button--${t}`}
						data-axis-gizmo-node=${`pos-${t}`}
						data-facing="positive"
						aria-label=${t.toUpperCase()}
						title=${t.toUpperCase()}
						onClick=${()=>e()?.alignViewportToOrthographicView?.(`pos${t.toUpperCase()}`,{toggleOppositeOnRepeat:!0})}
					>
						<span>${t.toUpperCase()}</span>
					</button>
				`,M`
					<button
						key=${`neg-${t}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--negative viewport-axis-gizmo__button--${t}`}
						data-axis-gizmo-node=${`neg-${t}`}
						data-facing="negative"
						aria-label=${`-${t.toUpperCase()}`}
						title=${`-${t.toUpperCase()}`}
						onClick=${()=>e()?.alignViewportToOrthographicView?.(`neg${t.toUpperCase()}`,{toggleOppositeOnRepeat:!0})}
					>
						<span></span>
					</button>
				`,M`
					<button
						key=${`axis-${t}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--axis-center viewport-axis-gizmo__button--${t}`}
						data-axis-gizmo-node=${`axis-${t}`}
						data-facing="positive"
						aria-label=${t.toUpperCase()}
						title=${t.toUpperCase()}
						onClick=${()=>e()?.toggleViewportOrthographicAxis?.(t)}
					>
						<span>${t.toUpperCase()}</span>
					</button>
				`])}
		</div>
	`}function jE({store:e,controller:t,t:n}){let{projectDisplayName:r,projectDirty:i,showProjectPackageDirty:a}=Jx(e,n),o=e.viewportLod.effectiveScale.value,s=Fb(o);return M`
		<div
			class="viewport-project-status"
			onPointerDown=${$}
			onClick=${$}
			onWheel=${Pw}
		>
			<label class="viewport-lod-scale viewport-lod-scale--tooltip">
				<span class="viewport-lod-scale__label">
					${n(`viewportLodScale.label`)}
				</span>
				<input
					...${Lw}
					class="viewport-lod-scale__range"
					type="range"
					min=${Sm}
					max=${Cm}
					step=${wm}
					value=${o}
					aria-label=${n(`viewportLodScale.ariaLabel`)}
					onInput=${e=>{t()?.setViewportLodScale?.(e.currentTarget.value)}}
				/>
				<span class="viewport-lod-scale__value">${s}</span>
				<${Tw}
					title=${n(`viewportLodScale.tooltipTitle`)}
					description=${n(`viewportLodScale.tooltipDescription`)}
					placement="bottom"
				/>
			</label>
			<span class="viewport-project-status__separator" aria-hidden="true"></span>
			<span class="viewport-project-status__name">${r}</span>
			${i&&M`
					<span class="viewport-project-status__badge">*</span>
				`}
			${a&&M`
					<span
						class="viewport-project-status__badge viewport-project-status__badge--package"
					>
						PKG
					</span>
				`}
		</div>
	`}var ME=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`],NE=[`top`,`right`,`bottom`,`left`],PE=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`],FE=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`];function IE({store:e,controller:t,t:n,style:r=void 0,onDragPointerDown:i=void 0}){let a=e.splatEdit.tool.value,o=e.splatEdit.selectionCount.value,s=e.splatEdit.brushSize.value,c=e.splatEdit.brushDepthMode.value,l=e.splatEdit.brushDepth.value,u=e.splatEdit.boxPlaced.value,d=e.splatEdit.boxCenter.value,f=e.splatEdit.boxSize.value,p=e.splatEdit.boxRotation.value,m=e.splatEdit.lodStatus?.value??`empty`,h=e.backgroundTask?.value??null,g=h?.kind===`auto-lod`&&h?.status===`running`,_=e=>t()?.setSplatEditTool?.(e),v=e=>t()?.setSplatEditBrushDepthMode?.(e),y=(e,n)=>{let r=Number(n);Number.isFinite(r)&&t()?.setSplatEditBoxCenterAxis?.(e,r)},b=(e,n)=>{let r=Number(n);Number.isFinite(r)&&t()?.setSplatEditBoxSizeAxis?.(e,r)},x=(e,n)=>{let r=Number(n);Number.isFinite(r)&&t()?.setSplatEditBoxRotationAxis?.(e,r)},S=e=>{let n=Number(e);Number.isFinite(n)&&t()?.setSplatEditBrushSize?.(n)},C=e=>{let n=Number(e);Number.isFinite(n)&&t()?.setSplatEditBrushDepth?.(n)},w=e=>Number(e??0).toFixed(2),T=({label:e,value:n,step:r=`0.10`,min:i=void 0,historyLabel:a,onScrubValue:o,onCommitValue:s})=>M`
		<div class="viewport-splat-edit-toolbar__field camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${e}</span>
			<div class="camera-property-axis-field__input field">
				<${sT}
					inputMode="decimal"
					min=${i}
					step=${r}
					value=${w(n)}
					controller=${t}
					historyLabel=${a}
					formatDisplayValue=${w}
					scrubStartValue=${Number(n??0)}
					onScrubDelta=${(e,t)=>o(t)}
					onCommit=${e=>s(e)}
				/>
			</div>
		</div>
	`,E=new Ri().setFromQuaternion(new oi(Number(p?.x??0),Number(p?.y??0),Number(p?.z??0),Number(p?.w??1))),D={x:ai.radToDeg(E.x),y:ai.radToDeg(E.y),z:ai.radToDeg(E.z)};return M`
		<div class="viewport-splat-edit-toolbar" style=${r}>
			${a===`brush`&&M`
				<div class="viewport-splat-edit-popover">
					${T({label:`px`,value:s??30,step:`1`,min:`4`,historyLabel:`splat-edit.brush-size`,onScrubValue:e=>S(e),onCommitValue:e=>S(e)})}
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${c===`through`?` viewport-splat-edit-toolbar__btn--active`:``}`} onClick=${()=>v(`through`)}>
						${n(`status.splatEditBrushModeThrough`)}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${c===`depth`?` viewport-splat-edit-toolbar__btn--active`:``}`} onClick=${()=>v(`depth`)}>
						${n(`status.splatEditBrushModeDepth`)}
					</button>
					${c===`depth`&&M`
						${T({label:n(`status.splatEditBrushModeDepth`),value:l??.2,min:`0.01`,historyLabel:`splat-edit.brush-depth`,onScrubValue:e=>C(e),onCommitValue:e=>C(e)})}
					`}
				</div>
			`}
			${a===`box`&&M`
				<div class="viewport-splat-edit-popover">
					${u?M`
						<div class="viewport-splat-edit-toolbar__box-panel">
							<div class="viewport-splat-edit-toolbar__detail-row">
								<span class="viewport-splat-edit-toolbar__detail-label">${n(`status.splatEditCenter`)}</span>
								<div class="viewport-splat-edit-toolbar__detail-grid">
									${T({label:n(`field.positionX`),value:d?.x??0,historyLabel:`splat-edit.box-center.x`,onScrubValue:e=>y(`x`,e),onCommitValue:e=>y(`x`,e)})}
									${T({label:n(`field.positionY`),value:d?.y??0,historyLabel:`splat-edit.box-center.y`,onScrubValue:e=>y(`y`,e),onCommitValue:e=>y(`y`,e)})}
									${T({label:n(`field.positionZ`),value:d?.z??0,historyLabel:`splat-edit.box-center.z`,onScrubValue:e=>y(`z`,e),onCommitValue:e=>y(`z`,e)})}
								</div>
							</div>
							<div class="viewport-splat-edit-toolbar__detail-row">
								<span class="viewport-splat-edit-toolbar__detail-label">${n(`status.splatEditSize`)}</span>
								<div class="viewport-splat-edit-toolbar__detail-grid">
									${T({label:n(`field.positionX`),value:f?.x??1,min:`0.01`,historyLabel:`splat-edit.box-size.x`,onScrubValue:e=>b(`x`,e),onCommitValue:e=>b(`x`,e)})}
									${T({label:n(`field.positionY`),value:f?.y??1,min:`0.01`,historyLabel:`splat-edit.box-size.y`,onScrubValue:e=>b(`y`,e),onCommitValue:e=>b(`y`,e)})}
									${T({label:n(`field.positionZ`),value:f?.z??1,min:`0.01`,historyLabel:`splat-edit.box-size.z`,onScrubValue:e=>b(`z`,e),onCommitValue:e=>b(`z`,e)})}
								</div>
							</div>
							<div class="viewport-splat-edit-toolbar__detail-row">
								<span class="viewport-splat-edit-toolbar__detail-label">${n(`field.assetRotation`)}</span>
								<div class="viewport-splat-edit-toolbar__detail-grid">
									${T({label:n(`field.positionX`),value:D.x,step:`1`,historyLabel:`splat-edit.box-rotation.x`,onScrubValue:e=>x(`x`,e),onCommitValue:e=>x(`x`,e)})}
									${T({label:n(`field.positionY`),value:D.y,step:`1`,historyLabel:`splat-edit.box-rotation.y`,onScrubValue:e=>x(`y`,e),onCommitValue:e=>x(`y`,e)})}
									${T({label:n(`field.positionZ`),value:D.z,step:`1`,historyLabel:`splat-edit.box-rotation.z`,onScrubValue:e=>x(`z`,e),onCommitValue:e=>x(`z`,e)})}
								</div>
							</div>
							<div class="viewport-splat-edit-toolbar__action-row">
								<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>t()?.applySplatEditBoxSelection?.({subtract:!1})}>${n(`status.splatEditAdd`)}</button>
								<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>t()?.applySplatEditBoxSelection?.({subtract:!0})}>${n(`status.splatEditSubtract`)}</button>
								<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>t()?.scaleSplatEditBoxUniform?.(.9)}>−<${Tw} title=${n(`status.splatEditScaleDown`)} placement="top" /></button>
								<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>t()?.scaleSplatEditBoxUniform?.(1.1)}>+<${Tw} title=${n(`status.splatEditScaleUp`)} placement="top" /></button>
								<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>t()?.fitSplatEditBoxToScope?.()}>${n(`status.splatEditFitScope`)}</button>
							</div>
						</div>
					`:M`
						<span class="viewport-splat-edit-toolbar__info">${n(`status.splatEditPlaceBoxHint`)}</span>
					`}
					${!u&&M`<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>t()?.fitSplatEditBoxToScope?.()}>${n(`status.splatEditFitScope`)}</button>`}
				</div>
			`}
			<div class="viewport-splat-edit-toolbar__bar">
				<button
					type="button"
					class="viewport-splat-edit-toolbar__drag-handle button--tooltip"
					aria-label=${n(`action.moveToolbar`)}
					onPointerDown=${i}
				>
					<${YC} name="grip" size=${14} strokeWidth=${0} />
					<${Tw} title=${n(`action.moveToolbar`)} placement="top" />
				</button>
				<!-- Tool selector -->
				<div class="viewport-splat-edit-toolbar__group" role="group" aria-label=${n(`action.splatEditTool`)}>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${a===`box`?` viewport-splat-edit-toolbar__btn--active`:``}`} onClick=${()=>_(`box`)}>
						${n(`status.splatEditToolBox`)}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${a===`brush`?` viewport-splat-edit-toolbar__btn--active`:``}`} onClick=${()=>_(`brush`)}>
						${n(`status.splatEditToolBrush`)}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${a===`transform`?` viewport-splat-edit-toolbar__btn--active`:``}`} disabled=${o<=0&&a!==`transform`} onClick=${()=>_(`transform`)}>
						${n(`status.splatEditToolTransform`)}
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection operations -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>t()?.selectAllSplats?.()}>
						${n(`status.splatEditSelectAll`)}<${Tw} title=${n(`status.splatEditSelectAll`)} shortcut="Ctrl+A" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${o<=0} onClick=${()=>t()?.invertSplatSelection?.()}>
						${n(`status.splatEditInvert`)}<${Tw} title=${n(`status.splatEditInvert`)} shortcut="Ctrl+I" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${o<=0} onClick=${()=>t()?.clearSplatSelection?.()}>
						${n(`action.clearSelection`)}<${Tw} title=${n(`action.clearSelection`)} shortcut="Ctrl+D" placement="top" />
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Edit actions -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--danger" disabled=${o<=0} onClick=${()=>void t()?.deleteSelectedSplats?.()}>
						${n(`status.splatEditDelete`)}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${o<=0} onClick=${()=>void t()?.separateSelectedSplats?.()}>
						${n(`status.splatEditSeparate`)}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${o<=0} onClick=${()=>void t()?.duplicateSelectedSplats?.()}>
						${n(`status.splatEditDuplicate`)}
					</button>
				</div>
				${m!==`empty`&&M`
						<div class="viewport-splat-edit-toolbar__separator" />
						<div
							class="viewport-splat-edit-toolbar__group"
							role="group"
							aria-label=${n(`action.splatEditOptimizeLod`)}
						>
							<button
								type="button"
								class=${`viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--lod button--tooltip${m===`ready`?` viewport-splat-edit-toolbar__btn--lod-ready`:``}${g?` viewport-splat-edit-toolbar__btn--lod-running`:``}`}
								disabled=${m===`ready`||g}
								onClick=${()=>t()?.rebuildSplatEditLod?.()}
							>
								<span
									class=${`viewport-splat-edit-toolbar__lod-icon${g?` viewport-splat-edit-toolbar__lod-icon--spin`:m===`ready`?` viewport-splat-edit-toolbar__lod-icon--done`:``}`}
									aria-hidden="true"
								>
									${g?``:m===`ready`?`✓`:`⚡`}
								</span>
								<span>
									${n(g?`status.splatEditLodRunning`:m===`ready`?`status.splatEditLodReady`:`status.splatEditLodStale`)}
								</span>
								<${Tw}
									title=${n(`status.splatEditLodTooltip`)}
									placement="top"
								/>
							</button>
						</div>
					`}
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection count (right end) -->
				<span class="viewport-splat-edit-toolbar__info">
					${o} sel
				</span>
			</div>
		</div>
	`}function LE({store:e,viewportShellRef:t}){let n=e.splatEdit.active.value,r=e.splatEdit.tool.value,i=e.splatEdit.brushPreview.value;if(!n||r!==`brush`||!i?.visible)return null;let a=t?.current??t??null;if(!(a instanceof HTMLElement))return null;let o=Math.max(0,Number(i?.radiusPx??0)),s=a.getBoundingClientRect(),c={left:`${i.x-s.left-o}px`,top:`${i.y-s.top-o}px`,width:`${o*2}px`,height:`${o*2}px`},l=e.splatEdit.brushDepthBarVisible.value;return M`
		<div
			class=${i?.subtract?i?.painting?`viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract viewport-splat-edit-brush-preview--painting`:`viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract`:i?.painting?`viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--painting`:`viewport-splat-edit-brush-preview`}
			style=${c}
			aria-hidden="true"
		>
			<div class="viewport-splat-edit-brush-preview__ring"></div>
			${l&&Number(i?.depthBarPx)>2&&M`
					<div
						class="viewport-splat-edit-brush-preview__depth-bar"
						style=${{height:`${Number(i.depthBarPx)}px`}}
					></div>
				`}
		</div>
	`}function RE({store:e,refs:t}){let n=je(null),r=je(()=>{}),i=e.mode.value,a=e.frames.documents.value,o=e.frames.maskMode.value,s=e.frames.maskOpacityPct.value,c=e.frames.maskShape.value,l=e.frames.trajectoryMode.value,u=e.frames.trajectoryNodesByFrameId.value??{},d=e.exportWidth.value,f=e.exportHeight.value,p=Math.min(1,Math.max(0,(Number(s)||0)/100)),m=hx(a,{mode:o,selectedIds:e.frames.maskSelectedIds.value??[]}),h=()=>{let e=n.current,r=t.viewportShellRef?.current??t.viewportShellRef??null,a=t.renderBoxRef?.current??t.renderBoxRef??null;if(!(e instanceof HTMLCanvasElement)||!(r instanceof HTMLElement))return;let o=e.getContext(`2d`);if(!o)return;let s=Math.max(1,r.clientWidth),h=Math.max(1,r.clientHeight),g=Math.max(1,Math.round(s*1)),_=Math.max(1,Math.round(h*1));e.width!==g&&(e.width=g),e.height!==_&&(e.height=_),e.style.width=`${s}px`,e.style.height=`${h}px`,o.setTransform(1,0,0,1,0,0),o.clearRect(0,0,e.width,e.height),!(i!==`camera`||p<=0||m.length===0||!(a instanceof HTMLElement)||a.offsetWidth<=0||a.offsetHeight<=0)&&(o.scale(1,1),Dx(o,m,{canvasWidth:s,canvasHeight:h,frameSpaceWidth:a.offsetWidth,frameSpaceHeight:a.offsetHeight,logicalSpaceWidth:d,logicalSpaceHeight:f,offsetX:a.offsetLeft,offsetY:a.offsetTop,fillStyle:`rgba(3, 6, 11, ${p})`,frameMaskSettings:{shape:c,trajectoryMode:l,trajectory:{nodesByFrameId:u}}}),o.setTransform(1,0,0,1,0,0))};return r.current=h,Ae(()=>{h()}),Ae(()=>{let e=t.viewportShellRef?.current??t.viewportShellRef??null,n=t.renderBoxRef?.current??t.renderBoxRef??null;if(!(e instanceof HTMLElement)&&!(n instanceof HTMLElement))return;let i=0,a=()=>{i||=window.requestAnimationFrame(()=>{i=0,r.current?.()})},o=typeof ResizeObserver==`function`?new ResizeObserver(()=>{a()}):null;return e instanceof HTMLElement&&o?.observe(e),n instanceof HTMLElement&&o?.observe(n),window.addEventListener(`resize`,a),()=>{i&&window.cancelAnimationFrame(i),window.removeEventListener(`resize`,a),o?.disconnect()}},[t.renderBoxRef,t.viewportShellRef]),i!==`camera`||p<=0||m.length===0?null:M`
		<div class="frame-mask-layer">
			<canvas ref=${n} class="frame-mask-layer__canvas"></canvas>
		</div>
	`}function zE(e,t){return!Number.isFinite(e)||!Number.isFinite(t)||e<0||e>1||t<0||t>1?``:rh({x:e,y:t})}function BE({store:e,controller:t,refs:n,t:r}){let i=je(null),a=e.workbenchCollapsed.value,o=e.splatEdit.active.value,s=e.splatEdit.hudPosition.value,c=e.viewportReferenceImageEditMode.value,l=c||o,u=r(`section.outputFrame`),d=e.referenceImages.previewLayers.value,f=new Set(e.referenceImages.selectedItemIds.value??[]),p=d.filter(e=>e.group===`back`),m=d.filter(e=>e.group!==`back`),h=d.filter(e=>f.has(e.id)),g=h.find(t=>t.id===e.referenceImages.selectedItemId.value)??h[h.length-1]??null,_=e.referenceImages.selectionAnchor.value,v=e.referenceImages.selectionBoxScreen.value,y=h.length===0?null:h.length===1&&g?{leftPx:g.leftPx,topPx:g.topPx,widthPx:g.widthPx,heightPx:g.heightPx,rotationDeg:g.rotationDeg,anchorAx:g.anchorAx,anchorAy:g.anchorAy,anchorHandleKey:zE(g.anchorAx,g.anchorAy)}:v?{leftPx:v.left,topPx:v.top,widthPx:v.width,heightPx:v.height,rotationDeg:v.rotationDeg??0,anchorAx:Number.isFinite(_?.x)?_.x:v.anchorX??.5,anchorAy:Number.isFinite(_?.y)?_.y:v.anchorY??.5,anchorHandleKey:zE(Number.isFinite(_?.x)?_.x:v.anchorX??.5,Number.isFinite(_?.y)?_.y:v.anchorY??.5)}:null,b=e.viewportPieMenu.value,x=e.viewportLensHud.value,S=e.viewportRollHud.value,C=b.open?Gx({mode:e.mode.value,t:r,viewportToolMode:e.viewportToolMode.value,viewportOrthographic:e.mode.value===`viewport`&&e.viewportProjectionMode.value===`orthographic`,referencePreviewSessionVisible:e.referenceImages.previewSessionVisible.value!==!1,hasReferenceImages:(e.referenceImages.items.value?.length??0)>0,frameMaskMode:e.frames.maskMode.value,hasRememberedFrameMaskSelection:(e.frames.maskSelectedIds.value?.length??0)>0}):[],w=C.find(e=>e.id===b.hoveredActionId)??null,T=e=>{e.preventDefault(),e.stopPropagation()},E=e=>{e.preventDefault(),e.stopPropagation(),t()?.closeViewportPieMenu?.()},D=e=>{e.preventDefault(),e.stopPropagation()},O=(e,n)=>{n.preventDefault(),n.stopPropagation(),t()?.executeViewportPieAction?.(e,n)},k=e=>({left:`${e.leftPx}px`,top:`${e.topPx}px`,width:`${e.widthPx}px`,height:`${e.heightPx}px`,opacity:e.opacity,transform:`rotate(${e.rotationDeg}deg)`,transformOrigin:`${e.anchorAx*100}% ${e.anchorAy*100}%`}),A=e=>({imageRendering:e.pixelPerfect?`pixelated`:`auto`}),ee=e=>({left:`${e.leftPx}px`,top:`${e.topPx}px`,width:`${e.widthPx}px`,height:`${e.heightPx}px`,transform:`rotate(${e.rotationDeg}deg)`,transformOrigin:`${e.anchorAx*100}% ${e.anchorAy*100}%`}),te=e=>({left:`${e.anchorAx*100}%`,top:`${e.anchorAy*100}%`}),j=n.viewportShellRef?.current??n.viewportShellRef??null,ne=n.renderBoxRef?.current??n.renderBoxRef??null,re=gE({viewportRect:hE(j,{preferClientSize:!0}),renderBoxRect:hE(ne)}),ie=Number.isFinite(s?.x)&&Number.isFinite(s?.y)?{left:`${s.x}px`,top:`${s.y}px`,right:`auto`,bottom:`auto`,margin:`0`}:void 0,ae=(e,n)=>t()?.startReferenceImageMove?.(e,n),oe=(e,n)=>t()?.startReferenceImageResize?.(e,n),se=(e,n)=>t()?.startReferenceImageRotate?.(e,n);return Ae(()=>{let t=t=>{let n=i.current;if(!n||t.pointerId!==n.pointerId)return;let r=Math.min(Math.max(0,t.clientX-n.shellRect.left-n.offsetX),Math.max(0,n.shellRect.width-n.width)),a=Math.min(Math.max(0,t.clientY-n.shellRect.top-n.offsetY),Math.max(0,n.shellRect.height-n.height));e.splatEdit.hudPosition.value={x:Math.round(r),y:Math.round(a)}},n=e=>{i.current?.pointerId===e.pointerId&&(i.current=null)};return window.addEventListener(`pointermove`,t),window.addEventListener(`pointerup`,n),window.addEventListener(`pointercancel`,n),()=>{window.removeEventListener(`pointermove`,t),window.removeEventListener(`pointerup`,n),window.removeEventListener(`pointercancel`,n)}},[e]),M`
		<main
			id="viewport-shell"
			ref=${n.viewportShellRef}
			class=${a?`viewport-shell viewport-shell--inspector-collapsed`:`viewport-shell viewport-shell--inspector-open`}
		>
			<canvas id="viewport" ref=${n.viewportCanvasRef} tabindex="0"></canvas>
			<${jE} store=${e} controller=${t} t=${r} />
			<${lE} store=${e} t=${r} />
			<${LE}
				store=${e}
				viewportShellRef=${n.viewportShellRef}
			/>
			<div class="viewport-orbit-reticle" aria-hidden="true">
				<div class="viewport-orbit-reticle__ring"></div>
				<div class="viewport-orbit-reticle__dot"></div>
			</div>
			${o&&M`<${IE}
					store=${e}
					controller=${t}
					t=${r}
					style=${ie}
					onDragPointerDown=${e=>{if(e.button!==0)return;let t=n.viewportShellRef?.current??n.viewportShellRef??null,r=e.currentTarget?.closest?.(`.viewport-splat-edit-toolbar`);if(!(t instanceof HTMLElement)||!(r instanceof HTMLElement))return;let a=t.getBoundingClientRect(),o=r.getBoundingClientRect();i.current={pointerId:e.pointerId,offsetX:e.clientX-o.left,offsetY:e.clientY-o.top,width:o.width,height:o.height,shellRect:a},e.currentTarget?.setPointerCapture?.(e.pointerId),e.preventDefault(),e.stopPropagation()}}
				/>`}
			<div
				id="drop-hint"
				ref=${n.dropHintRef}
				class="drop-hint"
				style=${re}
			>
				<span class="drop-hint__meta">
					${`CAMERA_FRAMES ${Rt()}`}
				</span>
				<strong>${r(`drop.title`)}</strong>
				<span>${r(`drop.body`)}</span>
				<div class="drop-hint__controls">
					<strong class="drop-hint__controls-title">
						${r(`drop.controlsTitle`)}
					</strong>
					<div class="drop-hint__controls-grid">
						<span>${r(`drop.controlOrbit`)}</span>
						<span>${r(`drop.controlPan`)}</span>
						<span>${r(`drop.controlDolly`)}</span>
						<span>${r(`drop.controlAnchorOrbit`)}</span>
					</div>
				</div>
			</div>
			<div class="reference-image-layer reference-image-layer--back">
				${p.map(e=>M`
						<div
							key=${e.id}
							class=${f.has(e.id)?c?`reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive`:`reference-image-layer__entry reference-image-layer__entry--selected`:c?`reference-image-layer__entry reference-image-layer__entry--interactive`:`reference-image-layer__entry`}
							style=${k(e)}
							onPointerDown=${c?t=>ae(e.id,t):void 0}
						>
							<img
								class=${e.pixelPerfect?`reference-image-layer__item reference-image-layer__item--pixelated`:`reference-image-layer__item`}
								src=${e.sourceUrl}
								alt=${e.name}
								title=${e.fileName||e.name}
								draggable="false"
								style=${A(e)}
							/>
						</div>
					`)}
			</div>
			${b.open&&M`
					<div
						class=${b.coarse?`viewport-pie viewport-pie--coarse`:`viewport-pie`}
						style=${{left:`${b.x}px`,top:`${b.y}px`,"--cf-pie-scale":String(b.scale??1)}}
					>
						<button
							type="button"
							class="viewport-pie__center"
							onPointerDown=${T}
							onClick=${E}
						>
							<span class="viewport-pie__center-label">
								${w?.label??r(`action.quickMenu`)}
							</span>
						</button>
						${C.map(e=>{let t=Math.cos(e.angle)*(b.radius??88),n=Math.sin(e.angle)*(b.radius??88);return M`
								<button
									key=${e.id}
									type="button"
									class=${[`viewport-pie__item`,e.id===b.hoveredActionId||e.active?`viewport-pie__item--active`:``,e.disabled?`viewport-pie__item--disabled`:``].filter(Boolean).join(` `)}
									style=${{left:`${t}px`,top:`${n}px`}}
									disabled=${!!e.disabled}
									onPointerDown=${D}
									onClick=${t=>e.disabled?void 0:O(e.id,t)}
								>
									<span class="viewport-pie__item-icon">
										<${YC} name=${e.icon} size=${18} />
									</span>
								</button>
							`})}
					</div>
				`}
			${x.visible&&M`
					<div
						class="viewport-lens-hud"
						style=${{left:`${x.x}px`,top:`${x.y}px`}}
					>
						<strong>${x.mmLabel}</strong>
						<span>${x.fovLabel}</span>
					</div>
				`}
			${S.visible&&M`
					<div
						class="viewport-lens-hud viewport-roll-hud"
						style=${{left:`${S.x}px`,top:`${S.y}px`}}
					>
						<strong>${S.angleLabel}</strong>
						<span>${r(`action.adjustRoll`)}</span>
					</div>
				`}
			<${OE} store=${e} controller=${t} t=${r} />
			<${AE}
				controller=${t}
				rootRef=${n.viewportAxisGizmoRef}
				svgRef=${n.viewportAxisGizmoSvgRef}
			/>
			<${RE} store=${e} refs=${n} />
			<div
				id="render-box"
				ref=${n.renderBoxRef}
				class=${l?`render-box render-box--interaction-disabled`:`render-box`}
			>
				<${pE} store=${e} />
				<${TE}
					store=${e}
					controller=${t}
					frameOverlayCanvasRef=${n.frameOverlayCanvasRef}
					canvasOnly=${!0}
					interactionsEnabled=${!l}
				/>
				<${TE}
					store=${e}
					controller=${t}
					itemsOnly=${!0}
					interactionsEnabled=${!l}
				/>
				${ME.map(e=>M`
						<button
							type="button"
							class=${`render-box__resize-handle render-box__resize-handle--${e}`}
							aria-label=${u}
							onPointerDown=${l?void 0:n=>t()?.startOutputFrameResize(e,n)}
						></button>
					`)}
				${NE.map(e=>M`
						<button
							type="button"
							class=${`render-box__pan-edge render-box__pan-edge--${e}`}
							aria-label=${u}
							onPointerDown=${l?void 0:e=>t()?.startOutputFramePan(e)}
						></button>
					`)}
				<div
					id="render-box-meta"
					ref=${n.renderBoxMetaRef}
					class="render-box__meta"
					onPointerDown=${l?void 0:e=>t()?.startOutputFramePan(e)}
				>
					${e.exportSizeLabel.value} · ${e.renderBox.anchor.value}
				</div>
				<div
					id="anchor-dot"
					ref=${n.anchorDotRef}
					class="render-box__anchor"
				></div>
			</div>
			<div class="reference-image-layer reference-image-layer--front">
				${m.map(e=>M`
						<div
							key=${e.id}
							class=${f.has(e.id)?c?`reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive`:`reference-image-layer__entry reference-image-layer__entry--selected`:c?`reference-image-layer__entry reference-image-layer__entry--interactive`:`reference-image-layer__entry`}
							style=${k(e)}
							onPointerDown=${c?t=>ae(e.id,t):void 0}
						>
							<img
								class=${e.pixelPerfect?`reference-image-layer__item reference-image-layer__item--pixelated`:`reference-image-layer__item`}
								src=${e.sourceUrl}
								alt=${e.name}
								title=${e.fileName||e.name}
								draggable="false"
								style=${A(e)}
							/>
						</div>
					`)}
			</div>
			${c&&y&&M`
					<div class="reference-image-selection-layer">
						<div
							class="frame-item frame-item--selected frame-item--active reference-image-transform-box"
							data-anchor-handle=${y.anchorHandleKey}
							style=${ee(y)}
						>
							${NE.map(e=>M`
									<button
										key=${e}
										type="button"
										class=${`frame-item__edge frame-item__edge--${e}`}
										onPointerDown=${e=>ae(g?.id??``,e)}
									></button>
								`)}
							${PE.map(e=>M`
									<button
										key=${e}
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${e}`}
										style=${{cursor:oE(y.rotationDeg,e)}}
										onPointerDown=${t=>oe(e,t)}
									></button>
								`)}
							${FE.map(e=>M`
									<button
										key=${e}
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${e}`}
										style=${{cursor:Rx(y.rotationDeg,e)}}
										onPointerDown=${t=>se(e,t)}
									></button>
								`)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${te(y)}
								onPointerDown=${e=>t()?.startReferenceImageAnchorDrag?.(e)}
							></button>
						</div>
					</div>
				`}
			<div
				id="viewport-gizmo"
				ref=${n.viewportGizmoRef}
				class="viewport-gizmo is-hidden"
			>
				<svg
					class="viewport-gizmo__rings"
					ref=${n.viewportGizmoSvgRef}
					width="100%"
					height="100%"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					${[`xy`,`yz`,`zx`].map(e=>M`
							<path
								key=${`move-${e}`}
								class=${`viewport-gizmo__plane viewport-gizmo__plane--${e}`}
								data-gizmo-plane=${`move-${e}`}
								onPointerEnter=${()=>t()?.setViewportTransformHover(`move-${e}`)}
								onPointerLeave=${()=>t()?.setViewportTransformHover(null)}
								onPointerDown=${n=>t()?.startViewportTransformDrag(`move-${e}`,n)}
							/>
						`)}
					${[`x`,`y`,`z`].flatMap(e=>[M`
							<path
								key=${`rotate-${e}-back`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${e} viewport-gizmo__ring--back`}
								data-gizmo-ring=${`rotate-${e}-back`}
								onPointerEnter=${()=>t()?.setViewportTransformHover(`rotate-${e}`)}
								onPointerLeave=${()=>t()?.setViewportTransformHover(null)}
								onPointerDown=${n=>t()?.startViewportTransformDrag(`rotate-${e}`,n)}
							/>
						`,M`
							<path
								key=${`rotate-${e}-front`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${e} viewport-gizmo__ring--front`}
								data-gizmo-ring=${`rotate-${e}-front`}
								onPointerEnter=${()=>t()?.setViewportTransformHover(`rotate-${e}`)}
								onPointerLeave=${()=>t()?.setViewportTransformHover(null)}
								onPointerDown=${n=>t()?.startViewportTransformDrag(`rotate-${e}`,n)}
							/>
						`])}
				</svg>
				${[{id:`move-x`,label:`X`,className:`viewport-gizmo__handle--axis viewport-gizmo__handle--x`,axis:`x`},{id:`move-y`,label:`Y`,className:`viewport-gizmo__handle--axis viewport-gizmo__handle--y`,axis:`y`},{id:`move-z`,label:`Z`,className:`viewport-gizmo__handle--axis viewport-gizmo__handle--z`,axis:`z`},{id:`scale-uniform`,label:`S`,className:`viewport-gizmo__handle--scale`}].map(e=>M`
						<button
							key=${e.id}
							type="button"
							class=${`viewport-gizmo__handle ${e.className}`}
							data-gizmo-handle=${e.id}
							aria-label=${e.ariaLabel??e.label}
							onPointerEnter=${()=>t()?.setViewportTransformHover(e.id)}
							onPointerLeave=${()=>t()?.setViewportTransformHover(null)}
							onPointerDown=${n=>t()?.startViewportTransformDrag(e.id,n)}
						>
							<span>${e.label}</span>
						</button>
					`)}
			</div>
		</main>
	`}export{MC as $,Al as $a,vh as $i,gb as $n,mn as $o,j_ as $r,MS as $t,_T as A,yd as Aa,_g as Ai,$b as An,J as Ao,Kv as Ar,Pt as As,tC as At,Lw as B,Ut as Ba,ph as Bi,wb as Bn,Kt as Bo,Xv as Br,ke as Bs,GS as Bt,ET as C,sm as Ca,Zh as Ci,lx as Cn,mr as Co,vv as Cr,W as Cs,cC as Ct,wT as D,X as Da,Sg as Di,Ub as Dn,ai as Do,Bv as Dr,Di as Ds,iC as Dt,ST as E,ud as Ea,i_ as Ei,Hb as En,lo as Eo,Iv as Er,bl as Es,aC as Et,hT as F,Ta as Fa,Mh as Fi,Ib as Fn,$c as Fo,xv as Fr,dt as Fs,XS as Ft,Ew as G,tc as Ga,ih as Gi,Jy as Gn,Cs as Go,c_ as Gr,BS as Gt,sT as H,Y as Ha,ch as Hi,Eb as Hn,ta as Ho,l_ as Hr,me as Hs,US as Ht,pT as I,Ua as Ia,Ph as Ii,Lb as In,Qc as Io,Ev as Ir,je as Is,YS as It,LC as J,Ei as Ja,uh as Ji,vb as Jn,qs as Jo,tv as Jr,LS as Jt,Tw as K,ec as Ka,lh as Ki,cb as Kn,zc as Ko,d_ as Kr,zS as Kt,kT as L,io as La,Km as Li,Bb as Ln,Wt as Lo,Tv as Lr,Me as Ls,JS as Lt,bT as M,eu as Ma,vg as Mi,Rb as Mn,Fo as Mo,kv as Mr,Lt as Ms,$S as Mt,vT as N,xl as Na,yg as Ni,Pb as Nn,tl as No,Ov as Nr,zt as Ns,QS as Nt,CT as O,Wu as Oa,zg as Oi,Wb as On,Du as Oo,qv as Or,Ti as Os,rC as Ot,mT as P,os as Pa,Nh as Pi,zb as Pn,el as Po,Wv as Pr,Bt as Ps,ZS as Pt,NC as Q,Ri as Qa,ah as Qi,hb as Qn,vl as Qo,U_ as Qr,NS as Qt,OT as R,Hl as Ra,qm as Ri,xb as Rn,Gt as Ro,Dv as Rr,De as Rs,qS as Rt,MT as S,km as Sa,Xh as Si,fx as Sn,Yt as So,_v as Sr,tn as Ss,lC as St,xT as T,Tm as Ta,Qh as Ti,Kb as Tn,tu as To,Vv as Tr,Ci as Ts,oC as Tt,kw as U,q as Ua,mh as Ui,nb as Un,Zl as Uo,u_ as Ur,HS as Ut,lT as V,Eu as Va,fh as Vi,Db as Vn,gl as Vo,o_ as Vr,M as Vs,WS as Vt,Q as W,su as Wa,sh as Wi,Yy as Wn,Kl as Wo,s_ as Wr,VS as Wt,FC as X,$l as Xa,oh as Xi,fb as Xn,bu as Xo,q_ as Xr,FS as Xt,IC as Y,ss as Ya,hh as Yi,db as Yn,Hs as Yo,X_ as Yr,IS as Yt,PC as Z,yr as Za,_h as Zi,mb as Zn,oi as Zo,O_ as Zr,PS as Zt,IT as _,_m as _a,ig as _i,Wx as _n,Vs as _o,qy as _r,Nl as _s,mC as _t,$T as a,Rm as aa,L_ as ai,ES as an,ds as ao,my as ar,Ht as as,EC as at,NT as b,ym as ba,ng as bi,jx as bn,Zt as bo,iy as br,Qt as bs,dC as bt,XT as c,Am as ca,$_ as ci,pS as cn,ys as co,uy as cr,Xc as cs,CC as ct,UT as d,fm as da,D_ as di,oS as dn,cl as do,Wy as dr,as as ds,bC as dt,Wm as ea,V_ as ei,jS as en,Ka as eo,ub as er,xn as es,jC as et,HT as f,om as fa,rv as fi,cS as fn,ir as fo,Ly as fr,Xa as fs,yC as ft,FT as g,hm as ga,ag as gi,qx as gn,Os as go,Ky as gr,Si as gs,hC as gt,WT as h,pm as ha,qh as hi,Gx as hn,Fu as ho,By as hr,uo as hs,gC as ht,OE as i,Um as ia,I_ as ii,DS as in,iu as io,fy as ir,_n as is,DC as it,yT as j,im as ja,bg as ji,Qb as jn,qo as jo,Sv as jr,Mt as js,eC as jt,TT as k,Z as ka,Fg as ki,tx as kn,K as ko,Cv as kr,Bc as ks,nC as kt,ZT as l,Om as la,Y_ as li,aS as ln,ao as lo,cy as lr,Ic as ls,SC as lt,zT as m,mm as ma,Z_ as mi,Jx as mn,Is as mo,Uy as mr,To as ms,_C as mt,BE as n,Bm as na,Q_ as ni,kS as nn,br as no,lb as nr,Zc as ns,kC as nt,JT as o,Lm as oa,T_ as oi,TS as on,nu as oo,dy as or,pr as os,TC as ot,BT as p,am as pa,iv as pi,lS as pn,ar as po,zy as pr,Jl as ps,vC as pt,YC as q,Oi as qa,dh as qi,yb as qn,Xl as qo,f_ as qr,RS as qt,jE as r,Vm as ra,F_ as ri,OS as rn,na as ro,py as rr,Cu as rs,OC as rt,QT as s,Hm as sa,nv as si,wS as sn,xu as so,ly as sr,ua as ss,wC as st,IE as t,Gm as ta,G_ as ti,AS as tn,an as to,pb as tr,bn as ts,AC as tt,YT as u,dm as ua,x_ as ui,sS as un,so as uo,sy as ur,us,xC as ut,LT as v,gm as va,tg as vi,Rx as vn,Bs as vo,Ry as vr,Wa as vs,pC as vt,DT as w,Dm as wa,$h as wi,Gb as wn,Dl as wo,Jv as wr,G as ws,sC as wt,PT as x,bm as xa,rg as xi,hx as xn,Xt as xo,ny as xr,rn as xs,uC as xt,RT as y,cm as ya,eg as yi,Ax as yn,Jt as yo,ry as yr,qc as ys,fC as yt,dT as z,Ru as za,gh as zi,Tb as zn,qt as zo,wv as zr,Ne as zs,KS as zt};