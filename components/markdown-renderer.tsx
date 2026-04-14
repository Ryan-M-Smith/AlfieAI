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
		<div className={`
			prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed
			prose-p:my-2 prose-p:leading-relaxed prose-p:text-foreground prose-headings:mt-4 prose-headings:mb-2
			prose-headings:text-foreground
			prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-ul:pl-5 prose-ol:pl-5
			prose-ul:list-disc prose-ol:list-decimal prose-ul:text-foreground prose-ol:text-foreground
			prose-li:text-foreground prose-li:marker:text-foreground prose-strong:text-foreground prose-strong:font-semibold prose-code:font-mono
			prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
			prose-a:text-foreground prose-a:underline prose-pre:my-3
			prose-blockquote:border-l-4 prose-blockquote:border-default prose-blockquote:pl-4
			prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:bg-foreground/10
			prose-blockquote:py-2 prose-blockquote:my-2 wrap-break-word
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
		</div>
	)
}