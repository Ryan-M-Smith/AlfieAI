//
// Filename: hero.tsx
// Description: A hero component for the website
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import Image from "next/image";
import { JSX } from "react";
import Link from "next/link";
import { useTime, useTransform, useMotionTemplate, motion } from "framer-motion";

export default function Hero(): JSX.Element {
	const time = useTime()
	const rotate = useTransform(time, [0, 1000], [0, 360], { clamp: false });
	const bg = useMotionTemplate`repeating-conic-gradient(
		from ${rotate}deg at 50% 50%, 
		#00E0FF 0%,    /* Cyan */
		#00CFFF 20%,   /* Sky Blue */
		#00BFFF 40%,   /* Light Blue */
		#00A7E0 60%,   /* Blue-teal */
		#0090C0 80%,   /* Teal Blue */
		#00A7E0 90%,   /* Blue-teal */
		#00BFFF 100%   /* Light Blue — loop back */
	)`;

	return (
		<div className="flex justify-center items-center mx-5 h-screen dark:text-white text-black text-center pb-20 rounded-[16px]">
			<div className="relative">
				<div className={`
					flex flex-col justify-center items-center dark:bg-default-50 bg-blue-200
					dark:text-gray-200 p-10 rounded-lg
				`}>
					<Image className="rounded-[16px]" src="/logo.png" alt="AlfieAI logo" width={256} height={256}/>
					
					<h1 className="text-5xl font-bold mt-8">
						Say hello to AlfieAI 👋
					</h1>

					<p className="text-2xl mt-4">
						The AI expert on Juniata College. No eagle flies without AI! 🦅
					</p>

					<div className="flex gap-x-1 text-sm italic text-gray-500 mt-8 mb-0">
						<span> Copyright © 2025 Ryan Smith & Adithya Kommi. Powered by </span>
						<Link
							className="underline"
							href="https://nextjs.org"
							rel="noopener noreferrer"
							target="_blank"
							passHref
						>
							Next.js,
						</Link>
						<Link
							className="underline"
							href="https://gemini.google.com/app"
							rel="noopener noreferrer"
							target="_blank"
							passHref
						>
							Gemini,
						</Link>
						<span> and </span>
						<Link
							className="underline"
							href="https://vercel.com"
							rel="noopener noreferrer"
							target="_blank"
							passHref
						>
							Vercel.
						</Link>
					</div>
				</div>

				<motion.div
					className="absolute -inset-[10px] -z-10 rounded-[16px] shadow-lg dark:shadow-blue-300 shadow-gray-700"
					style={{ background: bg }}
				/>
			</div>
		</div>
	);
}