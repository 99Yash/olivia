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

export interface ToolbarOption {
  id: string;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  command?: string;
  value?: string;
  onClick?: () => void;
  isActive?: boolean;
  separator?: boolean;
  disabled?: boolean;
}

export interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}
