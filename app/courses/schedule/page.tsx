import { JSX } from "react";
import { GrSchedules } from "react-icons/gr";

import ScheduleBuilder from "@/components/schedule-builder";

export const metadata = {
	title: "Schedule Builder",
	description: "Build and refine your semester schedule with AlfieAI Courses.",
};

export default function SchedulePage(): JSX.Element {
	return (
		<div>
			<div className="mb-6 px-4 sm:px-0">
				<h1 className="text-4xl sm:text-6xl flex justify-center items-center text-center">
					<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
						<span>AlfieAI</span>
						<GrSchedules size={36}/>
						<span className="font-chalkboard text-purple-400">Schedule Builder</span>
					</span>
				</h1>
			</div>

			<ScheduleBuilder />
		</div>
	);
}
