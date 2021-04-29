import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';

const languages = { javascript, jsx, typescript, tsx, yaml, json, prism };

export const Code = ({ children, inline, language = 'jsx' }) => {
  useEffect(() => {
    SyntaxHighlighter.registerLanguage(language, languages[language]);
  }, [language]);

  let lines = children.split('\n');

  // find first and last non-empty lines, and slice
  if (lines.length > 1) {
    const firstLine = lines.findIndex((l) => l.trim().length > 0);
    const lastLine = [...lines].reverse().findIndex((l) => l.trim().length > 0);
    lines = lines.slice(firstLine, -lastLine);
  }

  // find number of leading spaces to trim
  const leadingSpaces = Math.min(
    ...lines
      .filter((l) => l.trim().length > 0)
      .map((l) => l.slice(0, l.search(/[^\s]/)).length),
  );

  lines = lines.map((l) => l.slice(leadingSpaces));

  const code = lines.join('\n');

  return (
    <SyntaxHighlighter
      language={language}
      style={prism}
      wrapLongLines
      customStyle={{ display: inline ? 'inline-block' : 'block' }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

Code.propTypes = {
  children: PropTypes.string,
  inline: PropTypes.bool,
  language: PropTypes.oneOf([
    'javascript',
    'jsx',
    'typescript',
    'tsx',
    'yaml',
    'json',
  ]),
};
