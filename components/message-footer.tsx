//
// Filename: message-footer.tsx
// Description: Footer buttons for each message
// Copyright (c) 2025-2026 Ryan Smith <rysmith2113@gmail.com>
//

import { Button } from "@heroui/react";
import { JSX, useState } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

interface MessageFooterProps {
	role: "user" | "model";
	content: string;
}

export default function MessageFooter({ role, content }: MessageFooterProps): JSX.Element {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}
	
	const UserButtons = () => {
		return (
			<div className="flex justify-end items-center text-default-300">
				<Button
					className="border-none"
					variant="ghost"
					size="sm"
					startContent={
						copied?
							<LuCopyCheck className="text-default-300" size={18}/> :
							<LuCopy className="text-default-300" size={18}/>
					}
					onPress={copy}
					isIconOnly
				/>
			</div>
		);
	}
	
	return (
		<></>
	);
}