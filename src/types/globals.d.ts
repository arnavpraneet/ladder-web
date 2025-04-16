// Type declarations for modules without proper TypeScript support

declare module 'react-markdown' {
  import { ReactNode } from 'react';
  
  export interface ReactMarkdownProps {
    children: string;
    remarkPlugins?: any[];
    components?: Record<string, React.ComponentType<any>>;
    className?: string;
  }
  
  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vs: any;
  export const vscDarkPlus: any;
  export const prism: any;
  export const dracula: any;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/typescript' {
  const typescript: any;
  export default typescript;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/javascript' {
  const javascript: any;
  export default javascript;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/jsx' {
  const jsx: any;
  export default jsx;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/tsx' {
  const tsx: any;
  export default tsx;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/json' {
  const json: any;
  export default json;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/bash' {
  const bash: any;
  export default bash;
} 