//
// Filename: page.tsx
// Route: /courses/catalog
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Button } from "@heroui/button";
import { FaArrowCircleUp } from "react-icons/fa";
import { GrSchedules } from "react-icons/gr";
import { JSX } from "react";
import { Input } from "@heroui/input";
import { IoIosSearch } from "react-icons/io";
import Link from "next/link";

import Navbar from "@/components/navbar";

export const metadata = {
	title: "Course Catalog",
	description: "Find and explore courses offered at Juniata College.",
};

export default function Catalog(): JSX.Element {
	const SearchButton = () => (
		<Button
			className="pl-2 relative right-0 sm:right-auto sm:top-0 pointer-events-auto disabled:text-default-500"
			radius="full"
			variant="light"
			startContent={<FaArrowCircleUp size={25}/>}
			isIconOnly
		/>
	);
	
	return (
		<div className="h-screen flex flex-col">
			<Navbar/>
			<main className="flex-1 flex justify-center items-center px-4 sm:px-0">
				<div className="flex flex-col gap-y-10 w-full">
					<div className="flex flex-col gap-y-4">
						<h1 className="text-5xl sm:text-7xl flex justify-center items-center text-center">
							<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
								<span>AlfieAI</span>
								<GrSchedules size={40}/>
								<span className="font-chalkboard text-purple-400">Courses</span>
							</span>
						</h1>

						<Input
							className="w-full max-w-xl mx-auto"
							radius="full"
							placeholder="Search for a course..."
							startContent={<IoIosSearch className="text-default-500" size={25}/>}
							endContent={<SearchButton/>}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}