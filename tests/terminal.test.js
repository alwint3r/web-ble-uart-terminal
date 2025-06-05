import { test, expect } from 'bun:test';
import { JSDOM } from 'jsdom';
import { Terminal } from '../terminal.js';

test('Terminal clear removes logs and DOM nodes', () => {
  const dom = new JSDOM("<!DOCTYPE html><div id='terminal'></div>");
  global.document = dom.window.document;
  const terminalElement = dom.window.document.getElementById('terminal');
  const terminal = new Terminal(terminalElement);

  terminal.print('hello');
  terminal.print('world', 'error');
  expect(terminal.logs.length).toBe(2);
  expect(terminalElement.children.length).toBe(2);

  terminal.clear();

  expect(terminal.logs.length).toBe(0);
  expect(terminalElement.innerHTML).toBe('');
});
