"use strict";var Ne=Object.create;var K=Object.defineProperty;var _e=Object.getOwnPropertyDescriptor;var He=Object.getOwnPropertyNames;var Ge=Object.getPrototypeOf,Ue=Object.prototype.hasOwnProperty;var je=(s,e)=>{for(var t in e)K(s,t,{get:e[t],enumerable:!0})},de=(s,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of He(e))!Ue.call(s,o)&&o!==t&&K(s,o,{get:()=>e[o],enumerable:!(n=_e(e,o))||n.enumerable});return s};var E=(s,e,t)=>(t=s!=null?Ne(Ge(s)):{},de(e||!s||!s.__esModule?K(t,"default",{value:s,enumerable:!0}):t,s)),Be=s=>de(K({},"__esModule",{value:!0}),s);var Ct={};je(Ct,{activate:()=>vt,deactivate:()=>bt});module.exports=Be(Ct);var p=E(require("vscode"));var M=E(require("vscode")),F=E(require("fs")),ne=E(require("path")),q=class{context;activities=[];keystrokeCount=0;startTime=Date.now();currentFile;statusBarItem;isEnabled=!0;constructor(e){this.context=e,this.statusBarItem=M.window.createStatusBarItem(M.StatusBarAlignment.Right,100),this.statusBarItem.text="$(pulse) CodeFlow: Active",this.statusBarItem.tooltip="CodeFlow AI is tracking your coding activity",this.statusBarItem.show(),this.initialize()}initialize(){let e=M.workspace.getConfiguration("codeflow");this.isEnabled=e.get("enabled",!0),M.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged,this),M.workspace.onDidSaveTextDocument(this.onDocumentSaved,this),M.workspace.onDidChangeTextDocument(this.onDocumentChanged,this),M.commands.registerCommand("codeflow.toggleTracking",()=>{this.isEnabled=!this.isEnabled,this.statusBarItem.text=this.isEnabled?"$(pulse) CodeFlow: Active":"$(circle-slash) CodeFlow: Paused",M.window.showInformationMessage(`CodeFlow tracking ${this.isEnabled?"enabled":"disabled"}`)}),setInterval(()=>this.saveData(),6e4)}onActiveEditorChanged(e){!e||!this.isEnabled||(this.currentFile=e.document.fileName,this.recordActivity({timestamp:Date.now(),file:this.currentFile,language:e.document.languageId}))}onDocumentSaved(e){this.isEnabled&&this.recordActivity({timestamp:Date.now(),command:"save",file:e.fileName,language:e.languageId})}onDocumentChanged(e){this.isEnabled&&(this.keystrokeCount+=e.contentChanges.length,this.keystrokeCount>=10&&(this.recordActivity({timestamp:Date.now(),keystrokes:this.keystrokeCount,file:e.document.fileName,language:e.document.languageId}),this.keystrokeCount=0))}recordActivity(e){this.activities.push(e),this.activities.length>1e3&&(this.saveData(),this.activities=this.activities.slice(-500))}saveData(){if(this.activities.length===0)return;let e=this.context.globalStorageUri.fsPath;F.existsSync(e)||F.mkdirSync(e,{recursive:!0});let t=new Date().toISOString().split("T")[0],n=ne.join(e,`activity-${t}.json`),o=[];F.existsSync(n)&&(o=JSON.parse(F.readFileSync(n,"utf8")));let i=[...o,...this.activities];F.writeFileSync(n,JSON.stringify(i)),this.activities=[]}getActivities(e){let t=e||new Date().toISOString().split("T")[0],n=this.context.globalStorageUri.fsPath,o=ne.join(n,`activity-${t}.json`);return F.existsSync(o)?JSON.parse(F.readFileSync(o,"utf8")):[]}dispose(){this.saveData(),this.statusBarItem.dispose()}};var z=E(require("vscode")),W=E(require("path")),H=E(require("fs")),Fe=require("child_process");var ue;(function(s){s.STRING="string",s.NUMBER="number",s.INTEGER="integer",s.BOOLEAN="boolean",s.ARRAY="array",s.OBJECT="object"})(ue||(ue={}));var ge;(function(s){s.LANGUAGE_UNSPECIFIED="language_unspecified",s.PYTHON="python"})(ge||(ge={}));var pe;(function(s){s.OUTCOME_UNSPECIFIED="outcome_unspecified",s.OUTCOME_OK="outcome_ok",s.OUTCOME_FAILED="outcome_failed",s.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(pe||(pe={}));var me=["user","model","function","system"],fe;(function(s){s.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",s.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",s.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",s.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",s.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"})(fe||(fe={}));var he;(function(s){s.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",s.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",s.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",s.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",s.BLOCK_NONE="BLOCK_NONE"})(he||(he={}));var ye;(function(s){s.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",s.NEGLIGIBLE="NEGLIGIBLE",s.LOW="LOW",s.MEDIUM="MEDIUM",s.HIGH="HIGH"})(ye||(ye={}));var ve;(function(s){s.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",s.SAFETY="SAFETY",s.OTHER="OTHER"})(ve||(ve={}));var G;(function(s){s.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",s.STOP="STOP",s.MAX_TOKENS="MAX_TOKENS",s.SAFETY="SAFETY",s.RECITATION="RECITATION",s.LANGUAGE="LANGUAGE",s.OTHER="OTHER"})(G||(G={}));var we;(function(s){s.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",s.RETRIEVAL_QUERY="RETRIEVAL_QUERY",s.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",s.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",s.CLASSIFICATION="CLASSIFICATION",s.CLUSTERING="CLUSTERING"})(we||(we={}));var be;(function(s){s.MODE_UNSPECIFIED="MODE_UNSPECIFIED",s.AUTO="AUTO",s.ANY="ANY",s.NONE="NONE"})(be||(be={}));var Ce;(function(s){s.MODE_UNSPECIFIED="MODE_UNSPECIFIED",s.MODE_DYNAMIC="MODE_DYNAMIC"})(Ce||(Ce={}));var I=class extends Error{constructor(e){super(`[GoogleGenerativeAI Error]: ${e}`)}},$=class extends I{constructor(e,t){super(e),this.response=t}},J=class extends I{constructor(e,t,n,o){super(e),this.status=t,this.statusText=n,this.errorDetails=o}},L=class extends I{};var We="https://generativelanguage.googleapis.com",ze="v1beta",Ke="0.21.0",qe="genai-js",O;(function(s){s.GENERATE_CONTENT="generateContent",s.STREAM_GENERATE_CONTENT="streamGenerateContent",s.COUNT_TOKENS="countTokens",s.EMBED_CONTENT="embedContent",s.BATCH_EMBED_CONTENTS="batchEmbedContents"})(O||(O={}));var ie=class{constructor(e,t,n,o,i){this.model=e,this.task=t,this.apiKey=n,this.stream=o,this.requestOptions=i}toString(){var e,t;let n=((e=this.requestOptions)===null||e===void 0?void 0:e.apiVersion)||ze,i=`${((t=this.requestOptions)===null||t===void 0?void 0:t.baseUrl)||We}/${n}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}};function Ye(s){let e=[];return s?.apiClient&&e.push(s.apiClient),e.push(`${qe}/${Ke}`),e.join(" ")}async function Je(s){var e;let t=new Headers;t.append("Content-Type","application/json"),t.append("x-goog-api-client",Ye(s.requestOptions)),t.append("x-goog-api-key",s.apiKey);let n=(e=s.requestOptions)===null||e===void 0?void 0:e.customHeaders;if(n){if(!(n instanceof Headers))try{n=new Headers(n)}catch(o){throw new L(`unable to convert customHeaders value ${JSON.stringify(n)} to Headers: ${o.message}`)}for(let[o,i]of n.entries()){if(o==="x-goog-api-key")throw new L(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new L(`Header name ${o} can only be set using the apiClient field`);t.append(o,i)}}return t}async function Ve(s,e,t,n,o,i){let a=new ie(s,e,t,n,i);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},et(i)),{method:"POST",headers:await Je(a),body:o})}}async function B(s,e,t,n,o,i={},a=fetch){let{url:c,fetchOptions:r}=await Ve(s,e,t,n,o,i);return Xe(c,r,a)}async function Xe(s,e,t=fetch){let n;try{n=await t(s,e)}catch(o){Ze(o,s)}return n.ok||await Qe(n,s),n}function Ze(s,e){let t=s;throw s instanceof J||s instanceof L||(t=new I(`Error fetching from ${e.toString()}: ${s.message}`),t.stack=s.stack),t}async function Qe(s,e){let t="",n;try{let o=await s.json();t=o.error.message,o.error.details&&(t+=` ${JSON.stringify(o.error.details)}`,n=o.error.details)}catch{}throw new J(`Error fetching from ${e.toString()}: [${s.status} ${s.statusText}] ${t}`,s.status,s.statusText,n)}function et(s){let e={};if(s?.signal!==void 0||s?.timeout>=0){let t=new AbortController;s?.timeout>=0&&setTimeout(()=>t.abort(),s.timeout),s?.signal&&s.signal.addEventListener("abort",()=>{t.abort()}),e.signal=t.signal}return e}function re(s){return s.text=()=>{if(s.candidates&&s.candidates.length>0){if(s.candidates.length>1&&console.warn(`This response had ${s.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),Y(s.candidates[0]))throw new $(`${R(s)}`,s);return tt(s)}else if(s.promptFeedback)throw new $(`Text not available. ${R(s)}`,s);return""},s.functionCall=()=>{if(s.candidates&&s.candidates.length>0){if(s.candidates.length>1&&console.warn(`This response had ${s.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),Y(s.candidates[0]))throw new $(`${R(s)}`,s);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),xe(s)[0]}else if(s.promptFeedback)throw new $(`Function call not available. ${R(s)}`,s)},s.functionCalls=()=>{if(s.candidates&&s.candidates.length>0){if(s.candidates.length>1&&console.warn(`This response had ${s.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),Y(s.candidates[0]))throw new $(`${R(s)}`,s);return xe(s)}else if(s.promptFeedback)throw new $(`Function call not available. ${R(s)}`,s)},s}function tt(s){var e,t,n,o;let i=[];if(!((t=(e=s.candidates)===null||e===void 0?void 0:e[0].content)===null||t===void 0)&&t.parts)for(let a of(o=(n=s.candidates)===null||n===void 0?void 0:n[0].content)===null||o===void 0?void 0:o.parts)a.text&&i.push(a.text),a.executableCode&&i.push("\n```"+a.executableCode.language+`
`+a.executableCode.code+"\n```\n"),a.codeExecutionResult&&i.push("\n```\n"+a.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}function xe(s){var e,t,n,o;let i=[];if(!((t=(e=s.candidates)===null||e===void 0?void 0:e[0].content)===null||t===void 0)&&t.parts)for(let a of(o=(n=s.candidates)===null||n===void 0?void 0:n[0].content)===null||o===void 0?void 0:o.parts)a.functionCall&&i.push(a.functionCall);if(i.length>0)return i}var ot=[G.RECITATION,G.SAFETY,G.LANGUAGE];function Y(s){return!!s.finishReason&&ot.includes(s.finishReason)}function R(s){var e,t,n;let o="";if((!s.candidates||s.candidates.length===0)&&s.promptFeedback)o+="Response was blocked",!((e=s.promptFeedback)===null||e===void 0)&&e.blockReason&&(o+=` due to ${s.promptFeedback.blockReason}`),!((t=s.promptFeedback)===null||t===void 0)&&t.blockReasonMessage&&(o+=`: ${s.promptFeedback.blockReasonMessage}`);else if(!((n=s.candidates)===null||n===void 0)&&n[0]){let i=s.candidates[0];Y(i)&&(o+=`Candidate was blocked due to ${i.finishReason}`,i.finishMessage&&(o+=`: ${i.finishMessage}`))}return o}function U(s){return this instanceof U?(this.v=s,this):new U(s)}function st(s,e,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var n=t.apply(s,e||[]),o,i=[];return o={},a("next"),a("throw"),a("return"),o[Symbol.asyncIterator]=function(){return this},o;function a(l){n[l]&&(o[l]=function(g){return new Promise(function(y,h){i.push([l,g,y,h])>1||c(l,g)})})}function c(l,g){try{r(n[l](g))}catch(y){u(i[0][3],y)}}function r(l){l.value instanceof U?Promise.resolve(l.value.v).then(f,d):u(i[0][2],l)}function f(l){c("next",l)}function d(l){c("throw",l)}function u(l,g){l(g),i.shift(),i.length&&c(i[0][0],i[0][1])}}var Se=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function nt(s){let e=s.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),t=rt(e),[n,o]=t.tee();return{stream:at(n),response:it(o)}}async function it(s){let e=[],t=s.getReader();for(;;){let{done:n,value:o}=await t.read();if(n)return re(ct(e));e.push(o)}}function at(s){return st(this,arguments,function*(){let t=s.getReader();for(;;){let{value:n,done:o}=yield U(t.read());if(o)break;yield yield U(re(n))}})}function rt(s){let e=s.getReader();return new ReadableStream({start(n){let o="";return i();function i(){return e.read().then(({value:a,done:c})=>{if(c){if(o.trim()){n.error(new I("Failed to parse stream"));return}n.close();return}o+=a;let r=o.match(Se),f;for(;r;){try{f=JSON.parse(r[1])}catch{n.error(new I(`Error parsing JSON response: "${r[1]}"`));return}n.enqueue(f),o=o.substring(r[0].length),r=o.match(Se)}return i()})}}})}function ct(s){let e=s[s.length-1],t={promptFeedback:e?.promptFeedback};for(let n of s){if(n.candidates)for(let o of n.candidates){let i=o.index;if(t.candidates||(t.candidates=[]),t.candidates[i]||(t.candidates[i]={index:o.index}),t.candidates[i].citationMetadata=o.citationMetadata,t.candidates[i].groundingMetadata=o.groundingMetadata,t.candidates[i].finishReason=o.finishReason,t.candidates[i].finishMessage=o.finishMessage,t.candidates[i].safetyRatings=o.safetyRatings,o.content&&o.content.parts){t.candidates[i].content||(t.candidates[i].content={role:o.content.role||"user",parts:[]});let a={};for(let c of o.content.parts)c.text&&(a.text=c.text),c.functionCall&&(a.functionCall=c.functionCall),c.executableCode&&(a.executableCode=c.executableCode),c.codeExecutionResult&&(a.codeExecutionResult=c.codeExecutionResult),Object.keys(a).length===0&&(a.text=""),t.candidates[i].content.parts.push(a)}}n.usageMetadata&&(t.usageMetadata=n.usageMetadata)}return t}async function Ae(s,e,t,n){let o=await B(e,O.STREAM_GENERATE_CONTENT,s,!0,JSON.stringify(t),n);return nt(o)}async function Pe(s,e,t,n){let i=await(await B(e,O.GENERATE_CONTENT,s,!1,JSON.stringify(t),n)).json();return{response:re(i)}}function Me(s){if(s!=null){if(typeof s=="string")return{role:"system",parts:[{text:s}]};if(s.text)return{role:"system",parts:[s]};if(s.parts)return s.role?s:{role:"system",parts:s.parts}}}function j(s){let e=[];if(typeof s=="string")e=[{text:s}];else for(let t of s)typeof t=="string"?e.push({text:t}):e.push(t);return lt(e)}function lt(s){let e={role:"user",parts:[]},t={role:"function",parts:[]},n=!1,o=!1;for(let i of s)"functionResponse"in i?(t.parts.push(i),o=!0):(e.parts.push(i),n=!0);if(n&&o)throw new I("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!n&&!o)throw new I("No content is provided for sending chat message.");return n?e:t}function dt(s,e){var t;let n={model:e?.model,generationConfig:e?.generationConfig,safetySettings:e?.safetySettings,tools:e?.tools,toolConfig:e?.toolConfig,systemInstruction:e?.systemInstruction,cachedContent:(t=e?.cachedContent)===null||t===void 0?void 0:t.name,contents:[]},o=s.generateContentRequest!=null;if(s.contents){if(o)throw new L("CountTokensRequest must have one of contents or generateContentRequest, not both.");n.contents=s.contents}else if(o)n=Object.assign(Object.assign({},n),s.generateContentRequest);else{let i=j(s);n.contents=[i]}return{generateContentRequest:n}}function ke(s){let e;return s.contents?e=s:e={contents:[j(s)]},s.systemInstruction&&(e.systemInstruction=Me(s.systemInstruction)),e}function ut(s){return typeof s=="string"||Array.isArray(s)?{content:j(s)}:s}var Ee=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],gt={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function pt(s){let e=!1;for(let t of s){let{role:n,parts:o}=t;if(!e&&n!=="user")throw new I(`First content should be with role 'user', got ${n}`);if(!me.includes(n))throw new I(`Each item should include role field. Got ${n} but valid roles are: ${JSON.stringify(me)}`);if(!Array.isArray(o))throw new I("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new I("Each Content should have at least one part");let i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let c of o)for(let r of Ee)r in c&&(i[r]+=1);let a=gt[n];for(let c of Ee)if(!a.includes(c)&&i[c]>0)throw new I(`Content with role '${n}' can't contain '${c}' part`);e=!0}}var Ie="SILENT_ERROR",ae=class{constructor(e,t,n,o={}){this.model=t,this.params=n,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=e,n?.history&&(pt(n.history),this._history=n.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(e,t={}){var n,o,i,a,c,r;await this._sendPromise;let f=j(e),d={safetySettings:(n=this.params)===null||n===void 0?void 0:n.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(c=this.params)===null||c===void 0?void 0:c.systemInstruction,cachedContent:(r=this.params)===null||r===void 0?void 0:r.cachedContent,contents:[...this._history,f]},u=Object.assign(Object.assign({},this._requestOptions),t),l;return this._sendPromise=this._sendPromise.then(()=>Pe(this._apiKey,this.model,d,u)).then(g=>{var y;if(g.response.candidates&&g.response.candidates.length>0){this._history.push(f);let h=Object.assign({parts:[],role:"model"},(y=g.response.candidates)===null||y===void 0?void 0:y[0].content);this._history.push(h)}else{let h=R(g.response);h&&console.warn(`sendMessage() was unsuccessful. ${h}. Inspect response object for details.`)}l=g}),await this._sendPromise,l}async sendMessageStream(e,t={}){var n,o,i,a,c,r;await this._sendPromise;let f=j(e),d={safetySettings:(n=this.params)===null||n===void 0?void 0:n.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(c=this.params)===null||c===void 0?void 0:c.systemInstruction,cachedContent:(r=this.params)===null||r===void 0?void 0:r.cachedContent,contents:[...this._history,f]},u=Object.assign(Object.assign({},this._requestOptions),t),l=Ae(this._apiKey,this.model,d,u);return this._sendPromise=this._sendPromise.then(()=>l).catch(g=>{throw new Error(Ie)}).then(g=>g.response).then(g=>{if(g.candidates&&g.candidates.length>0){this._history.push(f);let y=Object.assign({},g.candidates[0].content);y.role||(y.role="model"),this._history.push(y)}else{let y=R(g);y&&console.warn(`sendMessageStream() was unsuccessful. ${y}. Inspect response object for details.`)}}).catch(g=>{g.message!==Ie&&console.error(g)}),l}};async function mt(s,e,t,n){return(await B(e,O.COUNT_TOKENS,s,!1,JSON.stringify(t),n)).json()}async function ft(s,e,t,n){return(await B(e,O.EMBED_CONTENT,s,!1,JSON.stringify(t),n)).json()}async function ht(s,e,t,n){let o=t.requests.map(a=>Object.assign(Object.assign({},a),{model:e}));return(await B(e,O.BATCH_EMBED_CONTENTS,s,!1,JSON.stringify({requests:o}),n)).json()}var V=class{constructor(e,t,n={}){this.apiKey=e,this._requestOptions=n,t.model.includes("/")?this.model=t.model:this.model=`models/${t.model}`,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.tools=t.tools,this.toolConfig=t.toolConfig,this.systemInstruction=Me(t.systemInstruction),this.cachedContent=t.cachedContent}async generateContent(e,t={}){var n;let o=ke(e),i=Object.assign(Object.assign({},this._requestOptions),t);return Pe(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},o),i)}async generateContentStream(e,t={}){var n;let o=ke(e),i=Object.assign(Object.assign({},this._requestOptions),t);return Ae(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},o),i)}startChat(e){var t;return new ae(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(t=this.cachedContent)===null||t===void 0?void 0:t.name},e),this._requestOptions)}async countTokens(e,t={}){let n=dt(e,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),t);return mt(this.apiKey,this.model,n,o)}async embedContent(e,t={}){let n=ut(e),o=Object.assign(Object.assign({},this._requestOptions),t);return ft(this.apiKey,this.model,n,o)}async batchEmbedContents(e,t={}){let n=Object.assign(Object.assign({},this._requestOptions),t);return ht(this.apiKey,this.model,e,n)}};var X=class{constructor(e){this.apiKey=e}getGenerativeModel(e,t){if(!e.model)throw new I("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new V(this.apiKey,e,t)}getGenerativeModelFromCachedContent(e,t,n){if(!e.name)throw new L("Cached content must contain a `name` field.");if(!e.model)throw new L("Cached content must contain a `model` field.");let o=["model","systemInstruction"];for(let a of o)if(t?.[a]&&e[a]&&t?.[a]!==e[a]){if(a==="model"){let c=t.model.startsWith("models/")?t.model.replace("models/",""):t.model,r=e.model.startsWith("models/")?e.model.replace("models/",""):e.model;if(c===r)continue}throw new L(`Different value for "${a}" specified in modelParams (${t[a]}) and cachedContent (${e[a]})`)}let i=Object.assign(Object.assign({},t),{model:e.model,tools:e.tools,toolConfig:e.toolConfig,systemInstruction:e.systemInstruction,cachedContent:e});return new V(this.apiKey,i,n)}};var T=E(require("vscode")),_=class{genAI=null;model=null;isEnabled=!1;constructor(){this.initialize()}initialize(){let e=T.workspace.getConfiguration("codeflow");this.isEnabled=e.get("useGeminiAI",!1);let t=e.get("geminiApiKey","");if(console.log("Initializing Gemini Service..."),console.log("Gemini AI Enabled:",this.isEnabled),console.log("API Key Present:",!!t),!this.isEnabled){console.log("Gemini AI is disabled in settings (codeflow.useGeminiAI)");return}if(!t||t.trim()===""){console.error("Gemini API key is missing or empty"),T.window.showErrorMessage("Gemini API key not configured. Please set codeflow.geminiApiKey in settings."),this.isEnabled=!1;return}try{this.genAI=new X(t),this.model=this.genAI.getGenerativeModel({model:"gemini-2.5-flash"}),console.log("Gemini AI initialized successfully with model: gemini-2.5-flash")}catch(n){let o=n?.message||"Unknown error";console.error("Error initializing Gemini AI:",o),console.error("Full error:",n),T.window.showErrorMessage(`Failed to initialize Gemini AI: ${o}`),this.isEnabled=!1}}async generateInsights(e,t){if(!this.isEnabled)return console.log("Gemini AI is disabled in settings"),this.getFallbackInsights(e);if(!this.model)return console.error("Gemini model not initialized. Check API key configuration."),T.window.showErrorMessage("Gemini AI model not initialized. Please check your API key in settings."),this.getFallbackInsights(e);try{console.log("Generating Gemini AI insights...");let n=this.prepareContext(e,t),o=await this.queryGeminiForInsights(n);return console.log("Successfully generated Gemini insights"),o}catch(n){let o=n?.message||"Unknown error";return console.error("Error generating Gemini insights:",o),console.error("Full error:",n),o.toLowerCase().includes("api key")||o.includes("401")?T.window.showErrorMessage("Invalid Gemini API key. Please check your settings."):o.toLowerCase().includes("quota")||o.toLowerCase().includes("exceeded")||o.includes("429")?T.window.showWarningMessage("Gemini API quota or rate limit exceeded. Using fallback suggestions. Try again later."):o.toLowerCase().includes("network")||o.toLowerCase().includes("fetch")||o.toLowerCase().includes("econnrefused")||o.toLowerCase().includes("timeout")?T.window.showWarningMessage("Network error connecting to Gemini API. Check your internet connection. Using fallback suggestions."):o.includes("404")||o.toLowerCase().includes("not found")?T.window.showErrorMessage("Gemini model not found. The API may have been updated. Using fallback suggestions."):T.window.showWarningMessage(`Failed to generate AI insights: ${o}. Using fallback suggestions.`),this.getFallbackInsights(e)}}prepareContext(e,t){let n=new Set(t.filter(c=>c.file).map(c=>c.file)),o=e.languageDistribution.map(c=>c.language).join(", "),i=this.analyzeHourlyActivity(t),a=this.analyzeFileTypes(Array.from(n).filter(c=>c!==void 0));return`
Analyze this developer's coding patterns and provide actionable insights:

**Productivity Metrics:**
- Productivity Score: ${e.productivityScore}/100
- Total Active Time: ${(e.totalActiveMinutes/60).toFixed(1)} hours
- Streak: ${e.streakDays} days
- Active Hours: ${e.activeHourRange.earliest??"N/A"}:00 - ${e.activeHourRange.latest??"N/A"}:00

**Coding Behavior:**
- Languages Used: ${o||"Various"}
- Total Keystrokes: ${e.totalKeystrokes}
- Commands Executed: ${e.totalCommandsExecuted}
- Unique Files: ${e.uniqueFilesWorked}
- File Switches: ${e.fileSwitchCount}

**Top Commands:**
${e.mostUsedCommands.map((c,r)=>`${r+1}. ${c.command} (${c.count} times)`).join(`
`)}

**Top Files:**
${e.mostWorkedFiles.map((c,r)=>`${r+1}. ${c.file} (${c.time} min)`).join(`
`)}

**Activity Patterns:**
${i}

**File Types Worked:**
${a}

Please provide specific, actionable insights in these categories:
1. Code Improvement Suggestions (3-5 specific suggestions)
2. Performance Tips (2-4 tips to improve development speed)
3. Bad Practice Warnings (2-3 potential issues to watch out for)
4. Refactoring Ideas (2-4 areas that might benefit from refactoring)
5. Productivity Hints (3-5 tips to boost productivity)

Format your response EXACTLY as JSON with these keys:
{
  "codeImprovements": ["suggestion1", "suggestion2", ...],
  "performanceTips": ["tip1", "tip2", ...],
  "badPracticeWarnings": ["warning1", "warning2", ...],
  "refactoringIdeas": ["idea1", "idea2", ...],
  "productivityHints": ["hint1", "hint2", ...]
}

Keep each item concise (1-2 sentences) and actionable.
`}analyzeHourlyActivity(e){let t={};e.forEach(o=>{let i=new Date(o.timestamp).getHours();t[i]=(t[i]||0)+1});let n=Object.entries(t).sort((o,i)=>i[1]-o[1]).slice(0,3);return n.length===0?"No clear activity pattern detected":`Most active hours: ${n.map(([o,i])=>`${o}:00 (${i} activities)`).join(", ")}`}analyzeFileTypes(e){let t={};e.forEach(o=>{let i=o.split(".").pop()?.toLowerCase()||"unknown";t[i]=(t[i]||0)+1});let n=Object.entries(t).sort((o,i)=>i[1]-o[1]).slice(0,5);return n.length===0?"No file types detected":n.map(([o,i])=>`${o}: ${i} files`).join(", ")}async queryGeminiForInsights(e){if(!this.model)throw new Error("Gemini model not initialized");try{console.log("Sending request to Gemini API (model: gemini-2.5-flash)...");let o=(await(await this.model.generateContent(e)).response).text();console.log("Received response from Gemini API"),console.log("Response length:",o.length);try{let i=o.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim(),a=JSON.parse(i);return{codeImprovements:Array.isArray(a.codeImprovements)?a.codeImprovements.slice(0,5):[],performanceTips:Array.isArray(a.performanceTips)?a.performanceTips.slice(0,4):[],badPracticeWarnings:Array.isArray(a.badPracticeWarnings)?a.badPracticeWarnings.slice(0,3):[],refactoringIdeas:Array.isArray(a.refactoringIdeas)?a.refactoringIdeas.slice(0,4):[],productivityHints:Array.isArray(a.productivityHints)?a.productivityHints.slice(0,5):[]}}catch(i){return console.error("Error parsing Gemini JSON response:",i.message),console.log("Raw response (first 500 chars):",o.substring(0,500)),this.parseTextResponse(o)}}catch(t){throw console.error("Gemini API request failed:",t.message),new Error(`Gemini API error: ${t.message||"Unknown API error"}`)}}parseTextResponse(e){let t=[],n=[],o=[],i=[],a=[],c=e.split(`
`).filter(f=>f.trim()),r=null;return c.forEach(f=>{let d=f.toLowerCase();if(d.includes("code improvement")||d.includes("improvement suggestion"))r=t;else if(d.includes("performance tip"))r=n;else if(d.includes("bad practice")||d.includes("warning"))r=o;else if(d.includes("refactoring"))r=i;else if(d.includes("productivity hint")||d.includes("productivity tip"))r=a;else if(r&&(f.startsWith("-")||f.startsWith("\u2022")||f.match(/^\d+\./))){let u=f.replace(/^[-•]\s*/,"").replace(/^\d+\.\s*/,"").trim();u&&r.length<5&&r.push(u)}}),{codeImprovements:t,performanceTips:n,badPracticeWarnings:o,refactoringIdeas:i,productivityHints:a}}getFallbackInsights(e){return{codeImprovements:["\u{1F4A1} Enable Gemini AI in settings (codeflow.useGeminiAI) and add your API key (codeflow.geminiApiKey) to get personalized, AI-powered insights based on your coding patterns."],performanceTips:[],badPracticeWarnings:[],refactoringIdeas:[],productivityHints:[]}}async testConnection(){if(!this.isEnabled)return{success:!1,message:"Gemini AI is disabled. Enable it in settings (codeflow.useGeminiAI)."};if(!this.model)return{success:!1,message:"Gemini model not initialized. Check your API key configuration."};try{console.log("Testing Gemini API connection...");let n=(await(await this.model.generateContent('Respond with "OK" if you can read this.')).response).text();return console.log("Connection test response:",n),{success:!0,message:"Successfully connected to Gemini API! \u2713"}}catch(e){let t=e?.message||"Unknown error";return console.error("Connection test failed:",t),{success:!1,message:`Connection failed: ${t}`}}}isGeminiEnabled(){return this.isEnabled&&this.model!==null}};var Z=class{context;useExternalAPI=!1;apiEndpoint="";apiKey="";useTFModel=!1;geminiService;constructor(e){this.context=e,this.geminiService=new _;let t=z.workspace.getConfiguration("codeflow");this.useExternalAPI=t.get("useExternalAPI",!1),this.apiEndpoint=t.get("apiEndpoint",""),this.apiKey=t.get("apiKey",""),this.useTFModel=t.get("useTFModel",!1)}async analyzeData(e=7){let t=[],n=new Date;for(let i=0;i<e;i++){let a=new Date(n);a.setDate(a.getDate()-i);let c=a.toISOString().split("T")[0],r=this.getActivitiesForDate(c);t.push(...r)}let o;if(this.useExternalAPI&&this.apiEndpoint&&this.apiKey?o=await this.analyzeWithExternalAPI(t,e):this.useTFModel?o=await this.analyzeWithTFModel(t,e):o=this.performLocalAnalysis(t,e),this.geminiService.isGeminiEnabled())try{let i=await this.geminiService.generateInsights(o,t);o.suggestions=[...i.codeImprovements.map(a=>`\u{1F4A1} Code Improvement: ${a}`),...i.performanceTips.map(a=>`\u26A1 Performance: ${a}`),...i.badPracticeWarnings.map(a=>`\u26A0\uFE0F Warning: ${a}`),...i.refactoringIdeas.map(a=>`\u{1F527} Refactoring: ${a}`),...i.productivityHints.map(a=>`\u{1F3AF} Productivity: ${a}`)]}catch(i){console.error("Error generating Gemini insights:",i),o.suggestions=["\u{1F916} AI Insights Unavailable: Enable Gemini AI in CodeFlow settings to get personalized, AI-powered insights.","\u2699\uFE0F Setup: Set codeflow.useGeminiAI to true and add your Gemini API key in codeflow.geminiApiKey.","\u{1F517} Get API Key: Visit https://makersuite.google.com/app/apikey to get your free Gemini API key."]}else o.suggestions=["\u{1F916} AI Insights Not Enabled: Gemini AI is currently disabled.","\u2699\uFE0F Enable AI: Go to Settings \u2192 Extensions \u2192 CodeFlow AI \u2192 Use Gemini AI (check the box).","\u{1F511} Add API Key: Get a free API key from https://makersuite.google.com/app/apikey","\u{1F4A1} Benefits: Get personalized code improvements, performance tips, and productivity insights tailored to your coding patterns."];return o}getActivitiesForDate(e){let t=this.context.globalStorageUri.fsPath,n=W.join(t,`activity-${e}.json`);return H.existsSync(n)?JSON.parse(H.readFileSync(n,"utf8")):[]}async analyzeWithExternalAPI(e,t){try{let n={activities:e,analysisType:"productivity"},o=await fetch(this.apiEndpoint,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify(n)});if(!o.ok)throw new Error(`API request failed with status ${o.status}`);let i=await o.json();return this.mergeWithDerivedMetrics(i,e,t)}catch(n){return z.window.showErrorMessage(`Error analyzing data with external API: ${n}`),this.performLocalAnalysis(e,t)}}async analyzeWithTFModel(e,t){try{let n=this.prepareTFData(e),o=W.join(this.context.extensionPath,"ml","tfjs"),i=W.join(o,"predict.js"),a=W.join(o,"temp_data.json");H.writeFileSync(a,JSON.stringify(n));let c=await this.runNodeScript(i,[a]),r=JSON.parse(c);return{...this.performLocalAnalysis(e,t),productivityScore:r.score,tfInsights:{featureImportance:r.featureImportance,tfScore:r.score}}}catch(n){return z.window.showErrorMessage(`Error analyzing data with TensorFlow.js model: ${n}`),this.performLocalAnalysis(e,t)}}prepareTFData(e){let t=[...e].sort((u,l)=>u.timestamp-l.timestamp),n=[],o=null;for(let u of t)(!o||u.timestamp-o.lastActivity>1800*1e3)&&(o={start_time:u.timestamp,lastActivity:u.timestamp,keystrokes:0,commands:0,files:new Set,languages:new Set},n.push(o)),o.lastActivity=u.timestamp,u.keystrokes&&(o.keystrokes+=u.keystrokes),u.command&&o.commands++,u.file&&o.files.add(u.file),u.language&&o.languages.add(u.language);let i=n.map(u=>{let l=(u.lastActivity-u.start_time)/6e4;return{hour:new Date(u.start_time).getHours(),dayOfWeek:new Date(u.start_time).getDay(),dayOfMonth:new Date(u.start_time).getDate(),keystrokes:u.keystrokes,commands:u.commands,files:u.files.size,languages:u.languages.size,duration:l,keystrokesPerMinute:u.keystrokes/l,commandsPerMinute:u.commands/l,filesPerMinute:u.files.size/l}}),a=i.reduce((u,l)=>u+l.keystrokes,0),c=i.reduce((u,l)=>u+l.commands,0),r=new Set(i.flatMap(u=>Array.from({length:u.files}))).size,f=new Set(i.flatMap(u=>Array.from({length:u.languages}))).size,d=i.reduce((u,l)=>u+l.duration,0);return{hour:i.length>0?i[0].hour:0,dayOfWeek:i.length>0?i[0].dayOfWeek:0,dayOfMonth:i.length>0?i[0].dayOfMonth:0,keystrokes:a,commands:c,files:r,languages:f,duration:d,keystrokesPerMinute:d>0?a/d:0,commandsPerMinute:d>0?c/d:0,filesPerMinute:d>0?r/d:0}}runNodeScript(e,t){return new Promise((n,o)=>{let i=(0,Fe.spawn)("node",[e,...t]),a="",c="";i.stdout.on("data",r=>{a+=r.toString()}),i.stderr.on("data",r=>{c+=r.toString()}),i.on("close",r=>{r!==0?o(new Error(`Script exited with code ${r}: ${c}`)):n(a)}),i.on("error",r=>{o(r)})})}performLocalAnalysis(e,t){let n=this.calculateProductivityScore(e),o={},i={},a={},c=new Set,r=new Set,f=0;e.forEach(m=>{m.command&&(o[m.command]=(o[m.command]||0)+1),m.file&&(i[m.file]=(i[m.file]||0)+1,c.add(m.file)),m.language&&(a[m.language]=(a[m.language]||0)+1,r.add(m.language)),m.keystrokes&&(f+=m.keystrokes)});let d=Object.values(o).reduce((m,v)=>m+v,0),u=Object.entries(o).map(([m,v])=>({command:m,count:v})).sort((m,v)=>v.count-m.count).slice(0,5),l=this.computeTimeMetrics(e,t),g=Array.from(l.fileDurations.entries()).map(([m,v])=>({file:m,time:Number(v.toFixed(1))})).sort((m,v)=>v.time-m.time).slice(0,5);g.length===0&&Object.keys(i).length>0&&(g=Object.entries(i).map(([m,v])=>({file:m,time:v})).sort((m,v)=>v.time-m.time).slice(0,5));let y=Object.values(a).reduce((m,v)=>m+v,0),h=y===0?[]:Object.entries(a).map(([m,v])=>({language:m,percentage:Math.round(v/y*100)})).sort((m,v)=>v.percentage-m.percentage);return{productivityScore:n,mostUsedCommands:u,mostWorkedFiles:g,languageDistribution:h,suggestions:[],dailyCodingMinutes:l.dailyCodingMinutes,totalActiveMinutes:l.totalActiveMinutes,streakDays:l.streakDays,totalKeystrokes:f,totalCommandsExecuted:d,uniqueFilesWorked:c.size,uniqueLanguages:r.size,activeHourRange:{earliest:l.earliestHour,latest:l.latestHour},fileSwitchCount:l.fileSwitchCount}}mergeWithDerivedMetrics(e,t,n){let o=this.performLocalAnalysis(t,n);return{...o,...e,mostUsedCommands:e.mostUsedCommands?.length?e.mostUsedCommands:o.mostUsedCommands,mostWorkedFiles:e.mostWorkedFiles?.length?e.mostWorkedFiles:o.mostWorkedFiles,languageDistribution:e.languageDistribution?.length?e.languageDistribution:o.languageDistribution,suggestions:e.suggestions?.length?e.suggestions:o.suggestions,dailyCodingMinutes:e.dailyCodingMinutes?.length?e.dailyCodingMinutes:o.dailyCodingMinutes,totalActiveMinutes:e.totalActiveMinutes??o.totalActiveMinutes,streakDays:e.streakDays??o.streakDays,totalKeystrokes:e.totalKeystrokes??o.totalKeystrokes,totalCommandsExecuted:e.totalCommandsExecuted??o.totalCommandsExecuted,uniqueFilesWorked:e.uniqueFilesWorked??o.uniqueFilesWorked,uniqueLanguages:e.uniqueLanguages??o.uniqueLanguages,activeHourRange:e.activeHourRange??o.activeHourRange,fileSwitchCount:e.fileSwitchCount??o.fileSwitchCount}}computeTimeMetrics(e,t){let n=new Map,o=[],i=new Date;i.setHours(0,0,0,0);let a=Math.max(1,t);for(let w=a-1;w>=0;w--){let C=new Date(i);C.setDate(i.getDate()-w);let A=C.toISOString().split("T")[0];n.set(A,0),o.push(A)}if(e.length===0)return{dailyCodingMinutes:o.map(C=>({date:C,minutes:0})),totalActiveMinutes:0,streakDays:0,earliestHour:null,latestHour:null,fileSwitchCount:0,fileDurations:new Map};let c=[...e].sort((w,C)=>w.timestamp-C.timestamp),r=new Map,f=600*1e3,d=300*1e3,u=null,l=null,g=0,y,h=(w,C,A)=>{let k=new Date(w).toISOString().split("T")[0];n.has(k)||(n.set(k,0),o.push(k)),n.set(k,(n.get(k)||0)+C),A&&r.set(A,(r.get(A)||0)+C)};for(let w of c){let C=new Date(w.timestamp).getHours();if(u=u===null?C:Math.min(u,C),l=l===null?C:Math.max(l,C),!y){y=w;continue}let A=w.timestamp-y.timestamp,k=0;A>0&&(A<=f?k=A/6e4:k=d/6e4),k>0&&h(y.timestamp,k,y.file),y.file&&w.file&&y.file!==w.file&&g++,y=w}if(y){let w=d/6e4;h(y.timestamp,w,y.file)}let b=Array.from(new Set(o)).sort();b.length>a&&b.splice(0,b.length-a);let m=b.map(w=>({date:w,minutes:Number((n.get(w)||0).toFixed(1))})),v=m.reduce((w,C)=>w+C.minutes,0),P=0;for(let w=m.length-1;w>=0&&m[w].minutes>0;w--)P++;return{dailyCodingMinutes:m,totalActiveMinutes:v,streakDays:P,earliestHour:u,latestHour:l,fileSwitchCount:g,fileDurations:r}}calculateProductivityScore(e){if(e.length===0)return 0;let t=50,n=Math.min(e.length/100,1)*20;t+=n;let o=new Set(e.filter(r=>r.command).map(r=>r.command)),i=Math.min(o.size/10,1)*15;t+=i;let a=new Set(e.filter(r=>r.file).map(r=>r.file)),c=Math.min(a.size/5,1)*15;return t+=c,Math.round(Math.min(t,100))}};var x=E(require("vscode")),Q=class s{static viewType="codeflow.report";_panel;_disposables=[];context;_refreshCallback;constructor(e){this.context=e}setRefreshCallback(e){this._refreshCallback=e}show(e){this._panel?(this._panel.reveal(x.ViewColumn.One),this._panel.webview.html=this._getHtmlForWebview(this._panel.webview,e)):(this._panel=x.window.createWebviewPanel(s.viewType,"CodeFlow Report",x.ViewColumn.One,{enableScripts:!0,localResourceRoots:[x.Uri.joinPath(this.context.extensionUri,"media"),x.Uri.joinPath(this.context.extensionUri,"icon")]}),this._panel.iconPath=x.Uri.joinPath(this.context.extensionUri,"icon","2.png"),this._panel.webview.html=this._getHtmlForWebview(this._panel.webview,e),this._panel.webview.onDidReceiveMessage(async t=>{if(console.log("Webview message received:",t),t?.type==="upgrade")console.log("Executing upgrade command..."),await x.commands.executeCommand("codeflow.upgradeToPro");else if(t?.type==="refresh")console.log("Executing refresh..."),this._refreshCallback&&await this._refreshCallback();else if(t?.type==="setGoal")console.log("Setting focus goal:",t.goal),await this.context.globalState.update("focusGoal",t.goal),x.window.showInformationMessage(`Focus goal set to ${t.goal} hours per day!`);else if(t?.type==="scheduleBreak"){console.log("Scheduling break reminder:",t.minutes);let n=t.minutes*60*1e3;setTimeout(()=>{x.window.showInformationMessage("\u23F0 Time for a break! Step away from your screen for a few minutes.","Got it").then(o=>{o==="Got it"&&console.log("Break reminder acknowledged")})},n),x.window.showInformationMessage(`Break reminder scheduled for ${t.minutes} minutes from now.`)}},void 0,this._disposables),this._panel.onDidDispose(()=>this.dispose(),null,this._disposables))}_getHtmlForWebview(e,t){let n=e.asWebviewUri(x.Uri.joinPath(this.context.extensionUri,"media","chart.umd.js")),o=e.asWebviewUri(x.Uri.joinPath(this.context.extensionUri,"media","jspdf.umd.min.js")),i=e.asWebviewUri(x.Uri.joinPath(this.context.extensionUri,"media","html2canvas.min.js")),a=e.asWebviewUri(x.Uri.joinPath(this.context.extensionUri,"media","styles.css")),c=e.asWebviewUri(x.Uri.joinPath(this.context.extensionUri,"icon","2.png")),r=yt(),f=A=>{let k=Math.round(A*10)/10;return Number.isInteger(k)?k.toString():k.toFixed(1)},d=f(t.totalActiveMinutes/60),u=t.dailyCodingMinutes.length>0?f(t.totalActiveMinutes/t.dailyCodingMinutes.length/60):"0",l=t.languageDistribution[0]?.language??"\u2014",g=t.streakDays>0?`${t.streakDays} day${t.streakDays===1?"":"s"}`:"No streak yet",y=this.formatActiveHourRange(t.activeHourRange),h=t.uniqueLanguages===0?"No languages yet":t.uniqueLanguages===1?"1 language":`${t.uniqueLanguages} languages`,b=t.totalCommandsExecuted.toLocaleString(),m=t.totalKeystrokes.toLocaleString(),v=t.uniqueFilesWorked.toLocaleString(),P=this.buildAchievementsHtml(t),w=this.buildAiInsightsHtml(t),C=this.buildPremiumFeaturesHtml();return`<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${e.cspSource} 'unsafe-inline'; script-src 'nonce-${r}' ${e.cspSource} 'unsafe-inline'; img-src ${e.cspSource} data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeFlow Report</title>
    <link href="${a}" rel="stylesheet">
    </head>
    <body>
    <button class="refresh-toggle" id="refreshBtn" aria-label="Refresh dashboard">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0.01 3.58 0.01 8C0.01 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" fill="#0066cc"/>
                </svg>
    </button>
    <div class="container">
        <header class="dashboard-header">
        <div class="header-content" style="position: relative;">
            <button class="btn export-btn" id="exportBtn" style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); z-index: 10;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor"/>
                </svg>
                Export Report
            </button>
            <div class="header-logo-bg" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; pointer-events: none; z-index: 0;">
                <img src="${c}" alt="" style="width: 280px; height: 280px; object-fit: contain;">
            </div>
            <div class="header-copy" style="position: relative; z-index: 1;">
                <span class="eyebrow" id="datetime">\u{1FA77} ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}</span>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${c}" alt="CodeFlow AI Logo" style="width: 40px; height: 40px; object-fit: contain; border: 1px solid #7999ddff; padding: 6px; border-radius: 8px; background: #f8fafc;">
                    <h1 style="animation: colorPulse 3s ease-in-out infinite;">CodeFlow AI</h1>
                </div>
                <p style="font-size: 16px; color: #64748b; margin: 12px 0; line-height: 1.6; font-weight: 400;">Your recent <span style="font-weight: 700; color: #0066cc;">Coding Rhythm</span>, intelligently summarized.</p>
                <div class="header-meta">
                <span class="meta-pill">Top language: ${l}</span>
                <span class="meta-pill">Active window: ${y}</span>
                </div>
            </div>
            <div class="header-actions" style="position: relative; z-index: 1;">
                <div class="score-card" style="min-width: 320px; padding: 24px;">
                <div class="score-ring">
                    <span class="score-value">${t.productivityScore}</span>
                </div>
                <div class="score-details">
                    <span class="score-label">Productivity Score</span>
                    <span class="score-sub">${d}h logged</span>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #64748b;">Streak</span>
                            <span style="font-size: 12px; font-weight: 600; color: #0066cc;">${g}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: #64748b;">Languages</span>
                            <span style="font-size: 12px; font-weight: 600; color: #0066cc;">${t.uniqueLanguages}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #64748b;">Avg/Day</span>
                            <span style="font-size: 12px; font-weight: 600; color: #0066cc;">${u}h</span>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
        </header>

        <section class="metric-grid">
        <article class="metric-card">
            <span class="metric-icon">\u23F1\uFE0F</span>
            <div>
            <h3>${d}h</h3>
            <p>Total coding time</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">\u{1F4CA}</span>
            <div>
            <h3>${u}h</h3>
            <p>Average per day</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">\u2328\uFE0F</span>
            <div>
            <h3>${b}</h3>
            <p>Commands executed</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">\u{1F525}</span>
            <div>
            <h3>${g}</h3>
            <p>Current streak</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">\u{1F446}</span>
            <div>
            <h3>${m}</h3>
            <p>Keystrokes tracked</p>
            </div>
        </article>
        <article class="metric-card">
            <span class="metric-icon">\u{1F4C1}</span>
            <div>
            <h3>${v}</h3>
            <p>Files touched</p>
            </div>
        </article>
        </section>

        <section class="chart-grid">
        <article class="insight-card chart-card">
            <div class="card-head">
            <h2>\u{1F4C6} Daily Coding Hours</h2>
            <span class="chip">Avg ${u}h/day</span>
            </div>
            <div class="chart-container large">
            <canvas id="dailyChart"></canvas>
            </div>
        </article>

        <article class="insight-card chart-card">
            <div class="card-head">
            <h2>\u{1F310} Language Distribution</h2>
            <span class="chip">${h}</span>
            </div>
            <div class="chart-container">
            <canvas id="languageChart"></canvas>
            </div>
        </article>

        <article class="insight-card chart-card">
            <div class="card-head">
            <h2>\u2328\uFE0F Most Used Commands</h2>
            <span class="chip">${t.mostUsedCommands.length} favourites</span>
            </div>
            <div class="chart-container">
            <canvas id="commandChart"></canvas>
            </div>
        </article>

        <article class="insight-card chart-card">
            <div class="card-head">
            <h2>\u{1F4C1} Most Worked Files</h2>
            <span class="chip">${t.uniqueFilesWorked} files</span>
            </div>
            <div class="chart-container">
            <canvas id="fileChart"></canvas>
            </div>
        </article>
        </section>

        <section class="deep-dive">
        <article class="insight-card ai-card">
            <div class="card-head">
            <h2>\u{1F916} AI-Powered Insights</h2>
            <span class="chip">Smart suggestions</span>
            </div>
            ${w}
        </article>

        <article class="insight-card badge-card">
            <div class="card-head">
            <h2>\u{1F3C6} Achievement Badges</h2>
            <span class="chip">Track your highlights</span>
            </div>
            <div class="badges">
            ${P}
            </div>
        </article>

        <article class="insight-card premium-card">
            <div class="card-head">
            <h2>\u{1F48E} Premium Features</h2>
            <span class="chip">Unlock more flow</span>
            </div>
            <div class="premium-grid">
            ${C}
            </div>
            <button class="btn upgrade-btn" id="upgradeBtn">Upgrade to CodeFlow Pro</button>
        </article>
        </section>
    </div>

    <script nonce="${r}" src="${n}"></script>
    <script nonce="${r}" src="${o}"></script>
    <script nonce="${r}" src="${i}"></script>
    <script nonce="${r}">
    console.log('Scripts loading...');
    console.log('Chart.js available:', typeof Chart);
    console.log('jsPDF available:', typeof window.jspdf);
    console.log('html2canvas available:', typeof html2canvas);
    
    const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : { postMessage: () => {} };
    const dailyCoding = ${JSON.stringify(t.dailyCodingMinutes)};
    const languageData = ${JSON.stringify(t.languageDistribution)};
    const commandData = ${JSON.stringify(t.mostUsedCommands)};
    const fileData = ${JSON.stringify(t.mostWorkedFiles)};

    // Update time continuously
    function updateDateTime() {
        const dateTimeElement = document.getElementById('datetime');
        if (dateTimeElement) {
            const now = new Date();
            dateTimeElement.textContent = ' \u{1FA77} ' + now.toLocaleDateString() + ' | ' + now.toLocaleTimeString();
        }
    }
    setInterval(updateDateTime, 1000);

    // Initialize charts when Chart.js is loaded
    function initializeCharts() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, retrying...');
            setTimeout(initializeCharts, 100);
            return;
        }

        console.log('Initializing charts...');

        // Chart color schemes
        const gradientColors = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
            legend: { 
                position: 'bottom',
                labels: {
                padding: 15,
                font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 }
            }
            }
        };

        // Daily Coding Hours (Line)
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    const dailyGradient = dailyCtx.createLinearGradient(0, 0, 0, 400);
    dailyGradient.addColorStop(0, 'rgba(37, 99, 235, 0.6)');
    dailyGradient.addColorStop(1, 'rgba(30, 58, 138, 0.1)');

    const dailyLabels = dailyCoding.map(item => formatDayLabel(item.date));
    const dailyHours = dailyCoding.map(item => Number((item.minutes / 60).toFixed(2)));

    new Chart(dailyCtx, {
        type: 'line',
        data: {
        labels: dailyLabels,
        datasets: [{
            label: 'Hours coded',
            data: dailyHours,
            backgroundColor: dailyGradient,
            borderColor: '#2563eb',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
        },
        options: {
        ...chartOptions,
        scales: {
            y: {
            beginAtZero: true,
            ticks: { font: { size: 11 } },
            title: { display: true, text: 'Hours', font: { size: 12 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
            }
        }
        }
    });

    // Language Distribution Chart (Doughnut)
    const languageCtx = document.getElementById('languageChart').getContext('2d');
    new Chart(languageCtx, {
        type: 'doughnut',
        data: {
        labels: languageData.map(item => item.language),
        datasets: [{
            data: languageData.map(item => item.percentage),
            backgroundColor: gradientColors,
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 10
        }]
        },
        options: {
        ...chartOptions,
        cutout: '60%',
        plugins: {
            ...chartOptions.plugins,
            legend: { position: 'right' }
        }
        }
    });

    // Commands Chart (Bar with gradient)
    const commandCtx = document.getElementById('commandChart').getContext('2d');
    const commandGradient = commandCtx.createLinearGradient(0, 0, 0, 400);
    commandGradient.addColorStop(0, 'rgba(37, 99, 235, 0.8)');
    commandGradient.addColorStop(1, 'rgba(30, 58, 138, 0.8)');
    new Chart(commandCtx, {
        type: 'bar',
        data: {
        labels: commandData.map(item => item.command),
        datasets: [{
            label: 'Usage Count',
            data: commandData.map(item => item.count),
            backgroundColor: commandGradient,
            borderRadius: 8,
            borderSkipped: false
        }]
        },
        options: {
        ...chartOptions,
        scales: {
            y: {
            beginAtZero: true,
            ticks: { font: { size: 11 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
            }
        }
        }
    });

    // Files Chart (Horizontal Bar)
    const fileCtx = document.getElementById('fileChart').getContext('2d');
    const fileGradient = fileCtx.createLinearGradient(0, 0, 400, 0);
    fileGradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
    fileGradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');

    new Chart(fileCtx, {
        type: 'bar',
        data: {
        labels: fileData.map(item => item.file.split('/').pop() || item.file),
        datasets: [{
            label: 'Time Spent (minutes)',
            data: fileData.map(item => item.time),
            backgroundColor: fileGradient,
            borderRadius: 8,
            borderSkipped: false
        }]
        },
        options: {
        ...chartOptions,
        indexAxis: 'y',
        scales: {
            x: {
            beginAtZero: true,
            ticks: { font: { size: 11 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            y: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
            }
        }
        }
    });

        console.log('Charts initialized successfully');
    }

    // Start chart initialization
    initializeCharts();

    // Attach event listeners to buttons
    document.addEventListener('DOMContentLoaded', function() {
        const refreshBtn = document.getElementById('refreshBtn');
        const exportBtn = document.getElementById('exportBtn');
        const upgradeBtn = document.getElementById('upgradeBtn');
        
        if (refreshBtn) refreshBtn.addEventListener('click', refreshDashboard);
        if (exportBtn) exportBtn.addEventListener('click', exportReport);
        if (upgradeBtn) upgradeBtn.addEventListener('click', requestUpgrade);
        
        // Event delegation for delete buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.delete-btn')) {
                deleteSuggestion(e.target.closest('.delete-btn'));
            }
        });
    });

    function showExportModal() {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;';
        
        // Create modal card
        const modal = document.createElement('div');
        modal.style.cssText = 'background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); animation: slideUp 0.3s ease;';
        
        modal.innerHTML = \`
            <style>
                .export-option { cursor: pointer; }
                .export-modal-btn { cursor: pointer; }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .export-modal-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 12px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .export-modal-desc {
                    color: #64748b;
                    margin: 0 0 24px 0;
                    line-height: 1.6;
                }
                .export-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .export-option {
                    padding: 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .export-option:hover {
                    border-color: #0066cc;
                    background: #f0f7ff;
                    transform: translateY(-2px);
                }
                .export-option-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                .export-option-content {
                    flex: 1;
                }
                .export-option-title {
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }
                .export-option-desc {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                }
                .export-modal-footer {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .export-modal-btn {
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .export-modal-btn-cancel {
                    background: #f1f5f9;
                    color: #475569;
                }
                .export-modal-btn-cancel:hover {
                    background: #e2e8f0;
                }
            </style>
            <h2 class="export-modal-title">
                <span>\u{1F4CA}</span>
                Export Your Report
            </h2>
            <p class="export-modal-desc">
                Choose how you'd like to download your CodeFlow productivity report.
            </p>
            <div class="export-options">
                <div class="export-option" data-action="downloadPDF">
                    <span class="export-option-icon">\u{1F4C4}</span>
                    <div class="export-option-content">
                        <h3 class="export-option-title">PDF Report</h3>
                        <p class="export-option-desc">Professional formatted report with all metrics and insights</p>
                    </div>
                </div>
                <div class="export-option" data-action="downloadJSON">
                    <span class="export-option-icon">\u{1F4BE}</span>
                    <div class="export-option-content">
                        <h3 class="export-option-title">JSON Data</h3>
                        <p class="export-option-desc">Raw data export for further analysis or integration</p>
                    </div>
                </div>
                <div class="export-option" data-action="downloadInsights">
                    <span class="export-option-icon">\u{1F9E0}</span>
                    <div class="export-option-content">
                        <h3 class="export-option-title">AI Insights</h3>
                        <p class="export-option-desc">Detailed analysis and recommendations in JSON format</p>
                    </div>
                </div>
            </div>
            <div class="export-modal-footer">
                <button class="export-modal-btn export-modal-btn-cancel" data-action="closeExportModal">
                    Cancel
                </button>
            </div>
        \`;
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        // Attach event listeners to modal buttons
        const exportOptions = modal.querySelectorAll('[data-action]');
        exportOptions.forEach(option => {
            option.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                if (action === 'downloadPDF') downloadPDF();
                else if (action === 'downloadJSON') downloadJSON();
                else if (action === 'downloadInsights') downloadInsights();
                else if (action === 'closeExportModal') closeExportModal();
            });
        });
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeExportModal();
            }
        });
        
        // Store reference for closing
        window.exportModalBackdrop = backdrop;
    }
    
    function closeExportModal() {
        const backdrop = window.exportModalBackdrop;
        if (backdrop) {
            backdrop.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                backdrop.remove();
                window.exportModalBackdrop = null;
            }, 200);
        }
    }
    
    function exportReport() {
        showExportModal();
    }
    
    async function downloadPDF() {
        closeExportModal();
        
        try {
            console.log('Downloading PDF...');
            
            // Show enhanced loading notification
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 20px 28px; border-radius: 12px; z-index: 10000; box-shadow: 0 8px 24px rgba(0, 102, 204, 0.3); animation: slideInRight 0.3s ease; border: 2px solid rgba(255, 255, 255, 0.2);';
            notification.innerHTML = '<div style="display: flex; align-items: center; gap: 14px;">' +
                '<div style="width: 32px; height: 32px; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>' +
                '<div>' +
                '<div style="font-weight: 600; font-size: 15px; margin-bottom: 2px;">Creating PDF...</div>' +
                '<div style="font-size: 12px; opacity: 0.9;">Adding colors and styling</div>' +
                '</div>' +
                '</div>' +
                '<style>' +
                '@keyframes spin { to { transform: rotate(360deg); } }' +
                '@keyframes slideInRight { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }' +
                '@keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }' +
                '</style>';
            document.body.appendChild(notification);

            // Check if jsPDF is loaded
            console.log('Checking jsPDF:', typeof window.jspdf);
            if (!window.jspdf) {
                throw new Error('jsPDF library not loaded. Please reload the page.');
            }

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            console.log('jsPDF loaded:', typeof jsPDF);
            const pdf = new jsPDF('p', 'mm', 'a4');
            console.log('PDF instance created');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            let yPos = margin;

            // Color palette for the report
            const colors = {
                primary: [37, 99, 235],      // Blue
                secondary: [16, 185, 129],    // Green
                accent: [245, 158, 11],       // Orange
                danger: [239, 68, 68],        // Red
                purple: [139, 92, 246],       // Purple
                pink: [236, 72, 153],         // Pink
                teal: [20, 184, 166],         // Teal
                gray: [107, 114, 128],        // Gray
                lightGray: [229, 231, 235],   // Light Gray
                darkGray: [55, 65, 81]        // Dark Gray
            };

            // Helper function to add new page if needed
            function checkNewPage(requiredSpace) {
                if (yPos + requiredSpace > pageHeight - margin) {
                    pdf.addPage();
                    yPos = margin;
                    
                    // Add decorative header on new pages
                    pdf.setFillColor(...colors.primary);
                    pdf.rect(0, 0, pageWidth, 8, 'F');
                    yPos += 5;
                    
                    return true;
                }
                return false;
            }

            // Add colorful header banner
            pdf.setFillColor(...colors.primary);
            pdf.rect(0, 0, pageWidth, 35, 'F');
            
            // Add gradient effect with rectangles
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 25, pageWidth, 10, 'F');
            
            // Title with shadow effect
            pdf.setFontSize(28);
            pdf.setTextColor(255, 255, 255);
            pdf.text('CodeFlow AI Report', pageWidth / 2, 15, { align: 'center' });
            
            // Subtitle
            pdf.setFontSize(11);
            pdf.setTextColor(220, 220, 255);
            pdf.text('Your Comprehensive Coding Analytics', pageWidth / 2, 23, { align: 'center' });
            
            yPos = 45;

            // Date with icon-style box
            pdf.setFillColor(...colors.lightGray);
            pdf.roundedRect(pageWidth / 2 - 45, yPos, 90, 10, 2, 2, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(...colors.darkGray);
            pdf.text(new Date().toLocaleDateString() + ' | ' + new Date().toLocaleTimeString(), pageWidth / 2, yPos + 6.5, { align: 'center' });
            yPos += 18;

            // Productivity Score - Large colorful card
            const scoreCardHeight = 35;
            
            // Card background with gradient effect
            pdf.setFillColor(...colors.primary);
            pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, scoreCardHeight, 5, 5, 'F');
            
            // Lighter overlay for depth
            pdf.setFillColor(59, 130, 246);
            pdf.roundedRect(margin, yPos + scoreCardHeight - 15, pageWidth - 2 * margin, 15, 0, 0, 'F');
            
            // Score circle
            pdf.setFillColor(255, 255, 255);
            pdf.circle(pageWidth / 2, yPos + 15, 18, 'F');
            
            // Score value
            pdf.setFontSize(36);
            pdf.setTextColor(...colors.primary);
            pdf.text('${t.productivityScore}', pageWidth / 2, yPos + 18, { align: 'center' });
            
            // Score label
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text('PRODUCTIVITY SCORE', pageWidth / 2, yPos + scoreCardHeight - 8, { align: 'center' });
            
            // Total hours badge
            pdf.setFillColor(...colors.secondary);
            pdf.roundedRect(pageWidth / 2 - 20, yPos + scoreCardHeight - 4, 40, 7, 2, 2, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(255, 255, 255);
            pdf.text('${d}h Total', pageWidth / 2, yPos + scoreCardHeight, { align: 'center' });
            
            yPos += scoreCardHeight + 12;

            // Key Metrics Section - Colorful Cards
            pdf.setFontSize(18);
            pdf.setTextColor(...colors.primary);
            pdf.text('Key Performance Metrics', margin, yPos);
            yPos += 10;

            const metrics = [
                { label: 'Total Coding Time', value: '${d}h', icon: 'T', color: colors.primary },
                { label: 'Average per Day', value: '${u}h', icon: 'A', color: colors.secondary },
                { label: 'Current Streak', value: '${g}', icon: 'S', color: colors.accent },
                { label: 'Commands Executed', value: '${b}', icon: 'C', color: colors.purple },
                { label: 'Keystrokes Tracked', value: '${m}', icon: 'K', color: colors.pink },
                { label: 'Files Touched', value: '${v}', icon: 'F', color: colors.teal },
                { label: 'Languages Used', value: '${t.uniqueLanguages}', icon: 'L', color: colors.danger },
                { label: 'Active Window', value: '${y}', icon: 'W', color: colors.gray }
            ];

            const cardWidth = (pageWidth - 2 * margin - 8) / 2;
            const cardHeight = 18;
            
            metrics.forEach((metric, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const x = margin + col * (cardWidth + 8);
                const y = yPos + row * (cardHeight + 5);

                checkNewPage(cardHeight + 5);
                
                // Card background with color accent
                pdf.setFillColor(250, 250, 252);
                pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
                
                // Colored left border
                pdf.setFillColor(...metric.color);
                pdf.roundedRect(x, y, 4, cardHeight, 3, 3, 'F');
                
                // Icon circle
                pdf.setFillColor(...metric.color);
                pdf.circle(x + 10, y + 9, 5, 'F');
                pdf.setFontSize(10);
                pdf.setTextColor(255, 255, 255);
                pdf.text(metric.icon, x + 8.5, y + 11);
                
                // Label
                pdf.setFontSize(8);
                pdf.setTextColor(...colors.gray);
                pdf.text(metric.label, x + 18, y + 7);
                
                // Value
                pdf.setFontSize(13);
                pdf.setTextColor(...colors.darkGray);
                pdf.setFont(undefined, 'bold');
                pdf.text(metric.value, x + 18, y + 14);
                pdf.setFont(undefined, 'normal');
            });
            
            yPos += Math.ceil(metrics.length / 2) * (cardHeight + 5) + 12;

            // Language Distribution - Colorful bars
            checkNewPage(70);
            
            // Section header with background
            pdf.setFillColor(...colors.lightGray);
            pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');
            pdf.setFontSize(16);
            pdf.setTextColor(...colors.primary);
            pdf.text('Language Distribution', margin + 5, yPos + 7);
            yPos += 15;

            // Language colors for variety
            const langColors = [
                colors.primary, colors.secondary, colors.accent, colors.purple,
                colors.pink, colors.teal, colors.danger, colors.gray
            ];

            pdf.setFontSize(10);
            languageData.slice(0, 8).forEach((lang, index) => {
                checkNewPage(10);
                
                const langColor = langColors[index % langColors.length];
                
                // Language icon badge
                pdf.setFillColor(...langColor);
                pdf.circle(margin + 5, yPos - 1, 2.5, 'F');
                
                // Language name
                pdf.setTextColor(...colors.darkGray);
                pdf.setFont(undefined, 'bold');
                pdf.text(lang.language, margin + 10, yPos);
                pdf.setFont(undefined, 'normal');
                
                // Progress bar background
                const barWidth = 95;
                const barHeight = 5;
                const barX = margin + 60;
                
                pdf.setFillColor(...colors.lightGray);
                pdf.roundedRect(barX, yPos - 3.5, barWidth, barHeight, 1.5, 1.5, 'F');
                
                // Progress bar fill with gradient effect
                const fillWidth = barWidth * (lang.percentage / 100);
                pdf.setFillColor(...langColor);
                pdf.roundedRect(barX, yPos - 3.5, fillWidth, barHeight, 1.5, 1.5, 'F');
                
                // Percentage badge
                pdf.setFillColor(...langColor);
                pdf.roundedRect(barX + barWidth + 3, yPos - 3.5, 15, barHeight, 1.5, 1.5, 'F');
                pdf.setFontSize(8);
                pdf.setTextColor(255, 255, 255);
                pdf.text(lang.percentage.toFixed(1) + '%', barX + barWidth + 10.5, yPos + 0.5, { align: 'center' });
                
                yPos += 8;
            });
            yPos += 10;

            // Most Used Commands - Enhanced styling
            checkNewPage(70);
            
            // Section header with background
            pdf.setFillColor(...colors.lightGray);
            pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');
            pdf.setFontSize(16);
            pdf.setTextColor(...colors.purple);
            pdf.text('Most Used Commands', margin + 5, yPos + 7);
            yPos += 15;

            const maxCount = Math.max(...commandData.map(c => c.count));
            const cmdColors = [colors.purple, colors.pink, colors.teal, colors.accent, colors.secondary];

            pdf.setFontSize(9);
            commandData.slice(0, 8).forEach((cmd, index) => {
                checkNewPage(10);
                
                const cmdColor = cmdColors[index % cmdColors.length];
                
                // Rank badge
                pdf.setFillColor(...cmdColor);
                pdf.circle(margin + 5, yPos - 1, 3, 'F');
                pdf.setFontSize(7);
                pdf.setTextColor(255, 255, 255);
                pdf.text((index + 1).toString(), margin + 5, yPos + 0.5, { align: 'center' });
                
                // Command name
                pdf.setFontSize(9);
                pdf.setTextColor(...colors.darkGray);
                const cmdText = cmd.command.length > 32 ? cmd.command.substring(0, 29) + '...' : cmd.command;
                pdf.text(cmdText, margin + 11, yPos);
                
                // Progress bar background
                const barWidth = 70;
                const barHeight = 5;
                const barX = margin + 95;
                
                pdf.setFillColor(...colors.lightGray);
                pdf.roundedRect(barX, yPos - 3.5, barWidth, barHeight, 1.5, 1.5, 'F');
                
                // Progress bar fill
                const fillWidth = barWidth * (cmd.count / maxCount);
                pdf.setFillColor(...cmdColor);
                pdf.roundedRect(barX, yPos - 3.5, fillWidth, barHeight, 1.5, 1.5, 'F');
                
                // Count badge
                pdf.setFillColor(...cmdColor);
                pdf.roundedRect(barX + barWidth + 3, yPos - 3.5, 13, barHeight, 1.5, 1.5, 'F');
                pdf.setFontSize(7);
                pdf.setTextColor(255, 255, 255);
                pdf.text(cmd.count.toString(), barX + barWidth + 9.5, yPos + 0.5, { align: 'center' });
                
                yPos += 8;
            });
            yPos += 10;

            // AI Insights - Enhanced card design
            checkNewPage(50);
            
            // Section header with gradient background
            pdf.setFillColor(...colors.secondary);
            pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255);
            pdf.text('AI-Powered Insights', margin + 5, yPos + 7);
            yPos += 15;

            const insights = ${JSON.stringify(t.suggestions)};
            const insightColors = [colors.secondary, colors.primary, colors.accent, colors.purple, colors.teal];
            
            pdf.setFontSize(9);
            insights.slice(0, 5).forEach((suggestion, index) => {
                checkNewPage(12);
                
                const insightColor = insightColors[index % insightColors.length];
                
                // Insight card background
                pdf.setFillColor(248, 250, 252);
                pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');
                
                // Colored accent bar
                pdf.setFillColor(...insightColor);
                pdf.roundedRect(margin, yPos, 3, 10, 2, 2, 'F');
                
                // Bullet point
                pdf.setFillColor(...insightColor);
                pdf.circle(margin + 8, yPos + 5, 1.5, 'F');
                
                // Insight text
                pdf.setTextColor(...colors.darkGray);
                const lines = pdf.splitTextToSize(suggestion, pageWidth - 2 * margin - 18);
                let textY = yPos + 4;
                lines.forEach(line => {
                    pdf.text(line, margin + 12, textY);
                    textY += 4;
                });
                
                yPos += Math.max(10, lines.length * 4 + 2);
            });
            yPos += 5;

            // Footer with colorful design
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                
                // Footer background
                pdf.setFillColor(...colors.primary);
                pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
                
                // Footer gradient overlay
                pdf.setFillColor(59, 130, 246);
                pdf.rect(0, pageHeight - 15, pageWidth, 7, 'F');
                
                // Footer text
                pdf.setFontSize(8);
                pdf.setTextColor(255, 255, 255);
                pdf.text('Generated by CodeFlow AI', margin, pageHeight - 7);
                pdf.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 7, { align: 'center' });
                pdf.text('Page ' + i + ' / ' + totalPages, pageWidth - margin, pageHeight - 7, { align: 'right' });
                
                // Decorative dots
                pdf.setFillColor(255, 255, 255);
                for (let d = 0; d < 5; d++) {
                    pdf.circle(margin + 70 + d * 3, pageHeight - 4, 0.5, 'F');
                }
            }

            // Save PDF
            const fileName = 'codeflow-report-' + new Date().toISOString().split('T')[0] + '.pdf';
            pdf.save(fileName);

            // Remove loading notification and show enhanced success
            notification.remove();
            const successNotif = document.createElement('div');
            successNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px 28px; border-radius: 12px; z-index: 10000; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3); animation: slideInRight 0.3s ease; border: 2px solid rgba(255, 255, 255, 0.3);';
            successNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 14px;">' +
                '<div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">\u2713</div>' +
                '<div>' +
                '<div style="font-weight: 600; font-size: 15px; margin-bottom: 2px;">PDF Generated!</div>' +
                '<div style="font-size: 12px; opacity: 0.9;">Your colorful report is ready</div>' +
                '</div>' +
                '</div>';
            document.body.appendChild(successNotif);
            setTimeout(() => {
                successNotif.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => successNotif.remove(), 300);
            }, 3000);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', error.message, error.stack);
            
            const errorNotif = document.createElement('div');
            errorNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px 28px; border-radius: 12px; z-index: 10000; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3); animation: slideInRight 0.3s ease; border: 2px solid rgba(255, 255, 255, 0.3);';
            errorNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 14px;">' +
                '<div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">\u2715</div>' +
                '<div>' +
                '<div style="font-weight: 600; font-size: 15px; margin-bottom: 2px;">PDF Generation Failed</div>' +
                '<div style="font-size: 12px; opacity: 0.9;">Please try again or check console</div>' +
                '</div>' +
                '</div>';
            document.body.appendChild(errorNotif);
            setTimeout(() => {
                errorNotif.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => errorNotif.remove(), 300);
            }, 4000);
        }
    }
    
    function downloadJSON() {
        closeExportModal();
        
        try {
            const reportData = {
                productivityScore: ${t.productivityScore},
                languages: languageData,
                commands: commandData,
                files: fileData,
                dailyCoding: dailyCoding,
                generatedAt: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(reportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'codeflow-report-' + new Date().toISOString().split('T')[0] + '.json';
            link.click();
            URL.revokeObjectURL(url);
            
            // Show success notification
            const successNotif = document.createElement('div');
            successNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
            successNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><span>\u2713</span><span>JSON data downloaded successfully!</span></div>';
            document.body.appendChild(successNotif);
            setTimeout(() => successNotif.remove(), 3000);
        } catch (error) {
            console.error('Error downloading JSON:', error);
            alert('Failed to download JSON data.');
        }
    }
    
    function downloadInsights() {
        closeExportModal();
        exportInsights();
        
        // Show success notification
        const successNotif = document.createElement('div');
        successNotif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
        successNotif.innerHTML = '<div style="display: flex; align-items: center; gap: 12px;"><span>\u2713</span><span>AI Insights downloaded successfully!</span></div>';
        document.body.appendChild(successNotif);
        setTimeout(() => successNotif.remove(), 3000);
    }

    function refreshDashboard() {
        vscodeApi.postMessage({ type: 'refresh' });
    }

    function formatDayLabel(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        if (Number.isNaN(date.getTime())) {
        return dateStr;
        }
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function requestUpgrade() {
        console.log('requestUpgrade called');
        try {
            vscodeApi.postMessage({ type: 'upgrade' });
            console.log('Upgrade message sent to VS Code');
        } catch (error) {
            console.error('Error sending upgrade message:', error);
        }
    }

    function setFocusGoal() {
        const goal = prompt('Set your daily coding goal (in hours):', '4');
        if (goal !== null && !isNaN(parseFloat(goal))) {
            vscodeApi.postMessage({ 
                type: 'setGoal', 
                goal: parseFloat(goal) 
            });
            alert('Focus goal set to ' + goal + ' hours per day!');
        }
    }

    function scheduleBreak() {
        const minutes = prompt('Schedule a break reminder (in minutes):', '25');
        if (minutes !== null && !isNaN(parseInt(minutes))) {
            vscodeApi.postMessage({ 
                type: 'scheduleBreak', 
                minutes: parseInt(minutes) 
            });
            alert('Break reminder set for ' + minutes + ' minutes from now.');
        }
    }

    function exportInsights() {
        const insights = {
            summary: {
                productivityScore: ${t.productivityScore},
                totalCodingHours: ${d},
                streak: ${t.streakDays},
                languages: ${t.uniqueLanguages}
            },
            suggestions: ${JSON.stringify(t.suggestions)},
            patterns: {
                peakHours: '${this.analyzeProductivityPatterns(t).peakHour}',
                focusIntensity: '${this.analyzeProductivityPatterns(t).focusIntensity}',
                velocity: '${this.analyzeProductivityPatterns(t).velocity}'
            },
            focus: {
                deepWorkSessions: ${this.calculateFocusMetrics(t).deepWorkSessions},
                contextSwitches: ${this.calculateFocusMetrics(t).contextSwitches},
                avgSessionLength: ${this.calculateFocusMetrics(t).avgSessionLength}
            },
            generatedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(insights, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'codeflow-ai-insights-' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    function deleteSuggestion(button) {
        // Get the list item
        const listItem = button.closest('.insight-item');
        const suggestionText = listItem.getAttribute('data-suggestion');
        
        // Add fade-out animation
        listItem.style.opacity = '0';
        listItem.style.transform = 'translateX(20px)';
        listItem.style.transition = 'all 0.3s ease';
        
        // Remove from DOM after animation
        setTimeout(() => {
            const category = listItem.closest('.insight-category');
            const categoryCount = category.querySelector('.category-count');
            const insightsList = listItem.closest('.insight-list');
            
            // Remove the item
            listItem.remove();
            
            // Update the count
            const remainingItems = insightsList.querySelectorAll('.insight-item').length;
            categoryCount.textContent = remainingItems;
            
            // Update overall insights count
            const allCategories = document.querySelectorAll('.insight-category');
            let totalCount = 0;
            allCategories.forEach(cat => {
                const count = parseInt(cat.querySelector('.category-count').textContent);
                totalCount += count;
            });
            const insightsCount = document.querySelector('.insights-count');
            if (insightsCount) {
                insightsCount.textContent = totalCount + ' insight' + (totalCount === 1 ? '' : 's');
            }
            
            // If no items left in category, hide the category
            if (remainingItems === 0) {
                category.style.display = 'none';
            }
            
            // Update item numbers
            const items = insightsList.querySelectorAll('.insight-item');
            items.forEach((item, index) => {
                const itemNumber = item.querySelector('.item-number');
                if (itemNumber) {
                    itemNumber.textContent = index + 1;
                }
            });
            
            // Show success notification (temporary deletion - will reappear on next report generation)
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); animation: slideInRight 0.3s ease;';
            notification.innerHTML = '<div style="display: flex; align-items: center; gap: 10px;"><span>\u2713</span><span>Suggestion hidden (temporary)</span></div>';
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 300);
    }

    </script>
    </body>
    </html>`}formatActiveHourRange(e){if(e.earliest===null||e.latest===null)return"No data yet";let t=o=>Math.min(23,Math.max(0,o)),n=o=>{let i=new Date;return i.setHours(t(o),0,0,0),i.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})};return`${n(e.earliest)} \u2013 ${n(e.latest)}`}buildAchievementsHtml(e){let t=e.totalActiveMinutes/60,n=e.dailyCodingMinutes.length>0?e.totalActiveMinutes/e.dailyCodingMinutes.length/60:0,o=[{icon:"\u{1F525}",name:"Persistence",description:"5+ day active streak",earned:e.streakDays>=5,progress:Math.min(100,e.streakDays/5*100),rarity:"common",category:"Productivity"},{icon:"\u{1F48E}",name:"Diamond Streak",description:"30+ day active streak",earned:e.streakDays>=30,progress:Math.min(100,e.streakDays/30*100),rarity:"legendary",category:"Productivity"},{icon:"\u26A1",name:"Speed Demon",description:"4+ hours in a single day",earned:Math.max(...e.dailyCodingMinutes.map(d=>d.minutes))/60>=4,progress:Math.min(100,Math.max(...e.dailyCodingMinutes.map(d=>d.minutes))/60/4*100),rarity:"rare",category:"Productivity"},{icon:"\u{1F3AF}",name:"Consistency King",description:"Average 2+ hours daily",earned:n>=2,progress:Math.min(100,n/2*100),rarity:"epic",category:"Productivity"},{icon:"\u{1F3C3}",name:"Marathon Coder",description:"50+ total hours logged",earned:t>=50,progress:Math.min(100,t/50*100),rarity:"epic",category:"Productivity"},{icon:"\u{1F310}",name:"Polyglot",description:"Worked across 3+ languages",earned:e.uniqueLanguages>=3,progress:Math.min(100,e.uniqueLanguages/3*100),rarity:"common",category:"Skills"},{icon:"\u{1F5E3}\uFE0F",name:"Language Master",description:"Worked across 6+ languages",earned:e.uniqueLanguages>=6,progress:Math.min(100,e.uniqueLanguages/6*100),rarity:"epic",category:"Skills"},{icon:"\u{1F30D}",name:"Universal Developer",description:"Worked across 10+ languages",earned:e.uniqueLanguages>=10,progress:Math.min(100,e.uniqueLanguages/10*100),rarity:"legendary",category:"Skills"},{icon:"\u{1F989}",name:"Night Owl",description:"Coding after 10pm",earned:(e.activeHourRange.latest??-1)>=22,progress:(e.activeHourRange.latest??-1)>=22?100:0,rarity:"common",category:"Lifestyle"},{icon:"\u{1F426}",name:"Early Bird",description:"Started before 8am",earned:(e.activeHourRange.earliest??24)<=7,progress:(e.activeHourRange.earliest??24)<=7?100:0,rarity:"common",category:"Lifestyle"},{icon:"\u{1F319}",name:"Midnight Warrior",description:"Coding after midnight",earned:(e.activeHourRange.latest??-1)>=24||(e.activeHourRange.latest??-1)<=3,progress:(e.activeHourRange.latest??-1)>=24||(e.activeHourRange.latest??-1)<=3?100:0,rarity:"rare",category:"Lifestyle"},{icon:"\u2600\uFE0F",name:"Dawn Breaker",description:"Started before 6am",earned:(e.activeHourRange.earliest??24)<=5,progress:(e.activeHourRange.earliest??24)<=5?100:0,rarity:"rare",category:"Lifestyle"},{icon:"\u2328\uFE0F",name:"Command Master",description:"150+ commands executed",earned:e.totalCommandsExecuted>=150,progress:Math.min(100,e.totalCommandsExecuted/150*100),rarity:"common",category:"Efficiency"},{icon:"\u{1F3AE}",name:"Command Legend",description:"500+ commands executed",earned:e.totalCommandsExecuted>=500,progress:Math.min(100,e.totalCommandsExecuted/500*100),rarity:"epic",category:"Efficiency"},{icon:"\u{1F446}",name:"Keystroke Hero",description:"Logged 500+ keystrokes",earned:e.totalKeystrokes>=500,progress:Math.min(100,e.totalKeystrokes/500*100),rarity:"common",category:"Efficiency"},{icon:"\u26A1",name:"Typing Wizard",description:"Logged 5000+ keystrokes",earned:e.totalKeystrokes>=5e3,progress:Math.min(100,e.totalKeystrokes/5e3*100),rarity:"rare",category:"Efficiency"},{icon:"\u{1F680}",name:"Keyboard Ninja",description:"Logged 15000+ keystrokes",earned:e.totalKeystrokes>=15e3,progress:Math.min(100,e.totalKeystrokes/15e3*100),rarity:"legendary",category:"Efficiency"},{icon:"\u{1F4C1}",name:"File Jumper",description:"40+ file switches",earned:e.fileSwitchCount>=40,progress:Math.min(100,e.fileSwitchCount/40*100),rarity:"common",category:"Navigation"},{icon:"\u{1F5C2}\uFE0F",name:"Project Explorer",description:"100+ file switches",earned:e.fileSwitchCount>=100,progress:Math.min(100,e.fileSwitchCount/100*100),rarity:"rare",category:"Navigation"},{icon:"\u{1F9ED}",name:"Code Navigator",description:"300+ file switches",earned:e.fileSwitchCount>=300,progress:Math.min(100,e.fileSwitchCount/300*100),rarity:"epic",category:"Navigation"},{icon:"\u{1F9D8}",name:"Deep Focus",description:"Focused session 2+ hours",earned:Math.max(...e.dailyCodingMinutes.map(d=>d.minutes))/60>=2,progress:Math.min(100,Math.max(...e.dailyCodingMinutes.map(d=>d.minutes))/60/2*100),rarity:"rare",category:"Focus"},{icon:"\u{1F3AF}",name:"Flow State",description:"Focused session 6+ hours",earned:Math.max(...e.dailyCodingMinutes.map(d=>d.minutes))/60>=6,progress:Math.min(100,Math.max(...e.dailyCodingMinutes.map(d=>d.minutes))/60/6*100),rarity:"legendary",category:"Focus"},{icon:"\u{1F396}\uFE0F",name:"First Steps",description:"Completed first coding session",earned:t>0,progress:t>0?100:0,rarity:"common",category:"Milestones"},{icon:"\u{1F3C5}",name:"Century Club",description:"100+ hours total",earned:t>=100,progress:Math.min(100,t/100*100),rarity:"legendary",category:"Milestones"},{icon:"\u{1F451}",name:"Elite Developer",description:"500+ hours total",earned:t>=500,progress:Math.min(100,t/500*100),rarity:"legendary",category:"Milestones"}],i={legendary:0,epic:1,rare:2,common:3};o.sort((d,u)=>d.earned!==u.earned?d.earned?-1:1:(i[d.rarity]||4)-(i[u.rarity]||4));let a=o.filter(d=>d.earned).length,c=o.reduce((d,u)=>(u.earned&&(d[u.rarity]=(d[u.rarity]||0)+1),d),{}),r=`
            <div class="badge-stats">
                <div class="stat-item">
                    <span class="stat-label">Earned:</span>
                    <span class="stat-value">${a}/${o.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Progress:</span>
                    <span class="stat-value">${Math.round(a/o.length*100)}%</span>
                </div>
                ${c.legendary?`<div class="stat-item legendary-stat">\u2B50 ${c.legendary} Legendary</div>`:""}
                ${c.epic?`<div class="stat-item epic-stat">\u{1F49C} ${c.epic} Epic</div>`:""}
            </div>
        `,f=o.map(d=>{let u=d.progress<100&&!d.earned?`<div class="badge-progress"><div class="badge-progress-bar" style="width: ${d.progress}%"></div></div>`:"",l=`rarity-${d.rarity}`,g=`<span class="category-badge">${d.category}</span>`;return`
                <div class="badge ${d.earned?"earned":""} ${l}" title="${d.category} \u2022 ${d.rarity}">
                    <div class="badge-icon">${d.icon}</div>
                    <div class="badge-name">${d.name}</div>
                    <div class="badge-desc">${d.description}</div>
                    ${g}
                    ${u}
                </div>
            `}).join("");return r+f}buildAiInsightsHtml(e){let t=[],n=[],o=[],i=[],a=[];e.suggestions&&e.suggestions.length>0&&e.suggestions.forEach(l=>{let g=l.toLowerCase();g.includes("\u{1F4A1}")||g.includes("code improvement")?t.push(l.replace(/💡\s*Code Improvement:\s*/i,"")):g.includes("\u26A1")||g.includes("performance")?n.push(l.replace(/⚡\s*Performance:\s*/i,"")):g.includes("\u26A0\uFE0F")||g.includes("warning")?o.push(l.replace(/⚠️\s*Warning:\s*/i,"")):g.includes("\u{1F527}")||g.includes("refactoring")?i.push(l.replace(/🔧\s*Refactoring:\s*/i,"")):g.includes("\u{1F3AF}")||g.includes("productivity")?a.push(l.replace(/🎯\s*Productivity:\s*/i,"")):a.push(l)});let c=this.analyzeProductivityPatterns(e),r=this.calculateFocusMetrics(e),f=this.analyzeWorkLifeBalance(e),d=this.calculateTrendIndicator(e),u="";if(e.tfInsights?.featureImportance){let l=Object.entries(e.tfInsights.featureImportance).sort((g,y)=>y[1]-g[1]).slice(0,3).map(([g,y])=>{let h=Math.round(y*100);return`
                        <div class="tf-feature">
                            <span class="tf-feature-name">${g}</span>
                            <div class="tf-feature-bar">
                                <div class="tf-feature-fill" style="width: ${h}%"></div>
                            </div>
                            <span class="tf-feature-weight">${h}%</span>
                        </div>
                    `}).join("");l&&(u=`
                    <div class="tf-highlights">
                        <h3 style="font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>\u{1F9E0}</span> Model Insights
                        </h3>
                        <div class="tf-feature-grid">
                            ${l}
                        </div>
                    </div>
                `)}return`
            <div class="ai-insights-container">
                <!-- Productivity Trend -->
                <div class="insight-section trend-section">
                    <div class="section-header">
                        <h3>\u{1F4CA} Productivity Trend</h3>
                <span class="trend-badge ${d.class}">${d.icon} ${d.text}</span>
                    </div>
                    <p class="section-description">${d.description}</p>
                </div>

                <!-- Focus Analysis -->
                <div class="insight-section focus-section">
                    <div class="section-header">
                        <h3>\u{1F3AF} Focus Analysis</h3>
                    </div>
                    <div class="focus-metrics">
                        <div class="focus-metric">
                            <span class="metric-label">Deep Work Sessions</span>
                            <span class="metric-value">${r.deepWorkSessions}</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${Math.min(100,r.deepWorkSessions*10)}%"></div>
                            </div>
                        </div>
                        <div class="focus-metric">
                            <span class="metric-label">Context Switches</span>
                            <span class="metric-value">${r.contextSwitches}</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${Math.min(100,r.contextSwitches/2)}%; background: ${r.contextSwitches>50?"#ef4444":"#10b981"}"></div>
                            </div>
                        </div>
                        <div class="focus-metric">
                            <span class="metric-label">Avg. Session Length</span>
                            <span class="metric-value">${r.avgSessionLength}min</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${Math.min(100,r.avgSessionLength)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Productivity Patterns -->
                <div class="insight-section patterns-section">
                    <div class="section-header">
                        <h3>\u23F0 Your Peak Coding Hours</h3>
                    </div>
                    <div class="patterns-grid">
                        <div class="pattern-card">
                            <span class="pattern-icon">\u{1F305}</span>
                            <div class="pattern-info">
                                <span class="pattern-label">Most Productive</span>
                                <span class="pattern-value">${c.peakHour}</span>
                            </div>
                        </div>
                        <div class="pattern-card">
                            <span class="pattern-icon">\u{1F3AF}</span>
                            <div class="pattern-info">
                                <span class="pattern-label">Focus Intensity</span>
                                <span class="pattern-value">${c.focusIntensity}</span>
                            </div>
                        </div>
                        <div class="pattern-card">
                            <span class="pattern-icon">\u26A1</span>
                            <div class="pattern-info">
                                <span class="pattern-label">Velocity</span>
                                <span class="pattern-value">${c.velocity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Work-Life Balance -->
                <div class="insight-section balance-section">
                    <div class="section-header">
                        <h3>\u2696\uFE0F Work-Life Balance</h3>
                        <span class="balance-score ${f.scoreClass}">${f.score}/10</span>
                    </div>
                    <p class="balance-message">${f.message}</p>
                    <div class="balance-indicators">
                        <div class="balance-indicator ${f.weekendActivity?"active":""}">
                            <span>\u{1F4C5}</span> Weekend Activity: ${f.weekendActivity?"Detected":"Balanced"}
                        </div>
                        <div class="balance-indicator ${f.lateNightCoding?"active":""}">
                            <span>\u{1F319}</span> Late Night Coding: ${f.lateNightCoding?"Frequent":"Minimal"}
                        </div>
                    </div>
                </div>

                <!-- AI-Powered Suggestions with Collapsible Categories -->
                <div class="insight-section ai-suggestions-section">
                    <div class="section-header">
                        <h3>\u{1F916} AI-Powered Insights</h3>
                        <span class="insights-count">${t.length+n.length+o.length+i.length+a.length} insights</span>
                    </div>
                    
                    <!-- Code Improvements -->
                    ${t.length>0?`
                    <details class="insight-category code-improvements" open>
                        <summary class="category-header">
                            <span class="category-icon">\u{1F4A1}</span>
                            <span class="category-title">Code Improvements</span>
                            <span class="category-count">${t.length}</span>
                            <span class="expand-icon">\u25BC</span>
                        </summary>
                        <div class="category-content">
                            <ul class="insight-list">
                                ${t.map((l,g)=>`
                                    <li class="insight-item fade-in" style="animation-delay: ${g*.1}s" data-suggestion="${l.replace(/"/g,"&quot;")}">
                                        <span class="item-number">${g+1}</span>
                                        <span class="item-text">${l}</span>
                                        <button class="delete-btn" title="Delete this suggestion">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    </details>
                    `:""}
                    
                    <!-- Performance Tips -->
                    ${n.length>0?`
                    <details class="insight-category performance-tips" open>
                        <summary class="category-header">
                            <span class="category-icon">\u26A1</span>
                            <span class="category-title">Performance Tips</span>
                            <span class="category-count">${n.length}</span>
                            <span class="expand-icon">\u25BC</span>
                        </summary>
                        <div class="category-content">
                            <ul class="insight-list">
                                ${n.map((l,g)=>`
                                    <li class="insight-item fade-in" style="animation-delay: ${g*.1}s" data-suggestion="${l.replace(/"/g,"&quot;")}">
                                        <span class="item-number">${g+1}</span>
                                        <span class="item-text">${l}</span>
                                        <button class="delete-btn" title="Delete this suggestion">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    </details>
                    `:""}
                    
                    <!-- Warnings -->
                    ${o.length>0?`
                    <details class="insight-category warnings" open>
                        <summary class="category-header">
                            <span class="category-icon">\u26A0\uFE0F</span>
                            <span class="category-title">Bad Practice Warnings</span>
                            <span class="category-count">${o.length}</span>
                            <span class="expand-icon">\u25BC</span>
                        </summary>
                        <div class="category-content">
                            <ul class="insight-list">
                                ${o.map((l,g)=>`
                                    <li class="insight-item fade-in" style="animation-delay: ${g*.1}s" data-suggestion="${l.replace(/"/g,"&quot;")}">
                                        <span class="item-number">${g+1}</span>
                                        <span class="item-text">${l}</span>
                                        <button class="delete-btn" title="Delete this suggestion">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    </details>
                    `:""}
                    
                    <!-- Refactoring Ideas -->
                    ${i.length>0?`
                    <details class="insight-category refactoring" open>
                        <summary class="category-header">
                            <span class="category-icon">\u{1F527}</span>
                            <span class="category-title">Refactoring Ideas</span>
                            <span class="category-count">${i.length}</span>
                            <span class="expand-icon">\u25BC</span>
                        </summary>
                        <div class="category-content">
                            <ul class="insight-list">
                                ${i.map((l,g)=>`
                                    <li class="insight-item fade-in" style="animation-delay: ${g*.1}s" data-suggestion="${l.replace(/"/g,"&quot;")}">
                                        <span class="item-number">${g+1}</span>
                                        <span class="item-text">${l}</span>
                                        <button class="delete-btn" title="Delete this suggestion">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    </details>
                    `:""}
                    
                    <!-- Productivity Hints -->
                    ${a.length>0?`
                    <details class="insight-category productivity" open>
                        <summary class="category-header">
                            <span class="category-icon">\u{1F3AF}</span>
                            <span class="category-title">Productivity Hints</span>
                            <span class="category-count">${a.length}</span>
                            <span class="expand-icon">\u25BC</span>
                        </summary>
                        <div class="category-content">
                            <ul class="insight-list">
                                ${a.map((l,g)=>`
                                    <li class="insight-item fade-in" style="animation-delay: ${g*.1}s" data-suggestion="${l.replace(/"/g,"&quot;")}">
                                        <span class="item-number">${g+1}</span>
                                        <span class="item-text">${l}</span>
                                        <button class="delete-btn" title="Delete this suggestion">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    </details>
                    `:""}
                    
                    ${t.length+n.length+o.length+i.length+a.length===0?`
                        <div class="no-insights">
                            <span class="no-insights-icon">\u{1F4A1}</span>
                            <p>Keep coding to unlock personalized AI suggestions!</p>
                            <small>Generate reports regularly to get actionable insights.</small>
                        </div>
                    `:""}
                </div>

                ${u}

                <!-- Quick Actions -->
                <div class="insight-section actions-section">
                    <div class="section-header">
                        <h3>\u26A1 Quick Actions</h3>
                    </div>
                    <div class="quick-actions">
                        <button class="action-btn" onclick="setFocusGoal()">
                            <span>\u{1F3AF}</span> Set Focus Goal
                        </button>
                        <button class="action-btn" onclick="scheduleBreak()">
                            <span>\u2615</span> Schedule Break
                        </button>
                        <button class="action-btn" onclick="exportInsights()">
                            <span>\u{1F4E4}</span> Export Insights
                        </button>
                    </div>
                </div>
            </div>
        `}categorizeSuggestions(e){return e.map(t=>{let n=t.toLowerCase();return n.includes("break")||n.includes("burnout")?"health":n.includes("shortcut")||n.includes("snippet")||n.includes("feature")?"efficiency":n.includes("file")||n.includes("workspace")?"workflow":n.includes("focus")||n.includes("concentration")?"focus":"general"})}getInsightIcon(e){return{health:"\u{1F49A}",efficiency:"\u26A1",workflow:"\u{1F527}",focus:"\u{1F3AF}",general:"\u{1F4A1}"}[e]||"\u{1F4A1}"}analyzeProductivityPatterns(e){let{activeHourRange:t,dailyCodingMinutes:n}=e,o=t.earliest||9,i=o<12?`${o}AM`:o===12?"12PM":`${o-12}PM`,a=e.streakDays>5?"High":e.streakDays>2?"Medium":"Building",r=(e.dailyCodingMinutes.length>0?e.totalActiveMinutes/e.dailyCodingMinutes.length/60:0)>0?Math.round(e.totalCommandsExecuted/(e.totalActiveMinutes/60)):0,f=r>30?"Fast":r>15?"Steady":"Deliberate";return{peakHour:i,focusIntensity:a,velocity:f}}calculateFocusMetrics(e){let t=e.dailyCodingMinutes.length>0?Math.round(e.totalActiveMinutes/e.dailyCodingMinutes.filter(i=>i.minutes>0).length):0,n=Math.floor(e.totalActiveMinutes/30),o=e.fileSwitchCount;return{deepWorkSessions:n,contextSwitches:o,avgSessionLength:t}}analyzeWorkLifeBalance(e){let{earliest:t,latest:n}=e.activeHourRange,o=n&&n>22||!1,i=t&&t<6||!1,c=e.dailyCodingMinutes.filter(l=>l.minutes>0).length>=7,r=10;o&&(r-=2),i&&(r-=1),c&&(r-=2),e.totalActiveMinutes/e.dailyCodingMinutes.length>600&&(r-=2),r=Math.max(1,Math.min(10,r));let f=r>=8?"excellent":r>=6?"good":"needs-attention",d=["Excellent balance! You're maintaining healthy coding habits.","Good balance. Consider taking regular breaks to optimize performance.","Your coding schedule shows intense commitment. Remember to rest and recharge!"],u=r>=8?d[0]:r>=6?d[1]:d[2];return{score:r,scoreClass:f,message:u,weekendActivity:c,lateNightCoding:o}}calculateTrendIndicator(e){let t=e.dailyCodingMinutes.slice(-3),n=e.dailyCodingMinutes.slice(0,3);if(t.length===0||n.length===0)return{icon:"\u27A1\uFE0F",text:"Stable",class:"neutral",description:"Keep up the consistent coding rhythm!"};let o=t.reduce((r,f)=>r+f.minutes,0)/t.length,i=n.reduce((r,f)=>r+f.minutes,0)/n.length,a=o-i,c=i>0?Math.abs(a/i*100):0;return c<10?{icon:"\u27A1\uFE0F",text:"Stable",class:"neutral",description:"Your coding time is consistent. Great job maintaining balance!"}:a>0?{icon:"\u{1F4C8}",text:`+${Math.round(c)}%`,class:"positive",description:"Your coding activity is trending upward. You're in the zone!"}:{icon:"\u{1F4C9}",text:`-${Math.round(c)}%`,class:"negative",description:"Your coding time has decreased. This might be a good time to refocus or take a well-deserved break."}}buildPremiumFeaturesHtml(){return[{icon:"\u{1F9E0}",title:"Adaptive Focus Coach",description:"Get in-IDE nudges tailored to your current energy and momentum."},{icon:"\u{1F4C8}",title:"Trend Radar",description:"See multi-week performance trends with predictive AI forecasting."},{icon:"\u{1F91D}",title:"Team Pulse",description:"Share anonymized benchmarks and celebrate wins with your crew."},{icon:"\u{1F514}",title:"Smart Nudges",description:"Receive reminders when goals slip or streaks are at risk."},{icon:"\u{1F3AF}",title:"Deep Work Sessions",description:"Track and optimize focused coding blocks with distraction-free timers and analytics."},{icon:"\u{1F319}",title:"Circadian Insights",description:"Discover your peak productivity hours with biological rhythm analysis."},{icon:"\u{1F4CA}",title:"Advanced Analytics Dashboard",description:"Export detailed reports, custom date ranges, and compare periods side-by-side."},{icon:"\u{1F3A8}",title:"Code Quality Metrics",description:"Track refactoring patterns, code complexity trends, and quality improvements over time."},{icon:"\u26A1",title:"Productivity Automation",description:"Auto-schedule breaks, suggest optimal work blocks, and create custom workflows."},{icon:"\u{1F3C5}",title:"Premium Achievements",description:"Unlock exclusive badges, milestones, and customizable goal tracking systems."},{icon:"\u{1F4A1}",title:"AI Code Suggestions",description:"Get personalized recommendations for improving your coding patterns and efficiency."},{icon:"\u{1F4F1}",title:"Multi-Device Sync",description:"Seamlessly sync your progress across all your devices and workstations."},{icon:"\u{1F510}",title:"Priority Support",description:"Get faster response times and dedicated assistance from our expert team."},{icon:"\u{1F393}",title:"Learning Path Insights",description:"Track skill development, language proficiency growth, and personalized learning recommendations."},{icon:"\u{1F504}",title:"Habit Formation Tools",description:"Build better coding habits with streak protection, habit stacking, and behavioral insights."},{icon:"\u{1F31F}",title:"Custom Themes & Branding",description:"Personalize your dashboard with custom colors, layouts, and visual preferences."}].map(t=>`
            <div class="premium-feature">
                <div class="premium-icon">${t.icon}</div>
                <div class="premium-copy">
                    <h3>${t.title}</h3>
                    <p>${t.description}</p>
                </div>
            </div>
        `).join("")}dispose(){for(this._panel?.dispose(),this._panel=void 0;this._disposables.length;){let e=this._disposables.pop();e&&e.dispose()}}};function yt(){let s="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let t=0;t<32;t++)s+=e.charAt(Math.floor(Math.random()*e.length));return s}var Te=E(require("vscode")),ee=E(require("path")),D=E(require("fs")),te=class{context;progress;badges=[{id:"first-commands",name:"Getting Started",description:"Execute your first 10 commands",icon:"\u{1F680}",condition:e=>e.filter(t=>t.command).length>=10},{id:"polyglot",name:"Polyglot",description:"Work with 3+ programming languages",icon:"\u{1F310}",condition:e=>new Set(e.filter(n=>n.language).map(n=>n.language)).size>=3},{id:"night-owl",name:"Night Owl",description:"Code after 10 PM for 3 days",icon:"\u{1F989}",condition:e=>{let t=new Set;return e.forEach(n=>{let o=new Date(n.timestamp).getHours();if(o>=22||o<=6){let i=new Date(n.timestamp).getDate();t.add(i)}}),t.size>=3}},{id:"early-bird",name:"Early Bird",description:"Code before 7 AM for 3 days",icon:"\u{1F426}",condition:e=>{let t=new Set;return e.forEach(n=>{let o=new Date(n.timestamp).getHours();if(o>=5&&o<=7){let i=new Date(n.timestamp).getDate();t.add(i)}}),t.size>=3}},{id:"persistence",name:"Persistence",description:"Code for 7 consecutive days",icon:"\u{1F525}",condition:e=>{if(e.length===0)return!1;let t=[...e].sort((c,r)=>c.timestamp-r.timestamp),n=new Set;t.forEach(c=>{let r=Math.floor(c.timestamp/864e5);n.add(r)});let o=Array.from(n).sort((c,r)=>c-r),i=1,a=1;for(let c=1;c<o.length;c++)o[c]===o[c-1]+1?(i++,a=Math.max(a,i)):i=1;return a>=7}},{id:"command-master",name:"Command Master",description:"Use 20 different commands",icon:"\u2328",condition:e=>new Set(e.filter(n=>n.command).map(n=>n.command)).size>=20},{id:"keystroke-hero",name:"Keystroke Hero",description:"Type 10,000 keystrokes in a week",icon:"\u{1F446}",condition:e=>e.filter(n=>n.keystrokes).reduce((n,o)=>n+(o.keystrokes||0),0)>=1e4},{id:"file-jumper",name:"File Jumper",description:"Work with 10 different files in a day",icon:"\u{1F4C1}",condition:e=>{let t={};return e.forEach(n=>{if(n.file){let o=Math.floor(n.timestamp/864e5);t[o]||(t[o]=new Set),t[o].add(n.file)}}),Object.values(t).some(n=>n.size>=10)}}];constructor(e){this.context=e,this.progress=this.loadProgress()}loadProgress(){let e=this.context.globalStorageUri.fsPath,t=ee.join(e,"progress.json");return D.existsSync(e)||D.mkdirSync(e,{recursive:!0}),D.existsSync(t)?JSON.parse(D.readFileSync(t,"utf8")):{badges:[],points:0,level:1}}saveProgress(){let e=this.context.globalStorageUri.fsPath,t=ee.join(e,"progress.json");D.writeFileSync(t,JSON.stringify(this.progress))}checkForNewBadges(e){let t=[];for(let n of this.badges)!this.progress.badges.includes(n.id)&&n.condition(e)&&(this.progress.badges.push(n.id),t.push(n),this.progress.points+=100,Te.window.showInformationMessage(`\u{1F3C6} New badge earned: ${n.name}!`));return this.progress.level=Math.floor(this.progress.points/500)+1,t.length>0&&this.saveProgress(),t}getEarnedBadges(){return this.badges.filter(e=>this.progress.badges.includes(e.id))}getAllBadges(){return this.badges}getUserProgress(){return{...this.progress}}getActivitiesForLastWeek(){let e=[],t=new Date;for(let n=0;n<7;n++){let o=new Date(t);o.setDate(o.getDate()-n);let i=o.toISOString().split("T")[0],a=this.getActivitiesForDate(i);e.push(...a)}return e}getActivitiesForDate(e){let t=this.context.globalStorageUri.fsPath,n=ee.join(t,`activity-${e}.json`);return D.existsSync(n)?JSON.parse(D.readFileSync(n,"utf8")):[]}};var S=E(require("vscode")),De=E(require("http")),Le=E(require("fs")),$e=E(require("path")),oe=class{context;apiEndpoint="https://api.codeflow.example";isEnabled=!1;localServer;serverPort=3e3;constructor(e){this.context=e;let t=S.workspace.getConfiguration("codeflow");this.isEnabled=t.get("cloudSync",!1)}async syncData(e,t){if(!this.isEnabled)return!1;try{let o={userId:await this.getUserId(),timestamp:Date.now(),insight:e,progress:t},i=await fetch(`${this.apiEndpoint}/sync`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${await this.getAuthToken()}`},body:JSON.stringify(o)});return i.ok?(console.log("Data synced successfully"),!0):(console.error("Failed to sync data:",i.statusText),!1)}catch(n){return console.error("Error syncing data:",n),!1}}async getTeamInsights(e){if(!this.isEnabled)throw new Error("Cloud sync is disabled");try{let t=await fetch(`${this.apiEndpoint}/teams/${e}/insights`,{method:"GET",headers:{Authorization:`Bearer ${await this.getAuthToken()}`}});if(t.ok)return await t.json();throw new Error(`Failed to get team insights: ${t.statusText}`)}catch(t){throw console.error("Error getting team insights:",t),t}}async getUserId(){let e=this.context.globalState,t=e.get("codeflow-userId");return t||(t="user-"+Math.random().toString(36).substr(2,9),await e.update("codeflow-userId",t)),t}async getAuthToken(){let e=this.context.globalState,t=e.get("codeflow-authToken");return t||(S.window.showInformationMessage("Cloud sync requires authentication. This is a placeholder."),t="placeholder-token",await e.update("codeflow-authToken",t)),t}async authenticate(){return await S.window.showInformationMessage("This would open a browser for authentication in a real implementation",{modal:!0},"OK"),await S.workspace.getConfiguration("codeflow").update("cloudSync",!0,S.ConfigurationTarget.Global),this.isEnabled=!0,!0}},se=class{context;authService;constructor(e){this.context=e,this.authService=new ce(e)}getAuthService(){return this.authService}stopLocalServer(){this.authService.stopLocalServer()}dispose(){this.stopLocalServer()}},ce=class{context;localServer;serverPort=3e3;constructor(e){this.context=e}async logout(){try{await this.context.globalState.update("codeflow-authToken",void 0),await this.context.globalState.update("codeflow-userId",void 0),await S.workspace.getConfiguration("codeflow").update("cloudSync",!1,S.ConfigurationTarget.Global),S.window.showInformationMessage("Successfully logged out from CodeFlow")}catch(e){S.window.showErrorMessage(`Logout failed: ${e}`)}}async upgradeToPro(){try{await this.startLocalServer();let e=S.Uri.parse(`http://localhost:${this.serverPort}/pro-plan`);await S.env.openExternal(e),S.window.showInformationMessage("Opening CodeFlow Pro plan in your browser...")}catch(e){S.window.showErrorMessage(`Failed to open browser: ${e}`),console.error("Upgrade error:",e)}}async startLocalServer(){if(!(this.localServer&&this.localServer.listening))return new Promise((e,t)=>{try{this.localServer=De.createServer((n,o)=>{if(console.log(`Request received: ${n.url}`),o.setHeader("Access-Control-Allow-Origin","*"),o.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS"),o.setHeader("Access-Control-Allow-Headers","Content-Type"),n.url==="/pro-plan"||n.url==="/"){let i=$e.join(this.context.extensionPath,"media","pro-plan.html");Le.readFile(i,"utf8",(a,c)=>{if(a){console.error("Error reading HTML file:",a),o.writeHead(500,{"Content-Type":"text/plain"}),o.end("Error loading page");return}o.writeHead(200,{"Content-Type":"text/html"}),o.end(c)})}else o.writeHead(404,{"Content-Type":"text/plain"}),o.end("Not Found")}),this.localServer.listen(this.serverPort,()=>{console.log(`Local server started on port ${this.serverPort}`),e()}),this.localServer.on("error",n=>{n.code==="EADDRINUSE"?(this.serverPort++,this.localServer=void 0,this.startLocalServer().then(e).catch(t)):(console.error("Server error:",n),t(n))})}catch(n){console.error("Error starting server:",n),t(n)}})}stopLocalServer(){this.localServer&&(this.localServer.close(()=>{console.log("Local server stopped")}),this.localServer=void 0)}};var Re=require("child_process"),N=E(require("path")),le;function vt(s){console.log("CodeFlow AI is now active");let e=new q(s),t=new Z(s),n=new Q(s),o=new te(s),i=new oe(s),a=new se(s);le=a,n.setRefreshCallback(async()=>{try{let h=await t.analyzeData(7),b=o.getActivitiesForLastWeek();o.checkForNewBadges(b),n.show(h);let m=o.getUserProgress();i.syncData(h,m)}catch(h){p.window.showErrorMessage(`Error refreshing report: ${h}`)}});let c=p.commands.registerCommand("codeflow.showReport",async()=>{try{let h=await t.analyzeData(7),b=o.getActivitiesForLastWeek();o.checkForNewBadges(b),n.show(h);let m=o.getUserProgress();i.syncData(h,m)}catch(h){p.window.showErrorMessage(`Error generating report: ${h}`)}}),r=p.commands.registerCommand("codeflow.trainTFModel",async()=>{try{let h=N.join(s.extensionPath,"ml","tfjs"),b=N.join(h,"train.js");if(!require("fs").existsSync(b)){p.window.showErrorMessage(`Training script not found at: ${b}`);return}await p.window.withProgress({location:p.ProgressLocation.Notification,title:"Training TensorFlow.js Model",cancellable:!1},async v=>{v.report({message:"Starting training process..."});let P=await wt(b,[]);v.report({message:"Training completed successfully!"}),await p.workspace.getConfiguration("codeflow").update("useTFModel",!0,p.ConfigurationTarget.Global),console.log("Training output:",P),p.window.showInformationMessage("TensorFlow.js model trained and enabled successfully!")})}catch(h){console.error("Training error:",h),p.window.showErrorMessage(`Error training TensorFlow.js model: ${h}`)}}),f=p.commands.registerCommand("codeflow.testGeminiConnection",async()=>{try{let h=new _;await p.window.withProgress({location:p.ProgressLocation.Notification,title:"Testing Gemini AI Connection",cancellable:!1},async b=>{b.report({message:"Connecting to Gemini API..."});let m=await h.testConnection();if(m.success)p.window.showInformationMessage(`\u2705 ${m.message}`,"View Settings").then(v=>{v==="View Settings"&&p.commands.executeCommand("workbench.action.openSettings","codeflow")});else{let v=await p.window.showErrorMessage(`\u274C ${m.message}`,"Open Settings","Get API Key");v==="Open Settings"?p.commands.executeCommand("workbench.action.openSettings","codeflow.gemini"):v==="Get API Key"&&p.env.openExternal(p.Uri.parse("https://makersuite.google.com/app/apikey"))}})}catch(h){console.error("Gemini test error:",h),p.window.showErrorMessage(`Error testing Gemini connection: ${h}`)}}),d=p.commands.registerCommand("codeflow.upgradeToPro",async()=>{try{let h=p.window.createWebviewPanel("codeflowProPlan","CodeFlow Pro Plan",p.ViewColumn.One,{enableScripts:!0,localResourceRoots:[p.Uri.joinPath(s.extensionUri,"media"),p.Uri.joinPath(s.extensionUri,"icon")]});h.iconPath=p.Uri.joinPath(s.extensionUri,"icon","2.png");let b=require("fs"),m=N.join(s.extensionPath,"media","pro-plan.html"),v=b.readFileSync(m,"utf8"),P=h.webview.asWebviewUri(p.Uri.joinPath(s.extensionUri,"icon","2.png"));v=v.replace(/src="\.\.\/icon\/2\.png"/g,`src="${P}"`),h.webview.html=v}catch(h){console.error("Error opening Pro Plan:",h),p.window.showErrorMessage(`Error opening Pro Plan: ${h}`)}}),u=p.commands.registerCommand("codeflow.resetExtension",async()=>{if(await p.window.showWarningMessage("This will reset CodeFlow to a fresh state, deleting all tracked data, badges, and settings. This cannot be undone. Continue?",{modal:!0},"Reset Extension","Cancel")==="Reset Extension")try{await p.window.withProgress({location:p.ProgressLocation.Notification,title:"Resetting CodeFlow Extension",cancellable:!1},async m=>{m.report({message:"Clearing stored data..."});let v=s.globalState.keys();for(let C of v)await s.globalState.update(C,void 0);let P=require("fs"),w=s.globalStorageUri.fsPath;if(P.existsSync(w)){let C=P.readdirSync(w);for(let A of C){let k=N.join(w,A);try{P.unlinkSync(k)}catch(Oe){console.error(`Error deleting file ${k}:`,Oe)}}}m.report({message:"Reset complete!"})}),await p.window.showInformationMessage("CodeFlow has been reset successfully. Reload VS Code to complete the reset.","Reload Now","Later")==="Reload Now"&&await p.commands.executeCommand("workbench.action.reloadWindow")}catch(b){console.error("Error resetting extension:",b),p.window.showErrorMessage(`Error resetting extension: ${b}`)}}),l=p.window.createStatusBarItem(p.StatusBarAlignment.Right,100);l.text="$(rocket) CodeFlow",l.tooltip="CodeFlow AI - Click to view weekly report",l.command="codeflow.showReport",l.color=new p.ThemeColor("statusBarItem.prominentForeground"),l.backgroundColor=new p.ThemeColor("statusBarItem.prominentBackground"),l.show();let g=()=>{p.workspace.getConfiguration("codeflow").get("enabled",!0)?(l.text="$(rocket) CodeFlow",l.color=new p.ThemeColor("statusBarItem.prominentForeground"),l.backgroundColor=new p.ThemeColor("statusBarItem.prominentBackground")):(l.text="$(circle-slash) CodeFlow",l.color=new p.ThemeColor("statusBarItem.warningForeground"),l.backgroundColor=new p.ThemeColor("statusBarItem.warningBackground"))};g();let y=p.workspace.onDidChangeConfiguration(h=>{h.affectsConfiguration("codeflow.enabled")&&g()});s.subscriptions.push(e,a,c,r,f,d,u,l,y),setInterval(()=>{let h=o.getActivitiesForLastWeek();o.checkForNewBadges(h)},6e4*60)}function wt(s,e){return new Promise((t,n)=>{let o=(0,Re.spawn)("node",[s,...e],{cwd:N.dirname(s),shell:!0}),i="",a="";o.stdout.on("data",c=>{let r=c.toString();i+=r,console.log("Training:",r.trim())}),o.stderr.on("data",c=>{let r=c.toString();a+=r,console.error("Training error:",r.trim())}),o.on("close",c=>{c!==0?n(new Error(`Script exited with code ${c}: ${a}`)):t(i)}),o.on("error",c=>{n(c)})})}function bt(){console.log("CodeFlow AI is now deactivated"),le&&le.stopLocalServer()}0&&(module.exports={activate,deactivate});
/*! Bundled license information:

@google/generative-ai/dist/index.mjs:
@google/generative-ai/dist/index.mjs:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
