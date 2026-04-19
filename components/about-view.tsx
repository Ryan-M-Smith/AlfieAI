"use client";

import {
	FiArrowUpRight,
	FiBookOpen,
	FiCalendar,
	FiCpu,
	FiMessageCircle,
	FiTarget,
	FiUser,
	FiUsers,
} from "react-icons/fi";
import Link from "next/link";
import { LuSparkles } from "react-icons/lu";
import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import {
	AnimatePresence,
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import { PiCertificate } from "react-icons/pi";
import { TbLeaf } from "react-icons/tb";

import Navbar from "@/components/navbar";
import thinkingVerbs from "@/lib/thinking-verbs";

interface Feature {
	title: string;
	description: string;
	icon: ReactNode;
	color: string;
	bullets: string[];
}

interface Pillar {
	title: string;
	description: string;
	metric: string;
}

interface RevealProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	id?: string;
}

function Reveal({ children, className, delay = 0, id }: RevealProps): JSX.Element {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return (
			<section className={className} id={id}>
				{children}
			</section>
		);
	}

	return (
		<motion.section
			className={className}
			id={id}
		initial={{ opacity: 0, y: 72, scale: 0.96 }}
		viewport={{ once: true, amount: 0.35 }}
		whileInView={{ opacity: 1, y: 0, scale: 1 }}
		transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
		>
			{children}
		</motion.section>
	);
}

const features: Feature[] = [
	{
		title: "Campus AI Chat",
		description:
			"Ask natural-language questions about academics, student life, and campus resources in one place.",
		icon: <FiMessageCircle size={22} />,
		color: "from-cyan-500/25 to-sky-500/15",
		bullets: [
			"Context-aware, Juniata-focused responses",
			"Fast answers across policy, people, and planning",
			"Built for students, faculty, and staff",
		],
	},
	{
		title: "Course Planning",
		description:
			"Compare classes, evaluate professor options, and map your semester with confidence.",
		icon: <FiCalendar size={22} />,
		color: "from-amber-500/30 to-orange-500/10",
		bullets: [
			"Catalog and scheduling support",
			"Requirement-aware planning tools",
			"Clear options before registration windows",
		],
	},
	{
		title: "People Discovery",
		description:
			"Surface peers and professionals quickly to help students build stronger campus networks.",
		icon: <FiUsers size={22} />,
		color: "from-emerald-500/30 to-lime-500/10",
		bullets: [
			"Explore people by role and interests",
			"Better collaboration opportunities",
			"Designed for meaningful outreach",
		],
	},
	{
		title: "Events + Live Support",
		description:
			"Stay in the loop with events and use live interactions for higher-touch assistance.",
		icon: <FiCpu size={22} />,
		color: "from-fuchsia-500/30 to-rose-500/10",
		bullets: [
			"Real-time support moments",
			"Event context from campus platforms",
			"A more connected student experience",
		],
	},
];

const pillars: Pillar[] = [
	{
		title: "Carbon Offset",
		description:
			"We retired 1 verified metric ton (1,000 kg) of CO\u2082 through Carbonmark, backed by the Aslancik Hydro Power Plant Project (2017 vintage). The retirement is a permanent, immutable public record.",
		metric: "1 metric ton CO\u2082 retired",
	},
	{
		title: "Water Restoration",
		description:
			"We purchased 1 BEF Water Restoration Certificate through Terrapass, restoring 1,000 gallons of freshwater to natural ecosystems — certified April 13, 2026.",
		metric: "1,000 gal water restored",
	},
	{
		title: "Ongoing Commitment",
		description:
			"Sustainability isn\u2019t a one-time gesture. We\u2019re committed to reviewing and renewing our environmental offsets as AlfieAI grows.",
		metric: "Annual renewal",
	},
];

const communityVerbs = [...thinkingVerbs];

function buildMarqueeRows(words: string[]): string[][] {
	const fallbackWords = ["community", "first", "student-led", "thinking", "campus", "voice"];
	const sourceWords = words.length > 0 ? words : fallbackWords;

	return Array.from({ length: 8 }, (_, rowIndex) => {
		const wordsInRow = 2 + (rowIndex % 3);
		const startIndex = (rowIndex * 2) % sourceWords.length;

		return Array.from({ length: wordsInRow }, (_, offset) => {
			const wordIndex = (startIndex + offset) % sourceWords.length;
			return sourceWords[wordIndex];
		});
	});
}

const marqueeRows = buildMarqueeRows(communityVerbs);

const communityWords = ["the Community", "Students", "Professors", "Faculty", "You"];

export default function AboutView(): JSX.Element {
	const shouldReduceMotion = useReducedMotion();
	const containerRef = useRef<HTMLDivElement>(null);
	const [communityWordIndex, setCommunityWordIndex] = useState(0);

	useEffect(() => {
		if (shouldReduceMotion) return;
		const id = setInterval(() => {
			setCommunityWordIndex((i) => (i + 1) % communityWords.length);
		}, 2200);
		return () => clearInterval(id);
	}, [shouldReduceMotion]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const onScroll = () => {
			if (el.scrollTop < 80 && window.location.hash) {
				history.replaceState(null, "", window.location.pathname);
			}
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);
	const { scrollYProgress } = useScroll({ container: containerRef });
	const progressScale = useSpring(scrollYProgress, {
		stiffness: 120,
		damping: 30,
		mass: 0.2,
	});
	const heroGlowY = useTransform(scrollYProgress, [0, 1], [0, 180]);
	const heroGlowRotate = useTransform(scrollYProgress, [0, 1], [0, 26]);

	return (
		<div ref={containerRef} className="relative h-screen overflow-x-clip overflow-y-scroll scroll-smooth snap-y snap-proximity bg-[radial-gradient(circle_at_20%_20%,rgba(14,116,144,0.16),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(244,114,182,0.12),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(34,197,94,0.12),transparent_34%)] text-zinc-900 dark:text-zinc-100">
			<motion.div
				className="fixed inset-x-0 top-0 z-60 h-1 origin-left bg-linear-to-r from-cyan-400 via-teal-400 to-lime-400"
				style={{ scaleX: progressScale }}
			/>

			<div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_95%)]" />

			<motion.div
				className="pointer-events-none absolute -left-40 top-16 -z-10 h-96 w-96 rounded-full bg-linear-to-r from-cyan-500/35 via-teal-500/20 to-lime-500/20 blur-3xl"
				style={shouldReduceMotion ? undefined : { y: heroGlowY, rotate: heroGlowRotate }}
			/>

			<Navbar/>

			<main>
				<div className="snap-start min-h-screen flex flex-col justify-center">
				<Reveal className="mx-auto max-w-6xl px-6 pb-28 pt-20 sm:px-10 lg:px-14">
					<div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
						<div className="space-y-8">
							<motion.p
								className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700 shadow-lg shadow-teal-500/10 backdrop-blur-xl dark:bg-zinc-900/60 dark:text-teal-300"
								initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
								animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.15 }}
							>
								<FiBookOpen size={14} />
								Built for Juniata College
							</motion.p>

							<h1 className="font-semibold text-6xl leading-[0.94] sm:text-6xl lg:text-7xl">
								AlfieAI helps students
								move faster,
								choose smarter,
								and feel more connected
								on campus.
							</h1>

							<p className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-lg">
								From courses and professors to events and people, AlfieAI combines critical campus workflows into a single AI experience that feels quick, personal, and useful.
							</p>

							<div className="flex flex-wrap gap-2">
								<Link
									className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300/70 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
									href="/"
								>
									Try AlfieAI
									<FiArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-px" size={14}/>
								</Link>

								<Link
									className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300/70 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
									href="#features"
								>
									Features
									<LuSparkles className="transition group-hover:translate-x-0.5 group-hover:-translate-y-px" size={13}/>
								</Link>

								<Link
									className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300/70 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
									href="#sustainability"
								>
									Sustainability
									<TbLeaf className="transition group-hover:translate-x-0.5 group-hover:-translate-y-px" size={14}/>
								</Link>
							</div>
						</div>

						<motion.div
							className="relative rounded-[2rem] border border-zinc-200/70 bg-white/70 p-6 shadow-2xl shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-900/60"
							initial={shouldReduceMotion ? false : { opacity: 0, y: 40, rotateX: 7 }}
							animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
							transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
						>
							<div className="mb-4 flex items-center justify-between">
								<p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Live momentum</p>
								<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-pulse">
									Growing
								</span>
							</div>

							<div className="space-y-4">
								<div className="rounded-2xl bg-linear-to-r from-cyan-500/20 to-teal-500/20 p-4">
									<p className="text-sm text-zinc-600 dark:text-zinc-300">Platform capability</p>
									<p className="mt-1 text-2xl font-bold">All-in-one academic + campus assistant</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="rounded-xl border border-zinc-200/70 bg-white/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/70">
										<p className="text-xs uppercase tracking-wide text-zinc-500">Coverage</p>
										<p className="mt-1 font-semibold">Courses · People · Events</p>
									</div>
									<div className="rounded-xl border border-zinc-200/70 bg-white/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/70">
										<p className="text-xs uppercase tracking-wide text-zinc-500">Experience</p>
										<p className="mt-1 font-semibold">Chat · Search · Live</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</Reveal>
				</div>

				<div className="snap-start min-h-screen flex flex-col justify-center">
				<Reveal className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-14" id="features">
					<div className="mb-10 flex flex-col gap-4">
						<div>
							<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
								<FiCpu size={14} />
								Big Features
							</p>
							<h2 className="text-balance text-3xl font-semibold sm:text-4xl">What makes AlfieAI stand out</h2>
						</div>

						<p className="text-sm text-zinc-600 dark:text-zinc-300 sm:text-base">
							A purpose-built stack that combines guidance, discovery, and planning into one smooth interface.
						</p>
					</div>

					<div className="grid gap-5 md:grid-cols-2">
						{features.map((feature, index) => (
							<motion.article
								key={feature.title}
								className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/75 p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/65"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
								viewport={{ once: true, amount: 0.25 }}
								whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
								whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.01 }}
								transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
							>
								<div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${feature.color} opacity-80 transition-opacity duration-300 group-hover:opacity-100`} />
								<div className="relative">
									<span className="inline-flex justify-start items-center gap-2">
										<div className="inline-flex rounded-xl border border-zinc-300/60 bg-white/80 p-2.5 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-950/65 dark:text-zinc-200">
											{feature.icon}
										</div>
										<h3 className="text-xl font-semibold">{feature.title}</h3>
									</span>
									
									<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
										{feature.description}
									</p>

									<ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
										{feature.bullets.map((bullet) => (
											<li className="flex items-start gap-2" key={bullet}>
												<span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
												<span>{bullet}</span>
											</li>
										))}
									</ul>
								</div>
							</motion.article>
						))}
					</div>
				</Reveal>
				</div>

				<div className="snap-start min-h-screen flex flex-col justify-center">
				<Reveal className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-14" id="community" delay={0.06}>
					<div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
						<div className="rounded-3xl border border-zinc-200/70 bg-white/75 p-6 backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/60 sm:p-8">
							<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
								<FiUsers size={14} />
								Community First
							</p>

							<h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
								AlfieAI Thinks Through	
								<AnimatePresence mode="wait">
									<motion.span
										key={communityWords[communityWordIndex]}
										className="inline-block"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -12 }}
										transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
									>
										{communityWords[communityWordIndex]}
									</motion.span>
								</AnimatePresence>
							</h2>

							<p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
								AlfieAI is community first by design. Juniata students actively help shape how the product sounds, responds, and reasons so the experience reflects real campus voice and culture.
							</p>

							<p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
								Juniata students and professors actively contribute the loading phrases that appear while AlfieAI is thinking — a small but meaningful touch of real campus voice baked right into the product.
							</p>
						</div>

						<div className="relative min-h-120 overflow-hidden rounded-3xl border border-zinc-200/70 bg-zinc-950/90 p-5 shadow-xl shadow-zinc-900/40 dark:border-zinc-700 dark:bg-zinc-950/95 sm:p-6">
							<div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-zinc-950 to-transparent" />
							<div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-zinc-950 to-transparent" />
							<div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-zinc-950 to-transparent" />
							<div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-zinc-950 to-transparent" />

							<div className="space-y-4 pt-2">
								{marqueeRows.map((row, rowIndex) => {
									const direction = rowIndex % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"];
									const duration = 34 + (rowIndex % 5) * 4;

									return (
										<div className="overflow-hidden" key={`row-${rowIndex}`}>
											<motion.div
												animate={shouldReduceMotion ? undefined : { x: direction }}
												className="flex w-max gap-3"
												transition={
													shouldReduceMotion
														? undefined
														: { duration, repeat: Infinity, ease: "linear" }
												}
											>
												{[...row, ...row, ...row, ...row].map((word, wordIndex) => (
													<span
														className="alfie-rainbow-word shrink-0 rounded-full border border-white/20 px-4 py-2 text-base font-semibold uppercase tracking-[0.2em] sm:text-lg"
														key={`${word}-${rowIndex}-${wordIndex}`}
													>
														{word}
													</span>
												))}
											</motion.div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</Reveal>
				</div>

				<div className="snap-start min-h-screen flex flex-col justify-center">
				<Reveal className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-14" id="sustainability" delay={0.08}>
				<div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
						<div className="rounded-3xl border border-zinc-200/70 bg-white/75 p-6 backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/60">
							<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-lime-700 dark:text-lime-300">
								<FiTarget size={14} />
								Sustainability
							</p>
							<h2 className="text-3xl font-semibold leading-tight">Building responsibly as we scale</h2>
							<p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
						AlfieAI is committed to operating with a minimal environmental footprint. From our earliest days of development, we've offset the real-world impact of our infrastructure and AI compute through verified, third-party programs.
					</p>
					<p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
						In April 2026 we retired 1 verified metric ton (1,000 kg) of CO₂ via Carbonmark and restored 1,000 gallons of freshwater through a Terrapass BEF Water Restoration Certificate. Both actions are independently verified and publicly traceable.
					</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Link
							href="/sustainability/water-retirement-voucher.pdf"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/10 px-4 py-2 text-xs font-semibold text-lime-700 transition hover:bg-lime-500/20 dark:text-lime-300"
						>
							Terrapass Water Certificate
							<PiCertificate size={13} />
						</Link>

						<Link
							href="/sustainability/co2-retirement-voucher.pdf"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-300"
						>
							Carbonmark Retirement Record
							<PiCertificate size={13} />
						</Link>
					</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
							{pillars.map((pillar, index) => (
								<motion.div
									key={pillar.title}
									className="rounded-2xl border border-zinc-200/70 bg-white/75 p-5 backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/60"
									initial={shouldReduceMotion ? false : { opacity: 0, x: 32 }}
									viewport={{ once: true, amount: 0.35 }}
									whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
									transition={{ duration: 0.55, delay: index * 0.08 }}
								>
									<p className="text-xs uppercase tracking-wide text-zinc-500">{pillar.metric}</p>
									<h3 className="mt-1 text-lg font-semibold">{pillar.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
										{pillar.description}
									</p>
								</motion.div>
							))}
						</div>
				</div>
				</Reveal>
				</div>

				<div className="snap-start min-h-screen flex flex-col justify-center">
				<Reveal className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:px-14" id="founder-note" delay={0.12}>
					<div className="rounded-[2rem] border border-zinc-200/70 bg-linear-to-br from-zinc-900 to-zinc-800 p-8 text-zinc-100 shadow-2xl shadow-zinc-900/25 sm:p-10">
						<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200">
							<FiUser size={14} />
							Founder&apos;s Note
						</p>

						<blockquote className="text-pretty text-xl leading-relaxed text-zinc-100 sm:text-2xl">
							“AlfieAI was built to make campus life less confusing and more empowering. Every feature starts with one question: does this genuinely help students move forward?”
						</blockquote>

						<p className="mt-5 text-sm text-zinc-300 sm:text-base">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
						</p>
					</div>

					<div className="mt-8 flex justify-center">
						<Link
							className="group inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/85 px-6 py-3 text-sm font-semibold text-zinc-800 shadow-lg shadow-zinc-900/10 backdrop-blur-lg transition hover:-translate-y-0.5 hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:border-zinc-400"
							href="/about/founders-note"
						>
							Read the full founder&apos;s note
							<FiArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-px" size={16} />
						</Link>
					</div>
				</Reveal>
				</div>
			</main>
		</div>
	);
}
