//
// Filename: page.tsx
// Route: /contact
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";

import Navbar from "@/components/navbar";
import ContactForm from "@/components/contact-form";

export default function Contact(): JSX.Element {
	return (
		<div>
			<Navbar/>

			<div className="flex flex-col justify-center items-center py-10 gap-y-10">
				<h1 className="flex md:flex-row flex-col justify-center items-center text-5xl sm:text-7xl gap-x-3 sm:gap-x-6">
					<span className="text-lime-500 font-cursive font-bold">Contact</span>
					<span> the AlfieAI Team </span>
				</h1>

				<ContactForm/>
			</div>
		</div>
	);
}