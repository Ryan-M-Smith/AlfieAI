//
// Filename: data-grid-lines.tsx
// Description: Full-site animated data grid background overlay
// Copyright (c) 2025 Ryan Smith <rysmith2113@gmail.com>
//

"use client";

import { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

const W = 100;
const H = 56;

const LH = 20; // horizontal streak length (viewBox units)
const LV = 11; // vertical streak length (viewBox units)

const H_LINES = [H * 0.15, H * 0.30, H * 0.50, H * 0.68, H * 0.85];
const V_LINES = [W * 0.12, W * 0.28, W * 0.44, W * 0.58, W * 0.72, W * 0.88];

// dir: 1 = right/down, -1 = left/up
const H_STREAKS = [
	{ y: H * 0.15, color: "#84cc16", delay: 0,   dur: 5.5, dir:  1 },
	{ y: H * 0.15, color: "#84cc16", delay: 2.8, dur: 5.5, dir:  1 },
	{ y: H * 0.30, color: "#a855f7", delay: 1.2, dur: 4.8, dir: -1 },
	{ y: H * 0.30, color: "#a855f7", delay: 3.6, dur: 4.8, dir: -1 },
	{ y: H * 0.50, color: "#06b6d4", delay: 0.5, dur: 6.0, dir:  1 },
	{ y: H * 0.50, color: "#0ea5e9", delay: 3.0, dur: 6.0, dir: -1 },
	{ y: H * 0.68, color: "#10b981", delay: 2.0, dur: 5.2, dir:  1 },
	{ y: H * 0.68, color: "#f59e0b", delay: 4.4, dur: 5.2, dir: -1 },
	{ y: H * 0.85, color: "#f43f5e", delay: 1.5, dur: 4.4, dir: -1 },
	{ y: H * 0.85, color: "#06b6d4", delay: 3.7, dur: 4.4, dir:  1 },
];

const V_STREAKS = [
	{ x: W * 0.12, color: "#a855f7", delay: 0.6, dur: 4.2, dir:  1 },
	{ x: W * 0.12, color: "#a855f7", delay: 3.0, dur: 4.2, dir:  1 },
	{ x: W * 0.28, color: "#10b981", delay: 1.8, dur: 5.0, dir: -1 },
	{ x: W * 0.28, color: "#84cc16", delay: 4.3, dur: 5.0, dir:  1 },
	{ x: W * 0.44, color: "#f59e0b", delay: 0.3, dur: 4.5, dir:  1 },
	{ x: W * 0.44, color: "#f59e0b", delay: 2.8, dur: 4.5, dir: -1 },
	{ x: W * 0.58, color: "#06b6d4", delay: 1.4, dur: 3.8, dir:  1 },
	{ x: W * 0.58, color: "#0ea5e9", delay: 3.5, dur: 3.8, dir: -1 },
	{ x: W * 0.72, color: "#f43f5e", delay: 2.5, dur: 4.8, dir: -1 },
	{ x: W * 0.72, color: "#84cc16", delay: 5.2, dur: 4.8, dir:  1 },
	{ x: W * 0.88, color: "#0ea5e9", delay: 0.9, dur: 5.5, dir: -1 },
	{ x: W * 0.88, color: "#a855f7", delay: 3.7, dur: 5.5, dir:  1 },
];

export default function DataGridLines(): JSX.Element {
	const shouldReduceMotion = useReducedMotion();
	if (shouldReduceMotion) return <></>;

	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none fixed inset-0 z-0 h-full w-full"
			preserveAspectRatio="none"
			viewBox={`0 0 ${W} ${H}`}
		>
			<defs>
				<filter id="dgl-glow" x="-80%" y="-80%" width="260%" height="260%">
					<feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="0.7" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* Static grid lines */}
			{H_LINES.map((y) => (
				<line
					key={`hl-${y}`}
					x1={0} y1={y} x2={W} y2={y}
					stroke="currentColor"
					strokeOpacity={0.07}
					strokeWidth={0.18}
					vectorEffect="non-scaling-stroke"
					className="text-zinc-500"
				/>
			))}
			{V_LINES.map((x) => (
				<line
					key={`vl-${x}`}
					x1={x} y1={0} x2={x} y2={H}
					stroke="currentColor"
					strokeOpacity={0.07}
					strokeWidth={0.18}
					vectorEffect="non-scaling-stroke"
					className="text-zinc-500"
				/>
			))}

			{/* Horizontal streaks */}
			{H_STREAKS.map((s, i) => {
				const fromX1 = s.dir > 0 ? -LH : W;
				const fromX2 = s.dir > 0 ? 0   : W + LH;
				const toX1   = s.dir > 0 ? W   : -LH;
				const toX2   = s.dir > 0 ? W + LH : 0;
				return (
					<motion.line
						key={`hs-${i}`}
						x1={fromX1} y1={s.y} x2={fromX2} y2={s.y}
						animate={{ x1: toX1, x2: toX2 }}
						transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "linear", repeatDelay: 0 }}
						stroke={s.color}
						strokeWidth={1.8}
						strokeLinecap="round"
						vectorEffect="non-scaling-stroke"
						filter="url(#dgl-glow)"
						opacity={0.75}
					/>
				);
			})}

			{/* Vertical streaks */}
			{V_STREAKS.map((s, i) => {
				const fromY1 = s.dir > 0 ? -LV : H;
				const fromY2 = s.dir > 0 ? 0   : H + LV;
				const toY1   = s.dir > 0 ? H   : -LV;
				const toY2   = s.dir > 0 ? H + LV : 0;
				return (
					<motion.line
						key={`vs-${i}`}
						x1={s.x} y1={fromY1} x2={s.x} y2={fromY2}
						animate={{ y1: toY1, y2: toY2 }}
						transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "linear", repeatDelay: 0 }}
						stroke={s.color}
						strokeWidth={1.8}
						strokeLinecap="round"
						vectorEffect="non-scaling-stroke"
						filter="url(#dgl-glow)"
						opacity={0.75}
					/>
				);
			})}
		</svg>
	);
}
