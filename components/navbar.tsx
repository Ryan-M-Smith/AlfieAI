//
// Filename: navbar.tsx
// Description: The website's navigation bar
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { BsGithub } from "react-icons/bs";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/dropdown";
import { JSX } from "react";
import Link from "next/link";   
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";

import { getPage, Page, pages } from "@/lib/pages";

export default function Navbar(): JSX.Element {
	const pathname = usePathname();
	const page = getPage(pathname) ?? pages.chat;
	
	return (
		<header className={`
			sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b dark:border-zinc-800
			dark:bg-zinc-950/90 border-slate-300 backdrop-blur-lg bg-transparent
		`}>
			<Dropdown>
				<DropdownTrigger>
					<Button variant="ghost" endContent={<IoIosArrowDown size={20}/>}>
						{page.card}
					</Button>
				</DropdownTrigger>

				<DropdownMenu aria-label="Static Actions" disabledKeys={ [page.name] }>
					<DropdownSection title="Features">
						{ Object.values(pages).map((page: Page) => (
							<DropdownItem 
								key={page.name} 
								href={page.href}
								description={page.description} 
							>
								{page.card}
							</DropdownItem>
						))}
					</DropdownSection>
				</DropdownMenu>
			</Dropdown>
			
			<div className="flex gap-2">
				<Link href="https://github.com/Ryan-M-Smith/AlfieAI" target="_blank" rel="noopener noreferrer">
					<Button
						className={`
							flex items-center justify-center rounded-[10px]
							text-black bg-white border-black border-2 dark:border-none p-0
							w-[40px] h-[40px] min-w-[40px] min-h-[40px]
						`}
						variant="flat"
						startContent={ <BsGithub size={30} className="mx-auto" /> }
						isIconOnly
					/>
				</Link>

				<div className="border-r-1 border-default-400"/>

				<Link href="/">
					<Image
						className="inline-block mr-2 rounded-[10px]"
						src="/logo.png"
						alt="AlfieAI Logo"
						width={40}
						height={40}
					/>
				</Link>
			</div>
		</header>
	);
}
