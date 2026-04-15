"use client";

import { JSX, useEffect, useState } from "react";

import thinkingVerbs from "@/lib/thinking-verbs";

interface ThinkingStatusProps {
	className?: string;
	labelPrefix?: string;
}

const phraseIntervalMs = 2200;
const phraseRevealDurationMs = 560;
const dotsStartDelayMs = phraseRevealDurationMs + 80;
const dotsStepMs = 240;

function nextRandomVerbIndex(previousIndex: number): number {
	if (thinkingVerbs.length <= 1) {
		return previousIndex;
	}

	let nextIndex = previousIndex;
	while (nextIndex === previousIndex) {
		nextIndex = Math.floor(Math.random() * thinkingVerbs.length);
	}

	return nextIndex;
}

export default function ThinkingStatus({ className, labelPrefix = "AlfieAI is" }: ThinkingStatusProps): JSX.Element {
	const [verbIndex, setVerbIndex] = useState(() => Math.floor(Math.random() * thinkingVerbs.length));
	const [phraseKey, setPhraseKey] = useState(0);
	const [dotCount, setDotCount] = useState(0);
	const phrase = `${labelPrefix} ${thinkingVerbs[verbIndex]}`;
	const dots = `${".".repeat(dotCount)}${" ".repeat(3 - dotCount)}`;

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setVerbIndex((previous) => nextRandomVerbIndex(previous));
			setPhraseKey((previous) => previous + 1);
			setDotCount(0);
		}, phraseIntervalMs);

		return () => {
			window.clearInterval(intervalId);
		};
	}, []);

	useEffect(() => {
		let dotsIntervalId: number | undefined;
		const startTimeoutId = window.setTimeout(() => {
			dotsIntervalId = window.setInterval(() => {
				setDotCount((previous) => (previous >= 3 ? 0 : previous + 1));
			}, dotsStepMs);
		}, dotsStartDelayMs);

		return () => {
			window.clearTimeout(startTimeoutId);
			if (dotsIntervalId) {
				window.clearInterval(dotsIntervalId);
			}
		};
	}, [phraseKey]);

	return (
		<div className={className ? `alfie-thinking ${className}` : "alfie-thinking"} role="status" aria-live="polite" aria-label={phrase}>
			<span key={phraseKey} className="alfie-thinking-phrase">
				<span>{phrase}</span>
				<span aria-hidden className="alfie-thinking-dots">{dots}</span>
			</span>
		</div>
	);
}