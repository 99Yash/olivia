import DOMPurify from 'isomorphic-dompurify';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { FormattingState } from './types';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'strong', 'b', 'em', 'i', 's', 'strike', 'del', 'u',
    'code', 'pre', 'ul', 'ol', 'li', 'span', 'p', 'div', 'br',
  ],
  ALLOWED_ATTR: ['class', 'style'],
};

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
}

type FormatType = 'bold' | 'italic' | 'strikethrough';

export function useRichTextEditor(
  initialContent = '',
  onChange?: (content: string) => void,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [formattingState, setFormattingState] = useState<FormattingState>({
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    orderedList: false,
    unorderedList: false,
  });

  const removeFormattingOnNextInput = useRef<Set<FormatType>>(new Set());

  const findFormattedAncestor = useCallback(
    (node: Node, editor: HTMLElement, formatType: FormatType): HTMLElement | null => {
      let current: Node | null = node;
      if (current.nodeType === Node.TEXT_NODE) current = current.parentNode;

      while (current && current !== editor && current instanceof HTMLElement) {
        const tagName = current.tagName.toLowerCase();

        if (formatType === 'bold') {
          if (tagName === 'strong' || tagName === 'b' ||
              current.classList.contains('font-semibold') ||
              (tagName === 'span' && parseInt(current.style.fontWeight || '0') >= 600))
            return current;
        }
        if (formatType === 'italic') {
          if (tagName === 'em' || tagName === 'i' ||
              current.classList.contains('italic') ||
              (tagName === 'span' && current.style.fontStyle === 'italic'))
            return current;
        }
        if (formatType === 'strikethrough') {
          if (tagName === 's' || tagName === 'strike' || tagName === 'del' ||
              current.classList.contains('line-through') ||
              (tagName === 'span' && current.style.textDecorationLine?.includes('line-through')))
            return current;
        }
        current = current.parentElement;
      }
      return null;
    }, []
  );

  const isInsideFormatting = useCallback(
    (formatType: FormatType): boolean => {
      const selection = window.getSelection();
      const editor = editorRef.current;
      if (!selection || selection.rangeCount === 0 || !editor) return false;
      return findFormattedAncestor(selection.getRangeAt(0).startContainer, editor, formatType) !== null;
    }, [findFormattedAncestor]
  );

  const updateFormattingState = useCallback(() => {
    const selection = window.getSelection();
    const editor = editorRef.current;

    if (!editor || !selection || selection.rangeCount === 0) {
      const s: FormattingState = { bold: false, italic: false, strikethrough: false, underline: false, code: false, orderedList: false, unorderedList: false };
      setFormattingState(s);
      return;
    }

    const showBold = removeFormattingOnNextInput.current.has('bold') ? false : isInsideFormatting('bold');
    const showItalic = removeFormattingOnNextInput.current.has('italic') ? false : isInsideFormatting('italic');
    const showStrikethrough = removeFormattingOnNextInput.current.has('strikethrough') ? false : isInsideFormatting('strikethrough');

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    if (element.nodeType === Node.TEXT_NODE) element = element.parentElement || element;

    let isCode = false, isOrderedList = false, isUnorderedList = false, hasUnderline = false;
    let current: HTMLElement | null = element instanceof HTMLElement ? element : null;
    while (current && current !== editor) {
      const tag = current.tagName.toLowerCase();
      if (tag === 'code' || tag === 'pre') isCode = true;
      if (tag === 'ol') isOrderedList = true;
      if (tag === 'ul') isUnorderedList = true;
      if (tag === 'li') {
        if (current.parentElement?.tagName === 'OL') isOrderedList = true;
        if (current.parentElement?.tagName === 'UL') isUnorderedList = true;
      }
      current = current.parentElement;
    }
    if (element instanceof HTMLElement)
      hasUnderline = window.getComputedStyle(element).textDecorationLine.includes('underline');

    setFormattingState({
      bold: showBold, italic: showItalic, strikethrough: showStrikethrough,
      underline: hasUnderline, code: isCode, orderedList: isOrderedList, unorderedList: isUnorderedList,
    });
  }, [isInsideFormatting]);

  const applyFormatting = useCallback((formatType: FormatType) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const className = formatType === 'bold' ? 'font-semibold' : formatType === 'italic' ? 'italic' : 'line-through';
    const span = document.createElement('span');
    span.className = className;

    if (range.collapsed) {
      span.innerHTML = '&#8203;';
      range.insertNode(span);
      range.setStart(span, 0);
      range.setEnd(span, 1);
    } else {
      try { range.surroundContents(span); }
      catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
      }
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const removeFormattingFromElement = useCallback((element: HTMLElement) => {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) parent.insertBefore(element.firstChild, element);
    parent.removeChild(element);
    parent.normalize();
  }, []);

  const splitAndExitFormatting = useCallback(
    (element: HTMLElement, formatType: FormatType) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return;
      const parent = element.parentNode;
      if (!parent) return;

      const cursorNode = range.startContainer;
      const cursorOffset = range.startOffset;
      const beforeRange = document.createRange();
      beforeRange.setStart(element, 0);
      beforeRange.setEnd(cursorNode, cursorOffset);
      const afterRange = document.createRange();
      afterRange.setStart(cursorNode, cursorOffset);
      afterRange.setEnd(element, element.childNodes.length);

      const beforeContent = beforeRange.extractContents();
      const afterContent = afterRange.extractContents();
      const className = element.className;

      const beforeText = beforeContent.textContent?.replace(/\u200B/g, '');
      if (beforeText) {
        const beforeElement = document.createElement('span');
        beforeElement.className = className;
        beforeElement.appendChild(beforeContent);
        parent.insertBefore(beforeElement, element);
      }

      const plainTextNode = document.createTextNode('\u200B');
      parent.insertBefore(plainTextNode, element);

      const afterText = afterContent.textContent?.replace(/\u200B/g, '');
      if (afterText) {
        const afterElement = document.createElement('span');
        afterElement.className = className;
        afterElement.appendChild(afterContent);
        parent.insertBefore(afterElement, element);
      }

      parent.removeChild(element);
      const newRange = document.createRange();
      newRange.setStart(plainTextNode, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      removeFormattingOnNextInput.current.add(formatType);
    }, []
  );

  const toggleFormat = useCallback(
    (formatType: FormatType) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const formattedElement = findFormattedAncestor(range.startContainer, editor, formatType);

      if (formattedElement) {
        if (range.collapsed) splitAndExitFormatting(formattedElement, formatType);
        else {
          removeFormattingFromElement(formattedElement);
          removeFormattingOnNextInput.current.delete(formatType);
        }
      } else {
        removeFormattingOnNextInput.current.delete(formatType);
        applyFormatting(formatType);
      }
      updateFormattingState();
    },
    [findFormattedAncestor, splitAndExitFormatting, removeFormattingFromElement, applyFormatting, updateFormattingState]
  );

  const toggleBold = useCallback(() => toggleFormat('bold'), [toggleFormat]);
  const toggleItalic = useCallback(() => toggleFormat('italic'), [toggleFormat]);
  const toggleStrikethrough = useCallback(() => toggleFormat('strikethrough'), [toggleFormat]);

  useHotkeys('mod+b', (e) => { e.preventDefault(); toggleBold(); }, { enableOnContentEditable: true }, [toggleBold]);
  useHotkeys('mod+i', (e) => { e.preventDefault(); toggleItalic(); }, { enableOnContentEditable: true }, [toggleItalic]);

  const formatText = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);

      switch (command) {
        case 'bold': toggleBold(); break;
        case 'italic': toggleItalic(); break;
        case 'strikethrough': toggleStrikethrough(); break;
        case 'insertOrderedList': {
          const ol = document.createElement('ol');
          const li = document.createElement('li');
          li.innerHTML = range.collapsed ? '&#8203;' : '';
          if (!range.collapsed) li.appendChild(range.extractContents());
          ol.appendChild(li);
          range.insertNode(ol);
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          break;
        }
        case 'insertUnorderedList': {
          const ul = document.createElement('ul');
          const li = document.createElement('li');
          li.innerHTML = range.collapsed ? '&#8203;' : '';
          if (!range.collapsed) li.appendChild(range.extractContents());
          ul.appendChild(li);
          range.insertNode(ul);
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          break;
        }
        case 'insertText': {
          if (!value) break;
          const textNode = document.createTextNode(value);
          if (!range.collapsed) range.deleteContents();
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          break;
        }
        case 'insertHTML': {
          if (!value) break;
          const sanitized = sanitizeHtml(value);
          const temp = document.createElement('div');
          temp.innerHTML = sanitized;
          const nodes: Node[] = Array.from(temp.childNodes);
          if (!range.collapsed) range.deleteContents();
          nodes.forEach((node, i) => {
            if (i === 0) range.insertNode(node);
            else {
              const r = document.createRange();
              r.setStartAfter(nodes[i - 1]);
              r.collapse(true);
              r.insertNode(node);
            }
          });
          if (nodes.length > 0) {
            range.setStartAfter(nodes[nodes.length - 1]);
            range.collapse(true);
          }
          selection.removeAllRanges();
          selection.addRange(range);
          break;
        }
      }
    },
    [toggleBold, toggleItalic, toggleStrikethrough]
  );

  const toggleOrderedList = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor) return;

    let listItem: Node | null = range.commonAncestorContainer;
    while (listItem && listItem.nodeType !== Node.ELEMENT_NODE) listItem = listItem.parentNode;

    if (listItem && (listItem as Element).tagName === 'LI') {
      const list = (listItem as Element).parentNode;
      if (list && (list as Element).tagName === 'OL') {
        const parent = list.parentNode;
        if (!parent) return;
        const items = Array.from(list.childNodes);
        const fragment = document.createDocumentFragment();
        items.forEach((li, i) => {
          while (li.firstChild) fragment.appendChild(li.firstChild);
          if (i < items.length - 1) fragment.appendChild(document.createElement('br'));
        });
        parent.insertBefore(fragment, list);
        parent.removeChild(list);
      } else if (list && (list as Element).tagName === 'UL') {
        const ol = document.createElement('ol');
        while (list.firstChild) ol.appendChild(list.firstChild);
        list.parentNode?.replaceChild(ol, list);
      }
    } else {
      formatText('insertOrderedList');
    }
    updateFormattingState();
  }, [formatText, updateFormattingState]);

  const toggleUnorderedList = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor) return;

    let listItem: Node | null = range.commonAncestorContainer;
    while (listItem && listItem.nodeType !== Node.ELEMENT_NODE) listItem = listItem.parentNode;

    if (listItem && (listItem as Element).tagName === 'LI') {
      const list = (listItem as Element).parentNode;
      if (list && (list as Element).tagName === 'UL') {
        const parent = list.parentNode;
        if (!parent) return;
        const items = Array.from(list.childNodes);
        const fragment = document.createDocumentFragment();
        items.forEach((li, i) => {
          while (li.firstChild) fragment.appendChild(li.firstChild);
          if (i < items.length - 1) fragment.appendChild(document.createElement('br'));
        });
        parent.insertBefore(fragment, list);
        parent.removeChild(list);
      } else if (list && (list as Element).tagName === 'OL') {
        const ul = document.createElement('ul');
        while (list.firstChild) ul.appendChild(list.firstChild);
        list.parentNode?.replaceChild(ul, list);
      }
    } else {
      formatText('insertUnorderedList');
    }
    updateFormattingState();
  }, [formatText, updateFormattingState]);

  const insertCode = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      formatText('insertHTML', '<code>code</code>');
      return;
    }
    const range = selection.getRangeAt(0);
    const text = range.toString();
    if (text) {
      const code = document.createElement('code');
      code.textContent = text;
      range.deleteContents();
      range.insertNode(code);
      range.setStartAfter(code);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    updateFormattingState();
  }, [formatText, updateFormattingState]);

  const focus = useCallback(() => editorRef.current?.focus(), []);

  // Initialize content. Sync from initialContent on mount, and also when it
  // changes externally — but never while the editor is focused, since that
  // would clobber the user's in-progress edits (the editor itself is the
  // source of truth during editing via onChange).
  const prevContentRef = useRef<string | null>(null);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const isMount = prevContentRef.current === null;
    const isFocused = document.activeElement === editor;
    const sanitized = initialContent.trim() ? sanitizeHtml(initialContent) : '';
    const differs = sanitized !== editor.innerHTML;

    if (isMount || (differs && !isFocused)) {
      if (sanitized) {
        editor.innerHTML = sanitized;
        editor.removeAttribute('data-empty');
      } else {
        editor.innerHTML = '';
        editor.setAttribute('data-empty', 'true');
      }
    }
    prevContentRef.current = initialContent;
  }, [initialContent]);

  // Event listeners
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleSelectionChange = () => updateFormattingState();

    const handleBeforeInput = (e: InputEvent) => {
      if (e.inputType !== 'insertText' || !e.data) return;
      if (removeFormattingOnNextInput.current.size === 0) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return;

      for (const formatType of removeFormattingOnNextInput.current) {
        const formattedElement = findFormattedAncestor(range.startContainer, editor, formatType);
        if (formattedElement) {
          e.preventDefault();
          const text = e.data;
          const parent = formattedElement.parentNode;
          if (!parent) return;
          const textNode = document.createTextNode(text);
          parent.insertBefore(textNode, formattedElement.nextSibling);
          const newRange = document.createRange();
          newRange.setStart(textNode, text.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          removeFormattingOnNextInput.current.delete(formatType);
          editor.dispatchEvent(new Event('input', { bubbles: true }));
          return;
        }
      }
    };

    const handleInput = () => {
      if (removeFormattingOnNextInput.current.size > 0) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          for (const formatType of removeFormattingOnNextInput.current) {
            const formattedElement = findFormattedAncestor(range.startContainer, editor, formatType);
            if (formattedElement) {
              const cursorNode = range.startContainer;
              if (cursorNode.nodeType === Node.TEXT_NODE && cursorNode.parentElement === formattedElement) {
                const parent = formattedElement.parentNode;
                if (parent) {
                  const offset = range.startOffset;
                  parent.insertBefore(cursorNode, formattedElement.nextSibling);
                  if (!formattedElement.textContent?.replace(/\u200B/g, '').trim())
                    parent.removeChild(formattedElement);
                  const newRange = document.createRange();
                  newRange.setStart(cursorNode, offset);
                  newRange.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                }
              }
            }
          }
        }
        removeFormattingOnNextInput.current.clear();
      }

      if (editor.innerHTML === '<br>' || editor.innerHTML === '') editor.innerHTML = '';
      const isEmpty = !editor.textContent?.trim() && (editor.innerHTML === '' || editor.innerHTML === '<br>');
      if (isEmpty) editor.setAttribute('data-empty', 'true');
      else editor.removeAttribute('data-empty');

      onChange?.(editor.innerHTML);
      updateFormattingState();
    };

    const handleMouseDown = () => {
      removeFormattingOnNextInput.current.clear();
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const html = e.clipboardData?.getData('text/html');
      const text = e.clipboardData?.getData('text/plain');
      if (html) {
        formatText('insertHTML', sanitizeHtml(html));
      } else if (text) {
        formatText('insertText', text);
      }
    };

    const handleDrop = (e: DragEvent) => {
      const html = e.dataTransfer?.getData('text/html');
      const text = e.dataTransfer?.getData('text/plain');
      if (!html && !text) return;
      e.preventDefault();
      editor.focus();
      if (html) {
        formatText('insertHTML', sanitizeHtml(html));
      } else if (text) {
        formatText('insertText', text);
      }
    };

    const handleKeyUp = () => updateFormattingState();
    const handleFocus = () => updateFormattingState();

    document.addEventListener('selectionchange', handleSelectionChange);
    editor.addEventListener('beforeinput', handleBeforeInput as EventListener);
    editor.addEventListener('input', handleInput);
    editor.addEventListener('mousedown', handleMouseDown);
    editor.addEventListener('keyup', handleKeyUp);
    editor.addEventListener('focus', handleFocus);
    editor.addEventListener('paste', handlePaste);
    editor.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      editor.removeEventListener('beforeinput', handleBeforeInput as EventListener);
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('mousedown', handleMouseDown);
      editor.removeEventListener('keyup', handleKeyUp);
      editor.removeEventListener('focus', handleFocus);
      editor.removeEventListener('paste', handlePaste);
      editor.removeEventListener('drop', handleDrop);
    };
  }, [updateFormattingState, onChange, findFormattedAncestor, formatText]);

  return {
    editorRef,
    formattingState,
    formatText,
    toggleBold,
    toggleItalic,
    toggleStrikethrough,
    toggleOrderedList,
    toggleUnorderedList,
    insertCode,
    focus,
  };
}
