"use client";

import { Button } from "@heroui/react";
import type { JSX } from "react";
import { FiArrowLeft } from "react-icons/fi";

import ThinkingStatus from "@/components/thinking-status";

interface LoadingCalendarShellProps {
	onBack: () => void;
}

export default function LoadingCalendarShell({ onBack }: LoadingCalendarShellProps): JSX.Element {
	return (
		<div className="rounded-3xl border border-default-200 bg-content1/85 p-5 shadow-sm dark:border-default-600 dark:bg-zinc-900/80 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<Button startContent={<FiArrowLeft size={16} />} variant="light" onPress={onBack}>Back to planner</Button>
				<p className="text-sm text-default-500 dark:text-default-400">Building your schedule</p>
			</div>
			<div className="mt-6 rounded-3xl border border-default-200/70 bg-default-50/65 px-6 py-12 text-center dark:border-default-700 dark:bg-zinc-950/65 sm:px-10 sm:py-16">
				<div className="flex flex-col items-center">
					<div className="alfie-thinking-spinner" aria-hidden />
					<p className="mt-5 text-sm font-semibold uppercase tracking-[0.32em] text-default-500">Generating your perfect schedule </p>
					<ThinkingStatus className="mt-4 justify-center gap-0 text-3xl sm:text-4xl md:text-[2.85rem]" />
					<p className="mt-4 max-w-xl text-base leading-relaxed text-default-500 sm:text-lg">
						Syncing your term offerings, transcript evidence, and POE preferences into one schedule that actually works.
					</p>
					<div className="mt-7 flex flex-wrap justify-center gap-3">
						<div className="rounded-full border border-default-200/80 bg-content1/85 px-4 py-2 text-sm font-medium text-default-500 shadow-sm dark:border-default-700 dark:bg-zinc-900/75">Checking section availability</div>
						<div className="rounded-full border border-default-200/80 bg-content1/85 px-4 py-2 text-sm font-medium text-default-500 shadow-sm dark:border-default-700 dark:bg-zinc-900/75">Balancing requirement fit</div>
						<div className="rounded-full border border-default-200/80 bg-content1/85 px-4 py-2 text-sm font-medium text-default-500 shadow-sm dark:border-default-700 dark:bg-zinc-900/75">Resolving time conflicts</div>
					</div>
				</div>
			</div>
		</div>
	);
}