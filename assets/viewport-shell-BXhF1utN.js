(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();var qr,J,rh,sh,At,Ha,oh,ah,lh,Wo,ao,lo,$r={},kr=[],Up=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Si=Array.isArray;function pt(n,e){for(var t in e)n[t]=e[t];return n}function Xo(n){n&&n.parentNode&&n.parentNode.removeChild(n)}function kn(n,e,t){var i,r,s,o={};for(s in e)s=="key"?i=e[s]:s=="ref"?r=e[s]:o[s]=e[s];if(arguments.length>2&&(o.children=arguments.length>3?qr.call(arguments,2):t),typeof n=="function"&&n.defaultProps!=null)for(s in n.defaultProps)o[s]===void 0&&(o[s]=n.defaultProps[s]);return br(n,o,i,r,null)}function br(n,e,t,i,r){var s={type:n,props:e,key:t,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++rh,__i:-1,__u:0};return r==null&&J.vnode!=null&&J.vnode(s),s}function Ut(n){return n.children}function it(n,e){this.props=n,this.context=e}function En(n,e){if(e==null)return n.__?En(n.__,n.__i+1):null;for(var t;e<n.__k.length;e++)if((t=n.__k[e])!=null&&t.__e!=null)return t.__e;return typeof n.type=="function"?En(n):null}function Hp(n){if(n.__P&&n.__d){var e=n.__v,t=e.__e,i=[],r=[],s=pt({},e);s.__v=e.__v+1,J.vnode&&J.vnode(s),Yo(n.__P,s,e,n.__n,n.__P.namespaceURI,32&e.__u?[t]:null,i,t??En(e),!!(32&e.__u),r),s.__v=e.__v,s.__.__k[s.__i]=s,dh(i,s,r),e.__e=e.__=null,s.__e!=t&&ch(s)}}function ch(n){if((n=n.__)!=null&&n.__c!=null)return n.__e=n.__c.base=null,n.__k.some(function(e){if(e!=null&&e.__e!=null)return n.__e=n.__c.base=e.__e}),ch(n)}function Ga(n){(!n.__d&&(n.__d=!0)&&At.push(n)&&!Er.__r++||Ha!=J.debounceRendering)&&((Ha=J.debounceRendering)||oh)(Er)}function Er(){try{for(var n,e=1;At.length;)At.length>e&&At.sort(ah),n=At.shift(),e=At.length,Hp(n)}finally{At.length=Er.__r=0}}function hh(n,e,t,i,r,s,o,a,c,l,u){var h,d,p,m,f,g,y,_=i&&i.__k||kr,M=e.length;for(c=Gp(t,e,_,c,M),h=0;h<M;h++)(p=t.__k[h])!=null&&(d=p.__i!=-1&&_[p.__i]||$r,p.__i=h,g=Yo(n,p,d,r,s,o,a,c,l,u),m=p.__e,p.ref&&d.ref!=p.ref&&(d.ref&&qo(d.ref,null,p),u.push(p.ref,p.__c||m,p)),f==null&&m!=null&&(f=m),(y=!!(4&p.__u))||d.__k===p.__k?c=uh(p,c,n,y):typeof p.type=="function"&&g!==void 0?c=g:m&&(c=m.nextSibling),p.__u&=-7);return t.__e=f,c}function Gp(n,e,t,i,r){var s,o,a,c,l,u=t.length,h=u,d=0;for(n.__k=new Array(r),s=0;s<r;s++)(o=e[s])!=null&&typeof o!="boolean"&&typeof o!="function"?(typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?o=n.__k[s]=br(null,o,null,null,null):Si(o)?o=n.__k[s]=br(Ut,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=n.__k[s]=br(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):n.__k[s]=o,c=s+d,o.__=n,o.__b=n.__b+1,a=null,(l=o.__i=Wp(o,t,c,h))!=-1&&(h--,(a=t[l])&&(a.__u|=2)),a==null||a.__v==null?(l==-1&&(r>u?d--:r<u&&d++),typeof o.type!="function"&&(o.__u|=4)):l!=c&&(l==c-1?d--:l==c+1?d++:(l>c?d--:d++,o.__u|=4))):n.__k[s]=null;if(h)for(s=0;s<u;s++)(a=t[s])!=null&&(2&a.__u)==0&&(a.__e==i&&(i=En(a)),mh(a,a));return i}function uh(n,e,t,i){var r,s;if(typeof n.type=="function"){for(r=n.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=n,e=uh(r[s],e,t,i));return e}n.__e!=e&&(i&&(e&&n.type&&!e.parentNode&&(e=En(n)),t.insertBefore(n.__e,e||null)),e=n.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Tr(n,e){return e=e||[],n==null||typeof n=="boolean"||(Si(n)?n.some(function(t){Tr(t,e)}):e.push(n)),e}function Wp(n,e,t,i){var r,s,o,a=n.key,c=n.type,l=e[t],u=l!=null&&(2&l.__u)==0;if(l===null&&a==null||u&&a==l.key&&c==l.type)return t;if(i>(u?1:0)){for(r=t-1,s=t+1;r>=0||s<e.length;)if((l=e[o=r>=0?r--:s++])!=null&&(2&l.__u)==0&&a==l.key&&c==l.type)return o}return-1}function Wa(n,e,t){e[0]=="-"?n.setProperty(e,t??""):n[e]=t==null?"":typeof t!="number"||Up.test(e)?t:t+"px"}function Di(n,e,t,i,r){var s,o;e:if(e=="style")if(typeof t=="string")n.style.cssText=t;else{if(typeof i=="string"&&(n.style.cssText=i=""),i)for(e in i)t&&e in t||Wa(n.style,e,"");if(t)for(e in t)i&&t[e]==i[e]||Wa(n.style,e,t[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(lh,"$1")),o=e.toLowerCase(),e=o in n||e=="onFocusOut"||e=="onFocusIn"?o.slice(2):e.slice(2),n.l||(n.l={}),n.l[e+s]=t,t?i?t.u=i.u:(t.u=Wo,n.addEventListener(e,s?lo:ao,s)):n.removeEventListener(e,s?lo:ao,s);else{if(r=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in n)try{n[e]=t??"";break e}catch{}typeof t=="function"||(t==null||t===!1&&e[4]!="-"?n.removeAttribute(e):n.setAttribute(e,e=="popover"&&t==1?"":t))}}function Xa(n){return function(e){if(this.l){var t=this.l[e.type+n];if(e.t==null)e.t=Wo++;else if(e.t<t.u)return;return t(J.event?J.event(e):e)}}}function Yo(n,e,t,i,r,s,o,a,c,l){var u,h,d,p,m,f,g,y,_,M,x,v,P,E,S,C=e.type;if(e.constructor!==void 0)return null;128&t.__u&&(c=!!(32&t.__u),s=[a=e.__e=t.__e]),(u=J.__b)&&u(e);e:if(typeof C=="function")try{if(y=e.props,_=C.prototype&&C.prototype.render,M=(u=C.contextType)&&i[u.__c],x=u?M?M.props.value:u.__:i,t.__c?g=(h=e.__c=t.__c).__=h.__E:(_?e.__c=h=new C(y,x):(e.__c=h=new it(y,x),h.constructor=C,h.render=Yp),M&&M.sub(h),h.state||(h.state={}),h.__n=i,d=h.__d=!0,h.__h=[],h._sb=[]),_&&h.__s==null&&(h.__s=h.state),_&&C.getDerivedStateFromProps!=null&&(h.__s==h.state&&(h.__s=pt({},h.__s)),pt(h.__s,C.getDerivedStateFromProps(y,h.__s))),p=h.props,m=h.state,h.__v=e,d)_&&C.getDerivedStateFromProps==null&&h.componentWillMount!=null&&h.componentWillMount(),_&&h.componentDidMount!=null&&h.__h.push(h.componentDidMount);else{if(_&&C.getDerivedStateFromProps==null&&y!==p&&h.componentWillReceiveProps!=null&&h.componentWillReceiveProps(y,x),e.__v==t.__v||!h.__e&&h.shouldComponentUpdate!=null&&h.shouldComponentUpdate(y,h.__s,x)===!1){e.__v!=t.__v&&(h.props=y,h.state=h.__s,h.__d=!1),e.__e=t.__e,e.__k=t.__k,e.__k.some(function(k){k&&(k.__=e)}),kr.push.apply(h.__h,h._sb),h._sb=[],h.__h.length&&o.push(h);break e}h.componentWillUpdate!=null&&h.componentWillUpdate(y,h.__s,x),_&&h.componentDidUpdate!=null&&h.__h.push(function(){h.componentDidUpdate(p,m,f)})}if(h.context=x,h.props=y,h.__P=n,h.__e=!1,v=J.__r,P=0,_)h.state=h.__s,h.__d=!1,v&&v(e),u=h.render(h.props,h.state,h.context),kr.push.apply(h.__h,h._sb),h._sb=[];else do h.__d=!1,v&&v(e),u=h.render(h.props,h.state,h.context),h.state=h.__s;while(h.__d&&++P<25);h.state=h.__s,h.getChildContext!=null&&(i=pt(pt({},i),h.getChildContext())),_&&!d&&h.getSnapshotBeforeUpdate!=null&&(f=h.getSnapshotBeforeUpdate(p,m)),E=u!=null&&u.type===Ut&&u.key==null?ph(u.props.children):u,a=hh(n,Si(E)?E:[E],e,t,i,r,s,o,a,c,l),h.base=e.__e,e.__u&=-161,h.__h.length&&o.push(h),g&&(h.__E=h.__=null)}catch(k){if(e.__v=null,c||s!=null)if(k.then){for(e.__u|=c?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;s[s.indexOf(a)]=null,e.__e=a}else{for(S=s.length;S--;)Xo(s[S]);co(e)}else e.__e=t.__e,e.__k=t.__k,k.then||co(e);J.__e(k,e,t)}else s==null&&e.__v==t.__v?(e.__k=t.__k,e.__e=t.__e):a=e.__e=Xp(t.__e,e,t,i,r,s,o,c,l);return(u=J.diffed)&&u(e),128&e.__u?void 0:a}function co(n){n&&(n.__c&&(n.__c.__e=!0),n.__k&&n.__k.some(co))}function dh(n,e,t){for(var i=0;i<t.length;i++)qo(t[i],t[++i],t[++i]);J.__c&&J.__c(e,n),n.some(function(r){try{n=r.__h,r.__h=[],n.some(function(s){s.call(r)})}catch(s){J.__e(s,r.__v)}})}function ph(n){return typeof n!="object"||n==null||n.__b>0?n:Si(n)?n.map(ph):pt({},n)}function Xp(n,e,t,i,r,s,o,a,c){var l,u,h,d,p,m,f,g=t.props||$r,y=e.props,_=e.type;if(_=="svg"?r="http://www.w3.org/2000/svg":_=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),s!=null){for(l=0;l<s.length;l++)if((p=s[l])&&"setAttribute"in p==!!_&&(_?p.localName==_:p.nodeType==3)){n=p,s[l]=null;break}}if(n==null){if(_==null)return document.createTextNode(y);n=document.createElementNS(r,_,y.is&&y),a&&(J.__m&&J.__m(e,s),a=!1),s=null}if(_==null)g===y||a&&n.data==y||(n.data=y);else{if(s=s&&qr.call(n.childNodes),!a&&s!=null)for(g={},l=0;l<n.attributes.length;l++)g[(p=n.attributes[l]).name]=p.value;for(l in g)p=g[l],l=="dangerouslySetInnerHTML"?h=p:l=="children"||l in y||l=="value"&&"defaultValue"in y||l=="checked"&&"defaultChecked"in y||Di(n,l,null,p,r);for(l in y)p=y[l],l=="children"?d=p:l=="dangerouslySetInnerHTML"?u=p:l=="value"?m=p:l=="checked"?f=p:a&&typeof p!="function"||g[l]===p||Di(n,l,p,g[l],r);if(u)a||h&&(u.__html==h.__html||u.__html==n.innerHTML)||(n.innerHTML=u.__html),e.__k=[];else if(h&&(n.innerHTML=""),hh(e.type=="template"?n.content:n,Si(d)?d:[d],e,t,i,_=="foreignObject"?"http://www.w3.org/1999/xhtml":r,s,o,s?s[0]:t.__k&&En(t,0),a,c),s!=null)for(l=s.length;l--;)Xo(s[l]);a||(l="value",_=="progress"&&m==null?n.removeAttribute("value"):m!=null&&(m!==n[l]||_=="progress"&&!m||_=="option"&&m!=g[l])&&Di(n,l,m,g[l],r),l="checked",f!=null&&f!=n[l]&&Di(n,l,f,g[l],r))}return n}function qo(n,e,t){try{if(typeof n=="function"){var i=typeof n.__u=="function";i&&n.__u(),i&&e==null||(n.__u=n(e))}else n.current=e}catch(r){J.__e(r,t)}}function mh(n,e,t){var i,r;if(J.unmount&&J.unmount(n),(i=n.ref)&&(i.current&&i.current!=n.__e||qo(i,null,e)),(i=n.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(s){J.__e(s,e)}i.base=i.__P=null}if(i=n.__k)for(r=0;r<i.length;r++)i[r]&&mh(i[r],e,t||typeof n.type!="function");t||Xo(n.__e),n.__c=n.__=n.__e=void 0}function Yp(n,e,t){return this.constructor(n,t)}function Ya(n,e,t){var i,r,s,o;e==document&&(e=document.documentElement),J.__&&J.__(n,e),r=(i=!1)?null:e.__k,s=[],o=[],Yo(e,n=e.__k=kn(Ut,null,[n]),r||$r,$r,e.namespaceURI,r?null:e.firstChild?qr.call(e.childNodes):null,s,r?r.__e:e.firstChild,i,o),dh(s,n,o)}qr=kr.slice,J={__e:function(n,e,t,i){for(var r,s,o;e=e.__;)if((r=e.__c)&&!r.__)try{if((s=r.constructor)&&s.getDerivedStateFromError!=null&&(r.setState(s.getDerivedStateFromError(n)),o=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(n,i||{}),o=r.__d),o)return r.__E=r}catch(a){n=a}throw n}},rh=0,sh=function(n){return n!=null&&n.constructor===void 0},it.prototype.setState=function(n,e){var t;t=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=pt({},this.state),typeof n=="function"&&(n=n(pt({},t),this.props)),n&&pt(t,n),n!=null&&this.__v&&(e&&this._sb.push(e),Ga(this))},it.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),Ga(this))},it.prototype.render=Ut,At=[],oh=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ah=function(n,e){return n.__v.__b-e.__v.__b},Er.__r=0,lh=/(PointerCapture)$|Capture$/i,Wo=0,ao=Xa(!1),lo=Xa(!0);var fh=function(n,e,t,i){var r;e[0]=0;for(var s=1;s<e.length;s++){var o=e[s++],a=e[s]?(e[0]|=o?1:2,t[e[s++]]):e[++s];o===3?i[0]=a:o===4?i[1]=Object.assign(i[1]||{},a):o===5?(i[1]=i[1]||{})[e[++s]]=a:o===6?i[1][e[++s]]+=a+"":o?(r=n.apply(a,fh(n,a,t,["",null])),i.push(r),a[0]?e[0]|=2:(e[s-2]=0,e[s]=r)):i.push(a)}return i},qa=new Map;function qp(n){var e=qa.get(this);return e||(e=new Map,qa.set(this,e)),(e=fh(this,e.get(n)||(e.set(n,e=(function(t){for(var i,r,s=1,o="",a="",c=[0],l=function(d){s===1&&(d||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?c.push(0,d,o):s===3&&(d||o)?(c.push(3,d,o),s=2):s===2&&o==="..."&&d?c.push(4,d,0):s===2&&o&&!d?c.push(5,0,!0,o):s>=5&&((o||!d&&s===5)&&(c.push(s,0,o,r),s=6),d&&(c.push(s,d,0,r),s=6)),o=""},u=0;u<t.length;u++){u&&(s===1&&l(),l(u));for(var h=0;h<t[u].length;h++)i=t[u][h],s===1?i==="<"?(l(),c=[c],s=3):o+=i:s===4?o==="--"&&i===">"?(s=1,o=""):o=i+o[0]:a?i===a?a="":o+=i:i==='"'||i==="'"?a=i:i===">"?(l(),s=1):s&&(i==="="?(s=5,r=o,o=""):i==="/"&&(s<5||t[u][h+1]===">")?(l(),s===3&&(c=c[0]),s=c,(c=c[0]).push(2,0,s),s=0):i===" "||i==="	"||i===`
`||i==="\r"?(l(),s=2):o+=i),s===3&&o==="!--"&&(s=4,c=c[0])}return l(),c})(n)),e),arguments,[])).length>1?e:e[0]}var w=qp.bind(kn),Tn,de,gs,Za,ci=0,gh=[],fe=J,Ja=fe.__b,Ka=fe.__r,Qa=fe.diffed,el=fe.__c,tl=fe.unmount,nl=fe.__;function Zr(n,e){fe.__h&&fe.__h(de,n,ci||e),ci=0;var t=de.__H||(de.__H={__:[],__h:[]});return n>=t.__.length&&t.__.push({}),t.__[n]}function ge(n){return ci=1,Zp(yh,n)}function Zp(n,e,t){var i=Zr(Tn++,2);if(i.t=n,!i.__c&&(i.__=[t?t(e):yh(void 0,e),function(a){var c=i.__N?i.__N[0]:i.__[0],l=i.t(c,a);c!==l&&(i.__N=[l,i.__[1]],i.__c.setState({}))}],i.__c=de,!de.__f)){var r=function(a,c,l){if(!i.__c.__H)return!0;var u=i.__c.__H.__.filter(function(d){return d.__c});if(u.every(function(d){return!d.__N}))return!s||s.call(this,a,c,l);var h=i.__c.props!==a;return u.some(function(d){if(d.__N){var p=d.__[0];d.__=d.__N,d.__N=void 0,p!==d.__[0]&&(h=!0)}}),s&&s.call(this,a,c,l)||h};de.__f=!0;var s=de.shouldComponentUpdate,o=de.componentWillUpdate;de.componentWillUpdate=function(a,c,l){if(this.__e){var u=s;s=void 0,r(a,c,l),s=u}o&&o.call(this,a,c,l)},de.shouldComponentUpdate=r}return i.__N||i.__}function Re(n,e){var t=Zr(Tn++,3);!fe.__s&&Zo(t.__H,e)&&(t.__=n,t.u=e,de.__H.__h.push(t))}function ho(n,e){var t=Zr(Tn++,4);!fe.__s&&Zo(t.__H,e)&&(t.__=n,t.u=e,de.__h.push(t))}function we(n){return ci=5,Jr(function(){return{current:n}},[])}function Jr(n,e){var t=Zr(Tn++,7);return Zo(t.__H,e)&&(t.__=n(),t.__H=e,t.__h=n),t.__}function Kx(n,e){return ci=8,Jr(function(){return n},e)}function Jp(){for(var n;n=gh.shift();){var e=n.__H;if(n.__P&&e)try{e.__h.some(xr),e.__h.some(uo),e.__h=[]}catch(t){e.__h=[],fe.__e(t,n.__v)}}}fe.__b=function(n){de=null,Ja&&Ja(n)},fe.__=function(n,e){n&&e.__k&&e.__k.__m&&(n.__m=e.__k.__m),nl&&nl(n,e)},fe.__r=function(n){Ka&&Ka(n),Tn=0;var e=(de=n.__c).__H;e&&(gs===de?(e.__h=[],de.__h=[],e.__.some(function(t){t.__N&&(t.__=t.__N),t.u=t.__N=void 0})):(e.__h.some(xr),e.__h.some(uo),e.__h=[],Tn=0)),gs=de},fe.diffed=function(n){Qa&&Qa(n);var e=n.__c;e&&e.__H&&(e.__H.__h.length&&(gh.push(e)!==1&&Za===fe.requestAnimationFrame||((Za=fe.requestAnimationFrame)||Kp)(Jp)),e.__H.__.some(function(t){t.u&&(t.__H=t.u),t.u=void 0})),gs=de=null},fe.__c=function(n,e){e.some(function(t){try{t.__h.some(xr),t.__h=t.__h.filter(function(i){return!i.__||uo(i)})}catch(i){e.some(function(r){r.__h&&(r.__h=[])}),e=[],fe.__e(i,t.__v)}}),el&&el(n,e)},fe.unmount=function(n){tl&&tl(n);var e,t=n.__c;t&&t.__H&&(t.__H.__.some(function(i){try{xr(i)}catch(r){e=r}}),t.__H=void 0,e&&fe.__e(e,t.__v))};var il=typeof requestAnimationFrame=="function";function Kp(n){var e,t=function(){clearTimeout(i),il&&cancelAnimationFrame(e),setTimeout(n)},i=setTimeout(t,35);il&&(e=requestAnimationFrame(t))}function xr(n){var e=de,t=n.__c;typeof t=="function"&&(n.__c=void 0,t()),de=e}function uo(n){var e=de;n.__c=n.__(),de=e}function Zo(n,e){return!n||n.length!==e.length||e.some(function(t,i){return t!==n[i]})}function yh(n,e){return typeof e=="function"?e(n):e}const Qp="4c593992";var em=Symbol.for("preact-signals");function Kr(){if(gt>1)gt--;else{var n,e=!1;for((function(){var r=Cr;for(Cr=void 0;r!==void 0;)r.S.v===r.v&&(r.S.i=r.i),r=r.o})();ti!==void 0;){var t=ti;for(ti=void 0,Ar++;t!==void 0;){var i=t.u;if(t.u=void 0,t.f&=-3,!(8&t.f)&&xh(t))try{t.c()}catch(r){e||(n=r,e=!0)}t=i}}if(Ar=0,gt--,e)throw n}}function tm(n){if(gt>0)return n();po=++nm,gt++;try{return n()}finally{Kr()}}var re=void 0;function _h(n){var e=re;re=void 0;try{return n()}finally{re=e}}var ti=void 0,gt=0,Ar=0,nm=0,po=0,Cr=void 0,Fr=0;function bh(n){if(re!==void 0){var e=n.n;if(e===void 0||e.t!==re)return e={i:0,S:n,p:re.s,n:void 0,t:re,e:void 0,x:void 0,r:e},re.s!==void 0&&(re.s.n=e),re.s=e,n.n=e,32&re.f&&n.S(e),e;if(e.i===-1)return e.i=0,e.n!==void 0&&(e.n.p=e.p,e.p!==void 0&&(e.p.n=e.n),e.p=re.s,e.n=void 0,re.s.n=e,re.s=e),e}}function Se(n,e){this.v=n,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=e==null?void 0:e.watched,this.Z=e==null?void 0:e.unwatched,this.name=e==null?void 0:e.name}Se.prototype.brand=em;Se.prototype.h=function(){return!0};Se.prototype.S=function(n){var e=this,t=this.t;t!==n&&n.e===void 0&&(n.x=t,this.t=n,t!==void 0?t.e=n:_h(function(){var i;(i=e.W)==null||i.call(e)}))};Se.prototype.U=function(n){var e=this;if(this.t!==void 0){var t=n.e,i=n.x;t!==void 0&&(t.x=i,n.e=void 0),i!==void 0&&(i.e=t,n.x=void 0),n===this.t&&(this.t=i,i===void 0&&_h(function(){var r;(r=e.Z)==null||r.call(e)}))}};Se.prototype.subscribe=function(n){var e=this;return $i(function(){var t=e.value,i=re;re=void 0;try{n(t)}finally{re=i}},{name:"sub"})};Se.prototype.valueOf=function(){return this.value};Se.prototype.toString=function(){return this.value+""};Se.prototype.toJSON=function(){return this.value};Se.prototype.peek=function(){var n=re;re=void 0;try{return this.value}finally{re=n}};Object.defineProperty(Se.prototype,"value",{get:function(){var n=bh(this);return n!==void 0&&(n.i=this.i),this.v},set:function(n){if(n!==this.v){if(Ar>100)throw new Error("Cycle detected");(function(t){gt!==0&&Ar===0&&t.l!==po&&(t.l=po,Cr={S:t,v:t.v,i:t.i,o:Cr})})(this),this.v=n,this.i++,Fr++,gt++;try{for(var e=this.t;e!==void 0;e=e.x)e.t.N()}finally{Kr()}}}});function I(n,e){return new Se(n,e)}function xh(n){for(var e=n.s;e!==void 0;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function vh(n){for(var e=n.s;e!==void 0;e=e.n){var t=e.S.n;if(t!==void 0&&(e.r=t),e.S.n=e,e.i=-1,e.n===void 0){n.s=e;break}}}function wh(n){for(var e=n.s,t=void 0;e!==void 0;){var i=e.p;e.i===-1?(e.S.U(e),i!==void 0&&(i.n=e.n),e.n!==void 0&&(e.n.p=i)):t=e,e.S.n=e.r,e.r!==void 0&&(e.r=void 0),e=i}n.s=t}function Gt(n,e){Se.call(this,void 0),this.x=n,this.s=void 0,this.g=Fr-1,this.f=4,this.W=e==null?void 0:e.watched,this.Z=e==null?void 0:e.unwatched,this.name=e==null?void 0:e.name}Gt.prototype=new Se;Gt.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===Fr))return!0;if(this.g=Fr,this.f|=1,this.i>0&&!xh(this))return this.f&=-2,!0;var n=re;try{vh(this),re=this;var e=this.x();(16&this.f||this.v!==e||this.i===0)&&(this.v=e,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return re=n,wh(this),this.f&=-2,!0};Gt.prototype.S=function(n){if(this.t===void 0){this.f|=36;for(var e=this.s;e!==void 0;e=e.n)e.S.S(e)}Se.prototype.S.call(this,n)};Gt.prototype.U=function(n){if(this.t!==void 0&&(Se.prototype.U.call(this,n),this.t===void 0)){this.f&=-33;for(var e=this.s;e!==void 0;e=e.n)e.S.U(e)}};Gt.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var n=this.t;n!==void 0;n=n.x)n.t.N()}};Object.defineProperty(Gt.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var n=bh(this);if(this.h(),n!==void 0&&(n.i=this.i),16&this.f)throw this.v;return this.v}});function V(n,e){return new Gt(n,e)}function Mh(n){var e=n.m;if(n.m=void 0,typeof e=="function"){gt++;var t=re;re=void 0;try{e()}catch(i){throw n.f&=-2,n.f|=8,Jo(n),i}finally{re=t,Kr()}}}function Jo(n){for(var e=n.s;e!==void 0;e=e.n)e.S.U(e);n.x=void 0,n.s=void 0,Mh(n)}function im(n){if(re!==this)throw new Error("Out-of-order effect");wh(this),re=n,this.f&=-2,8&this.f&&Jo(this),Kr()}function Rn(n,e){this.x=n,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=e==null?void 0:e.name}Rn.prototype.c=function(){var n=this.S();try{if(8&this.f||this.x===void 0)return;var e=this.x();typeof e=="function"&&(this.m=e)}finally{n()}};Rn.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Mh(this),vh(this),gt++;var n=re;return re=this,im.bind(this,n)};Rn.prototype.N=function(){2&this.f||(this.f|=2,this.u=ti,ti=this)};Rn.prototype.d=function(){this.f|=8,1&this.f||Jo(this)};Rn.prototype.dispose=function(){this.d()};function $i(n,e){var t=new Rn(n,e);try{t.c()}catch(r){throw t.d(),r}var i=t.d.bind(t);return i[Symbol.dispose]=i,i}var Sh,Ni,rm=typeof window<"u"&&!!window.__PREACT_SIGNALS_DEVTOOLS__,$h=[];$i(function(){Sh=this.N})();function In(n,e){J[n]=e.bind(null,J[n]||function(){})}function Pr(n){if(Ni){var e=Ni;Ni=void 0,e()}Ni=n&&n.S()}function kh(n){var e=this,t=n.data,i=om(t);i.value=t;var r=Jr(function(){for(var a=e,c=e.__v;c=c.__;)if(c.__c){c.__c.__$f|=4;break}var l=V(function(){var p=i.value.value;return p===0?0:p===!0?"":p||""}),u=V(function(){return!Array.isArray(l.value)&&!sh(l.value)}),h=$i(function(){if(this.N=Eh,u.value){var p=l.value;a.__v&&a.__v.__e&&a.__v.__e.nodeType===3&&(a.__v.__e.data=p)}}),d=e.__$u.d;return e.__$u.d=function(){h(),d.call(this)},[u,l]},[]),s=r[0],o=r[1];return s.value?o.peek():o.value}kh.displayName="ReactiveTextNode";Object.defineProperties(Se.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:kh},props:{configurable:!0,get:function(){var n=this;return{data:{get value(){return n.value}}}}},__b:{configurable:!0,value:1}});In("__b",function(n,e){if(typeof e.type=="string"){var t,i=e.props;for(var r in i)if(r!=="children"){var s=i[r];s instanceof Se&&(t||(e.__np=t={}),t[r]=s,i[r]=s.peek())}}n(e)});In("__r",function(n,e){if(n(e),e.type!==Ut){Pr();var t,i=e.__c;i&&(i.__$f&=-2,(t=i.__$u)===void 0&&(i.__$u=t=(function(r,s){var o;return $i(function(){o=this},{name:s}),o.c=r,o})(function(){var r;rm&&((r=t.y)==null||r.call(t)),i.__$f|=1,i.setState({})},typeof e.type=="function"?e.type.displayName||e.type.name:""))),Pr(t)}});In("__e",function(n,e,t,i){Pr(),n(e,t,i)});In("diffed",function(n,e){Pr();var t;if(typeof e.type=="string"&&(t=e.__e)){var i=e.__np,r=e.props;if(i){var s=t.U;if(s)for(var o in s){var a=s[o];a!==void 0&&!(o in i)&&(a.d(),s[o]=void 0)}else s={},t.U=s;for(var c in i){var l=s[c],u=i[c];l===void 0?(l=sm(t,c,u),s[c]=l):l.o(u,r)}for(var h in i)r[h]=i[h]}}n(e)});function sm(n,e,t,i){var r=e in n&&n.ownerSVGElement===void 0,s=I(t),o=t.peek();return{o:function(a,c){s.value=a,o=a.peek()},d:$i(function(){this.N=Eh;var a=s.value.value;o!==a?(o=void 0,r?n[e]=a:a!=null&&(a!==!1||e[4]==="-")?n.setAttribute(e,a):n.removeAttribute(e)):o=void 0})}}In("unmount",function(n,e){if(typeof e.type=="string"){var t=e.__e;if(t){var i=t.U;if(i){t.U=void 0;for(var r in i){var s=i[r];s&&s.d()}}}e.__np=void 0}else{var o=e.__c;if(o){var a=o.__$u;a&&(o.__$u=void 0,a.d())}}n(e)});In("__h",function(n,e,t,i){(i<3||i===9)&&(e.__$f|=2),n(e,t,i)});it.prototype.shouldComponentUpdate=function(n,e){if(this.__R)return!0;var t=this.__$u,i=t&&t.s!==void 0;for(var r in e)return!0;if(this.__f||typeof this.u=="boolean"&&this.u===!0){var s=2&this.__$f;if(!(i||s||4&this.__$f)||1&this.__$f)return!0}else if(!(i||4&this.__$f)||3&this.__$f)return!0;for(var o in n)if(o!=="__source"&&n[o]!==this.props[o])return!0;for(var a in this.props)if(!(a in n))return!0;return!1};function om(n,e){return Jr(function(){return I(n,e)},[])}var am=function(n){queueMicrotask(function(){queueMicrotask(n)})};function lm(){tm(function(){for(var n;n=$h.shift();)Sh.call(n)})}function Eh(){$h.push(this)===1&&(J.requestAnimationFrame||am)(lm)}const cm="camera-frames",hm="0.17.11",um="4892e35",dm="main",pm="4c593992",mm="2026-04-25T02:23:11.650Z",rl="__CAMERA_FRAMES_RUNTIME_SEQUENCE__",fm="__CAMERA_FRAMES_ACTIVE_RUNTIME__",Qx=!1,gm=I(Qp);function ym(n=(e=>(e=globalThis.location)==null?void 0:e.search)()??""){try{return new URLSearchParams(n)}catch{return new URLSearchParams}}const Th=Object.freeze({name:cm,version:hm,commit:um,branch:dm,codeStamp:pm,builtAt:mm});function _m(){const e=Number(globalThis[rl]??0)+1;return globalThis[rl]=e,e}function bm(n){return`${Date.now().toString(36)}-${n.toString(36)}`}function ev(){const n=_m(),e=Object.freeze({id:bm(n),sequence:n,startedAt:new Date().toISOString()});return globalThis[fm]=e,e}function xm(){return`v${Th.version}`}function tv(){return gm.value||Th.codeStamp||null}function nv(n,{search:e=(t=>(t=globalThis.location)==null?void 0:t.search)()??""}={}){const i=ym(e);if(!i.has(n))return!1;const r=String(i.get(n)??"").trim().toLowerCase();return r===""||r==="1"||r==="true"||r==="yes"||r==="on"}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ah="180",iv=0,rv=1,sv=2,ov=1,av=2,lv=3,mo=0,Ch=1,cv=2,vm=0,sl=1,hv=2,uv=3,dv=4,pv=5,ol=100,mv=101,fv=102,gv=103,yv=104,_v=200,bv=201,xv=202,vv=203,al=204,ll=205,wv=206,Mv=207,Sv=208,$v=209,kv=210,Ev=211,Tv=212,Av=213,Cv=214,Fv=0,Pv=1,Rv=2,cl=3,Iv=4,Dv=5,Nv=6,Lv=7,wm=0,zv=1,Ov=2,Bv=0,jv=1,Vv=2,Uv=3,Hv=4,Gv=5,Wv=6,Xv=7,hl="attached",Mm="detached",Fh=300,Sm=301,Yv=302,qv=303,Zv=304,Jv=306,ul=1e3,vn=1001,dl=1002,Rt=1003,Kv=1004,Qv=1005,Rr=1006,e1=1007,Ph=1008,t1=1008,Ko=1009,$m=1010,km=1011,Em=1012,Tm=1013,Rh=1014,Qr=1015,Am=1016,Cm=1017,Fm=1018,n1=1020,Pm=35902,Rm=35899,Im=1021,Dm=1022,Qo=1023,pl=1026,Nm=1027,Ih=1028,Lm=1029,zm=1030,Om=1031,Bm=1033,jm=33776,Vm=33777,Um=33778,Hm=33779,Gm=35840,Wm=35841,Xm=35842,Ym=35843,qm=36196,Zm=37492,Jm=37496,Km=37808,Qm=37809,ef=37810,tf=37811,nf=37812,rf=37813,sf=37814,of=37815,af=37816,lf=37817,cf=37818,hf=37819,uf=37820,df=37821,pf=36492,mf=36494,ff=36495,gf=36283,yf=36284,_f=36285,bf=36286,Ir=2300,fo=2301,ys=2302,ml=2400,fl=2401,gl=2402,xf=2500,i1=0,r1=1,s1=2,vf=3200,o1=3201,wf=0,a1=1,Dh="",qe="srgb",yl="srgb-linear",_l="linear",_s="srgb",Kt=7680,bl=519,l1=512,c1=513,h1=514,u1=515,d1=516,p1=517,m1=518,f1=519,go=35044,g1=35048,y1="300 es",mt=2e3,hi=2001;class ki{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const ke=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let xl=1234567;const ni=Math.PI/180,ui=180/Math.PI;function Qe(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ke[n&255]+ke[n>>8&255]+ke[n>>16&255]+ke[n>>24&255]+"-"+ke[e&255]+ke[e>>8&255]+"-"+ke[e>>16&15|64]+ke[e>>24&255]+"-"+ke[t&63|128]+ke[t>>8&255]+"-"+ke[t>>16&255]+ke[t>>24&255]+ke[i&255]+ke[i>>8&255]+ke[i>>16&255]+ke[i>>24&255]).toLowerCase()}function Z(n,e,t){return Math.max(e,Math.min(t,n))}function ea(n,e){return(n%e+e)%e}function Mf(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function Sf(n,e,t){return n!==e?(t-n)/(e-n):0}function ii(n,e,t){return(1-t)*n+t*e}function $f(n,e,t,i){return ii(n,e,1-Math.exp(-t*i))}function kf(n,e=1){return e-Math.abs(ea(n,e*2)-e)}function Ef(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Tf(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Af(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Cf(n,e){return n+Math.random()*(e-n)}function Ff(n){return n*(.5-Math.random())}function Pf(n){n!==void 0&&(xl=n);let e=xl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Rf(n){return n*ni}function If(n){return n*ui}function Df(n){return(n&n-1)===0&&n!==0}function Nf(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Lf(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function zf(n,e,t,i,r){const s=Math.cos,o=Math.sin,a=s(t/2),c=o(t/2),l=s((e+i)/2),u=o((e+i)/2),h=s((e-i)/2),d=o((e-i)/2),p=s((i-e)/2),m=o((i-e)/2);switch(r){case"XYX":n.set(a*u,c*h,c*d,a*l);break;case"YZY":n.set(c*d,a*u,c*h,a*l);break;case"ZXZ":n.set(c*h,c*d,a*u,a*l);break;case"XZX":n.set(a*u,c*m,c*p,a*l);break;case"YXY":n.set(c*p,a*u,c*m,a*l);break;case"ZYZ":n.set(c*m,c*p,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Je(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function se(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const ri={DEG2RAD:ni,RAD2DEG:ui,generateUUID:Qe,clamp:Z,euclideanModulo:ea,mapLinear:Mf,inverseLerp:Sf,lerp:ii,damp:$f,pingpong:kf,smoothstep:Ef,smootherstep:Tf,randInt:Af,randFloat:Cf,randFloatSpread:Ff,seededRandom:Pf,degToRad:Rf,radToDeg:If,isPowerOfTwo:Df,ceilPowerOfTwo:Nf,floorPowerOfTwo:Lf,setQuaternionFromProperEuler:zf,normalize:se,denormalize:Je};class ce{constructor(e=0,t=0){ce.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Z(this.x,e.x,t.x),this.y=Z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Z(this.x,e,t),this.y=Z(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Z(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Z(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Wt{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let c=i[r+0],l=i[r+1],u=i[r+2],h=i[r+3];const d=s[o+0],p=s[o+1],m=s[o+2],f=s[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=m,e[t+3]=f;return}if(h!==f||c!==d||l!==p||u!==m){let g=1-a;const y=c*d+l*p+u*m+h*f,_=y>=0?1:-1,M=1-y*y;if(M>Number.EPSILON){const v=Math.sqrt(M),P=Math.atan2(v,y*_);g=Math.sin(g*P)/v,a=Math.sin(a*P)/v}const x=a*_;if(c=c*g+d*x,l=l*g+p*x,u=u*g+m*x,h=h*g+f*x,g===1-a){const v=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=v,l*=v,u*=v,h*=v}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){const a=i[r],c=i[r+1],l=i[r+2],u=i[r+3],h=s[o],d=s[o+1],p=s[o+2],m=s[o+3];return e[t]=a*m+u*h+c*p-l*d,e[t+1]=c*m+u*d+l*h-a*p,e[t+2]=l*m+u*p+a*d-c*h,e[t+3]=u*m-a*h-c*d-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(r/2),h=a(s/2),d=c(i/2),p=c(r/2),m=c(s/2);switch(o){case"XYZ":this._x=d*u*h+l*p*m,this._y=l*p*h-d*u*m,this._z=l*u*m+d*p*h,this._w=l*u*h-d*p*m;break;case"YXZ":this._x=d*u*h+l*p*m,this._y=l*p*h-d*u*m,this._z=l*u*m-d*p*h,this._w=l*u*h+d*p*m;break;case"ZXY":this._x=d*u*h-l*p*m,this._y=l*p*h+d*u*m,this._z=l*u*m+d*p*h,this._w=l*u*h-d*p*m;break;case"ZYX":this._x=d*u*h-l*p*m,this._y=l*p*h+d*u*m,this._z=l*u*m-d*p*h,this._w=l*u*h+d*p*m;break;case"YZX":this._x=d*u*h+l*p*m,this._y=l*p*h+d*u*m,this._z=l*u*m-d*p*h,this._w=l*u*h-d*p*m;break;case"XZY":this._x=d*u*h-l*p*m,this._y=l*p*h-d*u*m,this._z=l*u*m+d*p*h,this._w=l*u*h+d*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-c)*p,this._y=(s-l)*p,this._z=(o-r)*p}else if(i>a&&i>h){const p=2*Math.sqrt(1+i-a-h);this._w=(u-c)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+l)/p}else if(a>h){const p=2*Math.sqrt(1+a-i-h);this._w=(s-l)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(c+u)/p}else{const p=2*Math.sqrt(1+h-i-a);this._w=(o-r)/p,this._x=(s+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Z(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+o*a+r*l-s*c,this._y=r*u+o*c+s*a-i*l,this._z=s*u+o*l+i*c-r*a,this._w=o*u-i*a-r*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;const c=1-a*a;if(c<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*i+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ${constructor(e=0,t=0,i=0){$.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(vl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(vl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*r-a*i),u=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+c*l+o*h-a*u,this.y=i+c*u+a*l-s*h,this.z=r+c*h+s*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Z(this.x,e.x,t.x),this.y=Z(this.y,e.y,t.y),this.z=Z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Z(this.x,e,t),this.y=Z(this.y,e,t),this.z=Z(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Z(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,c=t.z;return this.x=r*c-s*a,this.y=s*o-i*c,this.z=i*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return bs.copy(this).projectOnVector(e),this.sub(bs)}reflect(e){return this.sub(bs.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Z(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const bs=new $,vl=new Wt;class xt{constructor(e,t,i,r,s,o,a,c,l){xt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,c,l)}set(e,t,i,r,s,o,a,c,l){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=c,u[6]=i,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],u=i[4],h=i[7],d=i[2],p=i[5],m=i[8],f=r[0],g=r[3],y=r[6],_=r[1],M=r[4],x=r[7],v=r[2],P=r[5],E=r[8];return s[0]=o*f+a*_+c*v,s[3]=o*g+a*M+c*P,s[6]=o*y+a*x+c*E,s[1]=l*f+u*_+h*v,s[4]=l*g+u*M+h*P,s[7]=l*y+u*x+h*E,s[2]=d*f+p*_+m*v,s[5]=d*g+p*M+m*P,s[8]=d*y+p*x+m*E,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-i*s*u+i*a*c+r*s*l-r*o*c}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*s,p=l*s-o*c,m=t*h+i*d+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const f=1/m;return e[0]=h*f,e[1]=(r*l-u*i)*f,e[2]=(a*i-r*o)*f,e[3]=d*f,e[4]=(u*t-r*c)*f,e[5]=(r*s-a*t)*f,e[6]=p*f,e[7]=(i*c-l*t)*f,e[8]=(o*t-i*s)*f,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-r*l,r*c,-r*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(xs.makeScale(e,t)),this}rotate(e){return this.premultiply(xs.makeRotation(-e)),this}translate(e,t){return this.premultiply(xs.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const xs=new xt;function Of(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Dr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function _1(){const n=Dr("canvas");return n.style.display="block",n}const wl={};function Ml(n){n in wl||(wl[n]=!0,console.warn(n))}function b1(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}const Sl=new xt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$l=new xt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Bf(){const n={enabled:!0,workingColorSpace:yl,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===_s&&(r.r=yt(r.r),r.g=yt(r.g),r.b=yt(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===_s&&(r.r=Mn(r.r),r.g=Mn(r.g),r.b=Mn(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Dh?_l:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Ml("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Ml("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[yl]:{primaries:e,whitePoint:i,transfer:_l,toXYZ:Sl,fromXYZ:$l,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:qe},outputColorSpaceConfig:{drawingBufferColorSpace:qe}},[qe]:{primaries:e,whitePoint:i,transfer:_s,toXYZ:Sl,fromXYZ:$l,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:qe}}}),n}const ze=Bf();function yt(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Mn(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Qt;class jf{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Qt===void 0&&(Qt=Dr("canvas")),Qt.width=e.width,Qt.height=e.height;const r=Qt.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=Qt}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Dr("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=yt(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(yt(t[i]/255)*255):t[i]=yt(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Vf=0;class ta{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vf++}),this.uuid=Qe(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(vs(r[o].image)):s.push(vs(r[o]))}else s=vs(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function vs(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?jf.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Uf=0;const ws=new $;class Fe extends ki{constructor(e=Fe.DEFAULT_IMAGE,t=Fe.DEFAULT_MAPPING,i=vn,r=vn,s=Rr,o=Ph,a=Qo,c=Ko,l=Fe.DEFAULT_ANISOTROPY,u=Dh){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Uf++}),this.uuid=Qe(),this.name="",this.source=new ta(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new xt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ws).x}get height(){return this.source.getSize(ws).y}get depth(){return this.source.getSize(ws).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Fh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ul:e.x=e.x-Math.floor(e.x);break;case vn:e.x=e.x<0?0:1;break;case dl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ul:e.y=e.y-Math.floor(e.y);break;case vn:e.y=e.y<0?0:1;break;case dl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Fe.DEFAULT_IMAGE=null;Fe.DEFAULT_MAPPING=Fh;Fe.DEFAULT_ANISOTROPY=1;class Me{constructor(e=0,t=0,i=0,r=1){Me.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],p=c[5],m=c[9],f=c[2],g=c[6],y=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-f)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+f)<.1&&Math.abs(m+g)<.1&&Math.abs(l+p+y-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(l+1)/2,x=(p+1)/2,v=(y+1)/2,P=(u+d)/4,E=(h+f)/4,S=(m+g)/4;return M>x&&M>v?M<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(M),r=P/i,s=E/i):x>v?x<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(x),i=P/r,s=S/r):v<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(v),i=E/s,r=S/s),this.set(i,r,s,t),this}let _=Math.sqrt((g-m)*(g-m)+(h-f)*(h-f)+(d-u)*(d-u));return Math.abs(_)<.001&&(_=1),this.x=(g-m)/_,this.y=(h-f)/_,this.z=(d-u)/_,this.w=Math.acos((l+p+y-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Z(this.x,e.x,t.x),this.y=Z(this.y,e.y,t.y),this.z=Z(this.z,e.z,t.z),this.w=Z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Z(this.x,e,t),this.y=Z(this.y,e,t),this.z=Z(this.z,e,t),this.w=Z(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Z(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Hf extends ki{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Rr,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Me(0,0,e,t),this.scissorTest=!1,this.viewport=new Me(0,0,e,t);const r={width:e,height:t,depth:i.depth},s=new Fe(r);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:Rr,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new ta(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Nh extends Hf{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Gf extends Fe{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Rt,this.minFilter=Rt,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class x1 extends Nh{constructor(e=1,t=1,i=1,r={}){super(e,t,r),this.isWebGLArrayRenderTarget=!0,this.depth=i,this.texture=new Gf(null,e,t,i),this._setTextureOptions(r),this.texture.isRenderTargetTexture=!0}}class v1 extends Fe{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Rt,this.minFilter=Rt,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Dt{constructor(e=new $(1/0,1/0,1/0),t=new $(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(We.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(We.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=We.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,We):We.fromBufferAttribute(s,o),We.applyMatrix4(e.matrixWorld),this.expandByPoint(We);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Li.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Li.copy(i.boundingBox)),Li.applyMatrix4(e.matrixWorld),this.union(Li)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,We),We.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Un),zi.subVectors(this.max,Un),en.subVectors(e.a,Un),tn.subVectors(e.b,Un),nn.subVectors(e.c,Un),wt.subVectors(tn,en),Mt.subVectors(nn,tn),zt.subVectors(en,nn);let t=[0,-wt.z,wt.y,0,-Mt.z,Mt.y,0,-zt.z,zt.y,wt.z,0,-wt.x,Mt.z,0,-Mt.x,zt.z,0,-zt.x,-wt.y,wt.x,0,-Mt.y,Mt.x,0,-zt.y,zt.x,0];return!Ms(t,en,tn,nn,zi)||(t=[1,0,0,0,1,0,0,0,1],!Ms(t,en,tn,nn,zi))?!1:(Oi.crossVectors(wt,Mt),t=[Oi.x,Oi.y,Oi.z],Ms(t,en,tn,nn,zi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,We).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(We).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(st[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),st[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),st[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),st[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),st[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),st[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),st[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),st[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(st),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const st=[new $,new $,new $,new $,new $,new $,new $,new $],We=new $,Li=new Dt,en=new $,tn=new $,nn=new $,wt=new $,Mt=new $,zt=new $,Un=new $,zi=new $,Oi=new $,Ot=new $;function Ms(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Ot.fromArray(n,s);const a=r.x*Math.abs(Ot.x)+r.y*Math.abs(Ot.y)+r.z*Math.abs(Ot.z),c=e.dot(Ot),l=t.dot(Ot),u=i.dot(Ot);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}const Wf=new Dt,Hn=new $,Ss=new $;class vt{constructor(e=new $,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Wf.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Hn.subVectors(e,this.center);const t=Hn.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Hn,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ss.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Hn.copy(e.center).add(Ss)),this.expandByPoint(Hn.copy(e.center).sub(Ss))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const ot=new $,$s=new $,Bi=new $,St=new $,ks=new $,ji=new $,Es=new $;class Ei{constructor(e=new $,t=new $(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ot)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ot.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ot.copy(this.origin).addScaledVector(this.direction,t),ot.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){$s.copy(e).add(t).multiplyScalar(.5),Bi.copy(t).sub(e).normalize(),St.copy(this.origin).sub($s);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Bi),a=St.dot(this.direction),c=-St.dot(Bi),l=St.lengthSq(),u=Math.abs(1-o*o);let h,d,p,m;if(u>0)if(h=o*c-a,d=o*a-c,m=s*u,h>=0)if(d>=-m)if(d<=m){const f=1/u;h*=f,d*=f,p=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;else d<=-m?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-c),s),p=-h*h+d*(d+2*c)+l):d<=m?(h=0,d=Math.min(Math.max(-s,-c),s),p=d*(d+2*c)+l):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-c),s),p=-h*h+d*(d+2*c)+l);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy($s).addScaledVector(Bi,d),p}intersectSphere(e,t){ot.subVectors(e.center,this.origin);const i=ot.dot(this.direction),r=ot.dot(ot)-i*i,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,r=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,r=(e.min.x-d.x)*l),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),i>c||a>r)||((a>i||i!==i)&&(i=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,ot)!==null}intersectTriangle(e,t,i,r,s){ks.subVectors(t,e),ji.subVectors(i,e),Es.crossVectors(ks,ji);let o=this.direction.dot(Es),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;St.subVectors(this.origin,e);const c=a*this.direction.dot(ji.crossVectors(St,ji));if(c<0)return null;const l=a*this.direction.dot(ks.cross(St));if(l<0||c+l>o)return null;const u=-a*St.dot(Es);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ne{constructor(e,t,i,r,s,o,a,c,l,u,h,d,p,m,f,g){ne.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,c,l,u,h,d,p,m,f,g)}set(e,t,i,r,s,o,a,c,l,u,h,d,p,m,f,g){const y=this.elements;return y[0]=e,y[4]=t,y[8]=i,y[12]=r,y[1]=s,y[5]=o,y[9]=a,y[13]=c,y[2]=l,y[6]=u,y[10]=h,y[14]=d,y[3]=p,y[7]=m,y[11]=f,y[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ne().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/rn.setFromMatrixColumn(e,0).length(),s=1/rn.setFromMatrixColumn(e,1).length(),o=1/rn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(r),l=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const d=o*u,p=o*h,m=a*u,f=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=p+m*l,t[5]=d-f*l,t[9]=-a*c,t[2]=f-d*l,t[6]=m+p*l,t[10]=o*c}else if(e.order==="YXZ"){const d=c*u,p=c*h,m=l*u,f=l*h;t[0]=d+f*a,t[4]=m*a-p,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-m,t[6]=f+d*a,t[10]=o*c}else if(e.order==="ZXY"){const d=c*u,p=c*h,m=l*u,f=l*h;t[0]=d-f*a,t[4]=-o*h,t[8]=m+p*a,t[1]=p+m*a,t[5]=o*u,t[9]=f-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const d=o*u,p=o*h,m=a*u,f=a*h;t[0]=c*u,t[4]=m*l-p,t[8]=d*l+f,t[1]=c*h,t[5]=f*l+d,t[9]=p*l-m,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const d=o*c,p=o*l,m=a*c,f=a*l;t[0]=c*u,t[4]=f-d*h,t[8]=m*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=p*h+m,t[10]=d-f*h}else if(e.order==="XZY"){const d=o*c,p=o*l,m=a*c,f=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+f,t[5]=o*u,t[9]=p*h-m,t[2]=m*h-p,t[6]=a*u,t[10]=f*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xf,e,Yf)}lookAt(e,t,i){const r=this.elements;return Ie.subVectors(e,t),Ie.lengthSq()===0&&(Ie.z=1),Ie.normalize(),$t.crossVectors(i,Ie),$t.lengthSq()===0&&(Math.abs(i.z)===1?Ie.x+=1e-4:Ie.z+=1e-4,Ie.normalize(),$t.crossVectors(i,Ie)),$t.normalize(),Vi.crossVectors(Ie,$t),r[0]=$t.x,r[4]=Vi.x,r[8]=Ie.x,r[1]=$t.y,r[5]=Vi.y,r[9]=Ie.y,r[2]=$t.z,r[6]=Vi.z,r[10]=Ie.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],u=i[1],h=i[5],d=i[9],p=i[13],m=i[2],f=i[6],g=i[10],y=i[14],_=i[3],M=i[7],x=i[11],v=i[15],P=r[0],E=r[4],S=r[8],C=r[12],k=r[1],A=r[5],b=r[9],F=r[13],z=r[2],R=r[6],O=r[10],G=r[14],te=r[3],q=r[7],B=r[11],U=r[15];return s[0]=o*P+a*k+c*z+l*te,s[4]=o*E+a*A+c*R+l*q,s[8]=o*S+a*b+c*O+l*B,s[12]=o*C+a*F+c*G+l*U,s[1]=u*P+h*k+d*z+p*te,s[5]=u*E+h*A+d*R+p*q,s[9]=u*S+h*b+d*O+p*B,s[13]=u*C+h*F+d*G+p*U,s[2]=m*P+f*k+g*z+y*te,s[6]=m*E+f*A+g*R+y*q,s[10]=m*S+f*b+g*O+y*B,s[14]=m*C+f*F+g*G+y*U,s[3]=_*P+M*k+x*z+v*te,s[7]=_*E+M*A+x*R+v*q,s[11]=_*S+M*b+x*O+v*B,s[15]=_*C+M*F+x*G+v*U,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],p=e[14],m=e[3],f=e[7],g=e[11],y=e[15];return m*(+s*c*h-r*l*h-s*a*d+i*l*d+r*a*p-i*c*p)+f*(+t*c*p-t*l*d+s*o*d-r*o*p+r*l*u-s*c*u)+g*(+t*l*h-t*a*p-s*o*h+i*o*p+s*a*u-i*l*u)+y*(-r*a*u-t*c*h+t*a*d+r*o*h-i*o*d+i*c*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],p=e[11],m=e[12],f=e[13],g=e[14],y=e[15],_=h*g*l-f*d*l+f*c*p-a*g*p-h*c*y+a*d*y,M=m*d*l-u*g*l-m*c*p+o*g*p+u*c*y-o*d*y,x=u*f*l-m*h*l+m*a*p-o*f*p-u*a*y+o*h*y,v=m*h*c-u*f*c-m*a*d+o*f*d+u*a*g-o*h*g,P=t*_+i*M+r*x+s*v;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/P;return e[0]=_*E,e[1]=(f*d*s-h*g*s-f*r*p+i*g*p+h*r*y-i*d*y)*E,e[2]=(a*g*s-f*c*s+f*r*l-i*g*l-a*r*y+i*c*y)*E,e[3]=(h*c*s-a*d*s-h*r*l+i*d*l+a*r*p-i*c*p)*E,e[4]=M*E,e[5]=(u*g*s-m*d*s+m*r*p-t*g*p-u*r*y+t*d*y)*E,e[6]=(m*c*s-o*g*s-m*r*l+t*g*l+o*r*y-t*c*y)*E,e[7]=(o*d*s-u*c*s+u*r*l-t*d*l-o*r*p+t*c*p)*E,e[8]=x*E,e[9]=(m*h*s-u*f*s-m*i*p+t*f*p+u*i*y-t*h*y)*E,e[10]=(o*f*s-m*a*s+m*i*l-t*f*l-o*i*y+t*a*y)*E,e[11]=(u*a*s-o*h*s-u*i*l+t*h*l+o*i*p-t*a*p)*E,e[12]=v*E,e[13]=(u*f*r-m*h*r+m*i*d-t*f*d-u*i*g+t*h*g)*E,e[14]=(m*a*r-o*f*r-m*i*c+t*f*c+o*i*g-t*a*g)*E,e[15]=(o*h*r-u*a*r+u*i*c-t*h*c-o*i*d+t*a*d)*E,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,c=e.z,l=s*o,u=s*a;return this.set(l*o+i,l*a-r*c,l*c+r*a,0,l*a+r*c,u*a+i,u*c-r*o,0,l*c-r*a,u*c+r*o,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,o=t._y,a=t._z,c=t._w,l=s+s,u=o+o,h=a+a,d=s*l,p=s*u,m=s*h,f=o*u,g=o*h,y=a*h,_=c*l,M=c*u,x=c*h,v=i.x,P=i.y,E=i.z;return r[0]=(1-(f+y))*v,r[1]=(p+x)*v,r[2]=(m-M)*v,r[3]=0,r[4]=(p-x)*P,r[5]=(1-(d+y))*P,r[6]=(g+_)*P,r[7]=0,r[8]=(m+M)*E,r[9]=(g-_)*E,r[10]=(1-(d+f))*E,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let s=rn.set(r[0],r[1],r[2]).length();const o=rn.set(r[4],r[5],r[6]).length(),a=rn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Xe.copy(this);const l=1/s,u=1/o,h=1/a;return Xe.elements[0]*=l,Xe.elements[1]*=l,Xe.elements[2]*=l,Xe.elements[4]*=u,Xe.elements[5]*=u,Xe.elements[6]*=u,Xe.elements[8]*=h,Xe.elements[9]*=h,Xe.elements[10]*=h,t.setFromRotationMatrix(Xe),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=mt,c=!1){const l=this.elements,u=2*s/(t-e),h=2*s/(i-r),d=(t+e)/(t-e),p=(i+r)/(i-r);let m,f;if(c)m=s/(o-s),f=o*s/(o-s);else if(a===mt)m=-(o+s)/(o-s),f=-2*o*s/(o-s);else if(a===hi)m=-o/(o-s),f=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=f,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=mt,c=!1){const l=this.elements,u=2/(t-e),h=2/(i-r),d=-(t+e)/(t-e),p=-(i+r)/(i-r);let m,f;if(c)m=1/(o-s),f=o/(o-s);else if(a===mt)m=-2/(o-s),f=-(o+s)/(o-s);else if(a===hi)m=-1/(o-s),f=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=m,l[14]=f,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const rn=new $,Xe=new ne,Xf=new $(0,0,0),Yf=new $(1,1,1),$t=new $,Vi=new $,Ie=new $,kl=new ne,El=new Wt;class _t{constructor(e=0,t=0,i=0,r=_t.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],c=r[1],l=r[5],u=r[9],h=r[2],d=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Z(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-Z(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Z(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return kl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(kl,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return El.setFromEuler(this),this.setFromQuaternion(El,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_t.DEFAULT_ORDER="XYZ";class Lh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let qf=0;const Tl=new $,sn=new Wt,at=new ne,Ui=new $,Gn=new $,Zf=new $,Jf=new Wt,Al=new $(1,0,0),Cl=new $(0,1,0),Fl=new $(0,0,1),Pl={type:"added"},Kf={type:"removed"},on={type:"childadded",child:null},Ts={type:"childremoved",child:null};class pe extends ki{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=Qe(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=pe.DEFAULT_UP.clone();const e=new $,t=new _t,i=new Wt,r=new $(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ne},normalMatrix:{value:new xt}}),this.matrix=new ne,this.matrixWorld=new ne,this.matrixAutoUpdate=pe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=pe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Lh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return sn.setFromAxisAngle(e,t),this.quaternion.multiply(sn),this}rotateOnWorldAxis(e,t){return sn.setFromAxisAngle(e,t),this.quaternion.premultiply(sn),this}rotateX(e){return this.rotateOnAxis(Al,e)}rotateY(e){return this.rotateOnAxis(Cl,e)}rotateZ(e){return this.rotateOnAxis(Fl,e)}translateOnAxis(e,t){return Tl.copy(e).applyQuaternion(this.quaternion),this.position.add(Tl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Al,e)}translateY(e){return this.translateOnAxis(Cl,e)}translateZ(e){return this.translateOnAxis(Fl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(at.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Ui.copy(e):Ui.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Gn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?at.lookAt(Gn,Ui,this.up):at.lookAt(Ui,Gn,this.up),this.quaternion.setFromRotationMatrix(at),r&&(at.extractRotation(r.matrixWorld),sn.setFromRotationMatrix(at),this.quaternion.premultiply(sn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Pl),on.child=e,this.dispatchEvent(on),on.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kf),Ts.child=e,this.dispatchEvent(Ts),Ts.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),at.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),at.multiply(e.parent.matrixWorld)),e.applyMatrix4(at),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Pl),on.child=e,this.dispatchEvent(on),on.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gn,e,Zf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gn,Jf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(e.materials,this.material[c]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];r.animations.push(s(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),p=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),p.length>0&&(i.animations=p),m.length>0&&(i.nodes=m)}return i.object=r,i;function o(a){const c=[];for(const l in a){const u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}pe.DEFAULT_UP=new $(0,1,0);pe.DEFAULT_MATRIX_AUTO_UPDATE=!0;pe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ye=new $,lt=new $,As=new $,ct=new $,an=new $,ln=new $,Rl=new $,Cs=new $,Fs=new $,Ps=new $,Rs=new Me,Is=new Me,Ds=new Me;class Be{constructor(e=new $,t=new $,i=new $){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Ye.subVectors(e,t),r.cross(Ye);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Ye.subVectors(r,t),lt.subVectors(i,t),As.subVectors(e,t);const o=Ye.dot(Ye),a=Ye.dot(lt),c=Ye.dot(As),l=lt.dot(lt),u=lt.dot(As),h=o*l-a*a;if(h===0)return s.set(0,0,0),null;const d=1/h,p=(l*c-a*u)*d,m=(o*u-a*c)*d;return s.set(1-p-m,m,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,ct)===null?!1:ct.x>=0&&ct.y>=0&&ct.x+ct.y<=1}static getInterpolation(e,t,i,r,s,o,a,c){return this.getBarycoord(e,t,i,r,ct)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,ct.x),c.addScaledVector(o,ct.y),c.addScaledVector(a,ct.z),c)}static getInterpolatedAttribute(e,t,i,r,s,o){return Rs.setScalar(0),Is.setScalar(0),Ds.setScalar(0),Rs.fromBufferAttribute(e,t),Is.fromBufferAttribute(e,i),Ds.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Rs,s.x),o.addScaledVector(Is,s.y),o.addScaledVector(Ds,s.z),o}static isFrontFacing(e,t,i,r){return Ye.subVectors(i,t),lt.subVectors(e,t),Ye.cross(lt).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ye.subVectors(this.c,this.b),lt.subVectors(this.a,this.b),Ye.cross(lt).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Be.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Be.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return Be.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return Be.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Be.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let o,a;an.subVectors(r,i),ln.subVectors(s,i),Cs.subVectors(e,i);const c=an.dot(Cs),l=ln.dot(Cs);if(c<=0&&l<=0)return t.copy(i);Fs.subVectors(e,r);const u=an.dot(Fs),h=ln.dot(Fs);if(u>=0&&h<=u)return t.copy(r);const d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(i).addScaledVector(an,o);Ps.subVectors(e,s);const p=an.dot(Ps),m=ln.dot(Ps);if(m>=0&&p<=m)return t.copy(s);const f=p*l-c*m;if(f<=0&&l>=0&&m<=0)return a=l/(l-m),t.copy(i).addScaledVector(ln,a);const g=u*m-p*h;if(g<=0&&h-u>=0&&p-m>=0)return Rl.subVectors(s,r),a=(h-u)/(h-u+(p-m)),t.copy(r).addScaledVector(Rl,a);const y=1/(g+f+d);return o=f*y,a=d*y,t.copy(i).addScaledVector(an,o).addScaledVector(ln,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const zh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kt={h:0,s:0,l:0},Hi={h:0,s:0,l:0};function Ns(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class ve{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ze.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=ze.workingColorSpace){return this.r=e,this.g=t,this.b=i,ze.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=ze.workingColorSpace){if(e=ea(e,1),t=Z(t,0,1),i=Z(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Ns(o,s,e+1/3),this.g=Ns(o,s,e),this.b=Ns(o,s,e-1/3)}return ze.colorSpaceToWorking(this,r),this}setStyle(e,t=qe){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qe){const i=zh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yt(e.r),this.g=yt(e.g),this.b=yt(e.b),this}copyLinearToSRGB(e){return this.r=Mn(e.r),this.g=Mn(e.g),this.b=Mn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qe){return ze.workingToColorSpace(Ee.copy(this),e),Math.round(Z(Ee.r*255,0,255))*65536+Math.round(Z(Ee.g*255,0,255))*256+Math.round(Z(Ee.b*255,0,255))}getHexString(e=qe){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ze.workingColorSpace){ze.workingToColorSpace(Ee.copy(this),t);const i=Ee.r,r=Ee.g,s=Ee.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let c,l;const u=(a+o)/2;if(a===o)c=0,l=0;else{const h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case i:c=(r-s)/h+(r<s?6:0);break;case r:c=(s-i)/h+2;break;case s:c=(i-r)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=ze.workingColorSpace){return ze.workingToColorSpace(Ee.copy(this),t),e.r=Ee.r,e.g=Ee.g,e.b=Ee.b,e}getStyle(e=qe){ze.workingToColorSpace(Ee.copy(this),e);const t=Ee.r,i=Ee.g,r=Ee.b;return e!==qe?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(kt),this.setHSL(kt.h+e,kt.s+t,kt.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(kt),e.getHSL(Hi);const i=ii(kt.h,Hi.h,t),r=ii(kt.s,Hi.s,t),s=ii(kt.l,Hi.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ee=new ve;ve.NAMES=zh;let Qf=0;class Nt extends ki{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Qf++}),this.uuid=Qe(),this.name="",this.type="Material",this.blending=sl,this.side=mo,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=al,this.blendDst=ll,this.blendEquation=ol,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ve(0,0,0),this.blendAlpha=0,this.depthFunc=cl,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Kt,this.stencilZFail=Kt,this.stencilZPass=Kt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==sl&&(i.blending=this.blending),this.side!==mo&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==al&&(i.blendSrc=this.blendSrc),this.blendDst!==ll&&(i.blendDst=this.blendDst),this.blendEquation!==ol&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==cl&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bl&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Kt&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Kt&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Kt&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const c=s[a];delete c.metadata,o.push(c)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class eg extends Nt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _t,this.combine=wm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ye=new $,Gi=new ce;let tg=0;class Pt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:tg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=go,this.updateRanges=[],this.gpuType=Qr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Gi.fromBufferAttribute(this,t),Gi.applyMatrix3(e),this.setXY(t,Gi.x,Gi.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)ye.fromBufferAttribute(this,t),ye.applyMatrix3(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)ye.fromBufferAttribute(this,t),ye.applyMatrix4(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ye.fromBufferAttribute(this,t),ye.applyNormalMatrix(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ye.fromBufferAttribute(this,t),ye.transformDirection(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Je(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=se(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Je(t,this.array)),t}setX(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Je(t,this.array)),t}setY(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Je(t,this.array)),t}setZ(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Je(t,this.array)),t}setW(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=se(t,this.array),i=se(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=se(t,this.array),i=se(i,this.array),r=se(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=se(t,this.array),i=se(i,this.array),r=se(r,this.array),s=se(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==go&&(e.usage=this.usage),e}}class ng extends Pt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class ig extends Pt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Pe extends Pt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let rg=0;const Le=new ne,Ls=new pe,cn=new $,De=new Dt,Wn=new Dt,xe=new $;class Ue extends ki{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rg++}),this.uuid=Qe(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Of(e)?ig:ng)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new xt().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Le.makeRotationFromQuaternion(e),this.applyMatrix4(Le),this}rotateX(e){return Le.makeRotationX(e),this.applyMatrix4(Le),this}rotateY(e){return Le.makeRotationY(e),this.applyMatrix4(Le),this}rotateZ(e){return Le.makeRotationZ(e),this.applyMatrix4(Le),this}translate(e,t,i){return Le.makeTranslation(e,t,i),this.applyMatrix4(Le),this}scale(e,t,i){return Le.makeScale(e,t,i),this.applyMatrix4(Le),this}lookAt(e){return Ls.lookAt(e),Ls.updateMatrix(),this.applyMatrix4(Ls.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(cn).negate(),this.translate(cn.x,cn.y,cn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Pe(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dt);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new $(-1/0,-1/0,-1/0),new $(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];De.setFromBufferAttribute(s),this.morphTargetsRelative?(xe.addVectors(this.boundingBox.min,De.min),this.boundingBox.expandByPoint(xe),xe.addVectors(this.boundingBox.max,De.max),this.boundingBox.expandByPoint(xe)):(this.boundingBox.expandByPoint(De.min),this.boundingBox.expandByPoint(De.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vt);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new $,1/0);return}if(e){const i=this.boundingSphere.center;if(De.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Wn.setFromBufferAttribute(a),this.morphTargetsRelative?(xe.addVectors(De.min,Wn.min),De.expandByPoint(xe),xe.addVectors(De.max,Wn.max),De.expandByPoint(xe)):(De.expandByPoint(Wn.min),De.expandByPoint(Wn.max))}De.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)xe.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(xe));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)xe.fromBufferAttribute(a,l),c&&(cn.fromBufferAttribute(e,l),xe.add(cn)),r=Math.max(r,i.distanceToSquared(xe))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pt(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let S=0;S<i.count;S++)a[S]=new $,c[S]=new $;const l=new $,u=new $,h=new $,d=new ce,p=new ce,m=new ce,f=new $,g=new $;function y(S,C,k){l.fromBufferAttribute(i,S),u.fromBufferAttribute(i,C),h.fromBufferAttribute(i,k),d.fromBufferAttribute(s,S),p.fromBufferAttribute(s,C),m.fromBufferAttribute(s,k),u.sub(l),h.sub(l),p.sub(d),m.sub(d);const A=1/(p.x*m.y-m.x*p.y);isFinite(A)&&(f.copy(u).multiplyScalar(m.y).addScaledVector(h,-p.y).multiplyScalar(A),g.copy(h).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(A),a[S].add(f),a[C].add(f),a[k].add(f),c[S].add(g),c[C].add(g),c[k].add(g))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let S=0,C=_.length;S<C;++S){const k=_[S],A=k.start,b=k.count;for(let F=A,z=A+b;F<z;F+=3)y(e.getX(F+0),e.getX(F+1),e.getX(F+2))}const M=new $,x=new $,v=new $,P=new $;function E(S){v.fromBufferAttribute(r,S),P.copy(v);const C=a[S];M.copy(C),M.sub(v.multiplyScalar(v.dot(C))).normalize(),x.crossVectors(P,C);const A=x.dot(c[S])<0?-1:1;o.setXYZW(S,M.x,M.y,M.z,A)}for(let S=0,C=_.length;S<C;++S){const k=_[S],A=k.start,b=k.count;for(let F=A,z=A+b;F<z;F+=3)E(e.getX(F+0)),E(e.getX(F+1)),E(e.getX(F+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Pt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,p=i.count;d<p;d++)i.setXYZ(d,0,0,0);const r=new $,s=new $,o=new $,a=new $,c=new $,l=new $,u=new $,h=new $;if(e)for(let d=0,p=e.count;d<p;d+=3){const m=e.getX(d+0),f=e.getX(d+1),g=e.getX(d+2);r.fromBufferAttribute(t,m),s.fromBufferAttribute(t,f),o.fromBufferAttribute(t,g),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,m),c.fromBufferAttribute(i,f),l.fromBufferAttribute(i,g),a.add(u),c.add(u),l.add(u),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(f,c.x,c.y,c.z),i.setXYZ(g,l.x,l.y,l.z)}else for(let d=0,p=t.count;d<p;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)xe.fromBufferAttribute(e,t),xe.normalize(),e.setXYZ(t,xe.x,xe.y,xe.z)}toNonIndexed(){function e(a,c){const l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u);let p=0,m=0;for(let f=0,g=c.length;f<g;f++){a.isInterleavedBufferAttribute?p=c[f]*a.data.stride+a.offset:p=c[f]*u;for(let y=0;y<u;y++)d[m++]=l[p++]}return new Pt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ue,i=this.index.array,r=this.attributes;for(const a in r){const c=r[a],l=e(c,i);t.setAttribute(a,l)}const s=this.morphAttributes;for(const a in s){const c=[],l=s[a];for(let u=0,h=l.length;u<h;u++){const d=l[u],p=e(d,i);c.push(p)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const r={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){const p=l[h];u.push(p.toJSON(e.data))}u.length>0&&(r[c]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const l in r){const u=r[l];this.setAttribute(l,u.clone(t))}const s=e.morphAttributes;for(const l in s){const u=[],h=s[l];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,u=o.length;l<u;l++){const h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Il=new ne,Bt=new Ei,Wi=new vt,Dl=new $,Xi=new $,Yi=new $,qi=new $,zs=new $,Zi=new $,Nl=new $,Ji=new $;class es extends pe{constructor(e=new Ue,t=new eg){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){Zi.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const u=a[c],h=s[c];u!==0&&(zs.fromBufferAttribute(h,e),o?Zi.addScaledVector(zs,u):Zi.addScaledVector(zs.sub(t),u))}t.add(Zi)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Wi.copy(i.boundingSphere),Wi.applyMatrix4(s),Bt.copy(e.ray).recast(e.near),!(Wi.containsPoint(Bt.origin)===!1&&(Bt.intersectSphere(Wi,Dl)===null||Bt.origin.distanceToSquared(Dl)>(e.far-e.near)**2))&&(Il.copy(s).invert(),Bt.copy(e.ray).applyMatrix4(Il),!(i.boundingBox!==null&&Bt.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Bt)))}_computeIntersections(e,t,i){let r;const s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,f=d.length;m<f;m++){const g=d[m],y=o[g.materialIndex],_=Math.max(g.start,p.start),M=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let x=_,v=M;x<v;x+=3){const P=a.getX(x),E=a.getX(x+1),S=a.getX(x+2);r=Ki(this,y,e,i,l,u,h,P,E,S),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const m=Math.max(0,p.start),f=Math.min(a.count,p.start+p.count);for(let g=m,y=f;g<y;g+=3){const _=a.getX(g),M=a.getX(g+1),x=a.getX(g+2);r=Ki(this,o,e,i,l,u,h,_,M,x),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(o))for(let m=0,f=d.length;m<f;m++){const g=d[m],y=o[g.materialIndex],_=Math.max(g.start,p.start),M=Math.min(c.count,Math.min(g.start+g.count,p.start+p.count));for(let x=_,v=M;x<v;x+=3){const P=x,E=x+1,S=x+2;r=Ki(this,y,e,i,l,u,h,P,E,S),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const m=Math.max(0,p.start),f=Math.min(c.count,p.start+p.count);for(let g=m,y=f;g<y;g+=3){const _=g,M=g+1,x=g+2;r=Ki(this,o,e,i,l,u,h,_,M,x),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}}function sg(n,e,t,i,r,s,o,a){let c;if(e.side===Ch?c=i.intersectTriangle(o,s,r,!0,a):c=i.intersectTriangle(r,s,o,e.side===mo,a),c===null)return null;Ji.copy(a),Ji.applyMatrix4(n.matrixWorld);const l=t.ray.origin.distanceTo(Ji);return l<t.near||l>t.far?null:{distance:l,point:Ji.clone(),object:n}}function Ki(n,e,t,i,r,s,o,a,c,l){n.getVertexPosition(a,Xi),n.getVertexPosition(c,Yi),n.getVertexPosition(l,qi);const u=sg(n,e,t,i,Xi,Yi,qi,Nl);if(u){const h=new $;Be.getBarycoord(Nl,Xi,Yi,qi,h),r&&(u.uv=Be.getInterpolatedAttribute(r,a,c,l,h,new ce)),s&&(u.uv1=Be.getInterpolatedAttribute(s,a,c,l,h,new ce)),o&&(u.normal=Be.getInterpolatedAttribute(o,a,c,l,h,new $),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const d={a,b:c,c:l,normal:new $,materialIndex:0};Be.getNormal(Xi,Yi,qi,d.normal),u.face=d,u.barycoord=h}return u}class na extends Ue{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const c=[],l=[],u=[],h=[];let d=0,p=0;m("z","y","x",-1,-1,i,t,e,o,s,0),m("z","y","x",1,-1,i,t,-e,o,s,1),m("x","z","y",1,1,e,i,t,r,o,2),m("x","z","y",1,-1,e,i,-t,r,o,3),m("x","y","z",1,-1,e,t,i,r,s,4),m("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new Pe(l,3)),this.setAttribute("normal",new Pe(u,3)),this.setAttribute("uv",new Pe(h,2));function m(f,g,y,_,M,x,v,P,E,S,C){const k=x/E,A=v/S,b=x/2,F=v/2,z=P/2,R=E+1,O=S+1;let G=0,te=0;const q=new $;for(let B=0;B<O;B++){const U=B*A-F;for(let le=0;le<R;le++){const $e=le*k-b;q[f]=$e*_,q[g]=U*M,q[y]=z,l.push(q.x,q.y,q.z),q[f]=0,q[g]=0,q[y]=P>0?1:-1,u.push(q.x,q.y,q.z),h.push(le/E),h.push(1-B/S),G+=1}}for(let B=0;B<S;B++)for(let U=0;U<E;U++){const le=d+U+R*B,$e=d+U+R*(B+1),nt=d+(U+1)+R*(B+1),L=d+(U+1)+R*B;c.push(le,$e,L),c.push($e,nt,L),te+=6}a.addGroup(p,te,C),p+=te,d+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new na(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ts(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function og(n){const e={};for(let t=0;t<n.length;t++){const i=ts(n[t]);for(const r in i)e[r]=i[r]}return e}function ag(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function w1(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ze.workingColorSpace}const M1={clone:ts,merge:og};var lg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Oh extends Nt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lg,this.fragmentShader=cg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ts(e.uniforms),this.uniformsGroups=ag(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class ia extends pe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ne,this.projectionMatrix=new ne,this.projectionMatrixInverse=new ne,this.coordinateSystem=mt,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Et=new $,Ll=new ce,zl=new ce;class dt extends ia{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ui*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ni*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ui*2*Math.atan(Math.tan(ni*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Et.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Et.x,Et.y).multiplyScalar(-e/Et.z),Et.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Et.x,Et.y).multiplyScalar(-e/Et.z)}getViewSize(e,t){return this.getViewBounds(e,Ll,zl),t.subVectors(zl,Ll)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ni*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*r/c,t-=o.offsetY*i/l,r*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const hn=-90,un=1;class hg extends pe{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new dt(hn,un,e,t);r.layers=this.layers,this.add(r);const s=new dt(hn,un,e,t);s.layers=this.layers,this.add(s);const o=new dt(hn,un,e,t);o.layers=this.layers,this.add(o);const a=new dt(hn,un,e,t);a.layers=this.layers,this.add(a);const c=new dt(hn,un,e,t);c.layers=this.layers,this.add(c);const l=new dt(hn,un,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,c]=t;for(const l of t)this.remove(l);if(e===mt)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===hi)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const f=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,c),e.setRenderTarget(i,4,r),e.render(t,l),i.texture.generateMipmaps=f,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,d,p),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}}class ug extends Fe{constructor(e=[],t=Sm,i,r,s,o,a,c,l,u){super(e,t,i,r,s,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class S1 extends Nh{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new ug(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new na(5,5,5),s=new Oh({name:"CubemapFromEquirect",uniforms:ts(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ch,blending:vm});s.uniforms.tEquirect.value=t;const o=new es(r,s),a=t.minFilter;return t.minFilter===Ph&&(t.minFilter=Rr),new hg(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}}class Qi extends pe{constructor(){super(),this.isGroup=!0,this.type="Group"}}const dg={type:"move"};class $1{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new $,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new $),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new $,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new $),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const f of e.hand.values()){const g=t.getJointPose(f,i),y=this._getHandJoint(l,f);g!==null&&(y.matrix.fromArray(g.transform.matrix),y.matrix.decompose(y.position,y.rotation,y.scale),y.matrixWorldNeedsUpdate=!0,y.jointRadius=g.radius),y.visible=g!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,m=.005;l.inputState.pinching&&d>p+m?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=p-m&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(dg)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Qi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class k1 extends pe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _t,this.environmentIntensity=1,this.environmentRotation=new _t,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Bh{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=go,this.updateRanges=[],this.version=0,this.uuid=Qe()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Qe()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Qe()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ae=new $;class Nr{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Ae.fromBufferAttribute(this,t),Ae.applyMatrix4(e),this.setXYZ(t,Ae.x,Ae.y,Ae.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ae.fromBufferAttribute(this,t),Ae.applyNormalMatrix(e),this.setXYZ(t,Ae.x,Ae.y,Ae.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ae.fromBufferAttribute(this,t),Ae.transformDirection(e),this.setXYZ(t,Ae.x,Ae.y,Ae.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Je(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=se(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Je(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Je(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Je(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Je(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=se(t,this.array),i=se(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=se(t,this.array),i=se(i,this.array),r=se(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=se(t,this.array),i=se(i,this.array),r=se(r,this.array),s=se(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Pt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Nr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class pg extends Nt{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ve(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let dn;const Xn=new $,pn=new $,mn=new $,fn=new ce,Yn=new ce,jh=new ne,er=new $,qn=new $,tr=new $,Ol=new ce,Os=new ce,Bl=new ce;class E1 extends pe{constructor(e=new pg){if(super(),this.isSprite=!0,this.type="Sprite",dn===void 0){dn=new Ue;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Bh(t,5);dn.setIndex([0,1,2,0,2,3]),dn.setAttribute("position",new Nr(i,3,0,!1)),dn.setAttribute("uv",new Nr(i,2,3,!1))}this.geometry=dn,this.material=e,this.center=new ce(.5,.5),this.count=1}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),pn.setFromMatrixScale(this.matrixWorld),jh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),mn.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&pn.multiplyScalar(-mn.z);const i=this.material.rotation;let r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));const o=this.center;nr(er.set(-.5,-.5,0),mn,o,pn,r,s),nr(qn.set(.5,-.5,0),mn,o,pn,r,s),nr(tr.set(.5,.5,0),mn,o,pn,r,s),Ol.set(0,0),Os.set(1,0),Bl.set(1,1);let a=e.ray.intersectTriangle(er,qn,tr,!1,Xn);if(a===null&&(nr(qn.set(-.5,.5,0),mn,o,pn,r,s),Os.set(0,1),a=e.ray.intersectTriangle(er,tr,qn,!1,Xn),a===null))return;const c=e.ray.origin.distanceTo(Xn);c<e.near||c>e.far||t.push({distance:c,point:Xn.clone(),uv:Be.getInterpolation(Xn,er,qn,tr,Ol,Os,Bl,new ce),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function nr(n,e,t,i,r,s){fn.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(Yn.x=s*fn.x-r*fn.y,Yn.y=r*fn.x+s*fn.y):Yn.copy(fn),n.copy(e),n.x+=Yn.x,n.y+=Yn.y,n.applyMatrix4(jh)}const jl=new $,Vl=new Me,Ul=new Me,mg=new $,Hl=new ne,ir=new $,Bs=new vt,Gl=new ne,js=new Ei;class T1 extends es{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=hl,this.bindMatrix=new ne,this.bindMatrixInverse=new ne,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Dt),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,ir),this.boundingBox.expandByPoint(ir)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vt),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,ir),this.boundingSphere.expandByPoint(ir)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,r=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bs.copy(this.boundingSphere),Bs.applyMatrix4(r),e.ray.intersectsSphere(Bs)!==!1&&(Gl.copy(r).invert(),js.copy(e.ray).applyMatrix4(Gl),!(this.boundingBox!==null&&js.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,js)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Me,t=this.geometry.attributes.skinWeight;for(let i=0,r=t.count;i<r;i++){e.fromBufferAttribute(t,i);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===hl?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Mm?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,r=this.geometry;Vl.fromBufferAttribute(r.attributes.skinIndex,e),Ul.fromBufferAttribute(r.attributes.skinWeight,e),jl.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=Ul.getComponent(s);if(o!==0){const a=Vl.getComponent(s);Hl.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(mg.copy(jl).applyMatrix4(Hl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class fg extends pe{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Vh extends Fe{constructor(e=null,t=1,i=1,r,s,o,a,c,l=Rt,u=Rt,h,d){super(null,o,a,c,l,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Wl=new ne,gg=new ne;class Uh{constructor(e=[],t=[]){this.uuid=Qe(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,r=this.bones.length;i<r;i++)this.boneInverses.push(new ne)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new ne;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:gg;Wl.multiplyMatrices(a,t[s]),Wl.toArray(i,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new Uh(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new Vh(t,e,e,Qo,Qr);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,r=e.bones.length;i<r;i++){const s=e.bones[i];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new fg),this.bones.push(o),this.boneInverses.push(new ne().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let r=0,s=t.length;r<s;r++){const o=t[r];e.bones.push(o.uuid);const a=i[r];e.boneInverses.push(a.toArray())}return e}}class Xl extends Pt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const gn=new ne,Yl=new ne,rr=[],ql=new Dt,yg=new ne,Zn=new es,Jn=new vt;class A1 extends es{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Xl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,yg)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Dt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,gn),ql.copy(e.boundingBox).applyMatrix4(gn),this.boundingBox.union(ql)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vt),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,gn),Jn.copy(e.boundingSphere).applyMatrix4(gn),this.boundingSphere.union(Jn)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,t){const i=this.matrixWorld,r=this.count;if(Zn.geometry=this.geometry,Zn.material=this.material,Zn.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Jn.copy(this.boundingSphere),Jn.applyMatrix4(i),e.ray.intersectsSphere(Jn)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,gn),Yl.multiplyMatrices(i,gn),Zn.matrixWorld=Yl,Zn.raycast(e,rr);for(let o=0,a=rr.length;o<a;o++){const c=rr[o];c.instanceId=s,c.object=this,t.push(c)}rr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Xl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new Vh(new Float32Array(r*this.count),r,this.count,Ih,Qr));const s=this.morphTexture.source.data.data;let o=0;for(let l=0;l<i.length;l++)o+=i[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=r*e;s[c]=a,s.set(i,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Vs=new $,_g=new $,bg=new xt;class yn{constructor(e=new $(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Vs.subVectors(i,t).cross(_g.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Vs),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||bg.getNormalMatrix(e),r=this.coplanarPoint(Vs).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const jt=new vt,xg=new ce(.5,.5),sr=new $;class vg{constructor(e=new yn,t=new yn,i=new yn,r=new yn,s=new yn,o=new yn){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=mt,i=!1){const r=this.planes,s=e.elements,o=s[0],a=s[1],c=s[2],l=s[3],u=s[4],h=s[5],d=s[6],p=s[7],m=s[8],f=s[9],g=s[10],y=s[11],_=s[12],M=s[13],x=s[14],v=s[15];if(r[0].setComponents(l-o,p-u,y-m,v-_).normalize(),r[1].setComponents(l+o,p+u,y+m,v+_).normalize(),r[2].setComponents(l+a,p+h,y+f,v+M).normalize(),r[3].setComponents(l-a,p-h,y-f,v-M).normalize(),i)r[4].setComponents(c,d,g,x).normalize(),r[5].setComponents(l-c,p-d,y-g,v-x).normalize();else if(r[4].setComponents(l-c,p-d,y-g,v-x).normalize(),t===mt)r[5].setComponents(l+c,p+d,y+g,v+x).normalize();else if(t===hi)r[5].setComponents(c,d,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),jt.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),jt.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(jt)}intersectsSprite(e){jt.center.set(0,0,0);const t=xg.distanceTo(e.center);return jt.radius=.7071067811865476+t,jt.applyMatrix4(e.matrixWorld),this.intersectsSphere(jt)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(sr.x=r.normal.x>0?e.max.x:e.min.x,sr.y=r.normal.y>0?e.max.y:e.min.y,sr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(sr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Hh extends Nt{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Lr=new $,zr=new $,Zl=new ne,Kn=new Ei,or=new vt,Us=new $,Jl=new $;class Gh extends pe{constructor(e=new Ue,t=new Hh){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let r=1,s=t.count;r<s;r++)Lr.fromBufferAttribute(t,r-1),zr.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=Lr.distanceTo(zr);e.setAttribute("lineDistance",new Pe(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),or.copy(i.boundingSphere),or.applyMatrix4(r),or.radius+=s,e.ray.intersectsSphere(or)===!1)return;Zl.copy(r).invert(),Kn.copy(e.ray).applyMatrix4(Zl);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=i.index,d=i.attributes.position;if(u!==null){const p=Math.max(0,o.start),m=Math.min(u.count,o.start+o.count);for(let f=p,g=m-1;f<g;f+=l){const y=u.getX(f),_=u.getX(f+1),M=ar(this,e,Kn,c,y,_,f);M&&t.push(M)}if(this.isLineLoop){const f=u.getX(m-1),g=u.getX(p),y=ar(this,e,Kn,c,f,g,m-1);y&&t.push(y)}}else{const p=Math.max(0,o.start),m=Math.min(d.count,o.start+o.count);for(let f=p,g=m-1;f<g;f+=l){const y=ar(this,e,Kn,c,f,f+1,f);y&&t.push(y)}if(this.isLineLoop){const f=ar(this,e,Kn,c,m-1,p,m-1);f&&t.push(f)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function ar(n,e,t,i,r,s,o){const a=n.geometry.attributes.position;if(Lr.fromBufferAttribute(a,r),zr.fromBufferAttribute(a,s),t.distanceSqToSegment(Lr,zr,Us,Jl)>i)return;Us.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(Us);if(!(l<e.near||l>e.far))return{distance:l,point:Jl.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}const Kl=new $,Ql=new $;class wg extends Gh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let r=0,s=t.count;r<s;r+=2)Kl.fromBufferAttribute(t,r),Ql.fromBufferAttribute(t,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+Kl.distanceTo(Ql);e.setAttribute("lineDistance",new Pe(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class C1 extends Gh{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Mg extends Nt{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ve(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const ec=new ne,yo=new Ei,lr=new vt,cr=new $;class F1 extends pe{constructor(e=new Ue,t=new Mg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),lr.copy(i.boundingSphere),lr.applyMatrix4(r),lr.radius+=s,e.ray.intersectsSphere(lr)===!1)return;ec.copy(r).invert(),yo.copy(e.ray).applyMatrix4(ec);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=i.index,h=i.attributes.position;if(l!==null){const d=Math.max(0,o.start),p=Math.min(l.count,o.start+o.count);for(let m=d,f=p;m<f;m++){const g=l.getX(m);cr.fromBufferAttribute(h,g),tc(cr,g,c,r,e,t,this)}}else{const d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let m=d,f=p;m<f;m++)cr.fromBufferAttribute(h,m),tc(cr,m,c,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function tc(n,e,t,i,r,s,o){const a=yo.distanceSqToPoint(n);if(a<t){const c=new $;yo.closestPointToPoint(n,c),c.applyMatrix4(i);const l=r.ray.origin.distanceTo(c);if(l<r.near||l>r.far)return;s.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class P1 extends Fe{constructor(e,t,i=Rh,r,s,o,a=Rt,c=Rt,l,u=pl,h=1){if(u!==pl&&u!==Nm)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:h};super(d,r,s,o,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ta(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class R1 extends Fe{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Wh extends Ue{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};const l=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],d=[],p=[];let m=0;const f=[],g=i/2;let y=0;_(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new Pe(h,3)),this.setAttribute("normal",new Pe(d,3)),this.setAttribute("uv",new Pe(p,2));function _(){const x=new $,v=new $;let P=0;const E=(t-e)/i;for(let S=0;S<=s;S++){const C=[],k=S/s,A=k*(t-e)+e;for(let b=0;b<=r;b++){const F=b/r,z=F*c+a,R=Math.sin(z),O=Math.cos(z);v.x=A*R,v.y=-k*i+g,v.z=A*O,h.push(v.x,v.y,v.z),x.set(R,E,O).normalize(),d.push(x.x,x.y,x.z),p.push(F,1-k),C.push(m++)}f.push(C)}for(let S=0;S<r;S++)for(let C=0;C<s;C++){const k=f[C][S],A=f[C+1][S],b=f[C+1][S+1],F=f[C][S+1];(e>0||C!==0)&&(u.push(k,A,F),P+=3),(t>0||C!==s-1)&&(u.push(A,b,F),P+=3)}l.addGroup(y,P,0),y+=P}function M(x){const v=m,P=new ce,E=new $;let S=0;const C=x===!0?e:t,k=x===!0?1:-1;for(let b=1;b<=r;b++)h.push(0,g*k,0),d.push(0,k,0),p.push(.5,.5),m++;const A=m;for(let b=0;b<=r;b++){const z=b/r*c+a,R=Math.cos(z),O=Math.sin(z);E.x=C*O,E.y=g*k,E.z=C*R,h.push(E.x,E.y,E.z),d.push(0,k,0),P.x=R*.5+.5,P.y=O*.5*k+.5,p.push(P.x,P.y),m++}for(let b=0;b<r;b++){const F=v+b,z=A+b;x===!0?u.push(z,z+1,F):u.push(z+1,z,F),S+=3}l.addGroup(y,S,x===!0?1:2),y+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Wh(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Xh extends Ue{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(i),c=Math.floor(r),l=a+1,u=c+1,h=e/a,d=t/c,p=[],m=[],f=[],g=[];for(let y=0;y<u;y++){const _=y*d-o;for(let M=0;M<l;M++){const x=M*h-s;m.push(x,-_,0),f.push(0,0,1),g.push(M/a),g.push(1-y/c)}}for(let y=0;y<c;y++)for(let _=0;_<a;_++){const M=_+l*y,x=_+l*(y+1),v=_+1+l*(y+1),P=_+1+l*y;p.push(M,x,P),p.push(x,v,P)}this.setIndex(p),this.setAttribute("position",new Pe(m,3)),this.setAttribute("normal",new Pe(f,3)),this.setAttribute("uv",new Pe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xh(e.width,e.height,e.widthSegments,e.heightSegments)}}class I1 extends Ue{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){const t=[],i=new Set,r=new $,s=new $;if(e.index!==null){const o=e.attributes.position,a=e.index;let c=e.groups;c.length===0&&(c=[{start:0,count:a.count,materialIndex:0}]);for(let l=0,u=c.length;l<u;++l){const h=c[l],d=h.start,p=h.count;for(let m=d,f=d+p;m<f;m+=3)for(let g=0;g<3;g++){const y=a.getX(m+g),_=a.getX(m+(g+1)%3);r.fromBufferAttribute(o,y),s.fromBufferAttribute(o,_),nc(r,s,i)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}}else{const o=e.attributes.position;for(let a=0,c=o.count/3;a<c;a++)for(let l=0;l<3;l++){const u=3*a+l,h=3*a+(l+1)%3;r.fromBufferAttribute(o,u),s.fromBufferAttribute(o,h),nc(r,s,i)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new Pe(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function nc(n,e,t){const i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,r=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(r)===!0?!1:(t.add(i),t.add(r),!0)}class D1 extends Oh{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Sg extends Nt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=wf,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _t,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class N1 extends Sg{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Z(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ve(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ve(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ve(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class L1 extends Nt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class z1 extends Nt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function hr(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function $g(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function kg(n){function e(r,s){return n[r]-n[s]}const t=n.length,i=new Array(t);for(let r=0;r!==t;++r)i[r]=r;return i.sort(e),i}function ic(n,e,t){const i=n.length,r=new n.constructor(i);for(let s=0,o=0;o!==i;++s){const a=t[s]*e;for(let c=0;c!==e;++c)r[o++]=n[a+c]}return r}function Yh(n,e,t,i){let r=1,s=n[0];for(;s!==void 0&&s[i]===void 0;)s=n[r++];if(s===void 0)return;let o=s[i];if(o!==void 0)if(Array.isArray(o))do o=s[i],o!==void 0&&(e.push(s.time),t.push(...o)),s=n[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[i],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=n[r++];while(s!==void 0);else do o=s[i],o!==void 0&&(e.push(s.time),t.push(o)),s=n[r++];while(s!==void 0)}class ns{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,r=t[i],s=t[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break t}o=t.length;break n}if(!(e>=s)){const a=t[1];e<a&&(i=2,s=a);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(r=s,s=t[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Eg extends ns{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ml,endingEnd:ml}}intervalChanged_(e,t,i){const r=this.parameterPositions;let s=e-2,o=e+1,a=r[s],c=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case fl:s=e,a=2*t-i;break;case gl:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case fl:o=e,c=2*i-t;break;case gl:o=1,c=i+r[1]-r[0];break;default:o=e-1,c=t}const l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,p=this._weightNext,m=(i-t)/(r-t),f=m*m,g=f*m,y=-d*g+2*d*f-d*m,_=(1+d)*g+(-1.5-2*d)*f+(-.5+d)*m+1,M=(-1-p)*g+(1.5+p)*f+.5*m,x=p*g-p*f;for(let v=0;v!==a;++v)s[v]=y*o[u+v]+_*o[l+v]+M*o[c+v]+x*o[h+v];return s}}class Tg extends ns{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(i-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[l+d]*h+o[c+d]*u;return s}}class Ag extends ns{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}}class tt{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=hr(t,this.TimeBufferType),this.values=hr(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:hr(e.times,Array),values:hr(e.values,Array)};const r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Ag(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Tg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Eg(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ir:t=this.InterpolantFactoryMethodDiscrete;break;case fo:t=this.InterpolantFactoryMethodLinear;break;case ys:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ir;case this.InterpolantFactoryMethodLinear:return fo;case this.InterpolantFactoryMethodSmooth:return ys}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){const i=this.times,r=i.length;let s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const c=i[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(r!==void 0&&$g(r))for(let a=0,c=r.length;a!==c;++a){const l=r[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===ys,s=e.length-1;let o=1;for(let a=1;a<s;++a){let c=!1;const l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(r)c=!0;else{const h=a*i,d=h-i,p=h+i;for(let m=0;m!==i;++m){const f=t[h+m];if(f!==t[d+m]||f!==t[p+m]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const h=a*i,d=o*i;for(let p=0;p!==i;++p)t[d+p]=t[h+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}}tt.prototype.ValueTypeName="";tt.prototype.TimeBufferType=Float32Array;tt.prototype.ValueBufferType=Float32Array;tt.prototype.DefaultInterpolation=fo;class Dn extends tt{constructor(e,t,i){super(e,t,i)}}Dn.prototype.ValueTypeName="bool";Dn.prototype.ValueBufferType=Array;Dn.prototype.DefaultInterpolation=Ir;Dn.prototype.InterpolantFactoryMethodLinear=void 0;Dn.prototype.InterpolantFactoryMethodSmooth=void 0;class qh extends tt{constructor(e,t,i,r){super(e,t,i,r)}}qh.prototype.ValueTypeName="color";class Or extends tt{constructor(e,t,i,r){super(e,t,i,r)}}Or.prototype.ValueTypeName="number";class Cg extends ns{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(r-t);let l=e*a;for(let u=l+a;l!==u;l+=4)Wt.slerpFlat(s,0,o,l-a,o,l,c);return s}}class is extends tt{constructor(e,t,i,r){super(e,t,i,r)}InterpolantFactoryMethodLinear(e){return new Cg(this.times,this.values,this.getValueSize(),e)}}is.prototype.ValueTypeName="quaternion";is.prototype.InterpolantFactoryMethodSmooth=void 0;class Nn extends tt{constructor(e,t,i){super(e,t,i)}}Nn.prototype.ValueTypeName="string";Nn.prototype.ValueBufferType=Array;Nn.prototype.DefaultInterpolation=Ir;Nn.prototype.InterpolantFactoryMethodLinear=void 0;Nn.prototype.InterpolantFactoryMethodSmooth=void 0;class Br extends tt{constructor(e,t,i,r){super(e,t,i,r)}}Br.prototype.ValueTypeName="vector";class O1{constructor(e="",t=-1,i=[],r=xf){this.name=e,this.tracks=i,this.duration=t,this.blendMode=r,this.uuid=Qe(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,r=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(Pg(i[o]).scale(r));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){const t=[],i=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,o=i.length;s!==o;++s)t.push(tt.toJSON(i[s]));return r}static CreateFromMorphTargetSequence(e,t,i,r){const s=t.length,o=[];for(let a=0;a<s;a++){let c=[],l=[];c.push((a+s-1)%s,a,(a+1)%s),l.push(0,1,0);const u=kg(c);c=ic(c,1,u),l=ic(l,1,u),!r&&c[0]===0&&(c.push(s),l.push(l[0])),o.push(new Or(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const r=e;i=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<i.length;r++)if(i[r].name===t)return i[r];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const l=e[a],u=l.name.match(s);if(u&&u.length>1){const h=u[1];let d=r[h];d||(r[h]=d=[]),d.push(l)}}const o=[];for(const a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,i));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(h,d,p,m,f){if(p.length!==0){const g=[],y=[];Yh(p,g,y,m),g.length!==0&&f.push(new h(d,g,y))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let h=0;h<l.length;h++){const d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const p={};let m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let f=0;f<d[m].morphTargets.length;f++)p[d[m].morphTargets[f]]=-1;for(const f in p){const g=[],y=[];for(let _=0;_!==d[m].morphTargets.length;++_){const M=d[m];g.push(M.time),y.push(M.morphTarget===f?1:0)}r.push(new Or(".morphTargetInfluence["+f+"]",g,y))}c=p.length*o}else{const p=".bones["+t[h].name+"]";i(Br,p+".position",d,"pos",r),i(is,p+".quaternion",d,"rot",r),i(Br,p+".scale",d,"scl",r)}}return r.length===0?null:new this(s,c,r,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,r=e.length;i!==r;++i){const s=this.tracks[i];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Fg(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Or;case"vector":case"vector2":case"vector3":case"vector4":return Br;case"color":return qh;case"quaternion":return is;case"bool":case"boolean":return Dn;case"string":return Nn}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function Pg(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Fg(n.type);if(n.times===void 0){const t=[],i=[];Yh(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const ft={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class Rg{constructor(e,t,i){const r=this;let s=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.abortController=new AbortController,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){const h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){const p=l[h],m=l[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const Ig=new Rg;class Ti{constructor(e){this.manager=e!==void 0?e:Ig,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Ti.DEFAULT_MATERIAL_NAME="__DEFAULT";const ht={};class Dg extends Error{constructor(e,t){super(e),this.response=t}}class B1 extends Ti{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=ft.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(ht[e]!==void 0){ht[e].push({onLoad:t,onProgress:i,onError:r});return}ht[e]=[],ht[e].push({onLoad:t,onProgress:i,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const u=ht[e],h=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),p=d?parseInt(d):0,m=p!==0;let f=0;const g=new ReadableStream({start(y){_();function _(){h.read().then(({done:M,value:x})=>{if(M)y.close();else{f+=x.byteLength;const v=new ProgressEvent("progress",{lengthComputable:m,loaded:f,total:p});for(let P=0,E=u.length;P<E;P++){const S=u[P];S.onProgress&&S.onProgress(v)}y.enqueue(x),_()}},M=>{y.error(M)})}}});return new Response(g)}else throw new Dg(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a==="")return l.text();{const h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,p=new TextDecoder(d);return l.arrayBuffer().then(m=>p.decode(m))}}}).then(l=>{ft.add(`file:${e}`,l);const u=ht[e];delete ht[e];for(let h=0,d=u.length;h<d;h++){const p=u[h];p.onLoad&&p.onLoad(l)}}).catch(l=>{const u=ht[e];if(u===void 0)throw this.manager.itemError(e),l;delete ht[e];for(let h=0,d=u.length;h<d;h++){const p=u[h];p.onError&&p.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const _n=new WeakMap;class Ng extends Ti{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=ft.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let h=_n.get(o);h===void 0&&(h=[],_n.set(o,h)),h.push({onLoad:t,onError:r})}return o}const a=Dr("img");function c(){u(),t&&t(this);const h=_n.get(this)||[];for(let d=0;d<h.length;d++){const p=h[d];p.onLoad&&p.onLoad(this)}_n.delete(this),s.manager.itemEnd(e)}function l(h){u(),r&&r(h),ft.remove(`image:${e}`);const d=_n.get(this)||[];for(let p=0;p<d.length;p++){const m=d[p];m.onError&&m.onError(h)}_n.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),ft.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class j1 extends Ti{constructor(e){super(e)}load(e,t,i,r){const s=new Fe,o=new Ng(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},i,r),s}}class rs extends pe{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ve(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Hs=new ne,rc=new $,sc=new $;class ra{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=Ko,this.map=null,this.mapPass=null,this.matrix=new ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new vg,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new Me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;rc.setFromMatrixPosition(e.matrixWorld),t.position.copy(rc),sc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(sc),t.updateMatrixWorld(),Hs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Hs,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Hs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Lg extends ra{constructor(){super(new dt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,i=ui*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(i!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=i,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class V1 extends rs{constructor(e,t,i=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(pe.DEFAULT_UP),this.updateMatrix(),this.target=new pe,this.distance=i,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new Lg}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const oc=new ne,Qn=new $,Gs=new $;class zg extends ra{constructor(){super(new dt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ce(4,2),this._viewportCount=6,this._viewports=[new Me(2,1,1,1),new Me(0,1,1,1),new Me(3,1,1,1),new Me(1,1,1,1),new Me(3,0,1,1),new Me(1,0,1,1)],this._cubeDirections=[new $(1,0,0),new $(-1,0,0),new $(0,0,1),new $(0,0,-1),new $(0,1,0),new $(0,-1,0)],this._cubeUps=[new $(0,1,0),new $(0,1,0),new $(0,1,0),new $(0,1,0),new $(0,0,1),new $(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Qn.setFromMatrixPosition(e.matrixWorld),i.position.copy(Qn),Gs.copy(i.position),Gs.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Gs),i.updateMatrixWorld(),r.makeTranslation(-Qn.x,-Qn.y,-Qn.z),oc.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(oc,i.coordinateSystem,i.reversedDepth)}}class U1 extends rs{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new zg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Og extends ia{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=r+t,c=r-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Bg extends ra{constructor(){super(new Og(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class H1 extends rs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(pe.DEFAULT_UP),this.updateMatrix(),this.target=new pe,this.shadow=new Bg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class G1 extends rs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class W1{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class X1 extends Ue{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}const Ws=new WeakMap;class Y1 extends Ti{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=ft.get(`image-bitmap:${e}`);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(l=>{if(Ws.has(o)===!0)r&&r(Ws.get(o)),s.manager.itemError(e),s.manager.itemEnd(e);else return t&&t(l),s.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){return ft.add(`image-bitmap:${e}`,l),t&&t(l),s.manager.itemEnd(e),l}).catch(function(l){r&&r(l),Ws.set(c,l),ft.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});ft.add(`image-bitmap:${e}`,c),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class q1 extends dt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Z1{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}const sa="\\[\\]\\.:\\/",jg=new RegExp("["+sa+"]","g"),oa="[^"+sa+"]",Vg="[^"+sa.replace("\\.","")+"]",Ug=/((?:WC+[\/:])*)/.source.replace("WC",oa),Hg=/(WCOD+)?/.source.replace("WCOD",Vg),Gg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",oa),Wg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",oa),Xg=new RegExp("^"+Ug+Hg+Gg+Wg+"$"),Yg=["material","materials","bones","map"];class qg{constructor(e,t,i){const r=i||ae.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class ae{constructor(e,t,i){this.path=t,this.parsedPath=i||ae.parseTrackName(t),this.node=ae.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new ae.Composite(e,t,i):new ae(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(jg,"")}static parseTrackName(e){const t=Xg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=i.nodeName.substring(r+1);Yg.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const c=i(a.children);if(c)return c}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,r=t.propertyName;let s=t.propertyIndex;if(e||(e=ae.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const o=e[r];if(o===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ae.Composite=qg;ae.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ae.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ae.prototype.GetterByBindingType=[ae.prototype._getValue_direct,ae.prototype._getValue_array,ae.prototype._getValue_arrayElement,ae.prototype._getValue_toArray];ae.prototype.SetterByBindingTypeAndVersioning=[[ae.prototype._setValue_direct,ae.prototype._setValue_direct_setNeedsUpdate,ae.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_array,ae.prototype._setValue_array_setNeedsUpdate,ae.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_arrayElement,ae.prototype._setValue_arrayElement_setNeedsUpdate,ae.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_fromArray,ae.prototype._setValue_fromArray_setNeedsUpdate,ae.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class J1 extends Bh{constructor(e,t,i=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){const t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){const t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}}const ac=new ne;class K1{constructor(e,t,i=0,r=1/0){this.ray=new Ei(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new Lh,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ac.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ac),this}intersectObject(e,t=!0,i=[]){return _o(e,this,i,t),i.sort(lc),i}intersectObjects(e,t=!0,i=[]){for(let r=0,s=e.length;r<s;r++)_o(e[r],this,i,t);return i.sort(lc),i}}function lc(n,e){return n.distance-e.distance}function _o(n,e,t,i){let r=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(r=!1),r===!0&&i===!0){const s=n.children;for(let o=0,a=s.length;o<a;o++)_o(s[o],e,t,!0)}}class Zh{constructor(e,t,i,r){Zh.prototype.isMatrix2=!0,this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,r){const s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=r,this}}const cc=new $,ur=new $,bn=new $,xn=new $,Xs=new $,Zg=new $,Jg=new $;class Q1{constructor(e=new $,t=new $){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){cc.subVectors(e,this.start),ur.subVectors(this.end,this.start);const i=ur.dot(ur);let s=ur.dot(cc)/i;return t&&(s=Z(s,0,1)),s}closestPointToPoint(e,t,i){const r=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=Zg,i=Jg){const r=10000000000000001e-32;let s,o;const a=this.start,c=e.start,l=this.end,u=e.end;bn.subVectors(l,a),xn.subVectors(u,c),Xs.subVectors(a,c);const h=bn.dot(bn),d=xn.dot(xn),p=xn.dot(Xs);if(h<=r&&d<=r)return t.copy(a),i.copy(c),t.sub(i),t.dot(t);if(h<=r)s=0,o=p/d,o=Z(o,0,1);else{const m=bn.dot(Xs);if(d<=r)o=0,s=Z(-m/h,0,1);else{const f=bn.dot(xn),g=h*d-f*f;g!==0?s=Z((f*p-m*d)/g,0,1):s=0,o=(f*s+p)/d,o<0?(o=0,s=Z(-m/h,0,1)):o>1&&(o=1,s=Z((f-m)/h,0,1))}}return t.copy(a).add(bn.multiplyScalar(s)),i.copy(c).add(xn.multiplyScalar(o)),t.sub(i),t.dot(t)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}const dr=new $,ue=new ia;class ew extends wg{constructor(e){const t=new Ue,i=new Hh({color:16777215,vertexColors:!0,toneMapped:!1}),r=[],s=[],o={};a("n1","n2"),a("n2","n4"),a("n4","n3"),a("n3","n1"),a("f1","f2"),a("f2","f4"),a("f4","f3"),a("f3","f1"),a("n1","f1"),a("n2","f2"),a("n3","f3"),a("n4","f4"),a("p","n1"),a("p","n2"),a("p","n3"),a("p","n4"),a("u1","u2"),a("u2","u3"),a("u3","u1"),a("c","t"),a("p","c"),a("cn1","cn2"),a("cn3","cn4"),a("cf1","cf2"),a("cf3","cf4");function a(m,f){c(m),c(f)}function c(m){r.push(0,0,0),s.push(0,0,0),o[m]===void 0&&(o[m]=[]),o[m].push(r.length/3-1)}t.setAttribute("position",new Pe(r,3)),t.setAttribute("color",new Pe(s,3)),super(t,i),this.type="CameraHelper",this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=o,this.update();const l=new ve(16755200),u=new ve(16711680),h=new ve(43775),d=new ve(16777215),p=new ve(3355443);this.setColors(l,u,h,d,p)}setColors(e,t,i,r,s){const a=this.geometry.getAttribute("color");return a.setXYZ(0,e.r,e.g,e.b),a.setXYZ(1,e.r,e.g,e.b),a.setXYZ(2,e.r,e.g,e.b),a.setXYZ(3,e.r,e.g,e.b),a.setXYZ(4,e.r,e.g,e.b),a.setXYZ(5,e.r,e.g,e.b),a.setXYZ(6,e.r,e.g,e.b),a.setXYZ(7,e.r,e.g,e.b),a.setXYZ(8,e.r,e.g,e.b),a.setXYZ(9,e.r,e.g,e.b),a.setXYZ(10,e.r,e.g,e.b),a.setXYZ(11,e.r,e.g,e.b),a.setXYZ(12,e.r,e.g,e.b),a.setXYZ(13,e.r,e.g,e.b),a.setXYZ(14,e.r,e.g,e.b),a.setXYZ(15,e.r,e.g,e.b),a.setXYZ(16,e.r,e.g,e.b),a.setXYZ(17,e.r,e.g,e.b),a.setXYZ(18,e.r,e.g,e.b),a.setXYZ(19,e.r,e.g,e.b),a.setXYZ(20,e.r,e.g,e.b),a.setXYZ(21,e.r,e.g,e.b),a.setXYZ(22,e.r,e.g,e.b),a.setXYZ(23,e.r,e.g,e.b),a.setXYZ(24,t.r,t.g,t.b),a.setXYZ(25,t.r,t.g,t.b),a.setXYZ(26,t.r,t.g,t.b),a.setXYZ(27,t.r,t.g,t.b),a.setXYZ(28,t.r,t.g,t.b),a.setXYZ(29,t.r,t.g,t.b),a.setXYZ(30,t.r,t.g,t.b),a.setXYZ(31,t.r,t.g,t.b),a.setXYZ(32,i.r,i.g,i.b),a.setXYZ(33,i.r,i.g,i.b),a.setXYZ(34,i.r,i.g,i.b),a.setXYZ(35,i.r,i.g,i.b),a.setXYZ(36,i.r,i.g,i.b),a.setXYZ(37,i.r,i.g,i.b),a.setXYZ(38,r.r,r.g,r.b),a.setXYZ(39,r.r,r.g,r.b),a.setXYZ(40,s.r,s.g,s.b),a.setXYZ(41,s.r,s.g,s.b),a.setXYZ(42,s.r,s.g,s.b),a.setXYZ(43,s.r,s.g,s.b),a.setXYZ(44,s.r,s.g,s.b),a.setXYZ(45,s.r,s.g,s.b),a.setXYZ(46,s.r,s.g,s.b),a.setXYZ(47,s.r,s.g,s.b),a.setXYZ(48,s.r,s.g,s.b),a.setXYZ(49,s.r,s.g,s.b),a.needsUpdate=!0,this}update(){const e=this.geometry,t=this.pointMap,i=1,r=1;let s,o;if(ue.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)s=1,o=0;else if(this.camera.coordinateSystem===mt)s=-1,o=1;else if(this.camera.coordinateSystem===hi)s=0,o=1;else throw new Error("THREE.CameraHelper.update(): Invalid coordinate system: "+this.camera.coordinateSystem);me("c",t,e,ue,0,0,s),me("t",t,e,ue,0,0,o),me("n1",t,e,ue,-i,-r,s),me("n2",t,e,ue,i,-r,s),me("n3",t,e,ue,-i,r,s),me("n4",t,e,ue,i,r,s),me("f1",t,e,ue,-i,-r,o),me("f2",t,e,ue,i,-r,o),me("f3",t,e,ue,-i,r,o),me("f4",t,e,ue,i,r,o),me("u1",t,e,ue,i*.7,r*1.1,s),me("u2",t,e,ue,-i*.7,r*1.1,s),me("u3",t,e,ue,0,r*2,s),me("cf1",t,e,ue,-i,0,o),me("cf2",t,e,ue,i,0,o),me("cf3",t,e,ue,0,-r,o),me("cf4",t,e,ue,0,r,o),me("cn1",t,e,ue,-i,0,s),me("cn2",t,e,ue,i,0,s),me("cn3",t,e,ue,0,-r,s),me("cn4",t,e,ue,0,r,s),e.getAttribute("position").needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}}function me(n,e,t,i,r,s,o){dr.set(r,s,o).unproject(i);const a=e[n];if(a!==void 0){const c=t.getAttribute("position");for(let l=0,u=a.length;l<u;l++)c.setXYZ(a[l],dr.x,dr.y,dr.z)}}function tw(n,e,t,i){const r=Kg(i);switch(t){case Im:return n*e;case Ih:return n*e/r.components*r.byteLength;case Lm:return n*e/r.components*r.byteLength;case zm:return n*e*2/r.components*r.byteLength;case Om:return n*e*2/r.components*r.byteLength;case Dm:return n*e*3/r.components*r.byteLength;case Qo:return n*e*4/r.components*r.byteLength;case Bm:return n*e*4/r.components*r.byteLength;case jm:case Vm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Um:case Hm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Wm:case Ym:return Math.max(n,16)*Math.max(e,8)/4;case Gm:case Xm:return Math.max(n,8)*Math.max(e,8)/2;case qm:case Zm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Jm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Km:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Qm:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case ef:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case tf:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case nf:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case rf:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case sf:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case of:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case af:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case lf:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case cf:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case hf:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case uf:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case df:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case pf:case mf:case ff:return Math.ceil(n/4)*Math.ceil(e/4)*16;case gf:case yf:return Math.ceil(n/4)*Math.ceil(e/4)*8;case _f:case bf:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Kg(n){switch(n){case Ko:case $m:return{byteLength:1,components:1};case Em:case km:case Am:return{byteLength:2,components:1};case Cm:case Fm:return{byteLength:2,components:4};case Rh:case Tm:case Qr:return{byteLength:4,components:1};case Pm:case Rm:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ah}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ah);const et=Object.freeze({width:1754,height:1240}),Ke=Object.freeze({width:1536,height:864}),aa=2,jr=20,nw="ssproj",Jh=16e3,hc=100,Qg=Math.floor(Jh/et.width*100),ey=Math.floor(Jh/et.height*100),iw=1,Kh=20,Qh=200,rw=.96,sw=.55,ow=960,aw=16,lw=10,cw=360,hw=52,bo=.1,xo=1e3,uw=2.5,dw=.006,pw=.0015,pr=1,ty="1u = 1m",ny=.7,iy=2,mw=.01,An=1,vo="camera-frames.mobileUiScale",eu=.6,tu=1.2,nu=.01,Ai=1.1,wo="camera-frames.viewportLodScale",fw=new Set(["ply","spz","splat","ksplat","zip","sog","rad"]),gw=1e5,yw=new Set(["glb","gltf"]),rt={"top-left":{x:0,y:0},"top-center":{x:.5,y:0},"top-right":{x:1,y:0},"middle-left":{x:0,y:.5},center:{x:.5,y:.5},"middle-right":{x:1,y:.5},"bottom-left":{x:0,y:1},"bottom-center":{x:.5,y:1},"bottom-right":{x:1,y:1}},Vr=Math.PI/180,iu=36,uc=14,ry=200,dc=Object.freeze([14,18,21,24,28,35,50,70,75,85,100,135,200]);function ru(){return et.width/Ke.width}function Mo(n){const e=Number(n)*Vr*.5;return Math.atan(Math.tan(e)/ru())*2/Vr}function pc(n){const e=Mo(n)*Vr*.5;return iu/Math.max(2*Math.tan(e),1e-6)}function la(n){const e=Number(n);return Number.isFinite(e)?Math.min(ry,Math.max(uc,e)):uc}function sy(n,e=1.5){const t=la(n),i=dc.reduce((r,s)=>Math.abs(s-t)<Math.abs(r-t)?s:r,dc[0]);return Math.abs(i-t)<=e?i:t}function ca(n){const e=la(n),t=iu/Math.max(2*e,1e-6);return Math.atan(t*ru())*2/Vr}const oy=24,su=ca(35),ay=ca(oy),ou="bounds",di="trajectory",au="line",pi="spline",Vt="auto",Ur="corner",Hr="mirrored",mi="free",Xt="none",je="center",ha="top-left",ua="top-right",da="bottom-right",pa="bottom-left",lu=new Set([ha,ua,da,pa]),ly=.35;function cy(n,e,t){const i=Math.cos(t),r=Math.sin(t);return{x:n*i-e*r,y:n*r+e*i}}function mc(n,e=.5){const t=Number(n);return Number.isFinite(t)?t:e}function So(n){let e=Number(n)||0;for(;e<=-180;)e+=360;for(;e>180;)e-=360;return e}function vr(n){const e=Number(n==null?void 0:n.scale);return Number.isFinite(e)&&e>0?e:1}function $o(n){return So((n==null?void 0:n.rotation)??0)}function Ve(n){return{x:mc(n==null?void 0:n.x,.5),y:mc(n==null?void 0:n.y,.5)}}function si(n){return n?{x:n.x,y:n.y}:null}function ko(n){if(!n||typeof n!="object")return null;const e=Number(n.x),t=Number(n.y);return!Number.isFinite(e)||!Number.isFinite(t)?null:{x:e,y:t}}function fc(n){return ko(n)}function ma(n){return n===di?di:ou}function fa(n){return n===pi?pi:au}function ga(n){return n===Ur?Ur:n===Hr?Hr:n===mi?mi:Vt}function Ln(n){return n===je||lu.has(n)?n:Xt}function hy(n){const e=si((n==null?void 0:n.in)??null),t=si((n==null?void 0:n.out)??null),i=ga(n==null?void 0:n.mode);return i===Vt&&!e&&!t?null:{...i!==Vt?{mode:i}:{},...e?{in:e}:{},...t?{out:t}:{}}}function uy(n={}){const e={};for(const[t,i]of Object.entries(n??{})){if(typeof t!="string"||!t)continue;const r=hy(i);r&&(e[t]=r)}return e}function Sn(n,e,t){const i=Ve(n);return{x:i.x*e,y:i.y*t}}function cu(n,e,t){return{x:n.x/Math.max(e,1e-6),y:n.y/Math.max(t,1e-6)}}function dy(n,e){return{x:n.x+e.x,y:n.y+e.y}}function wn(n,e){return{x:n.x-e.x,y:n.y-e.y}}function Ze(n,e){return{x:n.x*e,y:n.y*e}}function Eo(n){return Math.hypot(n.x,n.y)}function Ys(n){const e=Eo(n);return e<=1e-6?null:{x:n.x/e,y:n.y/e}}function py(n,e){return n.x*e.x+n.y*e.y}function ya(n){if(!n||typeof n!="object")return null;const e=ga(n.mode),t=fc(n.in),i=fc(n.out),r=e===Vt&&(t||i)?mi:e;if(r===Vt&&!t&&!i)return null;if(r===Hr){if(t&&!i)return{mode:r,in:t,out:Ze(t,-1)};if(!t&&i)return{mode:r,in:Ze(i,-1),out:i}}return r===Ur||r===Vt||t||i?{...r!==Vt?{mode:r}:{},...t?{in:t}:{},...i?{out:i}:{}}:null}function my(n=[],e={}){const t=new Set((n??[]).map(s=>s==null?void 0:s.id).filter(s=>typeof s=="string"&&s.length>0)),i=new Map((n??[]).map(s=>[s.id,Ve(s)])),r={};for(const[s,o]of Object.entries(e??{})){if(!t.has(s))continue;const a=i.get(s);if(!a)continue;const c=ko(o==null?void 0:o.in),l=ko(o==null?void 0:o.out),u=ya({mode:mi,in:c?{x:c.x-a.x,y:c.y-a.y}:null,out:l?{x:l.x-a.x,y:l.y-a.y}:null});u&&(r[s]=u)}return r}function fy(n=[],e={}){const t=new Set((n??[]).map(s=>s==null?void 0:s.id).filter(s=>typeof s=="string"&&s.length>0)),i={},r=e!=null&&e.nodesByFrameId&&typeof e.nodesByFrameId=="object"?e.nodesByFrameId:my(n,e==null?void 0:e.handlesByFrameId);for(const[s,o]of Object.entries(r??{})){if(!t.has(s))continue;const a=ya(o);a&&(i[s]=a)}return i}function hu(n,e){var t,i;return ya((i=(t=n==null?void 0:n.trajectory)==null?void 0:t.nodesByFrameId)==null?void 0:i[e])}function _a(n,e){var t;return ga((t=hu(n,e))==null?void 0:t.mode)}function gy(n,e,t,i){const r=Sn(n[e],t,i);if(n.length<=1)return{in:{x:0,y:0},out:{x:0,y:0}};const s=e>0?Sn(n[e-1],t,i):null,o=e<n.length-1?Sn(n[e+1],t,i):null;if(e<=0){const _=o?wn(o,r):{x:0,y:0};return{in:{x:0,y:0},out:Ze(_,1/3)}}if(e>=n.length-1){const _=s?wn(r,s):{x:0,y:0};return{in:Ze(_,-1/3),out:{x:0,y:0}}}const a=s?wn(r,s):{x:0,y:0},c=o?wn(o,r):{x:0,y:0},l=Eo(a),u=Eo(c),h=Ys(a),d=Ys(c);if(!h||!d)return{in:h?Ze(a,-1/3):{x:0,y:0},out:d?Ze(c,1/3):{x:0,y:0}};const m=Ys({x:h.x*Math.sqrt(Math.max(l,1e-6))+d.x*Math.sqrt(Math.max(u,1e-6)),y:h.y*Math.sqrt(Math.max(l,1e-6))+d.y*Math.sqrt(Math.max(u,1e-6))})??d,f=Math.max(0,Math.min(1,(1+py(h,d))*.5)),g=l/3*f,y=u/3*f;return{in:Ze(m,-g),out:Ze(m,y)}}function yy(n,e,t,i){const r=Sn(n[e],t,i),s=e>0?Sn(n[e-1],t,i):null,o=e<n.length-1?Sn(n[e+1],t,i):null,a=s?wn(r,s):{x:0,y:0},c=o?wn(o,r):{x:0,y:0};return{in:Ze(a,-1/3),out:Ze(c,1/3)}}function uu(n,e,t,i,r){const s=gy(n,e,i,r),o=t==="in"?s.in:s.out;return cu(o,i,r)}function _y(n,e,t,i,r=1,s=1){const o=(n??[]).findIndex(l=>(l==null?void 0:l.id)===t);if(o<0)return null;const a=_a(e,t);if(a===Ur){const l=yy(n,o,r,s),u=i==="in"?l.in:l.out;return cu(u,r,s)}const c=hu(e,t);if(a===mi)return si((c==null?void 0:c[i])??{x:0,y:0});if(a===Hr){const l=si((c==null?void 0:c[i])??null);if(l)return l;const u=i==="in"?"out":"in",h=si((c==null?void 0:c[u])??null);return h?Ze(h,-1):{x:0,y:0}}return uu(n,o,i,r,s)}function by(n,e,t,i,r){const s=Ve(n[e]),o=uu(n,e,t,i,r);return{x:s.x+o.x,y:s.y+o.y}}function Cn(n,e,t,i,r=1,s=1){const o=(n??[]).findIndex(l=>(l==null?void 0:l.id)===t);if(o<0)return null;const a=Ve(n[o]),c=_y(n,e,t,i,r,s);return c?dy(a,c):by(n,o,i,r,s)}function xy(n,e,t,i,r){const s=n[t],o=n[t+1];return!s||!o?null:{p0:Ve(s),p1:Cn(n,e,s.id,"out",i,r),p2:Cn(n,e,o.id,"in",i,r),p3:Ve(o)}}function vy(n,e,t,i,r){const s=1-r,o=s*s*s,a=3*s*s*r,c=3*s*r*r,l=r*r*r;return{x:n.x*o+e.x*a+t.x*c+i.x*l,y:n.y*o+e.y*a+t.y*c+i.y*l}}function wy(n,e,t){let i=So(e-n);return i>180&&(i-=360),i<-180&&(i+=360),So(n+i*t)}function My(n,e,t,i,r=1,s=1){const o=n[t],a=n[t+1];if(!o||!a)return null;if(fa(e==null?void 0:e.trajectoryMode)===pi){const u=xy(n,e,t,r,s);if(u)return vy(u.p0,u.p1,u.p2,u.p3,i)}const c=Ve(o),l=Ve(a);return{x:c.x+(l.x-c.x)*i,y:c.y+(l.y-c.y)*i}}function oi(n,e,t){const i=vr(n),r=$o(n),s=r*Math.PI/180,o=Ke.width*i,a=Ke.height*i,c=Ve(n),l={x:c.x*e,y:c.y*t},u=o*.5,h=a*.5,d=[{x:-u,y:-h},{x:u,y:-h},{x:u,y:h},{x:-u,y:h}].map(p=>{const m=cy(p.x,p.y,s);return{x:l.x+m.x,y:l.y+m.y}});return{frame:n,centerPoint:l,centerNormalized:c,scale:i,rotationDeg:r,rotationRadians:s,width:o,height:a,corners:d,cornerPointsByKey:{[ha]:d[0],[ua]:d[1],[da]:d[2],[pa]:d[3]}}}function To(n,e,t,i,r,s){const o=n[t],a=n[t+1];if(!o||!a)return null;if(i<=0)return oi(o,r,s);if(i>=1)return oi(a,r,s);const c=My(n,e,t,i,r,s);return c?oi({x:c.x,y:c.y,scale:vr(o)+(vr(a)-vr(o))*i,rotation:wy($o(o),$o(a),i)},r,s):null}function Sy(n,e,t){if(!n||!e||!t)return 0;const i=[[n.centerPoint,e.centerPoint,t.centerPoint],...n.corners.map((s,o)=>[s,e.corners[o],t.corners[o]])];let r=0;for(const[s,o,a]of i){if(!s||!o||!a||!Number.isFinite(s.x)||!Number.isFinite(s.y)||!Number.isFinite(o.x)||!Number.isFinite(o.y)||!Number.isFinite(a.x)||!Number.isFinite(a.y))continue;const c={x:(s.x+a.x)*.5,y:(s.y+a.y)*.5};r=Math.max(r,Math.hypot(o.x-c.x,o.y-c.y))}return r}function Ao(n,e,t,i,r,s,o,a,c,l,u,h,d){if(!o||!a)return;const p=(r+s)*.5,m=To(e,t,i,p,c,l),f=Sy(o,m,a);if(!m||h>=d||f<=u||s-r<=1/4096){n.push(a);return}Ao(n,e,t,i,r,p,o,m,c,l,u,h+1,d),Ao(n,e,t,i,p,s,m,a,c,l,u,h+1,d)}function ba(n,e,t,i,{maxSegmentErrorPx:r=ly,maxSubdivisionDepth:s=8}={}){if(!Array.isArray(n)||n.length===0)return[];if(n.length===1)return[oi(n[0],t,i)];const o=[];for(let a=0;a<n.length-1;a+=1){const c=To(n,e,a,0,t,i),l=To(n,e,a,1,t,i);!c||!l||(a===0&&o.push(c),Ao(o,n,e,a,0,1,c,l,t,i,r,0,s))}return o}function du(n,e){return n?e===je?n.centerPoint:lu.has(e)?n.cornerPointsByKey[e]??null:null:null}function pu(n,e,t,i,{source:r=je,baseSamplesPerSegment:s=16}={}){const o=Ln(r);return o===Xt?[]:ba(n,e,t,i,{maxSegmentErrorPx:Math.max(.25,1/Math.max(s,1))}).map(a=>du(a,o)).filter(a=>Number.isFinite(a==null?void 0:a.x)&&Number.isFinite(a==null?void 0:a.y))}function $y(n,e,t,i,r){const s=n[t];if(!s)return null;const o=fa(e==null?void 0:e.trajectoryMode)===pi,a=Ve(s),c={x:a.x*i,y:a.y*r};let l=null;if(t<n.length-1)if(o){const p=Cn(n,e,s.id,"out",i,r);p&&(l={x:p.x*i-c.x,y:p.y*r-c.y})}else{const p=Ve(n[t+1]);l={x:p.x*i-c.x,y:p.y*r-c.y}}let u=null;if(t>0)if(o){const p=Cn(n,e,s.id,"in",i,r);p&&(u={x:c.x-p.x*i,y:c.y-p.y*r})}else{const p=Ve(n[t-1]);u={x:c.x-p.x*i,y:c.y-p.y*r}}let h=null;if(l&&u?h={x:l.x+u.x,y:l.y+u.y}:l?h=l:u&&(h=u),!h)return null;const d=Math.hypot(h.x,h.y);return!(d>0)||!Number.isFinite(d)?null:{x:h.x/d,y:h.y/d}}function gc(n,e,t){return(e.x-n.x)*(t.y-n.y)-(e.y-n.y)*(t.x-n.x)}function ky(n){const e=n.filter(s=>Number.isFinite(s==null?void 0:s.x)&&Number.isFinite(s==null?void 0:s.y));if(e.length<3)return e.slice();const t=e.slice().sort((s,o)=>s.x!==o.x?s.x-o.x:s.y-o.y),i=[];for(const s of t){for(;i.length>=2&&gc(i[i.length-2],i[i.length-1],s)<=0;)i.pop();i.push(s)}const r=[];for(let s=t.length-1;s>=0;s-=1){const o=t[s];for(;r.length>=2&&gc(r[r.length-2],r[r.length-1],o)<=0;)r.pop();r.push(o)}return i.pop(),r.pop(),i.concat(r)}function Ey(n,e,t){if(!Array.isArray(e)||e.length<2)return!1;for(let i=0;i<e.length;i+=1){const r=e[i],s=e[(i+1)%e.length],o=s.x-r.x,a=s.y-r.y,c=n.x-r.x,l=n.y-r.y,u=o*o+a*a;if(u<=0){const p=n.x-r.x,m=n.y-r.y;if(p*p+m*m<=t*t)return!0;continue}const h=o*l-a*c;if(h*h>t*t*u)continue;const d=o*c+a*l;if(!(d<-t*Math.sqrt(u))&&!(d>u+t*Math.sqrt(u)))return!0}return!1}const Ty=[ha,ua,da,pa];function _w(n,e){if(!Array.isArray(n)||n.length<2)return je;const t=ba(n,e,1,1);if(t.length===0)return je;const i=t.flatMap(o=>o.corners),r=ky(i);if(r.length<3)return je;const s=1e-5;for(const o of Ty){const a=t.map(l=>l.cornerPointsByKey[o]).filter(l=>Number.isFinite(l==null?void 0:l.x)&&Number.isFinite(l==null?void 0:l.y));if(a.length===0)continue;if(a.every(l=>Ey(l,r,s)))return o}return je}function Ay(n,e,t,i,{source:r=je}={}){const s=Ln(r);if(!Array.isArray(n)||n.length<2||s===Xt)return[];const o=[];for(let a=0;a<n.length;a+=1){const c=n[a],l=oi(c,t,i),u=du(l,s);if(!u||!Number.isFinite(u.x)||!Number.isFinite(u.y))continue;const h=$y(n,e,a,t,i);h&&o.push({frameId:c.id,point:u,tangent:h})}return o}const mu=1,bw="reference-image",Fn="back",fi="front",gi="reference-preset-blank",ai="(blank)",xw=16e3,vw=4096;function Cy(){return Math.random().toString(36).slice(2,10)}function xa(n,e){var t,i;try{const r=(i=(t=globalThis.crypto)==null?void 0:t.randomUUID)==null?void 0:i.call(t);if(typeof r=="string"&&r)return`${n}-${r}`}catch{}return e.count+=1,`${n}-${Date.now().toString(36)}-${e.count.toString(36)}-${Cy()}`}const va={item:{count:0},preset:{count:0},asset:{count:0}};function Fy(){return xa("reference-image",va.item)}function Py(){return xa("reference-preset",va.preset)}function Ry(){return xa("reference-asset",va.asset)}function Te(n){return typeof n=="number"&&Number.isFinite(n)}function wa(n,e,t){return Math.max(e,Math.min(t,n))}function Iy(n,e="reference.png"){return(String(n??"").trim().replace(/\\/g,"/").split("/").pop()??"")||e}function Ht(n,e){const t=Number((n==null?void 0:n.w)??(n==null?void 0:n.width)),i=Number((n==null?void 0:n.h)??(n==null?void 0:n.height));return{w:Te(t)&&t>0?Math.max(1,Math.round(t)):e.w,h:Te(i)&&i>0?Math.max(1,Math.round(i)):e.h}}function fu(n,e=1){return wa(Te(n)?n:e,0,1)}function It(n,e={ax:.5,ay:.5}){const t=Te((n==null?void 0:n.ax)??(n==null?void 0:n.x))?Number(n.ax??n.x):e.ax,i=Te((n==null?void 0:n.ay)??(n==null?void 0:n.y))?Number(n.ay??n.y):e.ay;return{ax:t,ay:i}}function gu(n="center"){const e=rt[String(n??"center")]??rt.center;return{ax:e.x,ay:e.y}}function bt(n,e={x:0,y:0}){return{x:Te(n==null?void 0:n.x)?n.x:e.x,y:Te(n==null?void 0:n.y)?n.y:e.y}}function yu(n,e="reference.png"){const t=Ht(n==null?void 0:n.originalSize,{w:1,h:1}),i=Ht(n==null?void 0:n.appliedSize,t);return{filename:Iy(n==null?void 0:n.filename,e),mime:typeof(n==null?void 0:n.mime)=="string"&&n.mime.trim()?n.mime.trim():"application/octet-stream",originalSize:t,appliedSize:i,pixelRatio:Te(n==null?void 0:n.pixelRatio)&&n.pixelRatio>0?n.pixelRatio:i.w/Math.max(1,t.w),usedOriginal:(n==null?void 0:n.usedOriginal)!==!1}}function Dy(n=null){var o;const{id:e,label:t="Reference",source:i=null,sourceMeta:r=null}=n??{},s=(r==null?void 0:r.filename)??(i==null?void 0:i.fileName)??((o=i==null?void 0:i.file)==null?void 0:o.name)??"reference.png";return{id:e??Ry(),label:String(t??s).trim()||s,source:i,sourceMeta:yu(r,s)}}function _u(n){return{...n,source:(n==null?void 0:n.source)??null,sourceMeta:yu(n==null?void 0:n.sourceMeta,(n==null?void 0:n.label)??"reference.png")}}function Ny(n,e=fi){return n===Fn?Fn:e}function Ma(n=null){const{id:e,assetId:t="",name:i="Reference",group:r=fi,order:s=0,previewVisible:o=!0,exportEnabled:a=!0,opacity:c=1,scalePct:l=100,rotationDeg:u=0,offsetPx:h={x:0,y:0},anchor:d={ax:.5,ay:.5}}=n??{};return{id:e??Fy(),assetId:String(t??"").trim(),name:String(i??"").trim()||"Reference",group:Ny(r),order:Te(s)?Math.max(0,Math.floor(s)):0,previewVisible:o!==!1,exportEnabled:a!==!1,opacity:fu(c,1),scalePct:Te(l)&&l>0?wa(l,.1,1e5):100,rotationDeg:Te(u)?u:0,offsetPx:bt(h),anchor:It(d)}}function bu(n){return Ma(n)}function Ly(n,e){const t=String((n==null?void 0:n.name)??""),i=String((e==null?void 0:e.name)??"");return Number((n==null?void 0:n.order)??0)-Number((e==null?void 0:e.order)??0)||t.localeCompare(i)||String((n==null?void 0:n.id)??"").localeCompare(String((e==null?void 0:e.id)??""))}function xu(n=[],e=null){const t=e===Fn||e===fi?e:null,i=Array.isArray(n)?n:[];return(t?[t]:[Fn,fi]).flatMap(s=>i.filter(o=>o.group===s).sort(Ly))}function zy(n=[],e=null){return xu(n,e)}function qs(n=[],e=null){return[...xu(n,e)].reverse()}function ww(n,e=0){const t=Math.max(0,Math.floor(Number(n)||0));return Math.max(0,Math.floor(Number(e)||0))+t}function Sa(n){const e=zy(n);let t=0,i=0;for(const r of e){if(r.group===Fn){r.order=t,t+=1;continue}r.order=i,i+=1}n.splice(0,n.length,...e)}function Oy(n={}){const e={};return typeof n.name=="string"&&(e.name=n.name.trim()),(n.group===Fn||n.group===fi)&&(e.group=n.group),Te(n.order)&&(e.order=Math.max(0,Math.floor(n.order))),typeof n.previewVisible=="boolean"&&(e.previewVisible=n.previewVisible),typeof n.exportEnabled=="boolean"&&(e.exportEnabled=n.exportEnabled),Te(n.opacity)&&(e.opacity=fu(n.opacity,1)),Te(n.scalePct)&&n.scalePct>0&&(e.scalePct=wa(n.scalePct,.1,1e5)),Te(n.rotationDeg)&&(e.rotationDeg=n.rotationDeg),n.offsetPx&&typeof n.offsetPx=="object"&&(e.offsetPx=bt(n.offsetPx)),n.anchor&&typeof n.anchor=="object"&&(e.anchor=It(n.anchor)),e}function By(n={}){return Object.fromEntries(Object.entries(n).filter(([e])=>String(e??"").trim()).map(([e,t])=>[e,Oy(t)]))}function ss(n=null){const{id:e,name:t=ai,baseRenderBox:i=et,items:r=[]}=n??{},s=r.map(o=>Ma(o)).filter(o=>o.assetId);return Sa(s),{id:e??(t===ai?gi:Py()),name:String(t??"").trim()||ai,baseRenderBox:Ht(i,et),items:s}}function $a(n){return ss({...n,items:((n==null?void 0:n.items)??[]).map(bu)})}function os(n=null){const{activeItemId:e=null,renderBoxCorrection:t={x:0,y:0},items:i={}}=n??{};return{activeItemId:typeof e=="string"&&e?e:null,renderBoxCorrection:bt(t),items:By(i)}}function jy(n){return os(n)}function ka(n=null){const{presetId:e=null,overridesByPresetId:t={}}=n??{},i=Object.fromEntries(Object.entries(t??{}).filter(([r])=>String(r??"").trim()).map(([r,s])=>[r,os(s)]));return{presetId:typeof e=="string"&&e?e:null,overridesByPresetId:i}}function Vy(n){return ka(n)}function Uy(){return{version:mu,activePresetId:gi,assets:[],presets:[ss()]}}function Hy(n){const e=n.find(t=>t.id===gi)??null;if(e){e.name=ai;return}n.unshift(ss({id:gi,name:ai}))}function Ea(n={}){const e=(Array.isArray(n==null?void 0:n.assets)?n.assets:[]).map(s=>Dy({id:s==null?void 0:s.id,label:s==null?void 0:s.label,source:(s==null?void 0:s.source)??null,sourceMeta:s==null?void 0:s.sourceMeta})).filter(s=>s.sourceMeta),t=new Set(e.map(s=>s.id)),i=(Array.isArray(n==null?void 0:n.presets)?n.presets:[]).map(s=>$a(s)).filter(Boolean);i.length===0&&i.push(ss()),Hy(i);for(const s of i)s.items=s.items.filter(o=>t.has(o.assetId)),Sa(s.items);const r=typeof(n==null?void 0:n.activePresetId)=="string"&&i.some(s=>s.id===n.activePresetId)?n.activePresetId:i[0].id;return{version:Te(n==null?void 0:n.version)&&n.version>0?Math.floor(n.version):mu,activePresetId:r,assets:e,presets:i}}function Mw(n){const e=Ea(n);return{version:e.version,activePresetId:e.activePresetId,assets:e.assets.map(_u),presets:e.presets.map($a)}}function Sw(n=null,{availablePresetIds:e=[]}={}){const t=ka(n),i=new Set(e),r=Object.fromEntries(Object.entries(t.overridesByPresetId).filter(([s])=>i.size>0?i.has(s):!0));return{presetId:t.presetId&&i.has(t.presetId)?t.presetId:null,overridesByPresetId:r}}function vu(n,e=null){const t=Ea(n),i=typeof e=="string"&&e?e:t.activePresetId;return t.presets.find(r=>r.id===i)??t.presets[0]??null}function wu(n,e=null){const t=vu(n,(e==null?void 0:e.presetId)??gi);return(t==null?void 0:t.id)??null}function Gy(n,e=null,t=null){var r;const i=t??wu(n,e);return i?jy(((r=e==null?void 0:e.overridesByPresetId)==null?void 0:r[i])??null):os()}function $w(n,e,t,i,r,s){const o=It(e),a=Ht(t,et),c=Ht(i,a),l=It(r,gu("center")),u=bt(s),h=bt(n),d=(o.ax-l.ax)*(c.w-a.w),p=(o.ay-l.ay)*(c.h-a.h);return{x:h.x+d+u.x,y:h.y+p+u.y}}function kw(n,e,t,i,r,s){const o=It(e),a=Ht(t,et),c=Ht(i,a),l=It(r,gu("center")),u=bt(s),h=bt(n),d=(o.ax-l.ax)*(c.w-a.w),p=(o.ay-l.ay)*(c.h-a.h);return{x:h.x-d-u.x,y:h.y-p-u.y}}function Ew(n,e=null){const t=vu(n,wu(n,e));if(!t)return{preset:null,override:os(),items:[],assetsById:new Map};const i=Ea(n),r=new Map(i.assets.map(a=>[a.id,_u(a)])),s=Gy(i,e,t.id),o=t.items.map(a=>{var u;const c=((u=s.items)==null?void 0:u[a.id])??null,l={...bu(a),...c,offsetPx:c!=null&&c.offsetPx?bt(c.offsetPx,a.offsetPx):bt(a.offsetPx),anchor:c!=null&&c.anchor?It(c.anchor,a.anchor):It(a.anchor)};return Ma(l)}).filter(a=>r.has(a.assetId));return Sa(o),{preset:$a(t),override:s,items:o,assetsById:r}}const Wy="single",Mu="shot-camera-",Su="frame-",Xy="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),$u=64,ku=.5,Eu=.5,Tu=1,Au=80,Cu="all",Yy=ou,qy=au,Zy=Xt,Ta="camera",Tw="viewport",Fu="perspective";function Jy(){return[{id:"pane-main",role:Ta,viewportPreset:Fu,projection:"perspective",shotCameraBinding:"active"}]}function Pu(n){return`${Mu}${n}`}function Gr(n){return`${Su}${n}`}function Aw(n){return Xy[Math.max(n-1,0)]??`${n}`}function Ky(n,e="FRAME A"){const t=Array.from(String(n??"")).map(r=>{const s=r.codePointAt(0)??0;return s<32||s===127?" ":r}).join("").replace(/\s+/g," ").trim();return Array.from(t).slice(0,$u).join("")||e}function Aa(n,e){const t=Array.isArray(n)?n.map(s=>s==null?void 0:s.id).filter(s=>typeof s=="string"&&s.length>0):[],i=new Set(t),r=[];for(const s of e??[])typeof s!="string"||!i.has(s)||r.includes(s)||r.push(s);return r.length>0?r:t}function Ca(n,e){return e==="selected"||e==="all"?e:n==="selected"||n==="all"?n:Cu}function Cw({mode:n,preferredMode:e,hasRememberedSelection:t=!1}){if(n==="selected"||n==="all")return"off";const i=Ca(n,e);return i==="selected"&&!t?"all":i}function Fw(n){let e=0;for(const t of n){const i=new RegExp(`^${Mu}(\\d+)$`).exec(t.id);i&&(e=Math.max(e,Number(i[1])||0))}return e+1}function Pw(n){let e=0;for(const t of n){const i=new RegExp(`^${Su}(\\d+)$`).exec(t.id);i&&(e=Math.max(e,Number(i[1])||0))}return e+1}function Ru(n){return{...n,anchor:n.anchor&&typeof n.anchor=="object"?{...n.anchor}:n.anchor}}function Qy(n){return Number.isFinite(n.x)&&Number.isFinite(n.width)?n.x+n.width*.5:Number.isFinite(n.x)?n.x:ku}function e0(n){return Number.isFinite(n.y)&&Number.isFinite(n.height)?n.y+n.height*.5:Number.isFinite(n.y)?n.y:Eu}function t0(n){if(Number.isFinite(n.scale)&&n.scale>0)return n.scale;const e=Number.isFinite(n.width)?n.width*et.width/Ke.width:Number.NaN,t=Number.isFinite(n.height)?n.height*et.height/Ke.height:Number.NaN,i=[e,t].filter(r=>Number.isFinite(r)&&r>0);return i.length===0?Tu:i.reduce((r,s)=>r+s,0)/i.length}function yc(n,e){const t=Number(n);return Number.isFinite(t)?Math.min(1,Math.max(0,t)):e}function n0(n,e,t){if(typeof n=="string"){const i=rt[n];if(i)return{...i}}return n&&typeof n=="object"?{x:yc(n.x,e),y:yc(n.y,t)}:{x:e,y:t}}function Iu({id:n,name:e,source:t}={}){const i=t?Ru(t):{x:ku,y:Eu,scale:Tu,rotation:0,order:0},r=Qy(i),s=e0(i);return{...i,x:r,y:s,scale:t0(i),rotation:Number.isFinite(i.rotation)?i.rotation:0,anchor:n0(i.anchor,r,s),order:Number.isFinite(i.order)?i.order:0,id:n??i.id??Gr(1),name:Ky(e??i.name,"FRAME A")}}function Du(n=[]){return{mode:"off",preferredMode:Cu,opacityPct:Au,selectedIds:Aa(n,[]),shape:Yy,trajectoryMode:qy,trajectoryExportSource:Zy,trajectory:{nodesByFrameId:{}}}}function Nu(n,e){return{mode:(n==null?void 0:n.mode)==="selected"||(n==null?void 0:n.mode)==="all"?n.mode:"off",preferredMode:Ca(n==null?void 0:n.mode,n==null?void 0:n.preferredMode),opacityPct:Number.isFinite(n==null?void 0:n.opacityPct)?Math.min(100,Math.max(0,Math.round(n.opacityPct))):Au,selectedIds:Aa(e,n==null?void 0:n.selectedIds),shape:ma(n==null?void 0:n.shape),trajectoryMode:fa(n==null?void 0:n.trajectoryMode),trajectoryExportSource:Ln(n==null?void 0:n.trajectoryExportSource),trajectory:{nodesByFrameId:fy(e,n==null?void 0:n.trajectory)}}}function i0(){return[Iu({id:Gr(1),name:"FRAME A"})]}function r0({id:n,name:e,source:t}={}){var o;const i=t?d0(t):{lens:{baseFovX:su},clipping:{mode:"auto",near:bo,far:xo},outputFrame:{widthScale:1,heightScale:1,viewZoom:1,viewZoomAuto:!0,viewportCenterAuto:!0,anchor:"center",centerX:.5,centerY:.5,viewportCenterX:.5,viewportCenterY:.5,fitScale:0,fitViewportWidth:0,fitViewportHeight:0},exportSettings:{exportName:"cf-%cam",exportFormat:"psd",exportGridOverlay:!0,exportGridLayerMode:"bottom",exportModelLayers:!0,exportSplatLayers:!0},navigation:{rollLock:!1},referenceImages:ka(),frames:i0(),activeFrameId:Gr(1)},r=(i.frames??[]).slice(0,jr).map((a,c)=>Iu({id:(a==null?void 0:a.id)??Gr(c+1),name:a==null?void 0:a.name,source:a})),s=Du(r);return{...i,id:n??i.id??Pu(1),name:e??i.name??"Camera 1",frameMask:{...s,...Nu(i.frameMask,r)},frames:r,activeFrameId:i.activeFrameId??((o=r[0])==null?void 0:o.id)??null}}function s0(){return[r0({id:Pu(1),name:"Camera 1"})]}function o0(n,e){return n.find(t=>t.id===e)??null}function a0(n,e){return o0(n,e)??n[0]??{id:"pane-fallback",role:Ta,viewportPreset:Fu,projection:"perspective",shotCameraBinding:"active"}}function l0(n,e){return n.find(t=>t.id===e)??null}function c0(n,e){return l0(n,e)??n[0]??null}function h0(n,e){return n.find(t=>t.id===e)??null}function u0(n,e){return h0(n,e)??n[0]??null}function d0(n){var i,r,s,o,a,c,l,u,h,d,p,m,f,g,y,_,M,x;const e=(n.frames??[]).slice(0,jr).map(Ru),t=Nu(n.frameMask,e);return{...n,lens:{...n.lens},clipping:{...n.clipping},outputFrame:{...n.outputFrame,centerX:Number.isFinite((i=n.outputFrame)==null?void 0:i.centerX)?n.outputFrame.centerX:.5,centerY:Number.isFinite((r=n.outputFrame)==null?void 0:r.centerY)?n.outputFrame.centerY:.5,viewportCenterX:Number.isFinite((s=n.outputFrame)==null?void 0:s.viewportCenterX)?n.outputFrame.viewportCenterX:.5,viewportCenterY:Number.isFinite((o=n.outputFrame)==null?void 0:o.viewportCenterY)?n.outputFrame.viewportCenterY:.5,fitScale:Number.isFinite((a=n.outputFrame)==null?void 0:a.fitScale)&&n.outputFrame.fitScale>0?n.outputFrame.fitScale:0,fitViewportWidth:Number.isFinite((c=n.outputFrame)==null?void 0:c.fitViewportWidth)?n.outputFrame.fitViewportWidth:0,fitViewportHeight:Number.isFinite((l=n.outputFrame)==null?void 0:l.fitViewportHeight)?n.outputFrame.fitViewportHeight:0,viewZoomAuto:((u=n.outputFrame)==null?void 0:u.viewZoomAuto)!==!1,viewportCenterAuto:((h=n.outputFrame)==null?void 0:h.viewportCenterAuto)!==!1},exportSettings:{exportName:((d=n.exportSettings)==null?void 0:d.exportName)??"",exportFormat:((p=n.exportSettings)==null?void 0:p.exportFormat)??"psd",exportGridOverlay:!!((m=n.exportSettings)!=null&&m.exportGridOverlay),exportGridLayerMode:((f=n.exportSettings)==null?void 0:f.exportGridLayerMode)==="overlay"?"overlay":"bottom",exportModelLayers:!!((g=n.exportSettings)!=null&&g.exportModelLayers),exportSplatLayers:((y=n.exportSettings)==null?void 0:y.exportSplatLayers)??!0},frameMask:{...Du(e),...t,trajectory:{nodesByFrameId:uy((_=t.trajectory)==null?void 0:_.nodesByFrameId)}},navigation:{rollLock:!!((M=n.navigation)!=null&&M.rollLock)},referenceImages:Vy(n.referenceImages),frames:e,activeFrameId:n.activeFrameId??((x=e[0])==null?void 0:x.id)??null}}function p0(n){return`mode.${(n==null?void 0:n.role)??Ta}`}function Rw(n,e){return n.map((t,i)=>i===0?{...t,role:e}:t)}const Co="ja",m0=[{value:"ja",labelKey:"localeName.ja"},{value:"en",labelKey:"localeName.en"}];function _c(n){const e=String(n??"").trim().toLowerCase();if(!e)return null;const t=e.split(/[-_]/)[0];return m0.some(i=>i.value===t)?t:null}function f0({search:n=(i=>(i=globalThis.location)==null?void 0:i.search)()??"",navigatorLanguages:e=(r=>(r=globalThis.navigator)==null?void 0:r.languages)()??[],navigatorLanguage:t=(s=>(s=globalThis.navigator)==null?void 0:s.language)()??""}={}){const o=new URLSearchParams(n),a=_c(o.get("lang")??o.get("locale"));if(a)return a;for(const c of[...e,t]){const l=_c(c);if(l)return l}return Co}const Zs={ja:{app:{previewTag:"Spark 2.0",panelCopy:"Spark 2.0 を基盤にした CAMERA_FRAMES のワークフロー。"},field:{language:"Language",remoteUrl:"リモート URL",activeShotCamera:"カメラ",shotCameraName:"カメラ名",shotCameraFov:"標準FRAME水平FOV",shotCameraEquivalentMm:"フルサイズ焦点距離",viewportFov:"ビューポート水平FOV",viewportEquivalentMm:"ビューポート フルサイズ焦点距離",shotCameraClipMode:"クリップ範囲",shotCameraNear:"Near",shotCameraFar:"Far",shotCameraYaw:"Yaw",shotCameraPitch:"Pitch",shotCameraRoll:"Roll",shotCameraRollLock:"ロールを固定",shotCameraMoveHorizontal:"左右",shotCameraMoveVertical:"上下",shotCameraMoveDepth:"前後",shotCameraExportName:"書き出し名",exportFormat:"書き出し形式",exportGridOverlay:"ガイドを含める",exportReferenceImages:"下絵を含める",exportGridLayerMode:"グリッド重ね順",exportModelLayers:"GLB をレイヤー化",exportSplatLayers:"3DGS をレイヤー化",outputFrameWidth:"用紙サイズ 幅",outputFrameHeight:"用紙サイズ 高",cameraViewZoom:"表示ズーム",anchor:"用紙サイズ変更基準点",assetScale:"スケール",assetPosition:"位置",assetRotation:"回転",transformSpace:"座標系",transformMode:"ツール",activeFrame:"FRAME",frameMaskOpacity:"マスク不透明度",frameMaskShape:"マスク形状",frameTrajectoryMode:"軌道補間",frameTrajectoryNodeMode:"軌道ノード",frameTrajectoryExportSource:"FRAME軌道出力",exportTarget:"書き出し対象",exportPresetSelection:"選択カメラ",referenceImageOpacity:"不透明度",referenceImageScale:"拡縮",referencePresetName:"プリセット名",referenceImageOffsetX:"位置 X",referenceImageOffsetY:"位置 Y",referenceImageRotation:"回転",referenceImageOrder:"順番",referenceImageGroup:"前後",measurementLength:"測定距離",lightIntensity:"ライト強度",lightAmbient:"アンビエント",lightDirection:"ライト方向",lightAzimuth:"方位",lightElevation:"仰角",positionX:"X",positionY:"Y",positionZ:"Z"},section:{file:"ファイル",view:"ビューポート画角",displayZoom:"表示ズーム",scene:"シーン",sceneManager:"シーンマネージャー",selectedSceneObject:"オブジェクトプロパティ",lighting:"照明",tools:"ツール",project:"プロジェクト",shotCamera:"カメラ",shotCameraManager:"カメラ一覧",shotCameraProperties:"カメラプロパティ",transformSpace:"座標系",pose:"Pose",referenceImages:"下絵",referencePresets:"下絵プリセット",referenceManager:"下絵マネージャー",referenceProperties:"下絵プロパティ",frames:"FRAME",mask:"マスク",outputFrame:"用紙設定",output:"出力",export:"書き出し",exportSettings:"書き出し設定"},menu:{newProjectAction:"新規プロジェクト",saveWorkingStateAction:"プロジェクトを保存",savePackageAction:"プロジェクトを書き出し"},project:{untitled:"無題",dirtyHint:"作業状態に未保存の変更があります",packageHint:"共有・持ち出しには .ssproj 保存が必要です"},mode:{viewport:"ビューポート",camera:"カメラビュー"},transformSpace:{world:"ワールド",local:"ローカル"},transformMode:{none:"なし",select:"選択",reference:"下絵",transform:"変形",pivot:"オブジェクト原点"},selection:{multipleSceneAssetsTitle:"{count}件の3Dオブジェクト",multipleReferenceImagesTitle:"{count}件の下絵"},viewportTool:{moveCenter:"移動"},exportTarget:{current:"現在の Camera",all:"すべての Camera",selected:"選択した Camera"},exportFormat:{png:"PNG",psd:"PSD"},gridLayerMode:{bottom:"最下層",overlay:"アイレベルの下"},frameMaskShape:{bounds:"外接矩形",trajectory:"軌道スイープ"},frameTrajectoryMode:{line:"直線",spline:"スプライン"},frameTrajectoryNodeMode:{auto:"自動",corner:"コーナー",mirrored:"対称",free:"フリー"},trajectorySource:{none:"なし",center:"中心",topLeft:"左上",topRight:"右上",bottomRight:"右下",bottomLeft:"左下"},clipMode:{auto:"自動",manual:"手動"},action:{newProject:"新規プロジェクト",saveProject:"プロジェクトを保存",exportProject:"プロジェクトを書き出し",savePackageAs:"別名で保存",overwritePackage:"上書き保存",openFiles:"開く...",resetFrameTrajectoryNodeAuto:"ノードを自動に戻す",openReferenceImages:"下絵を開く",duplicateReferencePreset:"プリセットを複製",deleteReferencePreset:"プリセットを削除",clear:"クリア",loadUrl:"URLを読み込む",collapseWorkbench:"パネルを最小化",expandWorkbench:"パネルを開く",cancel:"キャンセル",saveAndNewProject:"保存して新規",savePackageAndNewProject:"保存して新規",discardAndNewProject:"保存せず新規",saveAndOpenProject:"保存して開く",savePackageAndOpenProject:"保存して開く",discardAndOpenProject:"保存せず開く",close:"閉じる",continueSave:"保存する",continueLoad:"読み込む",showAsset:"表示",hideAsset:"非表示",showReferenceImages:"下絵を表示",hideReferenceImages:"下絵を非表示",showReferenceImage:"下絵を表示",hideReferenceImage:"下絵を非表示",showSelectedReferenceImages:"選択中の下絵を表示",hideSelectedReferenceImages:"選択中の下絵を非表示",clearSelection:"選択を解除",undo:"元に戻す",redo:"やり直す",duplicateSelectedSceneAssets:"選択中のオブジェクトを複製",deleteSelectedSceneAssets:"選択中のオブジェクトを削除",includeReferenceImageInExport:"書き出しに含める",excludeReferenceImageFromExport:"書き出しから外す",includeSelectedReferenceImagesInExport:"選択中の下絵を書き出しに含める",excludeSelectedReferenceImagesFromExport:"選択中の下絵を書き出しから外す",deleteSelectedReferenceImages:"選択中の下絵を削除",moveAssetUp:"上へ",moveAssetDown:"下へ",newShotCamera:"カメラを追加",duplicateShotCamera:"複製",deleteShotCamera:"削除",nudgeLeft:"← 左",nudgeRight:"右 →",nudgeUp:"↑ 上",nudgeDown:"下 ↓",nudgeForward:"前へ",nudgeBack:"後へ",viewportToShot:"Viewportの姿勢をCameraへ",shotToViewport:"Cameraの姿勢をViewportへ",resetActive:"現在のビューをリセット",refreshPreview:"プレビューを更新",downloadOutput:"書き出す",downloadPng:"PNGを書き出す",downloadPsd:"PSDを書き出す",resetScale:"1xに戻す",applyAssetTransform:"変形適用",resetPivot:"Pivotを戻す",resetLightDirection:"向きを戻す",adjustLens:"焦点距離調整",adjustRoll:"カメラロール",zoomTool:"ズーム",splatEditTool:"3DGS編集",splatEditOptimizeLod:"LoD 最適化",quickMenu:"クイックメニュー",pinQuickSection:"レールに追加",unpinQuickSection:"レールから外す",measureTool:"測定ツール",apply:"適用",frameTool:"フレームツール",measurementStartPoint:"測定始点",measurementEndPoint:"測定終点",measurementAxis:{x:"X 軸で伸ばす",y:"Y 軸で伸ばす",z:"Z 軸で伸ばす"},newFrame:"FRAME を追加",duplicateFrame:"複製",deleteFrame:"削除",renameFrame:"FRAME名を編集",toggleSelectedFrameMask:"選択中マスク",toggleAllFrameMask:"全体マスク",toggleFrameTrajectoryEdit:"軌道編集",enableFrameMask:"マスクを有効",disableFrameMask:"マスクを無効",fitOutputFrameToSafeArea:"表示をフィット"},unit:{millimeter:"millimeter",meter:"meter",percent:"percent",pixel:"pixel",degree:"degree"},tooltip:{fileMenu:"開く・保存・パッケージ保存などのプロジェクト操作です。",collapseWorkbench:"右パネルを最小化して、必要な時だけ呼び出します。",modeCamera:"ショットカメラで構図と下絵を確認します。",modeViewport:"作業用カメラでシーンを自由に見回します。",toolSelect:"3D オブジェクトの選択モードです。もう一度押すと解除します。",toolReference:"下絵の選択と変形モードです。Shift+R で切り替えます。R は下絵表示の一時切替です。もう一度押すと解除します。",toolSplatEdit:"選択中の 3DGS をスプラット単位で編集します。直方体選択、ブラシ選択、変形をここから切り替えます。Shift+E で切り替えます。",toolTransform:"3D オブジェクトの変形モードです。もう一度押すと解除します。",toolPivot:"3Dオブジェクトの変形原点を編集します。もう一度押すと解除します。",toolZoom:"カメラビューでは表示ズーム、ビューポートでは画角を調整します。もう一度押すと解除します。",measureTool:"画面上の 2 点間の距離を測り、その長さ比で選択中オブジェクトへ一様スケールを適用します。",frameTool:"FRAME の追加・複製・削除と、全体 / 選択中マスクの切替やマスク不透明度の調整を行います。",quickMenu:"ツールのクイックメニューを開きます。モバイルではここから使うのが安全です。",clearSelection:"3Dオブジェクト、下絵、FRAME の選択を解除して、アクティブツールを外します。",undo:"直前の操作を元に戻します。",redo:"元に戻した操作をやり直します。",referencePreviewSessionVisible:"下絵のプレビュー表示だけを一時的に切り替えます。保存済みの表示状態は変えません。R で切り替えます。",tabScene:"シーン、アセット、ライティングを管理します。",tabCamera:"ショットカメラと用紙設定を編集します。",tabReference:"下絵プリセットと下絵レイヤーを編集します。",tabExport:"書き出し設定と出力を管理します。",copyViewportPoseToShot:"Viewport の位置、向き、焦点距離を Camera へコピーします。クリップ範囲は変えません。",copyShotPoseToViewport:"Camera の位置と視線方向を Viewport へコピーします。ロール、焦点距離、クリップ範囲は変えません。",resetActiveView:"現在の Camera / Viewport の位置と向きをホーム位置へ戻します。",frameMaskSelected:"選択中の FRAME 群を囲む範囲の外側を暗くします。もう一度押すと解除します。",frameMaskAll:"すべての FRAME を囲む範囲の外側を暗くします。もう一度押すと解除します。",frameMaskShapeField:"外接矩形で囲うか、FRAME の並びに沿って矩形が通過した範囲を使うかを選びます。",frameTrajectoryModeField:"FRAME の中心を結ぶ軌道を直線でつなぐか、スプラインで滑らかにつなぐかを選びます。",frameTrajectoryNodeModeField:"選択中ノードの曲がり方を切り替えます。自動は周囲から補間、コーナーは角、対称は両ハンドル連動、フリーは個別調整です。",frameTrajectoryExportSourceField:"PSD の FRAME グループへ書き出す軌道レイヤーの基準点です。中心か四隅のどれを軌道として使うかを選べます。",toggleFrameTrajectoryEdit:"ビューポート上に軌道ノードとハンドルを表示して編集します。FRAME の移動・回転・拡縮はそのまま併用できます。",resetFrameTrajectoryNodeAuto:"選択中ノードの手動ハンドルを捨てて、自動補間の形へ戻します。",openQuickSection:"この項目だけをクイックパネルで開きます。もう一度押すと閉じます。",pinQuickSection:"この項目を右レールのショートカットに追加します。",unpinQuickSection:"この項目を右レールのショートカットから外します。",shotCameraEquivalentMmField:"フルサイズ換算の焦点距離です。数値を変えるとアクティブなショットカメラの画角が変わります。",outputFrameAnchorField:"用紙サイズを変える時に、どの基準点を固定してフレームを広げるかを選びます。",shotCameraExportName:"書き出しファイル名のテンプレートです。%cam は現在のカメラ名に置き換わります。",exportFormatField:"このカメラの書き出し形式を選びます。PNG は統合画像、PSD はレイヤー付きです。",exportGridOverlayField:"Infinite Grid と Eye Level を書き出しに含めます。",exportGridLayerModeField:"ガイドを出力画像の下に入れるか、上に重ねるかを選びます。",exportModelLayersField:"PSD 書き出し時に GLB モデルを個別レイヤー化します。",exportSplatLayersField:"PSD 書き出し時に 3DGS を個別レイヤー化します。GLB レイヤー化が前提です。",exportTargetField:"現在のカメラ、全カメラ、または選択したカメラだけを書き出します。",exportPresetSelectionField:"選択書き出しの対象に含めるカメラをここで選びます。",exportReferenceImagesField:"下絵を今回の書き出しに含めるかどうかを一時的に切り替えます。",downloadOutput:"現在の対象と各カメラの設定に従って PNG または PSD を書き出します。"},hint:{viewMode:"カメラビューでは ショットカメラ と出力フレームを確認します。ビューポートでは作業用カメラでシーンを操作します。",shotCameraList:"ショットカメラ はドキュメントとして保持します。追加は現在のビュー姿勢から、複製は現在の ショットカメラ 設定ごと作成します。",shotCameraClip:"自動では ショットカメラ ごとの Near を保持しつつ、Far をシーン境界から決めます。手動では Near/Far を ショットカメラ ごとに固定します。",shotCameraExport:"書き出し形式とガイド・レイヤー設定は ショットカメラ ごとに保持します。PSD の 3DGS レイヤー化は GLB レイヤー化が前提です。",outputFrame:"カメラビューでは off-axis projection を使い、出力フレーム内の構図を最終出力と一致させます。",sceneCalibration:"3DGS は raw 1x で入るので、必要に応じてワールドスケールを補正します。GLB も必要なら個別に調整できます。",sceneOrder:"一覧の順序は PSD のオブジェクトレイヤー順の基準です。表示の切替は viewport と export の両方に反映します。",lightDirection:"球体上のハンドルをドラッグして、いま見ているカメラ基準でライト方向を回します。",frames:"FRAME は Camera View 上の 2D overlay として扱います。いまは直接選択で移動・拡縮・回転・anchor 編集まで行えます。",framesEmpty:"まだ FRAME がありません。最初の FRAME を追加してください。",exportTargetSelection:"選択書き出しでは {count} 件の Camera が対象です。",referenceImagesEmpty:"まだ下絵がありません。PNG / JPG / WEBP / PSD を読み込んでください。"},drop:{title:"画面にファイルをドロップして開く",body:"3Dデータ（PLY / SPZ / SOG / SPLAT / GLB など）、プロジェクトパッケージ（.ssproj）、下絵（PNG / JPG / WEBP / PSD）を読み込めます。",controlsTitle:"カメラ操作",controlOrbit:"左ドラッグ: 見回す",controlPan:"右ドラッグ: 左右 / 上下に移動",controlDolly:"ホイール: 前進 / 後退",controlAnchorOrbit:"Ctrl + 左ドラッグ: 指した位置を中心に回転"},badge:{horizontalFov:"水平FOV",clipRange:"clip"},export:{idle:"待機",rendering:"レンダリング中",ready:"準備完了",exporting:"書き出し中"},overlay:{newProjectTitle:"新規プロジェクト",newProjectMessage:"保存していない変更があります。作業状態を保存してから新しいプロジェクトを開始しますか？",newProjectMessageWithPackage:"保存していない変更があります。新しいプロジェクトを始める前に保存しますか？",openProjectTitle:"別のプロジェクトを開く",openProjectMessage:"保存していない変更があります。作業状態を保存してから別のプロジェクトを開きますか？",openProjectMessageWithPackage:"保存していない変更があります。別のプロジェクトを開く前に保存しますか？",workingSaveNoticeTitle:"プロジェクトを保存",workingSaveNoticeMessage:"Ctrl+S はこのブラウザ内にプロジェクトの作業状態を保存します。他の環境へ持ち出したり共有したりする時は「プロジェクトを書き出し」を使ってください。",startupImportTitle:"共有データを読み込みますか？",startupImportMessage:"このリンクは外部の共有データを読み込みます。読み込みを続けると、下の URL へアクセスします。",importTitle:"3D データを読み込み中",importMessage:"読み込み中です。シーンに反映するまで少し待ってください。",importPhaseVerify:"読み込み対象を確認",importPhaseExpand:"パッケージを展開",importPhaseLoad:"3D アセットを読込",importPhaseApply:"シーンへ反映",importDetailOpenProjectArchive:"プロジェクトパッケージを開いています…",importDetailInspectProjectArchive:"プロジェクトパッケージを確認中…",importDetailReadProjectManifest:"manifest を読込中… ({file})",importDetailReadProjectDocument:"プロジェクト設定を読込中… ({file})",importDetailScanProjectAssets:"展開する project asset を確認中… ({count}件)",importDetailExpandProjectAsset:"{index}/{count} プロジェクト asset を展開: {name}",importDetailExpandProjectAssetWithFile:"{index}/{count} プロジェクト asset を展開: {name} ({file})",importDetailExtractProjectAssetData:"{index}/{count} プロジェクト asset の内容を展開中: {stage} ({fileCount}ファイル)",importDetailExpandProjectAssetComplete:"{index}/{count} プロジェクト asset の展開完了",importDetailExtractReferenceImage:"{index}/{count} reference image を展開中: {name}",importDetailExpandComplete:"パッケージの展開が完了しました。",importProjectAssetExtractStage:{file:"埋め込みファイル",packedSplat:"3DGS manifest / companion files",rawSplat:"raw 3DGS arrays / LoD arrays"},importDetailExpandPackage:"{index}/{count} パッケージ: {name}",importDetailLoadAsset:"{index}/{count} アセット: {name}",importDetailApply:"Camera / FRAME / シーン状態を反映",blockedStartupTitle:"共有リンクを読み込めません",blockedStartupMessage:"このリンクはアプリから直接開けませんでした。",blockedStartupReasonHttps:"HTTPS ではないため拒否しました",blockedStartupReasonPrivate:"private address / localhost のため拒否しました",blockedStartupReasonInvalid:"URL として解釈できませんでした",importErrorTitle:"読み込みに失敗しました",importErrorMessageGeneric:"このデータは読み込めませんでした。",importErrorMessageRemote:"このリンクはアプリから直接開けませんでした。",errorDetails:"詳細",packageSaveTitle:"プロジェクトを書き出し",packageSaveMessage:"共有や他の環境への持ち出し用に、プロジェクトを .ssproj として書き出します。",packageSaveMessageWithOverwrite:"共有や他の環境への持ち出し用に、プロジェクトを .ssproj として書き出します。現在のファイル {name} に上書き保存するか、別名で保存するかを選んでください。",exportTitle:"書き出し中",exportMessage:"書き出しが終わるまで少し待ってください。完了するまで他の操作は無効です。",exportDetailSingle:"{camera} を {format} で書き出し中…",exportDetailBatch:"{index}/{count} {camera} を {format} で書き出し中…",exportPhasePrepare:"準備",exportPhaseBeauty:"レンダリング",exportPhaseGuides:"ガイド",exportPhaseMasks:"マスク",exportPhasePsdBase:"PSDベース",exportPhaseModelLayers:"GLBレイヤー",exportPhaseSplatLayers:"3DGSレイヤー",exportPhaseReferenceImages:"下絵",exportPhaseWrite:"書き出し",exportPhaseDetailPrepare:"カメラと出力設定を切り替えています…",exportPhaseDetailBeauty:"最終レンダリングを取得しています…",exportPhaseDetailGuides:"ガイド描画を準備しています…",exportPhaseDetailGuidesGrid:"Infinite Grid を書き出し用に描画しています…",exportPhaseDetailGuidesEyeLevel:"Eye Level を書き出し用に描画しています…",exportPhaseDetailMasks:"マスクを構築しています…",exportPhaseDetailMaskBatch:"{index}/{count} {name} のマスクを作成中…",exportPhaseDetailPsdBase:"PSD のベース画像を構築しています…",exportPhaseDetailModelLayers:"GLB レイヤーを準備しています…",exportPhaseDetailModelLayersBatch:"{index}/{count} {name} の GLB レイヤーを構築中…",exportPhaseDetailSplatLayers:"3DGS レイヤーを準備しています…",exportPhaseDetailSplatLayersBatch:"{index}/{count} {name} の 3DGS レイヤーを構築中…",exportPhaseDetailReferenceImages:"下絵レイヤーを合成しています…",exportPhaseDetailReferenceImagesBatch:"{index}/{count} {name} の下絵を配置中…",exportPhaseDetailWritePng:"PNG ファイルを書き出しています…",exportPhaseDetailWritePsd:"PSD ドキュメントを書き出しています…",exportErrorTitle:"書き出しに失敗しました",exportErrorMessage:"書き出し中にエラーが発生しました。詳細を確認してください。",packageSaveErrorTitle:"プロジェクトの書き出しに失敗しました",packageSaveErrorMessage:"プロジェクトの書き出し中にエラーが発生しました。詳細を確認してください。",packagePhaseCollect:"状態を収集",packagePhaseResolve:"asset を解決",packagePhaseCompress:"3DGS を圧縮",packagePhaseWrite:"パッケージを書き込み",packageDetailCollect:"保存対象を収集中…",packageDetailAsset:"{index}/{total} asset: {name}",packageDetailAssetWithFile:"{index}/{total} asset: {name} ({file})",packageDetailWrite:"ファイルを書き込み中…",packageWriteStage:{zipEntries:"ZIPアーカイブを書き込み中…"},packageResolveStage:{"copy-source":"元の asset を収集中…","copy-packed-splat":"packed 3DGS を収集中…"},packageCompressStage:{"read-input":"入力データを読み込み中…","start-worker":"圧縮ワーカーを起動中…","retry-cpu-worker":"worker が停止したため CPU worker に切替…","load-transform":"SplatTransform を読み込み中…","decode-input":"3DGS を展開中…","merge-tables":"複数テーブルを結合中…","filter-bands":"SH バンドを調整中…","write-sog":"SOG を書き出し中…",finalize:"出力を確定中…"},packageFieldCompressSplats:"3DGS を SOG 圧縮で保存",packageFieldCompressSplatsDisabled:"3DGS を SOG 圧縮で保存 (WebGPU 必須)",packageFieldCompressSplatsWorkerUnavailable:"3DGS を SOG 圧縮で保存 (この環境では利用不可)",packageFieldSogShBands:"SOG の SH バンド",packageFieldSogIterations:"SOG 圧縮 iterations",packageSogShBands:{0:"0 bands",1:"1 band",2:"2 bands",3:"3 bands"},packageSogIterations:{4:"4 iterations",8:"8 iterations",10:"10 iterations",12:"12 iterations",16:"16 iterations"},packageFieldSaveMode:"保存モード",packageSaveMode:{fast:"Fast — 素早く保存",fastHint:"ファイルを小さく保ち、保存は瞬時。描画用の LoD は次回ロード時にバックグラウンドで自動構築されます。",quality:"Quality — 最適化して保存",qualityHint:"LoD を事前計算して保存します。次回読込みから即座に最適化された描画が得られますが、保存に数十秒かかります。",qualityHintPreserve:"既に Quality で焼込み済み。このまま維持して保存します（再計算なし）。",qualityHintUpgrade:"Quick で焼込み済みのデータを Quality に再計算して保存します。"},packageAdvancedOptions:"詳細オプション",packageFieldSogCompress:"未編集 3DGS を SOG 圧縮でさらに小さく保存",packageFieldSogCompressDisabled:"未編集 3DGS を SOG 圧縮（この環境/シーンでは利用不可）",packageBakeLodStage:{start:"LoD を事前計算中…",asset:"{name} の LoD を計算中（{index}/{total}）…",finalize:"LoD データを確定中…"},packagePhaseBakeLod:"LoD を事前計算",packageDetailBakeLod:"{name} の LoD を計算中（{index}/{total}）…"},exportSummary:{empty:"現在の Camera 設定で書き出します。",refreshed:"プレビューを {width} × {height} で更新しました。",exported:"PNG を {width} × {height} で書き出しました。",exportedBatch:"PNG を {count} 件書き出しました。",psdExported:"PSD を {count} 件書き出しました。",exportedMixed:"{count} 件を書き出しました。"},status:{ready:"準備完了。",projectSaving:"プロジェクトを保存中...",projectSavingToFolder:"{name} にプロジェクトを保存中...",projectLoaded:"プロジェクトを読み込みました。",projectLoadedFromFolder:"{name} からプロジェクトを読み込みました。",projectSaved:"プロジェクトを保存しました。",projectSavedToFolder:"{name} にプロジェクトを保存しました。",workingStateSaved:"{name} を保存しました。",workingStateRestored:"{name} の作業状態を復元しました。",packageSaved:"{name} を書き出しました。",autoLodReady:"{name} の描画を LoD 最適化しました。",autoLodFailed:"{name} の LoD 最適化に失敗しました。通常描画のまま動作を続けます。",newProjectReady:"新規プロジェクトを開始しました。",projectExporting:"プロジェクトを書き出し中...",projectExported:"プロジェクトを書き出しました。",viewportEnabled:"ビューポートに切り替えました。",cameraEnabled:"カメラビューに切り替えました。",loadingItems:"{count} 件を読み込み中...",loadedItems:"{count} 件を読み込みました。",expandingProjectPackage:"{name} から 3D asset を展開中...",expandedProjectPackage:"{name} から {count} 件の 3D asset を展開しました。",enterUrl:"http(s) URL を 1 つ以上入力してください。",copiedViewportToShot:"ビューポート の姿勢を ショットカメラ にコピーしました。",copiedShotToViewport:"ショットカメラ の姿勢を ビューポート にコピーしました。",resetViewport:"ビューポートをリセットしました。",resetCamera:"ショットカメラ をリセットしました。",sceneCleared:"シーンをクリアしました。",exportPreviewUpdated:"出力プレビューを更新しました。",pngExported:"PNG を書き出しました。",pngExportedBatch:"PNG を {count} 件書き出しました。",psdExported:"PSD を {count} 件書き出しました。",exportedMixed:"{count} 件を書き出しました。",navigationActive:"FPV ナビゲーション有効。WASD/RF で移動、ドラッグで視線、右ドラッグでスライド。基本速度 {speed} m/s。",zoomToolEnabled:"ズームツール有効。カメラビュー上でドラッグして拡縮、Z か Esc で解除。",viewportZoomToolEnabled:"ビューポート画角調整。ドラッグでフルサイズ焦点距離を変更、Z か Esc で解除。",measurementEnabled:"測定ツール active。クリックで始点と終点を置き、M でもう一度押すと解除します。",measurementDisabled:"測定ツールを終了しました。",measurementScaleApplied:"測定値に合わせて選択中オブジェクトへ {scale}x のスケールを適用しました。",splatEditEnabled:"3DGS 編集モードを有効にしました。{count} 件の 3DGS を編集対象にします。",splatEditDisabled:"3DGS 編集モードを終了しました。",splatEditRequiresScope:"先に Scene で 3DGS を選択してください。",splatEditScopeSummary:"対象 {scope} 件の 3DGS / 選択 {selected} 個のスプラット",splatEditToolBox:"直方体",splatEditToolBrush:"ブラシ",splatEditToolTransform:"変形",splatEditPlaceBoxHint:"ビューをクリックして直方体を配置",splatEditBrushHint:"ドラッグで追加。Alt+ドラッグで除外。Ctrl+ドラッグで視点回転。",splatEditBrushMode:"深さモード",splatEditBrushModeThrough:"貫通",splatEditBrushModeDepth:"奥行き",splatEditBrushDepth:"奥行き",splatEditCenter:"中心",splatEditSize:"サイズ",splatEditScaleDown:"-10%",splatEditScaleUp:"+10%",splatEditFitScope:"対象に合わせる",splatEditAdd:"追加",splatEditSubtract:"除外",splatEditDelete:"削除",splatEditSeparate:"分離",splatEditDuplicate:"複製",splatEditSelectAll:"全選択",splatEditInvert:"反転",splatEditLodStale:"LoD 最適化",splatEditLodReady:"LoD 最適化済み",splatEditLodRunning:"LoD 最適化中…",splatEditLodTooltip:"描画用の LoD を再構築します。スプラット編集すると自動で無効になるため、適宜押して軽く保ちます。",splatEditTransformMove:"移動",splatEditTransformRotate:"回転",splatEditTransformScale:"均等スケール",splatEditTransformHint:"ギズモで移動・回転・均等スケールを操作します。",splatEditLastOperation:"直近: {mode} / {count} 個のスプラット",splatEditSelectionAdded:"{count} 個のスプラットを選択範囲に追加しました。",splatEditSelectionRemoved:"{count} 個のスプラットを選択範囲から外しました。",splatEditBrushHitMissing:"ブラシの当たり位置を取得できませんでした。",splatEditSelectionMissing:"先に 3DGS のスプラットを選択してください。",splatEditDeleted:"{count} 個のスプラットを削除しました。",splatEditSeparated:"{count} 個のスプラットを {assets} 件の 3DGS に分離しました。",splatEditDuplicated:"{count} 個のスプラットを {assets} 件の 3DGS に複製しました。",splatEditSelectAllDone:"{count} 個のスプラットを全選択しました。",splatEditInverted:"選択を反転しました（{count} 個のスプラット）。",splatEditTransformedMove:"{count} 個のスプラットを移動しました。",splatEditTransformedRotate:"{count} 個のスプラットを回転しました。",splatEditTransformedScale:"{count} 個のスプラットを均等スケールしました。",zoomToolUnavailable:"ズームツールはここでは使えません。",lensToolEnabled:"焦点距離調整。ドラッグで 35mm横幅換算を変更、Esc で解除。",rollToolEnabled:"カメラロール調整。左右ドラッグで構図を回し、Esc で解除。",rollToolUnavailable:"カメラロールは Camera View でのみ使えます。",localeChanged:"表示言語を {language} に切り替えました。",assetScaleUpdated:"{name} のワールドスケールを {scale} にしました。",assetTransformUpdated:"{name} のトランスフォームを更新しました。",assetTransformApplied:"{name} の変形を適用しました。",assetVisibilityUpdated:"{name} を {visibility} にしました。",duplicatedSceneAsset:"{name} を複製しました。",duplicatedSceneAssets:"{count} 件のオブジェクトを複製しました。",deletedSceneAsset:"{name} を削除しました。",deletedSceneAssets:"{count} 件のオブジェクトを削除しました。",assetOrderUpdated:"{name} の順序を {index} にしました。",selectedShotCamera:"ショットカメラ を {name} に切り替えました。",createdShotCamera:"Camera {name} を追加しました。",duplicatedShotCamera:"Camera {name} を複製しました。",deletedShotCamera:"Camera {name} を削除しました。",selectedFrame:"{name} を選択しました。",createdFrame:"{name} を追加しました。",duplicatedFrame:"{name} を複製しました。",duplicatedFrames:"{count} 個の FRAME を複製しました。",deletedFrame:"{name} を削除しました。",deletedFrames:"{count} 個の FRAME を削除しました。",shotCameraClipMode:"Camera のクリップ範囲を {mode} にしました。",shotCameraExportFormat:"Camera の書き出し形式を {format} にしました。",frameLimitReached:"FRAME は最大 {limit} 枚までです。",exportTargetChanged:"書き出し対象を {target} にしました。",exportPresetSelection:"選択書き出しの ショットカメラ を {count} 件にしました。"},backgroundTask:{autoLodRunningSingle:"LoD 最適化中… ({name})",autoLodRunningMulti:"LoD 最適化中… {current}/{total}",autoLodDone:"LoD 最適化完了",autoLodFailed:"LoD 最適化に失敗"},scene:{badgeEmpty:"空",summaryEmpty:"`.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.ssproj` をドロップまたは読み込みできます。",scaleDefault:"シーン契約: 1 unit = 1 meter。GLB は meters 前提、3DGS は raw 1x で読み込みます。",loaded:"{count} 件を読込: {badge}。",bounds:"境界 {x} × {y} × {z} m。",worldContract:"ワールド契約 1u = 1m。",glbMeter:"GLB は meter-native として扱います。",splatRaw:"3DGS は raw 1x で入るため、校正までは暫定スケールです。",splatCount:"3DGS {count}件",modelCount:"モデル {count}件",scaleAdjusted:"校正済みスケール {count}件。"},assetKind:{splat:"3DGS",model:"GLB / モデル"},assetVisibility:{visible:"表示",hidden:"非表示"},unitMode:{raw:"raw 1x",meters:"meters"},shotCamera:{defaultName:"Camera {index}"},frame:{defaultName:"FRAME {index}"},cameraSummary:{view:"ビュー",shot:"カメラ",pos:"位置",fwd:"前方",clip:"clip",nearFar:"near/far",base:"基準",frame:"フレーム",nav:"移動"},outputFrame:{meta:"{size} · {anchor}"},anchor:{"top-left":"左上","top-center":"上中央","top-right":"右上","middle-left":"左中央",center:"中央","middle-right":"右中央","bottom-left":"左下","bottom-center":"下中央","bottom-right":"右下"},error:{exportRequiresAsset:"出力プレビューの前に 3DGS かモデルを読み込んでください。",exportRequiresPreset:"書き出し対象の ショットカメラ を 1 つ以上選択してください。",projectPackageSaveUnsupported:"この環境ではパッケージ保存ダイアログを利用できません。",projectPackageSaveUnavailable:"パッケージの保存先を取得できませんでした。",sogCompressionRequiresWebGpu:"この環境では WebGPU が使えないため、SOG 圧縮保存は利用できません。",sogCompressionWorkerUnavailable:"SOG 圧縮 worker を開始できませんでした。SOG 圧縮をオフにして再度保存してください。",projectPackageOverwriteUnavailable:"上書き保存できるパッケージファイルがありません。",previewContext:"プレビュー用の 2D context を取得できませんでした。",unsupportedFileType:"未対応のファイル形式です: {name}",emptyProjectPackage:"{name} に読み込める 3D asset がありません。",emptyGltf:"GLTF scene が空です。",missingRoot:"CAMERA_FRAMES の root 要素が見つかりませんでした。"},referenceImage:{activePreset:"現在のプリセット",activePresetItems:"{count} 件",blankPreset:"(blank)",untitled:"名称未設定",sizeUnknown:"サイズ不明",currentPresetSection:"現在のプリセット",selectedSection:"選択中",selectedEmpty:"選択中の下絵がありません。",currentCameraEmpty:"このプリセットにはまだ 下絵アイテム がありません。下絵を読み込んでください。",currentCameraUsage:"この ショットカメラ に {count} 件",orderLabel:"#{order}",group:{back:"背面",front:"前面"},groupShort:{back:"背",front:"前"}},localeName:{ja:"日本語",en:"English"},mobileUiScale:{title:"UI 倍率（モバイル）",tooltip:"モバイル表示時の UI 倍率を調整します。設定は自動的に保存されます。",description:"モバイル UI のボタン・テキスト・メニューをまとめて拡大縮小します。画面下部のボタンも動きます。",currentLabel:"現在値",sliderLabel:"UI 倍率",autoRecommendation:"端末に合わせた推奨: {value}",resetToAuto:"推奨値に戻す",autoActiveBadge:"自動",previewLabel:"プレビュー",previewCopy:"スライダーを動かすと、ここと画面下部のボタンが一緒にサイズを変えます。押しやすい大きさに合わせてください。",previewPrimaryButton:"主ボタン",previewSecondaryButton:"副ボタン",previewFieldLabel:"入力欄",previewFieldValue:"入力サンプル"},viewportLodScale:{label:"プレビュー品質",ariaLabel:"3DGS プレビュー品質",tooltipTitle:"プレビュー品質",tooltipDescription:"3DGS が重いときにビューポート表示の軽さと細部の見やすさを調整します。下げると操作が軽くなり、上げると細かな形を確認しやすくなります。"}},en:{app:{previewTag:"Spark 2.0",panelCopy:"CAMERA_FRAMES workflow built on Spark 2.0."},field:{language:"Language",remoteUrl:"Remote URL",activeShotCamera:"Camera",shotCameraName:"Camera Name",shotCameraFov:"Standard FRAME H-FOV",shotCameraEquivalentMm:"Full-Frame Focal Length",viewportFov:"Viewport H-FOV",viewportEquivalentMm:"Viewport Full-Frame Focal Length",shotCameraClipMode:"Clip Range",shotCameraNear:"Near",shotCameraFar:"Far",shotCameraYaw:"Yaw",shotCameraPitch:"Pitch",shotCameraRoll:"Roll",shotCameraRollLock:"Lock Roll",shotCameraMoveHorizontal:"Left / Right",shotCameraMoveVertical:"Down / Up",shotCameraMoveDepth:"Back / Forward",shotCameraExportName:"Export Name",exportFormat:"Export Format",exportGridOverlay:"Include Guides",exportReferenceImages:"Include Reference Images",exportGridLayerMode:"Grid Layering",exportModelLayers:"Layer GLB Models",exportSplatLayers:"Layer 3DGS Objects",outputFrameWidth:"Paper Width",outputFrameHeight:"Paper Height",cameraViewZoom:"View Zoom",anchor:"Anchor",assetScale:"Scale",assetPosition:"Position",assetRotation:"Rotation",transformSpace:"Coordinate Space",transformMode:"Tool",activeFrame:"FRAME",frameMaskOpacity:"Mask Opacity",frameMaskShape:"Mask Shape",frameTrajectoryMode:"Trajectory",frameTrajectoryNodeMode:"Trajectory Node",frameTrajectoryExportSource:"FRAME Trajectory Output",exportTarget:"Export Target",exportPresetSelection:"Selected Cameras",referenceImageOpacity:"Opacity",referenceImageScale:"Scale",referencePresetName:"Preset Name",referenceImageOffsetX:"Offset X",referenceImageOffsetY:"Offset Y",referenceImageRotation:"Rotation",referenceImageOrder:"Order",referenceImageGroup:"Layer Side",measurementLength:"Measured Length",lightIntensity:"Light Intensity",lightAmbient:"Ambient",lightDirection:"Light Direction",lightAzimuth:"Azimuth",lightElevation:"Elevation",positionX:"X",positionY:"Y",positionZ:"Z"},section:{file:"File",view:"Viewport FOV",displayZoom:"Display Zoom",scene:"Scene",sceneManager:"Scene Manager",selectedSceneObject:"Object Properties",lighting:"Lighting",tools:"Tools",project:"Project",shotCamera:"Camera",shotCameraManager:"Cameras",shotCameraProperties:"Camera Properties",transformSpace:"Coordinate Space",pose:"Pose",referenceImages:"Reference Images",referencePresets:"Reference Presets",referenceManager:"Reference Manager",referenceProperties:"Reference Properties",frames:"FRAME",mask:"Mask",outputFrame:"Paper Setup",output:"Output",export:"Export",exportSettings:"Export Settings"},menu:{newProjectAction:"New Project",saveWorkingStateAction:"Save Project",savePackageAction:"Export Project"},project:{untitled:"Untitled",dirtyHint:"There are unsaved working-state changes",packageHint:"Save a .ssproj package before sharing or moving this project"},mode:{viewport:"Viewport",camera:"Camera View"},transformSpace:{world:"World",local:"Local"},transformMode:{none:"None",select:"Select",reference:"Reference",transform:"Transform",pivot:"Object Origin"},selection:{multipleSceneAssetsTitle:"{count} selected 3D objects",multipleReferenceImagesTitle:"{count} selected references"},viewportTool:{moveCenter:"Move"},exportTarget:{current:"Current Camera",all:"All Cameras",selected:"Selected Cameras"},exportFormat:{png:"PNG",psd:"PSD"},gridLayerMode:{bottom:"Bottom-most",overlay:"Below Eye Level"},frameMaskShape:{bounds:"Bounds",trajectory:"Trajectory Sweep"},frameTrajectoryMode:{line:"Line",spline:"Spline"},frameTrajectoryNodeMode:{auto:"Auto",corner:"Corner",mirrored:"Mirrored",free:"Free"},trajectorySource:{none:"None",center:"Center",topLeft:"Top Left",topRight:"Top Right",bottomRight:"Bottom Right",bottomLeft:"Bottom Left"},clipMode:{auto:"Auto",manual:"Manual"},action:{newProject:"New Project",saveProject:"Save Project",exportProject:"Export Project",savePackageAs:"Save As",overwritePackage:"Overwrite",openFiles:"Open…",resetFrameTrajectoryNodeAuto:"Reset Node to Auto",openReferenceImages:"Open Reference Images",duplicateReferencePreset:"Duplicate Preset",deleteReferencePreset:"Delete Preset",clear:"Clear",loadUrl:"Load URL",collapseWorkbench:"Minimize panel",expandWorkbench:"Open panel",cancel:"Cancel",saveAndNewProject:"Save and New",savePackageAndNewProject:"Save and New",discardAndNewProject:"Don't Save",saveAndOpenProject:"Save and Open",savePackageAndOpenProject:"Save and Open",discardAndOpenProject:"Don't Save",close:"Close",continueSave:"Save",continueLoad:"Load",showAsset:"Show",hideAsset:"Hide",showReferenceImages:"Show References",hideReferenceImages:"Hide References",showReferenceImage:"Show Reference",hideReferenceImage:"Hide Reference",showSelectedReferenceImages:"Show Selected References",hideSelectedReferenceImages:"Hide Selected References",clearSelection:"Clear Selection",undo:"Undo",redo:"Redo",duplicateSelectedSceneAssets:"Duplicate Selected Objects",includeReferenceImageInExport:"Include in Export",excludeReferenceImageFromExport:"Exclude from Export",includeSelectedReferenceImagesInExport:"Include Selected References in Export",excludeSelectedReferenceImagesFromExport:"Exclude Selected References from Export",deleteSelectedReferenceImages:"Delete Selected References",deleteSelectedSceneAssets:"Delete Selected Objects",moveAssetUp:"Up",moveAssetDown:"Down",newShotCamera:"Add Camera",duplicateShotCamera:"Duplicate",deleteShotCamera:"Delete",nudgeLeft:"← Left",nudgeRight:"Right →",nudgeUp:"↑ Up",nudgeDown:"Down ↓",nudgeForward:"Forward",nudgeBack:"Back",viewportToShot:"Copy Viewport Pose to Camera",shotToViewport:"Copy Camera Pose to Viewport",resetActive:"Reset Active View",refreshPreview:"Refresh Preview",downloadOutput:"Export",downloadPng:"Download PNG",downloadPsd:"Download PSD",resetScale:"Reset 1x",applyAssetTransform:"Apply Transform",resetPivot:"Reset Pivot",resetLightDirection:"Reset Direction",adjustLens:"Adjust Lens",adjustRoll:"Camera Roll",zoomTool:"Zoom",splatEditTool:"3DGS Edit",splatEditOptimizeLod:"Optimize LoD",quickMenu:"Quick Menu",pinQuickSection:"Add To Rail",unpinQuickSection:"Remove From Rail",measureTool:"Measure Tool",apply:"Apply",frameTool:"Frame Tool",measurementStartPoint:"Measurement start point",measurementEndPoint:"Measurement end point",measurementAxis:{x:"Extend along X",y:"Extend along Y",z:"Extend along Z"},newFrame:"Add FRAME",duplicateFrame:"Duplicate",deleteFrame:"Delete",renameFrame:"Rename FRAME",toggleSelectedFrameMask:"Selected Mask",toggleAllFrameMask:"All Frames Mask",toggleFrameTrajectoryEdit:"Edit Trajectory",enableFrameMask:"Enable Mask",disableFrameMask:"Disable Mask",fitOutputFrameToSafeArea:"Fit View"},unit:{millimeter:"ミリメートル",meter:"メートル",percent:"パーセント",pixel:"ピクセル",degree:"度"},tooltip:{fileMenu:"Open, save, and package-level project commands live here.",collapseWorkbench:"Minimize the right panel and bring it back only when needed.",modeCamera:"Use the shot camera to frame the scene and align references.",modeViewport:"Use the working camera to inspect and navigate the scene freely.",toolSelect:"Select 3D objects. Press again to return to no active tool.",toolReference:"Edit reference images. Toggle with Shift+R. R temporarily shows or hides references. Press again to return to no active tool.",toolSplatEdit:"Enter per-splat editing for the selected 3DGS assets. This is the entry point for Box and Brush tools. Toggle with Shift+E.",toolTransform:"Transform 3D objects. Press again to return to no active tool.",toolPivot:"Edit the transform origin of 3D objects. Press again to return to no active tool.",toolZoom:"In Camera View it adjusts display zoom; in Viewport it adjusts viewport lens. Press again to return to navigation.",measureTool:"Measure the distance between two points on screen and apply a matching uniform scale ratio to the selected objects.",frameTool:"Add, duplicate, or delete FRAMEs, and control all-frame or selected-frame masking plus mask opacity.",quickMenu:"Open the quick tool menu. On mobile, this is the safer way to use it.",clearSelection:"Clear selected 3D objects, reference images, and FRAMEs, then return to no active tool.",undo:"Undo the most recent change.",redo:"Redo the most recently undone change.",referencePreviewSessionVisible:"Temporarily show or hide reference previews without changing their saved visibility state. Toggle with R.",tabScene:"Manage scene assets and lighting.",tabCamera:"Edit the active shot camera and paper setup.",tabReference:"Edit reference presets and reference image layers.",tabExport:"Adjust export options and run output.",copyViewportPoseToShot:"Copy the Viewport position, orientation, and lens into the Camera. The clip range stays unchanged.",copyShotPoseToViewport:"Copy the Camera position and view direction into the Viewport. Roll, lens, and clip range stay unchanged.",resetActiveView:"Return the current Camera or Viewport position and orientation to the home pose.",frameMaskSelected:"Dim everything outside the bounding box of the selected FRAMEs. Press again to turn it off.",frameMaskAll:"Dim everything outside the bounding box covering all FRAMEs. Press again to turn it off.",frameMaskShapeField:"Choose whether the mask uses one combined bounding box or the swept area traced by the FRAME rectangles in order.",frameTrajectoryModeField:"Choose whether the trajectory connecting FRAME centers uses straight segments or an editable spline.",frameTrajectoryNodeModeField:"Choose how the selected spline node behaves. Auto derives handles, Corner makes a sharp turn, Mirrored links both handles, and Free edits them independently.",frameTrajectoryExportSourceField:"Choose which reference point is written as the PSD trajectory layer inside the FRAME group: center or one of the four corners.",toggleFrameTrajectoryEdit:"Show trajectory nodes and handles in the viewport for path editing while keeping normal FRAME transforms available.",resetFrameTrajectoryNodeAuto:"Discard manual handles on the selected node and return it to automatic smoothing.",openQuickSection:"Open only this section as a quick panel. Press again to close it.",pinQuickSection:"Add this section to the right rail shortcuts.",unpinQuickSection:"Remove this section from the right rail shortcuts.",shotCameraEquivalentMmField:"Full-frame-equivalent focal length. Changing it updates the active shot camera lens angle.",outputFrameAnchorField:"Choose which point stays fixed when the paper size changes.",shotCameraExportName:"Template for the exported filename. %cam is replaced with the current camera name.",exportFormatField:"Choose the export format for this camera. PNG is flattened; PSD keeps layers.",exportGridOverlayField:"Include Infinite Grid and Eye Level in the export.",exportGridLayerModeField:"Choose whether guide overlays render below or above the beauty image.",exportModelLayersField:"Write GLB models as separate PSD layers.",exportSplatLayersField:"Write 3DGS objects as separate PSD layers. GLB model layers must also be enabled.",exportTargetField:"Export only the current camera, every camera, or a selected subset.",exportPresetSelectionField:"Choose which cameras are included when Export Target is set to Selected.",exportReferenceImagesField:"Temporarily include or exclude reference images from this export run.",downloadOutput:"Export PNG or PSD files using the current target and per-camera export settings."},hint:{viewMode:"Camera View shows the Camera and Output Frame. Viewport uses a free working camera for scene editing.",shotCameraList:"Cameras are stored as document objects. New cameras start from the current view pose; duplicate copies the active camera settings.",shotCameraClip:"Auto keeps the per-Camera near clip and derives far from scene bounds. Manual stores both near and far per Camera.",shotCameraExport:"Export format, guide layering, and PSD layer settings are stored per Camera. 3DGS object layers in PSD require GLB layered export to be enabled.",outputFrame:"Camera View uses off-axis projection so framing inside the Output Frame matches final output.",sceneCalibration:"3DGS assets enter at raw 1x, so adjust world scale when needed. GLB assets can also be tuned per asset when necessary.",sceneOrder:"List order becomes the PSD object-layer order. Visibility affects both viewport and export.",lightDirection:"Drag the handle on the sphere to rotate the light direction relative to the camera you are currently viewing.",frames:"FRAME is treated as a 2D overlay in Camera View. This slice supports direct move, resize, rotate, and anchor editing.",framesEmpty:"No FRAME yet. Add the first FRAME to start laying out the shot.",exportTargetSelection:"Selected export currently includes {count} Camera preset(s).",referenceImagesEmpty:"No reference images yet. Load PNG, JPG, WEBP, or PSD files to begin."},drop:{title:"Drop files here",body:"Load 3D data (PLY / SPZ / SOG / SPLAT / GLB and more), project packages (.ssproj), or reference images (PNG / JPG / WEBP / PSD).",controlsTitle:"Camera Controls",controlOrbit:"Left drag: look around",controlPan:"Right drag: slide left / right / up / down",controlDolly:"Wheel: move forward / back",controlAnchorOrbit:"Ctrl + left drag: orbit around the pointed spot"},badge:{horizontalFov:"H-FOV",clipRange:"clip"},export:{idle:"Idle",rendering:"Rendering",ready:"Ready",exporting:"Exporting"},overlay:{newProjectTitle:"New Project",newProjectMessage:"You have unsaved changes. Save the working state before starting a new project?",newProjectMessageWithPackage:"You have unsaved changes. Save before starting a new project?",openProjectTitle:"Open Another Project",openProjectMessage:"You have unsaved changes. Save the working state before opening another project?",openProjectMessageWithPackage:"You have unsaved changes. Save before opening another project?",workingSaveNoticeTitle:"Save Project",workingSaveNoticeMessage:"Ctrl+S saves the project's working state in this browser. Use “Export Project” when you need a portable .ssproj file for sharing or moving to another environment.",startupImportTitle:"Load shared data?",startupImportMessage:"This link will load external shared data. Continuing will access the URLs below.",importTitle:"Loading 3D data",importMessage:"Loading is in progress. Please wait until the scene finishes updating.",importPhaseVerify:"Checking sources",importPhaseExpand:"Expanding packages",importPhaseLoad:"Loading 3D assets",importPhaseApply:"Applying scene state",importDetailOpenProjectArchive:"Opening project package…",importDetailInspectProjectArchive:"Inspecting project package…",importDetailReadProjectManifest:"Reading manifest… ({file})",importDetailReadProjectDocument:"Reading project document… ({file})",importDetailScanProjectAssets:"Checking project assets to expand… ({count})",importDetailExpandProjectAsset:"Expanding project asset {index}/{count}: {name}",importDetailExpandProjectAssetWithFile:"Expanding project asset {index}/{count}: {name} ({file})",importDetailExtractProjectAssetData:"Expanding project asset data {index}/{count}: {stage} ({fileCount} file(s))",importDetailExpandProjectAssetComplete:"Finished project asset {index}/{count}",importDetailExtractReferenceImage:"Expanding reference image {index}/{count}: {name}",importDetailExpandComplete:"Package expansion complete.",importProjectAssetExtractStage:{file:"embedded file",packedSplat:"3DGS manifest / companion files",rawSplat:"raw 3DGS arrays / LoD arrays"},importDetailExpandPackage:"Package {index}/{count}: {name}",importDetailLoadAsset:"Asset {index}/{count}: {name}",importDetailApply:"Applying Camera / FRAME / scene state",blockedStartupTitle:"Shared link cannot be loaded",blockedStartupMessage:"This link could not be opened directly from the app.",blockedStartupReasonHttps:"Blocked because the URL is not HTTPS",blockedStartupReasonPrivate:"Blocked because the URL points to a private address or localhost",blockedStartupReasonInvalid:"Blocked because the value is not a valid URL",importErrorTitle:"Failed to load data",importErrorMessageGeneric:"This data could not be loaded.",importErrorMessageRemote:"This link could not be opened directly from the app.",errorDetails:"Details",packageSaveTitle:"Export Project",packageSaveMessage:"Export a portable .ssproj project file for sharing or moving to another environment.",packageSaveMessageWithOverwrite:"Export a portable .ssproj project file for sharing or moving to another environment. Choose whether to overwrite {name} or save to a new file.",exportTitle:"Exporting",exportMessage:"Please wait until export finishes. Other interactions are temporarily disabled.",exportDetailSingle:"Exporting {camera} as {format}…",exportDetailBatch:"Exporting {index}/{count} {camera} as {format}…",exportPhasePrepare:"Preparing",exportPhaseBeauty:"Rendering",exportPhaseGuides:"Guides",exportPhaseMasks:"Masks",exportPhasePsdBase:"PSD Base",exportPhaseModelLayers:"GLB Layers",exportPhaseSplatLayers:"3DGS Layers",exportPhaseReferenceImages:"Reference Images",exportPhaseWrite:"Writing",exportPhaseDetailPrepare:"Switching camera and export state…",exportPhaseDetailBeauty:"Rendering the final beauty image…",exportPhaseDetailGuides:"Preparing guide layers…",exportPhaseDetailGuidesGrid:"Rendering Infinite Grid for export…",exportPhaseDetailGuidesEyeLevel:"Rendering Eye Level for export…",exportPhaseDetailMasks:"Building mask passes…",exportPhaseDetailMaskBatch:"Building mask {index}/{count}: {name}…",exportPhaseDetailPsdBase:"Preparing the PSD base image…",exportPhaseDetailModelLayers:"Preparing GLB layer exports…",exportPhaseDetailModelLayersBatch:"Building GLB layer {index}/{count}: {name}…",exportPhaseDetailSplatLayers:"Preparing 3DGS layer exports…",exportPhaseDetailSplatLayersBatch:"Building 3DGS layer {index}/{count}: {name}…",exportPhaseDetailReferenceImages:"Compositing reference image layers…",exportPhaseDetailReferenceImagesBatch:"Placing reference image {index}/{count}: {name}…",exportPhaseDetailWritePng:"Writing PNG file…",exportPhaseDetailWritePsd:"Writing PSD document…",exportErrorTitle:"Export failed",exportErrorMessage:"An error occurred during export. Review the details and try again.",packageSaveErrorTitle:"Project export failed",packageSaveErrorMessage:"An error occurred while exporting the project. Check the details below.",packagePhaseCollect:"Collecting state",packagePhaseResolve:"Resolving assets",packagePhaseCompress:"Compressing 3DGS",packagePhaseWrite:"Writing package",packageDetailCollect:"Collecting save data…",packageDetailAsset:"Asset {index}/{total}: {name}",packageDetailAssetWithFile:"Asset {index}/{total}: {name} ({file})",packageDetailWrite:"Writing package file…",packageWriteStage:{zipEntries:"Writing ZIP archive…"},packageResolveStage:{"copy-source":"Copying original asset data…","copy-packed-splat":"Collecting packed 3DGS data…"},packageCompressStage:{"read-input":"Reading source data…","start-worker":"Starting compression worker…","retry-cpu-worker":"Worker stalled, retrying on CPU worker…","load-transform":"Loading SplatTransform…","decode-input":"Decoding 3DGS data…","merge-tables":"Merging splat tables…","filter-bands":"Filtering SH bands…","write-sog":"Writing SOG output…",finalize:"Finalizing output…"},packageFieldCompressSplats:"Compress 3DGS to SOG",packageFieldCompressSplatsDisabled:"Compress 3DGS to SOG (WebGPU required)",packageFieldCompressSplatsWorkerUnavailable:"Compress 3DGS to SOG (unavailable in this environment)",packageFieldSogShBands:"SOG SH Bands",packageFieldSogIterations:"SOG Compression Iterations",packageSogShBands:{0:"0 bands",1:"1 band",2:"2 bands",3:"3 bands"},packageSogIterations:{4:"4 iterations",8:"8 iterations",10:"10 iterations",12:"12 iterations",16:"16 iterations"},packageFieldSaveMode:"Save mode",packageSaveMode:{fast:"Fast — quick save",fastHint:"Keeps the file small and saves instantly. LoD is built in the background on next load.",quality:"Quality — optimized save",qualityHint:"Precomputes the LoD so the next load renders optimized immediately. Save takes tens of seconds.",qualityHintPreserve:"Already baked at Quality. Save will preserve it as-is (no recomputation).",qualityHintUpgrade:"Upgrades existing Quick-baked data to Quality at save time."},packageAdvancedOptions:"Advanced options",packageFieldSogCompress:"Compress untouched 3DGS as SOG to shrink the file further",packageFieldSogCompressDisabled:"Compress untouched 3DGS as SOG (unavailable in this environment/scene)",packageBakeLodStage:{start:"Baking LoD…",asset:"Baking LoD for {name} ({index}/{total})…",finalize:"Finalizing LoD data…"},packagePhaseBakeLod:"Baking LoD",packageDetailBakeLod:"Baking LoD for {name} ({index}/{total})…"},exportSummary:{empty:"Exports use the current Camera settings.",refreshed:"Preview refreshed at {width} × {height}.",exported:"PNG exported at {width} × {height}.",exportedBatch:"Exported {count} PNG file(s).",psdExported:"Exported {count} PSD file(s).",exportedMixed:"Exported {count} file(s)."},status:{ready:"Ready.",projectSaving:"Saving project...",projectSavingToFolder:"Saving project to {name}...",projectLoaded:"Project loaded.",projectLoadedFromFolder:"Loaded project from {name}.",projectSaved:"Project saved.",projectSavedToFolder:"Saved project to {name}.",workingStateSaved:"Saved {name}.",workingStateRestored:"Restored working state for {name}.",referenceImagesImported:"Loaded {count} reference image file(s).",packageSaved:"Exported {name}.",autoLodReady:"Optimized rendering for {name} with LoD.",autoLodFailed:"Could not build LoD for {name}. Continuing with raw rendering.",newProjectReady:"Started a new project.",projectExporting:"Exporting project...",projectExported:"Project exported.",viewportEnabled:"Switched to Viewport.",cameraEnabled:"Switched to Camera View.",loadingItems:"Loading {count} item(s)...",loadedItems:"Loaded {count} item(s).",expandingProjectPackage:"Extracting 3D assets from {name}...",expandedProjectPackage:"Extracted {count} 3D asset(s) from {name}.",enterUrl:"Enter at least one http(s) URL.",copiedViewportToShot:"Copied the Viewport pose into the Camera.",copiedShotToViewport:"Copied the Camera pose into the Viewport.",resetViewport:"Viewport reset.",resetCamera:"Camera reset.",sceneCleared:"Scene cleared.",exportPreviewUpdated:"Output preview updated.",pngExported:"PNG exported.",pngExportedBatch:"Exported {count} PNG file(s).",psdExported:"Exported {count} PSD file(s).",exportedMixed:"Exported {count} file(s).",navigationActive:"FPV navigation active. WASD/RF move, drag to look, right-drag to slide. Base speed {speed} m/s.",zoomToolEnabled:"Zoom tool active. Drag in Camera View to zoom, press Z or Esc to exit.",viewportZoomToolEnabled:"Viewport lens adjust active. Drag to change the full-frame focal length, press Z or Esc to exit.",measurementEnabled:"Measurement tool active. Click to place start and end points, then press M again to exit.",measurementDisabled:"Measurement tool disabled.",measurementScaleApplied:"Applied a {scale}x scale ratio to the selected objects from the measurement.",splatEditEnabled:"Enabled 3DGS edit mode. {count} selected 3DGS assets are now in scope.",splatEditDisabled:"Exited 3DGS edit mode.",splatEditRequiresScope:"Select at least one 3DGS asset in the Scene tab first.",splatEditScopeSummary:"Scope {scope} asset / Selected {selected} splat",splatEditToolBox:"Box",splatEditToolBrush:"Brush",splatEditToolTransform:"Transform",splatEditPlaceBoxHint:"Click in the view to place the box",splatEditBrushHint:"Drag to add. Hold Alt while dragging to subtract. Hold Ctrl while dragging to orbit.",splatEditBrushMode:"Depth Mode",splatEditBrushModeThrough:"Through",splatEditBrushModeDepth:"Depth",splatEditBrushDepth:"Depth",splatEditCenter:"Center",splatEditSize:"Size",splatEditScaleDown:"-10%",splatEditScaleUp:"+10%",splatEditFitScope:"Fit Scope",splatEditAdd:"Add",splatEditSubtract:"Subtract",splatEditDelete:"Delete",splatEditSeparate:"Separate",splatEditDuplicate:"Duplicate",splatEditSelectAll:"Select All",splatEditInvert:"Invert",splatEditLodStale:"Optimize LoD",splatEditLodReady:"LoD ready",splatEditLodRunning:"Building LoD…",splatEditLodTooltip:"Rebuild the rendering LoD. Splat edits invalidate it automatically, so press this to keep the scene lightweight.",splatEditTransformMove:"Move",splatEditTransformRotate:"Rotate",splatEditTransformScale:"Uniform Scale",splatEditTransformHint:"Use the gizmo to move, rotate, or scale the selected splats.",splatEditLastOperation:"Last: {mode} / {count} hit",splatEditSelectionAdded:"Added {count} splats to the selection.",splatEditSelectionRemoved:"Removed {count} splats from the selection.",splatEditBrushHitMissing:"Could not resolve a Brush hit point.",splatEditSelectionMissing:"Select 3DGS splats first.",splatEditDeleted:"Deleted {count} splats.",splatEditSeparated:"Separated {count} splats into {assets} asset(s).",splatEditDuplicated:"Duplicated {count} splats into {assets} asset(s).",splatEditSelectAllDone:"Selected all {count} splats.",splatEditInverted:"Inverted selection ({count} splats).",splatEditTransformedMove:"Moved {count} splats.",splatEditTransformedRotate:"Rotated {count} splats.",splatEditTransformedScale:"Scaled {count} splats uniformly.",zoomToolUnavailable:"The zoom tool is not available here.",lensToolEnabled:"Lens adjust active. Drag to change the 35mm horizontal equivalent, press Esc to exit.",rollToolEnabled:"Camera roll active. Drag left or right to rotate the shot, press Esc to exit.",rollToolUnavailable:"Camera roll is only available in Camera View.",localeChanged:"Display language switched to {language}.",assetScaleUpdated:"Set {name} world scale to {scale}.",assetTransformUpdated:"Updated {name} transform.",assetTransformApplied:"Applied transform for {name}.",assetVisibilityUpdated:"Set {name} to {visibility}.",duplicatedSceneAsset:"Duplicated {name}.",duplicatedSceneAssets:"Duplicated {count} objects.",deletedSceneAsset:"Deleted {name}.",deletedSceneAssets:"Deleted {count} objects.",assetOrderUpdated:"Moved {name} to order {index}.",selectedShotCamera:"Camera switched to {name}.",createdShotCamera:"Added Camera {name}.",duplicatedShotCamera:"Duplicated Camera {name}.",deletedShotCamera:"Deleted Camera {name}.",selectedFrame:"Selected {name}.",createdFrame:"Added {name}.",duplicatedFrame:"Duplicated {name}.",duplicatedFrames:"Duplicated {count} FRAMEs.",deletedFrame:"Deleted {name}.",deletedFrames:"Deleted {count} FRAMEs.",shotCameraClipMode:"Camera clip range set to {mode}.",shotCameraExportFormat:"Camera export format set to {format}.",frameLimitReached:"FRAME limit reached ({limit}).",exportTargetChanged:"Export target set to {target}.",exportPresetSelection:"Selected export now includes {count} Camera preset(s)."},backgroundTask:{autoLodRunningSingle:"Building LoD… ({name})",autoLodRunningMulti:"Building LoD… {current}/{total}",autoLodDone:"LoD ready",autoLodFailed:"LoD build failed"},scene:{badgeEmpty:"Empty",summaryEmpty:"Drop or load `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, or `.ssproj` files.",scaleDefault:"Scene contract: 1 unit = 1 meter. GLB defaults to meters; 3DGS enters at raw 1x.",loaded:"Loaded {count} item(s): {badge}.",bounds:"Bounds {x} × {y} × {z} m.",worldContract:"World contract 1u = 1m.",glbMeter:"GLB assets are treated as meter-native.",splatRaw:"3DGS assets enter at raw 1x, so scale stays provisional until calibrated.",splatCount:"{count} splat{plural}",modelCount:"{count} model{plural}",scaleAdjusted:"{count} calibrated scale adjustment(s)."},assetKind:{splat:"3DGS",model:"GLB / Model"},assetVisibility:{visible:"Visible",hidden:"Hidden"},unitMode:{raw:"raw 1x",meters:"meters"},shotCamera:{defaultName:"Camera {index}"},frame:{defaultName:"FRAME {index}"},cameraSummary:{view:"view",shot:"shot",pos:"pos",fwd:"fwd",clip:"clip",nearFar:"near/far",base:"base",frame:"frame",nav:"nav"},outputFrame:{meta:"{size} · {anchor}"},anchor:{"top-left":"Top Left","top-center":"Top Center","top-right":"Top Right","middle-left":"Middle Left",center:"Center","middle-right":"Middle Right","bottom-left":"Bottom Left","bottom-center":"Bottom Center","bottom-right":"Bottom Right"},error:{exportRequiresAsset:"Load a splat or model before rendering output preview.",exportRequiresPreset:"Select at least one Camera for export.",projectPackageSaveUnsupported:"Package save dialogs are not supported in this environment.",projectPackageSaveUnavailable:"Could not get a destination for package save.",sogCompressionRequiresWebGpu:"SOG compression save requires WebGPU in this environment.",sogCompressionWorkerUnavailable:"Could not start the SOG compression worker in this environment. Save again with SOG compression turned off.",projectPackageOverwriteUnavailable:"There is no project package available to overwrite.",previewContext:"Could not get the 2D context for output preview.",unsupportedFileType:"Unsupported file type: {name}",emptyProjectPackage:"No supported 3D assets were found in {name}.",emptyGltf:"GLTF scene is empty.",missingRoot:"CAMERA_FRAMES root element was not found."},referenceImage:{activePreset:"Active Preset",activePresetItems:"{count} item(s)",blankPreset:"(blank)",untitled:"Untitled",sizeUnknown:"Unknown size",currentPresetSection:"Current Preset",selectedSection:"Selected",selectedEmpty:"No reference image is selected.",currentCameraEmpty:"There are no reference items in this preset yet. Load a reference image to begin.",currentCameraUsage:"{count} item(s) on this Camera",orderLabel:"#{order}",group:{back:"Back",front:"Front"},groupShort:{back:"B",front:"F"}},localeName:{ja:"Japanese",en:"English"},mobileUiScale:{title:"UI Scale (Mobile)",tooltip:"Adjust the mobile UI scale. The value is saved automatically.",description:"Scale buttons, text, and menus across the mobile UI together. The bottom bar follows the slider live.",currentLabel:"Current",sliderLabel:"UI Scale",autoRecommendation:"Recommended for this device: {value}",resetToAuto:"Reset to recommended",autoActiveBadge:"Auto",previewLabel:"Preview",previewCopy:"Drag the slider — this panel and the bottom buttons resize together so you can pick a comfortable touch target.",previewPrimaryButton:"Primary",previewSecondaryButton:"Secondary",previewFieldLabel:"Input",previewFieldValue:"Sample input"},viewportLodScale:{label:"Preview quality",ariaLabel:"3DGS preview quality",tooltipTitle:"Preview quality",tooltipDescription:"Use this when 3DGS scenes feel heavy in the viewport. Lower values make editing lighter; higher values make fine detail easier to inspect."}}};function bc(n,e){return e.split(".").reduce((t,i)=>t==null?void 0:t[i],n)}function Oe(n,e,t={}){const i=Zs[n]??Zs[Co],r=Zs[Co];let s=bc(i,e);return s==null&&(s=bc(r,e)),typeof s!="string"?e:s.replace(/\{(.*?)\}/g,(o,a)=>`${t[a]??`{${a}}`}`)}function ut(n,e){return Oe(n,`anchor.${e}`)}function Iw(n){return[{value:"top-left",label:ut(n,"top-left")},{value:"top-center",label:ut(n,"top-center")},{value:"top-right",label:ut(n,"top-right")},{value:"middle-left",label:ut(n,"middle-left")},{value:"center",label:ut(n,"center")},{value:"middle-right",label:ut(n,"middle-right")},{value:"bottom-left",label:ut(n,"bottom-left")},{value:"bottom-center",label:ut(n,"bottom-center")},{value:"bottom-right",label:ut(n,"bottom-right")}]}const Lu="perspective",xc="orthographic",yi="posX",_i="negX",bi="posY",xi="negY",Pn="posZ",vi="negZ",Ci=Pn,Fa=3,as=6,li=Object.freeze({x:0,y:1,z:0}),g0="__cameraFramesViewportOrthoDistance",vc=Object.freeze({[yi]:Object.freeze({id:yi,axis:"x",sign:1,position:Object.freeze([1,0,0]),up:Object.freeze([0,1,0])}),[_i]:Object.freeze({id:_i,axis:"x",sign:-1,position:Object.freeze([-1,0,0]),up:Object.freeze([0,1,0])}),[bi]:Object.freeze({id:bi,axis:"y",sign:1,position:Object.freeze([0,1,0]),up:Object.freeze([0,0,1])}),[xi]:Object.freeze({id:xi,axis:"y",sign:-1,position:Object.freeze([0,-1,0]),up:Object.freeze([0,0,1])}),[Pn]:Object.freeze({id:Pn,axis:"z",sign:1,position:Object.freeze([0,0,1]),up:Object.freeze([0,1,0])}),[vi]:Object.freeze({id:vi,axis:"z",sign:-1,position:Object.freeze([0,0,-1]),up:Object.freeze([0,1,0])})}),y0=Object.freeze({[yi]:_i,[_i]:yi,[bi]:xi,[xi]:bi,[Pn]:vi,[vi]:Pn});function _0(n=null){return{x:Number.isFinite(n==null?void 0:n.x)?Number(n.x):li.x,y:Number.isFinite(n==null?void 0:n.y)?Number(n.y):li.y,z:Number.isFinite(n==null?void 0:n.z)?Number(n.z):li.z}}function Dw(n=null){return zu(n)}function Nw(n){return n===xc?xc:Lu}function ls(n){return vc[n]??vc[Ci]}function b0(n){return ls(n).axis}function Lw(n){return y0[n]??Ci}function zw(n,e=1){return n==="x"?e<0?_i:yi:n==="y"?e<0?xi:bi:n==="z"?e<0?vi:Pn:Ci}function Ow(n){const e=b0(n);return e==="x"?"zy":e==="y"?"xz":e==="z"?"xy":null}function x0(n,e=new $){const t=ls(n);return e.set(t.position[0],t.position[1],t.position[2])}function v0(n,e=new $){const t=ls(n);return e.set(t.up[0],t.up[1],t.up[2])}function zu(n=null){const e=_0(n==null?void 0:n.focus),t=Number.isFinite(n==null?void 0:n.size)?Math.max(.05,Number(n.size)):Fa,i=Number.isFinite(n==null?void 0:n.distance)?Math.max(.05,Number(n.distance)):as;return{viewId:ls(n==null?void 0:n.viewId).id,size:t,distance:i,focus:e}}function Bw({depth:n=as,verticalFovDegrees:e=50,minSize:t=.05}={}){const i=Math.max(Number(n)||0,1e-4),r=ri.clamp(Number(e)||0,.001,179.999),s=i*Math.tan(ri.degToRad(r*.5));return Math.max(Number(t)||.05,s)}function jw(n,{aspect:e=1,viewId:t=Ci,size:i=Fa,distance:r=as,focus:s=li}={}){if(!(n!=null&&n.isOrthographicCamera))return!1;const o=Math.max(Number(e)||1,1e-6),a=zu({viewId:t,size:i,distance:r,focus:s}),c=new $(a.focus.x,a.focus.y,a.focus.z),l=x0(a.viewId,new $).normalize(),u=v0(a.viewId,new $).normalize(),h=a.size,d=h*o;return n.position.copy(c).addScaledVector(l,a.distance),n.up.copy(u),n.left=-d,n.right=d,n.top=h,n.bottom=-h,n.zoom=1,n.userData=n.userData??{},n.userData[g0]=a.distance,n.lookAt(c),n.updateProjectionMatrix(),n.updateMatrixWorld(!0),!0}const w0=1.1,M0=2,S0=36.87,$0=45;function Js(n,e,t,i){const r=Number(n);return Number.isFinite(r)?Math.min(t,Math.max(e,r)):i}function k0(n,e=0){const t=Number(n);if(!Number.isFinite(t))return e;let i=((t+180)%360+360)%360-180;return i===-180&&(i=180),i}function Ou(){return{ambient:w0,modelLight:{enabled:!0,intensity:M0,azimuthDeg:S0,elevationDeg:$0}}}function Vw(n=null){const e=Fo(n);return{ambient:e.ambient,modelLight:{enabled:e.modelLight.enabled,intensity:e.modelLight.intensity,azimuthDeg:e.modelLight.azimuthDeg,elevationDeg:e.modelLight.elevationDeg}}}function Fo(n=null){const e=Ou(),t=(n==null?void 0:n.modelLight)??{};return{ambient:Js(n==null?void 0:n.ambient,0,2.5,e.ambient),modelLight:{enabled:typeof t.enabled=="boolean"?t.enabled:e.modelLight.enabled,intensity:Js(t.intensity,0,3,e.modelLight.intensity),azimuthDeg:k0(t.azimuthDeg,e.modelLight.azimuthDeg),elevationDeg:Js(t.elevationDeg,-89,89,e.modelLight.elevationDeg)}}}function Uw(n,e){const t=Fo(n),i=Fo(e);return t.ambient===i.ambient&&t.modelLight.enabled===i.modelLight.enabled&&t.modelLight.intensity===i.modelLight.intensity&&t.modelLight.azimuthDeg===i.modelLight.azimuthDeg&&t.modelLight.elevationDeg===i.modelLight.elevationDeg}const wc=2,Mc=1500,E0=3,T0=2e3;function A0(n,e=nu){return Math.round(n/e)*e}function Po(n,e,t){return Math.min(t,Math.max(e,n))}function wi(n){const e=Number(n);if(!Number.isFinite(e))return Ai;const t=Po(e,eu,tu);return Number(A0(t).toFixed(2))}function C0(n){const e=Number(n);return Number.isFinite(e)?e.toFixed(2):Number(Ai).toFixed(2)}function F0({userScale:n=null}={}){return n==null?Ai:wi(n)}function P0(n){return wi(Math.max(wi(n),Ai))}function Hw(n){const t=P0(n)/Ai;return{minWarmupPasses:0,splatWarmupPasses:Po(Math.ceil(wc*t),wc,E0),maxWaitMs:Po(Math.round(Mc*t),Mc,T0)}}function Gw({storage:n}={}){const e=n??Bu();if(!e)return null;try{const t=e.getItem(wo);if(!t)return null;const i=JSON.parse(t),r=i==null?void 0:i.userScale;if(r==null)return null;const s=Number(r);return Number.isFinite(s)?wi(s):null}catch{return null}}function Ww(n,{storage:e}={}){const t=e??Bu();if(t)try{if(n==null){t.removeItem(wo);return}const i=JSON.stringify({userScale:wi(n)});t.setItem(wo,i)}catch{}}function Bu(){if(typeof window>"u")return null;try{return window.localStorage??null}catch{return null}}const Ro=Math.PI*.5,R0=.001;function I0(n){return(n.rotation??0)*Math.PI/180}function D0(n){const e=Math.round(n/Ro)*Ro;return Math.abs(n-e)<R0}function N0(n,e,t,i){const r=Math.round(n-t*.5),s=Math.round(n+t*.5),o=Math.round(e-i*.5),a=Math.round(e+i*.5);return{x:r,y:o,width:Math.max(0,s-r),height:Math.max(0,a-o)}}function L0(n){const e=Number(n.scale);return Number.isFinite(e)&&e>0?e:1}function z0(n,e,t,i=e,r=t){const s=L0(n),o=e/Math.max(i,1e-6),a=t/Math.max(r,1e-6);return{width:Ke.width*s*o,height:Ke.height*s*a}}function ju(n,e,t,i=e,r=t,s=0,o=0,a={}){const{pixelSnapAxisAligned:c=!0}=a,{width:l,height:u}=z0(n,e,t,i,r),h=s+n.x*e,d=o+n.y*t,p=I0(n),m=Math.round(p/Ro),f=D0(p),g=f&&Math.abs(m)%2===1,y=f&&c?N0(h,d,g?u:l,g?l:u):null;return{centerX:h,centerY:d,width:l,height:u,rotationRadians:p,axisAligned:f,snappedRect:y}}function Sc(n,e,t,i,r,s=aa){const o=s*.5;n.strokeRect(e-o,t-o,i+o*2,r+o*2)}function $c(n,e,t=aa){if(e.axisAligned&&e.snappedRect){Sc(n,e.snappedRect.x,e.snappedRect.y,e.snappedRect.width,e.snappedRect.height,t);return}n.translate(e.centerX,e.centerY),n.rotate(e.rotationRadians),Sc(n,-e.width*.5,-e.height*.5,e.width,e.height,t)}function Xw(n,e,t,i,r={}){const{strokeStyle:s="#ff0000",lineWidth:o=aa,selectedFrameId:a=null,selectedFrameIds:c=null,selectedStrokeStyle:l=null,selectedLineWidth:u=1,selectedLineDash:h=[4,2],logicalSpaceWidth:d=e,logicalSpaceHeight:p=t,offsetX:m=0,offsetY:f=0,pixelSnapAxisAligned:g=!0}=r,y=[...i].sort((M,x)=>(M.order??0)-(x.order??0)),_=c instanceof Set?c:new Set(c??[]);for(const M of y){const x=ju(M,e,t,d,p,m,f,{pixelSnapAxisAligned:g});if(n.save(),n.strokeStyle=s,n.lineWidth=o,n.setLineDash([]),$c(n,x,o),n.restore(),_.has(M.id)&&l){const v=a&&M.id===a?u+.25:u;n.save(),n.strokeStyle=l,n.lineWidth=v,n.setLineDash(h),$c(n,x,v),n.restore()}}}const O0=8,B0=180;function Vu(n,e=null){if(!Array.isArray(n)||n.length===0)return[];const t=e==null?void 0:e.mode;if(t==="off")return[];if(t==="selected"){const i=Array.isArray(e==null?void 0:e.selectedIds)?e.selectedIds:[],r=new Set((i.length>0?i:n.map(s=>s==null?void 0:s.id)).filter(s=>typeof s=="string"&&s.length>0));return n.filter(s=>r.has(s==null?void 0:s.id))}return[...n]}function Io(n,e){const t=Math.cos(e),i=Math.sin(e);return{x:n.x*t-n.y*i,y:n.x*i+n.y*t}}function j0(n,e,t,i=e,r=t,s=0,o=0){const a=ju(n,e,t,i,r,s,o,{pixelSnapAxisAligned:!1}),c=a.width*.5,l=a.height*.5;return[{x:-c,y:-l},{x:c,y:-l},{x:c,y:l},{x:-c,y:l}].map(u=>{const h=Io(u,a.rotationRadians);return{x:a.centerX+h.x,y:a.centerY+h.y}})}function V0(n){let e=Number(n)||0;for(;e<0;)e+=Math.PI;for(;e>=Math.PI;)e-=Math.PI;return e}function U0(n){if(!Array.isArray(n)||n.length===0)return null;const e=Math.min(...n.map(s=>s.x)),t=Math.max(...n.map(s=>s.x)),i=Math.min(...n.map(s=>s.y)),r=Math.max(...n.map(s=>s.y));return[{x:e,y:i},{x:t,y:i},{x:t,y:r},{x:e,y:r}]}function H0(n,e){if(!Array.isArray(n)||n.length===0)return null;const t=n.map(a=>Io(a,-e)),i=Math.min(...t.map(a=>a.x)),r=Math.max(...t.map(a=>a.x)),s=Math.min(...t.map(a=>a.y)),o=Math.max(...t.map(a=>a.y));return[{x:i,y:s},{x:r,y:s},{x:r,y:o},{x:i,y:o}].map(a=>Io(a,e))}function Uu(n,e){if(!(!Array.isArray(e)||e.length===0)){n.moveTo(e[0].x,e[0].y);for(let t=1;t<e.length;t+=1)n.lineTo(e[t].x,e[t].y);n.closePath()}}function Ks(n,e){!Array.isArray(e)||e.length<3||(n.beginPath(),Uu(n,e),n.fill())}function Wr(n,e,t,i,r,s,o){return{x:s+n.x/Math.max(i,1e-6)*e,y:o+n.y/Math.max(r,1e-6)*t}}function G0(n,e,t,i,r,s,o,a){return ba(n,e,r,s).map(c=>({...c,corners:c.corners.map(l=>Wr(l,t,i,r,s,o,a))}))}function W0(n,e,{canvasWidth:t,canvasHeight:i,frameSpaceWidth:r,frameSpaceHeight:s,logicalSpaceWidth:o,logicalSpaceHeight:a,offsetX:c,offsetY:l,fillStyle:u,frameMaskSettings:h}){const d=G0(e,h,r,s,o,a,c,l);if(d.length===0)return null;n.fillStyle=u,n.fillRect(0,0,t,i),n.globalCompositeOperation="destination-out";for(const p of d)Ks(n,p.corners);for(let p=1;p<d.length;p+=1){const m=d[p-1].corners,f=d[p].corners;for(let g=0;g<m.length;g+=1){const y=m[g],_=m[(g+1)%m.length],M=f[(g+1)%f.length],x=f[g];Ks(n,[y,_,M]),Ks(n,[y,M,x])}}return n.globalCompositeOperation="source-over",null}function X0(n,e,t,i=e,r=t,s=0,o=0,a={}){var p;if(!Array.isArray(n)||n.length===0||ma(a.frameMaskShape??((p=a.frameMaskSettings)==null?void 0:p.shape))===di)return null;const c=n.map(m=>j0(m,e,t,i,r,s,o));if(c.length===1)return c[0];const l=n.map(m=>V0((Number(m==null?void 0:m.rotation)||0)*Math.PI/180)),u=l[0],h=l.every(m=>Math.abs(m-u)<=1e-6),d=c.flat();return h?H0(d,u):U0(d)}function Hu(n,e,{canvasWidth:t,canvasHeight:i,frameSpaceWidth:r=t,frameSpaceHeight:s=i,logicalSpaceWidth:o=r,logicalSpaceHeight:a=s,offsetX:c=0,offsetY:l=0,fillStyle:u="rgb(3, 6, 11)",frameMaskSettings:h=null}={}){if(!n)throw new Error("Failed to acquire the 2D context for FRAME mask.");if(n.clearRect(0,0,t,i),!Array.isArray(e)||e.length===0)return null;if(ma(h==null?void 0:h.shape)===di)return W0(n,e,{canvasWidth:t,canvasHeight:i,frameSpaceWidth:r,frameSpaceHeight:s,logicalSpaceWidth:o,logicalSpaceHeight:a,offsetX:c,offsetY:l,fillStyle:u,frameMaskSettings:h});const d=X0(e,r,s,o,a,c,l,{frameMaskSettings:h});return d?(n.fillStyle=u,n.fillRect(0,0,t,i),n.globalCompositeOperation="destination-out",n.beginPath(),Uu(n,d),n.fillStyle="#000",n.fill(),n.globalCompositeOperation="source-over",d):null}function Y0(n,e,{canvasWidth:t,canvasHeight:i,frameSpaceWidth:r=t,frameSpaceHeight:s=i,logicalSpaceWidth:o=r,logicalSpaceHeight:a=s,offsetX:c=0,offsetY:l=0,strokeStyle:u="#ff674d",lineWidth:h=2,frameMaskSettings:d=null,trajectorySource:p=je}={}){if(!n)throw new Error("Failed to acquire the 2D context for FRAME trajectory.");const m=Ln(p);if(!Array.isArray(e)||e.length<2||m===Xt)return[];const f=pu(e,d,o,a,{source:m}).map(g=>Wr(g,r,s,o,a,c,l));if(f.length<2)return[];n.clearRect(0,0,t,i),n.beginPath(),n.moveTo(f[0].x,f[0].y);for(let g=1;g<f.length;g+=1)n.lineTo(f[g].x,f[g].y);return n.strokeStyle=u,n.lineWidth=h,n.lineJoin="round",n.lineCap="round",n.stroke(),q0(n,e,{canvasWidth:t,canvasHeight:i,frameSpaceWidth:r,frameSpaceHeight:s,logicalSpaceWidth:o,logicalSpaceHeight:a,offsetX:c,offsetY:l,strokeStyle:u,lineWidth:h,frameMaskSettings:d,trajectorySource:m}),f}function q0(n,e,{canvasWidth:t,canvasHeight:i,frameSpaceWidth:r=t,frameSpaceHeight:s=i,logicalSpaceWidth:o=r,logicalSpaceHeight:a=s,offsetX:c=0,offsetY:l=0,strokeStyle:u="#ff674d",lineWidth:h=2,frameMaskSettings:d=null,trajectorySource:p=je}={}){if(!n)return[];const m=Ln(p);if(!Array.isArray(e)||e.length<2||m===Xt)return[];const f=Ay(e,d,o,a,{source:m});if(f.length===0)return[];const y=Math.max(O0,Math.min(t,i)/B0)*.5,_=[];n.save(),n.strokeStyle=u,n.lineWidth=h,n.lineCap="round";for(const M of f){const x=Wr(M.point,r,s,o,a,c,l),v={x:M.point.x+M.tangent.x,y:M.point.y+M.tangent.y},P=Wr(v,r,s,o,a,c,l),E=P.x-x.x,S=P.y-x.y,C=Math.hypot(E,S);if(!(C>0))continue;const k=-S/C,A=E/C,b={x:x.x-k*y,y:x.y-A*y},F={x:x.x+k*y,y:x.y+A*y};n.beginPath(),n.moveTo(b.x,b.y),n.lineTo(F.x,F.y),n.stroke(),_.push({frameId:M.frameId,start:b,end:F,center:x})}return n.restore(),_}function Yw(n,e,t,{name:i="Mask",opacity:r=.8,hidden:s=!0,fillStyle:o="rgb(3, 6, 11)",createCanvas:a=null,frameMaskSettings:c=null}={}){const l=Vu(n,c);if(l.length===0)return null;const u=typeof a=="function"?a(e,t):(()=>{const d=document.createElement("canvas");return d.width=e,d.height=t,d})(),h=u.getContext("2d");return Hu(h,l,{canvasWidth:e,canvasHeight:t,fillStyle:o,frameMaskSettings:c}),{name:i,canvas:u,opacity:r,hidden:s}}function qw(n,e,t,{name:i="Trajectory",opacity:r=1,strokeStyle:s="#ff674d",lineWidth:o=2,createCanvas:a=null,frameMaskSettings:c=null,trajectorySource:l=je}={}){const u=Ln(l);if(!Array.isArray(n)||n.length<2||u===Xt)return null;const h=typeof a=="function"?a(e,t):(()=>{const m=document.createElement("canvas");return m.width=e,m.height=t,m})(),d=h.getContext("2d");return Y0(d,n,{canvasWidth:e,canvasHeight:t,strokeStyle:s,lineWidth:o,frameMaskSettings:c,trajectorySource:u}).length<2?null:{name:i,canvas:h,opacity:r}}const Gu=.1,Wu=4,Z0=15,J0={"top-left":{x:0,y:0,affectsWidth:!0,affectsHeight:!0},top:{x:.5,y:0,affectsWidth:!1,affectsHeight:!0},"top-right":{x:1,y:0,affectsWidth:!0,affectsHeight:!0},right:{x:1,y:.5,affectsWidth:!0,affectsHeight:!1},"bottom-right":{x:1,y:1,affectsWidth:!0,affectsHeight:!0},bottom:{x:.5,y:1,affectsWidth:!1,affectsHeight:!0},"bottom-left":{x:0,y:1,affectsWidth:!0,affectsHeight:!0},left:{x:0,y:.5,affectsWidth:!0,affectsHeight:!1}},K0={"top-left":"bottom-right",top:"bottom","top-right":"bottom-left",right:"left","bottom-right":"top-left",bottom:"top","bottom-left":"top-right",left:"right"},Q0={"top-left":"top-left","top-center":"top","top-right":"top-right","middle-left":"left",center:"","middle-right":"right","bottom-left":"bottom-left","bottom-center":"bottom","bottom-right":"bottom-right"},Qs=1e-6;function mr(n,e=.5){const t=Number(n);return Number.isFinite(t)?Math.min(1,Math.max(0,t)):e}function fr(n,e=.5){const t=Number(n);return Number.isFinite(t)?t:e}function Do(n){return n!==null&&typeof n=="object"}function kc(n,e,t,i){return Math.abs(n-0)<=Qs?e:Math.abs(n-.5)<=Qs?t:Math.abs(n-1)<=Qs?i:null}function e_(n,e=rt.center){const t=Do(e)?{x:mr(e.x,.5),y:mr(e.y,.5)}:rt.center;return typeof n=="string"?rt[n]??t:Do(n)?{x:mr(n.x,t.x),y:mr(n.y,t.y)}:t}function Xu(n){const e={x:fr(n==null?void 0:n.x,.5),y:fr(n==null?void 0:n.y,.5)};return typeof(n==null?void 0:n.anchor)=="string"?rt[n.anchor]??e:Do(n==null?void 0:n.anchor)?{x:fr(n.anchor.x,e.x),y:fr(n.anchor.y,e.y)}:e}function Pa(n=rt.center){const e=e_(n,rt.center),t=kc(e.y,"top","middle","bottom"),i=kc(e.x,"left","center","right");if(!t||!i)return"";const r=t==="middle"&&i==="center"?"center":`${t}-${i}`;return Q0[r]??""}function Zw(n){return K0[n]??""}function Ra(n,e,t){const i=Math.cos(t),r=Math.sin(t);return{x:n*i-e*r,y:n*r+e*i}}function Yu(n,e,t){return Ra(n,e,-t)}function Jw(n,e){const t=Ra((e.x-.5)*n.width,(e.y-.5)*n.height,n.rotationRadians);return{x:n.centerX+t.x,y:n.centerY+t.y}}function Kw(n,e,t){return{x:(n-t.boxLeft)/Math.max(t.boxWidth,1e-6),y:(e-t.boxTop)/Math.max(t.boxHeight,1e-6)}}function gr({left:n,top:e,width:t,height:i,localX:r,localY:s,anchorAx:o=.5,anchorAy:a=.5,rotationDeg:c=0}){const l=c*Math.PI/180,u={x:n+t*o,y:e+i*a},h=Ra((r-o)*t,(s-a)*i,l);return{x:u.x+h.x,y:u.y+h.y}}function Qw({left:n,top:e,width:t,height:i,anchorAx:r=.5,anchorAy:s=.5,rotationDeg:o=0}){return[gr({left:n,top:e,width:t,height:i,localX:0,localY:0,anchorAx:r,anchorAy:s,rotationDeg:o}),gr({left:n,top:e,width:t,height:i,localX:1,localY:0,anchorAx:r,anchorAy:s,rotationDeg:o}),gr({left:n,top:e,width:t,height:i,localX:1,localY:1,anchorAx:r,anchorAy:s,rotationDeg:o}),gr({left:n,top:e,width:t,height:i,localX:0,localY:1,anchorAx:r,anchorAy:s,rotationDeg:o})]}function eM(n){if(!Array.isArray(n)||n.length===0)return null;let e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,r=Number.NEGATIVE_INFINITY;for(const s of n)!Number.isFinite(s==null?void 0:s.x)||!Number.isFinite(s==null?void 0:s.y)||(e=Math.min(e,s.x),t=Math.min(t,s.y),i=Math.max(i,s.x),r=Math.max(r,s.y));return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(i)||!Number.isFinite(r)?null:{left:e,top:t,right:i,bottom:r,width:Math.max(i-e,1e-6),height:Math.max(r-t,1e-6)}}function tM(n,e){const t=Xu(n);return{x:e.boxLeft+t.x*e.boxWidth,y:e.boxTop+t.y*e.boxHeight,anchor:t}}function t_(n,e,t){const i=Xu(n),r=Yu((i.x-n.x)*t.boxWidth,(i.y-n.y)*t.boxHeight,e.rotationRadians);return{x:.5+r.x/Math.max(e.width,1e-6),y:.5+r.y/Math.max(e.height,1e-6)}}function nM(n,e,t=rt.center){const i=J0[e];if(!i)return null;const r={x:(i.x-t.x)*n.width,y:(i.y-t.y)*n.height},s=Math.hypot(r.x,r.y);return Number.isFinite(s)&&s>1e-6?{x:r.x/s,y:r.y/s,length:s}:null}function iM({pointerWorldX:n,pointerWorldY:e,anchorWorldX:t,anchorWorldY:i,rotationRadians:r,axisX:s,axisY:o,startProjectionDistance:a,startScale:c=1,fallbackScale:l=1}){if(!(Number.isFinite(a)&&Math.abs(a)>1e-6)||!(Number.isFinite(s)&&Number.isFinite(o)))return l;const u=Yu(n-t,e-i,r),h=u.x*s+u.y*o,d=c*(h/a);return Number.isFinite(d)?Math.min(Wu,Math.max(Gu,d)):l}function rM(n,e){const t=Number(n);if(!Number.isFinite(t))return 1;const i=(e??[]).filter(c=>Number.isFinite(c)&&c>0);if(i.length===0)return Math.max(.01,t);let r=0,s=Number.POSITIVE_INFINITY;for(const c of i)r=Math.max(r,Gu/c),s=Math.min(s,Wu/c);if(!(Number.isFinite(s)&&s>0))return Math.max(.01,t);const o=Math.max(r,.01),a=Math.max(s,o);return Math.min(a,Math.max(o,t))}function sM(n){let e=Number(n)||0;for(;e<=-180;)e+=360;for(;e>180;)e-=360;return e}function oM(n,e=Z0){const t=Number(n),i=Number(e);return Number.isFinite(t)&&Number.isFinite(i)&&i>0?Math.round(t/i)*i:Number.isFinite(t)?t:0}const Ec=15,n_={top:0,"top-right":45,right:90,"bottom-right":135,bottom:180,"bottom-left":225,left:270,"top-left":315},eo=new Map;function i_(n){const e=Number.isFinite(n)?n%360:0;return e<0?e+360:e}function r_(n){return Math.round(i_(n)/Ec)*Ec}function s_(n){return`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${n} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#ffffff" stroke-width="4.8" />
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#111111" stroke-width="1.9" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim()}function No(n=0,e="top"){const t=n_[e]??0,i=r_(n+t);if(!eo.has(i)){const r=encodeURIComponent(s_(i));eo.set(i,`url("data:image/svg+xml,${r}") 16 16, grab`)}return eo.get(i)}const Lo=Math.PI*2,zo=88,qu=28,Zu=126,o_=1.28,a_=Object.freeze(["tool-select","tool-reference","toggle-reference-preview","tool-transform","tool-pivot","adjust-lens","frame-create","frame-mask-toggle","toggle-view-mode","clear-selection"]);function l_(n){const e=Lo/n.length;return n.map((t,i)=>({id:t,angle:-Math.PI/2+e*i}))}const c_=Object.freeze(l_(a_));function aM({coarse:n=!1,uiScale:e=1}={}){const t=Number.isFinite(e)&&e>0?e:1,r=(n?o_:1)*t;return{coarse:n,uiScale:t,scale:r,radius:zo*r,innerRadius:qu*r,outerRadius:Zu*r}}function h_({mode:n,t:e,viewportToolMode:t="none",viewportOrthographic:i=!1,referencePreviewSessionVisible:r=!0,hasReferenceImages:s=!1,frameMaskMode:o="off"}){const a=o==="selected"||o==="all";return c_.map(c=>{switch(c.id){case"tool-select":return{...c,icon:"cursor",label:e("transformMode.select"),active:t==="select"};case"tool-reference":return{...c,icon:"reference-tool",label:e("transformMode.reference"),active:t==="reference"};case"toggle-reference-preview":return{...c,icon:r?"reference-preview-on":"reference-preview-off",label:e(r?"action.hideReferenceImages":"action.showReferenceImages"),active:s&&r,disabled:!s};case"tool-transform":return{...c,icon:"move",label:e("transformMode.transform"),active:t==="transform"};case"tool-pivot":return{...c,icon:"pivot",label:e("transformMode.pivot"),active:t==="pivot"};case"adjust-lens":return{...c,icon:"camera-dslr",label:e("action.adjustLens"),disabled:n==="viewport"&&i};case"frame-create":return{...c,icon:"frame-plus",label:e("action.newFrame")};case"frame-mask-toggle":return{...c,icon:"mask",label:e(a?"action.disableFrameMask":"action.enableFrameMask"),active:n==="camera"&&a,disabled:n!=="camera"};case"toggle-view-mode":return n==="camera"?{...c,icon:"viewport",label:e("mode.viewport")}:{...c,icon:"camera",label:e("mode.camera")};case"clear-selection":return{...c,icon:"selection-clear",label:e("action.clearSelection")};default:return{...c,icon:"slash-circle",label:c.id}}})}function u_(n){let e=n;for(;e<=-Math.PI;)e+=Lo;for(;e>Math.PI;)e-=Lo;return e}function lM({x:n,y:e,centerX:t,centerY:i,actions:r,innerRadius:s=qu,outerRadius:o=Zu}){const a=n-t,c=e-i,l=Math.hypot(a,c);if(l<s||l>o)return null;const u=Math.atan2(c,a);let h=null,d=Number.POSITIVE_INFINITY;for(const p of r){const m=Math.abs(u_(u-p.angle));m<d&&(d=m,h=p.id)}return h}function d_(n,e){var u,h,d,p,m,f,g,y,_,M,x,v,P,E,S,C;const t=((p=(d=(h=(u=n.project)==null?void 0:u.name)==null?void 0:h.value)==null?void 0:d.trim)==null?void 0:p.call(d))??"",i=t||e("project.untitled"),r=!!((f=(m=n.project)==null?void 0:m.dirty)!=null&&f.value),s=!!((y=(g=n.project)==null?void 0:g.packageDirty)!=null&&y.value),o=(((M=(_=n.sceneAssets)==null?void 0:_.value)==null?void 0:M.length)??0)>0,a=(((P=(v=(x=n.referenceImages)==null?void 0:x.items)==null?void 0:v.value)==null?void 0:P.length)??0)>0,c=(((C=(S=(E=n.workspace)==null?void 0:E.shotCameras)==null?void 0:S.value)==null?void 0:C.length)??0)>1;return{projectDisplayName:i,projectDirty:r,showProjectPackageDirty:s&&(r||o||a||c||!!t)}}const p_=1180,m_=600,f_=360,g_=1.05,y_=.9,__=.95,b_=1.05,x_=.8,v_=1.3;function Ju(n,e=.01){return Math.round(n/e)*e}function Xr(n){const e=Number(n);if(!Number.isFinite(e))return An;const t=Math.min(iy,Math.max(ny,e));return Number(Ju(t,.01).toFixed(2))}function cM(n){const e=Number(n);return Number.isFinite(e)?e.toFixed(2):Number(An).toFixed(2)}function hM({viewportWidth:n=0,screenWidth:e=0,coarsePointer:t=!1}={}){const i=Number(n);if(!Number.isFinite(i)||i<=0||!t||i>p_)return An;const r=Number(e);if(Number.isFinite(r)&&r>0){const s=i/r;if(s>g_){const o=1/s,a=Math.min(v_,Math.max(x_,o));return Number(Ju(a,.01).toFixed(2))}}return i<f_?b_:i<m_?__:y_}function uM({storage:n}={}){const e=n??Ku();if(!e)return null;try{const t=e.getItem(vo);if(!t)return null;const i=JSON.parse(t),r=i==null?void 0:i.userScale;if(r==null)return null;const s=Number(r);return Number.isFinite(s)?Xr(s):null}catch{return null}}function dM(n,{storage:e}={}){const t=e??Ku();if(t)try{if(n==null){t.removeItem(vo);return}const i=JSON.stringify({userScale:Xr(n)});t.setItem(vo,i)}catch{}}function Ku(){if(typeof window>"u")return null;try{return window.localStorage??null}catch{return null}}function w_({userScale:n=null,autoScale:e=An}={}){return n==null?Xr(e):Xr(n)}function ei(n,e=0){return Number(n).toFixed(e)}function pM(n=null){const e=f0(),t=I(e),i=I(Wy),r=I(Jy()),s=I(r.value[0].id),o=I(s0()),a=I(o.value[0].id),c=I(ay),l=I(!1),u=I(Lu),h=I(Ci),d=I(Fa),p=I(as),m=I({...li}),f=I("navigate"),g=I("world"),y=I("none"),_=I(!1),M=I(null),x=I(null),v=I(null),P=I(null),E=I(""),S=I({contextKind:"viewport",start:{visible:!1,x:0,y:0},end:{visible:!1,x:0,y:0},draftEnd:{visible:!1,x:0,y:0},lineVisible:!1,lineUsesDraft:!1,chip:{visible:!1,x:0,y:0,label:"",placement:"above"},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}),C=V(()=>y.value==="select"),k=V(()=>y.value==="reference"),A=V(()=>y.value==="pivot"),b=V(()=>y.value==="transform"),F=V(()=>y.value==="splat-edit"),z=I("box"),R=I([]),O=I([]),G=I(0),te=I(30),q=I("depth"),B=I(.2),U=I(!1),le=I({visible:!1,x:0,y:0,radiusPx:0,painting:!1,subtract:!1}),$e=I(!1),nt=I({x:0,y:0,z:0}),L=I({x:1,y:1,z:1}),X=I({x:0,y:0,z:0,w:1}),ee=I({x:null,y:null}),H=I({mode:"",hitCount:0}),T=I("empty"),D=I(!1),j=I(!1),Q=I(!1),qt=V(()=>D.value||j.value&&!Q.value),Zt=I(""),Ri=I(!1),Lt=I(null),On=I(An),Ii=I(!1),oe=V(()=>w_({userScale:Lt.value,autoScale:On.value})),be=I(null),Ne=V(()=>F0({userScale:be.value})),He=I({open:!1,x:0,y:0,hoveredActionId:null,coarse:!1,scale:1,radius:88,innerRadius:28,outerRadius:126}),cs=I({visible:!1,x:0,y:0,mmLabel:"",fovLabel:""}),hs=I({visible:!1,x:0,y:0,angleLabel:""}),Bn=I(Oe(e,"scene.badgeEmpty")),jn=I(ty),ld=I(Oe(e,"scene.summaryEmpty")),cd=I(Oe(e,"scene.scaleDefault")),Ia=I([]),Jt=I(Ou()),hd=I(Uy()),ud=I(!0),dd=I(!0),pd=I(""),md=I(""),fd=I([]),gd=I([]),yd=I([]),_d=I(0),bd=I([]),xd=I(""),vd=I(""),wd=I([]),Md=I(null),Sd=I(null),$d=I(null),kd=I([]),Da=I(null),Ed=V(()=>Ia.value.find(N=>N.id===Da.value)??null),Td=I(""),Ad=I(Oe(e,"status.ready")),Cd=I(""),Fd=I(!1),Pd=I(!0),Rd=I(null),Id=I(null),Dd=I(!1),Nd=I("getting-started"),Ld=I(null),zd=I(""),Od=I("ja"),Bd=I(!1),Na=I("export.idle"),jd=I(Oe(e,"exportSummary.empty")),Vd=I("current"),La=I([]),Ud=I(bo),za=I(xo),Hd=I(0),Gd=I(0),Wd=I(0),Xd=I(0),Yd=I(0),qd=I(0),Oa=V(()=>a0(r.value,s.value)),ie=V(()=>c0(o.value,a.value)),Zd=I(!1),Jd=I([]),Kd=I(null),Qd=I(null),ep=I(!1),tp=I(!1),np=I(!1),us=V(()=>{var N;return((N=ie.value)==null?void 0:N.frames)??[]}),ds=V(()=>{var N;return u0(us.value,((N=ie.value)==null?void 0:N.activeFrameId)??null)}),ip=V(()=>{var N;return((N=ds.value)==null?void 0:N.id)??""}),rp=V(()=>us.value.length),sp=V(()=>{var N,Y,Ge;return Aa(((N=ie.value)==null?void 0:N.frames)??[],((Ge=(Y=ie.value)==null?void 0:Y.frameMask)==null?void 0:Ge.selectedIds)??[])}),op=V(()=>Oa.value.role),ps=V(()=>{var N;return((N=ie.value)==null?void 0:N.lens.baseFovX)??su}),ms=V(()=>{var N;return((N=ie.value)==null?void 0:N.outputFrame.widthScale)??1}),fs=V(()=>{var N;return((N=ie.value)==null?void 0:N.outputFrame.heightScale)??1}),Ba=V(()=>{var N;return((N=ie.value)==null?void 0:N.outputFrame.viewZoom)??1}),ap=V(()=>{var N;return((N=ie.value)==null?void 0:N.outputFrame.anchor)??"center"}),ja=V(()=>{var N;return((N=ie.value)==null?void 0:N.clipping.mode)??"auto"}),lp=V(()=>{var N;return((N=ie.value)==null?void 0:N.clipping.near)??bo}),cp=V(()=>{var N;return((N=ie.value)==null?void 0:N.clipping.far)??xo}),hp=V(()=>lp.value),up=V(()=>ja.value==="manual"?cp.value:za.value),dp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.exportSettings)==null?void 0:Y.exportName)??""}),pp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.exportSettings)==null?void 0:Y.exportFormat)??"psd"}),mp=V(()=>{var N,Y;return!!((Y=(N=ie.value)==null?void 0:N.exportSettings)!=null&&Y.exportGridOverlay)}),fp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.exportSettings)==null?void 0:Y.exportGridLayerMode)==="overlay"?"overlay":"bottom"}),gp=V(()=>{var N,Y;return!!((Y=(N=ie.value)==null?void 0:N.exportSettings)!=null&&Y.exportModelLayers)}),yp=V(()=>{var N,Y,Ge,Vn;return!!((Y=(N=ie.value)==null?void 0:N.exportSettings)!=null&&Y.exportModelLayers)&&!!((Vn=(Ge=ie.value)==null?void 0:Ge.exportSettings)!=null&&Vn.exportSplatLayers)}),_p=V(()=>{var N,Y;return!!((Y=(N=ie.value)==null?void 0:N.navigation)!=null&&Y.rollLock)}),bp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.mode)??"off"}),xp=V(()=>{var N,Y,Ge,Vn;return Ca((Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.mode,(Vn=(Ge=ie.value)==null?void 0:Ge.frameMask)==null?void 0:Vn.preferredMode)}),vp=V(()=>{var N,Y;return Number.isFinite((Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.opacityPct)?ie.value.frameMask.opacityPct:80}),wp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.shape)??"bounds"}),Mp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.trajectoryMode)??"line"}),Sp=V(()=>{var N,Y;return((Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.trajectoryExportSource)??"none"}),$p=V(()=>{var N,Y,Ge;return((Ge=(Y=(N=ie.value)==null?void 0:N.frameMask)==null?void 0:Y.trajectory)==null?void 0:Ge.nodesByFrameId)??{}}),kp=V(()=>{var N,Y;return _a((N=ie.value)==null?void 0:N.frameMask,(Y=ds.value)==null?void 0:Y.id)}),Va=V(()=>Math.max(64,Math.round(et.width*ms.value))),Ua=V(()=>Math.max(64,Math.round(et.height*fs.value))),Ep=V(()=>`${Va.value} × ${Ua.value}`),Tp=V(()=>Jt.value.ambient),Ap=V(()=>Jt.value.modelLight.enabled),Cp=V(()=>Jt.value.modelLight.intensity),Fp=V(()=>Jt.value.modelLight.azimuthDeg),Pp=V(()=>Jt.value.modelLight.elevationDeg),Rp=V(()=>La.value.length),Ip=V(()=>Oe(t.value,p0(Oa.value))),Dp=V(()=>Oe(t.value,Na.value)),Np=V(()=>`${ei(Mo(ps.value),1)}°`),Lp=V(()=>Number(pc(ps.value).toFixed(2))),zp=V(()=>`${ei(Mo(c.value),1)}°`),Op=V(()=>Number(pc(c.value).toFixed(2))),Bp=V(()=>`${ei(ms.value*100,0)}%`),jp=V(()=>`${ei(fs.value*100,0)}%`),Vp=V(()=>`${ei(Ba.value*100,0)}%`);return{runtime:n,locale:t,workspace:{layout:i,panes:r,activePaneId:s,shotCameras:o,activeShotCameraId:a,activeShotCamera:ie},workbenchCollapsed:qt,workbenchManualCollapsed:D,workbenchAutoCollapsed:j,workbenchManualExpanded:Q,viewportPieMenu:He,viewportLensHud:cs,viewportRollHud:hs,interactionMode:f,viewportBaseFovX:c,viewportBaseFovXDirty:l,viewportProjectionMode:u,viewportOrthoView:h,viewportOrthoSize:d,viewportOrthoDistance:p,viewportOrthoFocus:m,viewportToolMode:y,viewportTransformSpace:g,viewportSelectMode:C,viewportReferenceImageEditMode:k,viewportPivotEditMode:A,viewportTransformMode:b,viewportSplatEditMode:F,splatEdit:{active:F,tool:z,scopeAssetIds:R,rememberedScopeAssetIds:O,selectionCount:G,brushSize:te,brushDepthMode:q,brushDepth:B,brushDepthBarVisible:U,brushPreview:le,boxPlaced:$e,boxCenter:nt,boxSize:L,boxRotation:X,hudPosition:ee,lastOperation:H,lodStatus:T},measurement:{active:_,startPointWorld:M,endPointWorld:x,draftEndPointWorld:v,selectedPointKey:P,lengthInputText:E,overlay:S},mode:op,baseFovX:ps,renderBox:{widthScale:ms,heightScale:fs,viewZoom:Ba,anchor:ap},shotCamera:{clippingMode:ja,near:hp,far:up,nearLive:Ud,farLive:za,positionX:Hd,positionY:Gd,positionZ:Wd,yawDeg:Xd,pitchDeg:Yd,rollDeg:qd,rollLock:_p,exportName:dp,exportFormat:pp,exportGridOverlay:mp,exportGridLayerMode:fp,exportModelLayers:gp,exportSplatLayers:yp},frames:{documents:us,active:ds,activeId:ip,count:rp,selectionActive:Zd,selectedIds:Jd,selectionAnchor:Kd,selectionBoxLogical:Qd,trajectoryEditMode:ep,maskSelectedIds:sp,maskMode:bp,maskPreferredMode:xp,maskOpacityPct:vp,maskShape:wp,trajectoryMode:Mp,trajectoryExportSource:Sp,trajectoryNodeMode:kp,trajectoryNodesByFrameId:$p},history:{canUndo:tp,canRedo:np},remoteUrl:Zt,mobileUi:{active:Ri,userScale:Lt,autoScale:On,effectiveScale:oe,settingsOpen:Ii},viewportLod:{userScale:be,effectiveScale:Ne},sceneBadge:Bn,sceneUnitBadge:jn,sceneSummary:ld,sceneScaleSummary:cd,sceneAssets:Ia,lighting:{state:Jt,ambient:Tp,modelLightEnabled:Ap,modelLightIntensity:Cp,modelLightAzimuthDeg:Fp,modelLightElevationDeg:Pp},referenceImages:{document:hd,previewSessionVisible:ud,exportSessionEnabled:dd,panelPresetId:pd,panelPresetName:md,presets:fd,items:gd,assets:yd,assetCount:_d,previewLayers:bd,selectedAssetId:xd,selectedItemId:vd,selectedItemIds:wd,selectionAnchor:Md,selectionBoxLogical:Sd,selectionBoxScreen:$d},selectedSceneAssetIds:kd,selectedSceneAssetId:Da,selectedSceneAsset:Ed,cameraSummary:Td,statusLine:Ad,project:{name:Cd,dirty:Fd,packageDirty:Pd},overlay:Rd,backgroundTask:Id,help:{open:Dd,sectionId:Nd,anchor:Ld,searchQuery:zd,lang:Od},exportBusy:Bd,exportStatusKey:Na,exportStatusLabel:Dp,exportSummary:jd,exportOptions:{target:Vd,presetIds:La,presetCount:Rp},exportWidth:Va,exportHeight:Ua,exportSizeLabel:Ep,modeLabel:Ip,fovLabel:Np,equivalentMmValue:Lp,viewportFovLabel:zp,viewportEquivalentMmValue:Op,widthLabel:Bp,heightLabel:jp,zoomLabel:Vp}}function Qu(n,e){if(Array.isArray(n)){for(const t of n)if(!(!t||typeof t!="object")){if(t.type==="group"){Qu(t.fields,e);continue}typeof t.id=="string"&&(e[t.id]=t.value??"")}}}function Tc(n=[]){const e={};return Qu(n,e),e}function ed(n,e,t){if(!n||typeof n!="object")return null;const i=typeof n.disabled=="function"?!!n.disabled(e):!!n.disabled;if(n.type==="group"){if(typeof n.hidden=="function"?!!n.hidden(e):!!n.hidden)return null;const s=n.open?{open:!0}:{};return w`
			<details class="overlay-field-group" ...${s}>
				<summary class="overlay-field-group__summary">
					${n.label}
				</summary>
				<div class="overlay-field-group__body">
					${(n.fields??[]).map(o=>ed(o,e,t))}
				</div>
			</details>
		`}if(n.type==="checkbox")return w`
			<label class="overlay-checkbox-field">
				<input
					type="checkbox"
					checked=${!!e[n.id]}
					disabled=${i}
					onChange=${r=>t(s=>({...s,[n.id]:r.currentTarget.checked}))}
				/>
				<span>${n.label}</span>
			</label>
		`;if(n.type==="select")return w`
			<label class="overlay-field">
				<span>${n.label}</span>
				<select
					value=${String(e[n.id]??"")}
					disabled=${i}
					onChange=${r=>t(s=>({...s,[n.id]:r.currentTarget.value}))}
				>
					${(n.options??[]).map(r=>w`
							<option value=${r.value}>${r.label}</option>
						`)}
				</select>
			</label>
		`;if(n.type==="radio"){const r=String(e[n.id]??"");return w`
			<fieldset
				class="overlay-field overlay-field--radio"
				disabled=${i}
			>
				<legend>${n.label}</legend>
				${(n.options??[]).map(s=>{const o=!!s.disabled||i;return w`
						<label
							class=${`overlay-radio-option ${o?"overlay-radio-option--disabled":""}`}
						>
							<input
								type="radio"
								name=${n.id}
								value=${s.value}
								checked=${r===s.value}
								disabled=${o}
								onChange=${a=>{const c=a.currentTarget.value;t(l=>({...l,[n.id]:c}))}}
							/>
							<span class="overlay-radio-option__body">
								<span class="overlay-radio-option__label">
									${s.label}
								</span>
								${s.hint?w`
											<span class="overlay-radio-option__hint">
												${s.hint}
											</span>
										`:null}
							</span>
						</label>
					`})}
			</fieldset>
		`}return w`
		<label class="overlay-field">
			<span>${n.label}</span>
			<input
				type=${n.type??"text"}
				value=${String(e[n.id]??"")}
				disabled=${i}
				onInput=${r=>t(s=>({...s,[n.id]:r.currentTarget.value}))}
			/>
		</label>
	`}function M_(n,e,t){var i;return(i=n==null?void 0:n.fields)!=null&&i.length?w`
		<div class="overlay-field-list">
			${n.fields.map(r=>ed(r,e,t))}
		</div>
	`:null}function S_(n,e={},t=!1){var i;return(i=n==null?void 0:n.actions)!=null&&i.length?w`
		<div class="overlay-card__actions">
			${n.actions.map(r=>w`
					<button
						type="button"
						class=${r.primary?"button button--primary":"button"}
						disabled=${!!r.disabled||t}
						onClick=${async()=>{var s,o;if(r.submit){await((s=n.onSubmit)==null?void 0:s.call(n,e));return}await((o=r.onClick)==null?void 0:o.call(r,e))}}
					>
						${r.label}
					</button>
				`)}
		</div>
	`:null}function $_(n){if(!Number.isFinite(n)||n<0)return"";if(n<60)return`${n}s`;const e=Math.floor(n/60),t=n%60;return`${e}m ${String(t).padStart(2,"0")}s`}function k_(n,e=Date.now()){var a,c,l,u;const t=((a=n.steps)==null?void 0:a.length)??0,i=((c=n.steps)==null?void 0:c.filter(h=>h.status==="done").length)??0,r=t>0?(i+.5)/t*100:null,s=n.startedAt?Math.max(0,Math.floor((e-n.startedAt)/1e3)):null,o=(Math.floor(e/400)%3+1).toString();return w`
		${r!=null&&w`
				<div
					class="overlay-progress"
					role="progressbar"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow=${Math.round(r)}
				>
					<div
						class="overlay-progress__fill"
						style=${`width:${r}%`}
					></div>
				</div>
			`}
		${n.detail&&w`<p class="overlay-card__detail">${n.detail}</p>`}
		${n.phaseLabel&&w`
				<div class="overlay-phase">
					<div class="overlay-phase__header">
						<strong class="overlay-phase__title">${n.phaseLabel}</strong>
						${n.phaseDetail&&w`
								<span class="overlay-phase__detail">${n.phaseDetail}</span>
							`}
					</div>
					${((l=n.phases)==null?void 0:l.length)>0&&w`
							<ol class="overlay-phase-list">
								${n.phases.map(h=>w`
										<li class=${`overlay-phase-step overlay-phase-step--${h.status}`}>
											<span class="overlay-phase-step__marker" aria-hidden="true"></span>
											<span class="overlay-phase-step__label">${h.label}</span>
										</li>
									`)}
							</ol>
						`}
				</div>
			`}
		${s!=null&&w`
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
						${$_(s)}
					</span>
				</div>
			`}
		${((u=n.steps)==null?void 0:u.length)>0&&w`
				<ol class="overlay-step-list">
					${n.steps.map(h=>w`
							<li class=${`overlay-step overlay-step--${h.status}`}>
								<span class="overlay-step__label">${h.label}</span>
							</li>
						`)}
				</ol>
			`}
	`}function E_(n){var e,t;return!n.detail&&!((e=n.urls)!=null&&e.length)?null:w`
		<details class="overlay-card__details">
			<summary>${n.detailLabel||"Details"}</summary>
			${((t=n.urls)==null?void 0:t.length)>0&&w`
					<ul class="overlay-url-list">
						${n.urls.map(i=>w`
								<li>
									<code>${i}</code>
								</li>
							`)}
					</ul>
				`}
			${n.detail&&w`<pre class="overlay-card__error-detail">${n.detail}</pre>`}
		</details>
	`}function mM({overlay:n}){var c;const[e,t]=ge(Tc(n==null?void 0:n.fields)),[i,r]=ge(!1),[s,o]=ge(()=>Date.now());if(Re(()=>{t(Tc(n==null?void 0:n.fields)),r(!1)},[n]),Re(()=>{if((n==null?void 0:n.kind)!=="progress"||!(n!=null&&n.startedAt))return;const l=globalThis.setInterval(()=>{o(Date.now())},400);return()=>globalThis.clearInterval(l)},[n==null?void 0:n.kind,n==null?void 0:n.startedAt]),!n)return null;const a={...n,onSubmit:typeof n.onSubmit=="function"?async l=>{r(!0);try{await n.onSubmit(l)}finally{r(!1)}}:null};return w`
		<div class="app-overlay" role="presentation">
			<div
				class="overlay-card"
				role=${n.kind==="error"?"alertdialog":"dialog"}
				aria-modal="true"
			>
				<div class="overlay-card__header">
					<h2>${n.title}</h2>
				</div>
				${n.message&&w`<p class="overlay-card__message">${n.message}</p>`}
				${n.kind==="confirm"&&((c=n.urls)==null?void 0:c.length)>0&&w`
						<ul class="overlay-url-list">
							${n.urls.map(l=>w`
									<li>
										<code>${l}</code>
									</li>
								`)}
						</ul>
					`}
				${M_(n,e,t)}
				${n.kind==="progress"?k_(n,s):null}
				${n.kind==="error"?E_(n):null}
				${S_(a,e,i)}
			</div>
		</div>
	`}const T_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.9 8.7L9.4 6.1l4.5 2.6v5.4l-4.5 2.6-4.5-2.6zM9.4 6.1v10.6M4.9 8.7l4.5 2.6 4.5-2.6M11.8 14.8l3 3 6-6" />
    </g>
</svg>
`,A_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g transform="translate(-1.2 1.5) scale(1.5)">
      <path d="M2 6C2 4.89543 2.89543 4 4 4H8.66667C9.77124 4 10.6667 4.89543 10.6667 6V10C10.6667 11.1046 9.77124 12 8.66667 12H4C2.89543 12 2 11.1046 2 10V6ZM4 5.33333C3.63181 5.33333 3.33333 5.63181 3.33333 6V10C3.33333 10.3682 3.63181 10.6667 4 10.6667H8.66667C9.03486 10.6667 9.33333 10.3682 9.33333 10V6C9.33333 5.63181 9.03486 5.33333 8.66667 5.33333H4Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" />
      <path d="M12.8153 4.92867C12.7625 4.95108 12.7139 4.98191 12.6678 5.01591L11.3333 6V10L12.6678 10.9841C12.7139 11.0181 12.7625 11.0489 12.8153 11.0713C13.6837 11.4404 14.6667 10.8048 14.6667 9.84262V6.15738C14.6667 5.19521 13.6837 4.55957 12.8153 4.92867Z" fill="currentColor" stroke="none" />
    </g>
</svg>
`,C_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
      <path d="M7 8.5h10M7 12h10M7 15.5h6" />
      <path d="M14.5 18.5l2.5-2.5" />
      <circle cx="18.2" cy="16.8" r="2.3" />
    </g>
</svg>
`,F_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,P_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g transform="translate(-1.2 1.5) scale(1.5)">
      <path d="M2 6C2 4.89543 2.89543 4 4 4H8.66667C9.77124 4 10.6667 4.89543 10.6667 6V10C10.6667 11.1046 9.77124 12 8.66667 12H4C2.89543 12 2 11.1046 2 10V6ZM4 5.33333C3.63181 5.33333 3.33333 5.63181 3.33333 6V10C3.33333 10.3682 3.63181 10.6667 4 10.6667H8.66667C9.03486 10.6667 9.33333 10.3682 9.33333 10V6C9.33333 5.63181 9.03486 5.33333 8.66667 5.33333H4Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" />
      <path d="M12.8153 4.92867C12.7625 4.95108 12.7139 4.98191 12.6678 5.01591L11.3333 6V10L12.6678 10.9841C12.7139 11.0181 12.7625 11.0489 12.8153 11.0713C13.6837 11.4404 14.6667 10.8048 14.6667 9.84262V6.15738C14.6667 5.19521 13.6837 4.55957 12.8153 4.92867Z" fill="currentColor" stroke="none" />
    </g>
</svg>
`,R_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 5l-6 7 6 7" />
    </g>
</svg>
`,I_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 5l6 7-6 7" />
    </g>
</svg>
`,D_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.8 1.8" />
    </g>
</svg>
`,N_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 6l12 12M18 6l-12 12" />
    </g>
</svg>
`,L_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="7" width="8" height="10" rx="1.5" />
      <path d="M13 12h3.5M15.2 9.8l2.3 2.2-2.3 2.2M15.5 8.5h3l1.6-1.6h1.4v10.2h-1.4L18.5 15.5h-3" />
      <circle cx="18.3" cy="12" r="1.5" />
    </g>
</svg>
`,z_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.8 12H5.3M6.8 9.8L4.5 12l2.3 2.2M4.8 8.5h3l1.6-1.6h1.4v10.2H9.4L7.8 15.5h-3" />
      <circle cx="7.7" cy="12" r="1.5" />
      <rect x="12.5" y="7" width="8" height="10" rx="1.5" />
    </g>
</svg>
`,O_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 4.5l7.2 16.8 2.2-6.1 6.1-2.2-15.5-8.5z" />
    </g>
</svg>
`,B_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
    </g>
</svg>
`,j_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v11M8.5 10.5L12 14l3.5-3.5M5 21h14M7.5 17.5v3.5M16.5 17.5v3.5" />
  </g>
</svg>
`,V_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M7 5.5h6.5a2 2 0 0 1 2 2V9" />
  <path d="M7 18.5h6.5a2 2 0 0 0 2-2V15" />
  <path d="M7 5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2" />
  <path d="M10.5 12H20" />
  <path d="m16.5 8.5 3.5 3.5-3.5 3.5" />
</svg>
`,U_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3l18 18M10.6 5.2A11.7 11.7 0 0 1 12 5c6.2 0 10 7 10 7a18.3 18.3 0 0 1-4 4.8M6.1 6.1C3.6 8 2 12 2 12s3.8 7 10 7c1.7 0 3.3-.5 4.7-1.2M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </g>
</svg>
`,H_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </g>
</svg>
`,G_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 8.5h6l2 2H21v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h3" />
    </g>
</svg>
`,W_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,X_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 9h16M4 15h16" />
    </g>
</svg>
`,Y_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="currentColor" stroke="none">
      <circle cx="9" cy="7.5" r="0.9" />
      <circle cx="15" cy="7.5" r="0.9" />
      <circle cx="9" cy="12" r="0.9" />
      <circle cx="15" cy="12" r="0.9" />
      <circle cx="9" cy="16.5" r="0.9" />
      <circle cx="15" cy="16.5" r="0.9" />
    </g>
</svg>
`,q_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <path d="M9.2 9.5a2.8 2.8 0 1 1 4.1 2.3c-0.9 0.5-1.4 1.2-1.4 2.4"/>
  <circle cx="12" cy="17.4" r="0.6" fill="currentColor" stroke="none"/>
</svg>
`,Z_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15 16 10 5 21" />
    </g>
</svg>
`,J_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
      <path d="M19 12h2" />
      <path d="M3 12h2" />
    </g>
</svg>
`,K_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.2 2.2M16.6 16.6l2.2 2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2" />
    </g>
</svg>
`,Q_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.5 14.5l5-5M7.8 9.2l-1.9 1.9a3.5 3.5 0 0 0 5 5l1.9-1.9M16.2 14.8l1.9-1.9a3.5 3.5 0 0 0-5-5l-1.9 1.9" />
    </g>
</svg>
`,eb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="11" width="11" height="8" rx="2" />
      <path d="M15 11V8.5a3 3 0 0 0-5.4-1.8" />
    </g>
</svg>
`,tb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="11" width="11" height="8" rx="2" />
      <path d="M9 11V8.5a3 3 0 0 1 6 0V11" />
    </g>
</svg>
`,nb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M7.7 8.6h8.6v6.8h-8.6z" fill="currentColor" stroke="none" fill-rule="evenodd" />
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5.6 8v8M18.4 8v8" />
    </g>
</svg>
`,ib=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M5.9 8.3h5.2v7.4h-5.2z M12.9 8.3h5.2v7.4h-5.2z" fill="currentColor" stroke="none" fill-rule="evenodd" />
</svg>
`,rb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M7 8.1h10v7.8h-10z" fill="currentColor" stroke="none" fill-rule="evenodd" />
</svg>
`,sb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
</svg>
`,ob=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v18M3 12h18M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2M3 12l2-2M3 12l2 2M21 12l-2-2M21 12l-2 2" />
    </g>
</svg>
`,ab=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5zM4 7.5V16.5L12 21l8-4.5V7.5M12 12v9M8.5 5.8L12 7.8l3.5-2" />
    </g>
</svg>
`,lb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5zM4 7.5V16.5L12 21l8-4.5V7.5M12 12v9" />
    </g>
</svg>
`,cb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3.5v3M20.5 12h-3M12 20.5v-3M3.5 12h3M17.8 6.2l-2.1 2.1M17.8 17.8l-2.1-2.1M6.2 17.8l2.1-2.1M6.2 6.2l2.1 2.1" />
    </g>
</svg>
`,hb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 5h8M10 5v5l-2 3h8l-2-3V5M12 13v6" />
    </g>
</svg>
`,ub=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3M12 21v-2M19 12h2M3 12h2" />
    </g>
</svg>
`,db=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12h14" />
    </g>
</svg>
`,pb=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 7L19 11L15 15" />
  <path d="M19 11H11C7.134 11 4 14.134 4 18C4 18.682 4.098 19.341 4.28 19.964" />
</svg>
`,mb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,fb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,gb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,yb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <path d="M5 10h14" />
      <path d="M9 6v12" />
      <circle cx="5" cy="6" r="1.25" />
      <circle cx="19" cy="18" r="1.25" />
    </g>
</svg>
`,_b=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </g>
</svg>
`,bb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18.2 9.3A7.5 7.5 0 1 0 19.2 12.8M18.2 5.2v3.9h-3.9" />
    </g>
</svg>
`,xb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g transform="rotate(-45 12 12)">
    <rect x="3.2" y="8.15" width="17.6" height="7.7" rx="0.72" />
    <path d="M5.75 8.15v4.65M8.75 8.15v2.85M11.75 8.15v4.65M14.75 8.15v2.85M17.75 8.15v4.65" />
  </g>
</svg>
`,vb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 4h12l2 2v14H5zM8 4v5h7V4" />
      <rect x="8" y="14" width="8" height="5" rx="1" />
    </g>
</svg>
`,wb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3.5l7 4-7 4-7-4 7-4z" />
      <path d="M5 11.5l7 4 7-4" />
      <path d="M5 15.5l7 4 7-4" />
    </g>
</svg>
`,Mb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" />
    </g>
</svg>
`,Sb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,$b=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3.1"/>
  <path d="M19.4 13.9l1.8 1.4-2 3.4-2.2-0.6a7.9 7.9 0 0 1-1.7 1l-0.3 2.3h-4l-0.3-2.3a7.9 7.9 0 0 1-1.7-1l-2.2 0.6-2-3.4 1.8-1.4a8 8 0 0 1 0-1.8L4.8 10.1l2-3.4 2.2 0.6a7.9 7.9 0 0 1 1.7-1l0.3-2.3h4l0.3 2.3a7.9 7.9 0 0 1 1.7 1l2.2-0.6 2 3.4-1.8 1.4a8 8 0 0 1 0 1.8z"/>
</svg>
`,kb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M7 17l10-10" />
    </g>
</svg>
`,Eb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 12h8l1-12M10 11v5M14 11v5" />
    </g>
</svg>
`,Tb=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 7L5 11L9 15" />
  <path d="M5 11H13C16.866 11 20 14.134 20 18C20 18.682 19.902 19.341 19.72 19.964" />
</svg>
`,Ab=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3.5" />
    </g>
</svg>
`,Cb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9.5h17M8.5 5v14" />
    </g>
</svg>
`,Fb=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10.5" cy="10.5" r="5" />
      <path d="M14.2 14.2L19.5 19.5" />
      <path d="M10.5 8v5" />
      <path d="M8 10.5h5" />
    </g>
</svg>
`,Ac="workbench-icon-sprite-host";let to=null,no="",Cc=!1;function Pb(){return to||(to=Object.assign({"./svg/apply-transform.svg":T_,"./svg/camera-dslr.svg":A_,"./svg/camera-frames.svg":C_,"./svg/camera-property.svg":F_,"./svg/camera.svg":P_,"./svg/chevron-left.svg":R_,"./svg/chevron-right.svg":I_,"./svg/clock.svg":D_,"./svg/close.svg":N_,"./svg/copy-to-camera.svg":L_,"./svg/copy-to-viewport.svg":z_,"./svg/cursor.svg":O_,"./svg/duplicate.svg":B_,"./svg/export-tab.svg":j_,"./svg/export.svg":V_,"./svg/eye-off.svg":U_,"./svg/eye.svg":H_,"./svg/folder-open.svg":G_,"./svg/frame-plus.svg":W_,"./svg/frame.svg":X_,"./svg/grip.svg":Y_,"./svg/help.svg":q_,"./svg/image.svg":Z_,"./svg/lens.svg":J_,"./svg/light.svg":K_,"./svg/link.svg":Q_,"./svg/lock-open.svg":eb,"./svg/lock.svg":tb,"./svg/mask-all.svg":nb,"./svg/mask-selected.svg":ib,"./svg/mask.svg":rb,"./svg/menu.svg":sb,"./svg/move.svg":ob,"./svg/package-open.svg":ab,"./svg/package.svg":lb,"./svg/pie-menu.svg":cb,"./svg/pin.svg":hb,"./svg/pivot.svg":ub,"./svg/plus.svg":db,"./svg/redo.svg":pb,"./svg/reference-preview-off.svg":mb,"./svg/reference-preview-on.svg":fb,"./svg/reference-tool.svg":gb,"./svg/reference.svg":yb,"./svg/render-box.svg":_b,"./svg/reset.svg":bb,"./svg/ruler.svg":xb,"./svg/save.svg":vb,"./svg/scene.svg":wb,"./svg/scrub.svg":Mb,"./svg/selection-clear.svg":Sb,"./svg/settings.svg":$b,"./svg/slash-circle.svg":kb,"./svg/trash.svg":Eb,"./svg/undo.svg":Tb,"./svg/view.svg":Ab,"./svg/viewport.svg":Cb,"./svg/zoom.svg":Fb})),to}function Oo(n){return String(n).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function Rb(n){const e=n.match(/\/([^/]+)\.svg$/i);return e?e[1]:null}function Ib(n=""){var r;let e=n.replace(/\s+xmlns(?::[\w-]+)?=(["']).*?\1/gi,"").replace(/\s+width=(["']).*?\1/gi,"").replace(/\s+height=(["']).*?\1/gi,"").replace(/\s+viewBox=(["']).*?\1/gi,"").replace(/\s+aria-hidden=(["']).*?\1/gi,"").replace(/\s+focusable=(["']).*?\1/gi,"");const t=e.match(/\sstroke-width=(["'])(.*?)\1/i),i=((r=t==null?void 0:t[2])==null?void 0:r.trim())||"1.8";return e=e.replace(/\sstroke-width=(["']).*?\1/gi,` stroke-width="var(--workbench-icon-stroke-width, ${Oo(i)})"`),/\sfill=/i.test(e)||(e+=' fill="none"'),/\sstroke=/i.test(e)||(e+=' stroke="currentColor"'),/\sstroke-width=/i.test(e)||(e+=' stroke-width="var(--workbench-icon-stroke-width, 1.8)"'),/\sstroke-linecap=/i.test(e)||(e+=' stroke-linecap="round"'),/\sstroke-linejoin=/i.test(e)||(e+=' stroke-linejoin="round"'),e.trim()}function Db(n,e){const t=e.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);if(!t)return"";const[,i,r]=t,s=i.match(/\sviewBox=(["'])(.*?)\1/i),o=(s==null?void 0:s[2])||"0 0 24 24",a=Ib(i);return`<symbol id="${Oo(n)}" viewBox="${Oo(o)}"${a?` ${a}`:""}>${r.trim()}</symbol>`}function Nb(){return`<svg xmlns="http://www.w3.org/2000/svg">${Object.entries(Pb()).map(([e,t])=>[Rb(e),t]).filter(([e,t])=>!!e&&typeof t=="string").map(([e,t])=>Db(e,t)).filter(Boolean).join("")}</svg>`}function Lb(){if(Cc||typeof document>"u")return;no||(no=Nb());let n=document.getElementById(Ac);n||(n=document.createElement("div"),n.id=Ac,n.setAttribute("aria-hidden","true"),n.style.position="absolute",n.style.width="0",n.style.height="0",n.style.overflow="hidden",n.style.pointerEvents="none",n.style.opacity="0",n.innerHTML=no,document.body.prepend(n)),Cc=!0}function _e({name:n,className:e="",size:t=16,strokeWidth:i=1.8}){Lb();const r=["workbench-icon"];return e&&r.push(e),w`
		<svg
			class=${r.join(" ")}
			width=${t}
			height=${t}
			viewBox="0 0 24 24"
			style=${{"--workbench-icon-stroke-width":String(i)}}
			aria-hidden="true"
			focusable="false"
		>
			<use href=${`#${n||"camera-frames"}`}></use>
		</svg>
	`}function zb(n,e){for(var t in e)n[t]=e[t];return n}function Fc(n,e){for(var t in n)if(t!=="__source"&&!(t in e))return!0;for(var i in e)if(i!=="__source"&&n[i]!==e[i])return!0;return!1}function Pc(n,e){this.props=n,this.context=e}(Pc.prototype=new it).isPureReactComponent=!0,Pc.prototype.shouldComponentUpdate=function(n,e){return Fc(this.props,n)||Fc(this.state,e)};var Rc=J.__b;J.__b=function(n){n.type&&n.type.__f&&n.ref&&(n.props.ref=n.ref,n.ref=null),Rc&&Rc(n)};var Ob=J.__e;J.__e=function(n,e,t,i){if(n.then){for(var r,s=e;s=s.__;)if((r=s.__c)&&r.__c)return e.__e==null&&(e.__e=t.__e,e.__k=t.__k),r.__c(n,e)}Ob(n,e,t,i)};var Ic=J.unmount;function td(n,e,t){return n&&(n.__c&&n.__c.__H&&(n.__c.__H.__.forEach(function(i){typeof i.__c=="function"&&i.__c()}),n.__c.__H=null),(n=zb({},n)).__c!=null&&(n.__c.__P===t&&(n.__c.__P=e),n.__c.__e=!0,n.__c=null),n.__k=n.__k&&n.__k.map(function(i){return td(i,e,t)})),n}function nd(n,e,t){return n&&t&&(n.__v=null,n.__k=n.__k&&n.__k.map(function(i){return nd(i,e,t)}),n.__c&&n.__c.__P===e&&(n.__e&&t.appendChild(n.__e),n.__c.__e=!0,n.__c.__P=t)),n}function io(){this.__u=0,this.o=null,this.__b=null}function id(n){var e=n.__&&n.__.__c;return e&&e.__a&&e.__a(n)}function yr(){this.i=null,this.l=null}J.unmount=function(n){var e=n.__c;e&&(e.__z=!0),e&&e.__R&&e.__R(),e&&32&n.__u&&(n.type=null),Ic&&Ic(n)},(io.prototype=new it).__c=function(n,e){var t=e.__c,i=this;i.o==null&&(i.o=[]),i.o.push(t);var r=id(i.__v),s=!1,o=function(){s||i.__z||(s=!0,t.__R=null,r?r(c):c())};t.__R=o;var a=t.__P;t.__P=null;var c=function(){if(!--i.__u){if(i.state.__a){var l=i.state.__a;i.__v.__k[0]=nd(l,l.__c.__P,l.__c.__O)}var u;for(i.setState({__a:i.__b=null});u=i.o.pop();)u.__P=a,u.forceUpdate()}};i.__u++||32&e.__u||i.setState({__a:i.__b=i.__v.__k[0]}),n.then(o,o)},io.prototype.componentWillUnmount=function(){this.o=[]},io.prototype.render=function(n,e){if(this.__b){if(this.__v.__k){var t=document.createElement("div"),i=this.__v.__k[0].__c;this.__v.__k[0]=td(this.__b,t,i.__O=i.__P)}this.__b=null}var r=e.__a&&kn(Ut,null,n.fallback);return r&&(r.__u&=-33),[kn(Ut,null,e.__a?null:n.children),r]};var Dc=function(n,e,t){if(++t[1]===t[0]&&n.l.delete(e),n.props.revealOrder&&(n.props.revealOrder[0]!=="t"||!n.l.size))for(t=n.i;t;){for(;t.length>3;)t.pop()();if(t[1]<t[0])break;n.i=t=t[2]}};function Bb(n){return this.getChildContext=function(){return n.context},n.children}function jb(n){var e=this,t=n.h;if(e.componentWillUnmount=function(){Ya(null,e.v),e.v=null,e.h=null},e.h&&e.h!==t&&e.componentWillUnmount(),!e.v){for(var i=e.__v;i!==null&&!i.__m&&i.__!==null;)i=i.__;e.h=t,e.v={nodeType:1,parentNode:t,childNodes:[],__k:{__m:i.__m},contains:function(){return!0},namespaceURI:t.namespaceURI,insertBefore:function(r,s){this.childNodes.push(r),e.h.insertBefore(r,s)},removeChild:function(r){this.childNodes.splice(this.childNodes.indexOf(r)>>>1,1),e.h.removeChild(r)}}}Ya(kn(Bb,{context:e.context},n.__v),e.v)}function rd(n,e){var t=kn(jb,{__v:n,h:e});return t.containerInfo=e,t}(yr.prototype=new it).__a=function(n){var e=this,t=id(e.__v),i=e.l.get(n);return i[0]++,function(r){var s=function(){e.props.revealOrder?(i.push(r),Dc(e,n,i)):r()};t?t(s):s()}},yr.prototype.render=function(n){this.i=null,this.l=new Map;var e=Tr(n.children);n.revealOrder&&n.revealOrder[0]==="b"&&e.reverse();for(var t=e.length;t--;)this.l.set(e[t],this.i=[1,0,this.i]);return n.children},yr.prototype.componentDidUpdate=yr.prototype.componentDidMount=function(){var n=this;this.l.forEach(function(e,t){Dc(n,t,e)})};var Vb=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.element")||60103,Ub=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,Hb=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Gb=/[A-Z0-9]/g,Wb=typeof document<"u",Xb=function(n){return(typeof Symbol<"u"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(n)};it.prototype.isReactComponent=!0,["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(n){Object.defineProperty(it.prototype,n,{configurable:!0,get:function(){return this["UNSAFE_"+n]},set:function(e){Object.defineProperty(this,n,{configurable:!0,writable:!0,value:e})}})});var Nc=J.event;J.event=function(n){return Nc&&(n=Nc(n)),n.persist=function(){},n.isPropagationStopped=function(){return this.cancelBubble},n.isDefaultPrevented=function(){return this.defaultPrevented},n.nativeEvent=n};var Yb={configurable:!0,get:function(){return this.class}},Lc=J.vnode;J.vnode=function(n){typeof n.type=="string"&&(function(e){var t=e.props,i=e.type,r={},s=i.indexOf("-")==-1;for(var o in t){var a=t[o];if(!(o==="value"&&"defaultValue"in t&&a==null||Wb&&o==="children"&&i==="noscript"||o==="class"||o==="className")){var c=o.toLowerCase();o==="defaultValue"&&"value"in t&&t.value==null?o="value":o==="download"&&a===!0?a="":c==="translate"&&a==="no"?a=!1:c[0]==="o"&&c[1]==="n"?c==="ondoubleclick"?o="ondblclick":c!=="onchange"||i!=="input"&&i!=="textarea"||Xb(t.type)?c==="onfocus"?o="onfocusin":c==="onblur"?o="onfocusout":Hb.test(o)&&(o=c):c=o="oninput":s&&Ub.test(o)?o=o.replace(Gb,"-$&").toLowerCase():a===null&&(a=void 0),c==="oninput"&&r[o=c]&&(o="oninputCapture"),r[o]=a}}i=="select"&&(r.multiple&&Array.isArray(r.value)&&(r.value=Tr(t.children).forEach(function(l){l.props.selected=r.value.indexOf(l.props.value)!=-1})),r.defaultValue!=null&&(r.value=Tr(t.children).forEach(function(l){l.props.selected=r.multiple?r.defaultValue.indexOf(l.props.value)!=-1:r.defaultValue==l.props.value}))),t.class&&!t.className?(r.class=t.class,Object.defineProperty(r,"className",Yb)):t.className&&(r.class=r.className=t.className),e.props=r})(n),n.$$typeof=Vb,Lc&&Lc(n)};var zc=J.__r;J.__r=function(n){zc&&zc(n),n.__c};var Oc=J.diffed;J.diffed=function(n){Oc&&Oc(n);var e=n.props,t=n.__e;t!=null&&n.type==="textarea"&&"value"in e&&e.value!==t.value&&(t.value=e.value==null?"":e.value)};const _r=10,Ct=10;function qb(n,e,t){let i=n.left,r=n.top;t==="left"?(i=n.left-e.width-_r,r=n.top+(n.height-e.height)*.5):t==="top"?(i=n.left+(n.width-e.width)*.5,r=n.top-e.height-_r):t==="bottom"?(i=n.left+(n.width-e.width)*.5,r=n.bottom+_r):(i=n.right+_r,r=n.top+(n.height-e.height)*.5);const s=window.innerWidth-e.width-Ct,o=window.innerHeight-e.height-Ct;return{left:Math.min(Math.max(i,Ct),Math.max(Ct,s)),top:Math.min(Math.max(r,Ct),Math.max(Ct,o))}}function he({title:n,description:e="",shortcut:t="",placement:i="right"}){const r=we(null),s=we(null),[o,a]=ge(!1),[c,l]=ge({left:`${Ct}px`,top:`${Ct}px`,visibility:"hidden"});if(!n&&!e&&!t)return null;Re(()=>{var M;const h=(M=r.current)==null?void 0:M.parentElement;if(!h)return;const d=()=>a(!0),p=()=>a(!1),m=()=>a(!1),f=()=>a(!1),g=()=>a(!0),y=x=>{h.contains(x.relatedTarget)||a(!1)},_=x=>{x.key==="Escape"&&a(!1)};return h.addEventListener("mouseenter",d),h.addEventListener("mouseleave",p),h.addEventListener("pointerdown",m,!0),h.addEventListener("click",f,!0),h.addEventListener("focusin",g),h.addEventListener("focusout",y),h.addEventListener("keydown",_),()=>{h.removeEventListener("mouseenter",d),h.removeEventListener("mouseleave",p),h.removeEventListener("pointerdown",m,!0),h.removeEventListener("click",f,!0),h.removeEventListener("focusin",g),h.removeEventListener("focusout",y),h.removeEventListener("keydown",_)}},[]),Re(()=>{if(!o)return;const h=()=>{var _;const d=(_=r.current)==null?void 0:_.parentElement,p=s.current;if(!d||!p)return;const m=d.getBoundingClientRect(),f=p.getBoundingClientRect(),{left:g,top:y}=qb(m,f,i);l({left:`${g}px`,top:`${y}px`,visibility:"visible"})};return h(),window.addEventListener("resize",h),window.addEventListener("scroll",h,!0),()=>{window.removeEventListener("resize",h),window.removeEventListener("scroll",h,!0)}},[o,i]);const u=o&&typeof document<"u"?rd(w`
						<span
							ref=${s}
							class="workbench-tooltip workbench-tooltip--visible"
							style=${c}
						>
							${n&&w`<strong class="workbench-tooltip__title">${n}</strong>`}
							${e&&w`
									<span class="workbench-tooltip__description"
										>${e}</span
									>
								`}
							${t&&w`
									<span class="workbench-tooltip__shortcut">
										<kbd>${t}</kbd>
									</span>
								`}
						</span>
					`,document.body):null;return w`
		<span ref=${r} class="workbench-tooltip-anchor" aria-hidden="true"></span>
		${u}
	`}function Zb({icon:n,title:e,children:t}){return w`
		<div class="section-heading">
			<div class="section-heading__title">
				${n&&w`
						<span class="section-heading__icon">
							<${_e} name=${n} size=${14} />
						</span>
					`}
				<h2>${e}</h2>
			</div>
			${t&&w`<div class="section-heading__meta">${t}</div>`}
		</div>
	`}function Jb({tabs:n,activeTab:e,setActiveTab:t,ariaLabel:i,iconOnly:r=!1}){return w`
		<div class="workbench-tabs" role="tablist" aria-label=${i}>
			${n.map(s=>{var o,a,c,l;return w`
					<button
						key=${s.id}
						type="button"
						role="tab"
						aria-selected=${e===s.id}
						class=${e===s.id?"workbench-tab workbench-tab--active workbench-tab--tooltip":"workbench-tab workbench-tab--tooltip"}
						onClick=${()=>t(s.id)}
					>
						<span class="workbench-tab__content">
							${s.icon&&w`
								<span class="workbench-tab__icon">
									<${_e}
										name=${s.icon}
										size=${r?17:14}
									/>
								</span>
							`}
							${!r&&w`<span>${s.label}</span>`}
						</span>
						<${he}
							title=${((o=s.tooltip)==null?void 0:o.title)??s.label}
							description=${((a=s.tooltip)==null?void 0:a.description)??""}
							shortcut=${((c=s.tooltip)==null?void 0:c.shortcut)??""}
							placement=${((l=s.tooltip)==null?void 0:l.placement)??"bottom"}
						/>
					</button>
				`})}
		</div>
	`}function Kb({icon:n="menu",label:e,items:t=[],children:i,tooltip:r=null,panelPlacement:s="down"}){const o=t.filter(Boolean),[a,c]=ge(!1),l=we(null),u=we(null),h=we(null),[d,p]=ge({left:"10px",top:"10px",visibility:"hidden"});Re(()=>{if(!a)return;const f=_=>{var x,v;const M=_.target;!((x=l.current)!=null&&x.contains(M))&&!((v=h.current)!=null&&v.contains(M))&&c(!1)},g=_=>{var x,v;const M=_.target;!((x=l.current)!=null&&x.contains(M))&&!((v=h.current)!=null&&v.contains(M))&&c(!1)},y=_=>{_.key==="Escape"&&c(!1)};return document.addEventListener("pointerdown",f,!0),document.addEventListener("focusin",g),document.addEventListener("keydown",y),()=>{document.removeEventListener("pointerdown",f,!0),document.removeEventListener("focusin",g),document.removeEventListener("keydown",y)}},[a]),Re(()=>{if(!a)return;const f=()=>{const g=u.current,y=h.current;if(!g||!y)return;const _=g.getBoundingClientRect(),M=y.getBoundingClientRect(),x=10,v=10,P=_.left+_.width*.5-M.width*.5,E=Math.max(x,window.innerWidth-M.width-x),S=Math.min(Math.max(P,x),E),C=s==="up"?_.top-M.height-v:_.bottom+v,k=Math.max(x,window.innerHeight-M.height-x),A=Math.min(Math.max(C,x),k);p({left:`${S}px`,top:`${A}px`,visibility:"visible"})};return f(),window.addEventListener("resize",f),window.addEventListener("scroll",f,!0),()=>{window.removeEventListener("resize",f),window.removeEventListener("scroll",f,!0)}},[a,s]);const m=a&&typeof document<"u"?rd(w`
						<div
							ref=${h}
							class=${s==="up"?"workbench-menu__panel workbench-menu__panel--up":"workbench-menu__panel"}
							role="menu"
							style=${{left:d.left,top:d.top,visibility:d.visibility}}
						>
							${i}
							${o.map(f=>w`
									<button
										key=${f.id??f.label}
										type="button"
										role="menuitem"
										class=${f.destructive?"workbench-menu__item workbench-menu__item--destructive":"workbench-menu__item"}
										onClick=${()=>{var g;c(!1),(g=f.onClick)==null||g.call(f)}}
									>
										${f.icon&&w`
												<span class="workbench-menu__item-icon">
													<${_e} name=${f.icon} size=${14} />
												</span>
											`}
										<span class="workbench-menu__item-label">${f.label}</span>
										${f.shortcut&&w`
												<span class="workbench-menu__item-shortcut" aria-hidden="true">
													<kbd>${f.shortcut}</kbd>
												</span>
											`}
									</button>
								`)}
						</div>
					`,document.body):null;return w`
		<div
			ref=${l}
			class=${a?"workbench-menu is-open":"workbench-menu"}
		>
			<button
				ref=${u}
				type="button"
				class="workbench-menu__trigger workbench-menu__trigger--tooltip"
				aria-label=${e}
				aria-haspopup="menu"
				aria-expanded=${a}
				onClick=${f=>{f.stopPropagation(),c(g=>!g)}}
			>
				<${_e} name=${n} size=${16} />
				<${he}
					title=${(r==null?void 0:r.title)??e}
					description=${(r==null?void 0:r.description)??""}
					shortcut=${(r==null?void 0:r.shortcut)??""}
					placement=${(r==null?void 0:r.placement)??"right"}
				/>
			</button>
			${m}
		</div>
	`}function K({icon:n,label:e,active:t=!1,compact:i=!1,disabled:r=!1,className:s="",id:o,iconSize:a=15,iconStrokeWidth:c=1.8,onClick:l,type:u="button",tooltip:h=null}){const d=f=>{f.stopPropagation()},p=f=>{f.stopPropagation(),l==null||l(f)},m=["button","button--icon","button--tooltip",i?"button--compact":"",t?"button--primary":"",s].filter(Boolean).join(" ");return w`
		<button
			id=${o}
			type=${u}
			class=${m}
			aria-label=${e}
			disabled=${r}
			onPointerDown=${d}
			onClick=${p}
		>
			<${_e}
				name=${n}
				size=${a}
				strokeWidth=${c}
			/>
			<${he}
				title=${(h==null?void 0:h.title)??e}
				description=${(h==null?void 0:h.description)??""}
				shortcut=${(h==null?void 0:h.shortcut)??""}
				placement=${(h==null?void 0:h.placement)??"bottom"}
			/>
		</button>
	`}function Yt({icon:n,label:e,children:t,open:i=!1,summaryMeta:r=null,summaryActions:s=null,helpSectionId:o=null,onOpenHelp:a=null,onToggle:c=null,className:l=""}){return w`
		<details
			class=${l?`panel-disclosure ${l}`:"panel-disclosure"}
			open=${i}
			onToggle=${u=>c==null?void 0:c(!!u.currentTarget.open)}
		>
			<summary class="panel-disclosure__summary">
				<span class="panel-disclosure__summary-main">
					${n&&w`
							<span class="panel-disclosure__icon">
								<${_e} name=${n} size=${14} />
							</span>
						`}
					<span>${e}</span>
				</span>
				<span class="panel-disclosure__summary-right">
					${o&&typeof a=="function"&&w`
							<button
								type="button"
								class="panel-disclosure__help"
								aria-label="Help"
								onClick=${u=>{u.preventDefault(),u.stopPropagation(),a(o)}}
							>
								<${_e} name="help" size=${12} />
							</button>
						`}
					${r&&w`<span class="panel-disclosure__summary-meta">${r}</span>`}
					${s&&w`
							<span class="panel-disclosure__summary-actions">
								${s}
							</span>
						`}
					<span class="panel-disclosure__chevron">
						<${_e} name="chevron-right" size=${12} />
					</span>
				</span>
			</summary>
			<div class="panel-disclosure__body">${t}</div>
		</details>
	`}function Bo(n,e){return n.find(t=>t.id===e)??null}function Bc(n,e,t){const i=Bo(n,t);if(!i)return[];const r=new Set(e??[]),s=n.filter(o=>o.kind===i.kind&&r.has(o.id)).map(o=>o.id);return s.includes(t)?s:[t]}function jc(n){const e=n.currentTarget.getBoundingClientRect();return n.clientY<e.top+e.height/2?"before":"after"}function Qb(n,e,t){if(!n||!e||n.kind!==e.kind)return null;const i=n.kindOrderIndex-1,r=e.kindOrderIndex-1;return t==="before"?i<r?r-1:r:i<r?r:r+1}function ex(n,e=!1){const t=(n==null?void 0:n.nativeEvent)??n;return!!e||(t==null?void 0:t.isComposing)===!0||(t==null?void 0:t.keyCode)===229}function tx(n=""){var i;const e=String(n??"").trim();if(!e)return null;const t=e.match(/[+-]?\d+(?:\.(\d+))?/)??e.match(/[+-]?\d*(?:\.(\d+))?/);return t?((i=t[1])==null?void 0:i.length)??0:null}function nx(n=null){if(n==null)return null;const e=String(n).trim().toLowerCase();if(!e||e.includes("e"))return null;const t=e.indexOf(".");return t>=0?e.length-t-1:0}function ix(n,{formatDisplayValue:e=null,template:t="",step:i=null}={}){if(!Number.isFinite(n))return String(n??"");if(typeof e=="function")return String(e(n));const r=String(t??""),s=Math.max(tx(r)??0,nx(i)??0),o=r.trim().startsWith("+")&&n>=0,a=Number(n).toFixed(s);return o?`+${a}`:a}function W(n){n.stopPropagation()}function Fi(n){n.preventDefault(),n.stopPropagation()}function Mi(n){return(n.ctrlKey||n.metaKey)&&(n.code==="KeyZ"||n.code==="KeyY")}function rx(n){Mi(n)||W(n)}const Yr={onPointerDown:W,onClick:W,onWheel:Fi,onKeyDown:rx},sx=Object.freeze({normal:1,shift:.25,alt:.1,altShift:.025}),Vc=12,Uc=84,Hc=.55,ox=90,ax=1;function sd({value:n,title:e="",className:t=""}){return w`
		<span class=${`numeric-unit__label ${t}`.trim()} aria-label=${e||n}
			>${n}</span
		>
	`}const jo=132,Ft=46,Ce=jo/2,lx=16,Gc=90/Ft;function od(n=null){return{...sx,...n??{}}}function $n(n){const e=Number(n);if(!Number.isFinite(e))return 0;const t=((e+180)%360+360)%360-180;return t===-180?180:t}function cx(n){return Math.max(-1,Math.min(1,n))}function hx(n,e){const t=Number(n)*Math.PI/180,i=Number(e)*Math.PI/180,r=Math.cos(i);return{x:Math.sin(t)*r,y:Math.sin(i),z:Math.cos(t)*r}}function ux(n){const e=Math.hypot(n.x,n.y,n.z);return!Number.isFinite(e)||e<=1e-8?{x:0,y:0,z:1}:{x:n.x/e,y:n.y/e,z:n.z/e}}function dx(n,e){const t=e*Math.PI/180,i=Math.cos(t),r=Math.sin(t);return{x:n.x*i+n.z*r,y:n.y,z:-n.x*r+n.z*i}}function px(n,e){const t=e*Math.PI/180,i=Math.cos(t),r=Math.sin(t);return{x:n.x,y:n.y*i-n.z*r,z:n.y*r+n.z*i}}function mx(n){const e=ux(n);return{azimuthDeg:$n(Math.atan2(e.x,e.z)*180/Math.PI),elevationDeg:Math.asin(cx(e.y))*180/Math.PI}}function fx(n,e,t){const i=$n(n-t)*Math.PI/180,r=Number(e)*Math.PI/180,s=Math.cos(r);return{x:Ce+Math.sin(i)*s*Ft,y:Ce-Math.sin(r)*Ft,isFrontHemisphere:Math.cos(i)*s>=0,relativeAzimuthDeg:$n(n-t)}}function gx(n,e,t,i){const r=dx(hx(n,e),t*Gc),s=px(r,i*Gc);return mx(s)}function zn({value:n,inputMode:e="decimal",onCommit:t,onScrubDelta:i=null,onScrubStart:r=null,onScrubEnd:s=null,onInteractStart:o=null,onEditStart:a=null,onEditEnd:c=null,controller:l=null,historyLabel:u="",formatDisplayValue:h=null,scrubModifiers:d=null,scrubHandleSide:p="auto",scrubStartValue:m=null,...f}){const g=String(n),[y,_]=ge(g),[M,x]=ge(!1),[v,P]=ge(!1),[E,S]=ge(p==="start"?"start":"end"),C=we(null),k=we(null),A=we(!1),b=od(d);Re(()=>{!M&&!v&&_(g)},[g,M,v]),Re(()=>{if(p!=="auto"){S(p==="start"?"start":"end");return}if(!k.current)return;const L=globalThis.getComputedStyle(k.current).getPropertyValue("text-align").trim().toLowerCase(),X=L==="right"||L==="end"?"start":"end";S(ee=>ee===X?ee:X)},[p]);function F(L="cancel"){_(g),x(!1),c==null||c(L)}function z(){requestAnimationFrame(()=>{var L,X,ee,H;(X=(L=k.current)==null?void 0:L.focus)==null||X.call(L,{preventScroll:!0}),(H=(ee=k.current)==null?void 0:ee.select)==null||H.call(ee)})}function R(L){const X=String(L??"").trim();if(X===""){F("cancel");return}t==null||t(X),x(!1),c==null||c("commit")}function O(L){const X=Number(L);return Number.isFinite(X)?X:null}function G(L){let X=L;const ee=O(f.min),H=O(f.max);return ee!==null&&(X=Math.max(ee,X)),H!==null&&(X=Math.min(H,X)),X}function te(L){return ix(L,{formatDisplayValue:h,template:g,step:f.step})}function q(L){return L.altKey&&L.shiftKey?b.altShift:L.altKey?b.alt:L.shiftKey?b.shift:b.normal}function B(){const L=Number(f.step);return Number.isFinite(L)&&L>0?L:1}function U(){const L=Number(globalThis.innerWidth);return Number.isFinite(L)&&L>0?L:null}function le(L,X,ee){if(X===null||Math.abs(ee)<=0)return 1;let H=null;if(ee<0?H=L:ee>0&&(H=X-L),H===null||H>=Uc)return 1;const T=Math.max(0,Math.min(1,H/Uc)),D=T*T;return Hc+(1-Hc)*D}function $e(L="commit"){var ee,H,T,D,j,Q;const X=C.current;if(X){if(X.edgeHoldFrameId&&(globalThis.cancelAnimationFrame(X.edgeHoldFrameId),X.edgeHoldFrameId=0),X.handle.removeEventListener("pointermove",X.onMove),X.handle.removeEventListener("pointerup",X.onUp),X.handle.removeEventListener("pointercancel",X.onCancel),(H=(ee=X.handle).releasePointerCapture)==null||H.call(ee,X.pointerId),C.current=null,P(!1),L==="cancel"){(D=(T=l==null?void 0:l())==null?void 0:T.cancelHistoryTransaction)==null||D.call(T),s==null||s("cancel");return}(Q=(j=l==null?void 0:l())==null?void 0:j.commitHistoryTransaction)==null||Q.call(j,u),s==null||s("commit")}}function nt(L){var Lt,On,Ii;W(L),L.preventDefault(),o==null||o();const X=m!=null?O(m):O(g);if(X===null)return;r==null||r(),(On=(Lt=l==null?void 0:l())==null?void 0:Lt.beginHistoryTransaction)==null||On.call(Lt,u),x(!1),P(!0);const ee=L.currentTarget;(Ii=ee.setPointerCapture)==null||Ii.call(ee,L.pointerId);const H={pointerId:L.pointerId,handle:ee,lastClientX:L.clientX,appliedValue:X,edgeHoldDirection:0,edgeHoldMultiplier:1,edgeHoldEngagedAt:0,edgeHoldLastTimestamp:0,edgeHoldFrameId:0,onMove:null,onUp:null,onCancel:null},T=oe=>{if(!Number.isFinite(oe)||Math.abs(oe)<=1e-8)return;const be=G(H.appliedValue+oe),Ne=te(be),He=be-H.appliedValue;!Number.isFinite(He)||Math.abs(He)<=1e-8||(H.appliedValue=be,_(Ne),i?i(He,be):t==null||t(Ne))},D=()=>{H.edgeHoldFrameId&&globalThis.cancelAnimationFrame(H.edgeHoldFrameId),H.edgeHoldDirection=0,H.edgeHoldFrameId=0,H.edgeHoldEngagedAt=0,H.edgeHoldLastTimestamp=0},j=oe=>{if(C.current!==H||!H.edgeHoldDirection){H.edgeHoldFrameId=0;return}H.edgeHoldEngagedAt||(H.edgeHoldEngagedAt=oe),H.edgeHoldLastTimestamp||(H.edgeHoldLastTimestamp=oe);const be=oe-H.edgeHoldLastTimestamp;if(H.edgeHoldLastTimestamp=oe,oe-H.edgeHoldEngagedAt>=ox){const Ne=be/16.6667,He=H.edgeHoldDirection*ax*Ne;T(He*B()*H.edgeHoldMultiplier)}H.edgeHoldFrameId=globalThis.requestAnimationFrame(j)},Q=(oe,be)=>{H.edgeHoldDirection===oe&&Math.abs(H.edgeHoldMultiplier-be)<=1e-8&&H.edgeHoldFrameId||(D(),H.edgeHoldDirection=oe,H.edgeHoldMultiplier=be,H.edgeHoldFrameId=globalThis.requestAnimationFrame(j))},qt=oe=>{if(oe.pointerId!==H.pointerId)return;W(oe),oe.preventDefault();const be=oe.clientX,Ne=be-H.lastClientX,He=U(),cs=be<=Vc,hs=He!==null&&be>=He-Vc;if(Math.abs(Ne)<=0)return;const Bn=q(oe),jn=le(be,He,Ne);H.lastClientX=be,T(Ne*B()*Bn*jn),Ne<0&&cs?Q(-1,Bn*jn):Ne>0&&hs?Q(1,Bn*jn):D()},Zt=oe=>{oe.pointerId===L.pointerId&&(W(oe),oe.preventDefault(),$e("commit"))},Ri=oe=>{oe.pointerId===L.pointerId&&(W(oe),oe.preventDefault(),$e("cancel"))};H.onMove=qt,H.onUp=Zt,H.onCancel=Ri,C.current=H,ee.addEventListener("pointermove",qt),ee.addEventListener("pointerup",Zt),ee.addEventListener("pointercancel",Ri)}return w`
		<div
			class=${v?`numeric-scrub numeric-scrub--handle-${E} is-scrubbing`:`numeric-scrub numeric-scrub--handle-${E}`}
			data-history-scope="app"
		>
			<input
				ref=${k}
				...${f}
				type="text"
				inputMode=${e}
				spellcheck="false"
				autocomplete="off"
				data-draft-editing=${M?"true":"false"}
				value=${M||v?y:g}
				onFocus=${L=>{W(L),o==null||o(),a==null||a(),x(!0),_(String(L.currentTarget.value??g))}}
				onInput=${L=>{W(L),x(!0),_(L.currentTarget.value)}}
				onBlur=${L=>{if(A.current){A.current=!1,x(!1);return}R(L.currentTarget.value)}}
				onChange=${W}
				onPointerDown=${L=>{var X;W(L),L.preventDefault(),o==null||o(),x(!0),_(String(((X=k.current)==null?void 0:X.value)??g)),z()}}
				onClick=${W}
				onWheel=${Fi}
				onKeyDown=${L=>{if(!Mi(L)){if(W(L),L.key==="Enter"){L.preventDefault(),A.current=!0,R(L.currentTarget.value),L.currentTarget.blur();return}L.key==="Escape"&&(L.preventDefault(),A.current=!0,F(),L.currentTarget.blur())}}}
			/>
			<button
				type="button"
				class="numeric-scrub__handle"
				tabIndex="-1"
				aria-hidden="true"
				onPointerDown=${nt}
				onClick=${L=>{W(L),L.preventDefault()}}
			>
				<${_e} name="scrub" size=${13} />
			</button>
		</div>
	`}function ro({controller:n=null,historyLabel:e="",ariaLabel:t="",step:i=.02,scrubModifiers:r=null,onDelta:s}){const[o,a]=ge(!1),c=we(null),l=od(r);function u(m){return m.altKey&&m.shiftKey?l.altShift:m.altKey?l.alt:m.shiftKey?l.shift:l.normal}function h(){const m=Number(i);return Number.isFinite(m)&&m>0?m:.02}function d(m="commit"){var g,y,_,M,x,v;const f=c.current;if(f){if(f.surface.removeEventListener("pointermove",f.onMove),f.surface.removeEventListener("pointerup",f.onUp),f.surface.removeEventListener("pointercancel",f.onCancel),(y=(g=f.surface).releasePointerCapture)==null||y.call(g,f.pointerId),f.surface.style.setProperty("--directional-scrub-offset","0px"),c.current=null,a(!1),m==="cancel"){(M=(_=n==null?void 0:n())==null?void 0:_.cancelHistoryTransaction)==null||M.call(_);return}(v=(x=n==null?void 0:n())==null?void 0:x.commitHistoryTransaction)==null||v.call(x,e)}}function p(m){var x,v,P;W(m),m.preventDefault(),(v=(x=n==null?void 0:n())==null?void 0:x.beginHistoryTransaction)==null||v.call(x,e),a(!0);const f=m.currentTarget;(P=f.setPointerCapture)==null||P.call(f,m.pointerId);const g={pointerId:m.pointerId,surface:f,startClientX:m.clientX,appliedDistance:0,onMove:null,onUp:null,onCancel:null},y=E=>{if(E.pointerId!==g.pointerId)return;W(E),E.preventDefault();const S=Math.max(10,Math.min(20,(g.surface.clientWidth-34)*.5)),C=Math.max(-S,Math.min(S,E.clientX-g.startClientX));g.surface.style.setProperty("--directional-scrub-offset",`${C}px`);const k=(E.clientX-g.startClientX)*h()*u(E),A=k-g.appliedDistance;!Number.isFinite(A)||Math.abs(A)<=1e-8||(g.appliedDistance=k,s==null||s(A))},_=E=>{E.pointerId===g.pointerId&&(W(E),E.preventDefault(),d("commit"))},M=E=>{E.pointerId===g.pointerId&&(W(E),E.preventDefault(),d("cancel"))};g.onMove=y,g.onUp=_,g.onCancel=M,c.current=g,f.addEventListener("pointermove",y),f.addEventListener("pointerup",_),f.addEventListener("pointercancel",M)}return w`
		<div
			class=${o?"directional-scrub is-scrubbing":"directional-scrub"}
			data-history-scope="app"
		>
			<button
				type="button"
				class="directional-scrub__surface"
				aria-label=${t}
				onPointerDown=${p}
				onClick=${m=>{W(m),m.preventDefault()}}
			>
				<span class="directional-scrub__chevron directional-scrub__chevron--start">
					<${_e} name="chevron-left" size=${16} />
				</span>
				<span class="directional-scrub__track" aria-hidden="true"></span>
				<span class="directional-scrub__thumb" aria-hidden="true">
					<span class="directional-scrub__thumb-bar"></span>
				</span>
				<span class="directional-scrub__chevron directional-scrub__chevron--end">
					<${_e} name="chevron-right" size=${16} />
				</span>
			</button>
		</div>
	`}function fM({controller:n,azimuthDeg:e,elevationDeg:t,viewAzimuthDeg:i=0,historyLabel:r="lighting.model.direction",onLiveChange:s}){const[o,a]=ge(!1),[c,l]=ge(i),u=we(null),h=we(i);Re(()=>{h.current=i,l(i)},[i]),Re(()=>{let _=0;const M=()=>{var v,P;const x=(P=(v=n==null?void 0:n())==null?void 0:v.getActiveCameraHeadingDeg)==null?void 0:P.call(v);if(Number.isFinite(x)){const E=$n(x+180);Math.abs($n(E-h.current))>=.1&&(h.current=E,l(E))}_=globalThis.requestAnimationFrame(M)};return _=globalThis.requestAnimationFrame(M),()=>{globalThis.cancelAnimationFrame(_)}},[n]);const d=fx(e,t,c),p=`M ${Ce} ${Ce} L ${d.x} ${d.y}`,m=d.isFrontHemisphere?null:w`
				<path
					d=${p}
					class="lighting-direction-control__ray lighting-direction-control__ray--back"
				/>
				<circle
					cx=${d.x}
					cy=${d.y}
					r="5"
					class="lighting-direction-control__handle lighting-direction-control__handle--back"
				/>
			`,f=d.isFrontHemisphere?w`
				<path d=${p} class="lighting-direction-control__ray" />
				<circle
					cx=${d.x}
					cy=${d.y}
					r="6"
					class="lighting-direction-control__handle"
				/>
			`:null;function g(_="commit"){var x,v,P,E,S,C;const M=u.current;if(M){if(M.target.removeEventListener("pointermove",M.onMove),M.target.removeEventListener("pointerup",M.onUp),M.target.removeEventListener("pointercancel",M.onCancel),(v=(x=M.target).releasePointerCapture)==null||v.call(x,M.pointerId),u.current=null,a(!1),_==="cancel"){(E=(P=n==null?void 0:n())==null?void 0:P.cancelHistoryTransaction)==null||E.call(P);return}(C=(S=n==null?void 0:n())==null?void 0:S.commitHistoryTransaction)==null||C.call(S,r)}}function y(_){var S,C,k;W(_),_.preventDefault();const M=_.currentTarget;(C=(S=n==null?void 0:n())==null?void 0:S.beginHistoryTransaction)==null||C.call(S,r),(k=M.setPointerCapture)==null||k.call(M,_.pointerId),a(!0);const x={pointerId:_.pointerId,target:M,previousClientX:_.clientX,previousClientY:_.clientY,relativeAzimuthDeg:d.relativeAzimuthDeg,elevationDeg:t,onMove:null,onUp:null,onCancel:null},v=A=>{if(A.pointerId!==x.pointerId)return;W(A),A.preventDefault();const b=A.clientX-x.previousClientX,F=A.clientY-x.previousClientY;x.previousClientX=A.clientX,x.previousClientY=A.clientY;const z=gx(x.relativeAzimuthDeg,x.elevationDeg,b,F);x.relativeAzimuthDeg=z.azimuthDeg,x.elevationDeg=z.elevationDeg,s==null||s({azimuthDeg:$n(z.azimuthDeg+h.current),elevationDeg:z.elevationDeg})},P=A=>{A.pointerId===x.pointerId&&(W(A),A.preventDefault(),g("commit"))},E=A=>{A.pointerId===x.pointerId&&(W(A),A.preventDefault(),g("cancel"))};x.onMove=v,x.onUp=P,x.onCancel=E,u.current=x,M.addEventListener("pointermove",v),M.addEventListener("pointerup",P),M.addEventListener("pointercancel",E)}return w`
		<div class="lighting-direction-control">
			<button
				type="button"
				class=${o?"lighting-direction-control__surface is-dragging":"lighting-direction-control__surface"}
				onPointerDown=${y}
			>
				<svg
					viewBox=${`0 0 ${jo} ${jo}`}
					class="lighting-direction-control__svg"
					aria-hidden="true"
				>
					${m}
					<circle
						cx=${Ce}
						cy=${Ce}
						r=${Ft}
						class="lighting-direction-control__sphere"
					/>
					<circle
						cx=${Ce}
						cy=${Ce}
						r=${Ft}
						class="lighting-direction-control__occluder"
					/>
					<ellipse
						cx=${Ce}
						cy=${Ce}
						rx=${Ft}
						ry=${lx}
						class="lighting-direction-control__equator"
					/>
					<path
						d=${`M ${Ce} ${Ce-Ft} V ${Ce+Ft}`}
						class="lighting-direction-control__view-axis"
					/>
					<circle
						cx=${Ce}
						cy=${Ce}
						r="3.5"
						class="lighting-direction-control__origin"
					/>
					${f}
				</svg>
			</button>
		</div>
	`}function Pi({value:n,onCommit:e,selectOnFocus:t=!1,...i}){const r=String(n??""),[s,o]=ge(r),[a,c]=ge(!1),l=we(!1),u=we(!1);Re(()=>{a||o(r)},[r,a]);function h(){o(r),c(!1)}function d(m){e==null||e(String(m??"")),c(!1)}function p(m){if(t){m.preventDefault(),W(m);const f=m.currentTarget;c(!0),o(String(f.value??r)),requestAnimationFrame(()=>{var g,y;(g=f==null?void 0:f.focus)==null||g.call(f),(y=f==null?void 0:f.select)==null||y.call(f)});return}W(m)}return w`
		<input
			...${i}
			type="text"
			data-draft-editing=${a?"true":"false"}
			value=${a?s:r}
			onPointerDown=${p}
			onFocus=${m=>{W(m),c(!0),o(String(m.currentTarget.value??r)),t&&requestAnimationFrame(()=>{var f,g;(g=(f=m.currentTarget)==null?void 0:f.select)==null||g.call(f)})}}
			onInput=${m=>{W(m),c(!0),o(m.currentTarget.value)}}
			onCompositionStart=${m=>{W(m),l.current=!0,c(!0)}}
			onCompositionEnd=${m=>{W(m),l.current=!1,c(!0),o(String(m.currentTarget.value??r))}}
			onBlur=${m=>{if(l.current=!1,u.current){u.current=!1,c(!1);return}d(m.currentTarget.value)}}
			onChange=${W}
			onClick=${W}
			onWheel=${Fi}
			onKeyDown=${m=>{if(!Mi(m)){if(ex(m,l.current)){W(m);return}if(W(m),m.key==="Enter"){m.preventDefault(),u.current=!0,d(m.currentTarget.value),m.currentTarget.blur();return}m.key==="Escape"&&(m.preventDefault(),u.current=!0,h(),m.currentTarget.blur())}}}
		/>
	`}function Vo({controller:n,historyLabel:e,onLiveChange:t,...i}){const[r,s]=ge(!1);function o(l){var u,h;W(l),!r&&((h=(u=n==null?void 0:n())==null?void 0:u.beginHistoryTransaction)==null||h.call(u,e),s(!0))}function a(){var l,u;r&&((u=(l=n==null?void 0:n())==null?void 0:l.commitHistoryTransaction)==null||u.call(l,e),s(!1))}function c(){var l,u;r&&((u=(l=n==null?void 0:n())==null?void 0:l.cancelHistoryTransaction)==null||u.call(l),s(!1))}return w`
		<input
			...${i}
			type="range"
			data-history-scope="app"
			onPointerDown=${l=>{o(l)}}
			onInput=${l=>{r?W(l):o(l),t==null||t(l)}}
			onChange=${l=>{r?W(l):o(l),t==null||t(l),a()}}
			onPointerUp=${l=>{W(l),a()}}
			onPointerCancel=${l=>{W(l),c()}}
			onBlur=${()=>{a()}}
			onKeyDown=${l=>{Mi(l)||(W(l),["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(l.key)&&o(l))}}
			onKeyUp=${l=>{Mi(l)||(W(l),["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(l.key)&&a())}}
			onWheel=${Fi}
		/>
	`}function Uo(n,e,{snap:t=!1}={}){const i=Number(e);if(!Number.isFinite(i))return;const r=t?sy(i):la(i);n==null||n(ca(r))}const wr="scene",Mr="camera",Sr="reference",Ho="export",yx="scene-main",_x="scene-transform",bx="shot-camera",xx="shot-camera-properties",vx="lighting",wx="output-frame",Mx="reference-presets",Sx="reference-manager",$x="reference-properties",kx="export-output",Ex="export-settings";function ad(n){return[{id:wr,label:n("section.scene"),icon:"scene",tooltip:{title:n("section.scene"),description:n("tooltip.tabScene"),placement:"bottom"}},{id:Mr,label:n("section.shotCamera"),icon:"camera-dslr",tooltip:{title:n("section.shotCamera"),description:n("tooltip.tabCamera"),placement:"bottom"}},{id:Sr,label:n("section.referenceImages"),icon:"image",tooltip:{title:n("section.referenceImages"),description:n("tooltip.tabReference"),placement:"bottom"}},{id:Ho,label:n("section.export"),icon:"export-tab",tooltip:{title:n("section.export"),description:n("tooltip.tabExport"),placement:"bottom"}}]}function gM(n){return[{id:yx,tabId:wr,label:n("section.sceneManager"),icon:"scene"},{id:bx,tabId:Mr,label:n("section.shotCameraManager"),icon:"camera"},{id:xx,tabId:Mr,label:n("section.shotCameraProperties"),icon:"camera-property"},{id:vx,tabId:wr,label:n("section.lighting"),icon:"light"},{id:_x,tabId:wr,label:n("section.selectedSceneObject"),icon:"move"},{id:wx,tabId:Mr,label:n("section.outputFrame"),icon:"render-box"},{id:Mx,tabId:Sr,label:n("section.referencePresets"),icon:"image"},{id:Sx,tabId:Sr,label:n("section.referenceManager"),icon:"reference-tool"},{id:$x,tabId:Sr,label:n("section.referenceProperties"),icon:"reference-tool"},{id:kx,tabId:Ho,label:n("section.output"),icon:"export-tab"},{id:Ex,tabId:Ho,label:n("section.exportSettings"),icon:"export-tab"}]}function Tx({activeShotCamera:n,controller:e,shotCameras:t,t:i}){const r=t.length>1&&!!n;return w`
		<div class="shot-camera-manager">
			<div class="button-row shot-camera-manager__actions">
				<${K}
					id="new-shot-camera"
					icon="plus"
					label=${i("action.newShotCamera")}
					onClick=${()=>{var s;return(s=e())==null?void 0:s.createShotCamera()}}
				/>
				<${K}
					id="duplicate-shot-camera"
					icon="duplicate"
					label=${i("action.duplicateShotCamera")}
					disabled=${!n}
					onClick=${()=>{var s;return(s=e())==null?void 0:s.duplicateActiveShotCamera()}}
				/>
				<${K}
					id="delete-shot-camera"
					icon="trash"
					label=${i("action.deleteShotCamera")}
					disabled=${!r}
					onClick=${()=>{var s,o;return(o=(s=e())==null?void 0:s.deleteActiveShotCamera)==null?void 0:o.call(s)}}
				/>
			</div>
			<div class="shot-camera-manager__list scene-asset-list scene-asset-list--compact">
				${t.map(s=>w`
						<article
							key=${s.id}
							class=${s.id===(n==null?void 0:n.id)?"scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active":"scene-asset-row scene-asset-row--compact"}
							onClick=${()=>{var o;return(o=e())==null?void 0:o.selectShotCamera(s.id)}}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									${s.id===(n==null?void 0:n.id)?w`
												<div class="field shot-camera-manager__inline-name-field">
													<${Pi}
														id=${`shot-camera-name-${s.id}`}
														class="shot-camera-manager__inline-name-input"
														placeholder=${i("field.shotCameraName")}
														selectOnFocus=${!0}
														value=${s.name}
														onCommit=${o=>{var a;return(a=e())==null?void 0:a.setShotCameraName(o)}}
													/>
												</div>
											`:w`<strong>${s.name}</strong>`}
								</div>
							</div>
						</article>
					`)}
			</div>
		</div>
	`}function yM({controller:n,draggedAssetId:e=null,dragHoverState:t=null,sceneAssets:i,selectedSceneAsset:r,setDraggedAssetId:s,setDragHoverState:o,store:a,t:c}){const l=[{kind:"model",label:c("assetKind.model"),assets:i.filter(m=>m.kind==="model")},{kind:"splat",label:c("assetKind.splat"),assets:i.filter(m=>m.kind==="splat")}],u=a.selectedSceneAssetIds.value??[],h=new Set(u),d=m=>{const f=["scene-asset-row","scene-asset-row--compact"];return h.has(m.id)&&f.push("scene-asset-row--selected"),m.id===(r==null?void 0:r.id)&&f.push("scene-asset-row--active"),(t==null?void 0:t.assetId)===m.id&&f.push(t.position==="before"?"scene-asset-row--drop-before":"scene-asset-row--drop-after"),f.join(" ")},p=m=>m.id===(r==null?void 0:r.id)?w`
					<div class="field scene-asset-row__inline-name-field">
						<${Pi}
							id=${`scene-asset-name-${m.id}`}
							class="scene-asset-row__inline-name-input"
							placeholder=${m.label}
							selectOnFocus=${!0}
							value=${m.label}
							maxLength="128"
							onCommit=${f=>{var g,y;return(y=(g=n())==null?void 0:g.setAssetLabel)==null?void 0:y.call(g,m.id,f)}}
						/>
					</div>
				`:w`<strong>${m.label}</strong>`;return w`
		<div class="browser-list">
			${l.map(m=>w`
					<section key=${m.kind} class="browser-group">
						<div class="browser-group__heading">
							<strong>${m.label}</strong>
							<span class="pill pill--dim">${m.assets.length}</span>
						</div>
						<div class="scene-asset-list scene-asset-list--compact">
							${m.assets.length===0?w`<div class="scene-asset-list__placeholder"></div>`:m.assets.map(f=>w`
									<article
										class=${d(f)}
										draggable="true"
										onClick=${g=>{var y;return(y=n())==null?void 0:y.selectSceneAsset(f.id,{additive:g.ctrlKey||g.metaKey,toggle:g.ctrlKey||g.metaKey,range:g.shiftKey,orderedIds:i.map(_=>_.id)})}}
										onDragStart=${g=>{s(f.id),o(null),g.dataTransfer.effectAllowed="move",g.dataTransfer.setData("text/plain",String(f.id))}}
										onDragOver=${g=>{const y=Bo(i,e??Number(g.dataTransfer.getData("text/plain")));Bc(i,u,y==null?void 0:y.id).includes(f.id)||(y==null?void 0:y.kind)===f.kind&&(g.preventDefault(),g.dataTransfer.dropEffect="move",o({assetId:f.id,position:jc(g)}))}}
										onDragLeave=${()=>{(t==null?void 0:t.assetId)===f.id&&o(null)}}
										onDrop=${g=>{var P;g.preventDefault();const y=e??Number(g.dataTransfer.getData("text/plain")),_=Bo(i,y),M=Bc(i,u,y),x=jc(g);if(!Number.isFinite(y)||y===f.id||M.includes(f.id)||(_==null?void 0:_.kind)!==f.kind){s(null),o(null);return}const v=Qb(_,f,x);v!==null&&((P=n())==null||P.moveAssetToIndex(y,v)),s(null),o(null)}}
										onDragEnd=${()=>{s(null),o(null)}}
									>
										<div class="scene-asset-row__main">
											<span class="scene-asset-row__handle" aria-hidden="true">
												<${_e} name="grip" size=${12} strokeWidth=${0} />
											</span>
											<div class="scene-asset-row__title-group">
												${p(f)}
											</div>
										</div>
										<div class="scene-asset-row__toolbar">
											<${K}
												icon=${f.visible?"eye":"eye-off"}
												label=${c(f.visible?"assetVisibility.visible":"assetVisibility.hidden")}
												active=${f.visible}
												compact=${!0}
												className="scene-asset-row__icon-button"
												onClick=${g=>{var y,_;g.stopPropagation(),(y=n())==null||y.selectSceneAsset(f.id),(_=n())==null||_.setAssetVisibility(f.id,!f.visible)}}
											/>
										</div>
									</article>
								`)}
						</div>
					</section>
				`)}
		</div>
	`}function Ax({activePreset:n,controller:e,presets:t,t:i}){const[r,s]=ge(!1),o=we(null),a=!!n&&!n.isBlank;return Re(()=>{if(!r)return;const c=l=>{var u,h;(h=(u=o.current)==null?void 0:u.contains)!=null&&h.call(u,l.target)||s(!1)};return window.addEventListener("pointerdown",c),()=>{window.removeEventListener("pointerdown",c)}},[r]),w`
		<div class="reference-preset-picker" ref=${o}>
			<div class="reference-preset-picker__control">
				<div class="field reference-preset-picker__field">
					<${Pi}
						id="reference-preset-name"
						class="reference-preset-picker__input"
						placeholder=${i("field.referencePresetName")}
						selectOnFocus=${a}
						disabled=${!a}
						value=${(n==null?void 0:n.name)??""}
						onCommit=${c=>{var l,u;return(u=(l=e())==null?void 0:l.setActiveReferenceImagePresetName)==null?void 0:u.call(l,c)}}
					/>
				</div>
				<button
					type="button"
					class=${r?"reference-preset-picker__toggle is-open":"reference-preset-picker__toggle"}
					onPointerDown=${c=>{W(c),c.preventDefault()}}
					onClick=${c=>{W(c),c.preventDefault(),s(l=>!l)}}
					aria-label=${i("referenceImage.activePreset")}
					aria-expanded=${r}
				>
					<${_e} name="chevron-right" size=${12} />
				</button>
			</div>
			${r&&w`
					<div class="reference-preset-picker__menu">
						${t.map(c=>w`
								<button
									key=${c.id}
									type="button"
									class=${c.id===(n==null?void 0:n.id)?"reference-preset-picker__option is-active":"reference-preset-picker__option"}
									onPointerDown=${l=>{W(l),l.preventDefault()}}
									onClick=${l=>{var u,h;W(l),l.preventDefault(),(h=(u=e())==null?void 0:u.setActiveReferenceImagePreset)==null||h.call(u,c.id),s(!1)}}
								>
									<span>${c.name}</span>
									${c.isBlank?w`<span class="pill pill--dim">${i("referenceImage.blankPreset")}</span>`:null}
								</button>
							`)}
					</div>
				`}
		</div>
	`}function _M({controller:n,open:e=!0,summaryActions:t=null,onToggle:i=null,store:r,t:s}){const o=r.referenceImages.presets.value,a=r.referenceImages.panelPresetId.value,c=o.find(u=>u.id===a)??o[0]??null,l=!!c&&c.isBlank!==!0&&o.length>1;return w`
		<${Yt}
			icon="image"
			label=${s("section.referencePresets")}
			helpSectionId="reference-images"
			onOpenHelp=${u=>{var h,d;return(d=(h=n())==null?void 0:h.openHelp)==null?void 0:d.call(h,{sectionId:u})}}
			open=${e}
			summaryActions=${t}
			onToggle=${i}
		>
			<div class="reference-preset-section">
				<div class="reference-preset-section__row">
					<${Ax}
						activePreset=${c}
						controller=${n}
						presets=${o}
						t=${s}
					/>
				</div>
				<div class="button-row reference-preset-section__actions">
					<${K}
						id="duplicate-reference-preset"
						icon="duplicate"
						label=${s("action.duplicateReferencePreset")}
						onClick=${()=>{var u,h;return(h=(u=n())==null?void 0:u.duplicateActiveReferenceImagePreset)==null?void 0:h.call(u)}}
					/>
					<${K}
						id="delete-reference-preset"
						icon="trash"
						label=${s("action.deleteReferencePreset")}
						disabled=${!l}
						onClick=${()=>{var u,h;return(h=(u=n())==null?void 0:u.deleteActiveReferenceImagePreset)==null?void 0:h.call(u)}}
					/>
				</div>
			</div>
		<//>
	`}function bM({controller:n,open:e=!0,summaryActions:t=null,onToggle:i=null,store:r,t:s}){const o=r.referenceImages.items.value,a=qs(o),c=new Set(r.referenceImages.selectedItemIds.value??[]),l=a.filter(S=>c.has(S.id)),u=r.referenceImages.selectedItemId.value,h=[{group:"front",label:s("referenceImage.group.front"),items:qs(o,"front")},{group:"back",label:s("referenceImage.group.back"),items:qs(o,"back")}],[d,p]=ge(null),[m,f]=ge(null),g=l.length>0,y=r.referenceImages.previewSessionVisible.value!==!1,_=l.length>0&&l.every(S=>S.previewVisible!==!1),M=l.length>0&&l.every(S=>S.exportEnabled!==!1),x=w`
		<${K}
			id="toggle-reference-preview-session"
			icon=${y?"reference-preview-on":"reference-preview-off"}
			label=${s(y?"action.hideReferenceImages":"action.showReferenceImages")}
			active=${y&&o.length>0}
			compact=${!0}
			disabled=${o.length===0}
			tooltip=${{title:s(y?"action.hideReferenceImages":"action.showReferenceImages"),description:s("tooltip.referencePreviewSessionVisible"),shortcut:"R",placement:"left"}}
			onClick=${()=>{var S,C;return(C=(S=n())==null?void 0:S.setReferenceImagePreviewSessionVisible)==null?void 0:C.call(S,!y)}}
		/>
		${t&&w`${t}`}
	`;function v(S){const C=["scene-asset-row","scene-asset-row--compact"];return c.has(S)&&C.push("scene-asset-row--selected"),S===u&&C.push("scene-asset-row--active"),(m==null?void 0:m.itemId)===S&&C.push(m.position==="before"?"scene-asset-row--drop-before":"scene-asset-row--drop-after"),C.join(" ")}function P(S){const C=S.currentTarget.getBoundingClientRect();return S.clientY<C.top+C.height/2?"before":"after"}function E(S,C,k){var A,b,F,z,R,O;(b=(A=n())==null?void 0:A.selectReferenceImageItem)==null||b.call(A,C,{additive:S.ctrlKey||S.metaKey,toggle:S.ctrlKey||S.metaKey,range:S.shiftKey,orderedIds:k}),(z=(F=n())==null?void 0:F.isReferenceImageSelectionActive)!=null&&z.call(F)&&((O=(R=n())==null?void 0:R.activateViewportReferenceImageEditModeImplicit)==null||O.call(R))}return w`
		<${Yt}
			icon="reference-tool"
			label=${s("section.referenceManager")}
			helpSectionId="reference-images"
			onOpenHelp=${S=>{var C,k;return(k=(C=n())==null?void 0:C.openHelp)==null?void 0:k.call(C,{sectionId:S})}}
			open=${e}
			summaryActions=${x}
			onToggle=${i}
			className="panel-disclosure--browser-stack"
		>
			<div class="scene-workspace-browser">
				<div class="button-row reference-manager__actions">
					<${K}
						id="toggle-selected-reference-preview"
						icon=${_?"eye-off":"eye"}
						label=${s(_?"action.hideSelectedReferenceImages":"action.showSelectedReferenceImages")}
						disabled=${!l.length}
						onClick=${()=>{var S,C;return(C=(S=n())==null?void 0:S.setSelectedReferenceImagesPreviewVisible)==null?void 0:C.call(S,!_)}}
					/>
					<${K}
						id="toggle-selected-reference-export"
						icon=${M?"slash-circle":"export"}
						label=${s(M?"action.excludeSelectedReferenceImagesFromExport":"action.includeSelectedReferenceImagesInExport")}
						disabled=${!l.length}
						onClick=${()=>{var S,C;return(C=(S=n())==null?void 0:S.setSelectedReferenceImagesExportEnabled)==null?void 0:C.call(S,!M)}}
					/>
					<${K}
						id="delete-selected-reference-images"
						icon="trash"
						label=${s("action.deleteSelectedReferenceImages")}
						disabled=${!g}
						onClick=${()=>{var S,C;return(C=(S=n())==null?void 0:S.deleteSelectedReferenceImageItems)==null?void 0:C.call(S)}}
					/>
				</div>
				<div class="scene-workspace-pane">
					<div class="scene-workspace-pane__body">
						${a.length>0?w`
										<div class="browser-list">
											${h.map(S=>w`
													<section key=${S.group} class="browser-group">
														<div class="browser-group__heading">
															<strong>${S.label}</strong>
															<span class="pill pill--dim"
																>${S.items.length}</span
															>
														</div>
														<div class="scene-asset-list scene-asset-list--compact">
															${S.items.length===0?w`<div class="scene-asset-list__placeholder"></div>`:S.items.map(C=>w`
													<article
														key=${C.id}
														class=${v(C.id)}
														onClick=${k=>E(k,C.id,a.map(A=>A.id))}
														onDragOver=${k=>{k.preventDefault(),k.dataTransfer.dropEffect="move",f({itemId:C.id,position:P(k)})}}
														onDragLeave=${()=>{(m==null?void 0:m.itemId)===C.id&&f(null)}}
														onDrop=${k=>{var F,z;k.preventDefault();const A=d??String(k.dataTransfer.getData("text/plain")).trim(),b=P(k);if(!A||A===C.id){p(null),f(null);return}(z=(F=n())==null?void 0:F.moveReferenceImageToDisplayTarget)==null||z.call(F,A,C.id,b,a.map(R=>R.id)),p(null),f(null)}}
														onDragEnd=${()=>{p(null),f(null)}}
													>
														<div
															class="scene-asset-row__main"
															draggable="true"
															onDragStart=${k=>{p(C.id),f(null),k.dataTransfer.effectAllowed="move",k.dataTransfer.setData("text/plain",String(C.id))}}
															onDragEnd=${()=>{p(null),f(null)}}
														>
															<span class="scene-asset-row__handle" aria-hidden="true">
																<${_e}
																	name="grip"
																	size=${12}
																	strokeWidth=${0}
																/>
															</span>
															<div class="scene-asset-row__title-group">
																<strong>${C.name}</strong>
															</div>
														</div>
														<div class="scene-asset-row__toolbar">
															<button
																type="button"
																class=${C.group==="front"?"reference-group-chip reference-group-chip--front":"reference-group-chip reference-group-chip--back"}
																title=${s(`referenceImage.group.${C.group}`)}
																onClick=${k=>{var A,b;k.stopPropagation(),(b=(A=n())==null?void 0:A.setReferenceImageGroup)==null||b.call(A,C.id,C.group==="front"?"back":"front")}}
															>
																${s(`referenceImage.groupShort.${C.group}`)}
															</button>
															<${K}
																icon=${C.previewVisible?"eye":"eye-off"}
																label=${s(C.previewVisible?"action.hideReferenceImage":"action.showReferenceImage")}
																active=${C.previewVisible}
																compact=${!0}
																className="scene-asset-row__icon-button"
																onClick=${k=>{var A,b;k.stopPropagation(),(b=(A=n())==null?void 0:A.setReferenceImagePreviewVisible)==null||b.call(A,C.id,!C.previewVisible)}}
															/>
															<${K}
																icon=${C.exportEnabled?"export":"slash-circle"}
																label=${C.exportEnabled?s("action.excludeReferenceImageFromExport"):s("action.includeReferenceImageInExport")}
																active=${C.exportEnabled}
																compact=${!0}
																className="scene-asset-row__icon-button"
																onClick=${k=>{var A,b;k.stopPropagation(),(b=(A=n())==null?void 0:A.setReferenceImageExportEnabled)==null||b.call(A,C.id,!C.exportEnabled)}}
															/>
														</div>
													</article>
												`)}
														</div>
													</section>
												`)}
										</div>
									`:w`
										<div class="scene-workspace-pane__placeholder">
											<div class="scene-asset-list__placeholder"></div>
										</div>
									`}
					</div>
				</div>
			</div>
		<//>
	`}function xM({activeShotCamera:n,controller:e,open:t=!0,summaryActions:i=null,onToggle:r=null,store:s,t:o}){return w`
		<${Yt}
			icon="camera"
			label=${o("section.shotCameraManager")}
			helpSectionId="shot-camera"
			onOpenHelp=${a=>{var c,l;return(l=(c=e())==null?void 0:c.openHelp)==null?void 0:l.call(c,{sectionId:a})}}
			open=${t}
			summaryActions=${i}
			onToggle=${r}
		>
			<${Tx}
				activeShotCamera=${n}
				controller=${e}
				shotCameras=${s.workspace.shotCameras.value}
				t=${o}
			/>
		<//>
	`}function Tt({prefix:n,id:e,value:t,controller:i,historyLabel:r,onCommit:s,onScrubDelta:o=null,onScrubStart:a=null,formatDisplayValue:c=null,scrubStartValue:l=null,inputMode:u="decimal",min:h=void 0,max:d=void 0,step:p="0.01",disabled:m=!1}){return w`
		<div class="camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${n}</span>
			<div class="field camera-property-axis-field__input">
				<${zn}
					id=${e}
					inputMode=${u}
					min=${h}
					max=${d}
					step=${p}
					value=${t}
					controller=${i}
					historyLabel=${r}
					formatDisplayValue=${c}
					disabled=${m}
					onScrubDelta=${o}
					onScrubStart=${a}
					scrubStartValue=${l}
					onCommit=${s}
				/>
			</div>
		</div>
	`}function vM({controller:n,headingActions:e=null,store:t,t:i}){return w`
		<section class="panel-section">
			<${Zb} icon="zoom" title=${i("section.displayZoom")}>
				${e}
			<//>
			<label class="field field--inline-compact">
				<span>${i("field.cameraViewZoom")}</span>
				<div class="field--inline-compact__value">
					<div class="numeric-unit">
						<${zn}
							id="view-zoom"
							inputMode="decimal"
							min=${Kh}
							max=${Qh}
							step="1"
							value=${Math.round(t.renderBox.viewZoom.value*100)}
							controller=${n}
							historyLabel="output-frame.zoom"
							onCommit=${r=>{var s,o;return(o=(s=n())==null?void 0:s.setViewZoomPercent)==null?void 0:o.call(s,r)}}
						/>
						<${sd} value="%" title=${i("unit.percent")} />
					</div>
				</div>
			</label>
		</section>
	`}function wM({controller:n,equivalentMmValue:e,fovLabel:t,open:i=!0,summaryActions:r=null,onToggle:s=null,shotCameraClipMode:o,store:a,t:c}){const l=Number(a.shotCamera.positionX.value).toFixed(2),u=Number(a.shotCamera.positionY.value).toFixed(2),h=Number(a.shotCamera.positionZ.value).toFixed(2),d=Number(a.shotCamera.yawDeg.value).toFixed(2),p=Number(a.shotCamera.pitchDeg.value).toFixed(2),m=Number(a.shotCamera.rollDeg.value).toFixed(2),f=a.shotCamera.rollLock.value;return w`
		<${Yt}
			icon="camera-property"
			label=${c("section.shotCameraProperties")}
			helpSectionId="shot-camera"
			onOpenHelp=${g=>{var y,_;return(_=(y=n())==null?void 0:y.openHelp)==null?void 0:_.call(y,{sectionId:g})}}
			open=${i}
			summaryActions=${r}
			onToggle=${s}
		>
			<label class="field field--range">
				<span class="field-label-tooltip">
					${c("field.shotCameraEquivalentMm")}
					<${he}
						title=${c("field.shotCameraEquivalentMm")}
						description=${c("tooltip.shotCameraEquivalentMmField")}
						placement="right"
					/>
				</span>
				<div class="range-row">
					<${Vo}
						id="fov-mm"
						min=${14}
						max=${200}
						step="1"
						value=${e}
						controller=${n}
						historyLabel="camera.lens"
						onLiveChange=${g=>Uo(y=>{var _;return(_=n())==null?void 0:_.setBaseFovX(y)},g.currentTarget.value,{snap:!0})}
					/>
					<div class="numeric-unit">
						<${zn}
							id="fov-mm-input"
							inputMode="decimal"
							min=${14}
							max=${200}
							step="0.01"
							value=${Number(e).toFixed(2)}
							controller=${n}
							historyLabel="camera.lens"
							onCommit=${g=>Uo(y=>{var _;return(_=n())==null?void 0:_.setBaseFovX(y)},g)}
						/>
						<${sd} value="mm" title=${c("unit.millimeter")} />
					</div>
				</div>
				<p class="summary">${c("field.shotCameraFov")} ${t}</p>
			</label>
			<div class="pose-action-row">
				<${K}
					id="copy-viewport-to-shot"
					icon="copy-to-camera"
					label=${c("action.viewportToShot")}
					compact=${!0}
					tooltip=${{title:c("action.viewportToShot"),description:c("tooltip.copyViewportPoseToShot"),placement:"left"}}
					onClick=${()=>{var g;return(g=n())==null?void 0:g.copyViewportToShotCamera()}}
				/>
				<${K}
					id="copy-shot-to-viewport"
					icon="copy-to-viewport"
					label=${c("action.shotToViewport")}
					compact=${!0}
					tooltip=${{title:c("action.shotToViewport"),description:c("tooltip.copyShotPoseToViewport"),placement:"left"}}
					onClick=${()=>{var g;return(g=n())==null?void 0:g.copyShotCameraToViewport()}}
				/>
				<${K}
					id="reset-active-view"
					icon="reset"
					label=${c("action.resetActive")}
					compact=${!0}
					tooltip=${{title:c("action.resetActive"),description:c("tooltip.resetActiveView"),placement:"left"}}
					onClick=${()=>{var g;return(g=n())==null?void 0:g.resetActiveView()}}
				/>
			</div>
			<div class="camera-property-inline-row">
				<span class="camera-property-inline-row__label">${c("field.assetPosition")}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${Tt}
						prefix="X"
						id="shot-camera-position-x"
						value=${l}
						controller=${n}
						historyLabel="camera.position.x"
						onCommit=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setActiveShotCameraPositionAxis)==null?void 0:_.call(y,"x",g)}}
					/>
					<${Tt}
						prefix="Y"
						id="shot-camera-position-y"
						value=${u}
						controller=${n}
						historyLabel="camera.position.y"
						onCommit=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setActiveShotCameraPositionAxis)==null?void 0:_.call(y,"y",g)}}
					/>
					<${Tt}
						prefix="Z"
						id="shot-camera-position-z"
						value=${h}
						controller=${n}
						historyLabel="camera.position.z"
						onCommit=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setActiveShotCameraPositionAxis)==null?void 0:_.call(y,"z",g)}}
					/>
				</div>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--action">
				<span class="camera-property-inline-row__label">${c("field.assetRotation")}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${Tt}
						prefix="Y"
						id="shot-camera-yaw"
						value=${d}
						controller=${n}
						historyLabel="camera.rotation.yaw"
						onCommit=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setActiveShotCameraPoseAngle)==null?void 0:_.call(y,"yaw",g)}}
					/>
					<${Tt}
						prefix="P"
						id="shot-camera-pitch"
						value=${p}
						controller=${n}
						historyLabel="camera.rotation.pitch"
						onCommit=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setActiveShotCameraPoseAngle)==null?void 0:_.call(y,"pitch",g)}}
					/>
					<${Tt}
						prefix="R"
						id="shot-camera-roll"
						value=${m}
						controller=${n}
						historyLabel="camera.rotation.roll"
						onCommit=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setActiveShotCameraPoseAngle)==null?void 0:_.call(y,"roll",g)}}
					/>
				</div>
				<${K}
					icon=${f?"lock":"lock-open"}
					label=${c("field.shotCameraRollLock")}
					active=${f}
					compact=${!0}
					className="camera-property-inline-row__action"
					tooltip=${{title:c("field.shotCameraRollLock"),placement:"left"}}
					onClick=${()=>{var g,y;return(y=(g=n())==null?void 0:g.setShotCameraRollLock)==null?void 0:y.call(g,!f)}}
				/>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--clip">
				<div class="camera-property-inline-row__content camera-property-inline-row__content--clip">
					<${Tt}
						prefix=${c("field.shotCameraNear")}
						id="shot-camera-near"
						value=${Number(a.shotCamera.near.value).toFixed(2)}
						controller=${n}
						historyLabel="camera.near"
						min="0.1"
						step="0.1"
						disabled=${o==="auto"}
						onScrubStart=${()=>{var g,y;o==="auto"&&((y=(g=n())==null?void 0:g.setShotCameraClippingMode)==null||y.call(g,"manual"))}}
						onCommit=${g=>{var y;return(y=n())==null?void 0:y.setShotCameraNear(g)}}
					/>
					<${Tt}
						prefix=${c("field.shotCameraFar")}
						id="shot-camera-far"
						value=${Number(a.shotCamera.far.value).toFixed(2)}
						controller=${n}
						historyLabel="camera.far"
						min="0.1"
						step="0.1"
						disabled=${o==="auto"}
						onScrubStart=${()=>{var g,y;o==="auto"&&((y=(g=n())==null?void 0:g.setShotCameraClippingMode)==null||y.call(g,"manual"))}}
						onCommit=${g=>{var y;return(y=n())==null?void 0:y.setShotCameraFar(g)}}
					/>
				</div>
				<label class="switch-toggle camera-property-inline-row__switch">
					<input
						type="checkbox"
						checked=${o==="auto"}
						onChange=${g=>{var y,_;return(_=(y=n())==null?void 0:y.setShotCameraClippingMode)==null?void 0:_.call(y,g.currentTarget.checked?"auto":"manual")}}
					/>
					<span class="switch-toggle__control" aria-hidden="true">
						<span class="switch-toggle__thumb"></span>
					</span>
					<span class="switch-toggle__label field-label-tooltip">
						${c("clipMode.auto")}
						<${he}
							title=${c("clipMode.auto")}
							description=${c("hint.shotCameraClip")}
							placement="left"
						/>
					</span>
				</label>
			</div>
			<div class="pose-grid">
				<label class="field">
					<span>${c("field.shotCameraMoveHorizontal")}</span>
					<${ro}
						controller=${n}
						historyLabel="camera.local-move.horizontal"
						ariaLabel=${c("field.shotCameraMoveHorizontal")}
						step=${.02}
						onDelta=${g=>{var y,_;return(_=(y=n())==null?void 0:y.moveActiveShotCameraLocalAxis)==null?void 0:_.call(y,"right",g)}}
					/>
				</label>
				<label class="field">
					<span>${c("field.shotCameraMoveVertical")}</span>
					<${ro}
						controller=${n}
						historyLabel="camera.local-move.vertical"
						ariaLabel=${c("field.shotCameraMoveVertical")}
						step=${.02}
						onDelta=${g=>{var y,_;return(_=(y=n())==null?void 0:y.moveActiveShotCameraLocalAxis)==null?void 0:_.call(y,"up",g)}}
					/>
				</label>
				<label class="field">
					<span>${c("field.shotCameraMoveDepth")}</span>
					<${ro}
						controller=${n}
						historyLabel="camera.local-move.depth"
						ariaLabel=${c("field.shotCameraMoveDepth")}
						step=${.03}
						onDelta=${g=>{var y,_;return(_=(y=n())==null?void 0:y.moveActiveShotCameraLocalAxis)==null?void 0:_.call(y,"forward",g)}}
					/>
				</label>
			</div>
		<//>
	`}function MM({activeShotCamera:n,controller:e,exportFormat:t,exportGridLayerMode:i,exportGridOverlay:r,exportModelLayers:s,exportSplatLayers:o,open:a=!1,onToggle:c=null,summaryActions:l=null,store:u,t:h}){return w`
		<${Yt}
			icon="export-tab"
			label=${h("section.exportSettings")}
			helpSectionId="export"
			onOpenHelp=${d=>{var p,m;return(m=(p=e())==null?void 0:p.openHelp)==null?void 0:m.call(p,{sectionId:d})}}
			open=${a}
			summaryActions=${l}
			onToggle=${c}
		>
			<label class="field">
				<span class="field-label-tooltip">
					${h("field.shotCameraExportName")}
					<${he}
						title=${h("field.shotCameraExportName")}
						description=${h("tooltip.shotCameraExportName")}
						placement="right"
					/>
				</span>
				<${Pi}
					id="shot-camera-export-name"
					placeholder=${(n==null?void 0:n.name)??"Camera"}
					value=${u.shotCamera.exportName.value}
					onCommit=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportName(d)}}
				/>
			</label>
			<label class="field">
				<span>${h("field.exportFormat")}</span>
				<select
					id="shot-camera-export-format"
					value=${t}
					...${Yr}
					onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportFormat(d.currentTarget.value)}}
				>
					<option value="png">${h("exportFormat.png")}</option>
					<option value="psd">${h("exportFormat.psd")}</option>
				</select>
			</label>
			<label class="checkbox-field">
				<input
					id="shot-camera-export-grid-overlay"
					type="checkbox"
					checked=${r}
					onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportGridOverlay(d.currentTarget.checked)}}
				/>
				<span>${h("field.exportGridOverlay")}</span>
			</label>
			${r&&w`
					<label class="field">
						<span class="field-label-tooltip">
							${h("field.exportGridLayerMode")}
							<${he}
								title=${h("field.exportGridLayerMode")}
								description=${h("tooltip.exportGridLayerModeField")}
								placement="right"
							/>
						</span>
						<select
							id="shot-camera-export-grid-layer-mode"
							value=${i}
							...${Yr}
							onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportGridLayerMode(d.currentTarget.value)}}
						>
							<option value="bottom">${h("gridLayerMode.bottom")}</option>
							<option value="overlay">${h("gridLayerMode.overlay")}</option>
						</select>
					</label>
				`}
			${t==="psd"&&w`
					<label class="checkbox-field">
						<input
							id="shot-camera-export-model-layers"
							type="checkbox"
							checked=${s}
							onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportModelLayers(d.currentTarget.checked)}}
						/>
						<span class="field-label-tooltip">
							${h("field.exportModelLayers")}
							<${he}
								title=${h("field.exportModelLayers")}
								description=${h("tooltip.exportModelLayersField")}
								placement="right"
							/>
						</span>
					</label>
					<label class="checkbox-field">
						<input
							id="shot-camera-export-splat-layers"
							type="checkbox"
							checked=${o}
							disabled=${!s}
							onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportSplatLayers(d.currentTarget.checked)}}
						/>
						<span class="field-label-tooltip">
							${h("field.exportSplatLayers")}
							<${he}
								title=${h("field.exportSplatLayers")}
								description=${h("tooltip.exportSplatLayersField")}
								placement="right"
							/>
						</span>
					</label>
				`}
		<//>
	`}function SM({anchorOptions:n,controller:e,exportSizeLabel:t,open:i=!0,summaryActions:r=null,onToggle:s=null,heightLabel:o,store:a,t:c,widthLabel:l}){const u=a.renderBox.anchor.value;return w`
		<${Yt}
			icon="render-box"
			label=${c("section.outputFrame")}
			helpSectionId="output-frame-and-frames"
			onOpenHelp=${h=>{var d,p;return(p=(d=e())==null?void 0:d.openHelp)==null?void 0:p.call(d,{sectionId:h})}}
			open=${i}
			summaryMeta=${w`<span id="export-size-pill" class="pill pill--dim">${t}</span>`}
			summaryActions=${r}
			onToggle=${s}
		>
			<label class="field field--range">
				<span>${c("field.outputFrameWidth")}</span>
				<div class="range-row">
					<${Vo}
						id="box-width"
						min=${hc}
						max=${Qg}
						step="1"
						value=${Math.round(a.renderBox.widthScale.value*100)}
						controller=${e}
						historyLabel="output-frame.width"
						onLiveChange=${h=>{var d;return(d=e())==null?void 0:d.setBoxWidthPercent(h.currentTarget.value)}}
					/>
					<output id="box-width-value">${l}</output>
				</div>
			</label>
			<label class="field field--range">
				<span>${c("field.outputFrameHeight")}</span>
				<div class="range-row">
					<${Vo}
						id="box-height"
						min=${hc}
						max=${ey}
						step="1"
						value=${Math.round(a.renderBox.heightScale.value*100)}
						controller=${e}
						historyLabel="output-frame.height"
						onLiveChange=${h=>{var d;return(d=e())==null?void 0:d.setBoxHeightPercent(h.currentTarget.value)}}
					/>
					<output id="box-height-value">${o}</output>
				</div>
			</label>
			<div class="field field--inline-compact field--anchor-compact">
				<span class="field-label-tooltip">
					${c("field.anchor")}
					<${he}
						title=${c("field.anchor")}
						description=${c("tooltip.outputFrameAnchorField")}
						placement="right"
					/>
				</span>
				<div class="field--inline-compact__value field--anchor-compact__value">
					<div
						class="anchor-matrix"
						role="grid"
						aria-label=${c("field.anchor")}
					>
						${n.map(h=>w`
								<button
									key=${h.value}
									type="button"
									class=${h.value===u?"anchor-matrix__cell anchor-matrix__cell--active":"anchor-matrix__cell"}
									aria-label=${h.label}
									title=${h.label}
									onPointerDown=${W}
									onClick=${d=>{var p;W(d),(p=e())==null||p.setAnchor(h.value)}}
								></button>
							`)}
					</div>
				</div>
			</div>
		<//>
	`}function $M({controller:n,exportBusy:e,exportPresetIds:t,exportSelectionMissing:i,exportTarget:r,open:s=!0,summaryActions:o=null,onToggle:a=null,store:c,t:l}){const u=c.referenceImages.exportSessionEnabled.value!==!1;return w`
		<${Yt}
			icon="export-tab"
			label=${l("section.export")}
			helpSectionId="export"
			onOpenHelp=${h=>{var d,p;return(p=(d=n())==null?void 0:d.openHelp)==null?void 0:p.call(d,{sectionId:h})}}
			open=${s}
			summaryActions=${o}
			onToggle=${a}
			className="panel-disclosure--preview"
		>
			<div class="field">
				<div class="field__label-row">
					<label class="field__label-inline" for="export-target">
						${l("field.exportTarget")}
					</label>
					<button
						id="download-output"
						type="button"
						class="button button--primary button--compact field__label-action"
						disabled=${e||i}
						onClick=${()=>{var h;return(h=n())==null?void 0:h.downloadOutput()}}
					>
						${l("action.downloadOutput")}
					</button>
				</div>
				<select
					id="export-target"
					value=${r}
					...${Yr}
					onChange=${h=>{var d;return(d=n())==null?void 0:d.setExportTarget(h.currentTarget.value)}}
				>
					<option value="current">${l("exportTarget.current")}</option>
					<option value="all">${l("exportTarget.all")}</option>
					<option value="selected">${l("exportTarget.selected")}</option>
				</select>
			</div>
			${r==="selected"&&w`
					<div class="field">
						<span>${l("field.exportPresetSelection")}</span>
						<div class="export-selection-list">
							${c.workspace.shotCameras.value.map(h=>{var d,p;return w`
									<label class="export-selection-item">
										<input
											type="checkbox"
											checked=${t.includes(h.id)}
											onChange=${()=>{var m;return(m=n())==null?void 0:m.toggleExportPreset(h.id)}}
										/>
										<span class="export-selection-item__name"
											>${h.name}</span
										>
										<span class="export-selection-item__meta">
											${((p=(d=h.exportSettings)==null?void 0:d.exportName)==null?void 0:p.trim())||h.name}
										</span>
									</label>
								`})}
						</div>
					</div>
				`}
			<label class="checkbox-field">
				<input
					type="checkbox"
					checked=${u}
					onChange=${h=>{var d,p;return(p=(d=n())==null?void 0:d.setReferenceImageExportSessionEnabled)==null?void 0:p.call(d,h.currentTarget.checked)}}
				/>
				<span>${l("field.exportReferenceImages")}</span>
			</label>
		<//>
	`}function Cx({controller:n,mode:e,store:t,t:i}){var c,l;const r=e==="camera",s=i(r?"section.displayZoom":"section.view"),o=r?Math.round(t.renderBox.viewZoom.value*100):Number(t.viewportEquivalentMmValue.value).toFixed(2),a=r?!!((l=(c=n())==null?void 0:c.canFitOutputFrameToSafeArea)!=null&&l.call(c)):!1;return w`
		<div class="workbench-tool-rail__popover" role="group" aria-label=${s}>
			<label class="field workbench-tool-rail__popover-field">
				<span>${s}</span>
				<div class="workbench-tool-rail__popover-value">
					<div class="workbench-tool-rail__popover-input">
						<${zn}
							id=${r?"tool-view-zoom":"tool-viewport-fov"}
							inputMode="decimal"
							min=${r?Kh:14}
							max=${r?Qh:200}
							step=${r?"1":"0.01"}
							value=${o}
							controller=${n}
							historyLabel=${r?"output-frame.zoom":"viewport.lens"}
							onCommit=${u=>{var h,d;return r?(d=(h=n())==null?void 0:h.setViewZoomPercent)==null?void 0:d.call(h,u):Uo(p=>{var m;return(m=n())==null?void 0:m.setViewportBaseFovX(p)},u)}}
						/>
					</div>
					<span
						class="workbench-tool-rail__popover-suffix"
						aria-label=${i(r?"unit.percent":"unit.millimeter")}
						>${r?"%":"mm"}</span
					>
				</div>
			</label>
			${!r&&w`
					<p class="workbench-tool-rail__popover-summary">
						${i("field.viewportFov")} ${t.viewportFovLabel.value}
					</p>
				`}
			${r&&w`
					<div class="button-row button-row--compact workbench-tool-rail__popover-actions">
						<${K}
							icon="reset"
							label=${i("action.fitOutputFrameToSafeArea")}
							compact=${!0}
							disabled=${!a}
							onClick=${()=>{var u,h;return(h=(u=n())==null?void 0:u.fitOutputFrameToSafeArea)==null?void 0:h.call(u)}}
						/>
					</div>
				`}
		</div>
	`}function Fx({controller:n,hasFrames:e,store:t,t:i}){const r=t.frames.maskMode.value,s=t.frames.maskOpacityPct.value,o=t.frames.maskShape.value,a=t.frames.trajectoryMode.value,c=t.frames.trajectoryNodeMode.value,l=t.frames.trajectoryExportSource.value,u=t.frames.trajectoryEditMode.value,h=t.frames.maskSelectedIds.value??[],d=t.frames.selectedIds.value??[],p=t.frames.activeId.value,m=jr-t.frames.count.value,f=h.length>0,g=t.frames.count.value>1,y=g&&a==="spline"&&!!p,_=Math.max(d.length,p?1:0),M=t.frames.count.value<jr,x=_>0&&m>=_,v=d.length>0||!!p,P=[{value:"bounds",label:i("frameMaskShape.bounds")},{value:"trajectory",label:i("frameMaskShape.trajectory")}],E=[{value:"line",label:i("frameTrajectoryMode.line")},{value:"spline",label:i("frameTrajectoryMode.spline")}],S=[{value:"auto",label:i("frameTrajectoryNodeMode.auto")},{value:"corner",label:i("frameTrajectoryNodeMode.corner")},{value:"mirrored",label:i("frameTrajectoryNodeMode.mirrored")},{value:"free",label:i("frameTrajectoryNodeMode.free")}],C=[{value:"none",label:i("trajectorySource.none")},{value:"center",label:i("trajectorySource.center")},{value:"top-left",label:i("trajectorySource.topLeft")},{value:"top-right",label:i("trajectorySource.topRight")},{value:"bottom-right",label:i("trajectorySource.bottomRight")},{value:"bottom-left",label:i("trajectorySource.bottomLeft")}];return w`
		<div
			class="workbench-tool-rail__popover workbench-tool-rail__popover--mask"
			role="group"
			aria-label=${i("action.frameTool")}
		>
			<label class="field workbench-tool-rail__popover-field">
				<span>${i("section.frames")}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${K}
						icon="plus"
						label=${i("action.newFrame")}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!M}
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.createFrame)==null?void 0:A.call(k)}}
						tooltip=${{title:i("action.newFrame"),placement:"right"}}
					/>
					<${K}
						icon="duplicate"
						label=${i("action.duplicateFrame")}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!x}
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.duplicateSelectedFrames)==null?void 0:A.call(k,d.length>0?d:null)}}
						tooltip=${{title:i("action.duplicateFrame"),placement:"right"}}
					/>
					<${K}
						icon="trash"
						label=${i("action.deleteFrame")}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!v}
						onClick=${()=>{var k,A,b,F;return d.length>0?(A=(k=n())==null?void 0:k.deleteSelectedFrames)==null?void 0:A.call(k,d):(F=(b=n())==null?void 0:b.deleteActiveFrame)==null?void 0:F.call(b)}}
						tooltip=${{title:i("action.deleteFrame"),placement:"right"}}
					/>
				</div>
			</label>
			<label class="field workbench-tool-rail__popover-field">
				<span>${i("section.mask")}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${K}
						icon="slash-circle"
						label=${i("transformMode.none")}
						active=${r==="off"}
						compact=${!0}
						className="frame-mask-toolbar__button"
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.setFrameMaskMode)==null?void 0:A.call(k,"off")}}
						tooltip=${{title:i("transformMode.none"),placement:"right"}}
					/>
					<${K}
						icon="mask-all"
						label=${i("action.toggleAllFrameMask")}
						active=${r==="all"}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!e}
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.toggleFrameMaskMode)==null?void 0:A.call(k,"all")}}
						tooltip=${{title:i("action.toggleAllFrameMask"),description:i("tooltip.frameMaskAll"),shortcut:"F",placement:"right"}}
					/>
					<${K}
						icon="mask-selected"
						label=${i("action.toggleSelectedFrameMask")}
						active=${r==="selected"}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!f}
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.toggleFrameMaskMode)==null?void 0:A.call(k,"selected")}}
						tooltip=${{title:i("action.toggleSelectedFrameMask"),description:i("tooltip.frameMaskSelected"),shortcut:"Shift+F",placement:"right"}}
					/>
				</div>
			</label>
			<div class="workbench-tool-rail__popover-grid">
				<label class="field workbench-tool-rail__popover-field">
					<span>${i("field.frameMaskOpacity")}</span>
					<div class="workbench-tool-rail__popover-value">
						<div class="workbench-tool-rail__popover-input">
							<${zn}
								id="tool-frame-mask-opacity"
								inputMode="decimal"
								min="0"
								max="100"
								step="1"
								value=${Number(s).toFixed(0)}
								controller=${n}
								disabled=${!e}
								historyLabel="frame.mask-opacity"
								onCommit=${k=>{var A,b;return(b=(A=n())==null?void 0:A.setFrameMaskOpacity)==null?void 0:b.call(A,k)}}
							/>
						</div>
						<span
							class="workbench-tool-rail__popover-suffix"
							aria-label=${i("unit.percent")}
							>%</span
						>
					</div>
				</label>
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${i("field.frameMaskShape")}
						<${he}
							title=${i("field.frameMaskShape")}
							description=${i("tooltip.frameMaskShapeField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${o}
							onChange=${k=>{var A,b;return(b=(A=n())==null?void 0:A.setFrameMaskShape)==null?void 0:b.call(A,k.currentTarget.value)}}
						>
							${P.map(k=>w`
									<option value=${k.value}>${k.label}</option>
								`)}
						</select>
					</div>
				</label>
			</div>
			<div class="workbench-tool-rail__popover-mode-row">
				<label class="field workbench-tool-rail__popover-field workbench-tool-rail__popover-mode-field">
					<span class="field-label-tooltip">
						${i("field.frameTrajectoryMode")}
						<${he}
							title=${i("field.frameTrajectoryMode")}
							description=${i("tooltip.frameTrajectoryModeField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${a}
							disabled=${!e}
							onChange=${k=>{var A,b;return(b=(A=n())==null?void 0:A.setFrameTrajectoryMode)==null?void 0:b.call(A,k.currentTarget.value)}}
						>
							${E.map(k=>w`
									<option value=${k.value}>${k.label}</option>
								`)}
						</select>
					</div>
				</label>
				<div class="button-row button-row--compact workbench-tool-rail__popover-actions workbench-tool-rail__popover-mode-actions">
					<${K}
						icon="cursor"
						label=${i("action.toggleFrameTrajectoryEdit")}
						active=${u}
						compact=${!0}
						disabled=${!e}
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.toggleFrameTrajectoryEditMode)==null?void 0:A.call(k)}}
						tooltip=${{title:i("action.toggleFrameTrajectoryEdit"),description:i("tooltip.toggleFrameTrajectoryEdit"),placement:"right"}}
					/>
					<${K}
						icon="reset"
						label=${i("action.resetFrameTrajectoryNodeAuto")}
						compact=${!0}
						disabled=${!y||c==="auto"}
						onClick=${()=>{var k,A;return(A=(k=n())==null?void 0:k.setFrameTrajectoryNodeMode)==null?void 0:A.call(k,p,"auto")}}
						tooltip=${{title:i("action.resetFrameTrajectoryNodeAuto"),description:i("tooltip.resetFrameTrajectoryNodeAuto"),placement:"right"}}
					/>
				</div>
			</div>
			<div class="workbench-tool-rail__popover-grid">
				${y&&w`
						<label class="field workbench-tool-rail__popover-field">
							<span class="field-label-tooltip">
								${i("field.frameTrajectoryNodeMode")}
								<${he}
									title=${i("field.frameTrajectoryNodeMode")}
									description=${i("tooltip.frameTrajectoryNodeModeField")}
									placement="right"
								/>
							</span>
							<div class="workbench-tool-rail__popover-value">
								<select
									class="workbench-tool-rail__popover-select"
									value=${c}
									onChange=${k=>{var A,b;return(b=(A=n())==null?void 0:A.setFrameTrajectoryNodeMode)==null?void 0:b.call(A,p,k.currentTarget.value)}}
								>
									${S.map(k=>w`
											<option value=${k.value}>${k.label}</option>
										`)}
								</select>
							</div>
						</label>
					`}
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${i("field.frameTrajectoryExportSource")}
						<${he}
							title=${i("field.frameTrajectoryExportSource")}
							description=${i("tooltip.frameTrajectoryExportSourceField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${l}
							disabled=${!g}
							onChange=${k=>{var A,b;return(b=(A=n())==null?void 0:A.setFrameTrajectoryExportSource)==null?void 0:b.call(A,k.currentTarget.value)}}
						>
							${C.map(k=>w`
									<option value=${k.value}>${k.label}</option>
								`)}
						</select>
					</div>
				</label>
			</div>
		</div>
	`}function kM({controller:n,mode:e,menuChildren:t=null,projectMenuItems:i=[],railRef:r=null,railOnWheel:s=null,store:o,tailContent:a=null,showQuickMenu:c=!1,t:l,tooltipPlacement:u="right",menuPanelPlacement:h="down"}){const d=e==="viewport"||e==="camera",p=o.selectedSceneAsset.value,m=o.interactionMode.value,f=o.frames.maskMode.value,g=o.measurement.active.value,y=o.frames.count.value>0,_=o.history.canUndo.value,M=o.history.canRedo.value,[x,v]=ge(!1),P=we(null),E=!!p&&(o.viewportTransformMode.value||o.viewportPivotEditMode.value),S=d&&m==="zoom",C=e==="camera"&&x,k=l(e==="camera"?"section.displayZoom":"section.view"),A=`${l("section.transformSpace")} / ${l("transformSpace.world")}`,b=`${l("section.transformSpace")} / ${l("transformSpace.local")}`;Re(()=>{if(!C)return;const R=G=>{var q,B;const te=G.target instanceof Element?G.target:null;te!=null&&te.closest(".frame-item, .frame-trajectory-layer")||(q=P.current)!=null&&q.contains(te)||(B=P.current)!=null&&B.contains(te)||v(!1)},O=G=>{G.key==="Escape"&&v(!1)};return document.addEventListener("pointerdown",R,!0),document.addEventListener("keydown",O),()=>{document.removeEventListener("pointerdown",R,!0),document.removeEventListener("keydown",O)}},[C]),Re(()=>{e!=="camera"&&v(!1)},[e]);const F=()=>{var R,O,G,te,q,B,U,le,$e,nt,L,X,ee,H,T;(O=(R=n())==null?void 0:R.clearSceneAssetSelection)==null||O.call(R),(te=(G=n())==null?void 0:G.clearSplatSelection)==null||te.call(G),(B=(q=n())==null?void 0:q.clearReferenceImageSelection)==null||B.call(q),(le=(U=n())==null?void 0:U.clearFrameSelection)==null||le.call(U),(nt=($e=n())==null?void 0:$e.clearOutputFrameSelection)==null||nt.call($e),(X=(L=n())==null?void 0:L.setMeasurementMode)==null||X.call(L,!1,{silent:!0}),(H=(ee=n())==null?void 0:ee.setSplatEditMode)==null||H.call(ee,!1,{silent:!0}),(T=n())==null||T.setViewportTransformMode(!1)},z=(R,O)=>{if(R){F();return}O==null||O()};return w`
		<section
			class="workbench-tool-rail"
			aria-label=${l("section.tools")}
			ref=${r}
			onWheel=${s}
		>
			<${Kb}
				label=${l("section.file")}
				items=${i}
				panelPlacement=${h}
				tooltip=${{title:l("section.file"),description:l("tooltip.fileMenu"),placement:u}}
			>
				${t}
			<//>
			${c&&w`
					<${K}
						icon="undo"
						label=${l("action.undo")}
						disabled=${!_}
						className="workbench-tool-rail__button"
						tooltip=${{title:l("action.undo"),description:l("tooltip.undo"),shortcut:"Ctrl+Z",placement:u}}
						onClick=${()=>{var R,O;return(O=(R=n())==null?void 0:R.undoHistory)==null?void 0:O.call(R)}}
					/>
					<${K}
						icon="redo"
						label=${l("action.redo")}
						disabled=${!M}
						className="workbench-tool-rail__button"
						tooltip=${{title:l("action.redo"),description:l("tooltip.redo"),shortcut:"Ctrl+Shift+Z",placement:u}}
						onClick=${()=>{var R,O;return(O=(R=n())==null?void 0:R.redoHistory)==null?void 0:O.call(R)}}
					/>
				`}
			${c&&w`
					<${K}
						icon="pie-menu"
						label=${l("action.quickMenu")}
						className="workbench-tool-rail__button"
						tooltip=${{title:l("action.quickMenu"),description:l("tooltip.quickMenu"),placement:u}}
						onClick=${()=>{var R,O;return(O=(R=n())==null?void 0:R.openViewportPieMenuAtCenter)==null?void 0:O.call(R)}}
					/>
				`}
			<div class="workbench-tool-rail__divider"></div>
			<div class="workbench-tool-rail__group">
				<div
					class="workbench-tool-rail__segmented workbench-tool-rail__segmented--vertical"
					role="group"
					aria-label=${l("section.viewMode")}
				>
					<button
						id="mode-camera"
						type="button"
						class=${e==="camera"?"workbench-tool-rail__segment is-active":"workbench-tool-rail__segment"}
						aria-label=${l("mode.camera")}
						onClick=${()=>{var R;return(R=n())==null?void 0:R.setMode("camera")}}
					>
						<${_e} name="camera-dslr" size=${16} />
						<${he}
							title=${l("mode.camera")}
							description=${l("tooltip.modeCamera")}
							placement=${u}
						/>
					</button>
					<button
						id="mode-viewport"
						type="button"
						class=${e==="viewport"?"workbench-tool-rail__segment is-active":"workbench-tool-rail__segment"}
						aria-label=${l("mode.viewport")}
						onClick=${()=>{var R;return(R=n())==null?void 0:R.setMode("viewport")}}
					>
						<${_e} name="viewport" size=${16} />
						<${he}
							title=${l("mode.viewport")}
							description=${l("tooltip.modeViewport")}
							placement=${u}
						/>
					</button>
				</div>
			</div>
			${d&&w`
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
							<${K}
								icon="cursor"
								label=${l("transformMode.select")}
								active=${o.viewportSelectMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.select"),description:l("tooltip.toolSelect"),shortcut:"V",placement:u}}
								onClick=${()=>z(o.viewportSelectMode.value,()=>{var R;return(R=n())==null?void 0:R.setViewportSelectMode(!0)})}
							/>
							<${K}
								icon="reference-tool"
								label=${l("transformMode.reference")}
								active=${o.viewportReferenceImageEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.reference"),description:l("tooltip.toolReference"),shortcut:"Shift+R",placement:u}}
								onClick=${()=>z(o.viewportReferenceImageEditMode.value,()=>{var R;return(R=n())==null?void 0:R.setViewportReferenceImageEditMode(!0)})}
							/>
							<${K}
								icon="grip"
								label=${l("action.splatEditTool")}
								active=${o.splatEdit.active.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("action.splatEditTool"),description:l("tooltip.toolSplatEdit"),shortcut:"Shift+E",placement:u}}
								onClick=${()=>z(o.splatEdit.active.value,()=>{var R,O;return(O=(R=n())==null?void 0:R.setSplatEditMode)==null?void 0:O.call(R,!0)})}
							/>
							<${K}
								icon="move"
								label=${l("transformMode.transform")}
								active=${o.viewportTransformMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.transform"),description:l("tooltip.toolTransform"),shortcut:"T",placement:u}}
								onClick=${()=>z(o.viewportTransformMode.value,()=>{var R;return(R=n())==null?void 0:R.setViewportTransformMode(!0)})}
							/>
							<${K}
								icon="pivot"
								label=${l("transformMode.pivot")}
								active=${o.viewportPivotEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.pivot"),description:l("tooltip.toolPivot"),shortcut:"Q",placement:u}}
								onClick=${()=>z(o.viewportPivotEditMode.value,()=>{var R;return(R=n())==null?void 0:R.setViewportPivotEditMode(!0)})}
							/>
							<div class="workbench-tool-rail__tool-slot">
								<${K}
									icon="zoom"
									label=${l("action.zoomTool")}
									active=${S}
									className="workbench-tool-rail__button"
									tooltip=${{title:k,description:l("tooltip.toolZoom"),shortcut:"Z",placement:u}}
									onClick=${()=>{var R,O;return(O=(R=n())==null?void 0:R.toggleZoomTool)==null?void 0:O.call(R)}}
								/>
								${S&&w`
										<${Cx}
											controller=${n}
											mode=${e}
											store=${o}
											t=${l}
										/>
									`}
							</div>
							<${K}
								icon="ruler"
								label=${l("action.measureTool")}
								active=${g}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("action.measureTool"),description:l("tooltip.measureTool"),shortcut:"M",placement:u}}
								onClick=${()=>{var R,O;return(O=(R=n())==null?void 0:R.toggleMeasurementMode)==null?void 0:O.call(R)}}
							/>
							${e==="camera"&&w`
									<div
										class="workbench-tool-rail__tool-slot"
										ref=${P}
									>
										<${K}
											icon="mask"
											label=${l("action.frameTool")}
											active=${C||f!=="off"}
											className="workbench-tool-rail__button"
											tooltip=${{title:l("action.frameTool"),description:l("tooltip.frameTool"),shortcut:"F",placement:u}}
											onClick=${()=>v(R=>!R)}
										/>
										${C&&w`
												<${Fx}
													controller=${n}
													hasFrames=${y}
													store=${o}
													t=${l}
												/>
											`}
									</div>
								`}
					</div>
					${E&&w`
							<div class="workbench-tool-rail__divider"></div>
							<div class="workbench-tool-rail__group workbench-tool-rail__group--compact">
								<div
									class="workbench-tool-rail__segmented"
									role="group"
									aria-label=${l("section.transformSpace")}
								>
									<button
										type="button"
										class=${o.viewportTransformSpace.value==="world"?"workbench-tool-rail__segment is-active":"workbench-tool-rail__segment"}
										aria-label=${A}
										title=${A}
										onClick=${()=>{var R;return(R=n())==null?void 0:R.setViewportTransformSpace("world")}}
									>
										W
									</button>
									<button
										type="button"
										class=${o.viewportTransformSpace.value==="local"?"workbench-tool-rail__segment is-active":"workbench-tool-rail__segment"}
										aria-label=${b}
										title=${b}
										onClick=${()=>{var R;return(R=n())==null?void 0:R.setViewportTransformSpace("local")}}
									>
										L
									</button>
								</div>
							</div>
						`}
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
						<${K}
							icon="selection-clear"
							label=${l("action.clearSelection")}
							className="workbench-tool-rail__button"
							tooltip=${{title:l("action.clearSelection"),description:l("tooltip.clearSelection"),shortcut:"Ctrl+D",placement:u}}
							onClick=${()=>F()}
						/>
					</div>
				`}
			${a}
		</section>
	`}function EM({activeQuickSectionId:n=null,activeTab:e,onOpenFullTab:t,onToggleQuickSection:i,quickSections:r=[],t:s}){const o=ad(s);return w`
		<section class="workbench-inspector-rail" aria-label=${s("section.project")}>
			<div class="workbench-inspector-rail__group">
				${o.map(a=>{var c,l,u;return w`
						<${K}
							key=${a.id}
							icon=${a.icon}
							label=${a.label}
							active=${e===a.id}
							compact=${!0}
							className="workbench-inspector-rail__button"
							tooltip=${{title:((c=a.tooltip)==null?void 0:c.title)??a.label,description:((l=a.tooltip)==null?void 0:l.description)??"",shortcut:((u=a.tooltip)==null?void 0:u.shortcut)??"",placement:"left"}}
							onClick=${()=>t==null?void 0:t(a.id)}
						/>
					`})}
			</div>
			${r.length>0&&w`
					<div class="workbench-inspector-rail__divider"></div>
					<div class="workbench-inspector-rail__group">
						${r.map(a=>w`
								<${K}
									key=${a.id}
									icon=${a.icon}
									label=${a.label}
									active=${n===a.id}
									compact=${!0}
									className="workbench-inspector-rail__button"
									tooltip=${{title:a.label,description:s("tooltip.openQuickSection"),placement:"left"}}
									onClick=${()=>i==null?void 0:i(a.id)}
								/>
							`)}
					</div>
				`}
		</section>
	`}function TM({activeTab:n,setActiveTab:e,t}){const i=ad(t);return w`
		<${Jb}
			tabs=${i}
			activeTab=${n}
			setActiveTab=${e}
			ariaLabel=${t("section.project")}
			iconOnly=${!0}
		/>
	`}const Wc=15,Px={right:0,"top-right":135,top:90,"top-left":45,left:0,"bottom-left":135,bottom:90,"bottom-right":45},so=new Map;function Rx(n){const e=Number.isFinite(n)?n%360:0;return e<0?e+360:e}function Ix(n){return Math.round(Rx(n)/Wc)*Wc}function Dx(n){return`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${n} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6.6 16H25.4" stroke="#ffffff" stroke-width="4.8" />
				<path d="M6.6 16H25.4" stroke="#111111" stroke-width="1.9" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim()}function Go(n,e){const t=Px[e]??0,i=Ix((n??0)+t);if(!so.has(i)){const r=encodeURIComponent(Dx(i));so.set(i,`url("data:image/svg+xml,${r}") 16 16, ew-resize`)}return so.get(i)}function Nx(n,e){const t=(n==null?void 0:n.label)??"3DGS",i=Number.isFinite(n==null?void 0:n.current)?n.current:0,r=Number.isFinite(n==null?void 0:n.total)?n.total:0;return(n==null?void 0:n.status)==="done"?e("backgroundTask.autoLodDone"):(n==null?void 0:n.status)==="failed"?e("backgroundTask.autoLodFailed"):r>1?e("backgroundTask.autoLodRunningMulti",{current:Math.min(r,i+1),total:r,name:t}):e("backgroundTask.autoLodRunningSingle",{name:t})}function Xc(n){return(n==null?void 0:n.status)==="done"?w`<span class="background-task-pill__icon background-task-pill__icon--done">✓</span>`:(n==null?void 0:n.status)==="failed"?w`<span class="background-task-pill__icon background-task-pill__icon--failed">⚠</span>`:w`<span
		class="background-task-pill__icon background-task-pill__icon--spin"
		aria-hidden="true"
	></span>`}function Lx({store:n,t:e}){var o;const t=(o=n==null?void 0:n.backgroundTask)==null?void 0:o.value;if(!t)return null;let i="",r="",s=null;if(t.kind==="auto-lod")i=t.status==="failed"?"background-task-pill--failed":t.status==="done"?"background-task-pill--done":"background-task-pill--running",r=Nx(t,e),s=Xc(t);else{if(!t.label)return null;i="background-task-pill--running",r=t.label,s=Xc({status:"running"})}return w`
		<div
			class=${`background-task-pill ${i}`}
			role="status"
			aria-live="polite"
		>
			${s}
			<span class="background-task-pill__message">${r}</span>
		</div>
	`}function Yc(n){return!!(n&&n.width>0&&n.height>0)}function qc(n,{preferClientSize:e=!1}={}){if(!n)return null;const t=Number(e?n.clientWidth??n.offsetWidth??0:n.offsetWidth??n.clientWidth??0),i=Number(e?n.clientHeight??n.offsetHeight??0:n.offsetHeight??n.clientHeight??0);return!(t>0)||!(i>0)?null:{left:Number(n.offsetLeft??0),top:Number(n.offsetTop??0),width:t,height:i}}function zx({viewportRect:n=null,renderBoxRect:e=null}={}){const t=Yc(e)?e:n;if(Yc(t))return{left:`${t.left+t.width*.5}px`,top:`${t.top+t.height*.5}px`,bottom:"auto",transform:"translate(-50%, -50%)"}}const Zc=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Jc=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"];function Ox(n){return!Number.isFinite(n==null?void 0:n.x)||!Number.isFinite(n==null?void 0:n.y)||n.x<0||n.x>1||n.y<0||n.y>1?"":Pa(n)}function Bx(n=[]){return!Array.isArray(n)||n.length===0?"":n.map((e,t)=>`${t===0?"M":"L"} ${Number(e.x).toFixed(2)} ${Number(e.y).toFixed(2)}`).join(" ")}function Kc(n,e){return!n||!e?0:Math.hypot(n.x-e.x,n.y-e.y)}function Qc(n,e){return!n||!e?null:{x:e.x-(n.x-e.x),y:e.y-(n.y-e.y)}}function jx({controller:n,exportWidth:e,exportHeight:t,frames:i,frameMaskShape:r,trajectoryMode:s,trajectoryNodesByFrameId:o,trajectoryEditMode:a,activeTrajectoryNodeMode:c,activeFrameId:l,selectedFrameIds:u,interactionsEnabled:h}){if(!(r===di||a)||i.length===0)return null;const p={trajectoryMode:s,trajectory:{nodesByFrameId:o}},m=pu(i,p,e,t,{source:je}),f=i.find(G=>G.id===l)??i[i.length-1]??null,g=f?i.findIndex(G=>G.id===f.id):-1,y=f?{x:f.x*e,y:f.y*t}:null,_=a&&s===pi&&f&&c!=="corner",M=_?Cn(i,p,f.id,"in",e,t):null,x=_?Cn(i,p,f.id,"out",e,t):null,v=M?{x:M.x*e,y:M.y*t}:null,P=x?{x:x.x*e,y:x.y*t}:null,E=v&&y&&Kc(v,y)>1?v:null,S=P&&y&&Kc(P,y)>1?P:null,C=_&&c==="auto"&&(g===0||g===i.length-1),k=C&&!E&&S&&y?Qc(S,y):null,A=C&&!S&&E&&y?Qc(E,y):null,b=E??k,F=S??A,z=!!k,R=!!A,O=(G,te)=>{var q,B;return(B=(q=n())==null?void 0:q.startFrameTrajectoryHandleDrag)==null?void 0:B.call(q,f.id,G,te)};return w`
		<div class="frame-trajectory-layer">
			<svg
				class="frame-trajectory-layer__svg"
				viewBox=${`0 0 ${e} ${t}`}
				preserveAspectRatio="none"
			>
				${m.length>=2&&w`
						<path
							class=${a?"frame-trajectory-layer__path frame-trajectory-layer__path--editing":"frame-trajectory-layer__path"}
							d=${Bx(m)}
						></path>
					`}
				${a&&y&&b&&w`
						<line
							class=${["frame-trajectory-layer__handle-guide","frame-trajectory-layer__handle-guide--in",z?"frame-trajectory-layer__handle-guide--ghost":""].filter(Boolean).join(" ")}
							x1=${y.x}
							y1=${y.y}
							x2=${b.x}
							y2=${b.y}
						></line>
					`}
				${a&&y&&F&&w`
						<line
							class=${["frame-trajectory-layer__handle-guide","frame-trajectory-layer__handle-guide--out",R?"frame-trajectory-layer__handle-guide--ghost":""].filter(Boolean).join(" ")}
							x1=${y.x}
							y1=${y.y}
							x2=${F.x}
							y2=${F.y}
						></line>
					`}
				${a&&i.map(G=>{const te=u.has(G.id);return w`
							<circle
								class=${["frame-trajectory-layer__node-hit",te?"frame-trajectory-layer__node-hit--selected":"",G.id===l?"frame-trajectory-layer__node-hit--active":""].filter(Boolean).join(" ")}
								cx=${G.x*e}
								cy=${G.y*t}
								r="14"
								onPointerDown=${h?q=>{var B,U;return(U=(B=n())==null?void 0:B.startFrameDrag)==null?void 0:U.call(B,G.id,q)}:void 0}
							></circle>
							<circle
								class=${["frame-trajectory-layer__node",te?"frame-trajectory-layer__node--selected":"",G.id===l?"frame-trajectory-layer__node--active":""].filter(Boolean).join(" ")}
								cx=${G.x*e}
								cy=${G.y*t}
								r="12"
								onPointerDown=${h?q=>{var B,U;return(U=(B=n())==null?void 0:B.startFrameDrag)==null?void 0:U.call(B,G.id,q)}:void 0}
							></circle>
						`})}
				${a&&b&&w`
						<circle
							class=${["frame-trajectory-layer__handle-contrast","frame-trajectory-layer__handle-contrast--in",z?"frame-trajectory-layer__handle-contrast--ghost":""].filter(Boolean).join(" ")}
							cx=${b.x}
							cy=${b.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${b.x}
							cy=${b.y}
							r="12"
							onPointerDown=${h?G=>O("in",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle","frame-trajectory-layer__handle--in",z?"frame-trajectory-layer__handle--ghost":""].filter(Boolean).join(" ")}
							cx=${b.x}
							cy=${b.y}
							r="9"
							onPointerDown=${h?G=>O("in",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle-core","frame-trajectory-layer__handle-core--in",z?"frame-trajectory-layer__handle-core--ghost":""].filter(Boolean).join(" ")}
							cx=${b.x}
							cy=${b.y}
							r="2.25"
						></circle>
					`}
				${a&&F&&w`
						<circle
							class=${["frame-trajectory-layer__handle-contrast","frame-trajectory-layer__handle-contrast--out",R?"frame-trajectory-layer__handle-contrast--ghost":""].filter(Boolean).join(" ")}
							cx=${F.x}
							cy=${F.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${F.x}
							cy=${F.y}
							r="12"
							onPointerDown=${h?G=>O("out",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle","frame-trajectory-layer__handle--out",R?"frame-trajectory-layer__handle--ghost":""].filter(Boolean).join(" ")}
							cx=${F.x}
							cy=${F.y}
							r="9"
							onPointerDown=${h?G=>O("out",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle-core","frame-trajectory-layer__handle-core--out",R?"frame-trajectory-layer__handle-core--ghost":""].filter(Boolean).join(" ")}
							cx=${F.x}
							cy=${F.y}
							r="2.25"
						></circle>
					`}
			</svg>
		</div>
	`}function eh({store:n,controller:e,frameOverlayCanvasRef:t,canvasOnly:i=!1,itemsOnly:r=!1,interactionsEnabled:s=!0}){const o=n.exportWidth.value,a=n.exportHeight.value,c=n.locale.value,l=n.frames.activeId.value,u=n.frames.selectionActive.value,h=new Set(n.frames.selectedIds.value??[]),d=u&&h.size>1,p=h.size,m=n.frames.selectionBoxLogical.value,f=n.frames.maskShape.value,g=n.frames.trajectoryMode.value,y=n.frames.trajectoryEditMode.value,_=n.frames.trajectoryNodesByFrameId.value??{},M=n.frames.trajectoryNodeMode.value??_a({trajectory:{nodesByFrameId:_}},l),x=n.frames.selectionAnchor.value&&Number.isFinite(n.frames.selectionAnchor.value.x)&&Number.isFinite(n.frames.selectionAnchor.value.y)?{x:n.frames.selectionAnchor.value.x,y:n.frames.selectionAnchor.value.y}:m?{x:m.anchorX??.5,y:m.anchorY??.5}:null;return w`
		<div
			class=${["frame-layer",i?"frame-layer--canvas":"",r?"frame-layer--items":"",s?"":"frame-layer--noninteractive"].filter(Boolean).join(" ")}
		>
			${!r&&w`
					<canvas
						id="frame-overlay-canvas"
						ref=${t}
						class="frame-layer__canvas"
					></canvas>
				`}
			${!i&&w`
					<${jx}
						controller=${e}
						exportWidth=${o}
						exportHeight=${a}
						frames=${n.frames.documents.value}
						frameMaskShape=${f}
						trajectoryMode=${g}
						trajectoryNodesByFrameId=${_}
						trajectoryEditMode=${y}
						activeTrajectoryNodeMode=${M}
						activeFrameId=${l}
						selectedFrameIds=${h}
						interactionsEnabled=${s}
					/>
				`}
			${!i&&n.frames.documents.value.map(v=>{const P=Number(v.scale)>0?v.scale:1,E=`${Math.round(P*100)}%`,S=Ke.width*P*100/o,C=Ke.height*P*100/a,k=u&&h.has(v.id),b=k&&l===v.id&&!d,F=k&&!d,z=k&&!d,R=(v.rotation??0)*Math.PI/180,O=t_(v,{width:Ke.width*P,height:Ke.height*P,rotationRadians:R},{boxWidth:o,boxHeight:a}),G=Pa(O),te=Oe(c,"action.deleteFrame"),q=Oe(c,"action.renameFrame");return w`
						<div
							class=${["frame-item",k?"frame-item--selected":"",b?"frame-item--active":""].filter(Boolean).join(" ")}
							data-anchor-handle=${G}
							style=${{left:`${v.x*100-S*.5}%`,top:`${v.y*100-C*.5}%`,width:`${S}%`,height:`${C}%`,transform:`rotate(${v.rotation??0}deg)`,transformOrigin:"center center"}}
						>
							${F&&w`
									<span class="frame-item__label">
										<span class="frame-item__label-text"
											><${Pi}
												class="frame-item__label-input"
												value=${v.name}
												aria-label=${q}
												maxLength=${$u}
												selectOnFocus=${!0}
												onCommit=${B=>{var U,le;return(le=(U=e())==null?void 0:U.setFrameName)==null?void 0:le.call(U,v.id,B)}}
											/></span
										>
										<span class="frame-item__label-scale"
											>${E}</span
										>
										${z&&w`
												<button
													type="button"
													class="frame-item__label-delete"
													aria-label=${te}
													title=${te}
													onPointerDown=${B=>{s&&(B.preventDefault(),B.stopPropagation())}}
													onClick=${s?B=>{var U,le;B.preventDefault(),B.stopPropagation(),(le=(U=e())==null?void 0:U.deleteFrame)==null||le.call(U,v.id)}:void 0}
												>
													<${_e} name="trash" size=${11} />
												</button>
											`}
									</span>
								`}
							<button
								type="button"
								class="frame-item__edge frame-item__edge--top"
								aria-label=${v.name}
								onPointerDown=${s?B=>{var U;return(U=e())==null?void 0:U.startFrameDrag(v.id,B)}:void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--right"
								aria-label=${v.name}
								onPointerDown=${s?B=>{var U;return(U=e())==null?void 0:U.startFrameDrag(v.id,B)}:void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--bottom"
								aria-label=${v.name}
								onPointerDown=${s?B=>{var U;return(U=e())==null?void 0:U.startFrameDrag(v.id,B)}:void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--left"
								aria-label=${v.name}
								onPointerDown=${s?B=>{var U;return(U=e())==null?void 0:U.startFrameDrag(v.id,B)}:void 0}
							></button>
							${Zc.map(B=>w`
									<button
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${B}`}
										style=${{cursor:Go(v.rotation??0,B)}}
										aria-label=${v.name}
										onPointerDown=${s?U=>{var le;return(le=e())==null?void 0:le.startFrameResize(v.id,B,U)}:void 0}
									></button>
								`)}
							${Jc.map(B=>w`
									<button
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${B}`}
										style=${{cursor:No(v.rotation??0,B)}}
										aria-label=${v.name}
										onPointerDown=${s?U=>{var le;return(le=e())==null?void 0:le.startFrameRotate(v.id,B,U)}:void 0}
									></button>
								`)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${{left:`${O.x*100}%`,top:`${O.y*100}%`}}
								aria-label=${v.name}
								onPointerDown=${s?B=>{var U;return(U=e())==null?void 0:U.startFrameAnchorDrag(v.id,B)}:void 0}
							></button>
						</div>
					`})}
			${!i&&d&&m&&x&&w`
					<div
						class="frame-item frame-item--selected frame-item--active frame-selection-group"
						data-anchor-handle=${Ox(x)}
						style=${{left:`${m.left*100/o}%`,top:`${m.top*100/a}%`,width:`${m.width*100/o}%`,height:`${m.height*100/a}%`,transform:`rotate(${m.rotationDeg??0}deg)`,transformOrigin:`${x.x*100}% ${x.y*100}%`}}
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
								aria-label=${Oe(c,"action.deleteFrame")}
								title=${Oe(c,"action.deleteFrame")}
								onPointerDown=${v=>{v.preventDefault(),v.stopPropagation()}}
								onClick=${v=>{var P,E;v.preventDefault(),v.stopPropagation(),(E=(P=e())==null?void 0:P.deleteSelectedFrames)==null||E.call(P)}}
							>
								<${_e} name="trash" size=${11} />
							</button>
						</span>
						${["top","right","bottom","left"].map(v=>w`
								<button
									type="button"
									class=${`frame-item__edge frame-item__edge--${v}`}
									aria-label="Selected FRAMEs"
									onPointerDown=${s?P=>{var E,S;return(S=(E=e())==null?void 0:E.startSelectedFramesDrag)==null?void 0:S.call(E,P)}:void 0}
								></button>
							`)}
						${Zc.map(v=>w`
								<button
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${v}`}
									style=${{cursor:Go(m.rotationDeg??0,v)}}
									aria-label="Resize selected FRAMEs"
									onPointerDown=${s?P=>{var E,S;return(S=(E=e())==null?void 0:E.startSelectedFramesResize)==null?void 0:S.call(E,v,P)}:void 0}
								></button>
							`)}
						${Jc.map(v=>w`
								<button
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${v}`}
									style=${{cursor:No(m.rotationDeg??0,v)}}
									aria-label="Rotate selected FRAMEs"
									onPointerDown=${s?P=>{var E,S;return(S=(E=e())==null?void 0:E.startSelectedFramesRotate)==null?void 0:S.call(E,v,P)}:void 0}
								></button>
							`)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{left:`${x.x*100}%`,top:`${x.y*100}%`}}
							aria-label="Move selected FRAME anchor"
							onPointerDown=${s?v=>{var P,E;return(E=(P=e())==null?void 0:P.startSelectedFramesAnchorDrag)==null?void 0:E.call(P,v)}:void 0}
						></button>
					</div>
				`}
		</div>
	`}function oo(n){return{left:`${n.x}px`,top:`${n.y}px`}}function Vx(n,e){const t=((e==null?void 0:e.x)??0)-((n==null?void 0:n.x)??0),i=((e==null?void 0:e.y)??0)-((n==null?void 0:n.y)??0),r=Math.hypot(t,i);return!Number.isFinite(r)||r<=.001?null:{left:`${n.x}px`,top:`${n.y}px`,width:`${r}px`,transform:`rotate(${Math.atan2(i,t)}rad)`}}function Ux({store:n,controller:e,t}){var d;if(!n.measurement.active.value)return null;const r=n.measurement.overlay.value,s=!!n.measurement.startPointWorld.value,o=!!n.measurement.endPointWorld.value,a=n.measurement.selectedPointKey.value??(o?"end":"start"),c=Number(n.measurement.lengthInputText.value),l=o&&r.chip.visible&&(((d=n.selectedSceneAssetIds.value)==null?void 0:d.length)??0)>0&&Number.isFinite(c)&&c>0,u=r.lineUsesDraft?r.draftEnd:r.end,h=r.lineVisible&&r.start.visible&&(u!=null&&u.visible)?Vx(r.start,u):null;return w`
		<div class="measurement-overlay" aria-hidden="false">
			${h&&w`
					<div
						class=${r.lineUsesDraft?"measurement-overlay__line-track measurement-overlay__line-track--draft":"measurement-overlay__line-track"}
						style=${h}
					>
						<div class="measurement-overlay__line-outline"></div>
						<div class="measurement-overlay__line-main"></div>
					</div>
				`}
			${s&&r.start.visible&&w`
					<button
						type="button"
						class=${a==="start"?"measurement-overlay__point measurement-overlay__point--selected":"measurement-overlay__point"}
						style=${oo(r.start)}
						aria-label=${t("action.measurementStartPoint")}
						onPointerDown=${p=>{var m,f;return(f=(m=e())==null?void 0:m.selectMeasurementPoint)==null?void 0:f.call(m,"start",p)}}
					></button>
				`}
			${o&&r.end.visible&&w`
					<button
						type="button"
						class=${a==="end"?"measurement-overlay__point measurement-overlay__point--selected":"measurement-overlay__point"}
						style=${oo(r.end)}
						aria-label=${t("action.measurementEndPoint")}
						onPointerDown=${p=>{var m,f;return(f=(m=e())==null?void 0:m.selectMeasurementPoint)==null?void 0:f.call(m,"end",p)}}
					></button>
				`}
			${r.chip.visible&&w`
					<div
						class=${`measurement-overlay__chip measurement-overlay__chip--${r.chip.placement??"dock-bottom"}`}
						style=${oo(r.chip)}
						onPointerDown=${p=>{p.stopPropagation()}}
					>
						<label class="measurement-overlay__chip-field">
							<span>${r.chip.label}</span>
							<div class="measurement-overlay__chip-row">
								<input
									type="text"
									inputmode="decimal"
									class="measurement-overlay__chip-input"
									value=${n.measurement.lengthInputText.value}
									aria-label=${t("field.measurementLength")}
									onInput=${p=>{var m,f;return(f=(m=e())==null?void 0:m.setMeasurementLengthInputText)==null?void 0:f.call(m,p.currentTarget.value)}}
									onKeyDown=${p=>{var m,f;p.key==="Enter"&&(p.preventDefault(),(f=(m=e())==null?void 0:m.applyMeasurementScale)==null||f.call(m))}}
								/>
								<span class="measurement-overlay__chip-unit">m</span>
								<button
									type="button"
									class="measurement-overlay__chip-apply"
									disabled=${!l}
									onClick=${()=>{var p,m;return(m=(p=e())==null?void 0:p.applyMeasurementScale)==null?void 0:m.call(p)}}
								>
									${t("action.apply")}
								</button>
							</div>
						</label>
					</div>
				`}
		</div>
	`}const th=["x","y","z"];function Hx({controller:n,rootRef:e,svgRef:t}){return w`
		<div
			ref=${e}
			class="viewport-axis-gizmo is-hidden"
			aria-label="Viewport Axis Gizmo"
		>
			<svg
				ref=${t}
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${th.map(i=>w`
						<line
							key=${i}
							data-axis-gizmo-line=${i}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${i}`}
							x1="50"
							y1="50"
							x2="50"
							y2="50"
						/>
					`)}
			</svg>
			${th.flatMap(i=>[w`
					<button
						key=${`pos-${i}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--positive viewport-axis-gizmo__button--${i}`}
						data-axis-gizmo-node=${`pos-${i}`}
						data-facing="positive"
						aria-label=${i.toUpperCase()}
						title=${i.toUpperCase()}
						onClick=${()=>{var r,s;return(s=(r=n())==null?void 0:r.alignViewportToOrthographicView)==null?void 0:s.call(r,`pos${i.toUpperCase()}`,{toggleOppositeOnRepeat:!0})}}
					>
						<span>${i.toUpperCase()}</span>
					</button>
				`,w`
					<button
						key=${`neg-${i}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--negative viewport-axis-gizmo__button--${i}`}
						data-axis-gizmo-node=${`neg-${i}`}
						data-facing="negative"
						aria-label=${`-${i.toUpperCase()}`}
						title=${`-${i.toUpperCase()}`}
						onClick=${()=>{var r,s;return(s=(r=n())==null?void 0:r.alignViewportToOrthographicView)==null?void 0:s.call(r,`neg${i.toUpperCase()}`,{toggleOppositeOnRepeat:!0})}}
					>
						<span></span>
					</button>
				`,w`
					<button
						key=${`axis-${i}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--axis-center viewport-axis-gizmo__button--${i}`}
						data-axis-gizmo-node=${`axis-${i}`}
						data-facing="positive"
						aria-label=${i.toUpperCase()}
						title=${i.toUpperCase()}
						onClick=${()=>{var r,s;return(s=(r=n())==null?void 0:r.toggleViewportOrthographicAxis)==null?void 0:s.call(r,i)}}
					>
						<span>${i.toUpperCase()}</span>
					</button>
				`])}
		</div>
	`}function Gx({store:n,controller:e,t}){const{projectDisplayName:i,projectDirty:r,showProjectPackageDirty:s}=d_(n,t),o=n.viewportLod.effectiveScale.value,a=C0(o),c=l=>{var u,h;(h=(u=e())==null?void 0:u.setViewportLodScale)==null||h.call(u,l.currentTarget.value)};return w`
		<div
			class="viewport-project-status"
			onPointerDown=${W}
			onClick=${W}
			onWheel=${Fi}
		>
			<label class="viewport-lod-scale viewport-lod-scale--tooltip">
				<span class="viewport-lod-scale__label">
					${t("viewportLodScale.label")}
				</span>
				<input
					...${Yr}
					class="viewport-lod-scale__range"
					type="range"
					min=${eu}
					max=${tu}
					step=${nu}
					value=${o}
					aria-label=${t("viewportLodScale.ariaLabel")}
					onInput=${c}
				/>
				<span class="viewport-lod-scale__value">${a}</span>
				<${he}
					title=${t("viewportLodScale.tooltipTitle")}
					description=${t("viewportLodScale.tooltipDescription")}
					placement="bottom"
				/>
			</label>
			<span class="viewport-project-status__separator" aria-hidden="true"></span>
			<span class="viewport-project-status__name">${i}</span>
			${r&&w`
					<span class="viewport-project-status__badge">*</span>
				`}
			${s&&w`
					<span
						class="viewport-project-status__badge viewport-project-status__badge--package"
					>
						PKG
					</span>
				`}
		</div>
	`}const Wx=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],nh=["top","right","bottom","left"],Xx=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Yx=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"];function qx({store:n,controller:e,t}){var k,A;const i=n.splatEdit.tool.value,r=n.splatEdit.selectionCount.value,s=n.splatEdit.brushSize.value,o=n.splatEdit.brushDepthMode.value,a=n.splatEdit.brushDepth.value,c=n.splatEdit.boxPlaced.value,l=n.splatEdit.boxCenter.value,u=n.splatEdit.boxSize.value,h=n.splatEdit.boxRotation.value,d=((k=n.splatEdit.lodStatus)==null?void 0:k.value)??"empty",p=((A=n.backgroundTask)==null?void 0:A.value)??null,m=(p==null?void 0:p.kind)==="auto-lod"&&(p==null?void 0:p.status)==="running",f=b=>{var F,z;return(z=(F=e())==null?void 0:F.setSplatEditTool)==null?void 0:z.call(F,b)},g=b=>{var F,z;return(z=(F=e())==null?void 0:F.setSplatEditBrushDepthMode)==null?void 0:z.call(F,b)},y=(b,F)=>{var R,O;const z=Number(F);Number.isFinite(z)&&((O=(R=e())==null?void 0:R.setSplatEditBoxCenterAxis)==null||O.call(R,b,z))},_=(b,F)=>{var R,O;const z=Number(F);Number.isFinite(z)&&((O=(R=e())==null?void 0:R.setSplatEditBoxSizeAxis)==null||O.call(R,b,z))},M=(b,F)=>{var R,O;const z=Number(F);Number.isFinite(z)&&((O=(R=e())==null?void 0:R.setSplatEditBoxRotationAxis)==null||O.call(R,b,z))},x=b=>{var z,R;const F=Number(b);Number.isFinite(F)&&((R=(z=e())==null?void 0:z.setSplatEditBrushSize)==null||R.call(z,F))},v=b=>{var z,R;const F=Number(b);Number.isFinite(F)&&((R=(z=e())==null?void 0:z.setSplatEditBrushDepth)==null||R.call(z,F))},P=b=>Number(b??0).toFixed(2),E=({label:b,value:F,step:z="0.10",min:R=void 0,historyLabel:O,onScrubValue:G,onCommitValue:te})=>w`
		<div class="viewport-splat-edit-toolbar__field camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${b}</span>
			<div class="camera-property-axis-field__input field">
				<${zn}
					inputMode="decimal"
					min=${R}
					step=${z}
					value=${P(F)}
					controller=${e}
					historyLabel=${O}
					formatDisplayValue=${P}
					scrubStartValue=${Number(F??0)}
					onScrubDelta=${(q,B)=>G(B)}
					onCommit=${q=>te(q)}
				/>
			</div>
		</div>
	`,S=new _t().setFromQuaternion(new Wt(Number((h==null?void 0:h.x)??0),Number((h==null?void 0:h.y)??0),Number((h==null?void 0:h.z)??0),Number((h==null?void 0:h.w)??1))),C={x:ri.radToDeg(S.x),y:ri.radToDeg(S.y),z:ri.radToDeg(S.z)};return w`
		<div class="viewport-splat-edit-toolbar">
			${i==="brush"&&w`
				<div class="viewport-splat-edit-popover">
					${E({label:"px",value:s??30,step:"1",min:"4",historyLabel:"splat-edit.brush-size",onScrubValue:b=>x(b),onCommitValue:b=>x(b)})}
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${o==="through"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>g("through")}>
						${t("status.splatEditBrushModeThrough")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${o==="depth"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>g("depth")}>
						${t("status.splatEditBrushModeDepth")}
					</button>
					${o==="depth"&&w`
						${E({label:t("status.splatEditBrushModeDepth"),value:a??.2,min:"0.01",historyLabel:"splat-edit.brush-depth",onScrubValue:b=>v(b),onCommitValue:b=>v(b)})}
					`}
				</div>
			`}
			${i==="box"&&w`
				<div class="viewport-splat-edit-popover">
					${c?w`
						<span class="viewport-splat-edit-toolbar__detail-label">${t("status.splatEditCenter")}</span>
						<div class="viewport-splat-edit-toolbar__detail-grid">
							${E({label:t("field.positionX"),value:(l==null?void 0:l.x)??0,historyLabel:"splat-edit.box-center.x",onScrubValue:b=>y("x",b),onCommitValue:b=>y("x",b)})}
							${E({label:t("field.positionY"),value:(l==null?void 0:l.y)??0,historyLabel:"splat-edit.box-center.y",onScrubValue:b=>y("y",b),onCommitValue:b=>y("y",b)})}
							${E({label:t("field.positionZ"),value:(l==null?void 0:l.z)??0,historyLabel:"splat-edit.box-center.z",onScrubValue:b=>y("z",b),onCommitValue:b=>y("z",b)})}
						</div>
						<span class="viewport-splat-edit-toolbar__detail-label">${t("status.splatEditSize")}</span>
						<div class="viewport-splat-edit-toolbar__detail-grid">
							${E({label:t("field.positionX"),value:(u==null?void 0:u.x)??1,min:"0.01",historyLabel:"splat-edit.box-size.x",onScrubValue:b=>_("x",b),onCommitValue:b=>_("x",b)})}
							${E({label:t("field.positionY"),value:(u==null?void 0:u.y)??1,min:"0.01",historyLabel:"splat-edit.box-size.y",onScrubValue:b=>_("y",b),onCommitValue:b=>_("y",b)})}
							${E({label:t("field.positionZ"),value:(u==null?void 0:u.z)??1,min:"0.01",historyLabel:"splat-edit.box-size.z",onScrubValue:b=>_("z",b),onCommitValue:b=>_("z",b)})}
						</div>
						<span class="viewport-splat-edit-toolbar__detail-label">${t("field.assetRotation")}</span>
						<div class="viewport-splat-edit-toolbar__detail-grid">
							${E({label:t("field.positionX"),value:C.x,step:"1",historyLabel:"splat-edit.box-rotation.x",onScrubValue:b=>M("x",b),onCommitValue:b=>M("x",b)})}
							${E({label:t("field.positionY"),value:C.y,step:"1",historyLabel:"splat-edit.box-rotation.y",onScrubValue:b=>M("y",b),onCommitValue:b=>M("y",b)})}
							${E({label:t("field.positionZ"),value:C.z,step:"1",historyLabel:"splat-edit.box-rotation.z",onScrubValue:b=>M("z",b),onCommitValue:b=>M("z",b)})}
						</div>
						<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.applySplatEditBoxSelection)==null?void 0:F.call(b,{subtract:!1})}}>${t("status.splatEditAdd")}</button>
						<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.applySplatEditBoxSelection)==null?void 0:F.call(b,{subtract:!0})}}>${t("status.splatEditSubtract")}</button>
						<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.scaleSplatEditBoxUniform)==null?void 0:F.call(b,.9)}}>−<${he} title=${t("status.splatEditScaleDown")} placement="top" /></button>
						<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.scaleSplatEditBoxUniform)==null?void 0:F.call(b,1.1)}}>+<${he} title=${t("status.splatEditScaleUp")} placement="top" /></button>
					`:w`
						<span class="viewport-splat-edit-toolbar__info">${t("status.splatEditPlaceBoxHint")}</span>
					`}
					<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.fitSplatEditBoxToScope)==null?void 0:F.call(b)}}>${t("status.splatEditFitScope")}</button>
				</div>
			`}
			<div class="viewport-splat-edit-toolbar__bar">
				<!-- Tool selector -->
				<div class="viewport-splat-edit-toolbar__group" role="group" aria-label=${t("action.splatEditTool")}>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${i==="box"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>f("box")}>
						${t("status.splatEditToolBox")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${i==="brush"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>f("brush")}>
						${t("status.splatEditToolBrush")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${i==="transform"?" viewport-splat-edit-toolbar__btn--active":""}`} disabled=${r<=0&&i!=="transform"} onClick=${()=>f("transform")}>
						${t("status.splatEditToolTransform")}
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection operations -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.selectAllSplats)==null?void 0:F.call(b)}}>
						${t("status.splatEditSelectAll")}<${he} title=${t("status.splatEditSelectAll")} shortcut="Ctrl+A" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${r<=0} onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.invertSplatSelection)==null?void 0:F.call(b)}}>
						${t("status.splatEditInvert")}<${he} title=${t("status.splatEditInvert")} shortcut="Ctrl+I" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${r<=0} onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.clearSplatSelection)==null?void 0:F.call(b)}}>
						${t("action.clearSelection")}<${he} title=${t("action.clearSelection")} shortcut="Ctrl+D" placement="top" />
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Edit actions -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--danger" disabled=${r<=0} onClick=${()=>{var b,F;return void((F=(b=e())==null?void 0:b.deleteSelectedSplats)==null?void 0:F.call(b))}}>
						${t("status.splatEditDelete")}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${r<=0} onClick=${()=>{var b,F;return void((F=(b=e())==null?void 0:b.separateSelectedSplats)==null?void 0:F.call(b))}}>
						${t("status.splatEditSeparate")}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${r<=0} onClick=${()=>{var b,F;return void((F=(b=e())==null?void 0:b.duplicateSelectedSplats)==null?void 0:F.call(b))}}>
						${t("status.splatEditDuplicate")}
					</button>
				</div>
				${d!=="empty"&&w`
						<div class="viewport-splat-edit-toolbar__separator" />
						<div
							class="viewport-splat-edit-toolbar__group"
							role="group"
							aria-label=${t("action.splatEditOptimizeLod")}
						>
							<button
								type="button"
								class=${`viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--lod button--tooltip${d==="ready"?" viewport-splat-edit-toolbar__btn--lod-ready":""}${m?" viewport-splat-edit-toolbar__btn--lod-running":""}`}
								disabled=${d==="ready"||m}
								onClick=${()=>{var b,F;return(F=(b=e())==null?void 0:b.rebuildSplatEditLod)==null?void 0:F.call(b)}}
							>
								<span
									class=${`viewport-splat-edit-toolbar__lod-icon${m?" viewport-splat-edit-toolbar__lod-icon--spin":d==="ready"?" viewport-splat-edit-toolbar__lod-icon--done":""}`}
									aria-hidden="true"
								>
									${m?"":d==="ready"?"✓":"⚡"}
								</span>
								<span>
									${t(m?"status.splatEditLodRunning":d==="ready"?"status.splatEditLodReady":"status.splatEditLodStale")}
								</span>
								<${he}
									title=${t("status.splatEditLodTooltip")}
									placement="top"
								/>
							</button>
						</div>
					`}
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection count (right end) -->
				<span class="viewport-splat-edit-toolbar__info">
					${r} sel
				</span>
			</div>
		</div>
	`}function Zx({store:n,viewportShellRef:e}){const t=n.splatEdit.active.value,i=n.splatEdit.tool.value,r=n.splatEdit.brushPreview.value;if(!t||i!=="brush"||!(r!=null&&r.visible))return null;const s=(e==null?void 0:e.current)??e??null;if(!(s instanceof HTMLElement))return null;const o=Math.max(0,Number((r==null?void 0:r.radiusPx)??0)),a=s.getBoundingClientRect(),c={left:`${r.x-a.left-o}px`,top:`${r.y-a.top-o}px`,width:`${o*2}px`,height:`${o*2}px`},l=n.splatEdit.brushDepthBarVisible.value;return w`
		<div
			class=${r!=null&&r.subtract?r!=null&&r.painting?"viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract viewport-splat-edit-brush-preview--painting":"viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract":r!=null&&r.painting?"viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--painting":"viewport-splat-edit-brush-preview"}
			style=${c}
			aria-hidden="true"
		>
			<div class="viewport-splat-edit-brush-preview__ring"></div>
			${l&&Number(r==null?void 0:r.depthBarPx)>2&&w`
					<div
						class="viewport-splat-edit-brush-preview__depth-bar"
						style=${{height:`${Number(r.depthBarPx)}px`}}
					></div>
				`}
		</div>
	`}function Jx({store:n,refs:e}){const t=we(null),i=we(()=>{}),r=n.mode.value,s=n.frames.documents.value,o=n.frames.maskMode.value,a=n.frames.maskOpacityPct.value,c=n.frames.maskShape.value,l=n.frames.trajectoryMode.value,u=n.frames.trajectoryNodesByFrameId.value??{},h=n.exportWidth.value,d=n.exportHeight.value,p=Math.min(1,Math.max(0,(Number(a)||0)/100)),m=Vu(s,{mode:o,selectedIds:n.frames.maskSelectedIds.value??[]}),f=()=>{var S,C;const g=t.current,y=((S=e.viewportShellRef)==null?void 0:S.current)??e.viewportShellRef??null,_=((C=e.renderBoxRef)==null?void 0:C.current)??e.renderBoxRef??null;if(!(g instanceof HTMLCanvasElement)||!(y instanceof HTMLElement))return;const M=g.getContext("2d");if(!M)return;const x=Math.max(1,y.clientWidth),v=Math.max(1,y.clientHeight),P=Math.max(1,Math.round(x*pr)),E=Math.max(1,Math.round(v*pr));g.width!==P&&(g.width=P),g.height!==E&&(g.height=E),g.style.width=`${x}px`,g.style.height=`${v}px`,M.setTransform(1,0,0,1,0,0),M.clearRect(0,0,g.width,g.height),!(r!=="camera"||p<=0||m.length===0||!(_ instanceof HTMLElement)||_.offsetWidth<=0||_.offsetHeight<=0)&&(M.scale(pr,pr),Hu(M,m,{canvasWidth:x,canvasHeight:v,frameSpaceWidth:_.offsetWidth,frameSpaceHeight:_.offsetHeight,logicalSpaceWidth:h,logicalSpaceHeight:d,offsetX:_.offsetLeft,offsetY:_.offsetTop,fillStyle:`rgba(3, 6, 11, ${p})`,frameMaskSettings:{shape:c,trajectoryMode:l,trajectory:{nodesByFrameId:u}}}),M.setTransform(1,0,0,1,0,0))};return i.current=f,ho(()=>{f()}),ho(()=>{var v,P;const g=((v=e.viewportShellRef)==null?void 0:v.current)??e.viewportShellRef??null,y=((P=e.renderBoxRef)==null?void 0:P.current)??e.renderBoxRef??null;if(!(g instanceof HTMLElement)&&!(y instanceof HTMLElement))return;let _=0;const M=()=>{_||(_=window.requestAnimationFrame(()=>{var E;_=0,(E=i.current)==null||E.call(i)}))},x=typeof ResizeObserver=="function"?new ResizeObserver(()=>{M()}):null;return g instanceof HTMLElement&&(x==null||x.observe(g)),y instanceof HTMLElement&&(x==null||x.observe(y)),window.addEventListener("resize",M),()=>{_&&window.cancelAnimationFrame(_),window.removeEventListener("resize",M),x==null||x.disconnect()}},[e.renderBoxRef,e.viewportShellRef]),r!=="camera"||p<=0||m.length===0?null:w`
		<div class="frame-mask-layer">
			<canvas ref=${t} class="frame-mask-layer__canvas"></canvas>
		</div>
	`}function ih(n,e){return!Number.isFinite(n)||!Number.isFinite(e)||n<0||n>1||e<0||e>1?"":Pa({x:n,y:e})}function AM({store:n,controller:e,refs:t,t:i}){var L,X,ee,H;const r=we(null);n.mode.value;const s=n.workbenchCollapsed.value,o=n.splatEdit.active.value;n.splatEdit.scopeAssetIds.value.length;const a=n.splatEdit.hudPosition.value;n.splatEdit.lastOperation.value,n.frames.documents.value,new Set(n.frames.selectedIds.value??[]);const c=n.viewportReferenceImageEditMode.value,l=c||o,u=i("section.outputFrame"),h=n.referenceImages.previewLayers.value,d=new Set(n.referenceImages.selectedItemIds.value??[]),p=h.filter(T=>T.group==="back"),m=h.filter(T=>T.group!=="back"),f=h.filter(T=>d.has(T.id)),g=f.find(T=>T.id===n.referenceImages.selectedItemId.value)??f[f.length-1]??null,y=n.referenceImages.selectionAnchor.value,_=n.referenceImages.selectionBoxScreen.value,M=f.length===0?null:f.length===1&&g?{leftPx:g.leftPx,topPx:g.topPx,widthPx:g.widthPx,heightPx:g.heightPx,rotationDeg:g.rotationDeg,anchorAx:g.anchorAx,anchorAy:g.anchorAy,anchorHandleKey:ih(g.anchorAx,g.anchorAy)}:_?{leftPx:_.left,topPx:_.top,widthPx:_.width,heightPx:_.height,rotationDeg:_.rotationDeg??0,anchorAx:Number.isFinite(y==null?void 0:y.x)?y.x:_.anchorX??.5,anchorAy:Number.isFinite(y==null?void 0:y.y)?y.y:_.anchorY??.5,anchorHandleKey:ih(Number.isFinite(y==null?void 0:y.x)?y.x:_.anchorX??.5,Number.isFinite(y==null?void 0:y.y)?y.y:_.anchorY??.5)}:null,x=n.viewportPieMenu.value,v=n.viewportLensHud.value,P=n.viewportRollHud.value,E=x.open?h_({mode:n.mode.value,t:i,viewportToolMode:n.viewportToolMode.value,viewportOrthographic:n.mode.value==="viewport"&&n.viewportProjectionMode.value==="orthographic",referencePreviewSessionVisible:n.referenceImages.previewSessionVisible.value!==!1,hasReferenceImages:(((L=n.referenceImages.items.value)==null?void 0:L.length)??0)>0,frameMaskMode:n.frames.maskMode.value,hasRememberedFrameMaskSelection:(((X=n.frames.maskSelectedIds.value)==null?void 0:X.length)??0)>0}):[],S=E.find(T=>T.id===x.hoveredActionId)??null,C=T=>{T.preventDefault(),T.stopPropagation()},k=T=>{var D,j;T.preventDefault(),T.stopPropagation(),(j=(D=e())==null?void 0:D.closeViewportPieMenu)==null||j.call(D)},A=T=>{T.preventDefault(),T.stopPropagation()},b=(T,D)=>{var j,Q;D.preventDefault(),D.stopPropagation(),(Q=(j=e())==null?void 0:j.executeViewportPieAction)==null||Q.call(j,T,D)},F=T=>({left:`${T.leftPx}px`,top:`${T.topPx}px`,width:`${T.widthPx}px`,height:`${T.heightPx}px`,opacity:T.opacity,transform:`rotate(${T.rotationDeg}deg)`,transformOrigin:`${T.anchorAx*100}% ${T.anchorAy*100}%`}),z=T=>({imageRendering:T.pixelPerfect?"pixelated":"auto"}),R=T=>({left:`${T.leftPx}px`,top:`${T.topPx}px`,width:`${T.widthPx}px`,height:`${T.heightPx}px`,transform:`rotate(${T.rotationDeg}deg)`,transformOrigin:`${T.anchorAx*100}% ${T.anchorAy*100}%`}),O=T=>({left:`${T.anchorAx*100}%`,top:`${T.anchorAy*100}%`}),G=((ee=t.viewportShellRef)==null?void 0:ee.current)??t.viewportShellRef??null,te=((H=t.renderBoxRef)==null?void 0:H.current)??t.renderBoxRef??null,q=zx({viewportRect:qc(G,{preferClientSize:!0}),renderBoxRect:qc(te)});Number.isFinite(a==null?void 0:a.x)&&Number.isFinite(a==null?void 0:a.y)&&(`${a.x}`,`${a.y}`);const B=(T,D)=>{var j,Q;return(Q=(j=e())==null?void 0:j.startReferenceImageMove)==null?void 0:Q.call(j,T,D)},U=(T,D)=>{var j,Q;return(Q=(j=e())==null?void 0:j.startReferenceImageResize)==null?void 0:Q.call(j,T,D)},le=(T,D)=>{var j,Q;return(Q=(j=e())==null?void 0:j.startReferenceImageRotate)==null?void 0:Q.call(j,T,D)},$e=T=>{var D,j;return(j=(D=e())==null?void 0:D.startReferenceImageAnchorDrag)==null?void 0:j.call(D,T)};ho(()=>{const T=j=>{const Q=r.current;if(!Q||j.pointerId!==Q.pointerId)return;const qt=Math.min(Math.max(0,j.clientX-Q.shellRect.left-Q.offsetX),Math.max(0,Q.shellRect.width-Q.width)),Zt=Math.min(Math.max(0,j.clientY-Q.shellRect.top-Q.offsetY),Math.max(0,Q.shellRect.height-Q.height));n.splatEdit.hudPosition.value={x:Math.round(qt),y:Math.round(Zt)}},D=j=>{var Q;((Q=r.current)==null?void 0:Q.pointerId)===j.pointerId&&(r.current=null)};return window.addEventListener("pointermove",T),window.addEventListener("pointerup",D),window.addEventListener("pointercancel",D),()=>{window.removeEventListener("pointermove",T),window.removeEventListener("pointerup",D),window.removeEventListener("pointercancel",D)}},[n]);const nt=[{id:"move-x",label:"X",className:"viewport-gizmo__handle--axis viewport-gizmo__handle--x",axis:"x"},{id:"move-y",label:"Y",className:"viewport-gizmo__handle--axis viewport-gizmo__handle--y",axis:"y"},{id:"move-z",label:"Z",className:"viewport-gizmo__handle--axis viewport-gizmo__handle--z",axis:"z"},{id:"scale-uniform",label:"S",className:"viewport-gizmo__handle--scale"}];return w`
		<main
			id="viewport-shell"
			ref=${t.viewportShellRef}
			class=${s?"viewport-shell viewport-shell--inspector-collapsed":"viewport-shell viewport-shell--inspector-open"}
		>
			<canvas id="viewport" ref=${t.viewportCanvasRef} tabindex="0"></canvas>
			<${Gx} store=${n} controller=${e} t=${i} />
			<${Lx} store=${n} t=${i} />
			<${Zx}
				store=${n}
				viewportShellRef=${t.viewportShellRef}
			/>
			${o&&w`<${qx} store=${n} controller=${e} t=${i} />`}
			<div
				id="drop-hint"
				ref=${t.dropHintRef}
				class="drop-hint"
				style=${q}
			>
				<span class="drop-hint__meta">
					${`CAMERA_FRAMES ${xm()}`}
				</span>
				<strong>${i("drop.title")}</strong>
				<span>${i("drop.body")}</span>
				<div class="drop-hint__controls">
					<strong class="drop-hint__controls-title">
						${i("drop.controlsTitle")}
					</strong>
					<div class="drop-hint__controls-grid">
						<span>${i("drop.controlOrbit")}</span>
						<span>${i("drop.controlPan")}</span>
						<span>${i("drop.controlDolly")}</span>
						<span>${i("drop.controlAnchorOrbit")}</span>
					</div>
				</div>
			</div>
			<div class="reference-image-layer reference-image-layer--back">
				${p.map(T=>w`
						<div
							key=${T.id}
							class=${d.has(T.id)?c?"reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive":"reference-image-layer__entry reference-image-layer__entry--selected":c?"reference-image-layer__entry reference-image-layer__entry--interactive":"reference-image-layer__entry"}
							style=${F(T)}
							onPointerDown=${c?D=>B(T.id,D):void 0}
						>
							<img
								class=${T.pixelPerfect?"reference-image-layer__item reference-image-layer__item--pixelated":"reference-image-layer__item"}
								src=${T.sourceUrl}
								alt=${T.name}
								title=${T.fileName||T.name}
								draggable="false"
								style=${z(T)}
							/>
						</div>
					`)}
			</div>
			${x.open&&w`
					<div
						class=${x.coarse?"viewport-pie viewport-pie--coarse":"viewport-pie"}
						style=${{left:`${x.x}px`,top:`${x.y}px`,"--cf-pie-scale":String(x.scale??1)}}
					>
						<button
							type="button"
							class="viewport-pie__center"
							onPointerDown=${C}
							onClick=${k}
						>
							<span class="viewport-pie__center-label">
								${(S==null?void 0:S.label)??i("action.quickMenu")}
							</span>
						</button>
						${E.map(T=>{const D=Math.cos(T.angle)*(x.radius??zo),j=Math.sin(T.angle)*(x.radius??zo);return w`
								<button
									key=${T.id}
									type="button"
									class=${["viewport-pie__item",T.id===x.hoveredActionId||T.active?"viewport-pie__item--active":"",T.disabled?"viewport-pie__item--disabled":""].filter(Boolean).join(" ")}
									style=${{left:`${D}px`,top:`${j}px`}}
									disabled=${!!T.disabled}
									onPointerDown=${A}
									onClick=${Q=>T.disabled?void 0:b(T.id,Q)}
								>
									<span class="viewport-pie__item-icon">
										<${_e} name=${T.icon} size=${18} />
									</span>
								</button>
							`})}
					</div>
				`}
			${v.visible&&w`
					<div
						class="viewport-lens-hud"
						style=${{left:`${v.x}px`,top:`${v.y}px`}}
					>
						<strong>${v.mmLabel}</strong>
						<span>${v.fovLabel}</span>
					</div>
				`}
			${P.visible&&w`
					<div
						class="viewport-lens-hud viewport-roll-hud"
						style=${{left:`${P.x}px`,top:`${P.y}px`}}
					>
						<strong>${P.angleLabel}</strong>
						<span>${i("action.adjustRoll")}</span>
					</div>
				`}
			<${Ux} store=${n} controller=${e} t=${i} />
			<${Hx}
				controller=${e}
				rootRef=${t.viewportAxisGizmoRef}
				svgRef=${t.viewportAxisGizmoSvgRef}
			/>
			<${Jx} store=${n} refs=${t} />
			<div
				id="render-box"
				ref=${t.renderBoxRef}
				class=${l?"render-box render-box--interaction-disabled":"render-box"}
			>
				<${eh}
					store=${n}
					controller=${e}
					frameOverlayCanvasRef=${t.frameOverlayCanvasRef}
					canvasOnly=${!0}
					interactionsEnabled=${!l}
				/>
				<${eh}
					store=${n}
					controller=${e}
					itemsOnly=${!0}
					interactionsEnabled=${!l}
				/>
				${Wx.map(T=>w`
						<button
							type="button"
							class=${`render-box__resize-handle render-box__resize-handle--${T}`}
							aria-label=${u}
							onPointerDown=${l?void 0:D=>{var j;return(j=e())==null?void 0:j.startOutputFrameResize(T,D)}}
						></button>
					`)}
				${nh.map(T=>w`
						<button
							type="button"
							class=${`render-box__pan-edge render-box__pan-edge--${T}`}
							aria-label=${u}
							onPointerDown=${l?void 0:D=>{var j;return(j=e())==null?void 0:j.startOutputFramePan(D)}}
						></button>
					`)}
				<div
					id="render-box-meta"
					ref=${t.renderBoxMetaRef}
					class="render-box__meta"
					onPointerDown=${l?void 0:T=>{var D;return(D=e())==null?void 0:D.startOutputFramePan(T)}}
				>
					${n.exportSizeLabel.value} · ${n.renderBox.anchor.value}
				</div>
				<div
					id="anchor-dot"
					ref=${t.anchorDotRef}
					class="render-box__anchor"
				></div>
			</div>
			<div class="reference-image-layer reference-image-layer--front">
				${m.map(T=>w`
						<div
							key=${T.id}
							class=${d.has(T.id)?c?"reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive":"reference-image-layer__entry reference-image-layer__entry--selected":c?"reference-image-layer__entry reference-image-layer__entry--interactive":"reference-image-layer__entry"}
							style=${F(T)}
							onPointerDown=${c?D=>B(T.id,D):void 0}
						>
							<img
								class=${T.pixelPerfect?"reference-image-layer__item reference-image-layer__item--pixelated":"reference-image-layer__item"}
								src=${T.sourceUrl}
								alt=${T.name}
								title=${T.fileName||T.name}
								draggable="false"
								style=${z(T)}
							/>
						</div>
					`)}
			</div>
			${c&&M&&w`
					<div class="reference-image-selection-layer">
						<div
							class="frame-item frame-item--selected frame-item--active reference-image-transform-box"
							data-anchor-handle=${M.anchorHandleKey}
							style=${R(M)}
						>
							${nh.map(T=>w`
									<button
										key=${T}
										type="button"
										class=${`frame-item__edge frame-item__edge--${T}`}
										onPointerDown=${D=>B((g==null?void 0:g.id)??"",D)}
									></button>
								`)}
							${Xx.map(T=>w`
									<button
										key=${T}
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${T}`}
										style=${{cursor:Go(M.rotationDeg,T)}}
										onPointerDown=${D=>U(T,D)}
									></button>
								`)}
							${Yx.map(T=>w`
									<button
										key=${T}
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${T}`}
										style=${{cursor:No(M.rotationDeg,T)}}
										onPointerDown=${D=>le(T,D)}
									></button>
								`)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${O(M)}
								onPointerDown=${$e}
							></button>
						</div>
					</div>
				`}
			<div
				id="viewport-gizmo"
				ref=${t.viewportGizmoRef}
				class="viewport-gizmo is-hidden"
			>
				<svg
					class="viewport-gizmo__rings"
					ref=${t.viewportGizmoSvgRef}
					width="100%"
					height="100%"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
				>
					${["xy","yz","zx"].map(T=>w`
							<path
								key=${`move-${T}`}
								class=${`viewport-gizmo__plane viewport-gizmo__plane--${T}`}
								data-gizmo-plane=${`move-${T}`}
								onPointerEnter=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(`move-${T}`)}}
								onPointerLeave=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(null)}}
								onPointerDown=${D=>{var j;return(j=e())==null?void 0:j.startViewportTransformDrag(`move-${T}`,D)}}
							/>
						`)}
					${["x","y","z"].flatMap(T=>[w`
							<path
								key=${`rotate-${T}-back`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${T} viewport-gizmo__ring--back`}
								data-gizmo-ring=${`rotate-${T}-back`}
								onPointerEnter=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(`rotate-${T}`)}}
								onPointerLeave=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(null)}}
								onPointerDown=${D=>{var j;return(j=e())==null?void 0:j.startViewportTransformDrag(`rotate-${T}`,D)}}
							/>
						`,w`
							<path
								key=${`rotate-${T}-front`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${T} viewport-gizmo__ring--front`}
								data-gizmo-ring=${`rotate-${T}-front`}
								onPointerEnter=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(`rotate-${T}`)}}
								onPointerLeave=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(null)}}
								onPointerDown=${D=>{var j;return(j=e())==null?void 0:j.startViewportTransformDrag(`rotate-${T}`,D)}}
							/>
						`])}
				</svg>
				${nt.map(T=>w`
						<button
							key=${T.id}
							type="button"
							class=${`viewport-gizmo__handle ${T.className}`}
							data-gizmo-handle=${T.id}
							aria-label=${T.ariaLabel??T.label}
							onPointerEnter=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(T.id)}}
							onPointerLeave=${()=>{var D;return(D=e())==null?void 0:D.setViewportTransformHover(null)}}
							onPointerDown=${D=>{var j;return(j=e())==null?void 0:j.startViewportTransformDrag(T.id,D)}}
						>
							<span>${T.label}</span>
						</button>
					`)}
			</div>
		</main>
	`}export{Av as $,q1 as A,Ch as B,Sm as C,cv as D,ki as E,vg as F,n1 as G,Am as H,Rh as I,P1 as J,ui as K,yl as L,es as M,Bv as N,Og as O,dt as P,Dh as Q,Qo as R,Oh as S,cl as T,Ko as U,$ as V,Nh as W,fv as X,mv as Y,ol as Z,Cv as _,Yv as a,Jm as a$,Tv as a0,Ev as a1,Mv as a2,$v as a3,ll as a4,vv as a5,wv as a6,Sv as a7,kv as a8,al as a9,Fm as aA,R1 as aB,Xh as aC,Pm as aD,Rm as aE,$m as aF,km as aG,Tm as aH,Qr as aI,Im as aJ,Dm as aK,Ih as aL,Lm as aM,zm as aN,Om as aO,Bm as aP,jm as aQ,Vm as aR,Um as aS,Hm as aT,_s as aU,Gm as aV,Wm as aW,Xm as aX,Ym as aY,qm as aZ,Zm as a_,xv as aa,bv as ab,_v as ac,dl as ad,vn as ae,ul as af,e1 as ag,Qv as ah,Kv as ai,Rt as aj,p1 as ak,d1 as al,m1 as am,h1 as an,u1 as ao,c1 as ap,f1 as aq,l1 as ar,yn as as,L1 as at,o1 as au,z1 as av,ov as aw,lv as ax,Em as ay,Cm as az,ve as b,Fe as b$,Km as b0,Qm as b1,ef as b2,tf as b3,nf as b4,rf as b5,sf as b6,of as b7,af as b8,lf as b9,qv as bA,Zv as bB,S1 as bC,Gf as bD,M1 as bE,wf as bF,a1 as bG,w1 as bH,ts as bI,_t as bJ,tw as bK,_l as bL,ig as bM,ng as bN,Of as bO,y1 as bP,Lh as bQ,av as bR,Gv as bS,Xv as bT,Wv as bU,Hv as bV,Uv as bW,Vv as bX,jv as bY,ug as bZ,v1 as b_,cf as ba,hf as bb,uf as bc,df as bd,pf as be,mf as bf,ff as bg,gf as bh,yf as bi,_f as bj,bf as bk,Lv as bl,Nv as bm,Dv as bn,Iv as bo,Rv as bp,Pv as bq,Fv as br,iv as bs,rv as bt,sv as bu,sl as bv,pv as bw,dv as bx,uv as by,hv as bz,eg as c,bw as c$,Dr as c0,Ov as c1,zv as c2,wm as c3,gv as c4,yv as c5,i1 as c6,s1 as c7,r1 as c8,Ti as c9,O1 as cA,fg as cB,Ir as cC,fo as cD,Nr as cE,Br as cF,Or as cG,is as cH,ns as cI,Dt as cJ,vt as cK,Ta as cL,Oe as cM,Ai as cN,et as cO,rt as cP,iw as cQ,Qh as cR,Kh as cS,hc as cT,Jh as cU,Pu as cV,r0 as cW,xo as cX,bo as cY,Iu as cZ,Gr as c_,W1 as ca,B1 as cb,N1 as cc,V1 as cd,U1 as ce,H1 as cf,A1 as cg,Wt as ch,Xl as ci,pe as cj,j1 as ck,Y1 as cl,Bh as cm,Mg as cn,Nt as co,Hh as cp,Sg as cq,ae as cr,T1 as cs,wg as ct,Gh as cu,C1 as cv,F1 as cw,Qi as cx,ri as cy,Uh as cz,na as d,Kw as d$,Ea as d0,Uy as d1,s0 as d2,Fo as d3,Dw as d4,Nw as d5,Sw as d6,uy as d7,su as d8,fw as d9,Ky as dA,Ew as dB,gu as dC,$w as dD,P0 as dE,Hw as dF,F0 as dG,zy as dH,Xt as dI,qw as dJ,Vu as dK,Yw as dL,pa as dM,da as dN,ua as dO,ha as dP,je as dQ,Qx as dR,nv as dS,Wu as dT,Gu as dU,sM as dV,ju as dW,Ke as dX,t_ as dY,Qw as dZ,eM as d_,D1 as da,Vh as db,Pe as dc,X1 as dd,g1 as de,x1 as df,Z1 as dg,t1 as dh,hg as di,ia as dj,Zh as dk,K1 as dl,nw as dm,yw as dn,d0 as dp,ay as dq,k1 as dr,Tw as ds,gw as dt,Rw as du,l0 as dv,ew as dw,Fw as dx,Fn as dy,fi as dz,vm as e,ss as e$,Yu as e0,gr as e1,h0 as e2,tM as e3,ma as e4,di as e5,Ln as e6,_w as e7,jr as e8,Pw as e9,Mo as eA,sy as eB,ca as eC,G1 as eD,Vw as eE,Uw as eF,S0 as eG,$0 as eH,Ou as eI,Wh as eJ,E1 as eK,pg as eL,sw as eM,ow as eN,rw as eO,hw as eP,lw as eQ,cw as eR,aw as eS,pr as eT,Xw as eU,J1 as eV,I1 as eW,Q1 as eX,$i as eY,d_ as eZ,gi as e_,u0 as ea,Aw as eb,_a as ec,Hr as ed,mi as ee,Vt as ef,Ur as eg,_y as eh,fa as ei,ga as ej,No as ek,Aa as el,Cw as em,Ca as en,rM as eo,iM as ep,Jw as eq,J0 as er,Zw as es,nM as et,oM as eu,Ra as ev,pc as ew,aM as ex,h_ as ey,lM as ez,Jv as f,hM as f$,ai as f0,Iy as f1,xw as f2,vw as f3,yu as f4,Mw as f5,ww as f6,Dy as f7,Ma as f8,qs as f9,pw as fA,ut as fB,w as fC,_e as fD,we as fE,Re as fF,ny as fG,iy as fH,mw as fI,cM as fJ,Yt as fK,he as fL,fM,Vo as fN,zn as fO,K as fP,yM as fQ,Zb as fR,Bo as fS,Bc as fT,jc as fU,Qb as fV,ge as fW,Iw as fX,ad as fY,gM as fZ,Kx as f_,kw as fa,ka as fb,os as fc,wu as fd,vu as fe,uw as ff,xc as fg,b0 as fh,zw as fi,Ci as fj,ls as fk,Lw as fl,Lu as fm,Ow as fn,Fa as fo,as as fp,Bw as fq,x0 as fr,v0 as fs,jw as ft,dM as fu,Xr as fv,Ww as fw,wi as fx,Gw as fy,dw as fz,Ue as g,ib as g$,uM as g0,kM as g1,TM as g2,EM as g3,wr as g4,Mr as g5,Sr as g6,Ex as g7,MM as g8,kx as g9,Cb as gA,Ab as gB,Tb as gC,Eb as gD,kb as gE,$b as gF,Sb as gG,Mb as gH,wb as gI,vb as gJ,xb as gK,bb as gL,_b as gM,yb as gN,gb as gO,fb as gP,mb as gQ,pb as gR,db as gS,ub as gT,hb as gU,cb as gV,lb as gW,ab as gX,ob as gY,sb as gZ,rb as g_,$M as ga,$x as gb,Sx as gc,bM as gd,Mx as ge,_M as gf,wx as gg,SM as gh,xx as gi,wM as gj,bx as gk,xM as gl,_x as gm,vx as gn,yx as go,Co as gp,AM as gq,mM as gr,ev as gs,Th as gt,tv as gu,Ya as gv,pM as gw,Yr as gx,sd as gy,Fb as gz,Pt as h,nb as h0,tb as h1,eb as h2,Q_ as h3,K_ as h4,J_ as h5,Z_ as h6,q_ as h7,Y_ as h8,X_ as h9,W_ as ha,G_ as hb,H_ as hc,U_ as hd,V_ as he,j_ as hf,B_ as hg,O_ as hh,z_ as hi,L_ as hj,N_ as hk,D_ as hl,I_ as hm,R_ as hn,P_ as ho,F_ as hp,C_ as hq,A_ as hr,T_ as hs,Gx as ht,Ux as hu,zo as hv,vM as hw,Tx as hx,qx as hy,Rr as i,xt as j,ce as k,_1 as l,og as m,qe as n,Me as o,ne as p,Ah as q,mt as r,ze as s,Ph as t,mo as u,b1 as v,Ml as w,$1 as x,Nm as y,pl as z};
