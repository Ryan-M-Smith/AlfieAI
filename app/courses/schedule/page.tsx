import { JSX } from "react";
import { GrSchedules } from "react-icons/gr";

import ScheduleBuilder from "@/components/schedule-builder";

export const metadata = {
	title: "Schedule Builder",
	description: "Build and refine your semester schedule with AlfieAI Courses.",
};

export default function SchedulePage(): JSX.Element {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
			<div className="mb-6 sm:mb-8 pt-1">
				<h1 className="text-center">
					<span className="inline-flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-3 gap-y-1 text-3xl sm:text-6xl leading-tight">
						<span>AlfieAI</span>
						<GrSchedules className="shrink-0 text-[22px] sm:text-[34px]" />
						<span className="font-chalkboard text-purple-400">Schedule Builder</span>
					</span>
				</h1>
			</div>

			<ScheduleBuilder />
		</div>
	);
}
