"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[261],{7261:function(e,n,t){t.r(n),t.d(n,{default:function(){return ce}});var r=t(885),o=t(4942),i=t(3366),a=t(7462),s=t(2791),c=t(8182),l=t(4419),u=t(7563),d=t(8956),f=t(9723),v=t(184);function m(e){return e.substring(2).toLowerCase()}var h=function(e){var n=e.children,t=e.disableReactTree,r=void 0!==t&&t,o=e.mouseEvent,i=void 0===o?"onClick":o,a=e.onClickAway,c=e.touchEvent,l=void 0===c?"onTouchEnd":c,h=s.useRef(!1),p=s.useRef(null),g=s.useRef(!1),Z=s.useRef(!1);s.useEffect((function(){return setTimeout((function(){g.current=!0}),0),function(){g.current=!1}}),[]);var x=(0,u.Z)(n.ref,p),w=(0,d.Z)((function(e){var n=Z.current;Z.current=!1;var t=(0,f.Z)(p.current);!g.current||!p.current||"clientX"in e&&function(e,n){return n.documentElement.clientWidth<e.clientX||n.documentElement.clientHeight<e.clientY}(e,t)||(h.current?h.current=!1:(e.composedPath?e.composedPath().indexOf(p.current)>-1:!t.documentElement.contains(e.target)||p.current.contains(e.target))||!r&&n||a(e))})),C=function(e){return function(t){Z.current=!0;var r=n.props[e];r&&r(t)}},M={ref:x};return!1!==l&&(M[l]=C(l)),s.useEffect((function(){if(!1!==l){var e=m(l),n=(0,f.Z)(p.current),t=function(){h.current=!0};return n.addEventListener(e,w),n.addEventListener("touchmove",t),function(){n.removeEventListener(e,w),n.removeEventListener("touchmove",t)}}}),[w,l]),!1!==i&&(M[i]=C(i)),s.useEffect((function(){if(!1!==i){var e=m(i),n=(0,f.Z)(p.current);return n.addEventListener(e,w),function(){n.removeEventListener(e,w)}}}),[w,i]),(0,v.jsx)(s.Fragment,{children:s.cloneElement(n,M)})},p=t(1171),g=t(3967),Z=t(1046),x=t(9683),w=t(4036),C=t(3208),M=t(2065),y=t(703),E=t(7225),S=t(5878);function b(e){return(0,E.Z)("MuiSnackbarContent",e)}(0,S.Z)("MuiSnackbarContent",["root","message","action"]);var k=["action","className","message","role"],R=(0,p.ZP)(y.Z,{name:"MuiSnackbarContent",slot:"Root",overridesResolver:function(e,n){return n.root}})((function(e){var n=e.theme,t="light"===n.palette.mode?.8:.98,r=(0,M._4)(n.palette.background.default,t);return(0,a.Z)({},n.typography.body2,(0,o.Z)({color:n.palette.getContrastText(r),backgroundColor:r,display:"flex",alignItems:"center",flexWrap:"wrap",padding:"6px 16px",borderRadius:n.shape.borderRadius,flexGrow:1},n.breakpoints.up("sm"),{flexGrow:"initial",minWidth:288}))})),L=(0,p.ZP)("div",{name:"MuiSnackbarContent",slot:"Message",overridesResolver:function(e,n){return n.message}})({padding:"8px 0"}),j=(0,p.ZP)("div",{name:"MuiSnackbarContent",slot:"Action",overridesResolver:function(e,n){return n.action}})({display:"flex",alignItems:"center",marginLeft:"auto",paddingLeft:16,marginRight:-8}),z=s.forwardRef((function(e,n){var t=(0,Z.Z)({props:e,name:"MuiSnackbarContent"}),r=t.action,o=t.className,s=t.message,u=t.role,d=void 0===u?"alert":u,f=(0,i.Z)(t,k),m=t,h=function(e){var n=e.classes;return(0,l.Z)({root:["root"],action:["action"],message:["message"]},b,n)}(m);return(0,v.jsxs)(R,(0,a.Z)({role:d,square:!0,elevation:6,className:(0,c.Z)(h.root,o),ownerState:m,ref:n},f,{children:[(0,v.jsx)(L,{className:h.message,ownerState:m,children:s}),r?(0,v.jsx)(j,{className:h.action,ownerState:m,children:r}):null]}))}));function O(e){return(0,E.Z)("MuiSnackbar",e)}(0,S.Z)("MuiSnackbar",["root","anchorOriginTopCenter","anchorOriginBottomCenter","anchorOriginTopRight","anchorOriginBottomRight","anchorOriginTopLeft","anchorOriginBottomLeft"]);var A=["onEnter","onExited"],T=["action","anchorOrigin","autoHideDuration","children","className","ClickAwayListenerProps","ContentProps","disableWindowBlurListener","message","onBlur","onClose","onFocus","onMouseEnter","onMouseLeave","open","resumeHideDuration","TransitionComponent","transitionDuration","TransitionProps"],P=(0,p.ZP)("div",{name:"MuiSnackbar",slot:"Root",overridesResolver:function(e,n){var t=e.ownerState;return[n.root,n["anchorOrigin".concat((0,w.Z)(t.anchorOrigin.vertical)).concat((0,w.Z)(t.anchorOrigin.horizontal))]]}})((function(e){var n=e.theme,t=e.ownerState,r=(0,a.Z)({},!t.isRtl&&{left:"50%",right:"auto",transform:"translateX(-50%)"},t.isRtl&&{right:"50%",left:"auto",transform:"translateX(50%)"});return(0,a.Z)({zIndex:(n.vars||n).zIndex.snackbar,position:"fixed",display:"flex",left:8,right:8,justifyContent:"center",alignItems:"center"},"top"===t.anchorOrigin.vertical?{top:8}:{bottom:8},"left"===t.anchorOrigin.horizontal&&{justifyContent:"flex-start"},"right"===t.anchorOrigin.horizontal&&{justifyContent:"flex-end"},(0,o.Z)({},n.breakpoints.up("sm"),(0,a.Z)({},"top"===t.anchorOrigin.vertical?{top:24}:{bottom:24},"center"===t.anchorOrigin.horizontal&&r,"left"===t.anchorOrigin.horizontal&&(0,a.Z)({},!t.isRtl&&{left:24,right:"auto"},t.isRtl&&{right:24,left:"auto"}),"right"===t.anchorOrigin.horizontal&&(0,a.Z)({},!t.isRtl&&{right:24,left:"auto"},t.isRtl&&{left:24,right:"auto"}))))})),N=s.forwardRef((function(e,n){var t=(0,Z.Z)({props:e,name:"MuiSnackbar"}),o=(0,g.Z)(),u={enter:o.transitions.duration.enteringScreen,exit:o.transitions.duration.leavingScreen},d=t.action,f=t.anchorOrigin,m=(f=void 0===f?{vertical:"bottom",horizontal:"left"}:f).vertical,p=f.horizontal,M=t.autoHideDuration,y=void 0===M?null:M,E=t.children,S=t.className,b=t.ClickAwayListenerProps,k=t.ContentProps,R=t.disableWindowBlurListener,L=void 0!==R&&R,j=t.message,N=t.onBlur,W=t.onClose,I=t.onFocus,H=t.onMouseEnter,B=t.onMouseLeave,D=t.open,F=t.resumeHideDuration,V=t.TransitionComponent,X=void 0===V?C.Z:V,_=t.transitionDuration,G=void 0===_?u:_,$=t.TransitionProps,q=($=void 0===$?{}:$).onEnter,K=$.onExited,Y=(0,i.Z)(t.TransitionProps,A),J=(0,i.Z)(t,T),Q="rtl"===o.direction,U=(0,a.Z)({},t,{anchorOrigin:{vertical:m,horizontal:p},isRtl:Q}),ee=function(e){var n=e.classes,t=e.anchorOrigin,r={root:["root","anchorOrigin".concat((0,w.Z)(t.vertical)).concat((0,w.Z)(t.horizontal))]};return(0,l.Z)(r,O,n)}(U),ne=s.useRef(),te=s.useState(!0),re=(0,r.Z)(te,2),oe=re[0],ie=re[1],ae=(0,x.Z)((function(){W&&W.apply(void 0,arguments)})),se=(0,x.Z)((function(e){W&&null!=e&&(clearTimeout(ne.current),ne.current=setTimeout((function(){ae(null,"timeout")}),e))}));s.useEffect((function(){return D&&se(y),function(){clearTimeout(ne.current)}}),[D,y,se]);var ce=function(){clearTimeout(ne.current)},le=s.useCallback((function(){null!=y&&se(null!=F?F:.5*y)}),[y,F,se]);return s.useEffect((function(){if(!L&&D)return window.addEventListener("focus",le),window.addEventListener("blur",ce),function(){window.removeEventListener("focus",le),window.removeEventListener("blur",ce)}}),[L,le,D]),s.useEffect((function(){if(D)return document.addEventListener("keydown",e),function(){document.removeEventListener("keydown",e)};function e(e){e.defaultPrevented||"Escape"!==e.key&&"Esc"!==e.key||W&&W(e,"escapeKeyDown")}}),[oe,D,W]),!D&&oe?null:(0,v.jsx)(h,(0,a.Z)({onClickAway:function(e){W&&W(e,"clickaway")}},b,{children:(0,v.jsx)(P,(0,a.Z)({className:(0,c.Z)(ee.root,S),onBlur:function(e){N&&N(e),le()},onFocus:function(e){I&&I(e),ce()},onMouseEnter:function(e){H&&H(e),ce()},onMouseLeave:function(e){B&&B(e),le()},ownerState:U,ref:n,role:"presentation"},J,{children:(0,v.jsx)(X,(0,a.Z)({appear:!0,in:D,timeout:G,direction:"top"===m?"down":"up",onEnter:function(e,n){ie(!1),q&&q(e,n)},onExited:function(e){ie(!0),K&&K(e)}},Y,{children:E||(0,v.jsx)(z,(0,a.Z)({message:j,action:d},k))}))}))}))})),W=N;function I(e){return(0,E.Z)("MuiAlert",e)}var H,B=(0,S.Z)("MuiAlert",["root","action","icon","message","filled","filledSuccess","filledInfo","filledWarning","filledError","outlined","outlinedSuccess","outlinedInfo","outlinedWarning","outlinedError","standard","standardSuccess","standardInfo","standardWarning","standardError"]),D=t(3400),F=t(6189),V=(0,F.Z)((0,v.jsx)("path",{d:"M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"}),"SuccessOutlined"),X=(0,F.Z)((0,v.jsx)("path",{d:"M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"}),"ReportProblemOutlined"),_=(0,F.Z)((0,v.jsx)("path",{d:"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"ErrorOutline"),G=(0,F.Z)((0,v.jsx)("path",{d:"M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"}),"InfoOutlined"),$=(0,F.Z)((0,v.jsx)("path",{d:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"}),"Close"),q=["action","children","className","closeText","color","icon","iconMapping","onClose","role","severity","variant"],K=(0,p.ZP)(y.Z,{name:"MuiAlert",slot:"Root",overridesResolver:function(e,n){var t=e.ownerState;return[n.root,n[t.variant],n["".concat(t.variant).concat((0,w.Z)(t.color||t.severity))]]}})((function(e){var n=e.theme,t=e.ownerState,r="light"===n.palette.mode?M._j:M.$n,i="light"===n.palette.mode?M.$n:M._j,s=t.color||t.severity;return(0,a.Z)({},n.typography.body2,{backgroundColor:"transparent",display:"flex",padding:"6px 16px"},s&&"standard"===t.variant&&(0,o.Z)({color:r(n.palette[s].light,.6),backgroundColor:i(n.palette[s].light,.9)},"& .".concat(B.icon),{color:"dark"===n.palette.mode?n.palette[s].main:n.palette[s].light}),s&&"outlined"===t.variant&&(0,o.Z)({color:r(n.palette[s].light,.6),border:"1px solid ".concat(n.palette[s].light)},"& .".concat(B.icon),{color:"dark"===n.palette.mode?n.palette[s].main:n.palette[s].light}),s&&"filled"===t.variant&&{color:"#fff",fontWeight:n.typography.fontWeightMedium,backgroundColor:"dark"===n.palette.mode?n.palette[s].dark:n.palette[s].main})})),Y=(0,p.ZP)("div",{name:"MuiAlert",slot:"Icon",overridesResolver:function(e,n){return n.icon}})({marginRight:12,padding:"7px 0",display:"flex",fontSize:22,opacity:.9}),J=(0,p.ZP)("div",{name:"MuiAlert",slot:"Message",overridesResolver:function(e,n){return n.message}})({padding:"8px 0"}),Q=(0,p.ZP)("div",{name:"MuiAlert",slot:"Action",overridesResolver:function(e,n){return n.action}})({display:"flex",alignItems:"flex-start",padding:"4px 0 0 16px",marginLeft:"auto",marginRight:-8}),U={success:(0,v.jsx)(V,{fontSize:"inherit"}),warning:(0,v.jsx)(X,{fontSize:"inherit"}),error:(0,v.jsx)(_,{fontSize:"inherit"}),info:(0,v.jsx)(G,{fontSize:"inherit"})},ee=s.forwardRef((function(e,n){var t=(0,Z.Z)({props:e,name:"MuiAlert"}),r=t.action,o=t.children,s=t.className,u=t.closeText,d=void 0===u?"Close":u,f=t.color,m=t.icon,h=t.iconMapping,p=void 0===h?U:h,g=t.onClose,x=t.role,C=void 0===x?"alert":x,M=t.severity,y=void 0===M?"success":M,E=t.variant,S=void 0===E?"standard":E,b=(0,i.Z)(t,q),k=(0,a.Z)({},t,{color:f,severity:y,variant:S}),R=function(e){var n=e.variant,t=e.color,r=e.severity,o=e.classes,i={root:["root","".concat(n).concat((0,w.Z)(t||r)),"".concat(n)],icon:["icon"],message:["message"],action:["action"]};return(0,l.Z)(i,I,o)}(k);return(0,v.jsxs)(K,(0,a.Z)({role:C,elevation:0,ownerState:k,className:(0,c.Z)(R.root,s),ref:n},b,{children:[!1!==m?(0,v.jsx)(Y,{ownerState:k,className:R.icon,children:m||p[y]||U[y]}):null,(0,v.jsx)(J,{ownerState:k,className:R.message,children:o}),null!=r?(0,v.jsx)(Q,{ownerState:k,className:R.action,children:r}):null,null==r&&g?(0,v.jsx)(Q,{ownerState:k,className:R.action,children:(0,v.jsx)(D.Z,{size:"small","aria-label":d,title:d,color:"inherit",onClick:g,children:H||(H=(0,v.jsx)($,{fontSize:"small"}))})}):null]}))})),ne=t(1123);function te(e){return(0,E.Z)("MuiAlertTitle",e)}(0,S.Z)("MuiAlertTitle",["root"]);var re=["className"],oe=(0,p.ZP)(ne.Z,{name:"MuiAlertTitle",slot:"Root",overridesResolver:function(e,n){return n.root}})((function(e){return{fontWeight:e.theme.typography.fontWeightMedium,marginTop:-2}})),ie=s.forwardRef((function(e,n){var t=(0,Z.Z)({props:e,name:"MuiAlertTitle"}),r=t.className,o=(0,i.Z)(t,re),s=t,u=function(e){var n=e.classes;return(0,l.Z)({root:["root"]},te,n)}(s);return(0,v.jsx)(oe,(0,a.Z)({gutterBottom:!0,component:"div",ownerState:s,ref:n,className:(0,c.Z)(u.root,r)},o))})),ae=t(9434),se=t(2651),ce=function(){var e=(0,ae.v9)(se.Vf).toastData,n=(0,ae.I0)(),t=function(e,t){"clickaway"!==t&&n((0,se.PE)())},r=e.isOpen,o=e.title,i=e.message,a=e.type,s=e.duration,c=e.position.split("-");return(0,v.jsx)(W,{anchorOrigin:{vertical:c[0],horizontal:c[1]},style:{maxWidth:340,margin:"10px auto"},open:r,autoHideDuration:s,onClose:t,children:(0,v.jsxs)(ee,{className:"text-start",variant:"filled",severity:a,onClose:t,children:[o&&(0,v.jsx)(ie,{style:{fontFamily:"Trebuchet MS",fontSize:20,marginTop:-8},className:"fw-bold user-select-none",children:o}),(0,v.jsx)("div",{style:{fontSize:17,marginTop:-4},children:i})]})})}}}]);
//# sourceMappingURL=261.03fcf838.chunk.js.map