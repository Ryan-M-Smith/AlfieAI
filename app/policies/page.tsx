//
// Filename: page.tsx
// Route: /policies/disclaimers
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Button } from "@heroui/button";
import { JSX } from "react";
import Link from "next/link";
import { PiGavelFill } from "react-icons/pi";
import smartquotes from "smartquotes-ts";

import Navbar from "@/components/navbar";

export const metadata = {
	title: "Policies",
	description: "AlfieAI's legal policies for users",
}

export default function Policies(): JSX.Element {
	return (
		<div>
			<Navbar/>

			<div className="flex flex-col justify-center items-center py-10 gap-y-10">
				<h1 className="text-5xl sm:text-7xl flex justify-center items-center text-center">
					<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
						<span>AlfieAI</span>
						<PiGavelFill className="sm:size-1 lg:size-10"/>
						<span className="text-orange-500 font-light font-mono">Legal</span>
					</span>
				</h1>

				<div className="flex flex-col w-1/3 gap-y-8">
					<p className="text-justify"> {`
						${smartquotes(`AlfieAI's policies cover important legal aspects such as terms of service, privacy policy, cookie policy,
						and disclaimers. These documents ensure transparency and compliance with legal standards, protecting both
						the users and the platform.`)}
					`} </p>

					<p className="text-justify">
						By accessing or using this website, you acknowledge and agree that you are bound by all applicable terms,
						conditions, and policies set forth herein. Your continued use of the site constitutes implicit consent
						to these legal documents. We strongly advise all users to carefully review the Terms of Service, Privacy
						Policy, Cookie Policy, and Disclaimers in their entirety prior to engaging with any services or features
						provided.
					</p>
				</div>

				<div className="mt-5">
					{/* <ButtonGroup className="bg-default-200 rounded-full" radius="full"> */}
					<div className="bg-default-200 rounded-full">
						<Link href="/policies/privacy">
							<Button className="hover:bg-orange-500" radius="full">
								Privacy Policy
							</Button>
						</Link>

						<Link href="/policies/terms">
							<Button className="hover:bg-orange-500" radius="full">
								Terms of Service
							</Button>
						</Link>

						<Link href="/policies/cookies">
							<Button className="hover:bg-orange-500" radius="full">
								Cookie Policy
							</Button>
						</Link>
						
						<Link href="/policies/disclaimers">
							<Button className="hover:bg-orange-500" radius="full">
								Disclaimers
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}