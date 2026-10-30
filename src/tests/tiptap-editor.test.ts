import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { toWordPressCompatibleHtml, parseWordPressHtml, createEditorAdapterContract } from '../editor/tiptap';
import { sanitizeCellHtml } from '../editor/sanitize';
import { excelManifestXml } from '../excel/taskpane';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = dom;

Object.defineProperty(globalThis, 'window', { value: window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true });

const adapter = createEditorAdapterContract('<p>Hello <b>world</b></p><script>alert(1)</script>');

test('sanitizeCellHtml strips unsafe elements and keeps allowed tags', () => {
  const value = '<p>Hello <script>alert(1)</script> <b>world</b> <a href="https://example.com">link</a></p>';
  const sanitized = sanitizeCellHtml(value, window as unknown as Window);
  assert.equal(sanitized.includes('script'), false);
  assert.match(sanitized, /<b>world<\/b>/);
  assert.match(sanitized, /<a href="https:\/\/example\.com">link<\/a>/);
});

test('toWordPressCompatibleHtml normalizes editor HTML to WordPress-friendly tags', () => {
  const html = '<strong>Hello</strong> <em>world</em><script>alert(1)</script>';
  const normalized = toWordPressCompatibleHtml(html, window as unknown as Window);
  assert.equal(normalized.includes('script'), false);
  assert.match(normalized, /<b>Hello<\/b>/);
  assert.match(normalized, /<i>world<\/i>/);
});

test('parseWordPressHtml can load WordPress HTML back into editor format', () => {
  const html = '<p><b>Bold</b> and <i>italic</i></p>';
  const normalized = parseWordPressHtml(html, window as unknown as Window);
  assert.match(normalized, /<strong>Bold<\/strong>/);
  assert.match(normalized, /<em>italic<\/em>/);
});

test('editor adapter exposes contract for host integration', () => {
  assert.equal(adapter.getValue(), '<p>Hello <b>world</b></p><script>alert(1)</script>');
  adapter.setValue('<p>Updated</p>');
  assert.equal(adapter.getValue(), '<p>Updated</p>');
});

test('excel manifest includes a cell context menu extension point', () => {
  assert.match(excelManifestXml, /ContextMenuTheCell/);
  assert.match(excelManifestXml, /Edit as Rich Text/);
});
