'use client';

import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Toolbar } from './toolbar';
import type { RichTextEditorProps, ToolbarOption } from './types';
import { useRichTextEditor } from './use-rich-text-editor';

export function RichTextEditor({
  initialContent = '',
  placeholder = 'Type here...',
  onChange,
  className = '',
  disabled = false,
  minHeight = '5rem',
}: RichTextEditorProps) {
  const {
    editorRef,
    formattingState,
    toggleBold,
    toggleItalic,
    toggleStrikethrough,
    toggleOrderedList,
    toggleUnorderedList,
    insertCode,
  } = useRichTextEditor(initialContent, onChange);

  const toolbarOptions: ToolbarOption[] = useMemo(
    () => [
      { id: 'bold', icon: Bold, label: 'Bold (Ctrl+B)', onClick: toggleBold, isActive: formattingState.bold },
      { id: 'italic', icon: Italic, label: 'Italic (Ctrl+I)', onClick: toggleItalic, isActive: formattingState.italic },
      { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough', onClick: toggleStrikethrough, isActive: formattingState.strikethrough },
      { id: 'sep1', separator: true },
      { id: 'code', icon: Code, label: 'Code', onClick: insertCode, isActive: formattingState.code },
      { id: 'sep2', separator: true },
      { id: 'ol', icon: ListOrdered, label: 'Numbered list', onClick: toggleOrderedList, isActive: formattingState.orderedList },
      { id: 'ul', icon: List, label: 'Bullet list', onClick: toggleUnorderedList, isActive: formattingState.unorderedList },
    ],
    [formattingState, toggleBold, toggleItalic, toggleStrikethrough, insertCode, toggleOrderedList, toggleUnorderedList]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    let currentNode: Node | null = range.startContainer;
    while (currentNode && currentNode.nodeType !== Node.ELEMENT_NODE)
      currentNode = currentNode.parentNode;

    let listItem: Element | null = null;
    let list: Element | null = null;
    while (currentNode) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const el = currentNode as Element;
        if (el.tagName === 'LI') { listItem = el; list = el.parentElement; break; }
      }
      currentNode = currentNode.parentNode;
    }

    if (listItem && list && (list.tagName === 'OL' || list.tagName === 'UL')) {
      e.preventDefault();
      const textContent = listItem.textContent?.trim() || '';
      const isEmpty = textContent === '' || textContent === '\u200B';

      if (isEmpty && list.children.length === 1) {
        const parent = list.parentNode;
        if (!parent) return;
        const br = document.createElement('br');
        parent.insertBefore(br, list.nextSibling);
        parent.removeChild(list);
        const newRange = document.createRange();
        newRange.setStartAfter(br);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else if (isEmpty) {
        const parent = list.parentNode;
        if (!parent) return;
        const newBlock = document.createElement('div');
        newBlock.appendChild(document.createElement('br'));
        parent.insertBefore(newBlock, list.nextSibling);
        list.removeChild(listItem);
        if (list.children.length === 0) parent.removeChild(list);
        const newRange = document.createRange();
        newRange.setStartBefore(newBlock.firstChild!);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        const newLi = document.createElement('li');
        newLi.innerHTML = '&#8203;';
        list.insertBefore(newLi, listItem.nextSibling);
        const newRange = document.createRange();
        newRange.setStart(newLi, 0);
        newRange.setEnd(newLi, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      requestAnimationFrame(() => document.dispatchEvent(new Event('selectionchange')));
    }
    // Default behavior for Enter outside lists (creates new line)
  };

  return (
    <div className={`rounded-md border bg-transparent text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}>
      <div className="flex items-center border-b px-2 py-1">
        <Toolbar options={toolbarOptions} disabled={disabled} />
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="rich-text-editor overflow-y-auto px-3 py-2 text-sm leading-relaxed focus:outline-none [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:text-sm [&_pre]:whitespace-pre-wrap [&_strong]:font-semibold [&_em]:italic [&_s]:line-through [&_u]:underline data-[empty=true]:before:content-[attr(data-placeholder)] data-[empty=true]:before:text-muted-foreground/50 data-[empty=true]:before:pointer-events-none"
        style={{ minHeight, outline: 'none' }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
