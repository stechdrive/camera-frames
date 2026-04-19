(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();var Vr,J,Gc,Wc,Pt,Ia,Xc,Yc,qc,No,eo,to,xr={},vr=[],fp=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,wi=Array.isArray;function gt(i,e){for(var t in e)i[t]=e[t];return i}function Bo(i){i&&i.parentNode&&i.parentNode.removeChild(i)}function En(i,e,t){var n,r,s,o={};for(s in e)s=="key"?n=e[s]:s=="ref"?r=e[s]:o[s]=e[s];if(arguments.length>2&&(o.children=arguments.length>3?Vr.call(arguments,2):t),typeof i=="function"&&i.defaultProps!=null)for(s in i.defaultProps)o[s]===void 0&&(o[s]=i.defaultProps[s]);return mr(i,o,n,r,null)}function mr(i,e,t,n,r){var s={type:i,props:e,key:t,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++Gc,__i:-1,__u:0};return r==null&&J.vnode!=null&&J.vnode(s),s}function Wt(i){return i.children}function ot(i,e){this.props=i,this.context=e}function Tn(i,e){if(e==null)return i.__?Tn(i.__,i.__i+1):null;for(var t;e<i.__k.length;e++)if((t=i.__k[e])!=null&&t.__e!=null)return t.__e;return typeof i.type=="function"?Tn(i):null}function gp(i){if(i.__P&&i.__d){var e=i.__v,t=e.__e,n=[],r=[],s=gt({},e);s.__v=e.__v+1,J.vnode&&J.vnode(s),Oo(i.__P,s,e,i.__n,i.__P.namespaceURI,32&e.__u?[t]:null,n,t??Tn(e),!!(32&e.__u),r),s.__v=e.__v,s.__.__k[s.__i]=s,Qc(n,s,r),e.__e=e.__=null,s.__e!=t&&Zc(s)}}function Zc(i){if((i=i.__)!=null&&i.__c!=null)return i.__e=i.__c.base=null,i.__k.some(function(e){if(e!=null&&e.__e!=null)return i.__e=i.__c.base=e.__e}),Zc(i)}function Da(i){(!i.__d&&(i.__d=!0)&&Pt.push(i)&&!wr.__r++||Ia!=J.debounceRendering)&&((Ia=J.debounceRendering)||Xc)(wr)}function wr(){try{for(var i,e=1;Pt.length;)Pt.length>e&&Pt.sort(Yc),i=Pt.shift(),e=Pt.length,gp(i)}finally{Pt.length=wr.__r=0}}function Jc(i,e,t,n,r,s,o,a,c,l,u){var h,d,p,m,f,g,y,b=n&&n.__k||vr,M=e.length;for(c=yp(t,e,b,c,M),h=0;h<M;h++)(p=t.__k[h])!=null&&(d=p.__i!=-1&&b[p.__i]||xr,p.__i=h,g=Oo(i,p,d,r,s,o,a,c,l,u),m=p.__e,p.ref&&d.ref!=p.ref&&(d.ref&&Lo(d.ref,null,p),u.push(p.ref,p.__c||m,p)),f==null&&m!=null&&(f=m),(y=!!(4&p.__u))||d.__k===p.__k?c=Kc(p,c,i,y):typeof p.type=="function"&&g!==void 0?c=g:m&&(c=m.nextSibling),p.__u&=-7);return t.__e=f,c}function yp(i,e,t,n,r){var s,o,a,c,l,u=t.length,h=u,d=0;for(i.__k=new Array(r),s=0;s<r;s++)(o=e[s])!=null&&typeof o!="boolean"&&typeof o!="function"?(typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?o=i.__k[s]=mr(null,o,null,null,null):wi(o)?o=i.__k[s]=mr(Wt,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=i.__k[s]=mr(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):i.__k[s]=o,c=s+d,o.__=i,o.__b=i.__b+1,a=null,(l=o.__i=_p(o,t,c,h))!=-1&&(h--,(a=t[l])&&(a.__u|=2)),a==null||a.__v==null?(l==-1&&(r>u?d--:r<u&&d++),typeof o.type!="function"&&(o.__u|=4)):l!=c&&(l==c-1?d--:l==c+1?d++:(l>c?d--:d++,o.__u|=4))):i.__k[s]=null;if(h)for(s=0;s<u;s++)(a=t[s])!=null&&(2&a.__u)==0&&(a.__e==n&&(n=Tn(a)),th(a,a));return n}function Kc(i,e,t,n){var r,s;if(typeof i.type=="function"){for(r=i.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=i,e=Kc(r[s],e,t,n));return e}i.__e!=e&&(n&&(e&&i.type&&!e.parentNode&&(e=Tn(i)),t.insertBefore(i.__e,e||null)),e=i.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Mr(i,e){return e=e||[],i==null||typeof i=="boolean"||(wi(i)?i.some(function(t){Mr(t,e)}):e.push(i)),e}function _p(i,e,t,n){var r,s,o,a=i.key,c=i.type,l=e[t],u=l!=null&&(2&l.__u)==0;if(l===null&&a==null||u&&a==l.key&&c==l.type)return t;if(n>(u?1:0)){for(r=t-1,s=t+1;r>=0||s<e.length;)if((l=e[o=r>=0?r--:s++])!=null&&(2&l.__u)==0&&a==l.key&&c==l.type)return o}return-1}function za(i,e,t){e[0]=="-"?i.setProperty(e,t??""):i[e]=t==null?"":typeof t!="number"||fp.test(e)?t:t+"px"}function Ai(i,e,t,n,r){var s,o;e:if(e=="style")if(typeof t=="string")i.style.cssText=t;else{if(typeof n=="string"&&(i.style.cssText=n=""),n)for(e in n)t&&e in t||za(i.style,e,"");if(t)for(e in t)n&&t[e]==n[e]||za(i.style,e,t[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(qc,"$1")),o=e.toLowerCase(),e=o in i||e=="onFocusOut"||e=="onFocusIn"?o.slice(2):e.slice(2),i.l||(i.l={}),i.l[e+s]=t,t?n?t.u=n.u:(t.u=No,i.addEventListener(e,s?to:eo,s)):i.removeEventListener(e,s?to:eo,s);else{if(r=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in i)try{i[e]=t??"";break e}catch{}typeof t=="function"||(t==null||t===!1&&e[4]!="-"?i.removeAttribute(e):i.setAttribute(e,e=="popover"&&t==1?"":t))}}function Na(i){return function(e){if(this.l){var t=this.l[e.type+i];if(e.t==null)e.t=No++;else if(e.t<t.u)return;return t(J.event?J.event(e):e)}}}function Oo(i,e,t,n,r,s,o,a,c,l){var u,h,d,p,m,f,g,y,b,M,v,w,A,_,x,k=e.type;if(e.constructor!==void 0)return null;128&t.__u&&(c=!!(32&t.__u),s=[a=e.__e=t.__e]),(u=J.__b)&&u(e);e:if(typeof k=="function")try{if(y=e.props,b=k.prototype&&k.prototype.render,M=(u=k.contextType)&&n[u.__c],v=u?M?M.props.value:u.__:n,t.__c?g=(h=e.__c=t.__c).__=h.__E:(b?e.__c=h=new k(y,v):(e.__c=h=new ot(y,v),h.constructor=k,h.render=xp),M&&M.sub(h),h.state||(h.state={}),h.__n=n,d=h.__d=!0,h.__h=[],h._sb=[]),b&&h.__s==null&&(h.__s=h.state),b&&k.getDerivedStateFromProps!=null&&(h.__s==h.state&&(h.__s=gt({},h.__s)),gt(h.__s,k.getDerivedStateFromProps(y,h.__s))),p=h.props,m=h.state,h.__v=e,d)b&&k.getDerivedStateFromProps==null&&h.componentWillMount!=null&&h.componentWillMount(),b&&h.componentDidMount!=null&&h.__h.push(h.componentDidMount);else{if(b&&k.getDerivedStateFromProps==null&&y!==p&&h.componentWillReceiveProps!=null&&h.componentWillReceiveProps(y,v),e.__v==t.__v||!h.__e&&h.shouldComponentUpdate!=null&&h.shouldComponentUpdate(y,h.__s,v)===!1){e.__v!=t.__v&&(h.props=y,h.state=h.__s,h.__d=!1),e.__e=t.__e,e.__k=t.__k,e.__k.some(function(S){S&&(S.__=e)}),vr.push.apply(h.__h,h._sb),h._sb=[],h.__h.length&&o.push(h);break e}h.componentWillUpdate!=null&&h.componentWillUpdate(y,h.__s,v),b&&h.componentDidUpdate!=null&&h.__h.push(function(){h.componentDidUpdate(p,m,f)})}if(h.context=v,h.props=y,h.__P=i,h.__e=!1,w=J.__r,A=0,b)h.state=h.__s,h.__d=!1,w&&w(e),u=h.render(h.props,h.state,h.context),vr.push.apply(h.__h,h._sb),h._sb=[];else do h.__d=!1,w&&w(e),u=h.render(h.props,h.state,h.context),h.state=h.__s;while(h.__d&&++A<25);h.state=h.__s,h.getChildContext!=null&&(n=gt(gt({},n),h.getChildContext())),b&&!d&&h.getSnapshotBeforeUpdate!=null&&(f=h.getSnapshotBeforeUpdate(p,m)),_=u!=null&&u.type===Wt&&u.key==null?eh(u.props.children):u,a=Jc(i,wi(_)?_:[_],e,t,n,r,s,o,a,c,l),h.base=e.__e,e.__u&=-161,h.__h.length&&o.push(h),g&&(h.__E=h.__=null)}catch(S){if(e.__v=null,c||s!=null)if(S.then){for(e.__u|=c?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;s[s.indexOf(a)]=null,e.__e=a}else{for(x=s.length;x--;)Bo(s[x]);no(e)}else e.__e=t.__e,e.__k=t.__k,S.then||no(e);J.__e(S,e,t)}else s==null&&e.__v==t.__v?(e.__k=t.__k,e.__e=t.__e):a=e.__e=bp(t.__e,e,t,n,r,s,o,c,l);return(u=J.diffed)&&u(e),128&e.__u?void 0:a}function no(i){i&&(i.__c&&(i.__c.__e=!0),i.__k&&i.__k.some(no))}function Qc(i,e,t){for(var n=0;n<t.length;n++)Lo(t[n],t[++n],t[++n]);J.__c&&J.__c(e,i),i.some(function(r){try{i=r.__h,r.__h=[],i.some(function(s){s.call(r)})}catch(s){J.__e(s,r.__v)}})}function eh(i){return typeof i!="object"||i==null||i.__b>0?i:wi(i)?i.map(eh):gt({},i)}function bp(i,e,t,n,r,s,o,a,c){var l,u,h,d,p,m,f,g=t.props||xr,y=e.props,b=e.type;if(b=="svg"?r="http://www.w3.org/2000/svg":b=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),s!=null){for(l=0;l<s.length;l++)if((p=s[l])&&"setAttribute"in p==!!b&&(b?p.localName==b:p.nodeType==3)){i=p,s[l]=null;break}}if(i==null){if(b==null)return document.createTextNode(y);i=document.createElementNS(r,b,y.is&&y),a&&(J.__m&&J.__m(e,s),a=!1),s=null}if(b==null)g===y||a&&i.data==y||(i.data=y);else{if(s=s&&Vr.call(i.childNodes),!a&&s!=null)for(g={},l=0;l<i.attributes.length;l++)g[(p=i.attributes[l]).name]=p.value;for(l in g)p=g[l],l=="dangerouslySetInnerHTML"?h=p:l=="children"||l in y||l=="value"&&"defaultValue"in y||l=="checked"&&"defaultChecked"in y||Ai(i,l,null,p,r);for(l in y)p=y[l],l=="children"?d=p:l=="dangerouslySetInnerHTML"?u=p:l=="value"?m=p:l=="checked"?f=p:a&&typeof p!="function"||g[l]===p||Ai(i,l,p,g[l],r);if(u)a||h&&(u.__html==h.__html||u.__html==i.innerHTML)||(i.innerHTML=u.__html),e.__k=[];else if(h&&(i.innerHTML=""),Jc(e.type=="template"?i.content:i,wi(d)?d:[d],e,t,n,b=="foreignObject"?"http://www.w3.org/1999/xhtml":r,s,o,s?s[0]:t.__k&&Tn(t,0),a,c),s!=null)for(l=s.length;l--;)Bo(s[l]);a||(l="value",b=="progress"&&m==null?i.removeAttribute("value"):m!=null&&(m!==i[l]||b=="progress"&&!m||b=="option"&&m!=g[l])&&Ai(i,l,m,g[l],r),l="checked",f!=null&&f!=i[l]&&Ai(i,l,f,g[l],r))}return i}function Lo(i,e,t){try{if(typeof i=="function"){var n=typeof i.__u=="function";n&&i.__u(),n&&e==null||(i.__u=i(e))}else i.current=e}catch(r){J.__e(r,t)}}function th(i,e,t){var n,r;if(J.unmount&&J.unmount(i),(n=i.ref)&&(n.current&&n.current!=i.__e||Lo(n,null,e)),(n=i.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(s){J.__e(s,e)}n.base=n.__P=null}if(n=i.__k)for(r=0;r<n.length;r++)n[r]&&th(n[r],e,t||typeof i.type!="function");t||Bo(i.__e),i.__c=i.__=i.__e=void 0}function xp(i,e,t){return this.constructor(i,t)}function Ba(i,e,t){var n,r,s,o;e==document&&(e=document.documentElement),J.__&&J.__(i,e),r=(n=!1)?null:e.__k,s=[],o=[],Oo(e,i=e.__k=En(Wt,null,[i]),r||xr,xr,e.namespaceURI,r?null:e.firstChild?Vr.call(e.childNodes):null,s,r?r.__e:e.firstChild,n,o),Qc(s,i,o)}Vr=vr.slice,J={__e:function(i,e,t,n){for(var r,s,o;e=e.__;)if((r=e.__c)&&!r.__)try{if((s=r.constructor)&&s.getDerivedStateFromError!=null&&(r.setState(s.getDerivedStateFromError(i)),o=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(i,n||{}),o=r.__d),o)return r.__E=r}catch(a){i=a}throw i}},Gc=0,Wc=function(i){return i!=null&&i.constructor===void 0},ot.prototype.setState=function(i,e){var t;t=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=gt({},this.state),typeof i=="function"&&(i=i(gt({},t),this.props)),i&&gt(t,i),i!=null&&this.__v&&(e&&this._sb.push(e),Da(this))},ot.prototype.forceUpdate=function(i){this.__v&&(this.__e=!0,i&&this.__h.push(i),Da(this))},ot.prototype.render=Wt,Pt=[],Xc=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Yc=function(i,e){return i.__v.__b-e.__v.__b},wr.__r=0,qc=/(PointerCapture)$|Capture$/i,No=0,eo=Na(!1),to=Na(!0);var nh=function(i,e,t,n){var r;e[0]=0;for(var s=1;s<e.length;s++){var o=e[s++],a=e[s]?(e[0]|=o?1:2,t[e[s++]]):e[++s];o===3?n[0]=a:o===4?n[1]=Object.assign(n[1]||{},a):o===5?(n[1]=n[1]||{})[e[++s]]=a:o===6?n[1][e[++s]]+=a+"":o?(r=i.apply(a,nh(i,a,t,["",null])),n.push(r),a[0]?e[0]|=2:(e[s-2]=0,e[s]=r)):n.push(a)}return n},Oa=new Map;function vp(i){var e=Oa.get(this);return e||(e=new Map,Oa.set(this,e)),(e=nh(this,e.get(i)||(e.set(i,e=(function(t){for(var n,r,s=1,o="",a="",c=[0],l=function(d){s===1&&(d||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?c.push(0,d,o):s===3&&(d||o)?(c.push(3,d,o),s=2):s===2&&o==="..."&&d?c.push(4,d,0):s===2&&o&&!d?c.push(5,0,!0,o):s>=5&&((o||!d&&s===5)&&(c.push(s,0,o,r),s=6),d&&(c.push(s,d,0,r),s=6)),o=""},u=0;u<t.length;u++){u&&(s===1&&l(),l(u));for(var h=0;h<t[u].length;h++)n=t[u][h],s===1?n==="<"?(l(),c=[c],s=3):o+=n:s===4?o==="--"&&n===">"?(s=1,o=""):o=n+o[0]:a?n===a?a="":o+=n:n==='"'||n==="'"?a=n:n===">"?(l(),s=1):s&&(n==="="?(s=5,r=o,o=""):n==="/"&&(s<5||t[u][h+1]===">")?(l(),s===3&&(c=c[0]),s=c,(c=c[0]).push(2,0,s),s=0):n===" "||n==="	"||n===`
`||n==="\r"?(l(),s=2):o+=n),s===3&&o==="!--"&&(s=4,c=c[0])}return l(),c})(i)),e),arguments,[])).length>1?e:e[0]}var $=vp.bind(En),Cn,ue,hs,La,li=0,ih=[],me=J,ja=me.__b,Va=me.__r,Ua=me.diffed,Ha=me.__c,Ga=me.unmount,Wa=me.__;function Ur(i,e){me.__h&&me.__h(ue,i,li||e),li=0;var t=ue.__H||(ue.__H={__:[],__h:[]});return i>=t.__.length&&t.__.push({}),t.__[i]}function ge(i){return li=1,wp(rh,i)}function wp(i,e,t){var n=Ur(Cn++,2);if(n.t=i,!n.__c&&(n.__=[t?t(e):rh(void 0,e),function(a){var c=n.__N?n.__N[0]:n.__[0],l=n.t(c,a);c!==l&&(n.__N=[l,n.__[1]],n.__c.setState({}))}],n.__c=ue,!ue.__f)){var r=function(a,c,l){if(!n.__c.__H)return!0;var u=n.__c.__H.__.filter(function(d){return d.__c});if(u.every(function(d){return!d.__N}))return!s||s.call(this,a,c,l);var h=n.__c.props!==a;return u.some(function(d){if(d.__N){var p=d.__[0];d.__=d.__N,d.__N=void 0,p!==d.__[0]&&(h=!0)}}),s&&s.call(this,a,c,l)||h};ue.__f=!0;var s=ue.shouldComponentUpdate,o=ue.componentWillUpdate;ue.componentWillUpdate=function(a,c,l){if(this.__e){var u=s;s=void 0,r(a,c,l),s=u}o&&o.call(this,a,c,l)},ue.shouldComponentUpdate=r}return n.__N||n.__}function De(i,e){var t=Ur(Cn++,3);!me.__s&&jo(t.__H,e)&&(t.__=i,t.u=e,ue.__H.__h.push(t))}function io(i,e){var t=Ur(Cn++,4);!me.__s&&jo(t.__H,e)&&(t.__=i,t.u=e,ue.__h.push(t))}function Me(i){return li=5,Hr(function(){return{current:i}},[])}function Hr(i,e){var t=Ur(Cn++,7);return jo(t.__H,e)&&(t.__=i(),t.__H=e,t.__h=i),t.__}function nx(i,e){return li=8,Hr(function(){return i},e)}function Mp(){for(var i;i=ih.shift();){var e=i.__H;if(i.__P&&e)try{e.__h.some(fr),e.__h.some(ro),e.__h=[]}catch(t){e.__h=[],me.__e(t,i.__v)}}}me.__b=function(i){ue=null,ja&&ja(i)},me.__=function(i,e){i&&e.__k&&e.__k.__m&&(i.__m=e.__k.__m),Wa&&Wa(i,e)},me.__r=function(i){Va&&Va(i),Cn=0;var e=(ue=i.__c).__H;e&&(hs===ue?(e.__h=[],ue.__h=[],e.__.some(function(t){t.__N&&(t.__=t.__N),t.u=t.__N=void 0})):(e.__h.some(fr),e.__h.some(ro),e.__h=[],Cn=0)),hs=ue},me.diffed=function(i){Ua&&Ua(i);var e=i.__c;e&&e.__H&&(e.__H.__h.length&&(ih.push(e)!==1&&La===me.requestAnimationFrame||((La=me.requestAnimationFrame)||Sp)(Mp)),e.__H.__.some(function(t){t.u&&(t.__H=t.u),t.u=void 0})),hs=ue=null},me.__c=function(i,e){e.some(function(t){try{t.__h.some(fr),t.__h=t.__h.filter(function(n){return!n.__||ro(n)})}catch(n){e.some(function(r){r.__h&&(r.__h=[])}),e=[],me.__e(n,t.__v)}}),Ha&&Ha(i,e)},me.unmount=function(i){Ga&&Ga(i);var e,t=i.__c;t&&t.__H&&(t.__H.__.some(function(n){try{fr(n)}catch(r){e=r}}),t.__H=void 0,e&&me.__e(e,t.__v))};var Xa=typeof requestAnimationFrame=="function";function Sp(i){var e,t=function(){clearTimeout(n),Xa&&cancelAnimationFrame(e),setTimeout(i)},n=setTimeout(t,35);Xa&&(e=requestAnimationFrame(t))}function fr(i){var e=ue,t=i.__c;typeof t=="function"&&(i.__c=void 0,t()),ue=e}function ro(i){var e=ue;i.__c=i.__(),ue=e}function jo(i,e){return!i||i.length!==e.length||e.some(function(t,n){return t!==i[n]})}function rh(i,e){return typeof e=="function"?e(i):e}const $p="e96e30cf";var kp=Symbol.for("preact-signals");function Gr(){if(bt>1)bt--;else{var i,e=!1;for((function(){var r=$r;for($r=void 0;r!==void 0;)r.S.v===r.v&&(r.S.i=r.i),r=r.o})();ei!==void 0;){var t=ei;for(ei=void 0,Sr++;t!==void 0;){var n=t.u;if(t.u=void 0,t.f&=-3,!(8&t.f)&&ah(t))try{t.c()}catch(r){e||(i=r,e=!0)}t=n}}if(Sr=0,bt--,e)throw i}}function Ep(i){if(bt>0)return i();so=++Tp,bt++;try{return i()}finally{Gr()}}var re=void 0;function sh(i){var e=re;re=void 0;try{return i()}finally{re=e}}var ei=void 0,bt=0,Sr=0,Tp=0,so=0,$r=void 0,kr=0;function oh(i){if(re!==void 0){var e=i.n;if(e===void 0||e.t!==re)return e={i:0,S:i,p:re.s,n:void 0,t:re,e:void 0,x:void 0,r:e},re.s!==void 0&&(re.s.n=e),re.s=e,i.n=e,32&re.f&&i.S(e),e;if(e.i===-1)return e.i=0,e.n!==void 0&&(e.n.p=e.p,e.p!==void 0&&(e.p.n=e.n),e.p=re.s,e.n=void 0,re.s.n=e,re.s=e),e}}function ke(i,e){this.v=i,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=e==null?void 0:e.watched,this.Z=e==null?void 0:e.unwatched,this.name=e==null?void 0:e.name}ke.prototype.brand=kp;ke.prototype.h=function(){return!0};ke.prototype.S=function(i){var e=this,t=this.t;t!==i&&i.e===void 0&&(i.x=t,this.t=i,t!==void 0?t.e=i:sh(function(){var n;(n=e.W)==null||n.call(e)}))};ke.prototype.U=function(i){var e=this;if(this.t!==void 0){var t=i.e,n=i.x;t!==void 0&&(t.x=n,i.e=void 0),n!==void 0&&(n.e=t,i.x=void 0),i===this.t&&(this.t=n,n===void 0&&sh(function(){var r;(r=e.Z)==null||r.call(e)}))}};ke.prototype.subscribe=function(i){var e=this;return Mi(function(){var t=e.value,n=re;re=void 0;try{i(t)}finally{re=n}},{name:"sub"})};ke.prototype.valueOf=function(){return this.value};ke.prototype.toString=function(){return this.value+""};ke.prototype.toJSON=function(){return this.value};ke.prototype.peek=function(){var i=re;re=void 0;try{return this.value}finally{re=i}};Object.defineProperty(ke.prototype,"value",{get:function(){var i=oh(this);return i!==void 0&&(i.i=this.i),this.v},set:function(i){if(i!==this.v){if(Sr>100)throw new Error("Cycle detected");(function(t){bt!==0&&Sr===0&&t.l!==so&&(t.l=so,$r={S:t,v:t.v,i:t.i,o:$r})})(this),this.v=i,this.i++,kr++,bt++;try{for(var e=this.t;e!==void 0;e=e.x)e.t.N()}finally{Gr()}}}});function R(i,e){return new ke(i,e)}function ah(i){for(var e=i.s;e!==void 0;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function lh(i){for(var e=i.s;e!==void 0;e=e.n){var t=e.S.n;if(t!==void 0&&(e.r=t),e.S.n=e,e.i=-1,e.n===void 0){i.s=e;break}}}function ch(i){for(var e=i.s,t=void 0;e!==void 0;){var n=e.p;e.i===-1?(e.S.U(e),n!==void 0&&(n.n=e.n),e.n!==void 0&&(e.n.p=n)):t=e,e.S.n=e.r,e.r!==void 0&&(e.r=void 0),e=n}i.s=t}function Yt(i,e){ke.call(this,void 0),this.x=i,this.s=void 0,this.g=kr-1,this.f=4,this.W=e==null?void 0:e.watched,this.Z=e==null?void 0:e.unwatched,this.name=e==null?void 0:e.name}Yt.prototype=new ke;Yt.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===kr))return!0;if(this.g=kr,this.f|=1,this.i>0&&!ah(this))return this.f&=-2,!0;var i=re;try{lh(this),re=this;var e=this.x();(16&this.f||this.v!==e||this.i===0)&&(this.v=e,this.f&=-17,this.i++)}catch(t){this.v=t,this.f|=16,this.i++}return re=i,ch(this),this.f&=-2,!0};Yt.prototype.S=function(i){if(this.t===void 0){this.f|=36;for(var e=this.s;e!==void 0;e=e.n)e.S.S(e)}ke.prototype.S.call(this,i)};Yt.prototype.U=function(i){if(this.t!==void 0&&(ke.prototype.U.call(this,i),this.t===void 0)){this.f&=-33;for(var e=this.s;e!==void 0;e=e.n)e.S.U(e)}};Yt.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var i=this.t;i!==void 0;i=i.x)i.t.N()}};Object.defineProperty(Yt.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var i=oh(this);if(this.h(),i!==void 0&&(i.i=this.i),16&this.f)throw this.v;return this.v}});function L(i,e){return new Yt(i,e)}function hh(i){var e=i.m;if(i.m=void 0,typeof e=="function"){bt++;var t=re;re=void 0;try{e()}catch(n){throw i.f&=-2,i.f|=8,Vo(i),n}finally{re=t,Gr()}}}function Vo(i){for(var e=i.s;e!==void 0;e=e.n)e.S.U(e);i.x=void 0,i.s=void 0,hh(i)}function Cp(i){if(re!==this)throw new Error("Out-of-order effect");ch(this),re=i,this.f&=-2,8&this.f&&Vo(this),Gr()}function Pn(i,e){this.x=i,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=e==null?void 0:e.name}Pn.prototype.c=function(){var i=this.S();try{if(8&this.f||this.x===void 0)return;var e=this.x();typeof e=="function"&&(this.m=e)}finally{i()}};Pn.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,hh(this),lh(this),bt++;var i=re;return re=this,Cp.bind(this,i)};Pn.prototype.N=function(){2&this.f||(this.f|=2,this.u=ei,ei=this)};Pn.prototype.d=function(){this.f|=8,1&this.f||Vo(this)};Pn.prototype.dispose=function(){this.d()};function Mi(i,e){var t=new Pn(i,e);try{t.c()}catch(r){throw t.d(),r}var n=t.d.bind(t);return n[Symbol.dispose]=n,n}var uh,Fi,Ap=typeof window<"u"&&!!window.__PREACT_SIGNALS_DEVTOOLS__,dh=[];Mi(function(){uh=this.N})();function In(i,e){J[i]=e.bind(null,J[i]||function(){})}function Er(i){if(Fi){var e=Fi;Fi=void 0,e()}Fi=i&&i.S()}function ph(i){var e=this,t=i.data,n=Rp(t);n.value=t;var r=Hr(function(){for(var a=e,c=e.__v;c=c.__;)if(c.__c){c.__c.__$f|=4;break}var l=L(function(){var p=n.value.value;return p===0?0:p===!0?"":p||""}),u=L(function(){return!Array.isArray(l.value)&&!Wc(l.value)}),h=Mi(function(){if(this.N=mh,u.value){var p=l.value;a.__v&&a.__v.__e&&a.__v.__e.nodeType===3&&(a.__v.__e.data=p)}}),d=e.__$u.d;return e.__$u.d=function(){h(),d.call(this)},[u,l]},[]),s=r[0],o=r[1];return s.value?o.peek():o.value}ph.displayName="ReactiveTextNode";Object.defineProperties(ke.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:ph},props:{configurable:!0,get:function(){var i=this;return{data:{get value(){return i.value}}}}},__b:{configurable:!0,value:1}});In("__b",function(i,e){if(typeof e.type=="string"){var t,n=e.props;for(var r in n)if(r!=="children"){var s=n[r];s instanceof ke&&(t||(e.__np=t={}),t[r]=s,n[r]=s.peek())}}i(e)});In("__r",function(i,e){if(i(e),e.type!==Wt){Er();var t,n=e.__c;n&&(n.__$f&=-2,(t=n.__$u)===void 0&&(n.__$u=t=(function(r,s){var o;return Mi(function(){o=this},{name:s}),o.c=r,o})(function(){var r;Ap&&((r=t.y)==null||r.call(t)),n.__$f|=1,n.setState({})},typeof e.type=="function"?e.type.displayName||e.type.name:""))),Er(t)}});In("__e",function(i,e,t,n){Er(),i(e,t,n)});In("diffed",function(i,e){Er();var t;if(typeof e.type=="string"&&(t=e.__e)){var n=e.__np,r=e.props;if(n){var s=t.U;if(s)for(var o in s){var a=s[o];a!==void 0&&!(o in n)&&(a.d(),s[o]=void 0)}else s={},t.U=s;for(var c in n){var l=s[c],u=n[c];l===void 0?(l=Fp(t,c,u),s[c]=l):l.o(u,r)}for(var h in n)r[h]=n[h]}}i(e)});function Fp(i,e,t,n){var r=e in i&&i.ownerSVGElement===void 0,s=R(t),o=t.peek();return{o:function(a,c){s.value=a,o=a.peek()},d:Mi(function(){this.N=mh;var a=s.value.value;o!==a?(o=void 0,r?i[e]=a:a!=null&&(a!==!1||e[4]==="-")?i.setAttribute(e,a):i.removeAttribute(e)):o=void 0})}}In("unmount",function(i,e){if(typeof e.type=="string"){var t=e.__e;if(t){var n=t.U;if(n){t.U=void 0;for(var r in n){var s=n[r];s&&s.d()}}}e.__np=void 0}else{var o=e.__c;if(o){var a=o.__$u;a&&(o.__$u=void 0,a.d())}}i(e)});In("__h",function(i,e,t,n){(n<3||n===9)&&(e.__$f|=2),i(e,t,n)});ot.prototype.shouldComponentUpdate=function(i,e){if(this.__R)return!0;var t=this.__$u,n=t&&t.s!==void 0;for(var r in e)return!0;if(this.__f||typeof this.u=="boolean"&&this.u===!0){var s=2&this.__$f;if(!(n||s||4&this.__$f)||1&this.__$f)return!0}else if(!(n||4&this.__$f)||3&this.__$f)return!0;for(var o in i)if(o!=="__source"&&i[o]!==this.props[o])return!0;for(var a in this.props)if(!(a in i))return!0;return!1};function Rp(i,e){return Hr(function(){return R(i,e)},[])}var Pp=function(i){queueMicrotask(function(){queueMicrotask(i)})};function Ip(){Ep(function(){for(var i;i=dh.shift();)uh.call(i)})}function mh(){dh.push(this)===1&&(J.requestAnimationFrame||Pp)(Ip)}const Dp="camera-frames",zp="0.13.1",Np="e7095e7",Bp="main",Op="e96e30cf",Lp="2026-04-19T05:59:59.983Z",Ya="__CAMERA_FRAMES_RUNTIME_SEQUENCE__",jp="__CAMERA_FRAMES_ACTIVE_RUNTIME__",ix=!1,Vp=R($p);function Up(i=(e=>(e=globalThis.location)==null?void 0:e.search)()??""){try{return new URLSearchParams(i)}catch{return new URLSearchParams}}const fh=Object.freeze({name:Dp,version:zp,commit:Np,branch:Bp,codeStamp:Op,builtAt:Lp});function Hp(){const e=Number(globalThis[Ya]??0)+1;return globalThis[Ya]=e,e}function Gp(i){return`${Date.now().toString(36)}-${i.toString(36)}`}function rx(){const i=Hp(),e=Object.freeze({id:Gp(i),sequence:i,startedAt:new Date().toISOString()});return globalThis[jp]=e,e}function Wp(){return`v${fh.version}`}function sx(){return Vp.value||fh.codeStamp||null}function ox(i,{search:e=(t=>(t=globalThis.location)==null?void 0:t.search)()??""}={}){const n=Up(e);if(!n.has(i))return!1;const r=String(n.get(i)??"").trim().toLowerCase();return r===""||r==="1"||r==="true"||r==="yes"||r==="on"}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const gh="180",ax=0,lx=1,cx=2,hx=1,ux=2,dx=3,oo=0,yh=1,px=2,Xp=0,qa=1,mx=2,fx=3,gx=4,yx=5,Za=100,_x=101,bx=102,xx=103,vx=104,wx=200,Mx=201,Sx=202,$x=203,Ja=204,Ka=205,kx=206,Ex=207,Tx=208,Cx=209,Ax=210,Fx=211,Rx=212,Px=213,Ix=214,Dx=0,zx=1,Nx=2,Qa=3,Bx=4,Ox=5,Lx=6,jx=7,Yp=0,Vx=1,Ux=2,Hx=0,Gx=1,Wx=2,Xx=3,Yx=4,qx=5,Zx=6,Jx=7,el="attached",qp="detached",_h=300,Zp=301,Kx=302,Qx=303,ev=304,tv=306,tl=1e3,wn=1001,nl=1002,Nt=1003,nv=1004,iv=1005,Tr=1006,rv=1007,bh=1008,sv=1008,Uo=1009,Jp=1010,Kp=1011,Qp=1012,em=1013,xh=1014,Wr=1015,tm=1016,nm=1017,im=1018,ov=1020,rm=35902,sm=35899,om=1021,am=1022,Ho=1023,il=1026,lm=1027,vh=1028,cm=1029,hm=1030,um=1031,dm=1033,pm=33776,mm=33777,fm=33778,gm=33779,ym=35840,_m=35841,bm=35842,xm=35843,vm=36196,wm=37492,Mm=37496,Sm=37808,$m=37809,km=37810,Em=37811,Tm=37812,Cm=37813,Am=37814,Fm=37815,Rm=37816,Pm=37817,Im=37818,Dm=37819,zm=37820,Nm=37821,Bm=36492,Om=36494,Lm=36495,jm=36283,Vm=36284,Um=36285,Hm=36286,Cr=2300,ao=2301,us=2302,rl=2400,sl=2401,ol=2402,Gm=2500,av=0,lv=1,cv=2,Wm=3200,hv=3201,Xm=0,uv=1,wh="",Ke="srgb",al="srgb-linear",ll="linear",ds="srgb",Qt=7680,cl=519,dv=512,pv=513,mv=514,fv=515,gv=516,yv=517,_v=518,bv=519,lo=35044,xv=35048,vv="300 es",yt=2e3,ci=2001;class Si{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const r=n[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const Te=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let hl=1234567;const ti=Math.PI/180,hi=180/Math.PI;function nt(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Te[i&255]+Te[i>>8&255]+Te[i>>16&255]+Te[i>>24&255]+"-"+Te[e&255]+Te[e>>8&255]+"-"+Te[e>>16&15|64]+Te[e>>24&255]+"-"+Te[t&63|128]+Te[t>>8&255]+"-"+Te[t>>16&255]+Te[t>>24&255]+Te[n&255]+Te[n>>8&255]+Te[n>>16&255]+Te[n>>24&255]).toLowerCase()}function q(i,e,t){return Math.max(e,Math.min(t,i))}function Go(i,e){return(i%e+e)%e}function Ym(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function qm(i,e,t){return i!==e?(t-i)/(e-i):0}function ni(i,e,t){return(1-t)*i+t*e}function Zm(i,e,t,n){return ni(i,e,1-Math.exp(-t*n))}function Jm(i,e=1){return e-Math.abs(Go(i,e*2)-e)}function Km(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Qm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function ef(i,e){return i+Math.floor(Math.random()*(e-i+1))}function tf(i,e){return i+Math.random()*(e-i)}function nf(i){return i*(.5-Math.random())}function rf(i){i!==void 0&&(hl=i);let e=hl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function sf(i){return i*ti}function of(i){return i*hi}function af(i){return(i&i-1)===0&&i!==0}function lf(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function cf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function hf(i,e,t,n,r){const s=Math.cos,o=Math.sin,a=s(t/2),c=o(t/2),l=s((e+n)/2),u=o((e+n)/2),h=s((e-n)/2),d=o((e-n)/2),p=s((n-e)/2),m=o((n-e)/2);switch(r){case"XYX":i.set(a*u,c*h,c*d,a*l);break;case"YZY":i.set(c*d,a*u,c*h,a*l);break;case"ZXZ":i.set(c*h,c*d,a*u,a*l);break;case"XZX":i.set(a*u,c*m,c*p,a*l);break;case"YXY":i.set(c*p,a*u,c*m,a*l);break;case"ZYZ":i.set(c*m,c*p,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function et(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function se(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const ii={DEG2RAD:ti,RAD2DEG:hi,generateUUID:nt,clamp:q,euclideanModulo:Go,mapLinear:Ym,inverseLerp:qm,lerp:ni,damp:Zm,pingpong:Jm,smoothstep:Km,smootherstep:Qm,randInt:ef,randFloat:tf,randFloatSpread:nf,seededRandom:rf,degToRad:sf,radToDeg:of,isPowerOfTwo:af,ceilPowerOfTwo:lf,floorPowerOfTwo:cf,setQuaternionFromProperEuler:hf,normalize:se,denormalize:et};class ce{constructor(e=0,t=0){ce.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=q(this.x,e.x,t.x),this.y=q(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=q(this.x,e,t),this.y=q(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(q(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(q(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class qt{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let c=n[r+0],l=n[r+1],u=n[r+2],h=n[r+3];const d=s[o+0],p=s[o+1],m=s[o+2],f=s[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=m,e[t+3]=f;return}if(h!==f||c!==d||l!==p||u!==m){let g=1-a;const y=c*d+l*p+u*m+h*f,b=y>=0?1:-1,M=1-y*y;if(M>Number.EPSILON){const w=Math.sqrt(M),A=Math.atan2(w,y*b);g=Math.sin(g*A)/w,a=Math.sin(a*A)/w}const v=a*b;if(c=c*g+d*v,l=l*g+p*v,u=u*g+m*v,h=h*g+f*v,g===1-a){const w=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=w,l*=w,u*=w,h*=w}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],c=n[r+1],l=n[r+2],u=n[r+3],h=s[o],d=s[o+1],p=s[o+2],m=s[o+3];return e[t]=a*m+u*h+c*p-l*d,e[t+1]=c*m+u*d+l*h-a*p,e[t+2]=l*m+u*p+a*d-c*h,e[t+3]=u*m-a*h-c*d-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(r/2),h=a(s/2),d=c(n/2),p=c(r/2),m=c(s/2);switch(o){case"XYZ":this._x=d*u*h+l*p*m,this._y=l*p*h-d*u*m,this._z=l*u*m+d*p*h,this._w=l*u*h-d*p*m;break;case"YXZ":this._x=d*u*h+l*p*m,this._y=l*p*h-d*u*m,this._z=l*u*m-d*p*h,this._w=l*u*h+d*p*m;break;case"ZXY":this._x=d*u*h-l*p*m,this._y=l*p*h+d*u*m,this._z=l*u*m+d*p*h,this._w=l*u*h-d*p*m;break;case"ZYX":this._x=d*u*h-l*p*m,this._y=l*p*h+d*u*m,this._z=l*u*m-d*p*h,this._w=l*u*h+d*p*m;break;case"YZX":this._x=d*u*h+l*p*m,this._y=l*p*h+d*u*m,this._z=l*u*m-d*p*h,this._w=l*u*h-d*p*m;break;case"XZY":this._x=d*u*h-l*p*m,this._y=l*p*h-d*u*m,this._z=l*u*m+d*p*h,this._w=l*u*h+d*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-c)*p,this._y=(s-l)*p,this._z=(o-r)*p}else if(n>a&&n>h){const p=2*Math.sqrt(1+n-a-h);this._w=(u-c)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+l)/p}else if(a>h){const p=2*Math.sqrt(1+a-n-h);this._w=(s-l)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(c+u)/p}else{const p=2*Math.sqrt(1+h-n-a);this._w=(o-r)/p,this._x=(s+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(q(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*a+r*l-s*c,this._y=r*u+o*c+s*a-n*l,this._z=s*u+o*l+n*c-r*a,this._w=o*u-n*a-r*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const c=1-a*a;if(c<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,d=Math.sin(t*u)/l;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class E{constructor(e=0,t=0,n=0){E.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ul.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ul.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*r-a*n),u=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+c*l+o*h-a*u,this.y=n+c*u+a*l-s*h,this.z=r+c*h+s*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=q(this.x,e.x,t.x),this.y=q(this.y,e.y,t.y),this.z=q(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=q(this.x,e,t),this.y=q(this.y,e,t),this.z=q(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(q(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,c=t.z;return this.x=r*c-s*a,this.y=s*o-n*c,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ps.copy(this).projectOnVector(e),this.sub(ps)}reflect(e){return this.sub(ps.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(q(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ps=new E,ul=new qt;class Mt{constructor(e,t,n,r,s,o,a,c,l){Mt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,c,l)}set(e,t,n,r,s,o,a,c,l){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],h=n[7],d=n[2],p=n[5],m=n[8],f=r[0],g=r[3],y=r[6],b=r[1],M=r[4],v=r[7],w=r[2],A=r[5],_=r[8];return s[0]=o*f+a*b+c*w,s[3]=o*g+a*M+c*A,s[6]=o*y+a*v+c*_,s[1]=l*f+u*b+h*w,s[4]=l*g+u*M+h*A,s[7]=l*y+u*v+h*_,s[2]=d*f+p*b+m*w,s[5]=d*g+p*M+m*A,s[8]=d*y+p*v+m*_,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-n*s*u+n*a*c+r*s*l-r*o*c}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*s,p=l*s-o*c,m=t*h+n*d+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const f=1/m;return e[0]=h*f,e[1]=(r*l-u*n)*f,e[2]=(a*n-r*o)*f,e[3]=d*f,e[4]=(u*t-r*c)*f,e[5]=(r*s-a*t)*f,e[6]=p*f,e[7]=(n*c-l*t)*f,e[8]=(o*t-n*s)*f,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const c=Math.cos(s),l=Math.sin(s);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-r*l,r*c,-r*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(ms.makeScale(e,t)),this}rotate(e){return this.premultiply(ms.makeRotation(-e)),this}translate(e,t){return this.premultiply(ms.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ms=new Mt;function uf(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ar(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function wv(){const i=Ar("canvas");return i.style.display="block",i}const dl={};function pl(i){i in dl||(dl[i]=!0,console.warn(i))}function Mv(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}const ml=new Mt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fl=new Mt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function df(){const i={enabled:!0,workingColorSpace:al,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===ds&&(r.r=xt(r.r),r.g=xt(r.g),r.b=xt(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ds&&(r.r=Sn(r.r),r.g=Sn(r.g),r.b=Sn(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===wh?ll:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return pl("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return pl("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[al]:{primaries:e,whitePoint:n,transfer:ll,toXYZ:ml,fromXYZ:fl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ke},outputColorSpaceConfig:{drawingBufferColorSpace:Ke}},[Ke]:{primaries:e,whitePoint:n,transfer:ds,toXYZ:ml,fromXYZ:fl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ke}}}),i}const Ve=df();function xt(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Sn(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let en;class pf{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{en===void 0&&(en=Ar("canvas")),en.width=e.width,en.height=e.height;const r=en.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=en}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ar("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=xt(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(xt(t[n]/255)*255):t[n]=xt(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let mf=0;class Wo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:mf++}),this.uuid=nt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(fs(r[o].image)):s.push(fs(r[o]))}else s=fs(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function fs(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?pf.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ff=0;const gs=new E;class Pe extends Si{constructor(e=Pe.DEFAULT_IMAGE,t=Pe.DEFAULT_MAPPING,n=wn,r=wn,s=Tr,o=bh,a=Ho,c=Uo,l=Pe.DEFAULT_ANISOTROPY,u=wh){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ff++}),this.uuid=nt(),this.name="",this.source=new Wo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Mt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(gs).x}get height(){return this.source.getSize(gs).y}get depth(){return this.source.getSize(gs).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_h)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case tl:e.x=e.x-Math.floor(e.x);break;case wn:e.x=e.x<0?0:1;break;case nl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case tl:e.y=e.y-Math.floor(e.y);break;case wn:e.y=e.y<0?0:1;break;case nl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Pe.DEFAULT_IMAGE=null;Pe.DEFAULT_MAPPING=_h;Pe.DEFAULT_ANISOTROPY=1;class $e{constructor(e=0,t=0,n=0,r=1){$e.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],p=c[5],m=c[9],f=c[2],g=c[6],y=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-f)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+f)<.1&&Math.abs(m+g)<.1&&Math.abs(l+p+y-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(l+1)/2,v=(p+1)/2,w=(y+1)/2,A=(u+d)/4,_=(h+f)/4,x=(m+g)/4;return M>v&&M>w?M<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(M),r=A/n,s=_/n):v>w?v<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),n=A/r,s=x/r):w<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(w),n=_/s,r=x/s),this.set(n,r,s,t),this}let b=Math.sqrt((g-m)*(g-m)+(h-f)*(h-f)+(d-u)*(d-u));return Math.abs(b)<.001&&(b=1),this.x=(g-m)/b,this.y=(h-f)/b,this.z=(d-u)/b,this.w=Math.acos((l+p+y-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=q(this.x,e.x,t.x),this.y=q(this.y,e.y,t.y),this.z=q(this.z,e.z,t.z),this.w=q(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=q(this.x,e,t),this.y=q(this.y,e,t),this.z=q(this.z,e,t),this.w=q(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(q(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class gf extends Si{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tr,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new $e(0,0,e,t),this.scissorTest=!1,this.viewport=new $e(0,0,e,t);const r={width:e,height:t,depth:n.depth},s=new Pe(r);this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Tr,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new Wo(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Mh extends gf{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class yf extends Pe{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Sv extends Mh{constructor(e=1,t=1,n=1,r={}){super(e,t,r),this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new yf(null,e,t,n),this._setTextureOptions(r),this.texture.isRenderTargetTexture=!0}}class $v extends Pe{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ot{constructor(e=new E(1/0,1/0,1/0),t=new E(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(qe.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(qe.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=qe.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,qe):qe.fromBufferAttribute(s,o),qe.applyMatrix4(e.matrixWorld),this.expandByPoint(qe);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ri.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ri.copy(n.boundingBox)),Ri.applyMatrix4(e.matrixWorld),this.union(Ri)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,qe),qe.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vn),Pi.subVectors(this.max,Vn),tn.subVectors(e.a,Vn),nn.subVectors(e.b,Vn),rn.subVectors(e.c,Vn),kt.subVectors(nn,tn),Et.subVectors(rn,nn),jt.subVectors(tn,rn);let t=[0,-kt.z,kt.y,0,-Et.z,Et.y,0,-jt.z,jt.y,kt.z,0,-kt.x,Et.z,0,-Et.x,jt.z,0,-jt.x,-kt.y,kt.x,0,-Et.y,Et.x,0,-jt.y,jt.x,0];return!ys(t,tn,nn,rn,Pi)||(t=[1,0,0,0,1,0,0,0,1],!ys(t,tn,nn,rn,Pi))?!1:(Ii.crossVectors(kt,Et),t=[Ii.x,Ii.y,Ii.z],ys(t,tn,nn,rn,Pi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,qe).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(qe).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(lt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),lt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),lt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),lt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),lt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),lt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),lt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),lt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(lt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const lt=[new E,new E,new E,new E,new E,new E,new E,new E],qe=new E,Ri=new Ot,tn=new E,nn=new E,rn=new E,kt=new E,Et=new E,jt=new E,Vn=new E,Pi=new E,Ii=new E,Vt=new E;function ys(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){Vt.fromArray(i,s);const a=r.x*Math.abs(Vt.x)+r.y*Math.abs(Vt.y)+r.z*Math.abs(Vt.z),c=e.dot(Vt),l=t.dot(Vt),u=n.dot(Vt);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}const _f=new Ot,Un=new E,_s=new E;class St{constructor(e=new E,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):_f.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Un.subVectors(e,this.center);const t=Un.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Un,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_s.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Un.copy(e.center).add(_s)),this.expandByPoint(Un.copy(e.center).sub(_s))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const ct=new E,bs=new E,Di=new E,Tt=new E,xs=new E,zi=new E,vs=new E;class $i{constructor(e=new E,t=new E(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ct)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ct.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ct.copy(this.origin).addScaledVector(this.direction,t),ct.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){bs.copy(e).add(t).multiplyScalar(.5),Di.copy(t).sub(e).normalize(),Tt.copy(this.origin).sub(bs);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Di),a=Tt.dot(this.direction),c=-Tt.dot(Di),l=Tt.lengthSq(),u=Math.abs(1-o*o);let h,d,p,m;if(u>0)if(h=o*c-a,d=o*a-c,m=s*u,h>=0)if(d>=-m)if(d<=m){const f=1/u;h*=f,d*=f,p=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;else d<=-m?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-c),s),p=-h*h+d*(d+2*c)+l):d<=m?(h=0,d=Math.min(Math.max(-s,-c),s),p=d*(d+2*c)+l):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-c),s),p=-h*h+d*(d+2*c)+l);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(bs).addScaledVector(Di,d),p}intersectSphere(e,t){ct.subVectors(e.center,this.origin);const n=ct.dot(this.direction),r=ct.dot(ct)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,r=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,r=(e.min.x-d.x)*l),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),n>c||a>r)||((a>n||n!==n)&&(n=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,ct)!==null}intersectTriangle(e,t,n,r,s){xs.subVectors(t,e),zi.subVectors(n,e),vs.crossVectors(xs,zi);let o=this.direction.dot(vs),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Tt.subVectors(this.origin,e);const c=a*this.direction.dot(zi.crossVectors(Tt,zi));if(c<0)return null;const l=a*this.direction.dot(xs.cross(Tt));if(l<0||c+l>o)return null;const u=-a*Tt.dot(vs);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ee{constructor(e,t,n,r,s,o,a,c,l,u,h,d,p,m,f,g){ee.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,c,l,u,h,d,p,m,f,g)}set(e,t,n,r,s,o,a,c,l,u,h,d,p,m,f,g){const y=this.elements;return y[0]=e,y[4]=t,y[8]=n,y[12]=r,y[1]=s,y[5]=o,y[9]=a,y[13]=c,y[2]=l,y[6]=u,y[10]=h,y[14]=d,y[3]=p,y[7]=m,y[11]=f,y[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ee().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/sn.setFromMatrixColumn(e,0).length(),s=1/sn.setFromMatrixColumn(e,1).length(),o=1/sn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(r),l=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const d=o*u,p=o*h,m=a*u,f=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=p+m*l,t[5]=d-f*l,t[9]=-a*c,t[2]=f-d*l,t[6]=m+p*l,t[10]=o*c}else if(e.order==="YXZ"){const d=c*u,p=c*h,m=l*u,f=l*h;t[0]=d+f*a,t[4]=m*a-p,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-m,t[6]=f+d*a,t[10]=o*c}else if(e.order==="ZXY"){const d=c*u,p=c*h,m=l*u,f=l*h;t[0]=d-f*a,t[4]=-o*h,t[8]=m+p*a,t[1]=p+m*a,t[5]=o*u,t[9]=f-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const d=o*u,p=o*h,m=a*u,f=a*h;t[0]=c*u,t[4]=m*l-p,t[8]=d*l+f,t[1]=c*h,t[5]=f*l+d,t[9]=p*l-m,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const d=o*c,p=o*l,m=a*c,f=a*l;t[0]=c*u,t[4]=f-d*h,t[8]=m*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=p*h+m,t[10]=d-f*h}else if(e.order==="XZY"){const d=o*c,p=o*l,m=a*c,f=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+f,t[5]=o*u,t[9]=p*h-m,t[2]=m*h-p,t[6]=a*u,t[10]=f*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(bf,e,xf)}lookAt(e,t,n){const r=this.elements;return Oe.subVectors(e,t),Oe.lengthSq()===0&&(Oe.z=1),Oe.normalize(),Ct.crossVectors(n,Oe),Ct.lengthSq()===0&&(Math.abs(n.z)===1?Oe.x+=1e-4:Oe.z+=1e-4,Oe.normalize(),Ct.crossVectors(n,Oe)),Ct.normalize(),Ni.crossVectors(Oe,Ct),r[0]=Ct.x,r[4]=Ni.x,r[8]=Oe.x,r[1]=Ct.y,r[5]=Ni.y,r[9]=Oe.y,r[2]=Ct.z,r[6]=Ni.z,r[10]=Oe.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],h=n[5],d=n[9],p=n[13],m=n[2],f=n[6],g=n[10],y=n[14],b=n[3],M=n[7],v=n[11],w=n[15],A=r[0],_=r[4],x=r[8],k=r[12],S=r[1],T=r[5],P=r[9],N=r[13],H=r[2],F=r[6],O=r[10],G=r[14],ne=r[3],Z=r[7],B=r[11],j=r[15];return s[0]=o*A+a*S+c*H+l*ne,s[4]=o*_+a*T+c*F+l*Z,s[8]=o*x+a*P+c*O+l*B,s[12]=o*k+a*N+c*G+l*j,s[1]=u*A+h*S+d*H+p*ne,s[5]=u*_+h*T+d*F+p*Z,s[9]=u*x+h*P+d*O+p*B,s[13]=u*k+h*N+d*G+p*j,s[2]=m*A+f*S+g*H+y*ne,s[6]=m*_+f*T+g*F+y*Z,s[10]=m*x+f*P+g*O+y*B,s[14]=m*k+f*N+g*G+y*j,s[3]=b*A+M*S+v*H+w*ne,s[7]=b*_+M*T+v*F+w*Z,s[11]=b*x+M*P+v*O+w*B,s[15]=b*k+M*N+v*G+w*j,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],p=e[14],m=e[3],f=e[7],g=e[11],y=e[15];return m*(+s*c*h-r*l*h-s*a*d+n*l*d+r*a*p-n*c*p)+f*(+t*c*p-t*l*d+s*o*d-r*o*p+r*l*u-s*c*u)+g*(+t*l*h-t*a*p-s*o*h+n*o*p+s*a*u-n*l*u)+y*(-r*a*u-t*c*h+t*a*d+r*o*h-n*o*d+n*c*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],p=e[11],m=e[12],f=e[13],g=e[14],y=e[15],b=h*g*l-f*d*l+f*c*p-a*g*p-h*c*y+a*d*y,M=m*d*l-u*g*l-m*c*p+o*g*p+u*c*y-o*d*y,v=u*f*l-m*h*l+m*a*p-o*f*p-u*a*y+o*h*y,w=m*h*c-u*f*c-m*a*d+o*f*d+u*a*g-o*h*g,A=t*b+n*M+r*v+s*w;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const _=1/A;return e[0]=b*_,e[1]=(f*d*s-h*g*s-f*r*p+n*g*p+h*r*y-n*d*y)*_,e[2]=(a*g*s-f*c*s+f*r*l-n*g*l-a*r*y+n*c*y)*_,e[3]=(h*c*s-a*d*s-h*r*l+n*d*l+a*r*p-n*c*p)*_,e[4]=M*_,e[5]=(u*g*s-m*d*s+m*r*p-t*g*p-u*r*y+t*d*y)*_,e[6]=(m*c*s-o*g*s-m*r*l+t*g*l+o*r*y-t*c*y)*_,e[7]=(o*d*s-u*c*s+u*r*l-t*d*l-o*r*p+t*c*p)*_,e[8]=v*_,e[9]=(m*h*s-u*f*s-m*n*p+t*f*p+u*n*y-t*h*y)*_,e[10]=(o*f*s-m*a*s+m*n*l-t*f*l-o*n*y+t*a*y)*_,e[11]=(u*a*s-o*h*s-u*n*l+t*h*l+o*n*p-t*a*p)*_,e[12]=w*_,e[13]=(u*f*r-m*h*r+m*n*d-t*f*d-u*n*g+t*h*g)*_,e[14]=(m*a*r-o*f*r-m*n*c+t*f*c+o*n*g-t*a*g)*_,e[15]=(o*h*r-u*a*r+u*n*c-t*h*c-o*n*d+t*a*d)*_,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,c=e.z,l=s*o,u=s*a;return this.set(l*o+n,l*a-r*c,l*c+r*a,0,l*a+r*c,u*a+n,u*c-r*o,0,l*c-r*a,u*c+r*o,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,c=t._w,l=s+s,u=o+o,h=a+a,d=s*l,p=s*u,m=s*h,f=o*u,g=o*h,y=a*h,b=c*l,M=c*u,v=c*h,w=n.x,A=n.y,_=n.z;return r[0]=(1-(f+y))*w,r[1]=(p+v)*w,r[2]=(m-M)*w,r[3]=0,r[4]=(p-v)*A,r[5]=(1-(d+y))*A,r[6]=(g+b)*A,r[7]=0,r[8]=(m+M)*_,r[9]=(g-b)*_,r[10]=(1-(d+f))*_,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=sn.set(r[0],r[1],r[2]).length();const o=sn.set(r[4],r[5],r[6]).length(),a=sn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Ze.copy(this);const l=1/s,u=1/o,h=1/a;return Ze.elements[0]*=l,Ze.elements[1]*=l,Ze.elements[2]*=l,Ze.elements[4]*=u,Ze.elements[5]*=u,Ze.elements[6]*=u,Ze.elements[8]*=h,Ze.elements[9]*=h,Ze.elements[10]*=h,t.setFromRotationMatrix(Ze),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=yt,c=!1){const l=this.elements,u=2*s/(t-e),h=2*s/(n-r),d=(t+e)/(t-e),p=(n+r)/(n-r);let m,f;if(c)m=s/(o-s),f=o*s/(o-s);else if(a===yt)m=-(o+s)/(o-s),f=-2*o*s/(o-s);else if(a===ci)m=-o/(o-s),f=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=f,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=yt,c=!1){const l=this.elements,u=2/(t-e),h=2/(n-r),d=-(t+e)/(t-e),p=-(n+r)/(n-r);let m,f;if(c)m=1/(o-s),f=o/(o-s);else if(a===yt)m=-2/(o-s),f=-(o+s)/(o-s);else if(a===ci)m=-1/(o-s),f=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=m,l[14]=f,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const sn=new E,Ze=new ee,bf=new E(0,0,0),xf=new E(1,1,1),Ct=new E,Ni=new E,Oe=new E,gl=new ee,yl=new qt;class vt{constructor(e=0,t=0,n=0,r=vt.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],c=r[1],l=r[5],u=r[9],h=r[2],d=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(q(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-q(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(q(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-q(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(q(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-q(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return gl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(gl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return yl.setFromEuler(this),this.setFromQuaternion(yl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}vt.DEFAULT_ORDER="XYZ";class Sh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let vf=0;const _l=new E,on=new qt,ht=new ee,Bi=new E,Hn=new E,wf=new E,Mf=new qt,bl=new E(1,0,0),xl=new E(0,1,0),vl=new E(0,0,1),wl={type:"added"},Sf={type:"removed"},an={type:"childadded",child:null},ws={type:"childremoved",child:null};class de extends Si{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:vf++}),this.uuid=nt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=de.DEFAULT_UP.clone();const e=new E,t=new vt,n=new qt,r=new E(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ee},normalMatrix:{value:new Mt}}),this.matrix=new ee,this.matrixWorld=new ee,this.matrixAutoUpdate=de.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=de.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Sh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return on.setFromAxisAngle(e,t),this.quaternion.multiply(on),this}rotateOnWorldAxis(e,t){return on.setFromAxisAngle(e,t),this.quaternion.premultiply(on),this}rotateX(e){return this.rotateOnAxis(bl,e)}rotateY(e){return this.rotateOnAxis(xl,e)}rotateZ(e){return this.rotateOnAxis(vl,e)}translateOnAxis(e,t){return _l.copy(e).applyQuaternion(this.quaternion),this.position.add(_l.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(bl,e)}translateY(e){return this.translateOnAxis(xl,e)}translateZ(e){return this.translateOnAxis(vl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ht.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Bi.copy(e):Bi.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Hn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ht.lookAt(Hn,Bi,this.up):ht.lookAt(Bi,Hn,this.up),this.quaternion.setFromRotationMatrix(ht),r&&(ht.extractRotation(r.matrixWorld),on.setFromRotationMatrix(ht),this.quaternion.premultiply(on.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(wl),an.child=e,this.dispatchEvent(an),an.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sf),ws.child=e,this.dispatchEvent(ws),ws.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ht.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ht.multiply(e.parent.matrixWorld)),e.applyMatrix4(ht),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(wl),an.child=e,this.dispatchEvent(an),an.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hn,e,wf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hn,Mf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(e.materials,this.material[c]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];r.animations.push(s(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),p=o(e.animations),m=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),m.length>0&&(n.nodes=m)}return n.object=r,n;function o(a){const c=[];for(const l in a){const u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}de.DEFAULT_UP=new E(0,1,0);de.DEFAULT_MATRIX_AUTO_UPDATE=!0;de.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Je=new E,ut=new E,Ms=new E,dt=new E,ln=new E,cn=new E,Ml=new E,Ss=new E,$s=new E,ks=new E,Es=new $e,Ts=new $e,Cs=new $e;class He{constructor(e=new E,t=new E,n=new E){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Je.subVectors(e,t),r.cross(Je);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Je.subVectors(r,t),ut.subVectors(n,t),Ms.subVectors(e,t);const o=Je.dot(Je),a=Je.dot(ut),c=Je.dot(Ms),l=ut.dot(ut),u=ut.dot(Ms),h=o*l-a*a;if(h===0)return s.set(0,0,0),null;const d=1/h,p=(l*c-a*u)*d,m=(o*u-a*c)*d;return s.set(1-p-m,m,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,dt)===null?!1:dt.x>=0&&dt.y>=0&&dt.x+dt.y<=1}static getInterpolation(e,t,n,r,s,o,a,c){return this.getBarycoord(e,t,n,r,dt)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,dt.x),c.addScaledVector(o,dt.y),c.addScaledVector(a,dt.z),c)}static getInterpolatedAttribute(e,t,n,r,s,o){return Es.setScalar(0),Ts.setScalar(0),Cs.setScalar(0),Es.fromBufferAttribute(e,t),Ts.fromBufferAttribute(e,n),Cs.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Es,s.x),o.addScaledVector(Ts,s.y),o.addScaledVector(Cs,s.z),o}static isFrontFacing(e,t,n,r){return Je.subVectors(n,t),ut.subVectors(e,t),Je.cross(ut).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Je.subVectors(this.c,this.b),ut.subVectors(this.a,this.b),Je.cross(ut).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return He.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return He.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return He.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return He.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return He.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;ln.subVectors(r,n),cn.subVectors(s,n),Ss.subVectors(e,n);const c=ln.dot(Ss),l=cn.dot(Ss);if(c<=0&&l<=0)return t.copy(n);$s.subVectors(e,r);const u=ln.dot($s),h=cn.dot($s);if(u>=0&&h<=u)return t.copy(r);const d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(ln,o);ks.subVectors(e,s);const p=ln.dot(ks),m=cn.dot(ks);if(m>=0&&p<=m)return t.copy(s);const f=p*l-c*m;if(f<=0&&l>=0&&m<=0)return a=l/(l-m),t.copy(n).addScaledVector(cn,a);const g=u*m-p*h;if(g<=0&&h-u>=0&&p-m>=0)return Ml.subVectors(s,r),a=(h-u)/(h-u+(p-m)),t.copy(r).addScaledVector(Ml,a);const y=1/(g+f+d);return o=f*y,a=d*y,t.copy(n).addScaledVector(ln,o).addScaledVector(cn,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const $h={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},At={h:0,s:0,l:0},Oi={h:0,s:0,l:0};function As(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class we{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ke){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ve.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Ve.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ve.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Ve.workingColorSpace){if(e=Go(e,1),t=q(t,0,1),n=q(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=As(o,s,e+1/3),this.g=As(o,s,e),this.b=As(o,s,e-1/3)}return Ve.colorSpaceToWorking(this,r),this}setStyle(e,t=Ke){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ke){const n=$h[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xt(e.r),this.g=xt(e.g),this.b=xt(e.b),this}copyLinearToSRGB(e){return this.r=Sn(e.r),this.g=Sn(e.g),this.b=Sn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ke){return Ve.workingToColorSpace(Ce.copy(this),e),Math.round(q(Ce.r*255,0,255))*65536+Math.round(q(Ce.g*255,0,255))*256+Math.round(q(Ce.b*255,0,255))}getHexString(e=Ke){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ve.workingColorSpace){Ve.workingToColorSpace(Ce.copy(this),t);const n=Ce.r,r=Ce.g,s=Ce.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let c,l;const u=(a+o)/2;if(a===o)c=0,l=0;else{const h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case n:c=(r-s)/h+(r<s?6:0);break;case r:c=(s-n)/h+2;break;case s:c=(n-r)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=Ve.workingColorSpace){return Ve.workingToColorSpace(Ce.copy(this),t),e.r=Ce.r,e.g=Ce.g,e.b=Ce.b,e}getStyle(e=Ke){Ve.workingToColorSpace(Ce.copy(this),e);const t=Ce.r,n=Ce.g,r=Ce.b;return e!==Ke?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(At),this.setHSL(At.h+e,At.s+t,At.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(At),e.getHSL(Oi);const n=ni(At.h,Oi.h,t),r=ni(At.s,Oi.s,t),s=ni(At.l,Oi.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ce=new we;we.NAMES=$h;let $f=0;class Lt extends Si{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:$f++}),this.uuid=nt(),this.name="",this.type="Material",this.blending=qa,this.side=oo,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ja,this.blendDst=Ka,this.blendEquation=Za,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new we(0,0,0),this.blendAlpha=0,this.depthFunc=Qa,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=cl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qt,this.stencilZFail=Qt,this.stencilZPass=Qt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==qa&&(n.blending=this.blending),this.side!==oo&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ja&&(n.blendSrc=this.blendSrc),this.blendDst!==Ka&&(n.blendDst=this.blendDst),this.blendEquation!==Za&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Qa&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==cl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Qt&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Qt&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Qt&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const c=s[a];delete c.metadata,o.push(c)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class kf extends Lt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new we(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vt,this.combine=Yp,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ye=new E,Li=new ce;let Ef=0;class zt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ef++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=lo,this.updateRanges=[],this.gpuType=Wr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Li.fromBufferAttribute(this,t),Li.applyMatrix3(e),this.setXY(t,Li.x,Li.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ye.fromBufferAttribute(this,t),ye.applyMatrix3(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ye.fromBufferAttribute(this,t),ye.applyMatrix4(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ye.fromBufferAttribute(this,t),ye.applyNormalMatrix(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ye.fromBufferAttribute(this,t),ye.transformDirection(e),this.setXYZ(t,ye.x,ye.y,ye.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=et(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=se(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=et(t,this.array)),t}setX(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=et(t,this.array)),t}setY(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=et(t,this.array)),t}setZ(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=et(t,this.array)),t}setW(e,t){return this.normalized&&(t=se(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=se(t,this.array),n=se(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=se(t,this.array),n=se(n,this.array),r=se(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=se(t,this.array),n=se(n,this.array),r=se(r,this.array),s=se(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==lo&&(e.usage=this.usage),e}}class Tf extends zt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Cf extends zt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ie extends zt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Af=0;const je=new ee,Fs=new de,hn=new E,Le=new Ot,Gn=new Ot,ve=new E;class Xe extends Si{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Af++}),this.uuid=nt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(uf(e)?Cf:Tf)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Mt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return je.makeRotationFromQuaternion(e),this.applyMatrix4(je),this}rotateX(e){return je.makeRotationX(e),this.applyMatrix4(je),this}rotateY(e){return je.makeRotationY(e),this.applyMatrix4(je),this}rotateZ(e){return je.makeRotationZ(e),this.applyMatrix4(je),this}translate(e,t,n){return je.makeTranslation(e,t,n),this.applyMatrix4(je),this}scale(e,t,n){return je.makeScale(e,t,n),this.applyMatrix4(je),this}lookAt(e){return Fs.lookAt(e),Fs.updateMatrix(),this.applyMatrix4(Fs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(hn).negate(),this.translate(hn.x,hn.y,hn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ie(n,3))}else{const n=Math.min(e.length,t.count);for(let r=0;r<n;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ot);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new E(-1/0,-1/0,-1/0),new E(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];Le.setFromBufferAttribute(s),this.morphTargetsRelative?(ve.addVectors(this.boundingBox.min,Le.min),this.boundingBox.expandByPoint(ve),ve.addVectors(this.boundingBox.max,Le.max),this.boundingBox.expandByPoint(ve)):(this.boundingBox.expandByPoint(Le.min),this.boundingBox.expandByPoint(Le.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new St);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new E,1/0);return}if(e){const n=this.boundingSphere.center;if(Le.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Gn.setFromBufferAttribute(a),this.morphTargetsRelative?(ve.addVectors(Le.min,Gn.min),Le.expandByPoint(ve),ve.addVectors(Le.max,Gn.max),Le.expandByPoint(ve)):(Le.expandByPoint(Gn.min),Le.expandByPoint(Gn.max))}Le.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)ve.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(ve));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)ve.fromBufferAttribute(a,l),c&&(hn.fromBufferAttribute(e,l),ve.add(hn)),r=Math.max(r,n.distanceToSquared(ve))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new zt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let x=0;x<n.count;x++)a[x]=new E,c[x]=new E;const l=new E,u=new E,h=new E,d=new ce,p=new ce,m=new ce,f=new E,g=new E;function y(x,k,S){l.fromBufferAttribute(n,x),u.fromBufferAttribute(n,k),h.fromBufferAttribute(n,S),d.fromBufferAttribute(s,x),p.fromBufferAttribute(s,k),m.fromBufferAttribute(s,S),u.sub(l),h.sub(l),p.sub(d),m.sub(d);const T=1/(p.x*m.y-m.x*p.y);isFinite(T)&&(f.copy(u).multiplyScalar(m.y).addScaledVector(h,-p.y).multiplyScalar(T),g.copy(h).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(T),a[x].add(f),a[k].add(f),a[S].add(f),c[x].add(g),c[k].add(g),c[S].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let x=0,k=b.length;x<k;++x){const S=b[x],T=S.start,P=S.count;for(let N=T,H=T+P;N<H;N+=3)y(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const M=new E,v=new E,w=new E,A=new E;function _(x){w.fromBufferAttribute(r,x),A.copy(w);const k=a[x];M.copy(k),M.sub(w.multiplyScalar(w.dot(k))).normalize(),v.crossVectors(A,k);const T=v.dot(c[x])<0?-1:1;o.setXYZW(x,M.x,M.y,M.z,T)}for(let x=0,k=b.length;x<k;++x){const S=b[x],T=S.start,P=S.count;for(let N=T,H=T+P;N<H;N+=3)_(e.getX(N+0)),_(e.getX(N+1)),_(e.getX(N+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new zt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const r=new E,s=new E,o=new E,a=new E,c=new E,l=new E,u=new E,h=new E;if(e)for(let d=0,p=e.count;d<p;d+=3){const m=e.getX(d+0),f=e.getX(d+1),g=e.getX(d+2);r.fromBufferAttribute(t,m),s.fromBufferAttribute(t,f),o.fromBufferAttribute(t,g),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(n,m),c.fromBufferAttribute(n,f),l.fromBufferAttribute(n,g),a.add(u),c.add(u),l.add(u),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(f,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let d=0,p=t.count;d<p;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)ve.fromBufferAttribute(e,t),ve.normalize(),e.setXYZ(t,ve.x,ve.y,ve.z)}toNonIndexed(){function e(a,c){const l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u);let p=0,m=0;for(let f=0,g=c.length;f<g;f++){a.isInterleavedBufferAttribute?p=c[f]*a.data.stride+a.offset:p=c[f]*u;for(let y=0;y<u;y++)d[m++]=l[p++]}return new zt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Xe,n=this.index.array,r=this.attributes;for(const a in r){const c=r[a],l=e(c,n);t.setAttribute(a,l)}const s=this.morphAttributes;for(const a in s){const c=[],l=s[a];for(let u=0,h=l.length;u<h;u++){const d=l[u],p=e(d,n);c.push(p)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const r={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){const p=l[h];u.push(p.toJSON(e.data))}u.length>0&&(r[c]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const r=e.attributes;for(const l in r){const u=r[l];this.setAttribute(l,u.clone(t))}const s=e.morphAttributes;for(const l in s){const u=[],h=s[l];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,u=o.length;l<u;l++){const h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Sl=new ee,Ut=new $i,ji=new St,$l=new E,Vi=new E,Ui=new E,Hi=new E,Rs=new E,Gi=new E,kl=new E,Wi=new E;class Xr extends de{constructor(e=new Xe,t=new kf){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){Gi.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const u=a[c],h=s[c];u!==0&&(Rs.fromBufferAttribute(h,e),o?Gi.addScaledVector(Rs,u):Gi.addScaledVector(Rs.sub(t),u))}t.add(Gi)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ji.copy(n.boundingSphere),ji.applyMatrix4(s),Ut.copy(e.ray).recast(e.near),!(ji.containsPoint(Ut.origin)===!1&&(Ut.intersectSphere(ji,$l)===null||Ut.origin.distanceToSquared($l)>(e.far-e.near)**2))&&(Sl.copy(s).invert(),Ut.copy(e.ray).applyMatrix4(Sl),!(n.boundingBox!==null&&Ut.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ut)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,f=d.length;m<f;m++){const g=d[m],y=o[g.materialIndex],b=Math.max(g.start,p.start),M=Math.min(a.count,Math.min(g.start+g.count,p.start+p.count));for(let v=b,w=M;v<w;v+=3){const A=a.getX(v),_=a.getX(v+1),x=a.getX(v+2);r=Xi(this,y,e,n,l,u,h,A,_,x),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const m=Math.max(0,p.start),f=Math.min(a.count,p.start+p.count);for(let g=m,y=f;g<y;g+=3){const b=a.getX(g),M=a.getX(g+1),v=a.getX(g+2);r=Xi(this,o,e,n,l,u,h,b,M,v),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(o))for(let m=0,f=d.length;m<f;m++){const g=d[m],y=o[g.materialIndex],b=Math.max(g.start,p.start),M=Math.min(c.count,Math.min(g.start+g.count,p.start+p.count));for(let v=b,w=M;v<w;v+=3){const A=v,_=v+1,x=v+2;r=Xi(this,y,e,n,l,u,h,A,_,x),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const m=Math.max(0,p.start),f=Math.min(c.count,p.start+p.count);for(let g=m,y=f;g<y;g+=3){const b=g,M=g+1,v=g+2;r=Xi(this,o,e,n,l,u,h,b,M,v),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}}function Ff(i,e,t,n,r,s,o,a){let c;if(e.side===yh?c=n.intersectTriangle(o,s,r,!0,a):c=n.intersectTriangle(r,s,o,e.side===oo,a),c===null)return null;Wi.copy(a),Wi.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Wi);return l<t.near||l>t.far?null:{distance:l,point:Wi.clone(),object:i}}function Xi(i,e,t,n,r,s,o,a,c,l){i.getVertexPosition(a,Vi),i.getVertexPosition(c,Ui),i.getVertexPosition(l,Hi);const u=Ff(i,e,t,n,Vi,Ui,Hi,kl);if(u){const h=new E;He.getBarycoord(kl,Vi,Ui,Hi,h),r&&(u.uv=He.getInterpolatedAttribute(r,a,c,l,h,new ce)),s&&(u.uv1=He.getInterpolatedAttribute(s,a,c,l,h,new ce)),o&&(u.normal=He.getInterpolatedAttribute(o,a,c,l,h,new E),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a,b:c,c:l,normal:new E,materialIndex:0};He.getNormal(Vi,Ui,Hi,d.normal),u.face=d,u.barycoord=h}return u}class Xo extends Xe{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const c=[],l=[],u=[],h=[];let d=0,p=0;m("z","y","x",-1,-1,n,t,e,o,s,0),m("z","y","x",1,-1,n,t,-e,o,s,1),m("x","z","y",1,1,e,n,t,r,o,2),m("x","z","y",1,-1,e,n,-t,r,o,3),m("x","y","z",1,-1,e,t,n,r,s,4),m("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(c),this.setAttribute("position",new Ie(l,3)),this.setAttribute("normal",new Ie(u,3)),this.setAttribute("uv",new Ie(h,2));function m(f,g,y,b,M,v,w,A,_,x,k){const S=v/_,T=w/x,P=v/2,N=w/2,H=A/2,F=_+1,O=x+1;let G=0,ne=0;const Z=new E;for(let B=0;B<O;B++){const j=B*T-N;for(let le=0;le<F;le++){const xe=le*S-P;Z[f]=xe*b,Z[g]=j*M,Z[y]=H,l.push(Z.x,Z.y,Z.z),Z[f]=0,Z[g]=0,Z[y]=A>0?1:-1,u.push(Z.x,Z.y,Z.z),h.push(le/_),h.push(1-B/x),G+=1}}for(let B=0;B<x;B++)for(let j=0;j<_;j++){const le=d+j+F*B,xe=d+j+F*(B+1),st=d+(j+1)+F*(B+1),D=d+(j+1)+F*B;c.push(le,xe,D),c.push(xe,st,D),ne+=6}a.addGroup(p,ne,k),p+=ne,d+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xo(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Yr(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Rf(i){const e={};for(let t=0;t<i.length;t++){const n=Yr(i[t]);for(const r in n)e[r]=n[r]}return e}function Pf(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function kv(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ve.workingColorSpace}const Ev={clone:Yr,merge:Rf};var If=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Df=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class kh extends Lt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=If,this.fragmentShader=Df,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Yr(e.uniforms),this.uniformsGroups=Pf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Yo extends de{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ee,this.projectionMatrix=new ee,this.projectionMatrixInverse=new ee,this.coordinateSystem=yt,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ft=new E,El=new ce,Tl=new ce;class ft extends Yo{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=hi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ti*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return hi*2*Math.atan(Math.tan(ti*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ft.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ft.x,Ft.y).multiplyScalar(-e/Ft.z),Ft.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ft.x,Ft.y).multiplyScalar(-e/Ft.z)}getViewSize(e,t){return this.getViewBounds(e,El,Tl),t.subVectors(Tl,El)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ti*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*r/c,t-=o.offsetY*n/l,r*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const un=-90,dn=1;class zf extends de{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new ft(un,dn,e,t);r.layers=this.layers,this.add(r);const s=new ft(un,dn,e,t);s.layers=this.layers,this.add(s);const o=new ft(un,dn,e,t);o.layers=this.layers,this.add(o);const a=new ft(un,dn,e,t);a.layers=this.layers,this.add(a);const c=new ft(un,dn,e,t);c.layers=this.layers,this.add(c);const l=new ft(un,dn,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,c]=t;for(const l of t)this.remove(l);if(e===yt)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ci)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const f=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,c),e.setRenderTarget(n,4,r),e.render(t,l),n.texture.generateMipmaps=f,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(h,d,p),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Nf extends Pe{constructor(e=[],t=Zp,n,r,s,o,a,c,l,u){super(e,t,n,r,s,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Tv extends Mh{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Nf(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Xo(5,5,5),s=new kh({name:"CubemapFromEquirect",uniforms:Yr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:yh,blending:Xp});s.uniforms.tEquirect.value=t;const o=new Xr(r,s),a=t.minFilter;return t.minFilter===bh&&(t.minFilter=Tr),new zf(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}class Yi extends de{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Bf={type:"move"};class Cv{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Yi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Yi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new E,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new E),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Yi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new E,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new E),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const f of e.hand.values()){const g=t.getJointPose(f,n),y=this._getHandJoint(l,f);g!==null&&(y.matrix.fromArray(g.transform.matrix),y.matrix.decompose(y.position,y.rotation,y.scale),y.matrixWorldNeedsUpdate=!0,y.jointRadius=g.radius),y.visible=g!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,m=.005;l.inputState.pinching&&d>p+m?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=p-m&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Bf)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Yi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Av extends de{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vt,this.environmentIntensity=1,this.environmentRotation=new vt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Eh{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=lo,this.updateRanges=[],this.version=0,this.uuid=nt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=nt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=nt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Fe=new E;class Fr{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Fe.fromBufferAttribute(this,t),Fe.applyMatrix4(e),this.setXYZ(t,Fe.x,Fe.y,Fe.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Fe.fromBufferAttribute(this,t),Fe.applyNormalMatrix(e),this.setXYZ(t,Fe.x,Fe.y,Fe.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Fe.fromBufferAttribute(this,t),Fe.transformDirection(e),this.setXYZ(t,Fe.x,Fe.y,Fe.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=et(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=se(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=se(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=et(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=et(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=et(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=et(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=se(t,this.array),n=se(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=se(t,this.array),n=se(n,this.array),r=se(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=se(t,this.array),n=se(n,this.array),r=se(r,this.array),s=se(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new zt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Fr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Of extends Lt{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new we(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let pn;const Wn=new E,mn=new E,fn=new E,gn=new ce,Xn=new ce,Th=new ee,qi=new E,Yn=new E,Zi=new E,Cl=new ce,Ps=new ce,Al=new ce;class Fv extends de{constructor(e=new Of){if(super(),this.isSprite=!0,this.type="Sprite",pn===void 0){pn=new Xe;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Eh(t,5);pn.setIndex([0,1,2,0,2,3]),pn.setAttribute("position",new Fr(n,3,0,!1)),pn.setAttribute("uv",new Fr(n,2,3,!1))}this.geometry=pn,this.material=e,this.center=new ce(.5,.5),this.count=1}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),mn.setFromMatrixScale(this.matrixWorld),Th.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),fn.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&mn.multiplyScalar(-fn.z);const n=this.material.rotation;let r,s;n!==0&&(s=Math.cos(n),r=Math.sin(n));const o=this.center;Ji(qi.set(-.5,-.5,0),fn,o,mn,r,s),Ji(Yn.set(.5,-.5,0),fn,o,mn,r,s),Ji(Zi.set(.5,.5,0),fn,o,mn,r,s),Cl.set(0,0),Ps.set(1,0),Al.set(1,1);let a=e.ray.intersectTriangle(qi,Yn,Zi,!1,Wn);if(a===null&&(Ji(Yn.set(-.5,.5,0),fn,o,mn,r,s),Ps.set(0,1),a=e.ray.intersectTriangle(qi,Zi,Yn,!1,Wn),a===null))return;const c=e.ray.origin.distanceTo(Wn);c<e.near||c>e.far||t.push({distance:c,point:Wn.clone(),uv:He.getInterpolation(Wn,qi,Yn,Zi,Cl,Ps,Al,new ce),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Ji(i,e,t,n,r,s){gn.subVectors(i,t).addScalar(.5).multiply(n),r!==void 0?(Xn.x=s*gn.x-r*gn.y,Xn.y=r*gn.x+s*gn.y):Xn.copy(gn),i.copy(e),i.x+=Xn.x,i.y+=Xn.y,i.applyMatrix4(Th)}const Fl=new E,Rl=new $e,Pl=new $e,Lf=new E,Il=new ee,Ki=new E,Is=new St,Dl=new ee,Ds=new $i;class Rv extends Xr{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=el,this.bindMatrix=new ee,this.bindMatrixInverse=new ee,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ot),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ki),this.boundingBox.expandByPoint(Ki)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new St),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ki),this.boundingSphere.expandByPoint(Ki)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Is.copy(this.boundingSphere),Is.applyMatrix4(r),e.ray.intersectsSphere(Is)!==!1&&(Dl.copy(r).invert(),Ds.copy(e.ray).applyMatrix4(Dl),!(this.boundingBox!==null&&Ds.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ds)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new $e,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===el?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===qp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,r=this.geometry;Rl.fromBufferAttribute(r.attributes.skinIndex,e),Pl.fromBufferAttribute(r.attributes.skinWeight,e),Fl.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=Pl.getComponent(s);if(o!==0){const a=Rl.getComponent(s);Il.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Lf.copy(Fl).applyMatrix4(Il),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class jf extends de{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Ch extends Pe{constructor(e=null,t=1,n=1,r,s,o,a,c,l=Nt,u=Nt,h,d){super(null,o,a,c,l,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const zl=new ee,Vf=new ee;class Ah{constructor(e=[],t=[]){this.uuid=nt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,r=this.bones.length;n<r;n++)this.boneInverses.push(new ee)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new ee;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:Vf;zl.multiplyMatrices(a,t[s]),zl.toArray(n,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new Ah(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Ch(t,e,e,Ho,Wr);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){const s=e.bones[n];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new jf),this.bones.push(o),this.boneInverses.push(new ee().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let r=0,s=t.length;r<s;r++){const o=t[r];e.bones.push(o.uuid);const a=n[r];e.boneInverses.push(a.toArray())}return e}}class Nl extends zt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const yn=new ee,Bl=new ee,Qi=[],Ol=new Ot,Uf=new ee,qn=new Xr,Zn=new St;class Pv extends Xr{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Nl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Uf)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ot),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,yn),Ol.copy(e.boundingBox).applyMatrix4(yn),this.boundingBox.union(Ol)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new St),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,yn),Zn.copy(e.boundingSphere).applyMatrix4(yn),this.boundingSphere.union(Zn)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,o=e*s+1;for(let a=0;a<n.length;a++)n[a]=r[o+a]}raycast(e,t){const n=this.matrixWorld,r=this.count;if(qn.geometry=this.geometry,qn.material=this.material,qn.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Zn.copy(this.boundingSphere),Zn.applyMatrix4(n),e.ray.intersectsSphere(Zn)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,yn),Bl.multiplyMatrices(n,yn),qn.matrixWorld=Bl,qn.raycast(e,Qi);for(let o=0,a=Qi.length;o<a;o++){const c=Qi[o];c.instanceId=s,c.object=this,t.push(c)}Qi.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Nl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ch(new Float32Array(r*this.count),r,this.count,vh,Wr));const s=this.morphTexture.source.data.data;let o=0;for(let l=0;l<n.length;l++)o+=n[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=r*e;s[c]=a,s.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const zs=new E,Hf=new E,Gf=new Mt;class _n{constructor(e=new E(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=zs.subVectors(n,t).cross(Hf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(zs),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Gf.getNormalMatrix(e),r=this.coplanarPoint(zs).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ht=new St,Wf=new ce(.5,.5),er=new E;class Xf{constructor(e=new _n,t=new _n,n=new _n,r=new _n,s=new _n,o=new _n){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yt,n=!1){const r=this.planes,s=e.elements,o=s[0],a=s[1],c=s[2],l=s[3],u=s[4],h=s[5],d=s[6],p=s[7],m=s[8],f=s[9],g=s[10],y=s[11],b=s[12],M=s[13],v=s[14],w=s[15];if(r[0].setComponents(l-o,p-u,y-m,w-b).normalize(),r[1].setComponents(l+o,p+u,y+m,w+b).normalize(),r[2].setComponents(l+a,p+h,y+f,w+M).normalize(),r[3].setComponents(l-a,p-h,y-f,w-M).normalize(),n)r[4].setComponents(c,d,g,v).normalize(),r[5].setComponents(l-c,p-d,y-g,w-v).normalize();else if(r[4].setComponents(l-c,p-d,y-g,w-v).normalize(),t===yt)r[5].setComponents(l+c,p+d,y+g,w+v).normalize();else if(t===ci)r[5].setComponents(c,d,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ht.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ht.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ht)}intersectsSprite(e){Ht.center.set(0,0,0);const t=Wf.distanceTo(e.center);return Ht.radius=.7071067811865476+t,Ht.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ht)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(er.x=r.normal.x>0?e.max.x:e.min.x,er.y=r.normal.y>0?e.max.y:e.min.y,er.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(er)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Fh extends Lt{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new we(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Rr=new E,Pr=new E,Ll=new ee,Jn=new $i,tr=new St,Ns=new E,jl=new E;class Rh extends de{constructor(e=new Xe,t=new Fh){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)Rr.fromBufferAttribute(t,r-1),Pr.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=Rr.distanceTo(Pr);e.setAttribute("lineDistance",new Ie(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),tr.copy(n.boundingSphere),tr.applyMatrix4(r),tr.radius+=s,e.ray.intersectsSphere(tr)===!1)return;Ll.copy(r).invert(),Jn.copy(e.ray).applyMatrix4(Ll);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const p=Math.max(0,o.start),m=Math.min(u.count,o.start+o.count);for(let f=p,g=m-1;f<g;f+=l){const y=u.getX(f),b=u.getX(f+1),M=nr(this,e,Jn,c,y,b,f);M&&t.push(M)}if(this.isLineLoop){const f=u.getX(m-1),g=u.getX(p),y=nr(this,e,Jn,c,f,g,m-1);y&&t.push(y)}}else{const p=Math.max(0,o.start),m=Math.min(d.count,o.start+o.count);for(let f=p,g=m-1;f<g;f+=l){const y=nr(this,e,Jn,c,f,f+1,f);y&&t.push(y)}if(this.isLineLoop){const f=nr(this,e,Jn,c,m-1,p,m-1);f&&t.push(f)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function nr(i,e,t,n,r,s,o){const a=i.geometry.attributes.position;if(Rr.fromBufferAttribute(a,r),Pr.fromBufferAttribute(a,s),t.distanceSqToSegment(Rr,Pr,Ns,jl)>n)return;Ns.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Ns);if(!(l<e.near||l>e.far))return{distance:l,point:jl.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const Vl=new E,Ul=new E;class Yf extends Rh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)Vl.fromBufferAttribute(t,r),Ul.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Vl.distanceTo(Ul);e.setAttribute("lineDistance",new Ie(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Iv extends Rh{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class qf extends Lt{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new we(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Hl=new ee,co=new $i,ir=new St,rr=new E;class Dv extends de{constructor(e=new Xe,t=new qf){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ir.copy(n.boundingSphere),ir.applyMatrix4(r),ir.radius+=s,e.ray.intersectsSphere(ir)===!1)return;Hl.copy(r).invert(),co.copy(e.ray).applyMatrix4(Hl);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,h=n.attributes.position;if(l!==null){const d=Math.max(0,o.start),p=Math.min(l.count,o.start+o.count);for(let m=d,f=p;m<f;m++){const g=l.getX(m);rr.fromBufferAttribute(h,g),Gl(rr,g,c,r,e,t,this)}}else{const d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let m=d,f=p;m<f;m++)rr.fromBufferAttribute(h,m),Gl(rr,m,c,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Gl(i,e,t,n,r,s,o){const a=co.distanceSqToPoint(i);if(a<t){const c=new E;co.closestPointToPoint(i,c),c.applyMatrix4(n);const l=r.ray.origin.distanceTo(c);if(l<r.near||l>r.far)return;s.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class zv extends Pe{constructor(e,t,n=xh,r,s,o,a=Nt,c=Nt,l,u=il,h=1){if(u!==il&&u!==lm)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:h};super(d,r,s,o,a,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Wo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Nv extends Pe{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Ph extends Xe{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};const l=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],d=[],p=[];let m=0;const f=[],g=n/2;let y=0;b(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new Ie(h,3)),this.setAttribute("normal",new Ie(d,3)),this.setAttribute("uv",new Ie(p,2));function b(){const v=new E,w=new E;let A=0;const _=(t-e)/n;for(let x=0;x<=s;x++){const k=[],S=x/s,T=S*(t-e)+e;for(let P=0;P<=r;P++){const N=P/r,H=N*c+a,F=Math.sin(H),O=Math.cos(H);w.x=T*F,w.y=-S*n+g,w.z=T*O,h.push(w.x,w.y,w.z),v.set(F,_,O).normalize(),d.push(v.x,v.y,v.z),p.push(N,1-S),k.push(m++)}f.push(k)}for(let x=0;x<r;x++)for(let k=0;k<s;k++){const S=f[k][x],T=f[k+1][x],P=f[k+1][x+1],N=f[k][x+1];(e>0||k!==0)&&(u.push(S,T,N),A+=3),(t>0||k!==s-1)&&(u.push(T,P,N),A+=3)}l.addGroup(y,A,0),y+=A}function M(v){const w=m,A=new ce,_=new E;let x=0;const k=v===!0?e:t,S=v===!0?1:-1;for(let P=1;P<=r;P++)h.push(0,g*S,0),d.push(0,S,0),p.push(.5,.5),m++;const T=m;for(let P=0;P<=r;P++){const H=P/r*c+a,F=Math.cos(H),O=Math.sin(H);_.x=k*O,_.y=g*S,_.z=k*F,h.push(_.x,_.y,_.z),d.push(0,S,0),A.x=F*.5+.5,A.y=O*.5*S+.5,p.push(A.x,A.y),m++}for(let P=0;P<r;P++){const N=w+P,H=T+P;v===!0?u.push(H,H+1,N):u.push(H+1,H,N),x+=3}l.addGroup(y,x,v===!0?1:2),y+=x}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ph(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ih extends Xe{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),c=Math.floor(r),l=a+1,u=c+1,h=e/a,d=t/c,p=[],m=[],f=[],g=[];for(let y=0;y<u;y++){const b=y*d-o;for(let M=0;M<l;M++){const v=M*h-s;m.push(v,-b,0),f.push(0,0,1),g.push(M/a),g.push(1-y/c)}}for(let y=0;y<c;y++)for(let b=0;b<a;b++){const M=b+l*y,v=b+l*(y+1),w=b+1+l*(y+1),A=b+1+l*y;p.push(M,v,A),p.push(v,w,A)}this.setIndex(p),this.setAttribute("position",new Ie(m,3)),this.setAttribute("normal",new Ie(f,3)),this.setAttribute("uv",new Ie(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ih(e.width,e.height,e.widthSegments,e.heightSegments)}}class Bv extends Xe{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){const t=[],n=new Set,r=new E,s=new E;if(e.index!==null){const o=e.attributes.position,a=e.index;let c=e.groups;c.length===0&&(c=[{start:0,count:a.count,materialIndex:0}]);for(let l=0,u=c.length;l<u;++l){const h=c[l],d=h.start,p=h.count;for(let m=d,f=d+p;m<f;m+=3)for(let g=0;g<3;g++){const y=a.getX(m+g),b=a.getX(m+(g+1)%3);r.fromBufferAttribute(o,y),s.fromBufferAttribute(o,b),Wl(r,s,n)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}}else{const o=e.attributes.position;for(let a=0,c=o.count/3;a<c;a++)for(let l=0;l<3;l++){const u=3*a+l,h=3*a+(l+1)%3;r.fromBufferAttribute(o,u),s.fromBufferAttribute(o,h),Wl(r,s,n)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new Ie(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function Wl(i,e,t){const n=`${i.x},${i.y},${i.z}-${e.x},${e.y},${e.z}`,r=`${e.x},${e.y},${e.z}-${i.x},${i.y},${i.z}`;return t.has(n)===!0||t.has(r)===!0?!1:(t.add(n),t.add(r),!0)}class Ov extends kh{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Zf extends Lt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new we(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new we(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xm,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Lv extends Zf{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return q(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new we(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new we(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new we(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class jv extends Lt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Vv extends Lt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function sr(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Jf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Kf(i){function e(r,s){return i[r]-i[s]}const t=i.length,n=new Array(t);for(let r=0;r!==t;++r)n[r]=r;return n.sort(e),n}function Xl(i,e,t){const n=i.length,r=new i.constructor(n);for(let s=0,o=0;o!==n;++s){const a=t[s]*e;for(let c=0;c!==e;++c)r[o++]=i[a+c]}return r}function Dh(i,e,t,n){let r=1,s=i[0];for(;s!==void 0&&s[n]===void 0;)s=i[r++];if(s===void 0)return;let o=s[n];if(o!==void 0)if(Array.isArray(o))do o=s[n],o!==void 0&&(e.push(s.time),t.push(...o)),s=i[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[n],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=i[r++];while(s!==void 0);else do o=s[n],o!==void 0&&(e.push(s.time),t.push(o)),s=i[r++];while(s!==void 0)}class qr{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,r=t[n],s=t[n-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break t}o=t.length;break n}if(!(e>=s)){const a=t[1];e<a&&(n=2,s=a);for(let c=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(r=s,s=t[--n-1],e>=s)break t}o=n,n=0;break n}break e}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Qf extends qr{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:rl,endingEnd:rl}}intervalChanged_(e,t,n){const r=this.parameterPositions;let s=e-2,o=e+1,a=r[s],c=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case sl:s=e,a=2*t-n;break;case ol:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case sl:o=e,c=2*n-t;break;case ol:o=1,c=n+r[1]-r[0];break;default:o=e-1,c=t}const l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,p=this._weightNext,m=(n-t)/(r-t),f=m*m,g=f*m,y=-d*g+2*d*f-d*m,b=(1+d)*g+(-1.5-2*d)*f+(-.5+d)*m+1,M=(-1-p)*g+(1.5+p)*f+.5*m,v=p*g-p*f;for(let w=0;w!==a;++w)s[w]=y*o[u+w]+b*o[l+w]+M*o[c+w]+v*o[h+w];return s}}class eg extends qr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(n-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[l+d]*h+o[c+d]*u;return s}}class tg extends qr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}}class rt{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=sr(t,this.TimeBufferType),this.values=sr(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:sr(e.times,Array),values:sr(e.values,Array)};const r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new tg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new eg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Qf(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Cr:t=this.InterpolantFactoryMethodDiscrete;break;case ao:t=this.InterpolantFactoryMethodLinear;break;case us:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Cr;case this.InterpolantFactoryMethodLinear:return ao;case this.InterpolantFactoryMethodSmooth:return us}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){const n=this.times,r=n.length;let s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(r!==void 0&&Jf(r))for(let a=0,c=r.length;a!==c;++a){const l=r[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===us,s=e.length-1;let o=1;for(let a=1;a<s;++a){let c=!1;const l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(r)c=!0;else{const h=a*n,d=h-n,p=h+n;for(let m=0;m!==n;++m){const f=t[h+m];if(f!==t[d+m]||f!==t[p+m]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const h=a*n,d=o*n;for(let p=0;p!==n;++p)t[d+p]=t[h+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}}rt.prototype.ValueTypeName="";rt.prototype.TimeBufferType=Float32Array;rt.prototype.ValueBufferType=Float32Array;rt.prototype.DefaultInterpolation=ao;class Dn extends rt{constructor(e,t,n){super(e,t,n)}}Dn.prototype.ValueTypeName="bool";Dn.prototype.ValueBufferType=Array;Dn.prototype.DefaultInterpolation=Cr;Dn.prototype.InterpolantFactoryMethodLinear=void 0;Dn.prototype.InterpolantFactoryMethodSmooth=void 0;class zh extends rt{constructor(e,t,n,r){super(e,t,n,r)}}zh.prototype.ValueTypeName="color";class Ir extends rt{constructor(e,t,n,r){super(e,t,n,r)}}Ir.prototype.ValueTypeName="number";class ng extends qr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(r-t);let l=e*a;for(let u=l+a;l!==u;l+=4)qt.slerpFlat(s,0,o,l-a,o,l,c);return s}}class Zr extends rt{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ng(this.times,this.values,this.getValueSize(),e)}}Zr.prototype.ValueTypeName="quaternion";Zr.prototype.InterpolantFactoryMethodSmooth=void 0;class zn extends rt{constructor(e,t,n){super(e,t,n)}}zn.prototype.ValueTypeName="string";zn.prototype.ValueBufferType=Array;zn.prototype.DefaultInterpolation=Cr;zn.prototype.InterpolantFactoryMethodLinear=void 0;zn.prototype.InterpolantFactoryMethodSmooth=void 0;class Dr extends rt{constructor(e,t,n,r){super(e,t,n,r)}}Dr.prototype.ValueTypeName="vector";class Uv{constructor(e="",t=-1,n=[],r=Gm){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=nt(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,r=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(rg(n[o]).scale(r));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){const t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,o=n.length;s!==o;++s)t.push(rt.toJSON(n[s]));return r}static CreateFromMorphTargetSequence(e,t,n,r){const s=t.length,o=[];for(let a=0;a<s;a++){let c=[],l=[];c.push((a+s-1)%s,a,(a+1)%s),l.push(0,1,0);const u=Kf(c);c=Xl(c,1,u),l=Xl(l,1,u),!r&&c[0]===0&&(c.push(s),l.push(l[0])),o.push(new Ir(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const r=e;n=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<n.length;r++)if(n[r].name===t)return n[r];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const l=e[a],u=l.name.match(s);if(u&&u.length>1){const h=u[1];let d=r[h];d||(r[h]=d=[]),d.push(l)}}const o=[];for(const a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,n));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(h,d,p,m,f){if(p.length!==0){const g=[],y=[];Dh(p,g,y,m),g.length!==0&&f.push(new h(d,g,y))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let h=0;h<l.length;h++){const d=l[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const p={};let m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let f=0;f<d[m].morphTargets.length;f++)p[d[m].morphTargets[f]]=-1;for(const f in p){const g=[],y=[];for(let b=0;b!==d[m].morphTargets.length;++b){const M=d[m];g.push(M.time),y.push(M.morphTarget===f?1:0)}r.push(new Ir(".morphTargetInfluence["+f+"]",g,y))}c=p.length*o}else{const p=".bones["+t[h].name+"]";n(Dr,p+".position",d,"pos",r),n(Zr,p+".quaternion",d,"rot",r),n(Dr,p+".scale",d,"scl",r)}}return r.length===0?null:new this(s,c,r,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,r=e.length;n!==r;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function ig(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ir;case"vector":case"vector2":case"vector3":case"vector4":return Dr;case"color":return zh;case"quaternion":return Zr;case"bool":case"boolean":return Dn;case"string":return zn}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function rg(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=ig(i.type);if(i.times===void 0){const t=[],n=[];Dh(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const _t={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class sg{constructor(e,t,n){const r=this;let s=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){const h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){const p=l[h],m=l[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const og=new sg;class ki{constructor(e){this.manager=e!==void 0?e:og,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}ki.DEFAULT_MATERIAL_NAME="__DEFAULT";const pt={};class ag extends Error{constructor(e,t){super(e),this.response=t}}class Hv extends ki{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=_t.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(pt[e]!==void 0){pt[e].push({onLoad:t,onProgress:n,onError:r});return}pt[e]=[],pt[e].push({onLoad:t,onProgress:n,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const u=pt[e],h=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),p=d?parseInt(d):0,m=p!==0;let f=0;const g=new ReadableStream({start(y){b();function b(){h.read().then(({done:M,value:v})=>{if(M)y.close();else{f+=v.byteLength;const w=new ProgressEvent("progress",{lengthComputable:m,loaded:f,total:p});for(let A=0,_=u.length;A<_;A++){const x=u[A];x.onProgress&&x.onProgress(w)}y.enqueue(v),b()}},M=>{y.error(M)})}}});return new Response(g)}else throw new ag(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a==="")return l.text();{const h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,p=new TextDecoder(d);return l.arrayBuffer().then(m=>p.decode(m))}}}).then(l=>{_t.add(`file:${e}`,l);const u=pt[e];delete pt[e];for(let h=0,d=u.length;h<d;h++){const p=u[h];p.onLoad&&p.onLoad(l)}}).catch(l=>{const u=pt[e];if(u===void 0)throw this.manager.itemError(e),l;delete pt[e];for(let h=0,d=u.length;h<d;h++){const p=u[h];p.onError&&p.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const bn=new WeakMap;class lg extends ki{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=_t.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let h=bn.get(o);h===void 0&&(h=[],bn.set(o,h)),h.push({onLoad:t,onError:r})}return o}const a=Ar("img");function c(){u(),t&&t(this);const h=bn.get(this)||[];for(let d=0;d<h.length;d++){const p=h[d];p.onLoad&&p.onLoad(this)}bn.delete(this),s.manager.itemEnd(e)}function l(h){u(),r&&r(h),_t.remove(`image:${e}`);const d=bn.get(this)||[];for(let p=0;p<d.length;p++){const m=d[p];m.onError&&m.onError(h)}bn.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),_t.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class Gv extends ki{constructor(e){super(e)}load(e,t,n,r){const s=new Pe,o=new lg(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},n,r),s}}class Jr extends de{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new we(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Bs=new ee,Yl=new E,ql=new E;class qo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=Uo,this.map=null,this.mapPass=null,this.matrix=new ee,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Xf,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new $e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Yl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Yl),ql.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ql),t.updateMatrixWorld(),Bs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Bs,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Bs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class cg extends qo{constructor(){super(new ft(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=hi*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(n!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Wv extends Jr{constructor(e,t,n=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(de.DEFAULT_UP),this.updateMatrix(),this.target=new de,this.distance=n,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new cg}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Zl=new ee,Kn=new E,Os=new E;class hg extends qo{constructor(){super(new ft(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ce(4,2),this._viewportCount=6,this._viewports=[new $e(2,1,1,1),new $e(0,1,1,1),new $e(3,1,1,1),new $e(1,1,1,1),new $e(3,0,1,1),new $e(1,0,1,1)],this._cubeDirections=[new E(1,0,0),new E(-1,0,0),new E(0,0,1),new E(0,0,-1),new E(0,1,0),new E(0,-1,0)],this._cubeUps=[new E(0,1,0),new E(0,1,0),new E(0,1,0),new E(0,1,0),new E(0,0,1),new E(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Kn.setFromMatrixPosition(e.matrixWorld),n.position.copy(Kn),Os.copy(n.position),Os.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Os),n.updateMatrixWorld(),r.makeTranslation(-Kn.x,-Kn.y,-Kn.z),Zl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zl,n.coordinateSystem,n.reversedDepth)}}class Xv extends Jr{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new hg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class ug extends Yo{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,c=r-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class dg extends qo{constructor(){super(new ug(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Yv extends Jr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(de.DEFAULT_UP),this.updateMatrix(),this.target=new de,this.shadow=new dg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class qv extends Jr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Zv{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class Jv extends Xe{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}const Ls=new WeakMap;class Kv extends ki{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=_t.get(`image-bitmap:${e}`);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(l=>{if(Ls.has(o)===!0)r&&r(Ls.get(o)),s.manager.itemError(e),s.manager.itemEnd(e);else return t&&t(l),s.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){return _t.add(`image-bitmap:${e}`,l),t&&t(l),s.manager.itemEnd(e),l}).catch(function(l){r&&r(l),Ls.set(c,l),_t.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});_t.add(`image-bitmap:${e}`,c),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Qv extends ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class e1{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}const Zo="\\[\\]\\.:\\/",pg=new RegExp("["+Zo+"]","g"),Jo="[^"+Zo+"]",mg="[^"+Zo.replace("\\.","")+"]",fg=/((?:WC+[\/:])*)/.source.replace("WC",Jo),gg=/(WCOD+)?/.source.replace("WCOD",mg),yg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Jo),_g=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Jo),bg=new RegExp("^"+fg+gg+yg+_g+"$"),xg=["material","materials","bones","map"];class vg{constructor(e,t,n){const r=n||ae.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class ae{constructor(e,t,n){this.path=t,this.parsedPath=n||ae.parseTrackName(t),this.node=ae.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new ae.Composite(e,t,n):new ae(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(pg,"")}static parseTrackName(e){const t=bg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=n.nodeName.substring(r+1);xg.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const c=n(a.children);if(c)return c}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,r=t.propertyName;let s=t.propertyIndex;if(e||(e=ae.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const o=e[r];if(o===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ae.Composite=vg;ae.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ae.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ae.prototype.GetterByBindingType=[ae.prototype._getValue_direct,ae.prototype._getValue_array,ae.prototype._getValue_arrayElement,ae.prototype._getValue_toArray];ae.prototype.SetterByBindingTypeAndVersioning=[[ae.prototype._setValue_direct,ae.prototype._setValue_direct_setNeedsUpdate,ae.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_array,ae.prototype._setValue_array_setNeedsUpdate,ae.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_arrayElement,ae.prototype._setValue_arrayElement_setNeedsUpdate,ae.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ae.prototype._setValue_fromArray,ae.prototype._setValue_fromArray_setNeedsUpdate,ae.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class t1 extends Eh{constructor(e,t,n=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){const t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){const t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}}const Jl=new ee;class n1{constructor(e,t,n=0,r=1/0){this.ray=new $i(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Sh,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Jl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Jl),this}intersectObject(e,t=!0,n=[]){return ho(e,this,n,t),n.sort(Kl),n}intersectObjects(e,t=!0,n=[]){for(let r=0,s=e.length;r<s;r++)ho(e[r],this,n,t);return n.sort(Kl),n}}function Kl(i,e){return i.distance-e.distance}function ho(i,e,t,n){let r=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(r=!1),r===!0&&n===!0){const s=i.children;for(let o=0,a=s.length;o<a;o++)ho(s[o],e,t,!0)}}class Nh{constructor(e,t,n,r){Nh.prototype.isMatrix2=!0,this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){const s=this.elements;return s[0]=e,s[2]=t,s[1]=n,s[3]=r,this}}const Ql=new E,or=new E,xn=new E,vn=new E,js=new E,wg=new E,Mg=new E;class i1{constructor(e=new E,t=new E){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){Ql.subVectors(e,this.start),or.subVectors(this.end,this.start);const n=or.dot(or);let s=or.dot(Ql)/n;return t&&(s=q(s,0,1)),s}closestPointToPoint(e,t,n){const r=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=wg,n=Mg){const r=10000000000000001e-32;let s,o;const a=this.start,c=e.start,l=this.end,u=e.end;xn.subVectors(l,a),vn.subVectors(u,c),js.subVectors(a,c);const h=xn.dot(xn),d=vn.dot(vn),p=vn.dot(js);if(h<=r&&d<=r)return t.copy(a),n.copy(c),t.sub(n),t.dot(t);if(h<=r)s=0,o=p/d,o=q(o,0,1);else{const m=xn.dot(js);if(d<=r)o=0,s=q(-m/h,0,1);else{const f=xn.dot(vn),g=h*d-f*f;g!==0?s=q((f*p-m*d)/g,0,1):s=0,o=(f*s+p)/d,o<0?(o=0,s=q(-m/h,0,1)):o>1&&(o=1,s=q((f-m)/h,0,1))}}return t.copy(a).add(xn.multiplyScalar(s)),n.copy(c).add(vn.multiplyScalar(o)),t.sub(n),t.dot(t)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}const ar=new E,he=new Yo;class r1 extends Yf{constructor(e){const t=new Xe,n=new Fh({color:16777215,vertexColors:!0,toneMapped:!1}),r=[],s=[],o={};a("n1","n2"),a("n2","n4"),a("n4","n3"),a("n3","n1"),a("f1","f2"),a("f2","f4"),a("f4","f3"),a("f3","f1"),a("n1","f1"),a("n2","f2"),a("n3","f3"),a("n4","f4"),a("p","n1"),a("p","n2"),a("p","n3"),a("p","n4"),a("u1","u2"),a("u2","u3"),a("u3","u1"),a("c","t"),a("p","c"),a("cn1","cn2"),a("cn3","cn4"),a("cf1","cf2"),a("cf3","cf4");function a(m,f){c(m),c(f)}function c(m){r.push(0,0,0),s.push(0,0,0),o[m]===void 0&&(o[m]=[]),o[m].push(r.length/3-1)}t.setAttribute("position",new Ie(r,3)),t.setAttribute("color",new Ie(s,3)),super(t,n),this.type="CameraHelper",this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=o,this.update();const l=new we(16755200),u=new we(16711680),h=new we(43775),d=new we(16777215),p=new we(3355443);this.setColors(l,u,h,d,p)}setColors(e,t,n,r,s){const a=this.geometry.getAttribute("color");return a.setXYZ(0,e.r,e.g,e.b),a.setXYZ(1,e.r,e.g,e.b),a.setXYZ(2,e.r,e.g,e.b),a.setXYZ(3,e.r,e.g,e.b),a.setXYZ(4,e.r,e.g,e.b),a.setXYZ(5,e.r,e.g,e.b),a.setXYZ(6,e.r,e.g,e.b),a.setXYZ(7,e.r,e.g,e.b),a.setXYZ(8,e.r,e.g,e.b),a.setXYZ(9,e.r,e.g,e.b),a.setXYZ(10,e.r,e.g,e.b),a.setXYZ(11,e.r,e.g,e.b),a.setXYZ(12,e.r,e.g,e.b),a.setXYZ(13,e.r,e.g,e.b),a.setXYZ(14,e.r,e.g,e.b),a.setXYZ(15,e.r,e.g,e.b),a.setXYZ(16,e.r,e.g,e.b),a.setXYZ(17,e.r,e.g,e.b),a.setXYZ(18,e.r,e.g,e.b),a.setXYZ(19,e.r,e.g,e.b),a.setXYZ(20,e.r,e.g,e.b),a.setXYZ(21,e.r,e.g,e.b),a.setXYZ(22,e.r,e.g,e.b),a.setXYZ(23,e.r,e.g,e.b),a.setXYZ(24,t.r,t.g,t.b),a.setXYZ(25,t.r,t.g,t.b),a.setXYZ(26,t.r,t.g,t.b),a.setXYZ(27,t.r,t.g,t.b),a.setXYZ(28,t.r,t.g,t.b),a.setXYZ(29,t.r,t.g,t.b),a.setXYZ(30,t.r,t.g,t.b),a.setXYZ(31,t.r,t.g,t.b),a.setXYZ(32,n.r,n.g,n.b),a.setXYZ(33,n.r,n.g,n.b),a.setXYZ(34,n.r,n.g,n.b),a.setXYZ(35,n.r,n.g,n.b),a.setXYZ(36,n.r,n.g,n.b),a.setXYZ(37,n.r,n.g,n.b),a.setXYZ(38,r.r,r.g,r.b),a.setXYZ(39,r.r,r.g,r.b),a.setXYZ(40,s.r,s.g,s.b),a.setXYZ(41,s.r,s.g,s.b),a.setXYZ(42,s.r,s.g,s.b),a.setXYZ(43,s.r,s.g,s.b),a.setXYZ(44,s.r,s.g,s.b),a.setXYZ(45,s.r,s.g,s.b),a.setXYZ(46,s.r,s.g,s.b),a.setXYZ(47,s.r,s.g,s.b),a.setXYZ(48,s.r,s.g,s.b),a.setXYZ(49,s.r,s.g,s.b),a.needsUpdate=!0,this}update(){const e=this.geometry,t=this.pointMap,n=1,r=1;let s,o;if(he.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)s=1,o=0;else if(this.camera.coordinateSystem===yt)s=-1,o=1;else if(this.camera.coordinateSystem===ci)s=0,o=1;else throw new Error("THREE.CameraHelper.update(): Invalid coordinate system: "+this.camera.coordinateSystem);pe("c",t,e,he,0,0,s),pe("t",t,e,he,0,0,o),pe("n1",t,e,he,-n,-r,s),pe("n2",t,e,he,n,-r,s),pe("n3",t,e,he,-n,r,s),pe("n4",t,e,he,n,r,s),pe("f1",t,e,he,-n,-r,o),pe("f2",t,e,he,n,-r,o),pe("f3",t,e,he,-n,r,o),pe("f4",t,e,he,n,r,o),pe("u1",t,e,he,n*.7,r*1.1,s),pe("u2",t,e,he,-n*.7,r*1.1,s),pe("u3",t,e,he,0,r*2,s),pe("cf1",t,e,he,-n,0,o),pe("cf2",t,e,he,n,0,o),pe("cf3",t,e,he,0,-r,o),pe("cf4",t,e,he,0,r,o),pe("cn1",t,e,he,-n,0,s),pe("cn2",t,e,he,n,0,s),pe("cn3",t,e,he,0,-r,s),pe("cn4",t,e,he,0,r,s),e.getAttribute("position").needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}}function pe(i,e,t,n,r,s,o){ar.set(r,s,o).unproject(n);const a=e[i];if(a!==void 0){const c=t.getAttribute("position");for(let l=0,u=a.length;l<u;l++)c.setXYZ(a[l],ar.x,ar.y,ar.z)}}function s1(i,e,t,n){const r=Sg(n);switch(t){case om:return i*e;case vh:return i*e/r.components*r.byteLength;case cm:return i*e/r.components*r.byteLength;case hm:return i*e*2/r.components*r.byteLength;case um:return i*e*2/r.components*r.byteLength;case am:return i*e*3/r.components*r.byteLength;case Ho:return i*e*4/r.components*r.byteLength;case dm:return i*e*4/r.components*r.byteLength;case pm:case mm:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case fm:case gm:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case _m:case xm:return Math.max(i,16)*Math.max(e,8)/4;case ym:case bm:return Math.max(i,8)*Math.max(e,8)/2;case vm:case wm:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Mm:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sm:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case $m:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case km:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Em:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Tm:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Cm:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Am:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Fm:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Rm:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Pm:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Im:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Dm:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case zm:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Nm:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Bm:case Om:case Lm:return Math.ceil(i/4)*Math.ceil(e/4)*16;case jm:case Vm:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Um:case Hm:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Sg(i){switch(i){case Uo:case Jp:return{byteLength:1,components:1};case Qp:case Kp:case tm:return{byteLength:2,components:1};case nm:case im:return{byteLength:2,components:4};case xh:case em:case Wr:return{byteLength:4,components:1};case rm:case sm:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gh);const it=Object.freeze({width:1754,height:1240}),tt=Object.freeze({width:1536,height:864}),Ko=2,zr=20,o1="ssproj",Bh=16e3,ec=100,$g=Math.floor(Bh/it.width*100),kg=Math.floor(Bh/it.height*100),a1=1,Oh=20,Lh=200,l1=.96,c1=.55,h1=960,u1=16,d1=10,p1=360,m1=52,uo=.1,po=1e3,f1=2.5,g1=.006,y1=.0015,lr=1,Eg="1u = 1m",_1=new Set(["ply","spz","splat","ksplat","zip","sog","rad"]),b1=new Set(["glb","gltf"]),at={"top-left":{x:0,y:0},"top-center":{x:.5,y:0},"top-right":{x:1,y:0},"middle-left":{x:0,y:.5},center:{x:.5,y:.5},"middle-right":{x:1,y:.5},"bottom-left":{x:0,y:1},"bottom-center":{x:.5,y:1},"bottom-right":{x:1,y:1}},Nr=Math.PI/180,jh=36,tc=14,Tg=200,nc=Object.freeze([14,18,21,24,28,35,50,70,75,85,100,135,200]);function Vh(){return it.width/tt.width}function mo(i){const e=Number(i)*Nr*.5;return Math.atan(Math.tan(e)/Vh())*2/Nr}function ic(i){const e=mo(i)*Nr*.5;return jh/Math.max(2*Math.tan(e),1e-6)}function Qo(i){const e=Number(i);return Number.isFinite(e)?Math.min(Tg,Math.max(tc,e)):tc}function Cg(i,e=1.5){const t=Qo(i),n=nc.reduce((r,s)=>Math.abs(s-t)<Math.abs(r-t)?s:r,nc[0]);return Math.abs(n-t)<=e?n:t}function ea(i){const e=Qo(i),t=jh/Math.max(2*e,1e-6);return Math.atan(t*Vh())*2/Nr}const Ag=24,Uh=ea(35),Fg=ea(Ag),Hh="bounds",ui="trajectory",Gh="line",di="spline",Gt="auto",Br="corner",Or="mirrored",pi="free",Zt="none",Ge="center",ta="top-left",na="top-right",ia="bottom-right",ra="bottom-left",Wh=new Set([ta,na,ia,ra]),Rg=.35;function Pg(i,e,t){const n=Math.cos(t),r=Math.sin(t);return{x:i*n-e*r,y:i*r+e*n}}function rc(i,e=.5){const t=Number(i);return Number.isFinite(t)?t:e}function fo(i){let e=Number(i)||0;for(;e<=-180;)e+=360;for(;e>180;)e-=360;return e}function gr(i){const e=Number(i==null?void 0:i.scale);return Number.isFinite(e)&&e>0?e:1}function go(i){return fo((i==null?void 0:i.rotation)??0)}function We(i){return{x:rc(i==null?void 0:i.x,.5),y:rc(i==null?void 0:i.y,.5)}}function ri(i){return i?{x:i.x,y:i.y}:null}function yo(i){if(!i||typeof i!="object")return null;const e=Number(i.x),t=Number(i.y);return!Number.isFinite(e)||!Number.isFinite(t)?null:{x:e,y:t}}function sc(i){return yo(i)}function sa(i){return i===ui?ui:Hh}function oa(i){return i===di?di:Gh}function aa(i){return i===Br?Br:i===Or?Or:i===pi?pi:Gt}function Nn(i){return i===Ge||Wh.has(i)?i:Zt}function Ig(i){const e=ri((i==null?void 0:i.in)??null),t=ri((i==null?void 0:i.out)??null),n=aa(i==null?void 0:i.mode);return n===Gt&&!e&&!t?null:{...n!==Gt?{mode:n}:{},...e?{in:e}:{},...t?{out:t}:{}}}function Dg(i={}){const e={};for(const[t,n]of Object.entries(i??{})){if(typeof t!="string"||!t)continue;const r=Ig(n);r&&(e[t]=r)}return e}function $n(i,e,t){const n=We(i);return{x:n.x*e,y:n.y*t}}function Xh(i,e,t){return{x:i.x/Math.max(e,1e-6),y:i.y/Math.max(t,1e-6)}}function zg(i,e){return{x:i.x+e.x,y:i.y+e.y}}function Mn(i,e){return{x:i.x-e.x,y:i.y-e.y}}function Qe(i,e){return{x:i.x*e,y:i.y*e}}function _o(i){return Math.hypot(i.x,i.y)}function Vs(i){const e=_o(i);return e<=1e-6?null:{x:i.x/e,y:i.y/e}}function Ng(i,e){return i.x*e.x+i.y*e.y}function la(i){if(!i||typeof i!="object")return null;const e=aa(i.mode),t=sc(i.in),n=sc(i.out),r=e===Gt&&(t||n)?pi:e;if(r===Gt&&!t&&!n)return null;if(r===Or){if(t&&!n)return{mode:r,in:t,out:Qe(t,-1)};if(!t&&n)return{mode:r,in:Qe(n,-1),out:n}}return r===Br||r===Gt||t||n?{...r!==Gt?{mode:r}:{},...t?{in:t}:{},...n?{out:n}:{}}:null}function Bg(i=[],e={}){const t=new Set((i??[]).map(s=>s==null?void 0:s.id).filter(s=>typeof s=="string"&&s.length>0)),n=new Map((i??[]).map(s=>[s.id,We(s)])),r={};for(const[s,o]of Object.entries(e??{})){if(!t.has(s))continue;const a=n.get(s);if(!a)continue;const c=yo(o==null?void 0:o.in),l=yo(o==null?void 0:o.out),u=la({mode:pi,in:c?{x:c.x-a.x,y:c.y-a.y}:null,out:l?{x:l.x-a.x,y:l.y-a.y}:null});u&&(r[s]=u)}return r}function Og(i=[],e={}){const t=new Set((i??[]).map(s=>s==null?void 0:s.id).filter(s=>typeof s=="string"&&s.length>0)),n={},r=e!=null&&e.nodesByFrameId&&typeof e.nodesByFrameId=="object"?e.nodesByFrameId:Bg(i,e==null?void 0:e.handlesByFrameId);for(const[s,o]of Object.entries(r??{})){if(!t.has(s))continue;const a=la(o);a&&(n[s]=a)}return n}function Yh(i,e){var t,n;return la((n=(t=i==null?void 0:i.trajectory)==null?void 0:t.nodesByFrameId)==null?void 0:n[e])}function ca(i,e){var t;return aa((t=Yh(i,e))==null?void 0:t.mode)}function Lg(i,e,t,n){const r=$n(i[e],t,n);if(i.length<=1)return{in:{x:0,y:0},out:{x:0,y:0}};const s=e>0?$n(i[e-1],t,n):null,o=e<i.length-1?$n(i[e+1],t,n):null;if(e<=0){const b=o?Mn(o,r):{x:0,y:0};return{in:{x:0,y:0},out:Qe(b,1/3)}}if(e>=i.length-1){const b=s?Mn(r,s):{x:0,y:0};return{in:Qe(b,-1/3),out:{x:0,y:0}}}const a=s?Mn(r,s):{x:0,y:0},c=o?Mn(o,r):{x:0,y:0},l=_o(a),u=_o(c),h=Vs(a),d=Vs(c);if(!h||!d)return{in:h?Qe(a,-1/3):{x:0,y:0},out:d?Qe(c,1/3):{x:0,y:0}};const m=Vs({x:h.x*Math.sqrt(Math.max(l,1e-6))+d.x*Math.sqrt(Math.max(u,1e-6)),y:h.y*Math.sqrt(Math.max(l,1e-6))+d.y*Math.sqrt(Math.max(u,1e-6))})??d,f=Math.max(0,Math.min(1,(1+Ng(h,d))*.5)),g=l/3*f,y=u/3*f;return{in:Qe(m,-g),out:Qe(m,y)}}function jg(i,e,t,n){const r=$n(i[e],t,n),s=e>0?$n(i[e-1],t,n):null,o=e<i.length-1?$n(i[e+1],t,n):null,a=s?Mn(r,s):{x:0,y:0},c=o?Mn(o,r):{x:0,y:0};return{in:Qe(a,-1/3),out:Qe(c,1/3)}}function qh(i,e,t,n,r){const s=Lg(i,e,n,r),o=t==="in"?s.in:s.out;return Xh(o,n,r)}function Vg(i,e,t,n,r=1,s=1){const o=(i??[]).findIndex(l=>(l==null?void 0:l.id)===t);if(o<0)return null;const a=ca(e,t);if(a===Br){const l=jg(i,o,r,s),u=n==="in"?l.in:l.out;return Xh(u,r,s)}const c=Yh(e,t);if(a===pi)return ri((c==null?void 0:c[n])??{x:0,y:0});if(a===Or){const l=ri((c==null?void 0:c[n])??null);if(l)return l;const u=n==="in"?"out":"in",h=ri((c==null?void 0:c[u])??null);return h?Qe(h,-1):{x:0,y:0}}return qh(i,o,n,r,s)}function Ug(i,e,t,n,r){const s=We(i[e]),o=qh(i,e,t,n,r);return{x:s.x+o.x,y:s.y+o.y}}function An(i,e,t,n,r=1,s=1){const o=(i??[]).findIndex(l=>(l==null?void 0:l.id)===t);if(o<0)return null;const a=We(i[o]),c=Vg(i,e,t,n,r,s);return c?zg(a,c):Ug(i,o,n,r,s)}function Hg(i,e,t,n,r){const s=i[t],o=i[t+1];return!s||!o?null:{p0:We(s),p1:An(i,e,s.id,"out",n,r),p2:An(i,e,o.id,"in",n,r),p3:We(o)}}function Gg(i,e,t,n,r){const s=1-r,o=s*s*s,a=3*s*s*r,c=3*s*r*r,l=r*r*r;return{x:i.x*o+e.x*a+t.x*c+n.x*l,y:i.y*o+e.y*a+t.y*c+n.y*l}}function Wg(i,e,t){let n=fo(e-i);return n>180&&(n-=360),n<-180&&(n+=360),fo(i+n*t)}function Xg(i,e,t,n,r=1,s=1){const o=i[t],a=i[t+1];if(!o||!a)return null;if(oa(e==null?void 0:e.trajectoryMode)===di){const u=Hg(i,e,t,r,s);if(u)return Gg(u.p0,u.p1,u.p2,u.p3,n)}const c=We(o),l=We(a);return{x:c.x+(l.x-c.x)*n,y:c.y+(l.y-c.y)*n}}function si(i,e,t){const n=gr(i),r=go(i),s=r*Math.PI/180,o=tt.width*n,a=tt.height*n,c=We(i),l={x:c.x*e,y:c.y*t},u=o*.5,h=a*.5,d=[{x:-u,y:-h},{x:u,y:-h},{x:u,y:h},{x:-u,y:h}].map(p=>{const m=Pg(p.x,p.y,s);return{x:l.x+m.x,y:l.y+m.y}});return{frame:i,centerPoint:l,centerNormalized:c,scale:n,rotationDeg:r,rotationRadians:s,width:o,height:a,corners:d,cornerPointsByKey:{[ta]:d[0],[na]:d[1],[ia]:d[2],[ra]:d[3]}}}function bo(i,e,t,n,r,s){const o=i[t],a=i[t+1];if(!o||!a)return null;if(n<=0)return si(o,r,s);if(n>=1)return si(a,r,s);const c=Xg(i,e,t,n,r,s);return c?si({x:c.x,y:c.y,scale:gr(o)+(gr(a)-gr(o))*n,rotation:Wg(go(o),go(a),n)},r,s):null}function Yg(i,e,t){if(!i||!e||!t)return 0;const n=[[i.centerPoint,e.centerPoint,t.centerPoint],...i.corners.map((s,o)=>[s,e.corners[o],t.corners[o]])];let r=0;for(const[s,o,a]of n){if(!s||!o||!a||!Number.isFinite(s.x)||!Number.isFinite(s.y)||!Number.isFinite(o.x)||!Number.isFinite(o.y)||!Number.isFinite(a.x)||!Number.isFinite(a.y))continue;const c={x:(s.x+a.x)*.5,y:(s.y+a.y)*.5};r=Math.max(r,Math.hypot(o.x-c.x,o.y-c.y))}return r}function xo(i,e,t,n,r,s,o,a,c,l,u,h,d){if(!o||!a)return;const p=(r+s)*.5,m=bo(e,t,n,p,c,l),f=Yg(o,m,a);if(!m||h>=d||f<=u||s-r<=1/4096){i.push(a);return}xo(i,e,t,n,r,p,o,m,c,l,u,h+1,d),xo(i,e,t,n,p,s,m,a,c,l,u,h+1,d)}function ha(i,e,t,n,{maxSegmentErrorPx:r=Rg,maxSubdivisionDepth:s=8}={}){if(!Array.isArray(i)||i.length===0)return[];if(i.length===1)return[si(i[0],t,n)];const o=[];for(let a=0;a<i.length-1;a+=1){const c=bo(i,e,a,0,t,n),l=bo(i,e,a,1,t,n);!c||!l||(a===0&&o.push(c),xo(o,i,e,a,0,1,c,l,t,n,r,0,s))}return o}function Zh(i,e){return i?e===Ge?i.centerPoint:Wh.has(e)?i.cornerPointsByKey[e]??null:null:null}function Jh(i,e,t,n,{source:r=Ge,baseSamplesPerSegment:s=16}={}){const o=Nn(r);return o===Zt?[]:ha(i,e,t,n,{maxSegmentErrorPx:Math.max(.25,1/Math.max(s,1))}).map(a=>Zh(a,o)).filter(a=>Number.isFinite(a==null?void 0:a.x)&&Number.isFinite(a==null?void 0:a.y))}function qg(i,e,t,n,r){const s=i[t];if(!s)return null;const o=oa(e==null?void 0:e.trajectoryMode)===di,a=We(s),c={x:a.x*n,y:a.y*r};let l=null;if(t<i.length-1)if(o){const p=An(i,e,s.id,"out",n,r);p&&(l={x:p.x*n-c.x,y:p.y*r-c.y})}else{const p=We(i[t+1]);l={x:p.x*n-c.x,y:p.y*r-c.y}}let u=null;if(t>0)if(o){const p=An(i,e,s.id,"in",n,r);p&&(u={x:c.x-p.x*n,y:c.y-p.y*r})}else{const p=We(i[t-1]);u={x:c.x-p.x*n,y:c.y-p.y*r}}let h=null;if(l&&u?h={x:l.x+u.x,y:l.y+u.y}:l?h=l:u&&(h=u),!h)return null;const d=Math.hypot(h.x,h.y);return!(d>0)||!Number.isFinite(d)?null:{x:h.x/d,y:h.y/d}}function oc(i,e,t){return(e.x-i.x)*(t.y-i.y)-(e.y-i.y)*(t.x-i.x)}function Zg(i){const e=i.filter(s=>Number.isFinite(s==null?void 0:s.x)&&Number.isFinite(s==null?void 0:s.y));if(e.length<3)return e.slice();const t=e.slice().sort((s,o)=>s.x!==o.x?s.x-o.x:s.y-o.y),n=[];for(const s of t){for(;n.length>=2&&oc(n[n.length-2],n[n.length-1],s)<=0;)n.pop();n.push(s)}const r=[];for(let s=t.length-1;s>=0;s-=1){const o=t[s];for(;r.length>=2&&oc(r[r.length-2],r[r.length-1],o)<=0;)r.pop();r.push(o)}return n.pop(),r.pop(),n.concat(r)}function Jg(i,e,t){if(!Array.isArray(e)||e.length<2)return!1;for(let n=0;n<e.length;n+=1){const r=e[n],s=e[(n+1)%e.length],o=s.x-r.x,a=s.y-r.y,c=i.x-r.x,l=i.y-r.y,u=o*o+a*a;if(u<=0){const p=i.x-r.x,m=i.y-r.y;if(p*p+m*m<=t*t)return!0;continue}const h=o*l-a*c;if(h*h>t*t*u)continue;const d=o*c+a*l;if(!(d<-t*Math.sqrt(u))&&!(d>u+t*Math.sqrt(u)))return!0}return!1}const Kg=[ta,na,ia,ra];function x1(i,e){if(!Array.isArray(i)||i.length<2)return Ge;const t=ha(i,e,1,1);if(t.length===0)return Ge;const n=t.flatMap(o=>o.corners),r=Zg(n);if(r.length<3)return Ge;const s=1e-5;for(const o of Kg){const a=t.map(l=>l.cornerPointsByKey[o]).filter(l=>Number.isFinite(l==null?void 0:l.x)&&Number.isFinite(l==null?void 0:l.y));if(a.length===0)continue;if(a.every(l=>Jg(l,r,s)))return o}return Ge}function Qg(i,e,t,n,{source:r=Ge}={}){const s=Nn(r);if(!Array.isArray(i)||i.length<2||s===Zt)return[];const o=[];for(let a=0;a<i.length;a+=1){const c=i[a],l=si(c,t,n),u=Zh(l,s);if(!u||!Number.isFinite(u.x)||!Number.isFinite(u.y))continue;const h=qg(i,e,a,t,n);h&&o.push({frameId:c.id,point:u,tangent:h})}return o}const Kh=1,v1="reference-image",Fn="back",mi="front",fi="reference-preset-blank",oi="(blank)",w1=16e3,M1=4096;function ey(){return Math.random().toString(36).slice(2,10)}function ua(i,e){var t,n;try{const r=(n=(t=globalThis.crypto)==null?void 0:t.randomUUID)==null?void 0:n.call(t);if(typeof r=="string"&&r)return`${i}-${r}`}catch{}return e.count+=1,`${i}-${Date.now().toString(36)}-${e.count.toString(36)}-${ey()}`}const da={item:{count:0},preset:{count:0},asset:{count:0}};function ty(){return ua("reference-image",da.item)}function ny(){return ua("reference-preset",da.preset)}function iy(){return ua("reference-asset",da.asset)}function Ae(i){return typeof i=="number"&&Number.isFinite(i)}function pa(i,e,t){return Math.max(e,Math.min(t,i))}function ry(i,e="reference.png"){return(String(i??"").trim().replace(/\\/g,"/").split("/").pop()??"")||e}function Xt(i,e){const t=Number((i==null?void 0:i.w)??(i==null?void 0:i.width)),n=Number((i==null?void 0:i.h)??(i==null?void 0:i.height));return{w:Ae(t)&&t>0?Math.max(1,Math.round(t)):e.w,h:Ae(n)&&n>0?Math.max(1,Math.round(n)):e.h}}function Qh(i,e=1){return pa(Ae(i)?i:e,0,1)}function Bt(i,e={ax:.5,ay:.5}){const t=Ae((i==null?void 0:i.ax)??(i==null?void 0:i.x))?Number(i.ax??i.x):e.ax,n=Ae((i==null?void 0:i.ay)??(i==null?void 0:i.y))?Number(i.ay??i.y):e.ay;return{ax:t,ay:n}}function eu(i="center"){const e=at[String(i??"center")]??at.center;return{ax:e.x,ay:e.y}}function wt(i,e={x:0,y:0}){return{x:Ae(i==null?void 0:i.x)?i.x:e.x,y:Ae(i==null?void 0:i.y)?i.y:e.y}}function tu(i,e="reference.png"){const t=Xt(i==null?void 0:i.originalSize,{w:1,h:1}),n=Xt(i==null?void 0:i.appliedSize,t);return{filename:ry(i==null?void 0:i.filename,e),mime:typeof(i==null?void 0:i.mime)=="string"&&i.mime.trim()?i.mime.trim():"application/octet-stream",originalSize:t,appliedSize:n,pixelRatio:Ae(i==null?void 0:i.pixelRatio)&&i.pixelRatio>0?i.pixelRatio:n.w/Math.max(1,t.w),usedOriginal:(i==null?void 0:i.usedOriginal)!==!1}}function sy(i=null){var o;const{id:e,label:t="Reference",source:n=null,sourceMeta:r=null}=i??{},s=(r==null?void 0:r.filename)??(n==null?void 0:n.fileName)??((o=n==null?void 0:n.file)==null?void 0:o.name)??"reference.png";return{id:e??iy(),label:String(t??s).trim()||s,source:n,sourceMeta:tu(r,s)}}function nu(i){return{...i,source:(i==null?void 0:i.source)??null,sourceMeta:tu(i==null?void 0:i.sourceMeta,(i==null?void 0:i.label)??"reference.png")}}function oy(i,e=mi){return i===Fn?Fn:e}function ma(i=null){const{id:e,assetId:t="",name:n="Reference",group:r=mi,order:s=0,previewVisible:o=!0,exportEnabled:a=!0,opacity:c=1,scalePct:l=100,rotationDeg:u=0,offsetPx:h={x:0,y:0},anchor:d={ax:.5,ay:.5}}=i??{};return{id:e??ty(),assetId:String(t??"").trim(),name:String(n??"").trim()||"Reference",group:oy(r),order:Ae(s)?Math.max(0,Math.floor(s)):0,previewVisible:o!==!1,exportEnabled:a!==!1,opacity:Qh(c,1),scalePct:Ae(l)&&l>0?pa(l,.1,1e5):100,rotationDeg:Ae(u)?u:0,offsetPx:wt(h),anchor:Bt(d)}}function iu(i){return ma(i)}function ay(i,e){const t=String((i==null?void 0:i.name)??""),n=String((e==null?void 0:e.name)??"");return Number((i==null?void 0:i.order)??0)-Number((e==null?void 0:e.order)??0)||t.localeCompare(n)||String((i==null?void 0:i.id)??"").localeCompare(String((e==null?void 0:e.id)??""))}function ru(i=[],e=null){const t=e===Fn||e===mi?e:null,n=Array.isArray(i)?i:[];return(t?[t]:[Fn,mi]).flatMap(s=>n.filter(o=>o.group===s).sort(ay))}function ly(i=[],e=null){return ru(i,e)}function Us(i=[],e=null){return[...ru(i,e)].reverse()}function S1(i,e=0){const t=Math.max(0,Math.floor(Number(i)||0));return Math.max(0,Math.floor(Number(e)||0))+t}function fa(i){const e=ly(i);let t=0,n=0;for(const r of e){if(r.group===Fn){r.order=t,t+=1;continue}r.order=n,n+=1}i.splice(0,i.length,...e)}function cy(i={}){const e={};return typeof i.name=="string"&&(e.name=i.name.trim()),(i.group===Fn||i.group===mi)&&(e.group=i.group),Ae(i.order)&&(e.order=Math.max(0,Math.floor(i.order))),typeof i.previewVisible=="boolean"&&(e.previewVisible=i.previewVisible),typeof i.exportEnabled=="boolean"&&(e.exportEnabled=i.exportEnabled),Ae(i.opacity)&&(e.opacity=Qh(i.opacity,1)),Ae(i.scalePct)&&i.scalePct>0&&(e.scalePct=pa(i.scalePct,.1,1e5)),Ae(i.rotationDeg)&&(e.rotationDeg=i.rotationDeg),i.offsetPx&&typeof i.offsetPx=="object"&&(e.offsetPx=wt(i.offsetPx)),i.anchor&&typeof i.anchor=="object"&&(e.anchor=Bt(i.anchor)),e}function hy(i={}){return Object.fromEntries(Object.entries(i).filter(([e])=>String(e??"").trim()).map(([e,t])=>[e,cy(t)]))}function Kr(i=null){const{id:e,name:t=oi,baseRenderBox:n=it,items:r=[]}=i??{},s=r.map(o=>ma(o)).filter(o=>o.assetId);return fa(s),{id:e??(t===oi?fi:ny()),name:String(t??"").trim()||oi,baseRenderBox:Xt(n,it),items:s}}function ga(i){return Kr({...i,items:((i==null?void 0:i.items)??[]).map(iu)})}function Qr(i=null){const{activeItemId:e=null,renderBoxCorrection:t={x:0,y:0},items:n={}}=i??{};return{activeItemId:typeof e=="string"&&e?e:null,renderBoxCorrection:wt(t),items:hy(n)}}function uy(i){return Qr(i)}function ya(i=null){const{presetId:e=null,overridesByPresetId:t={}}=i??{},n=Object.fromEntries(Object.entries(t??{}).filter(([r])=>String(r??"").trim()).map(([r,s])=>[r,Qr(s)]));return{presetId:typeof e=="string"&&e?e:null,overridesByPresetId:n}}function dy(i){return ya(i)}function py(){return{version:Kh,activePresetId:fi,assets:[],presets:[Kr()]}}function my(i){const e=i.find(t=>t.id===fi)??null;if(e){e.name=oi;return}i.unshift(Kr({id:fi,name:oi}))}function _a(i={}){const e=(Array.isArray(i==null?void 0:i.assets)?i.assets:[]).map(s=>sy({id:s==null?void 0:s.id,label:s==null?void 0:s.label,source:(s==null?void 0:s.source)??null,sourceMeta:s==null?void 0:s.sourceMeta})).filter(s=>s.sourceMeta),t=new Set(e.map(s=>s.id)),n=(Array.isArray(i==null?void 0:i.presets)?i.presets:[]).map(s=>ga(s)).filter(Boolean);n.length===0&&n.push(Kr()),my(n);for(const s of n)s.items=s.items.filter(o=>t.has(o.assetId)),fa(s.items);const r=typeof(i==null?void 0:i.activePresetId)=="string"&&n.some(s=>s.id===i.activePresetId)?i.activePresetId:n[0].id;return{version:Ae(i==null?void 0:i.version)&&i.version>0?Math.floor(i.version):Kh,activePresetId:r,assets:e,presets:n}}function $1(i){const e=_a(i);return{version:e.version,activePresetId:e.activePresetId,assets:e.assets.map(nu),presets:e.presets.map(ga)}}function k1(i=null,{availablePresetIds:e=[]}={}){const t=ya(i),n=new Set(e),r=Object.fromEntries(Object.entries(t.overridesByPresetId).filter(([s])=>n.size>0?n.has(s):!0));return{presetId:t.presetId&&n.has(t.presetId)?t.presetId:null,overridesByPresetId:r}}function su(i,e=null){const t=_a(i),n=typeof e=="string"&&e?e:t.activePresetId;return t.presets.find(r=>r.id===n)??t.presets[0]??null}function ou(i,e=null){const t=su(i,(e==null?void 0:e.presetId)??fi);return(t==null?void 0:t.id)??null}function fy(i,e=null,t=null){var r;const n=t??ou(i,e);return n?uy(((r=e==null?void 0:e.overridesByPresetId)==null?void 0:r[n])??null):Qr()}function E1(i,e,t,n,r,s){const o=Bt(e),a=Xt(t,it),c=Xt(n,a),l=Bt(r,eu("center")),u=wt(s),h=wt(i),d=(o.ax-l.ax)*(c.w-a.w),p=(o.ay-l.ay)*(c.h-a.h);return{x:h.x+d+u.x,y:h.y+p+u.y}}function T1(i,e,t,n,r,s){const o=Bt(e),a=Xt(t,it),c=Xt(n,a),l=Bt(r,eu("center")),u=wt(s),h=wt(i),d=(o.ax-l.ax)*(c.w-a.w),p=(o.ay-l.ay)*(c.h-a.h);return{x:h.x-d-u.x,y:h.y-p-u.y}}function C1(i,e=null){const t=su(i,ou(i,e));if(!t)return{preset:null,override:Qr(),items:[],assetsById:new Map};const n=_a(i),r=new Map(n.assets.map(a=>[a.id,nu(a)])),s=fy(n,e,t.id),o=t.items.map(a=>{var u;const c=((u=s.items)==null?void 0:u[a.id])??null,l={...iu(a),...c,offsetPx:c!=null&&c.offsetPx?wt(c.offsetPx,a.offsetPx):wt(a.offsetPx),anchor:c!=null&&c.anchor?Bt(c.anchor,a.anchor):Bt(a.anchor)};return ma(l)}).filter(a=>r.has(a.assetId));return fa(o),{preset:ga(t),override:s,items:o,assetsById:r}}const gy="single",au="shot-camera-",lu="frame-",yy="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),cu=64,hu=.5,uu=.5,du=1,pu=80,mu="all",_y=Hh,by=Gh,xy=Zt,ba="camera",A1="viewport",fu="perspective";function vy(){return[{id:"pane-main",role:ba,viewportPreset:fu,projection:"perspective",shotCameraBinding:"active"}]}function gu(i){return`${au}${i}`}function Lr(i){return`${lu}${i}`}function F1(i){return yy[Math.max(i-1,0)]??`${i}`}function wy(i,e="FRAME A"){const t=Array.from(String(i??"")).map(r=>{const s=r.codePointAt(0)??0;return s<32||s===127?" ":r}).join("").replace(/\s+/g," ").trim();return Array.from(t).slice(0,cu).join("")||e}function xa(i,e){const t=Array.isArray(i)?i.map(s=>s==null?void 0:s.id).filter(s=>typeof s=="string"&&s.length>0):[],n=new Set(t),r=[];for(const s of e??[])typeof s!="string"||!n.has(s)||r.includes(s)||r.push(s);return r.length>0?r:t}function va(i,e){return e==="selected"||e==="all"?e:i==="selected"||i==="all"?i:mu}function R1({mode:i,preferredMode:e,hasRememberedSelection:t=!1}){if(i==="selected"||i==="all")return"off";const n=va(i,e);return n==="selected"&&!t?"all":n}function P1(i){let e=0;for(const t of i){const n=new RegExp(`^${au}(\\d+)$`).exec(t.id);n&&(e=Math.max(e,Number(n[1])||0))}return e+1}function I1(i){let e=0;for(const t of i){const n=new RegExp(`^${lu}(\\d+)$`).exec(t.id);n&&(e=Math.max(e,Number(n[1])||0))}return e+1}function yu(i){return{...i,anchor:i.anchor&&typeof i.anchor=="object"?{...i.anchor}:i.anchor}}function My(i){return Number.isFinite(i.x)&&Number.isFinite(i.width)?i.x+i.width*.5:Number.isFinite(i.x)?i.x:hu}function Sy(i){return Number.isFinite(i.y)&&Number.isFinite(i.height)?i.y+i.height*.5:Number.isFinite(i.y)?i.y:uu}function $y(i){if(Number.isFinite(i.scale)&&i.scale>0)return i.scale;const e=Number.isFinite(i.width)?i.width*it.width/tt.width:Number.NaN,t=Number.isFinite(i.height)?i.height*it.height/tt.height:Number.NaN,n=[e,t].filter(r=>Number.isFinite(r)&&r>0);return n.length===0?du:n.reduce((r,s)=>r+s,0)/n.length}function ac(i,e){const t=Number(i);return Number.isFinite(t)?Math.min(1,Math.max(0,t)):e}function ky(i,e,t){if(typeof i=="string"){const n=at[i];if(n)return{...n}}return i&&typeof i=="object"?{x:ac(i.x,e),y:ac(i.y,t)}:{x:e,y:t}}function _u({id:i,name:e,source:t}={}){const n=t?yu(t):{x:hu,y:uu,scale:du,rotation:0,order:0},r=My(n),s=Sy(n);return{...n,x:r,y:s,scale:$y(n),rotation:Number.isFinite(n.rotation)?n.rotation:0,anchor:ky(n.anchor,r,s),order:Number.isFinite(n.order)?n.order:0,id:i??n.id??Lr(1),name:wy(e??n.name,"FRAME A")}}function bu(i=[]){return{mode:"off",preferredMode:mu,opacityPct:pu,selectedIds:xa(i,[]),shape:_y,trajectoryMode:by,trajectoryExportSource:xy,trajectory:{nodesByFrameId:{}}}}function xu(i,e){return{mode:(i==null?void 0:i.mode)==="selected"||(i==null?void 0:i.mode)==="all"?i.mode:"off",preferredMode:va(i==null?void 0:i.mode,i==null?void 0:i.preferredMode),opacityPct:Number.isFinite(i==null?void 0:i.opacityPct)?Math.min(100,Math.max(0,Math.round(i.opacityPct))):pu,selectedIds:xa(e,i==null?void 0:i.selectedIds),shape:sa(i==null?void 0:i.shape),trajectoryMode:oa(i==null?void 0:i.trajectoryMode),trajectoryExportSource:Nn(i==null?void 0:i.trajectoryExportSource),trajectory:{nodesByFrameId:Og(e,i==null?void 0:i.trajectory)}}}function Ey(){return[_u({id:Lr(1),name:"FRAME A"})]}function Ty({id:i,name:e,source:t}={}){var o;const n=t?zy(t):{lens:{baseFovX:Uh},clipping:{mode:"auto",near:uo,far:po},outputFrame:{widthScale:1,heightScale:1,viewZoom:1,viewZoomAuto:!0,viewportCenterAuto:!0,anchor:"center",centerX:.5,centerY:.5,viewportCenterX:.5,viewportCenterY:.5,fitScale:0,fitViewportWidth:0,fitViewportHeight:0},exportSettings:{exportName:"cf-%cam",exportFormat:"psd",exportGridOverlay:!0,exportGridLayerMode:"bottom",exportModelLayers:!0,exportSplatLayers:!0},navigation:{rollLock:!1},referenceImages:ya(),frames:Ey(),activeFrameId:Lr(1)},r=(n.frames??[]).slice(0,zr).map((a,c)=>_u({id:(a==null?void 0:a.id)??Lr(c+1),name:a==null?void 0:a.name,source:a})),s=bu(r);return{...n,id:i??n.id??gu(1),name:e??n.name??"Camera 1",frameMask:{...s,...xu(n.frameMask,r)},frames:r,activeFrameId:n.activeFrameId??((o=r[0])==null?void 0:o.id)??null}}function Cy(){return[Ty({id:gu(1),name:"Camera 1"})]}function Ay(i,e){return i.find(t=>t.id===e)??null}function Fy(i,e){return Ay(i,e)??i[0]??{id:"pane-fallback",role:ba,viewportPreset:fu,projection:"perspective",shotCameraBinding:"active"}}function Ry(i,e){return i.find(t=>t.id===e)??null}function Py(i,e){return Ry(i,e)??i[0]??null}function Iy(i,e){return i.find(t=>t.id===e)??null}function Dy(i,e){return Iy(i,e)??i[0]??null}function zy(i){var n,r,s,o,a,c,l,u,h,d,p,m,f,g,y,b,M,v;const e=(i.frames??[]).slice(0,zr).map(yu),t=xu(i.frameMask,e);return{...i,lens:{...i.lens},clipping:{...i.clipping},outputFrame:{...i.outputFrame,centerX:Number.isFinite((n=i.outputFrame)==null?void 0:n.centerX)?i.outputFrame.centerX:.5,centerY:Number.isFinite((r=i.outputFrame)==null?void 0:r.centerY)?i.outputFrame.centerY:.5,viewportCenterX:Number.isFinite((s=i.outputFrame)==null?void 0:s.viewportCenterX)?i.outputFrame.viewportCenterX:.5,viewportCenterY:Number.isFinite((o=i.outputFrame)==null?void 0:o.viewportCenterY)?i.outputFrame.viewportCenterY:.5,fitScale:Number.isFinite((a=i.outputFrame)==null?void 0:a.fitScale)&&i.outputFrame.fitScale>0?i.outputFrame.fitScale:0,fitViewportWidth:Number.isFinite((c=i.outputFrame)==null?void 0:c.fitViewportWidth)?i.outputFrame.fitViewportWidth:0,fitViewportHeight:Number.isFinite((l=i.outputFrame)==null?void 0:l.fitViewportHeight)?i.outputFrame.fitViewportHeight:0,viewZoomAuto:((u=i.outputFrame)==null?void 0:u.viewZoomAuto)!==!1,viewportCenterAuto:((h=i.outputFrame)==null?void 0:h.viewportCenterAuto)!==!1},exportSettings:{exportName:((d=i.exportSettings)==null?void 0:d.exportName)??"",exportFormat:((p=i.exportSettings)==null?void 0:p.exportFormat)??"psd",exportGridOverlay:!!((m=i.exportSettings)!=null&&m.exportGridOverlay),exportGridLayerMode:((f=i.exportSettings)==null?void 0:f.exportGridLayerMode)==="overlay"?"overlay":"bottom",exportModelLayers:!!((g=i.exportSettings)!=null&&g.exportModelLayers),exportSplatLayers:((y=i.exportSettings)==null?void 0:y.exportSplatLayers)??!0},frameMask:{...bu(e),...t,trajectory:{nodesByFrameId:Dg((b=t.trajectory)==null?void 0:b.nodesByFrameId)}},navigation:{rollLock:!!((M=i.navigation)!=null&&M.rollLock)},referenceImages:dy(i.referenceImages),frames:e,activeFrameId:i.activeFrameId??((v=e[0])==null?void 0:v.id)??null}}function Ny(i){return`mode.${(i==null?void 0:i.role)??ba}`}function D1(i,e){return i.map((t,n)=>n===0?{...t,role:e}:t)}const vo="ja",By=[{value:"ja",labelKey:"localeName.ja"},{value:"en",labelKey:"localeName.en"}];function lc(i){const e=String(i??"").trim().toLowerCase();if(!e)return null;const t=e.split(/[-_]/)[0];return By.some(n=>n.value===t)?t:null}function Oy({search:i=(n=>(n=globalThis.location)==null?void 0:n.search)()??"",navigatorLanguages:e=(r=>(r=globalThis.navigator)==null?void 0:r.languages)()??[],navigatorLanguage:t=(s=>(s=globalThis.navigator)==null?void 0:s.language)()??""}={}){const o=new URLSearchParams(i),a=lc(o.get("lang")??o.get("locale"));if(a)return a;for(const c of[...e,t]){const l=lc(c);if(l)return l}return vo}const Hs={ja:{app:{previewTag:"Spark 2.0",panelCopy:"Spark 2.0 を基盤にした CAMERA_FRAMES のワークフロー。"},field:{language:"Language",remoteUrl:"リモート URL",activeShotCamera:"カメラ",shotCameraName:"カメラ名",shotCameraFov:"標準FRAME水平FOV",shotCameraEquivalentMm:"フルサイズ焦点距離",viewportFov:"ビューポート水平FOV",viewportEquivalentMm:"ビューポート フルサイズ焦点距離",shotCameraClipMode:"クリップ範囲",shotCameraNear:"Near",shotCameraFar:"Far",shotCameraYaw:"Yaw",shotCameraPitch:"Pitch",shotCameraRoll:"Roll",shotCameraRollLock:"ロールを固定",shotCameraMoveHorizontal:"左右",shotCameraMoveVertical:"上下",shotCameraMoveDepth:"前後",shotCameraExportName:"書き出し名",exportFormat:"書き出し形式",exportGridOverlay:"ガイドを含める",exportReferenceImages:"下絵を含める",exportGridLayerMode:"グリッド重ね順",exportModelLayers:"GLB をレイヤー化",exportSplatLayers:"3DGS をレイヤー化",outputFrameWidth:"用紙サイズ 幅",outputFrameHeight:"用紙サイズ 高",cameraViewZoom:"表示ズーム",anchor:"用紙サイズ変更基準点",assetScale:"スケール",assetPosition:"位置",assetRotation:"回転",transformSpace:"座標系",transformMode:"ツール",activeFrame:"FRAME",frameMaskOpacity:"マスク不透明度",frameMaskShape:"マスク形状",frameTrajectoryMode:"軌道補間",frameTrajectoryNodeMode:"軌道ノード",frameTrajectoryExportSource:"FRAME軌道出力",exportTarget:"書き出し対象",exportPresetSelection:"選択カメラ",referenceImageOpacity:"不透明度",referenceImageScale:"拡縮",referencePresetName:"プリセット名",referenceImageOffsetX:"位置 X",referenceImageOffsetY:"位置 Y",referenceImageRotation:"回転",referenceImageOrder:"順番",referenceImageGroup:"前後",measurementLength:"測定距離",lightIntensity:"ライト強度",lightAmbient:"アンビエント",lightDirection:"ライト方向",lightAzimuth:"方位",lightElevation:"仰角",positionX:"X",positionY:"Y",positionZ:"Z"},section:{file:"ファイル",view:"ビューポート画角",displayZoom:"表示ズーム",scene:"シーン",sceneManager:"シーンマネージャー",selectedSceneObject:"オブジェクトプロパティ",lighting:"照明",tools:"ツール",project:"プロジェクト",shotCamera:"カメラ",shotCameraManager:"カメラ一覧",shotCameraProperties:"カメラプロパティ",transformSpace:"座標系",pose:"Pose",referenceImages:"下絵",referencePresets:"下絵プリセット",referenceManager:"下絵マネージャー",referenceProperties:"下絵プロパティ",frames:"FRAME",mask:"マスク",outputFrame:"用紙設定",output:"出力",export:"書き出し",exportSettings:"書き出し設定"},menu:{newProjectAction:"新規プロジェクト",saveWorkingStateAction:"プロジェクトを保存",savePackageAction:"プロジェクトを書き出し"},project:{untitled:"無題",dirtyHint:"作業状態に未保存の変更があります",packageHint:"共有・持ち出しには .ssproj 保存が必要です"},mode:{viewport:"ビューポート",camera:"カメラビュー"},transformSpace:{world:"ワールド",local:"ローカル"},transformMode:{none:"なし",select:"選択",reference:"下絵",transform:"変形",pivot:"オブジェクト原点"},selection:{multipleSceneAssetsTitle:"{count}件の3Dオブジェクト",multipleReferenceImagesTitle:"{count}件の下絵"},viewportTool:{moveCenter:"移動"},exportTarget:{current:"現在の Camera",all:"すべての Camera",selected:"選択した Camera"},exportFormat:{png:"PNG",psd:"PSD"},gridLayerMode:{bottom:"最下層",overlay:"アイレベルの下"},frameMaskShape:{bounds:"外接矩形",trajectory:"軌道スイープ"},frameTrajectoryMode:{line:"直線",spline:"スプライン"},frameTrajectoryNodeMode:{auto:"自動",corner:"コーナー",mirrored:"対称",free:"フリー"},trajectorySource:{none:"なし",center:"中心",topLeft:"左上",topRight:"右上",bottomRight:"右下",bottomLeft:"左下"},clipMode:{auto:"自動",manual:"手動"},action:{newProject:"新規プロジェクト",saveProject:"プロジェクトを保存",exportProject:"プロジェクトを書き出し",savePackageAs:"別名で保存",overwritePackage:"上書き保存",openFiles:"開く...",resetFrameTrajectoryNodeAuto:"ノードを自動に戻す",openReferenceImages:"下絵を開く",duplicateReferencePreset:"プリセットを複製",deleteReferencePreset:"プリセットを削除",clear:"クリア",loadUrl:"URLを読み込む",collapseWorkbench:"パネルを最小化",expandWorkbench:"パネルを開く",cancel:"キャンセル",saveAndNewProject:"保存して新規",savePackageAndNewProject:"保存して新規",discardAndNewProject:"保存せず新規",saveAndOpenProject:"保存して開く",savePackageAndOpenProject:"保存して開く",discardAndOpenProject:"保存せず開く",close:"閉じる",continueSave:"保存する",continueLoad:"読み込む",showAsset:"表示",hideAsset:"非表示",showReferenceImages:"下絵を表示",hideReferenceImages:"下絵を非表示",showReferenceImage:"下絵を表示",hideReferenceImage:"下絵を非表示",showSelectedReferenceImages:"選択中の下絵を表示",hideSelectedReferenceImages:"選択中の下絵を非表示",clearSelection:"選択を解除",undo:"元に戻す",redo:"やり直す",duplicateSelectedSceneAssets:"選択中のオブジェクトを複製",deleteSelectedSceneAssets:"選択中のオブジェクトを削除",includeReferenceImageInExport:"書き出しに含める",excludeReferenceImageFromExport:"書き出しから外す",includeSelectedReferenceImagesInExport:"選択中の下絵を書き出しに含める",excludeSelectedReferenceImagesFromExport:"選択中の下絵を書き出しから外す",deleteSelectedReferenceImages:"選択中の下絵を削除",moveAssetUp:"上へ",moveAssetDown:"下へ",newShotCamera:"カメラを追加",duplicateShotCamera:"複製",deleteShotCamera:"削除",nudgeLeft:"← 左",nudgeRight:"右 →",nudgeUp:"↑ 上",nudgeDown:"下 ↓",nudgeForward:"前へ",nudgeBack:"後へ",viewportToShot:"Viewportの姿勢をCameraへ",shotToViewport:"Cameraの姿勢をViewportへ",resetActive:"現在のビューをリセット",refreshPreview:"プレビューを更新",downloadOutput:"書き出す",downloadPng:"PNGを書き出す",downloadPsd:"PSDを書き出す",resetScale:"1xに戻す",applyAssetTransform:"変形適用",resetPivot:"Pivotを戻す",resetLightDirection:"向きを戻す",adjustLens:"焦点距離調整",adjustRoll:"カメラロール",zoomTool:"ズーム",splatEditTool:"3DGS編集",quickMenu:"クイックメニュー",pinQuickSection:"レールに追加",unpinQuickSection:"レールから外す",measureTool:"測定ツール",apply:"適用",frameTool:"フレームツール",measurementStartPoint:"測定始点",measurementEndPoint:"測定終点",measurementAxis:{x:"X 軸で伸ばす",y:"Y 軸で伸ばす",z:"Z 軸で伸ばす"},newFrame:"FRAME を追加",duplicateFrame:"複製",deleteFrame:"削除",renameFrame:"FRAME名を編集",toggleSelectedFrameMask:"選択中マスク",toggleAllFrameMask:"全体マスク",toggleFrameTrajectoryEdit:"軌道編集",enableFrameMask:"マスクを有効",disableFrameMask:"マスクを無効",fitOutputFrameToSafeArea:"表示をフィット"},unit:{millimeter:"millimeter",meter:"meter",percent:"percent",pixel:"pixel",degree:"degree"},tooltip:{fileMenu:"開く・保存・パッケージ保存などのプロジェクト操作です。",collapseWorkbench:"右パネルを最小化して、必要な時だけ呼び出します。",modeCamera:"ショットカメラで構図と下絵を確認します。",modeViewport:"作業用カメラでシーンを自由に見回します。",toolSelect:"3D オブジェクトの選択モードです。もう一度押すと解除します。",toolReference:"下絵の選択と変形モードです。Shift+R で切り替えます。R は下絵表示の一時切替です。もう一度押すと解除します。",toolSplatEdit:"選択中の 3DGS をスプラット単位で編集します。直方体選択、ブラシ選択、変形をここから切り替えます。Shift+E で切り替えます。",toolTransform:"3D オブジェクトの変形モードです。もう一度押すと解除します。",toolPivot:"3Dオブジェクトの変形原点を編集します。もう一度押すと解除します。",toolZoom:"カメラビューでは表示ズーム、ビューポートでは画角を調整します。もう一度押すと解除します。",measureTool:"画面上の 2 点間の距離を測り、その長さ比で選択中オブジェクトへ一様スケールを適用します。",frameTool:"FRAME の追加・複製・削除と、全体 / 選択中マスクの切替やマスク不透明度の調整を行います。",quickMenu:"ツールのクイックメニューを開きます。モバイルではここから使うのが安全です。",clearSelection:"3Dオブジェクト、下絵、FRAME の選択を解除して、アクティブツールを外します。",undo:"直前の操作を元に戻します。",redo:"元に戻した操作をやり直します。",referencePreviewSessionVisible:"下絵のプレビュー表示だけを一時的に切り替えます。保存済みの表示状態は変えません。R で切り替えます。",tabScene:"シーン、アセット、ライティングを管理します。",tabCamera:"ショットカメラと用紙設定を編集します。",tabReference:"下絵プリセットと下絵レイヤーを編集します。",tabExport:"書き出し設定と出力を管理します。",copyViewportPoseToShot:"Viewport の位置、向き、焦点距離を Camera へコピーします。クリップ範囲は変えません。",copyShotPoseToViewport:"Camera の位置と視線方向を Viewport へコピーします。ロール、焦点距離、クリップ範囲は変えません。",resetActiveView:"現在の Camera / Viewport の位置と向きをホーム位置へ戻します。",frameMaskSelected:"選択中の FRAME 群を囲む範囲の外側を暗くします。もう一度押すと解除します。",frameMaskAll:"すべての FRAME を囲む範囲の外側を暗くします。もう一度押すと解除します。",frameMaskShapeField:"外接矩形で囲うか、FRAME の並びに沿って矩形が通過した範囲を使うかを選びます。",frameTrajectoryModeField:"FRAME の中心を結ぶ軌道を直線でつなぐか、スプラインで滑らかにつなぐかを選びます。",frameTrajectoryNodeModeField:"選択中ノードの曲がり方を切り替えます。自動は周囲から補間、コーナーは角、対称は両ハンドル連動、フリーは個別調整です。",frameTrajectoryExportSourceField:"PSD の FRAME グループへ書き出す軌道レイヤーの基準点です。中心か四隅のどれを軌道として使うかを選べます。",toggleFrameTrajectoryEdit:"ビューポート上に軌道ノードとハンドルを表示して編集します。FRAME の移動・回転・拡縮はそのまま併用できます。",resetFrameTrajectoryNodeAuto:"選択中ノードの手動ハンドルを捨てて、自動補間の形へ戻します。",openQuickSection:"この項目だけをクイックパネルで開きます。もう一度押すと閉じます。",pinQuickSection:"この項目を右レールのショートカットに追加します。",unpinQuickSection:"この項目を右レールのショートカットから外します。",shotCameraEquivalentMmField:"フルサイズ換算の焦点距離です。数値を変えるとアクティブなショットカメラの画角が変わります。",outputFrameAnchorField:"用紙サイズを変える時に、どの基準点を固定してフレームを広げるかを選びます。",shotCameraExportName:"書き出しファイル名のテンプレートです。%cam は現在のカメラ名に置き換わります。",exportFormatField:"このカメラの書き出し形式を選びます。PNG は統合画像、PSD はレイヤー付きです。",exportGridOverlayField:"Infinite Grid と Eye Level を書き出しに含めます。",exportGridLayerModeField:"ガイドを出力画像の下に入れるか、上に重ねるかを選びます。",exportModelLayersField:"PSD 書き出し時に GLB モデルを個別レイヤー化します。",exportSplatLayersField:"PSD 書き出し時に 3DGS を個別レイヤー化します。GLB レイヤー化が前提です。",exportTargetField:"現在のカメラ、全カメラ、または選択したカメラだけを書き出します。",exportPresetSelectionField:"選択書き出しの対象に含めるカメラをここで選びます。",exportReferenceImagesField:"下絵を今回の書き出しに含めるかどうかを一時的に切り替えます。",downloadOutput:"現在の対象と各カメラの設定に従って PNG または PSD を書き出します。"},hint:{viewMode:"カメラビューでは Camera と出力フレームを確認します。ビューポートでは作業用カメラでシーンを操作します。",shotCameraList:"Camera は document として保持します。追加は現在のビュー姿勢から、複製は現在の Camera 設定ごと作成します。",shotCameraClip:"自動では Camera ごとの Near を保持しつつ、Far をシーン境界から決めます。手動では Near/Far を Camera ごとに固定します。",shotCameraExport:"書き出し形式とガイド・レイヤー設定は Camera ごとに保持します。PSD の 3DGS レイヤー化は GLB レイヤー化が前提です。",outputFrame:"カメラビューでは off-axis projection を使い、出力フレーム内の構図を最終出力と一致させます。",sceneCalibration:"3DGS は raw 1x で入るので、必要に応じてワールドスケールを補正します。GLB も必要なら個別に調整できます。",sceneOrder:"一覧の順序は PSD のオブジェクトレイヤー順の基準です。表示の切替は viewport と export の両方に反映します。",lightDirection:"球体上のハンドルをドラッグして、いま見ているカメラ基準でライト方向を回します。",frames:"FRAME は Camera View 上の 2D overlay として扱います。いまは直接選択で移動・拡縮・回転・anchor 編集まで行えます。",framesEmpty:"まだ FRAME がありません。最初の FRAME を追加してください。",exportTargetSelection:"選択書き出しでは {count} 件の Camera が対象です。",referenceImagesEmpty:"まだ下絵がありません。PNG / JPG / WEBP / PSD を読み込んでください。"},drop:{title:"画面にファイルをドロップして開く",body:"3Dデータ（PLY / SPZ / SOG / SPLAT / GLB など）、プロジェクトパッケージ（.ssproj）、下絵（PNG / JPG / WEBP / PSD）を読み込めます。",controlsTitle:"カメラ操作",controlOrbit:"左ドラッグ: 見回す",controlPan:"右ドラッグ: 左右 / 上下に移動",controlDolly:"ホイール: 前進 / 後退",controlAnchorOrbit:"Ctrl + 左ドラッグ: 指した位置を中心に回転"},badge:{horizontalFov:"水平FOV",clipRange:"clip"},export:{idle:"待機",rendering:"レンダリング中",ready:"準備完了",exporting:"書き出し中"},overlay:{newProjectTitle:"新規プロジェクト",newProjectMessage:"保存していない変更があります。作業状態を保存してから新しいプロジェクトを開始しますか？",newProjectMessageWithPackage:"保存していない変更があります。新しいプロジェクトを始める前に保存しますか？",openProjectTitle:"別のプロジェクトを開く",openProjectMessage:"保存していない変更があります。作業状態を保存してから別のプロジェクトを開きますか？",openProjectMessageWithPackage:"保存していない変更があります。別のプロジェクトを開く前に保存しますか？",workingSaveNoticeTitle:"プロジェクトを保存",workingSaveNoticeMessage:"Ctrl+S はこのブラウザ内にプロジェクトの作業状態を保存します。他の環境へ持ち出したり共有したりする時は「プロジェクトを書き出し」を使ってください。",startupImportTitle:"共有データを読み込みますか？",startupImportMessage:"このリンクは外部の共有データを読み込みます。読み込みを続けると、下の URL へアクセスします。",importTitle:"3D データを読み込み中",importMessage:"読み込み中です。シーンに反映するまで少し待ってください。",importPhaseVerify:"読み込み対象を確認",importPhaseExpand:"パッケージを展開",importPhaseLoad:"3D アセットを読込",importPhaseApply:"シーンへ反映",importDetailInspectProjectArchive:"プロジェクトパッケージを確認中…",importDetailReadProjectManifest:"manifest を読込中… ({file})",importDetailReadProjectDocument:"プロジェクト設定を読込中… ({file})",importDetailExpandProjectAsset:"{index}/{count} プロジェクト asset を展開: {name}",importDetailExpandProjectAssetWithFile:"{index}/{count} プロジェクト asset を展開: {name} ({file})",importDetailExpandPackage:"{index}/{count} パッケージ: {name}",importDetailLoadAsset:"{index}/{count} アセット: {name}",importDetailApply:"Camera / FRAME / シーン状態を反映",blockedStartupTitle:"共有リンクを読み込めません",blockedStartupMessage:"このリンクはアプリから直接開けませんでした。",blockedStartupReasonHttps:"HTTPS ではないため拒否しました",blockedStartupReasonPrivate:"private address / localhost のため拒否しました",blockedStartupReasonInvalid:"URL として解釈できませんでした",importErrorTitle:"読み込みに失敗しました",importErrorMessageGeneric:"このデータは読み込めませんでした。",importErrorMessageRemote:"このリンクはアプリから直接開けませんでした。",errorDetails:"詳細",packageSaveTitle:"プロジェクトを書き出し",packageSaveMessage:"共有や他の環境への持ち出し用に、プロジェクトを .ssproj として書き出します。",packageSaveMessageWithOverwrite:"共有や他の環境への持ち出し用に、プロジェクトを .ssproj として書き出します。現在のファイル {name} に上書き保存するか、別名で保存するかを選んでください。",exportTitle:"書き出し中",exportMessage:"書き出しが終わるまで少し待ってください。完了するまで他の操作は無効です。",exportDetailSingle:"{camera} を {format} で書き出し中…",exportDetailBatch:"{index}/{count} {camera} を {format} で書き出し中…",exportPhasePrepare:"準備",exportPhaseBeauty:"レンダリング",exportPhaseGuides:"ガイド",exportPhaseMasks:"マスク",exportPhasePsdBase:"PSDベース",exportPhaseModelLayers:"GLBレイヤー",exportPhaseSplatLayers:"3DGSレイヤー",exportPhaseReferenceImages:"下絵",exportPhaseWrite:"書き出し",exportPhaseDetailPrepare:"カメラと出力設定を切り替えています…",exportPhaseDetailBeauty:"最終レンダリングを取得しています…",exportPhaseDetailGuides:"ガイド描画を準備しています…",exportPhaseDetailGuidesGrid:"Infinite Grid を書き出し用に描画しています…",exportPhaseDetailGuidesEyeLevel:"Eye Level を書き出し用に描画しています…",exportPhaseDetailMasks:"マスクを構築しています…",exportPhaseDetailMaskBatch:"{index}/{count} {name} のマスクを作成中…",exportPhaseDetailPsdBase:"PSD のベース画像を構築しています…",exportPhaseDetailModelLayers:"GLB レイヤーを準備しています…",exportPhaseDetailModelLayersBatch:"{index}/{count} {name} の GLB レイヤーを構築中…",exportPhaseDetailSplatLayers:"3DGS レイヤーを準備しています…",exportPhaseDetailSplatLayersBatch:"{index}/{count} {name} の 3DGS レイヤーを構築中…",exportPhaseDetailReferenceImages:"下絵レイヤーを合成しています…",exportPhaseDetailReferenceImagesBatch:"{index}/{count} {name} の下絵を配置中…",exportPhaseDetailWritePng:"PNG ファイルを書き出しています…",exportPhaseDetailWritePsd:"PSD ドキュメントを書き出しています…",exportErrorTitle:"書き出しに失敗しました",exportErrorMessage:"書き出し中にエラーが発生しました。詳細を確認してください。",packageSaveErrorTitle:"プロジェクトの書き出しに失敗しました",packageSaveErrorMessage:"プロジェクトの書き出し中にエラーが発生しました。詳細を確認してください。",packagePhaseCollect:"状態を収集",packagePhaseResolve:"asset を解決",packagePhaseCompress:"3DGS を圧縮",packagePhaseWrite:"パッケージを書き込み",packageDetailCollect:"保存対象を収集中…",packageDetailAsset:"{index}/{total} asset: {name}",packageDetailAssetWithFile:"{index}/{total} asset: {name} ({file})",packageDetailWrite:"ファイルを書き込み中…",packageWriteStage:{zipEntries:"ZIPアーカイブを書き込み中…"},packageResolveStage:{"copy-source":"元の asset を収集中…","copy-packed-splat":"packed 3DGS を収集中…"},packageCompressStage:{"read-input":"入力データを読み込み中…","start-worker":"圧縮ワーカーを起動中…","retry-cpu-worker":"worker が停止したため CPU worker に切替…","load-transform":"SplatTransform を読み込み中…","decode-input":"3DGS を展開中…","merge-tables":"複数テーブルを結合中…","filter-bands":"SH バンドを調整中…","write-sog":"SOG を書き出し中…",finalize:"出力を確定中…"},packageFieldCompressSplats:"3DGS を SOG 圧縮で保存",packageFieldCompressSplatsDisabled:"3DGS を SOG 圧縮で保存 (WebGPU 必須)",packageFieldCompressSplatsWorkerUnavailable:"3DGS を SOG 圧縮で保存 (この環境では利用不可)",packageFieldSogShBands:"SOG の SH バンド",packageFieldSogIterations:"SOG 圧縮 iterations",packageSogShBands:{0:"0 bands",1:"1 band",2:"2 bands",3:"3 bands"},packageSogIterations:{4:"4 iterations",8:"8 iterations",10:"10 iterations",12:"12 iterations",16:"16 iterations"}},exportSummary:{empty:"現在の Camera 設定で書き出します。",refreshed:"プレビューを {width} × {height} で更新しました。",exported:"PNG を {width} × {height} で書き出しました。",exportedBatch:"PNG を {count} 件書き出しました。",psdExported:"PSD を {count} 件書き出しました。",exportedMixed:"{count} 件を書き出しました。"},status:{ready:"準備完了。",projectSaving:"プロジェクトを保存中...",projectSavingToFolder:"{name} にプロジェクトを保存中...",projectLoaded:"プロジェクトを読み込みました。",projectLoadedFromFolder:"{name} からプロジェクトを読み込みました。",projectSaved:"プロジェクトを保存しました。",projectSavedToFolder:"{name} にプロジェクトを保存しました。",workingStateSaved:"{name} を保存しました。",workingStateRestored:"{name} の作業状態を復元しました。",packageSaved:"{name} を書き出しました。",newProjectReady:"新規プロジェクトを開始しました。",projectExporting:"プロジェクトを書き出し中...",projectExported:"プロジェクトを書き出しました。",viewportEnabled:"ビューポートに切り替えました。",cameraEnabled:"カメラビューに切り替えました。",loadingItems:"{count} 件を読み込み中...",loadedItems:"{count} 件を読み込みました。",expandingProjectPackage:"{name} から 3D asset を展開中...",expandedProjectPackage:"{name} から {count} 件の 3D asset を展開しました。",enterUrl:"http(s) URL を 1 つ以上入力してください。",copiedViewportToShot:"Viewport の姿勢を Camera にコピーしました。",copiedShotToViewport:"Camera の姿勢を Viewport にコピーしました。",resetViewport:"ビューポートをリセットしました。",resetCamera:"Camera をリセットしました。",sceneCleared:"シーンをクリアしました。",exportPreviewUpdated:"出力プレビューを更新しました。",pngExported:"PNG を書き出しました。",pngExportedBatch:"PNG を {count} 件書き出しました。",psdExported:"PSD を {count} 件書き出しました。",exportedMixed:"{count} 件を書き出しました。",navigationActive:"FPV ナビゲーション有効。WASD/RF で移動、ドラッグで視線、右ドラッグでスライド。基本速度 {speed} m/s。",zoomToolEnabled:"ズームツール有効。カメラビュー上でドラッグして拡縮、Z か Esc で解除。",viewportZoomToolEnabled:"ビューポート画角調整。ドラッグでフルサイズ焦点距離を変更、Z か Esc で解除。",measurementEnabled:"測定ツール active。クリックで始点と終点を置き、M でもう一度押すと解除します。",measurementDisabled:"測定ツールを終了しました。",measurementScaleApplied:"測定値に合わせて選択中オブジェクトへ {scale}x のスケールを適用しました。",splatEditEnabled:"3DGS 編集モードを有効にしました。{count} 件の 3DGS を編集対象にします。",splatEditDisabled:"3DGS 編集モードを終了しました。",splatEditRequiresScope:"先に Scene で 3DGS を選択してください。",splatEditScopeSummary:"対象 {scope} 件の 3DGS / 選択 {selected} 個のスプラット",splatEditToolBox:"直方体",splatEditToolBrush:"ブラシ",splatEditToolTransform:"変形",splatEditPlaceBoxHint:"ビューをクリックして直方体を配置",splatEditBrushHint:"ドラッグで追加。Alt+ドラッグで除外。Ctrl+ドラッグで視点回転。",splatEditBrushMode:"深さモード",splatEditBrushModeThrough:"貫通",splatEditBrushModeDepth:"奥行き",splatEditBrushDepth:"奥行き",splatEditCenter:"中心",splatEditSize:"サイズ",splatEditScaleDown:"-10%",splatEditScaleUp:"+10%",splatEditFitScope:"対象に合わせる",splatEditAdd:"追加",splatEditSubtract:"除外",splatEditDelete:"削除",splatEditSeparate:"分離",splatEditDuplicate:"複製",splatEditSelectAll:"全選択",splatEditInvert:"反転",splatEditTransformMove:"移動",splatEditTransformRotate:"回転",splatEditTransformScale:"均等スケール",splatEditTransformHint:"ギズモで移動・回転・均等スケールを操作します。",splatEditLastOperation:"直近: {mode} / {count} 個のスプラット",splatEditSelectionAdded:"{count} 個のスプラットを選択範囲に追加しました。",splatEditSelectionRemoved:"{count} 個のスプラットを選択範囲から外しました。",splatEditBrushHitMissing:"ブラシの当たり位置を取得できませんでした。",splatEditSelectionMissing:"先に 3DGS のスプラットを選択してください。",splatEditDeleted:"{count} 個のスプラットを削除しました。",splatEditSeparated:"{count} 個のスプラットを {assets} 件の 3DGS に分離しました。",splatEditDuplicated:"{count} 個のスプラットを {assets} 件の 3DGS に複製しました。",splatEditSelectAllDone:"{count} 個のスプラットを全選択しました。",splatEditInverted:"選択を反転しました（{count} 個のスプラット）。",splatEditTransformedMove:"{count} 個のスプラットを移動しました。",splatEditTransformedRotate:"{count} 個のスプラットを回転しました。",splatEditTransformedScale:"{count} 個のスプラットを均等スケールしました。",zoomToolUnavailable:"ズームツールはここでは使えません。",lensToolEnabled:"焦点距離調整。ドラッグで 35mm横幅換算を変更、Esc で解除。",rollToolEnabled:"カメラロール調整。左右ドラッグで構図を回し、Esc で解除。",rollToolUnavailable:"カメラロールは Camera View でのみ使えます。",localeChanged:"表示言語を {language} に切り替えました。",assetScaleUpdated:"{name} のワールドスケールを {scale} にしました。",assetTransformUpdated:"{name} のトランスフォームを更新しました。",assetTransformApplied:"{name} の変形を適用しました。",assetVisibilityUpdated:"{name} を {visibility} にしました。",duplicatedSceneAsset:"{name} を複製しました。",duplicatedSceneAssets:"{count} 件のオブジェクトを複製しました。",deletedSceneAsset:"{name} を削除しました。",deletedSceneAssets:"{count} 件のオブジェクトを削除しました。",assetOrderUpdated:"{name} の順序を {index} にしました。",selectedShotCamera:"Camera を {name} に切り替えました。",createdShotCamera:"Camera {name} を追加しました。",duplicatedShotCamera:"Camera {name} を複製しました。",deletedShotCamera:"Camera {name} を削除しました。",selectedFrame:"{name} を選択しました。",createdFrame:"{name} を追加しました。",duplicatedFrame:"{name} を複製しました。",duplicatedFrames:"{count} 個の FRAME を複製しました。",deletedFrame:"{name} を削除しました。",deletedFrames:"{count} 個の FRAME を削除しました。",shotCameraClipMode:"Camera のクリップ範囲を {mode} にしました。",shotCameraExportFormat:"Camera の書き出し形式を {format} にしました。",frameLimitReached:"FRAME は最大 {limit} 枚までです。",exportTargetChanged:"書き出し対象を {target} にしました。",exportPresetSelection:"選択書き出しの Camera を {count} 件にしました。"},scene:{badgeEmpty:"空",summaryEmpty:"`.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.ssproj` をドロップまたは読み込みできます。",scaleDefault:"シーン契約: 1 unit = 1 meter。GLB は meters 前提、3DGS は raw 1x で読み込みます。",loaded:"{count} 件を読込: {badge}。",bounds:"境界 {x} × {y} × {z} m。",worldContract:"ワールド契約 1u = 1m。",glbMeter:"GLB は meter-native として扱います。",splatRaw:"3DGS は raw 1x で入るため、校正までは暫定スケールです。",splatCount:"3DGS {count}件",modelCount:"モデル {count}件",scaleAdjusted:"校正済みスケール {count}件。"},assetKind:{splat:"3DGS",model:"GLB / モデル"},assetVisibility:{visible:"表示",hidden:"非表示"},unitMode:{raw:"raw 1x",meters:"meters"},shotCamera:{defaultName:"Camera {index}"},frame:{defaultName:"FRAME {index}"},cameraSummary:{view:"ビュー",shot:"カメラ",pos:"位置",fwd:"前方",clip:"clip",nearFar:"near/far",base:"基準",frame:"フレーム",nav:"移動"},outputFrame:{meta:"{size} · {anchor}"},anchor:{"top-left":"左上","top-center":"上中央","top-right":"右上","middle-left":"左中央",center:"中央","middle-right":"右中央","bottom-left":"左下","bottom-center":"下中央","bottom-right":"右下"},error:{exportRequiresAsset:"出力プレビューの前に 3DGS かモデルを読み込んでください。",exportRequiresPreset:"書き出し対象の Camera を 1 つ以上選択してください。",projectPackageSaveUnsupported:"この環境ではパッケージ保存ダイアログを利用できません。",projectPackageSaveUnavailable:"パッケージの保存先を取得できませんでした。",sogCompressionRequiresWebGpu:"この環境では WebGPU が使えないため、SOG 圧縮保存は利用できません。",sogCompressionWorkerUnavailable:"SOG 圧縮 worker を開始できませんでした。SOG 圧縮をオフにして再度保存してください。",projectPackageOverwriteUnavailable:"上書き保存できるパッケージファイルがありません。",previewContext:"プレビュー用の 2D context を取得できませんでした。",unsupportedFileType:"未対応のファイル形式です: {name}",emptyProjectPackage:"{name} に読み込める 3D asset がありません。",emptyGltf:"GLTF scene が空です。",missingRoot:"CAMERA_FRAMES の root 要素が見つかりませんでした。"},referenceImage:{activePreset:"現在のプリセット",activePresetItems:"{count} item",blankPreset:"(blank)",untitled:"名称未設定",sizeUnknown:"サイズ不明",currentPresetSection:"現在のプリセット",selectedSection:"選択中",selectedEmpty:"選択中の下絵がありません。",currentCameraEmpty:"このプリセットにはまだ下絵 item がありません。下絵を読み込んでください。",currentCameraUsage:"この Camera に {count} 件",orderLabel:"#{order}",group:{back:"背面",front:"前面"},groupShort:{back:"背",front:"前"}},localeName:{ja:"日本語",en:"English"}},en:{app:{previewTag:"Spark 2.0",panelCopy:"CAMERA_FRAMES workflow built on Spark 2.0."},field:{language:"Language",remoteUrl:"Remote URL",activeShotCamera:"Camera",shotCameraName:"Camera Name",shotCameraFov:"Standard FRAME H-FOV",shotCameraEquivalentMm:"Full-Frame Focal Length",viewportFov:"Viewport H-FOV",viewportEquivalentMm:"Viewport Full-Frame Focal Length",shotCameraClipMode:"Clip Range",shotCameraNear:"Near",shotCameraFar:"Far",shotCameraYaw:"Yaw",shotCameraPitch:"Pitch",shotCameraRoll:"Roll",shotCameraRollLock:"Lock Roll",shotCameraMoveHorizontal:"Left / Right",shotCameraMoveVertical:"Down / Up",shotCameraMoveDepth:"Back / Forward",shotCameraExportName:"Export Name",exportFormat:"Export Format",exportGridOverlay:"Include Guides",exportReferenceImages:"Include Reference Images",exportGridLayerMode:"Grid Layering",exportModelLayers:"Layer GLB Models",exportSplatLayers:"Layer 3DGS Objects",outputFrameWidth:"Paper Width",outputFrameHeight:"Paper Height",cameraViewZoom:"View Zoom",anchor:"Anchor",assetScale:"Scale",assetPosition:"Position",assetRotation:"Rotation",transformSpace:"Coordinate Space",transformMode:"Tool",activeFrame:"FRAME",frameMaskOpacity:"Mask Opacity",frameMaskShape:"Mask Shape",frameTrajectoryMode:"Trajectory",frameTrajectoryNodeMode:"Trajectory Node",frameTrajectoryExportSource:"FRAME Trajectory Output",exportTarget:"Export Target",exportPresetSelection:"Selected Cameras",referenceImageOpacity:"Opacity",referenceImageScale:"Scale",referencePresetName:"Preset Name",referenceImageOffsetX:"Offset X",referenceImageOffsetY:"Offset Y",referenceImageRotation:"Rotation",referenceImageOrder:"Order",referenceImageGroup:"Layer Side",measurementLength:"Measured Length",lightIntensity:"Light Intensity",lightAmbient:"Ambient",lightDirection:"Light Direction",lightAzimuth:"Azimuth",lightElevation:"Elevation",positionX:"X",positionY:"Y",positionZ:"Z"},section:{file:"File",view:"Viewport FOV",displayZoom:"Display Zoom",scene:"Scene",sceneManager:"Scene Manager",selectedSceneObject:"Object Properties",lighting:"Lighting",tools:"Tools",project:"Project",shotCamera:"Camera",shotCameraManager:"Cameras",shotCameraProperties:"Camera Properties",transformSpace:"Coordinate Space",pose:"Pose",referenceImages:"Reference Images",referencePresets:"Reference Presets",referenceManager:"Reference Manager",referenceProperties:"Reference Properties",frames:"FRAME",mask:"Mask",outputFrame:"Paper Setup",output:"Output",export:"Export",exportSettings:"Export Settings"},menu:{newProjectAction:"New Project",saveWorkingStateAction:"Save Project",savePackageAction:"Export Project"},project:{untitled:"Untitled",dirtyHint:"There are unsaved working-state changes",packageHint:"Save a .ssproj package before sharing or moving this project"},mode:{viewport:"Viewport",camera:"Camera View"},transformSpace:{world:"World",local:"Local"},transformMode:{none:"None",select:"Select",reference:"Reference",transform:"Transform",pivot:"Object Origin"},selection:{multipleSceneAssetsTitle:"{count} selected 3D objects",multipleReferenceImagesTitle:"{count} selected references"},viewportTool:{moveCenter:"Move"},exportTarget:{current:"Current Camera",all:"All Cameras",selected:"Selected Cameras"},exportFormat:{png:"PNG",psd:"PSD"},gridLayerMode:{bottom:"Bottom-most",overlay:"Below Eye Level"},frameMaskShape:{bounds:"Bounds",trajectory:"Trajectory Sweep"},frameTrajectoryMode:{line:"Line",spline:"Spline"},frameTrajectoryNodeMode:{auto:"Auto",corner:"Corner",mirrored:"Mirrored",free:"Free"},trajectorySource:{none:"None",center:"Center",topLeft:"Top Left",topRight:"Top Right",bottomRight:"Bottom Right",bottomLeft:"Bottom Left"},clipMode:{auto:"Auto",manual:"Manual"},action:{newProject:"New Project",saveProject:"Save Project",exportProject:"Export Project",savePackageAs:"Save As",overwritePackage:"Overwrite",openFiles:"Open…",resetFrameTrajectoryNodeAuto:"Reset Node to Auto",openReferenceImages:"Open Reference Images",duplicateReferencePreset:"Duplicate Preset",deleteReferencePreset:"Delete Preset",clear:"Clear",loadUrl:"Load URL",collapseWorkbench:"Minimize panel",expandWorkbench:"Open panel",cancel:"Cancel",saveAndNewProject:"Save and New",savePackageAndNewProject:"Save and New",discardAndNewProject:"Don't Save",saveAndOpenProject:"Save and Open",savePackageAndOpenProject:"Save and Open",discardAndOpenProject:"Don't Save",close:"Close",continueSave:"Save",continueLoad:"Load",showAsset:"Show",hideAsset:"Hide",showReferenceImages:"Show References",hideReferenceImages:"Hide References",showReferenceImage:"Show Reference",hideReferenceImage:"Hide Reference",showSelectedReferenceImages:"Show Selected References",hideSelectedReferenceImages:"Hide Selected References",clearSelection:"Clear Selection",undo:"Undo",redo:"Redo",duplicateSelectedSceneAssets:"Duplicate Selected Objects",includeReferenceImageInExport:"Include in Export",excludeReferenceImageFromExport:"Exclude from Export",includeSelectedReferenceImagesInExport:"Include Selected References in Export",excludeSelectedReferenceImagesFromExport:"Exclude Selected References from Export",deleteSelectedReferenceImages:"Delete Selected References",deleteSelectedSceneAssets:"Delete Selected Objects",moveAssetUp:"Up",moveAssetDown:"Down",newShotCamera:"Add Camera",duplicateShotCamera:"Duplicate",deleteShotCamera:"Delete",nudgeLeft:"← Left",nudgeRight:"Right →",nudgeUp:"↑ Up",nudgeDown:"Down ↓",nudgeForward:"Forward",nudgeBack:"Back",viewportToShot:"Copy Viewport Pose to Camera",shotToViewport:"Copy Camera Pose to Viewport",resetActive:"Reset Active View",refreshPreview:"Refresh Preview",downloadOutput:"Export",downloadPng:"Download PNG",downloadPsd:"Download PSD",resetScale:"Reset 1x",applyAssetTransform:"Apply Transform",resetPivot:"Reset Pivot",resetLightDirection:"Reset Direction",adjustLens:"Adjust Lens",adjustRoll:"Camera Roll",zoomTool:"Zoom",splatEditTool:"3DGS Edit",quickMenu:"Quick Menu",pinQuickSection:"Add To Rail",unpinQuickSection:"Remove From Rail",measureTool:"Measure Tool",apply:"Apply",frameTool:"Frame Tool",measurementStartPoint:"Measurement start point",measurementEndPoint:"Measurement end point",measurementAxis:{x:"Extend along X",y:"Extend along Y",z:"Extend along Z"},newFrame:"Add FRAME",duplicateFrame:"Duplicate",deleteFrame:"Delete",renameFrame:"Rename FRAME",toggleSelectedFrameMask:"Selected Mask",toggleAllFrameMask:"All Frames Mask",toggleFrameTrajectoryEdit:"Edit Trajectory",enableFrameMask:"Enable Mask",disableFrameMask:"Disable Mask",fitOutputFrameToSafeArea:"Fit View"},unit:{millimeter:"ミリメートル",meter:"メートル",percent:"パーセント",pixel:"ピクセル",degree:"度"},tooltip:{fileMenu:"Open, save, and package-level project commands live here.",collapseWorkbench:"Minimize the right panel and bring it back only when needed.",modeCamera:"Use the shot camera to frame the scene and align references.",modeViewport:"Use the working camera to inspect and navigate the scene freely.",toolSelect:"Select 3D objects. Press again to return to no active tool.",toolReference:"Edit reference images. Toggle with Shift+R. R temporarily shows or hides references. Press again to return to no active tool.",toolSplatEdit:"Enter per-splat editing for the selected 3DGS assets. This is the entry point for Box and Brush tools. Toggle with Shift+E.",toolTransform:"Transform 3D objects. Press again to return to no active tool.",toolPivot:"Edit the transform origin of 3D objects. Press again to return to no active tool.",toolZoom:"In Camera View it adjusts display zoom; in Viewport it adjusts viewport lens. Press again to return to navigation.",measureTool:"Measure the distance between two points on screen and apply a matching uniform scale ratio to the selected objects.",frameTool:"Add, duplicate, or delete FRAMEs, and control all-frame or selected-frame masking plus mask opacity.",quickMenu:"Open the quick tool menu. On mobile, this is the safer way to use it.",clearSelection:"Clear selected 3D objects, reference images, and FRAMEs, then return to no active tool.",undo:"Undo the most recent change.",redo:"Redo the most recently undone change.",referencePreviewSessionVisible:"Temporarily show or hide reference previews without changing their saved visibility state. Toggle with R.",tabScene:"Manage scene assets and lighting.",tabCamera:"Edit the active shot camera and paper setup.",tabReference:"Edit reference presets and reference image layers.",tabExport:"Adjust export options and run output.",copyViewportPoseToShot:"Copy the Viewport position, orientation, and lens into the Camera. The clip range stays unchanged.",copyShotPoseToViewport:"Copy the Camera position and view direction into the Viewport. Roll, lens, and clip range stay unchanged.",resetActiveView:"Return the current Camera or Viewport position and orientation to the home pose.",frameMaskSelected:"Dim everything outside the bounding box of the selected FRAMEs. Press again to turn it off.",frameMaskAll:"Dim everything outside the bounding box covering all FRAMEs. Press again to turn it off.",frameMaskShapeField:"Choose whether the mask uses one combined bounding box or the swept area traced by the FRAME rectangles in order.",frameTrajectoryModeField:"Choose whether the trajectory connecting FRAME centers uses straight segments or an editable spline.",frameTrajectoryNodeModeField:"Choose how the selected spline node behaves. Auto derives handles, Corner makes a sharp turn, Mirrored links both handles, and Free edits them independently.",frameTrajectoryExportSourceField:"Choose which reference point is written as the PSD trajectory layer inside the FRAME group: center or one of the four corners.",toggleFrameTrajectoryEdit:"Show trajectory nodes and handles in the viewport for path editing while keeping normal FRAME transforms available.",resetFrameTrajectoryNodeAuto:"Discard manual handles on the selected node and return it to automatic smoothing.",openQuickSection:"Open only this section as a quick panel. Press again to close it.",pinQuickSection:"Add this section to the right rail shortcuts.",unpinQuickSection:"Remove this section from the right rail shortcuts.",shotCameraEquivalentMmField:"Full-frame-equivalent focal length. Changing it updates the active shot camera lens angle.",outputFrameAnchorField:"Choose which point stays fixed when the paper size changes.",shotCameraExportName:"Template for the exported filename. %cam is replaced with the current camera name.",exportFormatField:"Choose the export format for this camera. PNG is flattened; PSD keeps layers.",exportGridOverlayField:"Include Infinite Grid and Eye Level in the export.",exportGridLayerModeField:"Choose whether guide overlays render below or above the beauty image.",exportModelLayersField:"Write GLB models as separate PSD layers.",exportSplatLayersField:"Write 3DGS objects as separate PSD layers. GLB model layers must also be enabled.",exportTargetField:"Export only the current camera, every camera, or a selected subset.",exportPresetSelectionField:"Choose which cameras are included when Export Target is set to Selected.",exportReferenceImagesField:"Temporarily include or exclude reference images from this export run.",downloadOutput:"Export PNG or PSD files using the current target and per-camera export settings."},hint:{viewMode:"Camera View shows the Camera and Output Frame. Viewport uses a free working camera for scene editing.",shotCameraList:"Cameras are stored as document objects. New cameras start from the current view pose; duplicate copies the active camera settings.",shotCameraClip:"Auto keeps the per-Camera near clip and derives far from scene bounds. Manual stores both near and far per Camera.",shotCameraExport:"Export format, guide layering, and PSD layer settings are stored per Camera. 3DGS object layers in PSD require GLB layered export to be enabled.",outputFrame:"Camera View uses off-axis projection so framing inside the Output Frame matches final output.",sceneCalibration:"3DGS assets enter at raw 1x, so adjust world scale when needed. GLB assets can also be tuned per asset when necessary.",sceneOrder:"List order becomes the PSD object-layer order. Visibility affects both viewport and export.",lightDirection:"Drag the handle on the sphere to rotate the light direction relative to the camera you are currently viewing.",frames:"FRAME is treated as a 2D overlay in Camera View. This slice supports direct move, resize, rotate, and anchor editing.",framesEmpty:"No FRAME yet. Add the first FRAME to start laying out the shot.",exportTargetSelection:"Selected export currently includes {count} Camera preset(s).",referenceImagesEmpty:"No reference images yet. Load PNG, JPG, WEBP, or PSD files to begin."},drop:{title:"Drop files here",body:"Load 3D data (PLY / SPZ / SOG / SPLAT / GLB and more), project packages (.ssproj), or reference images (PNG / JPG / WEBP / PSD).",controlsTitle:"Camera Controls",controlOrbit:"Left drag: look around",controlPan:"Right drag: slide left / right / up / down",controlDolly:"Wheel: move forward / back",controlAnchorOrbit:"Ctrl + left drag: orbit around the pointed spot"},badge:{horizontalFov:"H-FOV",clipRange:"clip"},export:{idle:"Idle",rendering:"Rendering",ready:"Ready",exporting:"Exporting"},overlay:{newProjectTitle:"New Project",newProjectMessage:"You have unsaved changes. Save the working state before starting a new project?",newProjectMessageWithPackage:"You have unsaved changes. Save before starting a new project?",openProjectTitle:"Open Another Project",openProjectMessage:"You have unsaved changes. Save the working state before opening another project?",openProjectMessageWithPackage:"You have unsaved changes. Save before opening another project?",workingSaveNoticeTitle:"Save Project",workingSaveNoticeMessage:"Ctrl+S saves the project's working state in this browser. Use “Export Project” when you need a portable .ssproj file for sharing or moving to another environment.",startupImportTitle:"Load shared data?",startupImportMessage:"This link will load external shared data. Continuing will access the URLs below.",importTitle:"Loading 3D data",importMessage:"Loading is in progress. Please wait until the scene finishes updating.",importPhaseVerify:"Checking sources",importPhaseExpand:"Expanding packages",importPhaseLoad:"Loading 3D assets",importPhaseApply:"Applying scene state",importDetailInspectProjectArchive:"Inspecting project package…",importDetailReadProjectManifest:"Reading manifest… ({file})",importDetailReadProjectDocument:"Reading project document… ({file})",importDetailExpandProjectAsset:"Expanding project asset {index}/{count}: {name}",importDetailExpandProjectAssetWithFile:"Expanding project asset {index}/{count}: {name} ({file})",importDetailExpandPackage:"Package {index}/{count}: {name}",importDetailLoadAsset:"Asset {index}/{count}: {name}",importDetailApply:"Applying Camera / FRAME / scene state",blockedStartupTitle:"Shared link cannot be loaded",blockedStartupMessage:"This link could not be opened directly from the app.",blockedStartupReasonHttps:"Blocked because the URL is not HTTPS",blockedStartupReasonPrivate:"Blocked because the URL points to a private address or localhost",blockedStartupReasonInvalid:"Blocked because the value is not a valid URL",importErrorTitle:"Failed to load data",importErrorMessageGeneric:"This data could not be loaded.",importErrorMessageRemote:"This link could not be opened directly from the app.",errorDetails:"Details",packageSaveTitle:"Export Project",packageSaveMessage:"Export a portable .ssproj project file for sharing or moving to another environment.",packageSaveMessageWithOverwrite:"Export a portable .ssproj project file for sharing or moving to another environment. Choose whether to overwrite {name} or save to a new file.",exportTitle:"Exporting",exportMessage:"Please wait until export finishes. Other interactions are temporarily disabled.",exportDetailSingle:"Exporting {camera} as {format}…",exportDetailBatch:"Exporting {index}/{count} {camera} as {format}…",exportPhasePrepare:"Preparing",exportPhaseBeauty:"Rendering",exportPhaseGuides:"Guides",exportPhaseMasks:"Masks",exportPhasePsdBase:"PSD Base",exportPhaseModelLayers:"GLB Layers",exportPhaseSplatLayers:"3DGS Layers",exportPhaseReferenceImages:"Reference Images",exportPhaseWrite:"Writing",exportPhaseDetailPrepare:"Switching camera and export state…",exportPhaseDetailBeauty:"Rendering the final beauty image…",exportPhaseDetailGuides:"Preparing guide layers…",exportPhaseDetailGuidesGrid:"Rendering Infinite Grid for export…",exportPhaseDetailGuidesEyeLevel:"Rendering Eye Level for export…",exportPhaseDetailMasks:"Building mask passes…",exportPhaseDetailMaskBatch:"Building mask {index}/{count}: {name}…",exportPhaseDetailPsdBase:"Preparing the PSD base image…",exportPhaseDetailModelLayers:"Preparing GLB layer exports…",exportPhaseDetailModelLayersBatch:"Building GLB layer {index}/{count}: {name}…",exportPhaseDetailSplatLayers:"Preparing 3DGS layer exports…",exportPhaseDetailSplatLayersBatch:"Building 3DGS layer {index}/{count}: {name}…",exportPhaseDetailReferenceImages:"Compositing reference image layers…",exportPhaseDetailReferenceImagesBatch:"Placing reference image {index}/{count}: {name}…",exportPhaseDetailWritePng:"Writing PNG file…",exportPhaseDetailWritePsd:"Writing PSD document…",exportErrorTitle:"Export failed",exportErrorMessage:"An error occurred during export. Review the details and try again.",packageSaveErrorTitle:"Project export failed",packageSaveErrorMessage:"An error occurred while exporting the project. Check the details below.",packagePhaseCollect:"Collecting state",packagePhaseResolve:"Resolving assets",packagePhaseCompress:"Compressing 3DGS",packagePhaseWrite:"Writing package",packageDetailCollect:"Collecting save data…",packageDetailAsset:"Asset {index}/{total}: {name}",packageDetailAssetWithFile:"Asset {index}/{total}: {name} ({file})",packageDetailWrite:"Writing package file…",packageWriteStage:{zipEntries:"Writing ZIP archive…"},packageResolveStage:{"copy-source":"Copying original asset data…","copy-packed-splat":"Collecting packed 3DGS data…"},packageCompressStage:{"read-input":"Reading source data…","start-worker":"Starting compression worker…","retry-cpu-worker":"Worker stalled, retrying on CPU worker…","load-transform":"Loading SplatTransform…","decode-input":"Decoding 3DGS data…","merge-tables":"Merging splat tables…","filter-bands":"Filtering SH bands…","write-sog":"Writing SOG output…",finalize:"Finalizing output…"},packageFieldCompressSplats:"Compress 3DGS to SOG",packageFieldCompressSplatsDisabled:"Compress 3DGS to SOG (WebGPU required)",packageFieldCompressSplatsWorkerUnavailable:"Compress 3DGS to SOG (unavailable in this environment)",packageFieldSogShBands:"SOG SH Bands",packageFieldSogIterations:"SOG Compression Iterations",packageSogShBands:{0:"0 bands",1:"1 band",2:"2 bands",3:"3 bands"},packageSogIterations:{4:"4 iterations",8:"8 iterations",10:"10 iterations",12:"12 iterations",16:"16 iterations"}},exportSummary:{empty:"Exports use the current Camera settings.",refreshed:"Preview refreshed at {width} × {height}.",exported:"PNG exported at {width} × {height}.",exportedBatch:"Exported {count} PNG file(s).",psdExported:"Exported {count} PSD file(s).",exportedMixed:"Exported {count} file(s)."},status:{ready:"Ready.",projectSaving:"Saving project...",projectSavingToFolder:"Saving project to {name}...",projectLoaded:"Project loaded.",projectLoadedFromFolder:"Loaded project from {name}.",projectSaved:"Project saved.",projectSavedToFolder:"Saved project to {name}.",workingStateSaved:"Saved {name}.",workingStateRestored:"Restored working state for {name}.",referenceImagesImported:"Loaded {count} reference image file(s).",packageSaved:"Exported {name}.",newProjectReady:"Started a new project.",projectExporting:"Exporting project...",projectExported:"Project exported.",viewportEnabled:"Switched to Viewport.",cameraEnabled:"Switched to Camera View.",loadingItems:"Loading {count} item(s)...",loadedItems:"Loaded {count} item(s).",expandingProjectPackage:"Extracting 3D assets from {name}...",expandedProjectPackage:"Extracted {count} 3D asset(s) from {name}.",enterUrl:"Enter at least one http(s) URL.",copiedViewportToShot:"Copied the Viewport pose into the Camera.",copiedShotToViewport:"Copied the Camera pose into the Viewport.",resetViewport:"Viewport reset.",resetCamera:"Camera reset.",sceneCleared:"Scene cleared.",exportPreviewUpdated:"Output preview updated.",pngExported:"PNG exported.",pngExportedBatch:"Exported {count} PNG file(s).",psdExported:"Exported {count} PSD file(s).",exportedMixed:"Exported {count} file(s).",navigationActive:"FPV navigation active. WASD/RF move, drag to look, right-drag to slide. Base speed {speed} m/s.",zoomToolEnabled:"Zoom tool active. Drag in Camera View to zoom, press Z or Esc to exit.",viewportZoomToolEnabled:"Viewport lens adjust active. Drag to change the full-frame focal length, press Z or Esc to exit.",measurementEnabled:"Measurement tool active. Click to place start and end points, then press M again to exit.",measurementDisabled:"Measurement tool disabled.",measurementScaleApplied:"Applied a {scale}x scale ratio to the selected objects from the measurement.",splatEditEnabled:"Enabled 3DGS edit mode. {count} selected 3DGS assets are now in scope.",splatEditDisabled:"Exited 3DGS edit mode.",splatEditRequiresScope:"Select at least one 3DGS asset in the Scene tab first.",splatEditScopeSummary:"Scope {scope} asset / Selected {selected} splat",splatEditToolBox:"Box",splatEditToolBrush:"Brush",splatEditToolTransform:"Transform",splatEditPlaceBoxHint:"Click in the view to place the box",splatEditBrushHint:"Drag to add. Hold Alt while dragging to subtract. Hold Ctrl while dragging to orbit.",splatEditBrushMode:"Depth Mode",splatEditBrushModeThrough:"Through",splatEditBrushModeDepth:"Depth",splatEditBrushDepth:"Depth",splatEditCenter:"Center",splatEditSize:"Size",splatEditScaleDown:"-10%",splatEditScaleUp:"+10%",splatEditFitScope:"Fit Scope",splatEditAdd:"Add",splatEditSubtract:"Subtract",splatEditDelete:"Delete",splatEditSeparate:"Separate",splatEditDuplicate:"Duplicate",splatEditSelectAll:"Select All",splatEditInvert:"Invert",splatEditTransformMove:"Move",splatEditTransformRotate:"Rotate",splatEditTransformScale:"Uniform Scale",splatEditTransformHint:"Use the gizmo to move, rotate, or scale the selected splats.",splatEditLastOperation:"Last: {mode} / {count} hit",splatEditSelectionAdded:"Added {count} splats to the selection.",splatEditSelectionRemoved:"Removed {count} splats from the selection.",splatEditBrushHitMissing:"Could not resolve a Brush hit point.",splatEditSelectionMissing:"Select 3DGS splats first.",splatEditDeleted:"Deleted {count} splats.",splatEditSeparated:"Separated {count} splats into {assets} asset(s).",splatEditDuplicated:"Duplicated {count} splats into {assets} asset(s).",splatEditSelectAllDone:"Selected all {count} splats.",splatEditInverted:"Inverted selection ({count} splats).",splatEditTransformedMove:"Moved {count} splats.",splatEditTransformedRotate:"Rotated {count} splats.",splatEditTransformedScale:"Scaled {count} splats uniformly.",zoomToolUnavailable:"The zoom tool is not available here.",lensToolEnabled:"Lens adjust active. Drag to change the 35mm horizontal equivalent, press Esc to exit.",rollToolEnabled:"Camera roll active. Drag left or right to rotate the shot, press Esc to exit.",rollToolUnavailable:"Camera roll is only available in Camera View.",localeChanged:"Display language switched to {language}.",assetScaleUpdated:"Set {name} world scale to {scale}.",assetTransformUpdated:"Updated {name} transform.",assetTransformApplied:"Applied transform for {name}.",assetVisibilityUpdated:"Set {name} to {visibility}.",duplicatedSceneAsset:"Duplicated {name}.",duplicatedSceneAssets:"Duplicated {count} objects.",deletedSceneAsset:"Deleted {name}.",deletedSceneAssets:"Deleted {count} objects.",assetOrderUpdated:"Moved {name} to order {index}.",selectedShotCamera:"Camera switched to {name}.",createdShotCamera:"Added Camera {name}.",duplicatedShotCamera:"Duplicated Camera {name}.",deletedShotCamera:"Deleted Camera {name}.",selectedFrame:"Selected {name}.",createdFrame:"Added {name}.",duplicatedFrame:"Duplicated {name}.",duplicatedFrames:"Duplicated {count} FRAMEs.",deletedFrame:"Deleted {name}.",deletedFrames:"Deleted {count} FRAMEs.",shotCameraClipMode:"Camera clip range set to {mode}.",shotCameraExportFormat:"Camera export format set to {format}.",frameLimitReached:"FRAME limit reached ({limit}).",exportTargetChanged:"Export target set to {target}.",exportPresetSelection:"Selected export now includes {count} Camera preset(s)."},scene:{badgeEmpty:"Empty",summaryEmpty:"Drop or load `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, or `.ssproj` files.",scaleDefault:"Scene contract: 1 unit = 1 meter. GLB defaults to meters; 3DGS enters at raw 1x.",loaded:"Loaded {count} item(s): {badge}.",bounds:"Bounds {x} × {y} × {z} m.",worldContract:"World contract 1u = 1m.",glbMeter:"GLB assets are treated as meter-native.",splatRaw:"3DGS assets enter at raw 1x, so scale stays provisional until calibrated.",splatCount:"{count} splat{plural}",modelCount:"{count} model{plural}",scaleAdjusted:"{count} calibrated scale adjustment(s)."},assetKind:{splat:"3DGS",model:"GLB / Model"},assetVisibility:{visible:"Visible",hidden:"Hidden"},unitMode:{raw:"raw 1x",meters:"meters"},shotCamera:{defaultName:"Camera {index}"},frame:{defaultName:"FRAME {index}"},cameraSummary:{view:"view",shot:"shot",pos:"pos",fwd:"fwd",clip:"clip",nearFar:"near/far",base:"base",frame:"frame",nav:"nav"},outputFrame:{meta:"{size} · {anchor}"},anchor:{"top-left":"Top Left","top-center":"Top Center","top-right":"Top Right","middle-left":"Middle Left",center:"Center","middle-right":"Middle Right","bottom-left":"Bottom Left","bottom-center":"Bottom Center","bottom-right":"Bottom Right"},error:{exportRequiresAsset:"Load a splat or model before rendering output preview.",exportRequiresPreset:"Select at least one Camera for export.",projectPackageSaveUnsupported:"Package save dialogs are not supported in this environment.",projectPackageSaveUnavailable:"Could not get a destination for package save.",sogCompressionRequiresWebGpu:"SOG compression save requires WebGPU in this environment.",sogCompressionWorkerUnavailable:"Could not start the SOG compression worker in this environment. Save again with SOG compression turned off.",projectPackageOverwriteUnavailable:"There is no project package available to overwrite.",previewContext:"Could not get the 2D context for output preview.",unsupportedFileType:"Unsupported file type: {name}",emptyProjectPackage:"No supported 3D assets were found in {name}.",emptyGltf:"GLTF scene is empty.",missingRoot:"CAMERA_FRAMES root element was not found."},referenceImage:{activePreset:"Active Preset",activePresetItems:"{count} item(s)",blankPreset:"(blank)",untitled:"Untitled",sizeUnknown:"Unknown size",currentPresetSection:"Current Preset",selectedSection:"Selected",selectedEmpty:"No reference image is selected.",currentCameraEmpty:"There are no reference items in this preset yet. Load a reference image to begin.",currentCameraUsage:"{count} item(s) on this Camera",orderLabel:"#{order}",group:{back:"Back",front:"Front"},groupShort:{back:"B",front:"F"}},localeName:{ja:"Japanese",en:"English"}}};function cc(i,e){return e.split(".").reduce((t,n)=>t==null?void 0:t[n],i)}function Ue(i,e,t={}){const n=Hs[i]??Hs[vo],r=Hs[vo];let s=cc(n,e);return s==null&&(s=cc(r,e)),typeof s!="string"?e:s.replace(/\{(.*?)\}/g,(o,a)=>`${t[a]??`{${a}}`}`)}function mt(i,e){return Ue(i,`anchor.${e}`)}function z1(i){return[{value:"top-left",label:mt(i,"top-left")},{value:"top-center",label:mt(i,"top-center")},{value:"top-right",label:mt(i,"top-right")},{value:"middle-left",label:mt(i,"middle-left")},{value:"center",label:mt(i,"center")},{value:"middle-right",label:mt(i,"middle-right")},{value:"bottom-left",label:mt(i,"bottom-left")},{value:"bottom-center",label:mt(i,"bottom-center")},{value:"bottom-right",label:mt(i,"bottom-right")}]}const vu="perspective",hc="orthographic",gi="posX",yi="negX",_i="posY",bi="negY",Rn="posZ",xi="negZ",Ei=Rn,wa=3,es=6,ai=Object.freeze({x:0,y:1,z:0}),Ly="__cameraFramesViewportOrthoDistance",uc=Object.freeze({[gi]:Object.freeze({id:gi,axis:"x",sign:1,position:Object.freeze([1,0,0]),up:Object.freeze([0,1,0])}),[yi]:Object.freeze({id:yi,axis:"x",sign:-1,position:Object.freeze([-1,0,0]),up:Object.freeze([0,1,0])}),[_i]:Object.freeze({id:_i,axis:"y",sign:1,position:Object.freeze([0,1,0]),up:Object.freeze([0,0,1])}),[bi]:Object.freeze({id:bi,axis:"y",sign:-1,position:Object.freeze([0,-1,0]),up:Object.freeze([0,0,1])}),[Rn]:Object.freeze({id:Rn,axis:"z",sign:1,position:Object.freeze([0,0,1]),up:Object.freeze([0,1,0])}),[xi]:Object.freeze({id:xi,axis:"z",sign:-1,position:Object.freeze([0,0,-1]),up:Object.freeze([0,1,0])})}),jy=Object.freeze({[gi]:yi,[yi]:gi,[_i]:bi,[bi]:_i,[Rn]:xi,[xi]:Rn});function Vy(i=null){return{x:Number.isFinite(i==null?void 0:i.x)?Number(i.x):ai.x,y:Number.isFinite(i==null?void 0:i.y)?Number(i.y):ai.y,z:Number.isFinite(i==null?void 0:i.z)?Number(i.z):ai.z}}function N1(i=null){return wu(i)}function B1(i){return i===hc?hc:vu}function ts(i){return uc[i]??uc[Ei]}function Uy(i){return ts(i).axis}function O1(i){return jy[i]??Ei}function L1(i,e=1){return i==="x"?e<0?yi:gi:i==="y"?e<0?bi:_i:i==="z"?e<0?xi:Rn:Ei}function j1(i){const e=Uy(i);return e==="x"?"zy":e==="y"?"xz":e==="z"?"xy":null}function Hy(i,e=new E){const t=ts(i);return e.set(t.position[0],t.position[1],t.position[2])}function Gy(i,e=new E){const t=ts(i);return e.set(t.up[0],t.up[1],t.up[2])}function wu(i=null){const e=Vy(i==null?void 0:i.focus),t=Number.isFinite(i==null?void 0:i.size)?Math.max(.05,Number(i.size)):wa,n=Number.isFinite(i==null?void 0:i.distance)?Math.max(.05,Number(i.distance)):es;return{viewId:ts(i==null?void 0:i.viewId).id,size:t,distance:n,focus:e}}function V1({depth:i=es,verticalFovDegrees:e=50,minSize:t=.05}={}){const n=Math.max(Number(i)||0,1e-4),r=ii.clamp(Number(e)||0,.001,179.999),s=n*Math.tan(ii.degToRad(r*.5));return Math.max(Number(t)||.05,s)}function U1(i,{aspect:e=1,viewId:t=Ei,size:n=wa,distance:r=es,focus:s=ai}={}){if(!(i!=null&&i.isOrthographicCamera))return!1;const o=Math.max(Number(e)||1,1e-6),a=wu({viewId:t,size:n,distance:r,focus:s}),c=new E(a.focus.x,a.focus.y,a.focus.z),l=Hy(a.viewId,new E).normalize(),u=Gy(a.viewId,new E).normalize(),h=a.size,d=h*o;return i.position.copy(c).addScaledVector(l,a.distance),i.up.copy(u),i.left=-d,i.right=d,i.top=h,i.bottom=-h,i.zoom=1,i.userData=i.userData??{},i.userData[Ly]=a.distance,i.lookAt(c),i.updateProjectionMatrix(),i.updateMatrixWorld(!0),!0}const Wy=1.1,Xy=2,Yy=36.87,qy=45;function Gs(i,e,t,n){const r=Number(i);return Number.isFinite(r)?Math.min(t,Math.max(e,r)):n}function Zy(i,e=0){const t=Number(i);if(!Number.isFinite(t))return e;let n=((t+180)%360+360)%360-180;return n===-180&&(n=180),n}function Mu(){return{ambient:Wy,modelLight:{enabled:!0,intensity:Xy,azimuthDeg:Yy,elevationDeg:qy}}}function H1(i=null){const e=wo(i);return{ambient:e.ambient,modelLight:{enabled:e.modelLight.enabled,intensity:e.modelLight.intensity,azimuthDeg:e.modelLight.azimuthDeg,elevationDeg:e.modelLight.elevationDeg}}}function wo(i=null){const e=Mu(),t=(i==null?void 0:i.modelLight)??{};return{ambient:Gs(i==null?void 0:i.ambient,0,2.5,e.ambient),modelLight:{enabled:typeof t.enabled=="boolean"?t.enabled:e.modelLight.enabled,intensity:Gs(t.intensity,0,3,e.modelLight.intensity),azimuthDeg:Zy(t.azimuthDeg,e.modelLight.azimuthDeg),elevationDeg:Gs(t.elevationDeg,-89,89,e.modelLight.elevationDeg)}}}function G1(i,e){const t=wo(i),n=wo(e);return t.ambient===n.ambient&&t.modelLight.enabled===n.modelLight.enabled&&t.modelLight.intensity===n.modelLight.intensity&&t.modelLight.azimuthDeg===n.modelLight.azimuthDeg&&t.modelLight.elevationDeg===n.modelLight.elevationDeg}const Mo=Math.PI*.5,Jy=.001;function Ky(i){return(i.rotation??0)*Math.PI/180}function Qy(i){const e=Math.round(i/Mo)*Mo;return Math.abs(i-e)<Jy}function e0(i,e,t,n){const r=Math.round(i-t*.5),s=Math.round(i+t*.5),o=Math.round(e-n*.5),a=Math.round(e+n*.5);return{x:r,y:o,width:Math.max(0,s-r),height:Math.max(0,a-o)}}function t0(i){const e=Number(i.scale);return Number.isFinite(e)&&e>0?e:1}function n0(i,e,t,n=e,r=t){const s=t0(i),o=e/Math.max(n,1e-6),a=t/Math.max(r,1e-6);return{width:tt.width*s*o,height:tt.height*s*a}}function Su(i,e,t,n=e,r=t,s=0,o=0,a={}){const{pixelSnapAxisAligned:c=!0}=a,{width:l,height:u}=n0(i,e,t,n,r),h=s+i.x*e,d=o+i.y*t,p=Ky(i),m=Math.round(p/Mo),f=Qy(p),g=f&&Math.abs(m)%2===1,y=f&&c?e0(h,d,g?u:l,g?l:u):null;return{centerX:h,centerY:d,width:l,height:u,rotationRadians:p,axisAligned:f,snappedRect:y}}function dc(i,e,t,n,r,s=Ko){const o=s*.5;i.strokeRect(e-o,t-o,n+o*2,r+o*2)}function pc(i,e,t=Ko){if(e.axisAligned&&e.snappedRect){dc(i,e.snappedRect.x,e.snappedRect.y,e.snappedRect.width,e.snappedRect.height,t);return}i.translate(e.centerX,e.centerY),i.rotate(e.rotationRadians),dc(i,-e.width*.5,-e.height*.5,e.width,e.height,t)}function W1(i,e,t,n,r={}){const{strokeStyle:s="#ff0000",lineWidth:o=Ko,selectedFrameId:a=null,selectedFrameIds:c=null,selectedStrokeStyle:l=null,selectedLineWidth:u=1,selectedLineDash:h=[4,2],logicalSpaceWidth:d=e,logicalSpaceHeight:p=t,offsetX:m=0,offsetY:f=0,pixelSnapAxisAligned:g=!0}=r,y=[...n].sort((M,v)=>(M.order??0)-(v.order??0)),b=c instanceof Set?c:new Set(c??[]);for(const M of y){const v=Su(M,e,t,d,p,m,f,{pixelSnapAxisAligned:g});if(i.save(),i.strokeStyle=s,i.lineWidth=o,i.setLineDash([]),pc(i,v,o),i.restore(),b.has(M.id)&&l){const w=a&&M.id===a?u+.25:u;i.save(),i.strokeStyle=l,i.lineWidth=w,i.setLineDash(h),pc(i,v,w),i.restore()}}}const i0=8,r0=180;function $u(i,e=null){if(!Array.isArray(i)||i.length===0)return[];const t=e==null?void 0:e.mode;if(t==="off")return[];if(t==="selected"){const n=Array.isArray(e==null?void 0:e.selectedIds)?e.selectedIds:[],r=new Set((n.length>0?n:i.map(s=>s==null?void 0:s.id)).filter(s=>typeof s=="string"&&s.length>0));return i.filter(s=>r.has(s==null?void 0:s.id))}return[...i]}function So(i,e){const t=Math.cos(e),n=Math.sin(e);return{x:i.x*t-i.y*n,y:i.x*n+i.y*t}}function s0(i,e,t,n=e,r=t,s=0,o=0){const a=Su(i,e,t,n,r,s,o,{pixelSnapAxisAligned:!1}),c=a.width*.5,l=a.height*.5;return[{x:-c,y:-l},{x:c,y:-l},{x:c,y:l},{x:-c,y:l}].map(u=>{const h=So(u,a.rotationRadians);return{x:a.centerX+h.x,y:a.centerY+h.y}})}function o0(i){let e=Number(i)||0;for(;e<0;)e+=Math.PI;for(;e>=Math.PI;)e-=Math.PI;return e}function a0(i){if(!Array.isArray(i)||i.length===0)return null;const e=Math.min(...i.map(s=>s.x)),t=Math.max(...i.map(s=>s.x)),n=Math.min(...i.map(s=>s.y)),r=Math.max(...i.map(s=>s.y));return[{x:e,y:n},{x:t,y:n},{x:t,y:r},{x:e,y:r}]}function l0(i,e){if(!Array.isArray(i)||i.length===0)return null;const t=i.map(a=>So(a,-e)),n=Math.min(...t.map(a=>a.x)),r=Math.max(...t.map(a=>a.x)),s=Math.min(...t.map(a=>a.y)),o=Math.max(...t.map(a=>a.y));return[{x:n,y:s},{x:r,y:s},{x:r,y:o},{x:n,y:o}].map(a=>So(a,e))}function ku(i,e){if(!(!Array.isArray(e)||e.length===0)){i.moveTo(e[0].x,e[0].y);for(let t=1;t<e.length;t+=1)i.lineTo(e[t].x,e[t].y);i.closePath()}}function Ws(i,e){!Array.isArray(e)||e.length<3||(i.beginPath(),ku(i,e),i.fill())}function jr(i,e,t,n,r,s,o){return{x:s+i.x/Math.max(n,1e-6)*e,y:o+i.y/Math.max(r,1e-6)*t}}function c0(i,e,t,n,r,s,o,a){return ha(i,e,r,s).map(c=>({...c,corners:c.corners.map(l=>jr(l,t,n,r,s,o,a))}))}function h0(i,e,{canvasWidth:t,canvasHeight:n,frameSpaceWidth:r,frameSpaceHeight:s,logicalSpaceWidth:o,logicalSpaceHeight:a,offsetX:c,offsetY:l,fillStyle:u,frameMaskSettings:h}){const d=c0(e,h,r,s,o,a,c,l);if(d.length===0)return null;i.fillStyle=u,i.fillRect(0,0,t,n),i.globalCompositeOperation="destination-out";for(const p of d)Ws(i,p.corners);for(let p=1;p<d.length;p+=1){const m=d[p-1].corners,f=d[p].corners;for(let g=0;g<m.length;g+=1){const y=m[g],b=m[(g+1)%m.length],M=f[(g+1)%f.length],v=f[g];Ws(i,[y,b,M]),Ws(i,[y,M,v])}}return i.globalCompositeOperation="source-over",null}function u0(i,e,t,n=e,r=t,s=0,o=0,a={}){var p;if(!Array.isArray(i)||i.length===0||sa(a.frameMaskShape??((p=a.frameMaskSettings)==null?void 0:p.shape))===ui)return null;const c=i.map(m=>s0(m,e,t,n,r,s,o));if(c.length===1)return c[0];const l=i.map(m=>o0((Number(m==null?void 0:m.rotation)||0)*Math.PI/180)),u=l[0],h=l.every(m=>Math.abs(m-u)<=1e-6),d=c.flat();return h?l0(d,u):a0(d)}function Eu(i,e,{canvasWidth:t,canvasHeight:n,frameSpaceWidth:r=t,frameSpaceHeight:s=n,logicalSpaceWidth:o=r,logicalSpaceHeight:a=s,offsetX:c=0,offsetY:l=0,fillStyle:u="rgb(3, 6, 11)",frameMaskSettings:h=null}={}){if(!i)throw new Error("Failed to acquire the 2D context for FRAME mask.");if(i.clearRect(0,0,t,n),!Array.isArray(e)||e.length===0)return null;if(sa(h==null?void 0:h.shape)===ui)return h0(i,e,{canvasWidth:t,canvasHeight:n,frameSpaceWidth:r,frameSpaceHeight:s,logicalSpaceWidth:o,logicalSpaceHeight:a,offsetX:c,offsetY:l,fillStyle:u,frameMaskSettings:h});const d=u0(e,r,s,o,a,c,l,{frameMaskSettings:h});return d?(i.fillStyle=u,i.fillRect(0,0,t,n),i.globalCompositeOperation="destination-out",i.beginPath(),ku(i,d),i.fillStyle="#000",i.fill(),i.globalCompositeOperation="source-over",d):null}function d0(i,e,{canvasWidth:t,canvasHeight:n,frameSpaceWidth:r=t,frameSpaceHeight:s=n,logicalSpaceWidth:o=r,logicalSpaceHeight:a=s,offsetX:c=0,offsetY:l=0,strokeStyle:u="#ff674d",lineWidth:h=2,frameMaskSettings:d=null,trajectorySource:p=Ge}={}){if(!i)throw new Error("Failed to acquire the 2D context for FRAME trajectory.");const m=Nn(p);if(!Array.isArray(e)||e.length<2||m===Zt)return[];const f=Jh(e,d,o,a,{source:m}).map(g=>jr(g,r,s,o,a,c,l));if(f.length<2)return[];i.clearRect(0,0,t,n),i.beginPath(),i.moveTo(f[0].x,f[0].y);for(let g=1;g<f.length;g+=1)i.lineTo(f[g].x,f[g].y);return i.strokeStyle=u,i.lineWidth=h,i.lineJoin="round",i.lineCap="round",i.stroke(),p0(i,e,{canvasWidth:t,canvasHeight:n,frameSpaceWidth:r,frameSpaceHeight:s,logicalSpaceWidth:o,logicalSpaceHeight:a,offsetX:c,offsetY:l,strokeStyle:u,lineWidth:h,frameMaskSettings:d,trajectorySource:m}),f}function p0(i,e,{canvasWidth:t,canvasHeight:n,frameSpaceWidth:r=t,frameSpaceHeight:s=n,logicalSpaceWidth:o=r,logicalSpaceHeight:a=s,offsetX:c=0,offsetY:l=0,strokeStyle:u="#ff674d",lineWidth:h=2,frameMaskSettings:d=null,trajectorySource:p=Ge}={}){if(!i)return[];const m=Nn(p);if(!Array.isArray(e)||e.length<2||m===Zt)return[];const f=Qg(e,d,o,a,{source:m});if(f.length===0)return[];const y=Math.max(i0,Math.min(t,n)/r0)*.5,b=[];i.save(),i.strokeStyle=u,i.lineWidth=h,i.lineCap="round";for(const M of f){const v=jr(M.point,r,s,o,a,c,l),w={x:M.point.x+M.tangent.x,y:M.point.y+M.tangent.y},A=jr(w,r,s,o,a,c,l),_=A.x-v.x,x=A.y-v.y,k=Math.hypot(_,x);if(!(k>0))continue;const S=-x/k,T=_/k,P={x:v.x-S*y,y:v.y-T*y},N={x:v.x+S*y,y:v.y+T*y};i.beginPath(),i.moveTo(P.x,P.y),i.lineTo(N.x,N.y),i.stroke(),b.push({frameId:M.frameId,start:P,end:N,center:v})}return i.restore(),b}function X1(i,e,t,{name:n="Mask",opacity:r=.8,hidden:s=!0,fillStyle:o="rgb(3, 6, 11)",createCanvas:a=null,frameMaskSettings:c=null}={}){const l=$u(i,c);if(l.length===0)return null;const u=typeof a=="function"?a(e,t):(()=>{const d=document.createElement("canvas");return d.width=e,d.height=t,d})(),h=u.getContext("2d");return Eu(h,l,{canvasWidth:e,canvasHeight:t,fillStyle:o,frameMaskSettings:c}),{name:n,canvas:u,opacity:r,hidden:s}}function Y1(i,e,t,{name:n="Trajectory",opacity:r=1,strokeStyle:s="#ff674d",lineWidth:o=2,createCanvas:a=null,frameMaskSettings:c=null,trajectorySource:l=Ge}={}){const u=Nn(l);if(!Array.isArray(i)||i.length<2||u===Zt)return null;const h=typeof a=="function"?a(e,t):(()=>{const m=document.createElement("canvas");return m.width=e,m.height=t,m})(),d=h.getContext("2d");return d0(d,i,{canvasWidth:e,canvasHeight:t,strokeStyle:s,lineWidth:o,frameMaskSettings:c,trajectorySource:u}).length<2?null:{name:n,canvas:h,opacity:r}}const Tu=.1,Cu=4,m0=15,f0={"top-left":{x:0,y:0,affectsWidth:!0,affectsHeight:!0},top:{x:.5,y:0,affectsWidth:!1,affectsHeight:!0},"top-right":{x:1,y:0,affectsWidth:!0,affectsHeight:!0},right:{x:1,y:.5,affectsWidth:!0,affectsHeight:!1},"bottom-right":{x:1,y:1,affectsWidth:!0,affectsHeight:!0},bottom:{x:.5,y:1,affectsWidth:!1,affectsHeight:!0},"bottom-left":{x:0,y:1,affectsWidth:!0,affectsHeight:!0},left:{x:0,y:.5,affectsWidth:!0,affectsHeight:!1}},g0={"top-left":"bottom-right",top:"bottom","top-right":"bottom-left",right:"left","bottom-right":"top-left",bottom:"top","bottom-left":"top-right",left:"right"},y0={"top-left":"top-left","top-center":"top","top-right":"top-right","middle-left":"left",center:"","middle-right":"right","bottom-left":"bottom-left","bottom-center":"bottom","bottom-right":"bottom-right"},Xs=1e-6;function cr(i,e=.5){const t=Number(i);return Number.isFinite(t)?Math.min(1,Math.max(0,t)):e}function hr(i,e=.5){const t=Number(i);return Number.isFinite(t)?t:e}function $o(i){return i!==null&&typeof i=="object"}function mc(i,e,t,n){return Math.abs(i-0)<=Xs?e:Math.abs(i-.5)<=Xs?t:Math.abs(i-1)<=Xs?n:null}function _0(i,e=at.center){const t=$o(e)?{x:cr(e.x,.5),y:cr(e.y,.5)}:at.center;return typeof i=="string"?at[i]??t:$o(i)?{x:cr(i.x,t.x),y:cr(i.y,t.y)}:t}function Au(i){const e={x:hr(i==null?void 0:i.x,.5),y:hr(i==null?void 0:i.y,.5)};return typeof(i==null?void 0:i.anchor)=="string"?at[i.anchor]??e:$o(i==null?void 0:i.anchor)?{x:hr(i.anchor.x,e.x),y:hr(i.anchor.y,e.y)}:e}function Ma(i=at.center){const e=_0(i,at.center),t=mc(e.y,"top","middle","bottom"),n=mc(e.x,"left","center","right");if(!t||!n)return"";const r=t==="middle"&&n==="center"?"center":`${t}-${n}`;return y0[r]??""}function q1(i){return g0[i]??""}function Sa(i,e,t){const n=Math.cos(t),r=Math.sin(t);return{x:i*n-e*r,y:i*r+e*n}}function Fu(i,e,t){return Sa(i,e,-t)}function Z1(i,e){const t=Sa((e.x-.5)*i.width,(e.y-.5)*i.height,i.rotationRadians);return{x:i.centerX+t.x,y:i.centerY+t.y}}function J1(i,e,t){return{x:(i-t.boxLeft)/Math.max(t.boxWidth,1e-6),y:(e-t.boxTop)/Math.max(t.boxHeight,1e-6)}}function ur({left:i,top:e,width:t,height:n,localX:r,localY:s,anchorAx:o=.5,anchorAy:a=.5,rotationDeg:c=0}){const l=c*Math.PI/180,u={x:i+t*o,y:e+n*a},h=Sa((r-o)*t,(s-a)*n,l);return{x:u.x+h.x,y:u.y+h.y}}function K1({left:i,top:e,width:t,height:n,anchorAx:r=.5,anchorAy:s=.5,rotationDeg:o=0}){return[ur({left:i,top:e,width:t,height:n,localX:0,localY:0,anchorAx:r,anchorAy:s,rotationDeg:o}),ur({left:i,top:e,width:t,height:n,localX:1,localY:0,anchorAx:r,anchorAy:s,rotationDeg:o}),ur({left:i,top:e,width:t,height:n,localX:1,localY:1,anchorAx:r,anchorAy:s,rotationDeg:o}),ur({left:i,top:e,width:t,height:n,localX:0,localY:1,anchorAx:r,anchorAy:s,rotationDeg:o})]}function Q1(i){if(!Array.isArray(i)||i.length===0)return null;let e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY,n=Number.NEGATIVE_INFINITY,r=Number.NEGATIVE_INFINITY;for(const s of i)!Number.isFinite(s==null?void 0:s.x)||!Number.isFinite(s==null?void 0:s.y)||(e=Math.min(e,s.x),t=Math.min(t,s.y),n=Math.max(n,s.x),r=Math.max(r,s.y));return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n)||!Number.isFinite(r)?null:{left:e,top:t,right:n,bottom:r,width:Math.max(n-e,1e-6),height:Math.max(r-t,1e-6)}}function ew(i,e){const t=Au(i);return{x:e.boxLeft+t.x*e.boxWidth,y:e.boxTop+t.y*e.boxHeight,anchor:t}}function b0(i,e,t){const n=Au(i),r=Fu((n.x-i.x)*t.boxWidth,(n.y-i.y)*t.boxHeight,e.rotationRadians);return{x:.5+r.x/Math.max(e.width,1e-6),y:.5+r.y/Math.max(e.height,1e-6)}}function tw(i,e,t=at.center){const n=f0[e];if(!n)return null;const r={x:(n.x-t.x)*i.width,y:(n.y-t.y)*i.height},s=Math.hypot(r.x,r.y);return Number.isFinite(s)&&s>1e-6?{x:r.x/s,y:r.y/s,length:s}:null}function nw({pointerWorldX:i,pointerWorldY:e,anchorWorldX:t,anchorWorldY:n,rotationRadians:r,axisX:s,axisY:o,startProjectionDistance:a,startScale:c=1,fallbackScale:l=1}){if(!(Number.isFinite(a)&&Math.abs(a)>1e-6)||!(Number.isFinite(s)&&Number.isFinite(o)))return l;const u=Fu(i-t,e-n,r),h=u.x*s+u.y*o,d=c*(h/a);return Number.isFinite(d)?Math.min(Cu,Math.max(Tu,d)):l}function iw(i,e){const t=Number(i);if(!Number.isFinite(t))return 1;const n=(e??[]).filter(c=>Number.isFinite(c)&&c>0);if(n.length===0)return Math.max(.01,t);let r=0,s=Number.POSITIVE_INFINITY;for(const c of n)r=Math.max(r,Tu/c),s=Math.min(s,Cu/c);if(!(Number.isFinite(s)&&s>0))return Math.max(.01,t);const o=Math.max(r,.01),a=Math.max(s,o);return Math.min(a,Math.max(o,t))}function rw(i){let e=Number(i)||0;for(;e<=-180;)e+=360;for(;e>180;)e-=360;return e}function sw(i,e=m0){const t=Number(i),n=Number(e);return Number.isFinite(t)&&Number.isFinite(n)&&n>0?Math.round(t/n)*n:Number.isFinite(t)?t:0}const fc=15,x0={top:0,"top-right":45,right:90,"bottom-right":135,bottom:180,"bottom-left":225,left:270,"top-left":315},Ys=new Map;function v0(i){const e=Number.isFinite(i)?i%360:0;return e<0?e+360:e}function w0(i){return Math.round(v0(i)/fc)*fc}function M0(i){return`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${i} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#ffffff" stroke-width="4.8" />
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#111111" stroke-width="1.9" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim()}function ko(i=0,e="top"){const t=x0[e]??0,n=w0(i+t);if(!Ys.has(n)){const r=encodeURIComponent(M0(n));Ys.set(n,`url("data:image/svg+xml,${r}") 16 16, grab`)}return Ys.get(n)}const Eo=Math.PI*2,To=88,Ru=28,Pu=126,S0=1.28,$0=Object.freeze(["tool-select","tool-reference","toggle-reference-preview","tool-transform","tool-pivot","adjust-lens","frame-create","frame-mask-toggle","toggle-view-mode","clear-selection"]);function k0(i){const e=Eo/i.length;return i.map((t,n)=>({id:t,angle:-Math.PI/2+e*n}))}const E0=Object.freeze(k0($0));function ow({coarse:i=!1}={}){const e=i?S0:1;return{coarse:i,radius:To*e,innerRadius:Ru*e,outerRadius:Pu*e}}function T0({mode:i,t:e,viewportToolMode:t="none",viewportOrthographic:n=!1,referencePreviewSessionVisible:r=!0,hasReferenceImages:s=!1,frameMaskMode:o="off"}){const a=o==="selected"||o==="all";return E0.map(c=>{switch(c.id){case"tool-select":return{...c,icon:"cursor",label:e("transformMode.select"),active:t==="select"};case"tool-reference":return{...c,icon:"reference-tool",label:e("transformMode.reference"),active:t==="reference"};case"toggle-reference-preview":return{...c,icon:r?"reference-preview-on":"reference-preview-off",label:e(r?"action.hideReferenceImages":"action.showReferenceImages"),active:s&&r,disabled:!s};case"tool-transform":return{...c,icon:"move",label:e("transformMode.transform"),active:t==="transform"};case"tool-pivot":return{...c,icon:"pivot",label:e("transformMode.pivot"),active:t==="pivot"};case"adjust-lens":return{...c,icon:"camera-dslr",label:e("action.adjustLens"),disabled:i==="viewport"&&n};case"frame-create":return{...c,icon:"frame-plus",label:e("action.newFrame")};case"frame-mask-toggle":return{...c,icon:"mask",label:e(a?"action.disableFrameMask":"action.enableFrameMask"),active:i==="camera"&&a,disabled:i!=="camera"};case"toggle-view-mode":return i==="camera"?{...c,icon:"viewport",label:e("mode.viewport")}:{...c,icon:"camera",label:e("mode.camera")};case"clear-selection":return{...c,icon:"selection-clear",label:e("action.clearSelection")};default:return{...c,icon:"slash-circle",label:c.id}}})}function C0(i){let e=i;for(;e<=-Math.PI;)e+=Eo;for(;e>Math.PI;)e-=Eo;return e}function aw({x:i,y:e,centerX:t,centerY:n,actions:r,innerRadius:s=Ru,outerRadius:o=Pu}){const a=i-t,c=e-n,l=Math.hypot(a,c);if(l<s||l>o)return null;const u=Math.atan2(c,a);let h=null,d=Number.POSITIVE_INFINITY;for(const p of r){const m=Math.abs(C0(u-p.angle));m<d&&(d=m,h=p.id)}return h}function A0(i,e){var u,h,d,p,m,f,g,y,b,M,v,w,A,_,x,k;const t=((p=(d=(h=(u=i.project)==null?void 0:u.name)==null?void 0:h.value)==null?void 0:d.trim)==null?void 0:p.call(d))??"",n=t||e("project.untitled"),r=!!((f=(m=i.project)==null?void 0:m.dirty)!=null&&f.value),s=!!((y=(g=i.project)==null?void 0:g.packageDirty)!=null&&y.value),o=(((M=(b=i.sceneAssets)==null?void 0:b.value)==null?void 0:M.length)??0)>0,a=(((A=(w=(v=i.referenceImages)==null?void 0:v.items)==null?void 0:w.value)==null?void 0:A.length)??0)>0,c=(((k=(x=(_=i.workspace)==null?void 0:_.shotCameras)==null?void 0:x.value)==null?void 0:k.length)??0)>1;return{projectDisplayName:n,projectDirty:r,showProjectPackageDirty:s&&(r||o||a||c||!!t)}}function Qn(i,e=0){return Number(i).toFixed(e)}function lw(i=null){const e=Oy(),t=R(e),n=R(gy),r=R(vy()),s=R(r.value[0].id),o=R(Cy()),a=R(o.value[0].id),c=R(Fg),l=R(!1),u=R(vu),h=R(Ei),d=R(wa),p=R(es),m=R({...ai}),f=R("navigate"),g=R("world"),y=R("none"),b=R(!1),M=R(null),v=R(null),w=R(null),A=R(null),_=R(""),x=R({contextKind:"viewport",start:{visible:!1,x:0,y:0},end:{visible:!1,x:0,y:0},draftEnd:{visible:!1,x:0,y:0},lineVisible:!1,lineUsesDraft:!1,chip:{visible:!1,x:0,y:0,label:"",placement:"above"},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}),k=L(()=>y.value==="select"),S=L(()=>y.value==="reference"),T=L(()=>y.value==="pivot"),P=L(()=>y.value==="transform"),N=L(()=>y.value==="splat-edit"),H=R("box"),F=R([]),O=R([]),G=R(0),ne=R(30),Z=R("depth"),B=R(.2),j=R(!1),le=R({visible:!1,x:0,y:0,radiusPx:0,painting:!1,subtract:!1}),xe=R(!1),st=R({x:0,y:0,z:0}),D=R({x:1,y:1,z:1}),X=R({x:0,y:0,z:0,w:1}),Q=R({x:null,y:null}),V=R({mode:"",hitCount:0}),_e=R(!1),ze=R(!1),Ne=R(!1),C=L(()=>_e.value||ze.value&&!Ne.value),z=R(""),U=R({open:!1,x:0,y:0,hoveredActionId:null,coarse:!1,radius:88,innerRadius:28,outerRadius:126}),te=R({visible:!1,x:0,y:0,mmLabel:"",fovLabel:""}),$t=R({visible:!1,x:0,y:0,angleLabel:""}),Kt=R(Ue(e,"scene.badgeEmpty")),Ci=R(Eg),oe=R(Ue(e,"scene.summaryEmpty")),Se=R(Ue(e,"scene.scaleDefault")),Be=R([]),Ee=R(Mu()),is=R(py()),rs=R(!0),On=R(!0),Ln=R(""),ju=R(""),Vu=R([]),Uu=R([]),Hu=R([]),Gu=R(0),Wu=R([]),Xu=R(""),Yu=R(""),qu=R([]),Zu=R(null),Ju=R(null),Ku=R(null),Qu=R([]),$a=R(null),ed=L(()=>Be.value.find(I=>I.id===$a.value)??null),td=R(""),nd=R(Ue(e,"status.ready")),id=R(""),rd=R(!1),sd=R(!0),od=R(null),ad=R(!1),ld=R("getting-started"),cd=R(null),hd=R(""),ud=R("ja"),dd=R(!1),ka=R("export.idle"),pd=R(Ue(e,"exportSummary.empty")),md=R("current"),Ea=R([]),fd=R(uo),Ta=R(po),gd=R(0),yd=R(0),_d=R(0),bd=R(0),xd=R(0),vd=R(0),Ca=L(()=>Fy(r.value,s.value)),ie=L(()=>Py(o.value,a.value)),wd=R(!1),Md=R([]),Sd=R(null),$d=R(null),kd=R(!1),Ed=R(!1),Td=R(!1),ss=L(()=>{var I;return((I=ie.value)==null?void 0:I.frames)??[]}),os=L(()=>{var I;return Dy(ss.value,((I=ie.value)==null?void 0:I.activeFrameId)??null)}),Cd=L(()=>{var I;return((I=os.value)==null?void 0:I.id)??""}),Ad=L(()=>ss.value.length),Fd=L(()=>{var I,W,Ye;return xa(((I=ie.value)==null?void 0:I.frames)??[],((Ye=(W=ie.value)==null?void 0:W.frameMask)==null?void 0:Ye.selectedIds)??[])}),Rd=L(()=>Ca.value.role),as=L(()=>{var I;return((I=ie.value)==null?void 0:I.lens.baseFovX)??Uh}),ls=L(()=>{var I;return((I=ie.value)==null?void 0:I.outputFrame.widthScale)??1}),cs=L(()=>{var I;return((I=ie.value)==null?void 0:I.outputFrame.heightScale)??1}),Aa=L(()=>{var I;return((I=ie.value)==null?void 0:I.outputFrame.viewZoom)??1}),Pd=L(()=>{var I;return((I=ie.value)==null?void 0:I.outputFrame.anchor)??"center"}),Fa=L(()=>{var I;return((I=ie.value)==null?void 0:I.clipping.mode)??"auto"}),Id=L(()=>{var I;return((I=ie.value)==null?void 0:I.clipping.near)??uo}),Dd=L(()=>{var I;return((I=ie.value)==null?void 0:I.clipping.far)??po}),zd=L(()=>Id.value),Nd=L(()=>Fa.value==="manual"?Dd.value:Ta.value),Bd=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.exportSettings)==null?void 0:W.exportName)??""}),Od=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.exportSettings)==null?void 0:W.exportFormat)??"psd"}),Ld=L(()=>{var I,W;return!!((W=(I=ie.value)==null?void 0:I.exportSettings)!=null&&W.exportGridOverlay)}),jd=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.exportSettings)==null?void 0:W.exportGridLayerMode)==="overlay"?"overlay":"bottom"}),Vd=L(()=>{var I,W;return!!((W=(I=ie.value)==null?void 0:I.exportSettings)!=null&&W.exportModelLayers)}),Ud=L(()=>{var I,W,Ye,jn;return!!((W=(I=ie.value)==null?void 0:I.exportSettings)!=null&&W.exportModelLayers)&&!!((jn=(Ye=ie.value)==null?void 0:Ye.exportSettings)!=null&&jn.exportSplatLayers)}),Hd=L(()=>{var I,W;return!!((W=(I=ie.value)==null?void 0:I.navigation)!=null&&W.rollLock)}),Gd=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.mode)??"off"}),Wd=L(()=>{var I,W,Ye,jn;return va((W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.mode,(jn=(Ye=ie.value)==null?void 0:Ye.frameMask)==null?void 0:jn.preferredMode)}),Xd=L(()=>{var I,W;return Number.isFinite((W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.opacityPct)?ie.value.frameMask.opacityPct:80}),Yd=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.shape)??"bounds"}),qd=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.trajectoryMode)??"line"}),Zd=L(()=>{var I,W;return((W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.trajectoryExportSource)??"none"}),Jd=L(()=>{var I,W,Ye;return((Ye=(W=(I=ie.value)==null?void 0:I.frameMask)==null?void 0:W.trajectory)==null?void 0:Ye.nodesByFrameId)??{}}),Kd=L(()=>{var I,W;return ca((I=ie.value)==null?void 0:I.frameMask,(W=os.value)==null?void 0:W.id)}),Ra=L(()=>Math.max(64,Math.round(it.width*ls.value))),Pa=L(()=>Math.max(64,Math.round(it.height*cs.value))),Qd=L(()=>`${Ra.value} × ${Pa.value}`),ep=L(()=>Ee.value.ambient),tp=L(()=>Ee.value.modelLight.enabled),np=L(()=>Ee.value.modelLight.intensity),ip=L(()=>Ee.value.modelLight.azimuthDeg),rp=L(()=>Ee.value.modelLight.elevationDeg),sp=L(()=>Ea.value.length),op=L(()=>Ue(t.value,Ny(Ca.value))),ap=L(()=>Ue(t.value,ka.value)),lp=L(()=>`${Qn(mo(as.value),1)}°`),cp=L(()=>Number(ic(as.value).toFixed(2))),hp=L(()=>`${Qn(mo(c.value),1)}°`),up=L(()=>Number(ic(c.value).toFixed(2))),dp=L(()=>`${Qn(ls.value*100,0)}%`),pp=L(()=>`${Qn(cs.value*100,0)}%`),mp=L(()=>`${Qn(Aa.value*100,0)}%`);return{runtime:i,locale:t,workspace:{layout:n,panes:r,activePaneId:s,shotCameras:o,activeShotCameraId:a,activeShotCamera:ie},workbenchCollapsed:C,workbenchManualCollapsed:_e,workbenchAutoCollapsed:ze,workbenchManualExpanded:Ne,viewportPieMenu:U,viewportLensHud:te,viewportRollHud:$t,interactionMode:f,viewportBaseFovX:c,viewportBaseFovXDirty:l,viewportProjectionMode:u,viewportOrthoView:h,viewportOrthoSize:d,viewportOrthoDistance:p,viewportOrthoFocus:m,viewportToolMode:y,viewportTransformSpace:g,viewportSelectMode:k,viewportReferenceImageEditMode:S,viewportPivotEditMode:T,viewportTransformMode:P,viewportSplatEditMode:N,splatEdit:{active:N,tool:H,scopeAssetIds:F,rememberedScopeAssetIds:O,selectionCount:G,brushSize:ne,brushDepthMode:Z,brushDepth:B,brushDepthBarVisible:j,brushPreview:le,boxPlaced:xe,boxCenter:st,boxSize:D,boxRotation:X,hudPosition:Q,lastOperation:V},measurement:{active:b,startPointWorld:M,endPointWorld:v,draftEndPointWorld:w,selectedPointKey:A,lengthInputText:_,overlay:x},mode:Rd,baseFovX:as,renderBox:{widthScale:ls,heightScale:cs,viewZoom:Aa,anchor:Pd},shotCamera:{clippingMode:Fa,near:zd,far:Nd,nearLive:fd,farLive:Ta,positionX:gd,positionY:yd,positionZ:_d,yawDeg:bd,pitchDeg:xd,rollDeg:vd,rollLock:Hd,exportName:Bd,exportFormat:Od,exportGridOverlay:Ld,exportGridLayerMode:jd,exportModelLayers:Vd,exportSplatLayers:Ud},frames:{documents:ss,active:os,activeId:Cd,count:Ad,selectionActive:wd,selectedIds:Md,selectionAnchor:Sd,selectionBoxLogical:$d,trajectoryEditMode:kd,maskSelectedIds:Fd,maskMode:Gd,maskPreferredMode:Wd,maskOpacityPct:Xd,maskShape:Yd,trajectoryMode:qd,trajectoryExportSource:Zd,trajectoryNodeMode:Kd,trajectoryNodesByFrameId:Jd},history:{canUndo:Ed,canRedo:Td},remoteUrl:z,sceneBadge:Kt,sceneUnitBadge:Ci,sceneSummary:oe,sceneScaleSummary:Se,sceneAssets:Be,lighting:{state:Ee,ambient:ep,modelLightEnabled:tp,modelLightIntensity:np,modelLightAzimuthDeg:ip,modelLightElevationDeg:rp},referenceImages:{document:is,previewSessionVisible:rs,exportSessionEnabled:On,panelPresetId:Ln,panelPresetName:ju,presets:Vu,items:Uu,assets:Hu,assetCount:Gu,previewLayers:Wu,selectedAssetId:Xu,selectedItemId:Yu,selectedItemIds:qu,selectionAnchor:Zu,selectionBoxLogical:Ju,selectionBoxScreen:Ku},selectedSceneAssetIds:Qu,selectedSceneAssetId:$a,selectedSceneAsset:ed,cameraSummary:td,statusLine:nd,project:{name:id,dirty:rd,packageDirty:sd},overlay:od,help:{open:ad,sectionId:ld,anchor:cd,searchQuery:hd,lang:ud},exportBusy:dd,exportStatusKey:ka,exportStatusLabel:ap,exportSummary:pd,exportOptions:{target:md,presetIds:Ea,presetCount:sp},exportWidth:Ra,exportHeight:Pa,exportSizeLabel:Qd,modeLabel:op,fovLabel:lp,equivalentMmValue:cp,viewportFovLabel:hp,viewportEquivalentMmValue:up,widthLabel:dp,heightLabel:pp,zoomLabel:mp}}function gc(i=[]){return Object.fromEntries(i.map(e=>[e.id,e.value??""]))}function F0(i,e,t){var n;return(n=i==null?void 0:i.fields)!=null&&n.length?$`
		<div class="overlay-field-list">
			${i.fields.map(r=>{const s=typeof r.disabled=="function"?!!r.disabled(e):!!r.disabled;return r.type==="checkbox"?$`
						<label class="overlay-checkbox-field">
							<input
								type="checkbox"
								checked=${!!e[r.id]}
								disabled=${s}
								onChange=${o=>t(a=>({...a,[r.id]:o.currentTarget.checked}))}
							/>
							<span>${r.label}</span>
						</label>
					`:r.type==="select"?$`
						<label class="overlay-field">
							<span>${r.label}</span>
							<select
								value=${String(e[r.id]??"")}
								disabled=${s}
								onChange=${o=>t(a=>({...a,[r.id]:o.currentTarget.value}))}
							>
								${(r.options??[]).map(o=>$`
										<option value=${o.value}>${o.label}</option>
									`)}
							</select>
						</label>
					`:$`
					<label class="overlay-field">
						<span>${r.label}</span>
						<input
							type=${r.type??"text"}
							value=${String(e[r.id]??"")}
							disabled=${s}
							onInput=${o=>t(a=>({...a,[r.id]:o.currentTarget.value}))}
						/>
					</label>
				`})}
		</div>
	`:null}function R0(i,e={},t=!1){var n;return(n=i==null?void 0:i.actions)!=null&&n.length?$`
		<div class="overlay-card__actions">
			${i.actions.map(r=>$`
					<button
						type="button"
						class=${r.primary?"button button--primary":"button"}
						disabled=${!!r.disabled||t}
						onClick=${async()=>{var s,o;if(r.submit){await((s=i.onSubmit)==null?void 0:s.call(i,e));return}await((o=r.onClick)==null?void 0:o.call(r,e))}}
					>
						${r.label}
					</button>
				`)}
		</div>
	`:null}function P0(i){if(!Number.isFinite(i)||i<0)return"";if(i<60)return`${i}s`;const e=Math.floor(i/60),t=i%60;return`${e}m ${String(t).padStart(2,"0")}s`}function I0(i,e=Date.now()){var a,c,l,u;const t=((a=i.steps)==null?void 0:a.length)??0,n=((c=i.steps)==null?void 0:c.filter(h=>h.status==="done").length)??0,r=t>0?(n+.5)/t*100:null,s=i.startedAt?Math.max(0,Math.floor((e-i.startedAt)/1e3)):null,o=(Math.floor(e/400)%3+1).toString();return $`
		${r!=null&&$`
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
		${i.detail&&$`<p class="overlay-card__detail">${i.detail}</p>`}
		${i.phaseLabel&&$`
				<div class="overlay-phase">
					<div class="overlay-phase__header">
						<strong class="overlay-phase__title">${i.phaseLabel}</strong>
						${i.phaseDetail&&$`
								<span class="overlay-phase__detail">${i.phaseDetail}</span>
							`}
					</div>
					${((l=i.phases)==null?void 0:l.length)>0&&$`
							<ol class="overlay-phase-list">
								${i.phases.map(h=>$`
										<li class=${`overlay-phase-step overlay-phase-step--${h.status}`}>
											<span class="overlay-phase-step__marker" aria-hidden="true"></span>
											<span class="overlay-phase-step__label">${h.label}</span>
										</li>
									`)}
							</ol>
						`}
				</div>
			`}
		${s!=null&&$`
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
						${P0(s)}
					</span>
				</div>
			`}
		${((u=i.steps)==null?void 0:u.length)>0&&$`
				<ol class="overlay-step-list">
					${i.steps.map(h=>$`
							<li class=${`overlay-step overlay-step--${h.status}`}>
								<span class="overlay-step__label">${h.label}</span>
							</li>
						`)}
				</ol>
			`}
	`}function D0(i){var e,t;return!i.detail&&!((e=i.urls)!=null&&e.length)?null:$`
		<details class="overlay-card__details">
			<summary>${i.detailLabel||"Details"}</summary>
			${((t=i.urls)==null?void 0:t.length)>0&&$`
					<ul class="overlay-url-list">
						${i.urls.map(n=>$`
								<li>
									<code>${n}</code>
								</li>
							`)}
					</ul>
				`}
			${i.detail&&$`<pre class="overlay-card__error-detail">${i.detail}</pre>`}
		</details>
	`}function cw({overlay:i}){var c;const[e,t]=ge(gc(i==null?void 0:i.fields)),[n,r]=ge(!1),[s,o]=ge(()=>Date.now());if(De(()=>{t(gc(i==null?void 0:i.fields)),r(!1)},[i]),De(()=>{if((i==null?void 0:i.kind)!=="progress"||!(i!=null&&i.startedAt))return;const l=globalThis.setInterval(()=>{o(Date.now())},400);return()=>globalThis.clearInterval(l)},[i==null?void 0:i.kind,i==null?void 0:i.startedAt]),!i)return null;const a={...i,onSubmit:typeof i.onSubmit=="function"?async l=>{r(!0);try{await i.onSubmit(l)}finally{r(!1)}}:null};return $`
		<div class="app-overlay" role="presentation">
			<div
				class="overlay-card"
				role=${i.kind==="error"?"alertdialog":"dialog"}
				aria-modal="true"
			>
				<div class="overlay-card__header">
					<h2>${i.title}</h2>
				</div>
				${i.message&&$`<p class="overlay-card__message">${i.message}</p>`}
				${i.kind==="confirm"&&((c=i.urls)==null?void 0:c.length)>0&&$`
						<ul class="overlay-url-list">
							${i.urls.map(l=>$`
									<li>
										<code>${l}</code>
									</li>
								`)}
						</ul>
					`}
				${F0(i,e,t)}
				${i.kind==="progress"?I0(i,s):null}
				${i.kind==="error"?D0(i):null}
				${R0(a,e,n)}
			</div>
		</div>
	`}const z0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.9 8.7L9.4 6.1l4.5 2.6v5.4l-4.5 2.6-4.5-2.6zM9.4 6.1v10.6M4.9 8.7l4.5 2.6 4.5-2.6M11.8 14.8l3 3 6-6" />
    </g>
</svg>
`,N0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g transform="translate(-1.2 1.5) scale(1.5)">
      <path d="M2 6C2 4.89543 2.89543 4 4 4H8.66667C9.77124 4 10.6667 4.89543 10.6667 6V10C10.6667 11.1046 9.77124 12 8.66667 12H4C2.89543 12 2 11.1046 2 10V6ZM4 5.33333C3.63181 5.33333 3.33333 5.63181 3.33333 6V10C3.33333 10.3682 3.63181 10.6667 4 10.6667H8.66667C9.03486 10.6667 9.33333 10.3682 9.33333 10V6C9.33333 5.63181 9.03486 5.33333 8.66667 5.33333H4Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" />
      <path d="M12.8153 4.92867C12.7625 4.95108 12.7139 4.98191 12.6678 5.01591L11.3333 6V10L12.6678 10.9841C12.7139 11.0181 12.7625 11.0489 12.8153 11.0713C13.6837 11.4404 14.6667 10.8048 14.6667 9.84262V6.15738C14.6667 5.19521 13.6837 4.55957 12.8153 4.92867Z" fill="currentColor" stroke="none" />
    </g>
</svg>
`,B0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
      <path d="M7 8.5h10M7 12h10M7 15.5h6" />
      <path d="M14.5 18.5l2.5-2.5" />
      <circle cx="18.2" cy="16.8" r="2.3" />
    </g>
</svg>
`,O0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,L0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g transform="translate(-1.2 1.5) scale(1.5)">
      <path d="M2 6C2 4.89543 2.89543 4 4 4H8.66667C9.77124 4 10.6667 4.89543 10.6667 6V10C10.6667 11.1046 9.77124 12 8.66667 12H4C2.89543 12 2 11.1046 2 10V6ZM4 5.33333C3.63181 5.33333 3.33333 5.63181 3.33333 6V10C3.33333 10.3682 3.63181 10.6667 4 10.6667H8.66667C9.03486 10.6667 9.33333 10.3682 9.33333 10V6C9.33333 5.63181 9.03486 5.33333 8.66667 5.33333H4Z" fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" />
      <path d="M12.8153 4.92867C12.7625 4.95108 12.7139 4.98191 12.6678 5.01591L11.3333 6V10L12.6678 10.9841C12.7139 11.0181 12.7625 11.0489 12.8153 11.0713C13.6837 11.4404 14.6667 10.8048 14.6667 9.84262V6.15738C14.6667 5.19521 13.6837 4.55957 12.8153 4.92867Z" fill="currentColor" stroke="none" />
    </g>
</svg>
`,j0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 5l-6 7 6 7" />
    </g>
</svg>
`,V0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 5l6 7-6 7" />
    </g>
</svg>
`,U0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.8 1.8" />
    </g>
</svg>
`,H0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 6l12 12M18 6l-12 12" />
    </g>
</svg>
`,G0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="7" width="8" height="10" rx="1.5" />
      <path d="M13 12h3.5M15.2 9.8l2.3 2.2-2.3 2.2M15.5 8.5h3l1.6-1.6h1.4v10.2h-1.4L18.5 15.5h-3" />
      <circle cx="18.3" cy="12" r="1.5" />
    </g>
</svg>
`,W0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.8 12H5.3M6.8 9.8L4.5 12l2.3 2.2M4.8 8.5h3l1.6-1.6h1.4v10.2H9.4L7.8 15.5h-3" />
      <circle cx="7.7" cy="12" r="1.5" />
      <rect x="12.5" y="7" width="8" height="10" rx="1.5" />
    </g>
</svg>
`,X0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 4.5l7.2 16.8 2.2-6.1 6.1-2.2-15.5-8.5z" />
    </g>
</svg>
`,Y0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
    </g>
</svg>
`,q0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v11M8.5 10.5L12 14l3.5-3.5M5 21h14M7.5 17.5v3.5M16.5 17.5v3.5" />
  </g>
</svg>
`,Z0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M7 5.5h6.5a2 2 0 0 1 2 2V9" />
  <path d="M7 18.5h6.5a2 2 0 0 0 2-2V15" />
  <path d="M7 5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2" />
  <path d="M10.5 12H20" />
  <path d="m16.5 8.5 3.5 3.5-3.5 3.5" />
</svg>
`,J0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3l18 18M10.6 5.2A11.7 11.7 0 0 1 12 5c6.2 0 10 7 10 7a18.3 18.3 0 0 1-4 4.8M6.1 6.1C3.6 8 2 12 2 12s3.8 7 10 7c1.7 0 3.3-.5 4.7-1.2M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </g>
</svg>
`,K0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </g>
</svg>
`,Q0=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 8.5h6l2 2H21v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h3" />
    </g>
</svg>
`,e_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,t_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 9h16M4 15h16" />
    </g>
</svg>
`,n_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="currentColor" stroke="none">
      <circle cx="9" cy="7.5" r="0.9" />
      <circle cx="15" cy="7.5" r="0.9" />
      <circle cx="9" cy="12" r="0.9" />
      <circle cx="15" cy="12" r="0.9" />
      <circle cx="9" cy="16.5" r="0.9" />
      <circle cx="15" cy="16.5" r="0.9" />
    </g>
</svg>
`,i_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <path d="M9.2 9.5a2.8 2.8 0 1 1 4.1 2.3c-0.9 0.5-1.4 1.2-1.4 2.4"/>
  <circle cx="12" cy="17.4" r="0.6" fill="currentColor" stroke="none"/>
</svg>
`,r_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15 16 10 5 21" />
    </g>
</svg>
`,s_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
      <path d="M19 12h2" />
      <path d="M3 12h2" />
    </g>
</svg>
`,o_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.2 2.2M16.6 16.6l2.2 2.2M18.8 5.2l-2.2 2.2M7.4 16.6l-2.2 2.2" />
    </g>
</svg>
`,a_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.5 14.5l5-5M7.8 9.2l-1.9 1.9a3.5 3.5 0 0 0 5 5l1.9-1.9M16.2 14.8l1.9-1.9a3.5 3.5 0 0 0-5-5l-1.9 1.9" />
    </g>
</svg>
`,l_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="11" width="11" height="8" rx="2" />
      <path d="M15 11V8.5a3 3 0 0 0-5.4-1.8" />
    </g>
</svg>
`,c_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6.5" y="11" width="11" height="8" rx="2" />
      <path d="M9 11V8.5a3 3 0 0 1 6 0V11" />
    </g>
</svg>
`,h_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M7.7 8.6h8.6v6.8h-8.6z" fill="currentColor" stroke="none" fill-rule="evenodd" />
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5.6 8v8M18.4 8v8" />
    </g>
</svg>
`,u_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M5.9 8.3h5.2v7.4h-5.2z M12.9 8.3h5.2v7.4h-5.2z" fill="currentColor" stroke="none" fill-rule="evenodd" />
</svg>
`,d_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M3.5 5h17v14h-17z M7 8.1h10v7.8h-10z" fill="currentColor" stroke="none" fill-rule="evenodd" />
</svg>
`,p_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
</svg>
`,m_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v18M3 12h18M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2M3 12l2-2M3 12l2 2M21 12l-2-2M21 12l-2 2" />
    </g>
</svg>
`,f_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5zM4 7.5V16.5L12 21l8-4.5V7.5M12 12v9M8.5 5.8L12 7.8l3.5-2" />
    </g>
</svg>
`,g_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4.5-8 4.5-8-4.5 8-4.5zM4 7.5V16.5L12 21l8-4.5V7.5M12 12v9" />
    </g>
</svg>
`,y_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3.5v3M20.5 12h-3M12 20.5v-3M3.5 12h3M17.8 6.2l-2.1 2.1M17.8 17.8l-2.1-2.1M6.2 17.8l2.1-2.1M6.2 6.2l2.1 2.1" />
    </g>
</svg>
`,__=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 5h8M10 5v5l-2 3h8l-2-3V5M12 13v6" />
    </g>
</svg>
`,b_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3M12 21v-2M19 12h2M3 12h2" />
    </g>
</svg>
`,x_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12h14" />
    </g>
</svg>
`,v_=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 7L19 11L15 15" />
  <path d="M19 11H11C7.134 11 4 14.134 4 18C4 18.682 4.098 19.341 4.28 19.964" />
</svg>
`,w_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,M_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,S_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,$_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <path d="M5 10h14" />
      <path d="M9 6v12" />
      <circle cx="5" cy="6" r="1.25" />
      <circle cx="19" cy="18" r="1.25" />
    </g>
</svg>
`,k_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </g>
</svg>
`,E_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18.2 9.3A7.5 7.5 0 1 0 19.2 12.8M18.2 5.2v3.9h-3.9" />
    </g>
</svg>
`,T_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <g transform="rotate(-45 12 12)">
    <rect x="3.2" y="8.15" width="17.6" height="7.7" rx="0.72" />
    <path d="M5.75 8.15v4.65M8.75 8.15v2.85M11.75 8.15v4.65M14.75 8.15v2.85M17.75 8.15v4.65" />
  </g>
</svg>
`,C_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 4h12l2 2v14H5zM8 4v5h7V4" />
      <rect x="8" y="14" width="8" height="5" rx="1" />
    </g>
</svg>
`,A_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3.5l7 4-7 4-7-4 7-4z" />
      <path d="M5 11.5l7 4 7-4" />
      <path d="M5 15.5l7 4 7-4" />
    </g>
</svg>
`,F_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" />
    </g>
</svg>
`,R_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
`,P_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M7 17l10-10" />
    </g>
</svg>
`,I_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 12h8l1-12M10 11v5M14 11v5" />
    </g>
</svg>
`,D_=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 7L5 11L9 15" />
  <path d="M5 11H13C16.866 11 20 14.134 20 18C20 18.682 19.902 19.341 19.72 19.964" />
</svg>
`,z_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3.5" />
    </g>
</svg>
`,N_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9.5h17M8.5 5v14" />
    </g>
</svg>
`,B_=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10.5" cy="10.5" r="5" />
      <path d="M14.2 14.2L19.5 19.5" />
      <path d="M10.5 8v5" />
      <path d="M8 10.5h5" />
    </g>
</svg>
`,O_=Object.assign({"./svg/apply-transform.svg":z0,"./svg/camera-dslr.svg":N0,"./svg/camera-frames.svg":B0,"./svg/camera-property.svg":O0,"./svg/camera.svg":L0,"./svg/chevron-left.svg":j0,"./svg/chevron-right.svg":V0,"./svg/clock.svg":U0,"./svg/close.svg":H0,"./svg/copy-to-camera.svg":G0,"./svg/copy-to-viewport.svg":W0,"./svg/cursor.svg":X0,"./svg/duplicate.svg":Y0,"./svg/export-tab.svg":q0,"./svg/export.svg":Z0,"./svg/eye-off.svg":J0,"./svg/eye.svg":K0,"./svg/folder-open.svg":Q0,"./svg/frame-plus.svg":e_,"./svg/frame.svg":t_,"./svg/grip.svg":n_,"./svg/help.svg":i_,"./svg/image.svg":r_,"./svg/lens.svg":s_,"./svg/light.svg":o_,"./svg/link.svg":a_,"./svg/lock-open.svg":l_,"./svg/lock.svg":c_,"./svg/mask-all.svg":h_,"./svg/mask-selected.svg":u_,"./svg/mask.svg":d_,"./svg/menu.svg":p_,"./svg/move.svg":m_,"./svg/package-open.svg":f_,"./svg/package.svg":g_,"./svg/pie-menu.svg":y_,"./svg/pin.svg":__,"./svg/pivot.svg":b_,"./svg/plus.svg":x_,"./svg/redo.svg":v_,"./svg/reference-preview-off.svg":w_,"./svg/reference-preview-on.svg":M_,"./svg/reference-tool.svg":S_,"./svg/reference.svg":$_,"./svg/render-box.svg":k_,"./svg/reset.svg":E_,"./svg/ruler.svg":T_,"./svg/save.svg":C_,"./svg/scene.svg":A_,"./svg/scrub.svg":F_,"./svg/selection-clear.svg":R_,"./svg/slash-circle.svg":P_,"./svg/trash.svg":I_,"./svg/undo.svg":D_,"./svg/view.svg":z_,"./svg/viewport.svg":N_,"./svg/zoom.svg":B_}),yc="workbench-icon-sprite-host";let qs="",_c=!1;function Co(i){return String(i).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function L_(i){const e=i.match(/\/([^/]+)\.svg$/i);return e?e[1]:null}function j_(i=""){var r;let e=i.replace(/\s+xmlns(?::[\w-]+)?=(["']).*?\1/gi,"").replace(/\s+width=(["']).*?\1/gi,"").replace(/\s+height=(["']).*?\1/gi,"").replace(/\s+viewBox=(["']).*?\1/gi,"").replace(/\s+aria-hidden=(["']).*?\1/gi,"").replace(/\s+focusable=(["']).*?\1/gi,"");const t=e.match(/\sstroke-width=(["'])(.*?)\1/i),n=((r=t==null?void 0:t[2])==null?void 0:r.trim())||"1.8";return e=e.replace(/\sstroke-width=(["']).*?\1/gi,` stroke-width="var(--workbench-icon-stroke-width, ${Co(n)})"`),/\sfill=/i.test(e)||(e+=' fill="none"'),/\sstroke=/i.test(e)||(e+=' stroke="currentColor"'),/\sstroke-width=/i.test(e)||(e+=' stroke-width="var(--workbench-icon-stroke-width, 1.8)"'),/\sstroke-linecap=/i.test(e)||(e+=' stroke-linecap="round"'),/\sstroke-linejoin=/i.test(e)||(e+=' stroke-linejoin="round"'),e.trim()}function V_(i,e){const t=e.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);if(!t)return"";const[,n,r]=t,s=n.match(/\sviewBox=(["'])(.*?)\1/i),o=(s==null?void 0:s[2])||"0 0 24 24",a=j_(n);return`<symbol id="${Co(i)}" viewBox="${Co(o)}"${a?` ${a}`:""}>${r.trim()}</symbol>`}function U_(){return`<svg xmlns="http://www.w3.org/2000/svg">${Object.entries(O_).map(([e,t])=>[L_(e),t]).filter(([e,t])=>!!e&&typeof t=="string").map(([e,t])=>V_(e,t)).filter(Boolean).join("")}</svg>`}function H_(){if(_c||typeof document>"u")return;qs||(qs=U_());let i=document.getElementById(yc);i||(i=document.createElement("div"),i.id=yc,i.setAttribute("aria-hidden","true"),i.style.position="absolute",i.style.width="0",i.style.height="0",i.style.overflow="hidden",i.style.pointerEvents="none",i.style.opacity="0",i.innerHTML=qs,document.body.prepend(i)),_c=!0}function be({name:i,className:e="",size:t=16,strokeWidth:n=1.8}){H_();const r=["workbench-icon"];return e&&r.push(e),$`
		<svg
			class=${r.join(" ")}
			width=${t}
			height=${t}
			viewBox="0 0 24 24"
			style=${{"--workbench-icon-stroke-width":String(n)}}
			aria-hidden="true"
			focusable="false"
		>
			<use href=${`#${i||"camera-frames"}`}></use>
		</svg>
	`}function G_(i,e){for(var t in e)i[t]=e[t];return i}function bc(i,e){for(var t in i)if(t!=="__source"&&!(t in e))return!0;for(var n in e)if(n!=="__source"&&i[n]!==e[n])return!0;return!1}function xc(i,e){this.props=i,this.context=e}(xc.prototype=new ot).isPureReactComponent=!0,xc.prototype.shouldComponentUpdate=function(i,e){return bc(this.props,i)||bc(this.state,e)};var vc=J.__b;J.__b=function(i){i.type&&i.type.__f&&i.ref&&(i.props.ref=i.ref,i.ref=null),vc&&vc(i)};var W_=J.__e;J.__e=function(i,e,t,n){if(i.then){for(var r,s=e;s=s.__;)if((r=s.__c)&&r.__c)return e.__e==null&&(e.__e=t.__e,e.__k=t.__k),r.__c(i,e)}W_(i,e,t,n)};var wc=J.unmount;function Iu(i,e,t){return i&&(i.__c&&i.__c.__H&&(i.__c.__H.__.forEach(function(n){typeof n.__c=="function"&&n.__c()}),i.__c.__H=null),(i=G_({},i)).__c!=null&&(i.__c.__P===t&&(i.__c.__P=e),i.__c.__e=!0,i.__c=null),i.__k=i.__k&&i.__k.map(function(n){return Iu(n,e,t)})),i}function Du(i,e,t){return i&&t&&(i.__v=null,i.__k=i.__k&&i.__k.map(function(n){return Du(n,e,t)}),i.__c&&i.__c.__P===e&&(i.__e&&t.appendChild(i.__e),i.__c.__e=!0,i.__c.__P=t)),i}function Zs(){this.__u=0,this.o=null,this.__b=null}function zu(i){var e=i.__&&i.__.__c;return e&&e.__a&&e.__a(i)}function dr(){this.i=null,this.l=null}J.unmount=function(i){var e=i.__c;e&&(e.__z=!0),e&&e.__R&&e.__R(),e&&32&i.__u&&(i.type=null),wc&&wc(i)},(Zs.prototype=new ot).__c=function(i,e){var t=e.__c,n=this;n.o==null&&(n.o=[]),n.o.push(t);var r=zu(n.__v),s=!1,o=function(){s||n.__z||(s=!0,t.__R=null,r?r(c):c())};t.__R=o;var a=t.__P;t.__P=null;var c=function(){if(!--n.__u){if(n.state.__a){var l=n.state.__a;n.__v.__k[0]=Du(l,l.__c.__P,l.__c.__O)}var u;for(n.setState({__a:n.__b=null});u=n.o.pop();)u.__P=a,u.forceUpdate()}};n.__u++||32&e.__u||n.setState({__a:n.__b=n.__v.__k[0]}),i.then(o,o)},Zs.prototype.componentWillUnmount=function(){this.o=[]},Zs.prototype.render=function(i,e){if(this.__b){if(this.__v.__k){var t=document.createElement("div"),n=this.__v.__k[0].__c;this.__v.__k[0]=Iu(this.__b,t,n.__O=n.__P)}this.__b=null}var r=e.__a&&En(Wt,null,i.fallback);return r&&(r.__u&=-33),[En(Wt,null,e.__a?null:i.children),r]};var Mc=function(i,e,t){if(++t[1]===t[0]&&i.l.delete(e),i.props.revealOrder&&(i.props.revealOrder[0]!=="t"||!i.l.size))for(t=i.i;t;){for(;t.length>3;)t.pop()();if(t[1]<t[0])break;i.i=t=t[2]}};function X_(i){return this.getChildContext=function(){return i.context},i.children}function Y_(i){var e=this,t=i.h;if(e.componentWillUnmount=function(){Ba(null,e.v),e.v=null,e.h=null},e.h&&e.h!==t&&e.componentWillUnmount(),!e.v){for(var n=e.__v;n!==null&&!n.__m&&n.__!==null;)n=n.__;e.h=t,e.v={nodeType:1,parentNode:t,childNodes:[],__k:{__m:n.__m},contains:function(){return!0},namespaceURI:t.namespaceURI,insertBefore:function(r,s){this.childNodes.push(r),e.h.insertBefore(r,s)},removeChild:function(r){this.childNodes.splice(this.childNodes.indexOf(r)>>>1,1),e.h.removeChild(r)}}}Ba(En(X_,{context:e.context},i.__v),e.v)}function Nu(i,e){var t=En(Y_,{__v:i,h:e});return t.containerInfo=e,t}(dr.prototype=new ot).__a=function(i){var e=this,t=zu(e.__v),n=e.l.get(i);return n[0]++,function(r){var s=function(){e.props.revealOrder?(n.push(r),Mc(e,i,n)):r()};t?t(s):s()}},dr.prototype.render=function(i){this.i=null,this.l=new Map;var e=Mr(i.children);i.revealOrder&&i.revealOrder[0]==="b"&&e.reverse();for(var t=e.length;t--;)this.l.set(e[t],this.i=[1,0,this.i]);return i.children},dr.prototype.componentDidUpdate=dr.prototype.componentDidMount=function(){var i=this;this.l.forEach(function(e,t){Mc(i,t,e)})};var q_=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.element")||60103,Z_=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,J_=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,K_=/[A-Z0-9]/g,Q_=typeof document<"u",eb=function(i){return(typeof Symbol<"u"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(i)};ot.prototype.isReactComponent=!0,["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(i){Object.defineProperty(ot.prototype,i,{configurable:!0,get:function(){return this["UNSAFE_"+i]},set:function(e){Object.defineProperty(this,i,{configurable:!0,writable:!0,value:e})}})});var Sc=J.event;J.event=function(i){return Sc&&(i=Sc(i)),i.persist=function(){},i.isPropagationStopped=function(){return this.cancelBubble},i.isDefaultPrevented=function(){return this.defaultPrevented},i.nativeEvent=i};var tb={configurable:!0,get:function(){return this.class}},$c=J.vnode;J.vnode=function(i){typeof i.type=="string"&&(function(e){var t=e.props,n=e.type,r={},s=n.indexOf("-")==-1;for(var o in t){var a=t[o];if(!(o==="value"&&"defaultValue"in t&&a==null||Q_&&o==="children"&&n==="noscript"||o==="class"||o==="className")){var c=o.toLowerCase();o==="defaultValue"&&"value"in t&&t.value==null?o="value":o==="download"&&a===!0?a="":c==="translate"&&a==="no"?a=!1:c[0]==="o"&&c[1]==="n"?c==="ondoubleclick"?o="ondblclick":c!=="onchange"||n!=="input"&&n!=="textarea"||eb(t.type)?c==="onfocus"?o="onfocusin":c==="onblur"?o="onfocusout":J_.test(o)&&(o=c):c=o="oninput":s&&Z_.test(o)?o=o.replace(K_,"-$&").toLowerCase():a===null&&(a=void 0),c==="oninput"&&r[o=c]&&(o="oninputCapture"),r[o]=a}}n=="select"&&(r.multiple&&Array.isArray(r.value)&&(r.value=Mr(t.children).forEach(function(l){l.props.selected=r.value.indexOf(l.props.value)!=-1})),r.defaultValue!=null&&(r.value=Mr(t.children).forEach(function(l){l.props.selected=r.multiple?r.defaultValue.indexOf(l.props.value)!=-1:r.defaultValue==l.props.value}))),t.class&&!t.className?(r.class=t.class,Object.defineProperty(r,"className",tb)):t.className&&(r.class=r.className=t.className),e.props=r})(i),i.$$typeof=q_,$c&&$c(i)};var kc=J.__r;J.__r=function(i){kc&&kc(i),i.__c};var Ec=J.diffed;J.diffed=function(i){Ec&&Ec(i);var e=i.props,t=i.__e;t!=null&&i.type==="textarea"&&"value"in e&&e.value!==t.value&&(t.value=e.value==null?"":e.value)};const pr=10,It=10;function nb(i,e,t){let n=i.left,r=i.top;t==="left"?(n=i.left-e.width-pr,r=i.top+(i.height-e.height)*.5):t==="top"?(n=i.left+(i.width-e.width)*.5,r=i.top-e.height-pr):t==="bottom"?(n=i.left+(i.width-e.width)*.5,r=i.bottom+pr):(n=i.right+pr,r=i.top+(i.height-e.height)*.5);const s=window.innerWidth-e.width-It,o=window.innerHeight-e.height-It;return{left:Math.min(Math.max(n,It),Math.max(It,s)),top:Math.min(Math.max(r,It),Math.max(It,o))}}function fe({title:i,description:e="",shortcut:t="",placement:n="right"}){const r=Me(null),s=Me(null),[o,a]=ge(!1),[c,l]=ge({left:`${It}px`,top:`${It}px`,visibility:"hidden"});if(!i&&!e&&!t)return null;De(()=>{var M;const h=(M=r.current)==null?void 0:M.parentElement;if(!h)return;const d=()=>a(!0),p=()=>a(!1),m=()=>a(!1),f=()=>a(!1),g=()=>a(!0),y=v=>{h.contains(v.relatedTarget)||a(!1)},b=v=>{v.key==="Escape"&&a(!1)};return h.addEventListener("mouseenter",d),h.addEventListener("mouseleave",p),h.addEventListener("pointerdown",m,!0),h.addEventListener("click",f,!0),h.addEventListener("focusin",g),h.addEventListener("focusout",y),h.addEventListener("keydown",b),()=>{h.removeEventListener("mouseenter",d),h.removeEventListener("mouseleave",p),h.removeEventListener("pointerdown",m,!0),h.removeEventListener("click",f,!0),h.removeEventListener("focusin",g),h.removeEventListener("focusout",y),h.removeEventListener("keydown",b)}},[]),De(()=>{if(!o)return;const h=()=>{var b;const d=(b=r.current)==null?void 0:b.parentElement,p=s.current;if(!d||!p)return;const m=d.getBoundingClientRect(),f=p.getBoundingClientRect(),{left:g,top:y}=nb(m,f,n);l({left:`${g}px`,top:`${y}px`,visibility:"visible"})};return h(),window.addEventListener("resize",h),window.addEventListener("scroll",h,!0),()=>{window.removeEventListener("resize",h),window.removeEventListener("scroll",h,!0)}},[o,n]);const u=o&&typeof document<"u"?Nu($`
						<span
							ref=${s}
							class="workbench-tooltip workbench-tooltip--visible"
							style=${c}
						>
							${i&&$`<strong class="workbench-tooltip__title">${i}</strong>`}
							${e&&$`
									<span class="workbench-tooltip__description"
										>${e}</span
									>
								`}
							${t&&$`
									<span class="workbench-tooltip__shortcut">
										<kbd>${t}</kbd>
									</span>
								`}
						</span>
					`,document.body):null;return $`
		<span ref=${r} class="workbench-tooltip-anchor" aria-hidden="true"></span>
		${u}
	`}function ib({icon:i,title:e,children:t}){return $`
		<div class="section-heading">
			<div class="section-heading__title">
				${i&&$`
						<span class="section-heading__icon">
							<${be} name=${i} size=${14} />
						</span>
					`}
				<h2>${e}</h2>
			</div>
			${t&&$`<div class="section-heading__meta">${t}</div>`}
		</div>
	`}function rb({tabs:i,activeTab:e,setActiveTab:t,ariaLabel:n,iconOnly:r=!1}){return $`
		<div class="workbench-tabs" role="tablist" aria-label=${n}>
			${i.map(s=>{var o,a,c,l;return $`
					<button
						key=${s.id}
						type="button"
						role="tab"
						aria-selected=${e===s.id}
						class=${e===s.id?"workbench-tab workbench-tab--active workbench-tab--tooltip":"workbench-tab workbench-tab--tooltip"}
						onClick=${()=>t(s.id)}
					>
						<span class="workbench-tab__content">
							${s.icon&&$`
								<span class="workbench-tab__icon">
									<${be}
										name=${s.icon}
										size=${r?17:14}
									/>
								</span>
							`}
							${!r&&$`<span>${s.label}</span>`}
						</span>
						<${fe}
							title=${((o=s.tooltip)==null?void 0:o.title)??s.label}
							description=${((a=s.tooltip)==null?void 0:a.description)??""}
							shortcut=${((c=s.tooltip)==null?void 0:c.shortcut)??""}
							placement=${((l=s.tooltip)==null?void 0:l.placement)??"bottom"}
						/>
					</button>
				`})}
		</div>
	`}function sb({icon:i="menu",label:e,items:t=[],children:n,tooltip:r=null,panelPlacement:s="down"}){const o=t.filter(Boolean),[a,c]=ge(!1),l=Me(null),u=Me(null),h=Me(null),[d,p]=ge({left:"10px",top:"10px",visibility:"hidden"});De(()=>{if(!a)return;const f=b=>{var v,w;const M=b.target;!((v=l.current)!=null&&v.contains(M))&&!((w=h.current)!=null&&w.contains(M))&&c(!1)},g=b=>{var v,w;const M=b.target;!((v=l.current)!=null&&v.contains(M))&&!((w=h.current)!=null&&w.contains(M))&&c(!1)},y=b=>{b.key==="Escape"&&c(!1)};return document.addEventListener("pointerdown",f,!0),document.addEventListener("focusin",g),document.addEventListener("keydown",y),()=>{document.removeEventListener("pointerdown",f,!0),document.removeEventListener("focusin",g),document.removeEventListener("keydown",y)}},[a]),De(()=>{if(!a)return;const f=()=>{const g=u.current,y=h.current;if(!g||!y)return;const b=g.getBoundingClientRect(),M=y.getBoundingClientRect(),v=10,w=10,A=b.left+b.width*.5-M.width*.5,_=Math.max(v,window.innerWidth-M.width-v),x=Math.min(Math.max(A,v),_),k=s==="up"?b.top-M.height-w:b.bottom+w,S=Math.max(v,window.innerHeight-M.height-v),T=Math.min(Math.max(k,v),S);p({left:`${x}px`,top:`${T}px`,visibility:"visible"})};return f(),window.addEventListener("resize",f),window.addEventListener("scroll",f,!0),()=>{window.removeEventListener("resize",f),window.removeEventListener("scroll",f,!0)}},[a,s]);const m=a&&typeof document<"u"?Nu($`
						<div
							ref=${h}
							class=${s==="up"?"workbench-menu__panel workbench-menu__panel--up":"workbench-menu__panel"}
							role="menu"
							style=${{left:d.left,top:d.top,visibility:d.visibility}}
						>
							${n}
							${o.map(f=>$`
									<button
										key=${f.id??f.label}
										type="button"
										role="menuitem"
										class=${f.destructive?"workbench-menu__item workbench-menu__item--destructive":"workbench-menu__item"}
										onClick=${()=>{var g;c(!1),(g=f.onClick)==null||g.call(f)}}
									>
										${f.icon&&$`
												<span class="workbench-menu__item-icon">
													<${be} name=${f.icon} size=${14} />
												</span>
											`}
										<span class="workbench-menu__item-label">${f.label}</span>
										${f.shortcut&&$`
												<span class="workbench-menu__item-shortcut" aria-hidden="true">
													<kbd>${f.shortcut}</kbd>
												</span>
											`}
									</button>
								`)}
						</div>
					`,document.body):null;return $`
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
				<${be} name=${i} size=${16} />
				<${fe}
					title=${(r==null?void 0:r.title)??e}
					description=${(r==null?void 0:r.description)??""}
					shortcut=${(r==null?void 0:r.shortcut)??""}
					placement=${(r==null?void 0:r.placement)??"right"}
				/>
			</button>
			${m}
		</div>
	`}function K({icon:i,label:e,active:t=!1,compact:n=!1,disabled:r=!1,className:s="",id:o,iconSize:a=15,iconStrokeWidth:c=1.8,onClick:l,type:u="button",tooltip:h=null}){const d=f=>{f.stopPropagation()},p=f=>{f.stopPropagation(),l==null||l(f)},m=["button","button--icon","button--tooltip",n?"button--compact":"",t?"button--primary":"",s].filter(Boolean).join(" ");return $`
		<button
			id=${o}
			type=${u}
			class=${m}
			aria-label=${e}
			disabled=${r}
			onPointerDown=${d}
			onClick=${p}
		>
			<${be}
				name=${i}
				size=${a}
				strokeWidth=${c}
			/>
			<${fe}
				title=${(h==null?void 0:h.title)??e}
				description=${(h==null?void 0:h.description)??""}
				shortcut=${(h==null?void 0:h.shortcut)??""}
				placement=${(h==null?void 0:h.placement)??"bottom"}
			/>
		</button>
	`}function Jt({icon:i,label:e,children:t,open:n=!1,summaryMeta:r=null,summaryActions:s=null,helpSectionId:o=null,onOpenHelp:a=null,onToggle:c=null,className:l=""}){return $`
		<details
			class=${l?`panel-disclosure ${l}`:"panel-disclosure"}
			open=${n}
			onToggle=${u=>c==null?void 0:c(!!u.currentTarget.open)}
		>
			<summary class="panel-disclosure__summary">
				<span class="panel-disclosure__summary-main">
					${i&&$`
							<span class="panel-disclosure__icon">
								<${be} name=${i} size=${14} />
							</span>
						`}
					<span>${e}</span>
				</span>
				<span class="panel-disclosure__summary-right">
					${o&&typeof a=="function"&&$`
							<button
								type="button"
								class="panel-disclosure__help"
								aria-label="Help"
								onClick=${u=>{u.preventDefault(),u.stopPropagation(),a(o)}}
							>
								<${be} name="help" size=${12} />
							</button>
						`}
					${r&&$`<span class="panel-disclosure__summary-meta">${r}</span>`}
					${s&&$`
							<span class="panel-disclosure__summary-actions">
								${s}
							</span>
						`}
					<span class="panel-disclosure__chevron">
						<${be} name="chevron-right" size=${12} />
					</span>
				</span>
			</summary>
			<div class="panel-disclosure__body">${t}</div>
		</details>
	`}function Ao(i,e){return i.find(t=>t.id===e)??null}function Tc(i,e,t){const n=Ao(i,t);if(!n)return[];const r=new Set(e??[]),s=i.filter(o=>o.kind===n.kind&&r.has(o.id)).map(o=>o.id);return s.includes(t)?s:[t]}function Cc(i){const e=i.currentTarget.getBoundingClientRect();return i.clientY<e.top+e.height/2?"before":"after"}function ob(i,e,t){if(!i||!e||i.kind!==e.kind)return null;const n=i.kindOrderIndex-1,r=e.kindOrderIndex-1;return t==="before"?n<r?r-1:r:n<r?r:r+1}function ab(i,e=!1){const t=(i==null?void 0:i.nativeEvent)??i;return!!e||(t==null?void 0:t.isComposing)===!0||(t==null?void 0:t.keyCode)===229}function lb(i=""){var n;const e=String(i??"").trim();if(!e)return null;const t=e.match(/[+-]?\d+(?:\.(\d+))?/)??e.match(/[+-]?\d*(?:\.(\d+))?/);return t?((n=t[1])==null?void 0:n.length)??0:null}function cb(i=null){if(i==null)return null;const e=String(i).trim().toLowerCase();if(!e||e.includes("e"))return null;const t=e.indexOf(".");return t>=0?e.length-t-1:0}function hb(i,{formatDisplayValue:e=null,template:t="",step:n=null}={}){if(!Number.isFinite(i))return String(i??"");if(typeof e=="function")return String(e(i));const r=String(t??""),s=Math.max(lb(r)??0,cb(n)??0),o=r.trim().startsWith("+")&&i>=0,a=Number(i).toFixed(s);return o?`+${a}`:a}function Y(i){i.stopPropagation()}function ns(i){i.preventDefault(),i.stopPropagation()}function vi(i){return(i.ctrlKey||i.metaKey)&&(i.code==="KeyZ"||i.code==="KeyY")}function ub(i){vi(i)||Y(i)}const Fo={onPointerDown:Y,onClick:Y,onWheel:ns,onKeyDown:ub},db=Object.freeze({normal:1,shift:.25,alt:.1,altShift:.025}),Ac=12,Fc=84,Rc=.55,pb=90,mb=1;function Bu({value:i,title:e="",className:t=""}){return $`
		<span class=${`numeric-unit__label ${t}`.trim()} aria-label=${e||i}
			>${i}</span
		>
	`}const Ro=132,Dt=46,Re=Ro/2,fb=16,Pc=90/Dt;function Ou(i=null){return{...db,...i??{}}}function kn(i){const e=Number(i);if(!Number.isFinite(e))return 0;const t=((e+180)%360+360)%360-180;return t===-180?180:t}function gb(i){return Math.max(-1,Math.min(1,i))}function yb(i,e){const t=Number(i)*Math.PI/180,n=Number(e)*Math.PI/180,r=Math.cos(n);return{x:Math.sin(t)*r,y:Math.sin(n),z:Math.cos(t)*r}}function _b(i){const e=Math.hypot(i.x,i.y,i.z);return!Number.isFinite(e)||e<=1e-8?{x:0,y:0,z:1}:{x:i.x/e,y:i.y/e,z:i.z/e}}function bb(i,e){const t=e*Math.PI/180,n=Math.cos(t),r=Math.sin(t);return{x:i.x*n+i.z*r,y:i.y,z:-i.x*r+i.z*n}}function xb(i,e){const t=e*Math.PI/180,n=Math.cos(t),r=Math.sin(t);return{x:i.x,y:i.y*n-i.z*r,z:i.y*r+i.z*n}}function vb(i){const e=_b(i);return{azimuthDeg:kn(Math.atan2(e.x,e.z)*180/Math.PI),elevationDeg:Math.asin(gb(e.y))*180/Math.PI}}function wb(i,e,t){const n=kn(i-t)*Math.PI/180,r=Number(e)*Math.PI/180,s=Math.cos(r);return{x:Re+Math.sin(n)*s*Dt,y:Re-Math.sin(r)*Dt,isFrontHemisphere:Math.cos(n)*s>=0,relativeAzimuthDeg:kn(i-t)}}function Mb(i,e,t,n){const r=bb(yb(i,e),t*Pc),s=xb(r,n*Pc);return vb(s)}function Bn({value:i,inputMode:e="decimal",onCommit:t,onScrubDelta:n=null,onScrubStart:r=null,onScrubEnd:s=null,onInteractStart:o=null,onEditStart:a=null,onEditEnd:c=null,controller:l=null,historyLabel:u="",formatDisplayValue:h=null,scrubModifiers:d=null,scrubHandleSide:p="auto",scrubStartValue:m=null,...f}){const g=String(i),[y,b]=ge(g),[M,v]=ge(!1),[w,A]=ge(!1),[_,x]=ge(p==="start"?"start":"end"),k=Me(null),S=Me(null),T=Me(!1),P=Ou(d);De(()=>{!M&&!w&&b(g)},[g,M,w]),De(()=>{if(p!=="auto"){x(p==="start"?"start":"end");return}if(!S.current)return;const D=globalThis.getComputedStyle(S.current).getPropertyValue("text-align").trim().toLowerCase(),X=D==="right"||D==="end"?"start":"end";x(Q=>Q===X?Q:X)},[p]);function N(D="cancel"){b(g),v(!1),c==null||c(D)}function H(){requestAnimationFrame(()=>{var D,X,Q,V;(X=(D=S.current)==null?void 0:D.focus)==null||X.call(D,{preventScroll:!0}),(V=(Q=S.current)==null?void 0:Q.select)==null||V.call(Q)})}function F(D){const X=String(D??"").trim();if(X===""){N("cancel");return}t==null||t(X),v(!1),c==null||c("commit")}function O(D){const X=Number(D);return Number.isFinite(X)?X:null}function G(D){let X=D;const Q=O(f.min),V=O(f.max);return Q!==null&&(X=Math.max(Q,X)),V!==null&&(X=Math.min(V,X)),X}function ne(D){return hb(D,{formatDisplayValue:h,template:g,step:f.step})}function Z(D){return D.altKey&&D.shiftKey?P.altShift:D.altKey?P.alt:D.shiftKey?P.shift:P.normal}function B(){const D=Number(f.step);return Number.isFinite(D)&&D>0?D:1}function j(){const D=Number(globalThis.innerWidth);return Number.isFinite(D)&&D>0?D:null}function le(D,X,Q){if(X===null||Math.abs(Q)<=0)return 1;let V=null;if(Q<0?V=D:Q>0&&(V=X-D),V===null||V>=Fc)return 1;const _e=Math.max(0,Math.min(1,V/Fc)),ze=_e*_e;return Rc+(1-Rc)*ze}function xe(D="commit"){var Q,V,_e,ze,Ne,C;const X=k.current;if(X){if(X.edgeHoldFrameId&&(globalThis.cancelAnimationFrame(X.edgeHoldFrameId),X.edgeHoldFrameId=0),X.handle.removeEventListener("pointermove",X.onMove),X.handle.removeEventListener("pointerup",X.onUp),X.handle.removeEventListener("pointercancel",X.onCancel),(V=(Q=X.handle).releasePointerCapture)==null||V.call(Q,X.pointerId),k.current=null,A(!1),D==="cancel"){(ze=(_e=l==null?void 0:l())==null?void 0:_e.cancelHistoryTransaction)==null||ze.call(_e),s==null||s("cancel");return}(C=(Ne=l==null?void 0:l())==null?void 0:Ne.commitHistoryTransaction)==null||C.call(Ne,u),s==null||s("commit")}}function st(D){var $t,Kt,Ci;Y(D),D.preventDefault(),o==null||o();const X=m!=null?O(m):O(g);if(X===null)return;r==null||r(),(Kt=($t=l==null?void 0:l())==null?void 0:$t.beginHistoryTransaction)==null||Kt.call($t,u),v(!1),A(!0);const Q=D.currentTarget;(Ci=Q.setPointerCapture)==null||Ci.call(Q,D.pointerId);const V={pointerId:D.pointerId,handle:Q,lastClientX:D.clientX,appliedValue:X,edgeHoldDirection:0,edgeHoldMultiplier:1,edgeHoldEngagedAt:0,edgeHoldLastTimestamp:0,edgeHoldFrameId:0,onMove:null,onUp:null,onCancel:null},_e=oe=>{if(!Number.isFinite(oe)||Math.abs(oe)<=1e-8)return;const Se=G(V.appliedValue+oe),Be=ne(Se),Ee=Se-V.appliedValue;!Number.isFinite(Ee)||Math.abs(Ee)<=1e-8||(V.appliedValue=Se,b(Be),n?n(Ee,Se):t==null||t(Be))},ze=()=>{V.edgeHoldFrameId&&globalThis.cancelAnimationFrame(V.edgeHoldFrameId),V.edgeHoldDirection=0,V.edgeHoldFrameId=0,V.edgeHoldEngagedAt=0,V.edgeHoldLastTimestamp=0},Ne=oe=>{if(k.current!==V||!V.edgeHoldDirection){V.edgeHoldFrameId=0;return}V.edgeHoldEngagedAt||(V.edgeHoldEngagedAt=oe),V.edgeHoldLastTimestamp||(V.edgeHoldLastTimestamp=oe);const Se=oe-V.edgeHoldLastTimestamp;if(V.edgeHoldLastTimestamp=oe,oe-V.edgeHoldEngagedAt>=pb){const Be=Se/16.6667,Ee=V.edgeHoldDirection*mb*Be;_e(Ee*B()*V.edgeHoldMultiplier)}V.edgeHoldFrameId=globalThis.requestAnimationFrame(Ne)},C=(oe,Se)=>{V.edgeHoldDirection===oe&&Math.abs(V.edgeHoldMultiplier-Se)<=1e-8&&V.edgeHoldFrameId||(ze(),V.edgeHoldDirection=oe,V.edgeHoldMultiplier=Se,V.edgeHoldFrameId=globalThis.requestAnimationFrame(Ne))},z=oe=>{if(oe.pointerId!==V.pointerId)return;Y(oe),oe.preventDefault();const Se=oe.clientX,Be=Se-V.lastClientX,Ee=j(),is=Se<=Ac,rs=Ee!==null&&Se>=Ee-Ac;if(Math.abs(Be)<=0)return;const On=Z(oe),Ln=le(Se,Ee,Be);V.lastClientX=Se,_e(Be*B()*On*Ln),Be<0&&is?C(-1,On*Ln):Be>0&&rs?C(1,On*Ln):ze()},U=oe=>{oe.pointerId===D.pointerId&&(Y(oe),oe.preventDefault(),xe("commit"))},te=oe=>{oe.pointerId===D.pointerId&&(Y(oe),oe.preventDefault(),xe("cancel"))};V.onMove=z,V.onUp=U,V.onCancel=te,k.current=V,Q.addEventListener("pointermove",z),Q.addEventListener("pointerup",U),Q.addEventListener("pointercancel",te)}return $`
		<div
			class=${w?`numeric-scrub numeric-scrub--handle-${_} is-scrubbing`:`numeric-scrub numeric-scrub--handle-${_}`}
			data-history-scope="app"
		>
			<input
				ref=${S}
				...${f}
				type="text"
				inputMode=${e}
				spellcheck="false"
				autocomplete="off"
				data-draft-editing=${M?"true":"false"}
				value=${M||w?y:g}
				onFocus=${D=>{Y(D),o==null||o(),a==null||a(),v(!0),b(String(D.currentTarget.value??g))}}
				onInput=${D=>{Y(D),v(!0),b(D.currentTarget.value)}}
				onBlur=${D=>{if(T.current){T.current=!1,v(!1);return}F(D.currentTarget.value)}}
				onChange=${Y}
				onPointerDown=${D=>{var X;Y(D),D.preventDefault(),o==null||o(),v(!0),b(String(((X=S.current)==null?void 0:X.value)??g)),H()}}
				onClick=${Y}
				onWheel=${ns}
				onKeyDown=${D=>{if(!vi(D)){if(Y(D),D.key==="Enter"){D.preventDefault(),T.current=!0,F(D.currentTarget.value),D.currentTarget.blur();return}D.key==="Escape"&&(D.preventDefault(),T.current=!0,N(),D.currentTarget.blur())}}}
			/>
			<button
				type="button"
				class="numeric-scrub__handle"
				tabIndex="-1"
				aria-hidden="true"
				onPointerDown=${st}
				onClick=${D=>{Y(D),D.preventDefault()}}
			>
				<${be} name="scrub" size=${13} />
			</button>
		</div>
	`}function Js({controller:i=null,historyLabel:e="",ariaLabel:t="",step:n=.02,scrubModifiers:r=null,onDelta:s}){const[o,a]=ge(!1),c=Me(null),l=Ou(r);function u(m){return m.altKey&&m.shiftKey?l.altShift:m.altKey?l.alt:m.shiftKey?l.shift:l.normal}function h(){const m=Number(n);return Number.isFinite(m)&&m>0?m:.02}function d(m="commit"){var g,y,b,M,v,w;const f=c.current;if(f){if(f.surface.removeEventListener("pointermove",f.onMove),f.surface.removeEventListener("pointerup",f.onUp),f.surface.removeEventListener("pointercancel",f.onCancel),(y=(g=f.surface).releasePointerCapture)==null||y.call(g,f.pointerId),f.surface.style.setProperty("--directional-scrub-offset","0px"),c.current=null,a(!1),m==="cancel"){(M=(b=i==null?void 0:i())==null?void 0:b.cancelHistoryTransaction)==null||M.call(b);return}(w=(v=i==null?void 0:i())==null?void 0:v.commitHistoryTransaction)==null||w.call(v,e)}}function p(m){var v,w,A;Y(m),m.preventDefault(),(w=(v=i==null?void 0:i())==null?void 0:v.beginHistoryTransaction)==null||w.call(v,e),a(!0);const f=m.currentTarget;(A=f.setPointerCapture)==null||A.call(f,m.pointerId);const g={pointerId:m.pointerId,surface:f,startClientX:m.clientX,appliedDistance:0,onMove:null,onUp:null,onCancel:null},y=_=>{if(_.pointerId!==g.pointerId)return;Y(_),_.preventDefault();const x=Math.max(10,Math.min(20,(g.surface.clientWidth-34)*.5)),k=Math.max(-x,Math.min(x,_.clientX-g.startClientX));g.surface.style.setProperty("--directional-scrub-offset",`${k}px`);const S=(_.clientX-g.startClientX)*h()*u(_),T=S-g.appliedDistance;!Number.isFinite(T)||Math.abs(T)<=1e-8||(g.appliedDistance=S,s==null||s(T))},b=_=>{_.pointerId===g.pointerId&&(Y(_),_.preventDefault(),d("commit"))},M=_=>{_.pointerId===g.pointerId&&(Y(_),_.preventDefault(),d("cancel"))};g.onMove=y,g.onUp=b,g.onCancel=M,c.current=g,f.addEventListener("pointermove",y),f.addEventListener("pointerup",b),f.addEventListener("pointercancel",M)}return $`
		<div
			class=${o?"directional-scrub is-scrubbing":"directional-scrub"}
			data-history-scope="app"
		>
			<button
				type="button"
				class="directional-scrub__surface"
				aria-label=${t}
				onPointerDown=${p}
				onClick=${m=>{Y(m),m.preventDefault()}}
			>
				<span class="directional-scrub__chevron directional-scrub__chevron--start">
					<${be} name="chevron-left" size=${16} />
				</span>
				<span class="directional-scrub__track" aria-hidden="true"></span>
				<span class="directional-scrub__thumb" aria-hidden="true">
					<span class="directional-scrub__thumb-bar"></span>
				</span>
				<span class="directional-scrub__chevron directional-scrub__chevron--end">
					<${be} name="chevron-right" size=${16} />
				</span>
			</button>
		</div>
	`}function hw({controller:i,azimuthDeg:e,elevationDeg:t,viewAzimuthDeg:n=0,historyLabel:r="lighting.model.direction",onLiveChange:s}){const[o,a]=ge(!1),[c,l]=ge(n),u=Me(null),h=Me(n);De(()=>{h.current=n,l(n)},[n]),De(()=>{let b=0;const M=()=>{var w,A;const v=(A=(w=i==null?void 0:i())==null?void 0:w.getActiveCameraHeadingDeg)==null?void 0:A.call(w);if(Number.isFinite(v)){const _=kn(v+180);Math.abs(kn(_-h.current))>=.1&&(h.current=_,l(_))}b=globalThis.requestAnimationFrame(M)};return b=globalThis.requestAnimationFrame(M),()=>{globalThis.cancelAnimationFrame(b)}},[i]);const d=wb(e,t,c),p=`M ${Re} ${Re} L ${d.x} ${d.y}`,m=d.isFrontHemisphere?null:$`
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
			`,f=d.isFrontHemisphere?$`
				<path d=${p} class="lighting-direction-control__ray" />
				<circle
					cx=${d.x}
					cy=${d.y}
					r="6"
					class="lighting-direction-control__handle"
				/>
			`:null;function g(b="commit"){var v,w,A,_,x,k;const M=u.current;if(M){if(M.target.removeEventListener("pointermove",M.onMove),M.target.removeEventListener("pointerup",M.onUp),M.target.removeEventListener("pointercancel",M.onCancel),(w=(v=M.target).releasePointerCapture)==null||w.call(v,M.pointerId),u.current=null,a(!1),b==="cancel"){(_=(A=i==null?void 0:i())==null?void 0:A.cancelHistoryTransaction)==null||_.call(A);return}(k=(x=i==null?void 0:i())==null?void 0:x.commitHistoryTransaction)==null||k.call(x,r)}}function y(b){var x,k,S;Y(b),b.preventDefault();const M=b.currentTarget;(k=(x=i==null?void 0:i())==null?void 0:x.beginHistoryTransaction)==null||k.call(x,r),(S=M.setPointerCapture)==null||S.call(M,b.pointerId),a(!0);const v={pointerId:b.pointerId,target:M,previousClientX:b.clientX,previousClientY:b.clientY,relativeAzimuthDeg:d.relativeAzimuthDeg,elevationDeg:t,onMove:null,onUp:null,onCancel:null},w=T=>{if(T.pointerId!==v.pointerId)return;Y(T),T.preventDefault();const P=T.clientX-v.previousClientX,N=T.clientY-v.previousClientY;v.previousClientX=T.clientX,v.previousClientY=T.clientY;const H=Mb(v.relativeAzimuthDeg,v.elevationDeg,P,N);v.relativeAzimuthDeg=H.azimuthDeg,v.elevationDeg=H.elevationDeg,s==null||s({azimuthDeg:kn(H.azimuthDeg+h.current),elevationDeg:H.elevationDeg})},A=T=>{T.pointerId===v.pointerId&&(Y(T),T.preventDefault(),g("commit"))},_=T=>{T.pointerId===v.pointerId&&(Y(T),T.preventDefault(),g("cancel"))};v.onMove=w,v.onUp=A,v.onCancel=_,u.current=v,M.addEventListener("pointermove",w),M.addEventListener("pointerup",A),M.addEventListener("pointercancel",_)}return $`
		<div class="lighting-direction-control">
			<button
				type="button"
				class=${o?"lighting-direction-control__surface is-dragging":"lighting-direction-control__surface"}
				onPointerDown=${y}
			>
				<svg
					viewBox=${`0 0 ${Ro} ${Ro}`}
					class="lighting-direction-control__svg"
					aria-hidden="true"
				>
					${m}
					<circle
						cx=${Re}
						cy=${Re}
						r=${Dt}
						class="lighting-direction-control__sphere"
					/>
					<circle
						cx=${Re}
						cy=${Re}
						r=${Dt}
						class="lighting-direction-control__occluder"
					/>
					<ellipse
						cx=${Re}
						cy=${Re}
						rx=${Dt}
						ry=${fb}
						class="lighting-direction-control__equator"
					/>
					<path
						d=${`M ${Re} ${Re-Dt} V ${Re+Dt}`}
						class="lighting-direction-control__view-axis"
					/>
					<circle
						cx=${Re}
						cy=${Re}
						r="3.5"
						class="lighting-direction-control__origin"
					/>
					${f}
				</svg>
			</button>
		</div>
	`}function Ti({value:i,onCommit:e,selectOnFocus:t=!1,...n}){const r=String(i??""),[s,o]=ge(r),[a,c]=ge(!1),l=Me(!1),u=Me(!1);De(()=>{a||o(r)},[r,a]);function h(){o(r),c(!1)}function d(m){e==null||e(String(m??"")),c(!1)}function p(m){if(t){m.preventDefault(),Y(m);const f=m.currentTarget;c(!0),o(String(f.value??r)),requestAnimationFrame(()=>{var g,y;(g=f==null?void 0:f.focus)==null||g.call(f),(y=f==null?void 0:f.select)==null||y.call(f)});return}Y(m)}return $`
		<input
			...${n}
			type="text"
			data-draft-editing=${a?"true":"false"}
			value=${a?s:r}
			onPointerDown=${p}
			onFocus=${m=>{Y(m),c(!0),o(String(m.currentTarget.value??r)),t&&requestAnimationFrame(()=>{var f,g;(g=(f=m.currentTarget)==null?void 0:f.select)==null||g.call(f)})}}
			onInput=${m=>{Y(m),c(!0),o(m.currentTarget.value)}}
			onCompositionStart=${m=>{Y(m),l.current=!0,c(!0)}}
			onCompositionEnd=${m=>{Y(m),l.current=!1,c(!0),o(String(m.currentTarget.value??r))}}
			onBlur=${m=>{if(l.current=!1,u.current){u.current=!1,c(!1);return}d(m.currentTarget.value)}}
			onChange=${Y}
			onClick=${Y}
			onWheel=${ns}
			onKeyDown=${m=>{if(!vi(m)){if(ab(m,l.current)){Y(m);return}if(Y(m),m.key==="Enter"){m.preventDefault(),u.current=!0,d(m.currentTarget.value),m.currentTarget.blur();return}m.key==="Escape"&&(m.preventDefault(),u.current=!0,h(),m.currentTarget.blur())}}}
		/>
	`}function Po({controller:i,historyLabel:e,onLiveChange:t,...n}){const[r,s]=ge(!1);function o(l){var u,h;Y(l),!r&&((h=(u=i==null?void 0:i())==null?void 0:u.beginHistoryTransaction)==null||h.call(u,e),s(!0))}function a(){var l,u;r&&((u=(l=i==null?void 0:i())==null?void 0:l.commitHistoryTransaction)==null||u.call(l,e),s(!1))}function c(){var l,u;r&&((u=(l=i==null?void 0:i())==null?void 0:l.cancelHistoryTransaction)==null||u.call(l),s(!1))}return $`
		<input
			...${n}
			type="range"
			data-history-scope="app"
			onPointerDown=${l=>{o(l)}}
			onInput=${l=>{r?Y(l):o(l),t==null||t(l)}}
			onChange=${l=>{r?Y(l):o(l),t==null||t(l),a()}}
			onPointerUp=${l=>{Y(l),a()}}
			onPointerCancel=${l=>{Y(l),c()}}
			onBlur=${()=>{a()}}
			onKeyDown=${l=>{vi(l)||(Y(l),["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(l.key)&&o(l))}}
			onKeyUp=${l=>{vi(l)||(Y(l),["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(l.key)&&a())}}
			onWheel=${ns}
		/>
	`}function Io(i,e,{snap:t=!1}={}){const n=Number(e);if(!Number.isFinite(n))return;const r=t?Cg(n):Qo(n);i==null||i(ea(r))}const yr="scene",_r="camera",br="reference",Do="export",Sb="scene-main",$b="scene-transform",kb="shot-camera",Eb="shot-camera-properties",Tb="lighting",Cb="output-frame",Ab="reference-presets",Fb="reference-manager",Rb="reference-properties",Pb="export-output",Ib="export-settings";function Lu(i){return[{id:yr,label:i("section.scene"),icon:"scene",tooltip:{title:i("section.scene"),description:i("tooltip.tabScene"),placement:"bottom"}},{id:_r,label:i("section.shotCamera"),icon:"camera-dslr",tooltip:{title:i("section.shotCamera"),description:i("tooltip.tabCamera"),placement:"bottom"}},{id:br,label:i("section.referenceImages"),icon:"image",tooltip:{title:i("section.referenceImages"),description:i("tooltip.tabReference"),placement:"bottom"}},{id:Do,label:i("section.export"),icon:"export-tab",tooltip:{title:i("section.export"),description:i("tooltip.tabExport"),placement:"bottom"}}]}function uw(i){return[{id:Sb,tabId:yr,label:i("section.sceneManager"),icon:"scene"},{id:kb,tabId:_r,label:i("section.shotCameraManager"),icon:"camera"},{id:Eb,tabId:_r,label:i("section.shotCameraProperties"),icon:"camera-property"},{id:Tb,tabId:yr,label:i("section.lighting"),icon:"light"},{id:$b,tabId:yr,label:i("section.selectedSceneObject"),icon:"move"},{id:Cb,tabId:_r,label:i("section.outputFrame"),icon:"render-box"},{id:Ab,tabId:br,label:i("section.referencePresets"),icon:"image"},{id:Fb,tabId:br,label:i("section.referenceManager"),icon:"reference-tool"},{id:Rb,tabId:br,label:i("section.referenceProperties"),icon:"reference-tool"},{id:Pb,tabId:Do,label:i("section.output"),icon:"export-tab"},{id:Ib,tabId:Do,label:i("section.exportSettings"),icon:"export-tab"}]}function Db({activeShotCamera:i,controller:e,shotCameras:t,t:n}){const r=t.length>1&&!!i;return $`
		<div class="shot-camera-manager">
			<div class="button-row shot-camera-manager__actions">
				<${K}
					id="new-shot-camera"
					icon="plus"
					label=${n("action.newShotCamera")}
					onClick=${()=>{var s;return(s=e())==null?void 0:s.createShotCamera()}}
				/>
				<${K}
					id="duplicate-shot-camera"
					icon="duplicate"
					label=${n("action.duplicateShotCamera")}
					disabled=${!i}
					onClick=${()=>{var s;return(s=e())==null?void 0:s.duplicateActiveShotCamera()}}
				/>
				<${K}
					id="delete-shot-camera"
					icon="trash"
					label=${n("action.deleteShotCamera")}
					disabled=${!r}
					onClick=${()=>{var s,o;return(o=(s=e())==null?void 0:s.deleteActiveShotCamera)==null?void 0:o.call(s)}}
				/>
			</div>
			<div class="shot-camera-manager__list scene-asset-list scene-asset-list--compact">
				${t.map(s=>$`
						<article
							key=${s.id}
							class=${s.id===(i==null?void 0:i.id)?"scene-asset-row scene-asset-row--compact scene-asset-row--selected scene-asset-row--active":"scene-asset-row scene-asset-row--compact"}
							onClick=${()=>{var o;return(o=e())==null?void 0:o.selectShotCamera(s.id)}}
						>
							<div class="scene-asset-row__main scene-asset-row__main--flat">
								<div class="scene-asset-row__title-group">
									${s.id===(i==null?void 0:i.id)?$`
												<div class="field shot-camera-manager__inline-name-field">
													<${Ti}
														id=${`shot-camera-name-${s.id}`}
														class="shot-camera-manager__inline-name-input"
														placeholder=${n("field.shotCameraName")}
														selectOnFocus=${!0}
														value=${s.name}
														onCommit=${o=>{var a;return(a=e())==null?void 0:a.setShotCameraName(o)}}
													/>
												</div>
											`:$`<strong>${s.name}</strong>`}
								</div>
							</div>
						</article>
					`)}
			</div>
		</div>
	`}function dw({controller:i,draggedAssetId:e=null,dragHoverState:t=null,sceneAssets:n,selectedSceneAsset:r,setDraggedAssetId:s,setDragHoverState:o,store:a,t:c}){const l=[{kind:"model",label:c("assetKind.model"),assets:n.filter(m=>m.kind==="model")},{kind:"splat",label:c("assetKind.splat"),assets:n.filter(m=>m.kind==="splat")}],u=a.selectedSceneAssetIds.value??[],h=new Set(u),d=m=>{const f=["scene-asset-row","scene-asset-row--compact"];return h.has(m.id)&&f.push("scene-asset-row--selected"),m.id===(r==null?void 0:r.id)&&f.push("scene-asset-row--active"),(t==null?void 0:t.assetId)===m.id&&f.push(t.position==="before"?"scene-asset-row--drop-before":"scene-asset-row--drop-after"),f.join(" ")},p=m=>m.id===(r==null?void 0:r.id)?$`
					<div class="field scene-asset-row__inline-name-field">
						<${Ti}
							id=${`scene-asset-name-${m.id}`}
							class="scene-asset-row__inline-name-input"
							placeholder=${m.label}
							selectOnFocus=${!0}
							value=${m.label}
							maxLength="128"
							onCommit=${f=>{var g,y;return(y=(g=i())==null?void 0:g.setAssetLabel)==null?void 0:y.call(g,m.id,f)}}
						/>
					</div>
				`:$`<strong>${m.label}</strong>`;return $`
		<div class="browser-list">
			${l.map(m=>$`
					<section key=${m.kind} class="browser-group">
						<div class="browser-group__heading">
							<strong>${m.label}</strong>
							<span class="pill pill--dim">${m.assets.length}</span>
						</div>
						<div class="scene-asset-list scene-asset-list--compact">
							${m.assets.length===0?$`<div class="scene-asset-list__placeholder"></div>`:m.assets.map(f=>$`
									<article
										class=${d(f)}
										draggable="true"
										onClick=${g=>{var y;return(y=i())==null?void 0:y.selectSceneAsset(f.id,{additive:g.ctrlKey||g.metaKey,toggle:g.ctrlKey||g.metaKey,range:g.shiftKey,orderedIds:n.map(b=>b.id)})}}
										onDragStart=${g=>{s(f.id),o(null),g.dataTransfer.effectAllowed="move",g.dataTransfer.setData("text/plain",String(f.id))}}
										onDragOver=${g=>{const y=Ao(n,e??Number(g.dataTransfer.getData("text/plain")));Tc(n,u,y==null?void 0:y.id).includes(f.id)||(y==null?void 0:y.kind)===f.kind&&(g.preventDefault(),g.dataTransfer.dropEffect="move",o({assetId:f.id,position:Cc(g)}))}}
										onDragLeave=${()=>{(t==null?void 0:t.assetId)===f.id&&o(null)}}
										onDrop=${g=>{var A;g.preventDefault();const y=e??Number(g.dataTransfer.getData("text/plain")),b=Ao(n,y),M=Tc(n,u,y),v=Cc(g);if(!Number.isFinite(y)||y===f.id||M.includes(f.id)||(b==null?void 0:b.kind)!==f.kind){s(null),o(null);return}const w=ob(b,f,v);w!==null&&((A=i())==null||A.moveAssetToIndex(y,w)),s(null),o(null)}}
										onDragEnd=${()=>{s(null),o(null)}}
									>
										<div class="scene-asset-row__main">
											<span class="scene-asset-row__handle" aria-hidden="true">
												<${be} name="grip" size=${12} strokeWidth=${0} />
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
												onClick=${g=>{var y,b;g.stopPropagation(),(y=i())==null||y.selectSceneAsset(f.id),(b=i())==null||b.setAssetVisibility(f.id,!f.visible)}}
											/>
										</div>
									</article>
								`)}
						</div>
					</section>
				`)}
		</div>
	`}function zb({activePreset:i,controller:e,presets:t,t:n}){const[r,s]=ge(!1),o=Me(null),a=!!i&&!i.isBlank;return De(()=>{if(!r)return;const c=l=>{var u,h;(h=(u=o.current)==null?void 0:u.contains)!=null&&h.call(u,l.target)||s(!1)};return window.addEventListener("pointerdown",c),()=>{window.removeEventListener("pointerdown",c)}},[r]),$`
		<div class="reference-preset-picker" ref=${o}>
			<div class="reference-preset-picker__control">
				<div class="field reference-preset-picker__field">
					<${Ti}
						id="reference-preset-name"
						class="reference-preset-picker__input"
						placeholder=${n("field.referencePresetName")}
						selectOnFocus=${a}
						disabled=${!a}
						value=${(i==null?void 0:i.name)??""}
						onCommit=${c=>{var l,u;return(u=(l=e())==null?void 0:l.setActiveReferenceImagePresetName)==null?void 0:u.call(l,c)}}
					/>
				</div>
				<button
					type="button"
					class=${r?"reference-preset-picker__toggle is-open":"reference-preset-picker__toggle"}
					onPointerDown=${c=>{Y(c),c.preventDefault()}}
					onClick=${c=>{Y(c),c.preventDefault(),s(l=>!l)}}
					aria-label=${n("referenceImage.activePreset")}
					aria-expanded=${r}
				>
					<${be} name="chevron-right" size=${12} />
				</button>
			</div>
			${r&&$`
					<div class="reference-preset-picker__menu">
						${t.map(c=>$`
								<button
									key=${c.id}
									type="button"
									class=${c.id===(i==null?void 0:i.id)?"reference-preset-picker__option is-active":"reference-preset-picker__option"}
									onPointerDown=${l=>{Y(l),l.preventDefault()}}
									onClick=${l=>{var u,h;Y(l),l.preventDefault(),(h=(u=e())==null?void 0:u.setActiveReferenceImagePreset)==null||h.call(u,c.id),s(!1)}}
								>
									<span>${c.name}</span>
									${c.isBlank?$`<span class="pill pill--dim">${n("referenceImage.blankPreset")}</span>`:null}
								</button>
							`)}
					</div>
				`}
		</div>
	`}function pw({controller:i,open:e=!0,summaryActions:t=null,onToggle:n=null,store:r,t:s}){const o=r.referenceImages.presets.value,a=r.referenceImages.panelPresetId.value,c=o.find(u=>u.id===a)??o[0]??null,l=!!c&&c.isBlank!==!0&&o.length>1;return $`
		<${Jt}
			icon="image"
			label=${s("section.referencePresets")}
			helpSectionId="reference-images"
			onOpenHelp=${u=>{var h,d;return(d=(h=i())==null?void 0:h.openHelp)==null?void 0:d.call(h,{sectionId:u})}}
			open=${e}
			summaryActions=${t}
			onToggle=${n}
		>
			<div class="reference-preset-section">
				<div class="reference-preset-section__row">
					<${zb}
						activePreset=${c}
						controller=${i}
						presets=${o}
						t=${s}
					/>
				</div>
				<div class="button-row reference-preset-section__actions">
					<${K}
						id="duplicate-reference-preset"
						icon="duplicate"
						label=${s("action.duplicateReferencePreset")}
						onClick=${()=>{var u,h;return(h=(u=i())==null?void 0:u.duplicateActiveReferenceImagePreset)==null?void 0:h.call(u)}}
					/>
					<${K}
						id="delete-reference-preset"
						icon="trash"
						label=${s("action.deleteReferencePreset")}
						disabled=${!l}
						onClick=${()=>{var u,h;return(h=(u=i())==null?void 0:u.deleteActiveReferenceImagePreset)==null?void 0:h.call(u)}}
					/>
				</div>
			</div>
		<//>
	`}function mw({controller:i,open:e=!0,summaryActions:t=null,onToggle:n=null,store:r,t:s}){const o=r.referenceImages.items.value,a=Us(o),c=new Set(r.referenceImages.selectedItemIds.value??[]),l=a.filter(x=>c.has(x.id)),u=r.referenceImages.selectedItemId.value,h=[{group:"front",label:s("referenceImage.group.front"),items:Us(o,"front")},{group:"back",label:s("referenceImage.group.back"),items:Us(o,"back")}],[d,p]=ge(null),[m,f]=ge(null),g=l.length>0,y=r.referenceImages.previewSessionVisible.value!==!1,b=l.length>0&&l.every(x=>x.previewVisible!==!1),M=l.length>0&&l.every(x=>x.exportEnabled!==!1),v=$`
		<${K}
			id="toggle-reference-preview-session"
			icon=${y?"reference-preview-on":"reference-preview-off"}
			label=${s(y?"action.hideReferenceImages":"action.showReferenceImages")}
			active=${y&&o.length>0}
			compact=${!0}
			disabled=${o.length===0}
			tooltip=${{title:s(y?"action.hideReferenceImages":"action.showReferenceImages"),description:s("tooltip.referencePreviewSessionVisible"),shortcut:"R",placement:"left"}}
			onClick=${()=>{var x,k;return(k=(x=i())==null?void 0:x.setReferenceImagePreviewSessionVisible)==null?void 0:k.call(x,!y)}}
		/>
		${t&&$`${t}`}
	`;function w(x){const k=["scene-asset-row","scene-asset-row--compact"];return c.has(x)&&k.push("scene-asset-row--selected"),x===u&&k.push("scene-asset-row--active"),(m==null?void 0:m.itemId)===x&&k.push(m.position==="before"?"scene-asset-row--drop-before":"scene-asset-row--drop-after"),k.join(" ")}function A(x){const k=x.currentTarget.getBoundingClientRect();return x.clientY<k.top+k.height/2?"before":"after"}function _(x,k,S){var T,P,N,H,F,O;(P=(T=i())==null?void 0:T.selectReferenceImageItem)==null||P.call(T,k,{additive:x.ctrlKey||x.metaKey,toggle:x.ctrlKey||x.metaKey,range:x.shiftKey,orderedIds:S}),(H=(N=i())==null?void 0:N.isReferenceImageSelectionActive)!=null&&H.call(N)&&((O=(F=i())==null?void 0:F.activateViewportReferenceImageEditModeImplicit)==null||O.call(F))}return $`
		<${Jt}
			icon="reference-tool"
			label=${s("section.referenceManager")}
			helpSectionId="reference-images"
			onOpenHelp=${x=>{var k,S;return(S=(k=i())==null?void 0:k.openHelp)==null?void 0:S.call(k,{sectionId:x})}}
			open=${e}
			summaryActions=${v}
			onToggle=${n}
			className="panel-disclosure--browser-stack"
		>
			<div class="scene-workspace-browser">
				<div class="button-row reference-manager__actions">
					<${K}
						id="toggle-selected-reference-preview"
						icon=${b?"eye-off":"eye"}
						label=${s(b?"action.hideSelectedReferenceImages":"action.showSelectedReferenceImages")}
						disabled=${!l.length}
						onClick=${()=>{var x,k;return(k=(x=i())==null?void 0:x.setSelectedReferenceImagesPreviewVisible)==null?void 0:k.call(x,!b)}}
					/>
					<${K}
						id="toggle-selected-reference-export"
						icon=${M?"slash-circle":"export"}
						label=${s(M?"action.excludeSelectedReferenceImagesFromExport":"action.includeSelectedReferenceImagesInExport")}
						disabled=${!l.length}
						onClick=${()=>{var x,k;return(k=(x=i())==null?void 0:x.setSelectedReferenceImagesExportEnabled)==null?void 0:k.call(x,!M)}}
					/>
					<${K}
						id="delete-selected-reference-images"
						icon="trash"
						label=${s("action.deleteSelectedReferenceImages")}
						disabled=${!g}
						onClick=${()=>{var x,k;return(k=(x=i())==null?void 0:x.deleteSelectedReferenceImageItems)==null?void 0:k.call(x)}}
					/>
				</div>
				<div class="scene-workspace-pane">
					<div class="scene-workspace-pane__body">
						${a.length>0?$`
										<div class="browser-list">
											${h.map(x=>$`
													<section key=${x.group} class="browser-group">
														<div class="browser-group__heading">
															<strong>${x.label}</strong>
															<span class="pill pill--dim"
																>${x.items.length}</span
															>
														</div>
														<div class="scene-asset-list scene-asset-list--compact">
															${x.items.length===0?$`<div class="scene-asset-list__placeholder"></div>`:x.items.map(k=>$`
													<article
														key=${k.id}
														class=${w(k.id)}
														onClick=${S=>_(S,k.id,a.map(T=>T.id))}
														onDragOver=${S=>{S.preventDefault(),S.dataTransfer.dropEffect="move",f({itemId:k.id,position:A(S)})}}
														onDragLeave=${()=>{(m==null?void 0:m.itemId)===k.id&&f(null)}}
														onDrop=${S=>{var N,H;S.preventDefault();const T=d??String(S.dataTransfer.getData("text/plain")).trim(),P=A(S);if(!T||T===k.id){p(null),f(null);return}(H=(N=i())==null?void 0:N.moveReferenceImageToDisplayTarget)==null||H.call(N,T,k.id,P,a.map(F=>F.id)),p(null),f(null)}}
														onDragEnd=${()=>{p(null),f(null)}}
													>
														<div
															class="scene-asset-row__main"
															draggable="true"
															onDragStart=${S=>{p(k.id),f(null),S.dataTransfer.effectAllowed="move",S.dataTransfer.setData("text/plain",String(k.id))}}
															onDragEnd=${()=>{p(null),f(null)}}
														>
															<span class="scene-asset-row__handle" aria-hidden="true">
																<${be}
																	name="grip"
																	size=${12}
																	strokeWidth=${0}
																/>
															</span>
															<div class="scene-asset-row__title-group">
																<strong>${k.name}</strong>
															</div>
														</div>
														<div class="scene-asset-row__toolbar">
															<button
																type="button"
																class=${k.group==="front"?"reference-group-chip reference-group-chip--front":"reference-group-chip reference-group-chip--back"}
																title=${s(`referenceImage.group.${k.group}`)}
																onClick=${S=>{var T,P;S.stopPropagation(),(P=(T=i())==null?void 0:T.setReferenceImageGroup)==null||P.call(T,k.id,k.group==="front"?"back":"front")}}
															>
																${s(`referenceImage.groupShort.${k.group}`)}
															</button>
															<${K}
																icon=${k.previewVisible?"eye":"eye-off"}
																label=${s(k.previewVisible?"action.hideReferenceImage":"action.showReferenceImage")}
																active=${k.previewVisible}
																compact=${!0}
																className="scene-asset-row__icon-button"
																onClick=${S=>{var T,P;S.stopPropagation(),(P=(T=i())==null?void 0:T.setReferenceImagePreviewVisible)==null||P.call(T,k.id,!k.previewVisible)}}
															/>
															<${K}
																icon=${k.exportEnabled?"export":"slash-circle"}
																label=${k.exportEnabled?s("action.excludeReferenceImageFromExport"):s("action.includeReferenceImageInExport")}
																active=${k.exportEnabled}
																compact=${!0}
																className="scene-asset-row__icon-button"
																onClick=${S=>{var T,P;S.stopPropagation(),(P=(T=i())==null?void 0:T.setReferenceImageExportEnabled)==null||P.call(T,k.id,!k.exportEnabled)}}
															/>
														</div>
													</article>
												`)}
														</div>
													</section>
												`)}
										</div>
									`:$`
										<div class="scene-workspace-pane__placeholder">
											<div class="scene-asset-list__placeholder"></div>
										</div>
									`}
					</div>
				</div>
			</div>
		<//>
	`}function fw({activeShotCamera:i,controller:e,open:t=!0,summaryActions:n=null,onToggle:r=null,store:s,t:o}){return $`
		<${Jt}
			icon="camera"
			label=${o("section.shotCameraManager")}
			helpSectionId="shot-camera"
			onOpenHelp=${a=>{var c,l;return(l=(c=e())==null?void 0:c.openHelp)==null?void 0:l.call(c,{sectionId:a})}}
			open=${t}
			summaryActions=${n}
			onToggle=${r}
		>
			<${Db}
				activeShotCamera=${i}
				controller=${e}
				shotCameras=${s.workspace.shotCameras.value}
				t=${o}
			/>
		<//>
	`}function Rt({prefix:i,id:e,value:t,controller:n,historyLabel:r,onCommit:s,onScrubDelta:o=null,onScrubStart:a=null,formatDisplayValue:c=null,scrubStartValue:l=null,inputMode:u="decimal",min:h=void 0,max:d=void 0,step:p="0.01",disabled:m=!1}){return $`
		<div class="camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${i}</span>
			<div class="field camera-property-axis-field__input">
				<${Bn}
					id=${e}
					inputMode=${u}
					min=${h}
					max=${d}
					step=${p}
					value=${t}
					controller=${n}
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
	`}function gw({controller:i,headingActions:e=null,store:t,t:n}){return $`
		<section class="panel-section">
			<${ib} icon="zoom" title=${n("section.displayZoom")}>
				${e}
			<//>
			<label class="field field--inline-compact">
				<span>${n("field.cameraViewZoom")}</span>
				<div class="field--inline-compact__value">
					<div class="numeric-unit">
						<${Bn}
							id="view-zoom"
							inputMode="decimal"
							min=${Oh}
							max=${Lh}
							step="1"
							value=${Math.round(t.renderBox.viewZoom.value*100)}
							controller=${i}
							historyLabel="output-frame.zoom"
							onCommit=${r=>{var s,o;return(o=(s=i())==null?void 0:s.setViewZoomPercent)==null?void 0:o.call(s,r)}}
						/>
						<${Bu} value="%" title=${n("unit.percent")} />
					</div>
				</div>
			</label>
		</section>
	`}function yw({controller:i,equivalentMmValue:e,fovLabel:t,open:n=!0,summaryActions:r=null,onToggle:s=null,shotCameraClipMode:o,store:a,t:c}){const l=Number(a.shotCamera.positionX.value).toFixed(2),u=Number(a.shotCamera.positionY.value).toFixed(2),h=Number(a.shotCamera.positionZ.value).toFixed(2),d=Number(a.shotCamera.yawDeg.value).toFixed(2),p=Number(a.shotCamera.pitchDeg.value).toFixed(2),m=Number(a.shotCamera.rollDeg.value).toFixed(2),f=a.shotCamera.rollLock.value;return $`
		<${Jt}
			icon="camera-property"
			label=${c("section.shotCameraProperties")}
			helpSectionId="shot-camera"
			onOpenHelp=${g=>{var y,b;return(b=(y=i())==null?void 0:y.openHelp)==null?void 0:b.call(y,{sectionId:g})}}
			open=${n}
			summaryActions=${r}
			onToggle=${s}
		>
			<label class="field field--range">
				<span class="field-label-tooltip">
					${c("field.shotCameraEquivalentMm")}
					<${fe}
						title=${c("field.shotCameraEquivalentMm")}
						description=${c("tooltip.shotCameraEquivalentMmField")}
						placement="right"
					/>
				</span>
				<div class="range-row">
					<${Po}
						id="fov-mm"
						min=${14}
						max=${200}
						step="1"
						value=${e}
						controller=${i}
						historyLabel="camera.lens"
						onLiveChange=${g=>Io(y=>{var b;return(b=i())==null?void 0:b.setBaseFovX(y)},g.currentTarget.value,{snap:!0})}
					/>
					<div class="numeric-unit">
						<${Bn}
							id="fov-mm-input"
							inputMode="decimal"
							min=${14}
							max=${200}
							step="0.01"
							value=${Number(e).toFixed(2)}
							controller=${i}
							historyLabel="camera.lens"
							onCommit=${g=>Io(y=>{var b;return(b=i())==null?void 0:b.setBaseFovX(y)},g)}
						/>
						<${Bu} value="mm" title=${c("unit.millimeter")} />
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
					onClick=${()=>{var g;return(g=i())==null?void 0:g.copyViewportToShotCamera()}}
				/>
				<${K}
					id="copy-shot-to-viewport"
					icon="copy-to-viewport"
					label=${c("action.shotToViewport")}
					compact=${!0}
					tooltip=${{title:c("action.shotToViewport"),description:c("tooltip.copyShotPoseToViewport"),placement:"left"}}
					onClick=${()=>{var g;return(g=i())==null?void 0:g.copyShotCameraToViewport()}}
				/>
				<${K}
					id="reset-active-view"
					icon="reset"
					label=${c("action.resetActive")}
					compact=${!0}
					tooltip=${{title:c("action.resetActive"),description:c("tooltip.resetActiveView"),placement:"left"}}
					onClick=${()=>{var g;return(g=i())==null?void 0:g.resetActiveView()}}
				/>
			</div>
			<div class="camera-property-inline-row">
				<span class="camera-property-inline-row__label">${c("field.assetPosition")}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${Rt}
						prefix="X"
						id="shot-camera-position-x"
						value=${l}
						controller=${i}
						historyLabel="camera.position.x"
						onCommit=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setActiveShotCameraPositionAxis)==null?void 0:b.call(y,"x",g)}}
					/>
					<${Rt}
						prefix="Y"
						id="shot-camera-position-y"
						value=${u}
						controller=${i}
						historyLabel="camera.position.y"
						onCommit=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setActiveShotCameraPositionAxis)==null?void 0:b.call(y,"y",g)}}
					/>
					<${Rt}
						prefix="Z"
						id="shot-camera-position-z"
						value=${h}
						controller=${i}
						historyLabel="camera.position.z"
						onCommit=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setActiveShotCameraPositionAxis)==null?void 0:b.call(y,"z",g)}}
					/>
				</div>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--action">
				<span class="camera-property-inline-row__label">${c("field.assetRotation")}</span>
				<div class="camera-property-inline-row__content camera-property-inline-row__content--triplet">
					<${Rt}
						prefix="Y"
						id="shot-camera-yaw"
						value=${d}
						controller=${i}
						historyLabel="camera.rotation.yaw"
						onCommit=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setActiveShotCameraPoseAngle)==null?void 0:b.call(y,"yaw",g)}}
					/>
					<${Rt}
						prefix="P"
						id="shot-camera-pitch"
						value=${p}
						controller=${i}
						historyLabel="camera.rotation.pitch"
						onCommit=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setActiveShotCameraPoseAngle)==null?void 0:b.call(y,"pitch",g)}}
					/>
					<${Rt}
						prefix="R"
						id="shot-camera-roll"
						value=${m}
						controller=${i}
						historyLabel="camera.rotation.roll"
						onCommit=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setActiveShotCameraPoseAngle)==null?void 0:b.call(y,"roll",g)}}
					/>
				</div>
				<${K}
					icon=${f?"lock":"lock-open"}
					label=${c("field.shotCameraRollLock")}
					active=${f}
					compact=${!0}
					className="camera-property-inline-row__action"
					tooltip=${{title:c("field.shotCameraRollLock"),placement:"left"}}
					onClick=${()=>{var g,y;return(y=(g=i())==null?void 0:g.setShotCameraRollLock)==null?void 0:y.call(g,!f)}}
				/>
			</div>
			<div class="camera-property-inline-row camera-property-inline-row--clip">
				<div class="camera-property-inline-row__content camera-property-inline-row__content--clip">
					<${Rt}
						prefix=${c("field.shotCameraNear")}
						id="shot-camera-near"
						value=${Number(a.shotCamera.near.value).toFixed(2)}
						controller=${i}
						historyLabel="camera.near"
						min="0.1"
						step="0.1"
						disabled=${o==="auto"}
						onScrubStart=${()=>{var g,y;o==="auto"&&((y=(g=i())==null?void 0:g.setShotCameraClippingMode)==null||y.call(g,"manual"))}}
						onCommit=${g=>{var y;return(y=i())==null?void 0:y.setShotCameraNear(g)}}
					/>
					<${Rt}
						prefix=${c("field.shotCameraFar")}
						id="shot-camera-far"
						value=${Number(a.shotCamera.far.value).toFixed(2)}
						controller=${i}
						historyLabel="camera.far"
						min="0.1"
						step="0.1"
						disabled=${o==="auto"}
						onScrubStart=${()=>{var g,y;o==="auto"&&((y=(g=i())==null?void 0:g.setShotCameraClippingMode)==null||y.call(g,"manual"))}}
						onCommit=${g=>{var y;return(y=i())==null?void 0:y.setShotCameraFar(g)}}
					/>
				</div>
				<label class="switch-toggle camera-property-inline-row__switch">
					<input
						type="checkbox"
						checked=${o==="auto"}
						onChange=${g=>{var y,b;return(b=(y=i())==null?void 0:y.setShotCameraClippingMode)==null?void 0:b.call(y,g.currentTarget.checked?"auto":"manual")}}
					/>
					<span class="switch-toggle__control" aria-hidden="true">
						<span class="switch-toggle__thumb"></span>
					</span>
					<span class="switch-toggle__label field-label-tooltip">
						${c("clipMode.auto")}
						<${fe}
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
					<${Js}
						controller=${i}
						historyLabel="camera.local-move.horizontal"
						ariaLabel=${c("field.shotCameraMoveHorizontal")}
						step=${.02}
						onDelta=${g=>{var y,b;return(b=(y=i())==null?void 0:y.moveActiveShotCameraLocalAxis)==null?void 0:b.call(y,"right",g)}}
					/>
				</label>
				<label class="field">
					<span>${c("field.shotCameraMoveVertical")}</span>
					<${Js}
						controller=${i}
						historyLabel="camera.local-move.vertical"
						ariaLabel=${c("field.shotCameraMoveVertical")}
						step=${.02}
						onDelta=${g=>{var y,b;return(b=(y=i())==null?void 0:y.moveActiveShotCameraLocalAxis)==null?void 0:b.call(y,"up",g)}}
					/>
				</label>
				<label class="field">
					<span>${c("field.shotCameraMoveDepth")}</span>
					<${Js}
						controller=${i}
						historyLabel="camera.local-move.depth"
						ariaLabel=${c("field.shotCameraMoveDepth")}
						step=${.03}
						onDelta=${g=>{var y,b;return(b=(y=i())==null?void 0:y.moveActiveShotCameraLocalAxis)==null?void 0:b.call(y,"forward",g)}}
					/>
				</label>
			</div>
		<//>
	`}function _w({activeShotCamera:i,controller:e,exportFormat:t,exportGridLayerMode:n,exportGridOverlay:r,exportModelLayers:s,exportSplatLayers:o,open:a=!1,onToggle:c=null,summaryActions:l=null,store:u,t:h}){return $`
		<${Jt}
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
					<${fe}
						title=${h("field.shotCameraExportName")}
						description=${h("tooltip.shotCameraExportName")}
						placement="right"
					/>
				</span>
				<${Ti}
					id="shot-camera-export-name"
					placeholder=${(i==null?void 0:i.name)??"Camera"}
					value=${u.shotCamera.exportName.value}
					onCommit=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportName(d)}}
				/>
			</label>
			<label class="field">
				<span>${h("field.exportFormat")}</span>
				<select
					id="shot-camera-export-format"
					value=${t}
					...${Fo}
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
			${r&&$`
					<label class="field">
						<span class="field-label-tooltip">
							${h("field.exportGridLayerMode")}
							<${fe}
								title=${h("field.exportGridLayerMode")}
								description=${h("tooltip.exportGridLayerModeField")}
								placement="right"
							/>
						</span>
						<select
							id="shot-camera-export-grid-layer-mode"
							value=${n}
							...${Fo}
							onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportGridLayerMode(d.currentTarget.value)}}
						>
							<option value="bottom">${h("gridLayerMode.bottom")}</option>
							<option value="overlay">${h("gridLayerMode.overlay")}</option>
						</select>
					</label>
				`}
			${t==="psd"&&$`
					<label class="checkbox-field">
						<input
							id="shot-camera-export-model-layers"
							type="checkbox"
							checked=${s}
							onChange=${d=>{var p;return(p=e())==null?void 0:p.setShotCameraExportModelLayers(d.currentTarget.checked)}}
						/>
						<span class="field-label-tooltip">
							${h("field.exportModelLayers")}
							<${fe}
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
							<${fe}
								title=${h("field.exportSplatLayers")}
								description=${h("tooltip.exportSplatLayersField")}
								placement="right"
							/>
						</span>
					</label>
				`}
		<//>
	`}function bw({anchorOptions:i,controller:e,exportSizeLabel:t,open:n=!0,summaryActions:r=null,onToggle:s=null,heightLabel:o,store:a,t:c,widthLabel:l}){const u=a.renderBox.anchor.value;return $`
		<${Jt}
			icon="render-box"
			label=${c("section.outputFrame")}
			helpSectionId="output-frame-and-frames"
			onOpenHelp=${h=>{var d,p;return(p=(d=e())==null?void 0:d.openHelp)==null?void 0:p.call(d,{sectionId:h})}}
			open=${n}
			summaryMeta=${$`<span id="export-size-pill" class="pill pill--dim">${t}</span>`}
			summaryActions=${r}
			onToggle=${s}
		>
			<label class="field field--range">
				<span>${c("field.outputFrameWidth")}</span>
				<div class="range-row">
					<${Po}
						id="box-width"
						min=${ec}
						max=${$g}
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
					<${Po}
						id="box-height"
						min=${ec}
						max=${kg}
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
					<${fe}
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
						${i.map(h=>$`
								<button
									key=${h.value}
									type="button"
									class=${h.value===u?"anchor-matrix__cell anchor-matrix__cell--active":"anchor-matrix__cell"}
									aria-label=${h.label}
									title=${h.label}
									onPointerDown=${Y}
									onClick=${d=>{var p;Y(d),(p=e())==null||p.setAnchor(h.value)}}
								></button>
							`)}
					</div>
				</div>
			</div>
		<//>
	`}function xw({controller:i,exportBusy:e,exportPresetIds:t,exportSelectionMissing:n,exportTarget:r,open:s=!0,summaryActions:o=null,onToggle:a=null,store:c,t:l}){const u=c.referenceImages.exportSessionEnabled.value!==!1;return $`
		<${Jt}
			icon="export-tab"
			label=${l("section.export")}
			helpSectionId="export"
			onOpenHelp=${h=>{var d,p;return(p=(d=i())==null?void 0:d.openHelp)==null?void 0:p.call(d,{sectionId:h})}}
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
						disabled=${e||n}
						onClick=${()=>{var h;return(h=i())==null?void 0:h.downloadOutput()}}
					>
						${l("action.downloadOutput")}
					</button>
				</div>
				<select
					id="export-target"
					value=${r}
					...${Fo}
					onChange=${h=>{var d;return(d=i())==null?void 0:d.setExportTarget(h.currentTarget.value)}}
				>
					<option value="current">${l("exportTarget.current")}</option>
					<option value="all">${l("exportTarget.all")}</option>
					<option value="selected">${l("exportTarget.selected")}</option>
				</select>
			</div>
			${r==="selected"&&$`
					<div class="field">
						<span>${l("field.exportPresetSelection")}</span>
						<div class="export-selection-list">
							${c.workspace.shotCameras.value.map(h=>{var d,p;return $`
									<label class="export-selection-item">
										<input
											type="checkbox"
											checked=${t.includes(h.id)}
											onChange=${()=>{var m;return(m=i())==null?void 0:m.toggleExportPreset(h.id)}}
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
					onChange=${h=>{var d,p;return(p=(d=i())==null?void 0:d.setReferenceImageExportSessionEnabled)==null?void 0:p.call(d,h.currentTarget.checked)}}
				/>
				<span>${l("field.exportReferenceImages")}</span>
			</label>
		<//>
	`}function Nb({controller:i,mode:e,store:t,t:n}){var c,l;const r=e==="camera",s=n(r?"section.displayZoom":"section.view"),o=r?Math.round(t.renderBox.viewZoom.value*100):Number(t.viewportEquivalentMmValue.value).toFixed(2),a=r?!!((l=(c=i())==null?void 0:c.canFitOutputFrameToSafeArea)!=null&&l.call(c)):!1;return $`
		<div class="workbench-tool-rail__popover" role="group" aria-label=${s}>
			<label class="field workbench-tool-rail__popover-field">
				<span>${s}</span>
				<div class="workbench-tool-rail__popover-value">
					<div class="workbench-tool-rail__popover-input">
						<${Bn}
							id=${r?"tool-view-zoom":"tool-viewport-fov"}
							inputMode="decimal"
							min=${r?Oh:14}
							max=${r?Lh:200}
							step=${r?"1":"0.01"}
							value=${o}
							controller=${i}
							historyLabel=${r?"output-frame.zoom":"viewport.lens"}
							onCommit=${u=>{var h,d;return r?(d=(h=i())==null?void 0:h.setViewZoomPercent)==null?void 0:d.call(h,u):Io(p=>{var m;return(m=i())==null?void 0:m.setViewportBaseFovX(p)},u)}}
						/>
					</div>
					<span
						class="workbench-tool-rail__popover-suffix"
						aria-label=${n(r?"unit.percent":"unit.millimeter")}
						>${r?"%":"mm"}</span
					>
				</div>
			</label>
			${!r&&$`
					<p class="workbench-tool-rail__popover-summary">
						${n("field.viewportFov")} ${t.viewportFovLabel.value}
					</p>
				`}
			${r&&$`
					<div class="button-row button-row--compact workbench-tool-rail__popover-actions">
						<${K}
							icon="reset"
							label=${n("action.fitOutputFrameToSafeArea")}
							compact=${!0}
							disabled=${!a}
							onClick=${()=>{var u,h;return(h=(u=i())==null?void 0:u.fitOutputFrameToSafeArea)==null?void 0:h.call(u)}}
						/>
					</div>
				`}
		</div>
	`}function Bb({controller:i,hasFrames:e,store:t,t:n}){const r=t.frames.maskMode.value,s=t.frames.maskOpacityPct.value,o=t.frames.maskShape.value,a=t.frames.trajectoryMode.value,c=t.frames.trajectoryNodeMode.value,l=t.frames.trajectoryExportSource.value,u=t.frames.trajectoryEditMode.value,h=t.frames.maskSelectedIds.value??[],d=t.frames.selectedIds.value??[],p=t.frames.activeId.value,m=zr-t.frames.count.value,f=h.length>0,g=t.frames.count.value>1,y=g&&a==="spline"&&!!p,b=Math.max(d.length,p?1:0),M=t.frames.count.value<zr,v=b>0&&m>=b,w=d.length>0||!!p,A=[{value:"bounds",label:n("frameMaskShape.bounds")},{value:"trajectory",label:n("frameMaskShape.trajectory")}],_=[{value:"line",label:n("frameTrajectoryMode.line")},{value:"spline",label:n("frameTrajectoryMode.spline")}],x=[{value:"auto",label:n("frameTrajectoryNodeMode.auto")},{value:"corner",label:n("frameTrajectoryNodeMode.corner")},{value:"mirrored",label:n("frameTrajectoryNodeMode.mirrored")},{value:"free",label:n("frameTrajectoryNodeMode.free")}],k=[{value:"none",label:n("trajectorySource.none")},{value:"center",label:n("trajectorySource.center")},{value:"top-left",label:n("trajectorySource.topLeft")},{value:"top-right",label:n("trajectorySource.topRight")},{value:"bottom-right",label:n("trajectorySource.bottomRight")},{value:"bottom-left",label:n("trajectorySource.bottomLeft")}];return $`
		<div
			class="workbench-tool-rail__popover workbench-tool-rail__popover--mask"
			role="group"
			aria-label=${n("action.frameTool")}
		>
			<label class="field workbench-tool-rail__popover-field">
				<span>${n("section.frames")}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${K}
						icon="plus"
						label=${n("action.newFrame")}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!M}
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.createFrame)==null?void 0:T.call(S)}}
						tooltip=${{title:n("action.newFrame"),placement:"right"}}
					/>
					<${K}
						icon="duplicate"
						label=${n("action.duplicateFrame")}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!v}
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.duplicateSelectedFrames)==null?void 0:T.call(S,d.length>0?d:null)}}
						tooltip=${{title:n("action.duplicateFrame"),placement:"right"}}
					/>
					<${K}
						icon="trash"
						label=${n("action.deleteFrame")}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!w}
						onClick=${()=>{var S,T,P,N;return d.length>0?(T=(S=i())==null?void 0:S.deleteSelectedFrames)==null?void 0:T.call(S,d):(N=(P=i())==null?void 0:P.deleteActiveFrame)==null?void 0:N.call(P)}}
						tooltip=${{title:n("action.deleteFrame"),placement:"right"}}
					/>
				</div>
			</label>
			<label class="field workbench-tool-rail__popover-field">
				<span>${n("section.mask")}</span>
				<div class="frame-mask-toolbar__buttons workbench-tool-rail__popover-mask-buttons">
					<${K}
						icon="slash-circle"
						label=${n("transformMode.none")}
						active=${r==="off"}
						compact=${!0}
						className="frame-mask-toolbar__button"
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.setFrameMaskMode)==null?void 0:T.call(S,"off")}}
						tooltip=${{title:n("transformMode.none"),placement:"right"}}
					/>
					<${K}
						icon="mask-all"
						label=${n("action.toggleAllFrameMask")}
						active=${r==="all"}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!e}
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.toggleFrameMaskMode)==null?void 0:T.call(S,"all")}}
						tooltip=${{title:n("action.toggleAllFrameMask"),description:n("tooltip.frameMaskAll"),shortcut:"F",placement:"right"}}
					/>
					<${K}
						icon="mask-selected"
						label=${n("action.toggleSelectedFrameMask")}
						active=${r==="selected"}
						compact=${!0}
						className="frame-mask-toolbar__button"
						disabled=${!f}
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.toggleFrameMaskMode)==null?void 0:T.call(S,"selected")}}
						tooltip=${{title:n("action.toggleSelectedFrameMask"),description:n("tooltip.frameMaskSelected"),shortcut:"Shift+F",placement:"right"}}
					/>
				</div>
			</label>
			<div class="workbench-tool-rail__popover-grid">
				<label class="field workbench-tool-rail__popover-field">
					<span>${n("field.frameMaskOpacity")}</span>
					<div class="workbench-tool-rail__popover-value">
						<div class="workbench-tool-rail__popover-input">
							<${Bn}
								id="tool-frame-mask-opacity"
								inputMode="decimal"
								min="0"
								max="100"
								step="1"
								value=${Number(s).toFixed(0)}
								controller=${i}
								disabled=${!e}
								historyLabel="frame.mask-opacity"
								onCommit=${S=>{var T,P;return(P=(T=i())==null?void 0:T.setFrameMaskOpacity)==null?void 0:P.call(T,S)}}
							/>
						</div>
						<span
							class="workbench-tool-rail__popover-suffix"
							aria-label=${n("unit.percent")}
							>%</span
						>
					</div>
				</label>
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${n("field.frameMaskShape")}
						<${fe}
							title=${n("field.frameMaskShape")}
							description=${n("tooltip.frameMaskShapeField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${o}
							onChange=${S=>{var T,P;return(P=(T=i())==null?void 0:T.setFrameMaskShape)==null?void 0:P.call(T,S.currentTarget.value)}}
						>
							${A.map(S=>$`
									<option value=${S.value}>${S.label}</option>
								`)}
						</select>
					</div>
				</label>
			</div>
			<div class="workbench-tool-rail__popover-mode-row">
				<label class="field workbench-tool-rail__popover-field workbench-tool-rail__popover-mode-field">
					<span class="field-label-tooltip">
						${n("field.frameTrajectoryMode")}
						<${fe}
							title=${n("field.frameTrajectoryMode")}
							description=${n("tooltip.frameTrajectoryModeField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${a}
							disabled=${!e}
							onChange=${S=>{var T,P;return(P=(T=i())==null?void 0:T.setFrameTrajectoryMode)==null?void 0:P.call(T,S.currentTarget.value)}}
						>
							${_.map(S=>$`
									<option value=${S.value}>${S.label}</option>
								`)}
						</select>
					</div>
				</label>
				<div class="button-row button-row--compact workbench-tool-rail__popover-actions workbench-tool-rail__popover-mode-actions">
					<${K}
						icon="cursor"
						label=${n("action.toggleFrameTrajectoryEdit")}
						active=${u}
						compact=${!0}
						disabled=${!e}
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.toggleFrameTrajectoryEditMode)==null?void 0:T.call(S)}}
						tooltip=${{title:n("action.toggleFrameTrajectoryEdit"),description:n("tooltip.toggleFrameTrajectoryEdit"),placement:"right"}}
					/>
					<${K}
						icon="reset"
						label=${n("action.resetFrameTrajectoryNodeAuto")}
						compact=${!0}
						disabled=${!y||c==="auto"}
						onClick=${()=>{var S,T;return(T=(S=i())==null?void 0:S.setFrameTrajectoryNodeMode)==null?void 0:T.call(S,p,"auto")}}
						tooltip=${{title:n("action.resetFrameTrajectoryNodeAuto"),description:n("tooltip.resetFrameTrajectoryNodeAuto"),placement:"right"}}
					/>
				</div>
			</div>
			<div class="workbench-tool-rail__popover-grid">
				${y&&$`
						<label class="field workbench-tool-rail__popover-field">
							<span class="field-label-tooltip">
								${n("field.frameTrajectoryNodeMode")}
								<${fe}
									title=${n("field.frameTrajectoryNodeMode")}
									description=${n("tooltip.frameTrajectoryNodeModeField")}
									placement="right"
								/>
							</span>
							<div class="workbench-tool-rail__popover-value">
								<select
									class="workbench-tool-rail__popover-select"
									value=${c}
									onChange=${S=>{var T,P;return(P=(T=i())==null?void 0:T.setFrameTrajectoryNodeMode)==null?void 0:P.call(T,p,S.currentTarget.value)}}
								>
									${x.map(S=>$`
											<option value=${S.value}>${S.label}</option>
										`)}
								</select>
							</div>
						</label>
					`}
				<label class="field workbench-tool-rail__popover-field">
					<span class="field-label-tooltip">
						${n("field.frameTrajectoryExportSource")}
						<${fe}
							title=${n("field.frameTrajectoryExportSource")}
							description=${n("tooltip.frameTrajectoryExportSourceField")}
							placement="right"
						/>
					</span>
					<div class="workbench-tool-rail__popover-value">
						<select
							class="workbench-tool-rail__popover-select"
							value=${l}
							disabled=${!g}
							onChange=${S=>{var T,P;return(P=(T=i())==null?void 0:T.setFrameTrajectoryExportSource)==null?void 0:P.call(T,S.currentTarget.value)}}
						>
							${k.map(S=>$`
									<option value=${S.value}>${S.label}</option>
								`)}
						</select>
					</div>
				</label>
			</div>
		</div>
	`}function vw({controller:i,mode:e,menuChildren:t=null,projectMenuItems:n=[],railRef:r=null,railOnWheel:s=null,store:o,tailContent:a=null,showQuickMenu:c=!1,t:l,tooltipPlacement:u="right",menuPanelPlacement:h="down"}){const d=e==="viewport"||e==="camera",p=o.selectedSceneAsset.value,m=o.interactionMode.value,f=o.frames.maskMode.value,g=o.measurement.active.value,y=o.frames.count.value>0,b=o.history.canUndo.value,M=o.history.canRedo.value,[v,w]=ge(!1),A=Me(null),_=!!p&&(o.viewportTransformMode.value||o.viewportPivotEditMode.value),x=d&&m==="zoom",k=e==="camera"&&v,S=l(e==="camera"?"section.displayZoom":"section.view"),T=`${l("section.transformSpace")} / ${l("transformSpace.world")}`,P=`${l("section.transformSpace")} / ${l("transformSpace.local")}`;De(()=>{if(!k)return;const F=G=>{var Z,B;const ne=G.target instanceof Element?G.target:null;ne!=null&&ne.closest(".frame-item, .frame-trajectory-layer")||(Z=A.current)!=null&&Z.contains(ne)||(B=A.current)!=null&&B.contains(ne)||w(!1)},O=G=>{G.key==="Escape"&&w(!1)};return document.addEventListener("pointerdown",F,!0),document.addEventListener("keydown",O),()=>{document.removeEventListener("pointerdown",F,!0),document.removeEventListener("keydown",O)}},[k]),De(()=>{e!=="camera"&&w(!1)},[e]);const N=()=>{var F,O,G,ne,Z,B,j,le,xe,st,D,X,Q,V,_e;(O=(F=i())==null?void 0:F.clearSceneAssetSelection)==null||O.call(F),(ne=(G=i())==null?void 0:G.clearSplatSelection)==null||ne.call(G),(B=(Z=i())==null?void 0:Z.clearReferenceImageSelection)==null||B.call(Z),(le=(j=i())==null?void 0:j.clearFrameSelection)==null||le.call(j),(st=(xe=i())==null?void 0:xe.clearOutputFrameSelection)==null||st.call(xe),(X=(D=i())==null?void 0:D.setMeasurementMode)==null||X.call(D,!1,{silent:!0}),(V=(Q=i())==null?void 0:Q.setSplatEditMode)==null||V.call(Q,!1,{silent:!0}),(_e=i())==null||_e.setViewportTransformMode(!1)},H=(F,O)=>{if(F){N();return}O==null||O()};return $`
		<section
			class="workbench-tool-rail"
			aria-label=${l("section.tools")}
			ref=${r}
			onWheel=${s}
		>
			<${sb}
				label=${l("section.file")}
				items=${n}
				panelPlacement=${h}
				tooltip=${{title:l("section.file"),description:l("tooltip.fileMenu"),placement:u}}
			>
				${t}
			<//>
			${c&&$`
					<${K}
						icon="undo"
						label=${l("action.undo")}
						disabled=${!b}
						className="workbench-tool-rail__button"
						tooltip=${{title:l("action.undo"),description:l("tooltip.undo"),shortcut:"Ctrl+Z",placement:u}}
						onClick=${()=>{var F,O;return(O=(F=i())==null?void 0:F.undoHistory)==null?void 0:O.call(F)}}
					/>
					<${K}
						icon="redo"
						label=${l("action.redo")}
						disabled=${!M}
						className="workbench-tool-rail__button"
						tooltip=${{title:l("action.redo"),description:l("tooltip.redo"),shortcut:"Ctrl+Shift+Z",placement:u}}
						onClick=${()=>{var F,O;return(O=(F=i())==null?void 0:F.redoHistory)==null?void 0:O.call(F)}}
					/>
				`}
			${c&&$`
					<${K}
						icon="pie-menu"
						label=${l("action.quickMenu")}
						className="workbench-tool-rail__button"
						tooltip=${{title:l("action.quickMenu"),description:l("tooltip.quickMenu"),placement:u}}
						onClick=${()=>{var F,O;return(O=(F=i())==null?void 0:F.openViewportPieMenuAtCenter)==null?void 0:O.call(F)}}
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
						onClick=${()=>{var F;return(F=i())==null?void 0:F.setMode("camera")}}
					>
						<${be} name="camera-dslr" size=${16} />
						<${fe}
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
						onClick=${()=>{var F;return(F=i())==null?void 0:F.setMode("viewport")}}
					>
						<${be} name="viewport" size=${16} />
						<${fe}
							title=${l("mode.viewport")}
							description=${l("tooltip.modeViewport")}
							placement=${u}
						/>
					</button>
				</div>
			</div>
			${d&&$`
					<div class="workbench-tool-rail__divider"></div>
					<div class="workbench-tool-rail__group">
							<${K}
								icon="cursor"
								label=${l("transformMode.select")}
								active=${o.viewportSelectMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.select"),description:l("tooltip.toolSelect"),shortcut:"V",placement:u}}
								onClick=${()=>H(o.viewportSelectMode.value,()=>{var F;return(F=i())==null?void 0:F.setViewportSelectMode(!0)})}
							/>
							<${K}
								icon="reference-tool"
								label=${l("transformMode.reference")}
								active=${o.viewportReferenceImageEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.reference"),description:l("tooltip.toolReference"),shortcut:"Shift+R",placement:u}}
								onClick=${()=>H(o.viewportReferenceImageEditMode.value,()=>{var F;return(F=i())==null?void 0:F.setViewportReferenceImageEditMode(!0)})}
							/>
							<${K}
								icon="grip"
								label=${l("action.splatEditTool")}
								active=${o.splatEdit.active.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("action.splatEditTool"),description:l("tooltip.toolSplatEdit"),shortcut:"Shift+E",placement:u}}
								onClick=${()=>H(o.splatEdit.active.value,()=>{var F,O;return(O=(F=i())==null?void 0:F.setSplatEditMode)==null?void 0:O.call(F,!0)})}
							/>
							<${K}
								icon="move"
								label=${l("transformMode.transform")}
								active=${o.viewportTransformMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.transform"),description:l("tooltip.toolTransform"),shortcut:"T",placement:u}}
								onClick=${()=>H(o.viewportTransformMode.value,()=>{var F;return(F=i())==null?void 0:F.setViewportTransformMode(!0)})}
							/>
							<${K}
								icon="pivot"
								label=${l("transformMode.pivot")}
								active=${o.viewportPivotEditMode.value}
								className="workbench-tool-rail__button"
								tooltip=${{title:l("transformMode.pivot"),description:l("tooltip.toolPivot"),shortcut:"Q",placement:u}}
								onClick=${()=>H(o.viewportPivotEditMode.value,()=>{var F;return(F=i())==null?void 0:F.setViewportPivotEditMode(!0)})}
							/>
							<div class="workbench-tool-rail__tool-slot">
								<${K}
									icon="zoom"
									label=${l("action.zoomTool")}
									active=${x}
									className="workbench-tool-rail__button"
									tooltip=${{title:S,description:l("tooltip.toolZoom"),shortcut:"Z",placement:u}}
									onClick=${()=>{var F,O;return(O=(F=i())==null?void 0:F.toggleZoomTool)==null?void 0:O.call(F)}}
								/>
								${x&&$`
										<${Nb}
											controller=${i}
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
								onClick=${()=>{var F,O;return(O=(F=i())==null?void 0:F.toggleMeasurementMode)==null?void 0:O.call(F)}}
							/>
							${e==="camera"&&$`
									<div
										class="workbench-tool-rail__tool-slot"
										ref=${A}
									>
										<${K}
											icon="mask"
											label=${l("action.frameTool")}
											active=${k||f!=="off"}
											className="workbench-tool-rail__button"
											tooltip=${{title:l("action.frameTool"),description:l("tooltip.frameTool"),shortcut:"F",placement:u}}
											onClick=${()=>w(F=>!F)}
										/>
										${k&&$`
												<${Bb}
													controller=${i}
													hasFrames=${y}
													store=${o}
													t=${l}
												/>
											`}
									</div>
								`}
					</div>
					${_&&$`
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
										aria-label=${T}
										title=${T}
										onClick=${()=>{var F;return(F=i())==null?void 0:F.setViewportTransformSpace("world")}}
									>
										W
									</button>
									<button
										type="button"
										class=${o.viewportTransformSpace.value==="local"?"workbench-tool-rail__segment is-active":"workbench-tool-rail__segment"}
										aria-label=${P}
										title=${P}
										onClick=${()=>{var F;return(F=i())==null?void 0:F.setViewportTransformSpace("local")}}
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
							onClick=${()=>N()}
						/>
					</div>
				`}
			${a}
		</section>
	`}function ww({activeQuickSectionId:i=null,activeTab:e,onOpenFullTab:t,onToggleQuickSection:n,quickSections:r=[],t:s}){const o=Lu(s);return $`
		<section class="workbench-inspector-rail" aria-label=${s("section.project")}>
			<div class="workbench-inspector-rail__group">
				${o.map(a=>{var c,l,u;return $`
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
			${r.length>0&&$`
					<div class="workbench-inspector-rail__divider"></div>
					<div class="workbench-inspector-rail__group">
						${r.map(a=>$`
								<${K}
									key=${a.id}
									icon=${a.icon}
									label=${a.label}
									active=${i===a.id}
									compact=${!0}
									className="workbench-inspector-rail__button"
									tooltip=${{title:a.label,description:s("tooltip.openQuickSection"),placement:"left"}}
									onClick=${()=>n==null?void 0:n(a.id)}
								/>
							`)}
					</div>
				`}
		</section>
	`}function Mw({activeTab:i,setActiveTab:e,t}){const n=Lu(t);return $`
		<${rb}
			tabs=${n}
			activeTab=${i}
			setActiveTab=${e}
			ariaLabel=${t("section.project")}
			iconOnly=${!0}
		/>
	`}const Ic=15,Ob={right:0,"top-right":135,top:90,"top-left":45,left:0,"bottom-left":135,bottom:90,"bottom-right":45},Ks=new Map;function Lb(i){const e=Number.isFinite(i)?i%360:0;return e<0?e+360:e}function jb(i){return Math.round(Lb(i)/Ic)*Ic}function Vb(i){return`
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${i} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6.6 16H25.4" stroke="#ffffff" stroke-width="4.8" />
				<path d="M6.6 16H25.4" stroke="#111111" stroke-width="1.9" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim()}function zo(i,e){const t=Ob[e]??0,n=jb((i??0)+t);if(!Ks.has(n)){const r=encodeURIComponent(Vb(n));Ks.set(n,`url("data:image/svg+xml,${r}") 16 16, ew-resize`)}return Ks.get(n)}function Dc(i){return!!(i&&i.width>0&&i.height>0)}function zc(i,{preferClientSize:e=!1}={}){if(!i)return null;const t=Number(e?i.clientWidth??i.offsetWidth??0:i.offsetWidth??i.clientWidth??0),n=Number(e?i.clientHeight??i.offsetHeight??0:i.offsetHeight??i.clientHeight??0);return!(t>0)||!(n>0)?null:{left:Number(i.offsetLeft??0),top:Number(i.offsetTop??0),width:t,height:n}}function Ub({viewportRect:i=null,renderBoxRect:e=null}={}){const t=Dc(e)?e:i;if(Dc(t))return{left:`${t.left+t.width*.5}px`,top:`${t.top+t.height*.5}px`,bottom:"auto",transform:"translate(-50%, -50%)"}}const Nc=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Bc=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"];function Hb(i){return!Number.isFinite(i==null?void 0:i.x)||!Number.isFinite(i==null?void 0:i.y)||i.x<0||i.x>1||i.y<0||i.y>1?"":Ma(i)}function Gb(i=[]){return!Array.isArray(i)||i.length===0?"":i.map((e,t)=>`${t===0?"M":"L"} ${Number(e.x).toFixed(2)} ${Number(e.y).toFixed(2)}`).join(" ")}function Oc(i,e){return!i||!e?0:Math.hypot(i.x-e.x,i.y-e.y)}function Lc(i,e){return!i||!e?null:{x:e.x-(i.x-e.x),y:e.y-(i.y-e.y)}}function Wb({controller:i,exportWidth:e,exportHeight:t,frames:n,frameMaskShape:r,trajectoryMode:s,trajectoryNodesByFrameId:o,trajectoryEditMode:a,activeTrajectoryNodeMode:c,activeFrameId:l,selectedFrameIds:u,interactionsEnabled:h}){if(!(r===ui||a)||n.length===0)return null;const p={trajectoryMode:s,trajectory:{nodesByFrameId:o}},m=Jh(n,p,e,t,{source:Ge}),f=n.find(G=>G.id===l)??n[n.length-1]??null,g=f?n.findIndex(G=>G.id===f.id):-1,y=f?{x:f.x*e,y:f.y*t}:null,b=a&&s===di&&f&&c!=="corner",M=b?An(n,p,f.id,"in",e,t):null,v=b?An(n,p,f.id,"out",e,t):null,w=M?{x:M.x*e,y:M.y*t}:null,A=v?{x:v.x*e,y:v.y*t}:null,_=w&&y&&Oc(w,y)>1?w:null,x=A&&y&&Oc(A,y)>1?A:null,k=b&&c==="auto"&&(g===0||g===n.length-1),S=k&&!_&&x&&y?Lc(x,y):null,T=k&&!x&&_&&y?Lc(_,y):null,P=_??S,N=x??T,H=!!S,F=!!T,O=(G,ne)=>{var Z,B;return(B=(Z=i())==null?void 0:Z.startFrameTrajectoryHandleDrag)==null?void 0:B.call(Z,f.id,G,ne)};return $`
		<div class="frame-trajectory-layer">
			<svg
				class="frame-trajectory-layer__svg"
				viewBox=${`0 0 ${e} ${t}`}
				preserveAspectRatio="none"
			>
				${m.length>=2&&$`
						<path
							class=${a?"frame-trajectory-layer__path frame-trajectory-layer__path--editing":"frame-trajectory-layer__path"}
							d=${Gb(m)}
						></path>
					`}
				${a&&y&&P&&$`
						<line
							class=${["frame-trajectory-layer__handle-guide","frame-trajectory-layer__handle-guide--in",H?"frame-trajectory-layer__handle-guide--ghost":""].filter(Boolean).join(" ")}
							x1=${y.x}
							y1=${y.y}
							x2=${P.x}
							y2=${P.y}
						></line>
					`}
				${a&&y&&N&&$`
						<line
							class=${["frame-trajectory-layer__handle-guide","frame-trajectory-layer__handle-guide--out",F?"frame-trajectory-layer__handle-guide--ghost":""].filter(Boolean).join(" ")}
							x1=${y.x}
							y1=${y.y}
							x2=${N.x}
							y2=${N.y}
						></line>
					`}
				${a&&n.map(G=>{const ne=u.has(G.id);return $`
							<circle
								class=${["frame-trajectory-layer__node-hit",ne?"frame-trajectory-layer__node-hit--selected":"",G.id===l?"frame-trajectory-layer__node-hit--active":""].filter(Boolean).join(" ")}
								cx=${G.x*e}
								cy=${G.y*t}
								r="14"
								onPointerDown=${h?Z=>{var B,j;return(j=(B=i())==null?void 0:B.startFrameDrag)==null?void 0:j.call(B,G.id,Z)}:void 0}
							></circle>
							<circle
								class=${["frame-trajectory-layer__node",ne?"frame-trajectory-layer__node--selected":"",G.id===l?"frame-trajectory-layer__node--active":""].filter(Boolean).join(" ")}
								cx=${G.x*e}
								cy=${G.y*t}
								r="12"
								onPointerDown=${h?Z=>{var B,j;return(j=(B=i())==null?void 0:B.startFrameDrag)==null?void 0:j.call(B,G.id,Z)}:void 0}
							></circle>
						`})}
				${a&&P&&$`
						<circle
							class=${["frame-trajectory-layer__handle-contrast","frame-trajectory-layer__handle-contrast--in",H?"frame-trajectory-layer__handle-contrast--ghost":""].filter(Boolean).join(" ")}
							cx=${P.x}
							cy=${P.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${P.x}
							cy=${P.y}
							r="12"
							onPointerDown=${h?G=>O("in",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle","frame-trajectory-layer__handle--in",H?"frame-trajectory-layer__handle--ghost":""].filter(Boolean).join(" ")}
							cx=${P.x}
							cy=${P.y}
							r="9"
							onPointerDown=${h?G=>O("in",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle-core","frame-trajectory-layer__handle-core--in",H?"frame-trajectory-layer__handle-core--ghost":""].filter(Boolean).join(" ")}
							cx=${P.x}
							cy=${P.y}
							r="2.25"
						></circle>
					`}
				${a&&N&&$`
						<circle
							class=${["frame-trajectory-layer__handle-contrast","frame-trajectory-layer__handle-contrast--out",F?"frame-trajectory-layer__handle-contrast--ghost":""].filter(Boolean).join(" ")}
							cx=${N.x}
							cy=${N.y}
							r="9"
						></circle>
						<circle
							class="frame-trajectory-layer__handle-hit"
							cx=${N.x}
							cy=${N.y}
							r="12"
							onPointerDown=${h?G=>O("out",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle","frame-trajectory-layer__handle--out",F?"frame-trajectory-layer__handle--ghost":""].filter(Boolean).join(" ")}
							cx=${N.x}
							cy=${N.y}
							r="9"
							onPointerDown=${h?G=>O("out",G):void 0}
						></circle>
						<circle
							class=${["frame-trajectory-layer__handle-core","frame-trajectory-layer__handle-core--out",F?"frame-trajectory-layer__handle-core--ghost":""].filter(Boolean).join(" ")}
							cx=${N.x}
							cy=${N.y}
							r="2.25"
						></circle>
					`}
			</svg>
		</div>
	`}function jc({store:i,controller:e,frameOverlayCanvasRef:t,canvasOnly:n=!1,itemsOnly:r=!1,interactionsEnabled:s=!0}){const o=i.exportWidth.value,a=i.exportHeight.value,c=i.locale.value,l=i.frames.activeId.value,u=i.frames.selectionActive.value,h=new Set(i.frames.selectedIds.value??[]),d=u&&h.size>1,p=h.size,m=i.frames.selectionBoxLogical.value,f=i.frames.maskShape.value,g=i.frames.trajectoryMode.value,y=i.frames.trajectoryEditMode.value,b=i.frames.trajectoryNodesByFrameId.value??{},M=i.frames.trajectoryNodeMode.value??ca({trajectory:{nodesByFrameId:b}},l),v=i.frames.selectionAnchor.value&&Number.isFinite(i.frames.selectionAnchor.value.x)&&Number.isFinite(i.frames.selectionAnchor.value.y)?{x:i.frames.selectionAnchor.value.x,y:i.frames.selectionAnchor.value.y}:m?{x:m.anchorX??.5,y:m.anchorY??.5}:null;return $`
		<div
			class=${["frame-layer",n?"frame-layer--canvas":"",r?"frame-layer--items":"",s?"":"frame-layer--noninteractive"].filter(Boolean).join(" ")}
		>
			${!r&&$`
					<canvas
						id="frame-overlay-canvas"
						ref=${t}
						class="frame-layer__canvas"
					></canvas>
				`}
			${!n&&$`
					<${Wb}
						controller=${e}
						exportWidth=${o}
						exportHeight=${a}
						frames=${i.frames.documents.value}
						frameMaskShape=${f}
						trajectoryMode=${g}
						trajectoryNodesByFrameId=${b}
						trajectoryEditMode=${y}
						activeTrajectoryNodeMode=${M}
						activeFrameId=${l}
						selectedFrameIds=${h}
						interactionsEnabled=${s}
					/>
				`}
			${!n&&i.frames.documents.value.map(w=>{const A=Number(w.scale)>0?w.scale:1,_=`${Math.round(A*100)}%`,x=tt.width*A*100/o,k=tt.height*A*100/a,S=u&&h.has(w.id),P=S&&l===w.id&&!d,N=S&&!d,H=S&&!d,F=(w.rotation??0)*Math.PI/180,O=b0(w,{width:tt.width*A,height:tt.height*A,rotationRadians:F},{boxWidth:o,boxHeight:a}),G=Ma(O),ne=Ue(c,"action.deleteFrame"),Z=Ue(c,"action.renameFrame");return $`
						<div
							class=${["frame-item",S?"frame-item--selected":"",P?"frame-item--active":""].filter(Boolean).join(" ")}
							data-anchor-handle=${G}
							style=${{left:`${w.x*100-x*.5}%`,top:`${w.y*100-k*.5}%`,width:`${x}%`,height:`${k}%`,transform:`rotate(${w.rotation??0}deg)`,transformOrigin:"center center"}}
						>
							${N&&$`
									<span class="frame-item__label">
										<span class="frame-item__label-text"
											><${Ti}
												class="frame-item__label-input"
												value=${w.name}
												aria-label=${Z}
												maxLength=${cu}
												selectOnFocus=${!0}
												onCommit=${B=>{var j,le;return(le=(j=e())==null?void 0:j.setFrameName)==null?void 0:le.call(j,w.id,B)}}
											/></span
										>
										<span class="frame-item__label-scale"
											>${_}</span
										>
										${H&&$`
												<button
													type="button"
													class="frame-item__label-delete"
													aria-label=${ne}
													title=${ne}
													onPointerDown=${B=>{s&&(B.preventDefault(),B.stopPropagation())}}
													onClick=${s?B=>{var j,le;B.preventDefault(),B.stopPropagation(),(le=(j=e())==null?void 0:j.deleteFrame)==null||le.call(j,w.id)}:void 0}
												>
													<${be} name="trash" size=${11} />
												</button>
											`}
									</span>
								`}
							<button
								type="button"
								class="frame-item__edge frame-item__edge--top"
								aria-label=${w.name}
								onPointerDown=${s?B=>{var j;return(j=e())==null?void 0:j.startFrameDrag(w.id,B)}:void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--right"
								aria-label=${w.name}
								onPointerDown=${s?B=>{var j;return(j=e())==null?void 0:j.startFrameDrag(w.id,B)}:void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--bottom"
								aria-label=${w.name}
								onPointerDown=${s?B=>{var j;return(j=e())==null?void 0:j.startFrameDrag(w.id,B)}:void 0}
							></button>
							<button
								type="button"
								class="frame-item__edge frame-item__edge--left"
								aria-label=${w.name}
								onPointerDown=${s?B=>{var j;return(j=e())==null?void 0:j.startFrameDrag(w.id,B)}:void 0}
							></button>
							${Nc.map(B=>$`
									<button
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${B}`}
										style=${{cursor:zo(w.rotation??0,B)}}
										aria-label=${w.name}
										onPointerDown=${s?j=>{var le;return(le=e())==null?void 0:le.startFrameResize(w.id,B,j)}:void 0}
									></button>
								`)}
							${Bc.map(B=>$`
									<button
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${B}`}
										style=${{cursor:ko(w.rotation??0,B)}}
										aria-label=${w.name}
										onPointerDown=${s?j=>{var le;return(le=e())==null?void 0:le.startFrameRotate(w.id,B,j)}:void 0}
									></button>
								`)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${{left:`${O.x*100}%`,top:`${O.y*100}%`}}
								aria-label=${w.name}
								onPointerDown=${s?B=>{var j;return(j=e())==null?void 0:j.startFrameAnchorDrag(w.id,B)}:void 0}
							></button>
						</div>
					`})}
			${!n&&d&&m&&v&&$`
					<div
						class="frame-item frame-item--selected frame-item--active frame-selection-group"
						data-anchor-handle=${Hb(v)}
						style=${{left:`${m.left*100/o}%`,top:`${m.top*100/a}%`,width:`${m.width*100/o}%`,height:`${m.height*100/a}%`,transform:`rotate(${m.rotationDeg??0}deg)`,transformOrigin:`${v.x*100}% ${v.y*100}%`}}
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
								aria-label=${Ue(c,"action.deleteFrame")}
								title=${Ue(c,"action.deleteFrame")}
								onPointerDown=${w=>{w.preventDefault(),w.stopPropagation()}}
								onClick=${w=>{var A,_;w.preventDefault(),w.stopPropagation(),(_=(A=e())==null?void 0:A.deleteSelectedFrames)==null||_.call(A)}}
							>
								<${be} name="trash" size=${11} />
							</button>
						</span>
						${["top","right","bottom","left"].map(w=>$`
								<button
									type="button"
									class=${`frame-item__edge frame-item__edge--${w}`}
									aria-label="Selected FRAMEs"
									onPointerDown=${s?A=>{var _,x;return(x=(_=e())==null?void 0:_.startSelectedFramesDrag)==null?void 0:x.call(_,A)}:void 0}
								></button>
							`)}
						${Nc.map(w=>$`
								<button
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${w}`}
									style=${{cursor:zo(m.rotationDeg??0,w)}}
									aria-label="Resize selected FRAMEs"
									onPointerDown=${s?A=>{var _,x;return(x=(_=e())==null?void 0:_.startSelectedFramesResize)==null?void 0:x.call(_,w,A)}:void 0}
								></button>
							`)}
						${Bc.map(w=>$`
								<button
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${w}`}
									style=${{cursor:ko(m.rotationDeg??0,w)}}
									aria-label="Rotate selected FRAMEs"
									onPointerDown=${s?A=>{var _,x;return(x=(_=e())==null?void 0:_.startSelectedFramesRotate)==null?void 0:x.call(_,w,A)}:void 0}
								></button>
							`)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{left:`${v.x*100}%`,top:`${v.y*100}%`}}
							aria-label="Move selected FRAME anchor"
							onPointerDown=${s?w=>{var A,_;return(_=(A=e())==null?void 0:A.startSelectedFramesAnchorDrag)==null?void 0:_.call(A,w)}:void 0}
						></button>
					</div>
				`}
		</div>
	`}function Qs(i){return{left:`${i.x}px`,top:`${i.y}px`}}function Xb(i,e){const t=((e==null?void 0:e.x)??0)-((i==null?void 0:i.x)??0),n=((e==null?void 0:e.y)??0)-((i==null?void 0:i.y)??0),r=Math.hypot(t,n);return!Number.isFinite(r)||r<=.001?null:{left:`${i.x}px`,top:`${i.y}px`,width:`${r}px`,transform:`rotate(${Math.atan2(n,t)}rad)`}}function Yb({store:i,controller:e,t}){var d;if(!i.measurement.active.value)return null;const r=i.measurement.overlay.value,s=!!i.measurement.startPointWorld.value,o=!!i.measurement.endPointWorld.value,a=i.measurement.selectedPointKey.value??(o?"end":"start"),c=Number(i.measurement.lengthInputText.value),l=o&&r.chip.visible&&(((d=i.selectedSceneAssetIds.value)==null?void 0:d.length)??0)>0&&Number.isFinite(c)&&c>0,u=r.lineUsesDraft?r.draftEnd:r.end,h=r.lineVisible&&r.start.visible&&(u!=null&&u.visible)?Xb(r.start,u):null;return $`
		<div class="measurement-overlay" aria-hidden="false">
			${h&&$`
					<div
						class=${r.lineUsesDraft?"measurement-overlay__line-track measurement-overlay__line-track--draft":"measurement-overlay__line-track"}
						style=${h}
					>
						<div class="measurement-overlay__line-outline"></div>
						<div class="measurement-overlay__line-main"></div>
					</div>
				`}
			${s&&r.start.visible&&$`
					<button
						type="button"
						class=${a==="start"?"measurement-overlay__point measurement-overlay__point--selected":"measurement-overlay__point"}
						style=${Qs(r.start)}
						aria-label=${t("action.measurementStartPoint")}
						onPointerDown=${p=>{var m,f;return(f=(m=e())==null?void 0:m.selectMeasurementPoint)==null?void 0:f.call(m,"start",p)}}
					></button>
				`}
			${o&&r.end.visible&&$`
					<button
						type="button"
						class=${a==="end"?"measurement-overlay__point measurement-overlay__point--selected":"measurement-overlay__point"}
						style=${Qs(r.end)}
						aria-label=${t("action.measurementEndPoint")}
						onPointerDown=${p=>{var m,f;return(f=(m=e())==null?void 0:m.selectMeasurementPoint)==null?void 0:f.call(m,"end",p)}}
					></button>
				`}
			${r.chip.visible&&$`
					<div
						class=${`measurement-overlay__chip measurement-overlay__chip--${r.chip.placement??"dock-bottom"}`}
						style=${Qs(r.chip)}
						onPointerDown=${p=>{p.stopPropagation()}}
					>
						<label class="measurement-overlay__chip-field">
							<span>${r.chip.label}</span>
							<div class="measurement-overlay__chip-row">
								<input
									type="text"
									inputmode="decimal"
									class="measurement-overlay__chip-input"
									value=${i.measurement.lengthInputText.value}
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
	`}const Vc=["x","y","z"];function qb({controller:i,rootRef:e,svgRef:t}){return $`
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
				${Vc.map(n=>$`
						<line
							key=${n}
							data-axis-gizmo-line=${n}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${n}`}
							x1="50"
							y1="50"
							x2="50"
							y2="50"
						/>
					`)}
			</svg>
			${Vc.flatMap(n=>[$`
					<button
						key=${`pos-${n}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--positive viewport-axis-gizmo__button--${n}`}
						data-axis-gizmo-node=${`pos-${n}`}
						data-facing="positive"
						aria-label=${n.toUpperCase()}
						title=${n.toUpperCase()}
						onClick=${()=>{var r,s;return(s=(r=i())==null?void 0:r.alignViewportToOrthographicView)==null?void 0:s.call(r,`pos${n.toUpperCase()}`,{toggleOppositeOnRepeat:!0})}}
					>
						<span>${n.toUpperCase()}</span>
					</button>
				`,$`
					<button
						key=${`neg-${n}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--negative viewport-axis-gizmo__button--${n}`}
						data-axis-gizmo-node=${`neg-${n}`}
						data-facing="negative"
						aria-label=${`-${n.toUpperCase()}`}
						title=${`-${n.toUpperCase()}`}
						onClick=${()=>{var r,s;return(s=(r=i())==null?void 0:r.alignViewportToOrthographicView)==null?void 0:s.call(r,`neg${n.toUpperCase()}`,{toggleOppositeOnRepeat:!0})}}
					>
						<span></span>
					</button>
				`,$`
					<button
						key=${`axis-${n}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--axis-center viewport-axis-gizmo__button--${n}`}
						data-axis-gizmo-node=${`axis-${n}`}
						data-facing="positive"
						aria-label=${n.toUpperCase()}
						title=${n.toUpperCase()}
						onClick=${()=>{var r,s;return(s=(r=i())==null?void 0:r.toggleViewportOrthographicAxis)==null?void 0:s.call(r,n)}}
					>
						<span>${n.toUpperCase()}</span>
					</button>
				`])}
		</div>
	`}const Zb=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Uc=["top","right","bottom","left"],Jb=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Kb=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"];function Qb({store:i,controller:e,t}){const n=i.splatEdit.tool.value,r=i.splatEdit.selectionCount.value,s=i.splatEdit.brushSize.value,o=i.splatEdit.brushDepthMode.value,a=i.splatEdit.brushDepth.value,c=i.splatEdit.boxPlaced.value,l=i.splatEdit.boxCenter.value,u=i.splatEdit.boxSize.value,h=i.splatEdit.boxRotation.value,d=_=>{var x,k;return(k=(x=e())==null?void 0:x.setSplatEditTool)==null?void 0:k.call(x,_)},p=_=>{var x,k;return(k=(x=e())==null?void 0:x.setSplatEditBrushDepthMode)==null?void 0:k.call(x,_)},m=(_,x)=>{var S,T;const k=Number(x);Number.isFinite(k)&&((T=(S=e())==null?void 0:S.setSplatEditBoxCenterAxis)==null||T.call(S,_,k))},f=(_,x)=>{var S,T;const k=Number(x);Number.isFinite(k)&&((T=(S=e())==null?void 0:S.setSplatEditBoxSizeAxis)==null||T.call(S,_,k))},g=(_,x)=>{var S,T;const k=Number(x);Number.isFinite(k)&&((T=(S=e())==null?void 0:S.setSplatEditBoxRotationAxis)==null||T.call(S,_,k))},y=_=>{var k,S;const x=Number(_);Number.isFinite(x)&&((S=(k=e())==null?void 0:k.setSplatEditBrushSize)==null||S.call(k,x))},b=_=>{var k,S;const x=Number(_);Number.isFinite(x)&&((S=(k=e())==null?void 0:k.setSplatEditBrushDepth)==null||S.call(k,x))},M=_=>Number(_??0).toFixed(2),v=({label:_,value:x,step:k="0.10",min:S=void 0,historyLabel:T,onScrubValue:P,onCommitValue:N})=>$`
		<div class="viewport-splat-edit-toolbar__field camera-property-axis-field">
			<span class="camera-property-axis-field__prefix">${_}</span>
			<div class="camera-property-axis-field__input field">
				<${Bn}
					inputMode="decimal"
					min=${S}
					step=${k}
					value=${M(x)}
					controller=${e}
					historyLabel=${T}
					formatDisplayValue=${M}
					scrubStartValue=${Number(x??0)}
					onScrubDelta=${(H,F)=>P(F)}
					onCommit=${H=>N(H)}
				/>
			</div>
		</div>
	`,w=new vt().setFromQuaternion(new qt(Number((h==null?void 0:h.x)??0),Number((h==null?void 0:h.y)??0),Number((h==null?void 0:h.z)??0),Number((h==null?void 0:h.w)??1))),A={x:ii.radToDeg(w.x),y:ii.radToDeg(w.y),z:ii.radToDeg(w.z)};return $`
		<div class="viewport-splat-edit-toolbar">
			${n==="brush"&&$`
				<div class="viewport-splat-edit-popover">
					${v({label:"px",value:s??30,step:"1",min:"4",historyLabel:"splat-edit.brush-size",onScrubValue:_=>y(_),onCommitValue:_=>y(_)})}
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${o==="through"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>p("through")}>
						${t("status.splatEditBrushModeThrough")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${o==="depth"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>p("depth")}>
						${t("status.splatEditBrushModeDepth")}
					</button>
					${o==="depth"&&$`
						${v({label:t("status.splatEditBrushModeDepth"),value:a??.2,min:"0.01",historyLabel:"splat-edit.brush-depth",onScrubValue:_=>b(_),onCommitValue:_=>b(_)})}
					`}
				</div>
			`}
			${n==="box"&&$`
				<div class="viewport-splat-edit-popover">
					${c?$`
						<span class="viewport-splat-edit-toolbar__detail-label">${t("status.splatEditCenter")}</span>
						<div class="viewport-splat-edit-toolbar__detail-grid">
							${v({label:t("field.positionX"),value:(l==null?void 0:l.x)??0,historyLabel:"splat-edit.box-center.x",onScrubValue:_=>m("x",_),onCommitValue:_=>m("x",_)})}
							${v({label:t("field.positionY"),value:(l==null?void 0:l.y)??0,historyLabel:"splat-edit.box-center.y",onScrubValue:_=>m("y",_),onCommitValue:_=>m("y",_)})}
							${v({label:t("field.positionZ"),value:(l==null?void 0:l.z)??0,historyLabel:"splat-edit.box-center.z",onScrubValue:_=>m("z",_),onCommitValue:_=>m("z",_)})}
						</div>
						<span class="viewport-splat-edit-toolbar__detail-label">${t("status.splatEditSize")}</span>
						<div class="viewport-splat-edit-toolbar__detail-grid">
							${v({label:t("field.positionX"),value:(u==null?void 0:u.x)??1,min:"0.01",historyLabel:"splat-edit.box-size.x",onScrubValue:_=>f("x",_),onCommitValue:_=>f("x",_)})}
							${v({label:t("field.positionY"),value:(u==null?void 0:u.y)??1,min:"0.01",historyLabel:"splat-edit.box-size.y",onScrubValue:_=>f("y",_),onCommitValue:_=>f("y",_)})}
							${v({label:t("field.positionZ"),value:(u==null?void 0:u.z)??1,min:"0.01",historyLabel:"splat-edit.box-size.z",onScrubValue:_=>f("z",_),onCommitValue:_=>f("z",_)})}
						</div>
						<span class="viewport-splat-edit-toolbar__detail-label">${t("field.assetRotation")}</span>
						<div class="viewport-splat-edit-toolbar__detail-grid">
							${v({label:t("field.positionX"),value:A.x,step:"1",historyLabel:"splat-edit.box-rotation.x",onScrubValue:_=>g("x",_),onCommitValue:_=>g("x",_)})}
							${v({label:t("field.positionY"),value:A.y,step:"1",historyLabel:"splat-edit.box-rotation.y",onScrubValue:_=>g("y",_),onCommitValue:_=>g("y",_)})}
							${v({label:t("field.positionZ"),value:A.z,step:"1",historyLabel:"splat-edit.box-rotation.z",onScrubValue:_=>g("z",_),onCommitValue:_=>g("z",_)})}
						</div>
						<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.applySplatEditBoxSelection)==null?void 0:x.call(_,{subtract:!1})}}>${t("status.splatEditAdd")}</button>
						<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.applySplatEditBoxSelection)==null?void 0:x.call(_,{subtract:!0})}}>${t("status.splatEditSubtract")}</button>
						<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.scaleSplatEditBoxUniform)==null?void 0:x.call(_,.9)}}>−<${fe} title=${t("status.splatEditScaleDown")} placement="top" /></button>
						<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.scaleSplatEditBoxUniform)==null?void 0:x.call(_,1.1)}}>+<${fe} title=${t("status.splatEditScaleUp")} placement="top" /></button>
					`:$`
						<span class="viewport-splat-edit-toolbar__info">${t("status.splatEditPlaceBoxHint")}</span>
					`}
					<button type="button" class="viewport-splat-edit-toolbar__btn" onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.fitSplatEditBoxToScope)==null?void 0:x.call(_)}}>${t("status.splatEditFitScope")}</button>
				</div>
			`}
			<div class="viewport-splat-edit-toolbar__bar">
				<!-- Tool selector -->
				<div class="viewport-splat-edit-toolbar__group" role="group" aria-label=${t("action.splatEditTool")}>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${n==="box"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>d("box")}>
						${t("status.splatEditToolBox")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${n==="brush"?" viewport-splat-edit-toolbar__btn--active":""}`} onClick=${()=>d("brush")}>
						${t("status.splatEditToolBrush")}
					</button>
					<button type="button" class=${`viewport-splat-edit-toolbar__btn${n==="transform"?" viewport-splat-edit-toolbar__btn--active":""}`} disabled=${r<=0&&n!=="transform"} onClick=${()=>d("transform")}>
						${t("status.splatEditToolTransform")}
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection operations -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.selectAllSplats)==null?void 0:x.call(_)}}>
						${t("status.splatEditSelectAll")}<${fe} title=${t("status.splatEditSelectAll")} shortcut="Ctrl+A" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${r<=0} onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.invertSplatSelection)==null?void 0:x.call(_)}}>
						${t("status.splatEditInvert")}<${fe} title=${t("status.splatEditInvert")} shortcut="Ctrl+I" placement="top" />
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn button--tooltip" disabled=${r<=0} onClick=${()=>{var _,x;return(x=(_=e())==null?void 0:_.clearSplatSelection)==null?void 0:x.call(_)}}>
						${t("action.clearSelection")}<${fe} title=${t("action.clearSelection")} shortcut="Ctrl+D" placement="top" />
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Edit actions -->
				<div class="viewport-splat-edit-toolbar__group">
					<button type="button" class="viewport-splat-edit-toolbar__btn viewport-splat-edit-toolbar__btn--danger" disabled=${r<=0} onClick=${()=>{var _,x;return void((x=(_=e())==null?void 0:_.deleteSelectedSplats)==null?void 0:x.call(_))}}>
						${t("status.splatEditDelete")}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${r<=0} onClick=${()=>{var _,x;return void((x=(_=e())==null?void 0:_.separateSelectedSplats)==null?void 0:x.call(_))}}>
						${t("status.splatEditSeparate")}
					</button>
					<button type="button" class="viewport-splat-edit-toolbar__btn" disabled=${r<=0} onClick=${()=>{var _,x;return void((x=(_=e())==null?void 0:_.duplicateSelectedSplats)==null?void 0:x.call(_))}}>
						${t("status.splatEditDuplicate")}
					</button>
				</div>
				<div class="viewport-splat-edit-toolbar__separator" />

				<!-- Selection count (right end) -->
				<span class="viewport-splat-edit-toolbar__info">
					${r} sel
				</span>
			</div>
		</div>
	`}function ex({store:i,viewportShellRef:e}){const t=i.splatEdit.active.value,n=i.splatEdit.tool.value,r=i.splatEdit.brushPreview.value;if(!t||n!=="brush"||!(r!=null&&r.visible))return null;const s=(e==null?void 0:e.current)??e??null;if(!(s instanceof HTMLElement))return null;const o=Math.max(0,Number((r==null?void 0:r.radiusPx)??0)),a=s.getBoundingClientRect(),c={left:`${r.x-a.left-o}px`,top:`${r.y-a.top-o}px`,width:`${o*2}px`,height:`${o*2}px`},l=i.splatEdit.brushDepthBarVisible.value;return $`
		<div
			class=${r!=null&&r.subtract?r!=null&&r.painting?"viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract viewport-splat-edit-brush-preview--painting":"viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--subtract":r!=null&&r.painting?"viewport-splat-edit-brush-preview viewport-splat-edit-brush-preview--painting":"viewport-splat-edit-brush-preview"}
			style=${c}
			aria-hidden="true"
		>
			<div class="viewport-splat-edit-brush-preview__ring"></div>
			${l&&Number(r==null?void 0:r.depthBarPx)>2&&$`
					<div
						class="viewport-splat-edit-brush-preview__depth-bar"
						style=${{height:`${Number(r.depthBarPx)}px`}}
					></div>
				`}
		</div>
	`}function tx({store:i,refs:e}){const t=Me(null),n=Me(()=>{}),r=i.mode.value,s=i.frames.documents.value,o=i.frames.maskMode.value,a=i.frames.maskOpacityPct.value,c=i.frames.maskShape.value,l=i.frames.trajectoryMode.value,u=i.frames.trajectoryNodesByFrameId.value??{},h=i.exportWidth.value,d=i.exportHeight.value,p=Math.min(1,Math.max(0,(Number(a)||0)/100)),m=$u(s,{mode:o,selectedIds:i.frames.maskSelectedIds.value??[]}),f=()=>{var x,k;const g=t.current,y=((x=e.viewportShellRef)==null?void 0:x.current)??e.viewportShellRef??null,b=((k=e.renderBoxRef)==null?void 0:k.current)??e.renderBoxRef??null;if(!(g instanceof HTMLCanvasElement)||!(y instanceof HTMLElement))return;const M=g.getContext("2d");if(!M)return;const v=Math.max(1,y.clientWidth),w=Math.max(1,y.clientHeight),A=Math.max(1,Math.round(v*lr)),_=Math.max(1,Math.round(w*lr));g.width!==A&&(g.width=A),g.height!==_&&(g.height=_),g.style.width=`${v}px`,g.style.height=`${w}px`,M.setTransform(1,0,0,1,0,0),M.clearRect(0,0,g.width,g.height),!(r!=="camera"||p<=0||m.length===0||!(b instanceof HTMLElement)||b.offsetWidth<=0||b.offsetHeight<=0)&&(M.scale(lr,lr),Eu(M,m,{canvasWidth:v,canvasHeight:w,frameSpaceWidth:b.offsetWidth,frameSpaceHeight:b.offsetHeight,logicalSpaceWidth:h,logicalSpaceHeight:d,offsetX:b.offsetLeft,offsetY:b.offsetTop,fillStyle:`rgba(3, 6, 11, ${p})`,frameMaskSettings:{shape:c,trajectoryMode:l,trajectory:{nodesByFrameId:u}}}),M.setTransform(1,0,0,1,0,0))};return n.current=f,io(()=>{f()}),io(()=>{var w,A;const g=((w=e.viewportShellRef)==null?void 0:w.current)??e.viewportShellRef??null,y=((A=e.renderBoxRef)==null?void 0:A.current)??e.renderBoxRef??null;if(!(g instanceof HTMLElement)&&!(y instanceof HTMLElement))return;let b=0;const M=()=>{b||(b=window.requestAnimationFrame(()=>{var _;b=0,(_=n.current)==null||_.call(n)}))},v=typeof ResizeObserver=="function"?new ResizeObserver(()=>{M()}):null;return g instanceof HTMLElement&&(v==null||v.observe(g)),y instanceof HTMLElement&&(v==null||v.observe(y)),window.addEventListener("resize",M),()=>{b&&window.cancelAnimationFrame(b),window.removeEventListener("resize",M),v==null||v.disconnect()}},[e.renderBoxRef,e.viewportShellRef]),r!=="camera"||p<=0||m.length===0?null:$`
		<div class="frame-mask-layer">
			<canvas ref=${t} class="frame-mask-layer__canvas"></canvas>
		</div>
	`}function Hc(i,e){return!Number.isFinite(i)||!Number.isFinite(e)||i<0||i>1||e<0||e>1?"":Ma({x:i,y:e})}function Sw({store:i,controller:e,refs:t,t:n}){var V,_e,ze,Ne;const r=Me(null);i.mode.value;const s=i.workbenchCollapsed.value,o=i.splatEdit.active.value;i.splatEdit.scopeAssetIds.value.length;const a=i.splatEdit.hudPosition.value;i.splatEdit.lastOperation.value,i.frames.documents.value,new Set(i.frames.selectedIds.value??[]);const c=i.viewportReferenceImageEditMode.value,l=c||o,u=n("section.outputFrame"),h=i.referenceImages.previewLayers.value,d=new Set(i.referenceImages.selectedItemIds.value??[]),p=h.filter(C=>C.group==="back"),m=h.filter(C=>C.group!=="back"),f=h.filter(C=>d.has(C.id)),g=f.find(C=>C.id===i.referenceImages.selectedItemId.value)??f[f.length-1]??null,y=i.referenceImages.selectionAnchor.value,b=i.referenceImages.selectionBoxScreen.value,M=f.length===0?null:f.length===1&&g?{leftPx:g.leftPx,topPx:g.topPx,widthPx:g.widthPx,heightPx:g.heightPx,rotationDeg:g.rotationDeg,anchorAx:g.anchorAx,anchorAy:g.anchorAy,anchorHandleKey:Hc(g.anchorAx,g.anchorAy)}:b?{leftPx:b.left,topPx:b.top,widthPx:b.width,heightPx:b.height,rotationDeg:b.rotationDeg??0,anchorAx:Number.isFinite(y==null?void 0:y.x)?y.x:b.anchorX??.5,anchorAy:Number.isFinite(y==null?void 0:y.y)?y.y:b.anchorY??.5,anchorHandleKey:Hc(Number.isFinite(y==null?void 0:y.x)?y.x:b.anchorX??.5,Number.isFinite(y==null?void 0:y.y)?y.y:b.anchorY??.5)}:null,v=i.viewportPieMenu.value,w=i.viewportLensHud.value,A=i.viewportRollHud.value,_=v.open?T0({mode:i.mode.value,t:n,viewportToolMode:i.viewportToolMode.value,viewportOrthographic:i.mode.value==="viewport"&&i.viewportProjectionMode.value==="orthographic",referencePreviewSessionVisible:i.referenceImages.previewSessionVisible.value!==!1,hasReferenceImages:(((V=i.referenceImages.items.value)==null?void 0:V.length)??0)>0,frameMaskMode:i.frames.maskMode.value,hasRememberedFrameMaskSelection:(((_e=i.frames.maskSelectedIds.value)==null?void 0:_e.length)??0)>0}):[],x=_.find(C=>C.id===v.hoveredActionId)??null,k=C=>{C.preventDefault(),C.stopPropagation()},S=C=>{var z,U;C.preventDefault(),C.stopPropagation(),(U=(z=e())==null?void 0:z.closeViewportPieMenu)==null||U.call(z)},T=C=>{C.preventDefault(),C.stopPropagation()},P=(C,z)=>{var U,te;z.preventDefault(),z.stopPropagation(),(te=(U=e())==null?void 0:U.executeViewportPieAction)==null||te.call(U,C,z)},N=C=>({left:`${C.leftPx}px`,top:`${C.topPx}px`,width:`${C.widthPx}px`,height:`${C.heightPx}px`,opacity:C.opacity,transform:`rotate(${C.rotationDeg}deg)`,transformOrigin:`${C.anchorAx*100}% ${C.anchorAy*100}%`}),H=C=>({imageRendering:C.pixelPerfect?"pixelated":"auto"}),F=C=>({left:`${C.leftPx}px`,top:`${C.topPx}px`,width:`${C.widthPx}px`,height:`${C.heightPx}px`,transform:`rotate(${C.rotationDeg}deg)`,transformOrigin:`${C.anchorAx*100}% ${C.anchorAy*100}%`}),O=C=>({left:`${C.anchorAx*100}%`,top:`${C.anchorAy*100}%`}),G=((ze=t.viewportShellRef)==null?void 0:ze.current)??t.viewportShellRef??null,ne=((Ne=t.renderBoxRef)==null?void 0:Ne.current)??t.renderBoxRef??null,Z=Ub({viewportRect:zc(G,{preferClientSize:!0}),renderBoxRect:zc(ne)});Number.isFinite(a==null?void 0:a.x)&&Number.isFinite(a==null?void 0:a.y)&&(`${a.x}`,`${a.y}`);const{projectDisplayName:B,projectDirty:j,showProjectPackageDirty:le}=A0(i,n),xe=(C,z)=>{var U,te;return(te=(U=e())==null?void 0:U.startReferenceImageMove)==null?void 0:te.call(U,C,z)},st=(C,z)=>{var U,te;return(te=(U=e())==null?void 0:U.startReferenceImageResize)==null?void 0:te.call(U,C,z)},D=(C,z)=>{var U,te;return(te=(U=e())==null?void 0:U.startReferenceImageRotate)==null?void 0:te.call(U,C,z)},X=C=>{var z,U;return(U=(z=e())==null?void 0:z.startReferenceImageAnchorDrag)==null?void 0:U.call(z,C)};io(()=>{const C=U=>{const te=r.current;if(!te||U.pointerId!==te.pointerId)return;const $t=Math.min(Math.max(0,U.clientX-te.shellRect.left-te.offsetX),Math.max(0,te.shellRect.width-te.width)),Kt=Math.min(Math.max(0,U.clientY-te.shellRect.top-te.offsetY),Math.max(0,te.shellRect.height-te.height));i.splatEdit.hudPosition.value={x:Math.round($t),y:Math.round(Kt)}},z=U=>{var te;((te=r.current)==null?void 0:te.pointerId)===U.pointerId&&(r.current=null)};return window.addEventListener("pointermove",C),window.addEventListener("pointerup",z),window.addEventListener("pointercancel",z),()=>{window.removeEventListener("pointermove",C),window.removeEventListener("pointerup",z),window.removeEventListener("pointercancel",z)}},[i]);const Q=[{id:"move-x",label:"X",className:"viewport-gizmo__handle--axis viewport-gizmo__handle--x",axis:"x"},{id:"move-y",label:"Y",className:"viewport-gizmo__handle--axis viewport-gizmo__handle--y",axis:"y"},{id:"move-z",label:"Z",className:"viewport-gizmo__handle--axis viewport-gizmo__handle--z",axis:"z"},{id:"scale-uniform",label:"S",className:"viewport-gizmo__handle--scale"}];return $`
		<main
			id="viewport-shell"
			ref=${t.viewportShellRef}
			class=${s?"viewport-shell viewport-shell--inspector-collapsed":"viewport-shell viewport-shell--inspector-open"}
		>
			<canvas id="viewport" ref=${t.viewportCanvasRef} tabindex="0"></canvas>
			<div class="viewport-project-status" aria-hidden="true">
				<span class="viewport-project-status__name">${B}</span>
				${j&&$`
					<span class="viewport-project-status__badge">*</span>
				`}
				${le&&$`
					<span
						class="viewport-project-status__badge viewport-project-status__badge--package"
					>
						PKG
					</span>
				`}
			</div>
			<${ex}
				store=${i}
				viewportShellRef=${t.viewportShellRef}
			/>
			${o&&$`<${Qb} store=${i} controller=${e} t=${n} />`}
			<div
				id="drop-hint"
				ref=${t.dropHintRef}
				class="drop-hint"
				style=${Z}
			>
				<span class="drop-hint__meta">
					${`CAMERA_FRAMES ${Wp()}`}
				</span>
				<strong>${n("drop.title")}</strong>
				<span>${n("drop.body")}</span>
				<div class="drop-hint__controls">
					<strong class="drop-hint__controls-title">
						${n("drop.controlsTitle")}
					</strong>
					<div class="drop-hint__controls-grid">
						<span>${n("drop.controlOrbit")}</span>
						<span>${n("drop.controlPan")}</span>
						<span>${n("drop.controlDolly")}</span>
						<span>${n("drop.controlAnchorOrbit")}</span>
					</div>
				</div>
			</div>
			<div class="reference-image-layer reference-image-layer--back">
				${p.map(C=>$`
						<div
							key=${C.id}
							class=${d.has(C.id)?c?"reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive":"reference-image-layer__entry reference-image-layer__entry--selected":c?"reference-image-layer__entry reference-image-layer__entry--interactive":"reference-image-layer__entry"}
							style=${N(C)}
							onPointerDown=${c?z=>xe(C.id,z):void 0}
						>
							<img
								class=${C.pixelPerfect?"reference-image-layer__item reference-image-layer__item--pixelated":"reference-image-layer__item"}
								src=${C.sourceUrl}
								alt=${C.name}
								title=${C.fileName||C.name}
								draggable="false"
								style=${H(C)}
							/>
						</div>
					`)}
			</div>
			${v.open&&$`
					<div
						class=${v.coarse?"viewport-pie viewport-pie--coarse":"viewport-pie"}
						style=${{left:`${v.x}px`,top:`${v.y}px`}}
					>
						<button
							type="button"
							class="viewport-pie__center"
							onPointerDown=${k}
							onClick=${S}
						>
							<span class="viewport-pie__center-label">
								${(x==null?void 0:x.label)??n("action.quickMenu")}
							</span>
						</button>
						${_.map(C=>{const z=Math.cos(C.angle)*(v.radius??To),U=Math.sin(C.angle)*(v.radius??To);return $`
								<button
									key=${C.id}
									type="button"
									class=${["viewport-pie__item",C.id===v.hoveredActionId||C.active?"viewport-pie__item--active":"",C.disabled?"viewport-pie__item--disabled":""].filter(Boolean).join(" ")}
									style=${{left:`${z}px`,top:`${U}px`}}
									disabled=${!!C.disabled}
									onPointerDown=${T}
									onClick=${te=>C.disabled?void 0:P(C.id,te)}
								>
									<span class="viewport-pie__item-icon">
										<${be} name=${C.icon} size=${18} />
									</span>
								</button>
							`})}
					</div>
				`}
			${w.visible&&$`
					<div
						class="viewport-lens-hud"
						style=${{left:`${w.x}px`,top:`${w.y}px`}}
					>
						<strong>${w.mmLabel}</strong>
						<span>${w.fovLabel}</span>
					</div>
				`}
			${A.visible&&$`
					<div
						class="viewport-lens-hud viewport-roll-hud"
						style=${{left:`${A.x}px`,top:`${A.y}px`}}
					>
						<strong>${A.angleLabel}</strong>
						<span>${n("action.adjustRoll")}</span>
					</div>
				`}
			<${Yb} store=${i} controller=${e} t=${n} />
			<${qb}
				controller=${e}
				rootRef=${t.viewportAxisGizmoRef}
				svgRef=${t.viewportAxisGizmoSvgRef}
			/>
			<${tx} store=${i} refs=${t} />
			<div
				id="render-box"
				ref=${t.renderBoxRef}
				class=${l?"render-box render-box--interaction-disabled":"render-box"}
			>
				<${jc}
					store=${i}
					controller=${e}
					frameOverlayCanvasRef=${t.frameOverlayCanvasRef}
					canvasOnly=${!0}
					interactionsEnabled=${!l}
				/>
				<${jc}
					store=${i}
					controller=${e}
					itemsOnly=${!0}
					interactionsEnabled=${!l}
				/>
				${Zb.map(C=>$`
						<button
							type="button"
							class=${`render-box__resize-handle render-box__resize-handle--${C}`}
							aria-label=${u}
							onPointerDown=${l?void 0:z=>{var U;return(U=e())==null?void 0:U.startOutputFrameResize(C,z)}}
						></button>
					`)}
				${Uc.map(C=>$`
						<button
							type="button"
							class=${`render-box__pan-edge render-box__pan-edge--${C}`}
							aria-label=${u}
							onPointerDown=${l?void 0:z=>{var U;return(U=e())==null?void 0:U.startOutputFramePan(z)}}
						></button>
					`)}
				<div
					id="render-box-meta"
					ref=${t.renderBoxMetaRef}
					class="render-box__meta"
					onPointerDown=${l?void 0:C=>{var z;return(z=e())==null?void 0:z.startOutputFramePan(C)}}
				>
					${i.exportSizeLabel.value} · ${i.renderBox.anchor.value}
				</div>
				<div
					id="anchor-dot"
					ref=${t.anchorDotRef}
					class="render-box__anchor"
				></div>
			</div>
			<div class="reference-image-layer reference-image-layer--front">
				${m.map(C=>$`
						<div
							key=${C.id}
							class=${d.has(C.id)?c?"reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive":"reference-image-layer__entry reference-image-layer__entry--selected":c?"reference-image-layer__entry reference-image-layer__entry--interactive":"reference-image-layer__entry"}
							style=${N(C)}
							onPointerDown=${c?z=>xe(C.id,z):void 0}
						>
							<img
								class=${C.pixelPerfect?"reference-image-layer__item reference-image-layer__item--pixelated":"reference-image-layer__item"}
								src=${C.sourceUrl}
								alt=${C.name}
								title=${C.fileName||C.name}
								draggable="false"
								style=${H(C)}
							/>
						</div>
					`)}
			</div>
			${c&&M&&$`
					<div class="reference-image-selection-layer">
						<div
							class="frame-item frame-item--selected frame-item--active reference-image-transform-box"
							data-anchor-handle=${M.anchorHandleKey}
							style=${F(M)}
						>
							${Uc.map(C=>$`
									<button
										key=${C}
										type="button"
										class=${`frame-item__edge frame-item__edge--${C}`}
										onPointerDown=${z=>xe((g==null?void 0:g.id)??"",z)}
									></button>
								`)}
							${Jb.map(C=>$`
									<button
										key=${C}
										type="button"
										class=${`frame-item__resize-handle frame-item__resize-handle--${C}`}
										style=${{cursor:zo(M.rotationDeg,C)}}
										onPointerDown=${z=>st(C,z)}
									></button>
								`)}
							${Kb.map(C=>$`
									<button
										key=${C}
										type="button"
										class=${`frame-item__rotation-zone frame-item__rotation-zone--${C}`}
										style=${{cursor:ko(M.rotationDeg,C)}}
										onPointerDown=${z=>D(C,z)}
									></button>
								`)}
							<button
								type="button"
								class="frame-item__anchor"
								style=${O(M)}
								onPointerDown=${X}
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
					${["xy","yz","zx"].map(C=>$`
							<path
								key=${`move-${C}`}
								class=${`viewport-gizmo__plane viewport-gizmo__plane--${C}`}
								data-gizmo-plane=${`move-${C}`}
								onPointerEnter=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(`move-${C}`)}}
								onPointerLeave=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(null)}}
								onPointerDown=${z=>{var U;return(U=e())==null?void 0:U.startViewportTransformDrag(`move-${C}`,z)}}
							/>
						`)}
					${["x","y","z"].flatMap(C=>[$`
							<path
								key=${`rotate-${C}-back`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${C} viewport-gizmo__ring--back`}
								data-gizmo-ring=${`rotate-${C}-back`}
								onPointerEnter=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(`rotate-${C}`)}}
								onPointerLeave=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(null)}}
								onPointerDown=${z=>{var U;return(U=e())==null?void 0:U.startViewportTransformDrag(`rotate-${C}`,z)}}
							/>
						`,$`
							<path
								key=${`rotate-${C}-front`}
								class=${`viewport-gizmo__ring viewport-gizmo__ring--axis viewport-gizmo__ring--${C} viewport-gizmo__ring--front`}
								data-gizmo-ring=${`rotate-${C}-front`}
								onPointerEnter=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(`rotate-${C}`)}}
								onPointerLeave=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(null)}}
								onPointerDown=${z=>{var U;return(U=e())==null?void 0:U.startViewportTransformDrag(`rotate-${C}`,z)}}
							/>
						`])}
				</svg>
				${Q.map(C=>$`
						<button
							key=${C.id}
							type="button"
							class=${`viewport-gizmo__handle ${C.className}`}
							data-gizmo-handle=${C.id}
							aria-label=${C.ariaLabel??C.label}
							onPointerEnter=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(C.id)}}
							onPointerLeave=${()=>{var z;return(z=e())==null?void 0:z.setViewportTransformHover(null)}}
							onPointerDown=${z=>{var U;return(U=e())==null?void 0:U.startViewportTransformDrag(C.id,z)}}
						>
							<span>${C.label}</span>
						</button>
					`)}
			</div>
		</main>
	`}export{Px as $,Qv as A,yh as B,Zp as C,px as D,Si as E,Xf as F,ov as G,tm as H,xh as I,zv as J,hi as K,al as L,Xr as M,Hx as N,ug as O,ft as P,wh as Q,Ho as R,kh as S,Qa as T,Uo as U,E as V,Mh as W,bx as X,_x as Y,Za as Z,Ix as _,Kx as a,Mm as a$,Rx as a0,Fx as a1,Ex as a2,Cx as a3,Ka as a4,$x as a5,kx as a6,Tx as a7,Ax as a8,Ja as a9,im as aA,Nv as aB,Ih as aC,rm as aD,sm as aE,Jp as aF,Kp as aG,em as aH,Wr as aI,om as aJ,am as aK,vh as aL,cm as aM,hm as aN,um as aO,dm as aP,pm as aQ,mm as aR,fm as aS,gm as aT,ds as aU,ym as aV,_m as aW,bm as aX,xm as aY,vm as aZ,wm as a_,Sx as aa,Mx as ab,wx as ac,nl as ad,wn as ae,tl as af,rv as ag,iv as ah,nv as ai,Nt as aj,yv as ak,gv as al,_v as am,mv as an,fv as ao,pv as ap,bv as aq,dv as ar,_n as as,jv as at,hv as au,Vv as av,hx as aw,dx as ax,Qp as ay,nm as az,we as b,Pe as b$,Sm as b0,$m as b1,km as b2,Em as b3,Tm as b4,Cm as b5,Am as b6,Fm as b7,Rm as b8,Pm as b9,Qx as bA,ev as bB,Tv as bC,yf as bD,Ev as bE,Xm as bF,uv as bG,kv as bH,Yr as bI,vt as bJ,s1 as bK,ll as bL,Cf as bM,Tf as bN,uf as bO,vv as bP,Sh as bQ,ux as bR,qx as bS,Jx as bT,Zx as bU,Yx as bV,Xx as bW,Wx as bX,Gx as bY,Nf as bZ,$v as b_,Im as ba,Dm as bb,zm as bc,Nm as bd,Bm as be,Om as bf,Lm as bg,jm as bh,Vm as bi,Um as bj,Hm as bk,jx as bl,Lx as bm,Ox as bn,Bx as bo,Nx as bp,zx as bq,Dx as br,ax as bs,lx as bt,cx as bu,qa as bv,yx as bw,gx as bx,fx as by,mx as bz,kf as c,a1 as c$,Ar as c0,Ux as c1,Vx as c2,Yp as c3,xx as c4,vx as c5,Ov as c6,Ch as c7,Ot as c8,Ie as c9,Eh as cA,qf as cB,Lt as cC,Fh as cD,ae as cE,Rv as cF,Yf as cG,Rh as cH,Iv as cI,Dv as cJ,Yi as cK,ii as cL,Ah as cM,Uv as cN,jf as cO,Cr as cP,ao as cQ,Fr as cR,Dr as cS,Ir as cT,Zr as cU,qr as cV,St as cW,ba as cX,Ue as cY,it as cZ,at as c_,Jv as ca,Nl as cb,xv as cc,de as cd,Sv as ce,qt as cf,ki as cg,Hv as ch,e1 as ci,sv as cj,zf as ck,Yo as cl,Zf as cm,Nh as cn,n1 as co,av as cp,cv as cq,lv as cr,Zv as cs,Lv as ct,Wv as cu,Xv as cv,Yv as cw,Pv as cx,Gv as cy,Kv as cz,Xo as d,sa as d$,Lh as d0,Oh as d1,ec as d2,Bh as d3,gu as d4,Ty as d5,po as d6,uo as d7,_u as d8,Lr as d9,eu as dA,E1 as dB,ly as dC,Zt as dD,Y1 as dE,$u as dF,X1 as dG,ra as dH,ia as dI,na as dJ,ta as dK,Ge as dL,ix as dM,ox as dN,Cu as dO,Tu as dP,rw as dQ,Su as dR,tt as dS,b0 as dT,K1 as dU,Q1 as dV,J1 as dW,Fu as dX,ur as dY,Iy as dZ,ew as d_,v1 as da,_a as db,py as dc,Cy as dd,wo as de,N1 as df,B1 as dg,k1 as dh,Dg as di,Uh as dj,_1 as dk,o1 as dl,b1 as dm,zy as dn,Fg as dp,Av as dq,A1 as dr,D1 as ds,Ry as dt,r1 as du,P1 as dv,Fn as dw,mi as dx,wy as dy,C1 as dz,Xp as e,$1 as e$,ui as e0,Nn as e1,x1 as e2,zr as e3,I1 as e4,Dy as e5,F1 as e6,ca as e7,Or as e8,pi as e9,G1 as eA,Yy as eB,qy as eC,Mu as eD,Ph as eE,Fv as eF,Of as eG,c1 as eH,h1 as eI,l1 as eJ,m1 as eK,d1 as eL,p1 as eM,u1 as eN,lr as eO,W1 as eP,t1 as eQ,Bv as eR,i1 as eS,A0 as eT,fi as eU,Kr as eV,oi as eW,ry as eX,w1 as eY,M1 as eZ,tu as e_,Gt as ea,Br as eb,Vg as ec,oa as ed,aa as ee,ko as ef,xa as eg,R1 as eh,va as ei,iw as ej,nw as ek,Z1 as el,f0 as em,q1 as en,tw as eo,sw as ep,Sa as eq,ic as er,ow as es,T0 as et,aw as eu,mo as ev,Cg as ew,ea as ex,qv as ey,H1 as ez,tv as f,Cb as f$,S1 as f0,sy as f1,ma as f2,Us as f3,T1 as f4,ya as f5,Qr as f6,ou as f7,su as f8,f1 as f9,K as fA,dw as fB,ib as fC,Ao as fD,Tc as fE,Cc as fF,ob as fG,ge as fH,z1 as fI,Lu as fJ,uw as fK,nx as fL,vw as fM,Mw as fN,ww as fO,yr as fP,_r as fQ,br as fR,Ib as fS,_w as fT,Pb as fU,xw as fV,Rb as fW,Fb as fX,mw as fY,Ab as fZ,pw as f_,hc as fa,Uy as fb,L1 as fc,Ei as fd,ts as fe,O1 as ff,vu as fg,j1 as fh,wa as fi,es as fj,V1 as fk,Hy as fl,Gy as fm,U1 as fn,g1 as fo,y1 as fp,mt as fq,$ as fr,be as fs,Me as ft,De as fu,Jt as fv,fe as fw,hw as fx,Po as fy,Bn as fz,Xe as g,X0 as g$,bw as g0,Eb as g1,yw as g2,kb as g3,fw as g4,$b as g5,Tb as g6,Sb as g7,vo as g8,Sw as g9,x_ as gA,b_ as gB,__ as gC,y_ as gD,g_ as gE,f_ as gF,m_ as gG,p_ as gH,d_ as gI,u_ as gJ,h_ as gK,c_ as gL,l_ as gM,a_ as gN,o_ as gO,s_ as gP,r_ as gQ,i_ as gR,n_ as gS,t_ as gT,e_ as gU,Q0 as gV,K0 as gW,J0 as gX,Z0 as gY,q0 as gZ,Y0 as g_,cw as ga,rx as gb,fh as gc,sx as gd,Ba as ge,lw as gf,Fo as gg,Bu as gh,B_ as gi,N_ as gj,z_ as gk,D_ as gl,I_ as gm,P_ as gn,R_ as go,F_ as gp,A_ as gq,C_ as gr,T_ as gs,E_ as gt,k_ as gu,$_ as gv,S_ as gw,M_ as gx,w_ as gy,v_ as gz,zt as h,W0 as h0,G0 as h1,H0 as h2,U0 as h3,V0 as h4,j0 as h5,L0 as h6,O0 as h7,B0 as h8,N0 as h9,z0 as ha,Yb as hb,To as hc,Qb as hd,gw as he,Db as hf,Tr as i,Mt as j,ce as k,wv as l,Rf as m,Ke as n,$e as o,ee as p,gh as q,yt as r,Ve as s,bh as t,oo as u,Mv as v,pl as w,Cv as x,lm as y,il as z};
