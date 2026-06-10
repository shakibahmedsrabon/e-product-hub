import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="prose prose-lg max-w-none 
      prose-headings:font-light prose-headings:text-foreground
      prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
      prose-h3:text-xl prose-h3:mb-2
      prose-p:text-muted-foreground prose-p:leading-relaxed
      prose-li:text-muted-foreground
      prose-ul:list-disc prose-ul:list-inside
      prose-ol:list-decimal prose-ol:list-inside
      prose-a:text-primary prose-a:underline
      prose-strong:text-foreground
      prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
