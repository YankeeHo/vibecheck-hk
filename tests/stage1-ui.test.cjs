/* eslint-disable @typescript-eslint/no-require-imports -- This isolated CommonJS test compiles TSX through a require hook. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
// Compile only local TS components for server-render assertions; no browser or app mutation.
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText, file);
};
require.extensions['.css'] = module => { module.exports = {}; };
const Component = require('../app/learn/LearningPhases.tsx').default;
const {initialState, createCards} = require('../app/learn/game.ts');
const deck = require('../app/data/proverbs.json').slice(0,8);
const base = {...initialState, deck, cards:createCards(deck), selectedId:deck[0].proverbId};
function render(overrides) {
 return renderToStaticMarkup(React.createElement(Component, {
  state:{...base,...overrides}, dispatch:()=>{},play:()=>{},muted:false,audioError:'',selectedId:deck[0].proverbId,
  select:()=>{},handoff:()=>{},message:'',
 }));
}
test('Phase B renders scene and all three choices, no handoff or answer explanation',()=>{
 const html=render({phase:'question'});
 assert.ok(html.includes('Phase B 情境填空')); assert.ok(html.includes(deck[0].scene));
 for (const p of deck.slice(0,3))assert.ok(html.includes(p.title));
 assert.ok(!html.includes('帶住金句去 Stage 2')); assert.ok(!html.includes(deck[0].explanation));
});
test('wrong-answer feedback shows canonical explanation and next step',()=>{
 const html=render({phase:'feedback',answers:[{proverbId:deck[0].proverbId,selectedId:deck[1].proverbId,correct:false}]});
 assert.ok(html.includes('差少少'));assert.ok(html.includes(deck[0].explanation));assert.ok(html.includes('下一題'));
});
test('Phase C renders tone, homophone and audio controls independently',()=>{
 const html=render({phase:'phonetics'});
 for(const content of ['Phase C 音韻解鎖',deck[0].jyutping,deck[0].toneTip,deck[0].trap,'播放完整粵語']) assert.ok(html.includes(content));
 assert.ok(!html.includes('帶住金句去 Stage 2'));
});
test('only completed flow offers Stage 2 and proverb selection',()=>{
 const html=render({phase:'complete',xp:100,reviewed:3,answers:deck.slice(0,3).map(p=>({proverbId:p.proverbId,selectedId:p.proverbId,correct:true}))});
 assert.ok(html.includes('帶住金句去 Stage 2')); assert.ok(html.includes('<select'));assert.ok(html.includes('A ＋ B ＋ C'));
});
