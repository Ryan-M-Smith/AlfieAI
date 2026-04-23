import { JSX } from "react";
import { LuGraduationCap } from "react-icons/lu";

import ProfessorsView from "@/components/professors-view";

export const metadata = {
	title: "AlfieAI Professors",
	description: "Explore professor context and AI insights from current course catalog data.",
};

export default function ProfessorsPage(): JSX.Element {
	return (
		<div>
			<div className="mb-6 px-4 sm:px-0">
				<h1 className="text-4xl sm:text-6xl flex justify-center items-center text-center">
					<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
						<span>AlfieAI</span>
						<LuGraduationCap size={36}/>
						<span className="font-chalkboard text-purple-400">Professors</span>
					</span>
				</h1>
			</div>

			<ProfessorsView/>
		</div>
	);
}
