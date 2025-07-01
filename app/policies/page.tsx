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

			<div className="flex flex-col my-auto justify-center items-center py-10 gap-y-10">
				<h1 className="text-5xl sm:text-7xl flex justify-center items-center text-center">
					<span className="flex flex-row justify-center items-center gap-2 sm:gap-3">
						<span>AlfieAI</span>
						<PiGavelFill size={40}/>
						<span className="text-orange-500 font-light font-mono">Legal</span>
					</span>
				</h1>

				<div className="flex flex-col text-left text-pretty gap-y-8 lg:w-1/3 md:w-1/2 w-4/5">
					<p> {`
						${smartquotes(`AlfieAI's policies cover important legal aspects such as terms of service, privacy policy, cookie policy,
						and disclaimers. These documents ensure transparency and compliance with legal standards, protecting both
						the users and the platform.`)}
					`} </p>

					<p>
						By accessing or using this website, you acknowledge and agree that you are bound by all applicable terms,
						conditions, and policies set forth herein. Your continued use of the site constitutes implicit consent
						to these legal documents. We strongly advise all users to carefully review the Terms of Service, Privacy
						Policy, Cookie Policy, and Disclaimers in their entirety prior to engaging with any services or features
						provided.
					</p>
				</div>

				<div className="sm:flex sm:justify-center mt-5 w-4/5 sm:max-w-lg">
					<div className="sm:bg-default bg-none rounded-full flex flex-col sm:flex-row gap-2 sm:gap-4">
						<Link href="/policies/privacy" className="flex-1">
							<Button className="w-full hover:bg-orange-500" radius="full">
								Privacy Policy
							</Button>
						</Link>

						<Link href="/policies/terms" className="flex-1">
							<Button className="w-full hover:bg-orange-500" radius="full">
								Terms of Service
							</Button>
						</Link>

						<Link href="/policies/cookies" className="flex-1">
							<Button className="w-full hover:bg-orange-500" radius="full">
								Cookie Policy
							</Button>
						</Link>
						
						<Link href="/policies/disclaimers" className="flex-1">
							<Button className="w-full hover:bg-orange-500" radius="full">
								Disclaimers
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}