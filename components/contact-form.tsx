//
// Filename: contact-form.tsx
// Description: Contact form for users to reach out to the AlfieAI team
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

"use client";

import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { JSX } from "react";
import { useRouter } from "next/navigation";

export default function ContactForm(): JSX.Element {
	const router = useRouter();
	
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Extract form data and prepare the request body
		const formData = new FormData(event.currentTarget);
		const entries = Object.fromEntries(formData.entries());
		const body = {
			name: `${entries.firstName} ${entries.lastName}`,
			email: entries.email,
			subject: entries.subject,
			message: entries.message,
		};
		
		// Send the request to the email API endpoint
		const response = await fetch("/api/email", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const { error } = await response.json();
			console.error("Error sending email:", error);
			alert("There was an error sending your message. Please try again later.");
			return;
		}
		else {
			router.push("/contact/success");
		}
	}

	return (
		<Form className="w-4/5 sm:w-1/2 mt-10" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-y-4 w-full">
				<div className="flex sm:flex-row flex-col justify-center gap-4">
					<Input
						label="First Name"
						name="firstName"
						variant="bordered"
						placeholder="Enter your first name"
						required
					/>

					<Input
						label="Last Name"
						name="lastName"
						variant="bordered"
						placeholder="Enter your last name"
						required
					/>
				</div>

				<Input
					label="Your Email"
					name="email"
					variant="bordered"
					type="email"
					placeholder="Enter your email address"
					required
				/>

				<Input
					label="Subject"
					name="subject"
					variant="bordered"
					placeholder="What's the subject of your message?"
					required
				/>

				<Textarea
					label="Message"
					name="message"
					variant="bordered"
					placeholder="Type your message here..."
					minRows={5}
					required
				/>

				<Button type="submit" className="bg-lime-500 hover:bg-lime-500 text-black">
					Send Message
				</Button>
			</div>
		</Form>
	)
}