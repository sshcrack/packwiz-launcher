import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Import guide content
import guideContent from '../content/guide.md?raw';

export default function GuidePage() {

    return (
        <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
            <div className="max-w-4xl w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Modpack Creation Guide
                    </h1>
                    <p className="text-xl mb-6">
                        A comprehensive guide to creating and publishing your Minecraft modpack
                    </p>                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-8 mb-8">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            // Customize heading styles
                            h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} className="text-3xl font-bold mb-4 pt-4" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-2" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="font-semibold mb-2" {...props} />,

                            // Customize paragraph styles
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,

                            // Customize link styles
                            a: ({ node, href, ...props }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                    {...props}
                                />
                            ),

                            // Customize list styles
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-4" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4" {...props} />,

                            // Customize code blocks
                            code: ({ node, className, children, ...props }) => {
                                if (!node?.properties?.block) {
                                    return <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded" {...props}>{children}</code>;
                                }
                                return (
                                        <code className={className} {...props}>{children}</code>
                                );
                            },

                            pre: ({ node, children, ...props }) => {
                                node?.children.forEach((child) => {
                                    if (child.type === 'element' && child.tagName === 'code')
                                        child.properties.block = true
                                })
                                return (
                                    <pre {...props} className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4 font-mono text-sm overflow-auto">
                                        {children}
                                    </pre>
                                );
                            },

                            // Add styles for blockquotes
                            blockquote: ({ node, ...props }) => (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-800 dark:text-blue-200 mb-4">
                                    <blockquote {...props} />
                                </div>
                            ),
                        }}
                    >
                        {guideContent}
                    </ReactMarkdown>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
                    <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold">Issue: Installer can't download the modpack</h4>
                            <p>
                                Ensure your pack.toml URL is accessible and is the raw GitHub URL (starts with https://raw.githubusercontent.com/).
                                Check that your repository is public.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold">Issue: Mods not loading in the game</h4>
                            <p>
                                Verify that your modloader version matches the mods you've added.
                                Some mods may have dependencies that need to be included.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold">Issue: Base pack doesn't have the right Minecraft version</h4>
                            <p>
                                Make sure the Minecraft version and modloader in your base pack match what you specified in your packwiz modpack.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400">
                    <p>
                        For more detailed information and advanced usage, please refer to the official packwiz documentation at{' '}
                        <a href="https://packwiz.infra.link/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            https://packwiz.infra.link/
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
