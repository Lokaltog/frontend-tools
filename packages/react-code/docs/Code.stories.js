import React from 'react';
import { Code } from '../lib/components/Code';

export default { title: 'Code' };

export const primary = () => (
  <>
    <Code>
      {`
      // Code block
      <Code>{\`
      function sum(a, b) { return a + b; }
      \`}</Code>
    `}
    </Code>

    <div>
      <Code inline>
        {`
        <Code inline>{\`const sum = (a, b) => a + b; // inline-block code\`}</Code>
        `}
      </Code>
    </div>

    <Code language='yaml'>
      {`
        # Other languages support (here YAML). See react-syntax-highlighter documentation.
        sum:
          arguments:
            - a
            - b
          body: "a + b"
        `}
    </Code>

    <p>Supported languages: javascript, jsx, typescript, tsx, yaml, json.</p>
  </>
);
