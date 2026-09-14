import{t as e}from"./objectSpread2-D4cznNc1.js";import{At as t,D as n,E as r,K as i,O as a,X as o,_t as s,b as c,ot as l,x as u}from"./vue.runtime.esm-bundler-CB5M7m0T.js";import{t as d}from"./Vditor-BMc-ri9M.js";var f={class:`card-header`},p={class:`font-medium`},m={class:`mb-2!`},h={class:`text-red-500`},g=a(e(e({},{name:`Markdown`}),{},{__name:`index`,setup(e){let a=s(`
\`\`\`ts
function sayHello(): void {
	console.log("Hello, World!");
}
sayHello();
\`\`\`
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
`);return(e,s)=>{let g=o(`el-link`),_=o(`el-card`);return i(),u(_,{shadow:`never`},{header:l(()=>[c(`div`,f,[c(`span`,p,[s[2]||(s[2]=r(` Markdown组件，采用开源的 `,-1)),n(g,{href:`https://b3log.org/vditor/`,target:`_blank`,style:{margin:`0 4px 5px`,"font-size":`16px`}},{default:l(()=>[...s[1]||(s[1]=[r(` Vditor `,-1)])]),_:1})])]),n(g,{class:`mt-2`,href:`https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/markdown`,target:`_blank`},{default:l(()=>[...s[3]||(s[3]=[r(` 代码位置 src/views/markdown `,-1)])]),_:1})]),default:l(()=>[c(`h1`,m,[s[4]||(s[4]=r(` 双向绑定：`,-1)),c(`span`,h,t(a.value),1)]),n(d,{modelValue:a.value,"onUpdate:modelValue":s[0]||(s[0]=e=>a.value=e),options:{height:560,outline:{enable:!0,position:`right`}}},null,8,[`modelValue`])]),_:1})}}}));export{g as default};