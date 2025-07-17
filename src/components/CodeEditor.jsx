// src/components/CodeEditor.jsx
import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
const languageExtensions = {
  python: python(),
  java: java(),
  c: cpp(),
  'c++': cpp(),
};

const CodeEditor = ({ language = 'python', value = '', onChange }) => {
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    const langExt = languageExtensions[language] || python();
    setExtensions([
      langExt,
      oneDark,
      autocompletion(),
      EditorView.lineWrapping,
    ]);
  }, [language]);

  return (
    <div style={{ height: '100%', minHeight: '400px' }}>
      <CodeMirror
        value={value}
        height="400px"
        theme={oneDark}
        extensions={extensions}
        onChange={(val) => onChange?.(val)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: true,
          syntaxHighlighting: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
