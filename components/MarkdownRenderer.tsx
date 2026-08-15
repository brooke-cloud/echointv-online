
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  content: string;
};

// Markdown 内容渲染组件
export default function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <div className="min-w-0 break-words text-gray-700">

      {/* Markdown 内容 */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-10 break-words text-3xl font-bold text-gray-900 sm:text-4xl">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 break-words text-xl font-semibold text-gray-900 sm:text-2xl">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="my-5 break-words leading-8">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="my-5 list-disc space-y-2 pl-6 sm:pl-7">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-5 list-decimal space-y-2 pl-6 sm:pl-7">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="break-words leading-7">
              {children}
            </li>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-50 px-4 py-3 italic text-gray-700 sm:px-5">
              {children}
            </blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800"
            >
              {children}
            </a>
          ),

          code: ({ children }) => (
            <code className="break-words rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-red-600">
              {children}
            </code>
          ),

          pre: ({ children }) => (
            <pre className="my-6 max-w-full overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm leading-7 text-gray-100 sm:p-5">
              {children}
            </pre>
          ),

          hr: () => (
            <hr className="my-10 border-gray-200" />
          ),

          table: ({ children }) => (
            <div className="my-8 max-w-full overflow-x-auto">

              {/* Markdown 表格 */}
              <table className="min-w-[600px] w-full border-collapse text-left">
                {children}
              </table>

            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-gray-100">
              {children}
            </thead>
          ),

          th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-3">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

    </div>
  );
}