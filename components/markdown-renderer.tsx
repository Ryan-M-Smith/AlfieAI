//
// Filename: markdown-renderer.tsx
// Description: Render Markdown content using react-markdown
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

"use client";

import { JSX } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
	content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps): JSX.Element {
	return (
		<span className={`
			prose text-default-foreground prose-p:my-4 prose-p:leading-snug prose-li:my-0.5
			prose-ul:leading-snug prose-ol:leading-snug prose-li:leading-snug prose-ul:pl-5
			prose-li:pl-0 prose-ul:list-disc dark:prose-a:text-blue-400 prose-a:text-primary
			prose-headings:text-default-foreground prose-strong:text-default-foreground
			prose-strong:font-bold prose-headings:leading-none prose-code:font-mono
			prose-li:marker:text-default-foreground prose-h1:text-center
			prose-blockquote:border-l-4 prose-blockquote:border-default prose-blockquote:pl-4
			prose-blockquote:italic prose-blockquote:text-foreground-500 prose-blockquote:bg-foreground/10
			prose-blockquote:my-4 prose-blockquote:py-2 break-words
		`}>
			<Markdown
				remarkPlugins={[remarkGfm]}
				components={{
					a: ({ ...props }) => (
						<a {...props} href={props.href} rel="noopener noreferrer" onClick={(e) => {
							e.preventDefault();
							if (window.confirm(`Open this link? ${props.href}`)) {
								window.open(props.href, "_blank", "noopener,noreferrer");
							}
						}}>
							{props.children}
						</a>
					)
				}}
			>
				{content}
			</Markdown>
		</span>
	)
}