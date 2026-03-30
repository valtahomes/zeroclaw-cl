import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownContentProps {
    content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
    // 预处理：为连续的 **key**: value 格式添加双空行分隔
    const preprocessContent = (text: string): string => {
        let processedText = text.replace(/([^\n])\n([^\n])/g, '$1  \n$2');
        processedText = processedText.replace(/\|\s*[\u2500]+\s*\|/g, '');
        processedText = processedText.replace(/^.*[\u2500]{10,}.*$/gm, '');

        const lines = processedText.split('\n');
        const processedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i] ?? '';
            const nextLine = lines[i + 1] ?? '';

            const currentMatches = /^\*\*[^*]+\*\*:\s*.+$/.test(currentLine.trim());
            const nextMatches = nextLine ? /^\*\*[^*]+\*\*:\s*.+$/.test(nextLine.trim()) : false;

            processedLines.push(currentLine);

            if (currentMatches && nextMatches) {
                processedLines.push('');
                processedLines.push('');
            }
        }

        return processedLines.join('\n');
    };

    const processCodeContent = (content: string | React.ReactNode): string | React.ReactNode => {
        if (typeof content === 'string') {
            let processed = content.replace(/\\\$/g, '$');
            const lines = processed.split('\n');
            if (lines.length > 1) {
                if (lines[0] && lines[0].startsWith(' ')) {
                    lines[0] = lines[0].replace(/^ /, '');
                }
                processed = lines.join('\n');
            }
            return processed;
        }
        return content;
    };

    return (
        <div className="w-full max-w-none">
            <ReactMarkdown
                remarkPlugins={[
                    remarkGfm,
                    [remarkMath, { singleDollarTextMath: false, strict: true }]
                ]}
                rehypePlugins={[
                    rehypeRaw,
                    [rehypeKatex, { strict: false, throwOnError: false, errorColor: '#cc0000' }]
                ]}
                components={{
                    h1: (props) => (
                        <h1 className="text-xl font-bold mt-6 mb-3 pb-2 border-b" {...props} />
                    ),
                    h2: (props) => (
                        <h2 className="text-lg font-semibold mt-5 mb-2" {...props} />
                    ),
                    h3: (props) => (
                        <h3 className="text-base font-medium mt-4 mb-2" {...props} />
                    ),
                    p: (props) => (
                        <p className="my-2 leading-relaxed" {...props} />
                    ),
                    ul: (props) => (
                        <ul className="list-disc ml-5 my-2 space-y-1" {...props} />
                    ),
                    ol: (props) => (
                        <ol className="list-decimal ml-5 my-2 space-y-1" {...props} />
                    ),
                    li: (props) => (
                        <li className="pl-1 leading-relaxed" {...props} />
                    ),
                    hr: (props) => (
                        <hr className="my-3" {...props} />
                    ),
                    strong: (props) => (
                        <strong className="font-semibold" {...props} />
                    ),
                    em: (props) => (
                        <em className="italic" {...props} />
                    ),
                    code: ({ children, className, ...props }) => {
                        const processedChildren = processCodeContent(children);
                        if (!className) {
                            return (
                                <code
                                    className="px-1.5 py-0.5 rounded text-xs font-mono break-words"
                                    style={{ background: 'var(--pc-bg-elevated)' }}
                                    {...props}
                                >
                                    {processedChildren}
                                </code>
                            );
                        }
                        return (
                            <code
                                className={`${className} text-xs font-mono whitespace-pre-wrap break-words block leading-relaxed`}
                                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                {...props}
                            >
                                {processedChildren}
                            </code>
                        );
                    },
                    pre: ({ children, ...props }) => (
                        <pre
                            className="rounded-lg p-3 my-3 border w-full overflow-x-auto"
                            style={{
                                background: 'var(--pc-bg-elevated)',
                                borderColor: 'var(--pc-border)',
                                overflow: 'auto',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            {...props}
                        >
                            {children}
                        </pre>
                    ),
                    blockquote: (props) => (
                        <blockquote
                            className="border-l-4 pl-3 py-2 my-3 italic rounded-r"
                            style={{ borderColor: 'var(--pc-accent-dim)' }}
                            {...props}
                        />
                    ),
                    table: (props) => (
                        <div className="overflow-x-auto my-2 rounded-lg border" style={{ borderColor: 'var(--pc-border)' }}>
                            <table className="min-w-full divide-y" {...props} />
                        </div>
                    ),
                    thead: (props) => (
                        <thead className="text-left" {...props} />
                    ),
                    tbody: (props) => (
                        <tbody className="divide-y" {...props} />
                    ),
                    tr: (props) => {
                        const children = React.Children.toArray(props.children) as React.ReactElement[];
                        const hasValidContent = children.some(child => {
                            if (React.isValidElement(child)) {
                                const childProps = child.props as { children?: React.ReactNode };
                                const childText = React.Children.toArray(childProps.children).join('');
                                return typeof childText === 'string' &&
                                    childText.trim() !== '' &&
                                    !/^[\u2500\s|\-]+$/.test(childText.trim());
                            }
                            return false;
                        });
                        if (!hasValidContent) return null;
                        return <tr {...props} />;
                    },
                    th: (props) => (
                        <th className="px-3 py-2 text-sm font-medium" {...props} />
                    ),
                    td: (props) => {
                        const children = props.children;
                        if (typeof children === 'string' && /[\u2500]{5,}/.test(children)) {
                            return null;
                        }
                        return <td className="px-3 py-2 text-sm" {...props} />;
                    },
                    a: ({ href, children, ...props }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                            style={{ color: 'var(--pc-accent)' }}
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    img: (props) => (
                        <img className="max-w-full h-auto rounded-lg my-3" {...props} />
                    ),
                }}
            >
                {preprocessContent(content)}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
