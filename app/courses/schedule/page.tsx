import { JSX } from "react";

import ScheduleBuilder from "@/components/schedule-builder";

export const metadata = {
	title: "Schedule Builder",
	description: "Build and refine your semester schedule with AlfieAI Courses.",
};

export default function SchedulePage(): JSX.Element {
	return (
		<div className="w-full px-4 sm:px-6">
			<ScheduleBuilder/>
		</div>
	);
}
