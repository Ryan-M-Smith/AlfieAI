//
// Filename: navbar.tsx
// Description: The website's navigation bar
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { BsGithub } from "react-icons/bs";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/dropdown";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowDown } from "react-icons/io";
import { JSX } from "react";
import Link from "next/link";   
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getPage, Page, pages } from "@/lib/pages";

export default function Navbar(): JSX.Element {
	const pathname = usePathname();
	const router = useRouter();

	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 640);
		checkMobile();

		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const page = getPage(pathname) ?? pages.features.chat;
	const { features, info } = pages;

	const BackButton = () => isMobile? (
		<Button
			className="fixed left-2 top-[7rem] w-fit mx-auto text-default-500 backdrop-blur-lg shadow-lg z-20 pr-1"
			size={"md"}
			radius="full"
			variant="ghost"
			onPress={ () => router.back() }
			startContent={<IoIosArrowBack size={30} />}
			isIconOnly
		/>
	) : (
		<Button
			className="font-bold text-lg font-mono ml-4"
			variant="light"
			onPress={ () => router.back() }
			startContent={<IoIosArrowBack/>}
		>
			Back
		</Button>
	);

	return (
		<>
			{ pathname.includes("/policies/") && isMobile && <BackButton/> }

			<header className={`
				sticky top-0 z-30 flex items-center justify-between px-2 py-4 border-b dark:border-zinc-800
				dark:bg-zinc-950/45 border-slate-300 backdrop-blur-lg bg-transparent
			`}>
				<div className="flex items-center gap-x-4 pl-1">
					<Dropdown disableAnimation>
						<DropdownTrigger>
							<Button variant="ghost" endContent={<IoIosArrowDown size={20}/>}>
								{page.card}
							</Button>
						</DropdownTrigger>

						<DropdownMenu aria-label="Static Actions" disabledKeys={ [page.name] }>
							<DropdownSection title="Features">
								{ Object.values(features).map((page: Page) => (
									<DropdownItem 
										key={page.name} 
										href={page.href}
										description={page.description} 
										textValue={page.name}
									>
										{page.card}
									</DropdownItem>
								))}
							</DropdownSection>

							<DropdownSection title="Info">
								{ Object.values(info).map((page: Page) => (
									<DropdownItem 
										key={page.name} 
										href={page.href}
										description={page.description} 
										textValue={page.name}
									>
										{page.card}
									</DropdownItem>
								))}
							</DropdownSection>
						</DropdownMenu>
					</Dropdown>

					{ pathname.includes("/policies/") && !isMobile && <BackButton/> }
				</div>
				
				<div className="flex gap-2 pr-1">
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
		</>
	);
}
