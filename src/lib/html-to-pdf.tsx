import { Text, View } from '@react-pdf/renderer';
import React from 'react';

type Style = Record<string, any>;

/**
 * Converts an HTML string (from the rich text editor) into @react-pdf/renderer components.
 * Handles: bold, italic, strikethrough, lists, code, line breaks, and plain text fallback.
 *
 * For plain text (no HTML tags), renders paragraphs split by newlines — backwards compatible
 * with existing resume data that predates the rich text editor.
 */
export function HtmlToPdf({
  html,
  style,
}: {
  html: string;
  style?: Style;
}) {
  // If there are no HTML tags, treat as plain text (backwards compatibility)
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    const paragraphs = html.split('\n\n').filter(Boolean);
    if (paragraphs.length <= 1) {
      return <Text style={style}>{html}</Text>;
    }
    return (
      <View>
        {paragraphs.map((p, i) => (
          <Text key={i} style={style}>{p}</Text>
        ))}
      </View>
    );
  }

  // Parse HTML using DOMParser
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const children = renderNodes(Array.from(doc.body.childNodes), style);

  if (children.length === 0) return null;
  if (children.length === 1) return <>{children[0]}</>;
  return <View>{children}</View>;
}

function renderNodes(nodes: Node[], baseStyle?: Style): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      // Skip zero-width spaces
      if (text.replace(/\u200B/g, '').length === 0) continue;
      result.push(<Text key={`t-${i}`} style={baseStyle}>{text}</Text>);
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Block elements
    if (tag === 'ul') {
      const items = Array.from(el.querySelectorAll(':scope > li'));
      items.forEach((li, j) => {
        const inline = renderInlineChildren(Array.from(li.childNodes), baseStyle);
        result.push(
          <View key={`ul-${i}-${j}`} style={{ flexDirection: 'row', marginLeft: 8 }}>
            <Text style={{ ...baseStyle, width: 10 }}>{'\u2022'}</Text>
            <Text style={{ ...baseStyle, flex: 1 }}>{inline}</Text>
          </View>
        );
      });
      continue;
    }

    if (tag === 'ol') {
      const items = Array.from(el.querySelectorAll(':scope > li'));
      items.forEach((li, j) => {
        const inline = renderInlineChildren(Array.from(li.childNodes), baseStyle);
        result.push(
          <View key={`ol-${i}-${j}`} style={{ flexDirection: 'row', marginLeft: 8 }}>
            <Text style={{ ...baseStyle, width: 14 }}>{`${j + 1}.`}</Text>
            <Text style={{ ...baseStyle, flex: 1 }}>{inline}</Text>
          </View>
        );
      });
      continue;
    }

    if (tag === 'br') {
      result.push(<Text key={`br-${i}`} style={baseStyle}>{'\n'}</Text>);
      continue;
    }

    if (tag === 'div' || tag === 'p') {
      const inline = renderInlineChildren(Array.from(el.childNodes), baseStyle);
      result.push(<Text key={`p-${i}`} style={baseStyle}>{inline}</Text>);
      continue;
    }

    if (tag === 'pre') {
      result.push(
        <Text key={`pre-${i}`} style={{ ...baseStyle, fontFamily: 'Courier' }}>
          {el.textContent}
        </Text>
      );
      continue;
    }

    // Inline elements at block level — wrap in Text
    const inline = renderInlineElement(el, i, baseStyle);
    if (inline) result.push(<Text key={`inline-${i}`} style={baseStyle}>{inline}</Text>);
  }

  return result;
}

function renderInlineChildren(nodes: Node[], baseStyle?: Style): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.replace(/\u200B/g, '').length === 0) continue;
      result.push(text);
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const inline = renderInlineElement(el, i, baseStyle);
    if (inline) result.push(inline);
  }

  return result;
}

function renderInlineElement(el: HTMLElement, key: number, baseStyle?: Style): React.ReactNode {
  const tag = el.tagName.toLowerCase();
  const children = renderInlineChildren(Array.from(el.childNodes), baseStyle);
  const hasClass = (cls: string) => el.classList.contains(cls);

  // Bold
  if (tag === 'strong' || tag === 'b' || hasClass('font-semibold')) {
    return <Text key={`b-${key}`} style={{ fontWeight: 700 }}>{children}</Text>;
  }

  // Italic
  if (tag === 'em' || tag === 'i' || hasClass('italic')) {
    return <Text key={`i-${key}`} style={{ fontStyle: 'italic' }}>{children}</Text>;
  }

  // Strikethrough
  if (tag === 's' || tag === 'strike' || tag === 'del' || hasClass('line-through')) {
    return <Text key={`s-${key}`} style={{ textDecoration: 'line-through' }}>{children}</Text>;
  }

  // Code
  if (tag === 'code') {
    return <Text key={`c-${key}`} style={{ fontFamily: 'Courier' }}>{el.textContent}</Text>;
  }

  // Span with formatting classes
  if (tag === 'span') {
    const spanStyle: Style = {};
    if (hasClass('font-semibold') || (parseInt(el.style.fontWeight || '0') >= 600))
      spanStyle.fontWeight = 700;
    if (hasClass('italic') || el.style.fontStyle === 'italic')
      spanStyle.fontStyle = 'italic';
    if (hasClass('line-through') || el.style.textDecorationLine?.includes('line-through'))
      spanStyle.textDecoration = 'line-through';

    if (Object.keys(spanStyle).length > 0) {
      return <Text key={`sp-${key}`} style={spanStyle}>{children}</Text>;
    }
    // Plain span, just return children
    return <>{children}</>;
  }

  if (tag === 'br') return '\n';

  // Fallback: just return text content
  return <>{children}</>;
}
