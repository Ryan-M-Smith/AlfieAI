//
// Filename: course-view.tsx
// Description: A display widget for course data and associated sections
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { JSX } from "react";

import { Course } from "@/lib/models/course";

interface CourseViewProps {
	className?: string;
	course: 	Course;
}

export default function CourseView({ className, course }: CourseViewProps): JSX.Element {
	return (
		<div className="flex flex-col w-full rounded-lg max-w-3xl mx-auto">
			<div className="flex justify-between items-center text-lg font-semibold">
				<h1>{course.section_name.slice(0, -3)}</h1>
				<h1>{course.title}</h1>
			</div>

			<hr className="border-1 h-px border-default-400"/>

			<div>
				<p className="text-gray-600 mt-2">{course.description}</p>
			</div>
		</div>
	);
}