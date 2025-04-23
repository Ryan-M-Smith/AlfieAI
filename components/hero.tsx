//
// Filename: hero.tsx
// Description: A hero component for the website
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { JSX } from "react";
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
		<div className="flex justify-center items-center mx-5 h-screen dark:text-white text-black text-center pb-20">
			<div className="flex flex-col justify-center items-center rounded-lg">
				<div className="relative">
					<div className="dark:bg-default-50 bg-blue-200 dark:text-gray-200 p-10 rounded-lg">
						<h1 className="text-5xl font-bold mb-4">
							Welcome to AlfieAI
						</h1>

						<p className="text-2xl mb-8">
							The AI expert on Juniata College. No eagle flies without AI! 🦅
						</p>
					</div>
					<motion.div
						className="absolute -inset-[10px] -z-10 rounded-lg shadow-lg dark:shadow-blue-300 shadow-gray-700"
						style={{ background: bg }}
					/>
				</div>
			</div>
		</div>
	);
}