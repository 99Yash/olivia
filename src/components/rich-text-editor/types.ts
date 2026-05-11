import React from 'react';

export interface FormattingState {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  orderedList: boolean;
  unorderedList: boolean;
}

export type ToolbarOption =
  | { id: string; separator: true }
  | {
      id: string;
      separator?: false;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      onClick: () => void;
      isActive?: boolean;
      disabled?: boolean;
    };

export interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}
