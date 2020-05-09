import view from 'think-view';
import cache from 'think-cache';
import session from 'think-session';
const model = require('think-model');
import { think } from 'thinkjs';
const fetch = require('think-fetch');
const websocket = require('think-websocket');
export = [
  fetch,
  view,
  // websocket(think.app),
  model(think.app), // 让框架支持模型的功能
  cache,
  session
];
