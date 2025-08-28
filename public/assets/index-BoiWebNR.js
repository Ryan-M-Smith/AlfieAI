(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class _s{}function rt(i,e){const t=/\{([^}]+)\}/g;return i.replace(t,(n,r)=>{if(Object.prototype.hasOwnProperty.call(e,r)){const s=e[r];return s!=null?String(s):""}else throw new Error(`Key '${r}' not found in valueMap.`)})}function c(i,e,t){for(let s=0;s<e.length-1;s++){const o=e[s];if(o.endsWith("[]")){const a=o.slice(0,-2);if(!(a in i))if(Array.isArray(t))i[a]=Array.from({length:t.length},()=>({}));else throw new Error(`Value must be a list given an array path ${o}`);if(Array.isArray(i[a])){const l=i[a];if(Array.isArray(t))for(let f=0;f<l.length;f++){const d=l[f];c(d,e.slice(s+1),t[f])}else for(const f of l)c(f,e.slice(s+1),t)}return}else if(o.endsWith("[0]")){const a=o.slice(0,-3);a in i||(i[a]=[{}]);const l=i[a];c(l[0],e.slice(s+1),t);return}(!i[o]||typeof i[o]!="object")&&(i[o]={}),i=i[o]}const n=e[e.length-1],r=i[n];if(r!==void 0){if(!t||typeof t=="object"&&Object.keys(t).length===0||t===r)return;if(typeof r=="object"&&typeof t=="object"&&r!==null&&t!==null)Object.assign(r,t);else throw new Error(`Cannot set value for an existing key. Key: ${n}`)}else i[n]=t}function u(i,e){try{if(e.length===1&&e[0]==="_self")return i;for(let t=0;t<e.length;t++){if(typeof i!="object"||i===null)return;const n=e[t];if(n.endsWith("[]")){const r=n.slice(0,-2);if(r in i){const s=i[r];return Array.isArray(s)?s.map(o=>u(o,e.slice(t+1))):void 0}else return}else i=i[n]}return i}catch(t){if(t instanceof TypeError)return;throw t}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function bt(i,e){if(!e||typeof e!="string")throw new Error("model is required and must be a string");if(i.isVertexAI()){if(e.startsWith("publishers/")||e.startsWith("projects/")||e.startsWith("models/"))return e;if(e.indexOf("/")>=0){const t=e.split("/",2);return`publishers/${t[0]}/models/${t[1]}`}else return`publishers/google/models/${e}`}else return e.startsWith("models/")||e.startsWith("tunedModels/")?e:`models/${e}`}function Rc(i,e){const t=bt(i,e);return t?t.startsWith("publishers/")&&i.isVertexAI()?`projects/${i.getProject()}/locations/${i.getLocation()}/${t}`:t.startsWith("models/")&&i.isVertexAI()?`projects/${i.getProject()}/locations/${i.getLocation()}/publishers/google/${t}`:t:""}function Ma(i,e){if(e==null)throw new Error("PartUnion is required");if(typeof e=="object")return e;if(typeof e=="string")return{text:e};throw new Error(`Unsupported part type: ${typeof e}`)}function bc(i,e){if(e==null||Array.isArray(e)&&e.length===0)throw new Error("PartListUnion is required");return Array.isArray(e)?e.map(t=>Ma(i,t)):[Ma(i,e)]}function oo(i){return i!=null&&typeof i=="object"&&"parts"in i&&Array.isArray(i.parts)}function Ta(i){return i!=null&&typeof i=="object"&&"functionCall"in i}function Aa(i){return i!=null&&typeof i=="object"&&"functionResponse"in i}function zt(i,e){if(e==null)throw new Error("ContentUnion is required");return oo(e)?e:{role:"user",parts:bc(i,e)}}function Pc(i,e){if(!e)return[];if(i.isVertexAI()&&Array.isArray(e))return e.flatMap(t=>{const n=zt(i,t);return n.parts&&n.parts.length>0&&n.parts[0].text!==void 0?[n.parts[0].text]:[]});if(i.isVertexAI()){const t=zt(i,e);return t.parts&&t.parts.length>0&&t.parts[0].text!==void 0?[t.parts[0].text]:[]}return Array.isArray(e)?e.map(t=>zt(i,t)):[zt(i,e)]}function vt(i,e){if(e==null||Array.isArray(e)&&e.length===0)throw new Error("contents are required");if(!Array.isArray(e)){if(Ta(e)||Aa(e))throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");return[zt(i,e)]}const t=[],n=[],r=oo(e[0]);for(const s of e){const o=oo(s);if(o!=r)throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");if(o)t.push(s);else{if(Ta(s)||Aa(s))throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");n.push(s)}}return r||t.push({role:"user",parts:bc(i,n)}),t}function Kr(i,e){if(!i.isVertexAI()&&"default"in e)throw new Error("Default value is not supported in the response schema for the Gemini API.");if("anyOf"in e&&e.anyOf!==void 0)for(const t of e.anyOf)Kr(i,t);if("items"in e&&e.items!==void 0&&Kr(i,e.items),"properties"in e&&e.properties!==void 0)for(const t of Object.values(e.properties))Kr(i,t)}function Ic(i,e){return Kr(i,e),e}function Dc(i,e){if(typeof e=="object"&&"voiceConfig"in e)return e;if(typeof e=="string")return{voiceConfig:{prebuiltVoiceConfig:{voiceName:e}}};throw new Error(`Unsupported speechConfig type: ${typeof e}`)}function vs(i,e){return e}function en(i,e){if(!Array.isArray(e))throw new Error("tool is required and must be an array of Tools");return e}function Iu(i,e,t,n=1){const r=!e.startsWith(`${t}/`)&&e.split("/").length===n;return i.isVertexAI()?e.startsWith("projects/")?e:e.startsWith("locations/")?`projects/${i.getProject()}/${e}`:e.startsWith(`${t}/`)?`projects/${i.getProject()}/locations/${i.getLocation()}/${e}`:r?`projects/${i.getProject()}/locations/${i.getLocation()}/${t}/${e}`:e:r?`${t}/${e}`:e}function Xn(i,e){if(typeof e!="string")throw new Error("name must be a string");return Iu(i,e,"cachedContents")}function $n(i,e){if(typeof e!="string")throw new Error("fromImageBytes must be a string");return e}function Uc(i,e){if(typeof e!="string")throw new Error("fromName must be a string");return e.startsWith("files/")?e.split("files/")[1]:e}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Du(i,e){const t={};if(u(e,["videoMetadata"])!==void 0)throw new Error("videoMetadata parameter is not supported in Gemini API.");const n=u(e,["thought"]);n!=null&&c(t,["thought"],n);const r=u(e,["codeExecutionResult"]);r!=null&&c(t,["codeExecutionResult"],r);const s=u(e,["executableCode"]);s!=null&&c(t,["executableCode"],s);const o=u(e,["fileData"]);o!=null&&c(t,["fileData"],o);const a=u(e,["functionCall"]);a!=null&&c(t,["functionCall"],a);const l=u(e,["functionResponse"]);l!=null&&c(t,["functionResponse"],l);const f=u(e,["inlineData"]);f!=null&&c(t,["inlineData"],f);const d=u(e,["text"]);return d!=null&&c(t,["text"],d),t}function Ca(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Du(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Uu(i,e){const t={};if(u(e,["response"])!==void 0)throw new Error("response parameter is not supported in Gemini API.");const n=u(e,["description"]);n!=null&&c(t,["description"],n);const r=u(e,["name"]);r!=null&&c(t,["name"],r);const s=u(e,["parameters"]);return s!=null&&c(t,["parameters"],s),t}function Lu(){return{}}function Nu(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["dynamicThreshold"]);return r!=null&&c(t,["dynamicThreshold"],r),t}function Fu(i,e){const t={},n=u(e,["dynamicRetrievalConfig"]);return n!=null&&c(t,["dynamicRetrievalConfig"],Nu(i,n)),t}function Ou(i,e){const t={},n=u(e,["functionDeclarations"]);if(n!=null&&(Array.isArray(n)?c(t,["functionDeclarations"],n.map(a=>Uu(i,a))):c(t,["functionDeclarations"],n)),u(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");u(e,["googleSearch"])!=null&&c(t,["googleSearch"],Lu());const s=u(e,["googleSearchRetrieval"]);s!=null&&c(t,["googleSearchRetrieval"],Fu(i,s));const o=u(e,["codeExecution"]);return o!=null&&c(t,["codeExecution"],o),t}function Bu(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["allowedFunctionNames"]);return r!=null&&c(t,["allowedFunctionNames"],r),t}function Vu(i,e){const t={},n=u(e,["functionCallingConfig"]);return n!=null&&c(t,["functionCallingConfig"],Bu(i,n)),t}function zu(i,e,t){const n={},r=u(e,["ttl"]);t!==void 0&&r!=null&&c(t,["ttl"],r);const s=u(e,["expireTime"]);t!==void 0&&s!=null&&c(t,["expireTime"],s);const o=u(e,["displayName"]);t!==void 0&&o!=null&&c(t,["displayName"],o);const a=u(e,["contents"]);t!==void 0&&a!=null&&(Array.isArray(a)?c(t,["contents"],vt(i,vt(i,a).map(h=>Ca(i,h)))):c(t,["contents"],vt(i,a)));const l=u(e,["systemInstruction"]);t!==void 0&&l!=null&&c(t,["systemInstruction"],Ca(i,zt(i,l)));const f=u(e,["tools"]);t!==void 0&&f!=null&&(Array.isArray(f)?c(t,["tools"],f.map(h=>Ou(i,h))):c(t,["tools"],f));const d=u(e,["toolConfig"]);return t!==void 0&&d!=null&&c(t,["toolConfig"],Vu(i,d)),n}function Hu(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["model"],Rc(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],zu(i,r,t)),t}function ku(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","name"],Xn(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Gu(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","name"],Xn(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Wu(i,e,t){const n={},r=u(e,["ttl"]);t!==void 0&&r!=null&&c(t,["ttl"],r);const s=u(e,["expireTime"]);return t!==void 0&&s!=null&&c(t,["expireTime"],s),n}function qu(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","name"],Xn(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],Wu(i,r,t)),t}function Xu(i,e,t){const n={},r=u(e,["pageSize"]);t!==void 0&&r!=null&&c(t,["_query","pageSize"],r);const s=u(e,["pageToken"]);return t!==void 0&&s!=null&&c(t,["_query","pageToken"],s),n}function $u(i,e){const t={},n=u(e,["config"]);return n!=null&&c(t,["config"],Xu(i,n,t)),t}function Yu(i,e){const t={},n=u(e,["videoMetadata"]);n!=null&&c(t,["videoMetadata"],n);const r=u(e,["thought"]);r!=null&&c(t,["thought"],r);const s=u(e,["codeExecutionResult"]);s!=null&&c(t,["codeExecutionResult"],s);const o=u(e,["executableCode"]);o!=null&&c(t,["executableCode"],o);const a=u(e,["fileData"]);a!=null&&c(t,["fileData"],a);const l=u(e,["functionCall"]);l!=null&&c(t,["functionCall"],l);const f=u(e,["functionResponse"]);f!=null&&c(t,["functionResponse"],f);const d=u(e,["inlineData"]);d!=null&&c(t,["inlineData"],d);const h=u(e,["text"]);return h!=null&&c(t,["text"],h),t}function wa(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Yu(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Ku(i,e){const t={},n=u(e,["example"]);n!=null&&c(t,["example"],n);const r=u(e,["pattern"]);r!=null&&c(t,["pattern"],r);const s=u(e,["default"]);s!=null&&c(t,["default"],s);const o=u(e,["maxLength"]);o!=null&&c(t,["maxLength"],o);const a=u(e,["minLength"]);a!=null&&c(t,["minLength"],a);const l=u(e,["minProperties"]);l!=null&&c(t,["minProperties"],l);const f=u(e,["maxProperties"]);f!=null&&c(t,["maxProperties"],f);const d=u(e,["anyOf"]);d!=null&&c(t,["anyOf"],d);const h=u(e,["description"]);h!=null&&c(t,["description"],h);const p=u(e,["enum"]);p!=null&&c(t,["enum"],p);const g=u(e,["format"]);g!=null&&c(t,["format"],g);const S=u(e,["items"]);S!=null&&c(t,["items"],S);const y=u(e,["maxItems"]);y!=null&&c(t,["maxItems"],y);const x=u(e,["maximum"]);x!=null&&c(t,["maximum"],x);const m=u(e,["minItems"]);m!=null&&c(t,["minItems"],m);const P=u(e,["minimum"]);P!=null&&c(t,["minimum"],P);const w=u(e,["nullable"]);w!=null&&c(t,["nullable"],w);const T=u(e,["properties"]);T!=null&&c(t,["properties"],T);const V=u(e,["propertyOrdering"]);V!=null&&c(t,["propertyOrdering"],V);const F=u(e,["required"]);F!=null&&c(t,["required"],F);const N=u(e,["title"]);N!=null&&c(t,["title"],N);const z=u(e,["type"]);return z!=null&&c(t,["type"],z),t}function Zu(i,e){const t={},n=u(e,["response"]);n!=null&&c(t,["response"],Ku(i,n));const r=u(e,["description"]);r!=null&&c(t,["description"],r);const s=u(e,["name"]);s!=null&&c(t,["name"],s);const o=u(e,["parameters"]);return o!=null&&c(t,["parameters"],o),t}function Ju(){return{}}function Qu(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["dynamicThreshold"]);return r!=null&&c(t,["dynamicThreshold"],r),t}function ju(i,e){const t={},n=u(e,["dynamicRetrievalConfig"]);return n!=null&&c(t,["dynamicRetrievalConfig"],Qu(i,n)),t}function ef(i,e){const t={},n=u(e,["functionDeclarations"]);n!=null&&(Array.isArray(n)?c(t,["functionDeclarations"],n.map(l=>Zu(i,l))):c(t,["functionDeclarations"],n));const r=u(e,["retrieval"]);r!=null&&c(t,["retrieval"],r),u(e,["googleSearch"])!=null&&c(t,["googleSearch"],Ju());const o=u(e,["googleSearchRetrieval"]);o!=null&&c(t,["googleSearchRetrieval"],ju(i,o));const a=u(e,["codeExecution"]);return a!=null&&c(t,["codeExecution"],a),t}function tf(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["allowedFunctionNames"]);return r!=null&&c(t,["allowedFunctionNames"],r),t}function nf(i,e){const t={},n=u(e,["functionCallingConfig"]);return n!=null&&c(t,["functionCallingConfig"],tf(i,n)),t}function rf(i,e,t){const n={},r=u(e,["ttl"]);t!==void 0&&r!=null&&c(t,["ttl"],r);const s=u(e,["expireTime"]);t!==void 0&&s!=null&&c(t,["expireTime"],s);const o=u(e,["displayName"]);t!==void 0&&o!=null&&c(t,["displayName"],o);const a=u(e,["contents"]);t!==void 0&&a!=null&&(Array.isArray(a)?c(t,["contents"],vt(i,vt(i,a).map(h=>wa(i,h)))):c(t,["contents"],vt(i,a)));const l=u(e,["systemInstruction"]);t!==void 0&&l!=null&&c(t,["systemInstruction"],wa(i,zt(i,l)));const f=u(e,["tools"]);t!==void 0&&f!=null&&(Array.isArray(f)?c(t,["tools"],f.map(h=>ef(i,h))):c(t,["tools"],f));const d=u(e,["toolConfig"]);return t!==void 0&&d!=null&&c(t,["toolConfig"],nf(i,d)),n}function sf(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["model"],Rc(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],rf(i,r,t)),t}function of(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","name"],Xn(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function af(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","name"],Xn(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function lf(i,e,t){const n={},r=u(e,["ttl"]);t!==void 0&&r!=null&&c(t,["ttl"],r);const s=u(e,["expireTime"]);return t!==void 0&&s!=null&&c(t,["expireTime"],s),n}function cf(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","name"],Xn(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],lf(i,r,t)),t}function uf(i,e,t){const n={},r=u(e,["pageSize"]);t!==void 0&&r!=null&&c(t,["_query","pageSize"],r);const s=u(e,["pageToken"]);return t!==void 0&&s!=null&&c(t,["_query","pageToken"],s),n}function ff(i,e){const t={},n=u(e,["config"]);return n!=null&&c(t,["config"],uf(i,n,t)),t}function Zr(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["displayName"]);r!=null&&c(t,["displayName"],r);const s=u(e,["model"]);s!=null&&c(t,["model"],s);const o=u(e,["createTime"]);o!=null&&c(t,["createTime"],o);const a=u(e,["updateTime"]);a!=null&&c(t,["updateTime"],a);const l=u(e,["expireTime"]);l!=null&&c(t,["expireTime"],l);const f=u(e,["usageMetadata"]);return f!=null&&c(t,["usageMetadata"],f),t}function df(){return{}}function hf(i,e){const t={},n=u(e,["nextPageToken"]);n!=null&&c(t,["nextPageToken"],n);const r=u(e,["cachedContents"]);return r!=null&&(Array.isArray(r)?c(t,["cachedContents"],r.map(s=>Zr(i,s))):c(t,["cachedContents"],r)),t}function Jr(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["displayName"]);r!=null&&c(t,["displayName"],r);const s=u(e,["model"]);s!=null&&c(t,["model"],s);const o=u(e,["createTime"]);o!=null&&c(t,["createTime"],o);const a=u(e,["updateTime"]);a!=null&&c(t,["updateTime"],a);const l=u(e,["expireTime"]);l!=null&&c(t,["expireTime"],l);const f=u(e,["usageMetadata"]);return f!=null&&c(t,["usageMetadata"],f),t}function pf(){return{}}function mf(i,e){const t={},n=u(e,["nextPageToken"]);n!=null&&c(t,["nextPageToken"],n);const r=u(e,["cachedContents"]);return r!=null&&(Array.isArray(r)?c(t,["cachedContents"],r.map(s=>Jr(i,s))):c(t,["cachedContents"],r)),t}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */var as;(function(i){i.PAGED_ITEM_BATCH_JOBS="batchJobs",i.PAGED_ITEM_MODELS="models",i.PAGED_ITEM_TUNING_JOBS="tuningJobs",i.PAGED_ITEM_FILES="files",i.PAGED_ITEM_CACHED_CONTENTS="cachedContents"})(as||(as={}));class Lc{constructor(e,t,n,r){this.pageInternal=[],this.paramsInternal={},this.requestInternal=t,this.init(e,n,r)}init(e,t,n){var r,s;this.nameInternal=e,this.pageInternal=t[this.nameInternal]||[],this.idxInternal=0;let o={config:{}};n?typeof n=="object"?o=Object.assign({},n):o=n:o={config:{}},o.config&&(o.config.pageToken=t.nextPageToken),this.paramsInternal=o,this.pageInternalSize=(s=(r=o.config)===null||r===void 0?void 0:r.pageSize)!==null&&s!==void 0?s:this.pageInternal.length}initNextPage(e){this.init(this.nameInternal,e,this.paramsInternal)}get page(){return this.pageInternal}get name(){return this.nameInternal}get pageSize(){return this.pageInternalSize}get params(){return this.paramsInternal}get pageLength(){return this.pageInternal.length}getItem(e){return this.pageInternal[e]}[Symbol.asyncIterator](){return{next:async()=>{if(this.idxInternal>=this.pageLength)if(this.hasNextPage())await this.nextPage();else return{value:void 0,done:!0};const e=this.getItem(this.idxInternal);return this.idxInternal+=1,{value:e,done:!1}},return:async()=>({value:void 0,done:!0})}}async nextPage(){if(!this.hasNextPage())throw new Error("No more pages to fetch.");const e=await this.requestInternal(this.params);return this.initNextPage(e),this.page}hasNextPage(){var e;return((e=this.params.config)===null||e===void 0?void 0:e.pageToken)!==void 0}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */var Ra;(function(i){i.OUTCOME_UNSPECIFIED="OUTCOME_UNSPECIFIED",i.OUTCOME_OK="OUTCOME_OK",i.OUTCOME_FAILED="OUTCOME_FAILED",i.OUTCOME_DEADLINE_EXCEEDED="OUTCOME_DEADLINE_EXCEEDED"})(Ra||(Ra={}));var ba;(function(i){i.LANGUAGE_UNSPECIFIED="LANGUAGE_UNSPECIFIED",i.PYTHON="PYTHON"})(ba||(ba={}));var Pa;(function(i){i.TYPE_UNSPECIFIED="TYPE_UNSPECIFIED",i.STRING="STRING",i.NUMBER="NUMBER",i.INTEGER="INTEGER",i.BOOLEAN="BOOLEAN",i.ARRAY="ARRAY",i.OBJECT="OBJECT"})(Pa||(Pa={}));var Ia;(function(i){i.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",i.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",i.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",i.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",i.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",i.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(Ia||(Ia={}));var Da;(function(i){i.HARM_BLOCK_METHOD_UNSPECIFIED="HARM_BLOCK_METHOD_UNSPECIFIED",i.SEVERITY="SEVERITY",i.PROBABILITY="PROBABILITY"})(Da||(Da={}));var Ua;(function(i){i.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",i.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",i.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",i.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",i.BLOCK_NONE="BLOCK_NONE",i.OFF="OFF"})(Ua||(Ua={}));var La;(function(i){i.MODE_UNSPECIFIED="MODE_UNSPECIFIED",i.MODE_DYNAMIC="MODE_DYNAMIC"})(La||(La={}));var Na;(function(i){i.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",i.STOP="STOP",i.MAX_TOKENS="MAX_TOKENS",i.SAFETY="SAFETY",i.RECITATION="RECITATION",i.OTHER="OTHER",i.BLOCKLIST="BLOCKLIST",i.PROHIBITED_CONTENT="PROHIBITED_CONTENT",i.SPII="SPII",i.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",i.IMAGE_SAFETY="IMAGE_SAFETY"})(Na||(Na={}));var Fa;(function(i){i.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",i.NEGLIGIBLE="NEGLIGIBLE",i.LOW="LOW",i.MEDIUM="MEDIUM",i.HIGH="HIGH"})(Fa||(Fa={}));var Oa;(function(i){i.HARM_SEVERITY_UNSPECIFIED="HARM_SEVERITY_UNSPECIFIED",i.HARM_SEVERITY_NEGLIGIBLE="HARM_SEVERITY_NEGLIGIBLE",i.HARM_SEVERITY_LOW="HARM_SEVERITY_LOW",i.HARM_SEVERITY_MEDIUM="HARM_SEVERITY_MEDIUM",i.HARM_SEVERITY_HIGH="HARM_SEVERITY_HIGH"})(Oa||(Oa={}));var Ba;(function(i){i.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",i.SAFETY="SAFETY",i.OTHER="OTHER",i.BLOCKLIST="BLOCKLIST",i.PROHIBITED_CONTENT="PROHIBITED_CONTENT"})(Ba||(Ba={}));var Va;(function(i){i.TRAFFIC_TYPE_UNSPECIFIED="TRAFFIC_TYPE_UNSPECIFIED",i.ON_DEMAND="ON_DEMAND",i.PROVISIONED_THROUGHPUT="PROVISIONED_THROUGHPUT"})(Va||(Va={}));var nr;(function(i){i.MODALITY_UNSPECIFIED="MODALITY_UNSPECIFIED",i.TEXT="TEXT",i.IMAGE="IMAGE",i.AUDIO="AUDIO"})(nr||(nr={}));var za;(function(i){i.MEDIA_RESOLUTION_UNSPECIFIED="MEDIA_RESOLUTION_UNSPECIFIED",i.MEDIA_RESOLUTION_LOW="MEDIA_RESOLUTION_LOW",i.MEDIA_RESOLUTION_MEDIUM="MEDIA_RESOLUTION_MEDIUM",i.MEDIA_RESOLUTION_HIGH="MEDIA_RESOLUTION_HIGH"})(za||(za={}));var Ha;(function(i){i.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED="FEATURE_SELECTION_PREFERENCE_UNSPECIFIED",i.PRIORITIZE_QUALITY="PRIORITIZE_QUALITY",i.BALANCED="BALANCED",i.PRIORITIZE_COST="PRIORITIZE_COST"})(Ha||(Ha={}));var ka;(function(i){i.MODE_UNSPECIFIED="MODE_UNSPECIFIED",i.MODE_DYNAMIC="MODE_DYNAMIC"})(ka||(ka={}));var Ga;(function(i){i.MODE_UNSPECIFIED="MODE_UNSPECIFIED",i.AUTO="AUTO",i.ANY="ANY",i.NONE="NONE"})(Ga||(Ga={}));var Wa;(function(i){i.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",i.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",i.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",i.BLOCK_NONE="BLOCK_NONE"})(Wa||(Wa={}));var qa;(function(i){i.DONT_ALLOW="DONT_ALLOW",i.ALLOW_ADULT="ALLOW_ADULT",i.ALLOW_ALL="ALLOW_ALL"})(qa||(qa={}));var Xa;(function(i){i.auto="auto",i.en="en",i.ja="ja",i.ko="ko",i.hi="hi"})(Xa||(Xa={}));var $a;(function(i){i.STATE_UNSPECIFIED="STATE_UNSPECIFIED",i.PROCESSING="PROCESSING",i.ACTIVE="ACTIVE",i.FAILED="FAILED"})($a||($a={}));var Ya;(function(i){i.SOURCE_UNSPECIFIED="SOURCE_UNSPECIFIED",i.UPLOADED="UPLOADED",i.GENERATED="GENERATED"})(Ya||(Ya={}));var Ka;(function(i){i.MASK_MODE_DEFAULT="MASK_MODE_DEFAULT",i.MASK_MODE_USER_PROVIDED="MASK_MODE_USER_PROVIDED",i.MASK_MODE_BACKGROUND="MASK_MODE_BACKGROUND",i.MASK_MODE_FOREGROUND="MASK_MODE_FOREGROUND",i.MASK_MODE_SEMANTIC="MASK_MODE_SEMANTIC"})(Ka||(Ka={}));var Za;(function(i){i.CONTROL_TYPE_DEFAULT="CONTROL_TYPE_DEFAULT",i.CONTROL_TYPE_CANNY="CONTROL_TYPE_CANNY",i.CONTROL_TYPE_SCRIBBLE="CONTROL_TYPE_SCRIBBLE",i.CONTROL_TYPE_FACE_MESH="CONTROL_TYPE_FACE_MESH"})(Za||(Za={}));var Ja;(function(i){i.SUBJECT_TYPE_DEFAULT="SUBJECT_TYPE_DEFAULT",i.SUBJECT_TYPE_PERSON="SUBJECT_TYPE_PERSON",i.SUBJECT_TYPE_ANIMAL="SUBJECT_TYPE_ANIMAL",i.SUBJECT_TYPE_PRODUCT="SUBJECT_TYPE_PRODUCT"})(Ja||(Ja={}));var Qa;(function(i){i.MODALITY_UNSPECIFIED="MODALITY_UNSPECIFIED",i.TEXT="TEXT",i.IMAGE="IMAGE",i.VIDEO="VIDEO",i.AUDIO="AUDIO",i.DOCUMENT="DOCUMENT"})(Qa||(Qa={}));var ja;(function(i){i.START_SENSITIVITY_UNSPECIFIED="START_SENSITIVITY_UNSPECIFIED",i.START_SENSITIVITY_HIGH="START_SENSITIVITY_HIGH",i.START_SENSITIVITY_LOW="START_SENSITIVITY_LOW"})(ja||(ja={}));var el;(function(i){i.END_SENSITIVITY_UNSPECIFIED="END_SENSITIVITY_UNSPECIFIED",i.END_SENSITIVITY_HIGH="END_SENSITIVITY_HIGH",i.END_SENSITIVITY_LOW="END_SENSITIVITY_LOW"})(el||(el={}));var tl;(function(i){i.ACTIVITY_HANDLING_UNSPECIFIED="ACTIVITY_HANDLING_UNSPECIFIED",i.START_OF_ACTIVITY_INTERRUPTS="START_OF_ACTIVITY_INTERRUPTS",i.NO_INTERRUPTION="NO_INTERRUPTION"})(tl||(tl={}));var nl;(function(i){i.TURN_COVERAGE_UNSPECIFIED="TURN_COVERAGE_UNSPECIFIED",i.TURN_INCLUDES_ONLY_ACTIVITY="TURN_INCLUDES_ONLY_ACTIVITY",i.TURN_INCLUDES_ALL_INPUT="TURN_INCLUDES_ALL_INPUT"})(nl||(nl={}));class Mr{get text(){var e,t,n,r,s,o,a,l;if(((r=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||r===void 0?void 0:r.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning text from the first one.");let f="",d=!1;const h=[];for(const p of(l=(a=(o=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||o===void 0?void 0:o.content)===null||a===void 0?void 0:a.parts)!==null&&l!==void 0?l:[]){for(const[g,S]of Object.entries(p))g!=="text"&&g!=="thought"&&(S!==null||S!==void 0)&&h.push(g);if(typeof p.text=="string"){if(typeof p.thought=="boolean"&&p.thought)continue;d=!0,f+=p.text}}return h.length>0&&console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`),d?f:void 0}get functionCalls(){var e,t,n,r,s,o,a,l;if(((r=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||r===void 0?void 0:r.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning function calls from the first one.");const f=(l=(a=(o=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||o===void 0?void 0:o.content)===null||a===void 0?void 0:a.parts)===null||l===void 0?void 0:l.filter(d=>d.functionCall).map(d=>d.functionCall).filter(d=>d!==void 0);if(f?.length!==0)return f}get executableCode(){var e,t,n,r,s,o,a,l,f;if(((r=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||r===void 0?void 0:r.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning executable code from the first one.");const d=(l=(a=(o=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||o===void 0?void 0:o.content)===null||a===void 0?void 0:a.parts)===null||l===void 0?void 0:l.filter(h=>h.executableCode).map(h=>h.executableCode).filter(h=>h!==void 0);if(d?.length!==0)return(f=d?.[0])===null||f===void 0?void 0:f.code}get codeExecutionResult(){var e,t,n,r,s,o,a,l,f;if(((r=(n=(t=(e=this.candidates)===null||e===void 0?void 0:e[0])===null||t===void 0?void 0:t.content)===null||n===void 0?void 0:n.parts)===null||r===void 0?void 0:r.length)===0)return;this.candidates&&this.candidates.length>1&&console.warn("there are multiple candidates in the response, returning code execution result from the first one.");const d=(l=(a=(o=(s=this.candidates)===null||s===void 0?void 0:s[0])===null||o===void 0?void 0:o.content)===null||a===void 0?void 0:a.parts)===null||l===void 0?void 0:l.filter(h=>h.codeExecutionResult).map(h=>h.codeExecutionResult).filter(h=>h!==void 0);if(d?.length!==0)return(f=d?.[0])===null||f===void 0?void 0:f.output}}class il{}class rl{}class sl{}class gf{}class ol{}class al{}class _f{}class ao{constructor(e){const t={};for(const n of e.headers.entries())t[n[0]]=n[1];this.headers=t,this.responseInternal=e}json(){return this.responseInternal.json()}}class vf{}class xf{}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Sf extends _s{constructor(e){super(),this.apiClient=e,this.list=async(t={})=>new Lc(as.PAGED_ITEM_CACHED_CONTENTS,n=>this.listInternal(n),await this.listInternal(t),t)}async create(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=sf(this.apiClient,e);return s=rt("cachedContents",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>Jr(this.apiClient,l))}else{const a=Hu(this.apiClient,e);return s=rt("cachedContents",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>Zr(this.apiClient,l))}}async get(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=of(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>Jr(this.apiClient,l))}else{const a=ku(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>Zr(this.apiClient,l))}}async delete(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=af(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(()=>{const l=pf(),f=new ol;return Object.assign(f,l),f})}else{const a=Gu(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"DELETE",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(()=>{const l=df(),f=new ol;return Object.assign(f,l),f})}}async update(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=cf(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"PATCH",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>Jr(this.apiClient,l))}else{const a=qu(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"PATCH",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>Zr(this.apiClient,l))}}async listInternal(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=ff(this.apiClient,e);return s=rt("cachedContents",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>{const f=mf(this.apiClient,l),d=new al;return Object.assign(d,f),d})}else{const a=$u(this.apiClient,e);return s=rt("cachedContents",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>{const f=hf(this.apiClient,l),d=new al;return Object.assign(d,f),d})}}}function ll(i){var e=typeof Symbol=="function"&&Symbol.iterator,t=e&&i[e],n=0;if(t)return t.call(i);if(i&&typeof i.length=="number")return{next:function(){return i&&n>=i.length&&(i=void 0),{value:i&&i[n++],done:!i}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function Dt(i){return this instanceof Dt?(this.v=i,this):new Dt(i)}function ls(i,e,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var n=t.apply(i,e||[]),r,s=[];return r=Object.create((typeof AsyncIterator=="function"?AsyncIterator:Object).prototype),a("next"),a("throw"),a("return",o),r[Symbol.asyncIterator]=function(){return this},r;function o(g){return function(S){return Promise.resolve(S).then(g,h)}}function a(g,S){n[g]&&(r[g]=function(y){return new Promise(function(x,m){s.push([g,y,x,m])>1||l(g,y)})},S&&(r[g]=S(r[g])))}function l(g,S){try{f(n[g](S))}catch(y){p(s[0][3],y)}}function f(g){g.value instanceof Dt?Promise.resolve(g.value.v).then(d,h):p(s[0][2],g)}function d(g){l("next",g)}function h(g){l("throw",g)}function p(g,S){g(S),s.shift(),s.length&&l(s[0][0],s[0][1])}}function lo(i){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e=i[Symbol.asyncIterator],t;return e?e.call(i):(i=typeof ll=="function"?ll(i):i[Symbol.iterator](),t={},n("next"),n("throw"),n("return"),t[Symbol.asyncIterator]=function(){return this},t);function n(s){t[s]=i[s]&&function(o){return new Promise(function(a,l){o=i[s](o),r(a,l,o.done,o.value)})}}function r(s,o,a,l){Promise.resolve(l).then(function(f){s({value:f,done:a})},o)}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Ef(i){var e;if(i.candidates==null||i.candidates.length===0)return!1;const t=(e=i.candidates[0])===null||e===void 0?void 0:e.content;return t===void 0?!1:Nc(t)}function Nc(i){if(i.parts===void 0||i.parts.length===0)return!1;for(const e of i.parts)if(e===void 0||Object.keys(e).length===0||e.text!==void 0&&e.text==="")return!1;return!0}function yf(i){if(i.length!==0){if(i[0].role!=="user")throw new Error("History must start with a user turn.");for(const e of i)if(e.role!=="user"&&e.role!=="model")throw new Error(`Role must be user or model, but got ${e.role}.`)}}function Mf(i){if(i===void 0||i.length===0)return[];const e=[],t=i.length;let n=0,r=i[0];for(;n<t;)if(i[n].role==="user")r=i[n],n++;else{const s=[];let o=!0;for(;n<t&&i[n].role==="model";)s.push(i[n]),o&&!Nc(i[n])&&(o=!1),n++;o&&(e.push(r),e.push(...s))}return e}class Tf{constructor(e,t){this.modelsModule=e,this.apiClient=t}create(e){return new Af(this.apiClient,this.modelsModule,e.model,e.config,e.history)}}class Af{constructor(e,t,n,r={},s=[]){this.apiClient=e,this.modelsModule=t,this.model=n,this.config=r,this.history=s,this.sendPromise=Promise.resolve(),yf(s)}async sendMessage(e){var t;await this.sendPromise;const n=zt(this.apiClient,e.message),r=this.modelsModule.generateContent({model:this.model,contents:this.getHistory(!0).concat(n),config:(t=e.config)!==null&&t!==void 0?t:this.config});return this.sendPromise=(async()=>{var s,o;const l=(o=(s=(await r).candidates)===null||s===void 0?void 0:s[0])===null||o===void 0?void 0:o.content,f=l?[l]:[];this.recordHistory(n,f)})(),await this.sendPromise,r}async sendMessageStream(e){var t;await this.sendPromise;const n=zt(this.apiClient,e.message),r=this.modelsModule.generateContentStream({model:this.model,contents:this.getHistory(!0).concat(n),config:(t=e.config)!==null&&t!==void 0?t:this.config});this.sendPromise=r.then(()=>{});const s=await r;return this.processStreamResponse(s,n)}getHistory(e=!1){return e?Mf(this.history):this.history}processStreamResponse(e,t){var n,r;return ls(this,arguments,function*(){var o,a,l,f;const d=[];try{for(var h=!0,p=lo(e),g;g=yield Dt(p.next()),o=g.done,!o;h=!0){f=g.value,h=!1;const S=f;if(Ef(S)){const y=(r=(n=S.candidates)===null||n===void 0?void 0:n[0])===null||r===void 0?void 0:r.content;y!==void 0&&d.push(y)}yield yield Dt(S)}}catch(S){a={error:S}}finally{try{!h&&!o&&(l=p.return)&&(yield Dt(l.call(p)))}finally{if(a)throw a.error}}this.recordHistory(t,d)})}recordHistory(e,t){let n=[];t.length>0&&t.every(r=>r.role==="model")?n=t:n.push({role:"model",parts:[]}),this.history.push(e),this.history.push(...n)}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Cf(i,e,t){const n={},r=u(e,["pageSize"]);t!==void 0&&r!=null&&c(t,["_query","pageSize"],r);const s=u(e,["pageToken"]);return t!==void 0&&s!=null&&c(t,["_query","pageToken"],s),n}function wf(i,e){const t={},n=u(e,["config"]);return n!=null&&c(t,["config"],Cf(i,n,t)),t}function Rf(i,e){const t={},n=u(e,["details"]);n!=null&&c(t,["details"],n);const r=u(e,["message"]);r!=null&&c(t,["message"],r);const s=u(e,["code"]);return s!=null&&c(t,["code"],s),t}function bf(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["displayName"]);r!=null&&c(t,["displayName"],r);const s=u(e,["mimeType"]);s!=null&&c(t,["mimeType"],s);const o=u(e,["sizeBytes"]);o!=null&&c(t,["sizeBytes"],o);const a=u(e,["createTime"]);a!=null&&c(t,["createTime"],a);const l=u(e,["expirationTime"]);l!=null&&c(t,["expirationTime"],l);const f=u(e,["updateTime"]);f!=null&&c(t,["updateTime"],f);const d=u(e,["sha256Hash"]);d!=null&&c(t,["sha256Hash"],d);const h=u(e,["uri"]);h!=null&&c(t,["uri"],h);const p=u(e,["downloadUri"]);p!=null&&c(t,["downloadUri"],p);const g=u(e,["state"]);g!=null&&c(t,["state"],g);const S=u(e,["source"]);S!=null&&c(t,["source"],S);const y=u(e,["videoMetadata"]);y!=null&&c(t,["videoMetadata"],y);const x=u(e,["error"]);return x!=null&&c(t,["error"],Rf(i,x)),t}function Pf(i,e){const t={},n=u(e,["file"]);n!=null&&c(t,["file"],bf(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function If(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","file"],Uc(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Df(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["_url","file"],Uc(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Uf(i,e){const t={},n=u(e,["details"]);n!=null&&c(t,["details"],n);const r=u(e,["message"]);r!=null&&c(t,["message"],r);const s=u(e,["code"]);return s!=null&&c(t,["code"],s),t}function co(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["displayName"]);r!=null&&c(t,["displayName"],r);const s=u(e,["mimeType"]);s!=null&&c(t,["mimeType"],s);const o=u(e,["sizeBytes"]);o!=null&&c(t,["sizeBytes"],o);const a=u(e,["createTime"]);a!=null&&c(t,["createTime"],a);const l=u(e,["expirationTime"]);l!=null&&c(t,["expirationTime"],l);const f=u(e,["updateTime"]);f!=null&&c(t,["updateTime"],f);const d=u(e,["sha256Hash"]);d!=null&&c(t,["sha256Hash"],d);const h=u(e,["uri"]);h!=null&&c(t,["uri"],h);const p=u(e,["downloadUri"]);p!=null&&c(t,["downloadUri"],p);const g=u(e,["state"]);g!=null&&c(t,["state"],g);const S=u(e,["source"]);S!=null&&c(t,["source"],S);const y=u(e,["videoMetadata"]);y!=null&&c(t,["videoMetadata"],y);const x=u(e,["error"]);return x!=null&&c(t,["error"],Uf(i,x)),t}function Lf(i,e){const t={},n=u(e,["nextPageToken"]);n!=null&&c(t,["nextPageToken"],n);const r=u(e,["files"]);return r!=null&&(Array.isArray(r)?c(t,["files"],r.map(s=>co(i,s))):c(t,["files"],r)),t}function Nf(){return{}}function Ff(){return{}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Of extends _s{constructor(e){super(),this.apiClient=e,this.list=async(t={})=>new Lc(as.PAGED_ITEM_FILES,n=>this.listInternal(n),await this.listInternal(t),t)}async upload(e){if(this.apiClient.isVertexAI())throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");return this.apiClient.uploadFile(e.file,e.config).then(t=>co(this.apiClient,t))}async listInternal(e){var t;let n,r="",s={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const o=wf(this.apiClient,e);return r=rt("files",o._url),s=o._query,delete o.config,delete o._url,delete o._query,n=this.apiClient.request({path:r,queryParams:s,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(a=>a.json()),n.then(a=>{const l=Lf(this.apiClient,a),f=new _f;return Object.assign(f,l),f})}}async createInternal(e){var t;let n,r="",s={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const o=Pf(this.apiClient,e);return r=rt("upload/v1beta/files",o._url),s=o._query,delete o.config,delete o._url,delete o._query,n=this.apiClient.request({path:r,queryParams:s,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(a=>a.json()),n.then(()=>{const a=Nf(),l=new vf;return Object.assign(l,a),l})}}async get(e){var t;let n,r="",s={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const o=If(this.apiClient,e);return r=rt("files/{file}",o._url),s=o._query,delete o.config,delete o._url,delete o._query,n=this.apiClient.request({path:r,queryParams:s,body:JSON.stringify(o),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(a=>a.json()),n.then(a=>co(this.apiClient,a))}}async delete(e){var t;let n,r="",s={};if(this.apiClient.isVertexAI())throw new Error("This method is only supported by the Gemini Developer API.");{const o=Df(this.apiClient,e);return r=rt("files/{file}",o._url),s=o._query,delete o.config,delete o._url,delete o._query,n=this.apiClient.request({path:r,queryParams:s,body:JSON.stringify(o),httpMethod:"DELETE",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(a=>a.json()),n.then(()=>{const a=Ff(),l=new xf;return Object.assign(l,a),l})}}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Bf(i,e){const t={};if(u(e,["videoMetadata"])!==void 0)throw new Error("videoMetadata parameter is not supported in Gemini API.");const n=u(e,["thought"]);n!=null&&c(t,["thought"],n);const r=u(e,["codeExecutionResult"]);r!=null&&c(t,["codeExecutionResult"],r);const s=u(e,["executableCode"]);s!=null&&c(t,["executableCode"],s);const o=u(e,["fileData"]);o!=null&&c(t,["fileData"],o);const a=u(e,["functionCall"]);a!=null&&c(t,["functionCall"],a);const l=u(e,["functionResponse"]);l!=null&&c(t,["functionResponse"],l);const f=u(e,["inlineData"]);f!=null&&c(t,["inlineData"],f);const d=u(e,["text"]);return d!=null&&c(t,["text"],d),t}function Vf(i,e){const t={},n=u(e,["videoMetadata"]);n!=null&&c(t,["videoMetadata"],n);const r=u(e,["thought"]);r!=null&&c(t,["thought"],r);const s=u(e,["codeExecutionResult"]);s!=null&&c(t,["codeExecutionResult"],s);const o=u(e,["executableCode"]);o!=null&&c(t,["executableCode"],o);const a=u(e,["fileData"]);a!=null&&c(t,["fileData"],a);const l=u(e,["functionCall"]);l!=null&&c(t,["functionCall"],l);const f=u(e,["functionResponse"]);f!=null&&c(t,["functionResponse"],f);const d=u(e,["inlineData"]);d!=null&&c(t,["inlineData"],d);const h=u(e,["text"]);return h!=null&&c(t,["text"],h),t}function zf(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Bf(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Hf(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Vf(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function kf(i,e){const t={},n=u(e,["example"]);n!=null&&c(t,["example"],n);const r=u(e,["pattern"]);r!=null&&c(t,["pattern"],r);const s=u(e,["default"]);s!=null&&c(t,["default"],s);const o=u(e,["maxLength"]);o!=null&&c(t,["maxLength"],o);const a=u(e,["minLength"]);a!=null&&c(t,["minLength"],a);const l=u(e,["minProperties"]);l!=null&&c(t,["minProperties"],l);const f=u(e,["maxProperties"]);f!=null&&c(t,["maxProperties"],f);const d=u(e,["anyOf"]);d!=null&&c(t,["anyOf"],d);const h=u(e,["description"]);h!=null&&c(t,["description"],h);const p=u(e,["enum"]);p!=null&&c(t,["enum"],p);const g=u(e,["format"]);g!=null&&c(t,["format"],g);const S=u(e,["items"]);S!=null&&c(t,["items"],S);const y=u(e,["maxItems"]);y!=null&&c(t,["maxItems"],y);const x=u(e,["maximum"]);x!=null&&c(t,["maximum"],x);const m=u(e,["minItems"]);m!=null&&c(t,["minItems"],m);const P=u(e,["minimum"]);P!=null&&c(t,["minimum"],P);const w=u(e,["nullable"]);w!=null&&c(t,["nullable"],w);const T=u(e,["properties"]);T!=null&&c(t,["properties"],T);const V=u(e,["propertyOrdering"]);V!=null&&c(t,["propertyOrdering"],V);const F=u(e,["required"]);F!=null&&c(t,["required"],F);const N=u(e,["title"]);N!=null&&c(t,["title"],N);const z=u(e,["type"]);return z!=null&&c(t,["type"],z),t}function Gf(i,e){const t={};if(u(e,["response"])!==void 0)throw new Error("response parameter is not supported in Gemini API.");const n=u(e,["description"]);n!=null&&c(t,["description"],n);const r=u(e,["name"]);r!=null&&c(t,["name"],r);const s=u(e,["parameters"]);return s!=null&&c(t,["parameters"],s),t}function Wf(i,e){const t={},n=u(e,["response"]);n!=null&&c(t,["response"],kf(i,n));const r=u(e,["description"]);r!=null&&c(t,["description"],r);const s=u(e,["name"]);s!=null&&c(t,["name"],s);const o=u(e,["parameters"]);return o!=null&&c(t,["parameters"],o),t}function qf(){return{}}function Xf(){return{}}function $f(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["dynamicThreshold"]);return r!=null&&c(t,["dynamicThreshold"],r),t}function Yf(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["dynamicThreshold"]);return r!=null&&c(t,["dynamicThreshold"],r),t}function Kf(i,e){const t={},n=u(e,["dynamicRetrievalConfig"]);return n!=null&&c(t,["dynamicRetrievalConfig"],$f(i,n)),t}function Zf(i,e){const t={},n=u(e,["dynamicRetrievalConfig"]);return n!=null&&c(t,["dynamicRetrievalConfig"],Yf(i,n)),t}function Jf(i,e){const t={},n=u(e,["functionDeclarations"]);if(n!=null&&(Array.isArray(n)?c(t,["functionDeclarations"],n.map(a=>Gf(i,a))):c(t,["functionDeclarations"],n)),u(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");u(e,["googleSearch"])!=null&&c(t,["googleSearch"],qf());const s=u(e,["googleSearchRetrieval"]);s!=null&&c(t,["googleSearchRetrieval"],Kf(i,s));const o=u(e,["codeExecution"]);return o!=null&&c(t,["codeExecution"],o),t}function Qf(i,e){const t={},n=u(e,["functionDeclarations"]);n!=null&&(Array.isArray(n)?c(t,["functionDeclarations"],n.map(l=>Wf(i,l))):c(t,["functionDeclarations"],n));const r=u(e,["retrieval"]);r!=null&&c(t,["retrieval"],r),u(e,["googleSearch"])!=null&&c(t,["googleSearch"],Xf());const o=u(e,["googleSearchRetrieval"]);o!=null&&c(t,["googleSearchRetrieval"],Zf(i,o));const a=u(e,["codeExecution"]);return a!=null&&c(t,["codeExecution"],a),t}function jf(i,e){const t={},n=u(e,["handle"]);if(n!=null&&c(t,["handle"],n),u(e,["transparent"])!==void 0)throw new Error("transparent parameter is not supported in Gemini API.");return t}function ed(i,e){const t={},n=u(e,["handle"]);n!=null&&c(t,["handle"],n);const r=u(e,["transparent"]);return r!=null&&c(t,["transparent"],r),t}function td(){return{}}function cl(){return{}}function nd(i,e){const t={},n=u(e,["disabled"]);n!=null&&c(t,["disabled"],n);const r=u(e,["startOfSpeechSensitivity"]);r!=null&&c(t,["startOfSpeechSensitivity"],r);const s=u(e,["endOfSpeechSensitivity"]);s!=null&&c(t,["endOfSpeechSensitivity"],s);const o=u(e,["prefixPaddingMs"]);o!=null&&c(t,["prefixPaddingMs"],o);const a=u(e,["silenceDurationMs"]);return a!=null&&c(t,["silenceDurationMs"],a),t}function id(i,e){const t={},n=u(e,["disabled"]);n!=null&&c(t,["disabled"],n);const r=u(e,["startOfSpeechSensitivity"]);r!=null&&c(t,["startOfSpeechSensitivity"],r);const s=u(e,["endOfSpeechSensitivity"]);s!=null&&c(t,["endOfSpeechSensitivity"],s);const o=u(e,["prefixPaddingMs"]);o!=null&&c(t,["prefixPaddingMs"],o);const a=u(e,["silenceDurationMs"]);return a!=null&&c(t,["silenceDurationMs"],a),t}function rd(i,e){const t={},n=u(e,["automaticActivityDetection"]);n!=null&&c(t,["automaticActivityDetection"],nd(i,n));const r=u(e,["activityHandling"]);r!=null&&c(t,["activityHandling"],r);const s=u(e,["turnCoverage"]);return s!=null&&c(t,["turnCoverage"],s),t}function sd(i,e){const t={},n=u(e,["automaticActivityDetection"]);n!=null&&c(t,["automaticActivityDetection"],id(i,n));const r=u(e,["activityHandling"]);r!=null&&c(t,["activityHandling"],r);const s=u(e,["turnCoverage"]);return s!=null&&c(t,["turnCoverage"],s),t}function od(i,e){const t={},n=u(e,["targetTokens"]);return n!=null&&c(t,["targetTokens"],n),t}function ad(i,e){const t={},n=u(e,["targetTokens"]);return n!=null&&c(t,["targetTokens"],n),t}function ld(i,e){const t={},n=u(e,["triggerTokens"]);n!=null&&c(t,["triggerTokens"],n);const r=u(e,["slidingWindow"]);return r!=null&&c(t,["slidingWindow"],od(i,r)),t}function cd(i,e){const t={},n=u(e,["triggerTokens"]);n!=null&&c(t,["triggerTokens"],n);const r=u(e,["slidingWindow"]);return r!=null&&c(t,["slidingWindow"],ad(i,r)),t}function ud(i,e,t){const n={},r=u(e,["generationConfig"]);t!==void 0&&r!=null&&c(t,["setup","generationConfig"],r);const s=u(e,["responseModalities"]);t!==void 0&&s!=null&&c(t,["setup","generationConfig","responseModalities"],s);const o=u(e,["temperature"]);t!==void 0&&o!=null&&c(t,["setup","generationConfig","temperature"],o);const a=u(e,["topP"]);t!==void 0&&a!=null&&c(t,["setup","generationConfig","topP"],a);const l=u(e,["topK"]);t!==void 0&&l!=null&&c(t,["setup","generationConfig","topK"],l);const f=u(e,["maxOutputTokens"]);t!==void 0&&f!=null&&c(t,["setup","generationConfig","maxOutputTokens"],f);const d=u(e,["mediaResolution"]);t!==void 0&&d!=null&&c(t,["setup","generationConfig","mediaResolution"],d);const h=u(e,["seed"]);t!==void 0&&h!=null&&c(t,["setup","generationConfig","seed"],h);const p=u(e,["speechConfig"]);t!==void 0&&p!=null&&c(t,["setup","generationConfig","speechConfig"],p);const g=u(e,["systemInstruction"]);t!==void 0&&g!=null&&c(t,["setup","systemInstruction"],zf(i,zt(i,g)));const S=u(e,["tools"]);t!==void 0&&S!=null&&(Array.isArray(S)?c(t,["setup","tools"],en(i,en(i,S).map(w=>Jf(i,vs(i,w))))):c(t,["setup","tools"],en(i,S)));const y=u(e,["sessionResumption"]);if(t!==void 0&&y!=null&&c(t,["setup","sessionResumption"],jf(i,y)),u(e,["inputAudioTranscription"])!==void 0)throw new Error("inputAudioTranscription parameter is not supported in Gemini API.");const x=u(e,["outputAudioTranscription"]);t!==void 0&&x!=null&&c(t,["setup","outputAudioTranscription"],td());const m=u(e,["realtimeInputConfig"]);t!==void 0&&m!=null&&c(t,["setup","realtimeInputConfig"],rd(i,m));const P=u(e,["contextWindowCompression"]);return t!==void 0&&P!=null&&c(t,["setup","contextWindowCompression"],ld(i,P)),n}function fd(i,e,t){const n={},r=u(e,["generationConfig"]);t!==void 0&&r!=null&&c(t,["setup","generationConfig"],r);const s=u(e,["responseModalities"]);t!==void 0&&s!=null&&c(t,["setup","generationConfig","responseModalities"],s);const o=u(e,["temperature"]);t!==void 0&&o!=null&&c(t,["setup","generationConfig","temperature"],o);const a=u(e,["topP"]);t!==void 0&&a!=null&&c(t,["setup","generationConfig","topP"],a);const l=u(e,["topK"]);t!==void 0&&l!=null&&c(t,["setup","generationConfig","topK"],l);const f=u(e,["maxOutputTokens"]);t!==void 0&&f!=null&&c(t,["setup","generationConfig","maxOutputTokens"],f);const d=u(e,["mediaResolution"]);t!==void 0&&d!=null&&c(t,["setup","generationConfig","mediaResolution"],d);const h=u(e,["seed"]);t!==void 0&&h!=null&&c(t,["setup","generationConfig","seed"],h);const p=u(e,["speechConfig"]);t!==void 0&&p!=null&&c(t,["setup","generationConfig","speechConfig"],p);const g=u(e,["systemInstruction"]);t!==void 0&&g!=null&&c(t,["setup","systemInstruction"],Hf(i,zt(i,g)));const S=u(e,["tools"]);t!==void 0&&S!=null&&(Array.isArray(S)?c(t,["setup","tools"],en(i,en(i,S).map(T=>Qf(i,vs(i,T))))):c(t,["setup","tools"],en(i,S)));const y=u(e,["sessionResumption"]);t!==void 0&&y!=null&&c(t,["setup","sessionResumption"],ed(i,y));const x=u(e,["inputAudioTranscription"]);t!==void 0&&x!=null&&c(t,["setup","inputAudioTranscription"],cl());const m=u(e,["outputAudioTranscription"]);t!==void 0&&m!=null&&c(t,["setup","outputAudioTranscription"],cl());const P=u(e,["realtimeInputConfig"]);t!==void 0&&P!=null&&c(t,["setup","realtimeInputConfig"],sd(i,P));const w=u(e,["contextWindowCompression"]);return t!==void 0&&w!=null&&c(t,["setup","contextWindowCompression"],cd(i,w)),n}function dd(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["setup","model"],bt(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],ud(i,r,t)),t}function hd(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["setup","model"],bt(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],fd(i,r,t)),t}function pd(){return{}}function md(){return{}}function gd(i,e){const t={},n=u(e,["thought"]);n!=null&&c(t,["thought"],n);const r=u(e,["codeExecutionResult"]);r!=null&&c(t,["codeExecutionResult"],r);const s=u(e,["executableCode"]);s!=null&&c(t,["executableCode"],s);const o=u(e,["fileData"]);o!=null&&c(t,["fileData"],o);const a=u(e,["functionCall"]);a!=null&&c(t,["functionCall"],a);const l=u(e,["functionResponse"]);l!=null&&c(t,["functionResponse"],l);const f=u(e,["inlineData"]);f!=null&&c(t,["inlineData"],f);const d=u(e,["text"]);return d!=null&&c(t,["text"],d),t}function _d(i,e){const t={},n=u(e,["videoMetadata"]);n!=null&&c(t,["videoMetadata"],n);const r=u(e,["thought"]);r!=null&&c(t,["thought"],r);const s=u(e,["codeExecutionResult"]);s!=null&&c(t,["codeExecutionResult"],s);const o=u(e,["executableCode"]);o!=null&&c(t,["executableCode"],o);const a=u(e,["fileData"]);a!=null&&c(t,["fileData"],a);const l=u(e,["functionCall"]);l!=null&&c(t,["functionCall"],l);const f=u(e,["functionResponse"]);f!=null&&c(t,["functionResponse"],f);const d=u(e,["inlineData"]);d!=null&&c(t,["inlineData"],d);const h=u(e,["text"]);return h!=null&&c(t,["text"],h),t}function vd(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>gd(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function xd(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>_d(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function ul(i,e){const t={},n=u(e,["text"]);n!=null&&c(t,["text"],n);const r=u(e,["finished"]);return r!=null&&c(t,["finished"],r),t}function fl(i,e){const t={},n=u(e,["text"]);n!=null&&c(t,["text"],n);const r=u(e,["finished"]);return r!=null&&c(t,["finished"],r),t}function Sd(i,e){const t={},n=u(e,["modelTurn"]);n!=null&&c(t,["modelTurn"],vd(i,n));const r=u(e,["turnComplete"]);r!=null&&c(t,["turnComplete"],r);const s=u(e,["interrupted"]);s!=null&&c(t,["interrupted"],s);const o=u(e,["generationComplete"]);o!=null&&c(t,["generationComplete"],o);const a=u(e,["inputTranscription"]);a!=null&&c(t,["inputTranscription"],ul(i,a));const l=u(e,["outputTranscription"]);return l!=null&&c(t,["outputTranscription"],ul(i,l)),t}function Ed(i,e){const t={},n=u(e,["modelTurn"]);n!=null&&c(t,["modelTurn"],xd(i,n));const r=u(e,["turnComplete"]);r!=null&&c(t,["turnComplete"],r);const s=u(e,["interrupted"]);s!=null&&c(t,["interrupted"],s);const o=u(e,["generationComplete"]);o!=null&&c(t,["generationComplete"],o);const a=u(e,["inputTranscription"]);a!=null&&c(t,["inputTranscription"],fl(i,a));const l=u(e,["outputTranscription"]);return l!=null&&c(t,["outputTranscription"],fl(i,l)),t}function yd(i,e){const t={},n=u(e,["id"]);n!=null&&c(t,["id"],n);const r=u(e,["args"]);r!=null&&c(t,["args"],r);const s=u(e,["name"]);return s!=null&&c(t,["name"],s),t}function Md(i,e){const t={},n=u(e,["args"]);n!=null&&c(t,["args"],n);const r=u(e,["name"]);return r!=null&&c(t,["name"],r),t}function Td(i,e){const t={},n=u(e,["functionCalls"]);return n!=null&&(Array.isArray(n)?c(t,["functionCalls"],n.map(r=>yd(i,r))):c(t,["functionCalls"],n)),t}function Ad(i,e){const t={},n=u(e,["functionCalls"]);return n!=null&&(Array.isArray(n)?c(t,["functionCalls"],n.map(r=>Md(i,r))):c(t,["functionCalls"],n)),t}function Cd(i,e){const t={},n=u(e,["ids"]);return n!=null&&c(t,["ids"],n),t}function wd(i,e){const t={},n=u(e,["ids"]);return n!=null&&c(t,["ids"],n),t}function Tr(i,e){const t={},n=u(e,["modality"]);n!=null&&c(t,["modality"],n);const r=u(e,["tokenCount"]);return r!=null&&c(t,["tokenCount"],r),t}function Ar(i,e){const t={},n=u(e,["modality"]);n!=null&&c(t,["modality"],n);const r=u(e,["tokenCount"]);return r!=null&&c(t,["tokenCount"],r),t}function Rd(i,e){const t={},n=u(e,["promptTokenCount"]);n!=null&&c(t,["promptTokenCount"],n);const r=u(e,["cachedContentTokenCount"]);r!=null&&c(t,["cachedContentTokenCount"],r);const s=u(e,["responseTokenCount"]);s!=null&&c(t,["responseTokenCount"],s);const o=u(e,["toolUsePromptTokenCount"]);o!=null&&c(t,["toolUsePromptTokenCount"],o);const a=u(e,["thoughtsTokenCount"]);a!=null&&c(t,["thoughtsTokenCount"],a);const l=u(e,["totalTokenCount"]);l!=null&&c(t,["totalTokenCount"],l);const f=u(e,["promptTokensDetails"]);f!=null&&(Array.isArray(f)?c(t,["promptTokensDetails"],f.map(g=>Tr(i,g))):c(t,["promptTokensDetails"],f));const d=u(e,["cacheTokensDetails"]);d!=null&&(Array.isArray(d)?c(t,["cacheTokensDetails"],d.map(g=>Tr(i,g))):c(t,["cacheTokensDetails"],d));const h=u(e,["responseTokensDetails"]);h!=null&&(Array.isArray(h)?c(t,["responseTokensDetails"],h.map(g=>Tr(i,g))):c(t,["responseTokensDetails"],h));const p=u(e,["toolUsePromptTokensDetails"]);return p!=null&&(Array.isArray(p)?c(t,["toolUsePromptTokensDetails"],p.map(g=>Tr(i,g))):c(t,["toolUsePromptTokensDetails"],p)),t}function bd(i,e){const t={},n=u(e,["promptTokenCount"]);n!=null&&c(t,["promptTokenCount"],n);const r=u(e,["cachedContentTokenCount"]);r!=null&&c(t,["cachedContentTokenCount"],r);const s=u(e,["candidatesTokenCount"]);s!=null&&c(t,["responseTokenCount"],s);const o=u(e,["toolUsePromptTokenCount"]);o!=null&&c(t,["toolUsePromptTokenCount"],o);const a=u(e,["thoughtsTokenCount"]);a!=null&&c(t,["thoughtsTokenCount"],a);const l=u(e,["totalTokenCount"]);l!=null&&c(t,["totalTokenCount"],l);const f=u(e,["promptTokensDetails"]);f!=null&&(Array.isArray(f)?c(t,["promptTokensDetails"],f.map(S=>Ar(i,S))):c(t,["promptTokensDetails"],f));const d=u(e,["cacheTokensDetails"]);d!=null&&(Array.isArray(d)?c(t,["cacheTokensDetails"],d.map(S=>Ar(i,S))):c(t,["cacheTokensDetails"],d));const h=u(e,["candidatesTokensDetails"]);h!=null&&(Array.isArray(h)?c(t,["responseTokensDetails"],h.map(S=>Ar(i,S))):c(t,["responseTokensDetails"],h));const p=u(e,["toolUsePromptTokensDetails"]);p!=null&&(Array.isArray(p)?c(t,["toolUsePromptTokensDetails"],p.map(S=>Ar(i,S))):c(t,["toolUsePromptTokensDetails"],p));const g=u(e,["trafficType"]);return g!=null&&c(t,["trafficType"],g),t}function Pd(i,e){const t={},n=u(e,["timeLeft"]);return n!=null&&c(t,["timeLeft"],n),t}function Id(i,e){const t={},n=u(e,["timeLeft"]);return n!=null&&c(t,["timeLeft"],n),t}function Dd(i,e){const t={},n=u(e,["newHandle"]);n!=null&&c(t,["newHandle"],n);const r=u(e,["resumable"]);r!=null&&c(t,["resumable"],r);const s=u(e,["lastConsumedClientMessageIndex"]);return s!=null&&c(t,["lastConsumedClientMessageIndex"],s),t}function Ud(i,e){const t={},n=u(e,["newHandle"]);n!=null&&c(t,["newHandle"],n);const r=u(e,["resumable"]);r!=null&&c(t,["resumable"],r);const s=u(e,["lastConsumedClientMessageIndex"]);return s!=null&&c(t,["lastConsumedClientMessageIndex"],s),t}function Ld(i,e){const t={};u(e,["setupComplete"])!=null&&c(t,["setupComplete"],pd());const r=u(e,["serverContent"]);r!=null&&c(t,["serverContent"],Sd(i,r));const s=u(e,["toolCall"]);s!=null&&c(t,["toolCall"],Td(i,s));const o=u(e,["toolCallCancellation"]);o!=null&&c(t,["toolCallCancellation"],Cd(i,o));const a=u(e,["usageMetadata"]);a!=null&&c(t,["usageMetadata"],Rd(i,a));const l=u(e,["goAway"]);l!=null&&c(t,["goAway"],Pd(i,l));const f=u(e,["sessionResumptionUpdate"]);return f!=null&&c(t,["sessionResumptionUpdate"],Dd(i,f)),t}function Nd(i,e){const t={};u(e,["setupComplete"])!=null&&c(t,["setupComplete"],md());const r=u(e,["serverContent"]);r!=null&&c(t,["serverContent"],Ed(i,r));const s=u(e,["toolCall"]);s!=null&&c(t,["toolCall"],Ad(i,s));const o=u(e,["toolCallCancellation"]);o!=null&&c(t,["toolCallCancellation"],wd(i,o));const a=u(e,["usageMetadata"]);a!=null&&c(t,["usageMetadata"],bd(i,a));const l=u(e,["goAway"]);l!=null&&c(t,["goAway"],Id(i,l));const f=u(e,["sessionResumptionUpdate"]);return f!=null&&c(t,["sessionResumptionUpdate"],Ud(i,f)),t}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Fd(i,e){const t={};if(u(e,["videoMetadata"])!==void 0)throw new Error("videoMetadata parameter is not supported in Gemini API.");const n=u(e,["thought"]);n!=null&&c(t,["thought"],n);const r=u(e,["codeExecutionResult"]);r!=null&&c(t,["codeExecutionResult"],r);const s=u(e,["executableCode"]);s!=null&&c(t,["executableCode"],s);const o=u(e,["fileData"]);o!=null&&c(t,["fileData"],o);const a=u(e,["functionCall"]);a!=null&&c(t,["functionCall"],a);const l=u(e,["functionResponse"]);l!=null&&c(t,["functionResponse"],l);const f=u(e,["inlineData"]);f!=null&&c(t,["inlineData"],f);const d=u(e,["text"]);return d!=null&&c(t,["text"],d),t}function xs(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Fd(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Od(i,e){const t={};if(u(e,["example"])!==void 0)throw new Error("example parameter is not supported in Gemini API.");if(u(e,["pattern"])!==void 0)throw new Error("pattern parameter is not supported in Gemini API.");if(u(e,["default"])!==void 0)throw new Error("default parameter is not supported in Gemini API.");if(u(e,["maxLength"])!==void 0)throw new Error("maxLength parameter is not supported in Gemini API.");if(u(e,["minLength"])!==void 0)throw new Error("minLength parameter is not supported in Gemini API.");if(u(e,["minProperties"])!==void 0)throw new Error("minProperties parameter is not supported in Gemini API.");if(u(e,["maxProperties"])!==void 0)throw new Error("maxProperties parameter is not supported in Gemini API.");const n=u(e,["anyOf"]);n!=null&&c(t,["anyOf"],n);const r=u(e,["description"]);r!=null&&c(t,["description"],r);const s=u(e,["enum"]);s!=null&&c(t,["enum"],s);const o=u(e,["format"]);o!=null&&c(t,["format"],o);const a=u(e,["items"]);a!=null&&c(t,["items"],a);const l=u(e,["maxItems"]);l!=null&&c(t,["maxItems"],l);const f=u(e,["maximum"]);f!=null&&c(t,["maximum"],f);const d=u(e,["minItems"]);d!=null&&c(t,["minItems"],d);const h=u(e,["minimum"]);h!=null&&c(t,["minimum"],h);const p=u(e,["nullable"]);p!=null&&c(t,["nullable"],p);const g=u(e,["properties"]);g!=null&&c(t,["properties"],g);const S=u(e,["propertyOrdering"]);S!=null&&c(t,["propertyOrdering"],S);const y=u(e,["required"]);y!=null&&c(t,["required"],y);const x=u(e,["title"]);x!=null&&c(t,["title"],x);const m=u(e,["type"]);return m!=null&&c(t,["type"],m),t}function Bd(i,e){const t={};if(u(e,["method"])!==void 0)throw new Error("method parameter is not supported in Gemini API.");const n=u(e,["category"]);n!=null&&c(t,["category"],n);const r=u(e,["threshold"]);return r!=null&&c(t,["threshold"],r),t}function Vd(i,e){const t={};if(u(e,["response"])!==void 0)throw new Error("response parameter is not supported in Gemini API.");const n=u(e,["description"]);n!=null&&c(t,["description"],n);const r=u(e,["name"]);r!=null&&c(t,["name"],r);const s=u(e,["parameters"]);return s!=null&&c(t,["parameters"],s),t}function zd(){return{}}function Hd(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["dynamicThreshold"]);return r!=null&&c(t,["dynamicThreshold"],r),t}function kd(i,e){const t={},n=u(e,["dynamicRetrievalConfig"]);return n!=null&&c(t,["dynamicRetrievalConfig"],Hd(i,n)),t}function Gd(i,e){const t={},n=u(e,["functionDeclarations"]);if(n!=null&&(Array.isArray(n)?c(t,["functionDeclarations"],n.map(a=>Vd(i,a))):c(t,["functionDeclarations"],n)),u(e,["retrieval"])!==void 0)throw new Error("retrieval parameter is not supported in Gemini API.");u(e,["googleSearch"])!=null&&c(t,["googleSearch"],zd());const s=u(e,["googleSearchRetrieval"]);s!=null&&c(t,["googleSearchRetrieval"],kd(i,s));const o=u(e,["codeExecution"]);return o!=null&&c(t,["codeExecution"],o),t}function Wd(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["allowedFunctionNames"]);return r!=null&&c(t,["allowedFunctionNames"],r),t}function qd(i,e){const t={},n=u(e,["functionCallingConfig"]);return n!=null&&c(t,["functionCallingConfig"],Wd(i,n)),t}function Xd(i,e){const t={},n=u(e,["voiceName"]);return n!=null&&c(t,["voiceName"],n),t}function $d(i,e){const t={},n=u(e,["prebuiltVoiceConfig"]);return n!=null&&c(t,["prebuiltVoiceConfig"],Xd(i,n)),t}function Yd(i,e){const t={},n=u(e,["voiceConfig"]);n!=null&&c(t,["voiceConfig"],$d(i,n));const r=u(e,["languageCode"]);return r!=null&&c(t,["languageCode"],r),t}function Kd(i,e){const t={},n=u(e,["includeThoughts"]);n!=null&&c(t,["includeThoughts"],n);const r=u(e,["thinkingBudget"]);return r!=null&&c(t,["thinkingBudget"],r),t}function Zd(i,e,t){const n={},r=u(e,["systemInstruction"]);t!==void 0&&r!=null&&c(t,["systemInstruction"],xs(i,zt(i,r)));const s=u(e,["temperature"]);s!=null&&c(n,["temperature"],s);const o=u(e,["topP"]);o!=null&&c(n,["topP"],o);const a=u(e,["topK"]);a!=null&&c(n,["topK"],a);const l=u(e,["candidateCount"]);l!=null&&c(n,["candidateCount"],l);const f=u(e,["maxOutputTokens"]);f!=null&&c(n,["maxOutputTokens"],f);const d=u(e,["stopSequences"]);d!=null&&c(n,["stopSequences"],d);const h=u(e,["responseLogprobs"]);h!=null&&c(n,["responseLogprobs"],h);const p=u(e,["logprobs"]);p!=null&&c(n,["logprobs"],p);const g=u(e,["presencePenalty"]);g!=null&&c(n,["presencePenalty"],g);const S=u(e,["frequencyPenalty"]);S!=null&&c(n,["frequencyPenalty"],S);const y=u(e,["seed"]);y!=null&&c(n,["seed"],y);const x=u(e,["responseMimeType"]);x!=null&&c(n,["responseMimeType"],x);const m=u(e,["responseSchema"]);if(m!=null&&c(n,["responseSchema"],Od(i,Ic(i,m))),u(e,["routingConfig"])!==void 0)throw new Error("routingConfig parameter is not supported in Gemini API.");if(u(e,["modelSelectionConfig"])!==void 0)throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");const P=u(e,["safetySettings"]);t!==void 0&&P!=null&&(Array.isArray(P)?c(t,["safetySettings"],P.map(M=>Bd(i,M))):c(t,["safetySettings"],P));const w=u(e,["tools"]);t!==void 0&&w!=null&&(Array.isArray(w)?c(t,["tools"],en(i,en(i,w).map(M=>Gd(i,vs(i,M))))):c(t,["tools"],en(i,w)));const T=u(e,["toolConfig"]);if(t!==void 0&&T!=null&&c(t,["toolConfig"],qd(i,T)),u(e,["labels"])!==void 0)throw new Error("labels parameter is not supported in Gemini API.");const V=u(e,["cachedContent"]);t!==void 0&&V!=null&&c(t,["cachedContent"],Xn(i,V));const F=u(e,["responseModalities"]);F!=null&&c(n,["responseModalities"],F);const N=u(e,["mediaResolution"]);N!=null&&c(n,["mediaResolution"],N);const z=u(e,["speechConfig"]);if(z!=null&&c(n,["speechConfig"],Yd(i,Dc(i,z))),u(e,["audioTimestamp"])!==void 0)throw new Error("audioTimestamp parameter is not supported in Gemini API.");const R=u(e,["thinkingConfig"]);return R!=null&&c(n,["thinkingConfig"],Kd(i,R)),n}function dl(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&(Array.isArray(r)?c(t,["contents"],vt(i,vt(i,r).map(o=>xs(i,o)))):c(t,["contents"],vt(i,r)));const s=u(e,["config"]);return s!=null&&c(t,["generationConfig"],Zd(i,s,t)),t}function Jd(i,e,t){const n={},r=u(e,["taskType"]);t!==void 0&&r!=null&&c(t,["requests[]","taskType"],r);const s=u(e,["title"]);t!==void 0&&s!=null&&c(t,["requests[]","title"],s);const o=u(e,["outputDimensionality"]);if(t!==void 0&&o!=null&&c(t,["requests[]","outputDimensionality"],o),u(e,["mimeType"])!==void 0)throw new Error("mimeType parameter is not supported in Gemini API.");if(u(e,["autoTruncate"])!==void 0)throw new Error("autoTruncate parameter is not supported in Gemini API.");return n}function Qd(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&c(t,["requests[]","content"],Pc(i,r));const s=u(e,["config"]);s!=null&&c(t,["config"],Jd(i,s,t));const o=u(e,["model"]);return o!==void 0&&c(t,["requests[]","model"],bt(i,o)),t}function jd(i,e,t){const n={};if(u(e,["outputGcsUri"])!==void 0)throw new Error("outputGcsUri parameter is not supported in Gemini API.");if(u(e,["negativePrompt"])!==void 0)throw new Error("negativePrompt parameter is not supported in Gemini API.");const r=u(e,["numberOfImages"]);t!==void 0&&r!=null&&c(t,["parameters","sampleCount"],r);const s=u(e,["aspectRatio"]);t!==void 0&&s!=null&&c(t,["parameters","aspectRatio"],s);const o=u(e,["guidanceScale"]);if(t!==void 0&&o!=null&&c(t,["parameters","guidanceScale"],o),u(e,["seed"])!==void 0)throw new Error("seed parameter is not supported in Gemini API.");const a=u(e,["safetyFilterLevel"]);t!==void 0&&a!=null&&c(t,["parameters","safetySetting"],a);const l=u(e,["personGeneration"]);t!==void 0&&l!=null&&c(t,["parameters","personGeneration"],l);const f=u(e,["includeSafetyAttributes"]);t!==void 0&&f!=null&&c(t,["parameters","includeSafetyAttributes"],f);const d=u(e,["includeRaiReason"]);t!==void 0&&d!=null&&c(t,["parameters","includeRaiReason"],d);const h=u(e,["language"]);t!==void 0&&h!=null&&c(t,["parameters","language"],h);const p=u(e,["outputMimeType"]);t!==void 0&&p!=null&&c(t,["parameters","outputOptions","mimeType"],p);const g=u(e,["outputCompressionQuality"]);if(t!==void 0&&g!=null&&c(t,["parameters","outputOptions","compressionQuality"],g),u(e,["addWatermark"])!==void 0)throw new Error("addWatermark parameter is not supported in Gemini API.");if(u(e,["enhancePrompt"])!==void 0)throw new Error("enhancePrompt parameter is not supported in Gemini API.");return n}function eh(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["prompt"]);r!=null&&c(t,["instances[0]","prompt"],r);const s=u(e,["config"]);return s!=null&&c(t,["config"],jd(i,s,t)),t}function th(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","name"],bt(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function nh(i,e){const t={};if(u(e,["systemInstruction"])!==void 0)throw new Error("systemInstruction parameter is not supported in Gemini API.");if(u(e,["tools"])!==void 0)throw new Error("tools parameter is not supported in Gemini API.");if(u(e,["generationConfig"])!==void 0)throw new Error("generationConfig parameter is not supported in Gemini API.");return t}function ih(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&(Array.isArray(r)?c(t,["contents"],vt(i,vt(i,r).map(o=>xs(i,o)))):c(t,["contents"],vt(i,r)));const s=u(e,["config"]);return s!=null&&c(t,["config"],nh(i,s)),t}function rh(i,e){const t={};if(u(e,["gcsUri"])!==void 0)throw new Error("gcsUri parameter is not supported in Gemini API.");const n=u(e,["imageBytes"]);n!=null&&c(t,["bytesBase64Encoded"],$n(i,n));const r=u(e,["mimeType"]);return r!=null&&c(t,["mimeType"],r),t}function sh(i,e,t){const n={},r=u(e,["numberOfVideos"]);if(t!==void 0&&r!=null&&c(t,["parameters","sampleCount"],r),u(e,["outputGcsUri"])!==void 0)throw new Error("outputGcsUri parameter is not supported in Gemini API.");if(u(e,["fps"])!==void 0)throw new Error("fps parameter is not supported in Gemini API.");const s=u(e,["durationSeconds"]);if(t!==void 0&&s!=null&&c(t,["parameters","durationSeconds"],s),u(e,["seed"])!==void 0)throw new Error("seed parameter is not supported in Gemini API.");const o=u(e,["aspectRatio"]);if(t!==void 0&&o!=null&&c(t,["parameters","aspectRatio"],o),u(e,["resolution"])!==void 0)throw new Error("resolution parameter is not supported in Gemini API.");const a=u(e,["personGeneration"]);if(t!==void 0&&a!=null&&c(t,["parameters","personGeneration"],a),u(e,["pubsubTopic"])!==void 0)throw new Error("pubsubTopic parameter is not supported in Gemini API.");const l=u(e,["negativePrompt"]);if(t!==void 0&&l!=null&&c(t,["parameters","negativePrompt"],l),u(e,["enhancePrompt"])!==void 0)throw new Error("enhancePrompt parameter is not supported in Gemini API.");return n}function oh(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["prompt"]);r!=null&&c(t,["instances[0]","prompt"],r);const s=u(e,["image"]);s!=null&&c(t,["instances[0]","image"],rh(i,s));const o=u(e,["config"]);return o!=null&&c(t,["config"],sh(i,o,t)),t}function ah(i,e){const t={},n=u(e,["videoMetadata"]);n!=null&&c(t,["videoMetadata"],n);const r=u(e,["thought"]);r!=null&&c(t,["thought"],r);const s=u(e,["codeExecutionResult"]);s!=null&&c(t,["codeExecutionResult"],s);const o=u(e,["executableCode"]);o!=null&&c(t,["executableCode"],o);const a=u(e,["fileData"]);a!=null&&c(t,["fileData"],a);const l=u(e,["functionCall"]);l!=null&&c(t,["functionCall"],l);const f=u(e,["functionResponse"]);f!=null&&c(t,["functionResponse"],f);const d=u(e,["inlineData"]);d!=null&&c(t,["inlineData"],d);const h=u(e,["text"]);return h!=null&&c(t,["text"],h),t}function Bi(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>ah(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Fc(i,e){const t={},n=u(e,["example"]);n!=null&&c(t,["example"],n);const r=u(e,["pattern"]);r!=null&&c(t,["pattern"],r);const s=u(e,["default"]);s!=null&&c(t,["default"],s);const o=u(e,["maxLength"]);o!=null&&c(t,["maxLength"],o);const a=u(e,["minLength"]);a!=null&&c(t,["minLength"],a);const l=u(e,["minProperties"]);l!=null&&c(t,["minProperties"],l);const f=u(e,["maxProperties"]);f!=null&&c(t,["maxProperties"],f);const d=u(e,["anyOf"]);d!=null&&c(t,["anyOf"],d);const h=u(e,["description"]);h!=null&&c(t,["description"],h);const p=u(e,["enum"]);p!=null&&c(t,["enum"],p);const g=u(e,["format"]);g!=null&&c(t,["format"],g);const S=u(e,["items"]);S!=null&&c(t,["items"],S);const y=u(e,["maxItems"]);y!=null&&c(t,["maxItems"],y);const x=u(e,["maximum"]);x!=null&&c(t,["maximum"],x);const m=u(e,["minItems"]);m!=null&&c(t,["minItems"],m);const P=u(e,["minimum"]);P!=null&&c(t,["minimum"],P);const w=u(e,["nullable"]);w!=null&&c(t,["nullable"],w);const T=u(e,["properties"]);T!=null&&c(t,["properties"],T);const V=u(e,["propertyOrdering"]);V!=null&&c(t,["propertyOrdering"],V);const F=u(e,["required"]);F!=null&&c(t,["required"],F);const N=u(e,["title"]);N!=null&&c(t,["title"],N);const z=u(e,["type"]);return z!=null&&c(t,["type"],z),t}function lh(i,e){const t={},n=u(e,["featureSelectionPreference"]);return n!=null&&c(t,["featureSelectionPreference"],n),t}function ch(i,e){const t={},n=u(e,["method"]);n!=null&&c(t,["method"],n);const r=u(e,["category"]);r!=null&&c(t,["category"],r);const s=u(e,["threshold"]);return s!=null&&c(t,["threshold"],s),t}function uh(i,e){const t={},n=u(e,["response"]);n!=null&&c(t,["response"],Fc(i,n));const r=u(e,["description"]);r!=null&&c(t,["description"],r);const s=u(e,["name"]);s!=null&&c(t,["name"],s);const o=u(e,["parameters"]);return o!=null&&c(t,["parameters"],o),t}function fh(){return{}}function dh(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["dynamicThreshold"]);return r!=null&&c(t,["dynamicThreshold"],r),t}function hh(i,e){const t={},n=u(e,["dynamicRetrievalConfig"]);return n!=null&&c(t,["dynamicRetrievalConfig"],dh(i,n)),t}function Oc(i,e){const t={},n=u(e,["functionDeclarations"]);n!=null&&(Array.isArray(n)?c(t,["functionDeclarations"],n.map(l=>uh(i,l))):c(t,["functionDeclarations"],n));const r=u(e,["retrieval"]);r!=null&&c(t,["retrieval"],r),u(e,["googleSearch"])!=null&&c(t,["googleSearch"],fh());const o=u(e,["googleSearchRetrieval"]);o!=null&&c(t,["googleSearchRetrieval"],hh(i,o));const a=u(e,["codeExecution"]);return a!=null&&c(t,["codeExecution"],a),t}function ph(i,e){const t={},n=u(e,["mode"]);n!=null&&c(t,["mode"],n);const r=u(e,["allowedFunctionNames"]);return r!=null&&c(t,["allowedFunctionNames"],r),t}function mh(i,e){const t={},n=u(e,["functionCallingConfig"]);return n!=null&&c(t,["functionCallingConfig"],ph(i,n)),t}function gh(i,e){const t={},n=u(e,["voiceName"]);return n!=null&&c(t,["voiceName"],n),t}function _h(i,e){const t={},n=u(e,["prebuiltVoiceConfig"]);return n!=null&&c(t,["prebuiltVoiceConfig"],gh(i,n)),t}function vh(i,e){const t={},n=u(e,["voiceConfig"]);n!=null&&c(t,["voiceConfig"],_h(i,n));const r=u(e,["languageCode"]);return r!=null&&c(t,["languageCode"],r),t}function xh(i,e){const t={},n=u(e,["includeThoughts"]);n!=null&&c(t,["includeThoughts"],n);const r=u(e,["thinkingBudget"]);return r!=null&&c(t,["thinkingBudget"],r),t}function Sh(i,e,t){const n={},r=u(e,["systemInstruction"]);t!==void 0&&r!=null&&c(t,["systemInstruction"],Bi(i,zt(i,r)));const s=u(e,["temperature"]);s!=null&&c(n,["temperature"],s);const o=u(e,["topP"]);o!=null&&c(n,["topP"],o);const a=u(e,["topK"]);a!=null&&c(n,["topK"],a);const l=u(e,["candidateCount"]);l!=null&&c(n,["candidateCount"],l);const f=u(e,["maxOutputTokens"]);f!=null&&c(n,["maxOutputTokens"],f);const d=u(e,["stopSequences"]);d!=null&&c(n,["stopSequences"],d);const h=u(e,["responseLogprobs"]);h!=null&&c(n,["responseLogprobs"],h);const p=u(e,["logprobs"]);p!=null&&c(n,["logprobs"],p);const g=u(e,["presencePenalty"]);g!=null&&c(n,["presencePenalty"],g);const S=u(e,["frequencyPenalty"]);S!=null&&c(n,["frequencyPenalty"],S);const y=u(e,["seed"]);y!=null&&c(n,["seed"],y);const x=u(e,["responseMimeType"]);x!=null&&c(n,["responseMimeType"],x);const m=u(e,["responseSchema"]);m!=null&&c(n,["responseSchema"],Fc(i,Ic(i,m)));const P=u(e,["routingConfig"]);P!=null&&c(n,["routingConfig"],P);const w=u(e,["modelSelectionConfig"]);w!=null&&c(n,["modelConfig"],lh(i,w));const T=u(e,["safetySettings"]);t!==void 0&&T!=null&&(Array.isArray(T)?c(t,["safetySettings"],T.map(ie=>ch(i,ie))):c(t,["safetySettings"],T));const V=u(e,["tools"]);t!==void 0&&V!=null&&(Array.isArray(V)?c(t,["tools"],en(i,en(i,V).map(ie=>Oc(i,vs(i,ie))))):c(t,["tools"],en(i,V)));const F=u(e,["toolConfig"]);t!==void 0&&F!=null&&c(t,["toolConfig"],mh(i,F));const N=u(e,["labels"]);t!==void 0&&N!=null&&c(t,["labels"],N);const z=u(e,["cachedContent"]);t!==void 0&&z!=null&&c(t,["cachedContent"],Xn(i,z));const R=u(e,["responseModalities"]);R!=null&&c(n,["responseModalities"],R);const M=u(e,["mediaResolution"]);M!=null&&c(n,["mediaResolution"],M);const O=u(e,["speechConfig"]);O!=null&&c(n,["speechConfig"],vh(i,Dc(i,O)));const Z=u(e,["audioTimestamp"]);Z!=null&&c(n,["audioTimestamp"],Z);const Y=u(e,["thinkingConfig"]);return Y!=null&&c(n,["thinkingConfig"],xh(i,Y)),n}function hl(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&(Array.isArray(r)?c(t,["contents"],vt(i,vt(i,r).map(o=>Bi(i,o)))):c(t,["contents"],vt(i,r)));const s=u(e,["config"]);return s!=null&&c(t,["generationConfig"],Sh(i,s,t)),t}function Eh(i,e,t){const n={},r=u(e,["taskType"]);t!==void 0&&r!=null&&c(t,["instances[]","task_type"],r);const s=u(e,["title"]);t!==void 0&&s!=null&&c(t,["instances[]","title"],s);const o=u(e,["outputDimensionality"]);t!==void 0&&o!=null&&c(t,["parameters","outputDimensionality"],o);const a=u(e,["mimeType"]);t!==void 0&&a!=null&&c(t,["instances[]","mimeType"],a);const l=u(e,["autoTruncate"]);return t!==void 0&&l!=null&&c(t,["parameters","autoTruncate"],l),n}function yh(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&c(t,["instances[]","content"],Pc(i,r));const s=u(e,["config"]);return s!=null&&c(t,["config"],Eh(i,s,t)),t}function Mh(i,e,t){const n={},r=u(e,["outputGcsUri"]);t!==void 0&&r!=null&&c(t,["parameters","storageUri"],r);const s=u(e,["negativePrompt"]);t!==void 0&&s!=null&&c(t,["parameters","negativePrompt"],s);const o=u(e,["numberOfImages"]);t!==void 0&&o!=null&&c(t,["parameters","sampleCount"],o);const a=u(e,["aspectRatio"]);t!==void 0&&a!=null&&c(t,["parameters","aspectRatio"],a);const l=u(e,["guidanceScale"]);t!==void 0&&l!=null&&c(t,["parameters","guidanceScale"],l);const f=u(e,["seed"]);t!==void 0&&f!=null&&c(t,["parameters","seed"],f);const d=u(e,["safetyFilterLevel"]);t!==void 0&&d!=null&&c(t,["parameters","safetySetting"],d);const h=u(e,["personGeneration"]);t!==void 0&&h!=null&&c(t,["parameters","personGeneration"],h);const p=u(e,["includeSafetyAttributes"]);t!==void 0&&p!=null&&c(t,["parameters","includeSafetyAttributes"],p);const g=u(e,["includeRaiReason"]);t!==void 0&&g!=null&&c(t,["parameters","includeRaiReason"],g);const S=u(e,["language"]);t!==void 0&&S!=null&&c(t,["parameters","language"],S);const y=u(e,["outputMimeType"]);t!==void 0&&y!=null&&c(t,["parameters","outputOptions","mimeType"],y);const x=u(e,["outputCompressionQuality"]);t!==void 0&&x!=null&&c(t,["parameters","outputOptions","compressionQuality"],x);const m=u(e,["addWatermark"]);t!==void 0&&m!=null&&c(t,["parameters","addWatermark"],m);const P=u(e,["enhancePrompt"]);return t!==void 0&&P!=null&&c(t,["parameters","enhancePrompt"],P),n}function Th(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["prompt"]);r!=null&&c(t,["instances[0]","prompt"],r);const s=u(e,["config"]);return s!=null&&c(t,["config"],Mh(i,s,t)),t}function Ah(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","name"],bt(i,n));const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Ch(i,e,t){const n={},r=u(e,["systemInstruction"]);t!==void 0&&r!=null&&c(t,["systemInstruction"],Bi(i,zt(i,r)));const s=u(e,["tools"]);t!==void 0&&s!=null&&(Array.isArray(s)?c(t,["tools"],s.map(a=>Oc(i,a))):c(t,["tools"],s));const o=u(e,["generationConfig"]);return t!==void 0&&o!=null&&c(t,["generationConfig"],o),n}function wh(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&(Array.isArray(r)?c(t,["contents"],vt(i,vt(i,r).map(o=>Bi(i,o)))):c(t,["contents"],vt(i,r)));const s=u(e,["config"]);return s!=null&&c(t,["config"],Ch(i,s,t)),t}function Rh(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["contents"]);r!=null&&(Array.isArray(r)?c(t,["contents"],vt(i,vt(i,r).map(o=>Bi(i,o)))):c(t,["contents"],vt(i,r)));const s=u(e,["config"]);return s!=null&&c(t,["config"],s),t}function bh(i,e){const t={},n=u(e,["gcsUri"]);n!=null&&c(t,["gcsUri"],n);const r=u(e,["imageBytes"]);r!=null&&c(t,["bytesBase64Encoded"],$n(i,r));const s=u(e,["mimeType"]);return s!=null&&c(t,["mimeType"],s),t}function Ph(i,e,t){const n={},r=u(e,["numberOfVideos"]);t!==void 0&&r!=null&&c(t,["parameters","sampleCount"],r);const s=u(e,["outputGcsUri"]);t!==void 0&&s!=null&&c(t,["parameters","storageUri"],s);const o=u(e,["fps"]);t!==void 0&&o!=null&&c(t,["parameters","fps"],o);const a=u(e,["durationSeconds"]);t!==void 0&&a!=null&&c(t,["parameters","durationSeconds"],a);const l=u(e,["seed"]);t!==void 0&&l!=null&&c(t,["parameters","seed"],l);const f=u(e,["aspectRatio"]);t!==void 0&&f!=null&&c(t,["parameters","aspectRatio"],f);const d=u(e,["resolution"]);t!==void 0&&d!=null&&c(t,["parameters","resolution"],d);const h=u(e,["personGeneration"]);t!==void 0&&h!=null&&c(t,["parameters","personGeneration"],h);const p=u(e,["pubsubTopic"]);t!==void 0&&p!=null&&c(t,["parameters","pubsubTopic"],p);const g=u(e,["negativePrompt"]);t!==void 0&&g!=null&&c(t,["parameters","negativePrompt"],g);const S=u(e,["enhancePrompt"]);return t!==void 0&&S!=null&&c(t,["parameters","enhancePrompt"],S),n}function Ih(i,e){const t={},n=u(e,["model"]);n!=null&&c(t,["_url","model"],bt(i,n));const r=u(e,["prompt"]);r!=null&&c(t,["instances[0]","prompt"],r);const s=u(e,["image"]);s!=null&&c(t,["instances[0]","image"],bh(i,s));const o=u(e,["config"]);return o!=null&&c(t,["config"],Ph(i,o,t)),t}function Dh(i,e){const t={},n=u(e,["thought"]);n!=null&&c(t,["thought"],n);const r=u(e,["codeExecutionResult"]);r!=null&&c(t,["codeExecutionResult"],r);const s=u(e,["executableCode"]);s!=null&&c(t,["executableCode"],s);const o=u(e,["fileData"]);o!=null&&c(t,["fileData"],o);const a=u(e,["functionCall"]);a!=null&&c(t,["functionCall"],a);const l=u(e,["functionResponse"]);l!=null&&c(t,["functionResponse"],l);const f=u(e,["inlineData"]);f!=null&&c(t,["inlineData"],f);const d=u(e,["text"]);return d!=null&&c(t,["text"],d),t}function Uh(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Dh(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Lh(i,e){const t={},n=u(e,["citationSources"]);return n!=null&&c(t,["citations"],n),t}function Nh(i,e){const t={},n=u(e,["content"]);n!=null&&c(t,["content"],Uh(i,n));const r=u(e,["citationMetadata"]);r!=null&&c(t,["citationMetadata"],Lh(i,r));const s=u(e,["tokenCount"]);s!=null&&c(t,["tokenCount"],s);const o=u(e,["finishReason"]);o!=null&&c(t,["finishReason"],o);const a=u(e,["avgLogprobs"]);a!=null&&c(t,["avgLogprobs"],a);const l=u(e,["groundingMetadata"]);l!=null&&c(t,["groundingMetadata"],l);const f=u(e,["index"]);f!=null&&c(t,["index"],f);const d=u(e,["logprobsResult"]);d!=null&&c(t,["logprobsResult"],d);const h=u(e,["safetyRatings"]);return h!=null&&c(t,["safetyRatings"],h),t}function pl(i,e){const t={},n=u(e,["candidates"]);n!=null&&(Array.isArray(n)?c(t,["candidates"],n.map(a=>Nh(i,a))):c(t,["candidates"],n));const r=u(e,["modelVersion"]);r!=null&&c(t,["modelVersion"],r);const s=u(e,["promptFeedback"]);s!=null&&c(t,["promptFeedback"],s);const o=u(e,["usageMetadata"]);return o!=null&&c(t,["usageMetadata"],o),t}function Fh(i,e){const t={},n=u(e,["values"]);return n!=null&&c(t,["values"],n),t}function Oh(){return{}}function Bh(i,e){const t={},n=u(e,["embeddings"]);return n!=null&&(Array.isArray(n)?c(t,["embeddings"],n.map(s=>Fh(i,s))):c(t,["embeddings"],n)),u(e,["metadata"])!=null&&c(t,["metadata"],Oh()),t}function Vh(i,e){const t={},n=u(e,["bytesBase64Encoded"]);n!=null&&c(t,["imageBytes"],$n(i,n));const r=u(e,["mimeType"]);return r!=null&&c(t,["mimeType"],r),t}function Bc(i,e){const t={},n=u(e,["safetyAttributes","categories"]);n!=null&&c(t,["categories"],n);const r=u(e,["safetyAttributes","scores"]);r!=null&&c(t,["scores"],r);const s=u(e,["contentType"]);return s!=null&&c(t,["contentType"],s),t}function zh(i,e){const t={},n=u(e,["_self"]);n!=null&&c(t,["image"],Vh(i,n));const r=u(e,["raiFilteredReason"]);r!=null&&c(t,["raiFilteredReason"],r);const s=u(e,["_self"]);return s!=null&&c(t,["safetyAttributes"],Bc(i,s)),t}function Hh(i,e){const t={},n=u(e,["predictions"]);n!=null&&(Array.isArray(n)?c(t,["generatedImages"],n.map(s=>zh(i,s))):c(t,["generatedImages"],n));const r=u(e,["positivePromptSafetyAttributes"]);return r!=null&&c(t,["positivePromptSafetyAttributes"],Bc(i,r)),t}function kh(i,e){const t={},n=u(e,["baseModel"]);n!=null&&c(t,["baseModel"],n);const r=u(e,["createTime"]);r!=null&&c(t,["createTime"],r);const s=u(e,["updateTime"]);return s!=null&&c(t,["updateTime"],s),t}function Gh(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["displayName"]);r!=null&&c(t,["displayName"],r);const s=u(e,["description"]);s!=null&&c(t,["description"],s);const o=u(e,["version"]);o!=null&&c(t,["version"],o);const a=u(e,["_self"]);a!=null&&c(t,["tunedModelInfo"],kh(i,a));const l=u(e,["inputTokenLimit"]);l!=null&&c(t,["inputTokenLimit"],l);const f=u(e,["outputTokenLimit"]);f!=null&&c(t,["outputTokenLimit"],f);const d=u(e,["supportedGenerationMethods"]);return d!=null&&c(t,["supportedActions"],d),t}function Wh(i,e){const t={},n=u(e,["totalTokens"]);n!=null&&c(t,["totalTokens"],n);const r=u(e,["cachedContentTokenCount"]);return r!=null&&c(t,["cachedContentTokenCount"],r),t}function qh(i,e){const t={},n=u(e,["video","uri"]);n!=null&&c(t,["uri"],n);const r=u(e,["video","encodedVideo"]);r!=null&&c(t,["videoBytes"],$n(i,r));const s=u(e,["encoding"]);return s!=null&&c(t,["mimeType"],s),t}function Xh(i,e){const t={},n=u(e,["_self"]);return n!=null&&c(t,["video"],qh(i,n)),t}function $h(i,e){const t={},n=u(e,["generatedSamples"]);n!=null&&(Array.isArray(n)?c(t,["generatedVideos"],n.map(o=>Xh(i,o))):c(t,["generatedVideos"],n));const r=u(e,["raiMediaFilteredCount"]);r!=null&&c(t,["raiMediaFilteredCount"],r);const s=u(e,["raiMediaFilteredReasons"]);return s!=null&&c(t,["raiMediaFilteredReasons"],s),t}function Yh(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["metadata"]);r!=null&&c(t,["metadata"],r);const s=u(e,["done"]);s!=null&&c(t,["done"],s);const o=u(e,["error"]);o!=null&&c(t,["error"],o);const a=u(e,["response","generateVideoResponse"]);return a!=null&&c(t,["response"],$h(i,a)),t}function Kh(i,e){const t={},n=u(e,["videoMetadata"]);n!=null&&c(t,["videoMetadata"],n);const r=u(e,["thought"]);r!=null&&c(t,["thought"],r);const s=u(e,["codeExecutionResult"]);s!=null&&c(t,["codeExecutionResult"],s);const o=u(e,["executableCode"]);o!=null&&c(t,["executableCode"],o);const a=u(e,["fileData"]);a!=null&&c(t,["fileData"],a);const l=u(e,["functionCall"]);l!=null&&c(t,["functionCall"],l);const f=u(e,["functionResponse"]);f!=null&&c(t,["functionResponse"],f);const d=u(e,["inlineData"]);d!=null&&c(t,["inlineData"],d);const h=u(e,["text"]);return h!=null&&c(t,["text"],h),t}function Zh(i,e){const t={},n=u(e,["parts"]);n!=null&&(Array.isArray(n)?c(t,["parts"],n.map(s=>Kh(i,s))):c(t,["parts"],n));const r=u(e,["role"]);return r!=null&&c(t,["role"],r),t}function Jh(i,e){const t={},n=u(e,["citations"]);return n!=null&&c(t,["citations"],n),t}function Qh(i,e){const t={},n=u(e,["content"]);n!=null&&c(t,["content"],Zh(i,n));const r=u(e,["citationMetadata"]);r!=null&&c(t,["citationMetadata"],Jh(i,r));const s=u(e,["finishMessage"]);s!=null&&c(t,["finishMessage"],s);const o=u(e,["finishReason"]);o!=null&&c(t,["finishReason"],o);const a=u(e,["avgLogprobs"]);a!=null&&c(t,["avgLogprobs"],a);const l=u(e,["groundingMetadata"]);l!=null&&c(t,["groundingMetadata"],l);const f=u(e,["index"]);f!=null&&c(t,["index"],f);const d=u(e,["logprobsResult"]);d!=null&&c(t,["logprobsResult"],d);const h=u(e,["safetyRatings"]);return h!=null&&c(t,["safetyRatings"],h),t}function ml(i,e){const t={},n=u(e,["candidates"]);n!=null&&(Array.isArray(n)?c(t,["candidates"],n.map(f=>Qh(i,f))):c(t,["candidates"],n));const r=u(e,["createTime"]);r!=null&&c(t,["createTime"],r);const s=u(e,["responseId"]);s!=null&&c(t,["responseId"],s);const o=u(e,["modelVersion"]);o!=null&&c(t,["modelVersion"],o);const a=u(e,["promptFeedback"]);a!=null&&c(t,["promptFeedback"],a);const l=u(e,["usageMetadata"]);return l!=null&&c(t,["usageMetadata"],l),t}function jh(i,e){const t={},n=u(e,["truncated"]);n!=null&&c(t,["truncated"],n);const r=u(e,["token_count"]);return r!=null&&c(t,["tokenCount"],r),t}function ep(i,e){const t={},n=u(e,["values"]);n!=null&&c(t,["values"],n);const r=u(e,["statistics"]);return r!=null&&c(t,["statistics"],jh(i,r)),t}function tp(i,e){const t={},n=u(e,["billableCharacterCount"]);return n!=null&&c(t,["billableCharacterCount"],n),t}function np(i,e){const t={},n=u(e,["predictions[]","embeddings"]);n!=null&&(Array.isArray(n)?c(t,["embeddings"],n.map(s=>ep(i,s))):c(t,["embeddings"],n));const r=u(e,["metadata"]);return r!=null&&c(t,["metadata"],tp(i,r)),t}function ip(i,e){const t={},n=u(e,["gcsUri"]);n!=null&&c(t,["gcsUri"],n);const r=u(e,["bytesBase64Encoded"]);r!=null&&c(t,["imageBytes"],$n(i,r));const s=u(e,["mimeType"]);return s!=null&&c(t,["mimeType"],s),t}function Vc(i,e){const t={},n=u(e,["safetyAttributes","categories"]);n!=null&&c(t,["categories"],n);const r=u(e,["safetyAttributes","scores"]);r!=null&&c(t,["scores"],r);const s=u(e,["contentType"]);return s!=null&&c(t,["contentType"],s),t}function rp(i,e){const t={},n=u(e,["_self"]);n!=null&&c(t,["image"],ip(i,n));const r=u(e,["raiFilteredReason"]);r!=null&&c(t,["raiFilteredReason"],r);const s=u(e,["_self"]);s!=null&&c(t,["safetyAttributes"],Vc(i,s));const o=u(e,["prompt"]);return o!=null&&c(t,["enhancedPrompt"],o),t}function sp(i,e){const t={},n=u(e,["predictions"]);n!=null&&(Array.isArray(n)?c(t,["generatedImages"],n.map(s=>rp(i,s))):c(t,["generatedImages"],n));const r=u(e,["positivePromptSafetyAttributes"]);return r!=null&&c(t,["positivePromptSafetyAttributes"],Vc(i,r)),t}function op(i,e){const t={},n=u(e,["endpoint"]);n!=null&&c(t,["name"],n);const r=u(e,["deployedModelId"]);return r!=null&&c(t,["deployedModelId"],r),t}function ap(i,e){const t={},n=u(e,["labels","google-vertex-llm-tuning-base-model-id"]);n!=null&&c(t,["baseModel"],n);const r=u(e,["createTime"]);r!=null&&c(t,["createTime"],r);const s=u(e,["updateTime"]);return s!=null&&c(t,["updateTime"],s),t}function lp(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["displayName"]);r!=null&&c(t,["displayName"],r);const s=u(e,["description"]);s!=null&&c(t,["description"],s);const o=u(e,["versionId"]);o!=null&&c(t,["version"],o);const a=u(e,["deployedModels"]);a!=null&&(Array.isArray(a)?c(t,["endpoints"],a.map(d=>op(i,d))):c(t,["endpoints"],a));const l=u(e,["labels"]);l!=null&&c(t,["labels"],l);const f=u(e,["_self"]);return f!=null&&c(t,["tunedModelInfo"],ap(i,f)),t}function cp(i,e){const t={},n=u(e,["totalTokens"]);return n!=null&&c(t,["totalTokens"],n),t}function up(i,e){const t={},n=u(e,["tokensInfo"]);return n!=null&&c(t,["tokensInfo"],n),t}function fp(i,e){const t={},n=u(e,["gcsUri"]);n!=null&&c(t,["uri"],n);const r=u(e,["bytesBase64Encoded"]);r!=null&&c(t,["videoBytes"],$n(i,r));const s=u(e,["mimeType"]);return s!=null&&c(t,["mimeType"],s),t}function dp(i,e){const t={},n=u(e,["_self"]);return n!=null&&c(t,["video"],fp(i,n)),t}function hp(i,e){const t={},n=u(e,["videos"]);n!=null&&(Array.isArray(n)?c(t,["generatedVideos"],n.map(o=>dp(i,o))):c(t,["generatedVideos"],n));const r=u(e,["raiMediaFilteredCount"]);r!=null&&c(t,["raiMediaFilteredCount"],r);const s=u(e,["raiMediaFilteredReasons"]);return s!=null&&c(t,["raiMediaFilteredReasons"],s),t}function pp(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["metadata"]);r!=null&&c(t,["metadata"],r);const s=u(e,["done"]);s!=null&&c(t,["done"],s);const o=u(e,["error"]);o!=null&&c(t,["error"],o);const a=u(e,["response"]);return a!=null&&c(t,["response"],hp(i,a)),t}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const mp="FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";async function gp(i,e,t){let n,r;t.data instanceof Blob?r=JSON.parse(await t.data.text()):r=JSON.parse(t.data),i.isVertexAI()?n=Nd(i,r):n=Ld(i,r),e(n)}class _p{constructor(e,t,n){this.apiClient=e,this.auth=t,this.webSocketFactory=n}async connect(e){var t,n,r,s;const o=this.apiClient.getWebsocketBaseUrl(),a=this.apiClient.getApiVersion();let l;const f=Ep(this.apiClient.getDefaultHeaders());if(this.apiClient.isVertexAI())l=`${o}/ws/google.cloud.aiplatform.${a}.LlmBidiService/BidiGenerateContent`,await this.auth.addAuthHeaders(f);else{const T=this.apiClient.getApiKey();l=`${o}/ws/google.ai.generativelanguage.${a}.GenerativeService.BidiGenerateContent?key=${T}`}let d=()=>{};const h=new Promise(T=>{d=T}),p=e.callbacks,g=function(){var T;(T=p?.onopen)===null||T===void 0||T.call(p),d({})},S=this.apiClient,y={onopen:g,onmessage:T=>{gp(S,p.onmessage,T)},onerror:(t=p?.onerror)!==null&&t!==void 0?t:function(T){},onclose:(n=p?.onclose)!==null&&n!==void 0?n:function(T){}},x=this.webSocketFactory.create(l,Sp(f),y);x.connect(),await h;let m=bt(this.apiClient,e.model);if(this.apiClient.isVertexAI()&&m.startsWith("publishers/")){const T=this.apiClient.getProject(),V=this.apiClient.getLocation();m=`projects/${T}/locations/${V}/`+m}let P={};this.apiClient.isVertexAI()&&((r=e.config)===null||r===void 0?void 0:r.responseModalities)===void 0&&(e.config===void 0?e.config={responseModalities:[nr.AUDIO]}:e.config.responseModalities=[nr.AUDIO]),!((s=e.config)===null||s===void 0)&&s.generationConfig&&console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");const w={model:m,config:e.config,callbacks:e.callbacks};return this.apiClient.isVertexAI()?P=hd(this.apiClient,w):P=dd(this.apiClient,w),delete P.config,x.send(JSON.stringify(P)),new xp(x,this.apiClient)}}const vp={turnComplete:!0};class xp{constructor(e,t){this.conn=e,this.apiClient=t}tLiveClientContent(e,t){if(t.turns!==null&&t.turns!==void 0){let n=[];try{n=vt(e,t.turns),e.isVertexAI()?n=n.map(r=>Bi(e,r)):n=n.map(r=>xs(e,r))}catch{throw new Error(`Failed to parse client content "turns", type: '${typeof t.turns}'`)}return{clientContent:{turns:n,turnComplete:t.turnComplete}}}return{clientContent:{turnComplete:t.turnComplete}}}tLiveClientRealtimeInput(e,t){let n={};if(!("media"in t)||!t.media)throw new Error(`Failed to convert realtime input "media", type: '${typeof t.media}'`);return n={realtimeInput:{mediaChunks:[t.media],activityStart:t.activityStart,activityEnd:t.activityEnd}},n}tLiveClienttToolResponse(e,t){let n=[];if(t.functionResponses==null)throw new Error("functionResponses is required.");if(Array.isArray(t.functionResponses)?n=t.functionResponses:n=[t.functionResponses],n.length===0)throw new Error("functionResponses is required.");for(const s of n){if(typeof s!="object"||s===null||!("name"in s)||!("response"in s))throw new Error(`Could not parse function response, type '${typeof s}'.`);if(!e.isVertexAI()&&!("id"in s))throw new Error(mp)}return{toolResponse:{functionResponses:n}}}sendClientContent(e){e=Object.assign(Object.assign({},vp),e);const t=this.tLiveClientContent(this.apiClient,e);this.conn.send(JSON.stringify(t))}sendRealtimeInput(e){if(e.media==null)throw new Error("Media is required.");const t=this.tLiveClientRealtimeInput(this.apiClient,e);this.conn.send(JSON.stringify(t))}sendToolResponse(e){if(e.functionResponses==null)throw new Error("Tool response parameters are required.");const t=this.tLiveClienttToolResponse(this.apiClient,e);this.conn.send(JSON.stringify(t))}close(){this.conn.close()}}function Sp(i){const e={};return i.forEach((t,n)=>{e[n]=t}),e}function Ep(i){const e=new Headers;for(const[t,n]of Object.entries(i))e.append(t,n);return e}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class yp extends _s{constructor(e){super(),this.apiClient=e,this.generateContent=async t=>await this.generateContentInternal(t),this.generateContentStream=async t=>await this.generateContentStreamInternal(t),this.generateImages=async t=>await this.generateImagesInternal(t).then(n=>{var r;let s;const o=[];if(n?.generatedImages)for(const l of n.generatedImages)l&&l?.safetyAttributes&&((r=l?.safetyAttributes)===null||r===void 0?void 0:r.contentType)==="Positive Prompt"?s=l?.safetyAttributes:o.push(l);let a;return s?a={generatedImages:o,positivePromptSafetyAttributes:s}:a={generatedImages:o},a})}async generateContentInternal(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=hl(this.apiClient,e);return s=rt("{model}:generateContent",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>{const f=ml(this.apiClient,l),d=new Mr;return Object.assign(d,f),d})}else{const a=dl(this.apiClient,e);return s=rt("{model}:generateContent",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>{const f=pl(this.apiClient,l),d=new Mr;return Object.assign(d,f),d})}}async generateContentStreamInternal(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=hl(this.apiClient,e);s=rt("{model}:streamGenerateContent?alt=sse",a._url),o=a._query,delete a.config,delete a._url,delete a._query;const l=this.apiClient;return r=l.requestStream({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}),r.then(function(f){return ls(this,arguments,function*(){var d,h,p,g;try{for(var S=!0,y=lo(f),x;x=yield Dt(y.next()),d=x.done,!d;S=!0){g=x.value,S=!1;const P=ml(l,yield Dt(g.json())),w=new Mr;Object.assign(w,P),yield yield Dt(w)}}catch(m){h={error:m}}finally{try{!S&&!d&&(p=y.return)&&(yield Dt(p.call(y)))}finally{if(h)throw h.error}}})})}else{const a=dl(this.apiClient,e);s=rt("{model}:streamGenerateContent?alt=sse",a._url),o=a._query,delete a.config,delete a._url,delete a._query;const l=this.apiClient;return r=l.requestStream({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}),r.then(function(f){return ls(this,arguments,function*(){var d,h,p,g;try{for(var S=!0,y=lo(f),x;x=yield Dt(y.next()),d=x.done,!d;S=!0){g=x.value,S=!1;const P=pl(l,yield Dt(g.json())),w=new Mr;Object.assign(w,P),yield yield Dt(w)}}catch(m){h={error:m}}finally{try{!S&&!d&&(p=y.return)&&(yield Dt(p.call(y)))}finally{if(h)throw h.error}}})})}}async embedContent(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=yh(this.apiClient,e);return s=rt("{model}:predict",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>{const f=np(this.apiClient,l),d=new il;return Object.assign(d,f),d})}else{const a=Qd(this.apiClient,e);return s=rt("{model}:batchEmbedContents",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>{const f=Bh(this.apiClient,l),d=new il;return Object.assign(d,f),d})}}async generateImagesInternal(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=Th(this.apiClient,e);return s=rt("{model}:predict",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>{const f=sp(this.apiClient,l),d=new rl;return Object.assign(d,f),d})}else{const a=eh(this.apiClient,e);return s=rt("{model}:predict",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>{const f=Hh(this.apiClient,l),d=new rl;return Object.assign(d,f),d})}}async get(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=Ah(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>lp(this.apiClient,l))}else{const a=th(this.apiClient,e);return s=rt("{name}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>Gh(this.apiClient,l))}}async countTokens(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=wh(this.apiClient,e);return s=rt("{model}:countTokens",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>{const f=cp(this.apiClient,l),d=new sl;return Object.assign(d,f),d})}else{const a=ih(this.apiClient,e);return s=rt("{model}:countTokens",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>{const f=Wh(this.apiClient,l),d=new sl;return Object.assign(d,f),d})}}async computeTokens(e){var t;let n,r="",s={};if(this.apiClient.isVertexAI()){const o=Rh(this.apiClient,e);return r=rt("{model}:computeTokens",o._url),s=o._query,delete o.config,delete o._url,delete o._query,n=this.apiClient.request({path:r,queryParams:s,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(a=>a.json()),n.then(a=>{const l=up(this.apiClient,a),f=new gf;return Object.assign(f,l),f})}else throw new Error("This method is only supported by the Vertex AI.")}async generateVideos(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=Ih(this.apiClient,e);return s=rt("{model}:predictLongRunning",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>pp(this.apiClient,l))}else{const a=oh(this.apiClient,e);return s=rt("{model}:predictLongRunning",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"POST",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>Yh(this.apiClient,l))}}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Mp(i,e){const t={},n=u(e,["operationName"]);n!=null&&c(t,["_url","operationName"],n);const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Tp(i,e){const t={},n=u(e,["operationName"]);n!=null&&c(t,["_url","operationName"],n);const r=u(e,["config"]);return r!=null&&c(t,["config"],r),t}function Ap(i,e){const t={},n=u(e,["operationName"]);n!=null&&c(t,["operationName"],n);const r=u(e,["resourceName"]);r!=null&&c(t,["_url","resourceName"],r);const s=u(e,["config"]);return s!=null&&c(t,["config"],s),t}function Cp(i,e){const t={},n=u(e,["video","uri"]);n!=null&&c(t,["uri"],n);const r=u(e,["video","encodedVideo"]);r!=null&&c(t,["videoBytes"],$n(i,r));const s=u(e,["encoding"]);return s!=null&&c(t,["mimeType"],s),t}function wp(i,e){const t={},n=u(e,["_self"]);return n!=null&&c(t,["video"],Cp(i,n)),t}function Rp(i,e){const t={},n=u(e,["generatedSamples"]);n!=null&&(Array.isArray(n)?c(t,["generatedVideos"],n.map(o=>wp(i,o))):c(t,["generatedVideos"],n));const r=u(e,["raiMediaFilteredCount"]);r!=null&&c(t,["raiMediaFilteredCount"],r);const s=u(e,["raiMediaFilteredReasons"]);return s!=null&&c(t,["raiMediaFilteredReasons"],s),t}function bp(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["metadata"]);r!=null&&c(t,["metadata"],r);const s=u(e,["done"]);s!=null&&c(t,["done"],s);const o=u(e,["error"]);o!=null&&c(t,["error"],o);const a=u(e,["response","generateVideoResponse"]);return a!=null&&c(t,["response"],Rp(i,a)),t}function Pp(i,e){const t={},n=u(e,["gcsUri"]);n!=null&&c(t,["uri"],n);const r=u(e,["bytesBase64Encoded"]);r!=null&&c(t,["videoBytes"],$n(i,r));const s=u(e,["mimeType"]);return s!=null&&c(t,["mimeType"],s),t}function Ip(i,e){const t={},n=u(e,["_self"]);return n!=null&&c(t,["video"],Pp(i,n)),t}function Dp(i,e){const t={},n=u(e,["videos"]);n!=null&&(Array.isArray(n)?c(t,["generatedVideos"],n.map(o=>Ip(i,o))):c(t,["generatedVideos"],n));const r=u(e,["raiMediaFilteredCount"]);r!=null&&c(t,["raiMediaFilteredCount"],r);const s=u(e,["raiMediaFilteredReasons"]);return s!=null&&c(t,["raiMediaFilteredReasons"],s),t}function gl(i,e){const t={},n=u(e,["name"]);n!=null&&c(t,["name"],n);const r=u(e,["metadata"]);r!=null&&c(t,["metadata"],r);const s=u(e,["done"]);s!=null&&c(t,["done"],s);const o=u(e,["error"]);o!=null&&c(t,["error"],o);const a=u(e,["response"]);return a!=null&&c(t,["response"],Dp(i,a)),t}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Up extends _s{constructor(e){super(),this.apiClient=e}async getVideosOperation(e){const t=e.operation,n=e.config;if(t.name===void 0||t.name==="")throw new Error("Operation name is required.");if(this.apiClient.isVertexAI()){const r=t.name.split("/operations/")[0];let s;return n&&"httpOptions"in n&&(s=n.httpOptions),this.fetchPredictVideosOperationInternal({operationName:t.name,resourceName:r,config:{httpOptions:s}})}else return this.getVideosOperationInternal({operationName:t.name,config:n})}async getVideosOperationInternal(e){var t,n;let r,s="",o={};if(this.apiClient.isVertexAI()){const a=Tp(this.apiClient,e);return s=rt("{operationName}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(l=>l.json()),r.then(l=>gl(this.apiClient,l))}else{const a=Mp(this.apiClient,e);return s=rt("{operationName}",a._url),o=a._query,delete a.config,delete a._url,delete a._query,r=this.apiClient.request({path:s,queryParams:o,body:JSON.stringify(a),httpMethod:"GET",httpOptions:(n=e.config)===null||n===void 0?void 0:n.httpOptions}).then(l=>l.json()),r.then(l=>bp(this.apiClient,l))}}async fetchPredictVideosOperationInternal(e){var t;let n,r="",s={};if(this.apiClient.isVertexAI()){const o=Ap(this.apiClient,e);return r=rt("{resourceName}:fetchPredictOperation",o._url),s=o._query,delete o.config,delete o._url,delete o._query,n=this.apiClient.request({path:r,queryParams:s,body:JSON.stringify(o),httpMethod:"POST",httpOptions:(t=e.config)===null||t===void 0?void 0:t.httpOptions}).then(a=>a.json()),n.then(a=>gl(this.apiClient,a))}else throw new Error("This method is only supported by the Vertex AI.")}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Lp="Content-Type",Np="X-Server-Timeout",Fp="User-Agent",Op="x-goog-api-client",Bp="0.9.0",Vp=`google-genai-sdk/${Bp}`,zp="v1beta1",Hp="v1beta",_l=/^data: (.*)(?:\n\n|\r\r|\r\n\r\n)/;class kp extends Error{constructor(e,t){t?super(e,{cause:t}):super(e,{cause:new Error().stack}),this.message=e,this.name="ClientError"}}class vl extends Error{constructor(e,t){t?super(e,{cause:t}):super(e,{cause:new Error().stack}),this.message=e,this.name="ServerError"}}class Gp{constructor(e){var t,n;this.clientOptions=Object.assign(Object.assign({},e),{project:e.project,location:e.location,apiKey:e.apiKey,vertexai:e.vertexai});const r={};this.clientOptions.vertexai?(r.apiVersion=(t=this.clientOptions.apiVersion)!==null&&t!==void 0?t:zp,this.getProject()||this.getLocation()?(r.baseUrl=`https://${this.clientOptions.location}-aiplatform.googleapis.com/`,this.clientOptions.apiKey=void 0):(r.baseUrl="https://aiplatform.googleapis.com/",this.clientOptions.project=void 0,this.clientOptions.location=void 0)):(r.apiVersion=(n=this.clientOptions.apiVersion)!==null&&n!==void 0?n:Hp,r.baseUrl="https://generativelanguage.googleapis.com/"),r.headers=this.getDefaultHeaders(),this.clientOptions.httpOptions=r,e.httpOptions&&(this.clientOptions.httpOptions=this.patchHttpOptions(r,e.httpOptions))}isVertexAI(){var e;return(e=this.clientOptions.vertexai)!==null&&e!==void 0?e:!1}getProject(){return this.clientOptions.project}getLocation(){return this.clientOptions.location}getApiVersion(){if(this.clientOptions.httpOptions&&this.clientOptions.httpOptions.apiVersion!==void 0)return this.clientOptions.httpOptions.apiVersion;throw new Error("API version is not set.")}getBaseUrl(){if(this.clientOptions.httpOptions&&this.clientOptions.httpOptions.baseUrl!==void 0)return this.clientOptions.httpOptions.baseUrl;throw new Error("Base URL is not set.")}getRequestUrl(){return this.getRequestUrlInternal(this.clientOptions.httpOptions)}getHeaders(){if(this.clientOptions.httpOptions&&this.clientOptions.httpOptions.headers!==void 0)return this.clientOptions.httpOptions.headers;throw new Error("Headers are not set.")}getRequestUrlInternal(e){if(!e||e.baseUrl===void 0||e.apiVersion===void 0)throw new Error("HTTP options are not correctly set.");const n=[e.baseUrl.endsWith("/")?e.baseUrl.slice(0,-1):e.baseUrl];return e.apiVersion&&e.apiVersion!==""&&n.push(e.apiVersion),n.join("/")}getBaseResourcePath(){return`projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`}getApiKey(){return this.clientOptions.apiKey}getWebsocketBaseUrl(){const e=this.getBaseUrl(),t=new URL(e);return t.protocol="wss",t.toString()}setBaseUrl(e){if(this.clientOptions.httpOptions)this.clientOptions.httpOptions.baseUrl=e;else throw new Error("HTTP options are not correctly set.")}constructUrl(e,t,n){const r=[this.getRequestUrlInternal(t)];return n&&r.push(this.getBaseResourcePath()),e!==""&&r.push(e),new URL(`${r.join("/")}`)}shouldPrependVertexProjectPath(e){return!(this.clientOptions.apiKey||!this.clientOptions.vertexai||e.path.startsWith("projects/")||e.httpMethod==="GET"&&e.path.startsWith("publishers/google/models"))}async request(e){let t=this.clientOptions.httpOptions;e.httpOptions&&(t=this.patchHttpOptions(this.clientOptions.httpOptions,e.httpOptions));const n=this.shouldPrependVertexProjectPath(e),r=this.constructUrl(e.path,t,n);if(e.queryParams)for(const[o,a]of Object.entries(e.queryParams))r.searchParams.append(o,String(a));let s={};if(e.httpMethod==="GET"){if(e.body&&e.body!=="{}")throw new Error("Request body should be empty for GET request, but got non empty request body")}else s.body=e.body;return s=await this.includeExtraHttpOptionsToRequestInit(s,t),this.unaryApiCall(r,s,e.httpMethod)}patchHttpOptions(e,t){const n=JSON.parse(JSON.stringify(e));for(const[r,s]of Object.entries(t))typeof s=="object"?n[r]=Object.assign(Object.assign({},n[r]),s):s!==void 0&&(n[r]=s);return n}async requestStream(e){let t=this.clientOptions.httpOptions;e.httpOptions&&(t=this.patchHttpOptions(this.clientOptions.httpOptions,e.httpOptions));const n=this.shouldPrependVertexProjectPath(e),r=this.constructUrl(e.path,t,n);(!r.searchParams.has("alt")||r.searchParams.get("alt")!=="sse")&&r.searchParams.set("alt","sse");let s={};return s.body=e.body,s=await this.includeExtraHttpOptionsToRequestInit(s,t),this.streamApiCall(r,s,e.httpMethod)}async includeExtraHttpOptionsToRequestInit(e,t){if(t&&t.timeout&&t.timeout>0){const n=new AbortController,r=n.signal;setTimeout(()=>n.abort(),t.timeout),e.signal=r}return e.headers=await this.getHeadersInternal(t),e}async unaryApiCall(e,t,n){return this.apiCall(e.toString(),Object.assign(Object.assign({},t),{method:n})).then(async r=>(await xl(r),new ao(r))).catch(r=>{throw r instanceof Error?r:new Error(JSON.stringify(r))})}async streamApiCall(e,t,n){return this.apiCall(e.toString(),Object.assign(Object.assign({},t),{method:n})).then(async r=>(await xl(r),this.processStreamResponse(r))).catch(r=>{throw r instanceof Error?r:new Error(JSON.stringify(r))})}processStreamResponse(e){var t;return ls(this,arguments,function*(){const r=(t=e?.body)===null||t===void 0?void 0:t.getReader(),s=new TextDecoder("utf-8");if(!r)throw new Error("Response body is empty");try{let o="";for(;;){const{done:a,value:l}=yield Dt(r.read());if(a){if(o.trim().length>0)throw new Error("Incomplete JSON segment at the end");break}const f=s.decode(l);o+=f;let d=o.match(_l);for(;d;){const h=d[1];try{const p=new Response(h,{headers:e?.headers,status:e?.status,statusText:e?.statusText});yield yield Dt(new ao(p)),o=o.slice(d[0].length),d=o.match(_l)}catch(p){throw new Error(`exception parsing stream chunk ${h}. ${p}`)}}}}finally{r.releaseLock()}})}async apiCall(e,t){return fetch(e,t).catch(n=>{throw new Error(`exception ${n} sending request`)})}getDefaultHeaders(){const e={},t=Vp+" "+this.clientOptions.userAgentExtra;return e[Fp]=t,e[Op]=t,e[Lp]="application/json",e}async getHeadersInternal(e){const t=new Headers;if(e&&e.headers){for(const[n,r]of Object.entries(e.headers))t.append(n,r);e.timeout&&e.timeout>0&&t.append(Np,String(Math.ceil(e.timeout/1e3)))}return await this.clientOptions.auth.addAuthHeaders(t),t}async uploadFile(e,t){var n;const r={};t!=null&&(r.mimeType=t.mimeType,r.name=t.name,r.displayName=t.displayName),r.name&&!r.name.startsWith("files/")&&(r.name=`files/${r.name}`);const s=this.clientOptions.uploader,o=await s.stat(e);r.sizeBytes=String(o.size);const a=(n=t?.mimeType)!==null&&n!==void 0?n:o.type;if(a===void 0||a==="")throw new Error("Can not determine mimeType. Please provide mimeType in the config.");r.mimeType=a;const l=await this.fetchUploadUrl(r,t);return s.upload(e,l,this)}async fetchUploadUrl(e,t){var n;let r={};t?.httpOptions?r=t.httpOptions:r={apiVersion:"",headers:{"Content-Type":"application/json","X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${e.sizeBytes}`,"X-Goog-Upload-Header-Content-Type":`${e.mimeType}`}};const s={file:e},o=await this.request({path:rt("upload/v1beta/files",s._url),body:JSON.stringify(s),httpMethod:"POST",httpOptions:r});if(!o||!o?.headers)throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");const a=(n=o?.headers)===null||n===void 0?void 0:n["x-goog-upload-url"];if(a===void 0)throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");return a}}async function xl(i){var e;if(i===void 0)throw new vl("response is undefined");if(!i.ok){const t=i.status,n=i.statusText;let r;!((e=i.headers.get("content-type"))===null||e===void 0)&&e.includes("application/json")?r=await i.json():r={error:{message:"exception parsing response",code:i.status,status:i.statusText}};const s=`got status: ${t} ${n}. ${JSON.stringify(r)}`;throw t>=400&&t<500?new kp(s):t>=500&&t<600?new vl(s):new Error(s)}}const Wp=1024*1024*8;async function qp(i,e,t){var n,r;let s=0,o=0,a=new ao(new Response),l="upload";for(s=i.size;o<s;){const d=Math.min(Wp,s-o),h=i.slice(o,o+d);if(o+d>=s&&(l+=", finalize"),a=await t.request({path:"",body:h,httpMethod:"POST",httpOptions:{apiVersion:"",baseUrl:e,headers:{"X-Goog-Upload-Command":l,"X-Goog-Upload-Offset":String(o),"Content-Length":String(d)}}}),o+=d,((n=a?.headers)===null||n===void 0?void 0:n["x-goog-upload-status"])!=="active")break;if(s<=o)throw new Error("All content has been uploaded, but the upload status is not finalized.")}const f=await a?.json();if(((r=a?.headers)===null||r===void 0?void 0:r["x-goog-upload-status"])!=="final")throw new Error("Failed to upload file: Upload status is not finalized.");return f.file}async function Xp(i){return{size:i.size,type:i.type}}class $p{async upload(e,t,n){if(typeof e=="string")throw new Error("File path is not supported in browser uploader.");return await qp(e,t,n)}async stat(e){if(typeof e=="string")throw new Error("File path is not supported in browser uploader.");return await Xp(e)}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Yp{create(e,t,n){return new Kp(e,t,n)}}class Kp{constructor(e,t,n){this.url=e,this.headers=t,this.callbacks=n}connect(){this.ws=new WebSocket(this.url),this.ws.onopen=this.callbacks.onopen,this.ws.onerror=this.callbacks.onerror,this.ws.onclose=this.callbacks.onclose,this.ws.onmessage=this.callbacks.onmessage}send(e){if(this.ws===void 0)throw new Error("WebSocket is not connected");this.ws.send(e)}close(){if(this.ws===void 0)throw new Error("WebSocket is not connected");this.ws.close()}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Sl="x-goog-api-key";class Zp{constructor(e){this.apiKey=e}async addAuthHeaders(e){e.get(Sl)===null&&e.append(Sl,this.apiKey)}}/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Jp="gl-node/";class Qp{constructor(e){var t;if(e.apiKey==null)throw new Error("An API Key must be set when running in a browser");if(e.project||e.location)throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");this.vertexai=(t=e.vertexai)!==null&&t!==void 0?t:!1,this.apiKey=e.apiKey,this.apiVersion=e.apiVersion;const n=new Zp(this.apiKey);this.apiClient=new Gp({auth:n,apiVersion:this.apiVersion,apiKey:this.apiKey,vertexai:this.vertexai,httpOptions:e.httpOptions,userAgentExtra:Jp+"web",uploader:new $p}),this.models=new yp(this.apiClient),this.live=new _p(this.apiClient,n,new Yp),this.chats=new Tf(this.models,this.apiClient),this.caches=new Sf(this.apiClient),this.files=new Of(this.apiClient),this.operations=new Up(this.apiClient)}}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Qr=globalThis,ta=Qr.ShadowRoot&&(Qr.ShadyCSS===void 0||Qr.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,na=Symbol(),El=new WeakMap;let zc=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==na)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ta&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=El.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&El.set(t,e))}return e}toString(){return this.cssText}};const jp=i=>new zc(typeof i=="string"?i:i+"",void 0,na),Hc=(i,...e)=>{const t=i.length===1?i[0]:e.reduce(((n,r,s)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[s+1]),i[0]);return new zc(t,i,na)},em=(i,e)=>{if(ta)i.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const t of e){const n=document.createElement("style"),r=Qr.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=t.cssText,i.appendChild(n)}},yl=ta?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return jp(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:tm,defineProperty:nm,getOwnPropertyDescriptor:im,getOwnPropertyNames:rm,getOwnPropertySymbols:sm,getPrototypeOf:om}=Object,Ss=globalThis,Ml=Ss.trustedTypes,am=Ml?Ml.emptyScript:"",lm=Ss.reactiveElementPolyfillSupport,er=(i,e)=>i,cs={toAttribute(i,e){switch(e){case Boolean:i=i?am:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},ia=(i,e)=>!tm(i,e),Tl={attribute:!0,type:String,converter:cs,reflect:!1,useDefault:!1,hasChanged:ia};Symbol.metadata??=Symbol("metadata"),Ss.litPropertyMetadata??=new WeakMap;let Ai=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Tl){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&nm(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){const{get:r,set:s}=im(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:r,set(o){const a=r?.call(this);s?.call(this,o),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Tl}static _$Ei(){if(this.hasOwnProperty(er("elementProperties")))return;const e=om(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(er("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(er("properties"))){const t=this.properties,n=[...rm(t),...sm(t)];for(const r of n)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,r]of t)this.elementProperties.set(n,r)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const r=this._$Eu(t,n);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const r of n)t.unshift(yl(r))}else e!==void 0&&t.push(yl(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return em(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&n.reflect===!0){const s=(n.converter?.toAttribute!==void 0?n.converter:cs).toAttribute(t,n.type);this._$Em=e,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const s=n.getPropertyOptions(r),o=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:cs;this._$Em=r;const a=o.fromAttribute(t,s.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n){if(e!==void 0){const r=this.constructor,s=this[e];if(n??=r.getPropertyOptions(e),!((n.hasChanged??ia)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:s},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),s!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[r,s]of n){const{wrapped:o}=s,a=this[r];o!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,s,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((n=>n.hostUpdate?.())),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};Ai.elementStyles=[],Ai.shadowRootOptions={mode:"open"},Ai[er("elementProperties")]=new Map,Ai[er("finalized")]=new Map,lm?.({ReactiveElement:Ai}),(Ss.reactiveElementVersions??=[]).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ra=globalThis,us=ra.trustedTypes,Al=us?us.createPolicy("lit-html",{createHTML:i=>i}):void 0,kc="$lit$",zn=`lit$${Math.random().toFixed(9).slice(2)}$`,Gc="?"+zn,cm=`<${Gc}>`,ai=document,ir=()=>ai.createComment(""),rr=i=>i===null||typeof i!="object"&&typeof i!="function",sa=Array.isArray,um=i=>sa(i)||typeof i?.[Symbol.iterator]=="function",ws=`[ 	
\f\r]`,$i=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Cl=/-->/g,wl=/>/g,Kn=RegExp(`>|${ws}(?:([^\\s"'>=/]+)(${ws}*=${ws}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Rl=/'/g,bl=/"/g,Wc=/^(?:script|style|textarea|title)$/i,fm=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),qc=fm(1),Ii=Symbol.for("lit-noChange"),Rt=Symbol.for("lit-nothing"),Pl=new WeakMap,oi=ai.createTreeWalker(ai,129);function Xc(i,e){if(!sa(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Al!==void 0?Al.createHTML(e):e}const dm=(i,e)=>{const t=i.length-1,n=[];let r,s=e===2?"<svg>":e===3?"<math>":"",o=$i;for(let a=0;a<t;a++){const l=i[a];let f,d,h=-1,p=0;for(;p<l.length&&(o.lastIndex=p,d=o.exec(l),d!==null);)p=o.lastIndex,o===$i?d[1]==="!--"?o=Cl:d[1]!==void 0?o=wl:d[2]!==void 0?(Wc.test(d[2])&&(r=RegExp("</"+d[2],"g")),o=Kn):d[3]!==void 0&&(o=Kn):o===Kn?d[0]===">"?(o=r??$i,h=-1):d[1]===void 0?h=-2:(h=o.lastIndex-d[2].length,f=d[1],o=d[3]===void 0?Kn:d[3]==='"'?bl:Rl):o===bl||o===Rl?o=Kn:o===Cl||o===wl?o=$i:(o=Kn,r=void 0);const g=o===Kn&&i[a+1].startsWith("/>")?" ":"";s+=o===$i?l+cm:h>=0?(n.push(f),l.slice(0,h)+kc+l.slice(h)+zn+g):l+zn+(h===-2?a:g)}return[Xc(i,s+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class sr{constructor({strings:e,_$litType$:t},n){let r;this.parts=[];let s=0,o=0;const a=e.length-1,l=this.parts,[f,d]=dm(e,t);if(this.el=sr.createElement(f,n),oi.currentNode=this.el.content,t===2||t===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(r=oi.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(const h of r.getAttributeNames())if(h.endsWith(kc)){const p=d[o++],g=r.getAttribute(h).split(zn),S=/([.?@])?(.*)/.exec(p);l.push({type:1,index:s,name:S[2],strings:g,ctor:S[1]==="."?pm:S[1]==="?"?mm:S[1]==="@"?gm:Es}),r.removeAttribute(h)}else h.startsWith(zn)&&(l.push({type:6,index:s}),r.removeAttribute(h));if(Wc.test(r.tagName)){const h=r.textContent.split(zn),p=h.length-1;if(p>0){r.textContent=us?us.emptyScript:"";for(let g=0;g<p;g++)r.append(h[g],ir()),oi.nextNode(),l.push({type:2,index:++s});r.append(h[p],ir())}}}else if(r.nodeType===8)if(r.data===Gc)l.push({type:2,index:s});else{let h=-1;for(;(h=r.data.indexOf(zn,h+1))!==-1;)l.push({type:7,index:s}),h+=zn.length-1}s++}}static createElement(e,t){const n=ai.createElement("template");return n.innerHTML=e,n}}function Di(i,e,t=i,n){if(e===Ii)return e;let r=n!==void 0?t._$Co?.[n]:t._$Cl;const s=rr(e)?void 0:e._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(i),r._$AT(i,t,n)),n!==void 0?(t._$Co??=[])[n]=r:t._$Cl=r),r!==void 0&&(e=Di(i,r._$AS(i,e.values),r,n)),e}class hm{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??ai).importNode(t,!0);oi.currentNode=r;let s=oi.nextNode(),o=0,a=0,l=n[0];for(;l!==void 0;){if(o===l.index){let f;l.type===2?f=new fr(s,s.nextSibling,this,e):l.type===1?f=new l.ctor(s,l.name,l.strings,this,e):l.type===6&&(f=new _m(s,this,e)),this._$AV.push(f),l=n[++a]}o!==l?.index&&(s=oi.nextNode(),o++)}return oi.currentNode=ai,r}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class fr{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=Rt,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Di(this,e,t),rr(e)?e===Rt||e==null||e===""?(this._$AH!==Rt&&this._$AR(),this._$AH=Rt):e!==this._$AH&&e!==Ii&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):um(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Rt&&rr(this._$AH)?this._$AA.nextSibling.data=e:this.T(ai.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,r=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=sr.createElement(Xc(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{const s=new hm(r,this),o=s.u(this.options);s.p(t),this.T(o),this._$AH=s}}_$AC(e){let t=Pl.get(e.strings);return t===void 0&&Pl.set(e.strings,t=new sr(e)),t}k(e){sa(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,r=0;for(const s of e)r===t.length?t.push(n=new fr(this.O(ir()),this.O(ir()),this,this.options)):n=t[r],n._$AI(s),r++;r<t.length&&(this._$AR(n&&n._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Es{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,s){this.type=1,this._$AH=Rt,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=Rt}_$AI(e,t=this,n,r){const s=this.strings;let o=!1;if(s===void 0)e=Di(this,e,t,0),o=!rr(e)||e!==this._$AH&&e!==Ii,o&&(this._$AH=e);else{const a=e;let l,f;for(e=s[0],l=0;l<s.length-1;l++)f=Di(this,a[n+l],t,l),f===Ii&&(f=this._$AH[l]),o||=!rr(f)||f!==this._$AH[l],f===Rt?e=Rt:e!==Rt&&(e+=(f??"")+s[l+1]),this._$AH[l]=f}o&&!r&&this.j(e)}j(e){e===Rt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class pm extends Es{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Rt?void 0:e}}class mm extends Es{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Rt)}}class gm extends Es{constructor(e,t,n,r,s){super(e,t,n,r,s),this.type=5}_$AI(e,t=this){if((e=Di(this,e,t,0)??Rt)===Ii)return;const n=this._$AH,r=e===Rt&&n!==Rt||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==Rt&&(n===Rt||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class _m{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Di(this,e)}}const vm=ra.litHtmlPolyfillSupport;vm?.(sr,fr),(ra.litHtmlVersions??=[]).push("3.3.1");const xm=(i,e,t)=>{const n=t?.renderBefore??e;let r=n._$litPart$;if(r===void 0){const s=t?.renderBefore??null;n._$litPart$=r=new fr(e.insertBefore(ir(),s),s,void 0,t??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const oa=globalThis;let Ri=class extends Ai{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=xm(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Ii}};Ri._$litElement$=!0,Ri.finalized=!0,oa.litElementHydrateSupport?.({LitElement:Ri});const Sm=oa.litElementPolyfillSupport;Sm?.({LitElement:Ri});(oa.litElementVersions??=[]).push("4.2.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $c=i=>(e,t)=>{t!==void 0?t.addInitializer((()=>{customElements.define(i,e)})):customElements.define(i,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Em={attribute:!0,type:String,converter:cs,reflect:!1,hasChanged:ia},ym=(i=Em,e,t)=>{const{kind:n,metadata:r}=t;let s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),n==="setter"&&((i=Object.create(i)).wrapped=!0),s.set(t.name,i),n==="accessor"){const{name:o}=t;return{set(a){const l=e.get.call(this);e.set.call(this,a),this.requestUpdate(o,l,i)},init(a){return a!==void 0&&this.C(o,void 0,i,a),a}}}if(n==="setter"){const{name:o}=t;return function(a){const l=this[o];e.call(this,a),this.requestUpdate(o,l,i)}}throw Error("Unsupported decorator location: "+n)};function aa(i){return(e,t)=>typeof t=="object"?ym(i,e,t):((n,r,s)=>{const o=r.hasOwnProperty(s);return r.constructor.createProperty(s,n),o?Object.getOwnPropertyDescriptor(r,s):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function dr(i){return aa({...i,state:!0,attribute:!1})}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/function Mm(i){let e="";const t=i.byteLength;for(let n=0;n<t;n++)e+=String.fromCharCode(i[n]);return btoa(e)}function Tm(i){const e=atob(i),t=e.length,n=new Uint8Array(t);for(let r=0;r<t;r++)n[r]=e.charCodeAt(r);return n}function Am(i){const e=i.length,t=new Int16Array(e);for(let n=0;n<e;n++)t[n]=i[n]*32768;return{data:Mm(new Uint8Array(t.buffer)),mimeType:"audio/pcm;rate=16000"}}async function Cm(i,e,t,n){const r=e.createBuffer(n,i.length/2/n,t),s=new Int16Array(i.buffer),o=s.length,a=new Float32Array(o);for(let l=0;l<o;l++)a[l]=s[l]/32768;for(let l=0;l<n;l++){const f=a.filter((d,h)=>h%n===l);r.copyToChannel(f,l)}return r}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/class Il{constructor(e){this.bufferLength=0,this.analyser=e.context.createAnalyser(),this.analyser.fftSize=32,this.bufferLength=this.analyser.frequencyBinCount,this.dataArray=new Uint8Array(this.bufferLength),e.connect(this.analyser)}update(){this.analyser.getByteFrequencyData(this.dataArray)}get data(){return this.dataArray}}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const la="176",wm=0,Dl=1,Rm=2,Yc=1,bm=2,yn=3,Gn=0,Ot=1,Mn=2,Rn=0,bi=1,uo=2,Ul=3,Ll=4,Pm=5,ri=100,Im=101,Dm=102,Um=103,Lm=104,Nm=200,Fm=201,Om=202,Bm=203,fo=204,ho=205,Vm=206,zm=207,Hm=208,km=209,Gm=210,Wm=211,qm=212,Xm=213,$m=214,po=0,mo=1,go=2,Ui=3,_o=4,vo=5,xo=6,So=7,Kc=0,Ym=1,Km=2,kn=0,Zm=1,Jm=2,Qm=3,jm=4,eg=5,tg=6,ng=7,Zc=300,Li=301,Ni=302,fs=303,Eo=304,ys=306,yo=1e3,Cn=1001,Mo=1002,qt=1003,ig=1004,Cr=1005,Nt=1006,Rs=1007,Hn=1008,Pn=1009,Jc=1010,Qc=1011,or=1012,ca=1013,li=1014,Jt=1015,Wt=1016,ua=1017,fa=1018,ar=1020,jc=35902,eu=1021,tu=1022,Qt=1023,lr=1026,cr=1027,da=1028,ha=1029,nu=1030,pa=1031,ma=1033,jr=33776,es=33777,ts=33778,ns=33779,To=35840,Ao=35841,Co=35842,wo=35843,Ro=36196,bo=37492,Po=37496,Io=37808,Do=37809,Uo=37810,Lo=37811,No=37812,Fo=37813,Oo=37814,Bo=37815,Vo=37816,zo=37817,Ho=37818,ko=37819,Go=37820,Wo=37821,is=36492,qo=36494,Xo=36495,iu=36283,$o=36284,Yo=36285,Ko=36286,rg=3200,sg=3201,ru=0,og=1,Tn="",Yt="srgb",Wn="srgb-linear",ds="linear",ut="srgb",fi=7680,Nl=519,ag=512,lg=513,cg=514,su=515,ug=516,fg=517,dg=518,hg=519,Fl=35044,Zo="300 es",wn=2e3,hs=2001;class Vi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const r=n[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const Pt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],bs=Math.PI/180,Jo=180/Math.PI;function hr(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Pt[i&255]+Pt[i>>8&255]+Pt[i>>16&255]+Pt[i>>24&255]+"-"+Pt[e&255]+Pt[e>>8&255]+"-"+Pt[e>>16&15|64]+Pt[e>>24&255]+"-"+Pt[t&63|128]+Pt[t>>8&255]+"-"+Pt[t>>16&255]+Pt[t>>24&255]+Pt[n&255]+Pt[n>>8&255]+Pt[n>>16&255]+Pt[n>>24&255]).toLowerCase()}function et(i,e,t){return Math.max(e,Math.min(t,i))}function pg(i,e){return(i%e+e)%e}function Ps(i,e,t){return(1-t)*i+t*e}function Yi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Vt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Ge{constructor(e=0,t=0){Ge.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ye{constructor(e,t,n,r,s,o,a,l,f){Ye.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,f)}set(e,t,n,r,s,o,a,l,f){const d=this.elements;return d[0]=e,d[1]=r,d[2]=a,d[3]=t,d[4]=s,d[5]=l,d[6]=n,d[7]=o,d[8]=f,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],f=n[1],d=n[4],h=n[7],p=n[2],g=n[5],S=n[8],y=r[0],x=r[3],m=r[6],P=r[1],w=r[4],T=r[7],V=r[2],F=r[5],N=r[8];return s[0]=o*y+a*P+l*V,s[3]=o*x+a*w+l*F,s[6]=o*m+a*T+l*N,s[1]=f*y+d*P+h*V,s[4]=f*x+d*w+h*F,s[7]=f*m+d*T+h*N,s[2]=p*y+g*P+S*V,s[5]=p*x+g*w+S*F,s[8]=p*m+g*T+S*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],f=e[7],d=e[8];return t*o*d-t*a*f-n*s*d+n*a*l+r*s*f-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],f=e[7],d=e[8],h=d*o-a*f,p=a*l-d*s,g=f*s-o*l,S=t*h+n*p+r*g;if(S===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/S;return e[0]=h*y,e[1]=(r*f-d*n)*y,e[2]=(a*n-r*o)*y,e[3]=p*y,e[4]=(d*t-r*l)*y,e[5]=(r*s-a*t)*y,e[6]=g*y,e[7]=(n*l-f*t)*y,e[8]=(o*t-n*s)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),f=Math.sin(s);return this.set(n*l,n*f,-n*(l*o+f*a)+o+e,-r*f,r*l,-r*(-f*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Is.makeScale(e,t)),this}rotate(e){return this.premultiply(Is.makeRotation(-e)),this}translate(e,t){return this.premultiply(Is.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Is=new Ye;function ou(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ps(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function mg(){const i=ps("canvas");return i.style.display="block",i}const Ol={};function rs(i){i in Ol||(Ol[i]=!0,console.warn(i))}function gg(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function _g(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function vg(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Bl=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Vl=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function xg(){const i={enabled:!0,workingColorSpace:Wn,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===ut&&(r.r=bn(r.r),r.g=bn(r.g),r.b=bn(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ut&&(r.r=Pi(r.r),r.g=Pi(r.g),r.b=Pi(r.b))),r},fromWorkingColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},toWorkingColorSpace:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Tn?ds:this.spaces[r].transfer},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Wn]:{primaries:e,whitePoint:n,transfer:ds,toXYZ:Bl,fromXYZ:Vl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Yt},outputColorSpaceConfig:{drawingBufferColorSpace:Yt}},[Yt]:{primaries:e,whitePoint:n,transfer:ut,toXYZ:Bl,fromXYZ:Vl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Yt}}}),i}const ot=xg();function bn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Pi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let di;class Sg{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{di===void 0&&(di=ps("canvas")),di.width=e.width,di.height=e.height;const r=di.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=di}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ps("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=bn(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(bn(t[n]/255)*255):t[n]=bn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Eg=0;class ga{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Eg++}),this.uuid=hr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Ds(r[o].image)):s.push(Ds(r[o]))}else s=Ds(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function Ds(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Sg.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let yg=0;class Bt extends Vi{constructor(e=Bt.DEFAULT_IMAGE,t=Bt.DEFAULT_MAPPING,n=Cn,r=Cn,s=Nt,o=Hn,a=Qt,l=Pn,f=Bt.DEFAULT_ANISOTROPY,d=Tn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:yg++}),this.uuid=hr(),this.name="",this.source=new ga(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=f,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ge(0,0),this.repeat=new Ge(1,1),this.center=new Ge(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isTextureArray=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isTextureArray=e.isTextureArray,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case yo:e.x=e.x-Math.floor(e.x);break;case Cn:e.x=e.x<0?0:1;break;case Mo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case yo:e.y=e.y-Math.floor(e.y);break;case Cn:e.y=e.y<0?0:1;break;case Mo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Bt.DEFAULT_IMAGE=null;Bt.DEFAULT_MAPPING=Zc;Bt.DEFAULT_ANISOTROPY=1;class gt{constructor(e=0,t=0,n=0,r=1){gt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,f=l[0],d=l[4],h=l[8],p=l[1],g=l[5],S=l[9],y=l[2],x=l[6],m=l[10];if(Math.abs(d-p)<.01&&Math.abs(h-y)<.01&&Math.abs(S-x)<.01){if(Math.abs(d+p)<.1&&Math.abs(h+y)<.1&&Math.abs(S+x)<.1&&Math.abs(f+g+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const w=(f+1)/2,T=(g+1)/2,V=(m+1)/2,F=(d+p)/4,N=(h+y)/4,z=(S+x)/4;return w>T&&w>V?w<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(w),r=F/n,s=N/n):T>V?T<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(T),n=F/r,s=z/r):V<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(V),n=N/s,r=z/s),this.set(n,r,s,t),this}let P=Math.sqrt((x-S)*(x-S)+(h-y)*(h-y)+(p-d)*(p-d));return Math.abs(P)<.001&&(P=1),this.x=(x-S)/P,this.y=(h-y)/P,this.z=(p-d)/P,this.w=Math.acos((f+g+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Mg extends Vi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth?n.depth:1,this.scissor=new gt(0,0,e,t),this.scissorTest=!1,this.viewport=new gt(0,0,e,t);const r={width:e,height:t,depth:this.depth};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Nt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,multiview:!1},n);const s=new Bt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new ga(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class un extends Mg{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class au extends Bt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=qt,this.minFilter=qt,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Tg extends Bt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=qt,this.minFilter=qt,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class zi{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],f=n[r+1],d=n[r+2],h=n[r+3];const p=s[o+0],g=s[o+1],S=s[o+2],y=s[o+3];if(a===0){e[t+0]=l,e[t+1]=f,e[t+2]=d,e[t+3]=h;return}if(a===1){e[t+0]=p,e[t+1]=g,e[t+2]=S,e[t+3]=y;return}if(h!==y||l!==p||f!==g||d!==S){let x=1-a;const m=l*p+f*g+d*S+h*y,P=m>=0?1:-1,w=1-m*m;if(w>Number.EPSILON){const V=Math.sqrt(w),F=Math.atan2(V,m*P);x=Math.sin(x*F)/V,a=Math.sin(a*F)/V}const T=a*P;if(l=l*x+p*T,f=f*x+g*T,d=d*x+S*T,h=h*x+y*T,x===1-a){const V=1/Math.sqrt(l*l+f*f+d*d+h*h);l*=V,f*=V,d*=V,h*=V}}e[t]=l,e[t+1]=f,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],f=n[r+2],d=n[r+3],h=s[o],p=s[o+1],g=s[o+2],S=s[o+3];return e[t]=a*S+d*h+l*g-f*p,e[t+1]=l*S+d*p+f*h-a*g,e[t+2]=f*S+d*g+a*p-l*h,e[t+3]=d*S-a*h-l*p-f*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,f=a(n/2),d=a(r/2),h=a(s/2),p=l(n/2),g=l(r/2),S=l(s/2);switch(o){case"XYZ":this._x=p*d*h+f*g*S,this._y=f*g*h-p*d*S,this._z=f*d*S+p*g*h,this._w=f*d*h-p*g*S;break;case"YXZ":this._x=p*d*h+f*g*S,this._y=f*g*h-p*d*S,this._z=f*d*S-p*g*h,this._w=f*d*h+p*g*S;break;case"ZXY":this._x=p*d*h-f*g*S,this._y=f*g*h+p*d*S,this._z=f*d*S+p*g*h,this._w=f*d*h-p*g*S;break;case"ZYX":this._x=p*d*h-f*g*S,this._y=f*g*h+p*d*S,this._z=f*d*S-p*g*h,this._w=f*d*h+p*g*S;break;case"YZX":this._x=p*d*h+f*g*S,this._y=f*g*h+p*d*S,this._z=f*d*S-p*g*h,this._w=f*d*h-p*g*S;break;case"XZY":this._x=p*d*h-f*g*S,this._y=f*g*h-p*d*S,this._z=f*d*S+p*g*h,this._w=f*d*h+p*g*S;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],f=t[2],d=t[6],h=t[10],p=n+a+h;if(p>0){const g=.5/Math.sqrt(p+1);this._w=.25/g,this._x=(d-l)*g,this._y=(s-f)*g,this._z=(o-r)*g}else if(n>a&&n>h){const g=2*Math.sqrt(1+n-a-h);this._w=(d-l)/g,this._x=.25*g,this._y=(r+o)/g,this._z=(s+f)/g}else if(a>h){const g=2*Math.sqrt(1+a-n-h);this._w=(s-f)/g,this._x=(r+o)/g,this._y=.25*g,this._z=(l+d)/g}else{const g=2*Math.sqrt(1+h-n-a);this._w=(o-r)/g,this._x=(s+f)/g,this._y=(l+d)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,f=t._z,d=t._w;return this._x=n*d+o*a+r*f-s*l,this._y=r*d+o*l+s*a-n*f,this._z=s*d+o*f+n*l-r*a,this._w=o*d-n*a-r*l-s*f,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const g=1-t;return this._w=g*o+t*this._w,this._x=g*n+t*this._x,this._y=g*r+t*this._y,this._z=g*s+t*this._z,this.normalize(),this}const f=Math.sqrt(l),d=Math.atan2(f,a),h=Math.sin((1-t)*d)/f,p=Math.sin(t*d)/f;return this._w=o*h+this._w*p,this._x=n*h+this._x*p,this._y=r*h+this._y*p,this._z=s*h+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class q{constructor(e=0,t=0,n=0){q.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(zl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(zl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,f=2*(o*r-a*n),d=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*f+o*h-a*d,this.y=n+l*d+a*f-s*h,this.z=r+l*h+s*d-o*f,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Us.copy(this).projectOnVector(e),this.sub(Us)}reflect(e){return this.sub(Us.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Us=new q,zl=new zi;class pr{constructor(e=new q(1/0,1/0,1/0),t=new q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,rn):rn.fromBufferAttribute(s,o),rn.applyMatrix4(e.matrixWorld),this.expandByPoint(rn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),wr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),wr.copy(n.boundingBox)),wr.applyMatrix4(e.matrixWorld),this.union(wr)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,rn),rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ki),Rr.subVectors(this.max,Ki),hi.subVectors(e.a,Ki),pi.subVectors(e.b,Ki),mi.subVectors(e.c,Ki),Un.subVectors(pi,hi),Ln.subVectors(mi,pi),Zn.subVectors(hi,mi);let t=[0,-Un.z,Un.y,0,-Ln.z,Ln.y,0,-Zn.z,Zn.y,Un.z,0,-Un.x,Ln.z,0,-Ln.x,Zn.z,0,-Zn.x,-Un.y,Un.x,0,-Ln.y,Ln.x,0,-Zn.y,Zn.x,0];return!Ls(t,hi,pi,mi,Rr)||(t=[1,0,0,0,1,0,0,0,1],!Ls(t,hi,pi,mi,Rr))?!1:(br.crossVectors(Un,Ln),t=[br.x,br.y,br.z],Ls(t,hi,pi,mi,Rr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(gn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),gn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),gn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),gn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),gn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),gn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),gn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),gn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(gn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const gn=[new q,new q,new q,new q,new q,new q,new q,new q],rn=new q,wr=new pr,hi=new q,pi=new q,mi=new q,Un=new q,Ln=new q,Zn=new q,Ki=new q,Rr=new q,br=new q,Jn=new q;function Ls(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){Jn.fromArray(i,s);const a=r.x*Math.abs(Jn.x)+r.y*Math.abs(Jn.y)+r.z*Math.abs(Jn.z),l=e.dot(Jn),f=t.dot(Jn),d=n.dot(Jn);if(Math.max(-Math.max(l,f,d),Math.min(l,f,d))>a)return!1}return!0}const Ag=new pr,Zi=new q,Ns=new q;class _a{constructor(e=new q,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Ag.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Zi.subVectors(e,this.center);const t=Zi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Zi,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ns.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Zi.copy(e.center).add(Ns)),this.expandByPoint(Zi.copy(e.center).sub(Ns))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const _n=new q,Fs=new q,Pr=new q,Nn=new q,Os=new q,Ir=new q,Bs=new q;class Cg{constructor(e=new q,t=new q(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=_n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_n.copy(this.origin).addScaledVector(this.direction,t),_n.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Fs.copy(e).add(t).multiplyScalar(.5),Pr.copy(t).sub(e).normalize(),Nn.copy(this.origin).sub(Fs);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Pr),a=Nn.dot(this.direction),l=-Nn.dot(Pr),f=Nn.lengthSq(),d=Math.abs(1-o*o);let h,p,g,S;if(d>0)if(h=o*l-a,p=o*a-l,S=s*d,h>=0)if(p>=-S)if(p<=S){const y=1/d;h*=y,p*=y,g=h*(h+o*p+2*a)+p*(o*h+p+2*l)+f}else p=s,h=Math.max(0,-(o*p+a)),g=-h*h+p*(p+2*l)+f;else p=-s,h=Math.max(0,-(o*p+a)),g=-h*h+p*(p+2*l)+f;else p<=-S?(h=Math.max(0,-(-o*s+a)),p=h>0?-s:Math.min(Math.max(-s,-l),s),g=-h*h+p*(p+2*l)+f):p<=S?(h=0,p=Math.min(Math.max(-s,-l),s),g=p*(p+2*l)+f):(h=Math.max(0,-(o*s+a)),p=h>0?s:Math.min(Math.max(-s,-l),s),g=-h*h+p*(p+2*l)+f);else p=o>0?-s:s,h=Math.max(0,-(o*p+a)),g=-h*h+p*(p+2*l)+f;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Fs).addScaledVector(Pr,p),g}intersectSphere(e,t){_n.subVectors(e.center,this.origin);const n=_n.dot(this.direction),r=_n.dot(_n)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const f=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,p=this.origin;return f>=0?(n=(e.min.x-p.x)*f,r=(e.max.x-p.x)*f):(n=(e.max.x-p.x)*f,r=(e.min.x-p.x)*f),d>=0?(s=(e.min.y-p.y)*d,o=(e.max.y-p.y)*d):(s=(e.max.y-p.y)*d,o=(e.min.y-p.y)*d),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-p.z)*h,l=(e.max.z-p.z)*h):(a=(e.max.z-p.z)*h,l=(e.min.z-p.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,_n)!==null}intersectTriangle(e,t,n,r,s){Os.subVectors(t,e),Ir.subVectors(n,e),Bs.crossVectors(Os,Ir);let o=this.direction.dot(Bs),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Nn.subVectors(this.origin,e);const l=a*this.direction.dot(Ir.crossVectors(Nn,Ir));if(l<0)return null;const f=a*this.direction.dot(Os.cross(Nn));if(f<0||l+f>o)return null;const d=-a*Nn.dot(Bs);return d<0?null:this.at(d/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class St{constructor(e,t,n,r,s,o,a,l,f,d,h,p,g,S,y,x){St.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,f,d,h,p,g,S,y,x)}set(e,t,n,r,s,o,a,l,f,d,h,p,g,S,y,x){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=r,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=f,m[6]=d,m[10]=h,m[14]=p,m[3]=g,m[7]=S,m[11]=y,m[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new St().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/gi.setFromMatrixColumn(e,0).length(),s=1/gi.setFromMatrixColumn(e,1).length(),o=1/gi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),f=Math.sin(r),d=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const p=o*d,g=o*h,S=a*d,y=a*h;t[0]=l*d,t[4]=-l*h,t[8]=f,t[1]=g+S*f,t[5]=p-y*f,t[9]=-a*l,t[2]=y-p*f,t[6]=S+g*f,t[10]=o*l}else if(e.order==="YXZ"){const p=l*d,g=l*h,S=f*d,y=f*h;t[0]=p+y*a,t[4]=S*a-g,t[8]=o*f,t[1]=o*h,t[5]=o*d,t[9]=-a,t[2]=g*a-S,t[6]=y+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*d,g=l*h,S=f*d,y=f*h;t[0]=p-y*a,t[4]=-o*h,t[8]=S+g*a,t[1]=g+S*a,t[5]=o*d,t[9]=y-p*a,t[2]=-o*f,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*d,g=o*h,S=a*d,y=a*h;t[0]=l*d,t[4]=S*f-g,t[8]=p*f+y,t[1]=l*h,t[5]=y*f+p,t[9]=g*f-S,t[2]=-f,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,g=o*f,S=a*l,y=a*f;t[0]=l*d,t[4]=y-p*h,t[8]=S*h+g,t[1]=h,t[5]=o*d,t[9]=-a*d,t[2]=-f*d,t[6]=g*h+S,t[10]=p-y*h}else if(e.order==="XZY"){const p=o*l,g=o*f,S=a*l,y=a*f;t[0]=l*d,t[4]=-h,t[8]=f*d,t[1]=p*h+y,t[5]=o*d,t[9]=g*h-S,t[2]=S*h-g,t[6]=a*d,t[10]=y*h+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(wg,e,Rg)}lookAt(e,t,n){const r=this.elements;return kt.subVectors(e,t),kt.lengthSq()===0&&(kt.z=1),kt.normalize(),Fn.crossVectors(n,kt),Fn.lengthSq()===0&&(Math.abs(n.z)===1?kt.x+=1e-4:kt.z+=1e-4,kt.normalize(),Fn.crossVectors(n,kt)),Fn.normalize(),Dr.crossVectors(kt,Fn),r[0]=Fn.x,r[4]=Dr.x,r[8]=kt.x,r[1]=Fn.y,r[5]=Dr.y,r[9]=kt.y,r[2]=Fn.z,r[6]=Dr.z,r[10]=kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],f=n[12],d=n[1],h=n[5],p=n[9],g=n[13],S=n[2],y=n[6],x=n[10],m=n[14],P=n[3],w=n[7],T=n[11],V=n[15],F=r[0],N=r[4],z=r[8],R=r[12],M=r[1],O=r[5],Z=r[9],Y=r[13],ie=r[2],le=r[6],ee=r[10],ce=r[14],Q=r[3],ge=r[7],ve=r[11],be=r[15];return s[0]=o*F+a*M+l*ie+f*Q,s[4]=o*N+a*O+l*le+f*ge,s[8]=o*z+a*Z+l*ee+f*ve,s[12]=o*R+a*Y+l*ce+f*be,s[1]=d*F+h*M+p*ie+g*Q,s[5]=d*N+h*O+p*le+g*ge,s[9]=d*z+h*Z+p*ee+g*ve,s[13]=d*R+h*Y+p*ce+g*be,s[2]=S*F+y*M+x*ie+m*Q,s[6]=S*N+y*O+x*le+m*ge,s[10]=S*z+y*Z+x*ee+m*ve,s[14]=S*R+y*Y+x*ce+m*be,s[3]=P*F+w*M+T*ie+V*Q,s[7]=P*N+w*O+T*le+V*ge,s[11]=P*z+w*Z+T*ee+V*ve,s[15]=P*R+w*Y+T*ce+V*be,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],f=e[13],d=e[2],h=e[6],p=e[10],g=e[14],S=e[3],y=e[7],x=e[11],m=e[15];return S*(+s*l*h-r*f*h-s*a*p+n*f*p+r*a*g-n*l*g)+y*(+t*l*g-t*f*p+s*o*p-r*o*g+r*f*d-s*l*d)+x*(+t*f*h-t*a*g-s*o*h+n*o*g+s*a*d-n*f*d)+m*(-r*a*d-t*l*h+t*a*p+r*o*h-n*o*p+n*l*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],f=e[7],d=e[8],h=e[9],p=e[10],g=e[11],S=e[12],y=e[13],x=e[14],m=e[15],P=h*x*f-y*p*f+y*l*g-a*x*g-h*l*m+a*p*m,w=S*p*f-d*x*f-S*l*g+o*x*g+d*l*m-o*p*m,T=d*y*f-S*h*f+S*a*g-o*y*g-d*a*m+o*h*m,V=S*h*l-d*y*l-S*a*p+o*y*p+d*a*x-o*h*x,F=t*P+n*w+r*T+s*V;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const N=1/F;return e[0]=P*N,e[1]=(y*p*s-h*x*s-y*r*g+n*x*g+h*r*m-n*p*m)*N,e[2]=(a*x*s-y*l*s+y*r*f-n*x*f-a*r*m+n*l*m)*N,e[3]=(h*l*s-a*p*s-h*r*f+n*p*f+a*r*g-n*l*g)*N,e[4]=w*N,e[5]=(d*x*s-S*p*s+S*r*g-t*x*g-d*r*m+t*p*m)*N,e[6]=(S*l*s-o*x*s-S*r*f+t*x*f+o*r*m-t*l*m)*N,e[7]=(o*p*s-d*l*s+d*r*f-t*p*f-o*r*g+t*l*g)*N,e[8]=T*N,e[9]=(S*h*s-d*y*s-S*n*g+t*y*g+d*n*m-t*h*m)*N,e[10]=(o*y*s-S*a*s+S*n*f-t*y*f-o*n*m+t*a*m)*N,e[11]=(d*a*s-o*h*s-d*n*f+t*h*f+o*n*g-t*a*g)*N,e[12]=V*N,e[13]=(d*y*r-S*h*r+S*n*p-t*y*p-d*n*x+t*h*x)*N,e[14]=(S*a*r-o*y*r-S*n*l+t*y*l+o*n*x-t*a*x)*N,e[15]=(o*h*r-d*a*r+d*n*l-t*h*l-o*n*p+t*a*p)*N,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,f=s*o,d=s*a;return this.set(f*o+n,f*a-r*l,f*l+r*a,0,f*a+r*l,d*a+n,d*l-r*o,0,f*l-r*a,d*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,f=s+s,d=o+o,h=a+a,p=s*f,g=s*d,S=s*h,y=o*d,x=o*h,m=a*h,P=l*f,w=l*d,T=l*h,V=n.x,F=n.y,N=n.z;return r[0]=(1-(y+m))*V,r[1]=(g+T)*V,r[2]=(S-w)*V,r[3]=0,r[4]=(g-T)*F,r[5]=(1-(p+m))*F,r[6]=(x+P)*F,r[7]=0,r[8]=(S+w)*N,r[9]=(x-P)*N,r[10]=(1-(p+y))*N,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=gi.set(r[0],r[1],r[2]).length();const o=gi.set(r[4],r[5],r[6]).length(),a=gi.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],sn.copy(this);const f=1/s,d=1/o,h=1/a;return sn.elements[0]*=f,sn.elements[1]*=f,sn.elements[2]*=f,sn.elements[4]*=d,sn.elements[5]*=d,sn.elements[6]*=d,sn.elements[8]*=h,sn.elements[9]*=h,sn.elements[10]*=h,t.setFromRotationMatrix(sn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=wn){const l=this.elements,f=2*s/(t-e),d=2*s/(n-r),h=(t+e)/(t-e),p=(n+r)/(n-r);let g,S;if(a===wn)g=-(o+s)/(o-s),S=-2*o*s/(o-s);else if(a===hs)g=-o/(o-s),S=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=f,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=d,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=S,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=wn){const l=this.elements,f=1/(t-e),d=1/(n-r),h=1/(o-s),p=(t+e)*f,g=(n+r)*d;let S,y;if(a===wn)S=(o+s)*h,y=-2*h;else if(a===hs)S=s*h,y=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*f,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*d,l[9]=0,l[13]=-g,l[2]=0,l[6]=0,l[10]=y,l[14]=-S,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const gi=new q,sn=new St,wg=new q(0,0,0),Rg=new q(1,1,1),Fn=new q,Dr=new q,kt=new q,Hl=new St,kl=new zi;class fn{constructor(e=0,t=0,n=0,r=fn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],f=r[5],d=r[9],h=r[2],p=r[6],g=r[10];switch(t){case"XYZ":this._y=Math.asin(et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,g),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,f),this._z=0);break;case"YXZ":this._x=Math.asin(-et(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,g),this._z=Math.atan2(l,f)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(et(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-h,g),this._z=Math.atan2(-o,f)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-et(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(p,g),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,f));break;case"YZX":this._z=Math.asin(et(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,f),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,g));break;case"XZY":this._z=Math.asin(-et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,f),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-d,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Hl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Hl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return kl.setFromEuler(this),this.setFromQuaternion(kl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}fn.DEFAULT_ORDER="XYZ";class lu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let bg=0;const Gl=new q,_i=new zi,vn=new St,Ur=new q,Ji=new q,Pg=new q,Ig=new zi,Wl=new q(1,0,0),ql=new q(0,1,0),Xl=new q(0,0,1),$l={type:"added"},Dg={type:"removed"},vi={type:"childadded",child:null},Vs={type:"childremoved",child:null};class Xt extends Vi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:bg++}),this.uuid=hr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xt.DEFAULT_UP.clone();const e=new q,t=new fn,n=new zi,r=new q(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new St},normalMatrix:{value:new Ye}}),this.matrix=new St,this.matrixWorld=new St,this.matrixAutoUpdate=Xt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return _i.setFromAxisAngle(e,t),this.quaternion.multiply(_i),this}rotateOnWorldAxis(e,t){return _i.setFromAxisAngle(e,t),this.quaternion.premultiply(_i),this}rotateX(e){return this.rotateOnAxis(Wl,e)}rotateY(e){return this.rotateOnAxis(ql,e)}rotateZ(e){return this.rotateOnAxis(Xl,e)}translateOnAxis(e,t){return Gl.copy(e).applyQuaternion(this.quaternion),this.position.add(Gl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Wl,e)}translateY(e){return this.translateOnAxis(ql,e)}translateZ(e){return this.translateOnAxis(Xl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(vn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ur.copy(e):Ur.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Ji.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vn.lookAt(Ji,Ur,this.up):vn.lookAt(Ur,Ji,this.up),this.quaternion.setFromRotationMatrix(vn),r&&(vn.extractRotation(r.matrixWorld),_i.setFromRotationMatrix(vn),this.quaternion.premultiply(_i.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent($l),vi.child=e,this.dispatchEvent(vi),vi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Dg),Vs.child=e,this.dispatchEvent(Vs),Vs.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),vn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),vn.multiply(e.parent.matrixWorld)),e.applyMatrix4(vn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent($l),vi.child=e,this.dispatchEvent(vi),vi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ji,e,Pg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ji,Ig,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?{min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}:void 0,boundingSphere:a.boundingSphere?{radius:a.boundingSphere.radius,center:a.boundingSphere.center.toArray()}:void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:this.boundingSphere.center.toArray(),radius:this.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:this.boundingBox.min.toArray(),max:this.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let f=0,d=l.length;f<d;f++){const h=l[f];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,f=this.material.length;l<f;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),f=o(e.textures),d=o(e.images),h=o(e.shapes),p=o(e.skeletons),g=o(e.animations),S=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),f.length>0&&(n.textures=f),d.length>0&&(n.images=d),h.length>0&&(n.shapes=h),p.length>0&&(n.skeletons=p),g.length>0&&(n.animations=g),S.length>0&&(n.nodes=S)}return n.object=r,n;function o(a){const l=[];for(const f in a){const d=a[f];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}Xt.DEFAULT_UP=new q(0,1,0);Xt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const on=new q,xn=new q,zs=new q,Sn=new q,xi=new q,Si=new q,Yl=new q,Hs=new q,ks=new q,Gs=new q,Ws=new gt,qs=new gt,Xs=new gt;class cn{constructor(e=new q,t=new q,n=new q){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),on.subVectors(e,t),r.cross(on);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){on.subVectors(r,t),xn.subVectors(n,t),zs.subVectors(e,t);const o=on.dot(on),a=on.dot(xn),l=on.dot(zs),f=xn.dot(xn),d=xn.dot(zs),h=o*f-a*a;if(h===0)return s.set(0,0,0),null;const p=1/h,g=(f*l-a*d)*p,S=(o*d-a*l)*p;return s.set(1-g-S,S,g)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Sn)===null?!1:Sn.x>=0&&Sn.y>=0&&Sn.x+Sn.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Sn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Sn.x),l.addScaledVector(o,Sn.y),l.addScaledVector(a,Sn.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return Ws.setScalar(0),qs.setScalar(0),Xs.setScalar(0),Ws.fromBufferAttribute(e,t),qs.fromBufferAttribute(e,n),Xs.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Ws,s.x),o.addScaledVector(qs,s.y),o.addScaledVector(Xs,s.z),o}static isFrontFacing(e,t,n,r){return on.subVectors(n,t),xn.subVectors(e,t),on.cross(xn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return on.subVectors(this.c,this.b),xn.subVectors(this.a,this.b),on.cross(xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return cn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return cn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return cn.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return cn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return cn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;xi.subVectors(r,n),Si.subVectors(s,n),Hs.subVectors(e,n);const l=xi.dot(Hs),f=Si.dot(Hs);if(l<=0&&f<=0)return t.copy(n);ks.subVectors(e,r);const d=xi.dot(ks),h=Si.dot(ks);if(d>=0&&h<=d)return t.copy(r);const p=l*h-d*f;if(p<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(n).addScaledVector(xi,o);Gs.subVectors(e,s);const g=xi.dot(Gs),S=Si.dot(Gs);if(S>=0&&g<=S)return t.copy(s);const y=g*f-l*S;if(y<=0&&f>=0&&S<=0)return a=f/(f-S),t.copy(n).addScaledVector(Si,a);const x=d*S-g*h;if(x<=0&&h-d>=0&&g-S>=0)return Yl.subVectors(s,r),a=(h-d)/(h-d+(g-S)),t.copy(r).addScaledVector(Yl,a);const m=1/(x+y+p);return o=y*m,a=p*m,t.copy(n).addScaledVector(xi,o).addScaledVector(Si,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const cu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},Lr={h:0,s:0,l:0};function $s(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class it{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=ot.workingColorSpace){if(e=pg(e,1),t=et(t,0,1),n=et(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=$s(o,s,e+1/3),this.g=$s(o,s,e),this.b=$s(o,s,e-1/3)}return ot.toWorkingColorSpace(this,r),this}setStyle(e,t=Yt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Yt){const n=cu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bn(e.r),this.g=bn(e.g),this.b=bn(e.b),this}copyLinearToSRGB(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Yt){return ot.fromWorkingColorSpace(It.copy(this),e),Math.round(et(It.r*255,0,255))*65536+Math.round(et(It.g*255,0,255))*256+Math.round(et(It.b*255,0,255))}getHexString(e=Yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.fromWorkingColorSpace(It.copy(this),t);const n=It.r,r=It.g,s=It.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,f;const d=(a+o)/2;if(a===o)l=0,f=0;else{const h=o-a;switch(f=d<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=f,e.l=d,e}getRGB(e,t=ot.workingColorSpace){return ot.fromWorkingColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e=Yt){ot.fromWorkingColorSpace(It.copy(this),e);const t=It.r,n=It.g,r=It.b;return e!==Yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(On),this.setHSL(On.h+e,On.s+t,On.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(On),e.getHSL(Lr);const n=Ps(On.h,Lr.h,t),r=Ps(On.s,Lr.s,t),s=Ps(On.l,Lr.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const It=new it;it.NAMES=cu;let Ug=0;class mr extends Vi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ug++}),this.uuid=hr(),this.name="",this.type="Material",this.blending=bi,this.side=Gn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fo,this.blendDst=ho,this.blendEquation=ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new it(0,0,0),this.blendAlpha=0,this.depthFunc=Ui,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fi,this.stencilZFail=fi,this.stencilZPass=fi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==bi&&(n.blending=this.blending),this.side!==Gn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==fo&&(n.blendSrc=this.blendSrc),this.blendDst!==ho&&(n.blendDst=this.blendDst),this.blendEquation!==ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ui&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Nl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class va extends mr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new it(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.combine=Kc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const An=Lg();function Lg(){const i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),r=new Uint32Array(512);for(let l=0;l<256;++l){const f=l-127;f<-27?(n[l]=0,n[l|256]=32768,r[l]=24,r[l|256]=24):f<-14?(n[l]=1024>>-f-14,n[l|256]=1024>>-f-14|32768,r[l]=-f-1,r[l|256]=-f-1):f<=15?(n[l]=f+15<<10,n[l|256]=f+15<<10|32768,r[l]=13,r[l|256]=13):f<128?(n[l]=31744,n[l|256]=64512,r[l]=24,r[l|256]=24):(n[l]=31744,n[l|256]=64512,r[l]=13,r[l|256]=13)}const s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let f=l<<13,d=0;for(;(f&8388608)===0;)f<<=1,d-=8388608;f&=-8388609,d+=947912704,s[l]=f|d}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:r,mantissaTable:s,exponentTable:o,offsetTable:a}}function Ng(i){Math.abs(i)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),i=et(i,-65504,65504),An.floatView[0]=i;const e=An.uint32View[0],t=e>>23&511;return An.baseTable[t]+((e&8388607)>>An.shiftTable[t])}function Fg(i){const e=i>>10;return An.uint32View[0]=An.mantissaTable[An.offsetTable[e]+(i&1023)]+An.exponentTable[e],An.floatView[0]}class Kl{static toHalfFloat(e){return Ng(e)}static fromHalfFloat(e){return Fg(e)}}const xt=new q,Nr=new Ge;let Og=0;class hn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Og++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Fl,this.updateRanges=[],this.gpuType=Jt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Nr.fromBufferAttribute(this,t),Nr.applyMatrix3(e),this.setXY(t,Nr.x,Nr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Vt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Yi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Yi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Yi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Yi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),r=Vt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),r=Vt(r,this.array),s=Vt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Fl&&(e.usage=this.usage),e}}class uu extends hn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class fu extends hn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class tn extends hn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Bg=0;const $t=new St,Ys=new Xt,Ei=new q,Gt=new pr,Qi=new pr,wt=new q;class In extends Vi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Bg++}),this.uuid=hr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ou(e)?fu:uu)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ye().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return $t.makeRotationFromQuaternion(e),this.applyMatrix4($t),this}rotateX(e){return $t.makeRotationX(e),this.applyMatrix4($t),this}rotateY(e){return $t.makeRotationY(e),this.applyMatrix4($t),this}rotateZ(e){return $t.makeRotationZ(e),this.applyMatrix4($t),this}translate(e,t,n){return $t.makeTranslation(e,t,n),this.applyMatrix4($t),this}scale(e,t,n){return $t.makeScale(e,t,n),this.applyMatrix4($t),this}lookAt(e){return Ys.lookAt(e),Ys.updateMatrix(),this.applyMatrix4(Ys.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ei).negate(),this.translate(Ei.x,Ei.y,Ei.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new tn(n,3))}else{const n=Math.min(e.length,t.count);for(let r=0;r<n;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new q(-1/0,-1/0,-1/0),new q(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];Gt.setFromBufferAttribute(s),this.morphTargetsRelative?(wt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(wt),wt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(wt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _a);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new q,1/0);return}if(e){const n=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Qi.setFromBufferAttribute(a),this.morphTargetsRelative?(wt.addVectors(Gt.min,Qi.min),Gt.expandByPoint(wt),wt.addVectors(Gt.max,Qi.max),Gt.expandByPoint(wt)):(Gt.expandByPoint(Qi.min),Gt.expandByPoint(Qi.max))}Gt.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)wt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(wt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let f=0,d=a.count;f<d;f++)wt.fromBufferAttribute(a,f),l&&(Ei.fromBufferAttribute(e,f),wt.add(Ei)),r=Math.max(r,n.distanceToSquared(wt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new hn(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let z=0;z<n.count;z++)a[z]=new q,l[z]=new q;const f=new q,d=new q,h=new q,p=new Ge,g=new Ge,S=new Ge,y=new q,x=new q;function m(z,R,M){f.fromBufferAttribute(n,z),d.fromBufferAttribute(n,R),h.fromBufferAttribute(n,M),p.fromBufferAttribute(s,z),g.fromBufferAttribute(s,R),S.fromBufferAttribute(s,M),d.sub(f),h.sub(f),g.sub(p),S.sub(p);const O=1/(g.x*S.y-S.x*g.y);isFinite(O)&&(y.copy(d).multiplyScalar(S.y).addScaledVector(h,-g.y).multiplyScalar(O),x.copy(h).multiplyScalar(g.x).addScaledVector(d,-S.x).multiplyScalar(O),a[z].add(y),a[R].add(y),a[M].add(y),l[z].add(x),l[R].add(x),l[M].add(x))}let P=this.groups;P.length===0&&(P=[{start:0,count:e.count}]);for(let z=0,R=P.length;z<R;++z){const M=P[z],O=M.start,Z=M.count;for(let Y=O,ie=O+Z;Y<ie;Y+=3)m(e.getX(Y+0),e.getX(Y+1),e.getX(Y+2))}const w=new q,T=new q,V=new q,F=new q;function N(z){V.fromBufferAttribute(r,z),F.copy(V);const R=a[z];w.copy(R),w.sub(V.multiplyScalar(V.dot(R))).normalize(),T.crossVectors(F,R);const O=T.dot(l[z])<0?-1:1;o.setXYZW(z,w.x,w.y,w.z,O)}for(let z=0,R=P.length;z<R;++z){const M=P[z],O=M.start,Z=M.count;for(let Y=O,ie=O+Z;Y<ie;Y+=3)N(e.getX(Y+0)),N(e.getX(Y+1)),N(e.getX(Y+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new hn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let p=0,g=n.count;p<g;p++)n.setXYZ(p,0,0,0);const r=new q,s=new q,o=new q,a=new q,l=new q,f=new q,d=new q,h=new q;if(e)for(let p=0,g=e.count;p<g;p+=3){const S=e.getX(p+0),y=e.getX(p+1),x=e.getX(p+2);r.fromBufferAttribute(t,S),s.fromBufferAttribute(t,y),o.fromBufferAttribute(t,x),d.subVectors(o,s),h.subVectors(r,s),d.cross(h),a.fromBufferAttribute(n,S),l.fromBufferAttribute(n,y),f.fromBufferAttribute(n,x),a.add(d),l.add(d),f.add(d),n.setXYZ(S,a.x,a.y,a.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(x,f.x,f.y,f.z)}else for(let p=0,g=t.count;p<g;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),d.subVectors(o,s),h.subVectors(r,s),d.cross(h),n.setXYZ(p+0,d.x,d.y,d.z),n.setXYZ(p+1,d.x,d.y,d.z),n.setXYZ(p+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)wt.fromBufferAttribute(e,t),wt.normalize(),e.setXYZ(t,wt.x,wt.y,wt.z)}toNonIndexed(){function e(a,l){const f=a.array,d=a.itemSize,h=a.normalized,p=new f.constructor(l.length*d);let g=0,S=0;for(let y=0,x=l.length;y<x;y++){a.isInterleavedBufferAttribute?g=l[y]*a.data.stride+a.offset:g=l[y]*d;for(let m=0;m<d;m++)p[S++]=f[g++]}return new hn(p,d,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new In,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],f=e(l,n);t.setAttribute(a,f)}const s=this.morphAttributes;for(const a in s){const l=[],f=s[a];for(let d=0,h=f.length;d<h;d++){const p=f[d],g=e(p,n);l.push(g)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const f=o[a];t.addGroup(f.start,f.count,f.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const f in l)l[f]!==void 0&&(e[f]=l[f]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const f=n[l];e.data.attributes[l]=f.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const f=this.morphAttributes[l],d=[];for(let h=0,p=f.length;h<p;h++){const g=f[h];d.push(g.toJSON(e.data))}d.length>0&&(r[l]=d,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const r=e.attributes;for(const f in r){const d=r[f];this.setAttribute(f,d.clone(t))}const s=e.morphAttributes;for(const f in s){const d=[],h=s[f];for(let p=0,g=h.length;p<g;p++)d.push(h[p].clone(t));this.morphAttributes[f]=d}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let f=0,d=o.length;f<d;f++){const h=o[f];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Zl=new St,Qn=new Cg,Fr=new _a,Jl=new q,Or=new q,Br=new q,Vr=new q,Ks=new q,zr=new q,Ql=new q,Hr=new q;class jt extends Xt{constructor(e=new In,t=new va){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){zr.set(0,0,0);for(let l=0,f=s.length;l<f;l++){const d=a[l],h=s[l];d!==0&&(Ks.fromBufferAttribute(h,e),o?zr.addScaledVector(Ks,d):zr.addScaledVector(Ks.sub(t),d))}t.add(zr)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Fr.copy(n.boundingSphere),Fr.applyMatrix4(s),Qn.copy(e.ray).recast(e.near),!(Fr.containsPoint(Qn.origin)===!1&&(Qn.intersectSphere(Fr,Jl)===null||Qn.origin.distanceToSquared(Jl)>(e.far-e.near)**2))&&(Zl.copy(s).invert(),Qn.copy(e.ray).applyMatrix4(Zl),!(n.boundingBox!==null&&Qn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Qn)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,f=s.attributes.uv,d=s.attributes.uv1,h=s.attributes.normal,p=s.groups,g=s.drawRange;if(a!==null)if(Array.isArray(o))for(let S=0,y=p.length;S<y;S++){const x=p[S],m=o[x.materialIndex],P=Math.max(x.start,g.start),w=Math.min(a.count,Math.min(x.start+x.count,g.start+g.count));for(let T=P,V=w;T<V;T+=3){const F=a.getX(T),N=a.getX(T+1),z=a.getX(T+2);r=kr(this,m,e,n,f,d,h,F,N,z),r&&(r.faceIndex=Math.floor(T/3),r.face.materialIndex=x.materialIndex,t.push(r))}}else{const S=Math.max(0,g.start),y=Math.min(a.count,g.start+g.count);for(let x=S,m=y;x<m;x+=3){const P=a.getX(x),w=a.getX(x+1),T=a.getX(x+2);r=kr(this,o,e,n,f,d,h,P,w,T),r&&(r.faceIndex=Math.floor(x/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let S=0,y=p.length;S<y;S++){const x=p[S],m=o[x.materialIndex],P=Math.max(x.start,g.start),w=Math.min(l.count,Math.min(x.start+x.count,g.start+g.count));for(let T=P,V=w;T<V;T+=3){const F=T,N=T+1,z=T+2;r=kr(this,m,e,n,f,d,h,F,N,z),r&&(r.faceIndex=Math.floor(T/3),r.face.materialIndex=x.materialIndex,t.push(r))}}else{const S=Math.max(0,g.start),y=Math.min(l.count,g.start+g.count);for(let x=S,m=y;x<m;x+=3){const P=x,w=x+1,T=x+2;r=kr(this,o,e,n,f,d,h,P,w,T),r&&(r.faceIndex=Math.floor(x/3),t.push(r))}}}}function Vg(i,e,t,n,r,s,o,a){let l;if(e.side===Ot?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Gn,a),l===null)return null;Hr.copy(a),Hr.applyMatrix4(i.matrixWorld);const f=t.ray.origin.distanceTo(Hr);return f<t.near||f>t.far?null:{distance:f,point:Hr.clone(),object:i}}function kr(i,e,t,n,r,s,o,a,l,f){i.getVertexPosition(a,Or),i.getVertexPosition(l,Br),i.getVertexPosition(f,Vr);const d=Vg(i,e,t,n,Or,Br,Vr,Ql);if(d){const h=new q;cn.getBarycoord(Ql,Or,Br,Vr,h),r&&(d.uv=cn.getInterpolatedAttribute(r,a,l,f,h,new Ge)),s&&(d.uv1=cn.getInterpolatedAttribute(s,a,l,f,h,new Ge)),o&&(d.normal=cn.getInterpolatedAttribute(o,a,l,f,h,new q),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const p={a,b:l,c:f,normal:new q,materialIndex:0};cn.getNormal(Or,Br,Vr,p.normal),d.face=p,d.barycoord=h}return d}class gr extends In{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],f=[],d=[],h=[];let p=0,g=0;S("z","y","x",-1,-1,n,t,e,o,s,0),S("z","y","x",1,-1,n,t,-e,o,s,1),S("x","z","y",1,1,e,n,t,r,o,2),S("x","z","y",1,-1,e,n,-t,r,o,3),S("x","y","z",1,-1,e,t,n,r,s,4),S("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new tn(f,3)),this.setAttribute("normal",new tn(d,3)),this.setAttribute("uv",new tn(h,2));function S(y,x,m,P,w,T,V,F,N,z,R){const M=T/N,O=V/z,Z=T/2,Y=V/2,ie=F/2,le=N+1,ee=z+1;let ce=0,Q=0;const ge=new q;for(let ve=0;ve<ee;ve++){const be=ve*O-Y;for(let ze=0;ze<le;ze++){const Je=ze*M-Z;ge[y]=Je*P,ge[x]=be*w,ge[m]=ie,f.push(ge.x,ge.y,ge.z),ge[y]=0,ge[x]=0,ge[m]=F>0?1:-1,d.push(ge.x,ge.y,ge.z),h.push(ze/N),h.push(1-ve/z),ce+=1}}for(let ve=0;ve<z;ve++)for(let be=0;be<N;be++){const ze=p+be+le*ve,Je=p+be+le*(ve+1),j=p+(be+1)+le*(ve+1),pe=p+(be+1)+le*ve;l.push(ze,Je,pe),l.push(Je,j,pe),Q+=6}a.addGroup(g,Q,R),g+=Q,p+=ce}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Fi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Lt(i){const e={};for(let t=0;t<i.length;t++){const n=Fi(i[t]);for(const r in n)e[r]=n[r]}return e}function zg(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function du(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ot.workingColorSpace}const ms={clone:Fi,merge:Lt};var Hg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,kg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ft extends mr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Hg,this.fragmentShader=kg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Fi(e.uniforms),this.uniformsGroups=zg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class hu extends Xt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new St,this.projectionMatrix=new St,this.projectionMatrixInverse=new St,this.coordinateSystem=wn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Bn=new q,jl=new Ge,ec=new Ge;class Kt extends hu{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Jo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(bs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Jo*2*Math.atan(Math.tan(bs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Bn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Bn.x,Bn.y).multiplyScalar(-e/Bn.z),Bn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bn.x,Bn.y).multiplyScalar(-e/Bn.z)}getViewSize(e,t){return this.getViewBounds(e,jl,ec),t.subVectors(ec,jl)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(bs*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,f=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/f,r*=o.width/l,n*=o.height/f}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const yi=-90,Mi=1;class Gg extends Xt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Kt(yi,Mi,e,t);r.layers=this.layers,this.add(r);const s=new Kt(yi,Mi,e,t);s.layers=this.layers,this.add(s);const o=new Kt(yi,Mi,e,t);o.layers=this.layers,this.add(o);const a=new Kt(yi,Mi,e,t);a.layers=this.layers,this.add(a);const l=new Kt(yi,Mi,e,t);l.layers=this.layers,this.add(l);const f=new Kt(yi,Mi,e,t);f.layers=this.layers,this.add(f)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const f of t)this.remove(f);if(e===wn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===hs)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const f of t)this.add(f),f.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,f,d]=this.children,h=e.getRenderTarget(),p=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),S=e.xr.enabled;e.xr.enabled=!1;const y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,f),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,r),e.render(t,d),e.setRenderTarget(h,p,g),e.xr.enabled=S,n.texture.needsPMREMUpdate=!0}}class pu extends Bt{constructor(e=[],t=Li,n,r,s,o,a,l,f,d){super(e,t,n,r,s,o,a,l,f,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Wg extends un{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new pu(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Nt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new gr(5,5,5),s=new Ft({name:"CubemapFromEquirect",uniforms:Fi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ot,blending:Rn});s.uniforms.tEquirect.value=t;const o=new jt(r,s),a=t.minFilter;return t.minFilter===Hn&&(t.minFilter=Nt),new Gg(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}class Gr extends Xt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const qg={type:"move"};class Zs{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Gr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Gr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new q),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Gr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new q),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,f=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(f&&e.hand){o=!0;for(const y of e.hand.values()){const x=t.getJointPose(y,n),m=this._getHandJoint(f,y);x!==null&&(m.matrix.fromArray(x.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=x.radius),m.visible=x!==null}const d=f.joints["index-finger-tip"],h=f.joints["thumb-tip"],p=d.position.distanceTo(h.position),g=.02,S=.005;f.inputState.pinching&&p>g+S?(f.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!f.inputState.pinching&&p<=g-S&&(f.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(qg)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),f!==null&&(f.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Gr;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Xg extends Xt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fn,this.environmentIntensity=1,this.environmentRotation=new fn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class $g extends Bt{constructor(e=null,t=1,n=1,r,s,o,a,l,f=qt,d=qt,h,p){super(null,o,a,l,f,d,r,s,h,p),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Js=new q,Yg=new q,Kg=new Ye;class ni{constructor(e=new q(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=Js.subVectors(n,t).cross(Yg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Js),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Kg.getNormalMatrix(e),r=this.coplanarPoint(Js).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const jn=new _a,Wr=new q;class mu{constructor(e=new ni,t=new ni,n=new ni,r=new ni,s=new ni,o=new ni){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=wn){const n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],f=r[4],d=r[5],h=r[6],p=r[7],g=r[8],S=r[9],y=r[10],x=r[11],m=r[12],P=r[13],w=r[14],T=r[15];if(n[0].setComponents(l-s,p-f,x-g,T-m).normalize(),n[1].setComponents(l+s,p+f,x+g,T+m).normalize(),n[2].setComponents(l+o,p+d,x+S,T+P).normalize(),n[3].setComponents(l-o,p-d,x-S,T-P).normalize(),n[4].setComponents(l-a,p-h,x-y,T-w).normalize(),t===wn)n[5].setComponents(l+a,p+h,x+y,T+w).normalize();else if(t===hs)n[5].setComponents(a,h,y,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),jn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),jn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(jn)}intersectsSprite(e){return jn.center.set(0,0,0),jn.radius=.7071067811865476,jn.applyMatrix4(e.matrixWorld),this.intersectsSphere(jn)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(Wr.x=r.normal.x>0?e.max.x:e.min.x,Wr.y=r.normal.y>0?e.max.y:e.min.y,Wr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Wr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class gu extends Bt{constructor(e,t,n=li,r,s,o,a=qt,l=qt,f,d=lr){if(d!==lr&&d!==cr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");super(null,r,s,o,a,l,d,n,f),this.isDepthTexture=!0,this.image={width:e,height:t},this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ga(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class xa extends In{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};const s=[],o=[];a(r),f(n),d(),this.setAttribute("position",new tn(s,3)),this.setAttribute("normal",new tn(s.slice(),3)),this.setAttribute("uv",new tn(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(P){const w=new q,T=new q,V=new q;for(let F=0;F<t.length;F+=3)g(t[F+0],w),g(t[F+1],T),g(t[F+2],V),l(w,T,V,P)}function l(P,w,T,V){const F=V+1,N=[];for(let z=0;z<=F;z++){N[z]=[];const R=P.clone().lerp(T,z/F),M=w.clone().lerp(T,z/F),O=F-z;for(let Z=0;Z<=O;Z++)Z===0&&z===F?N[z][Z]=R:N[z][Z]=R.clone().lerp(M,Z/O)}for(let z=0;z<F;z++)for(let R=0;R<2*(F-z)-1;R++){const M=Math.floor(R/2);R%2===0?(p(N[z][M+1]),p(N[z+1][M]),p(N[z][M])):(p(N[z][M+1]),p(N[z+1][M+1]),p(N[z+1][M]))}}function f(P){const w=new q;for(let T=0;T<s.length;T+=3)w.x=s[T+0],w.y=s[T+1],w.z=s[T+2],w.normalize().multiplyScalar(P),s[T+0]=w.x,s[T+1]=w.y,s[T+2]=w.z}function d(){const P=new q;for(let w=0;w<s.length;w+=3){P.x=s[w+0],P.y=s[w+1],P.z=s[w+2];const T=x(P)/2/Math.PI+.5,V=m(P)/Math.PI+.5;o.push(T,1-V)}S(),h()}function h(){for(let P=0;P<o.length;P+=6){const w=o[P+0],T=o[P+2],V=o[P+4],F=Math.max(w,T,V),N=Math.min(w,T,V);F>.9&&N<.1&&(w<.2&&(o[P+0]+=1),T<.2&&(o[P+2]+=1),V<.2&&(o[P+4]+=1))}}function p(P){s.push(P.x,P.y,P.z)}function g(P,w){const T=P*3;w.x=e[T+0],w.y=e[T+1],w.z=e[T+2]}function S(){const P=new q,w=new q,T=new q,V=new q,F=new Ge,N=new Ge,z=new Ge;for(let R=0,M=0;R<s.length;R+=9,M+=6){P.set(s[R+0],s[R+1],s[R+2]),w.set(s[R+3],s[R+4],s[R+5]),T.set(s[R+6],s[R+7],s[R+8]),F.set(o[M+0],o[M+1]),N.set(o[M+2],o[M+3]),z.set(o[M+4],o[M+5]),V.copy(P).add(w).add(T).divideScalar(3);const O=x(V);y(F,M+0,P,O),y(N,M+2,w,O),y(z,M+4,T,O)}}function y(P,w,T,V){V<0&&P.x===1&&(o[w]=P.x-1),T.x===0&&T.z===0&&(o[w]=V/2/Math.PI+.5)}function x(P){return Math.atan2(P.z,-P.x)}function m(P){return Math.atan2(-P.y,Math.sqrt(P.x*P.x+P.z*P.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xa(e.vertices,e.indices,e.radius,e.details)}}class gs extends xa{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new gs(e.radius,e.detail)}}class Ms extends In{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),f=a+1,d=l+1,h=e/a,p=t/l,g=[],S=[],y=[],x=[];for(let m=0;m<d;m++){const P=m*p-o;for(let w=0;w<f;w++){const T=w*h-s;S.push(T,-P,0),y.push(0,0,1),x.push(w/a),x.push(1-m/l)}}for(let m=0;m<l;m++)for(let P=0;P<a;P++){const w=P+f*m,T=P+f*(m+1),V=P+1+f*(m+1),F=P+1+f*m;g.push(w,T,F),g.push(T,V,F)}this.setIndex(g),this.setAttribute("position",new tn(S,3)),this.setAttribute("normal",new tn(y,3)),this.setAttribute("uv",new tn(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ms(e.width,e.height,e.widthSegments,e.heightSegments)}}class Zg extends Ft{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Jg extends mr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new it(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new it(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ru,this.normalScale=new Ge(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Qg extends mr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=rg,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class jg extends mr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const tc={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class e_{constructor(e,t,n){const r=this;let s=!1,o=0,a=0,l;const f=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(d){a++,s===!1&&r.onStart!==void 0&&r.onStart(d,o,a),s=!0},this.itemEnd=function(d){o++,r.onProgress!==void 0&&r.onProgress(d,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(d){r.onError!==void 0&&r.onError(d)},this.resolveURL=function(d){return l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,h){return f.push(d,h),this},this.removeHandler=function(d){const h=f.indexOf(d);return h!==-1&&f.splice(h,2),this},this.getHandler=function(d){for(let h=0,p=f.length;h<p;h+=2){const g=f[h],S=f[h+1];if(g.global&&(g.lastIndex=0),g.test(d))return S}return null}}}const t_=new e_;class Sa{constructor(e){this.manager=e!==void 0?e:t_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Sa.DEFAULT_MATERIAL_NAME="__DEFAULT";const En={};class n_ extends Error{constructor(e,t){super(e),this.response=t}}class i_ extends Sa{constructor(e){super(e),this.mimeType="",this.responseType=""}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=tc.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(En[e]!==void 0){En[e].push({onLoad:t,onProgress:n,onError:r});return}En[e]=[],En[e].push({onLoad:t,onProgress:n,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(f=>{if(f.status===200||f.status===0){if(f.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||f.body===void 0||f.body.getReader===void 0)return f;const d=En[e],h=f.body.getReader(),p=f.headers.get("X-File-Size")||f.headers.get("Content-Length"),g=p?parseInt(p):0,S=g!==0;let y=0;const x=new ReadableStream({start(m){P();function P(){h.read().then(({done:w,value:T})=>{if(w)m.close();else{y+=T.byteLength;const V=new ProgressEvent("progress",{lengthComputable:S,loaded:y,total:g});for(let F=0,N=d.length;F<N;F++){const z=d[F];z.onProgress&&z.onProgress(V)}m.enqueue(T),P()}},w=>{m.error(w)})}}});return new Response(x)}else throw new n_(`fetch for "${f.url}" responded with ${f.status}: ${f.statusText}`,f)}).then(f=>{switch(l){case"arraybuffer":return f.arrayBuffer();case"blob":return f.blob();case"document":return f.text().then(d=>new DOMParser().parseFromString(d,a));case"json":return f.json();default:if(a==="")return f.text();{const h=/charset="?([^;"\s]*)"?/i.exec(a),p=h&&h[1]?h[1].toLowerCase():void 0,g=new TextDecoder(p);return f.arrayBuffer().then(S=>g.decode(S))}}}).then(f=>{tc.add(e,f);const d=En[e];delete En[e];for(let h=0,p=d.length;h<p;h++){const g=d[h];g.onLoad&&g.onLoad(f)}}).catch(f=>{const d=En[e];if(d===void 0)throw this.manager.itemError(e),f;delete En[e];for(let h=0,p=d.length;h<p;h++){const g=d[h];g.onError&&g.onError(f)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class r_ extends Sa{constructor(e){super(e)}load(e,t,n,r){const s=this,o=new $g,a=new i_(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(e,function(l){let f;try{f=s.parse(l)}catch(d){if(r!==void 0)r(d);else{console.error(d);return}}f.image!==void 0?o.image=f.image:f.data!==void 0&&(o.image.width=f.width,o.image.height=f.height,o.image.data=f.data),o.wrapS=f.wrapS!==void 0?f.wrapS:Cn,o.wrapT=f.wrapT!==void 0?f.wrapT:Cn,o.magFilter=f.magFilter!==void 0?f.magFilter:Nt,o.minFilter=f.minFilter!==void 0?f.minFilter:Nt,o.anisotropy=f.anisotropy!==void 0?f.anisotropy:1,f.colorSpace!==void 0&&(o.colorSpace=f.colorSpace),f.flipY!==void 0&&(o.flipY=f.flipY),f.format!==void 0&&(o.format=f.format),f.type!==void 0&&(o.type=f.type),f.mipmaps!==void 0&&(o.mipmaps=f.mipmaps,o.minFilter=Hn),f.mipmapCount===1&&(o.minFilter=Nt),f.generateMipmaps!==void 0&&(o.generateMipmaps=f.generateMipmaps),o.needsUpdate=!0,t&&t(o,f)},n,r),o}}class _u extends hu{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const f=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=f*this.view.offsetX,o=s+f*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class s_ extends Kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class o_{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=nc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=nc();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function nc(){return performance.now()}function ic(i,e,t,n){const r=a_(n);switch(t){case eu:return i*e;case da:return i*e/r.components*r.byteLength;case ha:return i*e/r.components*r.byteLength;case nu:return i*e*2/r.components*r.byteLength;case pa:return i*e*2/r.components*r.byteLength;case tu:return i*e*3/r.components*r.byteLength;case Qt:return i*e*4/r.components*r.byteLength;case ma:return i*e*4/r.components*r.byteLength;case jr:case es:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ts:case ns:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ao:case wo:return Math.max(i,16)*Math.max(e,8)/4;case To:case Co:return Math.max(i,8)*Math.max(e,8)/2;case Ro:case bo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Po:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Io:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Do:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Uo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Lo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case No:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Fo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Bo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Vo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case zo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ho:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ko:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Go:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Wo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case is:case qo:case Xo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case iu:case $o:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Yo:case Ko:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function a_(i){switch(i){case Pn:case Jc:return{byteLength:1,components:1};case or:case Qc:case Wt:return{byteLength:2,components:1};case ua:case fa:return{byteLength:2,components:4};case li:case ca:case Jt:return{byteLength:4,components:1};case jc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:la}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=la);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function vu(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function l_(i){const e=new WeakMap;function t(a,l){const f=a.array,d=a.usage,h=f.byteLength,p=i.createBuffer();i.bindBuffer(l,p),i.bufferData(l,f,d),a.onUploadCallback();let g;if(f instanceof Float32Array)g=i.FLOAT;else if(f instanceof Uint16Array)a.isFloat16BufferAttribute?g=i.HALF_FLOAT:g=i.UNSIGNED_SHORT;else if(f instanceof Int16Array)g=i.SHORT;else if(f instanceof Uint32Array)g=i.UNSIGNED_INT;else if(f instanceof Int32Array)g=i.INT;else if(f instanceof Int8Array)g=i.BYTE;else if(f instanceof Uint8Array)g=i.UNSIGNED_BYTE;else if(f instanceof Uint8ClampedArray)g=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+f);return{buffer:p,type:g,bytesPerElement:f.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,f){const d=l.array,h=l.updateRanges;if(i.bindBuffer(f,a),h.length===0)i.bufferSubData(f,0,d);else{h.sort((g,S)=>g.start-S.start);let p=0;for(let g=1;g<h.length;g++){const S=h[p],y=h[g];y.start<=S.start+S.count+1?S.count=Math.max(S.count,y.start+y.count-S.start):(++p,h[p]=y)}h.length=p+1;for(let g=0,S=h.length;g<S;g++){const y=h[g];i.bufferSubData(f,y.start*d.BYTES_PER_ELEMENT,d,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const f=e.get(a);if(f===void 0)e.set(a,t(a,l));else if(f.version<a.version){if(f.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(f.buffer,a,l),f.version=a.version}}return{get:r,remove:s,update:o}}var c_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,u_=`#ifdef USE_ALPHAHASH
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
#endif`,f_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,d_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,h_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,p_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,m_=`#ifdef USE_AOMAP
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
#endif`,g_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,__=`#ifdef USE_BATCHING
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
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,v_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,x_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,S_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,E_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,y_=`#ifdef USE_IRIDESCENCE
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
#endif`,M_=`#ifdef USE_BUMPMAP
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
#endif`,T_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,A_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,C_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,w_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,R_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,b_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,P_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,I_=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,D_=`#define PI 3.141592653589793
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
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
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
} // validated`,U_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,L_=`vec3 transformedNormal = objectNormal;
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
#endif`,N_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,F_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,O_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,B_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,V_="gl_FragColor = linearToOutputTexel( gl_FragColor );",z_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,H_=`#ifdef USE_ENVMAP
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
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,k_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,G_=`#ifdef USE_ENVMAP
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
#endif`,W_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,q_=`#ifdef USE_ENVMAP
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
#endif`,X_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,$_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Y_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,K_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Z_=`#ifdef USE_GRADIENTMAP
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
}`,J_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Q_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,j_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ev=`uniform bool receiveShadow;
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
#endif`,tv=`#ifdef USE_ENVMAP
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
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
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
#endif`,nv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,iv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,rv=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,sv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ov=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
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
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
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
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
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
#endif`,av=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
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
		float v = 0.5 / ( gv + gl );
		return saturate(v);
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
	vec3 f0 = material.specularColor;
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
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
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
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
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
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
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
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lv=`
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
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
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
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,cv=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
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
#endif`,uv=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,fv=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,dv=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hv=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pv=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mv=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gv=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_v=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,vv=`#if defined( USE_POINTS_UV )
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
#endif`,xv=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Sv=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ev=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,yv=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Mv=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Tv=`#ifdef USE_MORPHTARGETS
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
#endif`,Av=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,wv=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Rv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pv=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Iv=`#ifdef USE_NORMALMAP
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
#endif`,Dv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Uv=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Lv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Nv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Fv=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ov=`vec3 packNormalToRGB( const in vec3 normal ) {
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
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Bv=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vv=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,zv=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Hv=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,kv=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Gv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wv=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
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
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
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
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
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
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,qv=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Xv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
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
#endif`,$v=`float getShadowMask() {
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
	#if NUM_POINT_LIGHT_SHADOWS > 0
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
}`,Yv=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Kv=`#ifdef USE_SKINNING
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
#endif`,Zv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Jv=`#ifdef USE_SKINNING
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
#endif`,Qv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,jv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,e0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,t0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,n0=`#ifdef USE_TRANSMISSION
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
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,i0=`#ifdef USE_TRANSMISSION
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
#endif`,r0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,s0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,o0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,a0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const l0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,c0=`uniform sampler2D t2D;
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
}`,u0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,f0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,h0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,p0=`#include <common>
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
}`,m0=`#if DEPTH_PACKING == 3200
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
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,g0=`#define DISTANCE
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
}`,_0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
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
	gl_FragColor = packDepthToRGBA( dist );
}`,v0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,x0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,S0=`uniform float scale;
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
}`,E0=`uniform vec3 diffuse;
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
}`,y0=`#include <common>
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
}`,M0=`uniform vec3 diffuse;
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
}`,T0=`#define LAMBERT
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
}`,A0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
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
}`,C0=`#define MATCAP
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
}`,w0=`#define MATCAP
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
}`,R0=`#define NORMAL
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
}`,b0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
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
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,P0=`#define PHONG
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
}`,I0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
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
}`,D0=`#define STANDARD
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
}`,U0=`#define STANDARD
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
#include <packing>
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
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
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
}`,L0=`#define TOON
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
}`,N0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
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
}`,F0=`uniform float size;
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
}`,O0=`uniform vec3 diffuse;
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
}`,B0=`#include <common>
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
}`,V0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
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
}`,z0=`uniform float rotation;
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
}`,H0=`uniform vec3 diffuse;
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
}`,Ze={alphahash_fragment:c_,alphahash_pars_fragment:u_,alphamap_fragment:f_,alphamap_pars_fragment:d_,alphatest_fragment:h_,alphatest_pars_fragment:p_,aomap_fragment:m_,aomap_pars_fragment:g_,batching_pars_vertex:__,batching_vertex:v_,begin_vertex:x_,beginnormal_vertex:S_,bsdfs:E_,iridescence_fragment:y_,bumpmap_pars_fragment:M_,clipping_planes_fragment:T_,clipping_planes_pars_fragment:A_,clipping_planes_pars_vertex:C_,clipping_planes_vertex:w_,color_fragment:R_,color_pars_fragment:b_,color_pars_vertex:P_,color_vertex:I_,common:D_,cube_uv_reflection_fragment:U_,defaultnormal_vertex:L_,displacementmap_pars_vertex:N_,displacementmap_vertex:F_,emissivemap_fragment:O_,emissivemap_pars_fragment:B_,colorspace_fragment:V_,colorspace_pars_fragment:z_,envmap_fragment:H_,envmap_common_pars_fragment:k_,envmap_pars_fragment:G_,envmap_pars_vertex:W_,envmap_physical_pars_fragment:tv,envmap_vertex:q_,fog_vertex:X_,fog_pars_vertex:$_,fog_fragment:Y_,fog_pars_fragment:K_,gradientmap_pars_fragment:Z_,lightmap_pars_fragment:J_,lights_lambert_fragment:Q_,lights_lambert_pars_fragment:j_,lights_pars_begin:ev,lights_toon_fragment:nv,lights_toon_pars_fragment:iv,lights_phong_fragment:rv,lights_phong_pars_fragment:sv,lights_physical_fragment:ov,lights_physical_pars_fragment:av,lights_fragment_begin:lv,lights_fragment_maps:cv,lights_fragment_end:uv,logdepthbuf_fragment:fv,logdepthbuf_pars_fragment:dv,logdepthbuf_pars_vertex:hv,logdepthbuf_vertex:pv,map_fragment:mv,map_pars_fragment:gv,map_particle_fragment:_v,map_particle_pars_fragment:vv,metalnessmap_fragment:xv,metalnessmap_pars_fragment:Sv,morphinstance_vertex:Ev,morphcolor_vertex:yv,morphnormal_vertex:Mv,morphtarget_pars_vertex:Tv,morphtarget_vertex:Av,normal_fragment_begin:Cv,normal_fragment_maps:wv,normal_pars_fragment:Rv,normal_pars_vertex:bv,normal_vertex:Pv,normalmap_pars_fragment:Iv,clearcoat_normal_fragment_begin:Dv,clearcoat_normal_fragment_maps:Uv,clearcoat_pars_fragment:Lv,iridescence_pars_fragment:Nv,opaque_fragment:Fv,packing:Ov,premultiplied_alpha_fragment:Bv,project_vertex:Vv,dithering_fragment:zv,dithering_pars_fragment:Hv,roughnessmap_fragment:kv,roughnessmap_pars_fragment:Gv,shadowmap_pars_fragment:Wv,shadowmap_pars_vertex:qv,shadowmap_vertex:Xv,shadowmask_pars_fragment:$v,skinbase_vertex:Yv,skinning_pars_vertex:Kv,skinning_vertex:Zv,skinnormal_vertex:Jv,specularmap_fragment:Qv,specularmap_pars_fragment:jv,tonemapping_fragment:e0,tonemapping_pars_fragment:t0,transmission_fragment:n0,transmission_pars_fragment:i0,uv_pars_fragment:r0,uv_pars_vertex:s0,uv_vertex:o0,worldpos_vertex:a0,background_vert:l0,background_frag:c0,backgroundCube_vert:u0,backgroundCube_frag:f0,cube_vert:d0,cube_frag:h0,depth_vert:p0,depth_frag:m0,distanceRGBA_vert:g0,distanceRGBA_frag:_0,equirect_vert:v0,equirect_frag:x0,linedashed_vert:S0,linedashed_frag:E0,meshbasic_vert:y0,meshbasic_frag:M0,meshlambert_vert:T0,meshlambert_frag:A0,meshmatcap_vert:C0,meshmatcap_frag:w0,meshnormal_vert:R0,meshnormal_frag:b0,meshphong_vert:P0,meshphong_frag:I0,meshphysical_vert:D0,meshphysical_frag:U0,meshtoon_vert:L0,meshtoon_frag:N0,points_vert:F0,points_frag:O0,shadow_vert:B0,shadow_frag:V0,sprite_vert:z0,sprite_frag:H0},xe={common:{diffuse:{value:new it(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new Ge(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new it(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new it(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new it(16777215)},opacity:{value:1},center:{value:new Ge(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},dn={basic:{uniforms:Lt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:Ze.meshbasic_vert,fragmentShader:Ze.meshbasic_frag},lambert:{uniforms:Lt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new it(0)}}]),vertexShader:Ze.meshlambert_vert,fragmentShader:Ze.meshlambert_frag},phong:{uniforms:Lt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new it(0)},specular:{value:new it(1118481)},shininess:{value:30}}]),vertexShader:Ze.meshphong_vert,fragmentShader:Ze.meshphong_frag},standard:{uniforms:Lt([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new it(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag},toon:{uniforms:Lt([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new it(0)}}]),vertexShader:Ze.meshtoon_vert,fragmentShader:Ze.meshtoon_frag},matcap:{uniforms:Lt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:Ze.meshmatcap_vert,fragmentShader:Ze.meshmatcap_frag},points:{uniforms:Lt([xe.points,xe.fog]),vertexShader:Ze.points_vert,fragmentShader:Ze.points_frag},dashed:{uniforms:Lt([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ze.linedashed_vert,fragmentShader:Ze.linedashed_frag},depth:{uniforms:Lt([xe.common,xe.displacementmap]),vertexShader:Ze.depth_vert,fragmentShader:Ze.depth_frag},normal:{uniforms:Lt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:Ze.meshnormal_vert,fragmentShader:Ze.meshnormal_frag},sprite:{uniforms:Lt([xe.sprite,xe.fog]),vertexShader:Ze.sprite_vert,fragmentShader:Ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ze.background_vert,fragmentShader:Ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:Ze.backgroundCube_vert,fragmentShader:Ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ze.cube_vert,fragmentShader:Ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ze.equirect_vert,fragmentShader:Ze.equirect_frag},distanceRGBA:{uniforms:Lt([xe.common,xe.displacementmap,{referencePosition:{value:new q},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ze.distanceRGBA_vert,fragmentShader:Ze.distanceRGBA_frag},shadow:{uniforms:Lt([xe.lights,xe.fog,{color:{value:new it(0)},opacity:{value:1}}]),vertexShader:Ze.shadow_vert,fragmentShader:Ze.shadow_frag}};dn.physical={uniforms:Lt([dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new Ge(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new it(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new Ge},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new it(0)},specularColor:{value:new it(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new Ge},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag};const qr={r:0,b:0,g:0},ei=new fn,k0=new St;function G0(i,e,t,n,r,s,o){const a=new it(0);let l=s===!0?0:1,f,d,h=null,p=0,g=null;function S(w){let T=w.isScene===!0?w.background:null;return T&&T.isTexture&&(T=(w.backgroundBlurriness>0?t:e).get(T)),T}function y(w){let T=!1;const V=S(w);V===null?m(a,l):V&&V.isColor&&(m(V,1),T=!0);const F=i.xr.getEnvironmentBlendMode();F==="additive"?n.buffers.color.setClear(0,0,0,1,o):F==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||T)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(w,T){const V=S(T);V&&(V.isCubeTexture||V.mapping===ys)?(d===void 0&&(d=new jt(new gr(1,1,1),new Ft({name:"BackgroundCubeMaterial",uniforms:Fi(dn.backgroundCube.uniforms),vertexShader:dn.backgroundCube.vertexShader,fragmentShader:dn.backgroundCube.fragmentShader,side:Ot,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(F,N,z){this.matrixWorld.copyPosition(z.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(d)),ei.copy(T.backgroundRotation),ei.x*=-1,ei.y*=-1,ei.z*=-1,V.isCubeTexture&&V.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),d.material.uniforms.envMap.value=V,d.material.uniforms.flipEnvMap.value=V.isCubeTexture&&V.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(k0.makeRotationFromEuler(ei)),d.material.toneMapped=ot.getTransfer(V.colorSpace)!==ut,(h!==V||p!==V.version||g!==i.toneMapping)&&(d.material.needsUpdate=!0,h=V,p=V.version,g=i.toneMapping),d.layers.enableAll(),w.unshift(d,d.geometry,d.material,0,0,null)):V&&V.isTexture&&(f===void 0&&(f=new jt(new Ms(2,2),new Ft({name:"BackgroundMaterial",uniforms:Fi(dn.background.uniforms),vertexShader:dn.background.vertexShader,fragmentShader:dn.background.fragmentShader,side:Gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),f.geometry.deleteAttribute("normal"),Object.defineProperty(f.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(f)),f.material.uniforms.t2D.value=V,f.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,f.material.toneMapped=ot.getTransfer(V.colorSpace)!==ut,V.matrixAutoUpdate===!0&&V.updateMatrix(),f.material.uniforms.uvTransform.value.copy(V.matrix),(h!==V||p!==V.version||g!==i.toneMapping)&&(f.material.needsUpdate=!0,h=V,p=V.version,g=i.toneMapping),f.layers.enableAll(),w.unshift(f,f.geometry,f.material,0,0,null))}function m(w,T){w.getRGB(qr,du(i)),n.buffers.color.setClear(qr.r,qr.g,qr.b,T,o)}function P(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),f!==void 0&&(f.geometry.dispose(),f.material.dispose(),f=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,T=1){a.set(w),l=T,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(w){l=w,m(a,l)},render:y,addToRenderList:x,dispose:P}}function W0(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=p(null);let s=r,o=!1;function a(M,O,Z,Y,ie){let le=!1;const ee=h(Y,Z,O);s!==ee&&(s=ee,f(s.object)),le=g(M,Y,Z,ie),le&&S(M,Y,Z,ie),ie!==null&&e.update(ie,i.ELEMENT_ARRAY_BUFFER),(le||o)&&(o=!1,T(M,O,Z,Y),ie!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(ie).buffer))}function l(){return i.createVertexArray()}function f(M){return i.bindVertexArray(M)}function d(M){return i.deleteVertexArray(M)}function h(M,O,Z){const Y=Z.wireframe===!0;let ie=n[M.id];ie===void 0&&(ie={},n[M.id]=ie);let le=ie[O.id];le===void 0&&(le={},ie[O.id]=le);let ee=le[Y];return ee===void 0&&(ee=p(l()),le[Y]=ee),ee}function p(M){const O=[],Z=[],Y=[];for(let ie=0;ie<t;ie++)O[ie]=0,Z[ie]=0,Y[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:Z,attributeDivisors:Y,object:M,attributes:{},index:null}}function g(M,O,Z,Y){const ie=s.attributes,le=O.attributes;let ee=0;const ce=Z.getAttributes();for(const Q in ce)if(ce[Q].location>=0){const ve=ie[Q];let be=le[Q];if(be===void 0&&(Q==="instanceMatrix"&&M.instanceMatrix&&(be=M.instanceMatrix),Q==="instanceColor"&&M.instanceColor&&(be=M.instanceColor)),ve===void 0||ve.attribute!==be||be&&ve.data!==be.data)return!0;ee++}return s.attributesNum!==ee||s.index!==Y}function S(M,O,Z,Y){const ie={},le=O.attributes;let ee=0;const ce=Z.getAttributes();for(const Q in ce)if(ce[Q].location>=0){let ve=le[Q];ve===void 0&&(Q==="instanceMatrix"&&M.instanceMatrix&&(ve=M.instanceMatrix),Q==="instanceColor"&&M.instanceColor&&(ve=M.instanceColor));const be={};be.attribute=ve,ve&&ve.data&&(be.data=ve.data),ie[Q]=be,ee++}s.attributes=ie,s.attributesNum=ee,s.index=Y}function y(){const M=s.newAttributes;for(let O=0,Z=M.length;O<Z;O++)M[O]=0}function x(M){m(M,0)}function m(M,O){const Z=s.newAttributes,Y=s.enabledAttributes,ie=s.attributeDivisors;Z[M]=1,Y[M]===0&&(i.enableVertexAttribArray(M),Y[M]=1),ie[M]!==O&&(i.vertexAttribDivisor(M,O),ie[M]=O)}function P(){const M=s.newAttributes,O=s.enabledAttributes;for(let Z=0,Y=O.length;Z<Y;Z++)O[Z]!==M[Z]&&(i.disableVertexAttribArray(Z),O[Z]=0)}function w(M,O,Z,Y,ie,le,ee){ee===!0?i.vertexAttribIPointer(M,O,Z,ie,le):i.vertexAttribPointer(M,O,Z,Y,ie,le)}function T(M,O,Z,Y){y();const ie=Y.attributes,le=Z.getAttributes(),ee=O.defaultAttributeValues;for(const ce in le){const Q=le[ce];if(Q.location>=0){let ge=ie[ce];if(ge===void 0&&(ce==="instanceMatrix"&&M.instanceMatrix&&(ge=M.instanceMatrix),ce==="instanceColor"&&M.instanceColor&&(ge=M.instanceColor)),ge!==void 0){const ve=ge.normalized,be=ge.itemSize,ze=e.get(ge);if(ze===void 0)continue;const Je=ze.buffer,j=ze.type,pe=ze.bytesPerElement,me=j===i.INT||j===i.UNSIGNED_INT||ge.gpuType===ca;if(ge.isInterleavedBufferAttribute){const _e=ge.data,Pe=_e.stride,Qe=ge.offset;if(_e.isInstancedInterleavedBuffer){for(let He=0;He<Q.locationSize;He++)m(Q.location+He,_e.meshPerAttribute);M.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=_e.meshPerAttribute*_e.count)}else for(let He=0;He<Q.locationSize;He++)x(Q.location+He);i.bindBuffer(i.ARRAY_BUFFER,Je);for(let He=0;He<Q.locationSize;He++)w(Q.location+He,be/Q.locationSize,j,ve,Pe*pe,(Qe+be/Q.locationSize*He)*pe,me)}else{if(ge.isInstancedBufferAttribute){for(let _e=0;_e<Q.locationSize;_e++)m(Q.location+_e,ge.meshPerAttribute);M.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let _e=0;_e<Q.locationSize;_e++)x(Q.location+_e);i.bindBuffer(i.ARRAY_BUFFER,Je);for(let _e=0;_e<Q.locationSize;_e++)w(Q.location+_e,be/Q.locationSize,j,ve,be*pe,be/Q.locationSize*_e*pe,me)}}else if(ee!==void 0){const ve=ee[ce];if(ve!==void 0)switch(ve.length){case 2:i.vertexAttrib2fv(Q.location,ve);break;case 3:i.vertexAttrib3fv(Q.location,ve);break;case 4:i.vertexAttrib4fv(Q.location,ve);break;default:i.vertexAttrib1fv(Q.location,ve)}}}}P()}function V(){z();for(const M in n){const O=n[M];for(const Z in O){const Y=O[Z];for(const ie in Y)d(Y[ie].object),delete Y[ie];delete O[Z]}delete n[M]}}function F(M){if(n[M.id]===void 0)return;const O=n[M.id];for(const Z in O){const Y=O[Z];for(const ie in Y)d(Y[ie].object),delete Y[ie];delete O[Z]}delete n[M.id]}function N(M){for(const O in n){const Z=n[O];if(Z[M.id]===void 0)continue;const Y=Z[M.id];for(const ie in Y)d(Y[ie].object),delete Y[ie];delete Z[M.id]}}function z(){R(),o=!0,s!==r&&(s=r,f(s.object))}function R(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:z,resetDefaultState:R,dispose:V,releaseStatesOfGeometry:F,releaseStatesOfProgram:N,initAttributes:y,enableAttribute:x,disableUnusedAttributes:P}}function q0(i,e,t){let n;function r(f){n=f}function s(f,d){i.drawArrays(n,f,d),t.update(d,n,1)}function o(f,d,h){h!==0&&(i.drawArraysInstanced(n,f,d,h),t.update(d,n,h))}function a(f,d,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,f,0,d,0,h);let g=0;for(let S=0;S<h;S++)g+=d[S];t.update(g,n,1)}function l(f,d,h,p){if(h===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let S=0;S<f.length;S++)o(f[S],d[S],p[S]);else{g.multiDrawArraysInstancedWEBGL(n,f,0,d,0,p,0,h);let S=0;for(let y=0;y<h;y++)S+=d[y]*p[y];t.update(S,n,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function X0(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const N=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(N.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(N){return!(N!==Qt&&n.convert(N)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(N){const z=N===Wt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(N!==Pn&&n.convert(N)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&N!==Jt&&!z)}function l(N){if(N==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";N="mediump"}return N==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let f=t.precision!==void 0?t.precision:"highp";const d=l(f);d!==f&&(console.warn("THREE.WebGLRenderer:",f,"not supported, using",d,"instead."),f=d);const h=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),g=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),S=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),x=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),P=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),V=S>0,F=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:f,logarithmicDepthBuffer:h,reverseDepthBuffer:p,maxTextures:g,maxVertexTextures:S,maxTextureSize:y,maxCubemapSize:x,maxAttributes:m,maxVertexUniforms:P,maxVaryings:w,maxFragmentUniforms:T,vertexTextures:V,maxSamples:F}}function $0(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new ni,a=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,p){const g=h.length!==0||p||n!==0||r;return r=p,n=h.length,g},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,p){t=d(h,p,0)},this.setState=function(h,p,g){const S=h.clippingPlanes,y=h.clipIntersection,x=h.clipShadows,m=i.get(h);if(!r||S===null||S.length===0||s&&!x)s?d(null):f();else{const P=s?0:n,w=P*4;let T=m.clippingState||null;l.value=T,T=d(S,p,w,g);for(let V=0;V!==w;++V)T[V]=t[V];m.clippingState=T,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=P}};function f(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(h,p,g,S){const y=h!==null?h.length:0;let x=null;if(y!==0){if(x=l.value,S!==!0||x===null){const m=g+y*4,P=p.matrixWorldInverse;a.getNormalMatrix(P),(x===null||x.length<m)&&(x=new Float32Array(m));for(let w=0,T=g;w!==y;++w,T+=4)o.copy(h[w]).applyMatrix4(P,a),o.normal.toArray(x,T),x[T+3]=o.constant}l.value=x,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,x}}function Y0(i){let e=new WeakMap;function t(o,a){return a===fs?o.mapping=Li:a===Eo&&(o.mapping=Ni),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===fs||a===Eo)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const f=new Wg(l.height);return f.fromEquirectangularTexture(i,o),e.set(o,f),o.addEventListener("dispose",r),t(f.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}const Ci=4,rc=[.125,.215,.35,.446,.526,.582],si=20,Qs=new _u,sc=new it;let js=null,eo=0,to=0,no=!1;const ii=(1+Math.sqrt(5))/2,Ti=1/ii,oc=[new q(-ii,Ti,0),new q(ii,Ti,0),new q(-Ti,0,ii),new q(Ti,0,ii),new q(0,ii,-Ti),new q(0,ii,Ti),new q(-1,1,-1),new q(1,1,-1),new q(-1,1,1),new q(1,1,1)],K0=new q;class Qo{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,s={}){const{size:o=256,position:a=K0}=s;js=this._renderer.getRenderTarget(),eo=this._renderer.getActiveCubeFace(),to=this._renderer.getActiveMipmapLevel(),no=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=lc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(js,eo,to),this._renderer.xr.enabled=no,e.scissorTest=!1,Xr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Li||e.mapping===Ni?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),js=this._renderer.getRenderTarget(),eo=this._renderer.getActiveCubeFace(),to=this._renderer.getActiveMipmapLevel(),no=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Nt,minFilter:Nt,generateMipmaps:!1,type:Wt,format:Qt,colorSpace:Wn,depthBuffer:!1},r=ac(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ac(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Z0(s)),this._blurMaterial=J0(s,e,t)}return r}_compileMaterial(e){const t=new jt(this._lodPlanes[0],e);this._renderer.compile(t,Qs)}_sceneToCubeUV(e,t,n,r,s){const l=new Kt(90,1,t,n),f=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],h=this._renderer,p=h.autoClear,g=h.toneMapping;h.getClearColor(sc),h.toneMapping=kn,h.autoClear=!1;const S=new va({name:"PMREM.Background",side:Ot,depthWrite:!1,depthTest:!1}),y=new jt(new gr,S);let x=!1;const m=e.background;m?m.isColor&&(S.color.copy(m),e.background=null,x=!0):(S.color.copy(sc),x=!0);for(let P=0;P<6;P++){const w=P%3;w===0?(l.up.set(0,f[P],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+d[P],s.y,s.z)):w===1?(l.up.set(0,0,f[P]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+d[P],s.z)):(l.up.set(0,f[P],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+d[P]));const T=this._cubeSize;Xr(r,w*T,P>2?T:0,T,T),h.setRenderTarget(r),x&&h.render(y,l),h.render(e,l)}y.geometry.dispose(),y.material.dispose(),h.toneMapping=g,h.autoClear=p,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===Li||e.mapping===Ni;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=cc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=lc());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new jt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Xr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Qs)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=oc[(r-s-1)%oc.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,f=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,h=new jt(this._lodPlanes[r],f),p=f.uniforms,g=this._sizeLods[n]-1,S=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*si-1),y=s/S,x=isFinite(s)?1+Math.floor(d*y):si;x>si&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${si}`);const m=[];let P=0;for(let N=0;N<si;++N){const z=N/y,R=Math.exp(-z*z/2);m.push(R),N===0?P+=R:N<x&&(P+=2*R)}for(let N=0;N<m.length;N++)m[N]=m[N]/P;p.envMap.value=e.texture,p.samples.value=x,p.weights.value=m,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:w}=this;p.dTheta.value=S,p.mipInt.value=w-n;const T=this._sizeLods[r],V=3*T*(r>w-Ci?r-w+Ci:0),F=4*(this._cubeSize-T);Xr(t,V,F,3*T,2*T),l.setRenderTarget(t),l.render(h,Qs)}}function Z0(i){const e=[],t=[],n=[];let r=i;const s=i-Ci+1+rc.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-Ci?l=rc[o-i+Ci-1]:o===0&&(l=0),n.push(l);const f=1/(a-2),d=-f,h=1+f,p=[d,d,h,d,h,h,d,d,h,h,d,h],g=6,S=6,y=3,x=2,m=1,P=new Float32Array(y*S*g),w=new Float32Array(x*S*g),T=new Float32Array(m*S*g);for(let F=0;F<g;F++){const N=F%3*2/3-1,z=F>2?0:-1,R=[N,z,0,N+2/3,z,0,N+2/3,z+1,0,N,z,0,N+2/3,z+1,0,N,z+1,0];P.set(R,y*S*F),w.set(p,x*S*F);const M=[F,F,F,F,F,F];T.set(M,m*S*F)}const V=new In;V.setAttribute("position",new hn(P,y)),V.setAttribute("uv",new hn(w,x)),V.setAttribute("faceIndex",new hn(T,m)),e.push(V),r>Ci&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ac(i,e,t){const n=new un(i,e,t);return n.texture.mapping=ys,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Xr(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function J0(i,e,t){const n=new Float32Array(si),r=new q(0,1,0);return new Ft({name:"SphericalGaussianBlur",defines:{n:si,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Ea(),fragmentShader:`

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
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function lc(){return new Ft({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ea(),fragmentShader:`

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
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function cc(){return new Ft({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ea(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function Ea(){return`

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
	`}function Q0(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,f=l===fs||l===Eo,d=l===Li||l===Ni;if(f||d){let h=e.get(a);const p=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Qo(i)),h=f?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const g=a.image;return f&&g&&g.height>0||d&&g&&r(g)?(t===null&&(t=new Qo(i)),h=f?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0;const f=6;for(let d=0;d<f;d++)a[d]!==void 0&&l++;return l===f}function s(a){const l=a.target;l.removeEventListener("dispose",s);const f=e.get(l);f!==void 0&&(e.delete(l),f.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function j0(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&rs("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function ex(i,e,t,n){const r={},s=new WeakMap;function o(h){const p=h.target;p.index!==null&&e.remove(p.index);for(const S in p.attributes)e.remove(p.attributes[S]);p.removeEventListener("dispose",o),delete r[p.id];const g=s.get(p);g&&(e.remove(g),s.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(h,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function l(h){const p=h.attributes;for(const g in p)e.update(p[g],i.ARRAY_BUFFER)}function f(h){const p=[],g=h.index,S=h.attributes.position;let y=0;if(g!==null){const P=g.array;y=g.version;for(let w=0,T=P.length;w<T;w+=3){const V=P[w+0],F=P[w+1],N=P[w+2];p.push(V,F,F,N,N,V)}}else if(S!==void 0){const P=S.array;y=S.version;for(let w=0,T=P.length/3-1;w<T;w+=3){const V=w+0,F=w+1,N=w+2;p.push(V,F,F,N,N,V)}}else return;const x=new(ou(p)?fu:uu)(p,1);x.version=y;const m=s.get(h);m&&e.remove(m),s.set(h,x)}function d(h){const p=s.get(h);if(p){const g=h.index;g!==null&&p.version<g.version&&f(h)}else f(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:d}}function tx(i,e,t){let n;function r(p){n=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function l(p,g){i.drawElements(n,g,s,p*o),t.update(g,n,1)}function f(p,g,S){S!==0&&(i.drawElementsInstanced(n,g,s,p*o,S),t.update(g,n,S))}function d(p,g,S){if(S===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,g,0,s,p,0,S);let x=0;for(let m=0;m<S;m++)x+=g[m];t.update(x,n,1)}function h(p,g,S,y){if(S===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let m=0;m<p.length;m++)f(p[m]/o,g[m],y[m]);else{x.multiDrawElementsInstancedWEBGL(n,g,0,s,p,0,y,0,S);let m=0;for(let P=0;P<S;P++)m+=g[P]*y[P];t.update(m,n,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=f,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function nx(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function ix(i,e,t){const n=new WeakMap,r=new gt;function s(o,a,l){const f=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=d!==void 0?d.length:0;let p=n.get(a);if(p===void 0||p.count!==h){let M=function(){z.dispose(),n.delete(a),a.removeEventListener("dispose",M)};var g=M;p!==void 0&&p.texture.dispose();const S=a.morphAttributes.position!==void 0,y=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],P=a.morphAttributes.normal||[],w=a.morphAttributes.color||[];let T=0;S===!0&&(T=1),y===!0&&(T=2),x===!0&&(T=3);let V=a.attributes.position.count*T,F=1;V>e.maxTextureSize&&(F=Math.ceil(V/e.maxTextureSize),V=e.maxTextureSize);const N=new Float32Array(V*F*4*h),z=new au(N,V,F,h);z.type=Jt,z.needsUpdate=!0;const R=T*4;for(let O=0;O<h;O++){const Z=m[O],Y=P[O],ie=w[O],le=V*F*4*O;for(let ee=0;ee<Z.count;ee++){const ce=ee*R;S===!0&&(r.fromBufferAttribute(Z,ee),N[le+ce+0]=r.x,N[le+ce+1]=r.y,N[le+ce+2]=r.z,N[le+ce+3]=0),y===!0&&(r.fromBufferAttribute(Y,ee),N[le+ce+4]=r.x,N[le+ce+5]=r.y,N[le+ce+6]=r.z,N[le+ce+7]=0),x===!0&&(r.fromBufferAttribute(ie,ee),N[le+ce+8]=r.x,N[le+ce+9]=r.y,N[le+ce+10]=r.z,N[le+ce+11]=ie.itemSize===4?r.w:1)}}p={count:h,texture:z,size:new Ge(V,F)},n.set(a,p),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let S=0;for(let x=0;x<f.length;x++)S+=f[x];const y=a.morphTargetsRelative?1:1-S;l.getUniforms().setValue(i,"morphTargetBaseInfluence",y),l.getUniforms().setValue(i,"morphTargetInfluences",f)}l.getUniforms().setValue(i,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",p.size)}return{update:s}}function rx(i,e,t,n){let r=new WeakMap;function s(l){const f=n.render.frame,d=l.geometry,h=e.get(l,d);if(r.get(h)!==f&&(e.update(h),r.set(h,f)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==f&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,f))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==f&&(p.update(),r.set(p,f))}return h}function o(){r=new WeakMap}function a(l){const f=l.target;f.removeEventListener("dispose",a),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:s,dispose:o}}const xu=new Bt,uc=new gu(1,1),Su=new au,Eu=new Tg,yu=new pu,fc=[],dc=[],hc=new Float32Array(16),pc=new Float32Array(9),mc=new Float32Array(4);function Hi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=fc[r];if(s===void 0&&(s=new Float32Array(r),fc[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function Mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Tt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ts(i,e){let t=dc[e];t===void 0&&(t=new Int32Array(e),dc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function sx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ox(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2fv(this.addr,e),Tt(t,e)}}function ax(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;i.uniform3fv(this.addr,e),Tt(t,e)}}function lx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4fv(this.addr,e),Tt(t,e)}}function cx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Tt(t,e)}else{if(Mt(t,n))return;mc.set(n),i.uniformMatrix2fv(this.addr,!1,mc),Tt(t,n)}}function ux(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Tt(t,e)}else{if(Mt(t,n))return;pc.set(n),i.uniformMatrix3fv(this.addr,!1,pc),Tt(t,n)}}function fx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Tt(t,e)}else{if(Mt(t,n))return;hc.set(n),i.uniformMatrix4fv(this.addr,!1,hc),Tt(t,n)}}function dx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function hx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2iv(this.addr,e),Tt(t,e)}}function px(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3iv(this.addr,e),Tt(t,e)}}function mx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4iv(this.addr,e),Tt(t,e)}}function gx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function _x(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2uiv(this.addr,e),Tt(t,e)}}function vx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3uiv(this.addr,e),Tt(t,e)}}function xx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4uiv(this.addr,e),Tt(t,e)}}function Sx(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(uc.compareFunction=su,s=uc):s=xu,t.setTexture2D(e||s,r)}function Ex(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Eu,r)}function yx(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||yu,r)}function Mx(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Su,r)}function Tx(i){switch(i){case 5126:return sx;case 35664:return ox;case 35665:return ax;case 35666:return lx;case 35674:return cx;case 35675:return ux;case 35676:return fx;case 5124:case 35670:return dx;case 35667:case 35671:return hx;case 35668:case 35672:return px;case 35669:case 35673:return mx;case 5125:return gx;case 36294:return _x;case 36295:return vx;case 36296:return xx;case 35678:case 36198:case 36298:case 36306:case 35682:return Sx;case 35679:case 36299:case 36307:return Ex;case 35680:case 36300:case 36308:case 36293:return yx;case 36289:case 36303:case 36311:case 36292:return Mx}}function Ax(i,e){i.uniform1fv(this.addr,e)}function Cx(i,e){const t=Hi(e,this.size,2);i.uniform2fv(this.addr,t)}function wx(i,e){const t=Hi(e,this.size,3);i.uniform3fv(this.addr,t)}function Rx(i,e){const t=Hi(e,this.size,4);i.uniform4fv(this.addr,t)}function bx(i,e){const t=Hi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Px(i,e){const t=Hi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ix(i,e){const t=Hi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Dx(i,e){i.uniform1iv(this.addr,e)}function Ux(i,e){i.uniform2iv(this.addr,e)}function Lx(i,e){i.uniform3iv(this.addr,e)}function Nx(i,e){i.uniform4iv(this.addr,e)}function Fx(i,e){i.uniform1uiv(this.addr,e)}function Ox(i,e){i.uniform2uiv(this.addr,e)}function Bx(i,e){i.uniform3uiv(this.addr,e)}function Vx(i,e){i.uniform4uiv(this.addr,e)}function zx(i,e,t){const n=this.cache,r=e.length,s=Ts(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),Tt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||xu,s[o])}function Hx(i,e,t){const n=this.cache,r=e.length,s=Ts(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),Tt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Eu,s[o])}function kx(i,e,t){const n=this.cache,r=e.length,s=Ts(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),Tt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||yu,s[o])}function Gx(i,e,t){const n=this.cache,r=e.length,s=Ts(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),Tt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Su,s[o])}function Wx(i){switch(i){case 5126:return Ax;case 35664:return Cx;case 35665:return wx;case 35666:return Rx;case 35674:return bx;case 35675:return Px;case 35676:return Ix;case 5124:case 35670:return Dx;case 35667:case 35671:return Ux;case 35668:case 35672:return Lx;case 35669:case 35673:return Nx;case 5125:return Fx;case 36294:return Ox;case 36295:return Bx;case 36296:return Vx;case 35678:case 36198:case 36298:case 36306:case 35682:return zx;case 35679:case 36299:case 36307:return Hx;case 35680:case 36300:case 36308:case 36293:return kx;case 36289:case 36303:case 36311:case 36292:return Gx}}class qx{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Tx(t.type)}}class Xx{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Wx(t.type)}}class $x{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const io=/(\w+)(\])?(\[|\.)?/g;function gc(i,e){i.seq.push(e),i.map[e.id]=e}function Yx(i,e,t){const n=i.name,r=n.length;for(io.lastIndex=0;;){const s=io.exec(n),o=io.lastIndex;let a=s[1];const l=s[2]==="]",f=s[3];if(l&&(a=a|0),f===void 0||f==="["&&o+2===r){gc(t,f===void 0?new qx(a,i,e):new Xx(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new $x(a),gc(t,h)),t=h}}}class ss{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Yx(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function _c(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Kx=37297;let Zx=0;function Jx(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const vc=new Ye;function Qx(i){ot._getMatrix(vc,ot.workingColorSpace,i);const e=`mat3( ${vc.elements.map(t=>t.toFixed(4))} )`;switch(ot.getTransfer(i)){case ds:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function xc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+Jx(i.getShaderSource(e),o)}else return r}function jx(i,e){const t=Qx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function eS(i,e){let t;switch(e){case Zm:t="Linear";break;case Jm:t="Reinhard";break;case Qm:t="Cineon";break;case jm:t="ACESFilmic";break;case tg:t="AgX";break;case ng:t="Neutral";break;case eg:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const $r=new q;function tS(){ot.getLuminanceCoefficients($r);const i=$r.x.toFixed(4),e=$r.y.toFixed(4),t=$r.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function nS(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ji).join(`
`)}function iS(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function rS(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function ji(i){return i!==""}function Sc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ec(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const sS=/^[ \t]*#include +<([\w\d./]+)>/gm;function jo(i){return i.replace(sS,aS)}const oS=new Map;function aS(i,e){let t=Ze[e];if(t===void 0){const n=oS.get(e);if(n!==void 0)t=Ze[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return jo(t)}const lS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yc(i){return i.replace(lS,cS)}function cS(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Mc(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function uS(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Yc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===bm?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===yn&&(e="SHADOWMAP_TYPE_VSM"),e}function fS(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Li:case Ni:e="ENVMAP_TYPE_CUBE";break;case ys:e="ENVMAP_TYPE_CUBE_UV";break}return e}function dS(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ni:e="ENVMAP_MODE_REFRACTION";break}return e}function hS(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Kc:e="ENVMAP_BLENDING_MULTIPLY";break;case Ym:e="ENVMAP_BLENDING_MIX";break;case Km:e="ENVMAP_BLENDING_ADD";break}return e}function pS(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function mS(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=uS(t),f=fS(t),d=dS(t),h=hS(t),p=pS(t),g=nS(t),S=iS(s),y=r.createProgram();let x,m,P=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S].filter(ji).join(`
`),x.length>0&&(x+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S].filter(ji).join(`
`),m.length>0&&(m+=`
`)):(x=[Mc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ji).join(`
`),m=[Mc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kn?"#define TONE_MAPPING":"",t.toneMapping!==kn?Ze.tonemapping_pars_fragment:"",t.toneMapping!==kn?eS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ze.colorspace_pars_fragment,jx("linearToOutputTexel",t.outputColorSpace),tS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ji).join(`
`)),o=jo(o),o=Sc(o,t),o=Ec(o,t),a=jo(a),a=Sc(a,t),a=Ec(a,t),o=yc(o),a=yc(a),t.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,x=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,m=["#define varying in",t.glslVersion===Zo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Zo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const w=P+x+o,T=P+m+a,V=_c(r,r.VERTEX_SHADER,w),F=_c(r,r.FRAGMENT_SHADER,T);r.attachShader(y,V),r.attachShader(y,F),t.index0AttributeName!==void 0?r.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function N(O){if(i.debug.checkShaderErrors){const Z=r.getProgramInfoLog(y).trim(),Y=r.getShaderInfoLog(V).trim(),ie=r.getShaderInfoLog(F).trim();let le=!0,ee=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(le=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,y,V,F);else{const ce=xc(r,V,"vertex"),Q=xc(r,F,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+O.name+`
Material Type: `+O.type+`

Program Info Log: `+Z+`
`+ce+`
`+Q)}else Z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Z):(Y===""||ie==="")&&(ee=!1);ee&&(O.diagnostics={runnable:le,programLog:Z,vertexShader:{log:Y,prefix:x},fragmentShader:{log:ie,prefix:m}})}r.deleteShader(V),r.deleteShader(F),z=new ss(r,y),R=rS(r,y)}let z;this.getUniforms=function(){return z===void 0&&N(this),z};let R;this.getAttributes=function(){return R===void 0&&N(this),R};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=r.getProgramParameter(y,Kx)),M},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Zx++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=V,this.fragmentShader=F,this}let gS=0;class _S{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new vS(e),t.set(e,n)),n}}class vS{constructor(e){this.id=gS++,this.code=e,this.usedTimes=0}}function xS(i,e,t,n,r,s,o){const a=new lu,l=new _S,f=new Set,d=[],h=r.logarithmicDepthBuffer,p=r.vertexTextures;let g=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(R){return f.add(R),R===0?"uv":`uv${R}`}function x(R,M,O,Z,Y){const ie=Z.fog,le=Y.geometry,ee=R.isMeshStandardMaterial?Z.environment:null,ce=(R.isMeshStandardMaterial?t:e).get(R.envMap||ee),Q=ce&&ce.mapping===ys?ce.image.height:null,ge=S[R.type];R.precision!==null&&(g=r.getMaxPrecision(R.precision),g!==R.precision&&console.warn("THREE.WebGLProgram.getParameters:",R.precision,"not supported, using",g,"instead."));const ve=le.morphAttributes.position||le.morphAttributes.normal||le.morphAttributes.color,be=ve!==void 0?ve.length:0;let ze=0;le.morphAttributes.position!==void 0&&(ze=1),le.morphAttributes.normal!==void 0&&(ze=2),le.morphAttributes.color!==void 0&&(ze=3);let Je,j,pe,me;if(ge){const at=dn[ge];Je=at.vertexShader,j=at.fragmentShader}else Je=R.vertexShader,j=R.fragmentShader,l.update(R),pe=l.getVertexShaderID(R),me=l.getFragmentShaderID(R);const _e=i.getRenderTarget(),Pe=i.state.buffers.depth.getReversed(),Qe=Y.isInstancedMesh===!0,He=Y.isBatchedMesh===!0,ft=!!R.map,ct=!!R.matcap,Ke=!!ce,B=!!R.aoMap,Ut=!!R.lightMap,tt=!!R.bumpMap,je=!!R.normalMap,Ne=!!R.displacementMap,dt=!!R.emissiveMap,Ue=!!R.metalnessMap,I=!!R.roughnessMap,E=R.anisotropy>0,X=R.clearcoat>0,re=R.dispersion>0,ue=R.iridescence>0,te=R.sheen>0,Ie=R.transmission>0,Se=E&&!!R.anisotropyMap,Fe=X&&!!R.clearcoatMap,ke=X&&!!R.clearcoatNormalMap,de=X&&!!R.clearcoatRoughnessMap,Te=ue&&!!R.iridescenceMap,Re=ue&&!!R.iridescenceThicknessMap,De=te&&!!R.sheenColorMap,Me=te&&!!R.sheenRoughnessMap,We=!!R.specularMap,Oe=!!R.specularColorMap,qe=!!R.specularIntensityMap,k=Ie&&!!R.transmissionMap,$=Ie&&!!R.thicknessMap,J=!!R.gradientMap,oe=!!R.alphaMap,ye=R.alphaTest>0,Ee=!!R.alphaHash,Xe=!!R.extensions;let mt=kn;R.toneMapped&&(_e===null||_e.isXRRenderTarget===!0)&&(mt=i.toneMapping);const At={shaderID:ge,shaderType:R.type,shaderName:R.name,vertexShader:Je,fragmentShader:j,defines:R.defines,customVertexShaderID:pe,customFragmentShaderID:me,isRawShaderMaterial:R.isRawShaderMaterial===!0,glslVersion:R.glslVersion,precision:g,batching:He,batchingColor:He&&Y._colorsTexture!==null,instancing:Qe,instancingColor:Qe&&Y.instanceColor!==null,instancingMorph:Qe&&Y.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:_e===null?i.outputColorSpace:_e.isXRRenderTarget===!0?_e.texture.colorSpace:Wn,alphaToCoverage:!!R.alphaToCoverage,map:ft,matcap:ct,envMap:Ke,envMapMode:Ke&&ce.mapping,envMapCubeUVHeight:Q,aoMap:B,lightMap:Ut,bumpMap:tt,normalMap:je,displacementMap:p&&Ne,emissiveMap:dt,normalMapObjectSpace:je&&R.normalMapType===og,normalMapTangentSpace:je&&R.normalMapType===ru,metalnessMap:Ue,roughnessMap:I,anisotropy:E,anisotropyMap:Se,clearcoat:X,clearcoatMap:Fe,clearcoatNormalMap:ke,clearcoatRoughnessMap:de,dispersion:re,iridescence:ue,iridescenceMap:Te,iridescenceThicknessMap:Re,sheen:te,sheenColorMap:De,sheenRoughnessMap:Me,specularMap:We,specularColorMap:Oe,specularIntensityMap:qe,transmission:Ie,transmissionMap:k,thicknessMap:$,gradientMap:J,opaque:R.transparent===!1&&R.blending===bi&&R.alphaToCoverage===!1,alphaMap:oe,alphaTest:ye,alphaHash:Ee,combine:R.combine,mapUv:ft&&y(R.map.channel),aoMapUv:B&&y(R.aoMap.channel),lightMapUv:Ut&&y(R.lightMap.channel),bumpMapUv:tt&&y(R.bumpMap.channel),normalMapUv:je&&y(R.normalMap.channel),displacementMapUv:Ne&&y(R.displacementMap.channel),emissiveMapUv:dt&&y(R.emissiveMap.channel),metalnessMapUv:Ue&&y(R.metalnessMap.channel),roughnessMapUv:I&&y(R.roughnessMap.channel),anisotropyMapUv:Se&&y(R.anisotropyMap.channel),clearcoatMapUv:Fe&&y(R.clearcoatMap.channel),clearcoatNormalMapUv:ke&&y(R.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&y(R.clearcoatRoughnessMap.channel),iridescenceMapUv:Te&&y(R.iridescenceMap.channel),iridescenceThicknessMapUv:Re&&y(R.iridescenceThicknessMap.channel),sheenColorMapUv:De&&y(R.sheenColorMap.channel),sheenRoughnessMapUv:Me&&y(R.sheenRoughnessMap.channel),specularMapUv:We&&y(R.specularMap.channel),specularColorMapUv:Oe&&y(R.specularColorMap.channel),specularIntensityMapUv:qe&&y(R.specularIntensityMap.channel),transmissionMapUv:k&&y(R.transmissionMap.channel),thicknessMapUv:$&&y(R.thicknessMap.channel),alphaMapUv:oe&&y(R.alphaMap.channel),vertexTangents:!!le.attributes.tangent&&(je||E),vertexColors:R.vertexColors,vertexAlphas:R.vertexColors===!0&&!!le.attributes.color&&le.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!le.attributes.uv&&(ft||oe),fog:!!ie,useFog:R.fog===!0,fogExp2:!!ie&&ie.isFogExp2,flatShading:R.flatShading===!0,sizeAttenuation:R.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Pe,skinning:Y.isSkinnedMesh===!0,morphTargets:le.morphAttributes.position!==void 0,morphNormals:le.morphAttributes.normal!==void 0,morphColors:le.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:ze,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:R.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:mt,decodeVideoTexture:ft&&R.map.isVideoTexture===!0&&ot.getTransfer(R.map.colorSpace)===ut,decodeVideoTextureEmissive:dt&&R.emissiveMap.isVideoTexture===!0&&ot.getTransfer(R.emissiveMap.colorSpace)===ut,premultipliedAlpha:R.premultipliedAlpha,doubleSided:R.side===Mn,flipSided:R.side===Ot,useDepthPacking:R.depthPacking>=0,depthPacking:R.depthPacking||0,index0AttributeName:R.index0AttributeName,extensionClipCullDistance:Xe&&R.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xe&&R.extensions.multiDraw===!0||He)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:R.customProgramCacheKey()};return At.vertexUv1s=f.has(1),At.vertexUv2s=f.has(2),At.vertexUv3s=f.has(3),f.clear(),At}function m(R){const M=[];if(R.shaderID?M.push(R.shaderID):(M.push(R.customVertexShaderID),M.push(R.customFragmentShaderID)),R.defines!==void 0)for(const O in R.defines)M.push(O),M.push(R.defines[O]);return R.isRawShaderMaterial===!1&&(P(M,R),w(M,R),M.push(i.outputColorSpace)),M.push(R.customProgramCacheKey),M.join()}function P(R,M){R.push(M.precision),R.push(M.outputColorSpace),R.push(M.envMapMode),R.push(M.envMapCubeUVHeight),R.push(M.mapUv),R.push(M.alphaMapUv),R.push(M.lightMapUv),R.push(M.aoMapUv),R.push(M.bumpMapUv),R.push(M.normalMapUv),R.push(M.displacementMapUv),R.push(M.emissiveMapUv),R.push(M.metalnessMapUv),R.push(M.roughnessMapUv),R.push(M.anisotropyMapUv),R.push(M.clearcoatMapUv),R.push(M.clearcoatNormalMapUv),R.push(M.clearcoatRoughnessMapUv),R.push(M.iridescenceMapUv),R.push(M.iridescenceThicknessMapUv),R.push(M.sheenColorMapUv),R.push(M.sheenRoughnessMapUv),R.push(M.specularMapUv),R.push(M.specularColorMapUv),R.push(M.specularIntensityMapUv),R.push(M.transmissionMapUv),R.push(M.thicknessMapUv),R.push(M.combine),R.push(M.fogExp2),R.push(M.sizeAttenuation),R.push(M.morphTargetsCount),R.push(M.morphAttributeCount),R.push(M.numDirLights),R.push(M.numPointLights),R.push(M.numSpotLights),R.push(M.numSpotLightMaps),R.push(M.numHemiLights),R.push(M.numRectAreaLights),R.push(M.numDirLightShadows),R.push(M.numPointLightShadows),R.push(M.numSpotLightShadows),R.push(M.numSpotLightShadowsWithMaps),R.push(M.numLightProbes),R.push(M.shadowMapType),R.push(M.toneMapping),R.push(M.numClippingPlanes),R.push(M.numClipIntersection),R.push(M.depthPacking)}function w(R,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),R.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reverseDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),R.push(a.mask)}function T(R){const M=S[R.type];let O;if(M){const Z=dn[M];O=ms.clone(Z.uniforms)}else O=R.uniforms;return O}function V(R,M){let O;for(let Z=0,Y=d.length;Z<Y;Z++){const ie=d[Z];if(ie.cacheKey===M){O=ie,++O.usedTimes;break}}return O===void 0&&(O=new mS(i,M,R,s),d.push(O)),O}function F(R){if(--R.usedTimes===0){const M=d.indexOf(R);d[M]=d[d.length-1],d.pop(),R.destroy()}}function N(R){l.remove(R)}function z(){l.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:T,acquireProgram:V,releaseProgram:F,releaseShaderCache:N,programs:d,dispose:z}}function SS(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function ES(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Tc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Ac(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(h,p,g,S,y,x){let m=i[e];return m===void 0?(m={id:h.id,object:h,geometry:p,material:g,groupOrder:S,renderOrder:h.renderOrder,z:y,group:x},i[e]=m):(m.id=h.id,m.object=h,m.geometry=p,m.material=g,m.groupOrder=S,m.renderOrder=h.renderOrder,m.z=y,m.group=x),e++,m}function a(h,p,g,S,y,x){const m=o(h,p,g,S,y,x);g.transmission>0?n.push(m):g.transparent===!0?r.push(m):t.push(m)}function l(h,p,g,S,y,x){const m=o(h,p,g,S,y,x);g.transmission>0?n.unshift(m):g.transparent===!0?r.unshift(m):t.unshift(m)}function f(h,p){t.length>1&&t.sort(h||ES),n.length>1&&n.sort(p||Tc),r.length>1&&r.sort(p||Tc)}function d(){for(let h=e,p=i.length;h<p;h++){const g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:d,sort:f}}function yS(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new Ac,i.set(n,[o])):r>=s.length?(o=new Ac,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function MS(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new q,color:new it};break;case"SpotLight":t={position:new q,direction:new q,color:new it,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new q,color:new it,distance:0,decay:0};break;case"HemisphereLight":t={direction:new q,skyColor:new it,groundColor:new it};break;case"RectAreaLight":t={color:new it,position:new q,halfWidth:new q,halfHeight:new q};break}return i[e.id]=t,t}}}function TS(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ge};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ge};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ge,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let AS=0;function CS(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function wS(i){const e=new MS,t=TS(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)n.probe.push(new q);const r=new q,s=new St,o=new St;function a(f){let d=0,h=0,p=0;for(let R=0;R<9;R++)n.probe[R].set(0,0,0);let g=0,S=0,y=0,x=0,m=0,P=0,w=0,T=0,V=0,F=0,N=0;f.sort(CS);for(let R=0,M=f.length;R<M;R++){const O=f[R],Z=O.color,Y=O.intensity,ie=O.distance,le=O.shadow&&O.shadow.map?O.shadow.map.texture:null;if(O.isAmbientLight)d+=Z.r*Y,h+=Z.g*Y,p+=Z.b*Y;else if(O.isLightProbe){for(let ee=0;ee<9;ee++)n.probe[ee].addScaledVector(O.sh.coefficients[ee],Y);N++}else if(O.isDirectionalLight){const ee=e.get(O);if(ee.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){const ce=O.shadow,Q=t.get(O);Q.shadowIntensity=ce.intensity,Q.shadowBias=ce.bias,Q.shadowNormalBias=ce.normalBias,Q.shadowRadius=ce.radius,Q.shadowMapSize=ce.mapSize,n.directionalShadow[g]=Q,n.directionalShadowMap[g]=le,n.directionalShadowMatrix[g]=O.shadow.matrix,P++}n.directional[g]=ee,g++}else if(O.isSpotLight){const ee=e.get(O);ee.position.setFromMatrixPosition(O.matrixWorld),ee.color.copy(Z).multiplyScalar(Y),ee.distance=ie,ee.coneCos=Math.cos(O.angle),ee.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),ee.decay=O.decay,n.spot[y]=ee;const ce=O.shadow;if(O.map&&(n.spotLightMap[V]=O.map,V++,ce.updateMatrices(O),O.castShadow&&F++),n.spotLightMatrix[y]=ce.matrix,O.castShadow){const Q=t.get(O);Q.shadowIntensity=ce.intensity,Q.shadowBias=ce.bias,Q.shadowNormalBias=ce.normalBias,Q.shadowRadius=ce.radius,Q.shadowMapSize=ce.mapSize,n.spotShadow[y]=Q,n.spotShadowMap[y]=le,T++}y++}else if(O.isRectAreaLight){const ee=e.get(O);ee.color.copy(Z).multiplyScalar(Y),ee.halfWidth.set(O.width*.5,0,0),ee.halfHeight.set(0,O.height*.5,0),n.rectArea[x]=ee,x++}else if(O.isPointLight){const ee=e.get(O);if(ee.color.copy(O.color).multiplyScalar(O.intensity),ee.distance=O.distance,ee.decay=O.decay,O.castShadow){const ce=O.shadow,Q=t.get(O);Q.shadowIntensity=ce.intensity,Q.shadowBias=ce.bias,Q.shadowNormalBias=ce.normalBias,Q.shadowRadius=ce.radius,Q.shadowMapSize=ce.mapSize,Q.shadowCameraNear=ce.camera.near,Q.shadowCameraFar=ce.camera.far,n.pointShadow[S]=Q,n.pointShadowMap[S]=le,n.pointShadowMatrix[S]=O.shadow.matrix,w++}n.point[S]=ee,S++}else if(O.isHemisphereLight){const ee=e.get(O);ee.skyColor.copy(O.color).multiplyScalar(Y),ee.groundColor.copy(O.groundColor).multiplyScalar(Y),n.hemi[m]=ee,m++}}x>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=xe.LTC_FLOAT_1,n.rectAreaLTC2=xe.LTC_FLOAT_2):(n.rectAreaLTC1=xe.LTC_HALF_1,n.rectAreaLTC2=xe.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=h,n.ambient[2]=p;const z=n.hash;(z.directionalLength!==g||z.pointLength!==S||z.spotLength!==y||z.rectAreaLength!==x||z.hemiLength!==m||z.numDirectionalShadows!==P||z.numPointShadows!==w||z.numSpotShadows!==T||z.numSpotMaps!==V||z.numLightProbes!==N)&&(n.directional.length=g,n.spot.length=y,n.rectArea.length=x,n.point.length=S,n.hemi.length=m,n.directionalShadow.length=P,n.directionalShadowMap.length=P,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=T,n.spotShadowMap.length=T,n.directionalShadowMatrix.length=P,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=T+V-F,n.spotLightMap.length=V,n.numSpotLightShadowsWithMaps=F,n.numLightProbes=N,z.directionalLength=g,z.pointLength=S,z.spotLength=y,z.rectAreaLength=x,z.hemiLength=m,z.numDirectionalShadows=P,z.numPointShadows=w,z.numSpotShadows=T,z.numSpotMaps=V,z.numLightProbes=N,n.version=AS++)}function l(f,d){let h=0,p=0,g=0,S=0,y=0;const x=d.matrixWorldInverse;for(let m=0,P=f.length;m<P;m++){const w=f[m];if(w.isDirectionalLight){const T=n.directional[h];T.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(x),h++}else if(w.isSpotLight){const T=n.spot[g];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),T.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(x),g++}else if(w.isRectAreaLight){const T=n.rectArea[S];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),o.identity(),s.copy(w.matrixWorld),s.premultiply(x),o.extractRotation(s),T.halfWidth.set(w.width*.5,0,0),T.halfHeight.set(0,w.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),S++}else if(w.isPointLight){const T=n.point[p];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),p++}else if(w.isHemisphereLight){const T=n.hemi[y];T.direction.setFromMatrixPosition(w.matrixWorld),T.direction.transformDirection(x),y++}}}return{setup:a,setupView:l,state:n}}function Cc(i){const e=new wS(i),t=[],n=[];function r(d){f.camera=d,t.length=0,n.length=0}function s(d){t.push(d)}function o(d){n.push(d)}function a(){e.setup(t)}function l(d){e.setupView(t,d)}const f={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:f,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function RS(i){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new Cc(i),e.set(r,[a])):s>=o.length?(a=new Cc(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const bS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,PS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function IS(i,e,t){let n=new mu;const r=new Ge,s=new Ge,o=new gt,a=new Qg({depthPacking:sg}),l=new jg,f={},d=t.maxTextureSize,h={[Gn]:Ot,[Ot]:Gn,[Mn]:Mn},p=new Ft({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ge},radius:{value:4}},vertexShader:bS,fragmentShader:PS}),g=p.clone();g.defines.HORIZONTAL_PASS=1;const S=new In;S.setAttribute("position",new hn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new jt(S,p),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Yc;let m=this.type;this.render=function(F,N,z){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||F.length===0)return;const R=i.getRenderTarget(),M=i.getActiveCubeFace(),O=i.getActiveMipmapLevel(),Z=i.state;Z.setBlending(Rn),Z.buffers.color.setClear(1,1,1,1),Z.buffers.depth.setTest(!0),Z.setScissorTest(!1);const Y=m!==yn&&this.type===yn,ie=m===yn&&this.type!==yn;for(let le=0,ee=F.length;le<ee;le++){const ce=F[le],Q=ce.shadow;if(Q===void 0){console.warn("THREE.WebGLShadowMap:",ce,"has no shadow.");continue}if(Q.autoUpdate===!1&&Q.needsUpdate===!1)continue;r.copy(Q.mapSize);const ge=Q.getFrameExtents();if(r.multiply(ge),s.copy(Q.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(s.x=Math.floor(d/ge.x),r.x=s.x*ge.x,Q.mapSize.x=s.x),r.y>d&&(s.y=Math.floor(d/ge.y),r.y=s.y*ge.y,Q.mapSize.y=s.y)),Q.map===null||Y===!0||ie===!0){const be=this.type!==yn?{minFilter:qt,magFilter:qt}:{};Q.map!==null&&Q.map.dispose(),Q.map=new un(r.x,r.y,be),Q.map.texture.name=ce.name+".shadowMap",Q.camera.updateProjectionMatrix()}i.setRenderTarget(Q.map),i.clear();const ve=Q.getViewportCount();for(let be=0;be<ve;be++){const ze=Q.getViewport(be);o.set(s.x*ze.x,s.y*ze.y,s.x*ze.z,s.y*ze.w),Z.viewport(o),Q.updateMatrices(ce,be),n=Q.getFrustum(),T(N,z,Q.camera,ce,this.type)}Q.isPointLightShadow!==!0&&this.type===yn&&P(Q,z),Q.needsUpdate=!1}m=this.type,x.needsUpdate=!1,i.setRenderTarget(R,M,O)};function P(F,N){const z=e.update(y);p.defines.VSM_SAMPLES!==F.blurSamples&&(p.defines.VSM_SAMPLES=F.blurSamples,g.defines.VSM_SAMPLES=F.blurSamples,p.needsUpdate=!0,g.needsUpdate=!0),F.mapPass===null&&(F.mapPass=new un(r.x,r.y)),p.uniforms.shadow_pass.value=F.map.texture,p.uniforms.resolution.value=F.mapSize,p.uniforms.radius.value=F.radius,i.setRenderTarget(F.mapPass),i.clear(),i.renderBufferDirect(N,null,z,p,y,null),g.uniforms.shadow_pass.value=F.mapPass.texture,g.uniforms.resolution.value=F.mapSize,g.uniforms.radius.value=F.radius,i.setRenderTarget(F.map),i.clear(),i.renderBufferDirect(N,null,z,g,y,null)}function w(F,N,z,R){let M=null;const O=z.isPointLight===!0?F.customDistanceMaterial:F.customDepthMaterial;if(O!==void 0)M=O;else if(M=z.isPointLight===!0?l:a,i.localClippingEnabled&&N.clipShadows===!0&&Array.isArray(N.clippingPlanes)&&N.clippingPlanes.length!==0||N.displacementMap&&N.displacementScale!==0||N.alphaMap&&N.alphaTest>0||N.map&&N.alphaTest>0||N.alphaToCoverage===!0){const Z=M.uuid,Y=N.uuid;let ie=f[Z];ie===void 0&&(ie={},f[Z]=ie);let le=ie[Y];le===void 0&&(le=M.clone(),ie[Y]=le,N.addEventListener("dispose",V)),M=le}if(M.visible=N.visible,M.wireframe=N.wireframe,R===yn?M.side=N.shadowSide!==null?N.shadowSide:N.side:M.side=N.shadowSide!==null?N.shadowSide:h[N.side],M.alphaMap=N.alphaMap,M.alphaTest=N.alphaToCoverage===!0?.5:N.alphaTest,M.map=N.map,M.clipShadows=N.clipShadows,M.clippingPlanes=N.clippingPlanes,M.clipIntersection=N.clipIntersection,M.displacementMap=N.displacementMap,M.displacementScale=N.displacementScale,M.displacementBias=N.displacementBias,M.wireframeLinewidth=N.wireframeLinewidth,M.linewidth=N.linewidth,z.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const Z=i.properties.get(M);Z.light=z}return M}function T(F,N,z,R,M){if(F.visible===!1)return;if(F.layers.test(N.layers)&&(F.isMesh||F.isLine||F.isPoints)&&(F.castShadow||F.receiveShadow&&M===yn)&&(!F.frustumCulled||n.intersectsObject(F))){F.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,F.matrixWorld);const Y=e.update(F),ie=F.material;if(Array.isArray(ie)){const le=Y.groups;for(let ee=0,ce=le.length;ee<ce;ee++){const Q=le[ee],ge=ie[Q.materialIndex];if(ge&&ge.visible){const ve=w(F,ge,R,M);F.onBeforeShadow(i,F,N,z,Y,ve,Q),i.renderBufferDirect(z,null,Y,ve,F,Q),F.onAfterShadow(i,F,N,z,Y,ve,Q)}}}else if(ie.visible){const le=w(F,ie,R,M);F.onBeforeShadow(i,F,N,z,Y,le,null),i.renderBufferDirect(z,null,Y,le,F,null),F.onAfterShadow(i,F,N,z,Y,le,null)}}const Z=F.children;for(let Y=0,ie=Z.length;Y<ie;Y++)T(Z[Y],N,z,R,M)}function V(F){F.target.removeEventListener("dispose",V);for(const z in f){const R=f[z],M=F.target.uuid;M in R&&(R[M].dispose(),delete R[M])}}}const DS={[po]:mo,[go]:xo,[_o]:So,[Ui]:vo,[mo]:po,[xo]:go,[So]:_o,[vo]:Ui};function US(i,e){function t(){let k=!1;const $=new gt;let J=null;const oe=new gt(0,0,0,0);return{setMask:function(ye){J!==ye&&!k&&(i.colorMask(ye,ye,ye,ye),J=ye)},setLocked:function(ye){k=ye},setClear:function(ye,Ee,Xe,mt,At){At===!0&&(ye*=mt,Ee*=mt,Xe*=mt),$.set(ye,Ee,Xe,mt),oe.equals($)===!1&&(i.clearColor(ye,Ee,Xe,mt),oe.copy($))},reset:function(){k=!1,J=null,oe.set(-1,0,0,0)}}}function n(){let k=!1,$=!1,J=null,oe=null,ye=null;return{setReversed:function(Ee){if($!==Ee){const Xe=e.get("EXT_clip_control");Ee?Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.ZERO_TO_ONE_EXT):Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.NEGATIVE_ONE_TO_ONE_EXT),$=Ee;const mt=ye;ye=null,this.setClear(mt)}},getReversed:function(){return $},setTest:function(Ee){Ee?_e(i.DEPTH_TEST):Pe(i.DEPTH_TEST)},setMask:function(Ee){J!==Ee&&!k&&(i.depthMask(Ee),J=Ee)},setFunc:function(Ee){if($&&(Ee=DS[Ee]),oe!==Ee){switch(Ee){case po:i.depthFunc(i.NEVER);break;case mo:i.depthFunc(i.ALWAYS);break;case go:i.depthFunc(i.LESS);break;case Ui:i.depthFunc(i.LEQUAL);break;case _o:i.depthFunc(i.EQUAL);break;case vo:i.depthFunc(i.GEQUAL);break;case xo:i.depthFunc(i.GREATER);break;case So:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}oe=Ee}},setLocked:function(Ee){k=Ee},setClear:function(Ee){ye!==Ee&&($&&(Ee=1-Ee),i.clearDepth(Ee),ye=Ee)},reset:function(){k=!1,J=null,oe=null,ye=null,$=!1}}}function r(){let k=!1,$=null,J=null,oe=null,ye=null,Ee=null,Xe=null,mt=null,At=null;return{setTest:function(at){k||(at?_e(i.STENCIL_TEST):Pe(i.STENCIL_TEST))},setMask:function(at){$!==at&&!k&&(i.stencilMask(at),$=at)},setFunc:function(at,Ht,nn){(J!==at||oe!==Ht||ye!==nn)&&(i.stencilFunc(at,Ht,nn),J=at,oe=Ht,ye=nn)},setOp:function(at,Ht,nn){(Ee!==at||Xe!==Ht||mt!==nn)&&(i.stencilOp(at,Ht,nn),Ee=at,Xe=Ht,mt=nn)},setLocked:function(at){k=at},setClear:function(at){At!==at&&(i.clearStencil(at),At=at)},reset:function(){k=!1,$=null,J=null,oe=null,ye=null,Ee=null,Xe=null,mt=null,At=null}}}const s=new t,o=new n,a=new r,l=new WeakMap,f=new WeakMap;let d={},h={},p=new WeakMap,g=[],S=null,y=!1,x=null,m=null,P=null,w=null,T=null,V=null,F=null,N=new it(0,0,0),z=0,R=!1,M=null,O=null,Z=null,Y=null,ie=null;const le=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let ee=!1,ce=0;const Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?(ce=parseFloat(/^WebGL (\d)/.exec(Q)[1]),ee=ce>=1):Q.indexOf("OpenGL ES")!==-1&&(ce=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),ee=ce>=2);let ge=null,ve={};const be=i.getParameter(i.SCISSOR_BOX),ze=i.getParameter(i.VIEWPORT),Je=new gt().fromArray(be),j=new gt().fromArray(ze);function pe(k,$,J,oe){const ye=new Uint8Array(4),Ee=i.createTexture();i.bindTexture(k,Ee),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Xe=0;Xe<J;Xe++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D($,0,i.RGBA,1,1,oe,0,i.RGBA,i.UNSIGNED_BYTE,ye):i.texImage2D($+Xe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ye);return Ee}const me={};me[i.TEXTURE_2D]=pe(i.TEXTURE_2D,i.TEXTURE_2D,1),me[i.TEXTURE_CUBE_MAP]=pe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),me[i.TEXTURE_2D_ARRAY]=pe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),me[i.TEXTURE_3D]=pe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),_e(i.DEPTH_TEST),o.setFunc(Ui),tt(!1),je(Dl),_e(i.CULL_FACE),B(Rn);function _e(k){d[k]!==!0&&(i.enable(k),d[k]=!0)}function Pe(k){d[k]!==!1&&(i.disable(k),d[k]=!1)}function Qe(k,$){return h[k]!==$?(i.bindFramebuffer(k,$),h[k]=$,k===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=$),k===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=$),!0):!1}function He(k,$){let J=g,oe=!1;if(k){J=p.get($),J===void 0&&(J=[],p.set($,J));const ye=k.textures;if(J.length!==ye.length||J[0]!==i.COLOR_ATTACHMENT0){for(let Ee=0,Xe=ye.length;Ee<Xe;Ee++)J[Ee]=i.COLOR_ATTACHMENT0+Ee;J.length=ye.length,oe=!0}}else J[0]!==i.BACK&&(J[0]=i.BACK,oe=!0);oe&&i.drawBuffers(J)}function ft(k){return S!==k?(i.useProgram(k),S=k,!0):!1}const ct={[ri]:i.FUNC_ADD,[Im]:i.FUNC_SUBTRACT,[Dm]:i.FUNC_REVERSE_SUBTRACT};ct[Um]=i.MIN,ct[Lm]=i.MAX;const Ke={[Nm]:i.ZERO,[Fm]:i.ONE,[Om]:i.SRC_COLOR,[fo]:i.SRC_ALPHA,[Gm]:i.SRC_ALPHA_SATURATE,[Hm]:i.DST_COLOR,[Vm]:i.DST_ALPHA,[Bm]:i.ONE_MINUS_SRC_COLOR,[ho]:i.ONE_MINUS_SRC_ALPHA,[km]:i.ONE_MINUS_DST_COLOR,[zm]:i.ONE_MINUS_DST_ALPHA,[Wm]:i.CONSTANT_COLOR,[qm]:i.ONE_MINUS_CONSTANT_COLOR,[Xm]:i.CONSTANT_ALPHA,[$m]:i.ONE_MINUS_CONSTANT_ALPHA};function B(k,$,J,oe,ye,Ee,Xe,mt,At,at){if(k===Rn){y===!0&&(Pe(i.BLEND),y=!1);return}if(y===!1&&(_e(i.BLEND),y=!0),k!==Pm){if(k!==x||at!==R){if((m!==ri||T!==ri)&&(i.blendEquation(i.FUNC_ADD),m=ri,T=ri),at)switch(k){case bi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case uo:i.blendFunc(i.ONE,i.ONE);break;case Ul:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ll:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}else switch(k){case bi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case uo:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Ul:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ll:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}P=null,w=null,V=null,F=null,N.set(0,0,0),z=0,x=k,R=at}return}ye=ye||$,Ee=Ee||J,Xe=Xe||oe,($!==m||ye!==T)&&(i.blendEquationSeparate(ct[$],ct[ye]),m=$,T=ye),(J!==P||oe!==w||Ee!==V||Xe!==F)&&(i.blendFuncSeparate(Ke[J],Ke[oe],Ke[Ee],Ke[Xe]),P=J,w=oe,V=Ee,F=Xe),(mt.equals(N)===!1||At!==z)&&(i.blendColor(mt.r,mt.g,mt.b,At),N.copy(mt),z=At),x=k,R=!1}function Ut(k,$){k.side===Mn?Pe(i.CULL_FACE):_e(i.CULL_FACE);let J=k.side===Ot;$&&(J=!J),tt(J),k.blending===bi&&k.transparent===!1?B(Rn):B(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),o.setFunc(k.depthFunc),o.setTest(k.depthTest),o.setMask(k.depthWrite),s.setMask(k.colorWrite);const oe=k.stencilWrite;a.setTest(oe),oe&&(a.setMask(k.stencilWriteMask),a.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),a.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),dt(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?_e(i.SAMPLE_ALPHA_TO_COVERAGE):Pe(i.SAMPLE_ALPHA_TO_COVERAGE)}function tt(k){M!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),M=k)}function je(k){k!==wm?(_e(i.CULL_FACE),k!==O&&(k===Dl?i.cullFace(i.BACK):k===Rm?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Pe(i.CULL_FACE),O=k}function Ne(k){k!==Z&&(ee&&i.lineWidth(k),Z=k)}function dt(k,$,J){k?(_e(i.POLYGON_OFFSET_FILL),(Y!==$||ie!==J)&&(i.polygonOffset($,J),Y=$,ie=J)):Pe(i.POLYGON_OFFSET_FILL)}function Ue(k){k?_e(i.SCISSOR_TEST):Pe(i.SCISSOR_TEST)}function I(k){k===void 0&&(k=i.TEXTURE0+le-1),ge!==k&&(i.activeTexture(k),ge=k)}function E(k,$,J){J===void 0&&(ge===null?J=i.TEXTURE0+le-1:J=ge);let oe=ve[J];oe===void 0&&(oe={type:void 0,texture:void 0},ve[J]=oe),(oe.type!==k||oe.texture!==$)&&(ge!==J&&(i.activeTexture(J),ge=J),i.bindTexture(k,$||me[k]),oe.type=k,oe.texture=$)}function X(){const k=ve[ge];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function re(){try{i.compressedTexImage2D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ue(){try{i.compressedTexImage3D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function te(){try{i.texSubImage2D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Ie(){try{i.texSubImage3D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Se(){try{i.compressedTexSubImage2D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Fe(){try{i.compressedTexSubImage3D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ke(){try{i.texStorage2D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function de(){try{i.texStorage3D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Te(){try{i.texImage2D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Re(){try{i.texImage3D(...arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function De(k){Je.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),Je.copy(k))}function Me(k){j.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),j.copy(k))}function We(k,$){let J=f.get($);J===void 0&&(J=new WeakMap,f.set($,J));let oe=J.get(k);oe===void 0&&(oe=i.getUniformBlockIndex($,k.name),J.set(k,oe))}function Oe(k,$){const oe=f.get($).get(k);l.get($)!==oe&&(i.uniformBlockBinding($,oe,k.__bindingPointIndex),l.set($,oe))}function qe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},ge=null,ve={},h={},p=new WeakMap,g=[],S=null,y=!1,x=null,m=null,P=null,w=null,T=null,V=null,F=null,N=new it(0,0,0),z=0,R=!1,M=null,O=null,Z=null,Y=null,ie=null,Je.set(0,0,i.canvas.width,i.canvas.height),j.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:_e,disable:Pe,bindFramebuffer:Qe,drawBuffers:He,useProgram:ft,setBlending:B,setMaterial:Ut,setFlipSided:tt,setCullFace:je,setLineWidth:Ne,setPolygonOffset:dt,setScissorTest:Ue,activeTexture:I,bindTexture:E,unbindTexture:X,compressedTexImage2D:re,compressedTexImage3D:ue,texImage2D:Te,texImage3D:Re,updateUBOMapping:We,uniformBlockBinding:Oe,texStorage2D:ke,texStorage3D:de,texSubImage2D:te,texSubImage3D:Ie,compressedTexSubImage2D:Se,compressedTexSubImage3D:Fe,scissor:De,viewport:Me,reset:qe}}function LS(i,e,t,n,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new Ge,d=new WeakMap;let h;const p=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(I,E){return g?new OffscreenCanvas(I,E):ps("canvas")}function y(I,E,X){let re=1;const ue=Ue(I);if((ue.width>X||ue.height>X)&&(re=X/Math.max(ue.width,ue.height)),re<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){const te=Math.floor(re*ue.width),Ie=Math.floor(re*ue.height);h===void 0&&(h=S(te,Ie));const Se=E?S(te,Ie):h;return Se.width=te,Se.height=Ie,Se.getContext("2d").drawImage(I,0,0,te,Ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ue.width+"x"+ue.height+") to ("+te+"x"+Ie+")."),Se}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ue.width+"x"+ue.height+")."),I;return I}function x(I){return I.generateMipmaps}function m(I){i.generateMipmap(I)}function P(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(I,E,X,re,ue=!1){if(I!==null){if(i[I]!==void 0)return i[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let te=E;if(E===i.RED&&(X===i.FLOAT&&(te=i.R32F),X===i.HALF_FLOAT&&(te=i.R16F),X===i.UNSIGNED_BYTE&&(te=i.R8)),E===i.RED_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.R8UI),X===i.UNSIGNED_SHORT&&(te=i.R16UI),X===i.UNSIGNED_INT&&(te=i.R32UI),X===i.BYTE&&(te=i.R8I),X===i.SHORT&&(te=i.R16I),X===i.INT&&(te=i.R32I)),E===i.RG&&(X===i.FLOAT&&(te=i.RG32F),X===i.HALF_FLOAT&&(te=i.RG16F),X===i.UNSIGNED_BYTE&&(te=i.RG8)),E===i.RG_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.RG8UI),X===i.UNSIGNED_SHORT&&(te=i.RG16UI),X===i.UNSIGNED_INT&&(te=i.RG32UI),X===i.BYTE&&(te=i.RG8I),X===i.SHORT&&(te=i.RG16I),X===i.INT&&(te=i.RG32I)),E===i.RGB_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.RGB8UI),X===i.UNSIGNED_SHORT&&(te=i.RGB16UI),X===i.UNSIGNED_INT&&(te=i.RGB32UI),X===i.BYTE&&(te=i.RGB8I),X===i.SHORT&&(te=i.RGB16I),X===i.INT&&(te=i.RGB32I)),E===i.RGBA_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.RGBA8UI),X===i.UNSIGNED_SHORT&&(te=i.RGBA16UI),X===i.UNSIGNED_INT&&(te=i.RGBA32UI),X===i.BYTE&&(te=i.RGBA8I),X===i.SHORT&&(te=i.RGBA16I),X===i.INT&&(te=i.RGBA32I)),E===i.RGB&&X===i.UNSIGNED_INT_5_9_9_9_REV&&(te=i.RGB9_E5),E===i.RGBA){const Ie=ue?ds:ot.getTransfer(re);X===i.FLOAT&&(te=i.RGBA32F),X===i.HALF_FLOAT&&(te=i.RGBA16F),X===i.UNSIGNED_BYTE&&(te=Ie===ut?i.SRGB8_ALPHA8:i.RGBA8),X===i.UNSIGNED_SHORT_4_4_4_4&&(te=i.RGBA4),X===i.UNSIGNED_SHORT_5_5_5_1&&(te=i.RGB5_A1)}return(te===i.R16F||te===i.R32F||te===i.RG16F||te===i.RG32F||te===i.RGBA16F||te===i.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function T(I,E){let X;return I?E===null||E===li||E===ar?X=i.DEPTH24_STENCIL8:E===Jt?X=i.DEPTH32F_STENCIL8:E===or&&(X=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===li||E===ar?X=i.DEPTH_COMPONENT24:E===Jt?X=i.DEPTH_COMPONENT32F:E===or&&(X=i.DEPTH_COMPONENT16),X}function V(I,E){return x(I)===!0||I.isFramebufferTexture&&I.minFilter!==qt&&I.minFilter!==Nt?Math.log2(Math.max(E.width,E.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?E.mipmaps.length:1}function F(I){const E=I.target;E.removeEventListener("dispose",F),z(E),E.isVideoTexture&&d.delete(E)}function N(I){const E=I.target;E.removeEventListener("dispose",N),M(E)}function z(I){const E=n.get(I);if(E.__webglInit===void 0)return;const X=I.source,re=p.get(X);if(re){const ue=re[E.__cacheKey];ue.usedTimes--,ue.usedTimes===0&&R(I),Object.keys(re).length===0&&p.delete(X)}n.remove(I)}function R(I){const E=n.get(I);i.deleteTexture(E.__webglTexture);const X=I.source,re=p.get(X);delete re[E.__cacheKey],o.memory.textures--}function M(I){const E=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let re=0;re<6;re++){if(Array.isArray(E.__webglFramebuffer[re]))for(let ue=0;ue<E.__webglFramebuffer[re].length;ue++)i.deleteFramebuffer(E.__webglFramebuffer[re][ue]);else i.deleteFramebuffer(E.__webglFramebuffer[re]);E.__webglDepthbuffer&&i.deleteRenderbuffer(E.__webglDepthbuffer[re])}else{if(Array.isArray(E.__webglFramebuffer))for(let re=0;re<E.__webglFramebuffer.length;re++)i.deleteFramebuffer(E.__webglFramebuffer[re]);else i.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&i.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&i.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let re=0;re<E.__webglColorRenderbuffer.length;re++)E.__webglColorRenderbuffer[re]&&i.deleteRenderbuffer(E.__webglColorRenderbuffer[re]);E.__webglDepthRenderbuffer&&i.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const X=I.textures;for(let re=0,ue=X.length;re<ue;re++){const te=n.get(X[re]);te.__webglTexture&&(i.deleteTexture(te.__webglTexture),o.memory.textures--),n.remove(X[re])}n.remove(I)}let O=0;function Z(){O=0}function Y(){const I=O;return I>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+r.maxTextures),O+=1,I}function ie(I){const E=[];return E.push(I.wrapS),E.push(I.wrapT),E.push(I.wrapR||0),E.push(I.magFilter),E.push(I.minFilter),E.push(I.anisotropy),E.push(I.internalFormat),E.push(I.format),E.push(I.type),E.push(I.generateMipmaps),E.push(I.premultiplyAlpha),E.push(I.flipY),E.push(I.unpackAlignment),E.push(I.colorSpace),E.join()}function le(I,E){const X=n.get(I);if(I.isVideoTexture&&Ne(I),I.isRenderTargetTexture===!1&&I.version>0&&X.__version!==I.version){const re=I.image;if(re===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(X,I,E);return}}t.bindTexture(i.TEXTURE_2D,X.__webglTexture,i.TEXTURE0+E)}function ee(I,E){const X=n.get(I);if(I.version>0&&X.__version!==I.version){j(X,I,E);return}t.bindTexture(i.TEXTURE_2D_ARRAY,X.__webglTexture,i.TEXTURE0+E)}function ce(I,E){const X=n.get(I);if(I.version>0&&X.__version!==I.version){j(X,I,E);return}t.bindTexture(i.TEXTURE_3D,X.__webglTexture,i.TEXTURE0+E)}function Q(I,E){const X=n.get(I);if(I.version>0&&X.__version!==I.version){pe(X,I,E);return}t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture,i.TEXTURE0+E)}const ge={[yo]:i.REPEAT,[Cn]:i.CLAMP_TO_EDGE,[Mo]:i.MIRRORED_REPEAT},ve={[qt]:i.NEAREST,[ig]:i.NEAREST_MIPMAP_NEAREST,[Cr]:i.NEAREST_MIPMAP_LINEAR,[Nt]:i.LINEAR,[Rs]:i.LINEAR_MIPMAP_NEAREST,[Hn]:i.LINEAR_MIPMAP_LINEAR},be={[ag]:i.NEVER,[hg]:i.ALWAYS,[lg]:i.LESS,[su]:i.LEQUAL,[cg]:i.EQUAL,[dg]:i.GEQUAL,[ug]:i.GREATER,[fg]:i.NOTEQUAL};function ze(I,E){if(E.type===Jt&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===Nt||E.magFilter===Rs||E.magFilter===Cr||E.magFilter===Hn||E.minFilter===Nt||E.minFilter===Rs||E.minFilter===Cr||E.minFilter===Hn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,ge[E.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,ge[E.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,ge[E.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,ve[E.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,ve[E.minFilter]),E.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,be[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===qt||E.minFilter!==Cr&&E.minFilter!==Hn||E.type===Jt&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||n.get(E).__currentAnisotropy){const X=e.get("EXT_texture_filter_anisotropic");i.texParameterf(I,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,r.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy}}}function Je(I,E){let X=!1;I.__webglInit===void 0&&(I.__webglInit=!0,E.addEventListener("dispose",F));const re=E.source;let ue=p.get(re);ue===void 0&&(ue={},p.set(re,ue));const te=ie(E);if(te!==I.__cacheKey){ue[te]===void 0&&(ue[te]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,X=!0),ue[te].usedTimes++;const Ie=ue[I.__cacheKey];Ie!==void 0&&(ue[I.__cacheKey].usedTimes--,Ie.usedTimes===0&&R(E)),I.__cacheKey=te,I.__webglTexture=ue[te].texture}return X}function j(I,E,X){let re=i.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(re=i.TEXTURE_2D_ARRAY),E.isData3DTexture&&(re=i.TEXTURE_3D);const ue=Je(I,E),te=E.source;t.bindTexture(re,I.__webglTexture,i.TEXTURE0+X);const Ie=n.get(te);if(te.version!==Ie.__version||ue===!0){t.activeTexture(i.TEXTURE0+X);const Se=ot.getPrimaries(ot.workingColorSpace),Fe=E.colorSpace===Tn?null:ot.getPrimaries(E.colorSpace),ke=E.colorSpace===Tn||Se===Fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke);let de=y(E.image,!1,r.maxTextureSize);de=dt(E,de);const Te=s.convert(E.format,E.colorSpace),Re=s.convert(E.type);let De=w(E.internalFormat,Te,Re,E.colorSpace,E.isVideoTexture);ze(re,E);let Me;const We=E.mipmaps,Oe=E.isVideoTexture!==!0,qe=Ie.__version===void 0||ue===!0,k=te.dataReady,$=V(E,de);if(E.isDepthTexture)De=T(E.format===cr,E.type),qe&&(Oe?t.texStorage2D(i.TEXTURE_2D,1,De,de.width,de.height):t.texImage2D(i.TEXTURE_2D,0,De,de.width,de.height,0,Te,Re,null));else if(E.isDataTexture)if(We.length>0){Oe&&qe&&t.texStorage2D(i.TEXTURE_2D,$,De,We[0].width,We[0].height);for(let J=0,oe=We.length;J<oe;J++)Me=We[J],Oe?k&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,Me.width,Me.height,Te,Re,Me.data):t.texImage2D(i.TEXTURE_2D,J,De,Me.width,Me.height,0,Te,Re,Me.data);E.generateMipmaps=!1}else Oe?(qe&&t.texStorage2D(i.TEXTURE_2D,$,De,de.width,de.height),k&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,de.width,de.height,Te,Re,de.data)):t.texImage2D(i.TEXTURE_2D,0,De,de.width,de.height,0,Te,Re,de.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Oe&&qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,$,De,We[0].width,We[0].height,de.depth);for(let J=0,oe=We.length;J<oe;J++)if(Me=We[J],E.format!==Qt)if(Te!==null)if(Oe){if(k)if(E.layerUpdates.size>0){const ye=ic(Me.width,Me.height,E.format,E.type);for(const Ee of E.layerUpdates){const Xe=Me.data.subarray(Ee*ye/Me.data.BYTES_PER_ELEMENT,(Ee+1)*ye/Me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,Ee,Me.width,Me.height,1,Te,Xe)}E.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,Me.width,Me.height,de.depth,Te,Me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,J,De,Me.width,Me.height,de.depth,0,Me.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?k&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,Me.width,Me.height,de.depth,Te,Re,Me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,J,De,Me.width,Me.height,de.depth,0,Te,Re,Me.data)}else{Oe&&qe&&t.texStorage2D(i.TEXTURE_2D,$,De,We[0].width,We[0].height);for(let J=0,oe=We.length;J<oe;J++)Me=We[J],E.format!==Qt?Te!==null?Oe?k&&t.compressedTexSubImage2D(i.TEXTURE_2D,J,0,0,Me.width,Me.height,Te,Me.data):t.compressedTexImage2D(i.TEXTURE_2D,J,De,Me.width,Me.height,0,Me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?k&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,Me.width,Me.height,Te,Re,Me.data):t.texImage2D(i.TEXTURE_2D,J,De,Me.width,Me.height,0,Te,Re,Me.data)}else if(E.isDataArrayTexture)if(Oe){if(qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,$,De,de.width,de.height,de.depth),k)if(E.layerUpdates.size>0){const J=ic(de.width,de.height,E.format,E.type);for(const oe of E.layerUpdates){const ye=de.data.subarray(oe*J/de.data.BYTES_PER_ELEMENT,(oe+1)*J/de.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,oe,de.width,de.height,1,Te,Re,ye)}E.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,de.width,de.height,de.depth,Te,Re,de.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,De,de.width,de.height,de.depth,0,Te,Re,de.data);else if(E.isData3DTexture)Oe?(qe&&t.texStorage3D(i.TEXTURE_3D,$,De,de.width,de.height,de.depth),k&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,de.width,de.height,de.depth,Te,Re,de.data)):t.texImage3D(i.TEXTURE_3D,0,De,de.width,de.height,de.depth,0,Te,Re,de.data);else if(E.isFramebufferTexture){if(qe)if(Oe)t.texStorage2D(i.TEXTURE_2D,$,De,de.width,de.height);else{let J=de.width,oe=de.height;for(let ye=0;ye<$;ye++)t.texImage2D(i.TEXTURE_2D,ye,De,J,oe,0,Te,Re,null),J>>=1,oe>>=1}}else if(We.length>0){if(Oe&&qe){const J=Ue(We[0]);t.texStorage2D(i.TEXTURE_2D,$,De,J.width,J.height)}for(let J=0,oe=We.length;J<oe;J++)Me=We[J],Oe?k&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,Te,Re,Me):t.texImage2D(i.TEXTURE_2D,J,De,Te,Re,Me);E.generateMipmaps=!1}else if(Oe){if(qe){const J=Ue(de);t.texStorage2D(i.TEXTURE_2D,$,De,J.width,J.height)}k&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Te,Re,de)}else t.texImage2D(i.TEXTURE_2D,0,De,Te,Re,de);x(E)&&m(re),Ie.__version=te.version,E.onUpdate&&E.onUpdate(E)}I.__version=E.version}function pe(I,E,X){if(E.image.length!==6)return;const re=Je(I,E),ue=E.source;t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+X);const te=n.get(ue);if(ue.version!==te.__version||re===!0){t.activeTexture(i.TEXTURE0+X);const Ie=ot.getPrimaries(ot.workingColorSpace),Se=E.colorSpace===Tn?null:ot.getPrimaries(E.colorSpace),Fe=E.colorSpace===Tn||Ie===Se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Fe);const ke=E.isCompressedTexture||E.image[0].isCompressedTexture,de=E.image[0]&&E.image[0].isDataTexture,Te=[];for(let oe=0;oe<6;oe++)!ke&&!de?Te[oe]=y(E.image[oe],!0,r.maxCubemapSize):Te[oe]=de?E.image[oe].image:E.image[oe],Te[oe]=dt(E,Te[oe]);const Re=Te[0],De=s.convert(E.format,E.colorSpace),Me=s.convert(E.type),We=w(E.internalFormat,De,Me,E.colorSpace),Oe=E.isVideoTexture!==!0,qe=te.__version===void 0||re===!0,k=ue.dataReady;let $=V(E,Re);ze(i.TEXTURE_CUBE_MAP,E);let J;if(ke){Oe&&qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,$,We,Re.width,Re.height);for(let oe=0;oe<6;oe++){J=Te[oe].mipmaps;for(let ye=0;ye<J.length;ye++){const Ee=J[ye];E.format!==Qt?De!==null?Oe?k&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye,0,0,Ee.width,Ee.height,De,Ee.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye,We,Ee.width,Ee.height,0,Ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Oe?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye,0,0,Ee.width,Ee.height,De,Me,Ee.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye,We,Ee.width,Ee.height,0,De,Me,Ee.data)}}}else{if(J=E.mipmaps,Oe&&qe){J.length>0&&$++;const oe=Ue(Te[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,$,We,oe.width,oe.height)}for(let oe=0;oe<6;oe++)if(de){Oe?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,Te[oe].width,Te[oe].height,De,Me,Te[oe].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,We,Te[oe].width,Te[oe].height,0,De,Me,Te[oe].data);for(let ye=0;ye<J.length;ye++){const Xe=J[ye].image[oe].image;Oe?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye+1,0,0,Xe.width,Xe.height,De,Me,Xe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye+1,We,Xe.width,Xe.height,0,De,Me,Xe.data)}}else{Oe?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,De,Me,Te[oe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,We,De,Me,Te[oe]);for(let ye=0;ye<J.length;ye++){const Ee=J[ye];Oe?k&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye+1,0,0,De,Me,Ee.image[oe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ye+1,We,De,Me,Ee.image[oe])}}}x(E)&&m(i.TEXTURE_CUBE_MAP),te.__version=ue.version,E.onUpdate&&E.onUpdate(E)}I.__version=E.version}function me(I,E,X,re,ue,te){const Ie=s.convert(X.format,X.colorSpace),Se=s.convert(X.type),Fe=w(X.internalFormat,Ie,Se,X.colorSpace),ke=n.get(E),de=n.get(X);if(de.__renderTarget=E,!ke.__hasExternalTextures){const Te=Math.max(1,E.width>>te),Re=Math.max(1,E.height>>te);ue===i.TEXTURE_3D||ue===i.TEXTURE_2D_ARRAY?t.texImage3D(ue,te,Fe,Te,Re,E.depth,0,Ie,Se,null):t.texImage2D(ue,te,Fe,Te,Re,0,Ie,Se,null)}t.bindFramebuffer(i.FRAMEBUFFER,I),je(E)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,re,ue,de.__webglTexture,0,tt(E)):(ue===i.TEXTURE_2D||ue>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ue<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,re,ue,de.__webglTexture,te),t.bindFramebuffer(i.FRAMEBUFFER,null)}function _e(I,E,X){if(i.bindRenderbuffer(i.RENDERBUFFER,I),E.depthBuffer){const re=E.depthTexture,ue=re&&re.isDepthTexture?re.type:null,te=T(E.stencilBuffer,ue),Ie=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=tt(E);je(E)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Se,te,E.width,E.height):X?i.renderbufferStorageMultisample(i.RENDERBUFFER,Se,te,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,te,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ie,i.RENDERBUFFER,I)}else{const re=E.textures;for(let ue=0;ue<re.length;ue++){const te=re[ue],Ie=s.convert(te.format,te.colorSpace),Se=s.convert(te.type),Fe=w(te.internalFormat,Ie,Se,te.colorSpace),ke=tt(E);X&&je(E)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke,Fe,E.width,E.height):je(E)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke,Fe,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,Fe,E.width,E.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Pe(I,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,I),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const re=n.get(E.depthTexture);re.__renderTarget=E,(!re.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),le(E.depthTexture,0);const ue=re.__webglTexture,te=tt(E);if(E.depthTexture.format===lr)je(E)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ue,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ue,0);else if(E.depthTexture.format===cr)je(E)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ue,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ue,0);else throw new Error("Unknown depthTexture format")}function Qe(I){const E=n.get(I),X=I.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==I.depthTexture){const re=I.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),re){const ue=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,re.removeEventListener("dispose",ue)};re.addEventListener("dispose",ue),E.__depthDisposeCallback=ue}E.__boundDepthTexture=re}if(I.depthTexture&&!E.__autoAllocateDepthBuffer){if(X)throw new Error("target.depthTexture not supported in Cube render targets");const re=I.texture.mipmaps;re&&re.length>0?Pe(E.__webglFramebuffer[0],I):Pe(E.__webglFramebuffer,I)}else if(X){E.__webglDepthbuffer=[];for(let re=0;re<6;re++)if(t.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer[re]),E.__webglDepthbuffer[re]===void 0)E.__webglDepthbuffer[re]=i.createRenderbuffer(),_e(E.__webglDepthbuffer[re],I,!1);else{const ue=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,te=E.__webglDepthbuffer[re];i.bindRenderbuffer(i.RENDERBUFFER,te),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,te)}}else{const re=I.texture.mipmaps;if(re&&re.length>0?t.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=i.createRenderbuffer(),_e(E.__webglDepthbuffer,I,!1);else{const ue=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,te=E.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,te),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,te)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function He(I,E,X){const re=n.get(I);E!==void 0&&me(re.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),X!==void 0&&Qe(I)}function ft(I){const E=I.texture,X=n.get(I),re=n.get(E);I.addEventListener("dispose",N);const ue=I.textures,te=I.isWebGLCubeRenderTarget===!0,Ie=ue.length>1;if(Ie||(re.__webglTexture===void 0&&(re.__webglTexture=i.createTexture()),re.__version=E.version,o.memory.textures++),te){X.__webglFramebuffer=[];for(let Se=0;Se<6;Se++)if(E.mipmaps&&E.mipmaps.length>0){X.__webglFramebuffer[Se]=[];for(let Fe=0;Fe<E.mipmaps.length;Fe++)X.__webglFramebuffer[Se][Fe]=i.createFramebuffer()}else X.__webglFramebuffer[Se]=i.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){X.__webglFramebuffer=[];for(let Se=0;Se<E.mipmaps.length;Se++)X.__webglFramebuffer[Se]=i.createFramebuffer()}else X.__webglFramebuffer=i.createFramebuffer();if(Ie)for(let Se=0,Fe=ue.length;Se<Fe;Se++){const ke=n.get(ue[Se]);ke.__webglTexture===void 0&&(ke.__webglTexture=i.createTexture(),o.memory.textures++)}if(I.samples>0&&je(I)===!1){X.__webglMultisampledFramebuffer=i.createFramebuffer(),X.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let Se=0;Se<ue.length;Se++){const Fe=ue[Se];X.__webglColorRenderbuffer[Se]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,X.__webglColorRenderbuffer[Se]);const ke=s.convert(Fe.format,Fe.colorSpace),de=s.convert(Fe.type),Te=w(Fe.internalFormat,ke,de,Fe.colorSpace,I.isXRRenderTarget===!0),Re=tt(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,Re,Te,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Se,i.RENDERBUFFER,X.__webglColorRenderbuffer[Se])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(X.__webglDepthRenderbuffer=i.createRenderbuffer(),_e(X.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(te){t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),ze(i.TEXTURE_CUBE_MAP,E);for(let Se=0;Se<6;Se++)if(E.mipmaps&&E.mipmaps.length>0)for(let Fe=0;Fe<E.mipmaps.length;Fe++)me(X.__webglFramebuffer[Se][Fe],I,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Fe);else me(X.__webglFramebuffer[Se],I,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0);x(E)&&m(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ie){for(let Se=0,Fe=ue.length;Se<Fe;Se++){const ke=ue[Se],de=n.get(ke);t.bindTexture(i.TEXTURE_2D,de.__webglTexture),ze(i.TEXTURE_2D,ke),me(X.__webglFramebuffer,I,ke,i.COLOR_ATTACHMENT0+Se,i.TEXTURE_2D,0),x(ke)&&m(i.TEXTURE_2D)}t.unbindTexture()}else{let Se=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(Se=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Se,re.__webglTexture),ze(Se,E),E.mipmaps&&E.mipmaps.length>0)for(let Fe=0;Fe<E.mipmaps.length;Fe++)me(X.__webglFramebuffer[Fe],I,E,i.COLOR_ATTACHMENT0,Se,Fe);else me(X.__webglFramebuffer,I,E,i.COLOR_ATTACHMENT0,Se,0);x(E)&&m(Se),t.unbindTexture()}I.depthBuffer&&Qe(I)}function ct(I){const E=I.textures;for(let X=0,re=E.length;X<re;X++){const ue=E[X];if(x(ue)){const te=P(I),Ie=n.get(ue).__webglTexture;t.bindTexture(te,Ie),m(te),t.unbindTexture()}}}const Ke=[],B=[];function Ut(I){if(I.samples>0){if(je(I)===!1){const E=I.textures,X=I.width,re=I.height;let ue=i.COLOR_BUFFER_BIT;const te=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ie=n.get(I),Se=E.length>1;if(Se)for(let ke=0;ke<E.length;ke++)t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ke,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ke,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer);const Fe=I.texture.mipmaps;Fe&&Fe.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let ke=0;ke<E.length;ke++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(ue|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(ue|=i.STENCIL_BUFFER_BIT)),Se){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ie.__webglColorRenderbuffer[ke]);const de=n.get(E[ke]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,de,0)}i.blitFramebuffer(0,0,X,re,0,0,X,re,ue,i.NEAREST),l===!0&&(Ke.length=0,B.length=0,Ke.push(i.COLOR_ATTACHMENT0+ke),I.depthBuffer&&I.resolveDepthBuffer===!1&&(Ke.push(te),B.push(te),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,B)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ke))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Se)for(let ke=0;ke<E.length;ke++){t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ke,i.RENDERBUFFER,Ie.__webglColorRenderbuffer[ke]);const de=n.get(E[ke]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ie.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ke,i.TEXTURE_2D,de,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){const E=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[E])}}}function tt(I){return Math.min(r.maxSamples,I.samples)}function je(I){const E=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function Ne(I){const E=o.render.frame;d.get(I)!==E&&(d.set(I,E),I.update())}function dt(I,E){const X=I.colorSpace,re=I.format,ue=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||X!==Wn&&X!==Tn&&(ot.getTransfer(X)===ut?(re!==Qt||ue!==Pn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",X)),E}function Ue(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(f.width=I.naturalWidth||I.width,f.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(f.width=I.displayWidth,f.height=I.displayHeight):(f.width=I.width,f.height=I.height),f}this.allocateTextureUnit=Y,this.resetTextureUnits=Z,this.setTexture2D=le,this.setTexture2DArray=ee,this.setTexture3D=ce,this.setTextureCube=Q,this.rebindTextures=He,this.setupRenderTarget=ft,this.updateRenderTargetMipmap=ct,this.updateMultisampleRenderTarget=Ut,this.setupDepthRenderbuffer=Qe,this.setupFrameBufferTexture=me,this.useMultisampledRTT=je}function NS(i,e){function t(n,r=Tn){let s;const o=ot.getTransfer(r);if(n===Pn)return i.UNSIGNED_BYTE;if(n===ua)return i.UNSIGNED_SHORT_4_4_4_4;if(n===fa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===jc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Jc)return i.BYTE;if(n===Qc)return i.SHORT;if(n===or)return i.UNSIGNED_SHORT;if(n===ca)return i.INT;if(n===li)return i.UNSIGNED_INT;if(n===Jt)return i.FLOAT;if(n===Wt)return i.HALF_FLOAT;if(n===eu)return i.ALPHA;if(n===tu)return i.RGB;if(n===Qt)return i.RGBA;if(n===lr)return i.DEPTH_COMPONENT;if(n===cr)return i.DEPTH_STENCIL;if(n===da)return i.RED;if(n===ha)return i.RED_INTEGER;if(n===nu)return i.RG;if(n===pa)return i.RG_INTEGER;if(n===ma)return i.RGBA_INTEGER;if(n===jr||n===es||n===ts||n===ns)if(o===ut)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===jr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===es)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ts)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ns)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===jr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===es)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ts)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ns)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===To||n===Ao||n===Co||n===wo)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===To)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ao)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Co)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===wo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ro||n===bo||n===Po)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Ro||n===bo)return o===ut?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Po)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Io||n===Do||n===Uo||n===Lo||n===No||n===Fo||n===Oo||n===Bo||n===Vo||n===zo||n===Ho||n===ko||n===Go||n===Wo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Io)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Do)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Uo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Lo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===No)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Fo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Oo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Bo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Vo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===zo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ho)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ko)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Go)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Wo)return o===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===is||n===qo||n===Xo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===is)return o===ut?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===qo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Xo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===iu||n===$o||n===Yo||n===Ko)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===is)return s.COMPRESSED_RED_RGTC1_EXT;if(n===$o)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Yo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ko)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ar?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const FS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,OS=`
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

}`;class BS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Bt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Ft({vertexShader:FS,fragmentShader:OS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new jt(new Ms(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class VS extends Vi{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,f=null,d=null,h=null,p=null,g=null,S=null;const y=new BS,x=t.getContextAttributes();let m=null,P=null;const w=[],T=[],V=new Ge;let F=null;const N=new Kt;N.viewport=new gt;const z=new Kt;z.viewport=new gt;const R=[N,z],M=new s_;let O=null,Z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let pe=w[j];return pe===void 0&&(pe=new Zs,w[j]=pe),pe.getTargetRaySpace()},this.getControllerGrip=function(j){let pe=w[j];return pe===void 0&&(pe=new Zs,w[j]=pe),pe.getGripSpace()},this.getHand=function(j){let pe=w[j];return pe===void 0&&(pe=new Zs,w[j]=pe),pe.getHandSpace()};function Y(j){const pe=T.indexOf(j.inputSource);if(pe===-1)return;const me=w[pe];me!==void 0&&(me.update(j.inputSource,j.frame,f||o),me.dispatchEvent({type:j.type,data:j.inputSource}))}function ie(){r.removeEventListener("select",Y),r.removeEventListener("selectstart",Y),r.removeEventListener("selectend",Y),r.removeEventListener("squeeze",Y),r.removeEventListener("squeezestart",Y),r.removeEventListener("squeezeend",Y),r.removeEventListener("end",ie),r.removeEventListener("inputsourceschange",le);for(let j=0;j<w.length;j++){const pe=T[j];pe!==null&&(T[j]=null,w[j].disconnect(pe))}O=null,Z=null,y.reset(),e.setRenderTarget(m),g=null,p=null,h=null,r=null,P=null,Je.stop(),n.isPresenting=!1,e.setPixelRatio(F),e.setSize(V.width,V.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return f||o},this.setReferenceSpace=function(j){f=j},this.getBaseLayer=function(){return p!==null?p:g},this.getBinding=function(){return h},this.getFrame=function(){return S},this.getSession=function(){return r},this.setSession=async function(j){if(r=j,r!==null){if(m=e.getRenderTarget(),r.addEventListener("select",Y),r.addEventListener("selectstart",Y),r.addEventListener("selectend",Y),r.addEventListener("squeeze",Y),r.addEventListener("squeezestart",Y),r.addEventListener("squeezeend",Y),r.addEventListener("end",ie),r.addEventListener("inputsourceschange",le),x.xrCompatible!==!0&&await t.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(V),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let me=null,_e=null,Pe=null;x.depth&&(Pe=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=x.stencil?cr:lr,_e=x.stencil?ar:li);const Qe={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:s};h=new XRWebGLBinding(r,t),p=h.createProjectionLayer(Qe),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),P=new un(p.textureWidth,p.textureHeight,{format:Qt,type:Pn,depthTexture:new gu(p.textureWidth,p.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{const me={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};g=new XRWebGLLayer(r,t,me),r.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),P=new un(g.framebufferWidth,g.framebufferHeight,{format:Qt,type:Pn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}P.isXRRenderTarget=!0,this.setFoveation(l),f=null,o=await r.requestReferenceSpace(a),Je.setContext(r),Je.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function le(j){for(let pe=0;pe<j.removed.length;pe++){const me=j.removed[pe],_e=T.indexOf(me);_e>=0&&(T[_e]=null,w[_e].disconnect(me))}for(let pe=0;pe<j.added.length;pe++){const me=j.added[pe];let _e=T.indexOf(me);if(_e===-1){for(let Qe=0;Qe<w.length;Qe++)if(Qe>=T.length){T.push(me),_e=Qe;break}else if(T[Qe]===null){T[Qe]=me,_e=Qe;break}if(_e===-1)break}const Pe=w[_e];Pe&&Pe.connect(me)}}const ee=new q,ce=new q;function Q(j,pe,me){ee.setFromMatrixPosition(pe.matrixWorld),ce.setFromMatrixPosition(me.matrixWorld);const _e=ee.distanceTo(ce),Pe=pe.projectionMatrix.elements,Qe=me.projectionMatrix.elements,He=Pe[14]/(Pe[10]-1),ft=Pe[14]/(Pe[10]+1),ct=(Pe[9]+1)/Pe[5],Ke=(Pe[9]-1)/Pe[5],B=(Pe[8]-1)/Pe[0],Ut=(Qe[8]+1)/Qe[0],tt=He*B,je=He*Ut,Ne=_e/(-B+Ut),dt=Ne*-B;if(pe.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(dt),j.translateZ(Ne),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Pe[10]===-1)j.projectionMatrix.copy(pe.projectionMatrix),j.projectionMatrixInverse.copy(pe.projectionMatrixInverse);else{const Ue=He+Ne,I=ft+Ne,E=tt-dt,X=je+(_e-dt),re=ct*ft/I*Ue,ue=Ke*ft/I*Ue;j.projectionMatrix.makePerspective(E,X,re,ue,Ue,I),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function ge(j,pe){pe===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(pe.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(r===null)return;let pe=j.near,me=j.far;y.texture!==null&&(y.depthNear>0&&(pe=y.depthNear),y.depthFar>0&&(me=y.depthFar)),M.near=z.near=N.near=pe,M.far=z.far=N.far=me,(O!==M.near||Z!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),O=M.near,Z=M.far),N.layers.mask=j.layers.mask|2,z.layers.mask=j.layers.mask|4,M.layers.mask=N.layers.mask|z.layers.mask;const _e=j.parent,Pe=M.cameras;ge(M,_e);for(let Qe=0;Qe<Pe.length;Qe++)ge(Pe[Qe],_e);Pe.length===2?Q(M,N,z):M.projectionMatrix.copy(N.projectionMatrix),ve(j,M,_e)};function ve(j,pe,me){me===null?j.matrix.copy(pe.matrixWorld):(j.matrix.copy(me.matrixWorld),j.matrix.invert(),j.matrix.multiply(pe.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(pe.projectionMatrix),j.projectionMatrixInverse.copy(pe.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Jo*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(p===null&&g===null))return l},this.setFoveation=function(j){l=j,p!==null&&(p.fixedFoveation=j),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=j)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(M)};let be=null;function ze(j,pe){if(d=pe.getViewerPose(f||o),S=pe,d!==null){const me=d.views;g!==null&&(e.setRenderTargetFramebuffer(P,g.framebuffer),e.setRenderTarget(P));let _e=!1;me.length!==M.cameras.length&&(M.cameras.length=0,_e=!0);for(let He=0;He<me.length;He++){const ft=me[He];let ct=null;if(g!==null)ct=g.getViewport(ft);else{const B=h.getViewSubImage(p,ft);ct=B.viewport,He===0&&(e.setRenderTargetTextures(P,B.colorTexture,B.depthStencilTexture),e.setRenderTarget(P))}let Ke=R[He];Ke===void 0&&(Ke=new Kt,Ke.layers.enable(He),Ke.viewport=new gt,R[He]=Ke),Ke.matrix.fromArray(ft.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(ft.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(ct.x,ct.y,ct.width,ct.height),He===0&&(M.matrix.copy(Ke.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),_e===!0&&M.cameras.push(Ke)}const Pe=r.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&h){const He=h.getDepthInformation(me[0]);He&&He.isValid&&He.texture&&y.init(e,He,r.renderState)}}for(let me=0;me<w.length;me++){const _e=T[me],Pe=w[me];_e!==null&&Pe!==void 0&&Pe.update(_e,pe,f||o)}be&&be(j,pe),pe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:pe}),S=null}const Je=new vu;Je.setAnimationLoop(ze),this.setAnimationLoop=function(j){be=j},this.dispose=function(){}}}const ti=new fn,zS=new St;function HS(i,e){function t(x,m){x.matrixAutoUpdate===!0&&x.updateMatrix(),m.value.copy(x.matrix)}function n(x,m){m.color.getRGB(x.fogColor.value,du(i)),m.isFog?(x.fogNear.value=m.near,x.fogFar.value=m.far):m.isFogExp2&&(x.fogDensity.value=m.density)}function r(x,m,P,w,T){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(x,m):m.isMeshToonMaterial?(s(x,m),h(x,m)):m.isMeshPhongMaterial?(s(x,m),d(x,m)):m.isMeshStandardMaterial?(s(x,m),p(x,m),m.isMeshPhysicalMaterial&&g(x,m,T)):m.isMeshMatcapMaterial?(s(x,m),S(x,m)):m.isMeshDepthMaterial?s(x,m):m.isMeshDistanceMaterial?(s(x,m),y(x,m)):m.isMeshNormalMaterial?s(x,m):m.isLineBasicMaterial?(o(x,m),m.isLineDashedMaterial&&a(x,m)):m.isPointsMaterial?l(x,m,P,w):m.isSpriteMaterial?f(x,m):m.isShadowMaterial?(x.color.value.copy(m.color),x.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(x,m){x.opacity.value=m.opacity,m.color&&x.diffuse.value.copy(m.color),m.emissive&&x.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(x.map.value=m.map,t(m.map,x.mapTransform)),m.alphaMap&&(x.alphaMap.value=m.alphaMap,t(m.alphaMap,x.alphaMapTransform)),m.bumpMap&&(x.bumpMap.value=m.bumpMap,t(m.bumpMap,x.bumpMapTransform),x.bumpScale.value=m.bumpScale,m.side===Ot&&(x.bumpScale.value*=-1)),m.normalMap&&(x.normalMap.value=m.normalMap,t(m.normalMap,x.normalMapTransform),x.normalScale.value.copy(m.normalScale),m.side===Ot&&x.normalScale.value.negate()),m.displacementMap&&(x.displacementMap.value=m.displacementMap,t(m.displacementMap,x.displacementMapTransform),x.displacementScale.value=m.displacementScale,x.displacementBias.value=m.displacementBias),m.emissiveMap&&(x.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,x.emissiveMapTransform)),m.specularMap&&(x.specularMap.value=m.specularMap,t(m.specularMap,x.specularMapTransform)),m.alphaTest>0&&(x.alphaTest.value=m.alphaTest);const P=e.get(m),w=P.envMap,T=P.envMapRotation;w&&(x.envMap.value=w,ti.copy(T),ti.x*=-1,ti.y*=-1,ti.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ti.y*=-1,ti.z*=-1),x.envMapRotation.value.setFromMatrix4(zS.makeRotationFromEuler(ti)),x.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=m.reflectivity,x.ior.value=m.ior,x.refractionRatio.value=m.refractionRatio),m.lightMap&&(x.lightMap.value=m.lightMap,x.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,x.lightMapTransform)),m.aoMap&&(x.aoMap.value=m.aoMap,x.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,x.aoMapTransform))}function o(x,m){x.diffuse.value.copy(m.color),x.opacity.value=m.opacity,m.map&&(x.map.value=m.map,t(m.map,x.mapTransform))}function a(x,m){x.dashSize.value=m.dashSize,x.totalSize.value=m.dashSize+m.gapSize,x.scale.value=m.scale}function l(x,m,P,w){x.diffuse.value.copy(m.color),x.opacity.value=m.opacity,x.size.value=m.size*P,x.scale.value=w*.5,m.map&&(x.map.value=m.map,t(m.map,x.uvTransform)),m.alphaMap&&(x.alphaMap.value=m.alphaMap,t(m.alphaMap,x.alphaMapTransform)),m.alphaTest>0&&(x.alphaTest.value=m.alphaTest)}function f(x,m){x.diffuse.value.copy(m.color),x.opacity.value=m.opacity,x.rotation.value=m.rotation,m.map&&(x.map.value=m.map,t(m.map,x.mapTransform)),m.alphaMap&&(x.alphaMap.value=m.alphaMap,t(m.alphaMap,x.alphaMapTransform)),m.alphaTest>0&&(x.alphaTest.value=m.alphaTest)}function d(x,m){x.specular.value.copy(m.specular),x.shininess.value=Math.max(m.shininess,1e-4)}function h(x,m){m.gradientMap&&(x.gradientMap.value=m.gradientMap)}function p(x,m){x.metalness.value=m.metalness,m.metalnessMap&&(x.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,x.metalnessMapTransform)),x.roughness.value=m.roughness,m.roughnessMap&&(x.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,x.roughnessMapTransform)),m.envMap&&(x.envMapIntensity.value=m.envMapIntensity)}function g(x,m,P){x.ior.value=m.ior,m.sheen>0&&(x.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),x.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(x.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,x.sheenColorMapTransform)),m.sheenRoughnessMap&&(x.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,x.sheenRoughnessMapTransform))),m.clearcoat>0&&(x.clearcoat.value=m.clearcoat,x.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(x.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,x.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(x.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ot&&x.clearcoatNormalScale.value.negate())),m.dispersion>0&&(x.dispersion.value=m.dispersion),m.iridescence>0&&(x.iridescence.value=m.iridescence,x.iridescenceIOR.value=m.iridescenceIOR,x.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(x.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,x.iridescenceMapTransform)),m.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),m.transmission>0&&(x.transmission.value=m.transmission,x.transmissionSamplerMap.value=P.texture,x.transmissionSamplerSize.value.set(P.width,P.height),m.transmissionMap&&(x.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,x.transmissionMapTransform)),x.thickness.value=m.thickness,m.thicknessMap&&(x.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=m.attenuationDistance,x.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(x.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(x.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=m.specularIntensity,x.specularColor.value.copy(m.specularColor),m.specularColorMap&&(x.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,x.specularColorMapTransform)),m.specularIntensityMap&&(x.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,x.specularIntensityMapTransform))}function S(x,m){m.matcap&&(x.matcap.value=m.matcap)}function y(x,m){const P=e.get(m).light;x.referencePosition.value.setFromMatrixPosition(P.matrixWorld),x.nearDistance.value=P.shadow.camera.near,x.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function kS(i,e,t,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(P,w){const T=w.program;n.uniformBlockBinding(P,T)}function f(P,w){let T=r[P.id];T===void 0&&(S(P),T=d(P),r[P.id]=T,P.addEventListener("dispose",x));const V=w.program;n.updateUBOMapping(P,V);const F=e.render.frame;s[P.id]!==F&&(p(P),s[P.id]=F)}function d(P){const w=h();P.__bindingPointIndex=w;const T=i.createBuffer(),V=P.__size,F=P.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,V,F),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,T),T}function h(){for(let P=0;P<a;P++)if(o.indexOf(P)===-1)return o.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(P){const w=r[P.id],T=P.uniforms,V=P.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let F=0,N=T.length;F<N;F++){const z=Array.isArray(T[F])?T[F]:[T[F]];for(let R=0,M=z.length;R<M;R++){const O=z[R];if(g(O,F,R,V)===!0){const Z=O.__offset,Y=Array.isArray(O.value)?O.value:[O.value];let ie=0;for(let le=0;le<Y.length;le++){const ee=Y[le],ce=y(ee);typeof ee=="number"||typeof ee=="boolean"?(O.__data[0]=ee,i.bufferSubData(i.UNIFORM_BUFFER,Z+ie,O.__data)):ee.isMatrix3?(O.__data[0]=ee.elements[0],O.__data[1]=ee.elements[1],O.__data[2]=ee.elements[2],O.__data[3]=0,O.__data[4]=ee.elements[3],O.__data[5]=ee.elements[4],O.__data[6]=ee.elements[5],O.__data[7]=0,O.__data[8]=ee.elements[6],O.__data[9]=ee.elements[7],O.__data[10]=ee.elements[8],O.__data[11]=0):(ee.toArray(O.__data,ie),ie+=ce.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,Z,O.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function g(P,w,T,V){const F=P.value,N=w+"_"+T;if(V[N]===void 0)return typeof F=="number"||typeof F=="boolean"?V[N]=F:V[N]=F.clone(),!0;{const z=V[N];if(typeof F=="number"||typeof F=="boolean"){if(z!==F)return V[N]=F,!0}else if(z.equals(F)===!1)return z.copy(F),!0}return!1}function S(P){const w=P.uniforms;let T=0;const V=16;for(let N=0,z=w.length;N<z;N++){const R=Array.isArray(w[N])?w[N]:[w[N]];for(let M=0,O=R.length;M<O;M++){const Z=R[M],Y=Array.isArray(Z.value)?Z.value:[Z.value];for(let ie=0,le=Y.length;ie<le;ie++){const ee=Y[ie],ce=y(ee),Q=T%V,ge=Q%ce.boundary,ve=Q+ge;T+=ge,ve!==0&&V-ve<ce.storage&&(T+=V-ve),Z.__data=new Float32Array(ce.storage/Float32Array.BYTES_PER_ELEMENT),Z.__offset=T,T+=ce.storage}}}const F=T%V;return F>0&&(T+=V-F),P.__size=T,P.__cache={},this}function y(P){const w={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(w.boundary=4,w.storage=4):P.isVector2?(w.boundary=8,w.storage=8):P.isVector3||P.isColor?(w.boundary=16,w.storage=12):P.isVector4?(w.boundary=16,w.storage=16):P.isMatrix3?(w.boundary=48,w.storage=48):P.isMatrix4?(w.boundary=64,w.storage=64):P.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",P),w}function x(P){const w=P.target;w.removeEventListener("dispose",x);const T=o.indexOf(w.__bindingPointIndex);o.splice(T,1),i.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function m(){for(const P in r)i.deleteBuffer(r[P]);o=[],r={},s={}}return{bind:l,update:f,dispose:m}}class GS{constructor(e={}){const{canvas:t=mg(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:f=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;const S=new Uint32Array(4),y=new Int32Array(4);let x=null,m=null;const P=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=kn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const T=this;let V=!1;this._outputColorSpace=Yt;let F=0,N=0,z=null,R=-1,M=null;const O=new gt,Z=new gt;let Y=null;const ie=new it(0);let le=0,ee=t.width,ce=t.height,Q=1,ge=null,ve=null;const be=new gt(0,0,ee,ce),ze=new gt(0,0,ee,ce);let Je=!1;const j=new mu;let pe=!1,me=!1;const _e=new St,Pe=new St,Qe=new q,He=new gt,ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ct=!1;function Ke(){return z===null?Q:1}let B=n;function Ut(v,C){return t.getContext(v,C)}try{const v={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:f,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${la}`),t.addEventListener("webglcontextlost",oe,!1),t.addEventListener("webglcontextrestored",ye,!1),t.addEventListener("webglcontextcreationerror",Ee,!1),B===null){const C="webgl2";if(B=Ut(C,v),B===null)throw Ut(C)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let tt,je,Ne,dt,Ue,I,E,X,re,ue,te,Ie,Se,Fe,ke,de,Te,Re,De,Me,We,Oe,qe,k;function $(){tt=new j0(B),tt.init(),Oe=new NS(B,tt),je=new X0(B,tt,e,Oe),Ne=new US(B,tt),je.reverseDepthBuffer&&p&&Ne.buffers.depth.setReversed(!0),dt=new nx(B),Ue=new SS,I=new LS(B,tt,Ne,Ue,je,Oe,dt),E=new Y0(T),X=new Q0(T),re=new l_(B),qe=new W0(B,re),ue=new ex(B,re,dt,qe),te=new rx(B,ue,re,dt),De=new ix(B,je,I),de=new $0(Ue),Ie=new xS(T,E,X,tt,je,qe,de),Se=new HS(T,Ue),Fe=new yS,ke=new RS(tt),Re=new G0(T,E,X,Ne,te,g,l),Te=new IS(T,te,je),k=new kS(B,dt,je,Ne),Me=new q0(B,tt,dt),We=new tx(B,tt,dt),dt.programs=Ie.programs,T.capabilities=je,T.extensions=tt,T.properties=Ue,T.renderLists=Fe,T.shadowMap=Te,T.state=Ne,T.info=dt}$();const J=new VS(T,B);this.xr=J,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const v=tt.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){const v=tt.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(v){v!==void 0&&(Q=v,this.setSize(ee,ce,!1))},this.getSize=function(v){return v.set(ee,ce)},this.setSize=function(v,C,b=!0){if(J.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}ee=v,ce=C,t.width=Math.floor(v*Q),t.height=Math.floor(C*Q),b===!0&&(t.style.width=v+"px",t.style.height=C+"px"),this.setViewport(0,0,v,C)},this.getDrawingBufferSize=function(v){return v.set(ee*Q,ce*Q).floor()},this.setDrawingBufferSize=function(v,C,b){ee=v,ce=C,Q=b,t.width=Math.floor(v*b),t.height=Math.floor(C*b),this.setViewport(0,0,v,C)},this.getCurrentViewport=function(v){return v.copy(O)},this.getViewport=function(v){return v.copy(be)},this.setViewport=function(v,C,b,L){v.isVector4?be.set(v.x,v.y,v.z,v.w):be.set(v,C,b,L),Ne.viewport(O.copy(be).multiplyScalar(Q).round())},this.getScissor=function(v){return v.copy(ze)},this.setScissor=function(v,C,b,L){v.isVector4?ze.set(v.x,v.y,v.z,v.w):ze.set(v,C,b,L),Ne.scissor(Z.copy(ze).multiplyScalar(Q).round())},this.getScissorTest=function(){return Je},this.setScissorTest=function(v){Ne.setScissorTest(Je=v)},this.setOpaqueSort=function(v){ge=v},this.setTransparentSort=function(v){ve=v},this.getClearColor=function(v){return v.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor(...arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha(...arguments)},this.clear=function(v=!0,C=!0,b=!0){let L=0;if(v){let D=!1;if(z!==null){const H=z.texture.format;D=H===ma||H===pa||H===ha}if(D){const H=z.texture.type,G=H===Pn||H===li||H===or||H===ar||H===ua||H===fa,W=Re.getClearColor(),K=Re.getClearAlpha(),se=W.r,ne=W.g,ae=W.b;G?(S[0]=se,S[1]=ne,S[2]=ae,S[3]=K,B.clearBufferuiv(B.COLOR,0,S)):(y[0]=se,y[1]=ne,y[2]=ae,y[3]=K,B.clearBufferiv(B.COLOR,0,y))}else L|=B.COLOR_BUFFER_BIT}C&&(L|=B.DEPTH_BUFFER_BIT),b&&(L|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B.clear(L)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",oe,!1),t.removeEventListener("webglcontextrestored",ye,!1),t.removeEventListener("webglcontextcreationerror",Ee,!1),Re.dispose(),Fe.dispose(),ke.dispose(),Ue.dispose(),E.dispose(),X.dispose(),te.dispose(),qe.dispose(),k.dispose(),Ie.dispose(),J.dispose(),J.removeEventListener("sessionstart",xr),J.removeEventListener("sessionend",Sr),pn.stop()};function oe(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),V=!0}function ye(){console.log("THREE.WebGLRenderer: Context Restored."),V=!1;const v=dt.autoReset,C=Te.enabled,b=Te.autoUpdate,L=Te.needsUpdate,D=Te.type;$(),dt.autoReset=v,Te.enabled=C,Te.autoUpdate=b,Te.needsUpdate=L,Te.type=D}function Ee(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Xe(v){const C=v.target;C.removeEventListener("dispose",Xe),mt(C)}function mt(v){At(v),Ue.remove(v)}function At(v){const C=Ue.get(v).programs;C!==void 0&&(C.forEach(function(b){Ie.releaseProgram(b)}),v.isShaderMaterial&&Ie.releaseShaderCache(v))}this.renderBufferDirect=function(v,C,b,L,D,H){C===null&&(C=ft);const G=D.isMesh&&D.matrixWorld.determinant()<0,W=As(v,C,b,L,D);Ne.setMaterial(L,G);let K=b.index,se=1;if(L.wireframe===!0){if(K=ue.getWireframeAttribute(b),K===void 0)return;se=2}const ne=b.drawRange,ae=b.attributes.position;let fe=ne.start*se,he=(ne.start+ne.count)*se;H!==null&&(fe=Math.max(fe,H.start*se),he=Math.min(he,(H.start+H.count)*se)),K!==null?(fe=Math.max(fe,0),he=Math.min(he,K.count)):ae!=null&&(fe=Math.max(fe,0),he=Math.min(he,ae.count));const Ce=he-fe;if(Ce<0||Ce===1/0)return;qe.setup(D,L,W,b,K);let Be,Le=Me;if(K!==null&&(Be=re.get(K),Le=We,Le.setIndex(Be)),D.isMesh)L.wireframe===!0?(Ne.setLineWidth(L.wireframeLinewidth*Ke()),Le.setMode(B.LINES)):Le.setMode(B.TRIANGLES);else if(D.isLine){let Ae=L.linewidth;Ae===void 0&&(Ae=1),Ne.setLineWidth(Ae*Ke()),D.isLineSegments?Le.setMode(B.LINES):D.isLineLoop?Le.setMode(B.LINE_LOOP):Le.setMode(B.LINE_STRIP)}else D.isPoints?Le.setMode(B.POINTS):D.isSprite&&Le.setMode(B.TRIANGLES);if(D.isBatchedMesh)if(D._multiDrawInstances!==null)rs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Le.renderMultiDrawInstances(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount,D._multiDrawInstances);else if(tt.get("WEBGL_multi_draw"))Le.renderMultiDraw(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount);else{const Ae=D._multiDrawStarts,$e=D._multiDrawCounts,we=D._multiDrawCount,lt=K?re.get(K).bytesPerElement:1,Et=Ue.get(L).currentProgram.getUniforms();for(let st=0;st<we;st++)Et.setValue(B,"_gl_DrawID",st),Le.render(Ae[st]/lt,$e[st])}else if(D.isInstancedMesh)Le.renderInstances(fe,Ce,D.count);else if(b.isInstancedBufferGeometry){const Ae=b._maxInstanceCount!==void 0?b._maxInstanceCount:1/0,$e=Math.min(b.instanceCount,Ae);Le.renderInstances(fe,Ce,$e)}else Le.render(fe,Ce)};function at(v,C,b){v.transparent===!0&&v.side===Mn&&v.forceSinglePass===!1?(v.side=Ot,v.needsUpdate=!0,ui(v,C,b),v.side=Gn,v.needsUpdate=!0,ui(v,C,b),v.side=Mn):ui(v,C,b)}this.compile=function(v,C,b=null){b===null&&(b=v),m=ke.get(b),m.init(C),w.push(m),b.traverseVisible(function(D){D.isLight&&D.layers.test(C.layers)&&(m.pushLight(D),D.castShadow&&m.pushShadow(D))}),v!==b&&v.traverseVisible(function(D){D.isLight&&D.layers.test(C.layers)&&(m.pushLight(D),D.castShadow&&m.pushShadow(D))}),m.setupLights();const L=new Set;return v.traverse(function(D){if(!(D.isMesh||D.isPoints||D.isLine||D.isSprite))return;const H=D.material;if(H)if(Array.isArray(H))for(let G=0;G<H.length;G++){const W=H[G];at(W,b,D),L.add(W)}else at(H,b,D),L.add(H)}),m=w.pop(),L},this.compileAsync=function(v,C,b=null){const L=this.compile(v,C,b);return new Promise(D=>{function H(){if(L.forEach(function(G){Ue.get(G).currentProgram.isReady()&&L.delete(G)}),L.size===0){D(v);return}setTimeout(H,10)}tt.get("KHR_parallel_shader_compile")!==null?H():setTimeout(H,10)})};let Ht=null;function nn(v){Ht&&Ht(v)}function xr(){pn.stop()}function Sr(){pn.start()}const pn=new vu;pn.setAnimationLoop(nn),typeof self<"u"&&pn.setContext(self),this.setAnimationLoop=function(v){Ht=v,J.setAnimationLoop(v),v===null?pn.stop():pn.start()},J.addEventListener("sessionstart",xr),J.addEventListener("sessionend",Sr),this.render=function(v,C){if(C!==void 0&&C.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(V===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),C.parent===null&&C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),J.enabled===!0&&J.isPresenting===!0&&(J.cameraAutoUpdate===!0&&J.updateCamera(C),C=J.getCamera()),v.isScene===!0&&v.onBeforeRender(T,v,C,z),m=ke.get(v,w.length),m.init(C),w.push(m),Pe.multiplyMatrices(C.projectionMatrix,C.matrixWorldInverse),j.setFromProjectionMatrix(Pe),me=this.localClippingEnabled,pe=de.init(this.clippingPlanes,me),x=Fe.get(v,P.length),x.init(),P.push(x),J.enabled===!0&&J.isPresenting===!0){const H=T.xr.getDepthSensingMesh();H!==null&&Gi(H,C,-1/0,T.sortObjects)}Gi(v,C,0,T.sortObjects),x.finish(),T.sortObjects===!0&&x.sort(ge,ve),ct=J.enabled===!1||J.isPresenting===!1||J.hasDepthSensing()===!1,ct&&Re.addToRenderList(x,v),this.info.render.frame++,pe===!0&&de.beginShadows();const b=m.state.shadowsArray;Te.render(b,v,C),pe===!0&&de.endShadows(),this.info.autoReset===!0&&this.info.reset();const L=x.opaque,D=x.transmissive;if(m.setupLights(),C.isArrayCamera){const H=C.cameras;if(D.length>0)for(let G=0,W=H.length;G<W;G++){const K=H[G];Er(L,D,v,K)}ct&&Re.render(v);for(let G=0,W=H.length;G<W;G++){const K=H[G];Wi(x,v,K,K.viewport)}}else D.length>0&&Er(L,D,v,C),ct&&Re.render(v),Wi(x,v,C);z!==null&&N===0&&(I.updateMultisampleRenderTarget(z),I.updateRenderTargetMipmap(z)),v.isScene===!0&&v.onAfterRender(T,v,C),qe.resetDefaultState(),R=-1,M=null,w.pop(),w.length>0?(m=w[w.length-1],pe===!0&&de.setGlobalState(T.clippingPlanes,m.state.camera)):m=null,P.pop(),P.length>0?x=P[P.length-1]:x=null};function Gi(v,C,b,L){if(v.visible===!1)return;if(v.layers.test(C.layers)){if(v.isGroup)b=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(C);else if(v.isLight)m.pushLight(v),v.castShadow&&m.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||j.intersectsSprite(v)){L&&He.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Pe);const G=te.update(v),W=v.material;W.visible&&x.push(v,G,W,b,He.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||j.intersectsObject(v))){const G=te.update(v),W=v.material;if(L&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),He.copy(v.boundingSphere.center)):(G.boundingSphere===null&&G.computeBoundingSphere(),He.copy(G.boundingSphere.center)),He.applyMatrix4(v.matrixWorld).applyMatrix4(Pe)),Array.isArray(W)){const K=G.groups;for(let se=0,ne=K.length;se<ne;se++){const ae=K[se],fe=W[ae.materialIndex];fe&&fe.visible&&x.push(v,G,fe,b,He.z,ae)}}else W.visible&&x.push(v,G,W,b,He.z,null)}}const H=v.children;for(let G=0,W=H.length;G<W;G++)Gi(H[G],C,b,L)}function Wi(v,C,b,L){const D=v.opaque,H=v.transmissive,G=v.transparent;m.setupLightsView(b),pe===!0&&de.setGlobalState(T.clippingPlanes,b),L&&Ne.viewport(O.copy(L)),D.length>0&&ci(D,C,b),H.length>0&&ci(H,C,b),G.length>0&&ci(G,C,b),Ne.buffers.depth.setTest(!0),Ne.buffers.depth.setMask(!0),Ne.buffers.color.setMask(!0),Ne.setPolygonOffset(!1)}function Er(v,C,b,L){if((b.isScene===!0?b.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[L.id]===void 0&&(m.state.transmissionRenderTarget[L.id]=new un(1,1,{generateMipmaps:!0,type:tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float")?Wt:Pn,minFilter:Hn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ot.workingColorSpace}));const H=m.state.transmissionRenderTarget[L.id],G=L.viewport||O;H.setSize(G.z*T.transmissionResolutionScale,G.w*T.transmissionResolutionScale);const W=T.getRenderTarget();T.setRenderTarget(H),T.getClearColor(ie),le=T.getClearAlpha(),le<1&&T.setClearColor(16777215,.5),T.clear(),ct&&Re.render(b);const K=T.toneMapping;T.toneMapping=kn;const se=L.viewport;if(L.viewport!==void 0&&(L.viewport=void 0),m.setupLightsView(L),pe===!0&&de.setGlobalState(T.clippingPlanes,L),ci(v,b,L),I.updateMultisampleRenderTarget(H),I.updateRenderTargetMipmap(H),tt.has("WEBGL_multisampled_render_to_texture")===!1){let ne=!1;for(let ae=0,fe=C.length;ae<fe;ae++){const he=C[ae],Ce=he.object,Be=he.geometry,Le=he.material,Ae=he.group;if(Le.side===Mn&&Ce.layers.test(L.layers)){const $e=Le.side;Le.side=Ot,Le.needsUpdate=!0,yr(Ce,b,L,Be,Le,Ae),Le.side=$e,Le.needsUpdate=!0,ne=!0}}ne===!0&&(I.updateMultisampleRenderTarget(H),I.updateRenderTargetMipmap(H))}T.setRenderTarget(W),T.setClearColor(ie,le),se!==void 0&&(L.viewport=se),T.toneMapping=K}function ci(v,C,b){const L=C.isScene===!0?C.overrideMaterial:null;for(let D=0,H=v.length;D<H;D++){const G=v[D],W=G.object,K=G.geometry,se=G.group;let ne=G.material;ne.allowOverride===!0&&L!==null&&(ne=L),W.layers.test(b.layers)&&yr(W,C,b,K,ne,se)}}function yr(v,C,b,L,D,H){v.onBeforeRender(T,C,b,L,D,H),v.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),D.onBeforeRender(T,C,b,L,v,H),D.transparent===!0&&D.side===Mn&&D.forceSinglePass===!1?(D.side=Ot,D.needsUpdate=!0,T.renderBufferDirect(b,C,L,D,v,H),D.side=Gn,D.needsUpdate=!0,T.renderBufferDirect(b,C,L,D,v,H),D.side=Mn):T.renderBufferDirect(b,C,L,D,v,H),v.onAfterRender(T,C,b,L,D,H)}function ui(v,C,b){C.isScene!==!0&&(C=ft);const L=Ue.get(v),D=m.state.lights,H=m.state.shadowsArray,G=D.state.version,W=Ie.getParameters(v,D.state,H,C,b),K=Ie.getProgramCacheKey(W);let se=L.programs;L.environment=v.isMeshStandardMaterial?C.environment:null,L.fog=C.fog,L.envMap=(v.isMeshStandardMaterial?X:E).get(v.envMap||L.environment),L.envMapRotation=L.environment!==null&&v.envMap===null?C.environmentRotation:v.envMapRotation,se===void 0&&(v.addEventListener("dispose",Xe),se=new Map,L.programs=se);let ne=se.get(K);if(ne!==void 0){if(L.currentProgram===ne&&L.lightsStateVersion===G)return Xi(v,W),ne}else W.uniforms=Ie.getUniforms(v),v.onBeforeCompile(W,T),ne=Ie.acquireProgram(W,K),se.set(K,ne),L.uniforms=W.uniforms;const ae=L.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(ae.clippingPlanes=de.uniform),Xi(v,W),L.needsLights=Dn(v),L.lightsStateVersion=G,L.needsLights&&(ae.ambientLightColor.value=D.state.ambient,ae.lightProbe.value=D.state.probe,ae.directionalLights.value=D.state.directional,ae.directionalLightShadows.value=D.state.directionalShadow,ae.spotLights.value=D.state.spot,ae.spotLightShadows.value=D.state.spotShadow,ae.rectAreaLights.value=D.state.rectArea,ae.ltc_1.value=D.state.rectAreaLTC1,ae.ltc_2.value=D.state.rectAreaLTC2,ae.pointLights.value=D.state.point,ae.pointLightShadows.value=D.state.pointShadow,ae.hemisphereLights.value=D.state.hemi,ae.directionalShadowMap.value=D.state.directionalShadowMap,ae.directionalShadowMatrix.value=D.state.directionalShadowMatrix,ae.spotShadowMap.value=D.state.spotShadowMap,ae.spotLightMatrix.value=D.state.spotLightMatrix,ae.spotLightMap.value=D.state.spotLightMap,ae.pointShadowMap.value=D.state.pointShadowMap,ae.pointShadowMatrix.value=D.state.pointShadowMatrix),L.currentProgram=ne,L.uniformsList=null,ne}function qi(v){if(v.uniformsList===null){const C=v.currentProgram.getUniforms();v.uniformsList=ss.seqWithValue(C.seq,v.uniforms)}return v.uniformsList}function Xi(v,C){const b=Ue.get(v);b.outputColorSpace=C.outputColorSpace,b.batching=C.batching,b.batchingColor=C.batchingColor,b.instancing=C.instancing,b.instancingColor=C.instancingColor,b.instancingMorph=C.instancingMorph,b.skinning=C.skinning,b.morphTargets=C.morphTargets,b.morphNormals=C.morphNormals,b.morphColors=C.morphColors,b.morphTargetsCount=C.morphTargetsCount,b.numClippingPlanes=C.numClippingPlanes,b.numIntersection=C.numClipIntersection,b.vertexAlphas=C.vertexAlphas,b.vertexTangents=C.vertexTangents,b.toneMapping=C.toneMapping}function As(v,C,b,L,D){C.isScene!==!0&&(C=ft),I.resetTextureUnits();const H=C.fog,G=L.isMeshStandardMaterial?C.environment:null,W=z===null?T.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:Wn,K=(L.isMeshStandardMaterial?X:E).get(L.envMap||G),se=L.vertexColors===!0&&!!b.attributes.color&&b.attributes.color.itemSize===4,ne=!!b.attributes.tangent&&(!!L.normalMap||L.anisotropy>0),ae=!!b.morphAttributes.position,fe=!!b.morphAttributes.normal,he=!!b.morphAttributes.color;let Ce=kn;L.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(Ce=T.toneMapping);const Be=b.morphAttributes.position||b.morphAttributes.normal||b.morphAttributes.color,Le=Be!==void 0?Be.length:0,Ae=Ue.get(L),$e=m.state.lights;if(pe===!0&&(me===!0||v!==M)){const ht=v===M&&L.id===R;de.setState(L,v,ht)}let we=!1;L.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==$e.state.version||Ae.outputColorSpace!==W||D.isBatchedMesh&&Ae.batching===!1||!D.isBatchedMesh&&Ae.batching===!0||D.isBatchedMesh&&Ae.batchingColor===!0&&D.colorTexture===null||D.isBatchedMesh&&Ae.batchingColor===!1&&D.colorTexture!==null||D.isInstancedMesh&&Ae.instancing===!1||!D.isInstancedMesh&&Ae.instancing===!0||D.isSkinnedMesh&&Ae.skinning===!1||!D.isSkinnedMesh&&Ae.skinning===!0||D.isInstancedMesh&&Ae.instancingColor===!0&&D.instanceColor===null||D.isInstancedMesh&&Ae.instancingColor===!1&&D.instanceColor!==null||D.isInstancedMesh&&Ae.instancingMorph===!0&&D.morphTexture===null||D.isInstancedMesh&&Ae.instancingMorph===!1&&D.morphTexture!==null||Ae.envMap!==K||L.fog===!0&&Ae.fog!==H||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==de.numPlanes||Ae.numIntersection!==de.numIntersection)||Ae.vertexAlphas!==se||Ae.vertexTangents!==ne||Ae.morphTargets!==ae||Ae.morphNormals!==fe||Ae.morphColors!==he||Ae.toneMapping!==Ce||Ae.morphTargetsCount!==Le)&&(we=!0):(we=!0,Ae.__version=L.version);let lt=Ae.currentProgram;we===!0&&(lt=ui(L,C,D));let Et=!1,st=!1,nt=!1;const Ve=lt.getUniforms(),_t=Ae.uniforms;if(Ne.useProgram(lt.program)&&(Et=!0,st=!0,nt=!0),L.id!==R&&(R=L.id,st=!0),Et||M!==v){Ne.buffers.depth.getReversed()?(_e.copy(v.projectionMatrix),_g(_e),vg(_e),Ve.setValue(B,"projectionMatrix",_e)):Ve.setValue(B,"projectionMatrix",v.projectionMatrix),Ve.setValue(B,"viewMatrix",v.matrixWorldInverse);const yt=Ve.map.cameraPosition;yt!==void 0&&yt.setValue(B,Qe.setFromMatrixPosition(v.matrixWorld)),je.logarithmicDepthBuffer&&Ve.setValue(B,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(L.isMeshPhongMaterial||L.isMeshToonMaterial||L.isMeshLambertMaterial||L.isMeshBasicMaterial||L.isMeshStandardMaterial||L.isShaderMaterial)&&Ve.setValue(B,"isOrthographic",v.isOrthographicCamera===!0),M!==v&&(M=v,st=!0,nt=!0)}if(D.isSkinnedMesh){Ve.setOptional(B,D,"bindMatrix"),Ve.setOptional(B,D,"bindMatrixInverse");const ht=D.skeleton;ht&&(ht.boneTexture===null&&ht.computeBoneTexture(),Ve.setValue(B,"boneTexture",ht.boneTexture,I))}D.isBatchedMesh&&(Ve.setOptional(B,D,"batchingTexture"),Ve.setValue(B,"batchingTexture",D._matricesTexture,I),Ve.setOptional(B,D,"batchingIdTexture"),Ve.setValue(B,"batchingIdTexture",D._indirectTexture,I),Ve.setOptional(B,D,"batchingColorTexture"),D._colorsTexture!==null&&Ve.setValue(B,"batchingColorTexture",D._colorsTexture,I));const Ct=b.morphAttributes;if((Ct.position!==void 0||Ct.normal!==void 0||Ct.color!==void 0)&&De.update(D,b,lt),(st||Ae.receiveShadow!==D.receiveShadow)&&(Ae.receiveShadow=D.receiveShadow,Ve.setValue(B,"receiveShadow",D.receiveShadow)),L.isMeshGouraudMaterial&&L.envMap!==null&&(_t.envMap.value=K,_t.flipEnvMap.value=K.isCubeTexture&&K.isRenderTargetTexture===!1?-1:1),L.isMeshStandardMaterial&&L.envMap===null&&C.environment!==null&&(_t.envMapIntensity.value=C.environmentIntensity),st&&(Ve.setValue(B,"toneMappingExposure",T.toneMappingExposure),Ae.needsLights&&mn(_t,nt),H&&L.fog===!0&&Se.refreshFogUniforms(_t,H),Se.refreshMaterialUniforms(_t,L,Q,ce,m.state.transmissionRenderTarget[v.id]),ss.upload(B,qi(Ae),_t,I)),L.isShaderMaterial&&L.uniformsNeedUpdate===!0&&(ss.upload(B,qi(Ae),_t,I),L.uniformsNeedUpdate=!1),L.isSpriteMaterial&&Ve.setValue(B,"center",D.center),Ve.setValue(B,"modelViewMatrix",D.modelViewMatrix),Ve.setValue(B,"normalMatrix",D.normalMatrix),Ve.setValue(B,"modelMatrix",D.matrixWorld),L.isShaderMaterial||L.isRawShaderMaterial){const ht=L.uniformsGroups;for(let yt=0,Cs=ht.length;yt<Cs;yt++){const Yn=ht[yt];k.update(Yn,lt),k.bind(Yn,lt)}}return lt}function mn(v,C){v.ambientLightColor.needsUpdate=C,v.lightProbe.needsUpdate=C,v.directionalLights.needsUpdate=C,v.directionalLightShadows.needsUpdate=C,v.pointLights.needsUpdate=C,v.pointLightShadows.needsUpdate=C,v.spotLights.needsUpdate=C,v.spotLightShadows.needsUpdate=C,v.rectAreaLights.needsUpdate=C,v.hemisphereLights.needsUpdate=C}function Dn(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return F},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(v,C,b){const L=Ue.get(v);L.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,L.__autoAllocateDepthBuffer===!1&&(L.__useRenderToTexture=!1),Ue.get(v.texture).__webglTexture=C,Ue.get(v.depthTexture).__webglTexture=L.__autoAllocateDepthBuffer?void 0:b,L.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,C){const b=Ue.get(v);b.__webglFramebuffer=C,b.__useDefaultFramebuffer=C===void 0};const _=B.createFramebuffer();this.setRenderTarget=function(v,C=0,b=0){z=v,F=C,N=b;let L=!0,D=null,H=!1,G=!1;if(v){const K=Ue.get(v);if(K.__useDefaultFramebuffer!==void 0)Ne.bindFramebuffer(B.FRAMEBUFFER,null),L=!1;else if(K.__webglFramebuffer===void 0)I.setupRenderTarget(v);else if(K.__hasExternalTextures)I.rebindTextures(v,Ue.get(v.texture).__webglTexture,Ue.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){const ae=v.depthTexture;if(K.__boundDepthTexture!==ae){if(ae!==null&&Ue.has(ae)&&(v.width!==ae.image.width||v.height!==ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");I.setupDepthRenderbuffer(v)}}const se=v.texture;(se.isData3DTexture||se.isDataArrayTexture||se.isCompressedArrayTexture)&&(G=!0);const ne=Ue.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(ne[C])?D=ne[C][b]:D=ne[C],H=!0):v.samples>0&&I.useMultisampledRTT(v)===!1?D=Ue.get(v).__webglMultisampledFramebuffer:Array.isArray(ne)?D=ne[b]:D=ne,O.copy(v.viewport),Z.copy(v.scissor),Y=v.scissorTest}else O.copy(be).multiplyScalar(Q).floor(),Z.copy(ze).multiplyScalar(Q).floor(),Y=Je;if(b!==0&&(D=_),Ne.bindFramebuffer(B.FRAMEBUFFER,D)&&L&&Ne.drawBuffers(v,D),Ne.viewport(O),Ne.scissor(Z),Ne.setScissorTest(Y),H){const K=Ue.get(v.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+C,K.__webglTexture,b)}else if(G){const K=Ue.get(v.texture),se=C;B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.__webglTexture,b,se)}else if(v!==null&&b!==0){const K=Ue.get(v.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,K.__webglTexture,b)}R=-1},this.readRenderTargetPixels=function(v,C,b,L,D,H,G){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let W=Ue.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&G!==void 0&&(W=W[G]),W){Ne.bindFramebuffer(B.FRAMEBUFFER,W);try{const K=v.texture,se=K.format,ne=K.type;if(!je.textureFormatReadable(se)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!je.textureTypeReadable(ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}C>=0&&C<=v.width-L&&b>=0&&b<=v.height-D&&B.readPixels(C,b,L,D,Oe.convert(se),Oe.convert(ne),H)}finally{const K=z!==null?Ue.get(z).__webglFramebuffer:null;Ne.bindFramebuffer(B.FRAMEBUFFER,K)}}},this.readRenderTargetPixelsAsync=async function(v,C,b,L,D,H,G){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let W=Ue.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&G!==void 0&&(W=W[G]),W)if(C>=0&&C<=v.width-L&&b>=0&&b<=v.height-D){Ne.bindFramebuffer(B.FRAMEBUFFER,W);const K=v.texture,se=K.format,ne=K.type;if(!je.textureFormatReadable(se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!je.textureTypeReadable(ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ae=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,ae),B.bufferData(B.PIXEL_PACK_BUFFER,H.byteLength,B.STREAM_READ),B.readPixels(C,b,L,D,Oe.convert(se),Oe.convert(ne),0);const fe=z!==null?Ue.get(z).__webglFramebuffer:null;Ne.bindFramebuffer(B.FRAMEBUFFER,fe);const he=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await gg(B,he,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,ae),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,H),B.deleteBuffer(ae),B.deleteSync(he),H}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,C=null,b=0){const L=Math.pow(2,-b),D=Math.floor(v.image.width*L),H=Math.floor(v.image.height*L),G=C!==null?C.x:0,W=C!==null?C.y:0;I.setTexture2D(v,0),B.copyTexSubImage2D(B.TEXTURE_2D,b,0,0,G,W,D,H),Ne.unbindTexture()};const A=B.createFramebuffer(),U=B.createFramebuffer();this.copyTextureToTexture=function(v,C,b=null,L=null,D=0,H=null){H===null&&(D!==0?(rs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),H=D,D=0):H=0);let G,W,K,se,ne,ae,fe,he,Ce;const Be=v.isCompressedTexture?v.mipmaps[H]:v.image;if(b!==null)G=b.max.x-b.min.x,W=b.max.y-b.min.y,K=b.isBox3?b.max.z-b.min.z:1,se=b.min.x,ne=b.min.y,ae=b.isBox3?b.min.z:0;else{const Ct=Math.pow(2,-D);G=Math.floor(Be.width*Ct),W=Math.floor(Be.height*Ct),v.isDataArrayTexture?K=Be.depth:v.isData3DTexture?K=Math.floor(Be.depth*Ct):K=1,se=0,ne=0,ae=0}L!==null?(fe=L.x,he=L.y,Ce=L.z):(fe=0,he=0,Ce=0);const Le=Oe.convert(C.format),Ae=Oe.convert(C.type);let $e;C.isData3DTexture?(I.setTexture3D(C,0),$e=B.TEXTURE_3D):C.isDataArrayTexture||C.isCompressedArrayTexture?(I.setTexture2DArray(C,0),$e=B.TEXTURE_2D_ARRAY):(I.setTexture2D(C,0),$e=B.TEXTURE_2D),B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,C.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,C.unpackAlignment);const we=B.getParameter(B.UNPACK_ROW_LENGTH),lt=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Et=B.getParameter(B.UNPACK_SKIP_PIXELS),st=B.getParameter(B.UNPACK_SKIP_ROWS),nt=B.getParameter(B.UNPACK_SKIP_IMAGES);B.pixelStorei(B.UNPACK_ROW_LENGTH,Be.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Be.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,se),B.pixelStorei(B.UNPACK_SKIP_ROWS,ne),B.pixelStorei(B.UNPACK_SKIP_IMAGES,ae);const Ve=v.isDataArrayTexture||v.isData3DTexture,_t=C.isDataArrayTexture||C.isData3DTexture;if(v.isDepthTexture){const Ct=Ue.get(v),ht=Ue.get(C),yt=Ue.get(Ct.__renderTarget),Cs=Ue.get(ht.__renderTarget);Ne.bindFramebuffer(B.READ_FRAMEBUFFER,yt.__webglFramebuffer),Ne.bindFramebuffer(B.DRAW_FRAMEBUFFER,Cs.__webglFramebuffer);for(let Yn=0;Yn<K;Yn++)Ve&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ue.get(v).__webglTexture,D,ae+Yn),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ue.get(C).__webglTexture,H,Ce+Yn)),B.blitFramebuffer(se,ne,G,W,fe,he,G,W,B.DEPTH_BUFFER_BIT,B.NEAREST);Ne.bindFramebuffer(B.READ_FRAMEBUFFER,null),Ne.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(D!==0||v.isRenderTargetTexture||Ue.has(v)){const Ct=Ue.get(v),ht=Ue.get(C);Ne.bindFramebuffer(B.READ_FRAMEBUFFER,A),Ne.bindFramebuffer(B.DRAW_FRAMEBUFFER,U);for(let yt=0;yt<K;yt++)Ve?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ct.__webglTexture,D,ae+yt):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ct.__webglTexture,D),_t?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ht.__webglTexture,H,Ce+yt):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,ht.__webglTexture,H),D!==0?B.blitFramebuffer(se,ne,G,W,fe,he,G,W,B.COLOR_BUFFER_BIT,B.NEAREST):_t?B.copyTexSubImage3D($e,H,fe,he,Ce+yt,se,ne,G,W):B.copyTexSubImage2D($e,H,fe,he,se,ne,G,W);Ne.bindFramebuffer(B.READ_FRAMEBUFFER,null),Ne.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else _t?v.isDataTexture||v.isData3DTexture?B.texSubImage3D($e,H,fe,he,Ce,G,W,K,Le,Ae,Be.data):C.isCompressedArrayTexture?B.compressedTexSubImage3D($e,H,fe,he,Ce,G,W,K,Le,Be.data):B.texSubImage3D($e,H,fe,he,Ce,G,W,K,Le,Ae,Be):v.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,H,fe,he,G,W,Le,Ae,Be.data):v.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,H,fe,he,Be.width,Be.height,Le,Be.data):B.texSubImage2D(B.TEXTURE_2D,H,fe,he,G,W,Le,Ae,Be);B.pixelStorei(B.UNPACK_ROW_LENGTH,we),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,lt),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Et),B.pixelStorei(B.UNPACK_SKIP_ROWS,st),B.pixelStorei(B.UNPACK_SKIP_IMAGES,nt),H===0&&C.generateMipmaps&&B.generateMipmap($e),Ne.unbindTexture()},this.copyTextureToTexture3D=function(v,C,b=null,L=null,D=0){return rs('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(v,C,b,L,D)},this.initRenderTarget=function(v){Ue.get(v).__webglFramebuffer===void 0&&I.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?I.setTextureCube(v,0):v.isData3DTexture?I.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?I.setTexture2DArray(v,0):I.setTexture2D(v,0),Ne.unbindTexture()},this.resetState=function(){F=0,N=0,z=null,Ne.reset(),qe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ot._getDrawingBufferColorSpace(e),t.unpackColorSpace=ot._getUnpackColorSpace()}}/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/var Zt=Uint8Array,wi=Uint16Array,WS=Int32Array,Mu=new Zt([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Tu=new Zt([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),qS=new Zt([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Au=function(i,e){for(var t=new wi(31),n=0;n<31;++n)t[n]=e+=1<<i[n-1];for(var r=new WS(t[30]),n=1;n<30;++n)for(var s=t[n];s<t[n+1];++s)r[s]=s-t[n]<<5|n;return{b:t,r}},Cu=Au(Mu,2),wu=Cu.b,XS=Cu.r;wu[28]=258,XS[258]=28;var $S=Au(Tu,0),YS=$S.b,ea=new wi(32768);for(var pt=0;pt<32768;++pt){var Vn=(pt&43690)>>1|(pt&21845)<<1;Vn=(Vn&52428)>>2|(Vn&13107)<<2,Vn=(Vn&61680)>>4|(Vn&3855)<<4,ea[pt]=((Vn&65280)>>8|(Vn&255)<<8)>>1}var tr=(function(i,e,t){for(var n=i.length,r=0,s=new wi(e);r<n;++r)i[r]&&++s[i[r]-1];var o=new wi(e);for(r=1;r<e;++r)o[r]=o[r-1]+s[r-1]<<1;var a;if(t){a=new wi(1<<e);var l=15-e;for(r=0;r<n;++r)if(i[r])for(var f=r<<4|i[r],d=e-i[r],h=o[i[r]-1]++<<d,p=h|(1<<d)-1;h<=p;++h)a[ea[h]>>l]=f}else for(a=new wi(n),r=0;r<n;++r)i[r]&&(a[r]=ea[o[i[r]-1]++]>>15-i[r]);return a}),_r=new Zt(288);for(var pt=0;pt<144;++pt)_r[pt]=8;for(var pt=144;pt<256;++pt)_r[pt]=9;for(var pt=256;pt<280;++pt)_r[pt]=7;for(var pt=280;pt<288;++pt)_r[pt]=8;var Ru=new Zt(32);for(var pt=0;pt<32;++pt)Ru[pt]=5;var KS=tr(_r,9,1),ZS=tr(Ru,5,1),ro=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},an=function(i,e,t){var n=e/8|0;return(i[n]|i[n+1]<<8)>>(e&7)&t},so=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},JS=function(i){return(i+7)/8|0},QS=function(i,e,t){return(t==null||t>i.length)&&(t=i.length),new Zt(i.subarray(e,t))},jS=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],ln=function(i,e,t){var n=new Error(e||jS[i]);if(n.code=i,Error.captureStackTrace&&Error.captureStackTrace(n,ln),!t)throw n;return n},eE=function(i,e,t,n){var r=i.length,s=0;if(!r||e.f&&!e.l)return t||new Zt(0);var o=!t,a=o||e.i!=2,l=e.i;o&&(t=new Zt(r*3));var f=function(ft){var ct=t.length;if(ft>ct){var Ke=new Zt(Math.max(ct*2,ft));Ke.set(t),t=Ke}},d=e.f||0,h=e.p||0,p=e.b||0,g=e.l,S=e.d,y=e.m,x=e.n,m=r*8;do{if(!g){d=an(i,h,1);var P=an(i,h+1,3);if(h+=3,P)if(P==1)g=KS,S=ZS,y=9,x=5;else if(P==2){var F=an(i,h,31)+257,N=an(i,h+10,15)+4,z=F+an(i,h+5,31)+1;h+=14;for(var R=new Zt(z),M=new Zt(19),O=0;O<N;++O)M[qS[O]]=an(i,h+O*3,7);h+=N*3;for(var Z=ro(M),Y=(1<<Z)-1,ie=tr(M,Z,1),O=0;O<z;){var le=ie[an(i,h,Y)];h+=le&15;var w=le>>4;if(w<16)R[O++]=w;else{var ee=0,ce=0;for(w==16?(ce=3+an(i,h,3),h+=2,ee=R[O-1]):w==17?(ce=3+an(i,h,7),h+=3):w==18&&(ce=11+an(i,h,127),h+=7);ce--;)R[O++]=ee}}var Q=R.subarray(0,F),ge=R.subarray(F);y=ro(Q),x=ro(ge),g=tr(Q,y,1),S=tr(ge,x,1)}else ln(1);else{var w=JS(h)+4,T=i[w-4]|i[w-3]<<8,V=w+T;if(V>r){l&&ln(0);break}a&&f(p+T),t.set(i.subarray(w,V),p),e.b=p+=T,e.p=h=V*8,e.f=d;continue}if(h>m){l&&ln(0);break}}a&&f(p+131072);for(var ve=(1<<y)-1,be=(1<<x)-1,ze=h;;ze=h){var ee=g[so(i,h)&ve],Je=ee>>4;if(h+=ee&15,h>m){l&&ln(0);break}if(ee||ln(2),Je<256)t[p++]=Je;else if(Je==256){ze=h,g=null;break}else{var j=Je-254;if(Je>264){var O=Je-257,pe=Mu[O];j=an(i,h,(1<<pe)-1)+wu[O],h+=pe}var me=S[so(i,h)&be],_e=me>>4;me||ln(3),h+=me&15;var ge=YS[_e];if(_e>3){var pe=Tu[_e];ge+=so(i,h)&(1<<pe)-1,h+=pe}if(h>m){l&&ln(0);break}a&&f(p+131072);var Pe=p+j;if(p<ge){var Qe=s-ge,He=Math.min(ge,Pe);for(Qe+p<0&&ln(3);p<He;++p)t[p]=n[Qe+p]}for(;p<Pe;++p)t[p]=t[p-ge]}}e.l=g,e.p=ze,e.b=p,e.f=d,g&&(d=1,e.m=y,e.d=S,e.n=x)}while(!d);return p!=t.length&&o?QS(t,0,p):t.subarray(0,p)},tE=new Zt(0),nE=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&ln(6,"invalid zlib data"),(i[1]>>5&1)==1&&ln(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function Yr(i,e){return eE(i.subarray(nE(i),-4),{i:2},e,e)}var iE=typeof TextDecoder<"u"&&new TextDecoder,rE=0;try{iE.decode(tE,{stream:!0}),rE=1}catch{}class sE extends r_{constructor(e){super(e),this.type=Wt}parse(e){const R=Math.pow(2.7182818,2.2);function M(_,A){let U=0;for(let C=0;C<65536;++C)(C==0||_[C>>3]&1<<(C&7))&&(A[U++]=C);const v=U-1;for(;U<65536;)A[U++]=0;return v}function O(_){for(let A=0;A<16384;A++)_[A]={},_[A].len=0,_[A].lit=0,_[A].p=null}const Z={l:0,c:0,lc:0};function Y(_,A,U,v,C){for(;U<_;)A=A<<8|Me(v,C),U+=8;U-=_,Z.l=A>>U&(1<<_)-1,Z.c=A,Z.lc=U}const ie=new Array(59);function le(_){for(let U=0;U<=58;++U)ie[U]=0;for(let U=0;U<65537;++U)ie[_[U]]+=1;let A=0;for(let U=58;U>0;--U){const v=A+ie[U]>>1;ie[U]=A,A=v}for(let U=0;U<65537;++U){const v=_[U];v>0&&(_[U]=v|ie[v]++<<6)}}function ee(_,A,U,v,C,b){const L=A;let D=0,H=0;for(;v<=C;v++){if(L.value-A.value>U)return!1;Y(6,D,H,_,L);const G=Z.l;if(D=Z.c,H=Z.lc,b[v]=G,G==63){if(L.value-A.value>U)throw new Error("Something wrong with hufUnpackEncTable");Y(8,D,H,_,L);let W=Z.l+6;if(D=Z.c,H=Z.lc,v+W>C+1)throw new Error("Something wrong with hufUnpackEncTable");for(;W--;)b[v++]=0;v--}else if(G>=59){let W=G-59+2;if(v+W>C+1)throw new Error("Something wrong with hufUnpackEncTable");for(;W--;)b[v++]=0;v--}}le(b)}function ce(_){return _&63}function Q(_){return _>>6}function ge(_,A,U,v){for(;A<=U;A++){const C=Q(_[A]),b=ce(_[A]);if(C>>b)throw new Error("Invalid table entry");if(b>14){const L=v[C>>b-14];if(L.len)throw new Error("Invalid table entry");if(L.lit++,L.p){const D=L.p;L.p=new Array(L.lit);for(let H=0;H<L.lit-1;++H)L.p[H]=D[H]}else L.p=new Array(1);L.p[L.lit-1]=A}else if(b){let L=0;for(let D=1<<14-b;D>0;D--){const H=v[(C<<14-b)+L];if(H.len||H.p)throw new Error("Invalid table entry");H.len=b,H.lit=A,L++}}}return!0}const ve={c:0,lc:0};function be(_,A,U,v){_=_<<8|Me(U,v),A+=8,ve.c=_,ve.lc=A}const ze={c:0,lc:0};function Je(_,A,U,v,C,b,L,D,H){if(_==A){v<8&&(be(U,v,C,b),U=ve.c,v=ve.lc),v-=8;let G=U>>v;if(G=new Uint8Array([G])[0],D.value+G>H)return!1;const W=L[D.value-1];for(;G-- >0;)L[D.value++]=W}else if(D.value<H)L[D.value++]=_;else return!1;ze.c=U,ze.lc=v}function j(_){return _&65535}function pe(_){const A=j(_);return A>32767?A-65536:A}const me={a:0,b:0};function _e(_,A){const U=pe(_),C=pe(A),b=U+(C&1)+(C>>1),L=b,D=b-C;me.a=L,me.b=D}function Pe(_,A){const U=j(_),v=j(A),C=U-(v>>1)&65535,b=v+C-32768&65535;me.a=b,me.b=C}function Qe(_,A,U,v,C,b,L){const D=L<16384,H=U>C?C:U;let G=1,W,K;for(;G<=H;)G<<=1;for(G>>=1,W=G,G>>=1;G>=1;){K=0;const se=K+b*(C-W),ne=b*G,ae=b*W,fe=v*G,he=v*W;let Ce,Be,Le,Ae;for(;K<=se;K+=ae){let $e=K;const we=K+v*(U-W);for(;$e<=we;$e+=he){const lt=$e+fe,Et=$e+ne,st=Et+fe;D?(_e(_[$e+A],_[Et+A]),Ce=me.a,Le=me.b,_e(_[lt+A],_[st+A]),Be=me.a,Ae=me.b,_e(Ce,Be),_[$e+A]=me.a,_[lt+A]=me.b,_e(Le,Ae),_[Et+A]=me.a,_[st+A]=me.b):(Pe(_[$e+A],_[Et+A]),Ce=me.a,Le=me.b,Pe(_[lt+A],_[st+A]),Be=me.a,Ae=me.b,Pe(Ce,Be),_[$e+A]=me.a,_[lt+A]=me.b,Pe(Le,Ae),_[Et+A]=me.a,_[st+A]=me.b)}if(U&G){const lt=$e+ne;D?_e(_[$e+A],_[lt+A]):Pe(_[$e+A],_[lt+A]),Ce=me.a,_[lt+A]=me.b,_[$e+A]=Ce}}if(C&G){let $e=K;const we=K+v*(U-W);for(;$e<=we;$e+=he){const lt=$e+fe;D?_e(_[$e+A],_[lt+A]):Pe(_[$e+A],_[lt+A]),Ce=me.a,_[lt+A]=me.b,_[$e+A]=Ce}}W=G,G>>=1}return K}function He(_,A,U,v,C,b,L,D,H){let G=0,W=0;const K=L,se=Math.trunc(v.value+(C+7)/8);for(;v.value<se;)for(be(G,W,U,v),G=ve.c,W=ve.lc;W>=14;){const ae=G>>W-14&16383,fe=A[ae];if(fe.len)W-=fe.len,Je(fe.lit,b,G,W,U,v,D,H,K),G=ze.c,W=ze.lc;else{if(!fe.p)throw new Error("hufDecode issues");let he;for(he=0;he<fe.lit;he++){const Ce=ce(_[fe.p[he]]);for(;W<Ce&&v.value<se;)be(G,W,U,v),G=ve.c,W=ve.lc;if(W>=Ce&&Q(_[fe.p[he]])==(G>>W-Ce&(1<<Ce)-1)){W-=Ce,Je(fe.p[he],b,G,W,U,v,D,H,K),G=ze.c,W=ze.lc;break}}if(he==fe.lit)throw new Error("hufDecode issues")}}const ne=8-C&7;for(G>>=ne,W-=ne;W>0;){const ae=A[G<<14-W&16383];if(ae.len)W-=ae.len,Je(ae.lit,b,G,W,U,v,D,H,K),G=ze.c,W=ze.lc;else throw new Error("hufDecode issues")}return!0}function ft(_,A,U,v,C,b){const L={value:0},D=U.value,H=De(A,U),G=De(A,U);U.value+=4;const W=De(A,U);if(U.value+=4,H<0||H>=65537||G<0||G>=65537)throw new Error("Something wrong with HUF_ENCSIZE");const K=new Array(65537),se=new Array(16384);O(se);const ne=v-(U.value-D);if(ee(_,U,ne,H,G,K),W>8*(v-(U.value-D)))throw new Error("Something wrong with hufUncompress");ge(K,H,G,se),He(K,se,_,U,W,G,b,C,L)}function ct(_,A,U){for(let v=0;v<U;++v)A[v]=_[A[v]]}function Ke(_){for(let A=1;A<_.length;A++){const U=_[A-1]+_[A]-128;_[A]=U}}function B(_,A){let U=0,v=Math.floor((_.length+1)/2),C=0;const b=_.length-1;for(;!(C>b||(A[C++]=_[U++],C>b));)A[C++]=_[v++]}function Ut(_){let A=_.byteLength;const U=new Array;let v=0;const C=new DataView(_);for(;A>0;){const b=C.getInt8(v++);if(b<0){const L=-b;A-=L+1;for(let D=0;D<L;D++)U.push(C.getUint8(v++))}else{const L=b;A-=2;const D=C.getUint8(v++);for(let H=0;H<L+1;H++)U.push(D)}}return U}function tt(_,A,U,v,C,b){let L=new DataView(b.buffer);const D=U[_.idx[0]].width,H=U[_.idx[0]].height,G=3,W=Math.floor(D/8),K=Math.ceil(D/8),se=Math.ceil(H/8),ne=D-(K-1)*8,ae=H-(se-1)*8,fe={value:0},he=new Array(G),Ce=new Array(G),Be=new Array(G),Le=new Array(G),Ae=new Array(G);for(let we=0;we<G;++we)Ae[we]=A[_.idx[we]],he[we]=we<1?0:he[we-1]+K*se,Ce[we]=new Float32Array(64),Be[we]=new Uint16Array(64),Le[we]=new Uint16Array(K*64);for(let we=0;we<se;++we){let lt=8;we==se-1&&(lt=ae);let Et=8;for(let nt=0;nt<K;++nt){nt==K-1&&(Et=ne);for(let Ve=0;Ve<G;++Ve)Be[Ve].fill(0),Be[Ve][0]=C[he[Ve]++],je(fe,v,Be[Ve]),Ne(Be[Ve],Ce[Ve]),dt(Ce[Ve]);Ue(Ce);for(let Ve=0;Ve<G;++Ve)I(Ce[Ve],Le[Ve],nt*64)}let st=0;for(let nt=0;nt<G;++nt){const Ve=U[_.idx[nt]].type;for(let _t=8*we;_t<8*we+lt;++_t){st=Ae[nt][_t];for(let Ct=0;Ct<W;++Ct){const ht=Ct*64+(_t&7)*8;L.setUint16(st+0*Ve,Le[nt][ht+0],!0),L.setUint16(st+2*Ve,Le[nt][ht+1],!0),L.setUint16(st+4*Ve,Le[nt][ht+2],!0),L.setUint16(st+6*Ve,Le[nt][ht+3],!0),L.setUint16(st+8*Ve,Le[nt][ht+4],!0),L.setUint16(st+10*Ve,Le[nt][ht+5],!0),L.setUint16(st+12*Ve,Le[nt][ht+6],!0),L.setUint16(st+14*Ve,Le[nt][ht+7],!0),st+=16*Ve}}if(W!=K)for(let _t=8*we;_t<8*we+lt;++_t){const Ct=Ae[nt][_t]+8*W*2*Ve,ht=W*64+(_t&7)*8;for(let yt=0;yt<Et;++yt)L.setUint16(Ct+yt*2*Ve,Le[nt][ht+yt],!0)}}}const $e=new Uint16Array(D);L=new DataView(b.buffer);for(let we=0;we<G;++we){U[_.idx[we]].decoded=!0;const lt=U[_.idx[we]].type;if(U[we].type==2)for(let Et=0;Et<H;++Et){const st=Ae[we][Et];for(let nt=0;nt<D;++nt)$e[nt]=L.getUint16(st+nt*2*lt,!0);for(let nt=0;nt<D;++nt)L.setFloat32(st+nt*2*lt,$($e[nt]),!0)}}}function je(_,A,U){let v,C=1;for(;C<64;)v=A[_.value],v==65280?C=64:v>>8==255?C+=v&255:(U[C]=v,C++),_.value++}function Ne(_,A){A[0]=$(_[0]),A[1]=$(_[1]),A[2]=$(_[5]),A[3]=$(_[6]),A[4]=$(_[14]),A[5]=$(_[15]),A[6]=$(_[27]),A[7]=$(_[28]),A[8]=$(_[2]),A[9]=$(_[4]),A[10]=$(_[7]),A[11]=$(_[13]),A[12]=$(_[16]),A[13]=$(_[26]),A[14]=$(_[29]),A[15]=$(_[42]),A[16]=$(_[3]),A[17]=$(_[8]),A[18]=$(_[12]),A[19]=$(_[17]),A[20]=$(_[25]),A[21]=$(_[30]),A[22]=$(_[41]),A[23]=$(_[43]),A[24]=$(_[9]),A[25]=$(_[11]),A[26]=$(_[18]),A[27]=$(_[24]),A[28]=$(_[31]),A[29]=$(_[40]),A[30]=$(_[44]),A[31]=$(_[53]),A[32]=$(_[10]),A[33]=$(_[19]),A[34]=$(_[23]),A[35]=$(_[32]),A[36]=$(_[39]),A[37]=$(_[45]),A[38]=$(_[52]),A[39]=$(_[54]),A[40]=$(_[20]),A[41]=$(_[22]),A[42]=$(_[33]),A[43]=$(_[38]),A[44]=$(_[46]),A[45]=$(_[51]),A[46]=$(_[55]),A[47]=$(_[60]),A[48]=$(_[21]),A[49]=$(_[34]),A[50]=$(_[37]),A[51]=$(_[47]),A[52]=$(_[50]),A[53]=$(_[56]),A[54]=$(_[59]),A[55]=$(_[61]),A[56]=$(_[35]),A[57]=$(_[36]),A[58]=$(_[48]),A[59]=$(_[49]),A[60]=$(_[57]),A[61]=$(_[58]),A[62]=$(_[62]),A[63]=$(_[63])}function dt(_){const A=.5*Math.cos(.7853975),U=.5*Math.cos(3.14159/16),v=.5*Math.cos(3.14159/8),C=.5*Math.cos(3*3.14159/16),b=.5*Math.cos(5*3.14159/16),L=.5*Math.cos(3*3.14159/8),D=.5*Math.cos(7*3.14159/16),H=new Array(4),G=new Array(4),W=new Array(4),K=new Array(4);for(let se=0;se<8;++se){const ne=se*8;H[0]=v*_[ne+2],H[1]=L*_[ne+2],H[2]=v*_[ne+6],H[3]=L*_[ne+6],G[0]=U*_[ne+1]+C*_[ne+3]+b*_[ne+5]+D*_[ne+7],G[1]=C*_[ne+1]-D*_[ne+3]-U*_[ne+5]-b*_[ne+7],G[2]=b*_[ne+1]-U*_[ne+3]+D*_[ne+5]+C*_[ne+7],G[3]=D*_[ne+1]-b*_[ne+3]+C*_[ne+5]-U*_[ne+7],W[0]=A*(_[ne+0]+_[ne+4]),W[3]=A*(_[ne+0]-_[ne+4]),W[1]=H[0]+H[3],W[2]=H[1]-H[2],K[0]=W[0]+W[1],K[1]=W[3]+W[2],K[2]=W[3]-W[2],K[3]=W[0]-W[1],_[ne+0]=K[0]+G[0],_[ne+1]=K[1]+G[1],_[ne+2]=K[2]+G[2],_[ne+3]=K[3]+G[3],_[ne+4]=K[3]-G[3],_[ne+5]=K[2]-G[2],_[ne+6]=K[1]-G[1],_[ne+7]=K[0]-G[0]}for(let se=0;se<8;++se)H[0]=v*_[16+se],H[1]=L*_[16+se],H[2]=v*_[48+se],H[3]=L*_[48+se],G[0]=U*_[8+se]+C*_[24+se]+b*_[40+se]+D*_[56+se],G[1]=C*_[8+se]-D*_[24+se]-U*_[40+se]-b*_[56+se],G[2]=b*_[8+se]-U*_[24+se]+D*_[40+se]+C*_[56+se],G[3]=D*_[8+se]-b*_[24+se]+C*_[40+se]-U*_[56+se],W[0]=A*(_[se]+_[32+se]),W[3]=A*(_[se]-_[32+se]),W[1]=H[0]+H[3],W[2]=H[1]-H[2],K[0]=W[0]+W[1],K[1]=W[3]+W[2],K[2]=W[3]-W[2],K[3]=W[0]-W[1],_[0+se]=K[0]+G[0],_[8+se]=K[1]+G[1],_[16+se]=K[2]+G[2],_[24+se]=K[3]+G[3],_[32+se]=K[3]-G[3],_[40+se]=K[2]-G[2],_[48+se]=K[1]-G[1],_[56+se]=K[0]-G[0]}function Ue(_){for(let A=0;A<64;++A){const U=_[0][A],v=_[1][A],C=_[2][A];_[0][A]=U+1.5747*C,_[1][A]=U-.1873*v-.4682*C,_[2][A]=U+1.8556*v}}function I(_,A,U){for(let v=0;v<64;++v)A[U+v]=Kl.toHalfFloat(E(_[v]))}function E(_){return _<=1?Math.sign(_)*Math.pow(Math.abs(_),2.2):Math.sign(_)*Math.pow(R,Math.abs(_)-1)}function X(_){return new DataView(_.array.buffer,_.offset.value,_.size)}function re(_){const A=_.viewer.buffer.slice(_.offset.value,_.offset.value+_.size),U=new Uint8Array(Ut(A)),v=new Uint8Array(U.length);return Ke(U),B(U,v),new DataView(v.buffer)}function ue(_){const A=_.array.slice(_.offset.value,_.offset.value+_.size),U=Yr(A),v=new Uint8Array(U.length);return Ke(U),B(U,v),new DataView(v.buffer)}function te(_){const A=_.viewer,U={value:_.offset.value},v=new Uint16Array(_.columns*_.lines*(_.inputChannels.length*_.type)),C=new Uint8Array(8192);let b=0;const L=new Array(_.inputChannels.length);for(let ae=0,fe=_.inputChannels.length;ae<fe;ae++)L[ae]={},L[ae].start=b,L[ae].end=L[ae].start,L[ae].nx=_.columns,L[ae].ny=_.lines,L[ae].size=_.type,b+=L[ae].nx*L[ae].ny*L[ae].size;const D=J(A,U),H=J(A,U);if(H>=8192)throw new Error("Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");if(D<=H)for(let ae=0;ae<H-D+1;ae++)C[ae+D]=We(A,U);const G=new Uint16Array(65536),W=M(C,G),K=De(A,U);ft(_.array,A,U,K,v,b);for(let ae=0;ae<_.inputChannels.length;++ae){const fe=L[ae];for(let he=0;he<L[ae].size;++he)Qe(v,fe.start+he,fe.nx,fe.size,fe.ny,fe.nx*fe.size,W)}ct(G,v,b);let se=0;const ne=new Uint8Array(v.buffer.byteLength);for(let ae=0;ae<_.lines;ae++)for(let fe=0;fe<_.inputChannels.length;fe++){const he=L[fe],Ce=he.nx*he.size,Be=new Uint8Array(v.buffer,he.end*2,Ce*2);ne.set(Be,se),se+=Ce*2,he.end+=Ce}return new DataView(ne.buffer)}function Ie(_){const A=_.array.slice(_.offset.value,_.offset.value+_.size),U=Yr(A),v=_.inputChannels.length*_.lines*_.columns*_.totalBytes,C=new ArrayBuffer(v),b=new DataView(C);let L=0,D=0;const H=new Array(4);for(let G=0;G<_.lines;G++)for(let W=0;W<_.inputChannels.length;W++){let K=0;switch(_.inputChannels[W].pixelType){case 1:H[0]=L,H[1]=H[0]+_.columns,L=H[1]+_.columns;for(let ne=0;ne<_.columns;++ne){const ae=U[H[0]++]<<8|U[H[1]++];K+=ae,b.setUint16(D,K,!0),D+=2}break;case 2:H[0]=L,H[1]=H[0]+_.columns,H[2]=H[1]+_.columns,L=H[2]+_.columns;for(let ne=0;ne<_.columns;++ne){const ae=U[H[0]++]<<24|U[H[1]++]<<16|U[H[2]++]<<8;K+=ae,b.setUint32(D,K,!0),D+=4}break}}return b}function Se(_){const A=_.viewer,U={value:_.offset.value},v=new Uint8Array(_.columns*_.lines*(_.inputChannels.length*_.type*2)),C={version:Oe(A,U),unknownUncompressedSize:Oe(A,U),unknownCompressedSize:Oe(A,U),acCompressedSize:Oe(A,U),dcCompressedSize:Oe(A,U),rleCompressedSize:Oe(A,U),rleUncompressedSize:Oe(A,U),rleRawSize:Oe(A,U),totalAcUncompressedCount:Oe(A,U),totalDcUncompressedCount:Oe(A,U),acCompression:Oe(A,U)};if(C.version<2)throw new Error("EXRLoader.parse: "+mn.compression+" version "+C.version+" is unsupported");const b=new Array;let L=J(A,U)-2;for(;L>0;){const fe=Fe(A.buffer,U),he=We(A,U),Ce=he>>2&3,Be=(he>>4)-1,Le=new Int8Array([Be])[0],Ae=We(A,U);b.push({name:fe,index:Le,type:Ae,compression:Ce}),L-=fe.length+3}const D=mn.channels,H=new Array(_.inputChannels.length);for(let fe=0;fe<_.inputChannels.length;++fe){const he=H[fe]={},Ce=D[fe];he.name=Ce.name,he.compression=0,he.decoded=!1,he.type=Ce.pixelType,he.pLinear=Ce.pLinear,he.width=_.columns,he.height=_.lines}const G={idx:new Array(3)};for(let fe=0;fe<_.inputChannels.length;++fe){const he=H[fe];for(let Ce=0;Ce<b.length;++Ce){const Be=b[Ce];he.name==Be.name&&(he.compression=Be.compression,Be.index>=0&&(G.idx[Be.index]=fe),he.offset=fe)}}let W,K,se;if(C.acCompressedSize>0)switch(C.acCompression){case 0:W=new Uint16Array(C.totalAcUncompressedCount),ft(_.array,A,U,C.acCompressedSize,W,C.totalAcUncompressedCount);break;case 1:const fe=_.array.slice(U.value,U.value+C.totalAcUncompressedCount),he=Yr(fe);W=new Uint16Array(he.buffer),U.value+=C.totalAcUncompressedCount;break}if(C.dcCompressedSize>0){const fe={array:_.array,offset:U,size:C.dcCompressedSize};K=new Uint16Array(ue(fe).buffer),U.value+=C.dcCompressedSize}if(C.rleRawSize>0){const fe=_.array.slice(U.value,U.value+C.rleCompressedSize),he=Yr(fe);se=Ut(he.buffer),U.value+=C.rleCompressedSize}let ne=0;const ae=new Array(H.length);for(let fe=0;fe<ae.length;++fe)ae[fe]=new Array;for(let fe=0;fe<_.lines;++fe)for(let he=0;he<H.length;++he)ae[he].push(ne),ne+=H[he].width*_.type*2;tt(G,ae,H,W,K,v);for(let fe=0;fe<H.length;++fe){const he=H[fe];if(!he.decoded)switch(he.compression){case 2:let Ce=0,Be=0;for(let Le=0;Le<_.lines;++Le){let Ae=ae[fe][Ce];for(let $e=0;$e<he.width;++$e){for(let we=0;we<2*he.type;++we)v[Ae++]=se[Be+we*he.width*he.height];Be++}Ce++}break;case 1:default:throw new Error("EXRLoader.parse: unsupported channel compression")}}return new DataView(v.buffer)}function Fe(_,A){const U=new Uint8Array(_);let v=0;for(;U[A.value+v]!=0;)v+=1;const C=new TextDecoder().decode(U.slice(A.value,A.value+v));return A.value=A.value+v+1,C}function ke(_,A,U){const v=new TextDecoder().decode(new Uint8Array(_).slice(A.value,A.value+U));return A.value=A.value+U,v}function de(_,A){const U=Re(_,A),v=De(_,A);return[U,v]}function Te(_,A){const U=De(_,A),v=De(_,A);return[U,v]}function Re(_,A){const U=_.getInt32(A.value,!0);return A.value=A.value+4,U}function De(_,A){const U=_.getUint32(A.value,!0);return A.value=A.value+4,U}function Me(_,A){const U=_[A.value];return A.value=A.value+1,U}function We(_,A){const U=_.getUint8(A.value);return A.value=A.value+1,U}const Oe=function(_,A){let U;return"getBigInt64"in DataView.prototype?U=Number(_.getBigInt64(A.value,!0)):U=_.getUint32(A.value+4,!0)+Number(_.getUint32(A.value,!0)<<32),A.value+=8,U};function qe(_,A){const U=_.getFloat32(A.value,!0);return A.value+=4,U}function k(_,A){return Kl.toHalfFloat(qe(_,A))}function $(_){const A=(_&31744)>>10,U=_&1023;return(_>>15?-1:1)*(A?A===31?U?NaN:1/0:Math.pow(2,A-15)*(1+U/1024):6103515625e-14*(U/1024))}function J(_,A){const U=_.getUint16(A.value,!0);return A.value+=2,U}function oe(_,A){return $(J(_,A))}function ye(_,A,U,v){const C=U.value,b=[];for(;U.value<C+v-1;){const L=Fe(A,U),D=Re(_,U),H=We(_,U);U.value+=3;const G=Re(_,U),W=Re(_,U);b.push({name:L,pixelType:D,pLinear:H,xSampling:G,ySampling:W})}return U.value+=1,b}function Ee(_,A){const U=qe(_,A),v=qe(_,A),C=qe(_,A),b=qe(_,A),L=qe(_,A),D=qe(_,A),H=qe(_,A),G=qe(_,A);return{redX:U,redY:v,greenX:C,greenY:b,blueX:L,blueY:D,whiteX:H,whiteY:G}}function Xe(_,A){const U=["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"],v=We(_,A);return U[v]}function mt(_,A){const U=Re(_,A),v=Re(_,A),C=Re(_,A),b=Re(_,A);return{xMin:U,yMin:v,xMax:C,yMax:b}}function At(_,A){const U=["INCREASING_Y","DECREASING_Y","RANDOM_Y"],v=We(_,A);return U[v]}function at(_,A){const U=["ENVMAP_LATLONG","ENVMAP_CUBE"],v=We(_,A);return U[v]}function Ht(_,A){const U=["ONE_LEVEL","MIPMAP_LEVELS","RIPMAP_LEVELS"],v=["ROUND_DOWN","ROUND_UP"],C=De(_,A),b=De(_,A),L=We(_,A);return{xSize:C,ySize:b,levelMode:U[L&15],roundingMode:v[L>>4]}}function nn(_,A){const U=qe(_,A),v=qe(_,A);return[U,v]}function xr(_,A){const U=qe(_,A),v=qe(_,A),C=qe(_,A);return[U,v,C]}function Sr(_,A,U,v,C){if(v==="string"||v==="stringvector"||v==="iccProfile")return ke(A,U,C);if(v==="chlist")return ye(_,A,U,C);if(v==="chromaticities")return Ee(_,U);if(v==="compression")return Xe(_,U);if(v==="box2i")return mt(_,U);if(v==="envmap")return at(_,U);if(v==="tiledesc")return Ht(_,U);if(v==="lineOrder")return At(_,U);if(v==="float")return qe(_,U);if(v==="v2f")return nn(_,U);if(v==="v3f")return xr(_,U);if(v==="int")return Re(_,U);if(v==="rational")return de(_,U);if(v==="timecode")return Te(_,U);if(v==="preview")return U.value+=C,"skipped";U.value+=C}function pn(_,A){const U=Math.log2(_);return A=="ROUND_DOWN"?Math.floor(U):Math.ceil(U)}function Gi(_,A,U){let v=0;switch(_.levelMode){case"ONE_LEVEL":v=1;break;case"MIPMAP_LEVELS":v=pn(Math.max(A,U),_.roundingMode)+1;break;case"RIPMAP_LEVELS":throw new Error("THREE.EXRLoader: RIPMAP_LEVELS tiles currently unsupported.")}return v}function Wi(_,A,U,v){const C=new Array(_);for(let b=0;b<_;b++){const L=1<<b;let D=A/L|0;v=="ROUND_UP"&&D*L<A&&(D+=1);const H=Math.max(D,1);C[b]=(H+U-1)/U|0}return C}function Er(){const _=this,A=_.offset,U={value:0};for(let v=0;v<_.tileCount;v++){const C=Re(_.viewer,A),b=Re(_.viewer,A);A.value+=8,_.size=De(_.viewer,A);const L=C*_.blockWidth,D=b*_.blockHeight;_.columns=L+_.blockWidth>_.width?_.width-L:_.blockWidth,_.lines=D+_.blockHeight>_.height?_.height-D:_.blockHeight;const H=_.columns*_.totalBytes,W=_.size<_.lines*H?_.uncompress(_):X(_);A.value+=_.size;for(let K=0;K<_.lines;K++){const se=K*_.columns*_.totalBytes;for(let ne=0;ne<_.inputChannels.length;ne++){const ae=mn.channels[ne].name,fe=_.channelByteOffsets[ae]*_.columns,he=_.decodeChannels[ae];if(he===void 0)continue;U.value=se+fe;const Ce=(_.height-(1+D+K))*_.outLineWidth;for(let Be=0;Be<_.columns;Be++){const Le=Ce+(Be+L)*_.outputChannels+he;_.byteArray[Le]=_.getter(W,U)}}}}}function ci(){const _=this,A=_.offset,U={value:0};for(let v=0;v<_.height/_.blockHeight;v++){const C=Re(_.viewer,A)-mn.dataWindow.yMin;_.size=De(_.viewer,A),_.lines=C+_.blockHeight>_.height?_.height-C:_.blockHeight;const b=_.columns*_.totalBytes,D=_.size<_.lines*b?_.uncompress(_):X(_);A.value+=_.size;for(let H=0;H<_.blockHeight;H++){const G=v*_.blockHeight,W=H+_.scanOrder(G);if(W>=_.height)continue;const K=H*b,se=(_.height-1-W)*_.outLineWidth;for(let ne=0;ne<_.inputChannels.length;ne++){const ae=mn.channels[ne].name,fe=_.channelByteOffsets[ae]*_.columns,he=_.decodeChannels[ae];if(he!==void 0){U.value=K+fe;for(let Ce=0;Ce<_.columns;Ce++){const Be=se+Ce*_.outputChannels+he;_.byteArray[Be]=_.getter(D,U)}}}}}}function yr(_,A,U){const v={};if(_.getUint32(0,!0)!=20000630)throw new Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");v.version=_.getUint8(4);const C=_.getUint8(5);v.spec={singleTile:!!(C&2),longName:!!(C&4),deepFormat:!!(C&8),multiPart:!!(C&16)},U.value=8;let b=!0;for(;b;){const L=Fe(A,U);if(L==="")b=!1;else{const D=Fe(A,U),H=De(_,U),G=Sr(_,A,U,D,H);G===void 0?console.warn(`THREE.EXRLoader: Skipped unknown header attribute type '${D}'.`):v[L]=G}}if((C&-7)!=0)throw console.error("THREE.EXRHeader:",v),new Error("THREE.EXRLoader: Provided file is currently unsupported.");return v}function ui(_,A,U,v,C){const b={size:0,viewer:A,array:U,offset:v,width:_.dataWindow.xMax-_.dataWindow.xMin+1,height:_.dataWindow.yMax-_.dataWindow.yMin+1,inputChannels:_.channels,channelByteOffsets:{},scanOrder:null,totalBytes:null,columns:null,lines:null,type:null,uncompress:null,getter:null,format:null,colorSpace:Wn};switch(_.compression){case"NO_COMPRESSION":b.blockHeight=1,b.uncompress=X;break;case"RLE_COMPRESSION":b.blockHeight=1,b.uncompress=re;break;case"ZIPS_COMPRESSION":b.blockHeight=1,b.uncompress=ue;break;case"ZIP_COMPRESSION":b.blockHeight=16,b.uncompress=ue;break;case"PIZ_COMPRESSION":b.blockHeight=32,b.uncompress=te;break;case"PXR24_COMPRESSION":b.blockHeight=16,b.uncompress=Ie;break;case"DWAA_COMPRESSION":b.blockHeight=32,b.uncompress=Se;break;case"DWAB_COMPRESSION":b.blockHeight=256,b.uncompress=Se;break;default:throw new Error("EXRLoader.parse: "+_.compression+" is unsupported")}const L={};for(const W of _.channels)switch(W.name){case"Y":case"R":case"G":case"B":case"A":L[W.name]=!0,b.type=W.pixelType}let D=!1;if(L.R&&L.G&&L.B)D=!L.A,b.outputChannels=4,b.decodeChannels={R:0,G:1,B:2,A:3};else if(L.Y)b.outputChannels=1,b.decodeChannels={Y:0};else throw new Error("EXRLoader.parse: file contains unsupported data channels.");if(b.type==1)switch(C){case Jt:b.getter=oe;break;case Wt:b.getter=J;break}else if(b.type==2)switch(C){case Jt:b.getter=qe;break;case Wt:b.getter=k}else throw new Error("EXRLoader.parse: unsupported pixelType "+b.type+" for "+_.compression+".");b.columns=b.width;const H=b.width*b.height*b.outputChannels;switch(C){case Jt:b.byteArray=new Float32Array(H),D&&b.byteArray.fill(1,0,H);break;case Wt:b.byteArray=new Uint16Array(H),D&&b.byteArray.fill(15360,0,H);break;default:console.error("THREE.EXRLoader: unsupported type: ",C);break}let G=0;for(const W of _.channels)b.decodeChannels[W.name]!==void 0&&(b.channelByteOffsets[W.name]=G),G+=W.pixelType*2;if(b.totalBytes=G,b.outLineWidth=b.width*b.outputChannels,_.lineOrder==="INCREASING_Y"?b.scanOrder=W=>W:b.scanOrder=W=>b.height-1-W,b.outputChannels==4?(b.format=Qt,b.colorSpace=Wn):(b.format=da,b.colorSpace=Tn),_.spec.singleTile){b.blockHeight=_.tiles.ySize,b.blockWidth=_.tiles.xSize;const W=Gi(_.tiles,b.width,b.height),K=Wi(W,b.width,_.tiles.xSize,_.tiles.roundingMode),se=Wi(W,b.height,_.tiles.ySize,_.tiles.roundingMode);b.tileCount=K[0]*se[0];for(let ne=0;ne<W;ne++)for(let ae=0;ae<se[ne];ae++)for(let fe=0;fe<K[ne];fe++)Oe(A,v);b.decode=Er.bind(b)}else{b.blockWidth=b.width;const W=Math.ceil(b.height/b.blockHeight);for(let K=0;K<W;K++)Oe(A,v);b.decode=ci.bind(b)}return b}const qi={value:0},Xi=new DataView(e),As=new Uint8Array(e),mn=yr(Xi,e,qi),Dn=ui(mn,Xi,As,qi,this.type);return Dn.decode(),{header:mn,width:Dn.width,height:Dn.height,data:Dn.byteArray,format:Dn.format,colorSpace:Dn.colorSpace,type:this.type}}setDataType(e){return this.type=e,this}load(e,t,n,r){function s(o,a){o.colorSpace=a.colorSpace,o.minFilter=Nt,o.magFilter=Nt,o.generateMipmaps=!1,o.flipY=!1,t&&t(o,a)}return super.load(e,s,n,r)}}const os={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class vr{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const oE=new _u(-1,1,1,-1,0,1);class aE extends In{constructor(){super(),this.setAttribute("position",new tn([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new tn([0,2,0,0,2,0],2))}}const lE=new aE;class bu{constructor(e){this._mesh=new jt(lE,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,oE)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Pu extends vr{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Ft?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ms.clone(e.uniforms),this.material=new Ft({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new bu(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class wc extends vr{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const r=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),s.buffers.stencil.setFunc(r.ALWAYS,o,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(r.EQUAL,1,4294967295),s.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),s.buffers.stencil.setLocked(!0)}}class cE extends vr{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class uE{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new Ge);this._width=n.width,this._height=n.height,t=new un(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Wt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Pu(os),this.copyPass.material.blending=Rn,this.clock=new o_}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let r=0,s=this.passes.length;r<s;r++){const o=this.passes[r];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}wc!==void 0&&(o instanceof wc?n=!0:o instanceof cE&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Ge);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class fE extends vr{constructor(e,t,n=null,r=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new it}render(e,t,n){const r=e.autoClear;e.autoClear=!1;let s,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=r}}const dE={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new it(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Oi extends vr{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e!==void 0?new Ge(e.x,e.y):new Ge(256,256),this.clearColor=new it(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new un(s,o,{type:Wt}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let d=0;d<this.nMips;d++){const h=new un(s,o,{type:Wt});h.texture.name="UnrealBloomPass.h"+d,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const p=new un(s,o,{type:Wt});p.texture.name="UnrealBloomPass.v"+d,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),s=Math.round(s/2),o=Math.round(o/2)}const a=dE;this.highPassUniforms=ms.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ft({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let d=0;d<this.nMips;d++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[d])),this.separableBlurMaterials[d].uniforms.invSize.value=new Ge(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const f=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=f,this.bloomTintColors=[new q(1,1,1),new q(1,1,1),new q(1,1,1),new q(1,1,1),new q(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ms.clone(os.uniforms),this.blendMaterial=new Ft({uniforms:this.copyUniforms,vertexShader:os.vertexShader,fragmentShader:os.fragmentShader,blending:uo,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new it,this._oldClearAlpha=1,this._basic=new va,this._fsQuad=new bu(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,r),this.renderTargetsVertical[s].setSize(n,r),this.separableBlurMaterials[s].uniforms.invSize.value=new Ge(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,t,n,r,s){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Oi.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Oi.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),a=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Ft({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Ge(.5,.5)},direction:{value:new Ge(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(e){return new Ft({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Oi.BlurDirectionX=new Ge(1,0);Oi.BlurDirectionY=new Ge(0,1);const hE={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new Ge(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`};/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const pE=`precision highp float;

in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`,mE=`precision highp float;

out vec4 fragmentColor;

uniform vec2 resolution;
uniform float rand;

void main() {
  float aspectRatio = resolution.x / resolution.y; 
  vec2 vUv = gl_FragCoord.xy / resolution;
  float noise = (fract(sin(dot(vUv, vec2(12.9898 + rand,78.233)*2.0)) * 43758.5453));

  vUv -= .5;
  vUv.x *= aspectRatio;

  float factor = 4.;
  float d = factor * length(vUv);
  vec3 from = vec3(3.) / 255.;
  vec3 to = vec3(16., 12., 20.) / 2550.;

  fragmentColor = vec4(mix(from, to, d) + .005 * noise, 1.);
}
`;/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const gE=`#define STANDARD
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

uniform float time;

uniform vec4 inputData;
uniform vec4 outputData;

vec3 calc( vec3 pos ) {

  vec3 dir = normalize( pos );
  vec3 p = dir + vec3( time, 0., 0. );
  return pos +
    1. * inputData.x * inputData.y * dir * (.5 + .5 * sin(inputData.z * pos.x + time)) +
    1. * outputData.x * outputData.y * dir * (.5 + .5 * sin(outputData.z * pos.y + time))
  ;
}

vec3 spherical( float r, float theta, float phi ) {
  return r * vec3(
    cos( theta ) * cos( phi ),
    sin( theta ) * cos( phi ),
    sin( phi )
  );
}

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

  float inc = 0.001;

  float r = length( position );
  float theta = ( uv.x + 0.5 ) * 2. * PI;
  float phi = -( uv.y + 0.5 ) * PI;

  vec3 np = calc( spherical( r, theta, phi )  );

  vec3 tangent = normalize( calc( spherical( r, theta + inc, phi ) ) - np );
  vec3 bitangent = normalize( calc( spherical( r, theta, phi + inc ) ) - np );
  transformedNormal = -normalMatrix * normalize( cross( tangent, bitangent ) );

  vNormal = normalize( transformedNormal );

  transformed = np;

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
}`;var _E=Object.defineProperty,vE=Object.getOwnPropertyDescriptor,ya=(i,e,t,n)=>{for(var r=n>1?void 0:n?vE(e,t):e,s=i.length-1,o;s>=0;s--)(o=i[s])&&(r=(n?o(e,t,r):o(r))||r);return n&&r&&_E(e,t,r),r};let ur=class extends Ri{constructor(){super(...arguments),this.prevTime=0,this.rotation=new q(0,0,0)}set outputNode(i){this._outputNode=i,this.outputAnalyser=new Il(this._outputNode)}get outputNode(){return this._outputNode}set inputNode(i){this._inputNode=i,this.inputAnalyser=new Il(this._inputNode)}get inputNode(){return this._inputNode}connectedCallback(){super.connectedCallback()}init(){const i=new Xg;i.background=new it(1051668);const e=new jt(new gs(10,5),new Zg({uniforms:{resolution:{value:new Ge(1,1)},rand:{value:0}},vertexShader:pE,fragmentShader:mE,glslVersion:Zo}));e.material.side=Ot,i.add(e),this.backdrop=e;const t=new Kt(75,window.innerWidth/window.innerHeight,.1,1e3);t.position.set(2,-2,5),this.camera=t;const n=new GS({canvas:this.canvas,antialias:!1});n.setSize(window.innerWidth,window.innerHeight),n.setPixelRatio(window.devicePixelRatio/1);const r=new gs(1,10);new sE().load("piz_compressed.exr",g=>{g.mapping=fs;const S=s.fromEquirectangular(g);o.envMap=S.texture,a.visible=!0});const s=new Qo(n);s.compileEquirectangularShader();const o=new Jg({color:16,metalness:.5,roughness:.1,emissive:16,emissiveIntensity:1.5});o.onBeforeCompile=g=>{g.uniforms.time={value:0},g.uniforms.inputData={value:new gt},g.uniforms.outputData={value:new gt},o.userData.shader=g,g.vertexShader=gE};const a=new jt(r,o);i.add(a),a.visible=!1,this.sphere=a;const l=new fE(i,t),f=new Oi(new Ge(window.innerWidth,window.innerHeight),5,.5,0),d=new Pu(hE),h=new uE(n);h.addPass(l),h.addPass(f),this.composer=h;function p(){t.aspect=window.innerWidth/window.innerHeight,t.updateProjectionMatrix();const g=n.getPixelRatio(),S=window.innerWidth,y=window.innerHeight;e.material.uniforms.resolution.value.set(S*g,y*g),n.setSize(S,y),h.setSize(S,y),d.material.uniforms.resolution.value.set(1/(S*g),1/(y*g))}window.addEventListener("resize",p),p(),this.animation()}animation(){requestAnimationFrame(()=>this.animation()),this.inputAnalyser.update(),this.outputAnalyser.update();const i=performance.now(),e=(i-this.prevTime)/(1e3/60);this.prevTime=i;const t=this.backdrop.material,n=this.sphere.material;if(t.uniforms.rand.value=Math.random()*1e4,n.userData.shader){this.sphere.scale.setScalar(1+.2*this.outputAnalyser.data[1]/255);const r=.001;this.rotation.x+=e*r*.5*this.outputAnalyser.data[1]/255,this.rotation.z+=e*r*.5*this.inputAnalyser.data[1]/255,this.rotation.y+=e*r*.25*this.inputAnalyser.data[2]/255,this.rotation.y+=e*r*.25*this.outputAnalyser.data[2]/255;const s=new fn(this.rotation.x,this.rotation.y,this.rotation.z),o=new zi().setFromEuler(s),a=new q(0,0,5);a.applyQuaternion(o),this.camera.position.copy(a),this.camera.lookAt(this.sphere.position),n.userData.shader.uniforms.time.value+=e*.1*this.outputAnalyser.data[0]/255,n.userData.shader.uniforms.inputData.value.set(1*this.inputAnalyser.data[0]/255,.1*this.inputAnalyser.data[1]/255,10*this.inputAnalyser.data[2]/255,0),n.userData.shader.uniforms.outputData.value.set(2*this.outputAnalyser.data[0]/255,.1*this.outputAnalyser.data[1]/255,10*this.outputAnalyser.data[2]/255,0)}this.composer.render()}firstUpdated(){this.canvas=this.shadowRoot.querySelector("canvas"),this.init()}render(){return qc`<canvas></canvas>`}};ur.styles=Hc`
		canvas {
			width: 100% !important;
			height: 100% !important;
			position: absolute;
			inset: 0;
			image-rendering: pixelated;
		}
	`;ya([aa()],ur.prototype,"outputNode",1);ya([aa()],ur.prototype,"inputNode",1);ur=ya([$c("gdm-live-audio-visuals-3d")],ur);var xE=Object.defineProperty,SE=Object.getOwnPropertyDescriptor,ki=(i,e,t,n)=>{for(var r=n>1?void 0:n?SE(e,t):e,s=i.length-1,o;s>=0;s--)(o=i[s])&&(r=(n?o(e,t,r):o(r))||r);return n&&r&&xE(e,t,r),r};let qn=class extends Ri{constructor(){super(),this.isRecording=!1,this.status="",this.error="",this.inputAudioContext=new(window.AudioContext||window.AudioContext)({sampleRate:16e3}),this.outputAudioContext=new(window.AudioContext||window.AudioContext)({sampleRate:24e3}),this.inputNode=this.inputAudioContext.createGain(),this.outputNode=this.outputAudioContext.createGain(),this.nextStartTime=0,this.sources=new Set,this.reconnectAttempts=0,this.maxReconnectAttempts=5,this.reconnectDelay=1e3,this.sessionClosed=!1,this.reconnectTimer=null,this.initClient()}disconnectedCallback(){super.disconnectedCallback(),this.sessionClosed=!0,this.reconnectTimer&&clearTimeout(this.reconnectTimer),this.isRecording&&this.stopRecording(),this.session&&this.session.close();for(const i of this.sources.values())i.stop();this.sources.clear()}initAudio(){this.nextStartTime=this.outputAudioContext.currentTime}async initClient(){this.initAudio(),console.log("Initializing client with API key:","Present"),this.client=new Qp({apiKey:""}),this.outputNode.connect(this.outputAudioContext.destination),this.initSession()}async initSession(){const i="gemini-2.5-flash-preview-native-audio-dialog";try{console.log(`Attempting to connect to model: ${i} (attempt ${this.reconnectAttempts+1})`),this.updateStatus("Connecting to Gemini..."),this.session=await this.client.live.connect({model:i,callbacks:{onopen:()=>{console.log("Session opened successfully"),this.reconnectAttempts=0,this.sessionClosed=!1,this.updateStatus("Connected - Ready to record")},onmessage:async e=>{console.log("Received message:",e);const t=e.serverContent?.modelTurn?.parts[0]?.inlineData;if(t){this.nextStartTime=Math.max(this.nextStartTime,this.outputAudioContext.currentTime);const r=await Cm(Tm(t.data),this.outputAudioContext,24e3,1),s=this.outputAudioContext.createBufferSource();s.buffer=r,s.connect(this.outputNode),s.addEventListener("ended",()=>{this.sources.delete(s)}),s.start(this.nextStartTime),this.nextStartTime=this.nextStartTime+r.duration,this.sources.add(s)}if(e.serverContent?.interrupted){console.log("Session interrupted");for(const r of this.sources.values())r.stop(),this.sources.delete(r);this.nextStartTime=0}},onerror:e=>{console.error("Session error:",e),this.handleSessionError(e)},onclose:e=>{console.log("Session closed:",e.reason,e.code),this.sessionClosed=!0,this.handleSessionClose(e)}},config:{responseModalities:[nr.AUDIO],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:"Orus"}}},tools:[{googleSearch:{}}],systemInstruction:{parts:[{text:`You are AlfieAI, the official virtual assistant for Juniata College in Huntingdon, Pennsylvania. You are knowledgeable, enthusiastic, and deeply familiar with Juniata's unique culture and programs. 

								CORE IDENTITY:
								- You know Juniata College intimately - its 1,600 students, 200+ faculty, and tight-knit community
								- You're passionate about Juniata's Program of Emphasis (POE) system that lets students design their own majors
								- You understand the college's Quaker heritage and commitment to service
								- You know about the Peace & Conflict Studies program, the renowned science programs, and strong liberal arts tradition

								SPEAKING STYLE:
								- Be conversational but informative - like a knowledgeable student tour guide
								- Use specific Juniata terminology (POE, Baker Institute, von Liebig Center, etc.)
								- Share concrete details, not vague descriptions
								- When you need current information, use Google Search to find the most up-to-date details from juniata.edu or official sources

								KNOWLEDGE AREAS:
								- Academics: POE system, pre-professional tracks, study abroad, research opportunities
								- Campus life: Residence halls, dining, clubs, athletics (Eagles!), traditions
								- Practical info: Admissions, financial aid, campus resources, location advantages
								- Alumni network and career outcomes

								SEARCH STRATEGY:
								- Use Google Search for current information like: enrollment numbers, new programs, recent news, event schedules, tuition rates
								- Prioritize official Juniata College sources (juniata.edu) in search results
								- Verify information from multiple sources when possible
								- Always mention when information comes from a recent search vs. your training data

								Always ground your responses in Juniata-specific facts and avoid generic college advice. If asked about other schools, politely redirect to how Juniata compares or differs.`}]}}}),console.log("Session created successfully")}catch(e){console.error("Failed to initialize session:",e),this.handleSessionError(e)}}updateStatus(i){this.status=i}updateError(i){this.error=i}handleSessionError(i){console.error("Session error details:",i);const e=i.message||i.toString();e.includes("429")||e.includes("rate")?(this.updateError("Rate limited. Trying to reconnect..."),this.scheduleReconnect()):e.includes("403")?this.updateError("API access denied. Check your API key."):e.includes("network")||e.includes("connection")?(this.updateError("Network error. Reconnecting..."),this.scheduleReconnect()):(this.updateError(`Connection error: ${e}`),this.scheduleReconnect())}handleSessionClose(i){console.log(`Session closed: ${i.reason} (code: ${i.code})`),!this.sessionClosed&&(i.code===1e3?this.updateStatus("Session ended normally"):i.code===1006?(this.updateStatus("Connection lost. Reconnecting..."),this.scheduleReconnect()):i.code===1008?this.updateError("Session ended: Policy violation"):(this.updateStatus("Connection lost. Reconnecting..."),this.scheduleReconnect()))}scheduleReconnect(){if(this.reconnectAttempts>=this.maxReconnectAttempts){this.updateError(`Failed to reconnect after ${this.maxReconnectAttempts} attempts. Please reset.`);return}this.reconnectTimer&&clearTimeout(this.reconnectTimer);const i=this.reconnectDelay*Math.pow(2,this.reconnectAttempts);console.log(`Scheduling reconnect in ${i}ms (attempt ${this.reconnectAttempts+1})`),this.updateStatus(`Reconnecting in ${Math.ceil(i/1e3)} seconds...`),this.reconnectTimer=window.setTimeout(()=>{this.reconnectAttempts++,this.attemptReconnect()},i)}async attemptReconnect(){if(console.log("Attempting to reconnect..."),this.session)try{this.session.close()}catch(i){console.warn("Error closing existing session:",i)}await this.initSession()}async startRecording(){if(!this.isRecording){this.inputAudioContext.resume(),this.updateStatus("Requesting microphone access...");try{this.mediaStream=await navigator.mediaDevices.getUserMedia({audio:!0,video:!1}),this.updateStatus("Microphone access granted. Starting capture..."),this.sourceNode=this.inputAudioContext.createMediaStreamSource(this.mediaStream),this.sourceNode.connect(this.inputNode);const i=256;this.scriptProcessorNode=this.inputAudioContext.createScriptProcessor(i,1,1),this.scriptProcessorNode.onaudioprocess=e=>{if(!this.isRecording)return;const n=e.inputBuffer.getChannelData(0);this.session.sendRealtimeInput({media:Am(n)})},this.sourceNode.connect(this.scriptProcessorNode),this.scriptProcessorNode.connect(this.inputAudioContext.destination),this.isRecording=!0,this.updateStatus("🔴 Recording... Capturing PCM chunks.")}catch(i){console.error("Error starting recording:",i),this.updateStatus(`Error: ${i.message}`),this.stopRecording()}}}stopRecording(){!this.isRecording&&!this.mediaStream&&!this.inputAudioContext||(this.updateStatus("Stopping recording..."),this.isRecording=!1,this.scriptProcessorNode&&this.sourceNode&&this.inputAudioContext&&(this.scriptProcessorNode.disconnect(),this.sourceNode.disconnect()),this.scriptProcessorNode=null,this.sourceNode=null,this.mediaStream&&(this.mediaStream.getTracks().forEach(i=>i.stop()),this.mediaStream=null),this.updateStatus("Recording stopped. Click Start to begin again."))}reset(){console.log("Resetting session..."),this.reconnectTimer&&(clearTimeout(this.reconnectTimer),this.reconnectTimer=null),this.reconnectAttempts=0,this.sessionClosed=!0,this.isRecording&&this.stopRecording();for(const i of this.sources.values())i.stop(),this.sources.delete(i);this.session&&this.session.close(),this.nextStartTime=this.outputAudioContext.currentTime,this.error="",this.updateStatus("Resetting... please wait"),setTimeout(()=>{this.sessionClosed=!1,this.initSession()},2e3)}render(){return qc`
			<div>
				<div class="controls">
					<button
						id="resetButton"
						@click=${this.reset}
						?disabled=${this.isRecording}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="40px"
							viewBox="0 -960 960 960"
							width="40px"
							fill="#ffffff">
							<path
								d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
						</svg>
					</button>
					<button
						id="startButton"
						@click=${this.startRecording}
						?disabled=${this.isRecording}>
						<svg
							viewBox="0 0 100 100"
							width="32px"
							height="32px"
							fill="#c80000"
							xmlns="http://www.w3.org/2000/svg">
							<circle cx="50" cy="50" r="50" />
						</svg>
					</button>
					<button
						id="stopButton"
						@click=${this.stopRecording}
						?disabled=${!this.isRecording}>
						<svg
							viewBox="0 0 100 100"
							width="32px"
							height="32px"
							fill="#000000"
							xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="100" height="100" rx="15" />
						</svg>
					</button>
				</div>

				<div id="status"> ${this.error} </div>
				<gdm-live-audio-visuals-3d
					.inputNode=${this.inputNode}
					.outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
			</div>
		`}};qn.styles=Hc`
		#status {
			position: absolute;
			bottom: 5vh;
			left: 0;
			right: 0;
			z-index: 10;
			text-align: center;
		}

		.controls {
			z-index: 10;
			position: absolute;
			bottom: 10vh;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			gap: 10px;

			button {
				outline: none;
				border: 1px solid rgba(255, 255, 255, 0.2);
				color: white;
				border-radius: 12px;
				background: rgba(255, 255, 255, 0.1);
				width: 64px;
				height: 64px;
				cursor: pointer;
				font-size: 24px;
				padding: 0;
				margin: 0;

				&:hover {
					background: rgba(255, 255, 255, 0.2);
				}
			}

			button[disabled] {
				display: none;
			}
		}
	`;ki([dr()],qn.prototype,"isRecording",2);ki([dr()],qn.prototype,"status",2);ki([dr()],qn.prototype,"error",2);ki([dr()],qn.prototype,"inputNode",2);ki([dr()],qn.prototype,"outputNode",2);qn=ki([$c("gdm-live-audio")],qn);
