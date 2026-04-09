import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import Image from 'next/image';

export default function MarkdownRenderer({ md }: { md: string }) {
  return (
    <div className="flex flex-col">
      <ReactMarkdown 
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
          hr: ({node, ...props}) => <hr className="my-2 border-0 h-[2px] bg-(--lines)" {...props} />,
          p: ({node, ...props}) => <p className="text-base leading-7 mb-4" {...props} />,
          a: ({node, ...props}) => <a className="text-(--teal) hover:underline" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 ml-4" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 ml-4" {...props} />,
          li: ({node, ...props}) => <li className="mb-2" {...props} />,
          pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4" {...props} />,
          table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 mb-4" {...props} />,
          th: ({node, ...props}) => <th className="border border-gray-300 bg-gray-100 px-4 py-2 font-bold text-left" {...props} />,
          td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
          img: ({node, ...props}) => (
            <img
              {...props}
              className="max-h-100 w-auto rounded-sm my-2 justify-self-center"
            />
          ),
         }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}