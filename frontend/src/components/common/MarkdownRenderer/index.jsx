import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

/**
 * Component render markdown với syntax highlighting
 *
 * @component
 */
const MarkdownRenderer = ({ content, className = "" }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-white mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-white mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),

          // Customize paragraph styles
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),

          // Customize list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-slate-300 mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-slate-300 mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-slate-300">{children}</li>,

          // Customize code styles
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            if (!inline && match) {
              // Block code
              return (
                <div className="relative mb-4">
                  <div className="bg-slate-900/80 rounded-lg border border-slate-700/50 overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50">
                      <span className="text-xs text-slate-400 uppercase tracking-wide">
                        {match[1]}
                      </span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code
                        className={`language-${match[1]} text-sm`}
                        {...props}
                      >
                        {children}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            } else {
              // Inline code
              return (
                <code
                  className="bg-slate-800/60 text-slate-200 px-2 py-1 rounded text-sm border border-slate-700/30"
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },

          // Customize blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 mb-3 bg-slate-800/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),

          // Customize table styles
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-slate-700/50 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-slate-200 font-medium border-b border-slate-700/50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-slate-300 border-b border-slate-700/30 last:border-b-0">
              {children}
            </td>
          ),

          // Customize link styles
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              {children}
            </a>
          ),

          // Customize strong/bold styles
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),

          // Customize emphasis/italic styles
          em: ({ children }) => (
            <em className="italic text-slate-200">{children}</em>
          ),

          // Customize horizontal rule
          hr: () => <hr className="border-slate-700/50 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
