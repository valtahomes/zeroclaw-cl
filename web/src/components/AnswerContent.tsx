import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface AnswerContentProps {
    answer: string;
}

const AnswerContent: React.FC<AnswerContentProps> = ({ answer }) => {
    // 预处理函数：为连续的 **key**: value 格式添加双空行分隔
    const preprocessAnswer = (text: string): string => {
        // 先处理单个\n换行：在每个单独的\n前添加两个空格，让Markdown识别为硬换行
        let processedText = text.replace(/([^\n])\n([^\n])/g, '$1  \n$2');
        // 过滤掉 Unicode 水平线字符（\u2500）组成的无效表格行
        processedText = processedText.replace(/\|\s*[\u2500]+\s*\|/g, '');
        // 更广泛地过滤包含大量重复 \u2500 字符的行
        processedText = processedText.replace(/^.*[\u2500]{10,}.*$/gm, '');

        // 然后处理**key**: value格式的分隔
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

    // 处理代码内容，移除不必要的前导空格
    const processCodeContent = (content: string | React.ReactNode): string | React.ReactNode => {
        if (typeof content === 'string') {
            // 移除转义的美元符号
            let processed = content.replace(/\\\$/g, '$');

            // 处理多行代码的缩进对齐
            const lines = processed.split('\n');
            if (lines.length > 1) {
                // 移除第一行的前导空格（如果存在）
                if (lines[0] && lines[0].startsWith(' ')) {
                    lines[0] = lines[0].replace(/^ /, '');
                }
                // 或者采用更激进的方法：移除所有行的公共前导空格
                // const minIndent = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^ */)?.[0].length || 0));
                // if (minIndent > 0) {
                //     lines.forEach((line, index) => {
                //         if (line.trim()) {
                //             lines[index] = line.substring(minIndent);
                //         }
                //     });
                // }
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
                    [remarkMath, {
                        // 配置 remarkMath 插件选项
                        singleDollarTextMath: false, // 禁用单个 $ 的行内数学公式
                        strict: true, // 但配置更严格的匹配规则
                    }]
                ]}
                rehypePlugins={[
                    rehypeRaw,
                    [rehypeKatex, {
                        // 配置 KaTeX 选项
                        strict: false, // 允许一些非标准的 LaTeX 语法
                        throwOnError: false, // 遇到错误时不抛出异常，而是显示错误信息
                        errorColor: '#cc0000', // 错误显示颜色
                        fleqn: false, // 是否左对齐公式
                        displayMode: false, // 默认不使用 display 模式
                        // 自定义宏
                        macros: {
                            "\\RR": "\\mathbb{R}",
                            "\\NN": "\\mathbb{N}",
                            "\\ZZ": "\\mathbb{Z}",
                        }
                    }]
                ]}
                components={{
                    // 标题层级优化
                    h1: (props) => (
                        <h1
                            className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 
                                     border-b border-gray-200 dark:border-kavout-700 pb-2"
                            {...props}
                        />
                    ),
                    h2: (props) => (
                        <h2
                            className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200
                                     scroll-margin-top-24"
                            {...props}
                        />
                    ),
                    h3: (props) => (
                        <h3
                            className="text-xl font-medium mt-5 mb-2 text-gray-800 dark:text-gray-200"
                            {...props}
                        />
                    ),
                    h4: (props) => (
                        <h4
                            className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300"
                            {...props}
                        />
                    ),
                    h5: (props) => (
                        <h5
                            className="text-base font-medium mt-3 mb-1 text-gray-700 dark:text-gray-300"
                            {...props}
                        />
                    ),
                    h6: (props) => (
                        <h6
                            className="text-sm font-medium mt-3 mb-1 text-gray-600 dark:text-gray-400"
                            {...props}
                        />
                    ),

                    // 段落优化
                    p: (props) => (
                        <p
                            className="my-3 leading-7 text-gray-700 dark:text-gray-300 
                                     text-base tracking-normal"
                            {...props}
                        />
                    ),

                    // 列表优化
                    ul: (props) => (
                        <ul
                            className="list-disc ml-6 my-4 space-y-2 text-gray-700 dark:text-gray-300
                                     marker:text-gray-400"
                            {...props}
                        />
                    ),
                    ol: (props) => (
                        <ol
                            className="list-decimal ml-6 my-4 space-y-2 text-gray-700 dark:text-gray-300
                                     marker:text-gray-400 marker:font-medium"
                            {...props}
                        />
                    ),
                    li: (props) => (
                        <li
                            className="pl-2 leading-relaxed"
                            {...props}
                        />
                    ),

                    // 分隔线
                    hr: (props) => (
                        <hr
                            className="my-4 border-gray-200 dark:border-kavout-700"
                            {...props}
                        />
                    ),

                    // 强调文本
                    strong: (props) => (
                        <strong
                            className="font-semibold text-gray-900 dark:text-gray-100"
                            {...props}
                        />
                    ),
                    em: (props) => (
                        <em
                            className="italic text-gray-800 dark:text-gray-200"
                            {...props}
                        />
                    ),

                    // 修复后的代码处理 - 关键修改在这里
                    code: ({ children, className, ...props }) => {
                        // 处理代码块中的内容
                        const processedChildren = processCodeContent(children);

                        // 内联代码：没有 className 说明是内联代码
                        if (!className) {
                            return (
                                <code
                                    className="px-1.5 py-0.5  rounded text-sm
                                             font-mono   break-words"
                                    {...props}
                                >
                                    {processedChildren}
                                </code>
                            );
                        }

                        // 代码块：有 className 说明是代码块，强制换行
                        return (
                            <code
                                className={`${className} text-sm font-mono 
                                           whitespace-pre-wrap break-words block leading-relaxed`}
                                style={{
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                }}
                                {...props}
                            >
                                {processedChildren}
                            </code>
                        );
                    },
                    // 专门处理 pre 标签（代码块的外层容器）- 移除横向滚动
                    pre: ({ children, ...props }) => (
                        <pre
                            className=" bg-gray-50 dark:bg-kavout-600 dark:border-kavout-700 dark:text-gray-400 text-gray-800 rounded-lg p-4 my-4 
                                     border 
                                     w-full"
                            style={{
                                overflow: 'visible', // 移除横向滚动
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            {...props}
                        >
                            {children}
                        </pre>
                    ),

                    // 引用块优化
                    blockquote: (props) => (
                        <blockquote
                            className="border-l-4 pl-4 py-2 my-4 
                                      italic  rounded-r"
                            {...props}
                        />
                    ),

                    // 表格优化
                    table: (props) => (
                        <div className="overflow-x-auto my-2 rounded-lg border font-poppins dark:border-kavout-700
                                      scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                                      scrollbar-track-gray-100 dark:scrollbar-track-gray-800
                                      hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#d1d5db #f3f4f6'
                            }}
                        >
                            <table
                                className="min-w-full divide-y divide-gray-200 dark:divide-kavout-700"
                                {...props}
                            />
                        </div>
                    ),
                    thead: (props) => (
                        <thead
                            className="bg-gray-50 dark:bg-kavout-800 dark:border-kavout-700"
                            {...props}
                        />
                    ),
                    tbody: (props) => (
                        <tbody
                            className="bg-white dark:bg-kavout-900 divide-y divide-gray-200 dark:divide-kavout-700"
                            {...props}
                        />
                    ),
                    tr: (props) => {
                        // 检查行中是否包含有效内容
                        const children = React.Children.toArray(props.children) as React.ReactElement[];

                        // 检查是否包含有效内容
                        const hasValidContent = children.some(child => {
                            if (React.isValidElement(child)) {
                                const childProps = child.props as { children?: React.ReactNode };
                                const childText = React.Children.toArray(childProps.children).join('');
                                // 检查是否有有效文本内容（非空且不是水平线字符）
                                return typeof childText === 'string' &&
                                    childText.trim() !== '' &&
                                    !/^[\u2500\s|\-]+$/.test(childText.trim());
                            }
                            return false;
                        });

                        // 如果没有有效内容，不渲染这一行
                        if (!hasValidContent) {
                            return null;
                        }

                        return <tr className="..." {...props} />;
                    },
                    th: (props) => (
                        <th
                            className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-400 
                                     tracking-wider whitespace-nowrap"
                            {...props}
                        />
                    ),
                    // td: (props) => (
                    //     <td
                    //         className="px-4 py-3   text-sm text-gray-900 dark:text-gray-100"
                    //         {...props}
                    //     />
                    // ),


                    td: (props) => {
                        // 过滤掉包含大量 Unicode 水平线字符的单元格内容
                        const children = props.children;
                        if (typeof children === 'string' && /[\u2500]{5,}/.test(children)) {
                            return null; // 不渲染包含无效内容的单元格
                        }

                        return <td className="px-4 py-3   text-sm text-gray-900 dark:text-gray-100" {...props} />;
                    },


                    // 链接优化
                    a: ({ href, children, ...props }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300
                                     underline hover:no-underline transition-colors duration-200
                                     font-medium"
                            {...props}
                        >
                            {children}
                        </a>
                    ),

                    // 图片优化
                    img: ({ src, alt, ...props }) => (
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full h-auto rounded-lg shadow-sm my-4
                                     border border-gray-200 dark:border-kavout-700"
                            loading="lazy"
                            {...props}
                        />
                    ),

                    // 删除线
                    del: (props) => (
                        <del
                            className="text-gray-500 dark:text-gray-400"
                            {...props}
                        />
                    ),

                    // 任务列表支持
                    input: ({ type, checked, ...props }) => {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="mr-2 rounded border-gray-300 text-blue-600 
                                             focus:ring-blue-500 dark:border-gray-600 
                                             dark:bg-kavout-700"
                                    {...props}
                                />
                            );
                        }
                        return <input type={type} {...props} />;
                    },

                    // 键盘按键样式
                    kbd: (props) => (
                        <kbd
                            className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200
                                     bg-gray-100 dark:bg-kavout-700 border border-gray-300 dark:border-gray-600
                                     rounded shadow-sm"
                            {...props}
                        />
                    ),

                    // 标记高亮
                    mark: (props) => (
                        <mark
                            className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
                            {...props}
                        />
                    ),

                    // sup 和 sub
                    sup: (props) => (
                        <sup
                            className="text-xs"
                            {...props}
                        />
                    ),
                    sub: (props) => (
                        <sub
                            className="text-xs"
                            {...props}
                        />
                    ),
                }}
            >
                {preprocessAnswer(answer)}
            </ReactMarkdown>
        </div>
    );
};

export default AnswerContent;